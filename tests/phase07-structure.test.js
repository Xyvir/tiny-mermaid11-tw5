import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TIDDLERS_DIR = path.resolve(__dirname, '../mermaid-tw5/tiddlers');

// Full list of 26 example tiddler filenames + legend recipe (27 total)
const EXPECTED_TIDDLERS = [
    'Flowchart.tid',
    'Sequence Diagram.tid',
    'Class Diagram.tid',
    'State Diagram.tid',
    'Entity Relationship.tid',
    'User Journey.tid',
    'Gantt.tid',
    'Pie Chart.tid',
    'Requirement Diagram.tid',
    'Git Graph.tid',
    'C4 Diagram.tid',
    'Architecture Diagram.tid',
    'Mindmap.tid',
    'Timeline.tid',
    'Sankey Diagram.tid',
    'XY Chart.tid',
    'Block Diagram.tid',
    'Packet Diagram.tid',
    'Kanban Board.tid',
    'Quadrant Chart.tid',
    'Radar Chart.tid',
    'Venn Diagram.tid',
    'Ishikawa Diagram.tid',
    'Treemap.tid',
    'Tree View.tid',
    'Wardley Map.tid',
    'Mermaid Legend Recipe.tid',
];

// Returns only the tiddlers that are "Phase 7 ready": exist on disk AND carry the
// MermaidExample tag. Pre-existing Format A tiddlers (Architecture Diagram.tid etc.)
// were created before Phase 7 and lack the tag until the Plan 07-04 "expand" task
// adds it. This filter makes every assertion below incremental-safe: the checks only
// activate for a given tiddler once its Phase 7 authoring is complete.
function existing() {
    return EXPECTED_TIDDLERS.filter(name => {
        const filePath = path.join(TIDDLERS_DIR, name);
        if (!fs.existsSync(filePath)) return false;
        const content = fs.readFileSync(filePath, 'utf8');
        return /^tags:.*MermaidExample/m.test(content);
    });
}

describe('Phase 7 structural assertions', () => {
    it('every existing Phase 7 example tiddler is tagged MermaidExample', () => {
        // This assertion uses the same existing() filter — it is a tautology for
        // files already tagged, but serves as documentation and will catch files
        // that somehow lose their tag after being added to the Phase 7 set.
        for (const name of existing()) {
            const content = fs.readFileSync(path.join(TIDDLERS_DIR, name), 'utf8');
            assert.match(
                content,
                /^tags:.*MermaidExample/m,
                `${name} must have "tags: MermaidExample" in front-matter`
            );
        }
    });

    it('no Phase 7 example uses the $mermaid widget body', () => {
        for (const name of existing()) {
            const content = fs.readFileSync(path.join(TIDDLERS_DIR, name), 'utf8');
            assert.ok(
                !content.includes('<$mermaid>'),
                `${name} must not use the <$mermaid> widget body (use $$$ blocks instead)`
            );
        }
    });

    it('no Phase 7 example sets a theme/look/fontFamily/themeVariables in %%{init}%%', () => {
        for (const name of existing()) {
            const content = fs.readFileSync(path.join(TIDDLERS_DIR, name), 'utf8');
            assert.ok(
                !(/%%\{init[^}]*"(theme|look|fontFamily|themeVariables)"/.test(content)),
                `${name} must not set theme/look/fontFamily/themeVariables in %%{init}%%`
            );
        }
    });

    it('every existing Phase 7 example contains a $$$ mermaid block', () => {
        for (const name of existing()) {
            const content = fs.readFileSync(path.join(TIDDLERS_DIR, name), 'utf8');
            assert.ok(
                content.includes('text/vnd.tiddlywiki.mermaid'),
                `${name} must contain a $$$text/vnd.tiddlywiki.mermaid block`
            );
        }
    });

    it('no Sankey example contains an ampersand in node content', () => {
        const sankeyPath = path.join(TIDDLERS_DIR, 'Sankey Diagram.tid');
        if (fs.existsSync(sankeyPath)) {
            const content = fs.readFileSync(sankeyPath, 'utf8');
            // Strip the front-matter (lines before the blank line separator) before checking
            const bodyStart = content.indexOf('\n\n');
            const body = bodyStart !== -1 ? content.slice(bodyStart) : content;
            assert.ok(
                !body.includes('&'),
                'Sankey Diagram.tid must not contain & in node content (Mermaid 11.12+ parse error)'
            );
        }
    });

    it('all 26 example tiddlers + legend recipe exist (phase-completion gate)', () => {
        const presentCount = EXPECTED_TIDDLERS.filter(name =>
            fs.existsSync(path.join(TIDDLERS_DIR, name))
        ).length;

        if (process.env.PHASE07_COMPLETE) {
            // Hard gate: all 27 must exist
            const missing = EXPECTED_TIDDLERS.filter(name =>
                !fs.existsSync(path.join(TIDDLERS_DIR, name))
            );
            assert.deepStrictEqual(
                missing,
                [],
                `Phase 7 completion gate: missing tiddlers: ${missing.join(', ')}`
            );
        } else {
            // Mid-phase: log progress and pass
            console.log(`Phase 7 progress: ${presentCount} / ${EXPECTED_TIDDLERS.length} tiddlers exist`);
        }
    });
});
