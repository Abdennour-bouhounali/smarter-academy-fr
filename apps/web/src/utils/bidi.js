/**
 * Isoler les écritures mathématiques d'un texte BRUT.
 *
 * Écrit pour la plateforme algérienne, de droite à gauche : dans une phrase RTL, « 120 = 6 × 20 » s'affichait
 * « 20 × 6 = 120 ». Ce produit lit de gauche à droite (src/locale.js) : les marques posées ici sont sans effet
 * visible, et le module reste tant que ses lecteurs l'appellent (MathText, MathLabel, RichText, le cahier, la fiche
 * du professeur, la séance d'exercices) — il part avec eux. `MathText` règle le cas des `$…$` ; ce helper règle le
 * texte brut (titres d'exercice, libellés, HTML du cahier) sans balise : il entoure chaque suite
 * « nombre opérateur nombre … » des marques invisibles LRI … PDI (U+2066 / U+2069), qui l'affichent de gauche à
 * droite comme un bloc.
 *
 * Seuls les signes mathématiques lient deux nombres : « : », « — » et « ; » restent des séparateurs de la phrase.
 *
 * Un nombre SUIVI D'UNE UNITÉ latine (« 24 L ») s'isole aussi (2026-09-24) : dans une phrase RTL, l'algorithme
 * bidi rangeait « 24 » et « L » en deux suites distinctes, et la phrase se lisait « L 24 ».
 */
const LRI = '⁦';
const PDI = '⁩';

// Un TERME : un nombre, éventuellement suivi d'une unité ou d'un facteur
// littéral collé (« 24 L », « 7,5 cm² », « 240x »). L'unité n'est pas prise
// si un nombre la suit : dans « 2 x 3 », « x » est l'opérateur.
// Le nombre accepte les décimales à virgule ou point : « 7,5 », « 0.25 ».
const NUMBER = String.raw`\d+(?:[.,]\d+)?`;
const UNIT = String.raw`\s?[A-Za-z]{1,3}[²³]?(?![A-Za-z])(?!\s*\d)`;
const TERM = `${NUMBER}(?:${UNIT})?`;
const OPERATOR = String.raw`[=×x*+\-−÷/<>≤≥]`;
const RUN = new RegExp(`${TERM}(?:\\s*${OPERATOR}\\s*${TERM})*`, 'g');
// Une suite ne s'isole que si elle LIE quelque chose : un opérateur entre deux
// termes, ou une unité. « Étagère 12 » (un nombre seul) reste tel quel.
const JOINED = new RegExp(`\\d\\s*${OPERATOR}\\s*\\d|[A-Za-z]`);

/*
 * LES ÉCRITURES ALGÉBRIQUES (2026-09-30).
 *
 * Dans une phrase RTL, « √a » s'affichait « a√ » : le radical est un signe NEUTRE, il prenait la direction de la
 * phrase. Même chose pour « −√a », « (√a)² = a », « √(a + b) ≠ √a + √b ». La première passe ne voit que des suites
 * de NOMBRES ; celle-ci isole toute suite de caractères mathématiques latins (lettres courtes, chiffres, √,
 * exposants, parenthèses, opérateurs) qui contient un radical, un exposant, ou un opérateur entre deux termes. Un mot
 * latin de 4 lettres ou plus (PGCD, GeoGebra, Excel, « nombre ») n'est jamais pris pour une formule — la suite
 * entière reste alors telle quelle.
 */
// Le PRIME « ′ » (U+2032) des points de la géométrie (2026-10-02) est lui aussi NEUTRE : en RTL, « B′ » s'affichait
// « 'B » et « (B′C′) » « ('B'C) ». Une lettre suivie d'un prime (B′, (d′)) est donc une écriture à isoler, comme un
// radical ; et le parallélisme « (MN)//(BC) » en fin de phrase s'affichait « (BC)//(MN) » : « )//( » lie deux
// droites comme un opérateur.
const ALG_RUN = /[−\-(√A-Za-z0-9π][A-Za-z0-9√²³⁻()+\-−×÷/=<>≤≥≠≈·.,π ′]*[A-Za-z0-9²³)π′]|√/g;
const ALG_MARK = /[√²³]|[A-Za-z]′|\)\s*\/\/\s*\(|^[−-]\s*[0-9A-Za-z√(π]|[A-Za-z0-9)²³]\s*[=×+\-−÷/<>≤≥≠≈·]\s*[A-Za-z0-9(√−π]/;
const LATIN_WORD = /[A-Za-z]{4,}/;
const ISOLATED = new RegExp(`(${LRI}[^${PDI}]*${PDI})`);

function isolateAlgebra(text) {
  return text.split(ISOLATED).map((part) => (part.startsWith(LRI) ? part : part.replace(ALG_RUN, (run) => {
    if (!ALG_MARK.test(run) || LATIN_WORD.test(run)) return run;
    return `${LRI}${run}${PDI}`;
  }))).join('');
}

export function isolateMathRuns(text) {
  if (typeof text !== 'string' || text === '') return text;
  // Idempotent : un texte déjà isolé n'est pas ré-enveloppé.
  if (text.includes(LRI)) return text;

  const numeric = text.replace(RUN, (run) => (JOINED.test(run) ? `${LRI}${run}${PDI}` : run));
  return isolateAlgebra(numeric);
}

/**
 * Comme `isolateMathRuns`, mais sans jamais toucher une île `$…$` (que KaTeX
 * rend) : pour un texte qui MÉLANGE les deux — un titre, un résumé de carte,
 * une option — rendu tantôt brut, tantôt par MathText.
 */
export function isolateOutsideMath(text) {
  if (typeof text !== 'string' || !text) return text;
  return text.split(/(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$)/g)
    .map((part) => (part.startsWith('$') && part.endsWith('$') && part.length > 1 ? part : isolateMathRuns(part)))
    .join('');
}

/** Pour un rendu React : isole une chaîne (hors `$…$`), laisse un nœud tel quel. */
export const bidi = (value) => (typeof value === 'string' ? isolateOutsideMath(value) : value);
