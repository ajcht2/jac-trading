import { useState } from 'react'
import {
  Briefcase, Building2, Calculator, Target, AlertTriangle, ChevronDown,
  ChevronUp, TrendingUp, Layers, DollarSign, Scale, GitMerge, PiggyBank,
  BookOpen, FileText, Award,
} from 'lucide-react'

// ── M&A FUNDAMENTALS ──────────────────────────────
const FUNDAMENTALS = [
  {
    id: 'intro_ma', name: 'Introduction to M&A', icon: GitMerge, color: '#3b82f6',
    tagline: 'What mergers & acquisitions are, why they happen, and the language you need',
    summary: 'M&A is the transaction-driven side of corporate finance: one company buying, selling, or combining with another. Mastering M&A vocabulary and motivations is essential for anyone aiming for investment banking, private equity, or corporate strategy.',
    sections: [
      { title: 'Merger vs Acquisition', icon: Target, content: [
        { type: 'text', value: 'These terms are often used interchangeably but technically differ:' },
        { type: 'highlight', items: [
          { label: 'Merger', desc: 'Two companies combine to form a new entity. Branding is usually "merger of equals" even if one party is dominant (e.g. Daimler + Chrysler, 1998).' },
          { label: 'Acquisition', desc: 'One company buys another and absorbs it. The target is delisted (e.g. Microsoft buying Activision Blizzard, 2023).' },
          { label: 'Takeover', desc: 'Acquisition with a hostile or unsolicited connotation — the target\'s board did not invite the offer.' },
        ]},
      ]},
      { title: 'Why companies do M&A', icon: Target, content: [
        { type: 'highlight', items: [
          { label: 'Growth', desc: 'Faster than organic — buy revenue, customers, geography overnight' },
          { label: 'Synergies', desc: 'Cost cuts (1+1=1.5) or revenue uplift (1+1=2.5) from combining operations' },
          { label: 'Market power', desc: 'Reduce competition, gain pricing leverage' },
          { label: 'Talent / tech', desc: '"Acqui-hires" — buying an engineering team or proprietary IP' },
          { label: 'Vertical integration', desc: 'Control supply chain (Amazon buying Whole Foods, 2017)' },
          { label: 'Diversification', desc: 'Enter new sectors to smooth out earnings cyclicality' },
        ]},
      ]},
      { title: 'Types of deals', icon: Target, content: [
        { type: 'highlight', items: [
          { label: 'Horizontal', desc: 'Same industry, same stage of value chain (Exxon + Mobil, 1999)' },
          { label: 'Vertical', desc: 'Different points of the same supply chain (Disney + Lucasfilm)' },
          { label: 'Conglomerate', desc: 'Unrelated businesses under one owner (Berkshire Hathaway empire)' },
          { label: 'Friendly', desc: 'Target board agrees and recommends the deal to shareholders' },
          { label: 'Hostile', desc: 'Buyer bypasses the board with a tender offer directly to shareholders' },
        ]},
      ]},
      { title: 'Real-world context', icon: Building2, content: [
        { type: 'text', value: 'Global M&A volume averages $3-4 trillion per year. The five largest deals in history each exceeded $100B: Vodafone-Mannesmann (1999), AOL-Time Warner (2000), Verizon-Vodafone (2013), AB InBev-SABMiller (2016), Dow-DuPont (2015). The top M&A advisors are the bulge brackets (Goldman Sachs, JPMorgan, Morgan Stanley, BofA) and elite boutiques (Evercore, Centerview, Lazard, PJT, Moelis).' },
      ]},
    ],
  },
  {
    id: 'deal_structure', name: 'Deal Structure: Stock vs Asset', icon: Layers, color: '#a855f7',
    tagline: 'How the transaction is legally structured changes everything — tax, liabilities, complexity',
    summary: 'Buyers and sellers must choose between buying the target\'s stock (acquiring the whole company including all liabilities) or buying specific assets (cherry-picking what you want). The choice has massive tax and legal implications and is fought over in every deal negotiation.',
    sections: [
      { title: 'Stock purchase', icon: Target, content: [
        { type: 'text', value: 'The buyer purchases the target\'s shares directly from shareholders. The target legal entity continues to exist, now owned by the buyer.' },
        { type: 'proscons',
          pros: ['Simpler — one contract, one closing event', 'Contracts, licenses, employees stay in place (no re-papering)', 'Better for sellers — capital gains tax treatment'],
          cons: ['Buyer inherits ALL liabilities (lawsuits, environmental, tax issues)', 'No "step-up" in asset tax basis → less depreciation shield', 'Usually requires target shareholder approval'] },
      ]},
      { title: 'Asset purchase', icon: Target, content: [
        { type: 'text', value: 'The buyer cherry-picks specific assets and assumes only chosen liabilities. The target shell company (with the unwanted liabilities) remains with the seller and is usually wound down.' },
        { type: 'proscons',
          pros: ['Buyer chooses what to take and what to leave behind', 'Step-up in tax basis → bigger depreciation deductions for the buyer', 'Cleaner exit for buying just one division'],
          cons: ['Each asset and contract must be transferred individually (slow, costly)', 'Seller may face double taxation (corporate-level tax then shareholder dividend tax)', 'Customer and employee relationships need re-papering'] },
      ]},
      { title: 'Method of payment', icon: DollarSign, content: [
        { type: 'highlight', items: [
          { label: 'All-cash', desc: 'Buyer pays cash. Clean, certain, but consumes cash reserves or requires new debt' },
          { label: 'All-stock', desc: 'Buyer issues new shares to target shareholders. No cash outflow but dilutes existing shareholders' },
          { label: 'Mixed', desc: 'A blend of cash + stock + earn-outs + contingent value rights (CVRs)' },
        ]},
        { type: 'text', value: 'Cash deals signal confidence (the buyer believes its stock is undervalued). Stock deals are common when the buyer\'s share price is rich and they want to "spend it" before it falls.' },
      ]},
    ],
  },
  {
    id: 'deal_process', name: 'The Deal Process', icon: FileText, color: '#10b981',
    tagline: 'From first conversation to closing — the typical M&A lifecycle takes 6-18 months',
    summary: 'Investment banking analysts spend most of their time on this process — building pitches, models, marketing materials, and managing the data room. Understanding each phase is critical for IB interviews and the first weeks on desk.',
    sections: [
      { title: 'Phase 1: Origination', icon: Target, content: [
        { type: 'highlight', items: [
          { label: 'Pitch', desc: 'Banks pitch buyside (find targets) or sellside (run a process) mandates with elaborate pitch books' },
          { label: 'Target identification', desc: 'Build a list of potential buyers or targets with strategic and financial fit' },
          { label: 'Engagement letter', desc: 'Bank is officially hired as advisor; fee structure (retainer + success fee) is locked in' },
        ]},
      ]},
      { title: 'Phase 2: Marketing', icon: Target, content: [
        { type: 'highlight', items: [
          { label: 'Teaser', desc: '1-2 page anonymous summary of the target — sent to potential buyers' },
          { label: 'NDA', desc: 'Interested buyers sign a confidentiality agreement before getting more info' },
          { label: 'CIM', desc: 'Confidential Information Memorandum (50-100 pages) — the full description of the business, financials, growth story' },
          { label: 'Management presentation', desc: 'Buyers meet target management in person, ask probing questions' },
        ]},
      ]},
      { title: 'Phase 3: Bidding & Due Diligence', icon: Target, content: [
        { type: 'highlight', items: [
          { label: 'First-round bid (IOI)', desc: 'Indication of Interest — non-binding price range based on the CIM' },
          { label: 'Second-round bid (LOI)', desc: 'Letter of Intent — more binding, submitted after deeper diligence' },
          { label: 'Due diligence', desc: 'Buyer combs through financials, contracts, legal, HR, IP, IT, environmental — usually with help from accountants and lawyers' },
          { label: 'Data room', desc: 'Secure online repository (e.g. Datasite, Intralinks) with thousands of confidential documents' },
        ]},
      ]},
      { title: 'Phase 4: Signing & Closing', icon: Target, content: [
        { type: 'highlight', items: [
          { label: 'Purchase agreement', desc: 'SPA (Stock) or APA (Asset) — the master contract, ~200+ pages, negotiated line-by-line by lawyers' },
          { label: 'Signing', desc: 'Both sides sign; if public, an announcement is filed (8-K in the US)' },
          { label: 'Regulatory approval', desc: 'Antitrust review (FTC/DOJ in US, CMA in UK, EU Commission) can take 3-12 months' },
          { label: 'Closing', desc: 'All conditions met, money/stock changes hands, deal complete and integration begins' },
        ]},
      ]},
    ],
  },
]

