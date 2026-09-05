import React from 'react';
import GeoFigure from './GeoFigure';
import { KINDS, KIND_LABEL, extentSentence, endpointCount, notationOf } from './droitesUtils';

/**
 * KindMorph — mêmes points A et B, trois objets.
 *
 * ACTION          l'élève tape une des trois pastilles.
 * TRANSFORMATION  le trait change d'étendue : flèches et extrémités
 *                 apparaissent ou disparaissent, SANS que A ni B bougent.
 * SENS MATH.      deux points ne suffisent pas à définir l'objet ; il faut
 *                 dire jusqu'où il va.
 *
 * Les pastilles sont de vrais <button> HORS du SVG : pas de superposition
 * ARIA à gérer, et des cibles tactiles pleine taille. ≤ 5 nœuds interactifs.
 */
export default function KindMorph({
  obj,
  onKindChange,
  box = { xMin: 0, yMin: 0, xMax: 320, yMax: 170 },
  showNotation = true,
  disabled = false,
}) {
  return (
    <div className="space-y-3">
      <GeoFigure
        objects={[{ ...obj, nameA: 'A', nameB: 'B' }]}
        box={box}
        showNotation={showNotation}
        ariaLabel={`${KIND_LABEL[obj.kind]} passant par A et B : ${extentSentence(obj.kind)}`}
      />

      <div className="flex gap-2 justify-center flex-wrap" role="group" aria-label="Choisir le type d’objet">
        {KINDS.map((k) => {
          const on = obj.kind === k;
          return (
            <button
              key={k}
              type="button"
              disabled={disabled}
              aria-pressed={on}
              onClick={() => onKindChange(k)}
              className={`min-h-[44px] px-4 rounded-xl border-2 font-bold text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 ${
                on
                  ? 'bg-emerald-600 border-emerald-700 text-white'
                  : 'bg-white border-slate-300 text-slate-700 hover:border-emerald-400'
              }`}
            >
              {KIND_LABEL[k]}
              <span className="ml-1.5 font-mono text-xs opacity-80">{notationOf({ kind: k }, 'A', 'B')}</span>
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-center space-y-1">
        <p className="text-sm text-slate-700">
          <strong>{KIND_LABEL[obj.kind]}</strong> : {extentSentence(obj.kind)}.
        </p>
        <p className="text-xs font-mono text-slate-500">
          {endpointCount(obj.kind)} extrémité{endpointCount(obj.kind) > 1 ? 's' : ''} — A et B n’ont pas bougé.
        </p>
      </div>
    </div>
  );
}
