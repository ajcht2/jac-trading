import { useState, useCallback, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Bot, Play, Square, Settings, TrendingUp, TrendingDown, BarChart2, Zap, AlertTriangle, BookOpen, Radio, History, Clock } from 'lucide-react'
import { usePortfolio } from '../context/PortfolioContext'
import { fetchChart, fetchQuote, formatPrice, formatPercent } from '../services/api'
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

const BOT_CHECK_INTERVAL = 30000 // check every 30 seconds

// ── Indicator Functions ──────────────────────────────
function calcSMA(data, period) {
  const result = []
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) { result.push(null); continue }
    const slice = data.slice(i - period + 1, i + 1)
    result.push(slice.reduce((a, b) => a + b, 0) / period)
  }
  return result
}

function calcEMA(data, period) {
  const result = []
  const mult = 2 / (period + 1)
  for (let i = 0; i < data.length; i++) {
    if (i === 0) { result.push(data[i]); continue }
    result.push((data[i] - result[i - 1]) * mult + result[i - 1])
  }
  return result
}

function calcRSI(closes, period) {
  const result = new Array(closes.length).fill(null)
  if (closes.length < period + 1) return result
  let gainSum = 0, lossSum = 0
  for (let i = 1; i <= period; i++) {
    const change = closes[i] - closes[i - 1]
    if (change > 0) gainSum += change; else lossSum += Math.abs(change)
  }
  let avgGain = gainSum / period, avgLoss = lossSum / period
  result[period] = avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss))
  for (let i = period + 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1]
    avgGain = (avgGain * (period - 1) + (change > 0 ? change : 0)) / period
    avgLoss = (avgLoss * (period - 1) + (change < 0 ? Math.abs(change) : 0)) / period
    result[i] = avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss))
  }
  return result
}

// Get the latest signal from a strategy given closing prices
function getLatestSignal(closes, strategy, params) {
  if (closes.length < 2) return 0

  if (strategy === 'sma_crossover') {
    const shortSMA = calcSMA(closes, params.shortPeriod)
    const longSMA = calcSMA(closes, params.longPeriod)
    const i = closes.length - 1
    if (shortSMA[i] == null || longSMA[i] == null || shortSMA[i-1] == null || longSMA[i-1] == null) return 0
    if (shortSMA[i] > longSMA[i] && shortSMA[i-1] <= longSMA[i-1]) return 1
    if (shortSMA[i] < longSMA[i] && shortSMA[i-1] >= longSMA[i-1]) return -1
  } else if (strategy === 'rsi') {
    const rsi = calcRSI(closes, params.period)
    const i = closes.length - 1
    if (rsi[i] == null || rsi[i-1] == null) return 0
    if (rsi[i] <= params.oversold && rsi[i-1] > params.oversold) return 1
    if (rsi[i] >= params.overbought && rsi[i-1] < params.overbought) return -1
  } else if (strategy === 'macd') {
    const fastEMA = calcEMA(closes, params.fastPeriod)
    const slowEMA = calcEMA(closes, params.slowPeriod)
    const macdLine = fastEMA.map((f, j) => f - slowEMA[j])
    const signalLine = calcEMA(macdLine, params.signalPeriod)
    const i = closes.length - 1
    if (macdLine[i] > signalLine[i] && macdLine[i-1] <= signalLine[i-1]) return 1
    if (macdLine[i] < signalLine[i] && macdLine[i-1] >= signalLine[i-1]) return -1
  } else if (strategy === 'momentum') {
    const i = closes.length - 1
    if (i < params.lookback) return 0
    const ret = ((closes[i] - closes[i - params.lookback]) / closes[i - params.lookback]) * 100
    if (ret >= params.buyThreshold) return 1
    if (ret <= params.sellThreshold) return -1
  }
  return 0
}

