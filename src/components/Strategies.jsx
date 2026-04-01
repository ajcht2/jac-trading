import { useState } from 'react'
import { BookOpen, TrendingUp, ArrowLeftRight, Zap, ChevronDown, ChevronUp, ArrowRight, Target, AlertTriangle, Building2, Calculator, Bot, Briefcase, DollarSign, PieChart, Shield, Clock, BarChart2 } from 'lucide-react'
import { Link } from 'react-router-dom'

// ── BOT STRATEGIES ──────────────────────────────
const BOT_STRATEGIES = [
  {
    id: 'sma_crossover', name: 'Moving Average Crossover', icon: TrendingUp, color: '#3b82f6',
    tagline: 'Trend-following strategy using dual moving averages',
    summary: 'One of the most widely used strategies in quantitative finance. It identifies trend changes by comparing two moving averages of different periods — when the faster one crosses above the slower one, it signals a potential uptrend.',
    sections: [
      { title: 'How It Works', icon: Target, content: [
        { type: 'text', value: 'The strategy computes two Simple Moving Averages (SMA) on the closing price:' },
        { type: 'highlight', items: [
          { label: 'Short SMA', desc: '(e.g. 10 days) — reacts quickly to price changes' },
          { label: 'Long SMA', desc: '(e.g. 30 days) — smooths out noise, reflects broader trend' },
        ]},
        { type: 'signal', buy: 'Short SMA crosses ABOVE long SMA (Golden Cross)', sell: 'Short SMA crosses BELOW long SMA (Death Cross)' },
      ]},
      { title: 'The Math', icon: Calculator, content: [
        { type: 'formula', value: 'SMA(n, t) = (1/n) × Σ Price(t-i)  for i = 0 to n-1' },
        { type: 'text', value: 'The signal triggers on the crossover moment — when the relationship between the two SMAs flips.' },
      ]},
      { title: 'Strengths & Risks', icon: AlertTriangle, content: [
        { type: 'proscons', pros: ['Simple and mechanical — removes emotion', 'Effective in strong trending markets', 'Easy to optimise via backtesting'], cons: ['Lagging indicator — reacts after trend starts', 'False signals in sideways markets (whipsaws)', 'Sensitive to period selection'] },
      ]},
      { title: 'Real-World Usage', icon: Building2, content: [
        { type: 'text', value: 'The 50/200-day crossover is watched across Wall Street — a Golden Cross on the S&P 500 makes headlines. Many hedge funds use Exponential Moving Averages (EMA) for faster signals.' },
      ]},
    ],
  },
  {
    id: 'rsi', name: 'RSI Mean Reversion', icon: ArrowLeftRight, color: '#a855f7',
    tagline: 'Counter-trend strategy exploiting oversold and overbought conditions',
    summary: 'Based on the premise that prices revert to their mean after extreme moves. The RSI quantifies momentum on a 0–100 scale, identifying when an asset is "too cheap" or "too expensive" relative to recent history.',
    sections: [
      { title: 'How It Works', icon: Target, content: [
        { type: 'text', value: 'The RSI measures the magnitude of recent gains vs losses over a period (typically 14 days).' },
        { type: 'signal', buy: 'RSI drops below 30 (oversold — too much selling pressure)', sell: 'RSI rises above 70 (overbought — too much buying enthusiasm)' },
      ]},
      { title: 'The Math', icon: Calculator, content: [
        { type: 'formula', value: 'RS = Average Gain / Average Loss' },
        { type: 'formula', value: 'RSI = 100 - (100 / (1 + RS))' },
      ]},
      { title: 'Strengths & Risks', icon: AlertTriangle, content: [
        { type: 'proscons', pros: ['Effective in range-bound markets', 'Clear quantitative thresholds (30/70)', 'Decades of academic research'], cons: ['Fails in strong trends — RSI can stay overbought for weeks', '"Catching a falling knife" risk', 'Thresholds need adjustment per asset'] },
      ]},
      { title: 'Real-World Usage', icon: Building2, content: [
        { type: 'text', value: 'Developed by J. Welles Wilder Jr. in 1978. Standard on Bloomberg and Reuters terminals. Traders combine RSI with support levels and use RSI divergence for timing.' },
      ]},
    ],
  },
  {
    id: 'pairs', name: 'Pairs Trading / Stat Arb', icon: ArrowLeftRight, color: '#10b981',
    tagline: 'Market-neutral strategy exploiting price divergence between correlated assets',
    summary: 'Identifies two correlated securities and trades the spread. When it diverges, go long the underperformer and short the outperformer, betting on convergence. Profits regardless of market direction.',
    sections: [
      { title: 'How It Works', icon: Target, content: [
        { type: 'highlight', items: [
          { label: 'Pair Selection', desc: 'Find two assets with strong correlation (e.g. Coca-Cola & Pepsi)' },
          { label: 'Compute Spread', desc: 'Track the ratio between prices, calculate mean and std deviation' },
          { label: 'Trade Divergence', desc: 'When spread exceeds ±2σ, trade the convergence' },
        ]},
        { type: 'signal', buy: 'Spread > +2σ → Short outperformer, Long underperformer', sell: 'Spread returns to mean → Close both (profit)' },
      ]},
      { title: 'The Math', icon: Calculator, content: [
        { type: 'formula', value: 'Spread(t) = Price_A(t) - β × Price_B(t)' },
        { type: 'formula', value: 'z-score = (Spread - μ) / σ' },
      ]},
      { title: 'Strengths & Risks', icon: AlertTriangle, content: [
        { type: 'proscons', pros: ['Market-neutral — profits in any direction', 'Statistically grounded', 'Lower drawdowns'], cons: ['Requires significant capital', 'Correlations can break permanently', 'Short-selling costs'] },
      ]},
      { title: 'Real-World Usage', icon: Building2, content: [
        { type: 'text', value: 'Pioneered at Morgan Stanley in the 1980s. Renaissance Technologies, DE Shaw, and Two Sigma trade hundreds of pairs simultaneously using PCA and machine learning.' },
      ]},
    ],
  },
  {
    id: 'momentum', name: 'Momentum Strategy', icon: Zap, color: '#f97316',
    tagline: 'Trend-following based on the persistence of recent returns',
    summary: 'Assets that performed well recently tend to continue performing well. One of the most robust anomalies in finance, documented across all asset classes and geographies.',
    sections: [
      { title: 'How It Works', icon: Target, content: [
        { type: 'highlight', items: [
          { label: 'Compute Returns', desc: 'Calculate total return over lookback period (e.g. 6 months)' },
          { label: 'Rank & Select', desc: 'Rank assets by return, select top performers' },
          { label: 'Rebalance', desc: 'Monthly re-rank, sell dropouts, buy new entries' },
        ]},
      ]},
      { title: 'The Math', icon: Calculator, content: [
        { type: 'formula', value: 'MOM(i, t) = [Price(i, t-1) / Price(i, t-L)] - 1' },
      ]},
      { title: 'Strengths & Risks', icon: AlertTriangle, content: [
        { type: 'proscons', pros: ['Most documented anomaly (Jegadeesh & Titman, 1993)', 'Works across equities, bonds, currencies', 'Captures behavioural biases'], cons: ['Sharp momentum crashes (e.g. March 2009)', 'High turnover costs', 'Crowded trade risk'] },
      ]},
      { title: 'Real-World Usage', icon: Building2, content: [
        { type: 'text', value: 'A Fama-French "Big Five" factor. AQR Capital manages billions in momentum across 60+ global futures markets with crash protection and volatility scaling.' },
      ]},
    ],
  },
]

