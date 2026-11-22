import { Ruler } from 'lucide-react';
import { defineMathLabTool } from '../../toolContract.js';
import { MEASUREMENT_SCHEMA_VERSION, createMeasurementData } from './measureState.js';
import { summarizeMeasurement } from './summarize.js';

/**
 * Le مختبر القياس (Laboratoire de la mesure) — le quatorzième instrument du
 * مختبر الرياضيات.
 *
 * Ce n'est PAS une calculatrice de formules. C'est un atelier où l'élève
 * fabrique la formule :
 *
 *     il mesure → il compare → il cherche une relation
 *     → il la formule → il l'éprouve → il généralise
 *
 * L'instrument ne donne jamais la règle en premier. Il donne un objet qu'on
 * manipule, une grille qu'on compte, un tableau qui se remplit — et il se
 * tait. Quand l'élève propose « A = L + l », il ne répond pas « faux » : il
 * montre la ligne où sa règle prédit 7 alors que la mesure donne 12, et il
 * lui demande pourquoi. C'est le contre-exemple qui enseigne, pas le verdict.
 *
 * ── Ce que l'instrument refuse de dire ──────────────────────────────────
 * Aucun libellé, aucune infobulle, aucun titre ne porte la formule cherchée
 * avant que l'élève ne l'ait construite et éprouvée (§23 du cahier). C'est
 * `investigations.js` qui garde le secret, et `investigations.test.js` qui
 * vérifie qu'il ne fuit pas.
 *
 * ── Conjecture n'est pas démonstration ──────────────────────────────────
 * Quand la règle tient, l'instrument dit qu'elle tient SUR CE QUI A ÉTÉ
 * MESURÉ — jamais qu'elle est démontrée (§21). Une manipulation géométrique
 * finale (deux triangles qui font un rectangle, le disque découpé en
 * secteurs, les carrés de Pythagore) montre alors POURQUOI elle doit valoir.
 *
 * Toute la mathématique vit dans des modules purs (measureMath.js,
 * ruleEngine.js, investigations.js, measureState.js) testés à part ; le
 * composant ne fait que les appeler. Chargé PARESSEUSEMENT par `load`.
 * Documenté dans docs/architecture/MATH_LAB.md §5o.
 */
export const measurementTool = defineMathLabTool({
  id: 'measurement',
  slug: 'mesure',
  labelKey: 'tools.measurement.name',
  descriptionKey: 'tools.measurement.description',
  newLabelKey: 'tools.measurement.new',
  defaultTitleKey: 'tools.measurement.defaultTitle',
  icon: Ruler,
  schemaVersion: MEASUREMENT_SCHEMA_VERSION,
  // Les deux مخابر : aires, volumes, π, Pythagore et la somme des angles
  // s'initialisent au collège et se RÉUTILISENT au lycée (programme 2025 :
  // initialisée → réutilisée → approfondie). Rien n'y est à retirer.
  scopes: ['moyen', 'secondaire'],
  createInitialData: createMeasurementData,
  summarize: summarizeMeasurement,
  load: () => import('./MeasurementTool.jsx'),
});
