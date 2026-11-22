import { useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import * as M from './measureMath.js';
import { triangleVertices, scaleFactor } from './investigations.js';
import { formatValue } from '../functionGrapher/grapherFormat.js';

/**
 * La SCÈNE : l'objet qu'on mesure, dessiné en SVG et manipulable au doigt.
 *
 * Tout est DESSINÉ — pas une image, pas une texture. La grille se compte, la
 * poignée se tire, les étiquettes sont du vrai texte du DOM (donc lisible
 * par un lecteur d'écran). C'est la règle des
 * manipulations de la plateforme (MANIPULATION_CONTRACT.md), et elle vaut
 * ici pour la même raison : le dessin n'illustre pas la mesure, il EST la
 * mesure.
 *
 * Le repère est LTR par nature — c'est de la mathématique (§30) : x va vers
 * la droite quelle que soit la direction de la page.
 *
 * Aucune mathématique n'est calculée ici : tout vient de `measureMath.js` et
 * de l'enquête. Ce composant place des pixels.
 */

/** La marge autour de l'objet, en pixels du repère. */
const PAD = 48;
/** La même, sur une scène compacte : la figure y est déjà à l'étroit. */
const PAD_COMPACT = 30;

export default function MeasureStage({
  investigation, params, measures, settings, onParam, compact,
}) {
  const { t } = useTranslation('mathlab');
  const svgRef = useRef(null);

  /** L'échelle : l'objet occupe la scène sans jamais la déborder. */
  const view = useMemo(() => geometryOf(investigation, params), [investigation, params]);
  /**
   * La taille du repère, en unités du viewBox.
   *
   * Sur un téléphone la scène est LARGE et BASSE (340 × 210) et non carrée :
   * le rapport du viewBox fixe la hauteur réelle du SVG quoi qu'en dise le
   * CSS, et une scène carrée poussait les LECTURES sous le tiroir — l'élève
   * voyait alors la figure sans sa mesure (défaut relevé en QA mobile, la
   * géométrie a fixé le chiffre).
   */
  const size = compact ? { w: 340, h: 210 } : { w: 560, h: 420 };
  const pad = compact ? PAD_COMPACT : PAD;
  const scale = useMemo(() => {
    const spanX = Math.max(1, view.bounds.maxX - view.bounds.minX);
    const spanY = Math.max(1, view.bounds.maxY - view.bounds.minY);

    return Math.min((size.w - 2 * pad) / spanX, (size.h - 2 * pad) / spanY);
  }, [view, size.w, size.h, pad]);

  /** Repère mathématique → pixels. y monte, comme au tableau. */
  const toPx = useCallback((x, y) => ({
    x: pad + (x - view.bounds.minX) * scale,
    y: size.h - pad - (y - view.bounds.minY) * scale,
  }), [view.bounds, scale, size.h, pad]);

  /** Pixels → repère, pour savoir où le doigt s'est posé. */
  const toMath = useCallback((clientX, clientY) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width) * size.w;
    const py = ((clientY - rect.top) / rect.height) * size.h;

    return {
      x: view.bounds.minX + (px - pad) / scale,
      y: view.bounds.minY + (size.h - pad - py) / scale,
    };
  }, [view.bounds, scale, size.w, size.h, pad]);

  /**
   * Le GESTE : une poignée suit le doigt, et règle un paramètre de l'objet.
   *
   * `setPointerCapture` garde le doigt lié à la poignée même s'il sort du
   * SVG — sans quoi un glissement rapide « lâche » la poignée en route.
   */
  const startDrag = useCallback((handle) => (event) => {
    if (!handle || event.button > 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);

    const move = (moveEvent) => {
      const point = toMath(moveEvent.clientX, moveEvent.clientY);
      if (!point) return;
      const next = handle.read(point);
      for (const [key, value] of Object.entries(next)) onParam(key, value);
    };
    const stop = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
  }, [toMath, onParam]);

  /** Les flèches du clavier règlent aussi l'objet (§33). */
  const onKey = useCallback((handle) => (event) => {
    if (!handle) return;
    const entry = investigation.params.find((p) => p.key === handle.param);
    if (!entry) return;
    const delta = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[event.key];
    if (delta === undefined) return;
    event.preventDefault();
    onParam(handle.param, (params[handle.param] ?? entry.initial) + delta * entry.step);
  }, [investigation, params, onParam]);

  return (
    <svg
      ref={svgRef}
      className="sa-ml-ms__svg"
      viewBox={`0 0 ${size.w} ${size.h}`}
      role="img"
      aria-label={t(`tools.measurement.investigations.${investigation.id}.name`)}
      dir="ltr"
    >
      {settings.grid && <UnitGrid view={view} toPx={toPx} scale={scale} />}

      {view.kind === 'rectangle' && (
        <RectangleScene view={view} toPx={toPx} settings={settings} measures={measures} t={t} />
      )}
      {view.kind === 'triangle' && (
        <TriangleScene
          view={view} toPx={toPx} settings={settings} measures={measures}
          investigation={investigation} t={t}
        />
      )}
      {view.kind === 'circle' && (
        <CircleScene view={view} toPx={toPx} scale={scale} settings={settings} measures={measures} params={params} investigation={investigation} t={t} />
      )}
      {view.kind === 'cuboid' && (
        <CuboidScene view={view} toPx={toPx} scale={scale} settings={settings} t={t} />
      )}
      {view.kind === 'segment' && (
        <ConversionScene view={view} toPx={toPx} settings={settings} t={t} />
      )}

      {/* Les poignées par-dessus tout : c'est ce qu'on attrape. */}
      {view.handles.map((handle) => {
        const point = toPx(handle.at.x, handle.at.y);
        const label = t(`tools.measurement.quantities.${handle.param}`, handle.param);

        return (
          <g key={handle.param + handle.at.x + handle.at.y}>
            <circle
              className="sa-ml-ms__handle"
              cx={point.x}
              cy={point.y}
              r={14}
              tabIndex={0}
              role="slider"
              aria-label={label}
              aria-valuenow={Math.round((params[handle.param] ?? 0) * 100) / 100}
              onPointerDown={startDrag(handle)}
              onKeyDown={onKey(handle)}
            />
            <circle className="sa-ml-ms__handleDot" cx={point.x} cy={point.y} r={5} />
          </g>
        );
      })}
    </svg>
  );
}

