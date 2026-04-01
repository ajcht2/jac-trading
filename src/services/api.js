const BASE = '/api/market'

export async function fetchChart(symbol, range = '1mo', interval = '1d') {
  const res = await fetch(`${BASE}?symbol=${encodeURIComponent(symbol)}&range=${range}&interval=${interval}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Failed to fetch chart: ${res.status}`)
  }
  const data = await res.json()
  return data
}

export async function fetchQuote(symbol) {
  const res = await fetch(`${BASE}?symbol=${encodeURIComponent(symbol)}&action=quote`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Failed to fetch quote: ${res.status}`)
  }
  const data = await res.json()
  if (!data || data.error) throw new Error(data?.error || 'Invalid quote data')
  return data
}

export async function searchTickers(query) {
  const res = await fetch(`${BASE}?q=${encodeURIComponent(query)}&action=search`)
  if (!res.ok) throw new Error(`Search failed: ${res.status}`)
  const data = await res.json()
  return data
}

// Map range to appropriate interval
export function getInterval(range) {
  const map = {
    '1d': '5m',
    '5d': '15m',
    '1mo': '1d',
    '3mo': '1d',
    '6mo': '1d',
    '1y': '1wk',
    '5y': '1mo',
    'max': '1mo',
  }
  return map[range] || '1d'
}

// Format large numbers
export function formatNumber(n) {
  if (n == null) return '—'
  if (Math.abs(n) >= 1e12) return (n / 1e12).toFixed(2) + 'T'
  if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(2) + 'B'
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(2) + 'M'
  if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(2) + 'K'
  return n.toFixed(2)
}

export function formatPrice(n) {
  if (n == null) return '—'
  // More decimals for cheap assets (crypto like XRP, ADA, DOGE)
  if (Math.abs(n) < 0.01) return n.toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 })
  if (Math.abs(n) < 1) return n.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })
  if (Math.abs(n) < 10) return n.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function formatPercent(n) {
  if (n == null) return '—'
  const sign = n >= 0 ? '+' : ''
  return sign + n.toFixed(2) + '%'
}
