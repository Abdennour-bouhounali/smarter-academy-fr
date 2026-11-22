import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Settings } from 'lucide-react';
import { ChevronBack } from '../../components/common/DirectionalIcons';
import { AuthContext } from '../../context/AuthContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { fetchChildProgress, fetchChildReport, unlinkChild, updateChild } from '../../services/familyService';
import WeekReport from '../../features/family/WeekReport';
import WeekNav from '../../features/family/WeekNav';
import ProgressDetail from '../../features/family/ProgressDetail';
import ReportTabs, { tabFrom } from '../../features/family/ReportTabs';
import { gradeName } from '../../features/family/gradeName';

/**
 * Un enfant, côté parent (PARENT_SPACE.md §4–§4bis) : deux onglets — la
 * semaine (WeekReport, 8 semaines en arrière) et « La progression en détail »
 * (ProgressDetail, l'année leçon par leçon) — puis le courriel du dimanche et
 * la rupture du lien. Les mêmes composants que l'élève lit. Pensé d'abord pour
 * le téléphone (le parent arrive souvent du courriel). Un lien inactif →
 * 404 serveur → retour à « Mes enfants ».
 */
export default function ParentChildReport() {
  const { t } = useTranslation('family');
  useDocumentMeta(t('meta.childReport'));
  const { studentId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = tabFrom(searchParams);
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [weeksBack, setWeeksBack] = useState(0);
  const [child, setChild] = useState(null);
  const [week, setWeek] = useState(null);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    let alive = true;
    const request = tab === 'progress' ? fetchChildProgress(token, studentId) : fetchChildReport(token, studentId, weeksBack);
    request
      .then((d) => {
        if (!alive) return;
        setChild(d.child);
        if (tab === 'progress') setProgress(d.progress);
        else setWeek(d.report);
      })
      .catch((e) => {
        if (!alive) return;
        if (e.status === 404) navigate('/parent', { replace: true });
        else setError(e.message);
      });
    return () => { alive = false; };
  }, [token, studentId, weeksBack, tab, navigate]);

  const name = child ? [child.firstName, child.lastName].filter(Boolean).join(' ') : '';
  const setTab = (next) => setSearchParams(next === 'week' ? {} : { tab: next }, { replace: true });

  const toggleEmail = async () => {
    const updated = await updateChild(token, studentId, !child.weeklyEmail).catch((e) => setError(e.message));
    if (updated) setChild(updated.child);
  };

  const unlink = async () => {
    await unlinkChild(token, studentId).then(() => navigate('/parent', { replace: true })).catch((e) => setError(e.message));
  };

  const loading = <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />;

  return (
    <div className="space-y-5">
      <Link to="/parent" className="inline-flex min-h-[44px] items-center gap-1 font-inter text-sm text-slate-600 hover:text-nav-accent">
        <ChevronBack size={16} aria-hidden="true" />
        {t('report.back')}
      </Link>

      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}

      <header className="space-y-4">
        <div>
          <h1 className="font-space text-xl font-bold text-slate-900 sm:text-2xl">{name || '…'}</h1>
          {child?.grade && <p className="font-inter text-sm text-slate-500">{gradeName(child.grade)}</p>}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <ReportTabs tab={tab} onChange={setTab} />
          {tab === 'week' && <WeekNav weeksBack={weeksBack} onChange={setWeeksBack} report={week} />}
        </div>
      </header>

      {tab === 'week' && (week ? <WeekReport report={week} audience="parent" /> : loading)}
      {tab === 'progress' && (progress ? <ProgressDetail progress={progress} audience="parent" /> : loading)}

      {child && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <h2 className="mb-3 flex items-center gap-2 font-space text-base font-bold text-slate-900">
            <Settings size={18} className="text-slate-500" aria-hidden="true" />
            {t('settings.title')}
          </h2>
          <label className="flex min-h-[44px] cursor-pointer items-center gap-3 font-inter text-sm text-slate-700">
            <input type="checkbox" checked={child.weeklyEmail} onChange={toggleEmail} className="h-5 w-5 flex-shrink-0 rounded accent-indigo-600" />
            {t('settings.weeklyEmail')}
          </label>
          <div className="mt-4 border-t border-slate-100 pt-4">
            {!confirming ? (
              <button type="button" onClick={() => setConfirming(true)} className="min-h-[44px] font-inter text-sm font-semibold text-red-600 hover:underline">
                {t('settings.unlink')}
              </button>
            ) : (
              <div className="rounded-xl bg-red-50 p-4" role="alertdialog" aria-label={t('settings.unlink')}>
                <p className="font-inter text-sm text-red-800">{t('settings.unlinkConfirm', { name })}</p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <button type="button" onClick={unlink} className="min-h-[44px] rounded-lg bg-red-600 px-4 font-inter text-sm font-semibold text-white hover:bg-red-700">
                    {t('settings.unlinkYes')}
                  </button>
                  <button type="button" onClick={() => setConfirming(false)} className="min-h-[44px] rounded-lg px-4 font-inter text-sm text-slate-700 hover:bg-white">
                    {t('settings.cancel')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
