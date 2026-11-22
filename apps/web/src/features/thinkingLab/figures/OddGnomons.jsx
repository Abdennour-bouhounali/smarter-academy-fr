import { FIG, ltrText } from './palette';

/**
 * #210 « مجموع الأعداد الفردية » — un carré 5 × 5 de cases, découpé en équerres : l'équerre k
 * (couche `g<k>`) est l'ensemble des cases (i, j) avec max(i, j) = k − 1 depuis le coin bas
 * gauche. Elle compte 2k − 1 cases (couche `counts`) ; les k premières forment un carré k × k.
 */
export const LAYERS = ['grid', 'g1', 'g2', 'g3', 'g4', 'g5', 'counts'];
export const BASE_LAYERS = ['grid', 'g1', 'g2', 'g3'];

const N = 5;
const C = 48; // côté d'une case en px
const M = 30; // marge
const FILLS = [FIG.soughtFill, FIG.observeFill, FIG.buildFill, FIG.soughtFill, FIG.observeFill];
const STROKES = [FIG.sought, FIG.observe, FIG.build, FIG.sought, FIG.observe];

/** Coin haut gauche (SVG) de la case (i, j) : colonne i, ligne j comptée depuis le bas. */
const cell = (i, j) => [M + i * C, M + (N - 1 - j) * C];

export default function OddGnomons({ layers = BASE_LAYERS, ariaLabel }) {
  const on = new Set(layers);
  const cells = [];
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) cells.push([i, j, Math.max(i, j) + 1]);
  return (
    <svg viewBox="0 0 300 300" role="img" aria-label={ariaLabel} className="h-auto w-full max-w-[380px]" data-figure="OddGnomons">
      <rect x="0" y="0" width="300" height="300" fill={FIG.paper} />
      {cells.filter(([, , k]) => on.has(`g${k}`)).map(([i, j, k]) => {
        const [x, y] = cell(i, j);
        return <rect key={`${i}-${j}`} x={x + 3} y={y + 3} width={C - 6} height={C - 6} rx="6" fill={FILLS[k - 1]} stroke={STROKES[k - 1]} strokeWidth="1.8" />;
      })}
      {on.has('grid') && cells.map(([i, j]) => {
        const [x, y] = cell(i, j);
        return <rect key={`g${i}-${j}`} x={x} y={y} width={C} height={C} fill="none" stroke={FIG.muted} strokeWidth="1" />;
      })}
      {on.has('counts') && Array.from({ length: N }, (_, idx) => idx + 1).filter((k) => on.has(`g${k}`)).map((k) => {
        const [x, y] = cell(k - 1, k - 1);
        return (
          <text key={k} x={x + C / 2} y={y + C / 2} fill={STROKES[k - 1]} fontSize="18" fontWeight="700" textAnchor="middle" dominantBaseline="middle" style={ltrText}>
            {2 * k - 1}
          </text>
        );
      })}
    </svg>
  );
}
