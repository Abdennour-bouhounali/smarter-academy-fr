import { useTranslation } from 'react-i18next';
import { Gauge } from 'lucide-react';
import { usePayments } from '../../context/PaymentsContext';

/**
 * « 7 restants sur 10 · ce mois-ci » — le quota tel que le serveur l'a compté.
 * Rien si le serveur n'a pas (encore) répondu ; « Illimité » si le palier
 * n'a pas de limite.
 */
export default function QuotaMeter({ quota, className = '' }) {
  const { t } = useTranslation('access');
  // Payments closed: no limit banner — a counter next to a tier nobody can buy is an upsell (§4ter).
  const { paymentsOpen } = usePayments();
  if (!quota || !paymentsOpen) return null;
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
        : t('feature.meter.remaining', { remaining: quota.remaining, limit: quota.limit })}
      <span className="text-slate-400">· {t(`feature.meter.${quota.period === 'lifetime' ? 'lifetime' : 'month'}`)}</span>
    </span>
  );
}
