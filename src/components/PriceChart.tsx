import { useEffect, useState } from "react";
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

interface PriceChartProps {
  symbol?: string;
  timeframe?: string;
}

export const PriceChart = ({ symbol = "ES", timeframe = "1h" }: PriceChartProps) => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: prices, error } = await supabase
        .from("historical_prices")
        .select("*")
        .eq("instrument", symbol)
        .eq("timeframe", timeframe)
        .order("timestamp", { ascending: true })
        .limit(100);

      if (error) {
        console.error("Error fetching price data:", error);
        return;
      }

      const formattedData = prices.map((price) => ({
        timestamp: new Date(price.timestamp).toLocaleTimeString(),
        price: price.close,
        volume: price.volume,
        high: price.high,
        low: price.low,
      }));

      setData(formattedData);
    };

    fetchData();
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
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="high"
              stroke="#82ca9d"
              name="High"
              dot={false}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="low"
              stroke="#ff0000"
              name="Low"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};