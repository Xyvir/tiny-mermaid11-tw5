# Phase 6: Config Wiring Foundation - Context

**Gathered:** 2026-06-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Make user-supplied Mermaid configuration **actually apply** when diagrams render. Today `getOptions()` (widget-tools.js) collects config from tiddler fields and widget attributes into an `options` object, but `wrapper.js` calls `mermaidAPI.initialize()` with a hardcoded config and never merges `options` — so every widget-attribute / field config setting is a silent no-op.

**In scope:** CONFIG-02 (options→initialize merge), CONFIG-03 (initialize once per page), CONFIG-04 (securityLevel via config tiddler), CONFIG-05 (theme/themeVariables/look/fontFamily global + per-diagram), CONFIG-06 (per-diagram-type config via documented JSON pattern). Plus the Sankey `R&D` parse-error fix and a `renderAsync` guard, both prerequisites flagged in research.

**Out of scope:** Advanced example tiddlers (Phase 7), Configuration Reference / Capability Matrix docs (Phase 8), any new bundled assets (ELK/ZenUML/icon packs — deferred milestone-wide), nested per-type config via *tiddler fields* (deferred to v0.7.0 per FEATURES.md — `%%{init}%%` / config-tiddler JSON is the supported path).

</domain>

<decisions>
## Implementation Decisions

### Config Precedence (discussed — USER-LOCKED)
- **D-01:** Non-secure keys resolve **more-local-wins**: `global config tiddler < tiddler field < widget attribute < in-diagram %%{init}%%`. The most specific/local source wins; matches Mermaid's native rule that `%%{init}%%` overrides `initialize()`.
- **D-02:** Implementation of D-01: per-widget non-secure keys (theme, look, fontFamily) are injected as an `%%{init}%%` directive **prepended before** any author's literal `%%{init}%%` in `scriptBody`, so Mermaid's last-wins directive merge naturally lets the author's in-source directive win. Do NOT inject after.
- **D-03:** **Secure keys** (`securityLevel`, `startOnLoad`, `maxTextSize`, `maxEdges`, `suppressErrorRendering`) come **only** from the global config shadow tiddler (`$:/plugins/orange/mermaid-tw5/config`), default `securityLevel: 'loose'`. Secure-key values found on fields/attributes/`%%{init}%%` are ignored — and this is documented. No per-render re-initialize, no "first diagram wins" behavior. This is forced by, and consistent with, the initialize-once decision (CONFIG-03).
- **D-04:** Nested config objects (`themeVariables`, per-type blocks like `flowchart`/`sequence`) use **shallow replace**, not deep merge. A more-local layer that sets `themeVariables` replaces the whole object. Simplest to reason about and matches how `%%{init}%%` naturally behaves. (Deep merge explicitly rejected for this foundation phase.)

