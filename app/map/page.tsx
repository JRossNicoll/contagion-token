"use client"
import { NetworkMapFull } from "@/components/network-map-full"
import { useWallet } from "@/hooks/use-wallet"
import { useEffect, useState } from "react"
import { Wallet, Activity, Home, ChevronDown } from "lucide-react"
import Link from "next/link"

export default function MapPage() {
  const { address, connect, isConnected } = useWallet()
  const [userStats, setUserStats] = useState<any>(null)
  const [networkStats, setNetworkStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [showStats, setShowStats] = useState(false)

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
      <Link
        href="/"
        className="absolute top-3 left-3 sm:top-6 sm:left-6 z-40 flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-5 sm:py-3 bg-gradient-to-r from-red-950/30 via-red-900/20 to-red-950/30 
                 backdrop-blur-xl border border-red-500/20 rounded-xl hover:scale-105 transition-all duration-300
                 hover:border-red-500/50 hover:shadow-[0_0_30px_rgba(220,38,38,0.3)] group touch-manipulation"
      >
        <Home className="w-3 h-3 sm:w-4 sm:h-4 text-red-400 group-hover:text-red-300 transition-colors" />
        <span className="hidden sm:inline text-xs sm:text-sm font-semibold bg-gradient-to-r from-red-400 via-red-300 to-red-400 bg-clip-text text-transparent">
          Back Home
        </span>
      </Link>

      <div className="absolute top-3 right-3 sm:top-6 sm:right-6 z-40 flex flex-col items-end gap-2 sm:gap-4">
        <button
          onClick={connect}
          disabled={isConnected}
          className="flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-red-950/30 via-red-900/20 to-red-950/30 
                   backdrop-blur-xl border border-red-500/20 rounded-xl hover:scale-105 transition-all duration-300
                   hover:border-red-500/50 hover:shadow-[0_0_30px_rgba(220,38,38,0.3)] disabled:opacity-50 
                   disabled:cursor-not-allowed disabled:hover:scale-100 group touch-manipulation"
        >
          <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 group-hover:text-red-300 transition-colors" />
          <span className="text-xs sm:text-base font-semibold bg-gradient-to-r from-red-400 via-red-300 to-red-400 bg-clip-text text-transparent">
            {isConnected ? `${address?.slice(0, 4)}...${address?.slice(-4)}` : "Connect"}
          </span>
        </button>

        {(isConnected || networkStats) && (
          <button
            onClick={() => setShowStats(!showStats)}
            className="sm:hidden flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-red-950/30 via-red-900/20 to-red-950/30 
                     backdrop-blur-xl border border-red-500/20 rounded-xl touch-manipulation"
          >
            <Activity className="w-4 h-4 text-red-400" />
            <span className="text-xs font-semibold text-red-400">Stats</span>
            <ChevronDown className={`w-3 h-3 text-red-400 transition-transform ${showStats ? "rotate-180" : ""}`} />
          </button>
        )}

        <div className={`${showStats ? "flex" : "hidden"} sm:flex flex-col gap-2 sm:gap-4`}>
          {isConnected && (
            <div
              className="bg-black/60 backdrop-blur-2xl border border-red-500/30 rounded-xl p-3 sm:p-5 shadow-2xl
                          shadow-red-500/20 min-w-[200px] sm:min-w-[280px] animate-in fade-in slide-in-from-top duration-500"
            >
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : userStats ? (
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2 mb-2 sm:mb-4">
                    <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                    <h3 className="text-xs sm:text-sm font-bold text-red-400 uppercase tracking-wider">Your Stats</h3>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[10px] sm:text-xs text-gray-400">Wallets Infected</span>
                    <span className="text-base sm:text-lg font-bold text-red-400">
                      {userStats.infections_count || 0}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[10px] sm:text-xs text-gray-400">Spread Rate</span>
                    <span className="text-xs sm:text-sm font-semibold text-red-300">
                      {userStats.spread_rate || 0}/day
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[10px] sm:text-xs text-gray-400">Global Rank</span>
                    <span className="text-xs sm:text-sm font-semibold text-orange-400">#{userStats.rank || 0}</span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-white/10">
                    <span className="text-[10px] sm:text-xs text-gray-400">Balance</span>
                    <span className="text-xs sm:text-sm font-semibold text-green-400">
                      {(Number(userStats.holder_balance || 0) / 1e9).toLocaleString()} RPLC
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-gray-400 text-center py-4">No infection data found</div>
              )}
            </div>
          )}

          {networkStats && (
            <div
              className="bg-black/60 backdrop-blur-2xl border border-red-500/30 rounded-xl p-3 sm:p-5 shadow-2xl
                          shadow-red-500/20 min-w-[200px] sm:min-w-[280px]"
            >
              <div className="flex items-center gap-2 mb-2 sm:mb-4">
                <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                <h3 className="text-xs sm:text-sm font-bold text-red-400 uppercase tracking-wider">Network Stats</h3>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] sm:text-xs text-gray-400">Total Holders</span>
                  <span className="text-base sm:text-lg font-bold text-red-400">
                    {networkStats.total_holders?.toLocaleString() || 0}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[10px] sm:text-xs text-gray-400">Total Infections</span>
                  <span className="text-xs sm:text-sm font-semibold text-red-300">
                    {networkStats.total_infections?.toLocaleString() || 0}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[10px] sm:text-xs text-gray-400">Circulating Supply</span>
                  <span className="text-xs sm:text-sm font-semibold text-orange-400">
                    {networkStats.circulating_supply?.toLocaleString() || 0}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <NetworkMapFull />
    </main>
  )
}
