# AI Icon Finder

Describe an icon in plain English and get matching results across six icon libraries. If nothing matches, generate a brand-new SVG icon with AI on the spot.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js 16 App (React 19)                │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐    │
│  │  Search  │→ │  Filter  │→ │  Icon    │→ │  Preview   │    │
│  │  Bar     │  │  Library │  │  Grid    │  │  & Details │    │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘    │
│        │                                                     │
│        ▼ (no match)                                          │
│  ┌────────────────────────┐                                  │
│  │  Generate with AI      │                                  │
│  │  → AI SVG or local      │                                  │
│  │    template fallback    │                                  │
│  └────────────────────────┘                                  │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Routes (server-side)                 │
│                                                               │
│  POST /api/search    → AI keyword expansion + local scoring  │
│  POST /api/generate  → AI SVG generation + local fallback     │
│                                                               │
│  Both routes use OpenRouter AI, with a local fallback so      │
│  the app always returns a result even if every model fails.  │
└─────────────────────────────────────────────────────────────┘
```

## Features

- **Natural Language Search** — describe an icon ("secure login", "cloud upload") and get ranked matches, not just exact-name lookups
- **AI Query Expansion** — an LLM expands your query into concrete keywords and icon names before scoring, so vague descriptions still find the right icon
- **1,386 Icons, 6 Libraries** — Lucide, Feather, Heroicons, Tabler, Font Awesome, and Material, 231 icons each, searchable as one set
- **AI Icon Generation** — when no library icon matches, generate a custom SVG on the spot from your description
- **Local Fallback Generator** — ~50 hand-written regex-matched SVG templates plus a deterministic color-initial fallback, so generation never comes back empty even if every AI model is down
- **Library Filtering** — narrow results to a single icon library
- **Dark Mode** — persistent theme toggle across the app

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (Turbopack) |
| UI Library | React 19 |
| Styling | Tailwind CSS 4 |
| Icon Packages | @heroicons/react, @tabler/icons-react, lucide-react, react-feather |
| AI Inference | OpenRouter API (Gemini 2.5 Flash Lite, DeepSeek V4 Flash, Qwen3 Coder) |
| Optional AI Fallback | Google Gemini API (direct) |

## Getting Started

### Prerequisites

- Node.js 20+
- An OpenRouter API key (free at [openrouter.ai](https://openrouter.ai)) — optional, the app falls back to local keyword matching and templates without it

### Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/umer-rafi/ai-icon-finder.git
   cd ai-icon-finder
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with your API key:
   ```
   OPENROUTER_API_KEY=sk-or-v1-your-key-here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Flow

1. **Search** — type a description of the icon you need
2. **AI Expansion** — the query is expanded into keywords/icon names, then scored against all 1,386 icons
3. **Filter** (optional) — narrow results down to a single library
4. **Preview** — click an icon to view it larger with copyable SVG
5. **Generate with AI** (if nothing matches) — draws a new SVG from your description, falling back to a local template if every AI model fails

## Available Models

The app tries these OpenRouter models in order, for both search-query expansion and icon generation:

- `google/gemini-2.5-flash-lite` — primary; cheap, strong instruction-following
- `deepseek/deepseek-v4-flash` — secondary; cheap, strong code/spatial reasoning
- `qwen/qwen3-coder` — free fallback if both paid calls fail

If `GEMINI_API_KEY` is also set, a direct call to Gemini 2.5 Flash Lite is tried as a last resort before falling back to local keyword matching / SVG templates.

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── search/route.ts     # AI keyword expansion + icon scoring
│   │   │   └── generate/route.ts   # AI SVG generation + local fallback
│   │   ├── globals.css             # Global styles + Tailwind
│   │   ├── layout.tsx               # Root layout
│   │   └── page.tsx                 # Main app page + state management
│   ├── components/
│   │   ├── SearchBar.tsx            # Search input with autocomplete suggestions
│   │   ├── FilterLibrary.tsx        # Library filter chips
│   │   ├── IconGrid.tsx             # Results grid + generate-with-AI CTA
│   │   ├── IconCard.tsx             # Single icon tile
│   │   ├── IconPreview.tsx          # Icon detail/preview modal
│   │   ├── ThemeToggle.tsx          # Dark/light mode toggle
│   │   └── ThemeScript.tsx          # Pre-hydration theme flash prevention
│   ├── lib/
│   │   ├── ai.ts                    # OpenRouter/Gemini client + model cascade
│   │   ├── search.ts                # Keyword/tag scoring engine
│   │   └── local-generator.ts       # Regex-based local SVG template fallback
│   ├── data/icons.ts                 # Static dataset of 1,386 icons
│   ├── hooks/useTheme.ts             # Theme state hook
│   └── types/index.ts                # Shared TypeScript interfaces
└── public/                           # Static assets
```
...
## License

MIT
