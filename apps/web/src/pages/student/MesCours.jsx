import { useContext, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Compass, BookOpen } from 'lucide-react';
import { courseLevels, getAllGrades } from '@smarter-academy/core';
import { AuthContext } from '../../context/AuthContext';
import CatalogueBrowser from '../../components/student/CatalogueBrowser';
import CatalogueViewToolbar from '../../components/student/CatalogueViewToolbar';
import { useCatalogueView } from '../../components/student/catalogueView';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import GradeLessonSearch, { filterLessonsByQuery } from '../../components/student/GradeLessonSearch';
import { usePrefetchLessonRuntime } from '../../lessons/common/lessonRuntimeLoader';
import NoLessonYet from '../../components/student/NoLessonYet';

export default function MesCours() {
  // Cette page mène à des leçons : leur runtime partagé arrive pendant
  // l'inactivité, le clic ne l'attend pas (lessonRuntimeLoader.js).
  usePrefetchLessonRuntime();
  const { t } = useTranslation('student');
  useDocumentMeta(t('courses.metaTitle'), t('courses.metaDescription'));
  const { user } = useContext(AuthContext);
  // Le thème vient de l'URL (`?chapter=`) : le fil d'Ariane d'une unité,
  // d'une leçon ou d'un module y mène l'élève (catalogueLink.js). Un
  // identifiant inconnu de son niveau retombe sur « Tous les thèmes ».
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedChapter = searchParams.get('chapter') || 'all';

  const grade = useMemo(() => getAllGrades().find((g) => g.id === user?.grade), [user?.grade]);
  const level = grade ? courseLevels.find((l) => l.id === grade.levelId) : null;
  const gradeData = level ? level.grades.find((g) => g.id === grade.id) : null;
  const activeChapter = gradeData?.chapters.some((c) => c.id === requestedChapter) ? requestedChapter : 'all';
  const setActiveChapter = (id) => setSearchParams(id === 'all' ? {} : { chapter: id }, { replace: true });


  const lessons = useMemo(() => {
    if (!gradeData) return [];
    if (activeChapter === 'all') return gradeData.chapters.flatMap((c) => c.lessons);
    return gradeData.chapters.find((c) => c.id === activeChapter)?.lessons || [];
  }, [gradeData, activeChapter]);

  // Les thèmes visibles — la vue choisie (chapitres / thèmes / toutes les leçons,
  // Grille / Liste) les dessine (CatalogueBrowser, catalogueView.js).
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

  if (!grade || !gradeData) {
    return (
      <div className="sa-page py-10 text-center">
        <div className="glass-card p-10">
          <BookOpen size={32} className="mx-auto mb-4 text-slate-300" />
          <h1 className="font-space font-bold text-xl text-slate-800 mb-2">{t('courses.noGradeTitle')}</h1>
          <p className="font-inter text-slate-500 text-sm mb-6">{t('courses.noGradeBody')}</p>
          <Link to="/espace/profil" className="btn-primary text-sm inline-flex">{t('courses.goToProfile')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="sa-page py-8 sm:py-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <p className="font-mono-jetbrains text-blue-500 text-xs font-semibold tracking-widest uppercase mb-2">
            {level?.title}
          </p>
          <h1 className="font-space font-bold text-2xl sm:text-3xl text-slate-900">{t('courses.title', { grade: grade.name })}</h1>
        </div>
        <Link to="/espace/explorer" className="inline-flex items-center gap-2 text-sm font-semibold text-nav-accent hover:text-nav-accent transition-colors">
          <Compass size={15} />
          {t('courses.exploreOtherGrades')}
        </Link>
      </div>

      {/* No lesson in his grade yet: one honest line, not a search box over nothing. */}
      {!gradeData.chapters.some((c) => c.lessons.length > 0) ? (
        <NoLessonYet />
      ) : (
      <>
      <div className="mb-6" data-tour="catalogue.search">
        <GradeLessonSearch value={searchQuery} onChange={setSearchQuery} gradeName={grade.name} className="w-full md:w-96" />
      </div>

      {/* Chapter filter */}
      <div data-tour="catalogue.chapters" className="flex overflow-x-auto gap-2 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 mb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <button
          onClick={() => setActiveChapter('all')}
          className={`flex-shrink-0 px-4 py-2 rounded-lg font-inter text-sm font-medium transition-all ${
            activeChapter === 'all' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
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

      <div data-tour="catalogue.list">
        <CatalogueBrowser
          chapters={visibleChapters}
          gradeChapters={gradeData.chapters}
          lessons={lessons}
          searchResults={searchResults}
          searchQuery={searchQuery}
          view={view}
        />
      </div>
      </>
      )}
    </div>
  );
}
