import { useState, useEffect, useMemo } from 'react'
import { Trophy, Medal, RefreshCw, TrendingUp, TrendingDown, Crown, X, History, Wallet } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../services/supabase'
import { useAuth } from '../context/AuthContext'
import { usePrices } from '../context/PriceContext'
import { formatPrice, formatPercent } from '../services/api'

const INITIAL_CASH = 100000

// Expand a Supabase row into one or more leaderboard entries (one per slot
// that has at least one transaction). Legacy rows without `slots` fall back
// to a single entry built from the top-level columns.
function expandRow(row) {
  const playerName = row.name || 'Anonymous'
  const entries = []

  if (Array.isArray(row.slots) && row.slots.length > 0) {
    row.slots.forEach((slot, slotIndex) => {
      const transactions = slot.transactions || []
      if (transactions.length === 0) return // skip untraded slots
      entries.push({
        userId: row.user_id,
        slotIndex,
        playerName,
        slotName: slot.name || `Portfolio ${slotIndex + 1}`,
        cash: slot.cash ?? INITIAL_CASH,
        positions: slot.positions || {},
        transactions,
        updatedAt: row.updated_at,
      })
    })
  } else {
    // Legacy / single-slot user
    const transactions = row.transactions || []
    if (transactions.length === 0) return entries
    entries.push({
      userId: row.user_id,
      slotIndex: 0,
      playerName,
      slotName: 'Portfolio 1',
      cash: row.cash ?? INITIAL_CASH,
      positions: row.positions || {},
      transactions,
      updatedAt: row.updated_at,
    })
  }

  return entries
}

