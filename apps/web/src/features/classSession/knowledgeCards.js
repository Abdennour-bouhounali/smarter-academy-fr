/**
 * « la fiche de connaissances » ON THE BOARD (owner, 2026-11-18: « the student's card must be able to be presented in
 * the classroom… used for a quick revision with all the class… provide the direct link for the teacher to the previous
 * lesson connected with the new savoir-faire »; CLASS_SESSION.md §5quinquies). The cards are the lesson's OWN knowledge
 * (`LESSON_KNOWLEDGE` of the lesson, the single source the student's knowledge card reads) — imported, never retyped.
 * Pure helpers.
 */
import { getAllGrades, getLessonPath } from '@smarter-academy/core';
import { reviewLinksForLesson } from '@smarter-academy/core/curriculum/fr/net/learningNet.js';
import { hasPackPart, loadPackPart } from '../../lessons/lessonPack';

/** Has the lesson knowledge sheets to show? It says so in its own pack (`lesson.pack.js › knowledge`). */
export const hasKnowledgeCards = (lessonCode) => hasPackPart(lessonCode, 'knowledge');
/** The cards of a lesson, ready for the board — an empty list when it has none. */
export const loadKnowledgeCards = (lessonCode) =>
  loadPackPart(lessonCode, 'knowledge').then((knowledge) => (knowledge ? cardsOf(knowledge) : []));

const math = (m) => (m ? `$${m}$` : null);

/**
 * One card per knowledge item that has a memo sheet, in the order of the lesson: the rule (a formula), the sentence that
 * makes it stick, an example, the trap, and what to do in the exam.
 */
export function cardsOf(knowledge) {
  return Object.entries(knowledge?.modules ?? {})
    .sort(([a], [b]) => Number(a) - Number(b))
    .flatMap(([module, items]) =>
      items
        .filter((it) => it.memo)
        .map((it) => ({
          id: it.id,
          module: Number(module),
          title: it.title,
          rule: math(it.memo.rule),
          hook: it.memo.hook ?? null,
          example: math(it.memo.example),
          trap: it.memo.trap ?? null,
          exam: it.memo.exam ?? null,
        })),
    );
}

const VIA = { requires: 'S’appuie sur', extends: 'Prolonge', consolidates: 'Consolide' };
/** A grade's name as the catalogue writes it — never a local table. */
const GRADE = Object.fromEntries(getAllGrades().map((g) => [g.id, g.name]));
/**
 * The earlier lessons the new savoir-faire is connected with (the learning net), core links first — each with its direct
 * link when the lesson is published. For the teacher: one tap to go and look at what the class learnt before.
 */
export function earlierLessons(lessonCode) {
  return reviewLinksForLesson(lessonCode)
    .map((g) => {
      const item = g.items[0] ?? {};
      // A stub prerequisite (its grade has no lesson yet): the competence itself, no lesson, no link.
      const grade = g.lesson?.grade ?? g.noLessonInGrade ?? item.grade;
      return {
        code: g.lesson?.code ?? null,
        title: g.lesson?.title ?? item.text ?? null,
        grade: GRADE[grade] ?? grade,
        via: VIA[item.via] ?? VIA.requires,
        core: item.weight !== 'support',
        what: item.text ?? null,
        path: g.lesson?.status === 'available' ? (getLessonPath(g.lesson.code) ?? null) : null,
      };
    })
    .sort((a, b) => Number(b.core) - Number(a.core));
}
