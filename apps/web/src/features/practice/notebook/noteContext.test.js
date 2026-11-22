import { describe, it, expect } from 'vitest';
import {
  buildLessonLocation, contextOfNote, contextPayload, contextLabels, lessonLocationPath, sourceTypeOf,
} from './noteContext';

const CONFIG = {
  id: 'qasim-mushtarak-akbar',
  title: 'القاسم المشترك الأكبر',
  modules: [
    { number: 1, slug: 'baqat', path: '/courses/x/qasim-mushtarak-akbar/baqat', title: 'نشاط 4', teachesLearningPointIds: ['P1', 'P3'] },
    { number: 4, slug: 'itqan', path: '/courses/x/qasim-mushtarak-akbar/itqan', title: 'إتقان', teachesLearningPointIds: ['P2'] },
    { number: 5, slug: 'x', path: '/courses/x/qasim-mushtarak-akbar/x', title: 'بلا نقاط' },
  ],
};
const CATALOGUE = {
  path: '/courses/x/qasim-mushtarak-akbar',
  title: 'القاسم المشترك الأكبر',
  learningPoints: [{ id: 'P1', title: 'نقطة 1' }, { id: 'P2', title: 'نقطة 2' }],
};

describe('la position dans la leçon', () => {
  it('accueil : la leçon, et rien d’autre', () => {
    const ctx = buildLessonLocation(CONFIG, null, CATALOGUE);
    expect(ctx).toMatchObject({ lessonCode: 'qasim-mushtarak-akbar', moduleNumber: null, learningPointCode: null, exerciseId: null });
    expect(sourceTypeOf(ctx)).toBe('lesson');
  });

  it('module à plusieurs points : le module, aucun point choisi à la place de l’élève', () => {
    const ctx = buildLessonLocation(CONFIG, CONFIG.modules[0], CATALOGUE);
    expect(ctx.moduleNumber).toBe(1);
    expect(ctx.moduleTitle).toBe('نشاط 4');
    expect(ctx.learningPointCode).toBeNull();
    expect(sourceTypeOf(ctx)).toBe('lesson_module');
  });

  it('module à un seul point : le point est le contexte, avec son titre', () => {
    const ctx = buildLessonLocation(CONFIG, CONFIG.modules[1], CATALOGUE);
    expect(ctx.learningPointCode).toBe('P2');
    expect(ctx.learningPointTitle).toBe('نقطة 2');
    expect(ctx.moduleNumber).toBe(4);
    expect(sourceTypeOf(ctx)).toBe('learning_point');
  });

  it('module sans points déclarés : pas d’invention', () => {
    expect(buildLessonLocation(CONFIG, CONFIG.modules[2]).learningPointCode).toBeNull();
  });

  it('sans config, pas de contexte', () => {
    expect(buildLessonLocation(null)).toBeNull();
  });
});

describe('ce qui part au serveur', () => {
  it('les codes seulement — jamais les titres ni les chemins', () => {
    const ctx = buildLessonLocation(CONFIG, CONFIG.modules[1], CATALOGUE);
    expect(contextPayload(ctx)).toEqual({ lessonCode: 'qasim-mushtarak-akbar', learningPointCode: 'P2', moduleNumber: 4 });
  });

  it('une question garde tout le contexte au-dessus d’elle', () => {
    const ctx = { lessonCode: 'l', learningPointCode: 'lp', exerciseId: 'ex', questionId: 'q1', lessonTitle: 'T' };
    expect(contextPayload(ctx)).toEqual({ lessonCode: 'l', learningPointCode: 'lp', exerciseId: 'ex', questionId: 'q1' });
    expect(sourceTypeOf(ctx)).toBe('exercise_question');
    expect(sourceTypeOf({ ...ctx, questionId: null })).toBe('exercise');
  });

  it('vide → objet vide', () => {
    expect(contextPayload(null)).toEqual({});
  });
});

describe('le contexte d’une note enregistrée', () => {
  const note = {
    lessonCode: 'qasim-mushtarak-akbar', lessonTitle: 'القاسم', moduleNumber: 2, moduleTitle: 'معارف', moduleSlug: 'maarif',
    learningPointCode: 'P1', learningPointTitle: null, exerciseId: null, questionId: null,
  };

  it('est celui de la CRÉATION, lu dans la note, chemins résolus depuis le catalogue', () => {
    const ctx = contextOfNote(note, CATALOGUE);
    expect(ctx.moduleNumber).toBe(2);
    expect(ctx.learningPointTitle).toBe('نقطة 1'); // repli catalogue quand l'API ne donne pas le titre
    expect(lessonLocationPath(ctx)).toBe('/courses/x/qasim-mushtarak-akbar/maarif');
  });

  it('sans module connu : retour à la leçon ; sans leçon routée : nulle part', () => {
    expect(lessonLocationPath(contextOfNote({ ...note, moduleSlug: null, moduleNumber: null }, CATALOGUE))).toBe('/courses/x/qasim-mushtarak-akbar');
    expect(lessonLocationPath(contextOfNote(note, null))).toBeNull();
    expect(lessonLocationPath(null)).toBeNull();
  });

  it('les libellés : la leçon, puis l’endroit le plus précis titré', () => {
    expect(contextLabels(contextOfNote(note, CATALOGUE))).toEqual({ lesson: 'القاسم', place: 'نقطة 1' });
    expect(contextLabels(contextOfNote({ ...note, learningPointCode: null }, CATALOGUE))).toEqual({ lesson: 'القاسم', place: 'معارف' });
    expect(contextLabels(contextOfNote({ lessonCode: 'l', lessonTitle: 'L' }))).toEqual({ lesson: 'L', place: null });
    expect(contextLabels(null)).toEqual({ lesson: null, place: null });
  });
});
