import { lazy, Suspense, useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, MotionConfig } from 'framer-motion';
import { Compass } from 'lucide-react';
import { courseLevels, getAllGrades } from '@smarter-academy/core';
import { ArrowForward } from '../../components/common/DirectionalIcons';
import { AuthContext } from '../../context/AuthContext';
import { useStudyContext } from '../../context/StudyContextContext';
import { getResumeLesson, getResumeModulePath } from '../../lessons/common/utils/progress/getResumeLesson';
import { getStudentActivity } from '../../lessons/common/utils/progress/getStudentActivity';
import { LESSON_PROGRESS_SYNCED_EVENT } from '../../hooks/useLessonProgressSync';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { usePremiumStatus } from '../../hooks/usePremiumStatus';
import { useContentAvailability } from '../../context/ContentAvailabilityContext';
import { useLearningProfile } from '../../lessons/common/hooks/useLearningProfile';
import { getDisplayName } from '../../utils/userDisplay';
import { buildProgressionTree } from '../../features/progression/buildProgressionTree';
import { pickCurriculumContext, indexTreeByLesson } from '../../features/home/curriculumContext';
import HomeGreeting from '../../features/home/components/HomeGreeting';
import JourneyStats from '../../features/home/components/JourneyStats';
import CurriculumPreview from '../../features/home/components/CurriculumPreview';
import RecentLearning from '../../features/home/components/RecentLearning';
import LearningSpaceNav from '../../features/home/components/LearningSpaceNav';
import PremiumCard from '../../features/home/components/PremiumCard';
import DailyChallengeCard from '../../features/home/components/DailyChallengeCard';
import { fetchCompass } from '../../services/compassService';
import { usePrefetchLessonRuntime } from '../../lessons/common/lessonRuntimeLoader';
import NoLessonYet from '../../components/student/NoLessonYet';
import { isFeatureOn } from '../../config/features';

// « Ma boussole » sur l'accueil (YEAR_COMPASS.md §6bis) : un lot PARESSEUX — réseau + calendrier n'entrent
// pas dans le lot de l'accueil ; la page s'affiche, puis la section arrive.
const CompassHomeSections = lazy(() => import('../../features/home/compass/CompassHomeSections'));

function localToday() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/**
 * « 🏠 Mon espace » — l'ACCUEIL de l'espace élève, MENÉ PAR « Ma boussole » (YEAR_COMPASS.md §6bis ; maquette
 * validée par le propriétaire le 2026-11-09, l'ancien accueil a été retiré le même jour).
 *
 *   qui je suis                 → salutation
 *   ████ ce que je fais LÀ ████ → la section Ma boussole (CompassHomeSections) : la jauge, « Mission du jour »,
 *                                  la semaine et les bandes, la leçon + le défi, la bande de l'année.
 *                                  Une classe où la jauge n'est pas encore ouverte voit la même page
 *                                  sans la jauge (état `off`).
 *   tout le reste                → replié sous « Plus », jamais supprimé : quatre repères, la tranche
 *                                  du programme, les leçons récentes, mes espaces, premium, autres classes.
 *
 * La page N'INVENTE rien : la reprise vient de getResumeLesson (toutes classes, ARCHITECTURE.md §10),
 * l'activité de getStudentActivity, la maîtrise du profil serveur (useLearningProfile), l'arbre des
 * mêmes modules que « Ma progression », l'état de Ma boussole du serveur (GET /compass).
 */
