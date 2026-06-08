# Phase 7: Advanced Examples & Legends — Research

**Researched:** 2026-06-08
**Domain:** TiddlyWiki 5 tiddler authoring — Mermaid 11.14.0 advanced examples, legend patterns, catalog navigation
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** All 26 advanced examples follow the **existing `.tid` template**, standardized: *intro → basic example → real-world (advanced) example → syntax table → tips → back-link to catalog*. The ~10 existing newer `.tid` examples (Architecture Diagram, Mindmap, XY Chart, Packet Diagram, Timeline, Kanban Board, Block Diagram, Sankey Diagram, Quadrant Chart) are the reference implementation of this template.
- **D-02:** Examples are **theme-neutral**. They never set `theme`/`look`/`fontFamily`/`themeVariables`. `%%{init}%%` (or YAML frontmatter) is used **only** for *structural per-type config* (e.g. `gantt.barHeight`, `flowchart.curve`) where it genuinely improves the example — never for appearance.
- **D-03:** "Well-commented" means **both**: inline `%%` comments inside the Mermaid source mark major sections (the `%% ── Main diagram ──` style), AND the WikiText tips/syntax sections explain the concepts.
- **D-04:** The canonical reusable legend recipe (LEGEND-01) is a **WikiText table below the diagram** mapping color swatch → category. The disconnected styled-subgraph pattern is NOT the canonical recipe.
- **D-05:** Legends are added **only to examples that color by category** via `classDef`/`style`/section colors — e.g. flowchart, block, state, class, requirement, journey, timeline (section color), gitGraph (branch colors). **Skip** pie and radar (native legends already), and skip types where color is not a category key.
- **D-06:** EXAMPLE-02 migration is scoped to the **~10 catalog-referenced canonical type examples** currently in Format B (bare content + `.meta` sidecar).
- **D-07:** The remaining **~90 legacy feature-snippet Format B files** are **left as-is**.
- **D-08:** Before creating/migrating, **audit exact existing titles** to avoid collisions.
- **D-09:** **Single shared discoverability tag `MermaidExample`** applied to all 26 advanced examples.
- **D-10:** Keep the existing **hand-curated `Mermaid Chart Catalog.tid`** category table. Update it: fix "Twenty diagram types" to 26, add 6 missing types (radar, venn, ishikawa, treemap, treeView, wardley), link the new Legend recipe tiddler. Add auto-index `<<list-links filter:"[tag[MermaidExample]]">>` as a safety net.

### Claude's Discretion

- Exact real-world scenario chosen per diagram type.
- Which structural per-type `%%{init}%%` keys (if any) each example demonstrates under D-02.
- Exact category placement of the 6 newly-added types in the catalog table.
- Precise wording/columns of each example's syntax table and tips.
- Whether the Legend recipe tiddler also shows the subgraph alternative as a secondary note.

### Deferred Ideas (OUT OF SCOPE)

- Bulk cleanup/migration of the ~90 legacy feature-snippet tiddlers (D-07).
- Configuration Reference tiddler (CONFIG-07) and Capability Matrix tiddler (DOCS-03) — Phase 8.
- Dedicated theme/look/fontFamily showcase tiddlers — Phase 8.
- `handDrawnSeed` / `deterministicIds` / `suppressErrorRendering` documentation — Phase 8.

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| EXAMPLE-01 | An advanced, well-commented example exists for every in-scope diagram type (26 types), authored exclusively with `$$$text/vnd.tiddlywiki.mermaid` blocks | Per-type syntax verified; template and comment style established; tiddler inventory maps which need creation vs migration |
| EXAMPLE-02 | Existing broken or trivial examples are upgraded — fix the Sankey `R&D` parse error and migrate older bare-content tiddlers to consistent `.tid` format | Sankey fix already landed in Phase 6 (confirmed in Sankey Diagram.tid); 11 Format B tiddlers identified for migration; title collision audit complete (no conflicts) |
| EXAMPLE-03 | Advanced examples are discoverable via a shared tag and a catalog/index tiddler | `MermaidExample` tag + `<<list-links filter:"[tag[MermaidExample]]">>` pattern established; Catalog update scope defined (D-10) |
| LEGEND-01 | A documented legend / "key box" pattern provides a reusable recipe tiddler | WikiText-table-below-diagram pattern chosen (D-04); canonical pattern documented in this research; tiddler title `Mermaid Legend Recipe` |
| LEGEND-02 | Advanced examples that use color-by-category include a legend | Legend scope matrix defined (D-05); which types need legends identified explicitly |

</phase_requirements>

---

## Summary

Phase 7 is a content-authoring phase — no plugin code changes. All 26 diagram-type tiddlers must be created or migrated to Format A `.tid`, populated with the D-01 advanced example template, tagged `MermaidExample`, and linked from the catalog. The authoring constraint is strict: every diagram must use `$$$text/vnd.tiddlywiki.mermaid` blocks exclusively.

The most research-intensive sub-problem was the 5 sparse-doc beta types (`treeView-beta`, `wardley-beta`, `ishikawa-beta`, `treemap-beta`, `venn-beta`). This research resolves that gap: syntax for all five has been verified against both the vendored bundle's parser grammar and official Mermaid documentation, with working minimal examples confirmed. The 6th new type, `radar-beta`, has better documentation and its `showLegend` keyword is already researched.

The phase breaks into four natural work clusters: (1) create 6 new tiddlers for the types that have no existing tiddler at all (radar, venn, ishikawa, treemap, treeView, wardley), (2) create/rewrite 9 tiddlers for stable types that currently lack a `.tid` file (flowchart, sequence, class, state, er, journey, gantt, pie, gitGraph, C4, requirement — these exist only as Format B with the wrong title convention), (3) expand the 9 existing Format A tiddlers (architecture, block, kanban, mindmap, packet, quadrant, sankey, timeline, xyChart) with advanced sections, and (4) create the Legend Recipe tiddler + update the catalog.

**Primary recommendation:** Author each tiddler against the `Architecture Diagram.tid` template exactly. Run every diagram in the demo wiki before committing — the browser render is the acceptance test, not the Mermaid live editor.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Diagram rendering | Browser (Mermaid.js) | — | All rendering is client-side SVG generation |
| Example tiddler storage | Filesystem (`.tid` files) | TW runtime | Files are served by TiddlyWiki node.js; read into wiki at load |
| Catalog navigation | TW WikiText macros | — | `<<list-links>>` is a built-in TW macro; no plugin logic needed |
| Legend display | WikiText (HTML table) | — | Legend is WikiText below the `$$$` block; no diagram logic |
| Tag discoverability | TW tag system | — | `MermaidExample` tag applied in tiddler front-matter |
| Build/deploy | CI/CD (GitHub Actions) | — | `tiddlywiki --build index` picks up all `tiddlers/*.tid` automatically |

