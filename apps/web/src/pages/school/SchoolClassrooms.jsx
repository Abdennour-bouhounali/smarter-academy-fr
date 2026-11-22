import { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import Modal from '../../components/admin/ui/Modal';
import { AuthContext } from '../../context/AuthContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { getAllGradesSummary } from '../../utils/gradeSummary';
import { createSchoolClassroom, fetchSchoolClassrooms, fetchSchoolTeachers, reassignClassroom } from '../../services/schoolService';
import { btnPrimary, btnSecondary, card, errorText, field, fieldLabel, personName } from '../../features/school/ui';

/**
 * « الأقسام » de l'établissement (SCHOOL_ADMIN_SPACE.md §6–§7). Deux comptes par
 * classe, jamais confondus : ses membres, et ceux que l'établissement lit.
 */
export default function SchoolClassrooms() {
  const { t } = useTranslation('idara');
  useDocumentMeta(t('meta.classes'));
  const { token } = useContext(AuthContext);
  const [classrooms, setClassrooms] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [draft, setDraft] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(() => Promise.all([fetchSchoolClassrooms(token), fetchSchoolTeachers(token)])
    .then(([c, tch]) => { setClassrooms(c.classrooms); setTeachers(tch.teachers); })
    .catch((e) => setError(errorText(t, e))), [token, t]);

  useEffect(() => { load(); }, [load]);

  const run = async (action) => {
    setBusy(true);
    setError(null);
    try {
      const data = await action();
      if (data?.classrooms) setClassrooms(data.classrooms);
      return true;
    } catch (e) {
      setError(errorText(t, e));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const create = async (event) => {
    event.preventDefault();
    if (await run(() => createSchoolClassroom(token, { ...draft, teacherId: Number(draft.teacherId) }))) setDraft(null);
  };

  const grades = getAllGradesSummary();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-space text-2xl font-bold text-slate-900">{t('classes.title')}</h1>
          <p className="mt-1 max-w-3xl font-inter text-sm text-slate-600">{t('classes.subtitle')}</p>
        </div>
        <button type="button" className={btnPrimary} disabled={teachers.length === 0}
          onClick={() => { setDraft({ name: '', grade: grades[grades.length - 1]?.id ?? '4am', teacherId: '' }); setError(null); }}>
          <Plus size={16} aria-hidden="true" />{t('classes.new')}
        </button>
      </header>

      {error && !draft && <p role="alert" className="rounded-xl bg-rose-50 p-3 font-inter text-sm text-rose-700">{error}</p>}
      {classrooms && teachers.length === 0 && <p className="rounded-xl bg-amber-50 p-3 font-inter text-sm text-amber-900">{t('classes.noTeachers')}</p>}

      {classrooms && (classrooms.length === 0 ? (
        <p className={`${card} text-center font-inter text-sm text-slate-500`}>{t('classes.empty')}</p>
      ) : (
        <div className={`${card} overflow-x-auto p-0`}>
          <table className="w-full font-inter text-sm" data-school-classrooms>
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-3 text-start">{t('classes.name')}</th>
                <th className="p-3 text-start">{t('classes.grade')}</th>
                <th className="p-3 text-start">{t('classes.teacher')}</th>
                <th className="p-3 text-start">{t('classes.members')}</th>
                <th className="p-3 text-start" title={t('classes.readableHint')}>{t('classes.readable')}</th>
                <th className="p-3 text-start">{t('classes.reassign')}</th>
              </tr>
            </thead>
            <tbody>
              {classrooms.map((c) => (
                <tr key={c.id} className="border-t border-slate-100">
                  <td className="p-3 font-semibold text-slate-900">{c.name}</td>
                  <td className="p-3">{grades.find((g) => g.id === c.grade)?.name ?? c.grade}</td>
                  <td className="p-3">{personName(c.teacher, t('common.unnamed'))}</td>
                  <td className="p-3" dir="ltr">{c.membersCount}</td>
                  <td className="p-3" dir="ltr">{c.readableCount}</td>
                  <td className="p-3">
                    <select aria-label={t('classes.reassign')} className={field} value={c.teacher?.id ?? ''} disabled={busy}
                      onChange={(e) => run(() => reassignClassroom(token, c.id, Number(e.target.value)))}>
                      {teachers.map((tch) => <option key={tch.id} value={tch.id}>{personName(tch, t('common.unnamed'))}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-slate-100 p-3 font-inter text-xs text-slate-500">{t('classes.readableHint')}</p>
        </div>
      ))}

      <Modal
        open={!!draft}
        onClose={() => setDraft(null)}
        title={t('classes.new')}
        closeLabel={t('common.cancel')}
        footer={(
          <>
            <button type="button" className={btnSecondary} onClick={() => setDraft(null)}>{t('common.cancel')}</button>
            <button type="submit" form="school-classroom-form" className={btnPrimary} disabled={busy}>{t('classes.create')}</button>
          </>
        )}
      >
        {draft && (
          <form id="school-classroom-form" onSubmit={create} className="grid gap-4 md:grid-cols-2">
            {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 font-inter text-sm text-rose-700 md:col-span-2">{error}</p>}
            <div>
              <label htmlFor="sc-name" className={fieldLabel}>{t('classes.name')}</label>
              <input id="sc-name" required className={field} placeholder={t('classes.namePlaceholder')} value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
            </div>
            <div>
              <label htmlFor="sc-grade" className={fieldLabel}>{t('classes.grade')}</label>
              <select id="sc-grade" className={field} value={draft.grade} onChange={(e) => setDraft((d) => ({ ...d, grade: e.target.value }))}>
                {grades.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="sc-teacher" className={fieldLabel}>{t('classes.teacher')}</label>
              <select id="sc-teacher" required className={field} value={draft.teacherId} onChange={(e) => setDraft((d) => ({ ...d, teacherId: e.target.value }))}>
                <option value="" disabled>{t('classes.chooseTeacher')}</option>
                {teachers.map((tch) => <option key={tch.id} value={tch.id}>{personName(tch, t('common.unnamed'))}</option>)}
              </select>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
