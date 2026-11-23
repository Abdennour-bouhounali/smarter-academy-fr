// THE FORGES of trouver-le-pgcd: the shared checks (authoring kit), then what is this lesson's own — the false rules its
// students really hold, each refuted by HIS planks (or his baskets) or by a computed case the mirror names; the purses of
// the road; the last steps and the claims they make; no plank in the stall's forge; the numbers the mirror draws.
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
import { dealReducer, dealResult, initDeal } from '../../../../../../common/gameworld/divisorIsles/deal';
import { initPair, pairReducer, pairResult } from '../../../../../../common/gameworld/divisorIsles/gcdModes';
import { AVOID, BANK_PAIRS, FORGES, purseOf } from './forges';
import { DEAL_INQUIRY, PAIR_INQUIRY } from './inquiries';
import { KEYS } from './journey';
import { NUMBERS, euclid, fr, nb } from './math';
import { K } from './story';

const ID = 'trouver-le-pgcd';
const { twins: TW, deal: DL, factors: FC, euclide: EU, mission: MI } = NUMBERS;
const [T1, T2] = TW.gaps;
const [F1, F2] = FC.gaps;

/** The stall played through its reducer: the numbers of baskets he tries (and says before), then his answers. */
function playDeal(tries, answers) {
  let s = initDeal();
  for (const [k, v] of tries) {
    s = dealReducer(DEAL_INQUIRY, s, { type: 'choose', k });
    s = dealReducer(DEAL_INQUIRY, s, { type: 'say', v });
    for (let i = 0; i < 40 && s.stage === 'deal'; i += 1) s = dealReducer(DEAL_INQUIRY, s, { type: 'tick' });
  }
  for (const a of answers) {
    if (s.stage === 'pick') s = dealReducer(DEAL_INQUIRY, s, { type: 'toAnswer' });
    s = dealReducer(DEAL_INQUIRY, s, { type: 'answer', ...a });
    for (let i = 0; i < 40 && s.stage === 'deal'; i += 1) s = dealReducer(DEAL_INQUIRY, s, { type: 'tick' });
  }
  return dealResult(DEAL_INQUIRY, s);
}
/** The two pairs of the mirror of G played through their reducer: he says `guess(p)` = [first, second] for each probe. */
function playPair(guess) {
  let s = initPair();
  for (let guard = 0; guard < 40 && !s.done; guard += 1) {
    if (s.stage === 'guess') {
      const p = PAIR_INQUIRY.rounds[s.ri].probes[s.pi];
      const [x, y] = guess(p, s.ri);
      s = pairReducer(PAIR_INQUIRY, s, { type: 'say', side: 'first', v: x });
      s = pairReducer(PAIR_INQUIRY, s, { type: 'say', side: 'second', v: y });
      s = pairReducer(PAIR_INQUIRY, s, { type: 'lay' });
    } else if (s.stage === 'lay') s = pairReducer(PAIR_INQUIRY, s, { type: 'shown' });
    else s = pairReducer(PAIR_INQUIRY, s, { type: 'next' });
  }
  return pairResult(s);
}

/** K2: a student who tries 2, 5, 7, 6 and answers at once; one who tries 4, 12, 3, 10 and answers 3 baskets first. */
const DEAL_AT_ONCE = playDeal(
  [
    [2, true],
    [5, true],
    [7, false],
    [6, true],
  ],
  [{ k: 6, x: 5, y: 7 }],
);
const DEAL_WALKED = playDeal(
  [
    [4, true],
    [12, true],
    [3, true],
    [10, false],
  ],
  [
    { k: 3, x: 10, y: 14 },
    { k: 6, x: 5, y: 7 },
  ],
);
/** K4: he says « yes » everywhere; or the facts themselves. */
const PAIR_YES = playPair(() => [true, true]);

