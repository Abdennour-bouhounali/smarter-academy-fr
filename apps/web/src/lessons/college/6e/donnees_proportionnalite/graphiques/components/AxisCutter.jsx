import React, { useState } from 'react';
import { useDragValue } from '../../../../../common/manip6e';
import BarChart from './BarChart';
import { formatValue } from './chartUtils';

/**
 * AxisCutter — l'élève TRONQUE l'axe lui-même, et fabrique le mensonge.
 *
 * Activity: l'élève saisit le bas de l'axe et le fait monter. Les nombres ne
 *   bougent pas d'un iota ; seule la portion d'axe affichée rétrécit. Sous
 *   ses doigts, un écart de 4 points devient une falaise.
 * Mathematical objective: comprendre qu'un graphique peut être EXACT et
 *   trompeur — et que le coupable n'est ni les données ni les barres, mais
 *   l'endroit où l'axe commence.
 * Student action: un glissement continu sur le pied de l'axe (jamais un
 *   `+`/`−` : la troncature est une grandeur continue, et c'est en la
 *   traversant qu'on voit le mensonge se former progressivement).
 * Mathematical state: UN nombre, `baseValue`. Le dessin, le rapport de
 *   hauteurs affiché et le verdict en dérivent tous — les VALEURS de la
 *   série, elles, ne changent jamais.
 * Expected observation: à 0 les deux barres sont quasi identiques ; en
 *   remontant le pied de l'axe, l'une devient deux, puis cinq, puis dix fois
 *   plus haute que l'autre. Le rapport des hauteurs DESSINÉES est affiché en
 *   direct, à côté du rapport des valeurs RÉELLES, qui ne bouge pas.
 * Misconception targeted: « si les nombres sont justes, le graphique est
 *   honnête ». L'élève vient de fabriquer un contre-exemple de ses mains.
 * Formalization: le nom du trucage (`axe-tronque`) est posé par le module,
 *   après le geste.
 *
 * POURQUOI CE GESTE : le module montrait déjà le graphique truqué et sa
 * version honnête côte à côte, ce qui est bon — mais l'élève ne faisait que
 * CONSTATER. En lui donnant la main sur l'axe, on lui fait produire la
 * déformation : il ne reconnaîtra plus le trucage, il saura comment on le
 * fabrique. C'est le renforcement demandé, pas un remplacement.
 *
 * SÉCURITÉ VISUELLE (§17bis) : le pied de l'axe est borné pour rester
 * strictement sous la plus petite valeur (`maxBase`), si bien qu'aucune barre
 * ne peut disparaître ni devenir de hauteur nulle, à aucune position de la
 * poignée. Les deux rapports vivent dans le DOM, sous la figure.
 */

/* Même géométrie de tracé que BarChart : la poignée tombe donc exactement
   sur le pied de l'axe qu'elle commande. */
const PLOT = { top: 18, bottom: 196 };
const VB_H = 240;

