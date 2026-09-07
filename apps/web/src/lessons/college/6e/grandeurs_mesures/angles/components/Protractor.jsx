import React, { useState } from 'react';

import { polarToXY, arcPath, otherScale, formatDeg } from './angleUtils';

/**
 * Protractor — rapporteur demi-circulaire à DOUBLE graduation.
 *
 * La double graduation n'est pas un détail cosmétique : c'est le piège
 * central du programme (LP5). Chaque graduation porte donc DEUX nombres
 * (celui de l'échelle extérieure et son complément à 180), et taper une
 * graduation ouvre une petite bulle « 50 ou 130 ? » : l'élève doit choisir
 * lui-même, et c'est ce choix que le module corrige.
 *
 * mode="read"  → lire la mesure de l'angle placé dessous
 * mode="place" → marquer une graduation pour construire un angle
 *
 * `zeroSide` place le zéro à droite ou à gauche — indispensable pour que
 * l'élève comprenne que c'est le CÔTÉ de l'angle qui décide, pas l'habitude.
 * `misplaced` dessine l'outil décalé du sommet (rituel de placement, M3).
 */
const S = 320;
const C = S / 2;
const CY = 190;
const R = 130;

export default function Protractor({
  angleDeg,
  mode = 'read',
  rotation = 0,
  zeroSide = 'right',
  doubleGraduation = true,
  tickStep = 10,
  onReadTick,
  selectedValue = null,
  placedTick = null,
  traceRevealed = false,
  misplaced = false,
  size = 320,
  disabled = false,
  ariaLabel,
}) {
  const [picker, setPicker] = useState(null); // { outer, inner, x, y }
  const active = !disabled;
  const offset = misplaced ? { x: 26, y: -18 } : { x: 0, y: 0 };

  /** Angle affiché sur l'échelle extérieure pour une position donnée. */
  const outerFor = (posDeg) => (zeroSide === 'right' ? posDeg : 180 - posDeg);

  const ticks = [];
  for (let p = 0; p <= 180; p += tickStep) ticks.push(p);

  const rayEnd = polarToXY(C, CY, R - 12, rotation + (zeroSide === 'right' ? angleDeg : 180 - angleDeg));
  const baseEnd = polarToXY(C, CY, R - 12, rotation + (zeroSide === 'right' ? 0 : 180));

  const handleTick = (posDeg, x, y) => {
    if (!active) return;
    const outer = outerFor(posDeg);
    const inner = otherScale(outer);
    if (doubleGraduation) setPicker({ outer, inner, x, y });
    else onReadTick?.(outer);
  };

  const pick = (value) => {
    setPicker(null);
    onReadTick?.(value);
  };

  return (
    <div className="w-full max-w-[340px] mx-auto relative">
      <svg
        viewBox={`0 0 ${S} 230`}
        className="w-full select-none"
        role="img"
        aria-label={ariaLabel ?? `Rapporteur posé sur un angle${misplaced ? ', mal placé' : ''}`}
        style={{ width: size, touchAction: 'manipulation' }}
      >
        {/* L'angle mesuré, sous l'outil — décor */}
        <g style={{ pointerEvents: 'none' }}>
          <line x1={C} y1={CY} x2={baseEnd.x} y2={baseEnd.y} stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
          {(mode === 'read' || traceRevealed) && (
            <line x1={C} y1={CY} x2={rayEnd.x} y2={rayEnd.y} stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
          )}
          <circle cx={C} cy={CY} r={4} fill="#0f172a" />
        </g>

        {/* Corps du rapporteur, translucide, décalé si mal placé */}
        <g transform={`translate(${offset.x}, ${offset.y})`}>
          <g style={{ pointerEvents: 'none' }}>
            <path
              d={`M ${C - R} ${CY} A ${R} ${R} 0 0 1 ${C + R} ${CY} Z`}
              fill="#fef9c3"
              opacity={0.72}
              stroke="#ca8a04"
              strokeWidth="2"
            />
            {/* Trait de foi + centre de l'outil */}
            <line x1={C} y1={CY - 10} x2={C} y2={CY + 8} stroke="#b45309" strokeWidth="2" />
            <circle cx={C} cy={CY} r={3} fill="#b45309" />
            {/* Graduations + double étiquetage */}
            {ticks.map((p) => {
              const a = polarToXY(C, CY, R - 2, p);
              const b = polarToXY(C, CY, R - 14, p);
              // Deux couronnes bien séparées : sans écart suffisant les deux
              // séries de nombres se chevauchent près du sommet du demi-cercle
              // et deviennent illisibles — or c'est justement la lecture des
              // DEUX graduations qui est l'enjeu de la leçon.
              /* Couronne extérieure. Mesuré au balayage e2e du 2026-09-07 :
                 une étiquette à trois chiffres occupe 19,9 px de large en
                 fontSize 13, alors que l'espacement entre deux graduations à
                 10° ne vaut que 18,5 px à R − 24 — d'où le chevauchement
                 « 110 ↔ 120 » près du sommet du demi-cercle.

                 Deux corrections, mesurées et non estimées :
                 — la couronne remonte à R − 8, ce qui porte l'espacement à
                   21,3 px ;
                 — la taille passe par l'ATTRIBUT SVG `fontSize` et non par
                   `style`, car la feuille globale du site écrasait le style
                   inline (11 demandé, 13 rendu) ; la boîte tombe à 17,2 px.
                 Marge résiduelle ≈ 4 px sur TOUTE la course, sommet compris
                 (§6bis.4 : on balaie, on n'échantillonne pas). */
              const lo = polarToXY(C, CY, R - 8, p);
              /* La couronne intérieure : plus le rayon est petit, plus deux
                 étiquettes voisines se rapprochent. À R − 62 l'espacement
                 vaut ~12 px pour des nombres à trois chiffres larges de ~18 px :
                 elles se CHEVAUCHAIENT (mesuré par le balayage e2e du
                 2026-09-07, §6bis.4). On la remonte à R − 44 et on n'y
                 étiquette qu'une graduation sur deux — l'échelle intérieure
                 doit être VISIBLE et lisible, pas exhaustive ; les valeurs
                 manquantes restent annoncées par l'aria-label de chaque zone
                 tactile et par la bulle « 50 ou 130 ? ». */
              const li = polarToXY(C, CY, R - 44, p);
              const innerLabelled = p % (tickStep * 2) === 0;
              const outer = outerFor(p);
              const inner = otherScale(outer);
              const selected = selectedValue !== null && (selectedValue === outer || selectedValue === inner)
                && (placedTick === null || placedTick === p);
              return (
                <g key={p}>
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={selected ? '#dc2626' : '#a16207'} strokeWidth={selected ? 3 : 1.5} />
                  <text
                    x={lo.x} y={lo.y + 4} textAnchor="middle"
                    fontSize={10} fontFamily="monospace" fontWeight={700} letterSpacing="-0.4"
                    className="fill-amber-900"
                  >
                    {outer}
                  </text>
                  {doubleGraduation && innerLabelled && (
                    <text
                      x={li.x} y={li.y + 4} textAnchor="middle"
                      fontSize={10} fontFamily="monospace" fontWeight={600}
                      className="fill-amber-600"
                    >
                      {inner}
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* Zones tactiles : seuls éléments interactifs */}
          {ticks.map((p) => {
            const hit = polarToXY(C, CY, R - 28, p);
            return (
              <circle
                key={`hit-${p}`}
                cx={hit.x}
                cy={hit.y}
                r={13}
                fill="transparent"
                style={{ cursor: active ? 'pointer' : 'default' }}
                onClick={() => handleTick(p, hit.x + offset.x, hit.y + offset.y)}
                role="button"
                tabIndex={active ? 0 : -1}
                aria-label={`Graduation ${outerFor(p)}${doubleGraduation ? ` ou ${otherScale(outerFor(p))}` : ''} degrés`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTick(p, hit.x + offset.x, hit.y + offset.y); }
                }}
              />
            );
          })}
        </g>

        {/* Marque de construction */}
        {placedTick !== null && (
          <circle
            cx={polarToXY(C, CY, R - 2, placedTick).x}
            cy={polarToXY(C, CY, R - 2, placedTick).y}
            r={5}
            fill="#dc2626"
            style={{ pointerEvents: 'none' }}
          />
        )}
      </svg>

      {/* Bulle « 50 ou 130 ? » — le cœur pédagogique du composant */}
      {picker && (
        <div
          className="absolute z-10 bg-white border-2 border-amber-400 rounded-xl shadow-lg p-2 flex gap-2"
          style={{ left: `${(picker.x / S) * 100}%`, top: `${(picker.y / 230) * 100}%`, transform: 'translate(-50%, -120%)' }}
          role="group"
          aria-label="Quelle graduation lis-tu ?"
        >
          <button
            type="button"
            onClick={() => pick(picker.outer)}
            className="px-3 py-1.5 rounded-lg bg-amber-500 text-white font-mono font-extrabold text-sm hover:bg-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            {formatDeg(picker.outer)}
          </button>
          <button
            type="button"
            onClick={() => pick(picker.inner)}
            className="px-3 py-1.5 rounded-lg bg-white border-2 border-amber-300 text-amber-800 font-mono font-extrabold text-sm hover:border-amber-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            {formatDeg(picker.inner)}
          </button>
        </div>
      )}
    </div>
  );
}
