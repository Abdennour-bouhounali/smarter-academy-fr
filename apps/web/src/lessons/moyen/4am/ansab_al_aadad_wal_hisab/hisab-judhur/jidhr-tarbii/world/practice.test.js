import { describe, it, expect } from 'vitest';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { SUMMARY } from '../../../../../../common/gameworld/kit/ladder';
import { plain, said } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { ladder, isRight, PRACTICE_NODES, PRACTICE_MAP } from './practice';
import { calculator, compare, read, rootOf, square, write } from './math';
import { KEYS } from './journey';
import { TABLETS } from './tablets';
import { TEXT } from './text';

const runs = (seeds, salt) =>
  ladder.LEVEL_ORDER.flatMap(({ node, level, id }) =>
    Array.from({ length: seeds }, (_, s) =>
      ladder.makeRun(rng((s + 1) * salt + level * 7 + node), node, level),
    ).flatMap((run) => run.map((w) => ({ w, node, level, id }))),
  );
const num = (g) => read(String(g));
/** The largest whole number whose square does not pass a — computed here, by counting. */
const below = (a) => {
  let n = 0;
  while (compare(String((n + 1) * (n + 1)), a) <= 0) n += 1;
  return n;
};
/** The right value of a wave, computed here independently of `isRight` (null for the « which court » waves). */
function truth(w) {
  switch (w.type) {
    case 'side':
    case 'sqrt':
      return rootOf(w.a);
    case 'of':
      return write(square(w.k));
    case 'before':
      return String(below(w.a));
    case 'after':
      return String(below(w.a) + 1);
    case 'sqSqrt':
      return write(w.a);
    case 'sqrtSq':
      return write(w.x).replace('-', '');
    default:
      return null;
  }
}
/** Every equality isolated left to right in a sentence (« ⁦7 × 7 = 49⁩ », « ⁦2/3 × 2/3 = 4/9⁩ »): TRUE, computed exactly. */
function isolatedEqualities(text) {
  let n = 0;
  for (const [, body] of String(text).matchAll(/⁦([^⁩]+)⁩/g)) {
    const m = /^(\S+) × (\S+) = (\S+)$/.exec(body);
    if (!m) continue;
    n += 1;
    const [x, y, z] = m.slice(1).map((s) => read(s.replace('−', '-')));
    const p = { n: x.n * y.n, d: x.d * y.d };
    expect(p.n * z.d, body).toBe(z.n * p.d);
  }
  return n;
}
/** The words that NAME a rule: a level's name, a link of the hub must hold none (the hub shows them around the keys). */
const RULE_WORDS = /جذر|√|مضبوط|مقرّب|مقرب|ذهاب|إياب/;

