import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../../context/AuthContext';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';
import { ConfirmDialog } from '../../../components/admin/ui/Modal';
import { fetchAccessPolicies, fetchAccessUsage, updateAccessPolicy } from '../../../services/admin/accessPolicyService';
import {
  isDirty, isRestrictive, toDraft, toPayload, toolDescriptionKey, toolLabelKey, TIERS,
} from '../../../features/admin/access/accessPolicies';
import {
  AdminPage, AdminSection, AdminCard, Loading, ErrorBox, btnPrimary, btnSecondary, input as inputClass, Num, formatDate, useAdminLabels,
} from '../adminUi';

/**
 * « الوصول والحدود » — ce que chaque palier peut faire des instruments du
 * مختبر, du cahier et des travaux, réglé ICI sans déploiement.
 *
 * La page édite une ligne à la fois ; le serveur valide, journalise
 * (`access_policy.updated`) et renvoie la ligne. Une modification qui FERME
 * quelque chose (couper, retirer un palier, baisser une limite) demande une
 * confirmation : elle touche des élèves dès leur requête suivante.
 *
 * Les noms d'instruments viennent du catalogue `mathlab` (chargé à la
 * demande, sous la frontière <Suspense> des pages d'administration) — pas du
 * registre des instruments, qui embarquerait leurs moteurs.
 */
export default function AccessLimits() {
  const { t } = useTranslation(['admin', 'mathlab']);
  useDocumentMeta(t('access.metaTitle'));
  const { token } = useContext(AuthContext);
  const policies = useAdminResource(useCallback((tok) => fetchAccessPolicies(tok), []), []);
  const usage = useAdminResource(useCallback((tok) => fetchAccessUsage(tok), []), []);
  const [features, setFeatures] = useState([]);

  useEffect(() => { if (policies.data?.features) setFeatures(policies.data.features); }, [policies.data]);

  const replace = (saved) => setFeatures((rows) => rows.map((row) => (row.key === saved.key ? saved : row)));
  const tools = features.filter((f) => f.group === 'math_lab_tool');
  const notebook = features.find((f) => f.key === 'notebook');
  const documents = features.find((f) => f.key === 'math_lab.documents');
  const thinkingLab = features.find((f) => f.key === 'thinking_lab.ladder');

  return (
    <AdminPage eyebrow={t('access.eyebrow')} title={t('access.title')} subtitle={t('access.subtitle')}>
      {policies.loading && <Loading label={t('common.loading')} rows={6} />}
      {policies.error && <ErrorBox message={policies.error} onRetry={policies.reload} />}
      {!policies.loading && !policies.error && (
        <div className="space-y-6">
          <TiersCard />

          <AdminSection title={t('access.toolsTitle')}>
            <p className="mb-3 font-inter text-xs text-slate-500">{t('access.toolsHint')}</p>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="w-full min-w-[640px] text-start font-inter text-sm" data-access-tools>
                <thead className="bg-slate-50 text-xs text-slate-500">
                  <tr>
                    <th className="px-3 py-2 text-start">{t('access.columnTool')}</th>
                    <th className="px-3 py-2">{t('access.columnEnabled')}</th>
                    <th className="px-3 py-2">{t('access.tierFree')}</th>
                    <th className="px-3 py-2">{t('access.tierPremium')}</th>
                    <th className="px-3 py-2" aria-label={t('common.actions')} />
                  </tr>
                </thead>
                <tbody>
                  {tools.map((feature) => <ToolRow key={feature.key} feature={feature} token={token} onSaved={replace} />)}
                </tbody>
              </table>
            </div>
          </AdminSection>

          {notebook && (
            <AdminSection title={t('access.notebookTitle')}>
              <QuotaEditor feature={notebook} token={token} onSaved={replace} accessLabel={t('access.notebookAccess')} limitLabel={t('access.notebookLimit')} hint={t('access.notebookHint')} />
            </AdminSection>
          )}
          {thinkingLab && (
            <AdminSection title={t('access.thinkingLabTitle')}>
              <QuotaEditor feature={thinkingLab} token={token} onSaved={replace} accessLabel={t('access.thinkingLabAccess')} hint={t('access.thinkingLabHint')} quota={false} />
            </AdminSection>
          )}
          {documents && (
            <AdminSection title={t('access.documentsTitle')}>
              <QuotaEditor feature={documents} token={token} onSaved={replace} accessLabel={t('access.documentsAccess')} limitLabel={t('access.documentsLimit')} hint={t('access.documentsHint')} />
            </AdminSection>
          )}

          <UsageSection usage={usage} />
        </div>
      )}
    </AdminPage>
  );
}

function TiersCard() {
  const { t } = useTranslation('admin');

  return (
    <AdminCard title={t('access.tiersTitle')}>
      <div className="grid gap-3 sm:grid-cols-2 font-inter text-sm text-slate-600">
        <p><b className="text-slate-900">{t('access.tierFree')}</b> — {t('access.tierFreeHint')}</p>
        <p><b className="text-slate-900">{t('access.tierPremium')}</b> — {t('access.tierPremiumHint')}</p>
      </div>
      <p className="mt-3 font-inter text-xs text-slate-500">{t('access.teacherHint')}</p>
    </AdminCard>
  );
}

