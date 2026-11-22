import { Spline } from 'lucide-react';
import { defineMathLabTool } from '../../toolContract.js';
import { ANALYSIS_SCHEMA_VERSION, createAnalysisData } from './analysisState.js';
import { summarizeAnalysis } from './summarize.js';

/**
 * Le مختبر التحليل والدوال (Laboratoire d'analyse et des fonctions) — le
 * douzième instrument du مختبر الرياضيات.
 *
 * L'élève ne lit pas « la dérivée est la limite du taux d'accroissement » :
 * il pose A et B sur une courbe, tire B vers A, et VOIT la sécante pivoter
 * jusqu'à se coucher sur la tangente pendant que la pente affichée converge.
 * Il déplace A le long d'une parabole et regarde f′(x) changer de signe
 * exactement là où la courbe cesse de monter. Il pousse n de 2 à 100 et voit
 * les rectangles se resserrer sur l'aire.
 *
 * ── Le taux d'accroissement d'abord, le calcul différentiel ensuite ──────
 * Le programme de 4AM ne contient NI dérivée, NI limite, NI intégrale : tout
 * le calcul différentiel est matière de lycée. Contrairement aux coniques
 * (dont la دائرة est au programme) ou à la trigonométrie (dont le triangle
 * rectangle l'est), cet instrument n'a qu'un seul ancrage authentique en
 * 4AM : les الدوال الخطية والتآلفية (LP 3.7, 3.8) et leur COEFFICIENT
 * DIRECTEUR — c'est-à-dire, exactement, `(f(b) − f(a)) / (b − a)`.
 *
 * L'instrument ouvre donc sur le laboratoire de la SÉCANTE, avec
 * `f(x) = 2x + 1`, deux points et leur pente : un élève de 4AM y reconnaît
 * le geste de son manuel et joue immédiatement. La tangente, la dérivée, les
 * limites, l'intégrale et l'étude de fonction sont construites, complètes, et
 * à un clic — mais ne font jamais la première page. C'est la règle déjà tenue
 * par le produit scalaire (MATH_LAB §5f.10), le cercle trigonométrique
 * (§5g.1), les suites (§5h.1), le تحاكي (§5j.1) et les coniques (§5k.1).
 *
 * ── Ce qui n'a PAS été réécrit ──────────────────────────────────────────
 * Le REPÈRE est celui du grapheur : viewport.js, gridStep.js,
 * useViewportGestures.js et grapherFormat.js sont importés tels quels — une
 * seule implémentation du plan sur la plateforme (§33). L'ANALYSEUR
 * d'expressions et l'ÉVALUATEUR aussi : aucune nouvelle grammaire, et la
 * saisie de l'élève n'est jamais exécutée. La dérivée NUMÉRIQUE du grapheur
 * sert de juge à la dérivée SYMBOLIQUE ajoutée ici (symbolicDerivative.js),
 * et aucune bibliothèque de calcul formel n'a été introduite (§34).
 *
 * Toute la mathématique vit dans des modules purs (symbolicDerivative.js,
 * expressionPrinter.js, analysisMath.js, practice.js) testés à part ; le
 * composant ne fait que les appeler. Chargé PARESSEUSEMENT par `load`.
 * Documenté dans docs/architecture/MATH_LAB.md §5m.
 */
export const analysisTool = defineMathLabTool({
  id: 'analysis',
  slug: 'analyse',
  labelKey: 'tools.analysis.name',
  descriptionKey: 'tools.analysis.description',
  newLabelKey: 'tools.analysis.new',
  defaultTitleKey: 'tools.analysis.defaultTitle',
  // `Spline` — une courbe et ses poignées de tangente. PAS `LineChart`, qui
  // est déjà l'icône du grapheur : deux instruments voisins sous la même
  // vignette seraient indiscernables sur l'accueil.
  icon: Spline,
  schemaVersion: ANALYSIS_SCHEMA_VERSION,
  // مخبر الثانوي seulement : limites, dérivée, intégrale et étude de
  // fonction ; les fonctions affines du collège sont au جبر et au راسم (§5m.1).
  scopes: ['secondaire'],
  createInitialData: createAnalysisData,
  summarize: summarizeAnalysis,
  load: () => import('./AnalysisTool.jsx'),
});
