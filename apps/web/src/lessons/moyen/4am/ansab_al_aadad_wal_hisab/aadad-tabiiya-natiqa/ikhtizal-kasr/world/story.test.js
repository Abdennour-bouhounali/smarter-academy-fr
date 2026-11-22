import { describe, it, expect } from 'vitest';
import { describeStory } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { ladderOf } from '../../../../../../common/gameworld/divisorIsles/inquiry';
import { K, NUMBERS, STORY, TABLETS, didOf } from './story';
import { KEYS } from './journey';
import { THULUTH_BENCH, TUSU_BENCH } from './inquiries';
import { gcd, markVerdict, range, signChain, signTex } from './math';

const S = STORY.text.say;
const O = STORY.text.objective;
const R = STORY.text.recall;
const seg = (i) => STORY.segments[i];
const [A, B, C, D, E, , BOSS] = STORY.segments;
const sum = (xs) => xs.reduce((n, x) => n + x, 0);

/** The planks of b that HOLD a marked bridge (fill it, joint on the post) within its purse. */
const holders = (s, candidates, purse = Infinity) =>
  candidates.filter((b) => markVerdict(s.a, s.mark, b).holds && s.a / b <= purse);
const purseOf = (s) => STORY.convoys[s.convoy]?.purse ?? Infinity;

const TEX = '\\frac{66}{78} = \\frac{33}{39}';
describeStory({
  id: 'ikhtizal-kasr',
  story: STORY, // the suite reads its marked bridges, strokes and the store's purse itself (mark.js)
  tablets: TABLETS,
  keys: KEYS,
  pairs: [
    [78, 66],
    [48, 35],
    [99, 66],
    [243, 189],
    [39, 13],
    [39, 5],
    [39, 8],
    [273, 195],
    [273, 88],
    [273, 107],
    [88, 107],
  ],
  sentences: [
    O.carry(A, 2, null),
    O.carry(C, 33, 3),
    O.carry(D, 27, 9),
    O.carry(E, 13, 3),
    O.make(C, 3),
    O.make(D, 9),
    O.make(E, 3),
    O.shorter(TEX),
    O.other(TEX),
    O.crossA(TEX),
    S.firstWriting(TEX),
    S.twoWritings(TEX),
    S.holdB('\\frac{35}{48}'),
    S.holdShop(99, 33, 0, '\\frac{66}{99} = \\frac{2}{3}'),
    S.holdShop(243, 27, 0, '\\frac{189}{243} = \\frac{7}{9}'),
    ...[1, 2, 3, 13, 33].flatMap((b) => ['holds', 'post', 'coins', 'open'].map((d) => R.plank(b, d))),
  ],
  before: {
    [K.marahil]: {
      words: /اختزال|اختزل|يُختزل|مختزل|غير قابل|PGCD|القاسم المشترك|قاسم مشترك|مراحل/,
      lines: [
        STORY.text.subtitle,
        S.hello,
        S.firstWriting(TEX),
        S.twoWritings(TEX),
        S.backA,
        O.pickA,
        O.carry(A, 4, null),
        O.shorter(TEX),
        O.other(TEX),
        O.crossA(TEX),
        O.backA,
        R.sign(TEX),
        R.plank(4, 'open'),
      ],
    },
    [K.ghayr]: {
      words: /غير قابل|لا يُختزل|أوّليّ|أولي|PGCD|القاسم المشترك|الوحيد|وحده/,
      lines: [
        S.ghayr,
        O.pickB,
        O.carry(B, 3, null),
        S.holdB('\\frac{35}{48}'),
        R.plank(3, 'post'),
        R.plank(1, 'holds'),
      ],
    },
    [K.pgcd]: {
      words: /PGCD|القاسم المشترك الأكبر|أكبر قاسم|أطول لوح|مباشرة/,
      lines: [
        S.thuluth,
        S.tusu,
        O.make(C, 3),
        O.make(D, 9),
        O.carry(C, 11, 3),
        S.holdShop(99, 33, 0, '\\frac{66}{99} = \\frac{2}{3}'),
        STORY.text.workshop.bench,
        STORY.text.workshop.benchSub,
        THULUTH_BENCH.text.lead(99, 66),
        THULUTH_BENCH.text.goal(),
        R.plank(11, 'coins'),
      ],
    },
    [K.natija]: {
      words: /نختزل النتيجة|نتيجة الحساب|نجمع|الجمع|نحسب ثمّ/,
      lines: [S.natija, O.make(E, 3), O.carry(E, 13, 3), S.holdShop(39, 13, 0, '\\frac{13}{39} = \\frac{1}{3}')],
    },
  },
});

