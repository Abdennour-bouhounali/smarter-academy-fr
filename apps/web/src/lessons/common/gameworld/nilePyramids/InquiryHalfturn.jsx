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
import GeoFigure from '../../components/GeoFigure';
import MathText from '../../components/MathText';
import { M } from '../kit/parts';
import { points, gauge } from './figure';
import { Gauge } from './Gauge';
import { initHalfturn, halfturnReducer, halfturnResult, rotate, turned } from './halfturn';
import { expose, textOf } from './inquiryParts';
import { DIR, FIGURE_TEXT } from './strings';

/** The butterfly with its small triangle turned by `angle`; four hidden corners keep the drawing's frame still. */
function turnedSpec(fig, angle) {
  const { V, M: m, B, N, C } = fig.names;
  const P = points(fig);
  const R = Math.max(...Object.values(P).map(([x, y]) => Math.hypot(x, y))) * 1.05;
  const pm = rotate(P[m], angle);
  const pn = rotate(P[N] ?? P[fig.names.N], angle);
  return {
    points: { [V]: P[V], [B]: P[B], [C]: P[C], [m]: pm, [N]: pn, c1: [-R, -R], c2: [R, R], c3: [-R, R], c4: [R, -R] },
    hidden: ['c1', 'c2', 'c3', 'c4'],
    segments: [
      { from: V, to: B },
      { from: V, to: C },
      { from: B, to: C, tone: 'rose', bold: true },
      { from: V, to: m, tone: 'indigo' },
      { from: V, to: N, tone: 'indigo' },
      { from: m, to: N, tone: 'amber', bold: true },
    ],
    lines: [
      { through: [V, B], dashed: true },
      { through: [V, C], dashed: true },
    ],
    polygons: [{ points: [V, m, N], tone: 'amber' }],
    ariaLabel: FIGURE_TEXT.pair(V),
    maxWidth: 380,
  };
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
          <GeoFigure {...turnedSpec(fig, s.angle)} />
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
              <div className="np-iq__choices" dir="ltr">
                <button type="button" className="rf-btn rf-btn--main" onClick={() => act.turn(-1)} data-iq-turn="-1">
                  ←
                </button>
                <b className="np-iq__angle">{`${s.angle}°`}</b>
                <button type="button" className="rf-btn rf-btn--main" onClick={() => act.turn(1)} data-iq-turn="1">
                  →
                </button>
              </div>
            </div>
          )}
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
              <Gauge c={turned(fig)} names={false} />
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
