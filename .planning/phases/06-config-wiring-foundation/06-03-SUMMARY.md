---
phase: 06-config-wiring-foundation
plan: 03
subsystem: config, testing
tags: [mermaid, tiddlywiki, per-widget-config, init-directive, injection, tdd, live-verification]

# Dependency graph
requires:
  - phase: 06-02
    provides: buildPerWidgetInit(), NON_SECURE_INJECT_KEYS, mockMermaidAPI.lastRenderSource tracking
provides:
  - Per-widget %%{init}%% prepend injection via buildPerWidgetInit() in render path (wrapper.js lines 181-183)
  - Injection tests: theme prepend at index 0, fontFamily inject, no-inject on empty seed, class/style whitelist exclusion
  - Live-verified author %%{init}%% wins over widget-attribute via D-02 prepend (Mermaid last-wins merge)
  - Live-verified multi-diagram theme isolation (no last-diagram-wins bleed)
  - Live-verified click navigation under securityLevel 'loose'
  - Live-verified Sankey clean render (no R&D parse error)
affects:
  - 07 phase (Phase 7 examples consume per-widget theme config as wired here)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "D-02 prepend: plugin-injected %%{init}%% PREPENDED before scriptBody so author's in-source %%{init}%% (which comes later) wins via Mermaid last-wins merge"
    - "Pitfall-3 seed filter: buildPerWidgetInit skips theme='' to prevent spurious injection that would reset the global theme"
    - "O-01 whitelist: only NON_SECURE_INJECT_KEYS (theme/look/fontFamily/fontSize/themeVariables/darkMode) reach %%{init}%%; junk attrs (class/style) and secure keys (securityLevel) are excluded"

key-files:
  created: []
  modified:
    - mermaid-tw5/plugins/mermaid-tw5/$__plugins_mermaid-tw5_wrapper.js
    - tests/wrapper.test.js

key-decisions:
  - "D-02 prepend (not append) chosen: plugin %%{init}%% placed BEFORE scriptBody so any author in-source %%{init}%% lands last and wins via Mermaid's last-wins merge — author intent is never silently overridden"
  - "Task 1 delivered early in Plan 02 (commit 6b8bbb8): the injection block was written alongside buildPerWidgetInit() for cohesion; Plan 03 added the behavioral tests to prove the injection"
  - "Live verification performed by orchestrator via Playwright/Chromium against freshly built demo wiki — all 5 manual-only checks passed"

patterns-established:
  - "%%{init}%% injection site: lines 181-183 in wrapper.js, immediately after decodeHtmlEntities and before var renderDiagram"
  - "Injection test pattern: set widget.attributes before render(), inspect mockMermaidAPI.lastRenderSource for %%{init}: prefix and key presence"

requirements-completed: [CONFIG-02, CONFIG-05]

# Metrics
duration: ~15min (continuation, Tasks 1+2 pre-committed)
completed: 2026-06-08
---

# Phase 06 Plan 03: Per-Widget Config Wiring Summary

**Per-widget %%{init}%% prepend injection wired in wrapper.js render path, with 4 behavioral injection tests and live-verified Mermaid last-wins merge, multi-diagram theme isolation, and click navigation under securityLevel 'loose'**

## Performance

- **Duration:** ~15 min (continuation agent; Tasks 1+2 committed prior to checkpoint)
- **Completed:** 2026-06-08
- **Tasks:** 3 / 3 (Task 3 approved via live browser verification)
- **Files modified:** 2

## Accomplishments

- Per-widget non-secure config (theme, look, fontFamily, fontSize, themeVariables, darkMode) is prepended as `%%{init: {...}}%%\n` before `scriptBody` in the render path — CONFIG-02 no longer a no-op
- Injection block placed at wrapper.js lines 181-183 (after `decodeHtmlEntities`, before `var renderDiagram`), calling `buildPerWidgetInit(options)` added in Plan 02
- 4 new injection tests: theme prepend at index 0, fontFamily inject, no-inject when attrs empty (Pitfall-3 seed filter confirmed), class/style excluded (O-01 whitelist confirmed) — total 28 tests, 27 pass, 1 documented pre-existing failure
- Live verification (Playwright/Chromium, real demo wiki) confirmed all 5 manual-only checks: author `%%{init}%%` wins via prepend+last-wins, multi-diagram isolation, click navigation, Sankey clean render

