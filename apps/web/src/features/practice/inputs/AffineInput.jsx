import AnswerField from './AnswerField';

/**
 * Deux champs — a et b — plutôt qu'un éditeur d'expression.
 *
 * Ce n'est pas un repli faute de MathLive : c'est meilleur. L'ordre de
 * préférence maison va du plus simple au plus libre, et deux champs séparés
 * permettent au moteur de dire « ton coefficient directeur est bon, regarde
 * la valeur en x = 0 » — ce qu'une chaîne LaTeX unique rend impossible.
 */
export default function AffineInput({ value, onChange, disabled }) {
  const set = (key) => (v) => onChange({ ...value, [key]: v });

  return (
    <div className="flex items-end gap-4 flex-wrap">
      <label className="space-y-1">
        <span className="block text-xs font-mono font-bold text-slate-500 uppercase">
          Coefficient directeur <span className="italic normal-case">a</span>
        </span>
        <AnswerField
          value={value?.a ?? ''}
          onChange={set('a')}
          ariaLabel="Coefficient directeur a"
          width="w-32"
          disabled={disabled}
        />
      </label>
      <label className="space-y-1">
        <span className="block text-xs font-mono font-bold text-slate-500 uppercase">
          Ordonnée à l’origine <span className="italic normal-case">b</span>
        </span>
        <AnswerField
          value={value?.b ?? ''}
          onChange={set('b')}
          ariaLabel="Ordonnée à l’origine b"
          width="w-32"
          disabled={disabled}
        />
      </label>
    </div>
  );
}
