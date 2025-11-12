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
    <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
      <div className="p-6 border-b border-white/5 bg-gradient-to-r from-orange-500/5 to-red-500/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 flex items-center justify-center">
            <Flame className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Burn Tokens</h3>
            <p className="text-xs text-gray-500 mt-0.5">Eliminate supply, earn rewards</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm text-gray-400 font-medium">Amount to Burn</label>
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
              className="w-full bg-black/40 border border-white/10 text-white font-mono text-xl px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/30 pr-36 backdrop-blur-sm transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-9 w-9 p-0 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg"
                onClick={decrementAmount}
                type="button"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-9 w-9 p-0 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg"
                onClick={incrementAmount}
                type="button"
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 ml-1 font-semibold px-3 rounded-lg"
                onClick={() => setBurnAmount(balance.toString())}
                type="button"
              >
                MAX
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-black/60 to-black/40 border border-white/10 rounded-xl p-5 space-y-3 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400 font-medium">Reward Multiplier</span>
            <span className="text-lg text-white font-mono font-bold">2.0×</span>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400 font-medium">Estimated Airdrop</span>
            <span className="text-lg font-mono font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              {burnAmount ? `+${(Number.parseFloat(burnAmount) * 2).toFixed(2)}` : "0.00"}
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-950/30 to-red-950/30 border border-orange-500/30 rounded-xl p-4 flex gap-3 backdrop-blur-sm">
          <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-orange-300 leading-relaxed">
            <strong className="font-semibold">Warning:</strong> Burning tokens is permanent and irreversible. You will
            be marked as a "vaccinated wallet" for future airdrops.
          </div>
        </div>

        <Button
          className="w-full h-14 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-mono text-base font-bold disabled:opacity-50 shadow-lg shadow-orange-500/20 transition-all hover:shadow-xl hover:shadow-orange-500/30"
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
