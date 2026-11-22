/**
 * « متابعة القسم » — the class on THIS lesson, student by student (owner, 2026-11-18; CLASS_SESSION.md §2bis). A tab of
 * the set-up screen of « حصّة القسم », where the class is already chosen. What a teacher reads here, top to bottom:
 *   the class in facts — per الكفاءة, how many are « متمكّن », « يحتاج دعمًا », « ثغرة », not assessed yet;
 *   each student on one line — his state on every الكفاءة (one square each) and his exercises (how many, how many right);
 *   a line opens on the detail — each الكفاءة in words, each exercise with what he got right, and right at the first try.
 * The order is « who needs me first », never a ranking. Read-only; nothing here is written anywhere.
 */
import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronDown, Eye, RefreshCw, RotateCcw, X } from 'lucide-react';
import MathText from '../../lessons/common/components/MathText';
import RichText from '../practice/RichText';
import ExerciseStatement from '../practice/ExerciseStatement';
import { formatStudentAnswer } from '../practice/teacherBank';
import { fetchStudentResponses } from '../../services/teacherPracticeService';
import { keyOf, choicesOf } from './exerciseBank';
import { fetchLessonTracking } from '../../services/teacher/classSessionService';
import { callName } from './session';
import {
  STATE_LABEL,
  STATES,
  classFacts,
  orderStudents,
  exercisesOf,
  exerciseLabel,
  studentWork,
  isRight,
} from './tracking';

const NB = ' / ';
const L = {
  loading: 'جارٍ التحميل…',
  refresh: 'حدّث',
  students: (n) => `${n} تلميذًا`,
  notStarted: (n) => `لم يبدأ بعد: ${n}`,
  practising: (n) => `يتدرّب على التمارين: ${n}`,
  points: 'كفاءات الدرس',
  name: 'التلميذ',
  exercises: 'التمارين',
  none: 'لم يبدأ بعد',
  noExercise: 'لا تمرين بعد',
  did: (n) => (n === 1 ? 'تمرين واحد' : n === 2 ? 'تمرينان' : n <= 10 ? `${n} تمارين` : `${n} تمرينًا`),
  right: 'أصاب',
  first: 'من أوّل محاولة',
  of: 'من',
  left: (n) => (n === 1 ? 'سؤال واحد يُعاد' : n === 2 ? 'سؤالان يُعادان' : `${n} أسئلة تُعاد`),
  see: 'شاهد إجاباته',
  close: 'إغلاق',
  work: (name) => `ما كتبه ${name}`,
  notAnswered: 'لم يُجب عن هذا السؤال.',
  wrote: 'كتب',
  try: (n) => `المحاولة ${n}`,
  expected: 'الجواب',
  rightWord: 'صحيح',
  retryWord: 'يُعاد',
  statement: 'نصّ التمرين',
  empty: 'لا تلميذ في هذا القسم بعد.',
  note: 'ترتيب القائمة: من يحتاجك أوّلًا. لا معدّل ولا ترتيب بين التلاميذ.',
};

/**
 * The window of ONE exercise of ONE student: the exercise as it was given, and under each question what he wrote at each
 * try — right or to redo — with the expected answer beside it. Read-only; opened from the student's line.
 */
