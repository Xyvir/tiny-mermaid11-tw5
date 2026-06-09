---
phase: 07-advanced-examples-legends
plan: 04
subsystem: content-authoring
tags: [expand, format-a, legend, wave-2, EXAMPLE-01, LEGEND-02]
dependency_graph:
  requires: [07-01]
  provides: [Architecture-Diagram.tid, Mindmap.tid, Timeline.tid, Sankey-Diagram.tid, XY-Chart.tid, Block-Diagram.tid, Packet-Diagram.tid, Kanban-Board.tid, Quadrant-Chart.tid]
  affects:
    - mermaid-tw5/tiddlers/Architecture Diagram.tid
    - mermaid-tw5/tiddlers/Mindmap.tid
    - mermaid-tw5/tiddlers/Timeline.tid
    - mermaid-tw5/tiddlers/Sankey Diagram.tid
    - mermaid-tw5/tiddlers/XY Chart.tid
    - mermaid-tw5/tiddlers/Block Diagram.tid
    - mermaid-tw5/tiddlers/Packet Diagram.tid
    - mermaid-tw5/tiddlers/Kanban Board.tid
    - mermaid-tw5/tiddlers/Quadrant Chart.tid
tech_stack:
  added: []
  patterns: [WikiText-table-legend, TW5-Format-A-expand, D-01-template, section-banner-comments]
key_files:
  created: []
  modified:
    - mermaid-tw5/tiddlers/Architecture Diagram.tid
    - mermaid-tw5/tiddlers/Mindmap.tid
    - mermaid-tw5/tiddlers/Timeline.tid
    - mermaid-tw5/tiddlers/Sankey Diagram.tid
    - mermaid-tw5/tiddlers/XY Chart.tid
    - mermaid-tw5/tiddlers/Block Diagram.tid
    - mermaid-tw5/tiddlers/Packet Diagram.tid
    - mermaid-tw5/tiddlers/Kanban Board.tid
    - mermaid-tw5/tiddlers/Quadrant Chart.tid
decisions:
  - Timeline legend uses simpler |!Section|!Color|!Meaning| text-label variant (D-05 — section colors cycle automatically, no hex classDef values)
  - Block Diagram legend uses |!Color|!Meaning| full-swatch variant matching style fill:#... values per D-04
  - Sankey tips section avoids literal ampersand character to satisfy structure test (e) assertion across the whole file body
metrics:
  duration: 5 minutes
  completed: 2026-06-09
---

# Phase 07 Plan 04: Expand 9 Format A Tiddlers Summary

**One-liner:** Nine existing Format A example tiddlers expanded with `tags: MermaidExample`, `%% ── section ──` banner comments in their real-world examples, and WikiText legends for the two color-by-category types (Timeline, Block Diagram).

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Expand Architecture Diagram, Mindmap, Timeline | c4afe2a | Architecture Diagram.tid, Mindmap.tid, Timeline.tid |
| 2 | Expand Sankey Diagram, XY Chart, Block Diagram | a3428fe | Sankey Diagram.tid, XY Chart.tid, Block Diagram.tid |
| 3 | Expand Packet Diagram, Kanban Board, Quadrant Chart | f20d83e | Packet Diagram.tid, Kanban Board.tid, Quadrant Chart.tid |

## Verification Results

- `node --test tests/phase07-structure.test.js` → `# fail 0` (6 tests pass)
- `node --test tests/*.test.js` → `# fail 1` (pre-existing `wrapper.test.js` failure only — no new failures)
- Phase 7 progress: 21 / 27 tiddlers present (was 12/27 before plan)
- All 9 files: tagged `MermaidExample`, contain `$$$text/vnd.tiddlywiki.mermaid` block, end with `[[← Mermaid Chart Catalog]]`
- No `<$mermaid>` widget body usage in any file
- No `theme`/`look`/`fontFamily`/`themeVariables` in any `%%{init}%%` block
- Legend tables present in: Timeline.tid (section-color variant), Block Diagram.tid (full-swatch variant)
- No legend in 7 others (correct per D-05)
- Sankey body contains no `&` character throughout (structure test (e) passes)
- Mindmap `$$$` blocks use spaces only (no tab characters)

