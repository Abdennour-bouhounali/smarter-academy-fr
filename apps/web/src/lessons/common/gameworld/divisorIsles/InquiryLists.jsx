/**
 * THE INVESTIGATION `lists` of this world (see `Inquiry.jsx`, which mounts it; logic and state machine: `lists.js`).
 * Two gaps; the planks of each are LISTED by pairs, the two lists crossed, and the longest plank they share is asked last.
 *
 *   build    he types a plank of the gap; the world lays it: it fills (its partner is written and both join the list) or a
 *            piece is left (the division written, nothing added). The world closes a list that holds every plank; « it is
 *            complete » said earlier is answered by ONE missing plank laid on the gap.
 *   link     the two lists stand one above the other, plank under plank; he taps a plank « in both »: the world lays it on
 *            both gaps — a link drawn, or the division that leaves a piece. « all linked » said too early: one missing
 *            link is shown.
 *   longest  he taps the longest linked plank; a shorter one is answered by a longer linked plank, shown. Not played
 *            with `crown: false` (the round, or the spec): the round ends on the two lists and their links.
 *
 * `spec.text` is the lesson's wording (GAME_WORLD.md « استكشف », spec shape of `lists`). Nothing here states a rule:
 * every sentence says what the strips have just done. The screen is a pure VIEW of the reducer's state (`ListsView`).
 */
import { useEffect, useReducer, useState } from 'react';
import MathText from '../../components/MathText';
import { Num } from '../kit/parts';
import { initLists, listsNow, listsReducer, listsResult, columnsOf, plankFill } from './lists';
import { Span, Calc, restTex } from './InquiryCombine';
import { Head, Found, asNumber, onEnter } from './InquiryDivision';
import { FAST, expose, X0, SPAN, useLater } from './inquiryParts';
import './inquiryLists.css';

/** The two strips and the two lists, in a 1000 × 310 scene. */
const YA = 30;
const YB = 92;
const H = 30;
/** the rows of the two lists (centre lines), the chips' height, and their labels (above the first, under the second) */
const RA = 182;
const RB = 262;
const CH = 40;
const LABEL_A = RA - CH / 2 - 10;
const LABEL_B = RB + CH / 2 + 26;

