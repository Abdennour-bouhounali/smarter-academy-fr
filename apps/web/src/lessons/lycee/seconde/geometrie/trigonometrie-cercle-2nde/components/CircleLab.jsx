import React, { useRef } from 'react';
import { TAU, principal, pointOf, toDegrees, fr } from './trigoUtils';

/**
 * CircleLab — LA manipulation signature de la leçon (INTERACTION_PEDAGOGY §6bis).
 *
 * Activité :
 *  - objectif : faire voir que le réel t n'est pas un angle « en degrés
 *    déguisés » mais une LONGUEUR — celle du fil qu'on enroule sur le cercle —
 *    et que cosinus et sinus sont les deux coordonnées du point d'arrivée ;
 *  - action de l'élève : tirer le point le long du cercle (ou le clavier) ;
 *  - variable contrôlée : t, la longueur d'arc parcourue depuis (1 ; 0) ;
 *  - conséquence visuelle immédiate : l'arc se peint, la corde-abscisse et la
 *    corde-ordonnée se redessinent, les deux nombres changent EN MÊME TEMPS.
 *
 * Rien n'est figé après validation : l'élève peut continuer à tourner.
 */
const R = 92;          // rayon à l'écran, en px
const CX = 130;
const CY = 130;

export default function CircleLab({
  t,
  onChange,
  showCos = true,
  showSin = true,
  showArc = true,
  showDegrees = false,
  marks = [],           // [{ t, label, color }] repères fixes (valeurs remarquables)
  label = 'Cercle trigonométrique',
}) {
  const svgRef = useRef(null);
  const p = pointOf(t);
  const px = CX + R * p.x;
  const py = CY - R * p.y;

  const pointAt = (angle) => ({ x: CX + R * Math.cos(angle), y: CY - R * Math.sin(angle) });

  /** L'arc parcouru, de 0 à t, dans le sens direct. */
  const arcPath = () => {
    const a = principal(t);
    if (a < 1e-6) return '';
    const end = pointAt(a);
    const large = a > Math.PI ? 1 : 0;
    return `M ${CX + R} ${CY} A ${R} ${R} 0 ${large} 0 ${end.x} ${end.y}`;
  };

  /** Position → réel t : c'est la géométrie qui décide, pas un compteur. */
  const fromEvent = (e) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const r = svg.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 260 - CX;
    const y = CY - ((e.clientY - r.top) / r.height) * 260;
    if (Math.hypot(x, y) < 12) return null;
    return principal(Math.atan2(y, x));
  };

  const handlePointer = (e) => {
    if (!onChange) return;
    const next = fromEvent(e);
    if (next !== null) onChange(next);
  };

  const onKey = (e) => {
    if (!onChange) return;
    const step = e.shiftKey ? TAU / 24 : TAU / 72;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); onChange(principal(t + step)); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); onChange(principal(t - step)); }
    if (e.key === 'Home') { e.preventDefault(); onChange(0); }
  };

  return (
    <div role="group" aria-label={label} className="rounded-2xl border-2 border-slate-200 bg-white p-3">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <svg
          ref={svgRef}
          viewBox="0 0 260 260"
          className="w-full max-w-[260px] touch-none select-none"
          onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); handlePointer(e); }}
          onPointerMove={(e) => { if (e.buttons === 1) handlePointer(e); }}
          role="img"
          aria-label={`Point du cercle pour t = ${fr(t)} radians, coordonnées (${fr(p.x)} ; ${fr(p.y)})`}
        >
          {/* axes */}
          <line x1={CX - R - 18} y1={CY} x2={CX + R + 18} y2={CY} stroke="#94a3b8" strokeWidth="1.5" />
          <line x1={CX} y1={CY - R - 18} x2={CX} y2={CY + R + 18} stroke="#94a3b8" strokeWidth="1.5" />
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="#cbd5e1" strokeWidth="2" />

          {/* repères remarquables, s'il y en a */}
          {marks.map((m) => {
            const q = pointAt(m.t);
            return (
              <g key={m.label}>
                <circle cx={q.x} cy={q.y} r="3" fill={m.color ?? '#a78bfa'} />
              </g>
            );
          })}

          {/* l'arc parcouru : c'est LUI la mesure en radians */}
          {showArc && <path d={arcPath()} fill="none" stroke="#7c3aed" strokeWidth="4" strokeLinecap="round" />}

          {/* les deux coordonnées, dessinées comme des projections */}
          {showCos && <line x1={px} y1={py} x2={px} y2={CY} stroke="#4f46e5" strokeWidth="2.5" strokeDasharray="5 4" />}
          {showSin && <line x1={px} y1={py} x2={CX} y2={py} stroke="#059669" strokeWidth="2.5" strokeDasharray="5 4" />}
          {showCos && <line x1={CX} y1={CY} x2={px} y2={CY} stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" />}
          {showSin && <line x1={CX} y1={CY} x2={CX} y2={py} stroke="#059669" strokeWidth="4" strokeLinecap="round" />}

          <line x1={CX} y1={CY} x2={px} y2={py} stroke="#0f172a" strokeWidth="1.5" />
          <circle
            cx={px} cy={py} r="7" fill="#7c3aed" stroke="#fff" strokeWidth="2.5"
            tabIndex={onChange ? 0 : -1}
            role={onChange ? 'slider' : undefined}
            aria-label={onChange ? 'Point sur le cercle' : undefined}
            aria-valuenow={onChange ? Number(t.toFixed(3)) : undefined}
            aria-valuemin={onChange ? 0 : undefined}
            aria-valuemax={onChange ? Number(TAU.toFixed(3)) : undefined}
            onKeyDown={onKey}
            className={onChange ? 'cursor-grab focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500' : ''}
          />
          <text x={CX + R + 6} y={CY + 14} fontSize="11" fill="#64748b">1</text>
          <text x={CX + 6} y={CY - R - 6} fontSize="11" fill="#64748b">1</text>
        </svg>

        <div className="w-full sm:w-52 space-y-2 font-mono text-sm">
          <div className="rounded-xl border-2 border-violet-200 bg-violet-50 px-3 py-2">
            <div className="text-[11px] uppercase font-bold text-violet-500">arc parcouru</div>
            <div className="font-extrabold text-violet-900" data-testid="t-value">t = {fr(t)} rad</div>
            {showDegrees && <div className="text-xs text-violet-700">soit {fr(toDegrees(principal(t)), 1)}°</div>}
          </div>
          <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 px-3 py-2">
            <div className="text-[11px] uppercase font-bold text-indigo-500">abscisse</div>
            <div className="font-extrabold text-indigo-900" data-testid="cos-value">cos t = {fr(p.x)}</div>
          </div>
          <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 px-3 py-2">
            <div className="text-[11px] uppercase font-bold text-emerald-500">ordonnée</div>
            <div className="font-extrabold text-emerald-900" data-testid="sin-value">sin t = {fr(p.y)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
