---
status: passed
phase: 07-advanced-examples-legends
source: [07-VERIFICATION.md]
started: 2026-06-09T00:00:00Z
updated: 2026-06-09T00:00:00Z
verified_by: automated browser render (Playwright + vendored Mermaid 11.14.0 bundle)
---

## Current Test

[complete — all items verified by headless browser render against the vendored bundle]

## Tests

### 1. Mindmap renders with correct hierarchy despite inline section comments
expected: In `Mindmap.tid`, the real-world example interleaves `%% ── … ──` comment lines among indented nodes. When rendered in the browser, the mindmap hierarchy levels must be correct — no node should shift to the wrong nesting level because of the inline comments. (Code review IN-03.)
result: passed — rendered both Mindmap blocks against the vendored bundle. All 19 nodes present with correct hierarchy, including the two-level nesting `Backend → Database → PostgreSQL, Redis`. Inline `%%` comments did NOT distort the hierarchy. No change needed.

### 2. Wardley Map draws all links between components
expected: In `Wardley Map.tid`, the dependency links must all draw when rendered. (Code review IN-04.)
result: passed after fix — initial render of BOTH examples (basic + real-world) FAILED with "Parse error … found '->'". Root cause: the `wardley-beta` grammar accepts only one link per line; chained links (`A -> B -> C`) are unsupported — NOT a multi-word-name issue (spaced names render fine pairwise). Fixed in commit b73647e by expanding all chains to pairwise links + documenting the constraint in a Tip. Re-rendered from file source: both examples now draw all components and links with no syntax-error graphic.

### 3. Entity Relationship tip accuracy (advisory)
expected: confirm whether a quoted relationship label is actually required by the parser. (Code review IN-02.)
result: passed (no change) — empirically tested against the bundle: an erDiagram relationship with NO `: label` clause FAILS to parse (`Expecting 'COLON'`), while `: ""` parses. The tiddler's existing tip ("a quoted string is required by the parser") is CORRECT for this vendored build; the review's "label is optional in 11.x" claim does not apply here. No change made.

## Summary

total: 3
passed: 3
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps
