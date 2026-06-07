# Feature Research

**Domain:** TiddlyWiki 5 plugin — Mermaid configuration parity & advanced examples (v0.6.0)
**Researched:** 2026-06-07
**Confidence:** HIGH (official Mermaid 11.x schema docs verified; plugin source read directly)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist given the milestone goal "configuration parity". Missing these = plugin feels half-done relative to vanilla Mermaid.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Full global config key documentation | Milestone goal is "expose Mermaid's complete config surface" | LOW | Keys are known; work is docs + wiring |
| `theme` / `themeVariables` support via widget attr or tiddler field | Theme is the most-requested config option | LOW | `getOptions` already passes all attrs; `theme:''` is hardcoded but overridable |
| `look` (classic / handDrawn) support | handDrawn is a high-visibility Mermaid 11 feature | LOW | No extra assets needed; just pass `look:'handDrawn'` in initialize |
| `fontFamily` / `fontSize` global config | Users want diagrams to match their wiki's typography | LOW | Already passthrough-able via tiddler field or widget attr |
| Per-diagram-type config blocks (flowchart, sequence, gantt, etc.) | Advanced users expect per-type tuning | MEDIUM | Naming convention `mermaid-flowchart.*` fields already works; needs documentation |
| `securityLevel` configurable (override from `'loose'` default) | Needed for shared/multi-user TW installs | MEDIUM | Currently hardcoded; requires wrapper.js change + doc of tradeoffs |
| `%%{init: {...}}%%` directive documentation | Diagram-level override is a first-class Mermaid feature | LOW | Already works in diagram body; needs usage examples |
| YAML frontmatter config (`--- config: ... ---`) documentation | Modern Mermaid 11 preferred approach | LOW | Already works in diagram body; needs examples |
| `accTitle` / `accDescr` accessibility syntax docs | All diagram types support it; accessibility is table stakes | LOW | No plugin change needed; pure docs |
| Classpath-complete styling docs (classDef, style, linkStyle, :::) | Power users need this for advanced diagrams | LOW | Pure docs |
| Advanced example tiddler per diagram type | Milestone deliverable | HIGH | 20 diagram types × 1 advanced example each |
| Manual legend pattern (subgraph + classDef) documented | Users frequently need to explain what colors mean | MEDIUM | No native generic legend in Mermaid; subgraph workaround is the canonical approach |
| Capability matrix tiddler (what works vs. deferred) | Prevents user confusion on ELK / KaTeX / icons | LOW | Docs work |

### Differentiators (Competitive Advantage)

Features that make the plugin stand out from plain `<script>` Mermaid embeds.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| TiddlyWiki field-driven config (e.g., `mermaid-theme: dark` on a tiddler) | Config without touching diagram source; reusable across tiddlers | LOW | Already partially works via `getOptions`; needs docs |
| `handDrawnSeed` stabilization pattern | Users want reproducible handDrawn diagrams; random seed = jitter on reload | LOW | Document: set `handDrawnSeed` in %%{init}%% or widget attr |
| Deterministic IDs (`deterministicIds` + `deterministicIDSeed`) | Useful when embedding diagrams in stable HTML exports | LOW | Pure config docs |
| Per-tiddler `securityLevel` override (widget attr) | Allows `'strict'` for untrusted content alongside `'loose'` for interactive diagrams | MEDIUM | Requires wrapper.js change; each render re-initializes anyway |
| `suppressErrorRendering` config option | Hides syntax-error placeholder in published output | LOW | Already in global config surface; needs wiring + docs |
| Legend-per-type advanced examples | Concrete patterns for every diagram type that can carry visual categories | MEDIUM | Flowchart+classDef, gitGraph themeVariables, pie (native), radar (native) |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| ELK layout engine support (`layout: 'elk'`) | Better layout for complex graphs | Adds ~800 KB extra asset; not bundled | Document as out-of-scope in capability matrix; default dagre-wrapper is good enough for most diagrams |
| KaTeX math rendering in diagrams | Some users want math in nodes | Adds heavy external dependency | Document as deferred; no asset constraint allows it |
| Icon pack support (Iconify) for architecture diagrams | Rich cloud/infra icons | Requires external CDN fetch or bundling; violates no-extra-assets constraint | Document that 5 built-in icons (cloud, database, disk, internet, server) are available without external packs |
| ZenUML / ZenUML sequence alternative | Different sequence style | Extra bundle required | Document as deferred |
| Mermaid math / KaTeX annotations | Equation labels | Same as KaTeX above | Deferred |
| Generic "native legend" feature | Users want an automatic legend | Mermaid issue #2110 is closed unimplemented; will never arrive from upstream | Ship the manual subgraph+classDef legend pattern as documented best practice |
| `securityLevel: 'strict'` as default | Safer for shared wikis | Breaks all clickable diagram links (TiddlyWiki navigation) — the plugin's INTERACT-02 requirement collapses | Keep `'loose'` as default; document the tradeoff; allow override per-diagram |

