import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../../context/AuthContext';
import { activatePlan } from '../../../services/admin/subscriptionService';
import { ConfirmDialog } from '../ui/Modal';

/**
 * « تفعيل عرض » depuis une LIGNE de la liste des élèves — le même geste que
 * le formulaire du CommercialPanel (même route, même validation et même
 * journal côté serveur), sans date de fin ni note : l'offre garde sa durée.
 * Pour une date ou une note, la fiche de l'élève reste le chemin complet.
 *
 * Toujours confirmé : c'est l'enregistrement d'un argent reçu hors plateforme.
 *
 * @param {{studentId: number, studentName: string, plans: Array<{id: number, name: string}>, onActivated?: (subscription: object) => void}} props
 */
export default function PlanActivateControl({ studentId, studentName, plans, onActivated }) {
  const { t } = useTranslation('admin');
  const { token } = useContext(AuthContext);
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  if (!plans.length) return <span className="text-slate-400">{t('common.dash')}</span>;

  const apply = async () => {
    setBusy(true);
    setError(null);
    try {
      const result = await activatePlan(token, 'students', studentId, { planId: pending.id });
      onActivated?.(result.subscription);
    } catch (caught) {
      setError(caught.message);
    } finally {
      setBusy(false);
      setPending(null);
    }
  };

  return (
    <div className="flex items-center gap-2" data-row-activate-plan>
      <select
        aria-label={t('students.activatePlanLabel', { name: studentName })}
        value=""
        disabled={busy}
        onChange={(event) => setPending(plans.find((p) => String(p.id) === event.target.value) ?? null)}
        className="rounded-lg border border-violet-300 bg-white px-2 py-1 font-inter text-xs text-violet-800 disabled:opacity-50"
      >
        <option value="">{t('students.activatePlanPlaceholder')}</option>
        {plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>

      {error && <span className="font-inter text-xs text-rose-600">{error}</span>}

      <ConfirmDialog
        open={Boolean(pending)}
        onClose={() => setPending(null)}
        onConfirm={apply}
        busy={busy}
        cancelLabel={t('common.cancel')}
        busyLabel={t('common.busy')}
        closeLabel={t('common.close')}
        title={t('students.confirmActivateOneTitle', { plan: pending?.name, name: studentName })}
        confirmLabel={t('commercial.activate')}
        message={<p>{t('commercial.activatePlanHint')}</p>}
      />
    </div>
  );
}
