import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { NUMBERS, STORY, TABLETS, roadOf } from './story';
import { commonDivisors, divisorsOf, gcd } from './math';
import { LISTS_BENCH } from './inquiries';

const said = (x) => expect(String(x)).not.toMatch(/undefined|NaN|\[object/);
/** The value of « 19 \times 4 »: a product of whole numbers. */
const value = (s) =>
  s
    .replace(/\\times/g, '*')
    .split('*')
    .map((x) => Number(x.trim()))
    .reduce((p, x) => p * x, 1);
/** « \mathrm{PGCD}(32 ; 44) » → [32, 44] */
const pgcdArgs = (s) =>
  s
    .match(/PGCD\}\((\d+) ; (\d+)\)/)
    ?.slice(1)
    .map(Number);
/** The plank lengths (1 … the longest gap) that build EVERY bridge of a road with its coins: a coin per plank laid. */
const builders = (gaps, purse) => {
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
  'moyen/1am/ansab_al_aadad_wal_hisab/darb-qisma-ashriya/qisma-iqlidiya-baqi',
  'moyen/1am/ansab_al_aadad_wal_hisab/darb-qisma-ashriya/qawaid-qabiliyat-qisma',
  'moyen/2am/ansab_al_aadad_wal_hisab/kusur-amaliyat/qisma-iqlidiya-hasr',
].map((p) => readFileSync(join(lessons, p, 'world/story.js'), 'utf8'));
/** This lesson's exercise bank: its 50 sheets, and every pair it names (« PGCD(39 ; 65) », « للعددين 39 و 65 »). */
const bankDir = join(here, '../../../../../../../../../../content/practice/4am/tayin-pgcd');
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

