---
phase: 07-advanced-examples-legends
verified: 2026-06-09T00:00:00Z
status: human_needed
score: 5/5 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Mindmap inline comments (IN-03): open the demo wiki, navigate to the Mindmap tiddler, and confirm the real-world example renders with correct hierarchy — no level shift caused by %% comment lines between indented nodes"
    expected: "Both basic and real-world mindmap examples display correct tree structure; no extra nesting or collapsed subtree visible"
    why_human: "Mermaid mindmap parser is indentation-sensitive; %% comment stripping behavior under the vendored bundle cannot be confirmed headlessly"
  - test: "Wardley Map space-containing identifiers (IN-04): open the demo wiki, navigate to the Wardley Map tiddler, and confirm the real-world example draws all link arrows correctly between multi-word components (Business Logic, API Gateway, Data Pipeline)"
    expected: "All chained links (Business Logic -> API Gateway -> Data Pipeline etc.) appear as arrows connecting the components; no missing or broken link segments"
    why_human: "Whether the wardley-beta Langium grammar resolves space-containing identifiers in link chains is unconfirmable from the minified bundle; requires live render"
  - test: "IN-02: ER relationship label (advisory only — no fix required): confirm that the current Mermaid Legend Recipe tips text accurately reflects bundle behavior; no user-facing regression from the overly strict wording"
    expected: "No render failures caused by the tip; diagram renders correctly with labelled relationships"
    why_human: "This is an advisory inaccuracy in prose (IN-02 is Info, not a Warning); human judgment needed on whether to soften the wording before Phase 8"
---

# Phase 7: Advanced Examples & Legends Verification Report

**Phase Goal:** Every in-scope diagram type the vendored Mermaid 11.14.0 bundle supports has an advanced, well-commented example, with legends where color-by-category is used, all discoverable from a catalog.
**Verified:** 2026-06-09T00:00:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Each of the 26 in-scope diagram types has an advanced, well-commented example tagged `MermaidExample` and authored with `$$$text/vnd.tiddlywiki.mermaid` block syntax (EXAMPLE-01) | VERIFIED | All 26 `.tid` files exist; `PHASE07_COMPLETE=1 node --test tests/phase07-structure.test.js` reports `# fail 0`; every file has `tags: MermaidExample` and at least one `$$$text/vnd.tiddlywiki.mermaid` block |
| 2 | The previously broken Sankey `R&D` example renders without ampersand; older bare-content Format B tiddlers migrated to consistent `.tid` format (EXAMPLE-02) | VERIFIED | `grep '&' Sankey Diagram.tid` returns 0 matches; all 9 stale Format B files and their `.meta` sidecars confirmed absent from disk |
| 3 | A user can find every advanced example from the shared `MermaidExample` tag and the `Mermaid Chart Catalog` index tiddler (EXAMPLE-03) | VERIFIED | Catalog contains `<<list-links filter:"[tag[MermaidExample]]">>` at line 94; catalog links to all 26 diagram types using clean titles; 27 tiddlers tagged `MermaidExample` confirmed |
| 4 | A reusable legend / "key box" recipe tiddler documents the WikiText table pattern for showing color-to-category mapping (LEGEND-01) | VERIFIED | `Mermaid Legend Recipe.tid` exists; tagged `MermaidExample`; contains a live `$$$text/vnd.tiddlywiki.mermaid` `flowchart LR` block with `classDef catA fill:#0d6efd` / `catB fill:#198754` and a matching `|!Color|!Meaning|` legend table with `@@background-color:#0d6efd` / `@@background-color:#198754` swatches; last line is `[[← Mermaid Chart Catalog|Mermaid Chart Catalog]]` |
| 5 | Every advanced example that colors by category includes a legend so it stays readable (LEGEND-02) | VERIFIED | Flowchart, Class Diagram, State Diagram, User Journey, Git Graph, Block Diagram, Timeline each contain a `|!Color|!Meaning|` or `|!Section|!Meaning|` or `|!Branch|!Meaning|` legend table; Sequence Diagram correctly has no legend (D-05); Treemap and Timeline legends corrected post-review to describe sections by name without asserting specific hex colors (WR-03/WR-04) |

**Score:** 5/5 truths verified

### Deferred Items

