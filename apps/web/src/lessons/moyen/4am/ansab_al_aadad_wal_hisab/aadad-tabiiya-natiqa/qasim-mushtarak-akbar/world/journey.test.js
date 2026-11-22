import { describe, it, expect } from 'vitest';
import { KEYS, journey } from './journey';
import { KNOWLEDGE } from './knowledge';
import { MODULE_KEYS, NUMBERS, STORY, TABLETS } from './story';
import { FORGES } from './forges';
import { lesson } from './index';
import { LESSON_CONFIG } from '../lesson.config';

describe('the road of « القاسم المشترك الأكبر »', () => {
  it('its four keys, in order, each with its tablet, its forge, its memo sheet and its card', () => {
    expect(KEYS).toEqual(['qawasim-mushtaraka', 'al-akbar', 'baqat-mutamathila', 'qawasim-al-pgcd']);
    const items = Object.values(KNOWLEDGE.modules)
      .flat()
      .map((it) => it.id);
    expect(items).toEqual(KEYS);
    expect(Object.keys(TABLETS)).toEqual(KEYS);
    expect(Object.keys(FORGES)).toEqual(KEYS);
    expect(KEYS.map((k) => TABLETS[k].icon)).toEqual(['🤝', '👑', '💐', '🧩']);
    for (const key of KEYS) {
      expect(FORGES[key].key).toBe(key);
      const card = KNOWLEDGE.graph.nodes.find((n) => n.id === lesson.cards.ofKey[key]);
      expect(card?.notebook && card.requires, key).toBe(key);
      expect(TABLETS[key].title && TABLETS[key].lines.length && TABLETS[key].math.length, key).toBeTruthy();
    }
  });

  it('the knowledge map: twelve cards, every one placed, opened by a key, revealed along its links', () => {
    const nodes = KNOWLEDGE.graph.nodes;
    const ids = nodes.map((n) => n.id);
    expect(ids).toHaveLength(12);
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
    for (const id of [...Object.values(lesson.cards.ofKey), lesson.cards.fallback]) expect(ids).toContain(id);
    // every card is reached from the root
    const reached = new Set([KNOWLEDGE.graph.root]);
    for (let i = 0; i < ids.length; i += 1)
      for (const e of KNOWLEDGE.graph.edges) if (reached.has(e.from)) reached.add(e.to);
    expect(reached.size).toBe(ids.length);
    // two quantities shared « كاملتين » — never « الكمّيتان كلّها » (a dual is not « كلّها »)
    expect(JSON.stringify(KNOWLEDGE)).not.toMatch(/الكمّيتان كلّها/);
  });

  it('every memo sheet is complete, its two questions have one answer in range, and the right answer is the arithmetic', () => {
    const [mushtaraka, akbar, baqat, nest] = Object.values(KNOWLEDGE.modules).flat();
    for (const it of [mushtaraka, akbar, baqat, nest]) {
      for (const f of ['rule', 'hook', 'example', 'trap', 'exam', 'chip'])
        expect(it.memo[f], `${it.id} ${f}`).toBeTruthy();
      expect(it.memo.quiz).toHaveLength(2);
      for (const q of it.memo.quiz) expect(q.options[q.correct], q.q).toBeTruthy();
      expect(JSON.stringify(it)).not.toMatch(/undefined|NaN/);
      // no Arabic letter inside a formula of the sheet (KaTeX)
      for (const f of ['rule', 'example', 'chip']) expect(it.memo[f], `${it.id} ${f}`).not.toMatch(/[؀-ۿ]/);
    }
    const num = (s) => Number(s.replace(/\$/g, ''));
    // 9 is the one common divisor of 198 and 234 among 11, 13, 9
    expect(mushtaraka.memo.quiz[0].options.map(num).filter((n) => 198 % n === 0 && 234 % n === 0)).toEqual([9]);
    expect(num(akbar.memo.quiz[0].options[akbar.memo.quiz[0].correct])).toBe(14);
    expect(num(akbar.memo.quiz[1].options[akbar.memo.quiz[1].correct])).toBe(18);
    expect(num(baqat.memo.quiz[0].options[baqat.memo.quiz[0].correct])).toBe(8);
    expect(nest.memo.quiz[0].options.map(num).filter((n) => 12 % n === 0)).toEqual([6]);
    expect(num(nest.memo.quiz[1].options[nest.memo.quiz[1].correct])).toBe(6);
  });

  it('the story is playable: one island more than segments, a forge waits on each island that opens one', () => {
    expect(STORY.islands).toHaveLength(STORY.segments.length + 1);
    expect(STORY.islands.filter((i) => i.feature === 'stone')).toHaveLength(1);
    expect(STORY.segments.filter((s) => s.kind === 'rail')).toHaveLength(1);
    expect(STORY.segments.filter((s) => s.boss)).toHaveLength(1);
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
    expect(opened).toEqual(KEYS.slice(0, 3));
    expect(STORY.onStone(game)).toEqual({ quiz: 'baskets' });
    STORY.onQuiz(game, 'baskets');
    expect(opened.at(-1)).toBe('qawasim-al-pgcd');
    expect(STORY.onStone(game)).toEqual({ forge: 'qawasim-al-pgcd' });
    // closing a tablet: the key joins his keys, then the story goes on — each module is done once, when he holds its keys
    const marked = [];
    for (const key of KEYS) {
      STORY.afterKey[key](game);
      marked.push([...modules]);
      game.state.keys = [...game.state.keys, key];
    }
    expect(flags.key4).toBe(true);
    expect(marked.map((m) => m.join())).toEqual(['', '3', '3,1,4', '3,1,4,2,5']);
    for (const m of modules) expect(lesson.keysFromModules([m]).every((k) => game.state.keys.includes(k))).toBe(true);
    STORY.onBossPaid(game);
    expect(modules.at(-1)).toBe('6');
    for (const [stage, key] of [
      [2, KEYS[0]],
      [4, KEYS[1]],
      [6, KEYS[2]],
    ])
      expect(STORY.pendingForge({ state: { stage, keys: [] } })).toBe(key);
    expect(STORY.pendingForge({ state: { stage: 2, keys: [KEYS[0]] } })).toBe(null);
    expect(journey.examOpen(KEYS, {})).toBe(false);
    // the sentences of the story say something and print no raw formula where the screen is plain
    for (const line of Object.values(STORY.text.say).map((x) => (typeof x === 'function' ? x(24, 14) : x)))
      expect(line).not.toMatch(/undefined|NaN/);
  });

  it('the store of the last bridge says the numbers of THIS lesson, in its own words', () => {
    const seg = STORY.segments.find((x) => x.boss);
    const T = STORY.text.boss;
    const said = [
      T.mission,
      T.choose,
      T.price,
      T.divide(26),
      T.costAsk(26, 25),
      T.err.long(28, 24),
      T.err.sum(28, 20, 10),
    ];
    // each line says the walkway (650), its two stretches (364, 286) or the price (140)
    const own = [seg.a, seg.boss.price, NUMBERS.boss.roses, NUMBERS.boss.lilies].join('|');
    for (const line of said) expect(line, line).toMatch(new RegExp(`\\b(${own})\\b`));
    const words = JSON.stringify(STORY.text);
    // nothing of the earlier lessons' stores: their gaps, their prices, their shelves
    expect(words).not.toMatch(/\b(756|1850|96|1400|1015|4350)\b|رفّ|العنيدة|بلّورة/);
  });

  it('the keys his own progress proves are his from the first screen — the keys of the modules he completed', () => {
    expect(lesson.keysFromModules([])).toEqual([]);
    expect(lesson.keysFromModules(['0', '3'])).toEqual(KEYS.slice(0, 2));
    expect(lesson.keysFromModules(['1'])).toEqual([KEYS[0], KEYS[2]]);
    expect(lesson.keysFromModules(['5'])).toEqual(KEYS);
    // MODULE_KEYS is the config's own map: the keys of the learning points each module teaches
    const keyOf = Object.fromEntries(KEYS.map((k) => [lesson.evidence.learningPointOf('qasim-mushtarak-akbar', k), k]));
    const fromConfig = Object.fromEntries(
      LESSON_CONFIG.modules
        .filter((m) => m.teachesLearningPointIds?.length)
        .map((m) => [m.number, KEYS.filter((k) => m.teachesLearningPointIds.some((p) => keyOf[p] === k))]),
    );
    expect(MODULE_KEYS).toEqual(fromConfig);
  });
});
