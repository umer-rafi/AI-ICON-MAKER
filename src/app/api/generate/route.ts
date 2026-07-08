import { NextRequest } from "next/server"
import { generateIconSVG, popModelError } from "@/lib/ai"
import { generateLocalIcon } from "@/lib/local-generator"
import type { GenerateResponse } from "@/types"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { description } = body

    if (
      !description ||
      typeof description !== "string" ||
      description.trim().length === 0
    ) {
      return Response.json(
        { success: false, error: "Description is required" } satisfies GenerateResponse,
        { status: 400 }
      )
    }

    const trimmed = description.trim()
    const aiSvg = await generateIconSVG(trimmed)

    if (aiSvg) {
      return Response.json({
        success: true,
        data: { svg: aiSvg, description: trimmed },
      } satisfies GenerateResponse)
    }

    const detail = popModelError()
    console.warn("AI generation failed, using local fallback:", detail)
    const localSvg = generateLocalIcon(trimmed)
    return Response.json({
      success: true,
      data: { svg: localSvg, description: trimmed },
    } satisfies GenerateResponse)
  } catch (error) {
    console.error("Generate API error:", error)
    return Response.json(
      { success: false, error: "Internal server error" } satisfies GenerateResponse,
      { status: 500 }
    )
  }
}
