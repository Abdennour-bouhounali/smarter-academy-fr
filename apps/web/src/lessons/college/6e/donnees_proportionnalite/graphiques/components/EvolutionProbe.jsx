import React, { useState } from 'react';
import { useDragValue } from '../../../../../common/manip6e';
import { niceMax, axisTicks, valueToY, formatValue, variation } from './chartUtils';

/**
 * EvolutionProbe — la sonde qu'on PROMÈNE le long de la ligne d'évolution.
 *
 * Activity: l'élève saisit un curseur posé SUR la ligne et le fait glisser
 *   d'un relevé au suivant. À chaque pas, la sonde annonce d'où l'on vient,
 *   où l'on arrive, et si le trajet monte ou descend — et de combien.
 * Mathematical objective: une évolution n'est pas une propriété d'un point,
 *   c'est une propriété d'un PASSAGE entre deux relevés. Tant que la ligne
 *   est immobile, « ça monte » reste une impression d'ensemble ; en la
 *   parcourant pas à pas, l'élève constate que le sens change de segment en
 *   segment et qu'il se lit toujours en comparant à la valeur PRÉCÉDENTE.
 * Student action: un glissement continu sur le curseur lui-même (jamais de
 *   `+`/`−`, jamais de curseur natif posé à côté — INTERACTION_PEDAGOGY §16).
 * Controlled variable: la position de la sonde le long de l'axe horizontal,
 *   en dixièmes de relevé — assez fin pour que le geste soit continu, assez
 *   discret pour que la sonde s'accroche visiblement aux relevés.
 * Mathematical state: UN nombre, `pos`. Le segment survolé, le sens de la
 *   variation, l'écart chiffré et le trait épaissi en DÉRIVENT tous
 *   (`variation` de chartUtils) : le texte et le dessin ne peuvent donc pas
 *   se contredire.
 * Visual consequence: le segment sous la sonde s'épaissit et se colore selon
 *   son sens ; le point de départ et le point d'arrivée du passage
 *   s'entourent. Aux extrémités exactes, la sonde est POSÉE sur un relevé et
 *   annonce sa valeur au lieu d'un passage.
 * Expected observation: « la ligne monte trois fois et descend deux fois, et
 *   la plus forte montée n'est pas là où la température est la plus haute ».
 * Misconception targeted: « une valeur haute = une hausse ». En amenant la
 *   sonde sur le dernier segment (jeudi → vendredi : 24 → 20), l'élève lit
 *   « ça descend » alors que 20 °C reste une valeur élevée : la sonde
 *   dissocie la HAUTEUR du point de la PENTE du segment, sur la même figure.
 * Formalization: aucune. Le composant n'emploie que « monte / descend » et
 *   « écart », le langage courant ; les mots de la leçon sont posés par les
 *   briques du module, après le geste.
 *
 * POURQUOI CETTE SONDE ET NON CELLE DE LA 3e (`GraphProbe`) : en 3e la sonde
 * parcourt une COURBE continue et répond « à telle heure, quelle altitude »
 * — une lecture d'image, qui suppose la notion de fonction. Ici les relevés
 * sont DISCRETS (des jours) et rien n'existe entre mardi et mercredi : la
 * sonde ne lit donc pas une valeur intermédiaire, elle désigne un PASSAGE
 * d'un relevé au suivant. Le geste de la 3e est repris ; ce qu'il lit ne
 * l'est pas (§6bis.2). Aucune valeur interpolée n'est jamais affichée.
 *
 * SÉCURITÉ VISUELLE (§17bis) : toutes les lectures vivent dans le DOM sous la
 * figure, jamais en `<text>` SVG — deux étiquettes proches ne peuvent donc
 * pas se chevaucher. La poignée est bornée à la course des relevés et son
 * anneau de focus est logé DANS le cadre (marge `PLOT.right`), si bien
 * qu'aucune position atteignable ne la fait déborder.
 */
const VB = { w: 340, h: 230 };
const PLOT = { left: 42, right: 22, top: 18, bottom: 186 };

