// THE FORGES of fraction-irreductible: the shared checks (authoring kit), then what is this lesson's own — the false rules
// its students really hold (the design's, lesson 3), each refuted by HIS sign, HIS stages or a computed case the mirror
// names; the last steps and the claims they make; the numbers the mirror draws; and the mirrors of C and E that open on
// a plank that FAILED (the story's `onMiss`).
import { describe, it, expect } from 'vitest';
import {
  agreementErrors,
  allRules,
  describeForges,
  stringsIn,
  typographyErrors,
} from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { bankPairs, readBank } from '../../../../../../common/gameworld/kit/authoring/test/bank.js';
import { boxesOf, pairKey } from '../../../../../../common/gameworld/kit/authoring/forgeBlocks';
import { verifyClaim } from '../../../../../../common/gameworld/kit/claims';
import { runOn } from '../../../../../../common/gameworld/kit/forge';
import { initMeasure, measureReducer, measureResult } from '../../../../../../common/gameworld/divisorIsles/measure';
import { T as WORLD_TEXT } from '../../../../../../common/gameworld/divisorIsles/strings';
import { KT } from '../../../../../../common/gameworld/kit/text';
import { AVOID, BANK_PAIRS, FORGES } from './forges';
import { PGCD_INQUIRY, STRIKE_INQUIRY } from './inquiries';
import { KEYS } from './journey';
import { NUMBERS, powersOf, reduce } from './math';
import { K, STORY } from './story';

const ID = 'fraction-irreductible';
const { strike: ST, stays: SY, pgcd: PG, result: RS } = NUMBERS;
const RS_MARK = RS.strokes[0] + RS.strokes[1];

/**
 * A `measure` experiment played through its reducer: per round, his moves — a plank (a number: tried then laid), 'end'
 * (his claim), 'again' (direct: back to the fraction given) — the world's checks ticked to their end.
 */
function playMeasure(spec, rounds) {
  let s = initMeasure(spec);
  const go = (a) => {
    s = measureReducer(spec, s, a);
    while (s.stage === 'checkRun') s = measureReducer(spec, s, { type: 'tick' });
  };
  for (const moves of rounds) {
    for (const m of moves)
      if (m === 'end' || m === 'again') go({ type: m });
      else {
        go({ type: 'try', d: m });
        go({ type: 'shown' });
      }
    expect(s.stage, JSON.stringify(moves)).toBe('seen');
    go({ type: 'next' });
  }
  expect(s.done).toBe(true);
  return measureResult(s);
}

/** K1: 3 on his sign at once; on 52/76, 2, a claim the world answers (2 still fills both), 2 again. */
const STRIKE_AT_ONCE = playMeasure(STRIKE_INQUIRY, [
  [3, 'end'],
  [2, 'end', 2, 'end'],
]);
/** K1: a student who tries 2 and 5 first (both leave a piece of 69 or 123), then 3; on 52/76, 2 and 2 straight on. */
const STRIKE_WALKED = playMeasure(STRIKE_INQUIRY, [
  [2, 5, 3, 'end'],
  [3, 2, 2, 'end'],
]);
/** K3: 2 (not enough: 361/893), back, 38; or 38 at once; or 19, 342 (a piece left), then 38. */
const PGCD_WALKED = playMeasure(PGCD_INQUIRY, [[2, 'again', 38]]);
const PGCD_AT_ONCE = playMeasure(PGCD_INQUIRY, [[38]]);
const PGCD_EVERY = playMeasure(PGCD_INQUIRY, [[19, 'again', 342, 2, 'again', 38]]);

/** The bridges he fired: each plank on the whole gap, then on its marked stretch (`Game.js › forge` logs both). */
const fired = (a, mark, planks) =>
  planks.flatMap((b) => [
    { a, b },
    { a: mark, b },
  ]);
