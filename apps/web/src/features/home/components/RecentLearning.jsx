import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { History, Check } from 'lucide-react';
import { ArrowForward } from '../../../components/common/DirectionalIcons';
import SectionHeading from './SectionHeading';
import PathProgress from '../../progression/components/PathProgress';

/**
 * « ↻ Reprends ton parcours » — les trois dernières leçons touchées, chacune avec son
 * contexte (chapitre, sinon thème), sa progression réelle ou sa marque
 * « terminée », et un lien vers le BON endroit : la prochaine étape pour une
 * leçon en cours (chemin du registre, via l'arbre), le sommaire pour une
 * leçon terminée. La liste complète est sur « Ma progression ».
 */
export default function RecentLearning({ items, treeIndex }) {
  const { t } = useTranslation('student');
  return (
    <section aria-labelledby="home-recent-title" className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 h-full" data-home-recent>
      <SectionHeading id="home-recent-title" icon={History} tone="amber" title={t('home.recentTitle')} action={items.length > 0 ? { to: '/espace/progression', label: t('home.seeAll') } : undefined} />
      {items.length === 0 ? (
        <p className="font-inter text-slate-400 text-sm">{t('home.nothingYet')}</p>
      ) : (
        <ul className="divide-y divide-slate-100 -my-1">
          {items.map((entry) => {
            const node = treeIndex.get(entry.lesson.id);
            const context = node?.group.kind === 'unit' ? node.group.title : node?.field.title;
            const done = entry.progressPercent >= 100;
            const to = node?.lesson.cta.path || entry.lesson.path;
            return (
              <li key={entry.lesson.id}>
                <Link
                  to={to}
                  className="group flex items-center gap-3 py-3 -mx-2 px-2 rounded-xl hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-nav-accent"
                  data-home-recent-item={entry.lesson.id}
                >
                  <span className="text-2xl leading-none flex-shrink-0 w-9 text-center" aria-hidden="true">{entry.lesson.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-space font-bold text-slate-800 text-sm truncate group-hover:text-nav-accent transition-colors">{entry.lesson.title}</p>
                    {context && <p className="font-inter text-slate-500 text-xs truncate">{context}</p>}
                    {!done && <PathProgress percent={entry.progressPercent} size="sm" className="mt-1.5 max-w-[240px]" />}
                  </div>
                  {done ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1 text-[11px] font-mono-jetbrains font-bold flex-shrink-0">
                      <Check size={11} aria-hidden="true" /> {t('home.lessonDone')}
                    </span>
                  ) : (
                    <ArrowForward size={16} aria-hidden="true" className="text-slate-300 group-hover:text-blue-500 transition-all group-hover:translate-x-1 flex-shrink-0" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
