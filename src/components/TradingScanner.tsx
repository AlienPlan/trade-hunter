import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// Base instruments without contract months
const BASE_INSTRUMENTS = [
  {
    symbol: "MES", // E-mini S&P 500 Micro
    name: "E-mini S&P 500",
    months: ["H", "M", "U", "Z"] // March, June, September, December
  },
  {
    symbol: "ES", // E-mini S&P 500
    name: "E-mini S&P 500 (Full)",
    months: ["H", "M", "U", "Z"]
  },
  {
    symbol: "GC", // Gold Futures
    name: "Gold Futures",
    months: ["G", "J", "M", "Q", "V", "Z"] // February, April, June, August, October, December
  },
  {
    symbol: "SI", // Silver Futures
    name: "Silver Futures",
    months: ["H", "K", "N", "U", "Z"] // March, May, July, September, December
  },
  {
    symbol: "CL", // Crude Oil Futures
    name: "Crude Oil Futures",
    months: ["F", "G", "H", "J", "K", "M", "N", "Q", "U", "V", "X", "Z"] // All months
  },
  {
    symbol: "BTC", // Bitcoin Futures
    name: "Bitcoin Futures",
    months: ["F", "G", "H", "J", "K", "M", "N", "Q", "U", "V", "X", "Z"] // All months
  },
  {
    symbol: "NQ", // E-mini NASDAQ-100
    name: "E-mini NASDAQ-100",
    months: ["H", "M", "U", "Z"] // March, June, September, December
  }
];

const TIMEFRAMES = [
  "3m",
  "5m",
  "12m",
  "25m",
  "1h",
  "4h",
  "1d",
  "1w",
];

const currentYear = new Date().getFullYear();
const years = [currentYear, currentYear + 1];

export const TradingScanner = () => {
  const [selectedInstruments, setSelectedInstruments] = useState<Array<{ symbol: string; contract: string }>>([]);
  const [selectedTimeframes, setSelectedTimeframes] = useState<string[]>([]);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [telegramNotifications, setTelegramNotifications] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  const handleInstrumentSelect = (baseSymbol: string) => {
    const isCurrentlySelected = selectedInstruments.some(i => i.symbol === baseSymbol);
    
    if (isCurrentlySelected) {
      setSelectedInstruments(prev => prev.filter(i => i.symbol !== baseSymbol));
    } else {
      // Default to the nearest active contract
      const instrument = BASE_INSTRUMENTS.find(i => i.symbol === baseSymbol);
      if (instrument) {
        const defaultContract = `${instrument.months[0]}${currentYear.toString().slice(-2)}`;
        setSelectedInstruments(prev => [...prev, { symbol: baseSymbol, contract: defaultContract }]);
      }
    }
  };

  const handleContractChange = (baseSymbol: string, newContract: string) => {
    setSelectedInstruments(prev => 
      prev.map(i => 
        i.symbol === baseSymbol 
          ? { ...i, contract: newContract }
          : i
      )
    );
  };

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
            {BASE_INSTRUMENTS.map((instrument) => (
              <div key={instrument.symbol} className="flex flex-col space-y-2">
                <Button
                  variant={selectedInstruments.some(i => i.symbol === instrument.symbol) ? "default" : "outline"}
                  onClick={() => handleInstrumentSelect(instrument.symbol)}
                  className="w-full"
                >
                  {instrument.name}
                </Button>
                {selectedInstruments.some(i => i.symbol === instrument.symbol) && (
                  <Select
                    value={selectedInstruments.find(i => i.symbol === instrument.symbol)?.contract}
                    onValueChange={(value) => handleContractChange(instrument.symbol, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select contract" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(year => (
                        instrument.months.map(month => (
                          <SelectItem 
                            key={`${instrument.symbol}${month}${year.toString().slice(-2)}`}
                            value={`${month}${year.toString().slice(-2)}`}
                          >
                            {`${month}${year.toString().slice(-2)}`}
                          </SelectItem>
                        ))
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
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
