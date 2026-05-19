import { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  Home, BookOpen, Calculator, User as UserIcon, Menu, X, ArrowLeft,
  Briefcase, PiggyBank, FileSpreadsheet, ScrollText, BarChart3, FileText,
  MessageSquare, FolderOpen, Sigma, GraduationCap, Newspaper, Trophy,
  Bot, ArrowLeftRight, LogOut, RotateCcw, Layers, Pencil, Trash2,
  Check, Plus, ChevronRight,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { usePortfolio } from '../context/PortfolioContext'

// Compact page-title resolver so the mobile header shows where you are.
const TITLES = {
  '/': 'IB Hub',
  '/valuation': 'Valuation',
  '/m-and-a': 'M&A',
  '/lbo': 'LBO Model',
  '/private-equity': 'Private Equity',
  '/financial-modeling': 'Modeling',
  '/accounting': 'Accounting',
  '/markets': 'Markets',
  '/deal-process': 'Deal Process',
  '/interview-prep': 'Interview',
  '/case-studies': 'Cases',
  '/excel': 'Excel',
  '/careers': 'Careers',
  '/courses': 'Courses',
  '/news': 'News',
  '/trade': 'Trade',
  '/bot': 'Bot',
  '/strategies': 'Strategies',
  '/leaderboard': 'Leaderboard',
}

const DRAWER_GROUPS = [
  {
    label: 'Technicals',
    color: '#a855f7',
    items: [
      { to: '/valuation',          icon: Calculator,      label: 'Valuation'          },
      { to: '/m-and-a',            icon: Briefcase,       label: 'M&A'                },
      { to: '/lbo',                icon: PiggyBank,       label: 'LBO Model'          },
      { to: '/private-equity',     icon: PiggyBank,       label: 'Private Equity'     },
      { to: '/financial-modeling', icon: FileSpreadsheet, label: 'Financial Modeling' },
      { to: '/accounting',         icon: ScrollText,      label: 'Accounting'         },
      { to: '/markets',            icon: BarChart3,       label: 'Markets'            },
      { to: '/deal-process',       icon: FileText,        label: 'Deal Process'       },
    ],
  },
  {
    label: 'Prep',
    color: '#ef4444',
    items: [
      { to: '/interview-prep', icon: MessageSquare, label: 'Interview Prep' },
      { to: '/case-studies',   icon: FolderOpen,    label: 'Case Studies'   },
      { to: '/excel',          icon: Sigma,         label: 'Excel Skills'   },
      { to: '/careers',        icon: GraduationCap, label: 'Careers'        },
    ],
  },
  {
    label: 'Library',
    color: '#f59e0b',
    items: [
      { to: '/courses', icon: BookOpen,  label: 'Courses' },
      { to: '/news',    icon: Newspaper, label: 'News'    },
    ],
  },
  {
    label: 'Sandbox',
    color: '#64748b',
    items: [
      { to: '/trade',       icon: ArrowLeftRight, label: 'Sim Trade'   },
      { to: '/bot',         icon: Bot,            label: 'Bot'         },
      { to: '/strategies',  icon: BookOpen,       label: 'Strategies'  },
      { to: '/leaderboard', icon: Trophy,         label: 'Sim Ranking' },
    ],
  },
]

// ──────────────────────────────────────────────────────────
// Top header for mobile — minimal, native-app feel.
// ──────────────────────────────────────────────────────────
export function MobileHeader({ onMenuOpen }) {
  const navigate = useNavigate()
  const location = useLocation()
  const canGoBack = location.pathname !== '/'
  const title = TITLES[location.pathname] || 'JAC'

  return (
    <header
      className="lg:hidden fixed top-0 inset-x-0 z-40 bg-terminal-bg/95 backdrop-blur-xl border-b border-terminal-border"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="h-12 px-3 flex items-center justify-between">
        {/* Left: back button or empty */}
        <div className="w-10 flex items-center">
          {canGoBack && (
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full flex items-center justify-center -ml-1 active:bg-white/10 transition-colors"
              aria-label="Back"
            >
              <ArrowLeft size={20} />
            </button>
          )}
        </div>

        {/* Center: page title */}
        <h1 className="text-base font-semibold truncate flex-1 text-center">{title}</h1>

        {/* Right: menu drawer toggle */}
        <button
          onClick={onMenuOpen}
          className="w-10 h-10 rounded-full flex items-center justify-center -mr-1 active:bg-white/10 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      </div>
    </header>
  )
}

// ──────────────────────────────────────────────────────────
// Bottom tab bar — the biggest "native app" visual cue.
// ──────────────────────────────────────────────────────────
export function BottomTabBar({ onAccountOpen }) {
  const TABS = [
    { to: '/',                icon: Home,         label: 'Home'    },
    { to: '/courses',         icon: BookOpen,     label: 'Learn'   },
    { to: '/lbo',             icon: PiggyBank,    label: 'LBO'     },
    { to: '/valuation',       icon: Calculator,   label: 'Valuation' },
  ]

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-terminal-bg/95 backdrop-blur-xl border-t border-terminal-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="grid grid-cols-5 px-1 pt-1">
        {TABS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-xl active:bg-white/5 transition-colors ${
                isActive ? 'text-accent' : 'text-terminal-muted'
              }`
            }
          >
            <Icon size={20} strokeWidth={2.2} />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
        <button
          onClick={onAccountOpen}
          className="flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-xl active:bg-white/5 transition-colors text-terminal-muted"
        >
          <UserIcon size={20} strokeWidth={2.2} />
          <span className="text-[10px] font-medium">Account</span>
        </button>
      </div>
    </nav>
  )
}

// ──────────────────────────────────────────────────────────
// Slide-out drawer with the full navigation.
// ──────────────────────────────────────────────────────────
export function MobileDrawer({ open, onClose }) {
  // Close on route change
  const location = useLocation()
  useEffect(() => { onClose() }, [location.pathname])

  // Lock body scroll while open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else      document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Backdrop */}
      <div
        className={`lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      {/* Drawer panel — slides from right */}
      <aside
        className={`lg:hidden fixed top-0 right-0 bottom-0 z-50 w-[85%] max-w-[360px] bg-terminal-panel border-l border-terminal-border shadow-2xl transition-transform overflow-y-auto ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="sticky top-0 bg-terminal-panel/95 backdrop-blur border-b border-terminal-border px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-bold uppercase tracking-wider text-terminal-muted">Navigate</span>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center active:bg-white/10 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-3 space-y-4">
          {DRAWER_GROUPS.map(group => (
            <div key={group.label}>
              <p className="text-[10px] uppercase tracking-wider font-semibold px-2 pb-1.5" style={{ color: group.color }}>
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(({ to, icon: Icon, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/'}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium active:bg-white/5 transition-colors ${
                        isActive ? 'bg-accent/10 text-accent' : 'text-terminal-text'
                      }`
                    }
                  >
                    <Icon size={16} style={{ color: group.color }} />
                    <span className="flex-1">{label}</span>
                    <ChevronRight size={14} className="text-terminal-muted" />
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  )
}

// ──────────────────────────────────────────────────────────
// Account sheet — slides up from bottom (iOS-style modal sheet).
// Holds user info, portfolio switcher and logout.
// ──────────────────────────────────────────────────────────
export function AccountSheet({ open, onClose, onResetActive }) {
  const { user, logout } = useAuth()
  const { slots, activeSlot, maxSlots, setActiveSlot, addSlot, renameSlot, deleteSlot } = usePortfolio()
  const [editingIndex, setEditingIndex] = useState(null)
  const [editName, setEditName] = useState('')

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else      document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const startEdit = (i, name) => { setEditingIndex(i); setEditName(name) }
  const commitEdit = () => {
    if (editingIndex != null) {
      const t = editName.trim()
      if (t) renameSlot(editingIndex, t.slice(0, 20))
    }
    setEditingIndex(null); setEditName('')
  }
  const handleDelete = (i, name) => {
    if (slots.length <= 1) return
    if (confirm(`Delete "${name}"?`)) deleteSlot(i)
  }

  return (
    <>
      <div
        className={`lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      <div
        className={`lg:hidden fixed bottom-0 inset-x-0 z-50 bg-terminal-panel rounded-t-3xl border-t border-x border-terminal-border shadow-2xl transition-transform max-h-[85vh] overflow-y-auto ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-terminal-muted/40" />
        </div>

        <div className="px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
              <UserIcon size={18} className="text-accent" />
            </div>
            <div>
              <p className="text-[10px] text-terminal-muted uppercase tracking-wider">Signed in as</p>
              <p className="text-sm font-semibold">{user?.name || 'You'}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center active:bg-white/10 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-2 space-y-4">
          {/* Portfolios */}
          <div>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-terminal-muted px-1 pb-1.5 flex items-center gap-1.5">
              <Layers size={11} /> Portfolios
            </p>
            <div className="space-y-1">
              {slots.map(slot => {
                const isActive = slot.index === activeSlot
                const isEditing = editingIndex === slot.index
                return (
                  <div key={slot.index} className={`group flex items-center gap-1 rounded-xl ${isActive ? 'bg-accent/10 border border-accent/30' : 'bg-terminal-bg/40 border border-transparent'}`}>
                    {isEditing ? (
                      <>
                        <input
                          autoFocus
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') { setEditingIndex(null); setEditName('') } }}
                          maxLength={20}
                          className="flex-1 bg-terminal-bg border border-terminal-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent/50"
                        />
                        <button onClick={commitEdit} className="text-gain p-2"><Check size={14} /></button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => { setActiveSlot(slot.index); onClose() }}
                          className={`flex-1 text-left px-3 py-3 text-sm font-medium truncate ${isActive ? 'text-accent' : 'text-terminal-text'}`}
                        >
                          {slot.name}
                        </button>
                        <button onClick={() => startEdit(slot.index, slot.name)} className="text-terminal-muted p-2 active:bg-white/10 rounded-lg">
                          <Pencil size={14} />
                        </button>
                        {slots.length > 1 && (
                          <button onClick={() => handleDelete(slot.index, slot.name)} className="text-terminal-muted active:text-loss p-2 mr-1 active:bg-white/10 rounded-lg">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )
              })}
              {slots.length < maxSlots && (
                <button
                  onClick={() => addSlot()}
                  className="w-full flex items-center gap-2 px-3 py-3 text-sm text-terminal-muted active:text-accent rounded-xl border border-dashed border-terminal-border active:border-accent/30"
                >
                  <Plus size={14} /> New portfolio
                </button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-1 pt-2 border-t border-terminal-border">
            <button
              onClick={() => { onResetActive(); onClose() }}
              className="w-full flex items-center gap-3 px-3 py-3 text-sm text-terminal-muted active:text-loss rounded-xl active:bg-white/5"
            >
              <RotateCcw size={16} /> Reset active portfolio
            </button>
            <button
              onClick={() => { logout(); onClose() }}
              className="w-full flex items-center gap-3 px-3 py-3 text-sm text-terminal-muted active:text-loss rounded-xl active:bg-white/5"
            >
              <LogOut size={16} /> Log out
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
