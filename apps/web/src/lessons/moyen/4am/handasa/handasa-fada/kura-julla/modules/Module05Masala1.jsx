import { GuidedProblem } from '../../../../../../common/problems';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PROBLEM } from '../content/problems';

/**
 * Module 5 — مسألة 1 = « مسألة الدرس » (content/problems.js ; énoncé et figure dans LESSON_CONFIG.lessonProblem). Exercice complet de type امتحان, résolu pas à pas (GuidedProblem) ;
 * formatif, aucune preuve de maîtrise. Pas de KnowledgeSnapshot (décision du propriétaire, 2026-10-05) : la مسألة se
 * termine sur sa rédaction.
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
