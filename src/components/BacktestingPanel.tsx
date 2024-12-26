import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { findDivergence, checkMultipleStochConfirmation, calculatePerformanceMetrics } from "@/utils/divergenceUtils";
import { BacktestResults } from "./Backtesting/BacktestResults";
import { simulateTrades } from "./Backtesting/TradeSimulator";
import { processSignals } from "./Backtesting/SignalProcessor";
import type { BacktestResult } from "./Backtesting/types";

export const BacktestingPanel = ({
  selectedInstrument,
  selectedTimeframe,
}: {
  selectedInstrument: string;
  selectedTimeframe: string;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<BacktestResult[]>([]);
  const [stats, setStats] = useState<{
    divergences: { bullish: number; bearish: number };
    signals: { bullish: number; bearish: number };
    trades: number;
  } | null>(null);
  const { toast } = useToast();

  const runBacktest = async () => {
    setIsLoading(true);
    setStats(null);
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

      console.log("Historical data loaded:", historicalData.length, "records");

      // Process the data through the divergence detection
      const divergences = findDivergence(historicalData);
      console.log("Divergences found:", {
        bullish: divergences.bullish.length,
        bearish: divergences.bearish.length
      });

      const confirmedSignals = checkMultipleStochConfirmation(divergences);
      console.log("Confirmed signals:", {
        bullish: confirmedSignals.bullish.length,
        bearish: confirmedSignals.bearish.length
      });

      // Process signals and simulate trades
      const signals = processSignals(confirmedSignals);
      console.log("Processed signals:", signals.length);

      const trades = simulateTrades(historicalData, signals);
      console.log("Generated trades:", trades.length);

      // Update stats for UI display
      setStats({
        divergences: {
          bullish: divergences.bullish.length,
          bearish: divergences.bearish.length
        },
        signals: {
          bullish: confirmedSignals.bullish.length,
          bearish: confirmedSignals.bearish.length
        },
        trades: trades.length
      });

      if (trades.length === 0) {
        toast({
          title: "No trades generated",
          description: "The strategy did not generate any trades in the selected period.",
          variant: "destructive",
        });
        return;
      }

      const metrics = calculatePerformanceMetrics(trades);
      if (!metrics) {
        toast({
          title: "Calculation error",
          description: "Could not calculate performance metrics.",
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
        description: `Generated ${trades.length} trades with ${metrics.winningTrades} winners.`,
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

        {stats && (
          <div className="mt-4 space-y-2 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold">Analysis Statistics:</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p>Bullish Divergences: {stats.divergences.bullish}</p>
                <p>Bearish Divergences: {stats.divergences.bearish}</p>
              </div>
              <div>
                <p>Confirmed Bullish Signals: {stats.signals.bullish}</p>
                <p>Confirmed Bearish Signals: {stats.signals.bearish}</p>
              </div>
            </div>
            <p className="font-medium">Total Trades Generated: {stats.trades}</p>
          </div>
        )}

        <BacktestResults results={results} />
      </CardContent>
    </Card>
  );
};