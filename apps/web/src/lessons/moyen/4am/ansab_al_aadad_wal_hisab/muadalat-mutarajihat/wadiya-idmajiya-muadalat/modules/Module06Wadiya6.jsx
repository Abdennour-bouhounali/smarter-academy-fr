import { GuidedProblem } from '../../../../../../common/problems';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PROBLEM } from '../content/problems';

/**
 * Module 6 — الوضعية التدريبية 6 (content/problems.js, id « wadiya-6 ») : une situation d'entraînement de type امتحان autour des
 * équations et des inéquations, résolue pas à pas (GuidedProblem) AVANT la situation évaluée du module 8. Formatif, aucune preuve de maîtrise ;
 * pas de KnowledgeSnapshot (la وضعية se termine sur sa rédaction, comme les مسائل). Fichier RECRÉÉ le 2026-11-12 (la synthèse dans le lecteur
 * de mission) : supprimé le 2026-10-13 (2b1e7342, « remap wadiya module problems »), la وضعية n'avait plus de route.
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
