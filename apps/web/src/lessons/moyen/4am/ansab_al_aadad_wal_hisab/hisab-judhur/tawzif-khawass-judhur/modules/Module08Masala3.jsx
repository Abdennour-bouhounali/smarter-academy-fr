import { GuidedProblem } from '../../../../../../common/problems';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PROBLEM } from '../content/problems';

/**
 * Module 8 — مسألة 3 (الطائرات الورقية : 50/√2 à dénominateur rationnel, puis le ruban).
 * Exercice complet de type امتحان, résolu pas à pas (GuidedProblem) ; formatif,
 * aucune preuve de maîtrise. Donnée : content/problems.js. Pas de
 * KnowledgeSnapshot ici (décision du propriétaire, 2026-10-05).
 * 6 minutes : la leçon est déjà à 71 min (plafond 90).
 */
export default function Module08Masala3() {
  return (
    <GuidedProblem
      ctx={MODULE_CTX}
      navLinks={getNavLinks(8)}
      moduleNumber={8}
      problem={PROBLEM['masala-3']}
      estimatedTime="6 دقائق"
    />
  );
}
