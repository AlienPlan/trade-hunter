import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { DivergenceAlert } from "./divergence/DivergenceAlert";
import { SignalStorage } from "./divergence/SignalStorage";
import { sendEmailNotification } from "@/utils/emailUtils";

interface DivergenceSignal {
  time: number;
  confirmations: number;
}

interface DivergenceAlertsProps {
  bullishSignals: DivergenceSignal[];
  bearishSignals: DivergenceSignal[];
  instrument?: string;
  timeframe?: string;
}

export const DivergenceAlerts = ({ 
  bullishSignals, 
  bearishSignals, 
  instrument = "ES1!", 
  timeframe = "1h" 
}: DivergenceAlertsProps) => {
  const { toast } = useToast();

  useEffect(() => {
    const showSignalToasts = async () => {
      for (const signal of bullishSignals) {
        const title = `Bullish Divergence Detected on ${instrument}`;
        const description = `${signal.confirmations} Stochastic indicators confirm this signal on ${timeframe} timeframe`;
        
        toast({
          title,
          description,
        });

        await sendEmailNotification(title, description, instrument, timeframe);
      }

      for (const signal of bearishSignals) {
        const title = `Bearish Divergence Detected on ${instrument}`;
        const description = `${signal.confirmations} Stochastic indicators confirm this signal on ${timeframe} timeframe`;
        
        toast({
          title,
          description,
          variant: "destructive",
        });

        await sendEmailNotification(title, description, instrument, timeframe);
      }
    };

    showSignalToasts();
  }, [bullishSignals, bearishSignals, toast, instrument, timeframe]);

  if (bullishSignals.length === 0 && bearishSignals.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {bullishSignals.map((signal, index) => (
        <>
          <DivergenceAlert
            key={`bullish-${index}`}
            signal={signal}
            type="bullish"
            instrument={instrument}
            timeframe={timeframe}
          />
          <SignalStorage signal={signal} type="bullish" />
        </>
      ))}

      {bearishSignals.map((signal, index) => (
        <>
          <DivergenceAlert
            key={`bearish-${index}`}
            signal={signal}
            type="bearish"
            instrument={instrument}
            timeframe={timeframe}
          />
          <SignalStorage signal={signal} type="bearish" />
        </>
      ))}
    </div>
  );
};