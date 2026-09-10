import { Lightbulb } from 'lucide-react';
import { Feedback } from '../../lessons/common/components/LessonUI';
import RichText from './RichText';

/**
 * Les indices, un par un, et jamais avant qu'on les demande.
 *
 * Le contenu des indices ne descend pas avec la question : chaque appui
 * demande le suivant au serveur, qui le trace. On ne peut donc pas sauter au
 * troisième, et la progressivité tient par construction plutôt que par la
 * retenue de l'interface.
 *
 * Demander un indice n'est pas un aveu d'échec — le libellé le dit, et le
 * moteur de maîtrise le traite ainsi : une réussite aidée reste une
 * progression.
 */
export default function HintPanel({ hints, remaining, onRequest, busy, disabled }) {
  const hasMore = remaining > 0;

  return (
    <div className="space-y-3">
      {hints.map((hint) => (
        <Feedback key={hint.index} tone="hint">
          <RichText>{hint.content}</RichText>
        </Feedback>
      ))}

      {hasMore && !disabled && (
        <button
          type="button"
          onClick={onRequest}
          disabled={busy}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-amber-300 bg-amber-50 text-amber-900 font-bold text-sm min-h-[48px] hover:border-amber-500 disabled:opacity-60"
        >
          <Lightbulb className="w-4 h-4" aria-hidden="true" />
          {hints.length === 0 ? 'Un indice ?' : 'Encore un indice'}
          <span className="font-mono text-xs text-amber-700">({remaining} restant{remaining > 1 ? 's' : ''})</span>
        </button>
      )}

      {!hasMore && hints.length > 0 && (
        <p className="text-xs text-slate-500 font-mono">Tous les indices ont été donnés.</p>
      )}
    </div>
  );
}
