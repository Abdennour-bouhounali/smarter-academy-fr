/**
 * THE INVESTIGATION `deal` of this world (see `Inquiry.jsx`, which mounts it; logic and state machine: `deal.js`).
 * Two collections drawn on a table (roses and lilies, dates and figs…) shared into k IDENTICAL lots (vases, baskets):
 * he chooses k, says BEFORE whether everything will be shared, and the world deals both collections round by round —
 * one item of each kind per lot and per round; what cannot be dealt stays on the table, apart. A table keeps every try.
 * Then he types the most lots and what one lot holds; a miss is answered by a deal, a row of his table, or « a number
 * you have not tried is still open » — never by the answer.
 *
 * Every item and every lot is DRAWN in SVG (`dealParts.jsx`, shared with the mirror of a forge whose case is a sharing):
 * no raster image, no emoji as the drawing.
 * `spec.text` is the lesson's wording (GAME_WORLD.md « Explore », spec shape of `deal`). Nothing here states a rule.
 * The screen is a pure VIEW of the reducer's state (`DealView`).
 */
import { useReducer, useState } from 'react';
import MathText from '../../components/MathText';
import { Num } from '../kit/parts';
import { dealNow, dealOf, dealReducer, dealResult, initDeal } from './deal';
import { Calc, restTex } from './InquiryCombine';
import { asNumber, onEnter } from './InquiryDivision';
import { expose, useLater, YesNo } from './inquiryParts';
import { GlyphDefs, Lot, Pile } from './dealParts';

/** A small item in a line of HTML (the table, the units of the answer). */
const Mini = ({ kind }) => (
  <svg className="iqd-mini" viewBox="0 0 20 20" aria-hidden="true">
    <use href={`#iqd-${kind}`} width="20" height="20" />
  </svg>
);

/** The fact line: what the world has just done, in the lesson's words. */
function factOf(T, spec, s) {
  const f = s.fact;
  if (!f) return ' ';
  const ctx = { a: spec.a, b: spec.b };
  if (f.type === 'dealt') return T.dealt({ ...ctx, ...f.row });
  if (f.type === 'again') return T.again({ ...ctx, ...f.row });
  if (f.type === 'miss') return T.miss({ ...ctx, kind: f.kind, said: f.said, row: f.row });
  if (f.type === 'ok') return T.ok({ ...ctx, said: f.said });
  return T.bound({ ...ctx, max: f.max });
}

/**
 * The screen for a state of the experiment. `act` = { choose(k), say(v), toAnswer(), back(), type(field, text),
 * answer(), next() }; `input` = { k, x, y } — the text of the three boxes of the answer.
 */
