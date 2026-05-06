# PMMstudio LLM Wiki

This folder is the operational handoff for LLM agents working on PMMstudio.
Use it together with `AGENTS.md` and `CLAUDE.md`.

## Start Here

1. Read `AGENTS.md` for project-wide rules and architecture.
2. Read this file for current working context.
3. Read `sessions/2026-04-25-session.md` for the latest long-running session handoff.
4. Before editing, run `git status -sb` and respect unrelated local changes.

## Project In One Screen

PMMstudio is a static browser app for reinforced concrete column PMM capacity checks.
There is no backend. Numerical work runs in WebAssembly compiled from AssemblyScript.

Core layers:
- `assembly/index.ts`: AssemblyScript computation kernel.
- `public/wasm/pmm.wasm`: compiled WASM artifact. Rebuild it; do not hand-edit it.
- `src/main.ts`: full UI orchestration, state, i18n, Plotly rendering, exports, reports.
- `src/style.css`: full app styling and responsive layout.
- `index.html`: Vite shell with `div#app`.

Build commands:
- `npm run build:wasm`: rebuild WASM only.
- `npm run build`: rebuild WASM, TypeScript, and Vite bundle.
- `npm run dev`: build WASM and start Vite dev server.

## Current Product Direction

The app is a quiet engineering tool, not a marketing UI. Favor dense but readable forms,
predictable controls, compact tables, clear diagnostics, and restrained visual treatment.

Recent direction:
- PMM/code-check stays code-oriented.
- M-phi/nonlinear section response uses continuous material behavior where appropriate.
- TS500/TBDY PMM can use code assumptions, while M-phi can use Mander core+cover with unreduced section strength.
- M-phi should show diagnostics honestly: requested steps, solved steps, skipped/root-not-found counts, event markers, monitoring points.

## High-Risk Areas

- `src/main.ts` is large and tightly coupled. Prefer small localized edits.
- Plotly lifecycle is fragile after clearing charts. Use existing helpers such as `renderPlotlyFigure`, `purgePlotlyFigure`, `showPlotLoading`, and deferred resize functions.
- If `assembly/index.ts` changes, rebuild and commit `public/wasm/pmm.wasm`.
- The TGUA files are not part of PMMstudio's intended scope in this repo right now. Treat `src/tgua.ts` and `tgua.html` changes carefully.
- There are known unrelated local changes; do not include them in PMM commits unless the user explicitly asks.

## Git Remotes

- `origin`: `https://github.com/ozanbilal/PMMstudio.git`
- `geopmm`: `https://github.com/EmreErbek/geopmm.git`

Recent pushes during the session went to both `origin/main` and `geopmm/main`.

## Agent Working Rules

- Do not introduce a frontend framework.
- Keep the static/offline-capable architecture.
- Preserve Turkish/English i18n when adding UI text.
- Prefer project-specific docs and this `llmwiki` before external assumptions.
- Keep commits scoped. The repo may contain unrelated local changes.
