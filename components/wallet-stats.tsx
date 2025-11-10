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
        <h2 className="text-3xl font-bold text-white mb-1">Infection Overview</h2>
        <p className="text-sm text-gray-500 mb-3">Your contribution to the outbreak</p>
        <p className="text-xl text-white font-mono">
          Balance:{" "}
          {displayBalance.toLocaleString(undefined, {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
          })}{" "}
          CONTAGION
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-zinc-950/80 border-zinc-800 p-5 hover:border-red-500/30 transition-all">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-red-950/50 flex items-center justify-center">
              <Activity className="w-4 h-4 text-red-500" />
            </div>
            <span className="text-xs text-gray-400 uppercase tracking-wider font-mono">Infected</span>
          </div>
          <div className="text-4xl font-bold text-white mb-1 font-mono">{loading ? "..." : stats.walletsInfected}</div>
          <div className="text-xs text-gray-500 mb-1">Wallets infected</div>
          <div className="text-xs text-gray-600">From your interactions</div>
        </Card>

        <Card className="bg-zinc-950/80 border-zinc-800 p-5 hover:border-red-500/30 transition-all">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-red-950/50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-red-500" />
            </div>
            <span className="text-xs text-gray-400 uppercase tracking-wider font-mono">Rate</span>
          </div>
          <div className="text-4xl font-bold text-white mb-1 font-mono">
            {loading ? "..." : `${stats.spreadRate.toFixed(1)}x`}
          </div>
          <div className="text-xs text-gray-500 mb-1">Spread Rate</div>
          <div className="text-xs text-gray-600">Average</div>
        </Card>

        <Card className="bg-zinc-950/80 border-zinc-800 p-5 hover:border-red-500/30 transition-all">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-orange-950/50 flex items-center justify-center">
              <Flame className="w-4 h-4 text-orange-500" />
            </div>
            <span className="text-xs text-gray-400 uppercase tracking-wider font-mono">Burned</span>
          </div>
          <div className="text-4xl font-bold text-white mb-1 font-mono">
            {loading ? "..." : stats.tokensBurned.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mb-1">Tokens Burned</div>
          <div className="text-xs text-gray-600">Not vaccinated</div>
        </Card>

        <Card className="bg-zinc-950/80 border-zinc-800 p-5 hover:border-red-500/30 transition-all">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-yellow-950/50 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-yellow-500" />
            </div>
            <span className="text-xs text-gray-400 uppercase tracking-wider font-mono">Rank</span>
          </div>
          <div className="text-4xl font-bold text-white mb-1 font-mono">
            {loading ? "..." : stats.globalRank > 0 ? `#${stats.globalRank}` : "#0"}
          </div>
          <div className="text-xs text-gray-500 mb-1">Global Rank</div>
          <div className="text-xs text-green-400">{loading ? "Calculating..." : "Live"}</div>
        </Card>
      </div>
    </div>
  )
}
