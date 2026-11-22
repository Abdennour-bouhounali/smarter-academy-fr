import { describe, it, expect } from 'vitest';
import { formatTextbookPages } from './textbookPages';
import { dzCourseLevels } from './coursesData';

/**
 * « الكتاب ص [object Object] ».
 *
 * `textbookRef.pages` est une carte section → page(s) ; la page d'unité
 * l'interpolait telle quelle dans une phrase arabe. Ces tests fixent le
 * rendu, et surtout vérifient qu'AUCUNE leçon du catalogue ne produit plus la
 * chaîne « [object Object] ».
 */
describe('formatTextbookPages', () => {
  it('rend la carte des sections comme la liste ordonnée des pages', () => {
    expect(formatTextbookPages({ activity: 8, knowledge: 10, exercises: 14 })).toBe('8، 10، 14');
  });

  it('aplatit une section qui couvre plusieurs pages', () => {
    expect(formatTextbookPages({ activity: 8, knowledge: [10, 12], exercises: 14 })).toBe('8، 10، 12، 14');
    expect(formatTextbookPages({ activity: 8, knowledge: 12, exercises: [14, 15] })).toBe('8، 12، 14، 15');
  });

  it('dédoublonne et ordonne — une page porte souvent deux sections', () => {
    expect(formatTextbookPages({ knowledge: 10, activity: 8, method: 8 })).toBe('8، 10');
  });

  it('ignore une section vidée (« method »: null — sa page est celle d’une autre leçon), jamais la page 0', () => {
    expect(formatTextbookPages({ activity: [24, 24], knowledge: [26, 26], method: null })).toBe('24، 26');
  });

  it('laisse passer les formes déjà lisibles', () => {
    expect(formatTextbookPages('7–16')).toBe('7–16');   // la page d'unité
    expect(formatTextbookPages(14)).toBe('14');
  });

  it('ne rend rien plutôt qu’un déchet quand il n’y a rien à dire', () => {
    expect(formatTextbookPages(null)).toBe('');
    expect(formatTextbookPages(undefined)).toBe('');
    expect(formatTextbookPages({})).toBe('');
    expect(formatTextbookPages([])).toBe('');
    expect(formatTextbookPages({ activity: 'x' })).toBe('');
    expect(formatTextbookPages(NaN)).toBe('');
  });

  it('n’émet jamais « [object Object] », pour aucune leçon du catalogue', () => {
    const seen = [];
    for (const level of dzCourseLevels) {
      for (const grade of level.grades ?? []) {
        for (const chapter of grade.chapters ?? []) {
          for (const lesson of chapter.lessons ?? []) {
            if (!lesson.textbookRef?.pages) continue;
            const out = formatTextbookPages(lesson.textbookRef.pages);
            seen.push([lesson.id, out]);
            expect(out).not.toMatch(/\[object/);
            expect(out).toMatch(/^\d+(، \d+)*$/);
          }
        }
      }
    }
    // Les neuf leçons de l'unité 1 déclarent toutes leurs pages.
    expect(seen.length).toBeGreaterThanOrEqual(9);
  });

  it('rend les pages attendues pour une leçon réelle du catalogue', () => {
    const lesson = dzCourseLevels
      .flatMap((l) => l.grades ?? [])
      .flatMap((g) => g.chapters ?? [])
      .flatMap((c) => c.lessons ?? [])
      .find((l) => l.id === 'qasim-adad-tabii');
    expect(lesson).toBeTruthy();
    expect(formatTextbookPages(lesson.textbookRef.pages)).toBe('8، 10، 14');
  });
});
