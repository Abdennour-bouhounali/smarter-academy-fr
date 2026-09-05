import React from 'react';
import { useReducedMotion } from 'framer-motion';
import {
  layoutRows, divisorPairs, mirrorThreshold, normalizePair, hasPair, divisorsFromPairs,
} from './divisibilityUtils';

/**
 * RectangleArray — « Le Rectangle-Détecteur », la manipulation SIGNATURE de
 * la leçon (INTERACTION_PEDAGOGY §24).
 *
 * Activity: ranger n carreaux (les chaises de la fête) en r rangées égales.
 * Mathematical objective: rendre visible que « d divise n » signifie
 *   « reste 0 », et que les diviseurs vont par PAIRES (r × q = n).
 * Student action: taper une puce de rangées (1…maxChip) ou le stepper − / +,
 *   puis « Garder cette paire » quand le rectangle est complet.
 * Controlled variable: `rows`, le nombre de rangées.
 * Mathematical state: (n, rows) → layoutRows(n, rows) = { perRow, remainder,
 *   isRectangle } ; plus `stamped`, la liste des paires gardées (possédée par
 *   le module).
 * Visual consequence: les carreaux se re-répartissent en rows rangées ; les
 *   carreaux en trop tombent dans le bac rouge « reste ». Un rectangle
 *   complet reçoit un contour émeraude et la paire peut être tamponnée sur la
 *   carte d'identité de n.
 * Expected observation: certains nombres de rangées « tombent juste », les
 *   autres laissent une chaise seule ; et passé √n, les paires se répètent à
 *   l'envers.
 * Misconception targeted: « un diviseur, c'est quand ça se divise, même avec
 *   un reste » (#2) ; « 4 est un multiple de 36 » (#1, la paire se lit dans
 *   les deux sens) ; « 1 est premier » (#3, 1 × 1 n'est qu'un seul rectangle).
 * Feedback: par conséquence — le bac « reste » EST le retour. Aucun verdict
 *   textuel avant la lecture de l'élève.
 * Formalization: la carte d'identité liste les diviseurs trouvés, triés ; le
 *   mot « diviseur » puis « nombre premier » sont nommés APRÈS le geste.
 * Scaffolding: puces + stepper (tap-first), indice-miroir après la première
 *   paire miroir, `revealAll` pour l'échappatoire du module.
 * Transfer: 36 → 24 → 13 / 21 / 23 (le bâton), puis la synthèse figée.
 *
 * Composant CONTRÔLÉ : `rows` et `stamped` appartiennent au module. Aucune
 * logique de progression ici.
 *
 * Densité (playbook §10.5) : les carreaux sont des <rect> STATIQUES
 * (pointerEvents none) ; au-delà de `tileCap` on n'en dessine qu'une part et
 * un badge « ×N » indique le total. Nœuds interactifs : maxChip puces + 2
 * boutons de stepper + 1 bouton « Garder cette paire » ≤ 13.
 */

const TILE = 22;
const GAP = 4;
const PAD = 12;

