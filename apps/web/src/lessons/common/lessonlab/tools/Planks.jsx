/**
 * « La planche commune » — one plank of length d, laid end to end along six lengths: the two numbers, their sum, their
 * difference, the remainder of the greater by the smaller, three times the first. The student's hand holds the END OF THE
 * PLANK (its length). A length the planks fill exactly turns green; what is left over is amber. Nothing here states a
 * property: the student sees which lengths a plank fills when it fills the two first ones — and when it does not.
 */
import { useEffect, useRef, useState } from 'react';
import { VW, VH, useDrag, useChime, Tool } from '../kit';
import { plankRows } from '../logic';
import { counted } from '../../gameworld/kit/authoring/numbers';

const X0 = 236;
const X1 = 908;
const Y0 = 34;
const PITCH = 48;
const BAR = 24;
const MAXD = 60;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export default function Planks({ a, b, play, report }) {
  const svg = useRef(null);
  const [d, setD] = useState(4);
  const [moved, setMoved] = useState(false);
  const last = useRef(d);
  const rows = plankRows(a, b, d);
  const span = Math.max(a + b, 3 * a, 2);
  const u = (X1 - X0) / span;
  const top = Math.max(1, Math.min(MAXD, span));
  const shown = Math.min(d, top);
  last.current = shown;
  const both = rows[0].fits && rows[1].fits;
  const filled = rows.filter((r) => r.fits).length;
  // what the student made is reported only once he has moved the plank (a quest is never ticked by the opening state)
  useEffect(() => {
    if (moved) report({ key: `${a}:${b}`, d: shown });
  }, [moved, a, b, shown]); // eslint-disable-line react-hooks/exhaustive-deps
  const toD = (p) => {
    const nd = clamp(Math.round((p.x - X0) / u), 1, top);
    if (nd !== last.current) {
      last.current = nd;
      setD(nd);
      play('tick', nd);
    }
  };
  const drag = useDrag(svg, {
    onStart: (p) => {
      setMoved(true);
      toD(p);
    },
    onMove: toD,
  });
  const key = (e) => {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    const nd = clamp(shown + step, 1, top);
    setMoved(true);
    setD(nd);
    play('tick', nd);
  };
  useChime(play, 'fit', both && shown > 1, [shown, a, b]); // every length filled is HEARD
  useChime(play, 'short', !both && rows[2].fits && shown > 1, [shown, a, b]);
  const y = (i) => Y0 + (i + 1) * PITCH;
  return (
    <Tool
      id="planks"
      tone={both && shown > 1 ? 'good' : 'plain'}
      reading={
        <>
          <span className="ll-chip">La planche {shown}</span>
          <span
            className={`ll-chip ${filled === rows.length ? 'll-chip--good' : 'll-chip--dim'}`}
            data-ll-filled={filled}
          >
            Remplit {counted(filled, ['longueur', 'longueurs'])} sur {rows.length}
          </span>
          {both && shown > 1 && (
            <span className="ll-chip ll-chip--good" data-ll-both>
              {shown} est un diviseur de {a} et de {b}
            </span>
          )}
        </>
      }
    >
      <svg
        ref={svg}
        viewBox={`0 0 ${VW} ${VH}`}
        data-ll-planks
        data-d={shown}
        data-fits={rows.map((r) => (r.fits ? 1 : 0)).join('')}
      >
        {/* the plank the hand holds */}
        <text
          x={(X0 - 14) / 2 + 30}
          y={Y0 + 7}
          textAnchor="middle"
          fontSize="18"
          style={{ fill: 'rgb(var(--w-gold-ink))' }}
        >
          La planche {shown}
        </text>
        <rect
          x={X0}
          y={Y0 - BAR / 2}
          width={shown * u}
          height={BAR}
          rx="5"
          fill="rgb(var(--w-gold))"
          stroke="#06262c"
          strokeWidth="2"
        />
        <g className="ll-handle" {...drag} tabIndex={0} onKeyDown={key} data-ll-plank>
          <rect x={X0} y={Y0 - 22} width={X1 - X0} height="44" fill="transparent" />
          {!moved && <circle className="ll-pulse" cx={X0 + shown * u} cy={Y0} r="22" fill="rgb(var(--w-gold))" />}
          <circle cx={X0 + shown * u} cy={Y0} r="12" fill="rgb(var(--w-gold))" stroke="#06262c" strokeWidth="3" />
        </g>
        {rows.map((r, i) => {
          const w = Math.max(1, shown * u);
          const gap = Math.min(2, w * 0.25);
          return (
            <g key={r.id} data-ll-row={r.id} data-fits={r.fits ? 1 : 0}>
              <text
                x="46"
                y={y(i) + 7}
                textAnchor="middle"
                fontSize="16"
                style={{ fill: r.fits ? 'rgb(var(--w-green-ink))' : 'rgb(var(--w-gold-ink))' }}
              >
                {r.fits ? '✓' : `reste ${r.left}`}
              </text>
              <text x={X0 - 14} y={y(i) + 7} textAnchor="end" fontSize="17" style={{ fill: 'rgb(var(--w-ink))' }}>
                {r.label}
              </text>
              <rect
                x={X0}
                y={y(i) - BAR / 2}
                width={Math.max(2, r.n * u)}
                height={BAR}
                rx="5"
                fill="rgb(var(--w-ink) / 0.08)"
                stroke="rgb(var(--w-ink) / 0.45)"
                strokeWidth="1.5"
              />
              {Array.from({ length: r.planks }, (_, k) => (
                <rect
                  key={k}
                  x={X0 + k * w + gap / 2}
                  y={y(i) - BAR / 2 + 3}
                  width={w - gap}
                  height={BAR - 6}
                  rx="3"
                  fill={r.fits ? 'rgb(var(--w-green))' : 'rgb(var(--w-cyan))'}
                />
              ))}
              {r.left > 0 && (
                <rect
                  x={X0 + r.planks * w}
                  y={y(i) - BAR / 2 + 3}
                  width={r.left * u}
                  height={BAR - 6}
                  rx="3"
                  fill="none"
                  stroke="rgb(var(--w-gold-ink))"
                  strokeWidth="2"
                  strokeDasharray="5 4"
                />
              )}
            </g>
          );
        })}
      </svg>
    </Tool>
  );
}
