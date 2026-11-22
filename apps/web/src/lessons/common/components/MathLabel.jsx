import { Suspense, lazy } from 'react';
import { bidi } from '../../../utils/bidi';
import { hasMath, mathToPlain } from '../../../utils/mathPlain';

// KaTeX n'est chargé QUE si le texte porte une formule : ce composant sert aussi des pages
// (cartes de leçon, progression, tableaux de bord) qui n'avaient pas KaTeX dans leur chunk
// (BUNDLE_BOUNDARIES.md). Le texte reste lisible pendant le chargement (`mathToPlain`).
const MathText = lazy(() => import('./MathText'));

/**
 * MathLabel — un TEXTE DE CONTENU affiché hors d'un module : titre, description, point
 * d'apprentissage, prérequis, objectif, consigne d'un module ou d'une ressource.
 *
 * Ces textes viennent du catalogue et des LESSON_CONFIG, écrits comme le contenu des leçons
 * (« الترميز $x \longmapsto ax + b$ »). Imprimés par `bidi()` seul, l'élève lisait les dollars
 * et les antislashs. Sans formule, MathLabel rend exactement `bidi(text)` ; avec formule,
 * MathText (KaTeX, île LTR, isolement des égalités en clair — ARABIC_RTL_CONTRACT.md).
 *
 * Pour un contexte qui n'accepte qu'une chaîne (`<option>`, `title`, `aria-label`, un
 * gabarit), utiliser `mathToPlain` (utils/mathPlain.js).
 */
export default function MathLabel({ children }) {
  if (!hasMath(children)) return <>{bidi(children)}</>;
  return (
    <Suspense fallback={<>{mathToPlain(children)}</>}>
      <MathText>{children}</MathText>
    </Suspense>
  );
}
