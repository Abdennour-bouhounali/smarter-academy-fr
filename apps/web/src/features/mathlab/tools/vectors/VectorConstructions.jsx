import { useTransformContext, vec } from 'mafs';
import * as V from './vectorMath.js';
import VectorArrow from './VectorArrow.jsx';
import { formatPair, formatValue } from './vectorFormat.js';
import { CONSTRUCTION_COLOR } from './vectorScene.js';

/**
 * LES CONSTRUCTIONS : ce qui rend une opération VISIBLE au lieu de la
 * résumer par un résultat.
 *
 * C'est le cœur pédagogique du laboratoire. §11 ne demande pas d'écrire
 * « u + v = (4,6) » — il demande de MONTRER le bout-à-bout ; §12 demande le
 * parallélogramme ; §13 demande de voir −v. Ces dessins ne sont pas des
 * décorations : ils SONT l'argument, exactement comme les manipulations des
 * leçons (MANIPULATION_CONTRACT : « le dessin se LIT »).
 */

/**
 * La somme BOUT À BOUT (§11) : v est redessiné, translaté à l'extrémité de
 * u, et la résultante ferme le chemin O → A → B.
 */
export function TipToTail({ origin, u, v, color = CONSTRUCTION_COLOR, subtraction = false }) {
  if (!V.isVector(origin) || !V.isVector(u) || !V.isVector(v)) return null;
  const corner = V.translatePoint(origin, u);
  // Pour u − v, ce qu'on met bout à bout est −v : c'est la lecture de §13.
  const second = subtraction ? V.negate(v) : v;
  const end = V.translatePoint(corner, second);

  return (
    <g data-ml-construction="tipToTail">
      {/* La copie translatée : en pointillés, elle DIT qu'elle est une copie. */}
      <VectorArrow from={corner} to={end} color={color} dashed opacity={0.75} width={2} />
      <VectorArrow from={origin} to={end} color={color} width={3.5} />
    </g>
  );
}

/**
 * Le PARALLÉLOGRAMME (§12) : les deux copies translatées ferment la figure,
 * et la diagonale est la résultante. Le remplissage très léger fait voir la
 * surface — c'est ce qui fait « découvrir pourquoi l'addition marche ».
 */
export function Parallelogram({ origin, u, v, color = CONSTRUCTION_COLOR }) {
  const { viewTransform } = useTransformContext();
  if (!V.isVector(origin) || !V.isVector(u) || !V.isVector(v)) return null;
  const a = V.translatePoint(origin, u);
  const b = V.translatePoint(origin, v);
  const far = V.translatePoint(origin, V.add(u, v));
  const toPx = (p) => vec.transform([p.x, p.y], viewTransform);
  const polygon = [origin, a, far, b].map((p) => toPx(p).join(',')).join(' ');

  return (
    <g data-ml-construction="parallelogram">
      <polygon className="sa-ml-vec__parallelogram" points={polygon} fill={color} />
      <VectorArrow from={a} to={far} color={color} dashed opacity={0.6} width={1.8} />
      <VectorArrow from={b} to={far} color={color} dashed opacity={0.6} width={1.8} />
      <VectorArrow from={origin} to={far} color={color} width={3.5} />
    </g>
  );
}

/** L'opposé −v (§13) : le même شعاع, retourné, pour que la soustraction se lise. */
export function OppositeVector({ origin, v, color, name }) {
  if (!V.isVector(origin) || !V.isVector(v)) return null;

  return (
    <VectorArrow
      from={origin}
      to={V.translatePoint(origin, V.negate(v))}
      color={color}
      name={name}
      dashed
      opacity={0.8}
      width={2}
    />
  );
}

/**
 * Le GUIDE de la mise à l'échelle (§14, §15) : la droite portante de u,
 * en pointillés, sur laquelle k·u glisse. Elle montre que tous les k·u
 * vivent sur la MÊME droite — c'est la définition de la colinéarité, vue
 * avant d'être dite.
 */
export function ScaleGuide({ origin, u, color = CONSTRUCTION_COLOR, view }) {
  const { viewTransform } = useTransformContext();
  if (!V.isVector(origin) || !V.isVector(u) || V.isZero(u) || !view) return null;
  // On prolonge la droite jusqu'aux bords de la fenêtre.
  const span = Math.hypot(view.xMax - view.xMin, view.yMax - view.yMin);
  const unit = 1 / V.norm(u);
  const far = { x: u.x * unit * span, y: u.y * unit * span };
  const p1 = vec.transform([origin.x - far.x, origin.y - far.y], viewTransform);
  const p2 = vec.transform([origin.x + far.x, origin.y + far.y], viewTransform);

  return (
    <line
      className="sa-ml-vec__guide"
      x1={p1[0]}
      y1={p1[1]}
      x2={p2[0]}
      y2={p2[1]}
      stroke={color}
      data-ml-construction="scaleGuide"
    />
  );
}

