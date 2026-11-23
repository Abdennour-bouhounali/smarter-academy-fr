/**
 * Two INVESTIGATIONS of a rule forge in this world where gaps are PUT TOGETHER (see `Inquiry.jsx`, which mounts them;
 * logic: `inquiry.js`):
 *
 *   join   « a plank of two gaps, on the gap they make » — two bridges are drawn with plank d (filled, or a piece left);
 *          the student says whether d will still fill the gap made by GLUING them (a + b) or by CUTTING the shorter off
 *          the longer (a − b); then the strips slide together, the planks are laid again, and the calculation is written.
 *   stack  « a plank of one gap, on its copies » — k copies of one gap glued end to end (2 and 3 drawn, 10 packed, 100
 *          only on a number line); he says whether d fills them BEFORE the world lays the planks.
 *
 * `spec.text` is the lesson's wording. Nothing here states a rule: every sentence says what the strips just did.
 */
import { useState } from 'react';
import { texFr } from '@smarter-academy/core';
import MathText from '../../components/MathText';
import { joinOf, stackOf } from './inquiry';
import { FAST, expose, X0, SPAN, useLater, YesNo } from './inquiryParts';

/** The division of a gap by the plank as it is written: n = q × d + r — the rest green when it is 0, amber otherwise. */
export const restTex = (n, d) => {
  const r = n % d;
  return `${texFr(n)} = ${texFr(d)} \\times ${texFr(Math.floor(n / d))} + \\textcolor{${r ? '#fbbf24' : '#8dffb0'}}{${texFr(r)}}`;
};

/**
 * The calculations of a step, read left to right, one formula per item (a formula never breaks). Two items may be the same
 * formula (a = b, b | a…): they are keyed by their place, never by their text.
 */
export function Calc({ items }) {
  return (
    <div className="iq-calc" dir="ltr" data-iq-calc>
      {items.filter(Boolean).map((tex, i) => (
        // eslint-disable-next-line react/no-array-index-key -- the list is rebuilt whole each render; equal lines are legal
        <MathText key={i}>{`$${tex}$`}</MathText>
      ))}
    </div>
  );
}

/**
 * A gap of `n` cells drawn from x (cell width u), with planks of `d` laid on it one after another and the cells no plank
 * covers outlined in amber: the piece left. `laid = false` draws the empty gap.
 */
export function Span({ n, d, u, x = X0, y, h = 30, laid = true, fast = false }) {
  const whole = laid && d ? Math.floor(n / d) : 0;
  const rest = laid && d ? n - whole * d : 0;
  const beat = fast ? 4 : Math.min(90, 900 / Math.max(1, whole));
  return (
    <g className="iq-span">
      {u >= 6 ? (
        Array.from({ length: n }, (_, i) => (
          <rect key={i} className="iq-gapcell" x={x + i * u} y={y} width={u - 1.5} height={h} rx="3" />
        ))
      ) : (
        <rect className="iq-gapcell" x={x} y={y} width={n * u} height={h} rx="4" />
      )}
      {d * u >= 3 &&
        Array.from({ length: whole }, (_, k) => (
          <rect
            key={`p${k}`}
            className={`iq-plank iq-plank--drop ${k % 2 ? 'is-alt' : ''}`}
            x={x + k * d * u + 1}
            y={y - 4}
            width={Math.max(1, d * u - 2)}
            height={h + 8}
            rx={Math.min(6, (d * u) / 3)}
            style={{ animationDelay: `${k * beat}ms` }}
          />
        ))}
      {rest > 0 && (
        <rect
          className="iq-rest"
          x={x + whole * d * u}
          y={y - 4}
          width={Math.max(1, rest * u - 1.5)}
          height={h + 8}
          rx="5"
          style={{ animationDelay: `${whole * beat}ms` }}
        />
      )}
    </g>
  );
}

/** How long the planks of a gap take to be laid (the same rhythm as `Span`). */
const layTime = (planks) => (FAST() ? 20 : Math.min(900, planks * 90) + 350);

