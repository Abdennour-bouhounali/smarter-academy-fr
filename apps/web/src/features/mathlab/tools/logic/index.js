import { GitBranch } from 'lucide-react';
import { defineMathLabTool } from '../../toolContract.js';
import { LOGIC_SCHEMA_VERSION, createLogicData } from './logicState.js';
import { LOGIC_CAPABILITIES, LOGIC_SCOPES } from './scope.js';
import { summarizeLogic } from './summarize.js';

/**
 * مختبر المنطق والبرهان (Logic & Proof Lab) — le treizième instrument du
 * مختبر الرياضيات.
 *
 *     أقترح ← أختبر ← أبحث عن مثال مضاد ← ألاحظ ← أبني الحجة ← أتحقق
 *
 * Ce n'est PAS une leçon statique sur le vocabulaire de la logique.
 * L'élève ne lit jamais « une implication est vraie sauf si P est vrai et Q
 * faux » : il règle P et Q sur une table de vérité qui répond sous son
 * doigt, il cherche un contre-exemple à un ∀ prétendument vrai et le trouve
 * lui-même, il fait glisser les étapes d'une preuve et découvre où la
 * chaîne casse. La vérité devient quelque chose qu'on OBSERVE, jamais
 * quelque chose qu'on récite.
 *
 * ── Dix aires, un seul laboratoire ────────────────────────────────────────
 * Comme numberLab (MATH_LAB.md §5l) : les aires ne sont pas des routes. Une
 * seule URL, un seul document — l'élève passe des propositions aux
 * connecteurs, des connecteurs à l'implication, sans jamais perdre ce qu'il
 * a réglé ailleurs (logicState.js).
 *
 * ── La correction avant tout ──────────────────────────────────────────────
 * §48 du cahier des charges : ce laboratoire est « highly sensitive to
 * logical correctness ». Aucune vérité affichée ne vient d'une condition
 * éparpillée dans un composant : tout passe par logicMath.js (les
 * connecteurs, la contraposée, De Morgan, les quantificateurs) et
 * proofMath.js (l'ordre d'une preuve), tous deux purs et testés à part.
 * Chaque énoncé concret est un préréglage VÉRIFIÉ (presets.js,
 * presets.test.js) — jamais un énoncé généré à la volée dans un composant.
 *
 * Chargé PARESSEUSEMENT par `load`. Documenté dans
 * docs/architecture/MATH_LAB.md §5n.
 */
export const logicTool = defineMathLabTool({
  id: 'logic',
  slug: 'logique',
  labelKey: 'tools.logic.name',
  descriptionKey: 'tools.logic.description',
  newLabelKey: 'tools.logic.new',
  defaultTitleKey: 'tools.logic.defaultTitle',
  icon: GitBranch,
  schemaVersion: LOGIC_SCHEMA_VERSION,
  // Les deux مخابر — au collège : énoncé, réciproque, contre-exemple, erreurs (scope.js).
  scopes: LOGIC_SCOPES,
  capabilities: LOGIC_CAPABILITIES,
  createInitialData: createLogicData,
  summarize: summarizeLogic,
  load: () => import('./LogicLabTool.jsx'),
});
