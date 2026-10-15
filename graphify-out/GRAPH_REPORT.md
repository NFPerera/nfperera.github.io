# Graph Report - nfperera.github.io  (2026-10-15)

## Corpus Check
- 5 files · ~38,556 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 2 file(s) not represented in the graph (top: (none) 1, .css 1)

## Summary
- 94 nodes · 150 edges · 7 communities (6 shown, 1 thin omitted)
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 16 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `32f3ca73`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- script.js
- agroDemo
- neuroDemo
- CLAUDE.md
- ballisticsDemo
- t
- fsmDemo

## God Nodes (most connected - your core abstractions)
1. `t()` - 16 edges
2. `neuroDemo()` - 11 edges
3. `agroDemo()` - 11 edges
4. `draw()` - 9 edges
5. `frame()` - 7 edges
6. `route()` - 6 edges
7. `applyLang()` - 6 edges
8. `perceptionDemo()` - 6 edges
9. `step()` - 6 edges
10. `log()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Repository overview` --references--> `t()`  [INFERRED]
  CLAUDE.md → script.js
- `Repository overview` --references--> `applyLang()`  [INFERRED]
  CLAUDE.md → script.js

## Import Cycles
- None detected.

## Communities (7 total, 1 thin omitted)

### Community 0 - "script.js"
Cohesion: 0.05
Nodes (38): AGRO_COLORS, AGRO_CROPS, AGRO_MONTH_NAMES, AGRO_MONTHS, AGRO_ROTATION, AGRO_SOY, AGRO_STAGES, AGRO_WEATHER (+30 more)

### Community 1 - "agroDemo"
Cohesion: 0.25
Nodes (16): agroDay(), agroDemo(), colorOf(), draw(), drawLegend(), frame(), monthOf(), pointAt() (+8 more)

### Community 2 - "neuroDemo"
Cohesion: 0.43
Nodes (5): neuroDemo(), evolve(), sense(), step(), tournament()

### Community 3 - "CLAUDE.md"
Cohesion: 0.40
Nodes (3): Development, graphify, Working conventions

### Community 4 - "ballisticsDemo"
Cohesion: 0.70
Nodes (5): ballisticsDemo(), flight(), render(), zeroAngle(), g7Cd()

### Community 5 - "t"
Cohesion: 0.23
Nodes (14): Repository overview, applyLang(), closeHierarchy(), currentTheme(), log(), monarchMigration(), openView(), resetTyping() (+6 more)

## Knowledge Gaps
- **41 isolated node(s):** `STR`, `consoleLog`, `consoleToggle`, `consoleLast`, `views` (+36 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 50 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `neuroDemo()` connect `neuroDemo` to `script.js`, `agroDemo`, `t`?**
  _High betweenness centrality (0.145) - this node is a cross-community bridge._
- **Why does `t()` connect `t` to `script.js`, `agroDemo`, `neuroDemo`, `ballisticsDemo`?**
  _High betweenness centrality (0.132) - this node is a cross-community bridge._
- **Why does `Repository overview` connect `t` to `CLAUDE.md`?**
  _High betweenness centrality (0.103) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `neuroDemo()` (e.g. with `script.js` and `frame()`) actually correct?**
  _`neuroDemo()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `agroDemo()` (e.g. with `script.js` and `frame()`) actually correct?**
  _`agroDemo()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `frame()` (e.g. with `agroDemo()` and `neuroDemo()`) actually correct?**
  _`frame()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `STR`, `consoleLog`, `consoleToggle` to the rest of the system?**
  _41 weakly-connected nodes found - possible documentation gaps or missing edges._