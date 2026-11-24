/**
 * THE FORGES of lesson `thales-configuration-papillon`: the shared checks (`describeForges` — kit/authoring/test/suites.js;
 * a case here is a Thalès figure of the world), then what is this lesson's own — the false rules its students really
 * hold and the COMPUTED case where each one falls (UNIT_3E_THALES_DESIGN.md § 2), every case drawn by the world's mirror
 * and line, the last steps' numbers, and every group of numbers against the bank and the other stories, pair by pair.
 * Ported from the Algerian lesson `talis-hisab-atwal` (its 🦋 and 📐).
 */
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { runOn, testsOf, ruleKey } from '../../../../../../common/gameworld/kit/forge';
import { allRules, describeForges, plain } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { collisions, readBank, storiesOf } from '../../../../../../common/gameworld/kit/authoring/test/bank.js';
import { Mirror, Line, UseFigure } from '../../../../../../common/gameworld/nilePyramids/forgeParts';
import { thalesCase, caseId } from '../../../../../../common/gameworld/nilePyramids/ruleForge';
import {
  figureSpec,
  gauge,
  lastStepFigure,
  mirrorFigure,
} from '../../../../../../common/gameworld/nilePyramids/figure';
import { layoutGeoFigure } from '../../../../../../common/components/geoFigure';
import { laidFact } from '../../../../../../common/gameworld/nilePyramids/plan';
import { FORGES, F1_CASES, F2_HARD, RIVER_CASE, USE1, USE1_FIG, USE2, USE2_FIG, planValue, values1 } from './forges';
import { PLAN_INQUIRY } from './inquiries';
import { KEYS } from './journey';
import { FACE, K, NUMBERS, RIVER, equal, minus, over, plus, riverFigure, times, write } from './math';

// the experiments' screens expose their state to the walks on `window` (dev only)
globalThis.window = globalThis.window ?? {};

const K1 = K.papillon;
const K2 = K.calcul;
const ID = 'thales-configuration-papillon';

// ───────── what the WORLD logs (Game.forgeLog), dock by dock ─────────
/** The river as the world logs it (`Game.forgeLog('river')`): whole — SR = √2785, SF = 8√2785 — his ferry rope kept. */
const riverRow = (typed, ferry) => thalesCase({ ...riverFigure(RIVER), typed, ferry });
/** A capstone order as the world logs it at the summit (`Game.forgeLog('summit')`): never K2's evidence. */
const capRow = (k, held) => {
  const side = (x) => write(times(x, k));
  return thalesCase({
    names: { V: 'S', M: 'M', B: 'B', N: 'N', C: 'C' },
    len: { VM: side(FACE.edge), VB: FACE.edge, VN: side(FACE.edge), VC: FACE.edge, MN: side(FACE.base), BC: FACE.base },
    held,
    k,
  });
};

/** Right at once; with misses; and a log that lost everything (the experiment's rows stand alone). */
const ROADS = {
  AT_ONCE: { [K1]: [riverRow('416', 'ties')], [K2]: [capRow('1/36', true)] },
  MISSED: {
    [K1]: [riverRow('6,5', 'short'), riverRow('468', 'slack'), riverRow('416', 'ties')],
    [K2]: [capRow('36', false), capRow('1/36', true)],
  },
  LOST: { [K1]: [], [K2]: [] },
};

// ───────── what each experiment hands back (its own reducer's result shape) ─────────
const HALFTURN_RESULT = {
  rows: [
    { round: 0, predicted: 'B', landed: 'B', right: true, parallel: true },
    { round: 1, predicted: 'C', landed: 'B', right: false, parallel: true },
    { round: 2, predicted: 'B', landed: 'B', right: true, parallel: false },
  ],
};
const planRow = (round, typed) => {
  const r = PLAN_INQUIRY.rounds[round];
  const truth = planValue({ ...thalesCase({ ...r.fig }), given: r.given, unknown: r.unknown }).value;
  return { round, unknown: r.unknown, typed, ...laidFact(typed, truth), picked: [], joins: [] };
};
const PLAN_RESULT = {
  rows: [
    planRow(0, '468'),
    planRow(0, '416'),
    planRow(1, '8,25'),
    planRow(1, '5,5'),
    planRow(2, '17,5'),
    planRow(2, '2'),
    planRow(2, '12,5'),
  ],
  plan: { cards: ['VB', 'BC'], joins: ['VMB-VM'] },
};

