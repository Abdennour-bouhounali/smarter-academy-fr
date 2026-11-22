import { describe, it, expect } from 'vitest';
import { hasKnowledgeCards, loadKnowledgeCards, cardsOf, earlierLessons } from './knowledgeCards';
import { BOARD_LESSONS } from './boardLessons';
import { lessonPackFlags } from '../../lessons/registry';

describe('بطاقة المعارف — the knowledge card of a lesson on the board', () => {
  it('exists for every lesson that has its board, from the lesson’s own knowledge', async () => {
    // every lesson of keys that has its board; a unit's last lesson (world « mission-isle ») has no knowledge of its own
    for (const id of BOARD_LESSONS)
      expect(hasKnowledgeCards(id), id).toBe(lessonPackFlags(id).world !== 'mission-isle');
    expect(await loadKnowledgeCards('other')).toEqual([]);
    expect(hasKnowledgeCards('other')).toBe(false);
    const cards = await loadKnowledgeCards('qasim-adad-tabii');
    expect(cards.length).toBeGreaterThanOrEqual(4);
    expect(cards[0]).toMatchObject({ id: 'qasim-baqi', module: 1, hook: 'الباقي معدوم يعني قاسم' });
    for (const c of cards) {
      expect(c.title, c.id).toBeTruthy();
      expect(c.rule.startsWith('$') && c.rule.endsWith('$'), c.id).toBe(true);
      expect(c.hook, c.id).toBeTruthy();
    }
    expect(cards.map((c) => c.module)).toEqual([...cards.map((c) => c.module)].sort((a, b) => a - b)); // the order of the lesson
    expect(new Set(cards.map((c) => c.id)).size).toBe(cards.length);
    expect(cardsOf(null)).toEqual([]);
  });

  it('gives the teacher the earlier lessons the new الكفاءة is connected with, core first, each with its link', () => {
    const links = earlierLessons('qasim-adad-tabii');
    expect(links.map((l) => [l.code, l.core, l.via])).toEqual([
      ['qisma-iqlidiya-baqi', true, 'يحتاج إلى'],
      ['qawaid-qabiliyat-qisma', false, 'يوسّع'],
    ]);
    expect(links[0]).toMatchObject({ title: 'القسمة الإقليدية', grade: 'السنة الأولى متوسط' });
    for (const l of links) expect(l.path === null || l.path.includes(l.code), l.code).toBe(true);
    expect(earlierLessons('no-such-lesson')).toEqual([]);
  });
});
