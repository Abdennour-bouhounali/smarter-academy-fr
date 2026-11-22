/**
 * LA FORMATION — où se placent les joueurs sur le terrain.
 *
 * Pure géométrie, testée directement (le dépôt n'a pas d'environnement DOM :
 * ses tests vérifient la géométrie, pas le rendu — voir
 * `PopulationBar.test.jsx` pour le même parti pris).
 *
 * Un terrain vertical se lit en LIGNES, du but (en haut) vers le milieu :
 * gardien, défense, milieu, attaque. On répartit donc les joueurs en lignes
 * successives, chaque ligne centrée sur la largeur, exactement comme une
 * composition d'équipe affichée avant un match.
 *
 * DEUX EXIGENCES, dans cet ordre :
 *   1. AUCUN CHEVAUCHEMENT, pour n'importe quel effectif atteignable. Les
 *      lignes sont espacées par construction et une ligne ne reçoit jamais
 *      plus de joueurs que la largeur ne le permet (INTERACTION_PEDAGOGY
 *      §17bis : tout état atteignable a une mise en page valide).
 *   2. Une allure de VRAIE composition : peu de joueurs devant, plus au
 *      milieu — jamais une grille régulière qui ferait « tableur ».
 *
 * Les coordonnées sont en POURCENTAGES de la zone (0–100), donc indépendantes
 * de la taille réelle du terrain à l'écran : la même formation tient sur un
 * téléphone et sur un vidéoprojecteur.
 */

/** Combien de joueurs par ligne, du fond vers l'avant, pour un effectif donné. */
export function formationRows(count) {
  if (count <= 0) return [];
  if (count === 1) return [1];
  if (count === 2) return [1, 1];
  if (count === 3) return [1, 2];
  if (count === 4) return [1, 2, 1];
  if (count === 5) return [1, 2, 2];
  if (count === 6) return [1, 2, 3];
  if (count === 7) return [1, 3, 3];
  if (count === 8) return [1, 3, 4];
  if (count === 9) return [1, 4, 4];
  if (count === 10) return [1, 4, 3, 2];
  if (count === 11) return [1, 4, 4, 2];
  // Au-delà d'une équipe réglementaire, on répartit en lignes de 4 au plus :
  // la scène reste lisible même quand la leçon choisit de grands effectifs.
  const rows = [];
  let left = count;
  while (left > 0) { const take = Math.min(4, left); rows.push(take); left -= take; }
  return rows;
}

/**
 * Les positions (en % de la zone) des `count` joueurs.
 * @returns {{x:number,y:number}[]} un point par joueur, dans l'ordre d'arrivée
 */
export function formationPositions(count, { topPad = 16, bottomPad = 12 } = {}) {
  const rows = formationRows(count);
  if (rows.length === 0) return [];
  const usable = 100 - topPad - bottomPad;
  // Une seule ligne se pose au milieu de la zone utile ; sinon les lignes
  // sont réparties régulièrement, du fond vers l'avant.
  const step = rows.length === 1 ? 0 : usable / (rows.length - 1);
  const out = [];
  rows.forEach((n, r) => {
    const y = rows.length === 1 ? topPad + usable / 2 : topPad + r * step;
    for (let i = 0; i < n; i += 1) {
      // Chaque ligne est CENTRÉE : n joueurs occupent n intervalles égaux.
      out.push({ x: ((i + 0.5) / n) * 100, y });
    }
  });
  return out;
}

/**
 * La taille d'un joueur (en % de la LARGEUR de la zone) qui garantit qu'aucun
 * voisin ne se touche, quelle que soit la ligne la plus chargée.
 */
export function playerScale(count) {
  const rows = formationRows(count);
  const widest = Math.max(1, ...rows);
  // Un joueur occupe au plus 80 % de l'intervalle qui lui revient : il reste
  // donc toujours un blanc entre deux voisins.
  return Math.min(26, (100 / widest) * 0.8);
}
