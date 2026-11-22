import { describe, it, expect } from 'vitest';
import {
  tryPlank,
  lastNeeded,
  missedBy,
  judgeClaim,
  claimValues,
  LENSES,
  wall,
  pieceOf,
  quotientTex,
} from '../../../../../../common/gameworld/divisorIsles/inquiry';
import { STOP_INQUIRY, RULES_INQUIRY, TURN_INQUIRY, CUT_INQUIRY } from './inquiries';
import { FORGES } from './forges';
import { STORY } from './story';

const said = (x) => expect(String(x)).not.toMatch(/undefined|NaN|\[object/);

describe('the two investigations of « قواسم عدد طبيعي » — each rule found by an experiment of its own', () => {
  it('STOP starts on the gap of the island just crossed, and its three gaps do not stop at the same plank', () => {
    const before = STORY.segments[STORY.segments.findIndex((s) => s.kind !== 'bridge') - 1];
    expect(STOP_INQUIRY.gaps[0]).toBe(before.a);
    const stops = STOP_INQUIRY.gaps.map(lastNeeded);
    expect(new Set(stops).size).toBeGreaterThanOrEqual(3); // 6, 5, 7: the answer is never « the same as last time »
    // one gap whose last needed plank holds, one where it falls: « the last plank that held » is not the rule
    expect(STOP_INQUIRY.gaps.some((a) => a % lastNeeded(a) === 0)).toBe(true);
    expect(STOP_INQUIRY.gaps.some((a) => a % lastNeeded(a) !== 0)).toBe(true);
  });

  it('STOP: every sentence says what the strip did, and none states the rule', () => {
    const T = STOP_INQUIRY.text;
    const lines = [];
    STOP_INQUIRY.gaps.forEach((a, gi) => {
      const m = lastNeeded(a);
      lines.push(T.lead(a, gi), T.guess(a, gi), T.pick(a), T.ask(a, m + 2), T.pickOk(a, m, m), T.pickOk(a, m, m + 1));
      lines.push(T.foundLine(a, m), T.swept(3, a, false), T.swept(a - m - 2, a, true), T.stripLabel(a));
      for (let d = 1; d <= m + 2; d += 1) {
        const t = tryPlank(a, d);
        lines.push(
          t.whole ? (t.crossed ? T.known(a, t) : T.held(a, t)) : t.crossed ? T.fellBehind(a, t) : T.fell(a, t),
        );
      }
      for (let k = 1; k <= m + 5; k += 1)
        if (k !== m) lines.push(k > m ? T.pickLate(a, k, tryPlank(a, k)) : T.pickEarly(a, k, missedBy(a, k)));
    });
    for (const line of lines) {
      said(line);
      // the rule itself (« its square does not pass the gap ») is never written: he writes it
      expect(line, line).not.toMatch(/مربّع|جذر|يتجاوز/);
    }
    expect(T.pickEarly(30, 4, missedBy(30, 4))).toContain('لوحان');
  });

  it('STOP hands the mirror the planks HE tried, around the crossing — both kinds, and the right rule agrees with all', () => {
    const F = FORGES['tariqa-qawasim'];
    const { rows, rule } = F.fromInquiry({
      gaps: STOP_INQUIRY.gaps.map((a) => ({ a, m: lastNeeded(a), guess: null })),
    });
    expect(rule).toBeUndefined(); // he still has to WRITE it
    expect(rows).toHaveLength(8);
    expect(rows.some((c) => c.held && c.fits) && rows.some((c) => c.held && !c.fits)).toBe(true);
    expect(rows.some((c) => !c.held && c.fits) && rows.some((c) => !c.held && !c.fits)).toBe(true);
    for (const c of rows) {
      expect(STOP_INQUIRY.gaps.slice(0, 2)).toContain(c.a);
      expect(c.held).toBe(c.b <= lastNeeded(c.a));
      expect(F.says({ q: 'sq', c: 'leA' }, c)).toBe(c.held);
    }
  });

  it('RULES: each plank has its lens among those offered, its hand tests show the pattern', () => {
    const one = {
      5: ['units', [0, 5]],
      2: ['units', [0, 2, 4, 6, 8]],
      9: ['sum', [9, 18]],
      3: ['sum', [3, 6, 9, 12, 15, 18]],
    };
    expect(RULES_INQUIRY.planks.map((p) => p.b)).toEqual([5, 2, 9, 3, 4]);
    for (const p of RULES_INQUIRY.planks) {
      expect(p.lenses.every((id) => LENSES[id])).toBe(true);
      // tested by hand from b: at least two lit cells before the world may finish the chart
      const lit = Array.from({ length: p.manual }, (_, i) => p.b + i).filter((n) => n % p.b === 0);
      expect(lit.length, `plank ${p.b}`).toBeGreaterThanOrEqual(2);
      if (!one[p.b]) continue;
      const [lens, values] = one[p.b];
      expect(p.lenses).toContain(lens);
      expect(p.lenses[0], 'the lens that works is never the first one offered').not.toBe(lens);
      expect(judgeClaim(p.b, lens, values).ok).toBe(true);
      expect(judgeClaim(p.b, lens, values, 100).ok).toBe(true);
    }
  });

  it('RULES: 5 and 2 say « يساوي »; the others say « يقبل القسمة على » — and exactly ONE lens with ONE number holds', () => {
    const T = RULES_INQUIRY.text;
    expect(RULES_INQUIRY.planks.map((p) => p.link ?? 'equals')).toEqual([
      'equals',
      'equals',
      'divides',
      'divides',
      'divides',
    ]);
    expect(T.link).toEqual({ equals: 'يساوي', divides: 'يقبل القسمة على' });
    for (const p of RULES_INQUIRY.planks.filter((q) => q.link === 'divides')) {
      const holding = [];
      for (const lens of p.lenses)
        for (const k of RULES_INQUIRY.divisors) {
          const first = judgeClaim(p.b, lens, claimValues('divides', lens, [k], 0), 0);
          if (first.ok) holding.push(`${lens}/${k}`);
        }
      // 9 and 3 are read on the sum of the digits; 4 on the number its tens and units write
      const lens = p.b === 4 ? 'last2' : 'sum';
      expect(holding, `plank ${p.b}`).toEqual([`${lens}/${p.b}`]);
      expect(p.lenses[0], 'the lens that works is never the first one offered').not.toBe(lens);
      // what holds on the first chart holds on the next hundred, said the same way
      for (const from of [100, 200])
        expect(judgeClaim(p.b, lens, claimValues('divides', lens, [p.b], from), from).ok, `${p.b} from ${from}`).toBe(
          true,
        );
      said(T.valuesAsk(p.b, T.lens[lens], 'divides'));
      expect(T.foundLine(p.b, T.lens[lens], [p.b], 'divides')).toContain(`يقبل القسمة على ${p.b}`);
    }
  });

  it('RULES: what he claimed IS his rule — the mirror attacks it at once, and the key is used on the stone’s own gap', () => {
    const F = FORGES['qawaid-qisma'];
    const readings = [
      { b: 5, lens: 'units', values: [0, 5] },
      { b: 2, lens: 'units', values: [0, 2, 4, 6, 8] },
      { b: 9, lens: 'sum', values: [9, 18] },
      { b: 3, lens: 'sum', values: [3, 6, 9, 12, 15, 18] },
      { b: 4, lens: 'last2', values: [4] },
    ];
    const { rule, rows } = F.fromInquiry({ readings });
    expect(F.isTheRule(rule)).toBe(true);
    expect(RULES_INQUIRY.writes).toBe(true);
    for (const c of rows) expect(F.says(rule, c)).toBe(c.held);
    const attacks = F.attacks(rule, rows);
    expect(attacks.length).toBeGreaterThanOrEqual(2);
    for (const c of attacks) expect(c.a).toBeGreaterThanOrEqual(100); // gaps he has not seen: three digits
    expect(F.use.make().a).toBe(STORY.text.quiz.rules.a);
    expect(F.use.check({ a: 252 }, { s: '9', l: '52', n: '4' })).toBe('ok');
  });

  it('RULES: every sentence can be said, and none names a reading before he finds it', () => {
    const T = RULES_INQUIRY.text;
    const lines = [T.fill, T.look, T.sealed, T.done, T.link.equals, T.link.divides];
    lines.push(T.claim(3, 0), T.claim(0, 2), T.claim(1, 1));
    for (const p of RULES_INQUIRY.planks) {
      // the question and the goal are said before he tests: WHAT is looked for (no division each time) — never the reading
      expect(T.lead(p.b)).toContain(`لوح طوله ${p.b}`);
      expect(T.goal(p.b)).toMatch(/^الهدف: .*من شكلها.*دون تقسيم/);
      expect(T.goal(p.b)).toContain(`العدد ${p.b}`);
      expect(T.how(p.b, false)).toMatch(/الباقي 0 .*خضراء/);
      lines.push(T.lead(p.b), T.goal(p.b), T.how(p.b, false), T.how(p.b, true), T.rest(0), T.rest(p.b - 1));
      lines.push(T.lensAsk(p.b), T.board(p.b, 0), T.board(p.b, 100));
    }
    for (const line of lines) {
      said(line);
      expect(line, line).not.toMatch(/الآحاد|مجموع|الأخير/);
    }
    said(T.valuesAsk(5, T.lens.units));
    said(T.confirming(5, 100));
    said(T.confirmed(5, 100));
    said(T.foundLine(5, T.lens.units, [0, 5]));
    expect(T.claim(0, 0)).toBe('');
  });

  it('EVERY key of the lesson opens on an investigation of its own kind — no rule is found in the same mirror twice', () => {
    const kinds = Object.values(FORGES).map((F) => F.inquiry?.kind);
    expect(kinds).toEqual(['turn', 'cut', 'pairs', 'chart']);
    for (const F of Object.values(FORGES)) expect(typeof F.fromInquiry).toBe('function');
  });

  it('TURN starts from HIS first bridge, then a bridge that held, one that fell, a square one and one he does not see', () => {
    const first = STORY.segments[0];
    const [r0, ...rest] = TURN_INQUIRY.rounds;
    expect([r0.a, r0.d, r0.mode]).toEqual([first.a, first.holdsWith, 'hands']);
    const walls = TURN_INQUIRY.rounds.map((r) => wall(r.a, r.d));
    expect(walls.filter((w) => !w.even)).toHaveLength(1);
    expect(walls.some((w) => w.even && w.d === w.e)).toBe(true);
    expect(rest.at(-1).mode).toBe('blind');
    expect(walls.at(-1).even && walls.at(-1).d !== walls.at(-1).e).toBe(true);
    for (const w of walls) {
      expect(w.rows).toBeLessThanOrEqual(8); // the wall fits its frame
      expect(Math.max(w.d, w.e)).toBeLessThanOrEqual(12); // what he predicts is on the chips
    }
    const T = TURN_INQUIRY.text;
    const lines = [];
    for (const w of walls) {
      lines.push(T.wallLabel(w), T.under(w, false), T.under(w, true), T.lift(w), T.cut(w), T.askBlind(w));
      lines.push(w.even ? T.askPair(w) : T.askEqual(w));
      if (w.even) {
        lines.push(
          T.seen(w, null, true),
          T.seen(w, { len: w.e, count: w.d }, true),
          T.seen(w, { len: 5, count: 8 }, false),
        );
        lines.push(T.foundLine(w));
      } else lines.push(T.seenRagged(w, { equal: false }, true), T.seenRagged(w, { equal: true }, false));
    }
    for (const line of lines) {
      said(line);
      // the rule (« a plank as long as the COUNT of the first bridge ») is never written: he writes it
      expect(line, line).not.toMatch(/عدد ألواح الجسر الأوّل|طول اللوح الأوّل/);
    }
    const F = FORGES['jidaa-aamilayn'];
    const { rows, rule } = F.fromInquiry({ bridges: walls.map((w) => ({ a: w.a, d: w.d })) });
    expect(rule).toBeUndefined();
    expect(rows.map((c) => [c.a, c.b, c.held])).toEqual(walls.map((w) => [w.a, w.d, w.even]));
    // the right rule keeps its promise on every bridge of his that held; « the same count » does not
    for (const c of F.tests({ p: 'count', n: 'first' }, rows)) expect(c.held).toBe(true);
    expect(F.tests({ p: 'count', n: 'same' }, rows).some((c) => !c.held)).toBe(true);
  });

  it('CUT starts on the gap no mould filled; only two lengths need no cut; the four judged planks are of both kinds', () => {
    const stubborn = STORY.segments.find((x) => x.workshop);
    const { free, asks, text: T } = CUT_INQUIRY;
    expect(free.a).toBe(stubborn.a);
    const exact = Array.from({ length: free.a }, (_, i) => i + 1).filter((b) => free.a % b === 0);
    expect(exact).toHaveLength(free.exact);
    expect(pieceOf(free.a, free.start).exact).toBe(false); // it opens on a piece to saw
    expect(asks.filter((x) => x.a % x.b === 0)).toHaveLength(2);
    expect(asks.filter((x) => x.a % x.b !== 0)).toHaveLength(2);
    expect(asks[0].a % asks[0].b).not.toBe(0); // the first judged plank needs a cut: « yes » is not a habit
    const lines = [
      T.enough,
      T.countAsk(free.a),
      T.countMiss(1, [], free.a),
      T.countMiss(1, [31, 1], free.a),
      T.lengthIs(4),
    ];
    lines.push(
      T.free(free.a, false),
      T.free(free.a, true),
      T.sawLabel(31, 4),
      T.laid(7, 3),
      T.laid(4, 0),
      T.piece(3, 4),
    );
    for (const b of [1, 2, 4, 7, 31]) lines.push(T.fact(free.a, b, quotientTex(free.a, b), pieceOf(free.a, b)));
    for (const x of asks) {
      const p = pieceOf(x.a, x.b);
      lines.push(T.ask(x.a, x.b, quotientTex(x.a, x.b)), T.shown(x.a, x.b, p, true), T.shown(x.a, x.b, p, false));
    }
    for (const line of lines) {
      said(line);
      // the rule (« the exact quotient is a natural number ») is never written: he writes it
      expect(line, line).not.toMatch(/عدد طبيعي|بلا فاصلة|الحاصل/);
    }
    expect(T.countMiss(1, [31, 1], 31)).toContain('1 و 31');
    const F = FORGES['qasim-rappel'];
    const { rows, rule } = F.fromInquiry({ a: free.a, tried: [4, 14, 31, 1, 2, 3], asks });
    expect(rule).toBeUndefined();
    expect(rows).toHaveLength(8);
    for (const c of rows) expect(F.says({ q: 'exact', c: 'natural' }, c)).toBe(c.held);
    expect(rows.some((c) => c.held) && rows.some((c) => !c.held)).toBe(true);
  });
});
