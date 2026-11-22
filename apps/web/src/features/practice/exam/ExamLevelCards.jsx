import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Lock, Award } from 'lucide-react';
import { ArrowForward } from '../../../components/common/DirectionalIcons';
import { exerciseIdsFor, loadExercise } from '../practiceContent';
import MedalTray from '../medals/MedalTray';

/**
 * Les cinq niveaux d'une leçon au format BEM, en CARTES (propriétaire,
 * 2026-10-06 : « améliorer l'interface ») — une rangée de cinq sur grand écran,
 * empilées sur téléphone. Chaque carte dit : le niveau et son nom, combien
 * d'exercices viennent d'un VRAI sujet de شهادة التعليم المتوسط, la progression,
 * et l'action. Un niveau fermé dit pourquoi (même texte que LevelSelector).
 */
function useBemCounts(lessonCode, levels) {
  const [counts, setCounts] = useState({});
  useEffect(() => {
    let cancelled = false;
    Promise.all((levels ?? []).map(async ({ level }) => {
      const ids = exerciseIdsFor(lessonCode, level);
      const exs = await Promise.all(ids.map((id) => loadExercise(lessonCode, level, id).catch(() => null)));
      return [level, exs.filter((e) => ['official', 'excerpt'].includes(e?.metadata?.exam?.kind)).length];
    })).then((pairs) => { if (!cancelled) setCounts(Object.fromEntries(pairs)); });
    return () => { cancelled = true; };
  }, [lessonCode, levels]);
  return counts;
}

export default function ExamLevelCards({ lessonCode, levels, recommendedLevel, onSelect, busyLevel, showProgress = true, medalsByLevel = null }) {
  const { t } = useTranslation('student');
  const bem = useBemCounts(lessonCode, levels);
  const sorted = [...(levels ?? [])].sort((a, b) => a.level - b.level);

  return (
    <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5" data-level-path data-exam-level-cards>
      {sorted.map((level, i) => {
        const name = t(`practice.levelNames.${level.level}`, { defaultValue: '' });
        const done = level.exerciseCount > 0 && level.completedCount >= level.exerciseCount;
        const recommended = level.level === recommendedLevel && level.unlocked;
        const ratio = level.exerciseCount > 0 ? Math.min(1, level.completedCount / level.exerciseCount) : 0;
        const bemCount = bem[level.level];
        const previous = i > 0 ? sorted[i - 1].level : null;

        return (
          <li
            key={level.level}
            className={`relative flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 transition-shadow ${
              recommended ? 'ring-2 ring-[#1f5c4c] shadow-[0_10px_28px_-18px_rgba(31,92,76,0.55)]' : 'ring-slate-200 hover:shadow-md'
            } ${level.unlocked ? '' : 'bg-slate-50'}`}
            data-practice-level-card={level.level}
          >
            <div className="flex items-start justify-between gap-2">
              <span
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-lg font-bold ${
                  !level.unlocked ? 'bg-slate-200 text-slate-500' : done ? 'bg-emerald-600 text-white' : recommended ? 'bg-[#1f5c4c] text-white' : 'bg-slate-100 text-slate-800'
                }`}
                aria-hidden="true"
              >
                {!level.unlocked ? <Lock className="h-5 w-5" /> : done ? <Check className="h-5 w-5" strokeWidth={3} /> : level.level}
              </span>
              <span className="flex flex-col items-end gap-1">
                {recommended && <span className="rounded-md bg-[#1f5c4c] px-2 py-0.5 text-xs font-bold text-white">{t('practice.levelRecommended')}</span>}
                {done && !recommended && <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-800">{t('practice.levelDone')}</span>}
              </span>
            </div>

            <div className="space-y-0.5">
              <p className="text-base font-bold text-slate-900">{t('practice.levelLabel', { level: level.level })}</p>
              {name && <p className="text-sm font-semibold text-slate-600">{name}</p>}
            </div>

            {/* Combien d'exercices viennent d'un VRAI sujet — sur une ligne, sous le nom. */}
            {bemCount > 0 && (
              <span className="inline-flex w-fit items-center gap-1 whitespace-nowrap rounded-md bg-violet-50 px-2 py-0.5 text-xs font-bold text-violet-800 ring-1 ring-violet-200" data-level-bem={bemCount}>
                <Award className="h-3.5 w-3.5" aria-hidden="true" /> {t('practice.exam.hub.bemCount', { count: bemCount })}
              </span>
            )}

            {showProgress ? (
              <div className="space-y-1">
                <span className="block h-1.5 w-full overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
                  <span className={`block h-full rounded-full ${done ? 'bg-emerald-500' : 'bg-[#1f5c4c]'}`} style={{ width: `${Math.round(ratio * 100)}%` }} />
                </span>
                <p className="text-xs font-semibold text-slate-600">
                  <bdi dir="ltr" className="font-bold tabular-nums text-slate-800">{level.completedCount}{'\u00A0/\u00A0'}{level.exerciseCount}</bdi>{' '}{t('practice.lp.exercises')}
                </p>
              </div>
            ) : (
              <p className="text-xs font-semibold text-slate-600">{t('practice.levelExerciseCount', { count: level.exerciseCount })}</p>
            )}

            {/* Les médailles gagnées à ce niveau. */}
            {medalsByLevel?.[level.level] && (
              <MedalTray counts={medalsByLevel[level.level]} size={16} className="text-xs" />
            )}

            <div className="mt-auto">
              {level.unlocked ? (
                <button
                  type="button"
                  onClick={() => onSelect(level.level)}
                  disabled={busyLevel != null}
                  data-practice-level={level.level}
                  className={`inline-flex min-h-[40px] w-full items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-bold transition-colors disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                    recommended ? 'bg-[#1f5c4c] text-white hover:bg-[#174a3d]' : 'bg-white text-[#1f5c4c] ring-1 ring-[#1f5c4c]/40 hover:bg-emerald-50'
                  }`}
                >
                  {busyLevel === level.level ? t('practice.levelOpening') : done ? t('practice.levelAgain') : t('practice.levelStart')}
                  <ArrowForward className="h-4 w-4" aria-hidden="true" />
                </button>
              ) : (
                <p className="text-xs text-slate-500" data-practice-level={level.level} data-locked="true" data-lock-reason={level.reason ?? ''}>
                  {previous ? t('practice.levelLockedAfter', { level: previous }) : t('practice.levelLockedHint')}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