/** The world's log of bridges before each mirror: the bridges of the earlier convoys (none is his there). */
const BEFORE = {
  [K.factors]: [
    { a: T1, b: TW.plank },
    { a: T2, b: TW.plank },
  ],
};
/** The bridges he fired: each plank on each gap of the convoy, in order. */
const logOf = (gaps, planks) => planks.flatMap((b) => gaps.map((a) => ({ a, b })));
const AT_ONCE = { [K.common]: logOf(TW.gaps, [TW.plank]), [K.factors]: logOf(FC.gaps, [FC.plank]) };
const WALKED = {
  // 27 refused by 90; 9 fills both, the purse runs out on 54; then 18
  [K.common]: [{ a: T1, b: 27 }, ...logOf(TW.gaps, [9, TW.plank])],
  // 14 runs out of coins on 980; then 28
  [K.factors]: logOf(FC.gaps, [14, FC.plank]),
};
const EVERY = {
  [K.common]: [{ a: T1, b: 54 }, { a: T1, b: 36 }, { a: T1, b: 2 }, ...logOf(TW.gaps, [6, 3, TW.plank])],
  [K.factors]: [{ a: F1, b: 56 }, { a: F1, b: 196 }, { a: F1, b: 392 }, ...logOf(FC.gaps, [4, 14, FC.plank])],
};

const SOLVE = {
  [K.common]: (c) => ({ ...Object.fromEntries(c.set.map((d, i) => [`d${i + 1}`, d])), g: c.g }),
  [K.lots]: (c) => ({ k: c.g, x: c.nA / c.g, y: c.nB / c.g }),
  [K.factors]: (c) => ({ ...Object.fromEntries(c.common.map((f) => [`e${f.p}`, f.e])), g: c.g }),
  [K.euclide]: (c) => {
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
    };
  },
};
/** The words of each key's name and of what it states: no sentence of its forge says them before the last step. */
const FORBIDDEN = {
  [K.common]: /commun|PGCD|diviseur|plus grand/i,
  [K.lots]: /lots? identiques/i,
  [K.factors]: /par les facteurs premiers|produit des facteurs/i,
  [K.euclide]: /algorithme|Euclide/i,
};

const { rowsOf, refutedBy, shownCases } = describeForges({
  forges: FORGES,
  keys: KEYS,
  roads: { AT_ONCE, WALKED, EVERY },
  before: BEFORE,
  inquiry: { [K.lots]: DEAL_WALKED, [K.euclide]: PAIR_YES },
  solve: SOLVE,
  forbidden: FORBIDDEN,
  bank: ID,
  tiles: { [K.common]: 12, [K.lots]: 16, [K.factors]: 6, [K.euclide]: 6 },
});

const F = (key) => FORGES[key];
/** The rule of the tiles `rule` (complete), refuted: where, and on which case. */
const refute = (key, rule, rows) => {
  const run = runOn(F(key), rule, rows);
  return run.bad >= 0 ? { on: 'evidence', c: run.marks[run.bad] } : { on: 'attack', c: F(key).attacks(rule, rows)[0] };
};

describe(`${ID} — the purses of the road: never exact, each pays the longest plank of both and not the next`, () => {
  it('15, 193, 807, 55 are the purses the mirror computes for any pair (`purseOf`)', () => {
    expect(purseOf(...TW.gaps)).toBe(TW.purse);
    expect(purseOf(...FC.gaps)).toBe(FC.purse);
    expect(purseOf(...EU.gaps)).toBe(EU.purse);
    expect(purseOf(...MI.gaps)).toBe(MI.purse);
  });
  it('his evidence names the purse of the road: 18 builds with 8 planks out of 15; 9 needs 16', () => {
    const rows = rowsOf(K.common, WALKED);
    expect(rows.map((c) => [c.d, c.held, c.tag])).toEqual([
      [27, false, 'refusée'],
      [9, false, 'bourse vide'],
      [18, true, 'construit'],
    ]);
    expect(F(K.common).text.refuted({ ...rows[1], says: true })).toMatch(
      /demande 16.planches, et la bourse n’a que 15.pièces/,
    );
  });
});

