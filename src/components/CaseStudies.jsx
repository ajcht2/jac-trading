import { FolderOpen, ExternalLink, Building2, TrendingUp, DollarSign, Clock } from 'lucide-react'

// Real recent / classic M&A deals to study. The framework column is what
// the student should walk through when writing their own deal note:
// strategic rationale → structure → valuation → synergies → risks.
const DEALS = [
  {
    deal: 'Microsoft / Activision Blizzard',
    year: '2022 — closed 2023',
    sector: 'TMT',
    sectorColor: '#3b82f6',
    size: '$68.7 B EV · all cash',
    multiple: '~24× LTM EBITDA',
    rationale: 'Build a position in mobile gaming (King franchise) and lock in cloud / gaming subscription content. Defensive vs Sony PlayStation moat.',
    structure: 'All-cash takeover. Microsoft used balance-sheet cash and short-term financing. Regulatory drama: FTC, CMA, EU Commission — closed after 21 months.',
    valuation: 'Implied premium ~45 % over Activision\'s pre-rumour price. Compared favourably to comp set EV/EBITDA (Take-Two, EA at 15-18×). The "control + synergies" premium justified the gap.',
    synergies: 'Cost: modest (~$500M). Revenue: cross-sell Game Pass to Activision\'s 380M MAUs; first-party content for Xbox cloud.',
    risks: 'Regulator approval risk (materialised — CMA blocked then reversed). Talent retention. Mobile-gaming Q-on-Q volatility.',
  },
  {
    deal: 'IBM / HashiCorp',
    year: '2024',
    sector: 'TMT',
    sectorColor: '#3b82f6',
    size: '$6.4 B EV · all cash',
    multiple: '~13× LTM Revenue',
    rationale: 'Add Terraform / Vault to IBM\'s Red Hat hybrid-cloud stack. Strengthen IBM\'s position vs AWS / Azure in multi-cloud orchestration.',
    structure: '$35 / share cash tender. Premium ~42 % over unaffected. Customary IBM debt-financed transaction.',
    valuation: 'HashiCorp wasn\'t yet GAAP-profitable, so multiples are on revenue. Comparable to Datadog / MongoDB at 14-16× revenue but at a discount given slower growth.',
    synergies: 'Cross-sell to IBM\'s enterprise sales force. Some opex consolidation in finance / IT. Limited cost synergies — both companies kept fairly lean.',
    risks: 'Open-source community reaction to acquisition. Competitive response from cloud hyperscalers offering native alternatives.',
  },
  {
    deal: 'Adobe / Figma — terminated',
    year: '2022 announced · 2023 terminated',
    sector: 'TMT',
    sectorColor: '#3b82f6',
    size: '$20 B EV · 50 % cash / 50 % stock',
    multiple: '~50× LTM Revenue',
    rationale: 'Acquire the fastest-growing design tool to defend Creative Cloud\'s flagship Photoshop / XD franchise. Famous "Microsoft buys LinkedIn" play.',
    structure: '$10B cash + ~$10B Adobe stock + earn-out RSUs for Figma management. Required CMA / EU Commission approval.',
    valuation: 'At 50× ARR, the highest software multiple on record. Critics argued Adobe was overpaying to neutralise a competitor.',
    synergies: 'Mostly revenue: cross-sell Adobe portfolio to Figma\'s collaborative design user base. Light cost synergies due to ~7,000 combined employees.',
    risks: 'Regulator blocked the deal in late 2023. Adobe paid Figma a $1B break-up fee. The case study is about why bidders should price regulatory risk explicitly.',
  },
  {
    deal: 'Blackstone consortium / Refinitiv',
    year: '2018 (LSE acquisition 2021)',
    sector: 'FIG',
    sectorColor: '#a855f7',
    size: '$17B EV · carve-out',
    multiple: '~10× EBITDA',
    rationale: 'PE consortium (Blackstone, GIC, CPPIB) carved out Refinitiv from Thomson Reuters in 2018. Then sold to LSE in 2021 for $27B — landmark "exit through strategic" trade.',
    structure: '2018: Carve-out LBO with $13.5B of debt, ~$3.5B sponsor equity. 2021 exit: all-stock to LSE.',
    valuation: 'Entry at 10× EBITDA; exit at 15× — strong multiple expansion + EBITDA growth from cost-out programme.',
    synergies: 'Entry: not relevant (LBO). Exit: LSE pitched $400M run-rate cost synergies (eventually delivered).',
    risks: 'Refinanced senior debt twice during hold. Regulatory review at the LSE exit dragged 18 months. Classic case of a clean carve-out → operational improvement → strategic exit.',
  },
  {
    deal: '3G + Berkshire / Heinz → Kraft Heinz',
    year: '2013 LBO · 2015 merger',
    sector: 'Consumer',
    sectorColor: '#10b981',
    size: '$23B LBO + Kraft merger',
    multiple: '~14× LTM EBITDA at entry',
    rationale: '3G\'s zero-based-budgeting (ZBB) playbook applied to global packaged food. Berkshire as financial partner — patient capital, brand-friendly.',
    structure: '$23B LBO ($12B equity / $11B debt). Two years later: stock-and-cash merger with Kraft to create Kraft Heinz (~$36B + dividend).',
    valuation: 'Entry at 14× EBITDA — high for consumer staples. Justified by promised ZBB cost takeout.',
    synergies: 'Heinz alone: 25 % SG&A cut in 18 months. Combined: announced $1.5B run-rate, delivered (eventually).',
    risks: 'Brand under-investment. By 2019 Kraft Heinz wrote down $15B of goodwill on legacy brands — a famous warning about cutting marketing in mature consumer.',
  },
]

