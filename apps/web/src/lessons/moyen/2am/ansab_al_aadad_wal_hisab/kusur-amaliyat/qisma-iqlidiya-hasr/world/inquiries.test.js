import { describe, it, expect } from 'vitest';
import {
  estimateMark,
  estimateSteps,
  bracketOf,
  bracketSays,
} from '../../../../../../common/gameworld/divisorIsles/inquiry';
import { ESTIMATE_INQUIRY, BRACKET_INQUIRY } from './inquiries';
import { FORGES } from './forges';
import { NUMBERS, STORY } from './story';

const said = (x) => expect(String(x)).not.toMatch(/undefined|NaN|\[object|null/);
/** Every sentence of an investigation is said, and none states the rule it leads to. */
const noRule = (lines, words) => {
  for (const line of lines) {
    said(line);
    expect(line, line).not.toMatch(words);
  }
};
const pairs = (spec) => spec.rounds.map(({ a, b }) => `${a}/${b}`);
/** The words of the TILES of a forge that an experiment must not say (a tile is a piece of the rule). */
const tileWords = (key) => FORGES[key].slots.flatMap((s) => [s.label, ...s.options.map((o) => o.label)]);
/** The gaps of the story, in the order he crosses them, with the planks that are offered on each. */
const BRIDGES = STORY.segments.filter((s) => s.kind === 'bridge');
const offered = (s) => (s.boss ? s.boss.options : s.moulds);
/** Is (a, b) a bridge he has NOT crossed yet when he reaches island `stage`? */
const ahead = (stage, a, b) =>
  STORY.segments.slice(stage).some((s) => s.kind === 'bridge' && s.a === a && offered(s).includes(b));

describe('the investigations of « القسمة الإقليدية وحصر حاصل القسمة » — each rule found by an experiment of its own', () => {
  it('the keys that are a procedure and a bracketing open on an experiment of their own — no two share a kind and a mode', () => {
    const kinds = Object.values(FORGES).map((F) => F.inquiry?.kind ?? null);
    expect(kinds).toEqual(['estimate', 'bracket', null]); // the zero remainder is one condition: the mirror alone
    const used = Object.values(FORGES)
      .filter((F) => F.inquiry)
      .map((F) => `${F.inquiry.kind}:${F.inquiry.mode ?? ''}`);
    expect(used).toHaveLength(2);
    expect(new Set(used).size).toBe(used.length);
    // and what an experiment hands the mirror is not what the other does: a trial of planks, a written bracket
    expect(FORGES['qisma-ay-adad'].fromInquiry({ rounds: [{ a: 2241, b: 365, guesses: [] }] }).rows[0].kind).toBe(
      'trial',
    );
    expect(
      FORGES['hasr-hasil'].fromInquiry({ rounds: [{ a: 2241, b: 365, lo: 6, hi: 7, guesses: [] }] }).rows[0].kind,
    ).toBe('bracket');
  });

  it('ESTIMATE is spent on what is NEW — a plank of three digits — and starts on the gap 4576 he has just crossed', () => {
    const { rounds } = ESTIMATE_INQUIRY;
    const { long: L } = NUMBERS;
    expect(pairs(ESTIMATE_INQUIRY).slice(0, 3).sort()).toEqual(L.moulds.map((b) => `${L.gap}/${b}`).sort());
    for (const { a, b } of rounds) {
      expect(String(b), `${a}/${b}`).toHaveLength(3); // every plank is LONG: the first year stopped at two digits
      expect(String(a).length, `${a}/${b}`).toBeGreaterThanOrEqual(4);
      expect(String(a).length, `${a}/${b}`).toBeLessThanOrEqual(5);
    }
    expect(rounds.some(({ a }) => String(a).length === 5)).toBe(true);
    const facts = rounds.map(({ a, b }) => ({ a, b, steps: estimateSteps(a, b), q: Math.floor(a / b), r: a % b }));
    for (const { a, b, steps, q, r } of facts) {
      // each step is a ruler of ten marks that holds what is left; the last one counts single planks
      expect(steps.at(-1).place).toBe(0);
      for (const s of steps) {
        expect(s.unit).toBe(b * 10 ** s.place);
        expect(s.from).toBeLessThan(10 * s.unit);
        expect(s.left).toBeLessThan(s.unit);
        expect(s.left).toBe(s.from - s.q * s.unit);
      }
      // the steps lay the whole division: a = b × q + r, r < b
      expect(steps.reduce((t, s) => t + s.q * 10 ** s.place, 0)).toBe(q);
      expect(steps.at(-1).left).toBe(r);
      expect(b * q + r).toBe(a);
    }
    // a gap that leaves cells and one that leaves none; ONE digit alone (a single ruler of planks); tens and units; a
    // quotient of three digits with a 0 INSIDE (a step where no plank is laid)
    expect(facts.some((f) => f.r > 0) && facts.some((f) => f.r === 0)).toBe(true);
    expect(facts.some((f) => f.steps.length === 1)).toBe(true);
    expect(facts.filter((f) => f.steps.length === 2).length).toBeGreaterThanOrEqual(2);
    const zero = facts.find((f) => f.steps.length === 3);
    expect(zero.steps.map((s) => s.q)).toEqual([1, 0, 6]);
    expect([zero.q, zero.r]).toEqual([106, 104]);
    // the digit of the single planks is not always the same, and a plank rounded to its hundred misleads at least once
    const units = facts.map((f) => f.steps.at(-1));
    expect(new Set(units.map((s) => s.q)).size).toBeGreaterThan(2);
    const near = (b) => Math.round(b / 100) * 100;
    expect(
      facts.some((f) => Math.min(9, Math.floor(f.steps.at(-1).from / near(f.b))) !== f.steps.at(-1).q),
      'a digit that the rounded plank gets wrong',
    ).toBe(true);
    expect(
      facts.some((f) => Math.min(9, Math.floor(f.steps.at(-1).from / near(f.b))) === f.steps.at(-1).q),
      'a digit that the rounded plank gets right',
    ).toBe(true);
  });

  it('ESTIMATE on screen: the labels of its rulers stay short (six digits at most under a mark)', () => {
    for (const { a, b } of ESTIMATE_INQUIRY.rounds)
      for (const s of estimateSteps(a, b)) {
        expect(String(10 * s.unit).length, `${a}/${b} ×${10 ** s.place}`).toBeLessThanOrEqual(6);
        expect(ESTIMATE_INQUIRY.text.left(s.from).length).toBeLessThanOrEqual(12); // drawn over the end of the bar
      }
  });

  it('ESTIMATE is BLIND: the multiples of a long plank are tried, not read — only the first round shows them', () => {
    const { rounds, text: T } = ESTIMATE_INQUIRY;
    const { long: L } = NUMBERS;
    const isBlind = (r) => Boolean(r.blind ?? ESTIMATE_INQUIRY.blind);
    expect(ESTIMATE_INQUIRY.blind).toBe(true);
    // the first round — the plank that has just filled his gap — is sighted: he meets the ruler once with its products
    expect(rounds.map(isBlind)).toEqual([false, true, true, true, true]);
    expect(rounds[0]).toEqual({ a: L.gap, b: L.plank, blind: false });
    // …and the question of a blind step says what the ruler does (a fact of the screen), a sighted one does not
    for (const r of rounds)
      for (const s of estimateSteps(r.a, r.b)) {
        const ask = T.ask({ a: r.a, b: r.b, place: s.place, unit: s.unit, from: s.from });
        expect(ask.includes('بعد أن تضغط'), `${r.a}/${r.b}`).toBe(isBlind(r));
        expect(ask).toContain(String(s.from));
        // the question never writes a product he has not made: only ONE mark (a plank, ten planks, a hundred)
        for (let k = 2; k <= 9; k += 1)
          if (k * s.unit !== s.from) expect(ask, ask).not.toMatch(new RegExp(`(^|\\D)${k * s.unit}(\\D|$)`));
      }
    // what the world answers once he has pressed: the product of HIS count, and what it does to what is left
    for (const r of rounds.filter(isBlind))
      for (const s of estimateSteps(r.a, r.b)) {
        const mark = (k) => {
          const m = estimateMark(s, k);
          return { a: r.a, b: r.b, place: s.place, unit: s.unit, from: s.from, k, count: k * 10 ** s.place, ...m };
        };
        expect(mark(s.q).kind).toBe('ok');
        if (s.q < 9) {
          const m = mark(s.q + 1);
          expect(m.kind).toBe('passes');
          expect(T.passes(m)).toContain(`$${r.b} \\times ${m.count} = ${m.value}$`);
          expect(T.passes(m)).toContain(`$${m.value} > ${s.from}$`);
        }
        if (s.q > 0) {
          const m = mark(s.q - 1);
          expect(m.kind).toBe('short');
          expect(m.next).toBeLessThanOrEqual(s.from);
          expect(T.short(m)).toContain(`العلامة التالية ${m.next} لا تتجاوز الراية ${s.from}`);
        }
      }
    // his evidence is what he really pressed on the single planks: the refused counts and the one laid, in his order
    const rows = FORGES['qisma-ay-adad'].fromInquiry({
      rounds: [
        {
          a: 4576,
          b: 365,
          guesses: [
            { place: 1, count: 20, ok: false },
            { place: 1, count: 10, ok: true },
            { place: 0, count: 3, ok: false },
            { place: 0, count: 1, ok: false },
            { place: 0, count: 2, ok: true },
          ],
        },
      ],
    }).rows;
    expect(rows.map((c) => [c.a, c.b, c.q, c.held])).toEqual([
      [926, 365, 3, false],
      [926, 365, 1, false],
      [926, 365, 2, true],
    ]);
  });

  it('ESTIMATE: every sentence says what the ruler and the planks did, and none states the rule or a word of its tiles', () => {
    const T = ESTIMATE_INQUIRY.text;
    const lines = [T.next, T.done];
    for (const { a, b } of ESTIMATE_INQUIRY.rounds) {
      const steps = estimateSteps(a, b);
      lines.push(T.lead(a, b), T.goal(a, b));
      for (const s of steps) {
        const m = (k) => ({ a, b, place: s.place, unit: s.unit, from: s.from, k, count: k * 10 ** s.place });
        const fact = (k) => ({ ...m(k), value: k * s.unit, left: s.from - k * s.unit });
        lines.push(T.ask({ a, b, place: s.place, unit: s.unit, from: s.from }), T.left(s.from));
        lines.push(T.laid(fact(s.q)));
        if (s.q < 9) lines.push(T.passes(fact(s.q + 1)));
        if (s.q > 0) lines.push(T.short({ ...fact(s.q - 1), next: s.q * s.unit }));
      }
      const q = Math.floor(a / b);
      const r = a % b;
      lines.push(T.sum({ a, b, q, r, steps }), T.foundLine({ a, b, q, r, tens: Math.floor(q / 10), units: q % 10 }));
    }
    noRule(lines, /أكبر|أصغر|أقصر|توقّف|دائمًا|قاعدة|يجب|اللازم|مقرّب|أقدّر|قريب|مئة|مئات|جداء|نفسه|الطرح|لوح آخر/);
    for (const tile of tileWords('qisma-ay-adad')) for (const line of lines) expect(line).not.toContain(tile);
    expect(typeof T.goal(1, 1)).toBe('string');
    expect(T.left(8)).not.toMatch(/\$/); // plain: SVG text
    expect(T.goal(1, 1)).not.toMatch(/\$/);
  });

  it('BRACKET starts on the gap 5475 he has just crossed: between two marks, ON a mark, and a quotient past the half', () => {
    const { rounds } = BRACKET_INQUIRY;
    expect(rounds[0]).toEqual({ a: NUMBERS.bracket.gap, b: NUMBERS.bracket.moulds[0] });
    expect(rounds.some(({ b }) => String(b).length === 3)).toBe(true);
    const facts = rounds.map(({ a, b }) => ({ a, b, ...bracketOf(a, b) }));
    expect(facts.filter((f) => f.exact).length).toBeGreaterThanOrEqual(2);
    expect(facts.filter((f) => !f.exact).length).toBeGreaterThanOrEqual(2);
    // a quotient whose rounding is NOT the full planks: rounding is answered by the line, in front of him
    expect(facts.some((f) => Math.round(f.a / f.b) !== f.lo)).toBe(true);
    // and one where the full planks are rounding too: the two ideas are not told apart by every gap
    expect(facts.some((f) => !f.exact && Math.round(f.a / f.b) === f.lo)).toBe(true);
    for (const f of facts) {
      expect(bracketSays(f.a, f.b, f.lo, f.hi).ok).toBe(true);
      // only the right pair is accepted: one less, one more, or not consecutive is refused
      expect(bracketSays(f.a, f.b, f.lo + 1, f.hi + 1).ok).toBe(false);
      expect(bracketSays(f.a, f.b, f.lo - 1, f.hi - 1).ok).toBe(false);
      expect(bracketSays(f.a, f.b, f.lo, f.hi + 1).ok).toBe(false);
      expect(f.lo).toBeGreaterThanOrEqual(2);
      expect(String(f.hi).length).toBeLessThanOrEqual(3); // the two boxes of the template take three digits
    }
  });

  it('BRACKET: every sentence says what the line did, and none states the rule or a word of its tiles', () => {
    const T = BRACKET_INQUIRY.text;
    const lines = [T.check, T.between, T.onMark, T.next, T.done];
    for (const { a, b } of BRACKET_INQUIRY.rounds) {
      const x = bracketOf(a, b);
      lines.push(T.lead(a, b), T.goal(a, b), T.ask({ a, b }));
      for (const [lo, hi] of [
        [x.lo + 1, x.hi + 1],
        [x.lo - 1, x.lo],
        [x.lo, x.hi + 2],
        [x.lo - 1, x.hi],
        [x.lo, x.lo],
        [x.hi, x.lo],
        [x.lo - 12, x.hi + 3],
      ])
        lines.push(T.miss({ a, b, lo, hi, loValue: b * lo, hiValue: b * hi, ...bracketSays(a, b, lo, hi) }));
      const f = { a, b, ...x };
      lines.push(T.ok(f), T.where(f));
      for (const s of ['between', 'on']) lines.push(T.seen({ ...f, said: s }), T.foundLine({ ...f, said: s }));
    }
    // the name of the key and of its two values, and the words of the tiles: « الكاملة », « اللازمة », « متتاليين » …
    noRule(
      lines,
      /محصور|حصر|بالنقصان|بالزيادة|مقرّب|دائمًا|زائد|قاعدة|يجب|الكاملة|اللازمة|متتالي|مدوّر|العدد الأوّل|العدد الثاني/,
    );
    for (const tile of tileWords('hasr-hasil')) for (const line of lines) expect(line).not.toContain(tile);
    expect(typeof T.goal(1, 1)).toBe('string');
    expect(T.goal(1, 1)).not.toMatch(/\$/);
  });

  it('BRACKET: its goal is true on EVERY round — also when the flag stands ON a mark', () => {
    const T = BRACKET_INQUIRY.text;
    // the goal names no number and no count: « between which two marks, or on which mark » — it cannot be false of a round
    for (const { a, b } of BRACKET_INQUIRY.rounds) {
      expect(T.goal(a, b)).not.toMatch(/\d/);
      expect(T.goal(a, b)).toContain('بين أيّ علامتين');
      expect(T.goal(a, b)).toContain('على أيّ علامة');
      expect(T.ask({ a, b })).not.toMatch(/\d/);
    }
    // on a mark the template still takes the count of planks and the one after it (b × q ≤ a < b × (q + 1))
    for (const { a, b } of BRACKET_INQUIRY.rounds.filter((x) => x.a % x.b === 0))
      expect(bracketSays(a, b, a / b, a / b + 1).ok).toBe(true);
  });

  it('BRACKET: a miss is answered by the two products he made — and by the marks between them, never « not consecutive »', () => {
    const T = BRACKET_INQUIRY.text;
    const [{ a, b }] = BRACKET_INQUIRY.rounds;
    const x = bracketOf(a, b);
    const j = bracketSays(a, b, x.hi, x.hi + 1);
    const miss = T.miss({ a, b, lo: x.hi, hi: x.hi + 1, loValue: b * x.hi, hiValue: b * (x.hi + 1), ...j });
    expect(miss).toContain('يتجاوز');
    expect(miss).toContain(String(b * x.hi));
    expect(miss).toContain(String(b * (x.hi + 1)));
    // 25 and 27 hold the gap between them, but a mark stands between their marks: 208 × 26
    const wide = { a, b, lo: x.lo - 1, hi: x.hi, loValue: b * (x.lo - 1), hiValue: b * x.hi };
    const far = T.miss({ ...wide, ...bracketSays(a, b, wide.lo, wide.hi) });
    expect(far).toContain(`بين العلامة ${wide.loValue} والعلامة ${wide.hiValue} تقف علامة واحدة أخرى`);
    const two = { a, b, lo: x.lo - 2, hi: x.hi, loValue: b * (x.lo - 2), hiValue: b * x.hi };
    expect(T.miss({ ...two, ...bracketSays(a, b, two.lo, two.hi) })).toContain('علامتان أخريان');
    expect(T.seen({ a, b, ...x, said: 'between' })).toContain(`بقيت ${x.r} خانة`);
  });

  it('nothing pre-solves the bridge that comes next: an experiment and the dash use only gaps he has crossed', () => {
    // forge 1 opens on island 3, forge 2 on island 4 (story.js › onArrive): no round is a bridge still ahead
    for (const { a, b } of ESTIMATE_INQUIRY.rounds) expect(ahead(3, a, b), `estimate ${a}/${b}`).toBe(false);
    for (const { a, b } of BRACKET_INQUIRY.rounds) expect(ahead(4, a, b), `bracket ${a}/${b}`).toBe(false);
    // the last steps, the attacks and the helps of the forges: none is a bridge of the story at all
    const all = BRIDGES.flatMap((s) => offered(s).map((b) => `${s.a}/${b}`));
    for (const F of Object.values(FORGES)) {
      const cases = [1, 2, 3].flatMap((n) => F.nudge(n, []).cases);
      for (let seed = 1; seed <= 40; seed += 1) {
        let s = seed * 7919;
        cases.push(
          F.use.make(() => {
            s = (s * 16807) % 2147483647;
            return (s - 1) / 2147483646;
          }),
        );
      }
      for (const c of cases) expect(all, `${F.key} ${c.a}/${c.b}`).not.toContain(`${c.a}/${c.b}`);
    }
    // the gate dash stands before the bridge of 1080: no wave says that gap
    const dashAt = STORY.segments.findIndex((s) => s.kind === 'rail');
    const later = STORY.segments.slice(dashAt + 1).filter((s) => s.kind === 'bridge');
    for (const w of STORY.dashWaves)
      for (const s of later) {
        expect(w.say, w.say).not.toMatch(new RegExp(`(^|\\D)${s.a}(\\D|$)`));
        expect(w.gates, w.say).not.toContain(s.a);
      }
  });
});
