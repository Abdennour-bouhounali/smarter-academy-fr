/**
 * Données de « Probabilités : inverser le conditionnement et l'indépendance ».
 *
 * TOUT PART D'EFFECTIFS ENTIERS. Aucune probabilité n'est saisie en décimal :
 * chacune est la fraction exacte d'un comptage (components/indepUtils.js).
 * C'est ce qui permet à la leçon d'affirmer « les deux poids sont IDENTIQUES »
 * et « P(A ∩ B) = P(A) × P(B) EXACTEMENT » sans qu'un flottant vienne la
 * démentir à l'écran.
 *
 * QUATRE SITUATIONS, QUATRE RÔLES :
 *
 *  · LE LYCÉE (module 1, l'interaction signature) — 1 000 élèves, croisant
 *    « porte des lunettes » (A) et « est inscrit au club de sport » (B). B est
 *    fixé à 400 ; A et l'intersection se règlent EN GLISSANT. Deux arbres de
 *    la MÊME population, l'un conditionné par A d'abord, l'autre par B
 *    d'abord. Le scénario est choisi pour que l'indépendance soit
 *    INTUITIVEMENT plausible : rien ne relie la vue au sport, et pourtant
 *    l'élève va devoir CHERCHER le réglage qui la réalise exactement.
 *
 *  · LE STAGE (modules 2, 6) — 500 candidats, croisant « a suivi la
 *    préparation » et « est reçu ». Les deux sens du conditionnement y sont
 *    spectaculairement différents (90 % contre 45 %) parce que les deux
 *    groupes n'ont pas la même taille. C'est le cas de figure où « inverser,
 *    c'est échanger deux lettres » se casse le nez.
 *
 *  · LES DEUX DÉS / LES CARTES (modules 4, 5) — les situations classiques où
 *    l'indépendance se VÉRIFIE par le calcul, et où l'incompatibilité vient se
 *    confondre avec elle.
 *
 *  · L'ATELIER (module 5) — 2 000 pièces, deux machines : un problème concret
 *    qui demande les deux sens ET le test d'indépendance.
 *
 * Vérifié par components/indepUtils.test.js : entiers, sommes exactes, sommes
 * de branches à 1, valeurs citées recalculées, atteignabilité de la cible au
 * glisser, distracteurs distincts.
 */
import {
  rat, ratSum, ratEq, crossFromCounts, treeFromCross, independence,
  conditional, LAB_TOTAL, LAB_NB,
} from './components/indepUtils';

/* ══ Module 1 — les deux arbres qu'on retourne ═══════════════════════════ */

export const LAB_LABELS = {
  total: 'élèves du lycée',
  a: 'porte des lunettes',
  aShort: 'à lunettes',
  notA: 'sans lunettes',
  b: 'est inscrit au club de sport',
  bShort: 'au club de sport',
  notB: 'hors du club',
};

/**
 * État de départ : ni l'indépendance, ni un cas extrême. P_A(B) = 200/600 =
 * 33,3 % et P_B(A) = 200/400 = 50 % : les deux sens diffèrent nettement, ce qui
 * est le premier constat à faire naître.
 */
export const LAB_START = { nA: 600, nAB: 200 };

/**
 * LA CIBLE D'INDÉPENDANCE de la mission. n(A ∩ B) × 1 000 = 200 000 =
 * 500 × 400 : l'égalité est exacte sur des ENTIERS. Les deux poids de deuxième
 * génération valent alors 2/5 dans l'arbre par A, et 1/2 dans l'arbre par B —
 * identiques DANS chaque arbre, et différents d'un arbre à l'autre.
 * Vingt réglages d'indépendance sont atteignables au pas de 10 ; celui-ci est
 * seulement le plus lisible, et le test exhibe le chemin qui y mène.
 */
export const LAB_INDEP = { nA: 500, nAB: 200 };

/** Un second réglage d'indépendance, pour montrer qu'il n'est pas unique. */
export const LAB_INDEP_2 = { nA: 300, nAB: 120 };