/* ── La grille des unités (§26) ─────────────────────────────────────────── */

function UnitGrid({ view, toPx, scale }) {
  // Sous huit pixels par unité la grille devient un aplat gris : on ne la
  // dessine plus, elle ne se compterait plus de toute façon.
  if (scale < 8) return null;
  const lines = [];
  const from = Math.ceil(view.bounds.minX);
  const to = Math.floor(view.bounds.maxX);
  for (let x = from; x <= to; x += 1) {
    const a = toPx(x, view.bounds.minY);
    const b = toPx(x, view.bounds.maxY);
    lines.push(<line key={`v${x}`} className="sa-ml-ms__grid" x1={a.x} y1={a.y} x2={b.x} y2={b.y} />);
  }
  const fromY = Math.ceil(view.bounds.minY);
  const toY = Math.floor(view.bounds.maxY);
  for (let y = fromY; y <= toY; y += 1) {
    const a = toPx(view.bounds.minX, y);
    const b = toPx(view.bounds.maxX, y);
    lines.push(<line key={`h${y}`} className="sa-ml-ms__grid" x1={a.x} y1={a.y} x2={b.x} y2={b.y} />);
  }

  return <g aria-hidden="true">{lines}</g>;
}

/* ── Le rectangle (§5, §8) ──────────────────────────────────────────────── */