---

## Configuration Surface: Complete Reference for v0.6.0

This section is the authoritative enumeration of Mermaid 11.x config keys that work WITHOUT extra assets. All keys verified against official schema docs (mermaid.js.org/config/schema-docs/).

### Global Config Keys

| Key | Type | Default | Asset-dependent? | Notes |
|-----|------|---------|-----------------|-------|
| `theme` | string | `'default'` | No | Options: `default`, `neutral`, `dark`, `forest`, `base` |
| `themeVariables` | object | — | No | See Theming section below |
| `themeCSS` | string | — | No | Additional CSS injected into SVG |
| `look` | string | `'classic'` | No | Options: `'classic'`, `'handDrawn'`, `'neo'` |
| `handDrawnSeed` | number | — | No | Seed for handDrawn jitter; set for reproducibility |
| `layout` | string | `'dagre'` | **ELK only** | `'elk'` requires extra asset; leave as `'dagre'` |
| `fontFamily` | string | system fonts | No | CSS font stack |
| `altFontFamily` | string | — | No | Fallback font |
| `fontSize` | number | `16` | No | Base px |
| `htmlLabels` | boolean | — | No | Allow HTML in node labels; deprecated at diagram level, still valid globally |
| `darkMode` | boolean | `false` | No | Affects themeVariables calculation |
| `wrap` | boolean | `false` | No | Text wrapping |
| `markdownAutoWrap` | boolean | — | No | Auto-wrap markdown strings |
| `startOnLoad` | boolean | `true` | No | **SECURE key** — locked, must be set via initialize only. Plugin hardcodes `false`. |
| `securityLevel` | string | `'strict'` | No | **SECURE key** — locked from directive override. Options: `strict`, `loose`, `antiscript`, `sandbox`. Plugin hardcodes `'loose'`. |
| `maxTextSize` | number | `50000` | No | **SECURE key** — max diagram text length |
| `maxEdges` | integer | `500` | No | **SECURE key** — max drawable edges |
| `suppressErrorRendering` | boolean | — | No | **SECURE key** — hide error diagrams in DOM |
| `logLevel` | string/number | — | No | `trace`/0 through `fatal`/5 |
| `arrowMarkerAbsolute` | boolean | `false` | No | Arrow marker positioning |
| `deterministicIds` | boolean | `false` | No | Reproducible element IDs |
| `deterministicIDSeed` | string | — | No | Custom seed for deterministic IDs |

**Secure keys** (cannot be changed by diagram authors via `%%{init}%%` or YAML frontmatter — only via `mermaid.initialize()`):
`secure`, `securityLevel`, `startOnLoad`, `maxTextSize`, `suppressErrorRendering`, `maxEdges`

### Per-Diagram-Type Config Blocks

All types accept `useMaxWidth` (boolean) and `useWidth` (number) from BaseConfig.

#### `flowchart`

| Key | Default | Notes |
|-----|---------|-------|
| `curve` | `'basis'` | Edge curve: `basis`, `linear`, `cardinal`, `step`, `rounded` |
| `nodeSpacing` | `50` | Px between nodes on same level |
| `rankSpacing` | `50` | Px between levels |
| `diagramPadding` | `20` | Outer padding px |
| `padding` | `15` | Label-to-shape padding (experimental renderer) |
| `htmlLabels` | — | Deprecated at this level; use global |
| `defaultRenderer` | `'dagre-wrapper'` | `'dagre-wrapper'` or `'dagre-d3'`; `'elk'` needs extra asset |
| `wrappingWidth` | `200` | Px width at which text wraps |
| `titleTopMargin` | `25` | Margin above diagram title |
| `subGraphTitleMargin` | `{top:0,bottom:0}` | Subgraph title spacing |
| `inheritDir` | `false` | Subgraphs inherit parent direction |
| `arrowMarkerAbsolute` | — | Arrow path style |

#### `sequence`

