/**
 * LA SIGNATURE DE LA مسألة (module 4, « ملعب وممرّ المتفرّجين ») qu'aucun écran avant elle ne montre DANS SON RÔLE — règle MÉCANIQUE du conseil
 * du 2026-11-11 (verdict X3 et « Cross-lesson › Scan » : un balayage par rôle, aucune liste d'exceptions, la مسألة n'est pas retouchée ;
 * LESSON_DEVELOPMENT_GUIDE, rule « forbidden values by role »). Lue par content/pitches.test.js et content/mission.test.js.
 *
 *   La مسألة : largeur x, un couloir de 4 m retiré de la largeur, longueur 2x + 10 ; x = 30 ; gazon 1500 دج / m² ; 350 spectateurs, 3 séances.
 *   A = (2x + 10)(x − 4) = 2x² − 8x + 10x − 40 = 2x² + 2x − 40 ; côtés 70 et 26, A(30) = 1820 ; l'erreur du camarade 2x² − 40 → 1760, l'écart
 *   60 = 2 · 30 ; B = (2x + 12)(x − 3) = 2x² + 6x − 36, côtés 72 et 27, B(30) = 1944 ; B − A = 4x + 4 → 124 m² → 186000 دج.
 *   - dans AUCUN rôle : 1820, 1760, 1944, 124, 186000, 1500, 350 ;
 *   - `x` (la règle, « تحقّق ») : 30, 31 ;   `side` (la valeur d'un côté à x) : 70, 26, 72, 27, 60 ;
 *   - `factor` : 2x + 10, x − 4, 2x + 12, x − 3 ;   `term` (zone, pastille, tuile) : −40, 10x, −8x, −36, 12x, −6x ;
 *   - `expansion` (un développement montré, une forme fausse) : les dix formes de la مسألة et de ses leurres.
 * La MÉTHODE et la CORRECTION de la مسألة (réduire deux termes croisés OPPOSÉS, lire un écart à un grand x comme le terme oublié, soustraire
 * deux développements, un prix) ne sont posées par aucun point d'étape, aucune ورقة زميل, aucune manche du module 2 (content/mission.test.js).
 */
export const NEVER = ['1820', '1760', '1944', '124', '186000', '1500', '350'];
export const BAD_X = ['30', '31'];
export const BAD_SIDE = ['70', '26', '72', '27', '60'];
export const BAD_FACTOR = ['2x+10', 'x-4', '2x+12', 'x-3'];
export const BAD_TERM = ['-40', '10x', '-8x', '-36', '12x', '-6x'];
export const BAD_EXPANSION = [
  '2x^2+2x-40', '2x^2-40', '2x^2+6x-36', '4x+4', '4x^2-40', '2x^2-18x-40', '2x^2+2x+40', '8x-76', '4x-76', '4x^2+8x-76',
];

/** Une écriture TeX ramenée à sa forme nue : sans espaces, sans parenthèses extérieures, « − » → « - ». */
export const bare = (v) => String(v).replace(/\s+/g, '').replace(/−/g, '-').replace(/^\((.*)\)$/, '$1');

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

/** Deux termes croisés de signes OPPOSÉS qui se réduisent (la méthode de la مسألة : −8x + 10x) dans un produit de deux binômes ? */
export function oppositeCross(expr) {
  const [a, b] = String(expr).split('|');
  const terms = (s) => (s.match(/[+-]?[^+-]+/g) ?? []).map((p) => ({ x: /x/.test(p), neg: p.startsWith('-') }));
  const f1 = terms(a); const f2 = terms(b ?? a);
  if (f1.length !== 2 || f2.length !== 2) return false;
  // les termes croisés : (x-terme de f1) × (constante de f2) et (constante de f1) × (x-terme de f2)
  const x1 = f1.find((t) => t.x); const c1 = f1.find((t) => !t.x); const x2 = f2.find((t) => t.x); const c2 = f2.find((t) => !t.x);
  if (!x1 || !c1 || !x2 || !c2) return false;
  const s1 = x1.neg !== c2.neg; const s2 = c1.neg !== x2.neg;
  return s1 !== s2;
}

/**
 * La signature de TEXTE (cartes de connaissance, carte des معارف, points d'étape, exercices — _unit/missionStrings.test.js et
 * content/mission.test.js) : les nombres de la مسألة, ses facteurs, ses termes partiels et ses développements, écrits en TeX.
 */
export const TEXT = [
  /(^|[^0-9.,{])(1820|1760|1944|124|186000|186\s*000|1500|350)(?![0-9])/,
  /x\s*=\s*3[01](?![0-9])/,
  /\(\s*2x\s*\+\s*1[02]\s*\)/, /\(\s*x\s*[-−]\s*[34]\s*\)/,
  // les facteurs écrits SANS parenthèses (« 2x + 10 », « x − 4 ») — jamais précédés d'un chiffre ou d'une lettre (« 12x + 10 », « 3x − 4 »)
  /(?<![-−+]\s?)(?<![0-9a-z^])2x\s*\+\s*1[02](?![0-9x^])/, /(?<![-−+]\s?)(?<![0-9a-z^(])x\s*[-−]\s*[34](?![0-9x^])/,
  /(^|[^0-9])[-−]\s*8x(?![0-9^])/, /(?<![-−0-9]\s?)(?<![0-9])10x(?![0-9^])/, /(?<![-−0-9]\s?)(?<![0-9])12x(?![0-9^])/, /(^|[^0-9])[-−]\s*6x(?![0-9^])/,
  /(^|[^0-9.,{])[-−]\s*(40|36)(?![0-9])/,
  /2x\^2\s*[+-−]\s*(2|6|18)x\s*[+-−]\s*(40|36)/, /2x\^2\s*[-−]\s*40/, /4x\s*\+\s*4(?![0-9x])/, /4x\^2\s*[-−]\s*40/, /[48]x\s*[-−]\s*76/,
];
export const textHit = (s) => TEXT.some((re) => re.test(String(s)));
