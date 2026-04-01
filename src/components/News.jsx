import { useState, useEffect } from 'react'
import { Newspaper, ExternalLink, RefreshCw, Globe, TrendingUp, Bitcoin, Building2, Landmark, Fuel, Flag } from 'lucide-react'

const CATEGORY_CONFIG = {
  Markets: { icon: TrendingUp, color: '#3b82f6', bg: '#3b82f610' },
  'US Economy': { icon: Landmark, color: '#6366f1', bg: '#6366f110' },
  Europe: { icon: Globe, color: '#10b981', bg: '#10b98110' },
  Crypto: { icon: Bitcoin, color: '#f59e0b', bg: '#f59e0b10' },
  Companies: { icon: Building2, color: '#8b5cf6', bg: '#8b5cf610' },
  Asia: { icon: Globe, color: '#ef4444', bg: '#ef444410' },
  Commodities: { icon: Fuel, color: '#f97316', bg: '#f9731610' },
  Geopolitics: { icon: Flag, color: '#ec4899', bg: '#ec489910' },
}

const ALL_CATEGORIES = ['All', ...Object.keys(CATEGORY_CONFIG)]

export default function News() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [lastUpdate, setLastUpdate] = useState(null)

  const fetchNews = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/news')
      if (res.ok) {
        const data = await res.json()
        setArticles(data.articles || [])
        setLastUpdate(new Date())
      }
    } catch (err) {
      console.error('Failed to fetch news:', err)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchNews()
  }, [])

  const filtered = filter === 'All' ? articles : articles.filter(a => a.category === filter)

  const timeAgo = (dateStr) => {
    if (!dateStr) return ''
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  return (
    <div className="space-y-5 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Newspaper size={22} className="text-accent" /> Financial News
          </h1>
          <p className="text-sm text-terminal-muted mt-1">Latest from global markets, crypto, and geopolitics</p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdate && (
            <span className="text-xs text-terminal-muted font-mono">
              {lastUpdate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button onClick={fetchNews} disabled={loading}
            className="px-3 py-2 rounded-xl border border-terminal-border text-terminal-muted hover:text-accent hover:border-accent/30 transition-all text-sm flex items-center gap-2"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {ALL_CATEGORIES.map(cat => {
          const config = CATEGORY_CONFIG[cat]
          const isActive = filter === cat
          return (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'text-white'
                  : 'bg-terminal-panel border border-terminal-border text-terminal-muted hover:text-terminal-text'
              }`}
              style={isActive ? { backgroundColor: config?.color || '#3b82f6' } : {}}
            >
              {config && <config.icon size={12} />}
              {cat}
            </button>
          )
        })}
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="panel p-5 animate-pulse">
              <div className="h-3 bg-terminal-border rounded w-20 mb-3" />
              <div className="h-4 bg-terminal-border rounded w-full mb-2" />
              <div className="h-4 bg-terminal-border rounded w-3/4 mb-4" />
              <div className="h-3 bg-terminal-border rounded w-32" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="panel p-12 text-center text-terminal-muted">
          <Newspaper size={40} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">No articles found for this category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((article, i) => {
            const config = CATEGORY_CONFIG[article.category] || CATEGORY_CONFIG.Markets
            const CatIcon = config.icon

            return (
              <a
                key={i}
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="panel p-5 hover:border-terminal-muted/50 transition-all group cursor-pointer flex flex-col"
              >
                {/* Category + Time */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider"
                    style={{ backgroundColor: config.bg, color: config.color }}
                  >
                    <CatIcon size={10} />
                    {article.category}
                  </div>
                  <span className="text-[10px] text-terminal-muted font-mono">{timeAgo(article.publishedAt)}</span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-semibold leading-snug text-terminal-text group-hover:text-accent transition-colors flex-1 mb-3 line-clamp-3">
                  {article.title}
                </h3>

                {/* Source + Link */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-terminal-border/50">
                  <span className="text-xs text-terminal-muted font-medium">{article.source}</span>
                  <ExternalLink size={12} className="text-terminal-muted group-hover:text-accent transition-colors" />
                </div>
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
