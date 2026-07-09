// One-time build script: regenerates src/data/icons.ts from the full,
// real icon sets of the 4 installed icon packages (not their aliased
// top-level exports, but each package's canonical per-icon source file).
// Run with: node scripts/generate-icons.mjs

import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { createRequire } from "node:module"
import { readdirSync, writeFileSync } from "node:fs"
import path from "node:path"
import { pathToFileURL } from "node:url"

const require = createRequire(import.meta.url)
const ROOT = process.cwd()

function toKebabCase(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Za-z])([0-9])/g, "$1-$2")
    .toLowerCase()
}

function buildTags(name) {
  const words = name.split("-").filter(Boolean)
  return [...new Set([name.replace(/-/g, " "), ...words])]
}

function normalizeSvg(raw) {
  return raw.replace(/\sclass="[^"]*"/g, "").trim()
}

function renderIcon(Component) {
  return normalizeSvg(renderToStaticMarkup(createElement(Component)))
}

function makeEntry(library, rawName, svg) {
  const name = toKebabCase(rawName)
  return {
    id: `${library}-${name}`,
    name,
    library,
    category: "misc",
    tags: buildTags(name),
    svg,
  }
}

async function collectLucide() {
  const dir = path.join(ROOT, "node_modules/lucide-react/dist/esm/icons")
  const files = readdirSync(dir).filter(
    (f) => f.endsWith(".mjs") && f !== "index.mjs"
  )
  const entries = []
  for (const file of files) {
    try {
      const mod = await import(pathToFileURL(path.join(dir, file)).href)
      const svg = renderIcon(mod.default)
      const rawName = file.replace(/\.mjs$/, "")
      entries.push(makeEntry("lucide", rawName, svg))
    } catch (err) {
      console.warn(`[lucide] skipped ${file}: ${err.message}`)
    }
  }
  return entries
}

async function collectTabler() {
  const dir = path.join(
    ROOT,
    "node_modules/@tabler/icons-react/dist/esm/icons"
  )
  const files = readdirSync(dir).filter(
    (f) => f.endsWith(".mjs") && f !== "index.mjs"
  )
  const entries = []
  for (const file of files) {
    try {
      const mod = await import(pathToFileURL(path.join(dir, file)).href)
      const svg = renderIcon(mod.default)
      const rawName = file.replace(/\.mjs$/, "").replace(/^Icon/, "")
      entries.push(makeEntry("tabler", rawName, svg))
    } catch (err) {
      console.warn(`[tabler] skipped ${file}: ${err.message}`)
    }
  }
  return entries
}

function collectHeroicons() {
  const dir = path.join(ROOT, "node_modules/@heroicons/react/24/outline")
  const files = readdirSync(dir).filter(
    (f) => f.endsWith(".js") && f !== "index.js"
  )
  const entries = []
  for (const file of files) {
    try {
      const Component = require(path.join(dir, file))
      const svg = renderIcon(Component)
      const rawName = file.replace(/\.js$/, "").replace(/Icon$/, "")
      entries.push(makeEntry("heroicons", rawName, svg))
    } catch (err) {
      console.warn(`[heroicons] skipped ${file}: ${err.message}`)
    }
  }
  return entries
}

function collectFeather() {
  const mod = require("react-feather")
  const entries = []
  for (const [rawName, Component] of Object.entries(mod)) {
    try {
      const svg = renderIcon(Component)
      entries.push(makeEntry("feather", rawName, svg))
    } catch (err) {
      console.warn(`[feather] skipped ${rawName}: ${err.message}`)
    }
  }
  return entries
}

const [lucide, tabler, heroicons, feather] = await Promise.all([
  collectLucide(),
  collectTabler(),
  Promise.resolve(collectHeroicons()),
  Promise.resolve(collectFeather()),
])

const all = [...lucide, ...feather, ...heroicons, ...tabler]

console.log(`lucide: ${lucide.length}`)
console.log(`feather: ${feather.length}`)
console.log(`heroicons: ${heroicons.length}`)
console.log(`tabler: ${tabler.length}`)
console.log(`total: ${all.length}`)

// A TS array literal this large blows up the type checker ("union type
// too complex"), so the data lives in JSON and icons.ts just casts it.
writeFileSync(
  path.join(ROOT, "src/data/icons.json"),
  JSON.stringify(all),
  "utf8"
)

const wrapper = `import type { IconEntry } from "@/types"\nimport raw from "./icons.json"\n\nexport const icons = raw as IconEntry[]\n`

writeFileSync(path.join(ROOT, "src/data/icons.ts"), wrapper, "utf8")
console.log("Wrote src/data/icons.json + src/data/icons.ts")