const A_LOG = fired(ST.gap, ST.mark, [5, 2, 3]);
const B_LOG = (planks) => fired(SY.gap, SY.mark, planks);
const C_LOG = [
  { a: PG.gap, b: 19 },
  { a: PG.gap, b: PG.plank },
];
const D_LOG = (planks) => fired(RS.gap, RS_MARK, planks);
/** The world's log before each mirror: the bridges of the islands before (none of his planks there is this key's). */
const BEFORE = {
  [K.stays]: A_LOG,
  [K.result]: [...A_LOG, ...B_LOG([2, 3, 5, 13, 1]), ...C_LOG],
};
const AT_ONCE = { [K.stays]: B_LOG([2, 3, 5, 13, 1]), [K.result]: D_LOG([13, 3]) };
const WALKED = { [K.stays]: B_LOG([1, 13, 3, 2, 5]), [K.result]: D_LOG([3, 13]) };
const EVERY = { [K.stays]: B_LOG([5, 1, 2, 13, 3, 1]), [K.result]: D_LOG([2, 6, 13, 3]) };

const decOf = (x, row) =>
  Object.fromEntries(
    powersOf(x).flatMap((f, i) => [
      [`${row}${i + 1}`, f.p],
      [`${row}e${i + 1}`, f.e],
    ]),
  );
const SOLVE = {
  [K.strike]: (c) => ({
    ...decOf(c.raw[0], 'a'),
    ...decOf(c.raw[1], 'b'),
    n1: c.best[0][0],
    d1: c.best[0][1],
    n2: c.best[1][0],
    d2: c.best[1][1],
  }),
  [K.stays]: (c) => ({
    g: c.g,
    ...Object.fromEntries(
      c.items.flatMap(([L, W], i) => {
        const [p, q] = reduce(L, W);
        return [
          [`y${i + 1}`, p === L ? 'oui' : 'non'],
          [`n${i + 1}`, p],
          [`d${i + 1}`, q],
        ];
      }),
    ),
  }),
  [K.pgcd]: (c) => {
    const [r1, r2, r3] = c.rows;
    return {
      q1: r1.q,
      r1: r1.r,
      ...Object.fromEntries(
        [r2, r3].flatMap((r, i) => [
          [`a${i + 2}`, r.a],
          [`b${i + 2}`, r.b],
          [`q${i + 2}`, r.q],
          [`r${i + 2}`, r.r],
        ]),
      ),
      g: c.g,
      n: c.best[0],
      d: c.best[1],
    };
  },
  [K.result]: (c) => ({ strike: 'both', n1: c.best[0][0], d1: c.best[0][1], n2: c.best[1][0], d2: c.best[1][1] }),
};
/** The words of each key's name and of what it states: no sentence of its forge says them before the last step. */
const FORBIDDEN = {
  [K.strike]: /simplifi|irréductible|PGCD/i,
  [K.stays]: /irréductible|premiers entre eux|PGCD/i,
  [K.pgcd]: /par (le|leur) PGCD|diviser par/i,
  [K.result]: /sous forme irréductible|le résultat peut|barrer avant|avant de multiplier/i,
};

const { rowsOf, refutedBy, shownCases } = describeForges({
  forges: FORGES,
  keys: KEYS,
  roads: { AT_ONCE, WALKED, EVERY },
  before: BEFORE,
  inquiry: { [K.strike]: STRIKE_AT_ONCE, [K.pgcd]: PGCD_WALKED },
  solve: SOLVE,
  forbidden: FORBIDDEN,
  bank: ID,
  tiles: { [K.strike]: 8, [K.stays]: 8, [K.pgcd]: 6, [K.result]: 6 },
  // the design's attack of K2 (95/228 = 5/12, 19 hidden) is drawn at scale as two bars (forgeParts.jsx › pairScale)
  draw: { max: 228 },
});

