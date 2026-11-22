import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Trash2, TriangleAlert } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { deleteUser, fetchUserDeletionPreview } from '../../services/admin/userDeletionService';
import Modal from './ui/Modal';

/** Les compteurs de l'aperçu, dans l'ordre d'affichage. Les zéros sont tus. */
const SUMMARY_KEYS = [
  'classrooms', 'studentsInClassrooms', 'lessonProgress', 'learningPoints', 'practiceSessions',
  'questionAttempts', 'answerImages', 'notebookNotes', 'mathLabDocuments', 'mathLabFiles',
  'subscriptions', 'payments', 'reports', 'classMemberships',
];

/**
 * « Zone de danger » — la suppression DÉFINITIVE d'un compte élève ou enseignant.
 *
 * Distincte de la désactivation, qui garde tout : ici rien ne reste. D'où un
 * avertissement en trois temps : ce qui sera perdu (compté par le serveur),
 * le rappel que c'est irréversible, et l'adresse e-mail du compte à RETAPER —
 * le bouton reste inactif tant qu'elle ne correspond pas, et le serveur la
 * revérifie de toute façon (UserDeletionService).
 *
 * @param {{ id: number, email: string, name?: string }} user
 * @param {'student'|'teacher'} role
 * @param {string} backTo  la liste où revenir une fois le compte supprimé
 */
export default function DeleteUserSection({ user, role, backTo }) {
  const { t } = useTranslation('admin');
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState(null);
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;
    setSummary(null);
    setTyped('');
    setError(null);
    fetchUserDeletionPreview(token, user.id)
      .then((result) => { if (!cancelled) setSummary(result); })
      .catch((caught) => { if (!cancelled) setError(caught.message); });
    return () => { cancelled = true; };
  }, [open, token, user.id]);

  const matches = typed.trim().toLowerCase() === String(user.email ?? '').toLowerCase();

  const confirm = async () => {
    if (!matches) return;
    setBusy(true);
    setError(null);
    try {
      await deleteUser(token, user.id, typed);
      navigate(backTo, { replace: true, state: { deletedUser: user.email } });
    } catch (caught) {
      setError(caught.message);
      setBusy(false);
    }
  };

  const lost = summary ? SUMMARY_KEYS.filter((key) => (summary[key] ?? 0) > 0) : [];

  return (
    <section className="rounded-xl border border-rose-200 bg-rose-50/50 p-4">
      <h2 className="mb-1 flex items-center gap-2 font-space text-sm font-bold text-rose-800">
        <TriangleAlert size={16} /> {t('deleteUser.zoneTitle')}
      </h2>
      <p className="mb-3 font-inter text-xs text-rose-700">{t(`deleteUser.zoneHint.${role}`)}</p>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 font-inter text-sm font-semibold text-white hover:bg-rose-700"
      >
        <Trash2 size={15} /> {t('deleteUser.button')}
      </button>

      <Modal
        open={open}
        onClose={() => { if (!busy) setOpen(false); }}
        title={t('deleteUser.title')}
        size="md"
        closeLabel={t('common.close')}
        footer={(
          <>
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={busy}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-inter text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              onClick={confirm}
              disabled={!matches || busy}
              className="rounded-xl bg-rose-600 px-4 py-2 font-inter text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? t('common.busy') : t('deleteUser.confirm')}
            </button>
          </>
        )}
      >
        <div className="space-y-3">
          <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 font-semibold text-rose-800">
            {t('deleteUser.irreversible')}
          </p>
          <p>{t(`deleteUser.explain.${role}`)}</p>

          {summary === null && !error && <p className="text-slate-500">{t('common.loadingData')}</p>}
          {summary && (lost.length === 0 ? (
            <p className="text-slate-500">{t('deleteUser.nothingRecorded')}</p>
          ) : (
            <>
              <p className="font-semibold text-slate-800">{t('deleteUser.lostTitle')}</p>
              <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                {lost.map((key) => (
                  <li key={key} className="flex justify-between gap-3 rounded-md bg-slate-50 px-2 py-1 text-xs">
                    <span>{t(`deleteUser.summary.${key}`)}</span>
                    <span className="font-semibold" dir="ltr">{summary[key]}</span>
                  </li>
                ))}
              </ul>
            </>
          ))}

          <label className="block">
            <span className="mb-1 block text-xs text-slate-600">
              {t('deleteUser.typeEmail')} <strong dir="ltr" className="font-mono-jetbrains">{user.email}</strong>
            </span>
            <input
              type="email"
              dir="ltr"
              autoComplete="off"
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              disabled={busy}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 font-inter text-sm focus:border-rose-500 focus:outline-none"
            />
          </label>

          {error && <p className="text-xs text-rose-600">{error}</p>}
        </div>
      </Modal>
    </section>
  );
}
