import { useState, useMemo } from 'react'
import {
  Calculator, Scale, TrendingUp, Building2, ArrowRight, Info, Briefcase,
} from 'lucide-react'
import { Link } from 'react-router-dom'

// Indicative industry multiples — illustrative ranges, not investment advice.
const INDUSTRIES = {
  saas:        { name: 'SaaS / Cloud',           revenueMult: [4, 9],   ebitdaMult: [15, 30], color: '#3b82f6' },
  ecommerce:   { name: 'E-commerce',             revenueMult: [1, 3],   ebitdaMult: [8, 14],  color: '#a855f7' },
  industrial:  { name: 'Industrial / Mfg.',      revenueMult: [0.8, 2], ebitdaMult: [6, 10],  color: '#f59e0b' },
  consumer:    { name: 'Consumer / Retail',      revenueMult: [0.7, 2], ebitdaMult: [7, 11],  color: '#10b981' },
  healthcare:  { name: 'Healthcare Services',    revenueMult: [1.5, 4], ebitdaMult: [9, 15],  color: '#ef4444' },
  fintech:     { name: 'Fintech',                revenueMult: [3, 8],   ebitdaMult: [12, 22], color: '#06b6d4' },
  proservices: { name: 'Professional Services',  revenueMult: [1, 2.5], ebitdaMult: [6, 9],   color: '#8b5cf6' },
  energy:      { name: 'Energy',                 revenueMult: [0.8, 2], ebitdaMult: [4, 8],   color: '#f97316' },
}

const fmt = (n) => '$' + Math.round(n).toLocaleString()
const fmt2 = (n) => '$' + (n / 1000).toFixed(2) + 'M'
const fmtX = (n) => n.toFixed(1) + '×'

// Simple DCF approximation:
//   Year t FCF = FCF(0) × (1+g)^t
//   PV terminal = FCF(N+1) / (WACC − tg) discounted N periods
function computeDcf({ entryFcf, growth, terminalGrowth, wacc, years }) {
  let pv = 0
  let fcfN = entryFcf
  for (let t = 1; t <= years; t++) {
    fcfN = fcfN * (1 + growth / 100)
    pv += fcfN / Math.pow(1 + wacc / 100, t)
  }
  const terminalFcf = fcfN * (1 + terminalGrowth / 100)
  const tv = (wacc / 100 - terminalGrowth / 100) > 0
    ? terminalFcf / (wacc / 100 - terminalGrowth / 100)
    : 0
  const tvPv = tv / Math.pow(1 + wacc / 100, years)
  return { ev: pv + tvPv, tvPv, projectionPv: pv }
}

