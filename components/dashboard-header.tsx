import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Map } from "lucide-react"
import { WalletConnectButton } from "@/components/wallet-connect-button"

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-black/40 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
      <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-pink-500/50 to-transparent" />

      <div className="max-w-[1800px] mx-auto px-6 py-4 flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button
              size="sm"
              variant="outline"
              className="h-11 w-11 p-0 border-white/10 bg-gradient-to-br from-pink-500/10 to-purple-500/10 hover:from-pink-500/20 hover:to-purple-500/20 hover:border-pink-500/30 transition-all backdrop-blur-xl group"
            >
              <ArrowLeft className="w-5 h-5 text-pink-400 group-hover:text-pink-300 transition-colors" />
            </Button>
          </Link>

          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">
              INFECTION COMMAND CENTER
            </h1>
            <p className="text-xs text-gray-500 font-medium tracking-wide mt-0.5">
              Real-time outbreak monitoring & rewards
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/map">
            <Button
              size="sm"
              variant="outline"
              className="h-11 px-6 border-white/10 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 hover:border-cyan-500/30 text-cyan-300 hover:text-cyan-200 transition-all backdrop-blur-xl font-semibold"
            >
              <Map className="w-4 h-4 mr-2" />
              Live Map
            </Button>
          </Link>

          <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/20 to-transparent" />

          <WalletConnectButton className="h-11 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 border-0 font-semibold shadow-lg shadow-pink-500/20" />
        </div>
      </div>
    </header>
  )
}
