/**
 * THE INVESTIGATION `peel` of this world (mounted by `Inquiry.jsx`; logic and state machine: `peel.js`). A round
 * shows a PLAQUE written for several equal courts together, for a part of a court, or for a court with a pile of tiles
 * added or taken — drawn: the courts side by side under ONE plate, the pile beside them marked « + » (amber) or « − »
 * (violet). He PEELS one operation at a time: four cards (share between the courts, multiply them, add tiles, take
 * tiles), each with the box of its number; the world does it on the courts and on the plate together and writes the new
 * plaque as a FACT (a share that cannot split the courts is answered by the fact, never by « wrong »). When ONE court
 * stands alone with its area, he says how many rods ride it and which — one pulled to the right, one to the left (its
 * sign printed) — and the world builds them round one post: two twin courts, one rod of length 0, or no court at all.
 * Every round stays in the table: the plaque as given → each peel → the lone court → its rods.
 *
 * `spec.text` is the lesson's wording (GAME_WORLD.md « Explore », spec shape of `peel` of « Le palais des dalles »): this file writes
 * no word, no letter x and no equation; a round's `tex` (the lesson's algebraic writing) is shown only once the round is
 * solved. The screen is a pure VIEW of the reducer's state (`PeelView`); `Peel` holds the boxes and the timers.
 */
import { useReducer, useState } from 'react';
import MathText from '../../components/MathText';
import { rootOf, tex, write } from './logic';
import {
  PEEL_LAYOUT,
  initPeel,
  peelReducer,
  peelResult,
  opsOf,
  plaqueArgs,
  piecesOf,
  rodsOf,
  absText,
  needsBar,
} from './peel';
import { FAST, expose, useLater } from '../divisorIsles/inquiryParts';
import './peel.css';

// ───────────────────────── a number on screen: a fraction always over a real bar, a true minus ─────────────────────────
/** A number of the world: digits, a comma, a true minus — and a fraction stacked over its bar (never « p/q » as text). */
function Num({ value, big = false, signed = true }) {
  const t = write(value);
  const minus = signed && t.startsWith('-');
  const body = t.replace('-', '');
  const [n, d] = body.split('/');
  return (
    <bdi dir="ltr" className={`rq-pl__num ${big ? 'is-big' : ''}`} data-iq-num={t}>
      {minus && <span className="rq-pl__minus">−</span>}
      {d == null ? (
        <span className="rq-n">{n}</span>
      ) : (
        <span className="rq-pl__fr" role="math" data-iq-frac={`${n}/${d}`}>
          <span className="rq-pl__fr-n">{n}</span>
          <span className="rq-pl__fr-d">{d}</span>
        </span>
      )}
    </bdi>
  );
}

// ───────────────────────── the scene of a plaque: the courts under one plate, the pile beside them ─────────────────────────
/** One court seen from above: its floor of tiles (a texture: the area is not counted here), its rim, its corner post. */
function CourtSvg({ part = null }) {
  // part = { of: q, kept: r } — a court cut in q strips, r of them counted by the plaque (the rest dashed)
  const id = `rq-pl-tiles-${part ? `${part.kept}-${part.of}` : 'w'}`;
  return (
    <svg className={`rq-pl__court ${part ? 'is-part' : ''}`} viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <pattern id={id} width="12.5" height="12.5" patternUnits="userSpaceOnUse">
          <rect className="rq-pl__tile" x="0.8" y="0.8" width="10.9" height="10.9" rx="1.2" />
        </pattern>
      </defs>
      {part ? (
        <>
          <rect className="rq-pl__floor is-ghost" x="4" y="4" width="92" height="92" />
          <rect
            x="4"
            y={4 + 92 * (1 - part.kept / part.of)}
            width="92"
            height={(92 * part.kept) / part.of}
            fill={`url(#${id})`}
            className="rq-pl__floor"
          />
          {Array.from({ length: part.of - 1 }, (_, k) => (
            <line
              // eslint-disable-next-line react/no-array-index-key -- the cuts of one part are fixed
              key={k}
              className="rq-pl__cut"
              x1="4"
              x2="96"
              y1={4 + (92 * (k + 1)) / part.of}
              y2={4 + (92 * (k + 1)) / part.of}
            />
          ))}
          <rect className="rq-pl__rim is-ghost" x="4" y="4" width="92" height="92" />
          <rect
            className="rq-pl__rim"
            x="4"
            y={4 + 92 * (1 - part.kept / part.of)}
            width="92"
            height={(92 * part.kept) / part.of}
          />
        </>
      ) : (
        <>
          <rect className="rq-pl__floor" x="4" y="4" width="92" height="92" fill={`url(#${id})`} />
          <rect className="rq-pl__rim" x="4" y="4" width="92" height="92" />
        </>
      )}
      <rect className="rq-pl__post" x="88" y="88" width="10" height="10" rx="2" />
    </svg>
  );
}

