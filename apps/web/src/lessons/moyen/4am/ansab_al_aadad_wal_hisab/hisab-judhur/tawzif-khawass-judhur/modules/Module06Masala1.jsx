import { GuidedProblem } from '../../../../../../common/problems';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PROBLEM } from '../content/problems';

/**
 * Module 6 — مسألة الدرس (طاولة الفسيفساء, 200 dm²), annoncée dès le sommaire et au module 1.
 * Exercice complet de type امتحان, résolu pas à pas (GuidedProblem) ; formatif,
 * aucune preuve de maîtrise. Donnée : content/problems.js. Pas de
 * KnowledgeSnapshot ici (décision du propriétaire, 2026-10-05).
 * 6 minutes : la leçon est déjà à 71 min (plafond 90).
 */
export default function Module06Masala1() {
  return (
    <GuidedProblem
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      problem={PROBLEM['masala-1']}
      estimatedTime="6 دقائق"
    />
  );
}