// ── INVESTING STRATEGIES ──────────────────────────────
const INVESTING_STRATEGIES = [
  {
    id: 'value', name: 'Value Investing', icon: DollarSign, color: '#059669',
    tagline: 'Buy undervalued stocks trading below their intrinsic worth — the Warren Buffett approach',
    summary: 'The philosophy pioneered by Benjamin Graham and perfected by Warren Buffett. Value investors seek companies whose stock price is significantly below their "true" or intrinsic value, providing a margin of safety.',
    sections: [
      { title: 'How It Works', icon: Target, content: [
        { type: 'text', value: 'Value investors look for stocks that the market has mispriced — companies with solid fundamentals trading at a discount due to temporary bad news, market overreaction, or simply being overlooked.' },
        { type: 'highlight', items: [
          { label: 'Low P/E Ratio', desc: 'Price-to-Earnings below industry average suggests undervaluation' },
          { label: 'Low P/B Ratio', desc: 'Price-to-Book below 1.0 means stock trades below asset value' },
          { label: 'High Dividend Yield', desc: 'Strong dividends from a cheap stock signal hidden value' },
          { label: 'Margin of Safety', desc: 'Buy at a discount to intrinsic value to protect against errors' },
        ]},
      ]},
      { title: 'Key Metrics', icon: Calculator, content: [
        { type: 'formula', value: 'Intrinsic Value = Σ [FCF(t) / (1+r)^t]  (Discounted Cash Flow)' },
        { type: 'formula', value: 'Margin of Safety = (Intrinsic Value - Market Price) / Intrinsic Value' },
        { type: 'text', value: 'Graham recommended buying only when the margin of safety exceeds 30% — meaning the stock is at least 30% cheaper than its calculated intrinsic value.' },
      ]},
      { title: 'Strengths & Risks', icon: AlertTriangle, content: [
        { type: 'proscons', pros: ['Proven long-term track record (Buffett, Munger, Graham)', 'Built-in downside protection via margin of safety', 'Forces fundamental analysis and discipline'], cons: ['"Value traps" — stocks that are cheap for a good reason', 'Can underperform for years during growth-driven markets', 'Requires patience and conviction to hold contrarian positions'] },
      ]},
      { title: 'Famous Practitioners', icon: Building2, content: [
        { type: 'text', value: 'Warren Buffett (Berkshire Hathaway), Charlie Munger, Seth Klarman (Baupost Group), Joel Greenblatt (Gotham Capital), Howard Marks (Oaktree Capital). Buffett\'s Berkshire Hathaway has returned ~20% annually since 1965, far outpacing the S&P 500.' },
      ]},
    ],
  },
  {
    id: 'growth', name: 'Growth Investing', icon: TrendingUp, color: '#7c3aed',
    tagline: 'Invest in companies with above-average revenue and earnings growth potential',
    summary: 'Growth investors prioritise companies expanding rapidly — even if their current valuation looks expensive. The bet is that future earnings growth will justify today\'s high price. Think early investors in Amazon, Tesla, or Nvidia.',
    sections: [
      { title: 'How It Works', icon: Target, content: [
        { type: 'highlight', items: [
          { label: 'Revenue Growth', desc: '20%+ year-over-year revenue growth signals a scaling business' },
          { label: 'Market Opportunity', desc: 'Large Total Addressable Market (TAM) allows sustained growth' },
          { label: 'Competitive Moat', desc: 'Network effects, brand, or technology that protects market share' },
          { label: 'Reinvestment', desc: 'Profits reinvested into R&D and expansion, not dividends' },
        ]},
      ]},
      { title: 'Key Metrics', icon: Calculator, content: [
        { type: 'formula', value: 'PEG Ratio = (P/E Ratio) / Annual EPS Growth Rate' },
        { type: 'text', value: 'A PEG below 1.0 suggests the stock is undervalued relative to its growth. Peter Lynch popularised this as a way to find "growth at a reasonable price" (GARP).' },
      ]},
      { title: 'Strengths & Risks', icon: AlertTriangle, content: [
        { type: 'proscons', pros: ['Massive upside potential — early growth stocks can 10-100x', 'Aligned with innovation and economic progress', 'Compound growth creates exponential returns'], cons: ['High valuations mean devastating losses if growth slows', 'Very sensitive to interest rate changes', 'Difficult to distinguish genuine growth from hype'] },
      ]},
      { title: 'Famous Practitioners', icon: Building2, content: [
        { type: 'text', value: 'Cathie Wood (ARK Invest), Philip Fisher (author of "Common Stocks and Uncommon Profits"), Peter Lynch (Fidelity Magellan Fund — 29% annual return 1977-1990), T. Rowe Price (the "father of growth investing").' },
      ]},
    ],
  },
  {
    id: 'dca', name: 'Dollar Cost Averaging (DCA)', icon: Clock, color: '#0891b2',
    tagline: 'Invest a fixed amount at regular intervals regardless of price — time in the market beats timing the market',
    summary: 'Instead of trying to buy at the perfect moment, DCA spreads purchases over time. You invest the same dollar amount every week or month, automatically buying more shares when prices are low and fewer when prices are high.',
    sections: [
      { title: 'How It Works', icon: Target, content: [
        { type: 'highlight', items: [
          { label: 'Fixed Amount', desc: 'Invest £500 every month, no matter what the market does' },
          { label: 'Automatic', desc: 'Set it and forget it — removes emotional decision-making' },
          { label: 'Cost Averaging', desc: 'Your average purchase price smooths out over time' },
        ]},
        { type: 'text', value: 'Example: investing £500/month in an ETF at £50, £40, £60 buys you 10, 12.5, and 8.3 shares. Your average cost is £46.15 — lower than the average price of £50.' },
      ]},
      { title: 'Key Metrics', icon: Calculator, content: [
        { type: 'formula', value: 'Average Cost = Total Invested / Total Shares Bought' },
        { type: 'text', value: 'Historically, DCA into the S&P 500 over any 20-year period has never produced a negative return. The power of consistency and compound growth.' },
      ]},
      { title: 'Strengths & Risks', icon: AlertTriangle, content: [
        { type: 'proscons', pros: ['Eliminates timing risk completely', 'Builds discipline and habit', 'Perfect for beginners and long-term wealth building', 'Proven to outperform most active traders'], cons: ['Underperforms lump-sum investing in bull markets (~67% of the time)', 'Requires patience — results take years to compound', 'Doesn\'t protect against prolonged bear markets'] },
      ]},
      { title: 'Who Uses This', icon: Building2, content: [
        { type: 'text', value: 'Every major pension fund and 401(k) uses DCA by design. Vanguard, the world\'s second-largest asset manager, actively recommends DCA for individual investors. Jack Bogle (Vanguard founder) called it "the investor\'s best friend."' },
      ]},
    ],
  },
  {
    id: 'index', name: 'Index / Passive Investing', icon: PieChart, color: '#2563eb',
    tagline: 'Match the market return by holding a diversified index fund — the strategy that beats 90% of pros',
    summary: 'Instead of picking individual stocks, buy the entire market through an index fund (S&P 500, FTSE 100, MSCI World). Academic research consistently shows that most active fund managers fail to beat their benchmark index after fees.',
    sections: [
      { title: 'How It Works', icon: Target, content: [
        { type: 'highlight', items: [
          { label: 'Buy the Index', desc: 'One ETF like SPY or VWRL gives you instant diversification across hundreds of stocks' },
          { label: 'Low Fees', desc: 'Index funds charge 0.03-0.20% vs 1-2% for active funds' },
          { label: 'Hold Forever', desc: 'Never sell — compound returns do the work over decades' },
        ]},
      ]},
      { title: 'The Evidence', icon: Calculator, content: [
        { type: 'text', value: 'The SPIVA scorecard shows that over 15 years, 92% of US large-cap fund managers underperformed the S&P 500. After fees, the average active fund returns ~1.5% less per year — which compounds to massive underperformance over a career.' },
        { type: 'formula', value: 'S&P 500 average annual return (1928-2024) ≈ 10.2%' },
      ]},
      { title: 'Strengths & Risks', icon: AlertTriangle, content: [
        { type: 'proscons', pros: ['Beats 90%+ of professional fund managers long-term', 'Lowest possible fees and tax efficiency', 'Zero stock-picking skill required', 'Warren Buffett\'s recommendation for most people'], cons: ['Guaranteed to never beat the market (by design)', 'Full exposure to market crashes (no hedging)', 'Can feel "boring" — no excitement of stock picking'] },
      ]},
      { title: 'Famous Advocates', icon: Building2, content: [
        { type: 'text', value: 'Jack Bogle (Vanguard), Burton Malkiel ("A Random Walk Down Wall Street"), Eugene Fama (Nobel laureate, Efficient Market Hypothesis), Warren Buffett (famously bet $1M that an index fund would beat hedge funds over 10 years — and won).' },
      ]},
    ],
  },
  {
    id: 'dividend', name: 'Dividend Investing', icon: DollarSign, color: '#ca8a04',
    tagline: 'Build a portfolio of stocks that pay regular, growing dividends for passive income',
    summary: 'Focus on companies with a long history of paying and increasing dividends. The goal is building a stream of passive income that grows over time, while benefiting from stock price appreciation. Popular among retirees and income-focused investors.',
    sections: [
      { title: 'How It Works', icon: Target, content: [
        { type: 'highlight', items: [
          { label: 'Dividend Aristocrats', desc: 'Companies that have increased dividends for 25+ consecutive years (e.g. Coca-Cola, Johnson & Johnson)' },
          { label: 'DRIP', desc: 'Dividend Reinvestment Plan — automatically reinvest dividends to buy more shares' },
          { label: 'Yield + Growth', desc: 'Aim for 3-5% yield with 5-10% annual dividend growth' },
        ]},
      ]},
      { title: 'Key Metrics', icon: Calculator, content: [
        { type: 'formula', value: 'Dividend Yield = Annual Dividend / Stock Price' },
        { type: 'formula', value: 'Payout Ratio = Dividends Paid / Net Income (below 60% is healthy)' },
      ]},
      { title: 'Strengths & Risks', icon: AlertTriangle, content: [
        { type: 'proscons', pros: ['Predictable income stream', 'Dividends cushion portfolio during downturns', 'Compounding via DRIP creates snowball effect', 'Lower volatility than growth stocks'], cons: ['Lower total return vs growth in bull markets', 'Dividend cuts can crash stock price', 'High yields can be a trap (unsustainable payout)'] },
      ]},
      { title: 'Who Uses This', icon: Building2, content: [
        { type: 'text', value: 'Popular with retirees and FIRE (Financial Independence, Retire Early) followers. Companies like Coca-Cola have paid dividends since 1893. The "Dogs of the Dow" strategy selects the 10 highest-yielding Dow stocks annually and has historically beaten the index.' },
      ]},
    ],
  },
  {
    id: 'risk_parity', name: 'Risk Parity', icon: Shield, color: '#dc2626',
    tagline: 'Allocate based on risk contribution, not dollar amounts — the Bridgewater approach',
    summary: 'Traditional portfolios (60/40 stocks/bonds) are dominated by equity risk. Risk parity equalises the risk contribution of each asset class by leveraging low-risk assets (bonds) and reducing high-risk ones (stocks), creating a more balanced portfolio.',
    sections: [
      { title: 'How It Works', icon: Target, content: [
        { type: 'text', value: 'Instead of putting 60% in stocks and 40% in bonds (which means 90% of your risk comes from stocks), risk parity allocates so each asset class contributes equally to portfolio volatility.' },
        { type: 'highlight', items: [
          { label: 'Equal Risk', desc: 'Each asset class (stocks, bonds, commodities, gold) contributes ~25% of portfolio risk' },
          { label: 'Leverage', desc: 'Low-volatility assets are leveraged up to match the risk contribution of equities' },
          { label: 'Diversification', desc: 'True diversification across economic regimes (growth, recession, inflation, deflation)' },
        ]},
      ]},
      { title: 'Key Metrics', icon: Calculator, content: [
        { type: 'formula', value: 'Risk Contribution(i) = w(i) × σ(i) × ρ(i, portfolio) / σ(portfolio)' },
        { type: 'text', value: 'The target: each asset\'s marginal contribution to total portfolio variance should be equal.' },
      ]},
      { title: 'Strengths & Risks', icon: AlertTriangle, content: [
        { type: 'proscons', pros: ['Superior risk-adjusted returns (higher Sharpe ratio)', 'Performs in all economic environments', 'Mathematically elegant diversification'], cons: ['Requires leverage — amplifies losses if correlations spike', 'Underperforms in strong equity bull markets', 'Complex to implement correctly for retail investors'] },
      ]},
      { title: 'Famous Practitioners', icon: Building2, content: [
        { type: 'text', value: 'Ray Dalio\'s Bridgewater Associates runs the "All Weather" fund based on risk parity — the world\'s largest hedge fund with ~$120B AUM. AQR Capital also manages significant risk parity strategies. Dalio\'s "Holy Grail of Investing" is finding 15+ uncorrelated return streams.' },
      ]},
    ],
  },
]