## Per-File Legend Details

| File | Legend Type | Colors/Variant Used |
|------|-------------|---------------------|
| Architecture Diagram.tid | None (D-05 — icons self-documenting) | — |
| Mindmap.tid | None (D-05 — no classDef) | — |
| Timeline.tid | `|!Section|!Color|!Meaning|` (text-label variant) | Blue/Green/Orange for 3 eras |
| Sankey Diagram.tid | None (D-05 — node labels self-documenting) | — |
| XY Chart.tid | None (D-05 — series labeled inline) | — |
| Block Diagram.tid | `|!Color|!Meaning|` (full-swatch variant) | #6c757d client, #0d6efd gateway, #198754 service, #fd7e14 data |
| Packet Diagram.tid | None (D-05 — field names self-documenting) | — |
| Kanban Board.tid | None (D-05 — column headers self-documenting) | — |
| Quadrant Chart.tid | None (D-05 — quadrant labels built-in) | — |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Sankey tips text contained literal ampersand character**
- **Found during:** Task 2 — after writing the Sankey tips section with `Avoid \`&\`` in prose, the full-file `grep '&'` in the verification script returned a match
- **Issue:** The structure test (e) and the plan's verify script check `! grep -q '&'` on the whole file body (not just Sankey node names), so even a legitimate `&` in WikiText prose text triggers a failure
- **Fix:** Rewrote the tip to use the word "ampersand" instead of the literal character: "Avoid ampersands, apostrophes, forward slashes, and hyphens in node names"
- **Files modified:** `mermaid-tw5/tiddlers/Sankey Diagram.tid`
- **Commit:** a3428fe (included in Task 2 commit)

## Known Stubs

None — all nine tiddlers are complete content artifacts with real-world examples using real scenario data. No placeholder text or TODO markers.

## Threat Flags

None — static content authoring only; no new network endpoints, auth paths, or runtime input handling.

T-07-01 (theme directives): mitigated — no `theme`/`look`/`fontFamily`/`themeVariables` in any expanded file.
T-07-04 (Sankey ampersand): mitigated — `&` absent from entire Sankey Diagram.tid body, structure test (e) passes.
T-07-05 (accidental rewrite): mitigated — all existing basic/syntax/tips sections preserved in all 9 files.

## Self-Check: PASSED

- [x] `mermaid-tw5/tiddlers/Architecture Diagram.tid` contains `tags: MermaidExample`
- [x] `mermaid-tw5/tiddlers/Mindmap.tid` contains `tags: MermaidExample`
- [x] `mermaid-tw5/tiddlers/Timeline.tid` contains `tags: MermaidExample` and `|!Section|!Color|!Meaning|`
- [x] `mermaid-tw5/tiddlers/Sankey Diagram.tid` contains `tags: MermaidExample` and no `&`
- [x] `mermaid-tw5/tiddlers/XY Chart.tid` contains `tags: MermaidExample`
- [x] `mermaid-tw5/tiddlers/Block Diagram.tid` contains `tags: MermaidExample` and `|!Color|!Meaning|`
- [x] `mermaid-tw5/tiddlers/Packet Diagram.tid` contains `tags: MermaidExample`
- [x] `mermaid-tw5/tiddlers/Kanban Board.tid` contains `tags: MermaidExample`
- [x] `mermaid-tw5/tiddlers/Quadrant Chart.tid` contains `tags: MermaidExample`
- [x] Commit c4afe2a exists in git log
- [x] Commit a3428fe exists in git log
- [x] Commit f20d83e exists in git log
- [x] `node --test tests/phase07-structure.test.js` → `# fail 0`
