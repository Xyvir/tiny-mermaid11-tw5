# Phase 6: Config Wiring Foundation - Pattern Map

**Mapped:** 2026-06-07
**Files analyzed:** 6 (2 create, 4 modify)
**Analogs found:** 6 / 6

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `mermaid-tw5/plugins/mermaid-tw5/$__plugins_mermaid-tw5_wrapper.js` | widget/service | request-response | itself (surgical edit) | self |
| `mermaid-tw5/plugins/mermaid-tw5/$__plugins_mermaid-tw5_config.tid` | config | CRUD (read) | `$__plugins_mermaid-tw5_readme.tid` + `$__plugins_mermaid-tw5_usage.tid` (structure); no JSON .tid exists — RESEARCH.md Pattern 3 is primary | structure-match |
| `mermaid-tw5/plugins/mermaid-tw5/plugin.info` | config | CRUD | itself (add "config" to list field) | self |
| `mermaid-tw5/tiddlers/Sankey Diagram.tid` | content | transform | itself (one-line content fix) | self |
| `tests/wrapper.test.js` | test | request-response | itself (extend with new describe blocks) | self |
| `tests/helpers/tw-bootstrap.js` | test helper | request-response | itself (extend mockMermaidAPI + getTiddlerData) | self |

---

## Pattern Assignments

### `$__plugins_mermaid-tw5_wrapper.js` — Add `buildSiteConfig()`, move `initialize()`, add `%%{init}%%` injection

**Analog:** itself — surgical edits at three precise locations.

**WARNING — getScriptBody() is fragile:** `widget-tools.js` lines 15–53 contain the `getScriptBody()` function which is documented as "of dubious value" and known-buggy. This phase does NOT touch `getScriptBody()`. All new code in `wrapper.js` is inserted after line 134 (`scriptBody = decodeHtmlEntities(scriptBody)`) and before line 136 (`var renderDiagram = function()`). Do not move the `decodeHtmlEntities` call.

#### Location 1: New module-level constants and `buildSiteConfig()` function

**Insert between line 57 (`getSimpleStack` closes) and line 58 (`var MermaidWidget = function...`).**

Current anchor (lines 56–58):
```javascript
// wrapper.js lines 56-58 — insert buildSiteConfig() HERE, between these lines
        return frames.join('\n');
    }

    var MermaidWidget = function(parseTreeNode, options) {
```

Pattern to insert (adapted from RESEARCH.md Pattern 1):
```javascript
    var SECURE_KEYS = ['secure', 'securityLevel', 'startOnLoad',
                       'maxTextSize', 'maxEdges', 'suppressErrorRendering'];

    var CONFIG_WHITELIST = [
        'theme', 'themeVariables', 'themeCSS', 'look', 'handDrawnSeed',
        'fontFamily', 'altFontFamily', 'fontSize', 'darkMode', 'wrap',
        'htmlLabels', 'markdownAutoWrap', 'logLevel',
        'arrowMarkerAbsolute', 'deterministicIds', 'deterministicIDSeed',
        'flowchart', 'sequence', 'gantt', 'pie', 'class', 'state', 'er',
        'journey', 'gitGraph', 'quadrantChart', 'xyChart', 'sankey',
        'timeline', 'mindmap', 'packet', 'block', 'architecture', 'kanban',
        'c4', 'requirement', 'radar',
        'securityLevel', 'maxTextSize', 'maxEdges', 'suppressErrorRendering'
    ];

    var NON_SECURE_INJECT_KEYS = ['theme', 'look', 'fontFamily', 'fontSize',
                                   'themeVariables', 'darkMode'];

    function buildSiteConfig() {
        var config = {
            startOnLoad: false,
            securityLevel: 'loose',
            flowchart: { useMaxWidth: true, htmlLabels: true }
        };
        var configTitle = '$:/plugins/orange/mermaid-tw5/config';
        var data = $tw.wiki.getTiddlerData(configTitle, {});
        for (var k in data) {
            if (Object.prototype.hasOwnProperty.call(data, k) &&
                CONFIG_WHITELIST.indexOf(k) !== -1) {
                if (k === 'startOnLoad') continue;  // D-07: never allow override
                config[k] = data[k];                // shallow replace per D-04
            }
        }
        return config;
    }

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
```

