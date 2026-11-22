import { useTranslation } from 'react-i18next';
import { confidencePercent } from './lpBar';

/**
 * Le VOCABULAIRE visuel de la maîtrise, écrit une fois : la pastille de
 * statut (quatre couleurs), la puce de motif, la marque de fraîcheur et la
 * fine barre de confiance. L'onglet « الكفاءات », le détail d'un point et
 * le dossier de l'élève lisent tous ces quatre composants — deux écrans qui
 * coloreraient « صعوبة » différemment mentiraient à l'enseignant.
 *
 * Les libellés viennent du catalogue `teacher` (`students.masteryStatus.*`,
 * `students.masteryReason.*`, `students.freshness.*`), résolus au rendu ; une
 * valeur inconnue du serveur retombe sur le code brut (ARABIC_RTL_CONTRACT §2).
 */
const PILL = {
  mastered: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  reinforce: 'bg-amber-50 text-amber-800 ring-amber-200',
  gap: 'bg-rose-50 text-rose-700 ring-rose-200',
  unassessed: 'bg-slate-100 text-slate-600 ring-slate-200',
};

const FRESHNESS_DOT = {
  fresh: 'bg-emerald-500',
  aging: 'bg-amber-400',
  stale: 'bg-slate-400',
};

function useCodeLabel() {
  const { t } = useTranslation('teacher');
  return (prefix, code) => {
    if (!code) return '';
    const key = `${prefix}.${code}`;
    const label = t(key);
    return label === key ? String(code) : label;
  };
}

export default function MasteryPill({ status, className = '' }) {
  const label = useCodeLabel();
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${PILL[status] ?? PILL.unassessed} ${className}`} data-mastery-status={status}>
      {label('students.masteryStatus', status)}
    </span>
  );
}

/** Le motif n'est affiché que s'il dit quelque chose : `threshold` et `null` sont muets. */
export function ReasonChip({ reason, className = '' }) {
  const label = useCodeLabel();
  if (!reason || reason === 'threshold') return null;
  const text = label('students.masteryReason', reason);
  if (!text) return null;
  return <span className={`inline-flex shrink-0 items-center rounded-full border border-dashed border-slate-300 px-2 py-0.5 text-[10px] text-slate-600 ${className}`} data-mastery-reason={reason}>{text}</span>;
}

export function FreshnessMark({ freshness, className = '' }) {
  const label = useCodeLabel();
  if (!freshness) return null;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] text-slate-500 ${className}`} data-freshness={freshness}>
      <span className={`h-1.5 w-1.5 rounded-full ${FRESHNESS_DOT[freshness] ?? FRESHNESS_DOT.stale}`} aria-hidden="true" />
      {label('students.freshness', freshness)}
    </span>
  );
}

/** Une fine barre, SANS nombre : la confiance se compare d'un œil, elle ne se lit pas au chiffre. */
export function ConfidenceBar({ confidence, className = '' }) {
  const { t } = useTranslation('teacher');
  const percent = confidencePercent(confidence);
  return (
    <span
      className={`inline-block h-1 w-16 overflow-hidden rounded-full bg-slate-100 ${className}`}
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent ?? 0}
      aria-label={t('learningPoints.confidence')}
      title={t('learningPoints.confidence')}
    >
      {percent !== null && <span className="block h-full rounded-full bg-nav-accent" style={{ width: `${percent}%` }} />}
    </span>
  );
}
