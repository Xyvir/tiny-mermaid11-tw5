# Architecture Research

**Domain:** TiddlyWiki 5 plugin — Mermaid diagram rendering
**Researched:** 2026-06-07
**Confidence:** HIGH (all findings verified against actual source code and official Mermaid 11 docs)

---

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                   TiddlyWiki 5 Runtime                           │
│                                                                  │
│  ┌────────────────┐  ┌──────────────────┐  ┌─────────────────┐  │
│  │  $$$text/vnd.  │  │  <$mermaid>      │  │  Tiddler type   │  │
│  │  tiddlywiki.   │  │  widget inline   │  │  text/vnd.tw.   │  │
│  │  mermaid block │  │  attribute text= │  │  mermaid body   │  │
│  └───────┬────────┘  └────────┬─────────┘  └────────┬────────┘  │
│          │                   │                       │           │
│          └───────────────────┼───────────────────────┘           │
│                              ▼                                   │
│              ┌───────────────────────────────┐                   │
│              │  typed-parser.js              │                   │
│              │  MermaidParser wraps body     │                   │
│              │  into {type:"mermaid"} node   │                   │
│              └───────────────┬───────────────┘                   │
│                              ▼                                   │
│              ┌───────────────────────────────┐                   │
│              │  wrapper.js — MermaidWidget   │                   │
│              │  render(parent, nextSibling)  │                   │
│              └───┬───────────────────────────┘                   │
│                  │                                               │
│     ┌────────────┼────────────────────┐                         │
│     ▼            ▼                    ▼                         │
│  getScriptBody  getOptions        getCanvas                      │
│  (widget-tools) (widget-tools)    (widget-tools)                 │
│     │            │                    │                         │
│     └────────────┼────────────────────┘                         │
│                  ▼                                               │
│     ┌──────────────────────────────────────────┐                │
│     │  mermaidAPI.initialize(config)           │                │
│     │  mermaidAPI.render(svgId, src) → Promise │                │
│     └──────────────────────────────────────────┘                │
│                  ▼                                               │
│     ┌──────────────────────────────────────────┐                │
│     │  divNode.innerHTML = res.svg             │                │
│     │  D3 zoom click binding                   │                │
│     └──────────────────────────────────────────┘                │
└──────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | File | Responsibility |
|-----------|------|----------------|
| MermaidWidget | `wrapper.js` | DOM creation, lazy-load trigger, config assembly, render, error display, D3 zoom |
| MermaidParser | `typed-parser.js` | Routes `text/vnd.tiddlywiki.mermaid` tiddlers into widget tree |
| Rocklib.getScriptBody | `widget-tools.js` | Extracts raw diagram text from widget parse tree (the fragile part) |
| Rocklib.getOptions | `widget-tools.js` | Merges options from tiddler fields, widget attributes, and referenced data tiddlers |
| Rocklib.getCanvas | `widget-tools.js` | Creates the container `<div>` with unique ID |
| mermaid.min.js | vendor | Mermaid 11.14.0 rendering engine (lazy-loaded) |
| d3.v6.min.js | vendor | Pan/zoom interaction (lazy-loaded alongside mermaid) |

---

## Config Flow — Detailed Trace

### Current flow (as-built, wrapper.js lines 102–111)

```
1. rocklib.getOptions(this, 'mermaid', options)
   ├── reads tiddler fields prefixed 'mermaid-'
   │     e.g. field "mermaid-theme" → options.theme
   │          field "mermaid-flowchart.use-max-width" → options.flowchartUseMaxWidth
   │          (camelCase conversion: 'a.b' → 'aB')
   ├── reads widget attributes (JSON or string)
   │     e.g. <$mermaid theme="forest"> → options.theme = "forest"
   └── reads referenced data tiddler if attribute value == a tiddler title

2. mermaidAPI.initialize({
       startOnLoad: false,
       flowchart: { useMaxWidth: true, htmlLabels: true },  ← HARDCODED, not from options
       securityLevel: 'loose',                              ← HARDCODED, not from options
   })
   NOTE: options from step 1 is built but NOT merged into this call.
   options.theme is available but is never passed to initialize().

3. mermaidAPI.render(svgId, scriptBody) → Promise
   ← No per-call config parameter in Mermaid 11 render()
```

