import { describe, it, expect } from 'vitest';
import {
  judgeClaim,
  claimValues,
  chartCells,
  joinOf,
  LENSES,
} from '../../../../../../common/gameworld/divisorIsles/inquiry';
import { UNITS_INQUIRY, SUM_INQUIRY, HUNDREDS_INQUIRY } from './inquiries';
import { FORGES } from './forges';
import { NUMBERS, STORY } from './story';

const said = (x) => expect(String(x)).not.toMatch(/undefined|NaN|\[object/);
const SPECS = { 'raqm-alahad': UNITS_INQUIRY, 'majmu-arqam': SUM_INQUIRY, 'raqmayn-akhirayn': HUNDREDS_INQUIRY };
const CHARTS = { 'raqm-alahad': UNITS_INQUIRY, 'majmu-arqam': SUM_INQUIRY };
/**
 * HOW an experiment is played, read from its spec — never declared by hand:
 *   chart  how its claim is said: « يساوي » (he gathers the values of a lens) or « يقبل القسمة على » (he names one number)
 *   join   what is done with the two gaps: glued (`sum`) or cut (`diff`)
 * Two keys with the same (kind, mode) would be the same experiment under two names.
 */
const modeOf = (spec) => {
  const uniq = (xs) => [...new Set(xs)].sort().join('+');
  if (spec.kind === 'chart') return uniq(spec.planks.map((p) => p.link ?? 'equals'));
  if (spec.kind === 'join') return uniq(spec.rounds.map((r) => r.op));
  return '';
};
const natureOf = (spec) => `${spec.kind}:${modeOf(spec)}`;
/** The lens and the claim that hold for each plank of a chart — what the student has to FIND (never written in a sentence). */
const RIGHT = {
  5: { lens: 'units', link: 'equals', values: [0, 5] },
  2: { lens: 'units', link: 'equals', values: [0, 2, 4, 6, 8] },
  9: { lens: 'sum', link: 'divides', values: [9] },
  3: { lens: 'sum', link: 'divides', values: [3] },
};
/** The words of the readings: no sentence of an experiment may say one before he has found it. */
const READING_WORDS = /الآحاد|العشرات|مجموع|الأخير|رقم|المشكّل/;
/** The gaps he tests by hand on a chart: `manual` from the plank on the first hundred, then the first three of the next. */
const NEXT_BY_HAND = 3;

describe('the three investigations of « قواعد قابلية القسمة » — each key found by an experiment of its own nature', () => {
  it('keys 1–3 open on an experiment; the last key has none (the mirror alone); no rule is written by an experiment', () => {
    expect(Object.keys(FORGES)).toEqual(['raqm-alahad', 'majmu-arqam', 'raqmayn-akhirayn', 'baqi-sifr']);
    for (const [key, spec] of Object.entries(SPECS)) expect(FORGES[key].inquiry, key).toBe(spec);
    expect(FORGES['baqi-sifr'].inquiry).toBeUndefined();
    // the tiles are written AFTER the experiment
    for (const s of Object.values(SPECS)) expect(s.writes).toBeFalsy();
  });

  it('NO two keys share the same (kind, mode) — computed from the specs', () => {
    const natures = Object.values(SPECS).map(natureOf);
    expect(natures).toEqual(['chart:equals', 'chart:divides', 'join:sum']);
    expect(new Set(natures).size).toBe(natures.length);
    // the guard really bites: key 3 played on a chart said « يقبل القسمة على » would be key 2's experiment again
    const again = { kind: 'chart', planks: [{ b: 4, link: 'divides' }] };
    expect(natureOf(again)).toBe(natureOf(SUM_INQUIRY));
    // a mode is ONE way of playing: a chart that mixed the two links, a gluing that also cut, would be two experiments
    for (const s of Object.values(SPECS)) expect(modeOf(s), natureOf(s)).not.toContain('+');
    // no data is shared between two keys: not a plank, not a list, not a word object
    const planks = [...Object.values(CHARTS).flatMap((s) => s.planks.map((p) => p.b)), HUNDREDS_INQUIRY.d];
    expect(planks).toEqual([5, 2, 9, 3, 4]);
    expect(new Set(planks).size).toBe(planks.length);
    const specs = Object.values(SPECS);
    for (let i = 0; i < specs.length; i += 1)
      for (let j = i + 1; j < specs.length; j += 1) {
        expect(specs[i].text).not.toBe(specs[j].text);
        expect(specs[i].planks ?? specs[i].rounds).not.toBe(specs[j].planks ?? specs[j].rounds);
      }
    expect(UNITS_INQUIRY.divisors).not.toBe(SUM_INQUIRY.divisors);
    expect(UNITS_INQUIRY.text.lens).not.toBe(SUM_INQUIRY.text.lens);
  });

  it('the planks are those of the story: 5 and 2 (35, 46), 9 and 3 (81, 111), 4 (the dash)', () => {
    expect(UNITS_INQUIRY.planks.map((p) => p.b)).toEqual(NUMBERS.units.planks);
    expect(SUM_INQUIRY.planks.map((p) => p.b)).toEqual([NUMBERS.sum.plank, NUMBERS.sum.usePlank]);
    expect(HUNDREDS_INQUIRY.d).toBe(NUMBERS.last2.plank);
    expect(UNITS_INQUIRY.planks.map((p) => p.link ?? 'equals')).toEqual(['equals', 'equals']);
    expect(SUM_INQUIRY.planks.map((p) => p.link)).toEqual(['divides', 'divides']);
    // a lens of the chart is one the world knows; « the number of the last two digits » is no longer a lens of this lesson
    for (const s of Object.values(CHARTS)) {
      expect(Object.keys(s.text.lens).sort()).toEqual(['sum', 'tens', 'units']);
      for (const p of s.planks) expect(p.lenses).not.toContain('last2');
    }
  });

  for (const [key, spec] of Object.entries(CHARTS)) {
    describe(`${key} — the chart`, () => {
      it('each plank: its lenses exist, the right one is never offered first, two lit cells before the world may finish', () => {
        for (const p of spec.planks) {
          expect(p.lenses.every((id) => LENSES[id])).toBe(true);
          expect(p.lenses).toContain(RIGHT[p.b].lens);
          expect(p.lenses[0], `plank ${p.b}`).not.toBe(RIGHT[p.b].lens);
          const lit = Array.from({ length: p.manual }, (_, i) => p.b + i).filter((n) => n % p.b === 0);
          expect(lit.length, `plank ${p.b}`).toBeGreaterThanOrEqual(2);
        }
      });

      it('exactly ONE claim holds on the chart, and it holds on the next hundreds said the same way', () => {
        for (const p of spec.planks) {
          const link = p.link ?? 'equals';
          const holding = [];
          for (const lens of p.lenses) {
            if (link === 'divides') {
              for (const k of spec.divisors)
                if (judgeClaim(p.b, lens, claimValues('divides', lens, [k], 0), 0).ok) holding.push(`${lens}/${k}`);
            } else {
              // « يساوي »: the only set that can hold is the set of values the lit cells show
              const lit = [
                ...new Set(
                  chartCells(0)
                    .filter((n) => n % p.b === 0)
                    .map(LENSES[lens].of),
                ),
              ];
              if (judgeClaim(p.b, lens, lit, 0).ok) holding.push(`${lens}/${lit.sort((x, y) => x - y).join(',')}`);
            }
          }
          const R = RIGHT[p.b];
          expect(holding, `plank ${p.b}`).toEqual([`${R.lens}/${R.values.join(',')}`]);
          for (const from of [100, 200]) {
            const taken = claimValues(R.link, R.lens, R.values, from);
            expect(judgeClaim(p.b, R.lens, taken, from).ok, `${p.b} from ${from}`).toBe(true);
          }
        }
      });

      it('the evidence the forge gets is gaps HE tested by hand: on the first hundred, or the first three of the next', () => {
        expect(spec.nextManual ?? NEXT_BY_HAND).toBe(NEXT_BY_HAND);
        const { rows } = FORGES[key].fromInquiry({ readings: [] });
        const planks = spec.planks.map((p) => p.b);
        expect(rows.length).toBeGreaterThanOrEqual(4);
        expect(rows.length).toBeLessThanOrEqual(8);
        for (const c of rows) {
          const p = spec.planks.find((x) => x.b === c.b);
          expect(planks).toContain(c.b);
          const byHand = c.a >= p.b && c.a < p.b + p.manual;
          const nextHundred = c.a >= 100 && c.a < 100 + NEXT_BY_HAND;
          expect(byHand || nextHundred, `${c.a}:${c.b}`).toBe(true);
          expect(c.held).toBe(c.a % c.b === 0);
        }
        // each plank: gaps it fills and gaps it does not, and one gap of the next hundred
        for (const b of planks) {
          const mine = rows.filter((c) => c.b === b);
          expect(mine.some((c) => c.held) && mine.some((c) => !c.held), `plank ${b}`).toBe(true);
          expect(mine.filter((c) => c.a >= 100).length, `plank ${b}`).toBe(1);
        }
      });

      it('every sentence can be said, and none names what to read before he finds it', () => {
        const T = spec.text;
        const lines = [T.fill, T.look, T.sealed, T.done, T.next, T.last, T.link.equals, T.link.divides];
        lines.push(T.claim(3, 0), T.claim(0, 2), T.claim(1, 1), T.claimOk(5));
        for (const p of spec.planks) {
          expect(T.lead(p.b)).toContain(`لوح طوله ${p.b}`);
          expect(T.goal(p.b)).toMatch(/^الهدف: .*من شكلها.*دون تقسيم/);
          expect(T.how(p.b, false)).toMatch(/الباقي 0 .*خضراء/);
          lines.push(T.lead(p.b), T.goal(p.b), T.how(p.b, false), T.how(p.b, true), T.rest(0), T.rest(p.b - 1));
          lines.push(T.lensAsk(p.b), T.board(p.b, 0), T.board(p.b, 100), T.seal(p.b), T.testBtn(p.b));
          lines.push(T.confirmTest(p.b, 100, 3), T.confirmTest(p.b, 100, 1), T.confirmTest(p.b, 200, 2));
          lines.push(T.confirming(p.b, 100), T.confirmed(p.b, 100));
          // the next hundred: he tests its first gaps HIMSELF — the sentence says how many, from where, and up to where
          expect(T.confirmTest(p.b, 100, 3)).toMatch(/بنفسك.*3 هوّات.*100.*199/);
          expect(T.confirmTest(p.b, 100, 1)).toContain('هوّة واحدة');
          expect(T.confirmTest(p.b, 100, 2)).toContain('هوّتين');
          // …and only then the world finishes it: the sentence no longer says the world tried the whole hundred alone
          expect(T.confirming(p.b, 100)).toMatch(/بنفسك.*يكمل/);
        }
        for (const line of lines) {
          said(line);
          expect(line, line).not.toMatch(READING_WORDS);
          expect(line, line).not.toContain('$');
        }
        expect(T.claim(0, 0)).toBe('');
        // the count agrees with its noun, its adjective and its verb: one, two, 3 … 10, more
        expect([1, 2, 8, 11].map((n) => T.claim(0, n))).toEqual([
          'خانة واحدة غير خضراء دخلت في اختيارك',
          'خانتان غير خضراوين دخلتا في اختيارك',
          '8 خانات غير خضراء دخلت في اختيارك',
          '11 خانة غير خضراء دخلت في اختيارك',
        ]);
        expect([1, 2, 5, 40].map((n) => T.claim(n, 0))).toEqual([
          'خانة خضراء واحدة بقيت خارجه',
          'خانتان خضراوان بقيتا خارجه',
          '5 خانات خضراء بقيت خارجه',
          '40 خانة خضراء بقيت خارجه',
        ]);
        expect(T.claim(2, 8)).toBe('8 خانات غير خضراء دخلت في اختيارك · خانتان خضراوان بقيتا خارجه');
        for (const p of spec.planks) {
          const R = RIGHT[p.b];
          said(T.valuesAsk(p.b, T.lens[R.lens], R.link));
          const found = T.foundLine(p.b, T.lens[R.lens], R.values, R.link);
          said(found);
          if (R.link === 'divides') expect(found).toContain(`يقبل القسمة على ${p.b}`);
        }
      });
    });
  }

  it('each chart starts from what he has just done: the gap the plank filled in the story', () => {
    const [g35, g46] = NUMBERS.units.gaps;
    expect(UNITS_INQUIRY.text.lead(5)).toContain(`ملأ الهوّة ${g35}`);
    expect(UNITS_INQUIRY.text.lead(2)).toContain(`ملأ الهوّة ${g46}`);
    expect(SUM_INQUIRY.text.lead(9)).toContain(`ملأ الهوّة ${NUMBERS.sum.gap}`);
    // every « ملأ الهوّة » is a bridge of the story that plank really builds
    const built = STORY.segments.filter((s) => s.kind === 'bridge').map((s) => `${s.holdsWith}:${s.a}`);
    for (const [b, a] of [
      [5, g35],
      [2, g46],
      [9, NUMBERS.sum.gap],
    ])
      expect(built, `${b} fills ${a}`).toContain(`${b}:${a}`);
    // 3 is met on the chart first: no gap of the story is named for it
    expect(SUM_INQUIRY.text.lead(3).match(/\d+/g)).toEqual(['3']);
    expect(SUM_INQUIRY.text.lead(3)).not.toContain('ملأ');
    // no plank filled a gap of 28: it was a GATE of the dash — no chart sentence says a plank filled it
    for (const s of Object.values(CHARTS)) for (const b of [2, 3, 4, 5, 9]) expect(s.text.lead(b)).not.toContain('28');
  });

  describe('raqmayn-akhirayn — the hundreds and a short gap, glued', () => {
    const spec = HUNDREDS_INQUIRY;
    const T = spec.text;
    const D = spec.d;
    const facts = spec.rounds.map((r) => ({ ...r, d: D, ...joinOf(D, r.a, r.b, r.op) }));
    const dash = STORY.dashWaves.at(-1);

    it('it starts from what he has just done: the last sentence of the gate dash, and the gate that was divisible by 4', () => {
      expect(dash.say).toBe('عدد يقبل القسمة على 4');
      const [yes] = dash.gates.filter((n) => n % 4 === 0);
      const no = dash.gates.find((n) => n % 4 !== 0);
      expect([yes, no]).toEqual([28, 26]);
      // a fact about a GATE (a number divisible by 4) — never « the plank 4 filled the gap 28 »: no bridge of 28 was built
      expect(T.lead(D)).toContain(`${yes} هو العدد الذي يقبل القسمة على ${D}`);
      expect(T.lead(D)).not.toMatch(/ملأ/);
      expect(STORY.segments.some((s) => s.a === yes)).toBe(false);
      // the two first rounds glue the dash's own numbers after ONE hundred
      expect(spec.rounds.slice(0, 2)).toEqual([
        { op: 'sum', a: 100, b: yes },
        { op: 'sum', a: 100, b: no },
      ]);
    });

    it('every round glues a gap of whole hundreds, which the plank always fills, and a gap of two digits', () => {
      expect(spec.rounds.length).toBeGreaterThanOrEqual(6);
      expect(spec.rounds.length).toBeLessThanOrEqual(7);
      for (const f of facts) {
        expect(f.op).toBe('sum');
        expect(f.a % 100 === 0 && f.a >= 100, `${f.a} is a number of hundreds`).toBe(true);
        expect(f.fillsA, `the plank fills ${f.a}`).toBe(true);
        expect(f.b >= 10 && f.b <= 99, `${f.b} has two digits`).toBe(true);
        expect(f.value).toBe(f.a + f.b);
        // THE fact of the experiment, on every round: the glued gap is filled exactly when the short one is
        expect(f.holds, `${f.a} + ${f.b}`).toBe(f.fillsB);
        // the two digits of the short gap are the last two digits of the glued one
        expect(f.value % 100).toBe(f.b);
      }
      // every hundred is filled by 4: 100 = 4 × 25
      for (let h = 100; h <= 2000; h += 100) expect(h % D, String(h)).toBe(0);
    });

    it('the four situations the rule needs: filled / not filled after hundreds, the SAME two digits after other hundreds, the same last digit', () => {
      const by = (b) => facts.filter((f) => f.b === b);
      // a short gap the plank fills, and one it does not
      expect(facts.some((f) => f.fillsB && f.holds)).toBe(true);
      expect(facts.some((f) => !f.fillsB && !f.holds)).toBe(true);
      // the same short gap after two different numbers of hundreds, once filled and once not: the verdict does not move
      const twice = [...new Set(facts.map((f) => f.b))].filter((b) => new Set(by(b).map((f) => f.a)).size >= 2);
      expect(twice.some((b) => by(b).every((f) => f.holds))).toBe(true);
      expect(twice.some((b) => by(b).every((f) => !f.holds))).toBe(true);
      // at least three different numbers of hundreds, each met in a gap that is filled AND in one that is not
      const hundreds = [...new Set(facts.map((f) => f.a))];
      expect(hundreds.length).toBeGreaterThanOrEqual(3);
      for (const h of hundreds)
        expect(new Set(facts.filter((f) => f.a === h).map((f) => f.holds)).size, `${h}`).toBe(2);
      // the units digit alone does not decide: two glued gaps end with the same digit, one filled and one not
      const sameUnits = facts.some((f) => facts.some((g) => g.value % 10 === f.value % 10 && g.holds !== f.holds));
      expect(sameUnits).toBe(true);
      // nor the tens digit alone
      const tens = (n) => Math.floor(n / 10) % 10;
      expect(facts.some((f) => facts.some((g) => tens(g.value) === tens(f.value) && g.holds !== f.holds))).toBe(true);
      // nor being even: every gap of the experiment is even
      expect(facts.every((f) => f.value % 2 === 0)).toBe(true);
      // nor the sum of the digits: no number divides the sums of the filled gaps without dividing one of the others
      const sum = (n) =>
        String(n)
          .split('')
          .reduce((t, x) => t + Number(x), 0);
      for (let k = 2; k <= 9; k += 1) {
        const takes = (f) => sum(f.value) % k === 0;
        expect(
          facts.every((f) => takes(f) === f.holds),
          `sum of the digits by ${k}`,
        ).toBe(false);
      }
      // no round is the bridge the story asks right after the key
      for (const f of facts) expect(f.value).not.toBe(NUMBERS.last2.use);
      expect(new Set(facts.map((f) => f.value)).size).toBe(facts.length);
    });

    it('the world can draw every round: both strips at one scale, the short strip wide enough for its own line', () => {
      // InquiryCombine.jsx › Join: 920 units for a + b cells, each line centred under its strip from x = 40
      for (const f of facts) {
        const u = 920 / f.value;
        expect(f.value, `${f.value} cells`).toBeLessThanOrEqual(340);
        // a plank is at least 9 units wide, a piece of 2 cells at least 4
        expect(D * u).toBeGreaterThanOrEqual(9);
        if (f.rest) expect(f.rest * u - 1.5, `the piece left of ${f.value}`).toBeGreaterThanOrEqual(4);
        // the short strip: its line (at most 16 signs, about 8 units each) stays right of x = 0
        const line = T.label(f.b, D, { planks: f.planksB, rest: f.b % D });
        expect(line.length, line).toBeLessThanOrEqual(16);
        expect(40 + (f.b * u) / 2, `the line under ${f.b} in ${f.value}`).toBeGreaterThanOrEqual(line.length * 4);
      }
    });

    it('the evidence the forge gets is what HE did: the gaps he glued, in order — from his result, round by round', () => {
      const F = FORGES['raqmayn-akhirayn'];
      const played = { rounds: facts.map((f) => ({ op: f.op, a: f.a, b: f.b, d: f.d, guess: true, holds: f.holds })) };
      const { rows, rule } = F.fromInquiry(played);
      expect(rule).toBeUndefined();
      expect(rows.map((c) => [c.a, c.b, c.held])).toEqual(facts.map((f) => [f.value, D, f.holds]));
      // a student who stopped after three rounds gets three lines, never a line he did not see
      expect(F.fromInquiry({ rounds: played.rounds.slice(0, 3) }).rows.map((c) => c.a)).toEqual(
        facts.slice(0, 3).map((f) => f.value),
      );
      expect(rows.some((c) => c.held) && rows.some((c) => !c.held)).toBe(true);
      expect(rows.length).toBeLessThanOrEqual(8);
      // the tiles let him write what the experiment showed: « the number its units and tens digits write »
      const reads = F.slots.find((s) => s.id === 'read').options.map((o) => o.label);
      expect(reads).toContain('العدد المشكّل من رقمَي آحادها وعشراتها');
    });

    it('every sentence can be said; none states the rule or names what to read; the labels are plain text', () => {
      const lines = [T.lead(D), T.goal(D), T.yes, T.no, T.next, T.done];
      const plain = [T.goal(D), T.yes, T.no, T.next, T.done];
      for (const f of facts) {
        const ask = T.ask({ op: f.op, a: f.a, b: f.b, d: D, fillsA: f.fillsA, fillsB: f.fillsB });
        // the question never says the fact it asks about
        expect(ask).toContain(String(f.a));
        expect(ask).toContain(String(f.b));
        expect(ask).not.toContain(String(f.value));
        for (const guess of [true, false]) {
          const seen = T.seen(f, guess);
          expect(seen).toContain(`$${f.a} + ${f.b} = ${f.value}$`);
          expect(seen).toContain(guess === f.holds ? 'كما توقّعت' : 'لم يكن هذا توقّعك');
          expect(seen).toContain(f.holds ? 'ولا خانة باقية' : 'وبقيت');
          expect(seen).not.toMatch(/خطأ|أخطأت/);
          lines.push(seen);
        }
        const found = T.foundLine({ ...f, guess: true });
        expect(found).toContain(`يملأ ${f.a}`);
        expect(found).toContain(`${f.fillsB ? 'يملأ' : 'لا يملأ'} ${f.b}`);
        expect(found.endsWith(`${f.holds ? 'يملأ' : 'لا يملأ'} ${f.value}`)).toBe(true);
        lines.push(ask, found);
        for (const [n, q] of [
          [f.a, { planks: f.planksA, rest: f.a % D }],
          [f.b, { planks: f.planksB, rest: f.b % D }],
          [f.value, { planks: f.planks, rest: f.rest }],
        ]) {
          const line = T.label(n, D, q);
          expect(line.startsWith(`${n}: `), line).toBe(true);
          expect(line.includes('بقيت'), line).toBe(q.rest > 0);
          plain.push(line);
        }
      }
      for (const line of [...lines, ...plain]) {
        said(line);
        expect(line, line).not.toMatch(READING_WORDS);
        // a fact of the strips, never the rule: no « المئات » that « do not count », no « دائمًا »
        expect(line, line).not.toMatch(/المئات|دائمًا|لا تغيّر|يكفي/);
      }
      for (const line of plain) expect(line, line).not.toMatch(/\$|\\/);
      expect(T.goal(D)).toMatch(/^الهدف: /);
      expect((T.lead(D).match(/\$/g) ?? []).length).toBe(0);
    });
  });
});
