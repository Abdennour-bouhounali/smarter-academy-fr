/**
 * CE QU'AUCUN ÉCRAN AVANT SON HEURE NE MONTRE — la synthèse de l'unité 3 dans le lecteur de mission (2026-11-12 ; le propriétaire : « go ahead »
 * pour les synthèses des unités 1–4, recette PROVISOIRE de la synthèse — docs/reports/MISSION_ROLLOUT_PROGRESS.md › « The synthesis recipe »).
 * Lue par content/mission.test.js (le balayage par RÔLE, écrit AVANT la conversion : il a d'abord échoué — rapport du constructeur).
 *
 * LE DÉFI 🏆 (module 8, `Module08Ahill.jsx` — jamais retouché) est la وضعية du bassin et du ruban : un bassin carré de côté 10 m, un ruban de
 * largeur x tout autour, l'aire du ruban 44 m² → côté extérieur 10 + 2x → aire du ruban (10 + 2x)² − 10² = 4x² + 40x → 4x² + 40x = 44 →
 * x² + 10x − 11 = 0 = (x − 1)(x + 11) → x = 1 m (−11 rejeté) ; vérification : côté 12, 144 − 100 = 44.
 * La وضعية DE L'UNITÉ (module 7) est la MÊME situation : le module 7 l'ANALYSE (les données, la stratégie, le modèle (10 + 2x)² − 10² = 44, la
 * démarche en lettres) et ne la RÉSOUT jamais. Donc deux niveaux :
 *   1. LE DÉFI RÉSOLU (`ANSWER_TEXT`) : 4x² + 40x, x² + 10x − 11 (= 0 ou = 11), (x − 1)(x + 11), x + 11, −11, 144, 4x(x + 10), x(x + 10),
 *      (x + 5)² = 36, « x = 1 m » / « متر واحد » — nulle part avant le 🏆, le module 7 compris ;
 *   2. LA SITUATION ELLE-MÊME (`SITUATION_TEXT`) : le bassin (حوض), le ruban (شريط), 44, le côté 10 + 2x / x + 10 + x, « 10² », « ضلعه 10 » —
 *      nulle part AVANT le module 7 (entraînements, cartes de mémoire et carte des معارف ouvertes dès le premier écran, ouverture, « أستعدّ »).
 * Rôles (`{ role, v }` d'un écran de manche — `logic/pitchExpansion › shownValues`, recalculé par content/mission.test.js) :
 *   tout rôle sauf 'sum' / 'decoy'   jamais 44, 144, −11 ;
 *   'side'                           (un côté du terrain)        jamais 10 ni 12 (le bassin, le côté extérieur à la solution) ;
 *   'area' / 'pitch' / 'ring' / 'tile' (une aire montrée)       jamais 100 (l'aire du bassin) ;
 *   'term' / 'expansion' / 'factor'  jamais 40x, 10x, 4x² + 40x (+ 100), x + 10 (+ x), 10 + 2x, 2x + 10, x + 11, x − 1, x² + 10x − 11.
 * 'sum' (les sommes PARTIELLES de « المجموع » pendant que l'élève porte des zones — n'importe quel entier y passe) et 'decoy' (la valeur d'une
 * forme fausse, montrée par la seule suite 'result', qu'aucune manche du module 7 ne pose) ne sont pas un rôle du défi : l'aire du terrain est
 * relue sous le rôle 'pitch', l'aire du ruban sous 'ring' (content/mission.test.js).
 */
export const NEVER = ['44', '144', '-11'];
const BAD_SIDE = ['10', '12'];
const AREA_ROLES = ['area', 'pitch', 'ring', 'tile', 'center'];
const TERM_ROLES = ['term', 'expansion', 'factor'];
export const BAD_TERM = ['40x', '10x', '4x^2+40x', '4x^2+40x+100', '40x+4x^2', 'x+10+x', 'x+10', '10+2x', '2x+10', 'x+11', 'x-1', 'x^2+10x-11'];
const SKIP = new Set(['sum', 'decoy']);

/** Une écriture TeX ramenée à sa forme nue : sans espaces, « − » → « - », sans parenthèses extérieures. */
export const bare = (v) => String(v).replace(/\s+/g, '').replace(/−/g, '-').replace(/^\((.*)\)$/, '$1').replace(/^\+/, '');

