/**
 * The screen of `plan` (logic: `plan.js`) — a PURE view of its reducer (`PlanView`) and its player (`Plan`).
 * Hooks: `data-iq="plan"`, `data-iq-stage`, `data-iq-unknown`, `data-iq-card=<VB|VC|BC>` (+ `data-iq-picked`,
 * `data-iq-refused`, `data-iq-hint`), `data-iq-join=<VM+MB|VB-VM|VM+VB|VMB-VM…>`, `data-iq-in`, `data-iq-lay`,
 * `data-iq-laid=<fact>`, `data-iq-laid-on=<course|line>` (`plan.js › laidOn`), `data-iq-fact`, `data-iq-next`.
 */
import { useReducer } from 'react';
import GeoFigure from '../../components/GeoFigure';
import MathText from '../../components/MathText';
import { M } from '../kit/parts';
import { typedDecimal } from '../kit/forge';
import { figureSpec } from './figure';
import { segName } from './ruleForge';
import {
  CARDS,
  initPlan,
  planReducer,
  planResult,
  toolsOf,
  valueOf,
  hintCards,
  roundFig,
  joinText,
  laidOn,
} from './plan';
import { expose, textOf, texNum } from './inquiryParts';

/** The course laid: the level's length (the bar) and his course centred on it — a gap amber, an overhang violet. */
function Laid({ laid, truth }) {
  const W = 420;
  const t = Number(truth.replace(',', '.'));
  const y = Number(laid.typed.replace(',', '.'));
  const big = Math.max(t, y);
  const k = (W - 40) / big;
  const lw = t * k;
  const cw = y * k;
  return (
    <svg className="np-iq__laid" viewBox={`0 0 ${W} 70`} data-iq-laid={laid.fact} aria-hidden="true">
      <rect x={(W - lw) / 2} y={36} width={lw} height={22} fill="#cbd5e1" stroke="#64748b" />
      <rect
        x={(W - cw) / 2}
        y={12}
        width={cw}
        height={22}
        fill={laid.fact === 'fits' ? '#86efac' : laid.fact === 'gap' ? '#fcd34d' : '#c4b5fd'}
        stroke="#334155"
      />
    </svg>
  );
}

export function PlanView({ spec, state: s, act }) {
  const T = textOf('plan', spec);
  const r = roundFig(spec, s.i);
  const fig = r.fig;
  const name = (k) => segName(fig, k);
  const hints = hintCards(spec, s);
  const tools = toolsOf(s);
  const cell = (k) => (s.known.includes(k) ? texNum(valueOf(spec, s, k)) : '?');
  // a course on the face, or a rope from a butterfly's vertex: each has its own words
  const on = laidOn(fig, r.unknown);
  const said = on === 'line' ? T.line : T.fact;
  return (
    <section
      className="np-iq np-iq--plan"
      data-iq="plan"
      data-iq-stage={s.laid ? 'laid' : 'plan'}
      data-iq-unknown={r.unknown}
    >
      <p className="np-iq__lead">
        <MathText>{T.lead}</MathText>
      </p>
      <div className="np-iq__row">
        <div className="np-iq__fig">
          <GeoFigure
            {...figureSpec(fig, { show: [...s.known, r.unknown], ask: [r.unknown], parallel: true })}
            maxWidth={340}
          />
        </div>
        <div className="np-iq__side">
          <h4>{T.cards}</h4>
          <div className="np-iq__cards">
            {CARDS.map((c) => {
              const picked = s.picked.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  className={`np-iq__card ${picked ? 'is-on' : ''} ${s.refused === c.id ? 'is-refused' : ''} ${hints.includes(c.id) ? 'is-hint' : ''}`}
                  onClick={() => act.pick(c.id)}
                  data-iq-card={c.id}
                  data-iq-picked={picked ? 'yes' : 'no'}
                  {...(hints.includes(c.id) ? { 'data-iq-hint': '' } : {})}
                  disabled={Boolean(s.laid)}
                >
                  <M>{`\\dfrac{${name(c.top)}}{${name(c.bottom)}} = \\dfrac{${cell(c.top)}}{${cell(c.bottom)}}`}</M>
                </button>
              );
            })}
          </div>
          {s.refused && (
            <p className="np-iq__refused" data-iq-refused={s.refused}>
              {T.twoUnknown}
            </p>
          )}
          {tools.length > 0 && !s.laid && (
            <div className="np-iq__tools">
              <h4>{T.tools}</h4>
              {tools.map((t) => {
                const j = joinText(spec, s, t.id);
                const op = t.id.includes('+') ? '+' : '-';
                const [a, b] = t.id.split(/[+-]/);
                return (
                  <button
                    key={t.id}
                    type="button"
                    className="rf-btn"
                    onClick={() => act.tool(t.id)}
                    data-iq-join={t.id}
                  >
                    <M>{`${name(t.gives)} = ${name(a)} ${op} ${name(b)}`}</M>
                    <small dir="ltr">
                      <M>{`= ${texNum(j.out)}`}</M>
                    </small>
                  </button>
                );
              })}
            </div>
          )}
          <div className="np-iq__type" dir="ltr">
            <M>{`${name(r.unknown)} =`}</M>
            <input
              className="di-num"
              inputMode="decimal"
              value={s.typed}
              disabled={Boolean(s.laid)}
              onChange={(e) => act.type(typedDecimal(e.target.value, 7))}
              aria-label={name(r.unknown)}
              data-iq-in
            />
            <span>{T.unit}</span>
            <button
              type="button"
              className="rf-btn rf-btn--main"
              disabled={Boolean(s.laid) || s.picked.length !== 2 || !s.typed}
              onClick={act.lay}
              data-iq-lay
            >
              {T.lay}
            </button>
          </div>
        </div>
      </div>
      {s.laid && (
        <div className="np-iq__out" data-iq-laid-on={on}>
          <Laid laid={s.laid} truth={fig.len[r.unknown]} />
          <p className={`np-iq__fact is-${s.laid.fact}`} data-iq-fact={s.laid.fact}>
            <MathText>{s.laid.fact === 'fits' ? said.fits : said[s.laid.fact](texNum(s.laid.diff))}</MathText>
          </p>
          <button type="button" className="rf-btn rf-btn--main" onClick={act.next} data-iq-next>
            {s.laid.fact === 'fits' ? T.next : T.again}
          </button>
        </div>
      )}
    </section>
  );
}

export function Plan({ spec, play, onDone }) {
  const [state, dispatch] = useReducer((s, a) => planReducer(spec, s, a), spec, initPlan);
  expose({ kind: 'plan', ...state });
  const act = {
    pick(card) {
      play('pick');
      dispatch({ type: 'pick', card });
    },
    tool(id) {
      play('plank');
      dispatch({ type: 'tool', id });
    },
    type(text) {
      dispatch({ type: 'type', text });
    },
    lay() {
      const after = planReducer(spec, state, { type: 'lay' });
      if (after.laid) play(after.laid.fact === 'fits' ? 'gate' : 'hit');
      dispatch({ type: 'lay' });
    },
    next() {
      const after = planReducer(spec, state, { type: 'next' });
      if (after.done) onDone(planResult(after));
      else {
        play('ui');
        dispatch({ type: 'next' });
      }
    },
  };
  return <PlanView spec={spec} state={state} act={act} />;
}
