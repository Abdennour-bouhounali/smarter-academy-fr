import { Check, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ArrowForward } from '../../components/common/DirectionalIcons';

/**
 * Les cinq niveaux, et pourquoi les fermés le sont.
 *
 * Un verrou muet est une impasse : chaque niveau fermé DIT ce qu'il attend.
 * Et un niveau déjà ouvert le reste — on peut toujours redescendre
 * s'entraîner plus bas.
 *
 * TOUT LE TEXTE VIENT DE L'ARABE (`student.practice.*`). Le motif du verrou
 * (`level.reason`) est un CODE du serveur (`previous_level_incomplete`) : la
 * phrase est toujours écrite ici, en arabe, avec le niveau précédent —
 * jamais le texte du serveur.
 *
 * FORME (refonte 2026-09-24, alignée sur le lecteur d'exercices) : un
 * PARCOURS, une rangée par niveau, reliées par un rail — pas une grille de
 * cartes de même poids. Chaque rangée dit, d'un coup d'œil :
 *
 *   (1)  Palier 1 · Je reprends les bases     [Conseillé]   Commencer →
 *        ▰▰▱▱  1 / 3 exercices terminés
 *
 * Le compteur est isolé LTR (« 1 / 3 ») : l'ancien « {{done}} sur {{total}} » arabe,
 * dans un `dir="ltr"`, se lisait à l'envers. La rangée entière est le bouton
 * (cible ≥ 64 px) ; une rangée fermée n'est pas un bouton et dit pourquoi.
 */
/** Le niveau qui précède `n` dans la liste du serveur (celui qu'il faut terminer). */
function previousLevel(levels, n) {
  const sorted = [...(levels ?? [])].map((l) => l.level).sort((a, b) => a - b);
  const i = sorted.indexOf(n);

  return i > 0 ? sorted[i - 1] : null;
}

export default function LevelSelector({ levels, recommendedLevel, onSelect, busyLevel, showProgress = true }) {
  const { t } = useTranslation('student');

  return (
    <ol className="relative space-y-2 before:absolute before:start-[25px] before:top-6 before:bottom-6 before:w-0.5 before:bg-slate-200 before:content-['']" data-level-path>
      {levels.map((level) => {
        const name = t(`practice.levelNames.${level.level}`, { defaultValue: '' });
        const label = t('practice.levelLabel', { level: level.level });
        const done = level.exerciseCount > 0 && level.completedCount >= level.exerciseCount;
        const recommended = level.level === recommendedLevel && level.unlocked;
        const ratio = level.exerciseCount > 0 ? Math.min(1, level.completedCount / level.exerciseCount) : 0;

        const node = (
          <span
            aria-hidden="true"
            className={`relative z-[1] grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold ring-4 ring-slate-50 ${
              !level.unlocked ? 'bg-slate-100 text-slate-400'
                : done ? 'bg-emerald-600 text-white'
                  : recommended ? 'bg-nav-accent text-white'
                    : 'bg-white text-nav-accent ring-offset-0 border-2 border-indigo-300'
            }`}
          >
            {!level.unlocked ? <Lock className="h-4 w-4" /> : done ? <Check className="h-4 w-4" strokeWidth={3} /> : level.level}
          </span>
        );

        // `showProgress = false` (l'enseignant, rien n'est suivi) : le nombre
        // d'exercices du niveau, sans barre ni « 0 / N ».
        const progress = !showProgress ? (
          <span className="mt-1 block text-xs font-semibold text-slate-600" data-level-count>
            {level.exerciseCount ? t('practice.levelExerciseCount', { count: level.exerciseCount }) : t('practice.levelExerciseNone')}
          </span>
        ) : (
          <span className="mt-1 flex items-center gap-2">
            <span className="block h-1.5 w-full max-w-[10rem] overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
              <span className={`block h-full rounded-full ${done ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${Math.round(ratio * 100)}%` }} />
            </span>
            <span className="whitespace-nowrap text-xs font-semibold text-slate-600">
              <bdi dir="ltr" className="font-bold tabular-nums text-slate-800">{level.completedCount}{'\u00A0/\u00A0'}{level.exerciseCount}</bdi>
              {' '}{t('practice.lp.exercises')}
            </span>
          </span>
        );

        if (!level.unlocked) {
          return (
            <li key={level.level} className="relative flex items-start gap-3 rounded-xl px-2 py-2.5" data-practice-level={level.level} data-locked="true">
              {node}
              <span className="min-w-0 flex-1 pt-0.5">
                <span className="block text-sm font-bold text-slate-500">{label}{name ? ` · ${name}` : ''}</span>
                <span className="block text-xs text-slate-500" data-lock-reason={level.reason ?? ''}>
                  {previousLevel(levels, level.level)
                    ? t('practice.levelLockedAfter', { level: previousLevel(levels, level.level) })
                    : t('practice.levelLockedHint')}
                </span>
              </span>
            </li>
          );
        }

        return (
          <li key={level.level} className="relative">
            <button
              type="button"
              onClick={() => onSelect(level.level)}
              disabled={busyLevel != null}
              data-practice-level={level.level}
              className={`group flex w-full min-h-[64px] items-center gap-3 rounded-xl px-2 py-2.5 text-start transition-colors disabled:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 motion-reduce:transition-none ${
                recommended ? 'bg-white ring-2 ring-indigo-300 shadow-sm hover:ring-nav-accent' : 'hover:bg-white hover:ring-1 hover:ring-slate-200'
              }`}
            >
              {node}
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="text-base font-bold text-slate-900">{label}</span>
                  {name && <span className="text-sm font-semibold text-slate-600">· {name}</span>}
                  {recommended && (
                    <span className="rounded-md bg-nav-accent px-2 py-0.5 text-xs font-bold text-white">{t('practice.levelRecommended')}</span>
                  )}
                  {done && !recommended && (
                    <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-800">{t('practice.levelDone')}</span>
                  )}
                </span>
                {progress}
              </span>
              <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold ${
                recommended ? 'bg-nav-accent text-white group-hover:bg-[#3350c4]' : 'text-nav-accent group-hover:bg-nav-accent-soft'
              }`}
              >
                {busyLevel === level.level ? t('practice.levelOpening') : done ? t('practice.levelAgain') : t('practice.levelStart')}
                <ArrowForward className="h-4 w-4" aria-hidden="true" />
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
