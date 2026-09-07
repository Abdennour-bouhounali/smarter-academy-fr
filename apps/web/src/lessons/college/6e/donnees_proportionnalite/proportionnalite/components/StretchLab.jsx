import React, { useMemo, useState } from 'react';
import { useDragValue } from '../../../../../common/manip6e';
import { applyRule, formatDec } from './proportionUtils';

/**
 * StretchLab — LE laboratoire d'ouverture : on TIRE une grandeur, l'autre suit.
 *
 * Activity: l'élève saisit l'extrémité de la barre « jetons » et l'étire ;
 *   la barre « crêpes » se redessine à chaque pixel, sans clic de validation.
 * Mathematical objective: la proportionnalité n'est pas une propriété qu'on
 *   lit dans un tableau, c'est un COMPORTEMENT qu'on provoque — on tire d'un
 *   côté, l'autre suit exactement.
 * Student action: un glissement continu sur la barre elle-même (jamais un
 *   `+`/`−`, jamais un `<input type="range">` posé sous la figure — règle
 *   projet du 2026-09-06, INTERACTION_PEDAGOGY §16).
 * Mathematical state: UN nombre, `value` (la quantité d'entrée). La longueur
 *   des deux barres, les deux nombres, les repères posés et le rapport
 *   affiché en dérivent tous par `applyRule` — il est donc impossible que le
 *   dessin et le nombre se contredisent (§5, §28).
 * Expected observation: quand la barre du haut double, celle du bas double
 *   AUSSI — et surtout, la barre du bas reste toujours le même multiple de
 *   celle du haut. Sur la situation à part fixe (la barque), le même geste ne
 *   double PAS l'autre barre : c'est le contre-exemple qui définit la notion.
 * Misconception targeted: « quand l'une augmente, l'autre augmente donc
 *   c'est proportionnel » et « +2 d'un côté = +2 de l'autre ».
 * Formalization: aucune. Aucun mot de la leçon n'apparaît ici ; le module
 *   pose ses briques après le geste.
 *
 * POURQUOI UNE BARRE ET PAS DES PASTILLES : la longueur est une grandeur
 * CONTINUE, et c'est justement la continuité qui enseigne — entre 2 et 4 on
 * passe par 3, et le rapport ne bouge pas une seule fois. Un tas de jetons se
 * compte ; une barre se compare d'un coup d'œil.
 *
 * SÉCURITÉ VISUELLE (§17bis) : les nombres vivent dans le DOM, à droite de
 * chaque piste, dans leur propre colonne de grille — ils ne peuvent donc pas
 * chevaucher le dessin quel que soit le nombre de chiffres. La piste du bas
 * est mise à l'échelle sur la valeur MAXIMALE atteignable (`yScaleMax`), pas
 * sur la valeur courante : la barre ne peut jamais sortir de son cadre, et
 * elle ne se remet pas à l'échelle sous les doigts de l'élève (ce qui
 * masquerait précisément la croissance qu'il doit voir).
 */

// La piste EST la zone tactile : 48 px de haut laissent 44 px pleins à la
// poignée une fois la bordure de 2 px retirée de chaque côté (§17, mesuré).
const TRACK_H = 48;