**Critical finding:** `getOptions()` builds an `options` object but `wrapper.js` never uses it for `mermaidAPI.initialize()`. The `theme` attribute on `<$mermaid theme="forest">` is silently ignored. The entire `getOptions()` mechanism is a no-op for rendering configuration in the current codebase.

The `theme` attribute documented in usage.tid and demonstrated in Theme Showcase.tid only works because Mermaid 11 checks `%%{init: {'theme': 'forest'}}%%` inside the diagram source text — the plugin widget attribute `theme=` does nothing at render time.

### Mermaid 11 Config Precedence (official docs)

```
Priority (highest to lowest):
  1. %%{init: {key: value}}%% directive in diagram source  ← PER-DIAGRAM
  2. mermaidAPI.initialize(config)                          ← GLOBAL SITE CONFIG
  3. Default configuration                                  ← BASELINE

'secure' array (cannot be overridden by %%{init}%%):
  ["secure", "securityLevel", "startOnLoad", "maxTextSize",
   "suppressErrorRendering", "maxEdges"]

Implication: securityLevel MUST be set via mermaidAPI.initialize(),
not via diagram frontmatter. This is correct — it is a site-level
security decision, not a per-diagram author decision.
```

**Note on multiple `initialize()` calls:** The current code calls `mermaidAPI.initialize()` on every `render()` call of every widget instance. Mermaid's config system resets and re-initializes cleanly each call, so this does not cause accumulation bugs, but it is wasteful. The correct pattern for Mermaid 11 is to call `initialize()` once with siteConfig and let per-diagram `%%{init}%%` handle per-diagram overrides.

---

## Integration Points for v0.6.0 Config Parity

### What needs to change in wrapper.js

There are two changes needed, both localized to the `render()` method of MermaidWidget.

**Change 1 — Read plugin global config tiddler and merge into initialize():**

Add a new tiddler `$:/plugins/orange/mermaid-tw5/config` (a `.tid` inside the plugin) containing JSON or named fields for global defaults. On first load (when `!mermaidAPI`), read this tiddler to build the siteConfig and call `initialize()` once. On subsequent renders (widget instances after the first), do NOT re-initialize; just call `render()`.

```javascript
// In the !mermaidAPI branch (lazy-load block, wrapper.js ~line 95):
if (!mermaidAPI) {
    // ... existing lazy-load code ...
    var siteConfig = buildSiteConfig();  // NEW: reads config tiddler
    mermaidAPI.initialize(siteConfig);
}
// Remove the mermaidAPI.initialize() call from the per-render path entirely.
```

**Change 2 — buildSiteConfig() helper:**

```javascript
function buildSiteConfig() {
    var defaults = {
        startOnLoad: false,
        securityLevel: 'loose',
        // No hardcoded flowchart.useMaxWidth or htmlLabels
    };
    var configTiddlerTitle = '$:/plugins/orange/mermaid-tw5/config';
    if ($tw.wiki.tiddlerExists(configTiddlerTitle)) {
        var data = $tw.wiki.getTiddlerData(configTiddlerTitle, {});
        // deep merge data into defaults
        for (var k in data) {
            if (Object.prototype.hasOwnProperty.call(data, k)) {
                defaults[k] = data[k];
            }
        }
    }
    return defaults;
}
```

**Change 3 — Per-widget attribute override for non-secure keys:**

For per-widget config that is not in the `secure` array (theme, fontFamily, look, etc.), these can be passed via `%%{init}%%` in the diagram source itself — which is exactly how Theme Showcase.tid already works. No widget-level config injection into `initialize()` is needed for these.

Widget attributes like `theme="forest"` should either:
- (a) Be documented as "use `%%{init}%%` in your diagram source instead", OR
- (b) Be prepended to scriptBody as `%%{init: {'theme': 'forest'}}%%\n` + scriptBody

Option (b) is cleaner for users. It maps naturally: if the widget has a `theme` attribute, inject an init directive. This preserves the per-diagram override semantics Mermaid 11 intends.

### New file: config tiddler

