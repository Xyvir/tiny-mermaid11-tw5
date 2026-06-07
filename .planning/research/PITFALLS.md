# Pitfalls Research

**Domain:** TiddlyWiki 5 plugin — Mermaid 11.14.0 advanced examples + config parity (v0.6.0)
**Researched:** 2026-06-07
**Confidence:** HIGH (code inspected; Mermaid 11 docs + issues verified; TW5 parser behavior cross-referenced)

---

## Safest Authoring Mode for Advanced Examples

**Recommendation: `$$$text/vnd.tiddlywiki.mermaid` typed block, every time.**

Rationale:

| Mode | Wikitext parsed? | Safe for advanced syntax? |
|------|-----------------|--------------------------|
| `<$mermaid text="…">` attribute | Text attribute — double-quotes break attribute boundary; no newlines without `<br>` trick | NO — unsuitable for multiline advanced diagrams |
| `<$mermaid>…</$mermaid>` widget body | YES — full WikiText parsing runs on body content | PARTIAL — `--` → `&ndash;`, `[[…]]` → link node, `<`/`>` → HTML elements, `%%` may parse |
| `$$$text/vnd.tiddlywiki.mermaid` block | The `typed-parser.js` receives `text` directly (raw string, no WikiText pass) | YES — safest; text is passed verbatim to `MermaidParser` |
| Tiddler with `type: text/vnd.tiddlywiki.mermaid` | Same as `$$$` — body is the raw text field | YES — identical safety; used for standalone diagram tiddlers |

The `$$$` block and `type:` tiddler modes are safe because `typed-parser.js` stores the raw `text` string directly in the parse-tree node and passes it straight to `MermaidWidget.render()` via `parseTreeNode.text`, bypassing `getScriptBody()`'s child-walking entirely. The widget body mode runs through the full wikitext parse tree reconstruction in `getScriptBody()`, which is the source of all the mangling pitfalls below.

---

## Critical Pitfalls

### Pitfall 1: `getScriptBody()` Only Handles `&ndash;` — All Other HTML Entities Silently Vanish

**What goes wrong:**
The widget body mode (`<$mermaid>…</$mermaid>`) runs through the TiddlyWiki wikitext parser before `getScriptBody()` reassembles the text. The entity handler in `getScriptBody()` only recovers `&ndash;` → `--`. Any other entity (`&lt;`, `&gt;`, `&amp;`, `&quot;`, `&mdash;`, `#123;` numeric references, etc.) emitted by the wikitext parser is either silently dropped or left as the HTML entity string. Mermaid then sees corrupted source and either silently renders wrong or throws a parse error.

**Why it happens:**
The `case 'entity':` block in `widget-tools.js` lines 35–40 has exactly one case: `'&ndash;'`. All other entities fall through the `switch` without appending anything. The `decodeHtmlEntities()` helper added in the HTML-entity decode fix (commit `6822467`) runs *after* `getScriptBody()` in `wrapper.js` line 134, so it can only rescue entities that survived the reconstruction — it cannot recover text that was silently dropped.

**Characters that trigger this:**
- `<` / `>` — parsed as HTML element or angle-bracket operators; ER diagram cardinality lines and class diagram generic notation use these
- `&` — parsed as entity start
- `--` in ERD relationship lines — parsed as `&ndash;` (partially handled), but `---` (ERD identifying line variant) is parsed as `<hr>`
- `[[text]]` — parsed as an internal link node (type `link`); the link handler re-emits `'#' + text` which is wrong for Mermaid
- `%%` comments — wikitext treats `%` as potential macro character in some contexts

**How to avoid:**
Write all advanced examples using `$$$text/vnd.tiddlywiki.mermaid` blocks or as tiddlers with `type: text/vnd.tiddlywiki.mermaid`. Never use `<$mermaid>…</$mermaid>` widget body for advanced diagrams. If the widget body form must be used, all special chars require HTML numeric entities that `decodeHtmlEntities()` will recover — but this makes the source unreadable.

**Warning signs:**
Diagram renders but arrows point wrong way; ER diagram shows no relationship line; class diagram generics render as plain text; any `<` or `>` in the source causes a Mermaid parse error.