/** Dixièmes de relevé : le geste est continu, l'accrochage reste lisible. */
const SUB = 10;

export default function EvolutionProbe({
  series,
  /** Position de la sonde, en dixièmes de relevé (0 → (n-1) * SUB). */
  pos,
  onChange,
  step = 5,
  title = '',
  axisLabel = '',
  /** Ligne de lecture supplémentaire, décidée par le module. */
  readout = null,
}) {
  const [focused, setFocused] = useState(false);

  const n = series.categories.length;
  const max = niceMax(series, step);
  const ticks = axisTicks(series, step);
  const dx = (VB.w - PLOT.left - PLOT.right) / Math.max(1, n - 1);

  const px = (i) => PLOT.left + dx * i;
  const py = (v) => valueToY(v, max, PLOT.top, PLOT.bottom);

  const maxPos = (n - 1) * SUB;
  const t = Math.max(0, Math.min(maxPos, pos)) / SUB;   // en relevés, réels
  const onNode = Number.isInteger(t);
  // Le segment survolé : celui qui MÈNE au relevé d'indice `to`.
  const to = onNode ? Math.max(1, t) : Math.ceil(t);
  const from = to - 1;
  const v = variation(series, to);

  const drag = useDragValue({
    value: pos,
    onChange,
    min: 0,
    max: maxPos,
    step: 1,
    axis: 'x',
    ariaLabel: 'Sonde — promène-la le long de la ligne, d’un relevé au suivant',
    valueText: () =>
      onNode
        ? `posée sur ${series.categories[t]} : ${formatValue(series, series.values[t])}`
        : `entre ${series.categories[from]} et ${series.categories[to]} : ça ${
          v.direction === 'hausse' ? 'monte' : v.direction === 'baisse' ? 'descend' : 'ne bouge pas'
        }`,
  });

  // La sonde vit sur la ligne : son ordonnée est celle du segment survolé.
  const probeX = px(t);
  const probeY = onNode
    ? py(series.values[t])
    : py(series.values[from]) + (py(series.values[to]) - py(series.values[from])) * (t - from);

  const toneOf = (d) => (d === 'hausse' ? '#059669' : d === 'baisse' ? '#e11d48' : '#64748b');
  const readAll = series.categories
    .map((c, i) => `${c} : ${formatValue(series, series.values[i])}`)
    .join(', ');

  // Position de la poignée en pourcentage du cadre : le DOM la superpose au
  // point de la ligne qu'elle commande, à toute position atteignable.
  const leftPct = (probeX / VB.w) * 100;
  const topPct = (probeY / VB.h) * 100;

  return (
    <div className="space-y-3">
      {title && <p className="text-center text-sm font-semibold text-slate-700">{title}</p>}

      <div
        {...drag.frameProps}
        className="relative w-full max-w-md mx-auto"
        style={{ ...drag.frameProps.style }}
        role="group"
        aria-label="Ligne d’évolution avec une sonde à promener"
      >
        <svg viewBox={`0 0 ${VB.w} ${VB.h}`} className="w-full block" role="img" aria-label={`${title || 'Évolution'}. ${readAll}.`}>
          <g pointerEvents="none">
            {ticks.map((tv) => (
              <g key={tv}>
                <line x1={PLOT.left} y1={py(tv)} x2={VB.w - PLOT.right} y2={py(tv)} stroke="#e2e8f0" strokeWidth="1" />
                <text x={PLOT.left - 6} y={py(tv) + 4} textAnchor="end" fontSize="10" fill="#64748b" fontFamily="monospace">
                  {tv}
                </text>
              </g>
            ))}
            <line x1={PLOT.left} y1={PLOT.top} x2={PLOT.left} y2={PLOT.bottom} stroke="#334155" strokeWidth="1.5" />
            <line x1={PLOT.left} y1={PLOT.bottom} x2={VB.w - PLOT.right} y2={PLOT.bottom} stroke="#334155" strokeWidth="1.5" />
            {axisLabel && <text x={4} y={12} fontSize="10" fill="#475569" fontFamily="monospace">{axisLabel}</text>}

            {/* Les segments. Celui que la sonde parcourt est épaissi : le
                dessin ne peut désigner que le passage réellement survolé. */}
            {series.values.slice(1).map((val, k) => {
              const i = k + 1;
              const dir = variation(series, i)?.direction;
              const active = i === to;
              return (
                <line
                  key={series.categories[i]}
                  x1={px(i - 1)} y1={py(series.values[i - 1])}
                  x2={px(i)} y2={py(val)}
                  stroke={toneOf(dir)}
                  strokeWidth={active ? 5 : 2.5}
                  strokeOpacity={active ? 1 : 0.35}
                  strokeLinecap="round"
                />
              );
            })}

            {/* Les relevés. Les deux bornes du passage survolé s'entourent. */}
            {series.values.map((val, i) => {
              const border = !onNode && (i === from || i === to);
              return (
                <g key={series.categories[i]}>
                  {border && (
                    <circle cx={px(i)} cy={py(val)} r="9" fill="none" stroke="#0f172a" strokeWidth="1.5" strokeDasharray="3 3" />
                  )}
                  <circle
                    cx={px(i)} cy={py(val)}
                    r={onNode && i === t ? 6 : 4}
                    fill={onNode && i === t ? '#f59e0b' : '#4c1d95'}
                    stroke="white" strokeWidth="1.5"
                  />
                </g>
              );
            })}

            {series.categories.map((c, i) => (
              <text key={c} x={px(i)} y={PLOT.bottom + 16} textAnchor="middle" fontSize="10" fill="#475569">
                {c}
              </text>
            ))}
          </g>
        </svg>

        {/* La poignée : un vrai carré de 44 px centré sur le point de la
            ligne. Elle est posée en DOM par-dessus le dessin, pour que la
            zone tactile ne dépende pas de l'échelle du viewBox. */}
        <span
          {...drag.handleProps}
          {...drag.a11yProps}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="absolute flex items-center justify-center"
          style={{
            ...drag.handleProps.style,
            left: `calc(${leftPct}% - 22px)`,
            top: `calc(${topPct}% - 22px)`,
            width: 44,
            height: 44,
            outline: 'none',
          }}
        >
          <span
            className={`block rounded-full border-[3px] border-white shadow-md ${
              drag.dragging ? 'scale-110' : ''
            } transition-transform`}
            style={{
              width: 20,
              height: 20,
              background: onNode ? '#f59e0b' : toneOf(v?.direction),
              ...(focused ? { boxShadow: '0 0 0 3px #fff, 0 0 0 6px #2563eb' } : {}),
            }}
          />
        </span>
      </div>

      {/* Toute la lecture vit ICI, dans le DOM. */}
      <div
        className="rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2.5 text-center"
        role="status"
        aria-live="polite"
      >
        {onNode ? (
          <p className="font-mono text-sm text-slate-800">
            Sonde posée sur <strong className="text-amber-700">{series.categories[t]}</strong> :{' '}
            <strong>{formatValue(series, series.values[t])}</strong>
          </p>
        ) : (
          <p className="font-mono text-sm text-slate-800">
            <strong>{series.categories[from]}</strong> → <strong>{series.categories[to]}</strong> :{' '}
            {formatValue(series, series.values[from])} → {formatValue(series, series.values[to])} —{' '}
            <strong style={{ color: toneOf(v.direction) }}>
              {v.direction === 'hausse' ? 'ça monte' : v.direction === 'baisse' ? 'ça descend' : 'ça ne bouge pas'}
            </strong>{' '}
            de <strong>{Math.abs(v.delta)}</strong>
          </p>
        )}
        {readout}
      </div>
    </div>
  );
}

/** Les passages (index d'arrivée) que la sonde a réellement survolés. */
export function segmentAt(pos, n) {
  const maxPos = (n - 1) * SUB;
  const t = Math.max(0, Math.min(maxPos, pos)) / SUB;
  if (Number.isInteger(t)) return null;
  return Math.ceil(t);
}

export { SUB as PROBE_SUB };
