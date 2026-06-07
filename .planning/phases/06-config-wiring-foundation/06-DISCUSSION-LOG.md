# Phase 6: Config Wiring Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-07
**Phase:** 6-Config Wiring Foundation
**Areas discussed:** Config precedence

---

## Gray Area Selection

Presented four gray areas (Config precedence, securityLevel scope, Merge safety, Per-type config). User selected **Config precedence** only.

---

## Config Precedence

### Q1 — Overall precedence order (same key set in multiple places)

| Option | Description | Selected |
|--------|-------------|----------|
| More-local wins | global tiddler < tiddler field < widget attribute < in-diagram %%{init}%%. Matches Mermaid's native override rule. | ✓ |
| Widget attr wins | widget attribute overrides even author's in-source %%{init}%%. | |
| Config tiddler wins | site-admin global config is authoritative over per-tiddler/per-widget/in-source. | |

**User's choice:** More-local wins
**Notes:** Drives D-01/D-02. Implementation: prepend injected `%%{init}%%` before author's literal directive so last-wins merge favors the author.

### Q2 — Secure keys (securityLevel etc.) resolution

| Option | Description | Selected |
|--------|-------------|----------|
| Global tiddler only | securityLevel only from config shadow tiddler (default 'loose'); field/attr/in-source ignored + documented. | ✓ |
| First-render attr allowed | the widget triggering lazy-load init can set securityLevel; later widgets can't. | |
| Field/attr with warning | honor secure keys via re-init with a console warning (reintroduces per-render race). | |

**User's choice:** Global tiddler only
**Notes:** D-03. Consistent with initialize-once (CONFIG-03) and Mermaid's secure-array model.

### Q3 — Nested config objects (themeVariables, per-type blocks) across layers

| Option | Description | Selected |
|--------|-------------|----------|
| Shallow replace | a more-local layer replaces the whole nested object. Simplest; matches %%{init}%% behavior. | ✓ |
| Deep merge | nested objects merge key-by-key. More intuitive but adds edge cases. | |

**User's choice:** Shallow replace
**Notes:** D-04. Deep merge explicitly deferred unless shallow proves limiting.

### Continuation

After Q3, user chose **"I'm ready for context"** rather than discussing the remaining gray areas. Merge safety and per-type config left as open planner decisions (O-01/O-02 in CONTEXT.md) with recommended defaults.

---

## Claude's Discretion

- Default contents of the new config shadow tiddler (beyond `securityLevel: 'loose'`, `startOnLoad: false`, existing flowchart defaults).
- Whether config conflicts are silent (recommended) or surface a console note.
- Merge safety (O-01) and per-type config delivery pattern (O-02) — open, with recommended defaults documented.

## Deferred Ideas

- Nested per-type config via dotted tiddler fields → v0.7.0 (per FEATURES.md).
- Deep-merge of nested config → rejected this phase; revisit if needed.
- `handDrawnSeed` / `deterministicIds` docs, `suppressErrorRendering` wiring → Phase 8 config reference.
