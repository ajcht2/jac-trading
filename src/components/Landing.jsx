import { useState, useEffect, useRef } from 'react'
import {
  ArrowRight, Bot, Trophy, Newspaper, Sparkles, Activity, Zap,
  Crown, Medal, Layers, Brain, Briefcase, PiggyBank, Calculator,
  Scale, BookOpen, FileText, Building2, DollarSign, GraduationCap,
  CheckCircle2, Youtube, BarChart3,
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
// M&A mocks
// ──────────────────────────────────────────────────────────
function MockLBO() {
  const [equityPct, setEquityPct] = useState(35)
  const [growth, setGrowth]       = useState(8)
  const [exitMult, setExitMult]   = useState(8.5)

  // simplified illustrative math:
  const entryEV = 500
  const entryEbitda = 70
  const entryMult = entryEV / entryEbitda
  const equity = entryEV * (equityPct / 100)
  const debt = entryEV - equity
  const years = 5
  const exitEbitda = entryEbitda * Math.pow(1 + growth / 100, years)
  const exitEV = exitEbitda * exitMult
  // crude debt paydown: 60% of cumulative EBITDA
  const totalEbitda = Array.from({ length: years }, (_, i) => entryEbitda * Math.pow(1 + growth / 100, i + 1)).reduce((a, b) => a + b, 0)
  const debtPaid = Math.min(debt, totalEbitda * 0.30)
  const exitDebt = Math.max(0, debt - debtPaid)
  const exitEquity = exitEV - exitDebt
  const moic = exitEquity / equity
  const irr = Math.pow(exitEquity / equity, 1 / years) - 1

  return (
    <div className="space-y-3">
      <p className="text-[10px] text-terminal-muted uppercase tracking-wider font-semibold">Sources</p>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-gain/5 border border-gain/20 rounded-lg px-3 py-2">
          <p className="text-terminal-muted">Sponsor Equity</p>
          <p className="font-mono font-bold text-gain">${equity.toFixed(0)}M ({equityPct}%)</p>
        </div>
        <div className="bg-loss/5 border border-loss/20 rounded-lg px-3 py-2">
          <p className="text-terminal-muted">Debt</p>
          <p className="font-mono font-bold text-loss">${debt.toFixed(0)}M ({100 - equityPct}%)</p>
        </div>
      </div>

      <div className="space-y-2 pt-1">
        <SliderRow label="Equity %"      value={equityPct} onChange={setEquityPct} min={20} max={60} step={1} unit="%" />
        <SliderRow label="EBITDA growth" value={growth}    onChange={setGrowth}    min={0}  max={20} step={1} unit="%" />
        <SliderRow label="Exit multiple" value={exitMult}  onChange={setExitMult}  min={4}  max={14} step={0.5} unit="×" />
      </div>

      <div className="pt-2 border-t border-terminal-border grid grid-cols-2 gap-2">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <p className="text-[10px] text-red-400 uppercase tracking-wider font-semibold">IRR (5y)</p>
          <p className="text-2xl font-mono font-bold text-red-400">{(irr * 100).toFixed(1)}%</p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
          <p className="text-[10px] text-yellow-400 uppercase tracking-wider font-semibold">MOIC</p>
          <p className="text-2xl font-mono font-bold text-yellow-400">{moic.toFixed(2)}×</p>
        </div>
      </div>
    </div>
  )
}

function SliderRow({ label, value, onChange, min, max, step, unit }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] mb-1">
        <span className="text-terminal-muted uppercase tracking-wider font-semibold">{label}</span>
        <span className="font-mono font-semibold">{value}{unit}</span>
      </div>
      <input
        type="range" value={value} min={min} max={max} step={step}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-accent h-1"
      />
    </div>
  )
}

