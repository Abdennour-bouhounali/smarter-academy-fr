import { useCallback, useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FileText, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '../../components/admin/ui/Modal';
import { AuthContext } from '../../context/AuthContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { getAllGradesSummary } from '../../utils/gradeSummary';
import {
  deleteReport, fetchLearningMap, fetchReports, fetchSchoolClassrooms, fetchSchoolStudents, fetchTerms, generateReport,
} from '../../services/schoolService';
import { btnDanger, btnPrimary, btnSecondary, card, errorText, field, fieldLabel, personName } from '../../features/school/ui';
import { LOCALE } from '../../locale.js';

const TYPES = ['class', 'grade', 'student', 'school_term', 'teachers'];
// Le type → ce qu'il faut choisir pour le générer.
const SCOPE_OF = { class: 'class', grade: 'grade', student: 'student' };

/**
 * « Rapports » (SCHOOL_ADMIN_SPACE.md §7, phase 5) : le catalogue (type, portée,
 * trimestre → un rapport FIGÉ) et la liste des rapports enregistrés.
 */
export default function SchoolReports() {
  const { t } = useTranslation('idara');
  useDocumentMeta(t('meta.reports'));
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [reports, setReports] = useState(null);
  const [options, setOptions] = useState({ class: [], grade: [], student: [], terms: [] });
  const [type, setType] = useState('class');
  const [scope, setScope] = useState('');
  const [termId, setTermId] = useState('');
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(() => Promise.all([
    fetchReports(token), fetchSchoolClassrooms(token), fetchSchoolStudents(token), fetchLearningMap(token), fetchTerms(token),
  ]).then(([r, c, s, m, terms]) => {
    setReports(r.reports);
    const gradeName = (id) => getAllGradesSummary().find((g) => g.id === id)?.name ?? id;
    setOptions({
      class: c.classrooms.map((x) => ({ value: String(x.id), label: x.name })),
      grade: (m.grades ?? []).map((g) => ({ value: g, label: gradeName(g) })),
      student: s.students.map((x) => ({ value: String(x.id), label: `${personName(x, t('common.unnamed'))} — ${x.classroom.name}` })),
      terms: terms.terms ?? [],
      year: terms.academicYear,
    });
  }).catch((e) => setError(errorText(t, e))), [token, t]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setScope(''); }, [type]);

  const scopeKind = SCOPE_OF[type];
  const ready = !scopeKind || scope;

  const generate = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const d = await generateReport(token, { type, scope: scope || null, termId: termId ? Number(termId) : null });
      navigate(`/etablissement/rapports/${d.report.id}`);
    } catch (e) {
      setError(errorText(t, e));
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      const d = await deleteReport(token, deleting.id);
      setReports(d.reports);
      setDeleting(null);
    } catch (e) {
      setError(errorText(t, e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-space text-2xl font-bold text-slate-900">{t('reports.title')}</h1>
        <p className="mt-1 max-w-3xl font-inter text-sm text-slate-600">{t('reports.subtitle')}</p>
      </header>

      {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 font-inter text-sm text-rose-700">{error}</p>}

      <form onSubmit={generate} className={`${card} space-y-4`} data-report-form>
        <h2 className="font-space font-bold text-slate-900">{t('reports.newTitle')}</h2>
        <fieldset className="grid gap-2 md:grid-cols-5">
          <legend className="sr-only">{t('reports.type')}</legend>
          {TYPES.map((k) => (
            <label key={k} className={`cursor-pointer rounded-xl border p-3 font-inter text-sm ${type === k ? 'border-nav-accent bg-nav-accent-soft' : 'border-slate-200 hover:bg-slate-50'}`}>
              <input type="radio" name="report-type" value={k} checked={type === k} onChange={() => setType(k)} className="sr-only" />
              <span className="block font-semibold text-slate-900">{t(`reports.types.${k}`)}</span>
              <span className="text-xs text-slate-500">{t(`reports.typeHints.${k}`)}</span>
            </label>
          ))}
        </fieldset>
        <div className="grid gap-4 md:grid-cols-3">
          {scopeKind && (
            <div>
              <label htmlFor="report-scope" className={fieldLabel}>{t(`reports.scope.${scopeKind}`)}</label>
              <select id="report-scope" required className={field} value={scope} onChange={(e) => setScope(e.target.value)}>
                <option value="" disabled>{t('reports.choose')}</option>
                {options[scopeKind].map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          )}
          <div>
            <label htmlFor="report-term" className={fieldLabel}>{t('reports.term')}</label>
            <select id="report-term" className={field} value={termId} onChange={(e) => setTermId(e.target.value)}>
              <option value="">{t('reports.noTerm')}</option>
              {options.terms.map((term) => <option key={term.term} value={term.id ?? ''} disabled={!term.id}>{t('reports.termLabel', { term: term.term, year: options.year })}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button type="submit" className={btnPrimary} disabled={busy || !ready}>{busy ? t('reports.generating') : t('reports.generate')}</button>
          </div>
        </div>
      </form>

      <section className="space-y-3">
        <h2 className="font-space text-lg font-bold text-slate-900">{t('reports.saved')}</h2>
        {reports && reports.length === 0 && <p className={`${card} text-center font-inter text-sm text-slate-500`}>{t('reports.empty')}</p>}
        <ul className="space-y-2" data-report-list>
          {(reports ?? []).map((r) => (
            <li key={r.id} className={`${card} flex flex-wrap items-center gap-3 py-3`}>
              <FileText size={18} className="text-nav-accent" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="font-inter font-semibold text-slate-900">{t(`reports.types.${r.type}`)} — {r.title}</p>
                <p className="font-inter text-xs text-slate-500">
                  {r.term ? `${t('reports.termLabel', { term: r.term.term, year: r.term.academicYear })} · ` : ''}
                  {t('reports.generatedAt')} {new Date(r.generatedAt).toLocaleString(LOCALE, { dateStyle: 'medium', timeStyle: 'short', numberingSystem: 'latn' })}
                </p>
              </div>
              <Link to={`/etablissement/rapports/${r.id}`} className={btnSecondary}>{t('reports.open')}</Link>
              <button type="button" className={btnDanger} onClick={() => setDeleting(r)} aria-label={t('reports.delete')}><Trash2 size={16} aria-hidden="true" /></button>
            </li>
          ))}
        </ul>
      </section>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        title={t('reports.deleteTitle')}
        message={t('reports.deleteMessage')}
        confirmLabel={t('reports.delete')}
        cancelLabel={t('common.cancel')}
        closeLabel={t('common.close')}
        tone="danger"
        busy={busy}
      />
    </div>
  );
}
