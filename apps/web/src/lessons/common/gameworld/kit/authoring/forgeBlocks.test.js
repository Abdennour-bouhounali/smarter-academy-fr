import { describe, it, expect } from 'vitest';
import { complete, runOn } from '../forge';
import { rng } from '../random';
import {
  attacksOf,
  byId,
  differenceBox,
  divisionRow,
  fills,
  firstBreak,
  firstWrong,
  fromLog,
  fromRounds,
  gather,
  givenDivision,
  hard,
  judge,
  lazy,
  line,
  noPredictions,
  options,
  pairCase,
  pairKey,
  pairPool,
  pairsOutside,
  pgcdBox,
  pgcdPairBox,
  plankCase,
  subtractionRow,
  makerOf,
} from './forgeBlocks';
import { euclid } from './numbers';
import { allRules } from './test/suites.js';

/**
 * A small forge assembled from the blocks alone — « a plank builds the longer and the shorter gap together when it
 * builds [which gaps] » — the shape of every forge met on a convoy.
 */
const LOOK = [
  { id: 'pair', label: 'الأقصر وهوّة الفرق', of: (c) => [c.B, c.A - c.B] },
  { id: 'diff', label: 'هوّة الفرق وحدها', of: (c) => [c.A - c.B] },
  { id: 'short', label: 'الأقصر وحدها', of: (c) => [c.B] },
];
const HOW = [
  { id: 'all', label: 'كلّ هوّة من', test: (gaps, built) => gaps.every(built) },
  { id: 'one', label: 'هوّة واحدة على الأقلّ من', test: (gaps, built) => gaps.some(built) },
];
const J = judge({
  slots: [
    { id: 'how', label: 'كم هوّة؟', options: HOW },
    { id: 'look', label: 'أيّ هوّات؟', options: LOOK },
  ],
  right: { how: 'all', look: 'pair' },
  says: (rule, c, tile) => tile.how[rule.how].test(tile.look[rule.look].of(c), (n) => fills(n, c.d)),
});
const caseOf = (A, B, d) => pairCase('farq', A, B, d);
const idOf = (c) => `${c.A}:${c.B}:${c.d}`;
const POOL = pairPool({
  A: [12, 40],
  B: (a) => [4, a - 1],
  d: (a) => [2, a],
  make: caseOf,
  exclude: new Set(['24;36']),
});
const forge = {
  key: 'toy',
  ...J,
  caseId: idOf,
  evidence: fromLog({ of: 'farq', gaps: [152, 95, 57], make: caseOf, lived: [19], caseId: idOf }),
  predictCases: noPredictions,
  attacks: attacksOf({ ...J, caseId: idOf, pool: POOL, hard: [caseOf(66, 24, 14), caseOf(66, 24, 6)] }),
};

describe('authoring/forgeBlocks.js — the tiles and the judge', () => {
  it('the screen gets ids and labels; the rule is the product of the slots; exactly one is the rule', () => {
    expect(J.slots[1].options).toEqual(options(LOOK));
    expect(Object.keys(J.slots[1].options[0])).toEqual(['id', 'label']);
    expect(byId(LOOK).diff.label).toBe('هوّة الفرق وحدها');
    const rules = allRules(forge);
    expect(rules).toHaveLength(6);
    expect(rules.filter(forge.isTheRule)).toEqual([{ how: 'all', look: 'pair' }]);
    for (const r of rules) expect(complete(forge, r)).toBe(true);
    expect(forge.isTheRule(null)).toBe(false);
  });

  it('says what the tiles mean, on a case', () => {
    const c = caseOf(152, 95, 19);
    expect(forge.says({ how: 'all', look: 'pair' }, c)).toBe(true);
    expect(forge.says({ how: 'all', look: 'pair' }, caseOf(152, 95, 8))).toBe(false);
    expect(forge.says({ how: 'one', look: 'pair' }, caseOf(152, 95, 5))).toBe(true); // 5 fills 95
  });
});

describe('authoring/forgeBlocks.js — the evidence', () => {
  it('his lines first, one per plank, then what the story guarantees, then the mirror’s', () => {
    const log = [
      { a: 152, b: 8 },
      { a: 95, b: 8 },
      { a: 7, b: 7 }, // a bridge of another convoy: not his here
      { a: 152, b: 5 },
    ];
    expect(forge.evidence(log).map((c) => c.d)).toEqual([8, 5, 19]);
    expect(forge.evidence([...log, { a: 152, b: 19 }]).map((c) => c.d)).toEqual([8, 5, 19]);
    const rows = forge.evidence(log);
    const mirror = { ...caseOf(66, 24, 6), mirror: true };
    expect(forge.evidence([...rows, mirror]).at(-1)).toEqual(mirror);
    expect(forge.evidence(rows)).toEqual(rows);
    expect(forge.predictCases(rows)).toEqual([]);
  });

  it('gather by hand, and the rows an experiment hands back', () => {
    const ev = gather({
      own: (r) => r.of === 'x',
      fromRow: () => [],
      lived: [{ of: 'x', id: 1 }],
      caseId: (c) => c.id,
    });
    expect(ev([{ of: 'x', id: 2 }])).toEqual([
      { of: 'x', id: 2 },
      { of: 'x', id: 1 },
    ]);
    const rows = fromRounds((r) => euclid(r.a, r.b).map((s) => caseOf(s.a, s.b, 74)));
    expect(rows({ rounds: [{ a: 962, b: 296 }] }).rows.map((c) => [c.A, c.B])).toEqual([
      [962, 296],
      [296, 74],
    ]);
  });
});