**Key convention:** All new functions are defined inside the outer `(function() { ... })()` IIFE (line 8), so `$tw` is in scope at call time.

#### Location 2: Move `initialize()` into lazy-load block, remove per-render call

**Current code (lines 95–111):**
```javascript
// wrapper.js lines 95-111 — CURRENT (to be changed)
            if (!mermaidAPI) {
                divNode.innerHTML = '<div style="border-left:3px solid #999;background:#f5f5f5;padding:8px 12px;">Loading diagram…</div>';
                mermaidModule = require('$:/plugins/orange/mermaid-tw5/mermaid.min.js');
                mermaidAPI = mermaidModule.mermaidAPI || mermaidModule;
                d3 = require('$:/plugins/orange/mermaid-tw5/d3.v6.min.js');
            }

            var options = {
                theme: ''
            };
            rocklib.getOptions(this, tag, options);

            mermaidAPI.initialize({
                startOnLoad: false,
                flowchart: { useMaxWidth: true, htmlLabels: true },
                securityLevel: 'loose',
            });
```

**Target state (replace lines 95–111 with):**
```javascript
            if (!mermaidAPI) {
                divNode.innerHTML = '<div style="border-left:3px solid #999;background:#f5f5f5;padding:8px 12px;">Loading diagram…</div>';
                mermaidModule = require('$:/plugins/orange/mermaid-tw5/mermaid.min.js');
                mermaidAPI = mermaidModule.mermaidAPI || mermaidModule;
                d3 = require('$:/plugins/orange/mermaid-tw5/d3.v6.min.js');
                mermaidAPI.initialize(buildSiteConfig());  // D-05: once per page load
            }

            var options = {
                theme: ''
            };
            rocklib.getOptions(this, tag, options);
            // mermaidAPI.initialize() removed from per-render path (was lines 107-111)
```

#### Location 3: `%%{init}%%` injection before `renderDiagram`

**Current code (lines 134–136):**
```javascript
// wrapper.js lines 134-136 — insert injection block HERE
            scriptBody = decodeHtmlEntities(scriptBody);

            var renderDiagram = function() {
```

**Target state (replace lines 134–136 with):**
```javascript
            scriptBody = decodeHtmlEntities(scriptBody);

            // D-02: inject per-widget non-secure config as %%{init}%% PREPENDED
            // before any author's %%{init}%% so the author's in-source directive wins.
            var perWidgetInit = buildPerWidgetInit(options);
            if (perWidgetInit) {
                scriptBody = '%%{init: ' + JSON.stringify(perWidgetInit) + '}%%\n' + scriptBody;
            }

            var renderDiagram = function() {
```

#### Location 4: `renderAsync` guard comment

**Current code (line 149):**
```javascript
// wrapper.js line 149 — add documentation comment only, no functional change
                        if (renderErr.message && renderErr.message.indexOf('Diagram is a promise') !== -1 && mermaidModule.renderAsync) {
```

**Target state (add comment above line 149):**
```javascript
                        // renderAsync is absent from the vendored Mermaid 11.14.0 bundle
                        // (grep confirms 0 occurrences). This guard never fires but is kept
                        // as a forward-compatibility safety net for future bundle upgrades.
                        if (renderErr.message && renderErr.message.indexOf('Diagram is a promise') !== -1 && mermaidModule.renderAsync) {
```

---

### `$__plugins_mermaid-tw5_config.tid` — New JSON shadow config tiddler (CREATE)

