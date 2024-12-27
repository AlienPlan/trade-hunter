import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import html2canvas from "html2canvas";

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

  const captureChart = async () => {
    try {
      const chartElement = document.getElementById("tradingview_chart");
      if (!chartElement) return null;
      
      const canvas = await html2canvas(chartElement);
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error("Error capturing chart:", error);
      return null;
    }
  };

  const sendEmailNotification = async (title: string, description: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, notification_enabled')
      .maybeSingle();

    if (!profile?.notification_enabled || !profile?.email) return;

    try {
      const chartImage = await captureChart();
      
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: profile.email,
          subject: `${title} - ${instrument} ${timeframe}`,
          text: `
            ${description}
            Instrument: ${instrument}
            Timeframe: ${timeframe}
            Time: ${new Date().toLocaleString()}
          `,
          attachments: chartImage ? [{
            content: chartImage.split('base64,')[1],
            filename: 'chart.png',
            type: 'image/png',
            disposition: 'attachment'
          }] : []
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
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user found');
      return;
    }

    const { error } = await supabase
      .from('trading_signals')
      .insert({
        signal_type: type,
        confirmations: signal.confirmations,
        price: 0,
        instrument: 'default',
        timeframe: '1h',
        user_id: user.id
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
    const showSignalToasts = async () => {
      for (const signal of bullishSignals) {
        const title = `Bullish Divergence Detected on ${instrument}`;
        const description = `${signal.confirmations} Stochastic indicators confirm this signal on ${timeframe} timeframe`;
        
        toast({
          title,
          description,
        });

        await sendEmailNotification(title, description);
        await storeSignal(signal, 'bullish');
      }

      for (const signal of bearishSignals) {
        const title = `Bearish Divergence Detected on ${instrument}`;
        const description = `${signal.confirmations} Stochastic indicators confirm this signal on ${timeframe} timeframe`;
        
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
  }, [bullishSignals, bearishSignals, toast, instrument, timeframe]);

  if (bullishSignals.length === 0 && bearishSignals.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {bullishSignals.map((signal, index) => (
        <Alert key={`bullish-${index}`}>
          <AlertTitle>Bullish Divergence Detected on {instrument}</AlertTitle>
          <AlertDescription>
            Confirmed by {signal.confirmations} Stochastic indicators at {new Date(signal.time).toLocaleString()} on {timeframe} timeframe
          </AlertDescription>
        </Alert>
      ))}

      {bearishSignals.map((signal, index) => (
        <Alert key={`bearish-${index}`} variant="destructive">
          <AlertTitle>Bearish Divergence Detected on {instrument}</AlertTitle>
          <AlertDescription>
            Confirmed by {signal.confirmations} Stochastic indicators at {new Date(signal.time).toLocaleString()} on {timeframe} timeframe
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};