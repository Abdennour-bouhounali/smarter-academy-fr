import { describe, it, expect } from 'vitest';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { SUMMARY } from '../../../../../../common/gameworld/kit/ladder';
import { plain, said } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { ladder, isRight, noSideFact, PRACTICE_NODES, PRACTICE_MAP } from './practice';
import { above, cut, read, rootOf, rounded, square, write } from './math';
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
/** The right value of a wave, computed here independently of `isRight` (null for the « which court » waves). */
function truth(w) {
  switch (w.type) {
    case 'sqrtDec':
    case 'sqrtFrac':
      return rootOf(w.a);
    case 'calcSquare':
      return write(square(w.x));
    case 'byDefault':
      return cut(w.a, w.k);
    case 'byExcess':
      return above(w.a, w.k);
    case 'round':
      return rounded(w.a, w.k);
    default:
      return null;
  }
}
/** Every product isolated left to right in a sentence (« ⁦2,4 × 2,4 = 5,76⁩ »): TRUE, computed exactly. */
function isolatedEqualities(text) {
  let n = 0;
  for (const [, body] of String(text).matchAll(/⁦([^⁩]+)⁩/g)) {
    const m = /^(\S+) × (\S+) = (\S+)$/.exec(body);
    const e = /^(\S+) = (\d+)\/(\d+)$/.exec(body);
    if (m) {
      const [x, y, z] = m.slice(1).map((s) => read(s));
      expect(x.n * y.n * z.d, body).toBe(z.n * x.d * y.d);
      n += 1;
    } else if (e) {
      expect(write(e[1]), body).toBe(write(`${e[2]}/${e[3]}`));
      n += 1;
    }
  }
  return n;
}
/** The words that NAME a rule: a level's name, a link of the hub must hold none. */
const RULE_WORDS = /ناطق|مدو/;

