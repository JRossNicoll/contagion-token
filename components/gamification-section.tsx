"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Flame, Trophy } from "lucide-react"
import { TypewriterTitle } from "./typewriter-title"

export function GamificationSection() {
  return (
    <section className="py-8 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,rgba(239,68,68,0.12),transparent_70%)] animate-pulse" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-6">
          <Badge className="bg-red-950/50 text-red-400 border-red-500/30 mb-3 text-xs">CLASSIFIED</Badge>
          <TypewriterTitle
            text="Rewards For The Brave"
            className="mb-2 text-red-500 text-xl md:text-2xl font-bold tracking-tight"
          />
          <p className="text-gray-400 text-sm max-w-xl mx-auto">
            Those who help contain the outbreak will be marked for future airdrops
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-b from-zinc-950 to-black border-zinc-800 p-4 relative overflow-hidden group hover:border-red-500/30 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-3xl group-hover:bg-red-600/20 transition-colors" />
            <div className="relative">
              <div className="w-9 h-9 rounded-lg bg-red-950/50 flex items-center justify-center mb-3">
                <Shield className="w-4 h-4 text-red-500" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">Vaccinated Wallets</h3>
              <p className="text-gray-400 text-xs mb-2 leading-relaxed">
                Burn your tokens to vaccinate your wallet and stop the spread.
              </p>
              <div className="text-lg font-bold text-red-500 font-mono">1X REWARD</div>
            </div>
          </Card>

          <Card className="bg-gradient-to-b from-zinc-950 to-black border-zinc-800 p-4 relative overflow-hidden group hover:border-red-500/30 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-3xl group-hover:bg-red-600/20 transition-colors" />
            <div className="relative">
              <div className="w-9 h-9 rounded-lg bg-red-950/50 flex items-center justify-center mb-3">
                <Flame className="w-4 h-4 text-red-500" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">Dust Burners</h3>
              <p className="text-gray-400 text-xs mb-2 leading-relaxed">
                Burn the dust and help contain the outbreak completely.
              </p>
              <div className="text-lg font-bold text-red-500 font-mono">2X REWARD</div>
            </div>
          </Card>

          <Card className="bg-gradient-to-b from-zinc-950 to-black border-zinc-800 p-4 relative overflow-hidden group hover:border-red-500/30 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-3xl group-hover:bg-red-600/20 transition-colors" />
            <div className="relative">
              <div className="w-9 h-9 rounded-lg bg-red-950/50 flex items-center justify-center mb-3">
                <Trophy className="w-4 h-4 text-red-500" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">Diamond Hands</h3>
              <p className="text-gray-400 text-xs mb-2 leading-relaxed">
                Hold through the outbreak and become a legendary carrier.
              </p>
              <div className="text-lg font-bold text-red-500 font-mono">4X REWARD</div>
            </div>
          </Card>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-xs font-mono">
            * Future airdrop details will be revealed when the next strain is released
          </p>
        </div>
      </div>
    </section>
  )
}
