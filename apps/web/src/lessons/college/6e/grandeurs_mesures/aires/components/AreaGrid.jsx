import React from 'react';

/**
 * AreaGrid — quadrillage de carreaux-unités à colorier au tap.
 *
 * Contrat repris d'UnitGrid (nombres-decimaux) étendu à une géométrie
 * rows × cols quelconque : `cells` = indices coloriés (état du module),
 * `onToggle(i)` au tap. `outline` restreint la figure à un sous-ensemble
 * de cellules (les autres sont estompées et non tappables). `halfCells`
 * dessine des demi-carreaux (triangles).
 *
 * Plafond de densité : rows × cols interactif ≤ ~52 (les grands
 * quadrillages de démonstration se dessinent en SVG statique, jamais en
 * cellules interactives).
 */
const TONES = {
  emerald: { fill: 'bg-emerald-500', ring: 'focus-visible:ring-emerald-400', border: 'border-emerald-600' },
  violet: { fill: 'bg-violet-500', ring: 'focus-visible:ring-violet-400', border: 'border-violet-600' },
  sky: { fill: 'bg-sky-500', ring: 'focus-visible:ring-sky-400', border: 'border-sky-600' },
};

export default function AreaGrid({
  rows,
  cols,
  cells = [],
  onToggle,
  outline = null, // array d'indices : la figure ; hors-figure = estompé, non tappable
  halfCells = null, // [{ index, corner: 'tl'|'tr'|'bl'|'br' }]
  unit = 'cm²',
  cellSize = 34,
  showRowColHints = false,
  tone = 'emerald',
  disabled = false,
  ariaLabel = 'Quadrillage de carreaux-unités',
}) {
  const t = TONES[tone] ?? TONES.emerald;
  const inFigure = (i) => !outline || outline.includes(i);
  const halfOf = (i) => halfCells?.find((h) => h.index === i) ?? null;
  const interactive = typeof onToggle === 'function' && !disabled;

  const cornerClip = { tl: 'polygon(0 0, 100% 0, 0 100%)', tr: 'polygon(0 0, 100% 0, 100% 100%)', bl: 'polygon(0 0, 0 100%, 100% 100%)', br: 'polygon(100% 0, 100% 100%, 0 100%)' };

  return (
    <div className="w-full overflow-x-auto">
      <div className="inline-block mx-auto" role="group" aria-label={ariaLabel} style={{ minWidth: 0 }}>
        {showRowColHints && (
          <div className="flex" style={{ marginLeft: 26 }} aria-hidden="true">
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="text-center text-[10px] font-mono text-slate-400" style={{ width: cellSize }}>
                {c + 1}
              </div>
            ))}
          </div>
        )}
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="flex items-center">
            {showRowColHints && (
              <div className="text-[10px] font-mono text-slate-400 text-right pr-1" style={{ width: 26 }} aria-hidden="true">
                {rIdx + 1}
              </div>
            )}
            {Array.from({ length: cols }).map((_, cIdx) => {
              const i = rIdx * cols + cIdx;
              const figure = inFigure(i);
              const painted = cells.includes(i);
              const half = halfOf(i);
              return (
                <button
                  key={cIdx}
                  type="button"
                  disabled={!interactive || !figure}
                  onClick={() => interactive && figure && onToggle(i)}
                  aria-label={`Carreau ligne ${rIdx + 1}, colonne ${cIdx + 1}${painted ? ', colorié' : ''}${figure ? '' : ', hors figure'}`}
                  aria-pressed={painted}
                  className={`relative border transition-colors focus:outline-none focus-visible:ring-2 ${t.ring} ${
                    figure
                      ? painted && !half
                        ? `${t.fill} ${t.border}`
                        : 'bg-white border-slate-300 hover:bg-slate-50'
                      : 'bg-slate-100 border-slate-200 opacity-40 cursor-default'
                  }`}
                  style={{ width: cellSize, height: cellSize, cursor: interactive && figure ? 'pointer' : 'default' }}
                >
                  {half && figure && (
                    <span
                      aria-hidden="true"
                      className={`absolute inset-0 ${painted ? t.fill : 'bg-slate-200'}`}
                      style={{ clipPath: cornerClip[half.corner] }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        ))}
        <p className="text-center text-[11px] font-mono text-slate-400 mt-1.5" aria-hidden="true">
          1 carreau = 1 {unit}
        </p>
      </div>
    </div>
  );
}
