import { Circle } from 'lucide-react';
import { defineMathLabTool } from '../../toolContract.js';
import { CONICS_SCHEMA_VERSION, createConicsData } from './conicState.js';
import { summarizeConics } from './summarize.js';

/**
 * Le مختبر المقاطع المخروطية (Laboratoire des coniques et de la géométrie
 * analytique) — le dixième instrument du مختبر الرياضيات.
 *
 * Une conique n'est pas une formule à retenir : c'est une courbe qu'on
 * ATTRAPE. L'élève tire le centre d'un cercle et voit `(x − h)² + (y − k)²`
 * changer sous ses yeux ; il écrit `x² + y² − 4x − 6y + 9 = 0`, et la courbe
 * se déplace là où la complétion du carré l'envoie ; il pose un point sur
 * une ellipse, le fait glisser tout autour, et constate que `PF₁ + PF₂` ne
 * bouge pas — sans qu'aucun texte ne le lui ait dit d'abord.
 *
 * ── Le programme d'abord, le reste d'un clic ────────────────────────────
 * Les coniques sont matière de LYCÉE ; le programme de 4AM demande la
 * DAIRA — la دائرة, son centre, son rayon, la distance au centre. L'instrument
 * ouvre donc sur `x² + y² = 9` et son point sonde — le geste du manuel — et
 * le قطع مكافئ, le قطع ناقص et le قطع زائد existent, complets, mais ne font
 * jamais la première page. C'est la règle déjà tenue par le produit scalaire
 * du مختبر الأشعة (MATH_LAB §5f.10), le cercle trigonométrique (§5g.1), les
 * suites (§5h) et le تحاكي (§5j).
 *
 * Le REPÈRE est celui du grapheur : viewport.js, gridStep.js,
 * useViewportGestures.js et grapherFormat.js sont importés tels quels — une
 * seule implémentation du plan sur la plateforme. Toute la mathématique vit
 * dans des modules purs (conicMath.js, conicParser.js, intersections.js,
 * sceneAnalysis.js, practice.js) testés à part ; le composant ne fait que
 * les appeler. L'analyseur d'équations n'exécute JAMAIS la saisie de l'élève
 * (§51) : c'est une descente récursive sur un sous-ensemble strict, dans
 * l'anneau des polynômes de degré ≤ 2. Chargé PARESSEUSEMENT par `load`.
 * Documenté dans docs/architecture/MATH_LAB.md §5k.
 */
export const conicsTool = defineMathLabTool({
  id: 'conics',
  slug: 'coniques',
  labelKey: 'tools.conics.name',
  descriptionKey: 'tools.conics.description',
  newLabelKey: 'tools.conics.new',
  defaultTitleKey: 'tools.conics.defaultTitle',
  icon: Circle,
  schemaVersion: CONICS_SCHEMA_VERSION,
  // مخبر الثانوي seulement : l'équation d'une conique — cercle compris — est
  // du lycée ; le collège mesure des distances au مختبر الأشعة (§5k.1).
  scopes: ['secondaire'],
  createInitialData: createConicsData,
  summarize: summarizeConics,
  load: () => import('./ConicsTool.jsx'),
});
