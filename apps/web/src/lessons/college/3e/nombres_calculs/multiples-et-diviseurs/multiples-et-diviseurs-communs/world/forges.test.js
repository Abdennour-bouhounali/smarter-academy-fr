// THE FORGES of multiples-et-diviseurs-communs: the shared checks (authoring kit), then what is this lesson's own — the
// false rules its students really hold, each refuted by HIS pillars, his stories or his days, or by a computed case the
// mirror names; the purses of the road; the last steps and the claims they make; « PPCM » nowhere.
import { describe, it, expect } from 'vitest';
import {
  allRules,
  describeForges,
  stringsIn,
  typographyErrors,
} from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { verifyClaim } from '../../../../../../common/gameworld/kit/claims';
import { runOn } from '../../../../../../common/gameworld/kit/forge';
import { lay } from '../../../../../../common/gameworld/divisorIsles/walkway';
import {
  daysReducer,
  daysResult,
  initDays,
  initStory,
  storyReducer,
  storyResult,
} from '../../../../../../common/gameworld/divisorIsles/crews';
import { FORGES, purseOf } from './forges';
import { DAYS_INQUIRY, STORY_INQUIRY } from './inquiries';
import { KEYS } from './journey';
import { NUMBERS, lcm } from './math';
import { K } from './story';

const ID = 'multiples-et-diviseurs-communs';
const { pillar: PI, factors: FC } = NUMBERS;

// ───────────────────────── the roads: what the world's log holds before each mirror ─────────────────────────

/** The entries a walkway writes in `game.log` (`walkwayGame.js › walkwayLaid`), one per pillar laid. */
const walkLog = (seg, crews, purse, ds) =>
  ds.map((d) => {
    const t = lay(crews, d, purse);
    return { kind: 'walkway', seg, d, lanes: t.lanes, holds: t.holds, cost: t.cost, paid: t.paid };
  });
const quai = (ds) => walkLog('pilier-quai', PI.crews, PI.purse, ds);
const chantier = (ds) => walkLog('pilier-chantier', FC.crews, FC.purse, ds);
const FIRST1 = lcm(...PI.crews);
const FIRST2 = lcm(...FC.crews);

const AT_ONCE = { [K.pilier]: quai([FIRST1]), [K.facteurs]: chantier([FIRST2]) };
// the design's walk: 64 (B stops 4 short), 320 (holds, ruins him), 0 (the shore), 80; then 6, 576, 13 248
const WALKED = { [K.pilier]: quai([64, 320, 0, FIRST1]), [K.facteurs]: chantier([6, 576, FIRST2]) };
const EVERY = {
  [K.pilier]: quai([64, 20, 16, 36, 40, 48, 60, 4, 0, 160, 320, FIRST1]),
  [K.facteurs]: chantier([6, 576, 138, 414, 4416, 26496, 79488, FIRST2]),
};
/** The log before the mirror of D: the quay's walkway (not his there). */
const BEFORE = { [K.facteurs]: quai([64, FIRST1]) };

// ───────────────────────── the experiments, played through the world's reducers ─────────────────────────

