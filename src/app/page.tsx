"use client"

import { useState, useCallback, useRef } from "react"
import type { IconEntry, GeneratedIcon, DisplayIcon } from "@/types"
import { ICON_LIBRARIES } from "@/types"
import { SearchBar } from "@/components/SearchBar"
import { IconGrid } from "@/components/IconGrid"
import { IconPreview } from "@/components/IconPreview"
import { FilterLibrary } from "@/components/FilterLibrary"
import { ThemeToggle } from "@/components/ThemeToggle"

export default function Home() {
  const [icons, setIcons] = useState<IconEntry[]>([])
  const [generatedIcons, setGeneratedIcons] = useState<GeneratedIcon[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [query, setQuery] = useState("")
  const [aiPowered, setAiPowered] = useState(false)
  const [aiExpandedQuery, setAiExpandedQuery] = useState<string | undefined>()
  const [total, setTotal] = useState(0)
  const [library, setLibrary] = useState<string | undefined>()
  const [error, setError] = useState<string | null>(null)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [previewIcon, setPreviewIcon] = useState<DisplayIcon | null>(null)
  const generatingRef = useRef(false)
  const lastGenerateTime = useRef(0)

  const libraries = ICON_LIBRARIES

  const handleSearch = useCallback(
    async (q: string) => {
      setQuery(q)
      setLoading(true)
      setError(null)
      setGenerateError(null)

      try {
        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: q,
            library: library || undefined,
          }),
        })

        const data = await res.json()

        if (data.success) {
          setIcons(data.data.icons)
          setTotal(data.data.total)
          setAiPowered(data.data.aiPowered)
          setAiExpandedQuery(data.data.aiExpandedQuery)
        } else {
          setError(data.error ?? "Search failed")
        }
      } catch {
        setError("Failed to search. Please try again.")
      } finally {
        setLoading(false)
      }
    },
    [library]
  )

  const handleGenerateIcon = useCallback(async () => {
    if (!query.trim() || generatingRef.current) return
    const now = Date.now()
    if (now - lastGenerateTime.current < 3000) return
    lastGenerateTime.current = now
    generatingRef.current = true
    setGenerating(true)
    setGenerateError(null)

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: query.trim() }),
      })

      const data = await res.json()

      if (data.success) {
        const newIcon: GeneratedIcon = {
          id: `generated-${Date.now()}`,
          name: query.trim(),
          svg: data.data.svg,
          library: "generated",
        }
        setGeneratedIcons((prev) => [newIcon, ...prev])
      } else {
        setGenerateError(data.error ?? "Generation failed")
      }
    } catch {
      setGenerateError("Network error. Please try again.")
    } finally {
      setGenerating(false)
      generatingRef.current = false
    }
  }, [query])

  function handleLibraryChange(lib: string | undefined) {
    setLibrary(lib)
    if (query) {
      handleSearch(query)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <span className="font-semibold text-sm">AI Icon Finder</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            Find the perfect icon
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
            Describe the icon you need in natural language and get matches from
            multiple icon libraries
          </p>
        </div>

        <SearchBar onSearch={handleSearch} loading={loading} />

        {error && (
          <div className="mt-4 text-center text-sm text-red-500 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="mt-8 space-y-6">
          {(icons.length > 0 || loading) && (
            <FilterLibrary
              libraries={libraries}
              selected={library}
              onChange={handleLibraryChange}
            />
          )}

          <IconGrid
            icons={icons}
            generatedIcons={generatedIcons}
            loading={loading}
            generating={generating}
            generateError={generateError}
            aiPowered={aiPowered}
            aiExpandedQuery={aiExpandedQuery}
            total={total}
            query={query}
            onSelectIcon={setPreviewIcon}
            onGenerate={handleGenerateIcon}
          />
        </div>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-4">
        <p className="text-xs text-center text-zinc-400 dark:text-zinc-500">
          Powered by OpenRouter AI &middot;{" "}
          {libraries.map((l) => l.charAt(0).toUpperCase() + l.slice(1)).join(", ")}
        </p>
      </footer>

      <IconPreview icon={previewIcon} onClose={() => setPreviewIcon(null)} />
    </div>
  )
}