/** The pile of tiles beside the courts: added (amber tiles, « + ») or taken (violet holes, « − »). */
function Pile({ pile, sgn }) {
  return (
    <span className={`rq-pl__pile ${sgn > 0 ? 'is-added' : 'is-taken'}`} data-iq-pile-sign={sgn > 0 ? '+' : '-'}>
      <svg className="rq-pl__pileart" viewBox="0 0 60 44" aria-hidden="true">
        {[
          [4, 26],
          [22, 26],
          [40, 26],
          [13, 8],
          [31, 8],
        ].map(([x, y]) => (
          <rect key={`${x}-${y}`} className="rq-pl__piletile" x={x} y={y} width="16" height="16" rx="2.5" />
        ))}
      </svg>
      <span className="rq-pl__pilenum">
        <span className="rq-pl__pilesign" dir="ltr">
          {sgn > 0 ? '+' : '−'}
        </span>
        <Num value={absText(pile)} />
      </span>
    </span>
  );
}

/** The courts of a plaque: its whole courts, then its part of a court (cut in strips). */
function Courts({ courts }) {
  const { p, q } = piecesOf(courts);
  const whole = Math.floor(p / q);
  const rest = p - whole * q;
  const out = Array.from({ length: whole }, (_, k) => (
    // eslint-disable-next-line react/no-array-index-key -- identical courts
    <span key={k} className="rq-pl__courtbox" data-iq-court-piece="1">
      <CourtSvg />
    </span>
  ));
  if (rest)
    out.push(
      <span key="part" className="rq-pl__courtbox" data-iq-court-piece={`${rest}/${q}`}>
        <CourtSvg part={{ of: q, kept: rest }} />
      </span>,
    );
  return out;
}

/**
 * The plaque now: its plate (the number of tiles) over the courts and the pile it counts together, and the lesson's
 * sentence for it. `run` = the peel being done (its animation), `texShown` = the round's writing once solved.
 */
function PlaqueScene({ T, pl, args, run, texShown }) {
  const { p, q } = piecesOf(pl.courts);
  const many = Math.ceil(p / q) + (args.pileSign ? 1 : 0) >= 4;
  return (
    <div
      className={`rq-pl__scene ${run ? `is-run is-run-${run}` : ''} ${many ? 'is-many' : ''} ${FAST() ? 'is-fast' : ''}`}
      data-iq-scene="plaque"
      data-iq-courts={pl.courts}
      data-iq-pile={pl.pile}
      data-iq-value={pl.plaque}
    >
      <div className="rq-pl__group">
        <div className="rq-pl__plate" data-iq-plate={pl.plaque}>
          <Num value={pl.plaque} big />
        </div>
        <div className="rq-pl__row" dir="ltr">
          {args.pileSign !== 0 && <Pile pile={pl.pile} sgn={args.pileSign} />}
          <Courts courts={pl.courts} />
        </div>
      </div>
      <p className="rq-pl__say" data-iq-plaque>
        <MathText>{T.plaque(args)}</MathText>
      </p>
      {texShown && (
        <p className="rq-pl__tex" data-iq-tex>
          <MathText>{`$${texShown}$`}</MathText>
        </p>
      )}
    </div>
  );
}