## Task Commits

Each task was committed atomically:

1. **Task 1: %%{init}%% prepend injection in render path** - `6b8bbb8` (feat — delivered in Plan 02 for cohesion)
2. **Task 2: Injection tests** - `ea71426` (feat)
3. **Task 3: Human verify — live verification** - APPROVED (no code commit; orchestrator verified via Playwright/Chromium)

**Plan metadata:** (this SUMMARY commit)

## Files Created/Modified

- `mermaid-tw5/plugins/mermaid-tw5/$__plugins_mermaid-tw5_wrapper.js` — Added injection block (lines 179-184): `buildPerWidgetInit(options)` call + prepend `'%%{init: ' + JSON.stringify(perWidgetInit) + '}%%\n' + scriptBody` with D-02 comment
- `tests/wrapper.test.js` — Added 4 `it()` cases to `describe('config wiring')` block: theme prepend, fontFamily inject, no-inject on empty attrs, class/style exclusion (28 total tests)

## Decisions Made

- D-02 prepend strategy confirmed by live test: widget attribute `theme="dark"` + inline `%%{init: {"theme":"forest"}}%%` rendered with FOREST fills (rgb(205,228,152)) — author's in-source directive won as designed
- Task 1 was delivered early in Plan 02 for code cohesion (buildPerWidgetInit and its call site belong together); Plan 03 completed the TDD behavioral tests and live verification

## Deviations from Plan

None — plan executed exactly as written. Task 1 was intentionally delivered during Plan 02 execution (noted in 06-02-SUMMARY.md); Plan 03 correctly picked up from the injection tests and live checkpoint.

## Issues Encountered

None.

## Known Stubs

None. The injection is fully wired and exercised by both unit tests and live verification.

## Known Non-Blocking Notes

- Pre-existing console error: "bindFunctions error: this.querySelector is not a function" in `setupToolTips` (last modified in commit `e40513d`, pre-Phase-6). This is NOT a Phase 6 regression — diagrams render correctly and click navigation works. Noted for completeness.

## Threat Surface Scan

No new network endpoints, auth paths, file access patterns, or schema changes introduced. All STRIDE mitigations from the plan's threat register are implemented:
- T-06-06: NON_SECURE_INJECT_KEYS whitelist excludes class/style — verified by test + live
- T-06-07: securityLevel excluded from injection — verified by test
- T-06-08: Prepend ordering (D-02) confirmed live — author %%{init}%% wins

## Next Phase Readiness

- Phase 06 complete: all 3 plans (06-01, 06-02, 06-03) done; CONFIG-02 and CONFIG-05 satisfied
- Phase 07 (advanced examples) is unblocked: per-widget theme config works, Sankey R&D parse error fixed (Plan 01), securityLevel 'loose' preserved
- Remaining check before Phase 7: verify `renderAsync` availability in vendored 11.14.0 bundle (noted in STATE.md Blockers)

## Self-Check: PASSED

- FOUND: mermaid-tw5/plugins/mermaid-tw5/$__plugins_mermaid-tw5_wrapper.js (modified, injection at lines 181-183)
- FOUND: tests/wrapper.test.js (modified, 4 new injection tests)
- FOUND: commit 6b8bbb8 (feat: Task 1 injection block)
- FOUND: commit ea71426 (feat: Task 2 injection tests)
- VERIFIED: node --test shows 28 tests, 27 pass, 1 fail (pre-existing)
- VERIFIED: buildPerWidgetInit(options) called in render path
- VERIFIED: '%%{init: ' + JSON.stringify literal in wrapper.js
- VERIFIED: injection AFTER decodeHtmlEntities AND BEFORE var renderDiagram

---
*Phase: 06-config-wiring-foundation*
*Completed: 2026-06-08*
