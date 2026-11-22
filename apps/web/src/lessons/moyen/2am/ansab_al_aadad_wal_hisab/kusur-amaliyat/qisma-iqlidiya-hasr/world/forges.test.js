import { describe, it, expect } from 'vitest';
import { complete, runOn, testsOf, ruleKey } from '../../../../../../common/gameworld/kit/forge';
import { estimateSteps, bracketOf } from '../../../../../../common/gameworld/divisorIsles/inquiry';
import { FORGES } from './forges';
import { KEYS } from './journey';
import { ESTIMATE_INQUIRY, BRACKET_INQUIRY } from './inquiries';
import { STORY, TABLETS } from './story';

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
const clean = (text) => expect(String(text)).not.toMatch(/undefined|NaN|\[object|null/);
/** The quotient the estimate's steps lay, and what is left: the world's own count. */
const laidBy = (a, b) => {
  const steps = estimateSteps(a, b);
  return { q: steps.reduce((t, s) => t + s.q * 10 ** s.place, 0), r: steps.at(-1).left };
};
/** The step of a round where a mark is ONE plank: what is left before it, and the digit the planks take. */
const unitStep = (a, b) => estimateSteps(a, b).find((s) => s.place === 0);

/** What each investigation hands back when the student plays it through (the facts are the world's, computed). */
const RESULTS = {
  'qisma-ay-adad': {
    rounds: ESTIMATE_INQUIRY.rounds.map(({ a, b }) => {
      const { q, r } = laidBy(a, b);
      return { a, b, q, r, tens: Math.floor(q / 10), units: q % 10, guesses: [] };
    }),
  },
  'hasr-hasil': {
    rounds: BRACKET_INQUIRY.rounds.map(({ a, b }) => {
      const x = bracketOf(a, b);
      return { a, b, lo: x.lo, hi: x.hi, exact: x.exact, said: x.exact ? 'on' : 'between', guesses: [] };
    }),
  },
};
/** The bridges of his crossing before the last forge: every mould of every bridge (he tried them all) … */
const BRIDGES = STORY.segments.filter((s) => s.kind === 'bridge' && s.moulds.length);
const LOG_ALL = BRIDGES.flatMap((s) => s.moulds.map((b) => ({ a: s.a, b })));
/** … or only the mould that holds each one (he never fired a wrong one): the evidence is then all « holds ». */
const LOG_HELD = BRIDGES.map((s) => ({ a: s.a, b: s.holdsWith }));
/** The evidence each forge starts its mirror with. */
const rowsOf = (key, log = LOG_ALL) => {
  const F = FORGES[key];
  return F.inquiry ? F.evidence(F.fromInquiry(RESULTS[key]).rows) : F.evidence(log);
};
/** What a student who holds the rule writes at the last step of each forge. */
const SOLVE = {
  'qisma-ay-adad': (c) => ({ q: Math.floor(c.a / c.b), r: c.a % c.b }),
  'hasr-hasil': (c) => ({ lo: Math.floor(c.a / c.b), hi: Math.floor(c.a / c.b) + 1 }),
  'inidam-baqi': (c) => ({ q: Math.floor(c.a / c.b), r: c.a % c.b }),
};
/** How many rules the tiles of each forge allow. */
const RULES = { 'qisma-ay-adad': 27, 'hasr-hasil': 9, 'inidam-baqi': 16 };
/**
 * The mirror draws and plays a case: a gap it can draw cell by cell (the first forge draws what is LEFT under a long
 * plank: 2600 cells at most), at most 30 planks laid (one sound each).
 */
const MAX_CELLS = { 'qisma-ay-adad': 2600, 'hasr-hasil': 300, 'inidam-baqi': 300 };
const drawable = (key, c) =>
  Number.isInteger(c.a) && Number.isInteger(c.b) && c.a >= 1 && c.b >= 1 && c.a <= MAX_CELLS[key] && c.q <= 30;

describe('the three forges of « القسمة الإقليدية وحصر حاصل القسمة » — no rule is told', () => {
  it('there is one forge per key; the first two open on an investigation, the last is the mirror alone', () => {
    expect(Object.keys(FORGES)).toEqual(KEYS);
    for (const key of KEYS) expect(FORGES[key].key).toBe(key);
    expect(FORGES['qisma-ay-adad'].inquiry.kind).toBe('estimate');
    expect(FORGES['hasr-hasil'].inquiry.kind).toBe('bracket');
    expect(FORGES['inidam-baqi'].inquiry).toBeUndefined();
    for (const key of KEYS.slice(0, 2)) expect(typeof FORGES[key].fromInquiry).toBe('function');
  });

  for (const key of KEYS) {
    const F = FORGES[key];
    const rules = allRules(F);
    const THE = rules.filter(F.isTheRule);
    const logs = F.inquiry ? [null] : [LOG_ALL, LOG_HELD];

    describe(key, () => {
      it('many rules can be written with the tiles and exactly ONE holds', () => {
        expect(rules).toHaveLength(RULES[key]);
        expect(THE).toHaveLength(1);
        for (const rule of rules) expect(complete(F, rule), ruleKey(F, rule)).toBe(true);
        expect(complete(F, { ...THE[0], [F.slots[0].id]: null })).toBe(false);
        const rows = rowsOf(key);
        expect(rows.length).toBeGreaterThanOrEqual(2);
        if (F.inquiry) {
          const out = F.fromInquiry(RESULTS[key]);
          expect(rows).toHaveLength(out.rows.length); // nothing he did is lost
          expect(out.rule).toBeUndefined(); // the tiles are his to choose
          for (const row of rows) expect(row.held, F.caseId(row)).toBe(true);
        }
      });

      for (const log of logs) {
        const rows = rowsOf(key, log ?? undefined);
        const tag = log ? (log === LOG_ALL ? ' (he tried every mould)' : ' (he fired only the moulds that hold)') : '';

        it(`EVERY false rule is refuted in front of him — by what he did, or by a new case the world computes${tag}`, () => {
          let onEvidence = 0;
          let byAttack = 0;
          for (const rule of rules.filter((r) => !F.isTheRule(r))) {
            const run = runOn(F, rule, testsOf(F, rule, rows));
            if (run.bad >= 0) {
              const m = run.marks[run.bad];
              expect(m.says, ruleKey(F, rule)).not.toBe(m.held);
              clean(F.text.refuted(m));
              clean(F.explain(rule, m));
              onEvidence += 1;
              continue;
            }
            const [c] = F.attacks(rule, rows);
            expect(c, ruleKey(F, rule)).toBeTruthy();
            expect(F.says(rule, c), ruleKey(F, rule)).not.toBe(c.held);
            expect(rows.some((row) => F.caseId(row) === F.caseId(c))).toBe(false); // a NEW case
            expect(drawable(key, c), F.caseId(c)).toBe(true);
            clean(F.text.attack(c));
            clean(F.text.fact(c));
            clean(F.explain(rule, c));
            byAttack += 1;
          }
          expect(onEvidence + byAttack).toBe(RULES[key] - 1); // every other rule, none left standing
        });

        it(`the right rule agrees with all his evidence and survives two hard attacks${tag}`, () => {
          const run = runOn(F, THE[0], testsOf(F, THE[0], rows));
          expect(run.bad).toBe(-1);
          expect(run.marks.length).toBeGreaterThanOrEqual(2);
          const hard = F.attacks(THE[0], rows);
          expect(hard).toHaveLength(2);
          for (const c of hard) {
            expect(F.says(THE[0], c)).toBe(c.held);
            expect(rows.some((row) => F.caseId(row) === F.caseId(c))).toBe(false);
            expect(drawable(key, c)).toBe(true);
          }
        });
      }

      it('predictions on cases he has not seen, which hold and fail in turn, all drawable', () => {
        const rows = rowsOf(key);
        for (let seed = 1; seed <= 25; seed += 1) {
          const list = F.predictCases(rows, rng(seed * 7919));
          expect(list.length).toBeGreaterThanOrEqual(4);
          expect(list.map((c) => c.held).slice(0, 4)).toEqual([true, false, true, false]);
          expect(new Set(list.map(F.caseId)).size).toBe(list.length);
          for (const c of list) {
            expect(drawable(key, c), F.caseId(c)).toBe(true);
            expect(rows.some((row) => F.caseId(row) === F.caseId(c))).toBe(false);
            clean(F.text.ask(c));
            clean(F.text.fact(c));
            clean(F.text.eq(c));
          }
        }
      });

      it('says every rule and applies it to a case in words, and words every moment of the forge', () => {
        const rows = rowsOf(key);
        for (const rule of rules) {
          clean(F.ruleText(rule));
          for (const c of [...rows, ...F.attacks(rule, rows)]) clean(F.explain(rule, c));
        }
        const T = F.text;
        for (const k of ['title', 'sub', 'log', 'yes', 'no', 'next', 'frame', 'buildLead', 'testing', 'agreed', 'fire'])
          expect(typeof T[k], `${key} text.${k}`).toBe('string');
        for (const k of ['survived', 'wordsHint', 'experiment', 'useOk'])
          expect(typeof T[k], `${key} text.${k}`).toBe('string');
        for (const c of [...rows, ...F.attacks(THE[0], rows)]) {
          clean(T.ask(c));
          clean(T.attack(c));
          clean(T.refuted({ ...c, says: !c.held }));
          clean(T.fact(c));
          clean(T.eq(c));
        }
        for (const yes of [true, false]) {
          clean(T.says(yes));
          clean(T.broken(yes));
        }
        // what the screen writes as PLAIN text (not through MathText) never carries a formula: no raw LaTeX, no
        // operator between two numbers that the right-to-left line would scramble — words only
        const plain = [T.agreed, T.survived, T.useOk, T.frame, ...Object.values(T.use), T.says(true), T.says(false)];
        plain.push(T.broken(true), T.broken(false), T.buildLead, T.testing, T.experiment, T.log, T.title);
        for (const s of F.slots)
          plain.push(s.label, ...s.options.map((o) => o.label), ...s.options.map((o) => F.chip?.(s, o) ?? o.label));
        for (const rule of rules) plain.push(F.ruleText(rule));
        for (const c of [...rows, ...F.attacks(THE[0], rows), ...[1, 2, 3].flatMap((n) => F.nudge(n, rows).cases)]) {
          plain.push(T.refuted({ ...c, says: !c.held }), T.refuted({ ...c, says: c.held }));
          if (c.text) plain.push(c.text);
          if (c.tag) plain.push(c.tag);
        }
        for (const x of plain) {
          expect(x, x).not.toMatch(/\$|\\/);
          expect(x, x).not.toMatch(/\d\s*[×÷=+<>≤−-]\s*\d/);
        }
      });

      it('never says the NAME of its key before the seal: the tablet names it', () => {
        const rows = rowsOf(key);
        const T = F.text;
        const said = [T.title, T.log, T.frame, T.buildLead, T.testing, T.agreed, T.survived, T.experiment, T.useOk];
        said.push(T.says(true), T.says(false), T.broken(true), T.broken(false), ...Object.values(T.use));
        for (const s of F.slots) said.push(s.label, ...s.options.map((o) => o.label));
        for (const rule of rules) {
          said.push(F.ruleText(rule));
          for (const c of rows) said.push(F.explain(rule, c));
        }
        for (const c of [...rows, ...F.attacks(THE[0], rows)]) {
          said.push(T.ask(c), T.attack(c), T.fact(c), T.refuted({ ...c, says: !c.held }));
          if (c.text) said.push(c.text);
        }
        said.push(T.tryKey(F.use.make(rng(11))));
        const name = TABLETS[key].title;
        // « حصر », « محصور », « تحصر », « انعدام » … : the words of the names, whatever their form
        const roots = {
          'qisma-ay-adad': /القسمة على أيّ عدد/,
          'hasr-hasil': /حصر|محصور/,
          'inidam-baqi': /انعدام|معدوم/,
        };
        for (const x of said) {
          expect(x, x).not.toContain(name);
          expect(x, x).not.toMatch(roots[key]);
        }
      });

      it('the robot helps without ever giving the rule: three more pairs of cases, never a choice of rules', () => {
        const rows = rowsOf(key);
        for (const n of [1, 2, 3]) {
          const h = F.nudge(n, rows);
          expect(h.kind).toBe('experiment');
          expect(h.cases).toHaveLength(2);
          for (const c of h.cases) {
            expect(drawable(key, c)).toBe(true);
            clean(F.text.fact(c));
          }
          expect(F.caseId(h.cases[0])).not.toBe(F.caseId(h.cases[1]));
          // a pair shows two different outcomes: one the world accepts, one it does not
          expect(h.cases.map((c) => c.held).sort()).toEqual([false, true]);
        }
      });

      it('ends on a case the mirror does not build: the rule decides, typed in its own shape', () => {
        for (let seed = 1; seed <= 25; seed += 1) {
          const c = F.use.make(rng(seed * 104729));
          const vals = SOLVE[key](c);
          for (const v of Object.values(vals)) expect(Number.isInteger(v) && v >= 0).toBe(true);
          const boxes = F.use.lines(c).flatMap((l) => l.tokens.filter((t) => typeof t === 'object'));
          const slots = boxes.map((t) => t.slot);
          expect([...slots].sort()).toEqual(Object.keys(vals).sort());
          // every box holds its answer — and, for a remainder, the slip it exists to catch (one plank too few: r + b)
          for (const t of boxes) expect(String(vals[t.slot]).length, `${key} ${t.slot}`).toBeLessThanOrEqual(t.w);
          const str = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, String(v)]));
          const verdict = F.use.verdict ? c.held : undefined;
          expect(F.use.check(c, str(vals), verdict)).toBe('ok');
          if (F.use.verdict) expect(typeof F.text.use[F.use.check(c, str(vals), !c.held)]).toBe('string');
          clean(F.text.tryKey(c));
          for (const name of slots) {
            const fb = F.use.check(c, { ...vals, [name]: Number(vals[name]) + 100 }, verdict);
            expect(fb, `${key} ${name}`).not.toBe('ok');
            expect(typeof F.text.use[fb], `${key} text.use.${fb}`).toBe('string');
          }
        }
      });
    });
  }
});

