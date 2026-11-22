/**
 * « الامتحان الأبيض » — the FRAME of an exam SITTING (PURE; it names no lesson): a real exam in three phases.
 *   read  the whole subject, a minute to read and underline — nothing can be answered yet;
 *   sit   silence: the student works on PAPER and copies only his final answers; NO verdict, no hint, no sound;
 *   back  the copy handed back: a mark per question (the marking scheme), the model copy, his own paper to check.
 * Its subjects are the lesson's EXERCISE BANK, served as it is (bankSitting.js, owner 2026-11-18) — never generated.
 *
 * A question of a subject is a step of a bank sheet (bankSitting.js › fromBank): its answer has the shape of its
 * `answerType` (`{ choiceId }`, `{ value }`), and a step written on the paper only (`paper`, a « بيّن أن ») has none.
 */
import { answeredBank } from './bankSitting';

export const PASS = 0.8;

/** Is a copy passed? 80 % of the points — and a subject with no points (nothing to mark) is NEVER passed. */
export const sittingPassed = (m, total) => total > 0 && m >= total * PASS;

/** Stars of a sitting: none under 80 % of the points (none at all for a subject with no points); then 1, 2 (≥ 90 %), 3. */
export const sittingStars = (m, total) => (!sittingPassed(m, total) ? 0 : m >= total ? 3 : m >= total * 0.9 ? 2 : 1);

export const allQuestions = (subject) =>
  subject.exercises.flatMap((e) => e.questions.map((q) => ({ ...q, exercise: e.id })));

/**
 * Is the answer complete enough to be read? An empty answer earns 0 and is shown as « لم تُجب » — and an exercise whose
 * every box is empty is « forgotten » (a box of the shape fills its answer only once complete).
 */
export const answered = answeredBank;

/**
 * The exercises left completely empty, as indexes — except the one on screen, which the student sees. A student who hands in
 * with such an exercise has most likely FORGOTTEN it (one exercise per page): the sitting shows it to him once before accepting.
 * An exercise with nothing to copy (every step on paper) is never « forgotten ».
 */
export const forgotten = (subject, answers, onScreen = -1) =>
  subject.exercises
    .map((e, i) => i)
    .filter((i) => {
      const typed = subject.exercises[i].questions.filter((q) => !q.paper);
      return i !== onScreen && typed.length > 0 && typed.every((q) => !answered(q, answers[q.id]));
    });

/** One second of the sitting's clock — PURE: React may call a state updater twice (StrictMode), so it does nothing else. */
export const tick = (left) => Math.max(0, left - 1);

/** Time is up and the copy is still on the desk: it is handed in, as it is — once (`handed`: it is already gone). */
export const timeUp = (phase, left, handed) => phase === 'sit' && left === 0 && !handed;

/** Where the student should be: the share of the points he should have covered when `elapsed` of `total` seconds are gone. */
export const pace = (elapsed, total) => Math.max(0, Math.min(1, elapsed / total));

/** The appreciation written on the copy (none for a subject with no points). */
export const appreciation = (m, total) =>
  total <= 0
    ? ''
    : m >= total * 0.9
      ? 'ممتاز'
      : m >= total * 0.7
        ? 'جيّد'
        : m >= total * 0.5
          ? 'متوسّط: راجع أخطاءك'
          : 'يحتاج إلى عمل: لا تيأس';