function MockValuation() {
  const [revenue, setRevenue] = useState(50)
  const [ebitda, setEbitda]   = useState(8)
  const range = (a, b) => ({ low: a, high: b })
  const evRev = range(revenue * 4, revenue * 9)
  const evEb  = range(ebitda * 15, ebitda * 30)
  const dcf   = ebitda * 22

  const lo = Math.min(evRev.low, evEb.low, dcf)
  const hi = Math.max(evRev.high, evEb.high, dcf)

  return (
    <div className="space-y-3">
      <SliderRow label="Revenue (LTM)" value={revenue} onChange={setRevenue} min={5} max={500} step={5} unit="M$" />
      <SliderRow label="EBITDA (LTM)"  value={ebitda}  onChange={setEbitda}  min={1} max={100} step={1} unit="M$" />

      <div className="pt-2 border-t border-terminal-border space-y-2">
        <div className="bg-terminal-bg/60 rounded-lg p-3">
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="text-terminal-muted uppercase tracking-wider">EV / Revenue (SaaS comp)</span>
            <span className="text-terminal-muted">4×–9×</span>
          </div>
          <p className="font-mono font-semibold text-sm">${evRev.low.toFixed(0)}M – ${evRev.high.toFixed(0)}M</p>
        </div>
        <div className="bg-terminal-bg/60 rounded-lg p-3">
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="text-terminal-muted uppercase tracking-wider">EV / EBITDA (SaaS comp)</span>
            <span className="text-terminal-muted">15×–30×</span>
          </div>
          <p className="font-mono font-semibold text-sm">${evEb.low.toFixed(0)}M – ${evEb.high.toFixed(0)}M</p>
        </div>
        <div className="bg-gain/5 border border-gain/20 rounded-lg p-3">
          <p className="text-[10px] text-gain uppercase tracking-wider font-semibold">DCF (illustrative)</p>
          <p className="font-mono font-bold text-sm text-gain">${dcf.toFixed(0)}M</p>
        </div>
        <div className="rounded-lg p-3 border" style={{ borderColor: 'rgba(168,85,247,0.3)', background: 'rgba(168,85,247,0.08)' }}>
          <p className="text-[10px] text-purple-400 uppercase tracking-wider font-semibold">Football field range</p>
          <p className="font-mono font-bold text-lg text-purple-400">${lo.toFixed(0)}M – ${hi.toFixed(0)}M</p>
        </div>
      </div>
    </div>
  )
}

