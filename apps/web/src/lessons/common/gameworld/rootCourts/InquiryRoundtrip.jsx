/**
 * THE INVESTIGATION `roundtrip` of this world (mounted by `Inquiry.jsx`; logic and state machine: `roundtrip.js`). Two
 * stations stand side by side — « build » (a rod goes in, a court comes out, unrolled tile by tile — block by block when
 * it is large — and its plaque stamped) and « take » (a court goes in, a rod is drawn out along its wall). A journey
 * starts from a rod, a court or a walk of the robot from the post, and goes through its stations. Before each station
 * runs he TYPES what will come out — a plaque (a number with its printed unit), or a rod (a number, or « the side of the
 * court of [ ] » typed inside a drawn rod label). The station runs and shows what came out; a miss is answered by that
 * fact, never by « wrong ». Each journey stays drawn as a strip of what went in and what came out.
 *
 * The unrolling court and the rod drawn out of a court are THIS file's pieces (the shared `Court` lowers a platform; it
 * does not unroll). `spec.text` is the lesson's wording: this file writes no word, and draws no sign of the rule.
 * The screen is a pure VIEW of the reducer's state (`RoundtripView`).
 */
import { useReducer, useState } from 'react';
import MathText from '../../components/MathText';
import { approx, isDecimal, platform, rootOf, write } from './logic';
import { initRoundtrip, roundtripReducer, roundtripResult, stepNow } from './roundtrip';
import { expose, useLater } from '../divisorIsles/inquiryParts';

// ───────────────────────── the pieces: a court, a rod, a walk, drawn in a zone of the scene ─────────────────────────
/** A zone of the scene: 170 units wide; a court is drawn 120 units on a side. */
const ZW = 170;
const D = 120;

/**
 * A court drawn as its floor: unit tiles (cut along two walls when its side has no whole number of tiles), or blocks
 * of 10 × 10 tiles once its side passes 20 tiles. `unroll` lays it row after row from `delay` (seconds).
 */
function CourtPiece({ area, x, y, unroll = false, delay = 0, dur = 0.9 }) {
  const side = Math.sqrt(approx(area));
  const u = side > 20 ? 10 : 1; // a block of 10 × 10 tiles
  const n = Math.max(1, Math.ceil(side / u - 1e-9));
  const px = D / side;
  const rows = Array.from({ length: n }, (_, r) => r);
  const cell = (k) => Math.min(u, side - k * u) * px;
  const r2 = (v) => Math.round(v * 100) / 100;
  return (
    <g className="rq-court" data-rt-court={area} data-rt-blocks={u === 10 ? 'yes' : 'no'}>
      <rect className="rq-court__floor" x={x} y={y} width={D} height={D} />
      {rows.map((r) => (
        <g
          key={r}
          className={unroll ? 'rq-unroll' : ''}
          style={unroll ? { animationDelay: `${r2(delay + (r * dur) / n)}s` } : undefined}
        >
          {rows.map((c) => (
            <rect
              key={c}
              className={`rq-court__tile ${cell(r) < u * px - 1e-6 || cell(c) < u * px - 1e-6 ? 'is-cut' : ''}`}
              x={r2(x + c * u * px)}
              y={r2(y + r * u * px)}
              width={r2(Math.max(0, cell(c)))}
              height={r2(Math.max(0, cell(r)))}
            />
          ))}
        </g>
      ))}
      <rect className="rq-court__rim" x={x} y={y} width={D} height={D} />
    </g>
  );
}

/** The plaque on a court's gate, stamped when the court comes out. */
function Plaque({ T, area, cx, y, stamp = false, delay = 0 }) {
  const label = T.plaque({ area });
  const w = Math.min(ZW, 30 + label.length * 11);
  return (
    <g
      className={`rq-plaque ${stamp ? 'is-stamped' : ''}`}
      style={stamp ? { animationDelay: `${delay}s` } : undefined}
      data-rt-plaque={area}
    >
      <rect x={cx - w / 2} y={y} width={w} height="34" rx="8" />
      <text x={cx} y={y + 24} textAnchor="middle" direction="ltr">
        {label}
      </text>
    </g>
  );
}

