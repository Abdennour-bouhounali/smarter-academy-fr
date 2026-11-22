/**
 * Two tools of a lesson shown INSIDE the teacher's space, under the header common to all of them (owner, 2026-11-18:
 * « the top header must have the same width, style and position of buttons in all these tools, unless the full-screen
 * mode is activated »; CLASS_SESSION.md §2):
 *   LessonTrackingPage   « متابعة القسم » — the class on this lesson, student by student;
 *   LessonCardPage       « بطاقة المعارف » — the lesson's knowledge, one piece per screen; « ملء الشاشة » is the computer's real
 *                        full screen (browser tabs and bars hidden); Esc or ✕ comes back under the header.
 */
import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getLessonById, getLessonPath } from '@smarter-academy/core';
import { AuthContext } from '../../context/AuthContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { fetchClassGroups } from '../../services/teacher/classGroupService';
import { LessonToolPage } from '../../features/classSession/LessonToolsBar';
import ClassTracking from '../../features/classSession/ClassTracking';
import { BoardLessonContext } from '../../features/classSession/board';
import { hasLab } from '../../lessons/common/lessonlab/registry';
import KnowledgeBoard from '../../features/classSession/KnowledgeBoard';
import { loadKnowledgeCards, earlierLessons } from '../../features/classSession/knowledgeCards';
import '../../features/classSession/classSession.css';

const L = {
  track: 'متابعة القسم',
  pick: 'مع أيّ قسم؟',
  none: 'لا قسم نشط بعد: أنشئ قسمًا من «أقسامي».',
  loading: 'جارٍ التحميل…',
  card: 'بطاقة المعارف',
  noCard: 'لا بطاقة معارف لهذا الدرس بعد.',
};

export function LessonTrackingPage() {
  const { lessonId } = useParams();
  const { token } = useContext(AuthContext);
  const [params, setParams] = useSearchParams();
  const lesson = getLessonById(lessonId);
  useDocumentMeta(`${L.track} — ${lesson?.title ?? ''}`);
  const [classes, setClasses] = useState(null);
  const classId = Number(params.get('classe')) || null;
  useEffect(() => {
    if (!token) return;
    fetchClassGroups(token)
      .then((d) => {
        const active = d.classrooms.filter((c) => c.status === 'active');
        setClasses(active);
        if (!classId && active.length >= 1) setParams({ classe: String(active[0].id) }, { replace: true });
      })
      .catch(() => setClasses([]));
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <LessonToolPage lessonId={lessonId} active="track">
      <div className="ltp__tool">
        <h1>{L.track}</h1>
        {classes && classes.length > 1 && (
          <span className="flex flex-wrap gap-2" data-track-classes>
            {classes.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`ltp__btn ${c.id === classId ? 'is-on' : ''}`}
                onClick={() => setParams({ classe: String(c.id) })}
                data-track-class={c.id}
              >
                {c.name}
              </button>
            ))}
          </span>
        )}
      </div>
      {!classes ? (
        <p className="text-sm font-bold text-slate-500">{L.loading}</p>
      ) : classes.length === 0 ? (
        <p className="text-sm font-bold text-slate-500">{L.none}</p>
      ) : (
        classId && (
          <div className="cs-root cs-embed cs-embed--track" dir="rtl" data-cs-track-screen>
            <ClassTracking key={classId} token={token} classId={classId} lessonId={lessonId} />
          </div>
        )
      )}
    </LessonToolPage>
  );
}

export function LessonCardPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const lesson = getLessonById(lessonId);
  useDocumentMeta(`${L.card} — ${lesson?.title ?? ''}`);
  const boardLesson = useMemo(
    () => (hasLab(lessonId) ? { code: lessonId, title: lesson?.title ?? '' } : null),
    [lessonId, lesson?.title],
  );
  const [cards, setCards] = useState(null);
  const links = useMemo(() => earlierLessons(lessonId), [lessonId]);
  // « ملء الشاشة » is the REAL full screen of the computer (owner, 2026-11-18): the browser's tabs and bars go too. The whole
  // document is put full screen (not the card alone) so what the board opens beside it — the lab — stays visible.
  const [full, setFull] = useState(false);
  const goFull = () => {
    setFull(true);
    document.documentElement.requestFullscreen?.().catch(() => {});
  };
  const leaveFull = () => {
    setFull(false);
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
  };
  useEffect(() => {
    const sync = () => {
      if (!document.fullscreenElement) setFull(false);
    };
    document.addEventListener('fullscreenchange', sync);
    return () => {
      document.removeEventListener('fullscreenchange', sync);
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    };
  }, []);
  useEffect(() => {
    loadKnowledgeCards(lessonId)
      .then(setCards)
      .catch(() => setCards([]));
  }, [lessonId]);
  return (
    <LessonToolPage lessonId={lessonId} active="card">
      {!cards ? (
        <p className="text-sm font-bold text-slate-500">{L.loading}</p>
      ) : cards.length === 0 ? (
        <p className="text-sm font-bold text-slate-500">{L.noCard}</p>
      ) : (
        <div
          className={`cs-root cs-embed cs-embed--board ${full ? 'is-full' : ''}`}
          dir="rtl"
          data-card-stage={full ? 'full' : 'page'}
        >
          <BoardLessonContext.Provider value={boardLesson}>
            <KnowledgeBoard
              cards={cards}
              links={links}
              fullscreen={{ on: full, toggle: () => (full ? leaveFull() : goFull()) }}
              onExit={() => (full ? leaveFull() : navigate(getLessonPath(lessonId) ?? '/enseignant/cours'))}
            />
          </BoardLessonContext.Provider>
        </div>
      )}
    </LessonToolPage>
  );
}
