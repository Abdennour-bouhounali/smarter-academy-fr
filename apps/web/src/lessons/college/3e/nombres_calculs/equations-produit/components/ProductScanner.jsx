import React, { useCallback, useRef, useState } from 'react';
import MathText from '../../../../../common/components/MathText';
import {
  evalLin, evalProduct, formatDec, formatFactor, formatLin, roundTo,
} from './equationUtils';

/**
 * ProductScanner — LA manipulation signature de « Équations produit nul ».
 *
 * Activity: balayer la bande des x sous un produit de deux facteurs et
 *   repérer les positions où le produit tombe exactement à 0.
 * Mathematical objective: voir que (f1 × f2)(x) = 0 SEULEMENT là où l'un des
 *   deux facteurs s'annule — le produit nul avant sa formule.
 * Student action: taper une graduation de la bande, ou pousser −/+, ou les
 *   flèches du clavier ; un bouton « Marquer ce zéro » tamponne la position.
 * Controlled variable: x, dans [xMin ; xMax] au pas `step` (0,5 par défaut).
 * Mathematical state: x (un seul nombre). Les deux valeurs de facteurs, le
 *   produit, la couleur de la bande et les tampons en sont DÉRIVÉS.
 * Visual consequence: les deux cartes « facteur » affichent leur valeur
 *   courante ; la carte produit passe au vert et affiche 0 quand on est sur
 *   un zéro, sinon elle reste grise avec la valeur exacte ; la graduation
 *   courante est surlignée, les zéros tamponnés portent un disque vert.
 * Expected observation: le produit ne vaut 0 qu'en deux endroits, et chaque
 *   fois exactement l'un des deux facteurs affiche 0.
 * Misconception targeted: « il suffit que le produit soit petit / négatif »,
 *   et surtout « un produit peut être nul sans qu'aucun facteur le soit ».
 * Feedback: hors zéro, l'écart est quantifié (« le produit vaut −12, pas 0 :
 *   aucun facteur n'est nul »). Le module rend le Feedback ; le composant
 *   expose l'état via `onChange` et `onStamp`.
 * Formalization: A × B = 0 ⟺ A = 0 ou B = 0, nommée APRÈS le balayage.
 * Scaffolding: puces de valeurs remarquables, stepper −/+, clavier ; après
 *   3 essais infructueux le module propose « montre-moi » (révèle et tamponne).
 * Transfer: la même bande figée sert de synthèse dans le boss final.
 *
 * Composant CONTRÔLÉ : `x` et `stamped` appartiennent au module, aucune
 * logique de progression ici. `frozen` rend la bande non interactive (boss).
 *
 * @param {{a:number,b:number}} f1
 * @param {{a:number,b:number}} f2
 * @param {number} x               valeur courante
 * @param {(x:number)=>void} onChange
 * @param {number[]} stamped       zéros déjà marqués
 * @param {()=>void} [onStamp]     appelé quand l'élève tamponne la position
 * @param {number} [xMin=-5] @param {number} [xMax=5] @param {number} [step=0.5]
 * @param {boolean} [frozen=false] bande non interactive (synthèse)
 */
const W = 720;
const H = 96;
const PAD = 34;

