import { describe, it, expect } from 'vitest';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { explain, waveSay } from '../../../../../../common/gameworld/divisorIsles/strings';
import { ladder, isRight, PRACTICE_NODES, PRACTICE_MAP } from './practice';
import { differences, euclid, gcd } from './math';
import { KEYS } from './journey';
import { TABLETS } from './story';
import { TEXT } from './text';

/** The PGCD by listing (independent of Euclid): the greatest number that divides both. */
const byListing = (a, b) => {
  let best = 0;
  for (let d = 1; d <= Math.max(a, b); d += 1) if (a % d === 0 && b % d === 0) best = d;
  return best;
};
const runs = (seeds, salt) =>
  ladder.LEVEL_ORDER.flatMap(({ node, level, id }) =>
    Array.from({ length: seeds }, (_, s) =>
      ladder.makeRun(rng((s + 1) * salt + level * 7 + node), node, level),
    ).flatMap((run) => run.map((w) => ({ w, node, id }))),
  );
/** The equalities « $x = y \times z + r$ » and « $x - y = d$ » of a line are true. */
const trueEqualities = (t) => {
  for (const [, x, y, z, r] of t.matchAll(/\$(\d+) = (\d+) \\times (\d+)(?: \+ (\d+))?\$/g))
    expect(Number(y) * Number(z) + Number(r ?? 0), t).toBe(Number(x));
  for (const [, x, y, d] of t.matchAll(/\$(\d+) - (\d+) = (\d+)\$/g)) expect(Number(x) - Number(y), t).toBe(Number(d));
  for (const [, x, y, g] of t.matchAll(/PGCD\}\((\d+) ; (\d+)\) = (\d+)\$/g))
    expect(gcd(Number(x), Number(y)), t).toBe(Number(g));
  for (const [, sum, s] of t.matchAll(/\$((?:\d+ \+ )+\d+) = (\d+)\$/g))
    expect(
      sum.split(' + ').reduce((n, x) => n + Number(x), 0),
      t,
    ).toBe(Number(s));
};

describe('حلبة التدريب — the practice ladder of « البحث عن القاسم المشترك الأكبر »', () => {
  it('one node per key and a summary node, each level named and placed on the hub; Euclid and the choice weigh most', () => {
    expect(PRACTICE_NODES.map((n) => n.id)).toEqual([...KEYS, 'exam']);
    for (const node of PRACTICE_NODES) {
      expect(TEXT.levels[node.id], node.id).toHaveLength(node.levels.length);
      expect(PRACTICE_MAP.positions[node.id], node.id).toBeTruthy();
    }
    expect(PRACTICE_NODES.map((n) => n.levels.length)).toEqual([1, 2, 1, 2, 2, 2]);
    expect(ladder.LEVEL_ORDER).toHaveLength(10);
    for (const [from, to] of PRACTICE_MAP.edges.map((e) => e.slice(0, 2)))
      for (const id of [from, to]) expect(Object.keys(PRACTICE_MAP.positions)).toContain(id);
  });

  it('the hub shows no key’s name and no rule before its forge: level names and link labels say places and questions', () => {
    const shown = [...Object.values(TEXT.levels).flat(), ...PRACTICE_MAP.edges.map((e) => e[2]).filter(Boolean)];
    for (const line of shown) {
      for (const t of Object.values(TABLETS)) expect(line, line).not.toContain(t.title);
      expect(line, line).not.toMatch(/فرق|الفروق|باقٍ|الباقي|إقليدس|آخر|يحفظ|خوارزمية|أسرع|أقلّ|غير معدوم|مكان/);
    }
  });

  it('every wave of every level has exactly ONE right gate, a sentence and a guidance — mental arithmetic', () => {
    for (const { w, node, id } of runs(40, 7919)) {
      const tag = `${id} ${JSON.stringify(w)}`;
      expect(
        w.gates.filter((n) => isRight(w, n)),
        tag,
      ).toHaveLength(1);
      expect(new Set(w.gates).size).toBe(3);
      expect(waveSay(w), id).toBeTruthy();
      const g = explain(
        w,
        w.gates.find((n) => !isRight(w, n)),
      );
      expect(g.wrong && g.right, tag).toBeTruthy();
      expect(`${waveSay(w)} ${g.wrong} ${g.right}`).not.toMatch(/undefined|NaN/);
      expect(w.key === PRACTICE_NODES[node].id || PRACTICE_NODES[node].id === 'exam').toBe(true);
      expect(Math.max(w.a, w.b ?? 0, ...w.gates), tag).toBeLessThanOrEqual(100);
    }
  });

  it('every right gate is the arithmetic of its numbers; every wrong gate has its own TRUE line', () => {
    const seen = new Set();
    for (const { w, id } of runs(60, 31337)) {
      const tag = `${id} ${JSON.stringify(w)}`;
      const right = w.gates[w.good];
      seen.add(w.type);
      const { a, b } = w;
      if (w.type === 'pgcdBox') {
        // the equality with the right gate is true; with every wrong gate it is FALSE
        expect(gcd(b, right), tag).toBe(byListing(a, b));
        for (const n of w.gates.filter((x) => x !== right)) expect(n === 0 || gcd(b, n) !== gcd(a, b), tag).toBe(true);
        expect(right === a - b || right === a % b, tag).toBe(true);
      }
      if (['lastDiff', 'lastRest', 'pgcd'].includes(w.type)) expect(right, tag).toBe(byListing(a, b));
      if (w.type === 'divCount') expect(right, tag).toBe(euclid(a, b).length);
      if (w.type === 'subCount') {
        expect(right, tag).toBe(differences(a, b).length);
        // a run of subtractions IS one division: the count is the sum of the quotients
        expect(right, tag).toBe(euclid(a, b).reduce((n, s) => n + s.q, 0));
      }
      if (w.type === 'remainder') expect(right, tag).toBe(a % b);
      if (w.why) trueEqualities(w.why.right);
      for (const n of w.gates.filter((x) => x !== right)) {
        const g = explain(w, n);
        if (w.why) {
          expect(g.wrong, `${tag} ${n}`).toContain(String(n));
          trueEqualities(g.wrong);
        }
        // « n قاسم مشترك … ليس الأكبر » only when n is common and smaller; « n يقسم x » only when it does
        if (/قاسم مشترك للعددين، لكنّه ليس الأكبر/.test(g.wrong))
          expect([a % n, b % n, n < right], tag).toEqual([0, 0, true]);
        const m = g.wrong.match(/^(\d+) يقسم (\d+)،/);
        if (m) expect(Number(m[2]) % Number(m[1]), tag).toBe(0);
        const big = g.wrong.match(/^(\d+) أكبر من (\d+)/);
        if (big) expect(Number(big[1])).toBeGreaterThan(Number(big[2]));
      }
    }
    expect([...seen].sort()).toEqual(
      ['divCount', 'lastDiff', 'lastRest', 'pgcd', 'pgcdBox', 'remainder', 'subCount'].sort(),
    );
  });

  it('the counts agree in Arabic: « قسمتان », « 3 قسمات », never « 2 قسمات »', () => {
    let n = 0;
    for (const { w } of runs(40, 104729)) {
      if (w.type !== 'divCount' && w.type !== 'subCount') continue;
      n += 1;
      expect(w.why.right).not.toMatch(
        /(?<![0-9])[12] (قسمات|قسمة|عمليات|عملية)|(?<![0-9])(1[1-9]|[2-9]\d) (قسمات|عمليات)/,
      );
    }
    expect(n).toBeGreaterThan(50);
  });
});
