import { DashboardHeader } from "@/components/dashboard-header"
import { WalletStats } from "@/components/wallet-stats"
import { InfectionTimeline } from "@/components/infection-timeline"
import { RewardsTiers } from "@/components/rewards-tiers"
import { BurnInterface } from "@/components/burn-interface"
export default function DashboardPage() {
  return (
    <main className="min-h-screen relative overflow-x-hidden bg-black">
      {/* Animated candy gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-pink-950/20 via-purple-950/20 to-cyan-950/20 animate-gradient-shift" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(236,72,153,0.03),transparent_50%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.04),transparent_40%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(6,182,212,0.03),transparent_40%)]" />

      <div className="relative z-10">
        <DashboardHeader />

        <div className="max-w-[1800px] mx-auto px-6 py-8 space-y-8">
          <WalletStats />

          <div className="grid lg:grid-cols-[1.4fr,1fr] gap-6">
            <InfectionTimeline />
            <BurnInterface />
          </div>

          <RewardsTiers />
        </div>
      </div>
    </main>
  )
}
