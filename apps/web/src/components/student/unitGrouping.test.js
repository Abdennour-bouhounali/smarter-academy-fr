import { describe, it, expect } from 'vitest';
import { courseLevels, getUnitById } from '@smarter-academy/core';
import { groupLessonsByUnit } from './unitGrouping';

const grade4am = courseLevels.find((l) => l.id === 'moyen').grades.find((g) => g.id === '4am');
const chapter1 = grade4am.chapters.find((c) => c.id === 'ansab_al_aadad_wal_hisab');

describe('groupLessonsByUnit', () => {
  it("renvoie null pour un ميدان sans unité (la grille garde ses cartes de leçon)", () => {
    // Le catalogue ne montre plus de ميدان sans leçons (coursesData.js,
    // 2026-09-25) : le cas est construit ici, avec la forme d'un chapitre
    // du catalogue — des leçons hors de toute unité, `units` vide.
    const chapter = { id: 'hisab_harfi', units: [], lessons: [{ id: 'l1', unitId: null }, { id: 'l2', unitId: null }] };
    expect(groupLessonsByUnit([chapter], chapter.lessons)).toBeNull();
    expect(groupLessonsByUnit([], [])).toBeNull();
  });

  it("sous un ميدان du manuel : les unités, puis les leçons hors unité — sans doublon", () => {
    const groups = groupLessonsByUnit([chapter1], chapter1.lessons);
    // Les cinq unités du manuel, dans l'ordre du manuel (la seconde, « الحساب
    // على الجذور », n'a pas de synthèse sur la plateforme).
    expect(groups.units.map((u) => u.id)).toEqual(['aadad-tabiiya-natiqa', 'hisab-judhur', 'hisab-harfi', 'muadalat-mutarajihat', 'jumal-muadalatayn']);
    const unitIds = new Set(groups.units.flatMap((u) => {
      const unit = getUnitById(u.id);
      return [...unit.lessons.map((l) => l.id), ...(unit.synthesis ? [unit.synthesis.id] : [])];
    }));
    expect(groups.rest.some((l) => unitIds.has(l.id))).toBe(false);
    expect(groups.rest.length + unitIds.size).toBe(chapter1.lessons.length);
  });

  it("« كل الميادين » : toutes les unités de la classe, le reste des leçons intact", () => {
    const all = grade4am.chapters.flatMap((c) => c.lessons);
    const groups = groupLessonsByUnit(grade4am.chapters, all);
    expect(groups.units.length).toBe(grade4am.chapters.reduce((n, c) => n + (c.units?.length ?? 0), 0));
    const unitLessonCount = groups.units.reduce((n, u) => n + u.lessons.length + (u.synthesis ? 1 : 0), 0);
    expect(groups.rest.length).toBe(all.length - unitLessonCount);
  });
});