**Phase to address:**
Phase 1 (Config & authoring modes) — add a plugin-level note and example tiddler header comment that explicitly states "use `$$$` block — widget body mode is not safe for advanced syntax." Phase 2 (Advanced examples) — write all 20 example tiddlers using `$$$` blocks only.

---

### Pitfall 2: `securityLevel` Cannot Be Overridden by `%%{init}%%` Directives

**What goes wrong:**
Authors writing advanced flowchart examples that include `click` handlers put `%%{init: {'securityLevel': 'loose'}}%%` at the top of their diagram expecting it to enable click events. It has no effect. Mermaid's secure array — `['secure', 'securityLevel', 'startOnLoad', 'maxTextSize']` — prevents diagram-level directives from overriding `securityLevel`. Click events fail silently (no error, no warning; see mermaid-js/mermaid#6809).

**Why it happens:**
`securityLevel` is intentionally in the secure array so that site embedders control the trust level and diagram authors cannot escalate it. The Mermaid `initialize()` call in `wrapper.js` line 107–111 sets `securityLevel: 'loose'` at the global level — this works, and the plugin already does the right thing. The trap is writing `%%{init}%%` as a per-diagram override, expecting it to also set this.

**How to avoid:**
Do not put `securityLevel` in any `%%{init}%%` directive inside diagram source. The plugin's `mermaidAPI.initialize({ securityLevel: 'loose' })` call is the correct and only effective place. For the config-parity feature, expose `securityLevel` as a tiddler field or widget attribute that feeds into `initialize()`, not as a diagram-level directive. Example tiddlers that use `click` should document this in a comment.

**Warning signs:**
`click` callbacks do nothing; diagram renders but node clicks are unresponsive; no error in the browser console.

**Phase to address:**
Phase 1 (Config parity) — when exposing `securityLevel` as a configurable option, ensure it flows through `initialize()` not through diagram text. Document the secure-array constraint in the capability matrix tiddler.

---

### Pitfall 3: `mermaidAPI.initialize()` Called on Every Render Resets Global Config

**What goes wrong:**
`wrapper.js` calls `mermaidAPI.initialize({…})` inside `MermaidWidget.prototype.render` every time a diagram renders. If page has multiple diagrams with different per-diagram config (theme, look, etc.), the last diagram to render wins the global config state because `initialize()` is global. Earlier diagrams may have already rendered correctly, but after a refresh the order of render could change the final global state.

**Why it happens:**
Mermaid 11's `initialize()` sets global defaults. There is no per-render config isolation in `mermaidAPI.render()` unless you use `%%{init}%%` directives inside each diagram (which works for non-secure config keys). The current code calls `initialize()` once per `render()` invocation with a hardcoded config object, ignoring any per-tiddler options gathered by `getOptions()` — which collects them but never merges them into the `initialize()` call.

**How to avoid:**
For v0.6.0 config parity: gather per-diagram config from `getOptions()` and merge it into the `mermaidAPI.initialize()` call *within* that render call, accepting the global-state limitation. Alternatively, use `%%{init}%%` directives inside the diagram source for non-secure options (theme, look, fontFamily, per-type config). Do not assume `initialize()` state is stable across multiple concurrent diagrams.

**Warning signs:**
First diagram on page renders with forest theme, second with default theme, but after page reload both render with default theme because init call order changed.

**Phase to address:**
Phase 1 (Config parity) — wire `getOptions()` result into `initialize()` call; document that per-diagram config via tiddler fields uses global state and the last diagram to initialize wins.

---

### Pitfall 4: Widget Body `--` → `&ndash;` Entity Mangling in ERD / Flowchart Edge Syntax

**What goes wrong:**
The TiddlyWiki wikitext parser converts `--` to an `&ndash;` entity node. The `getScriptBody()` handler recovers this back to `--` for the single case it knows about. However, ERD syntax uses `--` as part of relationship lines: `ENTITY1 ||--o{ ENTITY2 : "label"`. If three dashes `---` appear (used in ERD for identifying relationships), the TW parser converts this to `<hr>` which is reconstructed as an `element` node type — and the `element` handler in `getScriptBody()` only handles `<a>` tags. An `<hr>` is silently dropped, corrupting the ERD line.

