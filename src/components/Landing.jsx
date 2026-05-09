import { useState, useEffect, useRef } from 'react'
import {
  ArrowRight, Bot, Trophy, Newspaper, Sparkles, Activity, Zap,
  Crown, Medal, Layers, Brain,
} from 'lucide-react'
import Logo from './Logo'

// ──────────────────────────────────────────────────────────
// Tiny live-ticker that fakes price drift so the page feels alive.
// ──────────────────────────────────────────────────────────
const TICKERS = [
  { sym: 'AAPL', price: 232.41, change: 1.34 },
  { sym: 'TSLA', price: 412.78, change: -2.12 },
  { sym: 'NVDA', price: 142.05, change: 0.87 },
  { sym: 'BTC',  price: 96420,   change: 3.21 },
  { sym: 'ETH',  price: 3284,    change: -1.05 },
  { sym: 'SOL',  price: 198.4,   change: 5.43 },
  { sym: 'MSFT', price: 422.18, change: 0.42 },
  { sym: 'GOOG', price: 187.92, change: 1.89 },
  { sym: 'META', price: 612.55, change: -0.78 },
  { sym: 'AMZN', price: 218.34, change: 2.11 },
]

function useLiveDrift(initial, volatility = 0.001) {
  const [v, setV] = useState(initial)
  useEffect(() => {
    const id = setInterval(() => {
      setV(prev => {
        const drift = (Math.random() - 0.5) * 2 * volatility * prev
        return prev + drift
      })
    }, 1500 + Math.random() * 1500)
    return () => clearInterval(id)
  }, [volatility])
  return v
}

function LiveTicker() {
  return (
    <div className="overflow-hidden border-y border-terminal-border bg-terminal-panel/40 backdrop-blur py-2.5 relative">
      <div className="flex gap-8 whitespace-nowrap animate-[scroll_45s_linear_infinite]">
        {[...TICKERS, ...TICKERS, ...TICKERS].map((t, i) => (
          <TickerItem key={i} sym={t.sym} basePrice={t.price} change={t.change} />
        ))}
      </div>
    </div>
  )
}

function TickerItem({ sym, basePrice, change }) {
  const livePrice = useLiveDrift(basePrice, 0.002)
  const positive = change >= 0
  return (
    <div className="flex items-center gap-2 text-xs font-mono">
      <span className="font-bold text-terminal-text">{sym}</span>
      <span className="text-terminal-muted">${livePrice.toFixed(2)}</span>
      <span className={positive ? 'text-gain' : 'text-loss'}>
        {positive ? '+' : ''}{change.toFixed(2)}%
      </span>
    </div>
  )
}

