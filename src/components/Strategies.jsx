import { useState } from 'react'
import { BookOpen, TrendingUp, ArrowLeftRight, Zap, ChevronDown, ChevronUp, ArrowRight, Target, AlertTriangle, Building2, Calculator } from 'lucide-react'
import { Link } from 'react-router-dom'

const STRATEGIES = [
  {
    id: 'sma_crossover',
    name: 'Moving Average Crossover',
    icon: TrendingUp,
    color: '#3b82f6',
    tagline: 'Trend-following strategy using dual moving averages',
    summary: 'One of the most widely used strategies in quantitative finance. It identifies trend changes by comparing two moving averages of different periods — when the faster one crosses above the slower one, it signals a potential uptrend.',
    sections: [
      {
        title: 'How It Works',
        icon: Target,
        content: [
          { type: 'text', value: 'The strategy computes two Simple Moving Averages (SMA) on the closing price:' },
          { type: 'highlight', items: [
            { label: 'Short SMA', desc: '(e.g. 10 days) — reacts quickly to price changes' },
            { label: 'Long SMA', desc: '(e.g. 30 days) — smooths out noise, reflects broader trend' },
          ]},
          { type: 'signal', buy: 'Short SMA crosses ABOVE long SMA (Golden Cross)', sell: 'Short SMA crosses BELOW long SMA (Death Cross)' },
        ],
      },
      {
        title: 'The Math',
        icon: Calculator,
        content: [
          { type: 'formula', value: 'SMA(n, t) = (1/n) × Σ Price(t-i)  for i = 0 to n-1' },
          { type: 'text', value: 'The signal triggers on the crossover moment — when the relationship between the two SMAs flips.' },
        ],
      },
      {
        title: 'Strengths & Risks',
        icon: AlertTriangle,
        content: [
          { type: 'proscons',
            pros: ['Simple and mechanical — removes emotion', 'Effective in strong trending markets', 'Easy to optimise via backtesting'],
            cons: ['Lagging indicator — reacts after trend starts', 'False signals in sideways markets (whipsaws)', 'Sensitive to period selection'],
          },
        ],
      },
      {
        title: 'Real-World Usage',
        icon: Building2,
        content: [
          { type: 'text', value: 'The 50/200-day crossover is watched across Wall Street — a Golden Cross on the S&P 500 makes headlines. Many hedge funds use Exponential Moving Averages (EMA) for faster signals. The core principle remains the same: momentum confirmation through moving average relationships.' },
        ],
      },
    ],
  },
  {
    id: 'rsi',
    name: 'RSI Mean Reversion',
    icon: ArrowLeftRight,
    color: '#a855f7',
    tagline: 'Counter-trend strategy exploiting oversold and overbought conditions',
    summary: 'Based on the premise that prices revert to their mean after extreme moves. The RSI quantifies momentum on a 0–100 scale, identifying when an asset is "too cheap" or "too expensive" relative to recent history.',
    sections: [
      {
        title: 'How It Works',
        icon: Target,
        content: [
          { type: 'text', value: 'The RSI measures the magnitude of recent gains vs losses over a period (typically 14 days).' },
          { type: 'signal', buy: 'RSI drops below 30 (oversold — too much selling pressure, rebound likely)', sell: 'RSI rises above 70 (overbought — too much buying enthusiasm)' },
          { type: 'text', value: 'This is a mean reversion strategy — it bets that extreme moves will correct back toward the average.' },
        ],
      },
      {
        title: 'The Math',
        icon: Calculator,
        content: [
          { type: 'formula', value: 'RS = Average Gain / Average Loss' },
          { type: 'formula', value: 'RSI = 100 - (100 / (1 + RS))' },
          { type: 'text', value: 'After the initial calculation, Wilder\'s smoothing method is used: each new average incorporates the previous average, making RSI less volatile and more reliable.' },
        ],
      },
      {
        title: 'Strengths & Risks',
        icon: AlertTriangle,
        content: [
          { type: 'proscons',
            pros: ['Effective in range-bound markets', 'Clear quantitative thresholds (30/70)', 'Decades of academic research backing'],
            cons: ['Fails in strong trends — RSI can stay overbought for weeks', '"Catching a falling knife" risk', 'Thresholds may need adjustment per asset'],
          },
        ],
      },
      {
        title: 'Real-World Usage',
        icon: Building2,
        content: [
          { type: 'text', value: 'Developed by J. Welles Wilder Jr. in 1978, RSI remains one of the most popular indicators globally. It\'s standard on Bloomberg and Reuters terminals. Traders often combine RSI with support levels — only buying when RSI is oversold AND price is near support. Options traders use RSI divergence for timing delta hedges.' },
        ],
      },
    ],
  },
  {
    id: 'pairs',
    name: 'Pairs Trading / Statistical Arbitrage',
    icon: ArrowLeftRight,
    color: '#10b981',
    tagline: 'Market-neutral strategy exploiting price divergence between correlated assets',
    summary: 'A market-neutral strategy that identifies two correlated securities and trades the spread between them. When the spread diverges, go long the underperformer and short the outperformer, betting on convergence.',
    sections: [
      {
        title: 'How It Works',
        icon: Target,
        content: [
          { type: 'highlight', items: [
            { label: 'Step 1: Pair Selection', desc: 'Find two assets with strong correlation (e.g. Coca-Cola & Pepsi)' },
            { label: 'Step 2: Compute Spread', desc: 'Calculate the ratio between prices, track mean and standard deviation' },
            { label: 'Step 3: Trade Divergence', desc: 'When spread exceeds ±2 std deviations, trade the convergence' },
          ]},
          { type: 'signal', buy: 'Spread > +2σ → Short outperformer, Long underperformer', sell: 'Spread returns to mean → Close both positions (profit)' },
          { type: 'text', value: 'Because you\'re simultaneously long and short, the strategy is market-neutral — it profits regardless of market direction.' },
        ],
      },
      {
        title: 'The Math',
        icon: Calculator,
        content: [
          { type: 'formula', value: 'Spread(t) = Price_A(t) - β × Price_B(t)' },
          { type: 'formula', value: 'z-score = (Spread - μ) / σ' },
          { type: 'text', value: 'Where β is the hedge ratio from linear regression. Sophisticated approaches use cointegration (Engle-Granger test) rather than correlation, as it implies a long-run equilibrium.' },
        ],
      },
      {
        title: 'Strengths & Risks',
        icon: AlertTriangle,
        content: [
          { type: 'proscons',
            pros: ['Market-neutral — profits in any market', 'Statistically grounded entry/exit criteria', 'Lower drawdowns than directional strategies'],
            cons: ['Requires significant capital (two positions)', 'Correlations can break permanently', 'Short-selling costs and constraints'],
          },
        ],
      },
      {
        title: 'Real-World Usage',
        icon: Building2,
        content: [
          { type: 'text', value: 'Pioneered at Morgan Stanley in the 1980s by Nunzio Tartaglia\'s quant group. Renaissance Technologies, DE Shaw, and Two Sigma employ variants at massive scale — trading hundreds of pairs simultaneously. Modern stat arb extends to "baskets" using PCA and machine learning.' },
        ],
      },
    ],
  },
  {
    id: 'momentum',
    name: 'Momentum Strategy',
    icon: Zap,
    color: '#f97316',
    tagline: 'Trend-following based on the persistence of recent returns',
    summary: 'Assets that performed well recently tend to continue performing well. This "momentum effect" is one of the most robust anomalies in finance, documented across asset classes, time periods, and geographies.',
    sections: [
      {
        title: 'How It Works',
        icon: Target,
        content: [
          { type: 'highlight', items: [
            { label: 'Compute Returns', desc: 'Calculate total return over lookback period (e.g. past 6 months)' },
            { label: 'Rank & Select', desc: 'Rank all assets by return, select top performers' },
            { label: 'Rebalance', desc: 'Monthly re-rank, sell dropouts, buy new entries' },
          ]},
          { type: 'text', value: 'Trends persist due to behavioural biases (anchoring, herding, underreaction) and institutional flows (index rebalancing, forced buying/selling).' },
        ],
      },
      {
        title: 'The Math',
        icon: Calculator,
        content: [
          { type: 'formula', value: 'MOM(i, t) = [Price(i, t-1) / Price(i, t-L)] - 1' },
          { type: 'text', value: 'Note: t-1 (not t) skips the most recent period, avoiding the "short-term reversal" effect (Jegadeesh, 1990). Risk-adjusted momentum divides by rolling volatility to avoid overweighting volatile assets.' },
        ],
      },
      {
        title: 'Strengths & Risks',
        icon: AlertTriangle,
        content: [
          { type: 'proscons',
            pros: ['Most documented anomaly in finance (Jegadeesh & Titman, 1993)', 'Works across equities, bonds, currencies, commodities', 'Captures persistent behavioural biases'],
            cons: ['Subject to sharp momentum crashes (e.g. March 2009)', 'High turnover and transaction costs', 'Crowded trade — edge may diminish'],
          },
        ],
      },
      {
        title: 'Real-World Usage',
        icon: Building2,
        content: [
          { type: 'text', value: 'Momentum is a Fama-French "Big Five" factor. AQR Capital Management manages billions in momentum strategies across 60+ global futures markets. Institutional approaches include crash protection (reducing exposure when dispersion spikes), sector neutrality, and volatility scaling.' },
        ],
      },
    ],
  },
]

