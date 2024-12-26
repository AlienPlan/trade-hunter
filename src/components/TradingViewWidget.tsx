import { memo, useEffect, useRef } from 'react';

interface TradingViewWidgetProps {
  timeframe?: string;
  symbol?: string;
}

export const TradingViewWidget = memo(({ timeframe = "15", symbol = "COMEX:GC1!" }: TradingViewWidgetProps) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (container.current) {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = JSON.stringify({
        autosize: true,
        symbol: symbol,
        interval: timeframe,
        timezone: "America/Toronto",
        theme: "dark",
        style: "1",
        locale: "en",
        withdateranges: true,
        hide_side_toolbar: false,
        allow_symbol_change: true,
        details: true,
        calendar: false,
        studies: [
          "STD;Stochastic"
        ],
        support_host: "https://www.tradingview.com"
      });
      
      // Clean up previous script if it exists
      container.current.innerHTML = '';
      
      // Create widget container
      const widgetContainer = document.createElement("div");
      widgetContainer.className = "tradingview-widget-container__widget";
      widgetContainer.style.height = "calc(100% - 32px)";
      widgetContainer.style.width = "100%";
      
      // Create copyright element
      const copyright = document.createElement("div");
      copyright.className = "tradingview-widget-copyright";
      copyright.innerHTML = '<a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank"><span class="blue-text">Track all markets on TradingView</span></a>';
      
      // Append elements
      container.current.appendChild(widgetContainer);
      container.current.appendChild(copyright);
      container.current.appendChild(script);
    }

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [timeframe, symbol]);

  return (
    <div 
      className="tradingview-widget-container" 
      ref={container} 
      style={{ height: "600px", width: "100%" }}
    />
  );
});