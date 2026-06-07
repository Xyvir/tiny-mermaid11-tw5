# Project Research Summary

**Project:** mermaid-tw5 — v0.6.0 Capability Parity & Advanced Examples
**Domain:** TiddlyWiki 5 plugin — Mermaid.js 11.14.0 configuration + diagram examples
**Researched:** 2026-06-07
**Confidence:** HIGH

## Executive Summary

The v0.6.0 milestone is a two-part deliverable: fix a silent configuration bug that has been defeating widget-level config since the plugin was written, then ship a high-quality advanced example for every diagram type the vendored bundle supports. Research confirms the vendored Mermaid 11.14.0 bundle renders exactly 26 user-facing diagram types without any extra assets. The configuration surface is fully documented in Mermaid's JSON schema, and all keys needed for "parity" are available — but today they are silently ignored because `getOptions()` builds an options object that is never merged into `mermaidAPI.initialize()`. Fixing that single wiring problem (~20–30 lines in `wrapper.js`) is the technical foundation for the entire config-parity goal.

The recommended build order is: fix the config bug first (Phase 1), then produce all advanced examples and supporting docs (Phase 2), then close out with the capability matrix and navigation updates (Phase 3). This order is forced by a hard dependency: advanced examples that demonstrate `theme`, `look`, `fontFamily`, and `securityLevel` cannot prove those features work until the `getOptions()` merge is in place. Additionally, one existing example (`Sankey Diagram.tid`) contains a node named `R&D` that causes a hard parse error in Mermaid 11.12+ and must be fixed before or during Phase 1.

