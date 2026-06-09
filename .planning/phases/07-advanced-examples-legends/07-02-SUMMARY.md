---
phase: 07-advanced-examples-legends
plan: 02
subsystem: content-authoring
tags: [migration, format-b-to-a, legend, wave-2, EXAMPLE-01, EXAMPLE-02, LEGEND-02]
dependency_graph:
  requires: [07-01]
  provides: [Flowchart.tid, Sequence-Diagram.tid, Class-Diagram.tid, State-Diagram.tid, User-Journey.tid, Git-Graph.tid]
  affects:
    - mermaid-tw5/tiddlers/Flowchart.tid
    - mermaid-tw5/tiddlers/Sequence Diagram.tid
    - mermaid-tw5/tiddlers/Class Diagram.tid
    - mermaid-tw5/tiddlers/State Diagram.tid
    - mermaid-tw5/tiddlers/User Journey.tid
    - mermaid-tw5/tiddlers/Git Graph.tid
tech_stack:
  added: []
  patterns: [WikiText-table-legend, TW5-Format-A-tiddler, D-01-template, classDef-color-categories]
key_files:
  created:
    - mermaid-tw5/tiddlers/Flowchart.tid
    - mermaid-tw5/tiddlers/Sequence Diagram.tid
    - mermaid-tw5/tiddlers/Class Diagram.tid
    - mermaid-tw5/tiddlers/State Diagram.tid
    - mermaid-tw5/tiddlers/User Journey.tid
    - mermaid-tw5/tiddlers/Git Graph.tid
  modified: []
  deleted:
    - mermaid-tw5/tiddlers/Flowchart
    - mermaid-tw5/tiddlers/Flowchart.meta
    - mermaid-tw5/tiddlers/sequenceDiagram 1
    - mermaid-tw5/tiddlers/sequenceDiagram 1.meta
    - mermaid-tw5/tiddlers/Class diagrams
    - mermaid-tw5/tiddlers/Class diagrams.meta
    - mermaid-tw5/tiddlers/stateDiagram 1
    - mermaid-tw5/tiddlers/stateDiagram 1.meta
    - mermaid-tw5/tiddlers/User Journey Diagram
    - mermaid-tw5/tiddlers/User Journey Diagram.meta
    - mermaid-tw5/tiddlers/Gitgraph Diagram 1
    - mermaid-tw5/tiddlers/Gitgraph Diagram 1.meta
decisions:
  - Sequence Diagram.tid carries no legend (D-05 confirmed — actor colors are cosmetic, not categorical)
  - User Journey.tid uses text-label legend variant (section colors cycle automatically, no hex classDef values)
  - Git Graph.tid legend describes branch-color palette order (git0-git7) since branch colors cannot be set via classDef
metrics:
  duration: 12 minutes
  completed: 2026-06-09
---

# Phase 07 Plan 02: 6 Format B → Format A Migrations Summary

**One-liner:** Six canonical example tiddlers (Flowchart, Sequence Diagram, Class Diagram, State Diagram, User Journey, Git Graph) migrated from stale Format B bare-content files to advanced Format A `.tid` tiddlers with D-01 templates, `%%`-section-banners, and category color legends (LEGEND-02).

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Flowchart, Sequence Diagram, Class Diagram (Format B → A) | 9a80a32 | 3 new .tid files; 6 Format B files deleted |
| 2 | State Diagram, User Journey, Git Graph (Format B → A) | d482e56 | 3 new .tid files; 6 Format B files deleted |

## Verification Results

- `node --test tests/phase07-structure.test.js` → `# fail 0` (6 tests pass)
- Phase 7 progress: 16 / 27 tiddlers present (was 10/27 before plan)
- All 6 new `.tid` files: tagged `MermaidExample`, contain `$$$text/vnd.tiddlywiki.mermaid` block, end with `[[← Mermaid Chart Catalog]]`
- No `<$mermaid>` widget body usage in any new file
- No `theme`/`look`/`fontFamily`/`themeVariables` in any `%%{init}%%` block
- Legend tables present in: Flowchart.tid, Class Diagram.tid, State Diagram.tid, User Journey.tid, Git Graph.tid
- No legend in Sequence Diagram.tid (correct per D-05)
- All 12 Format B originals deleted (6 bare files + 6 `.meta` sidecars)
- `%%{init}%%` usage: only structural keys — `flowchart.curve` (Flowchart), `sequence.showSequenceNumbers` (Sequence Diagram)

## Per-File Legend Details

| File | Legend Type | Colors Used |
|------|-------------|-------------|
| Flowchart.tid | `|!Color|!Meaning|` (classDef swatches) | #6c757d actor, #0d6efd trigger, #198754 stage, #fd7e14 gate, #dc3545 warning |
| Sequence Diagram.tid | None (D-05) | — |
| Class Diagram.tid | `|!Color|!Meaning|` (classDef swatches) | #6f42c1 value-object, #0d6efd aggregate, #198754 supporting, #fd7e14 service |
| State Diagram.tid | `|!Color|!Meaning|` (classDef swatches) | #6c757d initial, #0d6efd active, #fd7e14 gate, #dc3545 failure, #198754 terminal |
| User Journey.tid | `|!Section|!Color|!Meaning|` (text-label variant) | Section cycle colors described as Blue/Green/Orange/Pink/Teal |
| Git Graph.tid | `|!Branch|!Color (palette order)|!Role|` (text-label variant) | git0–git5 palette positions described |

## Deviations from Plan

None — plan executed exactly as written. All decisions (D-02, D-03, D-05, D-09) honored:
- Structural-only `%%{init}%%` keys (`flowchart.curve`, `sequence.showSequenceNumbers`)
- `%%` section banners inside every real-world `$$$` block
- No legend for Sequence Diagram
- Single `MermaidExample` tag on all six tiddlers

## Known Stubs

None — all six tiddlers are complete content artifacts with real-world examples, syntax sections, and tips. No placeholders or TODO markers.

## Threat Flags

None — static content authoring only; no new network endpoints, auth paths, or runtime input handling. T-07-01 (theme directives) and T-07-03 (stale Format B duplicates) both mitigated as planned.

## Self-Check: PASSED

- [x] `mermaid-tw5/tiddlers/Flowchart.tid` exists
- [x] `mermaid-tw5/tiddlers/Sequence Diagram.tid` exists
- [x] `mermaid-tw5/tiddlers/Class Diagram.tid` exists
- [x] `mermaid-tw5/tiddlers/State Diagram.tid` exists
- [x] `mermaid-tw5/tiddlers/User Journey.tid` exists
- [x] `mermaid-tw5/tiddlers/Git Graph.tid` exists
- [x] Format B originals deleted: Flowchart, Flowchart.meta, sequenceDiagram 1, sequenceDiagram 1.meta, Class diagrams, Class diagrams.meta, stateDiagram 1, stateDiagram 1.meta, User Journey Diagram, User Journey Diagram.meta, Gitgraph Diagram 1, Gitgraph Diagram 1.meta
- [x] Commit 9a80a32 exists in git log
- [x] Commit d482e56 exists in git log
- [x] `node --test tests/phase07-structure.test.js` → `# fail 0`
