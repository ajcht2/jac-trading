import { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from './AuthContext'

const PortfolioContext = createContext()

const INITIAL_CASH = 100000

const DEFAULT_STATE = {
  cash: INITIAL_CASH,
  positions: {},
  transactions: [],
  loaded: false,
}

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD':
      return { ...action.payload, loaded: true }

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
        positions: { ...state.positions, [symbol]: { qty: newQty, avgCost: newAvgCost } },
        transactions: [
          { id: Date.now(), type: 'BUY', symbol, qty, price, total, date: new Date().toISOString(), source: action.payload.source || 'manual' },
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
      if (newQty === 0) delete newPositions[symbol]
      else newPositions[symbol] = { ...existing, qty: newQty }

      return {
        ...state,
        cash: state.cash + total,
        positions: newPositions,
        transactions: [
          { id: Date.now(), type: 'SELL', symbol, qty, price, total, date: new Date().toISOString(), source: action.payload.source || 'manual' },
          ...state.transactions,
        ],
      }
    }

    case 'FULL_RESET':
      return { cash: INITIAL_CASH, positions: {}, transactions: [], loaded: true }

    default:
      return state
  }
}

export function PortfolioProvider({ children }) {
  const { user } = useAuth()
  const [state, dispatch] = useReducer(reducer, DEFAULT_STATE)
  const saveTimeoutRef = useRef(null)
  const userIdRef = useRef(null)

  // Load portfolio from Supabase when user logs in
  useEffect(() => {
    if (!user?.id) return
    userIdRef.current = user.id

    const loadPortfolio = async () => {
      try {
        const { data, error } = await supabase
          .from('portfolios')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (data && !error) {
          dispatch({
            type: 'LOAD',
            payload: {
              cash: data.cash ?? INITIAL_CASH,
              positions: data.positions ?? {},
              transactions: data.transactions ?? [],
            },
          })
        } else {
          // No portfolio yet — create one
          await supabase.from('portfolios').upsert({
            user_id: user.id,
            cash: INITIAL_CASH,
            positions: {},
            transactions: [],
          })
          dispatch({ type: 'LOAD', payload: { cash: INITIAL_CASH, positions: {}, transactions: [] } })
        }
      } catch (err) {
        console.error('Failed to load portfolio:', err)
        // Fallback to default
        dispatch({ type: 'LOAD', payload: { cash: INITIAL_CASH, positions: {}, transactions: [] } })
      }
    }

    loadPortfolio()
  }, [user?.id])

  // Save to Supabase after every state change (debounced 1s)
  const saveToSupabase = useCallback(async (stateToSave) => {
    if (!userIdRef.current || !stateToSave.loaded) return

    try {
      await supabase.from('portfolios').upsert({
        user_id: userIdRef.current,
        cash: stateToSave.cash,
        positions: stateToSave.positions,
        transactions: stateToSave.transactions.slice(0, 200), // keep last 200
        updated_at: new Date().toISOString(),
      })
    } catch (err) {
      console.error('Failed to save portfolio:', err)
    }
  }, [])

  useEffect(() => {
    if (!state.loaded || !user?.id) return

    // Debounce saves
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => {
      saveToSupabase(state)
    }, 1000)

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [state, user?.id, saveToSupabase])

  // Custom dispatch that also triggers save
  const portfolioDispatch = useCallback((action) => {
    dispatch(action)
  }, [])

  return (
    <PortfolioContext.Provider value={{ state, dispatch: portfolioDispatch }}>
      {children}
    </PortfolioContext.Provider>
  )
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext)
  if (!ctx) throw new Error('usePortfolio must be used within PortfolioProvider')
  return ctx
}
