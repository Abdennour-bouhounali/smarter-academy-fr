/**
 * CE QU'AUCUN ÉCRAN AVANT SON HEURE NE MONTRE — la synthèse de l'unité 5 dans le lecteur de mission (2026-11-12 ; décision du propriétaire OQ4 :
 * le recette PROVISOIRE de la synthèse, pilote `wadiya-idmajiya-talis`). Lue par content/mission.test.js (le balayage par RÔLE, écrit AVANT la
 * conversion : il a d'abord échoué sur les cartes de mémoire, la carte des معارف et les entraînements — rapport du constructeur).
 *
 * LE DÉFI 🏆 (module 8, `Module08Ahill.jsx` — JAMAIS retouché) est le حفل البلدية : 150 علبة عصير و 150 قطعة حلوى بـ 11250 ؛ بقيت 24 علبة و 30
 * قطعة بـ 2100 → x + y = 75, y = 75 − x, 24x + 30(75 − x) = 2100, 2250 − 6x = 2100, 6x = 150 → (25 ; 50) ; leurres (50 ; 25) → 1950,
 * (35 ; 40) → 2040, 37,5 ; l'addition directe 174x + 180y = 13350 ; 11250 − 2100 = 9150 ; les produits 3750 + 7500.
 * La وضعية DE L'UNITÉ (module 7) est la MÊME situation (le dessin du manuel : تحليل الوضعية puis أحلّ الوضعية) : le module 7 l'ANALYSE —
 * les inconnues, la jumla, la simplification par 150 — et ne la RÉSOUT jamais. Donc deux niveaux :
 *   1. LA SIGNATURE DU DÉFI (`ANSWER_TEXT`, rôles `BAD_*`) : sa solution et ses lignes de résolution — nulle part avant le 🏆, le module 7 compris ;
 *   2. LA SITUATION ELLE-MÊME (`SITUATION_TEXT`) : ses nombres, sa jumla, x + y = 75 — nulle part AVANT le module 7 (entraînements, cartes de
 *      mémoire et carte des معارف ouvertes dès le premier écran, ouverture, « أستعدّ », manches du labo, feuille de camarade).
 * Rôles (`{ role, v }` d'un écran de manche — logic/storyModellerPlayer › shownValues) :
 *   'solution'   jamais 25 ni 50 (les deux prix du défi), ni 37,5 ;
 *   'story' / 'chip'  jamais 150, 24 (les quantités du défi) ;
 *   'eq' / 'line'  jamais une ligne du défi (« 150x », « x + y = 75 », « 75 − x », « 6x = 150 », « 24x + 30y ») ;
 *   'check' / 'lineValue' / 'tile' / 'decoy' / 'sum'  jamais 11250, 2100, 2250, 1950, 2040, 13350, 9150, 75.
 */
export const NEVER = ['11250', '2100', '2250', '1950', '2040', '13350', '9150', '37,5'];
export const BAD_SOLUTION = ['25', '50', '37,5'];
export const BAD_COUNT = ['150', '24'];
export const BAD_SUM = ['75'];
const BAD_LINE = [/(^|[^0-9])150[xy]/, /(^|[^0-9])x\+y=75$/, /(^|[^0-9])75-[xy]/, /(^|[^0-9])6x=150/, /-6x=-150/, /24x\+30y/, /30x\+24y/, /174x/];

const bare = (v) => String(v).replace(/\s+/g, '').replace(/−/g, '-').replace('.', ',');

