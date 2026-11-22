import { GuidedProblem } from '../../../../../../common/problems';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PROBLEM } from '../content/problems';

/**
 * Module 6 — مسألة 2 (أمطار تيزي وزو : une tempête de novembre, moyenne contre médiane, puis on la retire).
 * Exercice complet de type امتحان, résolu pas à pas (GuidedProblem) ; formatif, aucune preuve de
 * maîtrise. Donnée : content/problems.js. Pas de KnowledgeSnapshot ici (décision du propriétaire,
 * 2026-10-05) : la مسألة se termine sur sa rédaction.
 */
export default function Module06Masala2() {
  return (
    <GuidedProblem
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      problem={PROBLEM['masala-2']}
      estimatedTime="8 دقائق"
    />
  );
}