describe('forge 1 is about the LONG plank — not the first year’s rule again', () => {
  const D = 'qisma-ay-adad';
  const F = FORGES[D];

  it('every case of its mirror has a plank of three digits, and what is left takes one digit', () => {
    const rows = rowsOf(D);
    const cases = [
      ...rows,
      ...F.attacks(
        F.slots.reduce((r, s) => ({ ...r, [s.id]: s.options[0].id }), {}),
        rows,
      ),
    ];
    for (let seed = 1; seed <= 10; seed += 1) cases.push(...F.predictCases(rows, rng(seed * 31)));
    for (const n of [1, 2, 3]) cases.push(...F.nudge(n, rows).cases);
    for (const c of cases) {
      expect(c.b, F.caseId(c)).toBeGreaterThanOrEqual(100);
      expect(c.b, F.caseId(c)).toBeLessThanOrEqual(999);
      expect(c.a, F.caseId(c)).toBeLessThan(10 * c.b); // one digit of the count of planks
      expect(c.q, F.caseId(c)).toBeLessThanOrEqual(9);
      expect(c.held, F.caseId(c)).toBe(c.r >= 0 && c.r < c.b);
      expect(c.r).toBe(c.a - c.b * c.q);
    }
  });

  it('his evidence is the single planks he tried on the ruler: the counts he laid, and those the ruler refused', () => {
    const rounds = RESULTS[D].rounds.map((x, i) => {
      const s = unitStep(x.a, x.b);
      // on the first two gaps he first pressed a count too big, then one too small (when there is one)
      const guesses =
        i < 2
          ? [{ place: 0, count: s.q + 1, ok: false }, ...(s.q ? [{ place: 0, count: s.q - 1, ok: false }] : [])]
          : [];
      return { ...x, guesses: [{ place: 1, count: 10, ok: true }, ...guesses, { place: 0, count: s.q, ok: true }] };
    });
    const rows = F.evidence(F.fromInquiry({ rounds }).rows);
    expect(rows).toHaveLength(RESULTS[D].rounds.length + 4);
    expect(rows.filter((r) => !r.held)).toHaveLength(4);
    for (const r of rows) expect(r.kind).toBe('trial');
    // the right rule still agrees with every line, and each refused count is refused for its own reason
    const THE = allRules(F).find(F.isTheRule);
    expect(runOn(F, THE, rows).bad).toBe(-1);
    expect(rows.filter((r) => r.r < 0)).toHaveLength(2);
    expect(rows.filter((r) => r.r >= r.b)).toHaveLength(2);
  });

  it('its last step is a gap of five digits and a plank of three: no ruler, no mirror', () => {
    for (let seed = 1; seed <= 25; seed += 1) {
      const c = F.use.make(rng(seed * 104729));
      expect(String(c.a)).toHaveLength(5);
      expect(String(c.b)).toHaveLength(3);
      // the remainder box holds « one plank too few » (r + b), so that slip is answered by its own sentence
      const { q, r } = SOLVE[D](c);
      expect(F.use.check(c, { q: String(q - 1), r: String(r + c.b) })).toBe('big');
      expect(String(r + c.b).length).toBeLessThanOrEqual(3);
    }
  });

  it('its rule is not the first year’s sentence: it says how a digit is tried, and how it is known to be wrong', () => {
    const THE = allRules(F).find(F.isTheRule);
    const text = F.ruleText(THE);
    for (const w of ['مقرّبًا إلى مئة', 'اللوح نفسه', 'أكبر من اللازم', 'أصغر من اللازم']) expect(text).toContain(w);
    // the words of the first year's key (« أكبر عدد من عشرات الألواح لا يتجاوز الهوّة », « الألواح المفردة ») are not its tiles
    const tiles = F.slots.flatMap((s) => s.options.map((o) => o.label)).join(' ');
    expect(tiles).not.toMatch(/عشرات الألواح|الألواح المفردة|أكبر علامة/);
  });
});

