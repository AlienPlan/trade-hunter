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

  const sendEmailNotification = async (title: string, description: string) => {
    const email = localStorage.getItem("notificationEmail");
    if (!email) return;

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: email,
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

  useEffect(() => {
    // Show toast and send email for new signals
    const showSignalToasts = () => {
      bullishSignals.forEach(signal => {
        const title = "Bullish Divergence Detected";
        const description = `${signal.confirmations} Stochastic indicators confirm this signal`;
        
        toast({
          title,
          description,
        });

        sendEmailNotification(title, description);
      });

      bearishSignals.forEach(signal => {
        const title = "Bearish Divergence Detected";
        const description = `${signal.confirmations} Stochastic indicators confirm this signal`;
        
        toast({
          title,
          description,
          variant: "destructive",
        });

        sendEmailNotification(title, description);
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