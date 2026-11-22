/**
 * La logique PURE de la feuille d'examen (ExamSheet.jsx) — sans React ni i18n.
 *
 * Un exercice est rendu comme un sujet de شهادة التعليم المتوسط quand il porte
 * `metadata.exam` (contrat : docs/architecture/EXERCISE_CONTRACT.md § « Présentation
 * examen (BEM) »). Ses questions sont les ÉTAPES du sujet : `step` « 01 », « 02 »…
 * et, dedans, `sub` (ا)(ب)(ج). Plusieurs questions peuvent partager une étape ou
 * une sous-étape (BEM 2024 01 : « 10cm ؟ 18cm ؟ ») : le numéro ne s'affiche
 * qu'à la PREMIÈRE question qui l'ouvre, comme sur le papier.
 */

import { getLessonById } from '@smarter-academy/core';
import EXAM_STYLE_LIST from '../../../../../../content/practice/exam-style.json';

/**
 * Les leçons dont l'espace d'exercices est au format BEM : la liste vient de
 * content/practice/exam-style.json — le fichier qu'on modifie pour BASCULER une
 * leçon, une fois sa banque convertie et auditée. scripts/validate-exercises.mjs
 * vérifie que chaque leçon listée est activée et que TOUS ses exercices portent
 * `metadata.exam` ; une leçon absente garde la page de niveaux classique, même
 * si quelques exercices sont déjà convertis. La page des niveaux (PracticeHub)
 * s'en sert ; le lecteur, lui, lit `metadata.exam` exercice par exercice.
 */
export const EXAM_STYLE_LESSONS = Object.freeze(new Set(EXAM_STYLE_LIST));
export const isExamLesson = (lessonCode) => EXAM_STYLE_LESSONS.has(lessonCode);

/**
 * Le corrigé type d'une question est-il PRÊT à s'ouvrir ? Une étape du sujet peut être
 * coupée en plusieurs questions (« الحد » puis « اتجاه المتراجحة »، « الحل الأصغر » puis
 * « الأكبر »، 10cm ؟ puis 18cm ؟) : le corrigé de l'étape donnerait la réponse de la
 * question suivante. Il reste donc fermé tant qu'une question PLUS LOIN dans le même
 * groupe (même `step`, même `sub`) n'a pas reçu de réponse (déploiement BEM, 2026-10-07).
 *
 * @param {Array<{step?: string, sub?: string}>} questions
 * @param {number} index la question dont on veut ouvrir le corrigé
 * @param {number} answeredThrough l'indice de la dernière question répondue (−1 : aucune)
 */
export function solutionReady(questions = [], index, answeredThrough) {
  const q = questions[index];
  if (!q) return false;
  if (!q.step) return true;
  for (let j = index + 1; j < questions.length; j += 1) {
    const o = questions[j];
    if (o.step === q.step && (o.sub ?? null) === (q.sub ?? null) && j > answeredThrough) return false;
  }
  return true;
}

/** Vrai quand l'exercice se présente comme une feuille d'examen. */
export const isExamExercise = (exercise) => Boolean(exercise?.metadata?.exam);

/**
 * Les marques à afficher devant chaque question.
 *
 * @param {Array<{step?: string, sub?: string}>} questions
 * @returns {Array<{step: string|null, sub: string|null}>} `null` = ne pas répéter
 */
export function stepMarks(questions = []) {
  return questions.map((q, i) => {
    const prev = i > 0 ? questions[i - 1] : null;
    const newStep = !prev || prev.step !== q.step;
    const newSub = Boolean(q.sub) && (newStep || prev.sub !== q.sub);
    return { step: newStep ? (q.step ?? null) : null, sub: newSub ? q.sub : null };
  });
}

/**
 * Le badge de provenance, découpé pour l'isolement bidi : la partie arabe
 * (« على منوال ») reste RTL, « BEM 2015 » est un îlot LTR (`ltr: true`). Le badge
 * d'un examen de fin de فصل (1AM–3AM, « على منوال اختبار الفصل الأول ») est
 * entièrement arabe : aucun îlot LTR (`ltr: false`).
 *
 * @returns {{prefix: string, label: string, kind: string, ltr: boolean}|null}
 */
export function examBadge(exam) {
  if (!exam?.badge) return null;
  const m = /^(.*?)\s*(BEM\s+\d{4})$/.exec(exam.badge);
  if (m) return { prefix: m[1].trim(), label: m[2], kind: exam.kind, ltr: true };
  const term = /^(على منوال)\s+(اختبار الفصل .+)$/.exec(exam.badge);
  if (term) return { prefix: term[1], label: term[2], kind: exam.kind, ltr: false };
  return { prefix: '', label: exam.badge, kind: exam.kind, ltr: false };
}

