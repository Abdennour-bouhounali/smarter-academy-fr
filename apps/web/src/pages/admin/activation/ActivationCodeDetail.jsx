import { useCallback, useContext, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AdminPage, AdminCard, Loading, ErrorBox, useAdminLabels, formatDate, Num, btnDanger, input } from '../adminUi';
import StatusBadge from '../../../components/admin/ui/StatusBadge';
import { ConfirmDialog } from '../../../components/admin/ui/Modal';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';
import { AuthContext } from '../../../context/AuthContext';
import { fetchActivationCode, revokeActivationCode } from '../../../services/admin/activationCodeService';

/** Les actions du journal — la clé du catalogue, jamais le libellé. */
const ACTION_KEYS = {
  'activation_codes.generated': 'activation.actionBatchGenerated',
  'activation_code.revoked': 'activation.actionCodeRevoked',
  'activation_code_batch.revoked': 'activation.actionBatchRevoked',
  'activation_codes.exported': 'activation.actionCodesExported',
};

/**
 * Un code, et l'histoire qui explique son état.
 *
 * Le code en clair n'est pas ici, et ne peut pas y être : la base n'en garde
 * qu'une empreinte. Ce que cet écran montre — l'indice, les dates, l'élève,
 * le droit ouvert, le journal — est tout ce qui permet de répondre à
 * « que s'est-il passé avec cette carte ? ».
 */