function RectangleScene({ view, toPx, settings }) {
  const { length, width } = view;
  const a = toPx(0, 0);
  const b = toPx(length, width);

  // Les carrés unités, comptables un par un (§26). Au-delà de 144 on ne les
  // dessine plus : on ne compte pas deux cents carrés à l'œil, et le
  // navigateur n'a pas à les peindre.
  const tiles = [];
  if (settings.grid && length * width <= 144) {
    for (let x = 0; x < Math.round(length); x += 1) {
      for (let y = 0; y < Math.round(width); y += 1) {
        const corner = toPx(x, y + 1);
        const far = toPx(x + 1, y);
        tiles.push(
          <rect
            key={`t${x}-${y}`}
            className="sa-ml-ms__tile"
            x={corner.x}
            y={corner.y}
            width={far.x - corner.x}
            height={far.y - corner.y}
          />,
        );
      }
    }
  }

  return (
    <g>
      <g aria-hidden="true">{tiles}</g>
      <rect
        className="sa-ml-ms__shape"
        x={Math.min(a.x, b.x)}
        y={Math.min(a.y, b.y)}
        width={Math.abs(b.x - a.x)}
        height={Math.abs(b.y - a.y)}
      />
      {view.traceBoundary && <BoundaryTrace toPx={toPx} length={length} width={width} />}
      {settings.labels && (
        <>
          <EdgeLabel toPx={toPx} from={{ x: 0, y: 0 }} to={{ x: length, y: 0 }} text={formatValue(length, 0)} offset={22} />
          <EdgeLabel toPx={toPx} from={{ x: length, y: 0 }} to={{ x: length, y: width }} text={formatValue(width, 0)} offset={-24} />
        </>
      )}
    </g>
  );
}

/** Le TOUR du rectangle, côté après côté — l'outil « tracer la frontière ». */
function BoundaryTrace({ toPx, length, width }) {
  const corners = [{ x: 0, y: 0 }, { x: length, y: 0 }, { x: length, y: width }, { x: 0, y: width }];

  return (
    <g aria-hidden="true">
      {corners.map((corner, index) => {
        const next = corners[(index + 1) % corners.length];
        const from = toPx(corner.x, corner.y);
        const to = toPx(next.x, next.y);

        return (
          <line
            key={`edge${index}`}
            className={`sa-ml-ms__edge sa-ml-ms__edge--${index % 2 === 0 ? 'long' : 'short'}`}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
          />
        );
      })}
    </g>
  );
}

/* ── Le triangle (§9, §15, §16) ─────────────────────────────────────────── */

function TriangleScene({ view, toPx, settings, measures, investigation, t }) {
  const [A, B, C] = view.vertices;
  const points = [A, B, C].map((p) => toPx(p.x, p.y));
  const path = points.map((p) => `${p.x},${p.y}`).join(' ');

  // Le pied de la hauteur : il peut tomber HORS de la base, et alors le
  // trait devient pointillé. C'est un fait géométrique, pas une erreur.
  const foot = investigation.concept === 'area' ? M.footOfAltitude(A, B, C) : null;
  const footInside = foot ? foot.t >= 0 && foot.t <= 1 : true;

  return (
    <g>
      {/* §9 : le second triangle, retourné, qui complète le rectangle. */}
      {view.mirror && (
        <polygon
          className="sa-ml-ms__mirror"
          points={[toPx(B.x, B.y), toPx(A.x + (B.x - A.x), C.y), toPx(C.x, C.y)]
            .map((p) => `${p.x},${p.y}`).join(' ')}
        />
      )}

      {/* §15 : les carrés construits sur les côtés. */}
      {view.squares && <SideSquares vertices={view.vertices} toPx={toPx} t={t} />}

      <polygon className="sa-ml-ms__shape" points={path} />

      {foot && Number.isFinite(foot.x) && (
        <g aria-hidden="true">
          <line
            className={`sa-ml-ms__height${footInside ? '' : ' sa-ml-ms__height--outside'}`}
            x1={toPx(C.x, C.y).x}
            y1={toPx(C.x, C.y).y}
            x2={toPx(foot.x, foot.y).x}
            y2={toPx(foot.x, foot.y).y}
          />
          <RightAngleMark toPx={toPx} at={foot} along={{ x: B.x - A.x, y: B.y - A.y }} up={{ x: C.x - foot.x, y: C.y - foot.y }} />
        </g>
      )}

      {/* §16 : les arcs des trois angles. */}
      {view.showAngles && <AngleArcs vertices={view.vertices} toPx={toPx} measures={measures} />}

      {settings.labels && (
        <>
          <VertexLabel toPx={toPx} at={A} text="A" />
          <VertexLabel toPx={toPx} at={B} text="B" />
          <VertexLabel toPx={toPx} at={C} text="C" />
        </>
      )}
    </g>
  );
}