describe('the road of « اختزال كسر » — every fact of a marked bridge is computed', () => {
  it('A → B (78 cells, 66 lit): of 2, 4, 6 and 9, exactly 2 and 6 hold; the sign writes 66/78 = 33/39 = 11/13', () => {
    const { gap, mark, moulds, holders: two, plank } = NUMBERS.marahil;
    expect([A.a, A.mark, A.moulds, A.holdsWith]).toEqual([gap, mark, moulds, plank]);
    expect(holders(A, moulds)).toEqual(two);
    expect(two).toEqual([2, 6]);
    expect(plank).toBe(gcd(gap, mark));
    expect(moulds.filter((b) => !markVerdict(gap, mark, b).fills)).toEqual([4, 9]);
    expect(signChain(gap, mark, [2, 6])).toEqual([
      [66, 78],
      [33, 39],
      [11, 13],
    ]);
    expect(signTex(signChain(gap, mark, [2, 6]))).toBe('\\frac{66}{78} = \\frac{33}{39} = \\frac{11}{13}');
    // 6 first, then 2: the same three writings, in his order
    expect(signChain(gap, mark, [6, 2]).map(([n, d]) => n / d)).toEqual([66 / 78, 66 / 78, 66 / 78]);
  });

  it('B → C (48 cells, 35 lit): 3 fills and misses the post (35 = 3 × 11 + 2), 5 and 7 do not fill, 1 holds — the sign stays', () => {
    const { moulds } = NUMBERS.ghayr;
    expect(gcd(B.a, B.mark)).toBe(1);
    expect(holders(B, moulds)).toEqual([1]);
    expect(markVerdict(48, 35, 3)).toMatchObject({ fills: true, joint: false, mark: { m: 35, q: 11, r: 2 } });
    expect([5, 7].map((b) => markVerdict(48, 35, b).fills)).toEqual([false, false]);
    expect(signChain(48, 35, [1])).toEqual([[35, 48]]);
    expect(['post', 'open', 'open', 'holds']).toEqual(moulds.map((b) => didOf(B, b)));
  });

  it('C → D and D → E: a workshop and a purse — only the longest plank that holds is paid (33, then 27)', () => {
    for (const [s, n] of [
      [C, NUMBERS.thuluth],
      [D, NUMBERS.tusu],
    ]) {
      const purse = purseOf(s);
      expect(purse).toBe(n.purse);
      expect(holders(s, range(1, s.workshop.max), purse)).toEqual([n.plank]);
      expect(n.plank).toBe(gcd(s.a, s.mark));
      expect(s.a / n.plank).toBe(purse);
      // the cheaper planks (fewer coins) fill the gap and miss the post; the shorter ones that hold run out of coins
      const cheaper = range(n.plank + 1, s.a).filter((b) => s.a % b === 0);
      for (const b of cheaper) expect(didOf(s, b, purse), `${s.a} ${b}`).toBe('post');
      for (const b of range(1, n.plank - 1).filter((b) => markVerdict(s.a, s.mark, b).holds))
        expect(didOf(s, b, purse), `${s.a} ${b}`).toBe('coins');
    }
    expect(signTex(signChain(99, 66, [33]))).toBe('\\frac{66}{99} = \\frac{2}{3}');
    expect(signTex(signChain(243, 189, [27]))).toBe('\\frac{189}{243} = \\frac{7}{9}');
    expect([C.workshop.bench, D.workshop.bench]).toEqual([THULUTH_BENCH, TUSU_BENCH]);
    expect(ladderOf(99, 66, 'divide').rows.map((r) => [r.a, r.b, r.q, r.value])).toEqual([
      [99, 66, 1, 33],
      [66, 33, 2, 0],
    ]);
    expect(ladderOf(243, 189, 'divide').rows.map((r) => [r.a, r.b, r.q, r.value])).toEqual([
      [243, 189, 1, 54],
      [189, 54, 3, 27],
      [54, 27, 2, 0],
    ]);
  });

  it('E → F (39 cells lit 5 then 8, 3 coins): the sign opens on a sum; only 13 is paid — 1/3', () => {
    expect(E.strokes).toEqual([5, 8]);
    expect(E.mark).toBe(13);
    expect(E.workshop.bench).toBeUndefined();
    expect(holders(E, range(1, 39), purseOf(E))).toEqual([13]);
    expect(signTex(signChain(39, 13, [13]), [5, 8])).toBe(
      '\\frac{5}{39} + \\frac{8}{39} = \\frac{13}{39} = \\frac{1}{3}',
    );
    expect(didOf(E, 39, 3)).toBe('post');
    expect(didOf(E, 1, 3)).toBe('coins');
  });

  it('THE LAST BRIDGE NEEDS THE LESSON: both planks of the store hold the post; 3 leaves a writing that still reduces and runs out of coins; only the PGCD 39 writes 5/7', () => {
    const { gap, strokes, purse, options, plank, price } = NUMBERS.boss;
    const mark = sum(strokes);
    expect([BOSS.a, BOSS.mark, BOSS.strokes, BOSS.holdsWith, STORY.convoys.marfa.purse]).toEqual([
      gap,
      mark,
      strokes,
      plank,
      purse,
    ]);
    expect(STORY.segments.at(-1)).toBe(BOSS);
    expect(options.map((b) => markVerdict(gap, mark, b).holds)).toEqual([true, true]);
    const [small] = options.filter((b) => b !== plank);
    // the common divisor the rules of divisibility show (3: the sum of the digits) writes 65/91 …
    expect(signChain(gap, mark, [small]).at(-1)).toEqual([65, 91]);
    // … which still reduces, by 13 — that no rule of divisibility shows (2, 3, 5, 9, 10 divide neither both)
    expect(gcd(65, 91)).toBe(13);
    for (const r of [2, 3, 5, 9, 10]) expect(65 % r === 0 && 91 % r === 0, `${r}`).toBe(false);
    expect(gap / small).toBeGreaterThan(purse);
    expect(plank).toBe(gcd(gap, mark));
    expect(gap / plank).toBe(purse);
    expect(signTex(signChain(gap, mark, [plank]), strokes)).toBe(
      '\\frac{88}{273} + \\frac{107}{273} = \\frac{195}{273} = \\frac{5}{7}',
    );
    expect((gap / plank) * price).toBe(42);
    const T = STORY.text.boss;
    for (const line of [T.price, T.costAsk(plank, gap / plank), T.err.cost(40)]) {
      expect(line).toContain('دج');
      expect(line).not.toMatch(/\bDA\b|\d \d{3}/);
    }
    for (const line of [T.mission, T.choose, O.bossGo]) expect(line, line).toMatch(/غير القابل للاختزال/);
    for (const line of [T.mission, T.choose, O.bossGo, S.boss])
      expect(line, line).not.toMatch(/PGCD|القاسم المشترك|أطول/);
    expect(S.bossOk).toContain('7 ألواح طولها 39');
  });

  it('the dash: each wave computed — a stage, an irreducible writing, the PGCD, a result', () => {
    const W = STORY.dashWaves;
    expect(W).toHaveLength(8);
    expect(W.map((w) => w.gates.find(w.test))).toEqual([23, 15, 5, 15, 15, 27, 4, 3]);
    // the wrong gates are real mistakes: the denominator not divided, a writing that still reduces, the denominators added
    expect(W[2].gates.filter((g) => !W[2].test(g))).toEqual([10, 15]);
    expect(W[3].gates).toContain(60);
    for (const w of W) expect(w.say).toMatch(/\\frac/);
  });

  it('the instruction says everything, the card what the bridge before showed — the hooks played on a fake game', () => {
    const segs = STORY.segments.map((s, index) => ({ ...s, index, complete: false, builtWith: null }));
    const opened = [];
    const heard = [];
    const game = {
      T: STORY.text,
      state: { held: null, keys: [], stage: 0 },
      flags: {},
      segs,
      log: [],
      markSigns: {},
      openForge: (k) => opened.push(k),
      say: (s) => heard.push(s),
      purseOf: (s) => (STORY.convoys[s.convoy] ? { left: STORY.convoys[s.convoy].purse } : null),
    };
    const [a, b, c, , e] = segs;
    const Ob = (s) => STORY.objective(game, s);
    expect(Ob(a)).toBe(O.pickA);
    expect(O.pickA).toContain('2 و 4 و 6 و 9');
    game.state.held = 2;
    expect(Ob(a)).toBe(O.carry(a, 2, null));
    // the first hold, with 2: the sign, then « a longer plank »
    game.markSigns[a.id] = [2];
    a.complete = true;
    expect(Ob(a)).toBe(O.shorter('\\frac{66}{78} = \\frac{33}{39}'));
    expect(STORY.onHold(game, a, 2)).toBe(true);
    expect(heard.at(-1)).toBe(S.firstWriting('\\frac{66}{78} = \\frac{33}{39}'));
    // he crosses with one writing: no mirror on B; the instruction and the robot send him back to A
    STORY.onArrive(game, 1);
    expect(opened).toEqual([]);
    expect(heard.at(-1)).toBe(S.backA);
    expect(Ob(b)).toBe(O.backA);
    expect(STORY.pendingForge({ ...game, state: { ...game.state, stage: 1 } })).toBe(null);
    // he rebuilds A with 6 from behind (stage 1): the mirror of B opens at once
    game.state.stage = 1;
    game.markSigns[a.id] = [2, 6];
    expect(STORY.onHold(game, a, 6)).toBe(true);
    expect(heard.at(-1)).toBe(S.twoWritings('\\frac{66}{78} = \\frac{33}{39} = \\frac{11}{13}'));
    expect(opened).toEqual([K.marahil]);
    expect(STORY.pendingForge(game)).toBe(K.marahil);
    expect(Ob(a)).toBe(O.crossA('\\frac{66}{78} = \\frac{33}{39} = \\frac{11}{13}'));
    // 6 first: the other plank that holds
    game.markSigns[a.id] = [6];
    expect(Ob(a)).toBe(O.other('\\frac{66}{78} = \\frac{11}{13}'));
    game.markSigns[a.id] = [6, 2];
    expect(Ob(a)).toBe(O.crossA('\\frac{66}{78} = \\frac{11}{13} = \\frac{33}{39}'));
    // the keys in order: no mirror of C while 🪜 is missing
    expect(STORY.pendingForge({ ...game, state: { ...game.state, stage: 2 } })).toBe(K.marahil);
    game.state.keys = [K.marahil];
    game.state.held = null;
    expect(Ob(b)).toBe(O.pickB);
    expect(STORY.pendingForge({ ...game, state: { ...game.state, stage: 2 } })).toBe(K.ghayr);
    // a rebuild of A that fell after the key: back to A
    a.complete = false;
    expect(Ob(b)).toBe(O.backA);
    a.complete = true;
    // island C: the workshop, the bridge, the purse
    expect(Ob(c)).toBe(O.make(c, 3));
    expect(Ob(c)).toContain('وفي الكيس 3 قطع.');
    expect(Ob(c)).toContain('وفي الورشة دفتر.');
    expect(Ob(e)).not.toContain('دفتر');
    expect(Ob(e)).toContain('39 خانة، أُضيئت منها 5 ثمّ 8');
    game.state.held = 11;
    expect(Ob(c)).toBe(O.carry(c, 11, 3));
    // the card of C: the sign of B and what his last planks did there (the mirror's own bridges are not his)
    game.markSigns[b.id] = [1];
    game.log = [
      { a: 48, b: 3 },
      { a: 35, b: 3 },
      { a: 48, b: 5 },
      { a: 48, b: 1 },
      { a: 48, b: 7, mirror: true },
    ];
    expect(STORY.recall(game, 2)).toEqual([R.sign('\\frac{35}{48}'), R.plank(5, 'open'), R.plank(1, 'holds')]);
    game.markSigns[c.id] = [33];
    game.log.push({ a: 99, b: 11 }, { a: 99, b: 33 });
    expect(STORY.recall(game, 3)).toEqual([
      R.sign('\\frac{66}{99} = \\frac{2}{3}'),
      R.plank(11, 'coins'),
      R.plank(33, 'holds'),
    ]);
    // a workshop bridge held: its sentence says the planks, the coins, the sign
    game.purseOf = () => ({ left: 0 });
    expect(STORY.onHold(game, c, 33)).toBe(true);
    expect(heard.at(-1)).toBe(
      '3 ألواح طولها 33 تملأ 99 خانة، والعمود على فاصل، ولم يبقَ في الكيس شيء. اللافتة: $\\frac{66}{99} = \\frac{2}{3}$.',
    );
    expect(STORY.onHold(game, b, 1)).toBe(true);
    expect(heard.at(-1)).toBe('اللوح 1 ثبّت الجسر: 35 لوحًا مضاءً من 48، واللافتة بقيت $\\frac{35}{48}$.');
    // elsewhere: the world's own instruction and card
    expect(Ob(seg(5))).toBe(null);
    expect(Ob(segs[6])).toBe(null);
    expect(STORY.recall(game, 6)).toBe(null);
    expect(STORY.recall(game, 7)).toBe(null);
  });

  it('a mirror opens on its own island only, in the order of the keys, never twice', () => {
    const run = (keys, signs) => {
      const opened = [];
      const game = {
        T: STORY.text,
        state: { keys, stage: 0 },
        markSigns: { [A.id]: signs },
        openForge: (k) => opened.push(k),
        say: () => {},
      };
      STORY.islands.forEach((_, k) => STORY.onArrive(game, k));
      return opened;
    };
    expect(run([], [2])).toEqual([]);
    expect(run([], [2, 6])[0]).toBe(K.marahil);
    expect(run([K.marahil], [2, 6])[0]).toBe(K.ghayr);
    expect(run([K.marahil, K.ghayr], [2, 6])[0]).toBe(K.pgcd);
    expect(run([K.marahil, K.ghayr, K.pgcd], [2, 6])[0]).toBe(K.natija);
    expect(run(KEYS, [2, 6])).toEqual([]);
  });

  it('the tablets say the story’s own numbers', () => {
    expect(KEYS.map((k) => TABLETS[k].icon)).toEqual(['🪜', '🔒', '🎯', '🧾']);
    expect(TABLETS[K.marahil].lines[1]).toContain('\\frac{66}{78} = \\frac{33}{39} = \\frac{11}{13}');
    expect(TABLETS[K.ghayr].notes[0]).toBe('اللوح 3 ملأ 48 خانة، لكنّ العمود وقع في وسط لوح: ⁦35 = 3 × 11 + 2⁩');
    expect(TABLETS[K.pgcd].notes[0]).toBe('اللوح 27 بنى الجسر بـ 9 قطع: ⁦243 = 27 × 9⁩');
    expect(TABLETS[K.natija].lines[1]).toContain('\\frac{5}{39} + \\frac{8}{39} = \\frac{13}{39} = \\frac{1}{3}');
    for (const k of KEYS) expect([...TABLETS[k].title].length, k).toBeLessThanOrEqual(32);
  });
});
