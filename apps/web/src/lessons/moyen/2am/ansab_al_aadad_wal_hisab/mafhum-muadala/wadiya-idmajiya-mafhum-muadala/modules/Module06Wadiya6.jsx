import { GuidedProblem } from '../../../../../../common/problems';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PROBLEM } from '../content/problems';

/**
 * Module 6 — الوضعية التدريبية 6 (content/problems.js, id « wadiya-6 ») : une situation d'entraînement de type امتحان autour des trois leçons de l'unité 4 (العبارة الحرفية, اختبار المساواة والمتباينة, حلّ المعادلة),
 * résolue pas à pas (GuidedProblem) AVANT l'analyse (module 7) et la situation évaluée (module 8). Formatif, aucune preuve de maîtrise ; pas de KnowledgeSnapshot.
 */
export default function Module06Wadiya6() {
  return (
    <GuidedProblem
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      problem={PROBLEM['wadiya-6']}
      estimatedTime="6 دقائق"
    />
  );
}
