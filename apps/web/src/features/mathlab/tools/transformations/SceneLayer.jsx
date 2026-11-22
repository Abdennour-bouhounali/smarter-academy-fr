import { useTransformContext, vec } from 'mafs';
import * as M from './transformMath.js';
import { VERTEX_NAMES } from './transformState.js';
import { resolveCenter, resolveAxis } from './transformModel.js';

/**
 * CE QUE L'ÉLÈVE VOIT sur le plan : la figure d'origine, son image, les
 * intermédiaires, les traces, l'axe ou le centre de la transformation
 * courante, et les fils qui relient chaque point à son image.
 *
 * Aucune mathématique ici : tout arrive déjà calculé (transformStages,
 * resolveData). Ce fichier ne fait que transformer des coordonnées du plan
 * en pixels et écrire du SVG.
 *
 * ── §46 : distinguer sans dépendre de la couleur ─────────────────────────
 * Original, image, intermédiaires et lignes de construction ne se
 * distinguent JAMAIS par la seule couleur :
 *
 *   | rôle            | trait        | remplissage | étiquette |
 *   |-----------------|--------------|-------------|-----------|
 *   | original        | plein, épais | 14 %        | A, B, C   |
 *   | image           | plein, épais | 24 %        | A′, B′, C′|
 *   | intermédiaire   | pointillé    | 6 %         | —         |
 *   | trace / motif   | pointillé fin| aucun       | —         |
 *   | construction    | tirets       | aucun       | —         |
 *
 * Un élève daltonien lit la forme du trait et l'étiquette ; un élève en noir
 * et blanc (impression) aussi.
 */
