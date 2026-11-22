import { GuidedProblem } from '../../../../../../common/problems';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PROBLEM } from '../content/problems';

/** Module 7 — مسألة 3 (content/problems.js) : exercice complet de type اختبار الفصل, résolu pas à pas (GuidedProblem) ; formatif, aucune preuve de maîtrise. */
export default function Module07Masala3() {
  return (
    <GuidedProblem
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      problem={PROBLEM['masala-3']}
      estimatedTime="8 دقائق"
    />
  );
}
