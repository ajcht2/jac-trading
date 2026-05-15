import { ScrollText, BookOpen, Calculator, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const STATEMENTS = [
  {
    name: 'Income Statement (P&L)',
    color: '#3b82f6',
    purpose: 'Profitability over a period (quarter or year).',
    keyLines: ['Revenue', 'COGS → Gross Profit', 'Operating Expenses → EBIT', 'Interest → Pre-tax Income', 'Tax → Net Income'],
    insight: 'Net Income at the bottom is what flows into Retained Earnings on the balance sheet. Bankers focus on EBITDA — a non-GAAP cousin that strips interest, tax and non-cash D&A.',
  },
  {
    name: 'Balance Sheet',
    color: '#a855f7',
    purpose: 'Snapshot of what the company owns and owes at a specific moment.',
    keyLines: ['Assets = Liabilities + Equity', 'Current vs Long-term', 'Working Capital = CA − CL', 'Goodwill (from M&A)', 'Retained Earnings'],
    insight: 'Must always balance. In modeling, the balance sheet is where errors hide — if assets ≠ L + E, something is wrong upstream.',
  },
  {
    name: 'Cash Flow Statement',
    color: '#10b981',
    purpose: 'Tracks the actual cash moves over the period — bridges Net Income to change in cash.',
    keyLines: ['Operating CF (NI + non-cash + Δ working capital)', 'Investing CF (CapEx, acquisitions)', 'Financing CF (debt, equity, dividends)', '→ Net change in cash'],
    insight: 'The most honest of the three. Earnings can be massaged; cash is cash. Free Cash Flow = Operating CF − CapEx is the metric most valuation methods centre on.',
  },
]

const CLASSIC_QS = [
  {
    q: 'If depreciation goes up by $10, walk me through the three statements.',
    a: [
      'IS: Pre-tax income falls $10. Tax (25 %) falls $2.50. Net income falls $7.50.',
      'CFS: Net income down $7.50, but +$10 D&A add-back. Net change in cash: +$2.50.',
      'BS: PP&E down $10. Cash up $2.50. Retained earnings down $7.50. Balances.',
    ],
  },
  {
    q: 'How is EBITDA related to operating cash flow?',
    a: [
      'EBITDA is operating profit before non-cash items (D&A) — close to a cash proxy, but pre-tax and pre-working-capital.',
      'Operating Cash Flow = Net Income + D&A − Δ Working Capital. Already after tax.',
      'EBITDA / OCF gap = tax paid + working capital build.',
    ],
  },
  {
    q: 'What\'s the difference between accounts receivable and deferred revenue?',
    a: [
      'AR: customer owes you cash for a service / product you\'ve already delivered.',
      'Deferred Revenue: customer has paid you in advance for a service you haven\'t yet delivered.',
      'AR is on the asset side, deferred revenue on the liability side.',
    ],
  },
]

export default function Accounting() {
  return (
    <div className="space-y-6 max-w-[1000px]">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <ScrollText size={22} className="text-cyan-500" /> Accounting
        </h1>
        <p className="text-sm text-terminal-muted mt-1">
          The three statements, how they link, and the accounting topics every IB interview pulls from.
        </p>
      </div>

      {/* The three statements */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-500">The Three Statements</h2>
        {STATEMENTS.map(s => (
          <div key={s.name} className="panel p-5 space-y-3" style={{ borderColor: s.color + '30' }}>
            <div>
              <h3 className="text-base font-bold" style={{ color: s.color }}>{s.name}</h3>
              <p className="text-sm text-terminal-muted mt-0.5">{s.purpose}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {s.keyLines.map((l, i) => (
                <span key={i} className="text-[11px] font-mono px-2 py-1 rounded bg-terminal-bg border border-terminal-border">{l}</span>
              ))}
            </div>
            <p className="text-xs text-terminal-text/80 leading-relaxed border-l-2 pl-3" style={{ borderColor: s.color + '60' }}>{s.insight}</p>
          </div>
        ))}
      </section>

      {/* Classic Qs */}
      <section className="panel p-5 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-500 flex items-center gap-2">
          <Calculator size={14} /> Classic Interview Questions
        </h2>
        {CLASSIC_QS.map((qa, i) => (
          <div key={i} className="space-y-2">
            <p className="text-sm font-semibold">{qa.q}</p>
            <div className="space-y-1 pl-4">
              {qa.a.map((line, j) => (
                <p key={j} className="text-sm text-terminal-text/85 flex items-start gap-2">
                  <span className="text-terminal-muted mt-1 shrink-0">•</span>{line}
                </p>
              ))}
            </div>
          </div>
        ))}
      </section>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/courses" className="flex-1 panel p-4 hover:border-accent/30 flex items-center justify-between transition-all">
          <div className="flex items-center gap-3">
            <BookOpen size={16} className="text-accent" />
            <div>
              <p className="text-sm font-semibold">Three-statement deep dive</p>
              <p className="text-xs text-terminal-muted">M&A Track · Lesson 1.2</p>
            </div>
          </div>
          <ArrowRight size={14} className="text-terminal-muted" />
        </Link>
        <Link to="/interview-prep" className="flex-1 panel p-4 hover:border-accent/30 flex items-center justify-between transition-all">
          <div className="flex items-center gap-3">
            <Calculator size={16} className="text-accent" />
            <div>
              <p className="text-sm font-semibold">More interview questions</p>
              <p className="text-xs text-terminal-muted">Accounting category</p>
            </div>
          </div>
          <ArrowRight size={14} className="text-terminal-muted" />
        </Link>
      </div>
    </div>
  )
}
