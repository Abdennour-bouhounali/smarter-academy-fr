import React, { useCallback, useRef, useState } from 'react';
import MathText from '../../../../../common/components/MathText';
import NumberLine from '../../../../../common/components/NumberLine';
import { formatDec, roundTo, bracket, isPerfectSquare, isqrt } from './rootUtils';

/**
 * SquareLab — LA manipulation signature de « Racine carrée ».
 *
 * Activity: redimensionner un carré en tirant son coin (ou avec −/+, ou la
 *   demi-droite graduée) et regarder son aire.
 * Mathematical objective: en mode `reverse`, on impose l'AIRE et l'élève
 *   cherche le CÔTÉ — la racine carrée vécue comme « quel côté donne cette
 *   aire ? », avant d'être nommée.
 * Student action: glisser la poignée du coin, taper − / +, ou pousser le
 *   curseur de la droite graduée (pas 0,1).
 * Controlled variable: le côté c, dans [0,1 ; max] au pas 0,1.
 * Mathematical state: c SEUL. L'aire c², la couleur, l'écart à la cible et
 *   la position sur la droite en sont DÉRIVÉS.
 * Visual consequence: le carré grandit, l'aire affichée suit ; en mode
 *   reverse le carré-cible (aire imposée) reste dessiné en pointillés
 *   derrière — l'élève voit s'il déborde ou s'il manque.
 * Expected observation: pour une aire de 49, le côté 7 tombe PILE ; pour 50
 *   ou 20, aucune graduation au dixième ne tombe juste — on encadre.
 * Misconception targeted: « √20 = 10 » (confusion racine / moitié) et
 *   « il existe forcément un décimal dont le carré vaut 20 ».
 * Feedback: l'écart d'aire est chiffré (« 48,44 m², il manque 1,56 m² »),
 *   jamais un « faux » nu. Le module rend le Feedback, le composant expose
 *   son état par `onChange` / `onSolved`.
 * Formalization: √a est le côté du carré d'aire a ; (√a)² = a se lit sur la
 *   même figure.
 * Scaffolding: stepper −/+, droite graduée cliquable, puces d'entiers ; le
 *   module propose « montre-moi » après 3 essais.
 * Transfer: le même carré figé sert de synthèse dans le boss final.
 *
 * Composant CONTRÔLÉ : `side` appartient au module. `frozen` le rend
 * non interactif (synthèse du boss).
 *
 * @param {'forward'|'reverse'} mode  forward = on choisit le côté et on lit
 *   l'aire ; reverse = une aire cible est imposée et on cherche le côté.
 * @param {number} side               côté courant (pas 0,1)
 * @param {(side:number)=>void} onChange
 * @param {number} [targetArea]       aire cible (mode reverse)
 * @param {number} [maxSide=12]
 * @param {boolean} [showLine=true]   miroir du côté sur une droite graduée
 * @param {boolean} [frozen=false]
 * @param {string} [unit='m']
 */
const VB = 300;          // viewBox carré
const PAD = 26;          // marge pour les cotes
const PLOT = VB - 2 * PAD;
const STEP = 0.1;

