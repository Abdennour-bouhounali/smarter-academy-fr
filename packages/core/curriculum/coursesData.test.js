import { describe, it, expect } from 'vitest';
import {
  getAllGrades, courseLevels, allCourseLevels, buildCourseLevels, getLessonById, getLessonPath, getUnitById,
  getUnitOfLesson, UNIT_PATH_SEGMENT, buildUnitPath,
} from './coursesData';
import { ACTIVE_GRADE_IDS } from './activeGrades';
import programme6e from './fr/programme_6e_2026_2027.json';
import programme5e from './fr/programme_5e_2026_2027.json';
import programme4e from './fr/programme_4e_2026_2027.json';
import programme3e from './fr/programme_3e_2026_2027.json';
import lessons3e from './fr/lessons_3e_2026_2027.json';
import units3e from './fr/units_3e_2026_2027.json';

// The builder's rules are checked on this small neutral trio of its own; the delivered catalogue (3e: 60 lessons, one
// `available` — PUBLISHED — and 59 `coming_soon`; 6e–4e empty) is checked below on its own facts.
const PUBLISHED = ['decomposer-en-facteurs-premiers'];
const lesson = (code, extra) => ({
  code, order: 0, kind: 'lesson', titleSource: 'editorial', title: `Leçon ${code}`, description: `Description ${code}`,
  prerequisites: [], prerequisiteLessonCodes: [], pointsToLearn: [`Point 1 de ${code}`], durationMinutes: 45, difficulty: 1,
  status: 'coming_soon', icon: null, decompositionType: 'editorial_lesson', decisionStatus: 'draft', ...extra,
});
const FIXTURE = [
  {
    programme: {
      grade: '5e', gradeLabel: 'Cinquième', gradeShortLabel: '5e', level: 'college', levelLabel: 'Collège',
      domains: [
        { id: 'd1', title: 'Domaine A', topics: [{ id: 't1', title: 'Sujet 1' }, { id: 't2', title: 'Sujet 2', namedMethods: ['Méthode M'] }] },
        { id: 'd2', title: 'Domaine B', subtitle: 'Sous-titre B', topics: [{ id: 't3', title: 'Sujet 3' }] },
        { id: 'd3', title: 'Domaine sans leçon', topics: [{ id: 't4', title: 'Sujet 4' }] },
      ],
    },
    lessons: {
      grade: '5e',
      lessons: [
        lesson('lecon-b', {
          chapterId: 'd1', unitId: 'u1', sourceTopicId: 't2', order: 1, title: 'Leçon B', status: 'available',
          prerequisiteLessonCodes: ['lecon-a'],
        }),
        lesson('lecon-a', { chapterId: 'd1', unitId: 'u1', sourceTopicId: 't1', order: 0, status: 'available' }),
        lesson('synthese-u1', { chapterId: 'd1', unitId: 'u1', sourceTopicId: 't1', order: 2, kind: 'synthesis' }),
        lesson('lecon-c', { chapterId: 'd2', sourceTopicId: 't3', durationMinutes: null }),
      ],
    },
    units: {
      grade: '5e',
      units: [{ code: 'u1', chapterId: 'd1', order: 0, number: 1, title: 'Unité 1', objectives: ['Objectif 1'] }],
      ownerChapters: [],
      chapterIcons: { d1: '🔢' },
      chapterOrder: { order: ['d2'] },
    },
  },
  {
    programme: {
      grade: '4e', gradeLabel: 'Quatrième', gradeShortLabel: '4e', level: 'college', levelLabel: 'Collège',
      domains: [{ id: 'd1', title: 'Domaine A', topics: [{ id: 't5', title: 'Sujet 5' }] }],
    },
    lessons: { grade: '4e', lessons: [lesson('lecon-d', { chapterId: 'd1', sourceTopicId: 't5', prerequisiteLessonCodes: ['lecon-b'] })] },
    units: { grade: '4e', units: [], ownerChapters: [], chapterIcons: {}, chapterOrder: { order: [] } },
  },
];
const fixtureLevels = buildCourseLevels(FIXTURE);

