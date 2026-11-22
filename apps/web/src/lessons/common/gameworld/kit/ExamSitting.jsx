/**
 * « brevet blanc » — the exam SITTING (prototype, 2026-11-16; logic: sitting.js). The opposite of the game on purpose:
 * one sheet of paper, three colours (black for the subject, blue for what the student writes, red for the corrector — never
 * before the copy comes back), silence, no stars. Three screens:
 *   read  the whole subject; numbers and words are underlined by a tap; no answer box exists yet;
 *   sit   the subject on one side, the answer sheet on the other; NO verdict; a quiet pace line; one notice at the last minute;
 *         an exercise left completely EMPTY is shown once before the hand-in is accepted (a forgotten page is not a choice);
 *   « Quitter » (read and sit): leaves after ONE confirmation — nothing is marked, nothing is sent, the ladder does not move;
 *   back  the copy handed back: red marks, the total, then — question by question — the scheme to tick against the paper and
 *         the two helps: « Guide-moi » (the bank's hints — never the answer) or « Explique-moi » (the bank's model solution).
 * The subject is drawn from the lesson's EXERCISE BANK, as it is (bankSitting.js): each step is answered in the widget the
 * practice space draws for its `answerType` — a choice (ChoiceInput), a number in its own shape (TemplateInput, the
 * answer-template standard), a set of integers (IntegerSetInput); a « Montrer que » step is written on the paper only.
 * The bank loads when the sitting opens (a few small files, once); until then the sheet waits.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Flag, Clock, PenLine, VolumeX, X, Compass, BookOpenCheck, NotebookPen, LogOut } from 'lucide-react';
import MathText from '../../components/MathText';
import ProblemTable from '../../components/ProblemTable';
import ChoiceInput from '../../../../features/practice/inputs/ChoiceInput';
import IntegerSetInput from '../../../../features/practice/inputs/IntegerSetInput';
import TemplateInput from '../../../../features/practice/answerTemplates/TemplateInput';
import { templateFor } from '../../../../features/practice/answerTemplates/templateFor';
import Fit from './Fit';
import Leaves from './ExamSittingLeaves';
import { useLesson } from './LessonContext';
import { keysOfPoints } from './bankSitting';
import { allQuestions, answered, forgotten, pace, appreciation, tick, timeUp } from './sitting';
import { EXAM as L } from './text';

/** No text of the sitting is drawn under 12 px, however far a sheet is zoomed down to fit (Fit.jsx › floor). */
const FLOOR = 12;
const FAST = () => import.meta.env.DEV && typeof window !== 'undefined' && window.__paperFast;
const clock = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
const fmt = (n) => String(n).replace('.', ',');

/** A text of the subject: maths stays maths; in the plain parts every number and word can be underlined by a tap. */
function Markable({ text, id, marks, toggle }) {
  return text.split(/(\$[^$]+\$)/).map((part, i) =>
    part.startsWith('$') ? (
      <MathText key={i}>{part}</MathText>
    ) : (
      part.split(/(\s+)/).map((w, k) =>
        w.trim() === '' ? (
          w
        ) : (
          <span
            key={`${i}-${k}`}
            role="button"
            tabIndex={-1}
            className={`xs-word ${marks.has(`${id}:${i}:${k}`) ? 'is-marked' : ''}`}
            onClick={() => toggle(`${id}:${i}:${k}`)}
          >
            {w}
          </span>
        ),
      )
    ),
  );
}

/** The statement of a sheet: its sentences (each word can be underlined), its formulas, its table — the bank's own. */
function Statement({ e, marks, toggle }) {
  return (
    <>
      {e.statement.split('\n\n').map((p, i) => (
        <p key={i} className="xs-statement">
          <Markable text={p} id={`${e.id}:${i}`} marks={marks} toggle={toggle} />
        </p>
      ))}
      {e.formulas.length > 0 && (
        <p className="xs-formulas" dir="ltr">
          {e.formulas.map((f) => (
            <MathText key={f}>{`$${f}$`}</MathText>
          ))}
        </p>
      )}
      {e.table && <ProblemTable {...e.table} />}
    </>
  );
}

/** The number of a step as the exam paper writes it: « 2) », « 2) a) ». */
const Num = ({ q }) => (
  <b className="xs-n">
    <span dir="ltr">{Number(q.step) || q.step})</span>
    {q.sub && ` ${q.sub})`}
  </b>
);

