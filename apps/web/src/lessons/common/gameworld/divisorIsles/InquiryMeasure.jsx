/**
 * THE INVESTIGATION `measure` of this world (see `Inquiry.jsx`, which mounts it; logic and state machine: `measure.js`).
 * Two gaps one above the other are ONE fraction — the upper strip the numerator, the lower the denominator. A plank that
 * fills both is a UNIT: the world counts both strips again in it, re-draws them as that many planks and writes the new
 * fraction beside the old one with « = ».
 *
 *   stages  he goes on, plank after plank, by the road he chooses, and ends a run by claiming that no plank but 1 fills
 *           both (the world tries the planks of the upper strip on the lower one). Before a second run by another road he
 *           predicts where it will end.
 *   direct  one stage only: which plank? A plank that leaves a fraction still to count is laid honestly, the world shows
 *           a plank that still fills both, and he starts again from the fraction given.
 *
 * `spec.text` is the lesson's wording (GAME_WORLD.md « استكشف », spec shape of `measure`). Nothing here states a rule:
 * every sentence says what the strips have just done. The screen is a pure VIEW of the reducer's state (`MeasureView`).
 * `FracTpl` (a typed fraction in its own shape: two boxes over a bar) and `chainTex` are shared with `InquiryPart.jsx`.
 */
import { useReducer, useState } from 'react';
import MathText from '../../components/MathText';
import { Num } from '../kit/parts';
import { initMeasure, measureNow, measureReducer, measureResult, checkOf, countAgain } from './measure';
import { Span, restTex } from './InquiryCombine';
import { Head, Found, asNumber, onEnter } from './InquiryDivision';
import { expose, X0, SPAN, useLater } from './inquiryParts';
import './inquiryMeasure.css';

/** The two strips and the fraction bar between them, in a 1000 × 176 scene. */
const YA = 34;
const YBAR = 94;
const YB = 128;

/** A fraction written with a real bar (KaTeX), and a chain of equal fractions — one formula, never broken. */
const fracTex = ([p, q]) => `\\dfrac{${p}}{${q}}`;
export const chainTex = (chain) => chain.map(fracTex).join(' = ');

/**
 * A typed fraction in its own shape: two boxes over a real bar, read top then bottom. The boxes are `data-iq-in="num"`
 * and `data-iq-in="den"` (one template on screen at a time).
 */
export function FracTpl({ num, den, onNum, onDen, w = 3, onEnter: enter }) {
  return (
    <span className="iq-fracin" dir="ltr">
      <Num value={num} onChange={onNum} w={w} data-iq-in="num" onKeyDown={onEnter(enter)} />
      <span className="iq-fracin__bar" aria-hidden="true" />
      <Num value={den} onChange={onDen} w={w} data-iq-in="den" onKeyDown={onEnter(enter)} />
    </span>
  );
}

const same = (x, y) => x && y && x[0] === y[0] && x[1] === y[1];

/** The plank lying on the strips now, in the CURRENT unit (null: the strips show their own planks or cells). */
function laidNow(s) {
  if (s.stage === 'lay') return s.pending;
  if (s.check && s.check.shown > 0 && same(s.check.at, s.cur)) return s.check.tried[s.check.shown - 1].d;
  if (s.last && same(s.last.at, s.cur)) return s.last.d;
  return null;
}

/** One strip in the current unit: its cells (or, once counted again, its planks), a plank laid on it, its count. */
function Strip({ n, unitPx, d, counted, y, tag, k }) {
  return (
    <g data-iq-strip={tag} data-iq-count={n}>
      <Span key={k} n={n} d={d ?? (counted ? 1 : 0)} u={unitPx} y={y} laid={Boolean(d) || counted} />
      <text className="iq-scene__num" x={X0 + n * unitPx} y={y - 12} direction="ltr">
        {n}
      </text>
    </g>
  );
}

