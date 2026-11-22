import { describe, it, expect } from 'vitest';
import { groupLessonsByUnit } from './unitGrouping';
import { fixtureGrade as grade } from './test/catalogueFixture';

const chapter1 = grade.chapters.find((c) => c.id === 'd1');
const unitById = (id) => grade.chapters.flatMap((c) => c.units).find((u) => u.id === id);

describe('groupLessonsByUnit', () => {
  it("renvoie null pour un thème sans unité (la grille garde ses cartes de leçon)", () => {
    // Le catalogue ne montre plus de thème sans leçons (coursesData.js,
    // 2026-09-25) : le cas est construit ici, avec la forme d'un chapitre
    // du catalogue — des leçons hors de toute unité, `units` vide.
    const chapter = { id: 'hisab_harfi', units: [], lessons: [{ id: 'l1', unitId: null }, { id: 'l2', unitId: null }] };
    expect(groupLessonsByUnit([chapter], chapter.lessons)).toBeNull();
    expect(groupLessonsByUnit([], [])).toBeNull();
  });

  it("sous un thème du manuel : les unités, puis les leçons hors unité — sans doublon", () => {
    const groups = groupLessonsByUnit([chapter1], chapter1.lessons);
    expect(groups.units.map((u) => u.id)).toEqual(['u1']);
    const unitIds = new Set(groups.units.flatMap((u) => {
      const unit = unitById(u.id);
      return [...unit.lessons.map((l) => l.id), ...(unit.synthesis ? [unit.synthesis.id] : [])];
    }));
    expect(groups.rest.some((l) => unitIds.has(l.id))).toBe(false);
    expect(groups.rest.length + unitIds.size).toBe(chapter1.lessons.length);
  });

  it("« Tous les thèmes » : toutes les unités de la classe, le reste des leçons intact", () => {
    const all = grade.chapters.flatMap((c) => c.lessons);
    const groups = groupLessonsByUnit(grade.chapters, all);
    expect(groups.units.length).toBe(grade.chapters.reduce((n, c) => n + (c.units?.length ?? 0), 0));
    const unitLessonCount = groups.units.reduce((n, u) => n + u.lessons.length + (u.synthesis ? 1 : 0), 0);
    expect(groups.rest.length).toBe(all.length - unitLessonCount);
  });
});
