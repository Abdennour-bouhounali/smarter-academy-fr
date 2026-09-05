import React, { useEffect, useRef } from 'react';
import { RotateCcw, RotateCw } from 'lucide-react';
import RelationFigure from './RelationFigure';
import {
  relationOf, RELATIONS, RELATION_LABEL, normalizeAngle, angleBetweenDeg, toLine,
} from './relationsUtils';

/**
 * RotateToRight — faire tourner une droite jusqu'à la relation visée.
 *
 * ACTION          l'élève tourne d₂ de 5° en 5° (boutons ⟲ ⟳ ou flèches).
 * TRANSFORMATION  quand la relation visée est atteinte, la MARQUE apparaît
 *                 d'elle-même : chevrons si parallèles, carré si angle droit.
 * SENS MATH.      la marque n'est pas décorative — c'est le constat que la
 *                 relation est exactement vérifiée, pas approchée.
 * FEEDBACK        l'angle entre les deux droites est affiché en continu ;
 *                 à 90° pile, le carré « clique » en place.
 * GÉNÉRALISATION  perpendiculaire ≠ « en croix » : c'est 90°, exactement.
 *
 * §10.10 : `onGoalReached` part d'un EFFET, jamais d'un updater d'état.
 */
const STEP = 5;

export default function RotateToRight({
  d1,
  d2,
  onAngleChange,
  targetRelation = RELATIONS.perpendiculaires,
  onGoalReached,
  box = { xMin: 0, yMin: 0, xMax: 320, yMax: 200 },
  disabled = false,
  solved = false,
  ariaLabel,
}) {
  const relation = relationOf(d1, d2);
  const angle = angleBetweenDeg(toLine(d1), toLine(d2));
  const reached = relation === targetRelation;
  const firedRef = useRef(false);

  // Objectif atteint → on prévient le module depuis un effet.
  useEffect(() => {
    if (!reached || firedRef.current || solved) return;
    firedRef.current = true;
    onGoalReached?.();
  }, [reached, solved, onGoalReached]);

  const rotate = (sign) => {
    if (disabled || solved) return;
    onAngleChange(normalizeAngle(d2.angleDeg + sign * STEP));
  };

  const onKeyDown = (e) => {
    const map = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 };
    if (!(e.key in map)) return;
    e.preventDefault();
    rotate(map[e.key]);
  };

  const btn = 'min-h-[44px] min-w-[56px] px-4 rounded-xl border-2 font-mono font-bold text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-40';

  return (
    <div className="space-y-3">
      <RelationFigure
        droites={[d1, d2]}
        box={box}
        ariaLabel={ariaLabel ?? `Deux droites formant un angle de ${Math.round(angle)} degrés`}
      />

      <div className="flex items-center justify-center gap-2 flex-wrap">
        <button
          type="button" onClick={() => rotate(-1)} disabled={disabled || solved}
          className={`${btn} bg-white border-slate-300 text-slate-700`}
          aria-label="Tourner de 5 degrés vers la gauche"
        >
          <RotateCcw className="w-4 h-4 inline" aria-hidden="true" />
        </button>

        {/* Lecture de l'angle : focusable, pilotable aux flèches */}
        <div
          role="slider"
          tabIndex={disabled || solved ? -1 : 0}
          aria-label="Inclinaison de la deuxième droite"
          aria-valuenow={Math.round(angle)}
          aria-valuemin={0}
          aria-valuemax={90}
          aria-valuetext={`angle de ${Math.round(angle)} degrés, droites ${RELATION_LABEL[relation]}`}
          onKeyDown={onKeyDown}
          className={`min-h-[44px] px-5 rounded-xl border-2 flex items-center justify-center font-mono font-extrabold tabular-nums focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            reached ? 'border-emerald-400 bg-emerald-50 text-emerald-800' : 'border-slate-300 bg-white text-slate-700'
          }`}
        >
          {Math.round(angle)}°
        </div>

        <button
          type="button" onClick={() => rotate(1)} disabled={disabled || solved}
          className={`${btn} bg-white border-slate-300 text-slate-700`}
          aria-label="Tourner de 5 degrés vers la droite"
        >
          <RotateCw className="w-4 h-4 inline" aria-hidden="true" />
        </button>
      </div>

      {/* Le verdict, en toutes lettres — la couleur n'est jamais seule */}
      <p
        className={`text-center text-sm font-semibold ${reached ? 'text-emerald-700' : 'text-slate-600'}`}
        aria-live="polite"
      >
        {reached ? (
          targetRelation === RELATIONS.perpendiculaires ? (
            <>✓ 90° pile : le carré d’angle droit apparaît. Les droites sont perpendiculaires.</>
          ) : (
            <>✓ Les chevrons apparaissent : les droites sont parallèles.</>
          )
        ) : (
          <>
            Angle actuel : {Math.round(angle)}°. Droites {RELATION_LABEL[relation]} — continue de tourner.
          </>
        )}
      </p>
    </div>
  );
}