const F = (key) => FORGES[key];
/** The rule of the tiles `rule` (complete), refuted on `rows`: where, and on which case. */
const refute = (key, rule, rows) => {
  const run = runOn(F(key), rule, rows);
  return run.bad >= 0 ? { on: 'evidence', c: run.marks[run.bad] } : { on: 'attack', c: F(key).attacks(rule, rows)[0] };
};
const fromInq = (key, result) => F(key).fromInquiry(result).rows;
const at = (c) => [c.L, c.W, c.p, c.q];

describe('🪜 simplifier-facteurs — what students strike, refuted on HIS sign and HIS stages (design, K1)', () => {
  const rows = fromInq(K.strike, STRIKE_AT_ONCE);
  it('his evidence: the sign 138/246 = 69/123 = 46/82 (neither finished), then every stage of his two rounds', () => {
    expect(rows.map((c) => [...at(c), c.held])).toEqual([
      [138, 246, 69, 123, false],
      [138, 246, 46, 82, false],
      [69, 123, 23, 41, true],
      [52, 76, 26, 38, false],
      [52, 76, 13, 19, true],
    ]);
    expect(fromInq(K.strike, STRIKE_WALKED).map(at)).toEqual(rows.map(at));
  });
  it('« une seule fois » leaves 26/38 of 52/76 — 2 still fills both', () => {
    const { on, c } = refute(K.strike, { which: 'common', times: 'once', where: 'both' }, rows);
    expect(on).toBe('evidence');
    expect(at(c)).toEqual([52, 76, 26, 38]);
    expect(F(K.strike).text.refuted({ ...c, says: true })).toMatch(/la planche de 2 remplit encore 26 et 38/);
  });
  it('« le plus petit facteur commun » writes 69/123 of his sign — 3 still fills both', () => {
    for (const times of ['both', 'once']) {
      const { on, c } = refute(K.strike, { which: 'small', times, where: 'both' }, rows);
      expect(on).toBe('evidence');
      expect(at(c)).toEqual([138, 246, 69, 123]);
      expect(F(K.strike).text.refuted({ ...c, says: true })).toMatch(/la planche de 3 remplit encore 69 et 123/);
    }
  });
  it('« au dénominateur seulement » writes 69/41 — another part, longer than the bridge', () => {
    for (const which of ['common', 'small'])
      for (const times of ['both', 'once']) {
        const rule = { which, times, where: 'den' };
        const { on, c } = refute(K.strike, rule, rows);
        expect(on).toBe('evidence');
        expect(F(K.strike).explain(rule, c)).toMatch(/\\dfrac\{69\}\{41\}|\\dfrac\{138\}\{41\}|\\dfrac\{52\}/);
      }
  });
  it('the right rule writes every finished writing he saw, and none of the others', () => {
    const right = allRules(F(K.strike)).find(F(K.strike).isTheRule);
    for (const c of rows) expect(F(K.strike).says(right, c), at(c).join('/')).toBe(c.held);
  });
});

describe('🔒 irreductible — what students see in two terms, refuted on HIS signs (design, K2)', () => {
  const rows = rowsOf(K.stays, AT_ONCE);
  it('his evidence: 138/246, 69/123, 46/82 and 65/96 — only 65/96 stays', () => {
    expect(rows.map((c) => [c.L, c.W, c.held])).toEqual([
      [138, 246, false],
      [69, 123, false],
      [46, 82, false],
      [65, 96, true],
    ]);
  });
  it('« deux nombres impairs » → 69/123 shrinks; « deux nombres premiers » → 65/96 stays though neither is prime', () => {
    expect(refute(K.stays, { see: 'odd', then: 'stays' }, rows).c).toMatchObject({ L: 69, W: 123 });
    expect(refute(K.stays, { see: 'prime', then: 'stays' }, rows).c).toMatchObject({ L: 65, W: 96 });
    expect(refute(K.stays, { see: 'prime', then: 'shrinks' }, rows).on).toBe('evidence');
  });
  it('« ni 2, ni 3, ni 5 en commun » agrees with all his signs, and falls on 95/228 = 5/12 (19 hidden)', () => {
    const { on, c } = refute(K.stays, { see: 'no235', then: 'stays' }, rows);
    expect(on).toBe('attack');
    expect([c.L, c.W, c.g, c.held]).toEqual([95, 228, 19, false]);
    expect(F(K.stays).says({ see: 'no235', then: 'stays' }, c)).toBe(true);
  });
  it('every inverse rule falls on what he saw', () => {
    for (const see of ['odd', 'prime', 'no235', 'none'])
      expect(refute(K.stays, { see, then: 'shrinks' }, rows).on, see).toBe('evidence');
  });
  it('the last step: PGCD(65 ; 96) found on his own bridge, then three fractions no rule of 2, 3, 5 separates', () => {
    const c = F(K.stays).use.make(() => 0.5);
    expect([c.B, c.A, c.g]).toEqual([...SY.use.pgcd, 1]);
    expect(c.items.map(([L, W]) => reduce(L, W))).toEqual([
      [141, 253],
      [34, 41],
      [12, 17],
    ]);
    for (const [L, W] of c.items) for (const p of [2, 3, 5]) expect(L % p === 0 && W % p === 0).toBe(false);
  });
});

