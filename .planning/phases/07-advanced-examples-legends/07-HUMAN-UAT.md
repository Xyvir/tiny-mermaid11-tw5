---
status: partial
phase: 07-advanced-examples-legends
source: [07-VERIFICATION.md]
started: 2026-06-09T00:00:00Z
updated: 2026-06-09T00:00:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Mindmap renders with correct hierarchy despite inline section comments
expected: In `Mindmap.tid`, the real-world example interleaves `%% ── … ──` comment lines among indented nodes. When rendered in the browser, the mindmap hierarchy levels must be correct — no node should shift to the wrong nesting level because of the inline comments. (Code review IN-03; mitigation if it fails: move section comments above the diagram source.)
result: [pending]

### 2. Wardley Map draws all links between multi-word components
expected: In `Wardley Map.tid`, components have multi-word names (`Business Logic`, `API Gateway`, `Data Pipeline`) referenced in chained links (`Business Logic -> API Gateway -> Data Pipeline`). When rendered, every arrow in the chain must draw. (Code review IN-04; mitigation if it fails: rename to single-token IDs or quote names.)
result: [pending]

### 3. Entity Relationship tip accuracy (advisory)
expected: `Entity Relationship.tid` Tips section states a quoted relationship label is "required by the parser." In Mermaid 11.x the label is optional. Human judgment: soften the wording to "recommended for clarity" before Phase 8, or confirm the real requirement against the bundle. (Code review IN-02; advisory — does not block rendering.)
result: [pending]

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps
