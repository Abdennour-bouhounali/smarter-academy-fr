import { describe, it, expect } from 'vitest';
import { complete, runOn, testsOf, ruleKey } from '../../../../../../common/gameworld/kit/forge';
import { FORGES } from './forges';
import { KEYS } from './journey';
import { STORY, NUMBERS } from './story';
import { UNITS_INQUIRY, SUM_INQUIRY, HUNDREDS_INQUIRY } from './inquiries';

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
const digitSum = (n) =>
  String(n)
    .split('')
    .reduce((s, d) => s + Number(d), 0);

/**
 * What an experiment hands back when the student plays it through — a chart: one reading per plank (what the chart
 * accepted); the gluing: one entry per round, with his prediction and what the plank did.
 */
const resultOf = (spec) =>
  spec.kind === 'join'
    ? {
        rounds: spec.rounds.map((r) => ({
          op: r.op,
          a: r.a,
          b: r.b,
          d: r.d ?? spec.d,
          guess: true,
          holds: (r.a + r.b) % (r.d ?? spec.d) === 0,
        })),
      }
    : { readings: spec.planks.map((p) => ({ b: p.b, lens: p.b % 3 ? 'units' : 'sum', link: p.link })) };
/** The world's log when the last forge opens: the bridges of the story he built, and the moulds that failed. */
const CROSSING = [
  { a: 35, b: 5 },
  { a: 46, b: 5 },
  { a: 46, b: 3 },
  { a: 46, b: 2 },
  { a: 95, b: 5 },
  { a: 81, b: 9 },
  { a: 111, b: 3 },
  { a: 136, b: 4 },
];
const startRows = {
  'raqm-alahad': (F) => F.evidence(F.fromInquiry(resultOf(UNITS_INQUIRY)).rows),
  'majmu-arqam': (F) => F.evidence(F.fromInquiry(resultOf(SUM_INQUIRY)).rows),
  'raqmayn-akhirayn': (F) => F.evidence(F.fromInquiry(resultOf(HUNDREDS_INQUIRY)).rows),
  'baqi-sifr': (F) => F.evidence(CROSSING),
};
/** What a student who holds the rule writes at the last step of each forge (and his verdict, when one is asked). */
const SOLVE = {
  'raqm-alahad': (c) => ({
    vals: { u: c.a % 10, yes: [2, 5].find((b) => c.a % b === 0), no: [2, 5].find((b) => c.a % b !== 0) },
  }),
  'majmu-arqam': (c) => ({ vals: { s: digitSum(c.a), n: [3, 9].filter((b) => c.a % b === 0).length } }),
  'raqmayn-akhirayn': (c) => ({ vals: { l: c.a % 100 }, verdict: c.a % 4 === 0 }),
  'baqi-sifr': (c) => ({ vals: { q: Math.floor(c.a / c.b), r: c.a % c.b }, verdict: c.a % c.b === 0 }),
};
/** How many rules the tiles of each forge allow: 60 in all, 56 of them false. */
const RULES = { 'raqm-alahad': 16, 'majmu-arqam': 16, 'raqmayn-akhirayn': 12, 'baqi-sifr': 16 };
/** Every case a forge can put in front of him: his evidence, the attacks of every rule, the helps, 25 lists of predictions. */
const casesOf = (F, rows) => {
  const out = [...rows];
  for (const rule of allRules(F)) out.push(...F.attacks(rule, rows));
  for (const n of [1, 2, 3]) out.push(...F.nudge(n, rows).cases);
  for (let seed = 1; seed <= 25; seed += 1) out.push(...F.predictCases(rows, rng(seed * 7919)));
  return out;
};
/** The rule is refuted in front of him: on his evidence, or by the first attack. */
const refutedBy = (key, rule) => {
  const F = FORGES[key];
  const rows = startRows[key](F);
  const run = runOn(F, rule, testsOf(F, rule, rows));
  return run.bad >= 0 ? run.marks[run.bad] : F.attacks(rule, rows)[0];
};

