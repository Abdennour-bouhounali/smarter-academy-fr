import { GuidedProblem } from '../../../../../../common/problems';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PROBLEM } from '../content/problems';

/**
 * Module 5 — مسألة الدرس (مترو الجزائر : محطتان جديدتان، نفق [EF]), annoncée dès le sommaire et à la fin du module 1 ;
 * prolongement du niveau متقدم du laboratoire (ex-18), d'autres stations.
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
