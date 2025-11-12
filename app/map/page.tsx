"use client"
import { NetworkMapFull } from "@/components/network-map-full"
import { useWallet } from "@/hooks/use-wallet"

export default function MapPage() {
  const { address, connect } = useWallet()

  return (
    <main className="h-screen overflow-hidden bg-black text-white">
      <NetworkMapFull />
    </main>
  )
}
