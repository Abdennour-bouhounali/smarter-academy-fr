import React, { useRef, useCallback } from 'react';
import { RotateCcw, RotateCw, PenLine } from 'lucide-react';
import { clipToBox } from '../../../../../common/utils/geometry2d';
import {
  dirOf, relationOf, RELATIONS, isEquerreAligned, equerreHint, normalizeAngle,
  perpendicularThroughPoint, parallelThroughPoint, distanceTo,
} from './relationsUtils';

/**
 * VirtualEquerre — l'instrument, dans la lignée du Protractor des angles.
 *
 * ACTION          l'élève déplace l'équerre (glisser/tap) et la tourne
 *                 (⟲ ⟳ ou flèches) jusqu'au bon placement.
 * TRANSFORMATION  deux voyants disent séparément ce qui est déjà juste :
 *                 « côté sur la droite » et « sommet sur le point ».
 * SENS MATH.      vérifier une perpendiculaire, c'est poser l'angle droit de
 *                 l'instrument SUR l'angle qu'on veut contrôler.
 * FEEDBACK        tant que le placement est faux, le tracé est refusé et la
 *                 raison est nommée (mal orientée / mal positionnée).
 * GÉNÉRALISATION  le rituel en deux gestes vaut pour toute construction.
 *
 * L'instrument est le CONSTRUCTEUR : `onTrace` émet la droite calculée par
 * perpendicularThroughPoint / parallelThroughPoint. Un placement correct ne
 * peut donc pas produire une droite incorrecte.
 *
 * Le corps translucide porte pointerEvents:'none' (§10.3) ; l'interaction
 * passe par un rect transparent, des pastilles de rotation et un bouton.
 */
const BODY = { leg: 78, thick: 0 };