// ───────────────────────── join ─────────────────────────
const YA = 44;
const YB = 156;

export function Join({ spec, play, onDone }) {
  const T = spec.text;
  const [ri, setRi] = useState(0);
  const round = spec.rounds[ri];
  const d = round.d ?? spec.d;
  const { op, a, b } = round;
  const j = joinOf(d, a, b, op);
  const [stage, setStage] = useState('guess'); // guess | glue | seen
  const [step, setStep] = useState(0); // 0 two bridges · 1 the strips move · 2 one gap, the planks laid again
  const [guess, setGuess] = useState(null);
  const [found, setFound] = useState([]);
  const later = useLater();
  const fact = { op, a, b, d, ...j };
  expose({ kind: 'join', ri, d, op, a, b, stage, step, guess, value: j.value, holds: j.holds, found });

  const u = SPAN / (op === 'sum' ? a + b : a);
  const say = (v) => {
    if (stage !== 'guess') return;
    play('pick');
    setGuess(v);
    setStage('glue');
    later(120, () => {
      play('sweep');
      setStep(1);
    });
    later(1000, () => {
      play(op === 'sum' ? 'plank' : 'hit');
      setStep(2);
    });
    later(1000 + layTime(j.planks), () => {
      play(j.holds ? 'success' : 'crumble');
      setStage('seen');
      setFound((list) => [...list, { ...fact, guess: v }]);
    });
  };
  const next = () => {
    if (ri + 1 >= spec.rounds.length) {
      onDone({ rounds: found.map((f) => ({ op: f.op, a: f.a, b: f.b, d: f.d, guess: f.guess, holds: f.holds })) });
      return;
    }
    setRi(ri + 1);
    setStep(0);
    setGuess(null);
    setStage('guess');
  };
  // where the second strip goes: after the first (glued), or over the end of the first (the part that is cut off)
  const moved = op === 'sum' ? `translate(${a * u}px, ${YA - YB}px)` : `translate(${(a - b) * u}px, ${YA - YB}px)`;
  const sign = op === 'sum' ? '+' : '-';

  return (
    <section className="iq iq--join" data-iq="join" data-iq-stage={stage} data-iq-step={step} data-iq-op={op}>
      <div className="iq-lead">
        <span className="iq-count">
          {ri + 1}&nbsp;/&nbsp;{spec.rounds.length}
        </span>
        <p>
          <MathText>{T.lead(d)}</MathText>
        </p>
      </div>
      <p className="iq-goal" data-iq-goal>
        <span aria-hidden="true">🎯</span>
        {T.goal(d)}
      </p>

      <svg className="iq-scene" viewBox="0 0 1000 250" role="img" aria-label={`${a} ${sign} ${b}`}>
        {step < 2 && (
          <>
            <Span n={a} d={d} u={u} y={YA} laid={step === 0} fast={FAST()} />
            <g
              className={`iq-mover ${op === 'diff' && step === 1 ? 'is-cutter' : ''}`}
              style={{ transform: step ? moved : 'none' }}
            >
              <Span n={b} d={d} u={u} y={YB} laid={step === 0} fast={FAST()} />
            </g>
            {step === 0 && (
              <>
                <text className="iq-scene__say" x={X0 + (a * u) / 2} y={YA + 66}>
                  {T.label(a, d, { planks: j.planksA, rest: a % d })}
                </text>
                <text className="iq-scene__say" x={X0 + (b * u) / 2} y={YB + 66}>
                  {T.label(b, d, { planks: j.planksB, rest: b % d })}
                </text>
              </>
            )}
          </>
        )}
        {step === 2 && (
          <>
            <Span n={j.value} d={d} u={u} y={YA} fast={FAST()} />
            {op === 'diff' && (
              <rect className="iq-cutoff" x={X0 + j.value * u} y={YA} width={b * u - 1.5} height="30" rx="4" />
            )}
            {stage === 'seen' && (
              <text className="iq-scene__say" x={X0 + (Math.max(j.value, 1) * u) / 2} y={YA + 66}>
                {T.label(j.value, d, { planks: j.planks, rest: j.rest })}
              </text>
            )}
          </>
        )}
      </svg>

      <Calc
        items={
          stage === 'seen' ? [`${a} ${sign} ${b} = ${j.value}`, restTex(j.value, d)] : [restTex(a, d), restTex(b, d)]
        }
      />

      <p className="iq-fact" data-iq-fact>
        <MathText>
          {stage === 'seen'
            ? T.seen(fact, guess)
            : T.ask({ op, a, b, d, fillsA: j.fillsA, fillsB: j.fillsB, planksA: j.planksA, planksB: j.planksB })}
        </MathText>
      </p>

      <div className="iq-actions">
        {stage === 'guess' && <YesNo T={T} onSay={say} />}
        {stage === 'seen' && (
          <button type="button" className="rf-btn rf-btn--main" onClick={next} data-iq-next>
            {ri + 1 >= spec.rounds.length ? T.done : T.next}
          </button>
        )}
      </div>

      {found.length > 0 && (
        <ul className="iq-found" data-iq-found>
          {found.map((f) => (
            <li key={`${f.op}-${f.a}-${f.b}-${f.d}`} className={f.holds ? '' : 'is-fell'}>
              <MathText>{T.foundLine(f)}</MathText>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ───────────────────────── stack ─────────────────────────
/** How k copies are shown: drawn (2, 3), packed (up to 12), or only on a number line (more). */
const modeOf = (k) => (k <= 3 ? 'full' : k <= 12 ? 'packed' : 'line');
const YS = 150;

export function Stack({ spec, play, onDone }) {
  const T = spec.text;
  // the rounds: the main gap, then (optional) a gap the plank does NOT fill — every k of each is one ask
  const asks = [{ d: spec.d, base: spec.base, times: spec.times }, ...[].concat(spec.free ?? [])].flatMap((r) =>
    r.times.map((k) => ({ d: r.d, base: r.base, k })),
  );
  const [ai, setAi] = useState(0);
  const { d, base, k } = asks[ai];
  const s = stackOf(d, base, k);
  const mode = modeOf(k);
  const [stage, setStage] = useState('guess'); // guess | stack | seen
  const [shown, setShown] = useState(0); // copies glued so far
  const [laid, setLaid] = useState(false);
  const [guess, setGuess] = useState(null);
  const [found, setFound] = useState([]);
  const later = useLater();
  const fact = { d, base, k, ...s };
  expose({ kind: 'stack', ai, d, base, k, mode, stage, shown, laid, guess, holds: s.holds, found });

  const uB = SPAN / (3 * base); // the gap itself, at the scale of three copies
  const u = mode === 'full' ? uB : SPAN / s.total;
  const say = (v) => {
    if (stage !== 'guess') return;
    play('pick');
    setGuess(v);
    setStage('stack');
    const beat = mode === 'full' ? 520 : mode === 'packed' ? 140 : 0;
    const copies = mode === 'line' ? 0 : k;
    for (let i = 1; i <= copies; i += 1)
      later(i * beat, () => {
        play(mode === 'full' ? 'plank' : 'sweep', i);
        setShown(i);
      });
    const glued = copies * beat + 250;
    later(glued, () => {
      setShown(k);
      setLaid(true);
      if (mode !== 'line') play('plank');
    });
    later(glued + (mode === 'line' ? 300 : layTime(Math.min(s.planks, 30))), () => {
      play(s.holds ? 'success' : 'crumble');
      setStage('seen');
      setFound((list) => [...list, { ...fact, guess: v }]);
    });
  };
  const next = () => {
    if (ai + 1 >= asks.length) {
      onDone({ rounds: found.map((f) => ({ d: f.d, base: f.base, k: f.k, guess: f.guess, holds: f.holds })) });
      return;
    }
    setAi(ai + 1);
    setShown(0);
    setLaid(false);
    setGuess(null);
    setStage('guess');
  };

  const planksTex = s.fillsBase ? `${k} \\times ${base / d} = ${s.planks}` : null;
  return (
    <section className="iq iq--stack" data-iq="stack" data-iq-stage={stage} data-iq-k={k} data-iq-mode={mode}>
      <div className="iq-lead">
        <span className="iq-count">
          {ai + 1}&nbsp;/&nbsp;{asks.length}
        </span>
        <p>
          <MathText>{T.lead(d, base)}</MathText>
        </p>
      </div>
      <p className="iq-goal" data-iq-goal>
        <span aria-hidden="true">🎯</span>
        {T.goal(d)}
      </p>

      <svg className="iq-scene" viewBox="0 0 1000 250" role="img" aria-label={`${k} × ${base}`}>
        {/* the gap itself, with the plank on it: the fact the prediction starts from */}
        <Span n={base} d={d} u={uB} y={36} fast={FAST()} />
        <text className="iq-scene__say" x={X0 + (base * uB) / 2} y={100}>
          {T.label(base, d, { planks: Math.floor(base / d), rest: base % d })}
        </text>

        {mode !== 'line' &&
          Array.from({ length: laid ? 0 : shown }, (_, i) => (
            <g
              key={i}
              className="iq-copy"
              style={{ '--dx': `${-i * base * u}px`, '--dy': `${36 - YS}px` }}
              data-iq-copy={i}
            >
              <Span n={base} d={d} u={u} x={X0 + i * base * u} y={YS} laid={false} />
            </g>
          ))}
        {mode !== 'line' && laid && (
          <>
            <Span n={s.total} d={d} u={u} y={YS} fast={FAST()} />
            {Array.from({ length: k - 1 }, (_, i) => (
              <line
                key={i}
                className="iq-seam"
                x1={X0 + (i + 1) * base * u}
                y1={YS - 10}
                x2={X0 + (i + 1) * base * u}
                y2={YS + 40}
              />
            ))}
          </>
        )}
        {mode === 'line' && stage !== 'guess' && (
          <g className="iq-numline" data-iq-numline>
            <line className="iq-axis" x1={X0} y1={YS + 16} x2={X0 + SPAN} y2={YS + 16} />
            {Array.from({ length: Math.min(k, 100) + 1 }, (_, i) => (
              <line
                key={i}
                className="iq-tick"
                x1={X0 + (i * SPAN) / Math.min(k, 100)}
                y1={YS + 8}
                x2={X0 + (i * SPAN) / Math.min(k, 100)}
                y2={YS + 24}
              />
            ))}
            <text className="iq-scene__num" x={X0} y={YS + 52} direction="ltr">
              0
            </text>
            <text className="iq-scene__num" x={X0 + SPAN} y={YS + 52} direction="ltr">
              {s.total}
            </text>
            <text className="iq-scene__big" x={X0 + SPAN / 2} y={YS - 10} direction="ltr">
              {`${k} × ${base}`}
            </text>
          </g>
        )}
        {stage === 'seen' && mode !== 'line' && (
          <text className="iq-scene__say" x={500} y={YS + 74}>
            {T.label(s.total, d, { planks: s.planks, rest: s.rest })}
          </text>
        )}
      </svg>

      <Calc
        items={
          stage === 'seen' ? [`${k} \\times ${base} = ${s.total}`, restTex(s.total, d), planksTex] : [restTex(base, d)]
        }
      />

      <p className="iq-fact" data-iq-fact>
        <MathText>{stage === 'seen' ? T.seen(fact, guess) : T.ask({ d, base, k, fillsBase: s.fillsBase })}</MathText>
      </p>

      <div className="iq-actions">
        {stage === 'guess' && <YesNo T={T} onSay={say} />}
        {stage === 'seen' && (
          <button type="button" className="rf-btn rf-btn--main" onClick={next} data-iq-next>
            {ai + 1 >= asks.length ? T.done : T.next}
          </button>
        )}
      </div>

      {found.length > 0 && (
        <ul className="iq-found" data-iq-found>
          {found.map((f) => (
            <li key={`${f.d}-${f.base}-${f.k}`} className={f.holds ? '' : 'is-fell'}>
              <MathText>{T.foundLine(f)}</MathText>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