---

## Tiddler Inventory (Definitive — 26 Types)

### Status of each of the 26 types

| # | Display Name | Canonical Keyword | Current Tiddler State | Phase 7 Action |
|---|-------------|-------------------|-----------------------|----------------|
| 1 | Flowchart | `flowchart` | Format B: `Flowchart` + `Flowchart.meta` | Migrate to `Flowchart.tid` (new title per D-01 template) |
| 2 | Sequence Diagram | `sequenceDiagram` | Format B: `sequenceDiagram 1` + `.meta` | Migrate to `Sequence Diagram.tid` |
| 3 | Class Diagram | `classDiagram` | Format B: `Class diagrams` + `.meta` | Migrate to `Class Diagram.tid` |
| 4 | State Diagram | `stateDiagram-v2` | Format B: `stateDiagram 1` + `.meta` | Migrate to `State Diagram.tid` |
| 5 | Entity Relationship | `erDiagram` | Format B: `Defining Relationship` + `.meta` | Migrate to `Entity Relationship.tid` |
| 6 | User Journey | `journey` | Format B: `User Journey Diagram` + `.meta` | Migrate to `User Journey.tid` |
| 7 | Gantt | `gantt` | Format B: `Gantt 1` + `.meta` | Migrate to `Gantt.tid` |
| 8 | Pie Chart | `pie` | Format B: `Pie chart diagrams` + `.meta` | Migrate to `Pie Chart.tid` |
| 9 | Requirement Diagram | `requirementDiagram` | Format B: `Requirement Diagram` + `.meta` | Migrate to `Requirement Diagram.tid` (same title, new format) |
| 10 | Git Graph | `gitGraph` | Format B: `Gitgraph Diagram 1` + `.meta` | Migrate to `Git Graph.tid` |
| 11 | C4 Diagram | `C4Context` | Format B: `C4 Diagram` + `.meta` | Migrate to `C4 Diagram.tid` (same title, new format) |
| 12 | Architecture | `architecture-beta` | Format A: `Architecture Diagram.tid` | Expand: add advanced section + `MermaidExample` tag |
| 13 | Mindmap | `mindmap` | Format A: `Mindmap.tid` | Expand: add advanced section + tag |
| 14 | Timeline | `timeline` | Format A: `Timeline.tid` | Expand: add advanced section + tag |
| 15 | Sankey | `sankey-beta` | Format A: `Sankey Diagram.tid` (R&D fixed) | Expand: add advanced section + tag |
| 16 | XY Chart | `xychart-beta` | Format A: `XY Chart.tid` | Expand: add advanced section + tag |
| 17 | Block Diagram | `block-beta` | Format A: `Block Diagram.tid` | Expand: add advanced section + tag |
| 18 | Packet Diagram | `packet-beta` | Format A: `Packet Diagram.tid` | Expand: add advanced section + tag |
| 19 | Kanban | `kanban` | Format A: `Kanban Board.tid` | Expand: add advanced section + tag |
| 20 | Quadrant Chart | `quadrantChart` | Format A: `Quadrant Chart.tid` | Expand: add advanced section + tag |
| 21 | Radar Chart | `radar-beta` | **Missing** — no tiddler exists | Create `Radar Chart.tid` from scratch |
| 22 | Venn Diagram | `venn-beta` | **Missing** | Create `Venn Diagram.tid` from scratch |
| 23 | Ishikawa (Fishbone) | `ishikawa-beta` | **Missing** | Create `Ishikawa Diagram.tid` from scratch |
| 24 | Treemap | `treemap-beta` | **Missing** | Create `Treemap.tid` from scratch |
| 25 | TreeView | `treeView-beta` | **Missing** | Create `Tree View.tid` from scratch |
| 26 | Wardley Map | `wardley-beta` | **Missing** | Create `Wardley Map.tid` from scratch |

**Title collision audit (D-08):** Verified programmatically — no existing Format A `.tid` file uses the same title as the new tiddler names above. No collision risk. [VERIFIED: codebase grep]

**Catalog link update note:** The existing Catalog uses informal titles (e.g. `[[sequenceDiagram 1|sequenceDiagram 1]]`, `[[Class diagrams]]`). When new `.tid` files are created with clean titles, the Catalog links must be updated to point to the new titles (e.g. `[[Sequence Diagram]]`, `[[Class Diagram]]`).

---

## Standard Stack

This phase has no npm/pip packages. The "stack" is the authoring format and the TW5 plugin.

### Core Authoring Requirements

| Component | Version/Form | Purpose | Constraint |
|-----------|-------------|---------|------------|
| `$$$text/vnd.tiddlywiki.mermaid` block | TW5 typed block syntax | Safe delivery of Mermaid source to renderer | Mandatory — widget body mode mangles advanced syntax |
| Format A `.tid` file | TW5 tiddler format | Example tiddler storage | Header: `created`/`modified`/`title`/`type: text/vnd.tiddlywiki` |
| `MermaidExample` tag | TW5 tag | Discoverability (EXAMPLE-03) | Applied in front-matter to all 26 tiddlers |
| `<<list-links filter:"[tag[MermaidExample]]">>` | TW5 macro | Auto-index safety net (D-10) | Standard TW built-in — no plugin needed |
| `%%` comments inside `$$$` blocks | Mermaid comment syntax | Inline documentation (D-03) | Safe in both `$$$` and widget modes |

### Package Legitimacy Audit

No external packages are installed in this phase. The plugin code is unchanged; this phase only authors `.tid` content files. Section not applicable.

---

## Beta Type Syntax Reference (Critical Research Priority)

This section resolves the "sparse docs" flag from ROADMAP.md and CONTEXT.md. All 5 types are confirmed working in the vendored Mermaid 11.14.0 bundle.

### 1. `treeView-beta` — TreeView Diagram

**Keyword:** `treeView-beta` (camelCase V, beta suffix required — `/^\s*treeView-beta/.test(t)` in bundle detector) [VERIFIED: bundle grep]

**Syntax model:** Indentation-only hierarchy. Quoted labels support spaces.

```
treeView-beta
    "Root Folder"/
        "src"/
            "main.ts"
            "app.tsx" :::highlight
        "tests"/
            "app.test.ts"
        "package.json"
        "README.md"
```

