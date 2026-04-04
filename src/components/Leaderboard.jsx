import { useState, useEffect } from 'react'
import { Trophy, Medal, RefreshCw, TrendingUp, TrendingDown, Crown } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../services/supabase'
import { useAuth } from '../context/AuthContext'
import { usePrices } from '../context/PriceContext'
import { formatPrice, formatPercent } from '../services/api'

const INITIAL_CASH = 100000

export default function Leaderboard() {
  const { user } = useAuth()
  const { prices, watchSymbols } = usePrices()
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)

  const fetchLeaderboard = async () => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      // Fetch all portfolios
      const { data, error } = await supabase
        .from('portfolios')
        .select('user_id, name, cash, positions, updated_at')

      if (error) {
        console.error('Leaderboard fetch error:', error)
        setLoading(false)
        return
      }

      // Fetch user names
      // (name is stored in portfolios table)

      // Collect all unique symbols to fetch prices
      const allSymbols = new Set()
      ;(data || []).forEach(p => {
        Object.keys(p.positions || {}).forEach(s => allSymbols.add(s))
      })

      // Register symbols for price tracking
      if (allSymbols.size > 0) {
        watchSymbols(Array.from(allSymbols))
      }

      // Build player list
      const playerList = (data || []).map(portfolio => {
        const positions = portfolio.positions || {}
        const cash = portfolio.cash || INITIAL_CASH

        // Calculate positions value using live prices
        let positionsValue = 0
        Object.entries(positions).forEach(([sym, pos]) => {
          const livePrice = prices[sym]?.price || pos.avgCost || 0
          positionsValue += pos.qty * livePrice
        })

        const totalEquity = cash + positionsValue
        const pnl = totalEquity - INITIAL_CASH
        const pnlPercent = (pnl / INITIAL_CASH) * 100
        const numPositions = Object.keys(positions).length

        return {
          userId: portfolio.user_id,
          name: portfolio.name || 'Anonymous',
          cash,
          positionsValue,
          totalEquity,
          pnl,
          pnlPercent,
          numPositions,
          updatedAt: portfolio.updated_at,
          isMe: portfolio.user_id === user?.id,
        }
      })

      // Sort by total equity descending
      playerList.sort((a, b) => b.totalEquity - a.totalEquity)

      setPlayers(playerList)
      setLastUpdate(new Date())
    } catch (err) {
      console.error('Leaderboard error:', err)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchLeaderboard()
    // Refresh every 5 minutes
    const interval = setInterval(fetchLeaderboard, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Re-calculate when prices update
  useEffect(() => {
    if (players.length > 0 && Object.keys(prices).length > 0) {
      setPlayers(prev => prev.map(p => {
        // We'd need positions data to recalculate — skip for now
        return p
      }))
    }
  }, [prices])

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
      {/* Header */}
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

      {/* Top 3 Podium */}
      {!loading && players.length >= 3 && (
        <div className="grid grid-cols-3 gap-4">
          {[1, 0, 2].map(rank => {
            const player = players[rank]
            if (!player) return null
            const style = getRankStyle(rank)
            const RankIcon = style.icon

            return (
              <div key={rank} className={`panel p-5 text-center ${style.bg} border ${style.border} ${rank === 0 ? 'scale-105' : ''} ${player.isMe ? 'ring-2 ring-accent/40' : ''}`}>
                <div className="flex justify-center mb-2">
                  {RankIcon && <RankIcon size={rank === 0 ? 32 : 24} style={{ color: style.color }} />}
                </div>
                <p className="text-2xl font-bold font-mono" style={{ color: style.color }}>#{rank + 1}</p>
                <p className="text-sm font-medium mt-1 truncate">
                  {player.isMe ? `${player.name} (You)` : player.name}
                </p>
                <p className="text-xl font-mono font-bold mt-2">${formatPrice(player.totalEquity)}</p>
                <p className={`text-xs font-mono mt-1 ${player.pnl >= 0 ? 'text-gain' : 'text-loss'}`}>
                  {player.pnl >= 0 ? '+' : ''}{formatPrice(player.pnl)} ({formatPercent(player.pnlPercent)})
                </p>
              </div>
            )
          })}
        </div>
      )}

      {/* Full Rankings Table */}
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
            <p className="text-sm">No players yet</p>
            <p className="text-xs mt-1 opacity-70">Rankings appear when users sign up and start trading</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-terminal-muted uppercase tracking-wider border-b border-terminal-border">
                  <th className="text-left py-3 px-3">Rank</th>
                  <th className="text-left py-3 px-3">Player</th>
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
                    <tr key={player.userId} className={`border-b border-terminal-border/50 ${player.isMe ? 'bg-accent/5' : 'hover:bg-white/[0.02]'}`}>
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold" style={style.color ? { color: style.color } : {}}>
                          {style.icon ? '🏆' : ''} #{i + 1}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium">
                        {player.isMe ? (
                          <span className="text-accent">{player.name} ⭐</span>
                        ) : (
                          <span className="text-terminal-text">{player.name}</span>
                        )}
                      </td>
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

      {/* My Position */}
      {!loading && players.length > 0 && (() => {
        const myRank = players.findIndex(p => p.isMe)
        if (myRank === -1) return null
        return (
          <div className="panel p-5 border border-accent/20 bg-accent/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-terminal-muted uppercase tracking-wider">Your Position</p>
                <p className="text-2xl font-mono font-bold text-accent mt-1">#{myRank + 1} <span className="text-base text-terminal-muted">/ {players.length}</span></p>
              </div>
              <div className="text-right">
                <p className="text-xs text-terminal-muted">Total Equity</p>
                <p className="text-lg font-mono font-bold">${formatPrice(players[myRank].totalEquity)}</p>
                <p className={`text-xs font-mono ${players[myRank].pnl >= 0 ? 'text-gain' : 'text-loss'}`}>
                  {players[myRank].pnl >= 0 ? '+' : ''}{formatPrice(players[myRank].pnl)}
                </p>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
