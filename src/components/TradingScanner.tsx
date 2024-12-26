import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { InstrumentSelector } from "./TradingScanner/InstrumentSelector";
import { TimeframeSelector } from "./TradingScanner/TimeframeSelector";
import { NotificationSettings } from "./TradingScanner/NotificationSettings";
import { DivergenceAlerts } from "./DivergenceAlerts";

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

interface TradingScannerProps {
  onTimeframeChange?: (timeframe: string) => void;
  onSymbolChange?: (symbol: string) => void;
}

export const TradingScanner = ({ onTimeframeChange, onSymbolChange }: TradingScannerProps) => {
  const [selectedInstruments, setSelectedInstruments] = useState<Array<{ symbol: string; contract: string }>>([]);
  const [selectedTimeframes, setSelectedTimeframes] = useState<string[]>([]);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [telegramNotifications, setTelegramNotifications] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  const [divergenceSignals] = useState({
    bullish: [{ time: Date.now(), confirmations: 3 }],
    bearish: [{ time: Date.now() - 1000 * 60 * 5, confirmations: 4 }],
  });

  const handleInstrumentSelect = (baseSymbol: string) => {
    const isCurrentlySelected = selectedInstruments.some(i => i.symbol === baseSymbol);
    
    if (isCurrentlySelected) {
      setSelectedInstruments(prev => prev.filter(i => i.symbol !== baseSymbol));
    } else {
      const instrument = BASE_INSTRUMENTS.find(i => i.symbol === baseSymbol);
      if (instrument) {
        const defaultContract = `${instrument.months[0]}${new Date().getFullYear().toString().slice(-2)}`;
        setSelectedInstruments(prev => [...prev, { symbol: baseSymbol, contract: defaultContract }]);
        onSymbolChange?.(baseSymbol);
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

  const handleTimeframeSelect = (timeframe: string) => {
    setSelectedTimeframes(prev => {
      const newTimeframes = prev.includes(timeframe)
        ? prev.filter(t => t !== timeframe)
        : [...prev, timeframe];
      
      if (newTimeframes.length > 0) {
        onTimeframeChange?.(newTimeframes[0]);
      }
      return newTimeframes;
    });
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
      <InstrumentSelector
        instruments={BASE_INSTRUMENTS}
        selectedInstruments={selectedInstruments}
        onInstrumentSelect={handleInstrumentSelect}
        onContractChange={handleContractChange}
      />

      <TimeframeSelector
        timeframes={TIMEFRAMES}
        selectedTimeframes={selectedTimeframes}
        onTimeframeSelect={handleTimeframeSelect}
      />

      <NotificationSettings
        emailNotifications={emailNotifications}
        telegramNotifications={telegramNotifications}
        onEmailChange={setEmailNotifications}
        onTelegramChange={setTelegramNotifications}
      />

      <DivergenceAlerts
        bullishSignals={divergenceSignals.bullish}
        bearishSignals={divergenceSignals.bearish}
      />

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