/** A rod's name under the end drawing: its number, or — a wall — the lesson's words for it. */
function RodName({ T, rod }) {
  if (rod.root == null) return <Num value={rod.q} big />;
  return (
    <span className="rq-pl__wallname">
      <MathText>{T.wallLabel({ area: rod.root, areaTex: tex(rod.root) })}</MathText>
    </span>
  );
}

/**
 * The end of a round, round one post: two twin courts with their rods (to the right and to the left), one rod of
 * length 0, or no court at all (the plate keeps its number). `stage`: build (the platforms come down) or seen.
 */
function EndScene({ T, lone, stage, texShown }) {
  const world = rodsOf(lone);
  const built = stage === 'seen';
  return (
    <div
      className={`rq-pl__scene rq-pl__end is-${world.end} ${built ? 'is-built' : 'is-building'} ${FAST() ? 'is-fast' : ''}`}
      data-iq-scene="end"
      data-iq-end={built ? world.end : ''}
      data-iq-lone={lone}
    >
      <svg className="rq-pl__twin" viewBox="0 0 600 190" aria-hidden="true">
        <line className="rq-pl__ground" x1="20" y1="160" x2="580" y2="160" />
        {world.n === 2 && (
          <>
            <rect className="rq-pl__twincourt" x="308" y="12" width="140" height="140" />
            <rect className="rq-pl__twincourt" x="152" y="12" width="140" height="140" />
            <rect className="rq-pl__slab" x="312" y="16" width="132" height="132" data-iq-world-rod="right" />
            <rect className="rq-pl__slab" x="156" y="16" width="132" height="132" data-iq-world-rod="left" />
            <rect className="rq-pl__rod" x="300" y="166" width="148" height="9" rx="4.5" />
            <rect className="rq-pl__rod" x="152" y="166" width="148" height="9" rx="4.5" />
          </>
        )}
        {world.n === 1 && <circle className="rq-pl__dot" cx="300" cy="160" r="9" data-iq-world-rod="one" />}
        {world.n === 0 && (
          <rect className="rq-pl__nocourt" x="230" y="12" width="140" height="140" data-iq-world-rod="none" />
        )}
        <rect className="rq-pl__twinpost" x="293" y="138" width="14" height="30" rx="3" />
      </svg>
      <div className="rq-pl__names" data-iq-names>
        {/* left to right as the drawing above: the rod pulled to the left under the left court, then the right one */}
        {world.n === 2 && (
          <>
            <span className="rq-pl__name is-left" data-iq-name="left">
              {built && (
                <>
                  <span className="rq-pl__minus is-sign" dir="ltr">
                    −
                  </span>
                  <RodName T={T} rod={world.right} />
                </>
              )}
            </span>
            <span className="rq-pl__name is-right" data-iq-name="right">
              {built && <RodName T={T} rod={world.right} />}
            </span>
          </>
        )}
        {world.n === 1 && (
          <span className="rq-pl__name" data-iq-name="one">
            {built && <Num value="0" big />}
          </span>
        )}
        {world.n === 0 && (
          <span className="rq-pl__name is-none" data-iq-name="none">
            <span className="rq-pl__plate is-small">
              <Num value={lone} big />
            </span>
            {built && <span className="rq-pl__norod">{T.noRod}</span>}
          </span>
        )}
      </div>
      {texShown && (
        <p className="rq-pl__tex" data-iq-tex>
          <MathText>{`$${texShown}$`}</MathText>
        </p>
      )}
    </div>
  );
}

