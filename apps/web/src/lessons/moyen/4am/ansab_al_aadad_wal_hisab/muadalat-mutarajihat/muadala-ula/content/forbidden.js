/**
 * LA SIGNATURE DE LA مسألة (module 5, « ميزان غرفة الملابس: أكياس في الكفّتين ») qu'aucun écran avant elle ne montre DANS SON RÔLE — règle MÉCANIQUE
 * des conseils du 2026-11-10 et du 2026-11-11 (jetons PAR RÔLE, aucune liste d'exceptions, la مسألة n'est pas retouchée ; verdict « L1 » : la
 * correction interdite définie ÉTROITEMENT). ÉCRIT AVANT les manches ; lu par content/balances.test.js, content/mission.test.js et, par
 * `_unit/signatures/muadala-ula.js`, par `_unit/missionStrings.test.js`.
 *
 *   La مسألة : partie 1 — 7 sacs et 4 baudruches (7x − 4) contre 2 sacs et 26 balles (2x + 26) ; 7x − 4 = 2x + 26, 5x − 4 = 26, 5x = 30, x = 6,
 *   vérification 38 ; leurres 7x + 4 = 2x + 26, 9x − 4 = 26 (les deux sacs portés de l'autre côté « tels quels »), 7x − 4 = 2x − 26 ; la méthode
 *   « on retire 2 sacs de chaque côté, puis 4 balles » ; partie 2 — 5x + 2 = 2x − 13, 3x + 2 = −13, 3x = −15, x = −5, vérification −23 (leurres
 *   « 5 balles », « 15 baudruches », « pas de solution ») ; partie 3 — 9 sacs, 54 balles, 54p = 70200, p = 1300 دج, 26 × 1300 = 33800 دج
 *   (leurres 9p = 70200, 6p = 70200, p + 54 = 70200) ; bruit : 22 joueurs.
 *   - dans AUCUN rôle : 70200, 1300, 33800, 54p ;
 *   - `eq` / `reduced` / `decoy` (une équation écrite ou un leurre) : jamais les neuf équations de la مسألة ;
 *   - `pan` / `bags` / `units` (le contenu d'un plateau de départ) : jamais 7x − 4, 2x + 26, 5x + 2, 2x − 13, ni 7 sacs, 26 balles, 13 baudruches ;
 *   - `solution` / `chip` (un sac lu) : jamais 6 ni −5 ; une pastille de poids jamais non plus 5 ni 15 ;
 *   - `check` (la valeur des plateaux à la solution) : jamais 38 ni −23 ;
 *   - `op` : jamais « collecter 2 sacs » (`bags:2`) — la collecte de 2x est LA méthode de la مسألة.
 * LA CORRECTION INTERDITE, au sens ÉTROIT : les points d'étape, « أستعدّ » et la ورقة زميل ne posent JAMAIS (i) les termes en x des deux membres
 * ADDITIONNÉS de part et d'autre du « = » (`9x − 4 = 26`), (ii) une baudruche comptée +1, (iii) une opération faite sur UN membre seulement
 * comme OPTION. La suite de questions du labo PEUT utiliser (i) et (iii) comme leurres de construction sur SES nombres : c'est la découverte de la
 * leçon (verdict L1.6).
 */
export const NEVER = ['70200', '1300', '33800', '54p'];
export const BAD_EQ = ['7x-4=2x+26', '7x+4=2x+26', '9x-4=26', '7x-4=2x-26', '5x-4=26', '5x=30', '5x+2=2x-13', '3x+2=-13', '3x=-15'];
export const BAD_PAN = ['7x-4', '2x+26', '5x+2', '2x-13'];
export const BAD_BAGS = ['7'];
export const BAD_UNITS = ['26', '13'];
export const BAD_SOLUTION = ['6', '-5'];
export const BAD_CHIP = ['6', '-5', '5', '15'];
export const BAD_CHECK = ['38', '-23'];
export const BAD_OP = ['bags:2'];

const norm = (s) => String(s).replace(/\s+/g, '').replace(/−/g, '-').replace(/\\,/g, '');

/** Les violations pour ce qu'un écran du labo montre (`logic › shownValues`, `{ role, v }`) — vide si l'écran est propre. */
export function violations(shown, label = '') {
  const bad = [];
  const at = (x) => `${label}: ${x.v} (${x.role})`;
  shown.forEach((x) => {
    const v = norm(x.v);
    if (NEVER.some((n) => v === n || v.includes(n))) bad.push(at(x));
    if ((x.role === 'eq' || x.role === 'reduced' || x.role === 'decoy' || x.role === 'tile') && BAD_EQ.includes(v)) bad.push(at(x));
    if (x.role === 'pan' && BAD_PAN.includes(v)) bad.push(at(x));
    if (x.role === 'bags' && BAD_BAGS.includes(v)) bad.push(at(x));
    if (x.role === 'units' && BAD_UNITS.includes(v)) bad.push(at(x));
    if (x.role === 'solution' && BAD_SOLUTION.includes(v)) bad.push(at(x));
    if (x.role === 'chip' && BAD_CHIP.includes(v)) bad.push(at(x));
    if (x.role === 'check' && BAD_CHECK.includes(v)) bad.push(at(x));
    if (x.role === 'op' && BAD_OP.includes(v)) bad.push(at(x));
  });
  return bad;
}

/**
 * Ce qu'un TEXTE montré à l'élève avant la مسألة ne contient jamais (points d'étape, « أستعدّ », ورقة زميل, cartes et carte des معارف,
 * exercices, textes du labo) : les équations et les contenus de plateaux de la مسألة, ses solutions, ses vérifications, ses prix. Lit le moins
 * U+2212, les facteurs nus (« 5x = 30 ») et le séparateur de milliers du dépôt (« 70\, 200 »).
 */
export const TEXT = [
  /(?<![0-9a-z.])7x\s*[-−]\s*4(?![0-9a-z])/, /(?<![0-9a-z.])7x\s*\+\s*4(?![0-9a-z])/, /(?<![0-9a-z.])2x\s*\+\s*26(?![0-9a-z])/, /(?<![0-9a-z.])5x\s*[-−]\s*4(?![0-9a-z])/, /(?<![0-9a-z.])5x\s*=\s*30(?![0-9a-z])/, /(?<![0-9a-z.])9x\s*[-−]\s*4(?![0-9a-z])/,
  /(?<![0-9a-z.])5x\s*\+\s*2(?![0-9a-z])/, /(?<![0-9a-z.])2x\s*[-−]\s*13(?![0-9a-z])/, /(?<![0-9a-z.])3x\s*\+\s*2\s*=\s*[-−]\s*13/, /(?<![0-9a-z.])3x\s*=\s*[-−]\s*15(?![0-9a-z])/,
  /(?<![0-9a-z.])x\s*=\s*6(?![0-9.,/{])/, /(?<![0-9a-z.])x\s*=\s*[-−]\s*5(?![0-9.,/{])/,
  /70\s*(\\,|\\;|\s)?\s*200/, /(^|[^0-9.,{])1300(?![0-9a-z])/, /33\s*(\\,|\\;|\s)?\s*800/, /=\s*38(?![0-9a-z])/, /=\s*[-−]\s*23(?![0-9a-z])/, /(?<![0-9a-z.])54\s*p(?![a-z])/,
];
