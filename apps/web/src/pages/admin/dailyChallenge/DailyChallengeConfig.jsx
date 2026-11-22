import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../../context/AuthContext';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';
import { fetchDailyChallengeConfig, updateDailyChallengeConfig } from '../../../services/admin/dailyChallengeAdminService';
import { AdminPage, AdminCard, Loading, ErrorBox, btnPrimary, btnSecondary, input as inputClass, Num } from '../adminUi';

const GROUPS = ['challenge', 'scoring', 'competition'];
const labelKey = (key) => key.replaceAll('.', '_');

/**
 * « التحدّي اليومي » — le barème et les défauts, réglés ICI sans
 * déploiement. Le serveur valide tout (clés fermées, bornes, paliers de
 * vitesse décroissants, fenêtre non vide) et refuse l'envoi en entier au
 * moindre défaut. Chaque défi FIGE sa configuration : un changement vaut
 * pour les défis générés ensuite, jamais pour un score passé.
 */
export default function DailyChallengeConfig() {
  const { t } = useTranslation('admin');
  useDocumentMeta(t('dailyChallenge.metaTitle'));
  const { token } = useContext(AuthContext);
  const resource = useAdminResource(useCallback((tok) => fetchDailyChallengeConfig(tok), []), []);
  const [draft, setDraft] = useState({});
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState(null);

  const fields = useMemo(() => resource.data?.fields ?? [], [resource.data]);
  useEffect(() => { setDraft(Object.fromEntries(fields.map((f) => [f.key, f.value]))); }, [fields]);

  const dirtyKeys = fields.filter((f) => JSON.stringify(draft[f.key]) !== JSON.stringify(f.value)).map((f) => f.key);
  const set = (key) => (value) => { setMessage(null); setDraft((d) => ({ ...d, [key]: value })); };

  const save = async () => {
    setPending(true);
    setMessage(null);
    try {
      const values = Object.fromEntries(dirtyKeys.map((k) => [k, draft[k]]));
      const data = await updateDailyChallengeConfig(token, values);
      resource.setData(data);
      setMessage({ tone: 'ok', text: t('dailyChallenge.saved') });
    } catch (e) {
      setMessage({ tone: 'error', text: `${t('dailyChallenge.error')} ${e.message ?? ''}` });
    } finally {
      setPending(false);
    }
  };

  return (
    <AdminPage eyebrow={t('nav.plans')} title={t('dailyChallenge.title')} subtitle={t('dailyChallenge.subtitle')}
      actions={(
        <div className="flex items-center gap-2">
          <button type="button" className={btnSecondary} disabled={dirtyKeys.length === 0 || pending} onClick={() => setDraft(Object.fromEntries(fields.map((f) => [f.key, f.value])))}>{t('dailyChallenge.reset')}</button>
          <button type="button" className={btnPrimary} disabled={dirtyKeys.length === 0 || pending} onClick={save} data-save-config>{pending ? t('common.saving') : t('dailyChallenge.save')}</button>
        </div>
      )}>
      {resource.loading && <Loading />}
      {resource.error && <ErrorBox message={resource.error} onRetry={resource.reload} />}
      {message && <p role={message.tone === 'error' ? 'alert' : 'status'} className={`mb-4 rounded-xl p-3 text-sm ${message.tone === 'error' ? 'bg-rose-50 text-rose-800' : 'bg-emerald-50 text-emerald-800'}`}>{message.text}</p>}

      {fields.length > 0 && (
        <div className="space-y-5">
          <p className="rounded-xl bg-violet-50 p-3 text-sm text-violet-900">{t('dailyChallenge.snapshotNote')}</p>
          {GROUPS.map((group) => (
            <AdminCard key={group} title={t(`dailyChallenge.groups.${group}`)}>
              <div className="divide-y divide-slate-100">
                {fields.filter((f) => f.key.startsWith(`${group}.`)).map((f) => (
                  <div key={f.key} className="grid gap-2 py-3 sm:grid-cols-[1fr_18rem] sm:items-center" data-config-field={f.key}>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{t(`dailyChallenge.fields.${labelKey(f.key)}`)}</p>
                      <p className="text-xs text-slate-500">{t('dailyChallenge.default')}: <Num>{JSON.stringify(f.default)}</Num></p>
                      {f.key === 'challenge.challenge_weekdays' && <p className="mt-1 text-xs text-amber-700">{t('dailyChallenge.weekdaysNote')}</p>}
                    </div>
                    <FieldEditor field={f} value={draft[f.key]} onChange={set(f.key)} />
                  </div>
                ))}
              </div>
            </AdminCard>
          ))}
          <AdminCard title={t('dailyChallenge.tieBreakingTitle')}>
            <ol className="list-decimal space-y-1 ps-5 text-sm text-slate-700">
              {resource.data.tieBreaking.map((rule) => <li key={rule}>{t(`dailyChallenge.tieBreaking.${rule}`)}</li>)}
            </ol>
            <p className="mt-2 text-xs text-slate-500">{t('dailyChallenge.timezone')}: <Num>{resource.data.timezone}</Num></p>
          </AdminCard>
        </div>
      )}
    </AdminPage>
  );
}