export default function SceneLayer({
  figures, steps, settings, activeStepId,
  animationFigures = null, patternFigures = null, targetFigure = null, hideImage = false, view,
}) {
  const { viewTransform } = useTransformContext();
  const toPx = (point) => vec.transform([point.x, point.y], viewTransform);

  return (
    <g className="sa-ml-tr__scene" data-ml-scene>
      {/* L'axe ou le centre de la transformation COURANTE, sous les figures. */}
      {activeStepId && (
        <TransformGuide
          step={steps.find((step) => step.id === activeStepId)}
          figures={figures}
          toPx={toPx}
          view={view}
          hideImage={hideImage}
        />
      )}

      {/* Le MOTIF (§37) : les copies répétées, derrière tout le reste. */}
      {patternFigures?.map((copy, index) => (
        <polygon
          key={`pattern-${index}`}
          className="sa-ml-tr__pattern"
          data-ml-pattern
          points={copy.map((vertex) => toPx(vertex).join(',')).join(' ')}
        />
      ))}

      {figures.map(({ figure, stages, image }) => {
        if (!figure.visible) return null;
        const animated = animationFigures?.[figure.id] ?? null;
        const shown = animated ?? image;
        const moved = !M.sameVertices(figure.vertices, shown);

        return (
          <g key={figure.id} data-ml-figure={figure.id}>
            {/* Les INTERMÉDIAIRES (§22) : en pointillé, sans étiquette. */}
            {settings.showIntermediate && !animated && stages.slice(0, -1).map((stage, index) => (
              !stage.skipped && (
                <FigureShape
                  key={`stage-${index}`}
                  vertices={stage.vertices}
                  color={figure.color}
                  role="intermediate"
                  toPx={toPx}
                  kind={figure.kind}
                />
              )
            ))}

            {/* Les TRACES (§45) : le chemin de chaque sommet. */}
            {settings.trails && moved && figure.vertices.map((vertex, index) => (
              <Trail
                key={`trail-${index}`}
                from={vertex}
                to={shown[index]}
                step={steps.find((s) => s.id === activeStepId) ?? steps.find((s) => s.enabled !== false)}
                figureVertices={figure.vertices}
                color={figure.color}
                toPx={toPx}
              />
            ))}

            {/* Les FILS point → image (§8, §15) : A relié à A′. */}
            {settings.showOriginal && moved && figure.vertices.map((vertex, index) => (
              <line
                key={`link-${index}`}
                className="sa-ml-tr__link"
                x1={toPx(vertex)[0]} y1={toPx(vertex)[1]}
                x2={toPx(shown[index])[0]} y2={toPx(shown[index])[1]}
              />
            ))}

            {/* L'ORIGINAL. */}
            {settings.showOriginal && (
              <FigureShape
                vertices={figure.vertices}
                color={figure.color}
                role="original"
                toPx={toPx}
                kind={figure.kind}
              />
            )}

            {/* L'IMAGE. */}
            {moved && (
              <FigureShape
                vertices={shown}
                color={figure.color}
                role="image"
                toPx={toPx}
                kind={figure.kind}
              />
            )}

            {/* Les ÉTIQUETTES (§47) : A, B, C sur l'original ; A′, B′, C′ sur l'image. */}
            {settings.labels && (
              <>
                {settings.showOriginal && figure.vertices.map((vertex, index) => (
                  <VertexLabel key={`label-${index}`} point={vertex} text={VERTEX_NAMES[index] ?? ''} color={figure.color} toPx={toPx} role="original" />
                ))}
                {moved && shown.map((vertex, index) => (
                  <VertexLabel key={`labelimg-${index}`} point={vertex} text={`${VERTEX_NAMES[index] ?? ''}′`} color={figure.color} toPx={toPx} role="image" />
                ))}
              </>
            )}

            {/* Les MESURES (§30, §32) : les longueurs sur les côtés de l'original. */}
            {settings.showMeasures && settings.showOriginal && (
              <EdgeMeasures vertices={figure.vertices} color={figure.color} toPx={toPx} kind={figure.kind} />
            )}

            {/* Les ARCS D'ANGLE (§29). */}
            {settings.showAngles && figure.vertices.length >= 3 && settings.showOriginal && (
              <AngleArcs vertices={figure.vertices} color={figure.color} toPx={toPx} />
            )}
          </g>
        );
      })}

      {/* La CIBLE d'un puzzle (§42), PAR-DESSUS tout le reste.
          Au fond, elle disparaissait sous la figure à l'instant même où
          l'élève réussissait — et il perdait la preuve visuelle de sa
          réussite (défaut vu en QA). Elle est donc dessinée en dernier, sans
          remplissage : le contour en tirets reste lisible même quand la
          figure se pose exactement dessus. */}
      {targetFigure && targetFigure.length > 1 && (
        <polygon
          className="sa-ml-tr__target"
          data-ml-target
          points={targetFigure.map((vertex) => toPx(vertex).join(',')).join(' ')}
        />
      )}
    </g>
  );
}

/** Une figure : polygone, segment ou point selon son nombre de sommets. */
function FigureShape({ vertices, color, role, toPx, kind }) {
  if (!Array.isArray(vertices) || vertices.length === 0) return null;
  const points = vertices.map((vertex) => toPx(vertex).join(',')).join(' ');

  if (vertices.length === 1 || kind === 'point') {
    const [px, py] = toPx(vertices[0]);

    return <circle className={`sa-ml-tr__shape sa-ml-tr__shape--${role}`} data-ml-shape={role} cx={px} cy={py} r={5} stroke={color} fill={color} />;
  }
  if (vertices.length === 2) {
    const [x1, y1] = toPx(vertices[0]);
    const [x2, y2] = toPx(vertices[1]);

    return <line className={`sa-ml-tr__shape sa-ml-tr__shape--${role}`} data-ml-shape={role} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} />;
  }

  return <polygon className={`sa-ml-tr__shape sa-ml-tr__shape--${role}`} data-ml-shape={role} points={points} stroke={color} fill={color} />;
}

/**
 * La TRACE d'un sommet (§45).
 *
 * Elle n'est pas une droite par défaut : le chemin d'un point dépend de la
 * transformation, et le montrer faux enseignerait faux.
 *
 *   - une translation : une flèche droite ;
 *   - une rotation : un ARC de cercle centré sur le centre de rotation ;
 *   - une homothétie : un rayon issu du centre ;
 *   - une réflexion : le segment perpendiculaire à l'axe (§15).
 */
