import React from 'react';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { layoutScene } from './sceneLayout';
import { addVec, clipLine, RANGE } from './lineUtils';

/**
 * LineScene — la scène commune de la leçon : un repère (CoordPlane, partagé,
 * intact), UNE droite { A, u } dessinée comme corde découpée au cadre, son
 * vecteur directeur en flèche, des points nommés, un fantôme (la droite
 * d'avant, en pointillés) et des étiquettes posées SANS collision par
 * `sceneLayout` — jamais un décalage fixe.
 *
 * Tout ce qui est dessiné est DÉRIVÉ de { A, u } : la corde par `clipLine`,
 * la pointe de la flèche par A + u. Aucune équation, aucune coordonnée n'est
 * écrite dans le SVG : ces lectures vivent dans le DOM, à côté (§17bis).
 *
 * Un seul élément mobile à la fois (`draggableId` : 'A', 'T' = pointe de u,
 * ou l'id d'un point) — la règle CoordPlane : une zone tactile plein cadre,
 * chemin clavier complet.
 */
export const HEX = {
  indigo: '#4f46e5', violet: '#7c3aed', rose: '#e11d48', emerald: '#059669',
  amber: '#d97706', sky: '#0284c7', slate: '#64748b', ink: '#0f172a',
};

export default function LineScene({
  range = RANGE,
  line = null,
  ghost = null,
  showArrow = false,
  arrowLabel = 'u',
  nameA = 'A',
  colorA = HEX.rose,
  points = [],          // [{ id, name?, x, y, color? }]
  segments = [],        // [{ id, from, to, color?, dashed?, width? }] (marches, guides)
  labels = [],          // étiquettes supplémentaires en coordonnées d'élève (voir sceneLayout)
  extraCurves = [],
  draggableId = null,
  onPointChange,
  disabled = false,
  frozen = false,
  ariaLabel,
  caption = false,
  step = 1,
  lineTone = 'indigo',
}) {
  const A = line?.A ?? null;
  const T = line && showArrow ? addVec(line.A, line.u) : null;

  const planePoints = [];
  if (A) planePoints.push({ id: 'A', x: A.x, y: A.y, color: colorA });
  if (T) planePoints.push({ id: 'T', x: T.x, y: T.y, color: HEX.violet });
  for (const p of points) planePoints.push({ id: p.id, x: p.x, y: p.y, color: p.color ?? HEX.sky });

  const chord = line ? clipLine(line, range) : null;
  const ghostChord = ghost ? clipLine(ghost, range) : null;
  const curves = [
    ...(ghostChord ? [{ id: 'ghost', points: ghostChord, tone: 'slate', dashed: true, width: 2 }] : []),
    ...(chord ? [{ id: 'd', points: chord, tone: lineTone, width: 3 }] : []),
    ...extraCurves,
  ];
  const arrows = T ? [{ id: 'u', from: A, to: T, color: HEX.violet, width: 3.5 }] : [];
  const planeSegments = segments.map((s) => ({ id: s.id, from: s.from, to: s.to, color: s.color, dashed: s.dashed, width: s.width }));

  const overlay = (toSvg, geo) => {
    const sceneLabels = [];
    if (A && nameA) sceneLabels.push({ id: 'A', text: nameA, kind: 'point', anchor: A, prefer: 'nw' });
    if (T && arrowLabel) sceneLabels.push({ id: 'u', text: arrowLabel, kind: 'arrow', from: A, to: T });
    for (const p of points) if (p.name) sceneLabels.push({ id: p.id, text: p.name, kind: 'point', anchor: p, prefer: 'ne' });
    for (const l of labels) sceneLabels.push(l);
    const scene = {
      points: planePoints,
      segments: [
        ...(chord ? [{ from: chord[0], to: chord[1], size: 7 }] : []),
        ...arrows.map((a) => ({ from: a.from, to: a.to, size: 8 })),
        ...segments.map((s) => ({ from: s.from, to: s.to, size: 6 })),
        ...extraCurves.filter((c) => c.points?.length === 2).map((c) => ({ from: c.points[0], to: c.points[1], size: 6 })),
      ],
      labels: sceneLabels,
    };
    const placed = layoutScene(scene, range, toSvg, geo);
    const colorOf = (id) => (id === 'A' ? colorA : id === 'u' ? HEX.violet : (points.find((p) => p.id === id)?.color ?? labels.find((l) => l.id === id)?.color ?? HEX.ink));
    return (
      <g>
        {placed.map((l) => (
          <text key={l.id} x={l.x} y={l.y} fontSize={l.size} fontWeight="700" fill={colorOf(l.id)}
            className="font-space" paintOrder="stroke" stroke="#ffffff" strokeWidth="3" strokeLinejoin="round">
            {l.text}
          </text>
        ))}
      </g>
    );
  };

  return (
    <CoordPlane
      range={range}
      step={step}
      points={planePoints}
      curves={curves}
      arrows={arrows}
      segments={planeSegments}
      draggableId={draggableId}
      onPointChange={onPointChange}
      disabled={disabled}
      frozen={frozen}
      overlay={overlay}
      ariaLabel={ariaLabel}
      caption={caption}
    />
  );
}
