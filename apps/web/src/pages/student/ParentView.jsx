import { useContext, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronBack } from '../../components/common/DirectionalIcons';
import { AuthContext } from '../../context/AuthContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { fetchMyProgress, fetchMyReport } from '../../services/familyService';
import WeekReport from '../../features/family/WeekReport';
import WeekNav from '../../features/family/WeekNav';
import ProgressDetail from '../../features/family/ProgressDetail';
import ReportTabs, { tabFrom } from '../../features/family/ReportTabs';

/**
 * « Ce que voit ton parent » (/espace/profil/wali) — l'élève lit EXACTEMENT ce que lit
 * son parent : la semaine et « La progression en détail » (mêmes services serveur, mêmes
 * composants). La transparence n'est pas une phrase : c'est cette page
 * (PARENT_SPACE.md §4).
 */
export default function ParentView() {
  const { t } = useTranslation('family');
  useDocumentMeta(t('meta.studentView'));
  const { token } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = tabFrom(searchParams);
  const [weeksBack, setWeeksBack] = useState(0);
  const [week, setWeek] = useState(null);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    const request = tab === 'progress'
      ? fetchMyProgress(token).then((d) => alive && setProgress(d.progress))
      : fetchMyReport(token, weeksBack).then((d) => alive && setWeek(d.report));
    request.catch((e) => alive && setError(e.message));
    return () => { alive = false; };
  }, [token, weeksBack, tab]);

  const loading = <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />;

  return (
    <div className="sa-page space-y-6 py-8 sm:py-10">
      <Link to="/espace/profil" className="inline-flex items-center gap-1 font-inter text-sm text-slate-600 hover:text-nav-accent">
        <ChevronBack size={16} aria-hidden="true" />
        {t('student.title')}
      </Link>
      <header className="space-y-4">
        <div>
          <h1 className="font-space text-2xl font-bold text-slate-900">{t('student.viewTitle')}</h1>
          <p className="font-inter text-sm text-slate-600">{t('student.viewIntro')}</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ReportTabs tab={tab} onChange={(next) => setSearchParams(next === 'week' ? {} : { tab: next }, { replace: true })} />
          {tab === 'week' && <WeekNav weeksBack={weeksBack} onChange={setWeeksBack} report={week} />}
        </div>
      </header>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {tab === 'week' && (week ? <WeekReport report={week} audience="student" /> : loading)}
      {tab === 'progress' && (progress ? <ProgressDetail progress={progress} audience="student" /> : loading)}
    </div>
  );
}
