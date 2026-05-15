import { useState } from 'react'
import {
  MessageSquare, ChevronDown, ChevronUp, Target, BookOpen, AlertTriangle,
  Calculator, Briefcase, FileText,
} from 'lucide-react'

const TECHNICAL_QS = [
  {
    id: 'dcf',
    title: 'Walk me through a DCF.',
    category: 'Valuation',
    color: '#3b82f6',
    answer: [
      'A DCF values a business as the present value of its future unlevered free cash flows.',
      'Step 1 — Project unlevered free cash flow for 5-10 years (EBIT × (1−tax) + D&A − CapEx − ΔWorking Capital).',
      'Step 2 — Compute the terminal value at the end of the forecast, using either Gordon Growth (FCF × (1+g) / (WACC−g)) or an exit multiple (EBITDA × multiple).',
      'Step 3 — Discount every cash flow and the terminal value to today using WACC.',
      'Step 4 — Sum to Enterprise Value. Subtract net debt to bridge to Equity Value. Divide by diluted shares for share price.',
      'Always present with a sensitivity table (WACC × g) because the answer swings 20-40 % across reasonable assumptions.',
    ],
  },
  {
    id: 'ev_equity',
    title: 'What\'s the difference between Enterprise Value and Equity Value?',
    category: 'Valuation',
    color: '#3b82f6',
    answer: [
      'Enterprise Value is the cost to buy the whole company — every claim on its cash flows. Equity Value is the cost to buy just the stock.',
      'EV = Equity Value + Net Debt + Preferred Stock + Minority Interest (− Non-operating assets).',
      'Pair EV with operating metrics (EV/Revenue, EV/EBITDA, EV/EBIT) because both are capital-structure-neutral and pre-interest.',
      'Pair Equity Value with equity metrics (P/E, P/Book) because Net Income is already post-interest.',
      'In M&A the headline price is usually the EV. The seller gets the Equity Value after the bridge.',
    ],
  },
  {
    id: 'wacc',
    title: 'How do you calculate WACC?',
    category: 'Valuation',
    color: '#3b82f6',
    answer: [
      'WACC = (E/V) × Re + (D/V) × Rd × (1−Tc).',
      'E and D are the market values of equity and debt; V = E + D.',
      'Re (cost of equity) is most commonly estimated via CAPM: Re = Rf + β × (Rm−Rf), with Rf the 10-year govt yield, β the levered beta of the company, and (Rm−Rf) the equity risk premium (~5-6 % in developed markets).',
      'Rd is the company\'s pre-tax cost of debt; (1−Tc) captures the tax shield since interest is deductible.',
      'A small change in WACC has a big DCF impact — that\'s why bankers obsess over it and always show a WACC × g sensitivity.',
    ],
  },
  {
    id: 'accretion_dilution',
    title: 'How do you tell if an acquisition is accretive or dilutive?',
    category: 'M&A',
    color: '#a855f7',
    answer: [
      'Combine pro-forma net income and pro-forma share count. If new EPS > standalone EPS, accretive.',
      'Pro-forma Net Income = Buyer NI + Target NI − after-tax interest on new debt + after-tax synergies (if used).',
      'Pro-forma Shares = Buyer shares + new shares issued for stock consideration.',
      'Quick rule for all-stock deals: accretive when buyer\'s P/E > target\'s P/E.',
      'Quick rule for all-cash deals: accretive when target\'s after-tax yield (target NI / purchase price) > after-tax cost of cash or debt used.',
    ],
  },
  {
    id: 'lbo_returns',
    title: 'What drives LBO returns?',
    category: 'LBO / PE',
    color: '#dc2626',
    answer: [
      'Three drivers, captured by the value-creation bridge: EBITDA growth, multiple expansion, and debt paydown.',
      'EBITDA growth: grow the target\'s earnings through pricing, cost cuts, bolt-on M&A — operational.',
      'Multiple expansion: exit at a higher EV/EBITDA than entry. Out of the sponsor\'s direct control if it\'s pure market beta.',
      'Debt paydown: use the company\'s cash flow to repay debt, so more of the exit EV flows to equity.',
      'Target IRR: 20-25 %, target MOIC: 2.5-3.0× over a 5-year hold. Sponsors aim NOT to depend on multiple expansion.',
    ],
  },
  {
    id: 'three_statements',
    title: 'If depreciation goes up by $10, walk me through the three statements.',
    category: 'Accounting',
    color: '#0891b2',
    answer: [
      'Income statement: Pre-tax income falls by $10. At a 25 % tax rate, tax falls by $2.50, so net income falls by $7.50.',
      'Cash flow statement: Start with net income (down $7.50), add back D&A (+$10). Net change in cash = +$2.50.',
      'Balance sheet: PP&E down $10 (accumulated depreciation). Cash up $2.50. Retained Earnings down $7.50 (net income flow-through).',
      'Both sides of the balance sheet move by net −$7.50 — it balances. Tax shield = $2.50.',
      'This is the most famous IB interview question. Master it cold.',
    ],
  },
  {
    id: 'ebitda',
    title: 'Why do bankers focus on EBITDA?',
    category: 'Accounting',
    color: '#0891b2',
    answer: [
      'EBITDA = Earnings Before Interest, Tax, Depreciation, Amortisation.',
      'It strips out capital structure (interest), tax regime, and non-cash items — so it\'s comparable across companies and geographies.',
      'It\'s a proxy for operating cash flow (though not perfect — ignores working capital and capex).',
      'EV/EBITDA is the most common multiple in M&A precisely because both numerator and denominator are capital-structure-neutral.',
      'Watch out for "Adjusted EBITDA" — companies regularly add back questionable items (severance, "exceptional" legal fees) to flatter the figure.',
    ],
  },
  {
    id: 'pe_ratio',
    title: 'When would you use P/E vs EV/EBITDA?',
    category: 'Valuation',
    color: '#3b82f6',
    answer: [
      'EV/EBITDA: when comparing companies with different capital structures. Pre-interest, pre-tax → apples-to-apples.',
      'P/E: when comparing companies with similar leverage and tax. Equity-side, post-interest.',
      'For banks and insurers, neither works well — use P/Tangible Book Value or P/E on normalised earnings.',
      'For unprofitable / early-stage businesses (SaaS, biotech), EV/Revenue is the go-to.',
      'For real estate, P/FFO; for resource extraction, EV/Reserves.',
    ],
  },
  {
    id: 'synergies',
    title: 'What\'s the difference between cost and revenue synergies?',
    category: 'M&A',
    color: '#a855f7',
    answer: [
      'Cost synergies: eliminate redundant overhead, consolidate vendors and IT, close offices. Tangible — 50-70 % realisation rate.',
      'Revenue synergies: cross-sell, expanded geography, bundling. Aspirational — only 30-50 % materialise.',
      'Cost synergies are largely under the buyer\'s control. Revenue synergies require the combined sales force to actually execute.',
      'Account for cost-to-achieve (severance, consulting, integration tech) — typically 1-2× the annual run-rate.',
      'Famous failures: AOL-Time Warner (convergence synergies never materialised, $200B+ destroyed), HP-Autonomy ($8.8B write-down in 13 months).',
    ],
  },
  {
    id: 'why_ib',
    title: 'Why investment banking? (behavioural)',
    category: 'Behavioural',
    color: '#f59e0b',
    answer: [
      'Strong answers ground in a SPECIFIC experience: a class project, a club deal, an internship that exposed you to the work.',
      'Tie that experience to what you find intellectually engaging — valuation logic, deal structuring, the analytical rigour.',
      'Articulate awareness of the trade-offs — hours, intensity — and why you accept them (steep learning curve, exposure to senior decision-makers, foundational training for any later career).',
      'Avoid the dead clichés: "fast-paced environment", "smart people", "I like finance".',
      'Best length: 60-90 seconds. End by linking back to the specific group / sector you\'re applying to.',
    ],
  },
  {
    id: 'walk_me_through',
    title: 'Walk me through your CV.',
    category: 'Behavioural',
    color: '#f59e0b',
    answer: [
      'Two-minute structure: education → internships in chronological order → personal interests / skills → why this firm.',
      'Frame each role around what you learned and accomplished, not what you did day-to-day.',
      'Quantify where you can: "modelled an LBO returning 22 % IRR", "screened 40 SaaS targets across a $50M-$200M revenue band".',
      'End with a forward-looking sentence: why this group, why this firm, why now.',
      'Practise out loud until you can deliver it without notes. Cleaner than reciting bullet points.',
    ],
  },
  {
    id: 'superday',
    title: 'What\'s a Super Day and how do I prepare?',
    category: 'Process',
    color: '#10b981',
    answer: [
      'A Super Day is the final on-site interview round — usually 3-6 back-to-back interviews with analysts, associates, VPs, and sometimes an MD.',
      'Format alternates between technical (DCF, accretion, deal structuring) and behavioural (motivation, teamwork, leadership stories).',
      'Bring printed copies of your CV and a notebook. Take brief notes when interviewers describe their group.',
      'Have 3-5 prepared questions per interviewer, ranging from group culture to current deal flow.',
      'Most decisions are made in the corridor between interviews — your energy in the last hour matters as much as the first.',
    ],
  },
]

