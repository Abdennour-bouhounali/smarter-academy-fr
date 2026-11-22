import { useId } from 'react';
import { bundleLayout, cubeDepth } from './pieceLayout';

/**
 * Les PIÈCES de bois de la طاولة النادي, dessinées en code (jamais une image) et à l'échelle `u` :
 * réglette x (debout), plaque x² (pile décalée), cube 1 (avec dessus et flanc). La finition « opposée » (coefficient négatif) :
 * les mêmes pièces en rouge, hachurées, marquées « − ». Une pile de réglettes est liée par une ficelle (« حزمة »).
 * `c` : le coefficient (son signe choisit la finition, |c| le nombre de pièces) ; `p` ; `x` ; `u`.
 */
export const WOOD = { light: '#F6D9A6', mid: '#E9B872', dark: '#C98B4A', edge: '#9A6131', grain: '#B57A3D' };
export const OPP = { light: '#FDA4AF', mid: '#F43F5E', dark: '#BE123C', edge: '#881337' };

function Defs({ id }) {
  return (
    <defs>
      <linearGradient id={`${id}-w`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={WOOD.light} />
        <stop offset="0.55" stopColor={WOOD.mid} />
        <stop offset="1" stopColor={WOOD.dark} />
      </linearGradient>
      <linearGradient id={`${id}-o`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={OPP.light} />
        <stop offset="0.5" stopColor={OPP.mid} />
        <stop offset="1" stopColor={OPP.dark} />
      </linearGradient>
      <pattern id={`${id}-h`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="2" height="6" fill="#fff" opacity="0.32" />
      </pattern>
    </defs>
  );
}

function Rod({ q, neg, id, u }) {
  const r = Math.max(1.5, u * 0.22);
  return (
    <g>
      <rect x={q.x + 1} y={q.y + 1.5} width={q.w} height={q.h} rx={r} fill="#000" opacity="0.14" />
      <rect x={q.x} y={q.y} width={q.w} height={q.h} rx={r} fill={`url(#${id}-${neg ? 'o' : 'w'})`} stroke={neg ? OPP.edge : WOOD.edge} strokeWidth="1" />
      {neg
        ? <rect x={q.x} y={q.y} width={q.w} height={q.h} rx={r} fill={`url(#${id}-h)`} />
        : (
          <g stroke={WOOD.grain} strokeWidth="0.8" opacity="0.55" fill="none">
            <path d={`M${q.x + q.w * 0.34} ${q.y + 3} q ${q.w * 0.12} ${q.h * 0.3} 0 ${q.h * 0.55}`} />
            <path d={`M${q.x + q.w * 0.68} ${q.y + q.h * 0.35} l 0 ${q.h * 0.55}`} />
          </g>
        )}
      <rect x={q.x + 1.5} y={q.y + 1.5} width={Math.max(1, q.w * 0.18)} height={q.h - 3} rx="1" fill="#fff" opacity="0.35" />
      {neg && <rect x={q.x + q.w * 0.22} y={q.y + Math.min(q.h * 0.18, 8)} width={q.w * 0.56} height={Math.max(1.6, u * 0.16)} rx="0.8" fill="#fff" />}
    </g>
  );
}

function Plate({ q, neg, id, u, top }) {
  const r = Math.max(2, u * 0.25);
  const t = Math.max(2, u * 0.18); // l'épaisseur
  return (
    <g>
      <rect x={q.x + t} y={q.y + t} width={q.w} height={q.h} rx={r} fill={neg ? OPP.edge : WOOD.edge} opacity="0.9" />
      <rect x={q.x} y={q.y} width={q.w} height={q.h} rx={r} fill={`url(#${id}-${neg ? 'o' : 'w'})`} stroke={neg ? OPP.edge : WOOD.edge} strokeWidth="1" />
      {neg && <rect x={q.x} y={q.y} width={q.w} height={q.h} rx={r} fill={`url(#${id}-h)`} />}
      {top && !neg && (
        <g stroke={WOOD.grain} strokeWidth="0.9" opacity="0.5" fill="none">
          <path d={`M${q.x + 4} ${q.y + q.h * 0.3} q ${q.w * 0.4} ${-q.h * 0.08} ${q.w - 8} ${q.h * 0.04}`} />
          <path d={`M${q.x + 4} ${q.y + q.h * 0.62} q ${q.w * 0.35} ${q.h * 0.07} ${q.w - 8} ${-q.h * 0.02}`} />
        </g>
      )}
      <rect x={q.x + 2} y={q.y + 2} width={q.w - 4} height={Math.max(1.2, u * 0.16)} rx="1" fill="#fff" opacity="0.38" />
      {neg && top && <rect x={q.x + q.w * 0.3} y={q.y + q.h / 2 - Math.max(1.2, u * 0.12)} width={q.w * 0.4} height={Math.max(2.4, u * 0.24)} rx="1.2" fill="#fff" />}
    </g>
  );
}

function Cube({ q, neg, id, u }) {
  const d = cubeDepth(u);
  const P = neg ? OPP : WOOD;
  return (
    <g>
      <path d={`M${q.x} ${q.y} l ${d} ${-d} h ${q.w} l ${-d} ${d} Z`} fill={P.light} stroke={P.edge} strokeWidth="0.8" />
      <path d={`M${q.x + q.w} ${q.y} l ${d} ${-d} v ${q.h} l ${-d} ${d} Z`} fill={P.dark} stroke={P.edge} strokeWidth="0.8" />
      <rect x={q.x} y={q.y} width={q.w} height={q.h} rx="1" fill={`url(#${id}-${neg ? 'o' : 'w'})`} stroke={P.edge} strokeWidth="0.8" />
      {neg && <rect x={q.x} y={q.y} width={q.w} height={q.h} rx="1" fill={`url(#${id}-h)`} />}
      {neg && <rect x={q.x + q.w * 0.22} y={q.y + q.h / 2 - Math.max(0.9, u * 0.08)} width={q.w * 0.56} height={Math.max(1.8, u * 0.16)} rx="0.8" fill="#fff" />}
    </g>
  );
}

/** Une pile dessinée : `c` pièces (finition opposée si c < 0) de forme `p`. `pad` laisse la place à l'ombre. */
export default function PieceArt({ c, p, x, u, pad = 3, tie = true, className = '', ...rest }) {
  const raw = useId();
  const id = `lt${raw.replace(/[^a-zA-Z0-9]/g, '')}`;
  const n = Math.abs(c);
  const neg = c < 0;
  const L = bundleLayout({ n, p, x, u });
  if (!n) return null;
  const W = L.w + pad * 2 + (p === 2 ? Math.max(2, u * 0.18) : 0);
  const H = L.h + pad * 2 + (p === 2 ? Math.max(2, u * 0.18) : 0);
  const shift = (q) => ({ ...q, x: q.x + pad, y: q.y + pad });
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className={`block overflow-visible ${className}`} aria-hidden="true" {...rest}>
      <Defs id={id} />
      <ellipse cx={W / 2} cy={H - pad + 1} rx={W / 2 - 1} ry={Math.max(2, u * 0.25)} fill="#422006" opacity="0.12" />
      {L.pieces.map((q0, i) => {
        const q = shift(q0);
        if (p === 1) return <Rod key={i} q={q} neg={neg} id={id} u={u} />;
        if (p === 2) return <Plate key={i} q={q} neg={neg} id={id} u={u} top={i === n - 1} />;
        return <Cube key={i} q={q} neg={neg} id={id} u={u} />;
      })}
      {p === 1 && tie && n >= 2 && (
        <g>
          <rect x={pad - 1.5} y={pad + L.h * 0.56} width={L.w + 3} height={Math.max(2.5, u * 0.26)} rx="1.2" fill="#7C2D12" />
          <circle cx={pad + L.w / 2} cy={pad + L.h * 0.56 + Math.max(1.25, u * 0.13)} r={Math.max(2.4, u * 0.24)} fill="#9A3412" stroke="#7C2D12" strokeWidth="0.8" />
        </g>
      )}
    </svg>
  );
}

/** La silhouette en pointillés d'une forme (l'étiquette d'une صينية) : une plaque, une réglette, un cube — à x. */
export function ShapeSilhouette({ p, x, u, scale = 0.5, ...rest }) {
  const s = Math.max(4, u * scale);
  const w = p === 0 ? s : p === 1 ? s : x * s;
  const h = p === 0 ? s : x * s;
  return (
    <svg width={w + 4} height={h + 4} viewBox={`0 0 ${w + 4} ${h + 4}`} aria-hidden="true" {...rest}>
      <rect x="2" y="2" width={w} height={h} rx={Math.max(1, s * 0.2)} fill="#FFF7E8" stroke="#9A6131" strokeWidth="1.4" strokeDasharray="3 2" />
    </svg>
  );
}
