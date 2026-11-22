import { FlipHorizontal2 } from 'lucide-react';
import { defineMathLabTool } from '../../toolContract.js';
import { TRANSFORMATIONS_SCHEMA_VERSION, createTransformationsData } from './transformState.js';
import { TRANSFORMATIONS_CAPABILITIES, TRANSFORMATIONS_SCOPES } from './scope.js';
import { summarizeTransformations } from './summarize.js';

/**
 * L'atelier des transformations (transformations et géométrie dynamique) —
 * le neuvième instrument de l'atelier.
 *
 * Une transformation n'est pas une formule qu'on récite : c'est un GESTE
 * qu'on fait au plan. L'élève pose un triangle, attrape un sommet, et voit
 * l'image suivre ; il tire l'axe d'un miroir et la figure réfléchie glisse
 * avec lui ; il pousse le rapport d'une homothétie de 1 vers 2 et lit, sous ses
 * yeux, que l'aire a été multipliée par 4 — sans qu'aucun texte ne le lui
 * ait dit d'abord.
 *
 * Le vocabulaire est celui du programme français — symétrie axiale,
 * symétrie centrale, translation, rotation, homothétie
 * (docs/architecture/FRENCH_LANGUAGE_CONTRACT.md §7).
 *
 * ── Le programme d'abord, le reste d'un clic ────────────────────────────
 * L'instrument ouvre sur un triangle et une translation — le premier geste
 * du collège ; la composition et la lecture matricielle appartiennent au
 * lycée (scope.js). Tout le reste
 * existe, complet, mais ne fait jamais la première page. C'est la règle déjà
 * tenue par le produit scalaire de l'atelier des vecteurs (MATH_LAB §5f.10), le cercle
 * trigonométrique (§5g.1) et les suites (§5h).
 *
 * Le REPÈRE est celui du grapheur : viewport.js, gridStep.js,
 * useViewportGestures.js et grapherFormat.js sont importés tels quels — une
 * seule implémentation du plan sur la plateforme. Toute la mathématique vit
 * dans des modules purs (transformMath.js, transformModel.js, practice.js)
 * testés à part ; le composant ne fait que les appeler. Chargé
 * PARESSEUSEMENT par `load`. Documenté dans docs/architecture/MATH_LAB.md §5j.
 */
export const transformationsTool = defineMathLabTool({
  id: 'transformations',
  slug: 'transformations',
  labelKey: 'tools.transformations.name',
  descriptionKey: 'tools.transformations.description',
  newLabelKey: 'tools.transformations.new',
  defaultTitleKey: 'tools.transformations.defaultTitle',
  icon: FlipHorizontal2,
  schemaVersion: TRANSFORMATIONS_SCHEMA_VERSION,
  // Les deux labos — au collège : une transformation à la fois, sans composition ni matrice (scope.js).
  scopes: TRANSFORMATIONS_SCOPES,
  capabilities: TRANSFORMATIONS_CAPABILITIES,
  createInitialData: createTransformationsData,
  summarize: summarizeTransformations,
  load: () => import('./TransformationsTool.jsx'),
});
