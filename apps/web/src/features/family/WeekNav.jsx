import { useTranslation } from 'react-i18next';
import { ChevronBack, ChevronForward } from '../../components/common/DirectionalIcons';
import { shortDate } from './format';

/** Le nombre de semaines passées que le serveur relit (config/family.php › report_weeks_back). */
const MAX_WEEKS_BACK = 8;

/**
 * Le choix de la semaine du rapport. « Semaine précédente » recule dans le temps
 * (ChevronBack, en premier — à gauche), « Semaine suivante » avance.
 */
export default function WeekNav({ weeksBack, onChange, report }) {
  const { t } = useTranslation('family');
  const label = weeksBack === 0 ? t('report.thisWeek') : weeksBack === 1 ? t('report.lastWeek') : t('report.weeksAgo', { count: weeksBack });
  const btn = 'inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40';

  return (
    <div className="flex items-center gap-3">
      <button type="button" className={btn} onClick={() => onChange(weeksBack + 1)} disabled={weeksBack >= MAX_WEEKS_BACK}
        aria-label={t('report.previous')} title={t('report.previous')}>
        <ChevronBack size={18} aria-hidden="true" />
      </button>
      <div className="min-w-[10rem] text-center">
        <p className="font-space text-sm font-bold text-slate-900">{label}</p>
        {report && <p className="font-inter text-xs text-slate-500">{t('report.range', { from: shortDate(report.weekStart), to: shortDate(report.weekEnd) })}</p>}
      </div>
      <button type="button" className={btn} onClick={() => onChange(weeksBack - 1)} disabled={weeksBack <= 0}
        aria-label={t('report.next')} title={t('report.next')}>
        <ChevronForward size={18} aria-hidden="true" />
      </button>
    </div>
  );
}
