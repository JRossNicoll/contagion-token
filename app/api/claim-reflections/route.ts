import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { ethers } from "ethers"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json()

    if (!address) {
      return NextResponse.json({ error: "Address required" }, { status: 400 })
    }

    const lowerAddress = address.toLowerCase()

    const { data: holder } = await supabase
      .from("holders")
      .select("virtual_reflection_balance")
      .eq("holder_address", lowerAddress)
      .single()

    if (!holder || !holder.virtual_reflection_balance) {
      return NextResponse.json({ error: "No reflections to claim" }, { status: 400 })
    }

    const claimAmount = BigInt(holder.virtual_reflection_balance)

    if (claimAmount === 0n) {
      return NextResponse.json({ error: "No reflections to claim" }, { status: 400 })
    }

    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL!)
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider)

    const contractABI = ["function distributeReflections(address[] recipients, uint256[] amounts)"]

    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS!, contractABI, wallet)

    // Send the actual tokens on-chain
    const tx = await contract.distributeReflections([address], [claimAmount])
    await tx.wait()

    await supabase.from("reflection_claims").insert({
      holder_address: lowerAddress,
      amount: claimAmount.toString(),
      transaction_hash: tx.hash,
      claimed_at: new Date().toISOString(),
      status: "completed",
    })

    await supabase.from("holders").update({ virtual_reflection_balance: "0" }).eq("holder_address", lowerAddress)

    return NextResponse.json({
      success: true,
      amount: claimAmount.toString(),
      txHash: tx.hash,
    })
  } catch (error: any) {
    console.error("[v0] Claim error:", error)
    return NextResponse.json({ error: error.message || "Failed to claim reflections" }, { status: 500 })
  }
}
