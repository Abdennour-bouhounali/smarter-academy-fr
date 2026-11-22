import { GuidedProblem } from '../../../../../../common/problems';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PROBLEM } from '../content/problems';

/**
 * Module 8 — مسألة 3 (كراء سيارة : 4000 دج forfait ou 2500 دج + 12 دج le كيلومتر).
 * Exercice complet de type امتحان, résolu pas à pas (GuidedProblem) ; formatif,
 * aucune preuve de maîtrise. Donnée : content/problems.js. Pas de
 * KnowledgeSnapshot ici (décision du propriétaire, 2026-10-05) : la مسألة
 * se termine sur sa rédaction, pas sur la carte des معارف.
 */
export default function Module08Masala3() {
  return (
    <GuidedProblem
      ctx={MODULE_CTX}
      navLinks={getNavLinks(8)}
      moduleNumber={8}
      problem={PROBLEM['masala-3']}
      estimatedTime="8 دقائق"
    />
  );
}