/** Une piste : le cadre, la barre, et la poignée quand la piste est saisissable. */
function Track({
  label, value, max, unit, color, trackTone,
  drag = null, ticks = [], ghost = null,
}) {
  // Le focus allume un anneau sur la POIGNÉE visible ; la zone de captation de
  // 44 px, elle, n'est plus bordée par le navigateur (elle n'entoure rien).
  const [focused, setFocused] = useState(false);
  const pct = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 sm:gap-3">
      <span className="text-xs font-bold text-slate-500 w-[52px] sm:w-[64px] shrink-0">{label}</span>

      <div
        {...(drag ? drag.frameProps : {})}
        className={`relative rounded-xl border-2 ${trackTone} overflow-hidden`}
        style={{ height: TRACK_H, ...(drag ? drag.frameProps.style : {}) }}
      >
        {/* Les repères : ce que l'élève a déjà posé. Ils restent visibles, si
            bien que la comparaison « avant / maintenant » se fait à l'œil. */}
        {ticks.map((t) => (
          <span
            key={t}
            className="absolute top-0 bottom-0 w-px bg-slate-400/60"
            style={{ left: `${max > 0 ? Math.min(100, (t / max) * 100) : 0}%` }}
            aria-hidden="true"
          />
        ))}

        {/* Le fantôme : là où la barre serait si l'autre grandeur suivait
            exactement. Sur une situation proportionnelle il coïncide avec la
            barre — on ne le voit donc pas. Sur la barque, l'écart EST la
            part fixe, et il crève les yeux. */}
        {ghost !== null && (
          <span
            className="absolute top-0 bottom-0 border-r-2 border-dashed border-rose-400"
            style={{ left: 0, width: `${max > 0 ? Math.min(100, (ghost / max) * 100) : 0}%` }}
            aria-hidden="true"
          />
        )}

        <span
          className="absolute top-0 bottom-0 left-0 rounded-r-lg transition-[width] duration-75"
          style={{ width: `${pct * 100}%`, background: color }}
          aria-hidden="true"
        />

        {/* LA POIGNÉE : c'est l'extrémité de la barre elle-même qu'on saisit. */}
        {drag && (
          <span
            {...drag.handleProps}
            {...drag.a11yProps}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="absolute top-0 bottom-0 flex items-center justify-center rounded-lg"
            style={{
              ...drag.handleProps.style,
              left: `calc(${pct * 100}% - 22px)`,
              width: 44,   // 44 × 44 px pleins (la hauteur vient de top-0/bottom-0)
              outline: 'none',
            }}
          >
            {/* §17bis — la piste est `overflow-hidden` et la poignée atteint ses
                deux bords : un anneau tracé À L'EXTÉRIEUR serait rogné à 0 et à
                100 %. L'anneau est donc INSET, indigo sur la barre ardoise, et
                reste entier quelle que soit la position de la poignée. */}
            <span
              className={`block rounded-md border-2 border-white shadow-md ${drag.dragging ? 'scale-110' : ''} transition-transform`}
              style={{
                width: 12,
                height: TRACK_H - 8,
                background: '#1e293b',
                ...(focused ? { boxShadow: 'inset 0 0 0 3px #818cf8' } : {}),
              }}
            />
          </span>
        )}
      </div>

      <span className="font-mono font-black text-base sm:text-lg text-slate-800 tabular-nums text-right w-[68px] sm:w-[86px] shrink-0">
        {formatDec(value)}
        {unit ? <span className="text-xs font-bold text-slate-400 ml-0.5">{unit}</span> : null}
      </span>
    </div>
  );
}

export default function StretchLab({
  rule,
  min = 1,
  max = 10,
  step = 1,
  value,
  onChange,
  xLabel = 'Jetons',
  yLabel = 'Crêpes',
  yUnit = '',
  ticks = [],
  /** Affiche le fantôme « si l'autre suivait » — le révélateur de la part fixe. */
  showGhost = false,
  /** Ligne de lecture sous les pistes ; le module décide de ce qu'elle dit. */
  readout = null,
}) {
  const y = applyRule(rule, value);

  // L'échelle du bas est calée sur le MAXIMUM atteignable, jamais sur la
  // valeur courante : la barre grandit vraiment sous les doigts au lieu de
  // rester pleine à 100 % à chaque instant.
  const yScaleMax = useMemo(() => {
    let m = 0;
    for (let x = min; x <= max + 1e-9; x += step) m = Math.max(m, applyRule(rule, x));
    return m || 1;
  }, [rule, min, max, step]);

  const drag = useDragValue({
    value,
    onChange,
    min,
    max,
    step,
    ariaLabel: `${xLabel} — tire pour changer la quantité`,
    valueText: (v) => `${formatDec(v)} ${xLabel.toLowerCase()}, ${formatDec(applyRule(rule, v))} ${yLabel.toLowerCase()}`,
  });

  // Le fantôme proportionnel : ce que vaudrait y si l'on doublait/triplait
  // simplement la première mesure. Calculé, jamais écrit à la main.
  const ghost = showGhost ? applyRule(rule, min) * (value / min) : null;

  return (
    <div className="space-y-3">
      <div
        className="rounded-2xl border-2 border-slate-200 bg-white p-3 sm:p-4 space-y-3"
        role="group"
        aria-label="Laboratoire : tirer une grandeur"
      >
        <Track
          label={xLabel}
          value={value}
          max={max}
          color="#6366f1"
          trackTone="border-indigo-200 bg-indigo-50/70"
          drag={drag}
          ticks={ticks}
        />
        <Track
          label={yLabel}
          value={y}
          max={yScaleMax}
          unit={yUnit}
          color="#10b981"
          trackTone="border-emerald-200 bg-emerald-50/70"
          ticks={ticks.map((t) => applyRule(rule, t))}
          ghost={ghost}
        />
      </div>

      <p className="text-xs text-slate-500 text-center sm:hidden">
        Attrape le curseur foncé et fais-le glisser.
      </p>

      {readout}

      {/* Lecture chiffrée, toujours dans le DOM et annoncée : la manipulation
          reste utilisable sans voir la figure. */}
      <p className="sr-only" role="status" aria-live="polite">
        {formatDec(value)} {xLabel} donnent {formatDec(y)} {yLabel}.
      </p>
    </div>
  );
}
