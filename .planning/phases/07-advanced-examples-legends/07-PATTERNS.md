# Phase 7: Advanced Examples & Legends - Pattern Map

**Mapped:** 2026-06-09
**Files analyzed:** 29 (26 example tiddlers + 1 legend recipe + 1 catalog + 1 Format B audit)
**Analogs found:** 29 / 29

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `mermaid-tw5/tiddlers/Flowchart.tid` | example-tiddler (Format B→A migration) | transform | `Architecture Diagram.tid` | exact template |
| `mermaid-tw5/tiddlers/Sequence Diagram.tid` | example-tiddler (Format B→A migration) | transform | `Architecture Diagram.tid` | exact template |
| `mermaid-tw5/tiddlers/Class Diagram.tid` | example-tiddler (Format B→A migration) | transform | `Architecture Diagram.tid` | exact template |
| `mermaid-tw5/tiddlers/State Diagram.tid` | example-tiddler (Format B→A migration) | transform | `Architecture Diagram.tid` | exact template |
| `mermaid-tw5/tiddlers/Entity Relationship.tid` | example-tiddler (Format B→A migration) | transform | `Architecture Diagram.tid` | exact template |
| `mermaid-tw5/tiddlers/User Journey.tid` | example-tiddler (Format B→A migration) | transform | `Architecture Diagram.tid` | exact template |
| `mermaid-tw5/tiddlers/Gantt.tid` | example-tiddler (Format B→A migration) | transform | `Architecture Diagram.tid` | exact template |
| `mermaid-tw5/tiddlers/Pie Chart.tid` | example-tiddler (Format B→A migration) | transform | `Architecture Diagram.tid` | exact template |
| `mermaid-tw5/tiddlers/Requirement Diagram.tid` | example-tiddler (Format B→A migration) | transform | `Architecture Diagram.tid` | exact template |
| `mermaid-tw5/tiddlers/Git Graph.tid` | example-tiddler (Format B→A migration) | transform | `Architecture Diagram.tid` | exact template |
| `mermaid-tw5/tiddlers/C4 Diagram.tid` | example-tiddler (Format B→A migration) | transform | `Architecture Diagram.tid` | exact template |
| `mermaid-tw5/tiddlers/Architecture Diagram.tid` | example-tiddler (Format A expand) | transform | self (reference) | self |
| `mermaid-tw5/tiddlers/Mindmap.tid` | example-tiddler (Format A expand) | transform | `Architecture Diagram.tid` | exact template |
| `mermaid-tw5/tiddlers/Timeline.tid` | example-tiddler (Format A expand) | transform | `Architecture Diagram.tid` | exact template |
| `mermaid-tw5/tiddlers/Sankey Diagram.tid` | example-tiddler (Format A expand) | transform | `Architecture Diagram.tid` | exact template |
| `mermaid-tw5/tiddlers/XY Chart.tid` | example-tiddler (Format A expand) | transform | `Architecture Diagram.tid` | exact template |
| `mermaid-tw5/tiddlers/Block Diagram.tid` | example-tiddler (Format A expand) | transform | `Architecture Diagram.tid` | exact template |
| `mermaid-tw5/tiddlers/Packet Diagram.tid` | example-tiddler (Format A expand) | transform | `Architecture Diagram.tid` | exact template |
| `mermaid-tw5/tiddlers/Kanban Board.tid` | example-tiddler (Format A expand) | transform | `Architecture Diagram.tid` | exact template |
| `mermaid-tw5/tiddlers/Quadrant Chart.tid` | example-tiddler (Format A expand) | transform | `Architecture Diagram.tid` | exact template |
| `mermaid-tw5/tiddlers/Radar Chart.tid` | example-tiddler (net-new) | transform | `Architecture Diagram.tid` | exact template |
| `mermaid-tw5/tiddlers/Venn Diagram.tid` | example-tiddler (net-new) | transform | `Architecture Diagram.tid` | exact template |
| `mermaid-tw5/tiddlers/Ishikawa Diagram.tid` | example-tiddler (net-new) | transform | `Architecture Diagram.tid` | exact template |
| `mermaid-tw5/tiddlers/Treemap.tid` | example-tiddler (net-new) | transform | `Architecture Diagram.tid` | exact template |
| `mermaid-tw5/tiddlers/Tree View.tid` | example-tiddler (net-new) | transform | `Architecture Diagram.tid` | exact template |
| `mermaid-tw5/tiddlers/Wardley Map.tid` | example-tiddler (net-new) | transform | `Architecture Diagram.tid` | exact template |
| `mermaid-tw5/tiddlers/Mermaid Legend Recipe.tid` | recipe-tiddler (net-new) | transform | `Architecture Diagram.tid` | role-match (same `.tid` structure) |
| `mermaid-tw5/tiddlers/Mermaid Chart Catalog.tid` | catalog-index (modify) | request-response | self (existing) | self |
| Format B deletions (11 bare files + 11 `.meta` sidecars) | deletion | — | — | — |

