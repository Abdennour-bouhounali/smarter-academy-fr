import { describe, it, expect } from 'vitest';
import catalogue from '../../../../../../../../../packages/core/curriculum/dz/lessons_1am_2026_2027.json';

// the unit's id (its `unitMeta.js` keeps only what the content and the routes read)
const UNIT_ID = 'darb-qisma-ashriya';

/**
 * « أستعدّ » of the unit. The unit is generated LESSON BY LESSON (cycle moyen, phase 3): the expected lessons are the
 * PUBLISHED ones of the catalogue, not a fixed number. Since 2026-11-18 both published lessons are v2 (LESSON_V2.md §2):
 * their « أستعدّ » page is deleted with their old version — the launch kit « عُدّة الانطلاق » measures what they need — and
 * their module 0 stays in the config as DATA (progress is stored by its number). The unit's `prepDiagnostic.jsx` went
 * with the last page that used it; a lesson of the unit built on module pages again would bring it back.
 */
const configs = import.meta.glob('../*/lesson.config.js', { eager: true });
const modules = import.meta.glob('../*/modules/Module00Astaidd.jsx', { query: '?raw', import: 'default', eager: true });
const routes = import.meta.glob('../*/routes.jsx', { query: '?raw', import: 'default', eager: true });

const lessonOf = (path) => path.split('/')[1];
const LESSONS = Object.entries(configs).map(([path, mod]) => ({ id: lessonOf(path), config: mod.LESSON_CONFIG }));
const published = catalogue.lessons.filter((l) => l.unitId === UNIT_ID && l.status === 'available').map((l) => l.code).sort();
const isV2 = (id) => /retiredModules:\s*true/.test(routes[`../${id}/routes.jsx`] ?? '');

describe('« أستعدّ » in every lesson of the unit', () => {
  it('finds exactly the published lessons of the unit', () => {
    expect(LESSONS.map((l) => l.id).sort()).toEqual(published);
  });

  it.each(LESSONS.map((l) => [l.id, l]))('%s keeps module 0 « أستعدّ » as data', (id, { config }) => {
    const first = config.modules[0];
    expect(first).toMatchObject({ number: 0, slug: 'astaidd', title: 'أستعدّ', stage: 'prerequisite_check', style: 'diagnostic' });
    expect(Boolean(modules[`../${id}/modules/Module00Astaidd.jsx`])).toBe(!isV2(id));
    expect(config.priorKnowledge.length).toBeGreaterThan(0);
  });

  it('the two v2 lessons have no « أستعدّ » page left', () => {
    expect(LESSONS.filter((l) => isV2(l.id)).map((l) => l.id).sort()).toEqual(['qawaid-qabiliyat-qisma', 'qisma-iqlidiya-baqi']);
  });
});
