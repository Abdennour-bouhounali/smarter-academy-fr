import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, Armchair, ListChecks, Play, X } from 'lucide-react';
import { getLessonById, getLessonPath } from '@smarter-academy/core';
import {
  getItem,
  getLesson,
  homeLessonOf,
  toolsForLesson,
} from '@smarter-academy/core/curriculum/fr/net/learningNet.js';
import { FAMILIES } from '../../lessons/common/launchkit/families';
import { AuthContext } from '../../context/AuthContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { fetchClassGroups, fetchClassStudents } from '../../services/teacher/classGroupService';
import {
  fetchSeating,
  saveSeating,
  fetchClassTest,
  saveClassTest,
  resetClassTest,
  fetchClassSessions,
  sendSession,
  flushOutbox,
} from '../../services/teacher/classSessionService';
import { seatEveryone, teamsOf, toRecord, summarise } from '../../features/classSession/session';
import { SeatingMap, TestEditor, L as LS } from '../../features/classSession/SessionSetup';
import { Player, Result } from '../../features/classSession/SessionPlay';
import { hasLab } from '../../lessons/common/lessonlab/registry';
import { BoardLessonContext } from '../../features/classSession/board';
import RulesReview from '../../features/classSession/RulesReview';
import ExerciseBoard from '../../features/classSession/ExerciseBoard';
import ClassTracking from '../../features/classSession/ClassTracking';
import KnowledgeBoard from '../../features/classSession/KnowledgeBoard';
import { hasKnowledgeCards, loadKnowledgeCards, earlierLessons } from '../../features/classSession/knowledgeCards';
import { parseRef } from '../../features/classSession/exerciseBank';
import { teacherBankPath } from '../../features/practice/teacherBank';
import LessonBoard, { EMPTY_MEMO } from '../../features/classSession/LessonBoard';
import { reviewCards } from '../../features/classSession/lessonScripts';
import { usePackPart } from '../../lessons/lessonPack';
import { boardFit, ClassSessionSkeleton, ClassWorkSkeleton } from '../../features/classSession/TeacherSkeletons';
import '../../features/classSession/classSession.css';

