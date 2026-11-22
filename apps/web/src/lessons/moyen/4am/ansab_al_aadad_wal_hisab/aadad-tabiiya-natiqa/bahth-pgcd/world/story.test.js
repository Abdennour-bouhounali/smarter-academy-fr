import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ladderOf } from '../../../../../../common/gameworld/divisorIsles/inquiry';
import { bothOf } from '../../../../../../common/gameworld/divisorIsles/gcdModes';
import { NUMBERS, STORY, TABLETS, roadOf } from './story';
import { differences, euclid, gcd } from './math';
import { IQLIDIS_BENCH, SIBAQ_BENCH, TARH_BENCH } from './inquiries';

const said = (x) => expect(String(x)).not.toMatch(/undefined|NaN|\[object/);
/** The value of « 19 \times 4 + 3 » or « 152 - 95 ». */
const value = (s) => {
  const t = s.replace(/\\times/g, '*').trim();
  const sub = t.match(/^(\d+) - (\d+)$/);
  if (sub) return Number(sub[1]) - Number(sub[2]);
  const [prod, plus] = t.split('+').map((x) => x.trim());
  return (
    prod
      .split('*')
      .map((x) => Number(x.trim()))
      .reduce((p, x) => p * x, 1) + Number(plus ?? 0)
  );
};
/** « \mathrm{PGCD}(32 ; 44) » → [32, 44] */
const pgcdArgs = (s) =>
  s
    .match(/PGCD\}\((\d+) ; (\d+)\)/)
    ?.slice(1)
    .map(Number);
/** The plank lengths (1 … the longest gap) that build EVERY bridge of a road with its coins: a coin per plank laid. */
const builders = (gaps, purse = Infinity) => {
  const max = Math.max(...gaps);
  const out = [];
  for (let b = 1; b <= max; b += 1)
    if (gaps.every((a) => a % b === 0) && gaps.reduce((n, a) => n + a / b, 0) <= purse) out.push(b);
  return out;
};
const here = dirname(fileURLToPath(import.meta.url));
const lessons = join(here, '../../../../../..');
/** The stories of the lessons that are done (v2): no number, no pair, no island name of theirs here. */
const OTHERS = [
  'moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/qasim-adad-tabii',
  'moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/qawasim-adad-tabii',
  'moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/khawass-qawasim',
  'moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/qasim-mushtarak-akbar',
  'moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/tayin-pgcd',
  'moyen/1am/ansab_al_aadad_wal_hisab/darb-qisma-ashriya/qisma-iqlidiya-baqi',
  'moyen/1am/ansab_al_aadad_wal_hisab/darb-qisma-ashriya/qawaid-qabiliyat-qisma',
  'moyen/2am/ansab_al_aadad_wal_hisab/kusur-amaliyat/qisma-iqlidiya-hasr',
].map((p) => readFileSync(join(lessons, p, 'world/story.js'), 'utf8'));
/** This lesson's exercise bank: its 50 sheets, every pair it names, and every line of its solutions. */
const bankDir = join(here, '../../../../../../../../../../content/practice/4am/bahth-pgcd');
const SHEETS = readdirSync(bankDir).flatMap((lvl) =>
  readdirSync(join(bankDir, lvl)).map((f) => readFileSync(join(bankDir, lvl, f), 'utf8')),
);
const BANK_PAIRS = new Set(
  SHEETS.flatMap((s) =>
    [...s.matchAll(/PGCD\s*\(\s*(\d+)\s*;\s*(\d+)\s*\)|للعددين\s+(\d+)\s+و\s+(\d+)/g)].map((m) =>
      [Number(m[1] ?? m[3]), Number(m[2] ?? m[4])].sort((x, y) => x - y).join(';'),
    ),
  ),
);
const pairKey = (x, y) => [x, y].sort((p, q) => p - q).join(';');
/** A number standing alone (not a piece of a longer number) in a text. */
const alone = (n) => new RegExp(`(?<![0-9])${n}(?![0-9])`);
/** The pairs of the road: each convoy's gaps, the fold's, the last bridge's lanes. */
const PAIRS = [
  NUMBERS.diff.gaps.slice(0, 2),
  NUMBERS.diff.gaps.slice(1),
  NUMBERS.tarh.gaps,
  NUMBERS.fold.gaps,
  NUMBERS.iqlidis.gaps,
  NUMBERS.sibaq.gaps,
  NUMBERS.boss.lanes,
];

