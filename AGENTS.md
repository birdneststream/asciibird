# AGENTS.md - ASCIIBIRD Project Guide

## Project Overview

ASCIIBIRD is a browser-based IRC ASCII art editor for creating and editing mIRC art. It renders a grid-based canvas where each cell ("block") has a foreground color, background color, and character. The app is 100% client-side and persists state to localStorage.

- **Live site**: https://asciibird.birdnest.live/
- **Branch**: `asciibird-v2` (based off `master`)
- **Goal**: Modernize from Vue 2 + vue-cli → Vite → TypeScript → Vue 3

## Tech Stack (Current)

| Layer | Technology |
|---|---|
| Framework | Vue 3.5 (Composition API via `<script setup>`) |
| State Management | Pinia 3 + pinia-plugin-persistedstate |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS 3, SCSS |
| Language | TypeScript |
| Linting | ESLint 9 + typescript-eslint + plugin:vue |
| Testing | Vitest 4 |
| Package Manager | Yarn |
| Node | 22.x |

## Project Structure

```
asciibird/
├── public/
│   ├── index.html              # HTML entry point (Vite)
│   └── favicon.ico
├── src/
│   ├── main.ts                 # App bootstrap, Pinia setup
│   ├── Dashboard.vue           # Root component (main layout, menus, modals)
│   ├── ascii.ts                # Core ASCII engine (~741 lines) - colors, parsing, export, canvas rendering
│   ├── style.scss              # Global styles
│   ├── store/
│   │   ├── index.ts            # Main Pinia store (tabs, layers, undo/redo, options)
│   │   ├── toolbar.ts          # Toolbar Pinia store (tool state, brush data)
│   │   ├── modal.ts            # Modal Pinia store
│   │   ├── desktop.ts          # Desktop/ui visibility Pinia store
│   │   └── panels.ts           # Panel positions Pinia store
│   ├── composables/            # Vue 3 composables
│   │   ├── useToast.ts         # Toast notification composable
│   │   ├── useClipboard.ts     # Clipboard composable
│   │   ├── useDialog.ts        # Dialog/prompt composable
│   │   ├── useDraggable.ts     # Draggable panel composable
│   │   └── useGlobalShortcuts.ts # Keyboard shortcut composable
│   ├── utils/                  # Shared utilities
│   │   ├── layers.ts           # Layer compression/decompression
│   │   ├── diffBlocks.ts       # Undo/redo diff tracking
│   │   ├── idbPersistAdapter.ts # IndexedDB storage adapter for Pinia
│   │   └── ...
│   ├── views/
│   │   └── Editor.vue          # Main editor canvas view
│   ├── components/
│   │   ├── Toolbar.vue         # Tool selection panel (draggable)
│   │   ├── DebugPanel.vue      # Debug info panel (draggable)
│   │   ├── BrushLibrary.vue    # Saved brushes panel (draggable)
│   │   ├── LayersLibrary.vue   # Layer management panel (draggable)
│   │   ├── Colours.vue         # Color palette component
│   │   ├── ABModal.vue         # Reusable modal wrapper (Headless UI)
│   │   ├── modals/
│   │   │   ├── NewAscii.vue    # Create new ASCII modal
│   │   │   ├── EditAscii.vue   # Edit ASCII dimensions modal
│   │   │   ├── PasteAscii.vue  # Paste/import ASCII modal
│   │   │   ├── Options.vue     # App options modal
│   │   │   ├── ImageOverlay.vue # Image tracing overlay modal
│   │   │   ├── About.vue       # About dialog
│   │   │   └── Help.vue        # Help dialog
│   │   └── parts/
│   │       ├── BrushCanvas.vue       # Reusable canvas for brush/ASCII rendering
│   │       ├── MainBrushCanvas.vue   # Main editing canvas
│   │       ├── BrushPreview.vue      # Brush preview panel (draggable)
│   │       ├── CharPicker.vue        # Character selection grid
│   │       ├── ColourPicker.vue      # Color selection grid
│   │       ├── ContextMenu.vue       # Right-click context menu
│   │       ├── KeyboardShortcuts.vue # Keyboard shortcut handler
│   │       ├── Layers.vue            # Layer list component
│   │       └── Tooltip.vue           # Tooltip component
├── tests/
│   └── unit/
│       └── *.spec.ts           # Vitest unit tests (22 test files)
├── docs/                       # Screenshot assets for README
├── vite.config.ts              # Vite build config
├── tailwind.config.js          # Tailwind CSS config
├── tsconfig.json               # TypeScript config
└── package.json
```

