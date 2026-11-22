import { describe, it, expect, beforeEach } from 'vitest';
import { courseLevels } from '@smarter-academy/core';
import {
  CATALOGUE_VIEW_STORAGE_KEY,
  DEFAULT_CATALOGUE_VIEW,
  groupLessonsByChapter,
  normalizeCatalogueView,
  readCatalogueView,
  unitByLessonId,
} from './catalogueView';

const grade4am = courseLevels.find((l) => l.id === 'moyen').grades.find((g) => g.id === '4am');
const allLessons = grade4am.chapters.flatMap((c) => c.lessons);

describe('normalizeCatalogueView', () => {
  it('garde un choix valide et remplace le reste par le défaut', () => {
    expect(normalizeCatalogueView({ group: 'chapters', layout: 'rows' })).toEqual({ group: 'chapters', layout: 'rows' });
    expect(normalizeCatalogueView({ group: 'nope', layout: 'rows' })).toEqual({ group: 'units', layout: 'rows' });
    expect(normalizeCatalogueView(null)).toEqual(DEFAULT_CATALOGUE_VIEW);
    expect(normalizeCatalogueView('grid')).toEqual(DEFAULT_CATALOGUE_VIEW);
  });
});

describe('readCatalogueView', () => {
  beforeEach(() => { try { localStorage.clear(); } catch { /* environnement sans stockage */ } });

  it('retombe sur le défaut quand la valeur stockée est illisible', () => {
    try { localStorage.setItem(CATALOGUE_VIEW_STORAGE_KEY, '{oops'); } catch { /* idem */ }
    expect(readCatalogueView()).toEqual(DEFAULT_CATALOGUE_VIEW);
  });
});

describe('groupLessonsByChapter', () => {
  it('montre chaque leçon du niveau exactement une fois, unité par unité, synthèse en dernier', () => {
    const sections = groupLessonsByChapter(grade4am.chapters, allLessons);
    const shown = sections.flatMap((s) => s.blocks.flatMap((b) => b.lessons.map((l) => l.id)));
    expect(new Set(shown).size).toBe(shown.length);
    expect(shown.length).toBe(allLessons.length);

    for (const block of sections.flatMap((s) => s.blocks).filter((b) => b.unit?.synthesis)) {
      expect(block.lessons.at(-1).id).toBe(block.unit.synthesis.id);
    }
  });

  it('ne garde que les leçons visibles et efface les unités vides', () => {
    const chapter = grade4am.chapters[0];
    const firstUnit = chapter.units[0];
    const sections = groupLessonsByChapter([chapter], firstUnit.lessons.slice(0, 1));
    expect(sections).toHaveLength(1);
    expect(sections[0].blocks).toHaveLength(1);
    expect(sections[0].blocks[0].unit.id).toBe(firstUnit.id);
    expect(sections[0].blocks[0].lessons.map((l) => l.id)).toEqual([firstUnit.lessons[0].id]);
  });

  it('range les leçons hors unité dans un bloc sans unité', () => {
    const chapter = { id: 'c', units: [], lessons: [{ id: 'l1' }, { id: 'l2' }] };
    expect(groupLessonsByChapter([chapter], chapter.lessons)).toEqual([
      { chapter, blocks: [{ unit: null, lessons: chapter.lessons }] },
    ]);
  });
});

describe('unitByLessonId', () => {
  it('rattache leçons et synthèse à leur unité', () => {
    const map = unitByLessonId(grade4am.chapters);
    const unit = grade4am.chapters[0].units[0];
    expect(map.get(unit.lessons[0].id)?.id).toBe(unit.id);
    if (unit.synthesis) expect(map.get(unit.synthesis.id)?.id).toBe(unit.id);
  });
});