| Key | Default | Notes |
|-----|---------|-------|
| `activationWidth` | `10` | Width of activation boxes |
| `diagramMarginX` | `50` | Left/right margin |
| `diagramMarginY` | `10` | Top/bottom margin |
| `actorMargin` | `50` | Space between actors |
| `width` | `150` | Actor box width |
| `height` | `50` | Actor box height |
| `boxMargin` | `10` | Loop box margin |
| `boxTextMargin` | `5` | Loop box text margin |
| `noteMargin` | `10` | Note margin |
| `messageMargin` | `35` | Space between messages |
| `messageAlign` | — | `left`, `center`, `right` |
| `mirrorActors` | `true` | Mirror actors at bottom |
| `rightAngles` | `false` | Right-angle arrows |
| `showSequenceNumbers` | `false` | Number each message |
| `wrap` | `false` | Auto-wrap long text |
| `wrapPadding` | `10` | Wrap side padding |
| `labelBoxWidth` | `50` | Loop-box width |
| `labelBoxHeight` | `20` | Loop-box height |
| `hideUnusedParticipants` | `false` | Omit undeclared participants |
| `forceMenus` | `false` | Always show actor popup menus |
| `actorFontSize` / `actorFontFamily` / `actorFontWeight` | — | Actor typography |
| `noteFontSize` / `noteFontFamily` / `noteFontWeight` / `noteAlign` | — | Note typography |
| `messageFontSize` / `messageFontFamily` / `messageFontWeight` | — | Message typography |

#### `gantt`

| Key | Default | Notes |
|-----|---------|-------|
| `titleTopMargin` | `25` | |
| `barHeight` | `20` | Task bar height px |
| `barGap` | `4` | Gap between bars px |
| `topPadding` | `50` | Top padding px |
| `rightPadding` | `75` | Right padding px |
| `leftPadding` | `75` | Left padding px |
| `gridLineStartPadding` | `35` | Grid line offset |
| `fontSize` | `11` | Font size |
| `sectionFontSize` | `11` | Section label font size |
| `numberSectionStyles` | `4` | How many cycled section colors |
| `axisFormat` | `'%Y-%m-%d'` | Date axis format string |
| `tickInterval` | — | e.g. `'1week'`, `'1month'` |
| `topAxis` | `false` | Render axis at top |
| `displayMode` | `''` | `'compact'` packs tasks on same row |
| `weekday` | `'sunday'` | Week start day |

#### `pie`

| Key | Default | Notes |
|-----|---------|-------|
| `textPosition` | `0.75` | 0=center, 1=edge — label radial position |

Note: Pie charts render a **native legend** (labeled color swatches). `showData` appends numeric values to legend text.

#### `class`

| Key | Default | Notes |
|-----|---------|-------|
| `titleTopMargin` | `25` | |
| `defaultRenderer` | `'dagre-wrapper'` | |
| `dividerMargin` | `10` | Member section divider margin |
| `padding` | `5` | Internal padding |
| `textHeight` | `10` | Text row height |
| `nodeSpacing` | — | |
| `rankSpacing` | — | |
| `diagramPadding` | `20` | |
| `htmlLabels` | — | |
| `hideEmptyMembersBox` | — | Hide empty members section |
| `hierarchicalNamespaces` | `true` | Render nested namespaces hierarchically |

#### `state`

| Key | Default | Notes |
|-----|---------|-------|
| `titleTopMargin` | `25` | |
| `dividerMargin` | `10` | |
| `sizeUnit` | `5` | |
| `padding` | `8` | |
| `textHeight` | `10` | |
| `titleShift` | `-15` | |
| `noteMargin` | `10` | |
| `forkWidth` | `70` | Fork shape width |
| `forkHeight` | `7` | Fork shape height |
| `miniPadding` | `2` | |
| `fontSizeFactor` | `5.02` | |
| `fontSize` | `24` | |
| `labelHeight` | `16` | |
| `edgeLengthFactor` | `'20'` | |
| `compositTitleSize` | `35` | Composite state title size |
| `radius` | `5` | Corner radius |
| `defaultRenderer` | `'dagre-wrapper'` | |

#### `er`

| Key | Default | Notes |
|-----|---------|-------|
| `titleTopMargin` | `25` | |
| `diagramPadding` | `20` | |
| `layoutDirection` | `'TB'` | `TB`, `BT`, `LR`, `RL` |
| `minEntityWidth` | `100` | |
| `minEntityHeight` | `75` | |
| `entityPadding` | `15` | |
| `nodeSpacing` | `140` | |
| `rankSpacing` | `80` | |
| `stroke` | `'gray'` | Entity stroke color |
| `fill` | `'honeydew'` | Entity fill color |
| `fontSize` | `12` | |

#### `journey`

