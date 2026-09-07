import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';

/**
 * QuantityShareLab — la collection qu'on RANGE en groupes égaux et dont on
 * EMPORTE des groupes, au doigt.
 *
 * Activity: attraper la barre de rangement (sous la collection) pour changer
 *   le nombre de paniers, ou le bord de la zone emportée pour changer le
 *   nombre de paniers qu'on emporte. Les objets se redistribuent sous le
 *   doigt ; le total, lui, ne bouge jamais.
 * Mathematical objective: « prendre 2/3 de 12 » n'est pas une formule, c'est
 *   DEUX gestes distincts — le bas RANGE (12 ÷ 3 = 4 par panier), le haut
 *   EMPORTE (4 × 2 = 8). Ce sont donc deux prises différentes sur le même
 *   objet, pas deux cases d'un formulaire.
 * Student action: on glisse sur la figure elle-même ; aucune validation
 *   intermédiaire, la conséquence est immédiate.
 * Controlled variable: `groups` par la barre de rangement, `taken` par le bord.
 * Mathematical state: {total, groups, taken}, avec `total` INVARIANT,
 *   `groups` restreint aux diviseurs de `total` (un rangement inégal n'est pas
 *   un partage — 6e), et 0 ≤ taken ≤ groups. Le nombre d'objets par panier,
 *   la quantité emportée et l'écriture en dérivent : rien n'est écrit en dur.
 * Visual consequence: ranger en PLUS de paniers met MOINS d'objets dans
 *   chacun, sans qu'un seul objet apparaisse ou disparaisse — le compteur
 *   « total » est le marqueur qui ne bouge pas.
 * Expected observation: « quand je range en plus de paniers, chaque panier
 *   est plus petit ; le tas, lui, est le même ».
 * Misconception targeted: « 2/3 de 12, c'est 12 ÷ 2 » — diviser par le haut.
 *   Ici le haut n'a AUCUN pouvoir de rangement : il ne fait qu'emporter des
 *   paniers déjà formés. Le geste rend l'erreur impossible à confondre.
 * Feedback: aucun ici ; le module compare à sa cible et interprète.
 * Formalization: la méthode « ÷ par le bas, × par le haut » du module 5 est
 *   la trace écrite des deux gestes, nommée APRÈS eux.
 * Scaffolding: les deux prises restent vivantes en permanence, y compris
 *   après validation ; le clavier (role="slider", flèches, Début/Fin) atteint
 *   les mêmes états.
 * Transfer: le module 6 réutilise la même architecture pour le quotient.
 *
 * Inspiré de l'ARCHITECTURE de `nombres-rationnels/components/RationalBar.jsx`
 * (3e) — deux prises distinctes sur un seul objet, l'une change l'écriture,
 * l'autre change la quantité, et un invariant reste visible pendant tout le
 * geste — mais transposé à la 6e et au DISCRET : on range des ballons, on ne
 * coupe pas un nombre. Aucun négatif, aucune simplification, aucune valeur
 * décimale, aucun dénominateur qui ne divise pas le total.
 *
 * §17bis — les nombres vivent dans le DOM sous la figure ; le SVG ne porte
 * que la collection et les deux pistes, dont les libellés sont ancrés à
 * gauche, hors de la course des poignées.
 */

const W = 620;
const PAD = 28;
const TOP = 8;
const LANE = 62;          // hauteur d'un couloir de prise

/** Les rangements possibles : uniquement ceux qui font des groupes ÉGAUX. */
export function groupOptionsFor(total, { min = 2, max = 12 } = {}) {
  const out = [];
  for (let g = min; g <= Math.min(max, total); g += 1) {
    if (total % g === 0) out.push(g);
  }
  return out.length > 0 ? out : [1];
}

const TONE = {
  sky: { fill: '#0ea5e9', soft: '#f0f9ff', edge: '#0369a1', rail: '#bae6fd' },
  emerald: { fill: '#10b981', soft: '#ecfdf5', edge: '#047857', rail: '#a7f3d0' },
  violet: { fill: '#8b5cf6', soft: '#f5f3ff', edge: '#6d28d9', rail: '#ddd6fe' },
  amber: { fill: '#f59e0b', soft: '#fffbeb', edge: '#b45309', rail: '#fde68a' },
};

