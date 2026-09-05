import React from 'react';
import MathText from '../../../../../common/components/MathText';
import { buildRectLayout, buildSquareLayout, sumStrip, likePairs } from './litteralUtils';

/**
 * AlgebraRect — « Le Rectangle d'aire », la manipulation SIGNATURE de la
 * leçon (INTERACTION_PEDAGOGY §24).
 *
 * Activity: découper les côtés d'un rectangle écrits avec x, puis compter
 *   chaque morceau d'aire dans la bande somme.
 * Mathematical objective: faire de « développer » et « factoriser » LA MÊME
 *   image lue dans deux sens — aire du rectangle = produit des côtés = somme
 *   des aires des morceaux.
 * Student action: taper un côté pour le SÉPARER en ses termes ; taper chaque
 *   morceau pour le COMPTER (son terme rejoint la bande somme) ; taper le
 *   bouton « Regrouper » pour empiler les deux morceaux semblables.
 * Controlled variable: `splitA`, `splitB`, `counted` (Set d'ids), `merged` —
 *   tous possédés par le module.
 * Mathematical state: le produit `{ a, b }` (des Term[]). La géométrie, les
 *   étiquettes et la bande somme en sont DÉRIVÉES (buildRectLayout).
 * Visual consequence: un côté séparé montre ses segments ; un morceau compté
 *   se colore et s'écrit dans la bande ; les morceaux NON comptés restent
 *   gris — l'incomplétude EST le retour.
 * Expected observation: chaque morceau est un produit d'un terme de chaque
 *   côté, et il y en a autant que de cases dans la grille (2, puis 4).
 * Misconception targeted: « 4(2x − 3) = 8x − 3 » (le second morceau reste
 *   gris) ; « (x + 3)(x + 2) = x² + 6 » (deux bandes de x dorment encore) ;
 *   « (a + b)² = a² + b² » (les deux rectangles ab manquent).
 * Feedback: par conséquence — la bande somme n'affiche que ce qui est compté,
 *   et le compteur « n / N morceaux » quantifie l'écart. Le module rend les
 *   <Feedback> ; le composant n'affirme rien.
 * Formalization: le mot « développer » est nommé APRÈS le comptage complet.
 * Scaffolding: `revealAll` compte tout d'un coup (échappatoire du module) ;
 *   `hint` fait clignoter au plus deux fois le premier morceau non compté.
 * Transfer: mode 'square' pour (a + b)², mode 'rebuild' pour la factorisation
 *   (les côtés sont donnés, on relit la même image), puis figé en synthèse.
 *
 * ÉCHELLE : x est DESSINÉ à `xUnit` (3) unités mais les côtés ne portent QUE
 * des symboles — jamais de graduation — pour qu'on ne puisse pas lire
 * « x = 3 ». Un terme négatif garde sa longueur absolue, reçoit une trame
 * hachurée et son étiquette signée : on ne dessine jamais une aire négative.
 *
 * Composant CONTRÔLÉ : aucune logique de progression ici.
 *
 * Nœuds interactifs : ≤ 2 boutons de côté + ≤ 4 zones de morceau + 1 bouton
 * « Regrouper » = 7.
 *
 * @param {{a: Term[], b: Term[]}} [product]  requis hors mode 'square'
 * @param {boolean} splitA @param {boolean} splitB
 * @param {(side:'a'|'b')=>void} [onSplit]
 * @param {Set<string>|string[]} counted   ids des morceaux comptés
 * @param {(id:string)=>void} [onCount]
 * @param {boolean} merged @param {()=>void} [onMerge]
 * @param {'expand'|'rebuild'|'square'} [mode='expand']
 * @param {number} [xUnit=3] @param {boolean} [revealAll] @param {boolean} [disabled]
 * @param {boolean} [frozen]  synthèse : plus aucun geste
 */
const UNIT = 26;      // pixels par unité de longueur
const PAD_L = 44;     // place pour l'étiquette du côté vertical
const PAD_T = 30;     // place pour l'étiquette du côté horizontal
const PAD_R = 14;
const PAD_B = 14;

