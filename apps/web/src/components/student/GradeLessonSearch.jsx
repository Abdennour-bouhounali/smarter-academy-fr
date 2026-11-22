import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';

/**
 * LA recherche de leçon des pages de catalogue — /courses, « دروسي »,
 * « استكشاف » et /enseignant/cours partagent ce champ et cette règle, pour
 * qu'une recherche se comporte partout pareil.
 *
 * Règle (celle de /courses, reprise telle quelle) : le texte est cherché
 * dans le titre ET la description, sans casse, à travers TOUS les ميادين
 * du niveau ; une recherche vide rend la sélection courante. Pendant une
 * recherche, les pages montrent les leçons à plat (hors unités) ; sans
 * recherche, elles gardent leur structure en وحدات.
 */
export function filterLessonsByQuery(allLessons, query) {
  const q = (query ?? '').trim().toLowerCase();
  if (!q) return null;
  return (allLessons ?? []).filter((lesson) =>
    (lesson.title ?? '').toLowerCase().includes(q)
    || (lesson.description ?? '').toLowerCase().includes(q));
}

export default function GradeLessonSearch({ value, onChange, gradeName, className = 'w-full md:w-72' }) {
  const { t } = useTranslation('common');
  return (
    <div className={`relative ${className}`}>
      <Search size={18} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
      <input
        type="text"
        placeholder={t('searchInGrade', { grade: gradeName })}
        aria-label={t('searchInGrade', { grade: gradeName })}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white border border-slate-200 rounded-xl ps-10 pe-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-nav-accent focus:border-transparent transition-shadow shadow-sm"
        data-lesson-search
      />
    </div>
  );
}

/** Le repli d'une recherche sans résultat — le texte de /courses. */
export function NoLessonMatches({ query }) {
  const { t } = useTranslation('common');
  return (
    <div className="col-span-full py-12 text-center text-slate-500" data-lesson-search-empty>
      <Search size={32} className="mx-auto mb-3 opacity-20" aria-hidden="true" />
      <p>{t('noCourseMatches', { query: `"${query}"` })}</p>
    </div>
  );
}
