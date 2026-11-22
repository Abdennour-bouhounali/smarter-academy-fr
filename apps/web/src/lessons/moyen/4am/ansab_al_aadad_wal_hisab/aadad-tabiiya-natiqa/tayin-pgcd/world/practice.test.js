import { describe, it, expect } from 'vitest';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { explain, waveSay } from '../../../../../../common/gameworld/divisorIsles/strings';
import { ladder, isRight, PRACTICE_NODES, PRACTICE_MAP } from './practice';
import { divisorsOf, gcd } from './math';
import { KEYS } from './journey';
import { TABLETS } from './story';
import { TEXT } from './text';

/** The PGCD by listing (independent of Euclid): the greatest number that divides both. 0 is divided by every number. */
const byListing = (a, b) => {
  const top = Math.max(a, b);
  let best = 0;
  for (let d = 1; d <= top; d += 1) if (a % d === 0 && b % d === 0) best = d;
  return best;
};
const runs = (seeds, salt) =>
  ladder.LEVEL_ORDER.flatMap(({ node, level, id }) =>
    Array.from({ length: seeds }, (_, s) =>
      ladder.makeRun(rng((s + 1) * salt + level * 7 + node), node, level),
    ).flatMap((run) => run.map((w) => ({ w, node, id }))),
  );

describe('حلبة التدريب — the practice ladder of « تعيين القاسم المشترك الأكبر »', () => {
  it('one node per key and a summary node, each level named and placed on the hub; the first key weighs most', () => {
    expect(PRACTICE_NODES.map((n) => n.id)).toEqual([...KEYS, 'exam']);
    for (const node of PRACTICE_NODES) {
      expect(TEXT.levels[node.id], node.id).toHaveLength(node.levels.length);
      expect(PRACTICE_MAP.positions[node.id], node.id).toBeTruthy();
    }
    expect(PRACTICE_NODES.map((n) => n.levels.length)).toEqual([3, 1, 2, 2]);
    expect(ladder.LEVEL_ORDER).toHaveLength(8);
    for (const [from, to] of PRACTICE_MAP.edges.map((e) => e.slice(0, 2)))
      for (const id of [from, to]) expect(Object.keys(PRACTICE_MAP.positions)).toContain(id);
  });

  it('the hub shows no key’s name and no rule before its forge: level names and link labels say places and questions', () => {
    const shown = [...Object.values(TEXT.levels).flat(), ...PRACTICE_MAP.edges.map((e) => e[2]).filter(Boolean)];
    for (const line of shown) {
      for (const t of Object.values(TABLETS)) expect(line, line).not.toContain(t.title);
      expect(line, line).not.toMatch(/قائم|احصر|قاطع|مباشر|الأصغر|دون حساب|مختصر|نفسه/);
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
      if (w.type === 'missing') expect(w.b * w.q).toBe(w.a);
    }
  });

  it('a PGCD wave: the right gate is the PGCD found by listing; every wrong gate has its own TRUE line', () => {
    const seen = new Set();
    /** The equalities « $x = y \times z + r$ » of a line are true. */
    const trueEqualities = (t) => {
      for (const [, x, y, z, r] of t.matchAll(/\$(\d+) = (\d+) \\times (\d+)(?: \+ (\d+))?\$/g))
        expect(Number(y) * Number(z) + Number(r ?? 0), t).toBe(Number(x));
    };
    for (const { w, id } of runs(60, 31337)) {
      if (w.type !== 'pgcd' && w.type !== 'commonDivisor') continue;
      const tag = `${id} ${JSON.stringify(w)}`;
      const right = w.gates[w.good];
      if (w.type === 'pgcd') {
        expect(right, tag).toBe(byListing(w.a, w.b));
        expect(right, tag).toBe(gcd(w.a, w.b));
        expect(waveSay(w)).toBe(`$\\mathrm{PGCD}(${w.a} ; ${w.b})$`);
        const kind =
          w.a === w.b
            ? 'same'
            : w.a === 0 || w.b === 0
              ? 'zero'
              : w.a === 1 || w.b === 1
                ? 'one'
                : w.a % w.b === 0 || w.b % w.a === 0
                  ? 'divides'
                  : 'list';
        seen.add(kind);
        if (kind === 'list') expect(Math.max(...w.gates), tag).toBeLessThanOrEqual(10);
      } else {
        seen.add('common');
        expect([w.a % right, w.b % right], tag).toEqual([0, 0]);
        expect(waveSay(w)).toBe(`قاسم مشترك للعددين ${w.a} و ${w.b}`);
        expect(Math.max(...w.gates), tag).toBeLessThanOrEqual(10);
      }
      trueEqualities(w.why.right);
      for (const n of w.gates.filter((x) => x !== right)) {
        const g = explain(w, n);
        expect(g.wrong, `${tag} ${n}`).toContain(String(n));
        expect(g.right, tag).toContain(String(right));
        trueEqualities(g.wrong);
        // « n قاسم مشترك … ليس الأكبر » only when n is common and smaller; « n يقسم x » only when it does
        if (/قاسم مشترك للعددين، لكنّه ليس الأكبر/.test(g.wrong))
          expect([w.a % n, w.b % n, n < right], tag).toEqual([0, 0, true]);
        const m = g.wrong.match(/^(\d+) يقسم (\d+)،/);
        if (m) expect(Number(m[2]) % Number(m[1]), tag).toBe(0);
      }
    }
    expect([...seen].sort()).toEqual(['common', 'divides', 'list', 'one', 'same', 'zero']);
  });

  it('a list wave lays the lists in its guidance — joined with a no-break space before each comma', () => {
    const node = PRACTICE_NODES.findIndex((n) => n.id === 'hasr-wa-taqatu');
    let n = 0;
    for (let seed = 1; seed <= 30; seed += 1) {
      for (const w of ladder.makeRun(rng(seed * 104729), node, 1).filter((x) => x.type === 'pgcd')) {
        const common = divisorsOf(w.a).filter((d) => w.b % d === 0);
        expect(w.why.right).toContain(`قواسم ${w.a}: ${divisorsOf(w.a).join(' ، ')}`);
        expect(w.why.right).toContain(`المشتركة: ${common.join(' ، ')}، وأكبرها ${common.at(-1)}`);
        expect(w.why.right).not.toMatch(/\d ،/);
        n += 1;
      }
    }
    expect(n).toBeGreaterThan(30);
  });
});
