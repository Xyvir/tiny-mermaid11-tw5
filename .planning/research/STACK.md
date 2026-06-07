# Stack Research — Mermaid 11.14.0 Diagram Type Inventory

**Domain:** TiddlyWiki 5 plugin (mermaid-tw5) — Milestone v0.6.0 Capability Parity
**Researched:** 2026-06-07
**Confidence:** HIGH — primary evidence from grepping the vendored bundle
(`$__plugins_mermaid-tw5_mermaid.min.js`, 3,165,091 bytes, dated 2026-04-28),
cross-referenced with official Mermaid docs and GitHub changelog.

---

## Research Method

Two evidence sources were used for every claim:

1. **Bundle grep** — the vendored `mermaid.min.js` was searched for:
   - Diagram ID variable declarations (`var X="typename"`)
   - Detector regex functions (`o(t=>/^\s*keyword/.test(t),"detector")`)
   - Presence/absence of specific keyword strings (counts)

2. **Official docs / changelog** — `mermaid.js.org` syntax pages and the GitHub
   CHANGELOG (v11.13.0, v11.14.0 entries) were fetched for version attribution
   and external-asset requirements.

Where the two sources agree the confidence is HIGH. Where only one source was
available (e.g., some version-introduction dates) the confidence is noted as MEDIUM.

---

## Diagram Type Inventory

### Core (Stable) Diagram Types — All Render With Vendored Bundle

These types have been in Mermaid for multiple major versions, are fully rendered
by the bundled code, and require no external assets.

| Internal ID | Display Name | Start Keyword(s) | Detector regex (from bundle) | In-scope? |
|-------------|-------------|-------------------|------------------------------|-----------|
| `flowchart` / `flowchart-v2` | Flowchart | `flowchart LR` / `graph LR` | `/^\s*flowchart/` or `/^\s*graph/` (dagre renderer) | YES |
| `er` | Entity Relationship | `erDiagram` | `/^\s*erDiagram/` | YES |
| `gitGraph` | Git Graph | `gitGraph` | `/^\s*gitGraph/` | YES |
| `gantt` | Gantt | `gantt` | `/^\s*gantt/` | YES |
| `pie` | Pie Chart | `pie` | `/^\s*pie/` | YES |
| `quadrantChart` | Quadrant Chart | `quadrantChart` | `/^\s*quadrantChart/` | YES |
| `xychart` | XY Chart | `xychart-beta` or `xychart` | `/^\s*xychart(-beta)?/` | YES |
| `requirement` | Requirement Diagram | `requirementDiagram` or `requirement` | `/^\s*requirement(Diagram)?/` | YES |
| `sequence` | Sequence Diagram | `sequenceDiagram` | `/^\s*sequenceDiagram/` | YES |
| `class` / `classDiagram` | Class Diagram | `classDiagram` or `classDiagram-v2` | `/^\s*classDiagram/` | YES |
| `state` / `stateDiagram` | State Diagram | `stateDiagram` or `stateDiagram-v2` | `/^\s*stateDiagram/` | YES |
| `journey` | User Journey | `journey` | `/^\s*journey/` | YES |
| `c4` | C4 Diagram | `C4Context`, `C4Container`, `C4Component`, `C4Dynamic`, `C4Deployment` | `/^\s*C4Context\|C4Container\|...` | YES |
| `mindmap` | Mindmap | `mindmap` | `/^\s*mindmap/` | YES |
| `timeline` | Timeline | `timeline` | `/^\s*timeline/` | YES |

**Note on flowchart/graph duality:** The bundle registers two internal IDs
(`flowchart` for the legacy dagre-d3 path and `flowchart-v2` for the dagre-wrapper
path). Both respond to `graph TD` and `flowchart LR`. The legacy `graph` keyword
is handled by the same renderer. For the purposes of advanced examples, these are
**one diagram type** with two start keywords — recommend using `flowchart` (the
modern keyword).

