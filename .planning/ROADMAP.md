# Roadmap: mermaid-tw5

**Created:** 2026-04-26
**Granularity:** Standard
**Mode:** YOLO

## Milestones

- ✅ **v0.5.0 Maintenance & Automation** — Phases 1-5 (shipped 2026-04-27)
- 📋 **v0.6.0 Capability Parity & Advanced Examples** — Phases 6-8 (active)

## Phases

<details>
<summary>✅ v0.5.0 (Phases 1-5) — SHIPPED 2026-04-27</summary>

### Phase 1: Cleanup & Polish

**Goal:** Remove accumulated technical debt and establish consistent code style.
**Requirements:** CLEAN-01, CLEAN-02, STYLE-01
**Success Criteria:**

1. No `console.log` statements remain in `wrapper.js` zoom logic
2. Commented-out Node.js/browser detection block is removed
3. JavaScript style is consistent across all plugin source files
4. All existing examples continue to render correctly after cleanup

### Phase 2: Reliability & Testing

**Goal:** Improve error handling and establish automated testing.
**Requirements:** QUAL-01, QUAL-02
**Success Criteria:**

1. Rendering errors display user-friendly messages instead of raw exception text
2. Test suite runs automatically and covers widget rendering path
3. Test suite covers typed parser behavior
4. Tests can be run locally and in CI

### Phase 3: Performance Optimization

**Goal:** Reduce the performance impact of loading mermaid.js and D3.js on pages without diagrams.
**Requirements:** PERF-01
**Success Criteria:**

1. Lazy loading mechanism is implemented and functional
2. Pages without mermaid content do not load mermaid.min.js or d3.v6.min.js
3. Pages with mermaid content load libraries on demand with no visible delay
4. Bundle size analysis documents before/after impact

### Phase 4: Dependency Modernization

**Goal:** Evaluate and adopt a modern Mermaid.js version while controlling bundle size.
**Requirements:** UPDT-01
**Success Criteria:**