// Backtest (existing)
function runBacktest(candles, strategy, params, capital) {
  const closes = candles.map(c => c.close)
  const trades = []
  let position = null, cash = capital, qty = 0

  function generateSignals() {
    const signals = new Array(closes.length).fill(0)
    if (strategy === 'sma_crossover') {
      const shortSMA = calcSMA(closes, params.shortPeriod)
      const longSMA = calcSMA(closes, params.longPeriod)
      for (let i = 1; i < closes.length; i++) {
        if (shortSMA[i] == null || longSMA[i] == null || shortSMA[i-1] == null || longSMA[i-1] == null) continue
        if (shortSMA[i] > longSMA[i] && shortSMA[i-1] <= longSMA[i-1]) signals[i] = 1
        if (shortSMA[i] < longSMA[i] && shortSMA[i-1] >= longSMA[i-1]) signals[i] = -1
      }
    } else if (strategy === 'rsi') {
      const rsi = calcRSI(closes, params.period)
      for (let i = 1; i < closes.length; i++) {
        if (rsi[i] == null || rsi[i-1] == null) continue
        if (rsi[i] <= params.oversold && rsi[i-1] > params.oversold) signals[i] = 1
        if (rsi[i] >= params.overbought && rsi[i-1] < params.overbought) signals[i] = -1
      }
    } else if (strategy === 'macd') {
      const fastEMA = calcEMA(closes, params.fastPeriod)
      const slowEMA = calcEMA(closes, params.slowPeriod)
      const macdLine = fastEMA.map((f, j) => f - slowEMA[j])
      const signalLine = calcEMA(macdLine, params.signalPeriod)
      for (let i = 1; i < closes.length; i++) {
        if (macdLine[i] > signalLine[i] && macdLine[i-1] <= signalLine[i-1]) signals[i] = 1
        if (macdLine[i] < signalLine[i] && macdLine[i-1] >= signalLine[i-1]) signals[i] = -1
      }
    } else if (strategy === 'momentum') {
      for (let i = params.lookback; i < closes.length; i++) {
        const ret = ((closes[i] - closes[i - params.lookback]) / closes[i - params.lookback]) * 100
        if (ret >= params.buyThreshold) signals[i] = 1
        if (ret <= params.sellThreshold) signals[i] = -1
      }
    }
    return signals
  }

  const signals = generateSignals()
  const equityCurve = []
  for (let i = 0; i < candles.length; i++) {
    const price = closes[i], signal = signals[i]
    if (signal === 1 && !position) {
      qty = Math.floor(cash / price)
      if (qty > 0) {
        position = { qty, entryPrice: price }
        cash -= qty * price
        trades.push({ type: 'BUY', price, qty, date: new Date(candles[i].time * 1000).toISOString() })
      }
    } else if (signal === -1 && position) {
      cash += position.qty * price
      trades.push({ type: 'SELL', price, qty: position.qty, pnl: (price - position.entryPrice) * position.qty, date: new Date(candles[i].time * 1000).toISOString() })
      position = null
    }
    equityCurve.push({ time: candles[i].time, value: cash + (position ? position.qty * price : 0) })
  }

  const finalEquity = equityCurve[equityCurve.length - 1]?.value || capital
  const totalReturn = ((finalEquity - capital) / capital) * 100
  const buyAndHold = ((closes[closes.length - 1] - closes[0]) / closes[0]) * 100
  const winningTrades = trades.filter(t => t.type === 'SELL' && t.pnl > 0).length
  const losingTrades = trades.filter(t => t.type === 'SELL' && t.pnl <= 0).length
  const totalTrades = trades.filter(t => t.type === 'SELL').length

  return {
    trades, equityCurve,
    stats: { finalEquity, totalReturn, buyAndHold, totalTrades, winningTrades, losingTrades, winRate: totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0, openPosition: position != null },
  }
}

