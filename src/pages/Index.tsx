import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TradingScanner } from "@/components/TradingScanner";
import { PriceChart } from "@/components/PriceChart";
import { BacktestingPanel } from "@/components/BacktestingPanel";
import { useState } from "react";

const Index = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("1h");
  const [selectedSymbol, setSelectedSymbol] = useState("ES");

  const handleTimeframeChange = (timeframe: string) => {
    setSelectedTimeframe(timeframe);
  };

  const handleSymbolChange = (symbol: string) => {
    setSelectedSymbol(symbol);
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Trading Chart</CardTitle>
          <CardDescription>
            Interactive price chart with volume and technical indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PriceChart timeframe={selectedTimeframe} symbol={selectedSymbol} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trading Setup Scanner</CardTitle>
          <CardDescription>
            Monitor multiple instruments across different timeframes for your trading setups
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TradingScanner 
            onTimeframeChange={handleTimeframeChange}
            onSymbolChange={handleSymbolChange}
          />
        </CardContent>
      </Card>

      <BacktestingPanel
        selectedInstrument={selectedSymbol}
        selectedTimeframe={selectedTimeframe}
      />
    </div>
  );
};

export default Index;