**Location:** `mermaid-tw5/plugins/mermaid-tw5/$__plugins_mermaid-tw5_config.tid`

**Suggested content structure:**

```
title: $:/plugins/orange/mermaid-tw5/config
type: application/json
tags: $:/tags/ControlPanel/Settings

{
    "startOnLoad": false,
    "securityLevel": "loose",
    "theme": "default",
    "look": "classic",
    "fontFamily": "sans-serif"
}
```

Storing as `application/json` means `$tw.wiki.getTiddlerData()` parses it automatically. The user can override this tiddler in their own wiki (shadow tiddler override mechanism) without modifying plugin files.

**Alternatively:** store as named fields (one field per config key). This avoids JSON editing but is less idiomatic for nested config (flowchart.useMaxWidth would need the dot-notation field naming that `getOptions()` already handles via camelCase conversion). JSON is cleaner for nested structures.

### flowchart.useMaxWidth and htmlLabels

These are currently hardcoded at `{ useMaxWidth: true, htmlLabels: true }`. The new approach:

1. Remove hardcoded values from `mermaidAPI.initialize()`.
2. Make them configurable via the config tiddler under a `"flowchart"` key:
   ```json
   { "flowchart": { "useMaxWidth": true, "htmlLabels": true } }
   ```
3. Default values in the config tiddler match the current hardcoded values so existing behavior is preserved.

Users who want `useMaxWidth: false` (fixed-width diagrams) override the config tiddler.

### Mermaid 11 per-type config keys (authoritative, from MermaidConfig interface)

Top-level keys usable in `initialize()` and the config tiddler:

| Key | Type | Notes |
|-----|------|-------|
| `theme` | string | `default`, `base`, `forest`, `dark`, `neutral`, `neo`, `redux` |
| `look` | string | `classic`, `handDrawn`, `neo` |
| `fontFamily` | string | CSS font string |
| `fontSize` | number | px |
| `themeVariables` | object | Fine-grained color overrides |
| `securityLevel` | string | `strict`, `loose`, `antiscript`, `sandbox` — SECURE key |
| `startOnLoad` | boolean | Always `false` in TW — SECURE key |
| `maxTextSize` | number | SECURE key |
| `maxEdges` | number | SECURE key |
| `flowchart` | object | `useMaxWidth`, `htmlLabels`, `curve`, `padding`, etc. |
| `sequence` | object | `diagramMarginX`, `actorMargin`, `useMaxWidth`, etc. |
| `gantt` | object | `numberSectionStyles`, `axisFormat`, `useMaxWidth`, etc. |
| `class` | object | `useMaxWidth`, etc. |
| `state` | object | `useMaxWidth`, etc. |
| `er` | object | `useMaxWidth`, etc. |
| `pie` | object | `useMaxWidth`, `textPosition` |
| `mindmap` | object | `useMaxWidth`, `padding` |
| `timeline` | object | `useMaxWidth` |
| `gitGraph` | object | `useMaxWidth`, `mainBranchName`, etc. |
| `c4` | object | `useMaxWidth` |
| `sankey` | object | `width`, `height`, `useMaxWidth` |
| `xyChart` | object | `useMaxWidth`, etc. |
| `quadrantChart` | object | `useMaxWidth`, etc. |
| `block` | object | `padding` |
| `kanban` | object | `padding`, `useMaxWidth` |
| `packet` | object | `useMaxWidth` |
| `architecture` | object | `useMaxWidth` |

For v0.6.0 "config parity", expose at minimum: `theme`, `look`, `fontFamily`, `securityLevel`, `flowchart`, `sequence`, and the `useMaxWidth` flag for all types (best handled by a top-level `useMaxWidth` if Mermaid honors it, or per-type entries in the config tiddler).

---

## Example Tiddler Structure — Current Conventions

### Two storage formats in use

**Format A — `.tid` file with inline metadata** (used by all new v0.5.0 demo tiddlers):
```
created: 20260430000000000
modified: 20260430000000000
title: Architecture Diagram
type: text/vnd.tiddlywiki

!! Basic example
...
$$$text/vnd.tiddlywiki.mermaid
architecture-beta
    ...
$$$
```

