---
phase: 6
slug: config-wiring-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-07
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node.js built-in `node:test` (no npm package) |
| **Config file** | None — `node --test` auto-discovers `tests/*.test.js` |
| **Quick run command** | `node --test` |
| **Full suite command** | `node --test` |
| **Estimated runtime** | ~2 seconds |

---

## Sampling Rate

- **After every task commit:** Run `node --test`
- **After every plan wave:** Run `node --test`
- **Before `/gsd-verify-work`:** Full suite green — 14 existing tests + new config-wiring tests
- **Max feedback latency:** ~2 seconds

*Baseline (from RESEARCH.md Gap 5): 15 tests total, 14 passing, 1 pre-existing failure (`displays a friendly error message for invalid syntax` — unrelated mock-sync issue). D-09 = the 14 currently-passing tests stay green.*

---

## Per-Task Verification Map

> Task IDs are illustrative until plans are finalized; the planner maps each CONFIG-xx test to the task that delivers it. Every behavior below is covered by `node --test`.

| Requirement | Behavior | Test Type | Automated Command | File Exists | Status |
|-------------|----------|-----------|-------------------|-------------|--------|
| CONFIG-02 | `<$mermaid theme="forest">` prepends `%%{init: {"theme":"forest"}}%%` to scriptBody | unit | `node --test tests/wrapper.test.js` | ❌ W0 | ⬜ pending |
| CONFIG-02 | Widget attr `fontFamily="monospace"` injects correct `%%{init}%%` | unit | `node --test tests/wrapper.test.js` | ❌ W0 | ⬜ pending |
| CONFIG-02 | Non-whitelisted attr (`class`, `style`) is NOT injected | unit | `node --test tests/wrapper.test.js` | ❌ W0 | ⬜ pending |
| CONFIG-03 | On second render (API already loaded), `initialize()` NOT called again | unit | `node --test tests/wrapper.test.js` | ❌ W0 | ⬜ pending |
| CONFIG-03 | On first render, `initialize()` IS called with `buildSiteConfig()` result | unit | `node --test tests/wrapper.test.js` | ❌ W0 | ⬜ pending |
| CONFIG-04 | `buildSiteConfig()` reads `securityLevel` from config tiddler data | unit | `node --test tests/wrapper.test.js` | ❌ W0 | ⬜ pending |
| CONFIG-04 | `buildSiteConfig()` defaults `securityLevel: 'loose'` when tiddler absent | unit | `node --test tests/wrapper.test.js` | ❌ W0 | ⬜ pending |
| CONFIG-05 | `buildSiteConfig()` merges `theme`, `look`, `fontFamily` from config tiddler | unit | `node --test tests/wrapper.test.js` | ❌ W0 | ⬜ pending |
| CONFIG-06 | `buildSiteConfig()` passes `flowchart` nested block from config tiddler | unit | `node --test tests/wrapper.test.js` | ❌ W0 | ⬜ pending |
| D-09 | All currently-passing tests remain green | unit | `node --test` | ✅ 14 passing | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/wrapper.test.js` — extend with config-wiring tests (CONFIG-02 through CONFIG-06)
- [ ] `tests/helpers/tw-bootstrap.js` — add call tracking to `mockMermaidAPI.initialize` (record calls, not just no-op); make `$tw.wiki.getTiddlerData` return configurable per-test values

*Existing test infrastructure covers all structural concerns; only behavioral extensions to the mock and new test cases are needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Author's inline `%%{init}%%` wins over prepended directive in a live Mermaid 11 render | CONFIG-05 / D-02 | Two-directive last-wins merge is a runtime Mermaid behavior (Assumption A3); unit test asserts injection order but not Mermaid's merge result | Render a diagram with `theme="dark"` widget attr AND an inline `%%{init: {"theme":"forest"}}%%`; confirm forest wins visually |
| `securityLevel: 'loose'` keeps click navigation (INTERACT-02) working after the once-per-page move | CONFIG-04 / D-03 | Click navigation is a browser DOM interaction not exercised by node:test | In a running TW, click a node with an interaction binding; confirm navigation fires |

---

## Validation Sign-Off

- [ ] All phase requirements (CONFIG-02..06) have an `<automated>` `node --test` verify or a Wave 0 dependency
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers the two mock/test extensions above
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter (planner/checker sets once map is complete)

**Approval:** pending
