/**
 * THE INVESTIGATION `summit` of this world (see `Inquiry.jsx`, which mounts it; logic and state machine: `summit.js`).
 * Two gaps and ONE plank for both: a search for the LONGEST plank that fills both, and the reason the search may stop.
 *
 *   free     he types any plank length; the world lays it on both strips and writes both divisions; every try stays as a
 *            mark on a LINE OF LENGTHS (1 … the shorter gap), coloured by what the plank did.
 *   outside  one prediction: can a plank that does not fill the shorter gap fill both? A plank laid answers.
 *   descent  the planks of the shorter gap, longest first; before each he says whether it fills the other gap; the first
 *            that does is crowned (gold). Then: must the shorter ones still be tried? On yes the world lays them all.
 *   first    (mode) before the descent he types how many planks will be tried; he predicts the first, the world goes on.
 *
 * `spec.text` is the lesson's wording (GAME_WORLD.md « Explore », spec shape of `summit`). Nothing here states a rule:
 * every sentence says what the strips have just done. The screen is a pure VIEW of the reducer's state (`SummitView`).
 */
import { useReducer, useState } from 'react';
import MathText from '../../components/MathText';
import { Num } from '../kit/parts';
import { initSummit, summitNow, summitReducer, summitResult, plankOn } from './summit';
import { Span, Calc, restTex } from './InquiryCombine';
import { Head, Found, asNumber, onEnter } from './InquiryDivision';
import { expose, X0, SPAN, useLater, YesNo } from './inquiryParts';
import './inquirySummit.css';

/** The two strips and the line of lengths, in a 1000 × 270 scene. */
const YA = 30;
const YB = 96;
const YL = 222;
const H = 30;

/** A gap with a plank laid on it; a plank too thin to draw one by one is drawn as one filled bar. */
function Gap({ n, d, u, y, tag }) {
  const thin = d && d * u < 3 && Math.floor(n / d) > 0;
  return (
    <g data-iq-strip={tag}>
      <Span key={d ?? 0} n={n} d={d} u={u} y={y} laid={Boolean(d)} />
      {thin && (
        <rect
          className="iq-plank iq-plank--drop"
          x={X0}
          y={y - 4}
          width={Math.floor(n / d) * d * u}
          height={H + 8}
          rx="4"
        />
      )}
      <text className="iq-scene__num" x={X0 + n * u} y={y - 12} direction="ltr">
        {n}
      </text>
    </g>
  );
}

/** Where a length stands on the line: 1 … short on the main part, short … long on a dashed tail. */
function lineX(short, long) {
  const main = short < long ? SPAN * 0.84 : SPAN;
  return (d) =>
    d <= short
      ? X0 + (short > 1 ? ((d - 1) / (short - 1)) * main : 0)
      : X0 + main + ((d - short) / (long - short)) * (SPAN - main);
}

/** Three rows for the numbers of the marks (above, below, higher), so that close lengths never print on each other. */
const ROWS = [YL - 16, YL + 30, YL - 40];
const wide = (d) => 12 * String(d).length + 8;
function placeLabels(marks, x, ends) {
  // a copy: the labels placed in the row of the ends must not join the ends themselves (they were drawn as empty ends)
  const taken = ROWS.map((_, i) => (i === 1 ? [...ends] : []));
  return marks.map((m) => {
    // a mark standing on an end (1, the shorter gap, the longer gap): its number is already written there, under the line
    if (ends.some((e) => e.d === m.d)) return { ...m, x: x(m.d), y: null };
    const at = x(m.d);
    const fits = (r) => taken[r].every((o) => Math.abs(o.x - at) >= (o.w + wide(m.d)) / 2 + 4);
    const row = [0, 1, 2].find(fits) ?? 2;
    taken[row].push({ x: at, w: wide(m.d) });
    return { ...m, x: at, y: ROWS[row] };
  });
}

/**
 * The line of lengths: one mark per plank laid (his tries and the world's), coloured by what it did — both gaps, the
 * gap a only, the gap b only, neither. The best plank so far is ringed; the crowned plank is gold.
 */