describe('the numbers of « تعيين القاسم المشترك الأكبر » — every fact of the road is computed', () => {
  it('convoy « lists » (32 then 44, 19 coins): only planks of 4 build both — 8 + 11 coins', () => {
    const { gaps, purse, plank } = NUMBERS.lists;
    expect(gaps).toEqual([32, 44]);
    expect(builders(gaps, purse)).toEqual([plank]);
    expect(plank).toBe(gcd(...gaps));
    expect([32 / 4, 44 / 4, purse]).toEqual([8, 11, 19]);
    // the planks a student tries: 8 and 16 fill 32 and not 44; 2 fills both but costs 16 + 22; 1 costs 32 on the first
    expect([32 % 8, 44 % 8, 32 % 16, 44 % 16]).toEqual([0, 4, 0, 12]);
    expect([32 / 2, purse - 32 / 2, 44 / 2]).toEqual([16, 3, 22]);
    expect(32 / 1).toBeGreaterThan(purse);
    expect(commonDivisors(...gaps)).toEqual([1, 2, 4]);
    // what the world shows of each, gap after gap (the card on island C)
    const all = () => true;
    expect(roadOf(gaps, purse, 8, all)).toEqual([
      { a: 32, did: 'fills' },
      { a: 44, did: 'open' },
    ]);
    expect(roadOf(gaps, purse, 2, all)).toEqual([
      { a: 32, did: 'fills' },
      { a: 44, did: 'coins' },
    ]);
    expect(roadOf(gaps, purse, 1, all)).toEqual([{ a: 32, did: 'coins' }]);
    expect(roadOf(gaps, purse, 11, all)).toEqual([{ a: 32, did: 'open' }]);
    expect(roadOf(gaps, purse, 4, all)).toEqual([
      { a: 32, did: 'fills' },
      { a: 44, did: 'fills' },
    ]);
    expect(roadOf(gaps, purse, 8, (a) => a === 32)).toEqual([{ a: 32, did: 'fills' }]);
    // the bench of its workshop is the `lists` kind on the same two gaps
    expect(LISTS_BENCH.kind).toBe('lists');
    expect(LISTS_BENCH.rounds).toEqual([{ a: 32, b: 44 }]);
  });

  it('convoys « same » (27, 27; 2 coins) and « full » (27, 0; 1 coin): only one plank of 27 for each gap', () => {
    expect(builders(NUMBERS.same.gaps, NUMBERS.same.purse)).toEqual([NUMBERS.same.plank]);
    expect(NUMBERS.same.plank).toBe(gcd(...NUMBERS.same.gaps));
    // a gap of 0 cells takes no plank (0 = d × 0): the plank of 27 builds the road with ONE coin
    expect(NUMBERS.full.gaps).toEqual([27, 0]);
    expect(builders(NUMBERS.full.gaps, NUMBERS.full.purse)).toEqual([NUMBERS.full.plank]);
    expect(NUMBERS.full.plank).toBe(gcd(...NUMBERS.full.gaps));
    // 9 and 3 fill 27 but cost too many coins
    expect([27 / 9, 27 / 3]).toEqual([3, 9]);
  });

  it('convoy « nest » (19 then 76, 5 coins): the shorter gap’s own length, 1 + 4 coins', () => {
    const { gaps, purse, plank } = NUMBERS.nest;
    expect(builders(gaps, purse)).toEqual([plank]);
    expect([plank, gcd(...gaps), 76 / 19, 19 / 19 + 76 / 19]).toEqual([19, 19, 4, 5]);
    // and the pair kept for forge 🎯: the shorter gap does NOT build the longer, 18 does (5 + 2 coins)
    const A = NUMBERS.against;
    expect([A.gaps[0] % A.gaps[1], gcd(...A.gaps)]).toEqual([18, A.plank]);
    expect(builders(A.gaps, A.purse)).toEqual([A.plank]);
    // forge 📋’s last step: a new pair, typed by lists
    expect(gcd(...NUMBERS.use.gaps)).toBe(NUMBERS.use.plank);
    expect(commonDivisors(...NUMBERS.use.gaps)).toEqual([1, 29]);
  });

  it('the last bridge needs the lesson: 22 fills the first pier alone, 14 is the longest plank of BOTH piers', () => {
    const { piers, options, plank, price } = NUMBERS.boss;
    const [p1, p2] = piers;
    expect([p1, p2, options]).toEqual([154, 238, [22, 14]]);
    expect(plank).toBe(gcd(p1, p2));
    const [other] = options.filter((b) => b !== plank);
    // the distractor is LONGER than the answer and fills ONE pier: a plank that fills one pier never chooses
    expect(other).toBeGreaterThan(plank);
    expect([p1 % other, p2 % other]).toEqual([0, 18]);
    // the store divides the whole bridge: the same 18 empty cells as the second pier, so the world stays true
    expect((p1 + p2) % other).toBe(p2 % other);
    expect([p1 / plank, p2 / plank, (p1 + p2) / plank]).toEqual([11, 17, 28]);
    for (let b = plank + 1; b <= p1; b += 1) expect(p1 % b === 0 && p2 % b === 0, `${b}`).toBe(false);
    // the lists the lesson builds: the divisors of each pier, the common ones
    expect(commonDivisors(p1, p2)).toEqual([1, 2, 7, 14]);
    expect(((p1 + p2) / plank) * price).toBe(2520);
    const { say, boss, objective } = STORY.text;
    for (const line of [boss.mission, boss.choose, say.boss, objective.bossGo]) {
      expect(line, line).toContain(String(p1));
      expect(line, line).toContain(String(p2));
      expect(line, line).toMatch(/أطول/);
      expect(line, line).not.toMatch(/PGCD|احسب القاسم/);
    }
    expect(say.bossFail(other)).toContain(
      'الألواح 22 تملأ الرصيف الأوّل (154 خانة)، لكن في الرصيف الثاني (238 خانة) بقيت 18 خانة فارغة',
    );
    expect(say.bossFail(24)).toContain('في الرصيف الأوّل (154 خانة) بقيت 10 خانات فارغة');
    expect(say.bossFail(24)).toContain('في الرصيف الثاني (238 خانة) بقيت 22 خانة فارغة');
    expect(say.bossFail(51)).toContain('بقيت خانة واحدة فارغة'); // 154 = 51 × 3 + 1
    expect(say.bossOk).toContain('28 لوحًا طولها 14: 11 في الرصيف الأوّل و 17 في الرصيف الثاني');
  });

  it('the road: one island more than segments, every bridge holds with its plank, ids unique, the store in دج', () => {
    expect(STORY.islands).toHaveLength(STORY.segments.length + 1);
    const ids = STORY.segments.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    const bridges = STORY.segments.filter((x) => x.kind === 'bridge');
    for (const seg of bridges) expect(seg.a % seg.holdsWith, seg.id).toBe(0);
    const boss = STORY.segments.find((x) => x.boss);
    expect([boss.a, boss.holdsWith, boss.a / boss.holdsWith, boss.a % 22]).toEqual([392, 14, 28, 18]);
    expect(boss.boss.options.filter((b) => boss.a % b === 0)).toEqual([boss.holdsWith]);
    expect(STORY.segments.indexOf(boss)).toBe(STORY.segments.length - 1);
    expect(STORY.segments.filter((s) => s.kind === 'rail')).toHaveLength(1);
    expect(STORY.islands.filter((i) => i.feature === 'stone')).toHaveLength(0);
    const T = STORY.text.boss;
    for (const line of [T.price, T.costAsk(14, 28), T.err.cost(2000)]) {
      expect(line).toContain('دج');
      expect(line).not.toMatch(/\bDA\b|\d \d{3}/);
    }
    expect(T.costAsk(14, 28)).toContain('28 لوحًا طولها 14');
    expect(T.err.long(200, 2)).toContain('لوحان طولهما 200');
    expect(T.err.big(22, 30)).toContain('بقيت 30 خانة فارغة');
    expect(STORY.text.subtitle).toMatch(/154 خانة ثمّ 238 خانة/);
  });

  it('four convoys: consecutive, a workshop that works from the start on the head island, nothing on the others', () => {
    const groups = ['lists', 'same', 'full', 'nest'];
    expect(Object.keys(STORY.convoys)).toEqual(groups);
    let at = -1;
    for (const id of groups) {
      const group = STORY.segments.filter((x) => x.convoy === id);
      expect(group, id).toHaveLength(2);
      const first = STORY.segments.indexOf(group[0]);
      expect(first, id).toBeGreaterThan(at);
      expect(STORY.segments[first + 1]).toBe(group[1]);
      at = first + 1;
      // no plank is offered anywhere; no prediction (the choice of the plank, for two gaps at once, is the experiment)
      for (const seg of group)
        expect([seg.moulds, seg.predict, seg.holdsWith], seg.id).toEqual([[], false, NUMBERS[id].plank]);
      // the head island: a workshop open from the start, typed, as long as the longest gap; the island after it: nothing
      const w = group[0].workshop;
      expect([w.open, w.typed, w.min, w.max], id).toEqual([true, true, 1, Math.max(...group.map((s) => s.a))]);
      expect(group[1].workshop, id).toBeUndefined();
      expect(STORY.islands[first].feature, id).toBe('anvil');
      expect(STORY.islands[first + 1].feature, id).toBeUndefined();
      expect(
        group.map((s) => s.a),
        id,
      ).toEqual(NUMBERS[id].gaps);
      expect(STORY.convoys[id].purse).toBe(NUMBERS[id].purse);
    }
    // the bench of the lists is on the first workshop only
    expect(STORY.segments[0].workshop.bench).toBe(LISTS_BENCH);
    expect(STORY.segments.filter((s) => s.workshop?.bench)).toHaveLength(1);
    // the gap of 0 cells stands from the start
    const zero = STORY.segments.filter((s) => s.standing);
    expect(zero.map((s) => [s.a, s.convoy])).toEqual([[0, 'full']]);
    expect(STORY.islands.filter((i) => i.feature === 'anvil')).toHaveLength(4);
  });

  it('the instruction says everything, the card what the island before showed — the hooks played on a fake game', () => {
    const segs = STORY.segments.map((s, index) => ({ ...s, index, complete: Boolean(s.standing), builtWith: null }));
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
    const [g32, g44, g27a, g27b, g27c, g0, g19, g76] = segs;
    const O = (seg) => STORY.objective(game, seg);
    // island A, before he makes a plank: the two gaps, no planks next, the workshop, the price, the purse
    expect(O(g32)).toBe(
      'اصنع في ورشة هذه الجزيرة لوحًا بالطول الذي تختاره: ألواحه تبني هوّة 32 خانة ثمّ هوّة 44 خانة، ولا ألواح على الجزيرة التالية. لكلّ لوح قطعة من الكيس مهما كان طوله، وفي الكيس 19 قطعة.',
    );
    game.state.held = 8;
    expect(O(g32)).toMatch(/^معك ألواح طولها 8: ابنِ بها هوّة 32 خانة ثمّ هوّة 44 خانة .*وفي الكيس 19 قطعة/);
    // island B with 8 built on 32: the gap, the plank he carries, the coins left
    Object.assign(g32, { complete: true, builtWith: 8 });
    expect(O(g44)).toBe(
      'الهوّة 44 خانة. ابنِ جسرها بالألواح 8 التي تحملها: لا ألواح على هذه الجزيرة، وبقيت في الكيس 15 قطعة.',
    );
    // refused there (or nothing in hand): back to the workshop of island A
    game.flags.convoyStuck = 'g44';
    expect(O(g44)).toBe('لا ألواح على هذه الجزيرة. ارجع إلى «مرسى النجّار» واصنع في ورشتها لوحًا بطول آخر.');
    game.flags.convoyStuck = null;
    game.state.held = null;
    expect(O(g44)).toContain('ارجع إلى «مرسى النجّار»');
    // the card on B: the first bridge and its coins
    expect(STORY.recall(game, 1)).toEqual(['الجسر الأوّل: $32 = 8 \\times 4$', 'دفعتَ 4 قطع، وبقيت في الكيس 15 قطعة']);
    // the card on C: each plank he fired on 32 and 44, and what it did there
    game.log = [
      { a: 32, b: 8 },
      { a: 44, b: 8 },
      { a: 32, b: 2 },
      { a: 44, b: 2 },
      { a: 32, b: 4 },
      { a: 44, b: 4 },
      { a: 32, b: 11, mirror: true },
    ];
    expect(STORY.recall(game, 2)).toEqual([
      'اللوح 8: ملأ 32، ولم يملأ 44',
      'اللوح 2: ملأ 32، ولم تكفِ القطع للهوّة 44',
      'اللوح 4: ملأ 32 و 44',
    ]);
    // island C: the twins of 27, two coins
    expect(O(g27a)).toContain('هوّتين من 27 خانة، واحدة بعد الأخرى');
    expect(O(g27a)).toContain('وفي الكيس قطعتان.');
    Object.assign(g27a, { complete: true, builtWith: 27 });
    game.state.held = 27;
    expect(O(g27b)).toContain('وبقيت في الكيس قطعة واحدة.');
    expect(STORY.recall(game, 3)).toEqual([
      'الجسر الأوّل: $27 = 27 \\times 1$',
      'دفعتَ قطعة واحدة، وبقيت في الكيس قطعة واحدة',
    ]);
    game.log.push({ a: 27, b: 9 }, { a: 27, b: 27 }, { a: 27, b: 4 });
    expect(STORY.recall(game, 4)).toEqual([
      'اللوح 9: الجسران يحتاجان 6 ألواح',
      'اللوح 27: الجسران يحتاجان لوحين',
      'اللوح 4: لم يملأ 27',
    ]);
    // island E: 27, then a gap of 0 cells that stands; one coin
    Object.assign(g27b, { complete: true, builtWith: 27 });
    game.state.held = null;
    expect(O(g27c)).toContain('هوّة 27 خانة، وبعدها هوّة من 0 خانة جسرها قائم');
    expect(O(g27c)).toContain('وفي الكيس قطعة واحدة.');
    Object.assign(g27c, { complete: true, builtWith: 27 });
    // island F: the gap of 0 cells
    expect(O(g0)).toContain('جسرها قائم دون أيّ لوح');
    expect(STORY.recall(game, 5)).toEqual([
      'الجسر الأوّل: $27 = 27 \\times 1$',
      'دفعتَ قطعة واحدة، ولم يبقَ في الكيس شيء',
    ]);
    // island G: what the two convoys of key ⚡ showed
    expect(STORY.recall(game, 6)).toEqual([
      'الهوّتان 27 و 27: $27 = 27 \\times 1$ لكلّ واحدة',
      'الهوّتان 27 و 0: $27 = 27 \\times 1$ و $0 = 27 \\times 0$',
    ]);
    expect(O(g19)).toContain('هوّة 19 خانة ثمّ هوّة 76 خانة');
    expect(O(g19)).toContain('وفي الكيس 5 قطع.');
    Object.assign(g19, { complete: true, builtWith: 19 });
    game.state.held = 19;
    expect(O(g76)).toContain('ابنِ جسرها بالألواح 19 التي تحملها: لا ألواح على هذه الجزيرة، وبقيت في الكيس 4 قطع.');
    game.log.push({ a: 19, b: 1 }, { a: 19, b: 19 }, { a: 76, b: 19 });
    expect(STORY.recall(game, 8)).toEqual(['اللوح 1: لم تكفِ القطع للهوّة 19', 'اللوح 19: ملأ 19 و 76']);
    // elsewhere: the world's own card and its own instruction once a bridge is built
    expect(STORY.recall(game, 9)).toBe(null);
    expect(STORY.recall(game, 10)).toBe(null);
    expect(O(g32)).toBe(null);
    expect(O(segs[8])).toBe(null);
    // the sentences said when a bridge holds agree with their numbers
    const S = STORY.text.say;
    expect(S.headOk(32, 4, 11, S.next.lists)).toBe(
      '8 ألواح طولها 4 تملأ 32 خانة، وبقيت في الكيس 11 قطعة. اعبر: الهوّة 44 تنتظر الألواح نفسها.',
    );
    expect(S.tailOk(44, 4, 0)).toBe('11 لوحًا طولها 4 تملأ 44 خانة: الجسران ثابتان، وقطع الكيس كلّها في الجسرين.');
    expect(S.headOk(27, 27, 0, S.next.full)).toBe(
      'لوح واحد طوله 27 يملأ 27 خانة، ولم يبقَ في الكيس شيء. اعبر: الهوّة التالية 0 خانة، وجسرها قائم.',
    );
    expect(S.tailOk(76, 38, 3)).toContain('لوحان طولهما 38 يملآن 76 خانة');
    // onHold says the story's sentence on a convoy, nothing on the gap of 0 cells
    const heard = [];
    game.say = (s) => heard.push(s);
    expect(STORY.onHold(game, g76, 19)).toBe(true);
    expect(heard.at(-1)).toContain('4 ألواح طولها 19 تملأ 76 خانة: الجسران ثابتان');
    expect(STORY.onHold(game, g0, 27)).toBe(false);
  });

  it('every wave of the gate dash has exactly one right gate, stays mental arithmetic, and is no pair of the bank', () => {
    expect(STORY.dashWaves).toHaveLength(8);
    for (const w of STORY.dashWaves) {
      expect(w.gates.filter(w.test), w.say).toHaveLength(1);
      expect(new Set(w.gates).size).toBe(3);
      const ns = w.say.match(/\d+/g).map(Number);
      for (const n of ns) expect(n, w.say).toBeLessThanOrEqual(100);
      expect(BANK_PAIRS.has(pairKey(ns[0], ns[1])), w.say).toBe(false);
    }
  });

  it('the tablets say the story’s own numbers, and their equalities are true', () => {
    let checked = 0;
    for (const t of Object.values(TABLETS)) {
      for (const m of t.math) {
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
    expect(checked).toBe(5);
    expect(TABLETS['hasr-wa-taqatu'].list).toEqual([
      `قواسم 32: ${divisorsOf(32).join(' ، ')}`,
      `قواسم 44: ${divisorsOf(44).join(' ، ')}`,
    ]);
    // an equality inside a plain sentence is isolated left to right (LRI … PDI), never reversed by the bidi algorithm (B7)
    expect(TABLETS['hasr-wa-taqatu'].notes[0]).toBe(`القواسم المشتركة: ${[1, 2, 4].join('\u00a0، ')}، وأكبرها 4`);
    expect(TABLETS['b-yaqsim-a'].notes[1]).toBe('الألواح 19 بنت الجسرين بـ 5 قطع: \u20661 + 4 = 5\u2069');
    for (const t of Object.values(TABLETS))
      for (const n of t.notes)
        for (const m of n.matchAll(/[\d ×+]+=[\d ×+]+/g))
          expect(n.slice(m.index - 1, m.index), `« ${m[0]} » isolated`).toBe('\u2066');
    expect(TABLETS['nataij-mubashira'].notes[1]).toBe('لوح واحد طوله 27 يملأ كلّ هوّة من 27 خانة');
    for (const t of Object.values(TABLETS)) for (const line of t.list ?? []) expect(line, line).not.toMatch(/ ،/);
  });

  it('borrows no island name and no headline number of the finished lessons, and no pair of the bank', () => {
    const theirNames = new Set(OTHERS.flatMap((s) => [...s.matchAll(/name: '([^']+)'/g)].map((m) => m[1])));
    for (const island of STORY.islands) expect(theirNames.has(island.name), island.name).toBe(false);
    // the numbers of the last bridge are in no other story and nowhere in the bank
    const { piers } = NUMBERS.boss;
    for (const n of [...piers, piers[0] + piers[1]]) {
      for (const s of OTHERS) expect(s, `${n}`).not.toMatch(new RegExp(`\\b${n}\\b`));
      for (const s of SHEETS) expect(s, `${n}`).not.toMatch(new RegExp(`\\b${n}\\b`));
    }
    // the pairs of the road: never a pair the bank names, never two numbers on one line of another story
    expect(SHEETS).toHaveLength(50);
    expect(BANK_PAIRS.has('39;65')).toBe(true); // the draft's pair for forge 📋’s last step: replaced
    const pairs = ['lists', 'use', 'nest', 'against'].map((id) => NUMBERS[id].gaps).concat([piers]);
    for (const [x, y] of pairs) {
      expect(BANK_PAIRS.has(pairKey(x, y)), `${x} ; ${y}`).toBe(false);
      const both = new RegExp(`\\b${x}\\b.*\\b${y}\\b|\\b${y}\\b.*\\b${x}\\b`);
      for (const s of OTHERS) for (const line of s.split('\n')) expect(line, `${x} ; ${y}`).not.toMatch(both);
    }
  });

  it('tells no rule before its key: the islands, the instructions, the cards and the sentences said on the way', () => {
    // an island's name is on its sign from afar: no rule, no number
    for (const island of STORY.islands)
      expect(island.name, island.name).not.toMatch(/مشترك|أكبر|PGCD|قواسم|قاسم|قائم|\d|نفس|أصغر/);
    const S = STORY.text.say;
    const O = STORY.text.objective;
    const R = STORY.text.recall;
    // islands A–C, before 📋: no divisors, no list, nothing common, no greatest
    const beforeLists = [
      STORY.text.subtitle,
      S.hello,
      S.b44,
      S.headOk(32, 8, 15, S.next.lists),
      S.tailOk(44, 4, 0),
      O.make('lists'),
      O.carry('lists', 8, 19),
      O.tail(44, 8, 15),
      O.convoyBack('مرسى النجّار'),
      S.convoyBack('مرسى النجّار', 4),
      S.convoyReset(4),
      R.first(32, 8),
      R.paid(4, 15),
      R.plank(8, [
        { a: 32, did: 'fills' },
        { a: 44, did: 'open' },
      ]),
    ];
    for (const line of beforeLists) expect(line, line).not.toMatch(/قاسم|قواسم|مشترك|قائمة|القائمتين|PGCD|الأكبر|أطول/);
    // islands C–G, before ⚡: no PGCD, no « the number itself », no « always »
    const beforeDirect = [
      S.same,
      S.d27,
      S.e27,
      S.f0,
      S.headOk(27, 27, 1, S.next.same),
      S.tailOk(27, 27, 0),
      S.headOk(27, 27, 0, S.next.full),
      O.make('same'),
      O.make('full'),
      O.standing,
      R.need(27, 27),
      R.same(27, 27),
      R.full(27, 27),
    ];
    for (const line of beforeDirect) expect(line, line).not.toMatch(/PGCD|القاسم المشترك|نفسه[ .،]|دائمًا|أطول/);
    // islands G–I, before 🎯: nothing about the shorter gap dividing the longer
    const beforeNest = [
      S.nest,
      S.h76,
      S.headOk(19, 19, 4, S.next.nest),
      S.tailOk(76, 19, 0),
      O.make('nest'),
      O.tail(76, 19, 4),
    ];
    for (const line of beforeNest) expect(line, line).not.toMatch(/PGCD|القاسم المشترك|يقسم|أصغر|الأقصر|أطول/);
    for (const line of [...beforeLists, ...beforeDirect, ...beforeNest]) said(line);
  });
});
