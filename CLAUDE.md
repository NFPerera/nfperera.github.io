# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository overview

This is a static personal portfolio site for Nicolás Fernández Perera (NFPerera / Monarch Wing Studios), deployed via GitHub Pages at `nfperera.github.io`. It is styled as a game-engine editor (Hierarchy / Scene / Inspector / Console panels) and works as a hash-routed single page. There is no build system, package manager, or framework — just three files served directly, plus one generated data file (`agro-map.js`):

- [index.html](index.html) — the editor layout plus every page as an `<article class="view" data-route="..." data-title="...">` inside `#scene-body`. The URL `#/<data-route>` shows the matching view (home has `data-route=""`). Projects are `<article class="view project accent-*" data-route="projects/<slug>" data-kind="..." data-category="game|tool|ai|sim">`; each holds its banner, case-study sections, an empty `.pager`, and a `<template class="inspector">` that fills the Inspector panel.
- Every visible string exists in English and Spanish as an adjacent pair `<span lang="en">…</span><span lang="es">…</span>` (CSS shows the one matching `<html data-lang>`). Other translations: `data-title-es` / `data-kind-es` on views and projects, `data-es-aria-label` / `data-es-placeholder` / `data-es-content` on elements, and `data-es` on `<option>`. Each code sample is a `<pre lang="en">` / `<pre lang="es">` pair: the repo's real code in its own language and a translated copy (own identifiers and comments renamed, API names untouched), flagged by a note in its `.code-title`.
- [style.css](style.css) — all styling. Theme colors are CSS custom properties: night values in `:root`, day values repeated in both the `prefers-color-scheme: light` block and `:root[data-theme="day"]` (keep them in sync). `.accent-blue` / `.accent-green` / `.accent-terracotta` set `--accent`.
- [script.js](script.js) — all behavior: builds the Hierarchy project tree, the home asset grid, and prev/next links from the project articles; the hash router; day/night toggle and EN | ES toggle (both saved in `localStorage`; with no saved language the `<head>` script follows the browser's). The language state is `lang`; `STR` + `t()` hold the strings the script writes itself, `applyLang()` refreshes attributes and titles, and a `langchange` window event makes the demos redraw their own text; console log + commands (collapsed to a status bar showing the last message until clicked or a command is typed); play-mode tint; typewriter in `#typing-text`; click-to-copy on `#email-btn`; gallery lightbox; Konami-code easter egg; and the interactive demos (`[data-demo="fsm"|"perception"|"neuro"|"ballistics"|"agro"]`), started by the router when their view opens. The demos mirror the real projects: perception uses the toolkit's confirm/lose timers, neuro the plane project's elitism + tournament + crossover + mutation GA, ballistics RealShooter's G7 table, form factor and RK4, agro AgroLife's third-party rotation, typical plans, degree-day stages and Status-layer colours on the whole of Pergamino: its 3,477 real lots, roads, streams and towns live in `agro-map.js` (`AGRO_MAP`, generated once from AgroLife's `lotes.json`, `geografia.json` and `region.json`, simplified to 10 m and delta-encoded; the header comment explains the format), and the map pans by dragging and zooms with the + / − / ⌂ buttons. CableMess has no demo: its "Watch it" section embeds its YouTube gameplay video (`iframe.yt`, which the router pauses when the view is hidden). Animated demos stop their `requestAnimationFrame` loop when their view is hidden.

## Development

There is no build, lint, or test tooling. Open [index.html](index.html) directly in a browser (or serve the directory with any static file server) to preview changes — GitHub Pages serves the repo root as-is on push to `main`.

## Working conventions

- Keep everything in the three existing files (`index.html`, `style.css`, `script.js`; `agro-map.js` is only data, loaded by a plain `<script>` before `script.js` so it also works from `file://`) rather than introducing a build step, bundler, or framework — this site is intentionally dependency-free.
- To add a project, copy an existing project `<article>`; the Hierarchy, asset grid and prev/next update automatically. To add a non-project page, add an `<article class="view page">` and a link in the static part of `#hierarchy`.
- Unknown project details are marked with placeholders: `// TODO` (`.todo`) in prose, `None (...)` (`.none`) in Inspector fields, and `.slot` in galleries. `.todo` and `.slot` are hidden from visitors, and so is a section left with nothing else (e.g. a Media section with no `<img>`). Replace them with real content rather than inventing details.
- Each project's "Try it" demo sits right after its banner. The Home view features the current project with a second copy of its demo (now AgroLife's `agro`); demo functions keep their state on the element, so copies run independently.
- Phones (≤1000px) stack the panels and turn the Hierarchy into a drawer. Check changes at 390px: no sideways scrolling, nothing under 13px, form fields at 16px (iOS zoom). Project facts come from the source repos in `S:/Git` (see the user's memory notes); the original-language `<pre>` is real code from those repos.
- New text needs both languages: wrap it as a `lang` span pair, or add it to `STR` if the script writes it. A code sample must read in one language only: when you add or change one, write the original from the repo and its twin in the other language (rename your own identifiers and comments; keep Unity/C#/LINQ names and any string literal the code needs).
- Theme colors should be changed via the CSS custom properties in `style.css`'s `:root` block, not hardcoded inline.
- `script.js` attaches all behavior with direct `querySelector` calls (the script loads at the end of `<body>`); init runs at the bottom of the file — no modules or imports are used.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
