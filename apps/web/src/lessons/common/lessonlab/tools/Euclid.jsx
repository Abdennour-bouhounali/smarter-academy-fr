/**
 * « Les carrés d’Euclide » — a rectangle a × b. The student cuts the biggest square that fits, again and again; each family of
 * squares is one Euclidean division, written as it is cut. The side of the LAST square measures both sides: the PGCD.
 * The student's hand holds the CORNER of the rectangle.
 */
import { useEffect, useRef, useState } from 'react';
import { VW, VH, useDrag, useChime, Tool, M } from '../kit';
import { euclidSquares, euclidLines } from '../logic';

const OX = 48;
const OY = 14;
const W = 640;
const H = 318;
const LX = 925; // the divisions are written in a column on the right, after the rectangle (read left to right)
const COLORS = ['#2dd4bf', '#fbbf24', '#a78bfa', '#f472b6', '#60a5fa', '#fb923c', '#a3e635'];

export default function Euclid({ a, b, setA, setB, play, report, range }) {
  const svg = useRef(null);
  const [cut, setCut] = useState(0);
  const frozen = useRef(null);
  const [, redraw] = useState(0);
  const [moved, setMoved] = useState(false);
  const E = euclidSquares(a, b);
  const lines = euclidLines(a, b);
  const u = frozen.current ?? Math.min(W / a, H / b, 46);
  useEffect(() => {
    setCut(0);
  }, [a, b]);
  useEffect(() => {
    report({ key: `${a}:${b}`, cut });
  }, [cut, a, b]); // eslint-disable-line react-hooks/exhaustive-deps
  const corner = useDrag(svg, {
    onStart: () => {
      frozen.current = u;
      setMoved(true);
    },
    onMove: (p) => {
      const k = frozen.current;
      const na = Math.max(range.a[0], Math.min(range.a[1], Math.floor(W / k), Math.round((p.x - OX) / k)));
      const nb = Math.max(range.b[0], Math.min(range.b[1], Math.floor(H / k), Math.round((p.y - OY) / k)));
      if (na !== a) setA(na);
      if (nb !== b) setB(nb);
      if (na !== a || nb !== b) play('tick', na + nb);
    },
    onEnd: () => {
      frozen.current = null;
      redraw((n) => n + 1);
    },
  });
  const done = cut >= E.squares.length;
  const stepsDone = done ? E.steps : (E.squares[cut]?.step ?? 0);
  const snip = () => {
    const sq = E.squares[cut];
    const next = E.squares[cut + 1];
    setCut((c) => Math.min(E.squares.length, c + 1));
    play('snip', sq?.side);
    setMoved(true);
    if (sq && next && next.step !== sq.step) setTimeout(() => play('pencil'), 200); // a family of squares is finished: its division is written
  };
  useChime(play, 'crown', done, [done, a, b], { delay: 320 });
  const cx = OX + a * u;
  const cy = OY + b * u;
  return (
    <Tool
      id="euclid"
      tone={done ? 'good' : 'plain'}
      actions={
        <>
          <button type="button" className="ll-btn" onClick={snip} disabled={done} data-ll-cut>
            ✂️ Coupe le plus grand carré
          </button>
          <button
            type="button"
            className="ll-btn ll-btn--ghost"
            onClick={() => {
              setCut(0);
              play('undo');
            }}
            disabled={cut === 0}
            data-ll-uncut
          >
            ↺
          </button>
        </>
      }
      reading={
        <>
          {cut === 0 && (
            <span className="ll-chip ll-chip--dim">
              Rectangle {a} × {b} : coupes-y le plus grand carré possible, puis recommence.
            </span>
          )}
          {cut > 0 && !done && (
            <span className="ll-chip ll-chip--dim">
              Chaque groupe de carrés est une division euclidienne : elle s’écrit à droite.
            </span>
          )}
          {done && (
            <>
              <M>{`\\mathrm{PGCD}(${a}\\,;\\,${b}) = ${E.pgcd}`}</M>
              <span className="ll-chip ll-chip--good" data-ll-pgcd={E.pgcd}>
                Le dernier carré a pour côté {E.pgcd} : il mesure les deux côtés à la fois
              </span>
            </>
          )}
        </>
      }
    >
      <svg ref={svg} viewBox={`0 0 ${VW} ${VH}`} data-ll-euclid data-cut={cut} data-squares={E.squares.length}>
        <defs>
          <pattern id="ll-unit" width={u} height={u} patternUnits="userSpaceOnUse" x={OX} y={OY}>
            <path d={`M ${u} 0 H 0 V ${u}`} fill="none" stroke="rgba(234,252,255,.22)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect x={OX} y={OY} width={a * u} height={b * u} fill="#12343c" stroke="#eafcff" strokeWidth="2.5" />
        {u >= 7 && <rect x={OX} y={OY} width={a * u} height={b * u} fill="url(#ll-unit)" />}
        {E.squares.slice(0, cut).map((s, i) => {
          const last = done && s.step === E.steps - 1;
          const px = s.side * u;
          return (
            <g key={i} className={last ? 'll-glow' : ''}>
              <rect
                x={OX + s.x * u + 1.5}
                y={OY + s.y * u + 1.5}
                width={px - 3}
                height={px - 3}
                rx={Math.min(8, px / 5)}
                fill={last ? '#fde047' : COLORS[s.step % COLORS.length]}
                opacity=".92"
                stroke="#06262c"
                strokeWidth="2"
                style={{ animation: 'll-flip .3s ease-out' }}
              />
              {px >= 24 && (
                <text
                  x={OX + (s.x + s.side / 2) * u}
                  y={OY + (s.y + s.side / 2) * u + Math.min(22, px * 0.42) * 0.36}
                  textAnchor="middle"
                  fontSize={Math.min(22, px * 0.42)}
                  style={{ fill: '#06262c' }}
                >
                  {s.side}
                </text>
              )}
            </g>
          );
        })}
        <g data-ll-lines>
          {lines.slice(0, stepsDone).map((l, i) => (
            <text
              key={l.a}
              x={LX}
              y={44 + i * 33}
              textAnchor="end"
              fontSize="21"
              style={{ fill: l.r === 0 ? '#6ee7b7' : COLORS[i % COLORS.length], animation: 'll-flip .3s ease-out' }}
            >
              {l.a} = {l.b} × {l.q} + {l.r}
            </text>
          ))}
        </g>
        <text x={OX + (a * u) / 2} y={cy + 24} textAnchor="middle" fontSize="19" style={{ fill: '#7dfcff' }}>
          {a}
        </text>
        <text x={OX - 10} y={OY + (b * u) / 2 + 7} textAnchor="end" fontSize="19" style={{ fill: '#7dfcff' }}>
          {b}
        </text>
        <g className="ll-handle" {...corner} data-ll-corner>
          {!moved && <circle className="ll-pulse" cx={cx} cy={cy} r="26" fill="#7dfcff" />}
          <circle cx={cx} cy={cy} r="22" fill="transparent" />
          <circle cx={cx} cy={cy} r="12" fill="#7dfcff" stroke="#06262c" strokeWidth="3" />
        </g>
      </svg>
    </Tool>
  );
}