export default function ProductScanner({
  f1,
  f2,
  x,
  onChange,
  stamped = [],
  onStamp,
  xMin = -5,
  xMax = 5,
  step = 0.5,
  frozen = false,
  zeros = [],
}) {
  const svgRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const v1 = evalLin(f1, x);
  const v2 = evalLin(f2, x);
  const product = evalProduct(f1, f2, x);
  const onZero = product === 0;
  const alreadyStamped = stamped.some((s) => s === x);

  const span = xMax - xMin;
  const toX = useCallback((v) => PAD + ((v - xMin) / span) * (W - 2 * PAD), [xMin, span]);

  const clampSnap = useCallback(
    (raw) => {
      const snapped = Math.round(raw / step) * step;
      return roundTo(Math.min(xMax, Math.max(xMin, snapped)));
    },
    [step, xMin, xMax],
  );

  const valueFromClientX = useCallback(
    (clientX) => {
      const rect = svgRef.current.getBoundingClientRect();
      const ratio = (clientX - rect.left) / rect.width;
      const px = ratio * W;
      return clampSnap(xMin + ((px - PAD) / (W - 2 * PAD)) * span);
    },
    [clampSnap, xMin, span],
  );

  const handlePointerDown = (e) => {
    if (frozen) return;
    setDragging(true);
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* pointeur synthétique */ }
    onChange?.(valueFromClientX(e.clientX));
  };
  const handlePointerMove = (e) => {
    if (frozen || !dragging) return;
    onChange?.(valueFromClientX(e.clientX));
  };
  const endDrag = (e) => {
    setDragging(false);
    try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch { /* déjà relâché */ }
  };

  const nudge = (d) => onChange?.(clampSnap(x + d * step));

  const handleKeyDown = (e) => {
    if (frozen) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); nudge(1); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); nudge(-1); }
    else if (e.key === 'Home') { e.preventDefault(); onChange?.(xMin); }
    else if (e.key === 'End') { e.preventDefault(); onChange?.(xMax); }
  };

  // Graduations : une tous les `step`, étiquetées aux entiers seulement —
  // 21 traits pour −5…5 au pas 0,5, aucun n'est interactif (le geste est
  // écouté sur le <svg> lui-même, cf. playbook §10.4).
  const ticks = [];
  for (let i = 0; i <= Math.round(span / step); i += 1) ticks.push(roundTo(xMin + i * step));

  const axisY = 54;
  const cursorX = toX(x);

  return (
    <div className="space-y-3" role="group" aria-label="Scanner de produit">
      {/* ── Les trois lectures : facteur 1, facteur 2, produit ───────── */}
      <div className="grid grid-cols-3 gap-2">
        <Readout
          label={<MathText>{`$${formatFactor(f1)}$`}</MathText>}
          value={v1}
          tone={v1 === 0 ? 'zero' : 'plain'}
        />
        <Readout
          label={<MathText>{`$${formatFactor(f2)}$`}</MathText>}
          value={v2}
          tone={v2 === 0 ? 'zero' : 'plain'}
        />
        <Readout label="Produit" value={product} tone={onZero ? 'hit' : 'plain'} big />
      </div>

      {/* ── La bande des x ───────────────────────────────────────────── */}
      <div className="w-full overflow-x-auto rounded-2xl border-2 border-slate-200 bg-white flex justify-center">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto min-w-[320px] max-w-[720px] select-none"
          role={frozen ? 'img' : 'group'}
          aria-label={frozen ? 'Bande des valeurs de x, figée' : 'Bande des valeurs de x'}
          style={{ touchAction: dragging ? 'none' : 'manipulation' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          {/* axe + graduations (décoratifs) */}
          <g pointerEvents="none">
            <line x1={PAD} y1={axisY} x2={W - PAD} y2={axisY} stroke="#94a3b8" strokeWidth="2" />
            {ticks.map((t) => {
              const isInt = Number.isInteger(t);
              return (
                <g key={t}>
                  <line
                    x1={toX(t)} y1={axisY - (isInt ? 8 : 4)}
                    x2={toX(t)} y2={axisY + (isInt ? 8 : 4)}
                    stroke="#cbd5e1" strokeWidth={isInt ? 2 : 1}
                  />
                  {isInt && (
                    <text x={toX(t)} y={axisY + 26} textAnchor="middle" fontSize="13" fill="#64748b" fontFamily="monospace">
                      {formatDec(t)}
                    </text>
                  )}
                </g>
              );
            })}

            {/* curseur — dessiné AVANT les tampons, pour ne jamais les masquer */}
            <g>
              <line
                x1={cursorX} y1={16} x2={cursorX} y2={axisY + 14}
                stroke={onZero ? '#059669' : '#6366f1'} strokeWidth="3"
              />
              <circle
                cx={cursorX} cy={axisY} r="6"
                fill={onZero ? '#059669' : '#6366f1'} stroke="#fff" strokeWidth="2"
              />
              <text
                x={cursorX} y={12} textAnchor="middle" fontSize="13" fontWeight="bold"
                fill={onZero ? '#047857' : '#4338ca'} fontFamily="monospace"
              >
                x = {formatDec(x)}
              </text>
            </g>

            {/* zéros tamponnés : un anneau vert, visible même sous le curseur */}
            {stamped.map((s) => (
              <g key={`stamp-${s}`}>
                <circle cx={toX(s)} cy={axisY} r="11" fill="none" stroke="#047857" strokeWidth="3" />
                <text x={toX(s)} y={axisY - 16} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#047857" fontFamily="monospace">
                  ✓0
                </text>
              </g>
            ))}
          </g>

          {/* zone tactile : un seul rect transparent, focusable au clavier */}
          {!frozen && (
            <rect
              x={PAD - 12} y={4} width={W - 2 * PAD + 24} height={H - 8}
              fill="transparent"
              role="button"
              tabIndex={0}
              aria-label={`Choisir la valeur de x, actuellement ${formatDec(x)}`}
              onKeyDown={handleKeyDown}
            />
          )}
        </svg>
      </div>

      {/* ── Commandes tap-first ──────────────────────────────────────── */}
      {!frozen && (
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => nudge(-1)}
            disabled={x <= xMin}
            aria-label={`Diminuer x de ${formatDec(step)}`}
            className="min-w-[52px] min-h-[44px] rounded-xl border-2 border-slate-300 bg-white text-xl font-bold text-slate-700 hover:border-indigo-500 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            −
          </button>
          <span className="font-mono text-lg font-extrabold text-slate-800 tabular-nums w-24 text-center">
            x = {formatDec(x)}
          </span>
          <button
            type="button"
            onClick={() => nudge(1)}
            disabled={x >= xMax}
            aria-label={`Augmenter x de ${formatDec(step)}`}
            className="min-w-[52px] min-h-[44px] rounded-xl border-2 border-slate-300 bg-white text-xl font-bold text-slate-700 hover:border-indigo-500 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            +
          </button>
          {onStamp && (
            <button
              type="button"
              onClick={onStamp}
              disabled={!onZero || alreadyStamped}
              aria-label="Marquer ce zéro sur la bande"
              className={`min-h-[44px] px-4 rounded-xl border-2 font-bold text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                onZero && !alreadyStamped
                  ? 'bg-emerald-600 border-emerald-700 text-white hover:bg-emerald-700'
                  : 'bg-slate-100 border-slate-200 text-slate-400'
              }`}
            >
              {alreadyStamped ? '✓ Zéro marqué' : 'Marquer ce zéro'}
            </button>
          )}
        </div>
      )}

      <p className="text-center text-xs text-slate-500">
        <MathText>
          {`$${formatFactor(f1)}${formatFactor(f2)}$`}
        </MathText>{' '}
        — {stamped.length} zéro{stamped.length > 1 ? 's' : ''} marqué{stamped.length > 1 ? 's' : ''}
        {zeros.length ? ` sur ${zeros.length}` : ''}
      </p>
      <p className="sr-only">
        Pour x = {formatDec(x)} : {formatLin(f1)} vaut {formatDec(v1)}, {formatLin(f2)} vaut{' '}
        {formatDec(v2)}, le produit vaut {formatDec(product)}.
      </p>
    </div>
  );
}

function Readout({ label, value, tone, big = false }) {
  const cls =
    tone === 'hit'
      ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
      : tone === 'zero'
      ? 'border-emerald-300 bg-emerald-50/60 text-emerald-700'
      : 'border-slate-200 bg-white text-slate-800';
  return (
    <div className={`rounded-2xl border-2 p-2.5 text-center ${cls}`}>
      <div className="text-[11px] font-mono tracking-wide text-slate-500 leading-tight">{label}</div>
      <div className={`font-mono font-extrabold tabular-nums ${big ? 'text-2xl' : 'text-xl'}`}>
        {formatDec(value)}
      </div>
    </div>
  );
}
