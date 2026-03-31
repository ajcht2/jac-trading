import { useState, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { searchTickers } from '../services/api'

export default function TickerSearch({ onSelect, currentSymbol }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)
  const containerRef = useRef(null)
  const debounceRef = useRef(null)

  // Search with debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setOpen(false)
      return
    }

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await searchTickers(query)
        setResults(data.results || [])
        setOpen(true)
        setSelectedIndex(0)
      } catch (err) {
        console.error('Search error:', err)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(debounceRef.current)
  }, [query])

  // Click outside to close
  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSelect = (symbol) => {
    onSelect(symbol)
    setQuery('')
    setOpen(false)
    inputRef.current?.blur()
  }

  const handleKeyDown = (e) => {
    if (!open || !results.length) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      handleSelect(results[selectedIndex].symbol)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const typeIcons = {
    EQUITY: '📈',
    ETF: '📊',
    CRYPTOCURRENCY: '🪙',
    CURRENCY: '💱',
    INDEX: '📉',
    MUTUALFUND: '🏦',
    FUTURE: '⏳',
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-lg">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-terminal-muted" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query && results.length && setOpen(true)}
          placeholder={`Search ticker... (viewing ${currentSymbol})`}
          className="w-full bg-terminal-panel border border-terminal-border rounded-xl pl-10 pr-10 py-2.5 text-sm font-mono text-terminal-text placeholder:text-terminal-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setOpen(false) }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-terminal-muted hover:text-terminal-text"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full mt-1 w-full bg-terminal-panel border border-terminal-border rounded-xl shadow-2xl z-50 overflow-hidden">
          {loading ? (
            <div className="p-4 text-center text-sm text-terminal-muted">
              Searching...
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-sm text-terminal-muted">
              No results found
            </div>
          ) : (
            <ul>
              {results.map((r, i) => (
                <li
                  key={r.symbol}
                  onClick={() => handleSelect(r.symbol)}
                  onMouseEnter={() => setSelectedIndex(i)}
                  className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                    i === selectedIndex ? 'bg-accent/10' : 'hover:bg-white/5'
                  }`}
                >
                  <span className="text-base">{typeIcons[r.type] || '📄'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-sm">{r.symbol}</span>
                      <span className="text-xs text-terminal-muted truncate">{r.name}</span>
                    </div>
                  </div>
                  <span className="text-xs text-terminal-muted font-mono">{r.exchange}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
