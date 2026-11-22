import { useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mountain, Eye } from 'lucide-react';
import { AuthContext } from '../../../context/AuthContext';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';
import { fetchTeacherChallenges } from '../../../services/teacher/thinkingLabTeacherService';
import { TeacherPage, Loading, ErrorBox } from '../teacherUi';

const BANDS = ['primary', 'middle', 'secondary', 'university'];
const BAND_TONE = {
  primary: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  middle: 'bg-sky-50 text-sky-800 ring-sky-200',
  secondary: 'bg-violet-50 text-violet-800 ring-violet-200',
  university: 'bg-amber-50 text-amber-800 ring-amber-200',
};

/**
 * « مختبر التفكير » côté enseignant — la liste de tous les défis, avec leur tranche (cachée aux
 * élèves) et leur famille. Lecture seule : rien n'est écrit (THINKING_LAB.md §8bis).
 */
export default function TeacherThinkingListPage() {
  const { t } = useTranslation('thinking');
  useDocumentMeta(t('teacher.title'));
  const { token } = useContext(AuthContext);
  const [list, setList] = useState(null);
  const [error, setError] = useState(null);
  const [band, setBand] = useState('all');

  const load = () => {
    setError(null);
    fetchTeacherChallenges(token).then((d) => setList(d.challenges), (e) => setError(e.message));
  };
  useEffect(() => { if (token) load(); }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const shown = useMemo(() => (list ?? []).filter((c) => band === 'all' || c.band === band), [list, band]);

  return (
    <TeacherPage eyebrow={t('teacher.banner')} title={t('teacher.title')} subtitle={t('teacher.subtitle')}>
      {error && <ErrorBox message={error} onRetry={load} />}
      {!list && !error && <Loading />}
      {list && (
        <div className="space-y-4" data-teacher-thinking-list>
          <p className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 font-inter text-xs font-bold text-amber-800 ring-1 ring-amber-200">
            <Eye size={14} aria-hidden="true" /> {t('teacher.banner')}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {['all', ...BANDS].map((b) => (
              <button key={b} type="button" onClick={() => setBand(b)} aria-pressed={band === b}
                className={`rounded-full px-3 py-1.5 font-inter text-xs font-bold ring-1 transition ${band === b ? 'bg-nav-accent text-white ring-nav-accent' : 'bg-white text-slate-600 ring-slate-200 hover:ring-slate-300'}`}>
                {b === 'all' ? t('teacher.filterAll') : t(`teacher.band.${b}`)}
              </button>
            ))}
            <span className="font-inter text-xs text-slate-500">{t('teacher.count', { count: shown.length })}</span>
          </div>
          <p className="font-inter text-xs text-slate-500">{t('teacher.listHint')}</p>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[560px] text-start font-inter text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-4 py-2 text-start">{t('teacher.columns.number')}</th>
                  <th className="px-4 py-2 text-start">{t('teacher.columns.title')}</th>
                  <th className="px-4 py-2 text-start">{t('teacher.columns.band')}</th>
                  <th className="px-4 py-2 text-start">{t('teacher.columns.family')}</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((c) => (
                  <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50" data-teacher-challenge={c.number}>
                    <td className="px-4 py-2.5">
                      <Link to={`/enseignant/tafkir/${c.id}`} className="inline-flex items-center gap-1.5 font-space text-base font-black text-nav-accent hover:underline" dir="ltr">
                        {c.summit && <Mountain size={14} aria-label={t('summit')} />}{c.number}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-slate-800">
                      <Link to={`/enseignant/tafkir/${c.id}`} className="hover:underline">{c.title}</Link>
                      {c.examTag && <span className="ms-2 rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-bold text-sky-700 ring-1 ring-sky-200">{c.examTag === 'bac' ? 'BAC' : 'BEM'}</span>}
                    </td>
                    <td className="px-4 py-2.5"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${BAND_TONE[c.band]}`}>{t(`teacher.band.${c.band}`)}</span></td>
                    <td className="px-4 py-2.5 text-slate-600">{t(`teacher.family.${c.family}`)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </TeacherPage>
  );
}
