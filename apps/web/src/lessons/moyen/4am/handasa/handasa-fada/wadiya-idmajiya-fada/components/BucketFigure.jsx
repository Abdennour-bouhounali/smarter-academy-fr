import SpaceFigure from '../../../../../../common/components/SpaceFigure';
import { CHALLENGE_FIGURE } from '../content/figures';

/**
 * Le seau du تحدّ (p. 163) — « يُمثّل الشكل المقابل دلوًا فيه ماء » : le tronc de cône, son eau, les cotes du manuel (40 / 30 /
 * 7 / 28), SANS aucune réponse (ni le rayon de la surface, ni le sommet, ni le volume). Dessiné UNE fois ici (SpaceFigure, donnée
 * dans content/figures.js) pour la page d'unité (pages/unit/UnitOpenerFigure.jsx, `'handasa-fada:challenge'`, chargé à la
 * demande) et le module 7 de la synthèse.
 */
export default function BucketFigure({ caption = CHALLENGE_FIGURE.caption, maxWidth = CHALLENGE_FIGURE.maxWidth }) {
  return (
    <div className="mx-auto w-full rounded-xl border-2 border-amber-100 bg-white p-2" style={{ maxWidth }} data-figure="bucket">
      <SpaceFigure {...CHALLENGE_FIGURE} caption={caption} maxWidth={maxWidth} />
    </div>
  );
}