function FieldEditor({ field, value, onChange }) {
  const { t } = useTranslation('admin');
  switch (field.type) {
    case 'bool':
      return (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="h-4 w-4" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
          {value ? t('dailyChallenge.on') : t('dailyChallenge.off')}
        </label>
      );
    case 'int':
    case 'nullint':
    case 'float':
      return (
        <input type="number" dir="ltr" className={inputClass} step={field.type === 'float' ? '0.05' : '1'} value={value ?? ''}
          placeholder={field.type === 'nullint' ? t('dailyChallenge.none') : undefined}
          onChange={(e) => onChange(e.target.value === '' ? null : field.type === 'float' ? Number(e.target.value) : parseInt(e.target.value, 10))} />
      );
    case 'time':
      return <input type="time" dir="ltr" className={inputClass} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
    case 'intlist':
      if (field.key === 'challenge.challenge_weekdays') {
        return (
          <div className="flex flex-wrap gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7].map((d) => {
              const on = (value ?? []).includes(d);
              return (
                <button key={d} type="button" aria-pressed={on} onClick={() => onChange(on ? value.filter((x) => x !== d) : [...(value ?? []), d].sort())}
                  className={`min-h-[36px] rounded-lg border px-2.5 text-xs font-semibold ${on ? 'border-violet-600 bg-violet-50 text-violet-800' : 'border-slate-200 text-slate-500'}`}>
                  {t(`dailyChallenge.weekdays.${d}`)}
                </button>
              );
            })}
          </div>
        );
      }
      return (
        <input type="text" dir="ltr" className={inputClass} value={(value ?? []).join(', ')}
          onChange={(e) => onChange(e.target.value.split(/[,\s]+/).filter(Boolean).map((n) => parseInt(n, 10)).filter(Number.isFinite))} />
      );
    case 'tiers':
      return (
        <div className="space-y-1.5">
          {(value ?? []).map((tier, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs">
              <span>≤</span>
              <input type="number" dir="ltr" aria-label={t('dailyChallenge.tierSeconds')} className={`${inputClass} w-20`} value={tier.max_seconds}
                onChange={(e) => onChange(value.map((x, j) => (j === i ? { ...x, max_seconds: parseInt(e.target.value, 10) || 0 } : x)))} />
              <span>{t('dailyChallenge.seconds')} →</span>
              <input type="number" dir="ltr" aria-label={t('dailyChallenge.tierBonus')} className={`${inputClass} w-20`} value={tier.bonus}
                onChange={(e) => onChange(value.map((x, j) => (j === i ? { ...x, bonus: parseInt(e.target.value, 10) || 0 } : x)))} />
              <button type="button" className="px-2 text-rose-600" aria-label={t('dailyChallenge.removeTier')} onClick={() => onChange(value.filter((_, j) => j !== i))}>×</button>
            </div>
          ))}
          <button type="button" className="text-xs font-semibold text-violet-700" onClick={() => onChange([...(value ?? []), { max_seconds: ((value ?? []).at(-1)?.max_seconds ?? 0) + 10, bonus: 0 }])}>+ {t('dailyChallenge.addTier')}</button>
        </div>
      );
    default:
      return null;
  }
}
