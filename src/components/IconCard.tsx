"use client"

import type { DisplayIcon } from "@/types"

interface IconCardProps {
  icon: DisplayIcon
  onSelect?: (icon: DisplayIcon) => void
}

const libraryColors: Record<string, string> = {
  lucide: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  feather: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  heroicons: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
  fontawesome:
    "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  material: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  tabler: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
}

export function IconCard({ icon, onSelect }: IconCardProps) {
  return (
    <button
      onClick={() => onSelect?.(icon)}
      className="group relative flex flex-col items-center gap-2 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md dark:hover:shadow-blue-900/20 transition-all cursor-pointer"
    >
      <span
        className="w-10 h-10 flex items-center justify-center text-zinc-700 dark:text-zinc-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
        dangerouslySetInnerHTML={{ __html: icon.svg }}
      />
      <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-full group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
        {icon.name}
      </span>
      <span
        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${icon.library === "generated" ? "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300" : (libraryColors[icon.library] ?? "bg-zinc-100 text-zinc-600")}`}
      >
        {icon.library === "generated" ? "AI" : icon.library}
      </span>
    </button>
  )
}