| Key | Default | Notes |
|-----|---------|-------|
| `diagramMarginX` | `50` | |
| `diagramMarginY` | `10` | |
| `leftMargin` | `150` | |
| `maxLabelWidth` | `360` | |
| `width` / `height` | `150` / `50` | Task box dimensions |
| `boxMargin` / `boxTextMargin` | `10` / `5` | |
| `messageMargin` | `35` | |
| `messageAlign` | `'center'` | |
| `rightAngles` | `false` | |
| `taskFontSize` / `taskFontFamily` / `taskMargin` | `14` / Open Sans / `50` | |
| `textPlacement` | `'fo'` | `fo` = foreignObject |
| `actorColours` | array | 6 default colors |
| `sectionFills` / `sectionColours` | arrays | Section background and text colors |

#### `gitGraph`

| Key | Default | Notes |
|-----|---------|-------|
| `titleTopMargin` | `25` | |
| `diagramPadding` | `8` | |
| `nodeLabel` | `{width:75,height:100,x:-25,y:0}` | Commit label box |
| `mainBranchName` | `'main'` | Default branch name |
| `mainBranchOrder` | `0` | Sort order of main branch |
| `showCommitLabel` | `true` | |
| `showBranches` | `true` | |
| `rotateCommitLabel` | `true` | Rotate long labels |
| `parallelCommits` | `false` | Show parallel commit paths |

#### `quadrantChart`

| Key | Default | Notes |
|-----|---------|-------|
| `chartWidth` / `chartHeight` | `500` / `500` | |
| `titleFontSize` / `titlePadding` | `20` / `10` | |
| `quadrantPadding` | `5` | |
| `xAxisLabelPadding` / `yAxisLabelPadding` | `5` / `5` | |
| `xAxisLabelFontSize` / `yAxisLabelFontSize` | `16` / `16` | |
| `quadrantLabelFontSize` | `16` | |
| `quadrantTextTopPadding` | `5` | |
| `pointTextPadding` | `5` | |
| `pointLabelFontSize` | `12` | |
| `pointRadius` | `5` | |
| `xAxisPosition` | `'top'` | |
| `yAxisPosition` | `'left'` | |
| `quadrantInternalBorderStrokeWidth` | `1` | |
| `quadrantExternalBorderStrokeWidth` | `2` | |

#### `xyChart`

| Key | Default | Notes |
|-----|---------|-------|
| `width` / `height` | `700` / `500` | |
| `titleFontSize` / `titlePadding` | `20` / `10` | |
| `showDataLabel` | `false` | Show value labels on bars/points |
| `showDataLabelOutsideBar` | `false` | |
| `showTitle` | `true` | |
| `chartOrientation` | `'vertical'` | `'vertical'` or `'horizontal'` |
| `plotReservedSpacePercent` | `50` | % of height/width for plot area |
| `xAxis` / `yAxis` | — | Sub-object with: `showLabel`, `labelFontSize`, `labelPadding`, `showTitle`, `titleFontSize`, `titlePadding`, `showTick`, `tickLength`, `tickWidth`, `showAxisLine`, `axisLineWidth` |

#### `sankey`

| Key | Default | Notes |
|-----|---------|-------|
| `width` / `height` | — | Diagram dimensions |
| `linkColor` | — | `source`, `target`, `gradient`, or hex |
| `nodeAlignment` | — | `justify`, `center`, `left`, `right` |
| `labelStyle` | — | `legacy` or `outlined` (v11.15.0+) |
| `nodeWidth` | `10` | Node rectangle width (v11.15.0+) |
| `nodePadding` | `12` | Vertical gap between nodes (v11.15.0+) |
| `nodeColors` | — | Map: nodeName → CSS color (v11.15.0+) |

#### `radar`

| Key | Default | Notes |
|-----|---------|-------|
| `width` / `height` | `600` / `600` | |
| `marginTop` / `marginBottom` / `marginLeft` / `marginRight` | `50` each | |
| `axisScaleFactor` | `1` | |
| `axisLabelFactor` | `1.05` | |
| `curveTension` | `0.17` | Smoothness |
| (via themeVariables) `axisColor`, `axisStrokeWidth`, `axisLabelFontSize` | — | |
| (via themeVariables) `curveOpacity`, `curveStrokeWidth` | — | |
| (via themeVariables) `graticuleColor`, `graticuleOpacity`, `graticuleStrokeWidth` | — | |
| (via themeVariables) `legendBoxSize`, `legendFontSize` | — | |

Note: Radar renders a **native legend** controlled by `showLegend` keyword in diagram syntax (shown by default).

#### `timeline`