describe('the four forges of « قواعد قابلية القسمة » — no rule is told', () => {
  it('there is one forge per key of the lesson, in the order of the keys', () => {
    expect(Object.keys(FORGES)).toEqual(KEYS);
    for (const key of KEYS) expect(FORGES[key].key).toBe(key);
  });

  it('the story opens them in that order: island C, island E, island G, then the stone', () => {
    const opened = [];
    const game = {
      T: STORY.text,
      flags: {},
      state: { phase: 'play', keys: [] },
      say() {},
      openForge: (key) => opened.push(key),
      wait: () => ({ then() {} }),
      openStone() {},
      save() {},
    };
    for (let k = 0; k < STORY.islands.length; k += 1) STORY.onArrive(game, k);
    expect(STORY.onStone({ flags: {} })).toEqual({ quiz: 'stone' });
    STORY.onQuiz(game, 'stone');
    expect(STORY.onStone(game)).toEqual({ forge: 'baqi-sifr' });
    expect(opened).toEqual(KEYS);
    expect(['C', 'E', 'G'].map((id) => STORY.islands.findIndex((x) => x.id === id))).toEqual([2, 4, 6]);
  });

  for (const key of KEYS) {
    const F = FORGES[key];
    const rows = startRows[key](F);
    const rules = allRules(F);
    const THE = rules.filter(F.isTheRule);

    describe(key, () => {
      it('many rules can be written with the tiles and exactly ONE holds', () => {
        expect(rules).toHaveLength(RULES[key]);
        expect(THE).toHaveLength(1);
        for (const rule of rules) expect(complete(F, rule), ruleKey(F, rule)).toBe(true);
        expect(complete(F, { ...THE[0], [F.slots[0].id]: null })).toBe(false);
        expect(rows.length).toBeGreaterThanOrEqual(4);
      });

      it('the experiment leaves the tiles to him; nothing he did in it is lost', () => {
        if (!F.inquiry) {
          // the last key has no experiment: the mirror alone, its predictions first
          expect(key).toBe('baqi-sifr');
          expect(F.fromInquiry).toBeUndefined();
          return;
        }
        const out = F.fromInquiry(resultOf(F.inquiry));
        expect(out.rule).toBeUndefined();
        expect(F.inquiry.writes).toBeFalsy();
        expect(rows).toHaveLength(out.rows.length);
        expect(new Set(rows.map(F.caseId)).size).toBe(rows.length);
      });

      it('EVERY false rule is refuted in front of him — by what he did, or by a new case the world computes', () => {
        for (const rule of rules.filter((r) => !F.isTheRule(r))) {
          const run = runOn(F, rule, testsOf(F, rule, rows));
          if (run.bad >= 0) {
            const m = run.marks[run.bad];
            expect(m.says, ruleKey(F, rule)).not.toBe(m.held);
            clean(F.text.refuted(m));
            clean(F.explain(rule, m));
            continue;
          }
          const [c] = F.attacks(rule, rows);
          expect(c, ruleKey(F, rule)).toBeTruthy();
          expect(F.says(rule, c), ruleKey(F, rule)).not.toBe(c.held);
          expect(rows.some((row) => F.caseId(row) === F.caseId(c))).toBe(false); // a NEW case
          expect(Math.max(c.a, c.b)).toBeLessThanOrEqual(126); // the mirror can draw it
          clean(F.text.attack(c));
          clean(F.explain(rule, c));
        }
      });

      it('the right rule agrees with all his evidence and survives two hard attacks', () => {
        const run = runOn(F, THE[0], testsOf(F, THE[0], rows));
        expect(run.bad).toBe(-1);
        const hard = F.attacks(THE[0], rows);
        expect(hard).toHaveLength(2);
        for (const c of hard) {
          expect(F.says(THE[0], c)).toBe(c.held);
          expect(rows.some((row) => F.caseId(row) === F.caseId(c))).toBe(false);
          expect(Math.max(c.a, c.b)).toBeLessThanOrEqual(126);
          clean(F.text.attack(c));
        }
      });

      it('predictions on cases he has not seen, which hold and fail in turn, all drawable', () => {
        for (let seed = 1; seed <= 25; seed += 1) {
          const list = F.predictCases(rows, rng(seed * 7919));
          expect(list).toHaveLength(6);
          expect(list.map((c) => c.held)).toEqual([true, false, true, false, true, false]);
          expect(new Set(list.map(F.caseId)).size).toBe(list.length);
          for (const c of list) {
            expect(Number.isInteger(c.a) && Number.isInteger(c.b) && c.a >= 1 && c.b >= 1, F.caseId(c)).toBe(true);
            expect(rows.some((row) => F.caseId(row) === F.caseId(c))).toBe(false);
            expect(Math.max(c.a, c.b)).toBeLessThanOrEqual(126);
            clean(F.text.ask(c));
            clean(F.text.fact(c));
            clean(F.text.eq(c));
          }
        }
      });

      it('says every rule and applies it to a case in words, and words every moment of the forge', () => {
        for (const rule of rules) {
          clean(F.ruleText(rule));
          expect(F.ruleText(rule)).not.toMatch(/\$|\\/);
          for (const c of [...rows, ...F.attacks(rule, rows)]) clean(F.explain(rule, c));
        }
        const T = F.text;
        for (const k of ['title', 'sub', 'log', 'yes', 'no', 'next', 'frame', 'buildLead', 'testing', 'agreed', 'fire'])
          expect(typeof T[k], `${key} text.${k}`).toBe('string');
        for (const k of ['survived', 'wordsHint', 'experiment', 'useOk'])
          expect(typeof T[k], `${key} text.${k}`).toBe('string');
        for (const c of [...rows, ...F.attacks(THE[0], rows)]) {
          clean(T.attack(c));
          clean(T.refuted({ ...c, says: !c.held }));
          clean(T.fact(c));
        }
        // what the screen writes as PLAIN text (not through MathText) never carries a formula: words only
        const plain = [T.title, T.sub, T.log, T.yes, T.no, T.next, T.frame, T.buildLead, T.testing, T.agreed, T.fire];
        plain.push(T.survived, T.wordsHint, T.experiment, T.useOk, ...Object.values(T.use));
        for (const yes of [true, false]) plain.push(T.says(yes), T.broken(yes));
        for (const c of rows) plain.push(T.refuted({ ...c, says: !c.held }));
        for (const s of F.slots) {
          plain.push(s.label);
          for (const o of s.options) plain.push(o.label, F.chip ? F.chip(s, o) : o.label);
        }
        for (const x of plain) {
          clean(x);
          expect(x, x).not.toMatch(/\$|\\/);
        }
      });

      it('the robot helps without ever giving the rule: three more pairs of cases, never a choice of rules', () => {
        for (const n of [1, 2, 3]) {
          const h = F.nudge(n, rows);
          expect(h.kind).toBe('experiment');
          expect(h.cases).toHaveLength(2);
          expect(F.caseId(h.cases[0])).not.toBe(F.caseId(h.cases[1]));
          for (const c of h.cases) {
            expect(Math.max(c.a, c.b)).toBeLessThanOrEqual(126);
            clean(F.text.fact(c));
          }
        }
        const pairs = [1, 2, 3].map((n) => F.nudge(n, rows).cases.map(F.caseId).join('|'));
        expect(new Set(pairs).size).toBe(3);
      });

      it('ends on a case the mirror does not build: the rule decides, typed in its own shape', () => {
        for (let seed = 1; seed <= 25; seed += 1) {
          const c = F.use.make(rng(seed * 104729));
          const { vals, verdict } = SOLVE[key](c);
          for (const v of Object.values(vals)) expect(Number.isInteger(v) && v >= 0).toBe(true);
          const slots = F.use.lines(c).flatMap((l) => l.tokens.filter((t) => typeof t === 'object').map((t) => t.slot));
          expect(slots.sort()).toEqual(Object.keys(vals).sort());
          const typed = Object.fromEntries(Object.entries(vals).map(([k, v]) => [k, String(v)]));
          expect(F.use.check(c, typed, verdict)).toBe('ok');
          // every box of the last step is on ONE line with its words, three lines at most
          expect(F.use.lines(c).length).toBeLessThanOrEqual(3);
          expect(Boolean(F.use.verdict)).toBe(verdict !== undefined);
          if (F.use.verdict) {
            const fb = F.use.check(c, typed, !verdict);
            expect(fb).not.toBe('ok');
            expect(typeof F.text.use[fb]).toBe('string');
          }
          clean(F.text.tryKey(c));
          for (const name of slots) {
            const fb = F.use.check(c, { ...typed, [name]: String(Number(vals[name]) + 100) }, verdict);
            expect(fb, `${key} ${name}`).not.toBe('ok');
            expect(typeof F.text.use[fb], `${key} text.use.${fb}`).toBe('string');
          }
        }
      });

      it('the last step is never the same case as the bridge the story asks right after the key', () => {
        const next = {
          'raqm-alahad': NUMBERS.units.use,
          'majmu-arqam': NUMBERS.sum.use,
          'raqmayn-akhirayn': NUMBERS.last2.use,
        };
        for (let seed = 1; seed <= 25; seed += 1) expect(F.use.make(rng(seed)).a).not.toBe(next[key] ?? -1);
        // …and nothing the mirror shows before the key gives that bridge away
        if (next[key]) for (const c of casesOf(F, rows)) expect(c.a, F.caseId(c)).not.toBe(next[key]);
      });
    });
  }
});

