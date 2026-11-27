/**
 * The experiment `pair` played without a browser on the numbers of `triangles-semblables` K1
 * (UNIT_3E_THALES_DESIGN.md, Lesson 1, « K1 `cotes-proportionnels` »): the template 2 ; 3 ; 3,8 and the rounds SIM,
 * RED, ONE, DIFF (the world lays the first link) and TURN (a mason's links by the names). The spec is an EXAMPLE of
 * the shape a lesson's `inquiries.js` writes.
 */
import { describe, expect, it } from 'vitest';
import {
  initPair,
  pairReducer,
  pairResult,
  sameShape,
  ranks,
  isTriangle,
  openLinks,
  quotients,
  marks,
  allEqual,
  expectedMeasured,
  layFactor,
  layImage,
  cornersFrom,
  sideNames,
} from './pair';
import { PAIR_TEXT } from './pairText';
import { write, times } from '../kit/exact';

const PAIR_SPEC = {
  kind: 'pair',
  template: { names: 'ABC', sides: ['2', '3', '3,8'] },
  rounds: [
    { stone: { names: 'DEF', sides: ['4,5', '5,7', '3'], turn: 120 }, link: 'world-first' },
    { stone: { names: 'GHI', sides: ['1,5', '1', '1,9'], turn: 30, flip: true }, link: 'world-first' },
    { stone: { names: 'JKL', sides: ['3', '4,5', '5,1'], turn: 200 }, link: 'world-first' },
    { stone: { names: 'MNP', sides: ['3', '4', '4,8'], turn: 80 }, link: 'world-first' },
    { stone: { names: 'RST', sides: ['4,5', '5,7', '3'], turn: 250 }, link: 'given' },
  ],
};
const R = PAIR_SPEC.rounds;
const T = PAIR_SPEC.template.sides;
const run = (s, actions) => actions.reduce((acc, a) => pairReducer(PAIR_SPEC, acc, a), s);
const link = (t, s) => [
  { type: 'pick', side: 't', i: t },
  { type: 'pick', side: 's', i: s },
];
/** Links every template side to the stone side of the same rank (what « by size » does), the locked one apart. */
const bySize = (r, locked) => {
  const rt = ranks(T);
  const rs = ranks(r.stone.sides);
  return rt.flatMap((t, n) => (t === locked ? [] : link(t, rs[n])));
};

describe('pair — the world’s verdict is exact and independent of his links', () => {
  it('SIM, RED and TURN have the shape; ONE and DIFF do not', () => {
    expect(R.map((r) => sameShape(T, r.stone.sides))).toEqual([true, true, false, false, true]);
    expect(R.map((r) => layFactor(T, r.stone.sides))).toEqual(['2/3', '2', '2/3', '2/3', '2/3']);
  });
  it('every enlargement or reduction of the template, its sides in any order, has the shape; one side changed has not', () => {
    const perms = [
      [0, 1, 2],
      [0, 2, 1],
      [1, 0, 2],
      [1, 2, 0],
      [2, 0, 1],
      [2, 1, 0],
    ];
    for (const k of ['1/2', '3/2', '4', '4/3', '11,25', '1', '7/9', '0,1']) {
      const scaled = T.map((x) => write(times(x, k)));
      for (const p of perms) {
        const sides = p.map((i) => scaled[i]);
        expect(sameShape(T, sides)).toBe(true);
        for (let j = 0; j < 3; j += 1) {
          const off = sides.map((x, n) => (n === j ? write(times(x, '1,01')) : x));
          expect(sameShape(T, off)).toBe(false);
        }
      }
    }
    // the same differences (every side + 1) and two quotients out of three are not the shape
    expect(sameShape(T, ['3', '4', '4,8'])).toBe(false);
    expect(sameShape(T, ['5,1', '3', '4,5'])).toBe(false);
  });
  it('ranks are exact; a tie keeps the order of the names; triangles are checked exactly', () => {
    expect(ranks(['4,5', '5,7', '3'])).toEqual([2, 0, 1]);
    expect(ranks(['2', '2', '1'])).toEqual([2, 0, 1]);
    expect(isTriangle(['1', '2', '3'])).toBe(false); // flat
    expect(isTriangle(['1', '2', '2,9'])).toBe(true);
    expect(isTriangle(['0', '1', '1'])).toBe(false);
    expect(sideNames('ABC')).toEqual(['AB', 'BC', 'AC']);
  });
  it('a broken spec is refused', () => {
    expect(() => initPair({ ...PAIR_SPEC, rounds: [] })).toThrow();
    expect(() => initPair({ ...PAIR_SPEC, template: { names: 'AB', sides: T } })).toThrow();
    expect(() =>
      initPair({ ...PAIR_SPEC, rounds: [{ ...R[0], stone: { names: 'DEF', sides: ['1', '2', '3'] } }] }),
    ).toThrow();
    expect(() => initPair({ ...PAIR_SPEC, rounds: [{ ...R[0], link: 'shortest' }] })).toThrow();
    expect(() => initPair({ ...PAIR_SPEC, rounds: [{ ...R[4], given: [0, 0, 1] }] })).toThrow();
  });
});

