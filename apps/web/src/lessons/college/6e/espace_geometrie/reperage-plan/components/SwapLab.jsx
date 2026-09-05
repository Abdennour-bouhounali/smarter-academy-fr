import React from 'react';
import { useReducedMotion } from 'framer-motion';
import CoordGrid from './CoordGrid';
import { swapNode, isOnDiagonal, formatCoords, samePoint } from './reperageUtils';

/**
 * SwapLab — l'INTERACTION SIGNATURE de la leçon.
 *
 * ACTION          l'élève pose/déplace un point A sur le quadrillage.
 * TRANSFORMATION  un fantôme A' apparaît aussitôt aux coordonnées ÉCHANGÉES,
 *                 relié à A par un trait, de part et d'autre de la diagonale.
 * SENS MATH.      les deux nombres ne jouent pas le même rôle : les
 *                 intervertir désigne un AUTRE endroit.
 * FEEDBACK        les deux étiquettes (3 ; 5) et (5 ; 3) sont affichées côte à
 *                 côte, et la distance entre A et A' se voit.
 * GÉNÉRALISATION  A et A' ne se confondent QUE sur la diagonale, là où les
 *                 deux nombres sont égaux — un cas particulier, pas la règle.
 *
 * Le fantôme est DÉRIVÉ de l'état (`swapNode(point)`), jamais stocké : il ne
 * peut donc pas diverger du point (playbook §4, source de vérité unique).
 *
 * Les étiquettes animées sont du DOM, pas du SVG : animer un <g> avec
 * framer-motion `animate={{x,y}}` viserait des attributs inexistants (§10.8).
 */
export default function SwapLab({
  grid,
  point,
  onPointChange,
  showGhost = true,
  target = null,
  disabled = false,
  ariaLabel,
}) {
  const reduced = useReducedMotion();
  const ghost = point && showGhost ? swapNode(point) : null;
  const confondus = point ? isOnDiagonal(point) : false;

  return (
    <div className="space-y-3">
      <CoordGrid
        grid={grid}
        mode="place"
        point={point}
        onPointChange={onPointChange}
        target={target}
        ghost={ghost ? { ...ghost, label: `A' ${formatCoords(ghost)}` } : null}
        highlightDiagonal={showGhost}
        showCoordsBadge={false}
        disabled={disabled}
        ariaLabel={ariaLabel ?? 'Quadrillage : place le point A, son échange A′ apparaît'}
      />

      {point && (
        <div className="flex items-stretch justify-center gap-2 flex-wrap">
          <div
            className="rounded-xl border-2 border-indigo-300 bg-indigo-50 px-4 py-2.5 text-center"
            style={{ transition: reduced ? 'none' : 'transform 220ms ease-out' }}
          >
            <div className="text-[10px] font-mono uppercase tracking-wide text-indigo-500">Ton point A</div>
            <div className="font-mono font-extrabold text-lg text-indigo-900 tabular-nums">
              {formatCoords(point)}
            </div>
          </div>

          {showGhost && (
            <>
              <div className="flex items-center text-slate-400 font-bold text-lg" aria-hidden="true">⇄</div>
              <div className="rounded-xl border-2 border-slate-300 bg-slate-100 px-4 py-2.5 text-center">
                <div className="text-[10px] font-mono uppercase tracking-wide text-slate-500">
                  Nombres échangés A′
                </div>
                <div className="font-mono font-extrabold text-lg text-slate-700 tabular-nums">
                  {formatCoords(swapNode(point))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {point && showGhost && (
        <p
          className={`text-center text-sm font-semibold ${confondus ? 'text-amber-700' : 'text-slate-600'}`}
          aria-live="polite"
        >
          {confondus ? (
            <>
              ⚠️ Ici les deux nombres sont égaux : A et A′ sont au même endroit. C’est le seul cas —
              tous les points de la diagonale.
            </>
          ) : (
            <>
              A et A′ ne sont pas au même endroit : les deux nombres n’ont pas le même rôle.
            </>
          )}
        </p>
      )}
    </div>
  );
}

/** Le point et son échange coïncident-ils ? Utilisé par le module pour valider. */
export function swapLandsElsewhere(point) {
  return !!point && !samePoint(point, swapNode(point));
}