// ── Main Component ──────────────────────────────
export default function TradingBot() {
  const { state, dispatch } = usePortfolio()
  const [mode, setMode] = useState('live') // 'live' or 'backtest'
  const [strategy, setStrategy] = useState('sma_crossover')
  const [symbol, setSymbol] = useState('AAPL')
  const [params, setParams] = useState(
    Object.fromEntries(STRATEGIES.sma_crossover.params.map(p => [p.key, p.default]))
  )

  // Backtest state
  const [btResult, setBtResult] = useState(null)
  const [btLoading, setBtLoading] = useState(false)

  // Live bot state
  const [botActive, setBotActive] = useState(false)
  const [botLog, setBotLog] = useState([])
  const [botStatus, setBotStatus] = useState('idle') // idle, running, checking, traded
  const [lastCheck, setLastCheck] = useState(null)
  const [checksCount, setChecksCount] = useState(0)
  const botIntervalRef = useRef(null)
  const [error, setError] = useState('')

  const handleStrategyChange = (key) => {
    setStrategy(key)
    setParams(Object.fromEntries(STRATEGIES[key].params.map(p => [p.key, p.default])))
    setBtResult(null)
  }

  // ── BACKTEST ──────────────────────────────
  const runBacktestHandler = useCallback(async () => {
    setBtLoading(true)
    setError('')
    setBtResult(null)
    try {
      const chart = await fetchChart(symbol.toUpperCase(), '1y', '1d')
      if (!chart.candles || chart.candles.length < 30) { setError('Not enough data'); return }
      const result = runBacktest(chart.candles, strategy, params, state.cash)
      setBtResult(result)
    } catch (err) { setError(err.message) }
    finally { setBtLoading(false) }
  }, [symbol, strategy, params, state.cash])

  // ── LIVE BOT ──────────────────────────────
  const botCheck = useCallback(async () => {
    const sym = symbol.toUpperCase()
    setBotStatus('checking')
    
    try {
      // Fetch recent daily data for indicators
      const chart = await fetchChart(sym, '3mo', '1d')
      if (!chart.candles || chart.candles.length < 5) return

      const closes = chart.candles.map(c => c.close)
      const signal = getLatestSignal(closes, strategy, params)
      const currentPrice = closes[closes.length - 1]

      const now = new Date()
      const logEntry = {
        time: now.toISOString(),
        timeStr: now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        signal: signal === 1 ? 'BUY' : signal === -1 ? 'SELL' : 'HOLD',
        price: currentPrice,
        executed: false,
      }

      const hasPosition = state.positions[sym]?.qty > 0

      if (signal === 1 && !hasPosition) {
        // BUY signal — invest up to 25% of cash
        const investAmount = state.cash * 0.25
        const qty = Math.floor(investAmount / currentPrice)
        if (qty > 0 && state.cash >= qty * currentPrice) {
          dispatch({ type: 'BUY', payload: { symbol: sym, qty, price: currentPrice, source: 'bot' } })
          logEntry.executed = true
          logEntry.action = `Bought ${qty} shares @ $${formatPrice(currentPrice)}`
          setBotStatus('traded')
        }
      } else if (signal === -1 && hasPosition) {
        // SELL signal — sell all
        const qty = state.positions[sym].qty
        dispatch({ type: 'SELL', payload: { symbol: sym, qty, price: currentPrice, source: 'bot' } })
        logEntry.executed = true
        logEntry.action = `Sold ${qty} shares @ $${formatPrice(currentPrice)}`
        setBotStatus('traded')
      } else {
        setBotStatus('running')
      }

      setBotLog(prev => [logEntry, ...prev].slice(0, 100))
      setLastCheck(now)
      setChecksCount(c => c + 1)
    } catch (err) {
      setBotLog(prev => [{ time: new Date().toISOString(), timeStr: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }), signal: 'ERROR', price: 0, executed: false, action: err.message }, ...prev].slice(0, 100))
      setBotStatus('running')
    }
  }, [symbol, strategy, params, state.cash, state.positions, dispatch])

  const startBot = () => {
    if (!symbol.trim()) { setError('Select a symbol first'); return }
    setError('')
    setBotActive(true)
    setBotStatus('running')
    setBotLog([])
    setChecksCount(0)

    // Run immediately then every 30s
    setTimeout(botCheck, 500)

    botIntervalRef.current = setInterval(botCheck, BOT_CHECK_INTERVAL)
  }

  const stopBot = () => {
    if (botIntervalRef.current) clearInterval(botIntervalRef.current)
    botIntervalRef.current = null
    setBotActive(false)
    setBotStatus('idle')
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => { if (botIntervalRef.current) clearInterval(botIntervalRef.current) }
  }, [])

  // Update interval when botCheck changes (symbol/strategy/params changed while running)
  useEffect(() => {
    if (botActive && botIntervalRef.current) {
      clearInterval(botIntervalRef.current)
      botIntervalRef.current = setInterval(botCheck, BOT_CHECK_INTERVAL)
    }
  }, [botCheck, botActive])

  const strat = STRATEGIES[strategy]

  return (
    <div className="space-y-4 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Bot size={22} className="text-accent" />
          Trading Bot
        </h1>
        <Link to="/strategies" className="flex items-center gap-2 px-3 py-2 rounded-xl bg-terminal-panel border border-terminal-border text-sm text-terminal-muted hover:text-accent hover:border-accent/30 transition-all">
          <BookOpen size={14} /> How do these strategies work?
        </Link>
      </div>

      {/* Mode Toggle */}
      <div className="flex rounded-xl overflow-hidden border border-terminal-border w-fit">
        <button onClick={() => { setMode('live'); setBtResult(null) }}
          className={`px-5 py-2.5 text-sm font-semibold transition-all flex items-center gap-2 ${
            mode === 'live' ? 'bg-accent/20 text-accent' : 'text-terminal-muted hover:text-terminal-text'
          }`}
        ><Radio size={16} /> Live Bot</button>
        <button onClick={() => { setMode('backtest'); stopBot() }}
          className={`px-5 py-2.5 text-sm font-semibold transition-all flex items-center gap-2 ${
            mode === 'backtest' ? 'bg-accent/20 text-accent' : 'text-terminal-muted hover:text-terminal-text'
          }`}
        ><History size={16} /> Backtest</button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Config Panel */}
        <div className="xl:col-span-1 space-y-4">
          {/* Strategy Selector */}
          <div className="panel p-5 space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-terminal-muted flex items-center gap-2">
              <Settings size={14} /> Strategy
            </h3>
            <div className="space-y-2">
              {Object.entries(STRATEGIES).map(([key, s]) => (
                <button key={key} onClick={() => !botActive && handleStrategyChange(key)} disabled={botActive}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all text-sm ${
                    strategy === key
                      ? 'bg-accent/10 border border-accent/30 text-accent'
                      : 'bg-terminal-bg border border-terminal-border text-terminal-muted hover:text-terminal-text hover:border-terminal-muted'
                  } ${botActive ? 'opacity-50 cursor-not-allowed' : ''}`}
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
              <SymbolInput value={symbol} onChange={(s) => !botActive && setSymbol(s)} placeholder="Search stock... (e.g. Tesla, MSFT)" />
              {botActive && <p className="text-[10px] text-terminal-muted mt-1">Stop the bot to change symbol</p>}
            </div>

            {strat.params.map(p => (
              <div key={p.key}>
                <div className="flex justify-between">
                  <label className="text-xs text-terminal-muted uppercase tracking-wider">{p.label}</label>
                  <span className="text-xs font-mono text-accent">{params[p.key]}</span>
                </div>
                <input type="range" min={p.min} max={p.max} value={params[p.key]} disabled={botActive}
                  onChange={e => setParams(prev => ({ ...prev, [p.key]: Number(e.target.value) }))}
                  className="w-full mt-1 accent-accent disabled:opacity-50" />
              </div>
            ))}

            {error && <p className="text-xs text-loss bg-loss/10 rounded-xl p-2 flex items-center gap-1"><AlertTriangle size={12} /> {error}</p>}

            {/* Action Button */}
            {mode === 'live' ? (
              botActive ? (
                <button onClick={stopBot}
                  className="w-full py-3 rounded-xl bg-loss hover:bg-loss/90 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
                ><Square size={16} /> Stop Bot</button>
              ) : (
                <button onClick={startBot}
                  className="w-full py-3 rounded-xl bg-gain hover:bg-gain/90 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
                ><Play size={16} /> Start Live Bot</button>
              )
            ) : (
              <button onClick={runBacktestHandler} disabled={btLoading}
                className="w-full py-3 rounded-xl bg-accent hover:bg-accent/90 text-white font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {btLoading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Running...</> : <><Play size={16} /> Run Backtest (1Y)</>}
              </button>
            )}
          </div>
        </div>

        {/* Results Panel */}
        <div className="xl:col-span-2 space-y-4">
          {mode === 'live' ? (
            <LiveBotPanel botActive={botActive} botStatus={botStatus} botLog={botLog} lastCheck={lastCheck} checksCount={checksCount} symbol={symbol} strategy={strategy} />
          ) : (
            <BacktestPanel result={btResult} loading={btLoading} cash={state.cash} />
          )}
        </div>
      </div>
    </div>
  )
}

// ── Live Bot Panel ──────────────────────────────
function LiveBotPanel({ botActive, botStatus, botLog, lastCheck, checksCount, symbol, strategy }) {
  const [countdown, setCountdown] = useState(30)

  useEffect(() => {
    if (!botActive) { setCountdown(30); return }
    setCountdown(30)
    const timer = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000)
    return () => clearInterval(timer)
  }, [lastCheck, botActive])

  if (!botActive && botLog.length === 0) {
    return (
      <div className="panel p-12 flex flex-col items-center justify-center text-terminal-muted min-h-[400px]">
        <Bot size={48} className="mb-4 opacity-20" />
        <p className="text-sm font-medium">Configure your strategy and start the live bot</p>
        <p className="text-xs mt-2 opacity-70 text-center max-w-sm">
          The bot will check for signals every 30 seconds and automatically execute trades on your paper portfolio when conditions are met
        </p>
      </div>
    )
  }

  const statusColors = {
    idle: 'text-terminal-muted',
    running: 'text-accent',
    checking: 'text-yellow-400',
    traded: 'text-gain',
  }

  const statusLabels = {
    idle: 'Stopped',
    running: 'Monitoring',
    checking: 'Analyzing...',
    traded: 'Trade Executed!',
  }

  const trades = botLog.filter(l => l.executed)
  const signals = botLog.filter(l => !l.executed && l.signal !== 'ERROR')

  return (
    <>
      {/* Status Card */}
      <div className={`panel p-5 ${botActive ? 'border-accent/30' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {botActive && <span className="w-3 h-3 rounded-full bg-gain animate-pulse" />}
            <div>
              <h3 className="font-semibold text-sm">
                {botActive ? 'Bot Active' : 'Bot Stopped'} — {STRATEGIES[strategy]?.name} on {symbol}
              </h3>
              <p className={`text-xs mt-0.5 ${statusColors[botStatus]}`}>{statusLabels[botStatus]}</p>
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

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-terminal-bg rounded-xl p-3 text-center">
            <p className="text-xs text-terminal-muted">Trades Made</p>
            <p className="text-xl font-mono font-bold text-accent mt-1">{trades.length}</p>
          </div>
          <div className="bg-terminal-bg rounded-xl p-3 text-center">
            <p className="text-xs text-terminal-muted">Signals Detected</p>
            <p className="text-xl font-mono font-bold mt-1">{signals.filter(s => s.signal !== 'HOLD').length}</p>
          </div>
          <div className="bg-terminal-bg rounded-xl p-3 text-center">
            <p className="text-xs text-terminal-muted">Holding</p>
            <p className="text-xl font-mono font-bold mt-1">{signals.filter(s => s.signal === 'HOLD').length}</p>
          </div>
        </div>
      </div>

      {/* Activity Log */}
      {botLog.length > 0 && (
        <div className="panel p-5">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-terminal-muted mb-3 flex items-center gap-2">
            <History size={14} /> Bot Activity Log
          </h3>
          <div className="max-h-[350px] overflow-y-auto space-y-1.5">
            {botLog.map((entry, i) => (
              <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm ${
                entry.executed ? 'bg-accent/5 border border-accent/20' : entry.signal === 'ERROR' ? 'bg-loss/5' : 'bg-terminal-bg'
              }`}>
                <span className="text-xs font-mono text-terminal-muted w-20 shrink-0">{entry.timeStr}</span>
                <span className={`text-xs font-semibold w-12 shrink-0 ${
                  entry.signal === 'BUY' ? 'text-gain' : entry.signal === 'SELL' ? 'text-loss' : entry.signal === 'ERROR' ? 'text-loss' : 'text-terminal-muted'
                }`}>
                  {entry.signal}
                </span>
                <span className="font-mono text-xs">${formatPrice(entry.price)}</span>
                {entry.executed && (
                  <span className="text-xs text-accent font-medium ml-auto">{entry.action}</span>
                )}
                {!entry.executed && entry.signal !== 'HOLD' && entry.signal !== 'ERROR' && (
                  <span className="text-xs text-terminal-muted ml-auto">No action (already positioned)</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

// ── Backtest Panel ──────────────────────────────
function BacktestPanel({ result, loading, cash }) {
  if (!result && !loading) {
    return (
      <div className="panel p-12 flex flex-col items-center justify-center text-terminal-muted min-h-[400px]">
        <BarChart2 size={48} className="mb-4 opacity-20" />
        <p className="text-sm font-medium">Configure your strategy and run a backtest</p>
        <p className="text-xs mt-1 opacity-70">Simulates 1 year of trades on historical data</p>
      </div>
    )
  }

  if (!result) return null

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Return" value={formatPercent(result.stats.totalReturn)} color={result.stats.totalReturn >= 0 ? 'gain' : 'loss'} />
        <StatCard label="Buy & Hold" value={formatPercent(result.stats.buyAndHold)} color={result.stats.buyAndHold >= 0 ? 'gain' : 'loss'} />
        <StatCard label="Win Rate" value={`${result.stats.winRate.toFixed(0)}%`} color="accent" />
        <StatCard label="Total Trades" value={result.stats.totalTrades} color="accent" />
      </div>

      <div className="panel p-5">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-terminal-muted mb-3">Performance</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between"><span className="text-terminal-muted">Starting Capital</span><span className="font-mono">${formatPrice(cash)}</span></div>
          <div className="flex justify-between"><span className="text-terminal-muted">Final Equity</span><span className="font-mono font-semibold">${formatPrice(result.stats.finalEquity)}</span></div>
          <div className="flex justify-between"><span className="text-terminal-muted">Winning</span><span className="font-mono text-gain">{result.stats.winningTrades}</span></div>
          <div className="flex justify-between"><span className="text-terminal-muted">Losing</span><span className="font-mono text-loss">{result.stats.losingTrades}</span></div>
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
                <tr className="text-xs text-terminal-muted uppercase tracking-wider border-b border-terminal-border">
                  <th className="text-left py-2 px-2">Date</th><th className="text-left py-2 px-2">Type</th>
                  <th className="text-right py-2 px-2">Price</th><th className="text-right py-2 px-2">Qty</th>
                  <th className="text-right py-2 px-2">P&L</th>
                </tr>
              </thead>
              <tbody>
                {result.trades.map((t, i) => (
                  <tr key={i} className="border-b border-terminal-border/50">
                    <td className="py-2 px-2 font-mono text-xs text-terminal-muted">{new Date(t.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}</td>
                    <td className="py-2 px-2"><span className={`text-xs font-semibold flex items-center gap-1 ${t.type === 'BUY' ? 'text-gain' : 'text-loss'}`}>{t.type === 'BUY' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}{t.type}</span></td>
                    <td className="py-2 px-2 text-right font-mono">${formatPrice(t.price)}</td>
                    <td className="py-2 px-2 text-right font-mono">{t.qty}</td>
                    <td className={`py-2 px-2 text-right font-mono font-semibold ${t.pnl != null ? (t.pnl >= 0 ? 'text-gain' : 'text-loss') : 'text-terminal-muted'}`}>
                      {t.pnl != null ? `${t.pnl >= 0 ? '+' : ''}$${formatPrice(t.pnl)}` : '—'}
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
  const colorMap = { gain: 'text-gain bg-gain/10 border-gain/20', loss: 'text-loss bg-loss/10 border-loss/20', accent: 'text-accent bg-accent/10 border-accent/20' }
  return (
    <div className={`panel p-4 border ${colorMap[color]}`}>
      <p className="text-xs uppercase tracking-wider opacity-70">{label}</p>
      <p className="text-2xl font-mono font-bold mt-1">{value}</p>
    </div>
  )
}
