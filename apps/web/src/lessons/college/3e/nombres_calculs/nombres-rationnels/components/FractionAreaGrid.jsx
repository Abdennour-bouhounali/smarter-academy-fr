import React from 'react';
import { formatFrac, normalize, simplify } from './rationalUtils';
import MathText from '../../../../../common/components/MathText';

/**
 * FractionAreaGrid — la grille d'aire pour LIRE un produit de fractions.
 *
 * Activity: peindre en bleu `a` colonnes sur `aDen` d'un carré, puis en jaune
 *   `b` lignes sur `bDen` du même carré ; la zone VERTE (peinte deux fois)
 *   est le produit.
 * Mathematical objective: « les deux tiers des trois quarts » est une aire,
 *   et cette aire vaut (2 × 3) / (3 × 4) — la règle se LIT sur le quadrillage.
 * Student action: taper une colonne (bleu) puis une ligne (jaune) ; re-taper
 *   dépeint.
 * Controlled variable: les ensembles d'indices de colonnes et de lignes.
 * Mathematical state: `cols` et `rows` (deux Set d'entiers). Le quadrillage,
 *   les comptes et la fraction résultat en sont dérivés.
 * Visual consequence: le nombre total de cases est aDen × bDen ; les cases
 *   vertes sont exactement a × b.
 * Expected observation: 6 cases vertes sur 12 — et 6/12 = 1/2.
 * Misconception targeted: « multiplier agrandit toujours » (ici le produit
 *   est PLUS PETIT que chacun des deux facteurs) et « on multiplie le haut
 *   par le haut et on garde le dénominateur ».
 * Feedback: le module compare (cols.size, rows.size) à la cible et quantifie
 *   ce qui manque.
 * Formalization: a/b × c/d = (a×c)/(b×d), nommée après le comptage.
 * Scaffolding: chaque case est un rect ≥ 44 px sur mobile grâce au viewBox
 *   ajusté ; les en-têtes de colonne/ligne sont eux aussi tapables.
 * Transfer: la division « combien de 1/4 dans 3/2 » réutilise la même grille
 *   en comptant les paquets.
 *
 * @param {number} aNum @param {number} aDen  fraction « colonnes » (bleu)
 * @param {number} bNum @param {number} bDen  fraction « lignes » (jaune)
 * @param {Set<number>} cols @param {Set<number>} rows
 * @param {(i:number)=>void} onToggleCol @param {(j:number)=>void} onToggleRow
 * @param {boolean} [frozen=false]
 */
const CELL = 54;
const PAD = 30;