/** A rod: a bar of the court's side, its number under it — or, for a wall, the lesson's words for it. */
function RodPiece({ T, rod, x, y, grow = false, delay = 0 }) {
  const label = rod.root != null ? T.wallLabel({ area: rod.root }) : rod.q;
  return (
    <g className="rq-rodp" data-rt-rod={rod.root != null ? `wall:${rod.root}` : rod.q}>
      <rect
        className={`rq-rodp__bar ${grow ? 'is-growing' : ''}`}
        style={grow ? { animationDelay: `${delay}s` } : undefined}
        x={x}
        y={y - 7}
        width={D}
        height="14"
        rx="7"
      />
      <text
        className={`rq-rodp__label ${rod.root != null ? 'is-wall' : ''} ${grow ? 'is-late' : ''}`}
        style={grow ? { animationDelay: `${delay + 0.6}s` } : undefined}
        x={x + D / 2}
        y={y + 36}
        textAnchor="middle"
        direction="ltr"
      >
        {label}
      </text>
    </g>
  );
}

/** A small robot glyph: the mark where the walk ended (no person is drawn). */
function Robot({ cx, y }) {
  return (
    <g className="rq-robot" aria-hidden="true">
      <line x1={cx} y1={y - 34} x2={cx} y2={y - 27} />
      <circle cx={cx} cy={y - 36} r="3" />
      <rect x={cx - 11} y={y - 27} width="22" height="18" rx="6" />
      <circle className="rq-robot__eye" cx={cx - 5} cy={y - 18} r="2.6" />
      <circle className="rq-robot__eye" cx={cx + 5} cy={y - 18} r="2.6" />
    </g>
  );
}

/** A walk from the post: a graduated wall, the post in its middle, the robot's mark at the walk, the stretch walked. */
function WalkPiece({ walk, x, y }) {
  const v = approx(walk);
  const reach = Math.ceil(Math.abs(v)) + 2;
  const mid = x + ZW / 2;
  const step = (ZW / 2 - 6) / reach;
  const at = mid + v * step;
  return (
    <g className="rq-walk" data-rt-walk={walk}>
      <line className="rq-walk__wall" x1={x} y1={y} x2={x + ZW} y2={y} />
      {Array.from({ length: 2 * reach + 1 }, (_, k) => k - reach).map((t) => (
        <line key={t} className="rq-walk__tick" x1={mid + t * step} y1={y - 5} x2={mid + t * step} y2={y + 5} />
      ))}
      <line className="rq-walk__stretch" x1={mid} y1={y} x2={at} y2={y} />
      <rect className="rq-walk__post" x={mid - 4} y={y - 26} width="8" height="34" rx="2" />
      <Robot cx={at} y={y - 4} />
      <text className="rq-walk__num" x={mid} y={y + 30} textAnchor="middle" direction="ltr">
        0
      </text>
      <text className="rq-walk__num is-mark" x={at} y={y + 30} textAnchor="middle" direction="ltr">
        {write(walk).replace('-', '−')}
      </text>
    </g>
  );
}

/** A thing in a zone (x = the zone's left edge). */
function Thing({ T, t, x, top }) {
  if (t.walk != null) return <WalkPiece walk={t.walk} x={x} y={top + 80} />;
  if (t.court != null)
    return (
      <>
        <CourtPiece area={t.court} x={x + (ZW - D) / 2} y={top} />
        <Plaque T={T} area={t.court} cx={x + ZW / 2} y={top + D + 10} />
      </>
    );
  return <RodPiece T={T} rod={t.rod} x={x + (ZW - D) / 2} y={top + 70} />;
}

// ───────────────────────── the two stations ─────────────────────────
const SW = 1000;
const SH = 330;
/**
 * The two machines, left to right: « build » on the left (it comes first in the reading), « take » on the right. Inside
 * a station (470 units), things go in on its LEFT (the slot, `inn`), the machine stands in the middle, and what comes
 * out lies on its RIGHT (the tray, `out`), under an arrow pointing right. Exported for the test that pins this order.
 */
