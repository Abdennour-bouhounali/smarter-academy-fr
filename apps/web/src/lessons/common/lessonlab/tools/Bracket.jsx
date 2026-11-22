/**
 * « L’encadrement par planches » — planks of length b laid end to end from 0 along a length a. The student's hand holds the END OF THE LAST
 * PLANK (how many planks are laid); two buttons add or take one plank when there are too many to drag one by one. Planks
 * inside the length are blue, a plank that passes its end is rose, what is left is a dashed amber gap. Under the drawing, the
 * product the planks make, compared with a. Once the hand has laid BOTH the most planks that stay inside and the one more
 * that passes, the drawing writes the bracket of a ÷ b for these two numbers — the instrument never states a rule.
 * New numbers start a new try: the planks laid and « moved » belong to the numbers they were laid for (`key`), like `met`.
 * `start` (default 1) is how many planks lie there on opening — the render test uses it to draw the one-bar branch.
 */
import { useEffect, useRef, useState } from 'react';
import { VW, VH, useDrag, useChime, Tool } from '../kit';
import { bracketOf } from '../logic';
import { counted, PLANKS } from '../../gameworld/kit/authoring/numbers';

const X0 = 190;
const X1 = 900;
const Y_GAP = 70;
const Y_PLANK = 146;
const Y_EQ = 236;
const Y_FOUND = 300;
const BAR = 26;
const EACH = 60; // up to this many planks each is drawn; beyond, the planks are one bar
const LTR = { direction: 'ltr', unicodeBidi: 'embed' };

