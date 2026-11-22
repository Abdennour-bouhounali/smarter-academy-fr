import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ClipboardList, GraduationCap, NotebookPen, Printer, BookOpen } from 'lucide-react';
import { getLessonById, getUnitOfLesson } from '@smarter-academy/core';
import { isLessonBuilt, loadLessonConfig } from '../../lessons/registry';
import { useContentAvailability } from '../../context/ContentAvailabilityContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { ArrowBack } from '../../components/common/DirectionalIcons';
import { Loading, ErrorBox } from './teacherUi';
import { buildLessonMemo } from '../../features/teacher/lessonMemo/buildLessonMemo';
import { loadLessonMemoSources } from '../../features/teacher/lessonMemo/loadLessonMemoSources';
import { classDoor, TEACHER_COURSES_PATH } from '../../features/teacher/lessonMemo/memoRoutes';
import { hasClassBoard } from '../../features/classSession/boardLessons';
import { hasBoardMemo } from '../../features/classSession/lessonMemos';
import { usePackPart } from '../../lessons/lessonPack';
import {
  MemoOverview, MemoObjectives, MemoStart, MemoTimeline, MemoExamples, MemoErrors,
  MemoDifferentiation, MemoTrace, MemoEvaluation, MemoNext,
} from '../../features/teacher/lessonMemo/MemoSections';
import MemoNotes from '../../features/teacher/lessonMemo/MemoNotes';
import '../../features/teacher/lessonMemo/memo.css';
import MathLabel from '../../lessons/common/components/MathLabel';

/**
 * « la fiche du professeur » — /enseignant/cours/:lessonId/memoire.
 *
 * Le document d'ORCHESTRATION d'une séance : une seule page continue, qu'on
 * garde ouverte pendant toute la classe. Rien n'y est écrit à la main : le
 * modèle est construit par buildLessonMemo à partir du catalogue, de
 * lesson.config.js et du contenu de la leçon ; seules les notes (« Mon cahier »)
 * appartiennent à l'enseignant, et elles vivent dans son cahier.
 *
 * Portes : la route est sous ProtectedRoute(teacher) — un élève, un visiteur
 * ou un administrateur n'y entre pas, même par l'URL. La page refuse en plus
 * une leçon inconnue, non construite ou fermée par l'administration. Les
 * notes sont servies par le serveur au seul propriétaire.
 *
 * Le namespace `memo` est chargé à la demande : la <Suspense> est ici.
 */
export default function LessonMemoPage() {
  return (
    <Suspense fallback={<Loading />}>
      <LessonMemo />
    </Suspense>
  );
}

const BoardMemo = lazy(() => import('../../features/classSession/BoardMemo'));

/** The parts of the memo in the order of a teacher's hour: before it, during it, after it — then his own notes. */
/** A group's name is `memo › rail.<id>`. */
const MEMO_GROUPS = [
  { id: 'before', keys: ['overview', 'objectives', 'start'] },
  { id: 'during', keys: ['timeline', 'examples', 'errors', 'differentiation'] },
  { id: 'after', keys: ['trace', 'evaluation', 'next'] },
  { id: 'mine', keys: ['notes'] },
];

/** Les ancres de la barre : seulement les sections que la leçon remplit. */
function sectionsOf(memo) {
  const d = memo.differentiation;
  const hasTier = ['support', 'core', 'extension'].some((k) => d[k].exercises.length + d[k].manipulations.length > 0);
  const e = memo.evaluation;
  return [
    ['overview', true],
    ['objectives', true],
    ['start', !!memo.start],
    ['timeline', memo.phases.length > 0],
    ['examples', memo.examples.length > 0],
    ['errors', true],
    ['differentiation', hasTier],
    ['trace', !!memo.trace.observation || memo.trace.bricks.length > 0],
    ['evaluation', !!e.phase || e.oral.length > 0 || e.indicators.length > 0 || !!e.exitTicket],
    ['next', true],
    ['notes', true],
  ].filter(([, shown]) => shown).map(([key]) => key);
}

