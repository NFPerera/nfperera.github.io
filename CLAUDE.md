# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository overview

This is a static single-page personal portfolio site for Nicolás Fernández Perera (NFPerera / Monarch Wing Studios), deployed via GitHub Pages at `MonarchWingStudios.github.io`. There is no build system, package manager, or framework — just three files served directly:

- [index.html](index.html) — all page content and structure, organized as sections (`#hero`, `#about`, `#experience`, `#projects`, `#contact`) inside `<main id="main-content">`
- [style.css](style.css) — all styling, theme colors defined as CSS custom properties in `:root` (`--header-bg`, `--main-bg`, `--text-color`, `--card-bg`, `--nav-bg`)
- [script.js](script.js) — all behavior: smooth-scroll for in-page nav links, a typewriter effect cycling through role titles in `#typing-text`, and a click-to-copy handler on the email link (`#email-btn`)

## Development

There is no build, lint, or test tooling. Open [index.html](index.html) directly in a browser (or serve the directory with any static file server) to preview changes — GitHub Pages serves the repo root as-is on push to `main`.

## Working conventions

- Keep everything in the three existing files (`index.html`, `style.css`, `script.js`) rather than introducing a build step, bundler, or framework — this site is intentionally dependency-free.
- New sections should follow the existing pattern: a `<section id="...">` with class `container` inside `#main-content`, linked from the `#navbar` list.
- Theme colors should be changed via the CSS custom properties in `style.css`'s `:root` block, not hardcoded inline.
- `script.js` attaches all behavior via `document.addEventListener('DOMContentLoaded', ...)` / direct `querySelector` calls at the bottom of the file — no modules or imports are used.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
