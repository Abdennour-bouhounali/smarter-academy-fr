import React from 'react';
import MathText from '../../../../../common/components/MathText';
import {
  formatDec, isPerfectSquare, isqrt, simplifyRoot, formatRoot, formatSqrt, approxRoot,
} from './rootUtils';

/**
 * SquareTiling — paver un carré d'aire n avec k × k petits carrés identiques.
 *
 * Activity: choisir un découpage (2×2, 3×3, 4×4…) du carré d'aire n et voir
 *   si les petits carrés ont tous la même aire entière.
 * Mathematical objective: √n = k√m dès que n = k² × m — l'extraction du
 *   plus grand carré parfait, vue comme un pavage régulier.
 * Student action: taper une puce de découpage.
 * Controlled variable: k, le nombre de petits carrés par côté.
 * Mathematical state: (n, k). L'aire d'un petit carré n/k², la validité du
 *   découpage et la forme k√(n/k²) en sont DÉRIVÉES.
 * Visual consequence: le grand carré se découpe en k² cases ; si l'aire
 *   d'une case n'est pas entière, les cases sont barrées en rouge.
 * Expected observation: pour n = 12, seul k = 2 donne des cases d'aire
 *   entière (3) — donc côté = 2 × √3. k = 3 donnerait 12/9, pas entier.
 * Misconception targeted: « 2√3 = √6 » (on croit multiplier sous la racine)
 *   et « on peut extraire n'importe quel facteur ».
 * Feedback: l'aire d'une case est affichée exactement, entière ou non.
 * Formalization: √(k² m) = k√m ; on choisit le PLUS GRAND k possible.
 * Scaffolding: quatre découpages proposés seulement, dont des invalides.
 * Transfer: la même figure figée sert de synthèse dans le boss.
 *
 * Composant CONTRÔLÉ. ≤ 5 nœuds interactifs (les puces de découpage).
 *
 * @param {number} n            aire du grand carré
 * @param {number} k            découpage courant (k × k cases)
 * @param {(k:number)=>void} [onK]
 * @param {number[]} [choices]
 * @param {boolean} [frozen=false]
 */
const VB = 260;
const PAD = 26;
const PLOT = VB - 2 * PAD;

