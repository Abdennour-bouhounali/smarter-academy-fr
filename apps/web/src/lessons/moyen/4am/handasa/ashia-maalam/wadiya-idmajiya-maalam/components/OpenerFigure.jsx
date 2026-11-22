import GeoFigure from '../../../../../../common/components/GeoFigure';
import { SITUATION_FIGURE } from '../content/figures';

/**
 * « الشكل المقابل » de la وضعية (p. 148) sur la page d'unité (pages/unit/UnitOpenerFigure.jsx, clé « ashia-maalam:challenge ») :
 * le MÊME dessin que le module 7 (content/figures.js › SITUATION_FIGURE) — les deux parcours des coureurs. Aucune longueur
 * n'est écrite (3π, √13… sont la réponse).
 */
export default function OpenerFigure() {
  return <GeoFigure {...SITUATION_FIGURE} />;
}
