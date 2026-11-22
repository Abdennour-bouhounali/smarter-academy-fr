/**
 * Two more INVESTIGATIONS of a rule forge in this world (see `Inquiry.jsx`, which mounts them; logic: `inquiry.js`):
 *
 *   turn   « one bridge gives a second one » — the planks of a bridge are lifted into a WALL (one row per plank), and the
 *          wall is taken down by its COLUMNS: the same cells, read the other way. A bridge that fell makes a ragged wall.
 *   cut    « a whole number of planks » — the student's hand slides the LENGTH of the plank over one gap: the planks are
 *          laid again at once, with the piece that would have to be sawn; then he judges from a quotient alone.
 *
 * `spec.text` is the lesson's wording. Nothing here states a rule: every sentence says what the wall or the saw just did.
 */
import { useEffect, useRef, useState } from 'react';
import MathText from '../../components/MathText';
import { wall, pieceOf, quotientTex } from './inquiry';
import { FAST, expose, X0, SPAN } from './inquiryParts';

// ───────────────────────── turn ─────────────────────────
const GAP_Y = 318;

export function Turn({ spec, play, onDone }) {
  const T = spec.text;
  const [ri, setRi] = useState(0);
  const round = spec.rounds[ri];
  const w = wall(round.a, round.d);
  const hands = round.mode === 'hands';
  const [lifted, setLifted] = useState(0); // rows of the wall already lifted
  const [laid, setLaid] = useState(0); // columns already taken down onto the gap
  const [stage, setStage] = useState(hands ? 'lift' : 'predict'); // lift | cut | predict | turning | seen
  const [guess, setGuess] = useState({});
  const [found, setFound] = useState([]);
  const timer = useRef(null);
  useEffect(() => () => clearInterval(timer.current), []);
  expose({ kind: 'turn', ri, a: w.a, d: w.d, e: w.e, rest: w.rest, stage, lifted, laid, guess, found });

  const u = SPAN / w.a;
  const size = Math.min(30, 250 / w.rows, 300 / w.d);
  const wx = 500 - (w.d * size) / 2;
  const wy = 150 - (w.rows * size) / 2;
  const before = (c) => w.heights.slice(0, c).reduce((s, h) => s + h, 0);
  const place = (cell) => {
    if (cell.c < laid) return { x: X0 + (before(cell.c) + cell.r) * u, y: GAP_Y, s: u, plank: cell.c };
    if (cell.r < lifted) return { x: wx + cell.c * size, y: wy + cell.r * size, s: size, plank: cell.r };
    return { x: X0 + (cell.r * w.d + cell.c) * u, y: GAP_Y, s: u, plank: cell.r };
  };
  const hidden = round.mode === 'blind' && stage === 'predict';

  const done = (g = guess) => {
    setStage('seen');
    play(w.even ? 'success' : 'crumble');
    setFound((list) => [...list, { a: w.a, d: w.d, e: w.e, even: w.even, guess: g }]);
  };
  const lift = () => {
    if (stage !== 'lift') return;
    play('pick');
    if (lifted + 1 >= w.rows) setStage('cut');
    setLifted(lifted + 1);
  };
  const lay = () => {
    if (stage !== 'cut') return;
    play('plank');
    setLaid(laid + 1);
    if (laid + 1 >= w.d) done();
  };
  const turnAll = () => {
    setStage('turning');
    let step = 0;
    timer.current = setInterval(
      () => {
        step += 1;
        if (step <= w.rows) setLifted(step);
        else if (step <= w.rows + w.d) setLaid(step - w.rows);
        else {
          clearInterval(timer.current);
          done();
        }
      },
      FAST() ? 6 : 260,
    );
  };
  const next = () => {
    if (ri + 1 >= spec.rounds.length) {
      onDone({ bridges: found });
      return;
    }
    const r = spec.rounds[ri + 1];
    setRi(ri + 1);
    setLifted(0);
    setLaid(0);
    setGuess({});
    setStage(r.mode === 'hands' ? 'lift' : 'predict');
  };
  const say = (key, v) => {
    play('ui');
    setGuess({ ...guess, [key]: v });
  };
  const asksPair = w.even;
  const ready = asksPair ? guess.len != null && guess.count != null : guess.equal != null;
  const right = asksPair ? guess.len === w.e && guess.count === w.d : guess.equal === false;
  const chips = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <section className="iq iq--turn" data-iq="turn" data-iq-stage={stage} data-iq-gap={w.a} data-iq-plank={w.d}>
      <div className="iq-lead">
        <span className="iq-count">
          {ri + 1}&nbsp;/&nbsp;{spec.rounds.length}
        </span>
        <p>
          <MathText>
            {stage === 'lift'
              ? T.lift(w)
              : stage === 'cut'
                ? T.cut(w)
                : stage === 'seen'
                  ? w.even
                    ? T.seen(w, hands ? null : guess, right)
                    : T.seenRagged(w, guess, right)
                  : round.mode === 'blind'
                    ? T.askBlind(w)
                    : asksPair
                      ? T.askPair(w)
                      : T.askEqual(w)}
          </MathText>
        </p>
      </div>

      <svg className="iq-wall" viewBox="0 0 1000 372" role="img" aria-label={T.wallLabel(w)}>
        {!hidden && (
          <>
            {/* the gap: its cells, empty */}
            {Array.from({ length: w.a }, (_, i) => (
              <rect
                key={i}
                className="iq-gapcell"
                x={X0 + i * u}
                y={GAP_Y}
                width={u - 1.5}
                height={Math.min(u, 30)}
                rx="3"
              />
            ))}
            {w.cells.map((cell) => {
              const p = place(cell);
              const onGap = p.y === GAP_Y;
              const mine = (stage === 'lift' && cell.r === lifted) || (stage === 'cut' && cell.c === laid);
              return (
                <rect
                  key={`${cell.r}-${cell.c}`}
                  className={`iq-brick ${cell.rest && cell.c >= laid ? 'is-rest' : p.plank % 2 ? 'is-b' : 'is-a'} ${mine ? 'is-mine' : ''}`}
                  x={p.x}
                  y={p.y}
                  width={p.s - 1.5}
                  height={onGap ? Math.min(u, 30) : p.s - 1.5}
                  rx="3"
                  onClick={stage === 'lift' ? lift : stage === 'cut' ? lay : undefined}
                />
              );
            })}
            {/* what the gap holds now: the planks counted and measured */}
            {(stage === 'seen' || (stage === 'lift' && lifted === 0)) && (
              <text className="iq-wall__say" x="500" y="366">
                {stage === 'seen' ? T.under(w, true) : T.under(w, false)}
              </text>
            )}
          </>
        )}
      </svg>

      <div className="iq-actions">
        {stage === 'lift' && (
          <button type="button" className="rf-btn rf-btn--main" onClick={lift} data-iq-lift={lifted}>
            {T.liftBtn}
          </button>
        )}
        {stage === 'cut' && (
          <button type="button" className="rf-btn rf-btn--main" onClick={lay} data-iq-lay={laid}>
            {T.layBtn}
          </button>
        )}
        {stage === 'predict' && asksPair && (
          <div className="iq-asks">
            {[
              ['len', T.len],
              ['count', T.count],
            ].map(([key, label]) => (
              <div key={key} className="iq-ask">
                <span>{label}</span>
                <div className="iq-chips" dir="ltr">
                  {chips.map((k) => (
                    <button
                      key={k}
                      type="button"
                      className={`iq-chip iq-chip--s ${guess[key] === k ? 'is-on' : ''}`}
                      onClick={() => say(key, k)}
                      data-iq-say={`${key}:${k}`}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {stage === 'predict' && !asksPair && (
          <>
            {[
              [true, T.yes],
              [false, T.no],
            ].map(([v, label]) => (
              <button
                key={label}
                type="button"
                className={`rf-btn ${guess.equal === v ? 'rf-btn--main' : ''}`}
                onClick={() => say('equal', v)}
                data-iq-say={`equal:${v ? 'yes' : 'no'}`}
              >
                {label}
              </button>
            ))}
          </>
        )}
        {stage === 'predict' && ready && (
          <button type="button" className="rf-btn rf-btn--main" onClick={turnAll} data-iq-turn>
            {T.turn}
          </button>
        )}
        {stage === 'seen' && (
          <button type="button" className="rf-btn rf-btn--main" onClick={next} data-iq-next>
            {ri + 1 >= spec.rounds.length ? T.done : T.next}
          </button>
        )}
      </div>

      {found.some((f) => f.even) && (
        <ul className="iq-found" data-iq-found>
          {found
            .filter((f) => f.even)
            .map((f) => (
              <li key={`${f.a}-${f.d}`}>
                <MathText>{T.foundLine(f)}</MathText>
              </li>
            ))}
        </ul>
      )}
    </section>
  );
}

// ───────────────────────── cut ─────────────────────────
export function Cut({ spec, play, onDone }) {
  const T = spec.text;
  const [stage, setStage] = useState('free'); // free | count | ask | shown
  const [b, setB] = useState(spec.free.start);
  const [tried, setTried] = useState([spec.free.start]);
  const [said, setSaid] = useState(null);
  const [ai, setAi] = useState(0);
  const [answers, setAnswers] = useState([]);
  const free = stage === 'free' || stage === 'count';
  const a = free ? spec.free.a : spec.asks[ai].a;
  const plank = free ? b : spec.asks[ai].b;
  const p = pieceOf(a, plank);
  const u = SPAN / a;
  const exactTried = tried.filter((k) => spec.free.a % k === 0);
  expose({ kind: 'cut', stage, a, b: plank, tried, exactTried, ai, said, answers });

  const move = (v) => {
    const k = Math.max(1, Math.min(spec.free.a, v));
    if (k === b) return;
    play(spec.free.a % k === 0 ? 'key' : 'pick');
    setB(k);
    setSaid(null);
    if (!tried.includes(k)) setTried([...tried, k]);
  };
  const count = (k) => {
    const ok = k === spec.free.exact;
    play(ok ? 'success' : 'ui');
    setSaid({ k, ok });
    if (ok) setStage('ask');
  };
  const answer = (v) => {
    play(v === p.exact ? 'success' : 'crumble');
    setAnswers([...answers, { a, b: plank, said: v, exact: p.exact }]);
    setStage('shown');
  };
  const next = () => {
    if (ai + 1 >= spec.asks.length) {
      onDone({ a: spec.free.a, tried, asks: answers });
      return;
    }
    setAi(ai + 1);
    setStage('ask');
  };
  const drawn = free || stage === 'shown';
  const last = answers.at(-1);

  return (
    <section className="iq iq--cut" data-iq="cut" data-iq-stage={stage} data-iq-gap={a} data-iq-plank={plank}>
      <div className="iq-lead">
        <span className="iq-count">
          {free ? 1 : ai + 2}&nbsp;/&nbsp;{spec.asks.length + 1}
        </span>
        <p>
          <MathText>
            {stage === 'free'
              ? T.free(a, tried.length >= spec.free.need)
              : stage === 'count'
                ? T.countAsk(a)
                : stage === 'ask'
                  ? T.ask(a, plank, quotientTex(a, plank))
                  : T.shown(a, plank, p, last.said === p.exact)}
          </MathText>
        </p>
      </div>

      <svg className="iq-saw" viewBox="0 0 1000 150" role="img" aria-label={T.sawLabel(a, plank)}>
        {Array.from({ length: a }, (_, i) => (
          <rect key={i} className="iq-gapcell" x={X0 + i * u} y="62" width={u - 1.5} height="40" rx="3" />
        ))}
        {drawn &&
          Array.from({ length: p.whole }, (_, k) => (
            <rect key={k} className="iq-plank" x={X0 + k * plank * u} y="58" width={plank * u - 3} height="48" rx="7" />
          ))}
        {drawn && p.piece > 0 && (
          <>
            <rect className="iq-piece" x={X0 + p.whole * plank * u} y="58" width={p.piece * u - 3} height="48" rx="7" />
            <text className="iq-saw__piece" x={X0 + (p.whole * plank + p.piece / 2) * u} y="134">
              ✂ {T.piece(p.piece, plank)}
            </text>
          </>
        )}
        {drawn && (
          <text className="iq-saw__count" x="500" y="36">
            {T.laid(p.whole, p.piece)}
          </text>
        )}
      </svg>

      {free && (
        <div className="iq-slide" dir="ltr">
          <button
            type="button"
            className="iq-chip"
            onClick={() => move(b - 1)}
            aria-label={T.shorter}
            data-iq-step="-1"
          >
            −
          </button>
          <input
            type="range"
            min="1"
            max={spec.free.a}
            value={b}
            onChange={(e) => move(Number(e.target.value))}
            aria-label={T.length}
            data-iq-slider
          />
          <button type="button" className="iq-chip" onClick={() => move(b + 1)} aria-label={T.longer} data-iq-step="1">
            +
          </button>
          <strong dir="rtl" data-iq-b={b}>
            {T.lengthIs(b)}
          </strong>
        </div>
      )}

      <p className="iq-fact" data-iq-fact>
        <MathText>
          {stage === 'count' && said && !said.ok
            ? T.countMiss(said.k, exactTried, spec.free.a)
            : free
              ? T.fact(a, plank, quotientTex(a, plank), p)
              : ' '}
        </MathText>
      </p>

      {free && (
        <div className="iq-table" dir="ltr" data-iq-table>
          <div className="iq-table__head" dir="rtl">
            <span>{T.cols.plank}</span>
            <span>{T.cols.count}</span>
          </div>
          {tried.slice(-9).map((k) => (
            <div key={k} className={`iq-try ${spec.free.a % k === 0 ? 'is-new' : 'is-fell'}`} data-iq-tried={k}>
              <b>{k}</b>
              <span>
                <MathText>{`$${quotientTex(spec.free.a, k)}$`}</MathText>
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="iq-actions">
        {stage === 'free' && tried.length >= spec.free.need && (
          <button type="button" className="rf-btn rf-btn--main" onClick={() => setStage('count')} data-iq-enough>
            {T.enough}
          </button>
        )}
        {stage === 'count' && (
          <div className="iq-chips" dir="ltr">
            {[0, 1, 2, 3, 4, 5].map((k) => (
              <button
                key={k}
                type="button"
                className={`iq-chip ${said?.k === k ? 'is-said' : ''}`}
                onClick={() => count(k)}
                data-iq-count={k}
              >
                {k}
              </button>
            ))}
          </div>
        )}
        {stage === 'ask' &&
          [
            [true, T.yes],
            [false, T.no],
          ].map(([v, label]) => (
            <button
              key={label}
              type="button"
              className="rf-btn"
              onClick={() => answer(v)}
              data-iq-say={v ? 'yes' : 'no'}
            >
              {label}
            </button>
          ))}
        {stage === 'shown' && (
          <button type="button" className="rf-btn rf-btn--main" onClick={next} data-iq-next>
            {ai + 1 >= spec.asks.length ? T.done : T.next}
          </button>
        )}
      </div>
    </section>
  );
}
