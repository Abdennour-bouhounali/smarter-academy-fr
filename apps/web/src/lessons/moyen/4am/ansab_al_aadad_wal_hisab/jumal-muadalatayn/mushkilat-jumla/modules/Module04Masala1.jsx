import { GuidedProblem } from '../../../../../../common/problems';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PROBLEM } from '../content/problems';

/**
 * Module 4 — مسألة 1 : مسألة الدرس (متحف الولاية, 180 visiteurs et 33000 دج), annoncée dès le sommaire et au module 1 :
 * le monde du laboratoire متقدم (le musée de نشاط 3) avec d'autres nombres.
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
