import { FIG, ltrText } from './palette';

/**
 * #490 « لوح الحلوى » — un lav de `rows` × `cols` carrés, puis deux cassures montrées
 * pièce par pièce (une cassure prend UNE pièce et en rend deux).
 *
 * Les pièces sont calculées, jamais posées à l'œil :
 *   cut1 : le lav coupé le long de la rainure verticale après la colonne ⌊cols/2⌋ ;
 *   cut2 : la pièce de droite coupée le long de la rainure horizontale après la ligne ⌊rows/2⌋.
 * Chaque pièce détachée est décalée de GAP pour qu'on la voie séparée.
 */
export const LAYERS = ['bar', 'cut1', 'cut2', 'count'];
export const BASE_LAYERS = ['bar'];

const W = 360;
const H = 300;
const GAP = 12;
const MAX_W = 280;
const MAX_H = 200;

const clampInt = (v, lo, hi, fallback) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : fallback;
};

/** Les pièces visibles : [{col, row, cols, rows, dx, dy}] en carrés, décalages en px. */
export function piecesFor(rows, cols, on) {
  if (!on.has('cut1')) return [{ col: 0, row: 0, cols, rows, dx: 0, dy: 0 }];
  const a = Math.floor(cols / 2);
  const left = { col: 0, row: 0, cols: a, rows, dx: 0, dy: 0 };
  if (!on.has('cut2')) return [left, { col: a, row: 0, cols: cols - a, rows, dx: GAP, dy: 0 }];
  const b = Math.floor(rows / 2);
  return [
    left,
    { col: a, row: 0, cols: cols - a, rows: b, dx: GAP, dy: 0 },
    { col: a, row: b, cols: cols - a, rows: rows - b, dx: GAP, dy: GAP },
  ];
}

export default function ChocolateBar({ layers = BASE_LAYERS, props = {}, ariaLabel }) {
  const on = new Set(layers);
  const rows = clampInt(props.rows, 1, 12, 6);
  const cols = clampInt(props.cols, 1, 14, 8);
  const cell = Math.floor(Math.min(MAX_W / cols, MAX_H / rows));
  const barW = cell * cols;
  const barH = cell * rows;
  const x0 = (W - barW - GAP) / 2;
  const y0 = 56 + (MAX_H - barH) / 2;
  const pieces = piecesFor(rows, cols, on);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel} className="h-auto w-full max-w-[440px]" data-figure="ChocolateBar">
      <rect x="0" y="0" width={W} height={H} fill={FIG.paper} />
      <text x={W / 2} y="30" fill={FIG.label} fontSize="17" fontWeight="700" textAnchor="middle" style={ltrText}>
        {`${rows} × ${cols}`}
      </text>
      {on.has('bar') &&
        pieces.map((p, i) => {
          const px = x0 + p.col * cell + p.dx;
          const py = y0 + p.row * cell + p.dy;
          const w = p.cols * cell;
          const h = p.rows * cell;
          return (
            <g key={`${p.col}-${p.row}`}>
              <rect x={px} y={py} width={w} height={h} rx="5" fill={FIG.observeFill} stroke={FIG.observe} strokeWidth="2.2" />
              <g stroke={FIG.muted} strokeWidth="1">
                {Array.from({ length: p.cols - 1 }, (_, k) => (
                  <line key={`v${k}`} x1={px + (k + 1) * cell} y1={py + 3} x2={px + (k + 1) * cell} y2={py + h - 3} />
                ))}
                {Array.from({ length: p.rows - 1 }, (_, k) => (
                  <line key={`h${k}`} x1={px + 3} y1={py + (k + 1) * cell} x2={px + w - 3} y2={py + (k + 1) * cell} />
                ))}
              </g>
              {on.has('count') && (
                <g>
                  <circle cx={px + w / 2} cy={py + h / 2} r="14" fill={FIG.paper} stroke={FIG.build} strokeWidth="2" />
                  <text x={px + w / 2} y={py + h / 2 + 1} fill={FIG.build} fontSize="15" fontWeight="700" textAnchor="middle" dominantBaseline="middle" style={ltrText}>
                    {i + 1}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      {on.has('count') && (
        <g fill={FIG.build} fontSize="15" fontWeight="700" textAnchor="middle">
          <text x={W / 2 + 70} y={H - 14} direction="rtl">{`القطع: ${pieces.length}`}</text>
          <text x={W / 2 - 70} y={H - 14} direction="rtl">{`الكسرات: ${pieces.length - 1}`}</text>
        </g>
      )}
    </svg>
  );
}
