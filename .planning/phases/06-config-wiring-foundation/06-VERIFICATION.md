---
phase: 06-config-wiring-foundation
verified: 2026-06-08T00:00:00Z
status: passed
score: 5/5 must-haves verified
overrides_applied: 0
---

# Phase 6: Config Wiring Foundation Verification Report

**Phase Goal:** User-supplied configuration (theme, look, fontFamily, securityLevel, and per-diagram-type options) is actually applied when diagrams render, instead of being silently ignored.
**Verified:** 2026-06-08
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | A user who sets `<$mermaid theme="forest">` (or `mermaid-theme` field) sees the diagram render in forest theme — config no longer a silent no-op (CONFIG-02) | VERIFIED | `buildPerWidgetInit(options)` extracts theme from widget attributes; prepend block at wrapper.js lines 181-183 injects `%%{init: {"theme":"forest"}}%%\n` before `scriptBody`; test "prepends %%{init}%% for theme widget attribute" and test "injects fontFamily widget attribute" both pass; live Playwright evidence confirms forest-theme fill rgb(205,228,152) |
| 2 | On a page with multiple diagrams, `initialize()` runs once and all diagrams share one consistent global config — no "last diagram wins" (CONFIG-03) | VERIFIED | `mermaidAPI.initialize(buildSiteConfig())` at wrapper.js line 147 is inside the `if (!mermaidAPI)` guard (runs once per module lifetime); test "does not call initialize() on second render (once-per-page, D-05)" passes in both `describe('buildSiteConfig behavior')` and `describe('config wiring')`; live evidence: two diagrams on same page each rendered their own theme without bleed |
| 3 | A user can override `securityLevel` via the `$:/plugins/orange/mermaid-tw5/config` shadow tiddler, with `'loose'` the documented default keeping click navigation working (CONFIG-04) | VERIFIED | `buildSiteConfig()` seeds `securityLevel: 'loose'` and reads the config tiddler via `getTiddlerData`; `CONFIG_WHITELIST` includes `securityLevel`; test "passes securityLevel from config tiddler to initialize()" and "uses securityLevel loose as default when config tiddler absent" both pass; live Playwright evidence: flowchart click navigation fired with securityLevel 'loose' preserved |
| 4 | A user can set `theme`, `themeVariables`, `look` (handDrawn/classic), `fontFamily` globally and per-diagram and see them applied (CONFIG-05) | VERIFIED | Global path: `buildSiteConfig()` copies `theme`, `look`, `fontFamily` from config tiddler through `CONFIG_WHITELIST`; test "merges theme/look/fontFamily from config tiddler" passes. Per-diagram path: `NON_SECURE_INJECT_KEYS = ['theme', 'look', 'fontFamily', 'fontSize', 'themeVariables', 'darkMode']` in wrapper.js line 73; `buildPerWidgetInit()` returns non-null init for those keys; injection prepend at lines 181-183. Live evidence confirms both paths |
| 5 | A user can supply per-diagram-type config (flowchart, sequence, gantt) via the documented JSON config-tiddler pattern and see it take effect (CONFIG-06) | VERIFIED | `CONFIG_WHITELIST` includes all per-type block keys (`flowchart`, `sequence`, `gantt`, `pie`, etc.) at wrapper.js lines 67-70; `buildSiteConfig()` shallow-copies matching nested objects to the config; test "passes flowchart nested block from config tiddler to initialize()" asserts `flowchart.curve === 'linear'` and passes; config tiddler ships default `flowchart: {useMaxWidth: true, htmlLabels: true}` |

