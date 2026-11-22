/**
 * Four INVESTIGATIONS of the Euclidean division in this world (see `Inquiry.jsx`, which mounts them; logic: `inquiry.js`).
 * A gap of a cells, planks of b laid one after the other: q planks fit and r cells are left.
 *
 *   groups    « lay as many planks as fit » — a SEARCH: he lays the planks ONE AT A TIME and says BEFORE each one whether it
 *             will fit; the world lays it (or shows it hanging past the end) and writes what is left. Then he says how
 *             many planks and how many cells are left.
 *   rebuild   « the gap is rebuilt from its planks and its piece » — a PATTERN read backwards: q planks and a piece lie on
 *             a gap hidden under a cloth; he says the length BEFORE the cloth is lifted. A piece as long as a plank is not
 *             left over: the world lays one more plank in it.
 *   estimate  « tens of planks, then units » — a PROCEDURE: a ruler of the multiples of the plank (×10, ×20 … then ×1 …
 *             ×9); he picks the biggest mark that does not pass what is left; the world lays them and writes the rest.
 *   bracket   « a ÷ b between two consecutive natural numbers » — a BRACKETING: the gap is a flag on a line of the
 *             multiples of b; he types the two numbers around it, then says whether the flag stands between two marks
 *             or ON one.
 *
 * `spec.text` is the lesson's wording (GAME_WORLD.md « استكشف », spec shapes). Nothing here states a rule: every sentence
 * says what the strip, the cloth, the ruler or the line has just done.
 */
import { useState } from 'react';
import MathText from '../../components/MathText';
import { Num } from '../kit/parts';
import { groupsOf, rebuildOf, estimateSteps, estimateMark, bracketOf, bracketSays, quotientTex } from './inquiry';
import { Span, Calc, restTex } from './InquiryCombine';
import { expose, X0, SPAN, useLater, YesNo } from './inquiryParts';

/** The question of the round (with its counter) and the goal, in its own frame: on screen all along. */
export function Head({ i, n, lead, goal }) {
  return (
    <>
      <div className="iq-lead">
        <span className="iq-count">
          {i + 1}&nbsp;/&nbsp;{n}
        </span>
        <p>
          <MathText>{lead}</MathText>
        </p>
      </div>
      <p className="iq-goal" data-iq-goal>
        <span aria-hidden="true">🎯</span>
        {goal}
      </p>
    </>
  );
}

/** What he found, kept on screen in the lesson's words. */
export function Found({ lines }) {
  if (!lines.length) return null;
  return (
    <ul className="iq-found" data-iq-found>
      {lines.map((l) => (
        <li key={l.key} className={l.fell ? 'is-fell' : ''}>
          <MathText>{l.text}</MathText>
        </li>
      ))}
    </ul>
  );
}

export const asNumber = (s) => (s === '' ? null : Number(s));
export const onEnter = (fn) => (e) => {
  if (e.key === 'Enter') fn();
};

// ───────────────────────── groups: planks laid one at a time ─────────────────────────
const YG = 70;