/**
 * La MARQUE D'ANGLE DROIT (§24) : le petit carré des manuels, posé au sommet
 * commun, dessiné en pixels pour ne pas se déformer au zoom.
 */
export function RightAngleMark({ at, u, v, color = '#059669', size = 15 }) {
  const { viewTransform } = useTransformContext();
  if (!V.isVector(at) || !V.isVector(u) || !V.isVector(v)) return null;
  if (V.isZero(u) || V.isZero(v)) return null;
  const [cx, cy] = vec.transform([at.x, at.y], viewTransform);
  const [ux, uy] = vec.transform([at.x + u.x, at.y + u.y], viewTransform);
  const [vx, vy] = vec.transform([at.x + v.x, at.y + v.y], viewTransform);
  const unit = (px, py) => {
    const length = Math.hypot(px - cx, py - cy) || 1;

    return [(px - cx) / length, (py - cy) / length];
  };
  const [ax, ay] = unit(ux, uy);
  const [bx, by] = unit(vx, vy);
  const points = [
    [cx + ax * size, cy + ay * size],
    [cx + (ax + bx) * size, cy + (ay + by) * size],
    [cx + bx * size, cy + by * size],
  ].map(([x, y]) => `${x},${y}`).join(' ');

  return (
    <polyline
      className="sa-ml-vec__rightangle"
      points={points}
      stroke={color}
      fill="none"
      data-ml-construction="rightAngle"
    />
  );
}

/**
 * L'ARC de direction (§10) : l'angle depuis l'axe des abscisses, tracé à
 * l'origine du شعاع. Il rend l'angle visible au lieu de le laisser être un
 * nombre dans un panneau.
 */
export function DirectionArc({ origin, v, color, radius = 30, showValue = true }) {
  const { viewTransform } = useTransformContext();
  if (!V.isVector(origin) || !V.isVector(v) || V.isZero(v)) return null;
  const [cx, cy] = vec.transform([origin.x, origin.y], viewTransform);
  const degrees = V.direction(v);
  const radians = (degrees * Math.PI) / 180;
  // En pixels, l'axe des ordonnées est inversé : l'angle se dessine donc
  // avec −sin, sinon l'arc part du mauvais côté.
  const endX = cx + radius * Math.cos(radians);
  const endY = cy - radius * Math.sin(radians);
  const largeArc = degrees > 180 ? 1 : 0;
  const midRadians = radians / 2;

  return (
    <g data-ml-construction="directionArc">
      <line className="sa-ml-vec__anglebase" x1={cx} y1={cy} x2={cx + radius * 1.35} y2={cy} stroke={color} />
      <path
        className="sa-ml-vec__anglearc"
        d={`M ${cx + radius} ${cy} A ${radius} ${radius} 0 ${largeArc} 0 ${endX} ${endY}`}
        stroke={color}
        fill="none"
      />
      {showValue && (
        <text
          className="sa-ml-vec__anglelabel"
          x={cx + (radius + 14) * Math.cos(midRadians)}
          y={cy - (radius + 14) * Math.sin(midRadians) + 4}
          fill={color}
          textAnchor="middle"
          direction="ltr"
        >
          {`${formatValue(degrees, 1)}°`}
        </text>
      )}
    </g>
  );
}

/**
 * Les COMPOSANTES lues sur la grille (§8) : les deux cathètes en pointillés
 * sous le شعاع. C'est le dessin qui explique que (4, 2) veut dire « quatre
 * à droite, deux vers le haut » — la lecture attendue en 4AM.
 */
