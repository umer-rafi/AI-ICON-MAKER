export type IconLibrary = "lucide" | "feather" | "heroicons" | "tabler"

export const ICON_LIBRARIES: IconLibrary[] = ["lucide", "feather", "heroicons", "tabler"]

export interface IconEntry {
  id: string
  name: string
  library: IconLibrary
  category: string
  tags: string[]
  svg: string
}

export interface GeneratedIcon {
  id: string
  name: string
  svg: string
  library: "generated"
}

export type DisplayIcon = IconEntry | GeneratedIcon

export interface SearchResult {
  icons: IconEntry[]
  query: string
  total: number
  aiPowered: boolean
  aiExpandedQuery?: string
}

export interface SearchResponse {
  success: boolean
  data?: SearchResult
  error?: string
}

export interface GenerateResponse {
  success: boolean
  data?: {
    svg: string
    description: string
  }
  error?: string
}

export interface OpenRouterResponse {
  id: string
  choices: {
    message: {
      content: string
    }
  }[]
}

export interface AIKeywordResult {
  keywords: string[]
  iconNames: string[]
  explanation: string
}

export interface GeminiResponse {
  candidates: {
    content: {
      parts: { text: string }[]
    }
    finishReason?: string
  }[]
}
