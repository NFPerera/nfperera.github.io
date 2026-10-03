# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository overview

This is a static personal portfolio site for Nicolás Fernández Perera (NFPerera / Monarch Wing Studios), deployed via GitHub Pages at `MonarchWingStudios.github.io`. It is styled as a game-engine editor (Hierarchy / Scene / Inspector / Console panels) and works as a hash-routed single page. There is no build system, package manager, or framework — just three files served directly:

- [index.html](index.html) — the editor layout plus every page as an `<article class="view" data-route="..." data-title="...">` inside `#scene-body`. The URL `#/<data-route>` shows the matching view (home has `data-route=""`). Projects are `<article class="view project accent-*" data-route="projects/<slug>" data-kind="..." data-category="game|tool|ai">`; each holds its banner, case-study sections, an empty `.pager`, and a `<template class="inspector">` that fills the Inspector panel.
- [style.css](style.css) — all styling. Theme colors are CSS custom properties: night values in `:root`, day values repeated in both the `prefers-color-scheme: light` block and `:root[data-theme="day"]` (keep them in sync). `.accent-blue` / `.accent-green` / `.accent-terracotta` set `--accent`.
- [script.js](script.js) — all behavior: builds the Hierarchy project tree, the home asset grid, and prev/next links from the project articles; the hash router; day/night toggle (saved in `localStorage`); console log + commands; play-mode tint; typewriter in `#typing-text`; click-to-copy on `#email-btn`; gallery lightbox; Konami-code easter egg; and the interactive demos (`[data-demo="fsm"]`, `[data-demo="perception"]`), started by the router when their view opens.

## Development

There is no build, lint, or test tooling. Open [index.html](index.html) directly in a browser (or serve the directory with any static file server) to preview changes — GitHub Pages serves the repo root as-is on push to `main`.

## Working conventions

- Keep everything in the three existing files (`index.html`, `style.css`, `script.js`) rather than introducing a build step, bundler, or framework — this site is intentionally dependency-free.
- To add a project, copy an existing project `<article>`; the Hierarchy, asset grid and prev/next update automatically. To add a non-project page, add an `<article class="view page">` and a link in the static part of `#hierarchy`.
- Unknown project details are shown as placeholders: `// TODO` (`.todo`) in prose, `None (...)` (`.none`) in Inspector fields, and `.slot` in galleries. Replace them with real content rather than inventing details.
- Theme colors should be changed via the CSS custom properties in `style.css`'s `:root` block, not hardcoded inline.
- `script.js` attaches all behavior with direct `querySelector` calls (the script loads at the end of `<body>`); init runs at the bottom of the file — no modules or imports are used.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
