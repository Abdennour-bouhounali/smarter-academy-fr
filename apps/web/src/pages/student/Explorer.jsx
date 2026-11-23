import { useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Star, Compass } from 'lucide-react';
import { courseLevels, getAllGrades } from '@smarter-academy/core';
import { AuthContext } from '../../context/AuthContext';
import CatalogueBrowser from '../../components/student/CatalogueBrowser';
import CatalogueViewToolbar from '../../components/student/CatalogueViewToolbar';
import { useCatalogueView } from '../../components/student/catalogueView';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import GradeLessonSearch, { filterLessonsByQuery } from '../../components/student/GradeLessonSearch';

export default function Explorer() {
  const { t } = useTranslation('student');
  useDocumentMeta(t('explorer.metaTitle'), t('explorer.metaDescription'));
  const { user } = useContext(AuthContext);

  const allGrades = useMemo(() => getAllGrades(), []);
  const myGrade = allGrades.find((g) => g.id === user?.grade) || null;
  const otherGrades = allGrades.filter((g) => g.id !== user?.grade);

  // Sans classe (enseignant) : la première classe qui a des leçons publiées, sinon la première dont les leçons sont
  // annoncées (3e, toutes « coming soon » depuis le 2026-11-22), sinon la première.
  const [selectedGradeId, setSelectedGradeId] = useState(
    user?.grade
      || (allGrades.find((g) => g.lessonCount > 0) ?? allGrades.find((g) => g.catalogueLessonCount > 0) ?? allGrades[0])?.id,
  );
  const [activeChapter, setActiveChapter] = useState('all');

  const selectedGrade = allGrades.find((g) => g.id === selectedGradeId);
  const levelData = selectedGrade ? courseLevels.find((l) => l.id === selectedGrade.levelId) : null;
  const gradeData = levelData ? levelData.grades.find((g) => g.id === selectedGradeId) : null;

  const handleSelectGrade = (gradeId) => {
    setSelectedGradeId(gradeId);
    setActiveChapter('all');
  };


  const lessons = useMemo(() => {
    if (!gradeData) return [];
    if (activeChapter === 'all') return gradeData.chapters.flatMap((c) => c.lessons);
    return gradeData.chapters.find((c) => c.id === activeChapter)?.lessons || [];
  }, [gradeData, activeChapter]);

  // Les thèmes visibles — la vue choisie les dessine (CatalogueBrowser,
  // catalogueView.js ; même préférence que /courses et « Mes leçons »).
  const visibleChapters = useMemo(() => {
    if (!gradeData) return [];
    return activeChapter === 'all' ? gradeData.chapters : gradeData.chapters.filter((c) => c.id === activeChapter);
  }, [gradeData, activeChapter]);
  const [view, setView] = useCatalogueView();

  // La recherche de /courses (GradeLessonSearch) : tous les thèmes du
  // niveau, titre + description. Vide → la structure en chapitres ci-dessous ;
  // sinon les leçons trouvées, à plat.
  const [searchQuery, setSearchQuery] = useState('');
  const searchResults = useMemo(
    () => (gradeData ? filterLessonsByQuery(gradeData.chapters.flatMap((c) => c.lessons), searchQuery) : null),
    [gradeData, searchQuery],
  );

  return (
    <div className="sa-page py-8 sm:py-10">
      <div className="mb-8">
        <p className="font-mono-jetbrains text-blue-500 text-xs font-semibold tracking-widest uppercase mb-2 flex items-center gap-1.5">
          <Compass size={13} /> {t('explorer.eyebrow')}
        </p>
        <h1 className="font-space font-bold text-2xl sm:text-3xl text-slate-900">{t('explorer.title')}</h1>
        <p className="font-inter text-slate-500 text-sm mt-1">{t('explorer.subtitle')}</p>
      </div>

      {gradeData && (
        <div className="mb-8" data-tour="catalogue.search">
          <GradeLessonSearch value={searchQuery} onChange={setSearchQuery} gradeName={gradeData.name} className="w-full md:w-96" />
        </div>
      )}

      {/* Mon niveau */}
      {myGrade && (
        <div className="mb-6" data-tour="catalogue.mygrade">
          <h2 className="font-space font-bold text-slate-400 text-xs uppercase tracking-widest mb-3">{t('explorer.myGrade')}</h2>
          <button
            onClick={() => handleSelectGrade(myGrade.id)}
            className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-space font-bold text-sm transition-all ${
              selectedGradeId === myGrade.id
                ? 'text-white shadow-md'
                : 'bg-white text-slate-700 border-2 border-blue-200 hover:border-blue-300'
            }`}
            style={selectedGradeId === myGrade.id ? { background: '#3B5BDB' } : {}}
          >
            <Star size={15} className={selectedGradeId === myGrade.id ? 'text-white' : 'text-blue-500'} />
            {myGrade.name}
          </button>
        </div>
      )}

      {/* Autres niveaux */}
      <div className="mb-8" data-tour="catalogue.grades">
        <h2 className="font-space font-bold text-slate-400 text-xs uppercase tracking-widest mb-3">{t('explorer.otherGrades')}</h2>
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
          <div data-tour="catalogue.chapters" className="flex overflow-x-auto gap-2 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 mb-6 border-t border-slate-200 pt-6 lg:flex-wrap lg:overflow-visible [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button
              onClick={() => setActiveChapter('all')}
              className={`flex-shrink-0 px-4 py-2 rounded-lg font-inter text-sm font-medium transition-all ${
                activeChapter === 'all' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {t('courses.allChapters')}
            </button>
            {gradeData.chapters.map((chapter) => {
              const isSelected = chapter.id === activeChapter;
              return (
                <button
                  key={chapter.id}
                  onClick={() => setActiveChapter(chapter.id)}
                  className={`flex-shrink-0 inline-flex items-center px-4 py-2 rounded-lg font-inter text-sm font-medium transition-all ${
                    isSelected ? 'bg-nav-accent text-white shadow-md' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>{chapter.icon && <span className="me-1.5" aria-hidden="true">{chapter.icon}</span>}{chapter.title}</span>
                </button>
              );
            })}
          </div>

          <div className="mb-5" data-tour="catalogue.view">
            <CatalogueViewToolbar view={view} onChange={setView} count={(searchResults ?? lessons).length} searching={!!searchResults} />
          </div>

          <motion.div data-tour="catalogue.list" key={selectedGradeId + activeChapter + (searchResults ? ':search' : '')} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <CatalogueBrowser
              chapters={visibleChapters}
              gradeChapters={gradeData.chapters}
              lessons={lessons}
              searchResults={searchResults}
              searchQuery={searchQuery}
              view={view}
              emptyMessage={<p className="text-center py-10 text-slate-400 font-inter text-sm">{t('explorer.emptyChapter')}</p>}
            />
          </motion.div>
        </>
      )}
    </div>
  );
}
