/**
 * THE MODE `factor` OF THE INVESTIGATION `ladder` (logic and state machine: `factorLadder.js`; mounted by
 * `InquiryGcd.jsx › Ladder` when `spec.mode === 'factor'` — a spec without this mode never reaches this file).
 *
 * ONE gap. He takes the plank of his choice from the rack; the world lays it on the gap. A plank that holds is laid
 * edge to edge, the gap SHRINKS to the quotient (the count of planks, drawn at the same scale) and a line of the
 * notebook is written — « 72 ÷ 2 = 36 », in the layout of the `divide` ladder (its number, its bar, its calculation). A
 * plank that does not hold FALLS from the end of the gap, what is left in amber: the gap stays. The rack never empties: a
 * plank that held may be taken again. At 1 the round ends and the planks that held stand in a row, as planks — no
 * product, no power, no name (naming is the forge's job).
 *
 * `spec.text` is the lesson's wording (GAME_WORLD.md « Explore », spec shape of `ladder · factor`). Nothing here states a
 * rule: every sentence says what the gap has just done. The screen is a pure VIEW of the reducer (`FactorView`).
 */
import { useEffect, useReducer } from 'react';
import MathText from '../../components/MathText';
import { initFactor, factorNow, factorReducer, factorResult, fellHere, laidOf } from './factorLadder';
import { Span } from './InquiryCombine';
import { Head, Found } from './InquiryDivision';
import { RungBar } from './InquiryGcd';
import { expose, X0, SPAN, FAST, useLater } from './inquiryParts';
import './inquiryFactor.css';

const MAXF = 5; // notebook lines on screen; more are folded behind one line « … » (never deleted)
const YF = 30; // the gap's line in the 1000 × 92 scene
const lineTex = (a) => `${a.before} \\div ${a.plank} = ${a.after}`;

/** The gap on the scene, at the round's scale: the plank in his hand laid on it, and the one that falls when it does not hold. */
function Gap({ gap, d, u, falls }) {
  const whole = d ? Math.floor(gap / d) : 0;
  return (
    <svg
      className="iq-scene iq-factor-scene"
      viewBox="0 0 1000 92"
      role="img"
      aria-label={d ? `${gap} · ${d}` : `${gap}`}
    >
      <g data-iq-strip="gap" data-iq-gap={gap}>
        <Span key={`${gap}-${d ?? 0}`} n={gap} d={d ?? 0} u={u} y={YF} laid={Boolean(d)} />
        {falls && (
          <rect
            className="iq-plank iq-factor-fall"
            x={X0 + whole * d * u + 1}
            y={YF - 4}
            width={Math.max(2, d * u - 2)}
            height="38"
            rx={Math.min(6, (d * u) / 3)}
            data-iq-falls={d}
          />
        )}
        <text className="iq-scene__num" x={X0 + gap * u} y={YF - 12} direction="ltr">
          {gap}
        </text>
      </g>
    </svg>
  );
}

/** The planks that held, in a row, as planks — each with its length, nothing between them. */
export function LaidRow({ planks, label }) {
  return (
    <div className="iq-factor-laid" data-iq-laid={planks.join(',')}>
      {label && <small>{label}</small>}
      <span className="iq-factor-laid__row" dir="ltr">
        {planks.map((d, k) => (
          // eslint-disable-next-line react/no-array-index-key -- a row of equal planks is legal: keyed by their place
          <span key={k} className="iq-factor-plank" data-iq-laid-plank={d}>
            {d}
          </span>
        ))}
      </span>
    </div>
  );
}

