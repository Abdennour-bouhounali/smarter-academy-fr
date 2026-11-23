/**
 * « Entraîne-toi » — the trainer that opens ON a card of the « fiche de connaissances », without leaving the page (frame: trainer.js).
 * Six questions in two looks that alternate: the GAME look (dark, gates to tap) and the EXAM look (a white sheet, the exam's
 * verbs, the answer typed in its own shape) — so the student gets used to the sheet of the real exam while still playing.
 * A wrong answer gets a hint first (what the answer gives), then the written correction.
 *
 * This screen names no lesson. It draws three shapes of question, and the lesson (`useLesson().trainer`) says which:
 *   tap   { options: [n, n, n] }                      — one sentence, gates to tap;
 *   tf    { statement, truth, reasons? }              — true / false; with `reasons` on the exam sheet;
 *   form  { tip, model?, single?, review?, lines }    — an exam answer in its own shape (see trainer.js › « a form »);
 *                                                       its tokens, a fraction and a power template among them:
 *                                                       `FormLines` below.
 */
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Star, RotateCcw, Gamepad2, FileText, ArrowRight } from 'lucide-react';
import MathText from '../../components/MathText';
import { useLesson } from './LessonContext';
import { sessionStars, SESSION } from './trainer';
import { PaperGate, PaperModel, PaperChip, PT } from './Paper';
import { twin } from './longDivision';
import { guardEvidence } from './evidence';
import { TRAINER as L, TX } from './text';

/** The statement of an exam question with its data underlined — the first gesture of the method: « Je lis et je souligne les données ». */
const Marked = ({ text }) =>
  text.includes('$') ? (
    <MathText>{text}</MathText>
  ) : (
    text.split(/(\d+)/).map((part, i) =>
      /^\d+$/.test(part) ? (
        <u key={i} dir="ltr">
          {part}
        </u>
      ) : (
        part
      ),
    )
  );

/** The value an option is known by in the page: its `id`, or its value written out. */
const idOf = (option) => option.id ?? String(option.value);
const Num = ({ value, onChange, w = 3, ...rest }) => (
  <input
    className="di-num di-num--tr"
    dir="ltr"
    inputMode="numeric"
    pattern="[0-9]*"
    value={value}
    style={{ width: `${w + 1.4}ch` }}
    onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, '').slice(0, w + 1))}
    {...rest}
  />
);