export const ROUNDTRIP_LAYOUT = { machine: { build: 20, take: 520 }, inn: 0, body: 180, out: 300, zone: ZW };
const MACHINE = ROUNDTRIP_LAYOUT.machine;
const TOP = 104; // the top of what sits in a zone
/** The scene is drawn at about 0.87 of its viewBox (18 rem high): 22 units ≈ 20 px at 1366 × 768. */
const SCENE_REM = 18;

function Station({ T, op, x, active, stage, now, ko }) {
  const title = op === 'build' ? T.buildName : T.takeName;
  const out = { x: x + ROUNDTRIP_LAYOUT.out, w: ZW }; // the output tray, on the right: things come out rightward
  const inn = { x: x + ROUNDTRIP_LAYOUT.inn }; // the slot, on the left: things go in from the left
  const running = active && stage === 'run';
  const shown = active && (stage === 'run' || stage === 'seen');
  return (
    <g
      className={`rq-st rq-st--${op} ${active ? 'is-active' : ''} ${running ? 'is-running' : ''}`}
      data-rt-station={op}
      data-rt-station-state={active ? stage : 'idle'}
    >
      <text className="rq-st__title" x={x + 240} y="34" textAnchor="middle" direction="ltr">
        {title}
      </text>
      {/* the machine: a housing, a window that lights while it runs, its slot and its chute */}
      <rect className="rq-st__body" x={x + 180} y="78" width="110" height="196" rx="16" />
      <rect className="rq-st__window" x={x + 198} y="100" width="74" height="60" rx="8" />
      {op === 'build' ? (
        <g className="rq-st__icon">
          {[0, 1, 2].map((r) =>
            [0, 1, 2].map((c) => (
              <rect key={`${r}${c}`} x={x + 214 + c * 15} y={113 + r * 12} width="12" height="9" rx="1.5" />
            )),
          )}
        </g>
      ) : (
        <g className="rq-st__icon">
          <rect x={x + 210} y="116" width="50" height="34" rx="2" className="rq-st__icon-court" />
          <rect x={x + 206} y="146" width="58" height="8" rx="4" />
        </g>
      )}
      <rect className="rq-st__slot" x={x + 286} y="196" width="12" height="54" rx="4" />
      <rect className="rq-st__slot" x={x + 172} y="196" width="12" height="54" rx="4" />
      <path className="rq-st__arrow" d={`M ${x + 302} 300 h 120 m 0 0 l -12 -8 m 12 8 l -12 8`} />

      {active && (
        <g key={`in-${ko}`} className={`rq-st__in ${shown ? 'is-going' : ''}`} data-rt-in>
          <Thing T={T} t={now.in} x={inn.x} top={TOP} />
        </g>
      )}
      {active && !shown && (
        <g className="rq-st__wait" data-rt-wait>
          <rect x={out.x + (ZW - D) / 2} y={TOP} width={D} height={D} rx="10" />
          <text x={out.x + ZW / 2} y={TOP + D / 2 + 14} textAnchor="middle">
            {T.unknown}
          </text>
        </g>
      )}
      {shown && (
        <g key={`out-${ko}`} className="rq-st__out" data-rt-out>
          {op === 'build' ? (
            <>
              <CourtPiece area={now.out.court} x={out.x + (ZW - D) / 2} y={TOP} unroll delay={0.6} />
              <Plaque T={T} area={now.out.court} cx={out.x + ZW / 2} y={TOP + D + 10} stamp delay={1.6} />
            </>
          ) : (
            <>
              {/* the court that went in, as a ghost: the rod is drawn out along its wall */}
              <rect className="rq-st__ghost" x={out.x + (ZW - D) / 2} y={TOP} width={D} height={D} />
              <RodPiece T={T} rod={now.out.rod} x={out.x + (ZW - D) / 2} y={TOP + D} grow delay={0.6} />
            </>
          )}
        </g>
      )}
    </g>
  );
}

