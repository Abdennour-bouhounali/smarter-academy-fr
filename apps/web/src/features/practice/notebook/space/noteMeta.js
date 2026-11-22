import { getLessonById } from '@smarter-academy/core';
import { contextOfNote, lessonLocationPath } from '../noteContext';

/**
 * Ce qu'une carte de « Mon cahier » doit dire d'une note, dans l'ordre :
 * mon texte, ce qu'elle est (type), d'où elle vient (contexte), quand.
 * Fonctions pures — la présentation vit dans NoteCard.
 */

/** Les types de note, avec leur pictogramme. La couleur suit le sens : rouge = erreur, ambre = question. */
export const NOTE_TYPES = [
  { id: 'note', emoji: '📓', tone: 'slate' },
  { id: 'erreur', emoji: '❌', tone: 'rose' },
  { id: 'question', emoji: '❓', tone: 'amber' },
  { id: 'rappel', emoji: '🔔', tone: 'blue' },
  { id: 'astuce', emoji: '💡', tone: 'emerald' },
  { id: 'exemple', emoji: '🧩', tone: 'violet' },
  { id: 'resume', emoji: '📝', tone: 'indigo' },
];

export const VIEWS = ['all', 'review', 'errors', 'questions', 'pinned', 'archived'];
export const SORTS = ['newest', 'oldest', 'review', 'updated'];

/** Le type EFFECTIF : une note d'exercice qui porte un type d'erreur est une erreur, quoi qu'elle déclare. */
export function typeOf(note) {
  if (note?.isErreur || (note?.noteType === 'note' && note?.mistakeType)) return NOTE_TYPES[1];

  return NOTE_TYPES.find((t) => t.id === note?.noteType) ?? NOTE_TYPES[0];
}

/**
 * Le fil de contexte d'une note : seulement les niveaux qui EXISTENT.
 * @returns {Array<{kind: 'lesson'|'place'|'exercise'|'question', label: string}>}
 */
export function contextTrail(note, t) {
  const ctx = contextOfNote(note, getLessonById(note?.lessonCode));
  const trail = [];
  if (ctx?.lessonTitle) trail.push({ kind: 'lesson', label: ctx.lessonTitle });
  const place = ctx?.learningPointTitle ?? ctx?.moduleTitle;
  if (place) trail.push({ kind: 'place', label: place });
  if (note?.exerciseId) trail.push({ kind: 'exercise', label: exerciseLabel(note, t) });
  if (note?.questionId) trail.push({ kind: 'question', label: t('notebook.space.card.question', { id: questionNumber(note.questionId) }) });

  return trail;
}

/** « q3 » → « 3 » ; tout autre identifiant est montré tel quel. */
export function questionNumber(questionId) {
  const m = /^q(\d+)$/i.exec(String(questionId ?? ''));

  return m ? m[1] : String(questionId ?? '');
}

/** « ex-4am-qasim-…-l2-003 » → « تمرين · المستوى 2 · 3 » ; un identifiant inconnu → « تمرين ». */
export function exerciseLabel(note, t) {
  const m = /-l(\d+)-(\d+)$/.exec(String(note?.exerciseId ?? ''));
  const base = t('notebook.space.card.exercise');
  if (!m) return base;

  return `${base} ${Number(m[2])} · ${t('practice.levelLabel', { level: Number(m[1]) })}`;
}

/**
 * Où « retourner à la source » : le module exact pour une note de leçon, le
 * hub de pratique de la leçon pour une note d'exercice (une question vit
 * dans une séance, qui n'a pas d'adresse stable). `null` si rien n'est routé.
 * @returns {{ to: string, kind: 'lesson'|'exercise' } | null}
 */
export function sourceLinkFor(note, workspaceBase = '/espace') {
  if (!note?.lessonCode) return null;
  // La pratique est une surface d'ÉLÈVE : hors de son espace, une note
  // d'exercice renvoie au sommaire de la leçon (le module, s'il est connu).
  if (note.exerciseId && workspaceBase === '/espace') {
    return { to: `/espace/pratique/${encodeURIComponent(note.lessonCode)}`, kind: 'exercise' };
  }
  const to = lessonLocationPath(contextOfNote(note, getLessonById(note.lessonCode)));

  return to ? { to, kind: 'lesson' } : null;
}

/** Les adresses du cahier dans l'espace du lecteur (`/espace` ou `/enseignant`). */
export function notebookPaths(workspaceBase = '/espace') {
  const root = `${workspaceBase}/cahier`;

  return {
    root,
    review: `${root}/revision`,
    reviewView: `${root}?view=review`,
    note: (id) => `${root}/${encodeURIComponent(id)}`,
    courses: workspaceBase === '/espace' ? '/espace/cours' : `${workspaceBase}/cours`,
  };
}

/** « il y a 2 jours », en arabe, sans bibliothèque. */
export function timeAgo(iso, locale = 'ar') {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diff = (then - Date.now()) / 1000;
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  if (abs < 60) return rtf.format(0, 'minute');
  if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour');
  if (abs < 86400 * 30) return rtf.format(Math.round(diff / 86400), 'day');
  if (abs < 86400 * 365) return rtf.format(Math.round(diff / (86400 * 30)), 'month');

  return rtf.format(Math.round(diff / (86400 * 365)), 'year');
}

export function formatDate(iso, locale = 'ar-DZ') {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return '';
  }
}

/**
 * L'arbre classe → domaine → leçon des notes de l'élève, bâti depuis les
 * facettes du serveur ET le catalogue — jamais une seconde hiérarchie.
 * Les notes sans leçon forment un groupe à part, jamais perdues.
 */
export function curriculumTree(facets) {
  const grades = new Map();
  let orphan = 0;
  for (const f of facets ?? []) {
    if (!f.lessonCode) { orphan += f.count; continue; }
    const lesson = getLessonById(f.lessonCode);
    const gradeKey = lesson?.gradeId ?? '_';
    const chapterKey = lesson?.chapterId ?? '_';
    if (!grades.has(gradeKey)) grades.set(gradeKey, { id: gradeKey, title: lesson?.gradeName ?? gradeKey, chapters: new Map(), count: 0 });
    const g = grades.get(gradeKey);
    g.count += f.count;
    if (!g.chapters.has(chapterKey)) g.chapters.set(chapterKey, { id: chapterKey, title: lesson?.chapterTitle ?? chapterKey, lessons: [], count: 0 });
    const c = g.chapters.get(chapterKey);
    c.count += f.count;
    c.lessons.push({ code: f.lessonCode, title: lesson?.title ?? f.lessonTitle ?? f.lessonCode, count: f.count });
  }

  return {
    grades: [...grades.values()].map((g) => ({ ...g, chapters: [...g.chapters.values()] })),
    orphan,
  };
}
