---
phase: 06-config-wiring-foundation
plan: 02
subsystem: config, testing
tags: [mermaid, tiddlywiki, config-wiring, buildSiteConfig, initialize-once, tdd]

# Dependency graph
requires:
  - phase: 06-01
    provides: mockMermaidAPI.initializeCalls tracking, JSON shadow config tiddler
provides:
  - buildSiteConfig() reads config tiddler and returns whitelisted merged config
  - CONFIG_WHITELIST gates all keys from config tiddler before they reach initialize()
  - mermaidAPI.initialize() called once per page (inside lazy-load block)
  - buildPerWidgetInit() extracts NON_SECURE_INJECT_KEYS for %%{init}%% injection
  - D-02 %%{init}%% prepend injection for per-widget non-secure config
  - 9 new passing tests: once-per-page, securityLevel override/default, theme/look/fontFamily, flowchart
affects:
  - 06-03-PLAN.md (%%{init}%% injection behavioral tests)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "CONFIG_WHITELIST gating: all keys from config tiddler checked against whitelist before reaching initialize()"
    - "Once-per-page initialize: mermaidAPI.initialize(buildSiteConfig()) inside if(!mermaidAPI) lazy-load block"
    - "D-07 startOnLoad guard: continue past startOnLoad in whitelist loop so it can never be overridden"
    - "D-04 shallow replace: config[k] = data[k] for whitelisted keys (nested objects replaced wholesale)"
    - "D-02 %%{init}%% prepend: buildPerWidgetInit() + JSON.stringify for per-widget non-secure keys"

key-files:
  created: []
  modified:
    - mermaid-tw5/plugins/mermaid-tw5/$__plugins_mermaid-tw5_wrapper.js
    - tests/wrapper.test.js

key-decisions:
  - "O-01 adopted: CONFIG_WHITELIST gates every key from config tiddler; unknown keys dropped silently (consistent with getOptions() swallow-errors behavior)"
  - "D-04 shallow replace confirmed: nested objects (flowchart, themeVariables) replaced wholesale, no deep merge"
  - "D-07 enforced: startOnLoad cannot be overridden even if present in config tiddler JSON"
  - "buildSiteConfig behavior describe added alongside config wiring describe for TDD clarity"

# Metrics
duration: 25min
completed: 2026-06-07
---

# Phase 06 Plan 02: Config Wiring Foundation — Implementation Summary

**buildSiteConfig() + CONFIG_WHITELIST + once-per-page initialize() + %%{init}%% injection wired into wrapper.js; 9 new config-wiring tests prove once-per-page behavior and config tiddler merge (securityLevel, theme/look/fontFamily, flowchart nested block)**

## Performance

- **Duration:** ~25 min
- **Completed:** 2026-06-07
- **Tasks:** 2 / 2
- **Files modified:** 2

## Accomplishments

- Added `SECURE_KEYS`, `CONFIG_WHITELIST`, `NON_SECURE_INJECT_KEYS` arrays inside the IIFE scope so `$tw` is accessible as closure variable (Pitfall 4)
- Added `buildSiteConfig()`: reads `$:/plugins/orange/mermaid-tw5/config` via `getTiddlerData`, whitelists keys via `CONFIG_WHITELIST`, hardcodes `startOnLoad: false` (D-07 guard via `continue`), seeds defaults `{securityLevel:'loose', flowchart:{useMaxWidth:true,htmlLabels:true}}`
- Added `buildPerWidgetInit()`: extracts `NON_SECURE_INJECT_KEYS` from per-widget `options` for `%%{init}%%` injection (Plan 03 consumer)
- Moved `mermaidAPI.initialize(buildSiteConfig())` into `if (!mermaidAPI)` lazy-load block — runs exactly once per page (CONFIG-03, D-05)
- Removed per-render hardcoded `mermaidAPI.initialize({startOnLoad, flowchart, securityLevel})` call
- Added D-02 `%%{init}%%` prepend injection: `buildPerWidgetInit(options)` result prepended to `scriptBody` before `mermaidAPI.render()`
- Added `renderAsync` comment: documents that the vendored 11.14.0 bundle has 0 occurrences; guard kept as forward-compat safety net
- Added `describe('buildSiteConfig behavior')` (RED TDD gate) + `describe('config wiring')` (6 tests, GREEN): prove CONFIG-03/04/05/06 requirements

