import { createContext, useContext, useReducer, useEffect, useRef, useCallback, useMemo } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from './AuthContext'

const PortfolioContext = createContext()

const INITIAL_CASH = 100000
const MAX_SLOTS = 3

const emptySlot = (name) => ({
  name: name || 'Portfolio 1',
  cash: INITIAL_CASH,
  positions: {},
  transactions: [],
})

const DEFAULT_STATE = {
  slots: [emptySlot('Portfolio 1')],
  activeSlot: 0,
  loaded: false,
}

const clampActive = (slots, idx) => {
  if (!slots.length) return 0
  return Math.max(0, Math.min(slots.length - 1, idx))
}

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD':
      return { ...action.payload, loaded: true }

    case 'BUY': {
      const { symbol, qty, price } = action.payload
      const slot = state.slots[state.activeSlot]
      const total = qty * price
      if (total > slot.cash) return state

      const existing = slot.positions[symbol] || { qty: 0, avgCost: 0 }
      const newQty = existing.qty + qty
      const newAvgCost = (existing.avgCost * existing.qty + total) / newQty

      const updatedSlot = {
        ...slot,
        cash: slot.cash - total,
        positions: { ...slot.positions, [symbol]: { qty: newQty, avgCost: newAvgCost } },
        transactions: [
          { id: Date.now(), type: 'BUY', symbol, qty, price, total, date: new Date().toISOString(), source: action.payload.source || 'manual' },
          ...slot.transactions,
        ],
      }
      const slots = state.slots.map((s, i) => (i === state.activeSlot ? updatedSlot : s))
      return { ...state, slots }
    }

    case 'SELL': {
      const { symbol, qty, price } = action.payload
      const slot = state.slots[state.activeSlot]
      const existing = slot.positions[symbol]
      if (!existing || existing.qty < qty) return state

      const total = qty * price
      const newQty = existing.qty - qty
      const newPositions = { ...slot.positions }
      if (newQty === 0) delete newPositions[symbol]
      else newPositions[symbol] = { ...existing, qty: newQty }

      const updatedSlot = {
        ...slot,
        cash: slot.cash + total,
        positions: newPositions,
        transactions: [
          { id: Date.now(), type: 'SELL', symbol, qty, price, total, date: new Date().toISOString(), source: action.payload.source || 'manual' },
          ...slot.transactions,
        ],
      }
      const slots = state.slots.map((s, i) => (i === state.activeSlot ? updatedSlot : s))
      return { ...state, slots }
    }

    case 'FULL_RESET': {
      const slot = state.slots[state.activeSlot]
      const reset = { ...emptySlot(slot.name), name: slot.name }
      const slots = state.slots.map((s, i) => (i === state.activeSlot ? reset : s))
      return { ...state, slots }
    }

    case 'SET_ACTIVE_SLOT':
      return { ...state, activeSlot: clampActive(state.slots, action.payload) }

    case 'ADD_SLOT': {
      if (state.slots.length >= MAX_SLOTS) return state
      const name = action.payload?.name || `Portfolio ${state.slots.length + 1}`
      const slots = [...state.slots, emptySlot(name)]
      return { ...state, slots, activeSlot: slots.length - 1 }
    }

    case 'RENAME_SLOT': {
      const { index, name } = action.payload
      if (!state.slots[index]) return state
      const slots = state.slots.map((s, i) => (i === index ? { ...s, name } : s))
      return { ...state, slots }
    }

    case 'DELETE_SLOT': {
      if (state.slots.length <= 1) return state
      const index = action.payload
      if (!state.slots[index]) return state
      const slots = state.slots.filter((_, i) => i !== index)
      const activeSlot = clampActive(
        slots,
        index < state.activeSlot ? state.activeSlot - 1 : state.activeSlot,
      )
      return { ...state, slots, activeSlot }
    }

    default:
      return state
  }
}

function normalizeFromDb(data, fallbackName) {
  // Prefer the new slots column when present and non-empty
  if (Array.isArray(data?.slots) && data.slots.length > 0) {
    const slots = data.slots.slice(0, MAX_SLOTS).map((s, i) => ({
      name: s.name || `Portfolio ${i + 1}`,
      cash: s.cash ?? INITIAL_CASH,
      positions: s.positions ?? {},
      transactions: s.transactions ?? [],
    }))
    return {
      slots,
      activeSlot: clampActive(slots, data.active_slot ?? 0),
    }
  }

  // Legacy single-portfolio row — promote to slot 0
  return {
    slots: [{
      name: data?.name || fallbackName || 'Portfolio 1',
      cash: data?.cash ?? INITIAL_CASH,
      positions: data?.positions ?? {},
      transactions: data?.transactions ?? [],
    }],
    activeSlot: 0,
  }
}

