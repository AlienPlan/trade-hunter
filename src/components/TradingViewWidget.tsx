import { useEffect } from 'react';

declare global {
  interface Window {
    TradingView: any;
  }
}

interface TradingViewWidgetProps {
  timeframe?: string;
  symbol?: string;
}

export const TradingViewWidget = ({ timeframe = "D", symbol = "CME:ES1!" }: TradingViewWidgetProps) => {
  useEffect(() => {
    // Convert our timeframe format to TradingView format
    const tvTimeframe = convertTimeframe(timeframe);
    
    // Create the script element
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (window.TradingView) {
        new window.TradingView.widget({
          width: '100%',
          height: 600,
          symbol: symbol,
          interval: tvTimeframe,
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#f1f3f6",
          enable_publishing: false,
          allow_symbol_change: true,
          studies: [
            "STD;Stochastic RSI@tv-basicstudies", // Default Stochastic RSI
            "STD;Stochastic@tv-basicstudies", // Default Stochastic (14,3,3)
            {
              id: "STD;Stochastic",
              inputs: { 
                "%k": 60,
                "%d": 10,
                "smooth": 3
              }
            },
            {
              id: "STD;Stochastic",
              inputs: { 
                "%k": 40,
                "%d": 4,
                "smooth": 3
              }
            },
            {
              id: "STD;Stochastic",
              inputs: { 
                "%k": 9,
                "%d": 3,
                "smooth": 3
              }
            }
          ],
          container_id: "tradingview_chart"
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
      // Clean up the container
      const container = document.getElementById("tradingview_chart");
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [timeframe, symbol]); // Re-initialize when timeframe or symbol changes

  return (
    <div className="w-full">
      <div id="tradingview_chart" className="w-full" />
    </div>
  );
};

// Convert our timeframe format to TradingView format
const convertTimeframe = (timeframe: string): string => {
  const conversions: { [key: string]: string } = {
    "3m": "3",
    "5m": "5",
    "12m": "15",
    "25m": "30",
    "1h": "60",
    "4h": "240",
    "1d": "D",
    "1w": "W"
  };
  return conversions[timeframe] || "D"; // Default to daily if timeframe not found
};