import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { KeyRound, Printer, Upload } from 'lucide-react';
import Modal from '../../components/admin/ui/Modal';
import { AuthContext } from '../../context/AuthContext';
import { useManagedAccounts } from '../../hooks/useManagedAccounts';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { fetchSchoolClassrooms, fetchSchoolStudents, reissueCards, transferStudent } from '../../services/schoolService';
import RosterImportDialog from '../../features/school/RosterImportDialog';
import SchoolCredentialCards from '../../features/school/SchoolCredentialCards';
import { btnPrimary, btnSecondary, card, errorText, field, personName } from '../../features/school/ui';

/**
 * The table of the students the school reads. `selectable` puts a box before each account the school created, to
 * print its login card — false while the accounts created by a school are closed.
 */
export function StudentsTable({ t, students, classrooms, selectable, selected, onToggle, busy, onTransfer }) {
  return (
    <div className={`${card} overflow-x-auto p-0`}>
      <table className="w-full font-inter text-sm" data-school-students>
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            <th className="w-10 p-3" aria-label={t('students.selectAll')} />
            <th className="p-3 text-start">{t('students.name')}</th>
            <th className="p-3 text-start">{t('students.class')}</th>
            <th className="p-3 text-start">{t('students.login')}</th>
            <th className="p-3 text-start">{t('students.transfer')}</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id} className="border-t border-slate-100">
              <td className="p-3">
                {selectable && s.login && <input type="checkbox" className="h-4 w-4" aria-label={personName(s, '')} checked={selected.has(s.id)} onChange={() => onToggle(s.id)} />}
              </td>
              <td className="p-3 font-semibold text-slate-900">
                <Link to={`/etablissement/eleves/${s.id}`} className="text-nav-accent hover:underline">{personName(s, t('common.unnamed'))}</Link>
                {s.enrolledBySchool && <span className="ms-2 rounded-lg bg-nav-accent-soft px-2 py-0.5 text-xs font-medium text-nav-accent">{t('students.enrolled')}</span>}
              </td>
              <td className="p-3">{s.classroom.name}</td>
              <td className="p-3 font-mono text-xs" dir="ltr">{s.login ?? t('common.dash')}</td>
              <td className="p-3">
                <select aria-label={t('students.transfer')} className={field} value={s.classroom.id} disabled={busy} onChange={(e) => onTransfer(s, e.target.value)}>
                  {classrooms.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * « Élèves » (SCHOOL_ADMIN_SPACE.md §7) : ceux que l'établissement lit, par
 * classe ; l'import d'une liste ; le changement de classe ; les cartes de
 * connexion des comptes CRÉÉS par l'établissement (l’identifiant).
 *
 * L'import et les cartes créent des comptes ou des mots de passe : tant que l'administrateur garde fermés les comptes
 * créés par un établissement (useManagedAccounts), leurs boutons, la sélection et leurs fenêtres sont absents, et une
 * phrase dit que chaque élève crée son compte et rejoint sa classe avec le code ou le lien de son professeur.
 */
export default function SchoolStudents() {
  const { t } = useTranslation('idara');
  useDocumentMeta(t('meta.students'));
  const { token } = useContext(AuthContext);
  const managed = useManagedAccounts();
  const [classrooms, setClassrooms] = useState([]);
  const [students, setStudents] = useState(null);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [importing, setImporting] = useState(false);
  const [cards, setCards] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(() => Promise.all([fetchSchoolClassrooms(token), fetchSchoolStudents(token)])
    .then(([c, s]) => { setClassrooms(c.classrooms); setStudents(s.students); })
    .catch((e) => setError(errorText(t, e))), [token, t]);
  useEffect(() => { load(); }, [load]);

  const shown = useMemo(() => (students ?? []).filter((s) => !filter || String(s.classroom.id) === filter), [students, filter]);
  const printable = managed.open ? shown.filter((s) => s.login) : [];
  const toggle = (id) => setSelected((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

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

  const transfer = (student, classroomId) => run(async () => {
    const data = await transferStudent(token, student.id, Number(classroomId));
    setStudents(data.students);
  });

  const issue = () => run(async () => {
    const data = await reissueCards(token, [...selected]);
    setCards(data.cards);
    setSelected(new Set());
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-space text-2xl font-bold text-slate-900">{t('students.title')}</h1>
          <p className="mt-1 font-inter text-sm text-slate-600">{t('students.subtitle')}</p>
        </div>
        {managed.open && (
          <div className="flex flex-wrap gap-2">
            <button type="button" className={btnSecondary} disabled={selected.size === 0 || busy} onClick={issue} title={t('students.cardsHint')} data-cards-open>
              <KeyRound size={16} aria-hidden="true" />{t('students.cards', { count: selected.size })}
            </button>
            <button type="button" className={btnPrimary} disabled={classrooms.length === 0} onClick={() => setImporting(true)} data-roster-open>
              <Upload size={16} aria-hidden="true" />{t('students.import')}
            </button>
          </div>
        )}
        {managed.loaded && !managed.open && (
          <p className="max-w-md rounded-xl bg-slate-50 p-3 font-inter text-sm text-slate-700" data-managed-closed>{t('students.closed')}</p>
        )}
      </header>

      {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 font-inter text-sm text-rose-700">{error}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <select aria-label={t('students.class')} className={`${field} max-w-xs`} value={filter} onChange={(e) => { setFilter(e.target.value); setSelected(new Set()); }}>
          <option value="">{t('students.allClasses')}</option>
          {classrooms.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {printable.length > 0 && (
          <label className="flex items-center gap-2 font-inter text-sm text-slate-700">
            <input type="checkbox" className="h-4 w-4" checked={printable.every((s) => selected.has(s.id))}
              onChange={(e) => setSelected(e.target.checked ? new Set(printable.map((s) => s.id)) : new Set())} />
            {t('students.selectAll')}
          </label>
        )}
      </div>

      {students && (shown.length === 0 ? (
        <p className={`${card} text-center font-inter text-sm text-slate-500`}>{t('students.empty')}</p>
      ) : (
        <StudentsTable
          t={t}
          students={shown}
          classrooms={classrooms}
          selectable={managed.open}
          selected={selected}
          onToggle={toggle}
          busy={busy}
          onTransfer={transfer}
        />
      ))}

      {managed.open && (
        <RosterImportDialog
          open={importing}
          onClose={() => setImporting(false)}
          classrooms={classrooms}
          initialClassroomId={filter}
          onImported={load}
        />
      )}

      <Modal
        open={managed.open && !!cards}
        onClose={() => setCards(null)}
        size="xl"
        title={t('cards.title')}
        closeLabel={t('common.close')}
        footer={(
          <>
            <button type="button" className={btnSecondary} onClick={() => setCards(null)}>{t('common.close')}</button>
            <button type="button" className={btnPrimary} onClick={() => window.print()}><Printer size={16} aria-hidden="true" />{t('common.print')}</button>
          </>
        )}
      >
        {managed.open && cards && (
          <div className="space-y-4">
            <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 font-inter text-sm text-amber-900">{t('cards.warning')}</p>
            <SchoolCredentialCards cards={cards} />
          </div>
        )}
      </Modal>
    </div>
  );
}
