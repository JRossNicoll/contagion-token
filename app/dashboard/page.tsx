import { DashboardHeader } from "@/components/dashboard-header"
import { WalletStats } from "@/components/wallet-stats"
import { InfectionTimeline } from "@/components/infection-timeline"
import { RewardsTiers } from "@/components/rewards-tiers"
import { BurnInterface } from "@/components/burn-interface"

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-black">
      <DashboardHeader />
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6 md:space-y-8">
        <WalletStats />

        <div className="grid lg:grid-cols-[1.2fr,0.8fr] gap-4 md:gap-6">
          <InfectionTimeline />
          <BurnInterface />
        </div>

        <RewardsTiers />
      </div>
    </main>
  )
}