export default function Strategies() {
  const [expanded, setExpanded] = useState(null)

  return (
    <div className="space-y-6 max-w-[1000px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <BookOpen size={22} className="text-accent" /> Trading Strategies
          </h1>
          <p className="text-sm text-terminal-muted mt-1">In-depth explanations of the algorithms powering the trading bot</p>
        </div>
        <Link to="/bot" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/10 text-accent text-sm font-medium hover:bg-accent/20 transition-colors">
          Try in Bot <ArrowRight size={14} />
        </Link>
      </div>

      <div className="space-y-4">
        {STRATEGIES.map(strat => {
          const Icon = strat.icon
          const isOpen = expanded === strat.id

          return (
            <div key={strat.id} className="panel transition-all overflow-hidden" style={isOpen ? { borderColor: strat.color + '40' } : {}}>
              {/* Header */}
              <button onClick={() => setExpanded(isOpen ? null : strat.id)} className="w-full text-left p-5 flex items-start gap-4">
                <div className="p-2.5 rounded-xl shrink-0 mt-0.5" style={{ backgroundColor: strat.color + '15' }}>
                  <Icon size={20} style={{ color: strat.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold">{strat.name}</h2>
                  <p className="text-sm text-terminal-muted mt-0.5">{strat.tagline}</p>
                  {!isOpen && <p className="text-sm text-terminal-muted mt-2 line-clamp-2">{strat.summary}</p>}
                </div>
                {isOpen ? <ChevronUp size={18} className="text-terminal-muted shrink-0 mt-1" /> : <ChevronDown size={18} className="text-terminal-muted shrink-0 mt-1" />}
              </button>

              {/* Content */}
              {isOpen && (
                <div className="px-5 pb-6 space-y-6">
                  {/* Summary */}
                  <div className="pl-14">
                    <p className="text-sm leading-relaxed">{strat.summary}</p>
                  </div>

                  {/* Sections */}
                  {strat.sections.map((section, si) => {
                    const SIcon = section.icon
                    return (
                      <div key={si} className="pl-14">
                        <h3 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: strat.color }}>
                          <SIcon size={14} /> {section.title}
                        </h3>
                        <div className="space-y-3">
                          {section.content.map((block, bi) => {
                            if (block.type === 'text') {
                              return <p key={bi} className="text-sm leading-relaxed text-terminal-text/85">{block.value}</p>
                            }
                            if (block.type === 'formula') {
                              return (
                                <div key={bi} className="bg-terminal-bg rounded-xl px-4 py-3 font-mono text-sm border-l-2" style={{ borderColor: strat.color }}>
                                  {block.value}
                                </div>
                              )
                            }
                            if (block.type === 'signal') {
                              return (
                                <div key={bi} className="grid grid-cols-2 gap-3">
                                  <div className="bg-gain/5 border border-gain/20 rounded-xl p-3">
                                    <p className="text-xs font-semibold text-gain mb-1">↑ BUY Signal</p>
                                    <p className="text-xs text-terminal-text/80">{block.buy}</p>
                                  </div>
                                  <div className="bg-loss/5 border border-loss/20 rounded-xl p-3">
                                    <p className="text-xs font-semibold text-loss mb-1">↓ SELL Signal</p>
                                    <p className="text-xs text-terminal-text/80">{block.sell}</p>
                                  </div>
                                </div>
                              )
                            }
                            if (block.type === 'highlight') {
                              return (
                                <div key={bi} className="space-y-2">
                                  {block.items.map((item, ii) => (
                                    <div key={ii} className="flex items-start gap-3 bg-terminal-bg rounded-xl p-3">
                                      <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5" style={{ backgroundColor: strat.color + '20', color: strat.color }}>
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
                                <div key={bi} className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1.5">
                                    <p className="text-xs font-semibold text-gain uppercase tracking-wider">Strengths</p>
                                    {block.pros.map((p, pi) => (
                                      <div key={pi} className="flex items-start gap-2 text-xs text-terminal-text/80">
                                        <span className="text-gain mt-0.5">✓</span> {p}
                                      </div>
                                    ))}
                                  </div>
                                  <div className="space-y-1.5">
                                    <p className="text-xs font-semibold text-loss uppercase tracking-wider">Risks</p>
                                    {block.cons.map((c, ci) => (
                                      <div key={ci} className="flex items-start gap-2 text-xs text-terminal-text/80">
                                        <span className="text-loss mt-0.5">✗</span> {c}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )
                            }
                            return null
                          })}
                        </div>
                      </div>
                    )
                  })}

                  {/* CTA */}
                  <div className="pl-14 pt-2">
                    <Link to="/bot" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors hover:opacity-80"
                      style={{ backgroundColor: strat.color + '15', color: strat.color }}
                    >
                      Test this strategy <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