---

## Pattern Assignments

### All 26 Example Tiddlers — Shared Template

**Primary Analog:** `mermaid-tw5/tiddlers/Architecture Diagram.tid`

This is the canonical reference implementation of the D-01 template. Every new and migrated tiddler copies this exact skeleton.

**Front-matter block** (lines 1–5 of `Architecture Diagram.tid`):
```
created: 20260430000000000
modified: 20260430000000000
title: Architecture Diagram
type: text/vnd.tiddlywiki
```

For Phase 7 tiddlers, apply this front-matter pattern with two additions — the `tags` field and the current date:
```
created: 20260608000000000
modified: 20260608000000000
title: [Diagram Type Name]
type: text/vnd.tiddlywiki
tags: MermaidExample
```

**Intro line pattern** (line 7 of `Architecture Diagram.tid`):
```
An architecture diagram shows services, groups (like cloud providers or networks), and directional connections between them using icons. Use it for cloud infrastructure, microservices topology, and deployment architecture. ''New in Mermaid 11.'' Uses `architecture-beta`.
```
Pattern: one sentence "what it is + use cases" + optional `''New in Mermaid X.Y''` + optional `Uses \`keyword\``.

**Section separator** (lines 8–9):
```

---
```
A blank line then `---` before every major section heading.

**Basic example section** (lines 10–31):
```
!! Basic example

```
[raw Mermaid source — minimal, 3–5 elements, no comments]
```

$$$text/vnd.tiddlywiki.mermaid
[identical Mermaid source rendered]
$$$
```
Pattern: fenced code block (shows source) immediately followed by `$$$text/vnd.tiddlywiki.mermaid` block (renders it). Same source text in both.

**Real-world example section** (lines 33–79):
```
!! Real-world example: [descriptive subtitle]

```
[advanced Mermaid source with %% comments]
```

$$$text/vnd.tiddlywiki.mermaid
[same advanced source rendered]
$$$
```
Pattern: subtitle is after the colon on the `!!` heading. The source/render pair is the same as basic, but advanced source uses `%%` section banners (see Pattern 2 below).

**Syntax section** (lines 81–103 of `Architecture Diagram.tid`):
```
!! Syntax

```
[canonical skeleton showing structure]
```

''Bold label:'' inline explanation

|!Column|!Column|
|`code`|meaning|
```
Pattern: code block skeleton first, then optional inline-styled labels, then optional WikiText table for quick reference.

**Tips section** (lines 104–110):
```
!! Tips

* [Tip text — most common gotcha or usage guidance]
* [Tip text]
* [Tip text — link to related types if relevant: [[Other Diagram]]]

[[← Mermaid Chart Catalog]]
```
Pattern: bulleted list of 3–5 tips. Last line is always the backlink `[[← Mermaid Chart Catalog]]` with no blank line before it.

---

### Pattern 2: `%%` Section Banner Comments (D-03)

**When to use:** Inside any `$$$` block for the real-world advanced example when the diagram has 3+ logical sections.

**Analog:** RESEARCH.md Pattern 2 (flowchart example) — no existing tiddler yet uses this; it is the pattern to introduce.

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

Key rules:
- `%%{init}%%` (if used) is always the first line inside the `$$$` block.
- `%%{init}%%` contains only structural/layout keys — never `theme`, `look`, `fontFamily`, `themeVariables`.
- `accTitle` and `accDescr` lines directly under the keyword line for accessibility.
- `%% ── Section name ──...` banners use at least 4 `─` chars on each side and extend to ~50 chars total.
- `classDef` declarations are grouped at the end of the diagram source, in their own `%% ── Class definitions ──` section.
- If no structural config is needed, the first line of the diagram is just the keyword (e.g. `gantt`) with a comment `%% No structural config needed for this type`.