## Key Files to Understand

- `src/ascii.ts` — The core engine. Contains mIRC color palette (99 colors), character codes, block dimensions, 2D array helpers, mIRC parsing/import, export (mIRC, PNG), brush generation (circle/square/cross), canvas rendering, compression helpers, splash ASCII.
- `src/store/index.ts` — Main Pinia store. Manages: tabs (multiple ASCII documents), layers (per-tab, LZ-String compressed), undo/redo history, options. State is persisted to IndexedDB via pinia-plugin-persistedstate with a custom buffered adapter (`src/utils/idbPersistAdapter.ts`).
- `src/store/toolbar.ts` — Toolbar Pinia store. Manages: active tool, colors, brush size/type, brush library, brush history, mirror toggles. Persisted to IndexedDB.
- `src/utils/idbPersistAdapter.ts` — Buffered IndexedDB storage adapter for `pinia-plugin-persistedstate`. Provides synchronous `getItem`/`setItem` via in-memory cache with microtask-queued async writes to IDB. Includes WAL safety net and localStorage fallback.
- `src/Dashboard.vue` — The main orchestrator component (~963 lines). Contains the menu bar, tab bar, context menu, all modal triggers, import/export logic, and coordinates all sub-components.
- `src/views/Editor.vue` — The main canvas editor that handles mouse/keyboard events and renders the ASCII grid.

## Data Model

### ASCII Block
Each cell in the grid: `{ fg: number, bg: number, char: string }`
- `fg`: foreground color index (0-98 in mircColours99)
- `bg`: background color index
- `char`: the displayed character

### asciibirdMeta (per tab)
```
{
  title: string,
  layers: string,          // LZ-String compressed JSON of layer array
  selectedLayer: number,
  imageOverlay: object,
  history: array,          // undo/redo stack (LZ-String compressed diffs)
  historyIndex: number,
  x: number, y: number,    // canvas scroll position
}
```

### Layer
```
{
  label: string,
  visible: boolean,
  width: number,
  height: number,
  data: Block[][]          // 2D array of blocks
}
```

## Commands

```bash
yarn install          # Install dependencies
yarn dev              # Dev server (Vite)
yarn build            # Production build
yarn lint             # ESLint
yarn test             # Vitest unit tests
yarn test --coverage  # Vitest with coverage report
```

## Code Conventions

- **Indentation**: 2 spaces (see `.editorconfig`)
- **Line endings**: LF
- **Max line length**: 100
- **Vue style**: Composition API via `<script setup lang="ts">`
- **State mutations**: Pinia actions directly mutate `this`
- **Compression**: LZ-String used heavily for layers and brush data in the store
- **CSS**: Tailwind utility classes in templates, SCSS for global styles

## Modernization Roadmap

The `asciibird-v2` branch is for modernizing the project. **Strict phase order — do not skip ahead.** Each phase must be complete and verified before starting the next.

### Phase 1: Vite Migration + Latest Dependencies + MCP Compatibility ✅ COMPLETE
### Phase 2: TypeScript Migration ✅ COMPLETE
### Phase 3: Comprehensive Test Coverage ✅ COMPLETE
### Phase 4: Review, Audit, Refactor, Simplify ✅ COMPLETE

### Phase 5: Vue 3 Migration ✅ COMPLETE

All Vue 2 packages have been replaced and the app is fully running on Vue 3 + Pinia + Vite + TypeScript.

