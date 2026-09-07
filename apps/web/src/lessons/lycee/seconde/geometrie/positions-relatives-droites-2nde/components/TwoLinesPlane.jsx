import React from 'react';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { layoutScene, pointOfFrac } from './labelLayout';
import { intersection, intersectionInFrame, frameFor, relativePosition, clipLine } from './droitesUtils';

/**
 * TwoLinesPlane — la scène commune de la leçon : un repère (CoordPlane,
 * partagé, intact), DEUX droites dessinées comme cordes découpées au cadre,
 * leurs flèches directrices, des poignées (A, pointe de u, B, pointe de v),
 * le point d'intersection I quand il existe ET tient dans le cadre, et des
 * étiquettes posées SANS collision par `labelLayout.layoutScene` — jamais
 * un décalage fixe (INTERACTION_PEDAGOGY §17bis).
 *
 * Tout ce qui est dessiné est DÉRIVÉ des deux droites canoniques `{a, b, c}`
 * (droitesUtils) : la corde par `clipLine`, I par `intersection` (rationnel
 * exact), la position relative par `relativePosition`. Aucun nombre n'est
 * écrit dans le SVG : équations, coordonnées et déterminant vivent dans le
 * DOM, à côté, où ils ne peuvent rien chevaucher.
 *
 * Une seule poignée mobile à la fois (`activeId`) — la règle CoordPlane : une
 * zone tactile plein cadre, chemin clavier complet (flèches, Home/End,
 * PageUp/PageDown sur le role="slider").
 *
 * @param {{ id, name, line, tone?, anchor?, vector? }[]} lines   deux droites (coordonnées d'élève)
 * @param {{ id, x, y, color? }[]} handles                        disques déplaçables
 * @param {string|null} activeId                                  la poignée pilotée
 * @param {(id:string, p:{x,y}) => void} onHandleChange
 * @param {number} halfSpan                                       cadre ±halfSpan (6, 15 ou 40)
 */
export const TONES = { indigo: '#4f46e5', rose: '#e11d48', amber: '#d97706', violet: '#7c3aed', pink: '#f43f5e', slate: '#64748b' };

export default function TwoLinesPlane({
  lines,
  handles = [],
  activeId = null,
  onHandleChange,
  halfSpan = 6,
  showIntersection = true,
  disabled = false,
  frozen = false,
  ariaLabel,
  caption = false,
}) {
  const { range, step, unit } = frameFor(halfSpan);
  const [L1, L2] = lines.map((l) => l.line);
  const pos = L1 && L2 ? relativePosition(L1, L2) : null;
  const I = L1 && L2 ? intersection(L1, L2) : null;
  const iInFrame = showIntersection && intersectionInFrame(I, range);
  const iPoint = iInFrame ? pointOfFrac(I) : null;

  // Ce que CoordPlane dessine : points (poignées + I), flèches, cordes.
  const planePoints = [
    ...handles.map((h) => ({ id: h.id, x: h.x, y: h.y, color: h.color ?? TONES.indigo })),
    ...(iPoint ? [{ id: 'I', x: iPoint.x, y: iPoint.y, color: TONES.amber }] : []),
  ];
  const arrows = lines
    .filter((l) => l.anchor && l.vector)
    .map((l) => ({ id: `arr-${l.id}`, from: l.anchor, to: { x: l.anchor.x + l.vector.x, y: l.anchor.y + l.vector.y }, color: TONES[l.tone] ?? TONES.indigo, width: 3 }));
  // Les cordes passent par `curves` (peintes AVANT les points) ; l'overlay ne
  // porte que les étiquettes. Droites confondues : la seconde est dessinée
  // large et translucide par-dessus la première, pour que « une seule
  // droite » se voie sans cacher (d₁).
  const curves = lines.map((l, i) => {
    const seg = clipLine(l.line, range);
    if (!seg || Math.hypot(seg[1].x - seg[0].x, seg[1].y - seg[0].y) < 1e-9) return null;
    const twin = pos === 'confondues' && i === 1;
    const hex = TONES[l.tone] ?? TONES.indigo;
    return { id: `chord-${l.id}`, points: seg, tone: twin ? `${hex}55` : hex, width: twin ? 9 : 3 };
  }).filter(Boolean);

  const overlay = (toSvg, geo) => {
    const showO = !planePoints.some((p) => p.x >= -1.6 && p.x <= 0.6 && p.y >= -1.6 && p.y <= 0.6);
    const scene = layoutScene({
      geo, range, step,
      lines: lines.map((l) => ({ id: l.id, name: l.name, line: l.line, tone: l.tone, anchor: l.anchor, vector: l.vector })),
      handles,
      points: [
        ...handles.filter((h) => h.name).map((h) => ({ id: h.id, name: h.name, x: h.x, y: h.y })),
        ...(iPoint ? [{ id: 'I', name: 'I', x: iPoint.x, y: iPoint.y }] : []),
      ],
      showO,
    });
    const colorOf = (id) => (id === 'I' ? TONES.amber : (handles.find((h) => h.id === id)?.color ?? TONES.indigo));
    return (
      <g>
        {scene.lineLabels.map((l) => (l.box ? (
          <text key={l.id} x={l.box.x} y={l.box.y + l.box.height * 0.82} fontSize={12} fontWeight="700"
            fill={TONES[l.tone] ?? TONES.indigo} className="font-space" paintOrder="stroke" stroke="#ffffff" strokeWidth="3" strokeLinejoin="round">
            {l.name}
          </text>
        ) : null))}
        {scene.pointLabels.map((l) => (l.box ? (
          <text key={l.id} x={l.box.x} y={l.box.y + l.box.height * 0.82} fontSize={14} fontWeight="700"
            fill={colorOf(l.id)} className="font-space" paintOrder="stroke" stroke="#ffffff" strokeWidth="3" strokeLinejoin="round">
            {l.name}
          </text>
        ) : null))}
      </g>
    );
  };

  const active = handles.find((h) => h.id === activeId);
  const label = ariaLabel ?? (active
    ? `Repère — déplace ${active.name ?? active.id} ; les deux droites suivent`
    : 'Repère — deux droites');

  return (
    <CoordPlane
      range={range}
      unit={unit}
      xStep={step}
      yStep={step}
      points={planePoints}
      arrows={arrows}
      curves={curves}
      draggableId={disabled || frozen ? null : activeId}
      onPointChange={activeId && onHandleChange ? (p) => onHandleChange(activeId, p) : undefined}
      disabled={disabled}
      frozen={frozen}
      overlay={overlay}
      ariaLabel={label}
      caption={caption}
      axisLabels={{ x: 'x', y: 'y' }}
    />
  );
}