/**
 * QUEL examen la feuille simule, selon l'année de la leçon (2026-10-14) :
 * la شهادة التعليم المتوسط (BEM) en 4AM, l'examen de fin de فصل en 1AM–3AM
 * (« على منوال اختبار الفصل … », docs/sources/moyen/exams/EXAM_PATTERN.md §6).
 * `n` est le numéro de l'année (« 2 متوسط »). Une leçon inconnue du catalogue
 * garde le BEM — le seul format d'examen qui existait avant 1AM–3AM.
 *
 * @returns {{kind: 'bem'|'term', n: number}}
 */
export function examPaper(lessonCode) {
  const grade = getLessonById(lessonCode)?.gradeId;
  const n = /^([1-4])am$/.exec(grade ?? '')?.[1];
  if (!n) return { kind: 'bem', n: 4 };
  return { kind: Number(n) === 4 ? 'bem' : 'term', n: Number(n) };
}

/**
 * La session d'un exercice TIRÉ d'un sujet officiel (official / excerpt) —
 * affichée « شهادة التعليم المتوسط — دورة 2008 », comme l'en-tête des annales.
 * `null` pour un exercice adapté ou « على منوال » (son badge dit déjà le modèle).
 */
export function examSession(exercise) {
  const exam = exercise?.metadata?.exam;
  const year = exercise?.metadata?.source?.year;
  return (exam?.kind === 'official' || exam?.kind === 'excerpt') && Number.isInteger(year) ? year : null;
}

/** Le « جزء » du sujet : la وضعية الإدماجية est le الجزء الثاني. */
export function examPart(exercise) {
  const part = exercise?.metadata?.source?.part;
  if (part === 1 || part === 2) return part;
  return exercise?.metadata?.exam?.heading === 'الوضعية الإدماجية' ? 2 : 1;
}

/**
 * La TAILLE de la zone de réponse d'une étape (propriétaire, 2026-10-06 : « une
 * petite réponse, un petit champ ; une grande réponse, un grand champ »).
 *  - `proof`  : « بيّن أن » — des lignes réglées qui s'allongent ;
 *  - `choice` : une question fermée — « ☐ نعم ☐ لا » ;
 *  - `short`  : un nombre court (« 135 ») — un trait de quelques centimètres ;
 *  - `medium` : une fraction, un grand nombre, un couple, une courte liste ;
 *  - `long`   : une longue liste (les diviseurs d'un nombre).
 */
export function answerSize(question) {
  if (!question) return 'short';
  const { answerType: type, expectedAnswer: ea } = question;
  if (type === 'selfCheck') return 'proof';
  if (type === 'choice' || type === 'multiChoice') return 'choice';
  if (type === 'point' || type === 'affine' || type === 'interval') return 'medium';
  const text = Array.isArray(ea) ? ea.join(' ؛ ') : String(ea ?? '');
  if (type === 'integerSet') return text.length > 16 ? 'long' : 'medium';
  return text.length <= 5 && !text.includes('/') ? 'short' : 'medium';
}

/**
 * La largeur PAR DÉFAUT du champ, en caractères : celle de la réponse juste
 * (propriétaire, 2026-10-06 : « le minimum est l'espace de la bonne réponse »),
 * plus deux caractères d'aisance — ou celle du texte indicatif (`answerFormat`) s'il est plus long. C'est aussi
 * le MINIMUM : l'élève peut agrandir le champ (poignée), jamais le rendre plus petit que cela. Les deux boutons de
 * MathLive (clavier, menu) s'y AJOUTENT en CSS (`--answer-chrome`, index.css).
 */
export function answerChars(question) {
  const ea = question?.expectedAnswer;
  const text = Array.isArray(ea) ? ea.join(' ؛ ') : String(ea ?? '');
  // Le champ vide affiche `answerFormat` (« عدد طبيعي ») : il doit tenir en entier (propriétaire, 2026-10-08).
  const format = String(question?.answerFormat ?? '');
  return Math.max(4, text.length + 2, format.length);
}

/**
 * Le TEMPS d'une étape, en secondes (propriétaire, 2026-10-06 : « chaque
 * question a son propre temps ») — `question.timeSeconds` dans le contenu ;
 * à défaut, le temps conseillé de l'exercice partagé entre ses questions.
 */
export function stepSeconds(question, exercise) {
  if (Number.isInteger(question?.timeSeconds)) return question.timeSeconds;
  const total = (exercise?.metadata?.estimatedMinutes ?? 3) * 60;
  const count = exercise?.questions?.length || 1;
  return Math.max(60, Math.round(total / count / 30) * 30);
}

/** « 02:45 » — minutes et secondes sur deux chiffres. */
export function formatClock(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

/** L'état du chrono : `running`, `warning` (dernier cinquième), `over` (dépassé). */
export function clockState(elapsed, limit) {
  if (elapsed > limit) return 'over';
  if (limit - elapsed <= Math.max(15, limit * 0.2)) return 'warning';
  return 'running';
}

/** L'état d'une étape par rapport à la question courante. */
export const stepState = (index, current) => (index < current ? 'done' : index === current ? 'current' : 'upcoming');
