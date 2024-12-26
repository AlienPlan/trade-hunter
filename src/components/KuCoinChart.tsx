import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { StochasticChart } from "./charts/StochasticChart";
import { PriceVolumeChart } from "./charts/PriceVolumeChart";
import { useToast } from "@/hooks/use-toast";
import { findDivergence, checkMultipleStochConfirmation } from "@/utils/divergenceUtils";
import { DivergenceAlerts } from "./DivergenceAlerts";

interface KuCoinChartProps {
  symbol?: string;
  timeframe?: string;
}

export const KuCoinChart = ({ 
  symbol = "BTC-USDT", 
  timeframe = "1h" 
}: KuCoinChartProps) => {
  const [data, setData] = useState<any[]>([]);
  const { toast } = useToast();
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
  const [divergenceSignals, setDivergenceSignals] = useState({
    bullish: [],
    bearish: []
  });

  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        const response = await fetch(`/api/kucoin-ws?symbol=${symbol}&timeframe=${timeframe}`);
        const { token, endpoint } = await response.json();
        
        const ws = new WebSocket(`${endpoint}?token=${token}`);
        
        ws.onmessage = (event) => {
          const message = JSON.parse(event.data);
          if (message.type === 'message' && message.data) {
            setData(prevData => {
              const newData = [...prevData, {
                timestamp: new Date(message.data.time).toLocaleTimeString(),
                price: parseFloat(message.data.price),
                volume: parseFloat(message.data.size),
                high: parseFloat(message.data.high || message.data.price),
                low: parseFloat(message.data.low || message.data.price),
                close: parseFloat(message.data.price),
                stoch9_k: 0, // Will be calculated
                stoch9_d: 0,
                stoch14_k: 0,
                stoch14_d: 0,
                stoch40_k: 0,
                stoch40_d: 0,
                stoch60_k: 0,
                stoch60_d: 0
              }].slice(-100);

              // Calculate divergences
              const signals = findDivergence(newData);
              const confirmedSignals = checkMultipleStochConfirmation(signals);
              setDivergenceSignals(confirmedSignals);

              return newData;
            });
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          toast({
            title: "Connection Error",
            description: "Failed to connect to KuCoin WebSocket",
            variant: "destructive",
          });
        };

        setWsConnection(ws);
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
        toast({
          title: "Connection Error",
          description: "Failed to establish WebSocket connection",
          variant: "destructive",
        });
      }
    };

    connectWebSocket();

    return () => {
      if (wsConnection) {
        wsConnection.close();
      }
    };
  }, [symbol, timeframe]);

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <PriceVolumeChart data={data} />
        <StochasticChart data={data} />
        <DivergenceAlerts
          bullishSignals={divergenceSignals.bullish}
          bearishSignals={divergenceSignals.bearish}
        />
      </div>
    </Card>
  );
};