**Note on classDiagram / classDiagram-v2:** Same situation — both are registered
internally; `classDiagram-v2` is the newer dagre-wrapper renderer. Use `classDiagram`
as the recommended keyword.

**Note on stateDiagram / stateDiagram-v2:** `stateDiagram-v2` maps to the
`stateDiagram` internal ID via the dagre-wrapper detector. Both keywords work.
Use `stateDiagram-v2` as the canonical form.

---

### Newer / Beta Diagram Types — Introduced in v11.x, In Bundle, In-Scope

These types were added during the v11.x series. All render fully with the vendored
bundle without extra assets. Keywords verified by detector regex in bundle.

| Internal ID | Display Name | Start Keyword | Detector regex (from bundle) | Added in | In-scope? | Notes |
|-------------|-------------|---------------|------------------------------|----------|-----------|-------|
| `sankey` | Sankey | `sankey-beta` or `sankey` | `/^\s*sankey(-beta)?/` | v10.3 | YES | Both keywords accepted |
| `block` | Block Diagram | `block-beta` or `block` | `/^\s*block(-beta)?/` | v11.0 | YES | Both keywords accepted |
| `packet` | Packet Diagram | `packet-beta` or `packet` | `/^\s*packet(-beta)?/` | v11.0 | YES | Both keywords accepted |
| `kanban` | Kanban | `kanban` | `/^\s*kanban/` | v11.4 | YES | No beta suffix — use `kanban` |
| `architecture` | Architecture | `architecture-beta` | `/^\s*architecture/` | v11.0 | YES (degraded) | Built-in icons: `blank`, `cloud`, `database`, `disk`, `internet`, `server`; external icon packs are OPTIONAL; diagram renders without them |
| `radar` | Radar Chart | `radar-beta` | `/^\s*radar-beta/` | v11.12 | YES | Beta suffix required |
| `treemap` | Treemap | `treemap-beta` or `treemap` | `/^\s*treemap/` | v11.14 | YES | Both keywords accepted per TREEMAP_KEYWORD regex |
| `treeView` | TreeView | `treeView-beta` | `/^\s*treeView-beta/` | v11.14 | YES | Beta suffix required; note camelCase `V` |
| `venn` | Venn Diagram | `venn-beta` | `/^\s*venn-beta/` | v11.12.3 | YES | Beta suffix required |
| `wardley-beta` | Wardley Map | `wardley-beta` | `/^\s*wardley-beta/i` | v11.14 | YES | Beta suffix required; case-insensitive |
| `ishikawa` | Ishikawa (Fishbone) | `ishikawa-beta` or `ishikawa` | `/^\s*ishikawa(-beta)?\b/i` | v11.12.3 | YES | Both keywords; case-insensitive |

---

### Out-of-Scope Diagram Types / Registrations

These are registered in the bundle or referenced in docs but are excluded by the
milestone's hard constraint: no extra bundled assets.

| Internal ID | Display Name | Start Keyword | Reason Out of Scope | Asset Required |
|-------------|-------------|---------------|---------------------|----------------|
| `flowchart-elk` | Flowchart (ELK layout) | `flowchart-elk` | ELK moved to external package in v11; bundle emits a warning: *"flowchart-elk was moved to an external package in Mermaid v11"* | `@mermaid-js/layout-elk` npm package |
| — | Event Modeling | — | Zero occurrences of `eventModel`/`eventModeling` in bundle; this type does not exist in 11.14.0 | N/A — not in bundle at all |
| — | Venn (as non-beta) | — | No non-beta venn keyword; only `venn-beta` is registered | N/A — beta-only keyword |

**On KaTeX / Math:** KaTeX code IS present in the vendored bundle (~4 references),
but it is used only for inline LaTeX math rendering inside `sequenceDiagram` notes
and similar text — not as a separate diagram type. Math rendering within diagrams
works without any extra bundle. There is no `math`/`latex` diagram type. The hard
constraint "no KaTeX bundle" does not affect any diagram type because KaTeX is
already included in mermaid.min.js. MEDIUM confidence (docs do not explicitly
confirm KaTeX bundling status, but grep evidence is clear).

