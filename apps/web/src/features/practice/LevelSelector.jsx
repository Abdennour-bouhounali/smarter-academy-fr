import { Lock } from 'lucide-react';

/**
 * Les cinq niveaux, et pourquoi les fermés le sont.
 *
 * Un verrou muet est une impasse : chaque niveau fermé DIT ce qu'il attend.
 * Et un niveau déjà ouvert le reste — on peut toujours redescendre
 * s'entraîner plus bas.
 */
const LABELS = {
  1: { name: 'Reprendre les bases', tone: 'emerald' },
  2: { name: 'Appliquer', tone: 'sky' },
  3: { name: "S'entraîner", tone: 'indigo' },
  4: { name: 'Approfondir', tone: 'violet' },
  5: { name: 'Défi', tone: 'amber' },
};

const RING = {
  emerald: 'border-emerald-300 hover:border-emerald-500',
  sky: 'border-sky-300 hover:border-sky-500',
  indigo: 'border-indigo-300 hover:border-indigo-500',
  violet: 'border-violet-300 hover:border-violet-500',
  amber: 'border-amber-300 hover:border-amber-500',
};

export default function LevelSelector({ levels, recommendedLevel, onSelect, busyLevel }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {levels.map((level) => {
        const meta = LABELS[level.level] ?? { name: `Niveau ${level.level}`, tone: 'indigo' };
        const done = level.exerciseCount > 0 && level.completedCount >= level.exerciseCount;
        const recommended = level.level === recommendedLevel && level.unlocked;

        if (!level.unlocked) {
          return (
            <div
              key={level.level}
              className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-5 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-space font-bold text-slate-400">Niveau {level.level}</span>
                <Lock className="w-4 h-4 text-slate-400" aria-hidden="true" />
              </div>
              <p className="text-sm text-slate-500">{meta.name}</p>
              <p className="text-xs text-slate-500">{level.reason}</p>
            </div>
          );
        }

        return (
          <button
            key={level.level}
            type="button"
            onClick={() => onSelect(level.level)}
            disabled={busyLevel != null}
            className={`text-left rounded-2xl border-2 bg-white p-5 space-y-2 min-h-[128px] transition-colors disabled:opacity-70 ${RING[meta.tone]}`}
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="font-space font-bold text-slate-900">Niveau {level.level}</span>
              {recommended && (
                <span className="text-[11px] font-mono font-bold px-2 py-1 rounded-full bg-indigo-600 text-white">
                  conseillé
                </span>
              )}
              {done && !recommended && (
                <span className="text-[11px] font-mono font-bold px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  terminé
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600">{meta.name}</p>
            <p className="text-xs font-mono text-slate-500">
              {level.completedCount} / {level.exerciseCount} exercice{level.exerciseCount > 1 ? 's' : ''}
              {busyLevel === level.level ? ' · ouverture…' : ''}
            </p>
          </button>
        );
      })}
    </div>
  );
}
