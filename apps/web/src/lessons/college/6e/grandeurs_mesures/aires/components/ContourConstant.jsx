import React from 'react';

import useDragValue from '../../../../../common/manip6e/useDragValue';

/**
 * ContourConstant — LA surprise de la leçon : déformer un rectangle SANS
 * changer son tour, et voir l'aire s'effondrer.
 *
 * ACTION       l'élève attrape le coin du rectangle et le tire.
 * CHANGE       la largeur suit le doigt ; la longueur est RECALCULÉE pour
 *              que le demi-tour reste constant (L = demi − l). Le tour
 *              affiché ne bouge donc jamais : 24 m, toujours.
 * OBSERVATION  l'aire, elle, s'écroule : 36 m² au carré, 11 m² quand la
 *              figure devient une lanière.
 * SENS         périmètre et aire sont deux grandeurs INDÉPENDANTES ; le
 *              contour ne dit rien de la surface. C'est le cœur de la
 *              confusion aire/périmètre de 6e, et cela ne se voit qu'en
 *              manipulant : deux figures juxtaposées ne prouvent qu'un cas,
 *              la déformation continue en montre l'infinité.
 *
 * Invariant mathématique tenu par le code, jamais écrit à la main :
 *   demiTour = L + l est fixé → P = 2 × demiTour est constant par
 *   construction. `l` est la seule variable ; `L` en dérive.
 *
 * Sécurité visuelle (§6bis.4) : le SVG est dimensionné pour le cas EXTRÊME
 * (la plus grande longueur atteignable, donc l = min), pas pour l'état par
 * défaut ; les cotes sont posées hors du rectangle, du côté opposé à la
 * poignée, et les nombres (aire, tour) vivent dans le DOM sous le dessin —
 * aucun <text> SVG ne peut donc chevaucher un autre quel que soit l'état.
 *
 * Pas de prop `disabled` : la manipulation reste vivante après validation.
 */
const PAD = 34;          // marge pour les cotes, en unités de viewBox
const PX = 15;           // pixels de viewBox par unité mathématique