describe('🤝 diviseurs-communs — the planks students really make, refuted on HIS planks or a new pair', () => {
  const rows = rowsOf(K.common, AT_ONCE);
  const every = rowsOf(K.common, EVERY);
  it('« the longest plank of the shorter gap » makes 54: 90 = 54 × 1 + 36', () => {
    const rule = { pick: 'longest', among: 'short' };
    expect(refute(K.common, rule, rows)).toMatchObject({ on: 'evidence', c: { d: 18 } });
    const { c } = refute(K.common, rule, every);
    expect(c).toMatchObject({ d: 54, held: false, fits: false });
    expect(F(K.common).text.refuted({ ...c, says: true })).toMatch(/ne remplit pas 90.: il reste 36.cases/);
  });
  it('« a plank as long as their difference » is 36: refused by 90; « the shortest but 1 » is 2: 72 planks', () => {
    expect(refute(K.common, { pick: 'longest', among: 'diff' }, every).c).toMatchObject({ d: 36, fits: false });
    const short = refute(K.common, { pick: 'shortest', among: 'both' }, every).c;
    expect(short).toMatchObject({ d: 2, fits: true, held: false, need: 72 });
  });
  it('« any plank that fills both » says 9 builds: the purse runs out (10 + 6 = 16 planks)', () => {
    const walked = rowsOf(K.common, WALKED);
    expect(refute(K.common, { pick: 'any', among: 'both' }, walked).c).toMatchObject({ d: 9, need: 16, held: false });
    // a student who made 18 at once: the mirror lays a plank of both that the purse does not pay
    const { on, c } = refute(K.common, { pick: 'any', among: 'both' }, rows);
    expect(on).toBe('attack');
    expect(c.fits && !c.held).toBe(true);
  });
  it('the right rule makes 18, and only 18, on 90 and 54', () => {
    const right = allRules(F(K.common)).find(F(K.common).isTheRule);
    for (const d of [1, 2, 3, 6, 9, 18, 27, 36, 54]) {
      const c = every.find((x) => x.d === d) ?? { ...rows[0], d };
      expect(F(K.common).says(right, { ...c, A: T1, B: T2, d }), String(d)).toBe(d === TW.plank);
    }
  });
});

describe('🧺 lots-identiques — the beliefs about baskets, refuted on HIS deals', () => {
  const rows = rowsOf(K.lots, {});
  const atOnce = F(K.lots).fromInquiry(DEAL_AT_ONCE).rows;
  it('his evidence: each deal he tried, the most baskets (6), and his answer of 3 baskets', () => {
    expect(rows.map((c) => [c.kind, c.k, c.held])).toEqual([
      ['deal', 4, false],
      ['deal', 12, false],
      ['deal', 3, true],
      ['deal', 10, false],
      ['most', 6, true],
      ['most', 3, false],
    ]);
    expect([DEAL_AT_ONCE.most, DL.apples, DL.pears]).toEqual([6, 30, 42]);
  });
  it('« n divides one of the two » falls on 5 (42 = 5 × 8 + 2); « their sum » and « their difference » on 4', () => {
    expect(refute(K.lots, { must: 'one', most: 'pgcd' }, atOnce).c).toMatchObject({ kind: 'deal', k: 5 });
    for (const must of ['sum', 'diff']) expect(refute(K.lots, { must, most: 'pgcd' }, rows).c).toMatchObject({ k: 4 });
  });
  it('« the smallest that suits », « how many suit », « their difference »: 2, 4, 12 — not 6', () => {
    for (const most of ['small', 'count', 'diff'])
      expect(refute(K.lots, { must: 'both', most }, atOnce).c).toMatchObject({ kind: 'most', k: 6, held: true });
  });
  it('no sentence of the stall’s forge names a plank or a bridge, nor writes the sum 72 (lesson 1’s number)', () => {
    const Fl = F(K.lots);
    const lines = [
      ...stringsIn(Fl.text).filter((s) => typeof s === 'string'),
      ...shownCases(Fl).flatMap((c) => [
        Fl.text.attack(c),
        Fl.text.ask(c),
        Fl.text.fact(c),
        Fl.text.eq(c),
        Fl.text.refuted({ ...c, says: true }),
        ...allRules(Fl).map((r) => Fl.explain(r, c)),
      ]),
      Fl.text.tryKey(),
      ...allRules(Fl).map(Fl.ruleText),
      ...[true, false].flatMap((y) => [Fl.text.says(y), Fl.text.broken(y)]),
    ];
    for (const s of lines) {
      expect(s, s).not.toMatch(/planche|pont|fossé/i);
      expect(s, s).not.toMatch(/(?<![0-9])72(?![0-9])/);
    }
    for (const c of shownCases(Fl)) expect(c.pair, Fl.caseId(c)).toBeUndefined();
  });
});