export default function AxisCutter({
  series,
  baseValue,
  onChange,
  step = 5,
  tone = 'rose',
  title = '',
  axisLabel = '',
  readout = null,
}) {
  // Le focus de la poignée : il allume un anneau sur la pastille VISIBLE. La
  // zone de captation, elle, fait 44 px et n'entoure rien — le contour que le
  // navigateur y traçait était donc un grand cadre trompeur.
  const [focused, setFocused] = useState(false);

  const smallest = Math.min(...series.values);
  const largest = Math.max(...series.values);
  // Le pied de l'axe ne peut jamais atteindre la plus petite valeur : la
  // barre la plus courte garde toujours une hauteur visible.
  const maxBase = Math.max(0, smallest - 1);

  const drag = useDragValue({
    value: baseValue,
    onChange,
    min: 0,
    max: maxBase,
    step: 1,
    axis: 'y',
    ariaLabel: 'Pied de l’axe — tire-le vers le haut pour tronquer le graphique',
    valueText: (v) => `l’axe commence à ${v} au lieu de 0`,
  });

  const zeroBased = baseValue === 0;
  // Le rapport des hauteurs DESSINÉES : c'est lui qui ment.
  const drawn = (largest - baseValue) / Math.max(1e-9, smallest - baseValue);
  // Le rapport des valeurs RÉELLES : il ne bouge jamais.
  const real = largest / smallest;

  const plotTop = (PLOT.top / VB_H) * 100;
  const plotH = ((PLOT.bottom - PLOT.top) / VB_H) * 100;
  const ratio = maxBase > 0 ? Math.max(0, Math.min(1, baseValue / maxBase)) : 0;
  // La poignée vit dans le bas du cadre : à 0 elle est au pied du tracé, et
  // elle remonte d'au plus un quart de la hauteur de tracé.
  const topPct = plotTop + plotH * (1 - 0.25 * ratio);

  return (
    <div className="space-y-3">
      <div
        {...drag.frameProps}
        className="relative"
        style={{ ...drag.frameProps.style }}
        role="group"
        aria-label="Diagramme dont le pied de l’axe se règle"
      >
        <BarChart
          series={series}
          step={step}
          zeroBased={zeroBased}
          baseValue={baseValue}
          tone={zeroBased ? 'emerald' : tone}
          title={title}
          axisLabel={axisLabel}
        />

        <span
          {...drag.handleProps}
          {...drag.a11yProps}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="absolute left-0 flex items-center justify-start rounded-lg pl-[3px]"
          style={{
            ...drag.handleProps.style,
            top: `calc(${topPct}% - 22px)`,
            height: 44,     // 44 × 44 px pleins
            width: 44,
            outline: 'none',
          }}
        >
          {/* L'anneau de focus est porté par la pastille VISIBLE, et il apparaît
              au clic comme au clavier — la zone de captation, elle, ne se borde
              jamais.

              §17bis — la pastille est collée au bord GAUCHE du dessin : un
              anneau tracé à l'extérieur sortirait du cadre. L'anneau est donc
              posé en INSET, à l'intérieur du contour blanc de la pastille : il
              reste visible (ardoise sur blanc) et ne déborde jamais, quelle que
              soit la hauteur atteinte par la poignée. */}
          <span
            className={`block rounded-md border-2 border-white shadow-md bg-slate-800 ${
              drag.dragging ? 'scale-110' : ''
            } transition-transform`}
            style={{
              width: 26,
              height: 14,
              ...(focused
                ? { boxShadow: 'inset 0 0 0 3px #f8fafc, 0 0 0 3px #0f172a' }
                : {}),
            }}
          />
        </span>
      </div>

      {/* Les deux rapports, côte à côte : l'un ment, l'autre pas. */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 text-center">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
            Les vrais nombres
          </p>
          <p className="font-mono text-sm font-black text-slate-800 tabular-nums">
            {formatValue(series, smallest)} et {formatValue(series, largest)}
          </p>
          <p className="text-xs text-slate-500">
            rapport ×{real.toFixed(2).replace('.', ',')} — inchangé
          </p>
        </div>
        <div
          className={`rounded-xl border-2 px-3 py-2.5 text-center ${
            zeroBased ? 'border-emerald-300 bg-emerald-50' : 'border-rose-300 bg-rose-50'
          }`}
        >
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
            Ce que l’œil voit
          </p>
          <p
            className={`font-mono text-sm font-black tabular-nums ${
              zeroBased ? 'text-emerald-800' : 'text-rose-700'
            }`}
          >
            une barre ×{drawn.toFixed(2).replace('.', ',')} l’autre
          </p>
          <p className="text-xs text-slate-500">
            {zeroBased ? 'axe depuis 0 : honnête' : `axe coupé à ${baseValue}`}
          </p>
        </div>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        L’axe commence à {baseValue}. Les hauteurs dessinées sont dans un rapport de{' '}
        {drawn.toFixed(2)}, alors que les valeurs réelles sont dans un rapport de {real.toFixed(2)}.
      </p>

      {readout}
    </div>
  );
}
