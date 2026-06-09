---
phase: 07-advanced-examples-legends
reviewed: 2026-06-09T00:00:00Z
depth: standard
files_reviewed: 29
files_reviewed_list:
  - mermaid-tw5/tiddlers/Architecture Diagram.tid
  - mermaid-tw5/tiddlers/Block Diagram.tid
  - mermaid-tw5/tiddlers/C4 Diagram.tid
  - mermaid-tw5/tiddlers/Class Diagram.tid
  - mermaid-tw5/tiddlers/Entity Relationship.tid
  - mermaid-tw5/tiddlers/Flowchart.tid
  - mermaid-tw5/tiddlers/Gantt.tid
  - mermaid-tw5/tiddlers/Git Graph.tid
  - mermaid-tw5/tiddlers/Ishikawa Diagram.tid
  - mermaid-tw5/tiddlers/Kanban Board.tid
  - mermaid-tw5/tiddlers/Mermaid Chart Catalog.tid
  - mermaid-tw5/tiddlers/Mermaid Legend Recipe.tid
  - mermaid-tw5/tiddlers/Mindmap.tid
  - mermaid-tw5/tiddlers/Packet Diagram.tid
  - mermaid-tw5/tiddlers/Pie Chart.tid
  - mermaid-tw5/tiddlers/Quadrant Chart.tid
  - mermaid-tw5/tiddlers/Radar Chart.tid
  - mermaid-tw5/tiddlers/Requirement Diagram.tid
  - mermaid-tw5/tiddlers/Sankey Diagram.tid
  - mermaid-tw5/tiddlers/Sequence Diagram.tid
  - mermaid-tw5/tiddlers/State Diagram.tid
  - mermaid-tw5/tiddlers/Timeline.tid
  - mermaid-tw5/tiddlers/Treemap.tid
  - mermaid-tw5/tiddlers/Tree View.tid
  - mermaid-tw5/tiddlers/User Journey.tid
  - mermaid-tw5/tiddlers/Venn Diagram.tid
  - mermaid-tw5/tiddlers/Wardley Map.tid
  - mermaid-tw5/tiddlers/XY Chart.tid
  - tests/phase07-structure.test.js
findings:
  critical: 0
  warning: 6
  info: 5
  total: 11
status: issues_found
---

# Phase 7: Code Review Report

**Reviewed:** 2026-06-09T00:00:00Z
**Depth:** standard
**Files Reviewed:** 29
**Status:** issues_found

## Summary

Reviewed 28 Phase 7 Mermaid example tiddlers plus the `phase07-structure.test.js` scaffold. I cross-checked every diagram's keyword and config keys against the **actual vendored Mermaid 11.14.0 bundle** (`$__plugins_mermaid-tw5_mermaid.min.js`), not against upstream Mermaid docs — important here because the vendored build is a custom bundle that ships several non-standard beta diagram types (`ishikawa-beta`, `wardley-beta`, `venn-beta`, `treeView-beta`). All four of those detector regexes are present in the bundle, so those diagram types are genuinely supported; the suspicion that they were fabricated did **not** hold up.

No BLOCKER-class defects were found: the Mermaid source blocks parse against the bundle, front-matter is well-formed on all tiddlers, and the catalog's 26 diagram links all resolve to real tiddler titles. However there are real defects: one WikiText table-rendering bug (unescaped pipe), a broken back-link form replicated across 30 tiddlers, and several legend tables that assert specific colors for diagram types whose colors are auto-assigned by Mermaid (not controllable), so the legend will silently disagree with the rendered diagram. The test scaffold is functional but contains a self-admitted tautology and a brittle theme-detection regex.

## Warnings

### WR-01: Unescaped pipe in Class Diagram relationship table breaks the row

