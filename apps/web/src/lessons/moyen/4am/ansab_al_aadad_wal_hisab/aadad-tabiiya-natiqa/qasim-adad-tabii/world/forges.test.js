import { describe, it, expect } from 'vitest';
import { complete, runOn, testsOf, ruleKey } from '../../../../../../common/gameworld/kit/forge';
import { FORGES } from './forges';
import { KEYS } from './journey';

/** Every rule that can be written with the tiles of a forge (the product of its slots' options). */
const allRules = (forge) =>
  forge.slots.reduce((rules, s) => rules.flatMap((rule) => s.options.map((o) => ({ ...rule, [s.id]: o.id }))), [{}]);
const rng = (seed) => {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};
/** The crossing as the story gives it when the last mirror opens: the bridges fired on the way, held or not. */
const LOG = [
  { a: 15, b: 3 },
  { a: 16, b: 3 },
  { a: 16, b: 4 },
  { a: 42, b: 4 },
  { a: 42, b: 6 },
  { a: 48, b: 6 },
  { a: 48, b: 8 },
  { a: 120, b: 6 },
  { a: 7, b: 2 },
  { a: 7, b: 1 },
];
/** What a student who holds the rule writes at the last step of each forge. */
const SOLVE = {
  'qasim-baqi': (c) => [{ q: c.q, r: c.r }, c.held],
  'qasim-jidaa': (c) => [{ k: c.q, p: c.b * c.q }, c.held],
  'siyagh-mutakafia': (c) => [
    {
      'qasim.x': c.b,
      'qasim.y': c.a,
      'yaqsim.x': c.q,
      'yaqsim.y': c.a,
      'yaqbal.x': c.a,
      'yaqbal.y': c.b,
      'mudaaf.x': c.a,
      'mudaaf.y': c.q,
    },
    null,
  ],
  'wahid-wa-nafsuh': (c) => [{ x: c.a, y: 1 }, null],
};
const clean = (text) => expect(String(text)).not.toMatch(/undefined|NaN|\[object/);

describe('the four forges of the lesson — no rule is told', () => {
  it('there is one forge per key of the lesson', () => {
    expect(Object.keys(FORGES)).toEqual(KEYS);
    for (const key of KEYS) expect(FORGES[key].key).toBe(key);
  });

  for (const key of Object.keys(FORGES)) {
    const F = FORGES[key];
    const rows = F.evidence(LOG);
    const rules = allRules(F);
    const THE = rules.filter(F.isTheRule);

    describe(key, () => {
      it('many rules can be written with the tiles and exactly ONE holds', () => {
        expect(rules).toHaveLength(16);
        expect(THE).toHaveLength(1);
        for (const rule of rules) expect(complete(F, rule), ruleKey(F, rule)).toBe(true);
        expect(complete(F, { ...THE[0], [F.slots[0].id]: null })).toBe(false);
        expect(rows.length).toBeGreaterThanOrEqual(4);
      });

      it('every false rule is contradicted in front of the student — by his evidence or by an attack; none can be sealed', () => {
        for (const rule of rules.filter((r) => !F.isTheRule(r))) {
          const run = runOn(F, rule, testsOf(F, rule, rows));
          if (run.bad >= 0) continue;
          const [c] = F.attacks(rule, rows);
          expect(c, ruleKey(F, rule)).toBeTruthy();
          expect(F.says(rule, c), ruleKey(F, rule)).not.toBe(c.held);
          expect(rows.some((row) => F.caseId(row) === F.caseId(c))).toBe(false); // a NEW case
        }
      });

      it('the right rule agrees with all his evidence and survives two hard attacks', () => {
        expect(runOn(F, THE[0], testsOf(F, THE[0], rows)).bad).toBe(-1);
        const hard = F.attacks(THE[0], rows);
        expect(hard).toHaveLength(2);
        for (const c of hard) {
          expect(F.says(THE[0], c)).toBe(c.held);
          expect(rows.some((row) => F.caseId(row) === F.caseId(c))).toBe(false);
        }
      });

      it('asks predictions on cases he has not seen, which hold and fail in turn', () => {
        for (let seed = 1; seed <= 40; seed += 1) {
          const list = F.predictCases(rows, rng(seed * 7919));
          expect(list.length).toBeGreaterThanOrEqual(5);
          expect(list.map((c) => c.held).slice(0, 4)).toEqual([true, false, true, false]);
          expect(new Set(list.map(F.caseId)).size).toBe(list.length);
          for (const c of list) {
            expect(Number.isInteger(c.a) && Number.isInteger(c.b) && c.a >= 1 && c.b >= 1, F.caseId(c)).toBe(true);
            expect(rows.some((row) => F.caseId(row) === F.caseId(c))).toBe(false);
            expect(Math.max(c.a, c.b)).toBeLessThanOrEqual(60); // the mirror can draw it
            clean(F.text.ask(c));
            clean(F.text.fact(c));
            clean(F.text.eq(c) ?? '');
          }
        }
      });

      it('says every rule and applies it to a case in words, and words every moment of the forge', () => {
        const cases = [...rows, ...F.predictCases(rows, rng(11))];
        for (const rule of rules) {
          clean(F.ruleText(rule));
          for (const c of testsOf(F, rule, rows)) clean(F.explain(rule, c));
          for (const c of cases) if (!F.tests) clean(F.explain(rule, c));
        }
        const T = F.text;
        for (const k of ['title', 'sub', 'log', 'yes', 'no', 'next', 'frame', 'buildLead', 'testing', 'agreed', 'fire'])
          expect(typeof T[k], `${key} text.${k}`).toBe('string');
        for (const k of ['survived', 'wordsHint', 'experiment', 'useOk'])
          expect(typeof T[k], `${key} text.${k}`).toBe('string');
        for (const c of cases) {
          clean(T.attack(c));
          clean(T.refuted({ ...c, says: !c.held }));
        }
        for (const yes of [true, false]) {
          clean(T.says(yes));
          clean(T.broken(yes));
        }
      });

      it('the robot helps without ever giving the rule', () => {
        const kinds = [1, 2, 3].map((n) => F.nudge(n, rows));
        expect(kinds[2].kind).toBe('choice');
        expect(kinds[2].rules).toHaveLength(2);
        expect(kinds[2].rules.filter(F.isTheRule)).toHaveLength(1);
        expect(F.isTheRule(kinds[2].rules[0])).toBe(false); // the first of the two is the false one
        for (const h of kinds.slice(0, 2)) {
          expect(['compare', 'experiment']).toContain(h.kind);
          expect(h.cases).toHaveLength(2);
          clean(h.kind === 'compare' ? F.text.compare(h.cases) : F.text.experiment);
        }
      });

      it('ends on a case the mirror does not build: the rule decides, typed in its own shape', () => {
        for (let seed = 1; seed <= 40; seed += 1) {
          const c = F.use.make(rng(seed * 104729));
          const [vals, verdict] = SOLVE[key](c);
          const lines = F.use.lines(c);
          const slots = lines.flatMap((l) => l.tokens.filter((t) => typeof t === 'object').map((t) => t.slot));
          expect(slots.sort()).toEqual(Object.keys(vals).sort());
          expect(Boolean(F.use.verdict)).toBe(verdict !== null);
          expect(
            F.use.check(c, Object.fromEntries(Object.entries(vals).map(([k, v]) => [k, String(v)])), verdict),
          ).toBe('ok');
          clean(F.text.tryKey(c));
          // any single box changed is refused, with a sentence of the forge that never gives the answer
          for (const name of slots) {
            const fb = F.use.check(c, { ...vals, [name]: Number(vals[name]) + 100 }, verdict); // never another right number
            expect(fb, `${key} ${name}`).not.toBe('ok');
            expect(typeof F.text.use[fb], `${key} text.use.${fb}`).toBe('string');
          }
          if (F.use.verdict) expect(typeof F.text.use[F.use.check(c, vals, !verdict)]).toBe('string');
        }
      });
    });
  }
});
