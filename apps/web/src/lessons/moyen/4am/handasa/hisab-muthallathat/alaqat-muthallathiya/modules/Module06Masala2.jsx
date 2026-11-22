import { GuidedProblem } from '../../../../../../common/problems';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PROBLEM } from '../content/problems';

/**
 * Module 6 — لافتة الطريق الجبلي : sin → cos → tan, la pente en %, la pancarte fausse, la déviation pour camions.
 * Exercice complet de type امتحان, résolu pas à pas (GuidedProblem) ; formatif, aucune preuve de maîtrise.
 * Donnée : content/problems.js. Pas de KnowledgeSnapshot ici (décision du propriétaire, 2026-10-05).
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
