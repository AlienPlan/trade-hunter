import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TradingScanner } from "@/components/TradingScanner";
import { TradingViewWidget } from "@/components/TradingViewWidget";
import { useState } from "react";

const Index = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("1d");
  const [selectedSymbol, setSelectedSymbol] = useState("CME:ES1!");

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
            Advanced chart with multiple Stochastic indicators for technical analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TradingViewWidget timeframe={selectedTimeframe} symbol={selectedSymbol} />
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
    </div>
  );
};

export default Index;