const PIECE_FILL = {
  2: '#c7d2fe',   // x² — indigo clair
  1: '#a7f3d0',   // x  — émeraude clair
  0: '#fde68a',   // 1  — ambre clair
};
const PIECE_STROKE = { 2: '#4f46e5', 1: '#059669', 0: '#d97706' };
const SQUARE_FILL = { a2: '#c7d2fe', ab: '#a7f3d0', b2: '#fde68a' };
const SQUARE_STROKE = { a2: '#4f46e5', ab: '#059669', b2: '#d97706' };

export default function AlgebraRect({
  product,
  splitA = false,
  splitB = false,
  onSplit,
  counted = [],
  onCount,
  merged = false,
  onMerge,
  mode = 'expand',
  xUnit = 3,
  revealAll = false,
  disabled = false,
  frozen = false,
  hint = false,
  caption,
}) {
  const isSquare = mode === 'square';
  const layout = isSquare ? buildSquareLayout() : buildRectLayout(product, { xUnit });
  const { sideA, sideB, pieces, width, height } = layout;

  const countedSet = new Set(counted);
  const effectiveCounted = revealAll ? pieces.map((p) => p.id) : [...countedSet];
  const isCounted = (id) => revealAll || countedSet.has(id);

  // Un morceau n'est comptable que si LES DEUX côtés qui le portent sont
  // séparés (ou n'ont qu'un seul terme) — le geste a un ordre.
  const aReady = sideA.length === 1 || splitA;
  const bReady = sideB.length === 1 || splitB;
  const piecesUnlocked = aReady && bReady;

  const locked = disabled || frozen;
  const pairs = likePairs(pieces, effectiveCounted);
  const canMerge = !merged && pairs.length > 0 && effectiveCounted.length === pieces.length;

  const W = PAD_L + width * UNIT + PAD_R;
  const H = PAD_T + height * UNIT + PAD_B;

  // Offsets cumulés des segments, en unités.
  const offA = [];
  sideA.reduce((acc, s) => { offA.push(acc); return acc + s.len; }, 0);
  const offB = [];
  sideB.reduce((acc, s) => { offB.push(acc); return acc + s.len; }, 0);

  const firstUncounted = pieces.find((p) => !isCounted(p.id));
  const countedCount = revealAll ? pieces.length : pieces.filter((p) => countedSet.has(p.id)).length;

  const pieceFill = (p) =>
    isSquare ? SQUARE_FILL[p.likeKey] : PIECE_FILL[p.deg];
  const pieceStroke = (p) =>
    isSquare ? SQUARE_STROKE[p.likeKey] : PIECE_STROKE[p.deg];

  return (
    <div className="space-y-3" role="group" aria-label="Rectangle d'aire">
      {/* ── Les deux boutons « séparer un côté » ─────────────────────── */}
      {!frozen && mode !== 'rebuild' && (
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {[['a', sideA, splitA, layout.sideAPlain], ['b', sideB, splitB, layout.sideBPlain]].map(
            ([key, segs, split, plain]) =>
              segs.length > 1 ? (
                <button
                  key={key}
                  type="button"
                  disabled={locked || split}
                  onClick={() => onSplit?.(key)}
                  aria-label={`Séparer le côté ${plain} en ses termes`}
                  className={`min-h-[44px] px-3.5 rounded-xl border-2 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    split
                      ? 'bg-slate-100 border-slate-200 text-slate-400'
                      : 'bg-white border-indigo-300 text-indigo-800 hover:border-indigo-500'
                  }`}
                >
                  {split ? '✓ ' : '✂ '}Séparer {plain}
                </button>
              ) : null,
          )}
        </div>
      )}

      {/* ── Le rectangle ─────────────────────────────────────────────── */}
      <div className="w-full overflow-x-auto rounded-2xl border-2 border-slate-200 bg-white p-2">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto max-w-[520px] mx-auto block select-none"
          role={frozen ? 'img' : 'group'}
          aria-label={
            frozen
              ? `Rectangle de côtés ${layout.sideAPlain} et ${layout.sideBPlain}, figé`
              : `Rectangle de côtés ${layout.sideAPlain} et ${layout.sideBPlain}`
          }
          style={{ touchAction: 'manipulation' }}
        >
          <defs>
            <pattern id="ar-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="7" height="7" fill="#fecaca" />
              <line x1="0" y1="0" x2="0" y2="7" stroke="#b91c1c" strokeWidth="2" />
            </pattern>
          </defs>

          {/* morceaux (décoratifs — la zone tactile est un rect séparé) */}
          <g pointerEvents="none">
            {pieces.map((p) => {
              const x = PAD_L + offB[p.col] * UNIT;
              const y = PAD_T + offA[p.row] * UNIT;
              const w = p.w * UNIT;
              const h = p.h * UNIT;
              const on = isCounted(p.id);
              const pulse = hint && !on && firstUncounted?.id === p.id;
              return (
                <g key={p.id}>
                  <rect
                    x={x} y={y} width={w} height={h}
                    fill={p.neg ? 'url(#ar-hatch)' : on ? pieceFill(p) : '#f1f5f9'}
                    fillOpacity={p.neg ? (on ? 1 : 0.35) : 1}
                    stroke={on ? pieceStroke(p) : '#cbd5e1'}
                    strokeWidth={on ? 2.5 : 1.5}
                    className={pulse ? 'ar-pulse' : ''}
                  />
                  <text
                    x={x + w / 2} y={y + h / 2 + 5}
                    textAnchor="middle"
                    fontSize={Math.min(17, Math.max(11, Math.min(w, h) / 2.2))}
                    fontFamily="monospace"
                    fontWeight="bold"
                    fill={on ? (p.neg ? '#7f1d1d' : '#0f172a') : '#94a3b8'}
                  >
                    {on ? p.plain : '?'}
                  </text>
                </g>
              );
            })}

            {/* côté vertical (a) — symboles seulement, jamais de graduation */}
            {splitA || sideA.length === 1
              ? sideA.map((s, i) => (
                  <text
                    key={s.id}
                    x={PAD_L - 12}
                    y={PAD_T + (offA[i] + s.len / 2) * UNIT + 5}
                    textAnchor="middle"
                    fontSize="15" fontFamily="monospace" fontWeight="bold"
                    fill={s.neg ? '#b91c1c' : '#334155'}
                  >
                    {s.plain}
                  </text>
                ))
              : (
                <text
                  x={PAD_L - 12} y={PAD_T + (height / 2) * UNIT + 5}
                  textAnchor="middle" fontSize="15" fontFamily="monospace" fontWeight="bold" fill="#334155"
                >
                  {layout.sideAPlain}
                </text>
              )}

            {/* côté horizontal (b) */}
            {splitB || sideB.length === 1
              ? sideB.map((s, i) => (
                  <text
                    key={s.id}
                    x={PAD_L + (offB[i] + s.len / 2) * UNIT}
                    y={PAD_T - 10}
                    textAnchor="middle"
                    fontSize="15" fontFamily="monospace" fontWeight="bold"
                    fill={s.neg ? '#b91c1c' : '#334155'}
                  >
                    {s.plain}
                  </text>
                ))
              : (
                <text
                  x={PAD_L + (width / 2) * UNIT} y={PAD_T - 10}
                  textAnchor="middle" fontSize="15" fontFamily="monospace" fontWeight="bold" fill="#334155"
                >
                  {layout.sideBPlain}
                </text>
              )}

            {/* traits de découpe visibles quand un côté est séparé */}
            {splitA && sideA.slice(1).map((s, i) => (
              <line
                key={`ca${s.id}`}
                x1={PAD_L} y1={PAD_T + offA[i + 1] * UNIT}
                x2={PAD_L + width * UNIT} y2={PAD_T + offA[i + 1] * UNIT}
                stroke="#475569" strokeWidth="2" strokeDasharray="5 4"
              />
            ))}
            {splitB && sideB.slice(1).map((s, i) => (
              <line
                key={`cb${s.id}`}
                x1={PAD_L + offB[i + 1] * UNIT} y1={PAD_T}
                x2={PAD_L + offB[i + 1] * UNIT} y2={PAD_T + height * UNIT}
                stroke="#475569" strokeWidth="2" strokeDasharray="5 4"
              />
            ))}
          </g>

          {/* zones tactiles transparentes, une par morceau */}
          {!frozen && piecesUnlocked && pieces.map((p) => {
            const x = PAD_L + offB[p.col] * UNIT;
            const y = PAD_T + offA[p.row] * UNIT;
            const on = isCounted(p.id);
            return (
              <rect
                key={`hit-${p.id}`}
                x={x} y={y} width={p.w * UNIT} height={p.h * UNIT}
                fill="transparent"
                role="button"
                tabIndex={locked || on ? -1 : 0}
                aria-label={`Compter le morceau ${sideA[p.row].plain} × ${sideB[p.col].plain}, d'aire ${p.plain}${on ? ' (déjà compté)' : ''}`}
                aria-pressed={on}
                style={{ cursor: locked || on ? 'default' : 'pointer' }}
                onClick={() => { if (!locked && !on) onCount?.(p.id); }}
                onKeyDown={(e) => {
                  if (locked || on) return;
                  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCount?.(p.id); }
                }}
              />
            );
          })}
        </svg>

        <style>{`
          @keyframes arPulse {
            0%, 100% { opacity: 1; }
            50%      { opacity: 0.45; }
          }
          .ar-pulse { animation: arPulse 1.1s ease-in-out 2; }
          @media (prefers-reduced-motion: reduce) { .ar-pulse { animation: none; } }
        `}</style>
      </div>

      {/* ── La bande somme ───────────────────────────────────────────── */}
      <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-3 space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-[11px] font-mono uppercase tracking-wide text-slate-500">
            Somme des morceaux comptés
          </span>
          <span className="text-[11px] font-mono font-bold text-slate-600 tabular-nums">
            {countedCount} / {pieces.length} morceau{pieces.length > 1 ? 'x' : ''}
          </span>
        </div>
        <div className="text-center text-lg text-slate-800 min-h-[32px] flex items-center justify-center">
          <MathText>
            {`$${layout.sideALatex.includes('+') || layout.sideALatex.includes('-')
              ? `(${layout.sideALatex})`
              : layout.sideALatex}${layout.sideBLatex.includes('+') || layout.sideBLatex.includes('-')
              ? `(${layout.sideBLatex})`
              : layout.sideBLatex} = ${sumStrip(pieces, effectiveCounted, merged)}$`}
          </MathText>
        </div>
        {countedCount < pieces.length && (
          <p className="text-center text-xs text-slate-500">
            {pieces.length - countedCount} morceau{pieces.length - countedCount > 1 ? 'x' : ''} encore gris
            {piecesUnlocked ? ' — touche-le pour le compter.' : ' — sépare d’abord les côtés.'}
          </p>
        )}
      </div>

      {/* ── Regrouper les morceaux semblables ────────────────────────── */}
      {!frozen && onMerge && pieces.length > 2 && (
        <div className="flex justify-center">
          <button
            type="button"
            disabled={locked || !canMerge}
            onClick={() => onMerge?.()}
            aria-label="Regrouper les deux morceaux semblables"
            className={`min-h-[44px] px-4 rounded-xl border-2 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              merged
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : canMerge
                ? 'bg-emerald-600 border-emerald-700 text-white hover:bg-emerald-700'
                : 'bg-slate-100 border-slate-200 text-slate-400'
            }`}
          >
            {merged ? '✓ Morceaux semblables regroupés' : 'Regrouper les morceaux semblables'}
          </button>
        </div>
      )}

      {caption && <p className="text-center text-xs text-slate-500">{caption}</p>}

      <p className="sr-only">
        Côtés {layout.sideAPlain} et {layout.sideBPlain} ; {countedCount} morceaux comptés sur{' '}
        {pieces.length} ; somme actuelle : {sumStrip(pieces, effectiveCounted, merged, { latex: false })}.
      </p>
    </div>
  );
}
