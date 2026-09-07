/**
 * Données de la leçon « Probabilités conditionnelles ».
 *
 * Situation : 800 lycéens, croisant le régime (interne / externe) et la
 * pratique d'un sport en club. On tire un élève AU HASARD — c'est ce tirage
 * qui fait des proportions des probabilités.
 *
 * Les effectifs sont choisis pour trois raisons pédagogiques :
 *   · les deux groupes sont TRÈS déséquilibrés (200 internes contre 600
 *     externes), sans quoi l'inversion du conditionnement passerait presque
 *     inaperçue ;
 *   · P_interne(sport) = 150/200 = 0,75 alors que P_sport(interne) =
 *     150/450 ≈ 0,333 : un rapport de plus du double, impossible à confondre ;
 *   · tous les quotients utiles tombent juste ou presque, pour que l'élève
 *     suive le calcul de tête.
 *
 * Vérifié par data.test.js : marges, total, et les valeurs citées dans les
 * corrections des modules.
 */
export const REGIMES = ['interne', 'externe'];
export const SPORT = ['club', 'sans club'];

/** Effectifs [régime][sport]. Total 800. */
export const LYCEE = {
  interne: { club: 150, 'sans club': 50 },
  externe: { club: 300, 'sans club': 300 },
};

export const TOTAL = 800;

/** Le tableau au format attendu par CrossTableView. */
export function lyceeTable() {
  const rowTotals = Object.fromEntries(REGIMES.map((r) => [r, SPORT.reduce((a, s) => a + LYCEE[r][s], 0)]));
  const colTotals = Object.fromEntries(SPORT.map((s) => [s, REGIMES.reduce((a, r) => a + LYCEE[r][s], 0)]));
  const grandTotal = Object.values(rowTotals).reduce((a, b) => a + b, 0);
  return { cells: LYCEE, rowTotals, colTotals, grandTotal, rowOrder: REGIMES, colOrder: SPORT };
}

/**
 * Les quatre catégories, pour PopulationGrid. L'ordre de remplissage
 * regroupe d'abord les internes : la condition « interne » éteint alors un
 * bloc CONTIGU de pastilles, ce qui rend l'univers restreint lisible d'un
 * coup d'œil (un damier ne montrerait rien).
 */
export const POPULATION_GROUPS = [
  { id: 'interne-club', count: LYCEE.interne.club, color: '#4f46e5', label: 'internes en club', regime: 'interne', sport: 'club' },
  { id: 'interne-sans', count: LYCEE.interne['sans club'], color: '#a5b4fc', label: 'internes sans club', regime: 'interne', sport: 'sans club' },
  { id: 'externe-club', count: LYCEE.externe.club, color: '#059669', label: 'externes en club', regime: 'externe', sport: 'club' },
  { id: 'externe-sans', count: LYCEE.externe['sans club'], color: '#a7f3d0', label: 'externes sans club', regime: 'externe', sport: 'sans club' },
];

/** Les conditions proposées au module 1. `keep` filtre POPULATION_GROUPS. */
export const CONDITIONS = [
  { id: 'aucune', label: 'Aucune condition', short: 'tous les élèves', keep: () => true },
  { id: 'interne', label: 'Sachant qu’il est interne', short: 'les internes', keep: (g) => g.regime === 'interne' },
  { id: 'externe', label: 'Sachant qu’il est externe', short: 'les externes', keep: (g) => g.regime === 'externe' },
  { id: 'club', label: 'Sachant qu’il est en club', short: 'les élèves en club', keep: (g) => g.sport === 'club' },
];

/** L'événement dont on calcule la probabilité, module 1. */
export const EVENTS = [
  { id: 'club', label: 'être en club', match: (g) => g.sport === 'club' },
  { id: 'interne', label: 'être interne', match: (g) => g.regime === 'interne' },
];

/**
 * Probabilité de `event` dans l'univers restreint par `condition`,
 * calculée sur les EFFECTIFS — c'est le calcul que l'élève refait à la main.
 * Renvoie aussi numérateur et dénominateur : la leçon montre le quotient,
 * jamais seulement son résultat.
 */
export function probabilityUnder(conditionId, eventId) {
  const cond = CONDITIONS.find((c) => c.id === conditionId) ?? CONDITIONS[0];
  const ev = EVENTS.find((e) => e.id === eventId) ?? EVENTS[0];
  const universe = POPULATION_GROUPS.filter(cond.keep);
  const denominator = universe.reduce((a, g) => a + g.count, 0);
  const numerator = universe.filter(ev.match).reduce((a, g) => a + g.count, 0);
  return { numerator, denominator, value: denominator ? numerator / denominator : null };
}

/** Module 5 — quatre situations concrètes, hors contexte scolaire. */
export const SITUATIONS = [
  {
    id: 's1',
    context: 'Dans un club de 120 membres, 72 pratiquent la natation. Parmi ces nageurs, 18 participent aussi à la compétition.',
    question: 'On choisit un membre au hasard parmi les nageurs. Quelle est la probabilité qu’il fasse de la compétition ?',
    numerator: 18, denominator: 72, answer: 0.25, display: '25 %',
    explain: 'L’univers est restreint aux 72 nageurs : 18/72 = 0,25. Diviser par 120 reviendrait à répondre à une autre question (la part des compétiteurs-nageurs dans tout le club).',
  },
  {
    id: 's2',
    context: 'Une usine produit 500 pièces par jour : 300 sur la machine A et 200 sur la machine B. On compte 15 pièces défectueuses sur A et 4 sur B.',
    question: 'Une pièce vient de la machine A. Quelle est la probabilité qu’elle soit défectueuse ?',
    numerator: 15, denominator: 300, answer: 0.05, display: '5 %',
    explain: '« Vient de la machine A » restreint l’univers aux 300 pièces de A : 15/300 = 0,05, soit 5 %. Le total de 500 pièces n’intervient pas.',
  },
  {
    id: 's3',
    context: 'Sur 500 pièces (300 de A, 200 de B), 19 sont défectueuses : 15 viennent de A et 4 de B.',
    question: 'Une pièce est défectueuse. Quelle est la probabilité qu’elle vienne de la machine A ?',
    numerator: 15, denominator: 19, answer: 15 / 19, display: '≈ 78,9 %',
    explain: 'Ici la condition est « défectueuse » : l’univers devient les 19 pièces défectueuses, donc 15/19 ≈ 0,79. Même numérateur qu’à la situation précédente, dénominateur tout autre — c’est exactement l’inversion du conditionnement.',
  },
  {
    id: 's4',
    context: 'Dans une ville, 40 % des habitants utilisent le vélo. Parmi les cyclistes, 30 % vont travailler à vélo tous les jours.',
    question: 'On choisit un habitant au hasard. Quelle est la probabilité qu’il soit un cycliste quotidien ?',
    numerator: 12, denominator: 100, answer: 0.12, display: '12 %',
    explain: 'On compose : P(cycliste) × P_cycliste(quotidien) = 0,40 × 0,30 = 0,12, soit 12 %. Les 30 % ne s’appliquent qu’aux cyclistes, jamais à toute la ville.',
  },
];