export default function Trainer({ nodeId, best = 0, onDone, onPaper, onEvidence }) {
  const { makeSession, check, solution, answerLabel, evidenceOf } = useLesson().trainer;
  const [run, setRun] = useState(0);
  const qs = useMemo(() => makeSession(Math.random, nodeId), [nodeId, run]);
  const [i, setI] = useState(0);
  const [tries, setTries] = useState(0);
  const [fb, setFb] = useState(null);
  const [done, setDone] = useState(null);
  const first = useRef(0);
  const marks = useRef([]);
  const [model, setModel] = useState(null);
  const helped = useRef(false); // a model sheet was opened on this question: its answer is no longer evidence
  const log = useRef([]);
  const [rev, setRev] = useState(null); // what was answered, and the earlier question being read again
  const q = qs[i];
  // the exam format is answered in PAPER MODE: the music stops for it and comes back with the next game question
  const paper = q.format === 'exam' && !done;
  useEffect(() => {
    onPaper?.(paper);
    return () => onPaper?.(false);
  }, [paper]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    setI(0);
    setTries(0);
    setFb(null);
    setDone(null);
    setRev(null);
    first.current = 0;
    marks.current = [];
    log.current = [];
  }, [qs]);
  useEffect(() => {
    if (import.meta.env.DEV) window.__trainer = { q, solution: solution(q), index: i };
  }, [q, i]);
  const submit = (value) => {
    if (fb?.final) return;
    const res = check(q, value);
    // the learning points: only the FIRST try of an exam-format question, with no help opened before (evidence.js) — right or wrong
    // …and never a TRUE claim for an answer the lesson's check says is wrong (the kit's safety net, evidence.js)
    onEvidence?.(guardEvidence(evidenceOf(q, value, { firstTry: tries === 0, helped: helped.current }), res.ok));
    const rec = log.current[i] ?? (log.current[i] = { attempts: [], fix: res.fix, tip: null });
    rec.attempts.push({ label: answerLabel(q, value), ok: res.ok });
    rec.tip = res.tip ?? null;
    // the shortcut « Astuce » comes only with the FINAL feedback: before it, it would give the result away
    if (res.ok) {
      if (tries === 0) first.current += 1;
      marks.current[i] = tries === 0 ? 'ok' : 'late';
      setFb({ ok: true, text: res.fix, tip: res.tip, final: true });
    } else if (tries === 0) {
      setTries(1);
      setFb({ ok: false, text: res.hint, final: false });
    } else {
      marks.current[i] = 'ko';
      setFb({ ok: false, text: res.fix, tip: res.tip, final: true });
    }
  };
  const next = () => {
    if (i + 1 >= qs.length) {
      const stars = sessionStars(first.current);
      setDone({ stars, first: first.current });
      onDone?.(stars);
      return;
    }
    setI(i + 1);
    setTries(0);
    setFb(null);
    setRev(null);
    helped.current = false;
  };

  if (done) {
    return (
      <div className="di-trainer di-trainer--done" data-di-trainer="done" data-di-tr-stars={done.stars}>
        <h4>{L.done[done.stars]}</h4>
        <div className="di-stars3 di-trainer__stars" dir="ltr">
          {[1, 2, 3].map((n) => (
            <Star key={n} size={44} className={n <= done.stars ? 'is-on' : ''} />
          ))}
        </div>
        <p>
          <b dir="ltr">
            {done.first}
            {'\u00a0/\u00a0'}
            {qs.length}
          </b>{' '}
          {L.first}
        </p>
        <button type="button" className="di-btn di-btn--primary" onClick={() => setRun((n) => n + 1)} data-di-tr-again>
          <RotateCcw size={16} /> {L.again}
        </button>
      </div>
    );
  }

  return (
    <div className={`di-trainer di-trainer--${q.format}`} data-di-trainer={q.format} data-di-tr-kind={q.kind}>
      <div className="di-trainer__bar">
        <span className={`di-trainer__badge is-${q.format}`}>
          {q.format === 'game' ? <Gamepad2 size={15} /> : <FileText size={15} />} {L[q.format]}
        </span>
        <span className="di-trainer__dots" dir="ltr" title={L.seeOld}>
          {SESSION.map((f, k) => (
            <button
              key={k}
              type="button"
              disabled={k > i || (k === i && rev === null)}
              onClick={() => setRev(k === i ? null : k)}
              className={`is-${f} ${k === i ? 'is-now' : ''} ${k === rev ? 'is-rev' : ''} ${marks.current[k] ? `is-${marks.current[k]}` : ''}`}
              aria-label={`${L.question(k + 1)}`}
              data-di-tr-dot={k}
            />
          ))}
        </span>
        {best > 0 && (
          <span className="di-trainer__best" title={L.best}>
            <Star size={13} className="di-ic-star" /> <b dir="ltr">{best}</b>
          </span>
        )}
      </div>
      {rev !== null && log.current[rev] && (
        <div className={`di-review ${qs[rev].format === 'exam' ? 'di-review--exam' : ''}`} data-di-tr-review={rev}>
          <p className="di-review__head">
            <b>
              {L.review} · {L.question(rev + 1)}
            </b>{' '}
            <span>{L[qs[rev].format]}</span>
          </p>
          <p className="di-review__q">
            <MathText>{qs[rev].kind === 'tf' ? `« ${qs[rev].statement} »` : qs[rev].prompt}</MathText>
            {qs[rev].kind === 'tap' && <span dir="ltr"> — {qs[rev].options.join(' · ')}</span>}
            {qs[rev].form?.review && <span dir="ltr"> {qs[rev].form.review}</span>}
          </p>
          {log.current[rev].attempts.map((at, k) => (
            <p key={k} className={`di-review__a ${at.ok ? 'is-ok' : 'is-ko'}`}>
              <b>{at.ok ? '✓' : '✗'}</b> <small>{L.mine}</small> <MathText>{at.label}</MathText>
            </p>
          ))}
          <p className="di-review__fix">
            <b>{L.fix}</b> <MathText>{log.current[rev].fix}</MathText>
          </p>
          {log.current[rev].tip && (
            <p className="di-tip">
              <b>💡 {TX.tip}</b> <MathText>{log.current[rev].tip}</MathText>
            </p>
          )}
          <button type="button" className="di-btn di-btn--primary" onClick={() => setRev(null)} data-di-tr-back>
            {L.backNow}
          </button>
        </div>
      )}
      <div hidden={rev !== null} className="di-trainer__live">
        {paper && !fb?.final && <PaperChip />}
        {/* once the answer is final, the sheet gives way to ONE line — the question and what was answered — so the correction has the room */}
        {fb?.final && q.format === 'exam' ? (
          <div className="di-sheet di-sheet--done" data-di-tr-recap>
            <p className="di-sheet__q">
              <b>{L.question(i + 1)}</b> <MathText>{q.kind === 'tf' ? `« ${q.statement} »` : q.prompt}</MathText>
            </p>
            <p className="di-sheet__mine">
              <small>{L.mine}</small> <MathText>{log.current[i]?.attempts.at(-1)?.label ?? ''}</MathText>
            </p>
          </div>
        ) : (
          <Question
            key={`${run}-${i}`}
            q={q}
            index={i}
            locked={Boolean(fb?.final)}
            onSubmit={submit}
            onModel={() => {
              helped.current = true;
              setModel({ ...twin(q.form.model.a, q.form.model.b), own: false });
            }}
          />
        )}
        {fb && (
          <p
            className={`di-trainer__fb ${fb.ok ? 'is-ok' : fb.final ? 'is-fix' : 'is-hint'}`}
            data-di-tr-fb={fb.ok ? 'ok' : fb.final ? 'fix' : 'hint'}
          >
            <b>{fb.ok ? L.right : fb.final ? L.fix : L.hint}</b> <MathText>{fb.text}</MathText>
          </p>
        )}
        {fb?.final && fb.tip && (
          <p className="di-tip" data-di-tip>
            <b>💡 {TX.tip}</b> <MathText>{fb.tip}</MathText>
          </p>
        )}
        {model && <PaperModel a={model.a} b={model.b} own={model.own} onClose={() => setModel(null)} />}
        {fb?.final && (
          <div className="di-trainer__end">
            <button
              type="button"
              className="di-btn di-btn--primary di-trainer__next"
              onClick={next}
              data-di-tr-next
              autoFocus
            >
              {i + 1 >= qs.length ? L.finish : L.next} <ArrowRight size={16} />
            </button>
            {!fb.ok && q.form?.model && (
              <button
                type="button"
                className="di-link"
                onClick={() => setModel({ ...q.form.model, own: true })}
                data-di-tr-model
              >
                {PT.readFix}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/** A token of a form line that is answered: a box `{ num }` or a choice `{ choice }`. */
const isBox = (t) => Boolean(t && typeof t === 'object' && (t.num || t.choice));
/** A fraction template `{ frac: { n, d } }`. */
const isFrac = (t) => Boolean(t && typeof t === 'object' && t.frac && typeof t.frac === 'object');
/** A power template `{ pow: { base, exp } }`. */
const isPow = (t) => Boolean(t && typeof t === 'object' && t.pow && typeof t.pow === 'object');
/** The answer boxes a token holds: itself, the boxes of a fraction or a power template (in reading order), or none. */
const boxesOf = (t) =>
  isFrac(t)
    ? [t.frac.n, t.frac.d].filter(isBox)
    : isPow(t)
      ? [t.pow.base, t.pow.exp].filter(isBox)
      : isBox(t)
        ? [t]
        : [];

/**
 * The lines of an exam FORM, in their own shape (the lesson describes them — kit/trainer.js › « a form »). A token is:
 *   'text'                       a sign or words (on an `ltr` line: a sign of the formula);
 *   { strong } · { text }        a printed number · a printed piece (a legacy `rtl` flag is ignored);
 *   { num, label }               a box to type a whole number in (`data-di-tr=<num>`);
 *   { choice, options }          a list to choose from (`data-di-tr=<choice>`);
 *   { frac: { n, d } }           a FRACTION in its own shape: n stacked over a real bar over d, each a box `{ num, label }`
 *                                (typed — the same hook `data-di-tr=<num>`, numerator first in the keyboard order) or a
 *                                printed number / string (a fraction GIVEN by the statement). It is one answer in its
 *                                shape: on a line it counts as ONE (describeTrainer, defects.md B17).
 *   { pow: { base, exp } }       a POWER in its own shape: the base, then the exponent RAISED after it (a `sup`), each a
 *                                box `{ num, label, w? }` or a printed number / string — the forge's token
 *                                (`authoring/forgeBlocks.js › powerBox / givenPower`), drawn as the forge draws it
 *                                (`RuleForge.jsx › UseLines`: `span.rf-pow > span.rf-pow__base + sup.rf-pow__exp`) with the
 *                                trainer's own classes of the same look (`di-pow`, styles/trainer.css), `dir="ltr"`,
 *                                `data-di-pow="base^exp"` (a box by its name). ONE answer of its line, as a fraction is.
 * A box may carry `w` (the digits it takes, 3 by default) — an exponent's box takes `w: 1` or `2`.
 */
export function FormLines({ lines, v, set, locked }) {
  const box = (t, key) => (
    <Num
      key={key}
      value={v[t.num] ?? ''}
      onChange={set(t.num)}
      {...(t.w ? { w: t.w } : {})}
      disabled={locked}
      aria-label={t.label}
      data-di-tr={t.num}
    />
  );
  const part = (x, key) => (isBox(x) ? box(x, key) : <b key={key}>{x}</b>);
  const token = (t, i, ltr) => {
    if (typeof t === 'string') return ltr ? <span key={i}>{t}</span> : <Fragment key={i}>{t} </Fragment>;
    if (isFrac(t)) {
      const typed = isBox(t.frac.n) || isBox(t.frac.d);
      const el = (
        <span key={i} className={`di-frac${typed ? ' di-frac--typed' : ''}`} dir="ltr" data-di-frac>
          {part(t.frac.n, 'n')}
          <span className="di-frac__bar" aria-hidden="true" />
          {part(t.frac.d, 'd')}
        </span>
      );
      return ltr ? el : <Fragment key={i}>{el} </Fragment>;
    }
    if (isPow(t)) {
      const { base, exp } = t.pow;
      const el = (
        <span
          key={i}
          className={`di-pow${isBox(base) || isBox(exp) ? ' di-pow--typed' : ''}`}
          dir="ltr"
          data-di-pow={[base, exp].map((x) => (isBox(x) ? x.num : x)).join('^')}
        >
          <span className="di-pow__base">{part(base, 'b')}</span>
          <sup className="di-pow__exp">{part(exp, 'e')}</sup>
        </span>
      );
      return ltr ? el : <Fragment key={i}>{el} </Fragment>;
    }
    if (t.strong != null)
      return (
        <b key={i} dir="ltr">
          {t.strong}
        </b>
      );
    if (t.text != null) return <span key={i}>{t.text}</span>;
    if (t.num) return box(t, i);
    const chosen = t.options.find((o) => o.value === v[t.choice]);
    return (
      <select
        key={i}
        value={chosen ? idOf(chosen) : ''}
        onChange={(e) => set(t.choice)(t.options.find((o) => idOf(o) === e.target.value)?.value ?? null)}
        disabled={locked}
        data-di-tr={t.choice}
      >
        <option value="">{L.pick}</option>
        {t.options.map((o) => (
          <option key={idOf(o)} value={idOf(o)}>
            {o.text}
          </option>
        ))}
      </select>
    );
  };
  return lines.map((line, k) => (
    <div key={k} className="di-sheet__line" dir={line.ltr ? 'ltr' : undefined}>
      {line.tokens.map((t, i) => token(t, i, line.ltr))}
    </div>
  ));
}

/** One question, drawn in the look of its format. Every exam question is a <form>: Enter checks, as on any answer sheet. */
/** A gate of a tap: a fraction « p/q » stacked over a real bar (the sheet's `di-frac`), never « p/q » as text. */
export function TapOption({ n }) {
  const m = /^(-?\d+)\/(\d+)$/.exec(String(n));
  if (!m) return n;
  return (
    <span className="di-frac" dir="ltr" data-di-frac>
      <b>{m[1]}</b>
      <span className="di-frac__bar" aria-hidden="true" />
      <b>{m[2]}</b>
    </span>
  );
}

function Question({ q, index, locked, onSubmit, onModel }) {
  const [v, setV] = useState({});
  const set = (k) => (x) => setV((o) => ({ ...o, [k]: x }));
  const exam = q.format === 'exam';
  const head = exam ? (
    <p className="di-sheet__q">
      <b>{L.question(index + 1)}</b> <Marked text={q.prompt} />
    </p>
  ) : null;
  const send = (e) => {
    e.preventDefault();
    onSubmit(v);
  };
  const checkBtn = (ready) => (
    <button type="submit" className="di-btn di-sheet__check" disabled={!ready || locked} data-di-tr-check>
      {L.check}
    </button>
  );

  if (q.kind === 'tap') {
    return (
      <div className="di-tap">
        <p className="di-tap__say">
          <MathText>{q.prompt}</MathText>
        </p>
        <div className="di-tap__gates" dir="ltr">
          {q.options.map((n) => (
            <button key={n} type="button" disabled={locked} onClick={() => onSubmit(n)} data-di-tr-opt={n}>
              <TapOption n={n} />
            </button>
          ))}
        </div>
      </div>
    );
  }
  if (q.kind === 'tf') {
    const tf = (
      <div className="di-tf">
        {[true, false].map((t) => (
          <button
            key={String(t)}
            type="button"
            disabled={locked}
            className={v.truth === t ? 'is-on' : ''}
            onClick={() => (exam ? set('truth')(t) : onSubmit({ truth: t }))}
            data-di-tr-tf={String(t)}
          >
            {t ? L.true : L.false}
          </button>
        ))}
      </div>
    );
    if (!exam)
      return (
        <div className="di-tap">
          <p className="di-tap__say di-tap__say--quote">
            <MathText>{`« ${q.statement} »`}</MathText>
          </p>
          {tf}
        </div>
      );
    return (
      <form className="di-sheet" onSubmit={send}>
        <p className="di-sheet__q">
          <b>{L.question(index + 1)}</b> {L.tfAsk}
        </p>
        <p className="di-sheet__statement">
          <MathText>{`« ${q.statement} »`}</MathText>
        </p>
        <PaperGate tip={PT.tipWrite}>
          {tf}
          <div className="di-sheet__reasons">
            <small>{L.why}</small>
            {q.reasons.map((r, k) => (
              <button
                key={r.t}
                type="button"
                disabled={locked}
                className={v.reason === k ? 'is-on' : ''}
                onClick={() => set('reason')(k)}
                data-di-tr-reason={k}
              >
                <MathText>{r.t}</MathText>
              </button>
            ))}
          </div>
          {checkBtn(v.truth != null && v.reason != null)}
        </PaperGate>
      </form>
    );
  }
  // every other exam question is a FORM the lesson describes: lines of signs, boxes, choices and fractions
  const { form } = q;
  const slots = form.lines.flatMap((line) => line.tokens.flatMap(boxesOf));
  const ready = slots.every((t) => (t.num ? (v[t.num] ?? '') !== '' : v[t.choice] != null));
  return (
    <form
      className="di-sheet"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form.single ? v[form.single] : v);
      }}
    >
      {head}
      <PaperGate tip={PT[form.tip]} onModel={form.model ? onModel : undefined}>
        <FormLines lines={form.lines} v={v} set={set} locked={locked} />
        {checkBtn(ready)}
      </PaperGate>
    </form>
  );
}
