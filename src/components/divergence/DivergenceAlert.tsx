import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface DivergenceAlertProps {
  signal: {
    time: number;
    confirmations: number;
  };
  type: 'bullish' | 'bearish';
  instrument: string;
  timeframe: string;
}

export const DivergenceAlert = ({ signal, type, instrument, timeframe }: DivergenceAlertProps) => {
  const isBullish = type === 'bullish';
  
  return (
    <Alert variant={isBullish ? "default" : "destructive"}>
      <AlertTitle>{isBullish ? "Bullish" : "Bearish"} Divergence Detected on {instrument}</AlertTitle>
      <AlertDescription>
        Confirmed by {signal.confirmations} Stochastic indicators at {new Date(signal.time).toLocaleString()} on {timeframe} timeframe
      </AlertDescription>
    </Alert>
  );
};