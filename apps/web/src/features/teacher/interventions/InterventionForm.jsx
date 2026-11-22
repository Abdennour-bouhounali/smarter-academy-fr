import { useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Camera } from 'lucide-react';
import { AuthContext } from '../../../context/AuthContext';
import Modal from '../../../components/admin/ui/Modal';
import { createClassIntervention } from '../../../services/teacher/classGroupService';
import { btnPrimary, btnSecondary, input } from '../../../pages/teacher/teacherUi';
import { INTERVENTION_KINDS, kindNeedsPoint, kindVisibleToStudent, studentName } from '../insights/insights';

/**
 * « Intervenir » — le geste de l'enseignant, depuis un signal, un point ou un
 * élève. UN formulaire, monté dans la boîte de dialogue du kit partout où il
 * sert (le motif documenté du contrat enseignant §8 : il possède ses champs
 * et son appel ; l'appelant ne décide que de la suite, `onCreated`).
 *
 * Le serveur valide tout (élèves membres actifs, point dans le périmètre,
 * geste qui exige un point) ; l'écran ne fait que ne pas proposer
 * l'impossible. À la création, le serveur FIGE l'état de chaque élève sur le
 * point : c'est la base de « Ce qui s'est passé ensuite ».
 *
 * @param {{
 *   open: boolean, onClose: () => void, onCreated?: (intervention: object) => void,
 *   classGroupId: number|string,
 *   candidates: Array<{id: number, firstName?: string, lastName?: string}>,
 *   prefill?: {kind?: string, studentIds?: number[], learningPointCode?: string|null, sourceSignal?: string|null},
 *   point?: {code: string, title: string}|null,
 * }} props
 */
export default function InterventionForm({ open, onClose, onCreated, classGroupId, candidates, prefill, point }) {
  const { t } = useTranslation('teacher');
  const { token } = useContext(AuthContext);
  const [kind, setKind] = useState(prefill?.kind ?? INTERVENTION_KINDS[0]);
  const [selected, setSelected] = useState(() => new Set(prefill?.studentIds ?? []));
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');
  const [reviewAfter, setReviewAfter] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  // Rouvrir le formulaire depuis un autre signal repart de SES valeurs.
  useEffect(() => {
    if (!open) return;
    setKind(prefill?.kind ?? INTERVENTION_KINDS[0]);
    setSelected(new Set(prefill?.studentIds ?? []));
    setNote('');
    setMessage('');
    setReviewAfter('');
    setError(null);
  }, [open, prefill]);

  const kinds = useMemo(() => INTERVENTION_KINDS.filter((k) => point || (!kindNeedsPoint(k) && k !== 'recommend_lesson')), [point]);
  const visible = kindVisibleToStudent(kind);
  const unnamed = t('common.unnamedStudent');

  const toggle = (id) => setSelected((cur) => {
    const next = new Set(cur);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const submit = async (event) => {
    event.preventDefault();
    if (selected.size === 0) { setError(t('interventions.form.noStudents')); return; }
    if (kindNeedsPoint(kind) && !point) { setError(t('interventions.form.needPoint')); return; }
    setPending(true);
    setError(null);
    try {
      const created = await createClassIntervention(token, classGroupId, {
        kind,
        studentIds: [...selected],
        learningPointCode: point?.code ?? undefined,
        note: note.trim() || undefined,
        studentMessage: visible ? (message.trim() || undefined) : undefined,
        reviewAfter: reviewAfter || undefined,
        sourceSignal: prefill?.sourceSignal ?? undefined,
      });
      onCreated?.(created);
      onClose();
    } catch (err) {
      setError(t(`classes.errors.${err?.reason ?? 'generic'}`, { defaultValue: err?.message || t('classes.errors.generic') }));
    } finally {
      setPending(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => (pending ? null : onClose())}
      title={point ? `${t('interventions.form.title')} — ${point.title}` : t('interventions.form.title')}
      size="lg"
      closeLabel={t('common.close')}
    >
      <form onSubmit={submit} className="space-y-5" data-intervention-form>
        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-slate-800">{t('interventions.form.kind')}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {kinds.map((k) => (
              <label key={k} className={`flex cursor-pointer gap-2 rounded-xl border p-3 text-sm ${kind === k ? 'border-nav-accent bg-nav-page' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                <input type="radio" name="kind" value={k} checked={kind === k} onChange={() => setKind(k)} className="mt-1" data-intervention-kind={k} />
                <span>
                  <span className="block font-semibold text-slate-800">{t(`interventions.kinds.${k}`)}</span>
                  <span className="block text-[11px] text-slate-500">{t(`interventions.kindHints.${k}`)}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <div className="mb-2 flex items-center justify-between gap-2">
            <legend className="text-sm font-semibold text-slate-800">{t('interventions.form.students')}</legend>
            {candidates.length > 1 && (
              <span className="flex gap-2 text-[11px]">
                <button type="button" className="text-nav-accent hover:underline" onClick={() => setSelected(new Set(candidates.map((c) => c.id)))}>{t('interventions.form.selectAll')}</button>
                <button type="button" className="text-slate-500 hover:underline" onClick={() => setSelected(new Set())}>{t('interventions.form.selectNone')}</button>
              </span>
            )}
          </div>
          <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto">
            {candidates.map((s) => (
              <label key={s.id} className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${selected.has(s.id) ? 'border-nav-accent bg-nav-page text-nav-accent' : 'border-slate-200 bg-white text-slate-600'}`}>
                <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggle(s.id)} className="h-3.5 w-3.5" data-intervention-student={s.id} />
                {studentName(s, unnamed)}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-slate-800">{t('interventions.form.note')}</span>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={2000} placeholder={t('interventions.form.notePlaceholder')} className={input} data-intervention-note />
          <span className="mt-1 flex items-center gap-1 text-[11px] text-slate-500"><EyeOff size={12} /> {t('interventions.form.notePrivate')}</span>
        </label>

        {visible && (
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-800">{t('interventions.form.studentMessage')}</span>
            <input value={message} onChange={(e) => setMessage(e.target.value)} maxLength={500} placeholder={t('interventions.form.studentMessagePlaceholder')} className={input} data-intervention-message />
          </label>
        )}

        <label className="block max-w-xs">
          <span className="mb-1 block text-sm font-semibold text-slate-800">{t('interventions.form.reviewAfter')}</span>
          <input type="date" dir="ltr" value={reviewAfter} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setReviewAfter(e.target.value)} className={input} />
        </label>

        <div className="space-y-1 rounded-xl bg-slate-50 p-3 text-[11px] text-slate-600">
          <p className="flex items-center gap-1.5">{visible ? <Eye size={12} /> : <EyeOff size={12} />} {visible ? t('interventions.form.visibleNotice') : t('interventions.form.privateNotice')}</p>
          {point && <p className="flex items-center gap-1.5"><Camera size={12} /> {t('interventions.form.baselineNotice')}</p>}
        </div>

        {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} disabled={pending} className={btnSecondary}>{t('common.cancel')}</button>
          <button type="submit" disabled={pending} className={btnPrimary} data-intervention-submit>{pending ? t('interventions.form.saving') : t('interventions.form.submit')}</button>
        </div>
      </form>
    </Modal>
  );
}
