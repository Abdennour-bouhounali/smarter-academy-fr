import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLessonById } from '@smarter-academy/core';
import MathLabel from './MathLabel';

/**
 * Les leçons PRÉREQUISES d'une leçon (`prerequisiteLessonCodes`), en pastilles —
 * page d'unité et sommaire de leçon. Prérequis pédagogique, jamais un verrou.
 *
 * Depuis le 2026-10-14 (cycle moyen, phase 2), un prérequis peut être d'une
 * année ANTÉRIEURE (tiré du réseau des الكفاءات) et pas encore écrit
 * (`coming_soon`) : la pastille dit alors l'année, et n'est un lien que si la
 * leçon est publiée — sinon le titre seul, avec « قيد الإعداد ». Le lien
 * s'allume de lui-même le jour où la leçon est publiée.
 */
export default function PrerequisiteLessonChips({ lessonId }) {
  const { t } = useTranslation('student');
  const lesson = getLessonById(lessonId);
  const gradeId = lesson?.gradeId ?? null;
  return (lesson?.prerequisiteLessonCodes ?? []).map((code) => getLessonById(code)).filter(Boolean).map((p) => {
    const otherYear = gradeId && p.gradeId !== gradeId ? p.gradeName : null;
    const label = (
      <>
        <MathLabel>{p.title}</MathLabel>
        {otherYear && <span className="text-[10px] opacity-75"> · {otherYear}</span>}
      </>
    );
    return (
      <li key={p.id} data-prerequisite-lesson={p.id} data-prerequisite-status={p.status}>
        {p.status === 'available' ? (
          <Link to={p.path} className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs text-indigo-800 hover:border-indigo-400">{label}</Link>
        ) : (
          <span className="inline-block rounded-full border border-dashed border-slate-300 bg-white px-2.5 py-0.5 text-xs text-slate-600">
            {label} <span className="text-[10px] text-slate-500">({t('unit.comingSoon')})</span>
          </span>
        )}
      </li>
    );
  });
}
