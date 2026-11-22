import { describe, it, expect } from 'vitest';
import { catalogueHref } from './catalogueLink';

describe('catalogueHref — le fil d’Ariane vers le catalogue', () => {
  it('mène l’élève à « دروسي », le ميدان présélectionné', () => {
    expect(catalogueHref('student')).toBe('/espace/cours');
    expect(catalogueHref('student', { level: 'moyen', grade: '4am' })).toBe('/espace/cours');
    expect(catalogueHref('student', { level: 'moyen', grade: '4am', chapter: 'handasa' })).toBe('/espace/cours?chapter=handasa');
  });

  it('garde le catalogue public pour les autres (/espace n’admet que les élèves)', () => {
    for (const role of [undefined, 'teacher', 'admin']) {
      expect(catalogueHref(role)).toBe('/courses');
      expect(catalogueHref(role, { level: 'moyen', grade: '4am', chapter: 'handasa' })).toBe('/courses?level=moyen&grade=4am&chapter=handasa');
      expect(catalogueHref(role, { level: null, grade: '4am' })).toBe('/courses?grade=4am');
    }
  });
});
