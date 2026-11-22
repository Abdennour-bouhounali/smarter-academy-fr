import { describe, it, expect } from 'vitest';
import { KEYS, journey } from './journey';
import { KNOWLEDGE, ESTIMATE, EXACT } from './knowledge';
import { NUMBERS, STORY, TABLETS, divide } from './story';
import { FORGES } from './forges';
import { lesson } from './index';
import { LESSON_PACK } from '../lesson.pack';
import { LESSON_CONFIG } from '../lesson.config';

/** The numbers of a quiz option: « $7$ », « $20$ و $30$ », « $16 \times 30 = 480$ ». */
const numbersOf = (s) => (s.match(/\d+/g) ?? []).map(Number);
const quiz = (id) =>
  Object.values(KNOWLEDGE.modules)
    .flat()
    .find((x) => x.id === id).memo.quiz;

describe('the road of « القسمة الإقليدية »', () => {
  it('its five keys, in order, each with its tablet, its forge, its memo sheet and its card', () => {
    expect(KEYS).toEqual(['majmuaat-kamila', 'baqi-asghar', 'musawat-qisma', 'taqdir-hasil', 'baqi-fi-masala']);
    const items = Object.values(KNOWLEDGE.modules)
      .flat()
      .map((it) => it.id);
    expect(items).toEqual(KEYS);
    expect(Object.keys(TABLETS)).toEqual(KEYS);
    expect(Object.keys(FORGES)).toEqual(KEYS);
    expect(Object.keys(lesson.cards.ofKey)).toEqual(KEYS);
    for (const key of KEYS) {
      expect(FORGES[key].key).toBe(key);
      const card = KNOWLEDGE.graph.nodes.find((n) => n.id === lesson.cards.ofKey[key]);
      expect(card?.notebook && card.requires, key).toBe(key);
      expect(TABLETS[key].title && TABLETS[key].lines.length && TABLETS[key].math.length, key).toBeTruthy();
    }
  });

  it('the exam coach sends each الكفاءة to a sheet of this lesson — the problems to « الباقي في مسألة », not to the estimate', () => {
    expect(LESSON_PACK.coach).toEqual({ P1: 'majmuaat-kamila', P2: 'musawat-qisma', P3: 'baqi-fi-masala' });
    const sheets = Object.values(KNOWLEDGE.modules).flat();
    for (const [point, id] of Object.entries(LESSON_PACK.coach)) {
      expect(
        sheets.some((s) => s.id === id),
        point,
      ).toBe(true);
      // the key behind the sheet proves that very الكفاءة
      expect(lesson.evidence.learningPointOf('qisma-iqlidiya-baqi', id)).toBe(`1am_qisma-iqlidiya-baqi_${point}`);
    }
    const p3 = sheets.find((s) => s.id === LESSON_PACK.coach.P3);
    expect(p3.title).toBe('الباقي في مسألة');
    expect(p3.summary).toContain('ثلاثة أسئلة');
  });

  it('the knowledge map: about fourteen cards, every one placed, opened by a key, revealed along its links', () => {
    const nodes = KNOWLEDGE.graph.nodes;
    const ids = nodes.map((n) => n.id);
    expect(ids.length).toBeGreaterThanOrEqual(12);
    expect(new Set(ids).size).toBe(ids.length);
    expect(Object.keys(KNOWLEDGE.positions).sort()).toEqual([...ids].sort());
    expect(ids).toContain(KNOWLEDGE.graph.root);
    for (const n of nodes) {
      expect(KEYS, n.id).toContain(n.requires);
      const out = KNOWLEDGE.graph.edges.filter((e) => e.from === n.id).map((e) => e.to);
      expect([...n.reveals].sort(), n.id).toEqual(out.sort());
      expect(`${n.title} ${n.subtitle} ${JSON.stringify(n.context ?? {})}`).not.toMatch(/undefined|NaN/);
    }
    for (const e of KNOWLEDGE.graph.edges)
      expect(ids, `${e.from} → ${e.to}`).toEqual(expect.arrayContaining([e.from, e.to]));
    // a card is never revealed before the key it needs: along a link the key stays the same or comes later
    const at = (id) => KEYS.indexOf(nodes.find((n) => n.id === id).requires);
    for (const e of KNOWLEDGE.graph.edges) expect(at(e.to), `${e.from} → ${e.to}`).toBeGreaterThanOrEqual(at(e.from));
    // every card is reached from the root
    const reached = new Set([KNOWLEDGE.graph.root]);
    for (let i = 0; i < ids.length; i += 1)
      for (const e of KNOWLEDGE.graph.edges) if (reached.has(e.from)) reached.add(e.to);
    expect([...reached].sort()).toEqual([...ids].sort());
    // no two cards sit on each other (percent of the map box)
    for (const a of ids)
      for (const b of ids) {
        if (a >= b) continue;
        const [ax, ay] = KNOWLEDGE.positions[a];
        const [bx, by] = KNOWLEDGE.positions[b];
        expect(Math.abs(ax - bx) >= 20 || Math.abs(ay - by) >= 13, `${a} / ${b}`).toBe(true);
      }
    for (const id of [...Object.values(lesson.cards.ofKey), lesson.cards.fallback]) expect(ids).toContain(id);
    // the sittings serve the bank: a miss leaves KEYS (read by `ofKey`) or sheets — no kind of exercise names a card
    expect(lesson.cards.ofExercise).toEqual({});
    for (const key of KEYS)
      expect(lesson.cards.ofExercise[key] ?? lesson.cards.ofKey[key]).toBe(lesson.cards.ofKey[key]);
    expect(lesson.cards.ofExercise['ex:l3-004'] ?? lesson.cards.ofKey['ex:l3-004'] ?? lesson.cards.fallback).toBe(
      'kamila',
    );
  });

  it('every memo sheet is complete and its two questions have one answer in range', () => {
    for (const it of Object.values(KNOWLEDGE.modules).flat()) {
      for (const f of ['rule', 'hook', 'example', 'trap', 'exam', 'chip'])
        expect(it.memo[f], `${it.id} ${f}`).toBeTruthy();
      expect(it.memo.quiz).toHaveLength(2);
      for (const q of it.memo.quiz) {
        expect(q.options[q.correct], q.q).toBeTruthy();
        expect(new Set(q.options).size, q.q).toBe(q.options.length);
      }
      expect(JSON.stringify(it)).not.toMatch(/undefined|NaN/);
      // plain fields carry no formula; the formula fields are LaTeX without dollars
      for (const f of ['hook', 'trap', 'exam']) expect(it.memo[f], `${it.id} ${f}`).not.toMatch(/\$|\\/);
      for (const f of ['rule', 'example', 'chip']) expect(it.memo[f], `${it.id} ${f}`).not.toContain('$');
    }
    // the estimate's chip is a bracketing of the quotient by tens: 10t ≤ q < 10(t + 1)
    const chip = Object.values(KNOWLEDGE.modules)
      .flat()
      .find((x) => x.id === 'taqdir-hasil')
      .memo.chip.replace(/\\textcolor\{#[0-9a-f]+\}\{([^}]*)\}/g, '$1');
    expect(chip).toBe('10t\\leq q<10(t+1)');
  });

  it('the memo quizzes are computed: the right option is the arithmetic, the others are not', () => {
    const { count: C, groups: GR, rests: RS, scope: SC, cable: CB } = NUMBERS;
    // 30 ÷ 4 → 7 full planks; in 45 cells the sixth plank of 8 needs 48
    const [k1, k2] = quiz('majmuaat-kamila');
    expect(numbersOf(k1.options[k1.correct])).toEqual([divide(C.a, C.probe).q]);
    expect(numbersOf(k2.options[k2.correct])).toEqual([GR.probe * (divide(GR.a, GR.probe).q + 1)]);
    expect(GR.probe * (divide(GR.a, GR.probe).q + 1)).toBeGreaterThan(GR.a);
    // the first sheet does not answer with key 2's words
    expect(JSON.stringify(quiz('majmuaat-kamila'))).not.toMatch(/الباقي|أصغر من/);
    // the biggest remainder of a division by 8 is 7; 45 = 6 × 6 + 9 is true arithmetic, and 9 is not smaller than 6
    const [a1, a2] = quiz('baqi-asghar');
    expect(numbersOf(a1.q)).toEqual([GR.probe]);
    expect(numbersOf(a1.options[a1.correct])).toEqual([GR.probe - 1]);
    expect(a1.options.filter((o) => numbersOf(o)[0] < GR.probe)).toEqual([a1.options[a1.correct]]);
    const [x, b, qq, r] = numbersOf(a2.q);
    expect([b * qq + r, r >= b]).toEqual([x, true]);
    // 6 × 8 + 4 = 52
    const [m1, m2] = quiz('musawat-qisma');
    const d = divide(RS.a, RS.probe);
    expect(numbersOf(m1.options[m1.correct])).toEqual([RS.a]);
    expect(m1.options.filter((o) => numbersOf(o)[0] === RS.probe * d.q + d.r)).toHaveLength(1);
    expect(m2.options[m2.correct]).toBe('الحاصل');
    // 692 ÷ 27 lies between 20 and 30; 512 ÷ 16 starts with 16 × 30 = 480 ≤ 512 < 640
    const [t1, t2] = quiz('taqdir-hasil');
    const q = divide(SC.a, SC.plank).q;
    const between = t1.options.filter((o) => {
      const [lo, hi] = numbersOf(o);
      return q >= lo && q < hi;
    });
    expect(between).toEqual([t1.options[t1.correct]]);
    const [b16, t30, p480] = numbersOf(t2.options[t2.correct]);
    expect([b16 * t30, p480]).toEqual([480, 480]);
    expect(b16 * t30 <= ESTIMATE.a && ESTIMATE.a < b16 * (t30 + 10)).toBe(true);
    expect(divide(ESTIMATE.a, ESTIMATE.b)).toEqual({ q: 32, r: 0 });
    // the station: 78 = 8 × 9 + 6 → 10 cabins (one more); 72 = 8 × 9 + 0 → 9 cabins (the quotient itself)
    const [p1, p2] = quiz('baqi-fi-masala');
    expect(numbersOf(p1.options[p1.correct])).toEqual([Math.ceil(CB.a / CB.b)]);
    expect(Math.ceil(CB.a / CB.b)).toBe(divide(CB.a, CB.b).q + 1);
    expect(p1.options.map((o) => numbersOf(o)[0]).sort((u, v) => u - v)).toEqual([6, 9, 10]);
    expect(numbersOf(p2.options[p2.correct])).toEqual([EXACT.a / EXACT.b]);
    expect(divide(EXACT.a, EXACT.b)).toEqual({ q: 9, r: 0 });
    expect(Math.ceil(EXACT.a / EXACT.b)).toBe(9);
    // each question writes the true division it speaks of
    for (const [p, n] of [
      [p1, CB],
      [p2, EXACT],
    ]) {
      const [a, , a2x, b2, q2, r2] = numbersOf(p.q);
      expect([a, a2x, b2 * q2 + r2]).toEqual([n.a, n.a, n.a]);
      expect(r2).toBeLessThan(b2);
    }
  });

  it('the story is playable: one island more than segments, a forge waits on each island that opens one', () => {
    expect(STORY.islands).toHaveLength(STORY.segments.length + 1);
    expect(STORY.islands.filter((i) => i.feature === 'stone')).toHaveLength(1);
    expect(STORY.segments.filter((s) => s.kind === 'rail')).toHaveLength(1);
    expect(STORY.segments.filter((s) => s.boss)).toHaveLength(1);
    // the forges open in the order of the keys: arriving on islands 2, 3, 4 and 6, the last one from the stone of 7
    const opened = [];
    const modules = [];
    const flags = {};
    const game = {
      T: STORY.text,
      flags,
      state: { keys: [], stage: 0, phase: 'play' },
      say: () => {},
      openForge: (k) => opened.push(k),
      onModule: (m) => modules.push(m),
      wait: () => ({ then: () => {} }),
      save: () => {},
      refreshObjective: () => {},
    };
    STORY.islands.forEach((_, k) => STORY.onArrive(game, k));
    expect(opened).toEqual(KEYS.slice(0, 4));
    expect(STORY.islands.findIndex((i) => i.feature === 'stone')).toBe(7);
    expect(STORY.onStone(game)).toEqual({ forge: 'baqi-fi-masala' });
    // the store of the last bridge opens only once the LAST key is his (the world's flag `key4`)
    for (const key of KEYS.slice(0, 4)) STORY.afterKey[key](game);
    expect(flags.key4).toBeUndefined();
    STORY.afterKey[KEYS[4]](game);
    expect(flags.key4).toBe(true);
    STORY.onBossPaid(game);
    expect(modules).toEqual(['1', '2', '3', '4', '5']);
    for (const [stage, key] of [
      [2, KEYS[0]],
      [3, KEYS[1]],
      [4, KEYS[2]],
      [6, KEYS[3]],
    ])
      expect(STORY.pendingForge({ state: { stage, keys: [] } })).toBe(key);
    expect(STORY.pendingForge({ state: { stage: 2, keys: [KEYS[0]] } })).toBe(null);
    expect(STORY.pendingForge({ state: { stage: 5, keys: [] } })).toBe(null);
    expect(STORY.pendingForge({ state: { stage: 7, keys: [] } })).toBe(null); // the last one waits at its stone
    expect(journey.examOpen(KEYS, {})).toBe(false);
  });

  it('the modules the story marks exist in the lesson’s config, and each teaches the الكفاءة of the key that marks it', () => {
    const marks = { 'majmuaat-kamila': 1, 'musawat-qisma': 2, 'taqdir-hasil': 3, 'baqi-fi-masala': 4 };
    const moduleOf = (n) => LESSON_CONFIG.modules.find((m) => m.number === n);
    for (const [key, n] of Object.entries(marks)) {
      const marked = [];
      const game = { T: STORY.text, flags: {}, say: () => {}, onModule: (m) => marked.push(m), save: () => {} };
      game.refreshObjective = () => {};
      STORY.afterKey[key](game);
      expect(marked, key).toEqual([String(n)]);
      expect(moduleOf(n), key).toBeTruthy();
      expect(moduleOf(n).teachesLearningPointIds, key).toContain(
        lesson.evidence.learningPointOf(LESSON_CONFIG.id, key),
      );
    }
    // the last bridge is the lesson's problem: a module that teaches the three الكفاءات
    expect(moduleOf(5).teachesLearningPointIds).toHaveLength(3);
  });

  it('the keys his own progress proves are his from the first screen', () => {
    expect(lesson.keysFromModules([])).toEqual([]);
    expect(lesson.keysFromModules(['0', '1'])).toEqual(KEYS.slice(0, 1));
    expect(lesson.keysFromModules(['1', '2'])).toEqual(KEYS.slice(0, 3));
    expect(lesson.keysFromModules(['1', '2', '3'])).toEqual(KEYS.slice(0, 4));
    expect(lesson.keysFromModules(['1', '2', '3', '4'])).toEqual(KEYS);
    expect(lesson.keysFromModules(['5'])).toEqual(KEYS);
  });
});
