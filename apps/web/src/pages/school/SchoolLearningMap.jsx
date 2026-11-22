import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { getAllGradesSummary } from '../../utils/gradeSummary';
import { stateLabel } from '../../lessons/common/components/masteryLabels';
import MathLabel from '../../lessons/common/components/MathLabel';
import { fetchLearningMap } from '../../services/schoolService';
import { card, errorText, field } from '../../features/school/ui';
import Distribution, { STATES } from '../../features/school/Distribution';

/**
 * « الكفاءات » (SCHOOL_ADMIN_SPACE.md §7, phase 4) : chaque كفاءة d'un niveau,
 * classe par classe, en EFFECTIFS (متحكَّم فيها · تعزيز · ثغرة · لم تُقيَّم).
 * Pas de moyenne : une classe « à 70 % » cacherait cinq élèves en ثغرة.
 */
export default function SchoolLearningMap() {
  const { t } = useTranslation('idara');
  const { t: tStudent } = useTranslation('student');
  useDocumentMeta(t('meta.learning'));
  const { token } = useContext(AuthContext);
  const [grade, setGrade] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    fetchLearningMap(token, grade)
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(errorText(t, e)));
    return () => { alive = false; };
  }, [token, grade, t]);

  const gradeName = (id) => getAllGradesSummary().find((g) => g.id === id)?.name ?? id;
  const map = data?.map;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-space text-2xl font-bold text-slate-900">{t('map.title')}</h1>
          <p className="mt-1 max-w-3xl font-inter text-sm text-slate-600">{t('map.subtitle')}</p>
        </div>
        {data?.grades?.length > 1 && (
          <select aria-label={t('map.grade')} className={`${field} max-w-xs`} value={map?.grade ?? ''} onChange={(e) => setGrade(e.target.value)}>
            {data.grades.map((g) => <option key={g} value={g}>{gradeName(g)}</option>)}
          </select>
        )}
      </header>

      {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 font-inter text-sm text-rose-700">{error}</p>}

      <ul className="flex flex-wrap gap-4 font-inter text-xs text-slate-600" aria-label={t('map.legend')}>
        {STATES.map(([k, color]) => (
          <li key={k} className="flex items-center gap-1.5"><span className={`h-3 w-3 rounded ${color}`} />{stateLabel(k, tStudent)}</li>
        ))}
      </ul>

      {data && !map && <p className={`${card} text-center font-inter text-sm text-slate-500`}>{t('map.noClasses')}</p>}
      {map && map.lessons.length === 0 && <p className={`${card} text-center font-inter text-sm text-slate-500`}>{t('map.empty')}</p>}

      {map && map.lessons.length > 0 && (
        <div className={`${card} overflow-x-auto p-0`}>
          <table className="w-full min-w-[720px] font-inter text-sm" data-school-learning-map>
            <thead className="sticky top-0 bg-slate-50 text-slate-500">
              <tr>
                <th className="p-3 text-start">{t('map.learningPoint')}</th>
                {map.classes.map((c) => (
                  <th key={c.id} className="w-40 p-3 text-start">
                    <span className="block font-semibold text-slate-800">{c.name}</span>
                    <span className="text-xs font-normal">{t('map.students', { count: c.students })}</span>
                  </th>
                ))}
                <th className="w-40 p-3 text-start">{t('map.total')}</th>
              </tr>
            </thead>
            {map.lessons.map((lesson) => (
              <tbody key={lesson.code}>
                <tr className="border-t border-slate-200 bg-indigo-50/50">
                  <th colSpan={map.classes.length + 2} className="p-2 text-start font-space font-bold text-indigo-900"><MathLabel>{lesson.title}</MathLabel></th>
                </tr>
                {lesson.learningPoints.map((lp) => (
                  <tr key={lp.code} className="border-t border-slate-100" data-map-point={lp.code}>
                    <td className="p-3 text-slate-800">
                      <MathLabel>{lp.title}</MathLabel>
                      {lp.difficultyScope && lp.difficultyScope !== 'none' && (
                        <span className={`ms-2 rounded-lg px-2 py-0.5 text-xs font-medium ${lp.difficultyScope === 'class_wide' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-800'}`}>
                          {t(`map.scope.${lp.difficultyScope}`)}
                        </span>
                      )}
                    </td>
                    {map.classes.map((c) => <td key={c.id} className="p-3 align-top"><Distribution counts={lp.byClass[String(c.id)]} /></td>)}
                    <td className="p-3 align-top"><Distribution counts={lp.total} /></td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
      )}
    </div>
  );
}
