import { useContext, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Compass, BookOpen } from 'lucide-react';
import { courseLevels, getAllGrades } from '@smarter-academy/core';
import { AuthContext } from '../../context/AuthContext';
import { getLessonProgress } from '../../lessons/common/utils/progress/getLessonProgress';
import { getTotalModules } from '../../lessons/registry';
import LessonCard from '../../components/student/LessonCard';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';

export default function MesCours() {
  useDocumentMeta('Mes cours', 'Toutes les leçons de ta classe, organisées par chapitre.');
  const { user } = useContext(AuthContext);
  const [activeChapter, setActiveChapter] = useState('all');

  const grade = useMemo(() => getAllGrades().find((g) => g.id === user?.grade), [user?.grade]);
  const level = grade ? courseLevels.find((l) => l.id === grade.levelId) : null;
  const gradeData = level ? level.grades.find((g) => g.id === grade.id) : null;

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

  if (!grade || !gradeData) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10 text-center">
        <div className="glass-card p-10">
          <BookOpen size={32} className="mx-auto mb-4 text-slate-300" />
          <h1 className="font-space font-bold text-xl text-slate-800 mb-2">Aucune classe sélectionnée</h1>
          <p className="font-inter text-slate-500 text-sm mb-6">Choisis ta classe dans ton profil pour voir tes cours.</p>
          <Link to="/espace/profil" className="btn-primary text-sm inline-flex">Aller à mon profil</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <p className="font-mono-jetbrains text-blue-500 text-xs font-semibold tracking-widest uppercase mb-2">
            {level?.title}
          </p>
          <h1 className="font-space font-bold text-2xl sm:text-3xl text-slate-900">Mes cours — {grade.name}</h1>
        </div>
        <Link to="/espace/explorer" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
          <Compass size={15} />
          Explorer d'autres niveaux
        </Link>
      </div>

      {/* Chapter filter */}
      <div className="flex overflow-x-auto gap-2 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 mb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <button
          onClick={() => setActiveChapter('all')}
          className={`flex-shrink-0 px-4 py-2 rounded-lg font-inter text-sm font-medium transition-all ${
            activeChapter === 'all' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {lessons.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
