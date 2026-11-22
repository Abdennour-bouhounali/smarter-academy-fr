import { useEffect, useLayoutEffect, useRef } from 'react';
import { ensureMathLive } from './mathliveSetup.js';

/**
 * Un champ MathLive (`<math-field>`) tenu par React SANS le contrôler à
 * chaque frappe : on pose la valeur quand elle diffère (chargement,
 * exemple choisi), on écoute `input`. Le curseur ne saute jamais.
 *
 * Le champ est LTR par nature — une expression se lit de gauche à droite
 * dans une page arabe — et isolé du bidi environnant (ARABIC_RTL_CONTRACT).
 */
export default function ExpressionField({ value, onInput, onCommit, ariaLabel, ariaDescribedBy, invalid, autoFocus, className = '' }) {
  const ref = useRef(null);
  const onInputRef = useRef(onInput);
  const onCommitRef = useRef(onCommit);
  onInputRef.current = onInput;
  onCommitRef.current = onCommit;

  ensureMathLive();

  useLayoutEffect(() => {
    const field = ref.current;
    if (!field) return undefined;
    field.mathVirtualKeyboardPolicy = 'auto';
    field.menuItems = [];
    field.smartMode = false;
    if (field.value !== (value ?? '')) field.value = value ?? '';

    const handleInput = () => onInputRef.current?.(field.value);
    const handleChange = () => onCommitRef.current?.(field.value);
    field.addEventListener('input', handleInput);
    field.addEventListener('change', handleChange);

    return () => {
      field.removeEventListener('input', handleInput);
      field.removeEventListener('change', handleChange);
    };
    // La valeur initiale seulement : les suivantes passent par l'effet ci-dessous.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const field = ref.current;
    if (field && field.value !== (value ?? '')) field.value = value ?? '';
  }, [value]);

  // Le focus attend que MathLive ait monté son champ (un tour de boucle
  // après la création de l'élément) : avant, `focus()` ne fait rien.
  useEffect(() => {
    if (!autoFocus) return undefined;
    const timer = setTimeout(() => ref.current?.focus?.(), 50);

    return () => clearTimeout(timer);
  }, [autoFocus]);

  return (
    <math-field
      ref={ref}
      dir="ltr"
      class={`sa-ml-grapher__field ${invalid ? 'sa-ml-grapher__field--invalid' : ''} ${className}`.trim()}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-invalid={invalid ? 'true' : undefined}
      math-virtual-keyboard-policy="auto"
    />
  );
}
