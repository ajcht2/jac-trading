import { createContext, useContext, useReducer, useEffect } from 'react'

const PortfolioContext = createContext()

const INITIAL_CASH = 100000
const STORAGE_KEY = 'jac_trading_portfolio'

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch (e) {
    console.warn('Failed to load portfolio:', e)
  }
  return {
    cash: INITIAL_CASH,
    positions: {},   // { AAPL: { qty: 10, avgCost: 150.00 } }
    transactions: [], // { id, type, symbol, qty, price, total, date }
    botTrades: [],    // trades made by the bot
    botConfig: null,  // { strategy, symbol, params, active }
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'BUY': {
      const { symbol, qty, price } = action.payload
      const total = qty * price
      if (total > state.cash) return state

      const existing = state.positions[symbol] || { qty: 0, avgCost: 0 }
      const newQty = existing.qty + qty
      const newAvgCost = (existing.avgCost * existing.qty + total) / newQty

      return {
        ...state,
        cash: state.cash - total,
        positions: {
          ...state.positions,
          [symbol]: { qty: newQty, avgCost: newAvgCost },
        },
        transactions: [
          {
            id: Date.now(),
            type: 'BUY',
            symbol,
            qty,
            price,
            total,
            date: new Date().toISOString(),
            source: action.payload.source || 'manual',
          },
          ...state.transactions,
        ],
      }
    }

    case 'SELL': {
      const { symbol, qty, price } = action.payload
      const existing = state.positions[symbol]
      if (!existing || existing.qty < qty) return state

      const total = qty * price
      const newQty = existing.qty - qty
      const newPositions = { ...state.positions }

      if (newQty === 0) {
        delete newPositions[symbol]
      } else {
        newPositions[symbol] = { ...existing, qty: newQty }
      }

      return {
        ...state,
        cash: state.cash + total,
        positions: newPositions,
        transactions: [
          {
            id: Date.now(),
            type: 'SELL',
            symbol,
            qty,
            price,
            total,
            date: new Date().toISOString(),
            source: action.payload.source || 'manual',
          },
          ...state.transactions,
        ],
      }
    }

    case 'SET_BOT_CONFIG':
      return { ...state, botConfig: action.payload }

    case 'STOP_BOT':
      return {
        ...state,
        botConfig: state.botConfig ? { ...state.botConfig, active: false } : null,
      }

    case 'RESET':
      return loadState()

    case 'FULL_RESET':
      localStorage.removeItem(STORAGE_KEY)
      return {
        cash: INITIAL_CASH,
        positions: {},
        transactions: [],
        botTrades: [],
        botConfig: null,
      }

    default:
      return state
  }
}

export function PortfolioProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadState)

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  return (
    <PortfolioContext.Provider value={{ state, dispatch }}>
      {children}
    </PortfolioContext.Provider>
  )
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext)
  if (!ctx) throw new Error('usePortfolio must be used within PortfolioProvider')
  return ctx
}
