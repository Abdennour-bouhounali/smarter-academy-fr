/**
 * THE RATIO GAUGE (PYRAMIDS_WORLD_PLAN §2.3): each whole side from the vertex stretched to ONE common length, its piece
 * marked on it. When the three marks stand on one vertical line the ratios are equal (a gold line); otherwise the marks
 * stand apart. Shared by the mirror, its lines of evidence and the experiment `halfturn`. A case TESTED through other
 * values (`c.tested`, figure.js › gauge) shows THOSE, with their names and the target line (dashed) when it has one —
 * the gauge agrees with the case's `held`. Hooks: `data-rf-gauge`, `data-rf-aligned=<yes|no>`, `data-rf-gauge-target`.
 */
import { gauge } from './figure';
import { segName, THALES_TEXT } from './ruleForge';
import { M } from '../kit/parts';

const W = 300;
const X0 = 28;
const BAR = W - 2 * X0;
const ROWS = { VB: 'VM/VB', VC: 'VN/VC', BC: 'MN/BC' };
const texRatio = (c, k, name) => {
  if (name) return name;
  const [a, b] = ROWS[k].split('/');
  return `\\dfrac{${segName(c, a)}}{${segName(c, b)}}`;
};

/**
 * THE RATIO GAUGE: three bars of one length, each with its piece marked; a gold line when the marks stand together.
 * `names: false` draws the bars without the ratios' names — the experiment `halfturn` shows facts, never the chain
 * (review gate A, 2026-11-24: its names were the right tiles of 🦋's forge, before the tiles).
 */
export function Gauge({ c, small = false, names = true }) {
  const g = gauge(c);
  const h = small ? 34 : 120;
  const row = h / 3;
  return (
    <div className={`np-gauge ${small ? 'is-small' : ''}`} data-rf-gauge data-rf-aligned={g.aligned ? 'yes' : 'no'}>
      {!small && names && (
        <div className="np-gauge__names" dir="ltr">
          {g.marks.map((m) => (
            <span key={m.k}>
              <M>{texRatio(c, m.k, m.name)}</M>
            </span>
          ))}
        </div>
      )}
      <svg viewBox={`0 0 ${W} ${h}`} role="img" aria-label={g.aligned ? THALES_TEXT.aligned : THALES_TEXT.apart}>
        {g.marks.map((m, i) => {
          const y = row * (i + 0.5);
          const x = m.at == null ? null : X0 + m.at * BAR;
          return (
            <g key={m.k}>
              <line
                x1={X0}
                y1={y}
                x2={X0 + BAR}
                y2={y}
                stroke="#64748b"
                strokeWidth={small ? 3 : 6}
                strokeLinecap="round"
              />
              {x != null && <circle cx={x} cy={y} r={small ? 3.5 : 7} fill="#e11d48" />}
            </g>
          );
        })}
        {g.target != null && (
          <line
            x1={X0 + g.target * BAR}
            y1={2}
            x2={X0 + g.target * BAR}
            y2={h - 2}
            stroke="#64748b"
            strokeWidth={small ? 1 : 2}
            strokeDasharray={small ? '2 2' : '5 4'}
            data-rf-gauge-target
          />
        )}
        {g.aligned && (
          <line
            x1={X0 + g.marks[0].at * BAR}
            y1={2}
            x2={X0 + g.marks[0].at * BAR}
            y2={h - 2}
            stroke="#f59e0b"
            strokeWidth={small ? 2 : 4}
          />
        )}
      </svg>
      {!small && <p className="np-gauge__say">{g.aligned ? THALES_TEXT.aligned : THALES_TEXT.apart}</p>}
    </div>
  );
}
