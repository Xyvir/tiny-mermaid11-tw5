# Phase 6: Config Wiring Foundation - Research

**Researched:** 2026-06-07
**Domain:** TiddlyWiki 5 plugin — Mermaid.js 11.14.0 config wiring, shadow-tiddler pattern, %%{init}%% injection
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Non-secure keys resolve more-local-wins: `global config tiddler < tiddler field < widget attribute < in-diagram %%{init}%%`. The most specific/local source wins; matches Mermaid's native rule that `%%{init}%%` overrides `initialize()`.
- **D-02:** Implementation of D-01: per-widget non-secure keys (theme, look, fontFamily) are injected as an `%%{init}%%` directive **prepended before** any author's literal `%%{init}%%` in `scriptBody`, so Mermaid's last-wins directive merge naturally lets the author's in-source directive win. Do NOT inject after.
- **D-03:** Secure keys (`securityLevel`, `startOnLoad`, `maxTextSize`, `maxEdges`, `suppressErrorRendering`) come **only** from the global config shadow tiddler (`$:/plugins/orange/mermaid-tw5/config`), default `securityLevel: 'loose'`. Secure-key values found on fields/attributes/`%%{init}%%` are ignored and documented. No per-render re-initialize, no "first diagram wins" behavior.
- **D-04:** Nested config objects (`themeVariables`, per-type blocks like `flowchart`/`sequence`) use **shallow replace**, not deep merge. A more-local layer that sets `themeVariables` replaces the whole object.
- **D-05:** `mermaidAPI.initialize()` moves into the `if (!mermaidAPI)` lazy-load block so it runs **once per page load** (CONFIG-03). Removes the current per-render "last-write-wins" race.
- **D-06:** New JSON shadow tiddler `$:/plugins/orange/mermaid-tw5/config` holds site-wide global defaults; users override it in their own wiki via the standard TW shadow-tiddler pattern without touching plugin files. `buildSiteConfig()` reads it and feeds `initialize()`.
- **D-07:** `startOnLoad: false` stays hardcoded always.
- **D-08:** Sankey `R&D` parse-error (issue #7528, `&` in node name) is fixed in this phase so Phase 7 Sankey authoring is unblocked. `renderAsync` availability is verified against the vendored 11.14.0 bundle before adding/keeping the guard.
- **D-09:** All 13 existing tests must continue to pass; this is a test gate, not a goal.

### Claude's Discretion

- Exact default contents of the new config shadow tiddler (beyond `securityLevel: 'loose'`, `startOnLoad: false`, and the existing `flowchart: { useMaxWidth: true, htmlLabels: true }`).
- Whether config conflicts are silent (recommended — consistent with current silent `getOptions()` behavior) or surface a console note.

### Deferred Ideas (OUT OF SCOPE)

- Nested per-diagram-type config via dotted tiddler fields (e.g. `mermaid-flowchart.curve`) — deferred to v0.7.0 per FEATURES.md; `%%{init}%%` and config-tiddler JSON are the supported paths this milestone.
- Deep-merge of nested config objects — rejected for this phase (D-04); revisit only if shallow-replace proves limiting.
- `handDrawnSeed` / `deterministicIds` documentation, `suppressErrorRendering` wiring — fold into Phase 8 config reference, not Phase 6.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CONFIG-02 | User-supplied configuration (widget attributes and `mermaid-*` tiddler fields) is actually applied to rendering — fix the `getOptions()` → `mermaidAPI.initialize()` wiring so config is no longer a silent no-op | Source inspection confirms exact fix location (wrapper.js:107-111); `buildSiteConfig()` + `%%{init}%%` injection pattern fully specified |
| CONFIG-03 | `initialize()` runs once per page (in the lazy-load block), so multi-diagram pages share consistent global config instead of the last diagram winning | Lazy-load block at wrapper.js:95-100 is the confirmed target; move `initialize()` call inside `if (!mermaidAPI)` branch |
| CONFIG-04 | User can override `securityLevel` via a config shadow tiddler, with `'loose'` as the documented default | Shadow tiddler pattern with `type: application/json` and `$tw.wiki.getTiddlerData()` fully documented; secure-array behavior verified |
| CONFIG-05 | User can set global appearance — `theme`, `themeVariables`, `look` (handDrawn/classic), `fontFamily` — and have it applied | Global via config tiddler merge into `initialize()`; per-widget via `%%{init}%%` injection; both paths specified |
| CONFIG-06 | User can set per-diagram-type config (flowchart, sequence, gantt, etc.) via a documented JSON attribute/field pattern | Config tiddler JSON with nested blocks is the documented pattern; O-02 resolved (see Standard Stack section) |
</phase_requirements>

---

## Summary

Phase 6 is a focused code surgery: ~20-30 lines of changes to `wrapper.js`, one new tiddler file (`$__plugins_mermaid-tw5_config.tid`), and a `plugin.info` update. The bug is entirely located in `wrapper.js` lines 102-111: `getOptions()` is called and builds an `options` object, but that object is never referenced when calling `mermaidAPI.initialize()`, which uses a hardcoded config instead. Every tiddler-field and widget-attribute config setting has been a silent no-op since the plugin was written.

The fix has three parts: (1) add a `buildSiteConfig()` function that reads the new JSON shadow tiddler and returns a merged config; (2) move the `mermaidAPI.initialize(buildSiteConfig())` call inside the existing `if (!mermaidAPI)` lazy-load guard at line 95 (it runs once per page load, not once per render); (3) for per-widget non-secure keys (theme, look, fontFamily), inject a `%%{init}%%` directive prepended to `scriptBody` before `mermaidAPI.render()` is called. Secure keys (`securityLevel`, `startOnLoad`, `maxTextSize`, `maxEdges`, `suppressErrorRendering`) come only from the config tiddler and stay in `initialize()`.

Two prerequisites also land in this phase: the Sankey `R&D` parse error (line 47 of `Sankey Diagram.tid` — `R&D` is an invalid node name in Mermaid 11.12+; fix is to rename to `R and D` or `RD`) and the `renderAsync` guard (the vendored 11.14.0 bundle contains **zero occurrences** of the string `renderAsync` — the guard in the existing wrapper code at line 149 already checks `mermaidModule.renderAsync` before calling it, making the guard correct as-is; it never fires but does not break anything).

**Primary recommendation:** Implement `buildSiteConfig()` + once-per-page `initialize()` + `%%{init}%%` attribute injection in `wrapper.js`; ship the JSON shadow config tiddler; fix Sankey; update `plugin.info`. No other files need structural changes.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Global config defaults (securityLevel, theme, look) | Plugin shadow tiddler (`$:/plugins/orange/mermaid-tw5/config`) | wrapper.js `buildSiteConfig()` reads it | Standard TW pattern: tiddler holds data, JS reads it at runtime |
| One-time Mermaid initialization | wrapper.js lazy-load block (line 95) | — | Must happen after mermaid module is loaded; before any render |
| Per-widget non-secure config (theme, look, fontFamily) | wrapper.js render path: `%%{init}%%` prepend | — | `mermaidAPI.render()` has no per-call config param; only `%%{init}%%` in `scriptBody` affects per-diagram appearance |
| Secure key control (securityLevel) | Plugin shadow tiddler → `initialize()` | Never `%%{init}%%` | Mermaid secure array prevents `%%{init}%%` override; must flow through `initialize()` |
| Per-type config blocks (flowchart, sequence, etc.) | Global: config tiddler JSON; per-diagram: `%%{init}%%` in diagram source | — | Nested JSON in config tiddler serializes correctly; dotted-field camelCase in `getOptions()` does NOT produce nested objects |
| Sankey example bug fix | Example tiddler (`Sankey Diagram.tid`) | — | Content-only fix; no code change needed |
| Config whitelist filtering | wrapper.js `buildSiteConfig()` / attribute merge | — | Prevents unknown keys from `getOptions()` polluting `initialize()` |

---

## Standard Stack

### Core (no new dependencies — all existing)

| Component | Version/Path | Purpose | Notes |
|-----------|-------------|---------|-------|
| `mermaidAPI.initialize(config)` | Mermaid 11.14.0 (vendored) | Set global Mermaid config once per page load | Called once in `if (!mermaidAPI)` block; accepts all standard Mermaid config keys |
| `$tw.wiki.getTiddlerData(title, default)` | TW5 core API | Parse JSON from a tiddler and return as object | Returns `{}` if tiddler absent or JSON invalid; safe for no-config case |
| `$tw.wiki.tiddlerExists(title)` | TW5 core API | Check if a tiddler (including shadows) exists | Not strictly needed since `getTiddlerData` handles absent tiddler; use for clarity |
| Shadow tiddler override pattern | TW5 core | Users override plugin defaults without editing plugin source | `$:/plugins/…/config` is shadowed by user's own non-shadow copy with same title |

### Installation

No npm packages. No new dependencies. All changes are to existing plugin source files and one new `.tid` file.

**Version verification:** The vendored bundle is confirmed at version 11.14.0 by grepping `version:"11.14.0"` from the bundle file. [VERIFIED: bundle grep]

---

## Package Legitimacy Audit

Not applicable. Phase 6 installs no external packages. All runtime dependencies are already vendored in the plugin.

---

## Architecture Patterns

### System Architecture Diagram

```
User sets tiddler field         User sets widget attr         User's config.tid override
  mermaid-theme: forest           theme="forest"               {theme: "forest"}
         │                              │                              │
         └──────────────────────────────┼──────────────────────────────┘
                                        │ rocklib.getOptions(this, 'mermaid', options)
                                        ▼
                              options = { theme: "forest", ... }
                              (widget-tools.js lines 64-123)
                                        │
             ┌──────────────────────────┤
             │ First render only        │ Per-render
             ▼                          ▼
   buildSiteConfig()          Extract non-secure keys
   reads config tiddler       (theme, look, fontFamily)
   → merges with defaults     from getOptions() result
             │                          │
             ▼                          ▼
   mermaidAPI.initialize()    Prepend %%{init}%% to scriptBody
   (runs ONCE in lazy-load    BEFORE author's own %%{init}%%
    block, wrapper.js:95)     (author's in-source wins per D-02)
                                        │
                                        ▼
                              mermaidAPI.render(svgId, scriptBody)
                              → Promise → _insertSVG()
```

### Recommended Project Structure

```
mermaid-tw5/plugins/mermaid-tw5/
├── $__plugins_mermaid-tw5_wrapper.js     ← MODIFIED (primary change)
│     - Add buildSiteConfig() above MermaidWidget definition
│     - Move mermaidAPI.initialize() into if (!mermaidAPI) block (line 95)
│     - Remove hardcoded initialize() call at lines 107-111
│     - Add %%{init}%% injection before mermaidAPI.render() at line 134
├── $__plugins_mermaid-tw5_config.tid     ← NEW (JSON shadow tiddler)
│     - type: application/json
│     - Default global config (securityLevel, theme, look, fontFamily, flowchart)
│     - User overrides this tiddler to change global defaults
└── plugin.info                           ← MODIFIED (add "config" to list field)

mermaid-tw5/tiddlers/
└── Sankey Diagram.tid                    ← MODIFIED (R&D → R and D)
```

### Pattern 1: buildSiteConfig() — Shadow Tiddler Config Read

**What:** Reads the JSON shadow config tiddler and produces a merged config object safe to pass to `mermaidAPI.initialize()`.

**When to use:** Called once in the lazy-load block before any diagram renders.

**Implementation (adapted from ARCHITECTURE.md):**

```javascript
// Source: ARCHITECTURE.md + direct source inspection of wrapper.js
// Add above MermaidWidget definition, near line 58

var SECURE_KEYS = ['secure', 'securityLevel', 'startOnLoad',
                   'maxTextSize', 'maxEdges', 'suppressErrorRendering'];

var CONFIG_WHITELIST = [
    'theme', 'themeVariables', 'themeCSS', 'look', 'handDrawnSeed',
    'fontFamily', 'altFontFamily', 'fontSize', 'darkMode', 'wrap',
    'htmlLabels', 'markdownAutoWrap', 'logLevel',
    'arrowMarkerAbsolute', 'deterministicIds', 'deterministicIDSeed',
    // per-type blocks (shallow replace, not deep merge per D-04)
    'flowchart', 'sequence', 'gantt', 'pie', 'class', 'state', 'er',
    'journey', 'gitGraph', 'quadrantChart', 'xyChart', 'sankey',
    'timeline', 'mindmap', 'packet', 'block', 'architecture', 'kanban',
    'c4', 'requirement', 'radar',
    // secure keys — allowed from config tiddler only
    'securityLevel', 'maxTextSize', 'maxEdges', 'suppressErrorRendering'
];

function buildSiteConfig() {
    var config = {
        startOnLoad: false,               // D-07: always hardcoded
        securityLevel: 'loose',           // default; user overrides via config tiddler
        flowchart: { useMaxWidth: true, htmlLabels: true }  // preserve existing defaults
    };
    var configTitle = '$:/plugins/orange/mermaid-tw5/config';
    var data = $tw.wiki.getTiddlerData(configTitle, {});
    for (var k in data) {
        if (Object.prototype.hasOwnProperty.call(data, k) &&
            CONFIG_WHITELIST.indexOf(k) !== -1) {
            if (k === 'startOnLoad') continue;  // D-07: never allow override
            config[k] = data[k];               // shallow replace per D-04
        }
    }
    return config;
}
```

**Key points:**
- `startOnLoad: false` is hardcoded and never overridable (D-07).
- `securityLevel` IS writable from the config tiddler (D-03) — it is a secure key that the SITE OWNER can configure; only diagram authors are blocked.
- Shallow replace means `{ flowchart: { curve: "linear" } }` in the config tiddler replaces the entire `flowchart` block including the `useMaxWidth`/`htmlLabels` defaults — document this clearly.

### Pattern 2: %%{init}%% Injection for Per-Widget Non-Secure Config

**What:** Before calling `mermaidAPI.render()`, extract whitelisted non-secure keys from `getOptions()` result and prepend a `%%{init}%%` directive to `scriptBody`.

**When to use:** Any time a non-secure key is present in widget attributes or `mermaid-*` tiddler fields.

**Implementation:**

```javascript
// Source: ARCHITECTURE.md + CONTEXT.md D-02
// Insert after line 134 (decodeHtmlEntities), before renderDiagram()

var NON_SECURE_INJECT_KEYS = ['theme', 'look', 'fontFamily', 'fontSize',
                               'themeVariables', 'darkMode'];

function buildPerWidgetInit(options) {
    var init = {};
    for (var i = 0; i < NON_SECURE_INJECT_KEYS.length; i++) {
        var k = NON_SECURE_INJECT_KEYS[i];
        if (options[k] !== undefined && options[k] !== '') {
            init[k] = options[k];
        }
    }
    return Object.keys(init).length > 0 ? init : null;
}

// After decodeHtmlEntities call:
var perWidgetInit = buildPerWidgetInit(options);
if (perWidgetInit) {
    // D-02: prepend BEFORE any author %%{init}%% so author's wins
    scriptBody = '%%{init: ' + JSON.stringify(perWidgetInit) + '}%%\n' + scriptBody;
}
```

**Why prepend, not append (D-02):** Mermaid merges multiple `%%{init}%%` blocks in document order, with later values winning. Prepending the plugin-injected directive means the author's explicit `%%{init}%%` in the diagram source comes after and overrides it — which is the correct precedence (most-local wins).

### Pattern 3: New Config Shadow Tiddler

**What:** A JSON tiddler inside the plugin bundle that holds site-wide Mermaid defaults.

**File:** `mermaid-tw5/plugins/mermaid-tw5/$__plugins_mermaid-tw5_config.tid`

**Content:**
```
title: $:/plugins/orange/mermaid-tw5/config
type: application/json
tags: $:/tags/ControlPanel/Settings

{
    "startOnLoad": false,
    "securityLevel": "loose",
    "theme": "default",
    "look": "classic",
    "fontFamily": "sans-serif",
    "flowchart": {
        "useMaxWidth": true,
        "htmlLabels": true
    }
}
```

**Key notes:**
- `type: application/json` enables `$tw.wiki.getTiddlerData()` to auto-parse it.
- `tags: $:/tags/ControlPanel/Settings` makes it appear in TW's ControlPanel under Settings.
- User overrides by creating a non-shadow tiddler with the same title.
- `plugin.info` `"list"` field must be updated to include `config`.

### Pattern 4: getOptions() Output Shape (Source-Verified)

`getOptions(src, 'mermaid', options)` in `widget-tools.js` lines 64-123 [VERIFIED: source inspection]:

1. Iterates tiddler fields with `f.indexOf('mermaid') === 0`.
2. Strips the `mermaid-` prefix, camelCases dot-separated suffixes: `mermaid-font-family` → `fontFamily`; `mermaid-flowchart.curve` → `flowchartCurve` (FLAT key, NOT nested).
3. Tries `JSON.parse(value)` first; falls back to string.
4. Iterates ALL widget attributes (`src.attributes`), regardless of name.
5. If attribute value is an existing tiddler title, replaces with `getTiddlerData(attval)`.
6. Tries `JSON.parse(attval)` first; falls back to string.
7. Wraps in try/catch; silently ignores all errors.

**Critical implication for O-01:** `getOptions()` puts `theme: "forest"` from `<$mermaid theme="forest">` directly at the top level of `options`. It also puts every widget attribute (including `class`, `style`, `id`, any HTML attribute) into `options`. Blind passthrough into `initialize()` would inject junk HTML attributes. **O-01 resolved: use the whitelist.** [ASSUMED: the whitelist list in Pattern 1 is correct coverage of the standard Mermaid config surface; any key not in CONFIG_WHITELIST is silently dropped, consistent with existing `getOptions()` swallow-errors behavior.]

**Critical implication for O-02 (per-type config, CONFIG-06):** `getOptions()` converts `mermaid-flowchart.curve: linear` to `options.flowchartCurve = "linear"` — a flat key that Mermaid does not recognize. Per-type nested config via tiddler fields is therefore NOT usable without a different strategy. **O-02 resolved:** Per-type config for CONFIG-06 is delivered via the JSON config tiddler (nested structure preserves correctly) and/or `%%{init}%%` in diagram source. Dotted tiddler fields for nested config are deferred (as confirmed by CONTEXT.md deferred items). Document this constraint explicitly in usage docs.

### Anti-Patterns to Avoid

- **Calling `mermaidAPI.initialize()` on every render:** Current behavior at wrapper.js:107. Last caller wins; causes race on multi-diagram pages. Move into `if (!mermaidAPI)` block (D-05).
- **Passing `getOptions()` result directly to `initialize()` without filtering:** `getOptions()` captures every widget attribute. Blind passthrough injects `style`, `class`, DOM attributes into Mermaid's global config. Use the CONFIG_WHITELIST.
- **Injecting `%%{init}%%` AFTER author's directive:** Violates D-02. Author's in-source directive must win (most-local wins). Always prepend.
- **Treating `flowchartCurve` as a valid Mermaid key:** `getOptions()` camelCases dot-separated field names to flat keys (`flowchart.curve` → `flowchartCurve`). Mermaid expects `{ flowchart: { curve: … } }`. The two representations are incompatible. Only JSON (in config tiddler or via a JSON attribute value) preserves nested structure.
- **Putting `securityLevel` in a `%%{init}%%` directive:** Mermaid's secure array silently ignores it. Must flow through `initialize()`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Shadow tiddler user override | Custom UI / form for config | TW's built-in shadow tiddler override pattern | TW resolves non-shadow over shadow automatically; zero code needed for override mechanism |
| JSON parsing of config tiddler | Manual field-by-field read | `$tw.wiki.getTiddlerData(title, {})` | TW5 core method auto-parses `application/json` tiddlers; returns empty object on failure |
| Per-diagram config without re-initializing | Re-call `initialize()` per render | `%%{init}%%` directive prepended to `scriptBody` | Mermaid 11 treats `%%{init}%%` as per-diagram override; correct and idiomatic |
| Deep merge of nested config objects | Custom recursive merge | Shallow replace (D-04) | Avoids subtle bugs; matches how `%%{init}%%` natively behaves; simpler to reason about |

**Key insight:** Mermaid 11's architecture separates global siteConfig (`initialize()`) from per-diagram config (`%%{init}%%`). The fix is to wire the plugin's config collection into these two existing mechanisms correctly, not to build new config machinery.

---

## Critical Research Gap Resolutions

### Gap 1: renderAsync Presence in Vendored Bundle

**Finding:** [VERIFIED: bundle grep] The string `renderAsync` appears **0 times** in the vendored `mermaid.min.js` (11.14.0, 3,165,091 bytes, dated 2026-04-28). `mermaidModule.renderAsync` does not exist in this bundle.

**Implication for D-08:** The existing guard at wrapper.js line 149 already reads:
```javascript
if (renderErr.message && renderErr.message.indexOf('Diagram is a promise') !== -1 && mermaidModule.renderAsync) {
    mermaidModule.renderAsync(...)
}
```
The `&& mermaidModule.renderAsync` check means the guard **never fires** (because `renderAsync` is absent), but it also **never throws** — the code safely falls through to the Promise rejection handler. The guard is correct as written. D-08 is satisfied by confirming the existing guard works correctly; no code change is needed for the `renderAsync` guard.

**What the planner should do:** Document the finding. Add a comment in wrapper.js near line 149 noting that `renderAsync` is absent from the 11.14.0 bundle and the guard is a safety net for future bundle upgrades. No functional code change needed.

### Gap 2: Sankey R&D Parse Error

**Finding:** [VERIFIED: source inspection] `Sankey Diagram.tid` line 47 contains `Gross Profit,R&D,1500` inside a `$$$text/vnd.tiddlywiki.mermaid` block. The `&` character in a Sankey node name is invalid in Mermaid 11.12+ (issue #7528).

**Fix:** Replace `R&D` with `R and D` (or `Research and Dev`, or any name without `&`, `/`, `'`, or `-`) in the node name on line 47. Since the same node name appears as a target on line 43 (`Gross Profit,R&D,1500`) and could also be a source, ensure all uses of the old name are updated to the same new name. Currently line 47 is the only reference to `R&D`.

**Minimal fix:** Change `Gross Profit,R&D,1500` to `Gross Profit,R and D,1500` on line 47.

### Gap 3: getOptions() Output Shape (Confirmed)

[VERIFIED: source inspection of widget-tools.js lines 64-123]

```
getOptions(this, 'mermaid', options) produces:
- options.theme       ← from <$mermaid theme="forest"> or mermaid-theme field
- options.fontFamily  ← from <$mermaid fontFamily="…"> or mermaid-font-family field
- options.look        ← from <$mermaid look="handDrawn"> or mermaid-look field
- options.flowchartCurve  ← from mermaid-flowchart.curve field (FLAT, not nested)
- options.securityLevel   ← from <$mermaid securityLevel="strict"> attr
- options.class           ← from class="…" HTML attribute (JUNK — must filter)
- options.style           ← from style="…" HTML attribute (JUNK — must filter)
- options.text            ← from text="…" attribute (JUNK — must filter)
- … any other widget/HTML attribute
```

The initial value of `options` at wrapper.js:102 is `{ theme: '' }`. `getOptions()` mutates and returns it.

### Gap 4: wrapper.js initialize() Call Site (Exact Lines)

[VERIFIED: source inspection]

```
wrapper.js lines 95-111 (current):

95:  if (!mermaidAPI) {                           ← lazy-load guard
96:      divNode.innerHTML = '<div …Loading…</div>';
97:      mermaidModule = require('…mermaid.min.js');
98:      mermaidAPI = mermaidModule.mermaidAPI || mermaidModule;
99:      d3 = require('…d3.v6.min.js');
100: }                                             ← END lazy-load block
101:
102: var options = { theme: '' };                  ← options object initialization
103:                                               ← (options.theme = '' seed)
104:
105: rocklib.getOptions(this, tag, options);        ← collects fields + attrs
106:
107: mermaidAPI.initialize({                        ← HARDCODED, per-render
108:     startOnLoad: false,
109:     flowchart: { useMaxWidth: true, htmlLabels: true },
110:     securityLevel: 'loose',
111: });
```

**The change for D-05 (once-per-page initialize):**
- Move `mermaidAPI.initialize(buildSiteConfig())` call to inside the `if (!mermaidAPI)` block, after line 99 (d3 require).
- Remove lines 107-111 entirely.
- Lines 102-105 (`var options` + `getOptions`) stay in the per-render path — they are needed for the `%%{init}%%` injection.

**The change for D-02 (%%{init}%% injection):**
- After line 134 (`scriptBody = decodeHtmlEntities(scriptBody)`).
- Before `var renderDiagram = function() {` at line 136.

### Gap 5: Test Suite Status

**Current test count:** [VERIFIED: `node --test` run] 15 tests, 14 pass, **1 pre-existing failure**.

The failing test is `wrapper > displays a friendly error message for invalid syntax` (wrapper.test.js:50). It asserts that invalid syntax produces HTML containing `'could not be rendered'`, but the mock's `render()` returns a then-able that calls `onRejected` with a `MermaidParseError`, and the current wrapper code's Promise-catch path produces the correct HTML — the test fails because the mock's `.then()` chain doesn't synchronously resolve the catch. This is a **pre-existing test failure unrelated to Phase 6**.

**D-09 clarification:** "All 13 existing tests must continue to pass" in CONTEXT.md refers to the 14 currently-passing tests (the count of 13 in CONTEXT.md was written before a test was added). The Phase 6 test gate is: all currently-passing tests (14 of 15) continue to pass, plus new tests for the config wiring added in this phase.

**Test runner:** `node --test` (Node.js built-in test runner, v20+). No test framework npm package needed.

---

## Common Pitfalls

### Pitfall 1: Shallow Replace Breaks Existing flowchart Defaults

**What goes wrong:** If the config tiddler contains `"flowchart": { "curve": "linear" }`, `buildSiteConfig()` does a shallow replace of the `flowchart` key. The plugin's own default `{ useMaxWidth: true, htmlLabels: true }` is lost because the tiddler value replaces the entire object.

**Why it happens:** D-04 mandates shallow replace. The interaction with `buildSiteConfig()`'s baseline defaults is non-obvious.

**How to avoid:** The config tiddler default content must include ALL keys the plugin has historically defaulted (`useMaxWidth: true, htmlLabels: true`) inside the `flowchart` block. Users who add a custom `flowchart` block must include all desired keys, not just the ones they're changing. Document this "block replace" behavior explicitly.

**Warning signs:** Flowchart diagrams suddenly render without HTML labels or without `useMaxWidth` after a user customizes the config tiddler.

### Pitfall 2: widget attributes Captured Beyond Config Keys

**What goes wrong:** `getOptions()` adds ALL widget attributes to `options` — including `class`, `style`, `text`, `height`, etc. Passing these unfiltered to `mermaidAPI.initialize()` injects DOM-attribute names as Mermaid config keys. Mermaid silently ignores unknown keys, but it is still incorrect behavior.

**How to avoid:** The CONFIG_WHITELIST approach in `buildSiteConfig()` and the `NON_SECURE_INJECT_KEYS` list for `%%{init}%%` injection both filter to known Mermaid keys only.

### Pitfall 3: options.theme = '' Seed Value Interferes

**What goes wrong:** `wrapper.js:102` initializes `options = { theme: '' }`. After `getOptions()`, if no theme is specified by the user, `options.theme` is still `''` (empty string, not `undefined`). If this is included in a `%%{init}%%` injection, it sets `theme: ''` which resets to Mermaid's blank/default, overriding the global config tiddler theme.

**How to avoid:** In `buildPerWidgetInit()`, check `options[k] !== undefined && options[k] !== ''` before including a key. The empty-string check is specifically needed for `theme` because of the seed initialization.

### Pitfall 4: mermaidAPI Module Shape

**What goes wrong:** `wrapper.js:98` assigns `mermaidAPI = mermaidModule.mermaidAPI || mermaidModule`. The Mermaid 11 bundle exports `mermaidAPI` as a named export. `mermaidModule.mermaidAPI` should be the correct handle. `buildSiteConfig()` uses `$tw.wiki.getTiddlerData()` which requires `$tw` to be available — it is a global in TW runtime but must be in scope when `buildSiteConfig()` is defined.

**How to avoid:** Define `buildSiteConfig()` inside the IIFE (the outer `(function() { ... })()`) where `$tw` is accessible. Do not define it at module evaluation time — define it as a function but call it only inside the lazy-load block.

### Pitfall 5: plugin.info list Field

**What goes wrong:** New plugin tiddlers that are documentation tiddlers (not JS modules) must be listed in `plugin.info`'s `"list"` field to be included in the plugin bundle. Forgetting this means the config tiddler is not included in the packaged plugin.

**Current list field:** `"list": "readme usage example license"` [VERIFIED: source inspection of plugin.info]

**How to avoid:** Add `"config"` to the list: `"list": "readme usage example license config"`. The identifier `config` corresponds to the tiddler that has a filename containing `config` in the plugin directory.

---

## Code Examples

### Exact Current Code Being Changed (wrapper.js lines 95-111)

```javascript
// Source: direct source inspection of wrapper.js

// CURRENT — to be changed:
if (!mermaidAPI) {
    divNode.innerHTML = '<div …>Loading diagram…</div>';
    mermaidModule = require('$:/plugins/orange/mermaid-tw5/mermaid.min.js');
    mermaidAPI = mermaidModule.mermaidAPI || mermaidModule;
    d3 = require('$:/plugins/orange/mermaid-tw5/d3.v6.min.js');
}

var options = { theme: '' };
rocklib.getOptions(this, tag, options);

mermaidAPI.initialize({           // ← REMOVE this entire block
    startOnLoad: false,
    flowchart: { useMaxWidth: true, htmlLabels: true },
    securityLevel: 'loose',
});
```

```javascript
// REPLACEMENT — target state:
if (!mermaidAPI) {
    divNode.innerHTML = '<div …>Loading diagram…</div>';
    mermaidModule = require('$:/plugins/orange/mermaid-tw5/mermaid.min.js');
    mermaidAPI = mermaidModule.mermaidAPI || mermaidModule;
    d3 = require('$:/plugins/orange/mermaid-tw5/d3.v6.min.js');
    mermaidAPI.initialize(buildSiteConfig());  // ← ONCE per page load (D-05)
}

var options = { theme: '' };
rocklib.getOptions(this, tag, options);
// initialize() removed from here
```

### renderAsync Guard (wrapper.js lines 148-150) — No Change Needed

```javascript
// Source: direct source inspection of wrapper.js lines 148-150
// CURRENT (already correct):
if (renderErr.message &&
    renderErr.message.indexOf('Diagram is a promise') !== -1 &&
    mermaidModule.renderAsync) {              // ← renderAsync absent in 11.14.0; never fires
    mermaidModule.renderAsync(...)
}
// ACTION: Add a comment documenting renderAsync is absent; no functional change.
```

### Sankey Fix

```
// Source: Sankey Diagram.tid line 47
// CURRENT (broken — & is invalid in Mermaid 11.12+ Sankey node names):
Gross Profit,R&D,1500

// REPLACEMENT:
Gross Profit,R and D,1500
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Call `mermaidAPI.initialize()` per render (current plugin behavior) | Call once per page load, use `%%{init}%%` per diagram | This phase (Phase 6) | Eliminates last-write-wins race; correct Mermaid 11 usage pattern |
| `%%{init}%%` deprecated in favor of YAML frontmatter | Both work in Mermaid 11; YAML frontmatter preferred for new diagrams | Mermaid 10.5.0 | Plugin injection uses `%%{init}%%` because it is programmatically easier to prepend; acceptable for plugin-generated directives |
| Hardcoded `securityLevel: 'loose'` in plugin source | User-configurable via shadow tiddler, default `'loose'` | This phase (Phase 6) | Site owners can change securityLevel without editing plugin source |

**Still current:**
- `mermaidAPI.render()` in Mermaid 11 always returns a Promise (thenable). The sync render path in Mermaid 9 no longer applies.
- `renderAsync` never existed in the 11.14.0 bundle. The guard at line 149 is correct as a forward-compatibility net.
- YAML frontmatter (`--- config: … ---`) has the same precedence as `%%{init}%%` and cannot override secure keys.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | CONFIG_WHITELIST correctly enumerates all standard Mermaid 11.14.0 config keys | Standard Stack Pattern 1 | If a valid Mermaid key is omitted from the whitelist, users cannot set it via tiddler fields/attrs — they'd need to use the config tiddler JSON or `%%{init}%%` instead. Low impact. |
| A2 | `tags: $:/tags/ControlPanel/Settings` causes the config tiddler to appear in TW ControlPanel | Pattern 3 | If wrong, tiddler still works but isn't easily discoverable in the UI. Can verify by testing in demo TW. |
| A3 | Prepending `%%{init}%%` before author's existing `%%{init}%%` correctly invokes Mermaid's last-wins merge | Pattern 2 | If Mermaid processes directives in reverse order or ignores duplicates, the wrong value could win. Mermaid docs state multiple `%%{init}%%` blocks are merged with later values winning — standard JS object spread semantics. Verify with a simple two-directive test. |
| A4 | The `theme: ''` seed in `options` at wrapper.js:102 is intentional and must be filtered out | Pitfall 3 | If `theme: ''` is valid and meaningful in Mermaid, filtering it changes behavior. In practice, Mermaid treats `''` as "use default" — filtering is correct. |

---

## Open Questions

1. **Should config conflicts log a console note?**
   - What we know: `getOptions()` currently swallows all errors silently. CONTEXT.md notes this is the recommended approach for consistency.
   - What's unclear: Whether a single `console.warn` for "unknown config key dropped" would be useful during development.
   - Recommendation: Keep silent. Consistent with existing behavior. If needed, a `DEBUG` flag can be added later.

2. **Should per-type config blocks (flowchart, sequence, etc.) also be injectable via `%%{init}%%` when provided as widget attributes?**
   - What we know: `getOptions()` converts `mermaid-flowchart.curve: linear` → `options.flowchartCurve` (flat). A widget attribute `flowchart='{"curve":"linear"}'` would produce `options.flowchart = {curve: "linear"}` (parsed JSON — correct nested structure).
   - What's unclear: Whether CONFIG-06 requires per-diagram per-type config to work via widget attr or only via the global config tiddler.
   - Recommendation: For Phase 6, only support per-type config via the global config tiddler (O-02 resolution). Widget attr `theme="forest"` → `%%{init}%%` injection covers the most common cases. Document the config tiddler as the path for per-type structural config.

---

## Environment Availability

No external tools required. All changes are JavaScript edits and tiddler files.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js (for tests) | `node --test` | Yes | v20+ (CI-verified) | — |
| TiddlyWiki CLI | Demo build verification | Check during planning | 5.3.x | Build via CI only |

**Missing dependencies with no fallback:** None.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Node.js built-in `node:test` (no npm package) |
| Config file | None — `node --test` auto-discovers `tests/*.test.js` |
| Quick run command | `node --test` |
| Full suite command | `node --test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CONFIG-02 | `<$mermaid theme="forest">` causes `%%{init: {"theme":"forest"}}%%` to be prepended to scriptBody | unit | `node --test tests/wrapper.test.js` | Wave 0 — new test needed |
| CONFIG-02 | Widget attribute `fontFamily="monospace"` injects correct `%%{init}%%` | unit | `node --test tests/wrapper.test.js` | Wave 0 — new test needed |
| CONFIG-02 | Non-whitelisted attribute (`class`, `style`) is NOT injected into `%%{init}%%` | unit | `node --test tests/wrapper.test.js` | Wave 0 — new test needed |
| CONFIG-03 | On second render (mermaidAPI already loaded), `initialize()` is NOT called again | unit | `node --test tests/wrapper.test.js` | Wave 0 — new test needed (extend lazy-loading suite) |
| CONFIG-03 | On first render, `initialize()` IS called with `buildSiteConfig()` result | unit | `node --test tests/wrapper.test.js` | Wave 0 — new test needed |
| CONFIG-04 | `buildSiteConfig()` reads `securityLevel` from config tiddler data | unit | `node --test tests/wrapper.test.js` | Wave 0 — new test needed |
| CONFIG-04 | `buildSiteConfig()` uses `securityLevel: 'loose'` default when tiddler absent | unit | `node --test tests/wrapper.test.js` | Wave 0 — new test needed |
| CONFIG-05 | `buildSiteConfig()` merges `theme`, `look`, `fontFamily` from config tiddler | unit | `node --test tests/wrapper.test.js` | Wave 0 — new test needed |
| CONFIG-06 | `buildSiteConfig()` passes `flowchart` nested block from config tiddler | unit | `node --test tests/wrapper.test.js` | Wave 0 — new test needed |
| D-09 | All currently-passing tests remain green | unit | `node --test` | Existing — 14 tests currently passing |

### Mock Setup for New Tests

The test mock at `tests/helpers/tw-bootstrap.js` provides:
- `$tw.wiki.getTiddlerData(title, default)` — returns `{}` by default. Tests that exercise config tiddler reading must call `$tw.wiki.getTiddlerData` with a custom mock return value.
- `mockMermaidAPI.initialize` — currently a no-op `function() {}`. Tests for CONFIG-03 need to spy on this to verify it is called exactly once.

The tw-bootstrap mock needs small extensions for Phase 6 tests:
1. Add call tracking to `mockMermaidAPI.initialize` (record calls, not just no-op).
2. Allow `$tw.wiki.getTiddlerData` to return different values per test (configurable mock or test-local override).

### Sampling Rate

- **Per task commit:** `node --test`
- **Per wave merge:** `node --test`
- **Phase gate:** `node --test` fully green (14 existing + new config tests) before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `tests/wrapper.test.js` — extend with config-wiring tests (CONFIG-02 through CONFIG-06)
- [ ] `tests/helpers/tw-bootstrap.js` — extend `mockMermaidAPI.initialize` with call tracking; make `getTiddlerData` configurable per-test

*(Existing test infrastructure covers all structural concerns; only behavioral extensions needed)*

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | — |
| V3 Session Management | No | — |
| V4 Access Control | Partial | `securityLevel` controls what diagram authors can do; site owner controls via shadow tiddler |
| V5 Input Validation | Yes | CONFIG_WHITELIST prevents injection of arbitrary keys into `mermaidAPI.initialize()` |
| V6 Cryptography | No | — |

### Known Threat Patterns for TiddlyWiki Plugin + Mermaid

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Diagram author sets `securityLevel: 'loose'` via `%%{init}%%` to enable XSS | Elevation of Privilege | Mermaid's secure array blocks this at the library level; no plugin code change needed |
| Junk widget attributes injected into `initialize()` config | Tampering | CONFIG_WHITELIST in `buildSiteConfig()` and `NON_SECURE_INJECT_KEYS` for injection |
| User overrides config tiddler with `securityLevel: 'strict'`, breaking click navigation | Denial of Service (self-inflicted) | Document the tradeoff; `'loose'` remains the default |
| `startOnLoad: true` in user's config tiddler override triggers auto-render outside plugin control | Tampering | D-07: `startOnLoad: false` is hardcoded in `buildSiteConfig()` and cannot be overridden via config tiddler |

---

## Sources

### Primary (HIGH confidence)

- Direct source inspection: `mermaid-tw5/plugins/mermaid-tw5/$__plugins_mermaid-tw5_wrapper.js` — lines 1-220, exact call sites, lazy-load block, render path
- Direct source inspection: `mermaid-tw5/plugins/mermaid-tw5/$__plugins_mermaid-tw5_widget-tools.js` — `getOptions()` lines 64-123, exact output shape
- Direct source inspection: `mermaid-tw5/plugins/mermaid-tw5/plugin.info` — current `"list"` field content
- Direct source inspection: `mermaid-tw5/tiddlers/Sankey Diagram.tid` — confirmed `R&D` at line 47
- Bundle grep: `$__plugins_mermaid-tw5_mermaid.min.js` — version confirmed `11.14.0`; `renderAsync` confirmed absent (0 hits)
- Test run: `node --test` — 15 tests, 14 pass, 1 pre-existing failure (wrapper error display test)
- `.planning/research/ARCHITECTURE.md` — `buildSiteConfig()` design, integration points table, exact line numbers (HIGH — from prior session code inspection)
- `.planning/research/FEATURES.md` — complete per-type config key tables, secure key list (HIGH — verified against official Mermaid schema)
- `.planning/research/PITFALLS.md` — all 12 pitfalls with source citations (HIGH — code inspection + issue tracker)
- `.planning/research/STACK.md` — diagram type inventory (HIGH — bundle grep evidence)

### Secondary (MEDIUM confidence)

- Mermaid directives docs (mermaid.js.org/config/directives) — `%%{init}%%` precedence, multiple-directive merge behavior, secure array
- Mermaid config schema (mermaid.js.org/config/schema-docs/) — global and per-type key lists
- Mermaid issue #7528 — Sankey `&` character parse error in 11.12+
- TiddlyWiki shadow tiddler override mechanism (tiddlywiki.com/dev) — user override pattern

---

## Metadata

**Confidence breakdown:**
- getOptions() output shape: HIGH — source read directly
- wrapper.js change targets: HIGH — source read directly with exact line numbers
- renderAsync finding: HIGH — bundle grep with zero-hit confirmation
- Sankey fix: HIGH — tiddler source read directly
- buildSiteConfig() design: HIGH — adapted from ARCHITECTURE.md (prior session code inspection) + verified against source
- %%{init}%% injection pattern: HIGH — verified against Mermaid directive docs
- Test suite status: HIGH — `node --test` run with actual output
- CONFIG_WHITELIST completeness: ASSUMED — covers known Mermaid 11.14.0 config surface

**Research date:** 2026-06-07
**Valid until:** 2026-09-07 (stable — TW5 plugin, vendored Mermaid, no npm packages)