None.

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `mermaid-tw5/tiddlers/Mermaid Legend Recipe.tid` | LEGEND-01 canonical recipe tiddler | VERIFIED | Tagged `MermaidExample`; contains `flowchart LR` with `classDef`; `|!Color|!Meaning|` legend with color-matched swatches; last line is labeled backlink |
| `mermaid-tw5/tiddlers/Flowchart.tid` | Advanced flowchart with classDef legend | VERIFIED | `tags: MermaidExample`; `$$$` block; 5-category legend with matching `classDef` fills; 8 `%% ──` section banners |
| `mermaid-tw5/tiddlers/Sequence Diagram.tid` | Advanced sequenceDiagram, no legend | VERIFIED | `tags: MermaidExample`; `$$$` block; no legend table (correct per D-05) |
| `mermaid-tw5/tiddlers/Class Diagram.tid` | Advanced classDiagram with legend | VERIFIED | `tags: MermaidExample`; `$$$` block; `|!Color|!Meaning|` legend; escaped pipe `<\|--` in reference table (WR-01 fixed) |
| `mermaid-tw5/tiddlers/State Diagram.tid` | Advanced stateDiagram-v2 with legend | VERIFIED | `tags: MermaidExample`; `$$$` block; legend table present |
| `mermaid-tw5/tiddlers/User Journey.tid` | Advanced journey with legend | VERIFIED | `tags: MermaidExample`; `$$$` block; legend table present |
| `mermaid-tw5/tiddlers/Git Graph.tid` | Advanced gitGraph with branch-color legend | VERIFIED | `tags: MermaidExample`; `$$$` block; legend table present |
| `mermaid-tw5/tiddlers/Entity Relationship.tid` | Advanced erDiagram | VERIFIED | `tags: MermaidExample`; `$$$` block |
| `mermaid-tw5/tiddlers/Gantt.tid` | Advanced gantt with structural `%%{init}%%` | VERIFIED | `tags: MermaidExample`; `$$$` block; structural-only `%%{init}%%` (no theme keys) |
| `mermaid-tw5/tiddlers/Pie Chart.tid` | Advanced pie (native legend) | VERIFIED | `tags: MermaidExample`; `$$$` block |
| `mermaid-tw5/tiddlers/Requirement Diagram.tid` | Advanced requirementDiagram | VERIFIED | `tags: MermaidExample`; `$$$` block |
| `mermaid-tw5/tiddlers/C4 Diagram.tid` | Advanced C4Context diagram | VERIFIED | `tags: MermaidExample`; `$$$` block |
| `mermaid-tw5/tiddlers/Architecture Diagram.tid` | Advanced architecture diagram | VERIFIED | `tags: MermaidExample`; `$$$` block |
| `mermaid-tw5/tiddlers/Mindmap.tid` | Advanced mindmap | VERIFIED | `tags: MermaidExample`; `$$$` block |
| `mermaid-tw5/tiddlers/Timeline.tid` | Advanced timeline with corrected legend | VERIFIED | `tags: MermaidExample`; `$$$` block; legend corrected to section-name descriptions without color assertions (WR-04 fixed) |
| `mermaid-tw5/tiddlers/Sankey Diagram.tid` | Advanced sankey-beta, no ampersand | VERIFIED | `tags: MermaidExample`; `$$$` block; 0 ampersand characters in file |
| `mermaid-tw5/tiddlers/XY Chart.tid` | Advanced xychart-beta | VERIFIED | `tags: MermaidExample`; `$$$` block |
| `mermaid-tw5/tiddlers/Block Diagram.tid` | Advanced block diagram with legend | VERIFIED | `tags: MermaidExample`; `$$$` block; legend table present |
| `mermaid-tw5/tiddlers/Packet Diagram.tid` | Advanced packet diagram | VERIFIED | `tags: MermaidExample`; `$$$` block |
| `mermaid-tw5/tiddlers/Kanban Board.tid` | Advanced kanban | VERIFIED | `tags: MermaidExample`; `$$$` block |
| `mermaid-tw5/tiddlers/Quadrant Chart.tid` | Advanced quadrantChart | VERIFIED | `tags: MermaidExample`; `$$$` block |
| `mermaid-tw5/tiddlers/Radar Chart.tid` | Advanced radar with structural `%%{init}%%` | VERIFIED | `tags: MermaidExample`; `$$$` block; structural-only `%%{init}%%` (no theme keys) |
| `mermaid-tw5/tiddlers/Venn Diagram.tid` | Advanced venn-beta | VERIFIED | `tags: MermaidExample`; `$$$` block |
| `mermaid-tw5/tiddlers/Ishikawa Diagram.tid` | Advanced ishikawa-beta | VERIFIED | `tags: MermaidExample`; `$$$` block |
| `mermaid-tw5/tiddlers/Treemap.tid` | Advanced treemap-beta with corrected legend | VERIFIED | `tags: MermaidExample`; `$$$` block; legend corrected to section-name descriptions without color assertions (WR-03 fixed) |
| `mermaid-tw5/tiddlers/Tree View.tid` | Advanced treeView-beta | VERIFIED | `tags: MermaidExample`; `$$$` block |
| `mermaid-tw5/tiddlers/Wardley Map.tid` | Advanced wardley-beta | VERIFIED | `tags: MermaidExample`; `$$$` block |
| `mermaid-tw5/tiddlers/Mermaid Chart Catalog.tid` | Updated catalog: 26 types, auto-index, legend link | VERIFIED | Intro reads "Twenty-six diagram types are available"; all 8 stale informal-title links repointed; `<<list-links filter:"[tag[MermaidExample]]">>` auto-index present; `[[Mermaid Legend Recipe]]` in footer |
| `tests/phase07-structure.test.js` | Structural assertion suite for Phase 7 | VERIFIED | Imports from `node:test`/`node:assert`; defines all 27 expected tiddlers; 6 `it` blocks covering tag, no-widget-body, no-theme-init, `$$$` presence, no-Sankey-ampersand, and completion gate; WR-05/WR-06 fixes applied (iterates disk presence list for tag guard; `[\s\S]*?` regex for broader theme detection) |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| `Mermaid Legend Recipe.tid` | `Mermaid Chart Catalog` | `[[← Mermaid Chart Catalog\|Mermaid Chart Catalog]]` backlink | WIRED | Confirmed at last line of file; labelled link form (WR-02 fix) |
| All 26 example `.tid` files | `Mermaid Chart Catalog` | `[[← Mermaid Chart Catalog\|Mermaid Chart Catalog]]` backlink | WIRED | Confirmed by grep across Flowchart, Sequence Diagram, Class Diagram, State Diagram, Treemap, Wardley Map, Ishikawa Diagram |
| `Mermaid Chart Catalog.tid` | `tag[MermaidExample]` | `<<list-links filter:"[tag[MermaidExample]]">>` | WIRED | Line 94 of catalog file; returns all 27 tagged tiddlers |
| `Mermaid Chart Catalog.tid` | `Mermaid Legend Recipe` | `[[Mermaid Legend Recipe]]` in See also footer | WIRED | Line 98 of catalog file |

