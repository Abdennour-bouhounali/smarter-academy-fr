import { useTranslation } from 'react-i18next';
import { CircleCheckBig, Flame, Target, Zap } from 'lucide-react';
import StatTile from '../../../components/common/StatTile';

/**
 * Les indicateurs de tête. Trois parlent d'APPRENTISSAGE (leçons terminées,
 * en cours, compétences maîtrisées) ; le quatrième — les XP — est un
 * indicateur d'ENGAGEMENT, et son sous-titre le dit, pour qu'il ne passe
 * jamais pour une mesure de maîtrise.
 *
 * « Compétences maîtrisées » se lit `maîtrisées / évaluées` : une
 * compétence sans bilan n'entre ni au numérateur ni au dénominateur.
 */
export default function ProgressionStats({ activity, agg, profileStatus, gradeLabel }) {
  const { t } = useTranslation('student');
  const ready = profileStatus === 'ready';
  const masteredValue = !ready
    ? '—'
    : agg.assessed === 0
      ? '0 / 0'
      : <span dir="ltr">{agg.counts.mastered}{'\u00A0/\u00A0'}{agg.assessed}</span>;
  const masteredHint = !ready
    ? (profileStatus === 'loading' ? t('progression.loadingAcquis') : t('progression.errorTitle'))
    : agg.assessed === 0
      ? t('progression.statNothingAssessed')
      : t('progression.statMasteredHintUnassessed', { count: agg.counts.unassessed });

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" data-progression-stats>
      <StatTile icon={CircleCheckBig} value={activity.completedCount} label={t('progression.statLessonsCompleted')} accent="bg-emerald-50 text-emerald-600" />
      <StatTile icon={Flame} value={activity.inProgressCount} label={t('progression.statLessonsInProgress')} accent="bg-amber-50 text-amber-600" />
      <StatTile
        icon={Target}
        value={masteredValue}
        label={gradeLabel ? t('progression.statMasteredWithGrade', { grade: gradeLabel }) : t('progression.statMastered')}
        hint={masteredHint}
        accent="bg-nav-accent-soft text-nav-accent"
      />
      <StatTile icon={Zap} value={activity.totalXp} label={t('progression.statXpTotal')} hint={t('progression.statXpHint')} accent="bg-slate-100 text-slate-500" />
    </div>
  );
}
