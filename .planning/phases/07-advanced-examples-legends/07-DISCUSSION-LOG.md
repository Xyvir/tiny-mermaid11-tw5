# Phase 7: Advanced Examples & Legends - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-08
**Phase:** 7-Advanced Examples & Legends
**Areas discussed:** Example anatomy & depth, Legend recipe & scope

---

## Gray-area selection

| Area | Description | Selected for discussion |
|------|-------------|-------------------------|
| Example anatomy & depth | Template, depth, config-showcase policy, comment style | ✓ |
| Legacy ~100 Format B files | Migrate-all / fold-and-prune / keep-separate | (delegated to default) |
| Catalog & tagging scheme | Auto-gen vs curated; tag naming; categorization | (delegated to default) |
| Legend recipe & scope | WikiText table vs subgraph; which examples get legends | ✓ |

**User's choice:** Discuss "Example anatomy & depth" and "Legend recipe & scope"; resolve the other two with research-backed defaults (presented and accepted before writing CONTEXT.md).

---

## Example Anatomy & Depth

### Q1 — Template structure for all 26 examples

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — standardize on it | All 26 use the existing template (intro→basic→real-world→syntax→tips→backlink) | ✓ |
| Yes, but advanced-only | Drop the basic-example section; advanced + syntax + tips only | |
| Looser — fit per type | Template as guide, vary per diagram type | |

**User's choice:** Standardize on the existing `.tid` template → **D-01**.

### Q2 — Relationship between examples and Phase-6 config

| Option | Description | Selected |
|--------|-------------|----------|
| Theme-neutral, structural only | Never set theme/look/fontFamily; `%%{init}%%` only for structural per-type config | ✓ |
| Also flag config in tips | Theme-neutral + a Tips pointer to try theme=forest etc. | |
| A few dedicated config demos | Theme-neutral 26 + 1-2 separate config showcase tiddlers | |

**User's choice:** Theme-neutral, structural-only → **D-02**. Enforces research pitfall-7; avoids Phase-8 overlap.

### Q3 — Where "well-commented" commentary lives

| Option | Description | Selected |
|--------|-------------|----------|
| Both, section-style | Inline `%%` section-banner comments in source + WikiText tips/syntax prose | ✓ |
| WikiText prose only | Clean source, all explanation in prose | |
| Inline `%%` comments only | Heavy source comments, minimal prose | |

**User's choice:** Both, section-style → **D-03**.

---

## Legend Recipe & Scope

### Q1 — Canonical reusable legend recipe (LEGEND-01)

| Option | Description | Selected |
|--------|-------------|----------|
| WikiText table below diagram | Swatch→category table; works for all types; no layout distortion | ✓ |
| Disconnected styled subgraph | In-SVG floating styled nodes; flowchart/block only; layout caveats | |
| Table canonical + subgraph as alt | Table primary, subgraph documented as flowchart alternative | |

**User's choice:** WikiText table below diagram → **D-04**.

### Q2 — Which examples carry a legend (LEGEND-02)

| Option | Description | Selected |
|--------|-------------|----------|
| Only color-by-category, skip natives | Legend on classDef/style/section-color examples; skip pie/radar (native) and non-categorical color | ✓ |
| Every example that uses any color | Legend on any non-default-color example | |
| Minimal — a few showcases | Only 2-3 flagship examples demonstrate the recipe | |

**User's choice:** Only color-by-category, skip natives → **D-05**.

---

## Delegated defaults (presented & accepted)

| Area | Default locked | Decisions |
|------|----------------|-----------|
| Legacy ~100 Format B files | Migrate only the ~10 catalog-referenced canonical examples to `.tid`; leave the ~90 feature-snippets as-is (not deleted); audit titles for collisions | D-06, D-07, D-08 |
| Catalog & tagging | Single shared tag `MermaidExample`; keep curated catalog, grow 20→26, add Legend recipe link + `list-links` auto-index safety net | D-09, D-10 |

**User's choice:** "Accept both — write CONTEXT."

---

## Claude's Discretion

- Real-world scenario per diagram type; structural `%%{init}%%` keys demonstrated; category placement of the 6 new types; syntax-table/tips wording; whether the Legend recipe also notes the subgraph alternative.

## Deferred Ideas

- Bulk cleanup/migration of the ~90 legacy feature-snippet tiddlers (future tidy-up).
- Configuration Reference (CONFIG-07) and Capability Matrix (DOCS-03) — Phase 8.
- Dedicated theme/look/fontFamily showcase tiddlers — rejected to avoid Phase-8 overlap.
- `handDrawnSeed` / `deterministicIds` / `suppressErrorRendering` docs — Phase 8 config reference.
</content>