**Format B — Bare content file + `.meta` sidecar** (used by older example tiddlers):
```
# Flowchart (no extension — content-only file)
%%{init: {"theme": "neutral"}}%%
graph RL
    ...
```
```
# Flowchart.meta
created: 20211015021814025
tags: Examples
title: Flowchart
type: text/vnd.tiddlywiki.mermaid
```

**Decision for v0.6.0 advanced examples:** Use Format A exclusively (`.tid` with inline metadata). This is the pattern established by the v0.5.0 demo tiddlers (Architecture Diagram.tid, Kanban Board.tid, Mindmap.tid, etc.) and is simpler to author and review. The `.meta` sidecar format is only needed when content cannot have a metadata header (binary files, or raw mermaid content where you want `type: text/vnd.tiddlywiki.mermaid` on a bare-syntax tiddler).

### Content pattern established by v0.5.0 demo tiddlers

Every v0.5.0 diagram-type tiddler follows this pattern (from Architecture Diagram.tid, Kanban Board.tid, Mindmap.tid):

```
created: 20260430000000000
modified: 20260430000000000
title: [Diagram Type Name]
type: text/vnd.tiddlywiki

[One-sentence description]. Use it for [use cases]. [New in Mermaid 11 note if applicable.]

---

!! Basic example

```[code block showing syntax]```

$$$text/vnd.tiddlywiki.mermaid
[basic diagram source]
$$$

---

!! Real-world example: [descriptive subtitle]

```[code block showing syntax]```

$$$text/vnd.tiddlywiki.mermaid
[real-world diagram source]
$$$

---

!! Syntax

[Syntax reference table or code block]

!! Tips

* [Tip 1]
* [Tip 2]

[[← Mermaid Chart Catalog]]
```

**Advanced examples for v0.6.0 should extend this pattern** by adding a third section:

```
!! Advanced: [Feature being demonstrated]

[Prose explanation of what makes this advanced — e.g., %%{init}%% config, themeVariables,
 accTitle/accDescr, subgraphs, classDef styling, etc.]

```[code block]```

$$$text/vnd.tiddlywiki.mermaid
[advanced diagram source with inline comments using %% syntax]
$$$
```

### Naming convention for advanced example tiddlers

The 20 existing diagram-type tiddlers are named descriptively (title case, no prefix):
- `Flowchart`, `Mindmap`, `Architecture Diagram`, `Kanban Board`, `Sankey Diagram`, etc.

These are the correct landing pages. Do NOT create parallel `Advanced Flowchart` tiddlers — instead, **add the advanced section directly to the existing diagram-type tiddler**. This keeps navigation simple (one tiddler per type) and avoids duplicate landing pages.

For tiddlers that do not yet exist as `.tid` files (older format B tiddlers: `sequenceDiagram 1`, `Class diagrams`, `stateDiagram 1`, `Gantt 1`, `Gitgraph Diagram 1`, `Defining Relationship`, `Pie chart diagrams`, `Requirement Diagram`, `C4 Diagram`, `User Journey Diagram`), migrate them to Format A `.tid` files while adding the advanced section.

### Tagging strategy

Current state: The v0.5.0 demo tiddlers have **no tags**. The older example tiddlers use `tags: Examples`. The `Mermaid Test All Diagrams.tid` uses `tags: [[mermaid test]]`.

For v0.6.0 advanced examples, establish a consistent tagging scheme:

| Tag | Purpose |
|-----|---------|
| `MermaidExample` | Applied to every diagram-type example tiddler (both basic and advanced) |
| `MermaidAdvanced` | Applied only to tiddlers that include an advanced section |

This enables a `<<list-links filter:"[tag[MermaidExample]]">>` Table of Contents and a filtered `<<list-links filter:"[tag[MermaidAdvanced]]">>` for the capability matrix.

The `Mermaid Test All Diagrams.tid` keeps its `[[mermaid test]]` tag (test harness, separate concern).

### Table of Contents tiddler

The existing `Mermaid Chart Catalog.tid` is already the canonical navigation hub. It links to all 20 diagram types in categorized tables. For v0.6.0:

