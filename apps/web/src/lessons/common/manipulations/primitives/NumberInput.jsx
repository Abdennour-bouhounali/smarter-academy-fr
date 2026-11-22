
/**
 * Un champ pour UN entier naturel, borné. Le champ est LTR (un nombre est une
 * écriture numérique) ; l'étiquette reste dans le flux arabe de la page.
 * La validation (min/max, contraintes croisées) est faite par l'appelant ; ce
 * champ ne fait que saisir et signaler.
 */
export default function NumberInput({ id, label, value, onChange, min, max, invalid = false, disabled = false }) {
  return (
    <label htmlFor={id} className="flex items-center gap-2 text-sm text-slate-700">
      <span className="font-semibold">{label}</span>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        dir="ltr"
        value={value}
        min={min}
        max={max}
        disabled={disabled}
        aria-invalid={invalid}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9٠-٩]/g, ''))}
        className={`w-24 rounded-lg border-2 px-2 py-1.5 text-center font-mono tabular-nums text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
          invalid ? 'border-rose-400 bg-rose-50' : 'border-slate-300 bg-white'
        } ${disabled ? 'opacity-60' : ''}`}
      />
    </label>
  );
}