const walk = (action) => ({ type: 'walk', action });
const pillar = (d) => [
  walk({ type: 'take' }),
  walk({ type: 'type', text: String(d) }),
  walk({ type: 'plant' }),
  walk({ type: 'lay' }),
  ...Array.from({ length: 45 }, () => walk({ type: 'tick' })),
];
/** The two stories: wrong chips first, a pillar too short, then a read-back that swaps the turns. */
function playStory() {
  const moves = [
    { type: 'read' },
    { type: 'chip', slot: 'unit', value: 'un tour' },
    { type: 'chip', slot: 'unit', value: 'une dent' },
    { type: 'chip', slot: 'A', value: 52 },
    { type: 'chip', slot: 'A', value: 32 },
    { type: 'chip', slot: 'B', value: 20 },
    ...pillar(64),
    ...pillar(160),
    { type: 'back' },
    { type: 'type', id: 'teeth', value: '160' },
    { type: 'type', id: 'turnsA', value: '8' },
    { type: 'type', id: 'turnsB', value: '8' },
    { type: 'check' },
    { type: 'type', id: 'turnsA', value: '5' },
    { type: 'check' },
    { type: 'next' },
    { type: 'read' },
    { type: 'chip', slot: 'unit', value: 'une minute' },
    { type: 'chip', slot: 'A', value: 6 },
    { type: 'chip', slot: 'A', value: 10 },
    { type: 'chip', slot: 'B', value: 46 },
    ...pillar(460),
    ...pillar(230),
    { type: 'back' },
    { type: 'type', id: 'at', value: { h: '3', min: '50' } },
    { type: 'check' },
    { type: 'type', id: 'at', value: { h: '10', min: '00' } },
    { type: 'check' },
    { type: 'next' },
  ];
  const s = moves.reduce((x, a) => storyReducer(STORY_INQUIRY, x, a), initStory());
  expect(s.done).toBe(true);
  return storyResult(s);
}
/** The five teams: 1 on day 1 first, then 6, 13, 25 and 721 said before each run. */
function playDays(says = [6, 13, 25, 721]) {
  let s = initDays();
  s = daysReducer(DAYS_INQUIRY, s, { type: 'zero', value: 1 });
  s = daysReducer(DAYS_INQUIRY, s, { type: 'zero', value: 0 });
  s = daysReducer(DAYS_INQUIRY, s, { type: 'next' });
  for (const said of says) {
    s = daysReducer(DAYS_INQUIRY, s, { type: 'say', text: String(said) });
    for (let guard = 0; guard < 200 && s.phase !== 'met'; guard += 1)
      s = daysReducer(DAYS_INQUIRY, s, { type: s.phase === 'stop' ? 'resume' : 'step' });
    s = daysReducer(DAYS_INQUIRY, s, { type: 'next' });
  }
  expect(s.done).toBe(true);
  return daysResult(s);
}
const STORY_PLAYED = playStory();
const DAYS_PLAYED = playDays();

const SOLVE = {
  [K.pilier]: (c) => ({ d: c.m, x: c.m / c.A, y: c.m / c.B }),
  [K.facteurs]: (c) => ({
    e2: c.big.find((f) => f.p === 2).e,
    e11: c.big.find((f) => f.p === 11).e,
    m: c.m,
    n: c.n,
  }),
  [K.rendezvous]: (c) => ({ t1: 'pgcd', v1: c.g, t2: 'multiple', v2: c.m }),
  [K.equipes]: (c) => ({
    ca: c.cycles[0],
    cb: c.cycles[1],
    cc: c.cycles[2],
    e2: c.big.find((f) => f.p === 2).e,
    m: c.m,
    day: c.day,
  }),
};
/** The words of each key's name and of what it states: no sentence of its forge says them before the last step. */
const FORBIDDEN = {
  [K.pilier]: /commun|PPCM|multiple/i,
  [K.facteurs]: /PPCM|par les facteurs premiers/i,
  [K.rendezvous]: /rendez-vous|PPCM/i,
  [K.equipes]: /cycle|PPCM/i,
};

const { rowsOf, shownCases } = describeForges({
  forges: FORGES,
  keys: KEYS,
  roads: { AT_ONCE, WALKED, EVERY },
  before: BEFORE,
  inquiry: { [K.rendezvous]: STORY_PLAYED, [K.equipes]: DAYS_PLAYED },
  solve: SOLVE,
  forbidden: FORBIDDEN,
  bank: ID,
  tiles: { [K.pilier]: 12, [K.facteurs]: 6, [K.rendezvous]: 6, [K.equipes]: 8 },
});

const F = (key) => FORGES[key];
const refute = (key, rule, rows) => {
  const run = runOn(F(key), rule, rows);
  return run.bad >= 0 ? { on: 'evidence', c: run.marks[run.bad] } : { on: 'attack', c: F(key).attacks(rule, rows)[0] };
};
const right = (key) => allRules(F(key)).find(F(key).isTheRule);

