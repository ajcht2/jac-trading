import { FileSpreadsheet, ArrowRight, Calculator, PiggyBank, BookOpen, Layers, Target } from 'lucide-react'
import { Link } from 'react-router-dom'

const MODELS = [
  {
    name: '3-Statement Operating Model',
    color: '#3b82f6',
    purpose: 'The foundation of every IB model. Forecasts the income statement, balance sheet, and cash flow statement consistently for 5-10 years.',
    inputs: ['Revenue assumptions (volume × price)', 'Margin assumptions (gross, EBITDA)', 'CapEx as % of revenue', 'Working capital days', 'Tax rate'],
    output: 'A self-balancing financial forecast — base for any DCF, LBO, or merger model.',
  },
  {
    name: 'DCF Model',
    color: '#a855f7',
    purpose: 'Discount projected free cash flows to present value. Most rigorous intrinsic valuation method.',
    inputs: ['5-10 year FCF forecast', 'WACC (or cost of equity)', 'Terminal growth rate (Gordon) or exit multiple', 'Net debt for equity bridge'],
    output: 'Enterprise value → Equity value → Share price. Always with sensitivity tables on WACC × g.',
  },
  {
    name: 'LBO Model',
    color: '#dc2626',
    purpose: 'Models a private-equity acquisition with leverage. Outputs sponsor returns (IRR, MOIC).',
    inputs: ['Purchase price (entry EV / EBITDA)', 'Capital structure (debt / equity mix)', 'Interest rates by debt tranche', 'EBITDA growth, exit multiple', 'Hold period'],
    output: 'Year-by-year debt paydown, exit equity, IRR, MOIC, value-creation bridge.',
  },
  {
    name: 'Merger Model (Accretion/Dilution)',
    color: '#10b981',
    purpose: 'Tests whether an acquisition is accretive or dilutive to the buyer\'s EPS.',
    inputs: ['Buyer & target financials', 'Purchase price + premium', 'Form of consideration (cash, stock, mixed)', 'Synergies (cost / revenue)', 'Financing assumptions'],
    output: 'Pro-forma EPS, accretion / dilution percentage, breakeven synergies.',
  },
  {
    name: 'Trading Comps & Precedents',
    color: '#f59e0b',
    purpose: 'Relative valuation — apply peer or past-deal multiples to the target.',
    inputs: ['Peer / past deal financials (LTM Rev, EBITDA)', 'Calendarised forward figures', 'Filtering for size / growth / geography'],
    output: 'Football-field implied EV range. Always presented alongside DCF.',
  },
]

const PRINCIPLES = [
  { rule: 'Inputs separated from logic',          why: 'Every assumption sits in one cell, easily found, easily flexed. Never hard-coded inside a formula.' },
  { rule: 'Forecast period 5-10 years',           why: 'Three years too short — terminal value dominates. Twenty years pure fantasy.' },
  { rule: 'Always build in toggles for scenarios', why: 'Base / Upside / Downside. CHOOSE function controlled by a single scenario cell.' },
  { rule: 'Sanity-check with multiples',          why: 'Implied exit P/E, EV/EBITDA from the DCF must look reasonable. If not, your assumptions are off.' },
  { rule: 'No circular references except interest', why: 'Circular reference between interest expense and debt is expected. Anything else is a bug.' },
  { rule: 'Comment any non-obvious cell',         why: 'Future-you and the VP will thank you. Especially on the rev build and tax schedule.' },
]

export default function FinancialModeling() {
  return (
    <div className="space-y-6 max-w-[1000px]">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <FileSpreadsheet size={22} className="text-emerald-500" /> Financial Modeling
        </h1>
        <p className="text-sm text-terminal-muted mt-1">
          The five models every IB analyst builds. Same logic, different outputs.
        </p>
      </div>

      {/* Models */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-500">The Five Core Models</h2>
        {MODELS.map(m => (
          <div key={m.name} className="panel p-5 space-y-3" style={{ borderColor: m.color + '30' }}>
            <div>
              <h3 className="text-base font-bold" style={{ color: m.color }}>{m.name}</h3>
              <p className="text-sm text-terminal-muted mt-0.5">{m.purpose}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-terminal-muted mb-1.5">Inputs</p>
              <div className="flex flex-wrap gap-1.5">
                {m.inputs.map((i, idx) => (
                  <span key={idx} className="text-[11px] font-mono px-2 py-1 rounded bg-terminal-bg border border-terminal-border">{i}</span>
                ))}
              </div>
            </div>
            <div className="text-xs text-terminal-text/80 border-l-2 pl-3" style={{ borderColor: m.color + '60' }}>
              <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: m.color }}>Output</span>
              <p className="mt-1 leading-relaxed">{m.output}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Principles */}
      <section className="panel p-5 space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-2">
          <Target size={14} /> Modeling Principles
        </h2>
        <div className="space-y-2">
          {PRINCIPLES.map((p, i) => (
            <div key={i} className="flex items-start gap-3 bg-terminal-bg/40 rounded-lg px-3 py-2.5">
              <span className="text-emerald-500 mt-1 shrink-0">✓</span>
              <div>
                <p className="text-sm font-semibold">{p.rule}</p>
                <p className="text-xs text-terminal-muted mt-0.5 leading-relaxed">{p.why}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <QuickLink to="/lbo"       icon={PiggyBank}  label="Try the LBO Model"   sub="Live sliders · IRR / MOIC" />
        <QuickLink to="/valuation" icon={Calculator} label="Try the Valuation Tool" sub="Comps + DCF · football field" />
        <QuickLink to="/courses"   icon={BookOpen}   label="Full course curriculum" sub="32 lessons · structured" />
      </div>
    </div>
  )
}

function QuickLink({ to, icon: Icon, label, sub }) {
  return (
    <Link to={to} className="panel p-4 hover:border-accent/30 transition-all flex items-center gap-3">
      <Icon size={16} className="text-accent shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold truncate">{label}</p>
        <p className="text-[10px] text-terminal-muted truncate">{sub}</p>
      </div>
      <ArrowRight size={14} className="text-terminal-muted" />
    </Link>
  )
}
