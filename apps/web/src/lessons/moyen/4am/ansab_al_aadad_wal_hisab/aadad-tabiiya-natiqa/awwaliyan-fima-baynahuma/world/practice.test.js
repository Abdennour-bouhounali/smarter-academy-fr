import { describe, it, expect } from 'vitest';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { explain, waveSay } from '../../../../../../common/gameworld/divisorIsles/strings';
import { ladder, isRight, PRACTICE_NODES, PRACTICE_MAP } from './practice';
import { RULES, gcd } from './math';
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
/** The equalities « $x = y \times z (+ r)$ » and « $PGCD(x ; y) = g$ » of a line are true. */
const trueEqualities = (t) => {
  for (const [, x, y, z, r] of t.matchAll(/\$(\d+) = (\d+) \\times (\d+)(?: \+ (\d+))?\$/g))
    expect(Number(y) * Number(z) + Number(r ?? 0), t).toBe(Number(x));
  for (const [, x, y, g] of t.matchAll(/PGCD\}\((\d+) ; (\d+)\) = (\d+)\$/g))
    expect(gcd(Number(x), Number(y)), t).toBe(Number(g));
};

describe('حلبة التدريب — the practice ladder of « العددان الأوّليّان فيما بينهما »', () => {
  it('one node per key and a summary node, each level named and placed on the hub; the proof and the witness weigh most', () => {
    expect(PRACTICE_NODES.map((n) => n.id)).toEqual([...KEYS, 'exam']);
    for (const node of PRACTICE_NODES) {
      expect(TEXT.levels[node.id], node.id).toHaveLength(node.levels.length);
      expect(PRACTICE_MAP.positions[node.id], node.id).toBeTruthy();
    }
    expect(PRACTICE_NODES.map((n) => n.levels.length)).toEqual([1, 2, 2, 2]);
    expect(ladder.LEVEL_ORDER).toHaveLength(7);
    for (const [from, to] of PRACTICE_MAP.edges.map((e) => e.slice(0, 2)))
      for (const id of [from, to]) expect(Object.keys(PRACTICE_MAP.positions)).toContain(id);
  });

  it('the hub shows no key’s name and no rule before its forge: level names and link labels say places and questions', () => {
    const shown = [...Object.values(TEXT.levels).flat(), ...PRACTICE_MAP.edges.map((e) => e[2]).filter(Boolean)];
    for (const line of shown) {
      for (const t of Object.values(TABLETS)) expect(line, line).not.toContain(t.title);
      expect(line, line).not.toMatch(/أوّلي|أولي|قاسم|مشترك|PGCD|يكفي|شاهد|إقليدس|خوارزمية|نثبت|غير 1|وحده/);
    }
  });

  it('the map is laid out: each labelled link’s middle lies away from every node', () => {
    const P = PRACTICE_MAP.positions;
    for (const [from, to, label] of PRACTICE_MAP.edges) {
      if (!label) continue;
      const [mx, my] = [(P[from][0] + P[to][0]) / 2, (P[from][1] + P[to][1]) / 2];
      for (const [id, [x, y]] of Object.entries(P))
        expect(Math.hypot(x - mx, y - my), `${label} near ${id}`).toBeGreaterThanOrEqual(15);
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
      expect(waveSay(w), id).toBe(w.say);
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
    let hidden = 0;
    let ones = 0;
    for (const { w, id } of runs(60, 31337)) {
      const tag = `${id} ${JSON.stringify(w)}`;
      const right = w.gates[w.good];
      seen.add(w.type);
      const { a, b } = w;
      if (w.type === 'pgcd') expect(right, tag).toBe(byListing(a, b));
      if (w.type === 'witness') {
        expect([a % right, b % right, right > 1], tag).toEqual([0, 0, true]);
        if (!RULES.some((r) => a % r === 0 && b % r === 0)) hidden += 1;
      }
      if (w.type === 'coprimeWith') {
        expect(byListing(right, a), tag).toBe(1);
        expect(w.gates, tag).not.toContain(1);
      }
      trueEqualities(w.why.right);
      for (const n of w.gates.filter((x) => x !== right)) {
        const g = explain(w, n);
        expect(g.wrong, `${tag} ${n}`).toContain(String(n));
        trueEqualities(g.wrong);
        if (n === 1) ones += 1;
        if (/قاسم مشترك للعددين، لكنّه ليس الأكبر/.test(g.wrong))
          expect([a % n, b % n, n < right], tag).toEqual([0, 0, true]);
        const m = g.wrong.match(/^(\d+) يقسم (\d+)،/);
        if (m) expect(Number(m[2]) % Number(m[1]), tag).toBe(0);
        const big = g.wrong.match(/^(\d+) أكبر من (\d+)/);
        if (big) expect(Number(big[1])).toBeGreaterThan(Number(big[2]));
      }
    }
    expect([...seen].sort()).toEqual(['coprimeWith', 'pgcd', 'witness']);
    expect(hidden).toBeGreaterThan(30); // the witness that hides from the rules' planks is asked
    expect(ones).toBeGreaterThan(30); // 1 is offered as a wrong gate: common to every pair, it proves nothing
  });

  it('the coprime pairs of the proof node really end on 1, the others never', () => {
    for (const { w, id } of runs(30, 104729)) {
      if (w.type !== 'pgcd') continue;
      if (id.startsWith('ithbat-awwaliyan')) expect(gcd(w.a, w.b), id).toBe(1);
      if (id.startsWith('shahid-wahid')) expect(gcd(w.a, w.b), id).toBeGreaterThan(1);
    }
  });
});
