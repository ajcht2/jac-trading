// Vercel Serverless Function — Yahoo Finance proxy
// Uses multiple endpoints for maximum reliability + market cap

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')
  res.setHeader('Cache-Control', 'no-cache, no-store')

  const { symbol, action, range, interval, q } = req.query

  try {
    if (action === 'search' && q) return await handleSearch(q, res)
    if (!symbol) return res.status(400).json({ error: 'Missing symbol parameter' })
    if (action === 'quote') return await handleQuote(symbol, res)
    return await handleChart(symbol, range || '1mo', interval || '1d', res)
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: error.message })
  }
}

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Accept': 'application/json',
}

async function yf(url) {
  return fetch(url, { headers: HEADERS })
}

// ── Chart ──────────────────────────────
async function handleChart(symbol, range, interval, res) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}&includePrePost=false`
  const response = await yf(url)
  if (!response.ok) return res.status(response.status).json({ error: `Yahoo returned ${response.status}` })

  const data = await response.json()
  const result = data.chart?.result?.[0]
  if (!result) return res.status(404).json({ error: 'No data found' })

  const timestamps = result.timestamp || []
  const q = result.indicators?.quote?.[0] || {}
  const meta = result.meta || {}

  const candles = []
  for (let i = 0; i < timestamps.length; i++) {
    const o = q.open?.[i], h = q.high?.[i], l = q.low?.[i], c = q.close?.[i], v = q.volume?.[i]
    if (o != null && c != null && h != null && l != null)
      candles.push({ time: timestamps[i], open: o, high: h, low: l, close: c, volume: v || 0 })
  }

  return res.status(200).json({
    symbol: meta.symbol, currency: meta.currency,
    exchangeName: meta.exchangeName, instrumentType: meta.instrumentType,
    regularMarketPrice: meta.regularMarketPrice,
    previousClose: meta.previousClose || meta.chartPreviousClose,
    candles,
  })
}

// ── Quote — tries 3 endpoints for best data ──────────────────────────────
async function handleQuote(symbol, res) {
  const encoded = encodeURIComponent(symbol)

  // Strategy: run all endpoints in parallel, merge best data
  const [chartResult, summaryResult, quoteResult] = await Promise.allSettled([
    fetchChartQuote(encoded),
    fetchQuoteSummary(encoded),
    fetchV7Quote(encoded),
  ])

  const chart = chartResult.status === 'fulfilled' ? chartResult.value : null
  const summary = summaryResult.status === 'fulfilled' ? summaryResult.value : null
  const v7 = quoteResult.status === 'fulfilled' ? quoteResult.value : null

  // Must have at least chart data
  if (!chart) {
    return res.status(404).json({ error: 'Symbol not found or API unavailable' })
  }

  // Merge: prefer v7 > summary > chart for each field
  const price = v7?.price ?? chart.price
  const prevClose = v7?.previousClose ?? chart.previousClose
  const change = price - prevClose
  const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0

  return res.status(200).json({
    symbol: chart.symbol || symbol,
    name: v7?.name ?? summary?.name ?? chart.name ?? symbol,
    price,
    previousClose: prevClose,
    change,
    changePercent,
    open: v7?.open ?? chart.open,
    high: v7?.high ?? chart.high,
    low: v7?.low ?? chart.low,
    volume: v7?.volume ?? chart.volume,
    marketCap: v7?.marketCap ?? summary?.marketCap ?? null,
    fiftyTwoWeekHigh: v7?.fiftyTwoWeekHigh ?? summary?.fiftyTwoWeekHigh ?? chart.fiftyTwoWeekHigh,
    fiftyTwoWeekLow: v7?.fiftyTwoWeekLow ?? summary?.fiftyTwoWeekLow ?? chart.fiftyTwoWeekLow,
    currency: chart.currency,
    exchange: chart.exchange,
    type: chart.type,
    marketState: v7?.marketState ?? chart.marketState,
  })
}

// Endpoint 1: v8 chart — always works, has price but no market cap
async function fetchChartQuote(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=2d&interval=1d&includePrePost=false`
  const r = await yf(url)
  if (!r.ok) throw new Error('chart failed')

  const data = await r.json()
  const result = data.chart?.result?.[0]
  if (!result) throw new Error('no result')

  const meta = result.meta || {}
  const ts = result.timestamp || []
  const q = result.indicators?.quote?.[0] || {}
  const lastIdx = ts.length - 1

  // Also try to get 52-week from 1y data
  let fiftyTwoWeekHigh = null, fiftyTwoWeekLow = null
  try {
    const yr = await yf(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1y&interval=1mo`)
    if (yr.ok) {
      const yd = await yr.json()
      const yq = yd.chart?.result?.[0]?.indicators?.quote?.[0] || {}
      const highs = (yq.high || []).filter(v => v != null)
      const lows = (yq.low || []).filter(v => v != null)
      if (highs.length) fiftyTwoWeekHigh = Math.max(...highs)
      if (lows.length) fiftyTwoWeekLow = Math.min(...lows)
    }
  } catch {}

  return {
    symbol: meta.symbol,
    name: meta.shortName || meta.longName || meta.symbol,
    price: meta.regularMarketPrice,
    previousClose: meta.previousClose || meta.chartPreviousClose,
    open: lastIdx >= 0 ? q.open?.[lastIdx] : null,
    high: lastIdx >= 0 ? q.high?.[lastIdx] : null,
    low: lastIdx >= 0 ? q.low?.[lastIdx] : null,
    volume: lastIdx >= 0 ? q.volume?.[lastIdx] : null,
    currency: meta.currency,
    exchange: meta.exchangeName,
    type: meta.instrumentType,
    marketState: meta.marketState,
    fiftyTwoWeekHigh,
    fiftyTwoWeekLow,
  }
}

// Endpoint 2: v10 quoteSummary — has market cap + 52-week
async function fetchQuoteSummary(symbol) {
  const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=price,summaryDetail`
  const r = await yf(url)
  if (!r.ok) throw new Error('summary failed')

  const data = await r.json()
  const price = data.quoteSummary?.result?.[0]?.price
  const detail = data.quoteSummary?.result?.[0]?.summaryDetail

  return {
    name: price?.shortName || price?.longName || null,
    marketCap: price?.marketCap?.raw || null,
    fiftyTwoWeekHigh: detail?.fiftyTwoWeekHigh?.raw || null,
    fiftyTwoWeekLow: detail?.fiftyTwoWeekLow?.raw || null,
  }
}

// Endpoint 3: v7 quote — has everything including market cap + real-time
async function fetchV7Quote(symbol) {
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`
  const r = await yf(url)
  if (!r.ok) throw new Error('v7 failed')

  const data = await r.json()
  const q = data.quoteResponse?.result?.[0]
  if (!q) throw new Error('no v7 result')

  return {
    name: q.shortName || q.longName,
    price: q.regularMarketPrice,
    previousClose: q.regularMarketPreviousClose,
    open: q.regularMarketOpen,
    high: q.regularMarketDayHigh,
    low: q.regularMarketDayLow,
    volume: q.regularMarketVolume,
    marketCap: q.marketCap || null,
    fiftyTwoWeekHigh: q.fiftyTwoWeekHigh,
    fiftyTwoWeekLow: q.fiftyTwoWeekLow,
    marketState: q.marketState,
  }
}

// ── Search ──────────────────────────────
async function handleSearch(query, res) {
  const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`
  const response = await yf(url)
  if (!response.ok) return res.status(response.status).json({ error: 'Search failed' })

  const data = await response.json()
  const quotes = (data.quotes || []).map(q => ({
    symbol: q.symbol,
    name: q.shortname || q.longname || q.symbol,
    type: q.quoteType,
    exchange: q.exchange,
  }))

  return res.status(200).json({ results: quotes })
}