**No direct analog exists in this plugin** — no `application/json` tiddlers exist in `mermaid-tw5/plugins/mermaid-tw5/`. The structural template comes from RESEARCH.md Pattern 3, cross-referenced against the existing plain-text `.tid` files.

**Existing .tid structure pattern** (from `$__plugins_mermaid-tw5_readme.tid` lines 1–3 and `$__plugins_mermaid-tw5_usage.tid` lines 1–2):
```
title: $:/plugins/orange/mermaid-tw5/readme

This is a TiddlyWiki plugin...
```
Observed conventions:
- `title:` field is first line
- Blank line separates metadata from body
- No `created:` or `modified:` timestamps in plugin bundle `.tid` files (they appear in `mermaid-tw5/tiddlers/` tiddlers, not plugin bundle tiddlers)
- Body begins immediately after blank line

**Target file content** (RESEARCH.md Pattern 3):
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

**Critical notes:**
- `type: application/json` is required for `$tw.wiki.getTiddlerData()` to auto-parse the body.
- `tags: $:/tags/ControlPanel/Settings` makes the tiddler discoverable in TW's ControlPanel UI (Assumption A2 — verify by test in demo wiki, low-risk if wrong).
- The `flowchart` block includes `useMaxWidth` and `htmlLabels` to preserve existing plugin defaults. Omitting these would lose them on shallow replace (RESEARCH.md Pitfall 1).
- `plugin.info` `"list"` field must be updated (see below) or this tiddler will not be included in the packaged plugin bundle.

---

### `plugin.info` — Add "config" to list field

**Analog:** itself (one-field edit).

**Current line 7** (from `plugin.info` line 7):
```json
    "list": "readme usage example license",
```

**Target state:**
```json
    "list": "readme usage example license config",
```

The identifier `config` must match the filename fragment: the new file is `$__plugins_mermaid-tw5_config.tid`, so the fragment is `config`. TW plugin bundler uses this list to include documentation/data tiddlers that are not `.js` modules (RESEARCH.md Pitfall 5).

---

### `mermaid-tw5/tiddlers/Sankey Diagram.tid` — Fix `R&D` parse error

**Analog:** itself (one-line content fix).

**Current line 47** (from `Sankey Diagram.tid` line 47):
```
Gross Profit,R&D,1500
```

**Also present in the code block (line 38, display-only — fix both for consistency):**
```
Gross Profit,R&D,1500
```

**Target state (both occurrences):**
```
Gross Profit,R and D,1500
```