/** A step of the subject: its lead (before its first sub-step) and its words. */
const Ask = ({ q, marks, toggle }) => (
  <>
    {q.lead && (
      <span className="xs-lead">
        <Markable text={q.lead} id={`${q.id}:lead`} marks={marks} toggle={toggle} />{' '}
      </span>
    )}
    <Markable text={q.text} id={q.id} marks={marks} toggle={toggle} />
  </>
);

/** One sheet of the subject as the exam paper prints it: its heading and points, its statement, its numbered steps. */
const Paper = ({ e, marks, toggle }) => (
  <section className="xs-ex" data-xs-bank={e.bankId}>
    <h3>
      {e.title} <i>({L.points(fmt(e.points))})</i>
    </h3>
    <Statement e={e} marks={marks} toggle={toggle} />
    <ol>
      {e.questions.map((q) => (
        <li key={q.id}>
          <Num q={q} /> <Ask q={q} marks={marks} toggle={toggle} /> {!q.paper && <i dir="ltr">({fmt(q.points)})</i>}
        </li>
      ))}
    </ol>
  </section>
);

/** The box of a step, drawn by the practice space's own widget for its answer type. */
function Field({ q, value, onChange }) {
  if (q.paper)
    return (
      <span className="xs-onpaper" data-xs-paper-only={q.id}>
        <PenLine size={15} /> {L.onPaper}
      </span>
    );
  return (
    <div className="xs-field" data-xs-field={q.id} data-xs-type={q.answerType}>
      {q.answerType === 'choice' ? (
        <ChoiceInput question={q.shown} value={value} onChange={onChange} />
      ) : q.answerType === 'integerSet' ? (
        <IntegerSetInput question={q.shown} value={value} onChange={onChange} />
      ) : (
        <TemplateInput template={templateFor(q.shown)} question={q.shown} onChange={onChange} ariaLabel={q.text} />
      )}
    </div>
  );
}

/**
 * The line a fraction box writes under itself (the irreducible-fraction note of the template) is the same for every fraction
 * answer of a sheet: it is said once per leaf of the answer sheet (ExamSittingLeaves › quiet), not under each box.
 */
function quietKey(q) {
  if (q.paper || q.answerType === 'choice' || q.answerType === 'integerSet') return null;
  const t = templateFor(q.shown);
  return t.kind === 'fraction' ? `fraction:${t.irreducible ? 'irreducible' : 'whole'}` : null;
}

/** What the student wrote, in blue ink. */
function Written({ q, value, written }) {
  if (q.paper) return <span className="xs-none">{L.onPaper}</span>;
  if (!answered(q, value)) return <span className="xs-none">{L.none}</span>;
  return (
    <span className="xs-ink">
      <MathText>{written(q, value)}</MathText>
    </span>
  );
}

/**
 * The sitting opens on its bank: the sheet waits until the lesson's bank is loaded (once). Then the subject is drawn ONCE —
 * or, for a level with nothing to mark, no sheet at all: the level is said unavailable, nothing is marked or sent.
 */
export default function ExamSitting(props) {
  const { sittings } = useLesson();
  const [state, setState] = useState(() => (sittings.ready() ? 'ready' : 'loading'));
  useEffect(() => {
    if (state !== 'loading') return undefined;
    let live = true;
    sittings.prepare().then(
      () => live && setState('ready'),
      () => live && setState('failed'),
    );
    return () => {
      live = false;
    };
  }, [sittings, state]);
  if (state === 'ready') return <Drawn {...props} />;
  return <Wait state={state} onQuit={props.onQuit} />;
}

/** The sheet waits (loading), could not be prepared (failed), or the level has nothing to sit (empty). */
function Wait({ state, onQuit }) {
  return (
    <div className="xs-root" data-xs={state}>
      <div className="xs-wait">
        <p>{state === 'failed' ? L.failed : state === 'empty' ? L.empty : L.loading}</p>
        {state !== 'loading' && (
          <button type="button" className="xs-btn xs-btn--main" onClick={() => onQuit?.()} data-xs-quit-yes>
            {L.quitYes}
          </button>
        )}
      </div>
    </div>
  );
}

/** The subject, drawn once. */
function Drawn(props) {
  const lesson = useLesson();
  const { sittings } = lesson;
  const { level = 4, weak = [] } = props;
  const [subject] = useState(() =>
    sittings.makeSubject(Math.random, level, weak, keysOfPoints(sittings.lesson, lesson)),
  );
  if (!subject) return <Wait state="empty" onQuit={props.onQuit} />;
  return <Sitting {...props} subject={subject} />;
}

