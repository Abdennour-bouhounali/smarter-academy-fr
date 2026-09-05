import React from 'react';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { placeLabels, pointObstacle, segmentObstacles } from './labelLayout';
import { RANGE, isZero, vec, formatVec, describeMove, signed } from './vecteurUtils';

/**
 * VectorScene — le repère de la leçon (CoordPlane) plus TOUT ce qui porte un
 * nom : points, vecteurs, escaliers. Aucune étiquette n'a de position fixe :
 * elles sont toutes placées par `labelLayout.placeLabels` à partir des
 * obstacles réellement dessinés (points, flèches, bandes des graduations),
 * et ramenées dans le cadre en dernier recours. C'est ce qui rend
 * l'invariant « tout état valide a une mise en page valide » tenable pour
 * un vecteur nul (deux points confondus), une diagonale de 12 unités, ou
 * un point posé dans un coin.
 *
 * CoordPlane garde ce qu'il sait faire : la grille, les axes, la zone
 * tactile unique, le chemin clavier et l'aimantation. Il ne reçoit ni
 * `name` sur les points ni `label` sur les flèches — ses décalages fixes ne
 * conviennent pas à une leçon où tout bouge.
 *
 * Coordonnées d'ÉLÈVE partout ; la conversion SVG est faite par `toSvg`
 * dans l'overlay, et nulle part ailleurs.
 *
 * @param points  [{ id, name?, x, y, color?, icon?, prefer?, hollow? }]
 * @param arrows  [{ id, from, to, color?, name?, dashed?, ghost?, width?, escalier?: boolean | { color } }]
 */
const COLORS = {
  main: '#7c3aed', second: '#059669', sum: '#d97706', ghost: '#94a3b8', point: '#0f172a',
  dx: '#0369a1', dy: '#047857',
};
export const SCENE_COLORS = COLORS;

/** Le robot du dépôt, en formes SVG (corps, yeux, antenne). */
function RobotGlyph({ x, y, active }) {
  const body = active ? '#4f46e5' : '#94a3b8';
  return (
    <g style={{ pointerEvents: 'none' }} aria-hidden="true">
      <line x1={x} y1={y - 8} x2={x} y2={y - 12} stroke={body} strokeWidth="2" />
      <circle cx={x} cy={y - 13} r="2" fill="#f59e0b" />
      <rect x={x - 8} y={y - 8} width="16" height="14" rx="4" fill={body} stroke="#ffffff" strokeWidth="1.5" />
      <circle cx={x - 3.5} cy={y - 2} r="2.2" fill="#ffffff" />
      <circle cx={x + 3.5} cy={y - 2} r="2.2" fill="#ffffff" />
      <rect x={x - 4} y={y + 2} width="8" height="1.6" rx="0.8" fill="#ffffff" />
    </g>
  );
}