export default function StudentHome() {
  // Cette page mène à des leçons : leur runtime partagé arrive pendant l'inactivité (lessonRuntimeLoader.js).
  usePrefetchLessonRuntime();
  const { t } = useTranslation('student');
  const { t: tc } = useTranslation('common');
  useDocumentMeta(t('home.metaTitle'), t('home.metaDescription'));
  const { user, token } = useContext(AuthContext);
  const { studyContext } = useStudyContext();
  const { isPremium, canSeeUpgrade } = usePremiumStatus();
  // Le palier vient du serveur (lessons.tier, décidé par l'administrateur) : le catalogue n'en porte aucun.
  const { isLessonPremium } = useContentAvailability();

  // L'état de « Ma boussole » (serveur). Une erreur réseau laisse l'accueil sans la jauge (état `off`), jamais vide.
  // The compass off (config/features.js): never asked for — the home opens at once in its `off` state.
  const compassOn = isFeatureOn('compass');
  const [compass, setCompass] = useState(null);
  const [compassLoaded, setCompassLoaded] = useState(!compassOn);
  useEffect(() => {
    if (!token || !compassOn) return undefined;
    let cancelled = false;
    fetchCompass(token)
      .then((c) => { if (!cancelled) setCompass(c); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setCompassLoaded(true); });
    return () => { cancelled = true; };
  }, [token, compassOn]);
  const today = useMemo(() => localToday(), []);
  const classroom = studyContext?.mode === 'classroom' ? (studyContext.primary ?? studyContext.classrooms?.[0] ?? null) : null;

  // L'activité est lue dans le stockage local au montage ; la fusion des lignes du serveur et le retour sur
  // l'onglet la rendent obsolète : `tick` force le recalcul (même réflexe que « Ma progression »).
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const bump = () => setTick((n) => n + 1);
    window.addEventListener(LESSON_PROGRESS_SYNCED_EVENT, bump);
    window.addEventListener('focus', bump);
    return () => {
      window.removeEventListener(LESSON_PROGRESS_SYNCED_EVENT, bump);
      window.removeEventListener('focus', bump);
    };
  }, []);

  const gradeId = user?.grade || null;
  const grade = useMemo(() => getAllGrades().find((g) => g.id === gradeId), [gradeId]);

  // Toutes classes confondues, comme getResumeLesson le documente (ARCHITECTURE.md §10).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const continueCourse = useMemo(() => getResumeLesson(courseLevels), [tick]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allActivity = useMemo(() => getStudentActivity(courseLevels), [tick]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const gradeActivity = useMemo(() => getStudentActivity(courseLevels, { gradeId: user?.grade }), [user?.grade, tick]);
  // Le dernier passage dans CHAQUE leçon (toutes classes : une révision peut viser la 3AM) — coche les tâches de la semaine.
  const visits = useMemo(() => Object.fromEntries(allActivity.lessons.map((l) => [l.lesson.id, l.lastVisitedAt])), [allActivity]);

  // La maîtrise de SA classe (filtrée par le serveur, `?grade=`), pour les repères repliés.
  const { profile, status, reload } = useLearningProfile(gradeId ? { grade: gradeId } : undefined);
  const currentMastery = useMemo(() => {
    const all = profile?.currentMastery || [];
    return gradeId ? all.filter((g) => g.grade === gradeId) : all;
  }, [profile, gradeId]);
  const tree = useMemo(
    () => buildProgressionTree(courseLevels, gradeActivity, currentMastery, { gradeId, getModulePath: getResumeModulePath }),
    [gradeActivity, currentMastery, gradeId],
  );
  const treeIndex = useMemo(() => indexTreeByLesson(tree), [tree]);
  const whereContext = useMemo(() => pickCurriculumContext(tree, continueCourse?.course?.id ?? null), [tree, continueCourse]);
  const recent = gradeActivity.recentlyActive.slice(0, 3);
  const premiumCount = gradeActivity.lessons.filter((l) => isLessonPremium(l.lesson.id)).length;

  const enter = (delay = 0) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1], delay },
  });
  const skeleton = <div className="h-64 animate-pulse rounded-3xl bg-white/70" aria-hidden="true" />;

  return (
    <MotionConfig reducedMotion="user">
      <div className="sa-page py-8 sm:py-10" aria-busy={!compassLoaded} data-student-home>
        <motion.div {...enter(0)} className="mb-6 sm:mb-7">
          <HomeGreeting name={getDisplayName(user)} gradeName={grade?.name || null} />
        </motion.div>

        {/* His grade has no published lesson yet: say it first, above everything that would otherwise sit empty —
            « announced » when its lessons are in the catalogue as coming soon, « no lesson yet » when it has none. */}
        {grade && grade.lessonCount === 0 && (
          <motion.div {...enter(0.03)} className="mb-6">
            <NoLessonYet announced={grade.catalogueLessonCount > 0} />
          </motion.div>
        )}

        <motion.div {...enter(0.05)}>
          {compassLoaded ? (
            <Suspense fallback={skeleton}>
              <CompassHomeSections
                compass={compass ?? { enabled: false }}
                gradeId={gradeId}
                today={today}
                resume={continueCourse}
                visits={visits}
                classroom={classroom}
                challenge={isFeatureOn('dailyChallenge') ? <DailyChallengeCard /> : null}
              />
            </Suspense>
          ) : skeleton}
        </motion.div>

        {/* ── Tout le reste : replié, jamais supprimé (règle « plier, ne jamais supprimer »). ── */}
        <details className="group mt-8 rounded-3xl bg-white ring-1 ring-slate-200" data-home-more>
          <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2 px-5 py-4 font-black text-slate-900">
            <span>{t('compassHome.more.title')} <span className="ms-2 text-sm font-semibold text-slate-600">{t('compassHome.more.hint')}</span></span>
            <span aria-hidden="true" className="transition group-open:rotate-180">⌄</span>
          </summary>
          <div className="space-y-8 px-5 pb-6">
            {status === 'error' && (
              <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4" data-home-error>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-rose-900">{t('home.masteryErrorTitle')}</p>
                  <p className="mt-0.5 max-w-xl text-xs text-rose-900/80">{t('home.masteryErrorBody')}</p>
                </div>
                <button type="button" onClick={reload} className="min-h-[44px] rounded-xl border-2 border-rose-200 bg-white px-4 text-xs font-bold text-rose-800 hover:border-rose-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500">
                  🔄 {tc('retry')}
                </button>
              </div>
            )}
            <JourneyStats activity={gradeActivity} agg={tree.agg} profileStatus={status} />
            <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
              <CurriculumPreview context={whereContext} />
              <RecentLearning items={recent} treeIndex={treeIndex} />
            </div>
            <LearningSpaceNav />
            <PremiumCard premiumCount={premiumCount} isPremium={isPremium} canSeeUpgrade={canSeeUpgrade} />
            <div className="text-center" data-home-explore>
              <Link
                to="/espace/explorer"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl px-4 text-sm font-semibold text-slate-600 transition-colors hover:bg-white/80 hover:text-nav-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-nav-accent"
              >
                <Compass size={15} aria-hidden="true" /> {t('home.exploreOtherGrades')} <ArrowForward size={14} aria-hidden="true" />
              </Link>
              <p className="mt-1 text-xs text-slate-400">{t('home.exploreOtherGradesHint')}</p>
            </div>
          </div>
        </details>
      </div>
    </MotionConfig>
  );
}
