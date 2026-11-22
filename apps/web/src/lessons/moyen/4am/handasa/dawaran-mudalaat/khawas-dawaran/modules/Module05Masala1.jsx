import { GuidedProblem } from '../../../../../../common/problems';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PROBLEM } from '../content/problems';

/**
 * Module 5 — مسألة 1 : مسألة الدرس (نجمة الزليج على الورقة الشفافة، الطريقة ص 155 بأعداد أخرى).
 * Exercice complet de type امتحان, résolu pas à pas (GuidedProblem) ; formatif, aucune preuve de maîtrise. Donnée :
 * content/problems.js. Pas de KnowledgeSnapshot ici (décision du propriétaire, 2026-10-05) : la مسألة se termine sur sa
 * rédaction, pas sur la carte des معارف.
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
