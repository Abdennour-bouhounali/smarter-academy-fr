import { describe, it, expect } from 'vitest';
import { getAllGrades, courseLevels } from './coursesData';

const allLessons = courseLevels.flatMap((level) =>
  level.grades.flatMap((grade) =>
    grade.chapters.flatMap((chapter) =>
      chapter.lessons.map((lesson) => ({ levelId: level.id, gradeId: grade.id, chapterId: chapter.id, lesson }))
    )
  )
);

describe('getAllGrades', () => {
  const grades = getAllGrades();

  it('returns one entry per grade across every level', () => {
    const expectedCount = courseLevels.reduce((sum, level) => sum + level.grades.length, 0);
    expect(grades).toHaveLength(expectedCount);
  });

  it('includes the current collège grades with their level', () => {
    expect(grades).toContainEqual({ id: '6e', name: '6ème', levelId: 'college', levelTitle: 'Collège' });
    expect(grades).toContainEqual({ id: '3e', name: '3ème', levelId: 'college', levelTitle: 'Collège' });
  });

  it('includes lycée grades, forward-compatibly', () => {
    expect(grades.some((g) => g.levelId === 'lycee')).toBe(true);
  });

  it('has no duplicate grade ids', () => {
    const ids = grades.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('lesson catalogue invariants', () => {
  it('derives the display duration string from durationMinutes', () => {
    for (const { lesson } of allLessons) {
      if (lesson.durationMinutes != null) {
        expect(lesson.duration).toBe(`${lesson.durationMinutes} min`);
      } else {
        expect(lesson.duration).toBe('--');
      }
    }
  });

  it('has globally unique lesson codes (bare-code API lookups depend on this)', () => {
    // POST /lessons/{code}/evidence and the lesson-progress endpoints resolve
    // lessons by bare code; the DB only enforces per-chapter uniqueness, so
    // this test is the real guard against cross-grade collisions.
    const ids = allLessons.map(({ lesson }) => lesson.id);
    const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(duplicates).toEqual([]);
  });

  it('keeps split-lesson parts coherent', () => {
    const byOfficialObject = new Map();
    for (const { gradeId, chapterId, lesson } of allLessons) {
      const key = `${gradeId}/${chapterId}/${lesson.officialObject}`;
      if (!byOfficialObject.has(key)) byOfficialObject.set(key, []);
      byOfficialObject.get(key).push(lesson);
    }

    for (const [key, parts] of byOfficialObject) {
      expect(new Set(parts.map((p) => p.partTotal)).size, key).toBe(1);
      expect(parts.map((p) => p.partIndex), key).toEqual(parts.map((_, i) => i + 1));
      expect(parts[0].partTotal, key).toBe(parts.length);
      if (parts.length > 1) {
        // Each part carries its OWN authored id — not a positional `-1`/`-2`
        // suffix. The suffix convention belonged to the retired "Partie 1 /
        // Partie 2" split, where parts were arbitrary slices of one notion;
        // a split is now pedagogical (4e `calcul_litteral` → « Calcul
        // littéral » + « Équations du premier degré »), so each part gets a
        // name that says what it teaches. What must hold is that the ids are
        // distinct — the Learning Point namespace (`<grade>_<id>_P<n>`) and
        // every progress key hang off them.
        const partIds = parts.map((p) => p.id);
        expect(new Set(partIds).size, key).toBe(partIds.length);
        parts.forEach((part) => {
          expect(part.id, key).toBeTruthy();
          expect(part.pointsToLearn.length, `${key} part ${part.partIndex}`).toBeGreaterThanOrEqual(1);
        });
      }
    }
  });

  it('builds paths under the owning level, not hardcoded college', () => {
    for (const { levelId, gradeId, lesson } of allLessons) {
      expect(lesson.path.startsWith(`/courses/${levelId}/${gradeId}/`), lesson.path).toBe(true);
    }
  });
});