**Why it happens:**
This is a structural limitation of the `getScriptBody()` approach: it must reverse-engineer wikitext parse results without complete knowledge of every entity and element type that the wikitext parser can emit.

**How to avoid:**
Use `$$$` block mode for ERD examples. If the widget body form is ever needed for ERD, use `----` (four dashes) if Mermaid accepts it, or use HTML numeric entity `&#45;&#45;` for `--` — though `decodeHtmlEntities()` would need to run before the Mermaid parser, which it does (line 134 in wrapper.js). Verify by inspecting `scriptBody` value before it reaches `mermaidAPI.render()`.

**Warning signs:**
ERD renders with missing relationship lines or wrong cardinality markers; `---` lines disappear entirely.

**Phase to address:**
Phase 2 (Advanced examples) — write all ERD examples in `$$$` block mode. Add a note to the plugin Tips tiddler warning against widget body for ERD syntax.

---

### Pitfall 5: `[[double bracket]]` Links in Widget Body Become `#text` Permalink Fragments

**What goes wrong:**
TiddlyWiki parses `[[text]]` inside a widget body as an internal link node. `getScriptBody()` handles `type: 'link'` by emitting `'#' + kk.children[0].text`. This means a Mermaid flowchart node like `A["[[see diagram]]"]` inside widget body content becomes `A["#see diagram"]` — wrong, and possibly a Mermaid parse error depending on context.

**Why it happens:**
The original author intended this so that `[[TiddlerName]]` in a flowchart node label would create a TiddlyWiki-style permalink in the rendered SVG. But this transformation is invisible and surprising when the `[[…]]` is not intended as a TW link.

**How to avoid:**
In `$$$` block mode, `[[…]]` is passed verbatim to Mermaid (no wikitext parsing), so it is safe. If `click` callback links to TW tiddlers are needed inside `<$mermaid>` widget body, use the `click nodeId "[[TiddlerName]]"` syntax with full understanding that `[[…]]` → `#TiddlerName` transformation will happen.

**Warning signs:**
Node labels contain `#` prefix unexpectedly; Mermaid parse error on link syntax.

**Phase to address:**
Phase 1 (Config parity / authoring modes documentation) — document this behavior explicitly. Phase 2 (Advanced examples) — use `$$$` blocks.

---

### Pitfall 6: Flowchart `end` Keyword Inside Node Labels Breaks the Parser

**What goes wrong:**
In Mermaid flowchart syntax, the word `end` is a reserved keyword that closes a `subgraph`. If a node ID or unquoted label contains the word `end` (even `End` or `END` in some parser versions), the diagram fails with a parse error. This trips up advanced examples that model process flows where "End" is a natural label.

**Why it happens:**
The Mermaid parser uses `end` as a block-closing token at the same precedence as node declarations.

**How to avoid:**
Always quote node labels containing `end`: `A["End State"]` not `A[End State]`. Or rename the node ID: `EndState["End"]`. Use `End` (capital E) as the node ID itself — the parser is case-sensitive for the keyword.

**Warning signs:**
`Parse error on line N: …end` in Mermaid error output; diagram stops rendering partway.

**Phase to address:**
Phase 2 (Advanced examples) — audit every flowchart example for `end` usage and quote appropriately.

---

### Pitfall 7: Flowchart `|` Pipe in Edge Labels Triggers WikiText Table Parsing in Widget Body Mode

**What goes wrong:**
TiddlyWiki's wikitext parser treats `|` as a table cell delimiter in block mode. An edge label like `A -->|condition| B` inside a widget body may trigger table-mode parsing and produce garbage output. Even in `$$$` block mode this is safe, but in the widget body the pipe can corrupt the parse tree.

**Why it happens:**
TiddlyWiki's block-mode parser has a table rule that fires on `|` at the start of content or following a newline. Inside a widget body, block-mode parsing applies.

**How to avoid:**
Use `$$$` block mode. If widget body is needed, use `A -- "condition" --> B` arrow label syntax instead of `|…|`.

