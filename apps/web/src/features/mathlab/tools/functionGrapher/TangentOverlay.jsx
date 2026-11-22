import { Line, Point, Text, Polyline } from 'mafs';
import { formatValue } from './grapherFormat.js';
import { CONSTRUCTION_COLOR } from './grapherState.js';

/**
 * Les CONSTRUCTIONS du mode « المماس » du grapheur, dessinées dans le plan :
 *   - la tangente en A (une droite entière, y = f(a) + f′(a)(x − a)) ;
 *   - le triangle de pente : un pas horizontal `run` (un carreau de la
 *     grille) et la montée f′(a)·run, avec ses deux mesures ;
 *   - le guide vertical de A vers B = (a ; f′(a)) sur la courbe de f′,
 *     et B lui-même — même abscisse, l'ordonnée est la pente.
 * Quand la dérivée n'existe pas en a (angle, bord du domaine, pôle), rien
 * de tout cela n'est dessiné : on ne montre pas une tangente qui n'est pas.
 *
 * Tout est en couleur de construction (ardoise), sauf B qui porte la couleur
 * de f′ : ce que l'élève touche (A, f) garde la couleur de f.
 */
export default function TangentOverlay({ tangent, step, showTriangle, showDerivative, derivativeColor }) {
  if (!tangent) return null;
  const { x, y, slope } = tangent;
  const run = step;
  const rise = slope * run;

  return (
    <>
      <Line.PointSlope point={[x, y]} slope={slope} color={CONSTRUCTION_COLOR} weight={2} opacity={0.85} />
      {showTriangle && (
        <>
          <Polyline points={[[x, y], [x + run, y], [x + run, y + rise]]} color={CONSTRUCTION_COLOR} weight={1.5} strokeStyle="dashed" fillOpacity={0} />
          <Text x={x + run / 2} y={y} attach={rise >= 0 ? 's' : 'n'} attachDistance={6} size={12} color={CONSTRUCTION_COLOR}>{formatValue(run, 2)}</Text>
          <Text x={x + run} y={y + rise / 2} attach="e" attachDistance={6} size={12} color={CONSTRUCTION_COLOR}>{formatValue(rise, 2)}</Text>
        </>
      )}
      {showDerivative && (
        <>
          <Line.Segment point1={[x, y]} point2={[x, slope]} color={derivativeColor} style="dashed" weight={1.5} opacity={0.7} />
          <Point x={x} y={slope} color={derivativeColor} />
          <Text x={x} y={slope} attach="ne" attachDistance={12} size={15} color={derivativeColor}>B</Text>
        </>
      )}
    </>
  );
}
