"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from 'lucide-react'
import Link from "next/link"
import { NetworkMapFull } from "@/components/network-map-full"
import { useWallet } from "@/hooks/use-wallet"

export default function MapPage() {
  const { address, connect } = useWallet()

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-red-900/30 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="text-gray-400 hover:text-white">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                OUTBREAK MAP
              </Link>
            </Button>
            <div className="px-3 py-1 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400 uppercase tracking-wider">
              Network Status: Spreading
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="border-red-500/30 text-white hover:bg-red-500/10" asChild>
              <Link href="/dashboard">
                YOUR DASHBOARD
              </Link>
            </Button>
            {address ? (
              <Button 
                variant="ghost" 
                size="sm" 
                className="border border-red-500/30 text-red-400 hover:bg-red-500/5 font-mono text-xs"
              >
                {address.slice(0, 6)}...{address.slice(-4)}
              </Button>
            ) : (
              <Button 
                size="sm" 
                className="bg-red-600 hover:bg-red-700 text-white font-bold"
                onClick={connect}
              >
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="h-[calc(100vh-73px)]">
        <NetworkMapFull />
      </div>
    </main>
  )
}
