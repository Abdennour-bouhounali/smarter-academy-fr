import { GuidedProblem } from '../../../../../../common/problems';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PROBLEM } from '../content/problems';

/**
 * Module 6 — مسألة 1 (content/problems.js) : exercice complet de type اختبار الفصل الأول, résolu pas à pas
 * (GuidedProblem) ; formatif, aucune preuve de maîtrise. Pas de KnowledgeSnapshot (MASAIL_GENERATION_GUIDE R6).
 */
export default function Module06Masala1() {
  return (
    <GuidedProblem
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      problem={PROBLEM['masala-1']}
      estimatedTime="8 دقائق"
    />
  );
}
