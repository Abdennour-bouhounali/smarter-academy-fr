import { GuidedProblem } from '../../../../../../common/problems';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PROBLEM } from '../content/problems';

/**
 * Module 2 — الوضعية التدريبية 2 (content/problems.js, id « wadiya-2 ») : une situation d'entraînement de type امتحان autour des cinq leçons de l'unité,
 * résolue pas à pas (GuidedProblem) AVANT l'analyse (module 7) et la situation évaluée (module 8). Formatif, aucune preuve de maîtrise ; pas de KnowledgeSnapshot.
 */
export default function Module02Wadiya2() {
  return (
    <GuidedProblem
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      problem={PROBLEM['wadiya-2']}
      estimatedTime="6 دقائق"
    />
  );
}