---

### Pattern 3: WikiText Table Legend (D-04/D-05)

**When to use:** Immediately after the closing `$$$` of the real-world example, for these 10 types only: Flowchart, Class Diagram, State Diagram, User Journey, Requirement Diagram, Git Graph, Timeline, Block Diagram, Venn Diagram, Treemap.

**Analog:** No existing tiddler uses this yet — pattern is defined in RESEARCH.md Pattern 3.

**Full-color swatch variant** (for types using `classDef`):
```
|!Color|!Meaning|
|@@background-color:#0d6efd;color:#fff;padding:2px 8px;border-radius:3px;@@ Trigger|Git push event|
|@@background-color:#198754;color:#fff;padding:2px 8px;border-radius:3px;@@ Stage|Automated pipeline step|
|@@background-color:#fd7e14;color:#fff;padding:2px 8px;border-radius:3px;@@ Gate|Manual approval required|
|@@background-color:#dc3545;color:#fff;padding:2px 8px;border-radius:3px;@@ Warning|Failure / notification path|
```

**Simpler text-label variant** (for types with automatic section-color cycling, e.g. Timeline):
```
|!Section|!Color|!Meaning|
|Q1|Blue|Planning phase|
|Q2|Green|Development phase|
|Q3|Orange|Testing and QA|
```

Placement in the tiddler body:
```
$$$text/vnd.tiddlywiki.mermaid
[diagram source]
$$$

|!Color|!Meaning|
|@@...@@ Label A|Category A description|
|@@...@@ Label B|Category B description|

---

!! Syntax
```
The legend table appears between the `$$$` closing delimiter and the `---` section separator, with one blank line above and below.

TW5 inline-style syntax: `@@css-property:value;property:value;@@ text@@` — the `@@` opens, the styles are semicolon-separated CSS, and the content follows immediately after the last `;@@` closing marker. No external CSS is needed.

---

### Pattern 4: Format B Migration Structure

**What:** Converting an existing bare-content + `.meta` sidecar (Format B) into a proper `.tid` (Format A).

**Source analog:** `Flowchart` (bare file) + `Flowchart.meta` sidecar — read lines 1–20 of `Flowchart` for the old content, and lines 1–6 of `Flowchart.meta` for the old metadata.

Format B bare file (example from `mermaid-tw5/tiddlers/Flowchart`, lines 1–20):
```
%%{init: {"theme": "neutral"}}%%
graph RL
    150802(" 150802<br />...")
    ...
```

Format B `.meta` sidecar (example from `mermaid-tw5/tiddlers/Flowchart.meta`, lines 1–6):
```
created: 20211015021814025
modified: 20211015022615052
source: https://...
tags: Examples
title: Flowchart
type: text/vnd.tiddlywiki.mermaid
```

**Migration rule:** The old Format B content (the bare source) is **discarded** — do not migrate the old diagram source. Instead, write a brand-new D-01 template tiddler using the canonical keyword (`flowchart`, `sequenceDiagram`, etc.) per the tiddler inventory table. The old title in `.meta` becomes an old informal name to avoid (use the new clean title-case name).

**Deletion requirement (Pitfall 4):** After creating the new `.tid`, delete both the bare content file and its `.meta` sidecar. Files to delete for each migration:

| New `.tid` Title | Delete bare file | Delete `.meta` |
|-----------------|-----------------|----------------|
| `Flowchart.tid` | `Flowchart` | `Flowchart.meta` |
| `Sequence Diagram.tid` | `sequenceDiagram 1` | `sequenceDiagram 1.meta` |
| `Class Diagram.tid` | `Class diagrams` | `Class diagrams.meta` |
| `State Diagram.tid` | `stateDiagram 1` | `stateDiagram 1.meta` |
| `Entity Relationship.tid` | `Defining Relationship` | `Defining Relationship.meta` |
| `User Journey.tid` | `User Journey Diagram` | `User Journey Diagram.meta` |
| `Gantt.tid` | `Gantt 1` | `Gantt 1.meta` |
| `Pie Chart.tid` | `Pie chart diagrams` | `Pie chart diagrams.meta` |
| `Requirement Diagram.tid` | `Requirement Diagram` | `Requirement Diagram.meta` |
| `Git Graph.tid` | `Gitgraph Diagram 1` | `Gitgraph Diagram 1.meta` |
| `C4 Diagram.tid` | `C4 Diagram` | `C4 Diagram.meta` |

