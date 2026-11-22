// Le build d'ANALYSE du lot d'entrée (docs/architecture/BUNDLE_BOUNDARIES.md §6) — lancé par
// scripts/analyze-entry-bundle.mjs, jamais par le build de production. Il reprend la config
// normale et écrit, dans ANALYZE_OUT : graph.json (imports statiques / dynamiques de chaque
// module) et chunks.json (modules de chaque chunk et leur taille rendue).
import { writeFileSync } from 'node:fs';
import base from './vite.config.js';

const OUT = process.env.ANALYZE_OUT;

export default {
  ...base,
  build: { ...(base.build ?? {}), outDir: `${OUT}/dist`, emptyOutDir: true },
  plugins: [...(base.plugins ?? []), {
    name: 'sa-analyze-entry',
    buildEnd() {
      const graph = {};
      for (const id of this.getModuleIds()) {
        const info = this.getModuleInfo(id);
        graph[id] = { imports: info.importedIds, dynamic: info.dynamicallyImportedIds };
      }
      writeFileSync(`${OUT}/graph.json`, JSON.stringify(graph));
    },
    generateBundle(_, bundle) {
      const chunks = {};
      for (const [name, c] of Object.entries(bundle)) {
        if (c.type !== 'chunk') continue;
        chunks[name] = { isEntry: c.isEntry, imports: c.imports, modules: Object.fromEntries(Object.entries(c.modules).map(([id, m]) => [id, m.renderedLength])) };
      }
      writeFileSync(`${OUT}/chunks.json`, JSON.stringify(chunks));
    },
  }],
};
