import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { WalletConnectButton } from "@/components/wallet-connect-button"

export function DashboardHeader() {
  return (
    <header className="border-b border-red-500/10 bg-black/98 backdrop-blur-xl shadow-2xl shadow-red-500/5">
      <div className="px-3 md:px-6 py-3 md:py-4 flex items-center justify-between gap-2 md:gap-6">
        <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
          <Link href="/">
            <Button
              size="sm"
              variant="outline"
              className="border-zinc-800 bg-zinc-950/80 text-gray-400 hover:text-white hover:bg-zinc-900 hover:border-red-500/50 transition-all h-8 w-8 md:h-10 md:w-10 p-0 shadow-lg shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </Button>
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm md:text-xl font-bold text-white font-mono tracking-tight leading-none truncate">
              INFECTION STATUS
            </h1>
            <p className="text-[9px] md:text-xs text-red-400/60 font-mono tracking-wider mt-0.5 hidden sm:block uppercase truncate">
              Track your spread and earn rewards
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <Link href="/map">
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-3 md:h-10 md:px-5 border-zinc-800 bg-zinc-950/80 text-gray-400 hover:text-white hover:bg-zinc-900 hover:border-red-500/50 transition-all font-mono text-[10px] md:text-xs tracking-wider shadow-lg"
            >
              <span className="hidden sm:inline">VIEW MAP</span>
              <span className="sm:hidden">MAP</span>
            </Button>
          </Link>
          <div className="w-px h-6 md:h-8 bg-zinc-800/50 hidden sm:block" />
          <WalletConnectButton className="h-8 md:h-10 text-[10px] md:text-xs" />
        </div>
      </div>
    </header>
  )
}