function Trail({ from, to, step, figureVertices, color, toPx }) {
  if (!M.isPoint(from) || !M.isPoint(to) || M.samePoint(from, to)) return null;
  const [x1, y1] = toPx(from);
  const [x2, y2] = toPx(to);

  if (step?.kind === 'rotation') {
    const center = resolveCenter(step.center, figureVertices);
    const radius = M.distance(center, from);
    if (radius > M.EPSILON) {
      const [cx, cy] = toPx(center);
      const radiusPx = Math.hypot(x1 - cx, y1 - cy);
      const angle = M.normalizeAngle(Number(step.angle));
      const large = angle > 180 ? 1 : 0;
      // L'axe des y est inversé en pixels : le sens direct du plan y devient horaire.
      const sweep = 0;

      return (
        <path
          className="sa-ml-tr__trail"
          data-ml-trail="rotation"
          d={`M ${x1} ${y1} A ${radiusPx} ${radiusPx} 0 ${large} ${sweep} ${x2} ${y2}`}
          stroke={color}
        />
      );
    }
  }

  return <line className="sa-ml-tr__trail" data-ml-trail={step?.kind ?? 'move'} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} />;
}

/**
 * L'AXE ou le CENTRE de la transformation en cours d'édition.
 *
 * C'est ce qui rend §16 possible : l'axe est DESSINÉ, donc il peut être
 * déplacé et l'élève voit l'image le suivre. Sans ce dessin, la réflexion
 * resterait une formule.
 */
function TransformGuide({ step, figures, toPx, view, hideImage = false }) {
  if (!step || !view) return null;
  const vertices = figures[0]?.figure.vertices ?? [];

  if (step.kind === 'reflection' && step.axis?.type !== 'origin') {
    const line = M.normalizeLine(resolveAxis(step.axis, vertices));
    if (!line) return null;
    // On prolonge la droite bien au-delà de la fenêtre : elle est infinie.
    const span = (Math.abs(view.xMax - view.xMin) + Math.abs(view.yMax - view.yMin)) * 2;
    const a = { x: line.point.x - line.dx * span, y: line.point.y - line.dy * span };
    const b = { x: line.point.x + line.dx * span, y: line.point.y + line.dy * span };
    const [x1, y1] = toPx(a);
    const [x2, y2] = toPx(b);

    return <line className="sa-ml-tr__axis" data-ml-axis={step.axis?.type} x1={x1} y1={y1} x2={x2} y2={y2} />;
  }

  if (step.kind === 'rotation' || step.kind === 'dilation'
    || (step.kind === 'reflection' && step.axis?.type === 'origin')) {
    const center = step.kind === 'reflection'
      ? resolveCenter(step.axis?.center, vertices)
      : resolveCenter(step.center, vertices);
    const [cx, cy] = toPx(center);

    return (
      <g className="sa-ml-tr__center" data-ml-center>
        <circle cx={cx} cy={cy} r={9} />
        <line x1={cx - 6} y1={cy} x2={cx + 6} y2={cy} />
        <line x1={cx} y1={cy - 6} x2={cx} y2={cy + 6} />
      </g>
    );
  }

  if (step.kind === 'translation') {
    // Avant le verdict d'une question, pas de vecteur : tiré depuis A, son bout
    // serait exactement l'image A′ que l'élève doit trouver.
    if (hideImage) return null;
    // Le vecteur de la translation, dessiné depuis le premier sommet (§28).
    const from = vertices[0];
    if (!M.isPoint(from)) return null;
    const to = { x: from.x + Number(step.vx), y: from.y + Number(step.vy) };
    const [x1, y1] = toPx(from);
    const [x2, y2] = toPx(to);
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const head = 10;

    return (
      <g className="sa-ml-tr__vector" data-ml-vector>
        <line x1={x1} y1={y1} x2={x2} y2={y2} />
        <polygon points={[
          [x2, y2],
          [x2 - head * Math.cos(angle - 0.4), y2 - head * Math.sin(angle - 0.4)],
          [x2 - head * Math.cos(angle + 0.4), y2 - head * Math.sin(angle + 0.4)],
        ].map((p) => p.join(',')).join(' ')}
        />
      </g>
    );
  }

  return null;
}