describe(`${ID} — the purses: never exact, each pays the first pillar that holds and not the next`, () => {
  it('14 pays 80 (9 planks) and not 160 (18); 120 pays 13 248 (101) and not 26 496 (202)', () => {
    expect(purseOf(...PI.crews)).toBe(PI.purse);
    expect(purseOf(...FC.crews)).toBe(FC.purse);
    for (const [crews, purse] of [
      [PI.crews, PI.purse],
      [FC.crews, FC.purse],
    ]) {
      const L = lcm(...crews);
      expect(lay(crews, L, purse).paid).toBe(true);
      expect(lay(crews, 2 * L, purse)).toMatchObject({ holds: true, paid: false, verdict: 'ruins' });
    }
    expect(lay(PI.crews, FIRST1, PI.purse).cost).toBe(9);
    expect(lay(FC.crews, FIRST2, FC.purse).cost).toBe(101);
  });
  it('a pair of the mirror gets a purse of 2 × the planks of its first pillar − 1', () => {
    for (const [a, b, L, purse] of [
      [16, 38, 304, 53],
      [14, 46, 322, 59],
      [1156, 952, 16184, 61],
    ]) {
      expect(lcm(a, b), `${a} ${b}`).toBe(L);
      expect(L, 'not the product').not.toBe(a * b);
      expect(purseOf(a, b), `${a} ${b}`).toBe(purse);
      expect(lay([a, b], L, purse).paid, `${a} ${b}`).toBe(true);
      expect(lay([a, b], 2 * L, purse).paid, `${a} ${b}`).toBe(false);
    }
  });
  it('the mirrors never show a pair of the gate dash before the dash (4 ; 34, 19 ; 37, 26 ; 34, 24 ; 92)', () => {
    const dash = new Set(['4;34', '19;37', '26;34', '24;92']);
    for (const key of [K.pilier, K.facteurs])
      for (const c of shownCases(F(key)))
        expect(dash.has([c.A, c.B].sort((x, y) => x - y).join(';')), F(key).caseId(c)).toBe(false);
  });
});

describe('🏗️ pilier-commun — the pillars students really place, refuted on HIS pillars or a new walkway', () => {
  const every = rowsOf(K.pilier, EVERY);
  const atOnce = rowsOf(K.pilier, AT_ONCE);
  it('his evidence: every pillar he placed on the quay, in order — only 80 is built', () => {
    expect(every.map((c) => [c.d, c.tag])).toEqual([
      [64, 'ne tient pas'],
      [20, 'ne tient pas'],
      [16, 'ne tient pas'],
      [36, 'ne tient pas'],
      [40, 'ne tient pas'],
      [48, 'ne tient pas'],
      [60, 'ne tient pas'],
      [4, 'ne tient pas'],
      [0, 'sur le bord'],
      [160, 'trop chère'],
      [320, 'trop chère'],
      [80, 'bâtie'],
    ]);
    expect(F(K.pilier).text.fact(every[0])).toMatch(/^Les planches de 20 s’arrêtent 4.cases avant le pilier/);
    expect(F(K.pilier).text.refuted({ ...every[10], says: true })).toMatch(
      /il faut 36.planches, et la bourse n’en paie que 14/,
    );
  });
  it('« en comptant 0 » falls on the shore; « the longer planks » on 20, « the shorter » on 16 (B lays none)', () => {
    expect(refute(K.pilier, { pick: 'smallest', who: 'both', zero: 'with' }, every).c).toMatchObject({
      d: 0,
      verdict: 'shore',
    });
    expect(refute(K.pilier, { pick: 'smallest', who: 'long', zero: 'without' }, every).c).toMatchObject({ d: 20 });
    const short = refute(K.pilier, { pick: 'smallest', who: 'short', zero: 'without' }, every).c;
    expect(short).toMatchObject({ d: 16, held: false });
    expect(short.lanes[1]).toMatchObject({ planks: 0, short: 16 });
  });
  it('« any distance where both end » is refuted by a pillar that holds and that the purse refuses', () => {
    const { on, c } = refute(K.pilier, { pick: 'any', who: 'both', zero: 'without' }, atOnce);
    expect(on).toBe('attack');
    expect(c).toMatchObject({ A: 16, B: 20, d: 160, verdict: 'ruins', cost: 18 });
    expect(refute(K.pilier, { pick: 'any', who: 'both', zero: 'without' }, every).c).toMatchObject({ d: 160 });
  });
  it('the right rule places 80, and only 80, on the ruler 0 … 400 of the quay', () => {
    for (let d = 0; d <= PI.ruler; d += 4)
      expect(F(K.pilier).says(right(K.pilier), { A: 16, B: 20, d }), String(d)).toBe(d === FIRST1);
  });
});