/** Enregistre une ligne, avec confirmation si elle ferme quelque chose. */
function useSaveFeature(feature, draft, token, onSaved) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const send = async () => {
    const { body, errorKey } = toPayload(feature, draft);
    if (!body) { setError(errorKey); return; }
    setBusy(true);
    setError(null);
    try {
      onSaved(await updateAccessPolicy(token, feature.key, body));
      setConfirming(false);
    } catch (e) {
      setError(e.message || 'access.errors.save');
    } finally {
      setBusy(false);
    }
  };

  const save = () => {
    const { errorKey } = toPayload(feature, draft);
    if (errorKey) { setError(errorKey); return; }
    if (isRestrictive(feature, draft)) setConfirming(true);
    else send();
  };

  return { busy, error, confirming, setConfirming, save, send };
}

function Toggle({ checked, onChange, label, disabled = false }) {
  return (
    <input
      type="checkbox"
      role="switch"
      className="h-4 w-4 accent-violet-600"
      checked={checked}
      disabled={disabled}
      aria-label={label}
      onChange={(e) => onChange(e.target.checked)}
    />
  );
}

function ConfirmRestrict({ state }) {
  const { t } = useTranslation('admin');
  const L = useAdminLabels();

  return (
    <ConfirmDialog
      open={state.confirming}
      onClose={() => state.setConfirming(false)}
      onConfirm={state.send}
      title={t('access.confirmTitle')}
      message={t('access.confirmBody')}
      confirmLabel={t('access.confirmAction')}
      tone="danger"
      busy={state.busy}
      cancelLabel={L.dialog.cancelLabel}
      busyLabel={t('common.busy')}
      closeLabel={L.dialog.closeLabel}
    />
  );
}

function ErrorLine({ error }) {
  const { t } = useTranslation('admin');
  if (!error) return null;

  return <p role="alert" className="font-inter text-xs text-rose-700">{error.startsWith('access.') ? t(error) : error}</p>;
}

function ToolRow({ feature, token, onSaved }) {
  const { t } = useTranslation(['admin', 'mathlab']);
  const [draft, setDraft] = useState(() => toDraft(feature));
  useEffect(() => setDraft(toDraft(feature)), [feature]);
  const state = useSaveFeature(feature, draft, token, onSaved);
  const name = t(toolLabelKey(feature.toolId), { ns: 'mathlab' });
  const dirty = isDirty(feature, draft);

  return (
    <tr className="border-t border-slate-100 align-top" data-access-row={feature.key}>
      <td className="px-3 py-2">
        <p className="font-semibold text-slate-900">{name}</p>
        <p className="text-xs text-slate-500">{t(toolDescriptionKey(feature.toolId), { ns: 'mathlab' })}</p>
        <code dir="ltr" className="font-mono-jetbrains text-[11px] text-slate-400">{feature.key}</code>
        {!feature.configured && <span className="ms-2 text-[11px] text-amber-700">{t('access.notConfigured')}</span>}
        <ErrorLine error={state.error} />
      </td>
      <td className="px-3 py-2 text-center"><Toggle checked={draft.enabled} onChange={(v) => setDraft({ ...draft, enabled: v })} label={`${name} — ${t('access.columnEnabled')}`} /></td>
      {TIERS.map((tier) => (
        <td key={tier} className="px-3 py-2 text-center">
          <Toggle checked={draft[tier].allowed} disabled={!draft.enabled} onChange={(v) => setDraft({ ...draft, [tier]: { ...draft[tier], allowed: v } })} label={`${name} — ${t(tier === 'free' ? 'access.tierFree' : 'access.tierPremium')}`} />
        </td>
      ))}
      <td className="px-3 py-2 text-end">
        {dirty && <button type="button" className={btnPrimary} disabled={state.busy} onClick={state.save}>{state.busy ? t('common.busy') : t('common.save')}</button>}
        <ConfirmRestrict state={state} />
      </td>
    </tr>
  );
}