// ───────────────────────── the boxes: a number in its own shape ─────────────────────────
/** What may be typed: digits and one comma (a sign is never typed: the left rod's sign is printed). */
const typed = (v, whole = false) => {
  let t = String(v)
    .replace(/[.]/g, ',')
    .replace(whole ? /[^0-9]/g : /[^0-9,]/g, '');
  const [head, ...rest] = t.split(',');
  t = rest.length ? `${head},${rest.join('')}` : head;
  return t.slice(0, PEEL_LAYOUT.maxChars);
};

function Box({ value, onChange, hook, whole = false, onEnter }) {
  return (
    <input
      className="rq-num rq-pl__box"
      dir="ltr"
      inputMode={whole ? 'numeric' : 'decimal'}
      value={value}
      style={{ width: `${Math.max(2, value.length) + 1.6}ch` }}
      onChange={(e) => onChange(typed(e.target.value, whole))}
      onKeyDown={(e) => e.key === 'Enter' && onEnter?.()}
      data-iq-in={hook}
    />
  );
}

/** One box, or two boxes over a real fraction bar. `value` is « n » or « n/d ». */
function NumIn({ frac, value, onChange, hook, whole, onEnter }) {
  if (!frac) return <Box value={value} onChange={onChange} hook={hook} whole={whole} onEnter={onEnter} />;
  const [n = '', d = ''] = value.split('/');
  return (
    <span className="rq-fracin" dir="ltr">
      <Box value={n} onChange={(v) => onChange(`${v}/${d}`)} hook={`${hook}-num`} whole onEnter={onEnter} />
      <span className="rq-fracin__bar" aria-hidden="true" />
      <Box value={d} onChange={(v) => onChange(`${n}/${v}`)} hook={`${hook}-den`} whole onEnter={onEnter} />
    </span>
  );
}

/** A box's text as a number the reducer reads, or '' when it is not complete. */
const boxValue = (v) => (!v || v.endsWith('/') || v.startsWith('/') || v.endsWith(',') ? '' : v);

// ───────────────────────── the four peels ─────────────────────────
const OP_TEXT = {
  share: ['share', 'shareAfter'],
  grow: ['grow', 'growAfter'],
  add: ['add', 'addAfter'],
  take: ['take', 'takeAfter'],
};

function OpCard({ T, op, value, onType, onGo, frac }) {
  const [before, after] = OP_TEXT[op];
  const whole = op === 'share' || op === 'grow';
  return (
    <div className={`rq-pl__op rq-pl__op--${op}`} data-iq-op={op}>
      <span className="rq-pl__opword">{T[before]}</span>
      <NumIn frac={!whole && frac} value={value} onChange={onType} hook={`op-${op}`} whole={whole} onEnter={onGo} />
      {T[after] ? <span className="rq-pl__opword">{T[after]}</span> : null}
      <button type="button" className="rf-btn rq-pl__go" onClick={onGo} data-iq-op-go={op}>
        {T.doIt}
      </button>
    </div>
  );
}

// ───────────────────────── the rods he says ─────────────────────────
function RodBlock({ T, side, label, input, act, shape }) {
  const r = input[side];
  return (
    <div className={`rq-pl__rodblock is-${side}`} data-iq-rodblock={side}>
      <span className="rq-pl__rodlabel">{label}</span>
      <span className="rq-pl__forms">
        {[
          ['number', T.formNumber],
          ['wall', T.formWall],
        ].map(([f, word]) => (
          <button
            key={f}
            type="button"
            className={`rf-btn rq-formbtn ${r.form === f ? 'is-on' : ''}`}
            onClick={() => act.form(side, f)}
            data-iq-form={`${side}:${f}`}
          >
            {word}
          </button>
        ))}
      </span>
      <span className="rq-pl__rodin">
        {side === 'left' && (
          <span className="rq-pl__minus is-sign" dir="ltr" data-iq-sign>
            −
          </span>
        )}
        {r.form === 'wall' ? (
          <label className="rq-rodlabel rq-pl__wallin" data-iq-rodlabel={side}>
            <span>{T.wallBox}</span>
            <NumIn frac={shape.wall} value={r.text} onChange={(v) => act.rod(side, v)} hook={`${side}-wall`} />
            <span className="rq-unit">{T.tiles}</span>
          </label>
        ) : (
          <label className="rq-pl__rodnum">
            <i className="rq-pl__rodbar" aria-hidden="true" />
            <NumIn frac={shape.number} value={r.text} onChange={(v) => act.rod(side, v)} hook={side} />
          </label>
        )}
      </span>
    </div>
  );
}

