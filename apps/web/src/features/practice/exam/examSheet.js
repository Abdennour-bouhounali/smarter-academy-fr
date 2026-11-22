/**
 * La logique PURE de la feuille d'examen (ExamSheet.jsx) — sans React ni i18n.
 *
 * Un exercice est rendu comme un sujet de brevet quand il porte `metadata.exam` (contrat :
 * docs/architecture/EXERCISE_CONTRACT.md § « The exam sheet »). Ses questions sont les ÉTAPES du
 * sujet : `step` « 01 », « 02 »… (affichées « 1 », « 2 ») et, dedans, `sub` a) b) c). Plusieurs
 * questions peuvent partager une étape ou une sous-étape (« 10 cm ? » puis « 18 cm ? ») : le numéro
 * ne s'affiche qu'à la PREMIÈRE question qui l'ouvre, comme sur le papier.
 *
 * Le FORMAT des données (`step` sur deux chiffres, `points` « 02,5 », `badge` « BEM 2015 », `source.type: "bem"`)
 * est encore celui de la banque algérienne : il n'est pas renommé ici — le contrat de la banque française
 * (plan §5, 2G) le fixera. Ce module le LIT et l'affiche à la française.
 */

import { ACTIVE_GRADE_IDS, getLessonById } from '@smarter-academy/core';
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
 * coupée en plusieurs questions (la borne puis le sens d'une inéquation, la plus petite
 * solution puis la plus grande, 10 cm ? puis 18 cm ?) : le corrigé de l'étape donnerait la réponse de la
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
 * Le badge de provenance, À DIRE en français. Le texte du badge dans les données n'est pas affiché tel quel :
 * seule son ANNÉE est lue (« BEM 2015 » → 2015), et `kind` dit de quoi il s'agit :
 *  - `official`, `excerpt` → `model: 'official'` : « Brevet 2015 » ;
 *  - `modelled` avec une année → `model: 'modelled'` : « Sur le modèle du brevet 2015 » ;
 *  - `modelled` sans année (un sujet de contrôle d'une autre classe) → `model: 'term'` ;
 *  - autre chose → `model: 'raw'`, le texte du badge tel quel (`label`).
 *
 * @returns {{kind: string, model: 'official'|'modelled'|'term'|'raw', year: number|null, label: string}|null}
 */
export function examBadge(exam) {
  if (!exam?.badge) return null;
  const found = /(\d{4})\s*$/.exec(exam.badge)?.[1];
  const year = found ? Number(found) : null;
  const label = exam.badge;
  if ((exam.kind === 'official' || exam.kind === 'excerpt') && year) return { kind: exam.kind, model: 'official', year, label };
  if (exam.kind === 'modelled') return { kind: exam.kind, model: year ? 'modelled' : 'term', year, label };
  return { kind: exam.kind, model: 'raw', year, label };
}

/**
 * QUEL examen la feuille simule, selon le niveau de la leçon : le brevet (`kind: 'bem'`, nom de donnée gardé) pour la
 * 3e, un contrôle (`term`) pour les autres niveaux. `n` est le NIVEAU affiché (« 6e »… « 3e ») — c'est la variable
 * `{{n}}` des textes `practice.exam.paper.levelValue` et `practice.exam.nav.subject`. Une leçon inconnue du
 * catalogue garde le brevet.
 *
 * @returns {{kind: 'bem'|'term', n: string}}
 */
export function examPaper(lessonCode) {
  const rank = ACTIVE_GRADE_IDS.indexOf(getLessonById(lessonCode)?.gradeId) + 1;
  const last = ACTIVE_GRADE_IDS.length;
  if (!rank) return { kind: 'bem', n: ACTIVE_GRADE_IDS[last - 1] };
  return { kind: rank === last ? 'bem' : 'term', n: ACTIVE_GRADE_IDS[rank - 1] };
}

/**
 * La session d'un exercice TIRÉ d'un sujet officiel (official / excerpt) —
 * affichée « Session : 2008 », comme l'en-tête des annales.
 * `null` pour un exercice adapté ou « sur le modèle » (son badge dit déjà le modèle).
 */
export function examSession(exercise) {
  const exam = exercise?.metadata?.exam;
  const year = exercise?.metadata?.source?.year;
  return (exam?.kind === 'official' || exam?.kind === 'excerpt') && Number.isInteger(year) ? year : null;
}

/**
 * La PARTIE du sujet : 1 ou 2, lue dans `source.part`, sinon dans un intitulé « Partie 2 ». (Dans les données
 * algériennes, la partie 2 était la « situation d'intégration » ; au brevet, la partie 2 est celle des problèmes.)
 */
export function examPart(exercise) {
  const part = exercise?.metadata?.source?.part;
  if (part === 1 || part === 2) return part;
  return /^partie\s*2\b/iu.test(String(exercise?.metadata?.exam?.heading ?? '')) ? 2 : 1;
}

/** Le numéro d'étape tel qu'il s'affiche : « 01 » → « 1 » (la donnée garde ses deux chiffres). */
export const stepLabel = (step) => String(step ?? '').replace(/^0+(?=\d)/, '');

/**
 * Le barème d'un exercice tel qu'il s'affiche, et le nombre qui accorde « point » / « points » :
 * « 02,5 » → { label: '2,5', count: 2.5 } — « (2,5 points) » ; « 01 » → « (1 point) ».
 */
export function examPoints(points) {
  const label = String(points ?? '').trim().replace(/^0+(?=\d)/, '');
  const count = Number(label.replace(',', '.'));
  return { label, count: Number.isFinite(count) ? count : 0 };
}

/**
 * Un résultat de corrigé ÉCRIT EN MOTS (« oui », « 4 fois ») plutôt qu'une formule : il s'affiche en texte,
 * KaTeX ne compose pas une phrase. Une commande LaTeX (`\dfrac`, `\text`) ne compte pas comme un mot.
 */
export function resultIsWords(text) {
  const plain = String(text ?? '').replace(/\\[a-zA-Z]+/g, ' ');
  return /\p{L}{3,}/u.test(plain.replace(/\b(?:PGCD|PPCM)\b/g, ' '));
}

/**
 * La TAILLE de la zone de réponse d'une étape (propriétaire, 2026-10-06 : « une
 * petite réponse, un petit champ ; une grande réponse, un grand champ »).
 *  - `proof`  : « Démontrer que » — des lignes réglées qui s'allongent ;
 *  - `choice` : une question fermée — « ☐ oui ☐ non » ;
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
  const text = Array.isArray(ea) ? ea.join(' ; ') : String(ea ?? '');
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
  const text = Array.isArray(ea) ? ea.join(' ; ') : String(ea ?? '');
  // Le champ vide affiche `answerFormat` (« Nombre entier ») : il doit tenir en entier (propriétaire, 2026-10-08).
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
