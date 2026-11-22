import { GuidedProblem } from '../../../../../../common/problems';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PROBLEM } from '../content/problems';

/**
 * Module 7 — مسألة 2 (أحواض حديقة المتوسطة : √12 + √27 + √48, puis un 4e et un 5e bac).
 * Exercice complet de type امتحان, résolu pas à pas (GuidedProblem) ; formatif,
 * aucune preuve de maîtrise. Donnée : content/problems.js. Pas de
 * KnowledgeSnapshot ici (décision du propriétaire, 2026-10-05).
 * 6 minutes : la leçon est déjà à 71 min (plafond 90).
 */
export default function Module07Masala2() {
  return (
    <GuidedProblem
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      problem={PROBLEM['masala-2']}
      estimatedTime="6 دقائق"
    />
  );
}
