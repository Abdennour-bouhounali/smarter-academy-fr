/**
 * THE INVESTIGATION `chase` of this world (mounted by `Inquiry.jsx`; logic and state machine: `chase.js`). The court of
 * area `spec.a` is in front of him, and the fractions of `spec.fracs` are tried on it one after the other, each a rod
 * p/q drawn with its real bar. For each one he says BEFORE what its platform will do — a band, a jam, it rides; the
 * platform comes down on the court (drawn here, to scale), and the card beside it writes the FACT on one common
 * denominator: the platform holds p × p small tiles of side 1/q, the court a × q × q — two whole numbers, and the sign
 * between them. When the gap at the far corner is too thin to see, a magnifier opens on it (a power of ten, written).
 * Every fraction tried stays in the table. Last, one question asks what he observed — in how many did it ride? — and
 * the world answers with the count.
 *
 * The court is THIS file's drawing: the shared `Court` lowers ONE platform and writes the world's own words beside it
 * (it stacks a fraction too, since 2026-11-21); here the drawing holds no word. `spec.text` is the lesson's wording
 * (GAME_WORLD.md « Explore », spec shape of `chase`): this file writes no word, and nothing it draws names the rule.
 * The screen is a pure VIEW of the reducer's state (`ChaseView`).
 */
import { useReducer } from 'react';
import MathText from '../../components/MathText';
import {
  initChase,
  chaseReducer,
  chaseResult,
  rowNow,
  fracOf,
  lensPower,
  relation,
  KINDS,
  COUNTS,
  CHASE_LAYOUT,
} from './chase';
import { FAST, expose, useLater } from '../divisorIsles/inquiryParts';

// ───────────────────────── a fraction, always over a real bar ─────────────────────────
/** p over a bar over q — DOM, left to right; never « p/q » as text. */
function Frac({ p, q, big = false }) {
  return (
    <span className={`rq-fr ${big ? 'rq-fr--big' : ''}`} dir="ltr" role="math" data-iq-frac={`${p}/${q}`}>
      <span className="rq-fr__n">{p}</span>
      <span className="rq-fr__d">{q}</span>
    </span>
  );
}

// ───────────────────────── the court, drawn to scale, and the magnifier on its far corner ─────────────────────────
const { w: VW, h: VH } = CHASE_LAYOUT.court.view;
/** The court's drawing, left to right: its post at the bottom LEFT (the court grows right and up), the lens right of it. */
export const CHASE_COURT = { post: { x: 20, y: 222 }, room: 172, lens: { cx: 256, cy: 82, r: 52 } };
const { post: POST, room: ROOM, lens: LENS } = CHASE_COURT; // the far corner is the top RIGHT
const LENS_FONT = CHASE_LAYOUT.court.font;
const r2 = (v) => Math.round(v * 100) / 100;

/** The court's floor: unit tiles from the post (cut along the far walls), or blocks of 10 × 10 past 20 tiles a side. */
function Floor({ L, u }) {
  const step = L > 20 ? 10 : 1;
  const n = Math.ceil(L / step - 1e-9);
  const out = [];
  for (let i = 0; i < n; i += 1)
    for (let j = 0; j < n; j += 1) {
      const w = Math.min(step, L - i * step);
      const h = Math.min(step, L - j * step);
      out.push(
        <rect
          key={`${i}-${j}`}
          className={`rq-ch__tile ${w < step - 1e-9 || h < step - 1e-9 ? 'is-cut' : ''}`}
          x={r2(POST.x + i * step * u)}
          y={r2(POST.y - (j * step + h) * u)}
          width={r2(w * u)}
          height={r2(h * u)}
        />,
      );
    }
  return <g className="rq-ch__floor">{out}</g>;
}

/** « ×10 », « ×100 », « ×1000 », then « ×10 » and its exponent. */
function Factor({ k }) {
  const y = LENS.cy + LENS.r + LENS_FONT + 10;
  return (
    <text
      className="rq-ch__factor"
      x={LENS.cx}
      y={y}
      textAnchor="middle"
      direction="ltr"
      fontSize={LENS_FONT}
      data-iq-lensk={k}
    >
      {k <= 3 ? `×${10 ** k}` : '×10'}
      {k > 3 && (
        <tspan dy={-LENS_FONT * 0.45} fontSize={LENS_FONT * 0.8}>
          {k}
        </tspan>
      )}
    </text>
  );
}

