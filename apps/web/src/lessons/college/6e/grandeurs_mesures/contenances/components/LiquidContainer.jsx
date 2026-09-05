import React, { useId } from 'react';
import { motion } from 'framer-motion';

/**
 * LiquidContainer — récipient animé (verre, bouteille, cruche, seau, cuve)
 * dont le niveau de liquide est purement proportionnel à `fillPct`
 * (0 → vide, 1 → plein). Le remplissage reste volontairement LINÉAIRE quel
 * que soit le profil du récipient : l'objectif 6e n'est pas de modéliser
 * la physique d'un col étroit, mais de montrer qu'un même récipient peut
 * être plus ou moins rempli, et que des récipients de formes différentes
 * ne se comparent pas « à l'œil ».
 *
 * Rendu « verre » : corps translucide avec reflet, eau en dégradé avec
 * ménisque qui dérive lentement, ombre portée. Aucune physique réelle.
 *
 * Props (toutes optionnelles sauf shape/fillPct) :
 *  - shape        'glass' | 'bottle' | 'jug' | 'bucket' | 'cube' | 'tank' | 'tall' | 'bowl'
 *  - fillPct      0..1
 *  - graduations  [{ pct, label }] — repères sur la paroi (lecture d'un récipient gradué)
 *  - overflowing  l'eau déborde par le bord (gouttes + nappe qui coule dehors)
 *  - streamIn     un filet tombe d'au-dessus du bord dans le récipient (pendant un transvasement)
 *  - ripple       la surface ondule plus fort (juste après un versement)
 *  - color        teinte de l'eau
 *  - height       hauteur rendue en px (viewBox 160×210)
 *  - label        texte sous le récipient ; ariaLabel pour l'accessibilité
 */
const SHAPES = {
  glass: {
    body: 'M36,40 L28,178 Q28,190 40,190 L120,190 Q132,190 132,178 L124,40 Z',
    top: 40, streamX: 72,
  },
  bottle: {
    body: 'M64,8 L96,8 L96,42 Q136,50 136,72 L136,176 Q136,190 122,190 L38,190 Q24,190 24,176 L24,72 Q24,50 64,42 Z',
    top: 8, streamX: 80,
    extras: [{ d: 'M60,8 L100,8', w: 4 }], // bague du goulot
  },
  jug: {
    body: 'M16,54 L12,176 Q12,190 26,190 L124,190 Q138,190 138,176 L134,54 Z',
    top: 54, streamX: 60,
    extras: [
      { d: 'M138,84 Q166,86 166,122 Q166,158 138,162', w: 5 },   // anse
      { d: 'M16,54 L4,44', w: 3 },                                   // bec
    ],
  },
  bucket: {
    body: 'M14,46 L26,180 Q27,190 38,190 L122,190 Q133,190 134,180 L146,46 Z',
    top: 46, streamX: 80, opaque: true,
    extras: [
      { d: 'M8,46 L152,46', w: 6 },                  // cerclage
      { d: 'M20,44 Q80,-4 140,44', w: 3.5, dash: true }, // anse
    ],
  },
  cube: { body: 'M30,190 L30,50 L110,50 L110,190 Z', top: 50, streamX: 70 },
  // récipients « inconnus » de l'enquête (module 1, étape 2) : même volume visuel trompeur
  tall: {
    body: 'M54,14 L54,176 Q54,190 68,190 L92,190 Q106,190 106,176 L106,14 Z',
    top: 14, streamX: 80, lip: { right: [106 / 160, 14 / 210], left: [54 / 160, 14 / 210] },
  },
  bowl: {
    body: 'M6,96 L14,172 Q18,190 40,190 L120,190 Q142,190 146,172 L154,96 Z',
    top: 96, streamX: 80, lip: { right: [154 / 160, 96 / 210], left: [6 / 160, 96 / 210] },
  },
};
/** Position (fractions de la boîte) des lèvres d'un récipient — pivot quand il verse. */
export const containerLip = (shape, side) => (SHAPES[shape]?.lip ?? { right: [0.775, 40 / 210], left: [0.225, 40 / 210] })[side];
SHAPES.tank = SHAPES.cube;

const VIEW_BOTTOM = 190;
const WAVE = Array.from({ length: 6 }, () => 'q10,-3 20,0 t20,0').join(' ');