// ── VALUATION & MODELING ──────────────────────────────
const VALUATION = [
  {
    id: 'dcf', name: 'Discounted Cash Flow (DCF)', icon: Calculator, color: '#3b82f6',
    tagline: 'Intrinsic valuation — what a business is worth based on projected cash flows',
    summary: 'The DCF projects a company\'s future free cash flows and discounts them back to today using the firm\'s weighted average cost of capital (WACC). It\'s the most fundamental valuation method — the entire theory of corporate finance is built on it.',
    sections: [
      { title: 'How it works', icon: Target, content: [
        { type: 'highlight', items: [
          { label: 'Project FCF', desc: 'Forecast unlevered free cash flow for 5-10 years (the explicit forecast period)' },
          { label: 'Terminal Value', desc: 'Estimate the value of all cash flows beyond the forecast (Gordon Growth or exit multiple)' },
          { label: 'Discount Rate (WACC)', desc: 'Weighted Average Cost of Capital — what the company\'s capital costs on average' },
          { label: 'Sum to Enterprise Value', desc: 'Discount every FCF + terminal value to present. Subtract net debt → Equity Value' },
        ]},
      ]},
      { title: 'The math', icon: Calculator, content: [
        { type: 'formula', value: 'Enterprise Value = Σ [FCF(t) / (1+WACC)^t]  +  TV / (1+WACC)^n' },
        { type: 'formula', value: 'Terminal Value (Gordon) = FCF(n+1) / (WACC - g)' },
        { type: 'formula', value: 'WACC = (E/V) × Re  +  (D/V) × Rd × (1-Tc)' },
        { type: 'text', value: 'FCF = EBIT × (1-T) + D&A − CapEx − ΔWorking Capital. We use unlevered FCF (before interest), so we discount with the firm-wide rate (WACC). g is the perpetual growth rate, typically 2-3% — never above long-term GDP growth.' },
      ]},
      { title: 'Strengths & risks', icon: AlertTriangle, content: [
        { type: 'proscons',
          pros: ['Theoretically the most rigorous valuation method', 'Highlights the value drivers (margins, growth, capex efficiency)', 'Independent of short-term market mood'],
          cons: ['Extremely sensitive to assumptions — small changes in g or WACC produce huge swings', 'Terminal value usually represents 60-80% of total → dominates the answer', '"Garbage in, garbage out" — long-dated projections are educated guesses'] },
      ]},
      { title: 'When used', icon: Building2, content: [
        { type: 'text', value: 'Every M&A pitch deck, every IB analyst\'s first model, every PE diligence. Especially relevant for high-growth or stable cash flow businesses, or those with no good public comparables. Less useful for cyclical or early-stage companies where projections are unreliable.' },
      ]},
    ],
  },
  {
    id: 'comps', name: 'Trading Comparables', icon: Scale, color: '#a855f7',
    tagline: 'Relative valuation — what the market is paying for similar listed companies right now',
    summary: 'Identify a peer group of publicly-traded companies similar to the target, then apply their valuation multiples to the target\'s financials. Faster than a DCF and grounded in observable market data, but only as good as the peer set.',
    sections: [
      { title: 'How it works', icon: Target, content: [
        { type: 'highlight', items: [
          { label: 'Select peers', desc: 'Find 5-10 listed competitors in the same industry, similar size, growth, and margins' },
          { label: 'Pick the right multiple', desc: 'EV/Revenue, EV/EBITDA, P/E — the right metric depends on the industry and profitability' },
          { label: 'Apply to target', desc: 'Multiply target\'s metric by the peer median (or 25th-75th percentile range) → implied valuation range' },
        ]},
      ]},
      { title: 'Common multiples', icon: Calculator, content: [
        { type: 'formula', value: 'EV / Revenue   → for unprofitable or early-stage companies (e.g. SaaS)' },
        { type: 'formula', value: 'EV / EBITDA    → most common, ignores capital structure and D&A' },
        { type: 'formula', value: 'P / E          → equity-side; sensitive to leverage and tax rate' },
        { type: 'formula', value: 'P / Book       → banks and financial institutions' },
      ]},
      { title: 'Strengths & risks', icon: AlertTriangle, content: [
        { type: 'proscons',
          pros: ['Fast and intuitive', 'Reflects current market sentiment', 'Easy to communicate to non-technical audiences'],
          cons: ['No two companies are truly comparable', 'Pulls in market mispricing (e.g. dotcom bubble peers)', 'Doesn\'t capture standalone fundamentals or growth differences'] },
      ]},
      { title: 'In practice', icon: Building2, content: [
        { type: 'text', value: 'On every M&A pitch you\'ll see a "football field" — a chart with valuation ranges from comps, precedents, DCF, and LBO. Trading comps usually anchor the lower end. SaaS bankers focus on EV/Revenue, industrials on EV/EBITDA, banks on P/Tangible Book Value.' },
      ]},
    ],
  },
  {
    id: 'precedents', name: 'Precedent Transactions', icon: BookOpen, color: '#f59e0b',
    tagline: 'What buyers actually paid for similar companies in past deals — the control premium baked in',
    summary: 'Look at past M&A deals involving comparable targets to derive valuation multiples. Unlike trading comps, these reflect what acquirers actually paid — including the control premium and expected synergies.',
    sections: [
      { title: 'How it works', icon: Target, content: [
        { type: 'highlight', items: [
          { label: 'Find past deals', desc: 'Use Bloomberg / MergerMarket / Capital IQ to find similar M&A in the last 3-5 years' },
          { label: 'Compute multiples', desc: 'For each deal: EV (paid) / target\'s LTM Revenue or EBITDA' },
          { label: 'Apply the range', desc: 'Use the median (or 25th-75th percentile range) and apply to the target' },
        ]},
      ]},
      { title: 'Why higher than trading comps', icon: Calculator, content: [
        { type: 'text', value: 'Precedent transaction multiples are typically 20-40% above trading comps because the price paid includes:' },
        { type: 'highlight', items: [
          { label: 'Control premium', desc: 'Buyers pay extra to gain control of the company (typically 20-30%)' },
          { label: 'Synergies', desc: 'Expected cost cuts or revenue uplift baked into the price the buyer is willing to pay' },
          { label: 'Competitive tension', desc: 'Auction dynamics push prices higher when multiple bidders compete' },
        ]},
      ]},
      { title: 'Strengths & risks', icon: AlertTriangle, content: [
        { type: 'proscons',
          pros: ['Captures the "M&A premium" — what acquirers actually pay', 'Useful for negotiating sellside expectations', 'Industry-specific data points'],
          cons: ['Past deals may not reflect today\'s market (interest rates, sentiment, regulation)', 'Deal-specific synergies skew the multiples', 'Hard to find genuinely comparable transactions'] },
      ]},
      { title: 'In practice', icon: Building2, content: [
        { type: 'text', value: 'When advising a target, bankers cite high precedents to justify a premium price. When advising a buyer, they cite low precedents to argue against overpaying. Always presented alongside trading comps in the football field.' },
      ]},
    ],
  },
  {
    id: 'lbo', name: 'Leveraged Buyout (LBO)', icon: PiggyBank, color: '#dc2626',
    tagline: 'A private equity firm acquires a company using mostly borrowed money',
    summary: 'LBO is both a valuation method AND a transaction type. PE firms finance ~60-80% of the purchase price with debt, hold for 3-7 years, then exit (sale or IPO). The leverage amplifies returns to equity, but also the downside.',
    sections: [
      { title: 'How it works', icon: Target, content: [
        { type: 'highlight', items: [
          { label: 'Sources', desc: 'Where the money comes from: PE sponsor equity (20-40%) + senior debt + mezzanine debt + sometimes seller rollover or earn-out' },
          { label: 'Uses', desc: 'Where it goes: purchase price + refinance existing debt + transaction fees' },
          { label: 'Hold period', desc: 'PE firm operates the company for 3-7 years, uses cash flow to pay down debt' },
          { label: 'Exit', desc: 'Sell to another buyer, IPO, or recapitalisation → return capital plus profit to the LPs' },
        ]},
      ]},
      { title: 'The math: returns', icon: Calculator, content: [
        { type: 'formula', value: 'IRR = (Exit Equity / Entry Equity)^(1/years) - 1' },
        { type: 'formula', value: 'MOIC = Exit Equity Value / Entry Equity Value' },
        { type: 'text', value: 'PE firms typically target 20-25% IRR and 2.5-3.0× MOIC over a 5-year hold. The three return drivers are: (1) multiple expansion (sell at a higher multiple than you bought), (2) EBITDA growth, (3) debt paydown (more of the firm\'s value flows to equity over time).' },
      ]},
      { title: 'Strengths & risks', icon: AlertTriangle, content: [
        { type: 'proscons',
          pros: ['Leverage amplifies equity returns when things go well', 'Tax shield from deductible interest', 'Forces operational discipline — must service debt'],
          cons: ['High leverage = high risk of default in a downturn', 'Limited flexibility — most cash flow earmarked for debt service', 'Needs stable cash flows (not cyclical, not R&D-heavy)'] },
      ]},
      { title: 'In practice', icon: Building2, content: [
        { type: 'text', value: 'Major PE firms: Blackstone, KKR, Carlyle, Apollo, TPG, Bain Capital, CVC, EQT, Advent, Hellman & Friedman. Famous LBOs: RJR Nabisco ($25B, 1989 — "Barbarians at the Gate"), TXU ($45B, 2007 — bankrupt), Toys "R" Us ($6.6B, 2005 — bankrupt 2017), Heinz ($23B, 2013, by 3G Capital + Berkshire Hathaway).' },
      ]},
    ],
  },
  {
    id: 'accretion_dilution', name: 'Accretion / Dilution Analysis', icon: TrendingUp, color: '#10b981',
    tagline: 'Will the deal increase or decrease the buyer\'s EPS? The simplest test for M&A value',
    summary: 'A back-of-the-envelope check: combine the buyer\'s and target\'s financials, account for the deal financing, and see whether pro forma EPS goes up (accretive) or down (dilutive). Boards and equity analysts watch this metric closely.',
    sections: [
      { title: 'How it works', icon: Target, content: [
        { type: 'highlight', items: [
          { label: 'Buyer Net Income', desc: 'Start with the buyer\'s standalone net income' },
          { label: '+ Target Net Income', desc: 'Add the target\'s net income (after tax)' },
          { label: '− Financing cost', desc: 'Subtract incremental after-tax interest on any new debt issued' },
          { label: '+ Synergies (optional)', desc: 'Add any after-tax cost synergies expected immediately' },
          { label: '÷ New share count', desc: 'Divide by buyer\'s total shares (existing + any new shares issued to the target)' },
          { label: '= Pro forma EPS', desc: 'Compare to buyer\'s standalone EPS — accretive if higher, dilutive if lower' },
        ]},
      ]},
      { title: 'Worked example', icon: Calculator, content: [
        { type: 'text', value: 'Buyer: $100M net income, 100M shares → EPS = $1.00. Target: $20M net income, $300M purchase price. Buyer issues $150M new shares at $10 each (15M new shares) and borrows $150M at 5% pre-tax (after-tax cost = 5%×(1−25%) = 3.75%).' },
        { type: 'formula', value: 'New Net Income = 100 + 20 − (150 × 3.75%) = $114.4M' },
        { type: 'formula', value: 'New Shares = 100 + 15 = 115M' },
        { type: 'formula', value: 'Pro forma EPS = 114.4 / 115 = $0.99  →  Slightly dilutive (-1.0%)' },
      ]},
      { title: 'The "rule of thumb"', icon: Calculator, content: [
        { type: 'text', value: 'Quick mental check: for all-stock deals, a deal is accretive when the buyer\'s P/E ratio is HIGHER than the target\'s P/E. Cash deals (using cheap debt) tend to be accretive in low interest rate environments. This shortcut works because EPS = NI / Shares, and the buyer is effectively "trading" expensive shares for cheaper earnings.' },
      ]},
      { title: 'Why it matters', icon: Building2, content: [
        { type: 'text', value: 'Public-company CFOs and boards are obsessed with EPS — equity analysts and investors react sharply to dilution. But accretion alone doesn\'t mean a deal is good — paying too much can still destroy long-term value even if reported EPS rises. It\'s a necessary but not sufficient test.' },
      ]},
    ],
  },
  {
    id: 'synergies', name: 'Synergies', icon: Award, color: '#f97316',
    tagline: 'The value created by combining two companies — the holy grail of M&A justification',
    summary: 'Synergies are the value where 1+1=3 — what the combined company is worth above the sum of the parts. Cost synergies are easier to model and more credible; revenue synergies are aspirational and rarely materialise fully.',
    sections: [
      { title: 'Types of synergies', icon: Target, content: [
        { type: 'highlight', items: [
          { label: 'Cost synergies', desc: 'Eliminate redundant overhead, consolidate offices, vendor discounts, IT consolidation. Tangible and credible.' },
          { label: 'Revenue synergies', desc: 'Cross-sell, expanded geography, new product bundling. Aspirational and often missed.' },
          { label: 'Financial synergies', desc: 'Lower cost of capital, tax benefits (NOL utilisation), better terms on debt' },
          { label: 'Operational synergies', desc: 'Better procurement, shared supply chain, technology integration' },
        ]},
      ]},
      { title: 'Valuing synergies', icon: Calculator, content: [
        { type: 'formula', value: 'Synergy Value = Σ [After-tax Synergy CF(t) / (1+WACC)^t]' },
        { type: 'text', value: 'Run-rate synergies are typically achieved 2-3 years post-close. You also need to account for one-time costs to achieve them (severance, consulting fees, IT integration). Rule of thumb: 50-70% of announced cost synergies materialise; only 30-50% of revenue synergies do.' },
      ]},
      { title: 'Strengths & risks', icon: AlertTriangle, content: [
        { type: 'proscons',
          pros: ['Cost synergies are largely under the buyer\'s control', 'They justify the control premium paid', 'When real, drive 50%+ of deal value creation'],
          cons: ['Often overestimated to justify the price', 'Revenue synergies rarely hit announced projections', 'Cost-to-achieve frequently exceeds initial estimates'] },
      ]},
      { title: 'Real examples', icon: Building2, content: [
        { type: 'text', value: '✓ Disney-Pixar (2006): Pixar IP × Disney distribution → blockbuster franchises (Toy Story sequels, Cars). ✗ AOL-Time Warner (2000): "convergence" synergies never materialised, destroyed >$200B of value. ✗ HP-Autonomy (2011): HP wrote off $8.8B just 13 months later after alleged accounting fraud.' },
      ]},
    ],
  },
]