| Key | Default | Notes |
|-----|---------|-------|
| `diagramMarginX` / `diagramMarginY` | `50` / `10` | |
| `leftMargin` | `150` | |
| `width` / `height` | `150` / `50` | |
| `taskFontSize` / `taskFontFamily` / `taskMargin` | `14` / Open Sans / `50` | |
| `messageMargin` / `messageAlign` | `35` / `'center'` | |
| `textPlacement` | `'fo'` | |
| `actorColours` | array | 6 default colors |
| `sectionFills` / `sectionColours` | arrays | |
| `disableMulticolor` | `false` | Single color for all sections |

#### `mindmap`

No dedicated config block. Supports: `layout: 'tidy-tree'` via frontmatter. Node shapes (default, square, rounded, circle, bang, cloud, hexagon) are built-in. Icons require external font/CSS — out of scope.

#### `packet`

| Key | Default | Notes |
|-----|---------|-------|
| `rowHeight` | `32` | |
| `bitWidth` | `32` | Px per bit |
| `bitsPerRow` | `32` | Bits before wrapping |
| `showBits` | `true` | Show bit numbers |
| `paddingX` / `paddingY` | `5` / `5` | |

#### `block`

| Key | Default | Notes |
|-----|---------|-------|
| `padding` | `8` | |

Supports `style` keyword and class-based styling.

#### `architecture`

| Key | Default | Notes |
|-----|---------|-------|
| `padding` | `40` | |
| `iconSize` | `80` | |
| `fontSize` | `16` | |
| `randomize` | `false` | Random node positions |
| `nodeSeparation` | `75` | |
| `idealEdgeLengthMultiplier` | `1.5` | |
| `edgeElasticity` | `0.45` | |
| `numIter` | `2500` | Layout iterations |

Built-in icons (no external asset): `cloud`, `database`, `disk`, `internet`, `server`. External iconify packs are out of scope.

#### `kanban`

| Key | Default | Notes |
|-----|---------|-------|
| `padding` | `8` | |
| `sectionWidth` | `200` | Column width |
| `ticketBaseUrl` | `''` | Base URL for ticket links |

#### Other types (no dedicated config block or minimal)

- **`requirement`**: Uses `style` and `classDef`/`class`/`:::` for styling. Direction via `direction` statement.
- **`c4`**: Extensive font/color/spacing config; primarily used for enterprise architecture; no external assets needed.
- **`ishikawa`**: No documented config block beyond global.
- **`treeView`**: No documented config block.
- **`wardley`**: Beta; no documented config block.
- **`venn`**: No documented config block.
- **`eventmodeling`**: No documented config block.

### Directive / Frontmatter Syntax

**`%%{init: {...}}%%` directive** (deprecated but still functional as of 11.x):
```
%%{init: { "theme": "dark", "flowchart": { "curve": "linear" } }}%%
flowchart LR
    A --> B
```
- Overrides any key NOT in the secure array.
- Multiple `%%{init}%%` blocks are merged; later values win.
- Deprecated in favor of YAML frontmatter.

**YAML frontmatter** (preferred since v10.5.0):
```
---
config:
  theme: dark
  look: handDrawn
  flowchart:
    curve: linear
---
flowchart LR
    A --> B
```
- Same precedence as `%%{init}%%`.
- Cannot override secure keys (`securityLevel`, `startOnLoad`, `maxTextSize`, `maxEdges`, `suppressErrorRendering`).

**`%%{wrap}%%`** — Sequence-diagram shorthand to enable text wrapping (equivalent to `sequence: { wrap: true }`).

### Accessibility (no config key needed)

Both keywords work in ALL diagram types with no config change:

```
flowchart LR
    accTitle: My accessible title
    accDescr: Longer description for screen readers
    A --> B
```

Multi-line `accDescr`:
```
accDescr {
  Line one
  Line two
}
```

Inserts `<title>` + `<desc>` elements in SVG and wires `aria-labelledby` / `aria-describedby`.

### Styling Primitives (flowchart and class/state/requirement/block diagrams)

```
classDef className fill:#f9f,stroke:#333,stroke-width:2px,color:#000
class nodeId1,nodeId2 className
nodeId3:::className

style nodeId fill:#ff0,stroke:#333
linkStyle 0 stroke:#ff0,stroke-width:4px
```

For subgraphs:
```
style subgraphId fill:#e1f5ff,stroke:#01579b
```
(styling a subgraph also requires the subgraph to be referenced as a node in the diagram, or use `style` directly)

---

## Legend Support Matrix