/** The right answer of each last step, computed from its case. */
const SOLVE = {
  [K1]: (c) => ({
    t1: 'AOE',
    t2: 'BOF',
    par: 'AB_EF',
    r1d: 'OE',
    r2n: 'OB',
    r2d: 'OF',
    r3n: 'AB',
    r3d: 'EF',
    of: c.len.VC,
  }),
  [K2]: (c) => ({ den: 'OE', ae: c.len.VMB, oa: c.len.VM, oe: c.len.VB, of: c.len.VC, ab: c.len.MN }),
};
/** The words of each key's NAME (and its tablet's): no sentence of its forge says them before its last step. */
const FORBIDDEN = {
  [K1]: /Thalès|papillon|autre côté du sommet/i,
  [K2]: /Thalès|papillon|quatrième proportionnelle|produit en croix/i,
};

const suite = describeForges({
  forges: FORGES,
  keys: KEYS,
  roads: ROADS,
  inquiry: { [K1]: HALFTURN_RESULT, [K2]: PLAN_RESULT },
  solve: SOLVE,
  forbidden: FORBIDDEN,
  bank: ID,
  tiles: { [K1]: 16, [K2]: 1 },
});

// ───────── the lesson's own ─────────

const F = FORGES;
const rule = (key, r) => allRules(F[key]).find((x) => ruleKey(F[key], x) === ruleKey(F[key], r));
/** Where a rule falls on a road: the first case of his evidence, or the mirror's attack. */
const fallOf = (key, r, road = ROADS.AT_ONCE) => suite.refutedBy(key, rule(key, r), road);
/** The text a rendered element shows (its tags and the formulas' annotations left out). */
const textOf = (html) => html.replace(/<annotation[^>]*>.*?<\/annotation>/g, '').replace(/<[^>]+>/g, ' ');

describe('the forges’ ids are the lesson’s', () => {
  it('one forge per key, in the order of the docks; each id quoted in forges.js (the status script)', () => {
    expect(Object.keys(F)).toEqual(KEYS);
    expect(KEYS).toEqual([K1, K2]);
    const src = readFileSync(new URL('./forges.js', import.meta.url), 'utf8');
    for (const k of KEYS) expect(src.includes(`'${k}'`), k).toBe(true);
  });
});

