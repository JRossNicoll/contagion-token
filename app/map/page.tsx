"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { NetworkMapFull } from "@/components/network-map-full"
import { useWallet } from "@/hooks/use-wallet"

export default function MapPage() {
  const { address, connect } = useWallet()

  return (
    <main className="h-screen overflow-hidden bg-black text-white flex flex-col">
      <header className="border-b border-white/5 bg-black/70 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex-shrink-0">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-gray-400 hover:text-white hover:bg-white/5 transition-all h-8 text-xs"
            >
              <Link href="/">
                <ArrowLeft className="w-3.5 h-3.5 mr-2" />
                <span className="font-medium">Back to Home</span>
              </Link>
            </Button>
            <div className="h-5 w-px bg-white/10" />
            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-lg shadow-red-500/50" />
              <span className="text-xs font-medium text-gray-300">Live Outbreak Map</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white hover:border-red-500/30 backdrop-blur-xl transition-all font-medium h-8 text-xs"
              asChild
            >
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            {address ? (
              <Button
                variant="ghost"
                size="sm"
                className="border border-white/10 bg-white/5 text-red-400 hover:bg-white/10 font-mono text-[10px] backdrop-blur-xl h-8"
              >
                {address.slice(0, 6)}...{address.slice(-4)}
              </Button>
            ) : (
              <Button
                size="sm"
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold shadow-lg shadow-red-500/20 h-8 text-xs"
                onClick={connect}
              >
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <NetworkMapFull />
      </div>
    </main>
  )
}
