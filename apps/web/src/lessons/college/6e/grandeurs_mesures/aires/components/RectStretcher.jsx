import React from 'react';

import useDragValue from '../../../../../common/manip6e/useDragValue';

/**
 * RectStretcher — étirer un rectangle par son coin et voir le compte de
 * carreaux suivre le PRODUIT de ses deux dimensions.
 *
 * ACTION       l'élève attrape le coin bas-droit du potager et l'étire.
 * CHANGE       le nombre de colonnes et de lignes suit le doigt ; les
 *              carreaux apparaissent, et l'écriture « L lignes de l » se
 *              recompose à chaque pas.
 * OBSERVATION  ajouter une ligne ajoute `cols` carreaux d'un coup — compter
 *              ligne par ligne, c'est additionner le même nombre : multiplier.
 * SENS         A = L × l n'est pas une formule à retenir, c'est la façon
 *              dont le quadrillage est construit.
 *
 * Le coin porte DEUX degrés de liberté (largeur et hauteur) : ce sont
 * exactement les deux variables de la formule, et rien d'autre n'est
 * réglable. Le geste est donc la formule.
 *
 * Sécurité visuelle (§6bis.4) : le cadre est dimensionné pour le rectangle
 * MAXIMAL, jamais pour l'état courant, et tous les nombres (dimensions,
 * total, écriture additive) vivent dans le DOM sous la figure — aucun
 * <text> SVG, donc aucun chevauchement possible.
 */
const PX = 26;
const PAD = 6;

