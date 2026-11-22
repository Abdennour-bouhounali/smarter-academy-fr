import { describe, it, expect } from 'vitest';
import {
  QUANTITIES,
  CONDITIONS,
  holds,
  ruleSays,
  isTheRule,
  ruleText,
  explain,
  evidence,
  runOnEvidence,
  attacks,
  predictCases,
  nudge,
  longCase,
  checkDivision,
  remainderForge,
  outcome,
} from './ruleForge';
import { complete, streak, discoveryLevel } from '../kit/forge';

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
const FORGE = remainderForge('a-key');
const RULES = QUANTITIES.flatMap((q) => CONDITIONS.map((c) => ({ q: q.id, c: c.id })));
const THE = { q: 'r', c: 'zero' };
/** A crossing as the story gives it: 15 with 3, 16 with 3 (one cell left), 16 with 4, 42 with 4 (two left), 42 with 6. */
const LOG = [
  { a: 15, b: 3 },
  { a: 16, b: 3 },
  { a: 16, b: 4 },
  { a: 42, b: 4 },
  { a: 42, b: 6 },
];

describe('مصهر القاعدة — the rule forge', () => {
  it('sixteen rules can be written and exactly ONE is the rule: it agrees with every bridge', () => {
    expect(RULES).toHaveLength(16);
    const always = RULES.filter((rule) => {
      for (let a = 2; a <= 60; a += 1)
        for (let b = 1; b <= a; b += 1) if (ruleSays(rule, a, b) !== holds(a, b)) return false;
      return true;
    });
    expect(always).toEqual([THE]);
    expect(isTheRule(THE)).toBe(true);
    expect(RULES.filter(isTheRule)).toHaveLength(1);
    expect(ruleText(THE)).toBe('يثبت الجسر عندما: باقي قسمة طول الهوّة على طول اللوح يساوي 0.');
    expect(complete(FORGE, { q: 'r' })).toBe(false);
    expect(complete(FORGE, null)).toBe(false);
    expect(complete(FORGE, THE)).toBe(true);
    expect(allRules(FORGE)).toHaveLength(16); // the law of the world, as a forge of the kit: the same sixteen rules
    expect(allRules(FORGE).filter(FORGE.isTheRule)).toEqual([THE]);
  });

  it('keeps the student’s crossing as evidence — his own bridges are never pushed out by those of the mirror', () => {
    const rows = evidence([...LOG, { a: 42, b: 4 }]);
    expect(rows.map((r) => `${r.a}/${r.b}:${r.held ? 'held' : r.r}`)).toEqual([
      '15/3:held',
      '16/3:1',
      '16/4:held',
      '42/6:held',
      '42/4:2',
    ]); // a bridge fired twice is kept once, at its last place
    expect(rows.every((r) => r.mirror === false)).toBe(true);
    const mirror = Array.from({ length: 6 }, (_, i) => ({ a: 20 + i, b: 3, mirror: true }));
    const both = evidence([...LOG, ...mirror]);
    expect(both).toHaveLength(8);
    expect(both.slice(0, 5).map((r) => `${r.a}/${r.b}`)).toEqual(['15/3', '16/3', '16/4', '42/4', '42/6']);
    expect(both.slice(5).map((r) => r.a)).toEqual([23, 24, 25]);
    expect(evidence(Array.from({ length: 9 }, (_, i) => ({ a: 30 + i, b: 4 })))).toHaveLength(5); // his own: the last five
    expect(
      evidence([
        { a: 18, b: 4, mirror: true },
        { a: 18, b: 4 },
      ])[0].mirror,
    ).toBe(false); // a bridge he then builds himself is his
  });

  it('runs a rule on the evidence and stops on the first bridge that contradicts it', () => {
    const rows = evidence(LOG);
    expect(runOnEvidence(THE, rows).bad).toBe(-1);
    const parity = runOnEvidence({ q: 'b', c: 'even' }, rows); // « the plank is even »: 15 with 3 held, and 3 is odd
    expect(parity.bad).toBe(0);
    expect(parity.marks[0]).toMatchObject({ a: 15, b: 3, held: true, says: false, agrees: false });
    const weak = runOnEvidence({ q: 'r', c: 'lessB' }, rows); // « the remainder is smaller than the plank »: always true, so it says every bridge holds
    expect(weak.marks.every((m) => m.says)).toBe(true);
    expect(weak.bad).toBe(1);
    // every false rule is contradicted by the story's crossing or by an attack — none can be sealed
    for (const rule of RULES.filter((r) => !isTheRule(r)))
      expect(runOnEvidence(rule, rows).bad >= 0 || attacks(rule, rows).length === 1, JSON.stringify(rule)).toBe(true);
  });

  it('attacks a false rule with a NEW gap where it fails, and the right rule with two hard gaps it survives', () => {
    const rows = evidence(LOG);
    for (const rule of RULES.filter((r) => !isTheRule(r))) {
      const [c] = attacks(rule, rows);
      expect(c, JSON.stringify(rule)).toBeTruthy();
      expect(ruleSays(rule, c.a, c.b)).not.toBe(c.held);
      expect(rows.some((r) => r.a === c.a && r.b === c.b)).toBe(false);
      expect(c.a).toBeLessThanOrEqual(30);
      expect(c).toEqual(outcome(c.a, c.b));
    }
    const hard = attacks(THE, rows);
    expect(hard).toHaveLength(2);
    expect(hard[0].held).toBe(false);
    expect(hard[0].a % 2 === 0 && hard[0].b % 2 === 0).toBe(true); // two even numbers, and it crumbles
    expect(hard[1].held).toBe(true);
    expect(hard[1].b % 2).toBe(1); // an odd plank, and it holds
    for (const c of hard) expect(ruleSays(THE, c.a, c.b)).toBe(c.held);
    expect(attacks({ q: 'r', c: 'even' }, rows)[0].held).toBe(false); // a rule that says « holds » is refuted by a bridge that FALLS
  });

  it('explains what HIS rule says of a bridge, in words', () => {
    expect(explain(THE, 18, 4)).toBe('باقي قسمة 18 على 4 هو 2، و 2 لا يساوي 0: قاعدتك تقول إنّ الجسر ينهار.');
    expect(explain({ q: 'b', c: 'even' }, 18, 4)).toBe('طول اللوح هو 4، و 4 عدد زوجي: قاعدتك تقول إنّ الجسر يثبت.');
    for (const rule of RULES) expect(explain(rule, 21, 7)).not.toMatch(/undefined|NaN/);
  });

  it('asks predictions on bridges he has not built, which hold and crumble in turn', () => {
    for (let seed = 1; seed <= 40; seed += 1) {
      const rows = evidence(LOG);
      const list = predictCases(rows, rng(seed));
      expect(list.length).toBeGreaterThanOrEqual(5);
      expect(list.map((c) => c.held).slice(0, 4)).toEqual([true, false, true, false]);
      for (const c of list) {
        expect(rows.some((r) => r.a === c.a && r.b === c.b)).toBe(false);
        expect(c).toEqual(outcome(c.a, c.b));
      }
      expect(new Set(list.map((c) => c.a)).size).toBe(list.length); // never twice the same gap: the answer is not read off the one before
      expect(list[1].a % 2 === 0 && list[1].b % 2 === 0).toBe(true); // the trap of the even numbers comes second
    }
    expect([
      streak([]),
      streak([true, true, false]),
      streak([false, true, true, true]),
      streak([true, false, true]),
    ]).toEqual([0, 0, 3, 1]);
  });

  it('the robot helps without ever giving the rule', () => {
    const rows = evidence(LOG);
    expect(nudge(1, rows)).toMatchObject({
      kind: 'compare',
      cases: [
        { a: 16, b: 4, held: true },
        { a: 16, b: 3, held: false },
      ],
    });
    expect(
      nudge(
        1,
        evidence([
          { a: 15, b: 3 },
          { a: 16, b: 4 },
        ]),
      ).kind,
    ).toBe('experiment'); // nothing to compare in his crossing: an experiment instead
    const exp = nudge(2, rows);
    expect(exp.kind).toBe('experiment');
    expect(exp.cases.map((c) => c.held)).toEqual([true, false]);
    expect(exp.cases[1].a).toBe(exp.cases[0].a + 1);
    expect(exp.cases[1].r).toBe(1);
    const choice = nudge(3, rows);
    expect(choice.kind).toBe('choice');
    expect(choice.rules.filter(isTheRule)).toHaveLength(1);
    expect(choice.rules).toHaveLength(2);
    expect([discoveryLevel(0), discoveryLevel(1), discoveryLevel(2), discoveryLevel(3)]).toEqual([
      'alone',
      'nudged',
      'nudged',
      'guided',
    ]);
  });

  it('ends on a gap too long to count, decided by the rule', () => {
    const seen = new Set();
    for (let seed = 1; seed <= 60; seed += 1) {
      const c = longCase(rng(seed * 104729));
      seen.add(c.held);
      expect(c.a).toBeGreaterThan(90);
      expect(checkDivision(c, { q: String(c.q), r: String(c.r) }, c.held)).toBe('ok');
      expect(checkDivision(c, { q: c.q, r: c.r }, !c.held)).toBe('verdict');
      expect(checkDivision(c, { q: c.q - 1, r: c.r + c.b }, c.held)).toBe('big');
      expect(checkDivision(c, { q: c.q + 1, r: c.r }, c.held)).toBe('sum');
    }
    expect(seen.size).toBe(2);
  });
});
