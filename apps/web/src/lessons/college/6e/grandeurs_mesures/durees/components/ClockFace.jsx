import React, { useCallback, useRef } from 'react';

import { polarToXY, formatTime } from './durationUtils';

/**
 * ClockFace — horloge analogique contrôlée.
 *
 * mode="display" → simple support visuel
 * mode="set"     → l'élève règle l'heure : GRANDE aiguille glissable
 *                  (pointer events sur le svg racine, aimantée à
 *                  stepMinutes), + boutons tactiles intégrés OBLIGATOIRES
 *                  (+1 h / +5 min / −5 min) — l'alternative sans glisser.
 *
 * La petite aiguille suit proportionnellement (h + min/60) et n'est JAMAIS
 * réglable seule — c'est le mécanisme réel d'une horloge, et le support de
 * la découverte « un tour de grande aiguille = +1 h » du Module 3.
 *
 * Convention d'angle : degrés depuis 12 h, sens horaire (polarToXY de
 * durationUtils).
 */
const R = 100;
const C = 110;

export default function ClockFace({
  hours,
  minutes,
  mode = 'display',
  onChange,
  stepMinutes = 5,
  showDigital = false,
  showBothNotations = false,
  bumpButtons = ['+1h', '+5min', '-5min'],
  size = 220,
  ariaLabel,
  disabled = false,
}) {
  const svgRef = useRef(null);
  const dragging = useRef(false);
  const interactive = mode === 'set' && !disabled;

  const minuteDeg = (minutes / 60) * 360;
  const hourDeg = (((hours % 12) + minutes / 60) / 12) * 360;
  const minuteTip = polarToXY(C, C, R * 0.72, minuteDeg);
  const hourTip = polarToXY(C, C, R * 0.48, hourDeg);

  /** Position du pointeur → minutes (0-55), aimantées à stepMinutes. */
  const minutesFromPointer = useCallback(
    (clientX, clientY) => {
      const rect = svgRef.current.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * (C * 2);
      const y = ((clientY - rect.top) / rect.height) * (C * 2);
      const deg = (Math.atan2(y - C, x - C) * 180) / Math.PI + 90; // 0° = midi, sens horaire
      const norm = ((deg % 360) + 360) % 360;
      const raw = (norm / 360) * 60;
      return (Math.round(raw / stepMinutes) * stepMinutes) % 60;
    },
    [stepMinutes]
  );

  const applyMinutes = (nextMin) => {
    if (!interactive) return;
    // Passage par 12 : franchir 60 vers l'avant porte l'heure (+1), revenir
    // en arrière la rend (−1) — comme une vraie horloge qu'on remonte.
    let nextH = hours;
    if (minutes >= 45 && nextMin <= 15) nextH = (hours + 1) % 24;
    else if (minutes <= 15 && nextMin >= 45) nextH = (hours + 23) % 24;
    onChange?.({ hours: nextH, minutes: nextMin });
  };

  const handlePointerDown = (e) => {
    if (!interactive) return;
    dragging.current = true;
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* ignore */ }
    applyMinutes(minutesFromPointer(e.clientX, e.clientY));
  };
  const handlePointerMove = (e) => {
    if (!dragging.current || !interactive) return;
    applyMinutes(minutesFromPointer(e.clientX, e.clientY));
  };
  const endDrag = (e) => {
    dragging.current = false;
    try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch { /* ignore */ }
  };

  const bump = (deltaMin) => {
    if (!interactive) return;
    const total = ((hours * 60 + minutes + deltaMin) % (24 * 60) + 24 * 60) % (24 * 60);
    onChange?.({ hours: Math.floor(total / 60), minutes: total % 60 });
  };

  const label = ariaLabel ?? `Horloge indiquant ${formatTime({ h: hours, min: minutes })}`;
  const afternoon = hours >= 12;
  const twelveH = hours % 12 === 0 ? 12 : hours % 12;

  return (
    <div className="w-full max-w-[260px] mx-auto space-y-2">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${C * 2} ${C * 2}`}
        className="w-full select-none"
        role={interactive ? 'slider' : 'img'}
        aria-label={interactive ? `Règle l'horloge — actuellement ${formatTime({ h: hours, min: minutes })}` : label}
        aria-valuenow={interactive ? hours * 60 + minutes : undefined}
        aria-valuemin={interactive ? 0 : undefined}
        aria-valuemax={interactive ? 1439 : undefined}
        aria-valuetext={interactive ? formatTime({ h: hours, min: minutes }) : undefined}
        style={{ touchAction: interactive ? 'none' : 'auto', width: size }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <circle cx={C} cy={C} r={R} fill="#f8fafc" stroke="#334155" strokeWidth="4" />
        {/* Graduations + chiffres — décor pur */}
        <g style={{ pointerEvents: 'none' }}>
          {Array.from({ length: 60 }).map((_, i) => {
            const major = i % 5 === 0;
            const p1 = polarToXY(C, C, R - (major ? 12 : 6), i * 6);
            const p2 = polarToXY(C, C, R - 2, i * 6);
            return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={major ? '#334155' : '#94a3b8'} strokeWidth={major ? 2.5 : 1} />;
          })}
          {Array.from({ length: 12 }).map((_, i) => {
            const n = i === 0 ? 12 : i;
            const p = polarToXY(C, C, R - 24, i * 30);
            return (
              <text key={n} x={p.x} y={p.y + 5} textAnchor="middle" style={{ fontSize: 15, fontFamily: 'monospace', fontWeight: 700 }} className="fill-slate-700">
                {n}
              </text>
            );
          })}
          {/* Petite aiguille (heures) — jamais réglable seule */}
          <line x1={C} y1={C} x2={hourTip.x} y2={hourTip.y} stroke="#334155" strokeWidth="6" strokeLinecap="round" />
          {/* Grande aiguille (minutes) */}
          <line x1={C} y1={C} x2={minuteTip.x} y2={minuteTip.y} stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
          <circle cx={C} cy={C} r={5} fill="#334155" />
          {interactive && <circle cx={minuteTip.x} cy={minuteTip.y} r={9} fill="#0284c7" opacity={0.35} />}
        </g>
      </svg>

      {showDigital && (
        <div className="text-center font-mono font-extrabold text-lg text-slate-800 bg-slate-100 rounded-lg py-1.5" aria-hidden="true">
          {formatTime({ h: hours, min: minutes })}
        </div>
      )}
      {showBothNotations && (
        <p className="text-center text-xs text-slate-500">
          {formatTime({ h: hours, min: minutes })}{' '}
          {afternoon && hours !== 12 && <>= {twelveH} h {String(minutes).padStart(2, '0')} de l'après-midi</>}
          {!afternoon && <>du matin</>}
        </p>
      )}

      {interactive && (
        <div className="flex justify-center gap-2" role="group" aria-label="Régler sans glisser">
          {bumpButtons.includes('+1h') && (
            <button type="button" onClick={() => bump(60)} className="px-3 py-1.5 rounded-lg border-2 border-slate-200 bg-white text-xs font-bold text-slate-700 hover:border-sky-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400">
              +1 h
            </button>
          )}
          {bumpButtons.includes('+5min') && (
            <button type="button" onClick={() => bump(5)} className="px-3 py-1.5 rounded-lg border-2 border-slate-200 bg-white text-xs font-bold text-slate-700 hover:border-sky-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400">
              +5 min
            </button>
          )}
          {bumpButtons.includes('-5min') && (
            <button type="button" onClick={() => bump(-5)} className="px-3 py-1.5 rounded-lg border-2 border-slate-200 bg-white text-xs font-bold text-slate-700 hover:border-sky-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400">
              −5 min
            </button>
          )}
        </div>
      )}
    </div>
  );
}
