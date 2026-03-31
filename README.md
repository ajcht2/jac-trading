# JAC Trading — Dashboard & Paper Trading

A full-featured trading dashboard built with React, featuring real-time stock & crypto market data, simulated paper trading, and algorithmic strategy backtesting.

**[Live Demo →](https://jac-trading.vercel.app)** *(update after deployment)*

![JAC Trading Screenshot](docs/screenshot.png)

---

## Features

### 📊 Market Dashboard
- Real-time stock & crypto data via Yahoo Finance with **auto-refresh every 15s**
- Professional candlestick charts (TradingView Lightweight Charts) with OHLCV tooltip on hover
- **Crypto watchlist** — live prices for BTC, ETH, SOL, XRP, ADA, DOGE, AVAX, DOT with auto-refresh
- Volume analysis, 52-week range indicator, market cap
- Ticker search with autocomplete (equities, ETFs, crypto, forex)
- Multiple timeframes: 1D, 5D, 1M, 3M, 6M, 1Y, 5Y
- Click any crypto tile to view full chart

### 💰 Paper Trading
- $100,000 virtual portfolio
- Market buy/sell orders with real-time pricing
- **Sell mode** auto-suggests owned stocks with share count
- Live P&L tracking per position with **auto-refresh every 30s**
- Total portfolio P&L display
- Full transaction history with source tagging
- Portfolio persistence via localStorage

### 🤖 Algorithmic Trading Bot
- **Moving Average Crossover** — Dual SMA trend-following (Golden Cross / Death Cross)
- **RSI Mean Reversion** — Oversold/overbought counter-trend
- **MACD Signal** — Momentum-based signal line crossover
- **Momentum Strategy** — Return-based trend persistence
- 1-year historical backtesting with trade-by-trade log
- Performance metrics: total return, win rate, alpha vs buy & hold
- Apply bot trades to paper portfolio

### 📖 Strategies Guide
- In-depth explanations of each algorithm: theory, math, strengths/weaknesses
- Covers Moving Average Crossover, RSI Mean Reversion, Pairs Trading / Statistical Arbitrage, Momentum
- Real-world usage examples (Renaissance Technologies, AQR, Morgan Stanley)
- Direct links to test each strategy in the bot

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Charts | TradingView Lightweight Charts |
| Data | Yahoo Finance API |
| Backend | Vercel Serverless Functions |
| Routing | React Router v6 |
| State | React Context + useReducer |
| Deployment | Vercel |

---

## Architecture

```
┌──────────────────────────────────────────────┐
│                  Frontend                     │
│  React + Vite + TailwindCSS                  │
│  ┌──────────┬──────────┬──────────────┐      │
│  │Dashboard │  Paper   │  Trading Bot │      │
│  │  + Chart │  Trading │  + Backtest  │      │
│  └────┬─────┴────┬─────┴──────┬───────┘      │
│       │          │            │               │
│       └──────────┼────────────┘               │
│                  │                            │
│         PortfolioContext                      │
│         (useReducer + localStorage)           │
└──────────────────┼───────────────────────────┘
                   │ /api/market
┌──────────────────┼───────────────────────────┐
│     Vercel Serverless Function               │
│     (Yahoo Finance proxy)                    │
└──────────────────┼───────────────────────────┘
                   │
          Yahoo Finance API
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Local Development

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/jac-trading.git
cd jac-trading

# Install dependencies
npm install

# Start local API proxy (required for Yahoo Finance data)
node server.dev.js

# In another terminal, start the frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

The serverless function in `/api/market.js` deploys automatically.

---

## Strategies Explained

Full explanations available in the app's **Strategies** page (`/strategies`).

### Moving Average Crossover
Uses two Simple Moving Averages. When the short-period SMA crosses above the long-period SMA, it generates a buy signal (golden cross). The reverse generates a sell signal (death cross).

### RSI Mean Reversion
The Relative Strength Index measures price momentum on a 0–100 scale. The bot buys when RSI drops below the oversold threshold (default: 30) and sells when it rises above the overbought level (default: 70).

### MACD Signal
The Moving Average Convergence Divergence indicator uses the difference between fast and slow EMAs. When the MACD line crosses above the signal line, it triggers a buy. Crossing below triggers a sell.

### Momentum Strategy
Buys when the return over a lookback period exceeds a positive threshold, and sells when it drops below a negative threshold. Based on the well-documented momentum anomaly in financial markets.

### Pairs Trading / Statistical Arbitrage
*(Explained in Strategies page)* Market-neutral strategy exploiting price divergence between correlated assets using z-score based entry/exit.

---

## Project Structure

```
jac-trading/
├── api/
│   └── market.js              # Vercel serverless — Yahoo Finance proxy
├── src/
│   ├── components/
│   │   ├── Layout.jsx          # Sidebar navigation + portfolio summary
│   │   ├── Dashboard.jsx       # Market data view + crypto watchlist
│   │   ├── Chart.jsx           # TradingView chart wrapper + tooltip
│   │   ├── TickerSearch.jsx    # Dashboard autocomplete search
│   │   ├── SymbolInput.jsx     # Reusable symbol search (trade + bot)
│   │   ├── PaperTrading.jsx    # Trade form + positions + history
│   │   ├── TradingBot.jsx      # Strategy config + backtesting
│   │   └── Strategies.jsx      # In-depth strategy explanations
│   ├── context/
│   │   └── PortfolioContext.jsx # State management
│   ├── services/
│   │   └── api.js              # API client + formatters
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
├── tailwind.config.js
├── vercel.json
└── package.json
```

---

## Roadmap

- [ ] Equity curve chart for backtest results
- [ ] Watchlist with multi-ticker tracking
- [ ] Stop-loss / take-profit orders
- [ ] Sharpe ratio & max drawdown metrics
- [ ] Portfolio allocation pie chart
- [ ] Export trades as CSV

---

## Author

**Antoine** — University of Warwick  
Built as a portfolio project demonstrating full-stack development, financial data engineering, and algorithmic trading concepts.

## License

MIT
