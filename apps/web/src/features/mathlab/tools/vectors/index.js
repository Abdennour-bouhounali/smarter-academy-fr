import { MoveUpRight } from 'lucide-react';
import { defineMathLabTool } from '../../toolContract.js';
import { VECTORS_SCHEMA_VERSION, createVectorsData } from './vectorState.js';
import { VECTORS_CAPABILITIES, VECTORS_SCOPES } from './scope.js';
import { summarizeVectors } from './summarize.js';

/**
 * Le labo des vecteurs — le sixième instrument de
 * l'atelier.
 *
 * Un vecteur n'est pas une flèche qu'on regarde : c'est un DÉPLACEMENT qu'on
 * tire. L'élève pose des points, les glisse, et voit les coordonnées, la
 * longueur et la direction suivre son doigt ; il met deux vecteurs bout à bout
 * et la somme se dessine ; il pousse un curseur et k·u s'allonge, se
 * retourne, s'annule. Le repère, les coordonnées, la translation et le
 * vecteur sont ce que l'instrument fait toucher.
 *
 * Le vocabulaire est celui de l'école française — vecteur, coordonnées
 * d'un vecteur, translation, colinéarité (FRENCH_LANGUAGE_CONTRACT §7).
 *
 * Le REPÈRE est celui du grapheur : viewport.js, gridStep.js,
 * useViewportGestures.js et grapherFormat.js sont importés tels quels — une
 * seule implémentation du plan sur la plateforme. Toute la mathématique vit
 * dans des modules purs (vectorMath.js, vectorScene.js, analysis.js) testés
 * à part ; le composant ne fait que les appeler. Chargé PARESSEUSEMENT par
 * `load`. Documenté dans docs/architecture/MATH_LAB.md §5f.
 */
export const vectorsTool = defineMathLabTool({
  id: 'vectors',
  slug: 'vecteurs',
  labelKey: 'tools.vectors.name',
  descriptionKey: 'tools.vectors.description',
  newLabelKey: 'tools.vectors.new',
  defaultTitleKey: 'tools.vectors.defaultTitle',
  icon: MoveUpRight,
  schemaVersion: VECTORS_SCHEMA_VERSION,
  // Les deux labos — au collège : somme, opposé, translation ; sans k·u ni produit scalaire (scope.js).
  scopes: VECTORS_SCOPES,
  capabilities: VECTORS_CAPABILITIES,
  createInitialData: createVectorsData,
  summarize: summarizeVectors,
  load: () => import('./VectorsTool.jsx'),
});