const CATEGORIES = ['All', 'Valuation', 'M&A', 'LBO / PE', 'Accounting', 'Behavioural', 'Process']

export default function InterviewPrep() {
  const [openId, setOpenId] = useState(null)
  const [filter, setFilter] = useState('All')

  const filtered = filter === 'All' ? TECHNICAL_QS : TECHNICAL_QS.filter(q => q.category === filter)

  return (
    <div className="space-y-6 max-w-[1000px]">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <MessageSquare size={22} className="text-red-400" /> Interview Prep
        </h1>
        <p className="text-sm text-terminal-muted mt-1">
          The questions every IB candidate gets asked — model answers with the reasoning bankers actually want to hear.
        </p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === c
                ? 'bg-accent/10 text-accent border border-accent/30'
                : 'bg-terminal-panel/40 text-terminal-muted border border-terminal-border hover:text-terminal-text'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <p className="text-xs text-terminal-muted">{filtered.length} questions</p>

      {/* Questions */}
      <div className="space-y-3">
        {filtered.map(q => {
          const isOpen = openId === q.id
          return (
            <div
              key={q.id}
              className="panel transition-all overflow-hidden"
              style={isOpen ? { borderColor: q.color + '40' } : {}}
            >
              <button
                onClick={() => setOpenId(isOpen ? null : q.id)}
                className="w-full text-left p-4 flex items-start gap-4"
              >
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded shrink-0 mt-0.5"
                  style={{ backgroundColor: q.color + '15', color: q.color }}
                >
                  {q.category}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{q.title}</p>
                </div>
                {isOpen ? <ChevronUp size={16} className="text-terminal-muted shrink-0 mt-1" /> : <ChevronDown size={16} className="text-terminal-muted shrink-0 mt-1" />}
              </button>

              {isOpen && (
                <div className="px-4 pb-5 pt-1 space-y-2 pl-[78px]">
                  {q.answer.map((line, i) => (
                    <p key={i} className="text-sm leading-relaxed text-terminal-text/85 flex items-start gap-2">
                      <span className="text-terminal-muted mt-1.5 shrink-0">•</span>
                      <span>{line}</span>
                    </p>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