describe('papillon — every false pair falls on the parallel round I K L / P Q, the third ratio named (design § 2)', () => {
  const rows = suite.rowsOf(K1, ROADS.AT_ONCE);
  const [parallel, crooked, river] = rows;

  it('his evidence: the two pairs he turned, then HIS river, whole and exact (SE/SA = SR/SF = ER/AF = 1/8)', () => {
    expect(rows.map((c) => c.held)).toEqual([true, false, true]);
    expect(caseId(river)).toBe(caseId(RIVER_CASE));
    expect(river.len).toMatchObject({ VM: '9', VB: '72', VN: '√2785', VC: '8√2785', MN: '52', BC: '416' });
    expect(values1({ one: 'se_sa', two: 'sr_sf' }, river)).toEqual(['1/8', '1/8', '1/8']);
    // the world's log, with what he typed for the ferry, gives that same case
    for (const road of [ROADS.AT_ONCE, ROADS.MISSED])
      expect(F[K1].evidence(road[K1]).map(caseId)).toEqual([caseId(RIVER_CASE)]);
  });

  it('all fifteen false rules fall on the parallel round — never on the river, so no length he did not measure is written', () => {
    const wrong = allRules(F[K1]).filter((r) => !F[K1].isTheRule(r));
    expect(wrong).toHaveLength(15);
    for (const r of wrong) {
      const f = fallOf(K1, r);
      expect(f.on, JSON.stringify(r)).toBe('evidence');
      expect(caseId(f.c), JSON.stringify(r)).toBe(caseId(parallel));
      expect(F[K1].explain(r, f.c)).not.toContain('sqrt');
      plain(F[K1].text.refuted({ ...f.c, says: F[K1].says(r, f.c) }));
    }
  });

  it('the values the design writes (k = 4/7): crossed, upside down, across — computed', () => {
    const v = (one, two) => values1({ one, two }, parallel);
    expect(v('se_sa', 'sr_sa')).toEqual(['4/7', '6/7', '4/7']);
    expect(v('se_sa', 'sf_sr')).toEqual(['4/7', '7/4', '4/7']);
    expect(v('se_sa', 'sr_rf')).toEqual(['4/7', '4/11', '4/7']);
    expect(v('se_sf', 'sr_sf')).toEqual(['8/21', '4/7', '4/7']);
    for (const two of ['sr_sf', 'sr_sa', 'sr_rf']) expect(v('sa_se', two)[0]).toBe('7/4');
  });

  it('two wrong pairs are true equalities between themselves: the third ratio KL/PQ = 4/7 is not theirs, and is named', () => {
    expect(values1({ one: 'sa_se', two: 'sf_sr' }, parallel)).toEqual(['7/4', '7/4', '4/7']);
    expect(values1({ one: 'se_ea', two: 'sr_rf' }, parallel)).toEqual(['4/11', '4/11', '4/7']);
    for (const r of [
      { one: 'sa_se', two: 'sf_sr' },
      { one: 'se_ea', two: 'sr_rf' },
    ]) {
      const f = fallOf(K1, r);
      expect(caseId(f.c)).toBe(caseId(parallel));
      expect(F[K1].text.refuted({ ...f.c, says: false })).toContain('KL/PQ');
    }
  });

  it('the crooked round is exact (PQ = 11,5, cos Î = −1/4) and refuses the chain: 8/13, 3/4, 16/23', () => {
    expect(6.5 * 6.5 + 8 * 8 + (2 * 6.5 * 8) / 4).toBe(11.5 * 11.5);
    expect(4 * 4 + 6 * 6 + (2 * 4 * 6) / 4).toBe(8 * 8);
    expect(crooked.held).toBe(false);
    expect(values1({ one: 'se_sa', two: 'sr_sf' }, crooked)).toEqual(['8/13', '3/4', '16/23']);
    const right = allRules(F[K1]).find(F[K1].isTheRule);
    expect(F[K1].says(right, crooked)).toBe(false);
  });

  it('the right rule meets O U V / W T (k = 2/3), then a crooked pair on the same big triangle (8/15, 13/40, 53/135)', () => {
    const right = allRules(F[K1]).find(F[K1].isTheRule);
    const list = F[K1].attacks(right, rows);
    expect(list.map(caseId)).toEqual([caseId(F1_CASES.O), caseId(F1_CASES.OX)]);
    expect(list.map((c) => c.held)).toEqual([true, false]);
    expect(values1({ one: 'se_sa', two: 'sr_sf' }, F1_CASES.O)).toEqual(['2/3', '2/3', '2/3']);
    expect(values1({ one: 'se_sa', two: 'sr_sf' }, F1_CASES.OX)).toEqual(['8/15', '13/40', '53/135']);
    // exact: cos Ô = 1/10 from O W T, and the crooked small triangle on it
    expect(7.5 * 7.5 + 12 * 12 - (2 * 7.5 * 12) / 10).toBeCloseTo(13.5 * 13.5, 9);
    expect(4 * 4 + 3.9 * 3.9 - (2 * 4 * 3.9) / 10).toBeCloseTo(5.3 * 5.3, 9);
    // the nudges' figures are the experiment's and the attacks' turned round: exact, and of both kinds
    for (const c of [F1_CASES.R2, F1_CASES.OP]) expect(c.held, caseId(c)).toBe(true);
    for (const c of [F1_CASES.X2, F1_CASES.C3, F1_CASES.OXP]) expect(c.held, caseId(c)).toBe(false);
  });

  it('the river of the world is drawn whole by the mirror, its measured lengths only (no root written)', () => {
    const out = textOf(renderToString(createElement(Mirror, { c: riverRow('416', 'ties'), stage: 'done' })));
    for (const x of ['72', '9', '52', '416']) expect(out).toContain(x);
    expect(out).not.toContain('√');
    expect(renderToString(createElement(Line, { c: RIVER_CASE }))).toContain('data-np-line="aligned"');
  });
});

