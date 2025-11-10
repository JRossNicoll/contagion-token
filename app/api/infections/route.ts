import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const address = searchParams.get("address")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = (page - 1) * limit

    let query = supabase.from("infections").select("*", { count: "exact" }).order("created_at", { ascending: false })

    if (address) {
      query = query.or(`infector_address.eq.${address},infected_address.eq.${address}`)
    }

    const { data: infections, error, count } = await query.range(offset, offset + limit - 1)

    if (error) {
      throw error
    }

    return NextResponse.json({
      infections,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