export default function RectangleArray({
  n,
  rows,
  onRowsChange,
  stamped = [],
  onStamp,
  maxChip = 10,
  tileCap = 60,
  revealAll = false,
  showCard = true,
  disabled = false,
  label,
  ariaLabel,
}) {
  const reduced = useReducedMotion();
  const { perRow, remainder, isRectangle } = layoutRows(n, Math.max(1, rows));
  const allPairs = divisorPairs(n);
  const mirror = mirrorThreshold(n);

  const currentPair = isRectangle ? normalizePair([rows, perRow]) : null;
  const alreadyStamped = currentPair ? hasPair(stamped, currentPair) : false;
  const isMirrored = isRectangle && rows > perRow;

  // Au-delà du plafond, on dessine des rangées représentatives + un badge ×N.
  const capped = n > tileCap;
  const drawnRows = capped ? Math.min(rows, Math.max(1, Math.ceil(tileCap / Math.max(1, perRow)))) : rows;
  const drawnPerRow = Math.min(perRow, capped ? Math.max(1, Math.floor(tileCap / Math.max(1, drawnRows))) : perRow);

  const gridW = Math.max(1, drawnPerRow) * (TILE + GAP) - GAP;
  const gridH = Math.max(1, drawnRows) * (TILE + GAP) - GAP;
  const trayH = remainder > 0 ? TILE + 18 : 0;
  const W = Math.max(gridW + PAD * 2, 200);
  const H = gridH + PAD * 2 + trayH;

  const stampedDivisors = divisorsFromPairs(revealAll ? allPairs : stamped);
  const displayedPairs = revealAll ? allPairs : stamped;

  const setRows = (r) => {
    if (disabled) return;
    onRowsChange?.(Math.min(maxChip, Math.max(1, r)));
  };

  const chipKeys = (e, r) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setRows(r);
    }
  };

  return (
    <div className="space-y-3" role="group" aria-label={ariaLabel ?? `Rectangle-Détecteur pour ${n}`}>
      {label && <p className="text-sm font-semibold text-slate-700">{label}</p>}

      {/* ── Le tapis de carreaux ─────────────────────────────────── */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 overflow-x-auto">
        <div className="flex items-baseline justify-between gap-2 flex-wrap mb-2">
          <span className="font-mono text-xs text-slate-500">
            {n} carreaux · {rows} rangée{rows > 1 ? 's' : ''}
          </span>
          <span
            className={`font-mono text-xs font-bold px-2 py-1 rounded-lg ${
              isRectangle ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
            }`}
          >
            {isRectangle
              ? `${rows} × ${perRow} = ${n} — reste 0`
              : `${rows} × ${perRow} = ${rows * perRow} — reste ${remainder}`}
          </span>
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto"
          style={{ maxWidth: Math.max(W, 320), touchAction: 'manipulation' }}
          role="img"
          aria-label={
            isRectangle
              ? `Rectangle complet de ${rows} rangées de ${perRow} carreaux, reste zéro`
              : `${rows} rangées de ${perRow} carreaux, il reste ${remainder} carreau${remainder > 1 ? 'x' : ''}`
          }
        >
          {/* Contour du rectangle complet */}
          {isRectangle && (
            <rect
              x={PAD - 5}
              y={PAD - 5}
              width={gridW + 10}
              height={gridH + 10}
              rx="8"
              fill="none"
              stroke="#059669"
              strokeWidth="3"
              style={{ pointerEvents: 'none' }}
            />
          )}

          {/* Carreaux rangés — décoratifs, jamais tappables */}
          {Array.from({ length: drawnRows }).map((_, r) =>
            Array.from({ length: drawnPerRow }).map((_, c) => (
              <rect
                key={`${r}-${c}`}
                x={PAD + c * (TILE + GAP)}
                y={PAD + r * (TILE + GAP)}
                width={TILE}
                height={TILE}
                rx="4"
                fill={isRectangle ? '#a7f3d0' : '#e2e8f0'}
                stroke={isRectangle ? '#059669' : '#94a3b8'}
                strokeWidth="1.5"
                style={{
                  pointerEvents: 'none',
                  transition: reduced ? 'none' : 'fill 200ms ease, stroke 200ms ease',
                }}
              />
            )),
          )}

          {/* Bac « reste » — la conséquence, en rouge, sous le rectangle */}
          {remainder > 0 && (
            <g style={{ pointerEvents: 'none' }}>
              <rect
                x={PAD - 4}
                y={PAD + gridH + 10}
                width={remainder * (TILE + GAP) + 4}
                height={TILE + 8}
                rx="6"
                fill="#fee2e2"
                stroke="#ef4444"
                strokeWidth="2"
                strokeDasharray="5 3"
              />
              {Array.from({ length: remainder }).map((_, i) => (
                <rect
                  key={`rest-${i}`}
                  x={PAD + i * (TILE + GAP)}
                  y={PAD + gridH + 14}
                  width={TILE}
                  height={TILE}
                  rx="4"
                  fill="#fca5a5"
                  stroke="#dc2626"
                  strokeWidth="1.5"
                />
              ))}
            </g>
          )}
        </svg>

        <div className="flex items-center justify-between gap-2 flex-wrap mt-1">
          {capped && (
            <span className="font-mono text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
              ×{n} carreaux au total — seule une partie du tapis est dessinée
            </span>
          )}
          <span className={`font-mono text-xs ${remainder > 0 ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
            {remainder > 0
              ? `${remainder} carreau${remainder > 1 ? 'x' : ''} dans le bac « reste »`
              : 'bac « reste » vide'}
          </span>
        </div>
      </div>

      {/* ── Les commandes : puces + stepper ──────────────────────── */}
      <div className="space-y-2">
        <p className="text-xs font-mono text-slate-500">Combien de rangées ?</p>
        <div className="flex gap-1.5 flex-wrap" role="group" aria-label="Nombre de rangées">
          <button
            type="button"
            disabled={disabled || rows <= 1}
            onClick={() => setRows(rows - 1)}
            aria-label="Une rangée de moins"
            className="min-w-[44px] min-h-[44px] rounded-xl border-2 border-slate-300 bg-white font-bold text-slate-700 disabled:opacity-40 hover:border-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            −
          </button>
          {Array.from({ length: maxChip }).map((_, i) => {
            const r = i + 1;
            const fits = n % r === 0;
            const kept = hasPair(stamped, normalizePair([r, n / r]));
            return (
              <button
                key={r}
                type="button"
                disabled={disabled}
                onClick={() => setRows(r)}
                onKeyDown={(e) => chipKeys(e, r)}
                aria-pressed={rows === r}
                aria-label={`${r} rangée${r > 1 ? 's' : ''}${kept ? ', paire déjà gardée' : ''}`}
                className={`min-w-[44px] min-h-[44px] rounded-xl border-2 font-mono font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  rows === r
                    ? 'bg-slate-900 border-slate-900 text-white'
                    : kept && fits
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                    : 'bg-white border-slate-300 text-slate-600 hover:border-slate-500'
                }`}
              >
                {r}
                {kept && fits ? ' ✓' : ''}
              </button>
            );
          })}
          <button
            type="button"
            disabled={disabled || rows >= maxChip}
            onClick={() => setRows(rows + 1)}
            aria-label="Une rangée de plus"
            className="min-w-[44px] min-h-[44px] rounded-xl border-2 border-slate-300 bg-white font-bold text-slate-700 disabled:opacity-40 hover:border-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            +
          </button>
        </div>
      </div>

      {/* ── Le tampon ────────────────────────────────────────────── */}
      {onStamp && (
        <div className="space-y-2">
          <button
            type="button"
            disabled={disabled || !isRectangle || alreadyStamped}
            onClick={() => currentPair && onStamp(currentPair)}
            className={`w-full min-h-[48px] rounded-xl border-2 font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              isRectangle && !alreadyStamped && !disabled
                ? 'bg-emerald-600 border-emerald-700 text-white hover:bg-emerald-700'
                : 'bg-slate-100 border-slate-200 text-slate-400'
            }`}
          >
            {!isRectangle
              ? 'Garder cette paire — il faut d’abord un rectangle complet'
              : alreadyStamped
              ? `${currentPair[0]} × ${currentPair[1]} — déjà gardée`
              : `Garder cette paire : ${rows} × ${perRow}`}
          </button>

          {isMirrored && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              {rows} rangées de {perRow}, c’est le même rectangle que {perRow} rangées de {rows} —
              simplement tourné. Passé <strong className="font-mono">{mirror}</strong> rangées, tu
              retrouves des paires déjà vues.
            </p>
          )}
        </div>
      )}

      {/* ── La carte d'identité de n ─────────────────────────────── */}
      {showCard && (
        <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-3 space-y-2">
          <p className="text-xs font-mono uppercase tracking-wide text-slate-500">
            Carte d’identité de {n}
          </p>
          {displayedPairs.length === 0 ? (
            <p className="text-sm text-slate-400 italic">
              Aucune paire gardée pour l’instant — trouve un rectangle complet.
            </p>
          ) : (
            <>
              <div className="flex gap-1.5 flex-wrap">
                {displayedPairs.map(([a, b]) => (
                  <span
                    key={`${a}-${b}`}
                    className="font-mono text-xs font-bold px-2.5 py-1.5 rounded-lg bg-white border-2 border-emerald-300 text-emerald-700"
                  >
                    {a} × {b}
                  </span>
                ))}
              </div>
              <p className="text-xs text-slate-600">
                Diviseurs trouvés :{' '}
                <strong className="font-mono">{stampedDivisors.join(' · ')}</strong>{' '}
                <span className="text-slate-400">({stampedDivisors.length})</span>
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
