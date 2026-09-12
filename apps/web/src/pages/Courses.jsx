import React, { useState, useContext, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Lock, Crown, Play, Search, ArrowRight } from 'lucide-react';
import { courseLevels } from '@smarter-academy/core';
import { getResumeLesson } from '../lessons/common/utils/progress/getResumeLesson';
import { getLessonProgress } from '../lessons/common/utils/progress/getLessonProgress';
import { getTotalModules } from '../lessons/registry';
import { storage, scopedStorage } from '../utils/storage';
import { AuthContext } from '../context/AuthContext';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import LessonCard from '../components/student/LessonCard';

export default function CoursesPage() {
  useDocumentMeta(
    'Cours',
    "Explore le programme de mathématiques du Collège au Lycée — 6e, 5e, 4e, 3e, 2nde, 1ère, Terminale. La 6e est l'expérience la plus complète aujourd'hui."
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const { user, loading: authLoading } = useContext(AuthContext);

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
  const defaultLevelId = 'college';
  const getValidLevelId = (id) => courseLevels.find(l => l.id === id) ? id : null;
  
  const effectiveLevelId = getValidLevelId(urlLevel) || getValidLevelId(profileLevel) || getValidLevelId(lsLevel) || defaultLevelId;
  const levelData = courseLevels.find(l => l.id === effectiveLevelId);

  const getValidGradeId = (levelId, gradeId) => {
    const level = courseLevels.find(l => l.id === levelId);
    if (!level) return null;
    return level.grades.find(g => g.id === gradeId) ? gradeId : null;
  };

  const effectiveGradeId = getValidGradeId(effectiveLevelId, urlGrade) || getValidGradeId(effectiveLevelId, profileGrade) || getValidGradeId(effectiveLevelId, lsGrade) || levelData.grades[levelData.grades.length - 1].id;
  const gradeData = levelData.grades.find(g => g.id === effectiveGradeId);

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
    if (authLoading) return;

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

    if (!searchQuery.trim()) return targetLessons;
    
    const query = searchQuery.toLowerCase();
    // When searching, we search across all chapters of the grade regardless of effectiveChapterId
    const allLessons = gradeData.chapters.flatMap(c => c.lessons);
    return allLessons.filter(lesson => 
      lesson.title.toLowerCase().includes(query) || 
      lesson.description.toLowerCase().includes(query)
    );
  }, [gradeData, effectiveChapterId, searchQuery]);

  // "Continuer" logic
  const continueCourse = useMemo(() => {
    return getResumeLesson(courseLevels);
  }, [lastFocus]);

  // Chapter Stats
  const getChapterProgress = (chapter) => {
    if (!chapter.lessons || chapter.lessons.length === 0) return 0;
    const availableLessons = chapter.lessons.filter(l => l.status === 'available');
    if (availableLessons.length === 0) return 0;

    const totalPercent = availableLessons.reduce(
      (sum, lesson) => sum + getLessonProgress(lesson.id, getTotalModules(lesson.id)).progressPercent,
      0
    );
    return Math.round(totalPercent / availableLessons.length);
  };

  return (
    <div className={`min-h-screen bg-slate-50 pb-20 ${user ? 'pt-6 lg:pt-10' : 'pt-16'}`}>
      
      {!user ? (
        <section className="bg-white border-b border-slate-200 py-10 px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono-jetbrains font-semibold uppercase tracking-wider mb-4 shadow-2xs">
              <Sparkles size={14} className="text-blue-600 animate-pulse" />
              Programme complet — 6e à Terminale
            </div>
            <h1 className="font-space font-bold text-3xl sm:text-4xl text-slate-900 mb-2">
              Cours de Mathématiques
            </h1>
            <p className="font-inter text-slate-500 text-sm sm:text-base max-w-xl mx-auto mb-5">
              2 leçons complètes offertes par niveau. La 6e est aujourd'hui la plus complète.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <span className="flex items-center gap-1.5 text-xs font-inter font-medium text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Gratuit
              </span>
              <span className="flex items-center gap-1.5 text-xs font-inter font-medium text-slate-500">
                <Crown size={12} className="text-violet-500" /> Premium
              </span>
              <span className="flex items-center gap-1.5 text-xs font-inter font-medium text-slate-500">
                <Lock size={12} className="text-slate-400" /> Bientôt disponible
              </span>
            </div>
          </div>
        </section>
      ) : (
        <div className="sa-page mb-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <p className="font-mono-jetbrains text-blue-500 text-xs font-semibold tracking-widest uppercase mb-2">
              Catalogue
            </p>
            <h1 className="font-space font-bold text-2xl sm:text-3xl text-slate-900">
              Explorer les cours
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
                    className={`flex-shrink-0 px-6 py-2.5 rounded-xl font-space font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      isSelected
                        ? `bg-blue-100 text-blue-800 border-2 border-blue-300 shadow-sm`
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
             <span className="text-slate-500 cursor-pointer hover:text-blue-600" onClick={() => handleChapterChange('all')}>Cours</span>
             <span className="text-slate-300 font-inter">/</span>
             <span className="text-slate-500 cursor-pointer hover:text-blue-600" onClick={() => handleChapterChange('all')}>{gradeData.name}</span>
             {effectiveChapterId !== 'all' && (
               <>
                 <span className="text-slate-300 font-inter">/</span>
                 <span className="text-slate-900">{gradeData.chapters.find(c => c.id === effectiveChapterId)?.title}</span>
               </>
             )}
          </div>
          <div className="relative w-full md:w-72">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder={`Rechercher en ${gradeData.name}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow shadow-sm"
            />
          </div>
        </section>

        {/* CHAPTERS SELECTOR (Only if no search active) */}
        {!searchQuery && (
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
                Tous les chapitres
              </button>
              {gradeData.chapters.map((chapter) => {
                const isSelected = chapter.id === effectiveChapterId;
                const progress = getChapterProgress(chapter);
                return (
                  <button
                    key={chapter.id}
                    onClick={() => handleChapterChange(chapter.id)}
                    className={`flex-shrink-0 flex flex-col items-start px-4 py-2 rounded-lg font-inter text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>{chapter.title}</span>
                    <span className={`text-[10px] mt-0.5 font-bold ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                      {chapter.lessons.length} leçon{chapter.lessons.length > 1 ? 's' : ''} • {progress}%
                    </span>
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
              <Play size={14} /> Reprendre
            </h3>
            <Link
              to={continueCourse.resumePath}
              className="group block bg-white rounded-2xl border-2 border-blue-200 p-5 shadow-sm hover:shadow-md hover:border-blue-400 transition-all max-w-2xl"
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl bg-blue-50 p-3 rounded-2xl group-hover:scale-105 transition-transform">
                  {continueCourse.course.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-space font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">
                      {continueCourse.course.title} — {continueCourse.grade.name}
                    </h4>
                    <span className="text-sm font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform text-blue-600">
                      Continuer <ArrowRight size={14} />
                    </span>
                  </div>
                  
                  {continueCourse.progress > 0 ? (
                    <p className="font-inter text-slate-500 text-sm mt-1">{continueCourse.chapter.title} · Module {continueCourse.resumeModule} sur {continueCourse.totalModules}</p>
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

        {/* COURSE GRID */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredCourses.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="col-span-full py-12 text-center text-slate-500"
                >
                  <Search size={32} className="mx-auto mb-3 opacity-20" />
                  <p>Aucun cours ne correspond à {searchQuery ? `"${searchQuery}"` : "cette sélection"}.</p>
                </motion.div>
              ) : (
                filteredCourses.map((lesson) => (
                  <LessonCard key={lesson.id} lesson={lesson} onClick={() => handleCourseClick(lesson.id)} />
                ))
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>
    </div>
  );
}
