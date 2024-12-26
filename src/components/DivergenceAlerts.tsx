import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

interface DivergenceSignal {
  time: number;
  confirmations: number;
}

interface DivergenceAlertsProps {
  bullishSignals: DivergenceSignal[];
  bearishSignals: DivergenceSignal[];
}

export const DivergenceAlerts = ({ bullishSignals, bearishSignals }: DivergenceAlertsProps) => {
  const { toast } = useToast();

  useEffect(() => {
    // Show toast for new signals
    const showSignalToasts = () => {
      bullishSignals.forEach(signal => {
        toast({
          title: "Bullish Divergence Detected",
          description: `${signal.confirmations} Stochastic indicators confirm this signal`,
        });
      });

      bearishSignals.forEach(signal => {
        toast({
          title: "Bearish Divergence Detected",
          description: `${signal.confirmations} Stochastic indicators confirm this signal`,
          variant: "destructive",
        });
      });
    };

    showSignalToasts();
  }, [bullishSignals, bearishSignals, toast]);

  if (bullishSignals.length === 0 && bearishSignals.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {bullishSignals.map((signal, index) => (
        <Alert key={`bullish-${index}`}>
          <AlertTitle>Bullish Divergence Detected</AlertTitle>
          <AlertDescription>
            Confirmed by {signal.confirmations} Stochastic indicators at {new Date(signal.time).toLocaleString()}
          </AlertDescription>
        </Alert>
      ))}

      {bearishSignals.map((signal, index) => (
        <Alert key={`bearish-${index}`} variant="destructive">
          <AlertTitle>Bearish Divergence Detected</AlertTitle>
          <AlertDescription>
            Confirmed by {signal.confirmations} Stochastic indicators at {new Date(signal.time).toLocaleString()}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};