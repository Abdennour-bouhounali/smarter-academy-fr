import SightLineFigure from './SightLineFigure';
import { SITUATION } from '../content/textbook';

/**
 * La figure de la وضعية « مقام الشهيد » seule, pour l'ouverture de la page d'unité (تحدّ) : le même dessin que
 * le module 7 (SightLineFigure, nombres de SITUATION.figure) — la hauteur y reste « ? », l'angle « x ».
 */
export default function OpenerFigure() {
  return <SightLineFigure {...SITUATION.figure} landmark="maqam" />;
}
