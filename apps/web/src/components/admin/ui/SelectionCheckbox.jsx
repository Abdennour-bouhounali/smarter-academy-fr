import React, { useEffect, useRef } from 'react';

/**
 * La case à cocher d'une liste d'administration.
 *
 * Existe comme composant pour UNE raison : l'état « indéterminé » de la case
 * maîtresse n'est pas un attribut HTML, c'est une propriété du nœud DOM. Un
 * `<input indeterminate>` en JSX ne fait rien du tout — il faut la poser par
 * référence, et le faire dans trois pages serait trois occasions de l'oublier.
 *
 * Le libellé est obligatoire et il NOMME sa ligne (« Sélectionner Fractions »)
 * plutôt que de dire « Sélectionner » trois cents fois : à la lecture d'écran,
 * une colonne de cases anonymes est inutilisable.
 */
export default function SelectionCheckbox({
  checked,
  indeterminate = false,
  onChange,
  label,
  disabled = false,
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate && !checked;
  }, [indeterminate, checked]);

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      disabled={disabled}
      aria-label={label}
      onChange={(event) => onChange?.(event.target.checked)}
      // Le clic ne doit pas remonter : dans un tableau dont la ligne est
      // cliquable, cocher ouvrirait la fiche.
      onClick={(event) => event.stopPropagation()}
      className="h-5 w-5 shrink-0 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
    />
  );
}
