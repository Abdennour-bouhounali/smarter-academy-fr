import { resolveModuleNavigation } from '../classroom/classroomUnits';

/**
 * LA PRÉSENTATION D'UN TEST — mathématiques pures, sans DOM ni React.
 *
 * Le pendant, pour les deux moteurs de test (PrerequisiteDiagnostic, BossFinal),
 * de ce que `classroom/classroomUnits.js` est à un module de contenu : l'ordre
 * des questions, la navigation السابق/التالي, et l'ÉTAT de chaque question —
 * dérivés de ce que le moteur possède déjà, sans rien inventer et sans
 * dupliquer le barème.
 *
 * LA DISTINCTION QUI FONDE TOUT LE RESTE (brief §13). « Répondu » n'est pas
 * « juste », et « juste » n'est pas « révélé ». Quatre états, jamais
 * confondus :
 *
 *   unanswered   aucune réponse
 *   answered     une réponse est posée, et RIEN n'en est dit
 *   correct      révélée, et juste
 *   incorrect    révélée, et fausse
 *
 * Un test silencieux (la page élève d'aujourd'hui) vit entièrement dans les
 * deux premiers états ; la révélation ne fait que faire passer les questions
 * aux deux suivants. C'est pourquoi la même fonction sert au « تحقّق » d'UNE
 * question et au « كشف النتائج » de toutes : révéler tout, c'est révéler
 * chaque question — jamais un second correcteur.
 *
 * CE MODULE NE SAIT PAS CE QU'EST UNE BONNE RÉPONSE. Chaque moteur garde son
 * propre `isCorrect` (l'index `correct` du QCM, le prédicat d'une question
 * `custom`) et le passe ici. Le barème, l'evidence et la persistance restent
 * chez lui : on ne décide ici que de ce qui est MONTRÉ.
 */

/** Les quatre états d'une question. */
export const QUESTION_STATE = Object.freeze({
  UNANSWERED: 'unanswered',
  ANSWERED: 'answered',
  CORRECT: 'correct',
  INCORRECT: 'incorrect',
});

/**
 * L'état d'UNE question, à partir des trois faits que le moteur connaît.
 *
 * @param {{answered:boolean, revealed:boolean, correct:boolean}} q
 * @returns {'unanswered'|'answered'|'correct'|'incorrect'}
 */
export function questionState({ answered, revealed, correct }) {
  if (!revealed) return answered ? QUESTION_STATE.ANSWERED : QUESTION_STATE.UNANSWERED;
  return correct ? QUESTION_STATE.CORRECT : QUESTION_STATE.INCORRECT;
}

/**
 * L'état de CHAQUE question d'un test.
 *
 * Une question sans réponse peut parfaitement être révélée : au « كشف
 * النتائج », une question laissée vide est révélée FAUSSE — c'est ce que fait
 * déjà la correction du test final (`pick == null` → « (بدون إجابة) »).
 *
 * @param {Array<{id:string}>} questions
 * @param {{answers:object, revealed:object|true, isCorrect:(q:object, answer:any)=>boolean}} p
 *   `revealed` : une carte { [id]: true }, ou `true` pour « tout est révélé »
 *   (le test soumis en une fois, la tentative rechargée).
 * @returns {Array<{id:string, index:number, answered:boolean, revealed:boolean,
 *                  correct:boolean, state:string}>}
 */
export function testQuestionStates(questions, { answers = {}, revealed = {}, isCorrect }) {
  const all = revealed === true;
  return (questions ?? []).map((q, index) => {
    const answer = answers[q.id];
    const answered = answer != null;
    const isRevealed = all || Boolean(revealed?.[q.id]);
    // On n'interroge le correcteur QUE pour ce qui est révélé : une question
    // silencieuse ne doit pas pouvoir fuiter sa justesse par un état calculé.
    const correct = isRevealed ? Boolean(isCorrect?.(q, answer)) : false;
    return { id: q.id, index, answered, revealed: isRevealed, correct, state: questionState({ answered, revealed: isRevealed, correct }) };
  });
}

/**
 * Révéler TOUTES les questions — « كشف النتائج ».
 *
 * Le même geste que révéler chacune, écrit une fois : la carte que rend cette
 * fonction est exactement celle qu'on obtiendrait en appelant `revealOne` sur
 * chaque question. Aucun barème ici : le moteur note comme il notait déjà.
 *
 * @param {Array<{id:string}>} questions
 * @returns {object} { [id]: true }
 */
