import { GuidedProblem } from '../../../../../../common/problems';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PROBLEM } from '../content/problems';

/**
 * Module 6 — مسألة 3 (content/problems.js › masala-3). Exercice complet de type امتحان,
 * résolu pas à pas (GuidedProblem) ; formatif, aucune preuve de maîtrise. Pas de
 * KnowledgeSnapshot ici (décision du propriétaire, 2026-10-05) : la مسألة se termine
 * sur sa rédaction.
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
