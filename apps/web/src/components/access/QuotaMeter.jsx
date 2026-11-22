import { useTranslation } from 'react-i18next';
import { Gauge } from 'lucide-react';

/**
 * « 7 متبقّية من 10 · هذا الشهر » — le quota tel que le serveur l'a compté.
 * Rien si le serveur n'a pas (encore) répondu ; « غير محدود » si le palier
 * n'a pas de limite. Les chiffres restent des chiffres : isolés en LTR.
 */
export default function QuotaMeter({ quota, className = '' }) {
  const { t } = useTranslation('access');
  if (!quota) return null;
  const exhausted = !quota.unlimited && quota.remaining <= 0;

  return (
    <span
      data-quota-meter={quota.usageType}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-inter text-xs font-semibold ${
        exhausted ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
      } ${className}`}
    >
      <Gauge size={12} aria-hidden="true" />
      {quota.unlimited
        ? t('feature.meter.unlimited')
        : <bdi>{t('feature.meter.remaining', { remaining: quota.remaining, limit: quota.limit })}</bdi>}
      <span className="text-slate-400">· {t(`feature.meter.${quota.period === 'lifetime' ? 'lifetime' : 'month'}`)}</span>
    </span>
  );
}
