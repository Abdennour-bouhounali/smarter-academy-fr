import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TX } from './text';

const LESSONS = join(dirname(fileURLToPath(import.meta.url)), '../../../moyen');
/** Every `world/knowledge.js` of the lessons, found on disk (never a hand list). */
const knowledgeFiles = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return knowledgeFiles(p);
    return e.name === 'knowledge.js' && dir.endsWith('/world') ? [p] : [];
  });

describe('the knowledge map names every kind of card the lessons use', () => {
  it('each `kind` of a card in any world/knowledge.js has its icon, its word and its family (never « • » alone)', () => {
    const files = knowledgeFiles(LESSONS);
    expect(files.length).toBeGreaterThan(0);
    const used = new Map();
    for (const f of files)
      for (const m of readFileSync(f, 'utf8').matchAll(/\bkind:\s*['"]([a-z_]+)['"]/g))
        used.set(m[1], [...(used.get(m[1]) ?? []), f.slice(LESSONS.length + 1)]);
    expect(used.size).toBeGreaterThan(0);
    for (const [kind, where] of used) {
      const entry = TX.know.kinds[kind];
      expect(entry, `${kind} (${where[0]})`).toBeTruthy();
      const [icon, word, family] = entry;
      expect(icon.trim(), kind).not.toBe('');
      expect(word.trim(), kind).not.toBe('');
      expect(Object.keys(TX.know.legend), kind).toContain(family);
    }
  });
});
