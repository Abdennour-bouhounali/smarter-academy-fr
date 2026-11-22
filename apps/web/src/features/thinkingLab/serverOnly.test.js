/**
 * Le contenu du « مختبر التفكير » contient les RÉPONSES : seul le serveur le lit
 * (THINKING_LAB.md §2, BUNDLE_BOUNDARIES.md §4 règle 9). Aucun module web hors test
 * n'importe content/thinking-lab/ — ni l'index généré, ni un défi.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const SRC = new URL('../../', import.meta.url).pathname;

function* sources(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* sources(path);
    else if (/\.(jsx?|tsx?)$/.test(name) && !/\.test\./.test(name)) yield path;
  }
}

describe('le contenu du « مختبر التفكير » reste côté serveur', () => {
  it('aucun module web n\'importe content/thinking-lab', () => {
    const offenders = [...sources(SRC)].filter((f) => /content\/thinking-lab/.test(readFileSync(f, 'utf8')));
    expect(offenders).toEqual([]);
  });
});
