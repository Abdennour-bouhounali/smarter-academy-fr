/**
 * « حصّة القسم » — the test ON THE BOARD, and its result (CLASS_SESSION.md). One screen, one mouse: the name of the student
 * whose turn it is stands on top; he answers; a sentence meets his answer — right or not — with his name; then the next.
 * At the end: what the class holds, the الكفاءات to revise, and the podium of the teams (the first in the middle).
 * Readable from the last row; nothing scrolls; never « wrong » as a verdict; nobody is shown as last.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Check, Delete, Eye, X } from 'lucide-react';
import MathText from '../../lessons/common/components/MathText';
import KidFigure from '../../lessons/common/manipulations/primitives/KidFigure';
import { kidLook } from '../../lessons/common/manipulations/primitives/kidFigure';
import { playSfx } from '../../lessons/common/utils/playEffect';
import { ClassWindow, Speaker, BoardTools, BoardLayers, useBoardTools } from './board';
import {
  turnOrder,
  teamsOf,
  teamOfStudent,
  nextStudent,
  gradeAnswer,
  praise,
  callName,
  summarise,
  podium as podiumOf,
} from './session';

const L = {
  turn: 'دور',
  pickOne: 'اختر تلميذًا من القسم',
  klass: 'القسم',
  pointer: 'المؤشّر',
  close: 'إغلاق',
  board: 'السبّورة',
  q: (i, n) => `السؤال ${i} من ${n}`,
  mode: { order: 'بالترتيب', teacher: 'أختار أنا', fair: 'اختر لي' },
  true: 'صحيح',
  false: 'خطأ',
  confirm: 'تأكيد',
  reveal: 'أظهر الجواب',
  answer: 'الجواب',
  next: 'السؤال التالي',
  toResult: 'النتيجة',
  absent: 'غياب',
  absentHint: 'اضغط طاولة كلّ غائب.',
  exit: 'خروج',
  exitAsk: 'تخرج من الاختبار؟ لن تُحفظ هذه الحصّة.',
  yes: 'نعم، أخرج',
  stay: 'أواصل',
  result: { start: 'نتيجة اختبار البداية', end: 'نتيجة اختبار النهاية' },
  of: 'من',
  revise: 'كفاءات تحتاج مراجعة',
  allGood: 'القسم يتحكّم في كلّ الكفاءات المختبَرة.',
  podium: 'منصّة التتويج',
  stars: 'أصابوا اليوم',
  before: 'في بداية الحصّة',
  now: 'الآن',
  newLesson: 'الدرس الجديد',
  saved: 'حُفظت الحصّة.',
  queued: 'لا اتّصال الآن: تُرسَل الحصّة تلقائيًّا عند عودة الاتّصال.',
  noProgress: 'هذا الاختبار لا يغيّر تقدّم أيّ تلميذ.',
  back: 'عودة إلى التحضير',
  place: ['', 'الأوّل', 'الثاني', 'الثالث'],
  sound: 'الصوت',
};
const LETTERS = ['أ', 'ب', 'ج', 'د', 'هـ', 'و'];

export function Player({ students, seating, questions, moment, turns, onFinish, onExit }) {
  const order = useMemo(() => turnOrder(seating, students), [seating, students]);
  const teams = useMemo(() => teamsOf(seating, students), [seating, students]);
  const byId = useMemo(() => Object.fromEntries(students.map((s) => [s.id, s])), [students]);
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [mode, setMode] = useState('order');
  const [pick, setPick] = useState(null);
  const [absent, setAbsent] = useState([]);
  const [marking, setMarking] = useState(false);
  const [said, setSaid] = useState(null);
  const [typed, setTyped] = useState('');
  const [shown, setShown] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [classOpen, setClassOpen] = useState(false);
  const tools = useBoardTools();
  const started = useRef(Date.now());
  const asked = useRef(Date.now());
  const q = questions[i];
  const auto = nextStudent({ order, absent, answers, mode: mode === 'teacher' ? 'order' : mode, history: turns });
  const current = said ? said.student : (pick ?? (mode === 'teacher' ? null : auto));
  const st = current != null ? byId[current] : null;
  const team = st ? teamOfStudent(teams, st.id) : null;
  useEffect(() => {
    asked.current = Date.now();
    setTyped('');
    setShown(false);
  }, [i]);
  // « أختار أنا »: the class opens by itself at each question, until the teacher has tapped a desk
  useEffect(() => {
    if (mode === 'teacher' && pick == null && !said) setClassOpen(true);
  }, [mode, pick, said, i]);
  useEffect(() => {
    if (import.meta.env.DEV) window.__classSession = { q, i, current, answers, mode, absent, said, classOpen };
  });

  const give = (value) => {
    if (said || current == null) return;
    const correct = gradeAnswer(q, value);
    const a = {
      question: q.id,
      student: current,
      team: team?.id ?? null,
      correct,
      value,
      pickedBy: pick != null ? 'teacher' : mode,
      ms: Date.now() - asked.current,
    };
    setAnswers([...answers, a]);
    setSaid(a);
    playSfx(correct ? 'correct' : 'notyet', { enabled: true });
  };
  const next = () => {
    if (!said) return;
    if (i + 1 >= questions.length) {
      onFinish({
        answers: answers.map(({ value: _v, ...a }) => a),
        absent,
        startedAt: started.current,
        finishedAt: Date.now(),
      });
      return;
    }
    setSaid(null);
    setPick(null);
    setI(i + 1);
  };
  const tapSeat = (id) => {
    if (marking) {
      setAbsent((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));
      if (pick === id) setPick(null);
      return;
    }
    if (!said && !absent.includes(id)) {
      setPick(id);
      setClassOpen(false);
    }
  };
  useEffect(() => {
    const onKey = (e) => {
      if (tools.busy) return;
      if ((e.key === 'Enter' || e.key === 'ArrowLeft') && said) {
        e.preventDefault();
        next();
      }
      if (e.key === 'Escape' && classOpen) setClassOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const g = st ? (seating.genders?.[st.id] ?? null) : null;
  const nRight = answers.filter((a) => a.correct).length;
  const mark = (k) =>
    said
      ? k === q.answer && (said.correct || shown)
        ? 'is-right'
        : k === said.value && !said.correct
          ? 'is-given'
          : ''
      : '';
  return (
    <div className="cs-play" data-cs-play={said ? 'said' : 'ask'} data-cs-moment-on={moment}>
      <header className="cs-play__top">
        <div className="cs-play__mid">
          <span className="cs-count" dir="rtl">
            {L.q(i + 1, questions.length)}
          </span>
          <span className="cs-dots" dir="ltr" aria-hidden="true">
            {questions.map((x, k) => (
              <i
                key={x.id}
                className={k < answers.length ? (answers[k].correct ? 'is-ok' : 'is-ko') : k === i ? 'is-now' : ''}
              />
            ))}
          </span>
        </div>
        <span className="cs-score" dir="ltr" data-cs-score={nRight}>
          {nRight}
          {' / '}
          {answers.length}
        </span>
        <div className="cs-seg cs-seg--mode" role="group">
          {['order', 'teacher', 'fair'].map((m) => (
            <button
              key={m}
              type="button"
              className={mode === m && pick == null ? 'is-on' : ''}
              onClick={() => {
                setMode(m);
                if (!said) setPick(null);
              }}
              disabled={Boolean(said)}
              data-cs-mode={m}
            >
              {L.mode[m]}
            </button>
          ))}
        </div>
        <BoardTools tools={tools} onClass={() => setClassOpen(true)} classDisabled={Boolean(said)} />
        <button type="button" className="cs-icon" onClick={() => setLeaving(true)} aria-label={L.exit} data-cs-exit>
          <X size={22} />
        </button>
      </header>

      {/* the name of the student whose turn it is: across the whole board, readable from the last desk */}
      <Speaker name={st ? callName(st) : null} team={team} label={L.turn} wait={L.pickOne} />

      <main className="cs-play__body">
        <section className="cs-question" data-cs-question={q.id} data-cs-kind={q.kind}>
          <p className="cs-question__text">
            <MathText>{q.text}</MathText>
          </p>
          {q.kind === 'choice' && (
            <div className={`cs-options ${q.options.every((o) => o.length <= 12) ? 'cs-options--short' : ''}`}>
              {q.options.map((o, k) => (
                <button
                  key={o}
                  type="button"
                  className={mark(k)}
                  onClick={() => give(k)}
                  disabled={Boolean(said) || current == null}
                  data-cs-option={k}
                >
                  <b>{LETTERS[k]}</b>
                  <span>
                    <MathText>{o}</MathText>
                  </span>
                </button>
              ))}
            </div>
          )}
          {q.kind === 'truefalse' && (
            <div className="cs-options cs-options--tf">
              {[true, false].map((v) => (
                <button
                  key={String(v)}
                  type="button"
                  className={mark(v)}
                  onClick={() => give(v)}
                  disabled={Boolean(said) || current == null}
                  data-cs-option={String(v)}
                >
                  <span>{v ? L.true : L.false}</span>
                </button>
              ))}
            </div>
          )}
          {q.kind === 'number' && (
            <div className="cs-number">
              <div className="cs-number__out">
                <output className={said ? (said.correct ? 'is-right' : 'is-given') : ''} dir="ltr" data-cs-typed>
                  {typed || ' '}
                </output>
                {said && !said.correct && shown && (
                  <output className="is-right" dir="ltr" data-cs-right-number>
                    {q.answer}
                  </output>
                )}
              </div>
              <div className="cs-keys" dir="ltr">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setTyped((t) => (t.length < 6 ? t + d : t))}
                    disabled={Boolean(said) || current == null}
                    data-cs-key={d}
                  >
                    {d}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setTyped((t) => t.slice(0, -1))}
                  disabled={Boolean(said)}
                  aria-label="⌫"
                  data-cs-key="back"
                >
                  <Delete size={26} />
                </button>
                <button
                  type="button"
                  className="cs-keys__ok"
                  onClick={() => give(typed)}
                  disabled={Boolean(said) || typed === '' || current == null}
                  data-cs-key="ok"
                >
                  <Check size={24} strokeWidth={3} /> {L.confirm}
                </button>
              </div>
            </div>
          )}
          {said && (
            <div
              className={`cs-said ${said.correct ? 'is-right' : 'is-miss'}`}
              role="status"
              data-cs-said={said.correct ? 'right' : 'miss'}
            >
              <p>
                {praise(said.correct, callName(byId[said.student]), {
                  gender: g,
                  n: answers.filter((x) => x.correct === said.correct).length - 1,
                })}
              </p>
              {/* the owner's own sentence comes first, for a right answer and for a miss */}
              <span>
                {!said.correct && !shown && (
                  <button type="button" className="cs-btn" onClick={() => setShown(true)} data-cs-reveal>
                    <Eye size={18} /> {L.reveal}
                  </button>
                )}
                <button type="button" className="cs-btn cs-btn--main" onClick={next} autoFocus data-cs-next>
                  {i + 1 >= questions.length ? L.toResult : L.next} <ArrowLeft size={18} />
                </button>
              </span>
            </div>
          )}
        </section>
      </main>
      {classOpen && (
        <ClassWindow
          students={students}
          seating={seating}
          current={current}
          spoken={answers.map((a) => a.student)}
          absent={absent}
          onTap={tapSeat}
          marking={marking}
          setMarking={setMarking}
          onClose={() => {
            setClassOpen(false);
            setMarking(false);
          }}
        />
      )}
      {leaving && (
        <div className="cs-veil" role="alertdialog" aria-modal="true" data-cs-exit-box>
          <div className="cs-ask-box">
            <p>{L.exitAsk}</p>
            <span>
              <button type="button" className="cs-btn cs-btn--main" onClick={() => setLeaving(false)} autoFocus>
                {L.stay}
              </button>
              <button type="button" className="cs-btn" onClick={onExit} data-cs-exit-yes>
                {L.yes}
              </button>
            </span>
          </div>
        </div>
      )}
      <BoardLayers tools={tools} />
    </div>
  );
}

