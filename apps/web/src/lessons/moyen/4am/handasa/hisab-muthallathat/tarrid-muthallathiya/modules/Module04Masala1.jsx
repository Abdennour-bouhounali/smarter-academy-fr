import { GuidedProblem } from '../../../../../../common/problems';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PROBLEM } from '../content/problems';

/**
 * Module 4 — مسألة 1 : مسألة الدرس (سلّم الجدارية : 2,40 m, 65°, une échelle de 2,50 m au plus), annoncée dès le sommaire et à la fin du module 1.
 * Exercice complet de type امتحان, résolu pas à pas (GuidedProblem) ; formatif, aucune preuve de maîtrise. Donnée :
 * content/problems.js. Pas de KnowledgeSnapshot ici (décision du propriétaire, 2026-10-05).
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