/** The far corner, enlarged 10^k times: the court's corner, its two walls, the platform, the band or the overhang. */
function Lens({ kind, g, k, corner }) {
  const { cx, cy, r } = LENS;
  const gk = g * 10 ** k;
  const big = r * 3;
  // the court's far corner (top right) in the lens: the court lies left of and below it; `pc` the platform's corner
  const cc = kind === 'jam' ? { x: cx - gk / 2, y: cy + gk / 2 } : { x: cx + gk / 2, y: cy - gk / 2 };
  const pc = kind === 'jam' ? { x: cc.x + gk, y: cc.y - gk } : { x: cc.x - gk, y: cc.y + gk };
  const dx = corner.x - cx;
  const dy = corner.y - cy;
  const len = Math.hypot(dx, dy) || 1;
  const id = `rq-ch-lens-${kind}-${k}`;
  return (
    <g className={`rq-ch__lens is-${kind}`} data-iq-lens={k}>
      <line
        className="rq-ch__leader"
        x1={r2(cx + (dx / len) * r)}
        y1={r2(cy + (dy / len) * r)}
        x2={r2(corner.x - (dx / len) * 7)}
        y2={r2(corner.y - (dy / len) * 7)}
      />
      <circle className="rq-ch__spot" cx={corner.x} cy={corner.y} r="6" />
      <clipPath id={id}>
        <circle cx={cx} cy={cy} r={r} />
      </clipPath>
      <g clipPath={`url(#${id})`}>
        <rect className="rq-ch__void" x={cx - r} y={cy - r} width={2 * r} height={2 * r} />
        {kind === 'jam' && <rect className="rq-ch__over" x={r2(pc.x - big)} y={r2(pc.y)} width={big} height={big} />}
        <rect
          className={kind === 'band' ? 'rq-ch__band' : 'rq-ch__lensfloor'}
          x={r2(cc.x - big)}
          y={r2(cc.y)}
          width={big}
          height={big}
        />
        <rect
          className="rq-ch__slab"
          x={r2(Math.min(pc.x, cc.x) - big)}
          y={r2(Math.max(pc.y, cc.y))}
          width={big}
          height={big}
        />
        <path className="rq-ch__wallline" d={`M${r2(cc.x - big)} ${r2(cc.y)} H${r2(cc.x)} V${r2(cc.y + big)}`} />
      </g>
      <circle className="rq-ch__ring" cx={cx} cy={cy} r={r} />
      <Factor k={k} />
    </g>
  );
}

/**
 * The court of area `a` and the platform on the rod p/q. `stage`: say (the platform hovers, a dashed outline), build
 * (it comes down), done (what it did: the band in amber, the overhang in violet, seated in green when it rides).
 */