describe('pair — the links and what the world writes of them (lengths only, no quotient evaluated)', () => {
  it('world-first: the first link joins the two shortest sides and is locked', () => {
    expect(R.slice(0, 4).map((r) => openLinks(PAIR_SPEC, r))).toEqual([
      { links: [2, null, null], locked: 0 },
      { links: [1, null, null], locked: 0 },
      { links: [0, null, null], locked: 0 },
      { links: [0, null, null], locked: 0 },
    ]);
    expect(openLinks(PAIR_SPEC, R[4])).toEqual({ links: [0, 1, 2], locked: null });
  });
  it('« attendu » are the screen’s lengths: 4,5 ; 5,7 (SIM, ONE, DIFF) and 1,5 ; 1,9 (RED); « mesuré » his linked sides', () => {
    const by = (i) => {
      const { links, locked } = openLinks(PAIR_SPEC, R[i]);
      let s = { ...initPair(PAIR_SPEC), i, stage: 'link', links, locked };
      s = run(s, bySize(R[i], locked));
      return expectedMeasured(PAIR_SPEC, R[i], s.links, locked);
    };
    expect(by(0)).toEqual({ expected: ['4,5', '5,7'], measured: ['4,5', '5,7'] });
    expect(by(1)).toEqual({ expected: ['1,5', '1,9'], measured: ['1,5', '1,9'] });
    expect(by(2)).toEqual({ expected: ['4,5', '5,7'], measured: ['4,5', '5,1'] });
    expect(by(3)).toEqual({ expected: ['4,5', '5,7'], measured: ['4', '4,8'] });
    // never in a `given` round, never before the three links
    expect(expectedMeasured(PAIR_SPEC, R[4], [0, 1, 2], null)).toBeNull();
    expect(expectedMeasured(PAIR_SPEC, R[0], [2, null, null], 0)).toBeNull();
  });
  it('TURN by the names: 4,5 ÷ 2 ≠ 5,7 ÷ 3 ≠ 3 ÷ 3,8; by size: = =', () => {
    const qs = quotients(PAIR_SPEC, R[4], [0, 1, 2]);
    expect(qs.map((q) => [q.s, q.t])).toEqual([
      ['4,5', '2'],
      ['5,7', '3'],
      ['3', '3,8'],
    ]);
    expect(marks(qs)).toEqual(['ne', 'ne']);
    expect(allEqual(qs)).toBe(false);
    expect(marks(quotients(PAIR_SPEC, R[4], [2, 0, 1]))).toEqual(['eq', 'eq']);
    expect(marks(quotients(PAIR_SPEC, R[2], [0, 1, 2]))).toEqual(['eq', 'ne']);
    expect(marks(quotients(PAIR_SPEC, R[0], [2, null, 1]))).toEqual([null, null]);
  });
});

describe('pair — the state machine, played with wrong moves', () => {
  it('nothing links before the prediction; a wrong prediction value is refused', () => {
    let s = initPair(PAIR_SPEC);
    expect(s.stage).toBe('predict');
    expect(run(s, link(1, 0))).toBe(s);
    expect(run(s, [{ type: 'say', v: 'maybe' }])).toBe(s);
    expect(run(s, [{ type: 'lay' }, { type: 'next' }])).toBe(s);
    s = run(s, [{ type: 'say', v: 'shape' }]);
    expect(s).toMatchObject({ stage: 'link', said: 'shape', links: [2, null, null], locked: 0 });
  });
  it('the locked link cannot be touched; a pick toggles; a new link takes its stone side from another', () => {
    let s = run(initPair(PAIR_SPEC), [{ type: 'say', v: 'not' }]);
    expect(run(s, [{ type: 'pick', side: 't', i: 0 }])).toBe(s);
    expect(run(s, [{ type: 'pick', side: 's', i: 2 }])).toBe(s);
    s = run(s, [{ type: 'pick', side: 't', i: 1 }]);
    expect(s.pick).toEqual({ t: 1, s: null });
    expect(run(s, [{ type: 'pick', side: 't', i: 1 }]).pick).toBeNull();
    s = run(s, [{ type: 'pick', side: 's', i: 1 }]); // [BC] ↔ 5,7 — a wrong link
    expect(s.links).toEqual([2, 1, null]);
    expect(run(s, [{ type: 'lay' }])).toBe(s); // not complete
    s = run(s, link(2, 1)); // 5,7 moves to [AC]
    expect(s.links).toEqual([2, null, 1]);
    s = run(s, link(1, 0));
    expect(s.links).toEqual([2, 0, 1]);
    expect(s.sets).toEqual([{ links: [2, 0, 1], equal: true }]);
  });
  it('the whole experiment: five rounds, his predictions right and wrong, the TURN story kept in the result', () => {
    let s = initPair(PAIR_SPEC);
    // SIM: says the shape, links by size
    s = run(s, [{ type: 'say', v: 'shape' }, ...bySize(R[0], 0), { type: 'lay' }]);
    expect(s.stage).toBe('laid');
    expect(s.laid).toEqual({ shape: true, k: '2/3' });
    expect(run(s, [{ type: 'lay' }])).toBe(s);
    s = run(s, [{ type: 'next' }]);
    expect(s).toMatchObject({ i: 1, stage: 'predict', links: [null, null, null], sets: [], laid: null });
    // RED: says « not » — the world lays it: the shape (a reduction)
    s = run(s, [{ type: 'say', v: 'not' }, ...bySize(R[1], 0), { type: 'lay' }, { type: 'next' }]);
    // ONE: says the shape, links by size: = ≠ — the world: not
    s = run(s, [{ type: 'say', v: 'shape' }, ...bySize(R[2], 0), { type: 'lay' }, { type: 'next' }]);
    // DIFF: says not
    s = run(s, [{ type: 'say', v: 'not' }, ...bySize(R[3], 0), { type: 'lay' }, { type: 'next' }]);
    // TURN: lays with the mason's links (≠ ≠), the world: the shape; then relinks by size after the verdict
    s = run(s, [{ type: 'say', v: 'not' }]);
    expect(s.links).toEqual([0, 1, 2]);
    s = run(s, [{ type: 'lay' }]);
    s = run(s, [...link(0, 2), ...link(2, 1), ...link(1, 0)]);
    expect(s.links).toEqual([2, 0, 1]);
    s = run(s, [{ type: 'next' }]);
    expect(s.done).toBe(true);
    expect(run(s, [{ type: 'say', v: 'shape' }])).toBe(s);
    const { rows } = pairResult(s);
    expect(rows.map((r) => [r.said, r.shape, r.right, r.equal])).toEqual([
      ['shape', true, true, true],
      ['not', true, false, true],
      ['shape', false, false, false],
      ['not', false, true, false],
      ['not', true, false, false],
    ]);
    expect(rows[2]).toMatchObject({ link: 'world-first', expected: ['4,5', '5,7'], measured: ['4,5', '5,1'] });
    expect(rows[4]).toMatchObject({
      link: 'given',
      asOpened: true,
      links: [0, 1, 2],
      final: [2, 0, 1],
      finalEqual: true,
      expected: null,
      sets: [
        { links: [0, 1, 2], equal: false },
        { links: [2, 0, 1], equal: true },
      ],
    });
  });
});

