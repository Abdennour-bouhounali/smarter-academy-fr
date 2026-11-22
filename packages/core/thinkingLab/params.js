/**
 * « مختبر التفكير » — les nombres PROPRES à chaque élève (`params`).
 *
 * Une réponse copiée dans un groupe WhatsApp ne vaut rien : chaque élève reçoit
 * un tuple de valeurs choisi DÉTERMINISTIQUEMENT par
 *   fnv1a32(`${userId}:${challengeId}:${edition}`) mod (nombre de tuples).
 * Le serveur (phase 1, miroir PHP) remplit l'énoncé ; la fixture partagée
 * content/thinking-lab/_fixtures/params.json fige le choix des deux côtés.
 *
 * Ordre des tuples : variables triées par nom, la DERNIÈRE varie le plus vite.
 */

/** FNV-1a 32 bits sur les octets UTF-8 (en PHP : `($h * 16777619) & 0xFFFFFFFF`). */
export function fnv1a32(text) {
  let h = 0x811c9dc5;
  for (const byte of new TextEncoder().encode(String(text))) {
    h ^= byte;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** Noms des variables, triés. */
function paramNames(params) {
  return Object.keys(params?.vars ?? {}).sort();
}

/** Nombre de tuples possibles (1 sans `params`). */
export function tupleCount(params) {
  return paramNames(params).reduce((n, name) => n * params.vars[name].length, 1);
}

/** Le tuple d'indice `index` (base mixte, dernière variable la plus rapide). */
function tupleAt(params, index) {
  const names = paramNames(params);
  const values = {};
  let rest = index;
  for (let i = names.length - 1; i >= 0; i--) {
    const list = params.vars[names[i]];
    values[names[i]] = list[rest % list.length];
    rest = Math.floor(rest / list.length);
  }
  return values;
}

/** Tous les tuples, dans l'ordre des indices (l'oracle les parcourt tous). */
export function allTuples(params) {
  return Array.from({ length: tupleCount(params) }, (_, i) => tupleAt(params, i));
}

/** Le tuple d'un élève pour un défi dans une édition. */
export function pickParams(params, { userId, challengeId, edition }) {
  const size = tupleCount(params);
  const index = size === 1 ? 0 : fnv1a32(`${userId}:${challengeId}:${edition}`) % size;
  return { index, values: tupleAt(params, index) };
}

/**
 * Remplit les `{nom}` d'un texte. `asExpression` entoure chaque valeur de
 * parenthèses (une valeur négative dans « {a}^2 » reste juste). Un `{nom}`
 * qui n'est pas une variable déclarée est laissé tel quel.
 */
export function fillTemplate(text, values, { asExpression = false } = {}) {
  if (typeof text !== 'string') return text;
  return text.replace(/\{([a-zA-Z][a-zA-Z0-9_]*)\}/g, (whole, name) => {
    if (!Object.prototype.hasOwnProperty.call(values, name)) return whole;
    return asExpression ? `(${values[name]})` : String(values[name]);
  });
}

/** Les champs d'une réponse qui sont des EXPRESSIONS (remplis entre parenthèses). */
const EXPRESSION_KEYS = new Set(['value', 'scaleWith']);

/** Copie profonde d'un défi avec ses `{nom}` remplis (énoncé, figure, clés, relecture, réponses…). */
export function fillChallenge(challenge, values) {
  const walk = (node, key) => {
    if (typeof node === 'string') return fillTemplate(node, values, { asExpression: EXPRESSION_KEYS.has(key) });
    if (Array.isArray(node)) return node.map((item) => walk(item, key));
    if (node && typeof node === 'object') {
      return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, k === 'params' ? v : walk(v, k)]));
    }
    return node;
  };
  return walk(challenge, null);
}