describe('🧮 ppcm-facteurs — the readings of two decompositions, refuted on HIS 13 248 or on 1 156 and 952', () => {
  const rows = rowsOf(K.facteurs, AT_ONCE);
  it('the quay’s pillars in the log are not his evidence here; 13 248 is', () => {
    const before = rowsOf(K.facteurs, {});
    expect(before.map((c) => c.d)).toEqual([FIRST2]);
  });
  it('his 13 248 refutes the five other rules: 6, 576, 6, 138, 138', () => {
    for (const [which, exp, v] of [
      ['common', 'small', '6'],
      ['common', 'big', '576'],
      ['common', 'one', '6'],
      ['all', 'small', '138'],
      ['all', 'one', '138'],
    ]) {
      const r = refute(K.facteurs, { which, exp }, rows);
      expect(r, `${which} ${exp}`).toMatchObject({ on: 'evidence', c: { d: FIRST2, held: true } });
      expect(F(K.facteurs).explain({ which, exp }, r.c)).toContain(`= ${v}$`);
    }
  });
  it('on the mirror’s pair the six rules give six numbers, and only 16 184 is built', () => {
    const [a, b] = FC.mirror;
    const made = allRules(F(K.facteurs)).map((r) => {
      const c = F(K.facteurs)
        .attacks(right(K.facteurs), rows)
        .find((x) => x.A === a && F(K.facteurs).says(r, x));
      return c?.d ?? null;
    });
    expect(new Set(made.filter(Boolean)).size).toBeGreaterThanOrEqual(2);
    const [first] = F(K.facteurs).attacks(right(K.facteurs), rows);
    expect(first).toMatchObject({ A: a, B: b, d: 16184, held: true, cost: 31 });
    expect(F(K.facteurs).attacks(right(K.facteurs), rows)[1]).toMatchObject({ d: 2312, held: false });
  });
});

describe('🔁 traduire-rendez-vous — the read-backs students really make, refuted on HIS two stories', () => {
  const rows = rowsOf(K.rendezvous, {});
  it('his evidence: his pillars (64, 160; 460, 230), and every value he read back (8 and 5 turns, 3 h 50, 10 h 00)', () => {
    expect(rows.map((c) => [c.story, c.kind, c.v, c.held])).toEqual([
      ['gears', 'meet', 64, false],
      ['gears', 'meet', 160, true],
      ['gears', 'turns', 8, false],
      ['gears', 'turns', 8, true],
      ['gears', 'turns', 5, true],
      ['bus', 'meet', 460, false],
      ['bus', 'meet', 230, true],
      ['bus', 'clock', 230, false],
      ['bus', 'clock', 600, true],
    ]);
  });
  it('« divided by the other’s rhythm » falls on the 32-tooth wheel: 8 turns are 256 teeth, not 160', () => {
    const { on, c } = refute(K.rendezvous, { when: 'lcm', times: 'other' }, rows);
    expect(on).toBe('evidence');
    expect(c).toMatchObject({ kind: 'turns', who: 32 });
    expect(F(K.rendezvous).text.fact(rows[2])).toMatch(/c’est 256.dents, et non 160.dents/);
  });
  it('« their product » and « their greatest common divisor » fall on 160 teeth', () => {
    for (const when of ['product', 'gcd'])
      for (const times of ['own', 'other'])
        expect(refute(K.rendezvous, { when, times }, rows).c).toMatchObject({ kind: 'meet', v: 160, held: true });
  });
});

describe('⏳ cinq-equipes — the days students really compute, refuted on HIS days', () => {
  const rows = rowsOf(K.equipes, {});
  it('his evidence: each meeting (7, 13, 61, 61), the days he said, the days the run stopped on', () => {
    const met = rows.filter((c) => c.held).map((c) => [c.teams.join(''), c.day]);
    expect(met).toEqual([
      ['12', 7],
      ['123', 13],
      ['1234', 61],
      ['12345', 61],
    ]);
    const stops = rows.filter((c) => c.teams.length === 4 && !c.held && c.day < 61);
    expect(stops.map((c) => [c.day, c.idle])).toEqual([
      [25, [4]],
      [13, [4]],
      [31, [3]],
      [37, [4]],
      [49, [4]],
    ]);
  });
  it('the owner’s trap — the sleep days as the rhythm — gives 61 for the five, and falls on teams 1 and 2', () => {
    const trap = { what: 'lcm', of: 'sleep', add: 'plus' };
    expect(
      F(K.equipes).says(
        trap,
        rows.find((c) => c.teams.length === 5 && c.held),
      ),
    ).toBe(true);
    expect(refute(K.equipes, trap, rows).c).toMatchObject({ teams: [1, 2], day: 7, held: true });
  });
  it('without « 1 + » the day is 6: team 1 sleeps; the product gives 25 for teams 1 to 3', () => {
    expect(refute(K.equipes, { what: 'lcm', of: 'both', add: 'same' }, rows).c).toMatchObject({ teams: [1, 2] });
    expect(refute(K.equipes, { what: 'product', of: 'both', add: 'plus' }, rows).c).toMatchObject({
      teams: [1, 2, 3],
      day: 13,
    });
  });
});

