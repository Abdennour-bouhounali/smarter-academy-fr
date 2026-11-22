/**
 * CE QU'AUCUN ÉCRAN AVANT SON HEURE NE MONTRE — la synthèse de l'unité 2 dans le lecteur de mission (2026-11-12 ; le propriétaire : « go ahead »
 * pour les synthèses des unités 1–4, recette PROVISOIRE de la synthèse — docs/reports/MISSION_ROLLOUT_PROGRESS.md › « The synthesis recipe »).
 * Lue par content/mission.test.js (le balayage par RÔLE, écrit AVANT la conversion : il a d'abord échoué — rapport du constructeur).
 *
 * LE DÉFI 🏆 (module 8, `Module08Ahill.jsx` — jamais retouché, sauf « دج ») est la وضعية de la زربية : 24 m², la longueur double de la largeur
 * → 2ℓ² = 24 → ℓ² = 12 → ℓ = √12 = 2√3 ≈ 3,4641 m (346 cm), L = 4√3 = √48 ≈ 6,9282 m (693 cm ; 692 = 2 × 346 est l'arrondi prématuré) ;
 * le prix 12000 دج est la donnée parasite ; leurres : ℓ = 6, ℓ = 8, ℓ² = 6, 2√6 = √24, 347, 600 / 1200.
 * La وضعية DE L'UNITÉ (module 7) est la MÊME situation : le module 7 l'ANALYSE (les données, l'équation 2ℓ² = 24, la solution positive, le moment
 * d'arrondir) et ne la RÉSOUT jamais. Donc deux niveaux :
 *   1. LA SIGNATURE DU DÉFI (`ANSWER_TEXT`, valeurs `NEVER`) : ℓ² = 12, √12, 2√3, 4√3, √48, 3,46…, 6,93…, 346, 693, 692 — nulle part avant le 🏆,
 *      le module 7 compris ;
 *   2. LA SITUATION ELLE-MÊME (`SITUATION_TEXT`) : la زربية, وادي سوف, l'aire 24 m², le prix 12000, l'équation 2ℓ² = 24 — nulle part AVANT le
 *      module 7 (entraînements, cartes de mémoire et carte des معارف ouvertes dès le premier écran, ouverture, « أستعدّ »).
 * Rôles (`{ role, v }` d'un écran de manche — content/mission.test.js, recalculé par la logique des labos) :
 *   tout rôle                          jamais une valeur de `NEVER` ;
 *   'n' / 'area' / 'decoy' / 'card' / 'chip'   (une aire, un a de x² = a)  jamais 6 ni 3 non plus (ℓ² = 6 du leurre, la dalle de √12 = 2√3) ;
 *   'root' / 'form' / 'solution'       (un côté)                           jamais √3, √6 non plus.
 * Les rôles 'k' / 'kk' (le nombre de dalles sur le côté, k²) et 'near' (une graduation) sont la règle graduée : seuls `NEVER` s'y appliquent.
 */
export const NEVER = ['12', '24', '48', '√12', '2√3', '4√3', '√48', '√24', '2√6', '346', '347', '692', '693', '3,46', '6,93', '12000'];
const AREA_ROLES = ['n', 'area', 'decoy', 'card', 'chip'];
const SIDE_ROLES = ['root', 'form', 'solution', 'tile'];

/** Les violations pour ce qu'un écran de manche montre (`{ role, v }`) — vide si l'écran est propre. */
export function violations(shown, label = '') {
  const bad = [];
  shown.forEach((x) => {
    const v = String(x.v).replace(/\s+/g, '').replace('−', '-');
    const bare = v.replace(/^-/, '');
    if (NEVER.includes(bare) || /^(3,46|6,9[23])/.test(bare)) bad.push(`${label}: ${x.v} (${x.role})`);
    else if (AREA_ROLES.includes(x.role) && ['6', '3'].includes(bare)) bad.push(`${label}: ${x.v} (${x.role})`);
    else if (SIDE_ROLES.includes(x.role) && ['√3', '√6'].includes(bare)) bad.push(`${label}: ${x.v} (${x.role})`);
  });
  return bad;
}

/** Ce qu'aucun leurre « مساحة البلاطة » du labo des dalles ne propose (passé au labo par `avoid`). */
export const AVOID = [...NEVER, '6', '3'];

/* ── Les mêmes signatures pour un TEXTE (un énoncé, une carte, la carte des معارف, l'ouverture, « أستعدّ », la feuille de camarade) ── */
// un nombre ENTIER isolé (ni dans 1346, ni dans 3,46 ou 34{,}6) — « { » avant le nombre n'est PAS exclu (\text{346} est attrapé)
const num = (n) => new RegExp(`(?<![0-9.,]|\\{,\\})${n}(?![0-9]|\\{?,\\}?[0-9]|\\.[0-9])`);
// « 2√3 » / « 2\sqrt{3} » sans chiffre avant (12√3 n'est pas 2√3)
// (revue 2026-11-12 : aussi « 2\sqrt3 », « 2 \times \sqrt{3} », « 2\cdot\sqrt 3 », « 2 × √3 »)
const coefRoot = (k, b) => new RegExp(`(?<![0-9.,{}])${k}\\s*(\\\\(times|cdot)|×|\\*)?\\s*(\\\\sqrt\\s*\\{?\\s*${b}\\s*\\}?(?![0-9])|√\\s*${b}(?![0-9]))`);

/** 1. Le défi RÉSOLU : jamais avant le 🏆 (le module 7 compris). */
export const ANSWER_TEXT = [
  /\\sqrt\s*\{?\s*12\s*\}?(?![0-9])/, /√\s*12(?![0-9])/, /\\sqrt\s*\{?\s*48\s*\}?(?![0-9])/, /√\s*48(?![0-9])/,
  coefRoot(2, 3), coefRoot(4, 3),
  // ℓ² = 12 / x² = 12, écrit en LaTeX ou en texte
  /\^\{?2\}?\s*=\s*12(?![0-9{,])/, /²\s*=\s*12(?![0-9,])/,
  // les valeurs approchées et arrondies de la زربية
  /(?<![0-9])3(\{,\}|,|\.)46/, /(?<![0-9])6(\{,\}|,|\.)9[23]/, num('346'), num('347'), num('693'), num('692'),
];
/** 2. La situation elle-même : jamais AVANT le module 7. */
export const SITUATION_TEXT = [
  ...ANSWER_TEXT,
  /زرب|زراب/, /وادي سوف/, num('12000'), /12\s000/,
  // l'aire de la زربية et son équation
  /(?<![0-9.,{])24\s*(\$?\s*(\\[,; ]|\\text\{?\s*)?\s*m\}?\^\{?2|m²|م²|مترًا مربّعًا|مترا مربعا|متر مربع)/, /مساحتها\s*\$?24(?![0-9])/, /\\ell\^2\s*=\s*24(?![0-9])/, /ℓ²\s*=\s*24(?![0-9])/,
];

/** Les violations d'un texte — vide s'il est propre. `before7` : l'écran vient avant le module 7 (la situation elle-même y est interdite). */
export const textViolations = (s, label = '', { before7 = true } = {}) => (before7 ? SITUATION_TEXT : ANSWER_TEXT)
  .filter((re) => re.test(String(s))).map((re) => `${label}: ${re}`);

/** Les lignes d'un source sans ses commentaires ni ses métadonnées de source. */
export const visibleLines = (src) => src
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '')
  .replace(/\s\/\/ .*$/gm, '')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  .replace(/src\([^)]*\)/g, '')
  .split('\n');
