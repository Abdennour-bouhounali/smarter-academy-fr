import { GuidedProblem } from '../../../../../../common/problems';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PROBLEM } from '../content/problems';

/**
 * Module 2 — الوضعية التدريبية 2 (content/problems.js, id « wadiya-2 ») : une situation d'entraînement de type امتحان,
 * résolue pas à pas (GuidedProblem) AVANT la وضعية du manuel (module 7). Formatif, aucune preuve de maîtrise ;
 * pas de KnowledgeSnapshot (la وضعية se termine sur sa rédaction, comme les مسائل).
 */
export default function Module02Wadiya2() {
  return (
    <GuidedProblem
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      problem={PROBLEM['wadiya-2']}
      estimatedTime="5 دقائق"
    />
  );
}