describe('the false rules students really hold can be written — and the world refutes each', () => {
  /** The rule is refuted in front of him: on his evidence, or by the first attack. */
  const refutedBy = (key, rule, log = LOG_ALL) => {
    const F = FORGES[key];
    const rows = rowsOf(key, log);
    const run = runOn(F, rule, testsOf(F, rule, rows));
    return run.bad >= 0 ? { ...run.marks[run.bad], on: 'evidence' } : { ...F.attacks(rule, rows)[0], on: 'attack' };
  };
  const D = 'qisma-ay-adad';
  const B = 'hasr-hasil';
  const Z = 'inidam-baqi';

  it('« the rounded plank judges » falls on HIS 2096 with 248 (200 × 8 leaves room, 248 × 8 does not)', () => {
    const near = refutedBy(D, { by: 'near', big: 'passes', small: 'room' });
    expect([near.on, near.a, near.b, near.q, near.held]).toEqual(['evidence', 2096, 248, 8, true]);
    expect(200 * 8 <= 2096 && 2096 - 200 * 8 >= 200).toBe(true); // what the rule computes
    expect(2096 - 248 * 8).toBeLessThan(248); // what the planks do
    const cut = refutedBy(D, { by: 'cut', big: 'passes', small: 'room' });
    expect([cut.on, cut.a, cut.b, cut.q, cut.held]).toEqual(['evidence', 926, 365, 2, true]);
  });

  it('« a product that reaches what is left is too big » falls on HIS exact fit; « anything left is too small » on his 926', () => {
    const reach = refutedBy(D, { by: 'real', big: 'reach', small: 'room' });
    expect([reach.on, reach.a, reach.b, reach.q, reach.r]).toEqual(['evidence', 416, 208, 2, 0]);
    const any = refutedBy(D, { by: 'real', big: 'passes', small: 'any' });
    expect([any.on, any.a, any.b, any.q]).toEqual(['evidence', 926, 365, 2]);
    expect(any.r).toBeGreaterThan(0);
  });

  it('« a whole plank left is fine » and « compare the hundreds only » survive his evidence and fall on a new trial', () => {
    const over = refutedBy(D, { by: 'real', big: 'passes', small: 'over' });
    expect(over.on).toBe('attack');
    expect(over.r).toBe(over.b); // exactly one plank left: the rule accepts the count, one more plank goes in
    expect(over.held).toBe(false);
    const hundreds = refutedBy(D, { by: 'real', big: 'hundreds', small: 'room' });
    expect(hundreds.on).toBe('attack');
    expect(hundreds.r).toBeLessThan(0); // the planks pass what is left …
    expect(Math.floor((hundreds.b * hundreds.q) / 100)).toBe(Math.floor(hundreds.a / 100)); // … inside the same hundred
    expect(hundreds.held).toBe(false);
  });

  it('« if something is left, the full planks are one more » falls on 5475 with 208; « between the full and the needed » on a mark', () => {
    const up = refutedBy(B, { lo: 'needed', hi: 'next' });
    expect([up.on, up.a, up.b, up.n, up.m, up.held]).toEqual(['evidence', 5475, 208, 26, 27, true]);
    const needed = refutedBy(B, { lo: 'full', hi: 'needed' });
    expect([needed.on, needed.a, needed.b, needed.r]).toEqual(['evidence', 5475, 365, 0]);
    const round = refutedBy(B, { lo: 'round', hi: 'next' });
    expect([round.on, round.a, round.b]).toEqual(['evidence', 5475, 312]);
  });

  it('« any remainder will do », « the remainder is one digit », « ends in 0 », « the first number by the second » all fall', () => {
    for (const log of [LOG_ALL, LOG_HELD]) {
      for (const rule of [
        { q: 'r', c: 'less' },
        { q: 'r', c: 'digit' },
        { q: 'units', c: 'zero' },
        { q: 'first', c: 'zero' },
        { q: 'q', c: 'even' },
      ]) {
        const c = refutedBy(Z, rule, log);
        expect(FORGES[Z].says(rule, c), `${rule.q}:${rule.c}`).not.toBe(c.held);
      }
      // « b يقسم a » is read the other way round: a sentence of that kind refutes it
      expect(refutedBy(Z, { q: 'first', c: 'zero' }, log).kind).toBe('dvs');
    }
  });

  it('the four sentences of one bridge are true together or false together', () => {
    for (const [a, b] of [
      [1080, 45],
      [1080, 64],
      [56, 8],
      [58, 8],
    ]) {
      const F = FORGES[Z];
      const kinds = ['div', 'mul', 'dvs'].map((kind) => F.evidence([{ a, b, kind, mirror: true }])[0]);
      const bridge = F.evidence([{ a, b }])[0];
      for (const c of kinds) expect(c.held).toBe(bridge.held);
      expect(bridge.held).toBe(a % b === 0);
    }
  });
});