**On ZenUML:** `zenuml` / `ZenUML` / `zenUml` / `zen-uml` all return **0 hits**
in the vendored bundle. ZenUML is completely absent from Mermaid 11.14.0 — it was
removed as a built-in type and now requires a separate package. CONFIRMED OUT OF SCOPE.

**On iconShape / icon packs:** `iconShape` returns 0 hits. `icon-shape` appears 5
times as an SVG CSS class name only, not as an icon-pack loader. External icon packs
(Iconify) for architecture diagrams are optional and architecture renders with the
6 built-in icons (`blank`, `cloud`, `database`, `disk`, `internet`, `server`)
without any extra asset. The plugin should document that external icon packs are
unsupported but the diagram type itself is IN-SCOPE.

**On `info` diagram:** The `info` / `showInfo` type is present in the bundle as an
internal utility diagram that renders the Mermaid library version and author info.
It is not documented as a user-facing diagram type in any official Mermaid docs.
It is intentionally excluded from this inventory.

---

## Definitive In-Scope List for Advanced Examples

Exactly **25 user-facing diagram types** render fully with the vendored Mermaid
11.14.0 bundle. Each needs one advanced example tiddler in v0.6.0.

| # | Diagram Type | Canonical Start Keyword | Beta? | v11.x New? |
|---|-------------|-------------------------|-------|-----------|
| 1 | Flowchart | `flowchart` | No | No |
| 2 | Sequence Diagram | `sequenceDiagram` | No | No |
| 3 | Class Diagram | `classDiagram` | No | No |
| 4 | State Diagram | `stateDiagram-v2` | No | No |
| 5 | Entity Relationship | `erDiagram` | No | No |
| 6 | User Journey | `journey` | No | No |
| 7 | Gantt | `gantt` | No | No |
| 8 | Pie Chart | `pie` | No | No |
| 9 | Quadrant Chart | `quadrantChart` | No | No |
| 10 | Requirement Diagram | `requirementDiagram` | No | No |
| 11 | Git Graph | `gitGraph` | No | No |
| 12 | C4 Diagram | `C4Context` (or other C4 variant) | No | No |
| 13 | Mindmap | `mindmap` | No | No |
| 14 | Timeline | `timeline` | No | No |
| 15 | Sankey | `sankey-beta` | Yes (beta alias accepted) | No (v10.3) |
| 16 | XY Chart | `xychart-beta` | Yes (beta alias accepted) | No (v10.6) |
| 17 | Block Diagram | `block-beta` | Yes (beta alias accepted) | Yes (v11.0) |
| 18 | Packet Diagram | `packet-beta` | Yes (beta alias accepted) | Yes (v11.0) |
| 19 | Kanban | `kanban` | No | Yes (v11.4) |
| 20 | Architecture | `architecture-beta` | Yes | Yes (v11.0) |
| 21 | Radar Chart | `radar-beta` | Yes (required) | Yes (v11.12) |
| 22 | Venn Diagram | `venn-beta` | Yes (required) | Yes (v11.12.3) |
| 23 | Ishikawa (Fishbone) | `ishikawa-beta` | Yes (beta alias accepted) | Yes (v11.12.3) |
| 24 | Treemap | `treemap-beta` | Yes (beta alias accepted) | Yes (v11.14) |
| 25 | TreeView | `treeView-beta` | Yes (required) | Yes (v11.14) |
| 26 | Wardley Map | `wardley-beta` | Yes (required) | Yes (v11.14) |

**Note:** The final count is 26, not 25. Wardley Maps were added in v11.14.0
(confirmed by both bundle grep and changelog) and must be included.

---

## Architecture Diagram — Degraded vs Full Render Clarification

