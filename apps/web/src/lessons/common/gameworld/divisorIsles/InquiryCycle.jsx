/**
 * THE INVESTIGATION `cycle` of this world (see `Inquiry.jsx`, which mounts it; logic and state machine: `cycle.js`).
 * ONE plank of b cells, and a gap that grows one cell at a time: a PATTERN — the cells left climb 0, 1, 2 … and the
 * step where they would be as many as the plank is the step where one more plank goes in.
 *
 *   rounds  he says, BEFORE each new cell, how many cells will be left; the world adds the cell, lays what fits and
 *           writes the division. Under the strip a STAIRCASE keeps every gap he has seen: one column of cells left per
 *           gap — it climbs, and falls where a plank went in.
 *   probes  a plank he has not laid: he says the most cells it will leave and whether b cells will be left once; then
 *           the world grows the gap alone (a sound per cell, a plank at the fall) and the staircase answers.
 *
 * `spec.text` is the lesson's wording (GAME_WORLD.md « Explore », spec shape of `cycle`). Nothing here states a rule:
 * every sentence says what the strip has just done.
 * The screen is a pure VIEW of the reducer's state (`CycleView`), so a stage can be rendered without playing up to it.
 */
import { useReducer } from 'react';
import MathText from '../../components/MathText';
import { Num } from '../kit/parts';
import { cycleNow, cycleReducer, cycleResult, initCycle, largestLeft, probeSaid } from './cycle';
import { Calc, restTex } from './InquiryCombine';
import { Head, Found, asNumber, onEnter } from './InquiryDivision';
import { expose, X0, SPAN, useLater, YesNo } from './inquiryParts';
import './inquiryCycle.css';

/** The strip. */
const YS = 30;
const HS = 30;
/** The staircase: its baseline and the room its tallest column may take. */
const YB = 236;
const ROOM = 108;

/** The gap as it is now: its cells, the planks laid, the cells left, and the cell about to be added. */
function Strip({ cur, b, u, adding, leftLabel }) {
  const end = X0 + cur.a * u;
  const restX = X0 + cur.q * b * u;
  return (
    <g data-iq-strip={cur.a}>
      {u >= 6 ? (
        Array.from({ length: cur.a }, (_, k) => (
          <rect key={k} className="iq-gapcell" x={X0 + k * u} y={YS} width={u - 1.5} height={HS} rx="3" />
        ))
      ) : (
        <rect className="iq-gapcell" x={X0} y={YS} width={cur.a * u} height={HS} rx="4" />
      )}
      {Array.from({ length: cur.q }, (_, k) => (
        <rect
          key={`p${k}`}
          className={`iq-plank ${k % 2 ? 'is-alt' : ''} ${cur.wraps && k === cur.q - 1 ? 'is-new iq-plank--drop' : ''}`}
          x={X0 + k * b * u + 1}
          y={YS - 4}
          width={Math.max(1, b * u - 2)}
          height={HS + 8}
          rx={Math.min(6, (b * u) / 3)}
        />
      ))}
      {cur.r > 0 && (
        <>
          <rect
            key={`r${cur.a}`}
            className="iq-rest"
            x={restX}
            y={YS - 4}
            width={Math.max(1, cur.r * u - 1.5)}
            height={HS + 8}
            rx="5"
          />
          <text
            className="iq-scene__say"
            x={Math.max(X0 + 60, Math.min(940, restX + (cur.r * u) / 2))}
            y={YS - 12}
            data-iq-left={cur.r}
          >
            {leftLabel(cur.r)}
          </text>
        </>
      )}
      {adding && <rect className="iq-cyc-new" x={end} y={YS} width={Math.max(2, u - 1.5)} height={HS} rx="3" />}
      <line className="iq-gapend" x1={end} y1={YS - 8} x2={end} y2={YS + HS + 8} />
      <text className="iq-scene__num" x={X0} y={YS + HS + 30} direction="ltr">
        0
      </text>
      <text className="iq-scene__num" x={Math.max(X0 + 50, end)} y={YS + HS + 30} direction="ltr">
        {cur.a}
      </text>
    </g>
  );
}

/**
 * The staircase: one column per gap already seen — as many small cells as were left — with the gap under it and the
 * number left over it. `said[k]` = what he had said for that gap (null: nothing was asked). The next gap is a « ? ».
 */
