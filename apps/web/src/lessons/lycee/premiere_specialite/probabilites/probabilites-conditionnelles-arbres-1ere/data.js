/**
 * Données de « Probabilités conditionnelles : arbres et probabilités totales ».
 *
 * TOUT PART D'EFFECTIFS ENTIERS. Aucune probabilité n'est saisie en décimal :
 * chacune est la fraction exacte d'un comptage (components/condUtils.js). C'est
 * ce qui permet à la leçon d'affirmer « la somme des branches vaut 1 » et
 * « 990 sur 2 970 » sans qu'un flottant vienne la démentir.
 *
 * TROIS SITUATIONS, TROIS RÔLES :
 *
 *  · LA BARRE (module 1) — 1 000 personnes d'un quartier, croisant « fait du
 *    vélo » (A) et « habite à moins de 2 km du centre » (B). La composition se
 *    règle EN GLISSANT deux séparations. Le scénario est neutre : ce qui
 *    compte, c'est que le même effectif d'intersection produise des
 *    pourcentages différents selon l'univers où on se place.
 *
 *  · LE DÉPISTAGE (modules 2, 3, 6) — 100 000 personnes, maladie touchant 1 %,
 *    test sensible à 99 % et spécifique à 98 %. Les effectifs tombent tous
 *    justes et le paradoxe est EXACT : 990 vrais positifs contre 1 980 faux
 *    positifs, soit P_positif(malade) = 990/2 970 = 1/3 tout rond. C'est le
 *    meilleur exemple pédagogique parce que le résultat contredit l'intuition
 *    sans qu'aucun chiffre ne soit truqué.
 *
 *  · LES FOURNISSEURS (modules 4, 5) — 10 000 composants, TROIS fournisseurs.
 *    Trois parts, et non deux : la partition de la Première n'est pas
 *    seulement « A et son contraire », et la formule des probabilités totales
 *    prend là tout son sens. Les poids 60/30/10 % et les taux 2/5/10 % donnent
 *    P(défectueux) = 37/1 000, que ni la moyenne des taux (5,7 %) ni le taux du
 *    plus gros fournisseur (2 %) ne produisent.
 *
 * Vérifié par components/condUtils.test.js : entiers, sommes exactes, sommes de
 * branches à 1, valeurs citées, réalisabilité de la mission au glisser,
 * distracteurs distincts.
 */
import {
  rat, ratSum, crossFromCounts, treeFromCross, totalProbability,
  conditional, BAR_TOTAL,
} from './components/condUtils';

/* ══ Module 1 — la barre de population qui rétrécit ══════════════════════ */

/**
 * Le scénario de la barre. `nAnotB` — combien de cyclistes parmi ceux qui
 * habitent LOIN — est fixé : la mission ne porte que sur les deux séparations
 * que l'élève fait glisser, et un troisième réglage brouillerait la lecture.
 */
export const BAR_SCENARIO = { total: BAR_TOTAL, nAnotB: 120 };

/** État de départ du laboratoire : ni l'une ni l'autre des cibles. */
export const BAR_START = { ...BAR_SCENARIO, nB: 400, nAB: 200 };

/**
 * LES DEUX COMPOSITIONS DE LA MISSION. Même effectif d'intersection (150
 * personnes à la fois cyclistes et proches du centre), donc même P(A ∩ B) =
 * 0,15 ; mais l'univers « proches du centre » passe de 200 à 600 personnes,
 * donc P_B(A) passe de 75 % à 25 %. Le comptage n'a pas bougé : le
 * DÉNOMINATEUR a changé.
 */
export const MISSION_A = { ...BAR_SCENARIO, nB: 200, nAB: 150 };
export const MISSION_B = { ...BAR_SCENARIO, nB: 600, nAB: 150 };

export const BAR_LABELS = {
  total: 'habitants du quartier',
  b: 'habitent à moins de 2 km du centre',
  bShort: 'proches du centre',
  notB: 'habitent plus loin',
  a: 'font du vélo',
  aShort: 'cyclistes',
};

/* ══ Modules 2, 3, 6 — le dépistage ══════════════════════════════════════ */

/**
 * 100 000 personnes. Les quatre cases sont posées EN EFFECTIFS, pas en taux :
 * c'est le comptage qui est premier, les pourcentages n'en sont que la lecture.
 *   990 malades détectés · 10 malades manqués
 *   1 980 sains alarmés à tort · 97 020 sains rassurés
 */
