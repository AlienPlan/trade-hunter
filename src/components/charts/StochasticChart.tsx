import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface StochasticChartProps {
  data: any[];
}

export const StochasticChart = ({ data }: StochasticChartProps) => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="stoch9_k"
            stroke="#8884d8"
            name="Stoch 9-3 %K"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="stoch9_d"
            stroke="#82ca9d"
            name="Stoch 9-3 %D"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="stoch14_k"
            stroke="#ffc658"
            name="Stoch 14-3 %K"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="stoch14_d"
            stroke="#ff7300"
            name="Stoch 14-3 %D"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="stoch40_k"
            stroke="#0088FE"
            name="Stoch 40-4 %K"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="stoch40_d"
            stroke="#00C49F"
            name="Stoch 40-4 %D"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="stoch60_k"
            stroke="#FFBB28"
            name="Stoch 60-10 %K"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="stoch60_d"
            stroke="#FF8042"
            name="Stoch 60-10 %D"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};