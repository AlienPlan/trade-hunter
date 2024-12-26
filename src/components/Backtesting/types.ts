export interface BacktestResult {
  instrument: string;
  timeframe: string;
  start_date: string;
  end_date: string;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  profit_factor: number;
  total_return: number;
  max_drawdown: number;
  sharpe_ratio?: number;
  average_win?: number;
  average_loss?: number;
  expectancy?: number;
}

export interface Trade {
  entryTime: string;
  exitTime: string;
  entryPrice: number;
  exitPrice: number;
  type: 'long' | 'short';
  pnl: number;
  pnlPercent: number;
}

export interface Signal {
  time: string;
  price: number;
  type: 'bullish' | 'bearish';
  confirmations: number;
}