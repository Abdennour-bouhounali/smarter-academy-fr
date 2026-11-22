import { describe, it, expect } from 'vitest';
import { NUMBERS, HARBOUR, STORY, TABLETS } from './story';

const divides = (d, n) => n % d === 0;
/** The value of « 21 + 35 », « 7 * 8 », « 280 * 2 + 175 »: sums and differences of products of whole numbers. */
const evalSum = (s) =>
  s
    .replace(/\s/g, '')
    .split(/(?=[+-])/)
    .reduce((t, term) => {
      const sign = term.startsWith('-') ? -1 : 1;
      return (
        t +
        sign *
          term
            .replace(/^[+-]/, '')
            .split('*')
            .map(Number)
            .reduce((p, x) => p * x, 1)
      );
    }, 0);
const said = (x) => expect(String(x)).not.toMatch(/undefined|NaN|\[object/);

describe('the numbers of « خواص قواسم عدد طبيعي » — every fact of the story is computed', () => {
  it('island A: 7 fills 21 and 35, their sum 56 and their difference 14; 7 fills 22 + 20 = 42 and neither part', () => {
    const { plank, gaps, foil } = NUMBERS.join;
    expect(gaps).toEqual([21, 35]);
    for (const g of gaps) expect(divides(plank, g)).toBe(true);
    expect([gaps[0] + gaps[1], gaps[1] - gaps[0]]).toEqual([56, 14]);
    expect([56 / plank, 14 / plank]).toEqual([8, 2]);
    expect(foil[0] + foil[1]).toBe(42);
    expect(divides(plank, 42)).toBe(true);
    expect(foil.filter((n) => divides(plank, n))).toEqual([]); // the converse is false in front of him
  });

  it('island B: 6 fills 18, so it fills 18 repeated — 36, 54 … and 100 copies, 1800 = 6 × 300', () => {
    const { bridge, plank, copies } = NUMBERS.stack;
    expect(divides(plank, bridge)).toBe(true);
    for (let k = 1; k <= copies; k += 1) expect(divides(plank, bridge * k)).toBe(true);
    expect(bridge * copies).toBe(1800);
    expect((bridge * copies) / plank).toBe(300);
  });

  it('island C: 735 = 2 × 280 + 175; the planks that fill BOTH fill the leftover; the others fill only 280', () => {
    const { long, short, plank, planks } = NUMBERS.peel;
    expect([Math.floor(long / short), long % short]).toEqual([2, 175]);
    const rest = long % short;
    expect([long / plank, short / plank, rest / plank]).toEqual([21, 8, 5]);
    const both = planks.filter((b) => divides(b, long) && divides(b, short));
    expect(both).toEqual([5, 7, 35]);
    for (const b of both) expect(divides(b, rest), `plank ${b}`).toBe(true);
    const onlyShort = planks.filter((b) => !divides(b, long) && divides(b, short));
    expect(onlyShort).toEqual([10, 14, 70]);
    for (const b of onlyShort) expect(divides(b, rest), `plank ${b}`).toBe(false); // the rule needs BOTH
  });

  it('the harbour: 1015 = 35 × 29, 455 = 35 × 13, 175 = 35 × 5, 560 = 35 × 16 — and 736 is not filled', () => {
    const { plank } = NUMBERS.boss;
    expect(HARBOUR).toEqual({ sum: 1015, diff: 455, rest: 175, twice: 560, plusOne: 736 });
    expect([HARBOUR.sum, HARBOUR.diff, HARBOUR.rest, HARBOUR.twice].map((n) => n / plank)).toEqual([29, 13, 5, 16]);
    expect(divides(plank, HARBOUR.plusOne)).toBe(false);
    const quiz = STORY.text.quiz.harbour;
    expect(quiz.options.map((o) => o.v).filter((v) => divides(plank, v))).toEqual(expect.arrayContaining(quiz.answer));
    expect(quiz.options.map((o) => o.v).filter((v) => divides(plank, v))).toHaveLength(quiz.answer.length);
    for (const v of Object.keys(quiz.wrong)) expect(quiz.answer).not.toContain(Number(v));
    said(quiz.prompt);
  });

  it('every bridge holds with ONE of its moulds, the store has ONE right kind of plank, its price is in دج', () => {
    for (const seg of STORY.segments.filter((x) => x.kind === 'bridge')) {
      expect(seg.a % seg.holdsWith, seg.id).toBe(0);
      if (seg.boss) expect(seg.boss.options.filter((b) => seg.a % b === 0)).toEqual([seg.holdsWith]);
      else
        expect(
          seg.moulds.filter((b) => seg.a % b === 0),
          seg.id,
        ).toEqual([seg.holdsWith]);
      expect(seg.id).toBe(`g${seg.a}`);
    }
    const boss = STORY.segments.find((x) => x.boss);
    expect([boss.a, boss.holdsWith, boss.a / boss.holdsWith]).toEqual([1015, 35, 29]);
    expect(boss.a % 30).toBe(25);
    expect((boss.a / boss.holdsWith) * boss.boss.price).toBe(4350);
    const T = STORY.text.boss;
    for (const line of [T.price, T.costAsk(35, 29), T.err.cost(4000)]) {
      expect(line).toContain('دج');
      expect(line).not.toMatch(/DA|\d \d{3}/);
    }
    expect(T.costAsk(35, 29)).toContain('29 لوحًا');
  });

  it('the bridge after the third key is one that key reads: what 280 leaves under the piece 175', () => {
    const { long, short, plank, after } = NUMBERS.peel;
    const piece = long % short;
    const i = STORY.segments.findIndex((s) => s.kind === 'rail') + 1;
    const seg = STORY.segments[i];
    // it is the gap that follows the forge of « باقي القسمة » (island 6), and it is 280 = 175 × 1 + 105
    expect(STORY.pendingForge({ state: { stage: i, keys: [] } })).toBe('baqi-qisma');
    expect([Math.floor(short / piece), short % piece]).toEqual([1, 105]);
    expect([seg.id, seg.a, seg.holdsWith, seg.predict]).toEqual(['g105', short % piece, plank, true]);
    expect(seg.moulds).toEqual(after);
    // the key decides before any plank is laid: ONE mould fills the bridge AND the piece — and it fills what is left
    const both = after.filter((b) => divides(b, short) && divides(b, piece));
    expect(both).toEqual([plank]);
    expect(after.filter((b) => divides(b, seg.a))).toEqual([plank]);
    // the two others are the lesson's trap: they fill the bridge only, and the key says nothing of them
    const one = after.filter((b) => divides(b, short) && !divides(b, piece));
    expect(one).toEqual([10, 14]);
    for (const b of one) expect(divides(b, seg.a), `mould ${b}`).toBe(false);
    // each of them is a plank he met on the table of the experiment
    expect(NUMBERS.peel.planks).toEqual(expect.arrayContaining(after));
    // the story says where the gap comes from, and the sentence of the held bridge is true
    const said = [];
    const game = { T: STORY.text, say: (line) => said.push(line), onModule: () => {} };
    STORY.afterKey['baqi-qisma'](game);
    expect(said[0]).toContain(`القطعة ${piece} على الجسر ${short}`);
    expect(said[0]).toContain(`${seg.a} خانة`);
    expect(STORY.onHold(game, seg)).toBe(true);
    expect(said[1]).toContain('280 = 175 \\times 1 + 105');
    expect(said[1]).toContain('105 = 35 \\times 3');
    expect(STORY.onHold(game, { id: 'g18' })).toBe(false);
  });

  it('every wave of the gate dash has exactly one gate that holds', () => {
    expect(STORY.dashWaves).toHaveLength(8);
    for (const w of STORY.dashWaves) {
      expect(w.gates.filter(w.test), w.say).toHaveLength(1);
      expect(new Set(w.gates).size).toBe(3);
    }
  });

  it('the gate dash gives nothing of the island it leads to away: no wave says 735, 280, 175, 105 or a product of 35', () => {
    const { long, short, plank } = NUMBERS.peel;
    const secret = [long, short, long % short, short % (long % short)];
    for (const w of STORY.dashWaves) {
      const numbers = [...(w.say.match(/\d+/g) ?? []).map(Number), ...w.gates];
      for (const n of secret) expect(numbers, w.say).not.toContain(n);
      // 35 is a gap of island A (« قاسم مشترك للعددين 21 و 35 »), never the plank of a product to complete
      expect(w.say, w.say).not.toContain(`${plank} \\times`);
    }
    // its last wave reads the sum island A showed: 7 × 6 = 42 = 22 + 20
    const last = STORY.dashWaves.at(-1);
    expect(last.say).toContain(`${NUMBERS.join.plank} \\times \\square = 42`);
    expect(last.gates.filter(last.test)).toEqual([6]);
  });

  it('agrees a count with what it counts: one plank, two planks, three to ten, eleven and more', () => {
    const T = STORY.text.boss;
    expect(T.err.long(35, 1)).toMatch(/^لوح واحد طوله 35/);
    expect(T.err.long(35, 2)).toMatch(/^لوحان طولهما 35/);
    expect(T.err.long(35, 3)).toMatch(/^3 ألواح طولها 35/);
    expect(T.err.long(35, 30)).toMatch(/^30 لوحًا طولها 35: 1050 خانة/);
    expect(STORY.text.say.first).toMatch(/^3 ألواح طولها 7 تملأ 21 خانة/);
    expect(STORY.text.say.bossOk).toMatch(/^29 لوحًا طولها 35/);
  });

  it('the tablets say the story’s own numbers, and their equalities are true', () => {
    const eqs = Object.values(TABLETS)
      .flatMap((t) => t.math)
      .flatMap((m) => m.split('\\qquad'))
      .map((m) => m.replace(/\\times/g, '*'))
      .filter((m) => /^[\d\s+\-=*]+$/.test(m)); // the equalities between numbers (the proof's letters are not)
    let checked = 0;
    for (const m of eqs) {
      const values = m.split('=').map(evalSum);
      expect(new Set(values).size, m).toBe(1);
      checked += 1;
    }
    expect(checked).toBeGreaterThanOrEqual(6);
    for (const t of Object.values(TABLETS)) for (const line of [...t.lines, ...t.math, ...t.notes]) said(line);
  });
});
