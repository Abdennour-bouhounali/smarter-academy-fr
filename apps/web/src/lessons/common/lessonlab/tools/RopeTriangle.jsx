/**
 * « La corde et le triangle » — a triangle of the student's own: its two sides from A are knotted ropes, AB = a and AC = b whole
 * metres, a knot every metre. His hand ties the two ends of a cut [MN] on a knot of each rope (a handle on each rope,
 * arrows, « − / + »). The two ropes are drawn at ONE common length, one above the other, from A on the left: a knot
 * stands where it stands along its rope, so M and N stand on one vertical line exactly when m × b = n × a
 * (`logic.js › ropeOf`, integers). Beside them the triangle itself, drawn by the shared `GeoFigure` from the world's
 * figure spec (`nilePyramids/figure.js`): the cut where the knots put it, its chevrons — and the gold line between the two
 * knots — only when (MN) ∥ (BC). Facts only (LESSON_LAB.md §2): no ratio is written, no key of the lesson is named, nothing
 * moves on its own; it reports only after the hand moved a knot.
 * `start` ({ m, n, moved, found }) is the state on opening — the render test draws it with it.
 */
import { useEffect, useRef, useState } from 'react';
import GeoFigure from '../../components/GeoFigure';
import { figureSpec } from '../../gameworld/nilePyramids/figure';
import { sheetFigure } from '../../gameworld/kit/sheetFigure';
import { useDrag, useChime, svgPoint, Tool, M } from '../kit';
import { ropeOf } from '../logic';

/** The drawing's own frame (it shares the stage with the triangle's card). */
const ROPE_VW = 560;
const ROPE_VH = 370;
const R0 = 70;
const R1 = 500;
const Y = { m: 120, n: 260 };
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
/** A point of the pointer in THIS drawing's viewBox (560 × 370), never the kit's default 940 × 370 (defects D38). */
export const ropePoint = (svg, e) => svgPoint(svg, e, ROPE_VW, ROPE_VH);

/** The GeoFigure spec of the triangle: A, B, C, the cut [MN]; the lengths of the four pieces; chevrons when parallel. */
export function ropeFigure(a, b, m, n, aligned) {
  return figureSpec(
    {
      kind: 'nested',
      names: { V: 'A', M: 'M', B: 'B', N: 'N', C: 'C' },
      len: { VM: String(m), VB: String(a), VN: String(n), VC: String(b), MB: String(a - m), NC: String(b - n) },
    },
    { show: ['VM', 'MB', 'VN', 'NC'], parallel: aligned, extra: { maxWidth: 300 } },
  );
}

