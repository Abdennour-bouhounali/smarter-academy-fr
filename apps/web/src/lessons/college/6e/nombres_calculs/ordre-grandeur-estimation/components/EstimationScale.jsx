import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useDragValue } from '../../../../../common/manip6e';
import { formatFr } from './estimationUtils';

/**
 * EstimationScale — LA manipulation signature d'« Ordre de grandeur ».
 *
 * Activity: poser soi-même un curseur sur une échelle pour dire « à peu près
 *   combien », AVANT que le résultat exact existe à l'écran.
 * Mathematical objective: on peut juger un résultat sans le calculer. Un ordre
 *   de grandeur est une TAILLE, pas une valeur — et deux nombres très
 *   différents peuvent occuper la même case de l'échelle.
 * Student action: on empoigne le curseur sur la règle et on le fait glisser ;
 *   rien à valider entre le geste et sa conséquence.
 * Controlled variable: UNE estimation, en unités mathématiques.
 * Mathematical state: `value`. La position du curseur, la lecture chiffrée, la
 *   bande de l'ordre de grandeur et (après révélation) l'écart en dérivent tous.
 * Visual consequence: le curseur se déplace, la bande de l'ordre de grandeur
 *   s'allume sous lui, et à la révélation un second repère apparaît — l'écart
 *   entre les deux EST le retour.
 * Expected observation: on peut se tromper de 40 et rester au bon ordre de
 *   grandeur ; on peut se tromper de 600 et en changer complètement.
 * Misconception targeted: « il faut calculer pour savoir » et « une estimation
 *   fausse de 40, c'est une estimation ratée ».
 * Feedback: aucun jugement ici. Le composant montre la position, la bande et
 *   l'écart ; c'est le module qui interprète.
 * Formalization: la brique « ordre-de-grandeur » est posée par le module APRÈS
 *   que l'élève a jugé sans calculer.
 * Scaffolding: le curseur reste vivant après la révélation (règle projet) —
 *   c'est en le redéplaçant qu'on voit ce qui change de bande et ce qui n'en
 *   change pas.
 * Transfer: la même échelle sert à juger une somme (M4), une différence (M5)
 *   et un produit (M6).
 *
 * ÉCHELLE COMPRIMÉE. Une règle linéaire de 0 à 2 000 écrase 0–100 dans trois
 * pixels : impossible d'y « poser » 60 avec le doigt. L'échelle est donc
 * découpée en BANDES d'ordre de grandeur de largeur égale (les dizaines, les
 * centaines, les milliers), chacune graduée linéairement à l'intérieur. C'est
 * exactement l'objet de la leçon rendu visible : ce qui compte est la bande,
 * pas la position au chiffre près.
 *
 * §17bis — les nombres vivent dans le DOM sous la figure ; le SVG ne porte que
 * les graduations de bande, dont la place ne dépend d'aucune valeur saisie.
 */

const W = 620;
const H = 132;
const PAD = 30;

/** Les bandes de l'échelle : [borne basse, borne haute, nom]. */
export const BANDS = [
  [0, 10, 'moins de 10'],
  [10, 100, 'des dizaines'],
  [100, 1000, 'des centaines'],
  [1000, 10000, 'des milliers'],
];

/** Position 0..1 d'une valeur sur l'échelle comprimée (bandes de largeur égale). */
export function toRatio(v) {
  const n = BANDS.length;
  for (let i = 0; i < n; i += 1) {
    const [lo, hi] = BANDS[i];
    if (v < hi || i === n - 1) {
      const inside = Math.max(0, Math.min(1, (v - lo) / (hi - lo)));
      return Math.min(1, (i + inside) / n);
    }
  }
  return 1;
}

/** L'inverse : une position 0..1 → la valeur qu'elle désigne. */
export function fromRatio(t) {
  const n = BANDS.length;
  const scaled = Math.max(0, Math.min(1, t)) * n;
  const i = Math.min(n - 1, Math.floor(scaled));
  const [lo, hi] = BANDS[i];
  return lo + (scaled - i) * (hi - lo);
}