export default function FractionAreaGrid({
  aDen,
  bDen,
  cols,
  rows,
  onToggleCol,
  onToggleRow,
  frozen = false,
  aNum = null,
  bNum = null,
}) {
  const W = PAD + aDen * CELL + 8;
  const H = PAD + bDen * CELL + 8;

  const both = [];
  for (let i = 0; i < aDen; i += 1) {
    for (let j = 0; j < bDen; j += 1) {
      if (cols.has(i) && rows.has(j)) both.push([i, j]);
    }
  }
  const result = simplify(normalize(both.length, aDen * bDen));

  return (
    <div className="space-y-3" role="group" aria-label="Quadrillage des fractions">
      <div className="w-full overflow-x-auto rounded-2xl border-2 border-slate-200 bg-white flex justify-center p-2">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto mx-auto block"
          style={{ width: '100%', maxWidth: `${W}px`, minWidth: '280px', touchAction: 'manipulation' }}
          role={frozen ? 'img' : 'group'}
          aria-label={`Carré unité découpé en ${aDen} colonnes et ${bDen} lignes`}
        >
          {/* cases : coloriage dérivé des deux ensembles */}
          <g pointerEvents="none">
            {Array.from({ length: aDen }, (_, i) =>
              Array.from({ length: bDen }, (_, j) => {
                const inCol = cols.has(i);
                const inRow = rows.has(j);
                const fill = inCol && inRow ? '#10b981' : inCol ? '#93c5fd' : inRow ? '#fde68a' : '#f8fafc';
                return (
                  <rect
                    key={`c${i}-${j}`}
                    x={PAD + i * CELL}
                    y={PAD + j * CELL}
                    width={CELL}
                    height={CELL}
                    fill={fill}
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                  />
                );
              }),
            )}
            <rect
              x={PAD} y={PAD} width={aDen * CELL} height={bDen * CELL}
              fill="none" stroke="#334155" strokeWidth="2.5"
            />
          </g>

          {/* en-têtes tapables : une colonne / une ligne entière */}
          {Array.from({ length: aDen }, (_, i) => (
            <rect
              key={`hc${i}`}
              x={PAD + i * CELL}
              y={2}
              width={CELL}
              height={PAD - 4}
              fill={cols.has(i) ? '#3b82f6' : '#e2e8f0'}
              stroke="#94a3b8"
              strokeWidth="1"
              rx="4"
              role={frozen ? undefined : 'button'}
              tabIndex={frozen ? undefined : 0}
              aria-label={`Colonne ${i + 1} sur ${aDen}${cols.has(i) ? ', peinte' : ''}`}
              onClick={frozen ? undefined : () => onToggleCol?.(i)}
              onKeyDown={
                frozen
                  ? undefined
                  : (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onToggleCol?.(i);
                      }
                    }
              }
              style={{ cursor: frozen ? 'default' : 'pointer' }}
            />
          ))}
          {Array.from({ length: bDen }, (_, j) => (
            <rect
              key={`hr${j}`}
              x={2}
              y={PAD + j * CELL}
              width={PAD - 4}
              height={CELL}
              fill={rows.has(j) ? '#f59e0b' : '#e2e8f0'}
              stroke="#94a3b8"
              strokeWidth="1"
              rx="4"
              role={frozen ? undefined : 'button'}
              tabIndex={frozen ? undefined : 0}
              aria-label={`Ligne ${j + 1} sur ${bDen}${rows.has(j) ? ', peinte' : ''}`}
              onClick={frozen ? undefined : () => onToggleRow?.(j)}
              onKeyDown={
                frozen
                  ? undefined
                  : (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onToggleRow?.(j);
                      }
                    }
              }
              style={{ cursor: frozen ? 'default' : 'pointer' }}
            />
          ))}
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <Tile tone="blue" label="Colonnes peintes" value={`${cols.size} / ${aDen}`} />
        <Tile tone="amber" label="Lignes peintes" value={`${rows.size} / ${bDen}`} />
        <Tile
          tone="emerald"
          label="Cases vertes"
          value={`${both.length} / ${aDen * bDen}`}
          extra={both.length > 0 ? <MathText>{`$= ${formatFrac(result)}$`}</MathText> : null}
        />
      </div>
      <p className="sr-only">
        {`${cols.size} colonnes sur ${aDen} et ${rows.size} lignes sur ${bDen} sont peintes ; ${both.length} cases sur ${aDen * bDen} le sont deux fois.`}
        {aNum !== null && bNum !== null ? ` Cible : ${aNum} colonnes et ${bNum} lignes.` : ''}
      </p>
    </div>
  );
}

function Tile({ tone, label, value, extra }) {
  const cls =
    tone === 'blue'
      ? 'border-blue-300 bg-blue-50 text-blue-900'
      : tone === 'amber'
      ? 'border-amber-300 bg-amber-50 text-amber-900'
      : 'border-emerald-300 bg-emerald-50 text-emerald-900';
  return (
    <div className={`rounded-2xl border-2 p-2.5 ${cls}`}>
      <div className="text-[10px] font-mono uppercase tracking-wide opacity-70">{label}</div>
      <div className="font-mono text-lg font-extrabold tabular-nums">{value}</div>
      {extra}
    </div>
  );
}
