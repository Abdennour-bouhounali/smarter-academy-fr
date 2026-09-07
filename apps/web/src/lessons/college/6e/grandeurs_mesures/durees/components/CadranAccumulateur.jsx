import React from 'react';

import { polarToXY, formatTime, formatDuration } from './durationUtils';

/**
 * CadranAccumulateur — faire tourner la grande aiguille et voir la durée
 * S'ACCUMULER, avec la retenue de 60 qui se produit sous les yeux.
 *
 * ACTION       l'élève attrape la grande aiguille et la fait tourner autant
 *              de tours qu'il veut, dans les deux sens.
 * CHANGE       l'heure affichée avance ; la petite aiguille suit le
 *              mécanisme ; et un compteur de durée écoulée s'incrémente en
 *              suivant le geste, minute par minute.
 * OBSERVATION  au moment où l'aiguille repasse sur le 12, les minutes
 *              accumulées ne deviennent PAS 100 : elles retombent à 0 et
 *              l'heure gagne 1. Le passage se voit, il ne se récite pas.
 * SENS         le temps n'est pas décimal : la retenue se fait à 60, ce qui
 *              interdit d'écrire « 1 h 30 = 1,30 h ».
 *
 * Pourquoi PAS `UnitLadder` (l'escalier ×10 des longueurs) : le système
 * sexagésimal n'a pas de marches égales, et la leçon garde volontairement
 * son `EscalierDuTemps` à marches inégales. Le cadran est l'objet où la
 * base 60 est mécaniquement vraie.
 *
 * L'état mathématique est UN entier : `elapsed`, le nombre de minutes
 * écoulées depuis le départ. L'heure courante, les deux aiguilles, la
 * décomposition « h et min » et le compteur de tours en dérivent tous — la
 * retenue de 60 n'est donc jamais écrite à la main, elle est la division
 * euclidienne de `elapsed` par 60.
 *
 * Sécurité visuelle (§6bis.4) : seuls les douze chiffres du cadran vivent en
 * <text> SVG, à des positions fixes ; l'heure, la durée et le compte de
 * tours sont dans le DOM. Aucun état atteignable ne peut donc produire un
 * chevauchement.
 *
 * Pas de prop `disabled` : la manipulation reste vivante après validation.
 */
const R = 100;
const C = 110;
const SNAP = 5; // minutes

