import { describe, it, expect } from 'vitest';
import { getLessonById, getUnitOfLesson } from '@smarter-academy/core';
import { isLessonBuilt, loadLessonConfig } from '../../../lessons/registry';
import { buildLessonMemo, collectExercises, pickStartActivity, collectBricks } from './buildLessonMemo';
import { loadLessonMemoSources, memoSourceLessonIds } from './loadLessonMemoSources';
import { lessonMemoPath, wantsClassroomStart, CLASSROOM_START_STATE } from './memoRoutes';

async function memoFor(id) {
  const lesson = getLessonById(id);
  const unit = getUnitOfLesson(id);
  const sources = await loadLessonMemoSources(id);
  const unitLessons = unit ? [...unit.lessons, ...(unit.synthesis ? [unit.synthesis] : [])] : [];
  const config = await loadLessonConfig(id);
  return { lesson, sources, memo: buildLessonMemo({ lesson, config, unit, ...sources, lessonById: getLessonById, unitLessons }) };
}

describe('buildLessonMemo — sur chaque leçon réelle de la 4AM', () => {
  const ids = memoSourceLessonIds().filter((id) => isLessonBuilt(id));

  it('trouve les sources de toutes les leçons construites', () => {
    expect(ids.length).toBeGreaterThanOrEqual(9);
  });

  it.each(ids)('%s : une phase par محور, dans l’ordre, durées cumulées', async (id) => {
    const { memo } = await memoFor(id);
    const config = await loadLessonConfig(id);
    expect(memo.phases.map((p) => p.number)).toEqual(config.modules.map((m) => m.number));
    expect(memo.phases.map((p) => p.stage)).toEqual(config.modules.map((m) => m.stage));
    expect(memo.header.plannedMinutes).toBe(config.modules.reduce((s, m) => s + (m.estimatedMin ?? 0), 0));
    memo.phases.forEach((p, i) => {
      if (i > 0) expect(p.startsAt).toBe(memo.phases[i - 1].startsAt + (memo.phases[i - 1].minutes ?? 0));
    });
    expect(memo.phases.at(-1).next).toBeNull();
  }, 30_000);

  it.each(ids)('%s : rien n’est inventé — chaque texte vient de la leçon', async (id) => {
    const { memo, sources } = await memoFor(id);
    const errorsInContent = new Set(collectExercises(sources.content).map((e) => e.commonError).filter(Boolean));
    for (const e of memo.errors) expect(errorsInContent.has(e.commonError)).toBe(true);
    for (const p of memo.phases) for (const v of p.vigilance) expect(errorsInContent.has(v)).toBe(true);
    const brickTitles = new Set(collectBricks(sources.knowledge).map((b) => b.title));
    for (const b of memo.trace.bricks) expect(brickTitles.has(b.title)).toBe(true);
    const lpTitles = new Set(getLessonById(id).learningPoints.map((lp) => lp.title));
    for (const t of memo.evaluation.indicators) expect(lpTitles.has(t)).toBe(true);
    if (memo.start) expect(memo.start.questions).toEqual(pickStartActivity(sources.content).questions);
  });
});

describe('buildLessonMemo — données manquantes', () => {
  it('une leçon sans contenu chargé donne des sections vides, jamais inventées', () => {
    const memo = buildLessonMemo({
      lesson: { id: 'x', title: 'Leçon', learningPoints: [] },
      config: { modules: [{ id: '01', number: 1, title: 'M1', stage: 'discovery', estimatedMin: 10 }] },
    });
    expect(memo.start).toBeNull();
    expect(memo.errors).toEqual([]);
    expect(memo.examples).toEqual([]);
    expect(memo.trace.bricks).toEqual([]);
    expect(memo.evaluation.exitTicket).toBeNull();
    expect(memo.differentiation.support.exercises).toEqual([]);
    expect(memo.phases).toHaveLength(1);
  });

  it('la différenciation suit la difficulté réelle des exercices et le niveau des manipulations', () => {
    const memo = buildLessonMemo({
      lesson: { id: 'x', title: 'L', learningPoints: [{ id: 'P1', title: 'p1' }] },
      config: {
        modules: [{ id: '01', number: 1, title: 'M1', stage: 'practice_lab', teachesLearningPointIds: ['P1'] }],
        resources: [{ kind: 'manipulation', module: 1, level: 'beginner', title: 'petit' }, { kind: 'manipulation', module: 1, level: 'advanced', title: 'grand' }],
      },
      content: { EXERCISES_1: [{ id: 'a', difficulty: 'facile', statement: 's1', learningPointId: 'P1', commonError: 'e1' }], EXERCISES_2: [{ id: 'b', difficulty: 'difficile', statement: 's2' }] },
    });
    expect(memo.differentiation.support.exercises.map((e) => e.id)).toEqual(['a']);
    expect(memo.differentiation.extension.exercises.map((e) => e.id)).toEqual(['b']);
    expect(memo.differentiation.support.manipulations.map((m) => m.title)).toEqual(['petit']);
    expect(memo.differentiation.core.manipulations.map((m) => m.title)).toEqual(['grand']);
    expect(memo.phases[0].vigilance).toEqual(['e1']);
    expect(memo.evaluation.exitTicket.id).toBe('a');
  });
});

describe('memoRoutes', () => {
  it('la route de la مذكرة est sous l’espace enseignant', () => {
    expect(lessonMemoPath('tayin-pgcd')).toBe('/enseignant/cours/tayin-pgcd/memoire');
  });
  it('seul l’état explicite ouvre وضع القسم à l’arrivée', () => {
    expect(wantsClassroomStart(CLASSROOM_START_STATE)).toBe(true);
    expect(wantsClassroomStart(null)).toBe(false);
    expect(wantsClassroomStart({ from: '/x' })).toBe(false);
  });
});
