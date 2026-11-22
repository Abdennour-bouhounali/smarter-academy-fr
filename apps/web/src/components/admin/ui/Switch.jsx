/**
 * L'interrupteur du panneau — un vrai `role="switch"` qui dit son état par `aria-checked`.
 *
 * Il ne fait QUE le geste : l'appelant décide de ce qu'un clic déclenche (appel au serveur, confirmation) et
 * rend l'état que le serveur a renvoyé. `onClass` est la couleur de l'état « allumé ».
 */
export default function Switch({ on, onToggle, disabled = false, label, onClass = 'bg-violet-600', ...rest }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={onToggle}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${on ? onClass : 'bg-slate-300'}`}
      {...rest}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </button>
  );
}
