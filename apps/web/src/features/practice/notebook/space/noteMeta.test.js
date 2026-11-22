import { describe, it, expect, vi } from 'vitest';
import {
  typeOf, questionNumber, exerciseLabel, sourceLinkFor, curriculumTree, timeAgo, notebookPaths,
} from './noteMeta';

// The catalogue is empty until the French lessons: the lessons of the neutral catalogue fixture stand in for it.
vi.mock('@smarter-academy/core', async (importOriginal) => {
  const real = await importOriginal();
  const { fixtureLevels } = await import('../../../../components/student/test/catalogueFixture.js');
  const lessons = fixtureLevels.flatMap((l) => l.grades).flatMap((g) => g.chapters).flatMap((c) => c.lessons);
  return { ...real, getLessonById: (code) => lessons.find((l) => l.id === code) ?? null };
});

const t = (key, opts) => {
  if (key === 'notebook.space.card.exercise') return 'Exercice';
  if (key === 'practice.levelLabel') return `Niveau ${opts.level}`;
  if (key === 'notebook.space.card.question') return `Question ${opts.id}`;
  return key;
};

describe('ce qu’une carte dit d’une note', () => {
  it('le type effectif : un type d’erreur fait une erreur, quoi que la note déclare', () => {
    expect(typeOf({ noteType: 'note', mistakeType: 'signe' }).id).toBe('erreur');
    expect(typeOf({ noteType: 'note', isErreur: true }).id).toBe('erreur');
    expect(typeOf({ noteType: 'question' }).id).toBe('question');
    expect(typeOf({ noteType: 'inconnu' }).id).toBe('note');
    expect(typeOf(null).id).toBe('note');
  });

  it('les identifiants de contenu deviennent lisibles, sans rien inventer', () => {
    expect(questionNumber('q3')).toBe('3');
    expect(questionNumber('Q12')).toBe('12');
    expect(questionNumber('autre')).toBe('autre');
    expect(exerciseLabel({ exerciseId: 'ex-4am-lecon-a-l2-003' }, t)).toBe('Exercice 3 · Niveau 2');
    expect(exerciseLabel({ exerciseId: 'mystere' }, t)).toBe('Exercice');
  });

  it('la source : le hub de pratique pour un exercice, la leçon (ou rien) sinon', () => {
    expect(sourceLinkFor({ lessonCode: 'lecon-a', exerciseId: 'ex-1' })).toEqual({ to: '/espace/pratique/lecon-a', kind: 'exercise' });
    // Hors de l'espace élève (l'enseignant), la pratique n'existe pas : la note d'exercice renvoie à la leçon.
    expect(sourceLinkFor({ lessonCode: 'lecon-a', exerciseId: 'ex-1' }, '/enseignant')?.kind).toBe('lesson');
    const lesson = sourceLinkFor({ lessonCode: 'lecon-a', moduleSlug: 'baqat', moduleNumber: 1 });
    expect(lesson.kind).toBe('lesson');
    expect(lesson.to.endsWith('/lecon-a/baqat')).toBe(true);
    expect(sourceLinkFor({ lessonCode: 'inconnue-au-catalogue' })).toBeNull();
    expect(sourceLinkFor({})).toBeNull();
  });

  it('l’arbre du menhaj vient des facettes ET du catalogue ; les notes sans leçon ne sont pas perdues', () => {
    const tree = curriculumTree([
      { lessonCode: 'lecon-a', lessonTitle: 'x', count: 3 },
      { lessonCode: 'lecon-c', lessonTitle: 'y', count: 1 },
      { lessonCode: null, lessonTitle: null, count: 2 },
    ]);
    expect(tree.orphan).toBe(2);
    expect(tree.grades).toHaveLength(1);
    expect(tree.grades[0].count).toBe(4);
    const lessons = tree.grades[0].chapters.flatMap((c) => c.lessons).map((l) => l.code);
    expect(lessons).toEqual(expect.arrayContaining(['lecon-a', 'lecon-c']));
  });

  it('« il y a… » en arabe, robuste aux dates absentes', () => {
    expect(timeAgo(null)).toBe('');
    expect(timeAgo('pas une date')).toBe('');
    expect(timeAgo(new Date(Date.now() - 2 * 86400 * 1000).toISOString())).toMatch(/il y a 2 jours|avant-hier/);
    expect(timeAgo(new Date(Date.now() - 2 * 86400 * 1000).toISOString())).not.toMatch(/[\u0600-\u06FF]/);
  });
});

describe('notebookPaths — le cahier dans l’espace du lecteur', () => {
  it('suit la racine de l’espace, /espace par défaut', () => {
    expect(notebookPaths()).toMatchObject({ root: '/espace/cahier', review: '/espace/cahier/revision', courses: '/espace/cours' });
    expect(notebookPaths('/enseignant')).toMatchObject({ root: '/enseignant/cahier', review: '/enseignant/cahier/revision', reviewView: '/enseignant/cahier?view=review', courses: '/enseignant/cours' });
    expect(notebookPaths('/enseignant').note(12)).toBe('/enseignant/cahier/12');
  });
});
