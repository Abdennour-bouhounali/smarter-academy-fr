/**
 * FOUR MODES of the investigations of the greatest common divisor (logic and state machines: `gcdModes.js`; mounted by
 * `InquiryGcd.jsx › Common | Ladder | Nest` when `spec.mode` names one of them — a spec without these modes never reaches
 * this file). Each screen is a pure VIEW of its reducer (`WitnessView`, `PairView`, `FoldView`, `BothView`).
 *
 *   common · witness  the tray is the planks the divisibility rules give; one plank on the shelf « both » ends the round
 *                     and the world asks « is one enough? »; a tray where none fills both ends on that fact alone.
 *   nest   · pair     four strips: the pair (a ; b) and a second pair; for each probe two predictions (fills both of the
 *                     first pair? of the second?), the world lays it on the four strips; the two lists side by side.
 *   ladder · fold     a subtraction ladder; the rows that take away the same gap are folded by him into a = b × □ + □;
 *                     the world finishes the ladder in folded lines.
 *   ladder · both     the subtraction and the division ladders of one pair, side by side, drawn as bars that shrink to fit
 *                     ONE screen however many rows; he predicts which is shorter and by how many rows before they run.
 *                     On a workshop's bench it starts where he left it (`spec.from` / `spec.onState`).
 *
 * `spec.text` is the lesson's wording (GAME_WORLD.md « استكشف », spec shapes of `common`, `ladder`, `nest`). Nothing
 * here states a rule: every sentence says what the strips, the shelves or the ladders have just done.
 */
import { useEffect, useReducer, useState } from 'react';
import MathText from '../../components/MathText';
import { Num } from '../kit/parts';
import { commonPlanks } from './inquiry';
import {
  initWitness,
  witnessNow,
  witnessReducer,
  witnessResult,
  initPair,
  pairNow,
  pairReducer,
  pairResult,
  initFold,
  foldNow,
  foldReducer,
  foldResult,
  bothStart,
  bothNow,
  bothReducer,
  bothResult,
} from './gcdModes';
import { Calc, restTex } from './InquiryCombine';
import { Head, Found, asNumber, onEnter } from './InquiryDivision';
import { Strip, Shelves, RungBar } from './InquiryGcd';
import { INQUIRY_TEXT } from './strings';
import { expose, SPAN, FAST, useLater, YesNo } from './inquiryParts';
import './inquiryGcdModes.css';

/** The world's own steps (a row written, a folded line, a row of both ladders), shortened in the walks' fast mode. */
function useTick(active, ms, dispatch, deps) {
  useEffect(() => {
    if (!active) return undefined;
    const t = setTimeout(() => dispatch({ type: 'tick' }), FAST() ? 15 : ms);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one timer per state the world moves on from
  }, deps);
}

// ───────────────────────── common · witness ─────────────────────────
const YA = 40;
const YB = 128;

