import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { loadModule, getRequireCalls, clearRequireCalls, clearModuleCache, mockMermaidAPI } from './helpers/tw-bootstrap.js';
import './helpers/dom-mock.js';

function makeWidget(source) {
    var MermaidWidget = loadModule('$:/plugins/orange/mermaid-tw5/wrapper.js').mermaid;
    var widget = new MermaidWidget({ text: source }, {});
    widget.document = global.document;
    widget.attributes = {};
    widget.wiki = global.$tw.wiki;
    widget.variables = {};
    return widget;
}

describe('wrapper', () => {
    beforeEach(function() {
        clearModuleCache('$:/plugins/orange/mermaid-tw5/wrapper.js');
        global.$tw.browser = true;
    });

    it('exports MermaidWidget constructor', () => {
        var exports = loadModule('$:/plugins/orange/mermaid-tw5/wrapper.js');
        assert.ok(exports.mermaid, 'should export mermaid widget constructor');
    });

    it('instantiates without errors', () => {
        var widget = makeWidget('graph TD; A-->B');
        assert.ok(widget, 'should create widget instance');
    });

    it('render produces a DOM element containing SVG for a valid diagram', () => {
        var widget = makeWidget('graph TD; A-->B');
        var parent = global.document.createElement('div');
        widget.render(parent, null);

        assert.strictEqual(widget.domNodes.length, 1, 'should push one DOM node');
        assert.ok(widget.domNodes[0].innerHTML.indexOf('<svg') !== -1, 'should contain SVG');
    });

    it('handles invalid diagram syntax without throwing', () => {
        var widget = makeWidget('INVALID_SYNTAX');
        var parent = global.document.createElement('div');
        assert.doesNotThrow(function() {
            widget.render(parent, null);
        });
        assert.strictEqual(widget.domNodes.length, 1, 'should still push one DOM node');
    });

    it('displays a friendly error message for invalid syntax', () => {
        var widget = makeWidget('INVALID_SYNTAX');
        var parent = global.document.createElement('div');
        widget.render(parent, null);

        var html = widget.domNodes[0].innerHTML;
        assert.ok(html.indexOf('could not be rendered') !== -1, 'should explain the failure');
        assert.ok(html.indexOf('INVALID_SYNTAX') !== -1, 'should include the diagram source');
    });

    it('renders a placeholder when $tw.browser is false (Node.js build)', () => {
        global.$tw.browser = false;
        var widget = makeWidget('graph TD; A-->B');
        var parent = global.document.createElement('div');
        widget.render(parent, null);

        assert.strictEqual(widget.domNodes.length, 1, 'should push one DOM node');
        assert.ok(widget.domNodes[0].innerHTML.indexOf('requires a browser') !== -1,
            'should show browser-required placeholder');
    });

    describe('buildSiteConfig behavior', () => {
        beforeEach(function() {
            clearModuleCache('$:/plugins/orange/mermaid-tw5/wrapper.js');
            global.$tw.browser = true;
            mockMermaidAPI.initializeCalls = [];
            global.$tw.wiki.getTiddlerData = function() { return {}; };
        });

        it('calls initialize() on first render with startOnLoad: false', () => {
            var widget = makeWidget('graph TD; A-->B');
            widget.render(global.document.createElement('div'), null);

            assert.ok(mockMermaidAPI.initializeCalls.length > 0,
                'initialize should be called on first render');
            var config = mockMermaidAPI.initializeCalls[0];
            assert.strictEqual(config.startOnLoad, false,
                'startOnLoad must always be false');
        });

        it('does not call initialize() on second render (once-per-page, D-05)', () => {
            var widget1 = makeWidget('graph TD; A-->B');
            widget1.render(global.document.createElement('div'), null);
            var callCountAfterFirst = mockMermaidAPI.initializeCalls.length;

            var widget2 = makeWidget('graph TD; C-->D');
            widget2.render(global.document.createElement('div'), null);

            assert.strictEqual(mockMermaidAPI.initializeCalls.length, callCountAfterFirst,
                'initialize should not be called again on second render');
        });

        it('uses securityLevel loose as default when config tiddler absent', () => {
            var widget = makeWidget('graph TD; A-->B');
            widget.render(global.document.createElement('div'), null);

            var config = mockMermaidAPI.initializeCalls[0];
            assert.strictEqual(config.securityLevel, 'loose',
                'default securityLevel should be loose');
        });
    });

    describe('config wiring', () => {
        beforeEach(function() {
            clearModuleCache('$:/plugins/orange/mermaid-tw5/wrapper.js');
            global.$tw.browser = true;
            // Reset initialize call tracking before each test
            mockMermaidAPI.initializeCalls = [];
            mockMermaidAPI.lastRenderSource = null;
            // Reset getTiddlerData to default (returns empty object)
            global.$tw.wiki.getTiddlerData = function() { return {}; };
        });

        it('calls initialize() on first render with startOnLoad: false', () => {
            var widget = makeWidget('graph TD; A-->B');
            widget.render(global.document.createElement('div'), null);

            assert.ok(mockMermaidAPI.initializeCalls.length > 0,
                'initialize should be called on first render');
            var config = mockMermaidAPI.initializeCalls[0];
            assert.strictEqual(config.startOnLoad, false,
                'startOnLoad must always be false');
        });

        it('does not call initialize() on second render (once-per-page, D-05)', () => {
            var widget1 = makeWidget('graph TD; A-->B');
            widget1.render(global.document.createElement('div'), null);
            var callCountAfterFirst = mockMermaidAPI.initializeCalls.length;

            var widget2 = makeWidget('graph TD; C-->D');
            widget2.render(global.document.createElement('div'), null);

            assert.strictEqual(mockMermaidAPI.initializeCalls.length, callCountAfterFirst,
                'initialize should not be called again on second render');
        });

        it('passes securityLevel from config tiddler to initialize()', () => {
            global.$tw.wiki.getTiddlerData = function(title) {
                if (title === '$:/plugins/orange/mermaid-tw5/config') {
                    return { securityLevel: 'strict' };
                }
                return {};
            };
            var widget = makeWidget('graph TD; A-->B');
            widget.render(global.document.createElement('div'), null);

            var config = mockMermaidAPI.initializeCalls[0];
            assert.strictEqual(config.securityLevel, 'strict',
                'securityLevel from config tiddler should reach initialize()');
        });

        it('uses securityLevel loose as default when config tiddler absent', () => {
            // getTiddlerData already returns {} by default from beforeEach reset
            var widget = makeWidget('graph TD; A-->B');
            widget.render(global.document.createElement('div'), null);

            var config = mockMermaidAPI.initializeCalls[0];
            assert.strictEqual(config.securityLevel, 'loose',
                'default securityLevel should be loose');
        });

        it('merges theme/look/fontFamily from config tiddler', () => {
            global.$tw.wiki.getTiddlerData = function(title) {
                if (title === '$:/plugins/orange/mermaid-tw5/config') {
                    return { theme: 'forest', look: 'handDrawn', fontFamily: 'monospace' };
                }
                return {};
            };
            var widget = makeWidget('graph TD; A-->B');
            widget.render(global.document.createElement('div'), null);

            var config = mockMermaidAPI.initializeCalls[0];
            assert.strictEqual(config.theme, 'forest',
                'theme from config tiddler should reach initialize()');
            assert.strictEqual(config.look, 'handDrawn',
                'look from config tiddler should reach initialize()');
            assert.strictEqual(config.fontFamily, 'monospace',
                'fontFamily from config tiddler should reach initialize()');
        });

        it('passes flowchart nested block from config tiddler to initialize()', () => {
            global.$tw.wiki.getTiddlerData = function(title) {
                if (title === '$:/plugins/orange/mermaid-tw5/config') {
                    return { flowchart: { curve: 'linear' } };
                }
                return {};
            };
            var widget = makeWidget('graph TD; A-->B');
            widget.render(global.document.createElement('div'), null);

            var config = mockMermaidAPI.initializeCalls[0];
            assert.strictEqual(config.flowchart.curve, 'linear',
                'flowchart.curve from config tiddler should reach initialize() (D-04 shallow replace)');
        });
    });

    describe('lazy loading', () => {
        it('does not load mermaid or d3 during module evaluation', () => {
            clearRequireCalls();
            loadModule('$:/plugins/orange/mermaid-tw5/wrapper.js');

            var calls = getRequireCalls();
            assert.ok(calls.indexOf('$:/plugins/orange/mermaid-tw5/mermaid.min.js') === -1,
                'should not require mermaid at module load time');
            assert.ok(calls.indexOf('$:/plugins/orange/mermaid-tw5/d3.v6.min.js') === -1,
                'should not require d3 at module load time');
        });

        it('loads mermaid and d3 on first render', () => {
            clearRequireCalls();
            var widget = makeWidget('graph TD; A-->B');
            var parent = global.document.createElement('div');
            widget.render(parent, null);

            var calls = getRequireCalls();
            assert.ok(calls.indexOf('$:/plugins/orange/mermaid-tw5/mermaid.min.js') !== -1,
                'should require mermaid on first render');
            assert.ok(calls.indexOf('$:/plugins/orange/mermaid-tw5/d3.v6.min.js') !== -1,
                'should require d3 on first render');
        });

        it('does not reload mermaid or d3 on subsequent renders', () => {
            var widget1 = makeWidget('graph TD; A-->B');
            widget1.render(global.document.createElement('div'), null);

            clearRequireCalls();

            // Reuse the same module instance — mermaidAPI is already loaded
            var widget2 = makeWidget('graph TD; C-->D');
            widget2.render(global.document.createElement('div'), null);

            var calls = getRequireCalls();
            assert.ok(calls.indexOf('$:/plugins/orange/mermaid-tw5/mermaid.min.js') === -1,
                'should not re-require mermaid on second render');
            assert.ok(calls.indexOf('$:/plugins/orange/mermaid-tw5/d3.v6.min.js') === -1,
                'should not re-require d3 on second render');
        });
    });
});
