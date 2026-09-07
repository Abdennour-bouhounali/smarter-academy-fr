import React, { useState } from 'react';
import { useDragValue } from '../../../../../common/manip6e';
import BarChart from './BarChart';
import { niceMax, formatValue } from './chartUtils';

/**
 * ReadRuler — la règle qu'on PROMÈNE sur l'axe pour lire une hauteur.
 *
 * Activity: l'élève saisit une règle horizontale et la fait monter ou
 *   descendre le long de l'axe des valeurs ; à chaque hauteur, la règle dit
 *   quelles barres elle dépasse et lesquelles elle ne dépasse pas encore.
 * Mathematical objective: lire une valeur sur un graphique n'est pas choisir
 *   la bonne réponse dans une liste — c'est COMPARER une hauteur à une
 *   graduation. La règle rend ce geste visible et le rend réversible.
 * Student action: un glissement continu sur la règle elle-même (jamais un
 *   `+`/`−`, jamais un curseur posé à côté — INTERACTION_PEDAGOGY §16).
 * Mathematical state: UN nombre, la hauteur de la règle. Les barres
 *   dépassées, le compte affiché et le trait dessiné en dérivent tous.
 * Expected observation: en montant lentement, les barres « s'éteignent » une
 *   à une, dans l'ordre de leur hauteur — la plus petite d'abord. La règle
 *   trie donc les données sans qu'on lise un seul nombre, et la dernière à
 *   résister est le maximum.
 * Misconception targeted: « la hauteur d'une barre se devine à l'œil ». En
 *   amenant la règle exactement au sommet d'une barre, l'élève constate que
 *   ce sommet tombe sur une valeur PRÉCISE, parfois entre deux graduations.
 * Formalization: aucune. Le composant n'emploie aucun mot que la leçon
 *   enseigne ; les modules posent leurs briques après le geste.
 *
 * POURQUOI UNE RÈGLE ET PAS UNE SONDE VERTICALE (le `GraphProbe` de la 3e) :
 * en 3e la courbe est continue et la question est « à telle heure, quelle
 * altitude ? ». Ici les catégories sont DISCRÈTES (des jours, des activités)
 * : promener une sonde entre lundi et mardi n'aurait aucun sens
 * mathématique. Le geste juste, au niveau 6e, est de balayer l'axe des
 * VALEURS — c'est-à-dire de comparer, ce qui est exactement le programme de
 * la leçon. La qualité du GraphProbe est reprise ; son interaction ne l'est
 * pas (§6bis.2 : « cinq échecs, pas un succès »).
 *
 * SÉCURITÉ VISUELLE (§17bis) : la lecture vit dans le DOM sous le dessin, pas
 * dans un `<text>` SVG — deux valeurs proches ne peuvent donc jamais se
 * chevaucher. La règle est calée sur la même échelle que le diagramme
 * (`niceMax` avec les mêmes arguments), si bien qu'elle ne peut pas sortir
 * du cadre ni désigner une hauteur que le dessin ne montre pas.
 */

/* Doit rester synchronisé avec BarChart : c'est la même géométrie de tracé,
   donc la règle tombe exactement sur les mêmes pixels que les barres. */
const PLOT = { top: 18, bottom: 196 };
const VB_H = 240;

export default function ReadRuler({
  series,
  value,
  onChange,
  step = 5,
  ruleStep = 1,
  tone = 'sky',
  title = '',
  axisLabel = '',
  axisFloor = 0,
  /** Ligne de lecture sous la figure ; le module décide de ce qu'elle dit. */
  readout = null,
}) {
  // Le focus allume un anneau sur la pastille VISIBLE de la règle : la zone de
  // captation de 44 px, elle, n'est plus bordée par le navigateur.
  const [focused, setFocused] = useState(false);

  const max = niceMax(series, step, axisFloor);

  // La règle se déplace en VALEURS, de 0 au sommet de l'axe : sa position en
  // pixels se déduit de la valeur, jamais l'inverse.
  const drag = useDragValue({
    value,
    onChange,
    min: 0,
    max,
    step: ruleStep,
    axis: 'y',
    ariaLabel: 'Règle de lecture — tire-la vers le haut ou vers le bas',
    valueText: (v) => `${formatValue(series, v)} : ${series.values.filter((x) => x >= v).length} barre(s) atteignent cette hauteur`,
  });

  // Le pourcentage de la course occupé par la zone de tracé, pour que la
  // poignée tombe exactement sur la graduation qu'elle annonce.
  const plotTop = (PLOT.top / VB_H) * 100;
  const plotH = ((PLOT.bottom - PLOT.top) / VB_H) * 100;
  const ratio = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  const topPct = plotTop + plotH * (1 - ratio);

  const atOrAbove = series.values.filter((v) => v >= value).length;

  return (
    <div className="space-y-3">
      <div
        {...drag.frameProps}
        className="relative"
        style={{ ...drag.frameProps.style }}
        role="group"
        aria-label="Diagramme avec une règle de lecture"
      >
        <BarChart
          series={series}
          step={step}
          tone={tone}
          title={title}
          axisLabel={axisLabel}
          axisFloor={axisFloor}
        />

        {/* La règle : un trait qui traverse tout le dessin, et sa poignée. */}
        <div
          className="absolute left-0 right-0 pointer-events-none"
          style={{ top: `${topPct}%` }}
          aria-hidden="true"
        >
          <div className="border-t-2 border-dashed border-rose-500" />
        </div>
        <span
          {...drag.handleProps}
          {...drag.a11yProps}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="absolute right-1 flex items-center justify-end rounded-lg pr-[3px]"
          style={{
            ...drag.handleProps.style,
            top: `calc(${topPct}% - 22px)`,
            height: 44,          // 44 × 44 px pleins : zone tactile réglementaire
            width: 44,
            outline: 'none',
          }}
        >
          {/* §17bis — la pastille est collée au bord DROIT du dessin : les 3 px
              de retrait (`pr-[3px]`) laissent exactement la place à l'anneau,
              qui reste donc dans le cadre à toute hauteur de la règle. */}
          <span
            className={`block rounded-md border-2 border-white shadow-md bg-rose-600 ${
              drag.dragging ? 'scale-110' : ''
            } transition-transform`}
            style={{
              width: 26,
              height: 14,
              ...(focused
                ? { boxShadow: 'inset 0 0 0 3px #fff1f2, 0 0 0 3px #be123c' }
                : {}),
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
        <p className="font-mono text-sm text-slate-800">
          Règle à <strong className="text-rose-700">{formatValue(series, value)}</strong> —{' '}
          <strong>{atOrAbove}</strong> barre{atOrAbove > 1 ? 's' : ''} sur {series.values.length}{' '}
          {atOrAbove > 1 ? 'atteignent' : 'atteint'} cette hauteur
        </p>
        {readout}
      </div>
    </div>
  );
}