export default function Leaderboard() {
  const { user } = useAuth()
  const { prices, watchSymbols, refreshPrices } = usePrices()
  const [rawEntries, setRawEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [selected, setSelected] = useState(null)

  // Pull raw rows from Supabase. Equity is NOT computed here — it's derived
  // below from `rawEntries + prices` so the leaderboard reflows live as
  // prices update (every ~5s) without needing another DB round-trip.
  // We await a price refresh BEFORE flipping `loading` off so the first
  // render of the table already has correct rankings (no flash).
  const fetchLeaderboard = async ({ silent = false } = {}) => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    if (!silent) setLoading(true)
    try {
      const { data, error } = await supabase
        .from('portfolios')
        .select('user_id, name, cash, positions, transactions, slots, active_slot, updated_at')

      if (error) {
        console.error('Leaderboard fetch error:', error)
        if (!silent) setLoading(false)
        return
      }

      const flat = (data || []).flatMap(expandRow)
      const allSymbols = new Set()
      flat.forEach(p => Object.keys(p.positions).forEach(s => allSymbols.add(s)))
      if (allSymbols.size > 0) {
        watchSymbols(Array.from(allSymbols))
        // Fetch live prices for every symbol we just registered before
        // unblocking the UI, so the ranking renders correct on first paint.
        try { await refreshPrices() } catch {}
      }

      setRawEntries(flat)
      setLastUpdate(new Date())
    } catch (err) {
      console.error('Leaderboard error:', err)
    }
    if (!silent) setLoading(false)
  }

  useEffect(() => {
    fetchLeaderboard()
    // Re-pull from DB every 30s so other users' new trades show up quickly.
    // Silent so we don't flash the spinner over correct data already on screen.
    const interval = setInterval(() => fetchLeaderboard({ silent: true }), 30 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Recompute equity / P&L / sorting on every price tick. This is what makes
  // the leaderboard live — no manual Refresh click required.
  const players = useMemo(() => {
    const list = rawEntries.map(entry => {
      let positionsValue = 0
      Object.entries(entry.positions).forEach(([sym, pos]) => {
        const livePrice = prices[sym]?.price || pos.avgCost || 0
        positionsValue += pos.qty * livePrice
      })
      const totalEquity = entry.cash + positionsValue
      const pnl = totalEquity - INITIAL_CASH
      const pnlPercent = (pnl / INITIAL_CASH) * 100
      return {
        ...entry,
        positionsValue,
        totalEquity,
        pnl,
        pnlPercent,
        numPositions: Object.keys(entry.positions).length,
        isMe: entry.userId === user?.id,
      }
    })
    list.sort((a, b) => b.totalEquity - a.totalEquity)
    return list
  }, [rawEntries, prices, user?.id])

  // Keep the modal in sync with refreshed data so an open detail view
  // updates as prices and DB data change.
  const selectedLive = useMemo(() => {
    if (!selected) return null
    return players.find(p => p.userId === selected.userId && p.slotIndex === selected.slotIndex) || selected
  }, [selected, players])

  const getRankStyle = (rank) => {
    if (rank === 0) return { icon: Crown, color: '#f59e0b', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' }
    if (rank === 1) return { icon: Medal, color: '#94a3b8', bg: 'bg-slate-400/10', border: 'border-slate-400/30' }
    if (rank === 2) return { icon: Medal, color: '#cd7f32', bg: 'bg-orange-700/10', border: 'border-orange-700/30' }
    return { icon: null, color: null, bg: '', border: '' }
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="max-w-[1000px] space-y-6">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Trophy size={22} className="text-yellow-500" /> Leaderboard
        </h1>
        <div className="panel p-12 text-center text-terminal-muted">
          <Trophy size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-sm">Leaderboard requires Supabase to be configured</p>
          <p className="text-xs mt-1 opacity-70">Set up your database to enable the championship rankings</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1000px] space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Trophy size={22} className="text-yellow-500" /> Leaderboard
          </h1>
          <p className="text-sm text-terminal-muted mt-1">Championship rankings — updated live</p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdate && (
            <span className="text-xs text-terminal-muted font-mono">
              {lastUpdate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button onClick={fetchLeaderboard} disabled={loading}
            className="px-3 py-2 rounded-xl border border-terminal-border text-terminal-muted hover:text-accent hover:border-accent/30 transition-all text-sm"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {!loading && players.length >= 3 && (
        <div className="grid grid-cols-3 gap-4">
          {[1, 0, 2].map(rank => {
            const player = players[rank]
            if (!player) return null
            const style = getRankStyle(rank)
            const RankIcon = style.icon
            return (
              <button
                key={`${player.userId}-${player.slotIndex}`}
                onClick={() => setSelected(player)}
                className={`panel p-5 text-center text-left ${style.bg} border ${style.border} ${rank === 0 ? 'scale-105' : ''} ${player.isMe ? 'ring-2 ring-accent/40' : ''} hover:brightness-110 transition-all cursor-pointer`}
              >
                <div className="flex justify-center mb-2">
                  {RankIcon && <RankIcon size={rank === 0 ? 32 : 24} style={{ color: style.color }} />}
                </div>
                <p className="text-2xl font-bold font-mono text-center" style={{ color: style.color }}>#{rank + 1}</p>
                <p className="text-sm font-medium mt-1 text-center truncate">
                  {player.isMe ? `${player.playerName} (You)` : player.playerName}
                </p>
                <p className="text-[10px] text-terminal-muted text-center truncate">{player.slotName}</p>
                <p className="text-xl font-mono font-bold mt-2 text-center">${formatPrice(player.totalEquity)}</p>
                <p className={`text-xs font-mono mt-1 text-center ${player.pnl >= 0 ? 'text-gain' : 'text-loss'}`}>
                  {player.pnl >= 0 ? '+' : ''}{formatPrice(player.pnl)} ({formatPercent(player.pnlPercent)})
                </p>
              </button>
            )
          })}
        </div>
      )}

      <div className="panel p-5">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-terminal-muted">Loading rankings...</p>
            </div>
          </div>
        ) : players.length === 0 ? (
          <div className="text-center py-12 text-terminal-muted">
            <Trophy size={40} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">No traded portfolios yet</p>
            <p className="text-xs mt-1 opacity-70">Rankings appear when users place their first trade</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-terminal-muted uppercase tracking-wider border-b border-terminal-border">
                  <th className="text-left py-3 px-3">Rank</th>
                  <th className="text-left py-3 px-3">Player</th>
                  <th className="text-left py-3 px-3">Portfolio</th>
                  <th className="text-right py-3 px-3">Equity</th>
                  <th className="text-right py-3 px-3">P&L</th>
                  <th className="text-right py-3 px-3">P&L %</th>
                  <th className="text-right py-3 px-3">Positions</th>
                  <th className="text-right py-3 px-3">Cash</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, i) => {
                  const style = getRankStyle(i)
                  return (
                    <tr
                      key={`${player.userId}-${player.slotIndex}`}
                      onClick={() => setSelected(player)}
                      className={`border-b border-terminal-border/50 cursor-pointer ${player.isMe ? 'bg-accent/5 hover:bg-accent/10' : 'hover:bg-white/[0.04]'}`}
                    >
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold" style={style.color ? { color: style.color } : {}}>
                          {style.icon ? '🏆' : ''} #{i + 1}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium">
                        {player.isMe ? (
                          <span className="text-accent hover:underline">{player.playerName} ⭐</span>
                        ) : (
                          <span className="text-terminal-text hover:text-accent hover:underline">{player.playerName}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-xs text-terminal-muted">{player.slotName}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold">${formatPrice(player.totalEquity)}</td>
                      <td className={`py-3 px-3 text-right font-mono font-semibold ${player.pnl >= 0 ? 'text-gain' : 'text-loss'}`}>
                        {player.pnl >= 0 ? '+' : ''}${formatPrice(Math.abs(player.pnl))}
                      </td>
                      <td className={`py-3 px-3 text-right font-mono ${player.pnl >= 0 ? 'text-gain' : 'text-loss'}`}>
                        {formatPercent(player.pnlPercent)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono">{player.numPositions}</td>
                      <td className="py-3 px-3 text-right font-mono text-terminal-muted">${formatPrice(player.cash)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && players.length > 0 && (() => {
        const myEntries = players
          .map((p, i) => ({ ...p, rank: i + 1 }))
          .filter(p => p.isMe)
        if (myEntries.length === 0) return null
        return (
          <div className="panel p-5 border border-accent/20 bg-accent/5">
            <p className="text-xs text-terminal-muted uppercase tracking-wider mb-3">Your Portfolios</p>
            <div className="space-y-2">
              {myEntries.map(p => (
                <div key={p.slotIndex} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-mono font-bold text-accent">#{p.rank}</span>
                    <span className="text-sm font-medium">{p.slotName}</span>
                    <span className="text-xs text-terminal-muted">/ {players.length}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-mono font-bold mr-3">${formatPrice(p.totalEquity)}</span>
                    <span className={`text-xs font-mono ${p.pnl >= 0 ? 'text-gain' : 'text-loss'}`}>
                      {p.pnl >= 0 ? '+' : ''}{formatPrice(p.pnl)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })()}

      {selectedLive && (
        <PlayerDetailModal
          player={selectedLive}
          prices={prices}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}

function PlayerDetailModal({ player, prices, onClose }) {
  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const symbols = Object.keys(player.positions)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="panel w-full max-w-3xl max-h-[85vh] overflow-y-auto p-6 space-y-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              {player.playerName}
              {player.isMe && <span className="text-xs text-accent">(You)</span>}
            </h2>
            <p className="text-xs text-terminal-muted mt-0.5">{player.slotName}</p>
          </div>
          <button onClick={onClose} className="text-terminal-muted hover:text-loss p-1" title="Close">
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-terminal-bg rounded-xl p-3">
            <p className="text-[10px] text-terminal-muted uppercase tracking-wider">Equity</p>
            <p className="text-lg font-mono font-bold mt-0.5">${formatPrice(player.totalEquity)}</p>
          </div>
          <div className="bg-terminal-bg rounded-xl p-3">
            <p className="text-[10px] text-terminal-muted uppercase tracking-wider">P&L</p>
            <p className={`text-lg font-mono font-bold mt-0.5 ${player.pnl >= 0 ? 'text-gain' : 'text-loss'}`}>
              {player.pnl >= 0 ? '+' : ''}${formatPrice(Math.abs(player.pnl))}
            </p>
            <p className={`text-[10px] font-mono ${player.pnl >= 0 ? 'text-gain' : 'text-loss'}`}>
              {formatPercent(player.pnlPercent)}
            </p>
          </div>
          <div className="bg-terminal-bg rounded-xl p-3">
            <p className="text-[10px] text-terminal-muted uppercase tracking-wider">Cash</p>
            <p className="text-lg font-mono font-bold mt-0.5">${formatPrice(player.cash)}</p>
          </div>
          <div className="bg-terminal-bg rounded-xl p-3">
            <p className="text-[10px] text-terminal-muted uppercase tracking-wider">Positions</p>
            <p className="text-lg font-mono font-bold mt-0.5">{player.numPositions}</p>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-terminal-muted mb-2 flex items-center gap-2">
            <Wallet size={12} /> Open Positions
          </h3>
          {symbols.length === 0 ? (
            <p className="text-xs text-terminal-muted py-3">No open positions</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-terminal-muted uppercase tracking-wider border-b border-terminal-border">
                    <th className="text-left py-2 px-2">Symbol</th>
                    <th className="text-right py-2 px-2">Qty</th>
                    <th className="text-right py-2 px-2">Avg Cost</th>
                    <th className="text-right py-2 px-2">Live Price</th>
                    <th className="text-right py-2 px-2">P&L</th>
                    <th className="text-right py-2 px-2">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {symbols.map(sym => {
                    const pos = player.positions[sym]
                    const currentPrice = prices[sym]?.price || pos.avgCost
                    const value = pos.qty * currentPrice
                    const pnl = (currentPrice - pos.avgCost) * pos.qty
                    return (
                      <tr key={sym} className="border-b border-terminal-border/50">
                        <td className="py-2 px-2 font-mono font-semibold">{sym}</td>
                        <td className="py-2 px-2 text-right font-mono">{pos.qty}</td>
                        <td className="py-2 px-2 text-right font-mono">${formatPrice(pos.avgCost)}</td>
                        <td className="py-2 px-2 text-right font-mono">${formatPrice(currentPrice)}</td>
                        <td className={`py-2 px-2 text-right font-mono font-semibold ${pnl >= 0 ? 'text-gain' : 'text-loss'}`}>
                          {pnl >= 0 ? '+' : ''}${formatPrice(pnl)}
                        </td>
                        <td className="py-2 px-2 text-right font-mono font-semibold">${formatPrice(value)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-terminal-muted mb-2 flex items-center gap-2">
            <History size={12} /> Trade History ({player.transactions.length})
          </h3>
          {player.transactions.length === 0 ? (
            <p className="text-xs text-terminal-muted py-3">No trades yet</p>
          ) : (
            <div className="overflow-x-auto max-h-[280px] overflow-y-auto">
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
                  {player.transactions.slice(0, 100).map(tx => (
                    <tr key={tx.id} className="border-b border-terminal-border/50">
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
                      <td className="py-2 px-2 text-xs text-terminal-muted capitalize">{tx.source || 'manual'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