| Diagram Type | Native Legend | Details | Manual Pattern Available? |
|-------------|--------------|---------|--------------------------|
| **pie** | YES | Labeled color swatches rendered automatically; `showData` adds numeric values | N/A |
| **radar** | YES | `showLegend` keyword (default: on); controls series color key | N/A |
| **gitGraph** | PARTIAL | Branch colors via `themeVariables` (`git0`–`git7`) shown on branches, but no separate legend box | Subgraph pattern does not apply to gitGraph |
| **xyChart** | NO | No legend; multiple series not distinctly labeled | N/A (single-series chart) |
| **quadrantChart** | NO | Quadrant labels are built-in; no separate legend box | N/A (labels are data, not category key) |
| **sankey** | NO | Node names serve as labels; no separate legend | N/A |
| **flowchart** | NO | Colors defined by classDef but no automatic legend | YES — subgraph+classDef pattern |
| **class** | NO | No native legend | Partial — classDef exists; subgraph not applicable |
| **state** | NO | No native legend; classDef styling limited (no start/end/composite states) | Partial — classDef works on named states |
| **er** | NO | No native legend; uses `style` keyword | NO — no classDef or subgraph in ER |
| **sequence** | NO | No native legend | NO — no classDef in sequence |
| **gantt** | NO | Section colors cycle automatically; no explicit legend | NO — no classDef in gantt |
| **timeline** | NO | Section/period colors via `cScale0`–`cScale11` themeVariables | NO — no classDef |
| **journey** | NO | Task/section colors via config arrays | NO — no classDef |
| **mindmap** | NO | Node shapes vary but no legend | NO — no classDef in mindmap |
| **block** | NO | `style` and class keywords available | YES — can embed styled legend nodes |
| **requirement** | NO | `classDef` + `class` + `:::` available | YES — styled representative nodes |
| **architecture** | NO | Icon types are self-documenting by label | NO — no classDef |
| **packet** | NO | Field names are self-documenting | NO — no classDef |
| **kanban** | NO | Column headers serve as labels | NO — no classDef |

### Canonical Manual Legend Pattern (Flowchart)

Use a disconnected subgraph containing representative styled nodes. This subgraph does NOT connect to the main diagram — it floats as a visual key.

```
flowchart TD
    %% ── Main diagram ──────────────────────────────────
    A([Start]):::primary --> B{Decision}:::decision
    B -- Yes --> C[Process A]:::success
    B -- No  --> D[Process B]:::warning
    C --> E([End]):::primary
    D --> E

    %% ── Legend (disconnected subgraph) ────────────────
    subgraph Legend["Legend"]
        direction LR
        L1["Primary step"]:::primary
        L2["Success path"]:::success
        L3["Warning path"]:::warning
        L4{"Decision"}:::decision
    end

    %% ── Class definitions ──────────────────────────────
    classDef primary  fill:#4a90d9,stroke:#2c5f8a,color:#fff
    classDef success  fill:#27ae60,stroke:#1a7a42,color:#fff
    classDef warning  fill:#e67e22,stroke:#a85c18,color:#fff
    classDef decision fill:#8e44ad,stroke:#5e2d73,color:#fff
```

Key rules:
1. The same `classDef` names are used in both the legend subgraph and the main diagram — classes stay in sync automatically.
2. The legend subgraph uses `direction LR` to lay legend items horizontally.
3. No edges connect legend nodes to main nodes; the subgraph floats.
4. Node shapes in the legend mirror the actual shapes used in the diagram (diamond `{}` for decisions, rounded `()` for terminals, etc.).

**Adaptation for other types:**

- **State diagrams**: `classDef` works; place legend states with their classDef and no transitions. Subgraph equivalent does not exist in state syntax — use a note block or add a separate legend diagram tiddler.
- **Class diagrams**: `classDef` + `:::` work. Create a `namespace Legend` with dummy classes showing color meaning. Subgraph is not a class-diagram concept.
- **Block diagrams**: Use `style` on a dedicated legend block group.
- **ER / Sequence / Gantt / Timeline**: No classDef. Recommend a separate tiddler with a small explanatory flowchart legend, or use Mermaid title + section colors as implicit legend, or document colors in surrounding wiki text.

---

## Plugin Gap Analysis: Current vs. Config Parity

### What Is Currently Wired

**`mermaidAPI.initialize()` is called on every render** in `wrapper.js` with:
```javascript
mermaidAPI.initialize({
    startOnLoad: false,                          // LOCKED (correct)
    flowchart: { useMaxWidth: true, htmlLabels: true },
    securityLevel: 'loose',                      // HARDCODED — not user-configurable
});
```

**`getOptions()` in `widget-tools.js`** collects config from two sources in priority order:
1. Tiddler fields matching `mermaid-*` prefix, camelCased (e.g., `mermaid-font-family` → `fontFamily`)
2. Widget attributes (e.g., `<$mermaid theme="dark">`)

