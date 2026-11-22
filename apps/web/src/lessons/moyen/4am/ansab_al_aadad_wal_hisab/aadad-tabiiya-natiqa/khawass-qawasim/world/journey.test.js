import { describe, it, expect } from 'vitest';
import { KEYS, journey } from './journey';
import { KNOWLEDGE } from './knowledge';
import { STORY, TABLETS } from './story';
import { FORGES } from './forges';
import { lesson } from './index';
import { LESSON_PACK } from '../lesson.pack';

describe('the road of « خواص قواسم عدد طبيعي »', () => {
  it('its four keys, in order, each with its tablet, its forge, its memo sheet and its card', () => {
    expect(KEYS).toEqual(['jam-wal-farq', 'madaaf', 'baqi-qisma', 'burhan']);
    const items = Object.values(KNOWLEDGE.modules)
      .flat()
      .map((it) => it.id);
    expect(items).toEqual(KEYS);
    expect(Object.keys(TABLETS)).toEqual(KEYS);
    expect(Object.keys(FORGES)).toEqual(KEYS);
    for (const key of KEYS) {
      expect(FORGES[key].key).toBe(key);
      const card = KNOWLEDGE.graph.nodes.find((n) => n.id === lesson.cards.ofKey[key]);
      expect(card?.notebook && card.requires, key).toBe(key);
      expect(TABLETS[key].title && TABLETS[key].lines.length && TABLETS[key].math.length, key).toBeTruthy();
    }
  });

  it('the knowledge map: every card is placed, opened by a key, revealed along its links', () => {
    const nodes = KNOWLEDGE.graph.nodes;
    const ids = nodes.map((n) => n.id);
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
  });

  it('what a sitting of the BANK leaves — keys, then « ex:<id> » — finds its card: no kind of a generated sitting', () => {
    const { ofKey, ofExercise, fallback } = lesson.cards;
    // the practice hub reads `ofExercise[weak] ?? ofKey[weak] ?? fallback` (kit/Spaces.jsx): the object must exist
    expect(ofExercise).toEqual({});
    expect(Object.keys(ofKey)).toEqual(KEYS);
    const cardOf = (weak) => ofExercise[weak] ?? ofKey[weak] ?? fallback;
    const notebook = (id) => KNOWLEDGE.graph.nodes.find((n) => n.id === id)?.notebook;
    for (const key of KEYS) expect(notebook(cardOf(key)), key).toBe(true);
    expect(cardOf('ex:4am-khawass-qawasim-l3-004')).toBe(fallback);
    expect(notebook(fallback)).toBe(true);
    // the coach of the exam names the same four sheets
    expect(Object.values(LESSON_PACK.coach)).toEqual(KEYS);
  });

  it('every memo sheet is complete and its two questions have one answer in range', () => {
    for (const it of Object.values(KNOWLEDGE.modules).flat()) {
      for (const f of ['rule', 'hook', 'example', 'trap', 'exam', 'chip'])
        expect(it.memo[f], `${it.id} ${f}`).toBeTruthy();
      expect(it.memo.quiz).toHaveLength(2);
      for (const q of it.memo.quiz) expect(q.options[q.correct], q.q).toBeTruthy();
      expect(JSON.stringify(it)).not.toMatch(/undefined|NaN/);
    }
  });

  it('the story is playable: one island more than segments, a forge waits on each island that opens one', () => {
    expect(STORY.islands).toHaveLength(STORY.segments.length + 1);
    expect(STORY.islands.filter((i) => i.feature === 'stone')).toHaveLength(1);
    expect(STORY.segments.filter((s) => s.kind === 'rail')).toHaveLength(1);
    expect(STORY.segments.filter((s) => s.boss)).toHaveLength(1);
    // the forges open in the order of the keys: arriving on islands 2, 4 and 6, the last one from the stone
    const opened = [];
    const flags = {};
    const game = {
      T: STORY.text,
      flags,
      state: { keys: [], stage: 0, phase: 'play' },
      say: () => {},
      openForge: (k) => opened.push(k),
      onModule: () => {},
      wait: () => ({ then: () => {} }),
      save: () => {},
      refreshObjective: () => {},
    };
    STORY.islands.forEach((_, k) => STORY.onArrive(game, k));
    expect(opened).toEqual(KEYS.slice(0, 3));
    expect(STORY.onStone(game)).toEqual({ quiz: 'harbour' });
    STORY.onQuiz(game, 'harbour');
    expect(opened.at(-1)).toBe('burhan');
    expect(STORY.onStone(game)).toEqual({ forge: 'burhan' });
    for (const key of KEYS) STORY.afterKey[key](game);
    expect(flags.key4).toBe(true);
    for (const [stage, key] of [
      [2, KEYS[0]],
      [4, KEYS[1]],
      [6, KEYS[2]],
    ])
      expect(STORY.pendingForge({ state: { stage, keys: [] } })).toBe(key);
    expect(STORY.pendingForge({ state: { stage: 2, keys: [KEYS[0]] } })).toBe(null);
    expect(journey.examOpen(KEYS, {})).toBe(false);
  });

  it('the store of the last bridge says the numbers of THIS lesson, in its own words', () => {
    const seg = STORY.segments.find((x) => x.boss);
    const T = STORY.text.boss;
    const said = [
      T.mission,
      T.choose,
      T.price,
      T.divide(35),
      T.costAsk(35, 29),
      T.err.long(30, 34),
      T.err.sum(30, 33, 20),
    ];
    for (const line of said) expect(line, line).toMatch(new RegExp(`\\b(${seg.a}|${seg.boss.price})\\b`));
    expect(said.join(' ')).not.toMatch(/756|1850|بلّورة|undefined|NaN/);
    const words = JSON.stringify(STORY.text);
    // nothing of the pilot or of lesson 2: their gaps, their moulds, their shelves
    expect(words).not.toMatch(/\b(756|1850|96|1400)\b|رفّ|العنيدة/);
  });

  it('the keys his own progress proves are his from the first screen', () => {
    expect(lesson.keysFromModules([])).toEqual([]);
    expect(lesson.keysFromModules(['0', '1'])).toEqual(KEYS.slice(0, 1));
    expect(lesson.keysFromModules(['1', '2'])).toEqual(KEYS.slice(0, 3));
    expect(lesson.keysFromModules(['1', '2', '3'])).toEqual(KEYS);
  });
});