/** Le petit carré de l'angle droit, là où la hauteur rencontre la base. */
function RightAngleMark({ toPx, at, along, up }) {
  const norm = (v) => {
    const n = Math.hypot(v.x, v.y) || 1;

    return { x: v.x / n, y: v.y / n };
  };
  const u = norm(along);
  const w = norm(up);
  const s = 0.45;
  const p1 = toPx(at.x + u.x * s, at.y + u.y * s);
  const p2 = toPx(at.x + (u.x + w.x) * s, at.y + (u.y + w.y) * s);
  const p3 = toPx(at.x + w.x * s, at.y + w.y * s);

  return <polyline className="sa-ml-ms__rightAngle" points={`${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`} />;
}

/** §15 — un carré sur chaque côté, dessiné vers l'extérieur. */
function SideSquares({ vertices, toPx }) {
  const [A, B, C] = vertices;
  const squares = [[B, A], [B, C], [A, C]].map(([p, q], index) => {
    // Le carré est posé du côté opposé au troisième sommet.
    const dx = q.x - p.x;
    const dy = q.y - p.y;
    const third = [C, A, B][index];
    // La normale qui s'éloigne du triangle.
    let nx = -dy;
    let ny = dx;
    const mid = { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 };
    if ((mid.x + nx - third.x) ** 2 + (mid.y + ny - third.y) ** 2 < (mid.x - third.x) ** 2 + (mid.y - third.y) ** 2) {
      nx = -nx;
      ny = -ny;
    }
    const corners = [p, q, { x: q.x + nx, y: q.y + ny }, { x: p.x + nx, y: p.y + ny }];

    return { index, corners, area: dx * dx + dy * dy };
  });

  return (
    <g>
      {squares.map(({ index, corners, area }) => (
        <g key={`sq${index}`}>
          <polygon
            className={`sa-ml-ms__sideSquare sa-ml-ms__sideSquare--${index === 2 ? 'hyp' : 'leg'}`}
            points={corners.map((c) => { const p = toPx(c.x, c.y); return `${p.x},${p.y}`; }).join(' ')}
          />
          <text
            className="sa-ml-ms__sideSquareText"
            x={toPx((corners[0].x + corners[2].x) / 2, (corners[0].y + corners[2].y) / 2).x}
            y={toPx((corners[0].x + corners[2].x) / 2, (corners[0].y + corners[2].y) / 2).y}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {formatValue(area, 0)}
          </text>
        </g>
      ))}
    </g>
  );
}

