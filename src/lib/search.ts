import type { IconEntry, AIKeywordResult } from "@/types"
import { icons } from "@/data/icons"

function normalize(text: string): string {
  return text.toLowerCase().replace(/[-_]/g, " ").trim()
}

function tokenize(text: string): string[] {
  return normalize(text)
    .split(/\s+/)
    .filter((t) => t.length > 0)
}

const validIconTerms = new Set<string>()
for (const icon of icons) {
  validIconTerms.add(normalize(icon.name))
  for (const tag of icon.tags) validIconTerms.add(normalize(tag))
}

function matchesTerm(text: string, term: string): boolean {
  if (text === term) return true
  if (term.length < 4) return false
  return text.includes(term) || text.startsWith(term)
}

function scoreIcon(
  icon: IconEntry,
  originalTerms: string[],
  expandedTerms: string[]
): number {
  let score = 0
  const nameNorm = normalize(icon.name)
  const tagNorms = icon.tags.map(normalize)
  const categoryNorm = normalize(icon.category)

  const queryPhrase = originalTerms.join(" ")

  if (nameNorm === queryPhrase) score += 1000
  else if (queryPhrase.length >= 4 && nameNorm.includes(queryPhrase)) score += 500

  let originalHits = 0
  for (const term of originalTerms) {
    let matched = false
    if (nameNorm === term) { score += 250; matched = true }
    else if (term.length >= 4 && nameNorm.includes(term)) { score += 150; matched = true }
    else if (term.length >= 4 && nameNorm.split(/\s+/).some((w) => w.startsWith(term))) { score += 80; matched = true }

    for (const tag of tagNorms) {
      if (tag === term) { score += 200; matched = true }
      else if (term.length >= 4 && tag.includes(term)) { score += 100; matched = true }
      else if (term.length >= 4 && tag.startsWith(term)) { score += 50; matched = true }
    }

    if (categoryNorm === term) { score += 100; matched = true }
    else if (term.length >= 4 && categoryNorm.includes(term)) { score += 100; matched = true }
    if (matched) originalHits++
  }

  for (const term of expandedTerms) {
    if (nameNorm === term) score += 12
    else if (term.length >= 4 && nameNorm.includes(term)) score += 8

    for (const tag of tagNorms) {
      if (tag === term) score += 10
      else if (term.length >= 4 && tag.includes(term)) score += 5
      else if (term.length >= 4 && tag.startsWith(term)) score += 2
    }

    if (categoryNorm === term) score += 5
    else if (term.length >= 4 && categoryNorm.includes(term)) score += 5
  }

  if (originalTerms.length > 0) {
    const coverage = originalHits / originalTerms.length
    score = score * (0.5 + coverage * 0.5)
  }

  return score
}

export function searchIcons(
  query: string,
  aiResult: AIKeywordResult | null,
  libraryFilter?: string
): { results: IconEntry[]; aiExpandedQuery?: string } {
  const originalTerms = tokenize(query)
  let expandedTerms: string[] = []
  let aiExpandedQuery: string | undefined

  if (aiResult) {
    const aiSet = new Set<string>()
    for (const kw of aiResult.keywords) {
      tokenize(kw).forEach((t) => { if (validIconTerms.has(t)) aiSet.add(t) })
    }
    for (const name of aiResult.iconNames) {
      const n = normalize(name)
      if (validIconTerms.has(n)) aiSet.add(n)
    }
    expandedTerms = [...aiSet].filter((t) => !originalTerms.includes(t))

    if (expandedTerms.length > 0 && originalTerms.length > 0) {
      const originalMatchedIds = new Set(
        icons
          .filter((icon) => {
            const norm = normalize(icon.name)
            const tags = icon.tags.map(normalize)
            return originalTerms.some(
              (t) => norm === t || tags.includes(t)
            )
          })
          .map((icon) => icon.id)
      )
      if (originalMatchedIds.size > 0) {
        expandedTerms = expandedTerms.filter((term) =>
          icons.some((icon) => {
            if (!originalMatchedIds.has(icon.id)) return false
            const norm = normalize(icon.name)
            const tags = icon.tags.map(normalize)
            return (
              norm === term ||
              norm.includes(term) ||
              tags.some((t) => t === term || t.includes(term))
            )
          })
        )
      }
    }

    aiExpandedQuery = aiResult.explanation
  }

  let scored = icons
    .filter((icon) => !libraryFilter || icon.library === libraryFilter)
    .map((icon) => ({
      icon,
      score: scoreIcon(icon, originalTerms, expandedTerms),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 24)

  return {
    results: scored.map((item) => item.icon),
    aiExpandedQuery,
  }
}

export function getLibraries(): string[] {
  return [...new Set(icons.map((i) => i.library))]
}
