import { GuidedProblem } from '../../../../../../common/problems';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PROBLEM } from '../content/problems';

/**
 * Module 3 — الوضعية التدريبية 3 (content/problems.js, id « wadiya-3 ») : une situation d'entraînement de type امتحان autour des quatre leçons de l'unité,
 * résolue pas à pas (GuidedProblem) AVANT l'analyse (module 7) et la situation évaluée (module 8). Formatif, aucune preuve de maîtrise ; pas de KnowledgeSnapshot.
 */
export default function Module03Wadiya3() {
  return (
    <GuidedProblem
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      problem={PROBLEM['wadiya-3']}
      estimatedTime="6 دقائق"
    />
  );
}