describe('🧮 pgcd-facteurs — the readings of two decompositions, refuted on HIS planks (the design’s numbers)', () => {
  const rows = rowsOf(K.factors, AT_ONCE);
  const made = (which, exp) => {
    const c = refute(K.factors, { which, exp }, rows).c;
    return F(K.factors).explain({ which, exp }, c);
  };
  it('his 28 refutes the five other rules: each makes another plank of 1 736 and 980', () => {
    for (const [which, exp, v] of [
      ['common', 'big', '392'],
      ['common', 'one', '14'],
      ['all', 'small', '4\\,340'],
      ['all', 'big', '60\\,760'],
      ['all', 'one', '2\\,170'],
    ]) {
      expect(refute(K.factors, { which, exp }, rows)).toMatchObject({ on: 'evidence', c: { d: 28, held: true } });
      expect(made(which, exp), `${which} ${exp}`).toContain(`= ${v}$`);
    }
  });
  it('« every exponent 1 » makes 14: it fills both, and the purse refuses it (124 + 70 = 194 planks, 193 coins)', () => {
    const walked = rowsOf(K.factors, WALKED);
    const c = walked.find((x) => x.d === 14);
    expect(c).toMatchObject({ need: 194, purse: 193, held: false, tag: 'bourse vide' });
    expect(F(K.factors).says({ which: 'common', exp: 'one' }, c)).toBe(true);
  });
  it('« son plus petit exposant »: a prime of one number only keeps the exponent it has (5 and 31), never 0', () => {
    // all + smallest seen = 2² × 5 × 7 × 31 = 4 340, not 28: the rule differs from the right one
    expect(F(K.factors).says({ which: 'all', exp: 'small' }, { ...rows[0], A: F1, B: F2, d: 4340 })).toBe(true);
  });
});

describe('🔁 euclide — what the notebook leads to, refuted on the plank he crossed with', () => {
  const rows = rowsOf(K.euclide, {});
  it('his evidence: 10 403 (807 coins), and every probe of the two rounds on each pair', () => {
    expect(rows[0]).toMatchObject({ A: EU.gaps[0], B: EU.gaps[1], d: EU.plank, held: true, purse: EU.purse });
    expect(rows).toHaveLength(1 + 3 * 4);
    // the contrast: 22 builds (88 ; 22) and not (88 ; 33); 11 builds (88 ; 33) and not (88 ; 22) — the purse
    const of = (A, B, d) => rows.find((c) => c.A === A && c.B === B && c.d === d);
    expect(of(88, 22, 22).held && !of(88, 33, 22).held).toBe(true);
    expect(of(88, 33, 11).held && !of(88, 22, 11).held && of(88, 22, 11).fits).toBe(true);
    // the last two rows: 10 403 builds both pairs
    expect(of(31209, 20806, 10403).held && of(20806, 10403, 10403).held).toBe(true);
  });
  it('the five wrong rules make, on 52 015 and 31 209, a plank the world refuses: 2, 3, 20 806, 1, 1', () => {
    const want = { 'zero:q': 2, 'zero:count': 3, 'qone:last': 20806, 'qone:q': 1, 'qone:count': 1 };
    for (const [k, v] of Object.entries(want)) {
      const [stop, make] = k.split(':');
      const { on, c } = refute(K.euclide, { stop, make }, rows);
      expect(on, k).toBe('evidence');
      expect(c.d).toBe(EU.plank);
      expect(F(K.euclide).explain({ stop, make }, c), k).toContain(fr(`la planche de ${nb(v)} :`));
      const [A, B] = EU.gaps;
      const paid = A % v === 0 && B % v === 0 && A / v + B / v <= EU.purse;
      expect(paid, `${k}: the gaps or the purse refuse ${v}`).toBe(false);
    }
  });
  it('the notebook’s rows are the design’s: 52 015 = 31 209 × 1 + 20 806, then 20 806 = 10 403 × 2 + 0', () => {
    expect(euclid(...EU.gaps).map((r) => [r.a, r.b, r.q, r.r])).toEqual([
      [52015, 31209, 1, 20806],
      [31209, 20806, 1, 10403],
      [20806, 10403, 2, 0],
    ]);
  });
});

