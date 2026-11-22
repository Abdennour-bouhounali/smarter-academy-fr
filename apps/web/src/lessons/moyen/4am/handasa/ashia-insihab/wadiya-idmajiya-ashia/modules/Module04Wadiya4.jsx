import { GuidedProblem } from '../../../../../../common/problems';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PROBLEM } from '../content/problems';

/**
 * Module 4 — الوضعية التدريبية 4 (content/problems.js, id « wadiya-4 ») : une situation d'entraînement de type
 * امتحان — منتصفا القطرين وبرهان بالأشعة (الدروس 2 و 3 و 4) — résolue pas à pas (GuidedProblem) AVANT la وضعية du manuel (module 7) et le إختبار أولي
 * (module 8). Formatif, aucune preuve de maîtrise ; pas de KnowledgeSnapshot (la وضعية se termine sur sa rédaction, comme
 * les مسائل). Modèle : unité 1, wadiya-idmajiya-aadad.
 */
export default function Module04Wadiya4() {
  return (
    <GuidedProblem
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      problem={PROBLEM['wadiya-4']}
      estimatedTime="5 دقائق"
    />
  );
}
