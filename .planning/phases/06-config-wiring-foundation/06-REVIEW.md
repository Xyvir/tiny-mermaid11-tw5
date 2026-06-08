---
phase: 06-config-wiring-foundation
reviewed: 2026-06-08T00:00:00Z
depth: standard
files_reviewed: 6
files_reviewed_list:
  - mermaid-tw5/plugins/mermaid-tw5/$__plugins_mermaid-tw5_wrapper.js
  - mermaid-tw5/plugins/mermaid-tw5/$__plugins_mermaid-tw5_config.tid
  - mermaid-tw5/plugins/mermaid-tw5/plugin.info
  - mermaid-tw5/tiddlers/Sankey Diagram.tid
  - tests/helpers/tw-bootstrap.js
  - tests/wrapper.test.js
findings:
  critical: 0
  warning: 4
  info: 3
  total: 7
status: issues_found
---

# Phase 6: Code Review Report

**Reviewed:** 2026-06-08
**Depth:** standard
**Files Reviewed:** 6
**Status:** issues_found

## Summary

Phase 6 wires user-supplied Mermaid config through three mechanisms: a site-level `buildSiteConfig()` (reads the config tiddler, whitelist-filtered, fed to `mermaidAPI.initialize()` once per page), a per-widget `buildPerWidgetInit()` (injects a `%%{init}%%` directive built from a narrow non-secure key list), and a JSON config tiddler. The whitelist split between trusted site config and the non-secure per-widget inject list is well-considered, and the per-widget path correctly excludes `securityLevel`/`startOnLoad`. The added tests for the config-wiring behavior are meaningful and pass.

The implementation has no security regression: the per-widget inject list (`NON_SECURE_INJECT_KEYS`) excludes all secure keys, and the site-config whitelist only allows tightening `securityLevel` from the existing `'loose'` baseline (it does not widen exposure). However, there are several correctness and quality defects worth fixing, the most notable being a dead `SECURE_KEYS` array that reads as a security control but enforces nothing, and a test suite that ships with a failing test (pre-existing, but now masks regressions in the new code).

## Warnings

### WR-01: `SECURE_KEYS` is dead code that masquerades as a security control

**File:** `mermaid-tw5/plugins/mermaid-tw5/$__plugins_mermaid-tw5_wrapper.js:58-59`
**Issue:** `SECURE_KEYS` is declared but never referenced anywhere in the module (confirmed by grep — single occurrence at the declaration). It lists `secure`, `securityLevel`, `startOnLoad`, `maxTextSize`, `maxEdges`, `suppressErrorRendering` — exactly the keys a reader would expect to be *blocked*. But three of those (`securityLevel`, `maxTextSize`, `maxEdges`, `suppressErrorRendering`) are simultaneously present in `CONFIG_WHITELIST` (line 70) and therefore *allowed* through the site-config path. A future maintainer could reasonably assume `SECURE_KEYS` enforces a deny-list and build on a false premise, or "fix" the unused-variable lint by deleting the wrong thing. Dead security-adjacent code is a maintenance hazard.
**Fix:** Either remove the array entirely, or wire it into `buildSiteConfig()`/`buildPerWidgetInit()` as the actual deny-list it appears to be. If the intent is documentation only, convert it to a comment:
```js
// Keys intentionally NOT exposed to the per-widget %%{init}%% path:
// 'secure', 'securityLevel', 'startOnLoad', 'maxTextSize', 'maxEdges', 'suppressErrorRendering'
```

### WR-02: Test suite ships with a failing test, masking regression signal for the new code

**File:** `tests/wrapper.test.js:50-58`
**Issue:** `node --test tests/wrapper.test.js` reports 21 pass / 1 fail. The failing test is "displays a friendly error message for invalid syntax" (line 50): the assertion `html.indexOf('could not be rendered') !== -1` fails because in the test harness `rocklib.getScriptBody(this, 'text')` does not read `parseTreeNode.text`, so the source passed to `mermaidAPI.render()` is `undefined`, the mock never sees `INVALID_SYNTAX`, and an SVG (not an error block) is produced. I confirmed this failure also exists at the pre-phase parent commit, so it is **pre-existing, not a Phase 6 regression** — but Phase 6 adds substantial new behavior verified by this same suite, and a permanently-red suite trains reviewers to ignore failures and lets a real regression hide behind the known-bad test.
**Fix:** Make the harness `getScriptBody` mock (or `makeWidget`) supply the source the test intends (e.g., set the tiddler text / attribute that the real `getScriptBody` reads), so the error-path test exercises the code it claims to. Do not leave the suite red.

