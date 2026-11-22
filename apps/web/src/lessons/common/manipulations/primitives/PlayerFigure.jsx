
/**
 * UN JOUEUR — un personnage dessiné, pas un rond.
 *
 * Pourquoi en SVG paramétré et jamais une image générée (root CLAUDE.md) :
 * le joueur RÉAGIT. Il prend la couleur de son équipe au moment où on l'y
 * pose, il se soulève quand on le porte, il baisse la tête quand il reste
 * dehors. Une image plate ne prend pas de props — et un modèle de diffusion
 * ne sait pas dessiner exactement seize joueurs quand le dessin EST
 * l'argument mathématique.
 *
 * Les couleurs d'équipe sont des ensembles INVENTÉS (aucune identité de club
 * réelle, aucun logo, aucun maillot protégé) — brief §9.
 *
 * `mood` reste SOBRE : un joueur sur le banc regarde le sol, il n'est ni
 * humilié ni dramatisé. L'émotion sert à faire remarquer le reste, pas à
 * punir l'élève.
 */

/** Les tenues des équipes : des combinaisons originales, numérotées. */
const TEAM_KITS = [
  { id: 0, shirt: '#4F46E5', shorts: '#312E81', trim: '#C7D2FE' },
  { id: 1, shirt: '#059669', shorts: '#064E3B', trim: '#A7F3D0' },
  { id: 2, shirt: '#EA580C', shorts: '#7C2D12', trim: '#FED7AA' },
  { id: 3, shirt: '#DB2777', shorts: '#831843', trim: '#FBCFE8' },
  { id: 4, shirt: '#0891B2', shorts: '#164E63', trim: '#A5F3FC' },
  { id: 5, shirt: '#7C3AED', shorts: '#4C1D95', trim: '#DDD6FE' },
];

/** La tenue « sans équipe » : gris, visiblement en attente. */
const BENCH_KIT = { shirt: '#CBD5E1', shorts: '#94A3B8', trim: '#F1F5F9' };

/** Trois teints, pour que la scène ressemble à une vraie équipe scolaire. */
const SKINS = ['#F3C9A0', '#C68642', '#8D5524'];

/**
 * `size` accepte un nombre (pixels) ou une largeur CSS (« 100% ») : posé en
 * composition sur le terrain, le joueur prend la largeur de sa case et garde
 * ses proportions grâce au viewBox. Sa hauteur suit donc toute seule.
 */
export default function PlayerFigure({
  index = 0, team = null, size = 44, held = false, benched = false, className = '', title,
}) {
  const responsive = typeof size === 'string';
  const kit = team === null ? BENCH_KIT : TEAM_KITS[team % TEAM_KITS.length];
  const skin = SKINS[index % SKINS.length];
  // Une variation déterministe : deux élèves voient la même scène, un test aussi.
  const stance = index % 3;

  return (
    <svg
      width={responsive ? size : size}
      height={responsive ? undefined : size * 1.35}
      viewBox="0 0 40 54"
      style={responsive ? { width: size, height: 'auto', display: 'block' } : undefined}
      className={`sa-player ${held ? 'sa-player--held' : ''} ${benched ? 'sa-player--benched' : ''} ${className}`}
      role="img"
      aria-hidden={title ? undefined : 'true'}
      aria-label={title}
      focusable="false"
    >
      {title && <title>{title}</title>}

      {/* ombre au sol — ancre le personnage, ne décore pas */}
      <ellipse cx="20" cy="51" rx="11" ry="2.6" fill="#0F172A" opacity=".16" />

      {/* jambes */}
      <path
        d={stance === 1 ? 'M15 36 L13 49 M25 36 L28 49' : stance === 2 ? 'M15 36 L14 49 M25 36 L25 49' : 'M15 36 L15 49 M25 36 L27 49'}
        stroke={skin} strokeWidth="4.4" strokeLinecap="round" fill="none"
      />
      {/* chaussures */}
      <path d="M12 49 L16 49 M25 49 L30 49" stroke="#1E293B" strokeWidth="3.4" strokeLinecap="round" />

      {/* short */}
      <path d="M13 28 L27 28 L26 38 L21 38 L20 32 L19 38 L14 38 Z" fill={kit.shorts} />

      {/* maillot */}
      <path d="M14 15 Q20 13 26 15 L30 18 L28 23 L26 22 L26 30 L14 30 L14 22 L12 23 L10 18 Z" fill={kit.shirt} />
      {/* liseré du maillot — c'est ce qui rend les équipes distinguables d'un coup d'œil */}
      <path d="M17 14 L20 19 L23 14" stroke={kit.trim} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M14 29 L26 29" stroke={kit.trim} strokeWidth="1.4" />

      {/* bras */}
      <path d="M11 19 L8 28 M29 19 L32 28" stroke={skin} strokeWidth="4" strokeLinecap="round" />

      {/* tête — inclinée vers le bas quand le joueur reste sur le banc */}
      <g transform={benched ? 'rotate(9 20 9)' : undefined}>
        <circle cx="20" cy="9" r="6.2" fill={skin} />
        <path d="M14.4 7 Q20 2 25.6 7 Q20 5.4 14.4 7 Z" fill="#27231F" />
        {benched ? (
          <>
            <path d="M17.6 9.6 L18.8 9.6 M21.2 9.6 L22.4 9.6" stroke="#27231F" strokeWidth="1.1" strokeLinecap="round" />
            <path d="M18.2 12.4 Q20 11.5 21.8 12.4" stroke="#27231F" strokeWidth="1" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="18.1" cy="9.2" r="0.85" fill="#27231F" />
            <circle cx="21.9" cy="9.2" r="0.85" fill="#27231F" />
            <path d="M18.2 11.6 Q20 12.9 21.8 11.6" stroke="#27231F" strokeWidth="1" fill="none" strokeLinecap="round" />
          </>
        )}
      </g>
    </svg>
  );
}

/** Le ballon — utilisé comme marqueur de scène, jamais comme décor animé. */
export function FootballIcon({ size = 20, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} role="img" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="10.4" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.5" />
      <path d="M12 6.4 L15.6 9.1 L14.2 13.4 L9.8 13.4 L8.4 9.1 Z" fill="#1E293B" />
      <path d="M12 1.6 L12 6.4 M22.1 9.4 L15.6 9.1 M18.2 20.4 L14.2 13.4 M5.8 20.4 L9.8 13.4 M1.9 9.4 L8.4 9.1"
        stroke="#1E293B" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