**Warning signs:**
Edge label disappears; diagram renders as a table artifact; Mermaid receives `A -->` with no label.

**Phase to address:**
Phase 2 (Advanced examples) — use `$$$` blocks exclusively for flowchart examples using edge labels.

---

## Per-Type Top-Gotcha Table

| Diagram Type | Top Gotcha | Prevention |
|---|---|---|
| **flowchart / graph** | Unquoted node labels containing `--`, `<`, `>`, `;`, `|`, or the word `end` break the parser | Quote all labels containing special chars: `A["label with > or end"]` |
| **sequenceDiagram** | `autonumber` + `activate`/`deactivate` shorthand (`+`/`-`) conflict when self-calls are involved: self-call activation renders a misaligned box | Avoid `+`/`-` shorthand on self-calls; use explicit `activate`/`deactivate` |
| **classDiagram** | Generics with `~` cannot contain commas: `~Map<K,V>~` is a parse error; nested generics need whitespace between tildes | Use only single-type generics: `~List~`; write `~Map~` and explain limitation in comment |
| **stateDiagram-v2** | Colons in state description text: the parser uses `:` as state-label delimiter; a state note containing a colon can break parsing | Avoid colons in state labels; use `note right of State` block for descriptions with colons |
| **erDiagram** | Relationship label is required — omitting it is a hard parse error; `--` in relationship line mangles in widget body mode | Always include a quoted label; use `$$$` block mode |
| **gantt** | `dateFormat` (input parsing) vs `axisFormat` (output display) are separate directives; confusing them causes silent task render failure | Set both explicitly; test with a single task first; `dateFormat YYYY-MM-DD` is the safe default |
| **gitGraph** | Branch color/ordering is assigned by declaration order, not by `order:` attribute alone when `mainBranchOrder` conflicts; merging main into a feature branch is unsupported | Declare branches in the order you want them colored; do not attempt circular merges |
| **mindmap** | Indentation must be consistent — mixing tabs and spaces in the same diagram causes silent hierarchy collapse | Use spaces only (2 or 4 per level); never mix with tabs |
| **timeline** | Colons in event labels are structural delimiters; a label like `v1.0: stable` breaks into two events | Avoid colons in event text; rephrase as `v1.0 stable` |
| **sankey-beta** | Node names containing `'`, `&`, `/`, or `-` cause a syntax error in v11.12+ (issue #7528); commas in names need RFC-4180 CSV quoting | Use `"Name, with comma"` quoting; replace `&` → `and`, `/` → `or`, avoid single quotes |
| **quadrantChart** | Axis label and data-point syntax uses `:` as delimiter; extra colons in labels corrupt the parse | Keep all labels free of colons |
| **xychart-beta** | Bar chart y-axis does not start at zero even when `yMin: 0` is set, producing visually misleading diagrams | Document this as a known upstream limitation; use `%%{init: {"xyChart": {"yMin": 0}}}%%` and note it may not take full effect |
| **radar-beta** | Axis value count must exactly match the number of axes defined; miscount causes a silent render failure with no diagram | Count axes carefully; pad with `0` values if needed |
| **block diagram** | Block diagram (`block-beta`) parser is strict about indentation and block-closing `end` statements; missing `end` drops all following nodes | Close every `block` with `end`; use live editor to verify before committing |
| **architecture** | `architecture-beta` parser expects service/junction declarations before edge declarations; forward-references cause parse errors | Declare all services first, then all edges |
| **packet-beta** | Bit-field widths must sum correctly; non-integer widths silently produce blank output | Verify bit-field totals before committing |
| **kanban** | `kanban` syntax is v11-specific; items with special characters in titles need quoting | Quote item titles containing `:`, `#`, `[`, `]` |

---

## TiddlyWiki-Specific Rendering Pitfalls

### Integration Gotchas

| WikiText Construct | What It Does to Mermaid Source | Authoring Mode Affected | Fix |
|---|---|---|---|
| `--` (double dash) | Parsed as `&ndash;` entity node | Widget body only | Use `$$$` block; or use HTML entity `&#45;&#45;` in widget body |
| `---` (triple dash) | Parsed as `<hr>` element node | Widget body only | Use `$$$` block; avoid `---` in widget body |
| `<text>` | Parsed as HTML element; text inside becomes child nodes | Widget body only | Use `$$$` block; or escape as `&lt;text&gt;` |
| `[[TiddlerName]]` | Parsed as link node; reconstructed as `#TiddlerName` | Widget body only | Use `$$$` block; or intentionally use for TW navigation links |
| `|` (pipe) | Can trigger table parsing in block mode | Widget body only | Use `$$$` block; or use `-- "label" -->` syntax |
| `%%{init}%%` | `%%` is not a TiddlyWiki special character — passes through safely | Both modes | Safe in both modes |
| `:::` (class shorthand) | Not a TW special sequence — passes through safely | Both modes | Safe in both modes |
| `---` YAML frontmatter | Only relevant at tiddler level, not inside `$$$` block | Tiddler type field | Use `type:` tiddler field, not frontmatter inside block |
| `"double quotes"` in attribute | Terminate the attribute value | `<$mermaid text="…">` only | Cannot include unescaped `"` in text attribute; use widget body or `$$$` block |
| `\n` newlines | Cannot appear in HTML attribute values | `<$mermaid text="…">` only | Never use `text=` attribute for multiline diagrams |
| `&amp;`, `&lt;`, `&gt;` HTML entities | `decodeHtmlEntities()` in wrapper.js decodes these before Mermaid render | Widget body only | Entities that survive `getScriptBody()` are decoded; but many are silently dropped first |

---

## Config Pitfalls

### Pitfall 8: `%%{init}%%` Non-Secure Keys DO Override `initialize()` — Order Matters

**What goes wrong:**
For non-secure config keys (theme, fontFamily, look, per-type config like `flowchart`, `sequence`, `gantt`), a `%%{init}%%` directive inside the diagram source takes precedence over the `initialize()` call. This is correct behavior but surprises authors who expect `initialize()` to win. The practical risk: if an example tiddler hardcodes `%%{init: {'theme': 'dark'}}%%`, users who have set a different theme via the plugin's config system will see their setting overridden.

**How to avoid:**
Advanced examples should avoid hardcoded `%%{init}%%` theme directives. Use a comment `%% theme is set by plugin config %%` instead. Reserve `%%{init}%%` for diagram-specific non-theme config like `%%{init: {'gantt': {'barHeight': 30}}}%%`.

**Warning signs:**
Plugin config theme setting appears to be ignored for some diagrams; user-set theme not applied.

**Phase to address:**
Phase 1 (Config parity) — establish policy: `%%{init}%%` in examples is only for structural/per-type config, not theme. Phase 2 (Advanced examples) — enforce this policy in all 20 example tiddlers.

---

### Pitfall 9: D3 Zoom Click Toggle Breaks After Mermaid Re-Render

**What goes wrong:**
The D3 zoom setup uses a closure over `zoomEventListenersApplied` and `isZoomEnabled`. When a tiddler is refreshed and the widget re-renders, `MermaidWidget.refresh()` returns `false` (no re-render), so the stale SVG stays in the DOM. However, if anything forces a re-render (e.g., a changed tiddler that the current tiddler transcudes), a new `divNode` is created with new closures but the old D3 zoom listener from the previous `divNode` is still attached to the original DOM element (now replaced). The new `divNode` starts fresh with `zoomEventListenersApplied = false` — but the timing of the re-render may leave a brief period where clicks go to the detached old element.

**Why it happens:**
The click-to-enable-zoom pattern stores state in closures rather than on the DOM element, making it sensitive to element replacement.

**How to avoid:**
This is pre-existing behavior and acceptable for v0.6.0. Document it as a known limitation. If D3 zoom is revisited, store zoom state on `divNode` dataset rather than in closures.

**Warning signs:**
After tiddler refresh, first click does not enable zoom; requires two clicks.

**Phase to address:**
Phase 3 (Advanced interactions, if scoped) — note as known UX issue. Not a v0.6.0 blocker.

---

### Pitfall 10: Async Render Race for Newer Diagram Types (Timeline, ZenUML)

**What goes wrong:**
The wrapper's `renderDiagram()` function calls `mermaidAPI.render()` and checks if the result is a Promise. For older diagram types (flowchart, sequence), `render()` returns a resolved-quickly Promise. For newer types (timeline, mindmap, architecture, kanban, radar), Mermaid 11 uses lazy-loading internally and the Promise may not resolve until async module fetching completes — but since these are bundled (not dynamically fetched), this is less of an issue. The bigger risk is if a diagram type triggers `mermaidAPI.render()` to throw `"Diagram is a promise"` synchronously (the fallback to `renderAsync` path on line 149); `renderAsync` is checked on `mermaidModule` but may not exist in all Mermaid 11 builds.

**How to avoid:**
Test each of the 20 diagram types against the vendored `mermaid.min.js` build to confirm Promise resolution works. The `renderAsync` fallback should be verified to exist (log a warning if not). For the vendored bundle (all types included), lazy-load-based async is not triggered — but the Promise path must still be handled.

**Warning signs:**
Diagram container shows "Loading diagram…" indefinitely; console shows `renderAsync is not a function`.

**Phase to address:**
Phase 2 (Advanced examples) — test all 20 types in the demo TW before committing. Phase 1 (Config parity) — add a guard: `if (!mermaidModule.renderAsync) console.warn('[mermaid-tw5] renderAsync unavailable')`.

---

## Legend Pattern Pitfalls

### Pitfall 11: Subgraph Legend Nodes Participate in Layout Ranking

**What goes wrong:**
Adding a "legend" subgraph to a flowchart — a common pattern where a visually isolated subgraph shows color-coded node classes — causes Dagre to include those legend nodes in the rank calculation for the whole graph. This pulls the primary diagram's rank assignments, typically increasing vertical spacing (`ranksep`) or creating unexpected rank collisions. A legend intended to sit at the bottom of the diagram may instead be interspersed between main nodes.

**Why it happens:**
Dagre has no concept of "floating" subgraphs. Every node participates in rank assignment unless it is entirely disconnected from the rest of the graph AND the Dagre layout respects that isolation — which it often does not in practice.

**How to avoid:**
For the manual legend pattern: place the legend subgraph at the end of the diagram code with no edges connecting it to the main graph. Use `%%{init: {'flowchart': {'rankSpacing': 50}}}%%` to normalize spacing. Accept that some layout distortion is unavoidable. Prefer a separate table-based legend in WikiText below the diagram over an in-diagram subgraph legend.

**Warning signs:**
Diagram layout shifts when legend subgraph is added; main nodes redistribute to new ranks.

**Phase to address:**
Phase 2 (Advanced examples) — if legend subgraphs are used in examples, test layout carefully. Document the "WikiText table legend" pattern as the safer alternative.

---

### Pitfall 12: `classDef` Does Not Apply to Subgraphs — Only to Nodes

**What goes wrong:**
Authors creating legend subgraphs attempt to style the subgraph container itself with `classDef` and the `:::` operator (e.g., `subgraph legend:::legendStyle`). This has no effect — `classDef` styling in Mermaid flowcharts applies only to individual nodes, not to subgraph containers. The subgraph border and background cannot be controlled via `classDef`.

**Why it happens:**
Mermaid's `classDef` implementation targets SVG `<g>` elements for individual nodes; subgraph containers use a separate SVG structure that the classDef system does not reach.

**How to avoid:**
Use `style subgraphId fill:#eee,stroke:#999` syntax for subgraph container styling. Do not use `:::` shorthand on subgraphs. Accept that subgraph styling options are more limited than node styling.

**Warning signs:**
`classDef` style defined, `:::` applied to subgraph ID, but subgraph background remains default white.

**Phase to address:**
Phase 2 (Advanced examples) — any legend examples should use `style` not `classDef` for subgraph containers.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcode `%%{init}%%` theme in example tiddlers | Diagram looks good in screenshots | User's plugin-level theme config is ignored for those examples | Never — use plugin config instead |
| Use `<$mermaid>…</$mermaid>` widget body for advanced examples | Familiar authoring pattern | Silent mangling of `--`, `<`, `>`, `[[]]`; brittle on wikitext changes | Never for advanced syntax; only for trivial single-line demonstrations |
| Call `mermaidAPI.initialize()` once globally rather than per-render | Simpler code | Per-diagram config overrides each other in multi-diagram pages | Acceptable for v0.6.0 with documentation |
| Subgraph legend in diagram | Legend co-located with diagram | Layout distortion, cannot style with classDef | Acceptable only for simple diagrams; prefer WikiText table legend |
| Skip `renderAsync` guard | Fewer lines of code | Silent "Loading…" if `renderAsync` is missing | Never — add the guard |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Multiple `mermaidAPI.initialize()` calls per page render | Each diagram overwrites global config; last diagram's theme wins | Acceptable limitation for v0.6.0; document it | Any page with 2+ diagrams using different themes |
| Large sankey/gantt diagrams with many nodes | SVG render blocks main thread (Mermaid is synchronous until Promise resolves) | Keep example diagrams reasonable in size (< 30 nodes) | Any single diagram with 50+ nodes |
| `useMaxWidth: true` in initialize() | SVG sets width to 100% but max-width prevents growing beyond initial size | Set `useMaxWidth: false` and use CSS overflow on container, or accept 100%-width behavior | Wide diagrams in narrow sidebar tiddlers |

---

## "Looks Done But Isn't" Checklist

- [ ] **Advanced example renders in demo TW:** Verify in actual TiddlyWiki browser, not just Mermaid live editor — TW adds a host page wrapper that can affect SVG sizing
- [ ] **Click handlers work:** Verify `securityLevel: 'loose'` is active in the render that includes click-enabled flowchart examples
- [ ] **`%%{init}%%` directive in example is non-secure config only:** Check that no example tiddler includes `securityLevel`, `startOnLoad`, or `maxTextSize` in its directive
- [ ] **All `$$$` blocks use spaces not tabs for indentation-sensitive types:** Mindmap, block diagram, architecture — verify indentation before commit
- [ ] **Sankey node names free of `'`, `&`, `/`, `-`:** Run a grep across example tiddlers
- [ ] **Timeline events have no colons:** grep for `:.*:` inside timeline blocks
- [ ] **Gantt has both `dateFormat` and `axisFormat` set:** Verify both present in any gantt with custom dates
- [ ] **Legend subgraph (if used) renders without layout distortion:** Eyeball check after render
- [ ] **`classDef` on subgraphs replaced with `style` command:** Check any diagram using subgraph color
- [ ] **`renderAsync` guard present in wrapper.js:** Confirm before shipping Phase 1

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Widget body mode mangling | LOW | Convert `<$mermaid>…</$mermaid>` block to `$$$text/vnd.tiddlywiki.mermaid` block — no code changes needed, just authoring change |
| securityLevel in `%%{init}%%` not working | LOW | Remove from directive; confirm `initialize()` in wrapper.js has `securityLevel: 'loose'` |
| Subgraph legend causing layout distortion | MEDIUM | Move legend to WikiText table below diagram; or add `rankSpacing` init directive and eyeball-tune |
| `classDef` on subgraph not styling | LOW | Replace `class subId myClass` with `style subId fill:#eee,stroke:#999` |
| Sankey parse error from special chars | LOW | Rename node labels to remove `'`, `&`, `/`, `-`; update value references accordingly |
| Async render "Loading…" hang | MEDIUM | Confirm diagram type is supported in the vendored bundle; add `renderAsync` guard; check browser console for Promise rejection |
| `initialize()` global state interference between diagrams | MEDIUM | Move per-diagram config into `%%{init}%%` directives for non-secure keys; accept that theme must be set globally |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| getScriptBody entity mangling (Pitfall 1) | Phase 2 — advanced examples use `$$$` blocks only | All example tiddlers use `$$$` or `type:` tiddler form; no `<$mermaid>body</$mermaid>` for advanced syntax |
| securityLevel in `%%{init}%%` (Pitfall 2) | Phase 1 — config parity implementation and docs | No example tiddler contains `securityLevel` in a directive |
| initialize() called per render resets config (Pitfall 3) | Phase 1 — config parity wiring | getOptions() result merged into initialize() call; documented limitation in capability matrix |
| ERD `---` → `<hr>` mangling (Pitfall 4) | Phase 2 — advanced examples | ERD examples use `$$$` block |
| `[[link]]` → `#text` transformation (Pitfall 5) | Phase 1 — documentation; Phase 2 — examples | No unintended `[[…]]` in advanced diagram source; behavior documented |
| flowchart `end` keyword (Pitfall 6) | Phase 2 — advanced examples | All flowchart node labels using "end" are quoted |
| pipe `|` table parsing in widget body (Pitfall 7) | Phase 2 — advanced examples | No flowchart edge `|label|` syntax inside widget body mode |
| `%%{init}%%` theme override of plugin config (Pitfall 8) | Phase 1 — policy; Phase 2 — enforcement | No theme directive in example tiddlers; structural directives only |
| D3 zoom after re-render (Pitfall 9) | Phase 3 if scoped, else document | Known limitation listed in plugin Tips tiddler |
| Async render race / renderAsync guard (Pitfall 10) | Phase 1 — guard added; Phase 2 — all 20 types tested | Console shows no renderAsync warning; all 20 types render in demo TW |
| Subgraph legend layout distortion (Pitfall 11) | Phase 2 — advanced examples | Legend pattern uses WikiText table or documented rankSpacing workaround |
| classDef on subgraph (Pitfall 12) | Phase 2 — advanced examples | No `class subgraphId …` or `:::` on subgraph IDs in examples |

---

## Sources

- [Mermaid Flowchart Syntax — special characters and quoting](https://mermaid.js.org/syntax/flowchart.html)
- [Mermaid Directives — init vs initialize, secure array](https://mermaid.js.org/config/directives.html)
- [Mermaid issue #6809 — click fails silently when securityLevel != 'loose'](https://github.com/mermaid-js/mermaid/issues/6809)
- [Mermaid issue #7480 — nested generics syntax error in classDiagram](https://github.com/mermaid-js/mermaid/issues/7480)
- [Mermaid issue #7528 — Sankey special characters trigger syntax error](https://github.com/mermaid-js/mermaid/issues/7528)
- [Mermaid issue #1726 — classDef does not apply to subgraph](https://github.com/mermaid-js/mermaid/issues/1726)
- [Mermaid Gantt diagrams — dateFormat vs axisFormat](https://mermaid.js.org/syntax/gantt.html)
- [Mermaid Sankey — CSV quoting rules](https://mermaid.js.org/syntax/sankey.html)
- [Mermaid Mindmap — indentation rules](https://mermaid.js.org/syntax/mindmap.html)
- [Mermaid Timeline — colon delimiter](https://mermaid.js.org/syntax/timeline.html)
- [Mermaid XY Chart](https://mermaid.ai/open-source/syntax/xyChart.html)
- [Mermaid Radar (v11.6.0+)](https://mermaid.ai/open-source/syntax/radar.html)
- [TiddlyWiki WikiText Parser](https://tiddlywiki.com/dev/static/Parser.html)
- [TiddlyWiki WikificationMechanism](https://tiddlywiki.com/static/WikificationMechanism.html)
- [mermaid-tw5 widget-tools.js — getScriptBody source](../mermaid-tw5/plugins/mermaid-tw5/$__plugins_mermaid-tw5_widget-tools.js)
- [mermaid-tw5 wrapper.js — render loop and decodeHtmlEntities](../mermaid-tw5/plugins/mermaid-tw5/$__plugins_mermaid-tw5_wrapper.js)
- [GitGraph — branch ordering and limitations](https://mermaid.js.org/syntax/gitgraph.html)
- [Mermaid useMaxWidth issue #5038](https://github.com/mermaid-js/mermaid/issues/5038)
- [Lazy Loading Mermaid — race condition context](https://weblog.west-wind.com/posts/2025/May/10/Lazy-Loading-the-Mermaid-Diagram-Library)

---
*Pitfalls research for: mermaid-tw5 v0.6.0 — advanced examples + config parity*
*Researched: 2026-06-07*