The collected `options` object is built before `mermaidAPI.initialize()` is called, but currently it is NOT merged into the initialize call — `options` is used only in legacy code paths. Looking at the render function: `rocklib.getOptions(this, tag, options)` populates `options`, but `options` is never spread into `mermaidAPI.initialize({...})`. Only the diagram-body `%%{init}%%` directives reach Mermaid's config.

### Gaps That Block Config Parity

| Gap | Current State | Required Change | Risk |
|-----|--------------|-----------------|------|
| `securityLevel` hardcoded | Always `'loose'` | Read from tiddler field `mermaid-security-level` or widget attr; validate against allowed values | LOW risk — default unchanged; opt-in only |
| `options` not merged into `initialize()` | Tiddler fields / widget attrs collected but never applied | Spread `options` into `initialize()` call, after sanitizing secure keys | MEDIUM — must strip secure keys from user options to prevent override |
| `flowchart.useMaxWidth` hardcoded | Always `true` | Move into default options; allow override | LOW |
| `flowchart.htmlLabels` hardcoded | Always `true` | Move into default options; allow override | LOW |
| No documentation of field naming convention | `mermaid-theme`, `mermaid-font-family` etc. work but undocumented | Write docs tiddler with full key list | LOW |
| `theme` initialized to `''` | Mermaid uses its internal default | Change default to `undefined` or omit; let Mermaid use `'default'` | LOW |
| `look` / `handDrawn` not documented | Works via `%%{init}%%` but not via tiddler fields | Document; wire through options merge | LOW |
| Per-type config blocks undocumented | Work via `%%{init}%%` only | Document field naming (`mermaid-flowchart` is ambiguous — need JSON blob or nested fields) | MEDIUM — naming convention unclear for nested config |

### Secure Key Protection

When merging user-supplied `options` into `mermaidAPI.initialize()`, the plugin MUST strip or ignore the keys the secure array protects — except for `securityLevel` which the plugin intentionally wants to allow the site owner to configure (not diagram authors). The implementation should:

1. Accept `securityLevel` from tiddler fields / widget attrs (site-owner-controlled in TW = safe)
2. Strip `maxTextSize`, `maxEdges`, `suppressErrorRendering` from user-supplied options (keep plugin defaults)
3. `startOnLoad: false` stays hardcoded always

### securityLevel Tradeoffs (for docs/capability matrix)

