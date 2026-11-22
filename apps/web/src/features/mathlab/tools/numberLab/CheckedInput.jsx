import { useEffect, useId, useState } from 'react';

/**
 * Un champ de nombre dont le REFUS est motivé.
 *
 * `read(raw)` (pure, testée dans son module) rend `{ value }` ou `{ error }` ;
 * `errorText(code)` en fait une phrase arabe. Le texte reste celui de l'élève
 * tant qu'il n'est pas validé (Entrée ou sortie du champ) — on ne corrige pas
 * sous ses doigts. `dir="ltr"` : un nombre s'écrit de gauche à droite (§58).
 */
export default function CheckedInput({
  value, onValue, read, errorText, label, placeholder = '', inputMode = 'numeric', dataAttr = null, wide = false,
}) {
  const id = useId();
  const [text, setText] = useState(String(value ?? ''));
  const [error, setError] = useState(null);

  useEffect(() => { setText(String(value ?? '')); setError(null); }, [value]);

  const commit = (raw) => {
    const result = read(raw);
    if (result.error) { setError(result.error); return; }
    setError(null);
    if (result.value !== value) onValue(result.value);
  };

  return (
    <div className={`sa-ml-nb__field${error ? ' has-error' : ''}${wide ? ' sa-ml-nb__field--wide' : ''}`}>
      {label && <label className="sa-ml-nb__label" htmlFor={id}>{label}</label>}
      <input
        id={id}
        type="text"
        dir="ltr"
        inputMode={inputMode}
        className="sa-ml-nb__input"
        value={text}
        placeholder={placeholder}
        onChange={(event) => setText(event.target.value)}
        onBlur={(event) => commit(event.target.value)}
        onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); commit(event.currentTarget.value); } }}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...(dataAttr ? { [dataAttr]: '' } : {})}
      />
      {error && <p className="sa-ml-nb__error" id={`${id}-error`} role="alert">{errorText(error)}</p>}
    </div>
  );
}
