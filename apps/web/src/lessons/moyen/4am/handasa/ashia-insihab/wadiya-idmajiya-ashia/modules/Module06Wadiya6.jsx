import { GuidedProblem } from '../../../../../../common/problems';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PROBLEM } from '../content/problems';

/**
 * Module 6 — الوضعية التدريبية 6 (content/problems.js, id « wadiya-6 ») : une situation d'entraînement de type
 * امتحان — دعامتان متساويتان ومنتصف قطعة (الدروس 1 و 2 و 4) — résolue pas à pas (GuidedProblem) AVANT la وضعية du manuel (module 7) et le إختبار أولي
 * (module 8). Formatif, aucune preuve de maîtrise ; pas de KnowledgeSnapshot (la وضعية se termine sur sa rédaction, comme
 * les مسائل). Modèle : unité 1, wadiya-idmajiya-aadad.
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