1. Add a "Configuration" section to the catalog linking to the new config reference tiddler.
2. Add a "Capability Matrix" link.
3. Do NOT replace the catalog with a tag-based auto-list — the manual categorized table is more useful for navigation.

### Capability Matrix doc

**Location:** `mermaid-tw5/tiddlers/Mermaid Capability Matrix.tid` (demo wiki) AND a section in `README.md`.

**Why both:** The tiddler is the authoritative interactive view; the README section serves GitHub visitors who do not load the demo wiki. Keep them in sync manually — the matrix is small enough (~20 rows × 4 columns) that duplication is acceptable.

**Structure:**

```
title: Mermaid Capability Matrix
type: text/vnd.tiddlywiki
tags: MermaidExample

!! Supported diagram types

| Diagram | Status | Notes |
|---------|--------|-------|
| flowchart | Full | |
| sequenceDiagram | Full | |
| ...20 types... |

!! Deferred features (no extra assets)

| Feature | Reason deferred | Status |
|---------|----------------|--------|
| ELK layout | Requires @mermaid-js/layout-elk extra bundle | Deferred |
| KaTeX math | Requires katex extra bundle | Deferred |
| ZenUML | Requires @mermaid-js/parser extra bundle | Deferred |
| Icon packs | Requires additional asset URL | Deferred |
```

The matrix tiddler itself does not need to be inside the plugin (it is documentation, not functionality). It lives in `mermaid-tw5/tiddlers/` alongside the other demo tiddlers and is included in the `docs/index.html` build automatically.

---

## getScriptBody() Fragility — Advanced Syntax Risks

### How getScriptBody works

`widget-tools.js` lines 15-53. It tries to un-parse the WikiText parse tree that TiddlyWiki builds from `<$mermaid text="...">` widget content. It walks the parse tree nodes:

- `type: 'text'` → append `kk.text` directly (safe)
- `type: 'link'` → converts `[[foo]]` to `#foo` (intentional TW integration)
- `type: 'entity'` → only handles `&ndash;` → `--` (the `--` arrow case)
- `type: 'element'` with `tag: 'a'` → appends link text (fallback for external links)

All other parse tree node types are silently dropped.

### Why advanced syntax examples must use $$$...$$$ or typed-tiddler format

The `<$mermaid text="...">` widget path goes through WikiText parsing before `getScriptBody()`. The `$$$text/vnd.tiddlywiki.mermaid` block syntax bypasses WikiText parsing entirely — the raw text is passed directly as `element.text` in `typed-parser.js`, which becomes `src.parseTreeNode.text` in `getScriptBody()`, hitting the early return at line 18: `if (src.parseTreeNode.text) { scriptBody = src.parseTreeNode.text; }`.

**All advanced examples should use `$$$text/vnd.tiddlywiki.mermaid`... `$$$` block syntax**, not the `<$mermaid text="...">` widget. This completely sidesteps getScriptBody's fragility.

### Specific syntax elements that break the widget path

| Mermaid Syntax | WikiText Interpretation | Result |
|----------------|------------------------|--------|
| `A-->B` (double dash) | `--` → `&ndash;` entity | getScriptBody handles this one case |
| `A---B` (triple dash) | `---` → horizontal rule | Parse tree gets `<hr>` element — **dropped** |
| `<br/>` in node labels | WikiText parses as HTML element | element node, only `<a>` handled — **dropped** |
| `<span>` in htmlLabels | Parsed as HTML | **dropped** |
| `%%{init: ...}%%` directive | `%%` is not special in WikiText | Likely passed through as text nodes — OK |
| `%%` comments | Same — likely OK as text | Should be safe |
| `"label text"` with quotes | In `text=` attribute, `"` terminates the attribute | **Fatal**: must use `"""` triple-quote or single-quote wrapping |
| Multi-line YAML frontmatter | Line breaks → multiple text nodes | Concatenated OK if only text nodes |
| `classDef fill:#fff` | `#` is not special in this context | OK in text nodes |
| `click nodeId callback` | Parsed as text | OK |
| `[["Title"|Link]]` TW links | Parsed as TW link node → `#Title` | Breaks diagram link syntax |
| `style A fill:#f9f,stroke:#333` | `#f9f` with comma — text OK | Should be safe as text node |
| `subgraph` keyword | Plain text | Safe |
| `%%{init: {'look': 'handDrawn'}}%%` | `{` `}` not special in TW | Safe as text node |

