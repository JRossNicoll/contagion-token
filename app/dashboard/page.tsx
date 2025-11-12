import { DashboardHeader } from "@/components/dashboard-header"
import { WalletStats } from "@/components/wallet-stats"
import { InfectionTimeline } from "@/components/infection-timeline"
import { RewardsTiers } from "@/components/rewards-tiers"
import { BurnInterface } from "@/components/burn-interface"

export default function DashboardPage() {
  return (
    <main className="h-screen overflow-hidden bg-gradient-to-br from-black via-zinc-950 to-black flex flex-col">
      <DashboardHeader />
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-7xl mx-auto px-6 py-4 flex flex-col gap-4">
          <WalletStats />

          <div className="grid lg:grid-cols-[1.2fr,0.8fr] gap-4 flex-1 min-h-0">
            <InfectionTimeline />
            <BurnInterface />
          </div>

          <RewardsTiers />
        </div>
      </div>
    </main>
  )
}
