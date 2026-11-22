import { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Link2, RefreshCw } from 'lucide-react';
import { ConfirmDialog } from '../../components/admin/ui/Modal';
import { AuthContext } from '../../context/AuthContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { detachTeacher, fetchSchoolTeachers, rotateTeacherLink } from '../../services/schoolService';
import TeacherFacts from '../../features/school/TeacherFacts';
import { btnDanger, btnSecondary, card, errorText, personName } from '../../features/school/ui';

/**
 * « الأساتذة » (SCHOOL_ADMIN_SPACE.md §7, décision D4) : le lien d'adhésion des
 * enseignants, et chaque enseignant avec ses FAITS — ceux qu'il lit lui-même
 * dans « مؤسستي ».
 */
export default function SchoolTeachers() {
  const { t } = useTranslation('idara');
  useDocumentMeta(t('meta.teachers'));
  const { token } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [detaching, setDetaching] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(() => fetchSchoolTeachers(token).then(setData).catch((e) => setError(errorText(t, e))), [token, t]);
  useEffect(() => { load(); }, [load]);

  // Le serveur ne rend que le jeton ; l'adresse se compose sur l'origine du client.
  const link = data ? `${window.location.origin}/enseignant/muassasa/rejoindre/${data.joinLinkToken}` : '';

  const run = async (action) => {
    setBusy(true);
    setError(null);
    try {
      await action();
      await load();
      return true;
    } catch (e) {
      setError(errorText(t, e));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-space text-2xl font-bold text-slate-900">{t('teachers.title')}</h1>
        <p className="mt-1 max-w-3xl font-inter text-sm text-slate-600">{t('teachers.subtitle')}</p>
      </header>

      {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 font-inter text-sm text-rose-700">{error}</p>}

      {data && (
        <section className={card} data-school-teacher-link>
          <h2 className="flex items-center gap-2 font-space font-bold text-slate-900"><Link2 size={18} className="text-nav-accent" aria-hidden="true" />{t('teachers.linkTitle')}</h2>
          <p className="mt-1 font-inter text-sm text-slate-600">{t('teachers.linkHint')}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <code dir="ltr" className="min-w-0 flex-1 truncate rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-mono text-xs text-slate-800">{link}</code>
            <button type="button" className={btnSecondary} onClick={copy}><Copy size={16} aria-hidden="true" />{copied ? t('common.copied') : t('common.copy')}</button>
            <button type="button" className={btnSecondary} disabled={busy} title={t('teachers.rotateHint')}
              onClick={() => { setCopied(false); run(() => rotateTeacherLink(token)); }}>
              <RefreshCw size={16} aria-hidden="true" />{t('teachers.rotate')}
            </button>
          </div>
        </section>
      )}

      {data && (data.teachers.length === 0 ? (
        <p className={`${card} text-center font-inter text-sm text-slate-500`}>{t('teachers.empty')}</p>
      ) : (
        <ul className="space-y-3">
          {data.teachers.map((tch) => (
            <li key={tch.id} className={card} data-school-teacher={tch.id}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-space font-bold text-slate-900">{personName(tch, t('common.unnamed'))}</p>
                  <p className="font-inter text-xs text-slate-500">
                    {t('teachers.joinedAt')}: {tch.joinedAt ? new Date(tch.joinedAt).toLocaleDateString('ar-DZ', { dateStyle: 'medium', numberingSystem: 'latn' }) : t('common.dash')}
                  </p>
                </div>
                <button type="button" className={btnDanger} onClick={() => setDetaching(tch)}>{t('teachers.detach')}</button>
              </div>
              <TeacherFacts facts={tch.facts} />
            </li>
          ))}
        </ul>
      ))}

      <ConfirmDialog
        open={!!detaching}
        onClose={() => setDetaching(null)}
        onConfirm={async () => { if (await run(() => detachTeacher(token, detaching.id))) setDetaching(null); }}
        title={detaching ? t('teachers.detachTitle', { name: personName(detaching, t('common.unnamed')) }) : ''}
        message={t('teachers.detachMessage')}
        confirmLabel={t('teachers.detach')}
        cancelLabel={t('common.cancel')}
        closeLabel={t('common.close')}
        tone="danger"
        busy={busy}
      />
    </div>
  );
}
