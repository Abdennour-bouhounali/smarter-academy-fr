import { GuidedProblem } from '../../../../../../common/problems';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PROBLEM } from '../content/problems';

/**
 * Module 4 — مسألة 1 : مسألة الدرس (le drone de la Corniche : tan → angle, le piège R, la plus grande mesure entière permise), annoncée dès le sommaire et au module 1.
 * Exercice complet de type امتحان, résolu pas à pas (GuidedProblem) ; formatif, aucune preuve de maîtrise.
 * Donnée : content/problems.js. Pas de KnowledgeSnapshot ici (décision du propriétaire, 2026-10-05) : la مسألة
 * se termine sur sa rédaction, pas sur la carte des معارف.
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
