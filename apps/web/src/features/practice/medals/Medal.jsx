import { useId } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * UNE MÉDAILLE dessinée en SVG (aucune image) — or, argent ou bronze.
 * Le ruban reprend le vert, le blanc et le rouge du drapeau algérien ; le disque
 * porte une étoile ; un reflet le traverse (`shine`), sauf en mouvement réduit.
 */
const METAL = {
  gold: ['#fff7c2', '#f5c518', '#a87400', '#7a5400'],
  silver: ['#ffffff', '#d5dce4', '#8d99a6', '#5f6b78'],
  bronze: ['#ffe0c2', '#d0843c', '#8a4f1c', '#5e3410'],
};

export default function Medal({ medal, size = 48, shine = false, title }) {
  const id = useId().replace(/:/g, '');
  const reduced = useReducedMotion();
  const [light, base, dark, edge] = METAL[medal] ?? METAL.bronze;
  const h = Math.round(size * 1.3);

  return (
    <svg width={size} height={h} viewBox="0 0 100 130" role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : 'true'} data-medal={medal}>
      <defs>
        <radialGradient id={`m${id}`} cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor={light} />
          <stop offset="55%" stopColor={base} />
          <stop offset="100%" stopColor={dark} />
        </radialGradient>
        <clipPath id={`c${id}`}><circle cx="50" cy="86" r="37" /></clipPath>
      </defs>
      {/* Le ruban : vert / blanc / rouge. */}
      <polygon points="22,0 46,0 58,52 40,58" fill="#006233" />
      <polygon points="54,0 78,0 60,58 42,52" fill="#d21034" />
      <polygon points="45,0 55,0 53,40 47,40" fill="#ffffff" opacity="0.92" />
      {/* Le disque. */}
      <circle cx="50" cy="86" r="40" fill={edge} />
      <circle cx="50" cy="86" r="37" fill={`url(#m${id})`} />
      <circle cx="50" cy="86" r="29" fill="none" stroke={dark} strokeOpacity="0.55" strokeWidth="2.2" />
      <path
        d="M50 64 L56.2 78.4 L71.7 79.6 L59.9 89.6 L63.6 104.8 L50 96.6 L36.4 104.8 L40.1 89.6 L28.3 79.6 L43.8 78.4 Z"
        fill={light}
        stroke={dark}
        strokeOpacity="0.5"
        strokeWidth="1.5"
      />
      {shine && !reduced && (
        <g clipPath={`url(#c${id})`}>
          <motion.rect
            x="-40" y="40" width="22" height="100" fill="#ffffff" opacity="0.55" transform="rotate(20 50 86)"
            initial={{ x: -40 }}
            animate={{ x: 140 }}
            transition={{ duration: 1.1, delay: 0.45, ease: 'easeInOut' }}
          />
        </g>
      )}
    </svg>
  );
}
