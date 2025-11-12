import { DashboardHeader } from "@/components/dashboard-header"
import { WalletStats } from "@/components/wallet-stats"
import { InfectionTimeline } from "@/components/infection-timeline"
import { RewardsTiers } from "@/components/rewards-tiers"
import { BurnInterface } from "@/components/burn-interface"
import Link from "next/link"
import { Home } from "lucide-react"

export default function DashboardPage() {
  return (
    <main className="min-h-screen relative overflow-x-hidden bg-black">
      {/* Animated candy gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-pink-950/20 via-purple-950/20 to-cyan-950/20 animate-gradient-shift" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(236,72,153,0.03),transparent_50%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.04),transparent_40%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(6,182,212,0.03),transparent_40%)]" />

      <div className="relative z-10">
        <Link
          href="/"
          className="fixed top-3 left-3 sm:top-6 sm:left-6 z-50 flex items-center gap-2 px-3 py-2 sm:px-5 sm:py-3 bg-gradient-to-r from-red-950/30 via-red-900/20 to-red-950/30 
                   backdrop-blur-xl border border-red-500/20 rounded-xl hover:scale-105 transition-all duration-300
                   hover:border-red-500/50 hover:shadow-[0_0_30px_rgba(220,38,38,0.3)] group touch-manipulation"
        >
          <Home className="w-3 h-3 sm:w-4 sm:h-4 text-red-400 group-hover:text-red-300 transition-colors" />
          <span className="text-xs sm:text-sm font-semibold bg-gradient-to-r from-red-400 via-red-300 to-red-400 bg-clip-text text-transparent">
            Back Home
          </span>
        </Link>

        <DashboardHeader />

        <div className="max-w-[1800px] mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-8">
          <WalletStats />

          <div className="grid lg:grid-cols-[1.4fr,1fr] gap-4 sm:gap-6">
            <InfectionTimeline />
            <BurnInterface />
          </div>

          <RewardsTiers />
        </div>
      </div>
    </main>
  )
}
