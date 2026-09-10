/**
 * Le modèle mathématique de « Dérivation : les règles de calcul ».
 *
 * Tout ce que les modules affichent en est DÉRIVÉ. Les dérivées sont EXACTES
 * et LITTÉRALES : chaque carte porte sa formule au dos, écrite à la main une
 * fois et vérifiée contre la définition par le test. `numericDerivative` du
 * noyau partagé ne sert QU'À vérifier une prédiction dans le laboratoire —
 * jamais à juger une réponse d'élève (règle de justesse, en-tête de
 * common/analysis/derivative.js).
 *
 * PÉRIMÈTRE EXÉCUTABLE : cette leçon établit les RÈGLES de calcul. Elle
 * n'aborde ni le signe de la dérivée et les variations, ni l'optimisation, ni
 * la théorie des limites. `assemblage` refuse structurellement de composer
 * deux fois (u ∘ v ∘ w) : la composée SIMPLE seule est au programme ici.
 */
import { numericDerivative } from '../../../../../common/analysis/derivative';
import { formatDec } from '@smarter-academy/core';

/** Format français des nombres de la leçon : virgule, vrai signe moins. */
export const fr = (n) => formatDec(arrondi(n)).replace('-', '−');

/** Arrondi d'affichage : quatre décimales, pour éviter 2,0999999999. */
export const arrondi = (n) => Math.round(n * 10000) / 10000;

/**
 * `parseDec` refuse le VRAI signe moins (U+2212) et les tirets longs, alors
 * que la leçon AFFICHE « −4 » partout. Un élève qui recopie ce qu'il voit
 * verrait sa réponse juste déclarée fausse. On normalise avant de déléguer.
 * (Piège n°1 du lot 1, payé par trois agents sur quatre.)
 */
export const parseSigned = (parseDec) => (txt) =>
  parseDec(String(txt).replace(/[−–—]/g, '-'));

// ─────────────────────────────────────────────────────────────────────────────
// LES CARTES — une fonction usuelle, sa dérivée EXACTE écrite au dos.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Une carte = { id, label (recto), derivee (verso), f, fPrime, domaine }.
 *
 * `domaine` est le test d'appartenance : 1/x exclut 0, √x exige x > 0. Il
 * garde le laboratoire d'évaluer une pente là où la fonction n'existe pas —
 * la manipulation ne peut donc jamais afficher NaN.
 */
export const CARTES = [
  {
    id: 'carre',
    label: 'x²',
    derivee: '2x',
    f: (x) => x * x,
    fPrime: (x) => 2 * x,
    domaine: () => true,
    famille: 'puissance',
    n: 2,
  },
  {
    id: 'cube',
    label: 'x³',
    derivee: '3x²',
    f: (x) => x ** 3,
    fPrime: (x) => 3 * x * x,
    domaine: () => true,
    famille: 'puissance',
    n: 3,
  },
  {
    id: 'identite',
    label: 'x',
    derivee: '1',
    f: (x) => x,
    fPrime: () => 1,
    domaine: () => true,
    famille: 'puissance',
    n: 1,
  },
  {
    id: 'constante',
    label: '5',
    derivee: '0',
    f: () => 5,
    fPrime: () => 0,
    domaine: () => true,
    famille: 'constante',
  },
  {
    id: 'inverse',
    label: '1/x',
    derivee: '−1/x²',
    f: (x) => 1 / x,
    fPrime: (x) => -1 / (x * x),
    domaine: (x) => x !== 0,
    famille: 'inverse',
  },
  {
    id: 'racine',
    label: '√x',
    derivee: '1/(2√x)',
    f: (x) => Math.sqrt(x),
    fPrime: (x) => 1 / (2 * Math.sqrt(x)),
    domaine: (x) => x > 0,
    famille: 'racine',
  },
];

/** Une carte par son id — les modules ne manipulent jamais l'indice. */
export const carte = (id) => {
  const c = CARTES.find((k) => k.id === id);
  if (!c) throw new Error(`carte inconnue : ${id}`);
  return c;
};

// ─────────────────────────────────────────────────────────────────────────────
// LE BANC — assembler deux cartes par un opérateur.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Les trois opérateurs du banc. `naif` est la « règle naïve » que l'élève
 * applique spontanément : je retourne CHAQUE carte et je recolle de la même
 * façon. Elle SURVIT pour + et ×k, elle ÉCHOUE pour × — et c'est tout l'objet
 * du module 1.
 */
export const OPERATEURS = {
  somme: {
    id: 'somme',
    symbole: '+',
    label: 'u + v',
    combine: (fu, fv) => (x) => fu(x) + fv(x),
    naifValide: true,
  },
  produit: {
    id: 'produit',
    symbole: '×',
    label: 'u × v',
    combine: (fu, fv) => (x) => fu(x) * fv(x),
    naifValide: false,
  },
};

