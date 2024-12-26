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
  price: number;
}

interface ConfirmedSignal {
  time: string;
  confirmations: number;
  price: number;
}

const calculateStochastic = (data: any[], index: number, period: number): number => {
  if (index < period - 1) return 50; // Default value for initial periods
  
  const currentClose = data[index].close;
  let highestHigh = data[index].high;
  let lowestLow = data[index].low;
  
  // Find highest high and lowest low over the period
  for (let i = 0; i < period; i++) {
    const currentPrice = data[index - i];
    highestHigh = Math.max(highestHigh, currentPrice.high);
    lowestLow = Math.min(lowestLow, currentPrice.low);
  }
  
  // Avoid division by zero
  if (highestHigh === lowestLow) return 50;
  
  // Calculate %K (basic stochastic)
  return ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
};

export const findDivergence = (rawData: any[], lookbackPeriod: number = 10) => {
  console.log("Processing data for divergences:", rawData.length, "points");
  
  const divergences = {
    bullish: [] as DivergenceSignal[],
    bearish: [] as DivergenceSignal[]
  };

  // Need at least lookbackPeriod + period for calculation
  if (rawData.length < lookbackPeriod + 14) {
    console.log("Not enough data points for divergence calculation");
    return divergences;
  }

  // Calculate stochastics for each point
  const data = rawData.map((candle, index) => ({
    timestamp: candle.timestamp,
    price: candle.close,
    stoch14: calculateStochastic(rawData, index, 14),
    stoch40: calculateStochastic(rawData, index, 40)
  }));

  console.log("Calculated stochastics for all points");

  // Look for divergences
  for (let i = lookbackPeriod; i < data.length; i++) {
    const currentPrice = data[i].price;
    const previousPrice = data[i - lookbackPeriod].price;
    
    const currentStoch = data[i].stoch14;
    const previousStoch = data[i - lookbackPeriod].stoch14;

    // Bullish divergence: price makes lower low but oscillator makes higher low
    if (currentPrice < previousPrice && currentStoch > previousStoch && currentStoch < 20) {
      console.log("Found bullish divergence at", data[i].timestamp);
      divergences.bullish.push({
        time: data[i].timestamp,
        type: "Bullish",
        price: currentPrice
      });
    }
    
    // Bearish divergence: price makes higher high but oscillator makes lower high
    if (currentPrice > previousPrice && currentStoch < previousStoch && currentStoch > 80) {
      console.log("Found bearish divergence at", data[i].timestamp);
      divergences.bearish.push({
        time: data[i].timestamp,
        type: "Bearish",
        price: currentPrice
      });
    }
  }

  console.log("Divergence detection complete:", {
    bullish: divergences.bullish.length,
    bearish: divergences.bearish.length
  });

  return divergences;
};

export const checkMultipleStochConfirmation = (
  divergences: ReturnType<typeof findDivergence>,
  minConfirmations: number = 2
) => {
  console.log("Checking for multiple stochastic confirmations");
  
  const confirmedSignals = {
    bullish: [] as ConfirmedSignal[],
    bearish: [] as ConfirmedSignal[]
  };

  // Process bullish signals
  divergences.bullish.forEach(signal => {
    confirmedSignals.bullish.push({
      time: signal.time,
      confirmations: 1, // We're using a single confirmation for now
      price: signal.price
    });
  });

  // Process bearish signals
  divergences.bearish.forEach(signal => {
    confirmedSignals.bearish.push({
      time: signal.time,
      confirmations: 1, // We're using a single confirmation for now
      price: signal.price
    });
  });

  console.log("Confirmation check complete:", {
    bullish: confirmedSignals.bullish.length,
    bearish: confirmedSignals.bearish.length
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