export default function ValuationTool() {
  const [revenue, setRevenue]   = useState(50)   // $M
  const [ebitda, setEbitda]     = useState(8)    // $M
  const [growth, setGrowth]     = useState(15)   // %
  const [industry, setIndustry] = useState('saas')
  const [netDebt, setNetDebt]   = useState(5)    // $M

  // DCF inputs
  const [terminalGrowth, setTg] = useState(2.5)  // %
  const [wacc, setWacc]         = useState(9)    // %
  const [years, setYears]       = useState(5)

  const ind = INDUSTRIES[industry]

  const valuations = useMemo(() => {
    const revLow  = revenue * ind.revenueMult[0]
    const revHigh = revenue * ind.revenueMult[1]
    const ebLow   = ebitda  * ind.ebitdaMult[0]
    const ebHigh  = ebitda  * ind.ebitdaMult[1]
    const dcf = computeDcf({
      entryFcf: ebitda * 0.7, // simplistic — assume FCF ≈ 70% of EBITDA after tax/capex
      growth, terminalGrowth, wacc, years,
    })
    return { revLow, revHigh, ebLow, ebHigh, dcf }
  }, [revenue, ebitda, growth, industry, terminalGrowth, wacc, years])

  // Blended midpoint of comps + DCF
  const compMid = (valuations.revLow + valuations.revHigh + valuations.ebLow + valuations.ebHigh) / 4
  const blended = (compMid + valuations.dcf.ev) / 2
  const equityValue = blended - netDebt
  const allValues = [valuations.revLow, valuations.revHigh, valuations.ebLow, valuations.ebHigh, valuations.dcf.ev]
  const lowImplied  = Math.min(...allValues)
  const highImplied = Math.max(...allValues)

  return (
    <div className="space-y-6 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Calculator size={22} className="text-purple-400" /> Valuation Tool
          </h1>
          <p className="text-sm text-terminal-muted mt-1">
            Estimate a business valuation using trading multiples + a quick DCF — the same methods every banker uses on a pitch.
          </p>
        </div>
        <Link to="/m-and-a" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/10 text-accent text-sm font-medium hover:bg-accent/20 transition-colors">
          Method theory <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div className="panel p-5 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-terminal-muted">Company</h2>

            <div>
              <label className="text-xs text-terminal-muted uppercase tracking-wider">Industry</label>
              <select
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                className="w-full mt-1 bg-terminal-bg border border-terminal-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-accent/50"
              >
                {Object.entries(INDUSTRIES).map(([k, v]) => (
                  <option key={k} value={k}>{v.name}</option>
                ))}
              </select>
            </div>

            <NumberRow label="Revenue (LTM)"   suffix="$M" min={1}    max={5000} step={1}
              value={revenue} onChange={setRevenue} />
            <NumberRow label="EBITDA (LTM)"    suffix="$M" min={-50}  max={1000} step={0.5}
              value={ebitda} onChange={setEbitda} />
            <NumberRow label="Revenue growth"  suffix="% / yr" min={-20} max={100} step={1}
              value={growth} onChange={setGrowth} />
            <NumberRow label="Net debt"        suffix="$M" min={-200} max={1000} step={1}
              value={netDebt} onChange={setNetDebt} />
          </div>

          <div className="panel p-5 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-terminal-muted">DCF Assumptions</h2>
            <NumberRow label="Discount rate (WACC)" suffix="%" min={3} max={20} step={0.25}
              value={wacc} onChange={setWacc} />
            <NumberRow label="Terminal growth"      suffix="%" min={0} max={5}  step={0.25}
              value={terminalGrowth} onChange={setTg} />
            <NumberRow label="Forecast period"      suffix="yrs" min={3} max={10} step={1}
              value={years} onChange={setYears} />
            <p className="text-[10px] text-terminal-muted italic flex items-start gap-1.5">
              <Info size={11} className="mt-0.5 shrink-0" />
              Simplified DCF: FCF ≈ 70% of EBITDA, growth flat across forecast. Real models build line-by-line.
            </p>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {/* Hero — blended */}
          <div className="rounded-2xl p-5 border space-y-3"
            style={{
              borderColor: 'rgba(59,130,246,0.3)',
              background: 'linear-gradient(135deg, rgba(59,130,246,0.10), rgba(168,85,247,0.06))',
            }}>
            <p className="text-[10px] text-accent uppercase tracking-wider font-semibold">Blended Valuation Range</p>
            <p className="text-3xl font-mono font-bold text-accent">
              {fmt(lowImplied)}M – {fmt(highImplied)}M
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="bg-terminal-bg rounded-xl px-3 py-2">
                <p className="text-terminal-muted">Midpoint Enterprise Value</p>
                <p className="font-mono font-semibold mt-0.5">{fmt(blended)} M</p>
              </div>
              <div className="bg-gain/5 border border-gain/20 rounded-xl px-3 py-2">
                <p className="text-terminal-muted">Implied Equity Value</p>
                <p className="font-mono font-semibold text-gain mt-0.5">{fmt(equityValue)} M</p>
              </div>
            </div>
            <p className="text-[10px] text-terminal-muted">
              Equity Value = Enterprise Value − Net Debt ({fmt(netDebt)} M)
            </p>
          </div>

          {/* Method breakdown */}
          <div className="panel p-5 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-terminal-muted">Method Breakdown</h2>

            <MethodRow
              icon={Scale} color={ind.color}
              label="EV / Revenue (Comps)"
              detail={`${fmtX(ind.revenueMult[0])} – ${fmtX(ind.revenueMult[1])} × Revenue`}
              low={valuations.revLow} high={valuations.revHigh}
            />
            <MethodRow
              icon={Scale} color={ind.color}
              label="EV / EBITDA (Comps)"
              detail={`${fmtX(ind.ebitdaMult[0])} – ${fmtX(ind.ebitdaMult[1])} × EBITDA`}
              low={valuations.ebLow} high={valuations.ebHigh}
            />
            <MethodRow
              icon={TrendingUp} color="#10b981"
              label="DCF (Intrinsic)"
              detail={`${years}y forecast, ${wacc}% WACC, ${terminalGrowth}% terminal`}
              low={valuations.dcf.ev} high={valuations.dcf.ev}
              extra={`PV of forecast: ${fmt(valuations.dcf.projectionPv)} M  ·  PV of terminal: ${fmt(valuations.dcf.tvPv)} M`}
            />

            <p className="text-[10px] text-terminal-muted italic flex items-start gap-1.5 pt-1">
              <Info size={11} className="mt-0.5 shrink-0" />
              Multiples are indicative industry ranges, not real-time comp sets. For a live deal, pull peers from Capital IQ / Bloomberg.
            </p>
          </div>
        </div>
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
            type="number" value={value} min={min} max={max} step={step}
            onChange={e => onChange(Number(e.target.value))}
            className="w-20 bg-terminal-bg border border-terminal-border rounded-md px-2 py-1 text-xs font-mono text-right focus:outline-none focus:border-accent/50"
          />
          <span className="text-[10px] text-terminal-muted w-14 shrink-0">{suffix}</span>
        </div>
      </div>
      <input
        type="range" value={value} min={min} max={max} step={step}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-accent"
      />
    </div>
  )
}

function MethodRow({ icon: Icon, color, label, detail, low, high, extra }) {
  const isRange = high > low
  return (
    <div className="bg-terminal-bg rounded-xl px-4 py-3 space-y-1">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Icon size={14} style={{ color }} className="shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{label}</p>
            <p className="text-[10px] text-terminal-muted truncate">{detail}</p>
          </div>
        </div>
        <p className="font-mono text-sm font-semibold shrink-0">
          {isRange ? `${fmt(low)}M – ${fmt(high)}M` : `${fmt(low)} M`}
        </p>
      </div>
      {extra && <p className="text-[10px] text-terminal-muted">{extra}</p>}
    </div>
  )
}
