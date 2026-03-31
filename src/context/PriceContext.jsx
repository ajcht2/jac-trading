import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { fetchQuote } from '../services/api'

const PriceContext = createContext()

const INTERVAL = 5000 // 5 seconds

export function PriceProvider({ children }) {
  const [prices, setPrices] = useState({})
  const [lastUpdate, setLastUpdate] = useState(null)
  const [tick, setTick] = useState(0)
  const symbolsRef = useRef(new Set())

  // Add symbols to watch
  const watchSymbols = useCallback((syms) => {
    syms.forEach(s => { if (s) symbolsRef.current.add(s) })
  }, [])

  // Alias for compatibility
  const watchPriority = watchSymbols

  // The actual fetch function
  const doFetch = useCallback(async () => {
    const syms = Array.from(symbolsRef.current)
    if (syms.length === 0) return

    const results = await Promise.allSettled(
      syms.map(sym => fetchQuote(sym).then(data => ({ sym, data })))
    )

    const updated = {}
    results.forEach(r => {
      if (r.status === 'fulfilled' && r.value.data?.price != null) {
        const { sym, data } = r.value
        updated[sym] = {
          price: data.price,
          change: data.change,
          changePercent: data.changePercent,
          open: data.open,
          high: data.high,
          low: data.low,
          volume: data.volume,
          marketCap: data.marketCap,
          name: data.name,
          currency: data.currency,
          marketState: data.marketState,
          previousClose: data.previousClose,
          fiftyTwoWeekHigh: data.fiftyTwoWeekHigh,
          fiftyTwoWeekLow: data.fiftyTwoWeekLow,
        }
      }
    })

    if (Object.keys(updated).length > 0) {
      setPrices(prev => {
        const next = { ...prev, ...updated }
        return next
      })
      setLastUpdate(new Date())
      setTick(t => t + 1)
    }
  }, [])

  // Single interval — runs every 5s no matter what
  useEffect(() => {
    // Initial fetch after 500ms
    const init = setTimeout(doFetch, 500)

    const id = setInterval(doFetch, INTERVAL)

    return () => {
      clearTimeout(init)
      clearInterval(id)
    }
  }, [doFetch])

  return (
    <PriceContext.Provider value={{
      prices, lastUpdate, tick,
      watchSymbols, watchPriority,
      refreshPrices: doFetch,
      getPrice: (s) => prices[s]?.price || null,
      getQuote: (s) => prices[s] || null,
      REFRESH_INTERVAL: INTERVAL,
    }}>
      {children}
    </PriceContext.Provider>
  )
}

export function usePrices() {
  const ctx = useContext(PriceContext)
  if (!ctx) throw new Error('usePrices must be used within PriceProvider')
  return ctx
}
