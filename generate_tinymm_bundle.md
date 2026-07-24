```node unsafe
const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

(async () => {
  // 1. Move to /tmp to prevent npm root directory ("idealTree") errors
  process.chdir(os.tmpdir());

  // 2. Initialize container workspace and install standard mermaid + esbuild
  execSync('npm init -y', { stdio: 'ignore' });
  execSync('npm install mermaid@11.4.0 esbuild', { stdio: 'pipe' });

  // 3. Require esbuild using absolute path from current node_modules directory
  const esbuild = require(path.join(process.cwd(), 'node_modules', 'esbuild'));

  // 4. Create dummy module to stub unused heavy engines
  fs.writeFileSync('empty_stub.js', 'export default function() { return {}; }; export const parser = {}; export const diagram = {}; export const renderToString = () => "";', 'utf8');

  // 5. Create entry point
  const entryContent = `
import mermaid from 'mermaid/dist/mermaid.core.mjs';
export default mermaid;
`;
  fs.writeFileSync('entry.js', entryContent, 'utf8');

  // 6. Plugin to stub unused diagrams & heavy libs (stubbing sequence, state, and class diagrams)
  const stubPlugin = {
    name: 'stub-unused',
    setup(build) {
      // Stub heavy third-party libs (KaTeX, ZenUML, ELK)
      build.onResolve({ filter: /^(katex|zenuml|@mermaid-js\/layout-elk)(\/.*)?$/ }, () => ({
        path: path.join(process.cwd(), 'empty_stub.js')
      }));

      // Stub unused diagram chunks (stubbing sequence, state, class, C4, architecture, gitGraph, ER, sankey, packet, requirement, radar)
      build.onResolve({ filter: /(c4Diagram|architectureDiagram|zenumlDiagram|gitGraphDiagram|erDiagram|sankeyDiagram|packetDiagram|requirementDiagram|radarDiagram|sequenceDiagram|stateDiagram|classDiagram)/ }, () => ({
        path: path.join(process.cwd(), 'empty_stub.js')
      }));
    }
  };

  // 7. Bundle using async esbuild.build API
  await esbuild.build({
    entryPoints: ['entry.js'],
    bundle: true,
    minify: true,
    treeShaking: true,
    legalComments: 'none',
    format: 'iife',
    globalName: '__esbuild_esm_mermaid_nm',
    outfile: 'bundle.js',
    plugins: [stubPlugin]
  });

  // 8. Read bundle and wrap with TW5 header and safe export footer
  const tidHeader = `module-type: library\ntitle: $:/plugins/orange/mermaid-tw5/mermaid.min.js\ntype: application/javascript\n\n`;
  const bundleJs = fs.readFileSync('bundle.js', 'utf8');

  const twExportFooter = `\nvar m = (typeof window !== "undefined" && window.mermaid) || (typeof globalThis !== "undefined" && globalThis.mermaid) || (typeof __esbuild_esm_mermaid_nm !== "undefined" && __esbuild_esm_mermaid_nm.mermaid && __esbuild_esm_mermaid_nm.mermaid.default) || (typeof __esbuild_esm_mermaid_nm !== "undefined" && __esbuild_esm_mermaid_nm.mermaid);
if (typeof globalThis !== "undefined") { globalThis.mermaid = m; }
if (typeof window !== "undefined") { window.mermaid = m; }
if (typeof exports !== "undefined") {
  exports.mermaid = m;
  exports.mermaidAPI = m ? (m.mermaidAPI || m) : null;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = m;
  }
}`;

  // Output result artifact to stdout
  process.stdout.write((tidHeader + bundleJs + twExportFooter).trim());
})();
```
