import React from 'react';
import MathText from '../../../../../common/components/MathText';
import { formatDec } from './rootUtils';

/**
 * SquareStaircase — l'escalier des carrés parfaits de 1² à 12².
 *
 * Activity: taper les marches de l'escalier ; chaque marche est un carré
 *   de côté n, dessiné à l'échelle, et révèle le triplet n ↔ n² ↔ √(n²).
 * Mathematical objective: constituer le répertoire des carrés parfaits
 *   1, 4, 9, … 144 en le VOYANT grandir — l'écart entre deux marches
 *   augmente (3, 5, 7, 9…), il n'y a donc pas de carré parfait « au milieu ».
 * Student action: taper une marche (ou Entrée/Espace au clavier).
 * Controlled variable: l'ensemble des marches tapées.
 * Mathematical state: `tapped` (Set d'entiers). Aires, hauteurs et libellés
 *   en sont dérivés.
 * Visual consequence: la marche tapée se colore et affiche n², les autres
 *   restent grises.
 * Expected observation: les aires 1, 4, 9, 16… ne se suivent pas
 *   régulièrement ; entre 49 et 64 il n'y a AUCUN carré parfait.
 * Misconception targeted: « tout nombre a une racine entière ».
 * Feedback: rendu par le module (Feedback quantifié).
 * Formalization: n² et √n² se lisent sur la même marche.
 * Scaffolding: 12 marches seulement, toutes visibles, toutes tapables.
 * Transfer: le répertoire sert au module 3 (encadrement) et au module 5
 *   (extraction du plus grand carré).
 *
 * Composant CONTRÔLÉ : `tapped` appartient au module.
 * 12 nœuds interactifs (marches) + rien d'autre — sous le plafond de 52.
 *
 * @param {Set<number>} tapped   marches déjà tapées
 * @param {(n:number)=>void} onTap
 * @param {number} [maxN=12]
 * @param {boolean} [frozen=false]
 */
const W = 860;
const H = 250;
const PAD_B = 30;
const PAD_L = 10;

export default function SquareStaircase({ tapped, onTap, maxN = 12, frozen = false }) {
  const set = tapped instanceof Set ? tapped : new Set(tapped || []);
  // Une seule unité de longueur : le carré de côté n mesure n unités — c'est
  // ce qui fait de la figure un ESCALIER (les marches grandissent vraiment).
  // L'unité est bornée par la hauteur ET par la largeur d'un créneau.
  // Une seule unité de longueur : le carré de côté n mesure n unités de large
  // ET de haut — c'est ce qui fait un vrai ESCALIER. Les carrés sont posés
  // côte à côte sur la ligne de sol, chacun occupant sa propre largeur, donc
  // la somme 1 + 2 + … + maxN unités doit tenir dans la largeur utile.
  const totalUnits = (maxN * (maxN + 1)) / 2;
  const gapUnits = 0.28 * maxN;                       // un filet d'air entre les marches
  const unit = Math.min(
    (W - 2 * PAD_L) / (totalUnits + gapUnits),
    (H - PAD_B - 18) / maxN,
  );
  const gap = 0.28 * unit;

  return (
    <div className="space-y-3" role="group" aria-label="Escalier des carrés parfaits">
      <div className="w-full overflow-x-auto rounded-2xl border-2 border-slate-200 bg-white">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto min-w-[640px] select-none"
          role={frozen ? 'img' : 'group'}
          aria-label="Escalier des carrés parfaits de 1 à 144"
          style={{ touchAction: 'manipulation' }}
        >
          <g pointerEvents="none">
            <line x1={PAD_L} y1={H - PAD_B} x2={W - PAD_L} y2={H - PAD_B} stroke="#94a3b8" strokeWidth="2" />
            {Array.from({ length: maxN }, (_, i) => i + 1).map((n) => {
              const on = set.has(n);
              const side = n * unit;
              // abscisse de gauche : la somme des marches précédentes.
              const left = PAD_L + (((n - 1) * n) / 2) * unit + (n - 1) * gap;
              const cx = left + side / 2;
              const y = H - PAD_B - side;
              return (
                <g key={`step-${n}`}>
                  <rect
                    x={left} y={y} width={side} height={side}
                    fill={on ? '#c7d2fe' : '#f1f5f9'}
                    stroke={on ? '#4338ca' : '#cbd5e1'}
                    strokeWidth={on ? 2.5 : 1.5}
                    rx="2"
                  />
                  {on && side > 26 && (
                    <text
                      x={cx} y={y + side / 2 + 5}
                      textAnchor="middle" fontSize="13" fontWeight="bold"
                      fill="#3730a3" fontFamily="monospace"
                    >
                      {n * n}
                    </text>
                  )}
                  <text
                    x={cx} y={H - PAD_B + 16}
                    textAnchor="middle" fontSize="13"
                    fill={on ? '#3730a3' : '#94a3b8'} fontFamily="monospace" fontWeight={on ? 'bold' : 'normal'}
                  >
                    {n}
                  </text>
                  {on && side <= 26 && (
                    <text
                      x={cx} y={y - 6}
                      textAnchor="middle" fontSize="12" fontWeight="bold"
                      fill="#3730a3" fontFamily="monospace"
                    >
                      {n * n}
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* zones tactiles : une par marche, transparentes et focusables */}
          {!frozen && Array.from({ length: maxN }, (_, i) => i + 1).map((n) => {
            const left = PAD_L + (((n - 1) * n) / 2) * unit + (n - 1) * gap;
            const side = n * unit;
            return (
              <rect
                key={`hit-${n}`}
                x={left} y={4} width={side + gap} height={H - PAD_B - 4}
                fill="transparent"
                role="button"
                tabIndex={0}
                aria-label={`Marche ${n} : carré de côté ${n}`}
                aria-pressed={set.has(n)}
                onClick={() => onTap?.(n)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onTap?.(n); }
                }}
              />
            );
          })}
        </svg>
      </div>

      {/* Le triplet, pour la dernière marche tapée */}
      <div className="flex flex-wrap justify-center gap-1.5">
        {Array.from({ length: maxN }, (_, i) => i + 1).map((n) => (
          <button
            key={`chip-${n}`}
            type="button"
            disabled={frozen}
            onClick={() => onTap?.(n)}
            aria-label={`Marche ${n}`}
            aria-pressed={set.has(n)}
            className={`min-w-[44px] min-h-[44px] px-2 rounded-xl border-2 font-mono text-xs font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              set.has(n)
                ? 'bg-indigo-600 border-indigo-700 text-white'
                : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-400'
            }`}
          >
            {set.has(n) ? n * n : n}
          </button>
        ))}
      </div>

      <p className="text-center text-xs text-slate-500">
        {set.size} / {maxN} marches découvertes
        {set.size > 0 && (
          <>
            {' — '}
            <MathText>
              {`$${[...set].sort((a, b) => a - b).map((n) => `${n}^{2}{=}${n * n}`).join('\\;\\;')}$`}
            </MathText>
          </>
        )}
      </p>

      <p className="sr-only">
        Carrés parfaits découverts : {[...set].sort((a, b) => a - b).map((n) => formatDec(n * n)).join(', ') || 'aucun'}.
      </p>
    </div>
  );
}