export default function LiquidContainer({
  shape = 'glass',
  fillPct = 0,
  overflowing = false,
  streamIn = false,
  ripple = false,
  label = null,
  graduations = [],
  color = '#38bdf8',
  height = 220,
  ariaLabel = 'Récipient',
}) {
  const uid = useId();
  const S = SHAPES[shape] ?? SHAPES.glass;
  const top = S.top;
  const bottom = VIEW_BOTTOM;
  const totalH = bottom - top;
  const pct = Math.max(0, Math.min(1, fillPct));
  const liquidY = bottom - pct * totalH;
  const spring = { type: 'spring', stiffness: 110, damping: 16 };

  return (
    <div className="flex flex-col items-center gap-1.5" role="img" aria-label={ariaLabel}>
      <svg viewBox="0 0 160 210" style={{ height }} className="select-none overflow-visible">
        <defs>
          <clipPath id={`${uid}-c`}><path d={S.body} /></clipPath>
          <linearGradient id={`${uid}-g`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ffffff" stopOpacity={S.opaque ? 0.95 : 0.6} />
            <stop offset="0.5" stopColor="#f0f9ff" stopOpacity={S.opaque ? 0.9 : 0.22} />
            <stop offset="1" stopColor="#cbd5e1" stopOpacity={S.opaque ? 0.95 : 0.5} />
          </linearGradient>
          <linearGradient id={`${uid}-w`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity="0.55" />
            <stop offset="0.5" stopColor={color} stopOpacity="0.8" />
            <stop offset="1" stopColor="#0c4a6e" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id={`${uid}-s`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#bae6fd" stopOpacity="0.9" />
            <stop offset="1" stopColor={color} stopOpacity="0.75" />
          </linearGradient>
        </defs>

        {/* ombre portée */}
        <ellipse cx="80" cy={bottom + 8} rx="58" ry="6" fill="#0f172a" opacity="0.09" />

        {/* corps */}
        <path d={S.body} fill={`url(#${uid}-g)`} stroke="#94a3b8" strokeWidth="2.5" strokeLinejoin="round" />

        {/* eau, clippée à la silhouette */}
        <g clipPath={`url(#${uid}-c)`}>
          <motion.g initial={false} animate={{ y: liquidY, opacity: pct > 0 ? 1 : 0 }} transition={spring}>
            <rect x="0" y="0" width="160" height="300" fill={`url(#${uid}-w)`} />
            <motion.g initial={false} animate={{ scaleY: ripple ? 2 : 1 }} transition={{ duration: 0.3 }} style={{ originY: '0px' }}>
              <g className="lc-wave">
                <path d={`M-60,0 ${WAVE} V12 H-60 Z`} fill="#0c4a6e" opacity="0.3" />
                <path d={`M-60,1 ${WAVE}`} fill="none" stroke="#ffffff" strokeWidth="1.4" opacity="0.6" />
              </g>
            </motion.g>
          </motion.g>
          {/* reflet vertical */}
          {!S.opaque && <rect x="34" y={top + 6} width="8" height={bottom - top - 14} rx="4" fill="#ffffff" opacity="0.3" />}
          {S.opaque && <rect x="34" y={top + 10} width="6" height={bottom - top - 22} rx="3" fill="#ffffff" opacity="0.5" />}
        </g>

        {/* anse / bec / cerclage */}
        {S.extras?.map((e, i) => (
          <path key={i} d={e.d} fill="none" stroke="#94a3b8" strokeWidth={e.w} strokeLinecap="round" strokeDasharray={e.dash ? undefined : undefined} />
        ))}

        {/* filet entrant (transvasement) */}
        {streamIn && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.rect x={S.streamX - 3.5} y={top - 34} width="7" rx="3.5" fill={`url(#${uid}-s)`} initial={false} animate={{ height: Math.max(6, liquidY - (top - 34)) }} transition={spring} />
            <motion.line className="lc-flow" x1={S.streamX} y1={top - 32} x2={S.streamX} initial={false} animate={{ y2: liquidY }} transition={spring} stroke="#ffffff" strokeWidth="1.8" strokeDasharray="4 8" opacity="0.7" strokeLinecap="round" />
            {[0, 1, 2].map((i) => (
              <motion.circle key={i} cx={S.streamX + (i - 1) * 8} r="2.2" fill="#bae6fd" initial={{ cy: liquidY - 4, opacity: 0.9 }} animate={{ cy: liquidY - 22 - i * 5, opacity: 0 }} transition={{ repeat: Infinity, duration: 0.55, delay: i * 0.16, ease: 'easeOut' }} />
            ))}
          </motion.g>
        )}

        {/* graduations */}
        {graduations.map((g, i) => {
          const y = bottom - g.pct * totalH;
          return (
            <g key={i}>
              <line x1={18} y1={y} x2={34} y2={y} stroke="#64748b" strokeWidth="2" />
              {g.label && (
                <text x={12} y={y + 4} textAnchor="end" style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 700 }} fill="#475569">
                  {g.label}
                </text>
              )}
            </g>
          );
        })}

        {/* débordement : nappe qui passe le bord + gouttes dehors */}
        {overflowing && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.path d={`M12,${top} q-6,14 -4,30`} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" opacity="0.7" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4 }} />
            <motion.path d={`M148,${top} q6,14 4,30`} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" opacity="0.7" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.1 }} />
            {[0, 1, 2, 3].map((i) => (
              <motion.circle key={i} cx={i % 2 ? 150 + i * 3 : 8 - i * 2} r="3.2" fill={color} initial={{ cy: top + 20, opacity: 0.9 }} animate={{ cy: top + 70 + i * 8, opacity: 0 }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.18, ease: 'easeIn' }} />
            ))}
          </motion.g>
        )}
      </svg>
      {label && <div className="font-mono text-sm font-bold text-slate-700 tabular-nums">{label}</div>}
      <style>{`
        @keyframes lc-wave { from { transform: translateX(0); } to { transform: translateX(-40px); } }
        .lc-wave { animation: lc-wave 2.6s linear infinite; }
        @keyframes lc-flow { to { stroke-dashoffset: -24; } }
        .lc-flow { animation: lc-flow 0.45s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .lc-wave, .lc-flow { animation: none; } }
      `}</style>
    </div>
  );
}
