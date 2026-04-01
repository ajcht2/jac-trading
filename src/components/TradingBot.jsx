import { useState, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bot, Play, Square, Settings, TrendingUp, TrendingDown, BarChart2, Zap, AlertTriangle, BookOpen, Radio, History, Clock } from 'lucide-react'
import { usePortfolio } from '../context/PortfolioContext'
import { useBot } from '../context/BotContext'
import { fetchChart, formatPrice, formatPercent } from '../services/api'
import SymbolInput from './SymbolInput'

const STRATEGIES = {
  sma_crossover: {
    name: 'Moving Average Crossover',
    description: 'Buy when short SMA crosses above long SMA, sell on death cross.',
    params: [
      { key: 'shortPeriod', label: 'Short SMA Period', default: 10, min: 2, max: 50 },
      { key: 'longPeriod', label: 'Long SMA Period', default: 30, min: 10, max: 200 },
    ],
  },
  rsi: {
    name: 'RSI Mean Reversion',
    description: 'Buy when RSI drops below oversold, sell when overbought.',
    params: [
      { key: 'period', label: 'RSI Period', default: 14, min: 2, max: 50 },
      { key: 'oversold', label: 'Oversold Level', default: 30, min: 10, max: 40 },
      { key: 'overbought', label: 'Overbought Level', default: 70, min: 60, max: 90 },
    ],
  },
  macd: {
    name: 'MACD Signal',
    description: 'Buy when MACD crosses above signal line, sell on crossunder.',
    params: [
      { key: 'fastPeriod', label: 'Fast EMA', default: 12, min: 2, max: 50 },
      { key: 'slowPeriod', label: 'Slow EMA', default: 26, min: 10, max: 100 },
      { key: 'signalPeriod', label: 'Signal Period', default: 9, min: 2, max: 30 },
    ],
  },
  momentum: {
    name: 'Momentum Strategy',
    description: 'Buy when return over lookback exceeds threshold, sell when it drops below.',
    params: [
      { key: 'lookback', label: 'Lookback Period (days)', default: 20, min: 5, max: 60 },
      { key: 'buyThreshold', label: 'Buy Threshold (%)', default: 5, min: 1, max: 20 },
      { key: 'sellThreshold', label: 'Sell Threshold (%)', default: -3, min: -15, max: 0 },
    ],
  },
}

// ── Backtest Indicators ──────────────────────────────
function calcSMA(d, p) { const r = []; for (let i = 0; i < d.length; i++) { if (i < p - 1) { r.push(null); continue } let s = 0; for (let j = i - p + 1; j <= i; j++) s += d[j]; r.push(s / p) } return r }
function calcEMA(d, p) { const r = [], m = 2 / (p + 1); for (let i = 0; i < d.length; i++) { if (i === 0) { r.push(d[i]); continue } r.push((d[i] - r[i - 1]) * m + r[i - 1]) } return r }
function calcRSI(c, p) { const r = new Array(c.length).fill(null); if (c.length < p + 1) return r; let gS = 0, lS = 0; for (let i = 1; i <= p; i++) { const ch = c[i] - c[i-1]; if (ch > 0) gS += ch; else lS += Math.abs(ch) } let aG = gS / p, aL = lS / p; r[p] = aL === 0 ? 100 : 100 - (100 / (1 + aG / aL)); for (let i = p + 1; i < c.length; i++) { const ch = c[i] - c[i-1]; aG = (aG * (p - 1) + (ch > 0 ? ch : 0)) / p; aL = (aL * (p - 1) + (ch < 0 ? Math.abs(ch) : 0)) / p; r[i] = aL === 0 ? 100 : 100 - (100 / (1 + aG / aL)) } return r }

