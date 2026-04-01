// Vercel Serverless Function — Financial News via Google News RSS
// No API key needed, very reliable

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')
  res.setHeader('Cache-Control', 's-maxage=300')

  try {
    const feeds = [
      { query: 'stock market Wall Street', category: 'Markets', categoryId: 'markets' },
      { query: 'Federal Reserve US economy inflation', category: 'US Economy', categoryId: 'us' },
      { query: 'European Central Bank eurozone economy', category: 'Europe', categoryId: 'europe' },
      { query: 'bitcoin cryptocurrency ethereum', category: 'Crypto', categoryId: 'crypto' },
      { query: 'Apple Google Tesla earnings tech', category: 'Companies', categoryId: 'companies' },
      { query: 'China Japan Asia Pacific markets', category: 'Asia', categoryId: 'asia' },
      { query: 'oil gold commodities prices energy', category: 'Commodities', categoryId: 'commodities' },
      { query: 'trade sanctions geopolitics tariffs', category: 'Geopolitics', categoryId: 'geopolitics' },
    ]

    const allArticles = []

    const results = await Promise.allSettled(
      feeds.map(async (feed) => {
        const url = `https://news.google.com/rss/search?q=${encodeURIComponent(feed.query + ' when:3d')}&hl=en&gl=US&ceid=US:en`
        const r = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
        })
        if (!r.ok) return []

        const xml = await r.text()
        const items = parseRSS(xml)

        return items.slice(0, 10).map(item => ({
          title: item.title,
          link: item.link,
          source: item.source || 'Google News',
          publishedAt: item.pubDate || null,
          category: feed.category,
          categoryId: feed.categoryId,
        }))
      })
    )

    results.forEach(r => {
      if (r.status === 'fulfilled' && Array.isArray(r.value)) {
        allArticles.push(...r.value)
      }
    })

    // Deduplicate by title
    const seen = new Set()
    const unique = allArticles.filter(a => {
      if (!a.title || seen.has(a.title)) return false
      seen.add(a.title)
      return true
    })

    return res.status(200).json({ articles: unique })
  } catch (error) {
    console.error('News error:', error)
    return res.status(500).json({ error: 'Failed to fetch news', articles: [] })
  }
}

// Simple RSS XML parser — no dependencies needed
function parseRSS(xml) {
  const items = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1]
    const title = extractTag(itemXml, 'title')
    const link = extractTag(itemXml, 'link')
    const pubDate = extractTag(itemXml, 'pubDate')
    const source = extractTag(itemXml, 'source')

    if (title && link) {
      items.push({
        title: decodeHTMLEntities(title),
        link,
        pubDate: pubDate || null,
        source: source ? decodeHTMLEntities(source) : null,
      })
    }
  }

  return items
}

function extractTag(xml, tag) {
  // Try CDATA first
  const cdataRegex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`)
  const cdataMatch = xml.match(cdataRegex)
  if (cdataMatch) return cdataMatch[1].trim()

  // Try regular tag
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`)
  const m = xml.match(regex)
  return m ? m[1].trim() : null
}

function decodeHTMLEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
}
