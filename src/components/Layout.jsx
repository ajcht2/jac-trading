import { useEffect, useState, useRef } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { BarChart3, ArrowLeftRight, Bot, BookOpen, RotateCcw, LogOut, Newspaper, Trophy, Plus, Pencil, Trash2, Check, X, ArrowLeft } from 'lucide-react'
import { usePortfolio } from '../context/PortfolioContext'
import { usePrices } from '../context/PriceContext'
import { useAuth } from '../context/AuthContext'
import { useBot } from '../context/BotContext'
import { formatPrice } from '../services/api'
import Logo from './Logo'

const navItems = [
  { to: '/', icon: BarChart3, label: 'Dashboard' },
  { to: '/trade', icon: ArrowLeftRight, label: 'Paper Trade' },
  { to: '/bot', icon: Bot, label: 'Trading Bot' },
  { to: '/news', icon: Newspaper, label: 'News' },
  { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { to: '/strategies', icon: BookOpen, label: 'Strategies' },
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

function PortfolioSwitcher() {
  const { slots, activeSlot, maxSlots, setActiveSlot, addSlot, renameSlot, deleteSlot } = usePortfolio()
  const [editingIndex, setEditingIndex] = useState(null)
  const [editName, setEditName] = useState('')

  const startEdit = (index, currentName) => {
    setEditingIndex(index)
    setEditName(currentName)
  }
  const commitEdit = () => {
    if (editingIndex != null) {
      const trimmed = editName.trim()
      if (trimmed) renameSlot(editingIndex, trimmed.slice(0, 20))
    }
    setEditingIndex(null)
    setEditName('')
  }
  const cancelEdit = () => {
    setEditingIndex(null)
    setEditName('')
  }
  const handleDelete = (index, name) => {
    if (slots.length <= 1) return
    if (confirm(`Delete "${name}"? All positions and transactions in this portfolio will be lost.`)) {
      deleteSlot(index)
    }
  }

  return (
    <div className="px-4 pt-4 pb-2 border-b border-terminal-border">
      <p className="text-[10px] text-terminal-muted uppercase tracking-wider font-semibold mb-2">Portfolios</p>
      <div className="space-y-1">
        {slots.map(slot => {
          const isActive = slot.index === activeSlot
          const isEditing = editingIndex === slot.index
          return (
            <div key={slot.index} className={`group flex items-center gap-1 rounded-lg ${isActive ? 'bg-accent/10 border border-accent/30' : 'hover:bg-white/5 border border-transparent'}`}>
              {isEditing ? (
                <>
                  <input
                    autoFocus
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') cancelEdit() }}
                    maxLength={20}
                    className="flex-1 bg-terminal-bg border border-terminal-border rounded-md px-2 py-1 text-xs focus:outline-none focus:border-accent/50"
                  />
                  <button onClick={commitEdit} className="text-gain hover:text-gain p-1" title="Save"><Check size={12} /></button>
                  <button onClick={cancelEdit} className="text-terminal-muted hover:text-loss p-1" title="Cancel"><X size={12} /></button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setActiveSlot(slot.index)}
                    className={`flex-1 text-left px-2 py-1.5 text-xs font-medium truncate ${isActive ? 'text-accent' : 'text-terminal-text'}`}
                    title={slot.name}
                  >
                    {slot.name}
                  </button>
                  <button
                    onClick={() => startEdit(slot.index, slot.name)}
                    className="opacity-0 group-hover:opacity-100 text-terminal-muted hover:text-accent p-1 transition-opacity"
                    title="Rename"
                  ><Pencil size={11} /></button>
                  {slots.length > 1 && (
                    <button
                      onClick={() => handleDelete(slot.index, slot.name)}
                      className="opacity-0 group-hover:opacity-100 text-terminal-muted hover:text-loss p-1 mr-1 transition-opacity"
                      title="Delete portfolio"
                    ><Trash2 size={11} /></button>
                  )}
                </>
              )}
            </div>
          )
        })}
        {slots.length < maxSlots && (
          <button
            onClick={() => addSlot()}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-terminal-muted hover:text-accent rounded-lg border border-dashed border-terminal-border hover:border-accent/30 transition-colors"
          >
            <Plus size={12} /> New portfolio
          </button>
        )}
      </div>
    </div>
  )
}

export default function Layout({ children }) {
  const { state, dispatch, slots, activeSlot } = usePortfolio()
  const { prices, watchPriority, lastUpdate } = usePrices()
  const { user, logout } = useAuth()
  const { botActive, botConfig } = useBot()
  const activeSlotName = slots[activeSlot]?.name || 'Portfolio'
  const navigate = useNavigate()
  const location = useLocation()
  const canGoBack = location.pathname !== '/'

  const symbols = Object.keys(state.positions)
  useEffect(() => { if (symbols.length > 0) watchPriority(symbols) }, [symbols.join(','), watchPriority])

  const positionsValue = symbols.reduce((sum, sym) => sum + state.positions[sym].qty * (prices[sym]?.price || state.positions[sym].avgCost), 0)
  const totalCost = symbols.reduce((sum, sym) => sum + state.positions[sym].qty * state.positions[sym].avgCost, 0)
  const totalPnl = positionsValue - totalCost
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0
  const totalEquity = state.cash + positionsValue

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-[#111827] border-r border-terminal-border flex flex-col shrink-0 overflow-y-auto">
        {/* Logo */}
        <div className="p-5 border-b border-terminal-border">
          <div className="flex justify-center py-2">
            <Logo size="md" />
          </div>
          {user && (
            <div className="flex flex-col items-center mt-3">
              <p className="text-xs text-terminal-muted text-center">
                Welcome, <span className="text-terminal-text font-medium">{user.name}</span>
              </p>
              <button onClick={logout} className="text-terminal-muted hover:text-loss transition-colors mt-1" title="Log out">
                <LogOut size={12} />
              </button>
            </div>
          )}
        </div>

        <PortfolioSwitcher />

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive ? 'bg-accent/10 text-accent border border-accent/20' : 'text-terminal-muted hover:text-terminal-text hover:bg-white/5'
                }`
              }
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {to === '/bot' && botActive && (
                <span className="w-2 h-2 rounded-full bg-gain animate-pulse" title="Bot running" />
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bot Status */}
        {botActive && botConfig && (
          <div className="mx-4 mb-3 px-3 py-2.5 bg-gain/5 border border-gain/20 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gain animate-pulse" />
              <span className="text-xs text-gain font-semibold">Bot Running</span>
            </div>
            <p className="text-[10px] text-terminal-muted mt-1 font-mono">
              {botConfig.strategy.replace('_', ' ').toUpperCase()} on {botConfig.symbol}
            </p>
          </div>
        )}

        {/* Live Portfolio */}
        <div className="p-4 border-t border-terminal-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gain animate-pulse" />
              <span className="text-[10px] text-gain font-mono uppercase font-semibold">Live</span>
            </div>
            {lastUpdate && (
              <span className="text-[10px] text-terminal-muted font-mono">
                {lastUpdate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
          </div>

          <div>
            <p className="text-xs text-terminal-muted uppercase tracking-wider">Cash</p>
            <p className="text-lg font-mono font-semibold"><LiveValue value={state.cash} prefix="$" /></p>
          </div>
          <div>
            <p className="text-xs text-terminal-muted uppercase tracking-wider">Positions</p>
            <p className="text-lg font-mono font-semibold"><LiveValue value={positionsValue} prefix="$" /></p>
            {symbols.length > 0 && (
              <p className={`text-xs font-mono mt-0.5 ${totalPnl >= 0 ? 'text-gain' : 'text-loss'}`}>{totalPnl >= 0 ? '+' : ''}{formatPrice(totalPnl)}</p>
            )}
          </div>
          <div className="pt-2 border-t border-terminal-border">
            <p className="text-xs text-terminal-muted uppercase tracking-wider">Total Equity</p>
            <p className="text-xl font-mono font-bold text-accent"><LiveValue value={totalEquity} prefix="$" className="text-accent" /></p>
            {symbols.length > 0 && (
              <p className={`text-xs font-mono mt-0.5 ${totalPnl >= 0 ? 'text-gain' : 'text-loss'}`}>
                P&L: {totalPnl >= 0 ? '+' : ''}{formatPrice(totalPnl)} ({totalPnl >= 0 ? '+' : ''}{totalPnlPct.toFixed(2)}%)
              </p>
            )}
          </div>

          <button onClick={() => { if (confirm(`Reset "${activeSlotName}" to $100,000?`)) dispatch({ type: 'FULL_RESET' }) }}
            className="flex items-center gap-2 text-xs text-terminal-muted hover:text-loss transition-colors w-full mt-2"
          ><RotateCcw size={12} /> Reset Portfolio</button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-6"
        style={{
          backgroundImage: 'linear-gradient(rgba(11,14,20,0.8), rgba(11,14,20,0.8)), url(/city-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
          backgroundAttachment: 'fixed',
        }}
      >
        {canGoBack && (
          <button
            onClick={() => navigate(-1)}
            className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-terminal-border text-terminal-muted hover:text-accent hover:border-accent/30 transition-all text-xs font-medium"
            title="Go back"
          >
            <ArrowLeft size={14} /> Back
          </button>
        )}
        {children}
      </main>
    </div>
  )
}
