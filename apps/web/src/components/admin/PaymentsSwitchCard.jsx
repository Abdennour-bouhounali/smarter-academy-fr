import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import { usePayments } from '../../context/PaymentsContext';
import { useAdminResource } from '../../hooks/useAdminResource';
import { fetchPaymentsSwitch, updatePaymentsSwitch } from '../../services/admin/paymentsSwitchService';
import { AdminCard, btnPrimary, btnSecondary, formatDate } from '../../pages/admin/adminUi';
import Switch from './ui/Switch';

/**
 * Sends the change the administrator confirmed. Resolves `{ payments }` (the server's new state) or `{ refusal }`
 * when opening is refused because the provider is not configured (`payments_not_configured`, with its `missing`
 * names); any other failure throws.
 */
export async function changePayments(token, open) {
  try {
    return { payments: await updatePaymentsSwitch(token, open) };
  } catch (error) {
    if (error?.code === 'payments_not_configured') return { refusal: { missing: error.missing ?? [] } };
    throw error;
  }
}

function Missing({ names }) {
  return (
    <ul className="mt-1 flex flex-wrap gap-1.5" data-payments-missing>
      {names.map((name) => (
        <li key={name} dir="ltr" className="rounded-md bg-slate-100 px-2 py-0.5 font-mono-jetbrains text-[11px] text-slate-700">
          {name}
        </li>
      ))}
    </ul>
  );
}

/**
 * The card, without state: what the server said (`payments`), the switch, and — once the switch is pressed — ONE
 * sentence saying what the change does, to confirm or cancel. Nothing is sent before the confirmation.
 */
export function PaymentsSwitchView({ t, payments, loading, pending, saving, error, refusal, onAsk, onConfirm, onCancel }) {
  const open = Boolean(payments?.open);
  const by = payments?.lastChange?.by?.name;
  const at = payments?.lastChange?.at;

  return (
    <AdminCard title={t('payments.title')} className="mb-6">
      {payments ? (
        <div className="space-y-3" data-payments={open ? 'open' : 'closed'}>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className={`font-inter text-sm font-semibold ${open ? 'text-emerald-700' : 'text-slate-800'}`}>
                {open ? t('payments.open') : t('payments.closed')}
              </p>
              <p className="font-inter text-xs text-slate-500">{open ? t('payments.openHint') : t('payments.closedHint')}</p>
            </div>
            <Switch
              on={open}
              label={t('payments.switchLabel')}
              disabled={saving || pending !== null}
              onToggle={() => onAsk(!open)}
              onClass="bg-emerald-600"
              data-payments-switch
            />
          </div>

          <dl className="grid gap-1 border-t border-slate-100 pt-3 font-inter text-xs text-slate-600">
            <div className="flex flex-wrap gap-x-2" data-payments-provider>
              <dt className="font-semibold text-slate-700">{t('payments.provider')}</dt>
              <dd dir="ltr">{payments.provider}</dd>
              <dd data-payments-mode={payments.mode}>{payments.mode === 'live' ? t('payments.modeLive') : t('payments.modeTest')}</dd>
            </div>
            <div data-payments-configured={payments.configured ? 'yes' : 'no'}>
              <dt className="sr-only">{t('payments.configuration')}</dt>
              <dd className={payments.configured ? 'text-emerald-700' : 'text-amber-800'}>
                {payments.configured ? t('payments.configured') : t('payments.notConfigured')}
                {!payments.configured && <Missing names={payments.missing ?? []} />}
              </dd>
            </div>
            <div data-payments-last-change>
              <dt className="sr-only">{t('payments.lastChangeLabel')}</dt>
              <dd>
                {!payments.lastChange
                  ? t('payments.neverChanged')
                  : by
                    ? t('payments.lastChange', { name: by, date: formatDate(at, { withTime: true }) })
                    : t('payments.lastChangeNoName', { date: formatDate(at, { withTime: true }) })}
              </dd>
            </div>
          </dl>

          {pending !== null && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3" role="alertdialog" aria-label={t('payments.switchLabel')} data-payments-confirm={pending ? 'open' : 'close'}>
              <p className="font-inter text-sm text-slate-800">{pending ? t('payments.confirmOpen') : t('payments.confirmClose')}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button type="button" className={btnPrimary} disabled={saving} onClick={onConfirm} data-payments-confirm-yes>
                  {pending ? t('payments.confirmOpenButton') : t('payments.confirmCloseButton')}
                </button>
                <button type="button" className={btnSecondary} disabled={saving} onClick={onCancel} data-payments-confirm-no>
                  {t('payments.cancel')}
                </button>
              </div>
            </div>
          )}

          {refusal && (
            <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 font-inter text-xs text-rose-800" data-payments-refusal>
              {t('payments.refusedNotConfigured')}
              <Missing names={refusal.missing} />
            </div>
          )}

          {saving && <p role="status" className="font-inter text-xs text-slate-500">{t('payments.saving')}</p>}
        </div>
      ) : (
        loading && <p role="status" className="font-inter text-xs text-slate-500">{t('payments.loading')}</p>
      )}
      {error && <p role="alert" className="mt-2 font-inter text-xs text-rose-600">{error}</p>}
    </AdminCard>
  );
}

/** « Paiement en ligne » on the dashboard, beside « Inscriptions »: open or close online payment (§4ter). */
export default function PaymentsSwitchCard() {
  const { t } = useTranslation('admin');
  const { token } = useContext(AuthContext);
  const { refresh } = usePayments();
  const { data, loading, error: loadError, setData } = useAdminResource(fetchPaymentsSwitch);
  const [pending, setPending] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [refusal, setRefusal] = useState(null);

  const onAsk = (next) => {
    setError(null);
    setRefusal(null);
    setPending(next);
  };

  const onConfirm = async () => {
    setSaving(true);
    try {
      const result = await changePayments(token, pending);
      if (result.refusal) setRefusal(result.refusal);
      else {
        setData(result.payments);
        // The administrator's own app follows the switch at once.
        refresh();
      }
    } catch {
      setError(t('payments.error'));
    } finally {
      setSaving(false);
      setPending(null);
    }
  };

  return (
    <PaymentsSwitchView
      t={t}
      payments={data}
      loading={loading}
      pending={pending}
      saving={saving}
      error={error ?? (loadError && t('payments.loadError'))}
      refusal={refusal}
      onAsk={onAsk}
      onConfirm={onConfirm}
      onCancel={() => setPending(null)}
    />
  );
}
