# CLAUDE.md — PMMstudio

AI assistant context for the **TS500 PMM WASM** project.

---

## Project Overview

A browser-based structural engineering tool for **PMM (Axial-Moment-Moment) capacity analysis** of reinforced concrete columns. No backend — all computation runs in-browser via a WebAssembly kernel compiled from AssemblyScript.

Supports three design codes: **TS500**, **TBDY 2018** (Turkish codes), and **ACI 318-19**.

---

## Repository Layout

```
PMMstudio/
├── assembly/index.ts      # WebAssembly computation kernel (AssemblyScript, 822 lines)
├── src/
│   ├── main.ts            # Entire UI + app logic (TypeScript, ~3200 lines)
│   ├── style.css          # All styling with CSS custom properties (~1100 lines)
│   ├── plotly.d.ts        # Plotly.js type declarations
│   └── counter.ts         # Vite template remnant — safe to ignore
├── public/
│   └── wasm/pmm.wasm      # Compiled WASM binary (do NOT hand-edit)
├── index.html             # HTML shell — single div#app
├── package.json
└── tsconfig.json
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Build tool | Vite 7.x |
| Language | TypeScript 5.x (strict mode) |
| WASM compiler | AssemblyScript 0.28.x |
| Visualization | Plotly.js 3.x |
| Styling | Plain CSS with custom properties |
| Runtime | Browser (no Node.js at runtime) |

---

## Development Commands

```bash
npm install          # Install dependencies

npm run dev          # Build WASM then start Vite dev server (hot reload)
npm run build        # Full production build: WASM → TS → Vite bundle
npm run build:wasm   # Compile assembly/index.ts → public/wasm/pmm.wasm only
npm run preview      # Serve the production dist/ locally
```

`npm run dev` and `npm run build` both run `build:wasm` first — the WASM binary must be up-to-date before the TypeScript layer runs.

---

## Architecture

### Two-Layer Design

**Layer 1 — Computation kernel (`assembly/index.ts`)**

AssemblyScript that compiles to WebAssembly. Handles all numerical work:
- Section geometry (rectangular / circular)
- Concrete constitutive models: TS500 equivalent block, Mander confined/unconfined
- PMM surface generation (angle × neutral-axis depth grid)
- Load evaluation (DCR, capacity, compliance status)
- Getter functions return results back to JS

Units inside the kernel: geometry in **m**, stress in **MPa**, forces in **kN / kNm**.

**Layer 2 — UI & orchestration (`src/main.ts`)**

Pure TypeScript, no framework. Handles:
- WASM loading and JS↔WASM interface (`WasmExports` type)
- DOM manipulation and event wiring
- Bilingual UI (Turkish / English via `data-i18n` attributes)
- Dark / light theme via CSS custom property swapping
- Input collection → WASM calls → result rendering
- Plotly 2D and 3D visualizations
- CSV import (load cases) and export (results)
- Canvas-rendered section preview

### Data Flow

```
User Input → main.ts → WASM functions → Getter calls → Plotly plots + result table
```

---

## Key Types (src/main.ts)

```typescript
type Shape        = "rect" | "circle"
type CodeMode     = "ts500" | "ts500_tbdy" | "aci318_19"
type ConcreteModel = "ts500_block" | "mander_core_cover"
type Lang         = "tr" | "en"
type ThemeMode    = "dark" | "light"
type PSignMode    = "compression_positive" | "compression_negative"

interface WasmExports { /* all functions exported from WASM */ }
interface LoadCase   { P: number; Mx: number; My: number; label: string }
interface ResultRow  { /* analysis output for one load case */ }
interface PmmPoint   { P: number; Mx: number; My: number }
interface AppInput   { /* full snapshot of UI state sent to WASM */ }
```

---

## WASM Interface

The TypeScript side loads `public/wasm/pmm.wasm` at runtime via `setupWasm()`. All WASM functions are typed through `WasmExports`. Important conventions:

- **Modify the algorithm** → edit `assembly/index.ts`, then run `npm run build:wasm`
- **Never edit `public/wasm/pmm.wasm` directly** — it is a compiled artifact
- WASM memory is managed by AssemblyScript; avoid raw memory manipulation from JS

---

## Styling Conventions

`src/style.css` uses a token-based approach with CSS custom properties:

```css
/* Spacing / shape */
--radius: 18px
--radius-sm: 12px

/* Theme tokens (redefined under [data-theme="light"]) */
--bg, --surface, --border, --text, --accent, --accent2 ...

/* Status colors */
--ok, --danger, --info
```

- Responsive breakpoints: **1380px**, **980px**, **760px**
- Fonts: Fraunces (headings), IBM Plex Sans (UI), IBM Plex Mono (code/numbers)
- Dark mode is the default; light mode toggled via `[data-theme="light"]` attribute on `<html>`

---

## Internationalization

- Two languages: Turkish (`tr`, default) and English (`en`)
- All static strings use `data-i18n="key"` attributes on HTML elements
- Dynamic strings (e.g., status messages) use inline conditional logic in `main.ts`
- Language is toggled at runtime — no page reload required

When adding new UI text:
1. Add the element with a `data-i18n` key
2. Add the translation entry in both language maps in `main.ts`

---

## No Testing, No Linting (Current State)

There is no test framework, no ESLint, and no Prettier configured. TypeScript strict mode (`strict: true`, `noUnusedLocals`, `noUnusedParameters`) is the primary correctness check.

When contributing:
- Ensure `npm run build` completes without TypeScript errors before committing
- Follow existing naming conventions (camelCase for variables/functions, PascalCase for types/interfaces)

---

## Git Conventions

- Default branch: `main`
- Feature branches follow the pattern: `claude/<description>-<id>` (AI-created) or descriptive names for human work
- Commit message style from history: `feat:`, `fix:` prefixes

---

## No Environment Variables

This is a fully static client-side app. There are no `.env` files, no secrets, and no runtime configuration. All defaults (section dimensions, material properties, analysis parameters) are hard-coded in `main.ts`.

---

## Common Tasks

**Add a new load case field**
→ Update `LoadCase` interface → update CSV parser/exporter → update WASM call in `runAnalysis()`

**Add a new design code**
→ Add variant to `CodeMode` type → add WASM computation path in `assembly/index.ts` → add UI option and i18n strings → run `npm run build:wasm`

**Change default material parameters**
→ Search `main.ts` for the relevant `<input>` default value or JS constant

**Debug WASM output**
→ Add `console.log` calls after getter functions in `main.ts`; WASM itself cannot log to the browser console

**Update Plotly charts**
→ Find `plotResults()` or `buildPmmSurface()` in `main.ts`

---

## Things to Avoid

- Do not add a JS framework (React, Vue, etc.) without discussion — the codebase is intentionally vanilla
- Do not split `main.ts` into many small files without a clear plan — the single-file approach is deliberate for this app size
- Do not commit `public/wasm/pmm.wasm` as a hand-edited binary
- Do not introduce a backend; the app's value is its zero-dependency, offline-capable nature
