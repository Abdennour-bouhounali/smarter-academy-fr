import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BASKETS, NUMBERS, STORY, TABLETS } from './story';
import { commonDivisors, divisorsOf, gcd } from './math';

const divides = (d, n) => n % d === 0;
const said = (x) => expect(String(x)).not.toMatch(/undefined|NaN|\[object/);
/** The value of « 18 \times 11 », « 6 \times 33 »: a product of whole numbers. */
const value = (s) =>
  s
    .replace(/\\times/g, '*')
    .split('*')
    .map((x) => Number(x.trim()))
    .reduce((p, x) => p * x, 1);
/** « \mathrm{PGCD}(198 ; 234) » → [198, 234] */
const pgcdArgs = (s) =>
  s
    .match(/PGCD\}\((\d+) ; (\d+)\)/)
    ?.slice(1)
    .map(Number);

describe('the numbers of « القاسم المشترك الأكبر » — every fact of the story is computed', () => {
  it('the twins 198 and 234: island A offers 7 (neither), 11 (the first only), 13 (the second only), 9 (both)', () => {
    const { gaps, moulds, neither, first, second, plank } = NUMBERS.twin;
    const [a, b] = gaps;
    expect([a, b]).toEqual([198, 234]);
    expect(new Set(moulds)).toEqual(new Set([neither, first, second, plank]));
    const kind = (d) => [divides(d, a), divides(d, b)];
    expect([kind(neither), kind(first), kind(second), kind(plank)]).toEqual([
      [false, false],
      [true, false],
      [false, true],
      [true, true],
    ]);
    // what the world shows of each: 198 = 7 × 28 + 2, 234 = 11 × 21 + 3, 198 = 13 × 15 + 3; 9 fills with 22 and 26
    expect([a % neither, b % first, a % second]).toEqual([2, 3, 3]);
    expect([a / plank, b / plank]).toEqual([22, 26]);
    expect(commonDivisors(a, b)).toEqual([1, 2, 3, 6, 9, 18]);
    expect(gcd(a, b)).toBe(18);
    expect([a / 18, b / 18, gcd(a / 18, b / 18)]).toEqual([11, 13, 1]);
  });

  it('the second pair 266 and 322: every plank of island C fills both; the purse of 42 coins pays for 14 alone', () => {
    const { gaps, moulds, plank, purse } = NUMBERS.second;
    const [a, b] = gaps;
    expect([a, b]).toEqual([266, 322]);
    expect(commonDivisors(a, b)).toEqual([1, 2, 7, 14]);
    expect(gcd(a, b)).toBe(plank);
    expect([a / 14, b / 14]).toEqual([19, 23]);
    for (const d of moulds) expect(divides(d, a) && divides(d, b), `${d}`).toBe(true);
    // a coin per plank: 14 spends the purse exactly; 7 runs out on the second bridge (38 + 4 of 46); 2 on the first
    expect(purse).toBe(a / plank + b / plank);
    expect(moulds.filter((d) => a / d + b / d <= purse)).toEqual([plank]);
    expect([a / 7, purse - a / 7, b / 7]).toEqual([38, 4, 46]);
    expect(a / 2).toBeGreaterThan(purse);
  });

  it('the long gap 342 = 18 × 19 holds with the longest common plank of the twins', () => {
    expect(NUMBERS.long.plank).toBe(gcd(...NUMBERS.twin.gaps));
    expect(NUMBERS.long.gap / NUMBERS.long.plank).toBe(19);
  });

  it('the bouquets of the forge: 40 roses and 56 lilies — 8 bouquets at most (5 roses and 7 lilies), and 1, 2, 4 work too', () => {
    const { roses, lilies } = NUMBERS.bouquets;
    expect(gcd(roses, lilies)).toBe(8);
    expect([roses / 8, lilies / 8]).toEqual([5, 7]);
    expect(commonDivisors(roses, lilies)).toEqual([1, 2, 4, 8]);
  });

  it('the stone: 228 dates and 276 figs — 4, 6 and 12 baskets work, 8 and 24 leave dates out; PGCD = 12', () => {
    const { dates, figs, options } = NUMBERS.baskets;
    expect(gcd(dates, figs)).toBe(12);
    expect(BASKETS).toEqual({ answer: [4, 6, 12], pgcd: 12 });
    for (const n of options) expect(divides(n, dates) && divides(n, figs), `${n}`).toBe(BASKETS.answer.includes(n));
    for (const n of BASKETS.answer) expect(divides(n, BASKETS.pgcd)).toBe(true); // every answer divides the PGCD
    const quiz = STORY.text.quiz.baskets;
    expect(quiz.answer).toEqual(BASKETS.answer);
    expect(Object.keys(quiz.wrong).map(Number)).toEqual([8, 24]);
    expect(quiz.wrong[8]).toContain('228 = 8 × 28 + 4');
    expect(quiz.wrong[8]).toContain('تبقى 4 تمرات');
    expect(quiz.wrong[24]).toContain('228 = 24 × 9 + 12');
    expect(quiz.wrong[24]).toContain('تبقى 12 تمرة');
    for (const line of [quiz.prompt, ...Object.values(quiz.wrong), quiz.wrongGeneric]) {
      said(line);
      expect(line).not.toContain('$'); // the stone prints plain text
    }
  });

  it('the market: 364 roses and 286 lilies — 26 identical bouquets of 14 roses and 11 lilies, one cell per flower', () => {
    const { roses, lilies, plank } = NUMBERS.boss;
    expect(gcd(roses, lilies)).toBe(26);
    expect([roses / 26, lilies / 26]).toEqual([14, 11]);
    expect(plank).toBe(gcd(roses, lilies));
    expect(STORY.text.problem).toBeUndefined(); // the store of the last bridge plays the market; no other screen
  });

  it('the last bridge needs the lesson: 28 fills the roses’ stretch alone, 26 is the longest plank of BOTH stretches', () => {
    const { roses, lilies, options, plank } = NUMBERS.boss;
    expect(options).toEqual([28, 26]);
    const [other] = options.filter((b) => b !== plank);
    // the distractor is longer than the answer and fills ONE stretch: a single division never chooses
    expect(other).toBeGreaterThan(plank);
    expect([roses % other, lilies % other]).toEqual([0, 6]); // 364 = 28 × 13 ; 286 = 28 × 10 + 6
    expect([roses / plank, lilies / plank]).toEqual([14, 11]);
    // the store divides the whole walkway: the same 6 empty cells as the lilies' stretch, so the world stays true
    expect((roses + lilies) % other).toBe(lilies % other);
    // the longest plank that fills both stretches is the answer, and no longer one does
    for (let b = plank + 1; b <= Math.min(roses, lilies); b += 1)
      expect(roses % b === 0 && lilies % b === 0).toBe(false);
    // the words make him look for the longest plank of BOTH stretches; they never tell him to compute it
    const { say, boss, objective } = STORY.text;
    for (const line of [boss.mission, boss.choose, say.boss, objective.bossGo]) {
      expect(line, line).toContain(String(roses));
      expect(line, line).toContain(String(lilies));
      expect(line, line).toMatch(/أطول/);
      expect(line, line).not.toMatch(/PGCD|احسب القاسم/);
    }
    expect(boss.choose).not.toMatch(/بالقسمة/);
    expect(say.bossFail(other, (roses + lilies) % other)).toMatch(
      /تملأ ممرّ الورود .*في ممرّ الزنابق \(286 خانة\) بقيت 6 خانات فارغة/,
    );
    expect(say.bossOk).toContain('25 لوحًا طولها 26: 14 في ممرّ الورود و 11 في ممرّ الزنابق');
  });

  it('every bridge holds with ONE of its moulds (a convoy: ONE plank of its first island builds all of it), the store has ONE right kind of plank, its price is in دج', () => {
    const bridges = STORY.segments.filter((x) => x.kind === 'bridge');
    for (const seg of bridges) {
      expect(seg.a % seg.holdsWith, seg.id).toBe(0);
      expect(seg.id).toBe(`g${seg.a}`);
      if (seg.boss) expect(seg.boss.options.filter((b) => seg.a % b === 0)).toEqual([seg.holdsWith]);
      else if (!seg.convoy)
        expect(
          seg.moulds.filter((b) => seg.a % b === 0),
          seg.id,
        ).toEqual([seg.holdsWith]);
    }
    // the two convoys: consecutive bridges, the later ones without planks and without a prediction
    expect(Object.keys(STORY.convoys)).toEqual(['crown']);
    for (const id of ['twins', 'crown']) {
      const group = bridges.filter((x) => x.convoy === id);
      expect(group).toHaveLength(2);
      const at = STORY.segments.indexOf(group[0]);
      expect(STORY.segments[at + 1]).toBe(group[1]);
      expect(group[1].moulds).toEqual([]);
      for (const seg of group) expect([seg.predict, seg.holdsWith]).toEqual([false, group[0].holdsWith]);
      const purse = STORY.convoys[id]?.purse ?? Infinity;
      const builds = group[0].moulds.filter(
        (b) => group.every((seg) => seg.a % b === 0) && group.reduce((n, seg) => n + seg.a / b, 0) <= purse,
      );
      expect(builds, id).toEqual([group[0].holdsWith]);
    }
    const boss = STORY.segments.find((x) => x.boss);
    expect([boss.a, boss.holdsWith, boss.a / boss.holdsWith]).toEqual([650, 26, 25]);
    expect(boss.a).toBe(NUMBERS.boss.roses + NUMBERS.boss.lilies);
    expect(boss.a % 28).toBe(6); // 650 = 28 × 23 + 6: the other plank leaves cells empty
    expect((boss.a / boss.holdsWith) * boss.boss.price).toBe(3500);
    const T = STORY.text.boss;
    for (const line of [T.price, T.costAsk(26, 25), T.err.cost(2000)]) {
      expect(line).toContain('دج');
      expect(line).not.toMatch(/\bDA\b|\d \d{3}/);
    }
    expect(T.costAsk(26, 25)).toContain('25 لوحًا');
    expect(STORY.text.subtitle).toContain('650 خانة');
  });

  it('the convoys speak before he picks: the instruction names both gaps (and the purse), the card what the last island showed', () => {
    // a world as small as the hooks read it: its convoys (Game.js › convoyOf, convoyTail, purseOf), its log, its words
    const segs = STORY.segments.map((s, index) => ({ ...s, index, complete: false, builtWith: null }));
    const game = {
      T: { objective: { ...STORY.text.objective, convoyBack: (n) => `ارجع إلى «${n}»` }, recall: STORY.text.recall },
      state: { held: null },
      flags: {},
      isl: STORY.islands,
      segs,
      log: [],
      convoyOf: (seg) => segs.filter((s) => s.convoy && s.convoy === seg.convoy),
      convoyTail: (seg) => Boolean(seg.convoy) && segs.find((s) => s.convoy === seg.convoy) !== seg,
      purseOf(seg) {
        const of = STORY.convoys[seg.convoy]?.purse;
        if (!of) return null;
        const spent = this.convoyOf(seg).reduce((n, s) => n + (s.complete ? s.a / s.builtWith : 0), 0);
        return { of, left: of - spent };
      },
    };
    const [g198, g234, g266, g322] = segs;
    // island A: both gaps, BEFORE he picks; island C: both gaps, the price and the purse
    expect(STORY.objective(game, g198)).toContain('هوّة 198 خانة، ثمّ هوّة 234 خانة');
    expect(STORY.objective(game, g266)).toMatch(/266 خانة ثمّ 322 خانة.*لكلّ لوح قطعة.*42 قطعة/);
    // island B with 11 in hand; with nothing in hand, or once refused: back to island A
    game.state.held = 11;
    expect(STORY.objective(game, g234)).toContain('بالألواح 11 التي تحملها');
    game.flags.convoyStuck = 'g234';
    expect(STORY.objective(game, g234)).toBe('ارجع إلى «مرسى التوأمين»');
    game.flags.convoyStuck = null;
    game.state.held = null;
    expect(STORY.objective(game, g234)).toBe('ارجع إلى «مرسى التوأمين»');
    // the card on B: the first bridge and the gap ahead
    Object.assign(g198, { complete: true, builtWith: 11 });
    expect(STORY.recall(game, 1)).toEqual(['الجسر الأوّل: $198 = 11 \\times 18$', 'أمامك الهوّة 234، بالألواح نفسها']);
    // the card on C: each plank he fired on the twins, and what it did there
    game.log = [
      { a: 198, b: 11 },
      { a: 234, b: 11 },
      { a: 198, b: 7 },
      { a: 198, b: 9 },
      { a: 234, b: 9 },
    ];
    expect(STORY.recall(game, 2)).toEqual([
      'اللوح 11: ملأ 198، ولم يملأ 234',
      'اللوح 7: لم يملأ 198',
      'اللوح 9: ملأ 198 و 234',
    ]);
    // the card on D: the first bridge of the crown and the coins it cost, agreed
    Object.assign(g266, { complete: true, builtWith: 7 });
    game.state.held = 7;
    expect(STORY.objective(game, g322)).toContain('بالألواح 7 التي تحملها، بما بقي في الكيس');
    expect(STORY.recall(game, 3)).toEqual([
      'الجسر الأوّل: $266 = 7 \\times 38$',
      'دفعتَ 38 قطعة، وبقيت في الكيس 4 قطع',
    ]);
    Object.assign(g266, { builtWith: 14 });
    expect(STORY.recall(game, 3)[1]).toBe('دفعتَ 19 قطعة، وبقيت في الكيس 23 قطعة');
    // the card on E: the planks needed by each plank he tried
    game.log.push({ a: 266, b: 2 }, { a: 266, b: 7 }, { a: 322, b: 7 }, { a: 266, b: 14 }, { a: 322, b: 14 });
    expect(STORY.recall(game, 4)).toEqual([
      'اللوح 2: الجسران يحتاجان 294 لوحًا',
      'اللوح 7: الجسران يحتاجان 84 لوحًا',
      'اللوح 14: الجسران يحتاجان 42 لوحًا',
    ]);
    // elsewhere: the world's own card, and its own instruction once a bridge is built
    expect(STORY.recall(game, 5)).toBe(null);
    expect(STORY.objective(game, g198)).toBe(null);
    expect(STORY.objective(game, segs[4])).toBe(null);
    // the sentences said on the way agree with their numbers
    const S = STORY.text.say;
    expect(S.secondFirst(7)).toBe('38 لوحًا طولها 7 تملأ 266 خانة، وبقيت في الكيس 4 قطع.');
    expect(S.secondFirst(14)).toContain('وبقيت في الكيس 23 قطعة');
    expect(S.first(9)).toContain('22 لوحًا طولها 9 تملأ 198 خانة');
    expect(S.twinOk(9)).toContain('26 لوحًا طولها 9 تملأ 234 خانة');
    expect(S.secondOk(14)).toContain('23 لوحًا طولها 14 تملأ 322 خانة');
    for (const line of [S.pairs, STORY.text.objective.crown]) expect(line).toContain('42 قطعة');
  });

  it('every wave of the gate dash has exactly one gate that holds, and stays mental arithmetic', () => {
    expect(STORY.dashWaves).toHaveLength(8);
    for (const w of STORY.dashWaves) {
      expect(w.gates.filter(w.test), w.say).toHaveLength(1);
      expect(new Set(w.gates).size).toBe(3);
      for (const n of w.say.match(/\d+/g).map(Number)) expect(n, w.say).toBeLessThanOrEqual(100);
    }
  });

  it('the tablets say the story’s own numbers, and their equalities are true', () => {
    let checked = 0;
    for (const t of Object.values(TABLETS)) {
      for (const m of t.math.flatMap((x) => x.split('\\qquad'))) {
        const [lhs, rhs] = m.split('=').map((x) => x.trim());
        const args = pgcdArgs(lhs);
        if (args) expect(gcd(...args), m).toBe(Number(rhs));
        else expect(Number(lhs), m).toBe(value(rhs));
        checked += 1;
      }
      expect(t.math.length, t.title).toBeLessThanOrEqual(2);
      for (const n of t.notes) expect(n, t.title).not.toContain('$');
      for (const line of [...t.lines, ...t.math, ...t.notes, ...(t.list ?? [])]) said(line);
    }
    expect(checked).toBeGreaterThanOrEqual(7);
    // a list breaks only AFTER a comma: a no-break space before each « ، »
    expect(TABLETS['qawasim-mushtaraka'].list[0]).toContain('1\u00a0، 2\u00a0، 3\u00a0، 6\u00a0، 9\u00a0، 18');
    expect(TABLETS['qawasim-al-pgcd'].list[0]).toContain(divisorsOf(12).join('\u00a0، '));
    for (const t of Object.values(TABLETS)) for (const line of t.list ?? []) expect(line, line).not.toMatch(/ ،/);
  });

  it('borrows no number and no island name of the finished lessons, and none of the bank’s headline pairs', () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const lessons = join(here, '../../../../../..');
    const others = [
      'moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/qasim-adad-tabii',
      'moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/qawasim-adad-tabii',
      'moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/khawass-qawasim',
      'moyen/1am/ansab_al_aadad_wal_hisab/darb-qisma-ashriya/qisma-iqlidiya-baqi',
      'moyen/1am/ansab_al_aadad_wal_hisab/darb-qisma-ashriya/qawaid-qabiliyat-qisma',
      'moyen/2am/ansab_al_aadad_wal_hisab/kusur-amaliyat/qisma-iqlidiya-hasr',
    ].map((p) => readFileSync(join(lessons, p, 'world/story.js'), 'utf8'));
    const theirNames = new Set(others.flatMap((s) => [...s.matchAll(/name: '([^']+)'/g)].map((m) => m[1])));
    for (const island of STORY.islands) expect(theirNames.has(island.name), island.name).toBe(false);
    // the headline numbers of this story (gaps, the stone, the problem) appear in no other story
    const headline = [...NUMBERS.twin.gaps, ...NUMBERS.second.gaps, NUMBERS.long.gap, NUMBERS.baskets.dates];
    headline.push(NUMBERS.baskets.figs, NUMBERS.boss.roses, NUMBERS.boss.lilies, 650);
    for (const n of headline) for (const s of others) expect(s, `${n}`).not.toMatch(new RegExp(`\\b${n}\\b`));
    // nor in this lesson's own exercise bank
    const bank = join(here, '../../../../../../../../../../content/practice/4am/qasim-mushtarak-akbar');
    const sheets = readdirSync(bank).flatMap((lvl) =>
      readdirSync(join(bank, lvl)).map((f) => readFileSync(join(bank, lvl, f), 'utf8')),
    );
    expect(sheets.length).toBe(50);
    for (const n of headline) for (const s of sheets) expect(s, `${n}`).not.toMatch(new RegExp(`\\b${n}\\b`));
  });
  it('tells no rule before its key: the islands, the sentences and the dash use only what he has already forged', () => {
    // an island's name is on its sign from afar: it names no rule and no answer (« جزيرة المشترك », « جزيرة الأربعة عشر »)
    for (const island of STORY.islands)
      expect(island.name, island.name).not.toMatch(/مشترك|أكبر|PGCD|قواسم|\d|عشر|الأربعة/);
    // the sentences said before the forge of « القواسم المشتركة » (islands A–C) and before « PGCD » (islands C–E)
    const S = STORY.text.say;
    const O = STORY.text.objective;
    const R = STORY.text.recall;
    for (const line of [STORY.text.subtitle, S.hello, S.first(11), S.b234, S.twinOk(9), O.twins, O.tail(234, 11)])
      expect(line, line).not.toMatch(/قاسم|مشترك|PGCD|الأكبر/);
    for (const line of [R.first(198, 11), R.ahead(234), R.twin(11, [{ a: 198, fills: true }])])
      expect(line, line).not.toMatch(/قاسم|مشترك|PGCD|الأكبر/);
    for (const line of [S.pairs, S.secondFirst(7), S.d322, S.secondOk(14), O.crown, O.tailPurse(322, 7)])
      expect(line, line).not.toMatch(/PGCD|الأكبر|القاسم المشترك|أطول/);
    for (const line of [R.first(266, 7), R.paid(38, 4), R.crown(7, 84)])
      expect(line, line).not.toMatch(/PGCD|الأكبر|القاسم المشترك|أطول/);
    // the gate dash comes after the keys 🤝 and 👑 and before 💐: no bouquet, no basket, no « divisors of »
    for (const w of STORY.dashWaves) expect(w.say, w.say).not.toMatch(/باق|سلّ|سلال|قواسم/);
    // the stone's question comes before 🧩: it asks about baskets, never about the divisors of the greatest
    const quiz = STORY.text.quiz.baskets;
    for (const line of [quiz.prompt, ...Object.values(quiz.wrong), quiz.wrongGeneric])
      expect(line, line).not.toMatch(/PGCD|الأكبر|قواسم/);
  });

  it('the store’s sentences agree with their numbers: each stretch says what planks of b leave on it', () => {
    const { say, boss } = STORY.text;
    expect(say.bossFail(28, 650 % 28)).toContain('في ممرّ الزنابق (286 خانة) بقيت 6 خانات فارغة');
    expect(say.bossFail(28, 650 % 28)).not.toMatch(/ممرّ الورود \(364 خانة\) بقيت/);
    // a plank that fills neither stretch: both are named, each with its own empty cells, in agreement
    expect(say.bossFail(24, 650 % 24)).toContain('في ممرّ الورود (364 خانة) بقيت 4 خانات فارغة');
    expect(say.bossFail(24, 650 % 24)).toContain('في ممرّ الزنابق (286 خانة) بقيت 22 خانة فارغة');
    expect(say.bossFail(95, 650 % 95)).toContain('بقيت خانة واحدة فارغة'); // 286 = 95 × 3 + 1
    expect(say.bossFail(71, 650 % 71)).toContain('بقيت خانتان فارغتان'); // 286 = 71 × 4 + 2
    expect(boss.err.big(24, 30)).toContain('بقيت 30 خانة فارغة');
    expect(STORY.text.quiz.baskets.wrong[8]).not.toMatch(/مع 8 سلال|يبقى 4 دون/);
  });
});
