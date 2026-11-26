// « Entraîne-toi » of multiples-et-diviseurs-communs: the shared checks (authoring kit), then the lesson's own — every wrong
// reason of « Justifie » is FALSE, the questions hold the numbers they announce, no draw lands on a number of the road, the
// misconceptions of the bank (the product, 0, the smaller exponent, the turns swapped, the rest days as the cycle, the day
// count from 0, the clock time, the tool) are each refused with a hint that says what the answer gives, and no sentence
// writes the abbreviation of the design's version A.
import { describe, it, expect } from 'vitest';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { describeTrainer, stringsIn, valueOf } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { gcd, lcm, lcmOf, powTex } from './math';
import { KNOWLEDGE } from './knowledge';
import { trainerEvidence } from './evidence';
import { PLAN_OF, RESERVED, answerLabel, check, solution, trainer } from './trainer';

const CARDS = KNOWLEDGE.graph.nodes.map((n) => n.id);
const all = function* (seeds = 25) {
  for (const card of CARDS)
    for (let seed = 1; seed <= seeds; seed += 1)
      for (const q of trainer.makeSession(rng(seed * 104729 + 1), card)) yield q;
};
const KINDS = ['tap', 'tf', 'pilier', 'facteurs', 'rendezvous', 'horaire', 'fenetre', 'jours', 'outil', 'budget'];

describeTrainer({
  trainer,
  check,
  solution,
  answerLabel,
  evidenceOf: trainerEvidence,
  planOf: PLAN_OF,
  cards: CARDS,
  kinds: KINDS,
});

/** Is a reason a TRUE equality « $x = y$ » (powers read by the kit's `valueOf`)? null when it is none. */
function holds(reason) {
  const eq = reason.match(/\$([^$]+)\$/);
  if (!eq) return null;
  const sides = eq[1].split('=').map((s) => valueOf(s));
  if (sides.length !== 2 || sides.some((v) => v == null)) return null;
  return sides[0] === sides[1];
}
const wrongOf = (q, field, delta) => ({ ...solution(q), [field]: solution(q)[field] + delta });