/** §16 — les arcs, avec la mesure de chaque angle. */
function AngleArcs({ vertices, toPx, measures }) {
  const [A, B, C] = vertices;
  const values = [measures.angleA, measures.angleB, measures.angleC];

  return (
    <g>
      {[[A, B, C], [B, C, A], [C, A, B]].map(([vertex, p, q], index) => {
        const r = 0.9;
        const angle1 = Math.atan2(p.y - vertex.y, p.x - vertex.x);
        const angle2 = Math.atan2(q.y - vertex.y, q.x - vertex.x);
        const start = toPx(vertex.x + r * Math.cos(angle1), vertex.y + r * Math.sin(angle1));
        const end = toPx(vertex.x + r * Math.cos(angle2), vertex.y + r * Math.sin(angle2));
        let sweep = angle2 - angle1;
        while (sweep <= -Math.PI) sweep += 2 * Math.PI;
        while (sweep > Math.PI) sweep -= 2 * Math.PI;
        const radius = Math.abs(toPx(r, 0).x - toPx(0, 0).x);
        const mid = angle1 + sweep / 2;
        const label = toPx(vertex.x + 1.5 * r * Math.cos(mid), vertex.y + 1.5 * r * Math.sin(mid));

        return (
          <g key={`arc${index}`}>
            <path
              className="sa-ml-ms__arc"
              d={`M ${start.x} ${start.y} A ${radius} ${radius} 0 0 ${sweep > 0 ? 0 : 1} ${end.x} ${end.y}`}
            />
            <text className="sa-ml-ms__arcText" x={label.x} y={label.y} textAnchor="middle" dominantBaseline="middle">
              {formatValue(values[index], 1)}°
            </text>
          </g>
        );
      })}
    </g>
  );
}

/* ── Le cercle (§10, §11) ───────────────────────────────────────────────── */

function CircleScene({ view, toPx, scale, settings, params, investigation }) {
  const centre = toPx(0, 0);
  const radiusPx = view.radius * scale;

  // §11 — le disque découpé et réarrangé en « presque rectangle ».
  if (investigation.concept === 'area') {
    const sectors = Math.max(4, Math.round(params.sectors ?? 8));

    return (
      <g>
        <circle className="sa-ml-ms__shape" cx={centre.x} cy={centre.y} r={radiusPx} />
        <SectorFan centre={centre} radiusPx={radiusPx} sectors={sectors} />
        {settings.labels && (
          <line className="sa-ml-ms__radius" x1={centre.x} y1={centre.y} x2={centre.x + radiusPx} y2={centre.y} />
        )}
      </g>
    );
  }

  // §10 — le fil déroulé sous le cercle, à comparer au diamètre.
  const unrolled = Math.PI * 2 * view.radius * scale;
  const baseline = centre.y + radiusPx + 42;

  return (
    <g>
      <circle className="sa-ml-ms__shape" cx={centre.x} cy={centre.y} r={radiusPx} />
      <line className="sa-ml-ms__diameter" x1={centre.x - radiusPx} y1={centre.y} x2={centre.x + radiusPx} y2={centre.y} />
      <circle className="sa-ml-ms__centre" cx={centre.x} cy={centre.y} r={3} />

      {/* Le fil, déroulé : c'est LUI qu'on compare au diamètre (§10). */}
      <g aria-hidden="true">
        <line className="sa-ml-ms__thread" x1={centre.x - unrolled / 2} y1={baseline} x2={centre.x + unrolled / 2} y2={baseline} />
        {/* Les reports du diamètre le long du fil : trois, et un reste. */}
        {[0, 1, 2].map((index) => (
          <line
            key={`d${index}`}
            className="sa-ml-ms__threadMark"
            x1={centre.x - unrolled / 2 + index * 2 * radiusPx}
            y1={baseline - 9}
            x2={centre.x - unrolled / 2 + index * 2 * radiusPx}
            y2={baseline + 9}
          />
        ))}
        <line
          className="sa-ml-ms__threadMark"
          x1={centre.x + unrolled / 2}
          y1={baseline - 9}
          x2={centre.x + unrolled / 2}
          y2={baseline + 9}
        />
      </g>
    </g>
  );
}

