import { useState, useMemo } from 'react'
import {
  PiggyBank, Calculator, TrendingUp, DollarSign, Layers,
  ArrowRight, Info, Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'

// Simple LBO mechanics — educational, not bank-grade.
//   Year t:
//     EBITDA(t)    = EBITDA(t-1) × (1+g)
//     Interest(t)  = Debt(t-1) × rate
//     FCF(t)       = (EBITDA(t) - Interest(t)) × (1 - tax)
//     Debt(t)      = max(0, Debt(t-1) - FCF(t))    // 100% sweep
//   Exit:
//     Exit EV     = EBITDA(H) × Exit Multiple
//     Exit Equity = Exit EV - Debt(H)
//     MOIC        = Exit Equity / Initial Equity
//     IRR         = MOIC^(1/H) - 1
function computeLbo({ enterpriseValue, entryEbitda, equityPct, debtRate, ebitdaGrowth, holdYears, exitMultiple, taxRate }) {
  const initialEquity = enterpriseValue * (equityPct / 100)
  const initialDebt   = enterpriseValue - initialEquity
  const entryMultiple = entryEbitda > 0 ? enterpriseValue / entryEbitda : 0

  const years = []
  let debt = initialDebt
  let ebitda = entryEbitda

  for (let t = 1; t <= holdYears; t++) {
    ebitda = ebitda * (1 + ebitdaGrowth / 100)
    const interest = debt * (debtRate / 100)
    const pretax = ebitda - interest
    const tax = Math.max(0, pretax) * (taxRate / 100)
    const fcf = pretax - tax
    const openingDebt = debt
    debt = Math.max(0, debt - Math.max(0, fcf))
    years.push({
      year: t,
      ebitda,
      interest,
      pretax,
      tax,
      fcf,
      openingDebt,
      closingDebt: debt,
      debtPaid: openingDebt - debt,
    })
  }

  const exitEbitda = ebitda
  const exitEv = exitEbitda * exitMultiple
  const exitEquity = exitEv - debt
  const moic = initialEquity > 0 ? exitEquity / initialEquity : 0
  const irr = initialEquity > 0 && exitEquity > 0
    ? Math.pow(exitEquity / initialEquity, 1 / holdYears) - 1
    : null

  // Value-creation bridge: how much equity growth came from each driver
  const multipleExpansion = (exitMultiple - entryMultiple) * exitEbitda
  const ebitdaGrowthValue = (exitEbitda - entryEbitda) * entryMultiple
  const debtPaydown = initialDebt - debt

  return {
    entryMultiple, initialEquity, initialDebt,
    exitEbitda, exitEv, exitEquity, exitDebt: debt,
    moic, irr,
    years,
    drivers: { multipleExpansion, ebitdaGrowthValue, debtPaydown },
  }
}

const fmt = (n) => '$' + Math.round(n).toLocaleString()
const fmt1 = (n) => '$' + n.toFixed(1)
const fmtX = (n) => n.toFixed(2) + '×'
const fmtPct = (n) => (n == null ? '—' : (n * 100).toFixed(1) + '%')

export default function LboModel() {
  const [inputs, setInputs] = useState({
    enterpriseValue: 500,
    entryEbitda: 70,
    equityPct: 35,
    debtRate: 7,
    ebitdaGrowth: 8,
    holdYears: 5,
    exitMultiple: 8.5,
    taxRate: 25,
  })

  const proj = useMemo(() => computeLbo(inputs), [inputs])

  const set = (key) => (v) => setInputs(s => ({ ...s, [key]: v }))

  return (
    <div className="space-y-6 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <PiggyBank size={22} className="text-red-500" /> LBO Model
          </h1>
          <p className="text-sm text-terminal-muted mt-1">
            Interactive leveraged buyout — see how sponsor returns are built from leverage, EBITDA growth, and multiple expansion.
          </p>
        </div>
        <Link to="/private-equity" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/10 text-accent text-sm font-medium hover:bg-accent/20 transition-colors">
          PE theory <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="panel p-5 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-terminal-muted flex items-center gap-2">
            <Calculator size={14} /> Deal Inputs
          </h2>

          <NumberRow label="Enterprise Value" suffix="$M" min={50} max={5000} step={10}
            value={inputs.enterpriseValue} onChange={set('enterpriseValue')} />
          <NumberRow label="Entry EBITDA" suffix="$M" min={1} max={1000} step={1}
            value={inputs.entryEbitda} onChange={set('entryEbitda')} />
          <div className="bg-terminal-bg rounded-xl px-3 py-2 flex items-center justify-between text-xs">
            <span className="text-terminal-muted">Entry Multiple</span>
            <span className="font-mono font-semibold">{fmtX(proj.entryMultiple)}</span>
          </div>

          <NumberRow label="Equity contribution" suffix="%" min={10} max={80} step={1}
            value={inputs.equityPct} onChange={set('equityPct')} />
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gain/5 border border-gain/20 rounded-xl px-3 py-2">
              <p className="text-terminal-muted">Sponsor Equity</p>
              <p className="font-mono font-semibold text-gain">{fmt(proj.initialEquity)} M</p>
            </div>
            <div className="bg-loss/5 border border-loss/20 rounded-xl px-3 py-2">
              <p className="text-terminal-muted">Debt</p>
              <p className="font-mono font-semibold text-loss">{fmt(proj.initialDebt)} M</p>
            </div>
          </div>

          <NumberRow label="Debt interest rate" suffix="%" min={1} max={15} step={0.25}
            value={inputs.debtRate} onChange={set('debtRate')} />
          <NumberRow label="EBITDA growth" suffix="% / yr" min={-5} max={30} step={0.5}
            value={inputs.ebitdaGrowth} onChange={set('ebitdaGrowth')} />
          <NumberRow label="Hold period" suffix="yrs" min={1} max={10} step={1}
            value={inputs.holdYears} onChange={set('holdYears')} />
          <NumberRow label="Exit multiple" suffix="× EBITDA" min={2} max={20} step={0.5}
            value={inputs.exitMultiple} onChange={set('exitMultiple')} />
          <NumberRow label="Tax rate" suffix="%" min={0} max={45} step={1}
            value={inputs.taxRate} onChange={set('taxRate')} />
        </div>

        {/* Returns */}
        <div className="space-y-4">
          <div className="panel p-5 space-y-4" style={{ borderColor: '#dc262640' }}>
            <h2 className="text-sm font-bold uppercase tracking-wider text-terminal-muted flex items-center gap-2">
              <Sparkles size={14} className="text-red-500" /> Sponsor Returns
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <ReturnTile label="IRR" big tone="bg-red-500/10 border-red-500/30 text-red-400"
                value={proj.irr == null ? '—' : (proj.irr * 100).toFixed(1) + '%'}
                help="Annualized return on sponsor equity" />
              <ReturnTile label="MOIC" big tone="bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                value={fmtX(proj.moic)} help="Multiple of invested capital" />
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-terminal-bg rounded-xl px-3 py-2">
                <p className="text-terminal-muted">Exit EBITDA</p>
                <p className="font-mono font-semibold mt-0.5">{fmt1(proj.exitEbitda)} M</p>
              </div>
              <div className="bg-terminal-bg rounded-xl px-3 py-2">
                <p className="text-terminal-muted">Exit EV</p>
                <p className="font-mono font-semibold mt-0.5">{fmt(proj.exitEv)} M</p>
              </div>
              <div className="bg-terminal-bg rounded-xl px-3 py-2">
                <p className="text-terminal-muted">Exit Equity</p>
                <p className="font-mono font-semibold mt-0.5 text-gain">{fmt(proj.exitEquity)} M</p>
              </div>
            </div>
          </div>

          {/* Value creation drivers */}
          <div className="panel p-5 space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-terminal-muted flex items-center gap-2">
              <TrendingUp size={14} /> Value Creation Bridge
            </h2>
            <DriverBar label="EBITDA growth"      value={proj.drivers.ebitdaGrowthValue} color="#3b82f6"
              hint="EBITDA grew × entry multiple" />
            <DriverBar label="Multiple expansion" value={proj.drivers.multipleExpansion} color="#a855f7"
              hint="Exit multiple − entry multiple, applied to exit EBITDA" />
            <DriverBar label="Debt paydown"       value={proj.drivers.debtPaydown}        color="#10b981"
              hint="Net debt reduced over hold period" />
            <p className="text-[10px] text-terminal-muted italic flex items-start gap-1.5 pt-1">
              <Info size={11} className="mt-0.5 shrink-0" />
              Educational decomposition. Real banks use formal bridges; orders of magnitude shown.
            </p>
          </div>
        </div>
      </div>

      {/* Year-by-year table */}
      <div className="panel p-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-terminal-muted mb-3 flex items-center gap-2">
          <Layers size={14} /> Year-by-Year Projection
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-terminal-muted uppercase tracking-wider border-b border-terminal-border">
                <th className="text-left py-2 px-2">Year</th>
                <th className="text-right py-2 px-2">EBITDA</th>
                <th className="text-right py-2 px-2">Interest</th>
                <th className="text-right py-2 px-2">Tax</th>
                <th className="text-right py-2 px-2">FCF</th>
                <th className="text-right py-2 px-2">Debt Paid</th>
                <th className="text-right py-2 px-2">Closing Debt</th>
              </tr>
            </thead>
            <tbody>
              {proj.years.map(y => (
                <tr key={y.year} className="border-b border-terminal-border/50">
                  <td className="py-2 px-2 font-mono">Y{y.year}</td>
                  <td className="py-2 px-2 text-right font-mono">{fmt1(y.ebitda)}</td>
                  <td className="py-2 px-2 text-right font-mono text-loss">({fmt1(y.interest)})</td>
                  <td className="py-2 px-2 text-right font-mono text-loss">({fmt1(y.tax)})</td>
                  <td className="py-2 px-2 text-right font-mono text-gain">{fmt1(y.fcf)}</td>
                  <td className="py-2 px-2 text-right font-mono text-gain">{fmt1(y.debtPaid)}</td>
                  <td className="py-2 px-2 text-right font-mono">{fmt1(y.closingDebt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-terminal-muted italic mt-3 flex items-start gap-1.5">
          <Info size={11} className="mt-0.5 shrink-0" />
          Simplifying assumptions: 100% cash sweep to debt (no dividend recap), no working-capital changes, CapEx = D&A,
          and constant interest rate. Real LBO models layer mezzanine, revolver, paid-in-kind interest, and management options.
        </p>
      </div>
    </div>
  )
}

function NumberRow({ label, suffix, value, onChange, min, max, step }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs text-terminal-muted uppercase tracking-wider">{label}</label>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            value={value}
            min={min} max={max} step={step}
            onChange={e => onChange(Number(e.target.value))}
            className="w-20 bg-terminal-bg border border-terminal-border rounded-md px-2 py-1 text-xs font-mono text-right focus:outline-none focus:border-accent/50"
          />
          <span className="text-[10px] text-terminal-muted w-12 shrink-0">{suffix}</span>
        </div>
      </div>
      <input
        type="range"
        value={value}
        min={min} max={max} step={step}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-accent"
      />
    </div>
  )
}

function ReturnTile({ label, value, big, tone, help }) {
  return (
    <div className={`rounded-2xl p-4 border ${tone}`}>
      <p className="text-[10px] uppercase tracking-wider font-semibold opacity-80">{label}</p>
      <p className={`font-mono font-bold mt-1 ${big ? 'text-3xl' : 'text-xl'}`}>{value}</p>
      {help && <p className="text-[10px] text-terminal-muted mt-1">{help}</p>}
    </div>
  )
}

function DriverBar({ label, value, color, hint }) {
  // Show a small horizontal bar normalized to a sensible max.
  const sign = value >= 0 ? '+' : '−'
  const abs = Math.abs(value)
  const scale = Math.min(100, (abs / 500) * 100) // crude visual scale
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-terminal-text font-medium">{label}</span>
        <span className="font-mono font-semibold" style={{ color }}>
          {sign}{fmt(abs)} M
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-terminal-bg overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${scale}%`, backgroundColor: color }} />
      </div>
      {hint && <p className="text-[10px] text-terminal-muted mt-0.5">{hint}</p>}
    </div>
  )
}
