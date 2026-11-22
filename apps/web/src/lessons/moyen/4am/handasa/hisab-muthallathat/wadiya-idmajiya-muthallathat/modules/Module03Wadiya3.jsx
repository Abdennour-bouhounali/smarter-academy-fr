import { GuidedProblem } from '../../../../../../common/problems';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PROBLEM } from '../content/problems';

/**
 * Module 3 — الوضعية التدريبية 3 (content/problems.js, id « wadiya-3 ») : une situation d'entraînement de type امتحان
 * autour du calcul trigonométrique dans le triangle rectangle, résolue pas à pas (GuidedProblem) AVANT la وضعية du manuel
 * (module 7) et la situation évaluée (module 8). Formatif, aucune preuve de maîtrise ; pas de KnowledgeSnapshot
 * (la وضعية se termine sur sa rédaction, comme les مسائل).
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