describe('authoring/forgeBlocks.js — the attacks', () => {
  it('a wrong rule meets the first new case where it breaks — a « yes » it says that the world refuses first', () => {
    const rows = forge.evidence([]);
    for (const rule of allRules(forge).filter((r) => !forge.isTheRule(r))) {
      const run = runOn(forge, rule, rows);
      if (run.bad >= 0) continue;
      const [c] = forge.attacks(rule, rows);
      expect(forge.says(rule, c)).not.toBe(c.held);
      const free = POOL().filter((x) => forge.says(rule, x) !== x.held);
      if (free.some((x) => forge.says(rule, x))) expect(forge.says(rule, c)).toBe(true);
    }
    expect(firstBreak([], { how: 'one', look: 'diff' }, [], forge.says, idOf)).toEqual([]);
  });

  it('the right rule meets its hard cases he has not seen; the pool is built once, never with an excluded pair', () => {
    const right = { how: 'all', look: 'pair' };
    expect(forge.attacks(right, []).map(idOf)).toEqual(['66:24:14', '66:24:6']);
    expect(forge.attacks(right, [caseOf(66, 24, 14)]).map(idOf)).toEqual(['66:24:6']);
    expect(hard([caseOf(66, 24, 6)], [caseOf(66, 24, 6)], idOf)).toEqual([]);
    expect(POOL()).toBe(POOL());
    expect(POOL().some((c) => pairKey(c.A, c.B) === '24;36')).toBe(false);
    expect(POOL().every((c) => c.laid <= 40)).toBe(true);
    let made = 0;
    const once = lazy(() => (made += 1));
    once();
    once();
    expect(made).toBe(1);
  });
});

describe('authoring/forgeBlocks.js — the cases', () => {
  it('a plank asked of a pair of gaps; with a purse only the longest common plank is paid', () => {
    expect(caseOf(152, 95, 19)).toMatchObject({ fa: true, fb: true, fits: true, held: true, laid: 8 });
    expect(caseOf(152, 95, 19).pair).toEqual({ a: 152, b: 95, d: 19 });
    expect(plankCase('tarh', 259, 185, 37)).toMatchObject({ held: true, need: 12, purse: 12, tag: '12 لوحًا', g: 37 });
    expect(plankCase('tarh', 259, 185, 1)).toMatchObject({ fits: true, held: false, need: 444, tag: '444 لوحًا' });
    expect(plankCase('tarh', 259, 185, 74)).toMatchObject({ fits: false, need: null, tag: 'لا يملؤهما' });
    expect(plankCase('tarh', 259, 185, 74).pair).toEqual({ a: 259, b: 185, d: 74 });
    expect(fills(0, 27)).toBe(true);
  });
});

describe('authoring/forgeBlocks.js — the last step', () => {
  it('template lines: a box has a name, a label and a width; a given number is a string', () => {
    expect(subtractionRow(2).tokens.map((t) => t.slot ?? t)).toEqual(['x2', '−', 'y2', '=', 'd2']);
    expect(divisionRow(3).tokens.map((t) => t.slot ?? t)).toEqual(['a3', '=', 'b3', '×', 'q3', '+', 'r3']);
    expect(givenDivision(962, 296).tokens.map((t) => t.slot ?? t)).toEqual(['962', '=', '296', '×', 'q', '+', 'r']);
    expect(differenceBox(92, 69).tokens.map((t) => t.slot ?? t)).toEqual(['92 − 69', '=', 'd']);
    expect(pgcdBox(92, 69).tokens.map((t) => t.slot ?? t)).toEqual(['PGCD(92 ; 69)', '=', 'g']);
    expect(pgcdPairBox(92, 69).tokens.map((t) => t.slot ?? t)).toEqual(['PGCD(92 ; 69)', '=', 'PGCD(69 ;', 'p', ')']);
    expect(line(['دفتر الطرح:'], 'rtl')).toEqual({ dir: 'rtl', tokens: ['دفتر الطرح:'] });
    expect(divisionRow(2, { w: 4 }).tokens[0]).toEqual({ slot: 'a2', label: 'المقسوم', w: 4 });
  });

  it('a pool of pairs without the bank’s; a draw replayed by its seed; the first wrong step', () => {
    const bank = new Set(['69;92']);
    const pairs = pairsOutside(
      [
        [92, 69],
        [129, 86],
        [177, 118],
      ],
      bank,
    );
    expect(pairs).toEqual([
      [129, 86],
      [177, 118],
    ]);
    const make = makerOf(pairs, (A, B) => ({ A, B, D: A - B }));
    for (let seed = 1; seed <= 10; seed += 1) expect(make(rng(seed))).toEqual(make(rng(seed)));
    expect(make(() => 0)).toEqual({ A: 129, B: 86, D: 43 });
    expect(
      firstWrong([
        ['diff', true],
        ['pair', false],
        ['pgcd', false],
      ]),
    ).toBe('pair');
    expect(firstWrong([['diff', true]])).toBe('ok');
  });
});
