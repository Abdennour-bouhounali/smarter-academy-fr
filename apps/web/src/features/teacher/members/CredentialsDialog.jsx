import { useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Printer, KeyRound, AlertTriangle } from 'lucide-react';
import { AuthContext } from '../../../context/AuthContext';
import Modal from '../../../components/admin/ui/Modal';
import { issueStudentCredentials } from '../../../services/teacher/classGroupService';
import { btnPrimary, btnSecondary } from '../../../pages/teacher/teacherUi';
import { studentName } from '../insights/insights';
import './credentials.css';

/**
 * « بطاقات الدخول » — l'enseignant choisit des élèves, le serveur leur émet
 * un NOUVEAU mot de passe (StudentCredentials côté API), et la réponse est
 * imprimée en cartes à découper : courriel + mot de passe + adresse du site.
 *
 * Les mots de passe ne vivent que dans l'état de ce composant : fermer la
 * boîte les efface, et ils ne se relisent jamais (le serveur ne garde que le
 * hachage). D'où l'avertissement « اطبعها الآن ».
 *
 * L'impression : une copie des cartes est rendue dans un portail
 * `[data-credentials-print]`, invisible à l'écran ; credentials.css masque
 * tout le reste de la page à l'impression.
 */
export default function CredentialsDialog({ open, onClose, classGroup, students }) {
  const { t } = useTranslation('teacher');
  const { token } = useContext(AuthContext);
  const [selected, setSelected] = useState(() => new Set());
  const [cards, setCards] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // Chaque ouverture repart de zéro — tous cochés, aucune carte gardée.
  useEffect(() => {
    if (!open) return;
    setSelected(new Set(students.map((s) => s.id)));
    setCards(null);
    setError(null);
  }, [open, students]);

  const toggle = (id) => setSelected((cur) => {
    const next = new Set(cur);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const allChecked = students.length > 0 && selected.size === students.length;

  const issue = async () => {
    setBusy(true);
    setError(null);
    try {
      setCards(await issueStudentCredentials(token, classGroup.id, [...selected]));
    } catch (err) {
      setError(t(`classes.errors.${err?.reason ?? 'generic'}`, { defaultValue: t('classes.errors.generic') }));
    } finally {
      setBusy(false);
    }
  };

  const close = () => (busy ? null : onClose());
  const loginUrl = `${window.location.host}/login`;

  return (
    <Modal
      open={open}
      onClose={close}
      size="lg"
      title={t('students.credentials.title')}
      closeLabel={t('common.close')}
      footer={cards ? (
        <>
          <button type="button" onClick={close} className={btnSecondary}>{t('students.credentials.done')}</button>
          <button type="button" onClick={() => window.print()} className={btnPrimary}><Printer size={14} aria-hidden="true" /> {t('students.credentials.print')}</button>
        </>
      ) : (
        <>
          <button type="button" onClick={close} disabled={busy} className={btnSecondary}>{t('students.credentials.cancel')}</button>
          <button type="button" onClick={issue} disabled={busy || selected.size === 0} className={btnPrimary}>
            <KeyRound size={14} aria-hidden="true" />
            {busy ? t('students.credentials.issuing') : t('students.credentials.issue', { count: selected.size })}
          </button>
        </>
      )}
    >
      {!cards && (
        <div className="space-y-4">
          <p className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>{t('students.credentials.warning')}</span>
          </p>
          <label className="flex items-center gap-2 font-semibold text-slate-800">
            <input type="checkbox" className="h-4 w-4" checked={allChecked}
              onChange={() => setSelected(allChecked ? new Set() : new Set(students.map((s) => s.id)))} />
            {t('students.credentials.selectAll', { count: students.length })}
          </label>
          <ul className="grid grid-cols-2 gap-2" data-credentials-picker>
            {students.map((s) => (
              <li key={s.id}>
                <label className="flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50">
                  <input type="checkbox" className="h-4 w-4" checked={selected.has(s.id)} onChange={() => toggle(s.id)} />
                  <span>{studentName(s, t('common.unnamedStudent'))}</span>
                </label>
              </li>
            ))}
          </ul>
          {error && <p role="alert" className="text-rose-700">{error}</p>}
        </div>
      )}

      {cards && (
        <div className="space-y-4">
          <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-900">{t('students.credentials.ready')}</p>
          <CredentialCards cards={cards} classGroup={classGroup} loginUrl={loginUrl} />
          {createPortal(
            <div data-credentials-print dir="rtl">
              <CredentialCards cards={cards} classGroup={classGroup} loginUrl={loginUrl} />
            </div>,
            document.body,
          )}
        </div>
      )}
    </Modal>
  );
}

/** Les cartes à découper — les mêmes à l'écran et sur papier. */
function CredentialCards({ cards, classGroup, loginUrl }) {
  const { t } = useTranslation('teacher');

  return (
    <ul className="sa-cred-grid">
      {cards.map((c) => (
        <li key={c.id} className="sa-cred-card">
          <p className="sa-cred-class">{classGroup.name}</p>
          <p className="sa-cred-name">{studentName(c, t('common.unnamedStudent'))}</p>
          <dl>
            <dt>{t('students.credentials.site')}</dt>
            <dd dir="ltr">{loginUrl}</dd>
            <dt>{t('students.credentials.email')}</dt>
            <dd dir="ltr">{c.email}</dd>
            <dt>{t('students.credentials.password')}</dt>
            <dd dir="ltr" className="sa-cred-secret">{c.password}</dd>
          </dl>
          <p className="sa-cred-note">{t('students.credentials.cardNote')}</p>
        </li>
      ))}
    </ul>
  );
}
