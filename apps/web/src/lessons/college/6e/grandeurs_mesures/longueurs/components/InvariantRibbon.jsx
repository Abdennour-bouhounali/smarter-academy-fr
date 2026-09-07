import React, { useState } from 'react';
import useDragValue from '../../../../../common/manip6e/useDragValue';
import { convert, formatLength } from './lengthUtils';

/**
 * InvariantRibbon — l'élève TIRE sur le bout d'un ruban pour lui donner la
 * longueur qu'il veut, puis change d'unité et regarde le ruban NE PAS BOUGER.
 *
 * ACTION          on saisit l'extrémité droite du ruban et on la déplace :
 *                 la longueur physique change sous le doigt.
 * TRANSFORMATION  la longueur affichée suit le geste, en direct, dans
 *                 l'unité courante — aucun clic de validation entre les deux.
 * SENS MATH.      changer d'UNITÉ n'est pas changer de LONGUEUR. Le ruban est
 *                 posé une fois pour toutes en millimètres (`lengthMm`) ; les
 *                 quatre boutons ne touchent QUE l'écriture du nombre.
 * FEEDBACK        un repère fixe (le trait « ton ruban ») reste collé au bout
 *                 du ruban pendant tout le changement d'unité : si le ruban
 *                 bougeait d'un pixel, le repère le trahirait.
 * GÉNÉRALISATION  une longueur existe indépendamment de l'unité qui la dit.
 *
 * Pourquoi ce composant en plus d'`UnitSwitcher` : dans UnitSwitcher le ruban
 * occupe TOUJOURS toute la largeur, donc « il ne bouge pas » n'est pas
 * observable — rien ne pourrait bouger. Ici la longueur est choisie par
 * l'élève et occupe une fraction quelconque du cadre : le fait qu'elle ne
 * bouge pas devient une VRAIE information, vérifiable à l'œil et au pixel.
 *
 * La largeur du ruban en pixels est fonction de `lengthMm` SEUL — jamais de
 * `unit`. C'est l'invariant du composant, et il est testé en e2e.
 *
 * Aucune prop `disabled` : la manipulation ne se fige jamais après validation
 * de l'étape (règle projet du 2026-09-06).
 */

const UNITS = ['km', 'm', 'cm', 'mm'];

/* Le ruban représente une longueur réelle allant de 10 cm à 4 m. L'échelle
   est fixe : `PX_PER_MM` pixels de cadre pour un millimètre réel. Le cadre
   fait 4 000 mm de large au maximum, ce qui cale le ruban plein cadre. */
const MIN_MM = 100;      // 10 cm
const MAX_MM = 4000;     // 4 m
const FRAME_MM = 4200;   // un peu de marge à droite pour la poignée

export default function InvariantRibbon({
  lengthMm,
  onLengthChange,
  unit,
  onUnitChange,
  changedUnitWhileFixed = false,
}) {
  // Le focus allume un anneau sur la poignée VISIBLE ; le navigateur ne borde
  // plus la zone de captation (elle n'entoure rien de dessiné).
  const [focused, setFocused] = useState(false);

  // Le pas est fin (10 mm = 1 cm) : la longueur est une grandeur CONTINUE,
  // et l'élève doit pouvoir la poser où il veut, pas sur quatre crans.
  const drag = useDragValue({
    value: lengthMm,
    onChange: onLengthChange,
    min: MIN_MM,
    max: MAX_MM,
    step: 10,
    axis: 'x',
    ariaLabel: 'Longueur du ruban : tire le bout pour la changer',
    valueText: (v) => formatLength(convert(v, 'mm', unit), unit),
    // Le cadre porte 4 200 mm ; on convertit un ratio de largeur en mm réels.
    toValue: (r) => r * FRAME_MM,
  });

  // ⚠️ INVARIANT DU COMPOSANT : ce pourcentage ne dépend QUE de lengthMm.
  // `unit` n'apparaît nulle part dans ce calcul, et ne doit jamais y entrer.
  const pct = (lengthMm / FRAME_MM) * 100;
  const shown = convert(lengthMm, 'mm', unit);

  return (
    <div className="space-y-4">
      {/* Le cadre du geste. La piste fait toute la largeur ; le ruban en
          occupe la fraction correspondant à sa longueur réelle. */}
      <div
        {...drag.frameProps}
        className="relative h-24 rounded-2xl border-2 border-slate-200 bg-slate-50/70 overflow-hidden"
      >
        {/* Le ruban lui-même */}
        <div
          className="absolute top-1/2 -translate-y-1/2 left-0 h-7 rounded-r-md bg-blue-500/85 border-y-2 border-r-2 border-blue-700"
          style={{ width: `${pct}%` }}
          data-testid="ribbon"
          data-length-mm={lengthMm}
          aria-hidden="true"
        />
        {/* Le repère fixe au bout du ruban : le témoin qui prouve que le
            ruban ne bouge pas quand l'unité change. */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-slate-800"
          style={{ left: `${pct}%` }}
          data-testid="ribbon-mark"
          aria-hidden="true"
        />
        {/* La POIGNÉE, sur le bout du ruban : c'est l'objet lui-même qu'on
            saisit, pas un curseur posé sous la figure (§16). 48 px de côté,
            au-delà du minimum tactile de 44 px. */}
        {/* §17bis — la piste est `overflow-hidden` et la poignée est centrée sur
            le bout du ruban : à la longueur minimale comme à la maximale, une
            partie du disque est déjà rognée par le cadre. L'anneau de focus est
            donc INSET (bleu clair à l'intérieur du contour bleu foncé), ce qui
            le rend entièrement visible dans TOUS les états de la course. */}
        <div
          {...drag.handleProps}
          {...drag.a11yProps}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          data-testid="ribbon-handle"
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-12 h-12 rounded-full
                     bg-white border-[3px] border-blue-700 shadow-md flex items-center justify-center"
          style={{
            ...drag.handleProps.style,
            left: `${pct}%`,
            outline: 'none',
            ...(focused ? { boxShadow: 'inset 0 0 0 3px #60a5fa, 0 0 0 0 transparent' } : {}),
          }}
        >
          <span className="text-blue-700 text-lg leading-none" aria-hidden="true">↔</span>
        </div>
      </div>

      {/* Le nombre — dans le DOM, jamais dans un <text> SVG (§6ter.5). */}
      <div className="text-center" role="status" aria-live="polite">
        <span
          className="inline-block font-mono font-black text-3xl text-slate-800 tabular-nums"
          data-testid="ribbon-value"
        >
          {formatLength(shown, unit)}
        </span>
      </div>

      {/* Les quatre unités. Elles ne touchent QUE l'écriture du nombre. */}
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Unité d’affichage">
        {UNITS.map((u) => (
          <button
            key={u}
            type="button"
            onClick={() => onUnitChange?.(u)}
            aria-pressed={u === unit}
            className={`min-h-[44px] min-w-[56px] px-4 rounded-xl font-mono font-extrabold text-sm border-2 transition-colors
              focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              u === unit
                ? 'bg-blue-600 border-blue-700 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300'
            }`}
          >
            {u}
          </button>
        ))}
      </div>

      {/* L'observation n'est proposée QU'APRÈS que le geste a eu lieu : on ne
          dit jamais à l'avance ce qu'il faut voir. */}
      {changedUnitWhileFixed && (
        <p className="text-center text-sm text-slate-600">
          Le repère noir n’a pas bougé d’un pixel pendant que le nombre changeait.
        </p>
      )}
    </div>
  );
}
