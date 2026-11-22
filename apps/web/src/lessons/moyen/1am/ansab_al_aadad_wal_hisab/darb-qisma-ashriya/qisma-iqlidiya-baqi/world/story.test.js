import { describe, it, expect } from 'vitest';
import { NUMBERS, SPYGLASS, STORY, TABLETS, divide, upTo } from './story';

/** The value of « 30 = 4 * 7 + 2 »'s sides: sums of products of whole numbers. */
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

describe('the numbers of « القسمة الإقليدية » — every fact of the story is computed', () => {
  it('island A: 4 planks of 7 fill 28', () => {
    expect(divide(NUMBERS.first.a, NUMBERS.first.plank)).toEqual({ q: 4, r: 0 });
  });

  it('island B: 30 cells — 4 lays 7 planks and leaves 2 (an eighth needs 32), 7 lays 4 and leaves 2, 6 fills it', () => {
    const { a, moulds, probe } = NUMBERS.count;
    expect(moulds.map((b) => divide(a, b))).toEqual([
      { q: 7, r: 2 },
      { q: 5, r: 0 },
      { q: 4, r: 2 },
    ]);
    expect([probe * 7, probe * 8]).toEqual([28, 32]);
    expect(probe * 7 <= a && a < probe * 8).toBe(true);
  });

  it('islands C and D: 45 with the mould 8 leaves 5; 52 with the mould 6 lays 8 planks and leaves 4', () => {
    const { groups, rests } = NUMBERS;
    expect(groups.moulds.map((b) => divide(groups.a, b))).toEqual([
      { q: 5, r: 5 },
      { q: 5, r: 0 },
      { q: 7, r: 3 },
    ]);
    expect(rests.moulds.map((b) => divide(rests.a, b))).toEqual([
      { q: 10, r: 2 },
      { q: 13, r: 0 },
      { q: 8, r: 4 },
    ]);
    for (const { a, moulds } of [groups, rests]) for (const b of moulds) expect(divide(a, b).r).toBeLessThan(b);
    // the mould each mirror starts from is one that LEFT cells on the bridge he has just crossed
    expect(groups.moulds).toContain(groups.probe);
    expect(divide(groups.a, groups.probe)).toEqual({ q: 5, r: 5 });
    expect(rests.moulds).toContain(rests.probe);
    expect(divide(rests.a, rests.probe)).toEqual({ q: 8, r: 4 });
  });

  it('island E: 63 with 8 leaves 7 — the longest leftover of a plank of 8; island G: 78 = 13 × 6', () => {
    const { rebuild, two } = NUMBERS;
    expect(divide(rebuild.a, rebuild.probe)).toEqual({ q: 7, r: 7 });
    expect(divide(rebuild.a, rebuild.probe).r).toBe(rebuild.probe - 1);
    expect(rebuild.probe * 7 + 7).toBe(63);
    expect(divide(two.a, two.plank)).toEqual({ q: 6, r: 0 });
  });

  it('the spyglass: 692 = 27 × 25 + 17, between 20 and 30 planks — not 2–3, not 200–300', () => {
    const { a, plank } = NUMBERS.scope;
    expect(divide(a, plank)).toEqual({ q: 25, r: 17 });
    expect(SPYGLASS.options).toEqual([2, 20, 200]);
    expect(SPYGLASS.options.map(upTo)).toEqual([3, 30, 300]);
    const holds = SPYGLASS.options.filter((n) => plank * n <= a && a < plank * upTo(n));
    expect(holds).toEqual([SPYGLASS.tens]);
    // no question is asked before the rule exists: the story has no quiz of its own, the mirror opens at once
    expect(STORY.text.quiz).toBeUndefined();
    expect(STORY.onQuiz).toBeUndefined();
  });

  it('the cable-car station: 78 travellers, cabins of 8 — 9 full, 6 left, 10 needed; and its island is this lesson’s own', () => {
    const { cable, two } = NUMBERS;
    expect(cable.a).toBe(two.a); // as many travellers as the cells he has just crossed
    expect(divide(cable.a, cable.b)).toEqual({ q: 9, r: 6 });
    expect(Math.ceil(cable.a / cable.b)).toBe(10);
    const t = TABLETS['baqi-fi-masala'];
    expect(t.math).toEqual(['78 = 8 \\times 9 + 6', '9 + 1 = 10']);
    expect(t.notes[0]).toBe('78 مسافرًا في عربات تحمل 8: تمتلئ 9 عربات، ويبقى 6 مسافرين، فتلزم 10 عربات');
    expect(STORY.text.say.h).toContain('78 مسافرًا');
    // the 2AM lesson of the same road has a boat and its trips: this station borrows neither
    expect(JSON.stringify([STORY.text, TABLETS, STORY.islands])).not.toMatch(/قارب|قوارب|رحلة|رحلات/);
    expect(STORY.islands.find((i) => i.feature === 'stone').name).toBe('جزيرة التليفريك');
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
      // a dividend of at most three digits
      expect(seg.a).toBeLessThanOrEqual(999);
    }
    const boss = STORY.segments.find((x) => x.boss);
    expect([boss.a, boss.holdsWith, boss.a / boss.holdsWith]).toEqual([864, 36, 24]);
    // the other plank: 864 = 34 × 25 + 14; the estimate: 36 × 20 = 720 ≤ 864 < 1080 = 36 × 30
    expect(divide(boss.a, 34)).toEqual({ q: 25, r: 14 });
    expect(36 * 20 <= boss.a && boss.a < 36 * 30).toBe(true);
    expect((boss.a / boss.holdsWith) * boss.boss.price).toBe(1200);
    const T = STORY.text.boss;
    for (const line of [T.price, T.costAsk(36, 24), T.err.cost(1000)]) {
      expect(line).toContain('دج');
      expect(line).not.toMatch(/DA|\d \d{3}/);
    }
    expect(T.costAsk(36, 24)).toContain('24 لوحًا');
    // the store reads the leftover of the plank that does not fill it — with the agreed words
    expect(STORY.text.say.bossFail(34, 14)).toContain('دخل 25 لوحًا كاملًا وبقيت 14 خانة');
    expect([0, 1, 2, 5, 14].map((r) => T.tried(r))).toEqual([
      'جُرِّب: لا تبقى أيّ خانة',
      'جُرِّب: تبقى خانة واحدة',
      'جُرِّب: تبقى خانتان',
      'جُرِّب: تبقى 5 خانات',
      'جُرِّب: تبقى 14 خانة',
    ]);
    expect(T.err.big(34, 48)).toContain('بقيت 48 خانة');
  });

  it('every wave of the gate dash has exactly one gate that holds, and asks only what his three first keys have named', () => {
    expect(STORY.dashWaves).toHaveLength(8);
    for (const w of STORY.dashWaves) {
      expect(w.gates.filter(w.test), w.say).toHaveLength(1);
      expect(new Set(w.gates).size).toBe(3);
      said(w.say);
      expect(w.say).not.toMatch(/\$|\\/);
    }
    // the right gates, computed by hand: 30 ÷ 4 → 7, 30 ÷ 7 → r 2, 45 ÷ 6 → r 3, < 6 → 4, the biggest of 8 → 7,
    // 52 ÷ 6 → 8, 6 × 8 + 4 → 52, 63 ÷ 8 → 7
    expect(STORY.dashWaves.map((w) => w.gates.find(w.test))).toEqual([7, 2, 3, 4, 7, 8, 52, 7]);
    // the dash comes after the mirrors of islands C, D and E, and uses only gaps he has crossed
    const crossed = [NUMBERS.count.a, NUMBERS.groups.a, NUMBERS.rests.a, NUMBERS.rebuild.a];
    for (const w of STORY.dashWaves)
      for (const n of (w.say.match(/\d+/g) ?? []).map(Number).filter((x) => x >= 20))
        expect(crossed, w.say).toContain(n);
  });

  it('the tablets say the story’s own numbers, two short equalities at most, their equalities true, notes in words', () => {
    let checked = 0;
    for (const [key, t] of Object.entries(TABLETS)) {
      expect(t.math.length, key).toBeLessThanOrEqual(2);
      for (const m of t.math) {
        expect(m.split('=').length, m).toBeLessThanOrEqual(3);
        const values = m
          .replace(/\\times/g, '*')
          .split('=')
          .map(evalSum);
        expect(new Set(values).size, m).toBe(1);
        checked += 1;
      }
      for (const n of t.notes) expect(n, key).not.toMatch(/\$|\\/);
      for (const line of [...t.lines, ...t.math, ...t.notes]) said(line);
    }
    expect(checked).toBe(10);
    // the second tablet shows the longest leftover of a plank of 8, then the gap one cell longer
    expect(TABLETS['baqi-asghar'].math).toEqual(['47 = 8 \\times 5 + 7', '48 = 8 \\times 6 + 0']);
    expect(TABLETS['majmuaat-kamila'].notes[0]).toContain('7 ألواح كاملة');
    expect(TABLETS['taqdir-hasil'].notes[0]).toBe('20 لوحًا أوّلًا، ثمّ 5 ألواح أخرى: الحاصل 25');
  });

  it('THE FIRST TABLET DOES NOT SEAL THE SECOND KEY: it says when the laying stops by the planks, never by what is left', () => {
    const first = [...TABLETS['majmuaat-kamila'].lines, ...TABLETS['majmuaat-kamila'].notes].join(' ');
    expect(first).toContain('لا يدخل لوح آخر');
    expect(first).not.toMatch(/أقصر من|أصغر من|الباقي|باقٍ|ما بقي/);
    // « the largest remainder is b − 1 » is named on the second tablet, after its own forge
    const second = TABLETS['baqi-asghar'].lines.join(' ');
    expect(second).toContain('أكبر باقٍ ممكن هو $b - 1$');
    expect(second).toContain('$r < b$');
  });

  it('the store of the last bridge says the numbers of THIS lesson, in its own words', () => {
    const seg = STORY.segments.find((x) => x.boss);
    const T = STORY.text.boss;
    const lines = [
      T.mission,
      T.choose,
      T.price,
      T.divide(34),
      T.costAsk(36, 24),
      T.err.long(36, 25),
      T.err.sum(34, 25, 20),
    ];
    for (const line of lines) expect(line, line).toMatch(new RegExp(`\\b(${seg.a}|${seg.boss.price})\\b`));
    const words = JSON.stringify(STORY.text);
    // nothing of the pilot or of lessons 2 and 3: their gaps, their moulds, their prices
    expect(words).not.toMatch(/\b(756|1850|1015|735|280|96|1400|252)\b|بلّورة|العنيدة/);
    expect(words).not.toMatch(/undefined|NaN/);
  });
});
