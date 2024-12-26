import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const INSTRUMENTS = [
  "MESH2025", // E-mini S&P 500
  "ESH2025", // E-mini S&P 500 (alternative ticker)
  "GCH2025", // Gold Futures
  "SIH2025", // Silver Futures
  "CLH2025", // Crude Oil Futures
  "BTCF2025", // Bitcoin Futures
  "NQH2025", // E-mini NASDAQ-100
];

const TIMEFRAMES = [
  "1m",
  "5m",
  "15m",
  "30m",
  "1h",
  "4h",
  "1d",
];

export const TradingScanner = () => {
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [selectedTimeframes, setSelectedTimeframes] = useState<string[]>([]);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [telegramNotifications, setTelegramNotifications] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  const handleStartScanning = () => {
    if (selectedInstruments.length === 0 || selectedTimeframes.length === 0) {
      toast({
        title: "Configuration Required",
        description: "Please select at least one instrument and timeframe.",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    console.log("Started scanning with:", {
      instruments: selectedInstruments,
      timeframes: selectedTimeframes,
      notifications: {
        email: emailNotifications,
        telegram: telegramNotifications,
      },
    });

    toast({
      title: "Scanner Started",
      description: `Monitoring ${selectedInstruments.length} instruments across ${selectedTimeframes.length} timeframes.`,
    });
  };

  const handleStopScanning = () => {
    setIsScanning(false);
    toast({
      title: "Scanner Stopped",
      description: "Market scanning has been stopped.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label>Select Futures Instruments</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
            {INSTRUMENTS.map((instrument) => (
              <Button
                key={instrument}
                variant={selectedInstruments.includes(instrument) ? "default" : "outline"}
                onClick={() => {
                  setSelectedInstruments((prev) =>
                    prev.includes(instrument)
                      ? prev.filter((i) => i !== instrument)
                      : [...prev, instrument]
                  );
                }}
                className="w-full"
              >
                {instrument}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label>Select Timeframes</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 mt-2">
            {TIMEFRAMES.map((timeframe) => (
              <Button
                key={timeframe}
                variant={selectedTimeframes.includes(timeframe) ? "default" : "outline"}
                onClick={() => {
                  setSelectedTimeframes((prev) =>
                    prev.includes(timeframe)
                      ? prev.filter((t) => t !== timeframe)
                      : [...prev, timeframe]
                  );
                }}
                className="w-full"
              >
                {timeframe}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4 bg-secondary/20 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
            <Label htmlFor="email-notifications">Email Notifications</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="telegram-notifications"
              checked={telegramNotifications}
              onCheckedChange={setTelegramNotifications}
            />
            <Label htmlFor="telegram-notifications">Telegram Notifications</Label>
          </div>
        </div>
      </div>

      <Button
        onClick={isScanning ? handleStopScanning : handleStartScanning}
        variant={isScanning ? "destructive" : "default"}
        className="w-full"
        size="lg"
      >
        {isScanning ? "Stop Scanning" : "Start Scanning"}
      </Button>
    </div>
  );
};