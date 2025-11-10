import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = Number.parseInt(searchParams.get("limit") || "100")

    console.log("[v0] Fetching infection chain data, limit:", limit)

    const { data: infections, error } = await supabase
      .from("infections")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("[v0] Error fetching infections:", error)
      throw error
    }

    const formattedInfections = infections.map((infection) => ({
      infected_wallet: infection.infected_address,
      infected_by_wallet: infection.infector_address,
      infected_count: 1,
      infection_amount: infection.infection_amount,
      created_at: infection.created_at,
    }))

    console.log("[v0] Returning", formattedInfections.length, "infections for map")

    return NextResponse.json({
      infections: formattedInfections,
      total: formattedInfections.length,
    })
  } catch (error: any) {
    console.error("[v0] Error in infection-chain API:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch infection chain" }, { status: 500 })
  }
}
