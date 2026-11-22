import { useEffect, useLayoutEffect, useRef } from 'react';
import { ensureMathLive } from '../../../mathlab/tools/functionGrapher/mathliveSetup.js';
import { installExamKeyboard } from './examKeyboard';

/**
 * Un champ MathLive (`<math-field>`) de la feuille d'examen (propriétaire,
 * 2026-10-06 : « intégrer MathLive »). Une formule s'écrit de GAUCHE À DROITE,
 * isolée du sens arabe de la page ; « 7/9 » devient une vraie fraction.
 *
 * Non contrôlé à chaque frappe (le curseur ne saute jamais) : la valeur initiale
 * est posée une fois, on écoute `input`. `onChange(latex, ascii)` rend le LaTeX
 * (pour réafficher) et l'ASCII-math (« 7/9 », « 135 ») que lit l'évaluateur.
 *
 * Chargé À LA DEMANDE (lazy) : MathLive n'entre que dans le lot des feuilles
 * d'examen (docs/architecture/BUNDLE_BOUNDARIES.md §6).
 */
export default function ExamMathField({ value = '', onChange, onEnter, disabled = false, ariaLabel, placeholder = '', className = '', autoFocus = false, keyboard = null, pad = false, onReady = null }) {
  const ref = useRef(null);
  const onChangeRef = useRef(onChange);
  const onEnterRef = useRef(onEnter);
  onChangeRef.current = onChange;
  onEnterRef.current = onEnter;
  ensureMathLive();

  useLayoutEffect(() => {
    const field = ref.current;
    if (!field) return undefined;
    // Avec « لوحة الرموز » (pad) à côté du champ, le clavier flottant de MathLive reste fermé, et sur un
    // écran tactile le clavier du SYSTÈME ne s'ouvre pas par-dessus (conseil, 2026-11-09) : seule la lettre.
    field.mathVirtualKeyboardPolicy = pad ? 'manual' : 'auto';
    if (pad && typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches) {
      requestAnimationFrame(() => {
        try { field.shadowRoot?.querySelector('textarea')?.setAttribute('inputmode', 'none'); } catch { /* rendu sans shadow DOM */ }
      });
    }
    onReady?.(field);
    field.menuItems = [];
    field.smartMode = false;
    // « * » s'écrit « × » : c'est la notation du sujet algérien (pas « · »).
    try { field.inlineShortcuts = { ...field.inlineShortcuts, '*': '\\times' }; } catch { /* option absente */ }
    if (field.value !== value) field.value = value;
    if (autoFocus) requestAnimationFrame(() => field.focus());

    const handleInput = () => {
      let ascii = '';
      try { ascii = field.getValue('ascii-math'); } catch { ascii = field.value; }
      onChangeRef.current?.(field.value, ascii);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Enter' && onEnterRef.current) {
        event.preventDefault();
        onEnterRef.current();
      }
    };
    let restore = () => {};
    // `keyboard` : une autre disposition nommée (le « مختبر التفكير » a la sienne) ; sinon celle de la copie.
    const handleFocus = () => { if (!pad) restore = installExamKeyboard(keyboard ?? undefined); };
    const handleBlur = () => restore();
    field.addEventListener('input', handleInput);
    field.addEventListener('keydown', handleKeyDown);
    field.addEventListener('focus', handleFocus);
    field.addEventListener('blur', handleBlur);
    return () => {
      field.removeEventListener('input', handleInput);
      field.removeEventListener('keydown', handleKeyDown);
      field.removeEventListener('focus', handleFocus);
      field.removeEventListener('blur', handleBlur);
      restore();
    };
    // Valeur initiale seulement (champ non contrôlé).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (ref.current) ref.current.readOnly = disabled;
  }, [disabled]);

  // Une valeur imposée de l'extérieur (réponse remise à zéro, réponse
  // enregistrée relue) remplace le contenu — jamais pendant que l'élève écrit.
  useEffect(() => {
    const field = ref.current;
    if (!field || field.value === value) return;
    if (typeof document !== 'undefined' && document.activeElement === field) return;
    field.value = value;
  }, [value]);

  return (
    <math-field
      ref={ref}
      dir="ltr"
      class={`sa-exam-mathfield ${className}`.trim()}
      aria-label={ariaLabel}
      placeholder={placeholder}
      math-virtual-keyboard-policy={pad ? 'manual' : 'auto'}
      data-exam-mathfield
    />
  );
}