**File:** `mermaid-tw5/tiddlers/Class Diagram.tid:262`
**Issue:** The relationship reference table contains the inheritance arrow `<|--` inside a backtick cell:
```
|`<|--`|Inheritance|
```
In TiddlyWiki table syntax `|` is the cell delimiter. The literal `|` inside `` `<|--` `` is **not** protected by the surrounding backticks (WikiText does not treat backtick-code as opaque to the table parser), so this row is split into the wrong number of cells and renders as garbage (`` `<` `` / `` --` `` / `Inheritance`). The ER tiddler's cardinality table at `Entity Relationship.tid:177-180` correctly escapes its pipes as `\|\|`, `o\|`, `}\|` — this row was missed.
**Fix:** Escape the literal pipe:
```
|`<\|--`|Inheritance|
```

### WR-02: Back-link `[[← Mermaid Chart Catalog]]` is a broken (missing-target) link in every example

**File:** `mermaid-tw5/tiddlers/Flowchart.tid:130` (and 29 other tiddlers — every Phase 7 example plus several pre-existing ones)
**Issue:** `[[← Mermaid Chart Catalog]]` is a single-argument pretty-link, so both the display text **and** the link target are the literal string `← Mermaid Chart Catalog`. No tiddler with that title exists, so this renders as a broken link (dashed/missing-target styling) and clicking it offers to create a new tiddler named `← Mermaid Chart Catalog`. The intent was clearly a labelled link back to `Mermaid Chart Catalog`. Confirmed: `ls '← Mermaid Chart Catalog.tid'` → no such file; the string appears in 30 tiddlers.
**Fix:** Use the labelled-link form so the arrow is display text and the target is the real tiddler:
```
[[← Mermaid Chart Catalog|Mermaid Chart Catalog]]
```

### WR-03: Treemap legend asserts fixed colors but the diagram sets none

**File:** `mermaid-tw5/tiddlers/Treemap.tid:101-105`
**Issue:** The legend table claims `Engineering=Blue, Infrastructure=Orange, Marketing=Green, Operations=Purple`, but the `treemap-beta` source block contains **no** `style`/`classDef` directives — section colors are auto-assigned from Mermaid's theme palette in declaration order. The declaration order here is Engineering, Infrastructure, Marketing, Operations, so the palette will not necessarily map to Blue/Orange/Green/Purple, and the order in the legend (Blue, Orange, Green, Purple) does not even follow a normal cycling order. The legend will silently disagree with the rendered diagram.
**Fix:** Either (a) drop the color column and describe sections by name only (as User Journey does), or (b) state explicitly that colors are auto-assigned and cycle in declaration order, matching the actual sequence. Do not assert specific hex/color names you do not control.

### WR-04: Timeline legend asserts section colors that are theme-palette-dependent

**File:** `mermaid-tw5/tiddlers/Timeline.tid:99-102`
**Issue:** Same class of problem as WR-03. The legend asserts `2014–2020=Blue, 2021–2022=Green, 2023–2024=Orange`, but `timeline` section colors cycle through the active theme palette and are not set in the source. The tiddler's own Tips section for User Journey acknowledges this limitation ("Section colors cycle automatically … you cannot assign specific hex colors per section"), yet Timeline asserts concrete colors anyway. Under a non-default theme (the plugin supports `dark`, `forest`, `neutral`, `base`) these color claims are simply wrong.
**Fix:** Describe sections by their era/label and note that the background color is theme-assigned, rather than naming specific colors.

### WR-05: Test "every example is tagged MermaidExample" is a tautology that cannot fail

**File:** `tests/phase07-structure.test.js:56-68`
**Issue:** `existing()` (lines 46-53) already filters to only files whose content matches `/^tags:.*MermaidExample/m`. The first `it()` then iterates `existing()` and asserts that same regex matches. By construction every member of `existing()` already satisfies the assertion, so this test can never fail and provides no coverage — the comment on lines 57-59 even admits it is "a tautology." A reader may mistake this for a real guard. The intended guard (catch a Phase 7 file that *lost* its tag) is unreachable because losing the tag removes the file from `existing()` entirely.
**Fix:** To actually guard tag presence, iterate a hard-coded "must be tagged" subset (files known to be Phase 7 complete) independent of the tag filter, e.g. check `EXPECTED_TIDDLERS` members that exist on disk and assert each carries the tag — failing loudly if a present file is untagged. Otherwise delete the tautological test to avoid false confidence.

### WR-06: Theme-detection regex in test is too narrow and will miss real violations

**File:** `tests/phase07-structure.test.js:80-88`
**Issue:** The regex `/%%\{init[^}]*"(theme|look|fontFamily|themeVariables)"/` uses `[^}]*`, which stops at the **first** `}`. For a nested init directive such as `%%{init: {"flowchart": {"curve": "monotoneX"}, "theme": "dark"}}%%`, the `[^}]*` segment terminates at the inner `}` (after `monotoneX`), so a `theme` key placed *after* a nested sub-object is never inspected and the banned-config check silently passes. It also misses single-quoted keys (`'theme'`) and whitespace variants (`"theme" :`). The check happens to pass on the current files only because none place a banned key after a nested object.
**Fix:** Match the key anywhere inside the init directive without the `[^}]*` short-circuit, and allow both quote styles, e.g.:
```js
/%%\{init[\s\S]*?["'](theme|look|fontFamily|themeVariables)["']/
```
(or parse the JSON payload of each `%%{init ...}%%` and assert on keys).

## Info

### IN-01: Ishikawa "accepts `ishikawa` without -beta" tip is correct — verified, no action

**File:** `mermaid-tw5/tiddlers/Ishikawa Diagram.tid:156`
**Issue:** The tip claims `ishikawa-beta` also accepts the bare `ishikawa` keyword. I flagged this as a suspected falsehood, but the vendored bundle contains the detector `/^\s*ishikawa(-beta)?\b/`, so the claim is accurate for this build. Noting only so a future reviewer does not re-flag it. No change needed, but be aware this is bundle-specific and could regress if Mermaid is upgraded.

### IN-02: ER tip overstates that a relationship label is mandatory

**File:** `mermaid-tw5/tiddlers/Entity Relationship.tid:185`
**Issue:** "Every relationship line must include a `: "label"` — a quoted string is required by the parser or the diagram will not render." In Mermaid 10+/11.x the relationship label is optional; an unlabeled relationship parses fine. The examples all supply labels, so nothing renders incorrectly, but the tip is factually too strict and could mislead authors.
**Fix:** Soften to "a quoted relationship label is recommended for clarity" (or verify against the bundle and state the real requirement).

### IN-03: Mindmap places `%%` comments between hierarchy lines

**File:** `mermaid-tw5/tiddlers/Mindmap.tid:51-99`
**Issue:** The real-world mindmap interleaves `%% ── … ──` comment lines among indented nodes. Mermaid's mindmap parser is indentation-sensitive and derives the hierarchy baseline from the root node's column; comment lines stripped mid-tree have on occasion shifted indentation interpretation in some Mermaid versions. The basic example (no inline comments) is the safer reference. Could not reproduce a failure against the bundle, so filing as Info — but worth a manual render check, especially since the Tips explicitly warn that indentation defines hierarchy.
**Fix:** If a render check shows hierarchy distortion, move the section comments above the diagram prose instead of inside the source block.

### IN-04: Wardley component identifiers contain spaces in link expressions

**File:** `mermaid-tw5/tiddlers/Wardley Map.tid:65-71`
**Issue:** Components are declared with multi-word names (`component Business Logic [...]`, `API Gateway`, `Data Pipeline`) and then referenced in chained links (`Business Logic -> API Gateway -> Data Pipeline`). Whether `wardley-beta`'s grammar resolves space-containing identifiers unambiguously in link chains could not be confirmed from the minified Langium grammar. The basic example uses single-word names. Flagging as Info pending a manual render — if links fail to draw, single-word IDs (or quoted names) would be the fix.
**Fix:** If a render check shows missing links, rename to single-token identifiers (e.g. `BusinessLogic`) or confirm the grammar supports spaced names.

### IN-05: Catalog "Twenty-six diagram types" couples prose to the type count

**File:** `mermaid-tw5/tiddlers/Mermaid Chart Catalog.tid:6`
**Issue:** The intro hard-codes "Twenty-six diagram types," which currently matches the 26 catalog table links (verified). This is correct today but is a maintenance trap: adding/removing a diagram requires editing prose in two places, and the test scaffold's hard gate (`EXPECTED_TIDDLERS`, 27 entries incl. legend) is a third count to keep in sync.
**Fix:** Optionally replace the count with a filter-driven count or just "the following diagram types," so the number cannot drift out of sync.

---

_Reviewed: 2026-06-09T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