export const DEPISTAGE = {
  population: 100000,
  counts: {
    malade: { positif: 990, negatif: 10 },
    sain: { positif: 1980, negatif: 97020 },
  },
  labels: {
    malade: 'malade', sain: 'en bonne santé',
    positif: 'test positif', negatif: 'test négatif',
    maladeShort: 'malades', sainShort: 'bien portants',
    positifShort: 'testés positifs', negatifShort: 'testés négatifs',
  },
  /** Ce que la leçon AFFICHE du paradoxe — recalculé par le test. */
  paradoxe: { numerateur: 990, denominateur: 2970, display: '33,3 %' },
};

export const depistageTable = () => crossFromCounts({
  rows: ['malade', 'sain'],
  cols: ['positif', 'negatif'],
  cells: DEPISTAGE.counts,
  total: DEPISTAGE.population,
});

/** L'arbre « état de santé, puis résultat du test » — l'ordre chronologique. */
export const depistageTree = () => treeFromCross(depistageTable(), { firstAxis: 'row' });

/* ══ Modules 4, 5 — les trois fournisseurs ═══════════════════════════════ */

export const FOURNISSEURS = [
  { id: 'F1', label: 'Fournisseur 1', count: 6000, defectueux: 120, part: '60 %', taux: '2 %' },
  { id: 'F2', label: 'Fournisseur 2', count: 3000, defectueux: 150, part: '30 %', taux: '5 %' },
  { id: 'F3', label: 'Fournisseur 3', count: 1000, defectueux: 100, part: '10 %', taux: '10 %' },
];

export const FOURNISSEURS_TOTAL = 10000;

export const fournisseursTable = () => crossFromCounts({
  rows: FOURNISSEURS.map((f) => f.id),
  cols: ['defectueux', 'conforme'],
  cells: Object.fromEntries(FOURNISSEURS.map((f) => [
    f.id, { defectueux: f.defectueux, conforme: f.count - f.defectueux },
  ])),
  total: FOURNISSEURS_TOTAL,
});

export const fournisseursTree = () => treeFromCross(fournisseursTable(), { firstAxis: 'row' });

/** Étiquettes courtes de l'arbre, pour ProbabilityTree (place limitée). */
export const FOURNISSEURS_TREE_LABELS = { defectueux: 'D', conforme: 'C' };

/* ══ Module 4 — exploiter l'arbre : produits et sommes ═══════════════════ */

/**
 * Chaque entrée déclare CE QUE LE NOYAU DOIT RETROUVER (`expected`) : le test
 * recalcule et compare. Aucun nombre n'est écrit à la main sans être vérifié.
 */
export const EXPLOITATION = [
  {
    id: 'x1',
    kind: 'chemin',
    tree: fournisseursTree,
    first: 'F2', second: 'defectueux',
    expected: rat(3, 200),
    display: '1,5 %',
    dp: 1,
    prompt: 'Quelle est la probabilité qu’un composant vienne du fournisseur 2 ET soit défectueux ?',
    explain:
      'On suit le chemin F2 → défectueux et on multiplie les deux poids rencontrés : 0,30 × 0,05 = 0,015, soit 1,5 %. En effectifs : 3 000 composants du fournisseur 2, dont 150 défectueux — et 150 sur 10 000 fait bien 1,5 %.',
  },
  {
    id: 'x2',
    kind: 'chemin',
    tree: fournisseursTree,
    first: 'F3', second: 'defectueux',
    expected: rat(1, 100),
    display: '1 %',
    dp: 1,
    prompt: 'Et la probabilité qu’il vienne du fournisseur 3 ET soit défectueux ?',
    explain:
      'Le long du chemin F3 → défectueux : 0,10 × 0,10 = 0,01, soit 1 %. En effectifs : 100 pièces sur 10 000. Le fournisseur 3 ne livre qu’un composant sur dix, ce qui atténue son taux de 10 %.',
  },
  {
    id: 'x3',
    kind: 'totale',
    tree: fournisseursTree,
    second: 'defectueux',
    expected: rat(37, 1000),
    display: '3,7 %',
    dp: 1,
    prompt: 'Trois chemins mènent à « défectueux ». Quelle est la probabilité qu’un composant pris au hasard soit défectueux ?',
    explain:
      'On additionne les trois chemins : 0,012 + 0,015 + 0,010 = 0,037, soit 3,7 %. En effectifs : 120 + 150 + 100 = 370 défectueux sur 10 000.',
  },
];

