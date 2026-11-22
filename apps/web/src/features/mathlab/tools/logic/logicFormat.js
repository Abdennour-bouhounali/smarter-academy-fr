/**
 * La NOTATION du مختبر المنطق والبرهان. Aucun mot traduisible ici : les
 * phrases vivent dans mathlab.json, ce fichier ne rend que des SYMBOLES —
 * comme grapherFormat.js ne rend que des nombres.
 *
 * Tout ce qui sort d'ici est destiné à un conteneur `dir="ltr"` :
 * « ¬P ⇒ Q » se lit de gauche à droite même dans une page arabe
 * (ARABIC_RTL_CONTRACT §4 ; les flèches mathématiques ne se retournent
 * JAMAIS, contrairement à une flèche de prose arabe).
 */

import { CONNECTOR_SYMBOLS } from './logicMath.js';

export const SYMBOLS = Object.freeze({
  ...CONNECTOR_SYMBOLS,
  forall: '∀', exists: '∃', in: '∈', subset: '⊂', therefore: '∴',
  reals: 'ℝ', naturals: 'ℕ', integers: 'ℤ', rationals: 'ℚ',
});

/**
 * ص / خ / ؟ — la troisième case existe : une valeur non réglée n'est pas
 * « faux ».
 *
 * Les lettres sont ARABES : « ص » pour صحيحة, « خ » pour خاطئة. `V`/`F`
 * étaient un reste de français — un élève algérien ne lit pas « Vrai » dans
 * une case de jadwal al-haqiqa. Les VARIABLES (P, Q, n, k, x) restent
 * latines, elles : c'est la notation du manuel de 4AM, et le dictionnaire
 * de l'instrument les explique (mathlab.json, `tools.logic.dictionary`).
 */
export function boolText(value) {
  if (value === true) return 'ص';
  if (value === false) return 'خ';

  return '؟';
}

/** Un nombre en notation mathématique : virgule décimale, vrai signe moins. */
export function formatNumber(value, decimals = 3) {
  if (!Number.isFinite(value)) return '—';
  const factor = 10 ** decimals;
  const rounded = Math.round(value * factor) / factor;

  return String(rounded).replace('.', ',').replace('-', '−');
}

/** `P ⇒ Q` à partir de deux écritures, dans la forme demandée. */
export function formOf(form, p, q) {
  switch (form) {
    case 'converse': return `${q} ${SYMBOLS.implies} ${p}`;
    case 'contrapositive': return `${SYMBOLS.not}(${q}) ${SYMBOLS.implies} ${SYMBOLS.not}(${p})`;
    case 'inverse': return `${SYMBOLS.not}(${p}) ${SYMBOLS.implies} ${SYMBOLS.not}(${q})`;
    default: return `${p} ${SYMBOLS.implies} ${q}`;
  }
}

export const equivalenceOf = (p, q) => `${p} ${SYMBOLS.iff} ${q}`;

/** Une expression à deux opérandes : `P ∧ Q`, ou `¬P` qui n'en a qu'un. */
export function connectorExpression(connector, p = 'P', q = 'Q') {
  if (connector === 'not') return `${SYMBOLS.not}${p}`;

  return `${p} ${SYMBOLS[connector]} ${q}`;
}

/** Une liste de valeurs pour l'affichage : « 2 ; 4 ; 6 » (point-virgule arabe usuel). */
export function valueList(values, max = 8) {
  const shown = values.slice(0, max).map((v) => formatNumber(v));
  const text = shown.join(' ; ');

  return values.length > max ? `${text} …` : text;
}