function runBacktest(candles, strategy, params, capital) {
  try {
    const closes = candles.map(c => c.close)
    const trades = []
    let pos = null, cash = capital
    const signals = new Array(closes.length).fill(0)

    if (strategy === 'sma_crossover') {
      const s = calcSMA(closes, params.shortPeriod), l = calcSMA(closes, params.longPeriod)
      for (let i = 1; i < closes.length; i++) { if (s[i]==null||l[i]==null||s[i-1]==null||l[i-1]==null) continue; if (s[i]>l[i]&&s[i-1]<=l[i-1]) signals[i]=1; if (s[i]<l[i]&&s[i-1]>=l[i-1]) signals[i]=-1 }
    } else if (strategy === 'rsi') {
      const r = calcRSI(closes, params.period)
      for (let i = 1; i < closes.length; i++) { if (r[i]==null||r[i-1]==null) continue; if (r[i]<=params.oversold&&r[i-1]>params.oversold) signals[i]=1; if (r[i]>=params.overbought&&r[i-1]<params.overbought) signals[i]=-1 }
    } else if (strategy === 'macd') {
      const f = calcEMA(closes, params.fastPeriod), sl = calcEMA(closes, params.slowPeriod), ml = f.map((v,j) => v-sl[j]), sg = calcEMA(ml, params.signalPeriod)
      for (let i = 1; i < closes.length; i++) { if (ml[i]>sg[i]&&ml[i-1]<=sg[i-1]) signals[i]=1; if (ml[i]<sg[i]&&ml[i-1]>=sg[i-1]) signals[i]=-1 }
    } else if (strategy === 'momentum') {
      for (let i = params.lookback; i < closes.length; i++) { const ret = ((closes[i]-closes[i-params.lookback])/closes[i-params.lookback])*100; if (ret>=params.buyThreshold) signals[i]=1; if (ret<=params.sellThreshold) signals[i]=-1 }
    }

    for (let i = 0; i < candles.length; i++) {
      const p = closes[i], sig = signals[i]
      if (sig === 1 && !pos) { const q = Math.floor(cash / p); if (q > 0) { pos = { qty: q, ep: p }; cash -= q * p; trades.push({ type: 'BUY', price: p, qty: q, date: new Date(candles[i].time * 1000).toISOString() }) } }
      else if (sig === -1 && pos) { cash += pos.qty * p; trades.push({ type: 'SELL', price: p, qty: pos.qty, pnl: (p - pos.ep) * pos.qty, date: new Date(candles[i].time * 1000).toISOString() }); pos = null }
    }

    const finalEquity = cash + (pos ? pos.qty * closes[closes.length - 1] : 0)
    const totalReturn = ((finalEquity - capital) / capital) * 100
    const buyAndHold = ((closes[closes.length - 1] - closes[0]) / closes[0]) * 100
    const sellTrades = trades.filter(t => t.type === 'SELL')

    return {
      trades,
      stats: {
        finalEquity, totalReturn, buyAndHold,
        totalTrades: sellTrades.length,
        winningTrades: sellTrades.filter(t => t.pnl > 0).length,
        losingTrades: sellTrades.filter(t => t.pnl <= 0).length,
        winRate: sellTrades.length > 0 ? (sellTrades.filter(t => t.pnl > 0).length / sellTrades.length) * 100 : 0,
      },
    }
  } catch (e) {
    console.error('Backtest error:', e)
    return null
  }
}

