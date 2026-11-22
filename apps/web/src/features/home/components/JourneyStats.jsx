import { useTranslation } from 'react-i18next';
import { CircleCheckBig, Target, Flame, Zap } from 'lucide-react';

/**
 * « Ton parcours » — quatre repères, dans une seule bande discrète, SOUS le héros :
 * l'accueil oriente, il n'analyse pas (l'analyse est « Ma progression »).
 *
 * Trois parlent d'apprentissage (terminées, compétences maîtrisées, en
 * cours) ; les XP sont un indicateur d'activité et leur place est la
 * dernière. « Compétences maîtrisées » se lit `maîtrisées / évaluées` :
 * une compétence sans bilan n'entre ni au numérateur ni au dénominateur, et
 * tant que le profil n'est pas là — ou s'il a échoué — la tuile dit « — »,
 * jamais 0.
 */
function Cell({ icon: Icon, accent, value, label, hint, ariaLabel, testId }) {
  return (
    <div className="rounded-xl p-3.5 sm:p-4 flex items-start gap-3 min-w-0" data-home-stat={testId}>
      <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0 ${accent}`} aria-hidden="true">
        <Icon size={17} />
      </span>
      <div className="min-w-0">
        <p className="font-space font-black text-2xl leading-none text-slate-900 tabular-nums" aria-label={ariaLabel}>{value}</p>
        <p className="font-inter text-slate-600 text-xs mt-1.5 leading-tight">{label}</p>
        {hint && <p className="font-inter text-slate-400 text-[11px] mt-0.5 leading-tight">{hint}</p>}
      </div>
    </div>
  );
}

export default function JourneyStats({ activity, agg, profileStatus }) {
  const { t } = useTranslation('student');
  const ready = profileStatus === 'ready';
  const assessed = agg?.assessed ?? 0;
  const mastered = agg?.counts?.mastered ?? 0;

  let masteredValue = '—';
  let masteredHint;
  let masteredAria;
  if (!ready) {
    masteredHint = profileStatus === 'loading' ? t('home.statLoading') : t('home.statUnavailable');
  } else if (assessed === 0) {
    masteredHint = t('home.statNothingAssessed');
  } else {
    masteredValue = <span dir="ltr">{mastered}{'\u00A0/\u00A0'}{assessed}</span>;
    masteredHint = t('home.statMasteredOfAssessed', { assessed });
    masteredAria = t('home.statMasteredAria', { mastered, assessed });
  }

  return (
    <section aria-labelledby="home-journey-title" data-home-stats>
      <h2 id="home-journey-title" className="font-mono-jetbrains text-[11px] font-bold tracking-widest uppercase text-slate-400 mb-2.5 px-1">
        {t('home.journeyTitle')}
      </h2>
      <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm p-1.5 grid grid-cols-2 lg:grid-cols-4 gap-1">
        <Cell icon={CircleCheckBig} accent="bg-emerald-50 text-emerald-600" value={activity.completedCount} label={t('home.statLessonsCompleted')} testId="completed" />
        <Cell icon={Target} accent="bg-nav-accent-soft text-nav-accent" value={masteredValue} label={t('home.statMastered')} hint={masteredHint} ariaLabel={masteredAria} testId="mastered" />
        <Cell icon={Flame} accent="bg-amber-50 text-amber-600" value={activity.inProgressCount} label={t('home.statInProgress')} testId="in-progress" />
        <Cell icon={Zap} accent="bg-violet-50 text-violet-600" value={activity.totalXp} label={t('home.statXpEarned')} testId="xp" />
      </div>
    </section>
  );
}
