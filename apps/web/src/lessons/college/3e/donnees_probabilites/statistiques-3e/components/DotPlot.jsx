import React, { useRef, useCallback, useState } from 'react';
import { formatDec, roundTo } from '@smarter-academy/core';
import { sortSeries, mean, median, range, layoutFor, effectifs } from './statUtils';

/**
 * DotPlot — la série élastique : des pastilles qu'on peut tirer.
 *
 * Activity            déplacer une valeur de la série le long de l'axe, ou
 *                     désigner un point d'équilibre.
 * Mathematical objective  faire VOIR que les indicateurs ne réagissent pas de la
 *                     même façon : la moyenne suit la valeur tirée, la médiane
 *                     résiste, l'étendue s'ouvre.
 * Student action      choisir une pastille (pastilles de sélection ou clic),
 *                     puis la glisser — ou la déplacer aux flèches.
 * Controlled variable la valeur sélectionnée, au pas de l'axe.
 * Mathematical state  `values` appartient au module ; moyenne, médiane et
 *                     étendue en sont DÉRIVÉES à chaque rendu. Aucun indicateur
 *                     n'est stocké, donc aucun ne peut se désynchroniser.
 * Visual consequence  le triangle ▲ de la moyenne glisse, le trait de la
 *                     médiane reste, le crochet de l'étendue s'allonge.
 * Expected observation « j'ai tiré une seule valeur et seule la moyenne a
 *                     bougé ».
 * Misconception targeted  « tous les indicateurs se valent » ; et la moyenne
 *                     confondue avec la valeur du milieu.
 * Feedback            les trois lectures sont écrites sous l'axe, en clair.
 * Formalization       les noms arrivent au module 5, sur des gestes déjà faits.
 * Scaffolding         mode `pick` (désigner) puis `drag` (tirer).
 * Transfer            deux DotPlot côte à côte au module 6.
 *
 * ─── SÉCURITÉ D'AFFICHAGE (§17bis) ──────────────────────────────────────
 * Trois dispositifs, tous calculés et non espérés :
 *  1. `layoutFor` déduit le rayon des pastilles de la pile la plus haute, et
 *     remplace toute pile de plus de six par « ×N » — une colonne ne peut donc
 *     jamais déborder du cadre.
 *  2. Les trois étiquettes vivent sur TROIS LIGNES distinctes (médiane
 *     au-dessus des piles, moyenne sous l'axe, étendue plus bas encore) : même
 *     quand moyenne et médiane coïncident — l'état visé au module 2 — leurs
 *     textes ne peuvent pas se rencontrer.
 *  3. Toute étiquette est ramenée dans le cadre par `clampLabel`, et sa demi-
 *     largeur est mesurée caractère par caractère.
 */

const W = 640;
const H = 210;
const PAD_L = 44;
const PAD_R = 44;
const AXIS_W = W - PAD_L - PAD_R;
const AXIS_Y = 132;          // ligne de l'axe
const STACK_H = 96;          // hauteur allouée aux piles, au-dessus de l'axe
const ROW_MEDIAN = 26;       // ligne 1 : au-dessus des piles
const ROW_MEAN = AXIS_Y + 34;    // ligne 2 : sous l'axe
const ROW_RANGE = AXIS_Y + 62;   // ligne 3 : encore dessous

const GLYPH = { ',': 3, '−': 5.5, '-': 5.5, '.': 3, ' ': 3 };
const textWidth = (s, size = 11) =>
  [...String(s)].reduce((n, c) => n + (GLYPH[c] ?? size * 0.55), 0);

/** Ramène une étiquette dans le cadre, en tenant compte de sa largeur. */
const clampLabel = (cx, label, size = 11) => {
  const half = textWidth(label, size) / 2;
  return Math.max(half + 4, Math.min(W - half - 4, cx));
};

