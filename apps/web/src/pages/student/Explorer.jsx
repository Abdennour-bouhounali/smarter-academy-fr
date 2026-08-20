import { useContext, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Star, Compass } from 'lucide-react';
import { courseLevels, getAllGrades } from '@smarter-academy/core';
import { AuthContext } from '../../context/AuthContext';
import { getLessonProgress } from '../../lessons/common/utils/progress/getLessonProgress';
import { getTotalModules } from '../../lessons/registry';
import LessonCard from '../../components/student/LessonCard';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';

export default function Explorer() {
  useDocumentMeta('Explorer', 'Explore tous les niveaux du programme, de la 6e à la Terminale.');
  const { user } = useContext(AuthContext);

  const allGrades = useMemo(() => getAllGrades(), []);
  const myGrade = allGrades.find((g) => g.id === user?.grade) || null;
  const otherGrades = allGrades.filter((g) => g.id !== user?.grade);

  const [selectedGradeId, setSelectedGradeId] = useState(user?.grade || allGrades[0]?.id);
  const [activeChapter, setActiveChapter] = useState('all');

  const selectedGrade = allGrades.find((g) => g.id === selectedGradeId);
  const levelData = selectedGrade ? courseLevels.find((l) => l.id === selectedGrade.levelId) : null;
  const gradeData = levelData ? levelData.grades.find((g) => g.id === selectedGradeId) : null;

  const handleSelectGrade = (gradeId) => {
    setSelectedGradeId(gradeId);
    setActiveChapter('all');
  };

  const getChapterProgress = (chapter) => {
    const available = chapter.lessons.filter((l) => l.status === 'available');
    if (!available.length) return 0;
    const total = available.reduce((sum, l) => sum + getLessonProgress(l.id, getTotalModules(l.id)).progressPercent, 0);
    return Math.round(total / available.length);
  };

  const lessons = useMemo(() => {
    if (!gradeData) return [];
    if (activeChapter === 'all') return gradeData.chapters.flatMap((c) => c.lessons);
    return gradeData.chapters.find((c) => c.id === activeChapter)?.lessons || [];
  }, [gradeData, activeChapter]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-10">
      <div className="mb-8">
        <p className="font-mono-jetbrains text-blue-500 text-xs font-semibold tracking-widest uppercase mb-2 flex items-center gap-1.5">
          <Compass size={13} /> Explorer
        </p>
        <h1 className="font-space font-bold text-2xl sm:text-3xl text-slate-900">Tout le programme, du Collège au Lycée</h1>
        <p className="font-inter text-slate-500 text-sm mt-1">Ton niveau reste ton point de départ — mais rien ne t'empêche de regarder plus loin.</p>
      </div>

      {/* Mon niveau */}
      {myGrade && (
        <div className="mb-6">
          <h2 className="font-space font-bold text-slate-400 text-xs uppercase tracking-widest mb-3">Mon niveau</h2>
          <button
            onClick={() => handleSelectGrade(myGrade.id)}
            className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-space font-bold text-sm transition-all ${
              selectedGradeId === myGrade.id
                ? 'text-white shadow-md'
                : 'bg-white text-slate-700 border-2 border-blue-200 hover:border-blue-300'
            }`}
            style={selectedGradeId === myGrade.id ? { background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' } : {}}
          >
            <Star size={15} className={selectedGradeId === myGrade.id ? 'text-white' : 'text-blue-500'} />
            {myGrade.name}
          </button>
        </div>
      )}

      {/* Autres niveaux */}
      <div className="mb-8">
        <h2 className="font-space font-bold text-slate-400 text-xs uppercase tracking-widest mb-3">Autres niveaux</h2>
        <div className="flex flex-wrap gap-2">
          {otherGrades.map((g) => (
            <button
              key={g.id}
              onClick={() => handleSelectGrade(g.id)}
              className={`px-4 py-2.5 rounded-xl font-inter text-sm font-semibold transition-all ${
                selectedGradeId === g.id
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      {gradeData && (
        <>
          {/* Chapter filter */}
          <div className="flex overflow-x-auto gap-2 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 mb-6 border-t border-slate-200 pt-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button
              onClick={() => setActiveChapter('all')}
              className={`flex-shrink-0 px-4 py-2 rounded-lg font-inter text-sm font-medium transition-all ${
                activeChapter === 'all' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Tous les chapitres
            </button>
            {gradeData.chapters.map((chapter) => {
              const isSelected = chapter.id === activeChapter;
              const progress = getChapterProgress(chapter);
              return (
                <button
                  key={chapter.id}
                  onClick={() => setActiveChapter(chapter.id)}
                  className={`flex-shrink-0 flex flex-col items-start px-4 py-2 rounded-lg font-inter text-sm font-medium transition-all ${
                    isSelected ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>{chapter.title}</span>
                  <span className={`text-[10px] mt-0.5 font-bold ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                    {chapter.lessons.length} leçon{chapter.lessons.length > 1 ? 's' : ''} · {progress}%
                  </span>
                </button>
              );
            })}
          </div>

          <motion.div key={selectedGradeId + activeChapter} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {lessons.length === 0 ? (
                <p className="col-span-full text-center py-10 text-slate-400 font-inter text-sm">Aucune leçon dans ce chapitre pour l'instant.</p>
              ) : (
                lessons.map((lesson) => <LessonCard key={lesson.id} lesson={lesson} />)
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </div>
  );
}
