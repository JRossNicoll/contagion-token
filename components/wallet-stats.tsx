"use client"

import { Card } from "@/components/ui/card"
import { Activity, TrendingUp, Flame, Trophy } from "lucide-react"
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
      <div className="text-center py-16">
        <Activity className="w-16 h-16 mx-auto mb-4 text-gray-700" />
        <p className="text-gray-400 text-lg mb-2">Connect your wallet to view infection stats</p>
        <p className="text-gray-600 text-sm">Track your spread and earn rewards</p>
      </div>
    )
  }

  const displayBalance = Number.parseFloat(tokenBalance || "0")

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">Infection Overview</h2>
        <p className="text-sm text-gray-400 mb-4">Your contribution to the outbreak</p>
        <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
          <span className="text-sm text-gray-400 font-medium">Balance:</span>
          <span className="text-xl text-white font-mono font-semibold">
            {displayBalance.toLocaleString(undefined, {
              maximumFractionDigits: 2,
              minimumFractionDigits: 2,
            })}{" "}
            <span className="text-red-400">CONTAGION</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-6 hover:border-red-500/30 hover:bg-white/10 transition-all shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
              <Activity className="w-5 h-5 text-red-400" />
            </div>
            <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Infected</span>
          </div>
          <div className="text-4xl font-bold text-white mb-2 font-mono">{loading ? "..." : stats.walletsInfected}</div>
          <div className="text-xs text-gray-400 font-medium">Wallets infected</div>
        </Card>

        <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-6 hover:border-red-500/30 hover:bg-white/10 transition-all shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-red-400" />
            </div>
            <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Rate</span>
          </div>
          <div className="text-4xl font-bold text-white mb-2 font-mono">
            {loading ? "..." : `${stats.spreadRate.toFixed(1)}x`}
          </div>
          <div className="text-xs text-gray-400 font-medium">Spread Rate</div>
        </Card>

        <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-6 hover:border-orange-500/30 hover:bg-white/10 transition-all shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-400" />
            </div>
            <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Burned</span>
          </div>
          <div className="text-4xl font-bold text-white mb-2 font-mono">
            {loading ? "..." : stats.tokensBurned.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400 font-medium">Tokens Burned</div>
        </Card>

        <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-6 hover:border-yellow-500/30 hover:bg-white/10 transition-all shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-yellow-400" />
            </div>
            <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Rank</span>
          </div>
          <div className="text-4xl font-bold text-white mb-2 font-mono">
            {loading ? "..." : stats.globalRank > 0 ? `#${stats.globalRank}` : "#0"}
          </div>
          <div className="text-xs text-gray-400 font-medium">Global Rank</div>
        </Card>
      </div>
    </div>
  )
}