export default function VirtualEquerre({
  line,
  point,
  equerre,
  onEquerreChange,
  mode = 'verify', // 'verify' | 'construct'
  construct = 'perpendiculaire', // 'perpendiculaire' | 'parallele'
  onTrace,
  drawn = null,
  box = { xMin: 0, yMin: 0, xMax: 320, yMax: 200 },
  disabled = false,
  ariaLabel,
}) {
  const svgRef = useRef(null);
  const dragging = useRef(false);

  const state = isEquerreAligned(equerre, line, point);

  const posFromClient = useCallback(
    (clientX, clientY) => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return null;
      return {
        x: box.xMin + ((clientX - rect.left) / rect.width) * (box.xMax - box.xMin),
        y: box.yMin + ((clientY - rect.top) / rect.height) * (box.yMax - box.yMin),
      };
    },
    [box.xMin, box.yMin, box.xMax, box.yMax]
  );

  const move = (p) => {
    if (disabled || !p) return;
    onEquerreChange({ ...equerre, p });
  };
  const rotate = (sign) => {
    if (disabled) return;
    onEquerreChange({ ...equerre, angleDeg: normalizeAngle(equerre.angleDeg + sign * 5) });
  };

  const onPointerDown = (e) => {
    if (disabled) return;
    dragging.current = true;
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* ignore */ }
    move(posFromClient(e.clientX, e.clientY));
  };
  const onPointerMove = (e) => {
    if (disabled || !dragging.current) return;
    move(posFromClient(e.clientX, e.clientY));
  };
  const endDrag = (e) => {
    if (!dragging.current) return;
    dragging.current = false;
    try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch { /* ignore */ }
  };

  const onKeyDown = (e) => {
    const moves = {
      ArrowRight: { x: 6, y: 0 }, ArrowLeft: { x: -6, y: 0 },
      ArrowUp: { x: 0, y: -6 }, ArrowDown: { x: 0, y: 6 },
    };
    if (e.key === '+' || e.key === 'PageUp') { e.preventDefault(); rotate(1); return; }
    if (e.key === '-' || e.key === 'PageDown') { e.preventDefault(); rotate(-1); return; }
    const d = moves[e.key];
    if (!d) return;
    e.preventDefault();
    move({ x: equerre.p.x + d.x, y: equerre.p.y + d.y });
  };

  /** Le tracé n'est possible QUE si le rituel est respecté. */
  const trace = () => {
    if (disabled || !state.ok) return;
    const built =
      construct === 'parallele'
        ? parallelThroughPoint(line, point, 'd′')
        : perpendicularThroughPoint(line, point, 'd′');
    onTrace?.(built);
  };

  /** Trace d'une droite du modèle, découpée à la boîte. */
  const traceLine = (l, color, key, dashed = false) => {
    const dir = dirOf(l.angleDeg);
    const seg = clipToBox(
      { kind: 'droite', a: l.p, b: { x: l.p.x + dir.x * 50, y: l.p.y + dir.y * 50 } },
      box
    );
    if (!seg) return null;
    return (
      <g key={key}>
        <line
          x1={seg.from.x} y1={seg.from.y} x2={seg.to.x} y2={seg.to.y}
          stroke={color} strokeWidth="3" strokeLinecap="round"
          strokeDasharray={dashed ? '6 5' : undefined}
        />
        {l.name && (
          <text x={seg.to.x - 14} y={seg.to.y - 8} className="font-space" fontSize="13" fontWeight="700" fill={color}>
            {l.name}
          </text>
        )}
      </g>
    );
  };

  // Le corps de l'équerre : un L dont le sommet est en equerre.p.
  const u = dirOf(equerre.angleDeg);
  const v = dirOf(normalizeAngle(equerre.angleDeg + 90));
  const O = equerre.p;
  const A = { x: O.x + u.x * BODY.leg, y: O.y + u.y * BODY.leg };
  const B = { x: O.x + v.x * BODY.leg, y: O.y + v.y * BODY.leg };
  const mark = 13;

  const btn = 'min-h-[44px] min-w-[52px] px-3.5 rounded-xl border-2 font-mono font-bold text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-40';

  return (
    <div className="space-y-3">
      <svg
        ref={svgRef}
        viewBox={`${box.xMin} ${box.yMin} ${box.xMax - box.xMin} ${box.yMax - box.yMin}`}
        className="w-full max-w-[520px] mx-auto select-none bg-white rounded-xl border-2 border-slate-200"
        style={{ touchAction: 'none' }}
        role="group"
        aria-label={ariaLabel ?? 'Pose l’équerre sur la droite'}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {/* Tout le décor : jamais d'interception de pointeur (§10.3) */}
        <g style={{ pointerEvents: 'none' }}>
          {traceLine(line, '#4f46e5', 'base')}
          {drawn && traceLine(drawn, '#059669', 'drawn')}

          {/* Le corps translucide de l'équerre — palette instrument maison */}
          <g opacity="0.75">
            <path
              d={`M ${O.x} ${O.y} L ${A.x} ${A.y} L ${B.x} ${B.y} Z`}
              fill="#fef9c3" stroke="#ca8a04" strokeWidth="2.5" strokeLinejoin="round"
            />
            {/* La marque d'angle droit, au sommet de l'instrument */}
            <path
              d={`M ${O.x + u.x * mark} ${O.y + u.y * mark}
                  L ${O.x + u.x * mark + v.x * mark} ${O.y + u.y * mark + v.y * mark}
                  L ${O.x + v.x * mark} ${O.y + v.y * mark}`}
              fill="none" stroke="#ca8a04" strokeWidth="2"
            />
          </g>

          {point && (
            <>
              <circle cx={point.x} cy={point.y} r="5.5" fill="#e11d48" stroke="#fff" strokeWidth="2" />
              <text x={point.x + 9} y={point.y - 8} className="font-space" fontSize="13" fontWeight="700" fill="#0f172a">
                A
              </text>
            </>
          )}
        </g>

        {/* Poignée : large, transparente, focusable */}
        <circle
          cx={O.x} cy={O.y} r="24" fill="transparent"
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-label="Sommet de l’équerre"
          aria-valuenow={Math.round(equerre.angleDeg)}
          aria-valuemin={0}
          aria-valuemax={180}
          aria-valuetext={equerreHint(state)}
          onKeyDown={onKeyDown}
          style={{ cursor: disabled ? 'default' : 'grab', outline: 'none' }}
        />
      </svg>

      {/* Deux voyants : chacun dit SÉPARÉMENT ce qui est déjà juste */}
      <div className="grid grid-cols-2 gap-2">
        <div
          className={`rounded-xl border-2 px-3 py-2 text-center text-xs font-semibold ${
            state.aligned ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-50 text-slate-500'
          }`}
        >
          {state.aligned ? '✓' : '○'} Côté sur la droite
        </div>
        <div
          className={`rounded-xl border-2 px-3 py-2 text-center text-xs font-semibold ${
            state.atPoint ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-50 text-slate-500'
          }`}
        >
          {state.atPoint ? '✓' : '○'} Sommet sur le point
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 flex-wrap">
        <button type="button" onClick={() => rotate(-1)} disabled={disabled} className={`${btn} bg-white border-slate-300 text-slate-700`} aria-label="Tourner l’équerre vers la gauche">
          <RotateCcw className="w-4 h-4 inline" aria-hidden="true" />
        </button>
        <button type="button" onClick={() => rotate(1)} disabled={disabled} className={`${btn} bg-white border-slate-300 text-slate-700`} aria-label="Tourner l’équerre vers la droite">
          <RotateCw className="w-4 h-4 inline" aria-hidden="true" />
        </button>
        {mode === 'construct' && (
          <button
            type="button" onClick={trace} disabled={disabled || !state.ok}
            className={`${btn} flex-1 bg-purple-600 border-purple-700 text-white`}
          >
            <PenLine className="w-4 h-4 inline mr-1.5" aria-hidden="true" />
            Tracer le long de l’équerre
          </button>
        )}
      </div>

      <p className={`text-center text-sm ${state.ok ? 'text-emerald-700 font-semibold' : 'text-slate-600'}`} aria-live="polite">
        {equerreHint(state)}
      </p>
    </div>
  );
}
