interface PricePoint {
  timestamp: string;
  price: number;
  stoch9: number;
  stoch14: number;
  stoch40: number;
  stoch60: number;
}

interface Trade {
  entryTime: string;
  exitTime: string;
  entryPrice: number;
  exitPrice: number;
  type: 'long' | 'short';
  pnl: number;
  pnlPercent: number;
}

interface DivergenceSignal {
  time: string;
  type: string;
}

interface ConfirmedSignal {
  time: string;
  confirmations: number;
}

export const calculateStochastics = (data: any[]) => {
  return data.map(candle => ({
    timestamp: candle.timestamp,
    price: candle.close,
    stoch9: calculateStochastic(candle, 9),
    stoch14: calculateStochastic(candle, 14),
    stoch40: calculateStochastic(candle, 40),
    stoch60: calculateStochastic(candle, 60)
  }));
};

const calculateStochastic = (candle: any, period: number) => {
  // Simplified stochastic calculation for demo
  return ((candle.close - candle.low) / (candle.high - candle.low)) * 100;
};

export const findDivergence = (rawData: any[], lookbackPeriod: number = 10) => {
  const data = calculateStochastics(rawData);
  
  const divergences = {
    bullish: [] as DivergenceSignal[],
    bearish: [] as DivergenceSignal[]
  };

  for (let i = lookbackPeriod; i < data.length; i++) {
    const currentPrice = data[i].price;
    const previousPrice = data[i - lookbackPeriod].price;
    
    ['stoch9', 'stoch14', 'stoch40', 'stoch60'].forEach(indicator => {
      const currentStoch = data[i][indicator as keyof PricePoint];
      const previousStoch = data[i - lookbackPeriod][indicator as keyof PricePoint];

      if (currentPrice < previousPrice && currentStoch > previousStoch) {
        divergences.bullish.push({
          time: data[i].timestamp,
          type: `Bullish (${indicator})`
        });
      }
      
      if (currentPrice > previousPrice && currentStoch < previousStoch) {
        divergences.bearish.push({
          time: data[i].timestamp,
          type: `Bearish (${indicator})`
        });
      }
    });
  }

  return divergences;
};

export const checkMultipleStochConfirmation = (
  divergences: ReturnType<typeof findDivergence>,
  minConfirmations: number = 2
) => {
  const confirmedSignals = {
    bullish: [] as ConfirmedSignal[],
    bearish: [] as ConfirmedSignal[]
  };

  const groupedBullish = new Map<string, number>();
  const groupedBearish = new Map<string, number>();

  divergences.bullish.forEach(({ time }) => {
    groupedBullish.set(time, (groupedBullish.get(time) || 0) + 1);
  });

  divergences.bearish.forEach(({ time }) => {
    groupedBearish.set(time, (groupedBearish.get(time) || 0) + 1);
  });

  groupedBullish.forEach((confirmations, time) => {
    if (confirmations >= minConfirmations) {
      confirmedSignals.bullish.push({ time, confirmations });
    }
  });

  groupedBearish.forEach((confirmations, time) => {
    if (confirmations >= minConfirmations) {
      confirmedSignals.bearish.push({ time, confirmations });
    }
  });

  return confirmedSignals;
};

export const calculatePerformanceMetrics = (trades: Trade[]) => {
  if (trades.length === 0) return null;

  const winningTrades = trades.filter(t => t.pnl > 0);
  const losingTrades = trades.filter(t => t.pnl < 0);
  
  const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0);
  const grossProfit = winningTrades.reduce((sum, t) => sum + t.pnl, 0);
  const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0));
  
  const maxDrawdown = calculateMaxDrawdown(trades);
  const sharpeRatio = calculateSharpeRatio(trades);
  
  return {
    totalTrades: trades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    winRate: (winningTrades.length / trades.length) * 100,
    profitFactor: grossLoss === 0 ? Infinity : grossProfit / grossLoss,
    totalReturn: totalPnL,
    maxDrawdown,
    sharpeRatio,
    averageWin: winningTrades.length > 0 ? grossProfit / winningTrades.length : 0,
    averageLoss: losingTrades.length > 0 ? grossLoss / losingTrades.length : 0,
    expectancy: calculateExpectancy(winningTrades, losingTrades),
  };
};

const calculateMaxDrawdown = (trades: Trade[]) => {
  let peak = 0;
  let maxDrawdown = 0;
  let runningPnL = 0;

  trades.forEach(trade => {
    runningPnL += trade.pnl;
    if (runningPnL > peak) {
      peak = runningPnL;
    }
    const drawdown = ((peak - runningPnL) / peak) * 100;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  });

  return maxDrawdown;
};

const calculateSharpeRatio = (trades: Trade[], riskFreeRate: number = 0.02) => {
  const returns = trades.map(t => t.pnlPercent);
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const stdDev = Math.sqrt(
    returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
  );
  
  return stdDev === 0 ? 0 : (avgReturn - riskFreeRate) / stdDev;
};

const calculateExpectancy = (winningTrades: Trade[], losingTrades: Trade[]) => {
  const winRate = winningTrades.length / (winningTrades.length + losingTrades.length);
  const avgWin = winningTrades.reduce((sum, t) => sum + t.pnlPercent, 0) / winningTrades.length;
  const avgLoss = losingTrades.reduce((sum, t) => sum + t.pnlPercent, 0) / losingTrades.length;
  
  return (winRate * avgWin) + ((1 - winRate) * avgLoss);
};