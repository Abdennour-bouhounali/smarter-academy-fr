// The pack of the lesson: what the kit's screens read must exist for every key, level and exercise of THIS lesson.
import { describe, it, expect } from 'vitest';
import { lesson } from './index';
import { KNOWLEDGE_GRAPH } from '../knowledgeGraph';

describe('the pack of qasim-adad-tabii', () => {
  const cardIds = KNOWLEDGE_GRAPH.nodes.map((n) => n.id);

  it('has a rule tablet and a knowledge card for each key', () => {
    for (const key of lesson.keys) {
      expect(lesson.rules[key], key).toMatchObject({ icon: expect.any(String), title: expect.any(String) });
      expect(cardIds, key).toContain(lesson.cards.ofKey[key]);
    }
    expect(cardIds).toContain(lesson.cards.fallback);
  });

  it('names every level of the ladder; what an exam sitting misses (its rule keys) sends to a card', () => {
    lesson.ladder.nodes.forEach((node) => {
      expect(lesson.text.levels[node.id], node.id).toHaveLength(node.levels.length);
    });
    // the sittings serve the bank as it is (kit/bankSitting.js): a missed step is named by the key of its الكفاءة
    for (const key of lesson.keys) expect(cardIds, key).toContain(lesson.cards.ofKey[key]);
  });

  it('places every card of the knowledge map', () => {
    for (const id of cardIds) expect(lesson.knowledge.positions[id], id).toHaveLength(2);
    expect(Object.keys(lesson.knowledge.positions).sort()).toEqual([...cardIds].sort());
  });

  it('names the worlds of its real cases', () => {
    const games = lesson.ladder.nodes.flatMap((node) => node.levels.filter((l) => l.game).map((l) => l.game));
    expect(games.length).toBeGreaterThan(0);
    for (const world of Object.values(lesson.text.worlds))
      expect(world).toMatchObject({ name: expect.any(String), unit: expect.any(String), done: expect.any(String) });
    expect(lesson.evidence.learningPointOf('qasim-adad-tabii', lesson.keys[0])).toBe('4am_qasim-adad-tabii_P1');
  });
});