describe('the false rules students really hold can be written — and the world refutes each', () => {
  it('« by 5 when it ends with 5 » falls on a gap ending with 0; « by 2: 2, 4, 6, 8 » on one ending with 0', () => {
    const five = refutedBy('raqm-alahad', { b5: 'five', b2: 'even' });
    expect([five.b, five.a % 10, five.held]).toEqual([5, 0, true]);
    const noZero = refutedBy('raqm-alahad', { b5: 'zeroFive', b2: 'noZero' });
    expect([noZero.b, noZero.a % 10, noZero.held]).toEqual([2, 0, true]);
    const odd = refutedBy('raqm-alahad', { b5: 'odd', b2: 'even' });
    expect([odd.b, odd.held, odd.a % 2]).toEqual([5, false, 1]);
  });

  it('« by 3 when the units digit is 3, 6 or 9 » falls on a gap ending with 3 that 3 does not fill', () => {
    const c = refutedBy('majmu-arqam', { b9: 'sumBy9', b3: 'unit369' });
    expect(c.b).toBe(3);
    expect([3, 6, 9]).toContain(c.a % 10);
    expect(c.held).toBe(false);
  });

  it('« by 9 when the sum is 9 » falls on 99 (sum 18); « by 9 when it ends with 9 » on 18; « sum by 3 » on 12', () => {
    const only9 = refutedBy('majmu-arqam', { b9: 'sumIs9', b3: 'sumBy3' });
    expect([only9.a, only9.b, digitSum(only9.a), only9.held]).toEqual([99, 9, 18, true]);
    const unit9 = refutedBy('majmu-arqam', { b9: 'unit9', b3: 'sumBy3' });
    expect([unit9.a, unit9.b, unit9.held]).toEqual([18, 9, true]);
    const by3 = refutedBy('majmu-arqam', { b9: 'sumBy3', b3: 'sumBy3' });
    expect([by3.a, by3.b, by3.held]).toEqual([12, 9, false]);
    // « by 3 when the sum is 3, 6 or 9 » falls on a gap whose digits sum to 12 or more
    const sum369 = refutedBy('majmu-arqam', { b9: 'sumBy9', b3: 'sumIs369' });
    expect([sum369.b, sum369.held, digitSum(sum369.a) >= 12, digitSum(sum369.a) % 3]).toEqual([3, true, true, 0]);
    // 27 ends with 7 and 9 fills it: shown by the robot's first pair
    expect(FORGES['majmu-arqam'].nudge(1).cases.map((c) => [c.a, c.held])).toEqual([
      [27, true],
      [28, false],
    ]);
  });

  it('« by 4 when the units digit is even » falls on 126; « when it ends with 4 or 8 » and « units by 4 » on 212', () => {
    const even = refutedBy('raqmayn-akhirayn', { read: 'units', cond: 'by2' });
    expect([even.a, even.held]).toEqual([126, false]);
    const tail48 = refutedBy('raqmayn-akhirayn', { read: 'units', cond: 'is48' });
    expect([tail48.a, tail48.held]).toEqual([212, true]);
    const units4 = refutedBy('raqmayn-akhirayn', { read: 'units', cond: 'by4' });
    expect([units4.a, units4.held]).toEqual([212, true]);
    // the tens digit alone: 128 and 126 have the same one, and only 128 is filled
    const tens = refutedBy('raqmayn-akhirayn', { read: 'tens', cond: 'by2' });
    expect([tens.a, tens.held]).toEqual([126, false]);
    // « the last two digits write an even number »: 26 is even
    const even2 = refutedBy('raqmayn-akhirayn', { read: 'last2', cond: 'by2' });
    expect([even2.a, even2.a % 100, even2.held]).toEqual([126, 26, false]);
  });

  it('key 3: EVERY false rule is refuted by a gap he glued himself, and the hundreds decide nothing in his evidence', () => {
    const F = FORGES['raqmayn-akhirayn'];
    const rows = startRows['raqmayn-akhirayn'](F);
    expect(rows.map((c) => c.a)).toEqual(HUNDREDS_INQUIRY.rounds.map((r) => r.a + r.b));
    for (const rule of allRules(F).filter((r) => !F.isTheRule(r)))
      expect(runOn(F, rule, rows).bad, ruleKey(F, rule)).toBeGreaterThanOrEqual(0);
    // each number of hundreds is met in a gap the plank fills AND in a gap it does not
    const byHundreds = {};
    for (const c of rows) (byHundreds[Math.floor(c.a / 100)] ??= new Set()).add(c.held);
    expect(Object.keys(byHundreds).length).toBeGreaterThanOrEqual(3);
    for (const [h, verdicts] of Object.entries(byHundreds)) expect(verdicts.size, `${h} hundreds`).toBe(2);
    // the right rule attacked: 114 ends with 4 and crumbles, 116 ends with 6 and holds
    expect(F.attacks({ read: 'last2', cond: 'by4' }, rows).map((c) => [c.a, c.held])).toEqual([
      [114, false],
      [116, true],
    ]);
    // the helps: the same short gap with and without a hundred, twice — then two gaps ending with 0
    const helps = [1, 2, 3].map((n) => F.nudge(n, rows).cases.map((c) => [c.a, c.held]));
    expect(helps[0]).toEqual([
      [24, true],
      [124, true],
    ]);
    expect(helps[1]).toEqual([
      [18, false],
      [118, false],
    ]);
    expect(helps[2].map(([a]) => a % 10)).toEqual([0, 0]);
    expect(helps[2].map(([, held]) => held)).toEqual([true, false]);
  });

  it('key 1 ends on EACH plank: the one that fills the gap and the one that does not — a count would not say which', () => {
    const F = FORGES['raqm-alahad'];
    const gaps = new Set();
    for (let seed = 1; seed <= 60; seed += 1) gaps.add(F.use.make(rng(seed * 104729)).a);
    expect(gaps.size).toBeGreaterThanOrEqual(5);
    const fillers = new Set();
    for (const a of gaps) {
      const fill = [2, 5].filter((b) => a % b === 0);
      expect(fill, `${a}: exactly one of the planks 2 and 5 fills it`).toHaveLength(1);
      fillers.add(fill[0]);
      const [yes] = fill;
      const no = 7 - yes;
      const u = String(a % 10);
      expect(F.use.check({ a }, { u, yes: String(yes), no: String(no) })).toBe('ok');
      // the two planks the wrong way round, the same plank twice, a plank that is not offered, a wrong digit
      expect(F.use.check({ a }, { u, yes: String(no), no: String(yes) })).toBe('which');
      expect(F.use.check({ a }, { u, yes: String(yes), no: String(yes) })).toBe('planks');
      expect(F.use.check({ a }, { u, yes: '3', no: String(no) })).toBe('planks');
      expect(F.use.check({ a }, { u: String((a + 1) % 10), yes: String(yes), no: String(no) })).toBe('units');
    }
    expect([...fillers].sort()).toEqual([2, 5]);
    const words = F.use
      .lines({ a: 3465 })
      .flatMap((l) => l.tokens.filter((t) => typeof t === 'string'))
      .join(' ');
    expect(words).toContain('يملؤها اللوح');
    expect(words).toContain('ولا يملؤها اللوح');
    expect(words).not.toContain('عدد الألواح');
  });

  it('the first help of key 1 is worded for what it shows: two bridges — never « two gaps and two planks »', () => {
    const F = FORGES['raqm-alahad'];
    const shapes = [1, 2, 3].map((n) => {
      const cases = F.nudge(n).cases;
      return [new Set(cases.map((c) => c.a)).size, new Set(cases.map((c) => c.b)).size];
    });
    // two gaps under one plank, twice; then one gap under the two planks
    expect(shapes).toEqual([
      [2, 1],
      [2, 1],
      [1, 2],
    ]);
    expect(F.text.experiment).toContain('الجسرين');
    expect(F.text.experiment).not.toMatch(/هوّتان|لوحان/);
  });

  it('« يقسم » read like the others falls on a sentence the wrong way round; « the remainder is small » on a false one', () => {
    const first = refutedBy('baqi-sifr', { q: 'r', c: 'zero', dir: 'first' });
    expect(first.form).toBe('yaqsim');
    expect(FORGES['baqi-sifr'].says({ q: 'r', c: 'zero', dir: 'first' }, first)).not.toBe(first.held);
    const small = refutedBy('baqi-sifr', { q: 'r', c: 'less', dir: 'second' });
    expect(small.held).toBe(false);
    const whole = refutedBy('baqi-sifr', { q: 'q', c: 'natural', dir: 'second' });
    expect(whole.held).toBe(false);
  });

  it('the sentences of the last forge mean the bridge they say: « x يقسم y » is a plank x over a gap y', () => {
    const F = FORGES['baqi-sifr'];
    const [trap, truth] = F.attacks({ q: 'r', c: 'zero', dir: 'second' }, F.evidence(CROSSING));
    expect(trap.form).toBe('yaqsim');
    expect([trap.a < trap.b, trap.held]).toEqual([true, false]);
    expect(truth.form).toBe('mudaaf');
    expect(truth.held).toBe(true);
    expect(truth.a % truth.b).toBe(0);
  });
});