/**
 * L'état INCOMPATIBLE : aucun élève à lunettes au club de sport. Atteignable
 * au glisser (nAB = 0 est un cran), et c'est LUI qui porte le cœur de P4 :
 * P(A ∩ B) = 0 alors que P(A) × P(B) = 0,2 × 0,4 = 0,08 > 0.
 */
export const LAB_INCOMPATIBLE = { nA: 200, nAB: 0 };

/* ══ Modules 2, 6 — le stage de préparation ══════════════════════════════ */

/**
 * 500 candidats. 100 ont suivi la préparation, dont 90 sont reçus ; sur les
 * 400 autres, 110 sont reçus. Les deux sens du conditionnement :
 *   P_prépa(reçu)  = 90 / 100 = 90 %
 *   P_reçu(prépa)  = 90 / 200 = 45 %
 * Même numérateur, deux dénominateurs — et un écart du simple au double, qui
 * rend le constat impossible à confondre avec un arrondi.
 */
export const STAGE = {
  population: 500,
  counts: {
    prepa: { recu: 90, echoue: 10 },
    sansPrepa: { recu: 110, echoue: 290 },
  },
  labels: {
    prepa: 'a suivi la préparation', sansPrepa: 'n’a pas suivi la préparation',
    recu: 'reçu', echoue: 'non reçu',
    prepaShort: 'préparés', sansPrepaShort: 'non préparés',
    recuShort: 'reçus', echoueShort: 'non reçus',
  },
};

export const stageTable = () => crossFromCounts({
  rows: ['prepa', 'sansPrepa'],
  cols: ['recu', 'echoue'],
  cells: STAGE.counts,
  total: STAGE.population,
});

export const stageTreeByPrepa = () => treeFromCross(stageTable(), { firstAxis: 'row' });
export const stageTreeByRecu = () => treeFromCross(stageTable(), { firstAxis: 'col' });

/* ══ Module 3 — reconnaître l'indépendance À L'ŒIL ═══════════════════════ */

/**
 * QUATRE TABLEAUX À JUGER, dont deux seulement sont indépendants. Chacun
 * déclare le verdict ATTENDU ; le test le recalcule et refuse un désaccord —
 * c'est ainsi qu'une leçon ne peut pas affirmer le contraire de ses données.
 *
 * `nearMiss` marque les tableaux conçus pour être PRESQUE indépendants : à
 * l'œil, les deux poids se ressemblent, et seul le calcul tranche. C'est la
 * raison d'être du module 4 — l'œil repère un candidat, il ne conclut pas.
 */
