import { useEffect, useLayoutEffect, useRef } from 'react';
import { ensureMathLive } from './mathFieldSetup.js';

/**
 * Un champ MathLive (`<math-field>`) tenu par React SANS le contrôler à
 * chaque frappe : on pose la valeur quand elle diffère (chargement, exemple
 * choisi, défi qui pose sa fonction), on écoute `input`. Le curseur ne saute
 * jamais au milieu d'une saisie.
 *
 * C'est le composant du grapheur (`functionGrapher/ExpressionField.jsx`),
 * repris ici pour trois raisons et une seule différence :
 *   - il porte les classes `sa-ml-grapher__*` de sa propre feuille ;
 *   - il ne sait pas commiter sur Entrée (le grapheur applique à chaque
 *     frappe ; ici on attend la validation, parce qu'une expression à
 *     mi-frappe déclencherait un balayage complet — §47) ;
 *   - il ne gère pas l'échappement (revenir à la valeur d'avant), qui compte
 *     quand un champ vit dans un panneau qu'on peut quitter.
 *
 * Le champ est LTR par nature — une expression se lit de gauche à droite
 * dans une page arabe — et ISOLÉ du bidi environnant (ARABIC_RTL_CONTRACT).
 */
export default function MathField({
  value,
  onCommit,
  ariaLabel,
  invalid = false,
  className = '',
  keyboard = 'function',
  placeholder = '',
  testId,
}) {
  const ref = useRef(null);
  const onCommitRef = useRef(onCommit);
  const lastCommitted = useRef(value ?? '');
  onCommitRef.current = onCommit;

  ensureMathLive();

  useLayoutEffect(() => {
    const field = ref.current;
    if (!field) return undefined;

    field.mathVirtualKeyboardPolicy = 'auto';
    // Le menu contextuel de MathLive (copier en MathML, en LaTeX…) n'a rien
    // à faire dans un laboratoire : il propose des formats qu'aucun élève
    // n'utilisera et cache le champ sous un bouton de plus.
    field.menuItems = [];
    // `smartMode` transformerait « ln » en texte italique : on veut la
    // FONCTION ln, que l'analyseur reconnaît.
    field.smartMode = false;
    if (field.value !== (value ?? '')) field.value = value ?? '';
    lastCommitted.current = field.value;

    /** Valider : Entrée, ou la perte de focus. Jamais à chaque frappe (§47). */
    const commit = () => {
      const next = field.value;
      if (next === lastCommitted.current) return;
      lastCommitted.current = next;
      onCommitRef.current?.(next);
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        commit();
        field.blur();

        return;
      }
      if (event.key === 'Escape') {
        // Revenir à la dernière valeur validée : une saisie abandonnée ne
        // doit pas laisser le champ dans un état que l'élève n'a pas voulu.
        event.preventDefault();
        field.value = lastCommitted.current;
        field.blur();
      }
    };

    field.addEventListener('blur', commit);
    field.addEventListener('keydown', handleKeyDown);

    return () => {
      field.removeEventListener('blur', commit);
      field.removeEventListener('keydown', handleKeyDown);
    };
    // La valeur initiale seulement : les suivantes passent par l'effet ci-dessous.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Une valeur imposée de l'extérieur (un préréglage, un défi qui pose sa
  // fonction) remplace le contenu — mais jamais pendant que l'élève écrit.
  useEffect(() => {
    const field = ref.current;
    if (!field) return;
    const next = value ?? '';
    if (field.value === next) return;
    if (typeof document !== 'undefined' && document.activeElement === field) return;
    field.value = next;
    lastCommitted.current = next;
  }, [value]);

  return (
    <math-field
      ref={ref}
      dir="ltr"
      class={`sa-ml-an__mathfield${invalid ? ' sa-ml-an__mathfield--invalid' : ''} ${className}`.trim()}
      aria-label={ariaLabel}
      aria-invalid={invalid ? 'true' : undefined}
      placeholder={placeholder}
      math-virtual-keyboard-policy="auto"
      data-ml-an-mathfield={testId}
      data-ml-an-keyboard={keyboard}
    />
  );
}
