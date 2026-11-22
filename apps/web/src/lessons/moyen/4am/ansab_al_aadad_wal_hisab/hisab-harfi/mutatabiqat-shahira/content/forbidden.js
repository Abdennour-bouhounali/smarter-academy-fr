/**
 * LA SIGNATURE DE LA مسألة (module 5, « ملعب الحيّ: مدرّجات على ضلعين ») qu'aucun écran avant elle ne montre DANS SON RÔLE — règle MÉCANIQUE du
 * conseil du 2026-11-11 (verdict X3, L2.1, L2.7 et « Cross-lesson › Scan » : un balayage par rôle, aucune liste d'exceptions, la مسألة n'est pas
 * retouchée ; LESSON_DEVELOPMENT_GUIDE, rule « forbidden values by role »). Lue par content/squares.test.js et content/mission.test.js.
 *
 *   La مسألة : un terrain carré de côté x ; deux bandes de 3 m retirées le long de deux côtés voisins ; x = 30.
 *   A = (x − 3)² = x² − 6x + 9 ; (30 − 3)² = 900 − 180 + 9 = 729 ; l'ouvrier dit x² − 6x → 720 ; les gradins x² − (x − 3)² = 6x − 9 → 171 ;
 *   prix 1200 / 900 دج → 874800 / 153900. Les leurres : x² − 9, x² − 6x − 9, x² − 3x + 9, x² − 3, 6x + 9, −6x + 9, 711…
 *   - dans AUCUN rôle : 27, 729, 720, 711, 171, 900, 180, 874800, 153900, 1200 ;
 *   - `x` (la règle, « تحقّق ») : 30 ;   `side` (la valeur d'un côté à x) : 30 ;
 *   - `factor` : x − 3, x + 3 ;   `term` (zone, pastille, tuile, option d'une question) : ±6x, la constante ±9 ;
 *   - `expansion` (un développement montré, une forme fausse, une affirmation prédite) : les formes de la مسألة et de ses leurres.
 * PERMIS PAR RÔLE (verdict L2.7, écrit en rôles, pas en liste) : 9 comme AIRE d'un terrain entier ou d'une zone (tout (x − b)² passe par un
 * côté 3), 30 comme AIRE d'une zone (−5x à x = 6). Le côté 3 lui-même est permis (le départ de r2 est 9, côté 4).
 * La MÉTHODE et la CORRECTION de la مسألة (un carré mental ancré sur 30, « le coin retranché deux fois est ajouté une fois ») ne sont posées par
 * aucun point d'étape, aucune ورقة زميل (content/mission.test.js).
 */
export const NEVER = ['27', '729', '720', '711', '171', '900', '180', '874800', '153900', '1200'];
export const BAD_X = ['30'];
export const BAD_SIDE = ['30'];
export const BAD_FACTOR = ['x-3', 'x+3', '3-x', '3+x'];
export const BAD_TERM = ['6x', '-6x', '9', '-9'];
export const BAD_EXPANSION = [
  'x^2-6x+9', 'x^2-9', 'x^2-6x-9', 'x^2-3x+9', 'x^2-3', 'x^2+6x+9', '6x-9', '-6x+9', '6x+9', 'x^2-6x', 'x^2+9',
];

/** Une écriture TeX ramenée à sa forme nue : sans espaces, sans parenthèses extérieures, « − » → « - », sans « + » de tête. */
export const bare = (v) => String(v).replace(/\s+/g, '').replace(/−/g, '-').replace(/^\((.*)\)$/, '$1').replace(/^\+/, '');

/** Les violations pour ce qu'un écran montre (`logic › shownValues`, `{ role, v }`) — vide si l'écran est propre. */
export function violations(shown, label = '') {
  const bad = [];
  const at = (x) => `${label}: ${x.v} (${x.role})`;
  shown.forEach((x) => {
    const v = bare(x.v);
    const abs = v.replace(/^-/, '');
    if (NEVER.includes(abs)) bad.push(at(x));
    if (x.role === 'x' && BAD_X.includes(v)) bad.push(at(x));
    if (x.role === 'side' && BAD_SIDE.includes(abs)) bad.push(at(x));
    if (x.role === 'factor' && BAD_FACTOR.includes(v)) bad.push(at(x));
    if (x.role === 'term' && BAD_TERM.includes(v)) bad.push(at(x));
    if (x.role === 'expansion' && BAD_EXPANSION.includes(v)) bad.push(at(x));
  });
  return bad;
}

/**
 * La signature de TEXTE (cartes de connaissance, carte des معارف, points d'étape, exercices, prose des modules 0–4 — _unit/missionStrings.test.js
 * et content/mission.test.js) : les nombres de la مسألة, ses facteurs, ses termes, ses développements et son ancre mentale 30, écrits en TeX.
 */
export const TEXT = [
  // (pas une classe Tailwind « text-slate-900 », pas un identifiant « ex-9 »)
  // (revue 2026-11-11) : « -720 » collé et le séparateur de milliers « \, » du dépôt sont pris aussi
  /(?<![0-9.,{a-z]|[a-z]-)(27|729|720|711|171|900|180|874(?:\\,|\s)*800|153(?:\\,|\s)*900|1(?:\\,|\s)*200)(?![0-9])/,
  /x\s*=\s*30(?![0-9])/,
  /\(\s*x\s*[-−+]\s*3\s*\)/, /\(\s*3\s*[-−+]\s*x\s*\)/,
  // le facteur écrit SANS parenthèses (« x − 3 ») — jamais précédé d'un chiffre, d'une lettre ou de « ^ » (« 2x − 3 », « x^2 − 3x »)
  /(?<![0-9a-z^(])x\s*[-−+]\s*3(?![0-9x^,.])/,
  // un côté de 30 m écrit en clair
  /(?<![0-9.,])30\s*(\\,)?\s*m(?![a-z])/,
  // le terme ±6x (pas 16x, 0,6x, 6x²) et la constante ±9 (pas 9x, 9,5, 90)
  /(^|[^0-9.,{}])6x(?![0-9^])/, /(?<![a-z][a-z]|[a-z]-)[-−+]\s*9(?![0-9x,.{^'"]|\s*x)/,
  /x\^2\s*[-−]\s*3(?![0-9x,.])/, /x\^2\s*[-−+]\s*9(?![0-9x,.])/,
  // l'ancre mentale de la مسألة : un carré autour de 30
  /\(\s*30\s*[-−+]/, /30\s*[-−]\s*3(?![0-9])/,
];
export const textHit = (s) => TEXT.some((re) => re.test(String(s)));
