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

export const TradingViewWidget = ({ timeframe = "D", symbol = "ES1!" }: TradingViewWidgetProps) => {
  useEffect(() => {
    // Convert our timeframe format to TradingView format
    const tvTimeframe = convertTimeframe(timeframe);
    
    // Convert symbol to TradingView futures format
    const tvSymbol = convertSymbolToTradingView(symbol);
    
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (window.TradingView) {
        new window.TradingView.widget({
          width: '100%',
          height: 600,
          symbol: tvSymbol,
          interval: tvTimeframe,
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#f1f3f6",
          enable_publishing: false,
          allow_symbol_change: true,
          studies: [
            "STD;Stochastic RSI@tv-basicstudies",
            "STD;Stochastic@tv-basicstudies",
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
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
      const container = document.getElementById("tradingview_chart");
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [timeframe, symbol]);

  return (
    <div className="w-full">
      <div id="tradingview_chart" className="w-full" />
    </div>
  );
};

// Convert our timeframe format to TradingView format
const convertTimeframe = (timeframe: string): string => {
  const conversions: { [key: string]: string } = {
    "3m": "D", // Defaulting to daily for unsupported timeframes
    "5m": "D",
    "12m": "D",
    "25m": "D",
    "1h": "60",
    "4h": "240",
    "1d": "D",
    "1w": "W"
  };
  return conversions[timeframe] || "D";
};

// Convert our symbol format to TradingView futures format
const convertSymbolToTradingView = (symbol: string): string => {
  // Map base symbols to their TradingView exchange:symbol format
  const symbolMap: { [key: string]: string } = {
    "ES": "CME_MINI:ES1!", // E-mini S&P 500
    "MES": "CME_MICRO:MES1!", // Micro E-mini S&P 500
    "NQ": "CME_MINI:NQ1!", // E-mini NASDAQ-100
    "MNQ": "CME_MICRO:MNQ1!", // Micro E-mini NASDAQ-100
    "GC": "COMEX:GC1!", // Gold Futures
    "MGC": "COMEX_MINI:MGC1!", // Micro Gold Futures
    "SI": "COMEX:SI1!", // Silver Futures
    "CL": "NYMEX:CL1!", // Crude Oil Futures
    "MCL": "NYMEX_MINI:MCL1!", // Micro Crude Oil Futures
    "BTC": "CME:BTC1!", // Bitcoin Futures
    "MBT": "CME_MICRO:MBT1!", // Micro Bitcoin Futures
  };

  // Extract base symbol (remove any contract month/year)
  const baseSymbol = symbol.replace(/[A-Z]\d{2}$/, '');
  
  // Return the mapped symbol or the symbol itself if it's already in the correct format
  if (symbol.includes(':')) {
    return symbol;
  }
  return symbolMap[baseSymbol] || `CME_MINI:${baseSymbol}1!`;
};