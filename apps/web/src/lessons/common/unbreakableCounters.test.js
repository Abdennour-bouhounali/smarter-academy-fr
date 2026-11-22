import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * UN COMPTEUR NE SE COUPE JAMAIS (propriétaire, 2026-11-09 : « 6 / 10 » s'affichait sur deux lignes, « 6 / » puis « 10 »).
 * Un navigateur coupe une ligne à une ESPACE : « x / y » écrit avec des espaces ordinaires peut casser partout (pastille, carte,
 * bouton, tableau). Règle : autour du « / » d'un compteur, des espaces INSÉCABLES (` `) — dans le JSX `{a}{' / '}{b}`,
 * dans un gabarit `${a} / ${b}`, dans une traduction « {{a}} / {{b}} ». Ce test parcourt TOUT `src/`.
 */
const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
/** Les gabarits qui ne sont PAS des compteurs affichés : un ratio CSS, des messages de développeur, une formule, une étiquette ARIA. */
const NOT_COUNTERS = new Set([
  'lessons/common/manipulations/equations/EquationBalance.jsx',
  'lessons/common/components/geoFigure.js',
  'lessons/common/components/spaceFigure.js',
  'features/mathlab/tools/sequences/sequenceFormat.js',
  'pages/teacher/ChallengeDisplayPage.jsx',
]);

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'node_modules') walk(p, out); } else out.push(p);
  }
  return out;
}
const files = walk(SRC);
const lineOf = (s, i) => s.slice(0, i).split('\n').length;
const hits = (s, needle) => { const out = []; let i = s.indexOf(needle); while (i >= 0) { out.push(lineOf(s, i)); i = s.indexOf(needle, i + 1); } return out; };

describe('no « x / y » counter can break onto two lines', () => {
  it('JSX and template strings use non-breaking spaces around the « / » of a counter', () => {
    const bad = [];
    files.filter((f) => /\.(jsx?|tsx?)$/.test(f) && !/\.test\./.test(f)).forEach((f) => {
      const rel = path.relative(SRC, f).split(path.sep).join('/');
      const s = fs.readFileSync(f, 'utf8');
      hits(s, '} / {').forEach((l) => bad.push(`${rel}:${l}  {a} / {b}`));
      if (!NOT_COUNTERS.has(rel)) hits(s, '} / ${').forEach((l) => bad.push(`${rel}:${l}  \${a} / \${b}`));
    });
    expect(bad, `breakable counters:\n${bad.join('\n')}`).toEqual([]);
  });
  it('translations use non-breaking spaces around the « / » of a counter', () => {
    const bad = [];
    files.filter((f) => f.includes(`${path.sep}i18n${path.sep}locales${path.sep}`) && f.endsWith('.json')).forEach((f) => {
      const s = fs.readFileSync(f, 'utf8');
      hits(s, '}} / {{').forEach((l) => bad.push(`${path.relative(SRC, f)}:${l}`));
    });
    expect(bad, `breakable counters:\n${bad.join('\n')}`).toEqual([]);
  });
});
