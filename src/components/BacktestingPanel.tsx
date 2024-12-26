import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { findDivergence, checkMultipleStochConfirmation, calculatePerformanceMetrics } from "@/utils/divergenceUtils";
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
  sharpe_ratio?: number;
  average_win?: number;
  average_loss?: number;
  expectancy?: number;
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

      // Simulate trades based on signals
      const trades = simulateTrades(historicalData, confirmedSignals);
      const metrics = calculatePerformanceMetrics(trades);

      if (!metrics) {
        toast({
          title: "No trades generated",
          description: "The strategy did not generate any trades in the selected period.",
          variant: "destructive",
        });
        return;
      }

      const backtestResult = {
        instrument: selectedInstrument,
        timeframe: selectedTimeframe,
        start_date: historicalData[0].timestamp,
        end_date: historicalData[historicalData.length - 1].timestamp,
        total_trades: metrics.totalTrades,
        winning_trades: metrics.winningTrades,
        losing_trades: metrics.losingTrades,
        profit_factor: metrics.profitFactor,
        total_return: metrics.totalReturn,
        max_drawdown: metrics.maxDrawdown,
        sharpe_ratio: metrics.sharpeRatio,
        average_win: metrics.averageWin,
        average_loss: metrics.averageLoss,
        expectancy: metrics.expectancy,
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

  const simulateTrades = (historicalData: any[], signals: any) => {
    const trades = [];
    let position = null;

    for (let i = 0; i < historicalData.length; i++) {
      const candle = historicalData[i];
      
      // Check for entry signals
      const bullishSignal = signals.bullish.find(s => s.time === candle.timestamp);
      const bearishSignal = signals.bearish.find(s => s.time === candle.timestamp);

      if (!position && bullishSignal) {
        position = {
          type: 'long',
          entryPrice: candle.close,
          entryTime: candle.timestamp
        };
      } else if (!position && bearishSignal) {
        position = {
          type: 'short',
          entryPrice: candle.close,
          entryTime: candle.timestamp
        };
      }
      // Simple exit strategy: close position after opposite signal or fixed bars
      else if (position) {
        const barsHeld = i - historicalData.findIndex(d => d.timestamp === position.entryTime);
        const oppositeSignal = (position.type === 'long' && bearishSignal) || 
                             (position.type === 'short' && bullishSignal);
        
        if (oppositeSignal || barsHeld >= 10) {
          const exitPrice = candle.close;
          const pnl = position.type === 'long' 
            ? exitPrice - position.entryPrice
            : position.entryPrice - exitPrice;
          const pnlPercent = (pnl / position.entryPrice) * 100;

          trades.push({
            entryTime: position.entryTime,
            exitTime: candle.timestamp,
            entryPrice: position.entryPrice,
            exitPrice: exitPrice,
            type: position.type,
            pnl,
            pnlPercent
          });

          position = null;
        }
      }
    }

    return trades;
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
        )}
      </CardContent>
    </Card>
  );
};