// ──────────────────────────────────────────────────────────
// Mock chart with a smoothly animated sparkline.
// ──────────────────────────────────────────────────────────
function MockChart() {
  const [points, setPoints] = useState(() => {
    const arr = []
    let p = 100
    for (let i = 0; i < 40; i++) {
      p += (Math.random() - 0.45) * 3
      arr.push(p)
    }
    return arr
  })

  useEffect(() => {
    const id = setInterval(() => {
      setPoints(prev => {
        const last = prev[prev.length - 1]
        const next = last + (Math.random() - 0.45) * 3
        return [...prev.slice(1), next]
      })
    }, 800)
    return () => clearInterval(id)
  }, [])

  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = max - min || 1
  const width = 100
  const height = 50
  const path = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * width
      const y = height - ((p - min) / range) * height
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')

  const last = points[points.length - 1]
  const first = points[0]
  const positive = last >= first
  const stroke = positive ? '#22c55e' : '#ef4444'
  const livePrice = 232.41 + (last - 100) * 1.5

  return (
    <div className="relative">
      <div className="flex items-baseline justify-between mb-2">
        <div>
          <p className="text-xs text-terminal-muted">AAPL · Apple Inc.</p>
          <p className="text-2xl font-bold font-mono">${livePrice.toFixed(2)}</p>
        </div>
        <div className={`text-xs font-mono px-2 py-1 rounded-md ${positive ? 'bg-gain/10 text-gain' : 'bg-loss/10 text-loss'}`}>
          {positive ? '▲' : '▼'} {(((last - first) / first) * 100).toFixed(2)}%
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full h-24">
        <defs>
          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.3" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${path} L ${width} ${height} L 0 ${height} Z`} fill="url(#chartFill)" />
        <path d={path} stroke={stroke} strokeWidth="0.8" fill="none" />
      </svg>
      <div className="grid grid-cols-3 gap-2 mt-3 text-[10px]">
        <div><p className="text-terminal-muted">Open</p><p className="font-mono">${(livePrice - 1.2).toFixed(2)}</p></div>
        <div><p className="text-terminal-muted">High</p><p className="font-mono">${(livePrice + 2.4).toFixed(2)}</p></div>
        <div><p className="text-terminal-muted">Vol</p><p className="font-mono">42.1M</p></div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────
// Animated number that ticks toward a moving target.
// ──────────────────────────────────────────────────────────
function AnimatedValue({ value, prefix = '', decimals = 2, className = '' }) {
  const [display, setDisplay] = useState(value)
  const targetRef = useRef(value)
  useEffect(() => { targetRef.current = value }, [value])
  useEffect(() => {
    const id = setInterval(() => {
      setDisplay(d => {
        const target = targetRef.current
        const diff = target - d
        if (Math.abs(diff) < 0.01) return target
        return d + diff * 0.15
      })
    }, 50)
    return () => clearInterval(id)
  }, [])
  return <span className={className}>{prefix}{display.toFixed(decimals)}</span>
}

// ──────────────────────────────────────────────────────────
// Mock portfolio with 3 switchable slots.
// ──────────────────────────────────────────────────────────
const MOCK_SLOTS = [
  {
    name: 'Tech Bets',
    cash: 12450,
    positions: [
      { sym: 'AAPL', qty: 100, avg: 198.20, price: 232.41 },
      { sym: 'NVDA', qty: 250, avg: 118.40, price: 142.05 },
      { sym: 'MSFT', qty: 80,  avg: 388.10, price: 422.18 },
    ],
  },
  {
    name: 'Crypto Mix',
    cash: 4280,
    positions: [
      { sym: 'BTC',  qty: 0.62, avg: 71200, price: 96420 },
      { sym: 'ETH',  qty: 8.5,  avg: 2980, price: 3284 },
      { sym: 'SOL',  qty: 90,   avg: 145, price: 198.4 },
    ],
  },
  {
    name: 'Conservative',
    cash: 38200,
    positions: [
      { sym: 'JNJ',  qty: 200, avg: 152.30, price: 158.92 },
      { sym: 'KO',   qty: 400, avg: 62.10, price: 64.45 },
    ],
  },
]

function MockPosition({ pos, onPriceChange }) {
  const live = useLiveDrift(pos.price, 0.001)
  useEffect(() => { onPriceChange?.(pos.sym, live) }, [live])
  const pp = (live - pos.avg) * pos.qty
  return (
    <div className="flex items-center justify-between bg-terminal-bg/40 rounded-lg px-3 py-2 text-xs">
      <span className="font-mono font-bold w-12">{pos.sym}</span>
      <span className="text-terminal-muted font-mono">{pos.qty}</span>
      <span className="font-mono">$<AnimatedValue value={live} decimals={2} /></span>
      <span className={`font-mono font-semibold ${pp >= 0 ? 'text-gain' : 'text-loss'}`}>
        {pp >= 0 ? '+' : ''}${pp.toFixed(2)}
      </span>
    </div>
  )
}

function MockPortfolioSwitcher() {
  const [active, setActive] = useState(0)
  const [livePrices, setLivePrices] = useState({})
  const slot = MOCK_SLOTS[active]

  // Reset live-price tracking when the user switches slots so we don't
  // carry stale symbols from the previous slot.
  useEffect(() => { setLivePrices({}) }, [active])

  const handlePriceChange = (sym, p) => {
    setLivePrices(prev => (prev[sym] === p ? prev : { ...prev, [sym]: p }))
  }

  const positionsValue = slot.positions.reduce(
    (s, p) => s + p.qty * (livePrices[p.sym] ?? p.price),
    0,
  )
  const totalCost = slot.positions.reduce((s, p) => s + p.qty * p.avg, 0)
  const equity = slot.cash + positionsValue
  const pnl = positionsValue - totalCost
  const pnlPct = (pnl / totalCost) * 100

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {MOCK_SLOTS.map((s, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              i === active
                ? 'bg-accent/20 text-accent border border-accent/40'
                : 'bg-terminal-bg/50 text-terminal-muted border border-terminal-border hover:text-terminal-text'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-terminal-bg/60 rounded-lg p-3">
          <p className="text-[10px] text-terminal-muted uppercase tracking-wider">Equity</p>
          <p className="text-lg font-mono font-bold mt-0.5">
            $<AnimatedValue value={equity} decimals={2} />
          </p>
        </div>
        <div className="bg-terminal-bg/60 rounded-lg p-3">
          <p className="text-[10px] text-terminal-muted uppercase tracking-wider">P&L</p>
          <p className={`text-lg font-mono font-bold mt-0.5 ${pnl >= 0 ? 'text-gain' : 'text-loss'}`}>
            {pnl >= 0 ? '+' : '-'}$<AnimatedValue value={Math.abs(pnl)} decimals={2} />
          </p>
          <p className={`text-[10px] font-mono ${pnl >= 0 ? 'text-gain' : 'text-loss'}`}>
            {pnl >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        {slot.positions.map(p => (
          <MockPosition key={`${active}-${p.sym}`} pos={p} onPriceChange={handlePriceChange} />
        ))}
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────
// Mock bot strategy picker.
// ──────────────────────────────────────────────────────────
const STRATS = [
  { key: 'sma',  name: 'SMA Crossover',     desc: 'Golden / death cross',           ret: 18.4, win: 62 },
  { key: 'rsi',  name: 'RSI Mean Reversion',desc: 'Oversold / overbought',          ret: 11.2, win: 58 },
  { key: 'macd', name: 'MACD Signal',       desc: 'Momentum-based',                 ret: 14.7, win: 60 },
  { key: 'mom',  name: 'Momentum',          desc: 'Trend persistence',              ret: 22.1, win: 54 },
]

function MockBot() {
  const [active, setActive] = useState(0)
  const s = STRATS[active]
  const driftedReturn = useLiveDrift(s.ret, 0.005)

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {STRATS.map((strat, i) => (
          <button
            key={strat.key}
            onClick={() => setActive(i)}
            className={`text-left px-3 py-2.5 rounded-lg border transition-all ${
              i === active
                ? 'border-purple-400/60 bg-purple-400/10'
                : 'border-terminal-border bg-terminal-bg/40 hover:border-purple-400/30'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Bot size={11} className={i === active ? 'text-purple-400' : 'text-terminal-muted'} />
              <p className="text-xs font-semibold">{strat.name}</p>
            </div>
            <p className="text-[10px] text-terminal-muted mt-0.5">{strat.desc}</p>
          </button>
        ))}
      </div>
      <div className="bg-purple-400/5 border border-purple-400/20 rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-terminal-muted uppercase tracking-wider">Backtest · 1Y</span>
          <span className="flex items-center gap-1 text-[10px] text-purple-400">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            Running
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-[10px] text-terminal-muted">Return</p>
            <p className="text-base font-mono font-bold text-gain">
              +<AnimatedValue value={driftedReturn} decimals={1} />%
            </p>
          </div>
          <div>
            <p className="text-[10px] text-terminal-muted">Win Rate</p>
            <p className="text-base font-mono font-bold">{s.win}%</p>
          </div>
          <div>
            <p className="text-[10px] text-terminal-muted">Trades</p>
            <p className="text-base font-mono font-bold">42</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────
// Mock leaderboard.
// ──────────────────────────────────────────────────────────
const MOCK_LB = [
  { rank: 1, name: 'Sophie L.',  slot: 'Tech Bets',    eq: 142850, pnl: 42850 },
  { rank: 2, name: 'Marcus K.',  slot: 'Crypto Mix',   eq: 128400, pnl: 28400 },
  { rank: 3, name: 'Antoine C.', slot: 'Main',         eq: 119200, pnl: 19200 },
  { rank: 4, name: 'Jade R.',    slot: 'Aggressive',   eq: 112500, pnl: 12500 },
  { rank: 5, name: 'Tom B.',     slot: 'Long-term',    eq: 108900, pnl: 8900 },
]

function MockLeaderboardRow({ p }) {
  const eq = useLiveDrift(p.eq, 0.0008)
  const pnl = eq - 100000
  const RankIcon = p.rank === 1 ? Crown : p.rank === 2 || p.rank === 3 ? Medal : null
  const rankColor = p.rank === 1 ? '#f59e0b' : p.rank === 2 ? '#94a3b8' : p.rank === 3 ? '#cd7f32' : null
  return (
    <div className="flex items-center gap-3 bg-terminal-bg/40 rounded-lg px-3 py-2">
      <span className="w-6 text-center font-mono font-bold" style={rankColor ? { color: rankColor } : { color: '#64748b' }}>
        #{p.rank}
      </span>
      {RankIcon && <RankIcon size={12} style={{ color: rankColor }} />}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate">{p.name}</p>
        <p className="text-[10px] text-terminal-muted truncate">{p.slot}</p>
      </div>
      <div className="text-right">
        <p className="text-xs font-mono font-bold">$<AnimatedValue value={eq} decimals={0} /></p>
        <p className={`text-[10px] font-mono ${pnl >= 0 ? 'text-gain' : 'text-loss'}`}>
          {pnl >= 0 ? '+' : ''}${pnl.toFixed(0)}
        </p>
      </div>
    </div>
  )
}

function MockLeaderboard() {
  return (
    <div className="space-y-2">
      {MOCK_LB.map(p => <MockLeaderboardRow key={p.rank} p={p} />)}
    </div>
  )
}

// ──────────────────────────────────────────────────────────
// Section wrapper used for each feature row.
// ──────────────────────────────────────────────────────────
function FeatureSection({ icon: Icon, eyebrow, title, copy, accent, reverse, children }) {
  return (
    <div className={`grid lg:grid-cols-2 gap-10 items-center ${reverse ? 'lg:[&>*:first-child]:order-2' : ''}`}>
      <div className="space-y-4">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-semibold uppercase tracking-wider ${accent}`}>
          <Icon size={12} /> {eyebrow}
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold leading-tight">{title}</h2>
        <p className="text-base text-terminal-muted leading-relaxed">{copy}</p>
      </div>
      <div className="bg-terminal-panel/80 backdrop-blur border border-terminal-border rounded-2xl p-5 shadow-2xl">
        {children}
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────
// Page.
// ──────────────────────────────────────────────────────────
export default function Landing({ onGetStarted }) {
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <div className="fixed inset-0 z-0" style={{
        backgroundImage: 'linear-gradient(rgba(11,14,20,0.85), rgba(11,14,20,0.92)), url(/city-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }} />

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(56,189,248,0.3); }
          50%      { box-shadow: 0 0 40px rgba(56,189,248,0.6); }
        }
        .glow-cta { animation: glow 2.4s ease-in-out infinite; }
      `}</style>

      <div className="relative z-10">
        {/* Top nav */}
        <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <Logo size="sm" />
          <button
            onClick={onGetStarted}
            className="px-4 py-2 rounded-xl bg-accent/10 hover:bg-accent/20 text-accent text-sm font-semibold transition-all border border-accent/30"
          >
            Sign in
          </button>
        </nav>

        {/* Hero */}
        <section className="px-6 pt-12 pb-16 max-w-5xl mx-auto text-center space-y-7">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-[11px] font-semibold uppercase tracking-wider text-accent">
            <Sparkles size={12} /> Free · No credit card · Real markets
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05]">
            Trade real markets.<br />
            <span className="bg-gradient-to-r from-accent via-purple-400 to-gain bg-clip-text text-transparent">
              Risk zero dollars.
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-terminal-muted max-w-2xl mx-auto leading-relaxed">
            $100,000 of virtual cash. Live prices on stocks &amp; crypto. Algorithmic bots, multi-portfolio strategies, and a global leaderboard — all in one terminal-grade dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={onGetStarted}
              className="glow-cta inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-accent hover:bg-accent/90 text-white font-bold text-base transition-all"
            >
              Get started — it's free <ArrowRight size={18} />
            </button>
            <a
              href="#features"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-terminal-border hover:border-accent/40 text-terminal-text font-semibold text-base transition-all"
            >
              See what's inside
            </a>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-6 max-w-2xl mx-auto">
            <div><p className="text-2xl font-mono font-bold">$100K</p><p className="text-xs text-terminal-muted">Virtual cash</p></div>
            <div><p className="text-2xl font-mono font-bold">3</p><p className="text-xs text-terminal-muted">Portfolios</p></div>
            <div><p className="text-2xl font-mono font-bold">4</p><p className="text-xs text-terminal-muted">Algo strategies</p></div>
          </div>
        </section>

        <LiveTicker />

        {/* Features */}
        <section id="features" className="px-6 py-20 max-w-6xl mx-auto space-y-24">
          <FeatureSection
            icon={Activity}
            eyebrow="Live market data"
            accent="border-accent/30 bg-accent/10 text-accent"
            title="Pro-grade charts. Updated every few seconds."
            copy="Real-time stock and crypto prices via Yahoo Finance. Candlestick charts with OHLCV tooltips, multiple timeframes, 52-week range, and a crypto watchlist that ticks live."
          >
            <MockChart />
          </FeatureSection>

          <FeatureSection
            reverse
            icon={Layers}
            eyebrow="Up to 3 portfolios"
            accent="border-purple-400/30 bg-purple-400/10 text-purple-400"
            title="Run three strategies at once."
            copy="Keep a tech portfolio, a crypto portfolio, and a defensive one — side by side. Each gets its own $100K, its own positions, its own P&L. Switch instantly."
          >
            <MockPortfolioSwitcher />
          </FeatureSection>

          <FeatureSection
            icon={Brain}
            eyebrow="Algorithmic bots"
            accent="border-purple-400/30 bg-purple-400/10 text-purple-400"
            title="Deploy bots. Backtest in seconds."
            copy="Four battle-tested strategies (SMA Crossover, RSI Mean Reversion, MACD, Momentum) with full 1-year backtests, win rate, alpha vs buy-and-hold, and one-click deployment to your portfolio."
          >
            <MockBot />
          </FeatureSection>

          <FeatureSection
            reverse
            icon={Trophy}
            eyebrow="Live leaderboard"
            accent="border-yellow-500/30 bg-yellow-500/10 text-yellow-500"
            title="Compete. Climb. Inspect every trade."
            copy="See exactly how your friends are beating the market. Click anyone to view their open positions and full trade history. Your rank updates in real time as prices move."
          >
            <MockLeaderboard />
          </FeatureSection>

          <FeatureSection
            icon={Newspaper}
            eyebrow="Curated news"
            accent="border-gain/30 bg-gain/10 text-gain"
            title="Market news that actually matters."
            copy="A curated feed of the headlines moving the markets right now — earnings, macro, crypto, big-tech. Click through to the source."
          >
            <div className="space-y-2">
              {[
                { tag: 'EARNINGS', title: 'NVIDIA reports record Q4 — beats estimates by 18%', time: '2h' },
                { tag: 'MACRO',    title: 'Fed signals two rate cuts in 2026 amid cooling inflation', time: '4h' },
                { tag: 'CRYPTO',   title: 'Bitcoin breaches $96K as ETF inflows hit new record', time: '6h' },
                { tag: 'TECH',     title: 'Apple unveils new AI chip — supply chain ramps up', time: '8h' },
              ].map((n, i) => (
                <div key={i} className="bg-terminal-bg/40 rounded-lg px-3 py-2.5 hover:bg-terminal-bg/60 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-accent uppercase tracking-wider">{n.tag}</span>
                    <span className="text-[10px] text-terminal-muted">· {n.time} ago</span>
                  </div>
                  <p className="text-xs leading-snug">{n.title}</p>
                </div>
              ))}
            </div>
          </FeatureSection>
        </section>

        {/* Final CTA */}
        <section className="px-6 py-20 max-w-4xl mx-auto text-center space-y-6">
          <div className="bg-gradient-to-br from-accent/10 via-purple-400/5 to-gain/10 border border-accent/20 rounded-3xl p-10 sm:p-14 backdrop-blur">
            <Zap size={36} className="text-accent mx-auto mb-4" />
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight mb-3">
              Ready to start trading?
            </h2>
            <p className="text-base text-terminal-muted max-w-xl mx-auto mb-7">
              Sign up in 30 seconds. Get $100,000 in virtual cash. Trade real markets without risking a cent.
            </p>
            <button
              onClick={onGetStarted}
              className="glow-cta inline-flex items-center justify-center gap-2 px-10 py-4 rounded-2xl bg-accent hover:bg-accent/90 text-white font-bold text-base transition-all"
            >
              Create free account <ArrowRight size={18} />
            </button>
            <p className="text-xs text-terminal-muted mt-5">Virtual trading only — no real money involved.</p>
          </div>
        </section>

        <footer className="px-6 py-8 max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-terminal-border">
          <div className="flex items-center gap-3">
            <Logo size="xs" />
            <span className="text-xs text-terminal-muted">· Built at the University of Warwick</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-terminal-muted">
            <button onClick={onGetStarted} className="hover:text-accent transition-colors">Sign in</button>
            <button onClick={onGetStarted} className="hover:text-accent transition-colors">Sign up</button>
          </div>
        </footer>
      </div>
    </div>
  )
}
