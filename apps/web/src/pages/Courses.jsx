import { useState, useContext, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Sparkles, Lock, Crown, Play, Search } from 'lucide-react';
import { ArrowForward } from '../components/common/DirectionalIcons';
import { courseLevels } from '@smarter-academy/core';
import { getResumeLesson } from '../lessons/common/utils/progress/getResumeLesson';
import GradeLessonSearch, { filterLessonsByQuery } from '../components/student/GradeLessonSearch';
import CatalogueBrowser from '../components/student/CatalogueBrowser';
import CatalogueViewToolbar from '../components/student/CatalogueViewToolbar';
import { useCatalogueView } from '../components/student/catalogueView';
import { storage, scopedStorage } from '../utils/storage';
import { AuthContext } from '../context/AuthContext';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import NoLessonYet from '../components/student/NoLessonYet';
import { usePayments } from '../context/PaymentsContext';

export default function CoursesPage() {
  const { t } = useTranslation('common');
  useDocumentMeta(t('catalogueMetaTitle'), t('catalogueMetaDescription'));

  const [searchParams, setSearchParams] = useSearchParams();
  const { user, loading: authLoading } = useContext(AuthContext);
  // Payments closed: no « paid » legend and no « the rest opens with a code » — nothing is paid (§4ter).
  const { paymentsOpen } = usePayments();

  // 1. Determine Initial State & Fallbacks
  const urlLevel = searchParams.get('level');
  const urlGrade = searchParams.get('grade');
  const urlChapter = searchParams.get('chapter');

  // A logged-in student's profile grade is their default learning context —
  // it takes priority over the anonymous-visitor localStorage fallback below
  // (which only applies once no URL param and no profile grade decide it).
  const profileGrade = user?.role === 'student' ? user.grade : null;
  const profileLevel = profileGrade
    ? courseLevels.find((l) => l.grades.some((g) => g.id === profileGrade))?.id
    : null;

  const lsLevel = storage.getItem('smarter_selected_level');
  const lsGrade = storage.getItem('smarter_selected_grade');
  const lsChapter = storage.getItem('smarter_selected_chapter');

  const [lastFocus, setLastFocus] = useState(Date.now());
  useEffect(() => {
    const onFocus = () => setLastFocus(Date.now());
    window.addEventListener('focus', onFocus);
    window.addEventListener('storage', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('storage', onFocus);
    };
  }, []);

  // Helpers
  //
  // Le niveau de repli vient du CATALOGUE, jamais d'un identifiant écrit ici :
  // un identifiant écrit en dur qui ne correspond à aucun niveau rendait
  // `levelData` undefined, et la page affichait « bientôt disponible » alors
  // qu'un catalogue existait — une panne silencieuse.
  const defaultLevelId = courseLevels[0]?.id ?? null;
  const getValidLevelId = (id) => courseLevels.find(l => l.id === id) ? id : null;
  
  const effectiveLevelId = getValidLevelId(urlLevel) || getValidLevelId(profileLevel) || getValidLevelId(lsLevel) || defaultLevelId;
  const levelData = courseLevels.find(l => l.id === effectiveLevelId);

  const getValidGradeId = (levelId, gradeId) => {
    const level = courseLevels.find(l => l.id === levelId);
    if (!level) return null;
    return level.grades.find(g => g.id === gradeId) ? gradeId : null;
  };

  // courseLevels is filtered to ACTIVE_GRADE_IDS (activeGrades.js). When it
  // is empty every level/grade lookup above comes back empty/null, so this
  // page must render an explicit "nothing active yet" state rather than
  // dereference levelData.grades below.
  const hasActiveCurriculum = Boolean(levelData);
  const effectiveGradeId = hasActiveCurriculum
    ? (getValidGradeId(effectiveLevelId, urlGrade) || getValidGradeId(effectiveLevelId, profileGrade) || getValidGradeId(effectiveLevelId, lsGrade) || levelData.grades[levelData.grades.length - 1]?.id)
    : null;
  const gradeData = hasActiveCurriculum ? levelData.grades.find(g => g.id === effectiveGradeId) : null;

  const getValidChapterId = (grade, chapterId) => {
    if (!grade) return null;
    if (chapterId === 'all') return 'all';
    return grade.chapters.find(c => c.id === chapterId) ? chapterId : null;
  };
  
  const effectiveChapterId = getValidChapterId(gradeData, urlChapter) || getValidChapterId(gradeData, lsChapter) || 'all';

  // Sync state — deferred until auth resolves, so an anonymous-visitor
  // fallback never gets permanently baked into the URL before we know
  // whether a logged-in student's profile grade should apply instead.
  useEffect(() => {
    if (authLoading || !hasActiveCurriculum) return;

    let changed = false;
    const newParams = new URLSearchParams(searchParams);
    if (urlLevel !== effectiveLevelId) { newParams.set('level', effectiveLevelId); changed = true; }
    if (urlGrade !== effectiveGradeId) { newParams.set('grade', effectiveGradeId); changed = true; }
    if (urlChapter !== effectiveChapterId) { newParams.set('chapter', effectiveChapterId); changed = true; }

    if (changed) setSearchParams(newParams, { replace: true });

    if (lsLevel !== effectiveLevelId) storage.setItem('smarter_selected_level', effectiveLevelId);
    if (lsGrade !== effectiveGradeId) storage.setItem('smarter_selected_grade', effectiveGradeId);
    if (lsChapter !== effectiveChapterId) storage.setItem('smarter_selected_chapter', effectiveChapterId);
  }, [authLoading, effectiveLevelId, effectiveGradeId, effectiveChapterId, urlLevel, urlGrade, urlChapter, lsLevel, lsGrade, lsChapter, searchParams, setSearchParams]);

  // Handlers
  const handleLevelChange = (newLevelId) => {
    const newLevel = courseLevels.find(l => l.id === newLevelId);
    let newGradeId = getValidGradeId(newLevelId, lsGrade) || newLevel.grades[newLevel.grades.length - 1].id;
    setSearchParams({ level: newLevelId, grade: newGradeId, chapter: 'all' });
  };

  const handleGradeChange = (newGradeId) => {
    setSearchParams({ level: effectiveLevelId, grade: newGradeId, chapter: 'all' });
  };
  
  const handleChapterChange = (newChapterId) => {
    setSearchParams({ level: effectiveLevelId, grade: effectiveGradeId, chapter: newChapterId });
  };

  const handleCourseClick = (courseId) => {
    scopedStorage.setItem('smarter_last_course', courseId);
  };

  const [searchQuery, setSearchQuery] = useState('');

  // Course Filtering
  const filteredCourses = useMemo(() => {
    if (!gradeData) return [];
    
    // Flatten lessons if chapter is 'all', else find specific chapter
    let targetLessons = [];
    if (effectiveChapterId === 'all') {
      targetLessons = gradeData.chapters.flatMap(c => c.lessons);
    } else {
      const chapter = gradeData.chapters.find(c => c.id === effectiveChapterId);
      targetLessons = chapter ? chapter.lessons : [];
    }

    // When searching, we search across all chapters of the grade regardless of effectiveChapterId
    return filterLessonsByQuery(gradeData.chapters.flatMap(c => c.lessons), searchQuery) ?? targetLessons;
  }, [gradeData, effectiveChapterId, searchQuery]);

  // Les chapitres dont le PROGRAMME doit être montré : ceux qui portent des
  // sujets sans porter encore de leçon. Un chapitre qui a des leçons les
  // montre ; un chapitre qui n'a ni l'un ni l'autre n'a rien à dire.
  const visibleTopicChapters = useMemo(() => {
    if (!gradeData) return [];
    const chapters = effectiveChapterId === 'all'
      ? gradeData.chapters
      : gradeData.chapters.filter((c) => c.id === effectiveChapterId);

    return chapters.filter((c) => (c.topics?.length ?? 0) > 0 && (c.lessons?.length ?? 0) === 0);
  }, [gradeData, effectiveChapterId]);

  // "Continuer" logic
  const continueCourse = useMemo(() => {
    return getResumeLesson(courseLevels);
  }, [lastFocus]);

  // La vue du catalogue (par chapitre / par thème / toutes les leçons, grille / liste) —
  // préférence partagée avec « Mes leçons » et l'exploration (catalogueView.js).
  // Le rendu ne reçoit que les thèmes visibles ; la recherche, elle,
  // traverse tout le niveau et s'affiche à plat.
  const [view, setView] = useCatalogueView();
  const visibleChapters = gradeData
    ? (effectiveChapterId === 'all' ? gradeData.chapters : gradeData.chapters.filter((c) => c.id === effectiveChapterId))
    : [];
  const searchResults = searchQuery ? filteredCourses : null;

  // Chapter Stats

  if (!hasActiveCurriculum) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-20 px-4 flex items-center justify-center text-center">
        <div className="max-w-md">
          <h1 className="font-space font-bold text-2xl text-slate-900 mb-2">
            {t('coursesComingSoon')}
          </h1>
          <p className="font-inter text-slate-500 text-sm">
            {t('coursesComingSoonBody')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-50 pb-20 ${user ? 'pt-6 lg:pt-10' : 'pt-16'}`}>

      {!user ? (
        <section className="bg-white border-b border-slate-200 py-10 px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-nav-accent-soft border border-blue-200 text-nav-accent text-xs font-mono-jetbrains font-semibold uppercase tracking-wider mb-4 shadow-2xs">
              <Sparkles size={14} className="text-nav-accent animate-pulse" />
              {t('catalogueBadge')}
            </div>
            <h1 className="font-space font-bold text-3xl sm:text-4xl text-slate-900 mb-2">
              {t('catalogueTitle')}
            </h1>
            {paymentsOpen && (
              <p className="font-inter text-slate-500 text-sm sm:text-base max-w-xl mx-auto mb-5">
                {t('catalogueSubtitle')}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {paymentsOpen && (
                <>
                  <span className="flex items-center gap-1.5 text-xs font-inter font-medium text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> {t('legendFree')}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-inter font-medium text-slate-500">
                    <Crown size={12} className="text-violet-500" /> {t('legendPremium')}
                  </span>
                </>
              )}
              <span className="flex items-center gap-1.5 text-xs font-inter font-medium text-slate-500">
                <Lock size={12} className="text-slate-400" /> {t('legendComingSoon')}
              </span>
            </div>
          </div>
        </section>
      ) : (
        <div className="sa-page mb-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <p className="font-mono-jetbrains text-blue-500 text-xs font-semibold tracking-widest uppercase mb-2">
              {t('catalogueEyebrow')}
            </p>
            <h1 className="font-space font-bold text-2xl sm:text-3xl text-slate-900">
              {t('catalogueExplore')}
            </h1>
          </motion.div>
        </div>
      )}

      <div className={`sa-page space-y-8 ${user ? '' : 'mt-8'}`}>
        
        {/* LEVEL SELECTOR */}
        <section>
          <div className="flex overflow-x-auto gap-3 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {courseLevels.map((level) => {
              const isSelected = level.id === effectiveLevelId;
              return (
                <button
                  key={level.id}
                  onClick={() => handleLevelChange(level.id)}
                  className={`flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-2xl font-space font-bold text-base transition-all ${
                    isSelected 
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xl">{level.icon}</span>
                  {level.title}
                </button>
              );
            })}
          </div>
        </section>

        {/* GRADE SELECTOR */}
        <section>
          <div className="flex overflow-x-auto gap-2 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <AnimatePresence mode="popLayout">
              {levelData.grades.map((grade) => {
                const isSelected = grade.id === effectiveGradeId;
                return (
                  <motion.button
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                    key={grade.id}
                    onClick={() => handleGradeChange(grade.id)}
                    className={`flex-shrink-0 px-6 py-2.5 rounded-xl font-space font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-nav-accent focus:ring-offset-2 ${
                      isSelected
                        ? `bg-blue-100 text-nav-accent border-2 border-blue-300 shadow-sm`
                        : `bg-white text-slate-600 border border-slate-200 hover:bg-slate-50`
                    }`}
                  >
                    {grade.name}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </section>

        {/* BREADCRUMB & SEARCH ROW */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2 font-space font-bold text-xl text-slate-900 flex-wrap">
             <span className="text-slate-500 cursor-pointer hover:text-nav-accent" onClick={() => handleChapterChange('all')}>{t('breadcrumbCourses')}</span>
             <span className="text-slate-300 font-inter">/</span>
             <span className="text-slate-500 cursor-pointer hover:text-nav-accent" onClick={() => handleChapterChange('all')}>{gradeData.name}</span>
             {effectiveChapterId !== 'all' && (
               <>
                 <span className="text-slate-300 font-inter">/</span>
                 <span className="text-slate-900">{gradeData.chapters.find(c => c.id === effectiveChapterId)?.title}</span>
               </>
             )}
          </div>
          <GradeLessonSearch value={searchQuery} onChange={setSearchQuery} gradeName={gradeData.name} />
        </section>

        {/* CLASSE SANS PROGRAMME (invariant I2 de la phase 6F).
            « Active » veut dire que la classe EXISTE, pas qu'il y a du
            contenu. La terminale algérienne est dans ce cas : aucun programme
            officiel n'a encore été fourni. Sans ce bloc, l'élève tomberait sur
            une page vide qu'il prendrait pour une panne — d'où un message qui
            DIT où en est sa classe, plutôt qu'un silence. */}
        {gradeData.curriculumStatus === 'not_supplied' && (
          <section className="bg-white border border-slate-200 rounded-xl p-6 text-center">
            <h2 className="font-space font-bold text-lg text-slate-900 mb-2">
              {t('gradeNotSuppliedTitle')}
            </h2>
            <p className="font-inter text-sm text-slate-500 max-w-md mx-auto">
              {t('gradeNotSuppliedBody')}
            </p>
          </section>
        )}

        {/* CHAPTERS SELECTOR (Only if no search active) */}
        {!searchQuery && gradeData.chapters.length > 0 && (
          <section>
            <div className="flex overflow-x-auto gap-3 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <button
                onClick={() => handleChapterChange('all')}
                className={`flex-shrink-0 px-4 py-2 rounded-lg font-inter text-sm font-medium transition-all ${
                  effectiveChapterId === 'all'
                    ? 'bg-slate-800 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {t('allChapters')}
              </button>
              {gradeData.chapters.map((chapter) => {
                const isSelected = chapter.id === effectiveChapterId;
                return (
                  <button
                    key={chapter.id}
                    onClick={() => handleChapterChange(chapter.id)}
                    className={`flex-shrink-0 inline-flex items-center px-4 py-2 rounded-lg font-inter text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-nav-accent text-white shadow-md'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>{chapter.icon && <span className="me-1.5" aria-hidden="true">{chapter.icon}</span>}{chapter.title}</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* CONTINUER (Optional - only shows if we have a lesson to resume and no search is active) */}
        {continueCourse && !searchQuery && (
          <section className="mb-8">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Play size={14} /> {t('resume')}
            </h3>
            <Link
              to={continueCourse.resumePath}
              className="group block bg-white rounded-2xl border-2 border-blue-200 p-5 shadow-sm hover:shadow-md hover:border-blue-400 transition-all max-w-2xl"
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl bg-nav-accent-soft p-3 rounded-2xl group-hover:scale-105 transition-transform">
                  {continueCourse.course.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-space font-bold text-slate-900 text-lg group-hover:text-nav-accent transition-colors">
                      {continueCourse.course.title} — {continueCourse.grade.name}
                    </h4>
                    <span className="text-sm font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform text-nav-accent">
                      {t('continue')} <ArrowForward size={14} />
                    </span>
                  </div>
                  
                  {continueCourse.progress > 0 ? (
                    <p className="font-inter text-slate-500 text-sm mt-1">{continueCourse.chapter.title} · {t('moduleOf', { current: continueCourse.resumeModule, total: continueCourse.totalModules })}</p>
                  ) : (
                    <p className="font-inter text-slate-500 text-sm mt-1 line-clamp-1">{continueCourse.course.description}</p>
                  )}
                  
                  {/* Progress Bar */}
                  {continueCourse.progress > 0 && (
                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500 bg-blue-500" style={{ width: `${continueCourse.progress}%` }} />
                      </div>
                      <span className="text-xs font-mono-jetbrains font-bold text-slate-600">{continueCourse.progress}%</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* PROGRAMME — les SUJETS officiels, quand aucune leçon n'existe encore.
            Un niveau peut être ACTIF sans porter de leçon : son programme est
            arrêté, son découpage en leçons ne l'est pas encore. Montrer
            « aucun cours ne correspond » serait alors faux deux fois — il n'y a
            pas d'erreur de sélection, et il y a bien un programme à lire. */}
        {!searchQuery && visibleTopicChapters.length > 0 && (
          <section className="space-y-5">
            <div>
              <h2 className="font-space font-bold text-lg text-slate-900">{t('chapterProgrammeTitle')}</h2>
              <p className="font-inter text-sm text-slate-500 mt-1">{t('chapterProgrammeNote')}</p>
            </div>
            {visibleTopicChapters.map((chapter) => (
              <div key={chapter.id} className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-3">
                  <h3 className="font-space font-bold text-base text-slate-900">{chapter.title}</h3>
                  {chapter.subtitle && (
                    <span className="font-inter text-xs text-slate-500">{chapter.subtitle}</span>
                  )}
                  <span className="font-mono-jetbrains text-[11px] font-semibold text-slate-400">
                    {t('topicsCount', { count: chapter.topics.length })}
                  </span>
                </div>
                <ol className="space-y-2">
                  {chapter.topics.map((topic, index) => (
                    <li key={topic.id} className="flex gap-3 font-inter text-sm text-slate-700">
                      <span className="font-mono-jetbrains text-xs text-slate-400 pt-0.5 shrink-0">
                        {index + 1}
                      </span>
                      <div>
                        <span>{topic.title}</span>
                        {(topic.namedMethods || topic.namedParts) && (
                          <span className="block text-xs text-slate-500 mt-0.5">
                            {(topic.namedMethods || topic.namedParts).join(' · ')}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
                <p className="font-inter text-xs text-slate-400 mt-4">{t('chapterLessonsPending')}</p>
              </div>
            ))}
          </section>
        )}

        {/* A grade with no lesson and no programme topic yet (the French catalogue before its lessons): say it. */}
        {!searchQuery && visibleTopicChapters.length === 0 && !gradeData.chapters.some((c) => c.lessons.length > 0) && (
          <NoLessonYet />
        )}

        {/* COURSE GRID.
            N'apparaît que s'il y a quelque chose à y montrer OU une
            recherche active : sinon son repli « aucun cours ne correspond »
            s'afficherait sous une classe qui n'a simplement AUCUNE leçon
            encore (4AM : programme sans découpage — vu plus haut ; Terminale :
            aucun chapitre du tout — invariant I2), ce qui n'est pas la même
            chose qu'une recherche sans résultat. */}
        {(filteredCourses.length > 0 || searchQuery || gradeData.chapters.some((c) => c.lessons.length > 0)) && (
          <section className="space-y-5">
            <CatalogueViewToolbar view={view} onChange={setView} count={filteredCourses.length} searching={!!searchResults} />
            <CatalogueBrowser
              chapters={visibleChapters}
              gradeChapters={gradeData.chapters}
              lessons={searchResults ? [] : filteredCourses}
              searchResults={searchResults}
              searchQuery={searchQuery}
              view={view}
              onLessonClick={(lesson) => handleCourseClick(lesson.id)}
              gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              emptyMessage={(
                <div className="py-12 text-center text-slate-500">
                  <Search size={32} className="mx-auto mb-3 opacity-20" />
                  <p>{t('noCourseMatches', { query: t('thisSelection') })}</p>
                </div>
              )}
            />
          </section>
        )}
      </div>
    </div>
  );
}