describe(`${ID} — the last steps and their claims`, () => {
  it('each right answer makes only true claims; a wrong one a false claim', () => {
    for (const key of KEYS) {
      const c = F(key).use.make(() => 0.5);
      const vals = Object.fromEntries(Object.entries(SOLVE[key](c)).map(([k, v]) => [k, String(v)]));
      for (const claim of F(key).use.claim(c, vals))
        expect(verifyClaim(claim), `${key} ${JSON.stringify(claim)}`).toBe(true);
    }
    const c1 = F(K.pilier).use.make();
    expect(F(K.pilier).use.check(c1, { d: '49', x: '3', y: '1' })).toBe('longer');
    expect(F(K.pilier).use.check(c1, { d: '686', x: '49', y: '14' })).toBe('nearer');
    expect(verifyClaim(F(K.pilier).use.claim(c1, { d: '686' })[0])).toBe(false);
    const c4 = F(K.equipes).use.make();
    const base = { ca: '4', cb: '14', cc: '19', e2: '2', m: '532' };
    expect(F(K.equipes).use.check(c4, { ...base, ca: '3', cb: '13', cc: '18' })).toBe('sleeps');
    expect(F(K.equipes).use.check(c4, { ...base, e2: '1' })).toBe('e2low');
    expect(F(K.equipes).use.check(c4, { ...base, day: '235' })).toBe('none');
    expect(F(K.equipes).use.check(c4, { ...base, day: '532' })).toBe('none');
    expect(F(K.equipes).use.check(c4, { ...base, day: '1065' })).toBe('again');
    const c3 = F(K.rendezvous).use.make();
    expect(F(K.rendezvous).use.check(c3, { t1: 'multiple', v1: '160', t2: 'multiple', v2: '160' })).toBe('rodsTool');
    expect(F(K.rendezvous).use.check(c3, { t1: 'pgcd', v1: '4', t2: 'pgcd', v2: '4' })).toBe('gearsTool');
  });
  it('no fact of a last step writes its answer', () => {
    const answers = {
      [K.pilier]: /\b98\b/,
      [K.facteurs]: /6\s?776|864/,
      [K.rendezvous]: /\b4 cm|160 dents\b/,
      [K.equipes]: /\b533\b|\b532\b/,
    };
    for (const key of KEYS)
      for (const s of Object.values(F(key).text.use)) expect(s, `${key}: ${s}`).not.toMatch(answers[key]);
  });
});

describe(`${ID} — the words of the forges`, () => {
  const lines = (key) => {
    const Fx = F(key);
    return [
      ...stringsIn(Fx.text),
      ...allRules(Fx).map(Fx.ruleText),
      ...shownCases(Fx).flatMap((c) => [
        Fx.text.ask(c),
        Fx.text.fact(c),
        Fx.text.attack(c),
        Fx.text.refuted({ ...c, says: true }),
        c.text,
        ...allRules(Fx).map((r) => Fx.explain(r, c)),
      ]),
      Fx.text.tryKey(Fx.use.make()),
    ];
  };
  it('K3: every evidence row is whole in its two lines (≤ 42 characters) — the datum, its clock time or amount, read', () => {
    for (const c of shownCases(F(K.rendezvous))) expect(c.text.length, c.text).toBeLessThanOrEqual(42);
  });

  it('never « de les » nor « de le » (gate B 2026-11-26: « le prochain jour ensemble de les équipes 1 et 2 »)', () => {
    for (const key of KEYS) for (const s of lines(key)) expect(s, s).not.toMatch(/\bde (les|le) /);
  });

  it('« PPCM » is never written (version B: the words in full); no sentence holds both « PGCD » and « produit »', () => {
    for (const key of KEYS)
      for (const s of lines(key)) {
        expect(s, s).not.toMatch(/PPCM/);
        expect(typographyErrors(s), s).toEqual([]);
        for (const sentence of String(s).split(/[.?!]\s/))
          expect(/PGCD/.test(sentence) && /produit/.test(sentence), s).toBe(false);
      }
  });
  it('no case of K3 or K4 names a plank, a bridge or a gap (they are not about a walkway)', () => {
    for (const key of [K.rendezvous, K.equipes])
      for (const c of shownCases(F(key))) {
        for (const s of [c.text, F(key).text.fact(c), F(key).text.ask(c)])
          expect(s, s).not.toMatch(/planche|pont|fossé/i);
        expect(c.pair).toBeUndefined();
      }
  });
});
