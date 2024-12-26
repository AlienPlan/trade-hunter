import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface TimeframeSelectorProps {
  timeframes: string[];
  selectedTimeframes: string[];
  onTimeframeSelect: (timeframe: string) => void;
}

export const TimeframeSelector = ({
  timeframes,
  selectedTimeframes,
  onTimeframeSelect,
}: TimeframeSelectorProps) => {
  return (
    <div>
      <Label>Select Timeframes</Label>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 mt-2">
        {timeframes.map((timeframe) => (
          <Button
            key={timeframe}
            variant={selectedTimeframes.includes(timeframe) ? "default" : "outline"}
            onClick={() => onTimeframeSelect(timeframe)}
            className="w-full"
          >
            {timeframe}
          </Button>
        ))}
      </div>
    </div>
  );
};