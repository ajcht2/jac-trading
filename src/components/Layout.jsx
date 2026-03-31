import { useEffect, useState, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { BarChart3, ArrowLeftRight, Bot, BookOpen, RotateCcw, LogOut } from 'lucide-react'
import { usePortfolio } from '../context/PortfolioContext'
import { usePrices } from '../context/PriceContext'
import { useAuth } from '../context/AuthContext'
import { formatPrice } from '../services/api'

const navItems = [
  { to: '/', icon: BarChart3, label: 'Dashboard' },
  { to: '/trade', icon: ArrowLeftRight, label: 'Paper Trade' },
  { to: '/bot', icon: Bot, label: 'Trading Bot' },
  { to: '/strategies', icon: BookOpen, label: 'Strategies' },
]

function LiveValue({ value, prefix = '', className = '' }) {
  const [flash, setFlash] = useState('')
  const prevRef = useRef(value)

  useEffect(() => {
    if (prevRef.current !== value && prevRef.current != null) {
      setFlash(value > prevRef.current ? 'flash-gain' : value < prevRef.current ? 'flash-loss' : '')
      const timer = setTimeout(() => setFlash(''), 600)
      prevRef.current = value
      return () => clearTimeout(timer)
    }
    prevRef.current = value
  }, [value])

  return (
    <span className={`${className} ${flash} transition-colors duration-200 rounded px-0.5`}>
      {prefix}{formatPrice(value)}
    </span>
  )
}

export default function Layout({ children }) {
  const { state, dispatch } = usePortfolio()
  const { prices, watchPriority, lastUpdate, tick } = usePrices()
  const { user, logout } = useAuth()

  const symbols = Object.keys(state.positions)

  useEffect(() => {
    if (symbols.length > 0) watchPriority(symbols)
  }, [symbols.join(','), watchPriority])

  const positionsValue = symbols.reduce((sum, sym) => {
    const pos = state.positions[sym]
    return sum + pos.qty * (prices[sym]?.price || pos.avgCost)
  }, 0)

  const totalCost = symbols.reduce((sum, sym) => sum + state.positions[sym].qty * state.positions[sym].avgCost, 0)
  const totalPnl = positionsValue - totalCost
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0
  const totalEquity = state.cash + positionsValue

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-terminal-panel border-r border-terminal-border flex flex-col shrink-0">
        {/* Logo + User */}
        <div className="p-6 border-b border-terminal-border">
          <h1 className="text-xl font-bold tracking-tight">
            <span className="text-accent">JAC</span> Trading
          </h1>
          {user && (
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-terminal-muted">
                Welcome, <span className="text-terminal-text font-medium">{user.name}</span>
              </p>
              <button onClick={logout} className="text-terminal-muted hover:text-loss transition-colors" title="Log out">
                <LogOut size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive ? 'bg-accent/10 text-accent border border-accent/20' : 'text-terminal-muted hover:text-terminal-text hover:bg-white/5'
                }`
              }
            ><Icon size={18} />{label}</NavLink>
          ))}
        </nav>

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
            <p className="text-xs text-terminal-muted uppercase tracking-wider">Cash Balance</p>
            <p className="text-lg font-mono font-semibold">
              <LiveValue value={state.cash} prefix="$" />
            </p>
          </div>

          <div>
            <p className="text-xs text-terminal-muted uppercase tracking-wider">Positions Value</p>
            <p className="text-lg font-mono font-semibold">
              <LiveValue value={positionsValue} prefix="$" />
            </p>
            {symbols.length > 0 && (
              <p className={`text-xs font-mono mt-0.5 ${totalPnl >= 0 ? 'text-gain' : 'text-loss'}`}>
                {totalPnl >= 0 ? '+' : ''}{formatPrice(totalPnl)}
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-terminal-border">
            <p className="text-xs text-terminal-muted uppercase tracking-wider">Total Equity</p>
            <p className="text-xl font-mono font-bold text-accent">
              <LiveValue value={totalEquity} prefix="$" className="text-accent" />
            </p>
            {symbols.length > 0 && (
              <p className={`text-xs font-mono mt-0.5 ${totalPnl >= 0 ? 'text-gain' : 'text-loss'}`}>
                P&L: {totalPnl >= 0 ? '+' : ''}{formatPrice(totalPnl)} ({totalPnl >= 0 ? '+' : ''}{totalPnlPct.toFixed(2)}%)
              </p>
            )}
          </div>

          <button
            onClick={() => {
              if (confirm('Reset portfolio to $100,000? All trades will be lost.')) dispatch({ type: 'FULL_RESET' })
            }}
            className="flex items-center gap-2 text-xs text-terminal-muted hover:text-loss transition-colors w-full mt-2"
          >
            <RotateCcw size={12} /> Reset Portfolio
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-terminal-bg p-6">{children}</main>
    </div>
  )
}