function Stairs({ steps, upto, b, said, pending }) {
  const w = SPAN / steps.length;
  const s = Math.max(5, Math.min(16, Math.floor(ROOM / Math.max(1, b - 1)) - 2));
  const x = (k) => X0 + (k + 0.5) * w;
  return (
    <g
      data-iq-stairs={steps
        .slice(0, upto + 1)
        .map((st) => st.r)
        .join(',')}
    >
      <line className="iq-cyc-base" x1={X0} y1={YB} x2={X0 + SPAN} y2={YB} />
      {steps.slice(0, upto + 1).map((st, k) => {
        const top = YB - 4 - st.r * (s + 2);
        const miss = said[k] != null && said[k] !== st.r;
        return (
          <g key={st.a} data-iq-col={`${st.a}:${st.r}`}>
            {Array.from({ length: st.r }, (_, j) => (
              <rect
                key={j}
                className="iq-cyc-left"
                x={x(k) - s / 2}
                y={YB - 4 - (j + 1) * (s + 2) + 2}
                width={s}
                height={s}
                rx="2"
              />
            ))}
            {st.wraps && (
              <rect className="iq-cyc-plank" x={x(k) - w * 0.36} y={YB - 12} width={w * 0.72} height="9" rx="3" />
            )}
            <text
              className={`iq-cyc-val ${miss ? 'is-miss' : ''}`}
              x={x(k) - (miss ? 12 : 0)}
              y={(st.wraps ? YB - 14 : top) - 6}
              direction="ltr"
            >
              {st.r}
            </text>
            {miss && (
              <text className="iq-cyc-said" x={x(k) + 14} y={(st.wraps ? YB - 14 : top) - 6} direction="ltr">
                {said[k]}
              </text>
            )}
            <text className="iq-cyc-gap" x={x(k)} y={YB + 24} direction="ltr">
              {st.a}
            </text>
          </g>
        );
      })}
      {pending && upto + 1 < steps.length && (
        <g data-iq-col-next={steps[upto + 1].a}>
          <text className="iq-cyc-val is-next" x={x(upto + 1)} y={YB - 12}>
            ?
          </text>
          <text className="iq-cyc-gap" x={x(upto + 1)} y={YB + 24} direction="ltr">
            {steps[upto + 1].a}
          </text>
        </g>
      )}
    </g>
  );
}

/**
 * The screen for a state of the experiment. `act` = { say(n), next(), max(text), same(v), grow() } — what the buttons
 * do; `maxIn` = the text of the probe's box.
 */
