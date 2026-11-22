/**
 * THE INVESTIGATION `sort` of this world (see `Inquiry.jsx`, which mounts it; logic and state machine: `sort.js`).
 * A CLASSIFICATION: a hand of cards — a pair of gaps (a ; b) each, or a fraction a/b read as two gaps — dropped one by one
 * in one of two baskets named by the lesson.
 *
 *   card      the card lies between the two baskets, its two gaps drawn as strips on one scale; he MAY open ONE
 *             instrument he owns (the lists, the summit, the ladder: the world runs it and shows facts — numbers,
 *             divisions, planks laid —, never a conclusion), then DRAGS the card into a basket, or taps the basket.
 *   answer    a card dropped in the other basket: the world lays the plank both gaps share, or the planks of the shorter
 *             gap on the other from the longest down — then « next » takes the card to its basket.
 *   end       both baskets stay on screen with their cards.
 *
 * `spec.text` is the lesson's wording (GAME_WORLD.md « استكشف », spec shape of `sort`): before the key is forged the
 * baskets are named by what the world shows, never by the mathematical name — this file writes no word of its own.
 * The screen is a pure VIEW of the reducer's state (`SortView`).
 */
import { useReducer, useRef, useState } from 'react';
import MathText from '../../components/MathText';
import {
  initSort,
  sortNow,
  sortReducer,
  sortResult,
  sortProblems,
  listsOf,
  summitFactsOf,
  ladderFactsOf,
  toolSteps,
  witnessOf,
  answerSteps,
  basketsOf,
} from './sort';
import { Span, Calc, restTex } from './InquiryCombine';
import { Head } from './InquiryDivision';
import { expose, X0, SPAN, useLater } from './inquiryParts';
import './inquirySort.css';

/** The scene: the two strips, then the panel of facts, in a 1000 × 336 viewBox. */
const VIEW_H = 336;
const YA = 36;
const YB = 100;
const H = 30;
const PY = 160; // the baseline of the panel's label
const ROW0 = 194; // the centre of the panel's first row of chips
const RIGHT = X0 + SPAN; // the panel reads from the right
const PER_LINE = 13;

/** A card's face: a pair « a ; b » read left to right, or a fraction with a real bar. */
function CardFace({ a, b, as }) {
  if (as === 'fraction') return <MathText>{`$\\dfrac{${a}}{${b}}$`}</MathText>;
  return (
    <span className="iqs-pair" dir="ltr">
      {`(${a}\u00a0;\u00a0${b})`}
    </span>
  );
}

/** A gap with a plank laid on it; a plank too thin to draw one by one is drawn as one filled bar (as in `summit`). */
function Gap({ n, d, u, y, tag }) {
  const thin = d && d * u < 3 && Math.floor(n / d) > 0;
  return (
    <g data-iq-strip={tag}>
      <Span key={d ?? 0} n={n} d={d} u={u} y={y} h={H} laid={Boolean(d)} />
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
      <text className="iq-scene__num" x={X0 + n * u} y={y - 10} direction="ltr">
        {n}
      </text>
    </g>
  );
}

const chipW = (list) => 12 * String(Math.max(...list)).length + 22;

/** One chip of a panel: a number in a rounded frame, coloured by what it is; `under` is a small number below it. */
function Chip({ x, y, w, n, cls, under, underCls, hook }) {
  return (
    <g className={`iqs-chip ${cls}`} {...hook}>
      <rect x={x - w / 2} y={y - 17} width={w} height="34" rx="9" />
      <text x={x} y={y + 7} direction="ltr">
        {n}
      </text>
      {under != null && (
        <text className={`iqs-under ${underCls}`} x={x} y={y + 38} direction="ltr">
          {under}
        </text>
      )}
    </g>
  );
}

/** Where the k-th chip of a row stands: from the right, PER_LINE a line. */
const at = (k, from, step, y0, lh) => ({ x: from - (k % PER_LINE) * step, y: y0 + Math.floor(k / PER_LINE) * lh });
const linesOf = (n) => Math.max(1, Math.ceil(n / PER_LINE));

