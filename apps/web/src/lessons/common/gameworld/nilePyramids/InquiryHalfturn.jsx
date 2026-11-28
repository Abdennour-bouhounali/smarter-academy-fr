/**
 * The screen of `halfturn` (logic: `halfturn.js`) — a PURE view (`HalfturnView`) and its player (`Halfturn`), which
 * reads ← → itself while the turn is open. Hooks: `data-iq="halfturn"`, `data-iq-stage`, `data-iq-predict=<B|C>`,
 * `data-iq-angle`, `data-iq-turn=<-1|1>`, `data-iq-landed`, `data-iq-parallel`, `data-iq-aligned`, `data-iq-chain-own`,
 * `data-iq-next`.
 *
 * `spec.chainOwn` (default false): the student writes the chain of ratios himself, with the forge's tiles — nothing
 * prints it. Only an inquiry that says `chainOwn: true` shows, after the turn, ONE line that rewrites the chain in the
 * butterfly's OWN letters (`VM/VB`, `VN/VC`, `MN/BC` named with the figure's points): for a lesson whose forge is not
 * about that chain.
 */
import { useEffect, useReducer } from 'react';
import { RotateCcw, RotateCw } from 'lucide-react';
import MathText from '../../components/MathText';
import { M } from '../kit/parts';
import { points, gauge } from './figure';
import { Gauge } from './Gauge';
import { initHalfturn, halfturnReducer, halfturnResult, rotate, turned } from './halfturn';
import { expose, textOf } from './inquiryParts';
import { DIR, FIGURE_TEXT } from './strings';

const FW = 520;
const FH = 430;
const PAD = 46;

/**
 * THE FIGURE of the half-turn, drawn here (not by GeoFigure): squared paper, the two lines through the vertex, the big
 * triangle, the small one turned by `angle` with the place it left (dashed) and the arc of the turn with its angle.
 * The frame holds the whole turn (the circle the small triangle sweeps), so nothing moves but the triangle.
 */