export function WitnessView({ spec, state: s, act }) {
  const T = spec.text;
  const now = witnessNow(spec, s);
  const { a, b } = now;
  const u = SPAN / Math.max(a, b);
  const last = s.placed.at(-1) ?? null;
  const d = s.stage === 'lay' ? s.hand : last?.d;
  const isLast = s.ri + 1 >= spec.rounds.length;
  const empty = T.empty ?? INQUIRY_TEXT.witnessEmpty;

  let fact = ' ';
  if (s.stage === 'seen')
    fact =
      s.witness != null
        ? T.enoughSeen({ a, b, d: s.witness, said: s.enough, tried: s.placed.length, left: now.tray.length })
        : empty({ a, b, tried: s.placed.length });
  else if (s.stage !== 'lay' && last) fact = T.seen({ a, b, ...last }, { a: last.guessA, b: last.guessB });

  return (
    <section
      className="iq iq--div iq--common iq--witness"
      data-iq="common"
      data-iq-mode="witness"
      data-iq-stage={s.stage}
      data-iq-crown="0"
      {...(s.witness != null ? { 'data-iq-witness': s.witness } : {})}
    >
      <Head i={s.ri} n={spec.rounds.length} lead={T.lead(a, b)} goal={T.goal(a, b)} />

      <svg className="iq-scene" viewBox="0 0 1000 190" role="img" aria-label={`${a} · ${b}`}>
        <Strip key={`a${d}`} n={a} d={d} u={u} y={YA} tag="a" />
        <Strip key={`b${d}`} n={b} d={d} u={u} y={YB} tag="b" />
      </svg>

      <Calc items={d ? [restTex(a, d), restTex(b, d)] : []} />
      <p className="iq-fact" data-iq-fact>
        <MathText>{fact}</MathText>
      </p>

      <Shelves
        T={T}
        a={a}
        b={b}
        rows={s.placed}
        tray={now.tray}
        placed={s.placed}
        hand={s.hand}
        stage={s.stage}
        crown={false}
        long={null}
        longest={null}
        onTake={act.take}
        onMark={() => {}}
      />

      <div className="iq-actions">
        {s.stage === 'take' && (
          <p className="iq-askline">
            <MathText>{T.take({ a, b })}</MathText>
          </p>
        )}
        {s.stage === 'guess' && (
          <>
            <p className="iq-askline">
              <MathText>{T.ask({ a, b, d: s.hand })}</MathText>
            </p>
            <span className="iq-side">{T.onA(a)}</span>
            <YesNo T={T} value={s.guessA} onSay={(v) => act.say('a', v)} hook="data-iq-say-a" />
            <span className="iq-side">{T.onB(b)}</span>
            <YesNo T={T} value={s.guessB} onSay={(v) => act.say('b', v)} hook="data-iq-say-b" />
            <button
              type="button"
              className="rf-btn rf-btn--main"
              onClick={act.lay}
              disabled={s.guessA == null || s.guessB == null}
              data-iq-lay
            >
              {T.lay}
            </button>
          </>
        )}
        {s.stage === 'enough' && (
          <>
            <p className="iq-askline">
              <MathText>{T.enoughAsk({ a, b, d: s.witness })}</MathText>
            </p>
            <YesNo T={T} onSay={act.enough} hook="data-iq-enough" />
          </>
        )}
        {s.stage === 'seen' && (
          <button type="button" className="rf-btn rf-btn--main" onClick={act.next} data-iq-next>
            {isLast ? T.done : T.next}
          </button>
        )}
      </div>

      <Found lines={s.rounds.map((r) => ({ key: `${r.a}-${r.b}`, text: T.foundLine(r) }))} />
    </section>
  );
}

export function Witness({ spec, play, onDone }) {
  const [state, dispatch] = useReducer((s, a) => witnessReducer(spec, s, a), spec, initWitness);
  const later = useLater();
  const now = witnessNow(spec, state);
  expose({
    kind: 'common',
    mode: 'witness',
    ri: state.ri,
    a: now.a,
    b: now.b,
    stage: state.stage,
    hand: state.hand,
    placed: state.placed.length,
    tray: now.tray,
    witness: state.witness,
    enough: state.enough,
    rounds: state.rounds,
  });
  const act = {
    take(d) {
      if (state.stage !== 'take') return;
      play('pick');
      dispatch({ type: 'take', d });
    },
    say: (side, v) => dispatch({ type: 'say', side, v }),
    lay() {
      if (state.stage !== 'guess' || state.guessA == null || state.guessB == null) return;
      const after = witnessReducer(spec, witnessReducer(spec, state, { type: 'lay' }), { type: 'shown' });
      const row = after.placed.at(-1);
      dispatch({ type: 'lay' });
      play('sweep');
      later(250, () => play('plank'));
      later(1300, () => {
        play(row.guessA === row.holdsA && row.guessB === row.holdsB ? 'success' : 'crumble');
        dispatch({ type: 'shown' });
        if (row.both) later(350, () => play('spark'));
        else if (after.stage === 'seen') later(350, () => play('gate'));
      });
    },
    enough(v) {
      if (state.stage !== 'enough') return;
      play('pick');
      dispatch({ type: 'enough', v });
      later(300, () => play('gate'));
    },
    next() {
      const after = witnessReducer(spec, state, { type: 'next' });
      if (after.done) onDone(witnessResult(after));
      else dispatch({ type: 'next' });
    },
  };
  return <WitnessView spec={spec} state={state} act={act} />;
}

// ───────────────────────── nest · pair ─────────────────────────
/** Four strips: the first pair above, the second below, each pair on its own pale band. */
const YP = [30, 84, 168, 222];

