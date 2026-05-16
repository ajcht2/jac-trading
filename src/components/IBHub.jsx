import {
  Calculator, Briefcase, PiggyBank, FileSpreadsheet, ScrollText, BarChart3,
  FileText, MessageSquare, FolderOpen, Sigma, GraduationCap, ArrowRight,
  Building2, Sparkles, BookOpen, Wrench,
} from 'lucide-react'
import { Link } from 'react-router-dom'

// Each topic exposes a `learn` action (always present — theory / course)
// and an optional `interact` action that appears only when an existing
// interactive tool covers the topic. No new interactive tools are introduced
// here — only the existing /valuation, /lbo, /markets pages are reused.
const TOPICS = [
  {
    id: 'valuation',
    icon: Calculator,
    color: '#3b82f6',
    title: 'Valuation',
    desc: 'DCF, trading comparables, precedent transactions, and the football-field range bankers present on every pitch.',
    learn:    { to: '/m-and-a',   label: 'Learn the theory'  },
    interact: { to: '/valuation', label: 'Build a valuation' },
  },
  {
    id: 'mna',
    icon: Briefcase,
    color: '#a855f7',
    title: 'M&A',
    desc: 'Deal types, stock vs asset structures, methods of payment, accretion / dilution and the bidder rationale.',
    learn:    { to: '/m-and-a',      label: 'Read the lessons' },
    interact: { to: '/case-studies', label: 'Study real deals' },
  },
  {
    id: 'pe',
    icon: PiggyBank,
    color: '#dc2626',
    title: 'Private Equity',
    desc: 'LBO mechanics, sources & uses, IRR / MOIC, the value-creation bridge, and how PE firms earn their fees.',
    learn:    { to: '/m-and-a', label: 'Learn the theory' },
    interact: { to: '/lbo',     label: 'Build an LBO'     },
  },
  {
    id: 'modeling',
    icon: FileSpreadsheet,
    color: '#10b981',
    title: 'Financial Modeling',
    desc: '3-statement, DCF, LBO, merger and comps models — the five every analyst builds.',
    learn:    { to: '/financial-modeling', label: 'Modeling guide' },
    interact: { to: '/lbo',                label: 'Run the LBO'    },
  },
  {
    id: 'accounting',
    icon: ScrollText,
    color: '#0891b2',
    title: 'Accounting',
    desc: 'Income statement, balance sheet, cash flow — how they link and the lines bankers care about.',
    learn:    { to: '/accounting', label: 'Read the deep dive' },
    // no native interactive tool — only learn button
  },
  {
    id: 'markets',
    icon: BarChart3,
    color: '#f59e0b',
    title: 'Markets',
    desc: 'Asset classes, market structure, how prices form, dealers and market makers.',
    learn:    { to: '/courses',  label: 'Markets curriculum' },
    interact: { to: '/markets',  label: 'Live dashboard'      },
  },
  {
    id: 'process',
    icon: FileText,
    color: '#06b6d4',
    title: 'Deal Process',
    desc: 'Origination → pitch → CIM → IOI → diligence → LOI → SPA → closing. The 6 to 18 month timeline.',
    learn:    { to: '/deal-process', label: 'Walk the timeline' },
    // no native interactive tool
  },
  {
    id: 'interview',
    icon: MessageSquare,
    color: '#ef4444',
    title: 'Interview Prep',
    desc: 'Technicals (walk me through a DCF, accretion / dilution, EV vs Equity), behavioural answers, super-day patterns.',
    learn: { to: '/interview-prep', label: 'Open question bank' },
  },
  {
    id: 'cases',
    icon: FolderOpen,
    color: '#8b5cf6',
    title: 'Case Studies',
    desc: 'Step-by-step write-ups of recent public deals: rationale, structure, valuation, synergies, risks.',
    learn: { to: '/case-studies', label: 'Read the deals' },
  },
  {
    id: 'excel',
    icon: Sigma,
    color: '#16a34a',
    title: 'Excel Skills',
    desc: 'The shortcuts, formulas, and formatting standards every banker uses daily.',
    learn: { to: '/excel', label: 'Open the cheat sheet' },
  },
  {
    id: 'careers',
    icon: GraduationCap,
    color: '#eab308',
    title: 'Career Resources',
    desc: 'Recruiting timeline, CV structure, BB / EB / MM tiers, and exit paths into PE / HF / Corp Dev.',
    learn: { to: '/careers', label: 'Read the guide' },
  },
]

export default function IBHub() {
  return (
    <div className="space-y-10 max-w-[1100px] mx-auto">
      {/* Header — centered */}
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-[11px] font-semibold uppercase tracking-wider text-accent">
          <Building2 size={12} /> Investment Banking · Complete curriculum
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
          Everything an IB analyst needs,<br />
          <span className="bg-gradient-to-r from-accent via-purple-400 to-gain bg-clip-text text-transparent">
            in one place.
          </span>
        </h1>
        <p className="text-sm sm:text-base text-terminal-muted leading-relaxed max-w-2xl mx-auto">
          Eleven topics covering valuation, M&amp;A, leveraged finance, modeling, accounting, markets, deal process, interview prep, case studies, Excel and careers. Each topic offers a course you can read — and an interactive tool when one exists.
        </p>
      </div>

      {/* Topic grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOPICS.map(t => <TopicCard key={t.id} topic={t} />)}
      </div>

      {/* Featured shortcut row — centered */}
      <div className="panel p-5 sm:p-6 space-y-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <Sparkles size={14} className="text-accent" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-accent">Start here</h2>
        </div>
        <p className="text-sm text-terminal-muted max-w-xl mx-auto">
          New to the curriculum? Three good entry points:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <Shortcut to="/m-and-a" icon={Briefcase}     label="Read M&A theory"      sub="20 min · foundations" />
          <Shortcut to="/lbo"     icon={PiggyBank}     label="Build an LBO live"    sub="Sliders · IRR / MOIC" />
          <Shortcut to="/courses" icon={GraduationCap} label="Browse 32 lessons"    sub="8 numbered courses" />
        </div>
      </div>
    </div>
  )
}

function TopicCard({ topic }) {
  const Icon = topic.icon
  const hasBoth = topic.learn && topic.interact

  return (
    <div className="panel p-5 flex flex-col gap-4 hover:border-accent/30 transition-all text-center">
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: topic.color + '18' }}
        >
          <Icon size={20} style={{ color: topic.color }} />
        </div>
        <div>
          <h3 className="text-base font-bold leading-tight">{topic.title}</h3>
          <p className="text-xs text-terminal-muted mt-1.5 leading-relaxed">{topic.desc}</p>
        </div>
      </div>

      <div className={`flex gap-2 mt-auto pt-1 ${hasBoth ? '' : 'justify-center'}`}>
        {topic.learn && (
          <Link
            to={topic.learn.to}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-terminal-border bg-terminal-bg/40 hover:bg-terminal-bg/70 hover:border-accent/30 text-terminal-text transition-all"
          >
            <BookOpen size={11} /> {topic.learn.label}
          </Link>
        )}
        {topic.interact && (
          <Link
            to={topic.interact.to}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:brightness-110"
            style={{ backgroundColor: topic.color }}
          >
            <Wrench size={11} /> {topic.interact.label}
          </Link>
        )}
      </div>
    </div>
  )
}

function Shortcut({ to, icon: Icon, label, sub }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 bg-terminal-bg/40 hover:bg-terminal-bg/70 border border-terminal-border hover:border-accent/30 rounded-xl px-3 py-2.5 transition-all text-left"
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
