import { GuidedProblem } from '../../../../../../common/problems';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PROBLEM } from '../content/problems';

/**
 * Module 8 — مسألة 3 (content/problems.js) : exercice complet de type اختبار الفصل الأول, résolu pas à pas
 * (GuidedProblem) ; formatif, aucune preuve de maîtrise. Pas de KnowledgeSnapshot (MASAIL_GENERATION_GUIDE R6).
 */
export default function Module08Masala3() {
  return (
    <GuidedProblem
      ctx={MODULE_CTX}
      navLinks={getNavLinks(8)}
      moduleNumber={8}
      problem={PROBLEM['masala-3']}
      estimatedTime="8 دقائق"
    />
  );
}
