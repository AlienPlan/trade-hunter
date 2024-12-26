import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useToast } from "@/hooks/use-toast";

interface KuCoinChartProps {
  symbol?: string;
  timeframe?: string;
}

export const KuCoinChart = ({ symbol = "BTC-USDT", timeframe = "1h" }: KuCoinChartProps) => {
  const [data, setData] = useState<any[]>([]);
  const { toast } = useToast();
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);

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
              }].slice(-100); // Keep last 100 data points
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
      <div className="h-[600px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              label={{ value: "Time", position: "insideBottom", offset: -5 }}
            />
            <YAxis
              yAxisId="left"
              label={{ value: "Price", angle: -90, position: "insideLeft" }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              label={{ value: "Volume", angle: 90, position: "insideRight" }}
            />
            <Tooltip />
            <Legend />
            <Bar
              yAxisId="right"
              dataKey="volume"
              fill="#8884d8"
              opacity={0.3}
              name="Volume"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="price"
              stroke="#ff7300"
              name="Price"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};