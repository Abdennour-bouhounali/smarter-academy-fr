import { describe, it, expect } from 'vitest';
import { NUMBERS, STONE, STORY, TABLETS } from './story';

const divides = (d, n) => n % d === 0;
const digitSum = (n) =>
  String(n)
    .split('')
    .reduce((t, x) => t + Number(x), 0);
/** The value of « 46 », « 2 * 23 », « 1 + 1 + 7 », « 1575 = 5 * 315 + 0 »: sums of products of whole numbers. */
const evalSum = (s) =>
  s
    .replace(/\s/g, '')
    .split('+')
    .reduce(
      (t, term) =>
        t +
        term
          .split('*')
          .map(Number)
          .reduce((p, x) => p * x, 1),
      0,
    );
const said = (x) => expect(String(x)).not.toMatch(/undefined|NaN|\[object/);

describe('the numbers of « قواعد قابلية القسمة » — every fact of the story is computed', () => {
  it('islands A–C: 5 fills 35, 2 fills 46; 95 ends with 5, is odd, and its digits sum to 14', () => {
    const { gaps, planks, use, useMoulds } = NUMBERS.units;
    expect(gaps).toEqual([35, 46]);
    expect([gaps[0] / planks[0], gaps[1] / planks[1]]).toEqual([7, 23]);
    expect([use % 10, use % 2, digitSum(use)]).toEqual([5, 1, 14]);
    expect(useMoulds.filter((b) => divides(b, use))).toEqual([5]);
    expect(use / 5).toBe(19);
  });

  it('islands D–E: 81 ends with 1 (2 and 5 are left out) and its digits sum to 9; 111 sums to 3: 3 and not 9', () => {
    const { gap, plank, moulds, use, useMoulds, usePlank } = NUMBERS.sum;
    expect([gap % 2, gap % 10, digitSum(gap), gap / plank]).toEqual([1, 1, 9, 9]);
    expect(moulds.filter((b) => divides(b, gap))).toEqual([plank]);
    expect([digitSum(use), use % 3, use % 9, use / usePlank]).toEqual([3, 0, 3, 37]);
    expect(useMoulds.filter((b) => divides(b, use))).toEqual([usePlank]);
  });

  it('after the dash: 136 = 100 + 36, 36 = 4 × 9, 136 = 4 × 34; its digits sum to 10 and it ends with 6', () => {
    const { plank, use, useMoulds } = NUMBERS.last2;
    expect([use % 100, (use % 100) / plank, use / plank]).toEqual([36, 9, 34]);
    expect([digitSum(use), use % 10]).toEqual([10, 6]);
    expect(useMoulds.filter((b) => divides(b, use))).toEqual([plank]);
  });

  it('the stone: 1575 is odd, ends with 5, its digits sum to 18, its last two digits 75 = 4 × 18 + 3 → 3, 5 and 9', () => {
    const { gap } = NUMBERS.boss;
    expect([gap % 2, gap % 10, digitSum(gap), gap % 100, (gap % 100) % 4]).toEqual([1, 5, 18, 75, 3]);
    expect(STONE.answer).toEqual([3, 5, 9]);
    const quiz = STORY.text.quiz.stone;
    expect(quiz.options.map((o) => o.v)).toEqual([2, 3, 4, 5, 9]);
    expect(quiz.answer).toEqual(quiz.options.map((o) => o.v).filter((v) => divides(v, gap)));
    expect(quiz.a).toBe(gap);
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
      // the world draws every plank: never too many on one bridge
      expect(seg.a / seg.holdsWith, seg.id).toBeLessThanOrEqual(40);
    }
    const boss = STORY.segments.find((x) => x.boss);
    expect([boss.a, boss.holdsWith, boss.a / boss.holdsWith]).toEqual([1575, 45, 35]);
    expect([Math.floor(boss.a / 50), boss.a % 50]).toEqual([31, 25]);
    expect((boss.a / boss.holdsWith) * boss.boss.price).toBe(2800);
    const T = STORY.text.boss;
    for (const line of [T.price, T.costAsk(45, 35), T.err.cost(2500)]) {
      expect(line).toContain('دج');
      expect(line).not.toMatch(/DA|\d \d{3}/);
    }
    expect(T.costAsk(45, 35)).toContain('35 لوحًا');
  });

  it('every wave of the gate dash has exactly one gate that holds — checked against the arithmetic, not its own test', () => {
    expect(STORY.dashWaves).toHaveLength(8);
    const truth = [
      (n) => n % 5 === 0,
      (n) => n % 2 === 0,
      (n) => digitSum(n) % 9 === 0,
      (n) => digitSum(n) % 3 === 0,
      (n) => n % 10 === 0,
      (n) => n % 3 === 0 && n % 9 !== 0,
      (n) => 4 * n === 36,
      (n) => n % 4 === 0,
    ];
    STORY.dashWaves.forEach((w, i) => {
      expect(w.gates.filter(w.test), w.say).toHaveLength(1);
      expect(w.gates.filter(truth[i]), w.say).toEqual(w.gates.filter(w.test));
      expect(new Set(w.gates).size).toBe(3);
    });
  });

  it('the tablets: one per key, their equalities true, at most two short ones, and notes without a formula', () => {
    expect(Object.keys(TABLETS)).toEqual(['raqm-alahad', 'majmu-arqam', 'raqmayn-akhirayn', 'baqi-sifr']);
    let checked = 0;
    for (const t of Object.values(TABLETS)) {
      expect(t.math.length).toBeLessThanOrEqual(2);
      for (const m of t.math) {
        expect(m.length, m).toBeLessThanOrEqual(30);
        const values = m
          .replace(/\\times/g, '*')
          .split('=')
          .map(evalSum);
        expect(new Set(values).size, m).toBe(1);
        checked += 1;
      }
      for (const n of t.notes) expect(n).not.toMatch(/\$|\\/);
      for (const line of [...t.lines, ...t.math, ...t.notes, ...(t.list ?? [])]) said(line);
    }
    expect(checked).toBe(7);
    // the three sentences of the last tablet are true of its equality
    const [a, b] = TABLETS['baqi-sifr'].list[0].match(/\d+/g).map(Number);
    expect(a % b).toBe(0);
    // ONE line of rule above the three sentences: the board's naming card holds it at 1024 px
    const zero = TABLETS['baqi-sifr'];
    expect(zero.lines).toHaveLength(1);
    expect(zero.list).toEqual([`${a} يقبل القسمة على ${b}`, `${a} مضاعف للعدد ${b}`, `${b} يقسم ${a}`]);
    expect(zero.notes).toHaveLength(zero.math.length); // the equality above its own note
  });

  it('the title screen: the world’s name and a short name of the lesson’s own, two lines at most like every lesson', () => {
    const [world, own] = STORY.text.title.split(': ');
    expect(world).toBe('أرخبيل القواسم');
    expect(own.length).toBeLessThanOrEqual(14); // a longer name takes a third line and pushes the key hints out of 768 px
  });

  it('the story speaks of its own numbers only: nothing of the pilot, of lessons 2–3, or of the old version', () => {
    const words = JSON.stringify(STORY.text);
    expect(words).not.toMatch(/\b(756|1850|1015|735|280|2340|3046|1236)\b|بلّورة|العنيدة|المرفأ/);
    expect(words).not.toMatch(/undefined|NaN/);
  });
});
