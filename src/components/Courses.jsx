import { useState } from 'react'
import {
  GraduationCap, ChevronDown, ChevronUp, Clock, BookOpen, Target,
  Calculator, AlertTriangle, Building2, Youtube, FileText, ArrowRight,
  BarChart3, Briefcase, CheckCircle2,
} from 'lucide-react'
import { Link } from 'react-router-dom'

// ──────────────────────────────────────────────────────────
// Curriculum
//
// Each track → courses (numbered) → lessons (numbered N.M).
// Each lesson has objectives, a body of structured blocks, and
// real-world sources (uni profs, books, YouTube channels).
// Inspired by NYU Stern (Damodaran), Wharton MOOC, Yale (Shiller),
// CFA curriculum, Wall Street Prep, Breaking Into Wall Street.
// ──────────────────────────────────────────────────────────

const TRADING_TRACK = {
  id: 'trading',
  name: 'Trading & Markets',
  tagline: 'From asset classes to algorithmic strategies — the buyside curriculum',
  color: '#3b82f6',
  courses: [
    {
      number: 1,
      title: 'Markets & Asset Classes',
      summary: 'How financial markets work and what trades on them.',
      lessons: [
        {
          number: '1.1',
          title: 'What is a financial market?',
          duration: '8 min',
          objectives: [
            'Define a financial market and its economic function',
            'Identify the main participants on each side of a trade',
            'Understand price discovery and liquidity',
          ],
          body: [
            { type: 'text', value: 'A financial market is any venue — physical or electronic — where buyers and sellers exchange financial assets. Its core economic role is to channel capital from those who have surplus savings (households, sovereign funds) to those who need it (corporations, governments), and to give that capital a price.' },
            { type: 'text', value: 'Three things every market produces:' },
            { type: 'highlight', items: [
              { label: 'Price discovery', desc: 'The continuous process by which trades reveal what an asset is worth right now' },
              { label: 'Liquidity', desc: 'The ability to convert an asset to cash quickly without moving the price' },
              { label: 'Risk transfer', desc: 'Lets hedgers offload risk to speculators willing to bear it for a return' },
            ]},
            { type: 'text', value: 'Participants fall into a few buckets: retail investors, institutional investors (mutual funds, pension funds, hedge funds), banks and dealers (Goldman, JPM, Citi), market makers (Citadel Securities, Jane Street), corporates raising capital, and central banks setting interest rate policy.' },
          ],
          sources: [
            { type: 'YouTube', name: 'Robert Shiller — Financial Markets (Yale Open Courses)' },
            { type: 'Book',    name: 'Investments — Bodie, Kane, Marcus (Ch. 1)' },
            { type: 'Course',  name: 'Wharton "Financial Markets" — Coursera (free)' },
          ],
        },
        {
          number: '1.2',
          title: 'The major asset classes',
          duration: '10 min',
          objectives: [
            'Distinguish equities, bonds, FX, commodities, derivatives, and crypto',
            'Match each asset class to its primary risk and return profile',
            'Recognize the relative size of each global market',
          ],
          body: [
            { type: 'highlight', items: [
              { label: 'Equities (stocks)', desc: 'Ownership in a company. Residual claim on cash flows after creditors. ~$110T global market cap (2024).' },
              { label: 'Fixed income (bonds)', desc: 'Loans to governments / corporations. Pay coupons + principal. ~$130T global. Larger than equities.' },
              { label: 'Foreign exchange (FX)', desc: 'Trading one currency for another. ~$7.5T per day — biggest market by volume. No central exchange (OTC).' },
              { label: 'Commodities', desc: 'Oil, gas, metals, agricultural products. Traded via futures, ETFs, or physical.' },
              { label: 'Derivatives', desc: 'Options, futures, swaps. Value derived from an underlying. Used for hedging or leverage.' },
              { label: 'Cryptocurrencies', desc: 'Digital assets on blockchains. ~$3T market cap. Bitcoin and Ethereum dominate.' },
            ]},
            { type: 'text', value: 'Each asset class has its own "personality". Equities reward growth and risk-taking but suffer in recessions. Bonds are calmer but lose value when rates rise. FX trades on macro divergence between economies. Commodities move with supply shocks. Crypto behaves like a high-beta tech stock with extra volatility.' },
          ],
          sources: [
            { type: 'YouTube', name: 'Aswath Damodaran — Asset Classes (NYU Stern, free lectures)' },
            { type: 'Course',  name: 'CFA Level I — Equity & Fixed Income readings' },
            { type: 'YouTube', name: 'Patrick Boyle — Markets explained' },
          ],
        },
        {
          number: '1.3',
          title: 'Primary vs secondary markets',
          duration: '7 min',
          objectives: [
            'Understand how securities first come into existence (primary)',
            'See how they then change hands among investors (secondary)',
            'Know what an IPO, follow-on offering, and OTC trade are',
          ],
          body: [
            { type: 'highlight', items: [
              { label: 'Primary market', desc: 'Where securities are issued for the first time. Money flows from investors → the issuer (company or government). Includes IPOs, follow-on offerings, bond issuances.' },
              { label: 'Secondary market', desc: 'Where already-issued securities are traded between investors. Money flows investor → investor; the issuing company gets nothing. NYSE, Nasdaq, LSE, Euronext are all secondary markets.' },
            ]},
            { type: 'text', value: 'An IPO (Initial Public Offering) is a primary-market event. Once the IPO closes, every subsequent trade of those shares happens on the secondary market. A healthy secondary market is what makes the primary market work — investors only buy new issues if they trust they can later sell them.' },
            { type: 'text', value: 'OTC ("over-the-counter") trades happen directly between two parties off-exchange — common in FX, bonds, and derivatives. There is no central order book; prices are negotiated.' },
          ],
          sources: [
            { type: 'YouTube', name: 'Khan Academy — IPOs and stock markets' },
            { type: 'Book',    name: 'Investment Banking — Rosenbaum & Pearl (Ch. on ECM)' },
          ],
        },
        {
          number: '1.4',
          title: 'Market structure: exchanges, market makers, dark pools',
          duration: '9 min',
          objectives: [
            'Understand how an order is matched on a modern exchange',
            'Know the role of a market maker and a high-frequency trader',
            'Recognize what dark pools and ECNs are',
          ],
          body: [
            { type: 'text', value: 'Most modern exchanges are electronic limit order books. Buy and sell orders sit in queues at every price level, and the system matches the best bid (highest price someone is willing to pay) with the best ask (lowest price someone is willing to sell at).' },
            { type: 'highlight', items: [
              { label: 'Exchanges (lit markets)', desc: 'NYSE, Nasdaq, LSE. All orders visible in the order book.' },
              { label: 'Market makers', desc: 'Firms (e.g. Citadel Securities, Virtu) that constantly post both buy and sell quotes, profiting from the bid-ask spread.' },
              { label: 'HFT (high-frequency trading)', desc: 'Sub-microsecond strategies — latency arbitrage, statistical arbitrage. ~50% of US equity volume.' },
              { label: 'ECNs', desc: 'Electronic Communication Networks — alternative venues to traditional exchanges.' },
              { label: 'Dark pools', desc: 'Off-exchange venues used by institutions to trade large blocks without revealing their hand and moving the market.' },
            ]},
            { type: 'text', value: 'Why this matters: when you place an order on Robinhood, it doesn\'t go directly to NYSE. It\'s routed to a market maker (often Citadel) for "payment for order flow", which fills it at the National Best Bid and Offer. This structure was at the center of the Gamestop saga in 2021.' },
          ],
          sources: [
            { type: 'YouTube', name: 'Patrick Boyle — Market structure and HFT' },
            { type: 'Book',    name: 'Flash Boys — Michael Lewis' },
            { type: 'Paper',   name: '"The Market Microstructure of the Stock Market" — O\'Hara' },
          ],
        },
      ],
    },
    {
      number: 2,
      title: 'Equity Fundamentals',
      summary: 'How stocks are priced and the language of fundamental analysis.',
      lessons: [
        {
          number: '2.1',
          title: 'How stocks are priced: three forces',
          duration: '8 min',
          objectives: [
            'Articulate the three forces that move stock prices',
            'Distinguish intrinsic value from market price',
            'Understand why prices can stay "wrong" for a long time',
          ],
          body: [
            { type: 'text', value: 'At any moment, the price of a stock is set by the marginal buyer and marginal seller. Three forces drive their decisions:' },
            { type: 'highlight', items: [
              { label: 'Fundamentals', desc: 'Earnings, cash flow, growth, debt level, competitive moat. The "what is this company actually worth" question.' },
              { label: 'Sentiment', desc: 'Investor mood, narrative, hype, fear. Same fundamentals can trade at very different prices in 2009 vs 2021.' },
              { label: 'Flows', desc: 'Where the money is going — index inclusion buying, ETF rebalancing, retail piling in. Sometimes mechanical, not fundamental.' },
            ]},
            { type: 'text', value: 'Benjamin Graham\'s "Mr. Market" metaphor: imagine a manic-depressive business partner who shows up every day offering to buy your share of the business or sell you his. Some days he\'s euphoric and quotes a high price; some days he\'s depressed and quotes a low one. Your job is to ignore him most days — but pounce when his mood gives you a great deal.' },
          ],
          sources: [
            { type: 'Book',    name: 'The Intelligent Investor — Benjamin Graham' },
            { type: 'YouTube', name: 'Damodaran — Foundations of Valuation (NYU Stern)' },
          ],
        },
        {
          number: '2.2',
          title: 'Reading financial statements',
          duration: '12 min',
          objectives: [
            'Identify the three core statements: Income Statement, Balance Sheet, Cash Flow',
            'Understand how the three connect',
            'Spot the line items investors care about most',
          ],
          body: [
            { type: 'highlight', items: [
              { label: 'Income Statement (P&L)', desc: 'Revenue → Cost of revenue → Gross profit → OpEx → EBIT → Interest → Tax → Net Income. Tells you profitability over a period.' },
              { label: 'Balance Sheet', desc: 'Assets = Liabilities + Equity. A snapshot of what the company owns and owes at a single point in time.' },
              { label: 'Cash Flow Statement', desc: 'Operating CF + Investing CF + Financing CF = Net change in cash. The most "honest" statement — earnings can be massaged but cash is cash.' },
            ]},
            { type: 'text', value: 'Connection: Net Income from the P&L flows into Retained Earnings on the Balance Sheet, and into the top of the Cash Flow Statement (where it\'s adjusted for non-cash items like D&A). This is the foundation of every accounting course and every IB interview.' },
            { type: 'text', value: 'Three lines investors live by: Revenue (top-line growth), EBITDA (operating profit before non-cash), and Free Cash Flow (cash you could actually return to shareholders).' },
          ],
          sources: [
            { type: 'YouTube', name: 'Wall Street Prep — The 3 financial statements explained' },
            { type: 'Course',  name: 'Coursera — "Introduction to Financial Accounting" (Wharton, Brian Bushee)' },
            { type: 'Book',    name: 'Financial Statements — Thomas Ittelson' },
          ],
        },
        {
          number: '2.3',
          title: 'Key valuation ratios',
          duration: '10 min',
          objectives: [
            'Use P/E, P/B, P/S, dividend yield to size up a stock',
            'Understand when each ratio is useful (and when it lies)',
            'Compare ratios across industries',
          ],
          body: [
            { type: 'formula', value: 'P/E   = Price per share / EPS                  → most common; useful for profitable companies' },
            { type: 'formula', value: 'P/B   = Price per share / Book value per share → useful for banks and asset-heavy businesses' },
            { type: 'formula', value: 'P/S   = Price per share / Revenue per share    → useful for unprofitable growth companies' },
            { type: 'formula', value: 'Div Y = Annual dividend / Price                → relevant for income-focused investors' },
            { type: 'formula', value: 'ROE   = Net Income / Shareholders\' Equity     → how efficiently equity is being used' },
            { type: 'text', value: 'No ratio is meaningful in isolation. Apple at P/E 28 means nothing without knowing its growth rate, capital intensity, and the P/E of peers. Compare like-for-like: tech to tech, banks to banks. And remember — a P/E of 8 can mean "cheap" or "the market knows something you don\'t".' },
          ],
          sources: [
            { type: 'YouTube', name: 'Damodaran — Relative Valuation Series (NYU)' },
            { type: 'Article', name: 'Investopedia — Comprehensive guide to financial ratios' },
          ],
        },
        {
          number: '2.4',
          title: 'Value vs Growth investing',
          duration: '9 min',
          objectives: [
            'Distinguish the value and growth philosophies',
            'Know the famous practitioners on both sides',
            'Understand the academic evidence on which works long-term',
          ],
          body: [
            { type: 'highlight', items: [
              { label: 'Value', desc: 'Buy companies trading below their intrinsic worth. Low P/E, low P/B, often unloved. Champions: Buffett, Munger, Klarman, Howard Marks.' },
              { label: 'Growth', desc: 'Buy companies with rapid revenue / earnings growth, even at high multiples. Champions: Phil Fisher, Peter Lynch, Cathie Wood.' },
              { label: 'GARP', desc: '"Growth At a Reasonable Price" — Peter Lynch\'s synthesis. Look for growth, but only when priced reasonably (PEG < 1).' },
            ]},
            { type: 'text', value: 'Academic evidence: the Fama-French research showed a long-run "value premium" — cheap stocks beating expensive ones over decades. But growth dominated the 2010s-2020s thanks to low rates and the tech revolution. The debate is not settled; both styles work in different regimes.' },
          ],
          sources: [
            { type: 'Paper',   name: 'Fama & French — "Common Risk Factors in the Returns on Stocks and Bonds" (1993)' },
            { type: 'Book',    name: 'One Up on Wall Street — Peter Lynch' },
            { type: 'Book',    name: 'The Most Important Thing — Howard Marks' },
          ],
        },
      ],
    },
    {
      number: 3,
      title: 'Technical Analysis',
      summary: 'Reading charts — what price tells you about supply, demand, and crowd psychology.',
      lessons: [
        {
          number: '3.1',
          title: 'Candlestick charts and timeframes',
          duration: '7 min',
          objectives: [
            'Read a candlestick: open, high, low, close',
            'Pick the right timeframe for your strategy',
            'Spot the most common single-candle patterns',
          ],
          body: [
            { type: 'text', value: 'A candlestick shows four pieces of information for a single period (1 min, 1 hour, 1 day…): Open, High, Low, Close. The body is filled green if Close > Open, red if Close < Open. The wicks extend to the High and Low.' },
            { type: 'highlight', items: [
              { label: 'Long green body', desc: 'Strong buyer demand — close near the high' },
              { label: 'Long red body', desc: 'Strong selling pressure — close near the low' },
              { label: 'Doji', desc: 'Open ≈ Close. Indecision — buyers and sellers fought to a tie' },
              { label: 'Hammer', desc: 'Small body, long lower wick. Buyers rejected lower prices — often a reversal signal' },
            ]},
            { type: 'text', value: 'Timeframe matters: a day trader works on 1-5 minute charts; a swing trader on daily; a long-term investor on weekly or monthly. The same stock looks completely different across timeframes.' },
          ],
          sources: [
            { type: 'YouTube', name: 'The Trading Channel — Candlestick basics' },
            { type: 'Book',    name: 'Japanese Candlestick Charting Techniques — Steve Nison' },
          ],
        },
        {
          number: '3.2',
          title: 'Moving averages and trend',
          duration: '8 min',
          objectives: [
            'Compute SMA and EMA',
            'Use moving averages to define trend',
            'Spot the Golden Cross and Death Cross',
          ],
          body: [
            { type: 'formula', value: 'SMA(n) = average of last n closing prices' },
            { type: 'formula', value: 'EMA(n) = exponentially weighted average — more weight to recent prices' },
            { type: 'text', value: 'Moving averages smooth out noise and reveal trend. A common rule of thumb: price above its 200-day MA = uptrend, below = downtrend. The 50-day MA defines medium-term trend.' },
            { type: 'highlight', items: [
              { label: 'Golden Cross', desc: '50-day SMA crosses ABOVE 200-day SMA. Bullish signal. Famous on the S&P 500.' },
              { label: 'Death Cross', desc: '50-day SMA crosses BELOW 200-day SMA. Bearish signal.' },
            ]},
            { type: 'text', value: 'Try it: this site\'s Bot page lets you backtest an SMA crossover strategy on any ticker — see how it performs vs buy-and-hold.' },
          ],
          sources: [
            { type: 'YouTube', name: 'Rayner Teo — Moving averages explained' },
            { type: 'Tool',    name: 'TradingView — free charting with built-in MAs' },
          ],
        },
        {
          number: '3.3',
          title: 'Oscillators: RSI, MACD, Stochastic',
          duration: '10 min',
          objectives: [
            'Understand what an oscillator measures',
            'Read RSI, MACD, and Stochastic correctly',
            'Recognize divergence as a high-conviction signal',
          ],
          body: [
            { type: 'highlight', items: [
              { label: 'RSI (Relative Strength Index)', desc: 'Measures momentum on a 0-100 scale. <30 = oversold; >70 = overbought. Developed by Welles Wilder, 1978.' },
              { label: 'MACD', desc: 'Moving Average Convergence Divergence. Difference between 12-EMA and 26-EMA, plus a 9-period signal line. Crossovers signal trend changes.' },
              { label: 'Stochastic', desc: 'Compares current close to its recent range (over n periods). Like RSI, oscillates 0-100.' },
            ]},
            { type: 'text', value: 'Divergence is the most powerful pattern: price makes a new high, but the oscillator does NOT. The momentum is fading even though the price keeps climbing — often a precursor to a reversal.' },
          ],
          sources: [
            { type: 'Book',    name: 'New Concepts in Technical Trading Systems — J. Welles Wilder' },
            { type: 'YouTube', name: 'Adam Khoo — RSI deep dive' },
          ],
        },
        {
          number: '3.4',
          title: 'Support, resistance, and chart patterns',
          duration: '9 min',
          objectives: [
            'Identify horizontal support and resistance',
            'Recognize the most reliable chart patterns',
            'Understand why patterns work (and when they don\'t)',
          ],
          body: [
            { type: 'highlight', items: [
              { label: 'Support', desc: 'A price level where buying has historically emerged. Acts as a "floor".' },
              { label: 'Resistance', desc: 'A price level where selling has historically emerged. Acts as a "ceiling".' },
              { label: 'Breakout', desc: 'Price punches through support / resistance — often on volume. Old resistance becomes new support.' },
            ]},
            { type: 'text', value: 'Common patterns: head and shoulders (reversal), cup and handle (continuation), double top / bottom (reversal), bull flag (continuation), wedges. They work because traders watch them — they become self-fulfilling.' },
            { type: 'text', value: 'Reality check: academic studies on chart patterns produce mixed results. They work better as part of a system (combined with momentum, volume, fundamentals) than as standalone signals.' },
          ],
          sources: [
            { type: 'Book',    name: 'Technical Analysis of the Financial Markets — John Murphy' },
            { type: 'YouTube', name: 'Cooper Academy — Chart patterns' },
          ],
        },
      ],
    },
    {
      number: 4,
      title: 'Algorithmic Trading & Risk Management',
      summary: 'How systematic strategies are built and how risk is sized.',
      lessons: [
        {
          number: '4.1',
          title: 'What is algorithmic trading?',
          duration: '7 min',
          objectives: [
            'Define algorithmic / systematic / quantitative trading',
            'Understand the spectrum from rule-based to ML-driven',
            'Know who the big quants are',
          ],
          body: [
            { type: 'text', value: 'Algorithmic trading is any strategy with pre-defined, mechanical entry/exit rules — executed by a computer. It removes emotion, allows backtesting, and scales to hundreds of instruments in parallel.' },
            { type: 'highlight', items: [
              { label: 'Rule-based', desc: 'Simple if-then logic. "Buy when 50-day SMA crosses above 200-day SMA". Easy to understand and audit.' },
              { label: 'Statistical', desc: 'Use of historical data to find edges (mean reversion, momentum). The realm of stat arb.' },
              { label: 'Machine learning', desc: 'Models like gradient boosting or neural networks discover features. Sophisticated but prone to overfitting.' },
              { label: 'High-frequency', desc: 'Latency-sensitive, holding periods of milliseconds. Dominated by Citadel Securities, Virtu, Jump.' },
            ]},
            { type: 'text', value: 'The legends: Renaissance Technologies (Jim Simons), DE Shaw, Two Sigma, AQR. Renaissance\'s Medallion Fund returned ~66% gross / 39% net annually for decades — the best track record ever recorded.' },
          ],
          sources: [
            { type: 'Book',    name: 'The Man Who Solved the Market — Gregory Zuckerman' },
            { type: 'YouTube', name: 'Talks at Google — Jim Simons interviews' },
          ],
        },
        {
          number: '4.2',
          title: 'Backtesting: the foundation and the trap',
          duration: '11 min',
          objectives: [
            'Set up a clean backtest',
            'Avoid the three biggest pitfalls: lookahead bias, overfitting, survivorship bias',
            'Run a walk-forward test',
          ],
          body: [
            { type: 'text', value: 'Backtesting = running a strategy on historical data to estimate how it would have performed. Essential — but easy to do badly. Three traps:' },
            { type: 'highlight', items: [
              { label: 'Lookahead bias', desc: 'Using information that wouldn\'t have been available at the time. Example: rebalancing on end-of-day close using same-day fundamentals released after-hours.' },
              { label: 'Overfitting', desc: 'Tuning the strategy to historical noise. A model with 14 parameters tuned to in-sample data will look amazing — and fail out-of-sample.' },
              { label: 'Survivorship bias', desc: 'Backtesting only on stocks still listed today, missing the ones that went bankrupt. Biases returns upward.' },
            ]},
            { type: 'text', value: 'Gold standard: walk-forward testing. Train on years 1-5, test on year 6. Roll forward. Strategy must remain profitable on data it has never seen.' },
          ],
          sources: [
            { type: 'Book',    name: 'Advances in Financial Machine Learning — Marcos López de Prado' },
            { type: 'YouTube', name: 'QuantConnect — Backtesting basics' },
            { type: 'Tool',    name: 'This site\'s Bot page lets you backtest SMA / RSI / MACD / Momentum strategies in seconds' },
          ],
        },
        {
          number: '4.3',
          title: 'Risk management: position sizing & drawdowns',
          duration: '10 min',
          objectives: [
            'Size positions based on volatility, not gut feel',
            'Use stop-losses and understand their tradeoffs',
            'Read Sharpe ratio, Sortino ratio, max drawdown',
          ],
          body: [
            { type: 'formula', value: 'Position size  = (Account × Risk%) / (Entry − Stop Loss)' },
            { type: 'formula', value: 'Sharpe Ratio   = (Return − Risk-free rate) / Std Dev of returns' },
            { type: 'formula', value: 'Max Drawdown  = max peak-to-trough decline over the period' },
            { type: 'text', value: 'A 50% drawdown requires a 100% gain to recover. Most pros target a max drawdown of 20% — beyond that, investors withdraw, and the strategy is psychologically unviable.' },
            { type: 'highlight', items: [
              { label: 'Risk per trade', desc: '1-2% of account capital per trade is a common cap' },
              { label: 'Position correlation', desc: 'Five "uncorrelated" tech stocks are all one trade in a tech selloff. Diversify across sectors / asset classes.' },
              { label: 'Kelly Criterion', desc: 'Mathematically optimal position size: f = (bp - q) / b where p = win probability, b = win/loss ratio. Most pros use a fraction of full Kelly to reduce volatility.' },
            ]},
          ],
          sources: [
            { type: 'Book',    name: 'Trade Your Way to Financial Freedom — Van Tharp' },
            { type: 'Paper',   name: '"A New Interpretation of Information Rate" — John Kelly Jr. (1956)' },
          ],
        },
        {
          number: '4.4',
          title: 'The momentum anomaly',
          duration: '8 min',
          objectives: [
            'Understand why momentum exists despite efficient market theory',
            'Apply the classic 12-1 momentum rule',
            'Know momentum\'s crash risk',
          ],
          body: [
            { type: 'text', value: 'Momentum is one of the most robust anomalies in finance: stocks that performed well over the past 3-12 months tend to keep performing well for the next 3-12 months. Documented by Jegadeesh and Titman (1993) and confirmed across countries, asset classes, and decades.' },
            { type: 'highlight', items: [
              { label: '12-1 momentum', desc: 'Rank stocks by total return over the past 12 months, skipping the most recent month (to avoid short-term reversal). Buy top decile, sell bottom decile, rebalance monthly.' },
              { label: 'Why it works', desc: 'Behavioral biases: investors are slow to update on new information, then over-extrapolate trends.' },
              { label: 'Momentum crashes', desc: 'After a market bottom (e.g. March 2009), the "losers" rip upward, devastating momentum portfolios. Drawdowns of 50%+ have happened.' },
            ]},
            { type: 'text', value: 'AQR Capital manages billions in momentum strategies with volatility scaling and crash protection — exactly because the raw factor is so brutal in reversals.' },
          ],
          sources: [
            { type: 'Paper',   name: 'Jegadeesh & Titman — "Returns to Buying Winners and Selling Losers" (Journal of Finance, 1993)' },
            { type: 'Paper',   name: 'Asness, Moskowitz, Pedersen — "Value and Momentum Everywhere" (2013)' },
            { type: 'YouTube', name: 'AQR — Momentum explained (Cliff Asness talks)' },
          ],
        },
      ],
    },
  ],
}