describe('🎯 diviser-par-le-pgcd — by which number, refuted on HIS one-stage tries (design, K3)', () => {
  const walked = fromInq(K.pgcd, PGCD_WALKED);
  const atOnce = fromInq(K.pgcd, PGCD_AT_ONCE);
  const every = fromInq(K.pgcd, PGCD_EVERY);
  it('his evidence: the sign 722/1 786 = 19/47, and each writing one stage gave (361/893, 38/94)', () => {
    expect(walked.map((c) => [...at(c), c.held])).toEqual([
      [722, 1786, 19, 47, true],
      [722, 1786, 361, 893, false],
    ]);
    expect(every.map(at)).toEqual([
      [722, 1786, 19, 47],
      [722, 1786, 38, 94],
      [722, 1786, 361, 893],
    ]);
  });
  it('« un diviseur commun de ses termes » says 361/893 is finished — 19 still fills both; « le plus petit » writes it', () => {
    const { on, c } = refute(K.pgcd, { by: 'any', how: 'both' }, walked);
    expect(on).toBe('evidence');
    expect(at(c)).toEqual([722, 1786, 361, 893]);
    expect(F(K.pgcd).text.refuted({ ...c, says: true })).toMatch(/la planche de 19 remplit encore 361 et 893/);
    const small = refute(K.pgcd, { by: 'small', how: 'both' }, walked);
    expect(small.on).toBe('evidence');
    expect(at(small.c)).toEqual([722, 1786, 19, 47]);
    expect(F(K.pgcd).explain({ by: 'small', how: 'both' }, small.c)).toContain('\\dfrac{361}{893}');
  });
  it('straight to 38, « un diviseur commun » holds on his sign and falls on a new fraction', () => {
    const { on, c } = refute(K.pgcd, { by: 'any', how: 'both' }, atOnce);
    expect(on).toBe('attack');
    expect(c.same && !c.held).toBe(true);
    expect(refute(K.pgcd, { by: 'small', how: 'both' }, atOnce).on).toBe('evidence');
  });
  it('« le dénominateur seulement » writes 722/47 — another part', () => {
    for (const by of ['pgcd', 'any', 'small']) expect(refute(K.pgcd, { by, how: 'den' }, atOnce).on).toBe('evidence');
    expect(F(K.pgcd).explain({ by: 'pgcd', how: 'den' }, atOnce[0])).toContain('\\dfrac{722}{47}');
  });
  it('the last step: 558/682 — three rows, PGCD 62, 9/11', () => {
    const c = F(K.pgcd).use.make(() => 0.5);
    expect(c.rows.map((r) => [r.a, r.b, r.q, r.r])).toEqual([
      [682, 558, 1, 124],
      [558, 124, 4, 62],
      [124, 62, 2, 0],
    ]);
    expect([c.g, ...c.best]).toEqual([62, 9, 11]);
  });
});

