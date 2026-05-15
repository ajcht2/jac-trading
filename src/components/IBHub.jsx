import {
  Calculator, Briefcase, PiggyBank, FileSpreadsheet, ScrollText, BarChart3,
  FileText, MessageSquare, FolderOpen, Sigma, GraduationCap, ArrowRight,
  Building2, Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const TOPICS = [
  {
    id: 'valuation',
    icon: Calculator,
    color: '#3b82f6',
    title: 'Valuation',
    desc: 'DCF, trading comparables, precedent transactions, and the football-field range bankers present on every pitch.',
    badge: '6 lessons · interactive tool',
    to: '/valuation',
    secondary: { to: '/m-and-a', label: 'Theory' },
  },
  {
    id: 'mna',
    icon: Briefcase,
    color: '#a855f7',
    title: 'M&A',
    desc: 'Deal types, stock vs asset structures, methods of payment, accretion / dilution and the bidder rationale.',
    badge: '5 lessons',
    to: '/m-and-a',
  },
  {
    id: 'pe',
    icon: PiggyBank,
    color: '#dc2626',
    title: 'Private Equity',
    desc: 'LBO mechanics, sources & uses, IRR / MOIC, the value-creation bridge, and how PE firms actually earn their fees.',
    badge: '4 lessons · interactive LBO',
    to: '/lbo',
    secondary: { to: '/m-and-a', label: 'Theory' },
  },
  {
    id: 'modeling',
    icon: FileSpreadsheet,
    color: '#10b981',
    title: 'Financial Modeling',
    desc: 'Three-statement modeling, operating model builds, scenario / sensitivity tables, and the standard banker layout.',
    badge: 'Course modules',
    to: '/financial-modeling',
  },
  {
    id: 'accounting',
    icon: ScrollText,
    color: '#0891b2',
    title: 'Accounting',
    desc: 'Income statement, balance sheet, cash flow — how they link, where they break, and the line items bankers care about.',
    badge: 'Course module',
    to: '/accounting',
  },
  {
    id: 'markets',
    icon: BarChart3,
    color: '#f59e0b',
    title: 'Markets',
    desc: 'Asset classes, market structure, how prices form, the role of dealers and market makers — the macro lens.',
    badge: 'Live data + lessons',
    to: '/markets',
  },
  {
    id: 'process',
    icon: FileText,
    color: '#06b6d4',
    title: 'Deal Process',
    desc: 'Origination → pitch → CIM → IOI → diligence → LOI → SPA → closing. The 6 to 18 month timeline a banker lives in.',
    badge: '4 phases · 1 lesson',
    to: '/deal-process',
  },
  {
    id: 'interview',
    icon: MessageSquare,
    color: '#ef4444',
    title: 'Interview Prep',
    desc: 'Technicals (walk me through a DCF, accretion / dilution, EV vs Equity), behavioural answers, super-day patterns.',
    badge: 'Question bank',
    to: '/interview-prep',
  },
  {
    id: 'cases',
    icon: FolderOpen,
    color: '#8b5cf6',
    title: 'Case Studies',
    desc: 'Step-by-step write-ups of recent public deals: rationale, structure, valuation, synergies, risks.',
    badge: 'Live & curated',
    to: '/case-studies',
  },
  {
    id: 'excel',
    icon: Sigma,
    color: '#16a34a',
    title: 'Excel Skills',
    desc: 'The shortcuts, formulas, and formatting standards every banker uses daily. Built for muscle memory.',
    badge: 'Tutorial track',
    to: '/excel',
  },
  {
    id: 'careers',
    icon: GraduationCap,
    color: '#eab308',
    title: 'Career Resources',
    desc: 'Application timelines, CV structure for IB, division and bulge / boutique differences, exit opportunities.',
    badge: 'Guides',
    to: '/careers',
  },
]

export default function IBHub() {
  return (
    <div className="space-y-8 max-w-[1100px]">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-[11px] font-semibold uppercase tracking-wider text-accent">
          <Building2 size={12} /> Investment Banking · Complete curriculum
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
          Everything an IB analyst needs,<br />
          <span className="bg-gradient-to-r from-accent via-purple-400 to-gain bg-clip-text text-transparent">
            in one place.
          </span>
        </h1>
        <p className="text-sm sm:text-base text-terminal-muted leading-relaxed max-w-2xl">
          Eleven topics covering valuation, M&amp;A, leveraged finance, modeling, accounting, markets, deal process, interview prep, case studies, Excel, and careers. Each section is interactive where it makes sense, with citations to real sources (Damodaran, Wall Street Prep, Rosenbaum, CFA).
        </p>
      </div>

      {/* Topic grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {TOPICS.map(t => <TopicCard key={t.id} topic={t} />)}
      </div>

      {/* Featured shortcut row */}
      <div className="panel p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-accent" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-accent">Start here</h2>
        </div>
        <p className="text-sm text-terminal-muted">
          New to the curriculum? Three good entry points:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <Shortcut to="/m-and-a" icon={Briefcase} label="Read the M&A theory" sub="20 min · foundations" />
          <Shortcut to="/lbo"     icon={PiggyBank} label="Build an LBO live"   sub="Adjustable inputs · IRR / MOIC" />
          <Shortcut to="/courses" icon={GraduationCap} label="Browse 32 lessons" sub="8 numbered courses · video + text" />
        </div>
      </div>
    </div>
  )
}

function TopicCard({ topic }) {
  const Icon = topic.icon
  return (
    <Link
      to={topic.to}
      className="group panel p-5 hover:border-accent/30 transition-all flex flex-col gap-3"
      style={{ borderColor: 'transparent' }}
    >
      <div className="flex items-center justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: topic.color + '18' }}
        >
          <Icon size={18} style={{ color: topic.color }} />
        </div>
        <ArrowRight size={14} className="text-terminal-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
      </div>
      <div className="flex-1">
        <h3 className="text-base font-bold leading-tight">{topic.title}</h3>
        <p className="text-xs text-terminal-muted mt-1.5 leading-relaxed">{topic.desc}</p>
      </div>
      <div className="flex items-center justify-between pt-1">
        <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: topic.color }}>
          {topic.badge}
        </span>
        {topic.secondary && (
          <Link
            to={topic.secondary.to}
            onClick={e => e.stopPropagation()}
            className="text-[10px] text-terminal-muted hover:text-accent underline-offset-2 hover:underline"
          >
            {topic.secondary.label} →
          </Link>
        )}
      </div>
    </Link>
  )
}

function Shortcut({ to, icon: Icon, label, sub }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 bg-terminal-bg/40 hover:bg-terminal-bg/70 border border-terminal-border hover:border-accent/30 rounded-xl px-3 py-2.5 transition-all"
    >
      <Icon size={16} className="text-accent shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold truncate">{label}</p>
        <p className="text-[10px] text-terminal-muted truncate">{sub}</p>
      </div>
      <ArrowRight size={12} className="text-terminal-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all shrink-0" />
    </Link>
  )
}