export function revealAll(questions) {
  const next = {};
  for (const q of questions ?? []) next[q.id] = true;
  return next;
}

/** Révéler UNE question — « تحقّق من الإجابة ». */
export function revealOne(revealed, id) {
  return { ...revealed, [id]: true };
}

/** Toutes les questions sont-elles révélées ? (le test est en revue) */
export function allRevealed(questions, revealed) {
  if (revealed === true) return true;
  const list = questions ?? [];
  return list.length > 0 && list.every((q) => Boolean(revealed?.[q.id]));
}

/** Ramène un index de question dans [0, count-1] (0 quand il n'y a rien). */
export function clampQuestion(index, count) {
  if (!(count > 0)) return 0;
  const i = Number.isFinite(index) ? Math.trunc(index) : 0;
  return Math.min(count - 1, Math.max(0, i));
}

/**
 * Les gestes السابق / التالي d'un test présenté.
 *
 * Les questions se parcourent comme les unités d'un module : aux deux bouts,
 * en session LEÇON, « السابق » et « التالي » mènent au module voisin. Une
 * leçon projetée se traverse d'un bout à l'autre du même geste, et un test ne
 * doit pas être le seul endroit où la barre se tait.
 *
 * CE QUI PROTÈGE LE TEST N'EST DONC PAS UN BOUTON MANQUANT, mais la place de
 * « كشف النتائج » : le geste final est DANS le contenu, large, sous la
 * dernière question — là où le regard est — et non sur la barre du bas, où il
 * entrerait en concurrence avec « التالي ». Un enseignant ne peut pas le
 * manquer, et personne ne perd les réponses de la classe pour un clic de trop.
 *
 * @param {{index:number, count:number, goTo:(i:number)=>void,
 *          lessonPrevious?:Function|null, lessonNext?:Function|null}} p
 * @returns {{onPrevious?:Function, onNext?:Function}} — `undefined` = pas de bouton
 */
export function resolveTestNavigation({
  index, count, goTo, lessonPrevious = null, lessonNext = null,
}) {
  // Les questions d'un test se parcourent EXACTEMENT comme les unités d'un
  // module : même règle aux deux bouts, même composition avec la session
  // leçon. On délègue donc, plutôt que de tenir une seconde copie qui
  // divergerait le jour où la navigation d'un module changera.
  return resolveModuleNavigation({ index, count, goTo, lessonPrevious, lessonNext });
}

/**
 * Le décompte affiché en revue : combien de questions révélées sont justes.
 * Le SCORE du test reste celui du moteur (points du diagnostic, evidence du
 * test final) ; ceci ne sert qu'à l'en-tête de la présentation.
 *
 * @param {Array<{revealed:boolean, correct:boolean}>} states
 */
export function revealedTally(states) {
  const list = states ?? [];
  const revealed = list.filter((s) => s.revealed);
  return {
    revealed: revealed.length,
    correct: revealed.filter((s) => s.correct).length,
    total: list.length,
    answered: list.filter((s) => s.answered).length,
  };
}

/**
 * L'ORDRE D'AFFICHAGE des options d'une question à choix, stable et propre à
 * la question : une permutation de 0..n−1 tirée de son `id`.
 *
 * Pourquoi : les auteurs écrivent la bonne réponse en premier — 36 des 45
 * questions des défis finaux de l'unité 1 avaient `correct: 0` (audit du
 * 2026-09-29), si bien que cliquer toujours la première option valait ~80 %
 * sur la seule source de preuve de maîtrise.
 *
 * Ce n'est qu'un ordre d'AFFICHAGE : l'indice choisi reste celui de l'auteur
 * (`ChoiceGrid` rend `options[order[k]]` et renvoie `order[k]`), donc la
 * preuve (`picked`), le registre d'items et le juge serveur sont inchangés.
 * Déterministe (même ordre au tableau et chez l'élève, d'un chargement à
 * l'autre) et sans aléa : un hash FNV-1a de l'id amorce un mulberry32.
 *
 * @param {string} id
 * @param {number} n
 * @returns {number[]}
 */
export function optionOrder(id, n) {
  const order = Array.from({ length: Math.max(0, n | 0) }, (_, i) => i);
  if (order.length < 2) return order;
  let h = 0x811c9dc5;
  for (const ch of String(id ?? '')) { h ^= ch.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; }
  let a = h;
  const rand = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}
