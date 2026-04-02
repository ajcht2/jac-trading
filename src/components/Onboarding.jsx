import { useState } from 'react'
import { ArrowRight, Trophy, BarChart3, Bot, Wallet, Newspaper, Target, Clock, ChevronRight } from 'lucide-react'

const STEPS = [
  {
    icon: Trophy,
    color: '#f59e0b',
    title: 'Welcome to the JAC Trading Championship!',
    description: 'You start with $100,000 in virtual cash. Your goal? Build the most profitable portfolio by the end of the competition.',
  },
  {
    icon: BarChart3,
    color: '#3b82f6',
    title: 'Track the Markets',
    description: 'Use the Dashboard to search any stock or crypto, view live charts with candlestick data, and monitor prices updated every 5 seconds.',
  },
  {
    icon: Wallet,
    color: '#22c55e',
    title: 'Trade Like a Pro',
    description: 'Go to Paper Trade to buy and sell stocks with your virtual cash. You can also quick-trade directly from any chart. Every trade is tracked in your history.',
  },
  {
    icon: Bot,
    color: '#a855f7',
    title: 'Deploy a Trading Bot',
    description: 'Let an algorithm trade for you! Choose from 4 strategies (SMA Crossover, RSI, MACD, Momentum), pick a stock, and let the bot monitor the market every 30 seconds.',
  },
  {
    icon: Newspaper,
    color: '#ef4444',
    title: 'Stay Informed',
    description: 'Check the News page for the latest financial headlines from around the world. Knowledge is your edge — the best traders are the most informed.',
  },
  {
    icon: Target,
    color: '#f97316',
    title: 'Rules of the Game',
    description: 'Everyone starts with $100,000. Trade stocks, ETFs, and crypto. Use manual trading, bots, or both. The player with the highest total equity at the end wins!',
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
                <>Start Trading <ArrowRight size={16} /></>
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
