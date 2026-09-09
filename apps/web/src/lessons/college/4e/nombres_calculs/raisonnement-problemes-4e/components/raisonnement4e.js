/**
 * Noyau mathématique de « Raisonnement et résolution de problèmes » (4e).
 *
 * ─── POURQUOI CETTE LEÇON EXISTE, ET OÙ ELLE SE RATTACHE ──────────────
 * Le référentiel 2026 fait de la résolution de problèmes un AXE TRANSVERSAL
 * (`generation_rules.problem_solving_rule`), et lui donne un objet propre en
 * 6e et en 3e — jamais en 4e. Cette leçon est donc la part 3 de l'objet
 * officiel `calcul_litteral`, dont les deux premières parties sont
 * `calcul-litteral-4e` (transformer les expressions) et `equations-4e` (s'en
 * servir pour résoudre). Elle en est la suite naturelle : ce qu'on sait
 * transformer, on peut désormais s'en servir pour PROUVER.
 *
 * ─── CE QUE LA LEÇON ENSEIGNE VRAIMENT ────────────────────────────────
 * Pas des exercices de plus : un PROCESSUS.
 *     comprendre → extraire → représenter → choisir → calculer → vérifier → expliquer
 * Et surtout, la seule chose qui distingue les mathématiques d'une collection
 * d'observations : quelques exemples ne prouvent rien, un contre-exemple
 * réfute définitivement, et le calcul littéral démontre pour TOUS les cas à la
 * fois.
 *
 * ─── LE CŒUR : UNE CONJECTURE SE TESTE, ET LE TEST NE PROUVE PAS ──────
 * `tester(conjecture, valeurs)` renvoie les cas vérifiés ET les
 * contre-exemples. Une conjecture VRAIE reste « non prouvée » après cent
 * essais — c'est la fonction elle-même qui le dit (`statut`), pas une phrase
 * de la leçon. C'est ce qui rend la nécessité de la preuve tangible.
 *
 * ─── PÉRIMÈTRE, EN CODE ───────────────────────────────────────────────
 * Ni système d'équations, ni identité remarquable, ni équation produit nul :
 * objets de 3e.
 */

/* ══ Écritures ════════════════════════════════════════════════════════ */

export const round2 = (x) => Math.round((x + Number.EPSILON) * 100) / 100;

export const fr = (x, d = 2) =>
  Number.isFinite(x) ? x.toLocaleString('fr-FR', { maximumFractionDigits: d }) : '—';

/* ══ Les sept temps du processus ══════════════════════════════════════ */

/**
 * Les étapes de la résolution, dans l'ordre. Ce n'est pas une checklist
 * décorative : chaque module de la leçon en travaille une, et le module 6 les
 * enchaîne toutes sur un problème complet.
 */
export const ETAPES = [
  { id: 'comprendre', rang: 1, titre: 'Comprendre', question: 'Que raconte l’énoncé ? Que cherche-t-on ?' },
  { id: 'extraire', rang: 2, titre: 'Extraire', question: 'Quelles données servent vraiment ?' },
  { id: 'representer', rang: 3, titre: 'Représenter', question: 'Un schéma, un tableau, une figure ?' },
  { id: 'choisir', rang: 4, titre: 'Choisir', question: 'Quelle stratégie va aboutir ?' },
  { id: 'calculer', rang: 5, titre: 'Calculer', question: 'Faire le calcul, proprement.' },
  { id: 'verifier', rang: 6, titre: 'Vérifier', question: 'Le résultat est-il possible ? Revient-il dans l’énoncé ?' },
  { id: 'expliquer', rang: 7, titre: 'Expliquer', question: 'Une phrase qui répond à la question posée.' },
];

/** L'étape suivante, ou null à la fin. */
export const etapeApres = (id) => {
  const i = ETAPES.findIndex((e) => e.id === id);
  return i === -1 || i === ETAPES.length - 1 ? null : ETAPES[i + 1];
};

/* ══ Les conjectures ══════════════════════════════════════════════════ */

/**
 * Une CONJECTURE : un énoncé qu'on croit vrai, avec le moyen de le tester.
 * `predicat(n)` doit être une fonction PURE de l'entier testé.
 */
export const conjecture = ({ id, enonce, predicat, vraie, preuve }) => ({
  id, enonce, predicat, vraie, preuve,
});