// ───────────────────────── the strip of a journey ─────────────────────────
/** One thing of a strip, as a chip: a rod (a bar and its number; a wall: a bar on a small court), a court, a walk. */
function Chip({ T, t, hidden }) {
  if (hidden)
    return (
      <span className="rq-tchip is-hidden" data-rt-chip="?">
        {T.unknown}
      </span>
    );
  if (t.court != null)
    return (
      <span className="rq-tchip rq-tchip--court" data-rt-chip={`court:${t.court}`}>
        <bdi dir="ltr" className="rq-n">
          {t.court}
        </bdi>
      </span>
    );
  if (t.walk != null)
    return (
      <span className="rq-tchip rq-tchip--walk" data-rt-chip={`walk:${t.walk}`}>
        <svg viewBox="0 0 40 16" aria-hidden="true">
          <line x1="2" y1="8" x2="38" y2="8" />
          <rect x="18" y="1" width="4" height="14" rx="1" />
        </svg>
        <bdi dir="ltr" className="rq-n">
          {write(t.walk).replace('-', '−')}
        </bdi>
      </span>
    );
  const r = t.rod;
  return (
    <span
      className={`rq-tchip rq-tchip--rod ${r.root != null ? 'is-wall' : ''}`}
      data-rt-chip={r.root != null ? `wall:${r.root}` : `rod:${r.q}`}
    >
      <i className="rq-tchip__bar" aria-hidden="true" />
      {r.root != null ? (
        <span className="rq-tchip__court">
          <bdi dir="ltr" className="rq-n">
            {r.root}
          </bdi>
        </span>
      ) : (
        <bdi dir="ltr" className="rq-n">
          {r.q}
        </bdi>
      )}
    </span>
  );
}

function Strip({ T, round, chain, shownTo, now, k }) {
  return (
    <li className={`rq-strip ${now ? 'is-now' : ''}`} data-rt-strip={k}>
      <span className="rq-strip__n" dir="ltr">
        {k + 1}
      </span>
      <Chip T={T} t={chain[0]} />
      {round.path.map((op, j) => (
        // eslint-disable-next-line react/no-array-index-key -- a path is fixed
        <span key={j} className="rq-strip__step">
          <i className={`rq-strip__op rq-strip__op--${op}`} data-rt-op={op} aria-hidden="true" />
          <Chip T={T} t={chain[j + 1]} hidden={j + 1 > shownTo} />
        </span>
      ))}
    </li>
  );
}

// ───────────────────────── the answer, in its own shape ─────────────────────────
/** What may be typed in a box: a sign in front, digits, one comma. */
const typed = (v, signed) => {
  let t = v.replace(/[.]/g, ',').replace(/[^0-9,\-−]/g, '');
  t = t.replace(/−/g, '-');
  const neg = signed && t.startsWith('-');
  t = t.replace(/-/g, '');
  const [head, ...rest] = t.split(',');
  t = rest.length ? `${head},${rest.join('')}` : head;
  return (neg ? '-' : '') + t.slice(0, 12);
};

function Box({ value, onChange, signed = false, hook, onEnter }) {
  return (
    <input
      className="rq-num"
      dir="ltr"
      inputMode="decimal"
      value={value}
      style={{ width: `${Math.max(3, value.length) + 1.4}ch` }}
      onChange={(e) => onChange(typed(e.target.value, signed))}
      onKeyDown={(e) => e.key === 'Enter' && onEnter?.()}
      data-iq-in={hook}
    />
  );
}

/** A number box, or two boxes over a real fraction bar when the number has no decimal writing. */
function NumIn({ frac, value, onChange, signed, hook, onEnter }) {
  if (!frac) return <Box value={value} onChange={onChange} signed={signed} hook={hook} onEnter={onEnter} />;
  const [n = '', d = ''] = value.split('/');
  return (
    <span className="rq-fracin" dir="ltr">
      <Box value={n} onChange={(v) => onChange(`${v}/${d}`)} signed={signed} hook={`${hook}-num`} onEnter={onEnter} />
      <span className="rq-fracin__bar" aria-hidden="true" />
      <Box value={d} onChange={(v) => onChange(`${n}/${v}`)} hook={`${hook}-den`} onEnter={onEnter} />
    </span>
  );
}

