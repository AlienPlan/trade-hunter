import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const INSTRUMENTS = [
  "EURUSD",
  "GBPUSD",
  "USDJPY",
  "BTCUSD",
  "ETHUSD",
];

const TIMEFRAMES = [
  "1m",
  "5m",
  "15m",
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

  const handleStartScanning = () => {
    setIsScanning(true);
    // TODO: Implement actual scanning logic
    console.log("Started scanning with:", {
      instruments: selectedInstruments,
      timeframes: selectedTimeframes,
      notifications: {
        email: emailNotifications,
        telegram: telegramNotifications,
      },
    });
  };

  const handleStopScanning = () => {
    setIsScanning(false);
    // TODO: Implement stop scanning logic
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label>Select Instruments</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mt-2">
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mt-2">
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

        <div className="space-y-4">
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
      >
        {isScanning ? "Stop Scanning" : "Start Scanning"}
      </Button>
    </div>
  );
};