---

### Data-Flow Trace (Level 4)

Not applicable — this phase authors static TiddlyWiki content tiddlers with no dynamic data sources, API calls, or stateful components. The `<<list-links>>` macro in the catalog is a built-in TW5 macro with no custom code.

---

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Phase completion gate: all 27 tiddlers present, tagged, lint-clean | `PHASE07_COMPLETE=1 node --test tests/phase07-structure.test.js` | `# tests 6 # pass 6 # fail 0` | PASS |
| Full test suite: no new failures | `node --test` | `33 pass / 1 fail` — single failure is pre-existing `wrapper.test.js` "displays a friendly error message for invalid syntax" (confirmed pre-Phase 7, unrelated to Phase 7 content changes) | PASS |
| No stale Format B tiddlers on disk | file existence checks | All 9 bare files and `.meta` sidecars confirmed absent | PASS |
| Sankey has no ampersand | `grep '&' Sankey Diagram.tid` | 0 matches | PASS |
| No `%%{init}%%` theme directives in any Phase 7 tiddler | `node:test` assertion + manual grep | 8 tiddlers use `%%{init}%%` with structural-only keys (flowchart.curve, gantt.barHeight, radar.width/height, treeView.rowIndent); 0 with theme/look/fontFamily/themeVariables | PASS |
| No `<$mermaid>` widget body in Phase 7 examples | `node:test` assertion + grep | `Theme Showcase.tid` and `TW5 Integration.tid` contain `<$mermaid>` but are not Phase 7 example tiddlers (untagged `MermaidExample`); 0 violations in Phase 7 files | PASS |

---

### Probe Execution

No probes declared in PLAN files. Phase 7 uses `node --test` as its verification mechanism (run above under Behavioral Spot-Checks).

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| EXAMPLE-01 | 07-02, 07-03, 07-04, 07-05 | Advanced, well-commented example for all 26 in-scope diagram types using `$$$` block syntax | SATISFIED | All 26 `.tid` files exist; tagged `MermaidExample`; every file has `$$$text/vnd.tiddlywiki.mermaid` block; completion gate green |
| EXAMPLE-02 | 07-02, 07-03, 07-04 | Sankey `R&D` parse error fixed; older bare-content tiddlers migrated to `.tid` format | SATISFIED | Sankey has 0 ampersands; all 9 Format B bare files and `.meta` sidecars deleted |
| EXAMPLE-03 | 07-06 | All advanced examples discoverable via shared tag and catalog/index tiddler | SATISFIED | Catalog has `<<list-links filter:"[tag[MermaidExample]]">>` auto-index; 27 tiddlers tagged; all catalog links are clean-title links |
| LEGEND-01 | 07-01 | Reusable legend / "key box" recipe tiddler with WikiText table pattern | SATISFIED | `Mermaid Legend Recipe.tid` exists; contains live diagram + matching `|!Color|!Meaning|` table; classDef fill values match swatch background-color values |
| LEGEND-02 | 07-02, 07-03, 07-04 | Every color-by-category example includes a legend | SATISFIED | Flowchart, Class Diagram, State Diagram, User Journey, Git Graph, Block Diagram, Timeline all have legend tables; Sequence Diagram correctly has none (D-05); Treemap and Timeline legend color claims corrected post-review (WR-03/WR-04) |

