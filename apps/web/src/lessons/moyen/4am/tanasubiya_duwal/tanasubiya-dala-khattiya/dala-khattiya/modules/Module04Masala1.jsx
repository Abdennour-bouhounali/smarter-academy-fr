import { GuidedProblem } from '../../../../../../common/problems';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PROBLEM } from '../content/problems';

/**
 * Module 4 — مسألة 1 : مسألة الدرس (آلات الألغاز : 3x + 1, 0,5x², −1,5x), annoncée dès le sommaire et au module 1 :
 * le monde du laboratoire متقدم (trois machines à règle cachée) avec d'autres machines.
 * Exercice complet de type امتحان, résolu pas à pas (GuidedProblem) ; formatif, aucune preuve de
 * maîtrise. Donnée : content/problems.js. Pas de KnowledgeSnapshot (décision du propriétaire, 2026-10-05).
 */
export default function Module04Masala1() {
  return (
    <GuidedProblem
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      problem={PROBLEM['masala-1']}
      estimatedTime="8 دقائق"
    />
  );
}
