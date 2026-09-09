/**
 * OÙ, DANS LE PROGRAMME ÉCRIT, SE TROUVE L'INSTRUCTION QU'ON EXÉCUTE ?
 *
 * Le moteur (`lessons/common/turtle/trace4e.js`) renvoie, pour chaque pas,
 * `srcIndex` (l'instruction de premier niveau), `tour` (le tour de boucle) et
 * `branche` ('alors' | 'sinon' | null). C'est exactement ce qu'il faut pour
 * DESSINER, mais pas tout à fait pour SURLIGNER : dans un corps de boucle qui
 * contient un choix, deux instructions différentes peuvent partager le même
 * `srcIndex`, et le `corpsIndex` de `derouler` s'y compte tantôt dans le corps
 * de la boucle, tantôt dans la branche.
 *
 * Ce module rejoue donc la MÊME structure que le moteur — sans jamais rejouer
 * sa mathématique — pour produire la position d'écriture complète :
 *
 *     { srcIndex, corpsIndex, branche, brancheIndex, tour }
 *
 * POURQUOI CE N'EST PAS UNE SECONDE ÉVALUATION. La fonction ne décide JAMAIS
 * d'une branche : elle lit `branche` sur le pas que le moteur a produit. Un SI
 * consomme donc exactement autant de pas que la branche annoncée en contient.
 * Si le moteur changeait d'avis, cette fonction le suivrait ; elle ne peut pas
 * diverger de lui, et un test de `parcours.test.js` le vérifie sur tous les
 * programmes de la leçon.
 *
 * Le pas de rang 0 (l'état de départ, avant toute instruction) n'a pas de
 * position d'écriture : la fonction renvoie `null`, et le surlignage s'éteint.
 */

/**
 * @param {Array} programme  le programme ÉCRIT (tel qu'affiché)
 * @param {Array} pas        la liste renvoyée par `executerPasAPas`
 * @returns {Array<null | {srcIndex:number, corpsIndex:number|null, branche:string|null, brancheIndex:number|null, tour:number|null}>}
 *   une position par pas, alignée sur `pas` (donc `[0]` vaut toujours `null`).
 */
export function positionsDesPas(programme, pas) {
  const positions = [null]; // le rang 0 est l'état de départ
  let k = 1; // rang courant dans `pas`

  /** Consomme les instructions d'un bloc, une par pas. */
  const bloc = (instructions, srcIndex, corpsIndex, branche) => {
    for (let j = 0; j < instructions.length; j += 1) {
      if (k >= pas.length) return;
      positions[k] = {
        srcIndex,
        corpsIndex,
        branche,
        brancheIndex: branche == null ? null : j,
        tour: pas[k].tour,
      };
      k += 1;
    }
  };

  (programme || []).forEach((noeud, srcIndex) => {
    if (noeud.kind === 'REPETER') {
      // Le nombre de tours est LU sur les pas produits, jamais recalculé :
      // c'est ce qui garantit qu'on ne peut pas diverger du moteur.
      while (k < pas.length && pas[k].srcIndex === srcIndex) {
        const tour = pas[k].tour;
        for (let j = 0; j < noeud.corps.length; j += 1) {
          if (k >= pas.length || pas[k].srcIndex !== srcIndex || pas[k].tour !== tour) break;
          const b = noeud.corps[j];
          if (b.kind === 'SI') {
            const branche = pas[k].branche;
            const prises = branche === 'alors' ? b.alors : branche === 'sinon' ? b.sinon : [];
            bloc(prises, srcIndex, j, branche);
          } else {
            positions[k] = { srcIndex, corpsIndex: j, branche: null, brancheIndex: null, tour };
            k += 1;
          }
        }
      }
      return;
    }
    if (noeud.kind === 'SI') {
      const branche = k < pas.length ? pas[k].branche : null;
      const prises = branche === 'alors' ? noeud.alors : branche === 'sinon' ? noeud.sinon : [];
      // Une branche vide ne consomme aucun pas : le SI est « traversé » sans
      // qu'aucune instruction ne s'exécute. C'est un cas réel (« si… alors »
      // sans sinon, condition fausse), et il ne doit pas décaler la suite.
      bloc(prises, srcIndex, null, branche);
      return;
    }
    if (k < pas.length) {
      positions[k] = { srcIndex, corpsIndex: null, branche: null, brancheIndex: null, tour: pas[k].tour };
      k += 1;
    }
  });

  // Tout pas non couvert (programme et pas désaccordés) reste `null` plutôt
  // que de surligner une instruction au hasard.
  while (positions.length < pas.length) positions.push(null);
  return positions;
}

/**
 * La branche prise par le SI d'index `srcIndex`, au pas courant — ou `null` si
 * le pas courant n'est pas dans ce SI. Sert à la vue du programme, qui éteint
 * la branche non exécutée.
 */
export function brancheAu(position, srcIndex) {
  if (!position || position.srcIndex !== srcIndex) return null;
  return position.branche;
}
