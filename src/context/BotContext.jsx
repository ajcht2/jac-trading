import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { usePortfolio } from './PortfolioContext'
import { fetchChart, formatPrice } from '../services/api'

const BotContext = createContext()

const CHECK_INTERVAL = 30000

// ── Indicators ──────────────────────────────
function calcSMA(data, period) {
  const r = []
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) { r.push(null); continue }
    let sum = 0
    for (let j = i - period + 1; j <= i; j++) sum += data[j]
    r.push(sum / period)
  }
  return r
}

function calcEMA(data, period) {
  const r = []
  const m = 2 / (period + 1)
  for (let i = 0; i < data.length; i++) {
    if (i === 0) { r.push(data[i]); continue }
    r.push((data[i] - r[i - 1]) * m + r[i - 1])
  }
  return r
}

function calcRSI(closes, period) {
  const r = new Array(closes.length).fill(null)
  if (closes.length < period + 1) return r
  let gS = 0, lS = 0
  for (let i = 1; i <= period; i++) {
    const c = closes[i] - closes[i - 1]
    if (c > 0) gS += c; else lS += Math.abs(c)
  }
  let aG = gS / period, aL = lS / period
  r[period] = aL === 0 ? 100 : 100 - (100 / (1 + aG / aL))
  for (let i = period + 1; i < closes.length; i++) {
    const c = closes[i] - closes[i - 1]
    aG = (aG * (period - 1) + (c > 0 ? c : 0)) / period
    aL = (aL * (period - 1) + (c < 0 ? Math.abs(c) : 0)) / period
    r[i] = aL === 0 ? 100 : 100 - (100 / (1 + aG / aL))
  }
  return r
}

function getSignal(closes, strategy, params) {
  try {
    if (!closes || closes.length < 2) return 0
    const i = closes.length - 1

    if (strategy === 'sma_crossover') {
      const s = calcSMA(closes, params.shortPeriod)
      const l = calcSMA(closes, params.longPeriod)
      if (s[i] == null || l[i] == null || s[i-1] == null || l[i-1] == null) return 0
      if (s[i] > l[i] && s[i-1] <= l[i-1]) return 1
      if (s[i] < l[i] && s[i-1] >= l[i-1]) return -1
    } else if (strategy === 'rsi') {
      const rsi = calcRSI(closes, params.period)
      if (rsi[i] == null || rsi[i-1] == null) return 0
      if (rsi[i] <= params.oversold && rsi[i-1] > params.oversold) return 1
      if (rsi[i] >= params.overbought && rsi[i-1] < params.overbought) return -1
    } else if (strategy === 'macd') {
      const f = calcEMA(closes, params.fastPeriod)
      const sl = calcEMA(closes, params.slowPeriod)
      const ml = f.map((v, j) => v - sl[j])
      const sig = calcEMA(ml, params.signalPeriod)
      if (ml[i] > sig[i] && ml[i-1] <= sig[i-1]) return 1
      if (ml[i] < sig[i] && ml[i-1] >= sig[i-1]) return -1
    } else if (strategy === 'momentum') {
      if (i < params.lookback) return 0
      const ret = ((closes[i] - closes[i - params.lookback]) / closes[i - params.lookback]) * 100
      if (ret >= params.buyThreshold) return 1
      if (ret <= params.sellThreshold) return -1
    }
  } catch (e) {
    console.error('Signal error:', e)
  }
  return 0
}

export function BotProvider({ children }) {
  const { state, dispatch } = usePortfolio()
  const [botActive, setBotActive] = useState(false)
  const [botConfig, setBotConfig] = useState(null)
  const [botLog, setBotLog] = useState([])
  const [botStatus, setBotStatus] = useState('idle')
  const [lastCheck, setLastCheck] = useState(null)
  const [checksCount, setChecksCount] = useState(0)
  const intervalRef = useRef(null)
  const stateRef = useRef(state)
  const configRef = useRef(null)

  // Keep refs fresh
  useEffect(() => { stateRef.current = state }, [state])
  useEffect(() => { configRef.current = botConfig }, [botConfig])

  const addLog = useCallback((entry) => {
    setBotLog(prev => [entry, ...prev].slice(0, 100))
  }, [])

  const botCheck = useCallback(async () => {
    const config = configRef.current
    const currentState = stateRef.current
    if (!config) return

    setBotStatus('checking')

    try {
      const { strategy, symbol, params } = config
      const sym = symbol.toUpperCase()

      const chart = await fetchChart(sym, '3mo', '1d')
      if (!chart || !chart.candles || chart.candles.length < 5) {
        setBotStatus('running')
        return
      }

      const closes = chart.candles.map(c => c.close)
      const signal = getSignal(closes, strategy, params)
      const price = closes[closes.length - 1]
      const now = new Date()

      const entry = {
        timeStr: now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        signal: signal === 1 ? 'BUY' : signal === -1 ? 'SELL' : 'HOLD',
        price: price,
        executed: false,
        action: '',
      }

      const hasPos = currentState.positions[sym] && currentState.positions[sym].qty > 0

      if (signal === 1 && !hasPos) {
        const investAmount = currentState.cash * 0.25
        const qty = Math.floor(investAmount / price)
        if (qty > 0 && currentState.cash >= qty * price) {
          dispatch({ type: 'BUY', payload: { symbol: sym, qty, price, source: 'bot' } })
          entry.executed = true
          entry.action = 'Bought ' + qty + ' @ $' + formatPrice(price)
          setBotStatus('traded')
        } else {
          setBotStatus('running')
        }
      } else if (signal === -1 && hasPos) {
        const qty = currentState.positions[sym].qty
        dispatch({ type: 'SELL', payload: { symbol: sym, qty, price, source: 'bot' } })
        entry.executed = true
        entry.action = 'Sold ' + qty + ' @ $' + formatPrice(price)
        setBotStatus('traded')
      } else {
        setBotStatus('running')
      }

      addLog(entry)
      setLastCheck(now)
      setChecksCount(c => c + 1)
    } catch (err) {
      console.error('Bot check error:', err)
      addLog({
        timeStr: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        signal: 'ERROR',
        price: 0,
        executed: false,
        action: String(err.message || 'Unknown error'),
      })
      setBotStatus('running')
    }
  }, [dispatch, addLog])

  const startBot = useCallback((config) => {
    try {
      if (intervalRef.current) clearInterval(intervalRef.current)
      setBotConfig(config)
      configRef.current = config
      setBotActive(true)
      setBotStatus('running')
      setBotLog([])
      setChecksCount(0)
      setTimeout(() => botCheck(), 1000)
      intervalRef.current = setInterval(botCheck, CHECK_INTERVAL)
    } catch (err) {
      console.error('Start bot error:', err)
    }
  }, [botCheck])

  const stopBot = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
    setBotActive(false)
    setBotStatus('idle')
  }, [])

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return (
    <BotContext.Provider value={{
      botActive, botConfig, botLog, botStatus, lastCheck, checksCount,
      startBot, stopBot, CHECK_INTERVAL,
    }}>
      {children}
    </BotContext.Provider>
  )
}

export function useBot() {
  const ctx = useContext(BotContext)
  if (!ctx) throw new Error('useBot must be used within BotProvider')
  return ctx
}