/** Les violations pour ce qu'un écran de manche montre (`{ role, v }`) — vide si l'écran est propre. */
export function violations(shown, label = '') {
  const bad = [];
  shown.forEach((x) => {
    if (SKIP.has(x.role)) return;
    const v = bare(x.v);
    const at = `${label}: ${x.v} (${x.role})`;
    if (NEVER.includes(v)) bad.push(at);
    else if (x.role === 'side' && BAD_SIDE.includes(v)) bad.push(at);
    else if (AREA_ROLES.includes(x.role) && v === '100') bad.push(at);
    else if (TERM_ROLES.includes(x.role) && BAD_TERM.includes(v)) bad.push(at);
  });
  return bad;
}

/* ── Les mêmes signatures pour un TEXTE (un énoncé, une carte, la carte des معارف, l'ouverture, « أستعدّ », la feuille de camarade) ── */
// un nombre ENTIER isolé (ni dans 1440, ni dans 14,4 ou 1{,}44) — « { » avant le nombre n'est PAS exclu (\text{144} est attrapé)
const num = (n) => new RegExp(`(?<![0-9.,]|\\{,\\})${n}(?![0-9]|\\{?,\\}?[0-9]|\\.[0-9])`);
const MINUS = '[-−]';

/** 1. Le défi RÉSOLU : jamais avant le 🏆 (le module 7 compris). */
export const ANSWER_TEXT = [
  /4\s*x(\^\{?2\}?|²)\s*\+\s*40\s*x/, /40\s*x\s*\+\s*4\s*x(\^|²)/,
  new RegExp(`x(\\^\\{?2\\}?|²)\\s*\\+\\s*10\\s*x\\s*(${MINUS}\\s*11(?![0-9])|=\\s*11(?![0-9]))`),
  new RegExp(`\\(\\s*x\\s*${MINUS}\\s*1\\s*\\)\\s*\\(\\s*x\\s*\\+\\s*11\\s*\\)`), /(?<![0-9a-z^])x\s*\+\s*11(?![0-9])/,
  new RegExp(`(?<![0-9a-z^])${MINUS}\\s*11(?![0-9])`), num('144'),
  /x\s*\(\s*x\s*\+\s*10\s*\)/, /\(\s*x\s*\+\s*10\s*\)\s*x/, /(?<![0-9])12\s*(\^\{?2\}?|²)/, /\(\s*x\s*\+\s*5\s*\)(\^\{?2\}?|²)\s*=\s*36/,
  /x\s*=\s*1\s*(\\,|\\;|\s)*(\\text\{?\s*)?(m|م)(?![a-z])/, /متر(ًا)?\s+واحد/,
];
/** 2. La situation elle-même : jamais AVANT le module 7. */
export const SITUATION_TEXT = [
  ...ANSWER_TEXT,
  /حوض|أحواض/, /شريط|أشرطة/, num('44'),
  /(?<![0-9])10\s*\+\s*2\s*(\\times|\\cdot|×|\*)?\s*x/, /(?<![0-9a-z^+−-]\s?)(?<![0-9a-z^])2\s*x\s*\+\s*10(?![0-9x^])/, /x\s*\+\s*10\s*\+\s*x/,
  /(?<![0-9])10\s*(\^\{?2\}?|²)/, /ضلعه\s*\$?10(?![0-9])/,
];

/** Les violations d'un texte — vide s'il est propre. `before7` : l'écran vient avant le module 7 (la situation elle-même y est interdite). */
// les chiffres arabes-indiens (٠–٩) sont ramenés aux chiffres occidentaux avant le balayage (revue 2026-11-12)
const western = (s) => String(s).replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
export const textViolations = (s, label = '', { before7 = true } = {}) => (before7 ? SITUATION_TEXT : ANSWER_TEXT)
  .filter((re) => re.test(western(s))).map((re) => `${label}: ${re}`);

/** Les lignes d'un source sans ses commentaires ni ses métadonnées de source. */
export const visibleLines = (src) => src
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '')
  .replace(/\s\/\/ .*$/gm, '')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  .replace(/src\([^)]*\)/g, '')
  .split('\n');