const L = {
  title: 'حصّة القسم',
  pickClass: 'مع أيّ قسم تعمل؟',
  noClass: 'لا قسم نشط بعد: أنشئ قسمًا من «أقسامي».',
  students: (n) => `${n} تلميذًا`,
  seats: 'المقاعد',
  test: 'الاختبار',
  launch: 'ابدأ على السبّورة',
  start: 'اختبار البداية',
  end: 'اختبار النهاية',
  questions: (n) => (n === 1 ? 'سؤال واحد' : n === 2 ? 'سؤالان' : n <= 10 ? `${n} أسئلة` : `${n} سؤالًا`),
  noQuestions: 'لا سؤال',
  noStudents: 'هذا القسم بلا تلاميذ بعد.',
  last: 'آخر الحصص',
  none: 'لا حصّة مسجّلة لهذا الدرس بعد.',
  waiting: (n) => `${n} حصّة تنتظر عودة الاتّصال.`,
  loading: 'جارٍ التحميل…',
  close: 'إغلاق',
  noDefault: 'لا اختبار جاهز لهذا الدرس بعد: اكتب أسئلتك.',
  note: 'لا شيء في حصّة القسم يغيّر تقدّم أيّ تلميذ: هي لحظة للقسم كلّه.',
  change: 'غيّر القسم',
  backLesson: 'الدرس',
  noExercise: 'هذا التمرين غير موجود في بنك الدرس.',
  bank: 'بنك التمارين: تمرين على السبّورة، أو ورقة للقسم',
  trackTitle: 'متابعة القسم',
  cardBoard: 'بطاقة المعارف: مراجعة سريعة مع القسم',
  hour: 'مسار الحصّة',
  revise: 'مراجعة القواعد',
  rules: (n) => (n === 1 ? 'قاعدة واحدة' : n === 2 ? 'قاعدتان' : n <= 10 ? `${n} قواعد` : `${n} قاعدة`),
  noRules: 'لا قاعدة جاهزة لهذا الدرس بعد',
  board: 'الدرس على السبّورة',
  stations: (n) => `${n} محطّة: يجرّب، يستنتج، يسمّي`,
  resume: (k, n) => `نواصل من المحطّة ${k} من ${n}`,
  restart: 'من البداية',
  toRevise: 'مراجعة القواعد',
  toLesson: 'الدرس الجديد',
};
const MEMO_KEY = 'smarter_class_lesson_board';
/** The board's memory of the hour (step, the class's bridges, its rule): kept for this browser tab only, never sent. */
const loadMemo = (key) => {
  try {
    const saved = JSON.parse(sessionStorage.getItem(MEMO_KEY) ?? 'null');
    return saved?.key === key ? { ...EMPTY_MEMO, ...saved.memo } : EMPTY_MEMO;
  } catch {
    return EMPTY_MEMO;
  }
};
const saveMemo = (key, memo) => {
  try {
    sessionStorage.setItem(MEMO_KEY, JSON.stringify({ key, memo }));
  } catch {
    /* storage closed: the board keeps it while the page is open */
  }
};
const uuid = () =>
  crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`
        .replace(/[^0-9a-f]/g, '')
        .padEnd(32, '0')
        .replace(/^(.{8})(.{4})(.{4})(.{4})(.{12}).*$/, '$1-$2-4$3-a$4-$5')
        .slice(0, 36);
/** The name of a الكفاءة a teacher reads: the title of the lesson that teaches it. */
const itemLabel = (item) => (item ? (homeLessonOf(item)?.title ?? getItem(item)?.text ?? item) : '');

/**
 * « حصّة القسم » — the teacher's class session of ONE lesson (CLASS_SESSION.md): he chooses the class, prepares the
 * seating map and the test, then runs the test on the board; the result is saved without touching anyone's progress.
 * Full screen, outside the teacher shell; designed 1280 × 720 and zoomed to the window; nothing scrolls on the board.
 */
/** The page waits for the lesson's board script (its pack, a few milliseconds): the hour is planned around it — meanwhile
 * the skeleton of its set-up screen, never an empty page (BUNDLE_BOUNDARIES.md rule 12). */
export default function ClassSessionPage() {
  const { lessonId } = useParams();
  const script = usePackPart(lessonId, 'script');
  const world = usePackPart(lessonId, 'world'); // the lesson's own rule tablets: one wording for his world and for the board
  if (script === undefined || world === undefined) return <ClassSessionSkeleton />;
  return <ClassSession key={lessonId} lessonId={lessonId} script={script} rules={world?.rules ?? {}} />;
}

function ClassSession({ lessonId, script, rules }) {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const lesson = getLessonById(lessonId);
  useDocumentMeta(`${L.title} — ${lesson?.title ?? ''}`);
  const classId = Number(params.get('classe')) || null;
  const [classes, setClasses] = useState(null);
  const [students, setStudents] = useState(null);
  const [seating, setSeating] = useState(null);
  const [payload, setPayload] = useState(null);
  const [working, setWorking] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [recent, setRecent] = useState({ sessions: [], turns: {} });
  const [tab, setTab] = useState('seats');
  // « متابعة القسم » is its OWN screen (`?onglet=suivi`): the class on this lesson, nothing of the hour around it
  const tracking = params.get('onglet') === 'suivi';
  const [view, setView] = useState('setup');
  const [moment, setMoment] = useState('start');
  const [done, setDone] = useState(null);
  const [status, setStatus] = useState(null);
  const [waiting, setWaiting] = useState(0);
  const [error, setError] = useState(null);
  // the first paint is already at the window's fit, like the skeleton before it: nothing jumps when the page arrives
  const [z, setZ] = useState(() => boardFit(window.innerWidth, window.innerHeight).zoom);
  const [narrow, setNarrow] = useState(() => boardFit(window.innerWidth, window.innerHeight).narrow);
  const saveTimer = useRef(null);
  const lessonItems = useMemo(() => getLesson(lessonId)?.programmeItems ?? [], [lessonId]);
  // choosing the class keeps the rest of the address: `?moment=` (a door of the teacher's card) must survive it
  const pickClass = (id, replace = false) =>
    setParams(
      (p) => {
        const n = new URLSearchParams(p);
        n.set('classe', String(id));
        return n;
      },
      { replace },
    );
  // the lesson the board is about: what lets the dock open « مختبري » (only for a lesson whose lab has instruments)
  const boardLesson = useMemo(
    () => (hasLab(lessonId) ? { code: lessonId, title: lesson?.title ?? '' } : null),
    [lessonId, lesson?.title],
  );
  const memoKey = `${classId}:${lessonId}`;
  const [memo, setMemoRaw] = useState(EMPTY_MEMO);
  const [lastStart, setLastStart] = useState(null);
  const [readers, setReaders] = useState([]);
  useEffect(() => {
    setMemoRaw(loadMemo(memoKey));
    setLastStart(null);
    setReaders([]);
  }, [memoKey]);
  // the board's memory is written when it changes (never by an effect: a first render must not erase what the tab remembers)
  const setMemo = useCallback(
    (next) =>
      setMemoRaw((m) => {
        const v = typeof next === 'function' ? next(m) : next;
        saveMemo(memoKey, v);
        return v;
      }),
    [memoKey],
  );

  // two designs, so the board stays readable: 1280 × 720 for a wide screen, 1000 × 740 for a 4:3 one (a tablet, an old projector)
  useEffect(() => {
    const fit = () => {
      const { narrow: tight, zoom } = boardFit(window.innerWidth, window.innerHeight);
      setNarrow(tight);
      setZ(zoom);
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  useEffect(() => {
    if (!token) return;
    fetchClassGroups(token)
      .then((d) => {
        const active = d.classrooms.filter((c) => c.status === 'active');
        setClasses(active);
        if (!classId && active.length === 1) pickClass(active[0].id, true);
      })
      .catch((e) => setError(e.message));
    flushOutbox(token)
      .then(setWaiting)
      .catch(() => {});
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!token || !classId) return undefined;
    let off = false;
    setStudents(null);
    setError(null);
    Promise.all([
      fetchClassStudents(token, classId),
      fetchSeating(token, classId),
      fetchClassTest(token, lessonId),
      fetchClassSessions(token, classId, lessonId),
    ])
      .then(([roster, map, test, rec]) => {
        if (off) return;
        setStudents(roster);
        setSeating(seatEveryone(map, roster));
        setPayload(test);
        setWorking(
          test.mine
            ? { start: test.mine.start, end: test.mine.end }
            : { start: test.default?.start ?? [], end: test.default?.end ?? [] },
        );
        setDirty(false);
        setRecent(rec);
      })
      .catch((e) => !off && setError(e.message));
    return () => {
      off = true;
    };
  }, [token, classId, lessonId]);
  useEffect(() => {
    if (import.meta.env.DEV) window.__classSetup = { view, seating, working, payload, students, recent, status };
  });

  const changeSeating = (next) => {
    setSeating(next);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveSeating(token, classId, next).catch(() => {}), 700);
  };
  const saveTest = () => {
    setSaving(true);
    saveClassTest(token, lessonId, working)
      .then((t) => {
        setPayload(t);
        setDirty(false);
      })
      .catch((e) => setError(e.message))
      .finally(() => setSaving(false));
  };
  const resetTest = () =>
    resetClassTest(token, lessonId)
      .then((t) => {
        setPayload(t);
        setWorking({ start: t.default?.start ?? [], end: t.default?.end ?? [] });
        setDirty(false);
      })
      .catch((e) => setError(e.message));
  const begin = (m) => {
    clearTimeout(saveTimer.current);
    saveSeating(token, classId, seating).catch(() => {});
    setMoment(m);
    setDone(null);
    setStatus(null);
    setView('play');
  };
  const finish = async (parts) => {
    setDone(parts);
    setView('result');
    if (moment === 'start')
      setLastStart(
        summarise({ questions: working.start, answers: parts.answers, teams: teamsOf(seating, students) }).items,
      );
    const record = {
      uuid: uuid(),
      ...toRecord({
        classroomId: classId,
        lessonCode: lessonId,
        moment,
        questions: working[moment],
        answers: parts.answers,
        teams: teamsOf(seating, students),
        startedAt: parts.startedAt,
        finishedAt: parts.finishedAt,
        absent: parts.absent,
      }),
    };
    try {
      const res = await sendSession(token, classId, record);
      setStatus(res.queued ? 'queued' : 'saved');
      if (!res.queued)
        fetchClassSessions(token, classId, lessonId)
          .then(setRecent)
          .catch(() => {});
    } catch (e) {
      setError(e.message);
    }
  };
  const close = () => navigate(getLessonPath(lessonId) ?? '/enseignant');
  const klass = classes?.find((c) => c.id === classId) ?? null;
  const startItems = lastStart ?? recent.sessions.find((s) => s.moment === 'start')?.summary?.items ?? null;
  // the rules the lesson will USE: those of its earlier الكفاءات (the learning net), the one the class missed most first
  const cards = useMemo(() => reviewCards(toolsForLesson(lessonId), FAMILIES, startItems), [lessonId, startItems]);
  const afterStart = cards.length
    ? { id: 'revise', label: L.toRevise, go: () => setView('revise') }
    : script
      ? { id: 'lesson', label: L.toLesson, go: () => setView('lesson') }
      : null;
  // `?exercice=<level>:<id>`: an exercise of the teacher's bank on the board of the class (« على السبّورة »); leaving it goes back to the bank
  const exRef = parseRef(params.get('exercice'));
  const [exercise, setExercise] = useState(null);
  useEffect(() => {
    if (!exRef || !students) return undefined;
    let off = false;
    import('../../features/practice/practiceContent')
      .then((m) => m.loadExercise(lessonId, exRef.level, exRef.id))
      .then((ex) => {
        if (off) return;
        if (ex) {
          setExercise(ex);
          setView('exercise');
        } else setError(L.noExercise);
      })
      .catch((e) => !off && setError(e.message));
    return () => {
      off = true;
    };
  }, [exRef?.level, exRef?.id, Boolean(students), lessonId]); // eslint-disable-line react-hooks/exhaustive-deps
  // `?carte=1`: « بطاقة المعارف » of the lesson on the board, for a quick revision with the whole class
  const [kcards, setKcards] = useState(null);
  const klinks = useMemo(() => earlierLessons(lessonId), [lessonId]);
  const openCards = () => {
    if (!hasKnowledgeCards(lessonId)) return;
    if (kcards) {
      setView('card');
      return;
    }
    loadKnowledgeCards(lessonId)
      .then((c) => {
        if (c.length) {
          setKcards(c);
          setView('card');
        }
      })
      .catch((e) => setError(e.message));
  };
  // the card needs NO class: it is shown to the class, nobody is named on it — it opens at once, before any class is chosen
  const cardAsked = useRef(false);
  const cardFromLink = useRef(false);
  useEffect(() => {
    if (params.get('carte') && !cardAsked.current) {
      cardAsked.current = true;
      cardFromLink.current = true;
      openCards();
    }
  });
  // `?moment=start|revise|lesson|end`: the teacher's card on the lesson page opens the hour directly on one moment — once
  // the class is loaded; a moment that does not exist for this lesson simply leaves him on the set-up screen
  const asked = useRef(false);
  useEffect(() => {
    const m = params.get('moment');
    if (!m || asked.current || !students || !working || !seating) return;
    asked.current = true;
    setParams(
      (p) => {
        const n = new URLSearchParams(p);
        n.delete('moment');
        return n;
      },
      { replace: true },
    );
    if (students.length === 0) return;
    if ((m === 'start' || m === 'end') && working[m].length) begin(m);
    else if (m === 'revise' && cards.length) setView('revise');
    else if (m === 'lesson' && script) setView('lesson');
  }); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (import.meta.env.DEV) window.__classHour = { view, memo, cards: cards.length, script: Boolean(script) };
  });

  return (
    <div
      className={`cs-root ${narrow ? 'cs-root--narrow' : ''}`}
      dir="rtl"
      data-class-session={lessonId}
      data-cs-view={view}
    >
      <BoardLessonContext.Provider value={boardLesson}>
        <div className="cs-fit" style={{ zoom: z }}>
          {view === 'play' && students && (
            <Player
              students={students}
              seating={seating}
              questions={working[moment]}
              moment={moment}
              turns={recent.turns ?? {}}
              onFinish={finish}
              onExit={() => setView('setup')}
            />
          )}
          {view === 'result' && done && (
            <Result
              students={students}
              seating={seating}
              questions={working[moment]}
              answers={done.answers}
              moment={moment}
              startItems={startItems}
              lessonItems={lessonItems}
              itemLabel={itemLabel}
              status={status}
              onBack={() => setView('setup')}
              onClose={close}
              next={moment === 'start' ? afterStart : null}
            />
          )}
          {view === 'revise' && students && cards.length > 0 && (
            <RulesReview
              cards={cards}
              students={students}
              seating={seating}
              readers={readers}
              onReader={(id) => setReaders((r) => (r.includes(id) ? r : [...r, id]))}
              onLesson={() => setView(script ? 'lesson' : 'setup')}
              onExit={() => setView('setup')}
            />
          )}
          {view === 'exercise' && students && exercise && (
            <ExerciseBoard
              key={exercise.id}
              exercise={exercise}
              students={students}
              seating={seating}
              readers={readers}
              onReader={(id) => setReaders((r) => (r.includes(id) ? r : [...r, id]))}
              onExit={() => navigate(teacherBankPath(lessonId))}
            />
          )}
          {view === 'card' && kcards && (
            <KnowledgeBoard
              cards={kcards}
              links={klinks}
              onExit={() => (cardFromLink.current ? close() : setView('setup'))}
            />
          )}
          {view === 'lesson' && students && script && (
            <LessonBoard
              script={script}
              rules={rules}
              students={students}
              seating={seating}
              memo={memo}
              setMemo={setMemo}
              onEndTest={() => (working.end.length ? begin('end') : setView('setup'))}
              onExit={() => setView('setup')}
            />
          )}
          {view === 'setup' && (
            <div className="cs-setup">
              <header className="cs-head">
                <div className="cs-brand">
                  <i>{tracking ? '📋' : '🏫'}</i>
                  <div>
                    <h1>{tracking ? L.trackTitle : L.title}</h1>
                    <p>
                      {lesson?.title}
                      {klass ? ` · ${klass.name}` : ''}
                    </p>
                  </div>
                </div>
                {classId && classes && classes.length > 1 && (
                  <button
                    type="button"
                    className="cs-btn"
                    onClick={() => setParams(tracking ? { onglet: 'suivi' } : {})}
                    data-cs-change-class
                  >
                    {L.change}
                  </button>
                )}
                <button type="button" className="cs-icon" onClick={close} aria-label={L.close} data-cs-close-setup>
                  <X size={22} />
                </button>
              </header>
              {error && (
                <p className="cs-error" role="alert">
                  {error}
                </p>
              )}
              {!classId && (
                <section className="cs-pick" data-cs-pick>
                  <h2>{L.pickClass}</h2>
                  {!classes ? (
                    <p className="cs-hint">{L.loading}</p>
                  ) : classes.length === 0 ? (
                    <p className="cs-hint">{L.noClass}</p>
                  ) : (
                    <div>
                      {classes.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          className="cs-classcard"
                          onClick={() => pickClass(c.id)}
                          data-cs-class={c.id}
                        >
                          <strong>{c.name}</strong>
                        </button>
                      ))}
                    </div>
                  )}
                </section>
              )}
              {/* the class's roster, seats, test and last sessions are on their way: the set-up screen's shape, not a line */}
              {classId && !students && !error && <ClassWorkSkeleton />}
              {classId && students && tracking && (
                <section className="cs-pane cs-pane--track" data-cs-track-screen>
                  <ClassTracking token={token} classId={classId} lessonId={lessonId} />
                </section>
              )}
              {classId && students && working && !tracking && (
                <div className="cs-work">
                  <section className="cs-pane">
                    <div className="cs-tabs" role="tablist">
                      <button
                        type="button"
                        role="tab"
                        aria-selected={tab === 'seats'}
                        className={tab === 'seats' ? 'is-on' : ''}
                        onClick={() => setTab('seats')}
                        data-cs-tab="seats"
                      >
                        <Armchair size={18} /> {L.seats} <small>{L.students(students.length)}</small>
                      </button>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={tab === 'test'}
                        className={tab === 'test' ? 'is-on' : ''}
                        onClick={() => setTab('test')}
                        data-cs-tab="test"
                      >
                        <ListChecks size={18} /> {L.test}
                      </button>
                    </div>
                    {students.length === 0 ? (
                      <p className="cs-hint">{L.noStudents}</p>
                    ) : tab === 'seats' ? (
                      <SeatingMap students={students} seating={seating} onChange={changeSeating} />
                    ) : (
                      <>
                        {!payload.default && !payload.mine && <p className="cs-hint">{L.noDefault}</p>}
                        <TestEditor
                          payload={payload}
                          working={working}
                          dirty={dirty}
                          saving={saving}
                          onChange={(w) => {
                            setWorking(w);
                            setDirty(true);
                          }}
                          onSave={saveTest}
                          onReset={resetTest}
                          itemLabel={itemLabel}
                        />
                      </>
                    )}
                  </section>
                  <aside className="cs-launch" data-cs-launch>
                    <h2>
                      <Play size={20} /> {L.hour}
                    </h2>
                    {/* the hour as a script of four moments; each can be opened alone — the teacher is the one who decides */}
                    <ol className="cs-hour" data-cs-hour>
                      <li>
                        <button
                          type="button"
                          className="cs-startbtn"
                          onClick={() => begin('start')}
                          disabled={working.start.length === 0 || students.length === 0}
                          data-cs-begin="start"
                        >
                          <b>1</b>
                          <strong>{L.start}</strong>
                          <small>{working.start.length ? L.questions(working.start.length) : L.noQuestions}</small>
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          className="cs-startbtn"
                          onClick={() => setView('revise')}
                          disabled={cards.length === 0 || students.length === 0}
                          data-cs-open="revise"
                        >
                          <b>2</b>
                          <strong>{L.revise}</strong>
                          <small>{cards.length ? L.rules(cards.length) : L.noRules}</small>
                        </button>
                      </li>
                      {script && (
                        <li>
                          <button
                            type="button"
                            className="cs-startbtn"
                            onClick={() => setView('lesson')}
                            disabled={students.length === 0}
                            data-cs-open="lesson"
                          >
                            <b>3</b>
                            <strong>{L.board}</strong>
                            <small>
                              {memo.step > 0
                                ? L.resume(memo.step + 1, script.steps.length)
                                : L.stations(script.steps.length)}
                            </small>
                          </button>
                          {memo.step > 0 && (
                            <button
                              type="button"
                              className="cs-link"
                              onClick={() => setMemo(EMPTY_MEMO)}
                              data-cs-lesson-restart
                            >
                              {L.restart}
                            </button>
                          )}
                        </li>
                      )}
                      <li>
                        <button
                          type="button"
                          className="cs-startbtn"
                          onClick={() => begin('end')}
                          disabled={working.end.length === 0 || students.length === 0}
                          data-cs-begin="end"
                        >
                          <b>{script ? 4 : 3}</b>
                          <strong>{L.end}</strong>
                          <small>{working.end.length ? L.questions(working.end.length) : L.noQuestions}</small>
                        </button>
                      </li>
                    </ol>
                    {hasKnowledgeCards(lessonId) && (
                      <button
                        type="button"
                        className="cs-link"
                        onClick={openCards}
                        disabled={students.length === 0}
                        data-cs-bank
                        data-cs-open="card"
                      >
                        {L.cardBoard}
                      </button>
                    )}
                    <button
                      type="button"
                      className="cs-link"
                      onClick={() => navigate(teacherBankPath(lessonId))}
                      data-cs-bank
                    >
                      {L.bank}
                    </button>
                    <p className="cs-hint">{L.note}</p>
                    <h3>{L.last}</h3>
                    {recent.sessions.length === 0 ? (
                      <p className="cs-hint">{L.none}</p>
                    ) : (
                      <ul className="cs-recent" data-cs-recent>
                        {recent.sessions.slice(0, 2).map((s) => (
                          <li key={s.uuid}>
                            <span>{s.moment === 'start' ? LS.start : LS.end}</span>
                            <time dir="ltr">{String(s.finishedAt ?? '').slice(0, 10)}</time>
                            <b dir="ltr">
                              {s.summary.right}
                              {'\u00a0/\u00a0'}
                              {s.summary.total}
                            </b>
                          </li>
                        ))}
                      </ul>
                    )}
                    {waiting > 0 && (
                      <p className="cs-state is-dirty" data-cs-waiting={waiting}>
                        {L.waiting(waiting)}
                      </p>
                    )}
                    <button type="button" className="cs-link" onClick={close}>
                      <ArrowRight size={16} /> {L.backLesson}
                    </button>
                  </aside>
                </div>
              )}
            </div>
          )}
        </div>
      </BoardLessonContext.Provider>
    </div>
  );
}
