import { Signal } from "./types";

export const processSignals = (divergences: any): Signal[] => {
  const signals: Signal[] = [];

  // Process bullish signals
  divergences.bullish.forEach((signal: any) => {
    signals.push({
      time: signal.time,
      price: signal.price || 0, // Add proper price handling
      type: 'bullish',
      confirmations: signal.confirmations || 1
    });
  });

  // Process bearish signals
  divergences.bearish.forEach((signal: any) => {
    signals.push({
      time: signal.time,
      price: signal.price || 0, // Add proper price handling
      type: 'bearish',
      confirmations: signal.confirmations || 1
    });
  });

  return signals;
};