### Carried Forward (locked by research/roadmap — confirmed, not re-litigated)
- **D-05:** `mermaidAPI.initialize()` moves into the `if (!mermaidAPI)` lazy-load block so it runs **once per page load** (CONFIG-03). Removes the current per-render "last-write-wins" race.
- **D-06:** New JSON shadow tiddler `$:/plugins/orange/mermaid-tw5/config` holds site-wide global defaults; users override it in their own wiki via the standard TW shadow-tiddler pattern without touching plugin files. `buildSiteConfig()` reads it and feeds `initialize()`.
- **D-07:** `startOnLoad: false` stays hardcoded always.
- **D-08:** Sankey `R&D` parse-error (issue #7528, `&` in node name) is fixed in this phase so Phase 7 Sankey authoring is unblocked. `renderAsync` availability is verified against the vendored 11.14.0 bundle before adding/keeping the guard.
- **D-09:** All 13 existing tests must continue to pass; this is a test gate, not a goal.

### Open Decisions — NOT user-locked (planner/researcher chooses; recommended defaults below)
The user chose to discuss only precedence. These remain open. The planner should adopt the recommended default unless research contradicts it, and note the choice in PLAN.md:
- **O-01 (Merge safety):** Whether to whitelist known Mermaid config keys before merging `getOptions()` output into `initialize()`, vs. pass everything through. `getOptions()` currently grabs *every* field starting with `mermaid` plus all widget attributes — blind passthrough risks injecting junk keys into `initialize()`. **Recommended default:** whitelist the documented config keys (theme, themeVariables, look, fontFamily, securityLevel, fontSize, and the per-type blocks) for the `initialize()` merge; ignore unknown keys silently (consistent with existing `getOptions()` swallow-errors behavior).
- **O-02 (Per-type config delivery, CONFIG-06):** The single documented pattern for flowchart/sequence/gantt config. **Recommended default:** per-type blocks live in the global config-tiddler JSON (apply to all diagrams) and/or per-diagram via `%%{init}%%` for structural keys — NOT via dotted tiddler fields (deferred per FEATURES.md). Pick ONE canonical documented pattern and keep examples consistent with it.

### Claude's Discretion
- Exact default contents of the new config shadow tiddler (beyond `securityLevel: 'loose'`, `startOnLoad: false`, and the existing `flowchart: { useMaxWidth: true, htmlLabels: true }`).
- Whether config conflicts are silent (recommended — consistent with current silent `getOptions()` behavior) or surface a console note.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase research (HIGH confidence — fully specifies the fix)
- `.planning/research/SUMMARY.md` — config bug root cause, the `wrapper.js` fix (~20–30 lines), securityLevel secure-key behavior, precedence rules, Sankey/renderAsync gaps to verify against the vendored bundle
- `.planning/research/ARCHITECTURE.md` — component responsibilities, `buildSiteConfig()` design, `%%{init}%%` injection pattern, exact files to change
- `.planning/research/FEATURES.md` — must/should/defer config surface; rationale for deferring nested per-type config via tiddler fields
- `.planning/research/PITFALLS.md` — pitfalls 1, 2, 4, 6 (config silent failure, securityLevel `%%{init}%%` confusion, Sankey parse error, per-render init race)
- `.planning/research/STACK.md` — vendored bundle scope (26 types), secure-key list

### Roadmap / requirements
- `.planning/ROADMAP.md` §"Phase 6: Config Wiring Foundation" — goal, 5 success criteria, hard-dependency note
- `.planning/REQUIREMENTS.md` §"Configuration Parity" — CONFIG-02 through CONFIG-06 wording

### Source files to modify / read
- `mermaid-tw5/plugins/mermaid-tw5/$__plugins_mermaid-tw5_wrapper.js` — **primary change**; `initialize()` call at lines 102–111, lazy-load block at 95–100, `scriptBody` handling at 134, render at 136–182
- `mermaid-tw5/plugins/mermaid-tw5/$__plugins_mermaid-tw5_widget-tools.js` — `getOptions()` at lines 64–123 (result now consumed; no structural change required)
- `mermaid-tw5/plugins/mermaid-tw5/$__plugins_mermaid-tw5_typed-parser.js` — no changes expected (verify only)
- `tests/wrapper.test.js`, `tests/widget-tools.test.js` — must stay green; extend for the new merge
- New: `$__plugins_mermaid-tw5_config.tid` (the JSON shadow config tiddler)
- `Sankey Diagram.tid` example tiddler — `R&D` node fix

### Bundle facts to verify (research gaps)
- `renderAsync` presence in vendored `mermaid.min.js`; Sankey v11.15.0+ config keys NOT assumed present (bundle is 11.14.0).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `rocklib.getOptions(src, tag, options)` (widget-tools.js:64) — already collects fields (`mermaid*`) and widget attributes, parses each as JSON-then-string, supports named data tiddlers and `a.x → aX` camelCase mapping. Its output is the thing to merge; the function itself likely needs no change.
- Lazy-load guard `if (!mermaidAPI)` (wrapper.js:95) — the natural home for the one-time `initialize()` + `buildSiteConfig()`.

### Established Patterns
- TW shadow-tiddler override pattern (`$:/plugins/orange/mermaid-tw5/config`) — users override plugin defaults without editing plugin source.
- Mermaid directive precedence: `%%{init}%%` overrides `initialize()` for non-secure keys; secure keys only via `initialize()`. D-01..D-04 are built on this.
- Existing examples (e.g. Theme Showcase.tid) rely on literal `%%{init}%%` in source — they keep working under the new wiring because of D-02 (author's in-source directive wins).

### Integration Points
- `getScriptBody()` returns the raw diagram text; the `%%{init}%%` injection (D-02) happens between `getScriptBody()`/`decodeHtmlEntities()` and `mermaidAPI.render()` in `wrapper.js`.
- `securityLevel: 'loose'` must remain effective post-change or click navigation (INTERACT-02) breaks — covered by D-03.

</code_context>

<specifics>
## Specific Ideas

- Precedence mental model the docs must teach: "the closer the setting is to the diagram, the more it wins — except security, which only the site config tiddler controls."
- Injection ordering is load-bearing: prepend injected `%%{init}%%`, never append (D-02).

</specifics>

<deferred>
## Deferred Ideas

- Nested per-diagram-type config via **dotted tiddler fields** (e.g. `mermaid-flowchart.curve`) — deferred to v0.7.0 per FEATURES.md; `%%{init}%%` and config-tiddler JSON are the supported paths this milestone.
- Deep-merge of nested config objects — rejected for this phase (D-04); revisit only if shallow-replace proves limiting.
- `handDrawnSeed` / `deterministicIds` documentation, `suppressErrorRendering` wiring — "should have" items from FEATURES.md; fold into Phase 8 config reference, not Phase 6.

*(The three unselected gray areas — merge safety, per-type config pattern — are NOT deferred; they are open decisions for the planner, captured as O-01/O-02 above.)*

</deferred>

---

*Phase: 6-Config Wiring Foundation*
*Context gathered: 2026-06-07*
