/**
 * « التحدّي اليومي » — la logique PURE de l'écran (testée).
 *
 * Elle FORMATE ce que le serveur a décidé ; elle ne calcule aucun score,
 * aucun rang, aucune justesse. Le chronomètre affiché est celui du SERVEUR
 * (`startedAt`), corrigé du décalage d'horloge du téléphone.
 */

/** mm:ss — le chronomètre, jamais stressant : pas de dixièmes. */
export function formatClock(ms) {
  const total = Math.max(0, Math.floor((ms ?? 0) / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** « 14,2 » secondes — virgule décimale, comme tout le contenu 4AM. */
export function formatSeconds(ms) {
  if (ms === null || ms === undefined) return '—';
  return (Math.round(ms / 100) / 10).toFixed(1).replace('.', ',');
}

/**
 * Le temps écoulé depuis que le SERVEUR a servi la question, lu sur
 * l'horloge du téléphone mais recalé sur celle du serveur : un téléphone en
 * avance de trois minutes n'affiche pas « 03:00 » à l'ouverture.
 *
 * @returns {(clientNow: number) => number}
 */
export function serverElapsed(startedAt, serverNow, receivedAt) {
  const base = Date.parse(serverNow) - Date.parse(startedAt);
  return (clientNow) => Math.max(0, base + (clientNow - receivedAt));
}

/**
 * Le mouvement de rang — SEULEMENT s'il a vraiment eu lieu (« ↑ 2 »). Jamais
 * inventé : sans rang avant ET après, ou sans changement, rien.
 *
 * @returns {{direction: 'up'|'down', places: number}|null}
 */
export function rankMovement(before, after) {
  if (!Number.isInteger(before) || !Number.isInteger(after) || before === after) return null;
  return before > after ? { direction: 'up', places: before - after } : { direction: 'down', places: after - before };
}

/** Les lignes du détail de score, dans l'ordre de lecture. La pénalité n'apparaît que si elle existe. */
export function scoreParts(score) {
  if (!score) return [];
  const parts = [
    { key: 'accuracy', value: score.base ?? 0 },
    { key: 'speed', value: score.speed ?? 0 },
    { key: 'streak', value: score.streak ?? 0 },
  ];
  if ((score.penalty ?? 0) > 0) parts.push({ key: 'penalty', value: -score.penalty });
  return parts;
}

/** La réponse est-elle saisie ? (Le bouton « تحقّق » ne s'allume qu'alors.) */
export function canSubmit(question, value) {
  if (!question || !value) return false;
  switch (question.answerType) {
    case 'choice': return Boolean(value.choiceId);
    case 'multiChoice': return Array.isArray(value.choiceIds) && value.choiceIds.length > 0;
    default: return typeof value.value === 'string' && value.value.trim() !== '';
  }
}

/**
 * La bonne réponse, en texte à afficher. Pour un QCM, le CONTENU des bons
 * choix (jamais une lettre latine) ; sinon la valeur attendue.
 */
export function correctAnswerText(question, reveal) {
  if (!reveal) return null;
  if (reveal.correctChoiceIds?.length) {
    const byId = new Map((question?.choices ?? []).map((c) => [c.id, c.content]));
    return reveal.correctChoiceIds.map((id) => byId.get(id)).filter(Boolean).join(' ؛ ');
  }
  const value = reveal.correctAnswer;
  if (Array.isArray(value)) return value.join(' ؛ ');
  return value === null || value === undefined ? null : String(value);
}

/**
 * Les pastilles de progression : une par question. L'état ne se lit jamais
 * à la seule couleur — chaque état a son symbole (✓ ✕ ◐ ● ○).
 *
 * @param {number} total
 * @param {Array<{position: number, outcome: string, isCorrect: boolean}>} answered
 * @param {number|null} currentPosition
 */
export function progressDots(total, answered, currentPosition) {
  const byPosition = new Map((answered ?? []).map((a) => [a.position, a]));
  return Array.from({ length: total }, (_, i) => {
    const position = i + 1;
    const a = byPosition.get(position);
    if (a) {
      if (a.isCorrect) return { position, state: 'correct', symbol: '✓' };
      if (a.outcome === 'partially_correct') return { position, state: 'partial', symbol: '◐' };
      return { position, state: 'wrong', symbol: '✕' };
    }
    if (position === currentPosition) return { position, state: 'current', symbol: '●' };
    return { position, state: 'pending', symbol: '○' };
  });
}

/** Les états d'un jour de la frise de série, avec leur symbole (jamais la couleur seule). */
export const STREAK_DAY_SYMBOL = {
  completed: '✓',
  missed: '✕',
  today: '●',
  rest: '–',
  none: '○',
};

/** Le motif d'un refus → sa clé de traduction ; tout motif inconnu → générique. */
const KNOWN_REASONS = ['disabled', 'rest_day', 'window_closed', 'nothing_to_review', 'expired', 'already_answered', 'finished', 'not_found', 'not_opened', 'out_of_order'];
export function reasonKey(reason) {
  return KNOWN_REASONS.includes(reason) ? reason : 'generic';
}

/** Le pourcentage affiché d'un taux 0..1 (« 82 % »), ou « — ». */
export function percent(rate) {
  if (rate === null || rate === undefined) return '—';
  return `${Math.round(rate * 100)} %`;
}