/** lists — the planks of a, then of b, shortest first from the right; the planks of both are marked. */
function ListsPanel({ label, a, b, shown }) {
  const L = listsOf(a, b);
  const w = chipW([...L.a, ...L.b]);
  const step = w + 6;
  const lh = 38;
  const tagW = 12 * String(Math.max(a, b)).length + 30;
  const from = RIGHT - tagW - 14 - w / 2;
  const rows = [
    { tag: 'a', n: a, list: L.a, y0: ROW0 },
    { tag: 'b', n: b, list: L.b, y0: ROW0 + linesOf(L.a.length) * lh + 4 },
  ];
  return (
    <g data-iq-panel="lists" data-iq-common={shown >= 2 ? L.common.join(',') : ''}>
      <text className="iqs-label" x={RIGHT} y={PY} direction="rtl">
        {label}
      </text>
      {rows.slice(0, shown).map((r) => (
        <g key={r.tag} data-iq-list={r.tag}>
          <rect className="iqs-tag" x={RIGHT - tagW} y={r.y0 - 17} width={tagW} height="34" rx="9" />
          <text className="iqs-tagnum" x={RIGHT - tagW / 2} y={r.y0 + 7} direction="ltr">
            {r.n}
          </text>
          {r.list.map((d, k) => {
            const p = at(k, from, step, r.y0, lh);
            const common = shown >= 2 && L.common.includes(d);
            return (
              <Chip
                key={d}
                x={p.x}
                y={p.y}
                w={w}
                n={d}
                cls={common ? 'is-common' : ''}
                hook={{ 'data-iq-plank': d, 'data-iq-both': common ? '1' : '0' }}
              />
            );
          })}
        </g>
      ))}
    </g>
  );
}

/**
 * The planks of the shorter gap from the longest down (from the right), each laid on the longer gap; under each plank laid,
 * the rest it leaves there (amber, or a green 0). Used by the instrument `summit` (it stops on the first that fills) and by
 * the world's answer « none but 1 » (it lays them all).
 */
function DescentPanel({ label, all, tried, shown, hook }) {
  const w = chipW(all);
  const step = w + 8;
  const lh = 66;
  return (
    <g
      data-iq-panel={hook}
      data-iq-laid={tried
        .slice(0, shown)
        .map((t) => t.d)
        .join(',')}
    >
      <text className="iqs-label" x={RIGHT} y={PY} direction="rtl">
        {label}
      </text>
      {all.map((d, k) => {
        const p = at(k, RIGHT - w / 2, step, ROW0, lh);
        const t = k < shown ? tried[k] : null;
        const cls = t ? (t.r === 0 ? 'is-fills' : 'is-no') : k < tried.length ? 'is-wait' : 'is-untried';
        return (
          <Chip
            key={d}
            x={p.x}
            y={p.y}
            w={w}
            n={d}
            cls={cls}
            under={t ? t.r : null}
            underCls={t && t.r === 0 ? 'is-zero' : ''}
            hook={{ 'data-iq-plank': d, ...(t ? { 'data-iq-rest': t.r } : {}) }}
          />
        );
      })}
    </g>
  );
}

/** ladder — the rows of Euclid's divisions, right column first; the rest of each row amber, the 0 green. */
function LadderPanel({ label, a, b, shown }) {
  const rows = ladderFactsOf(a, b);
  const perCol = Math.max(4, Math.ceil(rows.length / 3));
  const lh = Math.min(34, 132 / perCol);
  const colW = SPAN / 3;
  return (
    <g data-iq-panel="ladder" data-iq-rows={rows.length}>
      <text className="iqs-label" x={RIGHT} y={PY} direction="rtl">
        {label}
      </text>
      {rows.slice(0, shown).map((r, k) => {
        const col = Math.floor(k / perCol);
        return (
          <text
            key={`${r.a}-${r.b}`}
            className="iqs-row"
            x={RIGHT - colW * (col + 0.5)}
            y={ROW0 + 6 + (k % perCol) * lh}
            direction="ltr"
            data-iq-row={k}
          >
            {`${r.a} = ${r.b} × ${r.q} + `}
            <tspan className={r.r === 0 ? 'is-zero' : 'is-rest'}>{r.r}</tspan>
          </text>
        );
      })}
    </g>
  );
}