describe('🧾 resultat-irreductible — what students do with a result, refuted on HIS bridge (design, K4)', () => {
  const rows = rowsOf(K.result, AT_ONCE);
  it('his evidence: 5/6 + 2/39 written 69/78 (not finished) and 23/26 (finished) — the crews were finished, the sum not', () => {
    // the plank 3 he laid wrote 23/26 (his own line, first); the sign's 69/78 is guaranteed (he cannot stand here otherwise)
    expect(rows.map((c) => [c.x, c.y, c.z, c.w, c.p, c.q, c.held])).toEqual([
      [5, 6, 2, 39, 23, 26, true],
      [5, 6, 2, 39, 69, 78, false],
    ]);
    expect(reduce(5, 6)).toEqual([5, 6]);
    expect(reduce(2, 39)).toEqual([2, 39]);
  });
  it('« tel quel » and « si l’une d’elles se simplifie » fall on his bridge: 3 holds 69 and 78', () => {
    for (const [after, when] of [
      ['keep', 'always'],
      ['keep', 'onlyIf'],
      ['irr', 'onlyIf'],
      ['once', 'onlyIf'],
    ]) {
      const { on, c } = refute(K.result, { after, when }, rows);
      expect(on, `${after} ${when}`).toBe('evidence');
      expect([c.p, c.q]).toEqual([23, 26]);
    }
  });
  it('« une seule fois » agrees with his bridge and falls on 2/3 × 9/26 = 18/78 → 9/39, where 3 still fills both', () => {
    const { on, c } = refute(K.result, { after: 'once', when: 'always' }, rows);
    expect(on).toBe('attack');
    expect([c.op, c.x, c.y, c.z, c.w, c.N, c.D, c.p, c.q]).toEqual(['*', 2, 3, 9, 26, 18, 78, 9, 39]);
    expect(F(K.result).text.refuted({ ...c, says: true })).toMatch(/la planche de 3 remplit encore 9 et 39/);
  });
  it('the last step GUIDES the striking before multiplying: 3² and 23 struck leave 2/7; then 23/52 × 44/69 = 11/39', () => {
    const c = F(K.result).use.make(() => 0.5);
    const good = Object.fromEntries(Object.entries(SOLVE[K.result](c)).map(([k, v]) => [k, String(v)]));
    expect(good).toEqual({ strike: 'both', n1: '2', d1: '7', n2: '11', d2: '39' });
    for (const other of ['three', 'tt', 'none'])
      expect(F(K.result).use.check(c, { ...good, strike: other })).toBe('strike');
    expect(F(K.result).text.use.strike).toMatch(/414 ?\/1 449/);
    // the product multiplied first, once by 3: 138/483 is equal and not finished
    expect(F(K.result).use.check(c, { ...good, n1: '138', d1: '483' })).toBe('short1');
    expect(F(K.result).use.check(c, { ...good, n2: '506', d2: '1794' })).toBe('short2');
  });
});

