import { useEffect } from 'react';

declare global {
  interface Window {
    TradingView: any;
  }
}

export const TradingViewWidget = () => {
  useEffect(() => {
    // Create the script element
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (window.TradingView) {
        new window.TradingView.widget({
          width: '100%',
          height: 600,
          symbol: "CME:ES1!",
          interval: "D",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#f1f3f6",
          enable_publishing: false,
          allow_symbol_change: true,
          studies: [
            "STD;Stochastic", // 14-3 (default)
            "STD;Stochastic@tv-basicstudies-60", // 60-10
            "STD;Stochastic@tv-basicstudies-40", // 40-4
            "STD;Stochastic@tv-basicstudies-9",  // 9-3
          ],
          container_id: "tradingview_chart"
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className="w-full">
      <div id="tradingview_chart" className="w-full" />
    </div>
  );
};