function LessonMemo() {
  const { t } = useTranslation('memo');
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLessonClosed } = useContentAvailability();

  const lesson = getLessonById(lessonId);
  // Construite ? — l'index léger. La config complète arrive avec le contenu de la leçon (ci-dessous).
  const available = !!lesson && isLessonBuilt(lessonId) && lesson.status === 'available' && !isLessonClosed(lessonId);
  useDocumentMeta(t('metaTitle', { title: lesson?.title ?? '' }), t('subtitle'));

  const boardMemo = usePackPart(lessonId, 'memo'); // the WRITTEN memo of a lesson that has its board, from its pack
  const [sources, setSources] = useState(null);
  const [config, setConfig] = useState(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!available) return undefined;
    let alive = true;
    setSources(null);
    setError(false);
    Promise.all([loadLessonMemoSources(lessonId), loadLessonConfig(lessonId)]).then(
      ([s, c]) => { if (!alive) return; if (!c) { setError(true); return; } setConfig(c); setSources(s); },
      () => { if (alive) setError(true); },
    );
    return () => { alive = false; };
  }, [lessonId, available, attempt]);

  const memo = useMemo(() => {
    if (!available || !sources || config?.id !== lessonId) return null;
    const unit = getUnitOfLesson(lessonId);
    const unitLessons = unit ? [...unit.lessons, ...(unit.synthesis ? [unit.synthesis] : [])] : [];
    return buildLessonMemo({ lesson, config, unit, ...sources, lessonById: getLessonById, unitLessons });
  }, [available, sources, lessonId, lesson, config]);

  // « Retour » ramène au contexte d'où l'on vient (la page d'unité, le
  // catalogue…) ; sans historique dans l'application, au catalogue.
  const goBack = () => {
    const from = location.state?.from;
    if (typeof from === 'string' && from.startsWith('/')) navigate(from);
    else if ((window.history.state?.idx ?? 0) > 0) navigate(-1);
    else navigate(TEACHER_COURSES_PATH);
  };

  // ONE part of the memo on screen at a time; `#memo-<part>` and `#memo-phase-<n>` (the links of the page) choose it.
  // The part he was reading comes back after a reload or a return from the lesson (kept for the browser tab, per lesson).
  const partKey = `smarter_memo_part_${lessonId}`;
  const [view, setViewRaw] = useState(() => { try { return sessionStorage.getItem(partKey) || 'overview'; } catch { return 'overview'; } }); const [phase, setPhase] = useState(null);
  const setView = (key) => { setViewRaw(key); try { sessionStorage.setItem(partKey, key); } catch { /* storage closed: the memo opens on its first part */ } };
  const go = (key) => { if (!key) return; setView(key); if (key === 'timeline' && phase === null && memo?.phases?.[0]) setPhase(memo.phases[0].number); window.scrollTo({ top: 0 }); };
  useEffect(() => {
    const read = () => { const h = window.location.hash.replace('#memo-', ''); if (!window.location.hash.startsWith('#memo-')) return; const m = /^phase-(\d+)$/.exec(h); if (m) { setView('timeline'); setPhase(Number(m[1])); } else if (h) setView(h); };
    read(); window.addEventListener('hashchange', read); return () => window.removeEventListener('hashchange', read);
  }, []);

  // A lesson that has its board has a WRITTEN memo (lessonMemos.js), on its own page; the others keep the derived one below.
  if (available && hasBoardMemo(lessonId)) return boardMemo ? <Suspense fallback={null}><BoardMemo lessonId={lessonId} memo={boardMemo} /></Suspense> : null;

  if (!available) {
    return (
      <div className="sa-page py-10">
        <div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center" data-memo-not-found>
          <ClipboardList className="mx-auto mb-3 h-8 w-8 text-slate-300" aria-hidden="true" />
          <h1 className="font-space text-xl font-bold text-slate-800">{t('notFoundTitle')}</h1>
          <p className="mt-2 text-sm text-slate-500">{t('notFoundBody')}</p>
          <Link to={TEACHER_COURSES_PATH} className="mt-5 inline-flex min-h-[44px] items-center rounded-xl bg-nav-accent px-4 text-sm font-bold text-white hover:bg-[#3350c4]">{t('backToCourses')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="sa-surface-plain sa-page sa-page--flush sa-memo py-4 sm:py-6" data-lesson-memo={lessonId}>
      {/* La barre collante : retour, où l'on est, et les deux gestes de la séance. */}
      <div className="sa-memo-toolbar sticky top-14 z-30 -mx-4 mb-5 border-b border-slate-200 bg-[#FAFAFA]/95 px-4 py-2 backdrop-blur md:top-0 sm:mx-0 sm:rounded-b-2xl" data-memo-toolbar>
        <div className="flex items-center gap-2">
          <button type="button" onClick={goBack} aria-label={t('backAria')} className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-nav-accent" data-memo-back>
            <ArrowBack className="h-4 w-4" aria-hidden="true" /> <span className="hidden sm:inline">{t('back')}</span>
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-extrabold text-nav-accent">{t('title')}</p>
            <p className="truncate text-sm font-bold text-slate-900"><MathLabel>{lesson.title}</MathLabel></p>
          </div>
          <a href="#memo-notes" className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-xl border-2 border-amber-200 bg-amber-50 px-3 text-sm font-bold text-amber-900 hover:border-amber-300" title={t('notes.title')}>
            <NotebookPen className="h-4 w-4" aria-hidden="true" /> <span className="hidden md:inline">{t('notesJump')}</span>
          </a>
          <button type="button" onClick={() => window.print()} aria-label={t('printAria')} title={t('print')} className="hidden min-h-[44px] shrink-0 items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 hover:border-slate-300 sm:inline-flex">
            <Printer className="h-4 w-4" aria-hidden="true" /> <span className="hidden lg:inline">{t('print')}</span>
          </button>
          <Link to={lesson.path} className="hidden min-h-[44px] shrink-0 items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 hover:border-slate-300 md:inline-flex">
            <BookOpen className="h-4 w-4" aria-hidden="true" /> <span className="hidden xl:inline">{t('openLesson')}</span>
          </Link>
          <Link to={classDoor(lesson.id, lesson.path).to} state={classDoor(lesson.id, lesson.path).state} aria-label={t(hasClassBoard(lesson.id) ? 'sessionAria' : 'classroomAria')} data-memo-door={hasClassBoard(lesson.id) ? 'session' : 'classroom'}className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-xl border-2 border-nav-accent bg-nav-accent px-3 text-sm font-extrabold text-white hover:bg-[#3350c4] focus:outline-none focus-visible:ring-2 focus-visible:ring-nav-accent focus-visible:ring-offset-2" data-memo-classroom>
            <GraduationCap className="h-4 w-4" aria-hidden="true" /> <span className="hidden sm:inline">{t(hasClassBoard(lesson.id) ? 'session' : 'classroom')}</span>
          </Link>
        </div>
      </div>

      {error && <ErrorBox message={t('loadError')} onRetry={() => setAttempt((n) => n + 1)} />}
      {!memo && !error && <Loading label={t('loading')} />}

      {memo && (() => {
        const keys = sectionsOf(memo); const all = view === 'all'; const at = keys.indexOf(view); const pane = (key) => ({ hidden: !all && view !== key, 'data-memo-pane': key });
        return (
          <div className="sa-memo-work" data-memo-view={view}>
            {/* The memo is read ONE part at a time (owner, 2026-11-18: « too heavy… tired from scrolling »): the rail says
                where each thing is, in the order of a teacher's hour; the page shows only what he asked for. */}
            <nav className="sa-memo-rail sa-memo-no-print" aria-label={t('nav.label')} data-memo-rail>
              {MEMO_GROUPS.map((g) => { const mine = g.keys.filter((k) => keys.includes(k)); return mine.length === 0 ? null : (
                <div key={g.id}><p>{t(`rail.${g.id}`)}</p>{mine.map((k) => <button key={k} type="button" className={view === k ? 'is-on' : ''} onClick={() => go(k)} aria-current={view === k ? 'page' : undefined} data-memo-go={k}>{t(`nav.${k}`)}</button>)}</div>
              ); })}
              <button type="button" className={`sa-memo-rail__all ${all ? 'is-on' : ''}`} onClick={() => go('all')} data-memo-go="all">{t('rail.all')}</button>
            </nav>
            <div className="sa-memo-stage space-y-5">
              {/* the hour, one phase at a time: the frieze of the timeline is its own tab bar */}
              {!all && view === 'timeline' && memo.phases.length > 1 && (
                <div className="sa-memo-phases sa-memo-no-print" data-memo-phase-tabs>
                  {memo.phases.map((p) => <button key={p.number} type="button" className={phase === p.number ? 'is-on' : ''} onClick={() => setPhase(p.number)} data-memo-phase-tab={p.number}><b>{p.index}</b>{p.minutes != null ? ` · ${p.minutes}′` : ''}</button>)}
                  <button type="button" className={phase === null ? 'is-on' : ''} onClick={() => setPhase(null)} data-memo-phase-tab="all">{t('rail.allPhases')}</button>
                  {phase !== null && <style>{`@media screen { [data-memo-timeline] > li:not([data-memo-phase="${phase}"]) { display: none; } }`}</style>}
                </div>
              )}
              <div {...pane('overview')}><MemoOverview header={memo.header} /></div>
              <div {...pane('objectives')}><MemoObjectives objectives={memo.objectives} prerequisites={memo.prerequisites} /></div>
              <div {...pane('start')}><MemoStart start={memo.start} /></div>
              <div {...pane('timeline')}><MemoTimeline phases={memo.phases} /></div>
              <div {...pane('examples')}><MemoExamples examples={memo.examples} /></div>
              <div {...pane('errors')}><MemoErrors errors={memo.errors} /></div>
              <div {...pane('differentiation')}><MemoDifferentiation differentiation={memo.differentiation} /></div>
              <div {...pane('trace')}><MemoTrace trace={memo.trace} /></div>
              <div {...pane('evaluation')}><MemoEvaluation evaluation={memo.evaluation} /></div>
              <div {...pane('next')}><MemoNext next={memo.next} /></div>
              <div {...pane('notes')}><MemoNotes lessonId={lessonId} /></div>
              {!all && (
                <div className="sa-memo-step sa-memo-no-print">
                  <button type="button" onClick={() => go(keys[at - 1])} disabled={at <= 0} data-memo-prev>{t('rail.prev')}{at > 0 ? `\u00a0: ${t(`nav.${keys[at - 1]}`)}` : ''}</button>
                  <span>{at + 1}{'\u00a0/\u00a0'}{keys.length}</span>
                  <button type="button" className="is-main" onClick={() => go(keys[at + 1])} disabled={at < 0 || at >= keys.length - 1} data-memo-next>{at < keys.length - 1 ? `${t('rail.next')}\u00a0: ${t(`nav.${keys[at + 1]}`)}` : t('rail.next')}</button>
                </div>
              )}
              <p className="px-2 pb-6 text-center text-xs text-slate-400">{t('derivedNote')}</p>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