const lessonsOf = (levels) =>
  levels.flatMap((level) =>
    level.grades.flatMap((grade) =>
      grade.chapters.flatMap((chapter) =>
        chapter.lessons.map((l) => ({ levelId: level.id, gradeId: grade.id, chapterId: chapter.id, lesson: l }))
      )
    )
  );

describe('getAllGrades', () => {
  const grades = getAllGrades();

  it('returns one entry per active grade', () => {
    const expectedCount = courseLevels.reduce((sum, level) => sum + level.grades.length, 0);
    expect(grades).toHaveLength(expectedCount);
  });

  it('exposes the four collège grades, in order, under « Collège »', () => {
    expect(grades.map((g) => g.id)).toEqual(['6e', '5e', '4e', '3e']);
    expect(grades.map((g) => g.name)).toEqual(['Sixième', 'Cinquième', 'Quatrième', 'Troisième']);
    for (const g of grades) expect(g).toMatchObject({ levelId: 'college', levelTitle: 'Collège' });
  });

  it('counts only PUBLISHED lessons, and says where each grade stands (I2)', () => {
    // one lesson is published (2026-11-23): the first lesson of 3e, `decomposer-en-facteurs-premiers`
    expect(grades.map((g) => [g.id, g.lessonCount])).toEqual([['6e', 0], ['5e', 0], ['4e', 0], ['3e', 1]]);
    for (const g of grades) expect(g.curriculumStatus, g.id).toBe('lessons_planned');
  });

  it('counts the announced lessons apart: 3e has its year announced, 6e–4e nothing', () => {
    expect(grades.map((g) => [g.id, g.catalogueLessonCount])).toEqual([['6e', 0], ['5e', 0], ['4e', 0], ['3e', 60]]);
  });

  it('has no duplicate grade ids', () => {
    const ids = grades.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('the delivered catalogue', () => {
  it('holds exactly the active grades, every one with its short label', () => {
    const all = allCourseLevels.flatMap((l) => l.grades);
    expect(all.map((g) => g.id)).toEqual([...ACTIVE_GRADE_IDS]);
    expect(all.map((g) => g.shortName)).toEqual(['6e', '5e', '4e', '3e']);
    expect(allCourseLevels.map((l) => l.id)).toEqual(['college']);
  });

  it('gives every grade the five thèmes, unverified, in the same order', () => {
    const themes = [
      'nombres_calculs', 'organisation_gestion_donnees_fonctions', 'grandeurs_mesures', 'espace_geometrie',
      'algorithmique_programmation',
    ];
    for (const p of [programme6e, programme5e, programme4e, programme3e]) {
      expect(p.domains.map((d) => d.id), p.grade).toEqual(themes);
      expect(p.verified).toBe(false);
      for (const d of p.domains) expect(d.verified, `${p.grade} ${d.id}`).toBe(false);
    }
  });

  it('shows no chapter without a lesson, and resolves no lesson or unit', () => {
    for (const grade of allCourseLevels.flatMap((l) => l.grades)) {
      for (const chapter of grade.chapters) expect(chapter.lessons.length, chapter.id).toBeGreaterThan(0);
    }
    expect(getLessonById('nimporte')).toBeNull();
    expect(getLessonPath('nimporte')).toBeNull();
    expect(getUnitById('nimporte')).toBeNull();
    expect(getUnitOfLesson('nimporte')).toBeNull();
    expect(getLessonById(null)).toBeNull();
  });

  it('gives 6e, 5e and 4e no chapter (no lesson yet), and 3e its five thèmes in the order A…E', () => {
    const grades = allCourseLevels.flatMap((l) => l.grades);
    for (const id of ['6e', '5e', '4e']) expect(grades.find((g) => g.id === id).chapters, id).toEqual([]);
    const g3 = grades.find((g) => g.id === '3e');
    expect(g3.chapters.map((c) => c.id)).toEqual([
      'nombres_calculs', 'organisation_gestion_donnees_fonctions', 'grandeurs_mesures', 'espace_geometrie',
      'algorithmique_programmation',
    ]);
    // Each thème carries one official topic: the 3e segment of the same thème.
    expect(g3.chapters.map((c) => c.topics.map((t) => t.id))).toEqual([['3e.m1'], ['3e.m2'], ['3e.m3'], ['3e.m4'], ['3e.m5']]);
  });

  it('builds every 3e lesson and unit of the files, each unit under its thème, its synthesis apart', () => {
    const g3 = allCourseLevels.flatMap((l) => l.grades).find((g) => g.id === '3e');
    const built = g3.chapters.flatMap((c) => c.lessons);
    const units = g3.chapters.flatMap((c) => c.units);
    expect(built).toHaveLength(lessons3e.lessons.length);
    expect(units.map((u) => u.id).sort()).toEqual(units3e.units.map((u) => u.code).sort());
    for (const chapter of g3.chapters) {
      for (const u of chapter.units) {
        const ofUnit = lessons3e.lessons.filter((l) => l.unitId === u.id);
        expect(ofUnit.every((l) => l.chapterId === chapter.id), u.id).toBe(true);
        expect(u.synthesis?.kind, u.id).toBe('synthesis');
        expect(u.lessons.length + 1, u.id).toBe(ofUnit.length);
      }
    }
    const lpIds = built.flatMap((l) => l.learningPoints.map((p) => p.id));
    expect(lpIds).toHaveLength(lessons3e.lessons.reduce((n, l) => n + l.pointsToLearn.length, 0));
    for (const l of built) for (const p of l.learningPoints) for (const q of p.prerequisites) expect(lpIds, `${p.id} ← ${q.id}`).toContain(q.id);
  });

  it('shows each 3e lesson under its OWN title, keeps the official topic title beside it, and links only the published one', () => {
    const byCode = new Map(lessons3e.lessons.map((l) => [l.code, l]));
    const topicTitle = new Map(programme3e.domains.flatMap((d) => d.topics.map((t) => [t.id, t.title])));
    for (const { lesson: l } of lessonsOf(allCourseLevels)) {
      expect(l.title, l.id).toBe(byCode.get(l.id).title);
      expect(l.titleSource, l.id).toBe('editorial');
      expect(l.officialTopicTitle, l.id).toBe(topicTitle.get(byCode.get(l.id).sourceTopicId) ?? null);
      expect(l.status, l.id).toBe(PUBLISHED.includes(l.id) ? 'available' : 'coming_soon');
      expect(getLessonById(l.id)).toMatchObject({ id: l.id, gradeId: '3e' });
      expect(getLessonPath(l.id), l.id).toBe(PUBLISHED.includes(l.id) ? l.path : null);
      expect(getUnitOfLesson(l.id)?.id, l.id).toBe(byCode.get(l.id).unitId);
    }
  });
});

describe.each([
  ['delivered', allCourseLevels],
  ['fixture', fixtureLevels],
])('lesson catalogue invariants (%s)', (_, levels) => {
  const all = lessonsOf(levels);

  it('derives the display duration string from durationMinutes', () => {
    for (const { lesson: l } of all) {
      expect(l.duration).toBe(l.durationMinutes != null ? `${l.durationMinutes} min` : '--');
    }
  });

  it('has globally unique lesson codes (bare-code API lookups depend on this)', () => {
    // POST /lessons/{code}/evidence and the lesson-progress endpoints resolve
    // lessons by bare code; the DB only enforces per-chapter uniqueness, so
    // this test is the real guard against cross-grade collisions.
    const ids = all.map(({ lesson: l }) => l.id);
    expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
  });

  it('builds paths under the owning level and grade', () => {
    for (const { levelId, gradeId, chapterId, lesson: l } of all) {
      expect(l.path).toBe(`/courses/${levelId}/${gradeId}/${chapterId}/${l.id}`);
    }
  });

  it('never gives a lesson the reserved unit segment as code', () => {
    for (const { lesson: l } of all) expect(l.id).not.toBe(UNIT_PATH_SEGMENT);
  });

  it('declares as prerequisites only lessons that exist, never itself, never in a cycle', () => {
    const byId = new Map(all.map(({ lesson: l }) => [l.id, l]));
    const state = new Map();
    const visit = (id, trail) => {
      if (state.get(id) === 'done') return;
      expect(state.get(id), `cycle : ${[...trail, id].join(' → ')}`).not.toBe('open');
      state.set(id, 'open');
      for (const pre of byId.get(id).prerequisiteLessonCodes) {
        expect(byId.has(pre), `${id} → ${pre}`).toBe(true);
        expect(pre).not.toBe(id);
        visit(pre, [...trail, id]);
      }
      state.set(id, 'done');
    };
    for (const id of byId.keys()) visit(id, []);
  });

  it('marks every grade with a curriculumStatus', () => {
    for (const grade of levels.flatMap((l) => l.grades)) expect(grade.curriculumStatus).toBeTruthy();
  });
});

describe('buildCourseLevels — the rules of the builder (fixture)', () => {
  const [level] = fixtureLevels;
  const grade5e = level.grades.find((g) => g.id === '5e');

  it('places each grade under the level of its programme, in the order given', () => {
    expect(fixtureLevels.map((l) => [l.id, l.title])).toEqual([['college', 'Collège']]);
    expect(level.grades.map((g) => [g.id, g.name, g.shortName])).toEqual([['5e', 'Cinquième', '5e'], ['4e', 'Quatrième', '4e']]);
  });

  it('shows only the domains that carry a lesson, in the display order, keeping `order` as the programme position', () => {
    expect(grade5e.chapters.map((c) => c.id)).toEqual(['d2', 'd1']);
    expect(grade5e.chapters.map((c) => c.order)).toEqual([1, 0]);
    expect(grade5e.chapters.map((c) => [c.title, c.subtitle, c.icon])).toEqual([
      ['Domaine B', 'Sous-titre B', null], ['Domaine A', null, '🔢'],
    ]);
  });

  it('copies the official topics word for word, and named methods only where the programme names them', () => {
    const d1 = grade5e.chapters.find((c) => c.id === 'd1');
    expect(d1.topics).toEqual([{ id: 't1', title: 'Sujet 1' }, { id: 't2', title: 'Sujet 2', namedMethods: ['Méthode M'] }]);
  });

  it('sorts lessons by `order`, titles a lesson by its own title, keeps the official topic title beside it', () => {
    const d1 = grade5e.chapters.find((c) => c.id === 'd1');
    expect(d1.lessons.map((l) => l.id)).toEqual(['lecon-a', 'lecon-b', 'synthese-u1']);
    expect(d1.lessons.map((l) => [l.title, l.officialTopicTitle, l.titleSource])).toEqual([
      ['Leçon lecon-a', 'Sujet 1', 'editorial'], ['Leçon B', 'Sujet 2', 'editorial'], ['Leçon synthese-u1', 'Sujet 1', 'editorial'],
    ]);
  });

  it('grafts units on their chapter without moving the lessons, the synthesis apart', () => {
    const d1 = grade5e.chapters.find((c) => c.id === 'd1');
    const [unit] = d1.units;
    expect(unit).toMatchObject({ id: 'u1', number: 1, title: 'Unité 1', objectives: ['Objectif 1'], chapterId: 'd1' });
    for (const l of unit.lessons) expect(d1.lessons).toContain(l);
    expect(unit.lessons.map((l) => l.id)).toEqual(['lecon-a', 'lecon-b']);
    expect(unit.synthesis.id).toBe('synthese-u1');
    expect(unit.path).toBe(buildUnitPath({ levelId: 'college', gradeId: '5e', chapterId: 'd1', unitCode: 'u1' }));
    expect(unit.path).toBe(`/courses/college/5e/d1/${UNIT_PATH_SEGMENT}/u1`);
    expect(grade5e.chapters.find((c) => c.id === 'd2').units).toEqual([]);
  });
});