---

### Pattern 5: Format A "Expand" Operation

**What:** Adding an advanced real-world section + `MermaidExample` tag to an existing Format A `.tid` that already has the basic structure but lacks the tag and the `%%`-commented advanced example.

**Source analogs:** `Timeline.tid` (lines 1–112), `Sankey Diagram.tid` (lines 1–78), `Block Diagram.tid` (lines 1–99), `Kanban Board.tid` (lines 1–104).

**What these files already have (keep as-is):**
- Front-matter block (lines 1–5): `created`, `modified`, `title`, `type: text/vnd.tiddlywiki` — keep these.
- Intro line (line 7): keep, do not rewrite.
- `!! Basic example` section with fenced + `$$$` block: keep.
- `!! Syntax` section: keep.
- `!! Tips` section + `[[← Mermaid Chart Catalog]]` footer: keep.

**What to add (missing from all 9 existing Format A tiddlers):**
1. `tags: MermaidExample` — add as line 5 in front-matter (after `type:` line).
2. `!! Real-world example: [subtitle]` section — insert after the `---` separator following the basic example and before the `!! Syntax` section.
3. If the type is in the legend-required list (Block Diagram only, among the 9) — add legend table after the real-world `$$$` block.

**Exact insertion point in `Block Diagram.tid`** (lines 64–67 show current gap between second `$$$` and `!! Node shapes`):
```
$$$
[← current line 64, closing delimiter of real-world example]

---
[← insert after here: new !! Real-world section does not exist yet; actually the real-world section IS present but lacks %% comments and legend]
```

Actually reviewing the existing files: `Block Diagram.tid` lines 29–64 already has a real-world example section. The expand operation for Format A tiddlers is:
1. Add `tags: MermaidExample` to front-matter.
2. Upgrade the existing real-world `$$$` block to use `%% ── section ──` banner comments.
3. Add the WikiText legend table (for Block Diagram, which needs one per D-05).

---

### `mermaid-tw5/tiddlers/Mermaid Legend Recipe.tid` (recipe-tiddler, net-new)

**Analog:** `Architecture Diagram.tid` for the `.tid` file structure. The content structure is defined in RESEARCH.md "Legend Recipe Tiddler Structure".

**Front-matter** (copy from Architecture Diagram.tid lines 1–5, adapt):
```
created: 20260608000000000
modified: 20260608000000000
title: Mermaid Legend Recipe
type: text/vnd.tiddlywiki
tags: MermaidExample
```

**Body structure** (from RESEARCH.md "Legend Recipe Tiddler Structure" code example, lines 687–731):
```
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

[...]

!! Alternative: in-diagram subgraph

[...]

[[← Mermaid Chart Catalog]]
```

The legend recipe tiddler uses the same `$$$` block to show a live rendered example of the pattern itself.

---

### `mermaid-tw5/tiddlers/Mermaid Chart Catalog.tid` (catalog-index, modify)

**Analog:** Self — the existing file at lines 1–87.

**Current front-matter** (lines 1–4 of existing `Mermaid Chart Catalog.tid`):
```
created: 20260430000000000
modified: 20260430000000000
title: Mermaid Chart Catalog
type: text/vnd.tiddlywiki
```
Keep as-is; update `modified` date.

**Category table pattern** (lines 10–53 of existing `Mermaid Chart Catalog.tid`):
```
!! Flows and Processes

|!Diagram|!Best for|
|[[Flowchart]]|Algorithms, workflows, decision trees|
|[[sequenceDiagram 1\|sequenceDiagram 1]]|API interactions, protocol flows, actor communication|
```

This is the WikiText table pattern to replicate when adding new entries. Note the escaped pipe `\|` for wikilinks with display text different from the title.

**Specific changes required (D-10):**
1. Line 6: change `"Twenty diagram types are available — nine of them (marked ''New'') require Mermaid 10+ and were not in the original plugin."` to `"Twenty-six diagram types are available."`
2. Update all 11 old-title links to new clean titles (e.g. `[[sequenceDiagram 1\|sequenceDiagram 1]]` → `[[Sequence Diagram]]`).
3. Add 6 new type rows under recommended categories (see RESEARCH.md Pattern 4 category placement table):
   - `!! Data and Metrics`: add `[[Radar Chart]]` and `[[Treemap]]`
   - `!! Architecture and Systems`: add `[[Wardley Map]]`
   - `!! Exploration and Thinking`: add `[[Venn Diagram]]`, `[[Ishikawa Diagram]]`, `[[Tree View]]`