describe('multiples-et-diviseurs-communs — its own trainer', () => {
  it('every wrong reason offered to « Justifie » is a FALSE equality; the verdicts are computed', () => {
    let n = 0;
    const flavours = new Set();
    for (const q of all())
      if (q.kind === 'tf') {
        flavours.add(q.flavour);
        expect(q.lies).toHaveLength(2);
        for (const l of q.lies) {
          expect(holds(l), `${q.statement} — ${l}`).toBe(false);
          n += 1;
        }
        if (q.reasons) {
          expect(q.reasons.filter((r) => r.ok)).toHaveLength(1);
          expect(q.reasons).toHaveLength(3);
        }
      }
    expect(n).toBeGreaterThan(200);
    expect([...flavours].sort()).toEqual(['facteurs', 'jours', 'outil', 'pilier', 'rendez']);
  });

  it('the verdict of a « Vrai ou faux ? » is computed: the true ones and the false ones both occur', () => {
    const verdicts = new Set();
    for (const q of all(10)) if (q.kind === 'tf') verdicts.add(`${q.flavour}:${q.truth}`);
    for (const f of ['pilier', 'facteurs', 'rendez', 'jours', 'outil']) {
      expect(verdicts.has(`${f}:true`), f).toBe(true);
      expect(verdicts.has(`${f}:false`), f).toBe(true);
    }
  });

  it('the exam questions hold what they announce, and no draw is a number of the road', () => {
    const seen = new Set();
    for (const q of all()) {
      seen.add(q.kind);
      if (
        q.kind === 'pilier' ||
        q.kind === 'rendezvous' ||
        q.kind === 'horaire' ||
        q.kind === 'fenetre' ||
        q.kind === 'outil' ||
        q.kind === 'budget'
      ) {
        expect(q.m, q.prompt).toBe(lcm(q.a, q.b));
        for (const x of [q.a, q.b, q.m]) expect(x < 10 || !RESERVED.has(x), `${q.kind} ${x}`).toBe(true);
        expect(q.m % q.a === 0 && q.m % q.b === 0).toBe(true);
      }
      if (q.kind === 'horaire') {
        expect(q.arrival).toBe(q.startMin + q.m);
        expect(q.arrival).toBeLessThan(24 * 60);
      }
      if (q.kind === 'fenetre') {
        expect(q.count).toBe(Math.floor(q.window / q.m));
        expect(q.window).toBeLessThanOrEqual(3600);
      }
      if (q.kind === 'outil') expect(q.g).toBe(gcd(q.a, q.b));
      if (q.kind === 'budget') {
        expect(q.cost).toBe((q.m / q.a) * q.prices[0] + (q.m / q.b) * q.prices[1]);
        expect(q.count).toBe(Math.floor(q.budget / q.cost));
      }
      if (q.kind === 'facteurs') {
        expect(q.m).toBe(lcmOf(q.values));
        expect(q.big.length).toBeLessThanOrEqual(3);
        expect(q.values.length === 2 || q.more?.length === 1).toBe(true);
        for (const v of q.values) expect(v < 10 || !RESERVED.has(v), `facteurs ${v}`).toBe(true);
        expect(q.values.every((v) => q.m % v === 0)).toBe(true);
        expect(q.values.some((v) => q.m === v)).toBe(false);
      }
      if (q.kind === 'jours') {
        expect(q.m).toBe(lcmOf(q.cycles));
        expect(q.day).toBe(1 + q.m);
        expect(q.cycles).toEqual(q.rests.map((r) => r + 1));
        expect(q.more === undefined || q.more.length === 1).toBe(true);
      }
    }
    expect([...seen].sort()).toEqual([...KINDS].sort());
  });

  it('the coprime pairs happen: the smallest common multiple is then the product', () => {
    let coprime = 0;
    for (const q of all(40)) if (q.kind === 'pilier' && gcd(q.a, q.b) === 1) coprime += 1;
    expect(coprime).toBeGreaterThan(10);
  });

  it('the misconceptions are refused with a hint that says what the answer gives, never the answer', () => {
    for (const q of all(4)) {
      const right = solution(q);
      if (q.kind === 'pilier' || q.kind === 'rendezvous') {
        // 0, the product (when it is not the first), a multiple of one number only, the turns swapped
        expect(check(q, { ...right, m: 0 }).ok).toBe(false);
        if (q.a * q.b !== q.m) {
          const r = check(q, { m: q.a * q.b, x: q.b, y: q.a });
          expect(r.ok).toBe(false);
          expect(r.hint).toMatch(/plus (proche|tôt)/);
        }
        expect(check(q, { ...right, m: q.a }).hint).toMatch(/avant le pilier|dernier tour/);
        expect(check(q, { ...right, x: right.y, y: right.x }).ok).toBe(right.x === right.y);
        expect(check(q, wrongOf(q, 'x', 1)).hint).toMatch(/\d/);
      }
      if (q.kind === 'facteurs') {
        const [f] = q.big;
        expect(check(q, { ...right, [`e${f.p}`]: f.e + 1 }).hint).toMatch(/Aucun des nombres/);
        if (f.e > 1) expect(check(q, { ...right, [`e${f.p}`]: f.e - 1 }).hint).toMatch(/contient plus de facteurs/);
        expect(check(q, { ...right, [`e${f.p}`]: 0 }).hint).toMatch(/exposant 0/);
        expect(check(q, { ...right, g: q.m + 1 }).hint).toMatch(/facteur par facteur/);
      }
      if (q.kind === 'horaire') {
        // the duration given as the hour, 60 minutes confused with 100, an hour of the wrong day
        expect(check(q, { ...right, h: 0, min: q.m }).ok).toBe(false);
        expect(check(q, { ...right, min: 60 }).hint).toMatch(/0 à 59/);
        expect(check(q, { ...right, h: right.h + 1 }).hint).toMatch(/depuis minuit/);
      }
      if (q.kind === 'fenetre') {
        expect(check(q, { ...right, n: right.n + 1 }).hint).toMatch(/trop|serait/);
        expect(check(q, { ...right, n: right.n - 1 }).hint).toMatch(/encore/);
      }
      if (q.kind === 'jours') {
        // the rest days as the cycle, day 1 forgotten, the day counted from 0
        const rests = lcmOf(q.rests);
        if (rests !== q.m) expect(check(q, { m: rests, d: 1 + rests }).hint).toMatch(/cycle/);
        expect(check(q, { m: q.m, d: q.m }).hint).toMatch(/se repose encore/);
        expect(check(q, { m: q.m, d: 1 }).hint).toMatch(/départ/);
        expect(check(q, { m: q.m, d: 1 + 2 * q.m }).hint).toMatch(/déjà ensemble|travaillaient/);
      }
      if (q.kind === 'outil') {
        expect(check(q, { g: q.m, m: q.m }).hint).toMatch(/plus long/);
        expect(check(q, { g: q.g, m: q.g }).hint).toMatch(/aucune roue/);
        expect(check(q, { g: q.m, m: q.g }).ok).toBe(false);
      }
      if (q.kind === 'budget') {
        expect(check(q, { ...right, n: right.n + 1 }).hint).toMatch(/Combien de fois ce prix/);
        expect(check(q, { ...right, m: q.a * q.b }).ok).toBe(q.a * q.b === q.m);
      }
    }
  });

  it('an exponent is typed RAISED after its printed prime: the kit’s power token, one answer of its line', () => {
    let n = 0;
    for (const q of all(5))
      if (q.kind === 'facteurs') {
        const [line] = q.form.lines;
        const pows = line.tokens.filter((t) => t?.pow);
        expect(pows.map((t) => Number(t.pow.base))).toEqual(q.primes);
        for (const t of pows) expect(t.pow.exp.num).toBe(`e${t.pow.base}`);
        expect(line.tokens.filter((t) => t?.num)).toEqual([]);
        expect(q.prompt).toContain(powTex(q.xs[0]));
        n += 1;
      }
    expect(n).toBeGreaterThan(20);
  });

  it('the corrections are bounded (B26): at most three equalities, and the abbreviation is never written', () => {
    for (const q of all(6)) {
      const fix = check(q, solution(q)).fix;
      expect((fix.match(/\$/g) ?? []).length / 2, `${q.kind} ${fix}`).toBeLessThanOrEqual(3);
      for (const s of [q.prompt, fix, ...stringsIn(q.form ?? {})]) expect(s).not.toMatch(/PPCM|ppcm/);
      // the lesson leaves the product of the two results to the next lesson: no sentence holds both words
      expect(`${q.prompt} ${fix}`).not.toMatch(/PGCD[^.]*produit|produit[^.]*PGCD/);
    }
  });
});