**Verdict:** The widget path (`<$mermaid text="...">`) is safe only for simple diagrams. The `$$$` block syntax is safe for all diagram content including advanced features with `%%{init}%%`, classDef, click, style, multi-line strings, `---` separators, and HTML-in-labels.

### Minimal hardening of getScriptBody (if widget path must be supported)

If the team wants `<$mermaid>` to support advanced syntax in future:

1. Add handling for `type: 'element'` with `tag: 'hr'` → emit `---`
2. Add handling for `type: 'element'` with arbitrary tags → emit raw tag string
3. Add handling for multi-entity sequences (e.g., `&lt;br/&gt;` → `<br/>`)

But this is complex and brittle. The cleaner recommendation is: document `$$$` as the required syntax for any diagram more complex than a simple graph, which is already the troubleshooting advice in `usage.tid`.

---

## Demo Build / Deploy — How Tiddlers Enter docs/index.html

The CI/CD pipeline is in `.github/workflows/deploy.yml`:

```
push to main
  → node --test (tests)
  → tiddlywiki mermaid-tw5 --build index
  → cp mermaid-tw5/output/index.html docs/index.html
  → git commit + push
```

`tiddlywiki mermaid-tw5 --build index` reads `mermaid-tw5/tiddlywiki.info` for the build recipe. All files in `mermaid-tw5/tiddlers/` are included in the build automatically by TiddlyWiki's default edition loading. Adding a new `.tid` file to `mermaid-tw5/tiddlers/` is all that is needed for it to appear in the demo wiki on the next push to main.

Plugin files in `mermaid-tw5/plugins/mermaid-tw5/` are also included by default (the edition references the plugin directory). Adding a new tiddler inside the plugin directory (e.g., the config tiddler) requires its title to be listed in `plugin.info`'s `"list"` field if it is a documentation tiddler, or it is picked up automatically if it is a JavaScript module-type tiddler.

**No changes to the CI/CD pipeline are needed for v0.6.0.** New `.tid` files and new plugin files are picked up automatically by the existing build.

---

## Recommended Project Structure for v0.6.0 Changes

```
mermaid-tw5/
├── plugins/mermaid-tw5/
│   ├── $__plugins_mermaid-tw5_wrapper.js           ← MODIFIED
│   │     - Move mermaidAPI.initialize() into !mermaidAPI lazy-load block
│   │     - Add buildSiteConfig() reading config tiddler
│   │     - Add theme/look/fontFamily attribute → %%{init}%% injection
│   │     - Remove hardcoded flowchart block
│   ├── $__plugins_mermaid-tw5_config.tid            ← NEW (plugin shadow tiddler)
│   │     - type: application/json
│   │     - Default global config (securityLevel, theme, look, flowchart, etc.)
│   │     - User overrides this tiddler in their own wiki
│   ├── $__plugins_mermaid-tw5_usage.tid             ← MODIFIED
│   │     - Document config tiddler approach
│   │     - Document widget attributes for theme/look/fontFamily
│   │     - Document %%{init}%% directive support
│   └── plugin.info                                  ← MODIFIED (add config to list)
│
└── tiddlers/
    ├── [20 existing diagram type tiddlers]          ← MODIFIED (add advanced sections + tags)
    │     Architecture Diagram.tid, Kanban Board.tid, Mindmap.tid, etc.
    │     + migrate Format B tiddlers (sequenceDiagram 1, etc.) to Format A .tid
    ├── Mermaid Capability Matrix.tid                ← NEW
    ├── Mermaid Configuration Reference.tid          ← NEW
    │     - Documents config tiddler keys
    │     - Documents widget attributes
    │     - Documents %%{init}%% directive
    └── Mermaid Chart Catalog.tid                    ← MODIFIED
          - Add Config Reference and Capability Matrix links
```

---

## Architectural Patterns

### Pattern 1: Shadow Tiddler for Plugin Defaults