export default function DotPlot({
  values,
  min = 0,
  max = 40,
  step = 5,
  activeIndex = null,
  onActiveChange,
  onChange,                 // (index, value) => void
  mode = 'display',         // 'display' | 'drag' | 'pick'
  pickValue = null,         // mode 'pick' : le pivot proposé par l'élève
  onPick,
  showMean = false,
  showMedian = false,
  showRange = false,
  // Le crochet SANS le mot « étendue » : sert au module 3, où le graphique
  // précède la brique qui nomme la notion. Le geste est montré, le mot arrive
  // avec la brique (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
  rangeUnnamed = false,
  target = null,            // repère en pointillé (moyenne visée)
  unit = ' min',
  frozen = false,
  ariaLabel,
}) {
  const svgRef = useRef(null);
  const dragging = useRef(false);
  const [focused, setFocused] = useState(false);
  const locked = frozen;
  const interactive = !locked && (mode === 'drag' || mode === 'pick');

  const span = max - min || 1;
  const toX = useCallback((v) => PAD_L + ((v - min) / span) * AXIS_W, [min, span]);

  const { stacks, radius } = layoutFor(values, { plotHeight: STACK_H });
  const m = mean(values);
  const med = median(values);
  const rng = range(values);

  /** Recette de glissement sanctionnée (NumberLine) : ratio → viewBox → pas. */
  const valueFromClientX = useCallback(
    (clientX) => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect || rect.width === 0) return null;
      const x = ((clientX - rect.left) / rect.width) * W;
      const raw = min + ((x - PAD_L) / AXIS_W) * span;
      return roundTo(Math.min(max, Math.max(min, Math.round(raw / step) * step)), 6);
    },
    [min, max, span, step]
  );

  /** En mode glissement, on saisit la pastille la plus proche du doigt. */
  const nearestIndex = (v) => {
    let best = 0;
    let bestD = Infinity;
    values.forEach((x, i) => {
      const d = Math.abs(x - v);
      if (d < bestD) { bestD = d; best = i; }
    });
    return best;
  };

  const commit = (v) => {
    if (v === null || !interactive) return;
    if (mode === 'pick') { onPick?.(v); return; }
    const i = activeIndex ?? nearestIndex(v);
    if (activeIndex === null) onActiveChange?.(i);
    onChange?.(i, v);
  };

  const handlePointerDown = (e) => {
    if (!interactive) return;
    dragging.current = true;
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* pointeur déjà relâché */ }
    commit(valueFromClientX(e.clientX));
  };
  const handlePointerMove = (e) => {
    if (!interactive || !dragging.current) return;
    commit(valueFromClientX(e.clientX));
  };
  const endDrag = (e) => {
    if (!dragging.current) return;
    dragging.current = false;
    try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch { /* idem */ }
  };

  /** L'alternative obligatoire au glisser. */
  const handleKeyDown = (e) => {
    if (!interactive) return;
    const cur = mode === 'pick' ? (pickValue ?? min) : values[activeIndex ?? 0];
    const moves = {
      ArrowRight: cur + step, ArrowUp: cur + step,
      ArrowLeft: cur - step, ArrowDown: cur - step,
      Home: min, End: max,
    };
    if (!(e.key in moves)) return;
    e.preventDefault();
    commit(roundTo(Math.min(max, Math.max(min, moves[e.key])), 6));
  };

  const ticks = [];
  for (let v = min; v <= max + 1e-9; v += step) ticks.push(roundTo(v, 6));
  const labelEvery = ticks.length > 11 ? 2 : 1;

  const reading = mode === 'pick'
    ? `pivot proposé en ${formatDec(pickValue ?? min)}${unit}`
    : `série de ${values.length} valeurs, moyenne ${formatDec(m ?? 0)}${unit}`;

  return (
    <div className="w-full flex flex-col items-center gap-2">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full max-w-[640px] select-none bg-white rounded-xl border-2 border-slate-200"
        style={{ touchAction: dragging.current ? 'none' : 'manipulation' }}
        {...(interactive
          ? { role: 'group', 'aria-label': ariaLabel ?? 'Série statistique' }
          : { role: 'img', 'aria-label': ariaLabel ?? 'Série statistique' })}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {/* ── Décor : jamais de pointerEvents ── */}
        <g style={{ pointerEvents: 'none' }}>
          {/* L'étendue, tout en bas : un crochet entre les deux extrêmes. */}
          {showRange && values.length > 0 && (() => {
            const a = toX(Math.min(...values));
            const b = toX(Math.max(...values));
            const y = ROW_RANGE - 12;
            const label = rangeUnnamed ? `${formatDec(rng)}${unit}` : `étendue ${formatDec(rng)}${unit}`;
            return (
              <g>
                <path d={`M ${a} ${y - 5} L ${a} ${y} L ${b} ${y} L ${b} ${y - 5}`}
                  fill="none" stroke="#7c3aed" strokeWidth="2" />
                <text x={clampLabel((a + b) / 2, label)} y={ROW_RANGE + 6} textAnchor="middle"
                  fontSize="11" className="font-mono font-semibold" fill="#6d28d9">
                  {label}
                </text>
              </g>
            );
          })()}

          {/* La moyenne, sous l'axe : un triangle qui glisse. */}
          {showMean && m !== null && (() => {
            const cx = toX(m);
            const label = `moyenne ${formatDec(roundTo(m, 2))}${unit}`;
            return (
              <g>
                <path d={`M ${cx} ${AXIS_Y + 3} l -7 12 l 14 0 z`} fill="#0284c7" />
                <text x={clampLabel(cx, label)} y={ROW_MEAN + 8} textAnchor="middle"
                  fontSize="11" className="font-mono font-semibold" fill="#0369a1">
                  {label}
                </text>
              </g>
            );
          })()}

          {/* La médiane, au-dessus des piles : un trait vertical. */}
          {showMedian && med !== null && (() => {
            const cx = toX(med);
            const label = `médiane ${formatDec(med)}${unit}`;
            return (
              <g>
                <line x1={cx} y1={ROW_MEDIAN + 6} x2={cx} y2={AXIS_Y - 2}
                  stroke="#059669" strokeWidth="2.5" strokeDasharray="5 4" />
                <text x={clampLabel(cx, label)} y={ROW_MEDIAN} textAnchor="middle"
                  fontSize="11" className="font-mono font-semibold" fill="#047857">
                  {label}
                </text>
              </g>
            );
          })()}

          {/* La cible éventuelle : un repère ambre en pointillé. */}
          {target !== null && (
            <line x1={toX(target)} y1={AXIS_Y - STACK_H} x2={toX(target)} y2={AXIS_Y + 16}
              stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4" />
          )}

          {/* L'axe et ses graduations. */}
          <line x1={PAD_L} y1={AXIS_Y} x2={W - PAD_R} y2={AXIS_Y} stroke="#0f172a" strokeWidth="2" />
          {ticks.map((v, i) => (
            <g key={`t${v}`}>
              <line x1={toX(v)} y1={AXIS_Y - 4} x2={toX(v)} y2={AXIS_Y + 4} stroke="#0f172a" strokeWidth="1.5" />
              {i % labelEvery === 0 && (
                <text x={toX(v)} y={AXIS_Y + 18} textAnchor="middle" fontSize="10"
                  className="font-mono tabular-nums" fill="#64748b">
                  {formatDec(v)}
                </text>
              )}
            </g>
          ))}

          {/* Les piles de pastilles, jamais plus hautes que le cadre. */}
          {stacks.map((s) => {
            const cx = toX(s.value);
            return (
              <g key={`s${s.value}`}>
                {Array.from({ length: s.drawn }, (_, k) => {
                  const cy = AXIS_Y - radius - 2 - k * (2 * radius + 2);
                  const isActive = activeIndex !== null && values[activeIndex] === s.value;
                  return (
                    <circle key={k} cx={cx} cy={cy} r={radius}
                      fill={isActive ? '#4f46e5' : '#94a3b8'}
                      stroke="#ffffff" strokeWidth="1.5" />
                  );
                })}
                {s.badge && (
                  <text x={cx} y={AXIS_Y - radius - 6 - s.drawn * (2 * radius + 2)}
                    textAnchor="middle" fontSize="10" className="font-mono font-bold" fill="#475569">
                    ×{s.badge}
                  </text>
                )}
              </g>
            );
          })}

          {/* Le pivot proposé, en mode « désigner ». */}
          {mode === 'pick' && pickValue !== null && (
            <path d={`M ${toX(pickValue)} ${AXIS_Y + 3} l -8 14 l 16 0 z`}
              fill="#f59e0b" stroke="#b45309" strokeWidth="1.5" />
          )}
        </g>

        {/* ── Zone tactile unique, au-dessus du décor ── */}
        {interactive && (
          <rect
            x="0" y="0" width={W} height={H} fill="transparent"
            role="slider" tabIndex={0}
            aria-label={ariaLabel ?? 'Série statistique — déplace la valeur'}
            aria-valuetext={reading}
            aria-valuemin={min} aria-valuemax={max}
            aria-valuenow={mode === 'pick' ? (pickValue ?? min) : (values[activeIndex ?? 0] ?? min)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{ outline: 'none' }}
          />
        )}
        {interactive && focused && (
          <rect x="1" y="1" width={W - 2} height={H - 2} fill="none"
            stroke="#3b82f6" strokeWidth="2" rx="8" style={{ pointerEvents: 'none' }} />
        )}
      </svg>

      {/* Les pastilles de sélection : le chemin tap-first du glissement. */}
      {mode === 'drag' && !frozen && (
        <div className="flex flex-wrap gap-1.5 justify-center">
          {sortSeries(values).map((v, k) => {
            const i = values.indexOf(v);
            return (
              <button
                key={`${v}-${k}`}
                type="button"
                onClick={() => onActiveChange?.(i)}
                aria-pressed={activeIndex === i}
                aria-label={`Choisir la valeur ${formatDec(v)}${unit}`}
                className={`min-w-[44px] min-h-[44px] px-2 rounded-lg border-2 font-mono text-sm font-bold transition
                  focus-visible:ring-2 focus-visible:ring-blue-500
                  ${activeIndex === i ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-400'}`}
                style={{ touchAction: 'manipulation' }}
              >
                {formatDec(v)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