describe(`${ID} — the last steps, their claims, and the numbers the mirror draws`, () => {
  it('each last step, answered right, makes TRUE claims; with a wrong number, at least one false', () => {
    for (const key of KEYS) {
      const Fk = F(key);
      const c = Fk.use.make(() => 0.5);
      const asText = Object.fromEntries(Object.entries(SOLVE[key](c)).map(([k, v]) => [k, String(v)]));
      for (const cl of Fk.use.claim(c, asText)) expect(verifyClaim(cl), `${key} ${JSON.stringify(cl)}`).toBe(true);
      const fracKey = Object.keys(asText).find((k) => /^n\d?$/.test(k));
      const wrong = Fk.use.claim(c, { ...asText, [fracKey]: String(Number(asText[fracKey]) + 1) });
      expect(
        wrong.some((cl) => !verifyClaim(cl)),
        key,
      ).toBe(true);
    }
  });
  it('every box of a last step is named by the words beside it', () => {
    for (const key of KEYS) {
      const c = F(key).use.make(() => 0.5);
      for (const l of F(key).use.lines(c))
        for (const b of boxesOf(l.tokens)) expect((b.label ?? '').length, b.slot ?? b.choice).toBeGreaterThan(2);
    }
  });
  it('the list of the bank’s pairs pasted in forges.js is the bank’s own', () => {
    expect([...BANK_PAIRS].sort()).toEqual([...bankPairs(readBank(ID))].sort());
  });
  it('the mirror’s attacks and nudges never draw a number of the road or of lessons 1–2 — but the design’s own attacks', () => {
    const named = new Set(['95;228', '18;78']);
    for (const key of KEYS) {
      const Fk = F(key);
      for (const road of [AT_ONCE, WALKED, EVERY]) {
        const rows = rowsOf(key, road);
        const built = [
          ...allRules(Fk).flatMap((r) => Fk.attacks(r, rows)),
          ...[1, 2, 3].flatMap((k) => Fk.nudge(k, rows).cases),
        ];
        for (const c of built) {
          if (named.has(pairKey(c.A, c.B))) continue;
          expect(AVOID.has(c.A) || AVOID.has(c.B), `${key} ${c.A} ${c.B}`).toBe(false);
          expect(BANK_PAIRS.has(pairKey(c.A, c.B)), `${key} ${c.A} ${c.B}`).toBe(false);
        }
      }
    }
  });
  it('every sentence of every forge is French: typography and agreement', () => {
    for (const key of KEYS) {
      const Fk = F(key);
      const c0 = Fk.use.make(() => 0.5);
      const lines = [
        ...stringsIn(Fk.text).filter((s) => typeof s === 'string'),
        ...shownCases(Fk).flatMap((c) => [
          Fk.text.attack(c),
          Fk.text.ask(c),
          Fk.text.fact(c),
          Fk.text.refuted({ ...c, says: true }),
          Fk.text.refuted({ ...c, says: false }),
          ...allRules(Fk).map((r) => Fk.explain(r, c)),
        ]),
        ...allRules(Fk).map(Fk.ruleText),
        Fk.text.tryKey(c0),
        ...Fk.use.lines(c0).flatMap((l) => l.tokens.filter((t) => typeof t === 'string')),
      ];
      for (const s of lines) {
        expect(typographyErrors(s), `${key}: ${s}`).toEqual([]);
        expect(agreementErrors(s), `${key}: ${s}`).toEqual([]);
      }
    }
  });
  it('a refutation found on a road is the same as the suite’s', () => {
    expect(refutedBy(K.stays, { see: 'no235', then: 'stays' }, AT_ONCE).c).toMatchObject({ L: 95, W: 228 });
  });
});

describe(`${ID} — the mirrors of C and E open on a plank that FAILED (story.onMiss, Game.js › missed)`, () => {
  /** A game the story's hooks read: he stands back on B (or D), the island after it reached. */
  function fake(stage, keys, log) {
    const segs = STORY.segments.map((s, index) => ({ ...s, index, complete: index < stage, builtWith: null }));
    const opened = [];
    const game = { state: { stage, keys }, segs, log, markSigns: {}, opened, openForge: (k) => opened.push(k) };
    return { game, segs, opened };
  }
  it('K2: 1 held first, then 13, 3, 2 and 5 failed — the mirror of C opens on the last failure', () => {
    const log = [];
    const { game, segs, opened } = fake(2, [K.strike], log);
    log.push(...B_LOG([1, 13, 3, 2]));
    STORY.onMiss(game, segs[1], 2);
    expect(opened).toEqual([]);
    log.push(...B_LOG([5]));
    STORY.onMiss(game, segs[1], 5);
    expect(opened).toEqual([K.stays]);
  });
  it('K4: 3 held first, then 13 missed the post — the mirror of E opens; a failure elsewhere opens nothing', () => {
    const log = [...D_LOG([3, 13])];
    const { game, segs, opened } = fake(4, [K.strike, K.stays, K.pgcd], log);
    STORY.onMiss(game, segs[0], 5);
    expect(opened).toEqual([]);
    STORY.onMiss(game, segs[3], 13);
    expect(opened).toEqual([K.result]);
    // standing on D before reaching E, the arrival opens it (onArrive), not the failure
    const before = fake(3, [K.strike, K.stays, K.pgcd], log);
    STORY.onMiss(before.game, before.segs[3], 13);
    expect(before.opened).toEqual([]);
  });
});

