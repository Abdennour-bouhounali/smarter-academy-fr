/**
 * Données de la leçon « Fréquences conditionnelles ».
 *
 * Enquête sur 400 lycéens : mode de transport principal × niveau de classe.
 * Les effectifs sont donnés directement (et non engendrés) : ils sont cités
 * dans presque toutes les corrections, et ont été choisis pour que les
 * fréquences conditionnelles tombent sur des valeurs LISIBLES (des dixièmes),
 * afin que l'élève puisse suivre le calcul mentalement.
 *
 * Le déséquilibre entre niveaux (200 / 120 / 80) est délibéré : c'est lui qui
 * rend la comparaison d'effectifs bruts trompeuse et la conditionnelle
 * indispensable.
 *
 * Vérifié par data.test.js : marges, total, et les conditionnelles citées.
 */
export const TRANSPORTS = ['bus', 'vélo', 'voiture', 'à pied'];
export const NIVEAUX = ['2de', '1re', 'terminale'];

/** Effectifs [transport][niveau]. Total 400. */
export const ENQUETE = {
  bus: { '2de': 100, '1re': 48, terminale: 12 },
  vélo: { '2de': 40, '1re': 24, terminale: 16 },
  voiture: { '2de': 20, '1re': 30, terminale: 40 },
  'à pied': { '2de': 40, '1re': 18, terminale: 12 },
};

/** Le tableau au format attendu par crossTable/CrossTableView. */
export function enqueteTable() {
  const rowTotals = Object.fromEntries(TRANSPORTS.map((t) => [t, NIVEAUX.reduce((a, n) => a + ENQUETE[t][n], 0)]));
  const colTotals = Object.fromEntries(NIVEAUX.map((n) => [n, TRANSPORTS.reduce((a, t) => a + ENQUETE[t][n], 0)]));
  const grandTotal = Object.values(rowTotals).reduce((a, b) => a + b, 0);
  return { cells: ENQUETE, rowTotals, colTotals, grandTotal, rowOrder: TRANSPORTS, colOrder: NIVEAUX };
}

/**
 * Second jeu (module 5) : une affirmation de presse à vérifier. Les deux
 * groupes ont des tailles très différentes, ce qui est tout le sujet.
 */
export const SPORT = {
  cells: {
    'club sportif': { garçons: 96, filles: 84 },
    'pas de club': { garçons: 64, filles: 156 },
  },
  rowOrder: ['club sportif', 'pas de club'],
  colOrder: ['garçons', 'filles'],
};
export function sportTable() {
  const { cells, rowOrder, colOrder } = SPORT;
  const rowTotals = Object.fromEntries(rowOrder.map((r) => [r, colOrder.reduce((a, c) => a + cells[r][c], 0)]));
  const colTotals = Object.fromEntries(colOrder.map((c) => [c, rowOrder.reduce((a, r) => a + cells[r][c], 0)]));
  const grandTotal = Object.values(rowTotals).reduce((a, b) => a + b, 0);
  return { cells, rowTotals, colTotals, grandTotal, rowOrder, colOrder };
}
