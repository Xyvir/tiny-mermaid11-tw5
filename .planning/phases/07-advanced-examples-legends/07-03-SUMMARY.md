---
phase: 07-advanced-examples-legends
plan: 03
subsystem: content-authoring
tags: [migration, format-b-to-a, legend, wave-2, EXAMPLE-01, EXAMPLE-02, LEGEND-02]
dependency_graph:
  requires: [07-01]
  provides: [Entity-Relationship.tid, Gantt.tid, Pie-Chart.tid, Requirement-Diagram.tid, C4-Diagram.tid]
  affects:
    - mermaid-tw5/tiddlers/Entity Relationship.tid
    - mermaid-tw5/tiddlers/Gantt.tid
    - mermaid-tw5/tiddlers/Pie Chart.tid
    - mermaid-tw5/tiddlers/Requirement Diagram.tid
    - mermaid-tw5/tiddlers/C4 Diagram.tid
tech_stack:
  added: []
  patterns: [WikiText-table-legend, TW5-Format-A-tiddler, D-01-template, classDef-color-categories, erDiagram-crow-foot, gantt-dateFormat-axisFormat, requirementDiagram-types]
key_files:
  created:
    - mermaid-tw5/tiddlers/Entity Relationship.tid
    - mermaid-tw5/tiddlers/Gantt.tid
    - mermaid-tw5/tiddlers/Pie Chart.tid
    - mermaid-tw5/tiddlers/Requirement Diagram.tid
    - mermaid-tw5/tiddlers/C4 Diagram.tid
  modified: []
  deleted:
    - mermaid-tw5/tiddlers/Defining Relationship
    - mermaid-tw5/tiddlers/Defining Relationship.meta
    - mermaid-tw5/tiddlers/Gantt 1
    - mermaid-tw5/tiddlers/Gantt 1.meta
    - mermaid-tw5/tiddlers/Pie chart diagrams
    - mermaid-tw5/tiddlers/Pie chart diagrams.meta
    - mermaid-tw5/tiddlers/Requirement Diagram
    - mermaid-tw5/tiddlers/Requirement Diagram.meta
    - mermaid-tw5/tiddlers/C4 Diagram
    - mermaid-tw5/tiddlers/C4 Diagram.meta
decisions:
  - Entity Relationship.tid carries no legend (D-05 — erDiagram does not support classDef; PK/FK/UK annotations and relationship labels convey meaning)
  - Gantt.tid carries no legend (D-05 — sections labeled inline; no classDef coloring)
  - Pie Chart.tid carries no legend table (D-05 — Mermaid renders a native legend automatically)
  - Requirement Diagram.tid uses functionalRequirement/performanceRequirement/requirement type keywords for color-by-category plus a matching WikiText legend (LEGEND-02)
  - C4 Diagram.tid carries no legend (D-05 — Person/System/System_Ext shapes are self-labeled inline)
  - Same-title bare files (Requirement Diagram, C4 Diagram) deleted without any collision with the new .tid files — filesystem distinguishes extension-less vs .tid
metrics:
  duration: 15 minutes
  completed: 2026-06-09
---

# Phase 07 Plan 03: 5 Format B → Format A Migrations Summary

**One-liner:** Five canonical example tiddlers (Entity Relationship, Gantt, Pie Chart, Requirement Diagram, C4 Diagram) migrated from stale Format B bare-content files to advanced Format A `.tid` tiddlers with D-01 templates, section banners, and a category color legend on Requirement Diagram only (LEGEND-02).

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Entity Relationship, Gantt, Pie Chart (Format B → A) | 485c0aa | 3 new .tid files; 6 Format B files deleted |
| 2 | Requirement Diagram, C4 Diagram (same-title Format B → A) | 0e7560d | 2 new .tid files; 4 Format B bare files deleted |

## Verification Results

- `node --test tests/phase07-structure.test.js` → `# fail 0` (6 tests pass)
- Phase 7 progress: 21 / 27 tiddlers present (was 16/27 before plan)
- All 5 new `.tid` files: tagged `MermaidExample`, contain `$$$text/vnd.tiddlywiki.mermaid` block, end with `[[← Mermaid Chart Catalog]]`
- No `<$mermaid>` widget body usage in any new file
- No `theme`/`look`/`fontFamily`/`themeVariables` in any `%%{init}%%` block
- Legend table present in: Requirement Diagram.tid only
- No legend in: Entity Relationship.tid, Gantt.tid, Pie Chart.tid, C4 Diagram.tid (correct per D-05)
- All 10 Format B originals deleted (5 bare files + 5 `.meta` sidecars; including 2 same-title bare files)
- `%%{init}%%` usage: only structural keys — `gantt.barHeight` and `gantt.displayMode` (Gantt.tid)
- `erDiagram` relationships: every line carries a `": label"` (parser requirement)
- `gantt` diagram: both `dateFormat` AND `axisFormat` present

## Per-File Legend Details

| File | Legend Type | Notes |
|------|-------------|-------|
| Entity Relationship.tid | None (D-05) | erDiagram has no classDef; PK/FK/UK annotations used instead |
| Gantt.tid | None (D-05) | Section names label categories inline |
| Pie Chart.tid | None (D-05) | Native Mermaid legend rendered automatically |
| Requirement Diagram.tid | `\|!Color\|!Meaning\|` (type-keyword swatches) | #0d6efd Functional, #198754 Performance, #6c757d Interface |
| C4 Diagram.tid | None (D-05) | Person/System/System_Ext shapes self-labeled inline |

## Deviations from Plan

None — plan executed exactly as written. All decisions (D-02, D-03, D-05, D-09) honored:
- Structural-only `%%{init}%%` keys (`gantt.barHeight`, `gantt.displayMode`) in Gantt.tid only
- `%%` section banners inside every real-world `$$$` block
- Requirement Diagram carries LEGEND-02; all others do not
- Single `MermaidExample` tag on all five tiddlers
- Same-title bare files deleted precisely (extension-less `Requirement Diagram` and `C4 Diagram` deleted; `.tid` files kept)

## Known Stubs

None — all five tiddlers are complete content artifacts with real-world examples, syntax sections, and tips. No placeholders or TODO markers.

## Threat Flags

None — static content authoring only; no new network endpoints, auth paths, or runtime input handling. T-07-01 (theme directives in `%%{init}%%`) and T-07-03 (stale Format B duplicates including same-title bare files) both mitigated as planned.

## Self-Check: PASSED

- [x] `mermaid-tw5/tiddlers/Entity Relationship.tid` exists
- [x] `mermaid-tw5/tiddlers/Gantt.tid` exists
- [x] `mermaid-tw5/tiddlers/Pie Chart.tid` exists
- [x] `mermaid-tw5/tiddlers/Requirement Diagram.tid` exists
- [x] `mermaid-tw5/tiddlers/C4 Diagram.tid` exists
- [x] Format B originals deleted: Defining Relationship, Defining Relationship.meta, Gantt 1, Gantt 1.meta, Pie chart diagrams, Pie chart diagrams.meta, Requirement Diagram (bare), Requirement Diagram.meta, C4 Diagram (bare), C4 Diagram.meta
- [x] Commit 485c0aa exists in git log
- [x] Commit 0e7560d exists in git log
- [x] `node --test tests/phase07-structure.test.js` → `# fail 0`