export function PortfolioProvider({ children }) {
  const { user } = useAuth()
  const [state, dispatch] = useReducer(reducer, DEFAULT_STATE)
  const saveTimeoutRef = useRef(null)
  const userIdRef = useRef(null)
  const slotsColumnAvailableRef = useRef(true)

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
          // Detect whether the slots column is present in this deployment
          slotsColumnAvailableRef.current = 'slots' in data
          const normalized = normalizeFromDb(data, user.name)
          dispatch({ type: 'LOAD', payload: normalized })

          if (user.name && data.name !== user.name) {
            await supabase.from('portfolios').update({ name: user.name }).eq('user_id', user.id)
          }
        } else {
          // No portfolio yet — create one
          await supabase.from('portfolios').upsert({
            user_id: user.id,
            name: user.name || 'Anonymous',
            cash: INITIAL_CASH,
            positions: {},
            transactions: [],
          })
          dispatch({
            type: 'LOAD',
            payload: { slots: [emptySlot('Portfolio 1')], activeSlot: 0 },
          })
        }
      } catch (err) {
        console.error('Failed to load portfolio:', err)
        dispatch({
          type: 'LOAD',
          payload: { slots: [emptySlot('Portfolio 1')], activeSlot: 0 },
        })
      }
    }

    loadPortfolio()
  }, [user?.id])

  // Save to Supabase after every state change (debounced 1s)
  const saveToSupabase = useCallback(async (stateToSave) => {
    if (!userIdRef.current || !stateToSave.loaded) return

    const slots = stateToSave.slots.map(s => ({
      name: s.name,
      cash: s.cash,
      positions: s.positions,
      transactions: (s.transactions || []).slice(0, 200),
    }))
    const active = slots[stateToSave.activeSlot] || slots[0]

    const basePayload = {
      user_id: userIdRef.current,
      // Mirror the active slot in the legacy columns so the leaderboard keeps
      // ranking on the slot the user is currently playing.
      name: active.name,
      cash: active.cash,
      positions: active.positions,
      transactions: active.transactions,
      updated_at: new Date().toISOString(),
    }

    const fullPayload = slotsColumnAvailableRef.current
      ? { ...basePayload, slots, active_slot: stateToSave.activeSlot }
      : basePayload

    try {
      const { error } = await supabase.from('portfolios').upsert(fullPayload)
      if (error && /column.*slots|active_slot/i.test(error.message || '')) {
        // Migration hasn't been run — fall back permanently to legacy schema
        console.warn('Portfolio slots column missing — saving active slot only. Run the migration to enable multi-portfolio persistence.')
        slotsColumnAvailableRef.current = false
        await supabase.from('portfolios').upsert(basePayload)
      } else if (error) {
        throw error
      }
    } catch (err) {
      console.error('Failed to save portfolio:', err)
    }
  }, [])

  useEffect(() => {
    if (!state.loaded || !user?.id) return

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => {
      saveToSupabase(state)
    }, 1000)

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [state, user?.id, saveToSupabase])

  const portfolioDispatch = useCallback((action) => {
    dispatch(action)
  }, [])

  // Flatten the active slot into `state` so existing consumers
  // (Layout, Dashboard, PaperTrading, BotContext, …) keep working unchanged.
  const activeSlotData = state.slots[state.activeSlot] || state.slots[0] || emptySlot('Portfolio 1')
  const flatState = useMemo(() => ({
    cash: activeSlotData.cash,
    positions: activeSlotData.positions,
    transactions: activeSlotData.transactions,
    loaded: state.loaded,
  }), [activeSlotData, state.loaded])

  const slotSummaries = useMemo(
    () => state.slots.map((s, i) => ({ index: i, name: s.name })),
    [state.slots],
  )

  const setActiveSlot = useCallback((index) => {
    dispatch({ type: 'SET_ACTIVE_SLOT', payload: index })
  }, [])

  const addSlot = useCallback((name) => {
    dispatch({ type: 'ADD_SLOT', payload: { name } })
  }, [])

  const renameSlot = useCallback((index, name) => {
    dispatch({ type: 'RENAME_SLOT', payload: { index, name } })
  }, [])

  const deleteSlot = useCallback((index) => {
    dispatch({ type: 'DELETE_SLOT', payload: index })
  }, [])

  return (
    <PortfolioContext.Provider value={{
      state: flatState,
      dispatch: portfolioDispatch,
      slots: slotSummaries,
      activeSlot: state.activeSlot,
      maxSlots: MAX_SLOTS,
      setActiveSlot,
      addSlot,
      renameSlot,
      deleteSlot,
    }}>
      {children}
    </PortfolioContext.Provider>
  )
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext)
  if (!ctx) throw new Error('usePortfolio must be used within PortfolioProvider')
  return ctx
}