export default function AdminActivationCodeDetail() {
  const { t } = useTranslation('admin');
  const L = useAdminLabels();
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  useDocumentMeta(t('activation.detailMetaTitle'));

  const loader = useCallback((authToken) => fetchActivationCode(authToken, id), [id]);
  const { data, loading, error, reload } = useAdminResource(loader, [loader]);

  const [confirming, setConfirming] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [revokeError, setRevokeError] = useState(null);

  const code = data?.code;
  const batch = data?.batch;
  const entitlement = data?.entitlement;
  const history = data?.history ?? [];

  const formatMoment = (iso) => formatDate(iso, { withTime: true });

  const confirmRevoke = async () => {
    if (!reason.trim()) {
      setRevokeError(t('activation.reasonRequired'));
      return;
    }

    setBusy(true);
    setRevokeError(null);
    try {
      await revokeActivationCode(token, id, reason.trim());
      setConfirming(false);
      setReason('');
      reload();
    } catch (caught) {
      setRevokeError(caught.message || t('activation.revokeCodeFailed'));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <AdminPage eyebrow={t('activation.eyebrow')} title={t('activation.detailTitle')}><Loading rows={5} /></AdminPage>;
  if (error) return <AdminPage eyebrow={t('activation.eyebrow')} title={t('activation.detailTitle')}><ErrorBox message={error} onRetry={reload} /></AdminPage>;
  if (!code) return null;

  const isActivated = code.status === 'activated';
  const canRevoke = code.status !== 'revoked';

  return (
    <AdminPage
      eyebrow={<Link to="/admin/codes-activation" className="hover:underline">{t('activation.title')}</Link>}
      title={<>{t('activation.detailTitle')} <Num className="font-mono-jetbrains">••••-••••-{code.hint}</Num></>}
      subtitle={batch?.label ? t('activation.batchNamed', { label: batch.label }) : undefined}
      actions={canRevoke ? (
        <button
          type="button"
          onClick={() => { setConfirming(true); setReason(''); setRevokeError(null); }}
          className={btnDanger}
        >
          {t('activation.revoke')}
        </button>
      ) : null}
    >
      <div className="space-y-3">
        <AdminCard title={t('activation.theCode')}>
          <dl className="grid gap-3 sm:grid-cols-2">
            <Row label={t('activation.columnStatus')}><StatusBadge status={code.status} /></Row>
            <Row label={t('activation.columnHint')}>
              <Num className="font-mono-jetbrains text-xs">••••-••••-{code.hint}</Num>
            </Row>
            <Row label={t('activation.columnCreated')}>{formatMoment(code.createdAt)}</Row>
            <Row label={t('activation.redeemBy')}>{formatMoment(code.expiresAt)}</Row>
            <Row label={t('activation.columnActivatedAt')}>{formatMoment(code.activatedAt)}</Row>
            <Row label={t('activation.columnActivatedBy')}>
              {code.activatedBy
                ? <Link to={`/admin/eleves/${code.activatedBy.id}`} className="text-violet-700 hover:underline"><Num>{code.activatedBy.email}</Num></Link>
                : t('common.dash')}
            </Row>
            {code.revokedAt && (
              <>
                <Row label={t('activation.revokedAt')}>{formatMoment(code.revokedAt)}</Row>
                <Row label={t('activation.revokedBy')}>{code.revokedBy ?? t('common.dash')}</Row>
                <Row label={t('common.reason')}>{code.revokeReason ?? t('common.dash')}</Row>
              </>
            )}
          </dl>

          <p className="mt-3 font-inter text-[11px] text-slate-500">
            {t('activation.fingerprintOnly')}
          </p>
        </AdminCard>

        {batch && (
          <AdminCard title={t('activation.theBatch')}>
            <dl className="grid gap-3 sm:grid-cols-2">
              <Row label={t('common.name')}>{batch.label}</Row>
              <Row label={t('activation.columnQuantity')}><Num>{batch.quantity}</Num></Row>
              <Row label={t('activation.columnAccess')}>
                {batch.accessEndsAt
                  ? t('activation.accessUntil', { date: formatMoment(batch.accessEndsAt) })
                  : batch.accessDays
                    ? t('activation.accessDaysFromRedemption', { count: batch.accessDays })
                    : t('activation.accessEndless')}
              </Row>
              <Row label={t('activation.createdBy')}>{batch.createdBy ?? t('common.dash')}</Row>
              {batch.notes && <Row label={t('common.note')}>{batch.notes}</Row>}
            </dl>
          </AdminCard>
        )}

        <AdminCard title={t('activation.theEntitlement')}>
          {entitlement ? (
            <dl className="grid gap-3 sm:grid-cols-2">
              <Row label={t('common.status')}>
                <StatusBadge status={entitlement.status === 'active' ? 'active' : 'revoked'} />
                {entitlement.valid ? ` · ${t('activation.entitlementOpens')}` : ` · ${t('activation.entitlementClosed')}`}
              </Row>
              <Row label={t('activation.entitlementFrom')}>{formatMoment(entitlement.startsAt)}</Row>
              <Row label={t('activation.entitlementUntil')}>
                {entitlement.expiresAt ? formatMoment(entitlement.expiresAt) : t('activation.accessEndless')}
              </Row>
              {entitlement.revokedAt && <Row label={t('activation.revokedAt')}>{formatMoment(entitlement.revokedAt)}</Row>}
            </dl>
          ) : (
            <p className="font-inter text-xs text-slate-500">
              {t('activation.noEntitlementYet')}
            </p>
          )}
        </AdminCard>

        <AdminCard title={t('activation.history')}>
          {history.length === 0 ? (
            <p className="font-inter text-xs text-slate-500">{t('activation.noHistory')}</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {history.map((entry) => (
                <li key={entry.id} className="flex flex-wrap items-baseline justify-between gap-2 py-2">
                  <span className="font-inter text-xs font-semibold text-slate-800">
                    {ACTION_KEYS[entry.action] ? t(ACTION_KEYS[entry.action]) : entry.action}
                  </span>
                  <span className="font-inter text-xs text-slate-500">
                    {entry.admin ?? t('common.dash')} · {formatMoment(entry.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      </div>

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={confirmRevoke}
        title={t('activation.revokeTitle')}
        tone="danger"
        confirmLabel={t('activation.revoke')}
        cancelLabel={L.dialog.cancelLabel}
        busyLabel={L.dialog.busyLabel}
        closeLabel={L.dialog.closeLabel}
        busy={busy}
        message={(
          <div className="space-y-3">
            {isActivated && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-2">
                <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-600" />
                <p className="font-inter text-xs text-amber-900">
                  {/* Le courriel sort de la phrase arabe : inséré dans le
                      gabarit, l'algorithme bidi le recollerait au mauvais
                      bout. Isolé par <Num>, il se lit tel qu'il est saisi. */}
                  {code.activatedBy
                    ? <>{t('activation.revokeActivatedWarningPrefix')} <Num>{code.activatedBy.email}</Num>{t('activation.revokeActivatedWarningSuffix')}</>
                    : t('activation.revokeActivatedWarning')}
                </p>
              </div>
            )}
            <p className="font-inter text-xs text-slate-600">
              {t('activation.revokeKeepsHistory')}
            </p>
            <label className="block">
              <span className="mb-1 block font-inter text-xs font-semibold text-slate-700">{t('activation.reasonLabel')}</span>
              <input
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                maxLength={255}
                className={input}
                placeholder={t('activation.reasonCodePlaceholder')}
              />
            </label>
            {revokeError && <p role="alert" className="font-inter text-xs text-rose-700">{revokeError}</p>}
          </div>
        )}
      />
    </AdminPage>
  );
}

function Row({ label, children }) {
  return (
    <div>
      <dt className="font-inter text-[11px] uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="font-inter text-xs text-slate-800">{children}</dd>
    </div>
  );
}