export default function QuantityShareLab({
  total,
  groups,
  taken,
  onGroups,
  onTaken,
  groupOptions = null,
  tone = 'sky',
  caption = null,
}) {
  const svgRef = useRef(null);
  const [scale, setScale] = useState(1);

  // La taille tactile se MESURE : à 375 px la figure est rendue ~0,55×, donc
  // une prise de 24 unités SVG ne ferait que 13 px réels (§6ter.5).
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
  // 45 et non 44 : la conversion viewBox → pixels perd une fraction (43,99 px
  // mesuré dans nombres-rationnels), et « presque atteint » n'est pas atteint.
  const grip = Math.max(26, 45 * scale);

  const opts = groupOptions ?? groupOptionsFor(total);
  const t = TONE[tone] || TONE.sky;
  const perGroup = total / groups;

  // ── Géométrie de la collection : `groups` paniers côte à côte ────────
  const innerW = W - 2 * PAD;
  const gapW = 8;
  const basketW = (innerW - (groups - 1) * gapW) / groups;
  // Les objets d'un panier : au plus 4 par ligne, autant de lignes qu'il faut.
  const cols = Math.min(4, perGroup);
  const rows = Math.ceil(perGroup / cols);
  const dot = Math.min(26, Math.max(11, (basketW - 14) / cols));
  const basketH = Math.max(52, rows * (dot + 5) + 14);

  const basketX = (i) => PAD + i * (basketW + gapW);
  // Le bord « emporté » : la frontière droite des paniers pris.
  const edgeX = taken === 0
    ? PAD
    : basketX(taken - 1) + basketW + (taken < groups ? gapW / 2 : 0);

  // ── Les deux couloirs, sous la collection ────────────────────────────
  const laneTakeY = TOP + basketH + 12;
  const laneCutY = laneTakeY + LANE;
  const H = laneCutY + LANE + 6;

  // Le curseur d'un couloir a un rayon de 10 : sa piste est rentrée d'autant,
  // sinon il déborderait du cadre aux deux extrémités (§17bis).
  const RAIL_R = 12;
  const railX = PAD + RAIL_R;
  const railW = innerW - 2 * RAIL_R;

  const xFromClient = useCallback((clientX) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r || r.width === 0) return null;
    return ((clientX - r.left) / r.width) * W;
  }, []);

  const dragging = useRef(null);

  /** Le RANGEMENT : en combien de paniers égaux on range la collection. */
  const cutAt = useCallback((x) => {
    const ratio = Math.max(0, Math.min(1, (x - railX) / railW));
    const g = opts[Math.min(opts.length - 1, Math.round(ratio * (opts.length - 1)))];
    if (g === groups) return;
    onGroups?.(g);
  }, [opts, groups, onGroups, railX, railW]);

  /** L'EMPORT : combien de paniers, entiers, on emporte. */
  const takeAt = useCallback((x) => {
    const ratio = Math.max(0, Math.min(1, (x - railX) / railW));
    const n = Math.round(ratio * groups);
    const clamped = Math.max(0, Math.min(groups, n));
    if (clamped === taken) return;
    onTaken?.(clamped);
  }, [groups, taken, onTaken, railX, railW]);

  const down = (mode) => (e) => {
    dragging.current = mode;
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* déjà relâché */ }
    const x = xFromClient(e.clientX);
    if (x != null) (mode === 'cut' ? cutAt : takeAt)(x);
  };
  const move = (e) => {
    if (!dragging.current) return;
    const x = xFromClient(e.clientX);
    if (x != null) (dragging.current === 'cut' ? cutAt : takeAt)(x);
  };
  const up = (e) => {
    if (!dragging.current) return;
    dragging.current = null;
    try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch { /* idem */ }
  };

  /* Clavier — l'alternative obligatoire au glisser (§27). */
  const takeKey = (e) => {
    const at = (n) => onTaken?.(Math.max(0, Math.min(groups, n)));
    const m = {
      ArrowRight: () => at(taken + 1), ArrowUp: () => at(taken + 1),
      ArrowLeft: () => at(taken - 1), ArrowDown: () => at(taken - 1),
      Home: () => at(0), End: () => at(groups),
    };
    if (m[e.key]) { e.preventDefault(); m[e.key](); }
  };
  const cutKey = (e) => {
    const i = opts.indexOf(groups);
    const at = (j) => onGroups?.(opts[Math.max(0, Math.min(opts.length - 1, j))]);
    const m = {
      ArrowRight: () => at(i + 1), ArrowUp: () => at(i + 1),
      ArrowLeft: () => at(i - 1), ArrowDown: () => at(i - 1),
      Home: () => at(0), End: () => at(opts.length - 1),
    };
    if (m[e.key]) { e.preventDefault(); m[e.key](); }
  };

  const railPos = (i, n) => (n > 1 ? railX + (i / (n - 1)) * railW : railX + railW / 2);
  const cutCursorX = railPos(Math.max(0, opts.indexOf(groups)), opts.length);
  const takeCursorX = railX + (groups > 0 ? (taken / groups) * railW : 0);

  return (
    <div
      className="space-y-3"
      role="group"
      aria-label="Collection à ranger en groupes égaux"
      data-qs-total={total}
      data-qs-groups={groups}
      data-qs-taken={taken}
      data-qs-per={perGroup}
    >
      <div className="rounded-2xl border-2 border-slate-200 bg-white overflow-hidden">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto block select-none"
          style={{ touchAction: 'none' }}
          role="group"
          aria-label={`${total} objets rangés en ${groups} groupes de ${perGroup}, ${taken} groupe${taken > 1 ? 's' : ''} emporté${taken > 1 ? 's' : ''}`}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
        >
          {/* ── La collection : le TOTAL ne change jamais ─────────────── */}
          <g pointerEvents="none">
            {Array.from({ length: groups }, (_, g) => {
              const on = g < taken;
              return (
                <g key={g}>
                  <rect
                    x={basketX(g)}
                    y={TOP}
                    width={basketW}
                    height={basketH}
                    rx="9"
                    fill={on ? t.soft : '#ffffff'}
                    stroke={on ? t.edge : '#cbd5e1'}
                    strokeWidth={on ? '3' : '2'}
                  />
                  {Array.from({ length: perGroup }, (_, k) => {
                    const c = k % cols;
                    const r = Math.floor(k / cols);
                    const rowCount = Math.min(cols, perGroup - r * cols);
                    const blockW = rowCount * dot + (rowCount - 1) * 4;
                    const x0 = basketX(g) + (basketW - blockW) / 2;
                    return (
                      <circle
                        key={k}
                        cx={x0 + c * (dot + 4) + dot / 2}
                        cy={TOP + 9 + r * (dot + 5) + dot / 2}
                        r={dot / 2}
                        fill={on ? t.fill : '#e2e8f0'}
                        stroke={on ? t.edge : '#cbd5e1'}
                        strokeWidth="1.5"
                      />
                    );
                  })}
                </g>
              );
            })}
            {/* Le bord de l'emport : le marqueur qui matérialise « jusqu'ici ». */}
            {taken > 0 && (
              <line
                x1={edgeX} y1={TOP - 5} x2={edgeX} y2={TOP + basketH + 5}
                stroke={t.edge} strokeWidth="4" strokeLinecap="round"
              />
            )}
          </g>

          {/* ── PRISE 1 : emporter des paniers ──────────────────────────
              Peinte APRÈS le décor pour recevoir le pointeur (§25 : un décor
              posé au-dessus de la zone tactile avale le geste). */}
          <text
            x={PAD} y={laneTakeY + 13}
            fontSize="12" fill={t.edge} fontFamily="ui-monospace, monospace" fontWeight="700"
          >
            emporter des paniers
          </text>
          <rect
            x={PAD} y={laneTakeY + 18} width={innerW} height={grip}
            fill="transparent"
            cursor="ew-resize"
            role="slider"
            tabIndex={0}
            aria-label={`Paniers emportés : glisse pour en emporter plus ou moins. Actuellement ${taken} sur ${groups}.`}
            aria-valuenow={taken}
            aria-valuemin={0}
            aria-valuemax={groups}
            aria-valuetext={`${taken} panier${taken > 1 ? 's' : ''} sur ${groups} — ${taken * perGroup} objets`}
            onPointerDown={down('take')}
            onKeyDown={takeKey}
            style={{ touchAction: 'none' }}
          />
          <g pointerEvents="none">
            <rect
              x={railX} y={laneTakeY + 18 + grip / 2 - 5} width={railW} height={10}
              rx="5" fill={t.rail} stroke={t.edge} strokeWidth="1.5" opacity="0.7"
            />
            <circle
              cx={takeCursorX} cy={laneTakeY + 18 + grip / 2}
              r="11" fill={t.edge} stroke="#fff" strokeWidth="3"
            />
          </g>

          {/* ── PRISE 2 : ranger la collection ──────────────────────────
              Un couloir séparé plutôt que la collection elle-même : les deux
              prises se recouvriraient, et à 375 px deux zones de 44 px ne
              peuvent pas cohabiter sur une figure de 200 px de haut. */}
          <text
            x={PAD} y={laneCutY + 13}
            fontSize="12" fill="#4338ca" fontFamily="ui-monospace, monospace" fontWeight="700"
          >
            ranger en paniers égaux
          </text>
          <rect
            x={PAD} y={laneCutY + 18} width={innerW} height={grip}
            fill="transparent"
            cursor="ew-resize"
            role="slider"
            tabIndex={0}
            aria-label={`Rangement : glisse pour ranger en plus ou moins de paniers égaux. Actuellement ${groups} paniers de ${perGroup}.`}
            aria-valuenow={groups}
            aria-valuemin={opts[0]}
            aria-valuemax={opts[opts.length - 1]}
            aria-valuetext={`${groups} paniers de ${perGroup} objets`}
            onPointerDown={down('cut')}
            onKeyDown={cutKey}
            style={{ touchAction: 'none' }}
          />
          <g pointerEvents="none">
            <rect
              x={railX} y={laneCutY + 18 + grip / 2 - 5} width={railW} height={10}
              rx="5" fill="#e0e7ff" stroke="#a5b4fc" strokeWidth="1.5"
            />
            {opts.map((g, i) => (
              <circle
                key={g}
                cx={railPos(i, opts.length)}
                cy={laneCutY + 18 + grip / 2}
                r={g === groups ? 0 : 3}
                fill="#a5b4fc"
              />
            ))}
            <circle
              cx={cutCursorX} cy={laneCutY + 18 + grip / 2}
              r="11" fill="#4338ca" stroke="#fff" strokeWidth="3"
            />
          </g>
        </svg>
      </div>

      {/* Lecture chiffrée — dans le DOM, à l'abri de toute collision.
          Le TOTAL est en tête : c'est lui qui ne bouge pas pendant qu'on range. */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
        <div className="rounded-xl border-2 border-slate-300 bg-slate-50 py-2">
          <div className="font-mono font-black text-xl text-slate-800 tabular-nums">{total}</div>
          <div className="text-xs text-slate-600">objets en tout</div>
        </div>
        <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 py-2">
          <div className="font-mono font-black text-xl text-indigo-800 tabular-nums">{groups}</div>
          <div className="text-xs text-indigo-700">paniers égaux</div>
        </div>
        <div className="rounded-xl border-2 border-slate-200 bg-white py-2">
          <div className="font-mono font-black text-xl text-slate-700 tabular-nums">{perGroup}</div>
          <div className="text-xs text-slate-500">par panier</div>
        </div>
        <div className="rounded-xl border-2 border-slate-300 bg-slate-900 py-2" role="status" aria-live="polite">
          <div className="font-mono font-black text-xl text-amber-300 tabular-nums">
            {taken * perGroup}
          </div>
          <div className="text-xs text-slate-300">
            {taken}/{groups} emporté{taken > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {caption && <p className="text-center text-xs text-slate-500">{caption}</p>}
      <p className="sr-only">
        {`${total} objets rangés en ${groups} paniers égaux de ${perGroup} objets ; ${taken} panier${
          taken > 1 ? 's' : ''
        } emporté${taken > 1 ? 's' : ''}, soit ${taken * perGroup} objets.`}
      </p>
    </div>
  );
}
