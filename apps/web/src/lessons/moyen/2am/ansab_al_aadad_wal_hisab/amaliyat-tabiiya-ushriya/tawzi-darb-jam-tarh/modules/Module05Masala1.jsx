import { GuidedProblem } from '../../../../../../common/problems';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PROBLEM } from '../content/problems';

/** Module 5 — مسألة 1 (content/problems.js) : exercice complet de type اختبار الفصل, résolu pas à pas (GuidedProblem) ; formatif, aucune preuve de maîtrise. */
export default function Module05Masala1() {
  return (
    <GuidedProblem
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      problem={PROBLEM['masala-1']}
      estimatedTime="8 دقائق"
    />
  );
}