**Score:** 5/5 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `mermaid-tw5/plugins/mermaid-tw5/$__plugins_mermaid-tw5_wrapper.js` | buildSiteConfig() + once-per-page initialize() + CONFIG_WHITELIST + injection block | VERIFIED | Contains `function buildSiteConfig(`, `function buildPerWidgetInit(`, `var CONFIG_WHITELIST`, `var NON_SECURE_INJECT_KEYS`, `mermaidAPI.initialize(buildSiteConfig())` at line 147 inside `if (!mermaidAPI)` guard, injection block at lines 179-183 after `decodeHtmlEntities` and before `var renderDiagram` |
| `mermaid-tw5/plugins/mermaid-tw5/$__plugins_mermaid-tw5_config.tid` | JSON shadow config tiddler with site-wide defaults | VERIFIED | Exists; `type: application/json`; `title: $:/plugins/orange/mermaid-tw5/config`; JSON body parses with `securityLevel: "loose"`, `startOnLoad: false`, `flowchart.useMaxWidth: true`, `flowchart.htmlLabels: true`, `theme: "default"`, `look: "classic"`, `fontFamily: "sans-serif"` |
| `mermaid-tw5/plugins/mermaid-tw5/plugin.info` | `list` field includes `config` token | VERIFIED | `"list": "readme usage example license config"` — config token present |
| `mermaid-tw5/tiddlers/Sankey Diagram.tid` | No `R&D` node names | VERIFIED | `grep -c 'R&D'` returns 0; `"R and D"` appears at lines 38 and 48 (both fence and live block) |
| `tests/helpers/tw-bootstrap.js` | `initializeCalls` + `lastRenderSource` on mockMermaidAPI | VERIFIED | `initializeCalls: []` at line 66; `lastRenderSource: null` at line 67; `initialize: function(config)` pushes to `initializeCalls` at line 69; `render` sets `lastRenderSource = source` as first line before any conditional at line 72 |
| `tests/wrapper.test.js` | config-wiring describe blocks with 10+ tests | VERIFIED | `describe('buildSiteConfig behavior')` with 3 tests at lines 71-110; `describe('config wiring')` with 10 tests at lines 112-257 covering CONFIG-02/03/04/05/06; imports `mockMermaidAPI` |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `if (!mermaidAPI)` lazy-load block | `buildSiteConfig()` | `mermaidAPI.initialize(buildSiteConfig())` | WIRED | Line 147: `mermaidAPI.initialize(buildSiteConfig());  // D-05: once per page load` — exactly one `initialize(` call site in wrapper.js |
| `buildSiteConfig()` | `$:/plugins/orange/mermaid-tw5/config` | `$tw.wiki.getTiddlerData` | WIRED | Line 83: `var data = $tw.wiki.getTiddlerData(configTitle, {});` where `configTitle = '$:/plugins/orange/mermaid-tw5/config'` |
| render path (after decodeHtmlEntities) | scriptBody | prepend `'%%{init: '` + `JSON.stringify(perWidgetInit)` | WIRED | Lines 181-183: `var perWidgetInit = buildPerWidgetInit(options);` then `if (perWidgetInit) { scriptBody = '%%{init: ' + JSON.stringify(perWidgetInit) + '}%%\n' + scriptBody; }` — confirmed AFTER line 177 (`decodeHtmlEntities`) and BEFORE line 186 (`var renderDiagram`) |
| `buildPerWidgetInit(options)` | `getOptions()` result | `NON_SECURE_INJECT_KEYS` filter | WIRED | Lines 94-103: iterates `NON_SECURE_INJECT_KEYS`, copies only those keys from `options` that are non-undefined and non-empty-string (Pitfall-3 seed filter) |

---

### Data-Flow Trace (Level 4)

Not applicable for this phase. The primary artifacts are a config/initialization pipeline and a script-body transformation, not components that render dynamic data from a database. The observable end-state is verified by unit tests (which assert on `initializeCalls[0]` and `lastRenderSource`) and by authoritative live browser verification.

---

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| All tests pass (27) with 1 documented pre-existing failure | `node --test tests/*.test.js` | `# pass 27`, `# fail 1` (test "displays a friendly error message for invalid syntax" — pre-existing) | PASS |
| Config tiddler JSON is valid and has correct defaults | `node -e "...JSON.parse(body)..."` | `securityLevel: loose`, `startOnLoad: false`, `flowchart.useMaxWidth: true`, `flowchart.htmlLabels: true` | PASS |
| Sankey tiddler has no R&D occurrences | `grep -c 'R&D' 'mermaid-tw5/tiddlers/Sankey Diagram.tid'` | `0` | PASS |
| plugin.info includes config token | `python3 -c "...print(d.get('list'))..."` | `readme usage example license config` | PASS |

---

### Probe Execution