export default function CaseStudies() {
  return (
    <div className="space-y-6 max-w-[1100px]">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <FolderOpen size={22} className="text-purple-400" /> Case Studies
        </h1>
        <p className="text-sm text-terminal-muted mt-1">
          Recent and classic M&amp;A deals walked through the analyst framework: rationale → structure → valuation → synergies → risks.
        </p>
      </div>

      <div className="space-y-4">
        {DEALS.map(d => (
          <div key={d.deal} className="panel p-5 space-y-4">
            <div className="flex items-start justify-between flex-wrap gap-3 pb-3 border-b border-terminal-border">
              <div className="min-w-0">
                <h2 className="text-base font-bold">{d.deal}</h2>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ backgroundColor: d.sectorColor + '15', color: d.sectorColor }}>
                    {d.sector}
                  </span>
                  <span className="text-xs text-terminal-muted flex items-center gap-1"><Clock size={11} />{d.year}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-mono font-bold">{d.size}</p>
                <p className="text-[10px] text-terminal-muted font-mono">{d.multiple}</p>
              </div>
            </div>

            <Block icon={Building2} color={d.sectorColor} label="Strategic rationale"  body={d.rationale} />
            <Block icon={TrendingUp} color={d.sectorColor} label="Structure"           body={d.structure} />
            <Block icon={DollarSign} color={d.sectorColor} label="Valuation"           body={d.valuation} />
            <Block icon={TrendingUp} color={d.sectorColor} label="Synergies"           body={d.synergies} />
            <Block icon={ExternalLink} color={d.sectorColor} label="Key risks"        body={d.risks} />
          </div>
        ))}
      </div>

      <div className="panel p-5 text-sm text-terminal-muted space-y-1 bg-accent/5 border-accent/20">
        <p className="font-semibold text-accent">How to write your own</p>
        <p>Pick a recently announced public deal. Write 3-5 pages following the same framework: rationale, structure, valuation, synergies, risks. Cite the company\'s 8-K / Reg S-4 and 2-3 sell-side notes.</p>
      </div>
    </div>
  )
}

function Block({ icon: Icon, color, label, body }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={12} style={{ color }} />
        <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color }}>{label}</span>
      </div>
      <p className="text-sm leading-relaxed text-terminal-text/85">{body}</p>
    </div>
  )
}
