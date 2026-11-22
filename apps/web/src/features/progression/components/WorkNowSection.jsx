import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Target, Sparkles, Play } from 'lucide-react';
import { ArrowForward } from '../../../components/common/DirectionalIcons';
import { MASTERY_STATES } from '../../../lessons/common/components/LearningPointMastery';
import { WorkNowSkeleton } from './ProgressionSkeleton';
import MathLabel from '../../../lessons/common/components/MathLabel';
import { mathToPlain } from '../../../utils/mathPlain';

const TONE = {
  gap: { card: 'border-rose-200 bg-rose-50/60', pill: 'bg-rose-100 text-rose-800' },
  reinforce: { card: 'border-amber-200 bg-amber-50/60', pill: 'bg-amber-100 text-amber-800' },
};

/**
 * « 🎯 À travailler maintenant » — la section ACTIONNABLE : quelques compétences à
 * retravailler (règle dans pickWorkNow.js), chacune avec son contexte
 * complet (leçon, chapitre, thème) et un lien direct vers la leçon existante.
 *
 * Rien n'est proposé tant que le profil n'est pas chargé (squelette) ; en
 * erreur la section se tait, car « rien à retravailler » et « impossible de
 * savoir » ne sont pas la même chose — la page l'annonce à part.
 */
export default function WorkNowSection({ items, total, nextStep, unassessedCount, profileStatus, onShowAll }) {
  const { t } = useTranslation('student');
  if (profileStatus === 'error' || profileStatus === 'anonymous') return null;

  return (
    <section className="mb-10" aria-labelledby="work-now-title" data-progression-work-now>
      <div className="mb-3">
        <h2 id="work-now-title" className="font-space font-bold text-slate-900 text-lg flex items-center gap-2">
          <Target size={18} className="text-rose-500" aria-hidden="true" /> {t('progression.workNow.title')}
        </h2>
        <p className="font-inter text-slate-500 text-xs mt-0.5 max-w-2xl">{t('progression.workNow.subtitle')}</p>
      </div>

      {profileStatus === 'loading' && <WorkNowSkeleton />}

      {profileStatus === 'ready' && items.length > 0 && (
        <>
          <ul className="grid sm:grid-cols-2 gap-3">
            {items.map(({ point, lesson, group, field }) => {
              const s = MASTERY_STATES[point.state];
              const tone = TONE[point.state];
              return (
                <li key={point.code} className={`rounded-2xl border-2 p-4 flex flex-col gap-3 ${tone.card}`} data-work-now-item data-state={point.state}>
                  <div className="flex items-start justify-between gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono-jetbrains text-xs font-bold ${tone.pill}`}>
                      <span aria-hidden="true">{s.emoji}</span> {t(s.labelKey)}
                    </span>
                    <span className="text-xl leading-none" aria-hidden="true">{lesson.lesson.icon}</span>
                  </div>
                  <h3 className="font-space font-bold text-slate-900 text-base leading-snug"><MathLabel>{point.title}</MathLabel></h3>
                  <dl className="text-xs text-slate-600 space-y-0.5">
                    <div className="flex gap-1.5"><dt className="text-slate-400 font-mono-jetbrains flex-shrink-0">{t('progression.workNow.lesson')}</dt><dd className="font-semibold text-slate-800"><MathLabel>{lesson.lesson.title}</MathLabel></dd></div>
                    {group.kind === 'unit' && (
                      <div className="flex gap-1.5"><dt className="text-slate-400 font-mono-jetbrains flex-shrink-0">{t('progression.workNow.unit')}</dt><dd><MathLabel>{group.title}</MathLabel></dd></div>
                    )}
                    <div className="flex gap-1.5"><dt className="text-slate-400 font-mono-jetbrains flex-shrink-0">{t('progression.workNow.field')}</dt><dd><MathLabel>{field.title}</MathLabel></dd></div>
                  </dl>
                  <Link
                    to={lesson.lesson.path}
                    className="mt-auto min-h-[44px] px-4 rounded-xl bg-nav-accent text-white text-sm font-bold inline-flex items-center justify-center gap-1.5 hover:bg-[#3350c4] focus:outline-none focus-visible:ring-2 focus-visible:ring-nav-accent self-start"
                    aria-label={`${t('progression.workNow.cta')} : ${mathToPlain(lesson.lesson.title)}`}
                  >
                    {t('progression.workNow.cta')} <ArrowForward size={15} aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
          {total > items.length && (
            <p className="mt-3 text-xs font-inter text-slate-500 flex items-center gap-2 flex-wrap">
              {t('progression.workNow.more', { count: total - items.length })}
              <button
                type="button"
                onClick={onShowAll}
                className="min-h-[36px] px-3 rounded-lg border border-slate-200 bg-white text-xs font-mono-jetbrains font-bold text-nav-accent hover:border-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-nav-accent"
                data-work-now-show-all
              >
                {t('progression.workNow.showAll')}
              </button>
            </p>
          )}
        </>
      )}

      {profileStatus === 'ready' && items.length === 0 && (
        <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/60 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4" data-work-now-empty>
          <div className="flex-1">
            <p className="font-space font-bold text-emerald-900 text-base flex items-center gap-2">
              <Sparkles size={16} aria-hidden="true" /> {t('progression.workNow.allGoodTitle')}
            </p>
            <p className="text-xs text-emerald-900/80 mt-1">
              {t('progression.workNow.allGoodBody')}
              {unassessedCount > 0 && ` ${t('progression.workNow.unassessedHint', { count: unassessedCount })}`}
            </p>
          </div>
          {nextStep && (
            <Link
              to={nextStep.lesson.cta.path}
              className="min-h-[44px] px-4 rounded-xl bg-emerald-600 text-white text-sm font-bold inline-flex items-center gap-1.5 hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 self-start sm:self-auto"
            >
              <Play size={14} aria-hidden="true" />
              {nextStep.lesson.activityState === 'in_progress' ? t('progression.workNow.nextContinue') : t('progression.workNow.nextStart')}
              <span className="font-normal opacity-90">· <MathLabel>{nextStep.lesson.lesson.title}</MathLabel></span>
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