**Key rules:**
- Trailing `/` marks a directory node (folder icon, bold label). [VERIFIED: mermaid.js.org/syntax/treeView.html]
- File extensions auto-map to icons: `.ts`/`.js`/`.tsx`/`.jsx`/`.py`/`.json`/`.md`/`.html`/`.css`/`.yaml`/`.sh`/`.sql`/`.lock`/`.gitignore`/`Dockerfile` have distinct icons.
- `:::highlight` applies the built-in highlight CSS class.
- `## description text` adds an inline description annotation.
- `icon(name)` overrides the auto-detected icon.
- Box-drawing characters (`├──`, `└──`, `│`) are also accepted as an alternative to pure indentation.
- `%%` comments are supported per standard Mermaid convention.

**Config keys** (from bundle defaults): `rowIndent: 10`, `paddingX: 5`, `paddingY: 5`, `lineThickness: 1`. [VERIFIED: bundle grep]

**Structural `%%{init}%%` use case:** `%%{init: {"treeView": {"rowIndent": 20}}}%%` to widen level indentation.

**Gotchas:**
- Beta — syntax may evolve.
- No edges/connections; purely hierarchical display.

---

### 2. `wardley-beta` — Wardley Map

**Keyword:** `wardley-beta` (beta suffix required, case-insensitive — `/^\s*wardley-beta/i` in bundle detector) [VERIFIED: bundle grep]

**Syntax model:** Components on a 2-axis canvas (Visibility Y 0–1, Evolution X 0–1) with dependency arrows.

```
wardley-beta
    title SaaS Platform Strategy
    anchor Customer [0.95, 0.95]
    component UI [0.85, 0.6] (buy)
    component Backend [0.7, 0.65] (build)
    component Infrastructure [0.4, 0.8] (outsource)
    Customer -> UI -> Backend -> Infrastructure
    evolve Backend 0.8
    note "Legacy system" [0.3, 0.2]
```

**Keywords confirmed in bundle lexer** [VERIFIED: bundle grep]:
- `title` — map title
- `anchor` — user/customer node (diamond shape)
- `component` — service/capability node: `component Name [visibility, evolution]`
- `->` — dependency link; `+>` — flow/value link
- `evolve Name target_evolution` — shows planned evolution arrow
- `evolution Stage1 -> Stage2 -> Stage3 -> Stage4` — custom evolution axis labels
- `note "Text" [y, x]` — floating annotation
- `annotation N,[y,x] "Text"` — numbered annotation
- `(inertia)` — resistance-to-change decorator after component position
- `(build)`, `(buy)`, `(outsource)`, `(market)` — build-buy-outsource strategy decorators
- `pipeline ParentName { component Child1, component Child2 }` — pipeline grouping
- `size [width, height]` — canvas size
- `accTitle` and `accDescr` — accessibility

**Config keys:** No dedicated config block in bundle (wardley has no entry in the config defaults object). [VERIFIED: bundle grep — `wardley:{...}` not found in config defaults]

**Gotchas:**
- Positions are `[visibility, evolution]` — Y-axis first, X-axis second (counter-intuitive).
- Node names can contain spaces and special characters like `()` and `&` — check `NAME_WITH_SPACES` regex in bundle: `/[A-Za-z][A-Za-z0-9_()&]*/`. Avoid leading digits.
- Beta — complex layouts may not render as expected.
- `evolve` and `pipeline` are the most advanced features; test in demo wiki.

---

### 3. `ishikawa-beta` — Ishikawa (Fishbone) Diagram

**Keyword:** `ishikawa-beta` or `ishikawa` (beta suffix optional — `/^\s*ishikawa(-beta)?\b/i` in bundle detector) [VERIFIED: bundle grep]

**Syntax model:** Indentation-based hierarchy. First non-keyword line is the effect (problem). Top-level indented lines are cause categories (branches). Further indented lines are individual causes and sub-causes.

```
ishikawa-beta
    Blurry Photo
    Process
        Out of focus
        Shutter speed too slow
        Protective film not removed
    User
        Shaky hands
    Equipment
        LENS
            Inappropriate lens
            Damaged lens
            Dirty lens
        SENSOR
            Damaged sensor
            Dirty sensor
    Environment
        Subject moved too quickly
        Too dark
```

**Key rules** [VERIFIED: mermaid.js.org/syntax/ishikawa via GitHub source]:
- Line 1 after keyword = the effect/problem (drawn as the arrowhead/head at right).
- Top-level indented lines = primary cause categories (drawn as branches off the spine).
- Next indented level = causes under each category.
- Further indented = sub-causes.
- Pairs of cause branches alternate above and below the spine.

**Config keys** (from bundle defaults): `diagramPadding: 20`, `useMaxWidth: true`. [VERIFIED: bundle grep]

**No `%%{init}%%` structural config needed** — the diagram is structurally complete with indentation alone.

**Gotchas:**
- The grammar is LALR-based (not Langium); different parser from the newer beta types.
- Odd number of cause categories: last category gets placed on one side alone.
- No styling/classDef support confirmed in grammar — the diagram is purely structural.
- `accTitle`/`accDescr` supported per bundle parser tokens. [VERIFIED: bundle grep for ACC_TITLE/ACC_DESCR tokens]

---

### 4. `treemap-beta` — Treemap Diagram

**Keyword:** `treemap-beta` or `treemap` (beta suffix optional — `/^\s*treemap(-beta)?/` in bundle detector) [VERIFIED: bundle grep]

**Syntax model:** Indentation-based hierarchy. Interior nodes are section headers (quoted). Leaf nodes have a numeric value after `:`.

```
treemap-beta
    title Technology Budget
    "Infrastructure"
        "Compute": 45000
        "Storage": 12000
        "Network": 8000
    "Engineering"
        "Salaries": 180000
        "Tools and Licenses": 15000
    "Marketing"
        "Campaigns": 30000
        "Design": 10000
```

**Key rules** [VERIFIED: mermaid.js.org/syntax/treemap.html]:
- `title` keyword sets the diagram title.
- Quoted strings are node labels.
- `: N` after a label makes it a leaf node with that numeric value.
- Indentation defines parent-child nesting. Section nodes (parents) contain leaf nodes.
- `classDef` and `:::` CSS class syntax work (confirmed by bundle lexer tokens: `CLASS_DEF`, `STYLE_SEPARATOR`). [VERIFIED: bundle grep]
- `valueFormat` config key accepts D3 format specifiers (default: `','` for comma-separated thousands).

**Config keys** (from bundle defaults): `padding: 10`, `diagramPadding: 8`, `showValues: true`, `nodeWidth: 100`, `nodeHeight: 40`, `borderWidth: 1`, `valueFontSize: 12`, `labelFontSize: 14`, `valueFormat: ","`. [VERIFIED: bundle grep]