describe('papillon — the last step: the sentence, the three ratios, then OF (every true writing accepted)', () => {
  const ok = SOLVE[K1](USE1);
  it('OF = 8,5 m (k = 3/5); the across error 13,6 is answered', () => {
    expect(write(over(times(USE1.len.VN, USE1.len.VB), USE1.len.VM))).toBe('8,5');
    expect(USE1.len.VC).toBe('8,5');
    expect(F[K1].use.check(USE1, ok)).toBe('ok');
    expect(F[K1].use.check(USE1, { ...ok, of: '13,6' })).toBe('ofAcross');
  });
  it('either triple first; the second and third ratios in either order — never the across AE', () => {
    expect(F[K1].use.check(USE1, { ...ok, t1: 'BOF', t2: 'AOE' })).toBe('ok');
    expect(F[K1].use.check(USE1, { ...ok, r2n: 'AB', r2d: 'EF', r3n: 'OB', r3d: 'OF' })).toBe('ok');
    expect(F[K1].use.check(USE1, { ...ok, t2: 'AOE' })).toBe('align');
    expect(F[K1].use.check(USE1, { ...ok, r1d: 'AE' })).toBe('across');
    expect(F[K1].use.check(USE1, { ...ok, r2d: 'BF' })).toBe('across');
  });
  it('each triple is ONE choice (gate A F1); the line of ratios holds three fractions', () => {
    const lines = F[K1].use.lines(USE1);
    expect(lines.map((l) => l.tokens.filter((t) => typeof t === 'object').length)).toEqual([2, 1, 3, 1]);
  });
});

describe('calcul-depuis-le-sommet — the procedure, run on what is GIVEN only', () => {
  it('every round, attack and the last step can be computed from their data, and give the figure’s length', () => {
    for (const r of PLAN_INQUIRY.rounds) {
      const c = { ...thalesCase({ ...r.fig }), given: r.given, unknown: r.unknown };
      expect(planValue(c)?.value, r.unknown).toBe(c.len[r.unknown]);
    }
    expect(PLAN_INQUIRY.rounds.map((r) => thalesCase({ ...r.fig }).len[r.unknown])).toEqual(['416', '5,5', '12,5']);
    // the rounds are the design's numbers (math.js)
    NUMBERS.calcul.rounds.forEach((r, i) => {
      const fig = thalesCase({ ...PLAN_INQUIRY.rounds[i].fig });
      for (const [k, v] of Object.entries({ ...r.len, ...(r.across ?? {}), ...(r.pieces ?? {}) }))
        expect(fig.len[k], `${i} ${k}`).toBe(v);
    });
    for (const c of F2_HARD) expect(planValue(c).value).toBe(c.len[c.unknown]);
    expect(F2_HARD.map((c) => [c.unknown, c.typed, c.held, c.tag])).toEqual([
      ['VNC', '38,5', true, 'atteint'],
      ['NC', '4,5', false, 'un vide'],
    ]);
    expect(F2_HARD[1].len.NC).toBe('9');
    const use = { ...USE2, given: ['VM', 'VMB', 'VN', 'BC'], unknown: 'VC' };
    expect(planValue(use).value).toBe('8,7');
    expect([USE2.len.VB, USE2.len.VC, USE2.len.MN]).toEqual(['6', '8,7', '4,6']);
  });

  it('the false procedures he makes are laid where he makes them: across, piece, inverted — too long or too short', () => {
    const out = F[K2].fromInquiry(PLAN_RESULT);
    expect(F[K2].isTheRule(out.rule)).toBe(true);
    expect(out.rows.map((c) => [c.unknown, c.typed, c.held, c.tag])).toEqual([
      ['BC', '468', false, 'dépasse'],
      ['BC', '416', true, 'touche'],
      ['MN', '8,25', false, 'dépasse'],
      ['MN', '5,5', true, 'touche'],
      ['BC', '17,5', false, 'dépasse'],
      ['BC', '2', false, 'un vide'],
      ['BC', '12,5', true, 'touche'],
    ]);
    // each error is the wrong computation it stands for
    expect(write(over(times('52', plus('9', '72')), '9'))).toBe('468'); // across EA = 81
    expect(write(over(times('52', '9'), '72'))).toBe('6,5'); // inverted
    expect(write(over(times('16,5', '2'), '4'))).toBe('8,25'); // the piece MB instead of AB
    expect(write(over(times('16,5', '6'), '2'))).toBe('49,5'); // inverted
    expect(write(over(times('5', '31,5'), '9'))).toBe('17,5'); // across AE
    expect(write(over(times('5', '9'), '22,5'))).toBe('2'); // inverted
    expect(F[K2].evidence([...out.rows, ...ROADS.MISSED[K2]])).toEqual(out.rows);
  });
});

