import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Instrument {
  symbol: string;
  name: string;
  months: string[];
}

interface InstrumentSelectorProps {
  instruments: Instrument[];
  selectedInstruments: Array<{ symbol: string; contract: string }>;
  onInstrumentSelect: (symbol: string) => void;
  onContractChange: (symbol: string, contract: string) => void;
}

export const InstrumentSelector = ({
  instruments,
  selectedInstruments,
  onInstrumentSelect,
  onContractChange,
}: InstrumentSelectorProps) => {
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear + 1];

  return (
    <div>
      <Label>Select Futures Instruments</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
        {instruments.map((instrument) => (
          <div key={instrument.symbol} className="flex flex-col space-y-2">
            <Button
              variant={selectedInstruments.some(i => i.symbol === instrument.symbol) ? "default" : "outline"}
              onClick={() => onInstrumentSelect(instrument.symbol)}
              className="w-full"
            >
              {instrument.name}
            </Button>
            {selectedInstruments.some(i => i.symbol === instrument.symbol) && (
              <Select
                value={selectedInstruments.find(i => i.symbol === instrument.symbol)?.contract}
                onValueChange={(value) => onContractChange(instrument.symbol, value)}
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
  );
};