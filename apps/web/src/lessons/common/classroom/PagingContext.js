import { createContext } from 'react';

/**
 * La GÉOMÉTRIE DE DÉCOUPAGE hors mode classe. ClassroomPaged lit d'ordinaire le mode classe (actif ? échelle ? zone ?).
 * Le lecteur de mission (lessons/common/mission/MissionPlayer.jsx) découpe lui aussi chaque unité en pages pour qu'aucun
 * écran ne défile — mais il ne doit PAS passer par `isClassroomMode` (qui déverrouille les étapes et les modules, coupe
 * l'écriture de la progression et change les tests). Il fournit ici sa propre géométrie :
 *   { isClassroomMode: true (= « découper »), scale: zoom, userScale: 1, area: { width, height }, deepBlocks: true, onePerPage: true }
 * `deepBlocks` : chercher les blocs à travers toutes les enveloppes à enfant unique (ClassroomPaged.resolveBlocks).
 * `onePerPage` : UN élément par page (classroomPages.planOnePerPage) — une liste s'ouvre en ses éléments, un petit bloc
 *   accompagne l'élément qui le suit ; un contenu remplacé (résultat d'un test) est redécoupé (`onRestructure`).
 * `scale` : le zoom courant du lecteur (FitToArea), pour mesurer les blocs à leur taille naturelle.
 * Absent (null) : ClassroomPaged se comporte exactement comme avant.
 */
export const PagingContext = createContext(null);
