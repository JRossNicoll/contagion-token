import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    const [holdersResult, infectionsResult, proxiesResult, snapshotsResult] = await Promise.allSettled([
      supabase.from("holders").select("*", { count: "exact", head: true }),
      supabase.from("infections").select("*", { count: "exact", head: true }),
      supabase.from("proxy_wallets").select("*", { count: "exact", head: true }),
      supabase.from("snapshots").select("*").order("snapshot_id", { ascending: false }).limit(1).single(),
    ])

    const totalHolders = holdersResult.status === "fulfilled" ? holdersResult.value.count || 0 : 0
    const totalInfections = infectionsResult.status === "fulfilled" ? infectionsResult.value.count || 0 : 0
    const totalProxies = proxiesResult.status === "fulfilled" ? proxiesResult.value.count || 0 : 0
    const latestSnapshot = snapshotsResult.status === "fulfilled" ? snapshotsResult.value.data : null

    return NextResponse.json({
      total_holders: totalHolders,
      total_infections: totalInfections,
      patient_zeros: totalProxies,
      transmission_rate: 3,
      latestSnapshot,
    })
  } catch (error: any) {
    console.error("[v0] [API /stats] Error:", error)
    return NextResponse.json(
      {
        error: error.message || "Internal server error",
        total_holders: 0,
        total_infections: 0,
        patient_zeros: 0,
        transmission_rate: 3,
      },
      { status: 200 }, // Return 200 with fallback data instead of error
    )
  }
}
