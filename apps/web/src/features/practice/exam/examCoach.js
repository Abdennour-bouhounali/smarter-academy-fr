/**
 * « Le coach du brevet » — the exam coach of the exercise bank (PILOT on the lessons whose pack has `coach`; owner, 2026-11-15).
 * The bank keeps its exam sheet; the coach makes it FEEL like the exam (a hall to enter, silence, pen and paper) and gives the
 * student the choice of how he is helped after a mistake:
 *   guide   « Guide-moi seulement »      the answer is NEVER shown: a question to re-read, the rule, the trap — then he tries again himself;
 *   explain « Explique-moi la solution » the solution is shown, but as a lesson: what is asked, which rule, each line and why, the trap.
 * In both modes a mistake goes to the paper notebook (« Mes erreurs »).
 * PURE logic here (which lessons, the steps of an explanation, the notebook entry); the screens are ExamCoach.jsx.
 */
import { hasPackPart, loadPackPart } from '../../../lessons/lessonPack';

/** A lesson has the coach when ITS pack says which knowledge sheet stands behind each savoir-faire (`lesson.pack.js › coach`). */
export const isCoachLesson = (lessonCode) => hasPackPart(lessonCode, 'coach');
export const MODES = ['guide', 'explain'];
export const modeKey = 'smarter_exam_coach_mode';

export const primaryPoint = (question) => question?.learningPoints?.find((lp) => lp.role === 'primary')?.code ?? question?.learningPoints?.[0]?.code ?? null;

/** The rule behind a question: { title, rule (LaTeX), hook, example (LaTeX), trap, exam } — or null when the lesson has none. */
export async function loadRule(lessonCode, learningPointCode) {
  // the lesson's own knowledge sheets: the rule reminded is the lesson's, never retyped here
  const id = (await loadPackPart(lessonCode, 'coach'))?.[String(learningPointCode ?? '').split('_').pop()];
  if (!id) return null;
  const knowledge = await loadPackPart(lessonCode, 'knowledge');
  const item = Object.values(knowledge.modules).flat().find((it) => it.id === id);
  return item ? { id, title: item.title, ...item.memo } : null;
}

const text = (q) => [q?.lead, q?.statement].filter(Boolean).join(' ');

/**
 * EXPLAIN mode: the solution told as a teacher would — one step at a time.
 * asked → rule → each written line → the result → the trap → the exam tip → « now write it yourself ».
 */
export function explainSteps(question, rule) {
  const steps = [{ kind: 'asked', text: text(question) }];
  if (rule) steps.push({ kind: 'rule', title: rule.title, rule: rule.rule, hook: rule.hook });
  (question?.solution?.lines ?? []).forEach((line, i) => steps.push({ kind: 'line', n: i + 1, text: line }));
  if (question?.solution?.result) steps.push({ kind: 'result', text: question.solution.result });
  if (rule?.trap) steps.push({ kind: 'trap', text: rule.trap });
  if (rule?.exam) steps.push({ kind: 'exam', text: rule.exam });
  steps.push({ kind: 'write' });
  return steps;
}

/** GUIDE mode: three nudges, in order, none of which contains the answer (never a solution line, never the result). */
export function guideSteps(question, rule) {
  const steps = [{ kind: 'reread', text: text(question) }];
  if (rule) steps.push({ kind: 'rule', title: rule.title, rule: rule.rule, hook: rule.hook });
  if (rule?.trap) steps.push({ kind: 'trap', text: rule.trap });
  return steps;
}

/** What the student copies into his paper notebook after a mistake. The answer is in it only in explain mode. */
export function notebookEntry(question, rule, mode, why = '') {
  const lines = [{ label: 'Question', text: text(question) }, { label: 'Mon erreur', text: why, own: true }];
  if (rule) lines.push({ label: 'À retenir', text: rule.hook, rule: rule.rule });
  if (mode === 'explain' && question?.solution?.result) lines.push({ label: 'La bonne réponse', text: question.solution.result, result: true });
  return lines;
}