/** The plank lying on both strips now (null: the gaps are empty). */
function laidPlank(now, s) {
  if (s.stage === 'tool' || (s.stage === 'card' && s.tool)) {
    if (s.tool !== 'summit' || s.shown === 0) return null;
    return summitFactsOf(now.a, now.b).tried[s.shown - 1].d;
  }
  if ((s.stage === 'answer' || s.stage === 'answered') && s.shown > 0) {
    const w = witnessOf(now.a, now.b, s.said);
    return w.kind === 'common' ? w.d : w.planks[s.shown - 1].d;
  }
  return null;
}

/** The fact line: what the world has just done, in the lesson's words. */
function factOf(T, now, s) {
  if (s.stage === 'end') {
    const B = basketsOf(s);
    return T.end({ one: B.one.length, more: B.more.length });
  }
  if (s.stage === 'answered') {
    const w = witnessOf(now.a, now.b, s.said);
    return T.answer({ a: now.a, b: now.b, as: now.as, said: s.said, truth: now.truth, ...w });
  }
  if (s.stage === 'card' && s.tool && T.seen) return T.seen(seenFacts(now, s.tool));
  if (s.stage === 'card' && !s.tool && s.placed.length && T.placed) return T.placed(s.placed.at(-1));
  return ' ';
}

/** The facts of an instrument, handed to the lesson's `seen` (numbers only). */
function seenFacts(now, tool) {
  const { a, b, as, short, long } = now;
  if (tool === 'lists') return { tool, a, b, as, short, long, common: listsOf(a, b).common };
  if (tool === 'summit') {
    const F = summitFactsOf(a, b);
    return { tool, a, b, as, short, long, tried: F.tried.map((t) => t.d), stop: F.stop };
  }
  const rows = ladderFactsOf(a, b);
  return { tool, a, b, as, short, long, rows: rows.length, last: rows.at(-1).b };
}

/** One basket: its name (the lesson's), and the cards in it — a card the world moved there is outlined in amber. */
function Basket({ T, id, cards, s, drag, onDrop }) {
  const open = s.stage === 'card';
  const cls = [
    'iqs-basket',
    open ? 'is-open' : '',
    drag?.over === id ? 'is-over' : '',
    s.said === id && (s.stage === 'answer' || s.stage === 'answered') ? 'is-said' : '',
  ].join(' ');
  return (
    <button
      type="button"
      className={cls}
      onClick={() => onDrop(id)}
      aria-disabled={!open}
      data-iq-basket={id}
      data-iq-count={cards.length}
    >
      <span className="iqs-basket__name">{T.baskets[id]}</span>
      <span className="iqs-basket__cards">
        {cards.map((c) => (
          <span
            key={`${c.a}-${c.b}`}
            className={`iqs-mini ${c.firstTry ? '' : 'is-moved'}`}
            data-iq-placed={`${c.a}:${c.b}`}
            data-iq-moved={c.firstTry ? '0' : '1'}
          >
            <CardFace a={c.a} b={c.b} as={c.as} />
          </span>
        ))}
      </span>
    </button>
  );
}

/**
 * The screen for a state of the experiment. `act` = { open(tool), drop(basket), pick(i), next(), grab } — what the buttons
 * do; `grab` = the pointer handlers of the card (drag it to a basket); `drag` = { dx, dy, over } while it is dragged;
 * `rootRef` = the section's ref (the drag finds the basket under the pointer in it).
 */