describe('حلبة التدريب — the practice ladder of « الأعداد الناطقة والأعداد غير الناطقة »', () => {
  it('one node per key and a summary node, two levels each from the easiest, each named and placed on the hub', () => {
    expect(PRACTICE_NODES.map((n) => n.id)).toEqual([...KEYS, SUMMARY]);
    for (const node of PRACTICE_NODES) {
      expect(TEXT.levels[node.id], node.id).toHaveLength(node.levels.length);
      expect(PRACTICE_MAP.positions[node.id], node.id).toBeTruthy();
      const speeds = node.levels.map((l) => l.speed);
      expect([...speeds].sort((x, y) => x - y)).toEqual(speeds);
    }
    expect(ladder.LEVEL_ORDER).toHaveLength(8);
  });

  it('the hub names no key and no rule before its forge', () => {
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

  it('the map is laid out as lesson 1’s: the longest name inside, no label on a node', () => {
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
        expect(x0, id).toBeGreaterThanOrEqual(2);
        expect(x1, id).toBeLessThanOrEqual(98);
        expect(y0, id).toBeGreaterThanOrEqual(1);
        expect(y1, id).toBeLessThanOrEqual(99);
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

  it('every wave of every level: exactly one right gate, computed here; three different short gates', () => {
    const seen = new Set();
    for (const { w, node, id } of runs(30, 131)) {
      seen.add(w.type);
      const tag = `${id} ${JSON.stringify(w)}`;
      expect(
        w.gates.filter((n) => isRight(w, n)),
        tag,
      ).toHaveLength(1);
      expect(new Set(w.gates.map((g) => write(num(g)))).size, tag).toBe(3);
      const right = w.gates[w.good];
      const t = truth(w);
      if (t != null) expect(write(num(right)), tag).toBe(t);
      if (w.type === 'writable') expect(rootOf(num(right)), tag).not.toBe(null);
      if (w.type === 'notWritable') expect(rootOf(num(right)), tag).toBe(null);
      expect(w.key === PRACTICE_NODES[node].id || PRACTICE_NODES[node].id === SUMMARY, tag).toBe(true);
      plain(w.say);
      if (w.tex) {
        said(w.tex);
        expect(w.tex, tag).not.toMatch(/[؀-ۿ]|\$/);
      }
      for (const g of w.gates) {
        expect(typeof g === 'number' || (typeof g === 'string' && g.length <= 6), tag).toBe(true);
        if (typeof g === 'number') expect(Number.isInteger(g) && g >= 0, tag).toBe(true);
      }
    }
    expect([...seen].sort()).toEqual(
      ['sqrtDec', 'sqrtFrac', 'writable', 'notWritable', 'calcSquare', 'byDefault', 'byExcess', 'round'].sort(),
    );
  });

  it('a FACT for every gate (never « wrong »), plain, and every equality it isolates is true', () => {
    let checked = 0;
    for (const { w } of runs(20, 977)) {
      const right = w.gates[w.good];
      const lines = [w.why.right, ...w.gates.filter((g) => g !== right).map((g) => w.why.wrong[g])];
      for (const line of lines) {
        expect(line, JSON.stringify(w)).toBeTruthy();
        // the rail draws a fact through MathText: its only formulas are fractions over a real bar; the rest is plain,
        // and no fraction is written « p/q » as text
        const formulas = [...line.matchAll(/\$([^$]*)\$/g)].map((m) => m[1]);
        for (const f of formulas) expect(f, line).toMatch(/\\dfrac/);
        const rest = line.replace(/\$[^$]*\$/g, '');
        plain(rest);
        expect(rest, line).not.toMatch(/\d\s*\/\s*\d/);
        expect(line).not.toMatch(/خطأ|خاطئ|غلط/);
        checked += isolatedEqualities(line);
      }
    }
    expect(checked).toBeGreaterThan(500);
  });

  it('a level that opens with a key asks only what that key gives', () => {
    const allowed = {
      [KEYS[0]]: ['sqrtDec', 'sqrtFrac', 'writable'],
      [KEYS[1]]: ['notWritable', 'calcSquare'],
      [KEYS[2]]: ['byDefault', 'byExcess', 'round'],
    };
    for (const node of PRACTICE_NODES.filter((n) => n.id !== SUMMARY))
      for (const level of node.levels)
        for (const [kind] of level.mix) expect(allowed[node.id], node.id).toContain(kind);
  });

  it('the facts speak the world: why no number writes a side, and which mark is nearer', () => {
    // its fraction over a real bar (MathText), never « 7/5 » as text
    expect(noSideFact('1,4')).toBe(
      '$1{,}4 = \\dfrac{7}{5}$، و 7 ليس مربّع عدد طبيعي: لا علامة ولا كسر تركب منصّته الساحة 1,4.',
    );
    expect(noSideFact('7/36')).toBe(
      '$\\dfrac{7}{36}$، و 7 ليس مربّع عدد طبيعي: لا علامة ولا كسر تركب منصّته الساحة $\\dfrac{7}{36}$.',
    );
    expect(noSideFact('19')).toContain('بين 4 و 5');
    const w = ladder.waveOf(rng(3), 'round', { k: 1 });
    const m = /العلامة الوسطى (\S+):/.exec(w.why.right)[1];
    expect(m.endsWith('5')).toBe(true);
    expect(w.why.right).toContain(`الأقرب: ${w.gates[w.good]}`);
  });
});

describe('the fractions of the waves are the platform’s own', () => {
  it('no square of FRACTIONS is a radicand of the bank, nor the final mission’s second court', async () => {
    const { readBank } = await import('../../../../../../common/gameworld/kit/authoring/test/bank.js');
    const { FRACTIONS } = await import('./practice');
    const bank = new Set();
    for (const { text } of readBank('natiqa-ghayr-natiqa').sheets)
      for (const [, p, q] of text.matchAll(/sqrt\{\\\\dfrac\{(\d+)\}\{(\d+)\}\}/g)) bank.add(write(`${p}/${q}`));
    expect(bank.size).toBeGreaterThan(10);
    for (const [p, q] of FRACTIONS) {
      const a = write(`${p * p}/${q * q}`);
      expect(bank.has(a), a).toBe(false);
      expect(a).not.toBe('25/36');
      expect(a).toContain('/'); // a fraction stays a fraction on the rail (a decimal square is the other wave's)
    }
  });
});
