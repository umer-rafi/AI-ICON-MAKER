import { NextRequest } from "next/server"
import { expandQuery } from "@/lib/ai"
import { searchIcons } from "@/lib/search"
import type { SearchResponse } from "@/types"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, library } = body

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return Response.json(
        { success: false, error: "Query is required" } satisfies SearchResponse,
        { status: 400 }
      )
    }

    const trimmedQuery = query.trim()

    let aiResult = null
    try {
      aiResult = await expandQuery(trimmedQuery)
    } catch (e) {
      console.error("expandQuery failed:", e)
      aiResult = null
    }

    const { results, aiExpandedQuery } = searchIcons(
      trimmedQuery,
      aiResult,
      library
    )

    return Response.json({
      success: true,
      data: {
        icons: results,
        query: trimmedQuery,
        total: results.length,
        aiPowered: !!aiResult,
        aiExpandedQuery,
      },
    } satisfies SearchResponse)
  } catch (error) {
    console.error("Search API error:", error)
    return Response.json(
      {
        success: false,
        error: "Internal server error",
      } satisfies SearchResponse,
      { status: 500 }
    )
  }
}