export function SortView({ spec, state, act, drag = null, rootRef = null }) {
  const T = spec.text;
  const s = state;
  const now = sortNow(spec, s);
  const n = spec.cards.length;
  const B = basketsOf(s);
  const tools = spec.instruments ?? [];
  const d = now ? laidPlank(now, s) : null;
  const u = now ? SPAN / now.long : 0;
  const w = now && (s.stage === 'answer' || s.stage === 'answered') ? witnessOf(now.a, now.b, s.said) : null;
  const summit = now && s.tool === 'summit' ? summitFactsOf(now.a, now.b) : null;

  return (
    <section
      ref={rootRef}
      className="iq iq--div iq--sort"
      data-iq="sort"
      data-iq-stage={s.stage}
      data-iq-as={spec.as}
      {...(now ? { 'data-iq-pair': `${now.a}:${now.b}`, 'data-iq-tool': s.tool ?? '' } : {})}
    >
      <Head
        i={Math.min(s.placed.length, n - 1)}
        n={n}
        lead={T.lead({ as: spec.as, n })}
        goal={T.goal({ as: spec.as })}
      />

      <div className="iqs-tray">
        <Basket T={T} id="one" cards={B.one} s={s} drag={drag} onDrop={act.drop} />
        <div className="iqs-hand">
          {now && (
            <div
              className={`iqs-card ${drag ? 'is-held' : ''} ${s.stage === 'card' ? 'is-free' : ''}`}
              style={drag ? { transform: `translate(${drag.dx}px, ${drag.dy}px)` } : undefined}
              data-iq-card={now.i}
              {...(s.stage === 'card' ? act.grab : {})}
            >
              <CardFace a={now.a} b={now.b} as={now.as} />
            </div>
          )}
          {s.hand.length > 0 && (
            <div className="iqs-rest" data-iq-left={s.hand.length}>
              {s.hand.map((i) => (
                <button
                  key={i}
                  type="button"
                  className="iqs-mini is-hand"
                  onClick={() => act.pick(i)}
                  aria-disabled={s.stage !== 'card' || s.tool != null}
                  data-iq-hand={i}
                >
                  <CardFace a={spec.cards[i].a} b={spec.cards[i].b} as={spec.as} />
                </button>
              ))}
            </div>
          )}
        </div>
        <Basket T={T} id="more" cards={B.more} s={s} drag={drag} onDrop={act.drop} />
      </div>

      {now ? (
        <svg className="iq-scene" viewBox={`0 0 1000 ${VIEW_H}`} role="img" aria-label={`${now.a} · ${now.b}`}>
          <Gap n={now.a} d={d} u={u} y={YA} tag="a" />
          <Gap n={now.b} d={d} u={u} y={YB} tag="b" />
          {s.tool === 'lists' && <ListsPanel label={T.panel.lists(now)} a={now.a} b={now.b} shown={s.shown} />}
          {summit && (
            <DescentPanel
              label={T.panel.summit(now)}
              all={summit.all}
              tried={summit.tried}
              shown={s.shown}
              hook="summit"
            />
          )}
          {s.tool === 'ladder' && <LadderPanel label={T.panel.ladder(now)} a={now.a} b={now.b} shown={s.shown} />}
          {w?.kind === 'none' && (
            <DescentPanel
              label={T.panel.summit(now)}
              all={w.planks.map((p) => p.d)}
              tried={w.planks}
              shown={s.shown}
              hook="none"
            />
          )}
          {w?.kind === 'common' && s.shown > 0 && (
            <g data-iq-panel="common" data-iq-witness={w.d}>
              <Chip x={500} y={ROW0} w={chipW([w.d])} n={w.d} cls="is-fills" hook={{}} />
            </g>
          )}
        </svg>
      ) : (
        <div className="iqs-void" />
      )}

      <Calc items={now && d ? [restTex(now.a, d), restTex(now.b, d)] : []} />
      <p className="iq-fact" data-iq-fact>
        <MathText>{now || s.stage === 'end' ? factOf(T, now, s) : ' '}</MathText>
      </p>

      <div className="iq-actions">
        {s.stage === 'card' && (
          <>
            <p className="iq-askline">
              <MathText>{T.ask({ a: now.a, b: now.b, as: now.as, tool: s.tool })}</MathText>
            </p>
            {s.tool == null &&
              tools.map((t) => (
                <button key={t} type="button" className="rf-btn" onClick={() => act.open(t)} data-iq-open={t}>
                  {T.tools[t]}
                </button>
              ))}
          </>
        )}
        {s.stage === 'answered' && (
          <button type="button" className="rf-btn rf-btn--main" onClick={act.next} data-iq-next>
            {T.next}
          </button>
        )}
        {s.stage === 'end' && (
          <button type="button" className="rf-btn rf-btn--main" onClick={act.next} data-iq-next>
            {T.done}
          </button>
        )}
      </div>
    </section>
  );
}