4. Add `[[Mermaid Legend Recipe]]` link in the "See also" footer area or as a new `!! Legend` section.
5. Add auto-index section at the end of the file (before or replacing the `See also` footer):
```
!! All examples

<<list-links filter:"[tag[MermaidExample]]">>
```

**Full current "See also" footer** (lines 85–87 of existing `Mermaid Chart Catalog.tid`):
```

See also: [[Theme Showcase]] · [[TW5 Integration]] · [[Choosing the Right Diagram]] · [[Mermaid Test All Diagrams]]
```
Keep this line; add `· [[Mermaid Legend Recipe]]` to it.

---

## Shared Patterns

### `.tid` Front-Matter Convention
**Source:** `Architecture Diagram.tid` lines 1–5; `Sankey Diagram.tid` lines 1–5; `Mindmap.tid` lines 1–5.
**Apply to:** All 26 example tiddlers and Mermaid Legend Recipe.tid.
```
created: 20260608000000000
modified: 20260608000000000
title: [Title Case Diagram Name]
type: text/vnd.tiddlywiki
tags: MermaidExample
```
- `created`/`modified` use TW5 timestamp format: `YYYYMMDDHHMMSSMMM` (17 digits).
- `type` is always `text/vnd.tiddlywiki` (not `text/vnd.tiddlywiki.mermaid` — that is for standalone diagram tiddlers, not example tiddlers which contain mixed WikiText + `$$$` blocks).
- `tags: MermaidExample` is line 5 in all Phase 7 tiddlers (the existing Format A files were created before EXAMPLE-03 and lack this tag).

