/**
 * Noyau numérique de la leçon « Opérations sur les nombres relatifs » (4e).
 *
 * Tout ce qui est vrai mathématiquement vit ici : les modules affichent, ce
 * fichier calcule. Les affirmations de la leçon deviennent ainsi vérifiables
 * par un test plutôt que par relecture.
 *
 * PÉRIMÈTRE 4e — produit, quotient, enchaînement des quatre opérations. Le
 * SENS du relatif (position, opposé, comparaison) est un acquis de 5e ; les
 * racines carrées de négatifs sont exclues par le programme.
 */

/** Écriture française d'un relatif : vrai signe moins (U+2212). */
export const fmt = (n) => {
  if (Number.isInteger(n)) return n < 0 ? `−${Math.abs(n)}` : `${n}`;
  const s = String(Math.abs(n)).replace('.', ',');
  return n < 0 ? `−${s}` : s;
};

/** Écriture entre parenthèses, avec signe explicite : « 3 × (−5) ». */
export const fmtParen = (n) => (n < 0 ? `(−${Math.abs(n)})` : `(+${n})`);

/**
 * Lecture d'une saisie élève représentant un relatif.
 *
 * Le `parseFr` du kit refuse tout signe (`^\d+$` → NaN sur « −5 ») et le
 * `parseDec` du cœur n'accepte que le trait d'union ASCII. Or la leçon affiche
 * partout le vrai signe moins « − » (U+2212) : un élève qui recopie ce qu'il
 * voit serait compté faux. On accepte les deux, et les décimaux (un quotient
 * comme −7 ÷ 2 en produit).
 */
export const parseRelatif = (str) => {
  if (typeof str === 'number') return Number.isFinite(str) ? str + 0 : NaN;
  if (typeof str !== 'string') return NaN;
  const cleaned = str
    .replace(/[\s  ]/g, '')
    .replace(/[−–—]/g, '-')
    .replace(',', '.');
  if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(cleaned)) return NaN;
  return parseFloat(cleaned) + 0;      // + 0 : jamais de -0 affiché
};

/* ── Le produit ──────────────────────────────────────────────────────────── */

export const multiplier = (a, b) => a * b + 0;
export const diviser = (a, b) => (b === 0 ? NaN : a / b + 0);

/**
 * Le signe d'un produit, décidé par la PARITÉ du nombre de facteurs négatifs.
 * C'est le seul énoncé dont la leçon a besoin pour un produit de n facteurs :
 * il rend « − × − = + » et « − × − × − = − » également évidents.
 */
export const compterNegatifs = (facteurs) => facteurs.filter((x) => x < 0).length;

export const signeDuProduit = (facteurs) => {
  if (facteurs.some((x) => x === 0)) return 0;
  return compterNegatifs(facteurs) % 2 === 0 ? 1 : -1;
};

export const produit = (facteurs) => facteurs.reduce((p, x) => p * x, 1) + 0;

/* ── La table qu'on prolonge (module 1) ──────────────────────────────────── */

/**
 * Une COLONNE de la table de multiplication : les produits `ligne × k` pour k
 * décroissant de `kMax` à `kMin`. Prolonger la table vers les négatifs, c'est
 * continuer cette colonne — et le pas entre deux cases consécutives reste
 * constant, égal à la ligne. C'est cette régularité qui FORCE le signe.
 */
export const colonne = (ligne, kMax = 3, kMin = -3) => {
  const out = [];
  for (let k = kMax; k >= kMin; k -= 1) out.push({ k, valeur: multiplier(ligne, k) });
  return out;
};

/** Le pas constant d'une colonne : toujours égal à la ligne (vérifié en test). */
export const pasDeLaColonne = (ligne) => -ligne;

/* ── L'enchaînement des opérations (module 5) ────────────────────────────── */

/**
 * Évalue une expression donnée comme une liste de jetons, en respectant les
 * priorités : × et ÷ d'abord, de gauche à droite, puis + et −.
 * Forme : [nombre, opérateur, nombre, opérateur, …] avec op ∈ { '+','−','×','÷' }.
 */
export const evaluer = (jetons) => {
  const t = [...jetons];
  // Premier passage : × et ÷.
  for (let i = 1; i < t.length; i += 2) {
    if (t[i] === '×' || t[i] === '÷') {
      const v = t[i] === '×' ? multiplier(t[i - 1], t[i + 1]) : diviser(t[i - 1], t[i + 1]);
      t.splice(i - 1, 3, v);
      i -= 2;
    }
  }
  // Second passage : + et −.
  let acc = t[0];
  for (let i = 1; i < t.length; i += 2) {
    acc = t[i] === '+' ? acc + t[i + 1] : acc - t[i + 1];
  }
  return acc + 0;
};

/** L'écriture lisible d'une expression en jetons. */
export const ecrire = (jetons) =>
  jetons
    .map((j, i) => (typeof j === 'number' ? (i === 0 ? fmt(j) : fmtParen(j)) : ` ${j} `))
    .join('')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Le résultat qu'on obtiendrait en calculant DE GAUCHE À DROITE, sans
 * priorités. Sert à montrer que l'ordre change le résultat — l'erreur que le
 * module 5 vise, plutôt qu'un simple « attention aux priorités ».
 */
export const evaluerDeGaucheADroite = (jetons) => {
  let acc = jetons[0];
  for (let i = 1; i < jetons.length; i += 2) {
    const b = jetons[i + 1];
    if (jetons[i] === '+') acc += b;
    else if (jetons[i] === '−') acc -= b;
    else if (jetons[i] === '×') acc = multiplier(acc, b);
    else acc = diviser(acc, b);
  }
  return acc + 0;
};

/** Diagnostic d'une erreur de signe sur un produit. */
export const diagnostiquerProduit = (a, b, reponse) => {
  const juste = multiplier(a, b);
  if (reponse === juste) return 'ok';
  if (reponse === -juste) return 'signe';
  if (reponse === a + b) return 'addition';
  return 'valeur';
};

export const DIAGNOSTIC_PRODUIT = {
  signe: 'La valeur est bonne, mais le signe ne l’est pas. Recompte les facteurs négatifs.',
  addition: 'Tu as additionné au lieu de multiplier.',
  valeur: 'Reprends le produit des distances à zéro, puis décide du signe.',
};

/**
 * Les expressions travaillées au module 5.
 *
 * CHACUNE doit donner un résultat DIFFÉRENT selon qu'on respecte les priorités
 * ou qu'on calcule de gauche à droite — sans quoi elle ne démontre rien sur
 * l'ordre des opérations. Deux candidates ont été écartées pour cette raison
 * (« 12 ÷ (−4) − 5 » et « (−6) × (−2) + (−5) » donnent la même chose des deux
 * façons) ; l'invariant est verrouillé par operations.test.js.
 */
export const EXPRESSIONS = [
  { id: 'x1', jetons: [-3, '+', 4, '×', -2] },      // priorités −11, gauche→droite −2
  { id: 'x2', jetons: [5, '−', 12, '÷', -4] },       // priorités 8,   gauche→droite 1,75
  { id: 'x3', jetons: [-8, '+', -3, '×', -4] },      // priorités 4,   gauche→droite 44
];
