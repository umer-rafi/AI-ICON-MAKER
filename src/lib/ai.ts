import type { AIKeywordResult, OpenRouterResponse, GeminiResponse } from "@/types"

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const GEMINI_API_KEY = process.env.GEMINI_API_KEY

let lastModelError: string | null = null
let rateLimitCooldown = 0
let lastWasRateLimited = false

export function popModelError(): string | null {
  const e = lastModelError
  lastModelError = null
  return e
}

const MODELS = [
  "qwen/qwen3-coder",             // free — strong at structured/code-like output, tried first ($0)
  "deepseek/deepseek-v4-flash",   // $0.09/$0.18 per M tokens — cheapest paid fallback
  "google/gemini-2.5-flash-lite", // $0.10/$0.40 per M tokens — secondary paid fallback
]

export function hasApiKey(): boolean {
  return (!!OPENROUTER_API_KEY && OPENROUTER_API_KEY.length > 0) ||
         (!!GEMINI_API_KEY && GEMINI_API_KEY.length > 0)
}

const SEARCH_PROMPT = `You are an icon search assistant. Given a description of an icon, generate the most PRECISE and RELEVANT search keywords and icon names.

Return ONLY valid JSON with this exact structure:
{
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "iconNames": ["icon-name-1", "icon-name-2"],
  "explanation": "Brief reason for the match"
}

CRITICAL rules:
- keywords: 3-5 specific, concrete terms (e.g. "shopping", "arrow", "user", "home") — NOT abstract concepts
- iconNames: 1-3 specific icon names that BEST match (use kebab-case)
- explanation: one short sentence
- ONLY generate keywords that correspond to real, concrete icon concepts
- DO NOT generate vague or abstract terms like "interface", "interaction", "marketing", "administration"
- Focus narrowly on the exact intent — avoid broad synonyms`

const GENERATE_PROMPT = `You generate SVG icons by composing basic geometric shapes. The viewBox is 24x24 with (0,0) at top-left and (24,24) at bottom-right. Center is roughly (12,12).

CRITICAL RULES:
- Draw ONLY the exact object the user describes — do NOT substitute a different object
- Use simple, recognizable geometric shapes at specific coordinates
- Every icon must be visually identifiable at a glance
- Generate DIFFERENT path coordinates each call for variety

GEOMETRY GUIDE (use these to build recognizable icons):
- Circles: <circle cx="x" cy="y" r="r"/> — use for wheels, heads, knobs, dots
- Rectangles: <rect x="x" y="y" width="w" height="h" rx="r"/> — use for bodies, screens, boxes
- Lines: <line x1="x" y1="y" x2="x" y2="y"/> — use for legs, arms, connectors
- Paths: <path d="M x y L x y ..."/> — use for complex shapes, curves, outlines
- Polygons: <polygon points="x,y x,y ..."/> — use for triangles, arrows

COMMON OBJECT STRUCTURES (position within 24x24):
- Car: body rect at (3,8) to (21,16), wheels as circles at (7,17) and (17,17), windows as rect inside body
- Laptop: large rect for screen on top, smaller rect for keyboard below, hinge line between them
- User/Person: circle head at (12,6), body line from (12,10) to (12,16), arms at (8,12)-(16,12), legs at (12,16)-(8,22) and (12,16)-(16,22)
- Heart: two arcs at top meeting at bottom point
- Star: polygon or path with 5 points
- Mail: rect with V-shaped path inside
- Bell: semicircle on top, rect body, small circle at bottom
- Phone: rounded rect with line at bottom
- Settings/Cog: large circle with small circle inside, teeth around edge
- Trash: rect body with lines, lid on top

General Requirements:
- 24x24 viewBox
- stroke="currentColor", fill="none", stroke-width="2"
- stroke-linecap="round", stroke-linejoin="round"
- Minimalist, clean design
- Single <svg> element with proper xmlns
- NO markdown, NO code blocks, NO explanation — just the raw SVG

Examples of valid icons:
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-8 8-8s8 4 8 8"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="10" rx="2"/><circle cx="8" cy="18" r="2"/><circle cx="16" cy="18" r="2"/><line x1="3" y1="12" x2="21" y2="12"/></svg>`

