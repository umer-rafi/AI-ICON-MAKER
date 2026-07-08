"use client"

import { useState, useEffect, useCallback } from "react"
import type { DisplayIcon } from "@/types"

interface IconPreviewProps {
  icon: DisplayIcon | null
  onClose: () => void
}

export function IconPreview({ icon, onClose }: IconPreviewProps) {
  const [copiedSvg, setCopiedSvg] = useState(false)
  const [copiedName, setCopiedName] = useState(false)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (icon) {
      document.addEventListener("keydown", handleKeyDown)
      return () => document.removeEventListener("keydown", handleKeyDown)
    }
  }, [icon, handleKeyDown])

  if (!icon) return null

  async function copySvg() {
    if (!icon) return
    try {
      await navigator.clipboard.writeText(icon.svg)
    } catch {
      const ta = document.createElement("textarea")
      ta.value = icon.svg
      document.body.appendChild(ta)
      ta.select()
      document.execCommand("copy")
      document.body.removeChild(ta)
    }
    setCopiedSvg(true)
    setTimeout(() => setCopiedSvg(false), 1500)
  }

  async function copyName() {
    if (!icon) return
    try {
      await navigator.clipboard.writeText(icon.name)
    } catch {
      const ta = document.createElement("textarea")
      ta.value = icon.name
      document.body.appendChild(ta)
      ta.select()
      document.execCommand("copy")
      document.body.removeChild(ta)
    }
    setCopiedName(true)
    setTimeout(() => setCopiedName(false), 1500)
  }

  const isGenerated = icon.library === "generated"

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-lg bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {icon.name}
          </h3>
          <div className="flex items-center gap-2">
            {isGenerated && (
              <span className="text-[10px] flex items-center gap-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 3l2.13 4.42 4.87.71-3.5 3.45.83 4.85L12 14.5l-4.33 2.28.83-4.85L5 8.13l4.87-.71L12 3z" />
                </svg>
                AI Generated
              </span>
            )}
            {!isGenerated && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 capitalize">
                {icon.library}
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-400"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-5 py-6 flex justify-center">
          <div className="w-24 h-24 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
            <span
              className="w-16 h-16"
              dangerouslySetInnerHTML={{
                __html: icon.svg.replace(
                  /(width|height)="24"/g,
                  (attr) => attr.replace("24", "64")
                ),
              }}
            />
          </div>
        </div>

        <div className="px-5 pb-5">
          <div className="relative">
            <pre className="text-[11px] leading-relaxed bg-zinc-50 dark:bg-zinc-900 rounded-xl p-4 overflow-x-auto max-h-32 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 select-all">
              {icon.svg}
            </pre>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={copySvg}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
            >
              {copiedSvg ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copy SVG
                </>
              )}
            </button>
            <button
              onClick={copyName}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-xl text-sm font-medium transition-colors"
            >
              {copiedName ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                  </svg>
                  Copy Name
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
