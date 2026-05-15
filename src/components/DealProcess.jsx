import { FileText, ArrowRight, Calendar, Briefcase, BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'

const PHASES = [
  {
    phase: 'Phase 1 — Origination',
    color: '#3b82f6',
    duration: 'Month 0',
    activities: [
      'Banker pitches buyside (find a target) or sellside (run a process) mandates',
      'Pitch book builds — comps, precedents, target list, indicative valuation',
      'Engagement letter signed; fee structure locked (retainer + success fee)',
    ],
    analystWork: 'Build the pitch book. Comps tables, precedents, football field, executive summary. Sometimes a teaser draft.',
  },
  {
    phase: 'Phase 2 — Marketing',
    color: '#a855f7',
    duration: 'Months 1-3',
    activities: [
      'Teaser (1-2 pages, anonymous) sent to potential buyers',
      'NDA signed by interested buyers before release of confidential information',
      'CIM (Confidential Information Memorandum, 50-100 pages) drafted — full business description, financials, growth story',
      'Management presentations — buyer meets target executives',
    ],
    analystWork: 'Build the CIM. Draft the management presentation. Coordinate the buyer Q&A log. Manage the data room.',
  },
  {
    phase: 'Phase 3 — Bidding & Diligence',
    color: '#10b981',
    duration: 'Months 3-6',
    activities: [
      'First-round bids (IOIs — Indication of Interest, non-binding price range)',
      'Sellside narrows to ~5-10 buyers for round 2',
      'Buyer diligence — financial, legal, commercial, tax, IT, HR, environmental',
      'Final bids (LOIs — Letters of Intent, binding offers)',
      'Exclusivity granted to the winner',
    ],
    analystWork: 'Operate the data room. Field hundreds of buyer questions per round. Update the model with each new piece of diligence info.',
  },
  {
    phase: 'Phase 4 — Signing & Closing',
    color: '#f59e0b',
    duration: 'Months 6-12',
    activities: [
      'SPA / APA (Sale & Purchase Agreement) negotiated by lawyers — reps & warranties, indemnities, MAC clauses, working capital adjustments',
      'Signing — 8-K filed (US public targets); press release',
      'Regulatory approval — FTC / DOJ (US), CMA (UK), EU Commission. Can take 3-12 months',
      'Closing — money / stock changes hands. Day 1 of integration.',
    ],
    analystWork: 'Run the fairness opinion. Track regulatory milestones. Prepare the closing book. Hand-off to integration team.',
  },
]

const JARGON = [
  { term: 'CIM',  full: 'Confidential Information Memorandum',     desc: 'The 50-100 page sellside book that describes the target to qualified buyers.' },
  { term: 'NDA',  full: 'Non-Disclosure Agreement',                 desc: 'Signed before any confidential info changes hands.' },
  { term: 'IOI',  full: 'Indication of Interest',                   desc: 'First-round non-binding bid (price range).' },
  { term: 'LOI',  full: 'Letter of Intent',                         desc: 'Second-round binding bid with detailed terms.' },
  { term: 'SPA',  full: 'Sale & Purchase Agreement (stock deals)',  desc: 'Master legal contract. Negotiated line by line by lawyers.' },
  { term: 'APA',  full: 'Asset Purchase Agreement (asset deals)',   desc: 'Equivalent for an asset purchase structure.' },
  { term: 'MAC',  full: 'Material Adverse Change clause',           desc: 'Lets the buyer walk away if something bad happens between signing and closing.' },
  { term: 'R&W',  full: 'Reps & Warranties',                        desc: 'Seller\'s representations about the business. Backed by escrows or insurance.' },
  { term: 'Earn-out', full: 'Contingent post-close payment',        desc: 'Part of the price paid out only if the business hits agreed performance milestones.' },
  { term: 'Working capital peg', full: '—',                          desc: 'Agreed level of working capital at closing. Difference is added to / subtracted from purchase price.' },
]

export default function DealProcess() {
  return (
    <div className="space-y-6 max-w-[1000px]">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <FileText size={22} className="text-sky-500" /> Deal Process
        </h1>
        <p className="text-sm text-terminal-muted mt-1">
          The 6 to 18 months from pitch to closing — every phase, what an analyst actually does, and the jargon.
        </p>
      </div>

      {/* Phases */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-sky-500">The Four Phases</h2>
        {PHASES.map(p => (
          <div key={p.phase} className="panel p-5 space-y-3" style={{ borderColor: p.color + '30' }}>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h3 className="text-base font-bold" style={{ color: p.color }}>{p.phase}</h3>
                <p className="text-[11px] font-mono text-terminal-muted mt-1 flex items-center gap-1.5">
                  <Calendar size={11} />{p.duration}
                </p>
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-terminal-muted mb-1.5">Activities</p>
              <div className="space-y-1">
                {p.activities.map((a, i) => (
                  <p key={i} className="text-sm text-terminal-text/85 flex items-start gap-2">
                    <span className="text-terminal-muted mt-1 shrink-0">•</span>{a}
                  </p>
                ))}
              </div>
            </div>
            <div className="border-l-2 pl-3" style={{ borderColor: p.color + '60' }}>
              <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: p.color }}>Analyst work</p>
              <p className="text-xs text-terminal-text/80 mt-1 leading-relaxed">{p.analystWork}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Jargon */}
      <section className="panel p-5 space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-sky-500 flex items-center gap-2">
          <Briefcase size={14} /> The Jargon You Need
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {JARGON.map(j => (
            <div key={j.term} className="bg-terminal-bg/40 rounded-lg px-3 py-2">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-mono font-bold text-sm text-sky-400">{j.term}</span>
                <span className="text-[11px] text-terminal-muted">{j.full}</span>
              </div>
              <p className="text-xs text-terminal-text/80 mt-1 leading-snug">{j.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link to="/m-and-a" className="panel p-4 hover:border-accent/30 transition-all flex items-center gap-3">
          <BookOpen size={16} className="text-accent shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Read the full M&A theory</p>
            <p className="text-[10px] text-terminal-muted">Deal Process is module 3</p>
          </div>
          <ArrowRight size={14} className="text-terminal-muted" />
        </Link>
        <Link to="/case-studies" className="panel p-4 hover:border-accent/30 transition-all flex items-center gap-3">
          <Briefcase size={16} className="text-accent shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">See real deals walked through</p>
            <p className="text-[10px] text-terminal-muted">Case studies</p>
          </div>
          <ArrowRight size={14} className="text-terminal-muted" />
        </Link>
      </div>
    </div>
  )
}