export function PairView({ spec, state: s, act }) {
  const T = spec.text;
  const now = pairNow(spec, s);
  const { a, b, x, y, p } = now;
  const u = SPAN / Math.max(a, b, x, y);
  const last = s.rows.at(-1) ?? null;
  const d = s.stage === 'lay' ? p : last?.p;
  const isLast = s.ri + 1 >= spec.rounds.length;
  const fact =
    s.stage === 'compare'
      ? T.compare({ a, b, x, y, first: now.first, second: now.second, equal: now.equal })
      : s.stage !== 'lay' && last
        ? T.seen({ a, b, x, y, ...last }, { first: last.guessFirst, second: last.guessSecond })
        : ' ';

  return (
    <section
      className="iq iq--div iq--pair"
      data-iq="nest"
      data-iq-mode="pair"
      data-iq-stage={s.stage}
      data-iq-probe={p}
      data-iq-pairs={`${a}:${b}|${x}:${y}`}
    >
      <Head i={s.ri} n={spec.rounds.length} lead={T.lead(a, b, [x, y])} goal={T.goal(a, b, [x, y])} />

      <svg className="iq-scene" viewBox="0 0 1000 266" role="img" aria-label={`${a} · ${b} · ${x} · ${y}`}>
        <rect className="iq-pairband" x="14" y={YP[0] - 34} width="972" height={YP[1] - YP[0] + 74} rx="14" />
        <rect className="iq-pairband" x="14" y={YP[2] - 34} width="972" height={YP[3] - YP[2] + 74} rx="14" />
        <Strip key={`a${d}`} n={a} d={d} u={u} y={YP[0]} tag="a" />
        <Strip key={`b${d}`} n={b} d={d} u={u} y={YP[1]} tag="b" />
        <Strip key={`x${d}`} n={x} d={d} u={u} y={YP[2]} tag="x" />
        <Strip key={`y${d}`} n={y} d={d} u={u} y={YP[3]} tag="y" />
      </svg>

      <Calc items={d ? [restTex(a, d), restTex(b, d), restTex(x, d), restTex(y, d)] : []} />
      <p className="iq-fact" data-iq-fact>
        <MathText>{fact}</MathText>
      </p>

      <div className="iq-actions">
        {s.stage === 'guess' && (
          <>
            <p className="iq-askline">
              <MathText>{T.ask({ a, b, x, y, p })}</MathText>
            </p>
            <span className="iq-side">{T.onFirst({ a, b })}</span>
            <YesNo T={T} value={s.guessFirst} onSay={(v) => act.say('first', v)} hook="data-iq-say-first" />
            <span className="iq-side">{T.onSecond({ x, y })}</span>
            <YesNo T={T} value={s.guessSecond} onSay={(v) => act.say('second', v)} hook="data-iq-say-second" />
            <button
              type="button"
              className="rf-btn rf-btn--main"
              onClick={act.lay}
              disabled={s.guessFirst == null || s.guessSecond == null}
              data-iq-lay
            >
              {T.lay}
            </button>
          </>
        )}
        {s.stage === 'compare' && (
          <>
            <div className="iq-lists" data-iq-lists>
              {[
                ['first', T.firstLabel(a, b), now.first],
                ['second', T.secondLabel(x, y), now.second],
              ].map(([key, label, list]) => (
                <div key={key} data-iq-list={key} data-iq-planks={list.join(',')}>
                  <small>{label}</small>
                  <span className="iq-chips">
                    {list.map((n) => (
                      <span key={n} className="iq-chip iq-chip--s is-on">
                        {n}
                      </span>
                    ))}
                  </span>
                </div>
              ))}
            </div>
            <button type="button" className="rf-btn rf-btn--main" onClick={act.next} data-iq-next>
              {isLast ? T.done : T.next}
            </button>
          </>
        )}
      </div>

      <Found
        lines={s.rows.map((r) => ({
          key: `${r.p}`,
          text: T.foundLine({ a, b, x, y, ...r }),
          fell: r.guessFirst !== r.inFirst || r.guessSecond !== r.inSecond,
        }))}
      />
    </section>
  );
}