describe('حلبة التدريب — the practice ladder of « الجذر التربيعي لعدد موجب »', () => {
  it('one node per key and a summary node, two levels each from the easiest, each named and placed on the hub', () => {
    expect(PRACTICE_NODES.map((n) => n.id)).toEqual([...KEYS, SUMMARY]);
    for (const node of PRACTICE_NODES) {
      expect(TEXT.levels[node.id], node.id).toHaveLength(node.levels.length);
      expect(PRACTICE_MAP.positions[node.id], node.id).toBeTruthy();
      expect(node.levels.length).toBeGreaterThanOrEqual(2);
      const speeds = node.levels.map((l) => l.speed);
      expect([...speeds].sort((x, y) => x - y)).toEqual(speeds);
    }
    expect(ladder.LEVEL_ORDER).toHaveLength(8);
    for (const [from, to] of PRACTICE_MAP.edges)
      for (const id of [from, to]) expect(PRACTICE_MAP.positions[id]).toBeTruthy();
  });

  it('the hub names no key and no rule before its forge: the root, the level names and the links say places and questions', () => {
    const shown = [
      PRACTICE_MAP.root,
      ...Object.values(TEXT.levels).flat(),
      ...PRACTICE_MAP.edges.map((e) => e[2]).filter(Boolean),
    ];
    for (const line of shown) {
      plain(line);
      for (const t of Object.values(TABLETS)) expect(line, line).not.toContain(t.title);
      expect(line, line).not.toMatch(RULE_WORDS);
    }
  });

  it('the map is laid out: the longest name inside, no label on a node (the geometry of 1366×768)', () => {
    // The map of the hub at 1366×768: about 590 × 408 px. A node (`.di-node`) is a disc of 66 px (±5.6 % wide), from
    // 13 % above its point to 4 % below, over its name (0.86rem bold, nowrap: about 7 px a letter + 16 px of padding)
    // from 4 % to 13 % below. The root is one pill (1.05rem, 1.2rem of padding each side), ±4 % high. A link label
    // (0.72rem: about 6 px a letter, 9 px of padding each side) is ±2.5 % high. Rectangles in % of the map: [x0, x1, y0, y1].
    const P = PRACTICE_MAP.positions;
    const nameOf = (id) => (id === SUMMARY ? TEXT.summary.title : TABLETS[id].title);
    const boxes = (id) => {
      const [x, y] = P[id];
      if (id === 'root') {
        const h = ([...PRACTICE_MAP.root].length * 8.5 + 38) / 5.9 / 2;
        return [[x - h, x + h, y - 4, y + 4]];
      }
      const h = ([...nameOf(id)].length * 7 + 16) / 5.9 / 2;
      return [
        [x - 5.6, x + 5.6, y - 13, y + 4],
        [x - h, x + h, y + 4, y + 13],
      ];
    };
    const meet = (p, q) => p[0] < q[1] && q[0] < p[1] && p[2] < q[3] && q[2] < p[3];
    const ids = Object.keys(P);
    for (const id of ids)
      for (const [x0, x1, y0, y1] of boxes(id)) {
        expect(x0, `${id} cut on the left`).toBeGreaterThanOrEqual(2);
        expect(x1, `${id} cut on the right`).toBeLessThanOrEqual(98);
        expect(y0, `${id} cut at the top`).toBeGreaterThanOrEqual(1);
        expect(y1, `${id} cut at the bottom`).toBeLessThanOrEqual(99);
      }
    for (const a of ids)
      for (const b of ids)
        if (a < b) for (const p of boxes(a)) for (const q of boxes(b)) expect(meet(p, q), `${a} on ${b}`).toBe(false);
    for (const [a, b, label] of PRACTICE_MAP.edges.filter((e) => e[2])) {
      const [mx, my] = [(P[a][0] + P[b][0]) / 2, (P[a][1] + P[b][1]) / 2];
      const h = ([...label].length * 6 + 18) / 5.9 / 2;
      const box = [mx - h, mx + h, my - 2.5, my + 2.5];
      for (const id of ids) for (const q of boxes(id)) expect(meet(box, q), `« ${label} » on ${id}`).toBe(false);
    }
  });

  it('every wave of every level: exactly one right gate, computed here; three different gates; every field the rail reads', () => {
    const seen = new Set();
    for (const { w, node, id } of runs(30, 131)) {
      seen.add(w.type);
      const tag = `${id} ${JSON.stringify(w)}`;
      expect(
        w.gates.filter((n) => isRight(w, n)),
        tag,
      ).toHaveLength(1);
      expect(new Set(w.gates.map((g) => write(num(g)))).size, tag).toBe(3);
      expect(w.good, tag).toBeGreaterThanOrEqual(0);
      const right = w.gates[w.good];
      const t = truth(w);
      if (t != null) expect(write(num(right)), tag).toBe(t);
      if (w.type === 'noRide') expect(rootOf(num(right)), tag).toBe(null);
      if (w.type === 'ride') expect(rootOf(num(right)), tag).not.toBe(null);
      if (w.type === 'display') expect(calculator(String(right)), tag).toBe(w.shows);
      // the key of a node's waves is the node's — the summary mixes them
      expect(w.key === PRACTICE_NODES[node].id || PRACTICE_NODES[node].id === SUMMARY, tag).toBe(true);
      // what the rail reads: a plain order, a formula with no Arabic, gates as numbers or short strings
      plain(w.say);
      if (w.tex) {
        said(w.tex);
        expect(w.tex, tag).not.toMatch(/[؀-ۿ]|\$/);
      }
      for (const g of w.gates) {
        expect(typeof g === 'number' || (typeof g === 'string' && g.length <= 6), tag).toBe(true);
        if (typeof g === 'number') expect(Number.isInteger(g) && g >= 0, tag).toBe(true);
      }
      // mental arithmetic: the squares of the tables, the courts of a bracket below 100
      for (const g of w.gates)
        expect(Math.abs(Number(read(String(g).replace('−', '-')).n)), tag).toBeLessThanOrEqual(2000);
      if (['before', 'after', 'noRide', 'display'].includes(w.type))
        expect(Number(w.a ?? right), tag).toBeLessThanOrEqual(99);
    }
    expect([...seen].sort()).toEqual(
      ['side', 'sqrt', 'of', 'before', 'after', 'noRide', 'ride', 'display', 'sqSqrt', 'sqrtSq'].sort(),
    );
  });

  it('a FACT for every gate (never « wrong »), plain, and every equality it isolates is true', () => {
    let checked = 0;
    for (const { w } of runs(20, 977)) {
      const right = w.gates[w.good];
      const lines = [w.why.right, ...w.gates.filter((g) => g !== right).map((g) => w.why.wrong[g])];
      expect(Object.keys(w.why.wrong).sort()).toEqual(
        w.gates
          .filter((g) => g !== right)
          .map(String)
          .sort(),
      );
      for (const line of lines) {
        expect(line, JSON.stringify(w)).toBeTruthy();
        plain(line);
        expect(line).not.toMatch(/خطأ|خاطئ|غلط/);
        checked += isolatedEqualities(line);
      }
      plain(w.say);
      expect(w.say).not.toMatch(/خطأ|خاطئ|غلط/);
    }
    expect(checked).toBeGreaterThan(500);
  });

  it('a level that opens with a key asks only what that key and the ones before it give', () => {
    const allowed = {
      [KEYS[0]]: ['side', 'sqrt', 'of'],
      [KEYS[1]]: ['before', 'after', 'noRide', 'ride', 'display'],
      [KEYS[2]]: ['sqSqrt', 'sqrtSq'],
    };
    for (const node of PRACTICE_NODES.filter((n) => n.id !== SUMMARY))
      for (const level of node.levels)
        for (const [kind] of level.mix) expect(allowed[node.id], node.id).toContain(kind);
    // a walk to the left, decimals and fractions come at the second level of 🔁 only
    const k3 = PRACTICE_NODES[2].levels[0].mix.map(([, p]) => p);
    expect(k3.every((p) => !p.neg && !p.dec)).toBe(true);
  });

  it('the facts speak the world: a rod that leaves a band, a rod that jams, a walk to the left', () => {
    const w = ladder.waveOf(rng(5), 'before', { min: 58, max: 58 });
    expect(w.a).toBe('58');
    expect(w.gates[w.good]).toBe(7);
    expect(w.why.right).toBe(
      'منصّة المقياس 7 تترك شريطًا في الساحة 58، ومنصّة المقياس 8 تعلق: ⁦7 × 7 = 49⁩ و ⁦8 × 8 = 64⁩.',
    );
    // a decimal root: each other gate is a slip a student makes — the comma moved, a neighbour tenth, the half
    for (let seed = 1; seed <= 40; seed += 1) {
      const d = ladder.waveOf(rng(seed), 'sqrt', { dec: true });
      const r = rootOf(d.a);
      const slips = [write(`${read(r).n}/${read(r).d * 10n}`), write(`${read(d.a).n}/${read(d.a).d * 2n}`)];
      for (const g of d.gates.filter((x) => x !== d.gates[d.good])) {
        const [x, y] = [read(String(g)), read(r)];
        const tenthsApart = write(`${(x.n * y.d - y.n * x.d) * 10n}/${x.d * y.d}`);
        expect(slips.includes(String(g)) || ['1', '-1'].includes(tenthsApart), `${d.a}: ${g}`).toBe(true);
      }
    }
    const neg = ladder.waveOf(rng(9), 'sqrtSq', { neg: true });
    const k = neg.gates[neg.good];
    expect(neg.why.right).toContain('إلى اليسار');
    expect(neg.gates.some((g) => g === `−${k}`) || neg.gates.some((g) => g === k * k)).toBe(true);
    if (neg.gates.includes(`−${k}`)) expect(neg.why.wrong[`−${k}`]).toContain('لا إشارة له');
  });
});