function Lengths({ short, long, marks, best, crown, label }) {
  const x = lineX(short, long);
  const ends = [
    { x: x(1), w: wide(1), d: 1 },
    { x: x(short), w: wide(short), d: short },
    ...(short < long ? [{ x: x(long), w: wide(long), d: long }] : []),
  ];
  const placed = placeLabels(marks, x, ends);
  return (
    <g data-iq-lengths={marks.map((m) => `${m.d}:${m.kind}`).join(',')}>
      <text className="iq-sum-linelabel" x={X0} y={YL - 62}>
        {label}
      </text>
      <line className="iq-sum-line" x1={x(1)} y1={YL} x2={x(short)} y2={YL} />
      {short < long && <line className="iq-sum-line is-tail" x1={x(short)} y1={YL} x2={x(long)} y2={YL} />}
      {ends.map((e) => (
        <text key={`e${e.d}`} className="iq-sum-end" x={e.x} y={ROWS[1]} direction="ltr">
          {e.d}
        </text>
      ))}
      {placed.map((m) => {
        const cls = m.d === crown ? 'is-crown' : `is-${m.kind}`;
        return (
          <g key={m.d} className={`iq-sum-mark ${cls}`} data-iq-mark={m.d} data-iq-kind={m.kind}>
            <line x1={m.x} y1={YL - 9} x2={m.x} y2={YL + 9} />
            <circle cx={m.x} cy={YL} r={m.d === crown ? 9 : 6.5} />
            {m.d === best && m.d !== crown && (
              <circle className="iq-sum-best" cx={m.x} cy={YL} r="12" data-iq-best={m.d} />
            )}
            {m.y != null && (
              <text x={m.x} y={m.y} direction="ltr">
                {m.d}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}

/** Every plank laid so far in the round, in order (a later one replaces nothing: one mark per length). */
function marksOf(now, s) {
  const laid = [
    ...(now.start ? [plankOn(now.a, now.b, now.start)] : []),
    ...s.tries,
    ...(s.outside ? [s.outside] : []),
    ...s.descent.map((p) => plankOn(now.a, now.b, p.d)),
    ...now.rest.slice(0, s.restShown).map((d) => plankOn(now.a, now.b, d)),
  ];
  const byD = new Map();
  laid.forEach((p) => byD.set(p.d, { d: p.d, kind: p.kind }));
  return [...byD.values()];
}

const DESCENT = new Set(['descent', 'descentLay', 'run', 'rest', 'restRun', 'seen']);

/** The fact line: what the world has just done, in the lesson's words. */
function factOf(T, now, s) {
  const { a, b, short, long } = now;
  const lastDescent = s.descent.at(-1);
  const crowned = { a, b, short, long, crown: s.crown, tries: s.descent.length, guessCount: s.guessCount };
  if (s.stage === 'seen') {
    if (now.mode === 'first') return T.countSeen({ ...crowned, said: s.guessCount });
    if (s.checkedRest == null) return T.crowned(crowned);
    return T.restSeen({ ...crowned, rest: now.rest, checked: s.checkedRest });
  }
  if (s.stage === 'rest' || s.stage === 'restRun') return T.crowned(crowned);
  if (s.stage === 'freeLay' || s.stage === 'outsideLay' || s.stage === 'descentLay') return ' ';
  if (lastDescent)
    return T.descentSeen({ a, b, short, long, ...plankOn(a, b, lastDescent.d), guess: lastDescent.guess });
  if (s.outside) return T.outsideSeen({ a, b, short, long, ...s.outside });
  if (s.refused !== null && s.stage === 'free') return T.freeBound({ a, b, max: long });
  const t = s.tries.at(-1);
  if (t) return T.tried({ a, b, ...t, best: s.best, isBest: t.both && t.d === s.best });
  if (s.last) return T.start({ a, b, ...s.last });
  return ' ';
}

/**
 * The screen for a state of the experiment. `act` = { type(field, text), lay(), say(v), go(), count(), next() } — what
 * the boxes and buttons do; `input` = { free, count } — the text of the two boxes.
 */
export function SummitView({ spec, state, act, input = { free: '', count: '' } }) {
  const T = spec.text;
  const s = state;
  const now = summitNow(spec, s);
  const { a, b, short, long } = now;
  const u = SPAN / long;
  const d = s.last?.d;
  const asked = s.stage === 'descent' ? now.planks[s.descent.length] : null;
  const isLast = s.ri + 1 >= spec.rounds.length;

  const chipState = (c) => {
    if (c === s.crown) return 'crown';
    const p = s.descent.find((x) => x.d === c);
    if (p) return 'no';
    if (now.rest.indexOf(c) > -1 && now.rest.indexOf(c) < s.restShown) return 'shorter';
    return c === asked ? 'now' : '';
  };

  return (
    <section
      className="iq iq--div iq--summit"
      data-iq="summit"
      data-iq-stage={s.stage}
      data-iq-mode={now.mode}
      data-iq-pair={`${a}:${b}`}
      {...(s.crown != null ? { 'data-iq-crown': s.crown } : {})}
    >
      <Head i={s.ri} n={spec.rounds.length} lead={T.lead(a, b, now.mode)} goal={T.goal(a, b)} />

      <svg className="iq-scene" viewBox="0 0 1000 270" role="img" aria-label={`${a} · ${b}`}>
        <Gap n={a} d={d} u={u} y={YA} tag="a" />
        <Gap n={b} d={d} u={u} y={YB} tag="b" />
        <Lengths short={short} long={long} marks={marksOf(now, s)} best={s.best} crown={s.crown} label={T.line} />
      </svg>

      <Calc items={s.last ? [restTex(a, d), restTex(b, d)] : []} />
      <p className="iq-fact" data-iq-fact>
        <MathText>{factOf(T, now, s)}</MathText>
      </p>

      {DESCENT.has(s.stage) && (
        <div className="iq-sum-chips" data-iq-planks={now.all.join(',')}>
          <small>{T.chipsLabel(short)}</small>
          {/* left to right: read after its label « from the longest to the shortest », the longest first, on the left */}
          <div className="iq-chips">
            {now.all.map((c) => {
              const st = chipState(c);
              return (
                <span
                  key={c}
                  className={`iq-chip iq-chip--s iq-sum-chip ${st ? `is-${st}` : ''}`}
                  data-iq-chip={c}
                  data-iq-chip-state={st}
                >
                  {c}
                </span>
              );
            })}
          </div>
        </div>
      )}

      <div className="iq-actions">
        {s.stage === 'free' && (
          <>
            <p className="iq-askline">
              <MathText>{T.freeAsk({ a, b, best: s.best, left: now.free - s.tries.length })}</MathText>
            </p>
            <div className="iq-tpl">
              <label>
                <Num
                  value={input.free}
                  onChange={(v) => act.type('free', v)}
                  w={String(long).length}
                  data-iq-in="free"
                  onKeyDown={onEnter(act.lay)}
                />
                <small>{T.unit}</small>
              </label>
            </div>
            <button type="button" className="rf-btn rf-btn--main" onClick={act.lay} data-iq-lay>
              {T.lay}
            </button>
          </>
        )}
        {(s.stage === 'outside' || s.stage === 'descent' || s.stage === 'rest') && (
          <>
            <p className="iq-askline">
              <MathText>
                {s.stage === 'outside'
                  ? T.outsideAsk({ a, b, short, long })
                  : s.stage === 'descent'
                    ? T.descentAsk({ a, b, short, long, d: asked })
                    : T.restAsk({ a, b, short, long, crown: s.crown, rest: now.rest.length })}
              </MathText>
            </p>
            <YesNo T={T} onSay={act.say} hook={s.stage === 'rest' ? 'data-iq-rest' : 'data-iq-say'} />
          </>
        )}
        {s.stage === 'outsideSeen' && (
          <button type="button" className="rf-btn rf-btn--main" onClick={act.go} data-iq-go>
            {T.go}
          </button>
        )}
        {s.stage === 'count' && (
          <>
            <p className="iq-askline">
              <MathText>{T.countAsk({ a, b, short, long })}</MathText>
            </p>
            <div className="iq-tpl">
              <label>
                <Num
                  value={input.count}
                  onChange={(v) => act.type('count', v)}
                  w={2}
                  data-iq-in="count"
                  onKeyDown={onEnter(act.count)}
                />
                <small>{T.countUnit}</small>
              </label>
            </div>
            <button type="button" className="rf-btn rf-btn--main" onClick={act.count} data-iq-count>
              {T.countGo}
            </button>
          </>
        )}
        {s.stage === 'seen' && (
          <button type="button" className="rf-btn rf-btn--main" onClick={act.next} data-iq-next>
            {isLast ? T.done : T.next}
          </button>
        )}
      </div>

      <Found lines={s.rounds.map((r) => ({ key: `${r.a}-${r.b}-${r.mode}`, text: T.foundLine(r) }))} />
    </section>
  );
}

/** How long the world takes for one plank it lays on its own. */
const BEAT = 420;

export function Summit({ spec, play, onDone }) {
  const [state, dispatch] = useReducer((s, a) => summitReducer(spec, s, a), spec, initSummit);
  const [input, setInput] = useState({ free: '', count: '' });
  const later = useLater();
  const now = summitNow(spec, state);
  expose({
    kind: 'summit',
    ri: state.ri,
    stage: state.stage,
    a: now.a,
    b: now.b,
    mode: now.mode,
    best: state.best,
    tries: state.tries.length,
    planks: now.planks,
    crown: state.crown,
    rest: now.rest,
    rounds: state.rounds,
  });

  /** The world lays its own planks one after the other (the descent of mode `first`, or the shorter ones). */
  const run = (count, from, end) => {
    for (let k = 1; k <= count; k += 1)
      later(from + k * BEAT, () => {
        play('sweep', k);
        dispatch({ type: 'tick' });
      });
    later(from + count * BEAT + 300, end);
  };

  const act = {
    type: (field, text) => setInput((v) => ({ ...v, [field]: text })),
    lay() {
      if (state.stage !== 'free') return;
      const d = asNumber(input.free);
      const after = summitReducer(spec, state, { type: 'try', d });
      dispatch({ type: 'try', d });
      if (after.stage !== 'freeLay') {
        play('pick');
        return;
      }
      play('sweep');
      setInput((v) => ({ ...v, free: '' }));
      const t = plankOn(now.a, now.b, d);
      later(300, () => {
        play('plank');
        dispatch({ type: 'shown' });
      });
      if (t.both && (state.best == null || d > state.best)) later(900, () => play('spark'));
    },
    say(v) {
      const { stage } = state;
      if (stage !== 'outside' && stage !== 'descent' && stage !== 'rest') return;
      play('pick');
      dispatch({ type: 'say', v });
      if (stage === 'rest') {
        if (v) run(now.rest.length, 0, () => {});
        return;
      }
      const truth = stage === 'outside' ? false : now.long % now.planks[state.descent.length] === 0;
      later(350, () => {
        play('plank');
        dispatch({ type: 'shown' });
      });
      later(1000, () => play(v === truth ? 'success' : 'crumble'));
      if (stage !== 'descent') return;
      if (truth) {
        later(1300, () => play('gate'));
        if (now.mode === 'first') later(1800, () => play(state.guessCount === now.tries ? 'key' : 'fail'));
        return;
      }
      if (now.mode === 'first') {
        const left = now.tries - state.descent.length - 1;
        run(left, 1000, () => {
          play('gate');
          later(500, () => play(state.guessCount === now.tries ? 'key' : 'fail'));
        });
      }
    },
    go() {
      play('pick');
      dispatch({ type: 'go' });
    },
    count() {
      const n = asNumber(input.count);
      if (state.stage !== 'count' || n == null || n < 1) return;
      play('pick');
      dispatch({ type: 'count', n });
    },
    next() {
      const after = summitReducer(spec, state, { type: 'next' });
      if (after.done) onDone(summitResult(after));
      else {
        setInput({ free: '', count: '' });
        dispatch({ type: 'next' });
      }
    },
  };

  return <SummitView spec={spec} state={state} act={act} input={input} />;
}