**Structural `%%{init}%%` use case:** `%%{init: {"treemap": {"showValues": false}}}%%` to hide numeric labels for a cleaner proportional view.

**Gotchas:**
- Values must be positive non-zero numbers for leaf nodes.
- Section nodes (parents) do not carry their own value; their area is the sum of their children.
- Very small values relative to the total may produce unreadably small tiles.
- Negative values are not supported.
- `R&D` as a label would technically work (treemap is not Sankey), but for safety use `"R and D"` in all new examples to match the established convention.

---

### 5. `venn-beta` — Venn Diagram

**Keyword:** `venn-beta` (beta suffix required — `/^\s*venn-beta\b/i` in bundle detector) [VERIFIED: bundle grep]

**Syntax model:** Declarative sets, unions, and text labels.

```
venn-beta
    set A ["Programming"] :3
    set B ["Design"] :2
    set C ["Management"] :1
    union A,B ["Full-Stack Dev"] :2
    union A,C ["Tech Lead"] :1
    union B,C ["Design Manager"] :1
    union A,B,C ["CTO"] :1
    text A
        "Python"
        "TypeScript"
    text B
        "Figma"
        "CSS"
    text C
        "Roadmap"
        "Hiring"
```

**Keywords** [VERIFIED: bundle grep confirms `"set"`, `"union"`, `"text"`, `"style"`; mermaid.js.org/syntax/venn.html]:
- `set ID ["Label"] :N` — defines a set (circle/ellipse). `:N` controls size relative to other sets.
- `union ID1,ID2[,IDN] ["Label"] :N` — creates an overlap region. IDs must reference previously declared sets (no forward references).
- `text ID` followed by indented quoted strings — places text inside a set's private region.
- `style ID fill:#color, color:#textcolor, stroke:#border` — custom styling.
- Short identifiers (`A`, `B`) vs. quoted `["Display Label"]` keep the syntax clean.

**Config keys** (from bundle defaults): `width: 800`, `height: 450`, `padding: 8`, `useDebugLayout: false`. [VERIFIED: bundle grep]

**Structural `%%{init}%%` use case:** `%%{init: {"venn": {"width": 600, "height": 400}}}%%` to size the diagram.

**Gotchas:**
- Forward references in `union` cause a parse error — always `set` before `union`.
- `:N` size values are relative; `:3` makes a set visually larger than `:1`.
- Intersections of 3+ sets require declaring all pairwise unions first, then the triple union.
- `style` line must reference a previously declared `set` or `union` ID.
- Beta — syntax may evolve.

---

## Architecture Patterns

### System Architecture Diagram

```
Author writes .tid file in mermaid-tw5/tiddlers/
    │
    ├── front-matter (title, type: text/vnd.tiddlywiki, tags: MermaidExample)
    │
    └── WikiText body
            │
            ├── Prose intro (one sentence, use cases, "New in Mermaid X" if applicable)
            │
            ├── $$$text/vnd.tiddlywiki.mermaid [basic example] $$$
            │
            ├── $$$text/vnd.tiddlywiki.mermaid [real-world advanced example with %% comments] $$$
            │
            ├── WikiText table (legend, if type colors by category)
            │
            ├── Syntax reference table / code block
            │
            ├── Tips bulleted list
            │
            └── [[← Mermaid Chart Catalog]]
                          │
                          ▼
                  CI/CD picks up .tid automatically
                  tiddlywiki --build index renders all tiddlers
                  docs/index.html updated in GitHub Pages
```

### Recommended Project Structure (Phase 7 additions)

```
mermaid-tw5/tiddlers/
├── [9 Format A .tid already exist — expand these]
│   Architecture Diagram.tid, Block Diagram.tid, Kanban Board.tid
│   Mindmap.tid, Packet Diagram.tid, Quadrant Chart.tid
│   Sankey Diagram.tid, Timeline.tid, XY Chart.tid
│
├── [11 Format B → new Format A .tid replacements]
│   Flowchart.tid, Sequence Diagram.tid, Class Diagram.tid
│   State Diagram.tid, Entity Relationship.tid, User Journey.tid
│   Gantt.tid, Pie Chart.tid, Requirement Diagram.tid
│   Git Graph.tid, C4 Diagram.tid
│   (Format B originals deleted after migration)
│
├── [6 net-new .tid files for new types]
│   Radar Chart.tid, Venn Diagram.tid, Ishikawa Diagram.tid
│   Treemap.tid, Tree View.tid, Wardley Map.tid
│
└── Mermaid Legend Recipe.tid    ← NEW (LEGEND-01)
    Mermaid Chart Catalog.tid    ← MODIFIED (D-10)
```

### Pattern 1: `.tid` Template (D-01)

**What:** Every example tiddler follows this exact skeleton.

**When to use:** All 26 advanced examples without exception.

```
created: 20260608000000000
modified: 20260608000000000
title: [Diagram Type Name]
type: text/vnd.tiddlywiki
tags: MermaidExample

[One-sentence description]. Use it for [use cases]. [''New in Mermaid X.Y'' if applicable.]

---

!! Basic example

```
[minimal syntax showing the keyword and 3–5 elements]
```

$$$text/vnd.tiddlywiki.mermaid
[same minimal example rendered]
$$$

---

!! Real-world example: [descriptive subtitle]

[2–3 sentences explaining what this advanced example shows]

```
[well-commented advanced example source using %% ── Section ── banners]
```

$$$text/vnd.tiddlywiki.mermaid
[same advanced example rendered]
$$$

[WikiText legend table HERE if D-05 applies to this type — see Legend Pattern section]

---

!! Syntax

[Reference table or code block]

!! Tips

* [Tip 1 — most common gotcha for this type]
* [Tip 2]
* [Tip 3 — link to related types if relevant]

[[← Mermaid Chart Catalog]]
```

### Pattern 2: `%%` Section Banner Comments (D-03)

**What:** Inside the `$$$` block, major sections are marked with `%% ── banner ──` comments.

**When to use:** Any advanced example with 3+ logical sections (main diagram + styling + legend nodes).

