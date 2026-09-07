/**
 * Données de la leçon « Arbres de probabilités ».
 *
 * Expérience portée : on tire d'abord un SAC (le sac A est plus gros, donc
 * plus souvent choisi : 0,6 contre 0,4), puis une BILLE dans ce sac.
 *
 * Les nombres sont choisis pour que :
 *   · les deux sacs aient des compositions TRÈS différentes (1/2 de rouges
 *     contre 1/4), sinon le conditionnement du second niveau serait invisible ;
 *   · le premier niveau soit DÉSÉQUILIBRÉ (0,6 / 0,4), sinon l'élève pourrait
 *     répondre par symétrie sans jamais utiliser l'arbre ;
 *   · les produits de chemins tombent juste (0,30 et 0,10) et leur somme
 *     donne P(rouge) = 0,40 — un nombre qu'aucun raisonnement naïf ne
 *     produit (ni 1/2, ni la moyenne des deux compositions, qui vaudrait
 *     0,375 : c'est le distracteur du module 4).
 *
 * Vérifié par data.test.js : sommes des branches à 1, produits des chemins,
 * total, et l'écart au piège de la moyenne.
 */

/** Composition des deux sacs (billes réelles : l'élève peut les compter). */
export const SACS = {
  A: { label: 'sac A', rouges: 3, bleues: 3, p: 0.6 },
  B: { label: 'sac B', rouges: 2, bleues: 6, p: 0.4 },
};

export const sacTotal = (s) => SACS[s].rouges + SACS[s].bleues;

/** P_sac(rouge) — la probabilité CONDITIONNELLE du second niveau. */
export const pRougeSachant = (s) => SACS[s].rouges / sacTotal(s);
export const pBleueSachant = (s) => SACS[s].bleues / sacTotal(s);

/** Probabilité d'un chemin : produit des deux branches. */
export const pChemin = (s, couleur) =>
  SACS[s].p * (couleur === 'rouge' ? pRougeSachant(s) : pBleueSachant(s));

/** Probabilité d'une couleur : somme des chemins qui la réalisent. */
export const pCouleur = (couleur) => pChemin('A', couleur) + pChemin('B', couleur);

/** L'arbre au format attendu par ProbabilityTree. */
export function arbreBilles() {
  return [
    {
      id: 'A', label: 'A', p: SACS.A.p,
      children: [
        { id: 'R', label: 'R', p: pRougeSachant('A') },
        { id: 'B', label: 'B', p: pBleueSachant('A') },
      ],
    },
    {
      id: 'B', label: 'B', p: SACS.B.p,
      children: [
        { id: 'R', label: 'R', p: pRougeSachant('B') },
        { id: 'B', label: 'B', p: pBleueSachant('B') },
      ],
    },
  ];
}

/**
 * Module 1 — les briques que l'élève pose pour construire l'arbre, dans
 * l'ORDRE de l'expérience. `level` 1 = choix du sac, 2 = tirage de la bille.
 * Les intrus (`level: 0`) ne correspondent à aucune étape : les proposer
 * oblige à se demander ce qu'est réellement une étape de l'expérience.
 */
export const BRIQUES = [
  { id: 'sac-a', label: 'On choisit le sac A', level: 1, order: 1 },
  { id: 'sac-b', label: 'On choisit le sac B', level: 1, order: 1 },
  { id: 'bille-r', label: 'On tire une bille rouge', level: 2, order: 2 },
  { id: 'bille-b', label: 'On tire une bille bleue', level: 2, order: 2 },
  { id: 'intrus-1', label: 'On repose la bille dans le sac', level: 0, order: 0 },
  { id: 'intrus-2', label: 'On compte toutes les billes des deux sacs', level: 0, order: 0 },
];

/** Module 5 — trois situations à traduire, hors du contexte des billes. */
export const SITUATIONS = [
  {
    id: 'meteo',
    title: 'Météo et retard',
    context:
      'Dans une ville, il pleut 30 % des matins. Les matins de pluie, le bus est en retard 4 fois sur 10 ; les matins sans pluie, seulement 1 fois sur 10.',
    tree: [
      { id: 'P', label: 'Pluie', p: 0.3, children: [{ id: 'R', label: 'Retard', p: 0.4 }, { id: 'H', label: 'À l’heure', p: 0.6 }] },
      { id: 'S', label: 'Sans pluie', p: 0.7, children: [{ id: 'R', label: 'Retard', p: 0.1 }, { id: 'H', label: 'À l’heure', p: 0.9 }] },
    ],
    question: 'Quelle est la probabilité que le bus soit en retard un matin quelconque ? (en %)',
    answer: 0.19,
    display: '19 %',
    explain: 'Deux chemins mènent au retard : 0,30 × 0,40 = 0,12 et 0,70 × 0,10 = 0,07. On les additionne : 0,19, soit 19 %. Ce n’est ni 40 %, ni la moyenne de 40 % et 10 %.',
  },
  {
    id: 'usine',
    title: 'Deux chaînes de production',
    context:
      'Une usine fabrique 80 % de ses pièces sur la chaîne 1 et 20 % sur la chaîne 2. La chaîne 1 produit 1 % de pièces défectueuses, la chaîne 2 en produit 10 %.',
    tree: [
      { id: '1', label: 'Chaîne 1', p: 0.8, children: [{ id: 'D', label: 'Défect.', p: 0.01 }, { id: 'C', label: 'Conforme', p: 0.99 }] },
      { id: '2', label: 'Chaîne 2', p: 0.2, children: [{ id: 'D', label: 'Défect.', p: 0.1 }, { id: 'C', label: 'Conforme', p: 0.9 }] },
    ],
    question: 'Quelle est la probabilité qu’une pièce prise au hasard soit défectueuse ? (en %)',
    answer: 0.028,
    display: '2,8 %',
    explain: '0,80 × 0,01 = 0,008 et 0,20 × 0,10 = 0,020, soit 0,028 = 2,8 %. La moyenne des deux taux donnerait 5,5 % — presque le double : la chaîne 1, bien moins défaillante, fournit l’essentiel de la production et tire le résultat vers le bas.',
  },
  {
    id: 'quiz',
    title: 'Réviser ou pas',
    context:
      'Un élève révise 3 fois sur 4. Quand il a révisé, il réussit le test 9 fois sur 10 ; sinon, 4 fois sur 10.',
    tree: [
      { id: 'R', label: 'Révisé', p: 0.75, children: [{ id: 'S', label: 'Réussi', p: 0.9 }, { id: 'E', label: 'Échoué', p: 0.1 }] },
      { id: 'N', label: 'Non révisé', p: 0.25, children: [{ id: 'S', label: 'Réussi', p: 0.4 }, { id: 'E', label: 'Échoué', p: 0.6 }] },
    ],
    question: 'Quelle est la probabilité qu’il réussisse le prochain test ? (en %)',
    answer: 0.775,
    display: '77,5 %',
    explain: '0,75 × 0,90 = 0,675 et 0,25 × 0,40 = 0,10 : au total 0,775, soit 77,5 %. Les deux chemins qui mènent à la réussite s’additionnent.',
  },
];
