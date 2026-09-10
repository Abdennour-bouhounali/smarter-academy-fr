import RichText from '../RichText';

/**
 * QCM : on TOUCHE la réponse, on ne la coche pas puis on valide.
 * Premier contrôle de l'ordre de préférence maison (INTERACTION_PEDAGOGY §16 :
 * tap → stepper → chip → slider → draw → drag).
 */
export default function ChoiceInput({ question, value, onChange, disabled }) {
  const multi = question.answerType === 'multiChoice';
  const picked = multi ? (value?.choiceIds ?? []) : value?.choiceId ? [value.choiceId] : [];

  const toggle = (id) => {
    if (disabled) return;
    if (!multi) return onChange({ choiceId: id });
    const next = picked.includes(id) ? picked.filter((c) => c !== id) : [...picked, id];
    onChange({ choiceIds: next });
  };

  return (
    <div className="space-y-2">
      {multi && (
        <p className="text-xs font-mono text-slate-500">Plusieurs réponses peuvent être justes.</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {question.choices.map((choice) => {
          const on = picked.includes(choice.id);

          return (
            <button
              key={choice.id}
              type="button"
              onClick={() => toggle(choice.id)}
              disabled={disabled}
              aria-pressed={on}
              className={`text-left px-4 py-3 rounded-xl border-2 min-h-[48px] transition-colors ${
                on ? 'border-indigo-500 bg-indigo-50 text-slate-900' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
              } ${disabled ? 'opacity-70 cursor-default' : ''}`}
            >
              <span className="font-mono font-bold text-xs text-slate-500 mr-2">{choice.id}</span>
              <RichText>{choice.content}</RichText>
            </button>
          );
        })}
      </div>
    </div>
  );
}