/** Les secteurs alternés, redressés — la manipulation qui fait naître πr². */
function SectorFan({ centre, radiusPx, sectors }) {
  const slices = [];
  const step = (2 * Math.PI) / sectors;
  for (let index = 0; index < sectors; index += 1) {
    const from = index * step;
    const to = from + step;
    const x1 = centre.x + radiusPx * Math.cos(from);
    const y1 = centre.y - radiusPx * Math.sin(from);
    const x2 = centre.x + radiusPx * Math.cos(to);
    const y2 = centre.y - radiusPx * Math.sin(to);
    slices.push(
      <path
        key={`s${index}`}
        className={`sa-ml-ms__sector sa-ml-ms__sector--${index % 2 === 0 ? 'a' : 'b'}`}
        d={`M ${centre.x} ${centre.y} L ${x1} ${y1} A ${radiusPx} ${radiusPx} 0 0 0 ${x2} ${y2} Z`}
      />,
    );
  }

  return <g aria-hidden="true">{slices}</g>;
}

/* ── Le pavé et le cube (§12, §13) ──────────────────────────────────────── */

/**
 * Le pavé en perspective cavalière — des cubes unités qu'on COMPTE.
 *
 * Ce n'est pas de la 3D : c'est une projection à 30°, dessinée en SVG. Le
 * l'atelier a déjà un explorateur 3D (three.js) ; en embarquer un second pour
 * montrer vingt-quatre petits cubes serait absurde, et l'élève doit COMPTER,
 * pas tourner autour.
 */
function CuboidScene({ view, toPx, scale }) {
  const { length, width, height } = view;
  const unit = scale * 0.8;
  const dx = unit * 0.45;
  const dy = -unit * 0.32;
  // Le solide est CENTRÉ sur la scène : son emprise projetée fait
  // (L + W·0,45) de large et (H + W·0,32) de haut, et l'origine se place de
  // façon que ce rectangle tombe au milieu. Sans cela le pavé se tassait en
  // bas à gauche, et grandir la hauteur le faisait sortir par le haut.
  const spanX = (Math.round(length) + Math.round(width) * 0.45) * unit;
  const spanY = (Math.round(height) + Math.round(width) * 0.32) * unit;
  const middle = toPx(
    (view.bounds.minX + view.bounds.maxX) / 2,
    (view.bounds.minY + view.bounds.maxY) / 2,
  );
  const origin = { x: middle.x - spanX / 2, y: middle.y + spanY / 2 - Math.round(width) * 0.32 * unit };

  const project = (x, y, z) => ({
    x: origin.x + x * unit + y * dx,
    y: origin.y - z * unit + y * dy,
  });

  const faces = [];
  const L = Math.round(length);
  const W = Math.round(width);
  const H = Math.round(height);

  /**
   * TROIS grilles de faces, et non un balayage des cubes.
   *
   * Un pavé vu de trois quarts ne montre que trois faces ; les dessiner
   * comme trois grilles indépendantes donne exactement les carreaux que
   * l'élève doit compter — une couche du dessus (L × W), la façade (L × H)
   * et le flanc droit (W × H). Le balayage en profondeur qu'il y avait ici
   * sautait des cubes de la façade et découpait le solide en escalier
   * (défaut vu à la capture d'écran, jamais par un test).
   *
   * Les faces sont posées de l'arrière vers l'avant : la dernière dessinée
   * est celle qui est devant.
   */

  // Le flanc droit (x = L), puis le dessus (z = H), puis la façade (y = 0).
  for (let y = 0; y < W; y += 1) {
    for (let z = 0; z < H; z += 1) {
      faces.push(<Quad key={`side-${y}-${z}`} cls="side" points={[
        project(L, y, z), project(L, y + 1, z), project(L, y + 1, z + 1), project(L, y, z + 1)]} />);
    }
  }
  for (let x = 0; x < L; x += 1) {
    for (let y = 0; y < W; y += 1) {
      faces.push(<Quad key={`top-${x}-${y}`} cls="top" points={[
        project(x, y, H), project(x + 1, y, H), project(x + 1, y + 1, H), project(x, y + 1, H)]} />);
    }
  }
  for (let x = 0; x < L; x += 1) {
    for (let z = 0; z < H; z += 1) {
      faces.push(<Quad key={`front-${x}-${z}`} cls="front" points={[
        project(x, 0, z), project(x + 1, 0, z), project(x + 1, 0, z + 1), project(x, 0, z + 1)]} />);
    }
  }

  return <g>{faces}</g>;
}

