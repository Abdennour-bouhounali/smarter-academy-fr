/**
 * THE INVESTIGATION `part` of this world (see `Inquiry.jsx`, which mounts it; logic and state machine: `part.js`).
 * ONE strip, the whole, with a part the world paints in strokes one after the other. He writes the fraction painted (in
 * its template: two boxes over a bar); then he picks a plank that fills the painted part AND the whole: the strip is
 * RE-CUT in that unit — the painted length does not move, the cuts and the writing do, and the two writings stand side
 * by side with « = ». A plank that does not fill both is laid and what is left shows; he may also claim that no plank but
 * 1 fills both, and the world tries the planks of the painted part on the whole.
 *
 * `spec.text` is the lesson's wording (GAME_WORLD.md « Explore », spec shape of `part`). Nothing here states a rule: every
 * sentence says what the strip has just done. The screen is a pure VIEW of the reducer's state (`PartView`).
 */
import { useEffect, useReducer, useState } from 'react';
import MathText from '../../components/MathText';
import { Num } from '../kit/parts';
import { initPart, partNow, partReducer, partResult } from './part';
import { checkOf } from './measure';
import { plankOn } from './summit';
import { restTex } from './InquiryCombine';
import { Head, Found, asNumber, onEnter } from './InquiryDivision';
import { FracTpl, chainTex } from './InquiryMeasure';
import { expose, X0, SPAN, useLater } from './inquiryParts';
import './inquiryMeasure.css';
import './inquiryPart.css';

/** The strip in a 1000 × 150 scene: the labels of the strokes above it, the whole below its end. */
const YS = 58;
const HS = 36;
const LABEL_ROWS = [YS - 14, YS - 38];

/** The labels of the strokes: centred over each stroke, a label that would touch the one before goes one row up. */
function strokeLabels(strokes, u) {
  let at = 0;
  let prev = null;
  return strokes.map((k) => {
    const x = X0 + (at + k / 2) * u;
    at += k;
    const w = 13 * String(k).length + 10;
    const row = prev && prev.row === 0 && Math.abs(x - prev.x) < (w + prev.w) / 2 + 4 ? 1 : 0;
    prev = { x, w, row };
    return { k, x, y: LABEL_ROWS[row] };
  });
}

/** The planks of d cells laid along the whole (outlined: the paint stays visible under them) and what is left. */
function Planks({ d, whole, u }) {
  const n = Math.floor(whole / d);
  const rest = whole - n * d;
  return (
    <g data-iq-laid={d}>
      {Array.from({ length: n }, (_, k) => (
        <rect
          key={k}
          className={`iq-part-plank iq-plank--drop ${k % 2 ? 'is-alt' : ''}`}
          x={X0 + k * d * u + 1}
          y={YS - 6}
          width={Math.max(1, d * u - 2)}
          height={HS + 12}
          rx={Math.min(6, (d * u) / 3)}
          style={{ animationDelay: `${k * Math.min(90, 900 / Math.max(1, n))}ms` }}
        />
      ))}
      {rest > 0 && (
        <rect
          className="iq-rest"
          x={X0 + n * d * u}
          y={YS - 6}
          width={Math.max(1, rest * u - 1.5)}
          height={HS + 12}
          rx="5"
        />
      )}
    </g>
  );
}

/** The plank lying on the strip now (null: none). */
function laidNow(s) {
  if (s.stage === 'lay') return s.pending;
  if (s.check && s.check.shown > 0 && (s.stage === 'checkRun' || s.stage === 'pick' || s.stage === 'seen'))
    return s.check.tried[s.check.shown - 1].d;
  if (s.last && s.stage !== 'seen') return s.last.d;
  return null;
}

function factOf(T, now, s) {
  const { whole, painted, strokes } = now;
  if (s.notice?.kind === 'bound') return T.bound({ whole, painted, max: whole });
  if (s.stage === 'lay' || s.stage === 'checkRun') return ' ';
  if (s.stage === 'paint' && s.shown === 0) return ' ';
  if (s.stage === 'paint' || (s.stage === 'write' && !s.writes.length))
    return T.painted({ k: s.shown, stroke: strokes[s.shown - 1], so: strokes.slice(0, s.shown), whole });
  if (s.stage === 'write') {
    const w = s.writes.at(-1);
    return T.writeMiss({ said: w, painted, whole, okP: w.p === painted, okQ: w.q === whole });
  }
  const check = s.check && { p: painted, q: whole, tried: s.check.tried, found: s.check.found };
  if (s.stage === 'seen') {
    if (s.cut > 1) return T.recut({ d: s.cut, from: [painted, whole], to: s.writing });
    return T.unchanged({ painted, whole, laid: s.tried.map((t) => t.d), ...check });
  }
  if (check && check.found !== null) return T.checkSeen(check);
  if (s.last) return T.refused({ painted, whole, ...s.last });
  return T.written({ p: painted, q: whole });
}

