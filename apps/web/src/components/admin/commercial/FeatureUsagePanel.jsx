import { Suspense, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { fetchUserFeatureUsage } from '../../../services/admin/accessPolicyService';
import { toolLabelKey } from '../../../features/admin/access/accessPolicies';
import { AdminCard, Loading, ErrorBox, Num } from '../../../pages/admin/adminUi';

/**
 * « الوصول والحدود » d'UN compte, sur sa fiche : son palier (et pourquoi),
 * utilisé / limite / restant pour les travaux et les notes, les instruments
 * qui lui sont fermés. Lecture seule — les réglages sont par palier, dans
 * /admin/offres/acces ; une exception individuelle passe par le droit
 * d'accès du compte (dérogation), pas par ici.
 *
 * Les noms d'instruments viennent du catalogue `mathlab` (à la demande) :
 * la fiche est une page paresseuse, sous la frontière <Suspense> admin.
 */
/**
 * Sa propre frontière <Suspense> : le catalogue `mathlab` arrive à la demande,
 * et son attente ne doit pas blanchir toute la fiche du compte.
 */
export default function FeatureUsagePanel({ userId }) {
  return (
    <Suspense fallback={<Loading rows={2} />}>
      <FeatureUsagePanelBody userId={userId} />
    </Suspense>
  );
}

function FeatureUsagePanelBody({ userId }) {
  const { t } = useTranslation(['admin', 'mathlab']);
  const loader = useCallback((token) => fetchUserFeatureUsage(token, userId), [userId]);
  const { data, loading, error, reload } = useAdminResource(loader, [loader]);

  const quotaRow = (key, label) => {
    const q = data?.quotas?.[key]?.quota;
    if (!q) return null;

    return (
      <tr key={key} className="border-t border-slate-100">
        <td className="py-1.5">{label}</td>
        <td className="py-1.5 text-center"><Num>{q.used}</Num></td>
        <td className="py-1.5 text-center">{q.unlimited ? t('access.unlimited') : <Num>{q.limit}</Num>}</td>
        <td className="py-1.5 text-center">{q.unlimited ? '—' : <Num>{q.remaining}</Num>}</td>
      </tr>
    );
  };

  return (
    <AdminCard title={t('access.userUsageTitle')}>
      {loading && <Loading label={t('common.loading')} rows={2} />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {data && (
        <div className="space-y-3 font-inter text-sm" data-feature-usage>
          <p>
            {t('access.userTier')} : <b>{t(data.tier === 'premium' ? 'access.tierPremium' : 'access.tierFree')}</b>
            <code dir="ltr" className="ms-2 font-mono-jetbrains text-[11px] text-slate-400">{data.tierReason}</code>
          </p>
          <table className="w-full">
            <thead className="text-xs text-slate-500">
              <tr><th className="text-start" /><th>{t('access.used')}</th><th>{t('access.limit')}</th><th>{t('access.remaining')}</th></tr>
            </thead>
            <tbody>
              {quotaRow('math_lab.documents', t('access.usageDocuments'))}
              {quotaRow('notebook', t('access.usageNotebook'))}
            </tbody>
          </table>
          <p className="text-xs text-slate-500">
            {t('access.lockedTools')} :{' '}
            {data.lockedTools.length === 0
              ? t('access.noLockedTools')
              : data.lockedTools.map((tool) => t(toolLabelKey(tool), { ns: 'mathlab' })).join('، ')}
          </p>
          {Object.keys(data.documentsByToolAllTime ?? {}).length > 0 && (
            <p className="text-xs text-slate-500">
              {t('access.documentsByTool')} :{' '}
              {Object.entries(data.documentsByToolAllTime).map(([tool, n]) => `${t(toolLabelKey(tool), { ns: 'mathlab', defaultValue: tool })} (${n})`).join('، ')}
            </p>
          )}
        </div>
      )}
    </AdminCard>
  );
}
