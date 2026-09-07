import React, { useRef, useState, useCallback } from 'react';

/**
 * SplitRectangle — un rectangle de a × b qu'on COUPE d'un trait vertical.
 *
 * La distributivité (7 × 23 = 7 × 20 + 7 × 3) est une vérité d'AIRE : si on
 * coupe le rectangle en deux, les deux morceaux mis bout à bout redonnent le
 * tout. L'ancienne version l'expliquait en trois panneaux que l'élève faisait
 * défiler ; il lisait un raisonnement au lieu de le produire.
 *
 * Ici, l'élève attrape le trait de coupe et le déplace. À chaque position :
 *   - les deux morceaux se colorent différemment ;
 *   - leurs deux produits s'affichent et leur somme reste égale au total.
 * La découverte n'est PAS « voilà la formule » mais « où que je coupe, la
 * somme des deux morceaux ne change pas » — et c'est en s'arrêtant sur une
 * coupe ronde (20 | 3) qu'on voit pourquoi celle-là est commode.
 *
 * Accessibilité : le trait est un `role="slider"` piloté aux flèches ; les
 * nombres vivent dans le DOM et sont annoncés (`role="status"`).
 */
export default function SplitRectangle({
  rows = 7,
  cols = 23,
  cut,
  onCut,
  cell = 13,
  gap = 2,
  locked = false,
}) {
  const frameRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const clamp = (v) => Math.max(1, Math.min(cols - 1, v));

  const fromEvent = useCallback((e) => {
    const el = frameRef.current;
    if (!el) return cut;
    const r = el.getBoundingClientRect();
    if (!r.width) return cut;
    return clamp(Math.round((e.clientX - r.left) / (cell + gap)));
  }, [cell, gap, cols, cut]);

  const begin = (e) => {
    if (locked) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDragging(true);
    onCut(fromEvent(e));
  };
  const move = (e) => { if (dragging && !locked) onCut(fromEvent(e)); };
  const end = (e) => {
    if (locked) return;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    setDragging(false);
  };
  const onKeyDown = (e) => {
    if (locked) return;
    const map = { ArrowRight: cut + 1, ArrowLeft: cut - 1, PageUp: cut + 5, PageDown: cut - 5, Home: 1, End: cols - 1 };
    if (e.key in map) { e.preventDefault(); onCut(clamp(map[e.key])); }
  };

  const left = cut, right = cols - cut;
  const W = cols * cell + (cols - 1) * gap;
  const H = rows * cell + (rows - 1) * gap;
  const xCut = cut * (cell + gap) - gap / 2;

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto pb-1">
        <div
          ref={frameRef}
          className="relative rounded-xl border-2 border-slate-200 bg-slate-50/70 p-3"
          style={{ width: W + 24, height: H + 24, touchAction: 'none' }}
        >
          {Array.from({ length: rows }, (_, r) => (
            <div key={r} className="absolute flex" style={{ top: 12 + r * (cell + gap), left: 12, gap }}>
              {Array.from({ length: cols }, (_, c) => (
                <span
                  key={c}
                  className="rounded-[3px] transition-colors duration-150"
                  style={{
                    width: cell, height: cell,
                    background: c < cut ? '#8b5cf6' : '#6366f1',
                    opacity: 0.85,
                  }}
                />
              ))}
            </div>
          ))}

          {/* Le trait de coupe : c'est LUI qu'on saisit. */}
          <button
            type="button"
            role="slider"
            aria-label="Trait de coupe du rectangle"
            aria-valuemin={1}
            aria-valuemax={cols - 1}
            aria-valuenow={cut}
            aria-valuetext={`coupe après ${cut} colonnes : ${rows} × ${left} plus ${rows} × ${right}`}
            tabIndex={0}
            onPointerDown={begin}
            onPointerMove={move}
            onPointerUp={end}
            onPointerCancel={end}
            onKeyDown={onKeyDown}
            className="absolute focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400 rounded"
            style={{
              left: 12 + xCut - 11, top: 4,
              width: 22, height: H + 16,
              background: 'transparent',
              cursor: dragging ? 'grabbing' : 'ew-resize',
              touchAction: 'none',
            }}
          >
            <span
              aria-hidden="true"
              className="block mx-auto rounded-full"
              style={{ width: 4, height: H + 16, background: '#f59e0b', boxShadow: '0 0 0 2px #fff' }}
            />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2" role="status" aria-live="polite">
        <div className="rounded-xl border-2 border-violet-200 bg-violet-50 p-2.5 text-center">
          <div className="text-[11px] font-mono text-violet-500">{rows} × {left}</div>
          <div className="text-xl font-mono font-black text-violet-700">{rows * left}</div>
        </div>
        <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-2.5 text-center">
          <div className="text-[11px] font-mono text-indigo-500">{rows} × {right}</div>
          <div className="text-xl font-mono font-black text-indigo-700">{rows * right}</div>
        </div>
      </div>

      <div className="rounded-xl bg-slate-800 text-white p-3 text-center font-mono">
        <span className="text-violet-300">{rows * left}</span>
        <span className="text-slate-400 mx-2">+</span>
        <span className="text-indigo-300">{rows * right}</span>
        <span className="text-slate-400 mx-2">=</span>
        <span className="text-amber-300 font-black text-lg">{rows * cols}</span>
        <span className="text-slate-500 ml-2 text-xs">soit {rows} × {cols}</span>
      </div>
      <p className="text-xs text-slate-500 text-center">
        Glisse le <strong className="text-amber-600">trait orange</strong> : coupe le rectangle où tu veux.
      </p>
    </div>
  );
}
