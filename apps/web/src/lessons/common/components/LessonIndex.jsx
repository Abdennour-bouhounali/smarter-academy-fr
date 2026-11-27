import { Suspense, lazy, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import PremiumLessonLocked from './PremiumLessonLocked';
import PublicationBadge from '../../../components/content/PublicationBadge';
import { masteryStatusByIdFromProfile } from '../utils/masteryStatus';
import { lessonPackFlags } from '../../registry';
import { useLearningViewer } from '../../../features/learning/learningViewer';
import { useLearningProfile } from '../hooks/useLearningProfile';
import { useLessonChromeLayout } from '../hooks/useLessonChrome';
import ReportButton from '../../../features/reports/ReportButton';
import { useContentAvailability } from '../../../context/ContentAvailabilityContext';
import MathLabel from './MathLabel';
import WorldLoading from '../gameworld/WorldLoading';
import { TeacherPanelSkeleton } from '../../../features/classSession/TeacherSkeletons';
import { useCatalogueHref } from '../../../components/student/catalogueLink';
import { opensWorldNow, toolAsked } from '../../lessonEntry';

// The game world and the teacher's tools are lazy chunks, never in the entry bundle (three.js).
const LessonGameWorld = lazy(() => import('../gameworld/LessonGameWorld'));
const LessonHome = lazy(() => import('../../../features/lessonHome/LessonHome'));
const LessonToolsLoader = lazy(() => import('../gameworld/LessonToolsLoader'));
const TeacherLessonPanel = lazy(() => import('../../../features/classSession/TeacherLessonPanel'));
const LessonToolsBar = lazy(() => import('../../../features/classSession/LessonToolsBar'));

/**
 * THE HOME OF A V2 LESSON (docs/architecture/LESSON_V2.md §2) — rendered by the lesson's `index.jsx`:
 *
 *   - a STUDENT lands on HIS HOME of the lesson (`features/lessonHome/LessonHome`, owner 2026-11-26): a calm page like the teacher's, the way into
 *     the world in huge, then what the lesson has outside it (the revision page…). The game world his lesson names in its
 *     pack (`lesson.pack.js › world`) is one step further, at `?monde=1`; leaving it comes back to this home;
 *   - a TEACHER sees one calm page: where he is, the title and his card « Pour le professeur » (TeacherLessonPanel), which holds
 *     every tool of the class session and « Essayer comme un élève » — the student's world in PREVIEW (`?apercu=eleve`, nothing is
 *     recorded or sent, CLASS_SESSION.md §2);
 *   - a lesson that is not published, hidden by the teacher or above this account's tier shows why, and nothing of
 *     its content.
 *
 * A v2 lesson has no module page: its module addresses redirect here (common/lessonRoutes.jsx).
 */
export default function LessonIndex({ config, basePath }) {
  const { t } = useTranslation('lesson');
  // This lesson's profile only (`?lesson=`): the world colours the keys the student already holds.
  const { profile } = useLearningProfile({ lesson: config.id });
  // The top offset follows the real shell (visitor Navbar / nothing on the student's desk).
  const chrome = useLessonChromeLayout();
  const masteryStatusById = useMemo(() => masteryStatusByIdFromProfile(profile), [profile]);
  const catalogueHref = useCatalogueHref();
  const { completedModules, markModuleCompleted } = useProgress(config.id);
  const [searchParams] = useSearchParams();
  const { isLessonClosed, isLessonLocked, isLessonHiddenByClass, lessonStatus } = useContentAvailability();
  // The teacher (free navigation) is not a learner here: his home is his card.
  const viewer = useLearningViewer();

  // NON PUBLIÉE : la carte la montrait déjà « bientôt », mais l'URL directe
  // ouvrait le sommaire. Jamais vrai pour un relecteur (admin, ambassadeur) : son
  // inventaire ne ferme rien, il voit la leçon avec sa pastille d'état.
  if (isLessonClosed(config.id)) {
    return (
      <div className={`min-h-screen flex flex-col justify-between ${chrome.contentOffsetClass} bg-slate-50`}>
        <main className="sa-page py-8 flex-1">
          <nav className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500 mb-8">
            <Link to={catalogueHref()} className="hover:text-blue-600">
              {t('index.home')}
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">
              <MathLabel>{config.title}</MathLabel>
            </span>
          </nav>
          <div
            className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xs"
            data-lesson-unpublished
          >
            <h1 className="font-space text-xl font-bold text-slate-800 mb-2">{t('index.unavailableTitle')}</h1>
            <p className="font-inter text-sm leading-relaxed text-slate-600 mb-6">{t('index.unavailableHint')}</p>
            <Link
              to={catalogueHref()}
              className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-5 py-2.5 font-inter text-sm font-bold text-white transition-colors hover:bg-blue-700"
            >
              {t('index.home')}
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Masquée par l'ENSEIGNANT pour la classe de l'élève : le serveur refuse
  // déjà toute écriture ; cet écran l'explique avec les bons mots (ni
  // « premium », ni « indisponible »).
  if (isLessonHiddenByClass(config.id)) {
    return (
      <div className={`min-h-screen flex flex-col justify-between ${chrome.contentOffsetClass} bg-slate-50`}>
        <main className="sa-page py-8 flex-1">
          <nav className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500 mb-8">
            <Link to={catalogueHref()} className="hover:text-blue-600">
              {t('index.home')}
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">
              <MathLabel>{config.title}</MathLabel>
            </span>
          </nav>
          <div
            className="mx-auto max-w-lg rounded-2xl border border-teal-200 bg-teal-50/50 p-8 text-center shadow-xs"
            data-hidden-by-teacher
          >
            <h1 className="font-space text-xl font-bold text-slate-800 mb-2">
              <MathLabel>{config.title}</MathLabel>
            </h1>
            <p className="font-inter text-sm leading-relaxed text-slate-600 mb-6">
              {t('hiddenByTeacherHint', { ns: 'access' })}
            </p>
            <Link
              to="/espace/classe"
              className="inline-flex items-center gap-1 rounded-xl bg-teal-700 px-5 py-2.5 font-inter text-sm font-bold text-white transition-colors hover:bg-teal-800"
            >
              {t('myClass', { ns: 'nav' })}
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (isLessonLocked(config.id)) {
    return (
      <div className={`min-h-screen flex flex-col justify-between ${chrome.contentOffsetClass} bg-slate-50`}>
        <PremiumLessonLocked
          title={config.title}
          crumbs={
            <nav className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500 mb-8">
              <Link to={catalogueHref()} className="hover:text-blue-600">
                {t('index.home')}
              </Link>
              <span>/</span>
              <span className="text-slate-900 font-semibold">
                <MathLabel>{config.title}</MathLabel>
              </span>
            </nav>
          }
        />
      </div>
    );
  }

  const pack = lessonPackFlags(config.id);
  const previewAsStudent = viewer.freeNavigation && searchParams.get('apercu') === 'eleve' && Boolean(pack.world);
  const worldId = !viewer.freeNavigation || previewAsStudent ? (pack.world ?? null) : null;
  // one of the lesson's tools, opened from the home WITH NO WORLD (`?outil=…`, lessonEntry.js)
  const tool = worldId && !previewAsStudent && !opensWorldNow(searchParams) ? toolAsked(searchParams) : null;
  if (tool) {
    return (
      <Suspense fallback={null}>
        <LessonToolsLoader
          tool={tool}
          config={config}
          basePath={basePath}
          exitTo={basePath}
          onModule={(n) => markModuleCompleted(String(n))}
          completedModules={completedModules}
          mastery={Object.keys(masteryStatusById ?? {}).length ? masteryStatusById : null}
        />
      </Suspense>
    );
  }
  // the student's home first: the world opens from it (`?monde=1`), or for a teacher's preview
  if (worldId && !previewAsStudent && !opensWorldNow(searchParams)) {
    return (
      <Suspense fallback={null}>
        <LessonHome
          config={config}
          basePath={basePath}
          offsetClass={chrome.contentOffsetClass}
          completedModules={completedModules}
          masteryStatusById={masteryStatusById}
        />
      </Suspense>
    );
  }
  if (worldId) {
    return (
      <Suspense fallback={<WorldLoading lessonId={config.id} title={config.title} />}>
        <LessonGameWorld
          worldId={worldId}
          config={config}
          basePath={basePath}
          exitTo={basePath}
          onModule={(n) => {
            if (!previewAsStudent) markModuleCompleted(String(n));
          }}
          completedModules={completedModules}
          preview={previewAsStudent}
          mastery={Object.keys(masteryStatusById ?? {}).length ? masteryStatusById : null}
        />
      </Suspense>
    );
  }

  // Everyone else who is not playing: the teacher's card page (a reviewer sees the same page without the card).
  return (
    <div className={`min-h-screen flex flex-col justify-between ${chrome.contentOffsetClass} bg-slate-50`}>
      <main className="sa-page py-8 flex-1 space-y-8">
        <div data-teacher-topline>
          <Suspense fallback={null}>
            <LessonToolsBar lessonId={config.id} active="lesson" />
          </Suspense>
        </div>
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm space-y-6 p-4 md:p-8">
          <div className="w-full min-w-0 space-y-4" data-tour="lesson-index.hero">
            <p className="flex flex-wrap items-center gap-2 text-xs font-extrabold text-slate-500" data-teacher-meta>
              <span className="rounded-full bg-slate-100 px-3 py-1">{config.grade}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">
                ~{t('index.durationMin', { count: config.estimatedDurationMin })}
              </span>
            </p>
            <h1 className="font-space font-extrabold text-slate-900 leading-tight text-2xl md:text-4xl">
              <MathLabel>{config.title}</MathLabel>
            </h1>
            {/* Reviewer only (admin, ambassadeur): the publication state. */}
            <PublicationBadge status={lessonStatus(config.id)} />
            {viewer.isTeacher && (
              <div data-tour="lesson-index.tools">
                <Suspense fallback={<TeacherPanelSkeleton />}>
                  <TeacherLessonPanel config={config} basePath={basePath} hasWorld={Boolean(pack.world)} />
                </Suspense>
              </div>
            )}
          </div>
        </section>
        <div className="flex justify-center pt-2" data-teacher-report>
          <ReportButton
            source="lesson"
            variant="prominent"
            context={{ lessonCode: config.id, grade: config.grade, step: 'sommaire' }}
          />
        </div>
      </main>
    </div>
  );
}