async function tryModel<T>(
  systemPrompt: string,
  userQuery: string,
  parser: (content: string) => T | null,
  model: string,
  retries = 1,
  temperature = 0.3
): Promise<T | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        signal: controller.signal,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://ai-icon-finder.vercel.app",
          "X-Title": "AI Icon Finder",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userQuery },
          ],
          temperature,
          max_tokens: 1500,
        }),
      }
    )
    clearTimeout(timeout)
    if (response.status === 429 && retries > 0) {
      lastWasRateLimited = true
      console.warn(`Model ${model} rate limited (429), retrying in 3s...`)
      await new Promise((r) => setTimeout(r, 3000))
      return tryModel(systemPrompt, userQuery, parser, model, retries - 1, temperature)
    }
    if (response.status === 429) lastWasRateLimited = true
    if (!response.ok) {
      lastModelError = `Model ${model} returned HTTP ${response.status}`
      console.error(`AI model ${model} returned HTTP ${response.status}`)
      return null
    }
    const data: OpenRouterResponse = await response.json()
    const content = data.choices?.[0]?.message?.content
    if (!content) {
      lastModelError = `Model ${model} returned empty response`
      return null
    }
    const parsed = parser(content)
    if (parsed === null) {
      lastModelError = `Model ${model} returned content that failed to parse: ${content.slice(0, 200)}`
    }
    return parsed
  } catch (error) {
    console.error(`AI model ${model} failed:`, error)
    return null
  }
}

async function tryGemini<T>(
  systemPrompt: string,
  userQuery: string,
  parser: (content: string) => T | null,
  temperature = 0.3
): Promise<T | null> {
  if (!GEMINI_API_KEY || GEMINI_API_KEY.length === 0) return null
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=" + GEMINI_API_KEY,
      {
        signal: controller.signal,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${systemPrompt}\n\n${userQuery}` }],
            },
          ],
          generationConfig: { temperature, maxOutputTokens: 1500 },
        }),
      }
    )
    clearTimeout(timeout)
    if (response.status === 429) lastWasRateLimited = true
    if (!response.ok) {
      lastModelError = `Gemini returned HTTP ${response.status}`
      console.error(`Gemini returned HTTP ${response.status}`)
      return null
    }
    const data: GeminiResponse = await response.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!content) {
      lastModelError = `Gemini returned empty response (finish: ${data.candidates?.[0]?.finishReason})`
      return null
    }
    const parsed = parser(content)
    if (parsed === null) {
      lastModelError = `Gemini returned content that failed to parse: ${content.slice(0, 200)}`
    }
    return parsed
  } catch (error) {
    console.error("Gemini API failed:", error)
    return null
  }
}

async function tryModels<T>(
  systemPrompt: string,
  userQuery: string,
  parser: (content: string) => T | null,
  temperature = 0.3
): Promise<T | null> {
  if (rateLimitCooldown > Date.now()) return null
  lastWasRateLimited = false
  for (const model of MODELS) {
    const result = await tryModel(systemPrompt, userQuery, parser, model, 1, temperature)
    if (result) return result
  }
  const geminiResult = await tryGemini(systemPrompt, userQuery, parser, temperature)
  if (geminiResult) return geminiResult
  if (lastWasRateLimited) rateLimitCooldown = Date.now() + 60000
  return null
}

function parseStyledContent(content: string): string {
  return content.replace(/```(?:svg|html|xml|json)?\s*/gi, "").replace(/```/g, "").trim()
}

export async function expandQuery(
  query: string
): Promise<AIKeywordResult | null> {
  const parser = (content: string): AIKeywordResult | null => {
    try {
      return JSON.parse(parseStyledContent(content))
    } catch (e) {
      console.error("expandQuery JSON parse failed:", e)
      return null
    }
  }
  return tryModels(SEARCH_PROMPT, query, parser, 0.1)
}

function extractSVG(text: string): string | null {
  const cleaned = parseStyledContent(text)
  if (cleaned.includes("<svg")) {
    const match = cleaned.match(/<svg[\s\S]*?(<\/svg>|$)/)
    if (match) {
      let svg = match[0]
      if (!svg.endsWith("</svg>")) {
        svg += "</svg>"
      }
      return svg
    }
  }
  try {
    const parsed = JSON.parse(cleaned)
    if (parsed.svg && typeof parsed.svg === "string" && parsed.svg.includes("<svg")) {
      const match = parsed.svg.match(/<svg[\s\S]*?(<\/svg>|$)/)
      if (match) {
        let svg = match[0]
        if (!svg.endsWith("</svg>")) {
          svg += "</svg>"
        }
        return svg
      }
    }
  } catch {}
  return null
}

export async function generateIconSVG(
  description: string
): Promise<string | null> {
  const parser = (content: string): string | null => {
    const result = extractSVG(content)
    if (!result) {
      lastModelError = `Failed to extract SVG: ${content.slice(0, 200)}`
    }
    return result
  }
  return tryModels(GENERATE_PROMPT, description, parser)
}
