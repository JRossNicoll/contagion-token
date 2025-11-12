"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/hooks/use-wallet"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function ClaimReflectionsButton({ virtualBalance }: { virtualBalance: string }) {
  const { address } = useWallet()
  const { toast } = useToast()
  const [claiming, setClaiming] = useState(false)

  const handleClaim = async () => {
    if (!address) return

    setClaiming(true)
    try {
      const response = await fetch("/api/claim-reflections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Reflections Claimed!",
          description: `Successfully claimed ${(Number(data.amount) / 1e9).toLocaleString()} RPLC tokens`,
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: "Claim Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setClaiming(false)
    }
  }

  const balance = Number(virtualBalance) / 1e9

  if (balance === 0) return null

  return (
    <Button onClick={handleClaim} disabled={claiming}>
      {claiming ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Claiming...
        </>
      ) : (
        `Claim ${balance.toLocaleString()} RPLC Reflections`
      )}
    </Button>
  )
}
