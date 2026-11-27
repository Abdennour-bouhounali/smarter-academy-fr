import { useState } from 'react';
import { deal, gcd, meetings, powerForm } from './logic';
import { Key, LotsScene, TimelineScene } from './parts';
import { T } from './text';

/**
 * « Vers le brevet » — PROTOTYPE: the four quick manipulations of the unit, one per lesson, about twenty seconds each.
 * They are not exercises: nothing is counted. Each one lets the student DO the rule once more — `tell` gives the robot
 * its sentence (and its face, and a sound), `win` is the moment the rule shows itself.
 */
const PRIMES = [2, 3, 5, 7];

/** Break a number into primes, one tap per factor. */
function DecManip({ tell, win }) {
  const NUMBERS = [60, 84, 126];
  const [k, setK] = useState(0);
  const [factors, setFactors] = useState([]);
  const n = NUMBERS[k % NUMBERS.length];
  const rest = factors.reduce((v, p) => v / p, n);

  const tap = (p) => {
    if (rest % p !== 0) {
      tell(T.decNo(p, rest), 'oops', 'bad');
      return;
    }
    const all = [...factors, p];
    setFactors(all);
    if (rest / p === 1) win(T.decDone(n, powerForm(all)));
    else tell(T.decGo(rest / p), 'idle', 'good');
  };

  return (
    <div className="vb-manip">
      <p className="vb-big">
        {n} = {factors.join(' × ')}
        {factors.length > 0 && rest > 1 && ' × '}
        {rest > 1 && <b className="vb-big__rest">{rest}</b>}
      </p>
      {rest === 1 && <p className="vb-big vb-big--done">= {powerForm(factors)}</p>}
      <div className="vb-keys">
        {rest > 1 ? (
          PRIMES.map((p) => (
            <Key key={p} kind="mini" onClick={() => tap(p)}>
              {p}
            </Key>
          ))
        ) : (
          <Key
            kind="go"
            onClick={() => {
              setK(k + 1);
              setFactors([]);
            }}
          >
            {T.decAgain}
          </Key>
        )}
      </div>
    </div>
  );
}

/** Share two stocks into a chosen number of bouquets: the picture deals them, what does not fit stays. */
function PgcdManip({ tell, win }) {
  const [a, b, A, B] = [24, 36, 'roses', 'tulipes'];
  const [n, setN] = useState(null);

  const tap = (v) => {
    setN(v);
    const d = deal(a, b, v);
    if (d.r1 || d.r2) tell(T.lotsLeft(v, d.r1, A, d.r2, B), 'oops', 'bad');
    else if (v === gcd(a, b)) win(T.lotsBest(v));
    else tell(T.lotsMore(v), 'think', 'good');
  };

  return (
    <div className="vb-manip">
      <LotsScene a={a} b={b} A={A} B={B} n={n} />
      <div className="vb-keys">
        {[2, 4, 6, 10, 12, 16].map((v) => (
          <Key key={v} kind="mini" aria-pressed={n === v} onClick={() => tap(v)}>
            {v}
          </Key>
        ))}
      </div>
    </div>
  );
}

/** Two lighthouses: step through time until both light together. */
function PpcmManip({ tell, win }) {
  const [a, b] = [12, 18];
  const events = meetings(a, b);
  const [i, setI] = useState(-1);
  const over = i === events.length - 1;

  const step = () => {
    const e = events[i + 1];
    setI(i + 1);
    if (e.who === 'both') win(T.rdvBoth(e.at));
    else tell(T.rdvOne(e.at, T.rdvWhich[e.who === 'a' ? 0 : 1]), 'idle', 'tap');
  };

  return (
    <div className="vb-manip">
      <TimelineScene a={a} b={b} at={i < 0 ? null : events[i].at} unit="s" />
      <div className="vb-keys">
        {over ? (
          <Key kind="go" onClick={() => setI(-1)}>
            {T.rdvAgain}
          </Key>
        ) : (
          <Key onClick={step}>{T.rdvStep}</Key>
        )}
      </div>
    </div>
  );
}

/** Shrink a fraction by a common divisor, tap after tap, until nothing divides both. */
function IrrManip({ tell, win }) {
  const FRACTIONS = [
    [42, 70],
    [36, 60],
    [45, 75],
  ];
  const [k, setK] = useState(0);
  const [chain, setChain] = useState([FRACTIONS[0]]);
  const [num, den] = chain[chain.length - 1];
  const done = gcd(num, den) === 1;

  const tap = (d) => {
    if (num % d !== 0 || den % d !== 0) {
      tell(T.irrNo(d, num % d !== 0 ? num : den), 'oops', 'bad');
      return;
    }
    const next = [num / d, den / d];
    setChain([...chain, next]);
    if (gcd(...next) === 1) win(T.irrDone(...next));
    else tell(T.irrGo, 'think', 'good');
  };

  return (
    <div className="vb-manip">
      <p className="vb-chain">
        {chain.map(([x, y], j) => (
          <span key={j} className="vb-chain__item">
            {j > 0 && <i>=</i>}
            <span className={`vb-frac${j === chain.length - 1 ? ' is-now' : ''}`}>
              <b>{x}</b>
              <b>{y}</b>
            </span>
          </span>
        ))}
      </p>
      <div className="vb-keys">
        {done ? (
          <Key
            kind="go"
            onClick={() => {
              setK(k + 1);
              setChain([FRACTIONS[(k + 1) % FRACTIONS.length]]);
            }}
          >
            {T.irrAgain}
          </Key>
        ) : (
          PRIMES.map((d) => (
            <Key key={d} kind="mini" onClick={() => tap(d)}>
              ÷ {d}
            </Key>
          ))
        )}
      </div>
    </div>
  );
}

export const MANIPS = { dec: DecManip, pgcd: PgcdManip, ppcm: PpcmManip, irr: IrrManip };
