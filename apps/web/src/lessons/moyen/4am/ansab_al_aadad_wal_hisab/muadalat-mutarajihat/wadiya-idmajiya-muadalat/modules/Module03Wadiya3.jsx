import { GuidedProblem } from '../../../../../../common/problems';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PROBLEM } from '../content/problems';

/**
 * Module 3 — الوضعية التدريبية 3 (content/problems.js, id « wadiya-3 ») : une situation d'entraînement de type امتحان autour des
 * équations et des inéquations, résolue pas à pas (GuidedProblem) AVANT la situation évaluée du module 8. Formatif, aucune preuve de maîtrise ;
 * pas de KnowledgeSnapshot (la وضعية se termine sur sa rédaction, comme les مسائل). Fichier RECRÉÉ le 2026-11-12 (la synthèse dans le lecteur
 * de mission) : supprimé le 2026-10-13 (2b1e7342, « remap wadiya module problems »), la وضعية n'avait plus de route.
 */
export default function Module03Wadiya3() {
  return (
    <GuidedProblem
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      problem={PROBLEM['wadiya-3']}
      estimatedTime="7 دقائق"
    />
  );
}
