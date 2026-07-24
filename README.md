# mermaid-tw5 (Fork with Mermaid 11)

*Last edited: 2026-04-27*

This is a fork of a fork that uses mermaid-tiny (~ 1 MB) instead of full mermaid library (~3 MB)

This is a **fork** of the original [mermaid-tw5](https://github.com/efurlanm/mermaid-tw5) plugin that upgrades Mermaid.js from **9.3.0 to 11.14.0**.

**Trade-off:** This fork is **~3.3 MB larger** than the original (~3.0 MB vs ~0.9 MB for Mermaid alone). If you only need basic diagrams (flowcharts, sequences, class diagrams, etc.), the original plugin is smaller and faster. If you need **mindmaps, timelines, Sankey diagrams, XY charts, block diagrams, Wardley maps,** and other modern types, this is the fork for you.

**Live demo:** <https://xyvir.github.io/tiny-mermaid11-tw5/>
**Install:** Open the demo and drag the `$:/plugins/orange/mermaid-tw5` tiddler into your wiki.

---

## What You Get

- **24+ diagram types** — everything Mermaid 11 supports
- **Lazy loading** — the ~3 MB Mermaid library only loads when a page actually contains a diagram
- **Click-to-zoom** — pan and zoom any diagram with D3.js
- **Clickable links** — navigate between tiddlers from inside diagrams
- **Safe errors** — malformed diagrams show friendly messages, not raw stack traces

---

## Supported Diagram Types

The plugin uses **Mermaid 11.14.0**.

### Core types (available in original too)
- **Flowchart** — process flows and decision trees
- **Sequence Diagram** — interaction sequences and message flows
- **Class Diagram** — object-oriented class relationships
- **State Diagram** — state machines and stateful flows
- **Entity Relationship (ER)** — database relationships
- **Gantt Chart** — project scheduling and timelines
- **Pie Chart** — proportional data visualization
- **Git Graph** — Git workflow and branching visualization
- **User Journey** — user experience flows
- **Requirement Diagram** — requirements and traceability
- **C4 Context** — system architecture diagrams

### New in this fork (Mermaid 10–11)
- **Mindmap** — hierarchical mind mapping
- **Timeline** — chronological events and milestones
- **Sankey** — flow diagrams with proportional width
- **XY Chart** — scatter and line charts
- **Quadrant Chart** — four-quadrant analysis
- **Block Diagram** — block diagram structures
- **Architecture** — system architecture diagrams
- **Kanban** — Kanban board states
- **Packet** — network packet structures
- **Radar** — multi-variable comparison charts
- **Wardley Map** — business strategy mapping *(beta)*
- **TreeView** — tree structures
- **Ishikawa** — fishbone / cause-and-effect diagrams *(beta)*

---

## How to Use

### Method 1: The `<$mermaid>` widget

```html
<$mermaid text='
graph TD
    A --> B
    B --> C
'></$mermaid>
```

### Method 2: Block syntax

Use `$$$text/vnd.tiddlywiki.mermaid` and `$$$` as delimiters:

```
$$$text/vnd.tiddlywiki.mermaid
mindmap
  root((My Idea))
    Branch 1
      Sub-item A
    Branch 2
$$$
```

### Method 3: Tiddler type

Set a tiddler's type to `text/vnd.tiddlywiki.mermaid` and write diagram syntax directly:

```
timeline
    title Project Roadmap
    2024 : Discovery
    2025 : Build
    2026 : Launch
```

Then transclude it anywhere with `{{MyDiagramTiddler}}`.

---

## Development

### Running Tests

```bash
node --test
```

Tests cover widget rendering, typed parser behavior, lazy loading, and utility functions.

### Building the Demo

```bash
npm install -g tiddlywiki
tiddlywiki mermaid-tw5 --build index
cp mermaid-tw5/output/index.html docs/index.html
```

### Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for coding standards and the pull request process.

---

## Credits

This plugin is built on top of earlier community work:

- <https://github.com/efurlanm/mermaid-tw5> — original plugin by E. Furlan
- <https://github.com/gt6796c/mermaid-tw5>
- <https://github.com/jasonmhoule/tw5-mermaid>
- <https://github.com/cedarvera/mermaid-tw5>
- <https://github.com/jceb/mermaid-tw5>
- <https://github.com/mermaid-js/mermaid>

---

## Notes

1. **Bundle size:** Mermaid 11.14.0 is ~3.0 MB (vs ~0.9 MB for 9.3.0). Lazy loading ensures pages *without* diagrams pay zero cost, but pages *with* diagrams load a heavier engine.
2. **Async rendering:** Some new diagram types (mindmap, timeline, block, etc.) use Mermaid's async renderer. The widget automatically falls back from sync to async rendering when needed.
3. **D3 zoom** (click to toggle pan/zoom) works for all compatible diagram types.
