import { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, Eye } from 'lucide-react';
import { ConfirmDialog } from '../../components/admin/ui/Modal';
import { AuthContext } from '../../context/AuthContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { fetchClassGroups } from '../../services/teacher/classGroupService';
import { fetchMySchool, leaveSchool, setClassroomAttached } from '../../services/schoolService';
import TeacherFacts from '../../features/school/TeacherFacts';
import { btnDanger, btnSecondary, card, errorText } from '../../features/school/ui';

/**
 * « مؤسستي » — l'établissement vu par l'ENSEIGNANT (SCHOOL_ADMIN_SPACE.md §7,
 * décision D4) : ce que la direction voit de lui (le même composant que chez
 * le directeur), ses classes rattachées ou non, et la porte de sortie.
 */
export default function TeacherSchoolPage() {
  const { t } = useTranslation('idara');
  useDocumentMeta(t('meta.teacherSchool'));
  const { token } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [classes, setClasses] = useState([]);
  const [leaving, setLeaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(() => Promise.all([fetchMySchool(token), fetchClassGroups(token)])
    .then(([school, groups]) => { setData(school); setClasses((groups.classrooms ?? []).filter((c) => c.status === 'active')); })
    .catch((e) => setError(errorText(t, e))), [token, t]);
  useEffect(() => { load(); }, [load]);

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

  if (!data) {
    return error ? <p role="alert" className="rounded-xl bg-rose-50 p-3 font-inter text-sm text-rose-700">{error}</p> : <div className="h-64" aria-busy="true" />;
  }

  return (
    <div className="sa-page space-y-6 py-6" data-teacher-school>
      <h1 className="flex items-center gap-2 font-space text-2xl font-bold text-slate-900">
        <Building2 size={24} className="text-nav-accent" aria-hidden="true" />{t('teacher.title')}
      </h1>

      {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 font-inter text-sm text-rose-700">{error}</p>}

      {!data.school ? (
        <section className={card}>
          <h2 className="font-space font-bold text-slate-900">{t('teacher.noneTitle')}</h2>
          <p className="mt-1 font-inter text-sm text-slate-600">{t('teacher.noneText')}</p>
        </section>
      ) : (
        <>
          <section className={card}>
            <p className="font-space text-xl font-bold text-slate-900">{data.school.name}</p>
            <p className="font-inter text-sm text-slate-500">{[data.school.wilaya, data.school.commune].filter(Boolean).join(' · ')}</p>
          </section>

          <section className={card}>
            <h2 className="flex items-center gap-2 font-space font-bold text-slate-900"><Eye size={18} className="text-nav-accent" aria-hidden="true" />{t('teacher.seenTitle')}</h2>
            <p className="mb-3 mt-1 font-inter text-sm text-slate-600">{t('teacher.seenText')}</p>
            <TeacherFacts facts={data.facts} />
          </section>

          <section className={card}>
            <h2 className="font-space font-bold text-slate-900">{t('teacher.classesTitle')}</h2>
            <p className="mb-3 mt-1 font-inter text-sm text-slate-600">{t('teacher.classesHint')}</p>
            <ul className="divide-y divide-slate-100">
              {classes.map((c) => {
                const attached = c.schoolId === data.school.id;
                return (
                  <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-3" data-teacher-school-class={c.id}>
                    <span className="font-inter font-semibold text-slate-900">
                      {c.name}
                      {attached && <span className="ms-2 rounded-lg bg-nav-accent-soft px-2 py-0.5 text-xs font-medium text-nav-accent">{t('teacher.attached')}</span>}
                    </span>
                    <button type="button" className={btnSecondary} disabled={busy}
                      onClick={() => run(() => setClassroomAttached(token, c.id, !attached))}>
                      {attached ? t('teacher.detach') : t('teacher.attach')}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <button type="button" className={btnDanger} onClick={() => setLeaving(true)}>{t('teacher.leave')}</button>
        </>
      )}

      <ConfirmDialog
        open={leaving}
        onClose={() => setLeaving(false)}
        onConfirm={async () => { if (await run(() => leaveSchool(token))) setLeaving(false); }}
        title={data.school ? t('teacher.leaveTitle', { school: data.school.name }) : ''}
        message={t('teacher.leaveMessage')}
        confirmLabel={t('teacher.leave')}
        cancelLabel={t('common.cancel')}
        closeLabel={t('common.close')}
        tone="danger"
        busy={busy}
      />
    </div>
  );
}
