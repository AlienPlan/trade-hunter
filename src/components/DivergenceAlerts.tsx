import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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

  const sendEmailNotification = async (title: string, description: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, notification_enabled')
      .single();

    if (!profile?.notification_enabled || !profile?.email) return;

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: profile.email,
          subject: title,
          text: description,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send email notification");
      }
    } catch (error) {
      console.error("Error sending email notification:", error);
      toast({
        title: "Notification Error",
        description: "Failed to send email notification",
        variant: "destructive",
      });
    }
  };

  const storeSignal = async (signal: DivergenceSignal, type: 'bullish' | 'bearish') => {
    const { error } = await supabase
      .from('trading_signals')
      .insert({
        signal_type: type,
        confirmations: signal.confirmations,
        price: 0, // You'll need to add the actual price here
        instrument: 'default', // Update with actual instrument
        timeframe: '1h', // Update with actual timeframe
      });

    if (error) {
      console.error('Error storing signal:', error);
      toast({
        title: "Storage Error",
        description: "Failed to store trading signal",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Show toast and send email for new signals
    const showSignalToasts = async () => {
      for (const signal of bullishSignals) {
        const title = "Bullish Divergence Detected";
        const description = `${signal.confirmations} Stochastic indicators confirm this signal`;
        
        toast({
          title,
          description,
        });

        await sendEmailNotification(title, description);
        await storeSignal(signal, 'bullish');
      }

      for (const signal of bearishSignals) {
        const title = "Bearish Divergence Detected";
        const description = `${signal.confirmations} Stochastic indicators confirm this signal`;
        
        toast({
          title,
          description,
          variant: "destructive",
        });

        await sendEmailNotification(title, description);
        await storeSignal(signal, 'bearish');
      }
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