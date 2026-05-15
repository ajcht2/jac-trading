import { useState } from 'react'
import { ArrowRight, Briefcase, Calculator, PiggyBank, GraduationCap, BarChart3, BookOpen, ChevronRight } from 'lucide-react'

const STEPS = [
  {
    icon: Briefcase,
    color: '#3b82f6',
    title: 'Welcome to JAC',
    description: 'An interactive corporate finance and M&A curriculum for students aiming at investment banking, leveraged finance, or equity research. Built around real modeling work and a structured set of lessons.',
  },
  {
    icon: BookOpen,
    color: '#a855f7',
    title: 'The M&A curriculum',
    description: 'Eight courses, thirty-two numbered lessons — from corporate finance foundations and the three statements to LBO mechanics and accretion/dilution. Each lesson has learning objectives, worked examples, and citations to real sources.',
  },
  {
    icon: Calculator,
    color: '#22c55e',
    title: 'The Valuation Tool',
    description: 'Pick a sector, enter LTM revenue and EBITDA, and get an instant football-field range across EV/Revenue, EV/EBITDA and a quick DCF. The exact output bankers present on a pitch.',
  },
  {
    icon: PiggyBank,
    color: '#ef4444',
    title: 'The LBO Model',
    description: 'Build a real leveraged buyout step by step — sources & uses, debt paydown schedule, year-by-year EBITDA, exit equity, IRR, MOIC, and the value-creation bridge (multiple expansion / EBITDA growth / deleveraging).',
  },
  {
    icon: GraduationCap,
    color: '#f59e0b',
    title: 'Markets simulator (side project)',
    description: 'There is also a markets simulator built as an engineering exercise: live charts, three paper-trading sandboxes, four backtested signals. Not the focus of the site — kept for those interested in the engineering side.',
  },
]

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0)
  const [dontShowAgain, setDontShowAgain] = useState(true)

  const current = STEPS[step]
  const Icon = current.icon
  const isLast = step === STEPS.length - 1

  const handleComplete = () => {
    onComplete(dontShowAgain)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ backgroundColor: 'rgba(11, 14, 20, 0.9)' }}>
      <div className="w-full max-w-md">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${
              i === step ? 'w-8 bg-accent' : i < step ? 'w-4 bg-accent/40' : 'w-4 bg-terminal-border'
            }`} />
          ))}
        </div>

        {/* Card */}
        <div className="bg-terminal-panel border border-terminal-border rounded-2xl p-8 text-center space-y-6">
          {/* Icon */}
          <div className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center" style={{ backgroundColor: current.color + '15' }}>
            <Icon size={36} style={{ color: current.color }} />
          </div>

          {/* Content */}
          <div>
            <h2 className="text-xl font-bold">{current.title}</h2>
            <p className="text-sm text-terminal-muted mt-3 leading-relaxed">{current.description}</p>
          </div>

          {/* Step counter */}
          <p className="text-xs text-terminal-muted font-mono">{step + 1} / {STEPS.length}</p>

          {/* Buttons */}
          <div className="flex gap-3">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)}
                className="flex-1 py-3 rounded-xl border border-terminal-border text-sm font-medium text-terminal-muted hover:text-terminal-text hover:border-terminal-muted transition-all"
              >Back</button>
            )}
            <button onClick={() => {
              if (isLast) handleComplete()
              else setStep(s => s + 1)
            }}
              className="flex-1 py-3 rounded-xl bg-accent hover:bg-accent/90 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              {isLast ? (
                <>Start learning <ArrowRight size={16} /></>
              ) : (
                <>Next <ChevronRight size={16} /></>
              )}
            </button>
          </div>

          {/* Don't show again + Skip */}
          <div className="space-y-2">
            <label className="flex items-center justify-center gap-2 cursor-pointer">
              <input type="checkbox" checked={dontShowAgain} onChange={e => setDontShowAgain(e.target.checked)}
                className="w-3.5 h-3.5 rounded accent-accent" />
              <span className="text-xs text-terminal-muted">Don't show this again</span>
            </label>
            {!isLast && (
              <button onClick={handleComplete} className="text-xs text-terminal-muted hover:text-accent transition-colors block mx-auto">
                Skip intro
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
