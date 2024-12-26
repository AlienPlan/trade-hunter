import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TradingScanner } from "@/components/TradingScanner";
import { TradingViewWidget } from "@/components/TradingViewWidget";

const Index = () => {
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
          <TradingViewWidget />
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
          <TradingScanner />
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;