Key risks are well-understood and all mitigatable. The `getScriptBody()` WikiText un-parser is fragile for complex Mermaid syntax, but the `$$$text/vnd.tiddlywiki.mermaid` block syntax is a complete and safe alternative — all advanced examples must use it exclusively. Mermaid has no generic native legend (upstream issue #2110 closed unimplemented); the recommended pattern is a WikiText table below the diagram. `securityLevel` is a Mermaid "secure key" — only settable via `initialize()`, not `%%{init}%%` — and the plugin's `'loose'` default is required to keep TiddlyWiki click navigation functional.

---

## Key Findings

### Stack: Vendored Bundle Scope (from STACK.md)

The vendored `mermaid.min.js` (3,165,091 bytes, dated 2026-04-28) contains exactly **26 user-facing diagram types** verified by bundle grep of detector regex patterns. All 26 render without extra assets. The count is 26 — not the previously estimated 20 — because Wardley Maps, TreeView, and Treemap were all confirmed added in Mermaid 11.14.0.

**In-scope — 26 diagram types:**

| # | Type | Canonical Keyword | Notes |
|---|------|-------------------|-------|
| 1 | Flowchart | `flowchart` | `graph` is legacy alias |
| 2 | Sequence Diagram | `sequenceDiagram` | |
| 3 | Class Diagram | `classDiagram` | `classDiagram-v2` also works |
| 4 | State Diagram | `stateDiagram-v2` | |
| 5 | Entity Relationship | `erDiagram` | |
| 6 | User Journey | `journey` | |
| 7 | Gantt | `gantt` | |
| 8 | Pie Chart | `pie` | Native legend included |
| 9 | Quadrant Chart | `quadrantChart` | |
| 10 | Requirement Diagram | `requirementDiagram` | |
| 11 | Git Graph | `gitGraph` | |
| 12 | C4 Diagram | `C4Context` / C4 variants | |
| 13 | Mindmap | `mindmap` | |
| 14 | Timeline | `timeline` | |
| 15 | Sankey | `sankey-beta` | **Bug:** existing `R&D` node breaks 11.12+; fix in Phase 1 |
| 16 | XY Chart | `xychart-beta` | |
| 17 | Block Diagram | `block-beta` | |
| 18 | Packet Diagram | `packet-beta` | |
| 19 | Kanban | `kanban` | No beta suffix |
| 20 | Architecture | `architecture-beta` | Built-in icons only: `blank`, `cloud`, `database`, `disk`, `internet`, `server` |
| 21 | Radar Chart | `radar-beta` | Beta suffix required; native legend via `showLegend` |
| 22 | Venn Diagram | `venn-beta` | Beta suffix required |
| 23 | Ishikawa (Fishbone) | `ishikawa-beta` | Both keywords accepted |
| 24 | Treemap | `treemap-beta` | Both keywords accepted |
| 25 | TreeView | `treeView-beta` | camelCase V; beta suffix required |
| 26 | Wardley Map | `wardley-beta` | Beta suffix required; case-insensitive |

**Out-of-scope — deferred, require extra assets:**

| Feature | Reason | Missing Asset |
|---------|--------|---------------|
| ELK layout (`flowchart-elk`) | Removed from Mermaid core in v11; bundle emits warning | `@mermaid-js/layout-elk` |
| ZenUML | Zero hits in vendored bundle; absent from Mermaid 11.14.0 | `@mermaid-js/mermaid-zenuml` |
| External icon packs (Architecture) | Requires `registerIconPacks()` + CDN/Iconify data | Iconify bundle |
| Event Modeling | Does not exist in Mermaid 11.14.0 (not yet released) | N/A |

**On KaTeX:** KaTeX is already present in the vendored bundle for inline math in text labels. It is NOT a separate diagram type and is NOT a blocker. Math in labels works today without any additional asset.

---

### Config Parity: The Critical Bug and Fix (from FEATURES.md + ARCHITECTURE.md)

**The bug (confirmed by both feature and architecture researchers):**

`getOptions()` in `widget-tools.js` collects user config from tiddler fields (e.g., `mermaid-theme`, `mermaid-font-family`) and widget attributes (e.g., `<$mermaid theme="forest">`). This produces an `options` object. However, `wrapper.js` calls `mermaidAPI.initialize()` with a hardcoded config object and never merges `options` into it. Every tiddler-field and widget-attribute config setting is silently ignored. The `theme` attribute documented in `usage.tid` and shown in `Theme Showcase.tid` only appears to work because those tiddlers use `%%{init: {'theme': 'forest'}}%%` inside the diagram source — the widget attribute does nothing.

Additionally, `mermaidAPI.initialize()` is called on every widget render, which is wasteful and creates a race condition when multiple diagrams on one page use different configs (last-call wins).

**The fix — localized to `wrapper.js`, ~20–30 lines:**

1. Move `mermaidAPI.initialize()` into the `if (!mermaidAPI)` lazy-load block so it runs once per page load.
2. Add `buildSiteConfig()` that reads a new JSON shadow tiddler (`$:/plugins/orange/mermaid-tw5/config`) and merges it into the initialize call. Users override this tiddler in their own wiki without touching plugin files (standard TW shadow tiddler pattern).
3. For per-widget non-secure keys (`theme`, `look`, `fontFamily`): inject a `%%{init: {…}}%%` directive prepended to `scriptBody` before `mermaidAPI.render()`. This correctly maps to Mermaid 11's per-diagram override system.
4. Keep `startOnLoad: false` hardcoded always.

**`securityLevel` specifics:**

`securityLevel` is in Mermaid's secure array — it cannot be overridden by `%%{init}%%` or YAML frontmatter. It MUST be set via `mermaidAPI.initialize()`. The plugin's default `'loose'` is required for TiddlyWiki click navigation (INTERACT-02). Exposing it via the config shadow tiddler gives site owners control. Per-widget override via attribute also feeds through `initialize()`, not through diagram text.

| Level | Click handlers | Recommended for |
|-------|---------------|-----------------|
| `'loose'` (default) | YES | Personal TW notebooks |
| `'antiscript'` | YES (JS callbacks may fail — issue #5944) | Semi-trusted authors |
| `'strict'` | NO — breaks INTERACT-02 | Public/shared TW instances |
| `'sandbox'` | NO — breaks TW nav entirely | Fully untrusted content |

---

### Features: Must Have, Should Have, Defer (from FEATURES.md)

**Must have (table stakes for "config parity"):**
- Fix `getOptions()` → `initialize()` merge — foundational; nothing else works without this
- `securityLevel` configurable via config tiddler / widget attr
- `theme`, `themeVariables`, `look` (including `handDrawn`), `fontFamily` working and documented
- `%%{init}%%` and YAML frontmatter documentation with examples
- `accTitle` / `accDescr` accessibility syntax documented
- `classDef`, `style`, `linkStyle`, `:::` styling guide
- Advanced example tiddler for all 26 in-scope diagram types (using `$$$` block syntax)
- Manual legend pattern documented
- Capability matrix tiddler

**Should have (differentiators):**
- `handDrawnSeed` pattern for reproducible hand-drawn diagrams
- `deterministicIds` / `deterministicIDSeed` documentation
- `suppressErrorRendering` wired up

**Defer to v0.7.0+:**
- Nested per-type config via tiddler fields (naming convention ambiguity; `%%{init}%%` is adequate)
- ELK layout, ZenUML, external icon packs (extra assets required by design)
- Generic native legend (upstream issue #2110 permanently closed; will not arrive)

---

### Architecture Approach (from ARCHITECTURE.md)

All v0.6.0 changes are confined to `wrapper.js` (config wiring), a new shadow config tiddler, and `tiddlers/` (example and doc tiddlers). The CI/CD pipeline picks up new `.tid` files automatically — no pipeline changes needed.

**Component responsibilities:**

1. `wrapper.js` (MermaidWidget) — DOM creation, one-time config init via `buildSiteConfig()`, render, D3 zoom — **MODIFIED in Phase 1**
2. `widget-tools.js` (Rocklib) — `getOptions()`, `getScriptBody()`, `getCanvas()` — `getOptions()` result now consumed; no structural changes
3. `typed-parser.js` (MermaidParser) — routes `text/vnd.tiddlywiki.mermaid` to widget tree — **no changes needed**
4. `$__plugins_mermaid-tw5_config.tid` — new JSON shadow tiddler for global defaults (overridable by users) — **NEW in Phase 1**
5. 26 example tiddlers in `mermaid-tw5/tiddlers/` — advanced sections, tags, Format B migration — **NEW/MODIFIED in Phase 2**
6. `Mermaid Capability Matrix.tid`, `Mermaid Configuration Reference.tid` — new docs tiddlers — **NEW in Phase 3**

**Safe authoring convention — mandatory for all advanced examples:**

All advanced example tiddlers must use `$$$text/vnd.tiddlywiki.mermaid` ... `$$$` block syntax. Widget body mode (`<$mermaid>…</$mermaid>`) runs through the full TiddlyWiki WikiText parser before `getScriptBody()`, which silently corrupts or drops these Mermaid syntax elements:

| Mermaid Syntax | Widget Body Result |
|----------------|-------------------|
| `---` (triple dash) | Parsed as `<hr>`, silently dropped |
| `<br/>`, `<span>`, HTML in labels | HTML element nodes, dropped |
| `[[text]]` | TW link node, becomes `#text` |
| `\|label\|` edge labels | Can trigger WikiText table parsing |
| `"quoted"` in `text=` attribute | Terminates attribute boundary |

The `$$$` block bypasses all of this: `typed-parser.js` stores the raw text in `parseTreeNode.text`, which `getScriptBody()` returns immediately without any child-walking.

**Legend strategy:**

Mermaid has no generic native legend (issue #2110 closed unimplemented). Only `pie` (auto) and `radar` (`showLegend` keyword) have native legends. The recommended canonical pattern for all other types is a **WikiText table below the diagram** — not an in-diagram subgraph, because subgraph legends cause Dagre layout distortion and `classDef` does not apply to subgraph containers (only to nodes). A disconnected subgraph legend is acceptable for simple diagrams when documented with `rankSpacing` tuning.

---

### Critical Pitfalls (from PITFALLS.md)

1. **`getOptions()` result never reaches `initialize()`** — all tiddler-field and widget-attr config silently ignored today. The fix is the Phase 1 foundation. Without it, every config-parity deliverable is invisible to users. (Phase 1)

2. **`securityLevel` cannot be overridden via `%%{init}%%`** — it is in Mermaid's secure array. Putting it in a diagram directive has no effect and no error. Config-parity must route it through `initialize()`. Click-handler examples must document this. (Phase 1)

3. **Widget body mode mangles advanced syntax** — `---`, `<`, `>`, `[[…]]`, and `|` are corrupted or dropped. All 26 advanced examples must use `$$$` block syntax. (Phase 2)

4. **Sankey `R&D` node name** — `&` in a Sankey node name causes a hard parse error in Mermaid 11.12+ (issue #7528). The existing `Sankey Diagram.tid` is broken. Must be fixed before Phase 2 Sankey example work. (Phase 1 bug fix)

5. **No native generic legend** — upstream issue #2110 permanently closed. Subgraph legend pattern causes layout distortion; `classDef` silently fails on subgraph containers. Canonical recommendation: WikiText table below diagram. Document once in Phase 1 docs; apply in Phase 2 examples. (Phase 1 + 2)

6. **`initialize()` called per-render, last-write-wins** — current code calls `initialize()` on every widget render; multiple diagrams on one page with different theme configs interfere. Fix: move to one-time call in lazy-load block. (Phase 1)

7. **`%%{init}%%` theme override of plugin config** — for non-secure keys, `%%{init}%%` inside diagram source takes precedence over `initialize()`. Advanced examples must not hardcode `%%{init}%%` theme directives — this would override user's plugin config setting. Reserve `%%{init}%%` for structural per-type config (e.g., `gantt.barHeight`), not theme. (Phase 2 policy)

---

## Implications for Roadmap

Suggested phase structure: **3 phases**

### Phase 1: Config Fix + Authoring Foundation

**Rationale:** The `getOptions()` → `initialize()` wiring bug means widget attrs and tiddler fields have been silently no-ops since the plugin was written. All milestone config-parity work depends on this landing first. Also fixes the Sankey `R&D` bug that would block Phase 2 Sankey example authoring.

**Delivers:**
- Working `theme`, `look`, `fontFamily`, `securityLevel` via tiddler fields and widget attrs
- Shadow config tiddler (`$:/plugins/orange/mermaid-tw5/config`) for global defaults
- Widget attribute → `%%{init}%%` injection for per-diagram non-secure config
- One-time `initialize()` on lazy load (correctness + performance)
- `renderAsync` guard added to wrapper.js
- Sankey `R&D` node bug fixed
- `usage.tid` updated documenting new config approach

**Addresses (from FEATURES.md):** CONFIG-PARITY-01 (options merge), SEC-01 (securityLevel configurable), LOOK-01 (theme/look/fontFamily wired)

**Avoids (from PITFALLS.md):** Pitfalls 1, 2, 4, 6 — config silent failure, securityLevel `%%{init}%%` confusion, Sankey parse error, per-render initialize race

**Files changed:** `wrapper.js` (primary), new `$__plugins_mermaid-tw5_config.tid`, `plugin.info`, `Sankey Diagram.tid`, `usage.tid`

**Test gate:** All 13 existing tests pass. `<$mermaid theme="forest">` renders in forest theme. Config tiddler override changes global theme. Sankey diagram renders cleanly. `renderAsync` guard present.

**Research flag:** Standard patterns — skip phase research. `wrapper.js` changes fully specified in ARCHITECTURE.md with exact line numbers and pseudocode.

---

### Phase 2: Advanced Examples (26 Diagram Types)

**Rationale:** Content-heavy phase that can only begin after Phase 1 (config examples need working config; Sankey needs the R&D bug fixed). Ten older Format B tiddlers (`.meta` sidecar format) need migration to Format A `.tid` during this phase.

**Delivers:**
- Advanced sections added to all 26 diagram-type tiddlers using `$$$` block syntax exclusively
- Format B → Format A `.tid` migration for 10 older tiddlers
- `MermaidExample` and `MermaidAdvanced` tags applied consistently to all example tiddlers
- Legend pattern documented and demonstrated (WikiText table preferred; subgraph acceptable with documented caveats)
- Policy: no `%%{init}%%` theme directives in examples; structural per-type config only

**Addresses (from FEATURES.md):** EXAMPLES-01 (26 advanced example tiddlers), LEGEND-01 (legend patterns), A11Y-01 (accTitle/accDescr in examples)

**Avoids (from PITFALLS.md):** Pitfalls 3, 5, 6, 7, 8, 11, 12 — widget body mangling, legend subgraph distortion, classDef on subgraph, theme override policy

**Per-type top syntax gotchas to address:**
- flowchart: quote labels containing `end`, `<`, `>`, `|`, `--`
- erDiagram: relationship label required; `$$$` mandatory for `---` lines
- classDiagram: avoid nested generics with commas (`~Map<K,V>~` is parse error)
- stateDiagram-v2: avoid colons in state labels
- gantt: set both `dateFormat` AND `axisFormat` explicitly
- sankey-beta: node names must not contain `'`, `&`, `/`, `-`
- radar-beta: axis value count must exactly match axis count
- mindmap: spaces only for indentation, never tabs
- timeline: no colons in event labels
- architecture-beta: declare services before edges
- block-beta: close every `block` with `end`

**Test gate:** All 26 diagram types render in demo TW (browser test, not just Mermaid live editor). No `getScriptBody`-related failures. No examples include `securityLevel`, `startOnLoad`, or `maxTextSize` in `%%{init}%%` directives.

**Research flag:** Newer beta types (treeView-beta, wardley-beta, ishikawa-beta, treemap-beta, venn-beta) have minimal official documentation. Consider using `gsd-plan-phase --research-phase 2` to investigate syntax edge cases for these 5 types before authoring their examples.

---

### Phase 3: Capability Matrix and Navigation

**Rationale:** Closes the milestone with documentation that prevents user confusion about deferred features and provides a navigation hub for the expanded example library. Cannot begin until Phase 2 examples exist (matrix links to them).

**Delivers:**
- `Mermaid Capability Matrix.tid` — 26 in-scope types, deferred features (ELK, ZenUML, icon packs, Event Modeling) with rationale
- `Mermaid Configuration Reference.tid` — global + per-type config key tables, field naming convention, `%%{init}%%` guide, YAML frontmatter guide, accessibility guide, styling guide
- `Mermaid Chart Catalog.tid` updated — "Configuration" and "Capability Matrix" navigation links added
- `README.md` updated with capability matrix section

**Addresses (from FEATURES.md):** MATRIX-01 (capability matrix), DOCS-CONFIG-01 (config reference)

**Test gate:** Demo build includes all new tiddlers. README is accurate. Matrix lists all 26 in-scope types and all deferred features with rationale.

**Research flag:** Standard patterns — skip phase research. Content is fully specified in research files.

---

### Phase Ordering Rationale

- Phase 1 must precede Phase 2: config examples need working config wiring; Sankey example needs the R&D bug fixed; all 26 advanced examples demonstrating config features require Phase 1 to be meaningful.
- Phase 2 must precede Phase 3: the capability matrix links to all 26 example tiddlers, which must exist first.
- No build pipeline changes are needed across any phase — CI/CD picks up new `.tid` files automatically, which keeps all three phases pure content and code work with no infrastructure risk.
- Phase 3 can begin partially before all Phase 2 examples are complete (config reference tiddler and catalog updates are independent of individual example tiddlers).

---

### Research Flags

**Needs deeper research during planning:**
- **Phase 2 — 5 newer beta types:** `treeView-beta`, `wardley-beta`, `ishikawa-beta`, `treemap-beta`, `venn-beta` have sparse official documentation. Flag for per-type syntax investigation. Consider `gsd-plan-phase --research-phase 2`.

**Standard patterns (skip research-phase):**
- **Phase 1** — fully specified in ARCHITECTURE.md (exact file names, line numbers, pseudocode for `buildSiteConfig()`, directive injection pattern)
- **Phase 3** — fully specified in ARCHITECTURE.md (file locations, tiddler titles, content structure for capability matrix)

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack (diagram type inventory) | HIGH | Primary evidence from bundle grep; cross-referenced with official docs and changelog |
| Features (config surface) | HIGH | Verified against Mermaid 11.x JSON schema; plugin source read directly; all gaps from code inspection |
| Architecture (component design) | HIGH | Source code read directly; all line numbers verified; pseudocode for Phase 1 fix provided |
| Pitfalls | HIGH | All derived from code inspection + upstream issue tracker; no speculative findings |

**Overall confidence:** HIGH

### Gaps to Address

- **`sankey` v11.15.0+ config keys** (`labelStyle`, `nodeWidth`, `nodePadding`, `nodeColors`) were added after the vendored bundle's version (11.14.0). These keys may not be recognized. Verify against vendored bundle before using in Phase 2 Sankey example.
- **`renderAsync` availability** — PITFALLS.md flags that `renderAsync` may not exist in all builds. Verify against vendored bundle in Phase 1 before adding the guard.
- **`antiscript` JS callback bug** (issue #5944) — MEDIUM confidence; affects `securityLevel: 'antiscript'`. Add a caveat note to the capability matrix in Phase 3; do not block Phase 1 on it.
- **Architecture built-in icon names** — verify the 6 built-in icon names (`blank`, `cloud`, `database`, `disk`, `internet`, `server`) are all recognized by the vendored bundle before the Phase 2 architecture example is written.
- **Format B tiddler title collisions** — 10 older tiddlers use informal titles (`sequenceDiagram 1`, `Class diagrams`, etc.). Audit exact titles before Phase 2 migration to avoid collision with any newer Format A tiddlers.

---

## Sources

### Primary (HIGH confidence)
- Vendored bundle (`$__plugins_mermaid-tw5_mermaid.min.js`, 3,165,091 bytes, 2026-04-28) — diagram type detector regexes, KaTeX presence, ZenUML absence confirmed by grep
- Plugin source: `wrapper.js`, `widget-tools.js`, `typed-parser.js` — config flow trace, `getScriptBody()` behavior confirmed at line level
- Mermaid config JSON schema (mermaid.js.org/config/schema-docs/) — all global and per-type config keys
- Mermaid secure array docs (mermaid.js.org/config/usage) — `securityLevel`, `startOnLoad`, `maxTextSize`, `maxEdges`, `suppressErrorRendering` confirmed as secure keys
- Mermaid directives docs (mermaid.js.org/config/directives) — `%%{init}%%` precedence, YAML frontmatter, secure key bypass confirmed
- Mermaid accessibility docs (mermaid.js.org/config/accessibility) — `accTitle` / `accDescr` syntax

### Secondary (MEDIUM confidence)
- Mermaid GitHub CHANGELOG — v11.14.0 additions (Wardley Maps, TreeView, Treemap); v11.12.x additions (Radar, Venn, Ishikawa)
- Mermaid v11.13.0 blog post — confirms Venn and Ishikawa addition
- Mermaid issue #2110 (legend — closed unimplemented) — native legend permanently deferred
- Mermaid issue #6809 (click fails silently at strict securityLevel) — `securityLevel` behavior
- Mermaid issue #7528 (Sankey special chars) — `&` in Sankey node names breaks parse in 11.12+
- Mermaid issue #1726 (classDef on subgraph) — `classDef` confirmed not applicable to subgraph containers
- Mermaid issue #5944 (antiscript JS callbacks) — antiscript partial breakage

### Tertiary (LOW confidence)
- Sankey config keys `labelStyle`, `nodeWidth`, `nodePadding`, `nodeColors` — documented for v11.15.0+ but bundle is 11.14.0; availability unverified

---
*Research completed: 2026-06-07*
*Ready for roadmap: yes*