// ── Render ──────────────────────────────
export default function Strategies() {
  const [expanded, setExpanded] = useState(null)

  return (
    <div className="space-y-8 max-w-[1000px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <BookOpen size={22} className="text-accent" /> Trading Strategies
          </h1>
          <p className="text-sm text-terminal-muted mt-1">Bot algorithms and real-world investing approaches</p>
        </div>
        <Link to="/bot" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/10 text-accent text-sm font-medium hover:bg-accent/20 transition-colors">
          Try in Bot <ArrowRight size={14} />
        </Link>
      </div>

      {/* Bot Strategies */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Bot size={18} className="text-accent" />
          <h2 className="text-base font-bold uppercase tracking-wider text-accent">Bot Strategies</h2>
          <span className="text-xs text-terminal-muted">— Available in the Trading Bot</span>
        </div>
        <div className="space-y-3">
          {BOT_STRATEGIES.map(s => <StrategyCard key={s.id} strat={s} expanded={expanded} setExpanded={setExpanded} showBotLink />)}
        </div>
      </div>

      {/* Investing Strategies */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Briefcase size={18} className="text-yellow-500" />
          <h2 className="text-base font-bold uppercase tracking-wider text-yellow-500">Investing Strategies</h2>
          <span className="text-xs text-terminal-muted">— Used by real investors & hedge funds</span>
        </div>
        <div className="space-y-3">
          {INVESTING_STRATEGIES.map(s => <StrategyCard key={s.id} strat={s} expanded={expanded} setExpanded={setExpanded} />)}
        </div>
      </div>
    </div>
  )
}

function StrategyCard({ strat, expanded, setExpanded, showBotLink }) {
  const Icon = strat.icon
  const isOpen = expanded === strat.id

  return (
    <div className="panel transition-all overflow-hidden" style={isOpen ? { borderColor: strat.color + '40' } : {}}>
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

      {isOpen && (
        <div className="px-5 pb-6 space-y-6">
          <div className="pl-14"><p className="text-sm leading-relaxed">{strat.summary}</p></div>

          {strat.sections.map((section, si) => {
            const SIcon = section.icon
            return (
              <div key={si} className="pl-14">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: strat.color }}>
                  <SIcon size={14} /> {section.title}
                </h3>
                <div className="space-y-3">
                  {section.content.map((block, bi) => renderBlock(block, bi, strat.color))}
                </div>
              </div>
            )
          })}

          {showBotLink && (
            <div className="pl-14 pt-2">
              <Link to="/bot" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors hover:opacity-80"
                style={{ backgroundColor: strat.color + '15', color: strat.color }}>
                Test this strategy <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function renderBlock(block, key, color) {
  if (block.type === 'text') return <p key={key} className="text-sm leading-relaxed text-terminal-text/85">{block.value}</p>
  if (block.type === 'formula') return (
    <div key={key} className="bg-terminal-bg rounded-xl px-4 py-3 font-mono text-sm border-l-2" style={{ borderColor: color }}>{block.value}</div>
  )
  if (block.type === 'signal') return (
    <div key={key} className="grid grid-cols-2 gap-3">
      <div className="bg-gain/5 border border-gain/20 rounded-xl p-3"><p className="text-xs font-semibold text-gain mb-1">↑ BUY Signal</p><p className="text-xs text-terminal-text/80">{block.buy}</p></div>
      <div className="bg-loss/5 border border-loss/20 rounded-xl p-3"><p className="text-xs font-semibold text-loss mb-1">↓ SELL Signal</p><p className="text-xs text-terminal-text/80">{block.sell}</p></div>
    </div>
  )
  if (block.type === 'highlight') return (
    <div key={key} className="space-y-2">
      {block.items.map((item, ii) => (
        <div key={ii} className="flex items-start gap-3 bg-terminal-bg rounded-xl p-3">
          <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5" style={{ backgroundColor: color + '20', color }}>{ii + 1}</span>
          <div><span className="text-sm font-semibold">{item.label}</span><span className="text-sm text-terminal-muted"> — {item.desc}</span></div>
        </div>
      ))}
    </div>
  )
  if (block.type === 'proscons') return (
    <div key={key} className="grid grid-cols-2 gap-3">
      <div className="space-y-1.5"><p className="text-xs font-semibold text-gain uppercase tracking-wider">Strengths</p>{block.pros.map((p, i) => <div key={i} className="flex items-start gap-2 text-xs text-terminal-text/80"><span className="text-gain mt-0.5">✓</span> {p}</div>)}</div>
      <div className="space-y-1.5"><p className="text-xs font-semibold text-loss uppercase tracking-wider">Risks</p>{block.cons.map((c, i) => <div key={i} className="flex items-start gap-2 text-xs text-terminal-text/80"><span className="text-loss mt-0.5">✗</span> {c}</div>)}</div>
    </div>
  )
  return null
}