/** Le nom d'un sommet, posé à côté et non dessus (§47). */
function VertexLabel({ point, text, color, toPx, role }) {
  if (!M.isPoint(point) || !text) return null;
  const [px, py] = toPx(point);

  return (
    <text
      className={`sa-ml-tr__vlabel sa-ml-tr__vlabel--${role}`}
      data-ml-label={text}
      x={px + 10}
      y={py - 9}
      fill={color}
    >
      {text}
    </text>
  );
}

/** Les longueurs, écrites au milieu de chaque côté (§30, §32). */
function EdgeMeasures({ vertices, color, toPx, kind }) {
  if (!Array.isArray(vertices) || vertices.length < 2 || kind === 'point') return null;
  const closed = vertices.length > 2;
  const edges = vertices.map((vertex, i) => [vertex, vertices[(i + 1) % vertices.length]])
    .slice(0, closed ? vertices.length : 1);

  return (
    <g className="sa-ml-tr__measures">
      {edges.map(([a, b], index) => {
        const length = M.distance(a, b);
        if (!(length > 1e-6)) return null;
        const middle = M.midpoint(a, b);
        const [px, py] = toPx(middle);

        return (
          <text key={index} className="sa-ml-tr__measure" x={px} y={py - 6} fill={color} textAnchor="middle" data-ml-measure={index}>
            {formatShort(length)}
          </text>
        );
      })}
    </g>
  );
}

/** Les arcs d'angle aux sommets (§29). */
function AngleArcs({ vertices, color, toPx }) {
  return (
    <g className="sa-ml-tr__angles">
      {vertices.map((vertex, index) => {
        const previous = vertices[(index - 1 + vertices.length) % vertices.length];
        const next = vertices[(index + 1) % vertices.length];
        const angle = M.angleAt(previous, vertex, next);
        if (!Number.isFinite(angle)) return null;
        const [vx, vy] = toPx(vertex);
        const [ax, ay] = toPx(previous);
        const [bx, by] = toPx(next);
        const radius = 22;
        const start = pointAtDistance(vx, vy, ax, ay, radius);
        const end = pointAtDistance(vx, vy, bx, by, radius);
        if (!start || !end) return null;
        // Le sens de l'arc suit l'orientation du polygone en PIXELS (y inversé).
        const cross = (ax - vx) * (by - vy) - (ay - vy) * (bx - vx);
        const sweep = cross > 0 ? 1 : 0;
        // L'étiquette se pose sur la BISSECTRICE, un peu au-delà de l'arc :
        // c'est le seul endroit où elle ne chevauche ni l'un ni l'autre côté.
        const label = pointAtDistance(vx, vy, (start[0] + end[0]) / 2, (start[1] + end[1]) / 2, radius + 14)
          ?? [vx, vy - radius - 14];

        return (
          <g key={index} data-ml-angle={index}>
            <path
              className="sa-ml-tr__arc"
              d={`M ${start[0]} ${start[1]} A ${radius} ${radius} 0 0 ${sweep} ${end[0]} ${end[1]}`}
              stroke={color}
            />
            <text
              className="sa-ml-tr__anglelabel"
              x={label[0]}
              y={label[1] + 4}
              fill={color}
              textAnchor="middle"
            >
              {`${formatShort(angle)}°`}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function pointAtDistance(fromX, fromY, towardX, towardY, distance) {
  const dx = towardX - fromX;
  const dy = towardY - fromY;
  const length = Math.hypot(dx, dy);
  if (!(length > 1e-6)) return null;

  return [fromX + (dx / length) * distance, fromY + (dy / length) * distance];
}

/** Un nombre court pour le plan : deux décimales au plus, virgule décimale, vrai moins. */
function formatShort(value) {
  if (!Number.isFinite(value)) return '—';
  const rounded = Math.round(value * 100) / 100;

  return String(Math.abs(rounded) < 1e-12 ? 0 : rounded).replace('.', ',').replace('-', '−');
}
