import { useEffect, useState, useRef } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  BarChart3, ArrowLeftRight, Bot, BookOpen, RotateCcw, LogOut,
  Newspaper, Trophy, Plus, Pencil, Trash2, Check, X, ArrowLeft,
  ChevronDown, Layers, User as UserIcon,
} from 'lucide-react'
import { usePortfolio } from '../context/PortfolioContext'
import { usePrices } from '../context/PriceContext'
import { useAuth } from '../context/AuthContext'
import { useBot } from '../context/BotContext'
import { formatPrice } from '../services/api'
import Logo from './Logo'

const navItems = [
  { to: '/',            icon: BarChart3,     label: 'Dashboard'  },
  { to: '/trade',       icon: ArrowLeftRight,label: 'Paper Trade'},
  { to: '/bot',         icon: Bot,           label: 'Bot'        },
  { to: '/news',        icon: Newspaper,     label: 'News'       },
  { to: '/leaderboard', icon: Trophy,        label: 'Leaderboard'},
  { to: '/strategies',  icon: BookOpen,      label: 'Strategies' },
]

function LiveValue({ value, prefix = '', className = '' }) {
  const [flash, setFlash] = useState('')
  const prevRef = useRef(value)
  useEffect(() => {
    if (prevRef.current !== value && prevRef.current != null) {
      if (!className.includes('text-accent')) {
        setFlash(value > prevRef.current ? 'flash-gain' : value < prevRef.current ? 'flash-loss' : '')
      }
      const t = setTimeout(() => setFlash(''), 600)
      prevRef.current = value
      return () => clearTimeout(t)
    }
    prevRef.current = value
  }, [value])
  return <span className={`${className} ${flash} transition-colors duration-200 rounded px-0.5`}>{prefix}{formatPrice(value)}</span>
}