The `architecture-beta` type is IN-SCOPE with a documented limitation:

- **Renders fully** with the 6 built-in icons: `blank`, `cloud`, `database`, `disk`, `internet`, `server`
- **External icon packs** (Iconify, 200,000+ icons) require calling `registerIconPacks()` with a CDN or bundled icon pack — this is an OPTIONAL enhancement, not required for the diagram to render
- **Advanced example** should use only the 6 built-in icon names
- **Capability matrix doc** should note that external icon packs are unsupported in the mermaid-tw5 context

---

## Deferred / Out-of-Scope Summary Table

| Feature | Reason Deferred | Missing Asset |
|---------|----------------|---------------|
| ELK layout engine (`flowchart-elk`) | Removed from core in Mermaid v11; bundle warns it was moved to external package | `@mermaid-js/layout-elk` |
| ZenUML diagrams | Completely absent from vendored bundle (0 hits) | `@mermaid-js/mermaid-zenuml` |
| External icon packs (architecture) | Requires `registerIconPacks()` + CDN or bundled Iconify data | Iconify icon pack bundle |
| Event Modeling | Does not exist in Mermaid 11.14.0 (0 hits in bundle, not in docs for this version) | N/A — not yet released |
| Math / LaTeX diagrams | No `math` diagram type exists; KaTeX is bundled for inline text only | N/A — KaTeX already in bundle |

---

## Version Attribution for New Types

| Diagram Type | Introduced | Source |
|-------------|-----------|--------|
| Sankey | v10.3.0 | MEDIUM (changelog search) |
| XY Chart | v10.6.0 | MEDIUM (changelog search) |
| Block Diagram | v11.0.0 | MEDIUM |
| Packet Diagram | v11.0.0 | MEDIUM |
| Architecture | v11.0.0 | MEDIUM |
| Kanban | v11.4.0 | MEDIUM |
| Radar | v11.12.0 | HIGH (blog post confirms) |
| Venn | v11.12.3 | HIGH (official docs page header) |
| Ishikawa | v11.12.3 | HIGH (official docs page header) |
| Treemap | v11.14.0 | HIGH (bundle confirms, changelog confirms) |
| TreeView | v11.14.0 | HIGH (bundle confirms, changelog confirms) |
| Wardley Maps | v11.14.0 | HIGH (bundle confirms, changelog confirms) |

---

## Sources

- Vendored bundle: `mermaid-tw5/plugins/mermaid-tw5/$__plugins_mermaid-tw5_mermaid.min.js` (3.16 MB, dated 2026-04-28) — HIGH confidence; primary evidence for all detector patterns and keyword verification
- [Mermaid v11.13.0 blog post](https://mermaid.ai/blog/posts/mermaid-v11-13-0-two-new-diagram-types-and-our-most-polished-release-yet) — confirms Venn and Ishikawa added in v11.13
- [Mermaid GitHub CHANGELOG](https://github.com/mermaid-js/mermaid/blob/master/packages/mermaid/CHANGELOG.md) — confirms v11.14.0 additions (Wardley Maps, TreeView, Treemap, neo look)
- [mermaid.js.org/syntax/venn.html](https://mermaid.js.org/syntax/venn.html) — confirms `venn-beta` keyword, v11.12.3+
- [mermaid.js.org/syntax/architecture.html](https://mermaid.js.org/syntax/architecture.html) — confirms `architecture-beta` keyword, built-in icons, optional external icon packs
- [mermaid.js.org/syntax/kanban.html](https://mermaid.js.org/syntax/kanban.html) — confirms `kanban` keyword (no beta suffix)
- [mermaid.js.org/syntax/treemap.html](https://mermaid.js.org/syntax/treemap.html) — confirms `treemap-beta` keyword
- [mermaid.js.org/intro/](https://mermaid.js.org/intro/) — general diagram type index

---
*Stack research for: mermaid-tw5 v0.6.0 diagram type inventory*
*Researched: 2026-06-07*