/**
 * The screen for a state of the experiment. `act` = { type(field, text), write(), pick(d), lay(), none(), next() } —
 * what the boxes and buttons do; `input` = { num, den, plank } — the text of the boxes.
 */
export function PartView({ spec, state, act, input = { num: '', den: '', plank: '' } }) {
  const T = spec.text;
  const s = state;
  const now = partNow(spec, s);
  const { whole, painted, strokes } = now;
  const u = SPAN / whole;
  const d = laidNow(s);
  const isLast = s.ri + 1 >= spec.rounds.length;
  const paintedNow = strokes.slice(0, s.shown).reduce((t, k) => t + k, 0);
  const starts = strokes.map((_, i) => strokes.slice(0, i).reduce((t, k) => t + k, 0));
  const labels = strokeLabels(strokes, u).slice(0, s.shown);
  const writings = s.writing ? (s.cut > 1 ? [[painted, whole], s.writing] : [s.writing]) : [];
  const refusedHere = new Set(s.tried.filter((t) => !t.fills).map((t) => t.d));
  const checkShown = s.check ? s.check.tried.slice(0, s.check.shown) : [];
  // the divisions written: of the plank on the strip, or of the unit the strip was re-cut in
  const divD = d ?? (s.stage === 'seen' && s.cut > 1 ? s.cut : null);
  const k = `${s.stage}-${d ?? 0}-${s.check?.shown ?? 0}-${s.tried.length}`;

  return (
    <section
      className="iq iq--div iq--part"
      data-iq="part"
      data-iq-stage={s.stage}
      data-iq-whole={whole}
      data-iq-painted={paintedNow}
      data-iq-cut={s.cut}
      data-iq-writing={writings.map((w) => w.join('/')).join(',')}
    >
      <Head i={s.ri} n={spec.rounds.length} lead={T.lead(whole, strokes)} goal={T.goal(whole, strokes)} />

      <svg className="iq-scene" viewBox="0 0 1000 150" role="img" aria-label={`${paintedNow}\u00a0/\u00a0${whole}`}>
        <g data-iq-strip="whole">
          {Array.from({ length: whole }, (_, i) => (
            // eslint-disable-next-line react/no-array-index-key -- the cells of a strip are its places
            <rect key={i} className="iq-gapcell" x={X0 + i * u} y={YS} width={u - 1.5} height={HS} rx="2" />
          ))}
          {strokes.slice(0, s.shown).map((len, i) => (
            <rect
              // eslint-disable-next-line react/no-array-index-key -- a stroke is its place in the round
              key={`s${i}`}
              className={`iq-part-paint ${i % 2 ? 'is-alt' : ''}`}
              x={X0 + starts[i] * u}
              y={YS}
              width={len * u - 1.5}
              height={HS}
              rx="2"
              data-iq-stroke={len}
            />
          ))}
          {s.cut > 1 &&
            Array.from({ length: whole / s.cut }, (_, i) => (
              <rect
                // eslint-disable-next-line react/no-array-index-key -- the new cuts are their places
                key={`c${i}`}
                className="iq-part-cut iq-plank--drop"
                x={X0 + i * s.cut * u + 1}
                y={YS - 4}
                width={s.cut * u - 2}
                height={HS + 8}
                rx="5"
              />
            ))}
          {d && <Planks key={k} d={d} whole={whole} u={u} />}
          {s.shown === strokes.length && (
            <line className="iq-part-end" x1={X0 + painted * u} y1={YS - 10} x2={X0 + painted * u} y2={YS + HS + 10} />
          )}
        </g>
        {labels.map((l, i) => (
          // eslint-disable-next-line react/no-array-index-key -- a stroke is its place in the round
          <text key={`l${i}`} className="iq-part-label" x={l.x} y={l.y} direction="ltr">
            {l.k}
          </text>
        ))}
        <text className="iq-scene__num" x={X0 + whole * u} y={YS + HS + 32} direction="ltr">
          {whole}
        </text>
      </svg>

      <div className="iq-meas-calc" dir="ltr" data-iq-calc>
        {writings.length > 0 && (
          <span className="iq-meas-chain" data-iq-chain={writings.map((w) => w.join('/')).join(',')}>
            <MathText>{`$${chainTex(writings)}$`}</MathText>
          </span>
        )}
        {divD &&
          [restTex(painted, divD), restTex(whole, divD)].map((tex) => (
            <span key={tex} className="iq-meas-div">
              <MathText>{`$${tex}$`}</MathText>
            </span>
          ))}
      </div>
      <p className="iq-fact" data-iq-fact>
        <MathText>{factOf(T, now, s)}</MathText>
      </p>

      <div className="iq-actions">
        {s.stage === 'write' && (
          <>
            <p className="iq-askline">
              <MathText>{T.writeAsk({ whole, strokes })}</MathText>
            </p>
            <FracTpl
              num={input.num}
              den={input.den}
              onNum={(v) => act.type('num', v)}
              onDen={(v) => act.type('den', v)}
              w={String(whole).length}
              onEnter={act.write}
            />
            <button type="button" className="rf-btn rf-btn--main" onClick={act.write} data-iq-write>
              {T.write}
            </button>
          </>
        )}
        {s.stage === 'pick' && (
          <>
            <p className="iq-askline">
              <MathText>{T.pickAsk({ painted, whole })}</MathText>
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
            <div className="iq-tpl">
              <label>
                <Num
                  value={input.plank}
                  onChange={(v) => act.type('plank', v)}
                  w={String(whole).length}
                  data-iq-in="plank"
                  onKeyDown={onEnter(act.lay)}
                />
                <small>{T.unit}</small>
              </label>
            </div>
            <button type="button" className="rf-btn rf-btn--main" onClick={act.lay} data-iq-lay>
              {T.lay}
            </button>
            <button type="button" className="rf-btn" onClick={act.none} data-iq-none>
              {T.none}
            </button>
          </>
        )}
        {s.check && (s.stage === 'checkRun' || (s.stage === 'seen' && s.cut === 1)) && (
          <div className="iq-meas-check" data-iq-check={checkShown.map((t) => `${t.d}:${t.fills ? 1 : 0}`).join(',')}>
            <small>{T.checkLabel({ painted, whole })}</small>
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
        {s.stage === 'seen' && (
          <button type="button" className="rf-btn rf-btn--main" onClick={act.next} data-iq-next>
            {isLast ? T.done : T.next}
          </button>
        )}
      </div>

      <Found lines={s.rounds.map((r, i) => ({ key: `r${i}-${r.whole}`, text: T.foundLine(r) }))} />
    </section>
  );
}

/** How long the world takes for one stroke it paints, or one plank it tries. */
const BEAT = 520;

export function Part({ spec, play, onDone }) {
  const [state, dispatch] = useReducer((s, a) => partReducer(spec, s, a), spec, initPart);
  const [input, setInput] = useState({ num: '', den: '', plank: '' });
  const later = useLater();
  const now = partNow(spec, state);
  expose({
    kind: 'part',
    ri: state.ri,
    stage: state.stage,
    whole: now.whole,
    strokes: now.strokes,
    painted: now.painted,
    cut: state.cut,
    writing: state.writing,
    check: state.check && { found: state.check.found, shown: state.check.shown },
    rounds: state.rounds,
  });

  // the world paints the strokes of a new round, one after the other
  useEffect(() => {
    if (state.stage !== 'paint') return;
    now.strokes.forEach((_, i) =>
      later(400 + i * BEAT, () => {
        play('sweep', i + 1);
        dispatch({ type: 'tick' });
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per round: the strokes are the round's
  }, [state.ri]);

  const pick = (d) => {
    if (state.stage !== 'pick') return;
    const after = partReducer(spec, state, { type: 'try', d });
    dispatch({ type: 'try', d });
    if (after.stage !== 'lay') {
      play('pick');
      return;
    }
    play('sweep');
    setInput((v) => ({ ...v, plank: '' }));
    const fills = plankOn(now.painted, now.whole, d).both;
    later(300, () => {
      play(fills ? 'plank' : 'hit');
      dispatch({ type: 'shown' });
    });
    if (fills) later(900, () => play('spark'));
  };

  const act = {
    type: (field, text) => setInput((v) => ({ ...v, [field]: text })),
    write() {
      const p = asNumber(input.num);
      const q = asNumber(input.den);
      if (state.stage !== 'write' || !p || !q) return;
      dispatch({ type: 'write', p, q });
      play(p === now.painted && q === now.whole ? 'key' : 'fail');
    },
    pick,
    lay: () => pick(asNumber(input.plank)),
    none() {
      if (state.stage !== 'pick') return;
      play('pick');
      dispatch({ type: 'none' });
      const c = checkOf(now.painted, now.whole);
      const count = Math.max(1, c.tried.length);
      for (let k = 1; k <= count; k += 1)
        later(k * BEAT, () => {
          if (c.tried[k - 1]) play(c.tried[k - 1].fills ? 'plank' : 'sweep', k);
          dispatch({ type: 'tick' });
        });
      // his claim « no plank but 1 » against what the world found
      later(count * BEAT + 300, () => {
        play(c.found === null ? 'success' : 'crumble');
        if (c.found === null) later(400, () => play('gate'));
      });
    },
    next() {
      const after = partReducer(spec, state, { type: 'next' });
      if (after.done) onDone(partResult(after));
      else {
        setInput({ num: '', den: '', plank: '' });
        dispatch({ type: 'next' });
      }
    },
  };

  return <PartView spec={spec} state={state} act={act} input={input} />;
}