/* ══ Module 5 — la formule des probabilités totales ══════════════════════ */

/**
 * Trois situations dont l'univers est réellement PARTITIONNÉ. `moyennePiege`
 * est la moyenne simple des poids conditionnels — l'erreur qui consiste à
 * oublier que les parts n'ont pas le même poids ; le test vérifie qu'elle
 * diffère toujours de la bonne réponse.
 */
export const TOTALES = [
  {
    id: 't1',
    title: 'Les trois fournisseurs',
    tree: fournisseursTree,
    event: 'defectueux',
    parts: ['F1', 'F2', 'F3'],
    expected: rat(37, 1000),
    display: '3,7 %',
    moyennePiege: '5,7 %',
    nPaths: 3,
    context:
      'Un atelier reçoit 60 % de ses composants du fournisseur 1, 30 % du fournisseur 2 et 10 % du fournisseur 3. Leurs taux de défaut sont respectivement 2 %, 5 % et 10 %.',
    question: 'Quelle est la probabilité qu’un composant pris au hasard soit défectueux ?',
    explain:
      'Les trois fournisseurs se partagent la totalité des composants sans recouvrement : chaque composant vient d’un fournisseur et d’un seul. On peut donc additionner les trois chemins : 0,60 × 0,02 + 0,30 × 0,05 + 0,10 × 0,10 = 0,037, soit 3,7 %. La moyenne des trois taux donnerait 5,7 % : elle traiterait les trois fournisseurs comme s’ils livraient autant, ce qui est faux.',
  },
  {
    id: 't2',
    title: 'Trois ateliers, un même produit',
    tree: () => treeFromCross(crossFromCounts({
      rows: ['A1', 'A2', 'A3'],
      cols: ['retard', 'heure'],
      // 20 000 colis : 10 000 / 6 000 / 4 000 ; retards 5 % / 10 % / 25 %
      cells: {
        A1: { retard: 500, heure: 9500 },
        A2: { retard: 600, heure: 5400 },
        A3: { retard: 1000, heure: 3000 },
      },
      total: 20000,
    }), { firstAxis: 'row' }),
    event: 'retard',
    parts: ['A1', 'A2', 'A3'],
    expected: rat(21, 200),
    display: '10,5 %',
    moyennePiege: '13,3 %',
    nPaths: 3,
    context:
      'Un service expédie 50 % de ses colis depuis l’atelier 1, 30 % depuis l’atelier 2 et 20 % depuis l’atelier 3. Les colis arrivent en retard dans 5 % des cas depuis le 1, 10 % depuis le 2 et 25 % depuis le 3.',
    question: 'Quelle est la probabilité qu’un colis arrive en retard ?',
    explain:
      '0,50 × 0,05 + 0,30 × 0,10 + 0,20 × 0,25 = 0,025 + 0,030 + 0,050 = 0,105, soit 10,5 %. La moyenne des trois taux donnerait 13,3 % : l’atelier le plus fiable expédie la moitié des colis, il tire le résultat vers le bas.',
  },
  {
    id: 't3',
    title: 'Le dépistage, revu par la formule',
    tree: depistageTree,
    event: 'positif',
    parts: ['malade', 'sain'],
    expected: rat(297, 10000),
    display: '3 %',
    moyennePiege: '51 %',
    nPaths: 2,
    dp: 0,
    context:
      'Reprenons le test du module 2 : la maladie touche 1 % de la population, le test détecte 99 % des malades et se trompe sur 2 % des personnes en bonne santé.',
    question: 'Quelle est la probabilité qu’une personne prise au hasard ait un test positif ?',
    explain:
      'Malade ou en bonne santé : les deux cas se partagent la population entière. 0,01 × 0,99 + 0,99 × 0,02 = 0,0099 + 0,0198 = 0,0297, soit environ 3 %. Sur 100 000 personnes : 990 + 1 980 = 2 970 tests positifs.',
  },
];

/* ══ Module 6 — les nombres du boss, tous vérifiés ═══════════════════════ */

