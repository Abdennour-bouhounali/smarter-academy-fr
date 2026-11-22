import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen, Compass, Wand2, ListChecks, Landmark, Lock, ChevronDown, Flag } from 'lucide-react';
import { getUnitById, getLessonById, formatTextbookPages } from '@smarter-academy/core';
import { getLessonProgress } from '../lessons/common/utils/progress/getLessonProgress';
import { getTotalModules, isLessonBuilt } from '../lessons/registry';
import { useLessonConfig } from '../lessons/useLessonConfig';
import { useLearningProfile } from '../lessons/common/hooks/useLearningProfile';
import { useLessonChromeLayout } from '../lessons/common/hooks/useLessonChrome';
import { resolveMasteryState, masteryTooltip } from '../lessons/common/components/LearningPointMastery';
import { useContentAvailability } from '../context/ContentAvailabilityContext';
import { ArrowForward } from '../components/common/DirectionalIcons';
import { usePrefetchLessonRuntime, usePrefetchWorlds } from '../lessons/common/lessonRuntimeLoader';
import { useLearningViewer } from '../features/learning/learningViewer';
import { LessonModuleChips, TeacherLessonActions } from '../components/teacher/TeacherLessonActions';
import MathLabel from '../lessons/common/components/MathLabel';
import PublicationBadge from '../components/content/PublicationBadge';
import PrerequisiteLessonChips from '../lessons/common/components/PrerequisiteLessonChips';
import UnitOpenerFigure from './unit/UnitOpenerFigure';
import { useCatalogueHref } from '../components/student/catalogueLink';
import UnitMissionView from './unit/UnitMissionView';
import { unitMissionOf } from './unit/unitMissions';
import { StatusDot, ProgressLine, minutesOf, tileKind } from '../components/student/lessonTileParts';

/**
 * THE PAGE OF A UNIT (الوحدة) — the level between the ميدان and the درس.
 *
 * Short on purpose (owner, 2026-11-16: « small content »): the unit's name and how far it is, then ONE LINE per lesson
 * in the order of the progression — the synthesis « أدمج تعلّماتي » last. What the unit opens with (its goals, its
 * challenge, its historical aside) and what a lesson holds (its الكفاءات and their mastery, its prerequisites — shown,
 * never blocking — its labs, its محاور for the teacher) are folded, one tap away: reduced, never deleted.
 *
 * Everything comes from the catalogue (packages/core) and the lesson.config.js files: the page writes no content.
 * The textbook reference is shown to the TEACHER only (a student is never sent to the book).
 *
 * A STUDENT of a converted unit (owner, 2026-11-09) sees `UnitMissionView` instead (unit/unitMissions.js); the teacher
 * keeps THIS page.
 */
const MASTERY_DOT = {
  unassessed: 'bg-nav-line',
  gap: 'bg-nav-alert',
  reinforce: 'bg-nav-now',
  mastered: 'bg-nav-done',
};
const CHIP = 'rounded-full border border-nav-line bg-nav-page px-2.5 py-0.5 text-xs font-semibold text-nav-ink';
const H = 'mb-1.5 flex items-center gap-1.5 text-sm font-bold text-nav-ink';
const PRIMARY =
  'inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-nav-accent px-4 text-sm font-bold text-white hover:bg-[#3350c4]';
const QUIET =
  'inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border-[1.5px] border-nav-line bg-white px-4 text-sm font-bold text-nav-ink hover:border-nav-accent';

function masteryIndex(profile) {
  // The profile is nested by class then by lesson (see findLessonMasteryRows); flattened here by point code.
  const rows = [];
  for (const g of profile?.currentMastery ?? [])
    for (const l of g.lessons ?? []) for (const lp of l.learningPoints ?? []) rows.push(lp);
  const map = new Map();
  for (const row of rows) {
    const code = row.code ?? row.learningPointCode ?? row.learning_point_code;
    if (code) map.set(code, row);
  }
  return map;
}

