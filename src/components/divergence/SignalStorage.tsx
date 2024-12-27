import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SignalStorageProps {
  signal: {
    time: number;
    confirmations: number;
  };
  type: 'bullish' | 'bearish';
}

export const SignalStorage = ({ signal, type }: SignalStorageProps) => {
  const { toast } = useToast();

  const storeSignal = async () => {
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

  return null;
};