export function CycleView({ spec, state, act, maxIn = '' }) {
  const T = spec.text;
  const s = state;
  const now = cycleNow(spec, s);
  const { b, steps } = now;
  const cur = steps[s.i];
  const u = SPAN / steps.at(-1).a;
  const inRound = s.part === 'round';
  const total = spec.rounds.length + (spec.probes ?? []).length;
  const index = inRound ? s.ri : spec.rounds.length + s.pi;
  const guessing = inRound && (s.stage === 'guess' || s.stage === 'lay');
  const next = guessing ? steps[s.i + 1] : null;
  // what he had said for each gap of the round (the first gap is shown, not asked); a probe asks nothing gap by gap
  const said = inRound ? [null, ...s.guesses.map((g) => g.said)] : [];
  const lastSaid = inRound && s.i > 0 ? s.guesses[s.i - 1].said : null;
  const probe = !inRound && s.stage === 'seen' ? s.probes.at(-1) : null;
  const lead = inRound ? T.lead(b, now.from, steps.length) : T.probeLead(b, now.start);
  const fact = inRound
    ? s.i === 0
      ? T.start({ ...cur, b })
      : T.grew({ ...cur, b, said: lastSaid })
    : probe
      ? T.probeSeen(probe)
      : s.stage === 'run' && s.i > 0
        ? T.grew({ ...cur, b, said: null })
        : T.start({ ...cur, b });
  const isLast = index + 1 >= total;
  const lines = [
    ...s.rounds.map((r) => ({ key: `r${r.b}-${r.from}`, text: T.foundLine(r) })),
    ...s.probes.map((p) => ({
      key: `p${p.b}`,
      text: T.probeLine(p),
      // shown dim when one of the two things he said is not what the strip then did
      fell: !(probeSaid(p).max && probeSaid(p).same),
    })),
  ];

  return (
    <section
      className="iq iq--div iq--cycle"
      data-iq="cycle"
      data-iq-part={s.part}
      data-iq-stage={s.stage}
      data-iq-plank={b}
      data-iq-gap={cur.a}
    >
      <Head i={index} n={total} lead={lead} goal={T.goal(b)} />

      <svg className="iq-scene" viewBox="0 0 1000 270" role="img" aria-label={`${cur.a} ÷ ${b}`}>
        <Strip cur={cur} b={b} u={u} adding={guessing} leftLabel={T.left} />
        <Stairs steps={steps} upto={s.i} b={b} said={said} pending={guessing} />
      </svg>

      <Calc items={[restTex(cur.a, b)]} />
      <p className="iq-fact" data-iq-fact>
        <MathText>{fact}</MathText>
      </p>

      <div className="iq-actions">
        {guessing && (
          <>
            <p className="iq-askline">
              <MathText>{T.ask({ a: next.a, b, from: cur.a, left: cur.r })}</MathText>
            </p>
            <div className="iq-chips" dir="ltr" data-iq-chips>
              {Array.from({ length: b + 2 }, (_, n) => (
                <button
                  key={n}
                  type="button"
                  className={`iq-chip ${s.stage === 'lay' && s.pending === n ? 'is-on' : ''}`}
                  onClick={() => act.say(n)}
                  disabled={s.stage !== 'guess'}
                  data-iq-say={n}
                >
                  {n}
                </button>
              ))}
            </div>
          </>
        )}
        {!inRound && s.stage === 'ask' && (
          <>
            <div className="iq-cyc-q">
              <p className="iq-askline">
                <MathText>{T.maxAsk({ b })}</MathText>
              </p>
              <div className="iq-tpl">
                <label>
                  <Num value={maxIn} onChange={act.max} w={2} data-iq-in="max" onKeyDown={onEnter(act.grow)} />
                  <small>{T.maxUnit}</small>
                </label>
              </div>
            </div>
            <div className="iq-cyc-q">
              <p className="iq-askline">
                <MathText>{T.sameAsk({ b })}</MathText>
              </p>
              <div className="iq-cyc-yn">
                <YesNo T={T} onSay={act.same} value={s.same} hook="data-iq-same" />
              </div>
            </div>
            <button
              type="button"
              className="rf-btn rf-btn--main"
              onClick={act.grow}
              disabled={s.max === null || s.same === null}
              data-iq-grow
            >
              {T.grow}
            </button>
          </>
        )}
        {s.stage === 'seen' && (
          <button type="button" className="rf-btn rf-btn--main" onClick={act.next} data-iq-next>
            {isLast ? T.done : inRound && s.ri + 1 >= spec.rounds.length ? T.toProbe : T.next}
          </button>
        )}
      </div>

      <Found lines={lines} />
    </section>
  );
}

/** How long the world takes for one cell of a probe. */
const BEAT = 300;

export function Cycle({ spec, play, onDone }) {
  const [state, dispatch] = useReducer((s, a) => cycleReducer(spec, s, a), undefined, initCycle);
  const later = useLater();
  const now = cycleNow(spec, state);
  expose({
    kind: 'cycle',
    part: state.part,
    ri: state.ri,
    pi: state.pi,
    i: state.i,
    stage: state.stage,
    b: now.b,
    steps: now.steps,
    max: largestLeft(now.b),
    rounds: state.rounds,
    probes: state.probes,
  });

  /** What the world sounds like when the gap reaches a step: a plank where one went in, a count that climbs elsewhere. */
  const sound = (st) => play(st.wraps ? 'plank' : 'sweep', st.wraps ? st.q : st.r);
  const act = {
    say(n) {
      if (state.part !== 'round' || state.stage !== 'guess') return;
      play('pick');
      dispatch({ type: 'say', n });
      const st = now.steps[state.i + 1];
      later(420, () => {
        sound(st);
        dispatch({ type: 'shown' });
      });
    },
    max: (text) => dispatch({ type: 'max', n: asNumber(text) }),
    same(v) {
      play('pick');
      dispatch({ type: 'same', v });
    },
    grow() {
      if (state.part !== 'probe' || state.stage !== 'ask' || state.max === null || state.same === null) return;
      dispatch({ type: 'grow' });
      const last = now.steps.length - 1;
      for (let k = 1; k <= last; k += 1)
        later(k * BEAT, () => {
          sound(now.steps[k]);
          dispatch({ type: 'tick' });
        });
      const said = probeSaid({ max: largestLeft(now.b), said: { max: state.max, same: state.same } });
      later(last * BEAT + 260, () => play(said.max && said.same ? 'key' : 'fail'));
    },
    next() {
      const after = cycleReducer(spec, state, { type: 'next' });
      if (after.done) onDone(cycleResult(after));
      else dispatch({ type: 'next' });
    },
  };

  return <CycleView spec={spec} state={state} act={act} maxIn={state.max === null ? '' : String(state.max)} />;
}