/** Le nom de la bande d'un nombre — son ordre de grandeur. */
export function bandOf(v) {
  for (let i = 0; i < BANDS.length; i += 1) {
    if (v < BANDS[i][1] || i === BANDS.length - 1) return { index: i, label: BANDS[i][2] };
  }
  return { index: BANDS.length - 1, label: BANDS[BANDS.length - 1][2] };
}

export default function EstimationScale({
  value,
  onChange,
  exact = null,          // révélé par le module, jamais avant le geste
  revealed = false,
  ariaLabel = 'Ton estimation',
}) {
  const svgRef = useRef(null);
  const [scale, setScale] = useState(1);
  // Le focus de la prise : il dessine un anneau sur la pastille VISIBLE, au
  // lieu du contour noir du navigateur sur la zone de captation transparente.
  const [focused, setFocused] = useState(false);

  useLayoutEffect(() => {
    const el = svgRef.current;
    if (!el) return undefined;
    const measure = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 0) setScale(W / r.width);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);
  const grip = Math.max(28, 45 * scale);

  const drag = useDragValue({
    value,
    onChange,
    min: 0,
    max: BANDS[BANDS.length - 1][1],
    // Le pas suit la bande : on ne demande pas à l'élève de viser l'unité près
    // dans les milliers, ni de sauter de 100 en 100 dans les dizaines.
    step: value >= 1000 ? 50 : value >= 100 ? 10 : 1,
    axis: 'x',
    toValue: fromRatio,
    ariaLabel,
    valueText: (v) => `${formatFr(Math.round(v))} — ${bandOf(v).label}`,
  });

  const setRefs = useCallback((node) => {
    svgRef.current = node;
    const r = drag.frameProps.ref;
    if (r) r.current = node;
  }, [drag.frameProps.ref]);

  const axisY = 62;
  // Le curseur a un rayon de 11 + 3 de contour : la course est rentrée
  // d'autant, sinon il déborderait du cadre à 0 et au maximum (§17bis).
  const EDGE = 15;
  const toX = (t) => PAD + EDGE + t * (W - 2 * PAD - 2 * EDGE);
  const bandW = (W - 2 * PAD) / BANDS.length;

  const cursorX = toX(toRatio(value));
  const exactX = exact != null ? toX(toRatio(exact)) : null;

  const myBand = bandOf(value);
  const exactBand = exact != null ? bandOf(exact) : null;
  const sameBand = exactBand ? myBand.index === exactBand.index : null;

  return (
    <div className="space-y-3" role="group" aria-label="Échelle d’estimation" data-es-value={Math.round(value)} data-es-band={myBand.index} data-es-revealed={revealed ? '1' : '0'}>
      <div className="rounded-2xl border-2 border-slate-200 bg-white overflow-hidden">
        <svg
          ref={setRefs}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto block select-none"
          style={{ touchAction: 'none' }}
          role="group"
          aria-label={`Échelle : ton estimation est ${formatFr(Math.round(value))}`}
        >
          {/* Les bandes d'ordre de grandeur. Leur largeur ne dépend d'aucune
              valeur saisie : impossible qu'une étiquette sorte du cadre. */}
          {BANDS.map(([lo, hi, name], i) => (
            <g key={name}>
              <rect
                x={PAD + i * bandW}
                y={axisY - 26}
                width={bandW}
                height={52}
                fill={i === myBand.index ? '#ede9fe' : i % 2 ? '#f8fafc' : '#fff'}
                stroke="#e2e8f0"
                strokeWidth="1.5"
              />
              <text
                x={PAD + i * bandW + bandW / 2}
                y={axisY - 32}
                textAnchor="middle"
                fontSize="12"
                fontWeight={i === myBand.index ? '800' : '600'}
                fill={i === myBand.index ? '#6d28d9' : '#94a3b8'}
                fontFamily="ui-monospace, monospace"
              >
                {name}
              </text>
              <text
                x={PAD + i * bandW}
                y={axisY + 42}
                textAnchor="middle"
                fontSize="11"
                fill="#94a3b8"
                fontFamily="ui-monospace, monospace"
              >
                {formatFr(lo)}
              </text>
              {i === BANDS.length - 1 && (
                <text x={PAD + (i + 1) * bandW} y={axisY + 42} textAnchor="middle" fontSize="11" fill="#94a3b8" fontFamily="ui-monospace, monospace">
                  {formatFr(hi)}
                </text>
              )}
            </g>
          ))}

          {/* Le repère du résultat exact — seulement après la révélation. */}
          {revealed && exactX != null && (
            <g pointerEvents="none">
              <line x1={exactX} y1={axisY - 30} x2={exactX} y2={axisY + 30} stroke="#059669" strokeWidth="3" />
              <circle cx={exactX} cy={axisY - 30} r="6" fill="#059669" />
            </g>
          )}

          {/* L'écart entre l'estimation et l'exact : c'est LUI le retour. */}
          {revealed && exactX != null && Math.abs(exactX - cursorX) > 2 && (
            <line
              x1={Math.min(cursorX, exactX)} y1={axisY + 22}
              x2={Math.max(cursorX, exactX)} y2={axisY + 22}
              stroke={sameBand ? '#f59e0b' : '#e11d48'} strokeWidth="3" strokeDasharray="5 4"
              pointerEvents="none"
            />
          )}

          {/* LA PRISE : le curseur lui-même, ≥ 44 px mesurés. */}
          <rect
            x={cursorX - grip / 2}
            y={axisY - 30}
            width={grip}
            height={60}
            fill="transparent"
            cursor="ew-resize"
            {...drag.handleProps}
            {...drag.a11yProps}
            style={{ ...drag.handleProps.style, outline: 'none' }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          <g pointerEvents="none">
            <line x1={cursorX} y1={axisY - 30} x2={cursorX} y2={axisY + 30} stroke="#4c1d95" strokeWidth="3" />
            {/* L'anneau de focus, dessiné sur la pastille visible. Rayon 16,5 :
                la course est déjà rentrée de EDGE = 15 px depuis PAD = 30, donc
                le bord de l'anneau reste à ≥ 28 px des bords du cadre, à toute
                position, y compris 0 et le maximum (§17bis). */}
            {focused && <circle cx={cursorX} cy={axisY} r="16.5" fill="none" stroke="#7c3aed" strokeWidth="3" opacity="0.9" />}
            <circle cx={cursorX} cy={axisY} r="11" fill="#7c3aed" stroke="#fff" strokeWidth="3" />
            <circle cx={cursorX} cy={axisY} r="3.5" fill="#fff" />
          </g>
        </svg>
      </div>

      {/* Lecture chiffrée — dans le DOM, à l'abri de toute collision. */}
      <div className={`grid gap-2 ${revealed && exact != null ? 'grid-cols-2' : 'grid-cols-1'}`}>
        <div className="rounded-xl border-2 border-violet-300 bg-violet-50 py-2 text-center" role="status" aria-live="polite">
          <div className="text-[11px] font-mono uppercase tracking-wider text-violet-500">Ton estimation</div>
          <div className="font-mono font-black text-2xl text-violet-800 tabular-nums">≈ {formatFr(Math.round(value))}</div>
          <div className="text-xs text-violet-700">{myBand.label}</div>
        </div>
        {revealed && exact != null && (
          <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 py-2 text-center">
            <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-600">Résultat exact</div>
            <div className="font-mono font-black text-2xl text-emerald-800 tabular-nums">{formatFr(exact)}</div>
            <div className="text-xs text-emerald-700">{exactBand.label}</div>
          </div>
        )}
      </div>
    </div>
  );
}