function TurnFigure({ fig, angle }) {
  const { V, M: m, B, N, C } = fig.names;
  const P = points(fig);
  const sweep = Math.max(Math.hypot(...P[m]), Math.hypot(...P[N]));
  const xs = [P[B][0], P[C][0], -sweep, sweep];
  const ys = [P[B][1], P[C][1], -sweep, sweep];
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const k = Math.min((FW - 2 * PAD) / (x1 - x0), (FH - 2 * PAD) / (y1 - y0));
  const ox = (FW - (x1 - x0) * k) / 2 - x0 * k;
  const oy = (FH + (y1 - y0) * k) / 2 + y0 * k;
  const at = ([x, y]) => [ox + x * k, oy - y * k];
  const v = at(P[V]);
  const [b, c] = [at(P[B]), at(P[C])];
  const [m0, n0] = [at(P[m]), at(P[N])];
  const [m1, n1] = [at(rotate(P[m], angle)), at(rotate(P[N], angle))];
  const poly = (...q) => q.map((p) => p.map((t) => t.toFixed(1)).join(',')).join(' ');
  // a line through the vertex, drawn across the whole frame
  const through = (p) => {
    const d = [p[0] - v[0], p[1] - v[1]];
    const l = Math.hypot(...d) || 1;
    const t = FW + FH;
    return {
      x1: v[0] - (d[0] / l) * t,
      y1: v[1] - (d[1] / l) * t,
      x2: v[0] + (d[0] / l) * t,
      y2: v[1] + (d[1] / l) * t,
    };
  };
  // the arc of the turn: from where M stood to where it is, round the vertex
  const r = Math.max(26, Math.min(Math.hypot(m0[0] - v[0], m0[1] - v[1]) * 0.55, 60));
  const a0 = Math.atan2(m0[1] - v[1], m0[0] - v[0]);
  const a1 = a0 - (angle * Math.PI) / 180;
  const arcAt = (a) => `${(v[0] + r * Math.cos(a)).toFixed(1)},${(v[1] + r * Math.sin(a)).toFixed(1)}`;
  const arc = `M${arcAt(a0)} A${r},${r} 0 0 0 ${arcAt(a1)}`;
  const mid = a0 - (angle * Math.PI) / 360;
  // a letter stands away from the middle of its triangle
  const label = (p, name, from) => {
    const d = [p[0] - from[0], p[1] - from[1]];
    const l = Math.hypot(...d) || 1;
    return (
      <text x={p[0] + (d[0] / l) * 18} y={p[1] + (d[1] / l) * 18 + 6} textAnchor="middle" className="np-tf__letter">
        {name}
      </text>
    );
  };
  const big = [(v[0] + b[0] + c[0]) / 3, (v[1] + b[1] + c[1]) / 3];
  const small = [(v[0] + m1[0] + n1[0]) / 3, (v[1] + m1[1] + n1[1]) / 3];
  const prime = angle > 0 ? '′' : '';
  return (
    <svg className="np-tf" viewBox={`0 0 ${FW} ${FH}`} role="img" aria-label={FIGURE_TEXT.pair(V)}>
      <defs>
        <pattern id="np-tf-grid" width="26" height="26" patternUnits="userSpaceOnUse">
          <path d="M26 0H0V26" fill="none" stroke="#dbe4f0" strokeWidth="1" />
        </pattern>
        <clipPath id="np-tf-box">
          <rect width={FW} height={FH} rx="14" />
        </clipPath>
        <marker id="np-tf-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0L10 5L0 10z" fill="#7c3aed" />
        </marker>
      </defs>
      <g clipPath="url(#np-tf-box)">
        <rect width={FW} height={FH} fill="#fff" />
        <rect width={FW} height={FH} fill="url(#np-tf-grid)" />
        <line {...through(b)} className="np-tf__line" />
        <line {...through(c)} className="np-tf__line" />
        <polygon points={poly(v, b, c)} className="np-tf__big" />
        {angle > 0 && <polygon points={poly(v, m0, n0)} className="np-tf__ghost" />}
        <polygon points={poly(v, m1, n1)} className="np-tf__small" />
        {angle > 0 && (
          <>
            <path d={arc} className="np-tf__arc" markerEnd="url(#np-tf-arrow)" />
          </>
        )}
        {/* the angle is written while he turns; landed, the arc alone says the half-turn */}
        {angle > 0 && angle < 180 && (
          <>
            <text
              x={v[0] + (r + 20) * Math.cos(mid)}
              y={v[1] + (r + 20) * Math.sin(mid) + 5}
              textAnchor="middle"
              className="np-tf__angle"
            >{`${angle}°`}</text>
          </>
        )}
        {[v, b, c, m1, n1].map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="4.5" className="np-tf__dot" />
        ))}
        {label(b, B, big)}
        {label(c, C, big)}
        {label(m1, `${m}${prime}`, small)}
        {label(n1, `${N}${prime}`, small)}
        {label(v, V, [(big[0] + small[0]) / 2 + 0.01, (big[1] + small[1]) / 2 - 40])}
      </g>
    </svg>
  );
}

const ratioTex = (a, b) => `\\dfrac{${a}}{${b}}`;

