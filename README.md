# ASCIIBIRD v3 — The World's Best IRC ASCII Art Editor

> ⚠️ **v3 is currently in TESTING.** Expect bugs. For the stable version, visit
> [classic.birdnest.live](https://classic.birdnest.live/).

ASCIIBIRD is a browser-based IRC ASCII art editor for creating and editing mIRC
art. It's 100% client-side — everything runs in your browser and persists to
IndexedDB. No server, no accounts, no API keys.

Try it live: **[asciibird.birdnest.live](https://asciibird.birdnest.live/)**

Support ASCIIBIRD and birdnest streaming by [jumping on our Patreon](https://www.patreon.com/birdnestlive)!

---

## What's New in v3

v3 is a complete modernization — new build system, new framework, new language,
and a pile of new features.

### Core Modernization

| Before (v2) | After (v3) |
|---|---|
| Vue 2.6 + Options API | Vue 3.5 + Composition API (`<script setup>`) |
| Vuex 3 | Pinia 3 |
| vue-cli (Webpack) | Vite 8 |
| JavaScript | TypeScript |
| Jest | Vitest 4 |
| ESLint 6 | ESLint 9 + typescript-eslint |
| Tailwind CSS 2 | Tailwind CSS 3 |
| localStorage (~5MB) | IndexedDB (unlimited) |
| 7 npm dependencies for UI primitives | Headless UI + VueUse |

### New Features

- **18 brush shapes** — circle, square, cross, diamond, ring, star, diagonal,
  checkerboard, frame, edge, and more (was 4)
- **Half-block editing mode** — full brush, eraser, mirror, select, and UI
  constraints for half-block art (`▀▄█`)
- **Shape tool** — draw lines, rectangles, and ellipses on the canvas (press `L`)
- **Gradient fill** — pick two colors, click two corners, get a smooth gradient
- **Border/frame generator** — 8 box-drawing styles (single, double, rounded,
  thick, dashed, dotted, etc.)
- **Find & Replace** — search and replace characters, colors, or patterns across
  the canvas or selection
- **Color replace tool** — click to pick source color, click to replace
  everywhere (press `R`)
- **Recent colors strip** — LRU of last 12 used colors, persisted across
  sessions
- **IRC line length warning** — status bar indicator shows byte count per line,
  yellow >400 bytes, red >500 bytes
- **Undo/redo count** — status bar shows `⟲ N | ⟳ M` for undo/redo steps
- **Selection transforms** — copy, cut, paste, delete selection with ghost
  preview
- **Shift+Arrow nudge** — move selection by 1 block with Shift+Arrow keys
- **Export to ANSI** — convert mIRC art to ANSI terminal format (256-color)
- **Export to HTML** — styled HTML with entity escaping
- **Plain text export** — strip color codes, clipboard or file
- **ANSI import** — import ANSI art files
- **Crop to content** — trim canvas to actual art bounds
- **Merge layer down / Duplicate layer** — with keyboard shortcuts
- **Tab inline rename** — double-click tab title to rename
- **Panel-specific icons** — each floating panel has its own icon
- **Smart panel positions** — panels and canvas start in proper positions
- **Middle-click panel minimize** — middle-click title bar to collapse

### Bugs Fixed

- Flood fill recursion limit on large ASCIIs → iterative fill with explicit stack
- Hidden layers don't auto-select next visible layer → `findNextVisibleLayer()`
- Half-block import background persistence → import/export round-trip verified
- Panel dragging stuck after right-click → PointerEvent safety nets
- Brush tool line gaps → Bresenham interpolation
- Mirror mode undo corruption → duplicate-position guard
- Page scrollbar visible → fullscreen fixed layout
- Modals behind floating panels → z-index stacking fix
- Menu bar dropdowns behind panels → z-index stacking fix
- Font inconsistency across UI → JetBrains Mono everywhere, Hack canvas only

---

## Feature Overview

- **Tabbed ASCII editing** — multiple documents open at once
- **Layers** — show/hide, reorder, rename (double-click), merge down, duplicate
- **99 mIRC colors** — full extended color palette
- **Brush tool** — 18 shapes, adjustable size, rotate/flip, mirror X/Y
- **Select tool** — copy, cut, paste, delete, nudge (Shift+Arrow), transform
- **Text tool** — click and type, arrow key support
- **Fill tool** — fill by fg/bg/char with filter checkboxes
- **Eraser** — per-property erase (fg only, bg only, char only)
- **Color picker** — eyedropper to grab fg/bg/char from any block
- **Image overlay** — trace images on the canvas (URL-based)
- **Import** — mIRC from clipboard, file, URL, ANSI files
- **Export** — mIRC clipboard/file/POST, ANSI file, HTML, plain text
- **Brush Library & History** — save, reuse, and organize brushes
- **Brush Preview** — editable preview panel with tool support
- **Context menus** — right-click on canvas, brushes, tabs, layers
- **Undo/Redo** — configurable history limit, diff-based for performance
- **Grid mode** — `Alt+G` to toggle grid overlay
- **Mirror X/Y** — draw symmetrically
- **State persistence** — everything saved to IndexedDB automatically
- **Export/import state file** — backup and restore full workspace

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Vue 3.5 (Composition API, `<script setup>`) |
| State | Pinia 3 + pinia-plugin-persistedstate |
| Build | Vite 8 |
| Styling | Tailwind CSS 3, SCSS |
| Language | TypeScript |
| Testing | Vitest 4 (1400+ tests) |
| Linting | ESLint 9 + typescript-eslint + plugin:vue |
| UI Primitives | Headless UI, VueUse |
| Storage | IndexedDB via idb-keyval |
| Compression | LZ-String |
| CI/CD | GitHub Actions → Bunny.net |

---

## Project Setup

```bash
yarn install          # Install dependencies
yarn dev              # Dev server (localhost:5180)
yarn build            # Production build → dist/
yarn lint             # ESLint check
yarn test             # Vitest unit tests
yarn test --coverage  # Tests with coverage report
npx tsc --noEmit      # TypeScript type check
```

---

## Big Shout Outs to Patrons

> shrew, octopus, j-hex, nes, mouse, dingo, eraser, pancakes

> special thanks to slime aka botmaster slime for the wonderful bot integration with asciibird

## What Chatters are Saying

```
<ralph> ascii bird is so easy a drunk LQ chatter like myself can use, and does use it
<ralph> asciibird is to chatters what the ak-47 is to kids in Sierra Leone
<ralph> POWERFUL STUF
```

```
<kayos> man asciibird is legit revolutionary shit
```

```
<acidvegas> ngl ive seen asciibird on github
<acidvegas> first time using it rn
<acidvegas> this is v impressive jewbird
<acidvegas> props
<acidvegas> beautiful design
<acidvegas> looks very iOS circa 2015
```

```
<higgs> asciibird changed my life.
```

## ASCII Art Created with ASCIIBIRD

![fraidnobully.png](https://asciibird.birdnest.live/docs/fraidnobully.png)
![hoodie.png](https://asciibird.birdnest.live/docs/hoodie.png)
![mediation.png](https://asciibird.birdnest.live/docs/mediation.png)
![bullyfreechat.png](https://asciibird.birdnest.live/docs/bullyfreechat.png)
![midiweekend.png](https://asciibird.birdnest.live/docs/midiweekend.png)
![chzz-dimension-noose.png](https://asciibird.birdnest.live/docs/chzz-dimension-noose.png)

## References

- http://anti.teamidiot.de/static/nei/*/extended_mirc_color_proposal.html — 99 colours info
- https://modern.ircdocs.horse/formatting.html#color — mIRC formatting
- https://www.mirc.com/colors.html — mIRC colour standard
- https://www.oocities.org/spunk1111/history.htm — History of ASCII art by Joan Stark (jgs)

## ASCII Resources

- https://mircart.org/ — IRC ASCII art
- https://asdf.us/asciiblaster/ — Asciiblaster (ASCIIBIRD is loosely based on this)
- https://acid.vegas/asciimaker — ASCII Creator from acidvegas
- https://github.com/ircart/resources — IRC ASCII resources
- http://wepump.in/ascii/ — Classic IRC ASCII art
- https://irc.watch/ascii/ — IRC ASCIIs you can load into ASCIIBIRD

## Hello to Friends on the IRC

> darkmage (confirmed snitch), l0de, bex, blarf, sludg, shart, chode, corn, ralph, jrra, kuntz, moony, sniff, scd, aztec, astro, anji, b-rex, bengt, butth0le, canada420, clamkin, deakin, dumbguy, ElBurro, interdome, syn, darkness, vae, gowce, moneytree, Retarded, spoon, sylar, zen, bj0rn, stovepipe, morthrane, chrono, acidvegas, again, hgc, durendal, knio, mavericks, pyrex, sh, irie, seirdy, sq, stratum, WeEatnKid, dieforirc, tater, buttvomit, luldangs, MichealK, AnalMan, poccri, vap0r, kakama, fregyXin, kayos, stovepipe, higgs, Audasity, PsyMaster, perplexa, alyosha, Darn, efsenable, EchoShun, dumbguy, HorseCrusherKristian, phobos, COMPUTERS, dave, nance, sthors