export default function SquareLab({
  mode = 'forward',
  side,
  onChange,
  targetArea,
  maxSide = 12,
  minSide = 0.1,
  showLine = true,
  frozen = false,
  unit = 'm',
  label,
}) {
  const svgRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const area = roundTo(side * side, 2);
  const targetSideExact = targetArea != null ? Math.sqrt(targetArea) : null;
  const exact = targetArea != null && area === targetArea;
  const gap = targetArea != null ? roundTo(targetArea - area, 2) : null;

  // Échelle commune au carré courant ET au carré cible : les deux doivent
  // se comparer à l'œil, donc une seule unité de longueur pour la figure.
  const scale = PLOT / maxSide;
  const px = (v) => v * scale;

  const clampSnap = useCallback(
    (raw) => {
      const snapped = Math.round(raw / STEP) * STEP;
      return roundTo(Math.min(maxSide, Math.max(minSide, snapped)), 1);
    },
    [maxSide, minSide],
  );

  // Le coin de la poignée est en bas à droite du carré, ancré en haut-gauche.
  const sideFromPointer = useCallback(
    (clientX, clientY) => {
      const rect = svgRef.current.getBoundingClientRect();
      const rx = ((clientX - rect.left) / rect.width) * VB;
      const ry = ((clientY - rect.top) / rect.height) * VB;
      // On prend la plus grande des deux projections : le geste reste naturel
      // même si le doigt sort du carré d'un côté.
      const raw = Math.max((rx - PAD) / scale, (VB - PAD - ry) / scale);
      return clampSnap(raw);
    },
    [clampSnap, scale],
  );

  const handlePointerDown = (e) => {
    if (frozen) return;
    setDragging(true);
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* pointeur synthétique */ }
    onChange?.(sideFromPointer(e.clientX, e.clientY));
  };
  const handlePointerMove = (e) => {
    if (frozen || !dragging) return;
    onChange?.(sideFromPointer(e.clientX, e.clientY));
  };
  const endDrag = (e) => {
    setDragging(false);
    try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch { /* déjà relâché */ }
  };

  const nudge = (d) => onChange?.(clampSnap(roundTo(side + d * STEP, 1)));

  const handleKeyDown = (e) => {
    if (frozen) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); nudge(1); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); nudge(-1); }
    else if (e.key === 'Home') { e.preventDefault(); onChange?.(minSide); }
    else if (e.key === 'End') { e.preventDefault(); onChange?.(maxSide); }
  };

  // Géométrie dérivée : origine en bas à gauche de la zone de tracé.
  const x0 = PAD;
  const y0 = VB - PAD;
  const s = px(side);
  const t = targetSideExact != null ? px(targetSideExact) : 0;

  const areaTone = exact
    ? { fill: '#d1fae5', stroke: '#059669', text: '#047857' }
    : targetArea != null && area > targetArea
      ? { fill: '#ffe4e6', stroke: '#e11d48', text: '#be123c' }
      : { fill: '#e0e7ff', stroke: '#4f46e5', text: '#4338ca' };

  return (
    <div className="space-y-3" role="group" aria-label={label || 'Laboratoire du carré'}>
      {/* ── Les deux lectures : côté et aire ─────────────────────────── */}
      <div className={`grid gap-2 ${targetArea != null ? 'grid-cols-3' : 'grid-cols-2'}`}>
        <Readout label={`Côté (${unit})`} value={formatDec(side)} tone="plain" />
        <Readout
          label={`Aire = côté × côté (${unit}²)`}
          value={formatDec(area)}
          tone={exact ? 'hit' : 'plain'}
          big
        />
        {targetArea != null && (
          <Readout label={`Aire visée (${unit}²)`} value={formatDec(targetArea)} tone="target" />
        )}
      </div>

      {/* ── Le carré ─────────────────────────────────────────────────── */}
      <div className="w-full overflow-x-auto rounded-2xl border-2 border-slate-200 bg-white flex justify-center">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VB} ${VB}`}
          className="w-full h-auto min-w-[260px] max-w-[340px] select-none"
          role={frozen ? 'img' : 'group'}
          aria-label={
            frozen
              ? `Carré de côté ${formatDec(side)} ${unit} et d'aire ${formatDec(area)} ${unit} carrés, figé`
              : `Carré de côté ${formatDec(side)} ${unit}, aire ${formatDec(area)} ${unit} carrés`
          }
          style={{ touchAction: dragging ? 'none' : 'manipulation' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <g pointerEvents="none">
            {/* quadrillage unité : chaque case vaut 1 unité d'aire */}
            {Array.from({ length: maxSide + 1 }, (_, i) => (
              <g key={`grid-${i}`}>
                <line x1={x0 + px(i)} y1={y0} x2={x0 + px(i)} y2={y0 - PLOT} stroke="#f1f5f9" strokeWidth="1" />
                <line x1={x0} y1={y0 - px(i)} x2={x0 + PLOT} y2={y0 - px(i)} stroke="#f1f5f9" strokeWidth="1" />
              </g>
            ))}

            {/* carré cible (mode reverse) — en pointillés, DERRIÈRE */}
            {targetSideExact != null && (
              <rect
                x={x0} y={y0 - t} width={t} height={t}
                fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="6 4"
              />
            )}

            {/* le carré courant */}
            <rect
              x={x0} y={y0 - s} width={s} height={s}
              fill={areaTone.fill} stroke={areaTone.stroke} strokeWidth="2.5"
            />
            <text
              x={x0 + s / 2} y={y0 - s / 2 + 5}
              textAnchor="middle" fontSize="15" fontWeight="bold"
              fill={areaTone.text} fontFamily="monospace"
            >
              {formatDec(area)}
            </text>

            {/* cotes du côté */}
            <text
              x={x0 + s / 2} y={y0 + 17}
              textAnchor="middle" fontSize="13" fill="#475569" fontFamily="monospace"
            >
              {formatDec(side)} {unit}
            </text>
            <text
              x={x0 - 8} y={y0 - s / 2 + 4}
              textAnchor="end" fontSize="13" fill="#475569" fontFamily="monospace"
            >
              {formatDec(side)}
            </text>

            {/* axes */}
            <line x1={x0} y1={y0} x2={x0 + PLOT} y2={y0} stroke="#94a3b8" strokeWidth="2" />
            <line x1={x0} y1={y0} x2={x0} y2={y0 - PLOT} stroke="#94a3b8" strokeWidth="2" />

            {/* poignée du coin */}
            {!frozen && (
              <circle
                cx={x0 + s} cy={y0 - s} r="9"
                fill={areaTone.stroke} stroke="#fff" strokeWidth="3"
              />
            )}
          </g>

          {/* zone tactile unique, focusable au clavier */}
          {!frozen && (
            <rect
              x={0} y={0} width={VB} height={VB}
              fill="transparent"
              role="button"
              tabIndex={0}
              aria-label={`Régler le côté du carré, actuellement ${formatDec(side)} ${unit}`}
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
            disabled={side <= minSide}
            aria-label="Diminuer le côté de 0,1"
            className="min-w-[52px] min-h-[44px] rounded-xl border-2 border-slate-300 bg-white text-xl font-bold text-slate-700 hover:border-indigo-500 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            −
          </button>
          <span className="font-mono text-lg font-extrabold text-slate-800 tabular-nums w-28 text-center">
            c = {formatDec(side)}
          </span>
          <button
            type="button"
            onClick={() => nudge(1)}
            disabled={side >= maxSide}
            aria-label="Augmenter le côté de 0,1"
            className="min-w-[52px] min-h-[44px] rounded-xl border-2 border-slate-300 bg-white text-xl font-bold text-slate-700 hover:border-indigo-500 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            +
          </button>
        </div>
      )}

      {/* Puces entières : le tap-first exigé par le playbook §11. */}
      {!frozen && (
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          {Array.from({ length: maxSide }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange?.(n)}
              aria-label={`Côté égale ${n}`}
              aria-pressed={side === n}
              className={`min-w-[44px] min-h-[44px] rounded-xl border-2 font-mono text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                side === n
                  ? 'bg-slate-800 border-slate-900 text-white'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-400'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      )}

      {/* ── Le miroir sur la droite graduée ──────────────────────────── */}
      {showLine && (
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-2">
          <p className="text-center text-[11px] font-mono uppercase tracking-wide text-slate-500">
            Le côté, sur la droite graduée
          </p>
          <NumberLine
            min={0}
            max={maxSide}
            step={1}
            snap={STEP}
            mode={frozen ? 'static' : 'place'}
            value={side}
            onChange={frozen ? undefined : (v) => onChange?.(roundTo(v, 1))}
            format={formatDec}
            height={140}
            disabled={frozen}
            markers={
              targetArea != null && !isPerfectSquare(targetArea)
                ? bracket(targetArea).map((b, i) => ({
                    value: b,
                    label: formatDec(b),
                    color: i === 0 ? '#f59e0b' : '#f59e0b',
                  }))
                : []
            }
            ariaLabel={`Le côté ${formatDec(side)} sur la droite graduée`}
          />
        </div>
      )}

      {/* ── L'écart, toujours chiffré ────────────────────────────────── */}
      {targetArea != null && (
        <p className="text-center text-xs text-slate-600">
          {exact ? (
            <span className="text-emerald-700 font-bold">
              <MathText>{`$${formatDec(side).replace('−', '-')}^{2} = ${formatDec(area).replace('−', '-')}$`}</MathText>
              {' '}— l’aire visée est atteinte exactement.
            </span>
          ) : (
            <>
              {formatDec(side)} × {formatDec(side)} = <strong className="font-mono">{formatDec(area)}</strong> {unit}²
              {' — '}
              {gap > 0
                ? <>il <strong>manque {formatDec(gap)}</strong> {unit}²</>
                : <>on <strong>dépasse de {formatDec(-gap)}</strong> {unit}²</>}
            </>
          )}
        </p>
      )}

      <p className="sr-only">
        Côté {formatDec(side)} {unit}, aire {formatDec(area)} {unit} carrés
        {targetArea != null ? `, aire visée ${formatDec(targetArea)}` : ''}.
        {targetArea != null && !isPerfectSquare(targetArea)
          ? ` La racine de ${formatDec(targetArea)} est comprise entre ${isqrt(targetArea)} et ${isqrt(targetArea) + 1}.`
          : ''}
      </p>
    </div>
  );
}

function Readout({ label, value, tone, big = false }) {
  const cls =
    tone === 'hit'
      ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
      : tone === 'target'
        ? 'border-amber-300 bg-amber-50 text-amber-800'
        : 'border-slate-200 bg-white text-slate-800';
  return (
    <div className={`rounded-2xl border-2 p-2.5 text-center ${cls}`}>
      <div className="text-[10px] font-mono tracking-wide text-slate-500 leading-tight">{label}</div>
      <div className={`font-mono font-extrabold tabular-nums ${big ? 'text-2xl' : 'text-xl'}`}>{value}</div>
    </div>
  );
}
