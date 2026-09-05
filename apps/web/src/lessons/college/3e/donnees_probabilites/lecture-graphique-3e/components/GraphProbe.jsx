import React from 'react';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { formatDec } from '@smarter-academy/core';
import { image, antecedents, mergeClose } from './readingUtils';
import { RANGE, UNIT_Y } from './balloonData';

/**
 * GraphProbe — l'interaction signature : promener une sonde sur la courbe.
 *
 * Activity            déplacer un guide vertical (une heure) ou horizontal (une
 *                     altitude) et lire ce que la courbe répond.
 * Mathematical objective  faire éprouver la dissymétrie : une heure donne UNE
 *                     altitude ; une altitude peut être atteinte zéro, une ou
 *                     plusieurs fois. C'est invisible sans manipuler.
 * Student action      glisser la sonde, ou l'avancer d'un cran (− / +).
 * Controlled variable la position du guide, sur l'axe choisi.
 * Mathematical state  { mode, value } ; les lectures sont CALCULÉES par
 *                     `image` et `antecedents`, jamais saisies — le texte et le
 *                     dessin ne peuvent donc pas se contredire.
 * Visual consequence  en mode « heure », un seul point s'allume ; en mode
 *                     « altitude », tous les points d'intersection s'allument
 *                     d'un coup.
 * Expected observation « à 400 m, le ballon est passé quatre fois ».
 * Misconception targeted  « à chaque valeur lue correspond un seul point » —
 *                     défaite en basculant le mode sur la même courbe.
 * Feedback            la lecture est écrite en clair sous le repère, en toutes
 *                     lettres plutôt qu'en symboles.
 * Formalization       les mots image et antécédent sont posés au module 2,
 *                     après le geste.
 * Scaffolding         mode imposé (M1), puis les deux au choix (M2, M4).
 * Transfer            le module 5 superpose deux courbes.
 *
 * SÉCURITÉ D'AFFICHAGE (§17bis) — toutes les valeurs lues vivent dans le DOM,
 * jamais en `<text>` SVG : deux marqueurs proches ne peuvent donc pas voir
 * leurs étiquettes se chevaucher. L'unité verticale est distincte de
 * l'horizontale (`UNIT_Y`), sans quoi 900 m sur 12 h ferait un cadre de
 * plusieurs milliers de pixels.
 */
export default function GraphProbe({
  curve,
  curves = null,           // plusieurs courbes : [{id, points, tone, label}]
  mode = 'x',              // 'x' : une heure → une altitude · 'y' : une altitude → des heures
  value,
  onChange,
  onModeChange = null,     // si fourni, les deux pastilles de mode s'affichent
  xUnit = ' h',
  yUnit = ' m',
  showExtremes = false,
  showPair = false,        // ajoute « c'est le point (x ; y) » à la lecture en mode 'x'
  highlightIntervals = [],
  extraPoints = [],
  disabled = false,
  frozen = false,
  ariaLabel,
}) {
  const locked = disabled || frozen;
  // Sur une courbe unique, l'étiquette n'apporte rien (l'axe porte déjà « m »)
  // et vient croiser le tracé à l'extrémité droite : on ne l'affiche que
  // lorsqu'il y a plusieurs courbes à distinguer.
  const shown = curves ?? [{ id: 'c', points: curve, tone: 'sky' }];
  const main = curve ?? shown[0].points;

  const y = mode === 'x' ? image(main, value) : null;
  const xs = mode === 'y' ? antecedents(main, value) : [];
  const marks = mode === 'x'
    ? (y === null ? [] : [{ id: 'r', x: value, y, color: '#0284c7' }])
    : mergeClose(xs, 0.4).map((x, i) => ({ id: `a${i}`, x, y: value, color: '#059669' }));

  return (
    <div className="space-y-3">
      {onModeChange && !frozen && (
        <div className="flex gap-2">
          {[
            { m: 'x', label: 'Une heure → l’altitude' },
            { m: 'y', label: 'Une altitude → les heures' },
          ].map((o) => (
            <button
              key={o.m}
              type="button"
              onClick={() => !locked && onModeChange(o.m)}
              disabled={locked}
              aria-pressed={mode === o.m}
              className={`flex-1 min-h-[44px] rounded-xl border-2 text-sm font-semibold transition disabled:opacity-50
                focus-visible:ring-2 focus-visible:ring-blue-500
                ${mode === o.m ? 'bg-sky-600 border-sky-600 text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-sky-400'}`}
              style={{ touchAction: 'manipulation' }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}

      <CoordPlane
        range={RANGE}
        unit={26}
        unitY={UNIT_Y}
        xStep={1}
        yStep={100}
        labelEvery={mode === 'y' ? 1 : 2}
        curves={shown}
        readGuides={locked ? null : { mode, value, onChange }}
        points={[...marks, ...extraPoints]}
        highlightIntervals={highlightIntervals}
        frozen={frozen}
        disabled={locked}
        axisLabels={{ x: 'h', y: 'm' }}
        caption={false}
        ariaLabel={ariaLabel ?? 'Repère : promène la sonde sur la courbe'}
      />

      {/* Toutes les lectures vivent ICI, dans le DOM — jamais dans le SVG. */}
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-center" aria-live="polite">
        {mode === 'x' ? (
          <p className="text-slate-800">
            À <strong className="font-mono">{formatDec(value)}{xUnit}</strong>, l’altitude est{' '}
            <strong className="font-mono text-sky-700">
              {y === null ? '—' : `${formatDec(y)}${yUnit}`}
            </strong>
            {showPair && y !== null && (
              <>
                {' '}— c’est le point{' '}
                <strong className="font-mono">({formatDec(value)} ; {formatDec(y)})</strong>
              </>
            )}
          </p>
        ) : (
          <p className="text-slate-800">
            L’altitude <strong className="font-mono">{formatDec(value)}{yUnit}</strong> est atteinte{' '}
            <strong className="font-mono text-emerald-700">
              {xs.length === 0 ? 'jamais' : `${xs.length} fois`}
            </strong>
            {xs.length > 0 && (
              <> : à {xs.map((x) => `${formatDec(x)}${xUnit}`).join(', ')}</>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