```
$$$text/vnd.tiddlywiki.mermaid
%%{init: {"flowchart": {"curve": "monotoneX"}}}%%
flowchart TD
    accTitle: Software deployment pipeline
    accDescr: CI/CD workflow from commit to production

    %% ── Trigger ────────────────────────────────
    DEV([Developer]):::actor --> COMMIT[Git Commit]:::trigger

    %% ── Build stage ─────────────────────────────
    COMMIT --> BUILD[Build & Test]:::stage
    BUILD -->|pass| STAGE[Staging Deploy]:::stage
    BUILD -->|fail| NOTIFY[Notify Dev]:::warning

    %% ── Production gate ─────────────────────────
    STAGE --> REVIEW{Manual Review}:::gate
    REVIEW -->|approve| PROD[Production Deploy]:::stage
    REVIEW -->|reject| NOTIFY

    %% ── Class definitions ───────────────────────
    classDef actor  fill:#6c757d,stroke:#495057,color:#fff
    classDef trigger fill:#0d6efd,stroke:#084298,color:#fff
    classDef stage  fill:#198754,stroke:#0f5132,color:#fff
    classDef warning fill:#dc3545,stroke:#842029,color:#fff
    classDef gate   fill:#fd7e14,stroke:#984c0c,color:#fff
$$$
```

### Pattern 3: WikiText Table Legend (D-04)

**What:** A two-column WikiText table placed below the `$$$` block, mapping color swatches to category meaning.

**When to use:** Any example that uses `classDef`, `style`, or section-color cycling to categorize nodes (D-05 scope).

```
|!Color|!Meaning|
|@@background-color:#0d6efd;color:#fff; padding:2px 8px; border-radius:3px; @@ Trigger|Git push event|
|@@background-color:#198754;color:#fff; padding:2px 8px; border-radius:3px; @@ Stage|Automated pipeline step|
|@@background-color:#fd7e14;color:#fff; padding:2px 8px; border-radius:3px; @@ Gate|Manual approval required|
|@@background-color:#dc3545;color:#fff; padding:2px 8px; border-radius:3px; @@ Warning|Failure / notification path|
```

**TW5 WikiText `@@...@@` inline style syntax:** `@@css-property:value; content@@` renders inline CSS on the enclosed text. This is the standard TW5 approach — no external CSS needed. Colors in the legend table must exactly match the `fill` values in the diagram's `classDef` declarations.

**Simpler fallback** (for types without `classDef`, e.g. timeline section colors):

```
|!Section|!Color|!Meaning|
|Q1|Blue|Planning phase|
|Q2|Green|Development phase|
|Q3|Orange|Testing and QA|
```

### Pattern 4: Catalog Update (D-10)

**What:** `Mermaid Chart Catalog.tid` is a hand-curated table. Six types need to be added under appropriate categories.

