import { describe, it, expect } from 'vitest';
import { buildProgressionTree } from '../progression/buildProgressionTree';
import { pickCurriculumContext, indexTreeByLesson, indexCurriculum } from './curriculumContext';

/**
 * Un catalogue MINIMAL à la forme de coursesData.js et une activité à la
 * forme de getStudentActivity — la même fixture que progression.test.js.
 * Ces tests verrouillent la tranche « أين أنت » et les index (repliés sous
 * « المزيد » depuis l'accueil mené par بوصلتي, 2026-11-09), pas des intitulés.
 */
function lp(code, n) {
  return { id: `4am_${code}_P${n}`, title: `نقطة ${code} ${n}`, order: n };
}
function lesson(code, { unitId = null, kind = 'lesson', status = 'available', title = `درس ${code}`, points = 2 } = {}) {
  return {
    id: code, title, kind, unitId, status, icon: '📘', tier: 'free',
    path: `/courses/moyen/4am/ch/${code}`,
    learningPoints: Array.from({ length: points }, (_, i) => lp(code, i + 1)),
  };
}

const a = lesson('a', { unitId: 'u1', title: 'الدرس أ' });
const b = lesson('b', { unitId: 'u1', title: 'الدرس ب' });
const c = lesson('c', { title: 'الدرس ج' });
const unit1 = { id: 'u1', number: 1, title: 'الوحدة الأولى', subtitle: null, order: 0, chapterId: 'f1', path: '/u/u1', lessons: [a, b], synthesis: null };
const field1 = { id: 'f1', title: 'ميدان الأعداد', subtitle: null, order: 0, units: [unit1], lessons: [a, b] };
const field2 = { id: 'f2', title: 'ميدان الهندسة', subtitle: null, order: 1, units: [], lessons: [c] };
const grade = { id: '4am', name: 'السنة الرابعة متوسط', chapters: [field1, field2] };
const courseLevels = [{ id: 'moyen', title: 'التعليم المتوسط', grades: [grade] }];
const level = courseLevels[0];

function entry(l, { percent = 0, last = 0, modules = new Set() } = {}) {
  return { lesson: l, chapter: field1, grade, level, progressPercent: percent, lastVisitedAt: last, uniqueModules: modules, totalCount: 4 };
}
const getModulePath = (id, n) => `/courses/moyen/4am/ch/${id}/m${n}`;

describe('pickCurriculumContext — la tranche « أين أنت »', () => {
  it('un élève neuf voit le DÉBUT de son programme', () => {
    const tree = buildProgressionTree(courseLevels, { lessons: [entry(a), entry(b), entry(c)] }, [], { gradeId: '4am', getModulePath });
    const ctx = pickCurriculumContext(tree, null);
    expect(ctx.field.title).toBe('ميدان الأعداد');
    expect(ctx.unit.title).toBe('الوحدة الأولى');
    expect(ctx.lesson.id).toBe('a');
    expect(ctx.lesson.percent).toBe(0);
  });

  it('la leçon du héros prime ; sinon la plus récente', () => {
    const activity = { lessons: [entry(a, { percent: 50, last: 10 }), entry(b), entry(c, { percent: 25, last: 99, modules: new Set([1]) })] };
    const tree = buildProgressionTree(courseLevels, activity, [], { gradeId: '4am', getModulePath });
    expect(pickCurriculumContext(tree, 'a').lesson.id).toBe('a');
    const recent = pickCurriculumContext(tree, null);
    expect(recent.lesson.id).toBe('c');
    expect(recent.unit).toBeNull(); // hors unité : pas de ligne وحدة inventée
    expect(recent.field.title).toBe('ميدان الهندسة');
    expect(recent.lesson.path).toBe('/courses/moyen/4am/ch/c/m2'); // le prochain محور, via le registre
  });

  it('les pourcentages sont ceux de l’arbre : moyenne des leçons construites', () => {
    const tree = buildProgressionTree(courseLevels, { lessons: [entry(a, { percent: 100, last: 1 }), entry(b, { percent: 50, last: 2 })] }, [], { gradeId: '4am', getModulePath });
    const ctx = pickCurriculumContext(tree, 'b');
    expect(ctx.unit.percent).toBe(75);
    expect(ctx.field.percent).toBe(75);
    expect(ctx.lesson.percent).toBe(50);
  });

  it('une leçon d’une autre classe ne casse rien : l’arbre est cadré, on retombe', () => {
    const tree = buildProgressionTree(courseLevels, { lessons: [entry(a)] }, [], { gradeId: '4am', getModulePath });
    expect(pickCurriculumContext(tree, 'lesson-de-3am').lesson.id).toBe('a');
    const empty = buildProgressionTree(courseLevels, { lessons: [] }, [], { gradeId: '4am', getModulePath });
    expect(pickCurriculumContext(empty, null)).toBeNull();
  });
});

describe('les index', () => {
  it('indexTreeByLesson donne وحدة / ميدان et chemin de reprise d’une leçon', () => {
    const tree = buildProgressionTree(courseLevels, { lessons: [entry(a, { percent: 25, last: 1, modules: new Set([1]) }), entry(c)] }, [], { gradeId: '4am', getModulePath });
    const idx = indexTreeByLesson(tree);
    expect(idx.get('a').group.title).toBe('الوحدة الأولى');
    expect(idx.get('a').field.title).toBe('ميدان الأعداد');
    expect(idx.get('a').lesson.cta.path).toBe('/courses/moyen/4am/ch/a/m2');
    expect(idx.get('c').group.kind).toBe('other');
    expect(idx.has('b')).toBe(false); // pas construite : absente, jamais à 0 %
  });

  it('indexCurriculum couvre toutes les classes et retrouve l’unité', () => {
    const idx = indexCurriculum(courseLevels);
    expect(idx.get('a').unit.title).toBe('الوحدة الأولى');
    expect(idx.get('c').unit).toBeNull();
    expect(idx.get('c').field.title).toBe('ميدان الهندسة');
    expect(idx.get('c').grade.id).toBe('4am');
  });
});