// ──────────────────────────────────────────────────────
// Render
// ──────────────────────────────────────────────────────
export default function MergersAcquisitions() {
  const [expanded, setExpanded] = useState(null)

  return (
    <div className="space-y-8 max-w-[1000px]">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Briefcase size={22} className="text-accent" /> Mergers & Acquisitions
        </h1>
        <p className="text-sm text-terminal-muted mt-1">
          Investment banking, valuation, and deal mechanics — built for finance students.
        </p>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <GitMerge size={18} className="text-accent" />
          <h2 className="text-base font-bold uppercase tracking-wider text-accent">Fundamentals</h2>
          <span className="text-xs text-terminal-muted">— Concepts and language</span>
        </div>
        <div className="space-y-3">
          {FUNDAMENTALS.map(s => <MnaCard key={s.id} card={s} expanded={expanded} setExpanded={setExpanded} />)}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <Calculator size={18} className="text-yellow-500" />
          <h2 className="text-base font-bold uppercase tracking-wider text-yellow-500">Valuation & Modeling</h2>
          <span className="text-xs text-terminal-muted">— The four pillars of valuation + EPS & synergies</span>
        </div>
        <div className="space-y-3">
          {VALUATION.map(s => <MnaCard key={s.id} card={s} expanded={expanded} setExpanded={setExpanded} />)}
        </div>
      </div>
    </div>
  )
}

function MnaCard({ card, expanded, setExpanded }) {
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