1. Modern Mermaid.js versions (10.x+) are evaluated for size and compatibility
2. Lite build or modular import strategy is investigated
3. Decision is documented in PROJECT.md Key Decisions
4. N/A — adoption criteria not met (size >1.5 MB)
5. Rationale documented with upstream tracking reference (mermaid-js/mermaid#4616)

### Phase 5: Developer Experience

**Goal:** Automate build verification and improve project documentation for contributors.
**Requirements:** AUTO-01, DOCS-02
**Success Criteria:**

1. GitHub Actions workflow runs tests on push/PR
2. GitHub Actions workflow builds and deploys demo to GitHub Pages
3. Developer setup instructions are added to README or CONTRIBUTING.md
4. Contribution guidelines specify coding standards and PR process

</details>

### v0.6.0 — Capability Parity & Advanced Examples (Phases 6-8)

- [x] **Phase 6: Config Wiring Foundation** - Make user-supplied config (theme, look, fontFamily, securityLevel, per-type) actually apply to rendering (completed 2026-06-08)
- [ ] **Phase 7: Advanced Examples & Legends** - Author an advanced, well-commented example for all 26 in-scope diagram types with legends and a catalog
- [ ] **Phase 8: Capability Matrix & Config Reference** - Document supported vs deferred features and all config keys, with catalog navigation

## Phase Details

### Phase 6: Config Wiring Foundation

**Goal:** User-supplied configuration (theme, look, fontFamily, securityLevel, and per-diagram-type options) is actually applied when diagrams render, instead of being silently ignored.
**Depends on:** Nothing within v0.6.0 (first phase of the milestone; builds on shipped v0.5.0 plugin)
**Requirements:** CONFIG-02, CONFIG-03, CONFIG-04, CONFIG-05, CONFIG-06
**Success Criteria** (what must be TRUE):

  1. A user who sets `<$mermaid theme="forest">` (or the equivalent `mermaid-theme` field) sees the diagram render in the forest theme — config is no longer a silent no-op (CONFIG-02)
  2. On a page with multiple diagrams, `initialize()` runs once and all diagrams share one consistent global config — no "last diagram wins" interference (CONFIG-03)
  3. A user can override `securityLevel` via the `$:/plugins/orange/mermaid-tw5/config` shadow tiddler, with `'loose'` remaining the documented default that keeps click navigation working (CONFIG-04)
  4. A user can set `theme`, `themeVariables`, `look` (handDrawn/classic), and `fontFamily` globally and per-diagram, and see them applied (CONFIG-05)
  5. A user can supply per-diagram-type config (e.g. flowchart, sequence, gantt) via the documented JSON config-tiddler pattern and see it take effect (CONFIG-06)**Plans:** 3/3 plans complete

**Wave 1**

- [x] 06-01-PLAN.md — Test mock extensions, JSON config tiddler, plugin.info, Sankey R&D fix (wave 1)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 06-02-PLAN.md — buildSiteConfig() + once-per-page initialize() + global config tests (wave 2)

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 06-03-PLAN.md — Per-widget %%{init}%% prepend injection + tests + live checkpoint (wave 3)

**Cross-cutting constraints:**

- The 14 currently-passing tests stay green (D-09 test gate — research-corrected from the stale '13' in CONTEXT.md)

*Hard-dependency note:* This phase is the milestone foundation. Per research SUMMARY.md, advanced examples demonstrating theme/look/fontFamily/securityLevel cannot be proven until the `getOptions()` → `mermaidAPI.initialize()` merge lands here. The Sankey `R&D` parse-error fix (owned as a requirement by Phase 7's EXAMPLE-02) is also validated as a prerequisite during this phase so Phase 7 Sankey authoring is unblocked. All existing 13 tests must continue to pass.

### Phase 7: Advanced Examples & Legends

**Goal:** Every in-scope diagram type the vendored Mermaid 11.14.0 bundle supports has an advanced, well-commented example, with legends where color-by-category is used, all discoverable from a catalog.
**Depends on:** Phase 6 (config must apply before config-demonstrating examples are meaningful; Sankey `R&D` bug must be fixed)
**Requirements:** EXAMPLE-01, EXAMPLE-02, EXAMPLE-03, LEGEND-01, LEGEND-02
**Success Criteria** (what must be TRUE):

  1. Each of the 26 in-scope diagram types has an advanced, well-commented example that renders correctly in the demo wiki, authored exclusively with `$$$text/vnd.tiddlywiki.mermaid` block syntax (EXAMPLE-01)
  2. The previously broken Sankey example renders cleanly (no `R&D` parse error) and older bare-content tiddlers are migrated to consistent `.tid` format (EXAMPLE-02)
  3. A user can find every advanced example from a shared tag and a catalog/index tiddler (EXAMPLE-03)
  4. A reusable legend / "key box" recipe tiddler documents how to show which color maps to each category (LEGEND-01)
  5. Every advanced example that colors by category includes a legend so it stays readable (LEGEND-02)

**Plans:** 2/6 plans executed
Plans:
**Wave 1**

- [x] 07-01-PLAN.md — Legend Recipe tiddler (LEGEND-01) + Phase 7 structural test scaffold (wave 1)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 07-02-PLAN.md — Format B→A migration batch 1: Flowchart, Sequence, Class, State, User Journey, Git Graph (wave 2)
- [ ] 07-03-PLAN.md — Format B→A migration batch 2: Entity Relationship, Gantt, Pie, Requirement, C4 (wave 2)
- [ ] 07-04-PLAN.md — Expand 9 existing Format A tiddlers + Block/Timeline legends (wave 2)
- [ ] 07-05-PLAN.md — 6 net-new beta-type tiddlers: Radar, Venn, Ishikawa, Treemap, Tree View, Wardley (wave 2)

**Wave 3** *(blocked on Wave 2 completion)*

- [ ] 07-06-PLAN.md — Catalog update (EXAMPLE-03 / D-10) + phase-completion gate (wave 3)

**UI hint:** yes

*Authoring constraints:* All advanced examples use `$$$text/vnd.tiddlywiki.mermaid` block syntax only — the `getScriptBody()` WikiText un-parser is fragile and the block path is the safe route. No new bundled assets (ELK, ZenUML, icon packs, KaTeX-as-feature all deferred). No `%%{init}%%` theme directives in examples — reserve `%%{init}%%` for structural per-type config so it does not override the user's global theme. The 5 newer beta types (treeView-beta, wardley-beta, ishikawa-beta, treemap-beta, venn-beta) have sparse docs — consider `--research-phase` during planning.

### Phase 8: Capability Matrix & Config Reference

**Goal:** Users understand exactly what the plugin supports, what is deferred and why, and how to configure every supported key — with the catalog linking it all together.
**Depends on:** Phase 7 (the capability matrix links to the example tiddlers, which must exist first)
**Requirements:** CONFIG-07, DOCS-03
**Success Criteria** (what must be TRUE):

  1. A Configuration Reference tiddler documents all supported config keys (global, per-type, `%%{init}%%`, YAML frontmatter) plus accessibility `accTitle`/`accDescr` usage (CONFIG-07)
  2. A Capability Matrix tiddler maps plugin support vs full Mermaid, marking ELK layout, ZenUML, and external icon packs as deferred with rationale (DOCS-03)
  3. The capability matrix notes which diagram types have native legends (pie, radar) vs. need the manual legend pattern from Phase 7 (DOCS-03)
  4. The Mermaid Chart Catalog links to both the Configuration Reference and the Capability Matrix, and the README capability section matches the in-wiki matrix (DOCS-03)

**Plans:** TBD
**UI hint:** yes

*Note:* Content is fully specified in research files; standard patterns — phase research can be skipped. Config Reference and catalog updates are partially independent of individual Phase 7 examples and may start early.

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
| ----- | --------- | -------------- | ------ | --------- |
| 1. Cleanup & Polish | v0.5.0 | 2/2 | Complete | 2026-04-27 |
| 2. Reliability & Testing | v0.5.0 | 2/2 | Complete | 2026-04-27 |
| 3. Performance Optimization | v0.5.0 | 2/2 | Complete | 2026-04-27 |
| 4. Dependency Modernization | v0.5.0 | 2/2 | Complete | 2026-04-27 |
| 5. Developer Experience | v0.5.0 | 2/2 | Complete | 2026-04-27 |
| 6. Config Wiring Foundation | v0.6.0 | 3/3 | Complete    | 2026-06-08 |
| 7. Advanced Examples & Legends | v0.6.0 | 2/6 | In Progress|  |
| 8. Capability Matrix & Config Reference | v0.6.0 | 0/? | Not started | - |

---

*Roadmap created: 2026-04-26*
*Last updated: 2026-06-07 — added v0.6.0 phases 6-8 (Capability Parity & Advanced Examples)*
