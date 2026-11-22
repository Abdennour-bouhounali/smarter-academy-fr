import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import lessons3e from '../packages/core/curriculum/fr/lessons_3e_2026_2027.json' with { type: 'json' };

/**
 * The FR 3e ↔ DZ (4AM, 3AM) lesson table of docs/curriculum/net-3e/: which Algerian lesson teaches the same learning
 * point (plan §8, reuse). The French side is checked always. The Algerian side is read-only from the sibling folder
 * `smarter-academy-dz`, and checked only on a machine that has it (CI does not).
 */
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DZ = join(ROOT, '../smarter-academy-dz');
const table = JSON.parse(readFileSync(join(ROOT, 'docs/curriculum/net-3e/fr_dz_table.json'), 'utf8'));
const byCode = new Map(lessons3e.lessons.map((l) => [l.code, l]));
const TYPES = ['same', 'same-maths-other-method', 'partial'];

describe('FR ↔ DZ table — the French side', () => {
  it('pairs each row with a French lesson (not a synthesis), once, with points of that lesson', () => {
    const seen = new Set();
    for (const r of table.rows) {
      const key = `${r.fr}>${r.dz}`;
      expect(seen.has(key), `duplicate ${key}`).toBe(false);
      seen.add(key);
      expect(byCode.get(r.fr)?.kind, key).toBe('lesson');
      expect(TYPES, key).toContain(r.type);
      expect(r.points.length, key).toBeGreaterThanOrEqual(1);
      for (const p of r.points) {
        const m = /^3e_(.+)_P(\d+)$/.exec(p.fr);
        expect(m?.[1], `${key}: ${p.fr}`).toBe(r.fr);
        expect(Number(m[2]), `${key}: ${p.fr}`).toBeLessThanOrEqual(byCode.get(r.fr).pointsToLearn.length);
        expect(p.dz, key).toMatch(new RegExp(`^${r.dzGrade}_${r.dz}_P\\d+$`));
      }
      if (r.type !== 'partial') {
        // « same » means every French point has its Algerian counterpart.
        expect(new Set(r.points.map((p) => p.fr)).size, key).toBe(byCode.get(r.fr).pointsToLearn.length);
      }
    }
  });
});

describe.runIf(existsSync(DZ))('FR ↔ DZ table — the Algerian side (sibling folder, read only)', () => {
  it('names DZ lessons and points that exist, and says truly whether the DZ lesson is v2', () => {
    const dz = {};
    for (const g of ['4am', '3am']) {
      for (const l of JSON.parse(readFileSync(join(DZ, `packages/core/curriculum/dz/lessons_${g}_2026_2027.json`), 'utf8')).lessons) dz[`${g}:${l.code}`] = l;
    }
    const packs = new Set();
    const walk = (d) => {
      for (const n of readdirSync(d)) {
        const p = join(d, n);
        if (statSync(p).isDirectory()) walk(p);
        else if (n === 'lesson.pack.js') packs.add(dirname(p).split('/').pop());
      }
    };
    walk(join(DZ, 'apps/web/src/lessons/moyen'));
    for (const r of table.rows) {
      const l = dz[`${r.dzGrade}:${r.dz}`];
      expect(l, `${r.dzGrade} ${r.dz}`).toBeDefined();
      for (const p of r.points) expect(Number(/_P(\d+)$/.exec(p.dz)[1]), p.dz).toBeLessThanOrEqual(l.pointsToLearn.length);
      expect(r.dzIsV2, `${r.dz}: dzIsV2`).toBe(packs.has(r.dz));
    }
  });
});
