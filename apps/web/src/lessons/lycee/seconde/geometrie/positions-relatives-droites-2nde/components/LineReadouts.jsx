import React from 'react';
import { lineText, cartesianText, relativePosition, intersection, fracCoupleText, POSITION_LABEL, COMMON_POINTS_TEXT, intersectionInFrame, frameFor } from './droitesUtils';

/**
 * LineReadouts — les NOMBRES de la scène, dans le DOM et jamais dans le SVG
 * (§17bis) : équation de chaque droite, position relative (avec le nombre de
 * points communs), coordonnées exactes du point d'intersection (fraction si
 * besoin) et « hors du cadre » quand I existe mais n'est pas dessiné.
 *
 * Tout est DÉRIVÉ des deux droites canoniques : ce bandeau ne peut pas
 * contredire le dessin.
 */
export default function LineReadouts({ L1, L2, halfSpan = 6, show = { equations: true, position: true, intersection: true }, cartesian = false, names = ['(d₁)', '(d₂)'] }) {
  const pos = relativePosition(L1, L2);
  const I = intersection(L1, L2);
  const { range } = frameFor(halfSpan);
  const inFrame = intersectionInFrame(I, range);
  const tone = pos === 'secantes' ? 'bg-amber-50 border-amber-300 text-amber-900' : pos === 'paralleles' ? 'bg-sky-50 border-sky-300 text-sky-900' : 'bg-violet-50 border-violet-300 text-violet-900';
  return (
    <div className="space-y-2" aria-live="polite">
      {show.equations && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm font-mono font-bold tabular-nums">
          <div className="px-3 py-2 rounded-xl border bg-indigo-50 border-indigo-200 text-indigo-900">
            <span className="text-xs font-sans font-semibold uppercase tracking-wide opacity-70 mr-2">{names[0]}</span>
            {cartesian ? cartesianText(L1) : lineText(L1)}
          </div>
          <div className="px-3 py-2 rounded-xl border bg-rose-50 border-rose-200 text-rose-900">
            <span className="text-xs font-sans font-semibold uppercase tracking-wide opacity-70 mr-2">{names[1]}</span>
            {cartesian ? cartesianText(L2) : lineText(L2)}
          </div>
        </div>
      )}
      {(show.position || show.intersection) && (
        <div className={`px-3 py-2 rounded-xl border text-sm font-semibold ${tone}`} data-position={pos}>
          {show.position && (
            <span>
              Droites <strong>{POSITION_LABEL[pos]}</strong> — {COMMON_POINTS_TEXT[pos]}
            </span>
          )}
          {show.intersection && pos === 'secantes' && (
            <span className="block font-mono font-bold tabular-nums">
              I {fracCoupleText(I)}{!inFrame && <span className="font-sans font-semibold"> — hors du cadre</span>}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
