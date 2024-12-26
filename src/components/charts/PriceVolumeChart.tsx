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

interface PriceVolumeChartProps {
  data: any[];
}

export const PriceVolumeChart = ({ data }: PriceVolumeChartProps) => {
  return (
    <div className="h-[300px] w-full">
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
  );
};