/**
 * TESTER une conjecture sur une liste de valeurs.
 *
 * Renvoie les cas vérifiés, les CONTRE-EXEMPLES, et un `statut` :
 *   - 'refutee'      : au moins un contre-exemple — c'est DÉFINITIF ;
 *   - 'non-prouvee'  : aucun contre-exemple, mais rien n'est prouvé pour autant.
 *
 * Il n'y a délibérément PAS de statut « prouvée » : aucun nombre d'essais ne
 * prouve quoi que ce soit, et c'est la fonction elle-même qui le dit. La leçon
 * n'a pas besoin de le répéter — l'élève le lit à l'écran après cent essais.
 */
export function tester(conj, valeurs) {
  const resultats = valeurs.map((n) => ({ n, verifie: !!conj.predicat(n) }));
  const contreExemples = resultats.filter((r) => !r.verifie).map((r) => r.n);
  return {
    resultats,
    verifies: resultats.filter((r) => r.verifie).map((r) => r.n),
    contreExemples,
    statut: contreExemples.length > 0 ? 'refutee' : 'non-prouvee',
    // Le message est CALCULÉ, jamais écrit à la main dans un module : il ne
    // peut donc pas contredire les données.
    message: contreExemples.length > 0
      ? `${contreExemples[0]} est un contre-exemple : la conjecture est fausse.`
      : `${resultats.length} essais sans exception — mais ${resultats.length} essais ne prouvent rien.`,
  };
}

/** Le PREMIER contre-exemple dans un intervalle, ou null s'il n'y en a pas. */
export function chercherContreExemple(conj, de, a) {
  for (let n = de; n <= a; n += 1) {
    if (!conj.predicat(n)) return n;
  }
  return null;
}

/* ══ La preuve par le calcul littéral ═════════════════════════════════ */

/**
 * LA SOMME DE TROIS ENTIERS CONSÉCUTIFS.
 *
 * C'est l'exemple central de la leçon, et il est calculé, jamais écrit :
 *   n + (n+1) + (n+2) = 3n + 3 = 3(n+1)
 * donc la somme vaut toujours TROIS FOIS celui du milieu, et elle est donc
 * toujours un multiple de 3.
 */
export const sommeTroisConsecutifs = (n) => n + (n + 1) + (n + 2);

/** Les trois écritures de cette somme, telles que la preuve les enchaîne. */
export function etapesPreuveConsecutifs(n) {
  return [
    { forme: 'developpee', valeur: sommeTroisConsecutifs(n), texte: `${n} + ${n + 1} + ${n + 2}` },
    { forme: 'reduite', valeur: 3 * n + 3, texte: `3n + 3` },
    { forme: 'factorisee', valeur: 3 * (n + 1), texte: `3 × (n + 1)` },
  ];
}

/**
 * Le PROGRAMME DE CALCUL du module 1 : « choisis un nombre, ajoute 3,
 * multiplie par 2, retire le double du nombre de départ ».
 * Le résultat vaut toujours 6 — et l'algèbre le montre : 2(n + 3) − 2n = 6.
 */
export const programmeMystere = (n) => 2 * (n + 3) - 2 * n;

/** Les étapes du programme, pour les afficher et les vérifier une à une. */
export function etapesProgramme(n) {
  return [
    { rang: 1, consigne: 'Choisis un nombre', valeur: n },
    { rang: 2, consigne: 'Ajoute 3', valeur: n + 3 },
    { rang: 3, consigne: 'Multiplie par 2', valeur: 2 * (n + 3) },
    { rang: 4, consigne: 'Retire le double du nombre de départ', valeur: 2 * (n + 3) - 2 * n },
  ];
}

/* ══ Les stratégies ═══════════════════════════════════════════════════ */

/**
 * Les stratégies disponibles en 4e. Une situation en admet souvent PLUSIEURS :
 * la leçon fait comparer, elle n'impose pas.
 */
export const STRATEGIES = [
  { id: 'essais', nom: 'Essais organisés', quand: 'quand les valeurs possibles sont peu nombreuses' },
  { id: 'remonter', nom: 'Remonter à l’envers', quand: 'quand on connaît le résultat et qu’on cherche le départ' },
  { id: 'schema', nom: 'Un schéma en barres', quand: 'quand des parts se comparent ou se partagent' },
  { id: 'equation', nom: 'Une équation', quand: 'quand une quantité inconnue intervient plusieurs fois' },
  { id: 'litteral', nom: 'Le calcul littéral', quand: 'quand il faut prouver pour TOUS les nombres' },
];

/* ══ La vérification ══════════════════════════════════════════════════ */