export default function RectStretcher({
  cols,
  rows,
  onChange,           // ({ cols, rows }) => void
  maxCols,
  maxRows,
  minCols = 1,
  minRows = 1,
  unit = 'm²',
  tone = '#8b5cf6',
}) {
  const VB_W = maxCols * PX + PAD * 2;
  const VB_H = maxRows * PX + PAD * 2;

  // Deux hooks, une poignée : le coin règle la largeur en x et la hauteur
  // en y. On les compose sur le même élément — le geste diagonal pilote donc
  // les deux dimensions à la fois, comme on étire une image.
  const dragX = useDragValue({
    value: cols,
    onChange: (v) => onChange({ cols: v, rows }),
    min: minCols,
    max: maxCols,
    axis: 'x',
    toValue: (r) => minCols + r * (maxCols - minCols),
    ariaLabel: 'Largeur du potager, en carreaux',
    valueText: (v) => `${v} carreaux de large`,
  });
  const dragY = useDragValue({
    value: rows,
    onChange: (v) => onChange({ cols, rows: v }),
    min: minRows,
    max: maxRows,
    axis: 'y',
    toValue: (r) => minRows + (1 - r) * (maxRows - minRows),
    ariaLabel: 'Hauteur du potager, en carreaux',
    valueText: (v) => `${v} carreaux de haut`,
  });

  const bothDown = (e) => { dragX.handleProps.onPointerDown?.(e); dragY.handleProps.onPointerDown?.(e); };
  const bothMove = (e) => { dragX.handleProps.onPointerMove?.(e); dragY.handleProps.onPointerMove?.(e); };
  const bothUp = (e) => { dragX.handleProps.onPointerUp?.(e); dragY.handleProps.onPointerUp?.(e); };

  const total = cols * rows;

  return (
    <div className="space-y-2">
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="w-full max-w-[340px] mx-auto select-none block"
        role="group"
        aria-label="Potager à étirer"
        ref={(el) => { dragX.frameProps.ref.current = el; dragY.frameProps.ref.current = el; }}
        style={{ touchAction: 'none' }}
        onPointerMove={bothMove}
        onPointerUp={bothUp}
        onPointerCancel={bothUp}
      >
        {/* Le quadrillage complet du terrain disponible : l'élève voit
            jusqu'où il peut étirer, donc les extrêmes sont lisibles. */}
        <g style={{ pointerEvents: 'none' }}>
          {Array.from({ length: maxCols + 1 }).map((_, i) => (
            <line key={`v${i}`} x1={PAD + i * PX} y1={PAD} x2={PAD + i * PX} y2={PAD + maxRows * PX} stroke="#f1f5f9" strokeWidth="1" />
          ))}
          {Array.from({ length: maxRows + 1 }).map((_, i) => (
            <line key={`h${i}`} x1={PAD} y1={PAD + i * PX} x2={PAD + maxCols * PX} y2={PAD + i * PX} stroke="#f1f5f9" strokeWidth="1" />
          ))}
        </g>

        {/* Les carreaux du potager, un par un : le compte est visible, pas
            seulement écrit. Chaque ligne a sa propre teinte alternée pour
            que « une ligne de plus » saute aux yeux. */}
        <g style={{ pointerEvents: 'none' }}>
          {Array.from({ length: rows }).map((_, r) =>
            Array.from({ length: cols }).map((_, c) => (
              <rect
                key={`${r}-${c}`}
                x={PAD + c * PX + 1}
                y={PAD + r * PX + 1}
                width={PX - 2}
                height={PX - 2}
                fill={tone}
                opacity={r === rows - 1 ? 1 : 0.62}
              />
            ))
          )}
          <rect x={PAD} y={PAD} width={cols * PX} height={rows * PX} fill="none" stroke="#4c1d95" strokeWidth="2.5" />
        </g>

        {/* Le cadre du geste couvre TOUT le terrain disponible : le pointeur
            y est converti en (colonnes, lignes) par les deux hooks. */}
        <rect
          x={PAD} y={PAD} width={maxCols * PX} height={maxRows * PX}
          fill="transparent"
          style={{ touchAction: 'none', cursor: 'nwse-resize' }}
          onPointerDown={bothDown}
        />

        {/* La poignée : le coin bas-droit du potager. Cible tactile r = 16
            en unités de viewBox (~44 px rendus sur 340 px de large). */}
        <g
          onPointerDown={bothDown}
          role="slider"
          tabIndex={0}
          aria-label="Coin du potager — étire pour changer ses deux dimensions"
          aria-valuemin={minCols * minRows}
          aria-valuemax={maxCols * maxRows}
          aria-valuenow={total}
          aria-valuetext={`${rows} lignes de ${cols} carreaux, ${total} en tout`}
          onKeyDown={(e) => {
            const map = {
              ArrowRight: { dc: 1, dr: 0 }, ArrowLeft: { dc: -1, dr: 0 },
              ArrowDown: { dc: 0, dr: 1 }, ArrowUp: { dc: 0, dr: -1 },
            };
            if (e.key in map) {
              e.preventDefault();
              const { dc, dr } = map[e.key];
              onChange({
                cols: Math.min(maxCols, Math.max(minCols, cols + dc)),
                rows: Math.min(maxRows, Math.max(minRows, rows + dr)),
              });
            }
          }}
          style={{ cursor: 'nwse-resize', touchAction: 'none', outline: 'none' }}
        >
          <circle cx={PAD + cols * PX} cy={PAD + rows * PX} r={16} fill="transparent" />
          <circle cx={PAD + cols * PX} cy={PAD + rows * PX} r={8} fill="#e11d48" stroke="#ffffff" strokeWidth="2.5" />
        </g>
      </svg>

      {/* Tous les nombres dans le DOM — jamais dans le SVG (§6ter.5). */}
      <div className="text-center space-y-1" role="status" aria-live="polite">
        <p className="font-mono text-sm text-slate-600">
          {rows} ligne{rows > 1 ? 's' : ''} de {cols} carreau{cols > 1 ? 'x' : ''}
        </p>
        <p className="font-mono text-slate-800 break-words">
          {Array.from({ length: rows }, () => cols).join(' + ')} ={' '}
          <strong className="text-xl">{total}</strong> {unit}
          {rows > 1 && <span className="text-violet-600"> = {rows} × {cols}</span>}
        </p>
      </div>
    </div>
  );
}
