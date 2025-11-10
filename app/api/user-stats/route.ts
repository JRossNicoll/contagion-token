import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const address = searchParams.get("address")

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 })
    }

    console.log("[v0] Fetching user stats for address:", address)

    const { data: holder, error: holderError } = await supabase
      .from("holders")
      .select("*")
      .eq("holder_address", address.toLowerCase())
      .single()

    if (holderError && holderError.code !== "PGRST116") {
      console.error("[v0] Error fetching holder:", holderError)
    }

    const { count: infectionsCount, error: infectionsError } = await supabase
      .from("infections")
      .select("*", { count: "exact", head: true })
      .eq("infector_address", address.toLowerCase())

    if (infectionsError) {
      console.error("[v0] Error counting infections:", infectionsError)
    }

    const { data: firstInfection } = await supabase
      .from("infections")
      .select("created_at")
      .eq("infector_address", address.toLowerCase())
      .order("created_at", { ascending: true })
      .limit(1)
      .single()

    const daysSinceFirst = firstInfection
      ? Math.max(1, (Date.now() - new Date(firstInfection.created_at).getTime()) / (1000 * 60 * 60 * 24))
      : 1
    const spreadRate = (infectionsCount || 0) / daysSinceFirst

    const { data: rankedHolders } = await supabase
      .from("infections")
      .select("infector_address")
      .not("infector_address", "is", null)

    const infectionCounts = new Map<string, number>()
    rankedHolders?.forEach((r) => {
      const addr = r.infector_address.toLowerCase()
      infectionCounts.set(addr, (infectionCounts.get(addr) || 0) + 1)
    })

    const sortedCounts = Array.from(infectionCounts.values()).sort((a, b) => b - a)
    const userCount = infectionsCount || 0
    const globalRank = sortedCounts.filter((count) => count > userCount).length + 1

    return NextResponse.json({
      infections_count: infectionsCount || 0,
      spread_rate: Number(spreadRate.toFixed(2)),
      burned_amount: 0,
      rank: globalRank,
      holder_balance: holder?.balance || 0,
      virtual_reflection_balance: holder?.virtual_reflection_balance || "0",
    })
  } catch (error) {
    console.error("[v0] Error in user-stats API:", error)
    return NextResponse.json({ error: "Failed to fetch user stats" }, { status: 500 })
  }
}
