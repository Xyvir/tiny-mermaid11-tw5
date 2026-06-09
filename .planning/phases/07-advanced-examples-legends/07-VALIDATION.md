---
phase: 7
slug: advanced-examples-legends
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-06-09
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node.js built-in test runner (`node --test`) — no external framework, no `package.json` |
| **Config file** | none |
| **Quick run command** | `node --test tests/phase07-structure.test.js` |
| **Full suite command** | `node --test tests/*.test.js` |
| **Estimated runtime** | < 1 second (structural) / ~0.1 s full suite |

> Note: there is **no `npm test` script** in this repo (no `package.json`). Run tests directly via `node --test <files>`. The RESEARCH.md Validation Architecture table's `npm test` shorthand maps to `node --test tests/*.test.js`.

**Baseline (pre-Phase-7):** `node --test tests/*.test.js` → 28 tests, 27 pass, **1 pre-existing FAIL** (`tests/wrapper.test.js:50` "displays a friendly error message for invalid syntax", last touched Phase 6 `ea71426`). Phase 7 changes **no plugin code** — the gate for every task is "no NEW failure vs this baseline."

---

## Sampling Rate

- **After every task commit:** Run `node --test tests/phase07-structure.test.js` (plus the task's own file-existence/grep assertions)
- **After every plan wave:** Run `node --test tests/*.test.js` (full suite — must stay at the 1 pre-existing failure, no new reds)
- **Before `/gsd-verify-work`:** Full suite green vs baseline + manual browser render of all 26 types in the demo wiki
- **Max feedback latency:** < 2 seconds

---

## Per-Task Verification Map

| Task | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 07-01 T1 (Legend Recipe tiddler) | 01 | 1 | LEGEND-01 | — | N/A (static content) | structural | `test -f "…/Mermaid Legend Recipe.tid" && grep -q 'tags: MermaidExample' …` | ❌ W0 (creates) | ⬜ pending |
| 07-01 T2 (structure test scaffold) | 01 | 1 (Wave 0) | LEGEND-01 | — | N/A | unit/scaffold | `node --test tests/phase07-structure.test.js` | ❌ W0 (creates `tests/phase07-structure.test.js`) | ⬜ pending |
| 07-02 T1 (Flowchart, Sequence, Class) | 02 | 2 | EXAMPLE-01, EXAMPLE-02, LEGEND-02 | — | N/A | structural | `for f in …; do grep -q 'text/vnd.tiddlywiki.mermaid' …; done; node --test tests/phase07-structure.test.js` | ❌ W0 | ⬜ pending |
| 07-02 T2 (State, User Journey, Git Graph) | 02 | 2 | EXAMPLE-01, EXAMPLE-02, LEGEND-02 | — | N/A | structural | `for f in …; do grep -qE '\|!.*\|!' …; done; node --test tests/phase07-structure.test.js` | ❌ W0 | ⬜ pending |
| 07-03 T1 (ER, Gantt, Pie) | 03 | 2 | EXAMPLE-01, EXAMPLE-02, LEGEND-02 | — | N/A | structural | `for f in …; node --test tests/phase07-structure.test.js` | ❌ W0 | ⬜ pending |
| 07-03 T2 (Requirement, C4) | 03 | 2 | EXAMPLE-01, EXAMPLE-02, LEGEND-02 | — | N/A | structural | `test -f "…/Requirement Diagram.tid" && … node --test tests/phase07-structure.test.js` | ❌ W0 | ⬜ pending |
| 07-04 T1 (Architecture, Mindmap, Timeline) | 04 | 2 | EXAMPLE-01, LEGEND-02 | — | N/A | structural | `for f in …; node --test tests/phase07-structure.test.js` | ❌ W0 | ⬜ pending |
| 07-04 T2 (Sankey, XY Chart, Block) | 04 | 2 | EXAMPLE-01, LEGEND-02 | — | N/A | structural | `… ! grep -q '&' "…/Sankey Diagram.tid" && node --test tests/phase07-structure.test.js` | ❌ W0 | ⬜ pending |
| 07-04 T3 (Packet, Kanban, Quadrant) | 04 | 2 | EXAMPLE-01 | — | N/A | structural | `for f in …; node --test tests/phase07-structure.test.js` | ❌ W0 | ⬜ pending |
| 07-05 T1 (Radar, Treemap, Tree View) | 05 | 2 | EXAMPLE-01, LEGEND-02 | — | N/A | structural | `grep -q 'radar-beta' … && grep -q 'treemap-beta' … && node --test tests/phase07-structure.test.js` | ❌ W0 | ⬜ pending |
| 07-05 T2 (Venn, Ishikawa, Wardley) | 05 | 2 | EXAMPLE-01, LEGEND-02 | — | N/A | structural | `grep -q 'venn-beta' … && grep -q 'wardley-beta' … && node --test tests/phase07-structure.test.js` | ❌ W0 | ⬜ pending |
| 07-06 T1 (Catalog update) | 06 | 3 | EXAMPLE-03 | — | N/A | structural | `grep -q "list-links filter" "…/Mermaid Chart Catalog.tid" && for n in …; grep -q "[[$n]]" …` | ❌ W0 | ⬜ pending |
| 07-06 T2 (phase-completion gate) | 06 | 3 | EXAMPLE-03 | — | N/A | unit (gate) | `PHASE07_COMPLETE=1 node --test tests/phase07-structure.test.js` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/phase07-structure.test.js` — incremental-safe structural assertions (created in Plan 07-01 Task 2; consumed by all subsequent plans). Uses an `existing()` helper so it passes mid-phase and a `PHASE07_COMPLETE`-gated assertion for the full 26-type count.
- No framework install required — `node --test` is built in.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| All 26 diagram types render correctly in the demo wiki | EXAMPLE-01 | Mermaid rendering needs a browser; no headless harness in this repo | Build/serve the demo wiki, open each `MermaidExample`-tagged tiddler, confirm clean render (no parse errors) |
| Beta-type edge constructs (wardley `pipeline`/`annotation`, venn intersection `text`) render | EXAMPLE-01 | MEDIUM/LOW-confidence syntax — verify-or-omit per RESEARCH Open Questions (RESOLVED) | Render the candidate construct in the demo wiki; if it fails, omit and keep the simpler verified form (Plan 07-05 Task 2) |
| Legends visually match `classDef fill:` colors | LEGEND-02 | Color-swatch correctness is a visual judgment | For each of the 10 legend types, confirm each `@@background-color:#hex@@` swatch matches the diagram's `classDef fill:` |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies (confirmed by plan-checker, Dimension 8a)
- [x] Sampling continuity: no 3 consecutive tasks without automated verify (Dimension 8c)
- [x] Wave 0 covers all MISSING references (`tests/phase07-structure.test.js`, Dimension 8d)
- [x] No watch-mode flags
- [x] Feedback latency < 2s
- [x] `nyquist_compliant: true` set in frontmatter (plan-level — all tasks sampled)

**Approval:** pending — `wave_0_complete` flips to true once Plan 07-01 Task 2 creates the test scaffold during execution.
