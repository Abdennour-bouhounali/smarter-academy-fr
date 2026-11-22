import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import { changeContentStatus } from '../../services/admin/contentService';
import StatusBadge from './ui/StatusBadge';
import { ConfirmDialog } from './ui/Modal';

/** Les quatre états, et la CLÉ de leur geste — le libellé se traduit au rendu. */
const STATUSES = [
  { value: 'published', labelKey: 'bulk.publish' },
  { value: 'hidden', labelKey: 'bulk.hide' },
  { value: 'draft', labelKey: 'bulk.draft' },
  { value: 'archived', labelKey: 'bulk.archive' },
];

/**
 * Publier / masquer / archiver un contenu, depuis n'importe quelle liste.
 *
 * Toute sortie de « publié » passe par une confirmation : c'est un geste qui
 * retire du contenu à des élèves en train de travailler, et la spec (§33)
 * demande une confirmation pour les opérations conséquentes. Republier, à
 * l'inverse, ne demande rien — ça ne casse rien. Sauf pour une LEÇON : son
 * état est recopié sur tous ses محاور (cascade serveur, 2026-10-07), donc
 * même la publication se confirme, et le dialogue le dit.
 *
 * `onChanged(status, result)` : `result.modules` (leçon seulement) dit quels
 * محاور ont suivi et lesquels sont restés, faute d'être publiables.
 *
 * L'état affiché vient du SERVEUR après l'appel, jamais d'une supposition
 * optimiste : si le serveur refuse, l'interface ne doit pas raconter le
 * contraire.
 */
export default function PublicationControl({ type, id, status, onChanged, compact = false }) {
  const { t } = useTranslation('admin');
  const { token } = useContext(AuthContext);
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [skipped, setSkipped] = useState(0);
  const cascades = type === 'lesson';

  const apply = async (next) => {
    setBusy(true);
    setError(null);
    setSkipped(0);
    try {
      const result = await changeContentStatus(token, type, id, next);
      setSkipped(result.modules?.skipped?.length ?? 0);
      onChanged?.(result.publicationStatus, result);
    } catch (caught) {
      setError(caught.message);
    } finally {
      setBusy(false);
      setPending(null);
    }
  };

  const request = (next) => {
    if (!next || next === status) return;
    // Retirer du contenu aux élèves se confirme ; le remettre, non — sauf
    // pour une leçon, dont tous les محاور prennent le nouvel état.
    if (next === 'published' && !cascades) apply(next);
    else setPending(next);
  };

  return (
    <div className={compact ? 'flex items-center gap-2' : 'flex flex-wrap items-center gap-2'}>
      <StatusBadge status={status} />

      <select
        aria-label={t('bulk.changePublicationLabel')}
        value=""
        disabled={busy}
        onChange={(event) => request(event.target.value)}
        className="rounded-lg border border-slate-300 bg-white px-2 py-1 font-inter text-xs text-slate-700 disabled:opacity-50"
      >
        <option value="">{t('bulk.changePlaceholder')}</option>
        {STATUSES.filter((option) => option.value !== status).map((option) => (
          <option key={option.value} value={option.value}>{t(option.labelKey)}</option>
        ))}
      </select>

      {error && <span className="font-inter text-xs text-rose-600">{error}</span>}
      {skipped > 0 && (
        <span className="font-inter text-xs text-amber-700">{t('bulk.cascadeSkipped', { count: skipped })}</span>
      )}

      <ConfirmDialog
        open={Boolean(pending)}
        onClose={() => setPending(null)}
        onConfirm={() => apply(pending)}
        busy={busy}
        tone={pending === 'published' ? 'default' : 'danger'}
        cancelLabel={t('common.cancel')}
        busyLabel={t('common.busy')}
        closeLabel={t('common.close')}
        title={{
          published: t('bulk.confirmPublishOneTitle'),
          archived: t('bulk.confirmArchiveOneTitle'),
        }[pending] ?? t('bulk.confirmWithdrawOneTitle')}
        confirmLabel={{
          published: t('bulk.publish'),
          archived: t('bulk.archive'),
        }[pending] ?? t('bulk.withdraw')}
        message={
          <>
            {pending === 'published' ? (
              <p>{t('bulk.publishOneMessage')}</p>
            ) : (
              <p>
                {t('bulk.withdrawOneMessage')} <strong>{t('bulk.noLearningDataLost')}</strong>
                {t('bulk.noLearningDataLostHide')}
              </p>
            )}
            {cascades && pending && (
              <p className="mt-2">{t('bulk.cascadeModules', { status: t(`status.${pending}`) })}</p>
            )}
          </>
        }
      />
    </div>
  );
}
