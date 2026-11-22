import { useId } from 'react';

/**
 * « نجمة العلم الجزائري » — le drapeau du تحدّ (p. 151 : le manuel montre une PHOTO du drapeau, aucune figure
 * géométrique) : moitié verte à gauche (côté hampe), moitié blanche, le croissant et l'étoile rouges au centre.
 * AUCUNE réponse, AUCUNE mesure : ni cercle, ni 72°, ni rayon (c'est la question du تحدّ). Le même dessin sert la page
 * d'unité (pages/unit/UnitOpenerFigure.jsx, clé « dawaran-mudalaat:challenge ») et la carte du module 1.
 *
 * Props : `label` (ariaLabel arabe), `compact` (vignette de la carte d'activité).
 */
const RED = '#D21034';
const GREEN = '#006233';

/** Les dix sommets d'une étoile à cinq branches (pointe vers le haut), centre (x, y), rayons R et r. */
function starPoints(x, y, R, r) {
  return Array.from({ length: 10 }, (_, i) => {
    const a = (-90 + i * 36) * (Math.PI / 180);
    const d = i % 2 ? r : R;
    return `${(x + d * Math.cos(a)).toFixed(2)},${(y + d * Math.sin(a)).toFixed(2)}`;
  }).join(' ');
}

export default function FlagStarFigure({ label, compact = false }) {
  const id = useId().replace(/:/g, '');
  const aria = label ?? 'العلم الجزائري: نصفه الأيسر أخضر ونصفه الأيمن أبيض، وفي وسطه هلال ونجمة خماسية حمراوان';
  return (
    <figure className={`mx-auto w-full ${compact ? 'max-w-[220px]' : 'max-w-sm'} rounded-xl border-2 border-slate-200 bg-white p-2`} data-figure="flag-star">
      <svg viewBox="0 0 300 200" className="h-auto w-full" style={{ direction: 'ltr' }} role="img" aria-label={aria}>
        <defs>
          <mask id={`crescent-${id}`}>
            <rect x="0" y="0" width="300" height="200" fill="#FFFFFF" />
            <circle cx="161" cy="100" r="40" fill="#000000" />
          </mask>
        </defs>
        <rect x="0" y="0" width="150" height="200" fill={GREEN} />
        <rect x="150" y="0" width="150" height="200" fill="#FFFFFF" />
        <rect x="0.5" y="0.5" width="299" height="199" fill="none" stroke="#CBD5E1" />
        <circle cx="146" cy="100" r="50" fill={RED} mask={`url(#crescent-${id})`} />
        <polygon points={starPoints(176, 100, 25, 10)} fill={RED} transform="rotate(-18 176 100)" />
      </svg>
    </figure>
  );
}
