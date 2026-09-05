import React from 'react';
import { tilesOf, formatTerms } from './litteralUtils';

/**
 * TileBar — le miroir en tuiles d'une expression (composant PUREMENT
 * VISUEL, aucun nœud interactif).
 *
 * Adapte l'idée de plafonnement de `6e/nombres_calculs/nombres-entiers/
 * components/Base10Blocks.jsx` : au-delà de `cap` tuiles d'une même sorte,
 * on n'en dessine que quelques-unes et un badge « ×N » porte le total.
 *
 * Ce que la barre rend visible : une tuile x² est un carré, une tuile x un
 * bâton, une tuile 1 un petit carré — trois FORMES différentes. Empiler ne
 * marche qu'entre tuiles de même forme, ce qui est exactement « termes
 * semblables ». Un coefficient négatif reçoit une trame hachurée, jamais une
 * aire négative.
 *
 * @param {Term[]} terms
 * @param {number} [cap=12]  tuiles dessinées par sorte avant le badge ×N
 */
const X2 = 34;
const XW = 12;
const XH = 34;
const U = 12;
const GAP = 4;

const SHAPE = {
  x2: { w: X2, h: X2, fill: '#c7d2fe', stroke: '#4f46e5', label: 'x²' },
  x: { w: XW, h: XH, fill: '#a7f3d0', stroke: '#059669', label: 'x' },
  unit: { w: U, h: U, fill: '#fde68a', stroke: '#d97706', label: '1' },
};

export default function TileBar({ terms, cap = 12, caption }) {
  const groups = tilesOf(terms);

  return (
    <div
      className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-3 space-y-2"
      role="img"
      aria-label={`Tuiles de l'expression ${formatTerms(terms)}`}
    >
      <div className="text-[11px] font-mono uppercase tracking-wide text-slate-500">
        Les mêmes quantités, en tuiles
      </div>

      {groups.length === 0 ? (
        <p className="text-xs text-slate-400 italic py-2">Aucune tuile — l’expression vaut 0.</p>
      ) : (
        <div className="flex items-end gap-4 flex-wrap">
          {groups.map((g, gi) => {
            const s = SHAPE[g.kind];
            const drawn = Math.min(g.count, cap);
            const svgW = drawn * (s.w + GAP) - GAP;
            return (
              <div key={`${g.kind}-${gi}`} className="flex flex-col items-center gap-1">
                <svg
                  viewBox={`0 0 ${Math.max(1, svgW)} ${X2}`}
                  width={Math.max(1, svgW)}
                  height={X2}
                  className="overflow-visible"
                  aria-hidden="true"
                >
                  <defs>
                    <pattern
                      id={`tb-hatch-${gi}`} width="6" height="6"
                      patternUnits="userSpaceOnUse" patternTransform="rotate(45)"
                    >
                      <rect width="6" height="6" fill="#fecaca" />
                      <line x1="0" y1="0" x2="0" y2="6" stroke="#b91c1c" strokeWidth="2" />
                    </pattern>
                  </defs>
                  {Array.from({ length: drawn }).map((_, i) => (
                    <rect
                      key={i}
                      x={i * (s.w + GAP)}
                      y={X2 - s.h}
                      width={s.w}
                      height={s.h}
                      rx="2"
                      fill={g.neg ? `url(#tb-hatch-${gi})` : s.fill}
                      stroke={g.neg ? '#b91c1c' : s.stroke}
                      strokeWidth="1.5"
                    />
                  ))}
                </svg>
                <span className="text-[11px] font-mono font-bold text-slate-600 tabular-nums">
                  {g.neg ? '−' : ''}
                  {g.count > cap ? `×${g.count}` : g.count} {s.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-slate-500">
        {caption ?? 'Trois formes différentes : seules les tuiles de même forme s’empilent.'}
      </p>
      <p className="sr-only">{formatTerms(terms)}</p>
    </div>
  );
}
