"use client"

import type { DisplayIcon, IconEntry, GeneratedIcon } from "@/types"
import { IconCard } from "./IconCard"

interface IconGridProps {
  icons: IconEntry[]
  generatedIcons: GeneratedIcon[]
  loading: boolean
  generating: boolean
  generateError?: string | null
  aiPowered: boolean
  aiExpandedQuery?: string
  total: number
  query: string
  onSelectIcon: (icon: DisplayIcon) => void
  onGenerate: () => void
}

function SkeletonCard() {
  return (
    <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 animate-pulse">
      <div className="w-10 h-10 rounded-lg bg-zinc-200 dark:bg-zinc-700" />
      <div className="h-3 w-16 rounded bg-zinc-200 dark:bg-zinc-700" />
      <div className="h-4 w-12 rounded-full bg-zinc-200 dark:bg-zinc-700" />
    </div>
  )
}

export function IconGrid({
  icons,
  generatedIcons,
  loading,
  generating,
  generateError,
  aiPowered,
  aiExpandedQuery,
  total,
  query,
  onSelectIcon,
  onGenerate,
}: IconGridProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-4 w-48 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (icons.length === 0 && query) {
    return (
      <div className="flex flex-col items-center gap-6 py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <div>
          <p className="text-zinc-500 dark:text-zinc-400 mb-1">
            No library icons found for &ldquo;{query}&rdquo;
          </p>
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            Try a different description or generate a custom icon with AI
          </p>
        </div>
          <button
            onClick={onGenerate}
            disabled={generating}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-xl text-sm font-medium transition-colors"
          >
            {generating ? (
              <>
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 3l2.13 4.42 4.87.71-3.5 3.45.83 4.85L12 14.5l-4.33 2.28.83-4.85L5 8.13l4.87-.71L12 3z" />
                </svg>
                Generate with AI
              </>
            )}
          </button>
          {generateError && (
            <p className="text-xs text-red-500 dark:text-red-400">{generateError}</p>
          )}
        {generatedIcons.length > 0 && (
          <div className="w-full space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 3l2.13 4.42 4.87.71-3.5 3.45.83 4.85L12 14.5l-4.33 2.28.83-4.85L5 8.13l4.87-.71L12 3z" />
                </svg>
                AI Generated
              </p>
              <button
                onClick={onGenerate}
                disabled={generating}
                className="text-xs text-purple-600 dark:text-purple-400 hover:underline disabled:opacity-50"
              >
                Generate more
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {generatedIcons.map((gen) => (
                <IconCard
                  key={gen.id}
                  icon={gen}
                  onSelect={onSelectIcon}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (icons.length === 0 && generatedIcons.length === 0) return null

  return (
    <div className="space-y-6">
      {icons.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Found{" "}
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                {total}
              </span>{" "}
              icons
              {aiPowered && (
                <span className="ml-2 inline-flex items-center gap-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 3l2.13 4.42 4.87.71-3.5 3.45.83 4.85L12 14.5l-4.33 2.28.83-4.85L5 8.13l4.87-.71L12 3z" />
                  </svg>
                  AI-powered
                </span>
              )}
            </p>
            <button
              onClick={onGenerate}
              disabled={generating}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg transition-colors"
            >
              {generating ? (
                <>
                  <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 3l2.13 4.42 4.87.71-3.5 3.45.83 4.85L12 14.5l-4.33 2.28.83-4.85L5 8.13l4.87-.71L12 3z" />
                  </svg>
                  Generate with AI
                </>
              )}
            </button>
          </div>
          {generateError && (
            <p className="text-xs text-red-500 dark:text-red-400">{generateError}</p>
          )}

          {aiExpandedQuery && (
            <p className="text-xs text-zinc-400 dark:text-zinc-500 italic">
              AI interpreted: {aiExpandedQuery}
            </p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {icons.map((icon) => (
              <IconCard key={icon.id} icon={icon} onSelect={onSelectIcon} />
            ))}
          </div>
        </div>
      )}

      {generatedIcons.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3l2.13 4.42 4.87.71-3.5 3.45.83 4.85L12 14.5l-4.33 2.28.83-4.85L5 8.13l4.87-.71L12 3z" />
              </svg>
              AI Generated
            </p>
            <button
              onClick={onGenerate}
              disabled={generating}
              className="text-xs text-purple-600 dark:text-purple-400 hover:underline disabled:opacity-50"
            >
              {generating ? "Generating..." : "Generate more"}
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {generatedIcons.map((gen) => (
              <IconCard
                key={gen.id}
                icon={gen}
                onSelect={onSelectIcon}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
