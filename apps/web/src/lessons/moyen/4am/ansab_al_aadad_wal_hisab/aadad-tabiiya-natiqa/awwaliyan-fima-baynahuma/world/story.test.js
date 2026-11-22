import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ladderOf } from '../../../../../../common/gameworld/divisorIsles/inquiry';
import { NUMBERS, STORY, TABLETS, roadOf } from './story';
import { RULES, euclid, gcd } from './math';
import { HIDDEN_BENCH, PROOF_BENCH } from './inquiries';

const said = (x) => expect(String(x)).not.toMatch(/undefined|NaN|\[object/);
/** « \mathrm{PGCD}(32 ; 44) » → [32, 44] */
const pgcdArgs = (s) =>
  s
    .match(/PGCD\}\((\d+) ; (\d+)\)/)
    ?.slice(1)
    .map(Number);
/**
 * The plank lengths that build EVERY bridge of a road with its coins (a coin per plank laid): among `offered` (the
 * pedestals), or any length from 1 to the longest gap when the island has a workshop (`offered` = null).
 */
const builders = (gaps, purse = Infinity, offered = null) => {
  const lengths = offered ?? Array.from({ length: Math.max(...gaps) }, (_, i) => i + 1);
  return lengths.filter((b) => gaps.every((a) => a % b === 0) && gaps.reduce((n, a) => n + a / b, 0) <= purse);
};
const here = dirname(fileURLToPath(import.meta.url));
const lessons = join(here, '../../../../../..');
/** The stories of the lessons that are done (v2), their comments left out: no number, no pair, no island name of theirs. */
const OTHERS = [
  'moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/qasim-adad-tabii',
  'moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/qawasim-adad-tabii',
  'moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/khawass-qawasim',
  'moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/qasim-mushtarak-akbar',
  'moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/tayin-pgcd',
  'moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/bahth-pgcd',
  'moyen/1am/ansab_al_aadad_wal_hisab/darb-qisma-ashriya/qisma-iqlidiya-baqi',
  'moyen/1am/ansab_al_aadad_wal_hisab/darb-qisma-ashriya/qawaid-qabiliyat-qisma',
  'moyen/2am/ansab_al_aadad_wal_hisab/kusur-amaliyat/qisma-iqlidiya-hasr',
].map((p) =>
  readFileSync(join(lessons, p, 'world/story.js'), 'utf8')
    .split('\n')
    .filter((l) => !/^\s*(\*|\/\*|\/\/)/.test(l))
    .join('\n'),
);
/** This lesson's exercise bank: its 50 sheets, every pair it names, and every line of its solutions. */
const bankDir = join(here, '../../../../../../../../../../content/practice/4am/awwaliyan-fima-baynahuma');
const SHEETS = readdirSync(bankDir).flatMap((lvl) =>
  readdirSync(join(bankDir, lvl)).map((f) => readFileSync(join(bankDir, lvl, f), 'utf8')),
);
const LINES = SHEETS.flatMap((s) => s.split('\n'));
const BANK_PAIRS = new Set(
  SHEETS.flatMap((s) =>
    [...s.matchAll(/PGCD\s*\(\s*(\d+)\s*;\s*(\d+)\s*\)|للعددين\s+(\d+)\s+و\s+(\d+)|العددان\s+(\d+)\s+و\s+(\d+)/g)].map(
      (m) => [Number(m[1] ?? m[3] ?? m[5]), Number(m[2] ?? m[4] ?? m[6])].sort((x, y) => x - y).join(';'),
    ),
  ),
);
const pairKey = (x, y) => [x, y].sort((p, q) => p - q).join(';');
/** A number standing alone (not a piece of a longer number) in a text. */
const alone = (n) => new RegExp(`(?<![0-9])${n}(?![0-9])`);
/** Two numbers on one line of a text. */
const onOneLine = (lines, x, y) => lines.find((l) => alone(x).test(l) && alone(y).test(l));
/** The pairs of the road: each convoy's gaps, the last bridge's lanes, and every pair of the gate dash. */
const ROAD_PAIRS = [
  NUMBERS.only.gaps,
  NUMBERS.common.gaps,
  NUMBERS.proof.gaps,
  NUMBERS.witness.gaps,
  NUMBERS.hidden.gaps,
  NUMBERS.boss.lanes,
];
const DASH_PAIRS = STORY.dashWaves
  .map((w) => w.say.match(/\d+/g).map(Number).slice(0, 2))
  .filter((ns) => ns.length === 2);

