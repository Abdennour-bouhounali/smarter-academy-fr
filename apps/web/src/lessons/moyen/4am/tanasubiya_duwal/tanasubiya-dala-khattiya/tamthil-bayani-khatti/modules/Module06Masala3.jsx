import { GuidedProblem } from '../../../../../../common/problems';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PROBLEM } from '../content/problems';

/**
 * Module 6 — مسألة 3.
 * Exercice complet de type امتحان, résolu pas à pas (GuidedProblem) ; formatif, aucune preuve de
 * maîtrise. Donnée : content/problems.js. Pas de KnowledgeSnapshot (décision du propriétaire).
 */
export default function Module06Masala3() {
  return (
    <GuidedProblem
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      problem={PROBLEM['masala-3']}
      estimatedTime="8 دقائق"
    />
  );
}
