/**
 * LA SIGNATURE DE LA مسألة (module 4, « كشك الحي: بطاقتا الأسعار الجديدة ») qu'aucun écran avant elle ne montre DANS SON RÔLE — règle MÉCANIQUE
 * des conseils (jetons PAR RÔLE ; la مسألة n'est pas retouchée). ÉCRIT AVANT les manches ; lu par content/cards.test.js, content/mission.test.js et,
 * par `_unit/signatures/hall-jabri.js`, par `_unit/missionStrings.test.js` et `_unit/unitCollisions.test.js` (conseil du 2026-11-11, verdict L2 + X11).
 *
 *   La مسألة : 3x + y = 115 et 4x − 3y = 45 → (30 ; 25). On isole y = 115 − 3x, on substitue dans (2) : 4x − 3(115 − 3x) = 45, soit 4x − 345 + 9x = 45,
 *   13x = 390. Leurres de traduction 3y − 4x = 45, x + 3y = 115, 4x + 3y = 45 ; leurre sans parenthèses 4x − 3 × 115 − 3x = 45 ; partie 2 : (35 ; 10),
 *   (20 ; 55) et les vérifications 110, 105 ; partie 3 : 250 دج, 6 pièces, 20 دج.
 *   - dans AUCUN rôle : 115, 390, 345 (et donc 13x = 390) ;
 *   - `eq` (une équation montrée : une carte, une carte multipliée, une somme, une ligne, un leurre) : jamais les équations de la مسألة ;
 *   - `iso` : jamais 115 − 3x, 115 + 3x, 3x − 115, 115 − 3y ;
 *   - `value` (une valeur trouvée) : jamais 30 ni 25 ; `pair` : jamais (30 ; 25), (25 ; 30), (35 ; 10), (20 ; 55).
 * LA MÉTHODE ET LA CORRECTION (verdict X11, règle P) : avant le module 4, rien de ce que la leçon ÉCRIT ne montre un moins devant une parenthèse
 * (`RULE_P`) ; la manche ne refuse jamais le chemin « moins » de l'élève, mais elle ne l'écrit pas elle-même.
 */
export const NEVER = ['115', '390', '345'];
export const BAD_EQ = ['3x+y=115', '4x-3y=45', '3y-4x=45', 'x+3y=115', '4x+3y=45', '13x=390', '4x-3(115-3x)=45', '4x-345+9x=45'];
export const BAD_ISO = ['y=115-3x', 'y=115+3x', 'y=3x-115', 'x=115-3y'];
export const BAD_VALUE = ['30', '25'];
export const BAD_PAIR = ['(30;25)', '(25;30)', '(35;10)', '(20;55)', '(10;35)', '(55;20)'];

const norm = (s) => String(s).replace(/\s+/g, '').replace(/−/g, '-').replace(/\\,/g, '');
const tokens = (s) => norm(s).match(/\d+/g) ?? [];

/** Les violations pour ce qu'un écran du labo montre (`logic › shownValues`, `{ role, v }`) — vide si l'écran est propre. */
export function violations(shown, label = '') {
  const bad = [];
  const at = (x) => `${label}: ${x.v} (${x.role})`;
  shown.forEach((x) => {
    const v = norm(x.v);
    if (tokens(v).some((n) => NEVER.includes(n))) bad.push(at(x));
    if ((x.role === 'eq' || x.role === 'tile' || x.role === 'decoy') && BAD_EQ.includes(v)) bad.push(at(x));
    if (x.role === 'iso' && BAD_ISO.includes(v)) bad.push(at(x));
    if (x.role === 'value' && BAD_VALUE.includes(v)) bad.push(at(x));
    if (x.role === 'pair' && BAD_PAIR.includes(v)) bad.push(at(x));
  });
  return bad;
}

/**
 * Ce qu'un TEXTE montré à l'élève avant la مسألة ne contient jamais : ses équations, son expression isolée, sa ligne, ses nombres, ses couples et ses
 * valeurs. Lit le moins U+2212, les facteurs nus et le séparateur de milliers du dépôt ; un motif qui commence par une lettre porte `(?<![0-9])`.
 */
export const TEXT = [
  /3x\s*\+\s*y\s*=\s*115/, /4x\s*[-−]\s*3y\s*=\s*45/, /115\s*[-−+]\s*3\s*[xy]/, /3x\s*[-−]\s*115/, /4x\s*[-−]\s*3\s*\(/, /13\s*x\s*=\s*390/,
  /(^|[^0-9.,{])(115|390|345)(?![0-9])/,
  /\(\s*30\s*;\s*25\s*\)/, /\(\s*25\s*;\s*30\s*\)/, /\(\s*35\s*;\s*10\s*\)/, /\(\s*20\s*;\s*55\s*\)/,
  /(?<![0-9])x\s*=\s*30(?![0-9.,/{])/, /(?<![0-9])y\s*=\s*25(?![0-9.,/{])/,
];

/**
 * LA RÈGLE P (verdict X11 › P1) : avant le module 4, aucune ligne ÉCRITE par la leçon (activité, exemples, « دوري », fiches, carte, points d'étape,
 * « أستعدّ », ورقة زميل, lignes `explain` / `method` du module 3, équations données) ne montre un moins devant une parenthèse — `−(…)`, `− 3(…)`.
 * Une parenthèse qui contient « ; » est un couple, pas un paquet.
 */
export const RULE_P = /[-−]\s*\d*\s*\((?![^)]*;)/;