| Old Package | Replacement | Status |
|---|---|---|
| `vue` 2.6 | `vue` ^3.5 | ✅ 25 components use `<script setup lang="ts">` |
| `vuex` 3 | `pinia` ^3 | ✅ 6 stores with `pinia-plugin-persistedstate` |
| `vue-tailwind` | `@headlessui/vue` + Tailwind 3 | ✅ Modals, menus, dialogs |
| `vue-file-toolbar-menu` | `@headlessui/vue` Menu | ✅ Menu bar with keyboard nav |
| `vue-draggable-resizable` | `@vueuse/core` `useDraggable()` | ✅ 5 draggable panels |
| `vue-clipboard2` | `@vueuse/core` `useClipboard()` | ✅ Clipboard composable |
| `vue-toasted` | Custom `useToast()` composable | ✅ Toast notifications |
| `vue-slider-component` | Native `<input type="range">` | ✅ Brush size controls |
| `vuex-persist` | `pinia-plugin-persistedstate` | ✅ State persistence |

**Verification**: Build ✅ Tests ✅ (764/764) TypeScript ✅ Browser ✅ Accessibility ✅

### Phase 5+: IndexedDB Persistence ✅ COMPLETE

Migrated from localStorage (~5MB limit) to IndexedDB for the two largest Pinia stores (main + toolbar). Uses `idb-keyval` with a custom buffered adapter (`src/utils/idbPersistAdapter.ts`) that provides synchronous `getItem`/`setItem` for `pinia-plugin-persistedstate` via an in-memory cache with microtask-queued async IDB writes. Includes non-destructive localStorage→IDB migration, WAL safety net for tab close, and fallback to localStorage if IDB unavailable.

| Store | Storage | Key | Notes |
|---|---|---|---|
| `useAsciiBirdStore` | IndexedDB | `vuex` | Main store with LZ-String compressed layers + undo history |
| `useToolbarStore` | IndexedDB | `asciibird-toolbar` | Brush history/library data |
| `useModalStore` | localStorage | `asciibird-modal` | Tiny data |
| `useDesktopStore` | localStorage | `asciibird-desktop` | Tiny data |
| `usePanelStore` | localStorage | `asciibird-panel` | Tiny data |

**Verification**: Build ✅ Tests ✅ (792/792) TypeScript ✅ Browser ✅

## Known Issues (from README)
- Flood fill hits recursion limit on large ASCIIs
- Hidden layers don't auto-select next visible layer
- Half-block import background persistence bug
- Panel dragging can get stuck after right-click
- Brush tool needs seamless line interpolation for fast drawing
- No mobile/touch support

## Dependencies

All Vue 2-only dependencies have been replaced. The current dependency stack is fully Vue 3 compatible.

| Package | Purpose | Version |
|---|---|---|
| `vue` | Framework | ^3.5 |
| `pinia` | State management | ^3 |
| `@headlessui/vue` | Accessible UI primitives | ^1.7 |
| `@vueuse/core` | Composables (draggable, clipboard, etc.) | ^14 |
| `pinia-plugin-persistedstate` | State persistence | ^4 |
| `vite` | Build tool | ^8 |
| `vitest` | Test runner | ^4 |
| `tailwindcss` | Styling | ^3.4 |

## MCP Servers (opencode.json)

The following MCP servers are configured for opencode:

| Server | Type | Purpose |
|---|---|---|
| `context7` | Remote | Fetch up-to-date library docs (Vite, Vue, TypeScript, Pinia, etc.) — use when unsure about API usage |
| `chrome-devtools` | Local | Control a live Chrome browser via CDP — requires Chrome launched with `--remote-debugging-port=9222` |
| `playwright` | Local | Browser automation for testing — navigate, screenshot, click, fill forms on the running dev server |
| `frontend-debugger` | Local | Vue/React component tree inspection, visual regression, a11y auditing — use for debugging component state |
| `vitest` | Local | Run and manage Vitest tests — discover, execute, analyze coverage. Use after Phase 1 (Vite) migration when Jest → Vitest switch happens |
| `typescript` | Local | TypeScript-aware code analysis — symbol rename, move file with import updates, go-to-definition, find references. Use during Phase 2 (TypeScript migration) |
| `memory` | Local | Knowledge graph persistent memory — store and retrieve context across sessions about project decisions and patterns |
| `sequential-thinking` | Local | Structured multi-step reasoning for complex migration planning |