**What:** Plugin ships a tiddler inside the plugin bundle (`$:/plugins/.../config`). User can override it in their own wiki by creating a non-shadow tiddler with the same title. TiddlyWiki resolves non-shadow over shadow automatically.

**When to use:** Any plugin default that users might legitimately want to change without forking the plugin.

**This is the right pattern for the config tiddler.** It avoids any UI/form complexity while providing full configurability to power users.

### Pattern 2: Directive Injection for Per-Widget Config

**What:** If a widget attribute (e.g., `theme="forest"`) is present, prepend `%%{init: {'theme': 'forest'}}%%\n` to `scriptBody` before passing to `mermaidAPI.render()`.

**When to use:** When per-diagram config must be set from widget markup rather than inside the diagram source itself.

**Trade-offs:**
- Simple to implement (string prepend)
- Works with Mermaid 11's precedence system correctly (frontmatter > siteConfig)
- Does not work for secure keys (securityLevel cannot be injected this way — it must come from `initialize()`)
- Cannot handle deeply nested config (flowchart.useMaxWidth) cleanly via a single attribute

**For v0.6.0:** Support `theme`, `look`, and `fontFamily` as widget attributes using this pattern. All other per-type config should go in the config tiddler.

### Pattern 3: Single Initialize on Lazy Load

**What:** Call `mermaidAPI.initialize(buildSiteConfig())` exactly once, inside the `if (!mermaidAPI)` branch. Never call it again on subsequent widget renders.

**When to use:** Mermaid 11 intends `initialize()` to be called once per page load to set siteConfig. Calling it repeatedly on every render is wastes CPU and risks race conditions with concurrent renders.

**Trade-offs:**
- If the user modifies the config tiddler after page load, they must reload the page to see the effect (this is acceptable — same as CSS changes)
- Simpler, more correct

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Calling initialize() on every widget render

**What people do:** The current code calls `mermaidAPI.initialize({ securityLevel: 'loose', ... })` inside `MermaidWidget.prototype.render()`, so it runs every time any diagram is rendered on the page.

**Why it's wrong:** Mermaid 11's siteConfig is meant to be set once. Re-initializing per-render is wasteful. If multiple widgets render concurrently (e.g., a tiddler with 10 diagrams), there is a potential for the last `initialize()` call to set config that races with in-flight renders.

**Do this instead:** Move `initialize()` into the lazy-load block that already guards `if (!mermaidAPI)`.

### Anti-Pattern 2: Using `<$mermaid text="...">` for advanced diagrams

**What people do:** Writing complex Mermaid syntax (with `---`, `<br/>`, `<span>`, `%%{init}%%`) inside the `text=` attribute of the widget.

**Why it's wrong:** TiddlyWiki pre-parses the attribute content as WikiText before the widget sees it. `getScriptBody()` tries to reverse this but only handles a few cases. `---` becomes an `<hr>` element and is silently dropped. HTML elements other than `<a>` are dropped. Complex attribute quoting (`"` terminates the attribute) prevents multi-line content.

**Do this instead:** Use `$$$text/vnd.tiddlywiki.mermaid` / `$$$` delimiters for any non-trivial diagram. Document this in the advanced example tiddlers explicitly.

### Anti-Pattern 3: Storing config as plain tiddler fields with dot notation

**What people do:** Using `getOptions()` with tiddler fields like `mermaid-flowchart.use-max-width: true` to pass nested config.

**Why it's wrong:** The camelCase conversion in `getOptions()` converts `flowchart.use-max-width` → `flowchartUseMaxWidth` (a flat key), not `flowchart: { useMaxWidth: true }` (the nested structure Mermaid expects). The result would be `options.flowchartUseMaxWidth = true`, which Mermaid ignores.

**Do this instead:** Use a JSON data tiddler for structured config (`type: application/json`) so nested objects serialize correctly.

---

## Integration Points Summary