export default function RopeTriangle({ a, b, play, report, start = null }) {
  const key = `${a}:${b}`;
  const svg = useRef(null);
  const first = { m: Math.max(1, Math.floor(a / 3)), n: Math.max(1, b - 1) };
  const [st, setSt] = useState({ key, m: start?.m ?? first.m, n: start?.n ?? first.n, found: start?.found ?? [] });
  const [moved, setMoved] = useState(Boolean(start?.moved));
  // a new triangle starts a new sheet: the knots come back inside its ropes, the cuts found belong to the one they were made on
  const cur = st.key === key ? st : { key, m: first.m, n: first.n, found: [] };
  const m = clamp(cur.m, 1, a - 1);
  const n = clamp(cur.n, 1, b - 1);
  const R = ropeOf(a, b, m, n);
  const fig = ropeFigure(a, b, m, n, R.aligned);

  useEffect(() => {
    if (moved) report({ key, m, n, moved, found: cur.found });
  }, [moved, key, m, n, cur.found.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps
  useChime(play, R.aligned ? 'fit' : 'short', moved, [m, n, key], { delay: 120 });

  const tie = (which, v) => {
    const next = which === 'm' ? { m: clamp(v, 1, a - 1), n } : { m, n: clamp(v, 1, b - 1) };
    setMoved(true);
    if (next[which] !== (which === 'm' ? m : n)) play('tick', next[which]);
    const hit = ropeOf(a, b, next.m, next.n).aligned;
    const found = hit && !cur.found.includes(next.m) ? [...cur.found, next.m].slice(-12) : cur.found;
    setSt({ key, ...next, found });
  };
  const L = R1 - R0;
  const xOf = (v, len) => R0 + (v / len) * L;
  const vOf = (x, len) => Math.round(((x - R0) / L) * len);
  const dragM = useDrag(svg, {
    onStart: (p) => tie('m', vOf(p.x, a)),
    onMove: (p) => tie('m', vOf(p.x, a)),
    point: ropePoint,
  });
  const dragN = useDrag(svg, {
    onStart: (p) => tie('n', vOf(p.x, b)),
    onMove: (p) => tie('n', vOf(p.x, b)),
    point: ropePoint,
  });
  const keys = (which, v) => (e) => {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    tie(which, v + step);
  };

  const rope = (which, len, v, drag) => {
    const y = Y[which];
    const x = xOf(v, len);
    const [start, end] = which === 'm' ? ['A', 'B'] : ['A', 'C'];
    return (
      <g data-ll-rope-line-of={which}>
        <text x={R0 - 30} y={y + 7} textAnchor="middle" fontSize="22" fontWeight="900" style={{ fill: '#eafcff' }}>
          {start}
        </text>
        <text x={R1 + 30} y={y + 7} textAnchor="middle" fontSize="22" fontWeight="900" style={{ fill: '#eafcff' }}>
          {end}
        </text>
        {/* the rope: the piece from A to the knot held, then the rest */}
        <line x1={R0} y1={y} x2={x} y2={y} stroke="#7dfcff" strokeWidth="6" strokeLinecap="round" />
        <line x1={x} y1={y} x2={R1} y2={y} stroke="rgba(234,252,255,.4)" strokeWidth="4" strokeLinecap="round" />
        {Array.from({ length: len + 1 }, (_, i) => (
          <circle key={i} cx={xOf(i, len)} cy={y} r={len > 20 ? 3 : 4.5} fill="#fde68a" data-ll-rope-knot={which} />
        ))}
        {/* the rope's length, under its end — the knot held is written under the knot */}
        <text
          x={R1 + 30}
          y={y + 36}
          textAnchor="middle"
          fontSize="18"
          style={{ fill: '#a5f3fc' }}
          data-ll-rope-len={len}
        >
          {`${len} m`}
        </text>
        <g
          className="ll-handle"
          {...drag}
          tabIndex={0}
          role="slider"
          aria-label={which === 'm' ? 'Le nœud M' : 'Le nœud N'}
          aria-valuenow={v}
          aria-valuemin={1}
          aria-valuemax={len - 1}
          onKeyDown={keys(which, v)}
          data-ll-rope-handle={which}
        >
          <rect x={R0 - 12} y={y - 26} width={L + 24} height="52" fill="transparent" />
          {!moved && which === 'm' && <circle className="ll-pulse" cx={x} cy={y} r="22" fill="#fbbf24" />}
          <circle cx={x} cy={y} r="13" fill="#fde68a" stroke="#06262c" strokeWidth="3" />
        </g>
        <text x={x} y={y - 24} textAnchor="middle" fontSize="20" fontWeight="900" style={{ fill: '#fde68a' }}>
          {which === 'm' ? 'M' : 'N'}
        </text>
        <text x={x} y={y + 36} textAnchor="middle" fontSize="18" fontWeight="800" style={{ fill: '#fde68a' }}>
          {v}
        </text>
      </g>
    );
  };

  return (
    <Tool
      id="rope"
      tone={R.aligned && moved ? 'good' : 'plain'}
      actions={
        <>
          <button type="button" className="ll-btn ll-btn--ghost" onClick={() => tie('m', m - 1)} data-ll-rope-m-minus>
            M −
          </button>
          <button type="button" className="ll-btn ll-btn--ghost" onClick={() => tie('m', m + 1)} data-ll-rope-m-plus>
            M +
          </button>
          <button type="button" className="ll-btn ll-btn--ghost" onClick={() => tie('n', n - 1)} data-ll-rope-n-minus>
            N −
          </button>
          <button type="button" className="ll-btn ll-btn--ghost" onClick={() => tie('n', n + 1)} data-ll-rope-n-plus>
            N +
          </button>
        </>
      }
      reading={
        <>
          {/* four lengths, the verdict and four buttons share one row: a thin space between the lengths (the walk) */}
          <M>{`\\small AM = ${m} \\;\\; MB = ${R.mb} \\;\\; AN = ${n} \\;\\; NC = ${R.nc}`}</M>
          <span
            className={`ll-chip ${R.aligned ? 'll-chip--good' : 'll-chip--dim'}`}
            data-ll-rope-verdict={R.aligned ? 'parallel' : 'crossing'}
          >
            <M>{R.aligned ? '(MN) \\parallel (BC)' : '(MN) \\nparallel (BC)'}</M>
          </span>
        </>
      }
    >
      {/* the card's column: never narrower than the width at which the figure's smallest label reads 12 px (sheetFigure ›
          k), plus its padding and border — a flat triangle of 30 and 5 drew its lengths at 11.2 px (the hub walk) */}
      <div
        className="ll-rope"
        style={{ '--ll-rope-fig': `calc(${sheetFigure(fig)?.k ?? 0} * var(--di-min-font, 12px) + 1.2rem + 4px)` }}
      >
        <svg
          ref={svg}
          viewBox={`0 0 ${ROPE_VW} ${ROPE_VH}`}
          data-ll-rope={key}
          data-m={m}
          data-n={n}
          data-aligned={R.aligned ? 'yes' : 'no'}
        >
          {rope('m', a, m, dragM)}
          {rope('n', b, n, dragN)}
          {/* the gold line: the two knots on one vertical line — drawn only when they are */}
          {R.aligned && (
            <line
              x1={xOf(m, a)}
              y1={Y.m + 16}
              x2={xOf(n, b)}
              y2={Y.n - 16}
              stroke="#fbbf24"
              strokeWidth="3"
              strokeDasharray="7 5"
              data-ll-rope-aligned
            />
          )}
          <title>{`AM = ${m} · AN = ${n}`}</title>
        </svg>
        <div className="ll-rope__card" data-ll-rope-figure={R.aligned ? 'parallel' : 'crossing'}>
          {/* the figure stays inside its card, whatever the ropes drawn (30 and 5 made it wider than the card) */}
          <GeoFigure {...fig} maxWidth="100%" />
        </div>
      </div>
    </Tool>
  );
}
