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
 *
 * LARGEUR — le champ GRANDIT avec la place disponible au lieu d'être figé.
 * Une largeur fixe convenait à « 7/4 » mais pas à « 1 ; 2 ; 3 ; 4 ; 5 ; 6 ;
 * 10 ; 12 ; 15 ; 20 ; 30 ; 60 » (les douze diviseurs de 60) : l'élève
 * écrivait sa réponse à l'aveugle, le début du texte sortant du cadre.
 * `width` fixe donc un MINIMUM (`min-w-…`), et le champ s'étire jusqu'à la
 * largeur de sa ligne. Sur mobile il occupe toute la largeur disponible.
 */
export default function AnswerField({
  value, onChange, onEnter, placeholder = '?', ariaLabel, width = 'min-w-[10rem]', grow = true, disabled = false, align = 'center',
}) {
  return (
    <input
      type="text"
      inputMode="text"
      autoComplete="off"
      autoCorrect="off"
      spellCheck="false"
      dir="auto"
      value={value ?? ''}
      aria-label={ariaLabel}
      placeholder={placeholder}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && onEnter) onEnter();
      }}
      className={`${width} ${grow ? 'w-full flex-1' : ''} max-w-full rounded-xl border-2 px-3 py-2.5 font-mono text-xl tabular-nums min-h-[52px] transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200 ${
        align === 'start' ? 'text-start' : 'text-center'
      } ${
        disabled ? 'border-slate-200 bg-slate-50 text-slate-500' : 'border-slate-300 bg-white text-slate-800 focus:border-nav-accent'
      }`}
    />
  );
}
