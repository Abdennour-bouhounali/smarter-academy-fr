import { GuidedProblem } from '../../../../../../common/problems';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PROBLEM } from '../content/problems';

/**
 * Module 1 — الوضعية التدريبية 1 (content/problems.js, id « wadiya-1 ») : une situation d'entraînement de type
 * امتحان — زخرفة الجدار بالانسحاب (الدرس 1 والدرس 3) — résolue pas à pas (GuidedProblem) AVANT la وضعية du manuel (module 7) et le إختبار أولي
 * (module 8). Formatif, aucune preuve de maîtrise ; pas de KnowledgeSnapshot (la وضعية se termine sur sa rédaction, comme
 * les مسائل). Modèle : unité 1, wadiya-idmajiya-aadad.
 */
export default function Module01Wadiya1() {
  return (
    <GuidedProblem
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      problem={PROBLEM['wadiya-1']}
      estimatedTime="5 دقائق"
    />
  );
}
