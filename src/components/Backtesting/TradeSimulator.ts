import { Signal, Trade } from "./types";

export const simulateTrades = (historicalData: any[], signals: Signal[]): Trade[] => {
  const trades: Trade[] = [];
  let position: {
    type: 'long' | 'short';
    entryPrice: number;
    entryTime: string;
  } | null = null;

  // Sort signals by time
  const sortedSignals = [...signals].sort((a, b) => 
    new Date(a.time).getTime() - new Date(b.time).getTime()
  );

  for (let i = 0; i < historicalData.length; i++) {
    const candle = historicalData[i];
    const currentTime = candle.timestamp;
    
    // Find any signals at current time
    const currentSignal = sortedSignals.find(s => s.time === currentTime);

    // Entry logic
    if (!position && currentSignal) {
      position = {
        type: currentSignal.type === 'bullish' ? 'long' : 'short',
        entryPrice: candle.close,
        entryTime: currentTime
      };
      continue;
    }

    // Exit logic
    if (position) {
      const barsHeld = i - historicalData.findIndex(d => d.timestamp === position.entryTime);
      const oppositeSignal = currentSignal?.type === (position.type === 'long' ? 'bearish' : 'bullish');
      
      // Exit on opposite signal or after holding for 10 bars
      if (oppositeSignal || barsHeld >= 10) {
        const exitPrice = candle.close;
        const pnl = position.type === 'long' 
          ? exitPrice - position.entryPrice
          : position.entryPrice - exitPrice;
        const pnlPercent = (pnl / position.entryPrice) * 100;

        trades.push({
          entryTime: position.entryTime,
          exitTime: currentTime,
          entryPrice: position.entryPrice,
          exitPrice: exitPrice,
          type: position.type,
          pnl,
          pnlPercent
        });

        position = null;
      }
    }
  }

  return trades;
};