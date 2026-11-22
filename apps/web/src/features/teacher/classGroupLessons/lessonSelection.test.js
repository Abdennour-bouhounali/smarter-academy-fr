import { describe, it, expect } from 'vitest';
import { flattenCurriculum, idsNeeding, applyBulkOutcome, countByStatus } from './lessonSelection';

const curriculum = {
  chapters: [
    { code: 'c1', title: 'أنشطة عددية', lessons: [
      { id: 1, code: 'a', title: 'أ', classStatus: 'visible', publicationStatus: 'published', effectiveForStudents: true },
      { id: 2, code: 'b', title: 'ب', classStatus: 'hidden', publicationStatus: 'published', effectiveForStudents: false },
    ] },
    { code: 'c2', title: 'هندسة', lessons: [
      { id: 3, code: 'c', title: 'ج', classStatus: 'visible', publicationStatus: 'draft', effectiveForStudents: false },
    ] },
  ],
};

describe('lessonSelection', () => {
  it('aplatit en gardant le chapitre', () => {
    const rows = flattenCurriculum(curriculum);
    expect(rows.map((r) => r.id)).toEqual([1, 2, 3]);
    expect(rows[2].chapterTitle).toBe('هندسة');
  });
  it('ne cible que les leçons dont l’état diffère', () => {
    const rows = flattenCurriculum(curriculum);
    expect(idsNeeding(rows, [1, 2, 3], 'hidden')).toEqual([1, 3]);
    expect(idsNeeding(rows, [2], 'hidden')).toEqual([]);
  });
  it('n’applique que ce que le serveur dit avoir appliqué, et recalcule l’effectif', () => {
    const rows = applyBulkOutcome(flattenCurriculum(curriculum), { applied: [1, 3], unchanged: [], failed: [] }, 'hidden');
    expect(rows.find((r) => r.id === 1)).toMatchObject({ classStatus: 'hidden', effectiveForStudents: false });
    expect(rows.find((r) => r.id === 2).classStatus).toBe('hidden');
    const back = applyBulkOutcome(rows, { applied: [3] }, 'visible');
    // Brouillon : visible pour la classe mais toujours pas effectif.
    expect(back.find((r) => r.id === 3)).toMatchObject({ classStatus: 'visible', effectiveForStudents: false });
  });
  it('compte visibles, masquées et effectives', () => {
    expect(countByStatus(flattenCurriculum(curriculum))).toEqual({ visible: 2, hidden: 1, effective: 1 });
  });
});