// ───────────────────────── the table of the rounds ─────────────────────────
function CourtMark() {
  return (
    <svg className="rq-pl__mark" viewBox="0 0 20 20" aria-hidden="true">
      <rect x="2" y="2" width="16" height="16" rx="2" />
    </svg>
  );
}

/** A plaque in one chip: the courts (a mark and their number when not one), the pile, the plate. */
function PlaqueChip({ pl, hook }) {
  const a = plaqueArgs(pl);
  return (
    <span className="rq-pl__pchip" data-iq-chip={hook} dir="ltr">
      <span className="rq-pl__pcourts">
        {!(a.whole && a.num === '1') && <Num value={pl.courts} />}
        <CourtMark />
      </span>
      {a.pileSign !== 0 && (
        <span className={`rq-pl__ppile ${a.pileSign > 0 ? 'is-added' : 'is-taken'}`}>
          {a.pileSign > 0 ? '+' : '−'}
          <Num value={a.pileAbs} />
        </span>
      )}
      <span className="rq-pl__pplate">
        <Num value={pl.plaque} />
      </span>
    </span>
  );
}

const TAG = { share: '÷', grow: '×', add: '+', take: '−' };
/** A peel in the table: its sign and its number; « ↺ » when he started the plaque again. */
function PeelTag({ p }) {
  if (p.op === 'restart')
    return (
      <span className="rq-pl__tag is-restart" data-iq-tag="restart">
        ↺
      </span>
    );
  return (
    <span className={`rq-pl__tag is-${p.op}`} data-iq-tag={`${p.op}:${p.n}`} dir="ltr">
      {TAG[p.op]}
      <Num value={p.n} />
    </span>
  );
}

/** The peels a row shows: every peel that was done, the first and the last ones when there are too many. */
function tagsOf(peels) {
  const done = peels.filter((p) => p.done);
  const m = PEEL_LAYOUT.maxTags;
  if (done.length <= m) return done;
  return [done[0], null, ...done.slice(-(m - 2))];
}

function RodChip({ rod, neg = false }) {
  return (
    <span
      className={`rq-pl__rchip ${rod.root != null ? 'is-wall' : ''}`}
      dir="ltr"
      data-iq-rodchip={neg ? 'left' : 'right'}
    >
      {neg && '−'}
      {rod.root != null ? (
        <span className="rq-pl__rwall">
          <i className="rq-pl__rodbar is-small" aria-hidden="true" />
          <span className="rq-pl__rcourt">
            <Num value={rod.root} />
          </span>
        </span>
      ) : (
        <Num value={rod.q} />
      )}
    </span>
  );
}

function RodsCell({ T, world }) {
  if (world.n === 0) return <span className="rq-pl__norod">{T.noRod}</span>;
  if (world.n === 1) return <RodChip rod={world.right} />;
  return (
    <span className="rq-pl__rchips">
      <RodChip rod={world.right} />
      <RodChip rod={world.right} neg />
    </span>
  );
}