export function Groups({ spec, play, onDone }) {
  const T = spec.text;
  const [ri, setRi] = useState(0);
  const { a, b } = spec.rounds[ri];
  const g = groupsOf(a, b);
  const [laid, setLaid] = useState(0); // planks on the gap
  const [stage, setStage] = useState('guess'); // guess | lay | say | seen
  const [last, setLast] = useState(null); // the last plank tried: { k, fits, left, guess }
  const [guesses, setGuesses] = useState([]);
  const [qIn, setQIn] = useState('');
  const [rIn, setRIn] = useState('');
  const [said, setSaid] = useState(null); // his first answer of the round
  const [miss, setMiss] = useState(null); // his last answer, when it is not what the strip shows
  const [found, setFound] = useState([]);
  const later = useLater();
  expose({ kind: 'groups', ri, a, b, q: g.q, r: g.r, stage, laid, guesses: guesses.length, said, found });

  const u = SPAN / ((g.q + 1) * b); // the gap and one plank past it
  const left = a - laid * b;
  const tried = g.steps[Math.min(laid, g.q)];
  const manual = spec.manual ?? 3;
  const canFinish = stage === 'guess' && a >= 10 * b && guesses.length >= manual && g.q - laid > 1;

  const say = (v) => {
    if (stage !== 'guess') return;
    play('pick');
    setGuesses((list) => [...list, { k: tried.k, guess: v, fits: tried.fits }]);
    setStage('lay');
    later(260, () => {
      setLast({ ...tried, guess: v });
      if (tried.fits) {
        play('plank', tried.k);
        setLaid(tried.k);
        setStage('guess');
      } else {
        play('hit');
        setStage('say');
      }
    });
  };
  // a big gap: after his first predictions the world lays the rest, quickly, and tries the plank that does not fit
  const finish = () => {
    setStage('lay');
    const rest = g.q - laid;
    const beat = Math.max(25, Math.min(120, 1400 / rest));
    for (let i = 1; i <= rest; i += 1)
      later(i * beat, () => {
        play('sweep', i);
        setLaid(laid + i);
      });
    later((rest + 1) * beat + 200, () => {
      play('hit');
      setLast({ ...g.steps[g.q], guess: null });
      setStage('say');
    });
  };
  const check = () => {
    const sq = asNumber(qIn);
    const sr = asNumber(rIn);
    if (sq == null || sr == null || stage !== 'say') return;
    const now = { q: sq, r: sr };
    const first = said ?? now;
    if (!said) setSaid(now);
    if (sq === g.q && sr === g.r) {
      play('key');
      setMiss(null);
      setStage('seen');
      setFound((list) => [...list, { a, b, q: g.q, r: g.r, said: first, guesses }]);
      return;
    }
    play('fail');
    setMiss(now);
  };
  const next = () => {
    if (ri + 1 >= spec.rounds.length) {
      onDone({
        rounds: found.map(({ a: fa, b: fb, q, r, guesses: gs, said: s }) => ({
          a: fa,
          b: fb,
          q,
          r,
          guesses: gs,
          said: s,
        })),
      });
      return;
    }
    setRi(ri + 1);
    setLaid(0);
    setStage('guess');
    setLast(null);
    setGuesses([]);
    setQIn('');
    setRIn('');
    setSaid(null);
    setMiss(null);
  };

  const over = stage === 'say' || stage === 'seen';
  const numbered = Boolean(miss) || stage === 'seen';
  const fact = { a, b, ...(last ?? {}), q: g.q, r: g.r };
  const calc = over
    ? [last && `${b} > ${last.left}`, stage === 'seen' && `${a} - ${b} \\times ${g.q} = ${g.r}`]
    : last
      ? [`${a} - ${b} \\times ${last.k} = ${last.left}`]
      : [];

  return (
    <section className="iq iq--div iq--groups" data-iq="groups" data-iq-stage={stage} data-iq-k={tried.k}>
      <Head i={ri} n={spec.rounds.length} lead={T.lead(a, b)} goal={T.goal(a, b)} />

      <svg className="iq-scene" viewBox="0 0 1000 200" role="img" aria-label={`${a} ÷ ${b}`}>
        <Span n={a} d={b} u={u} y={YG} laid={false} />
        <line className="iq-gapend" x1={X0 + a * u} y1={YG - 26} x2={X0 + a * u} y2={YG + 56} />
        {Array.from({ length: laid }, (_, k) => (
          <g key={k}>
            <rect
              className={`iq-plank iq-plank--drop ${k % 2 ? 'is-alt' : ''}`}
              x={X0 + k * b * u + 1}
              y={YG - 4}
              width={Math.max(1, b * u - 2)}
              height="38"
              rx={Math.min(6, (b * u) / 3)}
            />
            {numbered && b * u >= 24 && (
              <text className="iq-plankno" x={X0 + (k + 0.5) * b * u} y={YG + 22}>
                {k + 1}
              </text>
            )}
          </g>
        ))}
        {over && <rect className="iq-over" x={X0 + g.q * b * u + 1} y={YG - 46} width={b * u - 2} height="30" rx="6" />}
        {stage === 'seen' && g.r > 0 && (
          <rect
            className="iq-rest"
            x={X0 + g.q * b * u}
            y={YG - 4}
            width={Math.max(1, g.r * u - 1.5)}
            height="38"
            rx="5"
          />
        )}
        {left > 0 && (
          <text className="iq-scene__say" x={X0 + (laid * b + left / 2) * u} y={YG + 76}>
            {T.left(left)}
          </text>
        )}
        <text className="iq-scene__num" x={X0} y={YG + 108} direction="ltr">
          0
        </text>
        <text className="iq-scene__num" x={X0 + a * u} y={YG + 108} direction="ltr">
          {a}
        </text>
      </svg>

      <Calc items={calc} />
      <p className="iq-fact" data-iq-fact>
        <MathText>
          {miss && stage === 'say'
            ? T.sayMiss({ ...fact, said: miss })
            : stage === 'seen'
              ? T.sayOk(fact)
              : last
                ? last.fits
                  ? T.laid(fact)
                  : T.over(fact)
                : ' '}
        </MathText>
      </p>

      <div className="iq-actions">
        {stage === 'guess' && (
          <>
            <p className="iq-askline">
              <MathText>{T.ask({ a, b, k: tried.k, left })}</MathText>
            </p>
            <YesNo T={T} onSay={say} />
            {canFinish && (
              <button type="button" className="rf-btn" onClick={finish} data-iq-finish>
                {T.finish}
              </button>
            )}
          </>
        )}
        {stage === 'say' && (
          <>
            <p className="iq-askline">
              <MathText>{T.sayLead({ a, b })}</MathText>
            </p>
            <div className="iq-tpl" dir="rtl">
              <label>
                <Num value={qIn} onChange={setQIn} w={3} data-iq-in="q" onKeyDown={onEnter(check)} />
                <small>{T.sayPlanks}</small>
              </label>
              <label>
                <Num value={rIn} onChange={setRIn} w={3} data-iq-in="r" onKeyDown={onEnter(check)} />
                <small>{T.sayLeft}</small>
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

// ───────────────────────── rebuild: planks and a piece on a gap under a cloth ─────────────────────────
const YR = 80;

export function Rebuild({ spec, play, onDone }) {
  const T = spec.text;
  const [ri, setRi] = useState(0);
  const round = spec.rounds[ri];
  const { b, q, r } = round;
  const x = rebuildOf(b, q, r);
  const [stage, setStage] = useState('guess'); // guess | lift | more | seen
  const [aIn, setAIn] = useState('');
  const [said, setSaid] = useState(null);
  const [found, setFound] = useState([]);
  const later = useLater();
  const fact = { b, q, r, said, ...x };
  expose({ kind: 'rebuild', ri, b, q, r, a: x.a, valid: x.valid, stage, said, found });

  const u = SPAN / x.a;
  const lifted = stage !== 'guess';
  const more = stage === 'more' || (stage === 'seen' && !x.valid);
  const lift = () => {
    const v = asNumber(aIn);
    if (v == null || stage !== 'guess') return;
    play('pick');
    setSaid(v);
    setStage('lift');
    later(120, () => play('sweep'));
    const done = () => {
      play(v === x.a ? 'success' : 'crumble');
      setStage('seen');
      setFound((list) => [...list, { b, q, r, said: v, ...x }]);
    };
    if (x.valid) {
      later(950, done);
      return;
    }
    // the piece is as long as a plank (or longer): the world lays the planks that fit in it
    later(950, () => setStage('more'));
    for (let i = 1; i <= x.more; i += 1) later(950 + i * 380, () => play('plank', i));
    later(1250 + x.more * 380, done);
  };
  const next = () => {
    if (ri + 1 >= spec.rounds.length) {
      onDone({ rounds: found.map((f) => ({ b: f.b, q: f.q, r: f.r, said: f.said, a: f.a })) });
      return;
    }
    setRi(ri + 1);
    setStage('guess');
    setAIn('');
    setSaid(null);
  };

  return (
    <section className="iq iq--div iq--rebuild" data-iq="rebuild" data-iq-stage={stage}>
      <Head i={ri} n={spec.rounds.length} lead={T.lead(round)} goal={T.goal(round)} />

      <svg className="iq-scene" viewBox="0 0 1000 200" role="img" aria-label={T.label(round)}>
        <Span n={x.a} d={b} u={u} y={YR} laid={false} />
        <rect
          className={`iq-cloth ${lifted ? 'is-lifted' : ''}`}
          x={X0 - 6}
          y={YR - 10}
          width={x.a * u + 12}
          height="50"
          rx="10"
          data-iq-cloth={lifted ? 'up' : 'down'}
        />
        {Array.from({ length: more ? x.q2 : q }, (_, k) => (
          <g key={k}>
            <rect
              className={`iq-plank ${k % 2 ? 'is-alt' : ''} ${k >= q ? 'is-new iq-plank--drop' : ''}`}
              x={X0 + k * b * u + 1}
              y={YR - 48}
              width={Math.max(1, b * u - 2)}
              height="30"
              rx={Math.min(6, (b * u) / 3)}
              style={k >= q ? { animationDelay: `${(k - q) * 380}ms` } : undefined}
            />
            {b * u >= 30 && (
              <text className="iq-plankno" x={X0 + (k + 0.5) * b * u} y={YR - 26}>
                {b}
              </text>
            )}
          </g>
        ))}
        {(more ? x.r2 : r) > 0 && (
          <>
            <rect
              className="iq-rest"
              x={X0 + (more ? x.q2 : q) * b * u}
              y={YR - 48}
              width={Math.max(1, (more ? x.r2 : r) * u - 1.5)}
              height="30"
              rx="5"
            />
            <text className="iq-scene__num" x={X0 + ((more ? x.q2 : q) * b + (more ? x.r2 : r) / 2) * u} y={YR - 60}>
              {more ? x.r2 : r}
            </text>
          </>
        )}
        <text className="iq-scene__say" x={500} y={YR + 76}>
          {T.label(round)}
        </text>
        {lifted && (
          <text className="iq-scene__num" x={X0 + x.a * u} y={YR + 110} direction="ltr">
            {x.a}
          </text>
        )}
      </svg>

      <Calc
        items={
          stage === 'guess' || stage === 'lift'
            ? []
            : [`${b} \\times ${q} + ${r} = ${x.a}`, !x.valid && more && restTex(x.a, b)]
        }
      />
      <p className="iq-fact" data-iq-fact>
        <MathText>
          {stage === 'seen' ? (x.valid ? T.seen(fact) : T.more(fact)) : stage === 'more' ? T.more(fact) : ' '}
        </MathText>
      </p>

      <div className="iq-actions">
        {stage === 'guess' && (
          <>
            <p className="iq-askline">
              <MathText>{T.ask(round)}</MathText>
            </p>
            <div className="iq-tpl" dir="ltr">
              {!round.bare && <MathText>{`$${b} \\times ${q} + ${r} =$`}</MathText>}
              <Num value={aIn} onChange={setAIn} w={4} data-iq-in="a" onKeyDown={onEnter(lift)} />
            </div>
            <button type="button" className="rf-btn rf-btn--main" onClick={lift} data-iq-lift>
              {T.lift}
            </button>
          </>
        )}
        {stage === 'seen' && (
          <button type="button" className="rf-btn rf-btn--main" onClick={next} data-iq-next>
            {ri + 1 >= spec.rounds.length ? T.done : T.next}
          </button>
        )}
      </div>

      <Found lines={found.map((f) => ({ key: `${f.b}-${f.q}-${f.r}`, text: T.foundLine(f), fell: f.said !== f.a }))} />
    </section>
  );
}

// ───────────────────────── estimate: tens of planks, then units ─────────────────────────
const YE = 34;
const YRULER = 150;

export function Estimate({ spec, play, onDone }) {
  const T = spec.text;
  const [ri, setRi] = useState(0);
  const { a, b } = spec.rounds[ri];
  // blind (on the spec or one round): the marks show their count only; a product is written once he has pressed its mark
  const blind = Boolean(spec.rounds[ri].blind ?? spec.blind);
  const steps = estimateSteps(a, b);
  const q = Math.floor(a / b);
  const r = a % b;
  const [si, setSi] = useState(0); // steps laid
  const [stage, setStage] = useState('guess'); // guess | lay | end
  const [pick, setPick] = useState(null); // { k, kind: 'passes' | 'short' | 'ok' }
  const [guesses, setGuesses] = useState([]);
  const [shown, setShown] = useState([]); // blind: the marks of this step whose product he has revealed
  const [found, setFound] = useState([]);
  const later = useLater();
  const s = steps[Math.min(si, steps.length - 1)];
  const per = 10 ** s.place; // planks per mark
  expose({
    kind: 'estimate',
    ri,
    a,
    b,
    si,
    place: s.place,
    from: s.from,
    stage,
    pick,
    guesses: guesses.length,
    blind,
    shown,
    found,
  });

  const u = SPAN / Math.max(a, 1);
  const taken = (n) => steps.slice(0, n).reduce((t, x) => t + x.q * x.unit, 0);
  // the ruler of this step: 0 … 10 × unit. Blind, it leaves room at its right end for the flag, which then stands apart
  // (placed on the ruler, the flag would show which mark passes it: he could read it instead of estimating)
  const RW = blind ? SPAN - 120 : SPAN;
  const ru = RW / (10 * s.unit);
  const flagX = blind ? X0 + SPAN - 40 : X0 + s.from * ru;
  /** What a mark of a step says: k marks = k × 10^place planks, of length k × unit, against what was left (`from`). */
  const factOf = (st, k) => ({
    a,
    b,
    place: st.place,
    unit: st.unit,
    from: st.from,
    k,
    count: k * 10 ** st.place,
    value: k * st.unit,
    left: st.from - k * st.unit,
  });

  const choose = (k) => {
    if (stage !== 'guess') return;
    const { kind } = estimateMark(s, k);
    if (blind && !shown.includes(k)) setShown([...shown, k]);
    const list = [...guesses, { place: s.place, count: k * per, ok: kind === 'ok' }];
    setGuesses(list);
    setPick({ k, kind });
    if (kind !== 'ok') {
      play('fail');
      return;
    }
    play('sweep');
    setStage('lay');
    later(520, () => {
      play('plank', si);
      const n = si + 1;
      setSi(n);
      if (n >= steps.length) {
        play('gate');
        setStage('end');
        setFound((fs) => [...fs, { a, b, q, r, tens: Math.floor(q / 10), units: q % 10, guesses: list }]);
        return;
      }
      setPick(null);
      setShown([]);
      setStage('guess');
    });
  };
  const next = () => {
    if (ri + 1 >= spec.rounds.length) {
      onDone({ rounds: found });
      return;
    }
    setRi(ri + 1);
    setSi(0);
    setStage('guess');
    setPick(null);
    setGuesses([]);
    setShown([]);
  };
  const laidSteps = steps.slice(0, si);
  // blind: the product of the mark he just pressed, written by the world and put against what is left
  const said = blind && pick && stage === 'guess' ? estimateMark(s, pick.k) : null;
  const calc = [
    ...laidSteps.slice(-3).map((x) => `${x.from} - ${b} \\times ${x.q * 10 ** x.place} = ${x.left}`),
    said && `${b} \\times ${said.k * per} = ${said.value}`,
    said?.kind === 'passes' && `${said.value} > ${s.from}`,
    said?.kind === 'short' && `${said.value} + ${s.unit} = ${said.next} \\le ${s.from}`,
    stage === 'end' && restTex(a, b),
  ];
  const nowLeft = si ? steps[si - 1].left : a;
  const lay = (x, i) => {
    const x0 = X0 + taken(i) * u;
    const w = x.q * x.unit * u;
    const count = x.q * 10 ** x.place;
    if (!x.q) return null;
    return (
      <g key={i} className="iq-block">
        <rect
          className={`iq-plank iq-plank--drop ${i % 2 ? 'is-alt' : ''}`}
          x={x0 + 1}
          y={YE - 4}
          width={Math.max(1, w - 2)}
          height="38"
          rx="6"
        />
        {count <= 120 &&
          b * u >= 3 &&
          Array.from({ length: count - 1 }, (_, j) => (
            <line
              key={j}
              className="iq-seam"
              x1={x0 + (j + 1) * b * u}
              y1={YE}
              x2={x0 + (j + 1) * b * u}
              y2={YE + 30}
            />
          ))}
        {w >= 60 && (
          <text className="iq-plankno" x={x0 + w / 2} y={YE + 22} direction="ltr">
            {count}
          </text>
        )}
      </g>
    );
  };

  return (
    <section
      className={`iq iq--div iq--estimate ${blind ? 'is-blind' : ''}`}
      data-iq="estimate"
      data-iq-stage={stage}
      data-iq-place={s.place}
      data-iq-blind={blind ? '1' : '0'}
    >
      <Head i={ri} n={spec.rounds.length} lead={T.lead(a, b)} goal={T.goal(a, b)} />

      <svg className="iq-scene" viewBox="0 0 1000 230" role="img" aria-label={`${a} ÷ ${b}`}>
        {/* the whole gap, and the planks laid so far, by tens (hundreds) then units */}
        <rect className="iq-gapcell" x={X0} y={YE} width={SPAN} height="30" rx="4" />
        {laidSteps.map(lay)}
        {stage === 'end' && r > 0 && (
          <rect className="iq-rest" x={X0 + q * b * u} y={YE - 4} width={Math.max(2, r * u - 1.5)} height="38" rx="5" />
        )}
        {stage !== 'end' && nowLeft > 0 && (
          <text className="iq-scene__say" x={X0 + (a - nowLeft / 2) * u} y={YE + 62}>
            {T.left(nowLeft)}
          </text>
        )}

        {/* the ruler of this step: the marks of the plank × 10^place, from 0 to 10 marks; the flag is what is left */}
        {stage !== 'end' && (
          <g className="iq-ruler" data-iq-ruler={s.unit}>
            {!blind && <rect className="iq-zone" x={X0} y={YRULER - 9} width={s.from * ru} height="18" rx="6" />}
            <line className="iq-axis" x1={X0} y1={YRULER} x2={X0 + RW} y2={YRULER} />
            {Array.from({ length: 11 }, (_, k) => {
              const cls = pick?.k === k ? `is-pick is-${pick.kind}` : '';
              // blind: the product is written only under a mark he has pressed (and under 0)
              const known = !blind || k === 0 || shown.includes(k);
              return (
                <g key={k} className={`iq-mark ${cls}`} {...(blind && known && k ? { 'data-iq-shown': k * per } : {})}>
                  <line x1={X0 + k * s.unit * ru} y1={YRULER - 12} x2={X0 + k * s.unit * ru} y2={YRULER + 12} />
                  {k > 0 && (
                    <text className="iq-mark__count" x={X0 + k * s.unit * ru} y={YRULER - 20} direction="ltr">
                      {`×${k * per}`}
                    </text>
                  )}
                  {known && (
                    <text className="iq-mark__value" x={X0 + k * s.unit * ru} y={YRULER + 36} direction="ltr">
                      {k * s.unit}
                    </text>
                  )}
                </g>
              );
            })}
            <g className={`iq-flag ${blind ? 'is-apart' : ''}`} data-iq-flag={s.from}>
              <line x1={flagX} y1={YRULER} x2={flagX} y2={YRULER + 46} />
              <path d={`M ${flagX} ${YRULER + 46} l 14 6 l -14 6 z`} />
              <text x={flagX} y={YRULER + 76} direction="ltr">
                {s.from}
              </text>
            </g>
          </g>
        )}
      </svg>

      <Calc items={calc} />
      <p className="iq-fact" data-iq-fact>
        <MathText>
          {stage === 'end'
            ? T.sum({ a, b, q, r, steps })
            : pick && pick.kind === 'passes'
              ? T.passes(factOf(s, pick.k))
              : pick && pick.kind === 'short'
                ? T.short({ ...factOf(s, pick.k), next: (pick.k + 1) * s.unit })
                : si > 0
                  ? T.laid(factOf(steps[si - 1], steps[si - 1].q))
                  : ' '}
        </MathText>
      </p>

      <div className="iq-actions">
        {stage === 'guess' && (
          <>
            <p className="iq-askline">
              <MathText>{T.ask({ a, b, place: s.place, unit: s.unit, from: s.from })}</MathText>
            </p>
            <div className="iq-chips" dir="ltr">
              {Array.from({ length: 10 }, (_, k) => (
                <button
                  key={k}
                  type="button"
                  className={`iq-chip iq-chip--s ${pick?.k === k ? 'is-said' : ''}`}
                  onClick={() => choose(k)}
                  data-iq-mark={k * per}
                >
                  {k * per}
                </button>
              ))}
            </div>
          </>
        )}
        {stage === 'end' && (
          <button type="button" className="rf-btn rf-btn--main" onClick={next} data-iq-next>
            {ri + 1 >= spec.rounds.length ? T.done : T.next}
          </button>
        )}
      </div>

      <Found lines={found.map((f) => ({ key: `${f.a}-${f.b}`, text: T.foundLine(f) }))} />
    </section>
  );
}

// ───────────────────────── bracket: the gap as a flag on the line of the multiples of b ─────────────────────────
const YL = 120;

export function Bracket({ spec, play, onDone }) {
  const T = spec.text;
  const [ri, setRi] = useState(0);
  const { a, b } = spec.rounds[ri];
  const x = bracketOf(a, b);
  const [stage, setStage] = useState('guess'); // guess | where | seen
  const [loIn, setLoIn] = useState('');
  const [hiIn, setHiIn] = useState('');
  const [miss, setMiss] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [said, setSaid] = useState(null);
  const [found, setFound] = useState([]);
  expose({ kind: 'bracket', ri, a, b, lo: x.lo, exact: x.exact, stage, miss, guesses: guesses.length, said, found });

  // the line: eight steps of b around the flag, 0 at the left. Where the window starts changes with the round — the mark
  // below the flag stands 1 to 5 steps from the window's start (from a + b), so the flag is never always in the same
  // place (a % 3 had kept it still for every multiple of 3: 438, 912); the mark after it is always on the line
  const k0 = Math.max(0, x.lo - 1 - ((a + b) % 5));
  const k1 = k0 + 7;
  const left = k0 > 0 ? X0 + 80 : X0;
  const px = (v) => left + ((v / b - k0) * (X0 + SPAN - left)) / (k1 - k0);
  const known = stage !== 'guess';
  const fact = { a, b, ...x, said };

  const check = () => {
    const lo = asNumber(loIn);
    const hi = asNumber(hiIn);
    if (lo == null || hi == null || stage !== 'guess') return;
    const j = bracketSays(a, b, lo, hi);
    setGuesses((list) => [...list, { lo, hi, ok: j.ok }]);
    if (j.ok) {
      play('key');
      setMiss(null);
      setStage('where');
      return;
    }
    play('fail');
    setMiss({ a, b, lo, hi, loValue: b * lo, hiValue: b * hi, ...j });
  };
  const where = (v) => {
    if (stage !== 'where') return;
    play(v === (x.exact ? 'on' : 'between') ? 'success' : 'crumble');
    setSaid(v);
    setStage('seen');
    setFound((list) => [...list, { a, b, lo: x.lo, hi: x.hi, exact: x.exact, r: x.r, said: v, guesses }]);
  };
  const next = () => {
    if (ri + 1 >= spec.rounds.length) {
      onDone({
        rounds: found.map((f) => ({
          a: f.a,
          b: f.b,
          lo: f.lo,
          hi: f.hi,
          exact: f.exact,
          said: f.said,
          guesses: f.guesses,
        })),
      });
      return;
    }
    setRi(ri + 1);
    setStage('guess');
    setLoIn('');
    setHiIn('');
    setMiss(null);
    setGuesses([]);
    setSaid(null);
  };

  const calc = known
    ? [
        `${b} \\times ${x.lo} = ${b * x.lo} \\le ${a} < ${b * x.hi} = ${b} \\times ${x.hi}`,
        stage === 'seen' && `${a} \\div ${b} = ${quotientTex(a, b)}`,
        stage === 'seen' && restTex(a, b),
      ]
    : miss
      ? [`${b} \\times ${miss.lo} = ${miss.loValue}`, `${b} \\times ${miss.hi} = ${miss.hiValue}`]
      : [];

  return (
    <section className="iq iq--div iq--bracket" data-iq="bracket" data-iq-stage={stage}>
      <Head i={ri} n={spec.rounds.length} lead={T.lead(a, b)} goal={T.goal(a, b)} />

      <svg className="iq-scene" viewBox="0 0 1000 210" role="img" aria-label={`${a} ÷ ${b}`}>
        {known && (
          <rect
            className="iq-zone"
            x={px(b * x.lo)}
            y={YL - 9}
            width={px(b * x.hi) - px(b * x.lo)}
            height="18"
            rx="6"
          />
        )}
        <line className="iq-axis" x1={left} y1={YL} x2={X0 + SPAN} y2={YL} />
        {k0 > 0 && (
          <>
            <line className="iq-axis" x1={X0} y1={YL} x2={X0 + 30} y2={YL} />
            <text className="iq-scene__num" x={X0 + 55} y={YL + 8} direction="ltr">
              …
            </text>
            <line className="iq-tick" x1={X0} y1={YL - 12} x2={X0} y2={YL + 12} />
            <text className="iq-mark__value" x={X0} y={YL + 38} direction="ltr">
              0
            </text>
          </>
        )}
        {Array.from({ length: k1 - k0 + 1 }, (_, i) => {
          const k = k0 + i;
          const on = known && (k === x.lo || k === x.hi);
          // once he has said where the flag stands, a flag ON a mark is shown on it: that mark is ringed (a fact)
          const flagged = stage === 'seen' && x.exact && k === x.lo;
          return (
            <g
              key={k}
              className={`iq-mark ${on ? 'is-pick is-ok' : ''} ${flagged ? 'is-flagged' : ''}`}
              {...(flagged ? { 'data-iq-onmark': b * k } : {})}
            >
              <line x1={px(b * k)} y1={YL - 12} x2={px(b * k)} y2={YL + 12} />
              <text className="iq-mark__value" x={px(b * k)} y={YL + 38} direction="ltr">
                {b * k}
              </text>
              {on && (
                <text className="iq-mark__count" x={px(b * k)} y={YL + 66} direction="ltr">
                  {`${b}×${k}`}
                </text>
              )}
            </g>
          );
        })}
        <g className="iq-flag" data-iq-flag={a}>
          <line x1={px(a)} y1={YL} x2={px(a)} y2={YL - 70} />
          <path d={`M ${px(a)} ${YL - 70} l 18 8 l -18 8 z`} />
          <text x={px(a)} y={YL - 80} direction="ltr">
            {a}
          </text>
        </g>
      </svg>

      <Calc items={calc} />
      <p className="iq-fact" data-iq-fact>
        <MathText>
          {stage === 'seen' ? T.seen(fact) : stage === 'where' ? T.ok(fact) : miss ? T.miss(miss) : ' '}
        </MathText>
      </p>

      <div className="iq-actions">
        {stage === 'guess' && (
          <>
            <p className="iq-askline">
              <MathText>{T.ask({ a, b })}</MathText>
            </p>
            <div className="iq-tpl" dir="ltr">
              <MathText>{`$${b} \\times$`}</MathText>
              <Num value={loIn} onChange={setLoIn} w={3} data-iq-in="lo" onKeyDown={onEnter(check)} />
              <MathText>{`$\\le ${a} <$`}</MathText>
              <MathText>{`$${b} \\times$`}</MathText>
              <Num value={hiIn} onChange={setHiIn} w={3} data-iq-in="hi" onKeyDown={onEnter(check)} />
            </div>
            <button type="button" className="rf-btn rf-btn--main" onClick={check} data-iq-check>
              {T.check}
            </button>
          </>
        )}
        {stage === 'where' && (
          <>
            <p className="iq-askline">
              <MathText>{T.where(fact)}</MathText>
            </p>
            <button type="button" className="rf-btn" onClick={() => where('between')} data-iq-where="between">
              {T.between}
            </button>
            <button type="button" className="rf-btn" onClick={() => where('on')} data-iq-where="on">
              {T.onMark}
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
          key: `${f.a}-${f.b}`,
          text: T.foundLine(f),
          fell: f.said !== (f.exact ? 'on' : 'between'),
        }))}
      />
    </section>
  );
}
