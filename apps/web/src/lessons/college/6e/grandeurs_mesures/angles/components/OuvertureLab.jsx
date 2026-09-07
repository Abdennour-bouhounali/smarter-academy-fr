import React from 'react';

import { polarToXY, arcPath, angleFromPointer, formatDeg } from './angleUtils';

/**
 * OuvertureLab — TROIS poignées indépendantes sur le même angle : faire
 * tourner le côté mobile, et rallonger chacun des deux côtés séparément.
 *
 * ACTION       l'élève attrape le BOUT d'un côté. Sur le côté mobile, il le
 *              fait tourner (ouverture) ; sur les glissières radiales, il
 *              allonge ou raccourcit chaque côté.
 * CHANGE       la mesure affichée suit la ROTATION — et ne bronche pas d'un
 *              degré quand les côtés s'allongent, si longs soient-ils.
 * OBSERVATION  deux gestes, un seul effet sur le nombre. La longueur des
 *              côtés est mathématiquement inerte.
 * SENS         un angle mesure une OUVERTURE, pas une taille. C'est ce qui
 *              justifie qu'on le mesure en degrés et non en centimètres.
 *
 * Misconception ciblée : « l'angle aux côtés longs est plus grand ». Deux
 * figures juxtaposées la contredisent par autorité ; ici, l'élève tire
 * lui-même les côtés et voit le nombre ne pas bouger — c'est sa propre main
 * qui réfute son intuition.
 *
 * L'état mathématique est un triplet (deg, r0, r1) dont deux composantes
 * n'ont AUCUN effet sur la mesure : c'est précisément ce que le composant
 * doit rendre observable, donc les trois sont vraiment réglables et le
 * journal des gestes distingue « tu as tourné » de « tu as rallongé ».
 *
 * Sécurité visuelle (§6bis.4) : le cadre est taillé pour le rayon MAXIMAL,
 * la mesure vit dans le DOM sous la figure (jamais en <text> SVG), et
 * l'unique étiquette SVG — l'arc — est posée sur la bissectrice à un rayon
 * FIXE, indépendant de la longueur des côtés : elle ne peut donc ni sortir
 * du cadre ni croiser un côté, quel que soit l'état.
 *
 * Aucune prop `disabled` : la manipulation reste vivante après validation.
 */
const R_MAX = 100;
const S = (R_MAX + 22) * 2;   // le cadre contient le rayon maximal
const C = S / 2;
const SNAP = 5;