export function FactorView({ spec, state: s, act }) {
  const T = spec.text;
  const now = factorNow(spec, s);
  const { n, rack } = now;
  const u = SPAN / n; // ONE scale for the round: the gap is seen to shrink
  const held = s.attempts.filter((a) => a.held);
  const last = s.attempts.at(-1) ?? null;
  const seen = s.stage === 'seen';
  const isLast = s.ri + 1 >= spec.rounds.length;
  const fell = fellHere(s);
  // on the scene: the plank being laid; after a fall, that fall stays as the fact until he takes another plank
  const shownPlank = s.stage === 'lay' ? s.hand : last && !last.held && s.stage === 'pick' ? last.plank : null;
  const falls = shownPlank != null && s.gap % shownPlank !== 0;
  const rows = held.map((a, k) => ({ a, k }));
  const view = rows.length > MAXF ? [rows[0], null, ...rows.slice(-(MAXF - 2))] : rows;
  const hidden = rows.length - (MAXF - 1);

  let fact = ' ';
  if (seen) fact = T.end({ n, planks: laidOf(s.attempts), attempts: s.attempts });
  else if (last && s.stage === 'pick') fact = last.held ? T.held(last) : T.fell(last);

  return (
    <section
      className="iq iq--div iq--ladder iq--factor"
      data-iq="ladder"
      data-iq-mode="factor"
      data-iq-stage={s.stage}
      data-iq-gap={s.gap}
    >
      <Head i={s.ri} n={spec.rounds.length} lead={T.lead(n)} goal={T.goal(n)} />

      <Gap gap={s.gap} d={shownPlank} u={u} falls={falls} />

      <div className="iq-ladder iq-ladder--factor" dir="ltr" data-iq-ladder data-iq-lines={held.length}>
        {view.map((v) =>
          v == null ? (
            <div key="fold" className="iq-rung iq-rung--fold" data-iq-fold={hidden}>
              <span />
              <small>{T.folded(hidden)}</small>
            </div>
          ) : (
            <div
              key={v.k}
              className={`iq-rung is-written ${v.k === held.length - 1 && !seen ? 'is-new' : ''}`}
              data-iq-row={v.k + 1}
              data-iq-line={`${v.a.before}:${v.a.plank}:${v.a.after}`}
            >
              <span className="iq-rung__n">{v.k + 1}</span>
              <RungBar
                r={{ a: v.a.before, b: v.a.plank, q: v.a.after, value: 0 }}
                written
                scale={400 / n}
                end={false}
              />
              <span className="iq-rung__tex">
                <MathText>{`$${lineTex(v.a)}$`}</MathText>
              </span>
            </div>
          ),
        )}
      </div>

      <p className="iq-fact" data-iq-fact>
        <MathText>{fact}</MathText>
      </p>

      <div className="iq-actions">
        {s.stage !== 'seen' && (
          <>
            <p className="iq-askline">
              <MathText>{T.ask({ n, gap: s.gap, laid: laidOf(s.attempts) })}</MathText>
            </p>
            <div className="iq-factor-rack" data-iq-rack={rack.join(',')}>
              {T.rackLabel && <small>{T.rackLabel}</small>}
              {rack.map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`iq-chip iq-factor-chip ${s.hand === d ? 'is-on' : ''} ${fell.includes(d) ? 'is-fell' : ''}`}
                  onClick={() => act.take(d)}
                  disabled={s.stage !== 'pick'}
                  data-iq-plank={d}
                  {...(fell.includes(d) ? { 'data-iq-fell': '' } : {})}
                >
                  {d}
                </button>
              ))}
            </div>
          </>
        )}
        {seen && (
          <>
            <LaidRow planks={laidOf(s.attempts)} label={T.laidLabel} />
            <button type="button" className="rf-btn rf-btn--main" onClick={act.next} data-iq-next>
              {isLast ? T.done : T.next}
            </button>
          </>
        )}
      </div>

      <Found lines={s.rounds.map((r) => ({ key: `${r.n}`, text: T.foundLine(r), fell: r.fell > 0 }))} />
    </section>
  );
}

/** How long the world takes to lay the planks of d on the gap (the rhythm of `Span`), plus the fall. */
const layTime = (gap, d) => (FAST() ? 20 : Math.min(900, Math.floor(gap / d) * 90) + (gap % d ? 900 : 350));

export function Factor({ spec, play, onDone }) {
  const [state, dispatch] = useReducer((s, a) => factorReducer(spec, s, a), spec, initFactor);
  const later = useLater();
  const now = factorNow(spec, state);
  expose({
    kind: 'ladder',
    mode: 'factor',
    ri: state.ri,
    n: now.n,
    gap: state.gap,
    stage: state.stage,
    hand: state.hand,
    laid: laidOf(state.attempts),
    attempts: state.attempts.length,
    rounds: state.rounds,
  });
  useEffect(() => {
    if (state.stage === 'seen') play('gate');
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once at the end of a round
  }, [state.stage]);

  const act = {
    take(d) {
      if (state.stage !== 'pick' || !now.rack.includes(d)) return;
      play('pick');
      dispatch({ type: 'take', d });
      later(layTime(state.gap, d), () => {
        play(state.gap % d === 0 ? 'plank' : 'hit');
        dispatch({ type: 'shown' });
      });
    },
    next() {
      const after = factorReducer(spec, state, { type: 'next' });
      if (after.done) onDone(factorResult(after));
      else dispatch({ type: 'next' });
    },
  };
  return <FactorView spec={spec} state={state} act={act} />;
}