const MNA_TRACK = {
  id: 'mna',
  name: 'M&A & Investment Banking',
  tagline: 'From corporate finance basics to LBO models — the sellside curriculum',
  color: '#a855f7',
  courses: [
    {
      number: 1,
      title: 'Corporate Finance Foundations',
      summary: 'The accounting and finance theory every M&A analyst lives in.',
      lessons: [
        {
          number: '1.1',
          title: 'What does a company do with money?',
          duration: '6 min',
          objectives: [
            'Map the four main uses of corporate cash',
            'Understand the trade-off between growth and shareholder returns',
            'Know what "capital allocation" means and why it\'s the CEO\'s most important job',
          ],
          body: [
            { type: 'text', value: 'Every dollar a company generates can do one of four things:' },
            { type: 'highlight', items: [
              { label: 'Reinvest in the business', desc: 'CapEx (factories, data centers), R&D, hiring, marketing. Drives organic growth.' },
              { label: 'Acquire other companies', desc: 'M&A — buy growth, talent, or strategic position.' },
              { label: 'Pay down debt', desc: 'Reduce leverage. Lowers risk, sometimes lowers cost of capital.' },
              { label: 'Return to shareholders', desc: 'Dividends or buybacks. Used when reinvestment opportunities are scarce.' },
            ]},
            { type: 'text', value: 'Capital allocation is the CEO\'s most important job. Warren Buffett: "Over time, the skill with which a company\'s managers allocate capital has an enormous impact on the enterprise\'s value." Bad allocation (Yahoo passing on Google; HP overpaying for Autonomy) destroys billions.' },
          ],
          sources: [
            { type: 'Book',    name: 'The Outsiders — William Thorndike (CEOs who allocated capital brilliantly)' },
            { type: 'YouTube', name: 'Damodaran — "Corporate Finance: The Big Picture" (NYU Stern)' },
          ],
        },
        {
          number: '1.2',
          title: 'The three financial statements (deep dive)',
          duration: '12 min',
          objectives: [
            'Build the link between Income Statement, Balance Sheet, Cash Flow',
            'Identify the key line items used in modeling',
            'Spot common accounting tricks',
          ],
          body: [
            { type: 'text', value: 'You will model these three statements every day in IB. They must always reconcile — modeling is fundamentally about keeping them in balance as you change assumptions.' },
            { type: 'highlight', items: [
              { label: 'Income Statement (P&L)', desc: 'Revenue → COGS → Gross Profit → OpEx → EBIT → Interest → Pretax Income → Tax → Net Income. Bottom of P&L feeds BS via Retained Earnings.' },
              { label: 'Balance Sheet', desc: 'Assets (Cash, AR, Inventory, PP&E, Goodwill) = Liabilities (AP, Debt) + Equity (Common stock + Retained Earnings). Must balance at every point in time.' },
              { label: 'Cash Flow Statement', desc: 'Operating CF (start with Net Income, add back non-cash, adjust working capital) + Investing CF (CapEx, acquisitions) + Financing CF (debt, equity, dividends) = Net change in cash.' },
            ]},
            { type: 'text', value: 'The classic IB interview question: "If depreciation goes up by $10, what happens to all three statements?" P&L: pre-tax income falls by $10, tax falls by ~$2.5, net income falls by $7.5. CF: net income falls by $7.5, +$10 D&A add-back, cash UP by $2.5. BS: PP&E down $10, cash up $2.5, retained earnings down $7.5. All balance.' },
          ],
          sources: [
            { type: 'YouTube', name: 'Wall Street Prep — "The 3 Statement Model" (free YouTube series)' },
            { type: 'Book',    name: 'Financial Modeling — Simon Benninga (textbook used at LBS, Wharton)' },
            { type: 'Course',  name: 'Breaking Into Wall Street — Financial Modeling Fundamentals' },
          ],
        },
        {
          number: '1.3',
          title: 'Free Cash Flow: FCFF vs FCFE',
          duration: '10 min',
          objectives: [
            'Compute Free Cash Flow to the Firm (FCFF)',
            'Compute Free Cash Flow to Equity (FCFE)',
            'Understand which one to discount with which rate',
          ],
          body: [
            { type: 'formula', value: 'FCFF (Unlevered) = EBIT × (1 − Tax)  +  D&A  −  CapEx  −  ΔWorking Capital' },
            { type: 'formula', value: 'FCFE (Levered)   = Net Income       +  D&A  −  CapEx  −  ΔWC  +  Net Borrowing' },
            { type: 'text', value: 'FCFF is the cash available to ALL providers of capital (debt + equity holders). Discount it with WACC to get Enterprise Value. This is the standard for M&A and LBO modeling.' },
            { type: 'text', value: 'FCFE is the cash available to EQUITY HOLDERS only — after debt service. Discount it with cost of equity (Re) to get Equity Value directly. More common in equity research and dividend models.' },
            { type: 'highlight', items: [
              { label: 'Why FCFF dominates in M&A', desc: 'A buyer often refinances the target\'s debt — so the cash available to all capital providers is the relevant figure to value the company.' },
            ]},
          ],
          sources: [
            { type: 'Book',    name: 'Damodaran on Valuation (Chapter on FCF definitions)' },
            { type: 'YouTube', name: 'CFA Institute — FCFF vs FCFE explained' },
          ],
        },
        {
          number: '1.4',
          title: 'WACC — the cost of capital',
          duration: '11 min',
          objectives: [
            'Compute WACC from scratch',
            'Use CAPM to estimate cost of equity',
            'Understand why WACC drives valuation more than any other input',
          ],
          body: [
            { type: 'formula', value: 'WACC = (E/V) × Re  +  (D/V) × Rd × (1 − Tc)' },
            { type: 'formula', value: 'Re (CAPM) = Rf  +  β × (Rm − Rf)' },
            { type: 'text', value: 'Each piece: E/V = equity as % of total capital. D/V = debt as %. Re = cost of equity (what shareholders demand). Rd = cost of debt (interest rate). Tc = corporate tax rate (debt is tax-deductible — that\'s the (1−Tc) shield).' },
            { type: 'highlight', items: [
              { label: 'Risk-free rate (Rf)', desc: 'Yield on a 10-year government bond (typically 4-5% in 2024-2026)' },
              { label: 'Beta (β)', desc: 'How much the stock moves vs the market. β = 1 means same as market. β = 1.5 means 50% more volatile.' },
              { label: 'Equity risk premium (Rm − Rf)', desc: 'Extra return investors demand for holding stocks vs T-bills. ~5-6% in developed markets.' },
            ]},
            { type: 'text', value: 'WACC sensitivity is brutal: a DCF with WACC = 9% can produce a valuation 30% higher than the same DCF with WACC = 11%. That\'s why bankers obsess over it — and why every pitch shows a sensitivity table.' },
          ],
          sources: [
            { type: 'YouTube', name: 'Damodaran — Cost of Capital and CAPM (NYU lectures, free)' },
            { type: 'Book',    name: 'Investment Valuation — Aswath Damodaran' },
          ],
        },
      ],
    },
    {
      number: 2,
      title: 'Valuation Methods',
      summary: 'The four pillars of valuation — and how to combine them.',
      lessons: [
        {
          number: '2.1',
          title: 'Enterprise Value vs Equity Value (the bridge)',
          duration: '8 min',
          objectives: [
            'Distinguish EV from Equity Value',
            'Walk the EV → Equity bridge',
            'Know which multiple uses which value',
          ],
          body: [
            { type: 'text', value: 'Enterprise Value (EV) is the cost to buy the whole business — every claim on its cash flows. Equity Value is the cost to buy just the stock.' },
            { type: 'formula', value: 'Enterprise Value = Equity Value  +  Net Debt  +  Preferred Stock  +  Minority Interest' },
            { type: 'formula', value: 'Net Debt = Total Debt − Cash & equivalents' },
            { type: 'highlight', items: [
              { label: 'Pair EV with operating metrics', desc: 'EV/Revenue, EV/EBITDA, EV/EBIT — these are pre-interest, so they match EV which is capital-structure-neutral' },
              { label: 'Pair Equity Value with equity metrics', desc: 'P/E (Price/Earnings) — Net Income is post-interest, so it matches Equity Value' },
            ]},
            { type: 'text', value: 'Practical tip: when comparing two companies with different leverage, EV/EBITDA gives a fair apples-to-apples comparison. P/E gets distorted by capital structure differences.' },
          ],
          sources: [
            { type: 'YouTube', name: 'Mergers & Inquisitions — EV vs Equity Value (Brian DeChesare)' },
            { type: 'Book',    name: 'Investment Banking — Rosenbaum & Pearl (Ch. 1)' },
          ],
        },
        {
          number: '2.2',
          title: 'DCF — the full mechanics',
          duration: '15 min',
          objectives: [
            'Project unlevered free cash flow for 5-10 years',
            'Calculate terminal value with Gordon Growth and exit multiple',
            'Discount everything to present value and bridge to equity',
          ],
          body: [
            { type: 'formula', value: 'EV = Σ [ FCF(t) / (1+WACC)^t ]  +  TV / (1+WACC)^n' },
            { type: 'formula', value: 'Terminal Value (Gordon)        = FCF(n+1) / (WACC − g)' },
            { type: 'formula', value: 'Terminal Value (exit multiple) = EBITDA(n) × exit multiple' },
            { type: 'highlight', items: [
              { label: 'Step 1', desc: 'Project revenue, margins, CapEx, working capital for 5-10 years → derive FCF' },
              { label: 'Step 2', desc: 'Compute WACC (separately)' },
              { label: 'Step 3', desc: 'Compute terminal value using BOTH Gordon Growth and exit multiple — cross-check the implied growth rate makes sense' },
              { label: 'Step 4', desc: 'Discount each year\'s FCF and terminal value to today → sum to Enterprise Value' },
              { label: 'Step 5', desc: 'EV − Net Debt = Equity Value → divide by shares for price per share' },
              { label: 'Step 6', desc: 'Build a sensitivity table (WACC × g) — the price always swings 20-40%' },
            ]},
            { type: 'text', value: '⚠ The terminal value is usually 60-80% of total enterprise value. Whatever assumption you put for "g" (long-term growth) is dominating the answer. Cap g at the long-run GDP growth rate (~2-3%).' },
          ],
          sources: [
            { type: 'YouTube', name: 'Damodaran — Full DCF Walkthrough (NYU Stern, free)' },
            { type: 'Tool',    name: 'This site\'s Valuation Tool — slide inputs and see the DCF in real time' },
          ],
        },
        {
          number: '2.3',
          title: 'Trading Comparables',
          duration: '10 min',
          objectives: [
            'Build a peer group correctly',
            'Calculate and present multiples',
            'Avoid the most common comp mistakes',
          ],
          body: [
            { type: 'text', value: 'Pick 5-10 peers with similar: industry, size, growth, margins, geography. Calculate their multiples (EV/Revenue, EV/EBITDA, P/E), find the median and the 25th-75th percentile range, then apply that range to your target\'s metric.' },
            { type: 'highlight', items: [
              { label: 'Common multiples by industry', desc: 'SaaS: EV/Revenue. Industrials: EV/EBITDA. Banks: P/Tangible Book. Real estate: P/FFO. Resource extraction: EV/Reserves.' },
              { label: 'Forward vs trailing', desc: 'Forward multiples (next 12 months estimate) are usually more meaningful than trailing — they reflect what the market is pricing today.' },
              { label: 'Mistakes to avoid', desc: '(1) Comparing PROFITABLE to UNPROFITABLE companies on P/E — meaningless. (2) Ignoring growth differences. (3) Picking peers from different geographies with different cost of capital.' },
            ]},
          ],
          sources: [
            { type: 'Book',    name: 'Investment Banking — Rosenbaum & Pearl (Ch. on Comps)' },
            { type: 'YouTube', name: 'Macabacus — Building a comps table' },
          ],
        },
        {
          number: '2.4',
          title: 'Precedent Transactions',
          duration: '9 min',
          objectives: [
            'Find comparable past M&A deals',
            'Adjust multiples for time and market conditions',
            'Understand why precedents trade at a premium to trading comps',
          ],
          body: [
            { type: 'text', value: 'Look at past M&A deals involving similar targets. Compute the multiples that were paid (EV of deal / target\'s LTM metrics). Apply the range to your target.' },
            { type: 'highlight', items: [
              { label: 'Why higher than trading comps', desc: 'Three reasons: (1) Control premium — buyers pay 20-30% over market price for control. (2) Synergies built into the price. (3) Auction tension when multiple bidders compete.' },
              { label: 'Sources of data', desc: 'Bloomberg M&A, MergerMarket, Capital IQ, Pitchbook — and SEC filings (S-4, 8-K) for public deal details.' },
              { label: 'Time decay', desc: 'A deal from 2017 may not reflect 2026 multiples — interest rate environment, regulatory backdrop, and sentiment all matter.' },
            ]},
            { type: 'text', value: 'Bankers use precedents tactically: cite high precedents when advising a seller; cite low ones when advising a buyer. Always present alongside trading comps for context.' },
          ],
          sources: [
            { type: 'YouTube', name: 'Wall Street Prep — Precedent Transactions analysis' },
            { type: 'Book',    name: 'Investment Banking — Rosenbaum & Pearl (Ch. on Precedents)' },
          ],
        },
      ],
    },
    {
      number: 3,
      title: 'M&A Process & Structuring',
      summary: 'How deals get done in practice — from pitch to close.',
      lessons: [
        {
          number: '3.1',
          title: 'Strategic vs financial buyers',
          duration: '8 min',
          objectives: [
            'Distinguish strategic and financial buyers and their motivations',
            'Understand why each one values the same target differently',
            'Know which is likely to pay more (and why)',
          ],
          body: [
            { type: 'highlight', items: [
              { label: 'Strategic buyer', desc: 'A company in the same / adjacent industry. Motivated by synergies (cost cuts, cross-sell, market consolidation). Examples: Microsoft buying Activision, Disney buying Fox.' },
              { label: 'Financial buyer (PE)', desc: 'A private equity firm. Motivated by financial returns through leverage, operational improvements, and exit at a higher multiple. Examples: KKR, Blackstone, Carlyle, Apollo.' },
            ]},
            { type: 'text', value: 'Strategic buyers usually pay more because they can extract synergies that financial buyers can\'t. But PE firms can be aggressive when they have a strong operational thesis or when financing is cheap.' },
            { type: 'text', value: 'When advising a sellside process, bankers run "dual track" — invite both types to compete, which usually maximizes the price.' },
          ],
          sources: [
            { type: 'Book',    name: 'The Lessons of History — Will Durant (relevant for cycles)' },
            { type: 'YouTube', name: 'Mergers & Inquisitions — Strategic vs PE buyers' },
          ],
        },
        {
          number: '3.2',
          title: 'Deal structures: stock vs asset, cash vs stock',
          duration: '10 min',
          objectives: [
            'Distinguish stock and asset purchases',
            'Understand the tax and legal implications of each',
            'Know when buyers pay cash vs stock vs mixed',
          ],
          body: [
            { type: 'highlight', items: [
              { label: 'Stock purchase', desc: 'Buyer acquires the target\'s shares. All liabilities transfer. Simpler legally; common for whole-company deals.' },
              { label: 'Asset purchase', desc: 'Buyer cherry-picks specific assets and liabilities. Better tax basis (step-up for the buyer); cleaner from a liability perspective. Common for division carve-outs.' },
              { label: 'All-cash', desc: 'Buyer pays cash. Clean and certain for sellers; consumes cash or requires new debt.' },
              { label: 'All-stock', desc: 'Buyer issues new shares. No cash outflow; dilutes existing shareholders. Common between similarly-sized companies (often "merger of equals").' },
              { label: 'Mixed', desc: 'Cash + stock combined. Most common for large deals (e.g. Microsoft-LinkedIn was all cash, but AT&T-Time Warner was cash + stock).' },
            ]},
            { type: 'text', value: 'Stock deals signal: "we think our stock is overvalued and we want to spend it before it falls". Cash deals signal: "we have conviction in the target and our own stock is undervalued or fairly priced".' },
          ],
          sources: [
            { type: 'YouTube', name: 'CFI Education — Deal structures explained' },
            { type: 'Book',    name: 'M&A: A Practical Guide — Joshua Rosenbaum' },
          ],
        },
        {
          number: '3.3',
          title: 'The deal process: 9-month timeline',
          duration: '12 min',
          objectives: [
            'Walk through every phase of an M&A deal',
            'Know what an analyst does at each stage',
            'Decode the jargon: CIM, IOI, LOI, NDA, SPA',
          ],
          body: [
            { type: 'highlight', items: [
              { label: 'Month 0: Mandate', desc: 'Banker is hired. Engagement letter signed. Bank starts analysis.' },
              { label: 'Month 1-2: Prep', desc: 'Build CIM (Confidential Information Memorandum, 50-100 pages), management presentation, financial model. Compile potential buyer list.' },
              { label: 'Month 2-3: Teasers & NDAs', desc: '1-2 page anonymous teaser → buyer NDA → full CIM sent.' },
              { label: 'Month 3-4: First-round bids (IOI)', desc: 'Buyers submit non-binding price ranges. Sellside narrows to ~5-10 buyers for round 2.' },
              { label: 'Month 4-6: Diligence', desc: 'Data room opens. Management presentations. Deep buyer diligence (financial, legal, commercial, tax, IT, HR).' },
              { label: 'Month 6: Final bids (LOI)', desc: 'Binding offers. Pick winner — exclusivity granted.' },
              { label: 'Month 6-8: SPA negotiation', desc: 'Lawyers negotiate the Sale and Purchase Agreement — reps & warranties, indemnities, working capital adjustments, MAC clauses.' },
              { label: 'Month 8-12: Closing', desc: 'Sign deal → regulatory approvals (antitrust, foreign investment) → close.' },
            ]},
            { type: 'text', value: 'Analyst life: you live in the model, the data room, and the CIM. Q&A logs with 500+ buyer questions are not unusual. Weekend work is expected during peak phases.' },
          ],
          sources: [
            { type: 'YouTube', name: 'rareliquid (Jeremy) — Day in the life of an IB analyst' },
            { type: 'Book',    name: 'Monkey Business — Rolfe & Troob (memoir of IB life)' },
          ],
        },
        {
          number: '3.4',
          title: 'Synergies and how they\'re modeled',
          duration: '9 min',
          objectives: [
            'Distinguish cost / revenue / financial / operational synergies',
            'Value synergies via DCF',
            'Account for one-time costs to achieve',
          ],
          body: [
            { type: 'highlight', items: [
              { label: 'Cost synergies', desc: 'Eliminate overlapping overhead, consolidate vendors, IT integration. Tangible — typically 50-70% materialise.' },
              { label: 'Revenue synergies', desc: 'Cross-sell, new geographies, bundle pricing. Aspirational — only 30-50% materialise.' },
              { label: 'Financial synergies', desc: 'Lower WACC, tax benefits (NOL utilisation), interest rate improvements.' },
              { label: 'Operational synergies', desc: 'Procurement scale, shared supply chain, capacity utilisation.' },
            ]},
            { type: 'formula', value: 'NPV of synergies = Σ [ After-tax run-rate × (1+g)^t / (1+WACC)^t ]  −  Cost to achieve' },
            { type: 'text', value: 'Run-rate synergies are typically achieved 2-3 years post-close. The "cost to achieve" includes severance, consulting fees, and IT integration — usually 1-2× the annual run-rate.' },
            { type: 'text', value: '⚠ Famous overestimates: AOL-Time Warner promised "convergence synergies" that never materialised — destroyed $200B+. HP-Autonomy wrote down $8.8B in 13 months.' },
          ],
          sources: [
            { type: 'Article', name: 'McKinsey Quarterly — "The synergy maths that should make you think twice"' },
            { type: 'Paper',   name: '"The Synergy Trap" — Mark Sirower (Boston University)' },
          ],
        },
      ],
    },
    {
      number: 4,
      title: 'LBO & Private Equity',
      summary: 'How sponsors finance deals with debt and engineer 20%+ returns.',
      lessons: [
        {
          number: '4.1',
          title: 'What is Private Equity?',
          duration: '8 min',
          objectives: [
            'Understand the PE business model (fees + carry)',
            'Distinguish LBOs, growth equity, and venture capital',
            'Know the major PE firms by size',
          ],
          body: [
            { type: 'text', value: 'Private equity firms raise money from LPs (pension funds, sovereign wealth, endowments, family offices) into 10-year closed-end funds, then deploy it into companies. PE firms make money in two ways:' },
            { type: 'highlight', items: [
              { label: 'Management fee', desc: 'Typically 2% of committed capital, annually. Pays for the operating costs.' },
              { label: 'Carried interest ("carry")', desc: 'Typically 20% of profits above an 8% hurdle. This is where the real money is — and the source of PE\'s political controversies (carry is taxed as capital gains, not income).' },
            ]},
            { type: 'text', value: 'PE flavours: Leveraged Buyouts (mature, profitable companies), Growth Equity (minority stakes in scaling businesses), Venture Capital (early-stage). The lines blur — Bain Capital does both LBO and growth; Sequoia does both VC and growth.' },
            { type: 'text', value: 'Top firms by AUM: Blackstone (~$1T), KKR, Carlyle, Apollo, TPG, Bain Capital, CVC, EQT, Advent, Hellman & Friedman, Thoma Bravo, Vista (the largest software-specialist).' },
          ],
          sources: [
            { type: 'Book',    name: 'King of Capital — David Carey (story of Blackstone)' },
            { type: 'Book',    name: 'Barbarians at the Gate — Bryan Burrough (RJR Nabisco LBO classic)' },
          ],
        },
        {
          number: '4.2',
          title: 'The Sources & Uses table',
          duration: '8 min',
          objectives: [
            'Build a Sources & Uses table',
            'Understand each piece of typical LBO capital structure',
            'Compute Sponsor Equity by plug',
          ],
          body: [
            { type: 'text', value: 'Every LBO starts with a Sources & Uses table — a one-page summary of where the money comes from and where it goes. They must always balance.' },
            { type: 'highlight', items: [
              { label: 'Uses', desc: 'Purchase price of target equity + Refinance existing debt + Transaction fees (legal, banking, accounting — typically 2-3% of EV) + Financing fees' },
              { label: 'Sources', desc: 'Senior debt (Term Loan A, Term Loan B, revolver) + High-yield bonds or mezzanine + Sponsor equity (the plug) + sometimes Management rollover' },
            ]},
            { type: 'text', value: 'Typical capital structure in 2024-2026 (moderate-quality target): 5-6× EBITDA total debt, ~50-60% equity, ~40-50% debt. Higher quality (stable cash flows, hard assets) can support 6-7×; lower quality stuck at 4-5×.' },
            { type: 'text', value: 'Sponsor equity is the plug: Total Uses − all debt and other sources = Required sponsor equity. The sponsor minimises this to maximise IRR.' },
          ],
          sources: [
            { type: 'YouTube', name: 'Wall Street Prep — LBO modeling Sources & Uses' },
            { type: 'Book',    name: 'Pre-MBA Private Equity — Hines Pinney' },
          ],
        },
        {
          number: '4.3',
          title: 'LBO model: full mechanics',
          duration: '15 min',
          objectives: [
            'Project a 5-year LBO from entry to exit',
            'Model debt schedule and cash sweep',
            'Compute exit equity and returns',
          ],
          body: [
            { type: 'text', value: 'Full LBO build, year by year:' },
            { type: 'highlight', items: [
              { label: 'Year 0', desc: 'Set up entry: Enterprise Value → Sources & Uses → Initial debt, initial equity. Note entry multiple (EV / EBITDA).' },
              { label: 'Years 1-5', desc: 'Project EBITDA (grow it). Compute interest on opening debt. Compute tax on (EBITDA − D&A − Interest). FCF = EBITDA − Tax − Interest − CapEx − ΔWC. Sweep FCF to repay debt (100% sweep is standard in models).' },
              { label: 'Exit', desc: 'Project Year 5 EBITDA. Apply exit multiple (usually = entry multiple, unless you have a thesis for expansion) → Exit EV. Subtract remaining debt → Exit Equity.' },
              { label: 'Returns', desc: 'MOIC = Exit Equity / Sponsor Equity. IRR = (Exit Equity / Sponsor Equity)^(1/5) − 1. Target 20-25% IRR, 2.5-3.0× MOIC.' },
            ]},
            { type: 'text', value: 'Try it: this site\'s LBO Model page lets you slide each input live and see the IRR/MOIC update immediately, plus a value-creation bridge showing what drove returns.' },
          ],
          sources: [
            { type: 'YouTube', name: 'Wall Street Prep — Complete LBO model build (free YouTube)' },
            { type: 'Course',  name: 'Macabacus — Advanced LBO Modeling' },
            { type: 'Tool',    name: 'This site\'s LBO Model — interactive sandbox' },
          ],
        },
        {
          number: '4.4',
          title: 'Value-creation bridge: where do returns come from?',
          duration: '10 min',
          objectives: [
            'Decompose LBO equity returns into three drivers',
            'Understand the difference between "good" and "lucky" LBOs',
            'Recognize what each driver requires',
          ],
          body: [
            { type: 'text', value: 'A finished LBO has a Y0 equity value and a Y5 equity value. The difference comes from three drivers — and great PE firms know exactly which one they\'re relying on.' },
            { type: 'highlight', items: [
              { label: 'EBITDA growth', desc: 'Grow the company\'s earnings during the hold period. Requires operational improvements: pricing, cost-cutting, sales force expansion, bolt-on acquisitions.' },
              { label: 'Multiple expansion', desc: 'Sell at a higher EV/EBITDA than you bought. Requires market timing or genuine business transformation. Out of your control if it\'s pure market beta.' },
              { label: 'Debt paydown', desc: 'Cash flow during hold period pays down debt → more of the firm\'s value flows to equity. Mechanical, predictable.' },
            ]},
            { type: 'formula', value: 'Equity gain  =  Multiple expansion × Exit EBITDA  +  EBITDA growth × Entry multiple  +  Debt paid down' },
            { type: 'text', value: 'The best LBO firms (KKR, Bain Cap, Thoma Bravo) target operational improvements — they don\'t want returns dependent on multiple expansion they can\'t control. "Mediocre" PE firms over-rely on leverage and rising markets.' },
          ],
          sources: [
            { type: 'Paper',   name: 'Bain & Co. — Annual Global PE Report (free, packed with charts)' },
            { type: 'YouTube', name: 'Damodaran — Private Equity returns and the role of leverage' },
          ],
        },
      ],
    },
  ],
}

