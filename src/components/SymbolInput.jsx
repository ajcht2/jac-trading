import { useState, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { searchTickers } from '../services/api'

export default function SymbolInput({ value, onChange, placeholder = 'Search ticker...' }) {
  const [query, setQuery] = useState(value || '')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const containerRef = useRef(null)
  const debounceRef = useRef(null)

  // Sync external value
  useEffect(() => {
    setQuery(value || '')
  }, [value])

  // Search with debounce
  useEffect(() => {
    if (!query.trim() || query === value) {
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
    setQuery(symbol)
    onChange(symbol)
    setOpen(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !open) {
      // Submit current text as-is
      onChange(query.toUpperCase())
      return
    }
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

  const handleBlur = () => {
    // Small delay to allow click on results
    setTimeout(() => {
      if (query && !open) {
        onChange(query.toUpperCase())
      }
    }, 200)
  }

  const typeIcons = {
    EQUITY: '📈', ETF: '📊', CRYPTOCURRENCY: '🪙',
    CURRENCY: '💱', INDEX: '📉', MUTUALFUND: '🏦', FUTURE: '⏳',
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-terminal-muted" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
          onFocus={() => query && results.length && setOpen(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full bg-terminal-bg border border-terminal-border rounded-xl pl-9 pr-8 py-2.5 font-mono text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); onChange(''); setOpen(false) }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-terminal-muted hover:text-terminal-text"
          >
            <X size={12} />
          </button>
        )}
        {loading && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2">
            <div className="w-3 h-3 border border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-terminal-panel border border-terminal-border rounded-xl shadow-2xl z-50 overflow-hidden max-h-[200px] overflow-y-auto">
          {results.map((r, i) => (
            <button
              key={r.symbol}
              onClick={() => handleSelect(r.symbol)}
              onMouseEnter={() => setSelectedIndex(i)}
              className={`flex items-center gap-2 w-full text-left px-3 py-2 text-sm transition-colors ${
                i === selectedIndex ? 'bg-accent/10' : 'hover:bg-white/5'
              }`}
            >
              <span className="text-sm">{typeIcons[r.type] || '📄'}</span>
              <span className="font-mono font-semibold text-xs">{r.symbol}</span>
              <span className="text-xs text-terminal-muted truncate flex-1">{r.name}</span>
              <span className="text-[10px] text-terminal-muted font-mono">{r.exchange}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
