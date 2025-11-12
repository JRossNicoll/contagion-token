import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { WalletConnectButton } from "@/components/wallet-connect-button"

export function DashboardHeader() {
  return (
    <header className="border-b border-white/5 bg-black/70 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      <div className="px-6 py-5 flex items-center justify-between gap-6">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <Link href="/">
            <Button
              size="sm"
              variant="outline"
              className="border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 hover:border-red-500/30 transition-all h-10 w-10 p-0 shadow-lg backdrop-blur-xl"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-white tracking-tight leading-none">INFECTION STATUS</h1>
            <p className="text-xs text-red-400/70 font-medium tracking-wide mt-1">Track your spread and earn rewards</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link href="/map">
            <Button
              size="sm"
              variant="outline"
              className="h-10 px-5 border-white/10 bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 hover:border-red-500/30 transition-all font-medium backdrop-blur-xl shadow-lg"
            >
              View Map
            </Button>
          </Link>
          <div className="w-px h-8 bg-white/10" />
          <WalletConnectButton className="h-10" />
        </div>
      </div>
    </header>
  )
}