function MockDealMarketplace() {
  const deals = [
    { sector: 'SaaS', name: 'CloudCore Inc.',  rev: '$12M', ebitda: '$2.8M', loc: 'London',     mult: '5.5×' },
    { sector: 'E-Comm',  name: 'NorthShore DTC',  rev: '$28M', ebitda: '$3.2M', loc: 'Paris',      mult: '1.8×' },
    { sector: 'Dental',  name: 'BrightSmile Group',rev: '$6M',  ebitda: '$1.4M', loc: 'Manchester', mult: '7.0×' },
    { sector: 'Fintech', name: 'PayBridge Ltd.',   rev: '$18M', ebitda: '$4.1M', loc: 'Amsterdam',  mult: '12×' },
  ]
  return (
    <div className="space-y-2">
      <p className="text-[10px] text-terminal-muted uppercase tracking-wider font-semibold mb-1">Sample deal listings</p>
      {deals.map((d, i) => (
        <div key={i} className="bg-terminal-bg/40 rounded-lg px-3 py-2.5 hover:bg-terminal-bg/60 transition-colors cursor-pointer">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-400/15 text-purple-400 shrink-0">{d.sector}</span>
              <span className="text-xs font-semibold truncate">{d.name}</span>
            </div>
            <span className="text-[10px] font-mono text-yellow-400 shrink-0">{d.mult} EBITDA</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-terminal-muted font-mono">
            <span>Rev {d.rev}</span>
            <span>·</span>
            <span>EBITDA {d.ebitda}</span>
            <span>·</span>
            <span>{d.loc}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function MockLessons() {
  const lessons = [
    { icon: BookOpen,    title: 'Introduction to M&A',          tag: 'Fundamentals' },
    { icon: Layers,      title: 'Stock vs Asset deal',          tag: 'Fundamentals' },
    { icon: FileText,    title: 'The M&A Deal Process',         tag: 'Fundamentals' },
    { icon: Calculator,  title: 'DCF Valuation',                tag: 'Valuation'    },
    { icon: Scale,       title: 'Trading Comparables',          tag: 'Valuation'    },
    { icon: PiggyBank,   title: 'LBO Mechanics',                tag: 'Valuation'    },
    { icon: DollarSign,  title: 'Accretion / Dilution',         tag: 'Valuation'    },
  ]
  return (
    <div className="space-y-2">
      {lessons.map((l, i) => {
        const Icon = l.icon
        return (
          <div key={i} className="flex items-center gap-3 bg-terminal-bg/40 rounded-lg px-3 py-2 text-xs">
            <Icon size={14} className="text-accent shrink-0" />
            <span className="flex-1 truncate font-medium">{l.title}</span>
            <span className="text-[10px] text-terminal-muted shrink-0">{l.tag}</span>
          </div>
        )
      })}
    </div>
  )
}

function MockCourses() {
  const tracks = [
    {
      name: 'Trading & Markets',
      color: '#3b82f6',
      icon: BarChart3,
      courses: [
        { num: 1, title: 'Markets & Asset Classes',          lessons: 4 },
        { num: 2, title: 'Equity Fundamentals',              lessons: 4 },
        { num: 3, title: 'Technical Analysis',               lessons: 4 },
        { num: 4, title: 'Algo Trading & Risk',              lessons: 4 },
      ],
    },
    {
      name: 'M&A & Investment Banking',
      color: '#a855f7',
      icon: Briefcase,
      courses: [
        { num: 1, title: 'Corporate Finance Foundations',    lessons: 4 },
        { num: 2, title: 'Valuation Methods',                lessons: 4 },
        { num: 3, title: 'M&A Process & Structuring',        lessons: 4 },
        { num: 4, title: 'LBO & Private Equity',             lessons: 4 },
      ],
    },
  ]
  return (
    <div className="space-y-3">
      {tracks.map(t => {
        const Icon = t.icon
        return (
          <div key={t.name} className="space-y-2">
            <div className="flex items-center gap-2 pb-1">
              <Icon size={14} style={{ color: t.color }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: t.color }}>{t.name}</span>
            </div>
            <div className="space-y-1">
              {t.courses.map(c => (
                <div key={c.num} className="flex items-center gap-2 bg-terminal-bg/40 rounded-lg px-3 py-2 text-xs">
                  <span className="w-5 h-5 rounded flex items-center justify-center font-mono font-bold text-[10px] shrink-0"
                    style={{ backgroundColor: t.color + '20', color: t.color }}>{c.num}</span>
                  <span className="flex-1 truncate">{c.title}</span>
                  <span className="text-[10px] text-terminal-muted shrink-0">{c.lessons} lessons</span>
                </div>
              ))}
            </div>
          </div>
        )
      })}
      <div className="flex items-center gap-2 text-[10px] text-terminal-muted pt-2 border-t border-terminal-border">
        <Youtube size={11} />
        <span>Inspired by NYU Stern (Damodaran), Wharton, Yale, CFA, Wall Street Prep</span>
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

        {/* Hero — Investment Banking positioning, broader than M&A */}
        <section className="px-6 pt-12 pb-16 max-w-5xl mx-auto text-center space-y-7">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-[11px] font-semibold uppercase tracking-wider text-accent">
            <Briefcase size={12} /> Investment banking · Built for finance students
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05]">
            Everything an analyst<br />
            <span className="bg-gradient-to-r from-accent via-purple-400 to-gain bg-clip-text text-transparent">
              needs to know.
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-terminal-muted max-w-2xl mx-auto leading-relaxed">
            Eleven topics covering valuation, M&amp;A, leveraged finance, financial modeling, accounting, markets, deal process, interview prep, case studies, Excel and careers. Interactive tools where it makes sense, real sources throughout.
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 max-w-3xl mx-auto">
            <div><p className="text-2xl font-mono font-bold">11</p><p className="text-xs text-terminal-muted">IB topics</p></div>
            <div><p className="text-2xl font-mono font-bold">32</p><p className="text-xs text-terminal-muted">Lessons</p></div>
            <div><p className="text-2xl font-mono font-bold">2</p><p className="text-xs text-terminal-muted">Modeling tools</p></div>
            <div><p className="text-2xl font-mono font-bold">12+</p><p className="text-xs text-terminal-muted">Interview Qs</p></div>
          </div>
        </section>

        <LiveTicker />

        {/* Features — IB / Corporate Finance first */}
        <section id="features" className="px-6 py-20 max-w-6xl mx-auto space-y-24">
          <FeatureSection
            icon={PiggyBank}
            eyebrow="LBO model"
            accent="border-red-500/30 bg-red-500/10 text-red-400"
            title="Build a real leveraged buyout, slide by slide."
            copy="Adjust equity contribution, debt rate, EBITDA growth and exit multiple. The model recalculates sponsor IRR and MOIC live, with a value-creation bridge decomposing returns into multiple expansion, EBITDA growth and debt paydown — the way every sponsor presents an exit to its LPs."
          >
            <MockLBO />
          </FeatureSection>

          <FeatureSection
            reverse
            icon={Calculator}
            eyebrow="Valuation tool"
            accent="border-purple-400/30 bg-purple-400/10 text-purple-400"
            title="EV/EBITDA, EV/Revenue, DCF — one football field."
            copy="Pick a sector, plug in revenue and EBITDA, get an instant valuation range from trading comps and a simple DCF. The same output bankers put on the football-field slide of a pitch."
          >
            <MockValuation />
          </FeatureSection>

          <FeatureSection
            icon={Building2}
            eyebrow="Deal write-ups"
            accent="border-yellow-500/30 bg-yellow-500/10 text-yellow-500"
            title="Read M&A deals like an analyst would."
            copy="Curated acquisition targets and recently-announced deals presented the way they appear in CIMs and pitch decks — revenue, EBITDA, geography, asking multiple. The format you'll model against on a first-year desk."
          >
            <MockDealMarketplace />
          </FeatureSection>

          <FeatureSection
            reverse
            icon={BookOpen}
            eyebrow="M&A curriculum"
            accent="border-accent/30 bg-accent/10 text-accent"
            title="From accretion/dilution to LBO mechanics."
            copy="The four valuation pillars (DCF, trading comps, precedents, LBO), the full M&amp;A process (CIM → IOI → LOI → SPA → closing), synergies, deal structuring, and accretion/dilution with worked numbers. Written for students who want to walk into a banking interview prepared."
          >
            <MockLessons />
          </FeatureSection>

          <FeatureSection
            icon={GraduationCap}
            eyebrow="Full curriculum"
            accent="border-yellow-500/30 bg-yellow-500/10 text-yellow-500"
            title="8 courses, 32 lessons, real sources."
            copy="A structured corporate-finance and M&amp;A curriculum with learning objectives, formulas and worked examples on every lesson. Citations to NYU Stern (Damodaran), Wharton, Yale Open Courses, CFA readings, Wall Street Prep and Macabacus."
          >
            <MockCourses />
          </FeatureSection>

          {/* ─────────────────────────────────────────────────────
              Side project — engineering / markets simulator.
              The trading features below were built as an engineering
              side project and are kept here for completeness. They
              are NOT the focus of this site.
              ───────────────────────────────────────────────────── */}
          <div className="pt-12">
            <div className="max-w-3xl mx-auto text-center space-y-3 mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-terminal-border text-[11px] font-semibold uppercase tracking-wider text-terminal-muted">
                <Activity size={12} /> Side project · Engineering
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-terminal-text/80">
                Markets simulator
              </h2>
              <p className="text-sm text-terminal-muted leading-relaxed max-w-xl mx-auto">
                A simulator I built as an engineering project to learn full-stack development — real-time market data, a paper-trading sandbox and four backtested signal strategies. Useful for prototyping but not the centre of this site.
              </p>
            </div>
          </div>

          <FeatureSection
            reverse
            icon={Activity}
            eyebrow="Live market data"
            accent="border-terminal-border bg-white/[0.03] text-terminal-muted"
            title="Real-time charts via Yahoo Finance."
            copy="Pro-grade candlestick charts with OHLCV tooltips, multiple timeframes, 52-week range, and an equity / crypto watchlist that updates every few seconds. The engineering work behind it was the main learning objective."
          >
            <MockChart />
          </FeatureSection>

          <FeatureSection
            icon={Layers}
            eyebrow="Multi-account sandbox"
            accent="border-terminal-border bg-white/[0.03] text-terminal-muted"
            title="Three independent simulated accounts."
            copy="Three independent sandboxes, each with its own positions and P&amp;L. Strictly virtual — no money involved, no broker connectivity. Useful for testing portfolio construction logic."
          >
            <MockPortfolioSwitcher />
          </FeatureSection>

          <FeatureSection
            reverse
            icon={Brain}
            eyebrow="Signal backtests"
            accent="border-terminal-border bg-white/[0.03] text-terminal-muted"
            title="Four signals, one-year backtests."
            copy="Four well-known technical signals (SMA crossover, RSI, MACD, momentum) with 1-year backtests, win rate and alpha vs buy-and-hold. The implementation is the interesting part — clean event loop, no lookahead bias."
          >
            <MockBot />
          </FeatureSection>

          <FeatureSection
            icon={Trophy}
            eyebrow="Sandbox rankings"
            accent="border-terminal-border bg-white/[0.03] text-terminal-muted"
            title="Live ranking across simulated accounts."
            copy="A leaderboard across all simulator users. Strictly for fun within the engineering sandbox — not a competitive trading product."
          >
            <MockLeaderboard />
          </FeatureSection>

          {/* News kept at the bottom — neutral content */}
          <FeatureSection
            reverse
            icon={Newspaper}
            eyebrow="Curated news"
            accent="border-gain/30 bg-gain/10 text-gain"
            title="Headlines that move the markets."
            copy="Earnings, macro, deal announcements, sector moves — curated and tagged. Useful for keeping a running view on what's actually driving the comp set you're modeling."
          >
            <div className="space-y-2">
              {[
                { tag: 'M&A',      title: 'IBM agrees to acquire HashiCorp for $6.4B — multiple at 17× EBITDA', time: '2h' },
                { tag: 'EARNINGS', title: 'NVIDIA reports record Q4 — beats estimates by 18%',                  time: '3h' },
                { tag: 'MACRO',    title: 'Fed signals two rate cuts in 2026 amid cooling inflation',           time: '4h' },
                { tag: 'LEVFIN',   title: 'Carlyle prices $1.2B Term Loan B at SOFR+325, 99.5 OID',             time: '6h' },
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
              Start preparing for the desk.
            </h2>
            <p className="text-base text-terminal-muted max-w-xl mx-auto mb-7">
              Sign up in 30 seconds. Work through the M&amp;A curriculum, build your first LBO, walk through every valuation method.
            </p>
            <button
              onClick={onGetStarted}
              className="glow-cta inline-flex items-center justify-center gap-2 px-10 py-4 rounded-2xl bg-accent hover:bg-accent/90 text-white font-bold text-base transition-all"
            >
              Create free account <ArrowRight size={18} />
            </button>
            <p className="text-xs text-terminal-muted mt-5">For students aiming at IB, leveraged finance, equity research and corporate development.</p>
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
