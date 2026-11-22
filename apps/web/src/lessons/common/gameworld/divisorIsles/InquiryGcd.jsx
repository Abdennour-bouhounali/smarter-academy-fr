/**
 * Three INVESTIGATIONS of the greatest common divisor in this world (see `Inquiry.jsx`, which mounts them; logic:
 * `inquiry.js`). A gap of a cells is held by planks of d when d divides a; ONE plank for TWO gaps.
 *
 *   common  « the planks that hold both gaps; the longest of them » — a SEARCH: he takes each candidate plank, says BEFORE
 *           whether it holds the gap a and the gap b; the world lays it on both strips and the plank goes to its shelf
 *           (« a only », « b only », « both »). Then he marks the longest plank of « both » and says how many it holds —
 *           or, with `crown: false` (spec or round), only how many it holds: the longest is its own search (`summit`).
 *   ladder  « a pair of gaps replaced by a simpler pair with the same common planks » — a PROCEDURE (subtract or divide):
 *           he predicts the next pair, the world writes the row with its calculation and, beside every row, the planks
 *           that hold both gaps (the same list on every row). He says how many rows the ladder will have; the world
 *           finishes it; the last value that is not 0 is lit. With `plain` (a workshop's bench) the column of planks and
 *           the gold are left out: only the rows. On a bench it starts where he left it (`spec.from` / `spec.onState`).
 *   nest    « the common planks are the planks of the longest one » — a SET EQUALITY: the world shows a, b, g and the
 *           planks of g; for each probe he says, looking at g only, whether it holds both gaps; the world lays it on the
 *           three strips. At the end the two lists stand side by side.
 *
 * Modes (`InquiryGcdModes.jsx`, logic `gcdModes.js`): common `witness`, nest `pair`, ladder `fold` and `both` — the
 * exported `Common`, `Ladder`, `Nest` mount them when `spec.mode` names them; any other spec plays the screens below.
 *
 * `spec.text` is the lesson's wording (GAME_WORLD.md « استكشف », spec shapes). Nothing here states a rule: every sentence
 * says what the strips, the shelves or the ladder have just done.
 */
import { useEffect, useState } from 'react';
import MathText from '../../components/MathText';
import { Num } from '../kit/parts';
import { commonOf, commonSays, ladderOf, ladderAsk, ladderStart, commonPlanks, nestOf } from './inquiry';
import { Span, Calc, restTex } from './InquiryCombine';
import { Head, Found, asNumber, onEnter } from './InquiryDivision';
import { INQUIRY_TEXT } from './strings';
import { expose, X0, SPAN, useLater, YesNo } from './inquiryParts';
import { Witness, Pair, Fold, Both } from './InquiryGcdModes';

/**
 * A gap drawn on the scene, with its length written at its end (and planks of d laid on it when d is given). A gap of 0
 * cells is an empty mark at the start of its line, its « 0 » above it: no plank lies on it (0 = d × 0).
 */
export function Strip({ n, d, u, y, tag, gold = false }) {
  return (
    <g data-iq-strip={tag}>
      {n === 0 && <rect className="iq-gapzero" x={X0 - 7} y={y} width="14" height="30" rx="4" data-iq-zero />}
      <Span n={n} d={d} u={u} y={y} laid={Boolean(d)} />
      <text className={`iq-scene__num ${gold ? 'is-gold' : ''}`} x={X0 + n * u} y={y - 12} direction="ltr">
        {n}
      </text>
    </g>
  );
}

// ───────────────────────── common: candidate planks sorted on shelves ─────────────────────────
const YA = 40;
const YB = 128;
const SHELVES = [
  ['a', (r) => r.holdsA && !r.holdsB],
  ['b', (r) => r.holdsB && !r.holdsA],
  ['both', (r) => r.both],
  ['none', (r) => !r.holdsA && !r.holdsB],
];

/**
 * The tray of candidate planks and the shelves they go to. With `crown` (the default) the chips of « both » can be marked
 * once the tray is empty, and the longest is lit at the end; with `crown` false no chip of a shelf is ever pickable or lit
 * — nothing names or outlines the longest.
 */
