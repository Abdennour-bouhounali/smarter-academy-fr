import { Circle } from 'lucide-react';
import { defineMathLabTool } from '../../toolContract.js';
import { TRIGONOMETRY_SCHEMA_VERSION, createTrigonometryData } from './trigState.js';
import { TRIGONOMETRY_CAPABILITIES, TRIGONOMETRY_SCOPES } from './scope.js';
import { summarizeTrigonometry } from './summarize.js';

/**
 * Le مختبر المثلثات (Laboratoire de trigonométrie) — le septième instrument
 * du مختبر الرياضيات.
 *
 * L'élève ne lit pas « sin(30°) = 0,5 » : il AMÈNE le point à 30° et voit
 * pourquoi la hauteur vaut la moitié du rayon. Il tire un sommet de
 * triangle et les trois rapports changent sous son doigt ; il lance la
 * rotation et l'onde du sinus se dessine toute seule ; il pousse θ au-delà
 * du tour et retrouve la même valeur — la périodicité, découverte plutôt que
 * récitée.
 *
 * ── Le triangle d'abord, le cercle ensuite ───────────────────────────────
 * Le programme de 4AM demande « النسب المثلثية في مثلث قائم : جيب · جيب تمام ·
 * ظل زاوية حادة » (ALGERIA_4AM_CURRICULUM §4.2) — le TRIANGLE RECTANGLE et
 * des angles aigus. Le cercle trigonométrique, lui, appartient au lycée.
 * L'instrument ouvre donc sur le triangle, celui du manuel de l'élève, et
 * le cercle est à un clic pour qui veut aller plus loin. C'est la règle déjà
 * tenue par le produit scalaire du مختبر الأشعة (MATH_LAB §5f.10) : ce qui
 * dépasse le programme existe, mais ne fait jamais la première page.
 *
 * Toute la mathématique vit dans des modules purs (trigMath.js,
 * exactValues.js, geometry.js, practice.js) testés à part ; le composant ne
 * fait que les appeler. Chargé PARESSEUSEMENT par `load`. Documenté dans
 * docs/architecture/MATH_LAB.md §5g.
 */
export const trigonometryTool = defineMathLabTool({
  id: 'trigonometry',
  slug: 'trigonometrie',
  labelKey: 'tools.trigonometry.name',
  descriptionKey: 'tools.trigonometry.description',
  newLabelKey: 'tools.trigonometry.new',
  defaultTitleKey: 'tools.trigonometry.defaultTitle',
  icon: Circle,
  schemaVersion: TRIGONOMETRY_SCHEMA_VERSION,
  // Les deux مخابر — au collège : le triangle rectangle en degrés, sans cercle (scope.js).
  scopes: TRIGONOMETRY_SCOPES,
  capabilities: TRIGONOMETRY_CAPABILITIES,
  createInitialData: createTrigonometryData,
  summarize: summarizeTrigonometry,
  load: () => import('./TrigonometryTool.jsx'),
});