function Quad({ points, cls }) {
  return (
    <polygon
      className={`sa-ml-ms__cube sa-ml-ms__cube--${cls}`}
      points={points.map((p) => `${p.x},${p.y}`).join(' ')}
    />
  );
}

/* ── Les conversions (§14) ──────────────────────────────────────────────── */

/**
 * Le grand carré, pavé de petits carrés — pourquoi le facteur se met au carré.
 *
 * Le nombre réel (100 × 100 = 10 000 petits carrés) ne se dessine pas : on
 * montre la STRUCTURE avec un nombre de subdivisions lisible, et le tableau
 * porte le vrai compte. Dessiner dix mille carrés de 0,05 px serait un aplat.
 */
function ConversionScene({ view, toPx, settings }) {
  const k = view.lengthFactor;
  // On dessine au plus dix subdivisions par côté : au-delà, l'œil ne compte
  // plus, et c'est le tableau qui porte le nombre exact.
  const shown = Math.min(10, k);
  const a = toPx(0, 0);
  const b = toPx(10, 10);
  const side = Math.abs(b.x - a.x);
  const cell = side / shown;

  const cells = [];
  for (let x = 0; x < shown; x += 1) {
    for (let y = 0; y < shown; y += 1) {
      cells.push(
        <rect
          key={`c${x}-${y}`}
          className="sa-ml-ms__tile"
          x={Math.min(a.x, b.x) + x * cell}
          y={Math.min(a.y, b.y) + y * cell}
          width={cell}
          height={cell}
        />,
      );
    }
  }

  return (
    <g>
      <g aria-hidden="true">{cells}</g>
      <rect
        className="sa-ml-ms__shape"
        x={Math.min(a.x, b.x)}
        y={Math.min(a.y, b.y)}
        width={side}
        height={Math.abs(b.y - a.y)}
      />
      {settings.labels && (
        <text className="sa-ml-ms__note" x={Math.min(a.x, b.x) + side / 2} y={Math.min(a.y, b.y) - 14} textAnchor="middle">
          {shown < k ? `${formatValue(shown, 0)}\u00A0/\u00A0${formatValue(k, 0)}` : formatValue(k, 0)}
        </text>
      )}
    </g>
  );
}

/* ── Les étiquettes ─────────────────────────────────────────────────────── */

function EdgeLabel({ toPx, from, to, text, offset }) {
  const a = toPx(from.x, from.y);
  const b = toPx(to.x, to.y);
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const horizontal = Math.abs(b.x - a.x) > Math.abs(b.y - a.y);

  return (
    <text
      className="sa-ml-ms__label"
      x={mid.x + (horizontal ? 0 : offset)}
      y={mid.y + (horizontal ? offset : 0)}
      textAnchor="middle"
      dominantBaseline="middle"
      dir="ltr"
    >
      {text}
    </text>
  );
}

function VertexLabel({ toPx, at, text }) {
  const p = toPx(at.x, at.y);

  return (
    <text className="sa-ml-ms__vertex" x={p.x} y={p.y - 14} textAnchor="middle" dir="ltr">{text}</text>
  );
}

/* ── La géométrie de la scène, déduite de l'enquête ─────────────────────── */

/**
 * Ce que la scène doit dessiner, et où sont ses poignées.
 *
 * C'est la SEULE fonction qui traduit « une enquête + des paramètres » en
 * une figure. Ajouter une enquête sur une scène existante ne demande donc
 * aucune ligne ici.
 */
