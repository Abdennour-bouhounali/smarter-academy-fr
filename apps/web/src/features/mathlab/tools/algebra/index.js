import { Sigma } from 'lucide-react';
import { defineMathLabTool } from '../../toolContract.js';
import { ALGEBRA_SCHEMA_VERSION, createAlgebraData } from './algebraState.js';
import { ALGEBRA_CAPABILITIES, ALGEBRA_SCOPES } from './scope.js';
import { summarizeAlgebra } from './summarize.js';

/**
 * Le مختبر الجبر (Laboratoire d'algèbre) — le cinquième instrument du
 * مختبر الرياضيات.
 *
 * Une équation n'est pas une question à laquelle un outil répond : c'est un
 * objet qu'on MANIPULE. L'élève choisit une opération, elle part aux deux
 * membres à la fois, et il regarde l'équation se simplifier jusqu'à `x = 4`.
 * La solution ne s'affiche pas à l'ouverture — « إظهار الحل » est une
 * commande secondaire, jamais l'écran d'accueil.
 *
 * L'icône reste celle que l'accueil annonçait (Sigma) ; la BALANCE, image
 * du chapitre, est ce que le laboratoire DESSINE (BalanceScale.jsx) —
 * l'icône Scale est réservée à القياس, encore à venir. Toute la mathématique
 * vit dans des modules purs (rational.js, linearForm.js, equation.js) testés
 * à part ; le composant ne fait que les appeler. Chargé PARESSEUSEMENT par
 * `load`. Documenté dans docs/architecture/MATH_LAB.md §5e.
 *
 * V2 (schéma 2) : six sections sous une même barre — المعادلات (la balance
 * V1, intacte), المتراجحات, الأنظمة, تبسيط التعابير, التحليل إلى عوامل, الدوال —
 * sur des moteurs purs (polynomial.js, simplify.js, factor.js, systems.js,
 * functions.js). Un document V1 se rouvre tel quel sur « المعادلات ».
 */
export const algebraTool = defineMathLabTool({
  id: 'algebra',
  slug: 'algebre',
  labelKey: 'tools.algebra.name',
  descriptionKey: 'tools.algebra.description',
  newLabelKey: 'tools.algebra.new',
  defaultTitleKey: 'tools.algebra.defaultTitle',
  icon: Sigma,
  schemaVersion: ALGEBRA_SCHEMA_VERSION,
  // Les deux مخابر — au collège : facteur commun et identités, fonctions affines (scope.js).
  scopes: ALGEBRA_SCOPES,
  capabilities: ALGEBRA_CAPABILITIES,
  createInitialData: createAlgebraData,
  summarize: summarizeAlgebra,
  load: () => import('./AlgebraTool.jsx'),
});
