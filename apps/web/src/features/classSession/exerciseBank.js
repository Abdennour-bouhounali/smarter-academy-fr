/**
 * « بنك التمارين » as a TEACHER uses it (owner, 2026-11-18: the practice space of the teacher, rebuilt; CLASS_SESSION.md
 * §5quater). A teacher does not « start a level » like a student: he READS the bank (statement, questions, the key), he
 * SHOWS an exercise on the board of his class, he BUILDS a sheet to print. Pure helpers; nothing is recorded anywhere.
 */
import { expectedAnswerText } from '../practice/teacherBank';
import { classSessionPath } from './boardLessons';

/** An exercise is named by its level and its id: « 3:ex-4am-…-l3-002 » — in the address of the board and in the sheet. */
export const refOf = (level, id) => `${level}:${id}`;
export const parseRef = (ref) => {
  const m = /^([1-9]):([A-Za-z0-9_-]+)$/.exec(ref ?? '');
  return m ? { level: Number(m[1]), id: m[2] } : null;
};
/** The exercise on the board of the class: the class session of the lesson, opened on it. */
export const exerciseBoardPath = (lessonCode, level, id) =>
  `${classSessionPath(lessonCode)}?exercice=${encodeURIComponent(refOf(level, id))}`;

/** What a teacher reads on the line of an exercise before opening it. */
export function summaryOf(exercise) {
  const m = exercise.metadata ?? {};
  return {
    id: exercise.id,
    level: exercise.level,
    title: m.title ?? exercise.id,
    badge: m.exam?.badge ?? null,
    official: m.exam?.kind === 'official',
    minutes: m.estimatedMinutes ?? 0,
    questions: exercise.questions?.length ?? 0,
    tags: m.tags ?? [],
  };
}

const LETTERS = ['أ', 'ب', 'ج', 'د', 'هـ', 'و'];
/** The choices of a question as the board writes them: a letter, the text, and whether it is the right one. */
export const choicesOf = (question) =>
  (question.choices ?? []).map((c, i) => ({
    letter: LETTERS[i] ?? String(i + 1),
    content: c.content,
    right: Boolean(c.isCorrect),
  }));

/**
 * THE KEY of a question, for the teacher: the answer (the right choice with its letter, or the expected value), then the
 * lines of the solution and its final equality. A question the student corrects himself has no single answer: its
 * solution is the key. Never empty for a published exercise (tested on the whole bank of the pilot).
 */
export function keyOf(question) {
  const right = choicesOf(question).filter((c) => c.right);
  const answer = right.length
    ? right.map((c) => `${c.letter}) ${c.content}`).join(' ؛ ')
    : expectedAnswerText(question);
  // for a choice the « result » of the solution only repeats the right choice: the answer already says it
  return {
    answer: answer ?? null,
    lines: question.solution?.lines ?? [],
    result: right.length ? null : (question.solution?.result ?? null),
  };
}
export const hasKey = (question) => {
  const k = keyOf(question);
  return Boolean(k.answer || k.lines.length || k.result);
};

/** The sheet of the class: how much work it is. */
export function sheetTotals(exercises) {
  return {
    exercises: exercises.length,
    questions: exercises.reduce((s, e) => s + (e.questions?.length ?? 0), 0),
    minutes: exercises.reduce((s, e) => s + (e.metadata?.estimatedMinutes ?? 0), 0),
  };
}
/** Add or remove an exercise of the sheet; the order is the order the teacher chose them in. */
export const toggleRef = (sheet, ref) => (sheet.includes(ref) ? sheet.filter((x) => x !== ref) : [...sheet, ref]);

/** « تمرين واحد », « تمرينان », « 3 تمارين », « 11 تمرينًا » — and the same for questions. */
export const exercisesWord = (n) =>
  n === 1 ? 'تمرين واحد' : n === 2 ? 'تمرينان' : n <= 10 ? `${n} تمارين` : `${n} تمرينًا`;
export const questionsWord = (n) =>
  n === 1 ? 'سؤال واحد' : n === 2 ? 'سؤالان' : n <= 10 ? `${n} أسئلة` : `${n} سؤالًا`;