describe('the numbers of « العددان الأوّليّان فيما بينهما » — every fact of the road is computed', () => {
  it('convoy « only » (25 then 27, 52 coins): of 3, 5, 9 and 1, only the plank 1 builds both — and it takes every coin', () => {
    const { gaps, moulds, purse, plank } = NUMBERS.only;
    expect(gcd(...gaps)).toBe(1);
    expect(builders(gaps, purse, moulds)).toEqual([plank]);
    expect(builders(gaps)).toEqual([1]); // no other length at all: the only common plank IS 1
    expect(plank).toBe(1);
    expect(purse).toBe(gaps[0] + gaps[1]);
    // each other plank fills exactly one gap
    expect(moulds.filter((d) => d !== plank).map((d) => gaps.filter((a) => a % d === 0))).toEqual([[27], [25], [27]]);
    const all = () => true;
    expect(roadOf(gaps, purse, 5, all)).toEqual([
      { a: 25, did: 'fills' },
      { a: 27, did: 'open' },
    ]);
    expect(roadOf(gaps, purse, 3, all)).toEqual([{ a: 25, did: 'open' }]);
    expect(roadOf(gaps, purse, 1, all)).toEqual(gaps.map((a) => ({ a, did: 'fills' })));
  });

  it('convoy « common » (39 then 52, 40 coins): 13 builds both (3 + 4); 1 fills both but costs 91', () => {
    const { gaps, moulds, purse, plank } = NUMBERS.common;
    expect(gcd(...gaps)).toBe(plank);
    expect(builders(gaps, Infinity, moulds)).toEqual([13, 1]);
    expect(builders(gaps, purse, moulds)).toEqual([plank]);
    expect(builders(gaps, purse)).toEqual([plank]); // even a workshop would not help: the purse pays 13 alone
    expect(gaps.map((a) => a / plank)).toEqual([3, 4]);
    expect(roadOf(gaps, purse, 1, () => true)).toEqual([
      { a: 39, did: 'fills' },
      { a: 52, did: 'coins' },
    ]);
    expect(moulds.filter((d) => d !== plank && d !== 1).map((d) => gaps.filter((a) => a % d === 0))).toEqual([
      [52],
      [39],
    ]);
  });

  it('convoy « proof » (35 then 26, 61 coins): only the plank 1; its bench is the division notebook, ending on 1', () => {
    const { gaps, purse, plank } = NUMBERS.proof;
    expect(gcd(...gaps)).toBe(1);
    expect(builders(gaps, purse)).toEqual([plank]);
    expect(purse).toBe(gaps[0] + gaps[1]);
    const L = ladderOf(...gaps, 'divide');
    expect(L.rows.map((r) => [r.a, r.b, r.q, r.value])).toEqual([
      [35, 26, 1, 9],
      [26, 9, 2, 8],
      [9, 8, 1, 1],
      [8, 1, 8, 0],
    ]);
    expect([L.gcd, L.steps]).toEqual([1, 4]);
    expect(L.steps).toBeLessThanOrEqual(5); // the proven notebook: 5 rows at most
    expect(PROOF_BENCH).toMatchObject({ kind: 'ladder', mode: 'divide', plain: true, rounds: [{ a: 35, b: 26 }] });
  });

  it('convoy « witness » (645 then 410): of the rules’ planks 2, 3, 5, 9, 10, ONE builds both — 5', () => {
    const { gaps, moulds, plank } = NUMBERS.witness;
    expect(moulds).toEqual(RULES);
    expect(builders(gaps, Infinity, moulds)).toEqual([plank]);
    expect(gcd(...gaps)).toBe(plank);
    expect(gaps.map((a) => a / plank)).toEqual([129, 82]);
    expect(STORY.convoys.witness).toBeUndefined();
    expect(roadOf(gaps, Infinity, 2, () => true)).toEqual([{ a: 645, did: 'open' }]);
    expect(roadOf(gaps, Infinity, 3, () => true)).toEqual([
      { a: 645, did: 'fills' },
      { a: 410, did: 'open' },
    ]);
  });

  it('convoy « hidden » (85 then 119, 50 coins): no plank of the rules builds both, yet 17 does — 5 + 7', () => {
    const { gaps, moulds, purse, plank } = NUMBERS.hidden;
    expect(moulds).toEqual(RULES);
    expect(builders(gaps, Infinity, moulds)).toEqual([]);
    expect(gcd(...gaps)).toBe(plank);
    expect(builders(gaps, purse)).toEqual([plank]); // the workshop: 1 would cost 204 coins
    expect(roadOf(gaps, purse, 1, () => true)).toEqual([{ a: 85, did: 'coins' }]);
    expect(gaps.map((a) => a / plank)).toEqual([5, 7]);
    expect(roadOf(gaps, purse, 5, () => true)).toEqual([
      { a: 85, did: 'fills' },
      { a: 119, did: 'open' },
    ]);
    const L = ladderOf(...gaps, 'divide');
    expect(L.rows.map((r) => [r.a, r.b, r.q, r.value])).toEqual([
      [119, 85, 1, 34],
      [85, 34, 2, 17],
      [34, 17, 2, 0],
    ]);
    expect(HIDDEN_BENCH).toMatchObject({ kind: 'ladder', mode: 'divide', plain: true, rounds: [{ a: 119, b: 85 }] });
  });

  it('the last bridge NEEDS the lesson: 105 and 74 are coprime — the longest plank is 1; 35 fills one lane only', () => {
    const { lanes, options, plank, price } = NUMBERS.boss;
    const [l1, l2] = lanes;
    expect(gcd(l1, l2)).toBe(1);
    expect(plank).toBe(1);
    const [other] = options.filter((b) => b !== plank);
    expect(other).toBeGreaterThan(plank);
    expect([l1 % other, l2 % other]).toEqual([0, 4]);
    // the store divides the whole bridge: the same 4 empty cells as the second lane, so the world stays true
    expect((l1 + l2) % other).toBe(l2 % other);
    expect([l1 + l2, (l1 + l2) * price]).toEqual([179, 895]);
    // no small witness either: every number from 2 to 10 fills one lane at most — « I saw none » proves nothing
    for (let d = 2; d <= 10; d += 1) expect(l1 % d === 0 && l2 % d === 0, `${d}`).toBe(false);
    // the proof: Euclid's divisions end on the remainder 1
    expect(euclid(l1, l2).at(-2).r).toBe(1);
    const { say, boss, objective } = STORY.text;
    for (const line of [boss.mission, boss.choose, say.boss, objective.bossGo]) {
      expect(line, line).toContain(String(l1));
      expect(line, line).toContain(String(l2));
      expect(line, line).toMatch(/أطول/);
      expect(line, line).not.toMatch(/PGCD|احسب القاسم|إقليدس|أوّلي|أولي/);
    }
    expect(say.bossFail(other)).toBe(
      'الألواح 35 تملأ الممرّ الأوّل (105 خانة)، لكن في الممرّ الثاني (74 خانة) بقيت 4 خانات فارغة. جرّب النوع الآخر.',
    );
    expect(say.bossFail(2)).toContain(
      'الألواح 2 تملأ الممرّ الثاني (74 خانة)، لكن في الممرّ الأوّل (105 خانة) بقيت خانة واحدة فارغة',
    );
    expect(say.bossFail(4)).toContain(
      'في الممرّ الأوّل (105 خانة) بقيت خانة واحدة فارغة، وفي الممرّ الثاني (74 خانة) بقيت خانتان فارغتان',
    );
    expect(say.bossOk).toContain('179 لوحًا طولها 1: 105 في الممرّ الأوّل و 74 في الممرّ الثاني');
  });

  it('a purse stops ONLY the plank 1: every other plank of an island shows its real remainder, never « no coins »', () => {
    for (const id of ['only', 'common', 'hidden']) {
      const { gaps, moulds, purse, plank } = NUMBERS[id];
      for (const b of moulds.filter((x) => x !== 1)) {
        const road = roadOf(gaps, purse, b, () => true);
        expect(
          road.some((x) => x.did === 'coins'),
          `${id} ${b}`,
        ).toBe(false);
        expect(
          road.every((x) => x.did === 'fills'),
          `${id} ${b}`,
        ).toBe(b === plank);
      }
      if (plank !== 1) expect(roadOf(gaps, purse, 1, () => true).at(-1).did, id).toBe('coins');
    }
  });

  it('the road: one island more than segments, every bridge holds with its plank, ids unique, the store in دج', () => {
    expect(STORY.islands).toHaveLength(STORY.segments.length + 1);
    const ids = STORY.segments.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const seg of STORY.segments.filter((x) => x.kind === 'bridge')) expect(seg.a % seg.holdsWith, seg.id).toBe(0);
    const boss = STORY.segments.find((x) => x.boss);
    expect([boss.a, boss.holdsWith]).toEqual([179, 1]);
    expect(boss.boss.options.filter((b) => boss.a % b === 0)).toEqual([boss.holdsWith]);
    expect(STORY.segments.indexOf(boss)).toBe(STORY.segments.length - 1);
    expect(STORY.segments.filter((s) => s.kind === 'rail')).toHaveLength(1);
    expect(STORY.segments.findIndex((s) => s.kind === 'rail')).toBe(10);
    const T = STORY.text.boss;
    for (const line of [T.price, T.costAsk(1, 179), T.err.cost(900)]) {
      expect(line).toContain('دج');
      expect(line).not.toMatch(/\bDA\b|\d \d{3}/);
    }
    expect(T.costAsk(1, 179)).toContain('179 لوحًا طولها 1');
    expect(T.err.big(1, 3)).toContain('بقيت 3 خانات فارغة');
    expect(STORY.text.subtitle).toMatch(/105 خانة ثمّ 74 خانة/);
    // a gap past 200 cells is drawn as a strip (Game.js draws one tick per cell up to 200): its cell is still drawable
    for (const seg of STORY.segments.filter((x) => x.kind === 'bridge'))
      expect(seg.len / seg.a, seg.id).toBeGreaterThan(0.012);
  });

  it('five convoys of two bridges: consecutive; planks on A, C, G and I, a workshop on E (open) and on I (after two falls)', () => {
    const groups = ['only', 'common', 'proof', 'witness', 'hidden'];
    let at = -1;
    for (const id of groups) {
      const group = STORY.segments.filter((x) => x.convoy === id);
      expect(group, id).toHaveLength(2);
      const first = STORY.segments.indexOf(group[0]);
      expect(first, id).toBe(at + 1);
      expect(STORY.segments[first + 1], id).toBe(group[1]);
      at = first + 1;
      expect(
        group.map((s) => s.a),
        id,
      ).toEqual(NUMBERS[id].gaps);
      for (const seg of group) expect([seg.predict, seg.holdsWith], seg.id).toEqual([false, NUMBERS[id].plank]);
      // the later bridge: no planks, no workshop, nothing on its island
      expect(group[1].moulds, id).toEqual([]);
      expect(group[1].workshop, id).toBeUndefined();
      expect(STORY.islands[first + 1].feature, id).toBeUndefined();
      expect(group[0].moulds, id).toEqual(NUMBERS[id].moulds ?? []);
      expect(STORY.convoys[id]?.purse, id).toBe(NUMBERS[id].purse);
    }
    const shops = STORY.segments.filter((s) => s.workshop);
    expect(shops.map((s) => s.convoy)).toEqual(['proof', 'hidden']);
    expect(shops.map((s) => [s.workshop.open, s.workshop.typed, s.workshop.min, s.workshop.max])).toEqual([
      [true, true, 1, 35],
      [false, true, 1, 119],
    ]);
    expect(shops.map((s) => s.workshop.bench)).toEqual([PROOF_BENCH, HIDDEN_BENCH]);
    expect(STORY.islands.filter((i) => i.feature === 'anvil').map((i) => i.id)).toEqual(['E', 'I']);
    expect(Object.keys(STORY.convoys)).toEqual(['only', 'common', 'proof', 'hidden']);
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
    const [g25, g27, g39, g52, g35, g26, g645, g410, g85, g119] = segs;
    const O = (seg) => STORY.objective(game, seg);
    expect(O(g25)).toBe(
      'خذ من هذه الجزيرة ألواحًا تبني جسرين: هوّة 25 خانة ثمّ هوّة 27 خانة، ولا ألواح على الجزيرة التالية. لكلّ لوح قطعة من الكيس مهما كان طوله، وفي الكيس 52 قطعة.',
    );
    game.state.held = 5;
    expect(O(g25)).toBe(
      'معك ألواح طولها 5: ابنِ بها هوّة 25 خانة ثمّ هوّة 27 خانة عند منصّة الضوء. لكلّ لوح قطعة، وفي الكيس 52 قطعة. لوح بطول آخر؟ خذه من هذه الجزيرة.',
    );
    Object.assign(g25, { complete: true, builtWith: 5 });
    expect(O(g27)).toBe(
      'الهوّة 27 خانة. ابنِ جسرها بالألواح 5 التي تحملها: لا ألواح على هذه الجزيرة، وبقيت في الكيس 47 قطعة.',
    );
    game.flags.convoyStuck = 'g27';
    expect(O(g27)).toBe('لا ألواح على هذه الجزيرة. ارجع إلى «مرسى النوارس» واختر ألواحًا أخرى تبني الجسرين.');
    game.flags.convoyStuck = null;
    expect(STORY.recall(game, 1)).toEqual(['الجسر الأوّل: $25 = 5 \\times 5$', 'دفعتَ 5 قطع، وبقيت في الكيس 47 قطعة']);
    // the card of C: what each plank he fired did on the two gaps (the mirror's own bridges are not his)
    game.log = [
      { a: 25, b: 5 },
      { a: 27, b: 5 },
      { a: 25, b: 3 },
      { a: 25, b: 1 },
      { a: 27, b: 1 },
      { a: 27, b: 9, mirror: true },
    ];
    expect(STORY.recall(game, 2)).toEqual([
      'اللوح 5: ملأ 25، ولم يملأ 27',
      'اللوح 3: لم يملأ 25',
      'اللوح 1: ملأ 25 و 27',
    ]);
    game.state.held = null;
    expect(O(g39)).toContain('هوّة 39 خانة ثمّ هوّة 52 خانة');
    expect(O(g39)).toContain('وفي الكيس 40 قطعة.');
    game.log.push({ a: 39, b: 1 }, { a: 52, b: 1 }, { a: 39, b: 13 }, { a: 52, b: 13 });
    expect(STORY.recall(game, 4)).toEqual(['اللوح 1: ملأ 39، ولم تكفِ القطع للهوّة 52', 'اللوح 13: ملأ 39 و 52']);
    // island E: the workshop, the two gaps, the purse
    expect(O(g35)).toBe(
      'اصنع في ورشة هذه الجزيرة لوحًا بالطول الذي تختاره: ألواحه تبني هوّة 35 خانة ثمّ هوّة 26 خانة، ولا ألواح على الجزيرة التالية. لكلّ لوح قطعة من الكيس مهما كان طوله، وفي الكيس 61 قطعة. وفي الورشة دفتر للهوّتين.',
    );
    game.state.held = 1;
    expect(O(g35)).toContain('لوح بطول آخر؟ اصنعه في الورشة.');
    Object.assign(g35, { complete: true, builtWith: 1 });
    expect(O(g26)).toBe(
      'الهوّة 26 خانة. ابنِ جسرها بالألواح 1 التي تحملها: لا ألواح على هذه الجزيرة، وبقيت في الكيس 26 قطعة.',
    );
    game.flags.convoyStuck = 'g26';
    expect(O(g26)).toBe('لا ألواح على هذه الجزيرة. ارجع إلى «جزيرة السنديان» واصنع في ورشتها لوحًا بطول آخر.');
    game.flags.convoyStuck = null;
    expect(STORY.recall(game, 5)).toEqual([
      'الجسر الأوّل: $35 = 1 \\times 35$',
      'دفعتَ 35 قطعة، وبقيت في الكيس 26 قطعة',
    ]);
    // island G: the rules' planks, no purse
    game.state.held = null;
    expect(O(g645)).toBe(
      'خذ من هذه الجزيرة ألواحًا تبني جسرين: هوّة 645 خانة ثمّ هوّة 410 خانة، ولا ألواح على الجزيرة التالية. أطوال ألواحها 2 و 3 و 5 و 9 و 10: أعداد تعرف قواعد قابلية القسمة عليها.',
    );
    game.state.held = 5;
    expect(O(g645)).toBe(
      'معك ألواح طولها 5: ابنِ بها هوّة 645 خانة ثمّ هوّة 410 خانة عند منصّة الضوء. لوح بطول آخر؟ خذه من هذه الجزيرة.',
    );
    Object.assign(g645, { complete: true, builtWith: 5 });
    expect(O(g410)).toBe('الهوّة 410 خانة. ابنِ جسرها بالألواح 5 التي تحملها: لا ألواح على هذه الجزيرة.');
    expect(STORY.recall(game, 7)).toEqual(['الجسر الأوّل: $645 = 5 \\times 129$', 'أمامك الهوّة 410، بالألواح نفسها']);
    // island I: its planks first; the workshop opens once the first bridge has fallen twice
    game.state.held = null;
    expect(O(g85)).toContain('الورشة تُفتح إذا انهار الجسر الأوّل مرّتين.');
    game.flags.anvil = true;
    expect(O(g85)).toContain('الورشة مفتوحة: اصنع فيها لوحًا يبني هوّة 85 خانة ثمّ هوّة 119 خانة');
    game.state.held = 17;
    expect(O(g85)).toContain('لوح بطول آخر؟ خذه من الجزيرة أو اصنعه في الورشة.');
    game.flags.anvil = false;
    expect(O(g85)).toContain('لوح بطول آخر؟ خذه من هذه الجزيرة.');
    game.flags.convoyStuck = 'g119';
    Object.assign(g85, { complete: true, builtWith: 5 });
    expect(O(g119)).toBe('لا ألواح على هذه الجزيرة. ارجع إلى «جزيرة الدردار» وخذ ألواحًا أخرى، أو اصنعها في ورشتها.');
    game.flags.convoyStuck = null;
    game.log.push({ a: 85, b: 5 }, { a: 119, b: 5 }, { a: 85, b: 2 }, { a: 85, b: 17 }, { a: 119, b: 17 });
    expect(STORY.recall(game, 10)).toEqual([
      'اللوح 5: ملأ 85، ولم يملأ 119',
      'اللوح 2: لم يملأ 85',
      'اللوح 17: ملأ 85 و 119',
    ]);
    // elsewhere: the world's own card and its own instruction
    expect(STORY.recall(game, 11)).toBe(null);
    expect(STORY.recall(game, 12)).toBe(null);
    expect(O(segs[10])).toBe(null);
    expect(O(segs[11])).toBe(null);
    // the sentences said when a bridge holds agree with their numbers
    const S = STORY.text.say;
    expect(S.headOk(25, 1, 27, 27)).toBe(
      '25 لوحًا طولها 1 تملأ 25 خانة، وبقيت في الكيس 27 قطعة. اعبر: الهوّة 27 تنتظر الألواح نفسها.',
    );
    expect(S.tailOk(27, 1, 0)).toBe('27 لوحًا طولها 1 تملأ 27 خانة: الجسران ثابتان، وقطع الكيس كلّها في الجسرين.');
    expect(S.headOk(645, 5, null, 410)).toBe('129 لوحًا طولها 5 تملأ 645 خانة. اعبر: الهوّة 410 تنتظر الألواح نفسها.');
    expect(S.tailOk(119, 17, 0)).toBe('7 ألواح طولها 17 تملأ 119 خانة: الجسران ثابتان، وقطع الكيس كلّها في الجسرين.');
    expect(S.tailOk(52, 13, 0)).toContain('4 ألواح طولها 13 تملأ 52 خانة');
    const heard = [];
    game.say = (s) => heard.push(s);
    expect(STORY.onHold(game, g645, 5)).toBe(true);
    expect(heard.at(-1)).toContain('اعبر: الهوّة 410');
    expect(STORY.onHold(game, g410, 5)).toBe(true);
    expect(heard.at(-1)).toBe('82 لوحًا طولها 5 تملأ 410 خانة: الجسران ثابتان.');
    expect(STORY.onHold(game, segs[11], 1)).toBe(false);
    void [g52];
  });

  it('every wave of the gate dash has exactly one right gate, stays mental arithmetic, and is no pair of the bank', () => {
    expect(STORY.dashWaves).toHaveLength(8);
    for (const w of STORY.dashWaves) {
      expect(w.gates.filter(w.test), w.say).toHaveLength(1);
      expect(new Set(w.gates).size).toBe(3);
      const ns = w.say.match(/\d+/g).map(Number);
      for (const n of [...ns, ...w.gates]) expect(n, w.say).toBeLessThanOrEqual(100);
    }
    expect(DASH_PAIRS.length).toBeGreaterThanOrEqual(5);
    // two witness waves hide their common divisor from the rules' planks
    const hidden = STORY.dashWaves.filter(
      (w) =>
        /قاسم مشترك/.test(w.say) && w.gates.find(w.test) > 10 && !RULES.some((r) => w.gates.find(w.test) % r === 0),
    );
    expect(hidden).toHaveLength(2);
  });

  it('the tablets say the story’s own numbers, their equalities are true, and each holds on its card', () => {
    let checked = 0;
    for (const t of Object.values(TABLETS)) {
      for (const m of t.math) {
        const [lhs, rhs] = m.split('=').map((x) => x.trim());
        const args = pgcdArgs(lhs);
        if (args) expect(gcd(...args), m).toBe(Number(rhs));
        else {
          const [, x] = lhs.match(/^(\d+)$/);
          const [, y, z, r] = rhs.match(/^(\d+) \\times (\d+) \+ (\d+)$/);
          expect(Number(y) * Number(z) + Number(r), m).toBe(Number(x));
        }
        checked += 1;
      }
      expect(t.lines.length, t.title).toBeLessThanOrEqual(2);
      expect(t.math.length, t.title).toBeLessThanOrEqual(2);
      expect(t.notes.length, t.title).toBeLessThanOrEqual(1);
      for (const n of t.notes) expect(n, t.title).not.toContain('$');
      for (const line of [...t.lines, ...t.math, ...t.notes]) said(line);
    }
    expect(checked).toBe(6);
    // an equality inside a plain sentence is isolated left to right (LRI … PDI), never reversed by the bidi algorithm
    for (const t of Object.values(TABLETS))
      for (const n of t.notes)
        for (const m of n.matchAll(/[\d ×+]+=[\d ×+]+/g))
          expect(n.slice(m.index - 1, m.index), `« ${m[0]} » isolated`).toBe('⁦');
    expect(TABLETS.awwaliyan.notes[0]).toBe('اللوح 1 وحده بنى الجسرين 25 و 27 بـ 52 قطعة: ⁦25 + 27 = 52⁩');
    expect(TABLETS['ithbat-awwaliyan'].math[0]).toBe('9 = 8 \\times 1 + 1');
    expect(TABLETS['shahid-wahid'].notes[0]).toBe('اللوح 17 بنى الجسرين 85 و 119 بـ 12 قطعة: ⁦5 + 7 = 12⁩');
  });

  it('borrows no island name and no number of the finished lessons, and no pair of the bank — not even on one of its lines', () => {
    const theirNames = new Set(OTHERS.flatMap((s) => [...s.matchAll(/name: '([^']+)'/g)].map((m) => m[1])));
    for (const island of STORY.islands) expect(theirNames.has(island.name), island.name).toBe(false);
    expect(new Set(STORY.islands.map((i) => i.name)).size).toBe(STORY.islands.length);
    expect(SHEETS).toHaveLength(50);
    // the numbers of the last bridge are in no other story and nowhere in the bank
    const { lanes } = NUMBERS.boss;
    for (const n of [...lanes, lanes[0] + lanes[1]]) {
      for (const s of OTHERS) expect(s, `${n}`).not.toMatch(alone(n));
      for (const s of SHEETS) expect(s, `${n}`).not.toMatch(alone(n));
    }
    // the pairs of the road and of the dash: never a pair the bank names, never two numbers on one line of the bank
    // (its solutions chain divisions: « 39 = 26 × 1 + 13 » stands in one — the design's 26 ; 39 was replaced)
    for (const [x, y] of [...ROAD_PAIRS, ...DASH_PAIRS]) {
      expect(BANK_PAIRS.has(pairKey(x, y)), `${x} ; ${y}`).toBe(false);
      expect(onOneLine(LINES, x, y), `${x} ; ${y}`).toBeUndefined();
    }
    // …nor on one line of another story (its dash's gates excepted: « gates: [25, 26, 27] », « sameWave(91, 35, [56, 45, 26]) » are answers, not a pair)
    for (const [x, y] of ROAD_PAIRS)
      for (const s of OTHERS)
        expect(
          onOneLine(
            s.split('\n').filter((l) => !/gates:|Wave\(/.test(l)),
            x,
            y,
          ),
          `${x} ; ${y}`,
        ).toBeUndefined();
    // the long gaps of the road are in no other story
    for (const n of [645, 410, 179]) for (const s of OTHERS) expect(s, `${n}`).not.toMatch(alone(n));
  });

  it('tells no rule before its key: the islands, the instructions, the cards and the sentences said on the way', () => {
    // an island's name is on its sign from afar: no rule, no number
    for (const island of STORY.islands)
      expect(island.name, island.name).not.toMatch(/مشترك|أكبر|PGCD|قاسم|أوّلي|أولي|شاهد|يكفي|قسمة|إقليدس|\d/);
    const S = STORY.text.say;
    const O = STORY.text.objective;
    const R = STORY.text.recall;
    const on = (b, gaps) => gaps.map((a) => ({ a, did: a % b ? 'open' : 'fills' }));
    // islands A–E, before 🤝: nothing common, no « only 1 », no coprime, no PGCD
    const beforeOnly = [
      STORY.text.subtitle,
      S.hello,
      S.tailPurse(27),
      S.tailPurse(52),
      S.common,
      S.headOk(25, 1, 27, 27),
      S.tailOk(27, 1, 0),
      S.headOk(39, 13, 4, 52),
      S.tailOk(52, 13, 0),
      O.pick('only'),
      O.pick('common'),
      O.carry('only', 5, 52, false),
      O.tail(27, 5, 47),
      O.convoyBack('مرسى النوارس'),
      S.convoyBack('جزيرة الحصى', 3),
      S.convoyReset(5),
      S.convoyOnly,
      R.first(25, 5),
      R.paid(5, 47),
      R.plank(5, on(5, [25, 27])),
      R.plank(1, [{ a: 39, did: 'coins' }]),
    ];
    for (const line of beforeOnly)
      expect(line, line).not.toMatch(/مشترك|PGCD|قاسم|أوّلي|أولي|الوحيد|وحده|فقط اللوح|إقليدس|شاهد|يكفي/);
    // islands E–G, before ✅: no proof, no « the last remainder », no coprime
    const beforeProof = [
      S.proof,
      S.tailPurse(26),
      O.make('proof'),
      O.carry('proof', 1, 61, false),
      O.tail(26, 1, 26),
      O.convoyBack('جزيرة السنديان'),
      STORY.text.workshop.bench,
      STORY.text.workshop.benchSub,
    ];
    for (const line of beforeProof)
      expect(line, line).not.toMatch(/PGCD|القاسم المشترك|آخر باق|غير معدوم|أوّلي|أولي|نثبت|برهان|إقليدس|يكفي|شاهد/);
    // islands G–K, before ❌: no witness, no « one is enough », no « proves nothing »
    const beforeWitness = [
      S.witness,
      S.hidden,
      S.tailFree(410),
      S.tailPurse(119),
      S.anvilOpen,
      O.witness,
      O.hidden,
      O.hiddenOpen,
      O.carry('hidden', 5, 12, true),
      O.convoyBack('جزيرة الدردار'),
      S.headOk(645, 5, null, 410),
    ];
    for (const line of beforeWitness)
      expect(line, line).not.toMatch(
        /PGCD|القاسم المشترك|قاسم مشترك|يكفي|واحد يكفي|شاهد|لا يثبت|لا نستنتج|أوّليّين|ليسا/,
      );
    for (const line of [...beforeOnly, ...beforeProof, ...beforeWitness]) said(line);
  });
});