export const CAS = [
  {
    id: 'c1',
    title: 'Le sondage du lycée',
    rows: ['A', 'nonA'], cols: ['B', 'nonB'],
    total: 1000,
    cells: { A: { B: 200, nonB: 300 }, nonA: { B: 200, nonB: 300 } },
    labels: { A: 'porte des lunettes', nonA: 'sans lunettes', B: 'au club de sport', nonB: 'hors du club' },
    expectIndependent: true,
    nearMiss: false,
    explain:
      'Parmi les 500 élèves à lunettes, 200 sont au club : 40 %. Parmi les 500 autres, 200 aussi : 40 %. Les deux poids de deuxième génération sont identiques — savoir qu’un élève porte des lunettes ne change rien à sa chance d’être au club.',
  },
  {
    id: 'c2',
    title: 'Le club et l’internat',
    rows: ['A', 'nonA'], cols: ['B', 'nonB'],
    total: 800,
    cells: { A: { B: 180, nonB: 120 }, nonA: { B: 200, nonB: 300 } },
    labels: { A: 'interne', nonA: 'externe', B: 'au club de sport', nonB: 'hors du club' },
    expectIndependent: false,
    nearMiss: false,
    explain:
      'Parmi les 300 internes, 180 sont au club : 60 %. Parmi les 500 externes, 200 : 40 %. Les deux poids diffèrent — être interne change la chance d’être au club.',
  },
  {
    id: 'c3',
    title: 'Les deux ateliers',
    rows: ['A', 'nonA'], cols: ['B', 'nonB'],
    total: 1200,
    cells: { A: { B: 90, nonB: 210 }, nonA: { B: 270, nonB: 630 } },
    labels: { A: 'atelier du matin', nonA: 'atelier du soir', B: 'pièce contrôlée', nonB: 'non contrôlée' },
    expectIndependent: true,
    nearMiss: false,
    explain:
      'Parmi les 300 pièces du matin, 90 sont contrôlées : 30 %. Parmi les 900 du soir, 270 : 30 % aussi. Les deux ateliers n’ont pas du tout le même volume, et pourtant les poids coïncident.',
  },
  {
    id: 'c4',
    title: 'Le presque-cas',
    rows: ['A', 'nonA'], cols: ['B', 'nonB'],
    total: 1000,
    cells: { A: { B: 124, nonB: 276 }, nonA: { B: 180, nonB: 420 } },
    labels: { A: 'demi-pensionnaire', nonA: 'externe', B: 'au club de sport', nonB: 'hors du club' },
    expectIndependent: false,
    nearMiss: true,
    explain:
      'Parmi les 400 demi-pensionnaires, 124 sont au club : 31 %. Parmi les 600 externes, 180 : 30 %. À l’œil, c’est la même chose — et pourtant 124 × 1 000 = 124 000 tandis que 400 × 304 = 121 600. Ce n’est pas égal : ces deux événements ne sont pas indépendants.',
  },
];

export const casTable = (cas) => crossFromCounts({
  rows: cas.rows, cols: cas.cols, cells: cas.cells, total: cas.total,
});

/* ══ Module 4 — vérifier par le calcul, les trois écritures ══════════════ */

/**
 * LE LANCER DE DEUX DÉS, la situation où le calcul est la SEULE issue : on ne
 * peut pas « voir » l'indépendance sur 36 issues.
 *   A = « le premier dé donne un nombre pair »        → 18 issues sur 36
 *   B = « la somme des deux dés vaut 7 »              →  6 issues sur 36
 *   A ∩ B = { (2,5), (4,3), (6,1) }                   →  3 issues sur 36
 * 3 × 36 = 108 et 18 × 6 = 108 : indépendants, EXACTEMENT. Contre-intuitif :
 * la somme semble « dépendre » du premier dé, et pour la somme 7 elle n'en
 * dépend pas — parce que quel que soit le premier dé, un seul second dé
 * convient.
 */
export const DES = {
  total: 36,
  cells: { pair: { somme7: 3, autre: 15 }, impair: { somme7: 3, autre: 15 } },
  labels: {
    pair: 'premier dé pair', impair: 'premier dé impair',
    somme7: 'somme = 7', autre: 'somme ≠ 7',
  },
};
export const desTable = () => crossFromCounts({
  rows: ['pair', 'impair'], cols: ['somme7', 'autre'], cells: DES.cells, total: DES.total,
});

/**
 * LA MÊME EXPÉRIENCE, UN AUTRE ÉVÉNEMENT : B' = « la somme vaut 8 ».
 *   B' → 5 issues ; A ∩ B' = { (2,6), (4,4), (6,2) } → 3 issues.
 * 3 × 36 = 108 mais 18 × 5 = 90 : NON indépendants. Deux événements presque
 * identiques dans leur formulation, deux verdicts opposés — l'indépendance ne
 * se devine pas, elle se calcule.
 */
export const DES8 = {
  total: 36,
  cells: { pair: { somme8: 3, autre: 15 }, impair: { somme8: 2, autre: 16 } },
  labels: { pair: 'premier dé pair', impair: 'premier dé impair', somme8: 'somme = 8', autre: 'somme ≠ 8' },
};
export const des8Table = () => crossFromCounts({
  rows: ['pair', 'impair'], cols: ['somme8', 'autre'], cells: DES8.cells, total: DES8.total,
});

