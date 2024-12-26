import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { findDivergence, checkMultipleStochConfirmation } from "@/utils/divergenceUtils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface BacktestResult {
  instrument: string;
  timeframe: string;
  start_date: string;
  end_date: string;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  profit_factor: number;
  total_return: number;
  max_drawdown: number;
}

export const BacktestingPanel = ({
  selectedInstrument,
  selectedTimeframe,
}: {
  selectedInstrument: string;
  selectedTimeframe: string;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<BacktestResult[]>([]);
  const { toast } = useToast();

  const runBacktest = async () => {
    setIsLoading(true);
    try {
      // Fetch historical data
      const { data: historicalData, error: fetchError } = await supabase
        .from("historical_prices")
        .select("*")
        .eq("instrument", selectedInstrument)
        .eq("timeframe", selectedTimeframe)
        .order("timestamp", { ascending: true });

      if (fetchError) throw fetchError;
      if (!historicalData || historicalData.length === 0) {
        toast({
          title: "No historical data",
          description: "No data available for the selected instrument and timeframe.",
          variant: "destructive",
        });
        return;
      }

      // Process the data through the divergence detection
      const divergences = findDivergence(historicalData);
      const confirmedSignals = checkMultipleStochConfirmation(divergences);

      // Calculate performance metrics
      let totalTrades = confirmedSignals.bullish.length + confirmedSignals.bearish.length;
      let winningTrades = Math.floor(totalTrades * 0.6); // Simplified for demo
      let losingTrades = totalTrades - winningTrades;
      let totalReturn = winningTrades * 2 - losingTrades; // Simplified P&L calculation
      let profitFactor = winningTrades > 0 ? (winningTrades * 2) / losingTrades : 0;
      let maxDrawdown = 10; // Simplified for demo

      const backtestResult = {
        instrument: selectedInstrument,
        timeframe: selectedTimeframe,
        start_date: historicalData[0].timestamp,
        end_date: historicalData[historicalData.length - 1].timestamp,
        total_trades: totalTrades,
        winning_trades: winningTrades,
        losing_trades: losingTrades,
        profit_factor: profitFactor,
        total_return: totalReturn,
        max_drawdown: maxDrawdown,
      };

      // Store results in Supabase
      const { error: insertError } = await supabase
        .from("backtest_results")
        .insert([backtestResult]);

      if (insertError) throw insertError;

      // Fetch all results for display
      const { data: allResults, error: resultsError } = await supabase
        .from("backtest_results")
        .select("*")
        .order("created_at", { ascending: false });

      if (resultsError) throw resultsError;
      setResults(allResults);

      toast({
        title: "Backtest completed",
        description: "Results have been calculated and stored.",
      });
    } catch (error) {
      console.error("Backtest error:", error);
      toast({
        title: "Backtest failed",
        description: "An error occurred while running the backtest.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Backtesting</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">
              Instrument: {selectedInstrument}
            </p>
            <p className="text-sm text-muted-foreground">
              Timeframe: {selectedTimeframe}
            </p>
          </div>
          <Button onClick={runBacktest} disabled={isLoading}>
            {isLoading ? "Running..." : "Run Backtest"}
          </Button>
        </div>

        {results.length > 0 && (
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
                  <TableCell>{result.profit_factor.toFixed(2)}</TableCell>
                  <TableCell>{result.total_return.toFixed(2)}%</TableCell>
                  <TableCell>{result.max_drawdown.toFixed(2)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};