/**
 * ONE LINE per lesson — its rank, its name, two facts, what a tap does now — and everything else folded behind
 * « التفاصيل »: its الكفاءات with their mastery, its prerequisites (shown, never blocking), its labs and methods, and
 * for the teacher its محاور. `next` marks the lesson the student should open now: its line is the filled one and its
 * details are open.
 */
function LessonBlock({ lesson, index, mastery, next, t }) {
  const { isLessonClosed, isLessonHiddenByClass, lessonStatus } = useContentAvailability();
  const { isTeacher } = useLearningViewer();
  // Hidden by the teacher: unavailable for the student of that class, without touching the publication.
  const available = lesson.status === 'available' && !isLessonClosed(lesson.id) && !isLessonHiddenByClass(lesson.id);
  // Not WRITTEN yet (`coming_soon`): named with what it will teach, no progress and no way in (LEARNING_NET.md).
  const draft = lesson.status !== 'available';
  const total = getTotalModules(lesson.id);
  const { progressPercent } = available ? getLessonProgress(lesson.id, total) : { progressPercent: 0 };
  const built = isLessonBuilt(lesson.id);
  const config = useLessonConfig(lesson.id);
  const resources = config?.resources ?? [];
  const manipulations = resources.filter((r) => r.kind === 'manipulation');
  const methods = resources.filter((r) => r.kind === 'method');
  const prereqLessons = (lesson.prerequisiteLessonCodes ?? []).map((code) => getLessonById(code)).filter(Boolean);
  const isSynthesis = lesson.kind === 'synthesis';
  const points = lesson.learningPoints;
  const mastered = points.filter((lp) => resolveMasteryState(mastery.get(lp.id)) === 'mastered').length;
  const textbookPages = formatTextbookPages(lesson.textbookRef?.pages);
  const minutes = minutesOf(lesson.duration);
  const kind = !available ? 'soon' : tileKind('open', progressPercent);
  const [open, setOpen] = useState(next && !isTeacher);
  const facts = [
    points.length > 0 && t('unit.pointsCount', { count: points.length }),
    minutes != null && t('unit.minutes', { n: minutes }),
    !isTeacher && mastered > 0 && `${mastered} / ${points.length} ✓`,
  ].filter(Boolean);

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border bg-white ${draft ? 'border-dashed border-nav-line' : next ? 'border-nav-now' : 'border-nav-line'}`}
      data-unit-lesson={lesson.id}
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 p-4">
        <StatusDot kind={kind === 'start' && !next ? 'idle' : kind} size="h-10 w-10 text-base">
          {kind === 'done' || kind === 'now' ? null : isSynthesis ? (
            <Landmark className="h-4 w-4 text-nav-muted" />
          ) : (
            <span className="text-nav-ink">{index}</span>
          )}
        </StatusDot>
        <div className="min-w-0 flex-1 basis-60">
          <h3 className="flex flex-wrap items-center gap-2 font-space text-base font-bold leading-snug text-nav-ink">
            {available ? (
              <Link to={lesson.path} className="hover:underline">
                <MathLabel>{lesson.title}</MathLabel>
              </Link>
            ) : (
              <span className="text-nav-muted">
                <MathLabel>{lesson.title}</MathLabel>
              </span>
            )}
            <PublicationBadge status={lessonStatus(lesson.id)} />
          </h3>
          <p className="mt-0.5 font-inter text-xs font-semibold text-nav-muted">
            {isSynthesis && `${t('unit.synthesisTag')} · `}
            {facts.join(' · ')}
          </p>
        </div>
        {available && isTeacher && built && <TeacherLessonActions lesson={lesson} />}
        {available && !(isTeacher && built) && (
          <Link to={lesson.path} className={next ? PRIMARY : QUIET}>
            {kind === 'done'
              ? t('unit.done')
              : progressPercent > 0
                ? `${t('unit.continue')} · ${progressPercent}%`
                : t('unit.start')}
            <ArrowForward className="h-4 w-4" aria-hidden="true" />
          </Link>
        )}
        {/* Not open (not published, not written yet, or hidden by the teacher): the gesture stays in ITS place, disabled,
            and says why — the line keeps its shape from one lesson to the next. */}
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={`unit-lesson-details-${lesson.id}`}
          aria-label={t('unit.details')}
          title={t('unit.details')}
          className="order-last inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-nav-muted hover:bg-nav-page hover:text-nav-ink"
          data-unit-lesson-toggle
        >
          <ChevronDown className={`h-5 w-5 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
        {!available && (
          <span
            aria-disabled="true"
            className="inline-flex min-h-[44px] cursor-not-allowed items-center gap-1.5 rounded-xl border border-dashed border-nav-line px-4 text-sm font-bold text-nav-muted"
            data-lesson-soon={lesson.id}
            {...(draft ? { 'data-lesson-draft': lesson.id } : {})}
          >
            <Lock className="h-4 w-4" aria-hidden="true" />
            {isLessonHiddenByClass(lesson.id)
              ? t('hiddenByTeacherBadge', { ns: 'access' })
              : draft
                ? t('unit.comingSoon')
                : t('unit.soon')}
          </span>
        )}
      </div>

      <div
        className="border-t border-nav-line p-4"
        hidden={!open}
        id={`unit-lesson-details-${lesson.id}`}
        data-unit-lesson-details
      >
        <div className="space-y-4">
          {lesson.description && (
            <p className="max-w-3xl font-inter text-sm text-nav-muted">
              <MathLabel>{lesson.description}</MathLabel>
            </p>
          )}
          {isTeacher && <LessonModuleChips lessonId={lesson.id} />}
          <div className="grid gap-4 md:grid-cols-2">
            <section>
              <h4 className={H}>
                <ListChecks className="h-4 w-4" aria-hidden="true" /> {t('unit.learningPoints')}
              </h4>
              <ul className="space-y-1">
                {points.map((lp) => {
                  const row = mastery.get(lp.id);
                  const state = resolveMasteryState(row);
                  // ONE vocabulary (`mastery.*`); the tooltip adds the reason and the freshness.
                  const tooltip = masteryTooltip(state, row, t);
                  return (
                    <li key={lp.id} className="flex items-start gap-2 text-sm text-nav-ink" title={tooltip}>
                      <span
                        className={`mt-1.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full ${MASTERY_DOT[state]}`}
                        aria-label={tooltip}
                        data-mastery-state={state}
                      />
                      <span>
                        <MathLabel>{lp.title}</MathLabel>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
            <section className="space-y-3">
              {(prereqLessons.length > 0 || (lesson.prerequisites ?? []).length > 0) && (
                <div>
                  <h4 className={H}>
                    <Compass className="h-4 w-4" aria-hidden="true" /> {t('unit.prerequisites')}
                  </h4>
                  <ul className="flex flex-wrap gap-1.5">
                    <PrerequisiteLessonChips lessonId={lesson.id} />
                    {(lesson.prerequisites ?? []).map((txt) => (
                      <li key={txt} className={CHIP}>
                        <MathLabel>{txt}</MathLabel>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {(manipulations.length > 0 || methods.length > 0) && (
                <div>
                  <h4 className={H}>
                    <Wand2 className="h-4 w-4" aria-hidden="true" /> {t('unit.manipulationsAndMethods')}
                  </h4>
                  <ul className="flex flex-wrap gap-1.5">
                    {manipulations.map((r) => (
                      <li key={r.code} className={CHIP} data-unit-resource="manipulation">
                        <MathLabel>{r.title}</MathLabel>
                      </li>
                    ))}
                    {methods.map((r) => (
                      <li key={r.code} className={CHIP} data-unit-resource="method">
                        <MathLabel>{r.title}</MathLabel>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          </div>
          {/* The textbook page is the TEACHER's reference only: a student is never sent to the book. */}
          {isTeacher && textbookPages && (
            <p className="font-inter text-xs text-nav-muted">{t('unit.textbookPages', { pages: textbookPages })}</p>
          )}
        </div>
      </div>
      {available && <ProgressLine percent={progressPercent} />}
    </article>
  );
}

export default function UnitPage() {
  // Cette page mène à des leçons : leur runtime partagé arrive pendant
  // l'inactivité, le clic ne l'attend pas (lessonRuntimeLoader.js).
  const { t } = useTranslation('student');
  const catalogueHref = useCatalogueHref();
  const { levelId, gradeId, chapterId, unitId } = useParams();
  const unit = getUnitById(unitId);
  // …les textes des labs seulement si une leçon de l'unité a encore des pages de module, et, pour l'ÉLÈVE, le code du
  // monde de jeu de ses leçons v2 (three.js + le monde) une fois la page affichée (BUNDLE_BOUNDARIES.md « World preload »).
  const unitLessonIds = [...(unit?.lessons ?? []), ...(unit?.synthesis ? [unit.synthesis] : [])].map((l) => l.id);
  usePrefetchLessonRuntime(unitLessonIds);
  usePrefetchWorlds(unitLessonIds, !useLearningViewer().freeNavigation);
  // Le profil de CETTE unité seulement (`?unit=`, Mastery V2).
  const { profile } = useLearningProfile({ unit: unitId });
  // Même contrat de décalage haut que le sommaire et les modules de leçon.
  const chrome = useLessonChromeLayout();
  const mastery = useMemo(() => masteryIndex(profile), [profile]);
  const { isTeacher } = useLearningViewer();

  if (!unit || unit.levelId !== levelId || unit.gradeId !== gradeId || unit.chapterId !== chapterId)
    return <Navigate to="/courses" replace />;

  // L'élève d'une unité convertie : un écran, la page détaillée reste celle de l'enseignant.
  const mission = unitMissionOf(unit.id);
  if (mission && !isTeacher) {
    return (
      <div className={`min-h-screen bg-slate-50 ${chrome.contentOffsetClass}`}>
        <main className="sa-page space-y-2 py-4">
          <nav className="flex flex-wrap items-center gap-2 text-xs text-slate-500" aria-label={t('unit.breadcrumb')}>
            <Link to={catalogueHref()} className="hover:text-nav-accent">
              {t('unit.home')}
            </Link>
            <span>/</span>
            <Link
              to={catalogueHref({ level: levelId, grade: gradeId, chapter: chapterId })}
              className="hover:text-nav-accent"
            >
              {unit.chapterTitle}
            </Link>
          </nav>
          <UnitMissionView unit={unit} mission={mission} />
        </main>
      </div>
    );
  }

  const lessons = unit.lessons;
  const isDone = (l) =>
    l.status === 'available' && getLessonProgress(l.id, getTotalModules(l.id)).progressPercent >= 100;
  const done = lessons.filter(isDone).length;
  // The lesson to open NOW: the first one available and not finished. A teacher has none (he is not a learner here).
  const all = unit.synthesis ? [...lessons, unit.synthesis] : lessons;
  const nextId = isTeacher ? null : (all.find((l) => l.status === 'available' && !isDone(l))?.id ?? null);
  const FOLD = 'rounded-2xl border border-nav-line bg-white';
  const FOLD_HEAD =
    'flex min-h-[48px] cursor-pointer list-none items-center gap-2 px-4 font-inter text-sm font-bold text-nav-ink [&::-webkit-details-marker]:hidden';

  return (
    <div className={`min-h-screen bg-nav-page ${chrome.contentOffsetClass}`}>
      <main className="sa-page space-y-6 py-6">
        <nav
          className="flex flex-wrap items-center gap-2 font-inter text-xs font-semibold text-nav-muted"
          aria-label={t('unit.breadcrumb')}
        >
          <Link to={catalogueHref({ level: levelId, grade: gradeId })} className="hover:text-nav-ink">
            {unit.gradeName}
          </Link>
          <span>/</span>
          <Link
            to={catalogueHref({ level: levelId, grade: gradeId, chapter: chapterId })}
            className="hover:text-nav-ink"
          >
            {unit.chapterTitle}
          </Link>
        </nav>

        <header className="space-y-4" data-unit={unit.id}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="font-inter text-sm font-bold text-nav-muted">{t('unit.unitNumber', { n: unit.number })}</p>
              <h1 className="font-space text-2xl font-extrabold leading-tight text-nav-ink sm:text-3xl">
                <MathLabel>{unit.title}</MathLabel>
              </h1>
            </div>
            <div className={`w-full sm:w-56 ${isTeacher ? 'hidden' : ''}`} data-tour="unit.progress">
              <div className="flex items-baseline justify-between font-inter text-sm font-bold text-nav-ink">
                <span>{t('unit.lessonsDone')}</span>
                <span dir="ltr">
                  {done}
                  {' / '}
                  {lessons.length}
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-nav-line">
                <div
                  className="h-full rounded-full bg-nav-done"
                  style={{ width: `${lessons.length ? (done / lessons.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* What the unit opens with — its goals, its challenge, its aside — is ONE tap away, never a wall above the lessons. */}
          <div className="grid items-start gap-3 lg:grid-cols-3">
            <details className={`group ${FOLD}`} data-tour="unit.objectives">
              <summary className={FOLD_HEAD}>
                <ListChecks className="h-4 w-4 text-nav-muted" aria-hidden="true" />
                {t('unit.objectives')}
                <ChevronDown
                  className="ms-auto h-4 w-4 text-nav-muted transition-transform group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <ul className="space-y-1 px-4 pb-4 text-sm text-nav-ink">
                {unit.objectives.map((o) => (
                  <li key={o}>
                    • <MathLabel>{o}</MathLabel>
                  </li>
                ))}
              </ul>
            </details>
            {unit.challenge?.textAr && (
              <details className={`group ${FOLD}`} data-unit-challenge>
                <summary className={FOLD_HEAD}>
                  <Flag className="h-4 w-4 text-nav-muted" aria-hidden="true" />
                  {unit.challenge.titleAr ?? t('unit.challenge')}
                  <ChevronDown
                    className="ms-auto h-4 w-4 text-nav-muted transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <div className="px-4 pb-4">
                  <p className="text-sm leading-relaxed text-nav-ink">
                    <MathLabel>{unit.challenge.textAr}</MathLabel>
                  </p>
                  <UnitOpenerFigure code={unit.id} slot="challenge" />
                  <span className="mt-2 block text-xs text-nav-muted">{t('unit.challengeNote')}</span>
                </div>
              </details>
            )}
            {unit.aside?.textAr && (
              <details className={`group ${FOLD}`}>
                <summary className={FOLD_HEAD}>
                  <BookOpen className="h-4 w-4 text-nav-muted" aria-hidden="true" />
                  {unit.aside.titleAr} — {unit.aside.captionAr}
                  <ChevronDown
                    className="ms-auto h-4 w-4 text-nav-muted transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <div className="px-4 pb-4 text-sm leading-relaxed text-nav-ink">
                  <MathLabel>{unit.aside.textAr}</MathLabel>
                  <UnitOpenerFigure code={unit.id} slot="aside" />
                </div>
              </details>
            )}
          </div>
          {isTeacher && unit.textbook && (
            <p className="flex items-center gap-1.5 font-inter text-xs text-nav-muted">
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
              {t('unit.textbookRef', {
                title: unit.textbook.title,
                unit: unit.textbook.unit,
                pages: formatTextbookPages(unit.textbook.pages),
              })}
            </p>
          )}
        </header>

        <section className="space-y-3">
          <h2 className="font-space text-lg font-bold text-nav-ink">{t('unit.lessons', { count: lessons.length })}</h2>
          {lessons.map((lesson, i) => (
            <LessonBlock
              key={lesson.id}
              lesson={lesson}
              index={i + 1}
              mastery={mastery}
              next={lesson.id === nextId}
              t={t}
            />
          ))}
          {unit.synthesis && (
            <LessonBlock
              lesson={unit.synthesis}
              index={lessons.length + 1}
              mastery={mastery}
              next={unit.synthesis.id === nextId}
              t={t}
            />
          )}
        </section>
      </main>
    </div>
  );
}
