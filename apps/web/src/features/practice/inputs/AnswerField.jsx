/**
 * Le champ de saisie d'une réponse de pratique.
 *
 * Pourquoi ne pas réutiliser `NumberField` de LessonUI : il ne prend pas de
 * `disabled` (une réponse déjà envoyée doit se figer), et surtout il déclare
 * `inputMode="numeric"`, qui sur mobile affiche un pavé de chiffres SANS le
 * signe moins ni la barre de fraction. Or on attend ici « −2 », « 3/4 »,
 * « 7,5 ». `inputMode="text"` fait apparaître le clavier complet.
 *
 * NumberField n'est pas modifié : 132 leçons en dépendent, et leur besoin
 * (des entiers positifs) est bien celui qu'il sert.
 */
export default function AnswerField({
  value, onChange, onEnter, placeholder = '?', ariaLabel, width = 'w-40', disabled = false,
}) {
  return (
    <input
      type="text"
      inputMode="text"
      autoComplete="off"
      autoCorrect="off"
      spellCheck="false"
      value={value ?? ''}
      aria-label={ariaLabel}
      placeholder={placeholder}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && onEnter) onEnter();
      }}
      className={`${width} border-2 rounded-xl px-3 py-2.5 font-mono tabular-nums text-center text-xl min-h-[52px] transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200 ${
        disabled ? 'border-slate-200 bg-slate-50 text-slate-500' : 'border-slate-300 bg-white text-slate-800 focus:border-blue-500'
      }`}
    />
  );
}
