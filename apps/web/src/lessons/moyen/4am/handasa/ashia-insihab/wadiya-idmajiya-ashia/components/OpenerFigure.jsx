import GeoFigure from '../../../../../../common/components/GeoFigure';
import { MODEL } from '../content/figures';

/**
 * La figure de la وضعية (p. 136) seule, pour la page d'unité (pages/unit/UnitOpenerFigure.jsx › 'ashia-insihab:challenge') :
 * le MÊME dessin que le module 7 (content/figures.js › MODEL) — la route, le passage [MN], le chemin A→M→N→B ; aucune réponse.
 */
export default function OpenerFigure() {
  return <GeoFigure {...MODEL} />;
}