/** The podium: three steps, the first in the middle; on each, the team under its name, drawn with the platform's characters. */
function Podium({ steps, students, seating }) {
  const byId = Object.fromEntries(students.map((s) => [s.id, s]));
  const H = { 1: 150, 2: 108, 3: 74 };
  const X = { 2: 160, 1: 450, 3: 740 };
  const BASE = 452;
  const KID = 150;
  return (
    <svg
      viewBox="0 0 900 460"
      className="cs-podium"
      data-cs-podium={steps.map((s) => s.place).join(',')}
      role="img"
      aria-label={L.podium}
    >
      {steps.map((step) => {
        const cx = X[step.place];
        const top = BASE - H[step.place];
        const lists = step.teams.map((t) => t.members.filter((id) => byId[id]).map((id) => ({ id, team: t })));
        const kids = Array.from({ length: 4 }, (_, n) => lists.map((l) => l[n]))
          .flat()
          .filter(Boolean)
          .slice(0, 4);
        /* teams that share a step each send their first students */ const gap = Math.min(
          70,
          262 / Math.max(1, kids.length),
        );
        return (
          <g key={step.place} data-cs-step={step.place} data-cs-step-teams={step.teams.map((t) => t.id).join(',')}>
            <rect
              x={cx - 138}
              y={top}
              width="276"
              height={H[step.place]}
              rx="14"
              className={`cs-podium__block is-${step.place}`}
            />
            <text x={cx} y={top + 40} textAnchor="middle" className="cs-podium__place">
              {step.place}
            </text>
            <text x={cx} y={BASE - 14} textAnchor="middle" className="cs-podium__team" direction="rtl">
              {step.teams.map((t) => t.name).join(' · ')}
            </text>
            {kids.map((k, n) => {
              const x = cx + (n - (kids.length - 1) / 2) * gap;
              const gender = seating.genders?.[k.id] ?? null;
              return (
                <g key={k.id} data-cs-kid={k.id} data-cs-kid-drawn={gender ? 'figure' : 'medal'}>
                  {gender ? (
                    <KidFigure
                      cx={x}
                      top={top - KID}
                      foot={top - 2}
                      {...kidLook(k.id)}
                      hairStyle={gender === 'f' ? 'hijab' : 'short'}
                      mood="proud"
                      shadow={false}
                    />
                  ) : (
                    <g>
                      <circle cx={x} cy={top - 44} r="30" className="cs-podium__medal" style={{ fill: k.team.color }} />
                      <text x={x} y={top - 33} textAnchor="middle" className="cs-podium__initial">
                        {callName(byId[k.id])[0]}
                      </text>
                    </g>
                  )}
                  <text
                    x={x}
                    y={top - (gender ? KID + 10 : 86)}
                    textAnchor="middle"
                    className="cs-podium__name"
                    direction="rtl"
                  >
                    {callName(byId[k.id])}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

export function Result({
  students,
  seating,
  questions,
  answers,
  moment,
  startItems,
  lessonItems,
  itemLabel,
  status,
  onBack,
  onClose,
  next = null,
}) {
  const teams = useMemo(() => teamsOf(seating, students), [seating, students]);
  const sum = useMemo(() => summarise({ questions, answers, teams }), [questions, answers, teams]);
  const steps = podiumOf(sum.teams);
  const byId = Object.fromEntries(students.map((s) => [s.id, s]));
  // « before / after »: the questions of the NEW lesson asked at the start of the hour, against the same الكفاءة now
  const count = (list) =>
    (list ?? [])
      .filter((x) => lessonItems.includes(x.item))
      .reduce((t, x) => ({ right: t.right + x.right, total: t.total + x.total }), { right: 0, total: 0 });
  const before = moment === 'end' ? count(startItems) : null;
  const after = moment === 'end' ? count(sum.items) : null;
  useEffect(() => {
    playSfx('win', { enabled: true });
  }, []);
  return (
    <div className="cs-result" data-cs-result={`${sum.right}/${sum.total}`}>
      <header className="cs-result__top">
        <div>
          <h2>{L.result[moment]}</h2>
          <p className="cs-hint">{L.noProgress}</p>
        </div>
        <div className="cs-bigscore" data-cs-percent={sum.percent ?? ''}>
          <b dir="ltr">{sum.right}</b>
          <span>{L.of}</span>
          <b dir="ltr">{sum.total}</b>
        </div>
        {before && before.total > 0 && after.total > 0 && (
          <div className="cs-gain" data-cs-gain={`${before.right}/${before.total}>${after.right}/${after.total}`}>
            <small>{L.newLesson}</small>
            <p>
              {L.before}:{' '}
              <b dir="ltr">
                {before.right}
                {'\u00a0/\u00a0'}
                {before.total}
              </b>
            </p>
            <p>
              {L.now}:{' '}
              <b dir="ltr">
                {after.right}
                {'\u00a0/\u00a0'}
                {after.total}
              </b>
            </p>
          </div>
        )}
      </header>
      <main className="cs-result__body">
        <section className="cs-revise" data-cs-revise={sum.revise.map((x) => x.item).join(',')}>
          <h3>{L.revise}</h3>
          {sum.revise.length === 0 ? (
            <p className="cs-good">{L.allGood}</p>
          ) : (
            <ul>
              {sum.revise.map((x) => (
                <li key={x.item}>
                  <strong>{itemLabel(x.item)}</strong>
                  <span dir="ltr">
                    {x.right}
                    {'\u00a0/\u00a0'}
                    {x.total}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {sum.stars.length > 0 && (
            <>
              <h3>{L.stars}</h3>
              <p className="cs-stars" data-cs-stars={sum.stars.length}>
                {[...new Set(sum.stars)]
                  .map((id) => callName(byId[id]))
                  .filter(Boolean)
                  .join('، ')}
              </p>
            </>
          )}
        </section>
        <section className="cs-stage">
          <h3>{L.podium}</h3>
          <Podium steps={steps} students={students} seating={seating} />
        </section>
      </main>
      <footer className="cs-result__foot">
        <span className={`cs-state ${status === 'queued' ? 'is-dirty' : ''}`} data-cs-saved={status}>
          {status === 'queued' ? L.queued : status === 'saved' ? L.saved : ''}
        </span>
        <span>
          <button type="button" className="cs-btn" onClick={onBack} data-cs-back>
            {L.back}
          </button>
          <button type="button" className={`cs-btn ${next ? '' : 'cs-btn--main'}`} onClick={onClose} data-cs-close>
            {L.exit}
          </button>
          {/* the hour goes on: after the start test, the rules the lesson will use */}
          {next && (
            <button
              type="button"
              className="cs-btn cs-btn--main cs-btn--big"
              onClick={next.go}
              autoFocus
              data-cs-continue={next.id}
            >
              {next.label} <ArrowLeft size={20} />
            </button>
          )}
        </span>
      </footer>
    </div>
  );
}