### WR-03: `buildPerWidgetInit` injects empty-object `themeVariables` into `%%{init}%%`

**File:** `mermaid-tw5/plugins/mermaid-tw5/$__plugins_mermaid-tw5_wrapper.js:94-103`
**Issue:** The guard `options[k] !== undefined && options[k] !== ''` is correct for string keys (`theme`, `fontFamily`, `fontSize`) but not for object-valued keys. `getOptions()` (widget-tools.js:90-96, 109-116) runs `JSON.parse` on attribute values, so a `themeVariables="{}"` attribute yields the object `{}`. `{} !== '' ` is `true`, so an empty `themeVariables: {}` gets injected, producing `%%{init: {"themeVariables":{}}}%%`. Similarly a numeric `fontSize` of `0` passes the guard and is injected, which would override the theme default with `0`. Neither is fatal but both produce a directive the author did not intend.
**Fix:** Skip empty objects/blank values explicitly, e.g.:
```js
var v = options[k];
if (v === undefined || v === '' || v === null) continue;
if (typeof v === 'object' && Object.keys(v).length === 0) continue;
init[k] = v;
```

### WR-04: Synchronous render errors no longer reach the user-facing error block

**File:** `mermaid-tw5/plugins/mermaid-tw5/$__plugins_mermaid-tw5_wrapper.js:186-241`
**Issue:** `renderDiagram()` only handles the result when it is a thenable (`if (result && typeof result.then === 'function')`). If `mermaidAPI.render()` returns synchronously (older Mermaid, or a non-promise error/string), the function silently does nothing — `_insertSVG` is never called and the "Loading diagram…" placeholder (line 143) or a stale `divNode` remains. The inner `try { renderDiagram(); } catch (ex) { throw ex; }` (lines 236-241) is a no-op pass-through that only catches *thrown* sync errors; a *returned* non-thenable value falls through with no output. Phase 6 did not introduce this branch but moved `initialize()` out of the per-render path, making the render flow the sole owner of output — so the gap is now more load-bearing.
**Fix:** Handle the non-thenable branch explicitly — render the SVG if `result.svg` exists, otherwise surface the error block — so every code path leaves a deterministic DOM result:
```js
if (result && typeof result.then === 'function') {
    /* promise path */
} else if (result && result.svg) {
    _insertSVG(result.svg, result.bindFunctions);
} else {
    // synchronous failure: show the error block instead of leaving the placeholder
}
```

## Info

### IN-01: `flowchart` default is silently dropped when config tiddler overrides it

**File:** `mermaid-tw5/plugins/mermaid-tw5/$__plugins_mermaid-tw5_wrapper.js:80-89`
**Issue:** The base config sets `flowchart: { useMaxWidth: true, htmlLabels: true }`, but the merge loop does a shallow replace (`config[k] = data[k]`, per the D-04 comment). The shipped config tiddler (`config.tid:11-14`) re-supplies the full `flowchart` block, so today it is fine. But if a user edits the tiddler to set only `flowchart: { curve: "linear" }`, they silently lose `useMaxWidth`/`htmlLabels` — a surprising footgun for a shallow-replace contract. This is consistent with the stated D-04 design, so flagged as Info, but worth a doc note in `config.tid`.
**Fix:** Document the shallow-replace behavior in the config tiddler, or deep-merge nested diagram-type objects onto the defaults.

### IN-02: Stale/misleading comment about the per-render `initialize()` removal

**File:** `mermaid-tw5/plugins/mermaid-tw5/$__plugins_mermaid-tw5_wrapper.js:154`
**Issue:** The comment `// mermaidAPI.initialize() removed from per-render path (was hardcoded lines)` describes a code-history fact, not current behavior. Such "diff narration" comments rot quickly and add noise.
**Fix:** Remove the comment; the `buildSiteConfig()` call site (line 147) with its `// D-05: once per page load` note is sufficient.

### IN-03: `getSimpleStack` magic constant and brittle frame parsing

**File:** `mermaid-tw5/plugins/mermaid-tw5/$__plugins_mermaid-tw5_wrapper.js:44`
**Issue:** `frames.length < 3` uses a bare magic number, and the regex/`split('/')` frame parsing assumes V8 stack formatting; on other engines it produces empty or garbled output. Not a Phase 6 change and only affects the error-details `<details>` block, so low priority.
**Fix:** Extract `3` to a named constant (e.g., `MAX_STACK_FRAMES`) and treat any non-V8 stack gracefully (already partially handled by returning `''`).

---

_Reviewed: 2026-06-08_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
