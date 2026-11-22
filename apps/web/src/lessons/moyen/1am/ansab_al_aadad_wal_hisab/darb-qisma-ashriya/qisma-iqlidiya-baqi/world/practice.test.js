import { describe, it, expect } from 'vitest';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { explain, waveSay } from '../../../../../../common/gameworld/divisorIsles/strings';
import { ladder, isRight, PRACTICE_NODES, PRACTICE_MAP } from './practice';
import { KEYS } from './journey';
import { TEXT } from './text';

/** Every wave of every level, over many seeds. */
function* allWaves(seeds = 40) {
  for (const { node, level, id } of ladder.LEVEL_ORDER)
    for (let seed = 1; seed <= seeds; seed += 1)
      for (const w of ladder.makeRun(rng(seed * 7919 + level * 13 + node), node, level)) yield { w, id, node };
}
/** The types whose sentence and guidance THIS lesson writes (the world's own: `remainder`). */
const LESSON_OWN = [
  'quotient',
  'possibleRest',
  'maxRest',
  'fixDivision',
  'dividend',
  'missingRest',
  'missingQuotient',
  'tensOf',
  'quotientBig',
  'cabinsNeeded',
  'cabinsFull',
  'leftOut',
];
const BIG = ['tensOf', 'quotientBig'];
/** The three questions of the cable-car station: ONE division, three numbers. */
const STATION = {
  cabinsNeeded: (w) => Math.ceil(w.a / w.b),
  cabinsFull: (w) => Math.floor(w.a / w.b),
  leftOut: (w) => w.a % w.b,
};