/**
 * WHAT `explain` SAYS — every sentence it can produce, for every rule of every forge, on every case the forge can show.
 * A condition has two forms: after « عندما يكون … » in the rule it is an accusative (« عددًا زوجيًّا »); said OF a number it
 * is a clause (« وهو عدد زوجي »). The defect this guards: the first form printed where the second belongs (« و 6 عددًا
 * زوجيًّا », « و 8 4 أو 8 »).
 */
describe('the rule applied to a case, in words: every sentence `explain` can say', () => {
  const tens = (a) => Math.floor(a / 10) % 10;
  /** What each clause claims of the number v it is said of (d = the divisor of the division the rule made). */
  const CLAUSE = {
    'وهو يقبل القسمة على 4': (v) => v % 4 === 0,
    'وهو لا يقبل القسمة على 4': (v) => v % 4 !== 0,
    'وهو عدد زوجي': (v) => v % 2 === 0,
    'وهو عدد فردي': (v) => v % 2 === 1,
    'وهو أحد العددين 4 و 8': (v) => v === 4 || v === 8,
    'وهو ليس 4 ولا 8': (v) => v !== 4 && v !== 8,
    'وهو يساوي 0': (v) => v === 0,
    'وهو لا يساوي 0': (v) => v !== 0,
    'وهو أصغر من القاسم': (v, d) => v < d,
    'وهو ليس أصغر من القاسم': (v, d) => v >= d,
    'وهو عدد طبيعي': (v) => Number.isInteger(v) && v >= 0,
  };
  const clauseIn = (text) =>
    Object.keys(CLAUSE)
      .filter((k) => text.includes(`، ${k}`))
      .sort((x, y) => y.length - x.length)[0];
  const grammar = (text, where) => {
    clean(text);
    // an accusative is right only after « ليس » — never as the predicate of a number
    expect(text, where).not.toMatch(/(?<!ليس )عدد[ًا]+ /);
    expect(text, where).not.toMatch(/\d+ \d+ أو \d+/);
    expect(text, where).not.toMatch(/و \d+ (عدد|ليس|يقبل|لا يقبل|يساوي|أصغر)/);
    expect((text.match(/\$/g) ?? []).length % 2, where).toBe(0);
  };

  it('keys 1 and 2: the digit or the sum read, the tile of that plank, the verdict the rule gives', () => {
    for (const key of ['raqm-alahad', 'majmu-arqam']) {
      const F = FORGES[key];
      const rows = startRows[key](F);
      let n = 0;
      for (const rule of allRules(F))
        for (const c of casesOf(F, rows)) {
          const text = F.explain(rule, c);
          const where = `${key} ${ruleKey(F, rule)} on ${F.caseId(c)}`;
          grammar(text, where);
          const tile = F.slots.find((s) => s.id === `b${c.b}`).options.find((o) => o.id === rule[`b${c.b}`]);
          expect(text, where).toContain(`قاعدتك للّوح ${c.b}: ${tile.label} — فهي تقول إنّ الجسر`);
          expect(text.endsWith(F.says(rule, c) ? 'يثبت.' : 'ينهار.'), where).toBe(true);
          if (key === 'raqm-alahad') expect(text, where).toContain(`رقم آحاد ${c.a} هو ${c.a % 10}.`);
          else expect(text, where).toContain(`= ${digitSum(c.a)}$، ورقم الآحاد ${c.a % 10}.`);
          n += 1;
        }
      expect(n).toBeGreaterThan(1000);
    }
  });

  it('key 3: what the rule reads in the gap, its value, a clause that is TRUE of that value, the verdict', () => {
    const F = FORGES['raqmayn-akhirayn'];
    const rows = startRows['raqmayn-akhirayn'](F);
    const READ = { units: (a) => a % 10, tens, sum: digitSum, last2: (a) => a % 100 };
    const said = new Set();
    for (const rule of allRules(F))
      for (const c of casesOf(F, rows)) {
        const text = F.explain(rule, c);
        const where = `${ruleKey(F, rule)} on ${c.a}`;
        grammar(text, where);
        const v = READ[rule.read](c.a);
        const read = F.slots[0].options.find((o) => o.id === rule.read).label;
        expect(text.startsWith(`قاعدتك تقرأ في الهوّة ${c.a} ${read}، أي ${v}، وهو `), where).toBe(true);
        const clause = clauseIn(text);
        expect(clause, where).toBeTruthy();
        expect(CLAUSE[clause](v), `${where}: « ${clause} » said of ${v}`).toBe(true);
        expect(text.endsWith(` — فهي تقول إنّ الجسر ${F.says(rule, c) ? 'يثبت' : 'ينهار'}.`), where).toBe(true);
        said.add(clause);
      }
    // the six clauses of the three conditions are all really said
    expect(said.size).toBe(6);
  });

  it('key 4: the division the rule makes, what it reads in it, a clause that is TRUE of that number, the verdict', () => {
    const F = FORGES['baqi-sifr'];
    const rows = startRows['baqi-sifr'](F);
    const said = new Set();
    for (const rule of allRules(F))
      for (const c of casesOf(F, rows)) {
        const text = F.explain(rule, c);
        const where = `${ruleKey(F, rule)} on « ${c.text} »`;
        grammar(text, where);
        const m = text.match(
          /^قاعدتك تقسم (\d+) على (\d+): \$(\d+) = (\d+) \\times (\d+) \+ (\d+)\$\. (باقي|حاصل) القسمة الإقليدية (\d+)، (.+): فهي تقول إنّ الجملة (صحيحة|خاطئة)\.$/,
        );
        expect(m, `${where}: ${text}`).toBeTruthy();
        const [n, d, n2, d2, q, r, what, v] = m.slice(1, 9).map((x) => (/^\d+$/.test(x) ? Number(x) : x));
        expect([n2, d2, d * q + r, r < d], where).toEqual([n, d, n, true]);
        expect(v, where).toBe(what === 'باقي' ? r : q);
        expect((what === 'باقي') === (rule.q === 'r'), where).toBe(true);
        expect(CLAUSE[m[9]], `${where}: « ${m[9]} »`).toBeTypeOf('function');
        expect(CLAUSE[m[9]](v, d), `${where}: « ${m[9]} » said of ${v}`).toBe(true);
        expect(m[10] === 'صحيحة', where).toBe(F.says(rule, c));
        said.add(m[9]);
      }
    // every clause but « ليس عددًا طبيعيًّا » (a quotient and a remainder are always natural) is really said
    expect(said.size).toBe(7);
  });
});
