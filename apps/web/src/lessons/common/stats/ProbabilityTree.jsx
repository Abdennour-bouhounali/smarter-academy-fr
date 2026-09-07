import React from 'react';
import { formatNumber, formatPercent } from './statsUtils';

/**
 * ProbabilityTree — arbre pondéré à deux niveaux.
 *
 * Les deux règles que l'arbre doit rendre VISIBLES, et que ce composant
 * matérialise plutôt que de les écrire en texte :
 *   · le long d'un chemin, les probabilités se MULTIPLIENT ;
 *   · la somme des branches issues d'un même nœud vaut 1 ;
 *   · pour un événement, on ADDITIONNE les chemins qui le réalisent.
 *
 * Un chemin sélectionné (`selected`) est épaissi et son produit affiché ;
 * `highlightPaths` en met plusieurs en évidence à la fois (probabilité
 * totale). Le composant SIGNALE une branche dont les poids ne somment pas
 * à 1 — un arbre faux ne doit pas passer pour un arbre juste.
 *
 * @param {{id,label,p,children:{id,label,p}[]}[]} branches
 * @param {string[]} [highlightPaths]  ids « parent/enfant »
 * @param {(pathId)=>void} [onPathClick]
 */
export default function ProbabilityTree({
  branches,
  highlightPaths = [],
  onPathClick = null,
  showProducts = true,
  asPercent = false,
  width = 620,
  levelLabels = null,   // [string, string]
}) {
  const leafCount = branches.reduce((a, b) => a + b.children.length, 0);
  const rowH = 46;

  // Même formatage que `fmt` plus bas, défini ici parce que le calcul de la
  // marge droite en dépend.
  const fmtWidth = (p) => (asPercent ? formatPercent(p, 1) : formatNumber(p, 3));

  // La marge droite doit contenir le libellé de la feuille ET la ligne du
  // produit (« 80 % × 99 % = 79,2 % »), dont la largeur dépend du format :
  // en pourcentage les nombres sont bien plus longs qu'en décimal. Une marge
  // fixe suffisait aux arbres décimaux et faisait déborder les autres, d'où
  // cette estimation à partir du texte réellement rendu. Les deux lignes
  // n'ont PAS la même fonte (libellé 12 px, produit 10 px) : les mesurer
  // avec un facteur unique sous-estimait le libellé, d'où un débordement
  // résiduel sur les noms longs (« Sans pluieÀ l'heure »).
  const widest = branches.reduce((max, b) => Math.max(max, ...b.children.map((c) => {
    const label = `${b.label}${c.label}`.length * 6.2;      // 12 px
    const product = showProducts
      ? `${fmtWidth(b.p)} × ${fmtWidth(c.p)} = ${fmtWidth(b.p * c.p)}`.length * 5.1   // 10 px
      : 0;
    return Math.max(label, product);
  })), 0);
  const rightPad = Math.max(96, 16 + Math.ceil(widest));

  const pad = { left: 16, right: rightPad, top: levelLabels ? 30 : 14, bottom: 14 };
  const height = pad.top + pad.bottom + leafCount * rowH;
  const xRoot = pad.left + 10;
  const xMid = pad.left + (width - pad.left - pad.right) * 0.42;
  const xLeaf = width - pad.right;

  const fmt = fmtWidth;

  let leafIndex = 0;
  const laidOut = branches.map((b) => {
    const ys = b.children.map(() => {
      const y = pad.top + leafIndex * rowH + rowH / 2;
      leafIndex += 1;
      return y;
    });
    const yMid = ys.reduce((a, c) => a + c, 0) / ys.length;
    const sumChildren = b.children.reduce((a, c) => a + c.p, 0);
    return { ...b, ys, yMid, sumChildren };
  });
  const yRoot = height / 2;
  const sumTop = branches.reduce((a, b) => a + b.p, 0);
  const bad = (s) => Math.abs(s - 1) > 1e-6;

  const pathId = (b, c) => `${b.id}/${c.id}`;
  const isLit = (id) => highlightPaths.includes(id);

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img"
      aria-label="Arbre de probabilités à deux niveaux" className="select-none overflow-visible">
      {levelLabels && (
        <>
          <text x={xMid} y={16} textAnchor="middle" fontSize="11" fontWeight="700" fill="#94a3b8">{levelLabels[0]}</text>
          <text x={xLeaf} y={16} textAnchor="middle" fontSize="11" fontWeight="700" fill="#94a3b8">{levelLabels[1]}</text>
        </>
      )}
      <circle cx={xRoot} cy={yRoot} r="5" fill="#475569" />
      {laidOut.map((b) => (
        <g key={b.id}>
          <line x1={xRoot} y1={yRoot} x2={xMid} y2={b.yMid}
            stroke={b.children.some((c) => isLit(pathId(b, c))) ? '#c026d3' : '#94a3b8'}
            strokeWidth={b.children.some((c) => isLit(pathId(b, c))) ? 3 : 1.6} />
          <text x={(xRoot + xMid) / 2} y={(yRoot + b.yMid) / 2 - 6} textAnchor="middle"
            fontSize="11" fontWeight="700" fill="#7c3aed">{fmt(b.p)}</text>
          <circle cx={xMid} cy={b.yMid} r="4" fill="#475569" />
          <text x={xMid + 9} y={b.yMid + 4} fontSize="12" fontWeight="700" fill="#334155">{b.label}</text>
          {bad(b.sumChildren) && (
            <text x={xMid + 9} y={b.yMid + 18} fontSize="10" fill="#e11d48">
              somme des branches = {fmt(b.sumChildren)} ≠ 1
            </text>
          )}
          {b.children.map((c, i) => {
            const id = pathId(b, c);
            const lit = isLit(id);
            const y = b.ys[i];
            const product = b.p * c.p;
            return (
              <g key={c.id} onClick={onPathClick ? () => onPathClick(id) : undefined}
                style={onPathClick ? { cursor: 'pointer' } : undefined}>
                <line x1={xMid} y1={b.yMid} x2={xLeaf} y2={y}
                  stroke={lit ? '#c026d3' : '#94a3b8'} strokeWidth={lit ? 3 : 1.6} />
                <text x={(xMid + xLeaf) / 2} y={(b.yMid + y) / 2 - 5} textAnchor="middle"
                  fontSize="11" fontWeight="700" fill="#0284c7">{fmt(c.p)}</text>
                <text x={xLeaf + 8} y={y + 4} fontSize="12" fontWeight={lit ? '800' : '600'}
                  fill={lit ? '#a21caf' : '#334155'}>
                  {b.label}{c.label}
                </text>
                {showProducts && (
                  <text x={xLeaf + 8} y={y + 18} fontSize="10" fontWeight={lit ? '700' : '400'}
                    fill={lit ? '#a21caf' : '#94a3b8'}>
                    {fmt(b.p)} × {fmt(c.p)} = {fmt(product)}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      ))}
      {bad(sumTop) && (
        <text x={xRoot} y={yRoot - 14} fontSize="10" fill="#e11d48">
          somme du 1er niveau = {fmt(sumTop)} ≠ 1
        </text>
      )}
    </svg>
  );
}
