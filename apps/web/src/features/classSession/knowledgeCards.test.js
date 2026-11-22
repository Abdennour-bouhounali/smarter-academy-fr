import { describe, it, expect, vi } from 'vitest';
import { hasKnowledgeCards, loadKnowledgeCards, cardsOf, earlierLessons } from './knowledgeCards';
import { BOARD_LESSONS } from './boardLessons';
import { lessonPackFlags } from '../../lessons/registry';

// The generated index and the delivered net are EMPTY until the first French lesson: neutral fixtures stand in for them.
vi.mock('../../lessons/lessonIndex.generated.json', async () => ({
  default: (await import('./test/lessonIndexFixture.js')).LESSON_INDEX,
}));
vi.mock('@smarter-academy/core/curriculum/fr/net/learningNet.js', async (importOriginal) =>
  (await import('../compass/test/compassFixture.js')).mockLearningNet(importOriginal),
);

describe('fiche de connaissances — the knowledge card of a lesson on the board', () => {
  it('exists for every lesson of keys that has its board; a unit’s last lesson has no knowledge of its own', async () => {
    for (const id of BOARD_LESSONS)
      expect(hasKnowledgeCards(id), id).toBe(lessonPackFlags(id).world !== 'mission-isle');
    expect(await loadKnowledgeCards('other')).toEqual([]);
    expect(hasKnowledgeCards('other')).toBe(false);
  });

  it('one card per knowledge item that has a memo sheet, in the order of the lesson', () => {
    const knowledge = {
      modules: {
        2: [{ id: 'k3', title: 'Clé 3', memo: { rule: 'a = b \\times q', hook: 'Phrase 3' } }],
        1: [
          {
            id: 'k1',
            title: 'Clé 1',
            memo: { rule: 'r = 0', hook: 'Phrase 1', example: '12 = 3 \\times 4', trap: 'Piège', exam: 'Au brevet' },
          },
          { id: 'k2', title: 'Clé 2' },
        ],
      },
    };
    const cards = cardsOf(knowledge);
    expect(cards.map((c) => [c.id, c.module])).toEqual([
      ['k1', 1],
      ['k3', 2],
    ]);
    expect(cards[0]).toEqual({
      id: 'k1',
      module: 1,
      title: 'Clé 1',
      rule: '$r = 0$',
      hook: 'Phrase 1',
      example: '$12 = 3 \\times 4$',
      trap: 'Piège',
      exam: 'Au brevet',
    });
    expect(cards[1]).toMatchObject({ example: null, trap: null, exam: null });
    expect(cardsOf(null)).toEqual([]);
  });

  it('gives the teacher the earlier lessons the new savoir-faire is connected with, core first, each with its link', () => {
    const links = earlierLessons('l2');
    expect(links.map((l) => [l.code, l.core, l.via]).sort()).toEqual([
      ['a6', true, 'S’appuie sur'],
      ['l1', true, 'S’appuie sur'],
    ]);
    expect(links.find((l) => l.code === 'a6')).toMatchObject({ title: 'Leçon a6', grade: 'Sixième', path: null });
    expect(earlierLessons('no-such-lesson')).toEqual([]);
  });
});
