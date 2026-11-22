/**
 * THE INVESTIGATION `calc` of this world (mounted by `Inquiry.jsx`; logic and state machine: `calc.js`). The court of
 * area `spec.a` is in front of him, and rods lie ready beside its wall — a whole number, a decimal, the number a drawn
 * calculator shows. For each rod he says BEFORE whether its platform will ride; the world lowers it (`Court`, from
 * `courtParts.jsx`) and the row stays in the table: the rod, the tiles its platform covers, what is left or what sticks
 * out — exact. A gap too thin to see is magnified by HIS hand (« Agrandis », × 10 at each press) until it is seen. Last
 * (`spec.wall`), he clamps the rod on the court's own wall, corner to corner: it rides, and its cell has no number.
 *
 * `spec.text` is the lesson's wording (GAME_WORLD.md « Explore », spec shape of `calc`): this file writes no word, and
 * nothing it draws names the rule. The screen is a pure VIEW of the reducer's state (`CalcView`).
 */
import { useReducer } from 'react';
import MathText from '../../components/MathText';
import { Court } from './courtParts';
import { lengthOf, approx, write } from './logic';
import { initCalc, calcReducer, calcResult, rowNow, zoomTex, rodOf, CALC_LAYOUT } from './calc';
import { FAST, expose, useLater, YesNo } from '../divisorIsles/inquiryParts';

// ───────────────────────── the rack: the court's wall and the rods lying ready beside it ─────────────────────────
// Left to right in its viewBox: the corner post, the wall (`WALL` units), then — BESIDE the far post, never on the wall —
// one column of labels: the wall's name on the wall's row, each rod's number on its row (the longest, the calculator's
// « 5,477225575 » after its icon, ≈ 130 units). One scale whatever its rows (`CALC_LAYOUT.rack`): 22 units × 0.82 ≈
// 19 px at 1366 × 768.
const RX0 = 24; // the corner post
const { w: RW, wall: WALL, scale: RSCALE } = CALC_LAYOUT.rack;
const LABEL_X = RX0 + WALL + 16; // the column of labels, right of the far post
const ROW = 40;
const RTOP = 30;
/** A rod longer than the wall is drawn at most this long: its end and its mark stay left of the labels. */
const LONGEST = WALL * 1.06;

/** A small calculator, as an icon beside its number. */
function CalcIcon({ x, y }) {
  return (
    <g className="rq-calcicon" transform={`translate(${x} ${y})`} aria-hidden="true">
      <rect width="16" height="21" rx="3" />
      <rect className="rq-calcicon__screen" x="3" y="3" width="10" height="5" rx="1" />
      {[0, 1, 2].map((r) =>
        [0, 1].map((c) => <rect key={`${r}${c}`} x={3 + c * 6} y={11 + r * 3.4} width="4" height="2" />),
      )}
    </g>
  );
}

const keyOfRod = (r) => (r.root != null ? `w${r.root}` : `q${r.q}`);