/** A gap with a plank laid on it; a plank too thin to draw one by one is drawn as one filled bar. */
function Gap({ n, d, u, y, tag }) {
  const thin = d && d * u < 3 && Math.floor(n / d) > 0;
  return (
    <g data-iq-strip={tag}>
      <Span key={d ?? 0} n={n} d={d} u={u} y={y} laid={Boolean(d)} fast={FAST()} />
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

/** Where the columns of the lists stand: one column per plank of either list, shortest at the left (a list read LTR). */
export function columnFrame(count) {
  const w = Math.min(72, SPAN / Math.max(1, count));
  const start = X0 + (SPAN - w * count) / 2;
  return { w, x: (i) => start + w * i + w / 2, font: w < 40 ? 18 : 20 };
}

/** What a plank of a list shows now (a class and the walks' hook). */
function chipStateOf(s, side, d) {
  const last = s.last;
  if (d === s.crown) return 'crown';
  if (last?.kind === 'longer' && d === last.longer) return 'longer';
  if (last?.kind === 'longer' && d === last.d) return 'picked';
  if (s.stage === 'linkLay' && s.pending.d === d && s.pending.side === side) return 'now';
  if (last?.kind === 'unlinked' && d === last.d && side === last.side) return 'wrong';
  if (last?.kind === 'linkMissing' && d === last.d) return 'hint';
  if (s.links.includes(d)) return 'linked';
  if ((last?.kind === 'fill' || last?.kind === 'closed') && last.side === side) {
    if (d === last.d) return 'new';
    if (d === last.q) return 'partner';
  }
  return '';
}

/** The two lists, one above the other, plank under plank; the links between them. */
function ListRows({ s, now, T, onTap }) {
  const cols = columnsOf(s.lists.a, s.lists.b);
  const f = columnFrame(cols.length);
  const at = (d) => f.x(cols.indexOf(d));
  const canTap = (side, d) =>
    (s.stage === 'link' && !s.links.includes(d)) || (s.stage === 'longest' && s.links.includes(d));
  const hint = s.last?.kind === 'linkMissing' ? s.last.d : null;
  const row = (side, y) => (
    <g data-iq-list={side} data-iq-items={s.lists[side].join(',')}>
      {s.lists[side].map((d) => {
        const st = chipStateOf(s, side, d);
        const tap = canTap(side, d);
        const x = at(d);
        return (
          <g
            key={d}
            className={`iq-li-chip ${st ? `is-${st}` : ''} ${tap ? 'is-tap' : ''}`}
            data-iq-chip={d}
            data-iq-chip-state={st}
            {...(tap
              ? {
                  role: 'button',
                  tabIndex: 0,
                  onClick: () => onTap(side, d),
                  onKeyDown: (e) => {
                    if (e.key === 'Enter' || e.key === ' ') onTap(side, d);
                  },
                }
              : {})}
          >
            <rect x={x - f.w / 2 + 3} y={y - CH / 2} width={f.w - 6} height={CH} rx="9" />
            <text x={x} y={y + 7} direction="ltr" style={{ fontSize: f.font }}>
              {d}
            </text>
          </g>
        );
      })}
    </g>
  );
  const building = s.stage === 'build' || s.stage === 'buildLay' || s.stage === 'closed';
  return (
    <g data-iq-links={s.links.join(',')}>
      <text
        className={`iq-li-label ${building && s.side === 'a' ? 'is-now' : ''}`}
        x={X0 + SPAN}
        y={LABEL_A}
        direction="rtl"
      >
        {T.listLabel(now.a)}
      </text>
      <text
        className={`iq-li-label ${building && s.side === 'b' ? 'is-now' : ''}`}
        x={X0 + SPAN}
        y={LABEL_B}
        direction="rtl"
      >
        {T.listLabel(now.b)}
      </text>
      {s.links.map((d) => (
        <line
          key={d}
          className={`iq-li-link ${d === s.crown ? 'is-crown' : ''}`}
          x1={at(d)}
          y1={RA + CH / 2}
          x2={at(d)}
          y2={RB - CH / 2}
        />
      ))}
      {hint != null && cols.includes(hint) && (
        <line className="iq-li-link is-hint" x1={at(hint)} y1={RA + CH / 2} x2={at(hint)} y2={RB - CH / 2} />
      )}
      {row('a', RA)}
      {row('b', RB)}
    </g>
  );
}

const ON_BOTH = new Set(['link', 'unlinked', 'linkMissing', 'longer', 'crown']);

/** The plank lying on each strip now: { a, b } (undefined: the gap is empty). */
function laidOf(s) {
  if (s.stage === 'buildLay') return { [s.side]: s.pending };
  if (s.stage === 'linkLay') return { a: s.pending.d, b: s.pending.d };
  const last = s.last;
  if (!last || last.kind === 'refused' || last.kind === 'linksDone') return {};
  if (ON_BOTH.has(last.kind)) {
    const d = last.kind === 'longer' ? last.longer : last.d;
    return { a: d, b: d };
  }
  return { [last.side]: last.d };
}

/** The calculation of the moment: a plank that fills writes its partner (gold); a piece is written as a division. */
function calcOf(now, s) {
  const last = s.last;
  if (!last || s.stage === 'buildLay' || s.stage === 'linkLay') return [];
  if (ON_BOTH.has(last.kind)) {
    const d = last.kind === 'longer' ? last.longer : last.d;
    return [restTex(now.a, d), restTex(now.b, d)];
  }
  if (last.kind === 'miss') return [restTex(last.n, last.d)];
  if (last.kind === 'fill' || last.kind === 'again' || last.kind === 'missing' || last.kind === 'closed')
    return [`${last.n} = ${last.d} \\times \\textcolor{#fbbf24}{${last.q}}`];
  return [];
}

/** The fact line: what the world has just done, in the lesson's words. */
function factOf(T, now, s) {
  const { a, b } = now;
  const l = s.last;
  if (!l || s.stage === 'buildLay' || s.stage === 'linkLay') return ' ';
  switch (l.kind) {
    case 'refused':
      return T.bound({ n: l.n });
    case 'fill':
      return T.fills({ n: l.n, d: l.d, q: l.q });
    case 'again':
      return T.again({ n: l.n, d: l.d, q: l.q });
    case 'miss':
      return T.misses({ n: l.n, d: l.d, q: l.q, r: l.r });
    case 'missing':
      return T.missing({ n: l.n, d: l.d, q: l.q });
    case 'closed':
      return T.closed({ n: l.n, d: l.d, q: l.q, list: l.list });
    case 'link':
      return T.linked({ a, b, d: l.d, from: l.side, qa: l.qa, qb: l.qb });
    case 'unlinked':
      return T.unlinked({ a, b, d: l.d, from: l.side, n: l.on.n, q: l.on.q, r: l.on.r });
    case 'linkMissing':
      return T.linkMissing({ a, b, d: l.d, qa: l.qa, qb: l.qb });
    case 'linksDone':
      return T.linksDone({ a, b, links: l.links });
    case 'longer':
      return T.longer({ a, b, d: l.d, longer: l.longer });
    case 'crown':
      return T.crowned({ a, b, d: l.d, picks: l.picks });
    default:
      return ' ';
  }
}

/**
 * The screen for a state of the experiment. `act` = { type(text), lay(), complete(), go(), tap(side, d), allLinked(),
 * next() } — what the box, the buttons and the planks of the lists do; `input` = the text of the box.
 */
export function ListsView({ spec, state, act, input = '' }) {
  const T = spec.text;
  const s = state;
  const now = listsNow(spec, s);
  const { a, b } = now;
  const u = SPAN / Math.max(a, b);
  const laid = laidOf(s);
  const n = now.gap[s.side];
  const isLast = s.ri + 1 >= spec.rounds.length;
  const onTap = (side, d) => (s.stage === 'longest' ? act.pick(d) : act.tap(side, d));

  return (
    <section
      className="iq iq--div iq--lists"
      data-iq="lists"
      data-iq-stage={s.stage}
      data-iq-side={s.side}
      data-iq-pair={`${a}:${b}`}
      {...(s.crown != null ? { 'data-iq-crown': s.crown } : {})}
    >
      <Head i={s.ri} n={spec.rounds.length} lead={T.lead(a, b)} goal={T.goal(a, b)} />

      <svg className="iq-scene" viewBox="0 0 1000 310" role="img" aria-label={`${a} · ${b}`}>
        <Gap n={a} d={laid.a} u={u} y={YA} tag="a" />
        <Gap n={b} d={laid.b} u={u} y={YB} tag="b" />
        <ListRows s={s} now={now} T={T} onTap={onTap} />
      </svg>

      <Calc items={calcOf(now, s)} />
      <p className="iq-fact" data-iq-fact>
        <MathText>{factOf(T, now, s)}</MathText>
      </p>

      <div className="iq-actions">
        {s.stage === 'build' && (
          <>
            <p className="iq-askline">
              <MathText>{T.buildAsk({ n, list: s.lists[s.side] })}</MathText>
            </p>
            <div className="iq-tpl" dir="rtl">
              <label>
                <Num
                  value={input}
                  onChange={(v) => act.type(v)}
                  w={String(n).length}
                  data-iq-in="plank"
                  onKeyDown={onEnter(act.lay)}
                />
                <small>{T.unit}</small>
              </label>
            </div>
            <button type="button" className="rf-btn rf-btn--main" onClick={act.lay} data-iq-lay>
              {T.lay}
            </button>
            <button type="button" className="rf-btn" onClick={act.complete} data-iq-complete>
              {T.claim}
            </button>
          </>
        )}
        {s.stage === 'closed' && (
          <button type="button" className="rf-btn rf-btn--main" onClick={act.go} data-iq-go>
            {T.go}
          </button>
        )}
        {s.stage === 'link' && (
          <>
            <p className="iq-askline">
              <MathText>{T.linkAsk({ a, b })}</MathText>
            </p>
            <button type="button" className="rf-btn rf-btn--main" onClick={act.allLinked} data-iq-all-linked>
              {T.allLinked}
            </button>
          </>
        )}
        {s.stage === 'longest' && (
          <p className="iq-askline">
            <MathText>{T.longAsk({ a, b })}</MathText>
          </p>
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

/**
 * Where the experiment starts: empty, or — on the workshop's bench (`Workshop.jsx › Bench`) — the state it kept
 * (`spec.from`); a plank the world was still laying when he left is laid now.
 */
function startOf(spec) {
  const s = spec.from;
  if (!s || !(s.ri < spec.rounds.length)) return initLists(spec);
  return s.stage === 'buildLay' || s.stage === 'linkLay' ? listsReducer(spec, s, { type: 'shown' }) : s;
}

export function Lists({ spec, play, onDone }) {
  const [state, dispatch] = useReducer((s, a) => listsReducer(spec, s, a), spec, startOf);
  // the bench hears every move, to keep it (`spec.onState`)
  useEffect(() => {
    spec.onState?.(state);
  }, [spec, state]);
  const [input, setInput] = useState('');
  const later = useLater();
  const now = listsNow(spec, state);
  expose({
    kind: 'lists',
    ri: state.ri,
    stage: state.stage,
    side: state.side,
    a: now.a,
    b: now.b,
    lists: state.lists,
    links: state.links,
    common: now.common,
    longest: now.longest,
    crown: state.crown,
    rounds: state.rounds,
  });

  const act = {
    type: (text) => setInput(text),
    lay() {
      if (state.stage !== 'build') return;
      const d = asNumber(input);
      const after = listsReducer(spec, state, { type: 'try', d });
      dispatch({ type: 'try', d });
      if (after.stage !== 'buildLay') {
        play('pick');
        return;
      }
      play('sweep');
      setInput('');
      const f = plankFill(now.gap[state.side], d);
      later(300, () => {
        play(f.fills ? 'plank' : 'hit');
        dispatch({ type: 'shown' });
      });
      const known = f.fills && state.lists[state.side].includes(d);
      if (f.fills && !known) later(800, () => play('spark'));
      // the world closes a list that holds every plank
      const shown = listsReducer(spec, after, { type: 'shown' });
      if (shown.stage === 'closed') later(1200, () => play('gate'));
    },
    complete() {
      if (state.stage !== 'build') return;
      play('fail');
      later(250, () => play('plank'));
      dispatch({ type: 'complete' });
    },
    go() {
      play('pick');
      setInput('');
      dispatch({ type: 'go' });
    },
    tap(side, d) {
      if (state.stage !== 'link') return;
      const after = listsReducer(spec, state, { type: 'tap', side, d });
      if (after.stage !== 'linkLay') return;
      play('pick');
      dispatch({ type: 'tap', side, d });
      const holds = now.gap[side === 'a' ? 'b' : 'a'] % d === 0;
      later(350, () => {
        play('plank');
        dispatch({ type: 'shown' });
      });
      later(1000, () => play(holds ? 'success' : 'crumble'));
    },
    allLinked() {
      if (state.stage !== 'link') return;
      const after = listsReducer(spec, state, { type: 'allLinked' });
      // every link made: on to the longest — or, with `crown: false`, the round ends on its links
      const allMade = after.stage !== 'link';
      play(allMade ? 'key' : 'fail');
      if (!allMade) later(250, () => play('plank'));
      dispatch({ type: 'allLinked' });
    },
    pick(d) {
      if (state.stage !== 'longest') return;
      const after = listsReducer(spec, state, { type: 'pick', d });
      if (after === state) return;
      play('pick');
      dispatch({ type: 'pick', d });
      later(300, () => play('plank'));
      later(700, () => play(after.stage === 'seen' ? 'gate' : 'fail'));
    },
    next() {
      const after = listsReducer(spec, state, { type: 'next' });
      if (after.done) onDone(listsResult(after));
      else {
        setInput('');
        dispatch({ type: 'next' });
      }
    },
  };

  return <ListsView spec={spec} state={state} act={act} input={input} />;
}
