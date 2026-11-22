import { useId } from 'react';

/**
 * UNE AMPOULE DESSINÉE (2026-10-14, 1AM « قواعد قابلية القسمة ») — le voyant d'une affirmation, en SVG pur (aucune
 * image : MANIPULATION_CONTRACT « drawn in code »). Le `label` (le diviseur, « 2 ») est écrit sur le verre, en îlot LTR.
 *
 *   closed  verre blanc, contour pointillé, chiffre gris : personne n'a encore affirmé
 *   wait    éteinte et pâle : le nombre n'est pas complet
 *   yes     ALLUMÉE : verre jaune chaud, halo et rayons (le reste est 0)
 *   no      éteinte, gris froid, une pastille × (le reste n'est pas 0)
 *
 * Le halo passe par une transition d'opacité (coupée sous `prefers-reduced-motion`). Décorative : `aria-hidden` ;
 * l'état se dit dans le conteneur (aria-label) du type qui l'utilise.
 */
const LOOK = {
  closed: { glass: '#FFFFFF', glass2: '#F1F5F9', stroke: '#CBD5E1', dash: '4 3', ink: '#94A3B8', fil: '#CBD5E1' },
  wait: { glass: '#F8FAFC', glass2: '#E2E8F0', stroke: '#CBD5E1', dash: null, ink: '#94A3B8', fil: '#CBD5E1' },
  yes: { glass: '#FFFBEB', glass2: '#FCD34D', stroke: '#F59E0B', dash: null, ink: '#78350F', fil: '#B45309' },
  no: { glass: '#F1F5F9', glass2: '#CBD5E1', stroke: '#94A3B8', dash: null, ink: '#475569', fil: '#94A3B8' },
};

/** La silhouette du verre (viewBox 0 0 48 60) : un globe qui se resserre vers le culot. */
const GLASS_PATH = 'M17 40 C17 34 7 31 7 21 A17 17 0 0 1 41 21 C41 31 31 34 31 40 Z';

export default function BulbFigure({ state = 'closed', label, size = 48, className = '', ...rest }) {
  const uid = useId().replace(/:/g, '');
  const L = LOOK[state] ?? LOOK.closed;
  const on = state === 'yes';
  const h = Math.round(size * 1.25);
  return (
    <svg width={size} height={h} viewBox="0 0 48 60" aria-hidden="true" className={`overflow-visible ${className}`}
      style={{ direction: 'ltr' }} data-bulb={state} {...rest}>
      <defs>
        <radialGradient id={`${uid}-g`} cx="0.4" cy="0.35" r="0.75">
          <stop offset="0" stopColor={L.glass} />
          <stop offset="1" stopColor={L.glass2} />
        </radialGradient>
        <radialGradient id={`${uid}-halo`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FDE68A" stopOpacity="0.95" />
          <stop offset="0.55" stopColor="#FDE68A" stopOpacity="0.45" />
          <stop offset="1" stopColor="#FEF3C7" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* le halo et les rayons (allumée) */}
      <g className="transition-opacity duration-300 motion-reduce:transition-none" style={{ opacity: on ? 1 : 0 }}>
        <circle cx="24" cy="21" r="27" fill={`url(#${uid}-halo)`} />
        {[-60, -30, 0, 30, 60, -90, 90].map((a) => {
          const r = (a - 90) * (Math.PI / 180);
          return (
            <line key={a} x1={24 + Math.cos(r) * 21} y1={21 + Math.sin(r) * 21} x2={24 + Math.cos(r) * 26} y2={21 + Math.sin(r) * 26}
              stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round" />
          );
        })}
      </g>
      {/* le verre */}
      <path d={GLASS_PATH} fill={`url(#${uid}-g)`} stroke={L.stroke} strokeWidth="2" strokeDasharray={L.dash ?? undefined} strokeLinejoin="round" />
      {/* un reflet */}
      <path d="M13 17 A11 11 0 0 1 20 9" fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" opacity={state === 'closed' ? 0.6 : 0.9} />
      {/* le filament, sous le chiffre */}
      <path d="M20 40 L20 33 Q24 29 28 33 L28 40" fill="none" stroke={L.fil} strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
      {/* le culot vissé */}
      <rect x="16.5" y="40" width="15" height="10" rx="2.5" fill="#A5B4FC" stroke="#6366F1" strokeWidth="1.2" />
      <line x1="17" x2="31" y1="43.5" y2="43.5" stroke="#6366F1" strokeWidth="1" opacity="0.7" />
      <line x1="17" x2="31" y1="46.5" y2="46.5" stroke="#6366F1" strokeWidth="1" opacity="0.7" />
      <path d="M20 50 L28 50 L26 54 L22 54 Z" fill="#6366F1" />
      {/* le diviseur, écrit sur le verre */}
      {label != null && (
        <text x="24" y="27" textAnchor="middle" fontSize="17" fontWeight="900" fill={L.ink}
          fontFamily="ui-sans-serif, system-ui, sans-serif" style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{label}</text>
      )}
      {/* la pastille × (éteinte : le reste n'est pas 0) */}
      {state === 'no' && (
        <g>
          <circle cx="39" cy="8" r="7" fill="#64748B" stroke="#FFFFFF" strokeWidth="1.6" />
          <path d="M36 5 L42 11 M42 5 L36 11" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}
