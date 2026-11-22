// LE LOT D'ENTRÉE anime avec `m`, pas avec `motion` (BUNDLE_BOUNDARIES.md §3, « framer-motion »).
// `motion` embarque la mise en page animée et le glisser (≈ 11 Ko gzip) ; `m` ne porte que ce que
// `<LazyMotion features={domAnimation}>` (main.jsx) lui donne. Un seul fichier de la coquille qui importe
// `motion` remet le tout dans le premier téléchargement de chaque visiteur — sans dépasser le budget, donc
// sans que la porte de taille le voie. Ce test suit les imports STATIQUES depuis main.jsx et le refuse.
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = path.dirname(fileURLToPath(import.meta.url));

function resolveLocal(from, spec) {
  const base = path.resolve(path.dirname(from), spec);
  const candidates = [base, `${base}.js`, `${base}.jsx`, path.join(base, 'index.js'), path.join(base, 'index.jsx')];
  return candidates.find((file) => fs.existsSync(file) && fs.statSync(file).isFile()) ?? null;
}

/** Les imports statiques d'un fichier : `import … from '…'`, `export … from '…'`, `import '…'` — jamais `import('…')`. */
function staticImports(text) {
  const withoutComments = text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const found = [...withoutComments.matchAll(/^\s*(?:import|export)\s[^'"]*?from\s*['"]([^'"]+)['"]/gm)];
  const bare = [...withoutComments.matchAll(/^\s*import\s*['"]([^'"]+)['"]/gm)];
  return [...found, ...bare].map((match) => match[1]);
}

function eagerFiles() {
  const seen = new Set();
  const queue = [path.join(SRC, 'main.jsx')];
  while (queue.length) {
    const file = queue.pop();
    if (seen.has(file) || !/\.jsx?$/.test(file)) continue;
    seen.add(file);
    for (const spec of staticImports(fs.readFileSync(file, 'utf8'))) {
      if (!spec.startsWith('.')) continue;
      const next = resolveLocal(file, spec);
      if (next) queue.push(next);
    }
  }
  return [...seen];
}

describe('the entry graph', () => {
  const files = eagerFiles();

  it('is the shell, not the application', () => {
    // Garde-fou du test lui-même : s'il ne suit plus les imports, il ne protège plus rien ;
    // s'il suit les `lazy()`, il lirait les milliers de fichiers des pages.
    expect(files.length).toBeGreaterThan(60);
    expect(files.length).toBeLessThan(400);
  });

  it('animates with `m` — no eager file imports `motion` from framer-motion', () => {
    const offenders = files
      .filter((file) => /import\s*\{[^}]*\bmotion\b[^}]*\}\s*from\s*['"]framer-motion['"]/.test(fs.readFileSync(file, 'utf8')))
      .map((file) => path.relative(SRC, file));
    expect(offenders).toEqual([]);
  });

  it('mounts LazyMotion at the root, so every `m` component animates', () => {
    const main = fs.readFileSync(path.join(SRC, 'main.jsx'), 'utf8');
    expect(main).toMatch(/<LazyMotion features=\{domAnimation\}>/);
  });
});