/* ══ Module 5 — incompatibilité, et le problème concret ══════════════════ */

/**
 * LE JEU DE 52 CARTES, où les deux pièges se touchent.
 *   « cœur » et « roi »   : 1 carte commune, 13 × 4 = 52 = 1 × 52 → INDÉPENDANTS
 *   « cœur » et « pique » : 0 carte commune → INCOMPATIBLES, donc PAS indépendants
 * Deux paires prises dans le même jeu, l'une indépendante, l'autre
 * incompatible : le contraste est immédiat et ne demande aucun contexte neuf.
 */
export const CARTES = {
  total: 52,
  coeurRoi: {
    rows: ['coeur', 'autreCouleur'], cols: ['roi', 'autreRang'],
    cells: { coeur: { roi: 1, autreRang: 12 }, autreCouleur: { roi: 3, autreRang: 36 } },
    labels: { coeur: 'cœur', autreCouleur: 'autre couleur', roi: 'roi', autreRang: 'autre rang' },
  },
  coeurPique: {
    rows: ['coeur', 'autreCouleur'], cols: ['pique', 'autreCouleur2'],
    cells: { coeur: { pique: 0, autreCouleur2: 13 }, autreCouleur: { pique: 13, autreCouleur2: 26 } },
    labels: { coeur: 'cœur', autreCouleur: 'pas un cœur', pique: 'pique', autreCouleur2: 'pas un pique' },
  },
};
export const cartesCoeurRoi = () => crossFromCounts({
  rows: CARTES.coeurRoi.rows, cols: CARTES.coeurRoi.cols,
  cells: CARTES.coeurRoi.cells, total: CARTES.total,
});
export const cartesCoeurPique = () => crossFromCounts({
  rows: CARTES.coeurPique.rows, cols: CARTES.coeurPique.cols,
  cells: CARTES.coeurPique.cells, total: CARTES.total,
});

/**
 * L'ATELIER — le problème concret de P5. 2 000 pièces, deux machines.
 *   M1 : 1 200 pièces, 60 défectueuses  (5 %)
 *   M2 :   800 pièces, 40 défectueuses  (5 %)
 * Les taux de défaut coïncident : « défectueuse » et « vient de M1 » sont
 * INDÉPENDANTS — 100 × 2 000 = 200 000 = 1 200 × 100. Le problème demande les
 * deux sens du conditionnement ET le verdict d'indépendance, ce qui en fait le
 * lieu naturel où P1, P3 et P5 se rejoignent.
 */
export const ATELIER = {
  total: 2000,
  cells: { m1: { defectueuse: 60, conforme: 1140 }, m2: { defectueuse: 40, conforme: 760 } },
  labels: { m1: 'machine 1', m2: 'machine 2', defectueuse: 'défectueuse', conforme: 'conforme' },
};
export const atelierTable = () => crossFromCounts({
  rows: ['m1', 'm2'], cols: ['defectueuse', 'conforme'], cells: ATELIER.cells, total: ATELIER.total,
});

/* ══ Module 6 — les nombres du boss, tous vérifiés ═══════════════════════ */

/**
 * Pour chaque épreuve numérique : la bonne réponse et ses pièges, en fractions
 * EXACTES. Le test vérifie qu'ils sont deux à deux distincts, distincts après
 * mise en forme en pourcentage, et tous dans [0 ; 1].
 *
 * Chaque piège est une ERREUR NOMMÉE par la leçon :
 *   e1  inverser en échangeant les lettres (rendre P_A(B) pour P_B(A))
 *   e2  prendre le total pour dénominateur au lieu de l'univers d'arrivée
 *   e4  additionner P(A) et P(B) au lieu de les multiplier
 *   e8  croire que deux événements incompatibles se multiplient quand même
 */
