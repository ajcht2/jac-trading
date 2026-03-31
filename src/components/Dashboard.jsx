import { useState, useEffect, useCallback } from 'react'
import { TrendingUp, TrendingDown, Clock, BarChart2, Activity, Search, Info } from 'lucide-react'
import Chart from './Chart'
import TickerSearch from './TickerSearch'
import { usePrices } from '../context/PriceContext'
import { useAuth } from '../context/AuthContext'
import { fetchChart, getInterval, formatPrice, formatPercent, formatNumber } from '../services/api'

const RANGES = ['1d', '5d', '1mo', '3mo', '6mo', '1y', '5y']
const RANGE_LABELS = { '1d': '1D', '5d': '5D', '1mo': '1M', '3mo': '3M', '6mo': '6M', '1y': '1Y', '5y': '5Y' }

const CRYPTO_TICKERS = [
  { symbol: 'BTC-USD', name: 'Bitcoin', icon: '₿' },
  { symbol: 'ETH-USD', name: 'Ethereum', icon: 'Ξ' },
  { symbol: 'SOL-USD', name: 'Solana', icon: '◎' },
  { symbol: 'XRP-USD', name: 'Ripple', icon: '✕' },
  { symbol: 'ADA-USD', name: 'Cardano', icon: '₳' },
  { symbol: 'DOGE-USD', name: 'Dogecoin', icon: 'Ð' },
  { symbol: 'AVAX-USD', name: 'Avalanche', icon: 'A' },
  { symbol: 'DOT-USD', name: 'Polkadot', icon: '●' },
]

