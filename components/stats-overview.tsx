"use client"

import { Card } from "@/components/ui/card"
import { Users, Zap, Network, TrendingUp } from "lucide-react"
import { formatBalance } from "@/lib/format-utils"

interface StatsOverviewProps {
  stats: {
    totalHolders: number
    totalInfections: number
    totalProxies: number
    latestSnapshot: {
      snapshot_id: number
      amount: string | bigint
      status: string
    } | null
  }
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Holders</p>
            <p className="text-3xl font-bold">{stats.totalHolders.toLocaleString()}</p>
          </div>
          <Users className="w-10 h-10 text-primary" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Infections</p>
            <p className="text-3xl font-bold">{stats.totalInfections.toLocaleString()}</p>
          </div>
          <Zap className="w-10 h-10 text-primary" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Proxy Wallets</p>
            <p className="text-3xl font-bold">{stats.totalProxies.toLocaleString()}</p>
          </div>
          <Network className="w-10 h-10 text-primary" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Latest Snapshot</p>
            {stats.latestSnapshot ? (
              <>
                <p className="text-3xl font-bold">#{stats.latestSnapshot.snapshot_id}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatBalance(stats.latestSnapshot.amount)} tokens
                </p>
              </>
            ) : (
              <p className="text-3xl font-bold">-</p>
            )}
          </div>
          <TrendingUp className="w-10 h-10 text-primary" />
        </div>
      </Card>
    </div>
  )
}