const TRACKS = [TRADING_TRACK, MNA_TRACK]

// ──────────────────────────────────────────────────────────
// Render
// ──────────────────────────────────────────────────────────
export default function Courses() {
  const [activeTrackId, setActiveTrackId] = useState('trading')
  const [openLessonId, setOpenLessonId]   = useState(null)
  const activeTrack = TRACKS.find(t => t.id === activeTrackId)

  const totalLessons = activeTrack.courses.reduce((acc, c) => acc + c.lessons.length, 0)
  const totalDuration = activeTrack.courses
    .flatMap(c => c.lessons)
    .reduce((acc, l) => acc + parseInt(l.duration, 10), 0)

  return (
    <div className="space-y-6 max-w-[1100px]">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <GraduationCap size={22} className="text-accent" /> Courses
        </h1>
        <p className="text-sm text-terminal-muted mt-1">
          University-style finance curriculum — inspired by NYU Stern (Damodaran), Wharton, Yale, the CFA program, Wall Street Prep, and the best YouTube finance channels.
        </p>
      </div>

      {/* Track tabs */}
      <div className="flex gap-2">
        {TRACKS.map(track => (
          <button
            key={track.id}
            onClick={() => { setActiveTrackId(track.id); setOpenLessonId(null) }}
            className={`flex-1 sm:flex-initial px-4 py-3 rounded-xl border text-left transition-all ${
              activeTrackId === track.id
                ? 'border-accent/40 bg-accent/10'
                : 'border-terminal-border bg-terminal-panel/40 hover:border-accent/20'
            }`}
            style={activeTrackId === track.id ? { borderColor: track.color + '60', backgroundColor: track.color + '15' } : {}}
          >
            <div className="flex items-center gap-2">
              {track.id === 'trading' ? <BarChart3 size={16} style={{ color: track.color }} /> : <Briefcase size={16} style={{ color: track.color }} />}
              <span className="font-semibold text-sm" style={activeTrackId === track.id ? { color: track.color } : {}}>
                {track.name}
              </span>
            </div>
            <p className="text-[11px] text-terminal-muted mt-1">{track.tagline}</p>
          </button>
        ))}
      </div>

      {/* Stats strip */}
      <div className="flex items-center gap-4 text-xs text-terminal-muted">
        <span>{activeTrack.courses.length} courses</span>
        <span>·</span>
        <span>{totalLessons} lessons</span>
        <span>·</span>
        <span>~{totalDuration} min total</span>
      </div>

      {/* Courses */}
      <div className="space-y-6">
        {activeTrack.courses.map(course => (
          <CourseBlock
            key={course.number}
            course={course}
            trackColor={activeTrack.color}
            openLessonId={openLessonId}
            setOpenLessonId={setOpenLessonId}
          />
        ))}
      </div>
    </div>
  )
}