describe('fraction-irreductible — gate B, 2026-11-26: what the screens of the forges say', () => {
  const sup = { '²': 2, '³': 3, '⁴': 4, '⁵': 5, '⁶': 6, '⁷': 7, '⁸': 8, '⁹': 9 };
  /** « 2² × 3 × 23 » → 276, read back from the plain text. */
  const valueOf = (t) =>
    t.split(' × ').reduce((v, f) => {
      const m = f.trim().match(/^(\d+)([²³⁴⁵⁶⁷⁸⁹]?)$/);
      return v * Number(m[1]) ** (m[2] ? sup[m[2]] : 1);
    }, 1);

  it('K1: each row of the log shows its fraction’s two decompositions, true ones', () => {
    const F = FORGES[K.strike];
    const rows = [1, 2, 3].flatMap((k) => F.nudge(k).cases);
    for (const c of rows) {
      const [l, w] = c.sub.split(' ; ');
      const [ln, lv] = l.split(' = ');
      const [wn, wv] = w.split(' = ');
      expect([Number(ln), Number(wn)], c.sub).toEqual([c.L, c.W]);
      expect([valueOf(lv), valueOf(wv)], c.sub).toEqual([c.L, c.W]);
    }
  });

  it('K3: no « leur » with no antecedent, the smallest common divisor sets 1 aside, the frame leaves room for its slots', () => {
    const F = FORGES[K.pgcd];
    const labels = F.slots.flatMap((s) => s.options.map((o) => o.label));
    for (const l of labels) expect(l, l).not.toMatch(/\bleurs?\b/);
    expect(F.slots[0].options.find((o) => o.id === 'small').label).toMatch(/sauf 1/);
    expect(F.slots[0].options.find((o) => o.id === 'pgcd').label).toBe('le PGCD de ses deux termes');
    expect([...F.text.frame].length).toBeLessThanOrEqual(48);
  });

  it('K4: the tile says which fractions, in the present; the last step one item per row; the refusal does not multiply', () => {
    const F = FORGES[K.result];
    const when = F.slots.find((s) => s.id === 'when');
    expect(when.label).toMatch(/fractions du calcul/);
    for (const o of when.options) expect(o.label, o.label).not.toMatch(/ait\b/);
    const c = F.use.make();
    const lines = F.use.lines(c);
    expect(lines).toHaveLength(3);
    // the four choices stand on the product's line: one item, one line
    expect(lines[0].tokens.some((t) => t?.choice === 'strike')).toBe(true);
    // « Ce n’est pas le produit »: no number of the raw product (1 012/3 588), which multiplies first
    expect(F.text.use.equal2).not.toMatch(/\d/);
  });

  it('one word for the sign: « pancarte » in the robot’s words, the forges and the card over the bridge', () => {
    expect(WORLD_TEXT.mark.sign).toBe('Pancarte du pont');
    expect(FORGES[K.stays].text.log).toMatch(/pancartes/);
  });

  it('the end card agrees its count: « 0 chute », « 1 chute », « 2 chutes »', () => {
    expect([0, 1, 2, 5].map((n) => KT.end.falls(n))).toEqual(['Chute', 'Chute', 'Chutes', 'Chutes']);
  });

  it('K2: the refusals of the yes/no items never say the answer', () => {
    const U = FORGES[K.stays].text.use;
    expect(U.yes).toBe(U.no);
    expect(U.yes).not.toMatch(/ne se simplifie pas|se simplifie\b/);
  });
});