The `&` character is invalid in Mermaid 11.12+ Sankey node names (issue #7528). The fix is purely content; no `.tid` metadata fields change. The code block at lines 33–42 shows the diagram source for the reader — it should also be updated so the documentation matches the rendered output.

**IMPORTANT:** Line 38 is inside a ` ``` ` fenced block (display/documentation), line 47 is inside the `$$$text/vnd.tiddlywiki.mermaid` block (rendered). Both should be updated to show `R and D`.

---

### `tests/wrapper.test.js` — Extend with config-wiring tests

**Analog:** itself — add new `describe('config wiring', ...)` block following the existing `describe('lazy loading', ...)` pattern at lines 71–112.

**Existing test structure pattern** (lines 71–112 — `describe('lazy loading')` block):
```javascript
// wrapper.test.js lines 71-112 — copy this describe/it/beforeEach/assert pattern

describe('lazy loading', () => {
    it('does not load mermaid or d3 during module evaluation', () => {
        clearRequireCalls();
        loadModule('$:/plugins/orange/mermaid-tw5/wrapper.js');

        var calls = getRequireCalls();
        assert.ok(calls.indexOf('$:/plugins/orange/mermaid-tw5/mermaid.min.js') === -1,
            'should not require mermaid at module load time');
    });

    it('does not reload mermaid or d3 on subsequent renders', () => {
        var widget1 = makeWidget('graph TD; A-->B');
        widget1.render(global.document.createElement('div'), null);

        clearRequireCalls();

        var widget2 = makeWidget('graph TD; C-->D');
        widget2.render(global.document.createElement('div'), null);

        var calls = getRequireCalls();
        assert.ok(calls.indexOf('$:/plugins/orange/mermaid-tw5/mermaid.min.js') === -1,
            'should not re-require mermaid on second render');
    });
});
```

**Import additions needed at top of file** (add to existing import line 3):
```javascript
import { loadModule, getRequireCalls, clearRequireCalls, clearModuleCache } from './helpers/tw-bootstrap.js';
// Add: mockMermaidAPI so tests can inspect initialize() call count
import { loadModule, getRequireCalls, clearRequireCalls, clearModuleCache, mockMermaidAPI } from './helpers/tw-bootstrap.js';
```

**New describe block pattern** (add after the `describe('lazy loading', ...)` block, before the final `}`):
```javascript
describe('config wiring', () => {
    beforeEach(function() {
        clearModuleCache('$:/plugins/orange/mermaid-tw5/wrapper.js');
        global.$tw.browser = true;
        // Reset initialize call tracking before each test
        mockMermaidAPI.initializeCalls = [];
        // Reset getTiddlerData to default (returns empty object)
        global.$tw.wiki.getTiddlerData = function() { return {}; };
    });

    it('calls initialize() on first render with startOnLoad: false', () => {
        var widget = makeWidget('graph TD; A-->B');
        widget.render(global.document.createElement('div'), null);

        assert.ok(mockMermaidAPI.initializeCalls.length > 0,
            'initialize should be called on first render');
        var config = mockMermaidAPI.initializeCalls[0];
        assert.strictEqual(config.startOnLoad, false,
            'startOnLoad must always be false');
    });

    it('does not call initialize() on second render (once-per-page, D-05)', () => {
        var widget1 = makeWidget('graph TD; A-->B');
        widget1.render(global.document.createElement('div'), null);
        var callCountAfterFirst = mockMermaidAPI.initializeCalls.length;

        var widget2 = makeWidget('graph TD; C-->D');
        widget2.render(global.document.createElement('div'), null);

        assert.strictEqual(mockMermaidAPI.initializeCalls.length, callCountAfterFirst,
            'initialize should not be called again on second render');
    });

    it('passes securityLevel from config tiddler to initialize()', () => {
        global.$tw.wiki.getTiddlerData = function(title) {
            if (title === '$:/plugins/orange/mermaid-tw5/config') {
                return { securityLevel: 'strict' };
            }
            return {};
        };
        var widget = makeWidget('graph TD; A-->B');
        widget.render(global.document.createElement('div'), null);

        var config = mockMermaidAPI.initializeCalls[0];
        assert.strictEqual(config.securityLevel, 'strict',
            'securityLevel from config tiddler should reach initialize()');
    });

    it('uses securityLevel loose as default when config tiddler absent', () => {
        // getTiddlerData already returns {} by default from beforeEach reset
        var widget = makeWidget('graph TD; A-->B');
        widget.render(global.document.createElement('div'), null);

        var config = mockMermaidAPI.initializeCalls[0];
        assert.strictEqual(config.securityLevel, 'loose',
            'default securityLevel should be loose');
    });

    it('prepends %%{init}%% for theme widget attribute (D-02)', () => {
        var widget = makeWidget('graph TD; A-->B');
        widget.attributes = { theme: 'forest' };
        var parent = global.document.createElement('div');
        widget.render(parent, null);

        // The rendered scriptBody passed to mermaidAPI.render should be inspectable
        // via the mock's last render call source argument
        var lastSource = mockMermaidAPI.lastRenderSource;
        assert.ok(lastSource && lastSource.indexOf('%%{init:') === 0,
            '%%{init}%% should be prepended');
        assert.ok(lastSource.indexOf('"theme":"forest"') !== -1 ||
                  lastSource.indexOf('"theme": "forest"') !== -1,
            'theme:forest should be in injected %%{init}%%');
    });

    it('does not inject %%{init}%% when no non-secure widget attrs set', () => {
        var widget = makeWidget('graph TD; A-->B');
        widget.attributes = {};
        var parent = global.document.createElement('div');
        widget.render(parent, null);

        var lastSource = mockMermaidAPI.lastRenderSource;
        assert.ok(!lastSource || lastSource.indexOf('%%{init:') !== 0,
            'no %%{init}%% should be prepended when no non-secure attrs');
    });

    it('does not inject class or style attrs into %%{init}%% (O-01 whitelist)', () => {
        var widget = makeWidget('graph TD; A-->B');
        widget.attributes = { class: 'my-diagram', style: 'color:red' };
        var parent = global.document.createElement('div');
        widget.render(parent, null);

        var lastSource = mockMermaidAPI.lastRenderSource;
        assert.ok(!lastSource || lastSource.indexOf('"class"') === -1,
            'class should not appear in injected %%{init}%%');
        assert.ok(!lastSource || lastSource.indexOf('"style"') === -1,
            'style should not appear in injected %%{init}%%');
    });
});
```

**Note on `lastRenderSource`:** The tests above reference `mockMermaidAPI.lastRenderSource`. The `tw-bootstrap.js` mock's `render()` function must be extended to record the `source` argument on each call. See tw-bootstrap.js section below.

---

### `tests/helpers/tw-bootstrap.js` — Extend mock for config-wiring tests

**Analog:** itself — two targeted extensions to the existing `mockMermaidAPI` object (lines 65–93).

**Current `mockMermaidAPI.initialize` (line 66):**
```javascript
// tw-bootstrap.js lines 65-93 — mockMermaidAPI object
var mockMermaidAPI = {
    initialize: function() {},
    render: function(id, source) {
        if (source && source.indexOf('INVALID_SYNTAX') !== -1) {
```

**Target state (extend `mockMermaidAPI` with call tracking):**
```javascript
var mockMermaidAPI = {
    initializeCalls: [],                          // NEW: tracks args passed to initialize()
    lastRenderSource: null,                       // NEW: records last scriptBody seen by render()
    initialize: function(config) {
        mockMermaidAPI.initializeCalls.push(config);  // NEW: record each call
    },
    render: function(id, source) {
        mockMermaidAPI.lastRenderSource = source;     // NEW: record for %%{init}%% inspection
        if (source && source.indexOf('INVALID_SYNTAX') !== -1) {
```

**The reset of `initializeCalls` and `lastRenderSource` happens in each test's `beforeEach`** (see wrapper.test.js pattern above) — NOT in tw-bootstrap.js itself, so the mock remains stateless at module level and the per-test reset is explicit and readable.

**Extend `getTiddlerData` to be test-overridable:** The mock currently hardcodes `getTiddlerData: function() { return {}; }` at line 15. This is already sufficient — tests override `global.$tw.wiki.getTiddlerData` directly in `beforeEach` since `global.$tw.wiki` is the live object. No structural change needed; the per-test override pattern shown in the wrapper.test.js section above works as-is.

**Export `mockMermaidAPI`:** It is already exported at line 195:
```javascript
// tw-bootstrap.js lines 191-199
module.exports = {
    loadModule: loadModule,
    twRequire: twRequire,
    MockWidget: MockWidget,
    mockMermaidAPI: mockMermaidAPI,        // already exported — just import it in test file
    getRequireCalls: getRequireCalls,
    clearRequireCalls: clearRequireCalls,
    clearModuleCache: clearModuleCache
};
```

No new exports needed — `mockMermaidAPI` is already exported. The wrapper.test.js import line must be updated to destructure it.

---

## Shared Patterns

### IIFE Scope Pattern (all new JS code)
**Source:** `wrapper.js` lines 8–220
**Apply to:** All new functions in `wrapper.js` (`buildSiteConfig`, `buildPerWidgetInit`, constants)

All new code must be defined inside the outer `(function() { ... })()` IIFE that wraps the entire module. This ensures `$tw` is accessible as a closure variable without requiring it as a parameter. Define constants and helper functions between the closing `}` of `getSimpleStack` (line 57) and `var MermaidWidget = function...` (line 58).

```javascript
// wrapper.js — IIFE wrapper (lines 8 and 220)
(function() {
    // jslint node: true, browser: true
    // global $tw: false
    'use strict';
    // ... ALL module code including new buildSiteConfig() goes here ...
})();
```

### Error Handling Pattern (silent ignore)
**Source:** `widget-tools.js` lines 119–121
**Apply to:** `buildSiteConfig()` — unknown keys are silently dropped (consistent with `getOptions()` behavior)

```javascript
// widget-tools.js lines 119-121 — the established silent-ignore pattern
        } catch (ex) {
            // silently ignore parse errors
        }
```

`buildSiteConfig()` silently skips keys not in CONFIG_WHITELIST. No `console.warn`. No thrown errors.

### TW API Usage Pattern
**Source:** `widget-tools.js` lines 105–107
**Apply to:** `buildSiteConfig()` — reading tiddler data

```javascript
// widget-tools.js lines 105-107 — established getTiddlerData usage pattern
                if ($tw.wiki.tiddlerExists(attval)) {
                    var data = $tw.wiki.getTiddlerData(attval);
                    options[att] = data;
```

`buildSiteConfig()` uses `$tw.wiki.getTiddlerData(configTitle, {})` with an empty-object fallback, matching the established "safe read" convention.

### Test `beforeEach` / `clearModuleCache` Pattern
**Source:** `wrapper.test.js` lines 17–20
**Apply to:** new `describe('config wiring', ...)` `beforeEach`

```javascript
// wrapper.test.js lines 17-20 — established beforeEach isolation pattern
    beforeEach(function() {
        clearModuleCache('$:/plugins/orange/mermaid-tw5/wrapper.js');
        global.$tw.browser = true;
    });
```

New config-wiring `beforeEach` must also call `clearModuleCache` to reset `mermaidAPI = null` between tests, ensuring the lazy-load block (and therefore `initialize()`) fires fresh each time.

### Node.js Test Runner Style
**Source:** `wrapper.test.js` lines 1–4, `widget-tools.test.js` lines 1–4
**Apply to:** all new test code

```javascript
// wrapper.test.js lines 1-4 — test file header pattern
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { loadModule, getRequireCalls, clearRequireCalls, clearModuleCache } from './helpers/tw-bootstrap.js';
import './helpers/dom-mock.js';
```

Use `node:test` and `node:assert` (no external test framework). Use ESM `import` at the top. Import `dom-mock.js` as a side-effect import on every test file that touches DOM APIs.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `$__plugins_mermaid-tw5_config.tid` (JSON body) | config | CRUD (read) | No `application/json` tiddler exists in this plugin. RESEARCH.md Pattern 3 is the definitive template. The `.tid` metadata header structure is inferred from existing plain-text `.tid` files in the plugin bundle. |

---

## Metadata

**Analog search scope:**
- `mermaid-tw5/plugins/mermaid-tw5/` (all `.js`, `.tid`, `.meta`, `plugin.info`)
- `mermaid-tw5/tiddlers/` (sampled `.tid` files for structural patterns)
- `tests/` (all `.test.js`, `helpers/`)

**Files scanned:** 11 source files read in full

**Critical fragile area flag:** `getScriptBody()` in `widget-tools.js` lines 15–53 is marked fragile in `CLAUDE.md`. Phase 6 does NOT touch `getScriptBody()`. The `%%{init}%%` injection operates on `scriptBody` after `decodeHtmlEntities()` has already processed it — the injection point is safe.

**Pattern extraction date:** 2026-06-07
