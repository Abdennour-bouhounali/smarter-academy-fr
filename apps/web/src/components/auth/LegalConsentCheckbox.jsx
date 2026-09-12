import { Link } from 'react-router-dom';

/**
 * LA CASE DE CONSENTEMENT — une seule, obligatoire, et la même partout.
 *
 * Elle est partagée entre l'inscription classique et la fin d'inscription
 * Google : ce sont les deux seuls endroits où un compte naît, et les deux
 * doivent recueillir exactement le même accord, aux mêmes mots. Deux copies
 * auraient divergé au premier ajustement de formulation — et la formulation
 * est précisément ce que l'élève est réputé avoir accepté.
 *
 * ── Accessibilité, et pourquoi ce n'est pas un <label> englobant ─────────
 * Un <label> qui enveloppe la case ET les liens produit des éléments
 * interactifs imbriqués : cliquer « CGU » cocherait aussi la case, et les
 * lecteurs d'écran annonceraient l'ensemble comme une seule commande. La case
 * et son texte sont donc reliés par `id`/`htmlFor`, et les liens vivent à
 * côté du <label>, atteignables séparément au clavier.
 *
 * `stopPropagation` sur les liens : sans lui, le clic remonterait au conteneur
 * et basculerait la case au moment même où l'élève part lire le document.
 *
 * La zone tactile fait 24px et le conteneur offre une marge de frappe
 * confortable — une case de 16px seule est difficile à viser sur téléphone.
 */
export default function LegalConsentCheckbox({
  checked,
  onChange,
  error,
  disabled = false,
  id = 'accept-legal',
}) {
  const errorId = `${id}-error`;

  return (
    <div>
      <div className="flex items-start gap-3">
        <input
          id={id}
          name={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
          className="mt-0.5 h-6 w-6 shrink-0 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <label htmlFor={id} className="text-sm leading-relaxed text-slate-700 cursor-pointer select-none">
          J’accepte les{' '}
          <Link
            to="/cgu"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700"
          >
            Conditions Générales d’Utilisation
          </Link>{' '}
          et la{' '}
          <Link
            to="/confidentialite"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700"
          >
            Politique de confidentialité
          </Link>{' '}
          de Smarter Academy.
        </label>
      </div>

      {error && (
        <p id={errorId} role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
