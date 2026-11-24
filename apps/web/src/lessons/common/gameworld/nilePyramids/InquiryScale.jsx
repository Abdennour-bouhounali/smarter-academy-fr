/**
 * The screen of `scale` (logic: `scale.js`) — a PURE view (`ScaleView`) and its player (`Scale`).
 * Hooks: `data-iq="scale"`, `data-iq-stage=<fact|predict|set|perimeter>`, `data-iq-k`, `data-iq-feed=<small|big>`,
 * `data-iq-predict=<larger|exact|smaller>`, `data-iq-kn`, `data-iq-kd`, `data-iq-choose=<times|plus|times3>`,
 * `data-iq-copy`, `data-iq-image=<inside|exact|outside>`, `data-iq-perimeter`, `data-iq-next`.
 */
import { useReducer } from 'react';
import GeoFigure from '../../components/GeoFigure';
import MathText from '../../components/MathText';
import { M } from '../kit/parts';
import { approx } from '../kit/exact';
import { initScale, scaleReducer, scaleResult, perimeterChoices, PREDICTS, PERIMETERS } from './scale';
import { expose, textOf, texNum } from './inquiryParts';
import { FIGURE_TEXT } from './strings';

/** Both triangles from the vertex (the angle of the big one), and the copy when there is one. */
function scaleSpec(spec, s) {
  const { small, big } = spec.tri;
  const [a, b, c] = big.sides.map(approx);
  const cos = Math.max(-0.95, Math.min(0.95, (a * a + b * b - c * c) / (2 * a * b)));
  const sin = Math.sqrt(1 - cos * cos);
  const at = (p, q) => ({ p: [approx(p), 0], q: [approx(q) * cos, approx(q) * sin] });
  const S = at(small.sides[0], small.sides[1]);
  const B = at(big.sides[0], big.sides[1]);
  const points = { [big.V]: [0, 0], [small.P]: S.p, [small.Q]: S.q, [big.P]: B.p, [big.Q]: B.q };
  const segments = [
    { from: big.V, to: big.P },
    { from: big.V, to: big.Q },
    { from: small.P, to: small.Q, tone: 'indigo', bold: true },
    { from: big.P, to: big.Q, tone: 'rose', bold: true },
  ];
  const polygons = [];
  if (s.copy) {
    const C = at(s.copy.sides[0], s.copy.sides[1]);
    points["P'"] = C.p;
    points["Q'"] = C.q;
    segments.push({ from: "P'", to: "Q'", tone: 'amber', bold: true });
    polygons.push({ points: [big.V, "P'", "Q'"], tone: 'amber' });
  }
  const R = Math.max(...Object.values(points).map(([x, y]) => Math.hypot(x, y))) * 1.02;
  points.c1 = [0, -R * 0.05];
  points.c2 = [R, R * 0.9];
  // the copy's corners are not named: it is drawn over the target, and two names would overlap
  const hidden = ['c1', 'c2', ...(s.copy ? ["P'", "Q'"] : [])];
  return { points, hidden, segments, polygons, ariaLabel: FIGURE_TEXT.pair(big.V), maxWidth: 380 };
}

const triName = (t) => `${t.V}${t.P}${t.Q}`;

