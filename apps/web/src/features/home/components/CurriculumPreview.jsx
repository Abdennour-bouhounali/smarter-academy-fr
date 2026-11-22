import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Milestone } from 'lucide-react';
import SectionHeading from './SectionHeading';
import PathProgress from '../../progression/components/PathProgress';

/**
 * « 📚 Où tu en es » — une TRANCHE du programme, pas l'arbre : le thème courant,
 * son chapitre quand il y en a un, la leçon courante. Trois lignes, en escalier,
 * pour que la hiérarchie officielle (le thème ← chapitre ← la leçon) se lise
 * d'elle-même. Les savoir-faire restent sur « Ma progression ».
 *
 * La tranche est choisie par pickCurriculumContext (la leçon du héros,
 * sinon la plus récente, sinon le début du programme) ; les pourcentages
 * sont ceux de l'arbre de progression, jamais une maîtrise.
 */
function Level({ label, title, percent, children }) {
  const p = Math.max(0, Math.min(100, Math.round(percent || 0)));
  return (
    <li className="min-w-0">
      <div className="flex items-center justify-between gap-3 py-1.5">
        <div className="min-w-0">
          <p className="font-mono-jetbrains text-[11px] font-bold tracking-wider uppercase text-slate-400">{label}</p>
          <p className="font-inter font-semibold text-slate-800 text-sm truncate">{title}</p>
        </div>
        <span dir="ltr" className={`font-mono-jetbrains text-xs font-bold tabular-nums flex-shrink-0 ${p >= 100 ? 'text-emerald-700' : 'text-slate-500'}`}>
          {p}%
        </span>
      </div>
      {children && <ol className="ms-2 ps-4 border-s-2 border-slate-100 mt-1">{children}</ol>}
    </li>
  );
}

export default function CurriculumPreview({ context }) {
  const { t } = useTranslation('student');
  const lessonRow = context && (
    <li className="min-w-0 pt-1">
      <p className="font-mono-jetbrains text-[11px] font-bold tracking-wider uppercase text-slate-400 mb-1.5">{t('home.whereLesson')}</p>
      <Link
        to={context.lesson.path}
        className="group block rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 hover:border-blue-300 hover:bg-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-nav-accent"
        data-home-where-lesson={context.lesson.id}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl leading-none flex-shrink-0" aria-hidden="true">{context.lesson.icon}</span>
          <p className="font-space font-bold text-slate-900 text-base truncate group-hover:text-nav-accent transition-colors">{context.lesson.title}</p>
        </div>
        <PathProgress percent={context.lesson.percent} className="mt-3" />
      </Link>
    </li>
  );

  return (
    <section aria-labelledby="home-where-title" className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 h-full" data-home-where>
      <SectionHeading id="home-where-title" icon={Milestone} title={t('home.whereTitle')} action={{ to: '/espace/progression', label: t('home.seeProgression') }} />
      {context ? (
        <ol>
          <Level label={t('home.whereField')} title={context.field.title} percent={context.field.percent}>
            {context.unit ? (
              <Level label={t('home.whereUnit')} title={context.unit.title} percent={context.unit.percent}>
                {lessonRow}
              </Level>
            ) : lessonRow}
          </Level>
        </ol>
      ) : (
        <p className="font-inter text-slate-400 text-sm">{t('home.whereEmpty')}</p>
      )}
    </section>
  );
}