describe('calcul-depuis-le-sommet — the last step (renumbered: gate A F3, the bank’s « 4,5 ; 1,8 »)', () => {
  const ok = SOLVE[K2](USE2);
  const U = NUMBERS.calcul.use;
  it('OE = 10 − 4 = 6, OF = 8,7, AB = 4,6 (k = 2/3); he chooses OE among OE · AE · OF · EF', () => {
    expect(write(minus(U.across.VMB, U.len.VM))).toBe(U.len.VB);
    expect(write(over(times(U.len.VN, U.len.VB), U.len.VM))).toBe('8,7');
    expect(write(over(times(U.len.BC, U.len.VM), U.len.VB))).toBe('4,6');
    expect(F[K2].use.check(USE2, ok)).toBe('ok');
    expect(F[K2].use.check(USE2, { ...ok, den: 'AE' })).toBe('across');
  });
  it('the across errors are real (AE for OE): 14,5 and 2,76 — answered, and neither is an answer of the lesson', () => {
    expect(write(over(times(U.len.VN, U.across.VMB), U.len.VM))).toBe(U.errors.OF);
    expect(write(over(times(U.len.BC, U.len.VM), U.across.VMB))).toBe(U.errors.AB);
    expect(F[K2].use.check(USE2, { ...ok, of: '14,5' })).toBe('ofAcross');
    expect(F[K2].use.check(USE2, { ...ok, ab: '2,76' })).toBe('abAcross');
    const answers = [
      NUMBERS.papillon.river.AF,
      NUMBERS.papillon.use.len.VC,
      ...NUMBERS.calcul.rounds.map((r) => r.len[r.asked]),
      ...NUMBERS.calcul.attacks.map((a) => (a.across ?? a.pieces)[a.asked]),
      U.len.VB,
      U.len.VC,
      U.len.MN,
    ];
    for (const e of Object.values(U.errors))
      expect(
        answers.some((a) => equal(a, e)),
        e,
      ).toBe(false);
  });
  it('no additive slip of the data gives OF or AB', () => {
    const data = [U.len.VM, U.across.VMB, U.len.VN, U.len.BC, U.len.VB];
    for (const x of data)
      for (const y of data)
        for (const s of [plus(x, y), minus(x, y)])
          for (const want of [U.len.VC, U.len.MN]) expect(equal(s, want), `${x} ± ${y}`).toBe(false);
  });
});

describe('the gauge agrees with what each case is TRUE of (`held`)', () => {
  it('papillon: every pair he turned, his river among them, and every case of the mirror', () => {
    for (const c of [...suite.rowsOf(K1, ROADS.AT_ONCE), ...Object.values(F1_CASES)])
      expect(gauge(c).aligned, caseId(c)).toBe(c.held);
  });
  it('a refutation shows HIS three values', () => {
    const r = rule(K1, { one: 'se_ea', two: 'sr_rf' });
    const rows = suite.rowsOf(K1, ROADS.AT_ONCE);
    const run = runOn(F[K1], r, testsOf(F[K1], r, rows));
    const m = run.marks[run.bad];
    expect(F[K1].explain(r, m)).toContain('\\dfrac{4}{11}');
    expect(F[K1].explain(r, m)).toContain('\\dfrac{4}{7}');
  });
});