export function ComponentLegs({ origin, v, color, showValues = true }) {
  const { viewTransform } = useTransformContext();
  if (!V.isVector(origin) || !V.isVector(v) || V.isZero(v)) return null;
  const corner = { x: origin.x + v.x, y: origin.y };
  const end = { x: origin.x + v.x, y: origin.y + v.y };
  const toPx = (p) => vec.transform([p.x, p.y], viewTransform);
  const [ox, oy] = toPx(origin);
  const [kx, ky] = toPx(corner);
  const [ex, ey] = toPx(end);

  return (
    <g className="sa-ml-vec__legs" data-ml-construction="legs">
      <line x1={ox} y1={oy} x2={kx} y2={ky} stroke={color} />
      <line x1={kx} y1={ky} x2={ex} y2={ey} stroke={color} />
      {showValues && Math.abs(v.x) > 1e-9 && (
        <text className="sa-ml-vec__leglabel" x={(ox + kx) / 2} y={oy + (v.y >= 0 ? 16 : -8)} fill={color} textAnchor="middle" direction="ltr">
          {formatValue(v.x, 2)}
        </text>
      )}
      {showValues && Math.abs(v.y) > 1e-9 && (
        <text className="sa-ml-vec__leglabel" x={kx + (v.x >= 0 ? 8 : -8)} y={(ky + ey) / 2 + 4} fill={color} textAnchor={v.x >= 0 ? 'start' : 'end'} direction="ltr">
          {formatValue(v.y, 2)}
        </text>
      )}
    </g>
  );
}

/** Le segment [AB] avec sa longueur — la mesure de §19. */
export function MeasuredSegment({ a, b, color = CONSTRUCTION_COLOR, label = null }) {
  const { viewTransform } = useTransformContext();
  if (!V.isVector(a) || !V.isVector(b)) return null;
  const [x1, y1] = vec.transform([a.x, a.y], viewTransform);
  const [x2, y2] = vec.transform([b.x, b.y], viewTransform);

  return (
    <g data-ml-construction="segment">
      <line className="sa-ml-vec__segment" x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} />
      {label && (
        <text className="sa-ml-vec__seglabel" x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 8} fill={color} textAnchor="middle" direction="ltr">
          {label}
        </text>
      )}
    </g>
  );
}

/** La droite qui porte trois points alignés (§22) — la preuve, pas la phrase. */
export function CollinearLine({ through, direction: dir, color = '#059669', view }) {
  const { viewTransform } = useTransformContext();
  if (!V.isVector(through) || !V.isVector(dir) || V.isZero(dir) || !view) return null;
  const span = Math.hypot(view.xMax - view.xMin, view.yMax - view.yMin);
  const unit = 1 / V.norm(dir);
  const far = { x: dir.x * unit * span, y: dir.y * unit * span };
  const p1 = vec.transform([through.x - far.x, through.y - far.y], viewTransform);
  const p2 = vec.transform([through.x + far.x, through.y + far.y], viewTransform);

  return (
    <line className="sa-ml-vec__collinear" x1={p1[0]} y1={p1[1]} x2={p2[0]} y2={p2[1]} stroke={color} data-ml-construction="collinearLine" />
  );
}

/** Un polygone (§17) : la forme, et son image en pointillés. */
export function PolygonShape({ vertices, color, image = false, name = null }) {
  const { viewTransform } = useTransformContext();
  if (!Array.isArray(vertices) || vertices.length < 3 || vertices.some((p) => !V.isVector(p))) return null;
  const pixels = vertices.map((p) => vec.transform([p.x, p.y], viewTransform));
  const points = pixels.map(([x, y]) => `${x},${y}`).join(' ');
  const centroid = pixels.reduce(([sx, sy], [x, y]) => [sx + x, sy + y], [0, 0]).map((s) => s / pixels.length);

  return (
    <g data-ml-construction="polygon" data-ml-polygon-image={image ? 'true' : undefined}>
      <polygon
        className={`sa-ml-vec__polygon${image ? ' sa-ml-vec__polygon--image' : ''}`}
        points={points}
        fill={color}
        stroke={color}
      />
      {name && (
        <text className="sa-ml-vec__polylabel" x={centroid[0]} y={centroid[1]} fill={color} textAnchor="middle">{name}</text>
      )}
    </g>
  );
}

/** Le tracé de la translation (§16) : le pointillé qui relie A à son image A′. */
export function TranslationTrace({ from, to, color = CONSTRUCTION_COLOR }) {
  if (!V.isVector(from) || !V.isVector(to)) return null;

  return <VectorArrow from={from} to={to} color={color} dashed opacity={0.7} width={1.8} />;
}

/** Le couple lisible d'un point, posé près de lui — les coordonnées « live » de §4. */
export function PointCoordinates({ position, color = '#475569', offset = 14 }) {
  const { viewTransform } = useTransformContext();
  if (!V.isVector(position)) return null;
  const [px, py] = vec.transform([position.x, position.y], viewTransform);

  return (
    <text className="sa-ml-vec__pointcoords" x={px + offset} y={py + offset} fill={color} direction="ltr">
      {formatPair(position)}
    </text>
  );
}
