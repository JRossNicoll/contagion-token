"use client"
import { NetworkMapFull } from "@/components/network-map-full"
import { useWallet } from "@/hooks/use-wallet"
import { useEffect, useState } from "react"
import { Wallet, Activity } from "lucide-react"

export default function MapPage() {
  const { address, connect, isConnected } = useWallet()
  const [userStats, setUserStats] = useState<any>(null)
  const [networkStats, setNetworkStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => setNetworkStats(data))
      .catch((err) => console.error("[v0] Error fetching network stats:", err))
  }, [])

  useEffect(() => {
    if (!address) {
      setUserStats(null)
      return
    }

    setLoading(true)
    console.log("[v0] Fetching real infection data for connected wallet:", address)

    fetch(`/api/user-stats?address=${address}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("[v0] Connected wallet stats:", data)
        setUserStats(data)
      })
      .catch((err) => console.error("[v0] Error fetching user stats:", err))
      .finally(() => setLoading(false))
  }, [address])

  return (
    <main className="h-screen overflow-hidden bg-black text-white relative">
      <div className="absolute top-6 right-6 z-40 flex flex-col items-end gap-4">
        {/* Connect Wallet Button */}
        <button
          onClick={connect}
          disabled={isConnected}
          className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 
                   backdrop-blur-xl border border-white/20 rounded-xl hover:scale-105 transition-all duration-300
                   hover:shadow-[0_0_30px_rgba(236,72,153,0.3)] disabled:opacity-50 disabled:cursor-not-allowed
                   disabled:hover:scale-100 group"
        >
          <Wallet className="w-5 h-5 text-pink-400 group-hover:text-pink-300 transition-colors" />
          <span className="font-semibold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : "Connect Wallet"}
          </span>
        </button>

        {/* Connected Wallet Stats */}
        {isConnected && (
          <div
            className="bg-black/60 backdrop-blur-2xl border border-pink-500/30 rounded-xl p-5 shadow-2xl
                        shadow-pink-500/20 min-w-[280px] animate-in fade-in slide-in-from-top duration-500"
          >
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : userStats ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-4 h-4 text-pink-400" />
                  <h3 className="text-sm font-bold text-pink-400 uppercase tracking-wider">Your Stats</h3>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Wallets Infected</span>
                  <span className="text-lg font-bold text-pink-400">{userStats.infections_count || 0}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Spread Rate</span>
                  <span className="text-sm font-semibold text-purple-400">{userStats.spread_rate || 0}/day</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Global Rank</span>
                  <span className="text-sm font-semibold text-cyan-400">#{userStats.rank || 0}</span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-white/10">
                  <span className="text-xs text-gray-400">Balance</span>
                  <span className="text-sm font-semibold text-green-400">
                    {(Number(userStats.holder_balance || 0) / 1e9).toLocaleString()} RPLC
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-400 text-center py-4">No infection data found</div>
            )}
          </div>
        )}

        {/* Network Stats */}
        {networkStats && (
          <div
            className="bg-black/60 backdrop-blur-2xl border border-cyan-500/30 rounded-xl p-5 shadow-2xl
                        shadow-cyan-500/20 min-w-[280px]"
          >
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">Network Stats</h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Total Holders</span>
                <span className="text-lg font-bold text-cyan-400">
                  {networkStats.total_holders?.toLocaleString() || 0}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Total Infections</span>
                <span className="text-sm font-semibold text-purple-400">
                  {networkStats.total_infections?.toLocaleString() || 0}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Circulating Supply</span>
                <span className="text-sm font-semibold text-pink-400">
                  {networkStats.circulating_supply?.toLocaleString() || 0}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <NetworkMapFull />
    </main>
  )
}
