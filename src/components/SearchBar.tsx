"use client"

import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from "react"

interface SearchBarProps {
  onSearch: (query: string) => void
  loading: boolean
  initialQuery?: string
}

const suggestions = [
  "minimalist shopping cart",
  "modern AI brain",
  "secure login",
  "cloud upload",
  "dark mode",
  "graduation cap",
  "fitness dumbbell",
  "music note",
  "settings gear",
  "email message",
]

export function SearchBar({ onSearch, loading, initialQuery }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery ?? "")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const filtered = suggestions.filter((s) =>
    s.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  function handleSubmit(e?: FormEvent) {
    e?.preventDefault()
    if (query.trim() && !loading) {
      onSearch(query.trim())
      setShowSuggestions(false)
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!showSuggestions || filtered.length === 0) {
      if (e.key === "Enter") handleSubmit()
      return
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setActiveIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0))
        break
      case "ArrowUp":
        e.preventDefault()
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1))
        break
      case "Enter":
        e.preventDefault()
        if (activeIndex >= 0) {
          setQuery(filtered[activeIndex])
          onSearch(filtered[activeIndex])
          setShowSuggestions(false)
        } else {
          handleSubmit()
        }
        break
      case "Escape":
        setShowSuggestions(false)
        break
    }
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setShowSuggestions(true)
            setActiveIndex(-1)
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder="Describe the icon you need..."
          className="w-full pl-12 pr-14 py-4 text-base bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-zinc-900 dark:text-zinc-100 transition-all"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="absolute inset-y-2 right-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-600 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5"
        >
          {loading ? (
            <svg
              className="animate-spin"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
              Search
            </>
          )}
        </button>
      </form>

      {showSuggestions && filtered.length > 0 && query.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full mt-2 w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg overflow-hidden z-50"
        >
          {filtered.map((suggestion, i) => (
            <button
              key={suggestion}
              type="button"
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 ${
                i === activeIndex
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                  : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
              }`}
              onMouseDown={() => {
                setQuery(suggestion)
                onSearch(suggestion)
                setShowSuggestions(false)
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="shrink-0 text-zinc-400"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