/** The shape each answer takes: is its number a fraction with no decimal writing? */
function shapeOf(now) {
  if (now.op === 'build') return { plaque: !isDecimal(now.out.court) };
  const area = write(platform(now.out.rod));
  const side = rootOf(area);
  return { number: side != null && !isDecimal(side), wall: !isDecimal(area) };
}

/** The answer of the boxes, as the reducer reads it. */
function saidOf(op, input) {
  const v = input.text;
  if (!v || /^-?$/.test(v) || v.endsWith('/') || v.startsWith('/')) return null;
  if (op === 'build') return { area: v };
  return input.form === 'wall' ? { root: v } : { q: v };
}

/** The fact line: what the world has just done, in the lesson's words. */
function factOf(T, spec, s) {
  if (s.notice === 'unread' && s.stage === 'ask') return T.unread;
  if (s.stage !== 'seen') return ' ';
  const st = s.steps.at(-1);
  const r = spec.rounds[s.ri];
  return T.ran({ ...st, said: st.predicted, si: s.si, last: s.si + 1 >= r.path.length, from: r.from, path: r.path });
}

/**
 * The screen for a state of the experiment. `act` = { type(text), form(f), run(), next() }; `input` = { text, form }.
 */
export function RoundtripView({ spec, state, act, input = { text: '', form: 'number' } }) {
  const T = spec.text;
  const s = state;
  const r = spec.rounds[s.ri];
  const now = stepNow(spec, s);
  const n = spec.rounds.length;
  const shape = shapeOf(now);
  const lastStep = s.si + 1 >= r.path.length;
  const ko = `${s.ri}-${s.si}`;
  const args = { i: s.ri, n, from: r.from, path: r.path, si: s.si, op: now.op, in: now.in };
  // the strips: every journey done, then this one up to what has come out
  const doneRounds = s.rows.length - (s.stage === 'seen' && lastStep ? 1 : 0);
  const shownTo = s.si + (s.stage === 'seen' ? 1 : 0);

  return (
    <section
      className="rq-iq rq-iq--rt"
      data-iq="roundtrip"
      data-iq-stage={s.stage}
      data-iq-round={s.ri}
      data-iq-step={s.si}
      data-iq-op={now.op}
    >
      <header className="rq-iq__head">
        <p className="rq-iq__lead">
          <span className="rq-iq__count" dir="ltr">
            {s.ri + 1}&nbsp;/&nbsp;{n}
          </span>
          <MathText>{T.lead(args)}</MathText>
        </p>
        <p className="rq-iq__goal" data-iq-goal>
          <span aria-hidden="true">🎯</span> {T.goal(args)}
        </p>
      </header>

      <div className="rq-rt__body">
        <div className="rq-rt__main">
          <svg
            className="rq-rt__scene"
            viewBox={`0 0 ${SW} ${SH}`}
            style={{ height: `${SCENE_REM}rem` }}
            role="img"
            aria-label={`${T.buildName} — ${T.takeName}`}
            data-rt-scene
          >
            {['build', 'take'].map((op) => (
              <Station
                key={op}
                T={T}
                op={op}
                x={MACHINE[op]}
                active={now.op === op}
                stage={s.stage}
                now={now}
                ko={ko}
              />
            ))}
          </svg>

          {s.stage === 'ask' && (
            <div className="rq-rt__answer" data-iq-answer={now.op}>
              <p className="rq-ask" data-iq-ask>
                <MathText>{now.op === 'build' ? T.askBuild(args) : T.askTake(args)}</MathText>
              </p>
              <div className="rq-rt__row">
                {now.op === 'take' && (
                  <span className="rq-rt__forms">
                    {[
                      ['number', T.formNumber],
                      ['wall', T.formWall],
                    ].map(([f, label]) => (
                      <button
                        key={f}
                        type="button"
                        className={`rf-btn rq-formbtn ${input.form === f ? 'is-on' : ''}`}
                        onClick={() => act.form(f)}
                        data-iq-form={f}
                      >
                        {label}
                      </button>
                    ))}
                  </span>
                )}
                {now.op === 'build' ? (
                  <label className="rq-rt__plaque">
                    <NumIn
                      frac={shape.plaque}
                      value={input.text}
                      onChange={act.type}
                      signed
                      hook="plaque"
                      onEnter={act.run}
                    />
                    <span className="rq-unit">{T.tiles}</span>
                  </label>
                ) : input.form === 'wall' ? (
                  <label className="rq-rodlabel" data-iq-rodlabel>
                    <span>{T.wallBox}</span>
                    <NumIn frac={shape.wall} value={input.text} onChange={act.type} hook="area" onEnter={act.run} />
                    <span className="rq-unit">{T.tiles}</span>
                  </label>
                ) : (
                  <label className="rq-rt__rodnum">
                    <i className="rq-tchip__bar" aria-hidden="true" />
                    <NumIn
                      frac={shape.number}
                      value={input.text}
                      onChange={act.type}
                      signed
                      hook="rod"
                      onEnter={act.run}
                    />
                  </label>
                )}
                <button type="button" className="rf-btn rf-btn--main" onClick={act.run} data-iq-run>
                  {T.run}
                </button>
              </div>
            </div>
          )}
          {s.stage === 'seen' && (
            <div className="rq-rt__answer">
              <button type="button" className="rf-btn rf-btn--main" onClick={act.next} data-iq-next>
                {!lastStep ? T.go : s.ri + 1 >= n ? T.done : T.next}
              </button>
            </div>
          )}
          <p className={`rq-fact ${s.stage === 'seen' ? 'is-seen' : ''}`} data-iq-fact>
            <MathText>{factOf(T, spec, s)}</MathText>
          </p>
        </div>

        <ol className="rq-strips" data-iq-strips>
          {spec.rounds.slice(0, doneRounds).map((round, k) => (
            // eslint-disable-next-line react/no-array-index-key -- the journeys are fixed
            <Strip
              key={k}
              T={T}
              round={round}
              chain={s.rows[k].steps.reduce((c, st) => [...c, st.out], [round.from])}
              shownTo={99}
              k={k}
            />
          ))}
          <Strip T={T} round={r} chain={s.chain} shownTo={shownTo} now k={s.ri} />
        </ol>
      </div>
    </section>
  );
}