// ──────────────────────────────────────────────────────────
// Portfolio dropdown (replaces the sidebar's PortfolioSwitcher panel).
// ──────────────────────────────────────────────────────────
function PortfolioMenu() {
  const { slots, activeSlot, maxSlots, setActiveSlot, addSlot, renameSlot, deleteSlot } = usePortfolio()
  const [open, setOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null)
  const [editName, setEditName] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const startEdit = (i, name) => { setEditingIndex(i); setEditName(name) }
  const commitEdit = () => {
    if (editingIndex != null) {
      const t = editName.trim()
      if (t) renameSlot(editingIndex, t.slice(0, 20))
    }
    setEditingIndex(null); setEditName('')
  }
  const cancelEdit = () => { setEditingIndex(null); setEditName('') }
  const handleDelete = (i, name) => {
    if (slots.length <= 1) return
    if (confirm(`Delete "${name}"? All positions and transactions will be lost.`)) deleteSlot(i)
  }

  const activeName = slots[activeSlot]?.name || 'Portfolio'

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-terminal-border bg-terminal-panel/60 backdrop-blur hover:border-accent/30 transition-all text-sm"
      >
        <Layers size={14} className="text-accent" />
        <span className="font-medium max-w-[140px] truncate">{activeName}</span>
        <ChevronDown size={14} className={`text-terminal-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-terminal-panel/95 backdrop-blur-md border border-terminal-border rounded-2xl shadow-2xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-terminal-border">
            <p className="text-[10px] text-terminal-muted uppercase tracking-wider font-semibold">Your Portfolios</p>
          </div>
          <div className="p-2 space-y-1">
            {slots.map(slot => {
              const isActive = slot.index === activeSlot
              const isEditing = editingIndex === slot.index
              return (
                <div key={slot.index}
                  className={`group flex items-center gap-1 rounded-lg ${isActive ? 'bg-accent/10 border border-accent/30' : 'hover:bg-white/5 border border-transparent'}`}
                >
                  {isEditing ? (
                    <>
                      <input
                        autoFocus
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') cancelEdit() }}
                        maxLength={20}
                        className="flex-1 bg-terminal-bg border border-terminal-border rounded-md px-2 py-1.5 text-xs focus:outline-none focus:border-accent/50"
                      />
                      <button onClick={commitEdit} className="text-gain p-1.5"><Check size={12} /></button>
                      <button onClick={cancelEdit} className="text-terminal-muted hover:text-loss p-1.5"><X size={12} /></button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => { setActiveSlot(slot.index); setOpen(false) }}
                        className={`flex-1 text-left px-3 py-2 text-sm font-medium truncate ${isActive ? 'text-accent' : 'text-terminal-text'}`}
                      >
                        {slot.name}
                      </button>
                      <button onClick={() => startEdit(slot.index, slot.name)}
                        className="opacity-0 group-hover:opacity-100 text-terminal-muted hover:text-accent p-1.5 transition-opacity"
                        title="Rename"
                      ><Pencil size={12} /></button>
                      {slots.length > 1 && (
                        <button onClick={() => handleDelete(slot.index, slot.name)}
                          className="opacity-0 group-hover:opacity-100 text-terminal-muted hover:text-loss p-1.5 mr-1 transition-opacity"
                          title="Delete"
                        ><Trash2 size={12} /></button>
                      )}
                    </>
                  )}
                </div>
              )
            })}
            {slots.length < maxSlots && (
              <button
                onClick={() => addSlot()}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-terminal-muted hover:text-accent rounded-lg border border-dashed border-terminal-border hover:border-accent/30 transition-colors"
              >
                <Plus size={12} /> New portfolio
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────────────────
// User menu (logout + reset portfolio).
// ──────────────────────────────────────────────────────────
function UserMenu({ onResetActive }) {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-terminal-border bg-terminal-panel/60 backdrop-blur hover:border-accent/30 transition-all text-sm"
      >
        <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
          <UserIcon size={12} className="text-accent" />
        </div>
        <span className="font-medium max-w-[120px] truncate hidden sm:block">{user?.name || 'You'}</span>
        <ChevronDown size={14} className={`text-terminal-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-terminal-panel/95 backdrop-blur-md border border-terminal-border rounded-2xl shadow-2xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-terminal-border">
            <p className="text-xs text-terminal-muted">Signed in as</p>
            <p className="text-sm font-medium truncate">{user?.name}</p>
          </div>
          <div className="p-2">
            <button
              onClick={() => { setOpen(false); onResetActive() }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-terminal-muted hover:text-loss hover:bg-white/5 rounded-lg transition-colors"
            >
              <RotateCcw size={14} /> Reset active portfolio
            </button>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-terminal-muted hover:text-loss hover:bg-white/5 rounded-lg transition-colors"
            >
              <LogOut size={14} /> Log out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────────────────
// Live equity strip below the nav.
// ──────────────────────────────────────────────────────────
function LiveStrip({ cash, positionsValue, totalEquity, totalPnl, totalPnlPct, hasPositions, lastUpdate }) {
  return (
    <div className="border-b border-terminal-border bg-terminal-panel/40 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center gap-4 sm:gap-6 text-xs overflow-x-auto whitespace-nowrap">
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-gain animate-pulse" />
          <span className="text-[10px] text-gain font-mono uppercase font-semibold">Live</span>
          {lastUpdate && (
            <span className="text-[10px] text-terminal-muted font-mono">
              {lastUpdate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-terminal-muted">Cash</span>
          <span className="font-mono font-semibold"><LiveValue value={cash} prefix="$" /></span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-terminal-muted">Positions</span>
          <span className="font-mono font-semibold"><LiveValue value={positionsValue} prefix="$" /></span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 border-l border-terminal-border pl-4 sm:pl-6">
          <span className="text-terminal-muted">Equity</span>
          <span className="font-mono font-bold text-accent"><LiveValue value={totalEquity} prefix="$" className="text-accent" /></span>
        </div>

        {hasPositions && (
          <div className={`flex items-center gap-1.5 shrink-0 font-mono ${totalPnl >= 0 ? 'text-gain' : 'text-loss'}`}>
            <span>P&L</span>
            <span className="font-semibold">
              {totalPnl >= 0 ? '+' : ''}{formatPrice(totalPnl)} ({totalPnl >= 0 ? '+' : ''}{totalPnlPct.toFixed(2)}%)
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────
// Main layout.
// ──────────────────────────────────────────────────────────
export default function Layout({ children }) {
  const { state, dispatch, slots, activeSlot } = usePortfolio()
  const { prices, watchPriority, lastUpdate } = usePrices()
  const { botActive, botConfig } = useBot()
  const navigate = useNavigate()
  const location = useLocation()
  const canGoBack = location.pathname !== '/'
  const activeSlotName = slots[activeSlot]?.name || 'Portfolio'

  const symbols = Object.keys(state.positions)
  useEffect(() => { if (symbols.length > 0) watchPriority(symbols) }, [symbols.join(','), watchPriority])

  const positionsValue = symbols.reduce((sum, sym) => sum + state.positions[sym].qty * (prices[sym]?.price || state.positions[sym].avgCost), 0)
  const totalCost = symbols.reduce((sum, sym) => sum + state.positions[sym].qty * state.positions[sym].avgCost, 0)
  const totalPnl = positionsValue - totalCost
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0
  const totalEquity = state.cash + positionsValue

  const resetActive = () => {
    if (confirm(`Reset "${activeSlotName}" to $100,000?`)) dispatch({ type: 'FULL_RESET' })
  }

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0" style={{
        backgroundImage: 'linear-gradient(rgba(11,14,20,0.85), rgba(11,14,20,0.92)), url(/city-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }} />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top nav */}
        <header className="sticky top-0 z-40 backdrop-blur-md bg-terminal-bg/70 border-b border-terminal-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
            <NavLink to="/" className="shrink-0">
              <Logo size="sm" />
            </NavLink>

            <nav className="flex-1 flex items-center gap-1 overflow-x-auto whitespace-nowrap scrollbar-thin">
              {navItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all shrink-0 ${
                      isActive
                        ? 'bg-accent/10 text-accent border border-accent/20'
                        : 'text-terminal-muted hover:text-terminal-text hover:bg-white/5 border border-transparent'
                    }`
                  }
                >
                  <Icon size={15} />
                  <span className="hidden md:inline">{label}</span>
                  {to === '/bot' && botActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-gain animate-pulse" title="Bot running" />
                  )}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-2 shrink-0">
              <PortfolioMenu />
              <UserMenu onResetActive={resetActive} />
            </div>
          </div>

          <LiveStrip
            cash={state.cash}
            positionsValue={positionsValue}
            totalEquity={totalEquity}
            totalPnl={totalPnl}
            totalPnlPct={totalPnlPct}
            hasPositions={symbols.length > 0}
            lastUpdate={lastUpdate}
          />

          {botActive && botConfig && (
            <div className="border-b border-gain/20 bg-gain/5">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-1.5 flex items-center gap-2 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-gain animate-pulse" />
                <span className="text-gain font-semibold">Bot Running</span>
                <span className="text-terminal-muted font-mono">
                  · {botConfig.strategy.replace('_', ' ').toUpperCase()} on {botConfig.symbol}
                </span>
              </div>
            </div>
          )}
        </header>

        {/* Main */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
          {canGoBack && (
            <button
              onClick={() => navigate(-1)}
              className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-terminal-border bg-terminal-panel/60 backdrop-blur text-terminal-muted hover:text-accent hover:border-accent/30 transition-all text-xs font-medium"
              title="Go back"
            >
              <ArrowLeft size={14} /> Back
            </button>
          )}
          {children}
        </main>
      </div>
    </div>
  )
}
