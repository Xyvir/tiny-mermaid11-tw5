---
phase: 06-config-wiring-foundation
plan: 01
subsystem: testing, config
tags: [mermaid, tiddlywiki, config-tiddler, test-mock, sankey]

# Dependency graph
requires:
  - phase: none
    provides: baseline test infrastructure from prior phases
provides:
  - mockMermaidAPI.initializeCalls tracking for behavioral config-wiring tests
  - mockMermaidAPI.lastRenderSource tracking for %%{init}%% injection tests
  - JSON shadow config tiddler $:/plugins/orange/mermaid-tw5/config with site-wide defaults
  - config tiddler registered in plugin.info list field (ships in bundle)
  - Sankey Diagram.tid fixed: R and D replaces R&D (issue #7528)
affects:
  - 06-02-PLAN.md (wrapper.js buildSiteConfig + initialize-once)
  - 06-03-PLAN.md (%%{init}%% injection behavioral tests)
  - 07-* (Phase 7 Sankey authoring unblocked)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "JSON shadow tiddler pattern: type application/json + getTiddlerData() for site config"
    - "Test call recording: module-level stateful fields reset per-test in beforeEach"

key-files:
  created:
    - mermaid-tw5/plugins/mermaid-tw5/$__plugins_mermaid-tw5_config.tid
  modified:
    - tests/helpers/tw-bootstrap.js
    - mermaid-tw5/plugins/mermaid-tw5/plugin.info
    - mermaid-tw5/tiddlers/Sankey Diagram.tid

key-decisions:
  - "O-02 adopted: per-type config blocks (flowchart/sequence/gantt) live in global config-tiddler JSON, not dotted tiddler fields (deferred v0.7.0)"
  - "startOnLoad: false documented in config tiddler as informational default; Plan 02 buildSiteConfig() hardcodes and refuses override (D-07)"
  - "flowchart block includes both useMaxWidth and htmlLabels to preserve historic plugin defaults under shallow-replace (D-04/Pitfall 1)"

patterns-established:
  - "Config tiddler pattern: title/type/tags header, blank line, JSON body — no created/modified timestamps in plugin bundle tiddlers"
  - "Mock call recording: initializeCalls array and lastRenderSource null at module level; tests reset in beforeEach (not in mock itself)"

requirements-completed: [CONFIG-04, CONFIG-06]

# Metrics
duration: 10min
completed: 2026-06-07
---

# Phase 06 Plan 01: Config Wiring Foundation — Infrastructure Summary

**Wave 0 test infrastructure and data files: mockMermaidAPI call tracking, JSON shadow config tiddler with securityLevel loose, plugin.info bundle registration, and Sankey R&D parse-error fix**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-06-07T23:05:00Z
- **Completed:** 2026-06-07T23:06:44Z
- **Tasks:** 3 / 3
- **Files modified:** 4

## Accomplishments
- Extended `mockMermaidAPI` in `tw-bootstrap.js` with `initializeCalls` and `lastRenderSource` so Plans 02-03 behavioral tests can assert on `initialize()` call count/args and the `scriptBody` passed to `render()`
- Created JSON shadow config tiddler `$:/plugins/orange/mermaid-tw5/config` with documented site-wide defaults (`securityLevel: loose`, `startOnLoad: false`, `flowchart: { useMaxWidth, htmlLabels }`) and registered it in `plugin.info` so it ships in the plugin bundle
- Fixed Sankey `R&D` parse error (upstream Mermaid issue #7528) in both the display fence and the live mermaid block, unblocking Phase 7 Sankey authoring

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend test mock with initialize/render call tracking** - `1a76928` (feat)
2. **Task 2: Create JSON shadow config tiddler and register in plugin.info** - `e463d9a` (feat)
3. **Task 3: Fix Sankey R&D parse error (D-08 prerequisite)** - `2fd80e0` (fix)

## Files Created/Modified
- `tests/helpers/tw-bootstrap.js` - Added `initializeCalls: []`, `lastRenderSource: null`, recording logic to `initialize()` and `render()`
- `mermaid-tw5/plugins/mermaid-tw5/$__plugins_mermaid-tw5_config.tid` - New JSON shadow config tiddler with site-wide Mermaid defaults
- `mermaid-tw5/plugins/mermaid-tw5/plugin.info` - Appended `config` to `list` field so tiddler ships in bundle
- `mermaid-tw5/tiddlers/Sankey Diagram.tid` - Replaced both `R&D` occurrences with `R and D`

## Decisions Made
- O-02 adopted: per-type config blocks live in the global JSON config tiddler (not dotted tiddler fields, which are deferred to v0.7.0). The `flowchart` block in this tiddler is the canonical documented pattern.
- `flowchart.useMaxWidth` and `flowchart.htmlLabels` explicitly included in the config tiddler defaults to preserve historic plugin behavior under shallow-replace (D-04/Pitfall 1).
- `startOnLoad: false` present in config tiddler as documentation but Plan 02's `buildSiteConfig()` will hardcode it and refuse override (D-07).

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Wave 0 prerequisites complete: mock records `initializeCalls` and `lastRenderSource`
- JSON config tiddler ships in bundle and is readable via `$tw.wiki.getTiddlerData()`
- Plan 02 can proceed with `buildSiteConfig()` implementation and `initialize()` once-per-page wiring
- Plan 03 can proceed with `%%{init}%%` injection behavioral tests
- Phase 7 Sankey example authoring is unblocked (no `&` in node names)
- Baseline test counts: 14 pass, 1 pre-existing fail (unchanged)

## Self-Check: PASSED

- FOUND: mermaid-tw5/plugins/mermaid-tw5/$__plugins_mermaid-tw5_config.tid
- FOUND: tests/helpers/tw-bootstrap.js (modified)
- FOUND: mermaid-tw5/tiddlers/Sankey Diagram.tid (modified)
- FOUND: .planning/phases/06-config-wiring-foundation/06-01-SUMMARY.md
- FOUND: commit 1a76928 (feat: test mock extension)
- FOUND: commit e463d9a (feat: config tiddler + plugin.info)
- FOUND: commit 2fd80e0 (fix: Sankey R&D)

---
*Phase: 06-config-wiring-foundation*
*Completed: 2026-06-07*