function CourseBlock({ course, trackColor, openLessonId, setOpenLessonId }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-sm shrink-0"
          style={{ backgroundColor: trackColor + '20', color: trackColor }}>
          {course.number}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold truncate">Course {course.number} — {course.title}</h2>
          <p className="text-xs text-terminal-muted">{course.summary}</p>
        </div>
      </div>
      <div className="space-y-2 pl-11">
        {course.lessons.map(lesson => (
          <LessonCard
            key={lesson.number}
            lesson={lesson}
            trackColor={trackColor}
            isOpen={openLessonId === lesson.number}
            onToggle={() => setOpenLessonId(openLessonId === lesson.number ? null : lesson.number)}
          />
        ))}
      </div>
    </div>
  )
}

function LessonCard({ lesson, trackColor, isOpen, onToggle }) {
  return (
    <div className={`panel transition-all overflow-hidden ${isOpen ? '' : 'hover:border-accent/20'}`}
      style={isOpen ? { borderColor: trackColor + '50' } : {}}>
      <button onClick={onToggle} className="w-full text-left p-4 flex items-center gap-4">
        <span className="font-mono font-bold text-sm shrink-0 w-10" style={{ color: trackColor }}>
          {lesson.number}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">{lesson.title}</p>
          <p className="text-xs text-terminal-muted mt-0.5 flex items-center gap-1.5">
            <Clock size={11} /> {lesson.duration}
          </p>
        </div>
        {isOpen ? <ChevronUp size={16} className="text-terminal-muted" /> : <ChevronDown size={16} className="text-terminal-muted" />}
      </button>

      {isOpen && (
        <div className="px-4 pb-5 space-y-5">
          {/* Objectives */}
          <div className="pl-14">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: trackColor }}>
              <Target size={12} /> Learning Objectives
            </h3>
            <ul className="space-y-1.5">
              {lesson.objectives.map((o, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-terminal-text/85">
                  <CheckCircle2 size={13} className="mt-0.5 shrink-0" style={{ color: trackColor }} />
                  {o}
                </li>
              ))}
            </ul>
          </div>

          {/* Body */}
          <div className="pl-14">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: trackColor }}>
              <BookOpen size={12} /> Lesson
            </h3>
            <div className="space-y-3">
              {lesson.body.map((block, bi) => renderBlock(block, bi, trackColor))}
            </div>
          </div>

          {/* Sources */}
          <div className="pl-14">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: trackColor }}>
              <FileText size={12} /> Further Reading
            </h3>
            <div className="space-y-1.5">
              {lesson.sources.map((s, si) => {
                const Icon = s.type === 'YouTube' ? Youtube : s.type === 'Book' ? BookOpen : s.type === 'Course' ? GraduationCap : s.type === 'Tool' ? ArrowRight : FileText
                return (
                  <div key={si} className="flex items-start gap-2 text-xs text-terminal-text/75">
                    <Icon size={12} className="mt-0.5 shrink-0 text-terminal-muted" />
                    <span><span className="font-semibold text-terminal-muted">{s.type}:</span> {s.name}</span>
                  </div>
                )
              })}
            </div>
          </div>
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
  return null
}