| Integration Point | File | Line(s) | Action |
|-------------------|------|---------|--------|
| Hardcoded `securityLevel: 'loose'` | `wrapper.js` | 107–111 | Move to config tiddler default; read from tiddler |
| Hardcoded `flowchart: { useMaxWidth, htmlLabels }` | `wrapper.js` | 108–109 | Remove; move to config tiddler with same defaults |
| `mermaidAPI.initialize()` call location | `wrapper.js` | 107 | Move inside `if (!mermaidAPI)` block at line 95 |
| `buildSiteConfig()` function | `wrapper.js` | NEW | Add above `MermaidWidget` definition |
| Widget attribute → `%%{init}%%` injection | `wrapper.js` | ~134 | Add before `mermaidAPI.render()` call |
| Config tiddler (plugin default) | plugin dir | NEW | `$__plugins_mermaid-tw5_config.tid` |
| `plugin.info` list field | `plugin.info` | `"list"` | Add `config` to the list |
| Example tiddlers — tags | `tiddlers/*.tid` | metadata | Add `MermaidExample` tag; `MermaidAdvanced` for advanced |
| Capability Matrix | `tiddlers/` | NEW | `Mermaid Capability Matrix.tid` |
| Config Reference | `tiddlers/` | NEW | `Mermaid Configuration Reference.tid` |
| Chart Catalog — nav links | `tiddlers/Mermaid Chart Catalog.tid` | bottom | Add Config and Matrix links |

---

## Suggested Build Order for v0.6.0

### Phase 1 — Config parity (wrapper.js changes only)

1. Add `buildSiteConfig()` to wrapper.js reading the config tiddler
2. Move `mermaidAPI.initialize()` into the `!mermaidAPI` block
3. Remove hardcoded `flowchart` block; put its defaults in the config tiddler
4. Create `$__plugins_mermaid-tw5_config.tid` with JSON defaults
5. Add widget attribute → `%%{init}%%` injection for `theme`, `look`, `fontFamily`
6. Update `plugin.info` list to include `config`
7. Update `$__plugins_mermaid-tw5_usage.tid` with new config documentation

**Test gate:** Existing 13 tests pass. Manual test: `<$mermaid theme="forest">` renders in forest theme. Manual test: config tiddler override changes global theme.

### Phase 2 — Advanced examples

8. Audit the 10 older Format B tiddlers (sequenceDiagram 1, Class diagrams, etc.) — migrate to Format A `.tid` if adding advanced sections
9. For each of the 20 diagram types, add an advanced section using `$$$...` syntax demonstrating: `%%{init}%%` config, type-specific options (e.g., `accTitle`/`accDescr`, `classDef`, `click`, `%%` comments)
10. Add `MermaidExample` and `MermaidAdvanced` tags
11. Each advanced section must explicitly show the `%%{init}%%` approach (not widget attribute), since that's what actually works reliably

**Test gate:** All 20 diagram type tiddlers render in demo build. No getScriptBody-related rendering failures.

### Phase 3 — Capability Matrix and Config Reference

12. Create `Mermaid Capability Matrix.tid`
13. Create `Mermaid Configuration Reference.tid`
14. Update `Mermaid Chart Catalog.tid` with navigation links
15. Update `README.md` with capability matrix section

**Test gate:** Demo build includes all new tiddlers. README accurate.

---

## Sources

- Source code (read directly): `wrapper.js`, `widget-tools.js`, `typed-parser.js`
- Example tiddlers (read directly): Architecture Diagram.tid, Kanban Board.tid, Mindmap.tid, Mermaid Chart Catalog.tid, Mermaid Test All Diagrams.tid, Theme Showcase.tid
- Build pipeline (read directly): `.github/workflows/deploy.yml`, `.github/workflows/test.yml`
- Codebase map (read directly): `.planning/codebase/ARCHITECTURE.md`, `STRUCTURE.md`, `CONCERNS.md`, `CONVENTIONS.md`
- Mermaid 11 configuration API: https://mermaid.js.org/config/configuration (MEDIUM confidence — page incomplete; supplemented by MermaidConfig interface page)
- MermaidConfig interface: http://mermaid.js.org/config/setup/mermaid/interfaces/MermaidConfig.html (HIGH confidence — authoritative type definitions)
- Mermaid secure keys behavior: https://mermaid.js.org/config/usage (HIGH confidence — confirmed securityLevel is in default secure array)

---

*Architecture research for: mermaid-tw5 v0.6.0 — Config Parity & Advanced Examples*
*Researched: 2026-06-07*
