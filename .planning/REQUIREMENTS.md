# Requirements: mermaid-tw5 v0.6.0

**Milestone:** v0.6.0 — Capability Parity & Advanced Examples
**Status:** Active
**Core value:** TiddlyWiki users can create and view rich Mermaid diagrams natively within their notebooks without leaving the wiki environment.

---

## v0.6.0 Requirements

### Configuration Parity

- [x] **CONFIG-02**: User-supplied configuration (widget attributes and `mermaid-*` tiddler fields) is actually applied to rendering — fix the `getOptions()` → `mermaidAPI.initialize()` wiring so config is no longer a silent no-op
- [x] **CONFIG-03**: `initialize()` runs once per page (in the lazy-load block), so multi-diagram pages share consistent global config instead of the last diagram winning
- [x] **CONFIG-04**: User can override `securityLevel` via a config shadow tiddler, with `'loose'` as the documented default (required for click navigation)
- [x] **CONFIG-05**: User can set global appearance — `theme`, `themeVariables`, `look` (handDrawn/classic), `fontFamily` — and have it applied to diagrams
- [x] **CONFIG-06**: User can set per-diagram-type config (flowchart, sequence, gantt, etc.) via a documented JSON attribute/field pattern
- [ ] **CONFIG-07**: A Configuration Reference tiddler documents all supported config keys plus accessibility (`accTitle`/`accDescr`) usage

### Advanced Examples

- [ ] **EXAMPLE-01**: An advanced, well-commented example exists for every in-scope diagram type (26 types renderable with the vendored Mermaid 11.14.0 bundle), authored exclusively with `$$$text/vnd.tiddlywiki.mermaid` blocks
- [ ] **EXAMPLE-02**: Existing broken or trivial examples are upgraded — fix the Sankey `R&D` parse error and migrate older bare-content tiddlers to consistent `.tid` format
- [ ] **EXAMPLE-03**: Advanced examples are discoverable via a shared tag and a catalog/index tiddler

### Legends

- [ ] **LEGEND-01**: A documented legend / "key box" pattern (WikiText table or styled subgraph) shows which color maps to each category, provided as a reusable recipe tiddler
- [ ] **LEGEND-02**: Advanced examples that use color-by-category include a legend so they remain readable

### Capability Documentation

- [ ] **DOCS-03**: A Capability Matrix tiddler maps plugin support vs full Mermaid — marking ELK layout, ZenUML, and external icon packs as deferred with rationale, and noting which diagram types have native legends (pie, radar) vs. need the manual pattern

---

## Future Requirements (Deferred)

- **FUT-ELK**: Bundle the ELK layout engine (`@mermaid-js/layout-elk`) for `layout: 'elk'` on large flowcharts — deferred (extra asset, bundle growth)
- **FUT-ICONS**: Register external icon packs for architecture diagrams / `iconShape` — deferred (extra asset)
- **FUT-ZENUML**: Add the ZenUML diagram bundle — deferred (absent from core bundle, extra asset)
- **FUT-EXPORT**: SVG/PNG export and copy-to-clipboard for rendered diagrams — deferred (separate feature track)

---

## Out of Scope

- **ELK / ZenUML / icon packs / KaTeX-as-feature** — anything requiring additional bundled assets; the milestone constraint is no bundle growth from extra assets. (KaTeX is already vendored, so inline math in labels works incidentally, but is not a milestone deliverable.)
- **Diagram editing UI** — viewing/authoring via tiddler source only; no in-wiki visual editor
- **Native legend implementation in Mermaid** — upstream has no generic legend (issue #2110); the plugin documents a pattern rather than patching Mermaid
- **Tightening `securityLevel` as default** — `'loose'` stays the default because click navigation requires it; stricter levels are user opt-in only

---

## Traceability

| Requirement | Phase | Status | Outcome |
|-------------|-------|--------|---------|
| CONFIG-02 | Phase 6 | Complete | |
| CONFIG-03 | Phase 6 | Complete | |
| CONFIG-04 | Phase 6 | Complete | |
| CONFIG-05 | Phase 6 | Complete | |
| CONFIG-06 | Phase 6 | Complete | |
| CONFIG-07 | Phase 8 | Pending | |
| EXAMPLE-01 | Phase 7 | Pending | |
| EXAMPLE-02 | Phase 7 | Pending | |
| EXAMPLE-03 | Phase 7 | Pending | |
| LEGEND-01 | Phase 7 | Pending | |
| LEGEND-02 | Phase 7 | Pending | |
| DOCS-03 | Phase 8 | Pending | |

*(Phase column filled by roadmap creation.)*
