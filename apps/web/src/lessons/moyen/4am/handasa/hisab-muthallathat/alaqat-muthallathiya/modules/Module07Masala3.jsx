import { GuidedProblem } from '../../../../../../common/problems';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PROBLEM } from '../content/problems';

/**
 * Module 7 — اللوح الشمسي : sin et tan depuis cos x = 21/29, le rapport impossible, le gabarit à l'équerre et à la règle.
 * Exercice complet de type امتحان, résolu pas à pas (GuidedProblem) ; formatif, aucune preuve de maîtrise.
 * Donnée : content/problems.js. Pas de KnowledgeSnapshot ici (décision du propriétaire, 2026-10-05).
 */
export default function Module07Masala3() {
  return (
    <GuidedProblem
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      problem={PROBLEM['masala-3']}
      estimatedTime="8 دقائق"
    />
  );
}
