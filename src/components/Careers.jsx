import { GraduationCap, Calendar, FileText, Building2, Target, Briefcase } from 'lucide-react'

const TIMELINE = [
  { period: 'Year before junior summer',       milestone: 'Apply to spring weeks (1st years). Insight programmes are the easiest entry to a bank\'s recruiting funnel.' },
  { period: 'Sept – Nov (year before SA)',      milestone: 'Apply to Summer Analyst programmes for the following summer. Most BB / EB applications open July–Sept and close Nov.' },
  { period: 'Nov – Feb',                        milestone: 'HireVue / video interviews → first round → super day. Decisions usually by March.' },
  { period: 'Summer (10 weeks)',                milestone: 'Summer Analyst stint. ~85 % conversion to full-time return offer for top performers.' },
  { period: 'After SA',                         milestone: 'Return-offer decision typically within 2-3 weeks of end of programme.' },
  { period: 'Full-time start (year after)',     milestone: '2 weeks of induction training, then placed in a group. Typical 2-year analyst stint.' },
]

const CV_STRUCTURE = [
  { section: 'Education',     advice: 'Top — institution, programme, expected graduation, GPA / overall mark (if strong), relevant coursework. 1-2 lines on academic societies if relevant.' },
  { section: 'Experience',    advice: 'Reverse chronological. Each role: 2-4 bullets, action verb + quantified outcome. Tailor wording to IB (model, valuation, sector, M&A, financing).' },
  { section: 'Skills',        advice: 'Excel, PowerPoint, Bloomberg, Capital IQ, FactSet (if real). Languages. NOT "Microsoft Word".' },
  { section: 'Interests',     advice: 'Real, specific, talkable. "Long-distance running" beats "sports". Recruiters use this to small-talk.' },
  { section: 'Length',        advice: 'One page. Period. Banks will not read a second page.' },
]

const FIRM_TIERS = [
  { tier: 'Bulge Brackets (BB)',         examples: 'Goldman Sachs, Morgan Stanley, J.P. Morgan, Bank of America, Citi, Barclays, UBS, Deutsche Bank', notes: 'Full-service banks. Large M&A, ECM, DCM, sales & trading, asset management. Bigger groups, more structure, broader brand.' },
  { tier: 'Elite Boutiques (EB)',        examples: 'Evercore, Centerview, Lazard, PJT Partners, Moelis, Guggenheim, Perella Weinberg, Greenhill', notes: 'M&A advisory pure-play. Smaller classes, more responsibility early, often higher pay at junior level. Centerview and PJT are the most selective.' },
  { tier: 'Mid-Market / In-Between (MM)', examples: 'Houlihan Lokey, Jefferies, Lincoln International, William Blair, Piper Sandler, Robert W Baird', notes: 'Strong in mid-market M&A, restructuring (HL especially), industry-specialist work. Excellent training.' },
  { tier: 'Restructuring Specialists',   examples: 'Houlihan Lokey, PJT (Park Hill), Lazard, Rothschild, Moelis', notes: 'Distressed M&A and Ch.11 advisory. Counter-cyclical workflow. Heavy capital structure analysis.' },
]

const EXIT_PATHS = [
  { destination: 'Private Equity',           description: 'The classic exit. KKR, Blackstone, Apollo, mid-market funds. Recruiting starts ~6 months into your analyst stint. Mega-fund process is the most structured.' },
  { destination: 'Hedge Funds',              description: 'L/S equity, event-driven, credit. Less structured recruiting. Tiger Cubs, Citadel, Millennium are the heavy hitters.' },
  { destination: 'Venture Capital / Growth', description: 'Smaller checks, longer hold, more product / market focus. Different muscle than IB — typically requires conscious effort to position.' },
  { destination: 'Corporate Development',    description: 'Strategy / M&A roles inside a corporate. Better hours, similar work to sellside without the pitching.' },
  { destination: 'Business school',          description: 'M7 MBA — typically after 3-5 years post-IB. Common reset before a career pivot.' },
  { destination: 'Stay in IB',               description: 'Promote to associate at year 3. From there: VP at ~year 6, MD at ~year 12. The minority who stay can earn very well.' },
]

export default function Careers() {
  return (
    <div className="space-y-6 max-w-[1000px]">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <GraduationCap size={22} className="text-yellow-500" /> Career Resources
        </h1>
        <p className="text-sm text-terminal-muted mt-1">
          The application timeline, CV structure, firm landscape, and where IB analysts go next.
        </p>
      </div>

      {/* Timeline */}
      <section className="panel p-5 space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-yellow-500 flex items-center gap-2">
          <Calendar size={14} /> Recruiting Timeline (Summer Analyst)
        </h2>
        <div className="space-y-2">
          {TIMELINE.map((t, i) => (
            <div key={i} className="flex items-start gap-4 bg-terminal-bg/40 rounded-lg px-3 py-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-500 w-28 shrink-0 mt-0.5">{t.period}</span>
              <span className="text-sm text-terminal-text/85 leading-snug">{t.milestone}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CV */}
      <section className="panel p-5 space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-yellow-500 flex items-center gap-2">
          <FileText size={14} /> CV / Resume Structure
        </h2>
        <div className="space-y-2">
          {CV_STRUCTURE.map(c => (
            <div key={c.section} className="bg-terminal-bg/40 rounded-lg px-3 py-2.5">
              <p className="text-sm font-semibold">{c.section}</p>
              <p className="text-xs text-terminal-muted mt-1 leading-relaxed">{c.advice}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Firm tiers */}
      <section className="panel p-5 space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-yellow-500 flex items-center gap-2">
          <Building2 size={14} /> Where IB Happens — Firm Landscape
        </h2>
        <div className="space-y-3">
          {FIRM_TIERS.map(f => (
            <div key={f.tier} className="bg-terminal-bg/40 rounded-xl p-3">
              <p className="text-sm font-semibold">{f.tier}</p>
              <p className="text-[11px] font-mono text-terminal-muted mt-1">{f.examples}</p>
              <p className="text-xs text-terminal-text/80 mt-2 leading-relaxed">{f.notes}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Exits */}
      <section className="panel p-5 space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-yellow-500 flex items-center gap-2">
          <Target size={14} /> Where the 2-year Analyst Goes Next
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {EXIT_PATHS.map(e => (
            <div key={e.destination} className="bg-terminal-bg/40 rounded-xl p-3">
              <p className="text-sm font-semibold flex items-center gap-2"><Briefcase size={12} className="text-yellow-500" />{e.destination}</p>
              <p className="text-xs text-terminal-muted mt-1.5 leading-relaxed">{e.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