export default function OuvertureLab({
  deg,
  rayLengths,          // [r0, r1] en unités de dessin
  onDeg,
  onRay,               // (index, value) => void
  minDeg = 5,
  maxDeg = 175,
  minRay = 35,
  maxRay = R_MAX,
  showMeasure = true,
  tone = 'sky',
}) {
  const colors = {
    sky: { ray: '#0284c7', arc: '#0ea5e9', fill: '#e0f2fe' },
    violet: { ray: '#7c3aed', arc: '#8b5cf6', fill: '#ede9fe' },
    emerald: { ray: '#059669', arc: '#10b981', fill: '#d1fae5' },
  }[tone] ?? { ray: '#0284c7', arc: '#0ea5e9', fill: '#e0f2fe' };

  const svgRef = React.useRef(null);
  const rotating = React.useRef(false);

  const fixedEnd = polarToXY(C, C, rayLengths[0], 0);
  const mobileEnd = polarToXY(C, C, rayLengths[1], deg);

  /* La rotation : le geste est angulaire, aucun hook linéaire ne convient —
     on convertit directement la position du pointeur en angle autour du
     sommet. C'est bien « saisir l'objet lui-même » (le côté mobile), pas un
     curseur déporté. */
  const degFromPointer = (clientX, clientY) => {
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * S;
    const y = ((clientY - rect.top) / rect.height) * S;
    const abs = angleFromPointer(C, C, x, y);
    const snapped = Math.round(abs / SNAP) * SNAP;
    return Math.min(maxDeg, Math.max(minDeg, snapped));
  };

  const beginRotate = (e) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    rotating.current = true;
    onDeg(degFromPointer(e.clientX, e.clientY));
  };
  const moveRotate = (e) => {
    if (!rotating.current) return;
    onDeg(degFromPointer(e.clientX, e.clientY));
  };
  const endRotate = (e) => {
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    rotating.current = false;
  };

  /* Les longueurs : le geste est RADIAL — la nouvelle longueur d'un côté
     est la distance du pointeur au sommet, calée au pas de 5. Un hook
     linéaire (x ou y) serait faux dès que le côté n'est pas aligné sur
     l'axe choisi ; ici la poignée suit exactement le doigt, quel que soit
     l'angle courant. C'est bien « saisir le bout du côté et le tirer ». */
  const stretching = React.useRef(null);

  const rayFromPointer = (clientX, clientY) => {
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * S;
    const y = ((clientY - rect.top) / rect.height) * S;
    const d = Math.hypot(x - C, y - C);
    return Math.min(maxRay, Math.max(minRay, Math.round(d / 5) * 5));
  };

  const beginStretch = (i) => (e) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    stretching.current = i;
    onRay(i, rayFromPointer(e.clientX, e.clientY));
  };
  const moveStretch = (e) => {
    if (stretching.current === null) return;
    onRay(stretching.current, rayFromPointer(e.clientX, e.clientY));
  };
  const endStretch = (e) => {
    if (stretching.current === null) return;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    stretching.current = null;
  };

  /* Pilotage clavier des longueurs : la manipulation reste faisable sans
     souris ni doigt (les flèches allongent et raccourcissent le côté). */
  const rayKeys = (i) => (e) => {
    const m = { ArrowRight: 5, ArrowUp: 5, ArrowLeft: -5, ArrowDown: -5 };
    if (e.key in m) {
      e.preventDefault();
      onRay(i, Math.min(maxRay, Math.max(minRay, rayLengths[i] + m[e.key])));
    }
    if (e.key === 'Home') { e.preventDefault(); onRay(i, minRay); }
    if (e.key === 'End') { e.preventDefault(); onRay(i, maxRay); }
  };

  // L'arc garde un rayon FIXE : il ne suit pas la longueur des côtés — ce
  // qui est mathématiquement juste (l'ouverture ne dépend pas d'eux) et
  // garantit qu'il ne sort jamais du cadre.
  const arcR = 34;

  return (
    <div className="space-y-2">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${S} ${S}`}
        className="w-full max-w-[280px] mx-auto select-none block"
        role="group"
        aria-label="Angle à ouvrir et dont les côtés se rallongent"
        style={{ touchAction: 'none' }}
        onPointerMove={(e) => { moveRotate(e); moveStretch(e); }}
        onPointerUp={(e) => { if (rotating.current) endRotate(e); endStretch(e); }}
        onPointerCancel={(e) => { if (rotating.current) endRotate(e); endStretch(e); }}
      >
        <g style={{ pointerEvents: 'none' }}>
          <path
            d={`M ${C} ${C} L ${polarToXY(C, C, arcR, 0).x} ${polarToXY(C, C, arcR, 0).y} ${arcPath(C, C, arcR, 0, deg)} Z`}
            fill={colors.fill}
            opacity={0.9}
          />
          <path d={arcPath(C, C, arcR, 0, deg)} fill="none" stroke={colors.arc} strokeWidth="2.5" />
          <line x1={C} y1={C} x2={fixedEnd.x} y2={fixedEnd.y} stroke={colors.ray} strokeWidth="4" strokeLinecap="round" />
          <line x1={C} y1={C} x2={mobileEnd.x} y2={mobileEnd.y} stroke={colors.ray} strokeWidth="4" strokeLinecap="round" />
          <circle cx={C} cy={C} r={4.5} fill="#1e293b" />
        </g>

        {/* Poignée de ROTATION : posée sur le côté mobile, un peu en deçà de
            son bout, pour ne jamais recouvrir la poignée d'allongement. */}
        <g
          onPointerDown={beginRotate}
          role="slider" tabIndex={0}
          aria-label="Fais tourner le côté mobile — c’est cela qui ouvre l’angle"
          aria-valuemin={minDeg} aria-valuemax={maxDeg} aria-valuenow={deg}
          aria-valuetext={formatDeg(deg)}
          onKeyDown={(e) => {
            const m = { ArrowRight: SNAP, ArrowUp: SNAP, ArrowLeft: -SNAP, ArrowDown: -SNAP };
            if (e.key in m) { e.preventDefault(); onDeg(Math.min(maxDeg, Math.max(minDeg, deg + m[e.key]))); }
          }}
          style={{ cursor: 'grab', touchAction: 'none', outline: 'none' }}
        >
          <circle
            cx={polarToXY(C, C, Math.max(minRay - 12, rayLengths[1] * 0.62), deg).x}
            cy={polarToXY(C, C, Math.max(minRay - 12, rayLengths[1] * 0.62), deg).y}
            r={22} fill="transparent"
          />
          <circle
            cx={polarToXY(C, C, Math.max(minRay - 12, rayLengths[1] * 0.62), deg).x}
            cy={polarToXY(C, C, Math.max(minRay - 12, rayLengths[1] * 0.62), deg).y}
            r={9} fill={colors.arc} stroke="#ffffff" strokeWidth="3"
          />
        </g>

        {/* Poignées d'ALLONGEMENT : les deux bouts de côté. Cible tactile
            r = 20 en viewBox de 244 rendue sur ~280 px → ~46 px. */}
        {[0, 1].map((i) => {
          const end = i === 0 ? fixedEnd : mobileEnd;
          return (
            <g
              key={i}
              onPointerDown={beginStretch(i)}
              role="slider"
              tabIndex={0}
              aria-label={`Longueur du côté ${i === 0 ? 'fixe' : 'mobile'} — la rallonger ne change pas la mesure`}
              aria-valuemin={minRay}
              aria-valuemax={maxRay}
              aria-valuenow={rayLengths[i]}
              aria-valuetext={`côté de ${rayLengths[i]} unités, angle toujours ${formatDeg(deg)}`}
              onKeyDown={rayKeys(i)}
              style={{ cursor: 'ew-resize', touchAction: 'none', outline: 'none' }}
            >
              <circle cx={end.x} cy={end.y} r={20} fill="transparent" />
              <circle cx={end.x} cy={end.y} r={7} fill="#ffffff" stroke="#e11d48" strokeWidth="3" />
            </g>
          );
        })}
      </svg>

      {showMeasure && (
        <div className="text-center" role="status" aria-live="polite">
          <p className="font-mono font-black text-3xl text-slate-800">{formatDeg(deg)}</p>
          <p className="font-mono text-xs text-slate-500">
            côtés : {rayLengths[0]} et {rayLengths[1]} unités
          </p>
        </div>
      )}
    </div>
  );
}
