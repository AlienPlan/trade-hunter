interface PricePoint {
  time: number;
  price: number;
  stoch9: number;
  stoch14: number;
  stoch40: number;
  stoch60: number;
}

export const findDivergence = (data: PricePoint[], lookbackPeriod: number = 10) => {
  const divergences = {
    bullish: [] as { time: number; type: string }[],
    bearish: [] as { time: number; type: string }[],
  };

  // Need at least lookbackPeriod + 1 points to find divergence
  if (data.length < lookbackPeriod + 1) return divergences;

  for (let i = lookbackPeriod; i < data.length; i++) {
    const currentPrice = data[i].price;
    const previousPrice = data[i - lookbackPeriod].price;
    
    // Check each Stochastic indicator
    ['stoch9', 'stoch14', 'stoch40', 'stoch60'].forEach(indicator => {
      const currentStoch = data[i][indicator as keyof PricePoint] as number;
      const previousStoch = data[i - lookbackPeriod][indicator as keyof PricePoint] as number;

      // Bullish divergence
      if (currentPrice < previousPrice && currentStoch > previousStoch) {
        divergences.bullish.push({
          time: data[i].time,
          type: `Bullish (${indicator})`,
        });
      }
      
      // Bearish divergence
      if (currentPrice > previousPrice && currentStoch < previousStoch) {
        divergences.bearish.push({
          time: data[i].time,
          type: `Bearish (${indicator})`,
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
    bullish: [] as { time: number, confirmations: number }[],
    bearish: [] as { time: number, confirmations: number }[],
  };

  // Group divergences by time
  const groupedBullish = new Map<number, number>();
  const groupedBearish = new Map<number, number>();

  divergences.bullish.forEach(({ time }) => {
    groupedBullish.set(time, (groupedBullish.get(time) || 0) + 1);
  });

  divergences.bearish.forEach(({ time }) => {
    groupedBearish.set(time, (groupedBearish.get(time) || 0) + 1);
  });

  // Filter for signals with minimum confirmations
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