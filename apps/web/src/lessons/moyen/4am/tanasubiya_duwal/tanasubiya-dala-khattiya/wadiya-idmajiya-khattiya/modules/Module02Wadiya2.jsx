import { GuidedProblem } from '../../../../../../common/problems';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PROBLEM } from '../content/problems';

/**
 * Module 2 — الوضعية التدريبية 2 (content/problems.js, id « wadiya-2 ») : une situation
 * d'entraînement de type امتحان autour de l'unité 6, résolue pas à pas (GuidedProblem) AVANT la
 * situation du téléphérique (module 7 = son analyse, module 8 = « وضعية الاختبار النهائي »). Formatif,
 * aucune preuve de maîtrise ; pas de KnowledgeSnapshot (la وضعية se termine sur sa rédaction).
 */
export default function Module02Wadiya2() {
  return (
    <GuidedProblem
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      problem={PROBLEM['wadiya-2']}
      estimatedTime="7 دقائق"
    />
  );
}
