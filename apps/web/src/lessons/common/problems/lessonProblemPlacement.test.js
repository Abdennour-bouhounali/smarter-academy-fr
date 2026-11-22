import { describe, it, expect } from 'vitest';

/**
 * « مسألة الدرس » vit à UN endroit : le sommaire de la leçon (LessonIndex, qui pointe vers le module qui la résout),
 * puis elle est résolue pas à pas dans son module « مسألة » (GuidedProblem). Elle n'est JAMAIS répétée à l'intérieur
 * d'un autre module (owner, 2026-10-14 : la carte « مسألة الدرس » réimprimée en bas du نشاط de trois leçons 1AM).
 */
const MODULES = import.meta.glob('../../moyen/**/modules/Module*.jsx', { query: '?raw', import: 'default', eager: true });

describe('« مسألة الدرس » is never repeated inside a module', () => {
  it('scans the lesson modules', () => {
    expect(Object.keys(MODULES).length).toBeGreaterThan(300);
  });

  it('no module renders LessonProblemCard (the lesson summary does)', () => {
    const offenders = Object.entries(MODULES)
      .filter(([, src]) => /LessonProblemCard/.test(src))
      .map(([path]) => path.replace('../../moyen/', ''));
    expect(offenders).toEqual([]);
  });
});
