import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Compass, BookOpen, TrendingUp, NotebookPen } from 'lucide-react';
import { ArrowForward } from '../../../components/common/DirectionalIcons';
import SectionHeading from './SectionHeading';

/**
 * « 🧭 فضاؤك » — les portes des trois espaces de l'élève, avec leur
 * question : دروسي (« que puis-je apprendre ? »), تقدّمي (« où en suis-je ? »),
 * كرّاسي (« qu'ai-je noté ? »). L'accueil les RELIE, il ne les résume pas.
 *
 * Les chemins sont ceux du routeur (App.jsx) — rien d'autre. « خريطتي » (la
 * carte des connaissances) n'a pas de page propre : elle vit dans chaque
 * leçon, donc elle n'a pas de carte ici.
 */
const SPACES = [
  {
    to: '/espace/cours',
    icon: BookOpen,
    titleKey: 'home.spaceCourses',
    hintKey: 'home.spaceCoursesHint',
    tile: 'bg-nav-accent-soft text-nav-accent',
    hover: 'hover:border-blue-300',
    arrow: 'group-hover:text-blue-500',
  },
  {
    to: '/espace/progression',
    icon: TrendingUp,
    titleKey: 'home.spaceProgression',
    hintKey: 'home.spaceProgressionHint',
    tile: 'bg-emerald-50 text-emerald-600',
    hover: 'hover:border-emerald-300',
    arrow: 'group-hover:text-emerald-500',
  },
  {
    to: '/espace/cahier',
    icon: NotebookPen,
    titleKey: 'home.spaceNotebook',
    hintKey: 'home.spaceNotebookHint',
    tile: 'bg-amber-50 text-amber-600',
    hover: 'hover:border-amber-300',
    arrow: 'group-hover:text-amber-500',
  },
];

export default function LearningSpaceNav() {
  const { t } = useTranslation('student');
  return (
    <section aria-labelledby="home-space-title" data-home-space>
      <SectionHeading id="home-space-title" icon={Compass} tone="violet" title={t('home.spaceTitle')} />
      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {SPACES.map((s) => (
          <li key={s.to}>
            <Link
              to={s.to}
              className={`group flex sm:flex-col items-center sm:items-start gap-4 sm:gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 min-h-[64px] transition-all hover:shadow-md hover:shadow-slate-200/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-nav-accent ${s.hover}`}
            >
              <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl flex-shrink-0 ${s.tile}`} aria-hidden="true">
                <s.icon size={20} />
              </span>
              <span className="flex-1 min-w-0 sm:w-full">
                <span className="block font-space font-bold text-slate-900 text-sm sm:text-base">{t(s.titleKey)}</span>
                <span className="block font-inter text-slate-500 text-xs mt-0.5">{t(s.hintKey)}</span>
              </span>
              <ArrowForward size={16} aria-hidden="true" className={`text-slate-300 transition-all group-hover:translate-x-1 group-hover:rtl:-translate-x-1 flex-shrink-0 sm:self-end ${s.arrow}`} />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
