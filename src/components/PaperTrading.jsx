import { useState, useEffect, useRef } from 'react'
import { ArrowUpCircle, ArrowDownCircle, Wallet, History, TrendingUp, TrendingDown, Loader2, ChevronDown } from 'lucide-react'
import { usePortfolio } from '../context/PortfolioContext'
import { usePrices } from '../context/PriceContext'
import { fetchQuote, formatPrice, formatPercent } from '../services/api'
import SymbolInput from './SymbolInput'

export default function PaperTrading() {
  return (
    <div className="space-y-4 max-w-[1400px]">
      <h1 className="text-xl font-bold flex items-center gap-2">
        <Wallet size={22} className="text-accent" />
        Paper Trading
      </h1>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-1"><TradeForm /></div>
        <div className="xl:col-span-2"><Positions /></div>
      </div>
      <TransactionHistory />
    </div>
  )
}

function TradeForm() {
  const { state, dispatch } = usePortfolio()
  const { watchPriority } = usePrices()
  const [symbol, setSymbol] = useState('')
  const [qty, setQty] = useState('')
  const [side, setSide] = useState('BUY')
  const [quote, setQuote] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showOwnedDropdown, setShowOwnedDropdown] = useState(false)
  const [countdown, setCountdown] = useState(0) // 10s countdown before execution
  const [pendingOrder, setPendingOrder] = useState(null) // { side, symbol, qty }
  const dropdownRef = useRef(null)
  const countdownRef = useRef(null)

  const ownedSymbols = Object.keys(state.positions)

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowOwnedDropdown(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Fetch quote when symbol changes
  useEffect(() => {
    if (!symbol || symbol.length < 1) { setQuote(null); return }
    setLoading(true)
    setError('')
    const timer = setTimeout(async () => {
      try {
        const data = await fetchQuote(symbol)
        if (data && data.price) { setQuote(data); setError('') }
        else { setQuote(null); setError('Could not get price') }
      } catch { setQuote(null); setError('Symbol not found') }
      finally { setLoading(false) }
    }, 400)
    return () => { clearTimeout(timer); setLoading(false) }
  }, [symbol])

  // When switching to SELL, auto-select first owned stock
  useEffect(() => {
    if (side === 'SELL' && ownedSymbols.length > 0 && !ownedSymbols.includes(symbol)) {
      setSymbol(ownedSymbols[0])
    }
  }, [side])

  const handleSubmit = () => {
    if (!quote || !quote.price) { setError('Wait for price to load'); return }
    if (!qty || Number(qty) <= 0 || !Number.isInteger(Number(qty))) { setError('Enter a valid whole number'); return }

    const quantity = Number(qty)
    const sym = symbol.toUpperCase()

    // Pre-validate before starting countdown
    if (side === 'BUY') {
      const total = quantity * quote.price
      if (total > state.cash) { setError(`Insufficient funds. Need $${formatPrice(total)}`); return }
    } else {
      const pos = state.positions[sym]
      if (!pos || pos.qty < quantity) { setError(`You only own ${pos?.qty || 0} shares`); return }
    }

    // Start 10s countdown
    setError('')
    setPendingOrder({ side, symbol: sym, qty: quantity })
    setCountdown(10)

    if (countdownRef.current) clearInterval(countdownRef.current)
    countdownRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(countdownRef.current)
          countdownRef.current = null
          // Execute after countdown
          executeOrder(side, sym, quantity)
          return 0
        }
        return c - 1
      })
    }, 1000)
  }

  const cancelOrder = () => {
    if (countdownRef.current) clearInterval(countdownRef.current)
    countdownRef.current = null
    setCountdown(0)
    setPendingOrder(null)
  }

  const executeOrder = async (orderSide, sym, quantity) => {
    // Fetch the FRESHEST price right now
    try {
      const freshQuote = await fetchQuote(sym)
      const freshPrice = freshQuote.price

      if (orderSide === 'BUY') {
        const total = quantity * freshPrice
        if (total > state.cash) {
          setError(`Price changed — insufficient funds. Need $${formatPrice(total)}`)
          setPendingOrder(null)
          return
        }
        dispatch({ type: 'BUY', payload: { symbol: sym, qty: quantity, price: freshPrice } })
        watchPriority([sym])
      } else {
        const pos = state.positions[sym]
        if (!pos || pos.qty < quantity) {
          setError(`Position changed — you only own ${pos?.qty || 0} shares`)
          setPendingOrder(null)
          return
        }
        dispatch({ type: 'SELL', payload: { symbol: sym, qty: quantity, price: freshPrice } })
      }

      setSuccess(`${orderSide === 'BUY' ? 'Bought' : 'Sold'} ${quantity} ${sym} @ $${formatPrice(freshPrice)} (live price)`)
      setError('')
      setQty('')
      setPendingOrder(null)
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError('Failed to fetch live price. Try again.')
      setPendingOrder(null)
    }
  }

  const total = quote && qty ? Number(qty) * quote.price : 0
  const maxBuyQty = quote ? Math.floor(state.cash / quote.price) : 0
  const maxSellQty = state.positions[symbol.toUpperCase()]?.qty || 0

  return (
    <div className="panel p-5 space-y-4">
      <h3 className="font-semibold text-sm uppercase tracking-wider text-terminal-muted">Place Order</h3>

      <div className="flex rounded-xl overflow-hidden border border-terminal-border">
        <button onClick={() => setSide('BUY')}
          className={`flex-1 py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            side === 'BUY' ? 'bg-gain/20 text-gain' : 'text-terminal-muted hover:text-terminal-text'
          }`}
        ><ArrowUpCircle size={16} /> Buy</button>
        <button onClick={() => setSide('SELL')}
          className={`flex-1 py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            side === 'SELL' ? 'bg-loss/20 text-loss' : 'text-terminal-muted hover:text-terminal-text'
          }`}
        ><ArrowDownCircle size={16} /> Sell</button>
      </div>

      <div>
        <label className="text-xs text-terminal-muted uppercase tracking-wider">Symbol</label>
        {side === 'SELL' ? (
          <div className="mt-1 relative" ref={dropdownRef}>
            {ownedSymbols.length === 0 ? (
              <div className="w-full bg-terminal-bg border border-terminal-border rounded-xl px-3 py-2.5 text-sm text-terminal-muted">
                No stocks to sell — buy something first
              </div>
            ) : (
              <>
                <button onClick={() => setShowOwnedDropdown(!showOwnedDropdown)}
                  className="w-full bg-terminal-bg border border-terminal-border rounded-xl px-3 py-2.5 text-sm font-mono text-left flex items-center justify-between focus:outline-none focus:border-accent/50"
                >
                  <span>{symbol ? (
                    <span className="flex items-center gap-2">
                      <span className="font-semibold">{symbol}</span>
                      <span className="text-terminal-muted text-xs">({state.positions[symbol]?.qty || 0} shares)</span>
                    </span>
                  ) : 'Select a stock...'}</span>
                  <ChevronDown size={14} className="text-terminal-muted" />
                </button>
                {showOwnedDropdown && (
                  <div className="absolute top-full mt-1 w-full bg-terminal-panel border border-terminal-border rounded-xl shadow-2xl z-50 overflow-hidden">
                    {ownedSymbols.map(sym => (
                      <button key={sym} onClick={() => { setSymbol(sym); setShowOwnedDropdown(false) }}
                        className={`w-full text-left px-3 py-2.5 text-sm flex items-center justify-between transition-colors hover:bg-white/5 ${symbol === sym ? 'bg-accent/10' : ''}`}
                      >
                        <span className="font-mono font-semibold">{sym}</span>
                        <span className="text-xs text-terminal-muted">{state.positions[sym].qty} shares • avg ${formatPrice(state.positions[sym].avgCost)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="mt-1">
            <SymbolInput value={symbol} onChange={setSymbol} placeholder="Search stock... (e.g. Apple, TSLA)" />
          </div>
        )}
        {loading && <div className="mt-2 flex items-center gap-2 text-xs text-terminal-muted"><Loader2 size={12} className="animate-spin" /> Fetching price...</div>}
        {quote && !loading && (
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className="text-terminal-muted">{quote.name || quote.symbol}</span>
            <span className="font-mono font-semibold">${formatPrice(quote.price)}</span>
            {quote.changePercent != null && (
              <span className={quote.change >= 0 ? 'text-gain' : 'text-loss'}>{formatPercent(quote.changePercent)}</span>
            )}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="text-xs text-terminal-muted uppercase tracking-wider">Quantity</label>
          {quote && <button onClick={() => setQty(String(side === 'BUY' ? maxBuyQty : maxSellQty))} className="text-xs text-accent hover:underline">Max: {side === 'BUY' ? maxBuyQty : maxSellQty}</button>}
        </div>
        <input type="number" min="1" step="1" value={qty} onChange={e => setQty(e.target.value)} placeholder="0"
          className="w-full mt-1 bg-terminal-bg border border-terminal-border rounded-xl px-3 py-2.5 font-mono text-sm focus:outline-none focus:border-accent/50" />
      </div>

      {total > 0 && quote && (
        <div className="bg-terminal-bg rounded-xl p-3 space-y-1">
          <div className="flex justify-between text-xs text-terminal-muted"><span>Price</span><span className="font-mono">${formatPrice(quote.price)}</span></div>
          <div className="flex justify-between text-xs text-terminal-muted"><span>Quantity</span><span className="font-mono">{qty}</span></div>
          <div className="flex justify-between text-sm font-semibold pt-1 border-t border-terminal-border"><span>Total</span><span className="font-mono">${formatPrice(total)}</span></div>
          {side === 'BUY' && <div className="flex justify-between text-xs text-terminal-muted pt-1"><span>Remaining Cash</span><span className="font-mono">${formatPrice(state.cash - total)}</span></div>}
          {side === 'SELL' && state.positions[symbol.toUpperCase()] && (() => {
            const pos = state.positions[symbol.toUpperCase()]
            const pnl = (quote.price - pos.avgCost) * Number(qty)
            return <div className="flex justify-between text-xs text-terminal-muted pt-1">
              <span>P&L on this trade</span>
              <span className={`font-mono font-semibold ${pnl >= 0 ? 'text-gain' : 'text-loss'}`}>{pnl >= 0 ? '+' : ''}${formatPrice(pnl)}</span>
            </div>
          })()}
        </div>
      )}

      {error && <p className="text-xs text-loss bg-loss/10 rounded-xl p-2">{error}</p>}
      {success && <p className="text-xs text-gain bg-gain/10 rounded-xl p-2">{success}</p>}

      {/* Countdown Timer */}
      {countdown > 0 && pendingOrder && (
        <div className="bg-terminal-bg rounded-xl p-4 text-center space-y-3 border border-accent/30">
          <p className="text-xs text-terminal-muted uppercase tracking-wider">Order executing in</p>
          <p className="text-4xl font-mono font-bold text-accent">{countdown}s</p>
          <p className="text-xs text-terminal-muted">
            {pendingOrder.side} {pendingOrder.qty} {pendingOrder.symbol} at live market price
          </p>
          <div className="w-full bg-terminal-border rounded-full h-1.5">
            <div className="bg-accent h-1.5 rounded-full transition-all duration-1000" style={{ width: `${(1 - countdown / 10) * 100}%` }} />
          </div>
          <button onClick={cancelOrder} className="text-xs text-loss hover:underline">Cancel order</button>
        </div>
      )}

      {countdown === 0 && (
        <button onClick={handleSubmit} disabled={!quote || !qty || loading || pendingOrder}
          className={`w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
            side === 'BUY' ? 'bg-gain hover:bg-gain/90 text-white' : 'bg-loss hover:bg-loss/90 text-white'
          }`}
        >{side === 'BUY' ? 'Buy' : 'Sell'} {symbol || '...'}</button>
      )}
    </div>
  )
}

function Positions() {
  const { state } = usePortfolio()
  const { prices, watchPriority, lastUpdate } = usePrices()
  const symbols = Object.keys(state.positions)

  // Register all position symbols as HIGH PRIORITY (3s refresh)
  useEffect(() => {
    if (symbols.length > 0) watchPriority(symbols)
  }, [symbols.join(','), watchPriority])

  if (symbols.length === 0) {
    return (
      <div className="panel p-8 flex flex-col items-center justify-center text-terminal-muted h-full min-h-[300px]">
        <Wallet size={40} className="mb-3 opacity-30" />
        <p className="text-sm">No positions yet</p>
        <p className="text-xs mt-1">Search for a stock and place your first trade</p>
      </div>
    )
  }

  const totalPnl = symbols.reduce((sum, sym) => {
    const pos = state.positions[sym]
    const price = prices[sym]?.price || pos.avgCost
    return sum + (price - pos.avgCost) * pos.qty
  }, 0)

  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-terminal-muted">Open Positions ({symbols.length})</h3>
          <span className={`text-sm font-mono font-semibold ${totalPnl >= 0 ? 'text-gain' : 'text-loss'}`}>
            Total P&L: {totalPnl >= 0 ? '+' : ''}${formatPrice(totalPnl)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-gain animate-pulse" />
          <span className="text-[10px] text-terminal-muted font-mono">LIVE</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-terminal-muted uppercase tracking-wider border-b border-terminal-border">
              <th className="text-left py-2 px-2">Symbol</th>
              <th className="text-right py-2 px-2">Qty</th>
              <th className="text-right py-2 px-2">Avg Cost</th>
              <th className="text-right py-2 px-2">Live Price</th>
              <th className="text-right py-2 px-2">P&L</th>
              <th className="text-right py-2 px-2">P&L %</th>
              <th className="text-right py-2 px-2">Value</th>
            </tr>
          </thead>
          <tbody>
            {symbols.map(sym => {
              const pos = state.positions[sym]
              const currentPrice = prices[sym]?.price || pos.avgCost
              const hasLivePrice = prices[sym]?.price != null
              const value = pos.qty * currentPrice
              const pnl = (currentPrice - pos.avgCost) * pos.qty
              const pnlPct = ((currentPrice - pos.avgCost) / pos.avgCost) * 100
              const isPositive = pnl >= 0
              return (
                <tr key={sym} className="border-b border-terminal-border/50 hover:bg-white/[0.02]">
                  <td className="py-3 px-2 font-mono font-semibold">{sym}</td>
                  <td className="py-3 px-2 text-right font-mono">{pos.qty}</td>
                  <td className="py-3 px-2 text-right font-mono">${formatPrice(pos.avgCost)}</td>
                  <td className="py-3 px-2 text-right font-mono">
                    <span className={hasLivePrice ? '' : 'text-terminal-muted'}>${formatPrice(currentPrice)}</span>
                  </td>
                  <td className={`py-3 px-2 text-right font-mono font-semibold ${isPositive ? 'text-gain' : 'text-loss'}`}>
                    {isPositive ? '+' : ''}${formatPrice(pnl)}
                  </td>
                  <td className={`py-3 px-2 text-right font-mono ${isPositive ? 'text-gain' : 'text-loss'}`}>{formatPercent(pnlPct)}</td>
                  <td className="py-3 px-2 text-right font-mono font-semibold">${formatPrice(value)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TransactionHistory() {
  const { state } = usePortfolio()
  if (state.transactions.length === 0) return null

  return (
    <div className="panel p-5">
      <h3 className="font-semibold text-sm uppercase tracking-wider text-terminal-muted mb-4 flex items-center gap-2">
        <History size={14} /> Transaction History
      </h3>
      <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-terminal-panel">
            <tr className="text-xs text-terminal-muted uppercase tracking-wider border-b border-terminal-border">
              <th className="text-left py-2 px-2">Date</th>
              <th className="text-left py-2 px-2">Type</th>
              <th className="text-left py-2 px-2">Symbol</th>
              <th className="text-right py-2 px-2">Qty</th>
              <th className="text-right py-2 px-2">Price</th>
              <th className="text-right py-2 px-2">Total</th>
              <th className="text-left py-2 px-2">Source</th>
            </tr>
          </thead>
          <tbody>
            {state.transactions.slice(0, 50).map(tx => (
              <tr key={tx.id} className="border-b border-terminal-border/50 hover:bg-white/[0.02]">
                <td className="py-2 px-2 text-terminal-muted text-xs font-mono">
                  {new Date(tx.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="py-2 px-2">
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold ${tx.type === 'BUY' ? 'text-gain' : 'text-loss'}`}>
                    {tx.type === 'BUY' ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {tx.type}
                  </span>
                </td>
                <td className="py-2 px-2 font-mono font-semibold">{tx.symbol}</td>
                <td className="py-2 px-2 text-right font-mono">{tx.qty}</td>
                <td className="py-2 px-2 text-right font-mono">${formatPrice(tx.price)}</td>
                <td className="py-2 px-2 text-right font-mono font-semibold">${formatPrice(tx.total)}</td>
                <td className="py-2 px-2 text-xs text-terminal-muted capitalize">{tx.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
