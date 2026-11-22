import { GuidedProblem } from '../../../../../../common/problems';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PROBLEM } from '../content/problems';

/**
 * Module 6 — ساحة الحيّ الجديد : le quatrième sommet d'un متوازي أضلاع, la proposition de l'entrepreneur (BA au lieu de AB), le coût d'une conduite.
 * Exercice complet de type امتحان, résolu pas à pas (GuidedProblem) ; formatif, aucune preuve de maîtrise.
 * Donnée : content/problems.js (sa figure GeoFigure est dessinée sous l'énoncé). Pas de KnowledgeSnapshot ici
 * (décision du propriétaire, 2026-10-05).
 */
export default function Module06Masala2() {
  return (
    <GuidedProblem
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      problem={PROBLEM['masala-2']}
      estimatedTime="8 دقائق"
    />
  );
}
