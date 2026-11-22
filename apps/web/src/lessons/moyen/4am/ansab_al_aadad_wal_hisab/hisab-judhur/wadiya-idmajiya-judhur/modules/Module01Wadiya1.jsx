import { GuidedProblem } from '../../../../../../common/problems';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PROBLEM } from '../content/problems';

/**
 * Module 1 — الوضعية التدريبية 1 (content/problems.js, id « wadiya-1 ») : une situation
 * d'entraînement de type امتحان autour de l'unité « الحساب على الجذور », résolue pas à pas
 * (GuidedProblem) AVANT la وضعية évaluée du module 9. Formatif, aucune preuve de maîtrise ;
 * pas de KnowledgeSnapshot (la وضعية se termine sur sa rédaction, comme les مسائل).
 */
export default function Module01Wadiya1() {
  return (
    <GuidedProblem
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      problem={PROBLEM['wadiya-1']}
      estimatedTime="6 دقائق"
    />
  );
}