export function Pair({ spec, play, onDone }) {
  const [state, dispatch] = useReducer((s, a) => pairReducer(spec, s, a), spec, initPair);
  const later = useLater();
  const now = pairNow(spec, state);
  expose({
    kind: 'nest',
    mode: 'pair',
    ri: state.ri,
    a: now.a,
    b: now.b,
    pair: [now.x, now.y],
    pi: state.pi,
    stage: state.stage,
    rows: state.rows.length,
    rounds: state.rounds,
  });
  const act = {
    say(side, v) {
      if (state.stage !== 'guess') return;
      play('pick');
      dispatch({ type: 'say', side, v });
    },
    lay() {
      if (state.stage !== 'guess' || state.guessFirst == null || state.guessSecond == null) return;
      const row = now.rows[state.pi];
      const right = state.guessFirst === row.inFirst && state.guessSecond === row.inSecond;
      const ends = state.pi + 1 >= now.probes.length;
      dispatch({ type: 'lay' });
      play('sweep');
      later(250, () => play('plank'));
      later(1300, () => {
        play(right ? 'success' : 'crumble');
        dispatch({ type: 'shown' });
        if (ends) later(400, () => play('gate'));
      });
    },
    next() {
      const after = pairReducer(spec, state, { type: 'next' });
      if (after.done) onDone(pairResult(after));
      else dispatch({ type: 'next' });
    },
  };
  return <PairView spec={spec} state={state} act={act} />;
}

