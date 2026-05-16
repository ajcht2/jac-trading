import { useState } from 'react'
import {
  PiggyBank, Building2, Calculator, Target, AlertTriangle, ChevronDown,
  ChevronUp, TrendingUp, Layers, DollarSign, Award, Briefcase, Repeat,
  ArrowRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'

// ── PE FUNDAMENTALS ──────────────────────────────
const FUNDAMENTALS = [
  {
    id: 'what_is_pe', name: 'What is Private Equity?', icon: Briefcase, color: '#3b82f6',
    tagline: 'How PE firms raise money, deploy it, and earn the fees that have made the partners billionaires',
    summary: 'Private equity firms raise pools of capital from large institutions, buy controlling stakes in private (and sometimes public) companies, operate them for several years, then exit at a higher price. They charge a management fee on committed capital and take a share of the profits — "carried interest" — once a hurdle return is met.',
    sections: [
      { title: 'The business model', icon: Target, content: [
        { type: 'highlight', items: [
          { label: 'Closed-end fund', desc: 'PE firms raise a fund (typically $1B-$25B+) from LPs with a ~10-year life. The clock starts ticking on Day 1.' },
          { label: 'Management fee', desc: '~2% per year on committed capital. Pays the team\'s salaries, office, and travel. Roughly $20M/year on a $1B fund.' },
          { label: 'Carried interest ("carry")', desc: '20% of profits above an 8% hurdle return. This is where the real money is — and where the political controversy lies (carry is taxed as capital gains, not income).' },
          { label: 'Hurdle and catch-up', desc: 'LPs receive 100% of returns until they hit 8%, then GP "catches up" until they\'ve taken 20% of all profits, then the 80/20 split kicks in.' },
        ]},
      ]},
      { title: 'Fund lifecycle', icon: Repeat, content: [
        { type: 'highlight', items: [
          { label: 'Years 1-5 — Investment period', desc: 'GP deploys committed capital into 8-15 portfolio companies. Calls capital from LPs as needed.' },
          { label: 'Years 3-8 — Hold period', desc: 'Operational improvements: pricing, cost cuts, bolt-on M&A. Some early exits begin in year 5.' },
          { label: 'Years 5-10 — Harvest', desc: 'Companies exit via sale or IPO. Proceeds flow back to LPs with carry to the GP.' },
          { label: 'Year 10 — Fund wind-down', desc: 'Any remaining portfolio companies sold or transferred to a continuation vehicle.' },
        ]},
      ]},
      { title: 'Why LPs invest', icon: Building2, content: [
        { type: 'text', value: 'LPs (Limited Partners) include pension funds, sovereign wealth funds (e.g. ADIA, GIC), endowments (Yale, Harvard, Stanford), insurance companies and family offices.' },
        { type: 'proscons',
          pros: ['Historical net returns of 12-15 % beat public markets by ~3 % per year', 'Diversification away from listed equities', 'Access to operational value creation in private companies', 'Long-dated capital matches long-term liabilities (pensions)'],
          cons: ['Illiquid — capital locked for ~10 years', 'High fees compound to ~6 % drag per year', 'Top-quartile dispersion: bottom funds underperform public markets', 'J-curve: returns are negative in the early years'] },
      ]},
      { title: 'Real-world context', icon: Building2, content: [
        { type: 'text', value: 'Global PE AUM exceeds $7 trillion (2024). Top firms by AUM: Blackstone (~$1.1T), KKR, Apollo, Carlyle, TPG, Bain Capital, CVC, EQT, Advent, Hellman & Friedman, Thoma Bravo (the largest software-specialist). Recommended reading: "King of Capital" (story of Blackstone) and "Barbarians at the Gate" (RJR Nabisco LBO).' },
      ]},
    ],
  },
  {
    id: 'fund_structure', name: 'GP / LP Structure', icon: Layers, color: '#a855f7',
    tagline: 'The legal architecture every PE fund follows — and why it matters for taxes, governance, and incentives',
    summary: 'A PE fund is a limited partnership. The General Partner (GP) — the PE firm — manages the fund and bears unlimited liability. Limited Partners (LPs) — the investors — provide the capital, share in profits, and are liable only up to their committed capital. The structure aligns incentives (GP eats its own cooking via co-investment) and provides tax advantages (carry as capital gains).',
    sections: [
      { title: 'The GP', icon: Target, content: [
        { type: 'highlight', items: [
          { label: 'The PE firm itself', desc: 'Blackstone, KKR, etc. Acts as fund manager.' },
          { label: 'Commits 1-5 % of fund', desc: 'GP "co-investment" — eating its own cooking. Aligns interests with LPs.' },
          { label: 'Earns management fee + carry', desc: '2 / 20 is the canonical split. Larger funds sometimes negotiate to 1.5 / 20 or 1 / 20.' },
          { label: 'Has full investment discretion', desc: 'LPs don\'t vote on individual deals. The LPAC (Limited Partner Advisory Committee) can veto certain conflicts.' },
        ]},
      ]},
      { title: 'The LPs', icon: Target, content: [
        { type: 'highlight', items: [
          { label: 'Pension funds', desc: 'Largest LP category. CalPERS, OTPP, ABP. Long horizons match PE\'s 10-year fund life.' },
          { label: 'Sovereign wealth funds', desc: 'Norway\'s NBIM, Singapore\'s GIC, Abu Dhabi\'s ADIA, KIA, QIA.' },
          { label: 'Endowments / foundations', desc: 'Yale, Harvard, Stanford, MIT. Pioneered the "endowment model" of high alternatives allocation.' },
          { label: 'Family offices & HNW', desc: 'Increasingly important. Often access via feeder funds or fund-of-funds.' },
          { label: 'Insurance companies', desc: 'Especially life insurers seeking yield against long-dated liabilities.' },
        ]},
      ]},
      { title: 'Side letters and most-favoured nation', icon: Calculator, content: [
        { type: 'text', value: 'Large LPs negotiate "side letters" — bespoke economic terms (lower fees, no-fault termination rights, ESG reporting). The MFN ("Most Favoured Nation") clause lets one LP elect to receive any better term granted to another LP. Top-tier LPs (CPPIB, GIC) routinely command 1.5 % management fees.' },
      ]},
    ],
  },
  {
    id: 'pe_strategies', name: 'PE strategies', icon: Award, color: '#10b981',
    tagline: 'LBO is just one PE strategy — the industry has fragmented into specialised vehicles for every stage and risk profile',
    summary: 'When practitioners say "PE" they often mean LBOs (buyouts) — but the industry now includes growth equity, venture capital, mezzanine, distressed, and secondaries. Each operates with different leverage, hold periods, and target IRRs.',
    sections: [
      { title: 'The major flavours', icon: Target, content: [
        { type: 'highlight', items: [
          { label: 'Leveraged Buyout (LBO)', desc: 'Acquire a mature, profitable company using 50-70 % debt. Target 20-25 % IRR, 2.5-3.0× MOIC over 5 years. The classic Blackstone / KKR play.' },
          { label: 'Growth Equity', desc: 'Minority stakes in fast-growing, profitable companies. Less / no leverage. Hold 3-7 years. Target 15-20 % IRR. Examples: Insight Partners, General Atlantic, TA Associates.' },
          { label: 'Venture Capital', desc: 'Equity in unprofitable early-stage businesses. No leverage. Hold 5-10 years. Target 5-10× MOIC on individual investments (power-law distribution). Examples: Sequoia, A16Z, Benchmark.' },
          { label: 'Mezzanine', desc: 'Subordinated debt + warrants. Hybrid between debt and equity returns. Target 12-18 % IRR. Used to fill the gap between senior debt and sponsor equity in an LBO capital stack.' },
          { label: 'Distressed / Special Situations', desc: 'Buy debt of stressed companies, take control via Chapter 11. Counter-cyclical. Examples: Apollo, Oaktree, Centerbridge.' },
          { label: 'Secondaries', desc: 'Buy existing LP interests in older PE funds (or whole portfolios via "GP-led" recaps). Target 12-15 % IRR with much shorter J-curve. Examples: Ardian, Lexington, HarbourVest.' },
        ]},
      ]},
      { title: 'Bain Capital vs Sequoia — different sports', icon: Building2, content: [
        { type: 'text', value: 'A traditional LBO firm (Bain Cap, KKR) and a VC firm (Sequoia) are technically both "PE" but operationally have nothing in common. LBO firms hire ex-bankers, model cash flows, and engineer leverage. VC firms hire ex-operators / founders, evaluate teams and TAMs, and back unprofitable bets. Don\'t confuse them in interviews.' },
      ]},
    ],
  },
  {
    id: 'investment_process', name: 'PE investment process', icon: Repeat, color: '#f59e0b',
    tagline: 'From sourcing a target to closing the deal — the workflow inside a PE firm',
    summary: 'PE investment professionals work in funnels. They screen hundreds of opportunities to find dozens worth diligencing, leading to a handful of formal bids and ultimately 2-4 investments per fund per year.',
    sections: [
      { title: 'Sourcing', icon: Target, content: [
        { type: 'highlight', items: [
          { label: 'Sellside auctions', desc: 'Banks (Goldman, JPM, Lazard) run formal processes. PE firms compete via IOIs and LOIs against other sponsors and strategics.' },
          { label: 'Proprietary deals', desc: 'Direct relationships with founders or corporate carve-outs. Less price tension → better entry multiples.' },
          { label: 'Sector mapping', desc: 'PE associates spend weeks building target lists in sub-sectors (e.g. "European specialty chemicals with $50M-$200M EBITDA").' },
          { label: 'Bolt-on acquisitions', desc: 'Existing platform companies acquire competitors. Run by the operating team rather than the deal team.' },
        ]},
      ]},
      { title: 'Diligence', icon: Target, content: [
        { type: 'highlight', items: [
          { label: 'Financial DD', desc: 'Quality of earnings — Big 4 audits the historical numbers and confirms adjusted EBITDA.' },
          { label: 'Commercial DD', desc: 'Strategy consultancy (Bain, McKinsey, BCG) validates the market and customer thesis.' },
          { label: 'Legal DD', desc: 'Law firms review contracts, IP, litigation, employment, tax exposures.' },
          { label: 'Operational DD', desc: 'Specialist operating partners assess the management team and the value-creation plan.' },
          { label: 'ESG / sustainability', desc: 'Increasingly material — LPs scrutinise carbon footprint, governance, labour practices.' },
        ]},
      ]},
      { title: 'Investment Committee (IC)', icon: AlertTriangle, content: [
        { type: 'text', value: 'Every deal must pass an Investment Committee — typically the firm\'s most senior partners. The IC reviews the investment memo: thesis, financials, value-creation plan, downside scenarios, exit strategy. Deals often die at this stage.' },
        { type: 'text', value: 'Common reasons IC declines: "valuation too rich", "no clear value-creation plan", "management team weak", "regulatory risk uncertain", "the firm already has too much exposure to this sector". The first NO from any partner usually kills it.' },
      ]},
    ],
  },
]

// ── LBO MECHANICS & VALUE CREATION ──────────────────────────────
const LBO_MECHANICS = [
  {
    id: 'lbo_basics', name: 'LBO basics', icon: PiggyBank, color: '#dc2626',
    tagline: 'How a private equity firm uses debt to amplify equity returns',
    summary: 'A leveraged buyout funds an acquisition with mostly borrowed money (typically 50-70 % debt). The PE firm contributes the equity, lends nothing, and uses the target company\'s own cash flow to service the debt. If the target performs, debt is paid down and equity returns are amplified. If it doesn\'t, equity gets wiped out first.',
    sections: [
      { title: 'Why leverage matters', icon: Target, content: [
        { type: 'text', value: 'Consider buying a $100M company outright with equity. If you sell it for $130M, you earn 30 %.' },
        { type: 'text', value: 'Now buy the same company with $30M equity and $70M debt. Pay down $20M of debt over the hold. Sell for $130M. You receive $130M − $50M remaining debt = $80M. On $30M equity, that\'s 167 % — more than 5× the unlevered return.' },
        { type: 'text', value: 'Leverage cuts both ways: a $20M decline in EV becomes a 100 % equity wipe-out in the levered case but only a 20 % loss unlevered.' },
      ]},
      { title: 'Target company profile', icon: Target, content: [
        { type: 'highlight', items: [
          { label: 'Stable cash flow', desc: 'Predictable enough to service debt. Subscription businesses, consumer staples, healthcare services.' },
          { label: 'Mature growth', desc: 'Modest 3-8 % growth is fine — explosive growth is for VC, not PE.' },
          { label: 'Asset-light or asset-heavy with collateral', desc: 'Hard assets give lenders security and lower the cost of debt.' },
          { label: 'Limited CapEx requirements', desc: 'Cash flow shouldn\'t be eaten by maintenance investment.' },
          { label: 'Operational improvement potential', desc: 'Pricing, cost-cuts, geographic expansion, bolt-on M&A.' },
        ]},
      ]},
      { title: 'Strengths & risks', icon: AlertTriangle, content: [
        { type: 'proscons',
          pros: ['Leverage amplifies equity returns when things go well', 'Tax shield from deductible interest', 'Forces operational discipline — must service debt', 'Aligns management via meaningful equity incentive (MIP)'],
          cons: ['High leverage = high risk of default in a downturn', 'Limited flexibility — most cash flow earmarked for debt service', 'Cyclical or R&D-heavy businesses are unsuitable', 'Equity is wiped out before debt holders lose a dollar'] },
      ]},
    ],
  },
  {
    id: 'sources_uses', name: 'Sources & Uses', icon: DollarSign, color: '#a855f7',
    tagline: 'The one-page table every LBO starts with — where the money comes from and where it goes',
    summary: 'A Sources & Uses table is the LBO\'s foundational construction document. The Uses side shows every dollar the deal needs to fund. The Sources side shows where that funding comes from. The two must always balance — sponsor equity is the plug.',
    sections: [
      { title: 'The Uses side', icon: Target, content: [
        { type: 'highlight', items: [
          { label: 'Purchase price of target equity', desc: 'Equity Value paid to existing shareholders.' },
          { label: 'Refinance existing debt', desc: 'Target\'s outstanding debt is typically refinanced at closing.' },
          { label: 'Transaction fees', desc: 'M&A advisory, legal, accounting, consulting — typically 2-3 % of EV.' },
          { label: 'Financing fees', desc: 'Underwriting, OID (Original Issue Discount), commitment fees on revolvers.' },
          { label: 'Minimum cash on balance sheet', desc: 'A small reserve at closing for working capital.' },
        ]},
      ]},
      { title: 'The Sources side', icon: Target, content: [
        { type: 'highlight', items: [
          { label: 'Senior debt — Term Loan A (TLA)', desc: '5-7 year amortising, floating rate. Lower coupon, banks hold to maturity.' },
          { label: 'Senior debt — Term Loan B (TLB)', desc: '7-year bullet, floating rate. Most common LBO tranche. Sold to institutional investors.' },
          { label: 'Senior secured notes / high-yield bonds', desc: '7-10 year, fixed rate. Used for larger deals.' },
          { label: 'Mezzanine / Second-lien', desc: 'Subordinated. Higher coupon, often with PIK toggle. Fills the gap to sponsor equity.' },
          { label: 'Revolver', desc: 'Undrawn at close, provides working-capital liquidity post-close.' },
          { label: 'Management rollover', desc: 'Existing management converts a portion of their equity stake into the new entity — alignment + lower equity cheque.' },
          { label: 'Sponsor equity (the PLUG)', desc: 'Whatever is left after all the above. Sponsors minimise this to maximise IRR.' },
        ]},
      ]},
      { title: 'Typical capital structure (2024-2026)', icon: Calculator, content: [
        { type: 'highlight', items: [
          { label: 'Total debt', desc: '5-6× EBITDA on average; 4-5× for cyclical, 6-7× for stable subscription' },
          { label: 'Senior debt portion', desc: '60-75 % of total debt' },
          { label: 'Sponsor equity', desc: '40-55 % of EV (higher than 2010s era — rate environment cut leverage)' },
          { label: 'Management rollover', desc: 'Usually 2-5 % of total sources' },
        ]},
      ]},
    ],
  },
  {
    id: 'value_creation', name: 'Value-creation drivers', icon: TrendingUp, color: '#10b981',
    tagline: 'The three forces that turn entry equity into exit equity — and where great PE firms actually win',
    summary: 'A finished LBO has a Year 0 equity value and a Year 5 exit equity value. The difference is fully attributable to three drivers: EBITDA growth, multiple expansion, and debt paydown. Sophisticated PE firms model each driver explicitly to know where they\'re betting.',
    sections: [
      { title: 'The three drivers', icon: Target, content: [
        { type: 'highlight', items: [
          { label: 'EBITDA growth', desc: 'Grow operating earnings during the hold. Requires actual operational improvement: pricing, cost-cutting, sales force expansion, bolt-on M&A.' },
          { label: 'Multiple expansion', desc: 'Sell at a higher EV/EBITDA than the entry multiple. Driven by market conditions, sector re-rating, or genuine business transformation.' },
          { label: 'Debt paydown', desc: 'Cash flow during hold reduces debt — mechanical, predictable. More of exit EV flows to equity.' },
        ]},
      ]},
      { title: 'The decomposition formula', icon: Calculator, content: [
        { type: 'formula', value: 'Equity gain = (Exit EBITDA − Entry EBITDA) × Entry multiple        [EBITDA growth]' },
        { type: 'formula', value: '             + (Exit multiple − Entry multiple) × Exit EBITDA        [Multiple expansion]' },
        { type: 'formula', value: '             + (Entry debt − Exit debt)                              [Debt paydown]' },
        { type: 'text', value: 'For a $100M EV deal with 35 % equity (so $35M sponsor equity), if Exit Equity is $90M, the bridge tells you exactly which lever drove that $55M of value creation.' },
      ]},
      { title: 'Which firms win where', icon: Building2, content: [
        { type: 'text', value: 'The best LBO firms (KKR, Bain Capital, Thoma Bravo, Hellman & Friedman) target operational value creation — they don\'t want their returns dependent on multiple expansion they can\'t control. They build operating partner teams, deploy 100-day plans, and run pricing analyses.' },
        { type: 'text', value: 'Mediocre PE firms — usually those that struggle in down cycles — over-rely on leverage and a rising market. The 2007-vintage funds taught the industry a hard lesson: when multiples contract, EBITDA growth is all you have left.' },
      ]},
    ],
  },
  {
    id: 'returns', name: 'Returns analysis: IRR, MOIC, DPI, TVPI', icon: Calculator, color: '#f59e0b',
    tagline: 'The four metrics LPs use to judge a PE fund — each captures something different',
    summary: 'PE returns can\'t be reduced to a single number. IRR captures time-weighted return; MOIC captures total dollars made; DPI and TVPI separate cash returned from paper marks. LPs look at all four together — and so should you.',
    sections: [
      { title: 'Single-deal metrics', icon: Calculator, content: [
        { type: 'formula', value: 'IRR  = annualised return; solves NPV = 0 over the cash flows' },
        { type: 'formula', value: 'MOIC = Exit Equity / Entry Equity     [Multiple of Invested Capital, aka "cash-on-cash"]' },
        { type: 'text', value: 'Target single-deal returns at large LBO funds: ~25 % IRR, ~2.5-3.0× MOIC. The two are related but not identical — a fast 2.0× in 2 years (~41 % IRR) beats a slow 3.0× in 8 years (~15 % IRR).' },
      ]},
      { title: 'Fund-level metrics', icon: Calculator, content: [
        { type: 'formula', value: 'DPI  = Distributions / Paid-in capital                [cash actually returned to LPs]' },
        { type: 'formula', value: 'RVPI = Residual value / Paid-in capital               [paper value still in the fund]' },
        { type: 'formula', value: 'TVPI = DPI + RVPI = Total value / Paid-in capital     [total realised + unrealised]' },
        { type: 'text', value: 'DPI is the truth — until cash hits the LP\'s bank account, returns are theoretical. Top-quartile funds achieve DPI > 2.0× by year 8-10. TVPI is more forward-looking but includes the GP\'s own mark on remaining portfolio companies.' },
      ]},
      { title: 'Why IRR can mislead', icon: AlertTriangle, content: [
        { type: 'text', value: 'GPs sometimes engineer IRR via subscription lines of credit — borrowing to fund deals, then calling LP capital later. This compresses the time between cash out and cash in, juicing IRR while leaving MOIC unchanged. LPs increasingly look past headline IRR to "unlevered IRR" (excluding sub line effects).' },
        { type: 'text', value: 'Quick exits also produce optically great IRR. A 1.5× MOIC in 18 months is a 35 % IRR — but only generated 0.5× of profit. Mature LPs prefer 2.5× MOIC over 5 years over the flashy 18-month exit.' },
      ]},
    ],
  },
  {
    id: 'exit_strategies', name: 'Exit strategies', icon: ArrowRight, color: '#06b6d4',
    tagline: 'How PE firms turn paper gains into realised returns — and why exit timing matters as much as entry',
    summary: 'PE firms have four main exit paths: sale to a strategic, sale to another sponsor (secondary buyout), IPO, or dividend recap. Each path has different return profiles, market dependencies, and timing constraints.',
    sections: [
      { title: 'The four exits', icon: Target, content: [
        { type: 'highlight', items: [
          { label: 'Strategic sale', desc: 'Sell to a corporate buyer in the same / adjacent industry. Strategics pay synergy-laden multiples and want full control. Most common exit for mid-market deals. Examples: Disney buying Pixar, Microsoft buying LinkedIn.' },
          { label: 'Secondary buyout', desc: 'Sell to another PE firm. Often when the seller has reached its hold ceiling but there\'s more value to extract. Faster execution than strategic sales but typically lower multiples. ~25 % of PE exits today.' },
          { label: 'IPO', desc: 'List the company publicly. PE firm retains a stake post-IPO and sells down over 12-24 months. Best for large, high-growth assets when public markets are receptive. Examples: Hilton (Blackstone, 2013), Dollar General (KKR, 2009).' },
          { label: 'Dividend recapitalisation', desc: 'NOT a true exit — refinance with more debt and pay a dividend to equity holders. Used when exits are difficult but balance sheet allows it. Returns capital without giving up control.' },
          { label: 'Continuation vehicle', desc: 'Roll over a portfolio company into a new fund managed by the same GP, with new LPs buying out original LPs. Increasingly common (~15 % of exits in 2024).' },
        ]},
      ]},
      { title: 'Timing — when do PE firms sell?', icon: Calculator, content: [
        { type: 'text', value: 'Average hold period: 5-6 years. The first 2 years are operational set-up; years 3-5 are the value-creation harvest; year 5+ is sale prep.' },
        { type: 'text', value: 'Sell-side bankers are typically engaged 6-9 months before close. Process timeline (CIM → first round → second round → SPA → close) takes another 4-6 months on top of that.' },
      ]},
      { title: 'Famous exits', icon: Building2, content: [
        { type: 'text', value: 'Hilton (Blackstone): $26B LBO in 2007, IPO\'d in 2013, generated $14B in profit — the most profitable PE deal ever recorded.' },
        { type: 'text', value: 'Dollar General (KKR): $7.3B LBO in 2007, IPO\'d in 2009, profit of ~$13B over the lifetime.' },
        { type: 'text', value: 'On the failure side: Toys "R" Us (KKR + Bain Cap + Vornado, 2005 LBO), bankrupt 2017. TXU (KKR + TPG + Goldman, $45B in 2007), bankrupt 2014.' },
      ]},
    ],
  },
]

// ──────────────────────────────────────────────────────
// Render
// ──────────────────────────────────────────────────────
export default function PrivateEquity() {
  const [expanded, setExpanded] = useState(null)

  return (
    <div className="space-y-8 max-w-[1000px] mx-auto">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <PiggyBank size={22} className="text-red-500" /> Private Equity
        </h1>
        <p className="text-sm text-terminal-muted mt-1">
          The PE business model, fund structure, strategies and investment process — plus the LBO mechanics every analyst is expected to know.
        </p>
      </div>

      {/* Quick access to the interactive LBO */}
      <Link to="/lbo" className="panel p-4 flex items-center gap-4 hover:border-accent/30 transition-all">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-red-500/15">
          <PiggyBank size={20} className="text-red-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">Try the interactive LBO Model</p>
          <p className="text-xs text-terminal-muted mt-0.5">Adjust equity %, EBITDA growth, exit multiple — see IRR and MOIC live.</p>
        </div>
        <ArrowRight size={16} className="text-terminal-muted shrink-0" />
      </Link>

      {/* Fundamentals */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Briefcase size={18} className="text-accent" />
          <h2 className="text-base font-bold uppercase tracking-wider text-accent">Fundamentals</h2>
          <span className="text-xs text-terminal-muted">— What PE is and how the industry works</span>
        </div>
        <div className="space-y-3">
          {FUNDAMENTALS.map(c => <PeCard key={c.id} card={c} expanded={expanded} setExpanded={setExpanded} />)}
        </div>
      </div>

      {/* LBO mechanics */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Calculator size={18} className="text-red-500" />
          <h2 className="text-base font-bold uppercase tracking-wider text-red-500">LBO Mechanics & Value Creation</h2>
          <span className="text-xs text-terminal-muted">— The technicals every PE interview tests</span>
        </div>
        <div className="space-y-3">
          {LBO_MECHANICS.map(c => <PeCard key={c.id} card={c} expanded={expanded} setExpanded={setExpanded} />)}
        </div>
      </div>
    </div>
  )
}

function PeCard({ card, expanded, setExpanded }) {
  const Icon = card.icon
  const isOpen = expanded === card.id

  return (
    <div className="panel transition-all overflow-hidden" style={isOpen ? { borderColor: card.color + '40' } : {}}>
      <button onClick={() => setExpanded(isOpen ? null : card.id)} className="w-full text-left p-5 flex items-start gap-4">
        <div className="p-2.5 rounded-xl shrink-0 mt-0.5" style={{ backgroundColor: card.color + '15' }}>
          <Icon size={20} style={{ color: card.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold">{card.name}</h2>
          <p className="text-sm text-terminal-muted mt-0.5">{card.tagline}</p>
          {!isOpen && <p className="text-sm text-terminal-muted mt-2 line-clamp-2">{card.summary}</p>}
        </div>
        {isOpen ? <ChevronUp size={18} className="text-terminal-muted shrink-0 mt-1" /> : <ChevronDown size={18} className="text-terminal-muted shrink-0 mt-1" />}
      </button>

      {isOpen && (
        <div className="px-5 pb-6 space-y-6">
          <div className="pl-14"><p className="text-sm leading-relaxed">{card.summary}</p></div>

          {card.sections.map((section, si) => {
            const SIcon = section.icon
            return (
              <div key={si} className="pl-14">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: card.color }}>
                  <SIcon size={14} /> {section.title}
                </h3>
                <div className="space-y-3">
                  {section.content.map((block, bi) => renderBlock(block, bi, card.color))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function renderBlock(block, key, color) {
  if (block.type === 'text') {
    return <p key={key} className="text-sm leading-relaxed text-terminal-text/85">{block.value}</p>
  }
  if (block.type === 'formula') {
    return (
      <div key={key} className="bg-terminal-bg rounded-xl px-4 py-3 font-mono text-sm border-l-2" style={{ borderColor: color }}>
        {block.value}
      </div>
    )
  }
  if (block.type === 'highlight') {
    return (
      <div key={key} className="space-y-2">
        {block.items.map((item, ii) => (
          <div key={ii} className="flex items-start gap-3 bg-terminal-bg rounded-xl p-3">
            <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5" style={{ backgroundColor: color + '20', color }}>
              {ii + 1}
            </span>
            <div>
              <span className="text-sm font-semibold">{item.label}</span>
              <span className="text-sm text-terminal-muted"> — {item.desc}</span>
            </div>
          </div>
        ))}
      </div>
    )
  }
  if (block.type === 'proscons') {
    return (
      <div key={key} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-gain uppercase tracking-wider">Strengths</p>
          {block.pros.map((p, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-terminal-text/80">
              <span className="text-gain mt-0.5">✓</span> {p}
            </div>
          ))}
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-loss uppercase tracking-wider">Risks</p>
          {block.cons.map((c, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-terminal-text/80">
              <span className="text-loss mt-0.5">✗</span> {c}
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}