All 5 requirements satisfied. No orphaned requirements: REQUIREMENTS.md maps CONFIG-07 and DOCS-03 to Phase 8 (not Phase 7).

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `Entity Relationship.tid:185` | 185 | IN-02: tip states relationship labels are mandatory when they are optional in Mermaid 10+/11.x | INFO | Does not cause a render failure; factually too strict; could mislead authors. Advisory only — no fix required before phase completion. |
| `Mindmap.tid:51-99` | 51-99 | IN-03: `%% ──` comment lines interleaved with indented mindmap nodes; indentation-sensitive parser may shift hierarchy in some Mermaid versions | INFO | Could not be reproduced headlessly against the vendored bundle; requires live render check (see Human Verification below) |
| `Wardley Map.tid:65-71` | 65-71 | IN-04: multi-word component identifiers (`Business Logic`, `API Gateway`, `Data Pipeline`) used in chained link expressions | INFO | Whether wardley-beta Langium grammar handles spaced identifiers in link chains unambiguously could not be confirmed from minified source; requires live render check (see Human Verification below) |

No BLOCKER or WARNING anti-patterns remain. All 6 review warnings (WR-01 through WR-06) were fixed and committed prior to this verification:
- WR-01 (escaped pipe in Class Diagram table): confirmed `<\|--` at line 262
- WR-02 (broken back-links across 30 tiddlers): confirmed `[[← Mermaid Chart Catalog|Mermaid Chart Catalog]]` form in all sampled files
- WR-03 (Treemap legend color assertions): confirmed legend now uses section-name descriptions only
- WR-04 (Timeline legend color assertions): confirmed legend now uses era/label descriptions only
- WR-05 (tag test tautology): confirmed test now iterates disk-presence list independently from `existing()` for the tag guard
- WR-06 (narrow theme-detection regex): confirmed regex updated to `%%\{init[\s\S]*?["'](theme|look|fontFamily|themeVariables)["']`

---

### Human Verification Required

#### 1. Mindmap hierarchy under inline comments

**Test:** Open the demo wiki in a browser, navigate to the Mindmap tiddler, view the real-world example (second `$$$` block). Expand any collapsed node if needed.
**Expected:** The tree hierarchy renders correctly — all branches appear at the expected indentation levels with no extra nesting or collapsed subtree caused by the `%% ──` comment lines at lines 51-99.
**Why human:** Mermaid's mindmap parser is indentation-sensitive. The `%% comment` lines are interleaved between hierarchy-bearing lines. Whether the vendored bundle strips these comments before parsing cannot be confirmed from the minified source.

#### 2. Wardley Map multi-word identifier links

**Test:** Open the demo wiki, navigate to the Wardley Map tiddler, view the real-world example. Inspect whether link arrows are drawn between all chained components.
**Expected:** All link arrows appear: `Customer -> Dashboard -> Business Logic`, `Business Logic -> API Gateway -> Data Pipeline`, `Data Pipeline -> PostgreSQL`, `Data Pipeline -> Object Storage`, `Business Logic -> Compute`, and the `evolve` positions display correctly.
**Why human:** The wardley-beta Langium grammar's handling of space-containing identifiers in link chains could not be confirmed from the minified bundle. The basic example uses single-word names; the real-world example uses multi-word names. If links fail to draw, the fix would be single-token identifiers.

#### 3. IN-02 advisory: ER relationship label wording

**Test:** Review the tip at `Entity Relationship.tid:185` and decide whether to soften "required by the parser or the diagram will not render" to "recommended for clarity."
**Expected:** Informed human decision on whether to leave the strict-but-harmless wording or soften it before Phase 8 documentation (which may reference the ER example).
**Why human:** The diagram renders correctly regardless; this is a prose accuracy judgment with no automated signal.

---

### Gaps Summary

No blocking gaps. All 5 requirements (EXAMPLE-01, EXAMPLE-02, EXAMPLE-03, LEGEND-01, LEGEND-02) are satisfied in the codebase. The 6 review warnings were fixed and committed. The 3 items requiring human decision are advisory (IN-02) or visual render checks (IN-03, IN-04) that cannot be confirmed headlessly.

---

_Verified: 2026-06-09T00:00:00Z_
_Verifier: Claude (gsd-verifier)_