describe('the numbers of « البحث عن القاسم المشترك الأكبر » — every fact of the road is computed', () => {
  it('convoy « diff » (152, 95, 57): the third is the first minus the second; 19 fills the three, 8, 5, 3 one each', () => {
    const { gaps, moulds, plank } = NUMBERS.diff;
    const [a, b, c] = gaps;
    expect(c).toBe(a - b);
    expect(builders(gaps)).toEqual([1, plank]);
    expect(plank).toBe(gcd(a, b));
    expect(moulds).toContain(plank);
    // each other plank of island A fills exactly ONE of the three gaps — a different one each
    const fillsOnly = (d) => gaps.filter((x) => x % d === 0);
    expect(moulds.filter((d) => d !== plank).map(fillsOnly)).toEqual([[a], [b], [c]]);
    expect(fillsOnly(plank)).toEqual(gaps);
    // what the world shows of each, gap after gap (the card on island D): no purse on this convoy
    const all = () => true;
    expect(roadOf(gaps, Infinity, 8, all)).toEqual([
      { a: 152, did: 'fills' },
      { a: 95, did: 'open' },
    ]);
    expect(roadOf(gaps, Infinity, 5, all)).toEqual([{ a: 152, did: 'open' }]);
    expect(roadOf(gaps, Infinity, 19, all)).toEqual(gaps.map((x) => ({ a: x, did: 'fills' })));
  });

  it('convoy « tarh » (259 then 185, 12 coins): only planks of 37 build both — 7 + 5; its bench is the subtraction ladder', () => {
    const { gaps, purse, plank } = NUMBERS.tarh;
    expect(builders(gaps, purse)).toEqual([plank]);
    expect(plank).toBe(gcd(...gaps));
    expect([gaps[0] / plank, gaps[1] / plank]).toEqual([7, 5]);
    // the bench: the ladder of subtractions, short enough for its screen (≤ 10 rows)
    const L = ladderOf(...gaps, 'subtract');
    expect([L.steps, L.gcd]).toEqual([differences(...gaps).length, plank]);
    expect(L.steps).toBeLessThanOrEqual(10);
    expect(TARH_BENCH).toMatchObject({ kind: 'ladder', mode: 'subtract', rounds: [{ a: gaps[0], b: gaps[1] }] });
    // 1 fills both but costs 444 coins
    expect(roadOf(gaps, purse, 1, () => true)).toEqual([{ a: 259, did: 'coins' }]);
  });

  it('convoy « iqlidis » (1833 then 546, 61 coins): only 39 — 47 + 14; its bench is the division ladder', () => {
    const { gaps, purse, plank } = NUMBERS.iqlidis;
    expect(builders(gaps, purse)).toEqual([plank]);
    expect(plank).toBe(gcd(...gaps));
    expect([gaps[0] / plank, gaps[1] / plank, purse]).toEqual([47, 14, 61]);
    // 13 fills both but costs 141 + 42 coins
    expect(roadOf(gaps, purse, 13, () => true)).toEqual([{ a: 1833, did: 'coins' }]);
    expect(euclid(...gaps).map((s) => [s.q, s.r])).toEqual([
      [3, 195],
      [2, 156],
      [1, 39],
      [4, 0],
    ]);
    expect(IQLIDIS_BENCH).toMatchObject({ kind: 'ladder', mode: 'divide', rounds: [{ a: gaps[0], b: gaps[1] }] });
  });

  it('convoy « sibaq » (1003 then 34, 61 coins): only 17 — 59 + 2; its bench runs both ladders, 31 rows against 2', () => {
    const { gaps, purse, plank } = NUMBERS.sibaq;
    expect(builders(gaps, purse)).toEqual([plank]);
    expect([gaps[0] / plank, gaps[1] / plank]).toEqual([59, 2]);
    const both = bothOf(...gaps);
    expect([both.steps.subtract, both.steps.divide, both.shorter, both.gcd]).toEqual([31, 2, 'divide', plank]);
    expect(SIBAQ_BENCH).toMatchObject({ kind: 'ladder', mode: 'both', rounds: [{ a: gaps[0], b: gaps[1] }] });
    // 34, the shorter gap, does not fill 1003
    expect(roadOf(gaps, purse, 34, () => true)).toEqual([{ a: 1003, did: 'open' }]);
  });

  it('the fold of forge 🧮 (962 ; 296): three subtractions of 296 are one division', () => {
    const [a, b] = NUMBERS.fold.gaps;
    expect(euclid(a, b)[0]).toEqual({ a, b, q: 3, r: 74 });
    expect(
      differences(a, b)
        .slice(0, 3)
        .map((s) => s.y),
    ).toEqual([b, b, b]);
  });

  it('the last bridge needs the lesson: 56 fills the first lane alone, 28 is the longest plank of BOTH lanes', () => {
    const { lanes, options, plank, price } = NUMBERS.boss;
    const [l1, l2] = lanes;
    expect(plank).toBe(gcd(l1, l2));
    const [other] = options.filter((b) => b !== plank);
    // the distractor is LONGER than the answer and fills ONE lane — and it is the remainder just before the last one
    // that is not 0 in Euclid's ladder of the two lanes: stopping one division early gives it
    expect(other).toBeGreaterThan(plank);
    expect([l1 % other, l2 % other]).toEqual([0, 28]);
    expect(euclid(l1, l2).at(-3).r).toBe(other);
    // the store divides the whole bridge: the same 28 empty cells as the second lane, so the world stays true
    expect((l1 + l2) % other).toBe(l2 % other);
    expect([l1 / plank, l2 / plank, (l1 + l2) / plank, ((l1 + l2) / plank) * price]).toEqual([42, 31, 73, 6205]);
    for (let b = plank + 1; b <= l2; b += 1) expect(l1 % b === 0 && l2 % b === 0, `${b}`).toBe(false);
    const { say, boss, objective } = STORY.text;
    for (const line of [boss.mission, boss.choose, say.boss, objective.bossGo]) {
      expect(line, line).toContain(String(l1));
      expect(line, line).toContain(String(l2));
      expect(line, line).toMatch(/أطول/);
      expect(line, line).not.toMatch(/PGCD|احسب القاسم|إقليدس|الفروق/);
    }
    expect(say.bossFail(other)).toContain(
      'الألواح 56 تملأ الممرّ الأوّل (1176 خانة)، لكن في الممرّ الثاني (868 خانة) بقيت 28 خانة فارغة',
    );
    expect(say.bossFail(40)).toContain('في الممرّ الأوّل (1176 خانة) بقيت 16 خانة فارغة');
    expect(say.bossFail(40)).toContain('في الممرّ الثاني (868 خانة) بقيت 28 خانة فارغة');
    expect(say.bossFail(35)).toContain('بقيت 21 خانة فارغة'); // 1176 = 35 × 33 + 21
    expect(say.bossFail(13)).toContain('بقيت 6 خانات فارغة'); // 1176 = 13 × 90 + 6
    expect(say.bossOk).toContain('73 لوحًا طولها 28: 42 في الممرّ الأوّل و 31 في الممرّ الثاني');
  });

  it('the road: one island more than segments, every bridge holds with its plank, ids unique, the store in دج', () => {
    expect(STORY.islands).toHaveLength(STORY.segments.length + 1);
    const ids = STORY.segments.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const seg of STORY.segments.filter((x) => x.kind === 'bridge')) expect(seg.a % seg.holdsWith, seg.id).toBe(0);
    const boss = STORY.segments.find((x) => x.boss);
    expect([boss.a, boss.holdsWith, boss.a / boss.holdsWith, boss.a % 56]).toEqual([2044, 28, 73, 28]);
    expect(boss.boss.options.filter((b) => boss.a % b === 0)).toEqual([boss.holdsWith]);
    expect(STORY.segments.indexOf(boss)).toBe(STORY.segments.length - 1);
    expect(STORY.segments.filter((s) => s.kind === 'rail')).toHaveLength(1);
    expect(STORY.segments.findIndex((s) => s.kind === 'rail')).toBe(9);
    expect(STORY.islands.filter((i) => i.feature === 'stone')).toHaveLength(0);
    const T = STORY.text.boss;
    for (const line of [T.price, T.costAsk(28, 73), T.err.cost(2000)]) {
      expect(line).toContain('دج');
      expect(line).not.toMatch(/\bDA\b|\d \d{3}/);
    }
    expect(T.costAsk(28, 73)).toContain('73 لوحًا طولها 28');
    expect(T.err.long(1200, 2)).toContain('لوحان طولهما 1200');
    expect(T.err.big(28, 30)).toContain('بقيت 30 خانة فارغة');
    expect(STORY.text.subtitle).toMatch(/1176 خانة ثمّ 868 خانة/);
    // a gap past 200 cells is drawn as a strip (Game.js draws one tick per cell up to 200): its cell is still drawable
    for (const seg of STORY.segments.filter((x) => x.kind === 'bridge'))
      expect(seg.len / seg.a, seg.id).toBeGreaterThan(0.012);
  });

  it('four convoys: consecutive; island A offers planks, the three others have a workshop that works from the start', () => {
    const groups = ['diff', 'tarh', 'iqlidis', 'sibaq'];
    let at = -1;
    for (const id of groups) {
      const group = STORY.segments.filter((x) => x.convoy === id);
      expect(group, id).toHaveLength(NUMBERS[id].gaps.length);
      const first = STORY.segments.indexOf(group[0]);
      expect(first, id).toBeGreaterThan(at);
      group.forEach((seg, i) => expect(STORY.segments[first + i], id).toBe(seg));
      at = first + group.length - 1;
      expect(
        group.map((s) => s.a),
        id,
      ).toEqual(NUMBERS[id].gaps);
      for (const seg of group) expect([seg.predict, seg.holdsWith], seg.id).toEqual([false, NUMBERS[id].plank]);
      for (const seg of group.slice(1)) {
        expect(seg.moulds, seg.id).toEqual([]);
        expect(seg.workshop, seg.id).toBeUndefined();
        expect(STORY.islands[STORY.segments.indexOf(seg)].feature, seg.id).toBeUndefined();
      }
      if (id === 'diff') {
        expect(group[0].moulds).toEqual(NUMBERS.diff.moulds);
        expect(group[0].workshop).toBeUndefined();
        expect(STORY.convoys.diff).toBeUndefined();
        continue;
      }
      // the head island: no plank offered, a workshop open from the start, typed, as long as the longest gap
      expect(group[0].moulds, id).toEqual([]);
      const w = group[0].workshop;
      expect([w.open, w.typed, w.min, w.max], id).toEqual([true, true, 1, Math.max(...NUMBERS[id].gaps)]);
      expect(STORY.islands[first].feature, id).toBe('anvil');
      expect(STORY.convoys[id].purse).toBe(NUMBERS[id].purse);
    }
    expect(Object.keys(STORY.convoys)).toEqual(['tarh', 'iqlidis', 'sibaq']);
    expect(STORY.segments.filter((s) => s.workshop).map((s) => s.workshop.bench)).toEqual([
      TARH_BENCH,
      IQLIDIS_BENCH,
      SIBAQ_BENCH,
    ]);
    expect(STORY.islands.filter((i) => i.feature === 'anvil').map((i) => i.id)).toEqual(['D', 'F', 'H']);
  });

  it('the instruction says everything, the card what the island before showed — the hooks played on a fake game', () => {
    const segs = STORY.segments.map((s, index) => ({ ...s, index, complete: false, builtWith: null }));
    const game = {
      T: STORY.text,
      state: { held: null },
      flags: {},
      isl: STORY.islands,
      segs,
      log: [],
      convoyOf: (seg) => (seg?.convoy ? segs.filter((s) => s.convoy === seg.convoy) : null),
      convoyTail: (seg) => Boolean(seg.convoy) && segs.find((s) => s.convoy === seg.convoy) !== seg,
      purseOf(seg) {
        const of = STORY.convoys[seg.convoy]?.purse;
        if (!of) return null;
        const spent = this.convoyOf(seg).reduce((n, s) => n + (s.complete && s.builtWith ? s.a / s.builtWith : 0), 0);
        return { of, left: of - spent };
      },
    };
    const [g152, g95, g57, g259, g185, g1833, g546, g1003, g34] = segs;
    const O = (seg) => STORY.objective(game, seg);
    // island A: the three gaps, the third the first minus the second (an isolated equality), no planks on B and C
    expect(O(g152)).toBe(
      'الألواح التي تأخذها هنا تبني ثلاثة جسور: هوّة 152 خانة، ثمّ هوّة 95 خانة، ثمّ هوّة 57 خانة، والهوّة الثالثة هي الأولى ناقص الثانية: ⁦152 − 95 = 57⁩. لا ألواح على الجزيرتين التاليتين: اختر لوحًا يبني الجسور الثلاثة.',
    );
    game.state.held = 8;
    expect(O(g152)).toMatch(/^معك ألواح طولها 8: ابنِ بها هوّة 152 خانة/);
    Object.assign(g152, { complete: true, builtWith: 8 });
    expect(O(g95)).toBe('الهوّة 95 خانة. ابنِ جسرها بالألواح 8 التي تحملها: لا ألواح على هذه الجزيرة.');
    game.flags.convoyStuck = 'g95';
    expect(O(g95)).toBe('لا ألواح على هذه الجزيرة. ارجع إلى «مرسى الخشّابين» واختر ألواحًا أخرى تبني الجسور الثلاثة.');
    game.flags.convoyStuck = null;
    // the cards of B and C: the bridges standing, what is ahead — the third gap written as the first minus the second
    Object.assign(g152, { builtWith: 19 });
    game.state.held = 19;
    expect(STORY.recall(game, 1)).toEqual(['الجسر الأوّل: $152 = 19 \\times 8$', 'أمامك 95 ثمّ 57، بالألواح نفسها']);
    Object.assign(g95, { complete: true, builtWith: 19 });
    expect(STORY.recall(game, 2)).toEqual([
      '$152 = 19 \\times 8$',
      '$95 = 19 \\times 5$',
      'أمامك الهوّة $57 = 152 - 95$',
    ]);
    // the card of D: what each plank he fired did on the three gaps (the mirror's own bridges are not his)
    game.log = [
      { a: 152, b: 8 },
      { a: 95, b: 8 },
      { a: 152, b: 5 },
      { a: 152, b: 19 },
      { a: 95, b: 19 },
      { a: 57, b: 19 },
      { a: 57, b: 3, mirror: true },
    ];
    expect(STORY.recall(game, 3)).toEqual([
      'اللوح 8: ملأ 152، ولم يملأ 95',
      'اللوح 5: لم يملأ 152',
      'اللوح 19: ملأ 152 و 95 و 57',
    ]);
    // island D: the workshop, the two gaps, the purse
    game.state.held = null;
    expect(O(g259)).toBe(
      'اصنع في ورشة هذه الجزيرة لوحًا بالطول الذي تختاره: ألواحه تبني هوّة 259 خانة ثمّ هوّة 185 خانة، ولا ألواح على الجزيرة التالية. لكلّ لوح قطعة من الكيس مهما كان طوله، وفي الكيس 12 قطعة. وفي الورشة دفتر للهوّتين.',
    );
    game.state.held = 37;
    expect(O(g259)).toContain('معك ألواح طولها 37: ابنِ بها هوّة 259 خانة ثمّ هوّة 185 خانة');
    Object.assign(g259, { complete: true, builtWith: 37 });
    expect(O(g185)).toBe(
      'الهوّة 185 خانة. ابنِ جسرها بالألواح 37 التي تحملها: لا ألواح على هذه الجزيرة، وبقيت في الكيس 5 قطع.',
    );
    game.flags.convoyStuck = 'g185';
    expect(O(g185)).toBe('لا ألواح على هذه الجزيرة. ارجع إلى «جزيرة القصب» واصنع في ورشتها لوحًا بطول آخر.');
    game.flags.convoyStuck = null;
    expect(STORY.recall(game, 4)).toEqual(['الجسر الأوّل: $259 = 37 \\times 7$', 'دفعتَ 7 قطع، وبقيت في الكيس 5 قطع']);
    game.log.push({ a: 259, b: 259 }, { a: 185, b: 259 }, { a: 259, b: 1 }, { a: 259, b: 37 }, { a: 185, b: 37 });
    expect(STORY.recall(game, 5)).toEqual([
      'اللوح 259: ملأ 259، ولم يملأ 185',
      'اللوح 1: لم تكفِ القطع للهوّة 259',
      'اللوح 37: ملأ 259 و 185',
    ]);
    // islands F to J
    game.state.held = null;
    expect(O(g1833)).toContain('هوّة 1833 خانة ثمّ هوّة 546 خانة');
    expect(O(g1833)).toContain('وفي الكيس 61 قطعة.');
    Object.assign(g1833, { complete: true, builtWith: 39 });
    game.state.held = 39;
    expect(O(g546)).toContain('وبقيت في الكيس 14 قطعة.');
    expect(STORY.recall(game, 6)).toEqual([
      'الجسر الأوّل: $1833 = 39 \\times 47$',
      'دفعتَ 47 قطعة، وبقيت في الكيس 14 قطعة',
    ]);
    expect(O(g1003)).toContain('هوّة 1003 خانة ثمّ هوّة 34 خانة');
    Object.assign(g1003, { complete: true, builtWith: 17 });
    game.state.held = 17;
    expect(O(g34)).toContain('ابنِ جسرها بالألواح 17 التي تحملها: لا ألواح على هذه الجزيرة، وبقيت في الكيس قطعتان.');
    game.log.push({ a: 1003, b: 34 }, { a: 1003, b: 17 }, { a: 34, b: 17 });
    expect(STORY.recall(game, 9)).toEqual(['اللوح 34: لم يملأ 1003', 'اللوح 17: ملأ 1003 و 34']);
    // elsewhere: the world's own card and its own instruction once a bridge is built
    expect(STORY.recall(game, 10)).toBe(null);
    expect(STORY.recall(game, 11)).toBe(null);
    expect(O(g152)).toBe(null);
    expect(O(segs[9])).toBe(null);
    expect(O(segs[10])).toBe(null);
    // the sentences said when a bridge holds agree with their numbers
    const S = STORY.text.say;
    expect(S.diffOk(152, 19, 95)).toBe('8 ألواح طولها 19 تملأ 152 خانة. اعبر: الهوّة 95 تنتظر الألواح نفسها.');
    expect(S.diffOk(57, 19, null)).toBe('3 ألواح طولها 19 تملأ 57 خانة: الجسور الثلاثة ثابتة.');
    expect(S.headOk(1833, 39, 14, 546)).toBe(
      '47 لوحًا طولها 39 تملأ 1833 خانة، وبقيت في الكيس 14 قطعة. اعبر: الهوّة 546 تنتظر الألواح نفسها.',
    );
    expect(S.tailOk(34, 17, 0)).toBe('لوحان طولهما 17 يملآن 34 خانة: الجسران ثابتان، وقطع الكيس كلّها في الجسرين.');
    const heard = [];
    game.say = (s) => heard.push(s);
    Object.assign(g95, { complete: true });
    expect(STORY.onHold(game, g95, 19)).toBe(true);
    expect(heard.at(-1)).toBe('5 ألواح طولها 19 تملأ 95 خانة. اعبر: الهوّة 57 تنتظر الألواح نفسها.');
    expect(STORY.onHold(game, g57, 19)).toBe(true);
    expect(heard.at(-1)).toContain('الجسور الثلاثة ثابتة');
    expect(STORY.onHold(game, g1833, 39)).toBe(true);
    expect(heard.at(-1)).toContain('اعبر: الهوّة 546');
    expect(STORY.onHold(game, segs[10], 28)).toBe(false);
  });

  it('every wave of the gate dash has exactly one right gate, stays mental arithmetic, and is no pair of the bank', () => {
    expect(STORY.dashWaves).toHaveLength(8);
    for (const w of STORY.dashWaves) {
      expect(w.gates.filter(w.test), w.say).toHaveLength(1);
      expect(new Set(w.gates).size).toBe(3);
      const ns = w.say.match(/\d+/g).map(Number);
      for (const n of [...ns, ...w.gates]) expect(n, w.say).toBeLessThanOrEqual(100);
      expect(BANK_PAIRS.has(pairKey(ns[0], ns[1])), w.say).toBe(false);
    }
    // the two counting waves: their right gate is the count of the algorithm they name
    const count = STORY.dashWaves.filter((w) => /عدد/.test(w.say));
    expect(count.map((w) => w.gates.find(w.test))).toEqual([differences(40, 8).length, euclid(70, 21).length]);
  });

  it('the tablets say the story’s own numbers, their equalities are true, and each holds on its card', () => {
    let checked = 0;
    for (const t of Object.values(TABLETS)) {
      for (const m of t.math) {
        const [lhs, rhs] = m.split('=').map((x) => x.trim());
        const args = pgcdArgs(lhs);
        if (args && pgcdArgs(rhs)) expect(gcd(...args), m).toBe(gcd(...pgcdArgs(rhs)));
        else if (args) expect(gcd(...args), m).toBe(Number(rhs));
        else if (/ - /.test(lhs)) expect(value(lhs), m).toBe(Number(rhs));
        else expect(Number(lhs), m).toBe(value(rhs));
        checked += 1;
      }
      // a tablet is a method line or two, at most two formulas and one note (defects.md B17)
      expect(t.lines.length, t.title).toBeLessThanOrEqual(2);
      expect(t.math.length, t.title).toBeLessThanOrEqual(2);
      expect(t.notes.length, t.title).toBeLessThanOrEqual(1);
      for (const n of t.notes) expect(n, t.title).not.toContain('$');
      for (const line of [...t.lines, ...t.math, ...t.notes]) said(line);
    }
    expect(checked).toBe(10);
    // an equality inside a plain sentence is isolated left to right (LRI … PDI), never reversed by the bidi algorithm
    for (const t of Object.values(TABLETS))
      for (const n of t.notes)
        for (const m of n.matchAll(/[\d ×+]+=[\d ×+]+/g))
          expect(n.slice(m.index - 1, m.index), `« ${m[0]} » isolated`).toBe('⁦');
    expect(TABLETS['khawarizmiyat-al-tarh'].notes[0]).toBe('الألواح 37 بنت الجسرين بـ 12 قطعة: ⁦7 + 5 = 12⁩');
    expect(TABLETS.iqlidis.notes[0]).toBe('الألواح 39 بنت الجسرين بـ 61 قطعة: ⁦47 + 14 = 61⁩');
    expect(TABLETS['baqi-yabqi'].notes[0]).toBe('3 عمليات طرح للعدد 296 في قسمة واحدة');
    expect(TABLETS['aqall-khutuwat'].notes[0]).toBe('للعددين 1003 و 34: 31 عملية طرح مقابل قسمتين');
    expect(TABLETS['farq-yabqi'].notes[0]).toContain('⁦152 = 19 × 8⁩');
  });

  it('borrows no island name and no headline number of the finished lessons, and no pair of the bank', () => {
    const theirNames = new Set(OTHERS.flatMap((s) => [...s.matchAll(/name: '([^']+)'/g)].map((m) => m[1])));
    for (const island of STORY.islands) expect(theirNames.has(island.name), island.name).toBe(false);
    expect(new Set(STORY.islands.map((i) => i.name)).size).toBe(STORY.islands.length);
    // the numbers of the last bridge are in no other story and nowhere in the bank
    const { lanes } = NUMBERS.boss;
    for (const n of [...lanes, lanes[0] + lanes[1]]) {
      for (const s of OTHERS) expect(s, `${n}`).not.toMatch(alone(n));
      for (const s of SHEETS) expect(s, `${n}`).not.toMatch(alone(n));
    }
    expect(SHEETS).toHaveLength(50);
    // the pairs of the road: never a pair the bank names, never two numbers on one line of the bank (its solutions
    // chain subtractions: « 161 − 115 = 46 » stands in one — the pair was replaced), nor of another story
    for (const [x, y] of PAIRS) {
      expect(BANK_PAIRS.has(pairKey(x, y)), `${x} ; ${y}`).toBe(false);
      const both = (line) => alone(x).test(line) && alone(y).test(line);
      for (const s of SHEETS) for (const line of s.split('\n')) expect(both(line), `${x} ; ${y}: ${line}`).toBe(false);
      for (const s of OTHERS) for (const line of s.split('\n')) expect(both(line), `${x} ; ${y}`).toBe(false);
    }
    // the gaps of the four convoys and of the fold are in no other story
    for (const n of [259, 185, 1833, 546, 1003, 962, 296])
      for (const s of OTHERS) expect(s, `${n}`).not.toMatch(alone(n));
  });

  it('tells no rule before its key: the islands, the instructions, the cards and the sentences said on the way', () => {
    // an island's name is on its sign from afar: no rule, no number
    for (const island of STORY.islands)
      expect(island.name, island.name).not.toMatch(/مشترك|أكبر|PGCD|قاسم|فرق|طرح|باق|قسمة|إقليدس|سلّم|أسرع|\d/);
    const S = STORY.text.say;
    const O = STORY.text.objective;
    const R = STORY.text.recall;
    const on = (b, gaps) => gaps.map((a) => ({ a, did: a % b ? 'open' : 'fills' }));
    // islands A–D, before ➖: nothing kept, nothing common, no difference named as a rule, no algorithm
    const beforeFarq = [
      STORY.text.subtitle,
      S.hello,
      S.b95,
      S.c57,
      S.diffOk(152, 19, 95),
      S.diffOk(95, 19, 57),
      S.diffOk(57, 19, null),
      O.diff,
      O.diffCarry(8),
      O.diffTail(95, 8),
      O.convoyBack('مرسى الخشّابين'),
      S.convoyBack('مرسى الخشّابين', 7),
      S.convoyReset(8),
      S.convoyOnly,
      R.first(152, 19),
      R.ahead([95, 57]),
      R.held(95, 19),
      R.third,
      R.plank(8, on(8, [152, 95])),
    ];
    for (const line of beforeFarq)
      expect(line, line).not.toMatch(/يحفظ|مشترك|PGCD|قاسم|فرق|الفروق|خوارزمية|باق|إقليدس|نفسها القواسم/);
    // islands D–F, before 🪜 and 🧮: no last difference, no « until 0 », no remainder, no algorithm
    const beforeTarh = [
      S.tarh,
      S.e185,
      S.headOk(259, 37, 5, 185),
      S.tailOk(185, 37, 0),
      O.make('tarh'),
      O.carry('tarh', 37, 12),
      O.tail(185, 37, 5),
      O.convoyBack('جزيرة القصب'),
      S.convoyBack('جزيرة القصب', 7),
      R.paid(7, 5),
      R.plank(1, [{ a: 259, did: 'coins' }]),
      STORY.text.workshop.bench,
      STORY.text.workshop.benchSub,
    ];
    for (const line of beforeTarh)
      expect(line, line).not.toMatch(/PGCD|القاسم المشترك|آخر فرق|آخر باق|غير معدوم|خوارزمية|باق|إقليدس|حتّى/);
    // islands F–J, before 🔁 and ⏱️: no last remainder, no algorithm, nothing faster or shorter
    const beforeIqlidis = [
      S.iqlidis,
      S.g546,
      S.sibaq,
      S.i34,
      S.headOk(1833, 39, 14, 546),
      S.headOk(1003, 17, 2, 34),
      O.make('iqlidis'),
      O.make('sibaq'),
      O.tail(546, 39, 14),
      O.tail(34, 17, 2),
    ];
    for (const line of beforeIqlidis)
      expect(line, line).not.toMatch(
        /PGCD|القاسم المشترك|آخر فرق|آخر باق|غير معدوم|خوارزمية|إقليدس|أسرع|أقصر|أقلّ|خطو/,
      );
    for (const line of [...beforeFarq, ...beforeTarh, ...beforeIqlidis]) said(line);
  });
});
