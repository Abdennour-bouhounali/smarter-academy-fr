import { describe, it, expect } from 'vitest';
import { complete, runOn, testsOf, ruleKey } from '../../../../../../common/gameworld/kit/forge';
import {
  joinOf,
  stackOf,
  peelOf,
  fitsRow,
  judgePeelClaim,
  refuteCard,
} from '../../../../../../common/gameworld/divisorIsles/inquiry';
import { FORGES } from './forges';
import { KEYS } from './journey';
import { JOIN_INQUIRY, STACK_INQUIRY, PEEL_INQUIRY, LETTERS_INQUIRY } from './inquiries';

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
const clean = (text) => expect(String(text)).not.toMatch(/undefined|NaN|\[object/);
/** What the screen writes as PLAIN text (not through MathText) never carries a formula: no raw LaTeX on screen. */
const plain = (text) => {
  clean(text);
  expect(text, text).not.toMatch(/\$|\\/);
};

/** What each investigation hands back when the student plays it through (the facts are the world's, computed). */
const RESULTS = {
  'jam-wal-farq': {
    rounds: JOIN_INQUIRY.rounds.map((r) => {
      const d = r.d ?? JOIN_INQUIRY.d;
      const { holds } = joinOf(d, r.a, r.b, r.op);
      return { op: r.op, a: r.a, b: r.b, d, guess: true, holds };
    }),
  },
  madaaf: {
    rounds: [STACK_INQUIRY, STACK_INQUIRY.free].flatMap((r) =>
      r.times.map((k) => ({ d: r.d, base: r.base, k, guess: true, holds: stackOf(r.d, r.base, k).holds })),
    ),
  },
  'baqi-qisma': {
    rounds: PEEL_INQUIRY.rounds.map(({ a, b, candidates }) => ({
      a,
      b,
      ...peelOf(a, b),
      rows: candidates.map((d) => {
        const f = fitsRow(a, b, d);
        return { d, fitsA: f.a, fitsB: f.b, fitsR: f.r, guess: true };
      }),
    })),
    claim: { cols: ['a', 'b'], link: 'and' },
  },
  burhan: { order: LETTERS_INQUIRY.order, tries: 0, refuted: [] },
};
/** What a student who holds the rule writes at the last step of each forge. */
const SOLVE = {
  'jam-wal-farq': (c) => ({ x: (c.A + c.B) / c.d, y: (c.A - c.B) / c.d }),
  madaaf: (c) => ({ x: (c.k * c.base) / c.d }),
  'baqi-qisma': (c) => ({ q: Math.floor(c.A / c.B), r: c.A % c.B, k: (c.A % c.B) / c.d }),
  burhan: (c) => ({ x: 3 * c.k + 2 * c.k2, y: c.k + c.k2 }),
};
/** The forges whose rule he writes with TILES, and how many rules their tiles allow. */
const TILES = { 'jam-wal-farq': 16, madaaf: 16 };
/** The forges whose EXPERIMENT writes the rule: no tile to choose, the mirror attacks at once. */
const WRITTEN = ['baqi-qisma', 'burhan'];
const rowsOf = (key) => FORGES[key].evidence(FORGES[key].fromInquiry(RESULTS[key]).rows);

describe('the four forges of « خواص قواسم عدد طبيعي » — no rule is told', () => {
  it('there is one forge per key of the lesson, each opening on an investigation that holds the predictions', () => {
    expect(Object.keys(FORGES)).toEqual(KEYS);
    expect([...Object.keys(TILES), ...WRITTEN]).toEqual(KEYS);
    for (const key of KEYS) {
      const F = FORGES[key];
      expect(F.key).toBe(key);
      expect(F.inquiry?.kind, key).toBeTruthy();
      expect(typeof F.fromInquiry).toBe('function');
      expect(Boolean(F.inquiry.writes), key).toBe(WRITTEN.includes(key));
      // the kit asks every forge for predictions (RuleForge): none is asked after an experiment
      expect(F.predictCases(rowsOf(key)), key).toEqual([]);
      const out = F.fromInquiry(RESULTS[key]);
      expect(rowsOf(key)).toHaveLength(out.rows.length); // nothing he did is lost
      expect(out.rows.length).toBeGreaterThanOrEqual(2);
    }
  });

  for (const key of Object.keys(TILES)) {
    const F = FORGES[key];
    const out = F.fromInquiry(RESULTS[key]);
    const rows = rowsOf(key);
    const rules = allRules(F);
    const THE = rules.filter(F.isTheRule);

    describe(`${key} — he writes his rule with tiles`, () => {
      it('many rules can be written with the tiles and exactly ONE holds', () => {
        expect(rules).toHaveLength(TILES[key]);
        expect(THE).toHaveLength(1);
        for (const rule of rules) expect(complete(F, rule), ruleKey(F, rule)).toBe(true);
        expect(complete(F, { ...THE[0], [F.slots[0].id]: null })).toBe(false);
        expect(out.rule).toBeUndefined(); // the experiment leaves the tiles to him
      });

      it('EVERY false rule is refuted in front of him — by what he did, or by a new case the world computes', () => {
        let onEvidence = 0;
        let byAttack = 0;
        for (const rule of rules.filter((r) => !F.isTheRule(r))) {
          const run = runOn(F, rule, testsOf(F, rule, rows));
          if (run.bad >= 0) {
            const m = run.marks[run.bad];
            expect(m.says, ruleKey(F, rule)).not.toBe(m.held);
            plain(F.text.refuted(m));
            clean(F.explain(rule, m));
            onEvidence += 1;
            continue;
          }
          const [c] = F.attacks(rule, rows);
          expect(c, ruleKey(F, rule)).toBeTruthy();
          expect(F.says(rule, c), ruleKey(F, rule)).not.toBe(c.held);
          expect(rows.some((row) => F.caseId(row) === F.caseId(c))).toBe(false); // a NEW case
          // a gap the mirror can draw, never one of a few cells no plank could be laid on
          expect(c.a, F.caseId(c)).toBeGreaterThanOrEqual(3);
          expect(c.a, F.caseId(c)).toBeLessThanOrEqual(126);
          clean(F.text.attack(c));
          plain(F.text.broken(F.says(rule, c)));
          byAttack += 1;
        }
        expect(onEvidence + byAttack).toBe(TILES[key] - 1);
        // both ways are lived: a rule his own rows refute, and a rule only a new case breaks
        expect(onEvidence).toBeGreaterThan(0);
        expect(byAttack).toBeGreaterThan(0);
      });

      it('the right rule agrees with all his evidence and survives two hard attacks', () => {
        const run = runOn(F, THE[0], testsOf(F, THE[0], rows));
        expect(run.bad).toBe(-1);
        expect(run.marks.length).toBeGreaterThanOrEqual(2);
        const hard = F.attacks(THE[0], rows);
        expect(hard).toHaveLength(2);
        for (const c of hard) {
          expect(F.says(THE[0], c)).toBe(c.held);
          expect(rows.some((row) => F.caseId(row) === F.caseId(c))).toBe(false);
        }
      });

      it('says every rule and applies it to a case in words, and words every moment of the forge', () => {
        for (const rule of rules) {
          plain(F.ruleText(rule));
          for (const c of [...rows, ...F.attacks(rule, rows)]) clean(F.explain(rule, c));
        }
        for (const s of F.slots) for (const o of s.options) plain(o.label);
        const T = F.text;
        for (const k of ['title', 'sub', 'log', 'yes', 'no', 'frame', 'buildLead', 'testing', 'agreed', 'fire'])
          plain(T[k]);
        for (const k of ['survived', 'wordsHint', 'experiment', 'useOk']) plain(T[k]);
        for (const c of [...rows, ...F.attacks(THE[0], rows)]) {
          clean(T.attack(c));
          plain(T.refuted({ ...c, says: !c.held }));
          clean(T.eq(c));
        }
        for (const yes of [true, false]) {
          plain(T.says(yes));
          plain(T.broken(yes));
        }
        for (const x of Object.values(T.use)) plain(x);
      });

      it('the robot helps without ever giving the rule: three more pairs of cases, never a choice of rules', () => {
        for (const n of [1, 2, 3]) {
          const h = F.nudge(n, rows);
          expect(h.kind).toBe('experiment');
          expect(h.cases).toHaveLength(2);
          for (const c of h.cases) {
            expect(Math.max(c.a, c.b)).toBeLessThanOrEqual(126); // the mirror can draw it
            expect(typeof c.held).toBe('boolean');
            clean(F.text.eq(c)); // what the mirror writes under the case it built
            expect(rows.some((row) => F.caseId(row) === F.caseId(c))).toBe(false); // a case he has not made
          }
          // each pair shows two different outcomes or two sides of one fact: never twice the same case
          expect(F.caseId(h.cases[0])).not.toBe(F.caseId(h.cases[1]));
        }
        // what the robot says points at what to LOOK at; it holds none of the words of the tiles that make the rule
        plain(F.text.experiment);
        const THE_RULE = allRules(F).find(F.isTheRule);
        for (const s of F.slots) {
          const label = s.options.find((o) => o.id === THE_RULE[s.id]).label;
          expect(F.text.experiment, key).not.toContain(label);
        }
      });
    });
  }

  for (const key of WRITTEN) {
    const F = FORGES[key];
    const out = F.fromInquiry(RESULTS[key]);
    const rows = rowsOf(key);

    describe(`${key} — the rule he wrote in the experiment is attacked at once`, () => {
      it('offers no tile to choose: the one rule its tiles write is the rule the experiment hands the mirror', () => {
        const rules = allRules(F);
        expect(rules).toHaveLength(1);
        expect(F.isTheRule(rules[0])).toBe(true);
        expect(out.rule).toEqual(rules[0]);
        expect(complete(F, out.rule)).toBe(true);
        expect(F.isTheRule({ ...out.rule, [F.slots[0].id]: 'other' })).toBe(false);
        // what the kit never reaches in such a forge is not written: no help, no test on his rows
        expect(F.nudge).toBeUndefined();
        expect(F.tests).toBeUndefined();
        plain(F.ruleText(out.rule));
        for (const s of F.slots) for (const o of s.options) plain(o.label);
      });

      it('the mirror attacks it with two cases he has not seen, and the world does what his rule says', () => {
        const hard = F.attacks(out.rule, rows);
        expect(hard).toHaveLength(2);
        expect(new Set(hard.map(F.caseId)).size).toBe(2);
        for (const c of hard) {
          expect(typeof c.held).toBe('boolean');
          expect(F.says(out.rule, c), F.caseId(c)).toBe(c.held);
          expect(rows.some((row) => F.caseId(row) === F.caseId(c))).toBe(false);
          expect(Number.isInteger(c.a) && Number.isInteger(c.b) && c.a >= 1 && c.b >= 1, F.caseId(c)).toBe(true);
          expect(Math.max(c.a, c.b)).toBeLessThanOrEqual(126); // the mirror can draw it
          clean(F.text.attack(c));
          clean(F.explain(out.rule, c));
          clean(F.text.eq(c));
        }
        const T = F.text;
        for (const k of ['title', 'sub', 'log', 'yes', 'no', 'frame', 'fire', 'survived', 'wordsHint', 'useOk'])
          plain(T[k]);
        for (const yes of [true, false]) plain(T.says(yes));
        for (const x of Object.values(T.use)) plain(x);
      });
    });
  }

  for (const key of KEYS) {
    const F = FORGES[key];
    it(`${key}: ends on a case the mirror does not build — the rule decides, typed in its own shape`, () => {
      for (let seed = 1; seed <= 25; seed += 1) {
        const c = F.use.make(rng(seed * 104729));
        const vals = SOLVE[key](c);
        for (const v of Object.values(vals)) expect(Number.isInteger(v) && v >= 0).toBe(true);
        const slots = F.use.lines(c).flatMap((l) => l.tokens.filter((t) => typeof t === 'object').map((t) => t.slot));
        expect(slots.sort()).toEqual(Object.keys(vals).sort());
        expect(F.use.check(c, Object.fromEntries(Object.entries(vals).map(([k, v]) => [k, String(v)])))).toBe('ok');
        clean(F.text.tryKey(c));
        for (const name of slots) {
          const fb = F.use.check(c, { ...vals, [name]: Number(vals[name]) + 100 });
          expect(fb, `${key} ${name}`).not.toBe('ok');
          expect(typeof F.text.use[fb], `${key} text.use.${fb}`).toBe('string');
        }
      }
    });
  }
});

describe('the false rules students really hold can be written — and the world refutes each', () => {
  /** The rule is refuted in front of him: on his evidence, or by the first attack. */
  const refutedBy = (key, rule) => {
    const F = FORGES[key];
    const rows = rowsOf(key);
    const run = runOn(F, rule, testsOf(F, rule, rows));
    return run.bad >= 0 ? run.marks[run.bad] : F.attacks(rule, rows)[0];
  };

  it('« the sum of two gaps always holds » falls on a gap the plank fills alone; « only the difference » on 56', () => {
    const always = refutedBy('jam-wal-farq', { if: 'any', then: 'both' });
    expect(always.held).toBe(false);
    expect(always.fa !== always.fb).toBe(true);
    const onlyDiff = refutedBy('jam-wal-farq', { if: 'both', then: 'diff' });
    expect([onlyDiff.op, onlyDiff.a, onlyDiff.held]).toEqual(['sum', 56, true]);
  });

  it('« if the plank fills neither, the glued gap fails » falls on 22 + 20 = 42 with the plank 7', () => {
    const c = refutedBy('jam-wal-farq', { if: 'none', then: 'neither' });
    expect([c.A, c.B, c.d, c.a, c.held]).toEqual([22, 20, 7, 42, true]);
    expect(joinOf(7, 22, 20, 'sum')).toMatchObject({ fillsA: false, fillsB: false, holds: true });
  });

  it('« if the plank fills neither, it fills the glued gap » agrees with all he made — only a NEW pair breaks it', () => {
    // the rule 22 + 20 invites: his six gaps agree with it, the mirror must look for the pair that does not
    const F = FORGES['jam-wal-farq'];
    const rule = { if: 'none', then: 'sum' };
    const rows = rowsOf('jam-wal-farq');
    expect(runOn(F, rule, testsOf(F, rule, rows)).bad).toBe(-1);
    const [c] = F.attacks(rule, rows);
    expect(c.op).toBe('sum');
    expect(c.A % c.d !== 0 && c.B % c.d !== 0).toBe(true);
    expect((c.A + c.B) % c.d).not.toBe(0);
    expect(c.held).toBe(false);
    expect(F.says(rule, c)).toBe(true);
  });

  it('« two copies are filled, so the gap itself must be » falls on 14 and 21', () => {
    const c = refutedBy('madaaf', { if: 'two', then: 'all' });
    expect([c.d, c.base, c.held]).toEqual([14, 21, false]);
    expect(stackOf(14, 21, 2).holds).toBe(true);
    expect(stackOf(14, 21, 1).holds).toBe(false);
  });

  it('the false rules of the two written keys are refuted IN the experiment: a claim by its planks, a card by numbers', () => {
    // « باقي القسمة »: the gap alone, the bridge alone, the gap OR the bridge — each takes in a plank that leaves the piece
    for (const claim of [
      { cols: ['a'], link: 'and' },
      { cols: ['b'], link: 'and' },
      { cols: ['a', 'b'], link: 'or' },
    ]) {
      const judge = judgePeelClaim(PEEL_INQUIRY.rounds, claim);
      expect(judge.ok).toBe(false);
      expect(judge.intruders.length).toBeGreaterThan(0);
      for (const f of judge.intruders) expect((f.gap % f.bridge) % f.d).not.toBe(0);
    }
    expect(judgePeelClaim(PEEL_INQUIRY.rounds, RESULTS['baqi-qisma'].claim).ok).toBe(true);
    // « البرهان »: one example, the same letter twice, a product, a sum — each false line meets numbers it fails on
    const decoys = LETTERS_INQUIRY.cards.filter((c) => !c.ok);
    expect(decoys.map((c) => c.id).sort()).toEqual(['one', 'plus', 'samek', 'times']);
    for (const c of decoys) expect(refuteCard(c, LETTERS_INQUIRY.samples), c.id).not.toBe(null);
  });

  it('the mirror of the proof tries statements whose truth is computed: one falls on numbers, one holds on all', () => {
    const F = FORGES.burhan;
    const [trap, sure] = F.attacks({ how: 'two' }, rowsOf('burhan'));
    // « d divides a » alone says nothing of a + b: 7 divides 21, not 21 + 5
    expect(trap.held).toBe(false);
    expect(trap.nums).toEqual({ d: 7, a: 21, b: 5 });
    expect(21 % 7 === 0 && (21 + 5) % 7 !== 0).toBe(true);
    expect([trap.a, trap.b, trap.q, trap.r]).toEqual([26, 7, 3, 5]);
    expect(F.text.eq(trap)).toBe('$21 + 5 = 26 = 7 \\times 3 + 5$');
    // « d divides a and b, so it divides 2a + 3b »: true of every multiple of d
    expect(sure.held).toBe(true);
    for (let d = 1; d <= 12; d += 1)
      for (let k = 0; k <= 12; k += 1) for (let k2 = 0; k2 <= 12; k2 += 1) expect((2 * d * k + 3 * d * k2) % d).toBe(0);
    expect(sure.nums).toEqual({ d: 4, a: 8, b: 12 });
    expect(F.text.eq(sure)).toBe('$2 \\times 8 + 3 \\times 12 = 52 = 4 \\times 13 + 0$');
    // his own evidence: the statement he proved holds, the converse island A showed him falls on 22 + 20 with 7
    const [proved, converse] = rowsOf('burhan');
    expect([proved.held, converse.held]).toEqual([true, false]);
    expect(converse.nums).toEqual({ d: 7, a: 22, b: 20 });
    expect((22 + 20) % 7 === 0 && 22 % 7 !== 0).toBe(true);
  });
});