**Tips:**
- For Chrome DevTools: launch Chrome first with `google-chrome --remote-debugging-port=9230`
- For Playwright/frontend-debugger: run `yarn dev` first on port 5180
- Use `context7` when looking up Vite config, Vue 3 APIs, TypeScript patterns, etc.
- The `vitest` server is essential for test coverage and running tests
- The `typescript` server enables LSP-powered refactoring
- `vite-plugin-vue-mcp` provides component tree/state inspection natively

## Web Search and Scraping

When you need to look something up online:
1. **Search**: use `searxng_web_search` to find relevant pages
2. **Read**: use `searxng_web_url_read` to read content from a URL (lightweight, fast)
3. **Scrape**: use `firecrawl_firecrawl_scrape` for full page extraction when you need structured content, screenshots, or JavaScript-rendered pages
4. **Context7**: for library/API docs, prefer `context7` MCP first — it's purpose-built for that

## Mandatory Browser Verification

**After every task that changes runtime code (components, store, templates, styles, imports), the agent MUST verify the app runs correctly in the browser before committing.** CLI-only checks (lint, build, test) are NOT sufficient — they miss runtime errors that only appear in the browser.

### Procedure

1. **Start the dev server** if not already running: `yarn dev` (port 5180 by default, or whatever is configured)
2. **Open Chrome DevTools MCP** — connect to the browser and navigate to the dev server URL
3. **Check the browser console for errors**:
   - Use `chrome-devtools_list_console_messages` with `types: ["error", "warn"]`
   - Or use `playwright_browser_navigate` + `playwright_browser_console_messages`
4. **Take a snapshot/screenshot** to verify the page renders correctly:
   - Use `chrome-devtools_take_snapshot` or `chrome-devtools_take_screenshot`
   - Look for blank pages, broken layouts, missing components
5. **If errors are found** — fix them immediately and re-verify
6. **Document the verification** in PROGRESS.md task notes (e.g., "Browser verified: no console errors, app renders correctly")

### What to check for
- `SyntaxError` — missing ESM exports, bad imports (common with CJS/UMD packages in Vite)
- `TypeError` — undefined properties, null access, wrong `this` context
- `Vue warn` — missing components, failed props, render errors
- Blank white screen — app failed to mount entirely
- Broken layout — CSS/Tailwind not loading, missing styles
- Failed network requests — 404s on assets, API calls

### When this can be skipped
- **Config-only changes** (vite.config, tsconfig, .eslintrc, etc.) with no runtime impact — still verify with `yarn build` though
- **Test-only changes** (adding/modifying test files) — `yarn test` is sufficient
- **Documentation-only changes** (README, PROGRESS.md, PLAN.md)

## Notes for Agents

- **CRITICAL: Fix everything you find.** Even if an issue was not introduced by your changes, if you encounter a bug, typo, code smell, missing error handling, or any other problem — fix it on the spot. Do not leave known issues for "later". Do not log it and move on. Fix it. This applies to ALL phases, ALL files, ALL the time. If you see `var` that should be `const`, fix it. If you see a missing null check, add it. If you see a typo in a variable name, correct it. The codebase gets cleaner with every single change.
- **CRITICAL: Browser verification is mandatory.** See "Mandatory Browser Verification" section above. A clean `yarn build` and `yarn test` does NOT mean the app works. You MUST check the browser console and render output. **Use Chrome DevTools MCP (`chrome-devtools_*`) — NOT frontend-debugger** — to navigate to the dev server, check console for errors, and take screenshots to verify rendering.
- LZ-String compression is used extensively for performance — large ASCII documents can be memory-intensive. Keep this pattern during any further changes.
- **IndexedDB migration (Phase 5+):** The app currently uses localStorage (via `pinia-plugin-persistedstate`) for all persistence. localStorage has a ~5MB limit, which is tight for multi-tab ASCII art with compressed layers and undo history. Migrate all storage to IndexedDB using a library like `idb` or `Dexie.js`. This removes the 5MB ceiling, handles large documents gracefully, and supports binary storage for PNG exports. The Pinia persistence plugin should target IndexedDB instead of localStorage.