/**
 * Un résultat est-il PLAUSIBLE ? Le contrôle qu'on fait avant même de
 * vérifier le calcul : un âge négatif, un nombre de personnes décimal, un prix
 * supérieur au budget.
 */
export function plausible(valeur, contraintes = {}) {
  const raisons = [];
  if (contraintes.positif && valeur <= 0) raisons.push('une telle grandeur ne peut pas être négative ou nulle');
  if (contraintes.entier && !Number.isInteger(valeur)) raisons.push('on ne peut pas en compter une partie');
  if (contraintes.max != null && valeur > contraintes.max) raisons.push(`c’est plus que le maximum possible (${contraintes.max})`);
  if (contraintes.min != null && valeur < contraintes.min) raisons.push(`c’est moins que le minimum possible (${contraintes.min})`);
  return { ok: raisons.length === 0, raisons };
}

/**
 * VÉRIFIER DANS L'HISTOIRE, pas dans la dernière ligne.
 *
 * On remet la valeur trouvée dans l'ÉNONCÉ de départ et on regarde si tout
 * retombe juste. Une erreur de calcul en cours de route se voit ainsi, alors
 * que refaire le dernier calcul la reproduirait à l'identique.
 */
export function verifierDansLHistoire(valeur, controles) {
  const details = controles.map((c) => ({
    libelle: c.libelle,
    attendu: c.attendu,
    obtenu: round2(c.calcul(valeur)),
    ok: Math.abs(c.calcul(valeur) - c.attendu) < 0.005,
  }));
  return { ok: details.every((d) => d.ok), details };
}

/* ══ Le périmètre, en code ════════════════════════════════════════════ */

/**
 * FRONTIÈRE 4e / 3e, EXÉCUTABLE. Cette leçon ne résout ni système de deux
 * équations, ni équation produit nul, et n'utilise aucune identité
 * remarquable : ce sont des objets de 3e (`equations-produit`,
 * `calcul-litteral-algebrique`, `resolution-problemes-3e`).
 */
export function assertScope4e(sujet) {
  const interdits = {
    systeme: 'un système de deux équations est un objet de 3e',
    'produit-nul': 'l’équation produit nul est un objet de 3e',
    'identite-remarquable': 'les identités remarquables sont des objets de 3e',
    inequation: 'les inéquations sont des objets de 3e',
  };
  if (interdits[sujet]) throw new Error(`Hors programme de 4e : ${interdits[sujet]}`);
  return true;
}

/* ══ Les données de la leçon ══════════════════════════════════════════ */

/** Les conjectures du module 5 — une vraie, une fausse, vérifiées par test. */
export const CONJECTURES = {
  sommeMultipleDe3: conjecture({
    id: 'somme-multiple-3',
    enonce: 'La somme de trois entiers consécutifs est toujours un multiple de 3.',
    predicat: (n) => sommeTroisConsecutifs(n) % 3 === 0,
    vraie: true,
    preuve: 'n + (n+1) + (n+2) = 3n + 3 = 3 × (n+1) : c’est trois fois le nombre du milieu.',
  }),
  sommeToujoursPaire: conjecture({
    id: 'somme-paire',
    enonce: 'La somme de trois entiers consécutifs est toujours paire.',
    predicat: (n) => sommeTroisConsecutifs(n) % 2 === 0,
    vraie: false,
    preuve: null,
  }),
  carrePlusGrand: conjecture({
    id: 'carre-plus-grand',
    enonce: 'Le carré d’un nombre est toujours plus grand que ce nombre.',
    predicat: (n) => n * n > n,
    vraie: false,
    preuve: null,
  }),
};

/** Le problème complet du module 6, avec ses contrôles de vérification. */
export const PROBLEME_FINAL = {
  enonce:
    'Un club achète 3 ballons et 2 filets pour 74 €. Un ballon coûte 4 € de plus qu’un filet.',
  question: 'Combien coûte un filet ?',
  // filet = f, ballon = f + 4 → 3(f + 4) + 2f = 74 → 5f + 12 = 74 → f = 12,4
  solution: 12.4,
  controles: [
    { libelle: 'prix d’un ballon', attendu: 16.4, calcul: (f) => f + 4 },
    { libelle: 'total payé', attendu: 74, calcul: (f) => 3 * (f + 4) + 2 * f },
  ],
  contraintes: { positif: true, max: 74 },
  donneesInutiles: ['le club compte 28 adhérents', 'la commande est arrivée en trois jours'],
};
