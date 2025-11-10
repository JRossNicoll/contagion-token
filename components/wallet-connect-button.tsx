"use client"

import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"

interface WalletConnectButtonProps {
  className?: string
}

export function WalletConnectButton({ className }: WalletConnectButtonProps) {
  const { address, isConnected, connect, disconnect } = useWallet()

  if (isConnected && address) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => disconnect()}
        className={`border-red-500/30 bg-red-950/20 text-red-400 hover:bg-red-950/40 hover:text-red-300 font-mono transition-all ${className}`}
      >
        <Wallet className="w-4 h-4 mr-2" />
        {address.slice(0, 6)}...{address.slice(-4)}
      </Button>
    )
  }

  return (
    <Button
      size="sm"
      onClick={connect}
      className={`bg-red-600 hover:bg-red-700 text-white font-mono shadow-lg shadow-red-500/20 transition-all ${className}`}
    >
      <Wallet className="w-4 h-4 mr-2" />
      <span className="hidden sm:inline">CONNECT</span>
      <span className="sm:hidden">0xAF4F...9972</span>
    </Button>
  )
}