function StudentWork({ token, lessonId, student, exerciseId, level, onClose }) {
  const [exercise, setExercise] = useState(null);
  const [responses, setResponses] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    let off = false;
    Promise.all([
      import('../practice/practiceContent').then((m) => m.loadExercise(lessonId, level, exerciseId)),
      fetchStudentResponses(token, lessonId, exerciseId, student.id),
    ])
      .then(([ex, res]) => {
        if (off) return;
        setExercise(ex);
        setResponses(res.questions ?? []);
      })
      .catch((e) => !off && setError(e.message));
    return () => {
      off = true;
    };
  }, [token, lessonId, exerciseId, level, student.id]);
  useEffect(() => {
    const esc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  });
  const work = exercise && responses ? studentWork(exercise, responses) : null;
  const st = exercise?.statement ?? {};
  return (
    <div className="cs-veil" role="dialog" aria-modal="true" data-cs-work={exerciseId}>
      <div className="cs-workwin">
        <header>
          <div>
            <h3>{L.work(callName(student))}</h3>
            <p>
              {exerciseLabel(exerciseId)}
              {exercise?.metadata?.title ? ` — ` : ''}
              {exercise?.metadata?.title && <MathText>{exercise.metadata.title}</MathText>}
            </p>
          </div>
          <button type="button" className="cs-icon" onClick={onClose} aria-label={L.close} data-cs-work-close>
            <X size={22} />
          </button>
        </header>
        {error ? (
          <p className="cs-error" role="alert">
            {error}
          </p>
        ) : !work ? (
          <p className="cs-hint">{L.loading}</p>
        ) : (
          <div className="cs-workwin__body">
            {(st.content?.trim() || st.formulas?.length || st.table || st.figure) && (
              <section className="cs-workwin__statement">
                <ExerciseStatement {...st} />
              </section>
            )}
            <ol>
              {work.map((w) => {
                const key = keyOf(w.question);
                const choices = choicesOf(w.question);
                return (
                  <li
                    key={w.question.id}
                    className={!w.answered ? 'is-none' : w.right ? 'is-right' : 'is-redo'}
                    data-cs-work-question={w.question.id}
                    data-cs-work-right={w.right === null ? '' : String(w.right)}
                  >
                    <b>{w.number}</b>
                    <div>
                      {w.question.lead && (
                        <p className="cs-workwin__lead">
                          <RichText>{w.question.lead}</RichText>
                        </p>
                      )}
                      <p className="cs-workwin__q">
                        <RichText>{w.question.statement}</RichText>
                      </p>
                      {choices.length > 0 && (
                        <p className="cs-workwin__choices">
                          {choices.map((c) => (
                            <span key={c.letter}>
                              {c.letter}) <RichText>{c.content}</RichText>
                            </span>
                          ))}
                        </p>
                      )}
                      {!w.answered ? (
                        <p className="cs-workwin__none">{L.notAnswered}</p>
                      ) : (
                        <ul>
                          {w.tries.map((t, k) => {
                            const ok = isRight(t.outcome);
                            return (
                              <li
                                key={t.attemptNumber ?? k}
                                className={ok ? 'is-right' : 'is-redo'}
                                data-cs-work-try={ok ? 'right' : 'redo'}
                              >
                                <small>{w.tries.length > 1 ? L.try(k + 1) : L.wrote}</small>
                                <strong>
                                  <RichText>{String(formatStudentAnswer(w.question, t.answer, t.normalized))}</RichText>
                                </strong>
                                <em>
                                  {ok ? (
                                    <>
                                      <Check size={16} strokeWidth={3} /> {L.rightWord}
                                    </>
                                  ) : (
                                    <>
                                      <RotateCcw size={15} /> {L.retryWord}
                                    </>
                                  )}
                                </em>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                      {key.answer && (
                        <p className="cs-workwin__key">
                          <span>{L.expected}:</span> <RichText>{key.answer}</RichText>
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ClassTracking({ token, classId, lessonId }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(null);
  const [tick, setTick] = useState(0);
  const [work, setWork] = useState(null);
  useEffect(() => {
    let off = false;
    setError(null);
    fetchLessonTracking(token, classId, lessonId)
      .then((d) => !off && setData(d))
      .catch((e) => !off && setError(e.message));
    return () => {
      off = true;
    };
  }, [token, classId, lessonId, tick]);
  const points = data?.learningPoints ?? [];
  const students = useMemo(() => (data ? orderStudents(data.students, data.learningPoints) : []), [data]);
  const facts = useMemo(() => (data ? classFacts(data.students, data.learningPoints) : null), [data]);
  useEffect(() => {
    if (import.meta.env.DEV) window.__classTracking = { loaded: Boolean(data), order: students.map((s) => s.id), open };
  });
  if (error)
    return (
      <p className="cs-error" role="alert" data-cs-track-error>
        {error}
      </p>
    );
  if (!data) return <p className="cs-hint">{L.loading}</p>;
  if (students.length === 0) return <p className="cs-hint">{L.empty}</p>;
  return (
    <div className="cs-track" data-cs-track={students.length}>
      <header className="cs-track__facts">
        <span className="cs-chip">{L.students(facts.students)}</span>
        <span className="cs-chip" data-cs-track-notstarted={facts.notStarted}>
          {L.notStarted(facts.notStarted)}
        </span>
        <span className="cs-chip">{L.practising(facts.practising)}</span>
        <button type="button" className="cs-btn" onClick={() => setTick(tick + 1)} data-cs-track-refresh>
          <RefreshCw size={16} /> {L.refresh}
        </button>
      </header>
      {/* the class per الكفاءة: a bar of four counts, never a percentage */}
      <ul className="cs-track__points" data-cs-track-points={points.length}>
        {facts.perPoint.map((p, k) => (
          <li key={p.code}>
            <b>{k + 1}</b>
            <strong title={p.title}>{p.title}</strong>
            <span className="cs-track__bar" aria-hidden="true">
              {STATES.map(
                (s) =>
                  p.counts[s] > 0 && (
                    <i key={s} className={`is-${s}`} style={{ flexGrow: p.counts[s] }}>
                      {p.counts[s]}
                    </i>
                  ),
              )}
            </span>
            <small>
              {STATES.filter((s) => p.counts[s] > 0)
                .map((s) => `${STATE_LABEL[s]}: ${p.counts[s]}`)
                .join(' · ')}
            </small>
          </li>
        ))}
      </ul>
      <ol className="cs-track__list">
        {students.map((s) => {
          const f = s.facts;
          const isOpen = open === s.id;
          return (
            <li key={s.id} className={isOpen ? 'is-open' : ''} data-cs-track-student={s.id}>
              <button
                type="button"
                className="cs-track__row"
                onClick={() => setOpen(isOpen ? null : s.id)}
                aria-expanded={isOpen}
              >
                <strong>
                  {callName(s)} <span>{s.lastName}</span>
                </strong>
                <span className="cs-track__dots" aria-label={L.points}>
                  {f.states.map((st, k) => (
                    <i key={points[k].code} className={`is-${st}`} title={`${points[k].title}: ${STATE_LABEL[st]}`}>
                      {k + 1}
                    </i>
                  ))}
                </span>
                <span className="cs-track__ex">
                  {f.exercises === 0 ? (
                    <em>{f.started ? L.noExercise : L.none}</em>
                  ) : (
                    <>
                      {L.did(f.exercises)} · {L.right}{' '}
                      <b dir="ltr">
                        {f.correct}
                        {NB}
                        {f.answered}
                      </b>
                    </>
                  )}
                </span>
                <ChevronDown size={18} className="cs-track__chev" />
              </button>
              {isOpen && (
                <div className="cs-track__detail" data-cs-track-detail>
                  <ul>
                    {points.map((p, k) => (
                      <li key={p.code}>
                        <i className={`is-${f.states[k]}`}>{k + 1}</i>
                        <span>{p.title}</span>
                        <em className={`is-${f.states[k]}`}>{STATE_LABEL[f.states[k]]}</em>
                      </li>
                    ))}
                  </ul>
                  {f.exercises === 0 ? (
                    <p className="cs-hint">{L.noExercise}</p>
                  ) : (
                    <ul>
                      {exercisesOf(s).map((e) => (
                        <li key={e.exerciseId} data-cs-track-exercise={e.exerciseId}>
                          <button
                            type="button"
                            className="cs-track__see"
                            onClick={() => setWork({ student: s, exerciseId: e.exerciseId, level: e.level })}
                            title={L.see}
                            data-cs-track-see
                          >
                            <Eye size={16} /> {exerciseLabel(e.exerciseId)}
                          </button>
                          <em className={e.missed === 0 ? 'is-mastered' : 'is-reinforce'}>
                            {L.right}{' '}
                            <b dir="ltr">
                              {e.correct}
                              {NB}
                              {e.answered}
                            </b>{' '}
                            · {L.first} <b dir="ltr">{e.firstTry}</b>
                            {e.missed > 0 ? ` · ${L.left(e.missed)}` : ''}
                          </em>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <p className="cs-hint">{L.note}</p>
      {work && (
        <StudentWork
          token={token}
          lessonId={lessonId}
          student={work.student}
          exerciseId={work.exerciseId}
          level={work.level}
          onClose={() => setWork(null)}
        />
      )}
    </div>
  );
}
