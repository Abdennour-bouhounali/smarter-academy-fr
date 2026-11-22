import { GuidedProblem } from '../../../../../../common/problems';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PROBLEM } from '../content/problems';

/**
 * Module 3 — الوضعية التدريبية 3 (content/problems.js, id « wadiya-3 ») : une situation d'entraînement de type
 * امتحان — مجموع شعاعين ومسار مغلق (الدرس 3) — résolue pas à pas (GuidedProblem) AVANT la وضعية du manuel (module 7) et le إختبار أولي
 * (module 8). Formatif, aucune preuve de maîtrise ; pas de KnowledgeSnapshot (la وضعية se termine sur sa rédaction, comme
 * les مسائل). Modèle : unité 1, wadiya-idmajiya-aadad.
 */
export default function Module03Wadiya3() {
  return (
    <GuidedProblem
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      problem={PROBLEM['wadiya-3']}
      estimatedTime="5 دقائق"
    />
  );
}