/**
 * Pour chaque épreuve numérique : la bonne réponse et ses pièges, en fractions
 * EXACTES. Le test vérifie qu'ils sont deux à deux distincts, distincts après
 * mise en forme, et tous dans [0 ; 1].
 *
 * Chaque piège est une ERREUR NOMMÉE par la leçon :
 *   e1  prendre la population entière pour dénominateur, ou inverser le rapport
 *   e2  inverser le conditionnement (99 % au lieu de 33,3 %)
 *   e7  additionner le long d'un chemin au lieu de multiplier
 *   e8  ne retenir qu'un seul des chemins, ou moyenner les deux taux
 *   e9  moyenner les taux au lieu de les pondérer
 * Les cinq autres épreuves du boss sont qualitatives : leurs options sont des
 * phrases, et c'est le texte qui les distingue, pas un nombre.
 */
export const BOSS_NUMBERS = {
  //          bonne réponse        population entière   part à distance   inverse
  e1: { correct: rat(1, 4), traps: [rat(3, 40), rat(3, 10), rat(3, 4)], dp: 1 },
  //          990/2970             sens inversé         prévalence       les sains
  e2: { correct: rat(1, 3), traps: [rat(99, 100), rat(1, 100), rat(2, 3)], dp: 1 },
  //          0,60 × 0,02          somme des poids      taux seul        poids seul
  e7: { correct: rat(3, 250), traps: [rat(31, 50), rat(1, 50), rat(3, 5)], dp: 1 },
  //          somme des 2 chemins  un seul chemin       taux du 2e       moyenne
  e8: { correct: rat(3, 20), traps: [rat(1, 40), rat(1, 4), rat(2, 15)], dp: 1 },
  //          somme pondérée       moyenne des taux     taux du plus gros / du pire
  e9: { correct: rat(37, 1000), traps: [rat(17, 300), rat(1, 50), rat(1, 10)], dp: 1 },
};

/* ══ Module 3 — construire l'arbre : les branches à placer ═══════════════ */

/**
 * Les poids que l'élève doit accrocher aux bonnes branches. `slot` désigne la
 * branche ; `weight` la fraction exacte attendue. Les intrus (`slot: null`)
 * sont des nombres QUI EXISTENT dans la situation mais ne pèsent aucune de ces
 * branches : c'est là qu'on distingue un poids conditionnel d'une proportion
 * globale — l'erreur que la 2de laisse encore passer.
 */
export const BRANCH_WEIGHTS = [
  { id: 'w-mal', slot: 'malade', weight: rat(1, 100), display: '0,01', label: '1 %' },
  { id: 'w-sain', slot: 'sain', weight: rat(99, 100), display: '0,99', label: '99 %' },
  { id: 'w-mal-pos', slot: 'malade/positif', weight: rat(99, 100), display: '0,99', label: '99 %' },
  { id: 'w-sain-pos', slot: 'sain/positif', weight: rat(2, 100), display: '0,02', label: '2 %' },
];

/* ══ Vérification interne au chargement (le périmètre est CODÉ) ══════════ */

/**
 * Le module refuse de se charger sur des données fausses : une leçon ne doit
 * jamais s'afficher avec un arbre dont les branches ne somment pas à 1. Cette
 * garde double le test — elle protège aussi l'exécution.
 */
(function assertData() {
  for (const tree of [depistageTree(), fournisseursTree()]) {
    const s = ratSum(tree.map((b) => b.p));
    if (s.n !== s.d) throw new Error(`data.js: poids du 1er niveau = ${s.n}/${s.d} ≠ 1`);
    for (const b of tree) {
      const sc = ratSum(b.children.map((c) => c.p));
      if (sc.n !== sc.d) throw new Error(`data.js: branches de ${b.id} = ${sc.n}/${sc.d} ≠ 1`);
    }
  }
  // La formule des probabilités totales doit s'appliquer sur les deux arbres.
  totalProbability(depistageTree(), 'positif');
  totalProbability(fournisseursTree(), 'defectueux');
  // Et le paradoxe affiché doit être le paradoxe calculé.
  const inv = conditional(depistageTable(), { axis: 'col', key: 'positif' }, 'malade');
  if (inv.n !== 1 || inv.d !== 3) throw new Error('data.js: le paradoxe du dépistage a bougé');
})();
