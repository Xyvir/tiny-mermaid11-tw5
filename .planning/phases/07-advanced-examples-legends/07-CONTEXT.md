# Phase 7: Advanced Examples & Legends - Context

**Gathered:** 2026-06-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Author **one advanced, well-commented example for each of the 26 in-scope diagram types** the vendored Mermaid 11.14.0 bundle renders, add legends where color-by-category is used, and make every example discoverable through a shared tag and the existing catalog.

**In scope:** EXAMPLE-01 (26 advanced examples via `$$$text/vnd.tiddlywiki.mermaid` blocks), EXAMPLE-02 (migrate the ~10 catalog-referenced canonical legacy examples to `.tid`; Sankey `R&D` parse error already fixed in Phase 6), EXAMPLE-03 (shared tag + catalog/index), LEGEND-01 (one reusable "key box" recipe tiddler), LEGEND-02 (legends on color-by-category examples).

**Out of scope:** Configuration Reference tiddler and Capability Matrix tiddler (Phase 8 — CONFIG-07, DOCS-03); any new bundled assets (ELK, ZenUML, icon packs, KaTeX-as-feature — deferred milestone-wide); a native/in-Mermaid legend (upstream issue #2110 closed unimplemented); config-wiring changes (landed in Phase 6); bulk migration/deletion of the ~90 legacy feature-snippet tiddlers (left as-is, see D-09).

</domain>

<decisions>
## Implementation Decisions

### Example Anatomy & Depth (discussed — USER-LOCKED)
- **D-01:** All 26 advanced examples follow the **existing `.tid` template**, standardized: *intro → basic example → real-world (advanced) example → syntax table → tips → back-link to catalog*. The ~10 existing newer `.tid` examples (Architecture Diagram, Mindmap, XY Chart, Packet Diagram, Timeline, Kanban Board, Block Diagram, Sankey Diagram, Quadrant Chart) are the reference implementation of this template.
- **D-02:** Examples are **theme-neutral**. They never set `theme`/`look`/`fontFamily`/`themeVariables`. `%%{init}%%` (or YAML frontmatter) is used **only** for *structural per-type config* (e.g. `gantt.barHeight`, `flowchart.curve`) where it genuinely improves the example — never for appearance. This enforces research pitfall-7: an example must not override the user's global theme set via Phase-6 config. (No separate config-showcase tiddlers — that would overlap Phase 8.)
- **D-03:** "Well-commented" (EXAMPLE-01) means **both**: inline `%%` comments inside the Mermaid source mark the major sections (the `%% ── Main diagram ──` style), AND the WikiText tips/syntax sections explain the concepts. `%%` comments are safe inside `$$$` blocks and teach by example since users copy the source.

### Legend Recipe & Scope (discussed — USER-LOCKED)
- **D-04:** The canonical reusable legend recipe (LEGEND-01) is a **WikiText table below the diagram** mapping color swatch → category. Chosen because it works for every diagram type (including er/sequence/gantt/timeline that have no `classDef`), never distorts Dagre layout, and is trivial to copy. The disconnected styled-subgraph pattern is NOT the canonical recipe (flowchart/block only; layout-distortion + `classDef`-on-subgraph caveats from research). It may be mentioned as an in-SVG alternative but the table is THE recipe the examples and docs point to.
- **D-05:** Legends (the D-04 table) are added **only to examples that color by category** via `classDef`/`style`/section colors — e.g. flowchart, block, state, class, requirement, journey, timeline (section color), gitGraph (branch colors). **Skip** pie and radar (native legends already), and skip types where color is not a category key (sequence, packet, architecture, xyChart, quadrant, sankey, mindmap, kanban). Matches LEGEND-02 intent precisely.

### Legacy Example Migration (delegated — research-backed default, USER-ACCEPTED)
- **D-06:** EXAMPLE-02 migration is scoped to the **~10 catalog-referenced canonical type examples** currently in Format B (bare content + `.meta` sidecar): Flowchart, sequenceDiagram 1, User Journey Diagram, Pie chart diagrams, Class diagrams, Defining Relationship, stateDiagram 1, Gitgraph Diagram 1, Gantt 1, Requirement Diagram, C4 Diagram. These are converted to proper `.tid`, upgraded to the D-01 template, and given the shared tag.
- **D-07:** The remaining **~90 legacy feature-snippet Format B files** (e.g. 4× Automata, 9× Gitgraph theme variants, `interpolate*`, Subgraph 1–4, A-node-shape snippets) are **left as-is** — not deleted, not upgraded, not added to the advanced catalog. They keep rendering. This avoids a 100-file scope explosion and keeps the phase focused on the 26 advanced examples.
- **D-08:** Before creating/migrating, **audit exact existing titles** to avoid collisions between the migrated `.tid` files and any newer Format A tiddler of the same/similar name (research gap note: informal titles like `sequenceDiagram 1`, `Class diagrams`).

### Catalog & Tagging (delegated — research-backed default, USER-ACCEPTED)
- **D-09:** **Single shared discoverability tag `MermaidExample`** applied to all 26 advanced examples (no second `MermaidAdvanced` tag — keep it simple).
- **D-10:** Keep the existing **hand-curated `Mermaid Chart Catalog.tid`** category table (reads well). Update it: fix the "Twenty diagram types" wording to 26, add the 6 missing types (radar, venn, ishikawa, treemap, treeView, wardley) under appropriate categories, and link the new Legend recipe tiddler. Add a complete auto-index — `<<list-links filter:"[tag[MermaidExample]]">>` — as a safety net so no example is unreachable, but the curated categorized table stays the primary navigation.

### Claude's Discretion
- Exact real-world scenario chosen per diagram type (pick domain-relevant, non-contrived examples consistent with the existing `.tid` set).
- Which structural per-type `%%{init}%%` keys (if any) each example demonstrates under D-02 — only where it adds teaching value.
- Exact category placement of the 6 newly-added types in the catalog table.
- Precise wording/columns of each example's syntax table and tips.
- Whether the Legend recipe tiddler also shows the subgraph alternative as a secondary note (D-04 permits but does not require it).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase research (HIGH confidence — fully specifies type inventory, syntax gotchas, legend strategy)
- `.planning/research/SUMMARY.md` — the 26-type inventory table (with canonical keywords + per-type notes), `$$$`-block mandate, per-type syntax gotchas list, legend strategy, Format B migration scope ("~10 older tiddlers"), beta-type research flag, bundle-fact gaps to verify
- `.planning/research/FEATURES.md` — per-type config-key tables (for structural `%%{init}%%` under D-02), the **Legend Support Matrix** (which types have native vs manual legends), and the canonical manual legend pattern
- `.planning/research/PITFALLS.md` — pitfalls 3 (widget-body mangling → `$$$` only), 5 (no native legend / subgraph caveats), 7 (no `%%{init}%%` theme directives in examples → D-02), and per-type parse gotchas
- `.planning/research/STACK.md` — vendored bundle scope (26 types), beta-suffix requirements, architecture built-in icon names
- `.planning/research/ARCHITECTURE.md` — safe-authoring convention (`$$$` block bypasses `getScriptBody()` mangling), example tiddler responsibilities, legend-table rationale

### Roadmap / requirements
- `.planning/ROADMAP.md` §"Phase 7: Advanced Examples & Legends" — goal, 5 success criteria, authoring constraints (`$$$` only, no new assets, no `%%{init}%%` theme directives, beta-type research flag)
- `.planning/REQUIREMENTS.md` §"Advanced Examples" / "Legends" — EXAMPLE-01..03, LEGEND-01..02 wording

### Prior phase
- `.planning/phases/06-config-wiring-foundation/06-CONTEXT.md` — D-02 (author in-source `%%{init}%%` wins via prepend) and D-03 (secure keys) explain why examples can stay theme-neutral yet config still applies; Sankey `R&D` fix landed here

### Existing tiddlers to use as templates / targets
- `mermaid-tw5/tiddlers/Architecture Diagram.tid` — **reference implementation** of the D-01 template (intro→basic→real-world→syntax→tips→backlink, `$$$` blocks)
- `mermaid-tw5/tiddlers/Mermaid Chart Catalog.tid` — the catalog to expand to 26 types (D-10); currently says "Twenty"
- Other Format A `.tid` examples: `Mindmap.tid`, `XY Chart.tid`, `Packet Diagram.tid`, `Timeline.tid`, `Kanban Board.tid`, `Block Diagram.tid`, `Sankey Diagram.tid`, `Quadrant Chart.tid`
- Format B canonical examples to migrate (D-06): `Flowchart`, `sequenceDiagram 1`, `User Journey Diagram`, `Pie chart diagrams`, `Class diagrams`, `Defining Relationship`, `stateDiagram 1`, `Gitgraph Diagram 1`, `Gantt 1`, `Requirement Diagram`, `C4 Diagram` (each has a `.meta` sidecar in `mermaid-tw5/tiddlers/`)

### Bundle facts to verify during planning/authoring (research gaps)
- Sankey v11.15.0+ config keys (`labelStyle`, `nodeWidth`, `nodePadding`, `nodeColors`) — NOT assumed present (bundle is 11.14.0); verify before use
- Architecture built-in icon names (`blank`, `cloud`, `database`, `disk`, `internet`, `server`) recognized by the vendored bundle
- The 5 sparse-doc beta types (`treeView-beta`, `wardley-beta`, `ishikawa-beta`, `treemap-beta`, `venn-beta`) — minimal official docs; investigate syntax before authoring (consider `/gsd-plan-phase 7 --research-phase`)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Format A `.tid` template** (e.g. `Architecture Diagram.tid`): proven structure — front-matter (`created`/`modified`/`title`/`type: text/vnd.tiddlywiki`) then `intro → !! Basic example (fenced + $$$ block) → !! Real-world example → !! Syntax table → !! Tips → [[← Mermaid Chart Catalog]]`. Copy this verbatim as the skeleton for all 26.
- **`$$$text/vnd.tiddlywiki.mermaid` block** routed by `typed-parser.js` — stores raw text and bypasses the fragile `getScriptBody()` WikiText un-parser. Mandatory for every example (research pitfall 3).
- **`Mermaid Chart Catalog.tid`** — existing curated category navigation; extend rather than replace.
- **`<<list-links filter:"[tag[MermaidExample]]">>`** — standard TW macro for the auto-index safety net (D-10).

### Established Patterns
- Phase-6 config wiring is live: `theme`/`look`/`fontFamily` set via widget attr / `mermaid-*` field / config tiddler now actually apply. Author in-source `%%{init}%%` wins (D-02 from Phase 6) — which is exactly why examples must stay theme-neutral so they don't clobber the user's global theme.
- Native legends exist only for `pie` (auto) and `radar` (`showLegend`); everything categorical needs the manual WikiText-table recipe (D-04/D-05).
- CI/CD picks up new `.tid` files automatically — no pipeline changes needed.

### Integration Points
- New example tiddlers and the Legend recipe tiddler live in `mermaid-tw5/tiddlers/`.
- The catalog links examples → legend recipe; the shared `MermaidExample` tag binds the set together (EXAMPLE-03).
- Verification must be a **browser render in the demo TW**, not just the Mermaid live editor (each of the 26 must actually render through the plugin path).

</code_context>

<specifics>
## Specific Ideas

- Template fidelity: the new examples should be indistinguishable in structure from `Architecture Diagram.tid` — same heading rhythm, same fenced-code-then-`$$$`-block pairing (show the source, then render it), same `[[← Mermaid Chart Catalog]]` footer.
- Legend mental model: "a small key table directly under the diagram, swatch → meaning — works for any diagram type and never breaks layout."
- Comment style to mirror: the research legend snippet's `%% ── Main diagram ──────` section banners inside the Mermaid source (D-03).
- Catalog honesty: drop the stale "Twenty diagram types ... nine of them New" framing and make it reflect the true 26.

</specifics>

<deferred>
## Deferred Ideas

- **Bulk cleanup/migration of the ~90 legacy feature-snippet tiddlers** (D-07) — out of scope this phase; candidate for a future tidy-up milestone if desired.
- **Configuration Reference tiddler** (CONFIG-07) and **Capability Matrix tiddler** (DOCS-03) — Phase 8. The capability matrix will note which types have native legends (pie, radar) vs. the manual pattern from this phase.
- **Dedicated theme/look/fontFamily showcase tiddlers** — considered and rejected for Phase 7 (D-02) to avoid overlap with the Phase-8 Config Reference; revisit only if Phase 8 leaves a gap.
- **`handDrawnSeed` / `deterministicIds` / `suppressErrorRendering` documentation** — "should have" items folded into Phase 8 config reference.

</deferred>

---

*Phase: 7-Advanced Examples & Legends*
*Context gathered: 2026-06-08*
</content>
</invoke>
