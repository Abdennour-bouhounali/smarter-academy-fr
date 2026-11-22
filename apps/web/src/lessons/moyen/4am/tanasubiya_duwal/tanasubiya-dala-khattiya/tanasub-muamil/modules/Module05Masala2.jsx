import { GuidedProblem } from '../../../../../../common/problems';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PROBLEM } from '../content/problems';

/**
 * Module 5 — مسألة 2 (content/problems.js › masala-2). Exercice complet de type امتحان, résolu
 * pas à pas (GuidedProblem) ; formatif, aucune preuve de maîtrise. Pas de KnowledgeSnapshot ici
 * (décision du propriétaire, 2026-10-05) : la مسألة se termine sur sa rédaction.
 */
export default function Module05Masala2() {
  return (
    <GuidedProblem
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      problem={PROBLEM['masala-2']}
      estimatedTime="8 دقائق"
    />
  );
}