export function HalfturnView({ spec, state: s, act }) {
  const T = textOf('halfturn', spec);
  const fig = spec.rounds[s.i].fig;
  const { V, M: m, B, N, C } = fig.names;
  const row = s.stage === 'landed' ? s.rows.at(-1) : null;
  const g = gauge(fig);
  return (
    <section className="np-iq np-iq--halfturn" data-iq="halfturn" data-iq-stage={s.stage} data-iq-angle={s.angle}>
      <p className="np-iq__lead">
        <MathText>{T.lead}</MathText>
      </p>
      <div className="np-iq__row">
        <div className="np-iq__fig">
          <TurnFigure fig={fig} angle={s.angle} />
        </div>
        <div className="np-iq__side">
          {s.stage === 'predict' && (
            <>
              <p className="np-iq__ask">
                <MathText>{T.ask(m)}</MathText>
              </p>
              <div className="np-iq__choices">
                {[B, C].map((x, k) => (
                  <button
                    key={x}
                    type="button"
                    className="rf-btn"
                    onClick={() => act.predict(k === 0 ? 'B' : 'C')}
                    data-iq-predict={k === 0 ? 'B' : 'C'}
                  >
                    <MathText>{T.line(V, x)}</MathText>
                  </button>
                ))}
              </div>
            </>
          )}
          {s.stage === 'turn' && (
            <div className="np-iq__turn">
              <p className="np-iq__ask">{T.turn}</p>
              <div className="np-turn" dir="ltr">
                <button type="button" className="np-turn__btn" onClick={() => act.turn(-1)} data-iq-turn="-1">
                  <RotateCw size={22} aria-hidden="true" />
                  <kbd>←</kbd>
                </button>
                <span className="np-turn__dial" style={{ '--p': s.angle / 180 }}>
                  <b className="np-iq__angle">{`${s.angle}°`}</b>
                </span>
                <button type="button" className="np-turn__btn" onClick={() => act.turn(1)} data-iq-turn="1">
                  <RotateCcw size={22} aria-hidden="true" />
                  <kbd>→</kbd>
                </button>
              </div>
            </div>
          )}
          {/* the three sides, laid on their bars AS he turns (owner, 2026-11-27) — from the first press to the landing */}
          {s.stage === 'turn' && <Gauge c={turned(fig)} angle={s.angle} />}
          {row && (
            <div
              className="np-iq__out"
              data-iq-landed={row.landed}
              data-iq-parallel={row.parallel ? 'yes' : 'no'}
              data-iq-aligned={g.aligned ? 'yes' : 'no'}
            >
              <p
                className={`np-iq__fact ${row.right ? 'is-fits' : 'is-gap'}`}
                data-iq-fact={row.right ? 'hit' : 'miss'}
              >
                <MathText>{`${row.right ? T.hit : T.miss} ${T.landed(`${m}'`, V, B)}`}</MathText>
              </p>
              {/* FACTS (review gate A, 2026-11-24): where each turned point lies — never the chain in the turned
                  letters (ledger A1) */}
              <p className="np-iq__chain" dir={DIR}>
                <MathText>{T.landed(`${N}'`, V, C)}</MathText>
              </p>
              <Gauge c={turned(fig)} angle={s.angle} />
              {spec.chainOwn === true && (
                <p className="np-iq__chain" dir={DIR} data-iq-chain-own>
                  {T.chainOwn}{' '}
                  <M>{`${ratioTex(`${V}${m}`, `${V}${B}`)} \\; ${ratioTex(`${V}${N}`, `${V}${C}`)} \\; ${ratioTex(`${m}${N}`, `${B}${C}`)}`}</M>
                </p>
              )}
              <button type="button" className="rf-btn rf-btn--main" onClick={act.next} data-iq-next>
                {T.next}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function Halfturn({ spec, play, onDone }) {
  const [state, dispatch] = useReducer((s, a) => halfturnReducer(spec, s, a), spec, initHalfturn);
  expose({ kind: 'halfturn', ...state });
  // ← → turn the small triangle while the turn is open (his act is the prediction — gate cut 5)
  useEffect(() => {
    if (state.stage !== 'turn') return undefined;
    const onKey = (e) => {
      if (e.code !== 'ArrowLeft' && e.code !== 'ArrowRight') return;
      e.preventDefault();
      play('lane');
      dispatch({ type: 'turn', d: e.code === 'ArrowRight' ? 1 : -1 });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state.stage]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (state.stage === 'landed') play(state.rows.at(-1)?.right ? 'key' : 'fail');
  }, [state.stage]); // eslint-disable-line react-hooks/exhaustive-deps
  const act = {
    predict(line) {
      play('pick');
      dispatch({ type: 'predict', line });
    },
    turn(d) {
      play('lane');
      dispatch({ type: 'turn', d });
    },
    next() {
      const after = halfturnReducer(spec, state, { type: 'next' });
      if (after.done) onDone(halfturnResult(after));
      else {
        play('ui');
        dispatch({ type: 'next' });
      }
    },
  };
  return <HalfturnView spec={spec} state={state} act={act} />;
}