// ───────────────────────── ladder · fold ─────────────────────────
const MAXF = 6; // lines on screen under the head; past it, the rows of the run are folded behind one line
const pairTex = (a, b, gold) => `$(${a}\\,;\\,${gold ? `\\textcolor{#fbbf24}{${b}}` : b})$`;
const lineTex = (run) => `${run.a} = ${run.b} \\times ${run.q} + ${run.r}`;

function Ticks({ a, b, first }) {
  const list = commonPlanks(a, b);
  const same = list.length === first.length && list.every((v, i) => v === first[i]);
  return (
    <span className="iq-rung__ticks" data-iq-ticks={list.join(',')}>
      {list.map((d) => (
        <b key={d}>{d}</b>
      ))}
      <i aria-hidden="true">{same ? '✓' : ''}</i>
    </span>
  );
}

export function FoldView({ spec, state: s, act, input = { q: '', r: '' } }) {
  const T = spec.text;
  const now = foldNow(spec, s);
  const { a, b } = now;
  const run = now.runs[s.run];
  const first = commonPlanks(a, b);
  const scale = 400 / now.rows[0].a;
  const seen = s.stage === 'seen';
  const isLast = s.ri + 1 >= spec.rounds.length;
  const lines = now.runs.slice(0, s.lines);
  const live = s.stage === 'write' || s.stage === 'fold';
  // the rows of the run on screen; when they do not fit beside the folded lines, the first, a fold « … », the last ones
  const rows = live ? now.rows.slice(run.from, run.from + s.written).map((r, k) => ({ r, k })) : [];
  const room = Math.max(3, MAXF - lines.length);
  const view = rows.length > room ? [rows[0], null, ...rows.slice(-(room - 2))] : rows;
  const hidden = rows.length - (room - 1);
  const lastFold = s.folds.at(-1);

  let fact = ' ';
  if (seen) fact = T.end({ a, b, gcd: now.gcd, steps: now.steps, lines: now.runs.length, folds: s.folds });
  else if (s.stage === 'fold' && s.miss) fact = T.foldMiss({ a: run.a, b: run.b, q: run.q, r: run.r, said: s.miss });
  else if (lastFold && s.stage !== 'fold') fact = T.foldSeen(lastFold);

  return (
    <section className="iq iq--div iq--ladder iq--fold" data-iq="ladder" data-iq-mode="fold" data-iq-stage={s.stage}>
      <Head i={s.ri} n={spec.rounds.length} lead={T.lead(a, b, 'fold')} goal={T.goal(a, b, 'fold')} />

      <div className="iq-ladder iq-ladder--fold" dir="ltr" data-iq-ladder data-iq-lines={s.lines}>
        <div className="iq-rung iq-rung--head">
          <span />
          <span />
          <span />
          <small dir="rtl">{T.planks}</small>
        </div>
        {lines.map((l, k) => {
          const end = seen && k === now.runs.length - 1;
          return (
            <div
              key={`l${l.from}`}
              className={`iq-rung iq-rung--line is-written ${k === s.lines - 1 && !seen ? 'is-new' : ''}`}
              data-iq-line={k + 1}
              data-iq-rows={`${l.from + 1}-${l.to + 1}`}
            >
              <span className="iq-rung__n" dir="ltr">
                {l.from === l.to ? l.from + 1 : `${l.from + 1}–${l.to + 1}`}
              </span>
              <RungBar r={{ a: l.a, b: l.b, q: l.q, value: l.r }} written scale={scale} end={end} />
              <span className="iq-rung__tex">
                <MathText>{pairTex(l.a, l.b, end)}</MathText>
                <MathText>{`$${lineTex(l)}$`}</MathText>
              </span>
              <Ticks a={l.a} b={l.b} first={first} />
            </div>
          );
        })}
        {view.map((v) =>
          v == null ? (
            <div key="fold" className="iq-rung iq-rung--fold" data-iq-fold={hidden}>
              <span />
              <small dir="rtl">{T.folded(hidden)}</small>
            </div>
          ) : (
            <div
              key={v.k}
              className={`iq-rung is-written ${v.k === s.written - 1 && s.stage === 'write' ? 'is-new' : ''} ${
                s.miss ? 'is-counted' : ''
              }`}
              data-iq-row={run.from + v.k + 1}
            >
              <span className="iq-rung__n" {...(s.miss ? { 'data-iq-counted': v.k + 1 } : {})}>
                {s.miss ? `${v.k + 1}×` : run.from + v.k + 1}
              </span>
              <RungBar r={v.r} written scale={scale} end={false} />
              <span className="iq-rung__tex">
                <MathText>{pairTex(v.r.a, v.r.b, false)}</MathText>
                <MathText>
                  {`$${v.r.a} - ${v.r.b} = ${
                    s.miss && v.k === run.q - 1 ? `\\textcolor{#fbbf24}{${v.r.value}}` : v.r.value
                  }$`}
                </MathText>
              </span>
              <Ticks a={v.r.a} b={v.r.b} first={first} />
            </div>
          ),
        )}
      </div>

      <Calc items={lastFold && s.stage !== 'fold' ? [lineTex(lastFold)] : []} />
      <p className="iq-fact" data-iq-fact>
        <MathText>{fact}</MathText>
      </p>

      <div className="iq-actions">
        {s.stage === 'fold' && (
          <>
            <p className="iq-askline">
              <MathText>{T.foldAsk({ a: run.a, b: run.b, rows: run.q })}</MathText>
            </p>
            <div className="iq-tpl" dir="ltr">
              <MathText>{`$${run.a} = ${run.b} \\times$`}</MathText>
              <Num
                value={input.q}
                onChange={(v) => act.type('q', v)}
                w={String(run.q).length + 1}
                data-iq-in="q"
                onKeyDown={onEnter(act.fold)}
              />
              <MathText>{'$+$'}</MathText>
              <Num
                value={input.r}
                onChange={(v) => act.type('r', v)}
                w={String(run.b).length}
                data-iq-in="r"
                onKeyDown={onEnter(act.fold)}
              />
            </div>
            <button type="button" className="rf-btn rf-btn--main" onClick={act.fold} data-iq-fold-go>
              {T.fold}
            </button>
          </>
        )}
        {seen && (
          <button type="button" className="rf-btn rf-btn--main" onClick={act.next} data-iq-next>
            {isLast ? T.done : T.next}
          </button>
        )}
      </div>

      <Found
        lines={s.rounds.map((r) => ({
          key: `${r.a}-${r.b}`,
          text: T.foundLine(r),
          fell: r.folds.some((f) => f.said.q !== f.q || f.said.r !== f.r),
        }))}
      />
    </section>
  );
}

export function Fold({ spec, play, onDone }) {
  const [state, dispatch] = useReducer((s, a) => foldReducer(spec, s, a), spec, initFold);
  const [input, setInput] = useState({ q: '', r: '' });
  const now = foldNow(spec, state);
  expose({
    kind: 'ladder',
    mode: 'fold',
    ri: state.ri,
    a: now.a,
    b: now.b,
    stage: state.stage,
    run: state.run,
    runs: now.runs.map((r) => ({ q: r.q, r: r.r })),
    written: state.written,
    lines: state.lines,
    gcd: now.gcd,
    rounds: state.rounds,
  });
  const ticking = state.stage === 'write' || state.stage === 'finish';
  useTick(ticking, state.stage === 'write' ? 520 : 650, dispatch, [state]);
  // a sound per row the world writes, per line it folds itself (past his folds), and the end of the ladder
  useEffect(() => {
    if (state.stage === 'write' && state.written > 0) play('plank');
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per row written
  }, [state.written]);
  useEffect(() => {
    if (state.lines > state.folds.length) play('sweep', state.lines);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per line the world folds
  }, [state.lines]);
  useEffect(() => {
    if (state.stage === 'seen') play('gate');
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once at the end of a round
  }, [state.stage]);

  const act = {
    type: (field, text) => setInput((v) => ({ ...v, [field]: text })),
    fold() {
      const q = asNumber(input.q);
      const r = asNumber(input.r);
      if (state.stage !== 'fold' || q == null || r == null) return;
      const after = foldReducer(spec, state, { type: 'fold', q, r });
      play(after.miss ? 'fail' : 'key');
      if (!after.miss) setInput({ q: '', r: '' });
      dispatch({ type: 'fold', q, r });
    },
    next() {
      const after = foldReducer(spec, state, { type: 'next' });
      if (after.done) onDone(foldResult(after));
      else dispatch({ type: 'next' });
    },
  };
  return <FoldView spec={spec} state={state} act={act} input={input} />;
}

// ───────────────────────── ladder · both ─────────────────────────
const BH = 300; // the height of a ladder's drawing: every row shares it, however many rows there are

/** One ladder drawn as bars, one per row, all rows of both ladders the same height (they shrink with the longer). */
function Bars({ rows, shown, of, scale, end }) {
  const h = BH / Math.max(of, 8);
  const bar = h * 0.78;
  return (
    <svg className="iq-both__bars" viewBox={`0 0 400 ${BH}`} preserveAspectRatio="none" aria-hidden="true">
      {rows.slice(0, shown).map((r, i) => {
        const yy = i * h;
        const taken = r.b * r.q * scale;
        const last = end && i === rows.length - 1;
        return (
          <g key={i} data-iq-bar={i + 1}>
            <rect
              className="iq-gapcell"
              x="0"
              y={yy}
              width={r.a * scale}
              height={bar}
              vectorEffect="non-scaling-stroke"
            />
            <rect
              className={`iq-plank ${last ? 'is-end' : ''}`}
              x="0"
              y={yy}
              width={Math.max(1, taken)}
              height={bar}
              vectorEffect="non-scaling-stroke"
            />
            {r.value > 0 && (
              <rect
                className="iq-rest iq-rest--flat"
                x={taken}
                y={yy}
                width={Math.max(1, r.value * scale)}
                height={bar}
                vectorEffect="non-scaling-stroke"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}

const rowTexOf = (mode, r) =>
  mode === 'divide' ? `${r.a} = ${r.b} \\times ${r.q} + ${r.value}` : `${r.a} - ${r.b} = ${r.value}`;

export function BothView({ spec, state: s, act, input = { shorter: null, by: '' } }) {
  const T = spec.text;
  const now = bothNow(spec, s);
  const { a, b } = now;
  const of = Math.max(now.steps.subtract, now.steps.divide);
  const scale = 400 / Math.max(a, b);
  const seen = s.stage === 'seen';
  const isLast = s.ri + 1 >= spec.rounds.length;
  const ready = input.shorter === 'same' || (input.shorter && asNumber(input.by) > 0);

  return (
    <section className="iq iq--div iq--both" data-iq="ladder" data-iq-mode="both" data-iq-stage={s.stage}>
      <Head i={s.ri} n={spec.rounds.length} lead={T.lead(a, b, 'both')} goal={T.goal(a, b, 'both')} />

      <div className="iq-both" data-iq-ladder>
        {['subtract', 'divide'].map((mode) => {
          const L = now[mode];
          const shown = Math.min(s.shown, L.steps);
          const newest = shown > 0 ? L.rows[shown - 1] : null;
          const done = shown >= L.steps && s.stage !== 'say';
          return (
            <div
              key={mode}
              className={`iq-both__col ${done ? 'is-done' : ''}`}
              data-iq-col={mode}
              data-iq-rows={shown}
              {...(done ? { 'data-iq-steps': L.steps } : {})}
            >
              <small className="iq-both__label">{T.ladderLabel(mode)}</small>
              <Bars rows={L.rows} shown={shown} of={of} scale={scale} end={seen} />
              <span className="iq-both__tex" dir="ltr">
                <MathText>
                  {newest ? `$${rowTexOf(mode, newest)}$` : `$(${Math.max(a, b)}\\,;\\,${Math.min(a, b)})$`}
                </MathText>
              </span>
              <strong className="iq-both__count" data-iq-count-of={mode}>
                {s.stage === 'say' ? ' ' : T.countLine(mode, shown)}
              </strong>
            </div>
          );
        })}
      </div>

      <p className="iq-fact" data-iq-fact>
        <MathText>
          {seen ? T.end({ a, b, steps: now.steps, shorter: now.shorter, by: now.by, gcd: now.gcd, said: s.said }) : ' '}
        </MathText>
      </p>

      <div className="iq-actions">
        {s.stage === 'say' && (
          <>
            <p className="iq-askline">
              <MathText>{T.ask({ a, b })}</MathText>
            </p>
            {['subtract', 'divide', 'same'].map((k) => (
              <button
                key={k}
                type="button"
                className={`rf-btn ${input.shorter === k ? 'is-on' : ''}`}
                onClick={() => act.choose(k)}
                data-iq-shorter={k}
              >
                {T.shorter[k]}
              </button>
            ))}
            {input.shorter && input.shorter !== 'same' && (
              <div className="iq-tpl" dir="rtl">
                <label>
                  <small>{T.byLabel}</small>
                  <Num
                    value={input.by}
                    onChange={(v) => act.type(v)}
                    w={2}
                    data-iq-in="by"
                    onKeyDown={onEnter(act.run)}
                  />
                  <small>{T.byUnit}</small>
                </label>
              </div>
            )}
            <button type="button" className="rf-btn rf-btn--main" onClick={act.run} disabled={!ready} data-iq-run>
              {T.run}
            </button>
          </>
        )}
        {seen && (
          <button type="button" className="rf-btn rf-btn--main" onClick={act.next} data-iq-next>
            {isLast ? T.done : T.next}
          </button>
        )}
      </div>

      <Found
        lines={s.rounds.map((r) => ({
          key: `${r.a}-${r.b}`,
          text: T.foundLine(r),
          fell: r.said.shorter !== r.shorter || r.said.by !== r.by,
        }))}
      />
    </section>
  );
}

export function Both({ spec, play, onDone }) {
  // empty, or where a workshop's bench was left (`spec.from`); the bench hears every move to keep it (`spec.onState`)
  const [state, dispatch] = useReducer((s, a) => bothReducer(spec, s, a), spec, bothStart);
  useEffect(() => {
    spec.onState?.(state);
  }, [spec, state]);
  const [input, setInput] = useState({ shorter: null, by: '' });
  const now = bothNow(spec, state);
  expose({
    kind: 'ladder',
    mode: 'both',
    ri: state.ri,
    a: now.a,
    b: now.b,
    stage: state.stage,
    shown: state.shown,
    steps: now.steps,
    said: state.said,
    rounds: state.rounds,
  });
  useTick(state.stage === 'run', 240, dispatch, [state]);
  useEffect(() => {
    if (state.stage === 'run' && state.shown > 0) play('sweep', state.shown);
    if (state.stage === 'seen') play('gate');
    // eslint-disable-next-line react-hooks/exhaustive-deps -- a sound per row the two ladders write
  }, [state.shown, state.stage]);

  const act = {
    choose(k) {
      play('pick');
      setInput((v) => ({ ...v, shorter: k }));
    },
    type: (text) => setInput((v) => ({ ...v, by: text })),
    run() {
      if (state.stage !== 'say' || !input.shorter) return;
      const by = input.shorter === 'same' ? 0 : asNumber(input.by);
      if (input.shorter !== 'same' && !(by > 0)) return;
      play('pick');
      dispatch({ type: 'say', shorter: input.shorter, by });
    },
    next() {
      const after = bothReducer(spec, state, { type: 'next' });
      if (after.done) onDone(bothResult(after));
      else {
        setInput({ shorter: null, by: '' });
        dispatch({ type: 'next' });
      }
    },
  };
  return <BothView spec={spec} state={state} act={act} input={input} />;
}