/** How long the world takes for one fact it shows on its own. */
const BEAT = 450;
/** How far the card must travel before a release counts as a drop (a tap on the card is not a drop). */
const SLOP = 8;

export function Sort({ spec, play, onDone }) {
  const [state, dispatch] = useReducer((s, a) => sortReducer(spec, s, a), spec, initSort);
  const [drag, setDrag] = useState(null);
  const root = useRef(null);
  const later = useLater();
  const now = sortNow(spec, state);
  expose({
    kind: 'sort',
    // what is wrong with the lesson's spec (empty when it can be played): a walk asserts it is empty
    problems: sortProblems(spec),
    stage: state.stage,
    ci: state.ci,
    a: now?.a ?? null,
    b: now?.b ?? null,
    truth: now?.truth ?? null,
    tool: state.tool,
    shown: state.shown,
    said: state.said,
    hand: state.hand,
    placed: state.placed,
  });

  /** The basket under a point of the screen (null: none). */
  function basketAt(x, y) {
    const els = root.current?.querySelectorAll('[data-iq-basket]') ?? [];
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return el.getAttribute('data-iq-basket');
    }
    return null;
  }

  /** The world shows `count` facts one after the other, then `end`. */
  const run = (count, each, end) => {
    for (let k = 1; k <= count; k += 1)
      later(k * BEAT, () => {
        each(k);
        dispatch({ type: 'tick' });
      });
    later(count * BEAT + 300, end);
  };

  const act = {
    open(tool) {
      if (state.stage !== 'card' || state.tool != null) return;
      play('pick');
      dispatch({ type: 'open', tool });
      run(
        toolSteps(tool, now.a, now.b),
        (k) => play(tool === 'summit' ? 'plank' : 'sweep', k),
        () => tool === 'summit' && play('gate'),
      );
    },
    pick(i) {
      if (state.stage !== 'card' || state.tool != null) return;
      play('ui');
      dispatch({ type: 'pick', i });
    },
    drop(basket) {
      if (state.stage !== 'card') return;
      const after = sortReducer(spec, state, { type: 'drop', basket });
      dispatch({ type: 'drop', basket });
      if (after.stage !== 'answer') {
        play('success');
        if (after.stage === 'end') later(500, () => play('key'));
        return;
      }
      play('crumble');
      const w = witnessOf(now.a, now.b, basket);
      later(300, () =>
        run(
          answerSteps(w),
          (k) => play('plank', k),
          () => play('gate'),
        ),
      );
    },
    next() {
      const after = sortReducer(spec, state, { type: 'next' });
      if (after.done) {
        onDone(sortResult(after));
        return;
      }
      if (after === state) return;
      play('pick');
      dispatch({ type: 'next' });
      if (after.stage === 'end') later(500, () => play('key'));
    },
    grab: {
      onPointerDown(e) {
        if (state.stage !== 'card') return;
        e.currentTarget.setPointerCapture?.(e.pointerId);
        setDrag({ x0: e.clientX, y0: e.clientY, dx: 0, dy: 0, over: null });
      },
      onPointerMove(e) {
        if (!drag) return;
        const over = basketAt(e.clientX, e.clientY);
        setDrag((g) => g && { ...g, dx: e.clientX - g.x0, dy: e.clientY - g.y0, over });
      },
      onPointerUp(e) {
        if (!drag) return;
        const moved = Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) > SLOP;
        const over = basketAt(e.clientX, e.clientY);
        setDrag(null);
        if (moved && over) act.drop(over);
      },
      onPointerCancel() {
        setDrag(null);
      },
    },
  };

  return <SortView spec={spec} state={state} act={act} drag={drag} rootRef={root} />;
}