### `$$$` Block Syntax
**Source:** `Architecture Diagram.tid` lines 22–30; `Sankey Diagram.tid` lines 21–28; every other Format A `.tid`.
**Apply to:** Every Mermaid diagram in every tiddler.
```
$$$text/vnd.tiddlywiki.mermaid
[diagram source here — raw text, no escaping needed]
$$$
```
- No blank line between the opening delimiter and the first line of diagram source.
- No blank line between the last line of diagram source and the closing `$$$`.
- The fenced code block (` ``` `) before each `$$$` block shows the raw source for user reference — both must contain identical text.

### Catalog Backlink Footer
**Source:** `Architecture Diagram.tid` line 112; `Sankey Diagram.tid` line 77; `Mindmap.tid` line 110; `Block Diagram.tid` line 99.
**Apply to:** All 26 example tiddlers and Mermaid Legend Recipe.tid (all D-01 template files).
```
[[← Mermaid Chart Catalog]]
```
- Always the last line of the tiddler body.
- No blank line before it (directly follows the last bullet in `!! Tips`).

### WikiText Heading Levels
**Source:** All Format A `.tid` files.
**Apply to:** All 26 tiddlers.
- `!! Heading` (level 2) for all major sections: `Basic example`, `Real-world example: subtitle`, `Syntax`, `Tips`.
- No `!` (level 1) headings in example tiddlers — the tiddler title itself is the level-1 heading in TW5.
- Bold emphasis with `''double single-quotes''`.
- Inline code with `` `backticks` ``.

### No `%%{init}%%` Theme Directives (D-02 constraint)
**Apply to:** All 26 example tiddlers.
- Never include `theme`, `look`, `fontFamily`, or `themeVariables` in `%%{init}%%`.
- Permitted structural keys per type (from RESEARCH.md Per-Type `%%{init}%%` table):
  - Flowchart: `{"flowchart": {"curve": "monotoneX"}}`
  - Gantt: `{"gantt": {"barHeight": 30, "displayMode": "compact"}}`
  - Sequence: `{"sequence": {"showSequenceNumbers": true}}`
  - XY Chart: `{"xyChart": {"width": 800, "height": 400}}`
  - Radar: `{"radar": {"width": 500, "height": 500}}`
  - Treemap: `{"treemap": {"showValues": false}}`
  - Venn: `{"venn": {"width": 600, "height": 400}}`
  - TreeView: `{"treeView": {"rowIndent": 20}}`
  - All others: no `%%{init}%%` line needed.

---

## Beta Type Syntax Excerpts

These are confirmed working syntax patterns from RESEARCH.md. No analog exists in the codebase — these are source of truth for the 6 net-new beta tiddlers.

### `treeView-beta` (for `Tree View.tid`)
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
Structural `%%{init}%%`: `%%{init: {"treeView": {"rowIndent": 20}}}%%`

### `wardley-beta` (for `Wardley Map.tid`)
```
wardley-beta
    title Platform Strategy
    anchor Customer [0.9, 0.95]
    component WebApp [0.8, 0.6] (buy)
    component API [0.6, 0.5] (build)
    component Database [0.3, 0.7] (outsource)
    Customer -> WebApp -> API -> Database
```
Note: position is `[visibility, evolution]` — Y-axis first, X-axis second.

### `ishikawa-beta` (for `Ishikawa Diagram.tid`)
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
No `%%{init}%%` needed.

### `treemap-beta` (for `Treemap.tid`)
```
treemap-beta
    "Budget"
        "Engineering": 120000
        "Marketing": 45000
        "Operations": 35000
```
Structural `%%{init}%%`: `%%{init: {"treemap": {"showValues": false}}}%%`

### `venn-beta` (for `Venn Diagram.tid`)
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
Structural `%%{init}%%`: `%%{init: {"venn": {"width": 600, "height": 400}}}%%`
Rule: always `set` before `union` — no forward references.

### `radar-beta` (for `Radar Chart.tid`)
Minimal example (from RESEARCH.md Per-Type `%%{init}%%` table):
```
radar-beta
    title Team Skills
    accTitle: Team competency radar
    axis Communication, Technical, Leadership, Creativity, Teamwork
    curve 1
    Alice: 4, 5, 3, 4, 5
    Bob: 5, 3, 4, 3, 4
```
Structural `%%{init}%%`: `%%{init: {"radar": {"width": 500, "height": 500}}}%%`
Native legend: `showLegend` is on by default — no WikiText legend table needed (per D-05).

---

## Per-Type Legend Scope (D-05 Reference)

Which of the 26 example tiddlers require Pattern 3 (WikiText legend table) in their real-world example:

| Type | File | Legend Required? |
|------|------|-----------------|
| Flowchart | `Flowchart.tid` | YES — `classDef` for node categories |
| Class Diagram | `Class Diagram.tid` | YES — `classDef`/`:::` for stereotypes |
| State Diagram | `State Diagram.tid` | YES — `classDef` for state types |
| User Journey | `User Journey.tid` | YES — section colors for actor groups |
| Requirement Diagram | `Requirement Diagram.tid` | YES — `classDef`/`:::` for req types |
| Git Graph | `Git Graph.tid` | YES — branch colors |
| Timeline | `Timeline.tid` | YES — section period colors |
| Block Diagram | `Block Diagram.tid` | YES — `style` for component categories |
| Venn Diagram | `Venn Diagram.tid` | YES — `style fill:` for sets |
| Treemap | `Treemap.tid` | YES — section colors |
| All 16 others | — | NO |

---

## No Analog Found

All 29 files have analogs or are self-referential. No files fall in this category.

However, the following 6 net-new tiddlers have no existing codebase analog for their *Mermaid syntax* (only the `.tid` template structure is analogized):

| File | Mermaid Type | Syntax Source |
|------|-------------|---------------|
| `Tree View.tid` | `treeView-beta` | RESEARCH.md Beta Type Syntax §1 |
| `Wardley Map.tid` | `wardley-beta` | RESEARCH.md Beta Type Syntax §2 |
| `Ishikawa Diagram.tid` | `ishikawa-beta` | RESEARCH.md Beta Type Syntax §3 |
| `Treemap.tid` | `treemap-beta` | RESEARCH.md Beta Type Syntax §4 |
| `Venn Diagram.tid` | `venn-beta` | RESEARCH.md Beta Type Syntax §5 |
| `Radar Chart.tid` | `radar-beta` | RESEARCH.md Per-Type `%%{init}%%` table |

These 6 types require verification in the demo wiki before committing (each must render without errors in the browser).

---

## Metadata

**Analog search scope:** `mermaid-tw5/tiddlers/` (all `.tid` files)
**Files scanned:** 9 Format A `.tid` files (fully read); 4 Format B bare files + 4 `.meta` sidecars (sampled); `Mermaid Chart Catalog.tid` (fully read)
**Pattern extraction date:** 2026-06-09
