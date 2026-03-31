import { useState } from 'react'
import { BookOpen, TrendingUp, TrendingDown, ArrowLeftRight, Zap, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const STRATEGIES = [
  {
    id: 'sma_crossover',
    name: 'Moving Average Crossover',
    icon: TrendingUp,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    borderColor: 'border-blue-400/20',
    tagline: 'Trend-following strategy using dual moving averages',
    summary: 'One of the most widely used strategies in quantitative finance. It identifies trend changes by comparing two moving averages of different periods — when the faster one crosses above the slower one, it signals a potential uptrend.',
    sections: [
      {
        title: 'How It Works',
        content: `The strategy computes two Simple Moving Averages (SMA) on the closing price of an asset:

• A **short-period SMA** (e.g. 10 days) which reacts quickly to price changes
• A **long-period SMA** (e.g. 30 days) which smooths out noise and reflects the broader trend

When the short SMA crosses **above** the long SMA, this is called a **Golden Cross** — it indicates that recent momentum is turning positive relative to the longer-term trend. The algorithm generates a **BUY** signal.

When the short SMA crosses **below** the long SMA, this is called a **Death Cross** — it signals that short-term momentum is weakening. The algorithm generates a **SELL** signal.`
      },
      {
        title: 'Mathematical Foundation',
        content: `The Simple Moving Average for period *n* at time *t* is defined as:

**SMA(n, t) = (1/n) × Σ P(t-i)** for i = 0 to n-1

Where P(t) is the closing price at time t.

The signal function is:
• If SMA(short, t) > SMA(long, t) AND SMA(short, t-1) ≤ SMA(long, t-1) → **BUY**
• If SMA(short, t) < SMA(long, t) AND SMA(short, t-1) ≥ SMA(long, t-1) → **SELL**`
      },
      {
        title: 'Strengths & Weaknesses',
        content: `**Strengths:**
• Simple to implement and understand
• Effective in strong trending markets (captures the "meat" of a trend)
• Reduces emotional decision-making with clear, mechanical signals
• Parameters are easy to optimise through backtesting

**Weaknesses:**
• Lagging indicator — by definition, it reacts after the trend has already started
• Generates false signals (whipsaws) in sideways/choppy markets
• Does not account for volume, volatility, or market regime
• Performance is highly sensitive to period selection`
      },
      {
        title: 'Real-World Usage',
        content: `The SMA crossover is used extensively in institutional trading, often as a component of larger, multi-factor models. The 50/200-day crossover is particularly watched on Wall Street — a Golden Cross on the S&P 500 frequently makes financial headlines.

Many hedge funds use Exponential Moving Averages (EMA) instead of SMA for faster signal generation. The core principle remains the same — momentum confirmation through moving average relationships.`
      },
    ],
  },
  {
    id: 'rsi',
    name: 'RSI Mean Reversion',
    icon: ArrowLeftRight,
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
    borderColor: 'border-purple-400/20',
    tagline: 'Counter-trend strategy exploiting oversold and overbought conditions',
    summary: 'Based on the premise that prices tend to revert to their mean after extreme moves. The Relative Strength Index (RSI) quantifies momentum on a 0–100 scale, identifying when an asset is "too cheap" or "too expensive" relative to recent history.',
    sections: [
      {
        title: 'How It Works',
        content: `The RSI measures the magnitude of recent price gains versus losses over a specified period (typically 14 days).

When RSI drops **below 30**, the asset is considered **oversold** — the selling pressure has been excessive, and a rebound is statistically likely. The algorithm generates a **BUY** signal.

When RSI rises **above 70**, the asset is considered **overbought** — buying enthusiasm has pushed prices too far, too fast. The algorithm generates a **SELL** signal.

This is a **mean reversion** strategy — it bets that extreme moves will correct back toward the average, rather than continuing indefinitely.`
      },
      {
        title: 'Mathematical Foundation',
        content: `RSI is calculated in two steps:

**Step 1:** Compute the average gain and average loss over *n* periods:
• Average Gain = Sum of gains / n
• Average Loss = Sum of losses / n

**Step 2:** Calculate the Relative Strength and RSI:
• RS = Average Gain / Average Loss
• **RSI = 100 - (100 / (1 + RS))**

After the initial calculation, a smoothed (Wilder's) method is used:
• Avg Gain = [(Previous Avg Gain × (n-1)) + Current Gain] / n
• Avg Loss = [(Previous Avg Loss × (n-1)) + Current Loss] / n

This smoothing makes RSI less volatile and more reliable than a simple ratio.`
      },
      {
        title: 'Strengths & Weaknesses',
        content: `**Strengths:**
• Effective in range-bound markets where prices oscillate
• Clear, quantitative thresholds (30/70) for entry and exit
• Well-established indicator with decades of academic research
• Can be combined with other indicators for confirmation

**Weaknesses:**
• Fails in strong trending markets — RSI can stay overbought/oversold for extended periods during powerful trends
• The 30/70 thresholds are arbitrary and may need adjustment per asset
• Pure mean reversion ignores fundamental catalysts (earnings, news)
• "Catching a falling knife" risk — buying oversold assets that continue falling`
      },
      {
        title: 'Real-World Usage',
        content: `RSI was developed by J. Welles Wilder Jr. in 1978 and remains one of the most popular technical indicators globally. It's a standard component of Bloomberg Terminal and Reuters Eikon displays.

In practice, traders often use RSI in conjunction with other signals — for example, only buying when RSI is oversold AND price is near a support level. Some quant funds use RSI divergence (price making new lows while RSI makes higher lows) as a more sophisticated entry signal.

Market makers and options traders frequently use RSI to time delta hedging adjustments.`
      },
    ],
  },
  {
    id: 'pairs',
    name: 'Pairs Trading / Statistical Arbitrage',
    icon: ArrowLeftRight,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-400/10',
    borderColor: 'border-emerald-400/20',
    tagline: 'Market-neutral strategy exploiting price divergence between correlated assets',
    summary: 'A market-neutral strategy that identifies two historically correlated securities and trades the spread between them. When the spread diverges from its historical mean, the strategy goes long on the underperformer and short on the outperformer, betting on convergence.',
    sections: [
      {
        title: 'How It Works',
        content: `Pairs trading operates on a simple but powerful principle: two assets that historically move together should continue to do so. When they temporarily diverge, it creates an opportunity.

**Step 1: Pair Selection**
Identify two assets with a strong historical correlation (e.g. Coca-Cola & Pepsi, Goldman Sachs & Morgan Stanley, or two ETFs tracking similar sectors).

**Step 2: Compute the Spread**
Calculate the ratio or difference between the two prices over time. Compute the mean and standard deviation of this spread.

**Step 3: Signal Generation**
• When the spread exceeds +2 standard deviations from its mean → **SHORT the outperformer, LONG the underperformer**
• When the spread drops below -2 standard deviations → **LONG the outperformer, SHORT the underperformer**
• When the spread returns to the mean → **CLOSE both positions** (profit captured)

Because you're simultaneously long and short, the strategy is **market-neutral** — it profits regardless of whether the overall market goes up or down.`
      },
      {
        title: 'Mathematical Foundation',
        content: `The spread between assets A and B can be defined as:

**Spread(t) = Price_A(t) - β × Price_B(t)**

Where β (beta) is the hedge ratio, estimated via linear regression:
**β = Cov(A, B) / Var(B)**

The z-score of the spread standardises it:
**z(t) = (Spread(t) - μ_spread) / σ_spread**

Trading signals:
• z(t) > +2.0 → Short A, Long B
• z(t) < -2.0 → Long A, Short B
• |z(t)| < 0.5 → Close positions

More sophisticated approaches use **cointegration** (Engle-Granger test) rather than simple correlation, as cointegration is a stronger statistical relationship that implies a long-run equilibrium.`
      },
      {
        title: 'Strengths & Weaknesses',
        content: `**Strengths:**
• Market-neutral — generates returns independent of market direction
• Statistically grounded with well-defined entry/exit criteria
• Lower drawdowns than directional strategies
• Particularly effective during periods of high volatility

**Weaknesses:**
• Requires significant capital (two simultaneous positions)
• Correlations can break down permanently (structural changes, M&A, regulatory shifts)
• Short-selling constraints and borrowing costs
• Spread may widen further before reverting — requires careful position sizing
• High transaction costs from frequent rebalancing`
      },
      {
        title: 'Real-World Usage',
        content: `Pairs trading was pioneered at Morgan Stanley in the 1980s by Nunzio Tartaglia's quantitative group, and has since become a cornerstone of statistical arbitrage desks at major hedge funds.

Renaissance Technologies, DE Shaw, and Two Sigma are known to employ variants of this strategy at massive scale — often trading hundreds of pairs simultaneously across global equity markets.

In practice, modern stat arb extends beyond simple pairs to "baskets" of correlated assets, using principal component analysis (PCA) and machine learning to identify and trade complex mean-reverting relationships across entire sectors.`
      },
    ],
  },
  {
    id: 'momentum',
    name: 'Momentum Strategy',
    icon: Zap,
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/10',
    borderColor: 'border-orange-400/20',
    tagline: 'Trend-following strategy based on the persistence of recent returns',
    summary: 'Momentum strategies exploit one of the most robust anomalies in financial markets: assets that have performed well recently tend to continue performing well, and vice versa. This "momentum effect" has been documented across asset classes, time periods, and geographies.',
    sections: [
      {
        title: 'How It Works',
        content: `The strategy ranks assets by their recent performance (typically over 3-12 months) and takes long positions in the top performers while avoiding (or shorting) the worst performers.

**Step 1: Compute Returns**
Calculate the total return of each asset over a lookback period (e.g. past 6 months), often excluding the most recent month to avoid short-term reversal effects.

**Step 2: Rank & Select**
Rank all assets by their lookback return. Select the top decile (or quintile) for the long portfolio.

**Step 3: Rebalance**
Periodically (e.g. monthly) re-rank and rebalance. Sell assets that have dropped out of the top tier, buy new entries.

The key insight is that **trends persist** due to behavioural biases (anchoring, herding, underreaction to information) and institutional flows (index rebalancing, forced buying/selling).`
      },
      {
        title: 'Mathematical Foundation',
        content: `The momentum signal for asset *i* at time *t* with lookback period *L* is:

**MOM(i, t) = [P(i, t-1) / P(i, t-L)] - 1**

Note: t-1 (not t) is used to skip the most recent period, avoiding the "short-term reversal" effect documented by Jegadeesh (1990).

Portfolio construction:
• **Long portfolio**: Assets where MOM(i, t) is in the top percentile
• Weighting can be equal-weight or signal-weighted: **w(i) = MOM(i, t) / Σ MOM(j, t)**

Risk-adjusted momentum (used by sophisticated funds):
**Risk-Adj MOM(i, t) = MOM(i, t) / σ(i, t)**

Where σ is the rolling volatility, ensuring the strategy doesn't overweight highly volatile assets.`
      },
      {
        title: 'Strengths & Weaknesses',
        content: `**Strengths:**
• One of the most well-documented anomalies in finance (Jegadeesh & Titman, 1993)
• Works across asset classes: equities, bonds, currencies, commodities
• Can be combined with value strategies for enhanced risk-adjusted returns
• Captures persistent behavioural biases that are unlikely to be fully arbitraged away

**Weaknesses:**
• Subject to sharp **momentum crashes** — sudden reversals that can wipe out months of gains (e.g. March 2009, during market regime changes)
• High turnover and transaction costs from frequent rebalancing
• Crowded trade — as more participants adopt momentum strategies, the edge may diminish
• Poor performance in trendless, choppy markets
• Tax-inefficient due to short holding periods`
      },
      {
        title: 'Real-World Usage',
        content: `Momentum is a foundational factor in modern quantitative finance. It's one of the "Big Five" risk factors in the Fama-French model (alongside market, size, value, and profitability).

AQR Capital Management, founded by Cliff Asness, has published extensively on momentum and manages billions in momentum-based strategies. Their flagship "time-series momentum" approach applies the concept across 60+ global futures markets.

In practice, most institutional momentum strategies include:
• **Crash protection**: reducing exposure when cross-sectional dispersion spikes
• **Sector neutrality**: ensuring the portfolio isn't just a bet on one sector
• **Volatility scaling**: dynamically adjusting position sizes based on realised volatility

The strategy's persistence is often attributed to the "limits of arbitrage" — even when traders recognise the anomaly, capital constraints, career risk, and behavioural biases prevent them from fully eliminating it.`
      },
    ],
  },
]

export default function Strategies() {
  const [expanded, setExpanded] = useState(STRATEGIES[0].id)

  return (
    <div className="space-y-6 max-w-[1000px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <BookOpen size={22} className="text-accent" />
            Trading Strategies
          </h1>
          <p className="text-sm text-terminal-muted mt-1">
            In-depth explanations of the algorithms powering the trading bot
          </p>
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
            <div key={strat.id} className={`panel transition-all ${isOpen ? `border ${strat.borderColor}` : ''}`}>
              {/* Header */}
              <button
                onClick={() => setExpanded(isOpen ? null : strat.id)}
                className="w-full text-left p-5 flex items-start gap-4"
              >
                <div className={`p-2.5 rounded-xl ${strat.bgColor} shrink-0 mt-0.5`}>
                  <Icon size={20} className={strat.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold">{strat.name}</h2>
                  <p className="text-sm text-terminal-muted mt-0.5">{strat.tagline}</p>
                  {!isOpen && (
                    <p className="text-sm text-terminal-muted mt-2 line-clamp-2">{strat.summary}</p>
                  )}
                </div>
                <div className="shrink-0 mt-1">
                  {isOpen ? <ChevronUp size={18} className="text-terminal-muted" /> : <ChevronDown size={18} className="text-terminal-muted" />}
                </div>
              </button>

              {/* Content */}
              {isOpen && (
                <div className="px-5 pb-6 space-y-6">
                  {/* Summary */}
                  <div className="pl-14">
                    <p className="text-sm leading-relaxed text-terminal-text">{strat.summary}</p>
                  </div>

                  {/* Sections */}
                  {strat.sections.map((section, i) => (
                    <div key={i} className="pl-14">
                      <h3 className={`text-sm font-bold uppercase tracking-wider ${strat.color} mb-3`}>
                        {section.title}
                      </h3>
                      <div className="text-sm leading-relaxed text-terminal-text/90 whitespace-pre-line">
                        {section.content.split('\n').map((line, j) => {
                          // Bold text
                          const parts = line.split(/(\*\*[^*]+\*\*)/g)
                          return (
                            <p key={j} className={line.trim() === '' ? 'h-3' : 'mb-1'}>
                              {parts.map((part, k) => {
                                if (part.startsWith('**') && part.endsWith('**')) {
                                  return <strong key={k} className="text-terminal-text font-semibold">{part.slice(2, -2)}</strong>
                                }
                                // Italic text
                                const italicParts = part.split(/(\*[^*]+\*)/g)
                                return italicParts.map((ip, l) => {
                                  if (ip.startsWith('*') && ip.endsWith('*') && !ip.startsWith('**')) {
                                    return <em key={l} className="text-terminal-muted">{ip.slice(1, -1)}</em>
                                  }
                                  return <span key={l}>{ip}</span>
                                })
                              })}
                            </p>
                          )
                        })}
                      </div>
                    </div>
                  ))}

                  {/* CTA */}
                  <div className="pl-14 pt-2">
                    <Link to="/bot"
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${strat.bgColor} ${strat.color} hover:opacity-80`}
                    >
                      Test this strategy in the Bot <ArrowRight size={14} />
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