function Court({ a, p, q, stage, kind, gap }) {
  const L = Math.sqrt(Number(a));
  const l = Number(p) / Number(q);
  const u = ROOM / Math.max(L, l);
  const xR = POST.x + L * u; // the court's far (right) wall
  const yT = POST.y - L * u;
  const xr = POST.x + l * u; // the platform's far edge
  const yl = POST.y - l * u;
  const done = stage === 'done';
  // the thickness of the gap at the far corner, in units — from the exact gap (chase.js › lensPower)
  const g = done && kind !== 'ride' ? (Number(gap) / (Number(q) * Number(q)) / (L + l)) * u : 0;
  const k = done ? lensPower({ kind, a, p, q, gap }, u) : 0;
  return (
    <svg
      className={`rq-ch__court is-${stage} ${done ? `is-${kind}` : ''} ${FAST() ? 'is-fast' : ''}`}
      viewBox={`0 0 ${VW} ${VH}`}
      direction="ltr"
      aria-hidden="true"
      data-iq-court={a}
      data-iq-court-rod={`${p}/${q}`}
      data-iq-court-stage={stage}
      data-iq-court-kind={done ? kind : undefined}
    >
      <Floor L={L} u={u} />
      <rect className="rq-ch__wall" x={POST.x} y={r2(yT)} width={r2(L * u)} height={r2(L * u)} />
      {done && kind === 'band' && (
        <path
          className="rq-ch__band"
          d={`M${r2(xR)} ${r2(yT)} H${POST.x} V${r2(yl)} H${r2(xr)} V${POST.y} H${r2(xR)} Z`}
          data-iq-band={gap}
        />
      )}
      {stage === 'say' ? (
        <rect className="rq-ch__ghost" x={POST.x} y={r2(yl)} width={r2(l * u)} height={r2(l * u)} />
      ) : (
        <rect
          className={`rq-ch__slab ${stage === 'build' ? 'is-lowering' : ''}`}
          x={POST.x}
          y={r2(Math.max(yl, yT))}
          width={r2(Math.min(l, L) * u)}
          height={r2(Math.min(l, L) * u)}
        />
      )}
      {done && kind === 'jam' && (
        <path
          className="rq-ch__over"
          d={`M${r2(xr)} ${r2(yl)} H${POST.x} V${r2(yT)} H${r2(xR)} V${POST.y} H${r2(xr)} Z`}
          data-iq-over={gap}
        />
      )}
      <rect className="rq-ch__post" x={POST.x - 7} y={POST.y - 7} width="14" height="14" rx="3" />
      {/* the rod along the near wall, from the post */}
      <rect className="rq-ch__rod" x={POST.x} y={POST.y + 8} width={r2(l * u)} height="7" rx="3.5" />
      {k > 0 && <Lens kind={kind} g={g} k={k} corner={{ x: r2(xR), y: r2(yT) }} />}
    </svg>
  );
}

// ───────────────────────── the card of numbers: the rod, the small tile, the two whole numbers ─────────────────────────
/** One tile, and in its corner ONE small tile of side 1/q (the grid drawn when q is small enough to see it). */
function SmallTile({ q }) {
  const S = 36;
  const n = Number(q);
  const s = Math.max(3, S / n);
  return (
    <svg className="rq-ch__keytile" viewBox="0 0 40 40" aria-hidden="true" data-iq-smalltile={q}>
      <rect className="rq-ch__keyone" x="2" y="2" width={S} height={S} />
      {n <= 12 &&
        Array.from({ length: n - 1 }, (_, i) => {
          const d = r2(2 + ((i + 1) * S) / n);
          return (
            <g key={i} className="rq-ch__keygrid">
              <line x1={d} x2={d} y1="2" y2={2 + S} />
              <line x1="2" x2={2 + S} y1={d} y2={d} />
            </g>
          );
        })}
      <rect className="rq-ch__keysmall" x="2" y={r2(2 + S - s)} width={r2(s)} height={r2(s)} />
    </svg>
  );
}

const SIGN = { '-1': '<', 0: '=', 1: '>' };

function Card({ T, args, row }) {
  const { p, q, a } = args;
  return (
    <div className="rq-ch__card" data-iq-card>
      <div className="rq-ch__rodline">
        <span className="rq-ch__name">{T.rodName}</span>
        <Frac p={p} q={q} big />
      </div>
      <div className="rq-ch__key">
        <SmallTile q={q} />
        <span className="rq-ch__keytext">
          <MathText>{T.smallTile(args)}</MathText>
        </span>
      </div>
      <div className="rq-ch__line" data-iq-platform={row ? row.platform : ''}>
        <span className="rq-ch__name">{T.platformName}</span>
        {row ? (
          <>
            <bdi dir="ltr" className="rq-ch__eq">
              <MathText>{`$${p} \\times ${p} = ${row.platform}$`}</MathText>
            </bdi>
            <span className="rq-ch__unit">{T.unit(row.platform)}</span>
          </>
        ) : (
          <span className="rq-ch__unknown">{T.unknown}</span>
        )}
      </div>
      <div className="rq-ch__line" data-iq-courtline={row ? row.court : ''}>
        <span className="rq-ch__name">{T.courtName}</span>
        {row ? (
          <>
            <bdi dir="ltr" className="rq-ch__eq">
              <MathText>{`$${a} \\times ${q} \\times ${q} = ${row.court}$`}</MathText>
            </bdi>
            <span className="rq-ch__unit">{T.unit(row.court)}</span>
          </>
        ) : (
          <span className="rq-ch__unknown">{T.unknown}</span>
        )}
      </div>
      <div className={`rq-ch__rel ${row ? `is-${row.kind}` : ''}`} data-iq-relation={row ? row.kind : ''}>
        {row && (
          <bdi dir="ltr">
            <MathText>{`$${row.platform} ${SIGN[relation(row)]} ${row.court}$`}</MathText>
          </bdi>
        )}
      </div>
    </div>
  );
}

