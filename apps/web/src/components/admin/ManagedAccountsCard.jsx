import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import { useAdminResource } from '../../hooks/useAdminResource';
import { fetchManagedAccounts, updateManagedAccounts } from '../../services/admin/managedAccountsService';
import { AdminCard, btnPrimary, btnSecondary, formatDate } from '../../pages/admin/adminUi';
import Switch from './ui/Switch';

/**
 * The card, without state: what the server said (`managedAccounts`), the switch, and — once the switch is pressed —
 * ONE sentence saying what the change does, to confirm or cancel. Nothing is sent before the confirmation.
 */
export function ManagedAccountsView({
  t,
  managedAccounts,
  loading,
  pending,
  saving,
  error,
  onAsk,
  onConfirm,
  onCancel,
}) {
  const open = Boolean(managedAccounts?.open);
  const by = managedAccounts?.lastChange?.by?.name;
  const at = managedAccounts?.lastChange?.at;

  return (
    <AdminCard title={t('managedAccounts.title')} className="mb-6">
      {managedAccounts ? (
        <div className="space-y-3" data-managed-accounts={open ? 'open' : 'closed'}>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className={`font-inter text-sm font-semibold ${open ? 'text-emerald-700' : 'text-slate-800'}`}>
                {open ? t('managedAccounts.open') : t('managedAccounts.closed')}
              </p>
              <p className="font-inter text-xs text-slate-500">
                {open ? t('managedAccounts.openHint') : t('managedAccounts.closedHint')}
              </p>
            </div>
            <Switch
              on={open}
              label={t('managedAccounts.switchLabel')}
              disabled={saving || pending !== null}
              onToggle={() => onAsk(!open)}
              onClass="bg-emerald-600"
              data-managed-accounts-switch
            />
          </div>

          <p
            className="border-t border-slate-100 pt-3 font-inter text-xs text-slate-600"
            data-managed-accounts-existing
          >
            {t('managedAccounts.existing')}
          </p>
          <p className="font-inter text-xs text-slate-600" data-managed-accounts-last-change>
            {!managedAccounts.lastChange
              ? t('managedAccounts.neverChanged')
              : by
                ? t('managedAccounts.lastChange', { name: by, date: formatDate(at, { withTime: true }) })
                : t('managedAccounts.lastChangeNoName', { date: formatDate(at, { withTime: true }) })}
          </p>

          {pending !== null && (
            <div
              className="rounded-xl border border-amber-200 bg-amber-50 p-3"
              role="alertdialog"
              aria-label={t('managedAccounts.switchLabel')}
              data-managed-accounts-confirm={pending ? 'open' : 'close'}
            >
              <p className="font-inter text-sm text-slate-800">
                {pending ? t('managedAccounts.confirmOpen') : t('managedAccounts.confirmClose')}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  className={btnPrimary}
                  disabled={saving}
                  onClick={onConfirm}
                  data-managed-accounts-confirm-yes
                >
                  {pending ? t('managedAccounts.confirmOpenButton') : t('managedAccounts.confirmCloseButton')}
                </button>
                <button
                  type="button"
                  className={btnSecondary}
                  disabled={saving}
                  onClick={onCancel}
                  data-managed-accounts-confirm-no
                >
                  {t('managedAccounts.cancel')}
                </button>
              </div>
            </div>
          )}

          {saving && (
            <p role="status" className="font-inter text-xs text-slate-500">
              {t('managedAccounts.saving')}
            </p>
          )}
        </div>
      ) : (
        loading && (
          <p role="status" className="font-inter text-xs text-slate-500">
            {t('managedAccounts.loading')}
          </p>
        )
      )}
      {error && (
        <p role="alert" className="mt-2 font-inter text-xs text-rose-600">
          {error}
        </p>
      )}
    </AdminCard>
  );
}

/**
 * « Comptes créés par un établissement ou un professeur » on the dashboard, beside « Inscriptions » and « Paiement en
 * ligne »: open or close the roster import and the login cards (ManagedAccountsGate).
 */
export default function ManagedAccountsCard() {
  const { t } = useTranslation('admin');
  const { token } = useContext(AuthContext);
  const { data, loading, error: loadError, setData } = useAdminResource(fetchManagedAccounts);
  const [pending, setPending] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const onAsk = (next) => {
    setError(null);
    setPending(next);
  };

  const onConfirm = async () => {
    setSaving(true);
    try {
      setData(await updateManagedAccounts(token, pending));
    } catch {
      setError(t('managedAccounts.error'));
    } finally {
      setSaving(false);
      setPending(null);
    }
  };

  return (
    <ManagedAccountsView
      t={t}
      managedAccounts={data}
      loading={loading}
      pending={pending}
      saving={saving}
      error={error ?? (loadError && t('managedAccounts.loadError'))}
      onAsk={onAsk}
      onConfirm={onConfirm}
      onCancel={() => setPending(null)}
    />
  );
}
