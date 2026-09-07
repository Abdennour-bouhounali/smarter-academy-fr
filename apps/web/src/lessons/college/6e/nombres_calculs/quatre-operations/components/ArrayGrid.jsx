import React, { useRef, useState, useCallback } from 'react';

/**
 * ArrayGrid — un rectangle de jetons qu'on redimensionne en TIRANT SON COIN.
 *
 * Le modèle rectangulaire est la représentation la plus riche de la
 * multiplication : le produit est une AIRE, et les deux facteurs sont les
 * deux côtés. Encore faut-il que l'élève les fasse varier lui-même.
 *
 * L'ancienne version pilotait la grille par quatre boutons `+` / `−` posés
 * SOUS elle : on cliquait en bas pour faire changer quelque chose en haut, et
 * la grille sautait d'un état à l'autre. Ici la poignée est le coin
 * inférieur droit du rectangle : le geste EST le redimensionnement, et
 * lignes et colonnes changent ensemble, en continu (règle projet du
 * 2026-09-06 : on saisit l'objet, jamais un stepper).
 *
 * Ce que le geste rend observable, et que le module ne dit pas d'avance :
 *   - tirer en largeur ou en hauteur fait grandir le total de la même façon
 *     → la multiplication est commutative, on le VOIT en pivotant ;
 *   - un rectangle 3×4 et un rectangle 4×3 contiennent le même nombre de
 *     jetons alors qu'ils n'ont pas la même allure.
 *
 * Accessibilité : le coin est un `role="slider"` bidimensionnel ; les flèches
 * horizontales changent les colonnes, les verticales les lignes, Début/Fin
 * vont aux extrêmes. Le total vit dans le DOM, annoncé par `role="status"`.
 */
export default function ArrayGrid({
  rows,
  cols,
  onResize,
  maxRows = 8,
  maxCols = 10,
  cell = 26,
  gap = 3,
  color = '#8b5cf6',
  locked = false,
  showProduct = true,
}) {
  const frameRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const clampR = (v) => Math.max(1, Math.min(maxRows, v));
  const clampC = (v) => Math.max(1, Math.min(maxCols, v));

  /* Le coin suit le pointeur : sa position dans le cadre donne directement
     le nombre de colonnes (x) et de lignes (y). */
  const fromEvent = useCallback((e) => {
    const el = frameRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return null;
    const c = clampC(Math.round((e.clientX - r.left) / (cell + gap) + 0.5));
    const ro = clampR(Math.round((e.clientY - r.top) / (cell + gap) + 0.5));
    return { rows: ro, cols: c };
  }, [cell, gap, maxRows, maxCols]);

  const begin = (e) => {
    if (locked) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDragging(true);
    const v = fromEvent(e); if (v) onResize(v);
  };
  const move = (e) => {
    if (!dragging || locked) return;
    const v = fromEvent(e); if (v) onResize(v);
  };
  const end = (e) => {
    if (locked) return;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    setDragging(false);
  };

  const onKeyDown = (e) => {
    if (locked) return;
    const map = {
      ArrowRight: { rows, cols: clampC(cols + 1) },
      ArrowLeft: { rows, cols: clampC(cols - 1) },
      ArrowDown: { rows: clampR(rows + 1), cols },
      ArrowUp: { rows: clampR(rows - 1), cols },
      Home: { rows: 1, cols: 1 },
      End: { rows: maxRows, cols: maxCols },
    };
    if (e.key in map) { e.preventDefault(); onResize(map[e.key]); }
  };

  const w = cols * cell + (cols - 1) * gap;
  const h = rows * cell + (rows - 1) * gap;

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        {/* Le cadre porte la course du geste : il est dimensionné au MAXIMUM
            atteignable, sinon on ne pourrait jamais agrandir le rectangle
            au-delà de sa taille courante. */}
        <div
          ref={frameRef}
          className="relative rounded-2xl border-2 border-slate-200 bg-slate-50/70 p-3"
          style={{
            width: maxCols * cell + (maxCols - 1) * gap + 24,
            height: maxRows * cell + (maxRows - 1) * gap + 24,
            touchAction: 'none',
          }}
        >
          {/* La place libre n'est pas du vide : c'est la course encore
              disponible pour le geste. On la matérialise discrètement, sinon
              l'élève ne sait pas jusqu'où il peut tirer. */}
          <span
            aria-hidden="true"
            className="absolute inset-3 rounded-lg pointer-events-none"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, rgba(148,163,184,.10) 0 6px, transparent 6px 12px)',
            }}
          />
          {Array.from({ length: rows }, (_, r) => (
            <div key={r} className="flex absolute" style={{ top: 12 + r * (cell + gap), left: 12, gap }}>
              {Array.from({ length: cols }, (_, c) => (
                <span
                  key={c}
                  className="rounded-md transition-all duration-150"
                  style={{ width: cell, height: cell, background: color, opacity: 0.85 }}
                />
              ))}
            </div>
          ))}

          {/* La poignée : le coin du rectangle. */}
          <button
            type="button"
            aria-label="Coin du rectangle — flèches ← → pour les colonnes, ↑ ↓ pour les lignes"
            role="slider"
            aria-valuemin={1}
            aria-valuemax={maxRows * maxCols}
            aria-valuenow={rows * cols}
            aria-valuetext={`${rows} lignes sur ${cols} colonnes, ${rows * cols} jetons`}
            tabIndex={0}
            onPointerDown={begin}
            onPointerMove={move}
            onPointerUp={end}
            onPointerCancel={end}
            onKeyDown={onKeyDown}
            className="absolute rounded-full border-[3px] border-white shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-400"
            style={{
              width: 30, height: 30,
              left: 12 + w - 15, top: 12 + h - 15,
              background: color,
              cursor: dragging ? 'grabbing' : 'grab',
              touchAction: 'none',
            }}
          />
        </div>
      </div>

      {showProduct && (
        <div
          className="text-center font-mono font-black text-2xl bg-violet-50 border-2 border-violet-200 rounded-xl py-3"
          role="status"
          aria-live="polite"
        >
          <span className="text-slate-700">{rows}</span>
          <span className="text-violet-500 mx-2">×</span>
          <span className="text-slate-700">{cols}</span>
          <span className="text-violet-400 mx-2">=</span>
          <span className="text-violet-700">{rows * cols}</span>
        </div>
      )}
      <p className="text-xs text-slate-500 text-center">
        Tire le <strong>coin violet</strong> pour changer la forme du rectangle.
      </p>
    </div>
  );
}
