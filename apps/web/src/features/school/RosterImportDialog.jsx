import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, CheckCircle2, Printer, Upload } from 'lucide-react';
import Modal from '../../components/admin/ui/Modal';
import { AuthContext } from '../../context/AuthContext';
import { commitRoster, previewRoster } from '../../services/schoolService';
import { parseRoster } from './rosterCsv';
import SchoolCredentialCards from './SchoolCredentialCards';
import { btnPrimary, btnSecondary, errorText, field, fieldLabel } from './ui';

const STATUS_TONE = {
  new: 'bg-emerald-50 text-emerald-800',
  exists: 'bg-slate-100 text-slate-600',
  duplicate_in_file: 'bg-amber-50 text-amber-800',
  invalid: 'bg-rose-50 text-rose-700',
};

/**
 * « استيراد قائمة قسم » (SCHOOL_ADMIN_SPACE.md §7). Trois temps dans la même
 * fenêtre : la liste (collée ou CSV), l'APERÇU du serveur — rien n'est créé —,
 * puis les cartes à imprimer, seule fois où les mots de passe existent.
 */
export default function RosterImportDialog({ open, onClose, classrooms, initialClassroomId, onImported }) {
  const { t } = useTranslation('idara');
  const { token } = useContext(AuthContext);
  const [classroomId, setClassroomId] = useState('');
  const [text, setText] = useState('');
  const [preview, setPreview] = useState(null);
  const [cards, setCards] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // Remise à zéro à l'OUVERTURE seulement : le parent recharge sa liste après
  // l'import, et les cartes doivent survivre à ce rechargement.
  useEffect(() => {
    if (open) {
      setClassroomId(String(initialClassroomId || classrooms[0]?.id || ''));
      setText('');
      setPreview(null);
      setCards(null);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const rows = parseRoster(text);
  const classroom = classrooms.find((c) => String(c.id) === String(classroomId));

  const readFile = async (event) => {
    const file = event.target.files?.[0];
    if (file) setText(await file.text());
    setPreview(null);
  };

  const run = async (action) => {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (e) {
      setError(errorText(t, e));
    } finally {
      setBusy(false);
    }
  };

  const doPreview = () => run(async () => {
    if (rows.length === 0) throw new Error(t('import.empty'));
    setPreview(await previewRoster(token, Number(classroomId), rows));
  });

  const doCommit = () => run(async () => {
    const result = await commitRoster(token, Number(classroomId), rows);
    setCards(result.cards);
    onImported?.();
  });

  const close = () => (busy ? null : onClose());
  const counts = preview?.counts;
  const canCommit = counts && counts.invalid === 0 && counts.new > 0;

  return (
    <Modal
      open={open}
      onClose={close}
      size="xl"
      title={t('import.title')}
      closeLabel={t('common.close')}
      footer={cards ? (
        <>
          <button type="button" className={btnSecondary} onClick={close}>{t('common.close')}</button>
          <button type="button" className={btnPrimary} onClick={() => window.print()}><Printer size={16} aria-hidden="true" />{t('common.print')}</button>
        </>
      ) : (
        <>
          <button type="button" className={btnSecondary} onClick={close} disabled={busy}>{t('common.cancel')}</button>
          {preview && canCommit ? (
            <button type="button" className={btnPrimary} onClick={doCommit} disabled={busy} data-roster-commit>
              {busy ? t('import.committing') : t('import.commit', { count: counts.new })}
            </button>
          ) : (
            <button type="button" className={btnPrimary} onClick={doPreview} disabled={busy || !classroomId} data-roster-preview>{t('import.preview')}</button>
          )}
        </>
      )}
    >
      {cards ? (
        <div className="space-y-4">
          <p role="status" className="flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
            <CheckCircle2 size={18} className="shrink-0" aria-hidden="true" />{t('import.done', { count: cards.length })}
          </p>
          <SchoolCredentialCards cards={cards} classroomName={classroom?.name} />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="roster-class" className={fieldLabel}>{t('import.classLabel')}</label>
              <select id="roster-class" className={field} value={classroomId} onChange={(e) => { setClassroomId(e.target.value); setPreview(null); }}>
                {classrooms.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="roster-file" className={fieldLabel}>{t('import.fileLabel')}</label>
              <label className={`${btnSecondary} w-full cursor-pointer`}>
                <Upload size={16} aria-hidden="true" />
                <input id="roster-file" type="file" accept=".csv,text/csv,text/plain" className="sr-only" onChange={readFile} />
                {t('import.fileLabel')}
              </label>
            </div>
          </div>
          <div>
            <label htmlFor="roster-text" className={fieldLabel}>{t('import.pasteLabel')}</label>
            <textarea id="roster-text" rows={6} className={field} value={text} onChange={(e) => { setText(e.target.value); setPreview(null); }} />
            <p className="mt-1 font-inter text-xs text-slate-500">{t('import.format')}</p>
          </div>

          {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 font-inter text-sm text-rose-700">{error}</p>}

          {preview && (
            <section className="space-y-3" data-roster-preview-table>
              <h3 className="font-space font-bold text-slate-900">{t('import.previewTitle')}</h3>
              <p className="font-inter text-sm text-slate-600">
                {t('import.counts', { new: counts.new, skipped: counts.exists + counts.duplicate_in_file, invalid: counts.invalid })}
                {' · '}
                {preview.seatsFrom === 'school'
                  ? t('import.seatsSchool', { count: preview.seatsRemaining })
                  : preview.seatsRemaining === null ? t('import.seatsUnlimited') : t('import.seats', { count: preview.seatsRemaining })}
              </p>
              {counts.invalid > 0 && (
                <p className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />{t('import.fixFirst')}
                </p>
              )}
              <div className="max-h-72 overflow-auto rounded-xl border border-slate-200">
                <table className="w-full font-inter text-sm">
                  <thead className="sticky top-0 bg-slate-50 text-slate-500">
                    <tr>
                      <th className="p-2 text-start">{t('import.line')}</th>
                      <th className="p-2 text-start">{t('students.name')}</th>
                      <th className="p-2 text-start">{t('import.birthDate')}</th>
                      <th className="p-2 text-start">{t('import.statusLabel')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.map((r) => (
                      <tr key={r.line} className="border-t border-slate-100">
                        <td className="p-2" dir="ltr">{r.line}</td>
                        <td className="p-2">{[r.firstName, r.lastName].filter(Boolean).join(' ') || t('common.dash')}</td>
                        <td className="p-2" dir="ltr">{r.birthDate || t('common.dash')}</td>
                        <td className="p-2">
                          <span className={`rounded-lg px-2 py-0.5 text-xs font-semibold ${STATUS_TONE[r.status]}`}>{t(`import.status.${r.status}`)}</span>
                          {r.problem && <span className="ms-2 text-xs text-rose-700">{t(`import.problem.${r.problem}`, { defaultValue: r.problem })}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      )}
    </Modal>
  );
}
