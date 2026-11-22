/**
 * « أتوقّع القاعدة » — la logique du geste qui précède toute règle (pure).
 *
 * Pédagogie (décision du propriétaire, 2026-10-06) : l'élève doit TROUVER la
 * règle lui-même. Après la manipulation et les questions guidées, avant que la
 * règle soit affichée, il l'écrit avec ses mots (MathTextArea) ; dès qu'il a
 * écrit un minimum, il découvre la règle complète. Rien n'est validé : c'est
 * un temps de prédiction, pas une évaluation.
 *
 * Voir docs/architecture/KNOWLEDGE_DEPENDENCY.md § « أتوقّع القاعدة ».
 */

/** Ce que l'élève doit écrire (sans espaces) avant de découvrir la règle. */
export const PREDICT_MIN_CHARS = 8;

/** Les sortes de connaissance qu'on peut CONCLURE ; un nom (vocabulaire) ne se devine pas. */
export const PREDICTABLE_TYPES = new Set(['concepts', 'regles', 'methodes', 'memoriser', 'formules']);

/**
 * Faut-il demander la prédiction avant de montrer cette connaissance ?
 *
 * @param {object} o
 * @param {'new'|'rappel'|'enrichment'} [o.variant]   la brique ; seul « new » pose une règle
 * @param {string}  [o.itemType]        type de l'item (CATEGORIES)
 * @param {boolean} [o.itemPredict]     `predict` de l'item (knowledge.jsx) : false = jamais, true = même hors types
 * @param {boolean} [o.brickPredict]    `predict` de la brique : même sens, prioritaire
 * @param {boolean} [o.freeNavigation]  enseignant / administrateur : jamais
 * @param {boolean} [o.known]           déjà acquise (module validé, ou établie dans la page)
 * @param {boolean} [o.predicted]       l'élève l'a déjà prédite (stockage)
 */
export function shouldPredict({ variant = 'new', itemType, itemPredict, brickPredict, freeNavigation, known, predicted } = {}) {
  const forced = brickPredict ?? itemPredict;
  if (forced === false) return false;
  if (freeNavigation) return false;
  if (known || predicted) return false;
  if (forced === true) return true;
  if (variant !== 'new') return false;
  return PREDICTABLE_TYPES.has(itemType);
}

const keyOf = (lessonId) => `smarter_predictions_${lessonId}`;

/** Les prédictions écrites dans une leçon : { [itemId]: { text, at } }. */
export function readPredictions(storage, lessonId) {
  try {
    const raw = storage.getItem(keyOf(lessonId));
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

/** Enregistre la prédiction de l'élève (locale ; jamais envoyée, jamais notée). */
export function savePrediction(storage, lessonId, itemId, text, now = Date.now()) {
  const all = readPredictions(storage, lessonId);
  all[itemId] = { text, at: now };
  try { storage.setItem(keyOf(lessonId), JSON.stringify(all)); } catch { /* stockage plein : la règle s'affiche quand même */ }
  return all;
}

const esc = (x) => String(x ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * La carte « كرّاسي » d'une règle écrite par l'élève (pilote 2026-11-07) : son titre et son contenu (HTML simple du carnet) —
 * ses mots d'abord, la règle officielle ensuite pour comparer. Pur, testé.
 */
export function ruleNoteOf({ lessonId, itemTitle, itemRule, text }) {
  const title = `قاعدتي: ${itemTitle ?? ''}`.trim().slice(0, 160);
  const mine = esc(text).replace(/\n/g, '<br>');
  const official = itemRule ? `<p><strong>القاعدة:</strong> ${esc(itemRule)}</p>` : '';
  return { title, content: `<p><strong>كتبتُ:</strong> ${mine}</p>${official}`, lessonCode: lessonId, noteType: 'note' };
}