function Table({ T, rows, current }) {
  const all = current ? [...rows, current] : rows;
  return (
    <table className="rq-table rq-pl__table" data-iq-table={rows.length}>
      <thead>
        <tr>
          <th>{T.colPlaque}</th>
          <th>{T.colPeels}</th>
          <th>{T.colLone}</th>
          <th>{T.colRods}</th>
        </tr>
      </thead>
      <tbody>
        {all.map((row) => (
          <tr
            key={row.i}
            data-iq-row={row.i}
            data-iq-row-end={row.world ? row.end : ''}
            className={row.world ? `is-${row.end}` : 'is-now'}
          >
            <td>
              <PlaqueChip pl={row.given} hook="given" />
            </td>
            <td>
              <span className="rq-pl__tags">
                {tagsOf(row.peels).map((p, k) =>
                  p ? (
                    // eslint-disable-next-line react/no-array-index-key -- a row's peels only grow
                    <PeelTag key={k} p={p} />
                  ) : (
                    // eslint-disable-next-line react/no-array-index-key -- the one ellipsis of a row
                    <span key={k} className="rq-pl__tag is-more">
                      …
                    </span>
                  ),
                )}
              </span>
            </td>
            <td data-iq-cell-lone={row.lone ?? ''}>
              {row.lone != null ? (
                <span className="rq-pl__pplate">
                  <Num value={row.lone} />
                </span>
              ) : (
                <span className="rq-unknown">{T.unknown}</span>
              )}
            </td>
            <td data-iq-cell-rods={row.world ? row.end : ''}>
              {row.world ? <RodsCell T={T} world={row.world} /> : <span className="rq-unknown">{T.unknown}</span>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ───────────────────────── the screen ─────────────────────────
export const EMPTY_INPUT = {
  ops: { share: '', grow: '', add: '', take: '' },
  n: null,
  right: { form: 'number', text: '' },
  left: { form: 'number', text: '' },
};

/** What every text function receives: where he is, and the plaque now (`plaqueArgs`), with the plaque as given. */
function argsOf(spec, s) {
  return { i: s.ri, n: spec.rounds.length, ...plaqueArgs(s.now), given: plaqueArgs(s.given) };
}

/** The fact line: what the world has just done, in the lesson's words. */
function factOf(T, spec, s, args) {
  if (s.notice === 'unread') return T.unread;
  if (s.stage === 'seen') {
    const row = s.rows.at(-1);
    return T.fact({ ...args, ...row, loneTex: tex(row.lone) });
  }
  if ((s.stage === 'peel' || s.stage === 'alone') && s.last) {
    const p = s.last;
    const base = { ...args, op: p.op, n: p.n, nTex: p.n == null ? null : tex(p.n), before: plaqueArgs(p.before) };
    if (!p.done) return T.refused({ ...base, reason: p.reason, pieces: p.pieces });
    return T.peeled({ ...base, after: plaqueArgs(p.after), alone: s.stage === 'alone' });
  }
  return ' ';
}

/** The shapes of the rod boxes: the number over a bar when the side is a fraction; the wall's area over a bar. */
function rodShape(lone) {
  const side = rootOf(lone);
  return { number: side != null && needsBar(side), wall: needsBar(lone) };
}

/**
 * The screen for a state of the experiment. `act` = { opType(op, v), peel(op), restart(), count(n), form(side, f),
 * rod(side, v), answer(), next() }; `input` = the boxes (`EMPTY_INPUT`).
 */
export function PeelView({ spec, state, act, input = EMPTY_INPUT }) {
  const T = spec.text;
  const s = state;
  const args = argsOf(spec, s);
  const round = spec.rounds[s.ri];
  const L = PEEL_LAYOUT;
  const ending = s.stage === 'build' || s.stage === 'seen';
  const lone = ending || s.stage === 'alone' ? s.now.plaque : null;
  const loneArgs = lone != null ? { ...args, lone, loneTex: tex(lone) } : args;
  const texShown = s.stage === 'seen' && round.tex ? round.tex : null;
  const restartable = s.stage === 'peel' && s.peels.some((p) => p.done && p.op !== 'restart') && !sameAsGiven(s);
  const current =
    s.stage === 'seen' ? null : { i: s.ri, given: s.given, peels: s.peels, lone: lone, world: null, end: null };
  const fracOp = needsBar(s.now.pile);
  const shape = lone != null ? rodShape(lone) : null;
  const factKind =
    s.stage === 'seen' ? s.rows.at(-1).end : s.last && !s.last.done && s.stage === 'peel' ? 'refused' : '';

  return (
    <section
      className="rq-iq rq-iq--peel"
      data-iq="peel"
      data-iq-stage={s.stage}
      data-iq-round={s.ri}
      data-iq-progress={`${s.rows.length}:${spec.rounds.length}`}
      style={{ '--rq-pl-table-w': `${L.table.w}rem`, '--rq-pl-scene-h': `${L.scene.h}rem` }}
    >
      <header className="rq-iq__head">
        <p className="rq-iq__lead">
          {/* where he is among the rounds: one dot a round (never « 2 / 4 », which would read as a fraction here) */}
          <span className="rq-pl__dots" dir="ltr" aria-hidden="true">
            {spec.rounds.map((_, k) => (
              <i
                // eslint-disable-next-line react/no-array-index-key -- the rounds are fixed
                key={k}
                className={`rq-pl__dot ${k < s.rows.length ? 'is-done' : k === s.ri ? 'is-now' : ''}`}
              />
            ))}
          </span>
          <MathText>{T.lead(args)}</MathText>
        </p>
        <p className="rq-iq__goal" data-iq-goal>
          <span aria-hidden="true">🎯</span> <MathText>{T.goal(args)}</MathText>
        </p>
      </header>

      <div className="rq-pl__body">
        <div className="rq-pl__main">
          {ending ? (
            <EndScene T={T} lone={lone} stage={s.stage} texShown={texShown} />
          ) : (
            <PlaqueScene
              T={T}
              pl={s.stage === 'run' ? s.pending.before : s.now}
              args={s.stage === 'run' ? plaqueArgs(s.pending.before) : plaqueArgs(s.now)}
              run={s.stage === 'run' ? s.pending.op : null}
              texShown={null}
            />
          )}

          {(s.stage === 'peel' || s.stage === 'run') && (
            <div className="rq-pl__talk">
              <p className="rq-ask" data-iq-ask>
                <MathText>{T.askPeel(args)}</MathText>
              </p>
              <div className={`rq-pl__ops ${s.stage === 'run' ? 'is-busy' : ''}`} data-iq-ops>
                {opsOf(spec).map((op) => (
                  <OpCard
                    key={op}
                    T={T}
                    op={op}
                    value={input.ops[op]}
                    onType={(v) => act.opType(op, v)}
                    onGo={() => act.peel(op)}
                    frac={fracOp}
                  />
                ))}
                {restartable && (
                  <button type="button" className="rf-btn rq-pl__restart" onClick={act.restart} data-iq-restart>
                    {T.restart}
                  </button>
                )}
              </div>
            </div>
          )}

          {(s.stage === 'alone' || s.stage === 'build') && (
            <div className="rq-pl__talk">
              <p className="rq-ask" data-iq-ask>
                <MathText>{T.askRods(loneArgs)}</MathText>
              </p>
              {s.stage === 'alone' && (
                <>
                  <div className="rq-actions rq-pl__taps">
                    {[
                      [2, T.countTwo],
                      [1, T.countOne],
                      [0, T.countNone],
                    ].map(([v, word]) => (
                      <button
                        key={v}
                        type="button"
                        className={`rf-btn ${input.n === v ? 'is-on' : ''}`}
                        onClick={() => act.count(v)}
                        data-iq-count={v}
                      >
                        {word}
                      </button>
                    ))}
                    {input.n != null && (
                      <button
                        type="button"
                        className="rf-btn rf-btn--main rq-pl__build"
                        onClick={act.answer}
                        data-iq-build
                      >
                        {T.build}
                      </button>
                    )}
                  </div>
                  {input.n != null && (
                    <div className="rq-pl__rods" data-iq-rods={input.n}>
                      {/* side by side as the rods are pulled: the left one on the left, the right one on the right */}
                      {input.n === 2 && (
                        <RodBlock T={T} side="left" label={T.leftRod} input={input} act={act} shape={shape} />
                      )}
                      {input.n >= 1 && (
                        <RodBlock
                          T={T}
                          side="right"
                          label={input.n === 1 ? T.oneRod : T.rightRod}
                          input={input}
                          act={act}
                          shape={shape}
                        />
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {s.stage === 'seen' && (
            <div className="rq-actions">
              <button type="button" className="rf-btn rf-btn--main" onClick={act.next} data-iq-next>
                {s.ri + 1 >= spec.rounds.length ? T.done : T.next}
              </button>
            </div>
          )}

          <p className={`rq-fact rq-pl__fact ${factKind ? `is-${factKind}` : ''}`} data-iq-fact>
            <MathText>{factOf(T, spec, s, args)}</MathText>
          </p>
        </div>

        <Table T={T} rows={s.rows} current={current} />
      </div>
    </section>
  );
}

/** Is the plaque now the plaque as given (nothing to start again)? */
function sameAsGiven(s) {
  return s.now.courts === s.given.courts && s.now.pile === s.given.pile;
}

/** The world does a peel in about 1 s (`.rq-pl__scene.is-run`); it builds the rods in about 1.2 s. */
const RUN = 1100;
const BUILD = 1300;

export function Peel({ spec, play, onDone }) {
  const [state, dispatch] = useReducer((s, a) => peelReducer(spec, s, a), spec, initPeel);
  const [input, setInput] = useState(EMPTY_INPUT);
  const later = useLater();
  expose({
    kind: 'peel',
    ri: state.ri,
    n: spec.rounds.length,
    stage: state.stage,
    now: state.now,
    peels: state.peels,
    rows: state.rows,
  });

  const rodOf = (r) => {
    const v = boxValue(r.text);
    if (!v) return null;
    return r.form === 'wall' ? { root: v } : { q: v };
  };

  const act = {
    opType: (op, v) => setInput((x) => ({ ...x, ops: { ...x.ops, [op]: v } })),
    peel(op) {
      if (state.stage !== 'peel') return;
      const n = boxValue(input.ops[op]);
      const after = peelReducer(spec, state, { type: 'peel', op, n });
      play('pick');
      dispatch({ type: 'peel', op, n });
      if (after.stage === 'run') {
        setInput((x) => ({ ...x, ops: EMPTY_INPUT.ops }));
        later(120, () => play('sweep'));
        later(RUN, () => {
          const ran = peelReducer(spec, after, { type: 'ran' });
          play(ran.stage === 'alone' ? 'gate' : 'plank');
          dispatch({ type: 'ran' });
        });
      } else if (after.last && after.last !== state.last && !after.last.done) later(150, () => play('hit'));
    },
    restart() {
      play('ui');
      dispatch({ type: 'restart' });
    },
    count(n) {
      play('ui');
      setInput((x) => ({ ...x, n }));
    },
    form(side, form) {
      play('ui');
      setInput((x) => ({ ...x, [side]: { form, text: '' } }));
    },
    rod: (side, text) => setInput((x) => ({ ...x, [side]: { ...x[side], text } })),
    answer() {
      if (state.stage !== 'alone') return;
      const said = { n: input.n, right: rodOf(input.right), left: rodOf(input.left) };
      const after = peelReducer(spec, state, { type: 'answer', said });
      dispatch({ type: 'answer', said });
      if (after.stage !== 'build') {
        play('pick');
        return;
      }
      play('pick');
      later(120, () => play('sweep'));
      later(BUILD, () => {
        const built = peelReducer(spec, after, { type: 'built' });
        const row = built.rows.at(-1);
        play(row.world.n ? 'gate' : 'hit');
        dispatch({ type: 'built' });
        later(450, () => play(row.right ? 'key' : 'fail'));
      });
    },
    next() {
      const after = peelReducer(spec, state, { type: 'next' });
      setInput(EMPTY_INPUT);
      if (after.done) onDone(peelResult(after));
      else {
        play('ui');
        dispatch({ type: 'next' });
      }
    },
  };

  return <PeelView spec={spec} state={state} act={act} input={input} />;
}