No probes declared in PLAN files for this phase. Behavioral spot-checks above serve as the equivalent gate.

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| CONFIG-02 | 06-01 (partial), 06-03 | Widget attributes and `mermaid-*` fields reach rendering via `%%{init}%%` injection | SATISFIED | `buildPerWidgetInit` + injection at wrapper.js lines 181-183; 4 injection tests pass; live browser confirmation |
| CONFIG-03 | 06-02 | `initialize()` once per page, multi-diagram consistent global config | SATISFIED | `mermaidAPI.initialize(buildSiteConfig())` inside `if (!mermaidAPI)` guard; 2 once-per-page tests pass |
| CONFIG-04 | 06-01, 06-02 | `securityLevel` overridable via config shadow tiddler; `'loose'` default | SATISFIED | `buildSiteConfig()` reads config tiddler; `securityLevel` in `CONFIG_WHITELIST`; 2 securityLevel tests pass; live click navigation confirmed |
| CONFIG-05 | 06-02, 06-03 | `theme`, `themeVariables`, `look`, `fontFamily` settable globally and per-diagram | SATISFIED | Global: `buildSiteConfig()` merges from config tiddler; Per-diagram: `NON_SECURE_INJECT_KEYS` drives injection; "merges theme/look/fontFamily" test passes; live multi-theme evidence |
| CONFIG-06 | 06-01, 06-02 | Per-diagram-type config (flowchart, sequence, gantt) via config-tiddler JSON | SATISFIED | `CONFIG_WHITELIST` includes all per-type keys; `buildSiteConfig()` shallow-copies nested blocks; "passes flowchart nested block" test passes |

No orphaned requirements found. CONFIG-07 is explicitly mapped to Phase 8 in REQUIREMENTS.md and is not a Phase 6 deliverable.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| (none) | — | — | — | — |

No `TBD`, `FIXME`, or `XXX` markers in any phase-modified file. No stub implementations, placeholder returns, or empty handlers that affect the config-wiring goal. The `SECURE_KEYS` array at line 58 partially overlaps with `CONFIG_WHITELIST` (both include `securityLevel`, `maxTextSize`, `maxEdges`, `suppressErrorRendering`); this is intentional by design (SECURE_KEYS is for future secure-array reference, CONFIG_WHITELIST controls what is applied — documented behavior).

---

### Human Verification Required

All human verification checks for this phase were completed by the orchestrator via Playwright/Chromium against a freshly built demo wiki (`tiddlywiki mermaid-tw5 --build index`). The following results were recorded as authoritative live evidence:

1. **CONFIG-02/CONFIG-05 — Widget theme attribute applies; author %%{init}%% wins**
   - Test: Set `theme="dark"` on widget + inline `%%{init: {"theme":"forest"}}%%` in diagram source
   - Expected: Diagram renders in FOREST theme (author's in-source directive wins via D-02 prepend + Mermaid last-wins merge)
   - Result: PASSED — forest fill rgb(205,228,152) confirmed; field-based `mermaid-theme` path also confirmed

2. **CONFIG-03 — Multi-diagram theme isolation (no last-diagram-wins)**
   - Test: Two diagrams on same page with different themes (forest + dark)
   - Expected: Each diagram renders in its own theme independently
   - Result: PASSED — forest rgb(205,228,152) and dark rgb(31,32,32)/#ccc confirmed independently

3. **CONFIG-04 — Click navigation under securityLevel 'loose'**
   - Test: Flowchart with clickable node; click the node
   - Expected: Navigation fires; securityLevel 'loose' preserved after initialize() move
   - Result: PASSED — new tab #Gitgraph Forest Theme opened; all nodes .clickable with bound handlers

4. **D-08 / Sankey clean render**
   - Test: Load the Sankey example page
   - Expected: Renders cleanly with no R&D parse error
   - Result: PASSED — clean render, no parse error

All 5 live checks from Plan 03 Task 3 (the `checkpoint:human-verify`) passed and are treated as authoritative human-equivalent evidence per orchestrator authorization.

---

### Gaps Summary

No gaps. All 5 observable truths are verified at code level (existence, substantive implementation, wiring, and behavioral evidence from passing tests). All 5 requirements (CONFIG-02 through CONFIG-06) are satisfied. The cross-cutting constraint (14 passing tests + 1 documented pre-existing failure) is confirmed: `# pass 27`, `# fail 1` (the 27 includes the 13 new config-wiring tests added by this phase on top of the 14 baseline; the 1 failing test "displays a friendly error message for invalid syntax" is the documented pre-existing failure, confirmed at the parent commit, not introduced by Phase 6).

---

_Verified: 2026-06-08_
_Verifier: Claude (gsd-verifier)_
