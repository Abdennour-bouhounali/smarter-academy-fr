import { describe, it, expect } from 'vitest';
import catalogue from '../../../../../../../../../packages/core/curriculum/dz/lessons_3am_2026_2027.json';
import { UNIT_ID } from './unitMeta';

/**
 * Chaque leçon de l'unité ouvre sur « أستعدّ » (module 0, `prerequisite_check`), et chaque affirmation dit d'où elle
 * vient : l'élément « prep » du manuel (p. 71, « أستعدّ ») ou `addition('prerequisite_diagnostic')`. L'unité est
 * générée LEÇON PAR LEÇON (cycle moyen, phase 3) : le nombre attendu est celui des leçons PUBLIÉES de l'unité dans le
 * catalogue, pas un nombre figé. Les `requires` littéraux sont vérifiés par l'audit des dépendances.
 */
const configs = import.meta.glob('../*/lesson.config.js', { eager: true });
const contents = import.meta.glob('../*/content/textbook.js', { eager: true });
const modules = import.meta.glob('../*/modules/Module00Astaidd.jsx', { query: '?raw', import: 'default', eager: true });

const lessonOf = (path) => path.split('/')[1];
const LESSONS = Object.entries(configs).map(([path, mod]) => ({ id: lessonOf(path), config: mod.LESSON_CONFIG }));
const published = catalogue.lessons.filter((l) => l.unitId === UNIT_ID && l.status === 'available').map((l) => l.code).sort();

describe('« أستعدّ » in every lesson of the unit', () => {
  it('finds exactly the published lessons of the unit', () => {
    expect(LESSONS.map((l) => l.id).sort()).toEqual(published);
  });

  it.each(LESSONS.map((l) => [l.id, l]))('%s opens on module 0 « أستعدّ »', (id, { config }) => {
    const first = config.modules[0];
    expect(first).toMatchObject({ number: 0, slug: 'astaidd', title: 'أستعدّ', stage: 'prerequisite_check', style: 'diagnostic' });
    expect(modules[`../${id}/modules/Module00Astaidd.jsx`]).toBeTruthy();
    expect(config.priorKnowledge.length).toBeGreaterThan(0);
  });

  it.each(LESSONS.map((l) => [l.id]))('%s: every item is sourced, typed and uses a declared skill', (id) => {
    const content = contents[`../${id}/content/textbook.js`];
    const items = [...(content.PREP_ITEMS ?? []), ...(content.PREP_PLATFORM_ITEMS ?? [])];
    const source = modules[`../${id}/modules/Module00Astaidd.jsx`];
    expect(items.length).toBeGreaterThanOrEqual(4);
    for (const it of items) {
      expect(typeof it.answer).toBe('boolean');
      expect(it.text.length).toBeGreaterThan(0);
      expect(it.why.length).toBeGreaterThan(0);
      expect(['textbook', 'platform_addition']).toContain(it.source?.type);
      if (it.source.type === 'textbook') expect(it.source.elementId).toBe('prep');
      expect(source).toMatch(new RegExp(`\\b${it.skill}: \\{ label:`));
    }
    expect(new Set(items.map((it) => it.answer)).size).toBe(2);
    expect((source.match(/\.\.\.prepQuestion\(/g) ?? []).length).toBe(items.length);
    expect((source.match(/requires: \['[a-z0-9-]+'\]/g) ?? []).length).toBe(items.length);
  });
});
