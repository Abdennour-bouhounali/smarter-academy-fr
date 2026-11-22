import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getLessonById } from '@smarter-academy/core';
import MathLabel from '../../lessons/common/components/MathLabel';
import { setReturnTo } from '../../lessons/common/components/returnToLesson';

/**
 * « راجع قبل أن تنطلق » sur la PREMIÈRE vue de la leçon (propriétaire, 2026-11-07) : les leçons à comprendre ou réviser
 * avant celle-ci (`prerequisiteLessonCodes` du catalogue, souvent d'une année antérieure). Un clic ouvre la leçon et retient
 * le retour (returnToLesson.js) : pendant la révision, un bouton ramène ici en un clic. Une leçon pas encore publiée se voit
 * (« قيد الإعداد ») mais ne s'ouvre pas. Prérequis pédagogique, jamais un verrou.
 */
/**
 * `priority` (revue de « أستعدّ ») : la leçon de la كفاءة la plus fragile — sa carte seule en grand, les autres en petit dessous
 * (« وأيضًا »), jamais retirées.
 */
export default function ReviseFirst({ lessonId, title, basePath, className = '', columns = 2, priority = null, variant = 'card' }) {
  const { t } = useTranslation('lesson');
  const navigate = useNavigate();
  const lesson = getLessonById(lessonId);
  const prereqs = (lesson?.prerequisiteLessonCodes ?? []).map((code) => getLessonById(code)).filter(Boolean);
  if (!prereqs.length) return null;
  const first = priority ? prereqs.find((p) => p.id === priority) : null;
  const others = first ? prereqs.filter((p) => p !== first) : [];
  const shownBig = first ? [first] : prereqs;
  const open = (p) => {
    setReturnTo(typeof window !== 'undefined' ? window.sessionStorage : null, { path: basePath, title });
    navigate(p.path);
  };
  // `variant="slim"` (première vue de la mission, propriétaire 2026-11-09) : UNE ligne — « قبل أن تبدأ: » puis chaque leçon en pastille
  if (variant === 'slim') {
    return (
      <div className={`flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-teal-200 bg-teal-50/70 px-4 py-2.5 ${className}`} data-revise-first data-revise-variant="slim">
        <span className="text-sm font-black text-teal-900">🧭 {t('mission.beforeStart')}</span>
        {prereqs.map((p) => {
          const available = p.status === 'available';
          return (
            <button key={p.id} type="button" disabled={!available} onClick={() => open(p)} data-revise-lesson={p.id} data-revise-status={p.status}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border-2 border-teal-300 bg-white px-3 text-sm font-bold text-slate-900 hover:border-teal-500 disabled:border-dashed disabled:text-slate-500">
              <span aria-hidden="true">📘</span><MathLabel>{p.title}</MathLabel>
              {available ? <span className="font-black text-teal-700">↩ {t('mission.revise')}</span> : <span className="text-xs">· {t('mission.comingSoon')}</span>}
            </button>
          );
        })}
      </div>
    );
  }
  return (
    <div className={`rounded-3xl border-2 border-teal-200 bg-teal-50/60 p-5 text-start ${className}`} data-revise-first>
      <p className="text-lg font-black text-teal-900">🧭 {t('diagnostic.reviewTitle')}</p>
      <p className="mt-1 text-sm text-teal-800">{t('mission.reviseLead')}</p>
      <ul className={`mt-3 grid gap-3 ${columns === 2 ? 'sm:grid-cols-2' : ''}`}>
        {shownBig.map((p) => {
          const otherYear = lesson?.gradeId && p.gradeId !== lesson.gradeId ? p.gradeName : null;
          const available = p.status === 'available';
          return (
            <li key={p.id} data-revise-lesson={p.id} data-revise-status={p.status}>
              <button type="button" disabled={!available} onClick={() => open(p)}
                className={`flex min-h-[64px] w-full items-center gap-3 rounded-2xl border-2 px-4 py-2 text-start transition-colors ${available ? 'border-teal-300 bg-white hover:border-teal-500 hover:bg-teal-50' : 'border-dashed border-slate-300 bg-white/70 text-slate-500'}`}>
                <span className="text-2xl" aria-hidden="true">📘</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-black text-slate-900"><MathLabel>{p.title}</MathLabel></span>
                  <span className="block text-xs font-bold text-slate-500">
                    {otherYear ?? ''}{!available && ` · ${t('mission.comingSoon')}`}
                  </span>
                </span>
                {available && <span className="shrink-0 rounded-xl bg-teal-600 px-3 py-1.5 text-sm font-black text-white">{t('mission.revise')} ←</span>}
              </button>
            </li>
          );
        })}
      </ul>
      {others.length > 0 && (
        <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-teal-900" data-revise-others>
          <span className="font-bold">{t('mission.reviseAlso')}</span>
          {others.map((p) => (
            <button key={p.id} type="button" disabled={p.status !== 'available'} onClick={() => open(p)} data-revise-lesson={p.id}
              className="rounded-full border border-teal-300 bg-white px-3 py-1 font-bold hover:border-teal-500 disabled:opacity-50">
              <MathLabel>{p.title}</MathLabel>
            </button>
          ))}
        </p>
      )}
    </div>
  );
}
