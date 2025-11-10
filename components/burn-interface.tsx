"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Flame, AlertTriangle, Plus, Minus } from "lucide-react"
import { useState } from "react"
import { ethers } from "ethers"
import { useWallet } from "@/hooks/use-wallet"
import { TOKEN_CONFIG } from "@/lib/token-config"

const DEAD_ADDRESS = "0x000000000000000000000000000000000000dEaD"

export function BurnInterface() {
  const [burnAmount, setBurnAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { address, isConnected, tokenBalance, provider, refreshBalance } = useWallet()

  const balance = Number.parseFloat(tokenBalance || "0")

  const handleBurn = async () => {
    if (!isConnected || !address || !provider) {
      alert("Please connect your wallet first")
      return
    }

    if (!burnAmount || Number.parseFloat(burnAmount) <= 0) {
      alert("Please enter a valid amount to burn")
      return
    }

    if (Number.parseFloat(burnAmount) > balance) {
      alert("Insufficient balance")
      return
    }

    setIsLoading(true)

    try {
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(TOKEN_CONFIG.address, TOKEN_CONFIG.abi, signer)

      const amountInWei = ethers.parseUnits(burnAmount, TOKEN_CONFIG.decimals)

      const tx = await contract.transfer(DEAD_ADDRESS, amountInWei)

      alert("Transaction submitted! Waiting for confirmation...")

      await tx.wait()

      alert(
        `Successfully burned ${burnAmount} tokens! You'll receive ${(Number.parseFloat(burnAmount) * 2).toFixed(2)} tokens in the next airdrop.`,
      )

      await refreshBalance()
      setBurnAmount("")
    } catch (error) {
      console.error("Burn error:", error)
      alert(`Failed to burn tokens: ${error.message || "Please try again"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const incrementAmount = () => {
    const current = Number.parseFloat(burnAmount) || 0
    setBurnAmount((current + 10).toString())
  }

  const decrementAmount = () => {
    const current = Number.parseFloat(burnAmount) || 0
    if (current >= 10) {
      setBurnAmount((current - 10).toString())
    }
  }

  return (
    <Card className="bg-zinc-950/80 border-zinc-800 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-orange-950/50 flex items-center justify-center">
          <Flame className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Burn Tokens</h3>
          <p className="text-sm text-gray-400">Stop the spread and earn rewards</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-400">Amount to Burn</label>
            <span className="text-sm text-gray-500 font-mono">
              Balance: {balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="relative">
            <input
              type="number"
              placeholder="0.00"
              value={burnAmount}
              onChange={(e) => setBurnAmount(e.target.value)}
              className="w-full bg-black border border-zinc-800 text-white font-mono text-lg px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50 pr-32 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-zinc-800"
                onClick={decrementAmount}
                type="button"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-zinc-800"
                onClick={incrementAmount}
                type="button"
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-red-400 hover:text-red-300 hover:bg-zinc-800 ml-1"
                onClick={() => setBurnAmount(balance.toString())}
                type="button"
              >
                MAX
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-black/50 border border-zinc-800 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Reward Multiplier</span>
            <span className="text-white font-mono">2x</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Estimated Airdrop</span>
            <span className="text-green-500 font-mono">
              {burnAmount ? (Number.parseFloat(burnAmount) * 2).toFixed(2) : "0.00"} tokens
            </span>
          </div>
        </div>

        <div className="bg-orange-950/20 border border-orange-500/30 rounded-lg p-3 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-orange-300">
            Burning tokens is permanent and cannot be undone. You will be marked as a "vaccinated wallet" for future
            airdrops.
          </div>
        </div>

        <Button
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-mono text-base disabled:opacity-50"
          size="lg"
          onClick={handleBurn}
          disabled={
            !isConnected ||
            isLoading ||
            !burnAmount ||
            Number.parseFloat(burnAmount) <= 0 ||
            Number.parseFloat(burnAmount) > balance
          }
        >
          <Flame className="w-5 h-5 mr-2" />
          {isLoading ? "BURNING..." : "BURN TOKENS"}
        </Button>
      </div>
    </Card>
  )
}