describe('حلبة التدريب — the practice ladder of « القسمة الإقليدية »', () => {
  it('has one node per key and a summary node, each level named and placed on the hub', () => {
    expect(PRACTICE_NODES.map((n) => n.id)).toEqual([...KEYS, 'exam']);
    for (const node of PRACTICE_NODES) {
      expect(TEXT.levels[node.id], node.id).toHaveLength(node.levels.length);
      expect(PRACTICE_MAP.positions[node.id], node.id).toBeTruthy();
    }
    expect(ladder.LEVEL_ORDER).toHaveLength(12);
    // the hub: every link joins two placed nodes, and no two nodes sit on each other (percent of the map box)
    const placed = Object.keys(PRACTICE_MAP.positions);
    expect(placed.sort()).toEqual(['root', ...PRACTICE_NODES.map((n) => n.id)].sort());
    for (const [from, to] of PRACTICE_MAP.edges)
      expect(placed, `${from} → ${to}`).toEqual(expect.arrayContaining([from, to]));
    for (const a of placed)
      for (const b of placed) {
        if (a >= b) continue;
        const [ax, ay] = PRACTICE_MAP.positions[a];
        const [bx, by] = PRACTICE_MAP.positions[b];
        expect(Math.abs(ax - bx) >= 25 || Math.abs(ay - by) >= 35, `${a} / ${b}`).toBe(true);
      }
  });

  it('the station asks ONE division three questions — full, needed, left out — with and without a leftover', () => {
    const seen = new Set();
    for (const { w, id } of allWaves()) {
      if (!STATION[w.type]) continue;
      const tag = `${id} ${JSON.stringify(w)}`;
      expect(w.gates[w.good], tag).toBe(STATION[w.type](w));
      expect(w.key, tag).toBe('baqi-fi-masala');
      seen.add(`${w.type}:${w.r === 0 ? 'exact' : 'left'}`);
      // the classic slips are among the wrong gates' guidance: the quotient for the cabins needed, one more for the full
      if (w.type === 'cabinsNeeded') expect(Object.keys(w.why.wrong).map(Number), tag).toContain(w.gates[w.good] - 1);
      expect(w.say, tag).toMatch(/مسافر|مسافران/);
      // a count never glued to a word that does not agree
      for (const line of [w.say, w.why.right, ...Object.values(w.why.wrong)]) {
        expect(line, line).not.toMatch(/(^|[^\d])[12] (عربات|عربة|مسافرين|مسافرًا)/);
        expect(line, line).not.toMatch(/(^|[^\d])(1[1-9]|[2-9]\d) (عربات|مسافرين)/);
        expect(line, line).not.toMatch(/(^|[^\d])([3-9]|10) مسافرًا/);
        expect(line, line).not.toMatch(/قارب|قوارب/);
      }
    }
    expect([...seen].sort()).toEqual([
      'cabinsFull:exact',
      'cabinsFull:left',
      'cabinsNeeded:exact',
      'cabinsNeeded:left',
      'leftOut:left',
    ]);
  });

  it('every wave has exactly ONE right gate, three different gates, a sentence and a guidance', () => {
    const seen = new Set();
    for (const { w, id, node } of allWaves()) {
      seen.add(w.type);
      const tag = `${id} ${JSON.stringify(w)}`;
      expect(
        w.gates.filter((n) => isRight(w, n)),
        tag,
      ).toHaveLength(1);
      expect(new Set(w.gates).size, tag).toBe(3);
      expect(Math.min(...w.gates), tag).toBeGreaterThanOrEqual(0);
      expect(waveSay(w), tag).toBeTruthy();
      for (const n of w.gates.filter((x) => !isRight(w, x))) {
        const g = explain(w, n);
        expect(g.wrong && g.right, `${tag} ${n}`).toBeTruthy();
        expect(`${waveSay(w)} ${g.wrong} ${g.right}`).not.toMatch(/undefined|NaN/);
      }
      expect(w.key === PRACTICE_NODES[node].id || PRACTICE_NODES[node].id === 'exam', tag).toBe(true);
      expect(KEYS).toContain(w.key);
    }
    expect([...seen].sort()).toEqual([...LESSON_OWN, 'remainder'].sort());
  });

  it('the divisions are true: a = b × q + r with r < b; mental arithmetic inside the tables, except the estimates', () => {
    for (const { w, id } of allWaves()) {
      const tag = `${id} ${JSON.stringify(w)}`;
      if (w.q != null) {
        expect(w.b * w.q + w.r, tag).toBe(w.a);
        expect(w.r < w.b && w.r >= 0, tag).toBe(true);
      }
      if (w.a != null) {
        if (BIG.includes(w.type)) {
          // a of three digits by b of two digits: the tens of the quotient decide
          expect(w.a, tag).toBeLessThanOrEqual(999);
          expect(w.b, tag).toBeGreaterThanOrEqual(10);
        } else expect(w.a, tag).toBeLessThanOrEqual(100);
      }
      if (w.type === 'tensOf') {
        const t = w.gates[w.good];
        expect(w.b * 10 * t <= w.a && w.a < w.b * 10 * (t + 1), tag).toBe(true);
      }
      if (w.type === 'quotientBig') {
        // the wrong gates are ten away: the estimate of the tens tells them apart
        expect(
          w.gates.map((n) => Math.abs(n - w.q)).sort((x, y) => x - y),
          tag,
        ).toEqual([0, 10, 10]);
      }
      if (w.type === 'possibleRest')
        expect(
          w.gates.filter((n) => n < w.b),
          tag,
        ).toHaveLength(1);
      if (w.type === 'fixDivision') expect(waveSay(w), tag).toContain(`${w.b} \\times ${w.q - 1} + ${w.r + w.b}`);
    }
  });

  it('a wave the lesson writes carries its own sentence and a guidance line for every wrong gate', () => {
    for (const { w, id } of allWaves(20)) {
      if (!LESSON_OWN.includes(w.type)) continue;
      const tag = `${id} ${JSON.stringify(w)}`;
      expect(waveSay(w), tag).toBe(w.say);
      for (const n of w.gates.filter((x) => !isRight(w, x))) expect(w.why.wrong[n], `${tag} ${n}`).toBeTruthy();
      expect(w.why.right, tag).toBeTruthy();
    }
  });
});
