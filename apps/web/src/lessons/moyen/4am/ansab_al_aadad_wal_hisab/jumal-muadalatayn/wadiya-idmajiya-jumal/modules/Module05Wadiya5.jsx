import { GuidedProblem } from '../../../../../../common/problems';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PROBLEM } from '../content/problems';

/**
 * Module 5 — الوضعية التدريبية 5 (content/problems.js, id « wadiya-5 ») : une situation
 * d'entraînement de type امتحان autour des جمل معادلتين, résolue pas à pas (GuidedProblem)
 * AVANT la situation évaluée du module 8. Formatif, aucune preuve de maîtrise ;
 * pas de KnowledgeSnapshot (la وضعية se termine sur sa rédaction, comme les مسائل).
 */
export default function Module05Wadiya5() {
  return (
    <GuidedProblem
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      problem={PROBLEM['wadiya-5']}
      estimatedTime="6 دقائق"
    />
  );
}