/**
 * Un assemblage : deux cartes, un opérateur, un coefficient k appliqué à la
 * PREMIÈRE carte (k = 1 par défaut → pas de coefficient visible).
 *
 * PÉRIMÈTRE EXÉCUTABLE, codé en `throw` et non commenté : le banc ne compose
 * pas deux assemblages. La composée simple (module 5) a sa propre structure,
 * et l'imbrication profonde est hors programme de Première.
 */
export function assemblage({ gauche, droite, op, k = 1 }) {
  if (typeof gauche !== 'string' || typeof droite !== 'string') {
    throw new Error('assemblage : le banc n’emboîte que des CARTES, pas d’autres assemblages');
  }
  const u = carte(gauche);
  const v = carte(droite);
  const operateur = OPERATEURS[op];
  if (!operateur) throw new Error(`opérateur inconnu : ${op}`);

  const fu = (x) => k * u.f(x);
  const fuPrime = (x) => k * u.fPrime(x);

  return {
    u, v, k, op: operateur,
    f: operateur.combine(fu, v.f),
    /** La dérivée VRAIE, exacte et littérale : somme ou règle du produit. */
    fPrime:
      op === 'somme'
        ? (x) => fuPrime(x) + v.fPrime(x)
        : (x) => fuPrime(x) * v.f(x) + fu(x) * v.fPrime(x),
    /**
     * La dérivée NAÏVE : « je retourne chaque carte et je recolle pareil ».
     * u′ + v′ pour la somme (juste), u′ × v′ pour le produit (faux).
     */
    fPrimeNaif:
      op === 'somme'
        ? (x) => fuPrime(x) + v.fPrime(x)
        : (x) => fuPrime(x) * v.fPrime(x),
    domaine: (x) => u.domaine(x) && v.domaine(x),
  };
}

/**
 * La confrontation du module 1 : en un point, ce que la règle naïve PRÉDIT,
 * ce que la vraie pente VAUT, et l'écart entre les deux.
 *
 * `mesure` est la pente RÉELLEMENT MESURÉE sur la fonction assemblée, par
 * `numericDerivative` — l'élève n'a pas encore de règle du produit, donc rien
 * ne serait démontré par une formule qu'il ne connaît pas. C'est le seul usage
 * légitime du dérivé numérique : vérifier une prédiction, jamais juger.
 */
export function confronter(asm, x) {
  if (!asm.domaine(x)) throw new Error(`point hors du domaine de l’assemblage : x = ${x}`);
  const naif = asm.fPrimeNaif(x);
  const vrai = asm.fPrime(x);
  const mesure = numericDerivative(asm.f, x);
  return {
    x,
    naif,
    vrai,
    mesure,
    ecart: Math.abs(vrai - naif),
    /** La règle naïve tient-elle ici ? Tolérance large : on parle d'un ÉCART ÉCLATANT. */
    naifTient: Math.abs(vrai - naif) < 1e-6,
  };
}

/**
 * Le contre-exemple ÉCLATANT du module 1 : u = x², v = x, donc uv = x³.
 * (uv)′ = 3x² alors que u′v′ = 2x. En x = 2 : 12 contre 4 — un facteur 3.
 *
 * Balayé par le test sur tout l'intervalle du laboratoire, pour que
 * l'affirmation « regarde, ça ne colle pas » soit vraie PARTOUT où l'élève
 * peut se placer, pas seulement au point choisi par l'auteur.
 */
export const CONTRE_EXEMPLE = { gauche: 'carre', droite: 'identite', op: 'produit', k: 1 };

/**
 * Les points du cliquet du laboratoire.
 *
 * ILS COMMENCENT À 2, PAS À 1. En x = 1, le contre-exemple x² × x donne 3
 * contre 2 : un écart d'une unité, que l'élève peut mettre sur le compte d'un
 * arrondi. Le test qui BALAIE le cliquet l'a attrapé — un contre-exemple doit
 * être éclatant depuis TOUTE position atteignable, pas seulement depuis celle
 * que l'auteur a choisie.
 */
export const POINTS_LAB = [2, 3, 4, 5, 6];

// ─────────────────────────────────────────────────────────────────────────────
// LES DÉRIVÉES USUELLES — découvertes par le taux, pas récitées.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Le taux de variation entre a et a + h, développé et simplifié pour x^n :
 * il vaut n·a^(n−1) + (des termes qui contiennent h). Le module 2 fait
 * CALCULER ce taux pour de petits h et regarder vers quoi il se dirige.
 */
export function tauxUsuel(c, a, h) {
  if (!c.domaine(a) || !c.domaine(a + h)) return NaN;
  return (c.f(a + h) - c.f(a)) / h;
}

/** Les crans de h du module 2 : décroissants, exactement atteignables. */
export const H_STEPS = [1, 0.5, 0.1, 0.01, 0.001];

/**
 * La table que le module 2 affiche : pour une carte et un point, la suite des
 * taux, et le nombre exact sur lequel ils se posent.
 */
