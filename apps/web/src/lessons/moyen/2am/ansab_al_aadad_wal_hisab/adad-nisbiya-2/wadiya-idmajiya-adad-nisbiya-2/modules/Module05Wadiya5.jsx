import { GuidedProblem } from '../../../../../../common/problems';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PROBLEM } from '../content/problems';

/**
 * Module 5 — الوضعية التدريبية 5 (content/problems.js, id « wadiya-5 ») : une situation d'entraînement de type امتحان autour des six leçons de l’unité,
 * résolue pas à pas (GuidedProblem) AVANT l'analyse (module 7) et la situation évaluée (module 8). Formatif, aucune preuve de maîtrise ; pas de KnowledgeSnapshot.
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