export function ScaleView({ spec, state: s, act }) {
  const T = textOf('scale', spec);
  const r = spec.rounds[s.i];
  const fed = r.feed ? spec.tri[r.feed] : null;
  const target = r.feed ? spec.tri[r.feed === 'small' ? 'big' : 'small'] : null;
  const row = s.copy ? s.rows.at(-1) : null;
  const choices = s.stage === 'perimeter' ? perimeterChoices(spec, r.feed, r.k) : null;
  return (
    <section
      className="np-iq np-iq--scale"
      data-iq="scale"
      data-iq-stage={s.stage}
      data-iq-k={s.k ?? ''}
      data-iq-feed={r.feed ?? ''}
    >
      <p className="np-iq__lead">
        <MathText>{T.lead}</MathText>
      </p>
      <div className="np-iq__row">
        <div className="np-iq__fig">
          <GeoFigure {...scaleSpec(spec, s)} />
        </div>
        <div className="np-iq__side">
          {s.stage === 'fact' && (
            <div className="np-iq__out">
              <p className="np-iq__fact is-fits">{T.fact}</p>
              {(r.fact.lines ?? []).map((l) => (
                <p key={l} className="np-iq__chain">
                  <MathText>{l}</MathText>
                </p>
              ))}
              <button type="button" className="rf-btn rf-btn--main" onClick={act.next} data-iq-next>
                {T.next}
              </button>
            </div>
          )}
          {s.stage !== 'fact' && (
            <p className="np-iq__dial" dir="ltr">
              <span>{T.dial}</span>
              {s.stage === 'set' && !s.copy ? (
                <span className="np-iq__frac">
                  <input
                    className="di-num"
                    inputMode="numeric"
                    value={s.n}
                    onChange={(e) => act.frac('n', e.target.value)}
                    aria-label="k"
                    data-iq-kn
                  />
                  <i aria-hidden="true" />
                  <input
                    className="di-num"
                    inputMode="numeric"
                    value={s.d}
                    onChange={(e) => act.frac('d', e.target.value)}
                    aria-label="k"
                    data-iq-kd
                  />
                </span>
              ) : (
                <M>{`k = ${texNum(s.k ?? '?')}`}</M>
              )}
            </p>
          )}
          {s.stage === 'set' && !s.copy && (
            <p className="np-iq__ask">
              <MathText>{T.setK(triName(target))}</MathText>
            </p>
          )}
          {s.stage === 'predict' && !s.copy && (
            <>
              <p className="np-iq__ask">
                <MathText>{T.ask(triName(target))}</MathText>
              </p>
              <div className="np-iq__choices">
                {PREDICTS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    className={`rf-btn ${s.said === v ? 'is-on' : ''}`}
                    onClick={() => act.say(v)}
                    data-iq-predict={v}
                  >
                    {T.say[v]}
                  </button>
                ))}
              </div>
            </>
          )}
          {s.stage === 'perimeter' && !s.copy && (
            <>
              <p className="np-iq__ask">{T.perimeterAsk}</p>
              <div className="np-iq__choices">
                {PERIMETERS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    className={`rf-btn ${s.said === v ? 'is-on' : ''}`}
                    onClick={() => act.choose(v)}
                    data-iq-choose={v}
                  >
                    <span>{T.perimeter[v]}</span>
                    <small dir="ltr">
                      <M>{`= ${texNum(choices[v])}`}</M>
                    </small>
                  </button>
                ))}
              </div>
            </>
          )}
          {s.stage !== 'fact' && !s.copy && (
            <button type="button" className="rf-btn rf-btn--main" onClick={act.feed} data-iq-copy>
              {T.copy} {fed ? triName(fed) : ''}
            </button>
          )}
          {row && (
            <div className="np-iq__out" data-iq-image={row.image} data-iq-perimeter={row.perimeter}>
              {s.stage !== 'set' && (
                <p
                  className={`np-iq__fact ${row.right ? 'is-fits' : 'is-gap'}`}
                  data-iq-fact={row.right ? 'hit' : 'miss'}
                >
                  {row.right ? T.hit : T.miss}
                </p>
              )}
              <p className="np-iq__fact">{T.image[row.image]}</p>
              <p className="np-iq__chain">
                {T.copySides} <M>{s.copy.sides.map(texNum).join(' \\; ; \\; ')}</M>
              </p>
              <p className="np-iq__chain">
                {T.copyPerimeter} <M>{texNum(s.copy.perimeter)}</M>
              </p>
              <button type="button" className="rf-btn rf-btn--main" onClick={act.next} data-iq-next>
                {s.stage === 'set' && row.image !== 'exact' ? T.again : T.next}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function Scale({ spec, play, onDone }) {
  const [state, dispatch] = useReducer((s, a) => scaleReducer(spec, s, a), spec, initScale);
  expose({ kind: 'scale', ...state });
  const act = {
    say(v) {
      play('pick');
      dispatch({ type: 'say', v });
    },
    choose(v) {
      play('pick');
      dispatch({ type: 'choose', v });
    },
    frac(part, text) {
      dispatch({ type: 'frac', part, text });
    },
    feed() {
      const after = scaleReducer(spec, state, { type: 'feed' });
      if (after.copy) play(after.copy.image === 'exact' ? 'gate' : 'plank');
      dispatch({ type: 'feed' });
    },
    next() {
      const after = scaleReducer(spec, state, { type: 'next' });
      if (after.done) onDone(scaleResult(after));
      else {
        play('ui');
        dispatch({ type: 'next' });
      }
    },
  };
  return <ScaleView spec={spec} state={state} act={act} />;
}