function Sitting({ game, subject, onFinish, onQuit, onHandIn }) {
  const lesson = useLesson();
  const { sittings, rules } = lesson;
  const { totalMark, mark, model, scheme, guide, written } = sittings;
  const qs = useMemo(() => allQuestions(subject), [subject]);
  const total = subject.minutes * 60;
  const [phase, setPhase] = useState('read');
  const [answers, setAnswers] = useState({});
  const [flags, setFlags] = useState({});
  const [marks, setMarks] = useState(() => new Set());
  const [page, setPage] = useState(0);
  const [left, setLeft] = useState(total);
  const [readLeft, setReadLeft] = useState(() => (FAST() ? 0 : 45));
  const [confirm, setConfirm] = useState(false);
  const [forgot, setForgot] = useState(null);
  const [quit, setQuit] = useState(false);
  const reminded = useRef(false);
  const [open, setOpen] = useState(null);
  const [help, setHelp] = useState({});
  const [ticks, setTicks] = useState({});
  const [nb, setNb] = useState(false);
  const [z, setZ] = useState(1);
  const seat = useRef(1 + Math.floor(Math.random() * 28));
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const onClose = () => onFinish?.(subject, answersRef.current);
  useEffect(() => {
    if (import.meta.env.DEV) window.__sitting = { subject };
  }, [subject]);

  useEffect(() => {
    const fit = () => setZ(Math.max(1, Math.min(1.8, Math.min(window.innerWidth / 1280, window.innerHeight / 720))));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  // an exam is silent: the music stops for the whole sitting
  useEffect(() => {
    game.paperMode('sitting', true);
    return () => game.paperMode('sitting', false);
  }, [game]);
  useEffect(() => {
    if (phase !== 'read' || readLeft <= 0) return undefined;
    const t = setTimeout(() => setReadLeft((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, readLeft]);
  const handed = useRef(false);
  const handIn = () => {
    // ONE copy per sitting, whatever calls it (the button, the clock, a double render)
    if (handed.current) return;
    handed.current = true;
    // the learning points: every answered step is a first and only try, unassisted — sent to the practice engine, whose SERVER reads the
    // question in the bank and re-computes the verdict (bankEvidence.js)
    onHandIn?.(subject, answersRef.current);
    setPhase('envelope');
    setTimeout(() => setPhase('back'), FAST() ? 60 : 2200);
  };
  // the clock: a PURE countdown (an updater has no side effect — React may call it twice); the hand-in is the effect below
  useEffect(() => {
    if (phase !== 'sit') return undefined;
    const t = setInterval(() => setLeft(tick), 1000);
    return () => clearInterval(t);
  }, [phase]);
  // time is up: the copy is handed in as it is
  useEffect(() => {
    if (timeUp(phase, left, handed.current)) handIn();
  }, [phase, left]); // eslint-disable-line react-hooks/exhaustive-deps

  /** « Je rends ma copie »: an exercise left completely empty is put on the answer sheet first — ONCE; the next hand-in is accepted. */
  const askHand = () => {
    const miss = reminded.current ? [] : forgotten(subject, answersRef.current, page);
    if (miss.length === 0) {
      setConfirm(true);
      return;
    }
    reminded.current = true;
    setPage(miss[0]);
    setForgot(miss);
  };
  const goPage = (i) => {
    setPage(i);
    setForgot(null);
    setConfirm(false);
  };
  const short = (e) => e.title.split(' (')[0];
  const toggleMark = (k) =>
    setMarks((m) => {
      const n = new Set(m);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });
  const got = totalMark(subject, answers);
  const done = (e) => e.questions.filter((q) => answered(q, answers[q.id])).length;
  const typed = (e) => e.questions.filter((q) => !q.paper).length;

  const head = (
    <header className="xs-head">
      <span className="xs-seat">
        {L.seat} <b dir="ltr">{seat.current}</b>
      </span>
      <div>
        <h2>{subject.title}</h2>
        <p>
          {subject.lesson} · {L.points(fmt(subject.total))} · {L.minutes(subject.minutes)}
        </p>
      </div>
      {phase === 'read' && (
        <span className="xs-clock" data-xs-read-clock>
          <Clock size={18} /> {L.read} <b dir="ltr">{clock(readLeft)}</b>
        </span>
      )}
      {phase === 'sit' && (
        <span className="xs-clock" data-xs-clock>
          <Clock size={18} /> <b dir="ltr">{clock(left)}</b>
        </span>
      )}
      {phase === 'back' && (
        <span className="xs-total" data-xs-total={got}>
          <b dir="ltr">{fmt(got)}</b>
          <i dir="ltr">/ {subject.total}</i>
        </span>
      )}
      {phase !== 'back' && (
        <span className="xs-quiet">
          <VolumeX size={15} /> {L.silent}
        </span>
      )}
      {(phase === 'read' || phase === 'sit') && (
        <button type="button" className="xs-btn xs-btn--quit" onClick={() => setQuit(true)} data-xs-quit>
          <LogOut size={16} /> {L.quit}
        </button>
      )}
      {phase === 'back' && (
        <button type="button" className="xs-btn" onClick={onClose} data-xs-close>
          <X size={16} />
        </button>
      )}
    </header>
  );

  return (
    <div className="xs-root" data-xs={phase}>
      {/* the 12 px floor (GAME_WORLD.md « 12 px floor »): each Fit box sets --di-min-font for its own zoom × this one */}
      <div className="xs-fit" style={{ zoom: z, '--di-min-font': `${Math.ceil((FLOOR * 100) / z) / 100}px` }}>
        {head}

        {phase === 'read' && (
          <>
            <p className="xs-tip">
              <PenLine size={17} /> {L.readTip}
            </p>
            <Fit
              floor={FLOOR}
              className="xs-paper xs-paper--read"
              innerClass={`xs-cols xs-cols--${subject.exercises.length}`}
            >
              {subject.exercises.map((e) => (
                <Paper key={e.id} e={e} marks={marks} toggle={toggleMark} />
              ))}
            </Fit>
            <footer className="xs-foot">
              <button
                type="button"
                className="xs-btn xs-btn--main"
                disabled={readLeft > 35}
                onClick={() => setPhase('sit')}
                data-xs-start
              >
                {L.ready}
              </button>
            </footer>
          </>
        )}

        {phase === 'sit' && (
          <>
            {/* every page stays mounted (hidden when not on screen): a box keeps what he typed when he turns the page */}
            {subject.exercises.map((e, i) => (
              <div key={e.id} className="xs-body" hidden={i !== page} data-xs-sheet-page={i}>
                <Fit floor={FLOOR} className="xs-paper">
                  <Paper e={e} marks={marks} toggle={toggleMark} />
                </Fit>
                <Leaves
                  floor={FLOOR}
                  className={`xs-sheet ${forgot && i === page ? 'is-forgot' : ''}`}
                  head={
                    <>
                      <h3>
                        {L.sheet} — {e.title}
                      </h3>
                      <p className="xs-tip xs-tip--in">
                        <PenLine size={15} /> {L.paper}
                      </p>
                    </>
                  }
                  items={e.questions.map((q) => ({
                    id: q.id,
                    className: flags[q.id] ? 'is-flagged' : '',
                    quiet: quietKey(q),
                    node: (
                      <>
                        <Num q={q} />
                        <div className="xs-step">
                          <span className="xs-step__ask">
                            <MathText>{q.text}</MathText>
                          </span>
                          <Field
                            q={q}
                            value={answers[q.id]}
                            onChange={(v) => {
                              setForgot(null);
                              setAnswers((a) => ({ ...a, [q.id]: v }));
                            }}
                          />
                        </div>
                        {!q.paper && (
                          <button
                            type="button"
                            className={`xs-flag ${flags[q.id] ? 'is-on' : ''}`}
                            title={L.flag}
                            aria-label={L.flag}
                            onClick={() => setFlags((f) => ({ ...f, [q.id]: !f[q.id] }))}
                          >
                            <Flag size={16} />
                          </button>
                        )}
                      </>
                    ),
                  }))}
                />
              </div>
            ))}
            {left <= 60 && left > 0 && (
              <p className="xs-last" data-xs-last>
                {L.lastMinute}
              </p>
            )}
            <footer className="xs-foot xs-foot--sit">
              <nav className="xs-pages">
                {subject.exercises.map((e, i) => (
                  <button
                    key={e.id}
                    type="button"
                    className={`${i === page ? 'is-on' : ''} ${forgot?.includes(i) ? 'is-forgot' : ''}`}
                    onClick={() => goPage(i)}
                    data-xs-page={i}
                  >
                    {short(e)}{' '}
                    <i dir="ltr">
                      {done(e)}/{typed(e)}
                    </i>
                  </button>
                ))}
              </nav>
              {!forgot && (
                <div className="xs-pace" title={L.here} dir="ltr" data-xs-pace>
                  <i style={{ left: `${pace(total - left, total) * 100}%` }} />
                  {subject.exercises.map((e) => (
                    <span key={e.id} style={{ flex: e.points }} />
                  ))}
                </div>
              )}
              {forgot ? (
                <span className="xs-confirm xs-confirm--forgot" role="status" data-xs-forgot={forgot.join(',')}>
                  {forgot.length === 1
                    ? L.forgotOne(short(subject.exercises[forgot[0]]))
                    : L.forgotMany(forgot.map((i) => short(subject.exercises[i])))}{' '}
                  <button
                    type="button"
                    className="xs-btn xs-btn--main"
                    onClick={() => setForgot(null)}
                    data-xs-forgot-go
                  >
                    {L.no}
                  </button>
                </span>
              ) : confirm ? (
                <span className="xs-confirm">
                  {L.sure}{' '}
                  <button type="button" className="xs-btn xs-btn--main" onClick={handIn} data-xs-hand-yes>
                    {L.yes}
                  </button>{' '}
                  <button type="button" className="xs-btn" onClick={() => setConfirm(false)} data-xs-hand-no>
                    {L.no}
                  </button>
                </span>
              ) : (
                <button type="button" className="xs-btn xs-btn--main" onClick={askHand} data-xs-hand>
                  {L.hand}
                </button>
              )}
            </footer>
          </>
        )}

        {quit && (phase === 'read' || phase === 'sit') && (
          <div
            className="xs-quitbox"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="xs-quit-title"
            data-xs-quit-box
          >
            <div>
              <h3 id="xs-quit-title">{L.quitTitle}</h3>
              <p>{L.quitText}</p>
              <span>
                <button
                  type="button"
                  className="xs-btn xs-btn--main"
                  onClick={() => setQuit(false)}
                  autoFocus
                  data-xs-quit-no
                >
                  {L.no}
                </button>{' '}
                <button type="button" className="xs-btn" onClick={() => onQuit?.()} data-xs-quit-yes>
                  {L.quitYes}
                </button>
              </span>
            </div>
          </div>
        )}

        {phase === 'envelope' && (
          <div className="xs-envelope" data-xs-envelope>
            <div className="xs-envelope__sheet" />
            <div className="xs-envelope__flap" />
            <p>{L.sealed}</p>
          </div>
        )}

        {phase === 'back' && (
          <>
            <p className="xs-appreciation" data-xs-appreciation>
              {appreciation(got, subject.total)}
            </p>
            <div className="xs-body">
              <Fit floor={FLOOR} className="xs-paper xs-paper--back">
                {subject.exercises.map((e) => (
                  <section key={e.id} className="xs-ex">
                    <h3>
                      {e.title}{' '}
                      <i dir="ltr" className="xs-red">
                        {fmt(e.questions.reduce((t, q) => t + mark(q, answers[q.id]), 0))}
                        {'\u00a0/\u00a0'}
                        {fmt(e.points)}
                      </i>
                    </h3>
                    <ol>
                      {e.questions.map((q) => {
                        const m = mark(q, answers[q.id]);
                        const tone = q.paper ? 'paper' : m === q.points ? 'ok' : m > 0 ? 'half' : 'ko';
                        return (
                          <li key={q.id}>
                            <button
                              type="button"
                              className={`xs-row ${open === q.id ? 'is-open' : ''}`}
                              onClick={() => setOpen(q.id)}
                              data-xs-row={q.id}
                              data-xs-mark={tone}
                            >
                              <span className="xs-row__q">
                                <MathText>{q.text}</MathText>
                              </span>
                              <Written q={q} value={answers[q.id]} written={written} />
                              <span className={`xs-pen is-${tone}`}>
                                {tone === 'paper' ? '✎' : tone === 'ok' ? '✓' : tone === 'half' ? '½' : '✗'}{' '}
                                {!q.paper && (
                                  <i dir="ltr">
                                    {fmt(m)}/{fmt(q.points)}
                                  </i>
                                )}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ol>
                  </section>
                ))}
              </Fit>
              <Fit floor={FLOOR} className="xs-sheet xs-sheet--back">
                {(() => {
                  if (nb) {
                    const lost = qs.filter((q) => !q.paper && mark(q, answers[q.id]) < q.points && rules[q.key]);
                    const keys = [...new Set(lost.map((q) => q.key))];
                    return (
                      <div className="xs-notebook" data-xs-notebook>
                        <h3>
                          <NotebookPen size={20} /> {L.notebook}
                        </h3>
                        {keys.length === 0 ? (
                          <p>{L.perfect}</p>
                        ) : (
                          <>
                            <p>{L.notebookTip}</p>
                            <ol>
                              {keys.map((k) => (
                                <li key={k}>
                                  <b>{rules[k].title} :</b> {rules[k].notes.at(-1)}
                                </li>
                              ))}
                            </ol>
                          </>
                        )}
                        <button type="button" className="xs-btn xs-btn--main" onClick={onClose} data-xs-finish>
                          {L.finish}
                        </button>
                      </div>
                    );
                  }
                  const q = qs.find((x) => x.id === open);
                  if (!q)
                    return (
                      <div className="xs-pick">
                        <p>{L.pick}</p>
                        <button
                          type="button"
                          className="xs-btn xs-btn--main"
                          onClick={() => setNb(true)}
                          data-xs-notebook-open
                        >
                          <NotebookPen size={17} /> {L.notebook}
                        </button>
                      </div>
                    );
                  const m = mark(q, answers[q.id]);
                  const full = !q.paper && m === q.points;
                  const h = help[q.id] ?? (full || q.paper ? 'explain' : null);
                  const rule = q.key ? rules[q.key] : null;
                  const hints = guide(q);
                  return (
                    <div className="xs-detail" data-xs-detail={q.id}>
                      <h3>
                        <MathText>{q.text}</MathText>
                      </h3>
                      <p className="xs-detail__mine">
                        <small>{L.mine}</small> <Written q={q} value={answers[q.id]} written={written} />{' '}
                        {!q.paper && (
                          <span className={`xs-pen is-${full ? 'ok' : m > 0 ? 'half' : 'ko'}`} dir="ltr">
                            {fmt(m)}/{fmt(q.points)}
                          </span>
                        )}
                      </p>
                      <div className="xs-scheme">
                        <small>{L.scheme}</small>
                        {scheme(q).map((s, i) => (
                          <label key={s}>
                            <input
                              type="checkbox"
                              checked={Boolean(ticks[`${q.id}:${i}`])}
                              onChange={(e) => setTicks((t) => ({ ...t, [`${q.id}:${i}`]: e.target.checked }))}
                            />{' '}
                            <MathText>{s}</MathText>
                          </label>
                        ))}
                      </div>
                      {!full && (
                        <div className="xs-helps">
                          <button
                            type="button"
                            className={`xs-btn ${h === 'guide' ? 'is-on' : ''}`}
                            onClick={() => setHelp((x) => ({ ...x, [q.id]: 'guide' }))}
                            data-xs-guide
                          >
                            <Compass size={16} /> {L.guide}
                          </button>
                          <button
                            type="button"
                            className={`xs-btn ${h === 'explain' ? 'is-on' : ''}`}
                            onClick={() => setHelp((x) => ({ ...x, [q.id]: 'explain' }))}
                            data-xs-explain
                          >
                            <BookOpenCheck size={16} /> {L.explain}
                          </button>
                        </div>
                      )}
                      {h === 'guide' && (
                        <div className="xs-help" data-xs-help="guide">
                          <small>{L.think}</small>
                          {hints.length > 0 ? (
                            hints.map((line, i) => (
                              <p key={i}>
                                <MathText>{line}</MathText>
                              </p>
                            ))
                          ) : rule ? (
                            <>
                              <p>
                                <MathText>{rule.lines[0]}</MathText>
                              </p>
                              <p>
                                <b>{rule.notes.at(-1)}</b>
                              </p>
                            </>
                          ) : (
                            <p>{scheme(q)[0]}</p>
                          )}
                          <p className="xs-redo">{L.redo}</p>
                        </div>
                      )}
                      {h === 'explain' && (
                        <div className="xs-help xs-help--model" data-xs-help="explain">
                          <small>{L.modelCopy}</small>
                          {model(q).map((line, i) => (
                            <p key={i}>
                              <MathText>{line}</MathText>
                            </p>
                          ))}
                        </div>
                      )}
                      <button type="button" className="xs-btn" onClick={() => setNb(true)} data-xs-notebook-open>
                        <NotebookPen size={16} /> {L.notebook}
                      </button>
                    </div>
                  );
                })()}
              </Fit>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
