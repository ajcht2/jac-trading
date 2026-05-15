import { Sigma, Keyboard, Calculator, FileSpreadsheet, AlertTriangle, BookOpen } from 'lucide-react'

const SHORTCUTS = [
  { keys: 'F2',          desc: 'Edit active cell (no mouse).' },
  { keys: 'F4',          desc: 'Cycle absolute / relative references ($A$1 → A$1 → $A1 → A1).' },
  { keys: 'Alt + =',     desc: 'Insert SUM.' },
  { keys: 'Ctrl + ↑/↓/←/→', desc: 'Jump to the edge of the data region.' },
  { keys: 'Ctrl + Shift + ↑/↓', desc: 'Select to the edge — used constantly for range references.' },
  { keys: 'Ctrl + Page Up/Down', desc: 'Move between tabs (faster than mousing).' },
  { keys: 'Alt + E S V',  desc: 'Paste Special → Values. The single most-used IB shortcut.' },
  { keys: 'Alt + H O I',  desc: 'AutoFit column width.' },
  { keys: 'Alt + W F R',  desc: 'Freeze top row.' },
  { keys: 'Ctrl + 1',     desc: 'Format cells dialog.' },
  { keys: 'Ctrl + Shift + L', desc: 'Toggle filters.' },
  { keys: 'F5 + Special',  desc: 'Go To Special — useful for finding hardcodes vs formulas.' },
]

const FORMULAS = [
  {
    name: 'INDEX-MATCH',
    use: 'Two-way lookups. Replaces VLOOKUP everywhere — faster, more flexible, doesn\'t break when columns are inserted.',
    syntax: '=INDEX(return_range, MATCH(lookup_value, lookup_range, 0))',
  },
  {
    name: 'XLOOKUP',
    use: 'Modern lookup (post-2019). Supports default value if not found, exact / approximate match, and reverse search.',
    syntax: '=XLOOKUP(lookup, lookup_range, return_range, [if_not_found])',
  },
  {
    name: 'SUMIFS / COUNTIFS',
    use: 'Conditional sums and counts on multiple criteria — bread and butter for slicing financials.',
    syntax: '=SUMIFS(sum_range, criteria_range1, criteria1, criteria_range2, criteria2, ...)',
  },
  {
    name: 'IFERROR',
    use: 'Wrap any formula that can error (#N/A, #DIV/0!) to return a clean output. Bankers use this on every division.',
    syntax: '=IFERROR(formula, "")',
  },
  {
    name: 'OFFSET / CHOOSE',
    use: 'Dynamic range building — used in scenario tables (CHOOSE picks between Base / Upside / Downside cases).',
    syntax: '=CHOOSE(scenario_number, base_value, upside_value, downside_value)',
  },
  {
    name: 'NPV / XNPV',
    use: 'Discounted cash flow value. XNPV is preferred — it handles irregular dates.',
    syntax: '=XNPV(rate, cash_flows, dates)',
  },
  {
    name: 'IRR / XIRR',
    use: 'Internal rate of return on a series of cash flows. XIRR is again preferred for irregular dates.',
    syntax: '=XIRR(cash_flows, dates)',
  },
  {
    name: 'EOMONTH / EDATE',
    use: 'End-of-month / month-shift functions — used for forecasting headers and aligning periods.',
    syntax: '=EOMONTH(start_date, months_offset)',
  },
]

const STANDARDS = [
  { label: 'Hardcodes in blue, formulas in black', desc: 'Every banker convention. Makes audit trail visible at a glance.' },
  { label: 'Linked cells in green',                 desc: 'Cross-sheet references. Easy to track without F2.' },
  { label: 'Inputs in yellow shading',              desc: 'Drives what\'s sensitivity-table material.' },
  { label: 'Three-statement scrolls left-to-right', desc: 'Historicals on the left, forecast on the right. Years in a single row.' },
  { label: 'No hardcoded numbers in formulas',      desc: '"=$B$5*1.05" is forbidden — break out the 1.05 into its own input cell.' },
  { label: 'Comma style, 2 decimals',               desc: 'Number formatting: ,##0.00;(,##0.00). Negatives in parentheses, banker-style.' },
  { label: 'One purpose per tab',                   desc: 'Assumptions, IS, BS, CFS, schedules — each on its own tab.' },
  { label: 'Print area set & page breaks defined',  desc: 'Models get printed in MDs\' offices. Make it look right.' },
]

export default function ExcelSkills() {
  return (
    <div className="space-y-6 max-w-[1000px]">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Sigma size={22} className="text-green-500" /> Excel Skills
        </h1>
        <p className="text-sm text-terminal-muted mt-1">
          The shortcuts, formulas and formatting standards used on every IB desk. Built for muscle memory.
        </p>
      </div>

      {/* Shortcuts */}
      <section className="panel p-5 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-green-500 flex items-center gap-2">
          <Keyboard size={14} /> Essential Shortcuts
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SHORTCUTS.map((s, i) => (
            <div key={i} className="flex items-start gap-3 bg-terminal-bg/40 rounded-lg px-3 py-2">
              <kbd className="font-mono text-[11px] bg-terminal-bg border border-terminal-border rounded px-2 py-0.5 shrink-0 whitespace-nowrap">{s.keys}</kbd>
              <span className="text-xs text-terminal-text/85 leading-snug">{s.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Formulas */}
      <section className="panel p-5 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-green-500 flex items-center gap-2">
          <Calculator size={14} /> Formulas You Actually Use
        </h2>
        <div className="space-y-3">
          {FORMULAS.map(f => (
            <div key={f.name} className="bg-terminal-bg/40 rounded-xl p-3">
              <p className="text-sm font-semibold">{f.name}</p>
              <p className="text-xs text-terminal-muted mt-1">{f.use}</p>
              <code className="block mt-2 text-[11px] font-mono bg-terminal-bg rounded px-2 py-1 border-l-2 border-green-500/60 text-terminal-text/90">
                {f.syntax}
              </code>
            </div>
          ))}
        </div>
      </section>

      {/* Standards */}
      <section className="panel p-5 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-green-500 flex items-center gap-2">
          <FileSpreadsheet size={14} /> Banker Formatting Standards
        </h2>
        <div className="space-y-2">
          {STANDARDS.map((s, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <span className="text-green-500 mt-1 shrink-0">✓</span>
              <div>
                <span className="font-semibold">{s.label}</span>
                <span className="text-terminal-muted"> — {s.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="panel p-5 bg-yellow-500/5 border-yellow-500/20 flex items-start gap-3">
        <AlertTriangle size={16} className="text-yellow-500 mt-0.5 shrink-0" />
        <div className="text-sm text-terminal-text/85">
          <p className="font-semibold text-yellow-500 mb-1">Drill it</p>
          <p>You\'ll be expected to navigate Excel with zero mouse use within your first month on desk. Practise the shortcuts in this list daily until they\'re reflex.</p>
        </div>
      </div>

      <div className="panel p-5 text-sm text-terminal-muted space-y-1">
        <p className="font-semibold text-terminal-text flex items-center gap-2"><BookOpen size={13} /> Further reading</p>
        <p>· <span className="text-terminal-text/85">Wall Street Prep — Excel Crash Course</span> (free YouTube playlist, ~3 hours total)</p>
        <p>· <span className="text-terminal-text/85">Breaking Into Wall Street — Excel Quick Reference Guide</span></p>
        <p>· <span className="text-terminal-text/85">Macabacus add-in</span> — the formatting toolbar every bank uses</p>
      </div>
    </div>
  )
}
