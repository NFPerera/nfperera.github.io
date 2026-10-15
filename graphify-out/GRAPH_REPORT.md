# Graph Report - nfperera.github.io  (2026-10-15)

## Corpus Check
- 5 files · ~34,366 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 2 file(s) not represented in the graph (top: (none) 1, .css 1)

## Summary
- 84 nodes · 116 edges · 8 communities (6 shown, 2 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `27bb3956`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- script.js
- agroDemo
- neuroDemo
- CLAUDE.md
- ballisticsDemo
- log
- fsmDemo
- currentTheme

## God Nodes (most connected - your core abstractions)
1. `agroDemo()` - 11 edges
2. `neuroDemo()` - 10 edges
3. `draw()` - 7 edges
4. `frame()` - 7 edges
5. `step()` - 6 edges
6. `log()` - 5 edges
7. `fsmDemo()` - 5 edges
8. `perceptionDemo()` - 5 edges
9. `frame()` - 4 edges
10. `ballisticsDemo()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `neuroDemo()` --indirect_call--> `frame()`  [INFERRED]
  script.js → script.js  _Bridges community 2 → community 1_
- `neuroDemo()` --calls--> `log()`  [EXTRACTED]
  script.js → script.js  _Bridges community 5 → community 2_
- `perceptionDemo()` --calls--> `svgPoint()`  [EXTRACTED]
  script.js → script.js  _Bridges community 6 → community 1_

## Import Cycles
- None detected.

## Communities (8 total, 2 thin omitted)

### Community 0 - "script.js"
Cohesion: 0.05
Nodes (36): AGRO_COLORS, AGRO_CROPS, AGRO_MONTH_NAMES, AGRO_MONTHS, AGRO_ROTATION, AGRO_SOY, AGRO_STAGES, AGRO_WEATHER (+28 more)

### Community 1 - "agroDemo"
Cohesion: 0.27
Nodes (14): agroDay(), agroDemo(), colorOf(), draw(), frame(), monthOf(), pointAt(), sow() (+6 more)

### Community 2 - "neuroDemo"
Cohesion: 0.43
Nodes (5): neuroDemo(), evolve(), sense(), step(), tournament()

### Community 3 - "CLAUDE.md"
Cohesion: 0.33
Nodes (4): Development, graphify, Repository overview, Working conventions

### Community 4 - "ballisticsDemo"
Cohesion: 0.70
Nodes (5): ballisticsDemo(), flight(), render(), zeroAngle(), g7Cd()

### Community 5 - "log"
Cohesion: 0.40
Nodes (5): closeHierarchy(), log(), monarchMigration(), openView(), route()

## Knowledge Gaps
- **40 isolated node(s):** `consoleLog`, `consoleToggle`, `consoleLast`, `views`, `projects` (+35 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 49 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `neuroDemo()` connect `neuroDemo` to `script.js`, `agroDemo`, `log`?**
  _High betweenness centrality (0.150) - this node is a cross-community bridge._
- **Why does `agroDemo()` connect `agroDemo` to `script.js`?**
  _High betweenness centrality (0.127) - this node is a cross-community bridge._
- **Why does `ballisticsDemo()` connect `ballisticsDemo` to `script.js`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `agroDemo()` (e.g. with `script.js` and `frame()`) actually correct?**
  _`agroDemo()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `neuroDemo()` (e.g. with `script.js` and `frame()`) actually correct?**
  _`neuroDemo()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `frame()` (e.g. with `agroDemo()` and `neuroDemo()`) actually correct?**
  _`frame()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `consoleLog`, `consoleToggle`, `consoleLast` to the rest of the system?**
  _40 weakly-connected nodes found - possible documentation gaps or missing edges._