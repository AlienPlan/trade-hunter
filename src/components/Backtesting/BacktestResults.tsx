import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BacktestResult } from "./types";

export const BacktestResults = ({ results }: { results: BacktestResult[] }) => {
  if (results.length === 0) return null;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Instrument</TableHead>
          <TableHead>Timeframe</TableHead>
          <TableHead>Total Trades</TableHead>
          <TableHead>Win Rate</TableHead>
          <TableHead>Profit Factor</TableHead>
          <TableHead>Total Return</TableHead>
          <TableHead>Max Drawdown</TableHead>
          <TableHead>Sharpe Ratio</TableHead>
          <TableHead>Expectancy</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {results.map((result, index) => (
          <TableRow key={index}>
            <TableCell>{result.instrument}</TableCell>
            <TableCell>{result.timeframe}</TableCell>
            <TableCell>{result.total_trades}</TableCell>
            <TableCell>
              {((result.winning_trades / result.total_trades) * 100).toFixed(1)}%
            </TableCell>
            <TableCell>{result.profit_factor?.toFixed(2) || 'N/A'}</TableCell>
            <TableCell>{result.total_return.toFixed(2)}%</TableCell>
            <TableCell>{result.max_drawdown?.toFixed(2)}%</TableCell>
            <TableCell>{result.sharpe_ratio?.toFixed(2) || 'N/A'}</TableCell>
            <TableCell>{result.expectancy?.toFixed(2) || 'N/A'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};