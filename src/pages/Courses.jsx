import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Clock, Lock, Play, Search, ArrowRight } from 'lucide-react';
import { courseLevels } from '../data/coursesData';

export default function CoursesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // 1. Determine Initial State & Fallbacks (URL > localStorage > default)
  const urlLevel = searchParams.get('level');
  const urlGrade = searchParams.get('grade');

  const lsLevel = localStorage.getItem('smarter_selected_level');
  const lsGrade = localStorage.getItem('smarter_selected_grade');

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

  // Fallback defaults
  const defaultLevelId = 'college';
  
  const getValidLevelId = (id) => {
    return courseLevels.find(l => l.id === id) ? id : null;
  };

  const getValidGradeId = (levelId, gradeId) => {
    const level = courseLevels.find(l => l.id === levelId);
    if (!level) return null;
    return level.grades.find(g => g.id === gradeId) ? gradeId : null;
  };

  // Determine effective level
  const effectiveLevelId = getValidLevelId(urlLevel) || getValidLevelId(lsLevel) || defaultLevelId;
  const levelData = courseLevels.find(l => l.id === effectiveLevelId);
  const defaultGradeId = levelData.grades[0].id;
  
  // Determine effective grade (auto-correct if grade doesn't belong to level)
  const effectiveGradeId = getValidGradeId(effectiveLevelId, urlGrade) || getValidGradeId(effectiveLevelId, lsGrade) || defaultGradeId;
  const gradeData = levelData.grades.find(g => g.id === effectiveGradeId);

  // Sync back to URL and localStorage if needed
  useEffect(() => {
    let changed = false;
    const newParams = new URLSearchParams(searchParams);
    if (urlLevel !== effectiveLevelId) {
      newParams.set('level', effectiveLevelId);
      changed = true;
    }
    if (urlGrade !== effectiveGradeId) {
      newParams.set('grade', effectiveGradeId);
      changed = true;
    }
    if (changed) {
      setSearchParams(newParams, { replace: true });
    }
    
    // Update local storage
    if (lsLevel !== effectiveLevelId) localStorage.setItem('smarter_selected_level', effectiveLevelId);
    if (lsGrade !== effectiveGradeId) localStorage.setItem('smarter_selected_grade', effectiveGradeId);
  }, [effectiveLevelId, effectiveGradeId, urlLevel, urlGrade, lsLevel, lsGrade, searchParams, setSearchParams]);

  // Handlers
  const handleLevelChange = (newLevelId) => {
    const newLevel = courseLevels.find(l => l.id === newLevelId);
    let newGradeId = getValidGradeId(newLevelId, lsGrade); // Preserve grade if IDs match, otherwise reset to first grade of level
    if (!newGradeId) newGradeId = newLevel.grades[0].id;
    
    setSearchParams({ level: newLevelId, grade: newGradeId });
  };

  const handleGradeChange = (newGradeId) => {
    setSearchParams({ level: effectiveLevelId, grade: newGradeId });
  };
  
  const handleCourseClick = (courseId) => {
    localStorage.setItem('smarter_last_course', courseId);
  };

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Course Filtering
  const filteredCourses = useMemo(() => {
    if (!gradeData) return [];
    if (!searchQuery.trim()) return gradeData.lessons;
    
    const query = searchQuery.toLowerCase();
    return gradeData.lessons.filter(lesson => 
      lesson.title.toLowerCase().includes(query) || 
      lesson.description.toLowerCase().includes(query)
    );
  }, [gradeData, searchQuery]);

  // "Continuer" logic
  const continueCourse = useMemo(() => {
    const lastCourseId = localStorage.getItem('smarter_last_course');
    if (!lastCourseId) return null;
    
    let foundCourse = null;
    let foundLevel = null;
    let foundGrade = null;
    
    for (const lvl of courseLevels) {
      for (const gr of lvl.grades) {
        const c = gr.lessons.find(l => l.id === lastCourseId);
        if (c) {
          foundCourse = c;
          foundLevel = lvl;
          foundGrade = gr;
          break;
        }
      }
      if (foundCourse) break;
    }
    
    if (!foundCourse || foundCourse.status !== 'available') return null;
    
    let progressObj = null;
    try {
       const saved = localStorage.getItem(`smarter_lesson_${foundCourse.id}`);
       if (saved) {
         progressObj = JSON.parse(saved);
       }
    } catch {}
    
    let progressPercent = 0;
    let currentModule = 1;
    const totalCount = foundCourse.totalLessons || foundCourse.totalModules || 7;
    if (progressObj) {
       if (progressObj.completedModules && totalCount) {
           progressPercent = Math.round((progressObj.completedModules.length / totalCount) * 100);
           if (progressPercent > 100) progressPercent = 100;
       }
       if (progressObj.currentModule) {
           currentModule = progressObj.currentModule;
       }
    }
    
    return {
      course: foundCourse,
      level: foundLevel,
      grade: foundGrade,
      progress: progressPercent,
      currentModule,
      totalModules: totalCount
    };
  }, [effectiveLevelId, effectiveGradeId, lastFocus]); // Re-evaluate when navigation changes or focus is regained

  return (
    <div className="pt-16 min-h-screen bg-slate-50 pb-20">
      
      {/* HERO SECTION */}
      <section className="bg-white border-b border-slate-200 py-10 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono-jetbrains font-semibold uppercase tracking-wider mb-4 shadow-2xs">
            <Sparkles size={14} className="text-blue-600 animate-pulse" />
            Catalogue Interactif
          </div>
          <h1 className="font-space font-bold text-3xl sm:text-4xl text-slate-900 mb-2">
            Cours de Mathématiques
          </h1>
          <p className="font-inter text-slate-500 text-sm sm:text-base max-w-xl mx-auto">
            Trouvez rapidement votre cours et reprenez là où vous en étiez.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
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
          <div>
             <h2 className="font-space font-bold text-2xl text-slate-900 flex items-center gap-2">
               {levelData.title} <span className="text-slate-300 font-inter">›</span> {gradeData.name}
             </h2>
             <p className="font-inter text-slate-500 text-sm mt-1">{gradeData.lessons.length} cours disponibles dans cette classe.</p>
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

        {/* CONTINUER (Optional - only shows if last course exists, is in current grade, and no search is active) */}
        {continueCourse && continueCourse.grade.id === effectiveGradeId && !searchQuery && (
          <section className="mb-8">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Play size={14} /> {continueCourse.progress >= 100 ? 'Revoir' : 'Reprendre'}
            </h3>
            <Link
              to={continueCourse.progress >= 100 ? continueCourse.course.path : `${continueCourse.course.path}/${continueCourse.currentModule}`}
              className="group block bg-white rounded-2xl border-2 border-blue-200 p-5 shadow-sm hover:shadow-md hover:border-blue-400 transition-all max-w-2xl"
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl bg-blue-50 p-3 rounded-2xl group-hover:scale-105 transition-transform">
                  {continueCourse.course.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-space font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">
                      {continueCourse.course.title}
                    </h4>
                    <span className={`text-sm font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform ${continueCourse.progress >= 100 ? 'text-emerald-600' : 'text-blue-600'}`}>
                      {continueCourse.progress >= 100 ? 'Revoir' : 'Continuer'} <ArrowRight size={14} />
                    </span>
                  </div>
                  
                  {continueCourse.progress > 0 && continueCourse.progress < 100 ? (
                    <p className="font-inter text-slate-500 text-sm mt-1">{continueCourse.grade.name} · Module {continueCourse.currentModule} sur {continueCourse.totalModules}</p>
                  ) : continueCourse.progress >= 100 ? (
                    <p className="font-inter text-emerald-600 text-sm mt-1 font-semibold flex items-center gap-1">✓ Cours terminé</p>
                  ) : (
                    <p className="font-inter text-slate-500 text-sm mt-1 line-clamp-1">{continueCourse.course.description}</p>
                  )}
                  
                  {/* Progress Bar */}
                  {continueCourse.progress > 0 && (
                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${continueCourse.progress >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${continueCourse.progress}%` }} />
                      </div>
                      <span className={`text-xs font-mono-jetbrains font-bold ${continueCourse.progress >= 100 ? 'text-emerald-600' : 'text-slate-600'}`}>{continueCourse.progress}%</span>
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
                  <p>Aucun cours ne correspond à "{searchQuery}".</p>
                </motion.div>
              ) : (
                filteredCourses.map((lesson) => {
                  const isAvailable = lesson.status === 'available';

                  // Calculate local progress for this specific course if available
                  let progressPercent = 0;
                  const totalCount = lesson.totalLessons || lesson.totalModules || 7;
                  if (isAvailable && totalCount) {
                    try {
                      const saved = localStorage.getItem(`smarter_lesson_${lesson.id}`);
                      if (saved) {
                        const parsed = JSON.parse(saved);
                        progressPercent = Math.round((parsed.completedModules.length / totalCount) * 100);
                        if (progressPercent > 100) progressPercent = 100;
                      }
                    } catch {}
                  }

                  return isAvailable ? (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      key={lesson.id}
                      className="h-full"
                    >
                      <Link
                        to={lesson.path}
                        onClick={() => handleCourseClick(lesson.id)}
                        className="group relative bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between h-full overflow-hidden"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-4">
                            <span className="text-3xl group-hover:scale-110 transition-transform origin-bottom-left">
                              {lesson.icon}
                            </span>
                            {progressPercent > 0 ? (
                               <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono-jetbrains text-[10px] font-bold ${progressPercent >= 100 ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
                                 {progressPercent >= 100 ? '✓ ' : ''}{progressPercent}%
                               </span>
                            ) : lesson.isNew ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-mono-jetbrains text-[10px] font-bold">
                                NOUVEAU
                              </span>
                            ) : null}
                          </div>

                          <h4 className="font-space font-bold text-slate-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
                            {lesson.title}
                          </h4>

                          <p className="font-inter text-slate-500 text-sm leading-relaxed line-clamp-3 mb-4">
                            {lesson.description}
                          </p>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-3 text-xs font-mono-jetbrains text-slate-500">
                            <span className="flex items-center gap-1"><Clock size={14} /> {lesson.duration}</span>
                          </div>
                          <span className={`font-bold text-sm group-hover:translate-x-1 transition-transform flex items-center gap-1 ${progressPercent >= 100 ? 'text-emerald-600' : 'text-blue-600'}`}>
                            {progressPercent >= 100 ? 'Terminé' : progressPercent > 0 ? 'Continuer' : 'Commencer'} <ArrowRight size={14} />
                          </span>
                        </div>
                        
                        {/* Subtle progress bar at bottom of card */}
                        {progressPercent > 0 && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100">
                            <div className={`h-full ${progressPercent >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${progressPercent}%` }} />
                          </div>
                        )}
                      </Link>
                    </motion.div>
                  ) : (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      key={lesson.id}
                      className="bg-slate-50/50 rounded-2xl border border-slate-200/50 p-5 flex flex-col justify-between opacity-75 h-full"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <span className="text-3xl grayscale opacity-50">
                            {lesson.icon}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-200/50 text-slate-500 font-mono-jetbrains text-[10px] font-semibold">
                            <Lock size={10} />
                            Bientôt
                          </span>
                        </div>

                        <h4 className="font-space font-bold text-slate-700 text-lg mb-2">
                          {lesson.title}
                        </h4>

                        <p className="font-inter text-slate-400 text-sm leading-relaxed line-clamp-2 mb-4">
                          {lesson.description}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-slate-200/50 flex items-center justify-between text-xs font-mono-jetbrains text-slate-400 mt-auto">
                        <span className="flex items-center gap-1"><Clock size={14} /> {lesson.duration}</span>
                        <span className="font-medium">En préparation</span>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>
    </div>
  );
}