export default function Dashboard() {
  const [symbol, setSymbol] = useState(null)  // null = landing page
  const [range, setRange] = useState('3mo')
  const [chartData, setChartData] = useState(null)
  const [chartLoading, setChartLoading] = useState(false)
  const [error, setError] = useState(null)
  const { user } = useAuth()
  const { prices, watchPriority, watchSymbols, lastUpdate, REFRESH_INTERVAL } = usePrices()
  const quote = symbol ? prices[symbol] : null

  // Register current symbol
  useEffect(() => {
    if (symbol) watchPriority([symbol])
  }, [symbol, watchPriority])

  // Load chart
  const loadChart = useCallback(async () => {
    if (!symbol) return
    setChartLoading(true)
    setError(null)
    try {
      const interval = getInterval(range)
      const chart = await fetchChart(symbol, range, interval)
      setChartData(chart)
    } catch (err) {
      setError(err.message)
    } finally {
      setChartLoading(false)
    }
  }, [symbol, range])

  useEffect(() => {
    if (symbol) loadChart()
  }, [loadChart])

  const handleSelectTicker = (ticker) => {
    setSymbol(ticker)
    setRange('3mo')
  }

  const isPositive = quote && quote.change >= 0

  // Countdown
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL / 1000)
  useEffect(() => {
    setCountdown(REFRESH_INTERVAL / 1000)
    const timer = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000)
    return () => clearInterval(timer)
  }, [lastUpdate])

  // Landing page — no symbol selected yet
  if (!symbol) {
    return (
      <div className="max-w-[1400px] space-y-6">
        {/* Welcome */}
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold">
            Welcome{user?.name ? `, ${user.name}` : ''}
          </h2>
          <p className="text-terminal-muted mt-2">Search for any stock or crypto to get started</p>
        </div>

        {/* Big Search Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search size={22} className="absolute left-5 top-1/2 -translate-y-1/2 text-terminal-muted" />
            <div className="[&_input]:text-lg [&_input]:py-4 [&_input]:pl-14 [&_input]:pr-5 [&_input]:rounded-2xl">
              <TickerSearch onSelect={handleSelectTicker} currentSymbol="" />
            </div>
          </div>
        </div>

        {/* Quick Picks */}
        <div className="max-w-2xl mx-auto">
          <p className="text-xs text-terminal-muted uppercase tracking-wider mb-3 text-center">Popular Stocks</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'NFLX'].map(s => (
              <button key={s} onClick={() => handleSelectTicker(s)}
                className="px-4 py-2 rounded-xl bg-terminal-panel border border-terminal-border text-sm font-mono hover:border-accent/30 hover:text-accent transition-all"
              >{s}</button>
            ))}
          </div>
        </div>

        {/* Crypto */}
        <CryptoWatchlist onSelect={handleSelectTicker} activeSymbol="" />
      </div>
    )
  }

  // Chart view — symbol selected
  return (
    <div className="space-y-4 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-[300px]">
          <TickerSearch onSelect={handleSelectTicker} currentSymbol={symbol} />
        </div>
        <div className="flex items-center gap-2 text-xs text-terminal-muted font-mono">
          <div className="w-1.5 h-1.5 rounded-full bg-gain animate-pulse" />
          <span>Live • {countdown}s</span>
        </div>
      </div>

      {/* Stock Info */}
      {quote && (
        <div className={`panel p-5 ${isPositive ? 'glow-gain' : 'glow-loss'}`}>
          <div className="flex items-center gap-6 flex-wrap">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold font-mono">{symbol}</h2>
                <span className="text-sm text-terminal-muted">{quote.name}</span>
                {quote.currency && <span className="text-xs px-2 py-0.5 rounded-lg bg-terminal-border text-terminal-muted font-mono">{quote.currency}</span>}
              </div>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-3xl font-mono font-bold">${formatPrice(quote.price)}</span>
                <span className={`text-lg font-mono font-semibold ${isPositive ? 'text-gain' : 'text-loss'}`}>
                  {isPositive ? '+' : ''}{formatPrice(quote.change)}
                </span>
                <span className={`text-sm font-mono px-2.5 py-1 rounded-lg ${isPositive ? 'bg-gain/10 text-gain' : 'bg-loss/10 text-loss'}`}>
                  {formatPercent(quote.changePercent)}
                </span>
              </div>
            </div>
            <div className="flex gap-5 ml-auto text-sm">
              <InfoItem
                icon={Activity} label="Open"
                value={quote.open != null ? formatPrice(quote.open) : '—'}
                tooltip="The price at which the stock first traded when the market opened today"
              />
              <InfoItem
                icon={TrendingUp} label="High"
                value={quote.high != null ? formatPrice(quote.high) : '—'}
                tooltip="The highest price the stock has reached during today's trading session"
              />
              <InfoItem
                icon={TrendingDown} label="Low"
                value={quote.low != null ? formatPrice(quote.low) : '—'}
                tooltip="The lowest price the stock has dropped to during today's trading session"
              />
              <InfoItem
                icon={BarChart2} label="Volume"
                value={quote.volume != null ? formatNumber(quote.volume) : '—'}
                tooltip="The total number of shares traded today — high volume means high interest and liquidity"
              />
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="panel p-5">
        <div className="flex items-center gap-1 mb-4">
          {RANGES.map(r => (
            <button key={r} onClick={() => setRange(r)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                range === r ? 'bg-accent text-white' : 'text-terminal-muted hover:text-terminal-text hover:bg-white/5'
              }`}
            >{RANGE_LABELS[r]}</button>
          ))}
          <div className="ml-auto flex items-center gap-2 text-xs text-terminal-muted">
            <Clock size={12} />
            {quote?.marketState === 'REGULAR' ? (
              <span className="text-gain flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-gain animate-pulse" /> Market Open</span>
            ) : <span>Market Closed</span>}
          </div>
        </div>

        {error ? (
          <div className="h-[500px] flex items-center justify-center text-loss">
            <div className="text-center">
              <p className="font-medium">Error loading data</p>
              <p className="text-sm mt-1 text-terminal-muted">{error}</p>
              <button onClick={loadChart} className="mt-3 text-sm text-accent hover:underline">Try again</button>
            </div>
          </div>
        ) : chartLoading ? (
          <div className="h-[500px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-terminal-muted font-mono">Loading {symbol}...</p>
            </div>
          </div>
        ) : chartData ? (
          <Chart data={chartData} range={range} />
        ) : null}
      </div>

      {/* 52-Week Range */}
      {quote && quote.fiftyTwoWeekLow != null && quote.fiftyTwoWeekHigh != null && (
        <div className="panel p-5">
          <p className="text-xs text-terminal-muted uppercase tracking-wider mb-3">52-Week Range</p>
          <div className="flex items-center gap-4">
            <span className="font-mono text-sm text-loss">${formatPrice(quote.fiftyTwoWeekLow)}</span>
            <div className="flex-1 h-2.5 bg-terminal-border rounded-full relative">
              {(() => {
                const pct = Math.min(100, Math.max(0, ((quote.price - quote.fiftyTwoWeekLow) / (quote.fiftyTwoWeekHigh - quote.fiftyTwoWeekLow)) * 100))
                return (<>
                  <div className="absolute top-0 h-2.5 rounded-full bg-gradient-to-r from-loss via-yellow-500 to-gain" style={{ width: `${pct}%` }} />
                  <div className="absolute top-1/2 w-3.5 h-3.5 bg-white rounded-full border-2 border-accent shadow-lg" style={{ left: `${pct}%`, transform: 'translate(-50%, -50%)' }} />
                </>)
              })()}
            </div>
            <span className="font-mono text-sm text-gain">${formatPrice(quote.fiftyTwoWeekHigh)}</span>
          </div>
        </div>
      )}

      {/* Crypto */}
      <CryptoWatchlist onSelect={handleSelectTicker} activeSymbol={symbol} />
    </div>
  )
}

function CryptoWatchlist({ onSelect, activeSymbol }) {
  const { prices, watchSymbols } = usePrices()

  useEffect(() => {
    watchSymbols(CRYPTO_TICKERS.map(c => c.symbol))
  }, [watchSymbols])

  const hasCryptoData = CRYPTO_TICKERS.some(c => prices[c.symbol]?.price != null)

  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-terminal-muted flex items-center gap-2">
          <span className="text-yellow-500 text-lg">₿</span> Crypto Market
        </h3>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-gain animate-pulse" />
          <span className="text-[10px] text-terminal-muted font-mono">LIVE</span>
        </div>
      </div>

      {!hasCryptoData ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {CRYPTO_TICKERS.map(c => (
            <div key={c.symbol} className="bg-terminal-bg rounded-2xl p-4 animate-pulse">
              <div className="h-4 bg-terminal-border rounded w-20 mb-2" />
              <div className="h-6 bg-terminal-border rounded w-28 mb-1" />
              <div className="h-3 bg-terminal-border rounded w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {CRYPTO_TICKERS.map(crypto => {
            const data = prices[crypto.symbol]
            if (!data?.price) return (
              <div key={crypto.symbol} className="bg-terminal-bg rounded-2xl p-4 opacity-40">
                <p className="text-sm font-mono">{crypto.name}</p>
                <p className="text-xs text-terminal-muted">Loading...</p>
              </div>
            )
            const isUp = data.change >= 0
            const isActive = activeSymbol === crypto.symbol
            return (
              <button key={crypto.symbol} onClick={() => onSelect(crypto.symbol)}
                className={`bg-terminal-bg rounded-2xl p-4 text-left transition-all hover:bg-white/[0.03] group ${isActive ? 'ring-1 ring-accent/40 bg-accent/5' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{crypto.icon}</span>
                    <span className="text-xs text-terminal-muted group-hover:text-terminal-text transition-colors">{crypto.name}</span>
                  </div>
                  {isUp ? <TrendingUp size={14} className="text-gain" /> : <TrendingDown size={14} className="text-loss" />}
                </div>
                <p className="text-lg font-mono font-bold">${formatPrice(data.price)}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-lg ${isUp ? 'bg-gain/10 text-gain' : 'bg-loss/10 text-loss'}`}>
                    {formatPercent(data.changePercent)}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Info item with hover tooltip
function InfoItem({ icon: Icon, label, value, tooltip }) {
  const [showTip, setShowTip] = useState(false)

  return (
    <div className="relative flex items-center gap-2"
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
    >
      <Icon size={14} className="text-terminal-muted" />
      <div>
        <div className="flex items-center gap-1">
          <p className="text-xs text-terminal-muted">{label}</p>
          <Info size={10} className="text-terminal-muted/50" />
        </div>
        <p className="font-mono font-medium">{value}</p>
      </div>

      {/* Tooltip */}
      {showTip && tooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 px-3 py-2 bg-terminal-bg border border-terminal-border rounded-xl shadow-xl z-50">
          <p className="text-xs text-terminal-text leading-relaxed">{tooltip}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-terminal-bg border-r border-b border-terminal-border rotate-45 -mt-1" />
        </div>
      )}
    </div>
  )
}
