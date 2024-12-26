import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TradingScanner } from "@/components/TradingScanner";

const Index = () => {
  return (
    <div className="container mx-auto p-4">
      <Card className="mb-8">
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