function QuotaEditor({ feature, token, onSaved, accessLabel, limitLabel, hint, quota = true }) {
  const { t } = useTranslation('admin');
  const [draft, setDraft] = useState(() => toDraft(feature));
  useEffect(() => setDraft(toDraft(feature)), [feature]);
  const state = useSaveFeature(feature, draft, token, onSaved);
  const setTier = (tier, patch) => setDraft({ ...draft, [tier]: { ...draft[tier], ...patch } });
  const dirty = isDirty(feature, draft);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3" data-access-row={feature.key}>
      <p className="font-inter text-xs text-slate-500">{hint}</p>
      <label className="flex items-center gap-2 font-inter text-sm text-slate-700">
        <Toggle checked={draft.enabled} onChange={(v) => setDraft({ ...draft, enabled: v })} label={t('access.columnEnabled')} /> {t('access.enabledGlobally')}
      </label>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] font-inter text-sm">
          <thead className="text-xs text-slate-500">
            <tr>
              <th className="py-2 text-start">{t('access.columnFeature')}</th>
              <th className="py-2">{t('access.tierFree')}</th>
              <th className="py-2">{t('access.tierPremium')}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-slate-100">
              <td className="py-2 text-slate-700">{accessLabel}</td>
              {TIERS.map((tier) => (
                <td key={tier} className="py-2 text-center">
                  <Toggle checked={draft[tier].allowed} disabled={!draft.enabled} onChange={(v) => setTier(tier, { allowed: v })} label={`${accessLabel} — ${t(tier === 'free' ? 'access.tierFree' : 'access.tierPremium')}`} />
                </td>
              ))}
            </tr>
            {quota && <tr className="border-t border-slate-100">
              <td className="py-2 text-slate-700">{limitLabel}</td>
              {TIERS.map((tier) => (
                <td key={tier} className="py-2">
                  <div className="flex flex-col items-center gap-1">
                    <label className="flex items-center gap-1.5 text-xs text-slate-600">
                      <Toggle checked={draft[tier].unlimited} onChange={(v) => setTier(tier, { unlimited: v })} label={`${limitLabel} — ${t('access.unlimited')}`} /> {t('access.unlimited')}
                    </label>
                    {!draft[tier].unlimited && (
                      <input
                        type="number"
                        min={0}
                        step={1}
                        inputMode="numeric"
                        dir="ltr"
                        value={draft[tier].limit}
                        onChange={(e) => setTier(tier, { limit: e.target.value })}
                        aria-label={`${limitLabel} — ${t(tier === 'free' ? 'access.tierFree' : 'access.tierPremium')}`}
                        className={`${inputClass} max-w-[8rem] text-center`}
                      />
                    )}
                  </div>
                </td>
              ))}
            </tr>}
          </tbody>
        </table>
      </div>
      {quota && <label className="flex items-center gap-2 font-inter text-sm text-slate-700">
        {t('access.period')}
        <select value={draft.period} onChange={(e) => setDraft({ ...draft, period: e.target.value })} className={`${inputClass} max-w-[20rem]`}>
          <option value="month">{t('access.periodMonth')}</option>
          <option value="lifetime">{t('access.periodLifetime')}</option>
        </select>
      </label>}
      <ErrorLine error={state.error} />
      <div className="flex items-center justify-between gap-2">
        <span className="font-inter text-xs text-slate-400">{feature.updatedAt ? t('access.updatedAt', { date: formatDate(feature.updatedAt, { withTime: true }) }) : t('access.notConfigured')}</span>
        <div className="flex gap-2">
          {dirty && <button type="button" className={btnSecondary} onClick={() => setDraft(toDraft(feature))}>{t('common.cancel')}</button>}
          <button type="button" className={btnPrimary} disabled={!dirty || state.busy} onClick={state.save}>{state.busy ? t('common.busy') : t('common.save')}</button>
        </div>
      </div>
      <ConfirmRestrict state={state} />
    </div>
  );
}

function UsageSection({ usage }) {
  const { t } = useTranslation(['admin', 'mathlab']);
  const data = usage.data;
  const toolRows = useMemo(() => Object.entries(data?.documentsByTool ?? {}), [data]);

  return (
    <AdminSection title={t('access.usageTitle')}>
      {usage.loading && <Loading label={t('common.loading')} rows={2} />}
      {usage.error && <ErrorBox message={usage.error} onRetry={usage.reload} />}
      {data && (
        <div className="space-y-4">
          <p className="font-inter text-xs text-slate-500">{t('access.usageHint', { date: formatDate(data.resetsAt) })}</p>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[480px] font-inter text-sm" data-access-usage>
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-3 py-2 text-start">{t('access.columnTier')}</th>
                  <th className="px-3 py-2">{t('access.usageDocuments')}</th>
                  <th className="px-3 py-2">{t('access.usageNotebook')}</th>
                </tr>
              </thead>
              <tbody>
                {TIERS.map((tier) => (
                  <tr key={tier} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-semibold">{t(tier === 'free' ? 'access.tierFree' : 'access.tierPremium')}</td>
                    {['document_generation', 'notebook_copy'].map((type) => (
                      <td key={type} className="px-3 py-2 text-center">
                        <Num>{data.totals?.[tier]?.[type]?.total ?? 0}</Num>
                        <span className="block text-[11px] text-slate-400">{t('access.usageUsers', { count: data.totals?.[tier]?.[type]?.users ?? 0 })}</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <AdminCard title={t('access.usageByTool')}>
            {toolRows.length === 0 ? (
              <p className="font-inter text-xs text-slate-500">{t('access.usageEmpty')}</p>
            ) : (
              <ul className="grid gap-1 sm:grid-cols-2 font-inter text-sm">
                {toolRows.map(([tool, byTier]) => (
                  <li key={tool} className="flex justify-between gap-2 border-b border-slate-100 py-1">
                    <span>{t(toolLabelKey(tool), { ns: 'mathlab', defaultValue: tool })}</span>
                    <span className="text-slate-500">
                      {t('access.tierFree')} <Num>{byTier.free ?? 0}</Num> · {t('access.tierPremium')} <Num>{byTier.premium ?? 0}</Num>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </AdminCard>
        </div>
      )}
    </AdminSection>
  );
}