| Level | Click handlers | HTML in labels | XSS risk | Recommended for |
|-------|---------------|----------------|----------|-----------------|
| `'loose'` (plugin default) | YES | YES | HIGH if multi-user | Personal TW notebooks |
| `'antiscript'` | YES (but JS callbacks fail — known Mermaid bug #5944) | YES (scripts stripped) | MEDIUM | Semi-trusted authors |
| `'strict'` | NO | NO (encoded) | LOW | Public/shared TW instances; breaks INTERACT-02 |
| `'sandbox'` | NO (iframe sandbox) | N/A | LOWEST | Fully untrusted content; breaks TW navigation links |

---

## Feature Dependencies

```
Config parity (options merge into initialize)
    └──requires──> Secure key sanitization in wrapper.js
                       └──requires──> Understanding of Mermaid secure array

securityLevel override
    └──requires──> options merge into initialize()
    └──enhances──>  %%{init}%% documentation (shows diagram-level limitations)

Legend pattern docs
    └──requires──> classDef documentation
    └──requires──> subgraph documentation
    └──enhances──> Advanced example tiddlers (legend included in examples)

Advanced example tiddlers (20 types)
    └──requires──> Per-type config block documentation (know what to demonstrate)
    └──enhances──> Legend pattern docs (each example can show legend)

Capability matrix tiddler
    └──requires──> Config parity research (this document)
    └──requires──> Knowledge of ELK/KaTeX/icon asset requirements
```

---

## MVP Definition (v0.6.0)

### Ship With (v0.6.0)

- [ ] Fix: merge `options` into `mermaidAPI.initialize()` (unlock tiddler field config) — foundational for all other config work
- [ ] Feature: `securityLevel` configurable via `mermaid-security-level` tiddler field or widget attr — with documented tradeoffs
- [ ] Feature: `look: 'handDrawn'` support documented + working via tiddler field
- [ ] Feature: `theme` and `themeVariables` documented + working via tiddler field
- [ ] Docs: Full config key reference tiddler (all global keys + per-type blocks)
- [ ] Docs: `%%{init}%%` and YAML frontmatter usage guide with examples
- [ ] Docs: `accTitle` / `accDescr` accessibility guide
- [ ] Docs: Styling guide (classDef, style, linkStyle, :::)
- [ ] Docs: Manual legend pattern — canonical flowchart snippet + adaptation notes
- [ ] Examples: One advanced tiddler per diagram type (20 types)
- [ ] Docs: Capability matrix tiddler (supported config vs. ELK/KaTeX/icons deferred)

### Defer to v0.7.0+

- [ ] Nested per-type config via tiddler fields (naming convention ambiguity; `%%{init}%%` covers this in the interim)
- [ ] `suppressErrorRendering` configurable (low user demand; `maxEdges` / `maxTextSize` override)
- [ ] `deterministicIds` UI-level support (low demand)

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Merge options into initialize() | HIGH | LOW (few lines in wrapper.js) | P1 |
| securityLevel override | HIGH | LOW (validate + pass through) | P1 |
| Theme / look / fontFamily docs + wire | HIGH | LOW | P1 |
| Advanced examples (20 types) | HIGH | HIGH (content work) | P1 |
| Config key reference tiddler | HIGH | MEDIUM (compile all keys) | P1 |
| Manual legend pattern + docs | HIGH | LOW | P1 |
| %%{init}%% / frontmatter docs | MEDIUM | LOW | P2 |
| accTitle / accDescr docs | MEDIUM | LOW | P2 |
| classDef / styling docs | MEDIUM | LOW | P2 |
| Capability matrix tiddler | MEDIUM | LOW | P2 |
| Per-type nested field naming convention | LOW | MEDIUM | P3 |
| deterministicIds docs | LOW | LOW | P3 |

---

## Sources

- [Mermaid Config Schema](https://mermaid.js.org/config/schema-docs/config.html) — global key list (HIGH confidence)
- [Flowchart Config Schema](https://mermaid.js.org/config/schema-docs/config-defs-flowchart-diagram-config.html) (HIGH confidence)
- [Sequence Config Schema](https://mermaid.js.org/config/schema-docs/config-defs-sequence-diagram-config.html) (HIGH confidence)
- [Gantt Config Schema](https://mermaid.js.org/config/schema-docs/config-defs-gantt-diagram-config.html) (HIGH confidence)
- [GitGraph Config Schema](https://mermaid.js.org/config/schema-docs/config-defs-git-graph-diagram-config.html) (HIGH confidence)
- [Class Config Schema](https://mermaid.js.org/config/schema-docs/config-defs-class-diagram-config.html) (HIGH confidence)
- [ER Config Schema](https://mermaid.js.org/config/schema-docs/config-defs-er-diagram-config.html) (HIGH confidence)
- [State Config Schema](https://mermaid.js.org/config/schema-docs/config-defs-state-diagram-config.html) (HIGH confidence)
- [Quadrant Config Schema](https://mermaid.js.org/config/schema-docs/config-defs-quadrant-chart-config.html) (HIGH confidence)
- [XYChart Config Schema](http://mermaid.js.org/config/schema-docs/config-defs-xychart-config.html) (HIGH confidence)
- [Packet Config Schema](https://mermaid.js.org/config/schema-docs/config-defs-packet-diagram-config.html) (HIGH confidence)
- [Block Config Schema](https://mermaid.js.org/config/schema-docs/config-defs-block-diagram-config.html) (HIGH confidence)
- [Architecture Config Schema](https://mermaid.js.org/config/schema-docs/config-defs-architecture-diagram-config.html) (HIGH confidence)
- [Secure array keys](https://mermaid.js.org/config/schema-docs/config-properties-secure.html) (HIGH confidence)
- [Mermaid Theming](https://mermaid.js.org/config/theming.html) (HIGH confidence)
- [Mermaid Directives](https://mermaid.js.org/config/directives.html) (HIGH confidence)
- [Mermaid Accessibility](https://mermaid.js.org/config/accessibility.html) (HIGH confidence)
- [Radar syntax + showLegend](https://mermaid.js.org/syntax/radar.html) (HIGH confidence)
- [securityLevel options](https://mermaid.js.org/config/usage.html) (HIGH confidence)
- [securityLevel 'antiscript' JS callback bug](https://github.com/mermaid-js/mermaid/issues/5944) (MEDIUM confidence — open issue)
- [Mermaid legend issue #2110 — closed unimplemented](https://github.com/mermaid-js/mermaid/issues/2110) (HIGH confidence)
- [Kanban config](https://mermaid.js.org/syntax/kanban.html) (HIGH confidence)
- [Sankey config](https://mermaid.js.org/syntax/sankey.html) (HIGH confidence)

---

*Feature research for: mermaid-tw5 v0.6.0 — Capability Parity & Advanced Examples*
*Researched: 2026-06-07*
