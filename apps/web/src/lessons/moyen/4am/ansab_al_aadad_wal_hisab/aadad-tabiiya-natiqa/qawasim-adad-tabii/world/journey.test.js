import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { KEYS, KNOWLEDGE_CARDS, journey } from './journey';
import { KNOWLEDGE } from './knowledge';
import { STORY, TABLETS } from './story';
import { FORGES } from './forges';
import { lesson } from './index';
import { LESSON_PACK } from '../lesson.pack';

describe('the road of « قواسم عدد طبيعي »', () => {
  it('its four keys are the lesson’s own knowledge items, each with its tablet, its forge and its card', () => {
    const items = Object.values(KNOWLEDGE.modules)
      .flat()
      .map((it) => it.id);
    expect(KEYS).toEqual(items);
    // the exam coach reminds the sheet of each key (the mission player's tools, which said the same, are deleted)
    expect([...Object.values(LESSON_PACK.coach)].sort()).toEqual([...KEYS].sort());
    expect(Object.keys(TABLETS)).toEqual(KEYS);
    expect(Object.keys(FORGES)).toEqual(KEYS);
    for (const key of KEYS) {
      expect(KNOWLEDGE.graph.nodes.map((n) => n.id)).toContain(lesson.cards.ofKey[key]);
      expect(TABLETS[key].title && TABLETS[key].lines.length && TABLETS[key].math.length, key).toBeTruthy();
    }
  });

  it('the map of the knowledge page places every card of the lesson', () => {
    const nodes = KNOWLEDGE.graph.nodes.map((n) => n.id);
    expect(nodes).toHaveLength(KNOWLEDGE_CARDS);
    expect(Object.keys(KNOWLEDGE.positions).sort()).toEqual([...nodes].sort());
  });

  it('the story is playable: every gap has a plank that holds, the store has ONE right shelf, every dash wave one gate', () => {
    expect(STORY.islands).toHaveLength(STORY.segments.length + 1);
    for (const seg of STORY.segments.filter((x) => x.kind === 'bridge')) {
      expect(seg.a % seg.holdsWith, seg.id).toBe(0);
      if (seg.boss) expect(seg.boss.options.filter((b) => seg.a % b === 0)).toEqual([seg.holdsWith]);
      else if (!seg.workshop) expect(seg.moulds, seg.id).toContain(seg.holdsWith);
      else
        expect(
          seg.moulds.filter((b) => seg.a % b === 0),
          'only the workshop fills this gap',
        ).toEqual([]);
    }
    for (const w of STORY.dashWaves) expect(w.gates.filter(w.test), w.say).toHaveLength(1);
    const quiz = STORY.text.quiz.rules;
    expect(quiz.options.map((o) => o.v).filter((v) => quiz.a % v === 0)).toEqual(quiz.answer);
    expect(journey.examOpen(KEYS, {})).toBe(false);
  });

  it('the store of the last bridge says the numbers of THIS lesson, everywhere, and the world writes none itself', () => {
    const seg = STORY.segments.find((x) => x.boss);
    const T = STORY.text.boss;
    const said = [
      T.mission,
      T.choose,
      T.price,
      T.divide(12),
      T.costAsk(12, 8),
      T.err.long(20, 5),
      T.err.sum(20, 4, 10),
    ];
    for (const line of said) expect(line, line).toMatch(new RegExp(`\\b(${seg.a}|${seg.boss.price})\\b`));
    expect(said.join(' ')).not.toMatch(/756|1850|لوح|ألواح|قالب|undefined|NaN/);
    expect(T.costAsk(12, 8)).toContain('8 رفوف');
    expect(T.err.long(20, 23)).toContain('23 رفًّا');
    // the world's screen reads the gap, the moulds and the price from the story: the pilot's numbers were written in it
    const screen = readFileSync(
      new URL('../../../../../../common/gameworld/divisorIsles/DivisorIsles.jsx', import.meta.url),
      'utf8',
    );
    expect(screen).not.toMatch(/\b(756|1850)\b|\[32, 36\]/);
  });

  it('the keys his own progress proves are his from the first screen', () => {
    expect(lesson.keysFromModules([])).toEqual([]);
    expect(lesson.keysFromModules(['0', '1'])).toEqual(KEYS.slice(0, 2));
    expect(lesson.keysFromModules(['1', '2'])).toEqual(KEYS);
  });
});