/** A station runs: what goes in slides in (0.6 s), what comes out unrolls or is drawn out, the plaque is stamped. */
const RUN = 2100;

export function Roundtrip({ spec, play, onDone }) {
  const [state, dispatch] = useReducer((s, a) => roundtripReducer(spec, s, a), spec, initRoundtrip);
  const [input, setInput] = useState({ text: '', form: 'number' });
  const later = useLater();
  const now = stepNow(spec, state);
  expose({
    kind: 'roundtrip',
    ri: state.ri,
    si: state.si,
    stage: state.stage,
    op: now.op,
    in: now.in,
    rows: state.rows,
  });

  const act = {
    type: (text) => setInput((v) => ({ ...v, text })),
    form: (form) => {
      play('ui');
      setInput({ text: '', form });
    },
    run() {
      if (state.stage !== 'ask') return;
      const said = saidOf(now.op, input);
      const after = roundtripReducer(spec, state, { type: 'say', said });
      dispatch({ type: 'say', said });
      if (after.stage !== 'run') {
        play('pick');
        return;
      }
      play('sweep');
      later(600, () => play(now.op === 'build' ? 'plank' : 'sweep'));
      later(1600, () => play(now.op === 'build' ? 'hit' : 'plank'));
      later(RUN, () => {
        const ran = roundtripReducer(spec, after, { type: 'ran' });
        play(ran.steps.at(-1).right ? 'key' : 'spark');
        dispatch({ type: 'ran' });
      });
    },
    next() {
      const after = roundtripReducer(spec, state, { type: 'next' });
      setInput({ text: '', form: 'number' });
      if (after.done) onDone(roundtripResult(after));
      else {
        play('ui');
        dispatch({ type: 'next' });
      }
    },
  };

  return <RoundtripView spec={spec} state={state} act={act} input={input} />;
}