export default function SquareTiling({ n, k, onK, choices = [1, 2, 3, 4], frozen = false }) {
  const cellArea = (n / (k * k));
  const valid = Number.isInteger(cellArea) && cellArea > 0;
  const cellSideLabel = valid
    ? (isPerfectSquare(cellArea) ? formatDec(isqrt(cellArea)) : `√${formatDec(cellArea)}`)
    : '?';
  const simplified = simplifyRoot(n);
  const best = simplified.coef; // le k optimal
  const isBest = valid && k === best;

  const cell = PLOT / k;

  return (
    <div className="space-y-3" role="group" aria-label={`Pavage du carré d'aire ${n}`}>
      <div className="w-full overflow-x-auto rounded-2xl border-2 border-slate-200 bg-white flex justify-center">
        <svg
          viewBox={`0 0 ${VB} ${VB}`}
          className="w-full h-auto min-w-[240px] max-w-[300px] select-none"
          role="img"
          aria-label={
            valid
              ? `Carré d'aire ${n} découpé en ${k} fois ${k} cases d'aire ${formatDec(cellArea)}`
              : `Découpage en ${k} fois ${k} impossible : ${n} ne se divise pas par ${k * k}`
          }
        >
          <g pointerEvents="none">
            <rect
              x={PAD} y={PAD} width={PLOT} height={PLOT}
              fill={valid ? (isBest ? '#f3e8ff' : '#ede9fe') : '#fee2e2'}
              stroke={valid ? '#7c3aed' : '#dc2626'}
              strokeWidth="2.5"
            />

            {/* les cases */}
            {Array.from({ length: k - 1 }, (_, i) => i + 1).map((i) => (
              <g key={`cut-${i}`}>
                <line x1={PAD + i * cell} y1={PAD} x2={PAD + i * cell} y2={PAD + PLOT} stroke={valid ? '#a78bfa' : '#f87171'} strokeWidth="1.5" />
                <line x1={PAD} y1={PAD + i * cell} x2={PAD + PLOT} y2={PAD + i * cell} stroke={valid ? '#a78bfa' : '#f87171'} strokeWidth="1.5" />
              </g>
            ))}

            {/* l'aire d'une case, écrite dans chaque case si ça tient */}
            {Array.from({ length: k }, (_, r) =>
              Array.from({ length: k }, (_, c) => (
                <text
                  key={`cell-${r}-${c}`}
                  x={PAD + (c + 0.5) * cell}
                  y={PAD + (r + 0.5) * cell + 4}
                  textAnchor="middle"
                  fontSize={cell > 52 ? 14 : cell > 34 ? 11 : 9}
                  fontWeight="bold"
                  fill={valid ? '#6d28d9' : '#b91c1c'}
                  fontFamily="monospace"
                >
                  {valid ? formatDec(cellArea) : '✗'}
                </text>
              )),
            )}

            {/* cote du grand côté */}
            <text x={PAD + PLOT / 2} y={VB - 8} textAnchor="middle" fontSize="13" fill="#475569" fontFamily="monospace">
              côté = {formatSqrt(n).replace('\\sqrt{', '√').replace('}', '')}
            </text>
            {/* cote d'une case */}
            <text x={PAD + cell / 2} y={PAD - 8} textAnchor="middle" fontSize="12" fill={valid ? '#6d28d9' : '#b91c1c'} fontFamily="monospace">
              {cellSideLabel}
            </text>
          </g>
        </svg>
      </div>

      {/* ── Choix du découpage ───────────────────────────────────────── */}
      {!frozen && (
        <div className="relative z-10 flex items-center justify-center gap-1.5 flex-wrap">
          <span className="text-xs font-mono text-slate-500">Découper en</span>
          {choices.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onK?.(c)}
              aria-label={`Découper en ${c} sur ${c}`}
              aria-pressed={k === c}
              className={`min-w-[52px] min-h-[44px] rounded-xl border-2 font-mono text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                k === c
                  ? 'bg-violet-600 border-violet-700 text-white'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-violet-400'
              }`}
            >
              {c}×{c}
            </button>
          ))}
        </div>
      )}

      {/* ── La lecture chiffrée ──────────────────────────────────────── */}
      <p className="text-center text-sm text-slate-700 leading-loose py-1">
        {valid ? (
          <MathText>
            {`$${formatSqrt(n)} = \\sqrt{${k}^{2} \\times ${formatDec(cellArea)}} = ${k === 1 ? '' : formatDec(k)}${isPerfectSquare(cellArea) ? formatDec(isqrt(cellArea)) : `\\sqrt{${formatDec(cellArea)}}`}$`}
          </MathText>
        ) : (
          <span className="text-rose-700">
            {formatDec(n)} ne se divise pas par {k}² = {k * k} — ce découpage ne donne pas des cases d’aire
            entière.
          </span>
        )}
      </p>

      {valid && (
        <p className="text-center text-xs text-slate-500">
          {isBest
            ? <>C’est le <strong>plus grand</strong> découpage possible : forme simplifiée <MathText>{`$${formatRoot(simplified)}$`}</MathText> (≈ {formatDec(approxRoot(n, 2))}).</>
            : <>Ça marche, mais on peut découper plus fin — cherche le plus grand k.</>}
        </p>
      )}

      <p className="sr-only">
        Carré d’aire {formatDec(n)} découpé en {k} fois {k}.{' '}
        {valid
          ? `Chaque case a une aire de ${formatDec(cellArea)}, donc le côté vaut ${k} fois la racine de ${formatDec(cellArea)}.`
          : `Découpage impossible : ${formatDec(n)} n'est pas divisible par ${k * k}.`}
      </p>
    </div>
  );
}