/** The fact line: what the world has just done, in the lesson's words. */
function factOf(T, now, s) {
  const { a, b, mode } = now;
  const [p, q] = s.cur;
  if (s.notice?.kind === 'bound') return T.bound({ a, b, p, q, max: Math.max(p, q) });
  if (s.notice?.kind === 'same') return T.sameRoad({ a, b, d: s.notice.d, used: s.runs.map((r) => r.stages[0]?.d) });
  if (s.stage === 'lay' || s.stage === 'checkRun') return ' ';
  const check = s.check && { p: s.check.at[0], q: s.check.at[1], tried: s.check.tried, found: s.check.found };
  if (s.stage === 'again') {
    const r = s.runs.at(-1);
    return T.notEnough({ a, b, d: r.stages[0].d, end: r.end, ...check });
  }
  if (s.stage === 'predict' || s.stage === 'seen') {
    const r = s.runs.at(-1);
    const ends = s.runs.map((x) => x.end);
    return T.runEnd({
      a,
      b,
      mode,
      run: s.runs.length - 1,
      end: r.end,
      chain: s.chain,
      predicted: r.predicted,
      same: ends.every((e) => same(e, ends[0])),
      ...check,
    });
  }
  if (check && check.found !== null) return T.checkSeen({ a, b, ...check });
  if (s.last) {
    if (same(s.last.at, s.cur)) return T.refused({ a, b, p, q, ...s.last });
    const st = s.stages.at(-1);
    if (st) return T.counted({ a, b, d: st.d, from: st.from, to: st.to, stage: s.stages.length });
  }
  return ' ';
}

/**
 * The screen for a state of the experiment. `act` = { type(field, text), pick(d), lay(), end(), predict(), again(),
 * next() } — what the boxes and buttons do; `input` = { plank, num, den } — the text of the boxes.
 */