export function tableTaux(c, a) {
  return {
    carte: c,
    a,
    lignes: H_STEPS.map((h) => ({ h, taux: tauxUsuel(c, a, h) })),
    exact: c.fPrime(a),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// LE QUOTIENT (module 4) et LA COMPOSÉE SIMPLE (module 5).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Un quotient u/v, avec sa dérivée EXACTE (u′v − uv′)/v².
 * Le laboratoire du module 4 confronte, comme au module 1, la règle plausible
 * mais fausse « u′/v′ » à la pente réellement mesurée.
 */
export function quotient({ haut, bas }) {
  const u = carte(haut);
  const v = carte(bas);
  return {
    u, v,
    f: (x) => u.f(x) / v.f(x),
    fPrime: (x) => (u.fPrime(x) * v.f(x) - u.f(x) * v.fPrime(x)) / (v.f(x) * v.f(x)),
    /** Le piège symétrique de celui du produit : « je divise les dérivées ». */
    fPrimeNaif: (x) => u.fPrime(x) / v.fPrime(x),
    domaine: (x) => u.domaine(x) && v.domaine(x) && Math.abs(v.f(x)) > 1e-9 && v.fPrime(x) !== 0,
  };
}

/**
 * Une composée SIMPLE (ax + b)^n : la seule forme au programme ici.
 * Sa dérivée est n·a·(ax + b)^(n−1) — le facteur a est exactement ce que la
 * règle naïve « je dérive la puissance et j'oublie l'intérieur » perd.
 *
 * PÉRIMÈTRE : n entier ≥ 1 et a ≠ 0. Toute autre demande relève de la
 * Terminale et le constructeur la REFUSE (le périmètre se code, il ne se
 * commente pas).
 */
export function composee({ a, b, n }) {
  if (!Number.isInteger(n) || n < 1) throw new Error('composee : n doit être un entier ≥ 1');
  if (a === 0) throw new Error('composee : a nul rendrait la composée constante');
  const interieur = (x) => a * x + b;
  return {
    a, b, n,
    label: `(${a === 1 ? '' : a}x ${b >= 0 ? '+' : '−'} ${Math.abs(b)})^${n}`,
    f: (x) => interieur(x) ** n,
    fPrime: (x) => n * a * interieur(x) ** (n - 1),
    /** L'oubli classique : la dérivée « de l'extérieur » seule, sans le facteur a. */
    fPrimeNaif: (x) => n * interieur(x) ** (n - 1),
    domaine: () => true,
  };
}

/**
 * L'écart entre la dérivée juste et l'oubli du facteur intérieur, en un point.
 * Sert au module 5 ET au test : l'oubli doit être VISIBLE (facteur a ≠ 1),
 * sinon l'exercice n'enseigne rien.
 */
export const ecartComposee = (c, x) => Math.abs(c.fPrime(x) - c.fPrimeNaif(x));

// ─────────────────────────────────────────────────────────────────────────────
// LES ATELIERS MIXTES (module 6) — chaque énoncé porte SA dérivée littérale.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Les fonctions de l'atelier mixte : expression, dérivée écrite, et les deux
 * fonctions numériques qui permettent au TEST de vérifier que la dérivée
 * annoncée est bien la vraie. Aucun texte n'est cru sur parole.
 */
export const ATELIER = [
  {
    id: 'a1',
    regle: 'somme',
    expr: 'f(x) = 3x² + 5x − 7',
    derivee: 'f′(x) = 6x + 5',
    f: (x) => 3 * x * x + 5 * x - 7,
    fPrime: (x) => 6 * x + 5,
  },
  {
    id: 'a2',
    regle: 'produit',
    expr: 'g(x) = (2x + 1)(x² − 3)',
    derivee: 'g′(x) = 6x² + 2x − 6',
    f: (x) => (2 * x + 1) * (x * x - 3),
    fPrime: (x) => 6 * x * x + 2 * x - 6,
  },
  {
    id: 'a3',
    regle: 'quotient',
    expr: 'h(x) = x / (x + 1)',
    derivee: 'h′(x) = 1 / (x + 1)²',
    f: (x) => x / (x + 1),
    fPrime: (x) => 1 / (x + 1) ** 2,
    domaine: (x) => x !== -1,
  },
  {
    id: 'a4',
    regle: 'composee',
    expr: 'k(x) = (3x − 2)⁴',
    derivee: 'k′(x) = 12(3x − 2)³',
    f: (x) => (3 * x - 2) ** 4,
    fPrime: (x) => 12 * (3 * x - 2) ** 3,
  },
  {
    id: 'a5',
    regle: 'produit',
    expr: 'm(x) = x√x',
    derivee: 'm′(x) = (3/2)√x',
    f: (x) => x * Math.sqrt(x),
    fPrime: (x) => 1.5 * Math.sqrt(x),
    domaine: (x) => x > 0,
  },
];
