import { useTranslation } from 'react-i18next';
import { formatDate } from '../../../pages/teacher/teacherUi';
import { LP_STATUS_BAR } from '../learningPoints/lpBar';

/**
 * Le CHEMIN d'un statut dans le temps : une pastille par changement, dans
 * l'ordre, aux couleurs de la carte. Pas de courbe de pourcentage : ce qui
 * compte pour l'enseignant, c'est « ثغرة → تدعيم → متقن », pas 0,41 → 0,58.
 *
 * Un changement dû à un RECALCUL (nouvelle version du moteur) ou reconstruit
 * après coup est marqué comme tel : ce n'est pas un apprentissage observé.
 */
export default function StatusTrail({ steps, className = '' }) {
  const { t } = useTranslation('teacher');
  if (!steps || steps.length === 0) return <p className="text-xs text-slate-400">{t('learningPoints.evidence.noHistory')}</p>;

  return (
    <ol className={`flex flex-wrap items-center gap-1 ${className}`} data-status-trail>
      {steps.map((step, index) => {
        const label = `${t(`students.masteryStatus.${step.to}`)} · ${formatDate(step.at)}${step.origin === 'replay' ? ` · ${t('learningPoints.evidence.recalculated')}` : step.origin === 'backfill' ? ` · ${t('learningPoints.evidence.reconstructed')}` : ''}`;
        return (
          <li key={`${step.at}-${index}`} className="flex items-center gap-1" title={label}>
            {index > 0 && <span className="h-px w-2 bg-slate-300" aria-hidden="true" />}
            <span
              className={`inline-block h-3 w-3 rounded-full ${LP_STATUS_BAR[step.to] ?? 'bg-slate-300'} ${step.origin === 'replay' ? 'ring-2 ring-offset-1 ring-slate-300' : ''} ${step.origin === 'backfill' ? 'opacity-60' : ''}`}
              role="img"
              aria-label={label}
              data-trail-step={step.to}
            />
          </li>
        );
      })}
    </ol>
  );
}
