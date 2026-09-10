/**
 * Où en est l'élève dans sa séance. Pas de minuteur : la pratique
 * s'entraîne, elle ne chronomètre pas.
 */
export default function SessionProgress({ index, total, correctCount }) {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap text-xs font-mono text-slate-500">
      <span>
        Exercice {index + 1} / {total}
      </span>
      <div className="flex items-center gap-1.5" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={`w-2.5 h-2.5 rounded-full ${i < index ? 'bg-emerald-500' : i === index ? 'bg-slate-800' : 'bg-slate-200'}`}
          />
        ))}
      </div>
      <span>{correctCount} réponse{correctCount > 1 ? 's' : ''} juste{correctCount > 1 ? 's' : ''}</span>
    </div>
  );
}
