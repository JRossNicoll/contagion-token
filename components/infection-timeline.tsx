"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Zap } from "lucide-react"
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
    <Card className="bg-zinc-950/80 border-zinc-800 p-6">
      <h3 className="text-xl font-bold text-white mb-6">Infection Timeline</h3>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Loading infections...</p>
          </div>
        ) : timeline.length > 0 ? (
          timeline.map((entry, i) => {
            const isChainReaction =
              i > 0 && new Date(entry.created_at).getTime() - new Date(timeline[i - 1].created_at).getTime() < 300000

            return (
              <div
                key={entry.transaction_hash}
                className="flex items-center justify-between p-4 bg-black/50 border border-zinc-800 rounded-lg hover:border-red-500/30 transition-all"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm text-white truncate">{formatAddress(entry.to_address)}</span>
                    {isChainReaction && (
                      <Badge variant="destructive" className="text-xs font-mono px-2 py-0">
                        <Zap className="w-3 h-3 mr-1" />
                        CHAIN REACTION
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">{formatTimeAgo(entry.created_at)}</div>
                </div>

                <div className="flex items-center gap-3 ml-4">
                  <div className="flex items-center gap-1">
                    <span className="text-red-400 font-bold font-mono text-lg">{getInfectionCount(i)}</span>
                    <span className="text-xs text-gray-500">infected</span>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-16">
            <Activity className="w-16 h-16 mx-auto mb-3 text-gray-700 opacity-30" />
            <p className="text-gray-500 text-base mb-1">No infections yet</p>
            <p className="text-gray-600 text-sm">Start spreading the virus!</p>
          </div>
        )}
      </div>
    </Card>
  )
}
