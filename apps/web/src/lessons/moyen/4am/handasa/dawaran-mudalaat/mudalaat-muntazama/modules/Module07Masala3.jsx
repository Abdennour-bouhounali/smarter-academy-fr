import { GuidedProblem } from '../../../../../../common/problems';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PROBLEM } from '../content/problems';

/**
 * Module 7 — مسألة 3 (les panneaux « قف » octogonaux : 45° et 135°, AB ≈ 30,4 cm, la bande réfléchissante).
 * Exercice complet de type امتحان, résolu pas à pas (GuidedProblem) ; formatif, aucune preuve de maîtrise.
 * Donnée : content/problems.js. Pas de KnowledgeSnapshot ici (décision du propriétaire, 2026-10-05) : la مسألة se
 * termine sur sa rédaction, pas sur la carte des معارف.
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