export function MeasureView({ spec, state, act, input = { plank: '', num: '', den: '' } }) {
  const T = spec.text;
  const s = state;
  const now = measureNow(spec, s);
  const { a, b, mode } = now;
  const [p, q] = s.cur;
  const u = SPAN / Math.max(a, b);
  const unitPx = (a / p) * u;
  const d = laidNow(s);
  const counted = s.stages.length > 0;
  const k = `${s.runs.length}-${s.stages.length}-${s.stage}-${d ?? 0}-${s.check?.shown ?? 0}`;
  const isLast = s.ri + 1 >= spec.rounds.length;
  const refusedHere = new Set(s.refused.filter((r) => same(r.at, s.cur)).map((r) => r.d));
  // the divisions of the plank on the strips, or of the plank that has just counted them again
  const lastStage = s.stages.at(-1);
  const divisions = d
    ? [restTex(p, d), restTex(q, d)]
    : counted && s.last && !same(s.last.at, s.cur)
      ? [restTex(lastStage.from[0], lastStage.d), restTex(lastStage.from[1], lastStage.d)]
      : [];
  const chain = chainTex(s.chain);
  const checkShown = s.check ? s.check.tried.slice(0, s.check.shown) : [];
  const showCheck = s.check && ['checkRun', 'again', 'predict', 'seen'].includes(s.stage);

  return (
    <section
      className="iq iq--div iq--measure"
      data-iq="measure"
      data-iq-stage={s.stage}
      data-iq-mode={mode}
      data-iq-pair={`${a}:${b}`}
      data-iq-frac={`${p}:${q}`}
      data-iq-run={s.runs.length}
    >
      <Head i={s.ri} n={spec.rounds.length} lead={T.lead(a, b, mode)} goal={T.goal(a, b, mode)} />

      <svg className="iq-scene" viewBox="0 0 1000 176" role="img" aria-label={`${p}\u00a0/\u00a0${q}`}>
        <Strip n={p} unitPx={unitPx} d={d} counted={counted} y={YA} tag="a" k={`a${k}`} />
        <line className="iq-meas-bar" x1={X0} y1={YBAR} x2={X0 + Math.max(a, b) * u} y2={YBAR} />
        <Strip n={q} unitPx={unitPx} d={d} counted={counted} y={YB} tag="b" k={`b${k}`} />
      </svg>

      <div className="iq-meas-calc" dir="ltr" data-iq-calc>
        <span className="iq-meas-chain" data-iq-chain={s.chain.map((f) => f.join('/')).join(',')}>
          <MathText>{`$${chain}$`}</MathText>
        </span>
        {divisions.map((tex) => (
          <span key={tex} className="iq-meas-div">
            <MathText>{`$${tex}$`}</MathText>
          </span>
        ))}
      </div>
      <p className="iq-fact" data-iq-fact>
        <MathText>{factOf(T, now, s)}</MathText>
      </p>

      <div className="iq-actions">
        {s.stage === 'pick' && (
          <>
            <p className="iq-askline">
              <MathText>{T.pickAsk({ a, b, p, q, mode, stage: s.stages.length, run: s.runs.length })}</MathText>
            </p>
            {now.chips && (
              <div className="iq-chips" dir="ltr">
                {now.chips.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`iq-chip iq-chip--s ${refusedHere.has(c) ? 'is-no' : ''}`}
                    onClick={() => act.pick(c)}
                    data-iq-chip={c}
                    data-iq-chip-state={refusedHere.has(c) ? 'no' : ''}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
            <div className="iq-tpl" dir="rtl">
              <label>
                <Num
                  value={input.plank}
                  onChange={(v) => act.type('plank', v)}
                  w={String(Math.max(p, q)).length}
                  data-iq-in="plank"
                  onKeyDown={onEnter(act.lay)}
                />
                <small>{T.unit}</small>
              </label>
            </div>
            <button type="button" className="rf-btn rf-btn--main" onClick={act.lay} data-iq-lay>
              {T.lay}
            </button>
            {mode === 'stages' && (
              <button type="button" className="rf-btn" onClick={act.end} data-iq-end>
                {T.end}
              </button>
            )}
          </>
        )}
        {showCheck && (
          <div className="iq-meas-check" data-iq-check={checkShown.map((t) => `${t.d}:${t.fills ? 1 : 0}`).join(',')}>
            <small>{T.checkLabel({ p: s.check.at[0], q: s.check.at[1] })}</small>
            <div className="iq-chips" dir="ltr">
              {checkShown.map((t) => (
                <span
                  key={t.d}
                  className={`iq-chip iq-chip--s iq-meas-tried ${t.fills ? 'is-fills' : 'is-no'}`}
                  data-iq-tried={t.d}
                >
                  {t.d}
                </span>
              ))}
            </div>
          </div>
        )}
        {s.stage === 'predict' && (
          <>
            <p className="iq-askline">
              <MathText>{T.predictAsk({ a, b, run: s.runs.length, ends: s.runs.map((r) => r.end) })}</MathText>
            </p>
            <FracTpl
              num={input.num}
              den={input.den}
              onNum={(v) => act.type('num', v)}
              onDen={(v) => act.type('den', v)}
              w={String(Math.max(a, b)).length}
              onEnter={act.predict}
            />
            <button type="button" className="rf-btn rf-btn--main" onClick={act.predict} data-iq-predict>
              {T.predictGo}
            </button>
          </>
        )}
        {s.stage === 'again' && (
          <button type="button" className="rf-btn rf-btn--main" onClick={act.again} data-iq-again>
            {T.again}
          </button>
        )}
        {s.stage === 'seen' && (
          <button type="button" className="rf-btn rf-btn--main" onClick={act.next} data-iq-next>
            {isLast ? T.done : T.next}
          </button>
        )}
      </div>

      <Found
        lines={[
          ...s.rounds.map((r) => ({ key: `r${r.a}-${r.b}-${r.mode}`, text: T.foundLine(r) })),
          // the runs of this round already ended (stages: each road; direct: each attempt) — kept while he goes on
          ...(s.stage === 'seen' ? [] : s.runs).map((r, i) => ({
            // eslint-disable-next-line react/no-array-index-key -- the runs of a round only grow
            key: `u${i}`,
            text: T.runLine({ run: i, chain: chainTex([[a, b], ...r.stages.map((x) => x.to)]), end: r.end }),
            fell: r.checks.at(-1)?.found != null,
          })),
        ]}
      />
    </section>
  );
}

/** How long the world takes for one plank it tries on its own. */
const BEAT = 420;

export function Measure({ spec, play, onDone }) {
  const [state, dispatch] = useReducer((s, a) => measureReducer(spec, s, a), spec, initMeasure);
  const [input, setInput] = useState({ plank: '', num: '', den: '' });
  const later = useLater();
  const now = measureNow(spec, state);
  expose({
    kind: 'measure',
    ri: state.ri,
    stage: state.stage,
    mode: now.mode,
    a: now.a,
    b: now.b,
    cur: state.cur,
    chain: state.chain,
    last: now.last,
    runs: state.runs,
    check: state.check && { at: state.check.at, found: state.check.found, shown: state.check.shown },
    rounds: state.rounds,
  });

  /** The world tries the planks of the upper strip on the lower one, one after the other; then `end`. */
  const runCheck = (tried, from, end) => {
    const count = Math.max(1, tried.length);
    for (let k = 1; k <= count; k += 1)
      later(from + k * BEAT, () => {
        if (tried[k - 1]) play(tried[k - 1].fills ? 'plank' : 'sweep', k);
        dispatch({ type: 'tick' });
      });
    later(from + count * BEAT + 300, end);
  };

  const pick = (d) => {
    if (state.stage !== 'pick') return;
    const after = measureReducer(spec, state, { type: 'try', d });
    dispatch({ type: 'try', d });
    if (after.stage !== 'lay') {
      play('pick');
      return;
    }
    play('sweep');
    setInput((v) => ({ ...v, plank: '' }));
    const [p, q] = state.cur;
    const to = countAgain(p, q, d);
    later(300, () => {
      play(to ? 'plank' : 'hit');
      dispatch({ type: 'shown' });
    });
    if (!to) return;
    later(900, () => play('spark'));
    if (now.mode !== 'direct') return;
    const c = checkOf(to[0], to[1]);
    runCheck(c.tried, 900, () => play(c.found === null ? 'gate' : 'crumble'));
  };

  const act = {
    type: (field, text) => setInput((v) => ({ ...v, [field]: text })),
    pick,
    lay: () => pick(asNumber(input.plank)),
    end() {
      if (state.stage !== 'pick' || now.mode !== 'stages') return;
      play('pick');
      dispatch({ type: 'end' });
      const c = checkOf(state.cur[0], state.cur[1]);
      runCheck(c.tried, 0, () => {
        // his claim « no plank but 1 » against what the world found
        play(c.found === null ? 'success' : 'crumble');
        if (c.found !== null) return;
        later(400, () => play('gate'));
        // the prediction of this road against where it ended
        if (state.predicted) later(800, () => play(same(state.predicted, state.cur) ? 'key' : 'fail'));
      });
    },
    predict() {
      const p = asNumber(input.num);
      const q = asNumber(input.den);
      if (state.stage !== 'predict' || !p || !q) return;
      play('pick');
      setInput((v) => ({ ...v, num: '', den: '' }));
      dispatch({ type: 'predict', p, q });
    },
    again() {
      play('pick');
      dispatch({ type: 'again' });
    },
    next() {
      const after = measureReducer(spec, state, { type: 'next' });
      if (after.done) onDone(measureResult(after));
      else {
        setInput({ plank: '', num: '', den: '' });
        dispatch({ type: 'next' });
      }
    },
  };

  return <MeasureView spec={spec} state={state} act={act} input={input} />;
}