function geometryOf(investigation, params) {
  const read = (key, fallback) => {
    const value = Number(params?.[key]);

    return Number.isFinite(value) ? value : fallback;
  };

  if (investigation.stage === 'rectangle') {
    const length = read('length', 5);
    const width = read('width', 3);

    return {
      kind: 'rectangle',
      length,
      width,
      traceBoundary: Boolean(investigation.traceBoundary),
      bounds: { minX: -1, maxX: Math.max(length, 4) + 1, minY: -1, maxY: Math.max(width, 3) + 1 },
      handles: [
        { param: 'length', at: { x: length, y: 0 }, read: (point) => ({ length: point.x }) },
        { param: 'width', at: { x: length, y: width }, read: (point) => ({ width: point.y }) },
      ],
    };
  }

  if (investigation.stage === 'triangle') {
    if (investigation.rightAngled) {
      // §15 : le triangle rectangle en B, les deux côtés réglables.
      const side1 = read('side1', 3);
      const side2 = read('side2', 4);
      const vertices = [{ x: 0, y: side1 }, { x: 0, y: 0 }, { x: side2, y: 0 }];
      const span = Math.max(side1, side2) + side1 + side2;

      return {
        kind: 'triangle',
        vertices,
        squares: true,
        showAngles: false,
        bounds: { minX: -span * 0.75, maxX: span, minY: -span * 0.75, maxY: span * 0.9 },
        handles: [
          { param: 'side1', at: { x: 0, y: side1 }, read: (point) => ({ side1: point.y }) },
          { param: 'side2', at: { x: side2, y: 0 }, read: (point) => ({ side2: point.x }) },
        ],
      };
    }

    const base = read('base', 6);
    const height = read('height', 4);
    const apex = read('apex', base / 2);
    const vertices = triangleVertices({ base, height, apex });

    return {
      kind: 'triangle',
      vertices,
      mirror: Boolean(investigation.explanation === 'mirror' && params?.showMirror),
      showAngles: Boolean(investigation.showAngles),
      bounds: {
        minX: Math.min(-1, apex - 1),
        maxX: Math.max(base, apex) + 1,
        minY: -1,
        maxY: Math.max(height, 3) + 1.5,
      },
      handles: [
        { param: 'base', at: { x: base, y: 0 }, read: (point) => ({ base: point.x }) },
        {
          param: 'height',
          at: { x: apex, y: height },
          // Le sommet règle DEUX choses : sa hauteur et son glissement.
          read: (point) => ({ height: point.y, apex: point.x }),
        },
      ],
    };
  }

  if (investigation.stage === 'circle') {
    const radius = read('radius', 3);

    return {
      kind: 'circle',
      radius,
      bounds: { minX: -radius - 1, maxX: radius + 1, minY: -radius - 2.5, maxY: radius + 1 },
      handles: [
        { param: 'radius', at: { x: radius, y: 0 }, read: (point) => ({ radius: Math.hypot(point.x, point.y) }) },
      ],
    };
  }

  if (investigation.stage === 'cuboid') {
    const edge = read('edge', null);
    const length = edge ?? read('length', 4);
    const width = edge ?? read('width', 3);
    const height = edge ?? read('height', 2);
    const span = Math.max(length + width, height + width) + 3;

    return {
      kind: 'cuboid',
      length,
      width,
      height,
      bounds: { minX: 0, maxX: span, minY: 0, maxY: span },
      // Le pavé se règle aux curseurs : une poignée en perspective
      // cavalière serait un mensonge sur ce qu'on attrape.
      handles: [],
    };
  }

  // Le segment / le carré des conversions.
  // Le facteur vient de l'enquête (et du moteur de conversion) : la scène
  // ne tient plus sa propre table, qui avait dérivé (deux crans à 1 000).
  return {
    kind: 'segment',
    lengthFactor: scaleFactor(read('scale', 2)),
    bounds: { minX: -1, maxX: 11, minY: -1, maxY: 11 },
    handles: [],
  };
}