export default function VectorScene({
  points = [],
  arrows = [],
  draggableId = null,
  onPointChange,
  step = 1,
  target = null,
  disabled = false,
  frozen = false,
  ariaLabel,
  range = RANGE,
}) {
  const planePoints = points.map((p) => ({
    id: p.id, x: p.x, y: p.y,
    color: p.icon ? (p.color ?? '#c7d2fe') : (p.hollow ? '#ffffff' : (p.color ?? COLORS.point)),
  }));

  // Une flèche de longueur nulle n'est pas dessinée par CoordPlane (son
  // marqueur n'aurait pas d'orientation) : l'overlay la représente par un
  // anneau — le vecteur nul est un objet, pas une absence.
  const planeArrows = arrows
    .filter((a) => !isZero(vec(a.from, a.to)))
    .map((a) => ({
      id: a.id, from: a.from, to: a.to,
      color: a.ghost ? undefined : (a.color ?? COLORS.main),
      dashed: a.dashed, ghost: a.ghost, width: a.width,
    }));

  const overlay = (toSvg, geo) => {
    const frame = { x: 0, y: 0, w: geo.width, h: geo.height };
    const O = toSvg(0, 0);
    const xEnd = toSvg(range.xMax, 0);
    const yEnd = toSvg(0, range.yMax);
    const obstacles = [
      { x: 0, y: O.y + 6, w: geo.width, h: 13 },        // graduations des abscisses
      { x: O.x - 28, y: 0, w: 22, h: geo.height },      // graduations des ordonnées
      { x: xEnd.x + 2, y: O.y - 9, w: 26, h: 18 },      // nom de l'axe des x
      { x: O.x - 9, y: yEnd.y - 26, w: 18, h: 18 },     // nom de l'axe des y
    ];
    const labels = [];
    const decor = [];

    for (const p of points) {
      const s = toSvg(p.x, p.y);
      obstacles.push(pointObstacle(s, p.icon ? 14 : 9));
      if (p.icon) {
        // Le robot est dessiné en formes, jamais en texte : un emoji <text>
        // posé sur l'axe des abscisses chevauchait la graduation « −1 ».
        decor.push(<RobotGlyph key={`icon-${p.id}`} x={s.x} y={s.y} active={p.color === '#c7d2fe'} />);
      }
      if (p.hollow) {
        decor.push(
          <circle key={`hollow-${p.id}`} cx={s.x} cy={s.y} r="5" fill="none"
            stroke={p.color ?? COLORS.point} strokeWidth="2" strokeDasharray="3 2"
            style={{ pointerEvents: 'none' }} />
        );
      }
    }

    for (const a of arrows) {
      const from = toSvg(a.from.x, a.from.y);
      const to = toSvg(a.to.x, a.to.y);
      const zero = isZero(vec(a.from, a.to));
      const color = a.ghost ? COLORS.ghost : (a.color ?? COLORS.main);
      if (zero) {
        decor.push(
          <circle key={`ring-${a.id}`} cx={from.x} cy={from.y} r="7" fill="none"
            stroke={color} strokeWidth="2.5" style={{ pointerEvents: 'none' }} />
        );
        obstacles.push(pointObstacle(from, 10));
      } else {
        obstacles.push(...segmentObstacles(from, to));
      }
      if (a.escalier && !zero) {
        const v = vec(a.from, a.to);
        const corner = toSvg(a.to.x, a.from.y);
        const col = typeof a.escalier === 'object' ? a.escalier : {};
        const cx = col.dx ?? COLORS.dx;
        const cy = col.dy ?? COLORS.dy;
        if (Math.abs(v.x) > 1e-9) {
          decor.push(
            <line key={`edx-${a.id}`} x1={from.x} y1={from.y} x2={corner.x} y2={corner.y}
              stroke={cx} strokeWidth="2.5" strokeDasharray="5 4" style={{ pointerEvents: 'none' }} />
          );
          obstacles.push(...segmentObstacles(from, corner, 6));
          labels.push({ id: `dx-${a.id}`, text: signed(v.x), size: 12, kind: 'arrow', from, to: corner, color: cx, priority: 2, avoid: { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 } });
        }
        if (Math.abs(v.y) > 1e-9) {
          decor.push(
            <line key={`edy-${a.id}`} x1={corner.x} y1={corner.y} x2={to.x} y2={to.y}
              stroke={cy} strokeWidth="2.5" strokeDasharray="5 4" style={{ pointerEvents: 'none' }} />
          );
          obstacles.push(...segmentObstacles(corner, to, 6));
          labels.push({ id: `dy-${a.id}`, text: signed(v.y), size: 12, kind: 'arrow', from: corner, to, color: cy, priority: 2, avoid: { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 } });
        }
      }
      if (a.name) {
        labels.push(zero
          ? { id: `name-${a.id}`, text: a.name, size: 14, kind: 'point', anchor: from, color, pad: 3, vector: true, priority: 1 }
          : { id: `name-${a.id}`, text: a.name, size: 14, kind: 'arrow', from, to, color, pad: 3, vector: true, priority: 1 });
      }
    }

    for (const p of points) {
      if (!p.name) continue;
      const s = toSvg(p.x, p.y);
      labels.push({ id: `pt-${p.id}`, text: p.name, size: 14, kind: 'point', anchor: s, prefer: p.prefer, color: p.color ?? COLORS.point, priority: 0 });
    }

    // Les noms de points d'abord, puis les noms de vecteurs, puis l'escalier.
    labels.sort((a, b) => a.priority - b.priority);
    const placed = placeLabels(labels, obstacles, frame);
    const byId = Object.fromEntries(labels.map((l) => [l.id, l]));

    return (
      <g style={{ pointerEvents: 'none' }}>
        {decor}
        {placed.map((l) => {
          const src = byId[l.id];
          const isIcon = false;
          return (
            <g key={l.id}>
              {src.vector && (
                <g stroke={src.color} strokeWidth="1.5" fill="none" strokeLinecap="round">
                  <line x1={l.box.x + 3} y1={l.box.y + 2} x2={l.box.x + l.box.w - 3} y2={l.box.y + 2} />
                  <polyline points={`${l.box.x + l.box.w - 6},${l.box.y - 1} ${l.box.x + l.box.w - 3},${l.box.y + 2} ${l.box.x + l.box.w - 6},${l.box.y + 5}`} />
                </g>
              )}
              <text
                x={l.x} y={l.y + (src.vector ? 1 : 0)} fontSize={l.size} fontWeight="700"
                className={isIcon ? '' : 'font-space'} fill={src.color}
                paintOrder="stroke" stroke="#ffffff" strokeWidth="3" strokeLinejoin="round"
              >
                {l.text}
              </text>
            </g>
          );
        })}
      </g>
    );
  };

  return (
    <CoordPlane
      range={range}
      points={planePoints}
      arrows={planeArrows}
      draggableId={disabled || frozen ? null : draggableId}
      onPointChange={onPointChange}
      step={step}
      target={target}
      overlay={overlay}
      caption={false}
      disabled={disabled}
      frozen={frozen}
      ariaLabel={ariaLabel}
    />
  );
}

/** Le nom d'un vecteur en HTML : la flèche au-dessus, sans KaTeX. */
export function VecName({ children, className = '' }) {
  return (
    <span className={`relative inline-block px-0.5 leading-none ${className}`} aria-label={`vecteur ${children}`}>
      <span aria-hidden="true" className="absolute left-0 right-0 -top-[0.55em] text-[0.7em] leading-none text-center">→</span>
      <span className="italic">{children}</span>
    </span>
  );
}

/** Le lecteur des coordonnées, dans le DOM (jamais en SVG). */
export function VecReadout({ name, v, words = true, tone = 'violet' }) {
  const TONE = {
    violet: 'bg-violet-100 text-violet-900', emerald: 'bg-emerald-100 text-emerald-900',
    amber: 'bg-amber-100 text-amber-900', slate: 'bg-slate-100 text-slate-800', sky: 'bg-sky-100 text-sky-900',
  };
  return (
    <p className="text-sm flex flex-wrap items-center gap-2" aria-live="polite">
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg font-mono font-bold tabular-nums ${TONE[tone] ?? TONE.violet}`}>
        {name && <VecName>{name}</VecName>}{name && ' '}{formatVec(v)}
      </span>
      {words && <span className="text-slate-600">{describeMove(v)}</span>}
    </p>
  );
}
