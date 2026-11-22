/**
 * « صفوف القسمة » — a counters set in rows of b. The student's hand holds the WALL: its place IS the divisor.
 * Full rows are teal, the counters left over are amber; when nothing is left the whole tray turns green.
 */
import { useRef, useState } from 'react';
import { VW, VH, useDrag, useChime, Tool, M } from '../kit';
import { rowsLayout } from '../logic';

const RIGHT = 910;
const LEFT = 150;
const TOP = 36;
const H = 312;
const MAXB = 24;
const CW = (RIGHT - LEFT) / MAXB;

export default function Rows({ a, b, setB, play, range }) {
  const svg = useRef(null);
  const [moved, setMoved] = useState(false);
  const last = useRef(b);
  last.current = b;
  const L = rowsLayout(a, b);
  const rh = Math.min(CW, H / L.rows);
  const rad = Math.min(CW, rh) * 0.4;
  const exact = L.r === 0;
  const wallX = RIGHT - b * CW - 7;
  const toB = (p) => {
    const nb = Math.max(range.b[0], Math.min(range.b[1], MAXB, Math.round((RIGHT - 7 - p.x) / CW)));
    if (nb !== last.current) {
      last.current = nb;
      setB(nb);
      play('tick', nb);
    }
  };
  useChime(play, 'fit', exact, [a, b]); // the wall sweeps: the full rows are HEARD
  const drag = useDrag(svg, {
    onStart: (p) => {
      setMoved(true);
      toB(p);
    },
    onMove: toB,
  });
  const key = (e) => {
    if (e.key === 'ArrowLeft') {
      setB(b + 1);
      setMoved(true);
      play('tick', b + 1);
    }
    if (e.key === 'ArrowRight') {
      setB(b - 1);
      setMoved(true);
      play('tick', b - 1);
    }
  };
  return (
    <Tool
      id="rows"
      tone={exact ? 'good' : 'warm'}
      reading={
        <>
          <M>{`${a} = ${b} \\times ${L.q} + ${L.r}`}</M>
          {exact ? (
            <span className="ll-chip ll-chip--good">
              الباقي 0: {b} قاسم للعدد {a}
            </span>
          ) : (
            <span className="ll-chip ll-chip--warm">
              يبقى {L.r}: {b} ليس قاسمًا للعدد {a}
            </span>
          )}
        </>
      }
    >
      <svg ref={svg} viewBox={`0 0 ${VW} ${VH}`} data-ll-rows data-q={L.q} data-r={L.r}>
        <rect
          x={LEFT - 12}
          y={TOP - 10}
          width={RIGHT - LEFT + 24}
          height={H + 20}
          rx="18"
          fill="rgba(125,252,255,.04)"
          stroke="rgba(125,252,255,.2)"
          strokeWidth="1.5"
        />
        <text
          x={RIGHT - (b * CW) / 2}
          y={TOP - 18}
          textAnchor="middle"
          fontSize="17"
          style={{ fill: '#7dfcff' }}
          direction="rtl"
        >
          {b} في كلّ صفّ
        </text>
        <g className={exact ? 'll-glow' : ''}>
          {L.cells.map((c) => (
            <circle
              key={c.i}
              className="ll-counter"
              r={rad}
              style={{ transform: `translate(${RIGHT - (c.col + 0.5) * CW}px, ${TOP + (c.row + 0.5) * rh}px)` }}
              fill={exact ? '#34d399' : c.rest ? '#fbbf24' : '#2dd4bf'}
            />
          ))}
        </g>
        {L.q > 0 && (
          <text
            x={wallX - 18}
            y={TOP + (L.q * rh) / 2 + 6}
            direction="rtl"
            textAnchor="start"
            fontSize="19"
            style={{ fill: exact ? '#6ee7b7' : '#5eead4' }}
          >
            {L.q} {L.q > 10 ? 'صفًّا' : L.q > 2 ? 'صفوف' : L.q === 2 ? 'صفّان' : 'صفّ'}
          </text>
        )}
        {L.r > 0 && (
          <text
            x={wallX - 18}
            y={TOP + (L.q + 0.5) * rh + 6}
            direction="rtl"
            textAnchor="start"
            fontSize="19"
            style={{ fill: '#fbbf24' }}
          >
            يبقى {L.r}
          </text>
        )}
        <g
          className="ll-handle"
          {...drag}
          tabIndex={0}
          onKeyDown={key}
          role="slider"
          aria-label="عدد الحبّات في كلّ صفّ"
          aria-valuenow={b}
          data-ll-wall
        >
          <rect x={wallX - 24} y={TOP - 16} width="48" height={H + 32} fill="transparent" />
          <rect x={wallX - 5} y={TOP - 16} width="10" height={H + 32} rx="5" fill="#7dfcff" />
          {!moved && <circle className="ll-pulse" cx={wallX} cy={TOP + H / 2} r="30" fill="#7dfcff" />}
          <circle cx={wallX} cy={TOP + H / 2} r="19" fill="#7dfcff" stroke="#06262c" strokeWidth="3" />
          <path
            d={`M ${wallX - 10} ${TOP + H / 2} l 6 -5 v 10 z M ${wallX + 10} ${TOP + H / 2} l -6 -5 v 10 z`}
            fill="#06262c"
          />
        </g>
        {!moved && (
          <text
            x={Math.max(120, wallX - 18)}
            y={TOP + H + 16}
            direction="rtl"
            textAnchor="start"
            fontSize="15"
            style={{ fill: '#7dfcff', opacity: 0.9 }}
          >
            اسحب الجدار ← →
          </text>
        )}
      </svg>
    </Tool>
  );
}