function Rack({ spec, s, T }) {
  const side = Math.sqrt(approx(spec.a));
  const rods = spec.rods.map(rodOf);
  const h = RTOP + ROW * (rods.length + 1) - 10;
  const yWall = RTOP;
  const clamped = s.stage === 'clamping' || s.wall;
  return (
    <svg
      className="rq-rack"
      viewBox={`0 0 ${RW} ${h}`}
      style={{ width: `${(RW * RSCALE) / 16}rem`, height: `${(h * RSCALE) / 16}rem` }}
      aria-hidden="true"
      data-iq-rack
    >
      {/* the court's wall, from its corner post to the far corner */}
      <line className="rq-rack__wall" x1={RX0} y1={yWall} x2={RX0 + WALL} y2={yWall} />
      <rect className="rq-rack__post" x={RX0 - 9} y={yWall - 14} width="14" height="28" rx="3" />
      <rect
        className="rq-rack__post rq-rack__post--far"
        x={RX0 + WALL - 5}
        y={yWall - 11}
        width="10"
        height="22"
        rx="3"
      />
      {/* the wall's name, once, BESIDE its far post: laid from x to the right (an Arabic text anchored at its start
          would run leftwards over the wall and its post) */}
      <text
        className="rq-rack__label rq-rack__label--wall"
        x={LABEL_X}
        y={yWall + 8}
        direction="ltr"
        textAnchor="start"
        data-iq-wallname
      >
        {T.wallName}
      </text>
      {clamped && (
        <g data-iq-clamp-rod>
          <rect
            className={`rq-rack__clamp ${s.stage === 'clamping' ? 'is-stretching' : ''}`}
            x={RX0}
            y={yWall - 6}
            width={WALL}
            height="12"
            rx="6"
          />
          <text className="rq-rack__unknown" x={RX0 + WALL / 2} y={yWall - 12} textAnchor="middle">
            {T.unknown}
          </text>
        </g>
      )}
      {rods.map((r, k) => {
        const y = RTOP + ROW * (k + 1);
        const len = Math.min(LONGEST, (lengthOf(r) / side) * WALL);
        const row = s.rows[k];
        const now = !s.wall && s.i === k && s.stage !== 'wall';
        const calc = spec.rods[k].calc != null;
        return (
          <g
            key={keyOfRod(r)}
            className={`rq-rack__rod ${now ? 'is-now' : ''} ${row ? `is-used is-${row.kind}` : ''}`}
            data-iq-rackrod={k}
            data-iq-rackrod-state={now ? 'now' : row ? row.kind : 'ready'}
          >
            <rect x={RX0} y={y - 7} width={len} height="14" rx="7" />
            {row && <circle className="rq-rack__mark" cx={RX0 + len} cy={y} r="7" />}
            {calc && <CalcIcon x={LABEL_X} y={y - 11} />}
            <text className="rq-rack__label" x={LABEL_X + (calc ? 22 : 0)} y={y + 8} direction="ltr">
              {r.q}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ───────────────────────── the calculator: a real little one, its ten digits on the display ─────────────────────────
const CALC_KEYS = [
  ['7', '8', '9', '÷'],
  ['4', '5', '6', '×'],
  ['1', '2', '3', '−'],
  ['0', ',', '=', '+'],
];
/** Drawn at 0.72 of its viewBox (9 rem for 200 units): the display's 26 units ≈ 20 px, the typed line's 24 ≈ 18.4 px. */
function Calculator({ a, shows, lit }) {
  const areaW = String(a).length * 13.5;
  const xr = 20;
  return (
    <svg
      className={`rq-calc ${lit ? 'is-now' : ''}`}
      viewBox="0 0 200 250"
      role="img"
      aria-label={shows}
      data-iq-calculator={shows}
    >
      <rect className="rq-calc__body" x="2" y="2" width="196" height="246" rx="18" />
      <rect className="rq-calc__screen" x="14" y="14" width="172" height="70" rx="8" />
      {/* the key that was pressed, then the area, then « = »: the way a calculator is asked */}
      <path className="rq-calc__sign" d={`M ${xr} 34 l 5 -2 l 6 12 l 8 -26 h ${areaW + 8}`} aria-hidden="true" />
      <text className="rq-calc__typed" x={xr + 22} y="42" direction="ltr">
        {a}
      </text>
      <text className="rq-calc__typed" x={xr + 32 + areaW} y="42" direction="ltr">
        =
      </text>
      <text className="rq-calc__digits" x="180" y="74" textAnchor="end" direction="ltr">
        {shows}
      </text>
      {CALC_KEYS.map((row, r) =>
        row.map((k, c) => (
          <g key={k} className="rq-calc__key">
            <rect x={14 + c * 44} y={98 + r * 37} width="38" height="31" rx="6" />
            <text x={14 + c * 44 + 19} y={98 + r * 37 + 22} textAnchor="middle">
              {k}
            </text>
          </g>
        )),
      )}
    </svg>
  );
}

// ───────────────────────── the table of what happened ─────────────────────────
function DiffCell({ T, row }) {
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
        {row.diff}
      </bdi>
      {/* the zoom HE drove to see it, kept on its row */}
      {row.zoom > 0 && (
        <span className="rq-zoomtag" data-iq-zoomtag={row.zoom}>
          🔍 <MathText>{`$${zoomTex(row.zoom)}$`}</MathText>
        </span>
      )}
    </span>
  );
}

function Table({ T, rows }) {
  const wallRow = rows.find((r) => r.s.root != null);
  return (
    <table className="rq-table" data-iq-table={rows.length}>
      <thead>
        <tr>
          <th>{T.colRod}</th>
          <th>{T.colCovers}</th>
          <th>{T.colDiff}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, k) => (
          // eslint-disable-next-line react/no-array-index-key -- the rows only grow
          <tr key={k} data-iq-row={k} data-iq-row-kind={row.kind} className={`is-${row.kind}`}>
            <td>
              {row.s.root != null ? (
                <span className="rq-unknown" data-iq-wallcell>
                  {T.unknown}
                </span>
              ) : (
                <span className="rq-rodcell">
                  {row.calc != null && (
                    <svg className="rq-rodcell__icon" viewBox="0 0 16 21" aria-hidden="true">
                      <CalcIcon x={0} y={0} />
                    </svg>
                  )}
                  <bdi dir="ltr" className="rq-n">
                    {row.s.q}
                  </bdi>
                </span>
              )}
            </td>
            <td>
              <bdi dir="ltr" className="rq-n">
                {row.covers}
              </bdi>
            </td>
            <td>
              <DiffCell T={T} row={row} />
            </td>
          </tr>
        ))}
      </tbody>
      {wallRow && (
        <tfoot>
          <tr>
            <td colSpan={3} data-iq-wallnote>
              <MathText>{T.wallNote({ a: wallRow.a })}</MathText>
            </td>
          </tr>
        </tfoot>
      )}
    </table>
  );
}

// ───────────────────────── the screen ─────────────────────────
/** What the text of a row receives: the row, the rod's number (null for the wall) and whether he foresaw it. */
const argsOf = (row, s) => ({
  ...row,
  q: row.s.q ?? null,
  wall: row.s.root != null,
  right: row.predicted === (row.kind === 'ride'),
  k: s.zk,
  need: s.need,
  zoom: zoomTex(s.zk),
});

function factOf(T, s) {
  const row = rowNow(s);
  if (!row) return ' ';
  return s.stage === 'zoom' ? T.thin(argsOf(row, s)) : T.fact(argsOf(row, s));
}

function askOf(T, spec, s) {
  const a = write(spec.a);
  if (s.stage === 'wall') return T.wallAsk({ a, rows: s.rows });
  if (s.stage !== 'say' && s.stage !== 'build') return null;
  return T.ask({ a, i: s.i, q: s.rod.q ?? null, calc: s.calc, wall: s.wall });
}

/** The court's stage for the state: the outline while he says, the platform lowering, then what it did. */
const courtStage = (stage) => (stage === 'build' ? 'build' : ['zoom', 'seen'].includes(stage) ? 'done' : 'ask');

/**
 * The screen for a state of the experiment. `act` = { say(v), zoom(), next(), clamp() } — what the buttons do.
 */
export function CalcView({ spec, state, act }) {
  const T = spec.text;
  const s = state;
  const a = write(spec.a);
  const calcRod = spec.rods.find((r) => r.calc != null);
  const isLast = s.wall || (!spec.wall && s.i + 1 >= spec.rods.length);
  const ask = askOf(T, spec, s);
  const rod = s.stage === 'wall' || s.stage === 'clamping' ? null : s.rod;

  return (
    <section
      className="rq-iq rq-iq--calc"
      data-iq="calc"
      data-iq-stage={s.stage}
      data-iq-area={a}
      data-iq-rod={rod ? keyOfRod(rod) : ''}
      data-iq-wall={s.wall ? 'yes' : 'no'}
      style={{ '--rq-court-h': `${CALC_LAYOUT.court}rem`, '--rq-talk-w': `${CALC_LAYOUT.talk}rem` }}
    >
      <header className="rq-iq__head">
        <p className="rq-iq__lead">
          <MathText>{T.lead({ a })}</MathText>
        </p>
        <p className="rq-iq__goal" data-iq-goal>
          <span aria-hidden="true">🎯</span> {T.goal({ a })}
        </p>
      </header>

      {/* row 2: the court (the subject, drawn as high as the rows leave), the rack of rods by its wall, the calculator */}
      <div className="rq-calc__stage">
        <div className="rq-calc__court" data-iq-court-box data-iq-zoom={s.zk}>
          {/* the wall's own rod is drawn without the court's labels: they would write it with a sign the forge has
              not named yet (courtParts.jsx › Radical) */}
          <Court
            key={`${s.i}-${s.wall ? 'w' : 'r'}`}
            area={a}
            rod={rod}
            stage={courtStage(s.stage)}
            tight={false}
            zoom={10 ** s.zk}
            label={!s.wall}
            fast={Boolean(FAST())}
          />
        </div>
        <div className="rq-calc__bench">
          <Rack spec={spec} s={s} T={T} />
          {calcRod && <Calculator a={a} shows={write(calcRod.calc)} lit={s.calc != null && !s.wall} />}
        </div>
      </div>

      {/* row 3: the question, its buttons and the fact under the court; the table of what happened beside them */}
      <div className="rq-calc__low">
        <div className="rq-calc__talk">
          {ask && (
            <p className="rq-ask" data-iq-ask>
              <MathText>{ask}</MathText>
            </p>
          )}
          <div className="rq-actions">
            {s.stage === 'say' && <YesNo T={T} onSay={act.say} />}
            {s.stage === 'zoom' && (
              <button type="button" className="rf-btn rf-btn--main rq-zoombtn" onClick={act.zoom} data-iq-zoomin>
                🔍 {T.zoomIn}
              </button>
            )}
            {s.stage === 'seen' && (
              <button type="button" className="rf-btn rf-btn--main" onClick={act.next} data-iq-next>
                {isLast ? T.done : T.next}
              </button>
            )}
            {s.stage === 'wall' && (
              <button type="button" className="rf-btn rf-btn--main" onClick={act.clamp} data-iq-clamp>
                {T.clamp}
              </button>
            )}
          </div>
          <p className={`rq-fact ${rowNow(s) ? `is-${rowNow(s).kind}` : ''}`} data-iq-fact>
            <MathText>{factOf(T, s)}</MathText>
          </p>
        </div>
        <Table T={T} rows={s.rows} />
      </div>
    </section>
  );
}

/** The platform lowers in about 0.9 s (`Court`, stage `build`); the rod reaches the far corner in 1.2 s. */
const LOWER = 1000;
const STRETCH = 1250;

export function Calc({ spec, play, onDone }) {
  const [state, dispatch] = useReducer((s, a) => calcReducer(spec, s, a), spec, initCalc);
  const later = useLater();
  expose({
    kind: 'calc',
    a: write(spec.a),
    i: state.i,
    stage: state.stage,
    rod: state.rod,
    zk: state.zk,
    need: state.need,
    wall: state.wall,
    rows: state.rows,
  });

  const act = {
    say(v) {
      if (state.stage !== 'say') return;
      play('pick');
      dispatch({ type: 'say', v });
      later(120, () => play('sweep'));
      later(LOWER, () => {
        const after = calcReducer(spec, calcReducer(spec, state, { type: 'say', v }), { type: 'built' });
        const row = after.rows.at(-1);
        play(row.kind === 'ride' ? 'gate' : row.kind === 'band' ? 'plank' : 'hit');
        dispatch({ type: 'built' });
        // his prediction against what the platform did (a fact, heard)
        later(450, () => play(v === (row.kind === 'ride') ? 'key' : 'fail'));
      });
    },
    zoom() {
      if (state.stage !== 'zoom') return;
      play(state.zk + 1 >= state.need ? 'spark' : 'ui', state.zk);
      dispatch({ type: 'zoom' });
    },
    next() {
      const after = calcReducer(spec, state, { type: 'next' });
      if (after.done) onDone(calcResult(after));
      else {
        play('ui');
        dispatch({ type: 'next' });
      }
    },
    clamp() {
      if (state.stage !== 'wall') return;
      play('sweep');
      dispatch({ type: 'clamp' });
      later(STRETCH, () => {
        play('plank');
        dispatch({ type: 'clamped' });
      });
    },
  };

  return <CalcView spec={spec} state={state} act={act} />;
}