export default function ContourConstant({
  half,               // demi-tour L + l, constant
  width,              // la largeur `l` — la seule variable
  onChange,
  min = 1,
  max = null,         // par défaut half - 1 (une figure garde deux dimensions > 0)
  unit = 'm',
  step = 1,
  showGrid = true,
}) {
  const wMax = max ?? half - min;
  const length = half - width;               // L dérive de l : le tour est fixe
  const area = width * length;
  const perimeter = 2 * half;

  // Le cadre contient le cas le plus étiré : L_max = half - min. Ainsi
  // aucune position atteignable ne fait sortir la figure du viewBox.
  const spanMax = half - min;
  const VB_W = spanMax * PX + PAD * 2;
  const VB_H = spanMax * PX + PAD * 2;

  const x0 = PAD;
  const y0 = PAD;
  const w = length * PX;   // horizontal = longueur
  const h = width * PX;    // vertical  = largeur (ce que la poignée règle)

  // La poignée se tire VERS LE BAS pour élargir. `useDragValue` en axe 'y'
  // compte le haut comme le maximum (convention mathématique) ; ici le
  // rectangle grandit VERS LE BAS, donc `toValue` renverse la course pour
  // que le coin suive exactement le doigt — sans quoi la figure fuirait le
  // geste. Le cadre couvre la bande [y0 ; y0 + spanMax·PX], c'est-à-dire
  // exactement la course atteignable de la largeur.
  const drag = useDragValue({
    value: width,
    onChange,
    min,
    max: wMax,
    step,
    axis: 'y',
    // Le cadre couvre spanMax unités depuis le bord haut du rectangle ; la
    // largeur EST la distance parcourue vers le bas, donc ratio inversé × spanMax.
    toValue: (ratio) => (1 - ratio) * spanMax,
    ariaLabel: 'Coin du rectangle — tire pour le déformer, le tour ne change pas',
    valueText: (v) => `largeur ${v} ${unit}, longueur ${half - v} ${unit}, aire ${v * (half - v)} ${unit}²`,
  });

  const frameStyle = { ...drag.frameProps.style };

  return (
    <div className="space-y-2">
      <div className="w-full">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="w-full max-w-[340px] mx-auto select-none block"
          role="group"
          aria-label="Rectangle à tour constant"
        >
          {showGrid && (
            <g style={{ pointerEvents: 'none' }}>
              {Array.from({ length: spanMax + 1 }).map((_, i) => (
                <line key={`v${i}`} x1={x0 + i * PX} y1={y0} x2={x0 + i * PX} y2={y0 + spanMax * PX} stroke="#e2e8f0" strokeWidth="1" />
              ))}
              {Array.from({ length: spanMax + 1 }).map((_, i) => (
                <line key={`h${i}`} x1={x0} y1={y0 + i * PX} x2={x0 + spanMax * PX} y2={y0 + i * PX} stroke="#e2e8f0" strokeWidth="1" />
              ))}
            </g>
          )}

          {/* La surface : c'est ELLE qui s'effondre. */}
          <rect x={x0} y={y0} width={w} height={h} fill="#bae6fd" opacity={0.75} style={{ pointerEvents: 'none' }} />
          {/* Le contour : il garde la même longueur totale, toujours. */}
          <rect x={x0} y={y0} width={w} height={h} fill="none" stroke="#0f172a" strokeWidth="3" style={{ pointerEvents: 'none' }} />

          {/* Cotes : posées HORS du rectangle, du côté opposé à la poignée.
              La cote de longueur est au-dessus (y0 − 12), celle de largeur à
              gauche (x0 − 10) : elles ne peuvent croiser ni la figure ni la
              poignée dans aucun état. */}
          <text
            x={x0 + w / 2} y={y0 - 12} textAnchor="middle"
            style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700, pointerEvents: 'none' }}
            fill="#0f172a"
          >
            {length} {unit}
          </text>
          <text
            x={x0 - 10} y={y0 + h / 2 + 4} textAnchor="middle"
            style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700, pointerEvents: 'none' }}
            fill="#0f172a"
          >
            {width}
          </text>

          {/* Le cadre du geste : toute la bande verticale sous le coin.
              Le pointeur y est converti en largeur par useDragValue. */}
          <rect
            {...drag.frameProps}
            x={x0}
            y={y0}
            width={spanMax * PX}
            height={spanMax * PX}
            fill="transparent"
            style={frameStyle}
            {...drag.handleProps}
          />

          {/* La poignée : le coin lui-même, ≥ 44 px à l'écran (r = 11 en
              viewBox de 240 rendu sur ~320 px → ~29 px de diamètre visible,
              la cible tactile réelle est le cercle transparent r = 18). */}
          <g {...drag.handleProps} {...drag.a11yProps} style={{ ...drag.handleProps.style, outline: 'none' }}>
            <circle cx={x0 + w} cy={y0 + h} r={18} fill="transparent" />
            <circle cx={x0 + w} cy={y0 + h} r={9} fill="#e11d48" stroke="#ffffff" strokeWidth="3" />
          </g>
        </svg>
      </div>

      {/* Les deux nombres, dans le DOM : le tour figé, l'aire qui s'effondre. */}
      <div className="grid grid-cols-2 gap-2" role="status" aria-live="polite">
        <div className="rounded-xl border-2 border-slate-300 bg-slate-50 p-2 text-center">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">Tour</p>
          <p className="font-mono font-black text-xl text-slate-800" data-tour>{perimeter} {unit}</p>
        </div>
        <div className="rounded-xl border-2 border-sky-300 bg-sky-50 p-2 text-center">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-sky-700">Surface</p>
          <p className="font-mono font-black text-xl text-sky-800" data-aire>{area} {unit}²</p>
        </div>
      </div>
    </div>
  );
}