export default function Bracket({ a, b, play, report, start = 1 }) {
  const svg = useRef(null);
  const key = `${a}:${b}`;
  const [hand, setHand] = useState({ key, n: start, moved: false });
  const { n, moved } = hand.key === key ? hand : { n: 1, moved: false }; // other numbers: one plank, not moved yet
  const [met, setMet] = useState({ key: '', lo: false, hi: false });
  const x = bracketOf(a, b, n);
  const last = useRef(x.n);
  last.current = x.n;
  const u = (X1 - X0) / Math.max(1, x.top * b);
  const seen = met.key === key ? met : { key, lo: false, hi: false };
  const lo = seen.lo || (moved && x.n === x.q);
  const hi = seen.hi || (moved && x.n === x.q + 1);
  const found = x.r === 0 ? lo : lo && hi;
  useEffect(() => {
    if (!moved) return;
    if (lo !== seen.lo || hi !== seen.hi || met.key !== key) setMet({ key, lo, hi });
    report({ key, n: x.n, lo, hi });
  }, [moved, key, x.n, lo, hi]); // eslint-disable-line react-hooks/exhaustive-deps
  const lay = (k) => {
    const nk = Math.max(0, Math.min(x.top, k));
    const changed = nk !== last.current;
    last.current = nk;
    if (changed || !moved) setHand({ key, n: nk, moved: true });
    if (changed) play('tick', nk);
  };
  const toN = (p) => lay(Math.round((p.x - X0) / (b * u)));
  const drag = useDrag(svg, {
    onStart: (p) => toN(p),
    onMove: toN,
  });
  const onKey = (e) => {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (step) lay(x.n + step);
  };
  useChime(play, 'fit', x.exact && x.n > 0, [x.n, a, b]); // the planks fill the length exactly: HEARD
  useChime(play, 'short', x.over > 0 && x.n === x.q + 1, [x.n, a, b]); // the one plank too many
  useChime(play, 'found', found, [found, a, b], { delay: 250 });
  const xa = X0 + a * u;
  const xl = X0 + x.laid * u;
  const inside = Math.min(x.n, x.q);
  const w = b * u;
  const gap = Math.min(2, w * 0.25);
  const sign = x.exact ? '=' : x.over ? '>' : '<';
  const tone = x.exact && x.n > 0 ? 'good' : x.over ? 'warm' : 'plain';
  return (
    <Tool
      id="bracket"
      tone={found ? 'good' : tone}
      actions={
        <>
          {/* one plank less on the left, one more on the right: the planks are laid left to right */}
          <button
            type="button"
            className="ll-btn ll-btn--ghost"
            onClick={() => lay(x.n - 1)}
            disabled={x.n <= 0}
            data-ll-less
          >
            − une planche
          </button>
          <button type="button" className="ll-btn" onClick={() => lay(x.n + 1)} disabled={x.n >= x.top} data-ll-more>
            une planche de plus +
          </button>
        </>
      }
      reading={
        <>
          <span className="ll-chip">{counted(x.n, PLANKS)}</span>
          {x.exact ? (
            <span className="ll-chip ll-chip--good" data-ll-left="0">
              La longueur est remplie exactement
            </span>
          ) : x.over ? (
            <span className="ll-chip ll-chip--warm" data-ll-over={x.over}>
              La longueur est dépassée de {x.over}
            </span>
          ) : (
            <span className="ll-chip ll-chip--dim" data-ll-left={x.left}>
              Il reste {x.left}
            </span>
          )}
          {found && (
            <span className="ll-chip ll-chip--good" data-ll-found>
              {x.r === 0
                ? `Planches entières : ${x.q}, juste ce qu’il faut`
                : `Planches entières : ${x.q} · nécessaires : ${x.need}`}
            </span>
          )}
        </>
      }
    >
      <svg ref={svg} viewBox={`0 0 ${VW} ${VH}`} data-ll-bracket-tool data-n={x.n} data-q={x.q} data-over={x.over}>
        {/* the length a */}
        <text x={X0 - 14} y={Y_GAP + 7} textAnchor="end" fontSize="18" style={{ fill: '#e0f2fe' }}>
          Longueur {a}
        </text>
        <rect
          x={X0}
          y={Y_GAP - BAR / 2}
          width={Math.max(2, a * u)}
          height={BAR}
          rx="5"
          fill="rgba(234,252,255,.08)"
          stroke="rgba(234,252,255,.55)"
          strokeWidth="1.5"
        />
        <line
          x1={xa}
          y1={Y_GAP - 26}
          x2={xa}
          y2={Y_PLANK + 26}
          stroke="#fbbf24"
          strokeWidth="2.5"
          strokeDasharray="6 5"
        />
        <text x={xa} y={Y_GAP - 32} textAnchor="middle" fontSize="18" fontWeight="700" style={{ fill: '#fde68a' }}>
          {a}
        </text>
        {/* the planks the hand lays */}
        <text x={X0 - 14} y={Y_PLANK + 7} textAnchor="end" fontSize="18" style={{ fill: '#e0f2fe' }}>
          Planche de {b}
        </text>
        <g data-ll-planks-laid={x.n}>
          {x.n <= EACH ? (
            Array.from({ length: x.n }, (_, k) => (
              <rect
                key={k}
                x={X0 + k * w + gap / 2}
                y={Y_PLANK - BAR / 2 + 3}
                width={Math.max(1, w - gap)}
                height={BAR - 6}
                rx="3"
                fill={k < x.q ? (x.exact ? '#34d399' : '#7dfcff') : '#fb7185'}
              />
            ))
          ) : (
            <>
              <rect
                x={X0}
                y={Y_PLANK - BAR / 2 + 3}
                width={inside * w}
                height={BAR - 6}
                rx="3"
                fill={x.exact ? '#34d399' : '#7dfcff'}
              />
              {x.n > x.q && (
                <rect x={X0 + x.q * w} y={Y_PLANK - BAR / 2 + 3} width={w} height={BAR - 6} rx="3" fill="#fb7185" />
              )}
            </>
          )}
          {x.left > 0 && (
            <rect
              x={xl}
              y={Y_PLANK - BAR / 2 + 3}
              width={x.left * u}
              height={BAR - 6}
              rx="3"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="2"
              strokeDasharray="5 4"
            />
          )}
        </g>
        <g className="ll-handle" {...drag} tabIndex={0} onKeyDown={onKey} data-ll-plank-end>
          <rect x={X0 - 10} y={Y_PLANK - 24} width={X1 - X0 + 20} height="48" fill="transparent" />
          {!moved && <circle className="ll-pulse" cx={xl} cy={Y_PLANK} r="22" fill="#fbbf24" />}
          <circle cx={xl} cy={Y_PLANK} r="12" fill="#fde68a" stroke="#06262c" strokeWidth="3" />
        </g>
        {/* what the planks make, compared with the length */}
        <text
          x={(X0 + X1) / 2}
          y={Y_EQ}
          textAnchor="middle"
          fontSize="26"
          fontWeight="700"
          {...LTR}
          style={{ ...LTR, fill: x.exact ? '#6ee7b7' : x.over ? '#fda4af' : '#e0f2fe' }}
          data-ll-product
        >
          {`${x.n} × ${b} = ${x.laid} ${sign} ${a}`}
        </text>
        {found && (
          <text
            x={(X0 + X1) / 2}
            y={Y_FOUND}
            textAnchor="middle"
            fontSize="28"
            fontWeight="800"
            {...LTR}
            style={{ ...LTR, fill: '#6ee7b7' }}
            data-ll-bracket
          >
            {x.r === 0 ? `${a} ÷ ${b} = ${x.q}` : `${x.q} < ${a} ÷ ${b} < ${x.q + 1}`}
          </text>
        )}
      </svg>
    </Tool>
  );
}