describe(`${ID} — the last steps, their claims, and the numbers the mirror draws`, () => {
  it('each last step, answered right, makes TRUE claims; answered with a wrong number, a false one', () => {
    for (const key of KEYS) {
      const Fk = F(key);
      const c = Fk.use.make(() => 0.5);
      const vals = SOLVE[key](c);
      const asText = Object.fromEntries(Object.entries(vals).map(([k, v]) => [k, String(v)]));
      const claims = [Fk.use.claim(c, asText)].flat();
      for (const cl of claims) expect(verifyClaim(cl), `${key} ${JSON.stringify(cl)}`).toBe(true);
      const wrong = [
        Fk.use.claim(c, { ...asText, g: String(Number(asText.g ?? asText.k) + 1), k: String(Number(asText.k) + 1) }),
      ].flat();
      expect(
        wrong.some((cl) => !verifyClaim(cl)),
        key,
      ).toBe(true);
    }
  });
  it('every box of a last step is named by the words beside it; no pair of the bank, no number of the road', () => {
    for (const key of KEYS) {
      const c = F(key).use.make(() => 0.5);
      for (const l of F(key).use.lines(c))
        for (const b of boxesOf(l.tokens)) expect(b.label.length, b.slot).toBeGreaterThan(2);
    }
    for (const key of KEYS)
      for (const c of shownCases(F(key))) {
        const p = c.A != null ? [c.A, c.B] : null;
        if (!p) continue;
        expect(BANK_PAIRS.has(pairKey(...p)), `${key} ${p}`).toBe(false);
      }
  });
  it('the list of the bank’s pairs pasted in forges.js is the bank’s own', () => {
    expect([...BANK_PAIRS].sort()).toEqual([...bankPairs(readBank(ID))].sort());
  });
  it('the mirror’s attacks and nudges never draw a number of lesson 1 or of this road', () => {
    for (const key of KEYS) {
      const Fk = F(key);
      const rows = rowsOf(key, AT_ONCE);
      const built = [
        ...allRules(Fk).flatMap((r) => Fk.attacks(r, rows)),
        ...[1, 2, 3].flatMap((n) => Fk.nudge(n, rows).cases),
      ];
      for (const c of built) expect(AVOID.has(c.A) || AVOID.has(c.B), `${key} ${c.A} ${c.B}`).toBe(false);
    }
  });
  it('every sentence of every forge is French: typography and agreement', () => {
    for (const key of KEYS) {
      const Fk = F(key);
      const lines = [
        ...stringsIn(Fk.text).filter((s) => typeof s === 'string'),
        ...shownCases(Fk).flatMap((c) => [
          Fk.text.attack(c),
          Fk.text.refuted({ ...c, says: true }),
          Fk.text.refuted({ ...c, says: false }),
          Fk.text.fact(c),
        ]),
        ...allRules(Fk).map(Fk.ruleText),
        Fk.text.tryKey(Fk.use.make(() => 0.5)),
      ];
      for (const s of lines) {
        expect(typographyErrors(s), `${key}: ${s}`).toEqual([]);
        expect(agreementErrors(s), `${key}: ${s}`).toEqual([]);
      }
    }
  });
  it('a refutation found on a road is the same as the suite’s', () => {
    const rule = { pick: 'longest', among: 'short' };
    expect(refutedBy(K.common, rule, EVERY).c.d).toBe(54);
  });
});