## Task Commits

Each task was committed atomically:

1. **Task 1 RED: Failing tests for buildSiteConfig + once-per-page initialize** - `e668054` (test)
2. **Task 1 GREEN: wrapper.js implementation** - `6b8bbb8` (feat)
3. **Task 2: Config-wiring tests** - `13a7264` (feat)

## Files Created/Modified

- `mermaid-tw5/plugins/mermaid-tw5/$__plugins_mermaid-tw5_wrapper.js` — Added SECURE_KEYS/CONFIG_WHITELIST/NON_SECURE_INJECT_KEYS; buildSiteConfig(); buildPerWidgetInit(); moved initialize() to lazy-load block; removed per-render initialize(); added %%{init}%% injection; added renderAsync comment
- `tests/wrapper.test.js` — Added mockMermaidAPI import; describe('buildSiteConfig behavior') with 3 tests; describe('config wiring') with 6 tests (23 total pass, 1 pre-existing fail)

## Decisions Made

- O-01 adopted: CONFIG_WHITELIST gates every key read from config tiddler before it reaches initialize(); unknown keys dropped silently (consistent with getOptions() swallow-errors behavior per PATTERNS.md)
- D-04 shallow replace: `config[k] = data[k]` for whitelisted nested objects; no deep merge
- D-07 startOnLoad guard: `if (k === 'startOnLoad') continue;` in whitelist loop — hardcoded false always wins
- Both `describe('buildSiteConfig behavior')` and `describe('config wiring')` coexist in test file for clarity; `buildSiteConfig behavior` was the TDD RED gate, `config wiring` is the canonical Task 2 block

## Deviations from Plan

### Minor Additions

**1. [Rule 2 - Missing functionality] Added describe('buildSiteConfig behavior') for TDD RED gate**
- **Found during:** Task 1 RED phase
- **Issue:** TDD required failing tests before implementation; plan structured these as Task 2 but RED gate needed to fail before Task 1's GREEN implementation
- **Fix:** Added a minimal `describe('buildSiteConfig behavior')` with 3 tests as the RED commit; then Task 2 added the full `describe('config wiring')` with all 6 canonical tests
- **Effect:** 9 new tests instead of 6; all pass; no pre-existing test affected

None beyond the above RED/GREEN split — plan executed as specified.

## Issues Encountered

None. All tests pass as specified.

## Known Stubs

None. All new code paths are wired and tested.

## Threat Surface Scan

No new network endpoints, auth paths, file access patterns, or schema changes introduced. `buildSiteConfig()` reads a plugin shadow tiddler (same trust boundary as the existing plugin code). T-06-03 (CONFIG_WHITELIST gating) and T-06-04 (startOnLoad guard) mitigations are implemented and verified by tests.

## Next Phase Readiness

- Plan 03 (`%%{init}%%` injection behavioral tests) can proceed: `buildPerWidgetInit()` is implemented in wrapper.js and `mockMermaidAPI.lastRenderSource` is tracked in tw-bootstrap.js from Plan 01
- CONFIG-03, CONFIG-04, CONFIG-05 (global), CONFIG-06 requirements satisfied
- 23 tests pass; 1 pre-existing fail (D-09 gate)

## Self-Check: PASSED

- FOUND: mermaid-tw5/plugins/mermaid-tw5/$__plugins_mermaid-tw5_wrapper.js (modified)
- FOUND: tests/wrapper.test.js (modified)
- FOUND: commit e668054 (test: RED phase)
- FOUND: commit 6b8bbb8 (feat: GREEN phase wrapper.js)
- FOUND: commit 13a7264 (feat: config-wiring tests)
- VERIFIED: function buildSiteConfig( in wrapper.js
- VERIFIED: function buildPerWidgetInit( in wrapper.js
- VERIFIED: var CONFIG_WHITELIST in wrapper.js
- VERIFIED: mermaidAPI.initialize(buildSiteConfig()) in wrapper.js
- VERIFIED: no mermaidAPI.initialize({ per-render call in wrapper.js
- VERIFIED: renderAsync comment in wrapper.js
- VERIFIED: describe('config wiring') in tests/wrapper.test.js
- VERIFIED: 23 pass, 1 fail (pre-existing)

---
*Phase: 06-config-wiring-foundation*
*Completed: 2026-06-07*
