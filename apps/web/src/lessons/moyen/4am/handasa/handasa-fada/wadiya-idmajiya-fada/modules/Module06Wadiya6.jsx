import { GuidedProblem } from '../../../../../../common/problems';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PROBLEM } from '../content/problems';

/**
 * Module 6 — الوضعية 6 (content/problems.js, id « wadiya-6 ») : une situation d'entraînement de type امتحان autour des
 * outils de l'unité 14, résolue pas à pas (GuidedProblem) AVANT la وضعية du seau (module 7) et le test (module 8). Formatif,
 * aucune preuve de maîtrise ; pas de KnowledgeSnapshot (la وضعية se termine sur sa rédaction, comme les مسائل).
 */
export default function Module06Wadiya6() {
  return (
    <GuidedProblem
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      problem={PROBLEM['wadiya-6']}
      estimatedTime="5 دقائق"
    />
  );
}
