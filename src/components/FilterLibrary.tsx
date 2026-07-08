"use client"

import type { IconLibrary } from "@/types"

interface FilterLibraryProps {
  libraries: IconLibrary[]
  selected?: string
  onChange: (library: string | undefined) => void
}

export function FilterLibrary({
  libraries,
  selected,
  onChange,
}: FilterLibraryProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={() => onChange(undefined)}
        className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
          !selected
            ? "bg-blue-600 text-white"
            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
        }`}
      >
        All
      </button>
      {libraries.map((lib) => (
        <button
          key={lib}
          onClick={() => onChange(lib === selected ? undefined : lib)}
          className={`px-3 py-1.5 text-xs font-medium rounded-full capitalize transition-colors ${
            selected === lib
              ? "bg-blue-600 text-white"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
          }`}
        >
          {lib}
        </button>
      ))}
    </div>
  )
}