export const BOSS_NUMBERS = {
  //          90/200 = 45 %        90/100 (l'autre sens)  90/500 (le total)  200/500
  e1: { correct: rat(9, 20), traps: [rat(9, 10), rat(9, 50), rat(2, 5)], dp: 1 },
  //          60/1200 = 5 %        60/2000 (le total)     60/100 (l'autre sens)  40/800 + 60/1200
  e2: { correct: rat(1, 20), traps: [rat(3, 100), rat(3, 5), rat(1, 10)], dp: 1 },
  //          0,25 × 0,4 = 0,1     0,25 + 0,4             0,4 − 0,25          0,25
  e4: { correct: rat(1, 10), traps: [rat(13, 20), rat(3, 20), rat(1, 4)], dp: 1 },
  //          0 (incompatibles)    P(A)×P(B)              P(A)+P(B)           P(B)
  e8: { correct: rat(0, 1), traps: [rat(3, 50), rat(1, 2), rat(1, 5)], dp: 1 },
};

/* ══ Vérification interne au chargement (le périmètre est CODÉ) ══════════ */

/**
 * Le module refuse de se charger sur des données fausses : une leçon ne doit
 * jamais s'afficher avec un arbre dont les branches ne somment pas à 1, ni
 * avec un cas déclaré « indépendant » qui ne l'est pas. Cette garde double le
 * test — elle protège aussi l'exécution.
 */
(function assertData() {
  const trees = [
    stageTreeByPrepa(), stageTreeByRecu(),
    treeFromCross(atelierTable(), { firstAxis: 'row' }),
    treeFromCross(desTable(), { firstAxis: 'row' }),
  ];
  for (const tree of trees) {
    const s = ratSum(tree.map((b) => b.p));
    if (s.n !== s.d) throw new Error(`data.js: poids du 1er niveau = ${s.n}/${s.d} ≠ 1`);
    for (const b of tree) {
      const sc = ratSum(b.children.map((c) => c.p));
      if (sc.n !== sc.d) throw new Error(`data.js: branches de ${b.id} = ${sc.n}/${sc.d} ≠ 1`);
    }
  }
  // Chaque cas du module 3 doit RÉELLEMENT porter le verdict qu'il annonce.
  for (const cas of CAS) {
    const ind = independence(casTable(cas), { rowKey: 'A', colKey: 'B' });
    if (ind.independent !== cas.expectIndependent) {
      throw new Error(`data.js: le cas ${cas.id} annonce independent=${cas.expectIndependent} mais vaut ${ind.independent}`);
    }
    if (ind.degenerate) throw new Error(`data.js: le cas ${cas.id} est dégénéré`);
  }
  // La cible d'indépendance du module 1 doit en être une.
  const cible = independence(
    crossFromCounts({
      rows: ['A', 'nonA'], cols: ['B', 'nonB'],
      cells: {
        A: { B: 200, nonB: 300 },
        nonA: { B: LAB_NB - 200, nonB: LAB_TOTAL - 500 - (LAB_NB - 200) },
      },
      total: LAB_TOTAL,
    }),
    { rowKey: 'A', colKey: 'B' },
  );
  if (!cible.independent || cible.degenerate) throw new Error('data.js: la cible du module 1 n’est pas indépendante');
  // Les deux paires de cartes doivent porter les deux verdicts opposés.
  const cr = independence(cartesCoeurRoi(), { rowKey: 'coeur', colKey: 'roi' });
  if (!cr.independent) throw new Error('data.js: cœur et roi devraient être indépendants');
  const cp = independence(cartesCoeurPique(), { rowKey: 'coeur', colKey: 'pique' });
  if (cp.independent) throw new Error('data.js: cœur et pique ne peuvent pas être indépendants');
  // Le stage doit bien montrer deux sens DIFFÉRENTS.
  const t = stageTable();
  const direct = conditional(t, { axis: 'row', key: 'prepa' }, 'recu');
  const inverse = conditional(t, { axis: 'col', key: 'recu' }, 'prepa');
  if (ratEq(direct, inverse)) throw new Error('data.js: le stage n’oppose plus les deux sens');
})();