export function Shelves({ T, a, b, rows, tray, placed, hand, stage, crown, long, longest, onTake, onMark }) {
  return (
    <div className="iq-shelves">
      <div className="iq-shelf iq-shelf--tray" data-iq-tray>
        {tray.map((d) => (
          <button
            key={d}
            type="button"
            className={`iq-chip ${hand === d ? 'is-on' : ''}`}
            onClick={() => onTake(d)}
            disabled={stage !== 'take'}
            data-iq-plank={d}
          >
            {d}
          </button>
        ))}
      </div>
      {SHELVES.filter(([key, is]) => key !== 'none' || rows.some(is)).map(([key, is]) => (
        <div key={key} className={`iq-shelf iq-shelf--${key}`} data-iq-shelf={key}>
          <small>{T.shelf[key](a, b)}</small>
          <div className="iq-chips">
            {placed.filter(is).map((r) => {
              const mine = crown && key === 'both';
              const pickable = mine && stage === 'say';
              const lit = mine && (long === r.d || (stage === 'seen' && r.d === longest));
              return (
                <button
                  key={r.d}
                  type="button"
                  className={`iq-chip iq-chip--s ${lit ? 'is-on' : ''}`}
                  onClick={() => pickable && onMark(r.d)}
                  disabled={!pickable}
                  {...(mine ? { 'data-iq-long': r.d } : {})}
                >
                  {r.d}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function CommonShelves({ spec, play, onDone }) {
  const T = spec.text;
  const [ri, setRi] = useState(0);
  const { a, b, candidates } = spec.rounds[ri];
  // crown: false — the experiment ends on the shelves and their count; the longest plank of « both » is not asked
  const crown = (spec.rounds[ri].crown ?? spec.crown) !== false;
  const c = commonOf(a, b, candidates);
  const [stage, setStage] = useState('take'); // take | guess | lay | say | seen
  const [hand, setHand] = useState(null); // the plank he took
  const [gA, setGA] = useState(null);
  const [gB, setGB] = useState(null);
  const [placed, setPlaced] = useState([]); // [{ d, holdsA, holdsB, both, guessA, guessB }]
  const [last, setLast] = useState(null); // the plank on the strips
  const [long, setLong] = useState(null); // the plank he marks as the longest of « both »
  const [countIn, setCountIn] = useState('');
  const [said, setSaid] = useState(null);
  const [miss, setMiss] = useState(null);
  const [wait, setWait] = useState(null); // what is still missing before « تحقّق » can be answered
  const [found, setFound] = useState([]);
  const later = useLater();
  expose({ kind: 'common', ri, a, b, crown, stage, hand, placed: placed.length, long, said, found });

  const u = SPAN / Math.max(a, b);
  const rowOf = (d) => c.rows.find((r) => r.d === d);
  const tray = candidates.filter((d) => !placed.some((p) => p.d === d));
  const fact = { a, b, crown, common: c.common, longest: c.longest };

  const take = (d) => {
    if (stage !== 'take') return;
    play('pick');
    setHand(d);
    setGA(null);
    setGB(null);
    setStage('guess');
  };
  const lay = () => {
    if (stage !== 'guess' || gA == null || gB == null) return;
    const row = { ...rowOf(hand), guessA: gA, guessB: gB };
    setStage('lay');
    play('sweep');
    later(250, () => {
      play('plank');
      setLast(row);
    });
    later(1300, () => {
      play(gA === row.holdsA && gB === row.holdsB ? 'success' : 'crumble');
      setPlaced((list) => [...list, row]);
      setHand(null);
      setStage(placed.length + 1 >= candidates.length ? 'say' : 'take');
    });
  };
  const check = () => {
    if (stage !== 'say') return;
    const now = { longest: crown ? long : null, count: asNumber(countIn) };
    const says = commonSays(c, now, crown);
    // a press that cannot be judged yet is answered by what is missing on the screen (never a silent button)
    if (says.needLong || says.needCount) {
      play('pick');
      const f = { a, b, crown, needLong: says.needLong, needCount: says.needCount };
      setWait((T.sayFirst ?? INQUIRY_TEXT.sayFirst)(f));
      return;
    }
    setWait(null);
    const first = said ?? now;
    if (!said) setSaid(now);
    if (says.ok) {
      play('key');
      setMiss(null);
      setStage('seen');
      setFound((list) => [...list, { a, b, crown, rows: placed, common: c.common, longest: c.longest, said: first }]);
      return;
    }
    play('fail');
    setMiss(now);
  };
  const next = () => {
    if (ri + 1 >= spec.rounds.length) {
      onDone({
        rounds: found.map((f) => ({
          a: f.a,
          b: f.b,
          rows: f.rows.map((r) => ({ d: r.d, guessA: r.guessA, guessB: r.guessB, both: r.both })),
          common: f.common,
          longest: f.longest,
          said: f.said,
        })),
      });
      return;
    }
    setRi(ri + 1);
    setStage('take');
    setHand(null);
    setPlaced([]);
    setLast(null);
    setLong(null);
    setCountIn('');
    setSaid(null);
    setMiss(null);
    setWait(null);
  };

  const shown = last;
  return (
    <section className="iq iq--div iq--common" data-iq="common" data-iq-stage={stage} data-iq-crown={crown ? '1' : '0'}>
      <Head i={ri} n={spec.rounds.length} lead={T.lead(a, b)} goal={T.goal(a, b)} />

      <svg className="iq-scene" viewBox="0 0 1000 190" role="img" aria-label={`${a} · ${b}`}>
        <Strip key={`a${shown?.d}`} n={a} d={shown?.d} u={u} y={YA} tag="a" />
        <Strip key={`b${shown?.d}`} n={b} d={shown?.d} u={u} y={YB} tag="b" />
      </svg>

      <Calc items={shown ? [restTex(a, shown.d), restTex(b, shown.d)] : []} />
      <p className="iq-fact" data-iq-fact>
        <MathText>
          {wait && stage === 'say'
            ? wait
            : miss && stage === 'say'
              ? T.sayMiss({ ...fact, said: miss })
              : stage === 'seen'
                ? T.sayOk({ ...fact, said })
                : shown && stage !== 'lay'
                  ? T.seen({ a, b, ...shown }, { a: shown.guessA, b: shown.guessB })
                  : ' '}
        </MathText>
      </p>

      <Shelves
        T={T}
        a={a}
        b={b}
        rows={c.rows}
        tray={tray}
        placed={placed}
        hand={hand}
        stage={stage}
        crown={crown}
        long={long}
        longest={c.longest}
        onTake={take}
        onMark={setLong}
      />

      <div className="iq-actions">
        {stage === 'take' && (
          <p className="iq-askline">
            <MathText>{T.take({ a, b })}</MathText>
          </p>
        )}
        {stage === 'guess' && (
          <>
            <p className="iq-askline">
              <MathText>{T.ask({ a, b, d: hand })}</MathText>
            </p>
            <span className="iq-side">{T.onA(a)}</span>
            <YesNo T={T} value={gA} onSay={setGA} hook="data-iq-say-a" />
            <span className="iq-side">{T.onB(b)}</span>
            <YesNo T={T} value={gB} onSay={setGB} hook="data-iq-say-b" />
            <button
              type="button"
              className="rf-btn rf-btn--main"
              onClick={lay}
              disabled={gA == null || gB == null}
              data-iq-lay
            >
              {T.lay}
            </button>
          </>
        )}
        {stage === 'say' && (
          <>
            <p className="iq-askline">
              <MathText>{T.sayLead({ a, b, crown })}</MathText>
            </p>
            <div className="iq-tpl" dir="rtl">
              <label>
                <small>{T.sayCount}</small>
                <Num value={countIn} onChange={setCountIn} w={2} data-iq-in="count" onKeyDown={onEnter(check)} />
              </label>
            </div>
            <button type="button" className="rf-btn rf-btn--main" onClick={check} data-iq-check>
              {T.check}
            </button>
          </>
        )}
        {stage === 'seen' && (
          <button type="button" className="rf-btn rf-btn--main" onClick={next} data-iq-next>
            {ri + 1 >= spec.rounds.length ? T.done : T.next}
          </button>
        )}
      </div>

      <Found lines={found.map((f) => ({ key: `${f.a}-${f.b}`, text: T.foundLine(f) }))} />
    </section>
  );
}

// ───────────────────────── ladder: a pair replaced by a simpler pair ─────────────────────────
const MAXR = 6; // rows on screen; more are folded behind one line (never deleted)
const rowTex = (r, mode) =>
  mode === 'divide' ? `${r.a} = ${r.b} \\times ${r.q} + ${r.value}` : `${r.a} - ${r.b} = ${r.value}`;
const same = (x, y) => x.length === y.length && x.every((v, i) => v === y[i]);
const samePair = (x, y) => x && y && ((x[0] === y[0] && x[1] === y[1]) || (x[0] === y[1] && x[1] === y[0]));

/** One row of the ladder: the gap a with the planks of b laid (once written) and the piece left, as a bar. */
export function RungBar({ r, written, scale, end }) {
  const planks = written ? r.q : 0;
  const w = r.b * scale;
  return (
    <svg className="iq-rung__bar" viewBox="0 0 400 26" preserveAspectRatio="none" aria-hidden="true">
      <rect className="iq-gapcell" x="0" y="5" width={r.a * scale} height="16" rx="3" />
      {!written && <rect className="iq-plank is-open" x="0" y="1" width={w} height="24" rx="3" />}
      {planks <= 40
        ? Array.from({ length: planks }, (_, k) => (
            <rect
              key={k}
              className={`iq-plank iq-plank--drop ${k % 2 ? 'is-alt' : ''} ${end ? 'is-end' : ''}`}
              x={k * w + 0.5}
              y="1"
              width={Math.max(0.5, w - 1)}
              height="24"
              rx="3"
            />
          ))
        : planks > 0 && <rect className="iq-plank iq-plank--drop" x="0" y="1" width={planks * w} height="24" rx="3" />}
      {written && r.value > 0 && (
        <rect className="iq-rest" x={planks * w} y="1" width={Math.max(1, r.value * scale - 0.5)} height="24" rx="3" />
      )}
    </svg>
  );
}

function LadderRows({ spec, play, onDone }) {
  const T = spec.text;
  // empty, or where a workshop's bench was left (`spec.from`, inquiry.js › ladderStart)
  const [start] = useState(() => ladderStart(spec));
  const [ri, setRi] = useState(start.ri);
  const { a, b } = spec.rounds[ri];
  const mode = spec.rounds[ri].mode ?? spec.mode;
  // `plain` (spec or round — a workshop's bench): the rows and their calculations only, no column of the planks common
  // to each row's pair and no value lit gold at the end — on a bench they would show which plank to make
  const plain = Boolean(spec.rounds[ri].plain ?? spec.plain);
  const L = ladderOf(a, b, mode);
  const askAt = ladderAsk(spec, ri);
  const [written, setWritten] = useState(start.written); // rows whose calculation is written
  const [stage, setStage] = useState(start.stage); // guess | write | count | finish | seen
  const [xIn, setXIn] = useState('');
  const [yIn, setYIn] = useState('');
  const [guesses, setGuesses] = useState(start.guesses);
  const [last, setLast] = useState(start.last);
  const [countIn, setCountIn] = useState('');
  const [guessed, setGuessed] = useState(start.guessed);
  const [found, setFound] = useState(start.found);
  const later = useLater();
  // the bench hears every move, to keep it (`spec.onState`, as InquiryLists.jsx)
  useEffect(() => {
    spec.onState?.({ ri, written, stage, guesses, last, guessed, found });
  }, [spec, ri, written, stage, guesses, last, guessed, found]);
  expose({ kind: 'ladder', ri, a, b, mode, plain, steps: L.steps, gcd: L.gcd, stage, written, guessed, found });

  const open = written < L.steps ? L.rows[written] : null; // the row whose pair is shown, calculation not yet
  const end = { a, b, mode, steps: L.steps, guessed, gcd: L.gcd };

  const predict = () => {
    const x = asNumber(xIn);
    const y = asNumber(yIn);
    if (stage !== 'guess' || x == null || y == null) return;
    const said = [x, y];
    const hit = Boolean(samePair(said, open.next));
    play('pick');
    setGuesses((list) => [...list, { row: written + 1, said, hit }]);
    setStage('write');
    later(260, () => {
      play('plank');
      setLast({ a: open.a, b: open.b, mode, value: open.value, q: open.q, next: open.next, said, hit });
      setWritten(written + 1);
      setXIn('');
      setYIn('');
      setStage(written + 1 < askAt ? 'guess' : 'count');
    });
  };
  const count = () => {
    const n = asNumber(countIn);
    if (stage !== 'count' || n == null) return;
    play('pick');
    setGuessed(n);
    setStage('finish');
    const rest = L.steps - written;
    for (let i = 1; i <= rest; i += 1)
      later(i * 520, () => {
        play('sweep', i);
        setWritten(written + i);
      });
    later(rest * 520 + 450, () => {
      play('gate');
      setStage('seen');
      setFound((list) => [...list, { a, b, mode, steps: L.steps, guessed: n, gcd: L.gcd, guesses }]);
    });
  };
  const next = () => {
    if (ri + 1 >= spec.rounds.length) {
      onDone({
        rounds: found.map((f) => ({
          a: f.a,
          b: f.b,
          mode: f.mode,
          steps: f.steps,
          guessed: f.guessed,
          gcd: f.gcd,
          guesses: f.guesses,
        })),
      });
      return;
    }
    setRi(ri + 1);
    setWritten(0);
    setStage(ladderAsk(spec, ri + 1) > 0 ? 'guess' : 'count');
    setGuesses([]);
    setLast(null);
    setCountIn('');
    setGuessed(null);
  };

  // the rows on screen: every written row and the open one; past MAXR, the first row, a fold, then the last ones
  const all = L.rows.slice(0, Math.min(L.steps, written + 1)).map((r, i) => ({ r, i }));
  const view = all.length > MAXR ? [all[0], null, ...all.slice(-(MAXR - 2))] : all;
  const scale = 400 / L.rows[0].a;
  const ticks = commonPlanks(a, b);
  const newest = written > 0 ? L.rows[written - 1] : null;
  const lit = stage === 'seen' && !plain; // the last value that is not 0, gold

  return (
    <section
      className="iq iq--div iq--ladder"
      data-iq="ladder"
      data-iq-stage={stage}
      data-iq-mode={mode}
      {...(plain ? { 'data-iq-plain': '' } : {})}
    >
      <Head i={ri} n={spec.rounds.length} lead={T.lead(a, b, mode)} goal={T.goal(a, b, mode)} />

      <div className="iq-ladder" dir="ltr" data-iq-ladder>
        <div className="iq-rung iq-rung--head">
          <span />
          <span />
          <span />
          {!plain && <small dir="rtl">{T.planks}</small>}
        </div>
        {view.map((v) =>
          v == null ? (
            <div key="fold" className="iq-rung iq-rung--fold" data-iq-fold={all.length - MAXR + 1}>
              <span />
              <small dir="rtl">{T.folded(all.length - MAXR + 1)}</small>
            </div>
          ) : (
            <div
              key={v.i}
              className={`iq-rung ${v.i < written ? 'is-written' : 'is-open'} ${v.i === written - 1 ? 'is-new' : ''}`}
              data-iq-row={v.i + 1}
            >
              <span className="iq-rung__n">{v.i + 1}</span>
              <RungBar r={v.r} written={v.i < written} scale={scale} end={lit && v.i === L.steps - 1} />
              <span className="iq-rung__tex">
                <MathText>
                  {`$(${v.r.a}\\,;\\,${lit && v.i === L.steps - 1 ? `\\textcolor{#fbbf24}{${v.r.b}}` : v.r.b})$`}
                </MathText>
                {v.i < written && <MathText>{`$${rowTex(v.r, mode)}$`}</MathText>}
              </span>
              {!plain && (
                <span className="iq-rung__ticks" data-iq-ticks={commonPlanks(v.r.a, v.r.b).join(',')}>
                  {commonPlanks(v.r.a, v.r.b).map((d) => (
                    <b key={d}>{d}</b>
                  ))}
                  <i aria-hidden="true">{same(commonPlanks(v.r.a, v.r.b), ticks) ? '✓' : ''}</i>
                </span>
              )}
            </div>
          ),
        )}
      </div>

      <Calc items={newest ? [rowTex(newest, mode)] : []} />
      <p className="iq-fact" data-iq-fact>
        <MathText>{stage === 'seen' ? T.end(end) : last && stage !== 'write' ? T.seen(last) : ' '}</MathText>
      </p>

      <div className="iq-actions">
        {stage === 'guess' && open && (
          <>
            <p className="iq-askline">
              <MathText>{T.ask({ a: open.a, b: open.b, mode, row: written + 1 })}</MathText>
            </p>
            <div className="iq-tpl" dir="ltr">
              <MathText>{'$($'}</MathText>
              <Num value={xIn} onChange={setXIn} w={4} data-iq-in="x" onKeyDown={onEnter(predict)} />
              <MathText>{'$;$'}</MathText>
              <Num value={yIn} onChange={setYIn} w={4} data-iq-in="y" onKeyDown={onEnter(predict)} />
              <MathText>{'$)$'}</MathText>
            </div>
            <button type="button" className="rf-btn rf-btn--main" onClick={predict} data-iq-write>
              {T.write}
            </button>
          </>
        )}
        {stage === 'count' && (
          <>
            <p className="iq-askline">
              <MathText>{T.countAsk({ a, b, mode, written })}</MathText>
            </p>
            <div className="iq-tpl" dir="rtl">
              <label>
                <small>{T.countLabel}</small>
                <Num value={countIn} onChange={setCountIn} w={2} data-iq-in="count" onKeyDown={onEnter(count)} />
              </label>
            </div>
            <button type="button" className="rf-btn rf-btn--main" onClick={count} data-iq-count>
              {T.finish}
            </button>
          </>
        )}
        {stage === 'seen' && (
          <button type="button" className="rf-btn rf-btn--main" onClick={next} data-iq-next>
            {ri + 1 >= spec.rounds.length ? T.done : T.next}
          </button>
        )}
      </div>

      <Found
        lines={found.map((f) => ({
          key: `${f.a}-${f.b}-${f.mode}`,
          text: T.foundLine(f),
          fell: f.guessed !== f.steps,
        }))}
      />
    </section>
  );
}
// ───────────────────────── nest: the common planks and the planks of g ─────────────────────────
const YN = [26, 92, 158];

function NestG({ spec, play, onDone }) {
  const T = spec.text;
  const [ri, setRi] = useState(0);
  const { a, b, probes } = spec.rounds[ri];
  const n = nestOf(a, b, probes);
  const { g } = n;
  const [pi, setPi] = useState(0);
  const [stage, setStage] = useState('guess'); // guess | lay | compare
  const [last, setLast] = useState(null); // the probe on the strips, with his guess
  const [rows, setRows] = useState([]);
  const [found, setFound] = useState([]);
  const later = useLater();
  expose({ kind: 'nest', ri, a, b, g, pi, stage, rows: rows.length, found });

  const u = SPAN / Math.max(a, b);
  const p = probes[Math.min(pi, probes.length - 1)];
  const say = (guess) => {
    if (stage !== 'guess') return;
    const row = { a, b, g, ...n.rows[pi], holdsA: a % p === 0, holdsB: b % p === 0, guess };
    play('pick');
    setStage('lay');
    later(150, () => play('sweep'));
    later(320, () => {
      play('plank');
      setLast(row);
    });
    later(1300, () => {
      play(guess === row.both ? 'success' : 'crumble');
      const all = [...rows, row];
      setRows(all);
      setPi(pi + 1);
      if (pi + 1 < probes.length) {
        setStage('guess');
        return;
      }
      setStage('compare');
      setFound((list) => [...list, { a, b, g, rows: all.map((r) => ({ p: r.p, guess: r.guess, both: r.both })) }]);
    });
  };
  const next = () => {
    if (ri + 1 >= spec.rounds.length) {
      onDone({ rounds: found });
      return;
    }
    setRi(ri + 1);
    setPi(0);
    setStage('guess');
    setLast(null);
    setRows([]);
  };

  const d = last?.p;
  return (
    <section className="iq iq--div iq--nest" data-iq="nest" data-iq-stage={stage} data-iq-probe={p}>
      <Head i={ri} n={spec.rounds.length} lead={T.lead(a, b)} goal={T.goal(a, b)} />

      <div className="iq-gknown">
        <MathText>{T.given({ a, b, g })}</MathText>
        <small>{T.divisorsLabel(g)}</small>
        <span className="iq-chips" data-iq-divs={n.divisorsOfG.join(',')}>
          {n.divisorsOfG.map((x) => (
            <span key={x} className={`iq-chip iq-chip--s ${x === d ? 'is-on' : ''}`}>
              {x}
            </span>
          ))}
        </span>
      </div>

      <svg className="iq-scene" viewBox="0 0 1000 200" role="img" aria-label={`${a} · ${b} · ${g}`}>
        <Strip key={`a${d}`} n={a} d={d} u={u} y={YN[0]} tag="a" />
        <Strip key={`b${d}`} n={b} d={d} u={u} y={YN[1]} tag="b" />
        <Strip key={`g${d}`} n={g} d={d} u={u} y={YN[2]} tag="g" gold />
      </svg>

      <Calc items={last ? [restTex(a, d), restTex(b, d), restTex(g, d)] : []} />
      <p className="iq-fact" data-iq-fact>
        <MathText>{stage === 'compare' ? T.compare({ a, b, ...n }) : last ? T.seen(last, last.guess) : ' '}</MathText>
      </p>

      <div className="iq-actions">
        {stage === 'guess' && (
          <>
            <p className="iq-askline">
              <MathText>{T.ask({ a, b, g, p })}</MathText>
            </p>
            <YesNo T={T} value={null} onSay={say} hook="data-iq-say" />
          </>
        )}
        {stage === 'compare' && (
          <>
            <div className="iq-lists" data-iq-lists>
              <div data-iq-list="common">
                <small>{T.commonLabel(a, b)}</small>
                <span className="iq-chips">
                  {n.common.map((x) => (
                    <span key={x} className="iq-chip iq-chip--s is-on">
                      {x}
                    </span>
                  ))}
                </span>
              </div>
              <div data-iq-list="g">
                <small>{T.divisorsLabel(g)}</small>
                <span className="iq-chips">
                  {n.divisorsOfG.map((x) => (
                    <span key={x} className="iq-chip iq-chip--s is-on">
                      {x}
                    </span>
                  ))}
                </span>
              </div>
            </div>
            <button type="button" className="rf-btn rf-btn--main" onClick={next} data-iq-next>
              {ri + 1 >= spec.rounds.length ? T.done : T.next}
            </button>
          </>
        )}
      </div>

      <Found lines={rows.map((r) => ({ key: `${r.p}`, text: T.foundLine(r), fell: r.guess !== r.both }))} />
    </section>
  );
}

// ───────────────────────── the modes (InquiryGcdModes.jsx): a spec without `mode` plays exactly as above ─────────────────────────
export function Common(props) {
  return props.spec.mode === 'witness' ? <Witness {...props} /> : <CommonShelves {...props} />;
}
export function Ladder(props) {
  const { mode } = props.spec;
  if (mode === 'fold') return <Fold {...props} />;
  if (mode === 'both') return <Both {...props} />;
  return <LadderRows {...props} />;
}
export function Nest(props) {
  return props.spec.mode === 'pair' ? <Pair {...props} /> : <NestG {...props} />;
}