describe('every case the mirror draws lies low enough to leave the question in the window; its line is a formula', () => {
  it('drawn at its width, at most 380 px tall', () => {
    for (const key of KEYS)
      for (const c of suite.shownCases(F[key])) {
        if (!c.names || !c.len) continue;
        const spec = figureSpec(c, { show: c.show ?? 'all', parallel: c.parallel ?? null, turn: mirrorFigure(c).turn });
        const [, , vw, vh] = layoutGeoFigure(spec).viewBox;
        expect(((mirrorFigure(c).width ?? 300) * vh) / vw, `${key} ${caseId(c)}`).toBeLessThanOrEqual(380);
      }
  });
  it('the line under the mirror is a formula between dollars, its fractions at text size', () => {
    for (const key of KEYS)
      for (const c of suite.shownCases(F[key])) {
        const eq = F[key].text.eq(c);
        expect(eq, key).toMatch(/^\$[^$]+\$$/);
        expect(eq, key).not.toContain('\\dfrac');
      }
  });
  it('the mirror and a line of evidence render each case of each forge, built or not', () => {
    for (const key of KEYS)
      for (const c of suite.shownCases(F[key])) {
        expect(renderToString(createElement(Mirror, { c, stage: 'done' })), caseId(c)).toContain('data-rf-gauge');
        expect(renderToString(createElement(Line, { c })), caseId(c)).toContain('data-np-line');
      }
  });
});

describe('the last steps draw their figure beside their lines', () => {
  const FIGS_OF = { [K1]: USE1_FIG, [K2]: USE2_FIG };
  it('each forge gives its figure; it fits beside the lines at its 12 px label floor', () => {
    for (const key of KEYS) {
      const c = F[key].use.figure(F[key].use.make());
      expect(c).toBe(FIGS_OF[key]);
      const f = lastStepFigure(c);
      expect(f.fits, `${key} ${f.width}×${f.height}`).toBe(true);
    }
  });
  it('a figure writes what the question gives and « ? » for what it asks — nothing else', () => {
    const text = (c) => textOf(renderToString(createElement(UseFigure, { c })));
    const one = text(USE1_FIG);
    for (const x of ['4,2', '7', '5,1', '9', '?']) expect(one).toContain(x);
    expect(one).not.toMatch(/8,5|5,4/);
    const two = text(USE2_FIG);
    for (const x of ['4', 'AE = 10', '5,8', '6,9', '?']) expect(two).toContain(x);
    expect(two).not.toMatch(/8,7|4,6|14,5|2,76/);
  });
});

describe('the forges’ numbers are the platform’s own — pair by pair (UNIT_3E_THALES_DESIGN.md § 3)', () => {
  const bank = readBank(ID);
  const stories = storiesOf({ exceptId: ID });
  /** Tracked: every non-integer and every integer ≥ 10 (integers under 10 stand in every sheet). */
  const tracked = (x) => !/^\d+$/.test(x) || Number(x) >= 10;
  const valuesOf = (f) => Object.values(f.len ?? f).filter((x) => x != null && /^\d+(,\d+)?$/.test(String(x)));
  const P = NUMBERS.papillon;
  const C = NUMBERS.calcul;
  const groups = {
    'K1 round 2 and the crooked round': [...valuesOf(P.rounds[0]), ...valuesOf(P.rounds[1])],
    'K1 attack': valuesOf(P.attacks[0]),
    'K1 crooked attack (renumbered: OV 3,9, UV 5,3)': valuesOf(P.attacks[1]),
    'K1 last step': valuesOf(P.use),
    'K2 nested round and attack (b)': [...valuesOf(C.rounds[1]), '4', '9', ...Object.values(C.rounds[1].errors)],
    'K2 butterfly round and attack (a)': [
      ...valuesOf(C.rounds[2]),
      '31,5',
      '38,5',
      ...Object.values(C.rounds[2].errors),
    ],
    'K2 last step (renumbered: OB 5,8, EF 6,9)': [...valuesOf(C.use), '10', ...Object.values(C.use.errors)],
  };
  it.each(Object.entries(groups))('%s: no pair on a line of the bank or of another story', (_, nums) => {
    const uniq = [...new Set(nums.map(String))].filter(tracked);
    for (let i = 0; i < uniq.length; i += 1)
      for (let j = i + 1; j < uniq.length; j += 1) {
        const r = collisions(bank, [uniq[i], uniq[j]], { stories });
        expect(r.clear, `${uniq[i]} ; ${uniq[j]}`).toBe(true);
      }
  });
});
