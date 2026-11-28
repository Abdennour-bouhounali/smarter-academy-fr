/**
 * « Les sauts des multiples » — equal jumps of b from 0 on the number line; the flag stands on a.
 * The student's hand holds the FLAG (the number) and the FIRST LANDING (the length of a jump). The jumps land on the multiples
 * of b: on the flag exactly, or just before it — and what is missing can be read on the line.
 */
import { useEffect, useRef, useState } from 'react';
import { VW, VH, useDrag, useChime, Tool, M } from '../kit';
import { jumpsOf } from '../logic';
import { counted } from '../../gameworld/kit/authoring/numbers';

const X0 = 40;
const X1 = 900;
const Y = 262;
const spanOf = (a, b) => Math.max(24, Math.max(a, b) + b + 1);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export default function Jumps({ a, b, setA, setB, play, range }) {
  const svg = useRef(null);
  const dragging = useRef(false);
  const [moved, setMoved] = useState(false);
  const [span, setSpan] = useState(() => spanOf(a, b));
  const [at, setAt] = useState(null); // null: every jump is drawn
  const J = jumpsOf(a, b);
  useEffect(() => {
    if (!dragging.current) setSpan(spanOf(a, b));
    setAt(null);
  }, [a, b]);
  useEffect(() => {
    if (at === null) return undefined;
    if (at >= J.q) {
      const t = setTimeout(() => {
        play(J.hit ? 'fit' : 'short');
        setAt(null);
      }, 380);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      play('hop', at);
      setAt(at + 1);
    }, 300);
    return () => clearTimeout(t);
  }, [at]); // eslint-disable-line react-hooks/exhaustive-deps
  const x = (v) => X0 + (v / span) * (X1 - X0);
  const val = (px) => Math.round(((px - X0) / (X1 - X0)) * span);
  const start = () => {
    dragging.current = true;
    setMoved(true);
  };
  const end = () => {
    dragging.current = false;
    setSpan(spanOf(a, b));
  };
  const flag = useDrag(svg, {
    onStart: start,
    onEnd: end,
    onMove: (p) => {
      const v = clamp(val(p.x), range.a[0], Math.min(range.a[1], span - 1));
      if (v !== a) {
        setA(v);
        play('tick', v);
      }
    },
  });
  const knob = useDrag(svg, {
    onStart: start,
    onEnd: end,
    onMove: (p) => {
      const v = clamp(val(p.x), range.b[0], Math.min(range.b[1], span - 1));
      if (v !== b) {
        setB(v);
        play('tick', v);
      }
    },
  });
  useChime(play, 'fit', J.hit, [a, b]); // the flag or the jump moves: an exact landing is HEARD
  const shown = at ?? J.q;
  const still = at === null;
  const step = span <= 70 ? 1 : 5;
  const every = Math.max(1, Math.ceil(J.q / 12));
  const arc = (from, to) => {
    const xa = x(from);
    const xb = x(to);
    const h = Math.min(125, (xb - xa) * 0.85 + 16);
    return `M ${xa} ${Y} Q ${(xa + xb) / 2} ${Y - h * 2} ${xb} ${Y}`;
  };
  const fx = x(a);
  const hit = J.hit && still;
  const lastLand = J.q * b;
  return (
    <Tool
      id="jumps"
      tone={J.hit ? 'good' : 'warm'}
      actions={
        <button
          type="button"
          className="ll-btn"
          onClick={() => {
            setMoved(true);
            setAt(0);
          }}
          disabled={at !== null || J.q === 0}
          data-ll-run
        >
          ▶ Saute
        </button>
      }
      reading={
        <>
          <M>{`${a} = ${b} \\times ${J.q} + ${J.r}`}</M>
          {J.hit ? (
            <span className="ll-chip ll-chip--good">
              Pile en {counted(J.q, ['saut', 'sauts'])} : {a} est un multiple de {b}
            </span>
          ) : (
            <span className="ll-chip ll-chip--warm">
              Après {counted(J.q, ['saut', 'sauts'])}, il reste {J.r} : {a} n’est pas un multiple de {b}
            </span>
          )}
        </>
      }
    >
      <svg ref={svg} viewBox={`0 0 ${VW} ${VH}`} data-ll-jumps data-q={J.q} data-r={J.r}>
        <line
          x1={X0 - 14}
          y1={Y}
          x2={X1 + 20}
          y2={Y}
          stroke="rgb(var(--w-ink))"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path d={`M ${X1 + 20} ${Y} l -10 -6 v 12 z`} fill="rgb(var(--w-paper))" />
        {Array.from({ length: Math.floor(span / step) + 1 }, (_, i) => i * step).map((v) => (
          <line
            key={v}
            x1={x(v)}
            y1={Y - (v % 5 === 0 ? 7 : 4)}
            x2={x(v)}
            y2={Y + (v % 5 === 0 ? 7 : 4)}
            stroke="rgb(var(--w-ink) / 0.55)"
            strokeWidth={v % 5 === 0 ? 2 : 1}
          />
        ))}
        <text x={x(0)} y={Y + 30} textAnchor="middle" fontSize="18">
          0
        </text>
        {J.landings.slice(0, shown).map((v) => (
          <path
            key={`${v}-${still}`}
            d={arc(v - b, v)}
            className={`ll-arc ${still ? '' : 'll-arc--in'}`}
            pathLength="1"
            stroke={hit ? 'rgb(var(--w-green-ink))' : 'rgb(var(--w-cyan-ink))'}
          />
        ))}
        {J.landings.slice(0, shown).map(
          (v, i) =>
            ((i + 1) % every === 0 || i === J.q - 1) && (
              <text
                key={v}
                x={x(v)}
                y={Y + 30}
                textAnchor="middle"
                fontSize="17"
                style={{ fill: v === a ? 'rgb(var(--w-green-ink))' : 'rgb(var(--w-cyan-ink))' }}
              >
                {v}
              </text>
            ),
        )}
        {!J.hit && still && (
          <>
            <path
              d={arc(lastLand, J.over)}
              className="ll-arc"
              stroke="rgb(var(--w-gold-ink))"
              strokeDasharray="7 8"
              opacity=".75"
            />
            <path
              d={`M ${x(lastLand)} ${Y + 44} v 9 H ${fx} v -9`}
              fill="none"
              stroke="rgb(var(--w-gold-ink))"
              strokeWidth="3"
            />
            <text
              x={(x(lastLand) + fx) / 2}
              y={Y + 76}
              textAnchor="middle"
              fontSize="18"
              style={{ fill: 'rgb(var(--w-gold-ink))' }}
            >
              reste {J.r}
            </text>
          </>
        )}
        <g
          style={{
            transform: `translate(${x(shown * b)}px, ${Y}px)`,
            transition: 'transform .28s cubic-bezier(.3,1.5,.5,1)',
          }}
        >
          <rect
            x="-11"
            y="-30"
            width="22"
            height="26"
            rx="8"
            fill="rgb(var(--w-paper))"
            stroke="#06262c"
            strokeWidth="2.5"
          />
          <rect x="-7" y="-24" width="14" height="8" rx="4" fill="rgb(var(--w-ground))" />
          <circle cx="-3" cy="-20" r="1.8" fill="rgb(var(--w-cyan))" />
          <circle cx="3" cy="-20" r="1.8" fill="rgb(var(--w-cyan))" />
        </g>
        <g className="ll-handle" {...flag} data-ll-flag>
          <rect x={fx - 24} y={Y - 190} width="60" height="170" fill="transparent" />
          <line
            x1={fx}
            y1={Y}
            x2={fx}
            y2={Y - 172}
            stroke={hit ? 'rgb(var(--w-green-ink))' : 'rgb(var(--w-gold-ink))'}
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d={`M ${fx} ${Y - 172} l 40 13 l -40 13 z`}
            fill={hit ? 'rgb(var(--w-green))' : 'rgb(var(--w-gold))'}
            className={hit ? 'll-glow' : ''}
          />
          <text
            x={fx}
            y={Y - 182}
            textAnchor="middle"
            fontSize="26"
            style={{ fill: hit ? 'rgb(var(--w-green-ink))' : 'rgb(var(--w-gold-ink))' }}
          >
            {a}
          </text>
        </g>
        <g className="ll-handle" {...knob} data-ll-knob>
          {!moved && <circle className="ll-pulse" cx={x(b)} cy={Y} r="24" fill="rgb(var(--w-cyan))" />}
          <circle cx={x(b)} cy={Y} r="20" fill="transparent" />
          <circle cx={x(b)} cy={Y} r="11" fill="rgb(var(--w-cyan))" stroke="#06262c" strokeWidth="3" />
        </g>
        {!moved && (
          <text x={VW / 2} y="26" textAnchor="middle" fontSize="16" style={{ fill: 'rgb(var(--w-cyan-ink))' }}>
            Fais glisser le drapeau pour changer le nombre, et le point bleu pour changer la longueur du saut
          </text>
        )}
      </svg>
    </Tool>
  );
}