describe('pair — the laid stone (drawing only)', () => {
  const near = (P, Q) => P.every((p) => Q.some((q) => Math.hypot(p[0] - q[0], p[1] - q[1]) < 1e-9));
  it('a stone of the shape covers the template corner for corner; one without it does not', () => {
    const C = cornersFrom(T);
    for (const i of [0, 1, 4]) expect(near(layImage(T, R[i].stone.sides), C)).toBe(true);
    for (const i of [2, 3]) expect(near(layImage(T, R[i].stone.sides), C)).toBe(false);
  });
  it('the corners are at the lengths of the sides', () => {
    const P = cornersFrom(['4,5', '5,7', '3']);
    const d = (a, b) => Math.hypot(P[a][0] - P[b][0], P[a][1] - P[b][1]);
    expect([d(0, 1), d(1, 2), d(2, 0)].map((x) => +x.toFixed(9))).toEqual([4.5, 5.7, 3]);
  });
});

describe('pair — its words (pairText.js)', () => {
  const all = [];
  const walk = (v) => {
    if (typeof v === 'string') all.push(v);
    else if (typeof v === 'function') {
      const samples = [
        ['ABC', 'DEF'],
        [
          ['4,5', '5,7'],
          ['4,5', '5,1'],
        ],
        [{ scale: 'down', turned: true, flipped: true }],
        [{ scale: 'same', turned: false, flipped: false }],
      ];
      for (const args of samples) {
        try {
          all.push(v(...args));
        } catch {
          // a sample of another function's shape
        }
      }
    } else if (v && typeof v === 'object') Object.values(v).forEach(walk);
  };
  walk(PAIR_TEXT);
  it('French typography: no plain space before « : ; ! ? », a narrow one before « ; ! ? »', () => {
    for (const t of all.filter((x) => typeof x === 'string')) {
      expect(t).not.toMatch(/ [:;!?]/);
      expect(t).not.toMatch(/[^ ][;!?]/);
      expect(t).not.toMatch(/[^ ]:/);
      expect(t).not.toMatch(/'/);
    }
  });
  it('no sentence names the rule or how the first link was chosen', () => {
    const words = all.join(' ').toLowerCase();
    for (const w of [
      'plus petit',
      'plus grand',
      'plus court',
      'plus long',
      'proportion',
      'semblable',
      'homologue',
      'quotient',
      'rang',
    ])
      expect(words).not.toContain(w);
  });
  it('the world tells how it moved the stone', () => {
    expect(PAIR_TEXT.laidHow({ scale: 'down', turned: true, flipped: true })).toBe(
      'Le tracé est réduit, tourné et retourné, puis posé sur le gabarit.',
    );
    expect(PAIR_TEXT.laidHow({ scale: 'up', turned: false, flipped: false })).toBe(
      'Le tracé est agrandi, puis posé sur le gabarit.',
    );
  });
});