// ── Main Component ──────────────────────────────
export default function TradingBot() {
  const { state } = usePortfolio()
  const bot = useBot()

  const [mode, setMode] = useState('live')
  const [strategy, setStrategy] = useState('sma_crossover')
  const [symbol, setSymbol] = useState('AAPL')
  const [params, setParams] = useState(
    Object.fromEntries(STRATEGIES.sma_crossover.params.map(p => [p.key, p.default]))
  )
  const [btResult, setBtResult] = useState(null)
  const [btLoading, setBtLoading] = useState(false)
  const [error, setError] = useState('')

  // Sync with active bot config
  useEffect(() => {
    if (bot.botActive && bot.botConfig) {
      setStrategy(bot.botConfig.strategy)
      setSymbol(bot.botConfig.symbol)
      setParams(bot.botConfig.params)
    }
  }, [])

  const handleStrategyChange = (key) => {
    if (bot.botActive) return
    setStrategy(key)
    setParams(Object.fromEntries(STRATEGIES[key].params.map(p => [p.key, p.default])))
    setBtResult(null)
  }

  const handleStartBot = () => {
    if (!symbol.trim()) { setError('Select a symbol'); return }
    setError('')
    bot.startBot({ strategy, symbol: symbol.toUpperCase(), params })
  }

  const handleBacktest = useCallback(async () => {
    setBtLoading(true)
    setError('')
    setBtResult(null)
    try {
      const chart = await fetchChart(symbol.toUpperCase(), '1y', '1d')
      if (!chart.candles || chart.candles.length < 30) {
        setError('Not enough data for this symbol')
        setBtLoading(false)
        return
      }
      const result = runBacktest(chart.candles, strategy, params, state.cash)
      setBtResult(result)
    } catch (err) {
      setError(err.message || 'Backtest failed')
    }
    setBtLoading(false)
  }, [symbol, strategy, params, state.cash])

  const strat = STRATEGIES[strategy]
  if (!strat) return null

  return (
    <div className="space-y-4 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Bot size={22} className="text-accent" /> Trading Bot
        </h1>
        <Link to="/strategies" className="flex items-center gap-2 px-3 py-2 rounded-xl bg-terminal-panel border border-terminal-border text-sm text-terminal-muted hover:text-accent hover:border-accent/30 transition-all">
          <BookOpen size={14} /> How do these strategies work?
        </Link>
      </div>

      {/* Mode Toggle */}
      <div className="flex rounded-xl overflow-hidden border border-terminal-border w-fit">
        <button onClick={() => setMode('live')}
          className={`px-5 py-2.5 text-sm font-semibold transition-all flex items-center gap-2 ${mode === 'live' ? 'bg-accent/20 text-accent' : 'text-terminal-muted hover:text-terminal-text'}`}
        ><Radio size={16} /> Live Bot</button>
        <button onClick={() => setMode('backtest')}
          className={`px-5 py-2.5 text-sm font-semibold transition-all flex items-center gap-2 ${mode === 'backtest' ? 'bg-accent/20 text-accent' : 'text-terminal-muted hover:text-terminal-text'}`}
        ><History size={16} /> Backtest</button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Left: Config */}
        <div className="xl:col-span-1 space-y-4">
          {/* Strategy */}
          <div className="panel p-5 space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-terminal-muted flex items-center gap-2">
              <Settings size={14} /> Strategy
            </h3>
            <div className="space-y-2">
              {Object.entries(STRATEGIES).map(([key, s]) => (
                <button key={key} onClick={() => handleStrategyChange(key)} disabled={bot.botActive}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all text-sm ${
                    strategy === key ? 'bg-accent/10 border border-accent/30 text-accent' : 'bg-terminal-bg border border-terminal-border text-terminal-muted hover:text-terminal-text'
                  } ${bot.botActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="font-semibold">{s.name}</div>
                  <div className="text-xs mt-0.5 opacity-70">{s.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Parameters */}
          <div className="panel p-5 space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-terminal-muted flex items-center gap-2">
              <Zap size={14} /> Parameters
            </h3>
            <div>
              <label className="text-xs text-terminal-muted uppercase tracking-wider mb-1 block">Symbol</label>
              <SymbolInput value={symbol} onChange={(s) => { if (!bot.botActive) setSymbol(s) }} placeholder="Search stock..." />
              {bot.botActive && <p className="text-[10px] text-terminal-muted mt-1">Stop bot to change</p>}
            </div>
            {strat.params.map(p => (
              <div key={p.key}>
                <div className="flex justify-between">
                  <label className="text-xs text-terminal-muted uppercase tracking-wider">{p.label}</label>
                  <span className="text-xs font-mono text-accent">{params[p.key]}</span>
                </div>
                <input type="range" min={p.min} max={p.max} value={params[p.key]} disabled={bot.botActive}
                  onChange={e => setParams(prev => ({ ...prev, [p.key]: Number(e.target.value) }))}
                  className="w-full mt-1 accent-accent disabled:opacity-50"
                />
              </div>
            ))}

            {error && (
              <p className="text-xs text-loss bg-loss/10 rounded-xl p-2 flex items-center gap-1">
                <AlertTriangle size={12} /> {error}
              </p>
            )}

            {/* Action Button */}
            {mode === 'live' ? (
              bot.botActive ? (
                <button onClick={bot.stopBot} className="w-full py-3 rounded-xl bg-loss hover:bg-loss/90 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2">
                  <Square size={16} /> Stop Bot
                </button>
              ) : (
                <button onClick={handleStartBot} className="w-full py-3 rounded-xl bg-gain hover:bg-gain/90 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2">
                  <Play size={16} /> Start Live Bot
                </button>
              )
            ) : (
              <button onClick={handleBacktest} disabled={btLoading} className="w-full py-3 rounded-xl bg-accent hover:bg-accent/90 text-white font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {btLoading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Running...</>
                ) : (
                  <><Play size={16} /> Run Backtest (1Y)</>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Right: Results */}
        <div className="xl:col-span-2 space-y-4">
          {mode === 'live' ? (
            <LiveBotResults />
          ) : (
            <BacktestResults result={btResult} cash={state.cash} />
          )}
        </div>
      </div>
    </div>
  )
}

// ── Live Bot Results ──────────────────────────────
function LiveBotResults() {
  const { botActive, botConfig, botLog, botStatus, lastCheck, checksCount, CHECK_INTERVAL } = useBot()
  const [countdown, setCountdown] = useState(CHECK_INTERVAL / 1000)

  useEffect(() => {
    if (!botActive) return
    setCountdown(CHECK_INTERVAL / 1000)
    const t = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000)
    return () => clearInterval(t)
  }, [lastCheck, botActive, CHECK_INTERVAL])

  if (!botActive && botLog.length === 0) {
    return (
      <div className="panel p-12 flex flex-col items-center justify-center text-terminal-muted min-h-[400px]">
        <Bot size={48} className="mb-4 opacity-20" />
        <p className="text-sm font-medium">Configure your strategy and start the live bot</p>
        <p className="text-xs mt-2 opacity-70 text-center max-w-sm">
          The bot checks for signals every 30s and trades automatically. It keeps running even if you navigate to other pages.
        </p>
      </div>
    )
  }

  const trades = botLog.filter(l => l.executed)
  const stratName = botConfig ? (STRATEGIES[botConfig.strategy]?.name || botConfig.strategy) : ''

  return (
    <>
      {/* Status */}
      <div className={`panel p-5 ${botActive ? 'border-accent/30' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {botActive && <span className="w-3 h-3 rounded-full bg-gain animate-pulse" />}
            <div>
              <h3 className="font-semibold text-sm">
                {botActive ? 'Bot Active' : 'Bot Stopped'} — {stratName} on {botConfig?.symbol || ''}
              </h3>
              <p className={`text-xs mt-0.5 ${
                botStatus === 'traded' ? 'text-gain' : botStatus === 'checking' ? 'text-yellow-400' : botStatus === 'running' ? 'text-accent' : 'text-terminal-muted'
              }`}>
                {botStatus === 'idle' ? 'Stopped' : botStatus === 'running' ? 'Monitoring' : botStatus === 'checking' ? 'Analyzing...' : 'Trade Executed!'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-terminal-muted font-mono">{checksCount} checks</p>
            {botActive && (
              <p className="text-xs text-terminal-muted font-mono flex items-center gap-1 mt-0.5">
                <Clock size={10} /> Next in {countdown}s
              </p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-terminal-bg rounded-xl p-3 text-center">
            <p className="text-xs text-terminal-muted">Trades</p>
            <p className="text-xl font-mono font-bold text-accent mt-1">{trades.length}</p>
          </div>
          <div className="bg-terminal-bg rounded-xl p-3 text-center">
            <p className="text-xs text-terminal-muted">Signals</p>
            <p className="text-xl font-mono font-bold mt-1">{botLog.filter(s => s.signal !== 'HOLD' && s.signal !== 'ERROR').length}</p>
          </div>
          <div className="bg-terminal-bg rounded-xl p-3 text-center">
            <p className="text-xs text-terminal-muted">Holds</p>
            <p className="text-xl font-mono font-bold mt-1">{botLog.filter(s => s.signal === 'HOLD').length}</p>
          </div>
        </div>
      </div>

      {/* Log */}
      {botLog.length > 0 && (
        <div className="panel p-5">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-terminal-muted mb-3 flex items-center gap-2">
            <History size={14} /> Activity Log
          </h3>
          <div className="max-h-[350px] overflow-y-auto space-y-1.5">
            {botLog.map((e, i) => (
              <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm ${
                e.executed ? 'bg-accent/5 border border-accent/20' : e.signal === 'ERROR' ? 'bg-loss/5' : 'bg-terminal-bg'
              }`}>
                <span className="text-xs font-mono text-terminal-muted w-20 shrink-0">{e.timeStr}</span>
                <span className={`text-xs font-semibold w-12 shrink-0 ${
                  e.signal === 'BUY' ? 'text-gain' : e.signal === 'SELL' ? 'text-loss' : e.signal === 'ERROR' ? 'text-loss' : 'text-terminal-muted'
                }`}>{e.signal}</span>
                {e.price > 0 && <span className="font-mono text-xs">${formatPrice(e.price)}</span>}
                {e.executed && <span className="text-xs text-accent font-medium ml-auto">{e.action}</span>}
                {e.signal === 'ERROR' && <span className="text-xs text-loss ml-auto">{e.action}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

// ── Backtest Results ──────────────────────────────
function BacktestResults({ result, cash }) {
  if (!result) {
    return (
      <div className="panel p-12 flex flex-col items-center justify-center text-terminal-muted min-h-[400px]">
        <BarChart2 size={48} className="mb-4 opacity-20" />
        <p className="text-sm font-medium">Run a backtest to simulate 1 year of trades</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Return" value={formatPercent(result.stats.totalReturn)} color={result.stats.totalReturn >= 0 ? 'gain' : 'loss'} />
        <StatCard label="Buy & Hold" value={formatPercent(result.stats.buyAndHold)} color={result.stats.buyAndHold >= 0 ? 'gain' : 'loss'} />
        <StatCard label="Win Rate" value={result.stats.winRate.toFixed(0) + '%'} color="accent" />
        <StatCard label="Trades" value={String(result.stats.totalTrades)} color="accent" />
      </div>

      <div className="panel p-5">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-terminal-muted">Starting</span>
            <span className="font-mono">${formatPrice(cash)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-terminal-muted">Final</span>
            <span className="font-mono font-semibold">${formatPrice(result.stats.finalEquity)}</span>
          </div>
          <div className="flex justify-between col-span-2">
            <span className="text-terminal-muted">Alpha vs Buy & Hold</span>
            <span className={`font-mono font-semibold ${result.stats.totalReturn - result.stats.buyAndHold >= 0 ? 'text-gain' : 'text-loss'}`}>
              {formatPercent(result.stats.totalReturn - result.stats.buyAndHold)}
            </span>
          </div>
        </div>
      </div>

      {result.trades.length > 0 && (
        <div className="panel p-5">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-terminal-muted mb-3">Trade Log</h3>
          <div className="overflow-x-auto max-h-[250px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-terminal-panel">
                <tr className="text-xs text-terminal-muted uppercase border-b border-terminal-border">
                  <th className="text-left py-2 px-2">Date</th>
                  <th className="text-left py-2 px-2">Type</th>
                  <th className="text-right py-2 px-2">Price</th>
                  <th className="text-right py-2 px-2">Qty</th>
                  <th className="text-right py-2 px-2">P&L</th>
                </tr>
              </thead>
              <tbody>
                {result.trades.map((t, i) => (
                  <tr key={i} className="border-b border-terminal-border/50">
                    <td className="py-2 px-2 font-mono text-xs text-terminal-muted">
                      {new Date(t.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </td>
                    <td className="py-2 px-2">
                      <span className={`text-xs font-semibold flex items-center gap-1 ${t.type === 'BUY' ? 'text-gain' : 'text-loss'}`}>
                        {t.type === 'BUY' ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {t.type}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right font-mono">${formatPrice(t.price)}</td>
                    <td className="py-2 px-2 text-right font-mono">{t.qty}</td>
                    <td className={`py-2 px-2 text-right font-mono font-semibold ${t.pnl != null ? (t.pnl >= 0 ? 'text-gain' : 'text-loss') : 'text-terminal-muted'}`}>
                      {t.pnl != null ? (t.pnl >= 0 ? '+' : '') + '$' + formatPrice(t.pnl) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}

function StatCard({ label, value, color }) {
  const colors = {
    gain: 'text-gain bg-gain/10 border-gain/20',
    loss: 'text-loss bg-loss/10 border-loss/20',
    accent: 'text-accent bg-accent/10 border-accent/20',
  }
  return (
    <div className={`panel p-4 border ${colors[color] || colors.accent}`}>
      <p className="text-xs uppercase tracking-wider opacity-70">{label}</p>
      <p className="text-2xl font-mono font-bold mt-1">{value}</p>
    </div>
  )
}