export function DealView({ spec, state, act, input = { k: '', x: '', y: '' } }) {
  const T = spec.text;
  const s = state;
  const { nA, nB, choices, minTries } = dealNow(spec);
  const itemA = spec.a.item;
  const itemB = spec.b.item;
  const d = s.k ? dealOf(nA, nB, s.k) : null;
  const cA = d ? Math.min(s.dealt, d.qA) : 0;
  const cB = d ? Math.min(s.dealt, d.qB) : 0;
  const complete = d && s.dealt >= d.rounds && s.stage !== 'guess' && s.stage !== 'deal';
  const shownK = s.fact?.row?.k ?? (s.stage === 'seen' ? s.k : null);
  const lotW = d ? (960 - (s.k - 1) * 10) / s.k : 0;

  return (
    <section
      className="iq iq--div iq--deal"
      data-iq="deal"
      data-iq-stage={s.stage}
      data-iq-k={s.k ?? ''}
      data-iq-dealt={s.dealt}
    >
      <div className="iq-lead">
        <p>
          <MathText>{T.lead(spec.a, spec.b)}</MathText>
        </p>
      </div>
      <p className="iq-goal" data-iq-goal>
        <span aria-hidden="true">🎯</span>
        {T.goal(spec.a, spec.b)}
      </p>

      <svg className="iq-scene" viewBox="0 0 1000 330" role="img" aria-label={`${nA} · ${nB}`}>
        <GlyphDefs ns="iqd" />
        <rect className="iqd-table" x="8" y="4" width="984" height="124" rx="16" />
        <Pile
          tag="a"
          kind={itemA}
          n0={nA}
          rem={nA - (s.k ?? 0) * cA}
          box={[20, 8, 460, 116]}
          left={complete && d.rA > 0}
        />
        <Pile
          tag="b"
          kind={itemB}
          n0={nB}
          rem={nB - (s.k ?? 0) * cB}
          box={[520, 8, 460, 116]}
          left={complete && d.rB > 0}
        />
        {d &&
          Array.from({ length: s.k }, (_, i) => (
            <Lot
              key={`${s.k}-${i}`}
              i={i}
              kind={spec.lot}
              box={[20 + i * (lotW + 10), 140, lotW, 186]}
              itemA={itemA}
              itemB={itemB}
              cA={cA}
              cB={cB}
              full={d.qA + d.qB}
            />
          ))}
      </svg>

      <Calc items={complete ? [restTex(nA, s.k), restTex(nB, s.k)] : []} />
      <p className="iq-fact" data-iq-fact>
        <MathText>{factOf(T, spec, s)}</MathText>
      </p>

      {s.tries.length > 0 && (
        <table className="iqd-tab" data-iq-table data-iq-found>
          <tbody>
            <tr>
              <th scope="row">{T.cols.lots}</th>
              {s.tries.map((t) => (
                <th
                  key={t.k}
                  className={`${t.ok ? 'is-ok' : ''} ${t.k === shownK ? 'is-shown' : ''}`}
                  data-iq-try={t.k}
                  data-iq-ok={t.ok ? '1' : '0'}
                >
                  {t.k}
                </th>
              ))}
            </tr>
            <tr>
              <th scope="row">
                <Mini kind={itemA} />
                {T.cols.a}
              </th>
              {s.tries.map((t) => (
                <td key={t.k}>{t.qA}</td>
              ))}
            </tr>
            <tr>
              <th scope="row">
                <Mini kind={itemB} />
                {T.cols.b}
              </th>
              {s.tries.map((t) => (
                <td key={t.k}>{t.qB}</td>
              ))}
            </tr>
            <tr>
              <th scope="row">{T.cols.left}</th>
              {s.tries.map((t) => (
                <td key={t.k} className={t.ok ? 'is-ok' : 'is-left'}>
                  <span className="iqd-left">
                    <Mini kind={itemA} />
                    {t.restA}
                  </span>
                  <span className="iqd-left">
                    <Mini kind={itemB} />
                    {t.restB}
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      )}

      <div className="iq-actions">
        {(s.stage === 'pick' || s.stage === 'guess' || s.stage === 'deal') && (
          <>
            <p className="iq-askline">
              <MathText>
                {s.stage === 'guess'
                  ? T.ask({ a: spec.a, b: spec.b, k: s.k })
                  : T.choose({ a: spec.a, b: spec.b, tried: s.tries.length })}
              </MathText>
            </p>
            <div className="iq-chips" dir="ltr">
              {choices.map((k) => {
                const tried = s.tries.find((t) => t.k === k);
                return (
                  <button
                    key={k}
                    type="button"
                    className={`iq-chip ${k === s.k && s.stage !== 'pick' ? 'is-on' : ''} ${tried ? `is-tried ${tried.ok ? 'is-ok' : ''}` : ''}`}
                    onClick={() => act.choose(k)}
                    disabled={s.stage !== 'pick'}
                    data-iq-choice={k}
                  >
                    {k}
                  </button>
                );
              })}
            </div>
            {s.stage === 'guess' && <YesNo T={T} onSay={act.say} />}
            {s.stage === 'pick' && s.tries.length >= minTries && (
              <button type="button" className="rf-btn rf-btn--main" onClick={act.toAnswer} data-iq-to-answer>
                {T.toAnswer}
              </button>
            )}
          </>
        )}
        {s.stage === 'answer' && (
          <>
            <p className="iq-askline">
              <MathText>{T.answerLead({ a: spec.a, b: spec.b })}</MathText>
            </p>
            <div className="iq-tpl">
              <label>
                <Num
                  value={input.k}
                  onChange={(v) => act.type('k', v)}
                  w={2}
                  data-iq-in="k"
                  onKeyDown={onEnter(act.answer)}
                />
                <small>{T.lotsUnit}</small>
              </label>
              <label>
                <Num
                  value={input.x}
                  onChange={(v) => act.type('x', v)}
                  w={2}
                  data-iq-in="x"
                  onKeyDown={onEnter(act.answer)}
                />
                <Mini kind={itemA} />
                <small>{T.unitA}</small>
              </label>
              <label>
                <Num
                  value={input.y}
                  onChange={(v) => act.type('y', v)}
                  w={2}
                  data-iq-in="y"
                  onKeyDown={onEnter(act.answer)}
                />
                <Mini kind={itemB} />
                <small>{T.unitB}</small>
              </label>
            </div>
            <button type="button" className="rf-btn rf-btn--main" onClick={act.answer} data-iq-check>
              {T.check}
            </button>
            <button type="button" className="rf-btn" onClick={act.back} data-iq-back>
              {T.back}
            </button>
          </>
        )}
        {s.stage === 'seen' && (
          <button type="button" className="rf-btn rf-btn--main" onClick={act.next} data-iq-next>
            {T.done}
          </button>
        )}
      </div>
    </section>
  );
}

/** The rhythm of a deal: one beat per round, quicker when there are many rounds. */
const beatOf = (rounds) => Math.max(70, Math.min(260, 2400 / Math.max(1, rounds)));

export function Deal({ spec, play, onDone }) {
  const [state, dispatch] = useReducer((s, a) => dealReducer(spec, s, a), undefined, initDeal);
  const [input, setInput] = useState({ k: '', x: '', y: '' });
  const later = useLater();
  const { nA, nB } = dealNow(spec);
  expose({
    kind: 'deal',
    stage: state.stage,
    k: state.k,
    dealt: state.dealt,
    tries: state.tries,
    fact: state.fact,
    answers: state.answers,
  });

  /** The world deals k lots round by round, then `end` (a sound per round). */
  const run = (k, end) => {
    const { rounds } = dealOf(nA, nB, k);
    const beat = beatOf(rounds);
    const ticks = Math.max(1, rounds);
    for (let j = 1; j <= ticks; j += 1)
      later(250 + j * beat, () => {
        play('sweep', j);
        dispatch({ type: 'tick' });
      });
    later(250 + ticks * beat + 300, end);
  };

  const act = {
    choose(k) {
      if (state.stage !== 'pick') return;
      play('pick');
      dispatch({ type: 'choose', k });
    },
    say(v) {
      if (state.stage !== 'guess') return;
      play('pick');
      dispatch({ type: 'say', v });
      const { ok } = dealOf(nA, nB, state.k);
      run(state.k, () => play(v === ok ? 'success' : 'crumble'));
    },
    toAnswer() {
      play('pick');
      dispatch({ type: 'toAnswer' });
    },
    back() {
      play('pick');
      dispatch({ type: 'back' });
    },
    type: (field, text) => setInput((v) => ({ ...v, [field]: text })),
    answer() {
      if (state.stage !== 'answer') return;
      const said = { type: 'answer', k: asNumber(input.k), x: asNumber(input.x), y: asNumber(input.y) };
      const after = dealReducer(spec, state, said);
      dispatch(said);
      if (after.stage === 'seen') play('key');
      else if (after.stage === 'deal') run(after.k, () => play('fail'));
      else play(after.fact?.type === 'bound' ? 'pick' : 'fail');
    },
    next() {
      const after = dealReducer(spec, state, { type: 'next' });
      if (after.done) onDone(dealResult(spec, after));
    },
  };

  return <DealView spec={spec} state={state} act={act} input={input} />;
}
