import { GuidedProblem } from '../../../../../../common/problems';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PROBLEM } from '../content/problems';

/**
 * Module 5 — مسألة الدرس (حصّة التسديد : la dimension du نشاط 4, d'autres nombres), annoncée dès le sommaire et au module 1.
 * Exercice complet de type امتحان, résolu pas à pas (GuidedProblem) ; formatif, aucune preuve de maîtrise.
 * Donnée : content/problems.js. Pas de KnowledgeSnapshot (décision du propriétaire, 2026-10-05).
 */
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