**Category placement recommendation** (Claude's Discretion):

| Type | Recommended Category | Rationale |
|------|---------------------|-----------|
| Radar Chart | Data and Metrics | Multi-variate comparison like pie/xyChart |
| Venn Diagram | Exploration and Thinking | Conceptual overlap/relationship mapping |
| Ishikawa Diagram | Exploration and Thinking | Root cause analysis / problem exploration |
| Treemap | Data and Metrics | Proportional hierarchical data |
| Tree View | Exploration and Thinking | File/folder hierarchy visualization |
| Wardley Map | Architecture and Systems | Strategic technology positioning |

**Wording fix:** Change "Twenty diagram types are available — nine of them (marked **New**)" to "Twenty-six diagram types are available."

**Auto-index addition (D-10):**
```
!! All examples

<<list-links filter:"[tag[MermaidExample]]">>
```

### Anti-Patterns to Avoid

- **Using `<$mermaid>body</$mermaid>` widget body for advanced diagrams:** WikiText parser corrupts `--`, `<`, `>`, `[[...]]`, `|` before `getScriptBody()` sees them. Always use `$$$` blocks.
- **Including `%%{init}%%` theme directives in examples:** Overrides user's global theme set via Phase 6 config. Only structural per-type config in `%%{init}%%` (e.g. `gantt.barHeight`, `flowchart.curve`).
- **Using the subgraph legend pattern as the canonical approach:** Layout distortion and `classDef` silently fails on subgraph containers. The WikiText table legend is the canonical recipe (D-04).
- **Using informal catalog-linked titles** (e.g. `sequenceDiagram 1`) for the new tiddlers: Use clean descriptive title-case names per the D-01 template.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Color swatch in legend table | Custom HTML/image | TW5 `@@background-color:...;@@` inline style | Standard TW5 approach; no plugin or CSS file needed |
| Auto-indexed example list | Manual link list | `<<list-links filter:"[tag[MermaidExample]]">>` | Built-in TW5 macro; automatically stays current |
| Diagram-internal legend | `classDef` on subgraph | WikiText table below diagram | Subgraph legends cause Dagre layout distortion; `classDef` silently fails on subgraph containers |
| Custom diagram syntax parser | Any code | Mermaid 11.14.0 vendored bundle | All 26 types covered |

---

## Legend Scope Matrix (D-05)

Which of the 26 types need a legend in their advanced example:

| Type | Colors by Category? | Legend Needed? | Legend Mechanism |
|------|--------------------|-----------------|----|
| Flowchart | YES — `classDef` for node categories | **YES** | WikiText table (D-04) |
| Sequence Diagram | NO — actor colors are cosmetic, not categorical | NO | — |
| Class Diagram | YES — `classDef`/`:::` for visibility/stereotype | **YES** | WikiText table |
| State Diagram | YES — `classDef` distinguishes state types | **YES** | WikiText table |
| Entity Relationship | NO — no classDef; `style` applies per-entity only | NO | — |
| User Journey | YES — section colors distinguish actor groups | **YES** | WikiText table |
| Gantt | NO — section colors cycle automatically; sections labeled inline | NO | — |
| Pie Chart | Native legend (automatic) | SKIP (native) | — |
| Requirement Diagram | YES — `classDef`/`:::` for requirement types | **YES** | WikiText table |
| Git Graph | YES — branch colors (via themeVariables `git0`–`git7`) | **YES** | WikiText table |
| C4 Diagram | NO — element types (Person/System/Container) labeled inline | NO | — |
| Architecture | NO — icon names are self-documenting | NO | — |
| Mindmap | NO — no classDef | NO | — |
| Timeline | YES — section period colors cycle | **YES** | WikiText table |
| Sankey | NO — node labels are self-documenting | NO | — |
| XY Chart | NO — series labeled inline | NO | — |
| Block Diagram | YES — `style` for component categories | **YES** | WikiText table |
| Packet Diagram | NO — field names self-documenting | NO | — |
| Kanban | NO — column headers self-documenting | NO | — |
| Quadrant Chart | NO — quadrant labels built-in | NO | — |
| Radar Chart | Native legend (`showLegend` — on by default) | SKIP (native) | — |
| Venn Diagram | YES — `style fill:` distinguishes sets | **YES** | WikiText table |
| Ishikawa Diagram | NO — structural diagram; branches labeled inline | NO | — |
| Treemap | YES — section colors distinguish categories | **YES** | WikiText table |
| TreeView | NO — color differentiation not a primary feature | NO | — |
| Wardley Map | NO — positions on evolution axis are self-documenting | NO | — |

**Types requiring legend (D-05 scope): 9** — Flowchart, Class Diagram, State Diagram, User Journey, Requirement Diagram, Git Graph, Timeline, Block Diagram, Venn Diagram, Treemap.

---

## Common Pitfalls

### Pitfall 1: Widget Body Mode Mangles Advanced Syntax

**What goes wrong:** Using `<$mermaid>…</$mermaid>` widget body for any diagram with `--`, `---`, `<`, `>`, `[[...]]`, or `|` causes silent corruption or dropped content.

**Why it happens:** TiddlyWiki's WikiText parser runs on widget body content before `getScriptBody()` reassembles it. Only `--` (to `&ndash;`) is handled. `---` becomes `<hr>` and is silently dropped. [VERIFIED: codebase inspection of `widget-tools.js`]

**How to avoid:** Use `$$$text/vnd.tiddlywiki.mermaid` blocks exclusively for all 26 examples.

**Warning signs:** ERD lines missing; class diagram generics broken; edge labels corrupted.

---

### Pitfall 2: `%%{init}%%` Theme Override Breaks User Config

**What goes wrong:** An example that includes `%%{init: {"theme": "dark"}}%%` overrides the user's globally configured theme from the Phase 6 config tiddler.

**Why it happens:** `%%{init}%%` for non-secure keys takes precedence over `mermaidAPI.initialize()`.

**How to avoid:** Never put `theme`, `look`, `fontFamily`, `themeVariables` in `%%{init}%%` in examples. Only structural per-type config: `gantt.barHeight`, `flowchart.curve`, `treemap.showValues`, etc.

---

### Pitfall 3: Catalog Links Break After Title Migration

**What goes wrong:** The Catalog currently uses informal titles like `[[sequenceDiagram 1]]`. After migration, that tiddler no longer exists (replaced by `Sequence Diagram.tid`). Any link in the catalog or other tiddlers pointing to `sequenceDiagram 1` becomes a dead link.

**How to avoid:** Update the Catalog's `|[[sequenceDiagram 1|sequenceDiagram 1]]|` entry to `|[[Sequence Diagram]]|` in the same commit that creates `Sequence Diagram.tid`. Audit for any other tiddlers that reference the old titles (check `Mermaid Test All Diagrams.tid` — it does NOT use wiki links for these, so no change needed there).

---

### Pitfall 4: Format B Files Left on Disk After Migration

**What goes wrong:** If `Sequence Diagram.tid` is created but `sequenceDiagram 1` + `sequenceDiagram 1.meta` are not deleted, TiddlyWiki loads **both** tiddlers. There is no title conflict (different titles), but the old bare-mermaid-source tiddler will appear in search results and confuse users.

**How to avoid:** When creating each migrated `.tid` file, also delete both the bare content file AND its `.meta` sidecar.

---

### Pitfall 5: Sankey Node Names With Special Characters

**What goes wrong:** Sankey node names containing `'`, `&`, `/`, or `-` cause a hard parse error in Mermaid 11.12+ (issue #7528).

**How to avoid:** The existing `Sankey Diagram.tid` has already been fixed in Phase 6 (uses "R and D" not "R&D"). New advanced Sankey examples must avoid these characters in all node names.

---

### Pitfall 6: Specific Per-Type Syntax Gotchas

| Type | Gotcha | Prevention |
|------|--------|------------|
| Flowchart | Unquoted `end` breaks parser | Quote: `A["End State"]` |
| erDiagram | Relationship label required | Always include `: "label"` |
| classDiagram | Nested generics with commas: `~Map<K,V>~` = parse error | Use `~Map~` only |
| stateDiagram-v2 | Colons in state labels break parsing | Avoid `:` in state text |
| gantt | `dateFormat` ≠ `axisFormat` — omitting `axisFormat` silently misformats axis | Always set both |
| mindmap | Tabs in indentation cause silent hierarchy collapse | Spaces only |
| timeline | Colons in event labels are structural delimiters | Avoid `:` in event text |
| radar-beta | Axis value count must exactly match axis count | Pad with `0` if needed |
| block-beta | Missing `end` drops subsequent nodes | Close every `block` with `end` |
| architecture-beta | Services must be declared before edges | Declare all services first |
| treeView-beta | `treeView-beta` requires exact camelCase V and beta suffix | Do not use `treeview-beta` |
| wardley-beta | Position is `[visibility, evolution]` — Y first, X second | Remember: Y=visibility, X=evolution |
| venn-beta | `union` IDs must reference already-declared `set` IDs | No forward references |
| treemap-beta | Leaf nodes require `: value`; parent nodes do not | Only terminal nodes get `:` |
| ishikawa-beta | Cause categories are paired above/below spine | Odd count = asymmetric diagram |

---

## Code Examples

### Legend Recipe Tiddler Structure (LEGEND-01)

The `Mermaid Legend Recipe.tid` should follow this structure:

```
created: 20260608000000000
modified: 20260608000000000
title: Mermaid Legend Recipe
type: text/vnd.tiddlywiki
tags: MermaidExample

A ''legend'' (or "key box") explains what each color means in a diagram. Mermaid has no built-in generic legend, so this recipe uses a WikiText table below the diagram.

!! The recipe

Place this table immediately after the closing `$$$` block of your diagram:

```
|!Color|!Meaning|
|@@background-color:#0d6efd;color:#fff;padding:2px 8px;border-radius:3px;@@ Label A|Description of category A|
|@@background-color:#198754;color:#fff;padding:2px 8px;border-radius:3px;@@ Label B|Description of category B|
```

Match the `background-color` to the `fill` value in your diagram's `classDef`:

$$$text/vnd.tiddlywiki.mermaid
flowchart LR
    A[Category A]:::catA --> B[Category B]:::catB
    classDef catA fill:#0d6efd,stroke:#084298,color:#fff
    classDef catB fill:#198754,stroke:#0f5132,color:#fff
$$$

|!Color|!Meaning|
|@@background-color:#0d6efd;color:#fff;padding:2px 8px;border-radius:3px;@@ Category A|Primary workflow step|
|@@background-color:#198754;color:#fff;padding:2px 8px;border-radius:3px;@@ Category B|Success / completion state|

!! When to add a legend

Add a legend when your diagram uses color to distinguish categories that a reader needs to decode. See [[Flowchart]], [[Class Diagram]], and [[State Diagram]] for examples. [[Pie Chart]] and [[Radar Chart]] have built-in legends and do not need this recipe.

!! Alternative: in-diagram subgraph

For flowcharts only, a disconnected subgraph can serve as an in-SVG legend (see [[About $$$ usage]] for caveats). The WikiText table above is preferred because it works for all diagram types and never distorts the Dagre layout.

[[← Mermaid Chart Catalog]]
```

### Beta Type Minimal Examples (Confirmed Syntax)

**treeView-beta:**
```
treeView-beta
    "project"/
        "src"/
            "app.ts"
            "utils.ts"
        "tests"/
            "app.test.ts"
        "package.json"
        "README.md"
```

**wardley-beta:**
```
wardley-beta
    title Platform Strategy
    anchor Customer [0.9, 0.95]
    component WebApp [0.8, 0.6] (buy)
    component API [0.6, 0.5] (build)
    component Database [0.3, 0.7] (outsource)
    Customer -> WebApp -> API -> Database
```

**ishikawa-beta:**
```
ishikawa-beta
    Service Outage
    Infrastructure
        Database overload
        Network failure
    Code
        Memory leak
        Unhandled exception
    Process
        No monitoring
        Missing runbook
```

**treemap-beta:**
```
treemap-beta
    "Budget"
        "Engineering": 120000
        "Marketing": 45000
        "Operations": 35000
```

**venn-beta:**
```
venn-beta
    set A ["Backend"]
    set B ["Frontend"]
    union A,B ["Full-Stack"]
    text A
        "Python"
        "PostgreSQL"
    text B
        "React"
        "CSS"
```

---

## Per-Type Structural `%%{init}%%` Usage (D-02 scope)

The following table documents which types legitimately benefit from structural `%%{init}%%` config in their advanced examples. None of these override theme — all are layout/structural keys.

| Type | Recommended `%%{init}%%` | What It Teaches |
|------|--------------------------|-----------------|
| Flowchart | `{"flowchart": {"curve": "monotoneX"}}` | Edge curve shapes |
| Gantt | `{"gantt": {"barHeight": 30, "displayMode": "compact"}}` | Compact task display |
| Sequence | `{"sequence": {"showSequenceNumbers": true}}` | Numbered messages |
| XY Chart | `{"xyChart": {"width": 800, "height": 400}}` | Explicit sizing |
| Radar | `{"radar": {"width": 500, "height": 500}}` | Explicit sizing |
| Treemap | `{"treemap": {"showValues": false}}` | Hide numeric labels |
| Venn | `{"venn": {"width": 600, "height": 400}}` | Canvas sizing |
| TreeView | `{"treeView": {"rowIndent": 20}}` | Wider indentation |
| All others | None required | Template comment: `%% No structural config needed for this type` |

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Format B (bare file + .meta sidecar) | Format A (`.tid` with inline front-matter) | v0.5.0 (2026-04) | Simpler to author and review; new examples use Format A |
| `<$mermaid>` widget body mode | `$$$text/vnd.tiddlywiki.mermaid` blocks | v0.5.0 (2026-04) | Eliminates `getScriptBody()` mangling for advanced syntax |
| 20 types referenced in Catalog | 26 types (radar, venn, ishikawa, treemap, treeView, wardley added in 11.12–11.14) | Mermaid 11.12.3–11.14.0 | Six new tiddlers needed |
| `graph` legacy keyword | `flowchart` canonical keyword | Mermaid 10.x | Use `flowchart` in all new examples |
| `classDiagram-v2` | `classDiagram` canonical keyword | Mermaid 11.x | Use `classDiagram` |
| `stateDiagram` legacy | `stateDiagram-v2` | Mermaid 9.x | Use `stateDiagram-v2` |

**Notable for examples:**
- `radar-beta` requires the beta suffix — there is no non-beta `radar` keyword.
- `treeView-beta` requires exact camelCase — `treeview-beta` will not parse.
- `venn-beta` requires the beta suffix — `venn` alone will not be detected.
- Sankey `R&D` bug (Mermaid 11.12+ issue #7528) already fixed in Phase 6. Do not re-introduce `&` in any Sankey node name.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The `Mermaid Legend Recipe` is an acceptable tiddler title (not colliding with any existing tiddler) | Tiddler Inventory | Low — checked via `ls *.tid`; no collision found |
| A2 | `Tree View.tid` (with space) is the correct title convention for the treeView type | Tiddler Inventory | Low — convention matches existing "Architecture Diagram.tid" style |
| A3 | Wardley `annotation` keyword syntax `annotation N,[y,x] "Text"` is correct as documented | Beta Type Syntax | Medium — annotation syntax is from WebFetch of official docs which had sparse content; verify in demo wiki |
| A4 | `@@background-color:...;@@ text` WikiText inline style syntax works for legend swatches | Legend Pattern | Low — TW5 `@@...@@` is a standard TW5 WikiText feature; highly likely to work |
| A5 | `venn-beta` `style` keyword syntax: `style ID fill:#color, color:#textcolor` | Beta Type Syntax | Medium — verified from official docs; confirm in demo wiki render |
| A6 | treemap `title` keyword is distinct from the main diagram node structure | Beta Type Syntax | Low — verified from official docs; treemap uses `title` like gantt |
| A7 | ishikawa `accTitle`/`accDescr` tokens present in parser | Beta Type Syntax | Low — bundle grep shows ACC_TITLE/ACC_DESCR tokens in the lexer conditions |

---

## Open Questions

1. **treeView file icon mapping completeness**
   - What we know: 14+ extensions auto-map to icons (`.ts`, `.js`, `.tsx`, `.jsx`, `.py`, `.json`, `.md`, `.html`, `.css`, `.yaml`, `.sh`, `.sql`, `.lock`, `.gitignore`, `Dockerfile`).
   - What's unclear: Whether the icon names are the same as those used by the Architecture diagram (`server`, `database`, etc.) or a separate icon set.
   - Recommendation: Use only auto-detected extension-based icons in the example. Do not attempt `icon(name)` overrides until verified in demo wiki.

2. **wardley `pipeline` syntax edge cases**
   - What we know: `pipeline ParentName { component Child1, component Child2 }` is the documented syntax.
   - What's unclear: Whether `component` declarations inside `pipeline {}` are separate from the top-level `component` declarations, or aliases.
   - Recommendation: Keep the advanced Wardley example simple — omit `pipeline` if it cannot be verified in demo wiki before commit.

3. **venn intersection label positioning**
   - What we know: `text` blocks attach labels inside a set's exclusive region.
   - What's unclear: Whether text can be placed inside an intersection region (the overlap area of a `union`).
   - Recommendation: Place text only in exclusive set regions for the example; note the limitation in Tips.

---

## Environment Availability

This phase requires no external tools beyond the existing repo setup. All work is file authoring and the demo wiki build.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| TiddlyWiki CLI | Demo wiki build verification | ✓ | v5.3.3 | — |
| Node.js | TW5 node runner | ✓ | (project standard) | — |
| Mermaid 11.14.0 | Diagram rendering | ✓ | vendored in repo | — |
| Browser | Visual render verification | ✓ | Any modern browser | — |

**Missing dependencies:** None. Phase 7 is purely content authoring.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Node.js built-in test runner (no external framework) |
| Config file | (no config file — uses `node --test`) |
| Quick run command | `npm test` (from project root) |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| EXAMPLE-01 | 26 .tid files exist with `$$$` blocks | structural/smoke | `ls mermaid-tw5/tiddlers/*.tid | wc -l` (manual count check) | ❌ Wave 0 — add count assertion |
| EXAMPLE-01 | No .tid file contains `<$mermaid>` widget body for advanced content | lint | `grep -r '<\$mermaid>' mermaid-tw5/tiddlers/*.tid` (zero results expected) | ❌ Wave 0 |
| EXAMPLE-02 | Format B originals deleted after migration | structural | `ls mermaid-tw5/tiddlers/Flowchart` (should not exist) | ❌ Wave 0 |
| EXAMPLE-02 | No `%%{init}%%` with theme keys in any example | lint | `grep -r '"theme"' mermaid-tw5/tiddlers/*.tid` in init directives | ❌ Wave 0 |
| EXAMPLE-03 | All 26 tiddlers have `tags: MermaidExample` | structural | `grep -L 'MermaidExample' mermaid-tw5/tiddlers/*.tid` | ❌ Wave 0 |
| LEGEND-01 | `Mermaid Legend Recipe.tid` exists | structural | `ls mermaid-tw5/tiddlers/Mermaid\ Legend\ Recipe.tid` | ❌ Wave 0 |
| EXAMPLE-02 | No `&` in Sankey node names | lint | `grep 'sankey' mermaid-tw5/tiddlers/*.tid -A 20 | grep '&'` (zero expected) | ❌ Wave 0 |
| All | Existing 14 tests stay green | unit | `npm test` | ✅ Exists |

**Primary acceptance test:** Browser render of all 26 types in the demo wiki. This is a manual visual verification step — it cannot be automated without a headless browser. The plan must include a browser-render checkpoint after each wave of tiddler authoring.

### Sampling Rate

- **Per task commit:** `npm test` (verify existing tests remain green — plugin code is unchanged, so this is a safety check only)
- **Per wave merge:** `npm test` + browser render of that wave's tiddlers
- **Phase gate:** All 26 render in demo wiki without errors before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] Shell script or grep assertions for structural checks (EXAMPLE-01 count, tag presence, no widget-body usage, no theme directives in `%%{init}%%`)
- [ ] Verification that all Format B originals are removed

*(No new test framework installation needed — these are file-system assertions.)*

---

## Security Domain

This phase authors static `.tid` content files with no network calls, no user input handling, and no code execution. The plugin `securityLevel: 'loose'` (set in Phase 6) applies to all diagrams including these examples.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | — |
| V3 Session Management | No | — |
| V4 Access Control | No | — |
| V5 Input Validation | No — diagram source is author-controlled, not user-input | — |
| V6 Cryptography | No | — |

**Security note on `%%{init}%%` usage:** None of the structural `%%{init}%%` directives in examples use secure keys (`securityLevel`, `startOnLoad`, `maxTextSize`, `maxEdges`, `suppressErrorRendering`). This is by design (D-02). Including these would be both ineffective (Mermaid ignores them in directives) and misleading to users.

---

## Sources

### Primary (HIGH confidence)

- Vendored bundle `mermaid-tw5/plugins/mermaid-tw5/$__plugins_mermaid-tw5_mermaid.min.js` (3,165,091 bytes, 2026-04-28) — all 26 type detector regexes verified by grep; per-type config defaults extracted; beta keyword patterns confirmed
- `.planning/research/SUMMARY.md`, `FEATURES.md`, `PITFALLS.md`, `STACK.md`, `ARCHITECTURE.md` — prior milestone research, all HIGH confidence
- `.planning/phases/07-advanced-examples-legends/07-CONTEXT.md` — locked decisions D-01 through D-10
- `mermaid-tw5/tiddlers/Architecture Diagram.tid` — reference implementation of D-01 template
- `mermaid-tw5/tiddlers/Mermaid Chart Catalog.tid` — catalog to update (D-10)
- `mermaid-tw5/tiddlers/Sankey Diagram.tid` — Phase 6 R&D fix confirmed (uses "R and D")

### Secondary (MEDIUM confidence)

- [mermaid.js.org/syntax/treeView.html](https://mermaid.js.org/syntax/treeView.html) — treeView-beta syntax, config keys, file icon mapping
- [mermaid.js.org/syntax/venn.html](https://mermaid.js.org/syntax/venn.html) — venn-beta set/union/text/style syntax
- [mermaid.js.org/syntax/treemap.html](https://mermaid.js.org/syntax/treemap.html) — treemap-beta syntax, config keys
- [mermaid.js.org/syntax/wardley.html](https://mermaid.js.org/syntax/wardley.html) — wardley-beta syntax, keywords, coordinate system
- GitHub raw: `mermaid-js/mermaid/.../syntax/ishikawa.md` — ishikawa-beta syntax, effect/cause/subcause structure
- GitHub raw: `mermaid-js/mermaid/.../syntax/treeView.md` — treeView-beta file extension icons, box-drawing character support

### Tertiary (LOW confidence)

- wardley `annotation` syntax `annotation N,[y,x] "Text"` — from WebFetch which had sparse content; marked [ASSUMED] until demo wiki verified
- venn `style` keyword application to `union` regions — partially documented; marked [ASSUMED] for intersection styling

---

## Metadata

**Confidence breakdown:**
- Tiddler inventory and file status: HIGH — verified by filesystem grep
- 5 beta type syntax: MEDIUM-HIGH — verified against official docs + bundle grep; 2 edge cases [ASSUMED]
- Legend pattern and WikiText `@@` syntax: MEDIUM — based on TW5 documentation knowledge; verify in demo wiki
- Template structure: HIGH — directly read from `Architecture Diagram.tid`
- Per-type gotchas: HIGH — from prior project research (PITFALLS.md, code inspection)

**Research date:** 2026-06-08
**Valid until:** 2026-07-08 (Mermaid docs are stable; beta type syntax may evolve but bundle is pinned at 11.14.0)
