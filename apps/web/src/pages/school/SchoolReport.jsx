import { useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Download, Presentation, Printer } from 'lucide-react';
import { ArrowBack } from '../../components/common/DirectionalIcons';
import { AuthContext } from '../../context/AuthContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { stateLabel } from '../../lessons/common/components/masteryLabels';
import { fetchReport } from '../../services/schoolService';
import ReportView from '../../features/school/reports/ReportView';
import { reportRows, toCsv } from '../../features/school/reports/reportCsv';
import { btnPrimary, btnSecondary, errorText } from '../../features/school/ui';
import '../../features/school/reports/reportPrint.css';
import { LOCALE } from '../../locale.js';

const dateFmt = (iso) => new Date(iso).toLocaleDateString(LOCALE, { dateStyle: 'long', numberingSystem: 'latn' });

/**
 * Un rapport FIGÉ (SCHOOL_ADMIN_SPACE.md §7, phase 5) : l'en-tête (établissement,
 * rapport, trimestre, date), le corps (ReportView), et trois sorties —
 * l'impression A4 (`[data-school-print]`, reportPrint.css), le CSV (construit ici
 * depuis la même charge utile) et « Mode réunion » (projection).
 */
export default function SchoolReport() {
  const { t } = useTranslation('idara');
  const { t: tStudent } = useTranslation('student');
  useDocumentMeta(t('meta.report'));
  const { reportId } = useParams();
  const { token } = useContext(AuthContext);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    fetchReport(token, reportId)
      .then((d) => alive && setReport(d.report))
      .catch((e) => alive && setError(errorText(t, e)));
    return () => { alive = false; };
  }, [token, reportId, t]);

  const exportCsv = () => {
    const rows = reportRows(report, (k) => t(`reports.col.${k}`), (s) => stateLabel(s, tStudent));
    const url = URL.createObjectURL(new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${t(`reports.types.${report.type}`)} - ${report.title} - ${report.generatedAt.slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <Link to="/etablissement/rapports" className={btnSecondary}><ArrowBack size={16} aria-hidden="true" />{t('reports.back')}</Link>
        {report && (
          <>
            <span className="flex-1" />
            <button type="button" className={btnSecondary} onClick={exportCsv} data-report-csv><Download size={16} aria-hidden="true" />{t('reports.csv')}</button>
            <Link to={`/etablissement/reunion/${report.id}`} className={btnSecondary}><Presentation size={16} aria-hidden="true" />{t('reports.meeting')}</Link>
            <button type="button" className={btnPrimary} onClick={() => window.print()} data-report-print><Printer size={16} aria-hidden="true" />{t('reports.print')}</button>
          </>
        )}
      </div>

      {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 font-inter text-sm text-rose-700">{error}</p>}

      {report && (
        <article className="space-y-6 rounded-2xl border border-slate-200 bg-white p-8 print:border-0 print:p-0" data-school-print>
          <header className="border-b-2 border-nav-accent pb-3">
            <p className="font-inter text-sm text-slate-500">{[report.school.name, report.school.wilaya, report.school.commune].filter(Boolean).join(' · ')}</p>
            <h1 className="font-space text-2xl font-bold text-slate-900">{t(`reports.types.${report.type}`)} — {report.title}</h1>
            <p className="mt-1 font-inter text-sm text-slate-600">
              {report.term ? `${t('reports.termLabel', { term: report.term.term, year: report.term.academicYear })} · ` : ''}
              {t('reports.frozenAt', { date: dateFmt(report.generatedAt) })}
            </p>
          </header>
          <ReportView report={report} />
        </article>
      )}
    </div>
  );
}
