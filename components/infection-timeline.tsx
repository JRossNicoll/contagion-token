"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Zap, ExternalLink } from "lucide-react"
import { useEffect, useState } from "react"
import { useWallet } from "@/hooks/use-wallet"

interface Infection {
  from_address: string
  to_address: string
  amount: string
  block_number: number
  transaction_hash: string
  created_at: string
}

export function InfectionTimeline() {
  const { address, isConnected } = useWallet()
  const [timeline, setTimeline] = useState<Infection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTimeline() {
      if (!address || !isConnected) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/infections?address=${address}&limit=10`)
        if (!response.ok) return

        const data = await response.json()
        setTimeline(data.infections || [])
      } catch (error) {
        console.error("Error fetching timeline:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTimeline()
    const interval = setInterval(fetchTimeline, 30000)
    return () => clearInterval(interval)
  }, [address, isConnected])

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  const formatAddress = (addr: string) => {
    if (!addr || addr.length < 10) return addr
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const getInfectionCount = (index: number) => timeline.length - index

  return (
    <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
      <div className="p-6 border-b border-white/5 bg-gradient-to-r from-pink-500/5 to-purple-500/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 flex items-center justify-center">
            <Activity className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Infection Timeline</h3>
            <p className="text-xs text-gray-500 mt-0.5">Recent viral transmissions</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {loading ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400 text-sm">Scanning infection network...</p>
            </div>
          ) : timeline.length > 0 ? (
            timeline.map((entry, i) => {
              const isChainReaction =
                i > 0 && new Date(entry.created_at).getTime() - new Date(timeline[i - 1].created_at).getTime() < 300000

              return (
                <div
                  key={entry.transaction_hash}
                  className="group relative p-4 bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl hover:border-pink-500/30 hover:bg-white/5 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500/0 via-pink-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />

                  <div className="relative flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-sm text-white font-semibold truncate">
                          {formatAddress(entry.to_address)}
                        </span>
                        {isChainReaction && (
                          <Badge className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 border-pink-500/30 text-xs font-mono px-2 py-0.5">
                            <Zap className="w-3 h-3 mr-1" />
                            CHAIN
                          </Badge>
                        )}
                        <a
                          href={`https://bscscan.com/tx/${entry.transaction_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ExternalLink className="w-4 h-4 text-gray-500 hover:text-pink-400 transition-colors" />
                        </a>
                      </div>
                      <div className="text-xs text-gray-500 font-mono">{formatTimeAgo(entry.created_at)}</div>
                    </div>

                    <div className="flex items-center gap-4 ml-6">
                      <div className="text-right">
                        <div className="text-2xl font-bold font-mono bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                          {getInfectionCount(i)}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">infected</div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 flex items-center justify-center">
                <Activity className="w-10 h-10 text-pink-400/30" />
              </div>
              <p className="text-gray-400 text-lg font-medium mb-2">No Infections Yet</p>
              <p className="text-gray-600 text-sm">Start spreading to see your timeline</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