// ───────────────────────── the table of every fraction tried ─────────────────────────
function Chip({ T, row }) {
  if (row.kind === 'ride')
    return (
      <span className="rq-chip rq-chip--ride" data-iq-cell="ride">
        {T.rides}
      </span>
    );
  return (
    <span className={`rq-chip rq-chip--${row.kind}`} data-iq-cell={row.kind}>
      {row.kind === 'band' ? T.band : T.jam}{' '}
      <bdi dir="ltr" className="rq-n">
        {row.gap}
      </bdi>
    </span>
  );
}

function Table({ T, rows }) {
  return (
    <table className="rq-table rq-ch__table" data-iq-table={rows.length}>
      <thead>
        <tr>
          <th>{T.colRod}</th>
          <th>{T.colPlatform}</th>
          <th>{T.colCourt}</th>
          <th>{T.colFact}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.i} data-iq-row={row.i} data-iq-row-kind={row.kind} className={`is-${row.kind}`}>
            <td>
              <Frac p={row.p} q={row.q} />
            </td>
            <td data-iq-cell-platform={row.platform}>
              <bdi dir="ltr" className="rq-n">
                {row.platform}
              </bdi>
            </td>
            <td data-iq-cell-court={row.court}>
              <bdi dir="ltr" className="rq-n">
                {row.court}
              </bdi>
            </td>
            <td>
              <Chip T={T} row={row} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ───────────────────────── the screen ─────────────────────────
const SAY_LABEL = { band: 'sayBand', jam: 'sayJam', ride: 'sayRide' };
const COUNT_LABEL = { 0: 'countNone', 1: 'countOne', all: 'countAll' };

/** The fraction the screen shows: the one under way, or — at the closing question — the last one tried. */
function shownFrac(spec, s) {
  return fracOf(spec.fracs[Math.min(s.i, spec.fracs.length - 1)]);
}

/** What every text function of the lesson receives about the fraction on screen. */
const argsOf = (spec, s) => {
  const { p, q } = shownFrac(spec, s);
  return {
    a: String(spec.a).trim(),
    i: s.i,
    n: spec.fracs.length,
    p,
    q,
    rodTex: `\\dfrac{${p}}{${q}}`,
    perTile: String(BigInt(q) * BigInt(q)),
  };
};

/** The row the card and the court show: the fraction just lowered (seen), and at the closing question the last one. */
const rowShown = (s) => (['seen', 'count', 'counted'].includes(s.stage) ? s.rows.at(-1) : null);

function askOf(T, s, args) {
  if (s.stage === 'say' || s.stage === 'build') return T.ask(args);
  if (s.stage === 'count' || s.stage === 'counted') return T.countAsk(args);
  return null;
}

function factOf(T, s, args) {
  const row = rowNow(s);
  if (row) return T.fact({ ...args, ...row });
  if (s.stage === 'counted') return T.countFact({ ...args, ...s.count });
  return ' ';
}

/**
 * The screen for a state of the experiment. `act` = { say(kind), next(), count(v) } — what the buttons do.
 */
export function ChaseView({ spec, state, act }) {
  const T = spec.text;
  const s = state;
  const args = argsOf(spec, s);
  const row = rowShown(s);
  const ask = askOf(T, s, args);
  const L = CHASE_LAYOUT;
  const courtStage = s.stage === 'say' ? 'say' : s.stage === 'build' ? 'build' : 'done';
  const factKind = s.stage === 'seen' ? row.kind : s.stage === 'counted' ? 'count' : '';

  return (
    <section
      className="rq-iq rq-iq--chase"
      data-iq="chase"
      data-iq-stage={s.stage}
      data-iq-area={args.a}
      data-iq-i={s.i}
      data-iq-p={args.p}
      data-iq-q={args.q}
      style={{
        '--rq-ch-court-h': `${L.court.h}rem`,
        '--rq-ch-table-w': `${L.table.w}rem`,
      }}
    >
      <header className="rq-iq__head">
        <p className="rq-iq__lead">
          {/* where he is in the list: one dot a fraction (never « 2 / 5 », which would read as a fraction here) */}
          <span className="rq-ch__dots" dir="ltr" aria-hidden="true" data-iq-progress={`${s.rows.length}:${args.n}`}>
            {Array.from({ length: args.n }, (_, k) => (
              <i
                key={k}
                className={`rq-ch__dot ${k < s.rows.length ? `is-${s.rows[k].kind}` : k === s.i ? 'is-now' : ''}`}
              />
            ))}
          </span>
          <MathText>{T.lead(args)}</MathText>
        </p>
        <p className="rq-iq__goal" data-iq-goal>
          <span aria-hidden="true">🎯</span> <MathText>{T.goal(args)}</MathText>
        </p>
      </header>

      <div className="rq-ch__body">
        <div className="rq-ch__main">
          <div className="rq-ch__stage">
            <div className="rq-ch__courtbox" data-iq-court-box>
              <Court
                key={`${s.i}-${courtStage}`}
                a={args.a}
                p={args.p}
                q={args.q}
                stage={courtStage}
                kind={row?.kind}
                gap={row?.gap}
              />
            </div>
            <Card T={T} args={args} row={row} />
          </div>

          <div className="rq-ch__talk">
            {ask && (
              <p className="rq-ask" data-iq-ask>
                <MathText>{ask}</MathText>
              </p>
            )}
            <div className="rq-actions">
              {s.stage === 'say' &&
                KINDS.map((k) => (
                  <button key={k} type="button" className="rf-btn" onClick={() => act.say(k)} data-iq-say={k}>
                    {T[SAY_LABEL[k]]}
                  </button>
                ))}
              {s.stage === 'count' &&
                COUNTS.map((v) => (
                  <button key={v} type="button" className="rf-btn" onClick={() => act.count(v)} data-iq-count={v}>
                    {T[COUNT_LABEL[v]]}
                  </button>
                ))}
              {(s.stage === 'seen' || s.stage === 'counted') && (
                <button type="button" className="rf-btn rf-btn--main" onClick={act.next} data-iq-next>
                  {s.stage === 'counted' ? T.done : T.next}
                </button>
              )}
            </div>
            <p className={`rq-fact ${factKind ? `is-${factKind}` : ''}`} data-iq-fact>
              <MathText>{factOf(T, s, args)}</MathText>
            </p>
          </div>
        </div>

        <Table T={T} rows={s.rows} />
      </div>
    </section>
  );
}

/** The platform comes down in about 0.9 s (`.rq-ch__slab.is-lowering`). */
const LOWER = 1000;

export function Chase({ spec, play, onDone }) {
  const [state, dispatch] = useReducer((s, a) => chaseReducer(spec, s, a), spec, initChase);
  const later = useLater();
  const { p, q } = shownFrac(spec, state);
  expose({
    kind: 'chase',
    a: String(spec.a).trim(),
    i: state.i,
    n: spec.fracs.length,
    stage: state.stage,
    frac: `${p}/${q}`,
    rows: state.rows,
  });

  const act = {
    say(v) {
      if (state.stage !== 'say') return;
      play('pick');
      dispatch({ type: 'say', v });
      later(120, () => play('sweep'));
      later(LOWER, () => {
        const after = chaseReducer(spec, chaseReducer(spec, state, { type: 'say', v }), { type: 'built' });
        const row = after.rows.at(-1);
        play(row.kind === 'ride' ? 'gate' : row.kind === 'band' ? 'plank' : 'hit');
        dispatch({ type: 'built' });
        // his prediction against what the platform did (a fact, heard)
        later(450, () => play(row.right ? 'key' : 'fail'));
      });
    },
    count(v) {
      if (state.stage !== 'count') return;
      const after = chaseReducer(spec, state, { type: 'count', v });
      play('pick');
      dispatch({ type: 'count', v });
      later(300, () => play(after.count.right ? 'key' : 'fail'));
    },
    next() {
      const after = chaseReducer(spec, state, { type: 'next' });
      if (after.done) onDone(chaseResult(after));
      else {
        play('ui');
        dispatch({ type: 'next' });
      }
    },
  };

  return <ChaseView spec={spec} state={state} act={act} />;
}
