import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { formatCoords, formatNumber, swap, describeDisplacement } from './reperageUtils';

/**
 * PointDriver — l'interaction signature de la leçon.
 *
 * ACTION            deux réglages SÉPARÉS, un par coordonnée (− / +, et le
 *                   glisser du point comme jumeau).
 * CHANGEMENT        bouger x ne déplace le point QU'horizontalement ; bouger y
 *                   QUE verticalement. Une trace montre le chemin parcouru.
 * OBSERVATION       chaque nombre commande une direction, et une seule.
 * SENS MATHÉMATIQUE l'abscisse et l'ordonnée ne sont pas deux nombres
 *                   interchangeables : ce sont deux rôles.
 * FORMALISATION     l'ordre du couple (x ; y) devient une conséquence, pas une
 *                   convention à mémoriser — le fantôme de (y ; x) atterrit
 *                   ailleurs, et l'élève l'a provoqué.
 *
 * Le composant ne décide rien : il reçoit le point et renvoie le suivant.
 * `lastMoved` est calculé par le module (quel réglage vient d'être utilisé),
 * ce qui permet d'éclairer la projection concernée sans que le composant
 * n'ait à deviner l'intention.
 */
export default function PointDriver({
  point,
  onPointChange,
  range = { xMin: -6, xMax: 6, yMin: -5, yMax: 5 },
  step = 1,
  lastMoved = null,          // 'x' | 'y' | null — pour éclairer la projection
  showGhost = false,         // le fantôme du couple inversé
  target = null,
  trail = [],
  showGuides = true,
  disabled = false,
  ariaLabel,
}) {
  const reduceMotion = useReducedMotion();
  const ghost = showGhost ? { ...swap(point), label: formatCoords(swap(point)) } : null;

  const bump = (axis, delta) => {
    if (disabled) return;
    const next = axis === 'x'
      ? { x: point.x + delta, y: point.y }
      : { x: point.x, y: point.y + delta };
    const clamped = {
      x: Math.max(range.xMin, Math.min(range.xMax, next.x)),
      y: Math.max(range.yMin, Math.min(range.yMax, next.y)),
    };
    onPointChange(clamped, axis);
  };

  /* La trace : le chemin déjà parcouru, dessiné en overlay du repère. */
  const overlay = (toSvg) => (
    <g>
      {trail.length > 1 && (
        <polyline
          points={trail.map((p) => { const s = toSvg(p.x, p.y); return `${s.x},${s.y}`; }).join(' ')}
          fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeDasharray="4 4"
          strokeLinecap="round" strokeLinejoin="round" opacity="0.8"
        />
      )}
    </g>
  );

  const Stepper = ({ axis, label, color }) => {
    const value = axis === 'x' ? point.x : point.y;
    const min = axis === 'x' ? range.xMin : range.yMin;
    const max = axis === 'x' ? range.xMax : range.yMax;
    const lit = lastMoved === axis;
    return (
      <div
        className={`flex-1 min-w-[150px] rounded-xl border-2 p-3 transition-colors ${
          lit ? `${color.border} ${color.bg}` : 'border-slate-200 bg-white'
        }`}
      >
        <p className={`text-xs font-semibold mb-1 ${color.text}`}>
          {label} <span className="text-slate-500 font-normal">— {axis === 'x' ? 'horizontal' : 'vertical'}</span>
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => bump(axis, -step)}
            disabled={disabled || value <= min}
            aria-label={`Diminuer ${label}`}
            className="w-11 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40
                       text-xl font-bold text-slate-700 flex items-center justify-center"
          >
            −
          </button>
          <span
            className={`flex-1 text-center text-2xl font-bold font-mono tabular-nums ${color.text}`}
            aria-live="polite"
          >
            {formatNumber(value, step < 1 ? 1 : 0)}
          </span>
          <button
            type="button"
            onClick={() => bump(axis, step)}
            disabled={disabled || value >= max}
            aria-label={`Augmenter ${label}`}
            className="w-11 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40
                       text-xl font-bold text-slate-700 flex items-center justify-center"
          >
            +
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <CoordPlane
        range={range}
        step={step}
        points={[{ id: 'M', name: 'M', x: point.x, y: point.y, color: '#4f46e5' }]}
        draggableId={disabled ? null : 'M'}
        onPointChange={(p) => onPointChange(p, null)}
        guides={showGuides ? point : null}
        ghost={ghost}
        target={target}
        overlay={overlay}
        ariaLabel={ariaLabel ?? 'Repère du parc — déplace le point M'}
        caption={false}
        disabled={disabled}
      />

      <div className="flex gap-2 flex-wrap">
        <Stepper
          axis="x"
          label="x (abscisse)"
          color={{ text: 'text-sky-700', border: 'border-sky-400', bg: 'bg-sky-50' }}
        />
        <Stepper
          axis="y"
          label="y (ordonnée)"
          color={{ text: 'text-emerald-700', border: 'border-emerald-400', bg: 'bg-emerald-50' }}
        />
      </div>

      <motion.p
        key={`${point.x}|${point.y}`}
        initial={reduceMotion ? false : { opacity: 0.4 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="text-center text-lg font-mono font-bold text-slate-800 tabular-nums"
        aria-live="polite"
      >
        M {formatCoords(point, step < 1 ? 1 : 0)}
        {lastMoved && (
          <span className="ml-2 text-sm font-sans font-normal text-slate-500">
            — {lastMoved === 'x' ? 'seul l’horizontal a bougé' : 'seul le vertical a bougé'}
          </span>
        )}
      </motion.p>

      {showGhost && (
        <p className="text-center text-sm text-slate-600">
          Le couple inversé {formatCoords(swap(point))} tombe sur le point gris :{' '}
          <span className="font-semibold">{describeDisplacement({
            dx: swap(point).x - point.x, dy: swap(point).y - point.y,
          })}</span> plus loin.
        </p>
      )}
    </div>
  );
}
