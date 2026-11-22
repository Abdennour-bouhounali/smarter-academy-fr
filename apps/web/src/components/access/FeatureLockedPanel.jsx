import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock, Gauge } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { usePayments } from '../../context/PaymentsContext';

/**
 * L'état « fermé » d'une fonctionnalité — un instrument verrouillé, un
 * cahier fermé, un quota atteint. On ne cache pas : on EXPLIQUE, avec les
 * nombres du serveur (utilisé / limite / restant) quand il y en a.
 *
 * `reason` et `quota` viennent tels quels du serveur (résumé ou refus 403) ;
 * ce composant ne décide rien. L'appel à activer ne s'adresse qu'à un élève :
 * un enseignant n'a pas de code d'activation à saisir.
 *
 * @param {{reason: string, quota?: object|null, resource?: 'documents'|'notebook', compact?: boolean}} props
 */
export default function FeatureLockedPanel({ reason, quota = null, resource = null, compact = false }) {
  const { t, i18n } = useTranslation('access');
  const { user } = useContext(AuthContext);
  // Payments closed: a refusal still says what happened, never « activate full access » (§4ter).
  const { paymentsOpen } = usePayments();
  const isQuota = reason === 'quota_exceeded';
  const known = ['premium_required', 'feature_disabled', 'not_available', 'quota_exceeded'].includes(reason) ? reason : 'not_available';
  const key = !paymentsOpen && known === 'premium_required' ? 'not_available' : known;
  const Icon = isQuota ? Gauge : Lock;
  const canActivate = paymentsOpen && user?.role === 'student' && (reason === 'premium_required' || isQuota);
  const resetsAt = quota?.resetsAt ? new Date(quota.resetsAt).toLocaleDateString(i18n.language || 'ar-DZ', { day: 'numeric', month: 'long' }) : null;

  return (
    <div
      role="status"
      data-feature-locked={reason}
      className={`flex flex-col items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 text-center ${compact ? 'p-3' : 'p-6'}`}
    >
      <Icon size={compact ? 18 : 26} className="text-amber-600" aria-hidden="true" />
      <p className="font-space font-bold text-slate-900">{t(`feature.${key}.title`)}</p>
      {isQuota && quota ? (
        <>
          <p className="font-inter text-sm text-slate-600">
            {t('feature.quota_exceeded.body', { used: quota.used, limit: quota.limit, resource: resource ? t(`feature.resource.${resource}`) : '' })}
          </p>
          <p className="font-inter text-xs text-slate-500">{resetsAt ? t('feature.resetsOn', { date: resetsAt }) : t('feature.neverResets')}</p>
          {canActivate && <p className="font-inter text-xs text-slate-500">{t('feature.quota_exceeded.bodyPremium')}</p>}
        </>
      ) : (
        <p className="font-inter text-sm text-slate-600 max-w-md">{t(`feature.${key}.body`)}</p>
      )}
      {canActivate && (
        <Link to="/espace/activation" className="mt-1 inline-flex items-center rounded-xl bg-nav-accent px-4 py-2 font-inter text-sm font-semibold text-white hover:bg-[#3350c4]">
          {t('feature.cta')}
        </Link>
      )}
    </div>
  );
}