export default function CadranAccumulateur({
  start,            // { hours, minutes } — l'instant de départ
  elapsed,          // minutes écoulées depuis le départ (≥ 0)
  onChange,         // (nouveauElapsed) => void
  maxElapsed = 24 * 60,
  showDigital = true,
  highlightCarry = true,
}) {
  const svgRef = React.useRef(null);
  const dragging = React.useRef(false);

  const startTotal = start.hours * 60 + start.minutes;
  const nowTotal = (startTotal + elapsed) % (24 * 60);
  const hours = Math.floor(nowTotal / 60);
  const minutes = nowTotal % 60;

  const minuteDeg = (minutes / 60) * 360;
  const hourDeg = (((hours % 12) + minutes / 60) / 12) * 360;
  const minuteTip = polarToXY(C, C, R * 0.72, minuteDeg);
  const hourTip = polarToXY(C, C, R * 0.48, hourDeg);

  const tours = Math.floor(elapsed / 60);
  const resteMin = elapsed % 60;
  // Le franchissement du 12 vient d'avoir lieu : on le signale pendant que
  // l'aiguille est encore dans les premières minutes du nouveau tour.
  const justCarried = highlightCarry && tours > 0 && resteMin <= 10;

  /* Le geste : la position du pointeur donne une position d'aiguille (0-59).
     On la raccorde à `elapsed` par le CHEMIN LE PLUS COURT depuis la
     position actuelle — c'est ainsi qu'une vraie aiguille se remonte : la
     franchir vers l'avant fait avancer l'heure, la franchir en arrière la
     rend. La retenue de 60 n'est donc pas une règle appliquée, c'est le
     mécanisme lui-même. */
  const applyPointer = (clientX, clientY) => {
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * (C * 2);
    const y = ((clientY - rect.top) / rect.height) * (C * 2);
    const deg = (Math.atan2(y - C, x - C) * 180) / Math.PI + 90;
    const norm = ((deg % 360) + 360) % 360;
    const target = (Math.round((norm / 360) * 60 / SNAP) * SNAP) % 60;

    // Écart signé le plus court entre la minute actuelle et la visée.
    let delta = target - minutes;
    if (delta > 30) delta -= 60;
    if (delta < -30) delta += 60;
    const next = Math.min(maxElapsed, Math.max(0, elapsed + delta));
    if (next !== elapsed) onChange(next);
  };

  const begin = (e) => {
    dragging.current = true;
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* ignore */ }
    applyPointer(e.clientX, e.clientY);
  };
  const move = (e) => { if (dragging.current) applyPointer(e.clientX, e.clientY); };
  const end = (e) => {
    dragging.current = false;
    try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch { /* ignore */ }
  };

  return (
    <div className="space-y-2">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${C * 2} ${C * 2}`}
        className="w-full max-w-[250px] mx-auto select-none block"
        role="slider"
        tabIndex={0}
        aria-label="Grande aiguille — fais-la tourner pour laisser le temps passer"
        aria-valuemin={0}
        aria-valuemax={maxElapsed}
        aria-valuenow={elapsed}
        aria-valuetext={`${formatDuration({ h: Math.floor(elapsed / 60), min: elapsed % 60 })} écoulées, il est ${formatTime({ h: hours, min: minutes })}`}
        style={{ touchAction: 'none' }}
        onPointerDown={begin}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        onKeyDown={(e) => {
          const m = { ArrowRight: SNAP, ArrowUp: SNAP, ArrowLeft: -SNAP, ArrowDown: -SNAP, PageUp: 60, PageDown: -60 };
          if (e.key in m) { e.preventDefault(); onChange(Math.min(maxElapsed, Math.max(0, elapsed + m[e.key]))); }
          if (e.key === 'Home') { e.preventDefault(); onChange(0); }
        }}
      >
        <circle
          cx={C} cy={C} r={R}
          fill={justCarried ? '#ecfdf5' : '#f8fafc'}
          stroke={justCarried ? '#059669' : '#334155'}
          strokeWidth="4"
        />
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
          {/* L'arc du tour EN COURS : ce qui a été parcouru depuis le dernier
              passage sur le 12. C'est lui qui se vide d'un coup à la retenue. */}
          {resteMin > 0 && (
            <path
              d={`M ${C} ${C} L ${polarToXY(C, C, R * 0.62, 0).x} ${polarToXY(C, C, R * 0.62, 0).y} A ${R * 0.62} ${R * 0.62} 0 ${resteMin > 30 ? 1 : 0} 1 ${polarToXY(C, C, R * 0.62, (resteMin / 60) * 360).x} ${polarToXY(C, C, R * 0.62, (resteMin / 60) * 360).y} Z`}
              fill="#bae6fd"
              opacity={0.55}
            />
          )}
          <line x1={C} y1={C} x2={hourTip.x} y2={hourTip.y} stroke="#334155" strokeWidth="6" strokeLinecap="round" />
          <line x1={C} y1={C} x2={minuteTip.x} y2={minuteTip.y} stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
          <circle cx={C} cy={C} r={5} fill="#334155" />
        </g>
        {/* La poignée de la grande aiguille : cible tactile r = 22 en viewBox
            de 220 rendue sur ~250 px → ~50 px. */}
        <circle cx={minuteTip.x} cy={minuteTip.y} r={22} fill="transparent" style={{ cursor: 'grab' }} />
        <circle cx={minuteTip.x} cy={minuteTip.y} r={10} fill="#e11d48" stroke="#ffffff" strokeWidth="3" style={{ cursor: 'grab', pointerEvents: 'none' }} />
      </svg>

      {/* Tous les nombres dans le DOM. La décomposition h / min EST la
          division euclidienne de `elapsed` par 60 : la retenue est calculée,
          jamais écrite à la main. */}
      <div className="space-y-1.5" role="status" aria-live="polite">
        {showDigital && (
          <p className="text-center font-mono font-extrabold text-lg text-slate-800 bg-slate-100 rounded-lg py-1.5">
            {formatTime({ h: hours, min: minutes })}
          </p>
        )}
        <div className="grid grid-cols-2 gap-2">
          <div className={`rounded-xl border-2 p-2 text-center transition-colors ${justCarried ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
            <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">Tours complets</p>
            <p className="font-mono font-black text-xl text-slate-800">{tours}</p>
          </div>
          <div className="rounded-xl border-2 border-sky-200 bg-sky-50 p-2 text-center">
            <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-sky-700">Dans le tour</p>
            <p className="font-mono font-black text-xl text-sky-800">{resteMin} min</p>
          </div>
        </div>
        <p className="text-center font-mono text-sm text-slate-700">
          Temps écoulé : <strong>{elapsed} min</strong>
          {tours > 0 && (
            <>
              {' '}= <strong>{formatDuration({ h: tours, min: resteMin }) || '0 min'}</strong>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
