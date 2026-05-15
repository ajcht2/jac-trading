import { useEffect, useState, useRef } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  BarChart3, ArrowLeftRight, Bot, BookOpen, RotateCcw, LogOut,
  Newspaper, Trophy, Plus, Pencil, Trash2, Check, X, ArrowLeft,
  ChevronDown, Layers, User as UserIcon, Wallet, TrendingUp, TrendingDown,
  Sparkles, Briefcase, PiggyBank, Calculator, GraduationCap,
} from 'lucide-react'
import { usePortfolio } from '../context/PortfolioContext'
import { usePrices } from '../context/PriceContext'
import { useAuth } from '../context/AuthContext'
import { useBot } from '../context/BotContext'
import { formatPrice } from '../services/api'
// (Logo intentionally not used here — signed-in interface is logo-free)

const navGroups = [
  {
    label: 'M&A',
    color: '#a855f7',
    items: [
      { to: '/m-and-a',     icon: Briefcase,     label: 'M&A Theory' },
      { to: '/lbo',         icon: PiggyBank,     label: 'LBO Model'  },
      { to: '/valuation',   icon: Calculator,    label: 'Valuation'  },
    ],
  },
  {
    label: 'Learn',
    color: '#f59e0b',
    items: [
      { to: '/courses',     icon: GraduationCap, label: 'Courses'    },
    ],
  },
  {
    label: 'News',
    color: '#10b981',
    items: [
      { to: '/news',        icon: Newspaper,     label: 'News'       },
    ],
  },
  // Engineering side project — separated visually from the finance content
  {
    label: 'Sandbox',
    color: '#64748b',
    items: [
      { to: '/markets',     icon: BarChart3,     label: 'Markets'      },
      { to: '/trade',       icon: ArrowLeftRight,label: 'Sim Trade'    },
      { to: '/bot',         icon: Bot,           label: 'Bot'          },
      { to: '/strategies',  icon: BookOpen,      label: 'Strategies'   },
      { to: '/leaderboard', icon: Trophy,        label: 'Sim Ranking'  },
    ],
  },
]
const navItems = navGroups.flatMap(g => g.items)

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
// Nav group — either renders a single pill (if 1 item) or a hover/click
// dropdown that groups its sub-items. Active when current route is inside.
// ──────────────────────────────────────────────────────────
function NavGroup({ group, botActive }) {
  const [open, setOpen] = useState(false)
  const [dropdownPos, setDropdownPos] = useState({ left: 0, top: 0 })
  const ref = useRef(null)
  const buttonRef = useRef(null)
  const location = useLocation()

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Compute dropdown position relative to viewport when opening
  // (avoids the parent nav's overflow-x clipping the menu)
  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPos({
        left: rect.left + rect.width / 2,
        top: rect.bottom + 8,
      })
    }
  }, [open])

  // Auto-close on route change
  useEffect(() => { setOpen(false) }, [location.pathname])

  const items = group.items
  const isInside = items.some(i => i.to === '/' ? location.pathname === '/' : location.pathname.startsWith(i.to))
  const activeItem = items.find(i => i.to === '/' ? location.pathname === '/' : location.pathname.startsWith(i.to))

  // Single-item groups render as a plain pill
  if (items.length === 1) {
    const { to, icon: Icon, label } = items[0]
    return (
      <NavLink
        to={to}
        end={to === '/'}
        className={({ isActive }) =>
          `flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
            isActive
              ? 'bg-white/[0.07] text-terminal-text'
              : 'text-terminal-muted hover:text-terminal-text hover:bg-white/[0.04]'
          }`
        }
        style={({ isActive }) => isActive ? { boxShadow: `inset 0 0 0 1px ${group.color}55` } : {}}
      >
        <Icon size={14} style={isInside ? { color: group.color } : {}} />
        <span>{label}</span>
      </NavLink>
    )
  }

  // Multi-item groups render as a dropdown
  return (
    <div ref={ref} className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
          isInside ? 'bg-white/[0.07] text-terminal-text' : 'text-terminal-muted hover:text-terminal-text hover:bg-white/[0.04]'
        }`}
        style={isInside ? { boxShadow: `inset 0 0 0 1px ${group.color}55` } : {}}
      >
        <span style={isInside ? { color: group.color } : {}}>{group.label}</span>
        {isInside && activeItem && (
          <span className="text-[10px] text-terminal-muted hidden lg:inline">/ {activeItem.label}</span>
        )}
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="fixed min-w-[200px] bg-terminal-panel/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[60] p-1.5"
          style={{
            left: dropdownPos.left,
            top: dropdownPos.top,
            transform: 'translateX(-50%)',
          }}
        >
          {items.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive ? 'bg-white/[0.07]' : 'hover:bg-white/[0.04] text-terminal-muted hover:text-terminal-text'
                }`
              }
              style={({ isActive }) => isActive ? { color: group.color } : {}}
            >
              <Icon size={14} />
              <span className="flex-1">{label}</span>
              {to === '/bot' && botActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-gain animate-pulse" />
              )}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
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
        className="flex items-center gap-1.5 pl-3 pr-2.5 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.08] transition-all text-sm"
      >
        <Layers size={13} className="text-accent" />
        <span className="font-medium max-w-[100px] truncate text-xs sm:text-sm hidden sm:inline">{activeName}</span>
        <ChevronDown size={12} className={`text-terminal-muted transition-transform ${open ? 'rotate-180' : ''}`} />
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
        className="flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.08] transition-all text-sm"
      >
        <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
          <UserIcon size={11} className="text-accent" />
        </div>
        <ChevronDown size={12} className={`text-terminal-muted transition-transform ${open ? 'rotate-180' : ''}`} />
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
// Live equity panel — three tile-style cards stacked on the left.
// ──────────────────────────────────────────────────────────
function StatTile({ icon: Icon, label, value, accent = 'text-terminal-text', tone = 'border-terminal-border bg-terminal-panel/70', children }) {
  return (
    <div className={`backdrop-blur-md border rounded-2xl p-4 ${tone}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon size={14} className={accent} />
          <span className="text-[10px] text-terminal-muted uppercase tracking-wider font-semibold">{label}</span>
        </div>
      </div>
      <p className={`text-xl font-mono font-bold ${accent}`}>{value}</p>
      {children}
    </div>
  )
}

function LivePanel({ cash, positionsValue, totalEquity, totalPnl, totalPnlPct, hasPositions, lastUpdate, botActive, botConfig }) {
  const positivePnl = totalPnl >= 0
  const PnlIcon = positivePnl ? TrendingUp : TrendingDown

  return (
    <aside className="px-4 sm:px-6 mb-6 lg:px-0 lg:mb-0 lg:w-60 lg:fixed lg:top-[80px] lg:left-3 xl:left-6 lg:max-h-[calc(100vh-96px)] lg:overflow-y-auto z-20 space-y-3">
      {/* Live indicator strip */}
      <div className="flex items-center justify-between px-3 py-2 bg-terminal-panel/40 backdrop-blur border border-terminal-border rounded-xl">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-gain animate-pulse" />
          <span className="text-[10px] text-gain font-mono uppercase font-semibold tracking-wider">Live</span>
        </div>
        {lastUpdate && (
          <span className="text-[10px] text-terminal-muted font-mono">
            {lastUpdate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        )}
      </div>

      {/* Total Equity — hero tile */}
      <div
        className="backdrop-blur-md border rounded-2xl p-4 relative overflow-hidden"
        style={{
          borderColor: 'rgba(59,130,246,0.3)',
          background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(168,85,247,0.06))',
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-accent" />
            <span className="text-[10px] text-accent uppercase tracking-wider font-semibold">Total Equity</span>
          </div>
        </div>
        <p className="text-2xl font-mono font-bold text-accent">
          <LiveValue value={totalEquity} prefix="$" className="text-accent" />
        </p>
        {hasPositions ? (
          <div className={`mt-2 flex items-center gap-1.5 text-xs font-mono ${positivePnl ? 'text-gain' : 'text-loss'}`}>
            <PnlIcon size={12} />
            <span className="font-semibold">
              {positivePnl ? '+' : ''}{formatPrice(totalPnl)}
            </span>
            <span className="opacity-70">
              ({positivePnl ? '+' : ''}{totalPnlPct.toFixed(2)}%)
            </span>
          </div>
        ) : (
          <p className="text-[11px] text-terminal-muted mt-2">No open positions</p>
        )}
      </div>

      <StatTile
        icon={Wallet}
        label="Cash"
        accent="text-gain"
        tone="border-gain/20 bg-gain/5"
        value={<LiveValue value={cash} prefix="$" />}
      />

      <StatTile
        icon={BarChart3}
        label="Positions"
        accent="text-purple-400"
        tone="border-purple-400/20 bg-purple-400/5"
        value={<LiveValue value={positionsValue} prefix="$" />}
      >
        {hasPositions && (
          <p className={`text-[11px] font-mono mt-1 ${positivePnl ? 'text-gain' : 'text-loss'}`}>
            {positivePnl ? '+' : ''}{formatPrice(totalPnl)}
          </p>
        )}
      </StatTile>

      {botActive && botConfig && (
        <div className="bg-gain/5 border border-gain/30 rounded-2xl p-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gain animate-pulse" />
            <span className="text-[10px] text-gain font-mono uppercase font-semibold tracking-wider">Bot Running</span>
          </div>
          <p className="text-[10px] text-terminal-muted mt-1 font-mono">
            {botConfig.strategy.replace('_', ' ').toUpperCase()} · {botConfig.symbol}
          </p>
        </div>
      )}
    </aside>
  )
}

// ──────────────────────────────────────────────────────────
// Main layout.
// ──────────────────────────────────────────────────────────
// Routes where the live portfolio panel makes sense (the sandbox simulator).
// Hidden on every M&A / Courses / News page so they read as serious content.
const TRADING_ROUTES = ['/markets', '/trade', '/bot', '/strategies']

export default function Layout({ children }) {
  const { state, dispatch, slots, activeSlot } = usePortfolio()
  const { prices, watchPriority, lastUpdate } = usePrices()
  const { botActive, botConfig } = useBot()
  const navigate = useNavigate()
  const location = useLocation()
  // `/` and `/m-and-a` both render the M&A page — both are "home"
  const canGoBack = location.pathname !== '/' && location.pathname !== '/m-and-a'
  const activeSlotName = slots[activeSlot]?.name || 'Portfolio'
  const showLivePanel = TRADING_ROUTES.includes(location.pathname)

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
        {/* Floating top nav — single row, no logo. Pill-style with
            dropdown groups so the whole nav fits comfortably. */}
        <header className="fixed top-3 inset-x-3 sm:inset-x-6 z-40">
          <div className="max-w-7xl mx-auto bg-terminal-panel/70 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
            <div className="px-3 sm:px-4 py-2 flex items-center gap-2">
              {/* Bot indicator (left) */}
              {botActive && (
                <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-full bg-gain/10 border border-gain/30 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-gain animate-pulse" />
                  <span className="text-[10px] text-gain font-mono uppercase font-semibold tracking-wider">Bot</span>
                </div>
              )}

              {/* Nav groups — centered */}
              <nav className="flex-1 flex items-center justify-center gap-1 sm:gap-2 overflow-x-auto whitespace-nowrap min-w-0">
                {navGroups.map(group => (
                  <NavGroup key={group.label} group={group} botActive={botActive} />
                ))}
              </nav>

              {/* Right actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                <PortfolioMenu />
                <UserMenu onResetActive={resetActive} />
              </div>
            </div>
          </div>
        </header>

        {/* Body: pt clears the floating header. */}
        <div className="flex-1 pt-[80px] pb-6">
          {showLivePanel && (
            <LivePanel
              cash={state.cash}
              positionsValue={positionsValue}
              totalEquity={totalEquity}
              totalPnl={totalPnl}
              totalPnlPct={totalPnlPct}
              hasPositions={symbols.length > 0}
              lastUpdate={lastUpdate}
              botActive={botActive}
              botConfig={botConfig}
            />
          )}

          {/* When the live panel is showing, leave space on the left for it
              on lg+. Otherwise, just center the content. */}
          <main className={
            showLivePanel
              ? 'px-4 sm:px-6 lg:pl-[280px] xl:pl-[300px] max-w-7xl xl:max-w-[1400px] mx-auto min-w-0'
              : 'px-4 sm:px-6 max-w-7xl mx-auto min-w-0'
          }>
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
    </div>
  )
}
