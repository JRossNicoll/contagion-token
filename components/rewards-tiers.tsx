"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Flame, Trophy, Lock } from "lucide-react"
import { useEffect, useState } from "react"
import { useWallet } from "@/hooks/use-wallet"

export function RewardsTiers() {
  const { address, isConnected } = useWallet()
  const [progress, setProgress] = useState({
    tokensBurned: 0,
    daysHeld: 0,
  })

  useEffect(() => {
    async function fetchProgress() {
      if (!address || !isConnected) return

      try {
        const response = await fetch(`/api/user-stats?address=${address}`)
        if (!response.ok) return

        const data = await response.json()
        setProgress({
          tokensBurned: data.burned_amount || 0,
          daysHeld: data.days_held || 0,
        })
      } catch (error) {
        console.error("Error fetching progress:", error)
      }
    }

    fetchProgress()
  }, [address, isConnected])

  const tiers = [
    {
      name: "Vaccinated",
      icon: Shield,
      description: "Burn tokens to stop the spread",
      requirement: "Burn 100+ tokens",
      progress: `${progress.tokensBurned} / 100 burned`,
      reward: "1X REWARD",
      bgColor: "bg-blue-950/50",
      iconColor: "text-blue-500",
      rewardColor: "text-blue-400",
      locked: progress.tokensBurned < 100,
    },
    {
      name: "Dust Burner",
      icon: Flame,
      description: "Burn as dust to contain the outbreak",
      requirement: "Burn 500+ tokens",
      progress: `${progress.tokensBurned} / 500 burned`,
      reward: "2X REWARD",
      bgColor: "bg-orange-950/50",
      iconColor: "text-orange-500",
      rewardColor: "text-orange-400",
      locked: progress.tokensBurned < 500,
    },
    {
      name: "Diamond Hands",
      icon: Trophy,
      description: "Hold through the outbreak",
      requirement: "Hold 30+ days",
      progress: `${progress.daysHeld} / 30 days`,
      reward: "4X REWARD",
      bgColor: "bg-yellow-950/50",
      iconColor: "text-yellow-500",
      rewardColor: "text-yellow-400",
      locked: progress.daysHeld < 30,
    },
  ]

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-1">Reward Tiers</h2>
        <p className="text-sm text-gray-500">Your progress towards higher rewards</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiers.map((tier) => (
          <Card
            key={tier.name}
            className="bg-zinc-950/80 border-zinc-800 p-6 relative overflow-hidden hover:border-zinc-700 transition-all"
          >
            {tier.locked && (
              <Badge className="absolute top-4 right-4 bg-zinc-900 text-gray-400 border-zinc-800 font-mono text-xs">
                <Lock className="w-3 h-3 mr-1" />
                LOCKED
              </Badge>
            )}

            <div
              className={`w-12 h-12 mb-4 rounded-lg ${tier.bgColor} flex items-center justify-center border border-zinc-800`}
            >
              <tier.icon className={`w-6 h-6 ${tier.iconColor}`} />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">{tier.description}</p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Requirement</span>
                <span className="text-white font-bold font-mono">{tier.requirement}</span>
              </div>
              <div className="text-xs text-gray-500 font-mono">{tier.progress}</div>
            </div>

            <div className={`${tier.rewardColor} font-bold text-lg font-mono mb-1`}>{tier.reward}</div>
            <div className="text-xs text-gray-500">Next airdrop multiplier</div>
          </Card>
        ))}
      </div>

      <Card className="mt-6 bg-gradient-to-br from-purple-950/30 to-black border-purple-500/30 p-8 text-center">
        <Badge className="bg-red-950/50 text-red-400 border-red-500/30 mb-4 text-xs">CLASSIFIED</Badge>
        <h3 className="text-2xl font-bold text-white mb-3">Mystery Airdrop Incoming</h3>
        <p className="text-gray-400 max-w-2xl mx-auto mb-2 text-sm leading-relaxed">
          Those who help contain this outbreak will be marked as "Patient Zeros" for the next viral token. Details will
          be revealed when the next strain is released.
        </p>
        <p className="text-xs text-gray-600 italic font-mono">Stay infected. Stay rewarded.</p>
      </Card>
    </div>
  )
}
