"use client"

import { Card } from "@/components/ui/card"
import { Activity, TrendingUp, Flame, Trophy, Wallet } from "lucide-react"
import { useEffect, useState } from "react"
import { useWallet } from "@/hooks/use-wallet"

export function WalletStats() {
  const { address, isConnected, tokenBalance } = useWallet()
  const [stats, setStats] = useState({
    walletsInfected: 0,
    spreadRate: 0,
    tokensBurned: 0,
    globalRank: 0,
    virtualReflectionBalance: "0",
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      if (!address || !isConnected) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/user-stats?address=${address}`)
        if (!response.ok) {
          console.log("[v0] Stats API response not OK:", response.status)
          return
        }

        const data = await response.json()
        setStats({
          walletsInfected: data.infections_count || 0,
          spreadRate: data.spread_rate || 0,
          tokensBurned: Math.floor(data.burned_amount || 0),
          globalRank: data.rank || 0,
          virtualReflectionBalance: data.virtual_reflection_balance || "0",
        })
      } catch (error) {
        console.error("Error fetching wallet stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [address, isConnected])

  if (!isConnected) {
    return (
      <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 shadow-2xl">
        <div className="text-center py-24">
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 flex items-center justify-center">
            <Wallet className="w-12 h-12 text-pink-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Connect Your Wallet</h3>
          <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">
            Link your wallet to view infection statistics, track spread metrics, and claim rewards
          </p>
        </div>
      </Card>
    )
  }

  const displayBalance = Number.parseFloat(tokenBalance || "0")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Infection Overview
          </h2>
          <p className="text-sm text-gray-500">Your contribution to the viral ecosystem</p>
        </div>

        <Card className="bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-cyan-500/10 backdrop-blur-xl border border-white/10 shadow-xl px-8 py-4">
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-gray-400 font-medium mb-1">Total Balance</div>
              <div className="text-3xl text-white font-mono font-bold">
                {displayBalance.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 2,
                })}
              </div>
            </div>
            <div className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              RPLC
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="group relative bg-gradient-to-br from-pink-500/10 to-pink-500/5 backdrop-blur-xl border border-pink-500/20 hover:border-pink-500/40 p-6 transition-all duration-300 shadow-xl hover:shadow-pink-500/20 hover:shadow-2xl hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/30 to-pink-600/30 border border-pink-500/50 flex items-center justify-center shadow-lg shadow-pink-500/20">
                <Activity className="w-6 h-6 text-pink-300" />
              </div>
              <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Infected</span>
            </div>
            <div className="text-5xl font-bold text-white mb-2 font-mono tabular-nums">
              {loading ? "..." : stats.walletsInfected}
            </div>
            <div className="text-xs text-gray-500 font-medium">Total wallets infected</div>
          </div>
        </Card>

        <Card className="group relative bg-gradient-to-br from-purple-500/10 to-purple-500/5 backdrop-blur-xl border border-purple-500/20 hover:border-purple-500/40 p-6 transition-all duration-300 shadow-xl hover:shadow-purple-500/20 hover:shadow-2xl hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-purple-600/30 border border-purple-500/50 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <TrendingUp className="w-6 h-6 text-purple-300" />
              </div>
              <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Spread Rate</span>
            </div>
            <div className="text-5xl font-bold text-white mb-2 font-mono tabular-nums">
              {loading ? "..." : `${stats.spreadRate.toFixed(1)}×`}
            </div>
            <div className="text-xs text-gray-500 font-medium">Infection multiplier</div>
          </div>
        </Card>

        <Card className="group relative bg-gradient-to-br from-orange-500/10 to-orange-500/5 backdrop-blur-xl border border-orange-500/20 hover:border-orange-500/40 p-6 transition-all duration-300 shadow-xl hover:shadow-orange-500/20 hover:shadow-2xl hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/30 to-orange-600/30 border border-orange-500/50 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Flame className="w-6 h-6 text-orange-300" />
              </div>
              <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Burned</span>
            </div>
            <div className="text-5xl font-bold text-white mb-2 font-mono tabular-nums">
              {loading ? "..." : stats.tokensBurned.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 font-medium">Tokens eliminated</div>
          </div>
        </Card>

        <Card className="group relative bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 backdrop-blur-xl border border-cyan-500/20 hover:border-cyan-500/40 p-6 transition-all duration-300 shadow-xl hover:shadow-cyan-500/20 hover:shadow-2xl hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/30 to-cyan-600/30 border border-cyan-500/50 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Trophy className="w-6 h-6 text-cyan-300" />
              </div>
              <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Global Rank</span>
            </div>
            <div className="text-5xl font-bold text-white mb-2 font-mono tabular-nums">
              {loading ? "..." : stats.globalRank > 0 ? `#${stats.globalRank}` : "#—"}
            </div>
            <div className="text-xs text-gray-500 font-medium">Leaderboard position</div>
          </div>
        </Card>
      </div>
    </div>
  )
}