/** Les violations pour ce qu'un écran de manche montre (`{ role, v }`) — vide si l'écran est propre. */
export function violations(shown, label = '') {
  const bad = [];
  const at = (x) => `${label}: ${x.v} (${x.role})`;
  shown.forEach((x) => {
    const v = bare(x.v);
    const abs = v.replace(/^-/, '');
    if (['line', 'eq'].includes(x.role)) { if (BAD_LINE.some((re) => re.test(v))) bad.push(at(x)); return; }
    if (NEVER.includes(abs)) bad.push(at(x));
    if (x.role === 'solution' && BAD_SOLUTION.includes(v)) bad.push(at(x));
    if (['story', 'chip'].includes(x.role) && BAD_COUNT.includes(abs)) bad.push(at(x));
    if (['check', 'lineValue', 'tile', 'decoy', 'sum'].includes(x.role) && BAD_SUM.includes(abs)) bad.push(at(x));
  });
  return bad;
}

/* ── Les mêmes signatures pour un TEXTE (un énoncé, une carte, la carte des معارف, l'ouverture, « أستعدّ », la feuille de camarade) ── */
const num = (n) => new RegExp(`(^|[^0-9,{}.])${n}(?![0-9]|\\{?,\\}?[0-9])`);
// a thousands separator: a space (thin / no-break too), a comma, LaTeX « \\, » or « {,} » (revue 2026-11-12)
const spaced = (a, b) => new RegExp(`(^|[^0-9,{}.])${a}(?:[\\s\\u202F\\u00A0,]|\\\\,|\\{,\\})?${b}(?![0-9])`);

/** 1. Le défi RÉSOLU : jamais avant le 🏆 (le module 7 compris). */
export const ANSWER_TEXT = [
  /\(\s*\$?\s*(25\s*;\s*50|50\s*;\s*25|35\s*;\s*40)\s*\$?\s*\)/,
  /(^|[^0-9])6\s*x\s*=\s*150/, /150\s*=\s*6\s*x/, /2\s?250\s*-\s*6\s*x/, /24\s*x\s*\+\s*30\s*\(\s*75/, num('2250'), spaced('2', '250'),
  // the bare answer « x = 25 », « y = 50 »
  // (not the end of a sum « x + y = 50 », nor « 3y = 50 »)
  /(?<![0-9a-z]|[+\-−]\s*)[xy]\s*=\s*(25|50)(?![0-9]|\{?,\}?[0-9]|\s*[-−+×*/\\])/,
  num('1950'), num('2040'), num('3750'), num('7500'), /37\{?,\}?5/,
  spaced('1', '950'), spaced('2', '040'),
  // un prix TROUVÉ du défi : la brique de jus à 25, la part de gâteau à 50 (pas un prix donné d'une autre histoire)
  /(عصير|العصير)[^.؛،:]{0,30}(?<![0-9,])25(?![0-9])/, /(حلوى|الحلوى|الحلويات)[^.؛،:]{0,30}(?<![0-9,])50(?![0-9])/,
];
/** 2. La situation elle-même : jamais AVANT le module 7. */
export const SITUATION_TEXT = [
  ...ANSWER_TEXT,
  num('11250'), spaced('11', '250'), num('2100'), spaced('2', '100'),
  // les lignes que l'ANALYSE du module 7 écrit (l'addition directe, ce qui fut consommé) : jamais avant lui
  num('13350'), num('9150'), spaced('13', '350'), spaced('9', '150'),
  /(?<![0-9])150\s*[xy]/, /24\s*x\s*\+\s*30\s*y/, /30\s*x\s*\+\s*24\s*y/, /(^|[^0-9])x\s*\+\s*y\s*=\s*75(?![0-9])/, /(^|[^0-9])75\s*-\s*[xy]/,
  /(?<![0-9])150\s*(علبة|قطعة)/, /(?<![0-9])24\s*(علبة|علب)/, /(?<![0-9])30\s*(قطعة|قطع)\s*حلوى/,
  /حفل البلدية/,
];

/** Les violations d'un texte — vide s'il est propre. `before7` : l'écran vient avant le module 7 (la situation elle-même y est interdite). */
export const textViolations = (s, label = '', { before7 = true } = {}) => (before7 ? SITUATION_TEXT : ANSWER_TEXT)
  .filter((re) => re.test(String(s))).map((re) => `${label}: ${re}`);
