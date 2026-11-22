import { memo, useMemo } from 'react';
import { useTransformContext, vec } from 'mafs';
import * as C from './conicMath.js';
import * as I from './intersections.js';
import { isConicObject, isLineObject } from './conicState.js';
import { formatValue } from '../functionGrapher/grapherFormat.js';

/**
 * LE DESSIN de la scène (§4, §31, §20, §25) — tout ce qui vit dans le SVG.
 *
 * Il ne CALCULE rien : chaque courbe, chaque foyer, chaque asymptote et
 * chaque point d'intersection vient de `conicMath.js` et de
 * `intersections.js`. C'est la règle §50 du cahier des charges — « ne pas
 * mettre la logique mathématique dans les composants visuels » — et c'est
 * aussi ce qui rend ce fichier relisible : il décide de ce qu'on VOIT, jamais
 * de ce qui est VRAI.
 *
 * ── L'ordre de dessin est un ordre de LECTURE ────────────────────────────
 * Du fond vers la surface : les asymptotes et les axes (ce qui guide), puis
 * les courbes (ce dont on parle), puis les droites, puis les points
 * remarquables (ce qu'on nomme), et enfin les intersections et la sonde (ce
 * que l'élève manipule). Un foyer ne doit jamais passer sous sa propre
 * courbe.
 *
 * ── Les distinctions ne reposent JAMAIS sur la seule couleur (§49) ───────
 * Un foyer est un disque plein, un sommet un carré, le centre une croix, un
 * point d'intersection un anneau. Un élève daltonien lit la figure aussi
 * bien.
 */

/** Le nombre de segments d'une courbe — assez pour qu'aucun angle ne se voie. */
const CURVE_RESOLUTION = 320;

function ConicSceneLayer({
  scene, settings, features, intersections, highlight = null, reference = null,
}) {
  const { viewTransform } = useTransformContext();
  const toPixel = useMemo(() => (point) => vec.transform([point.x, point.y], viewTransform), [viewTransform]);

  const conics = scene.objects.filter(isConicObject).filter((o) => o.visible !== false);
  const lines = scene.objects.filter(isLineObject).filter((o) => o.visible !== false);
  const selected = scene.selectedId;
  const on = (key) => settings?.[key] !== false;

  return (
    <g className="sa-ml-cn__scene">
      {/* ── §44 — l'état FIGÉ, en filigrane sous tout le reste ─────────── */}
      {reference?.objects?.filter(isConicObject).map((conic) => (
        <ConicCurve
          key={`ref-${conic.id}`}
          conic={conic}
          viewport={features.viewport}
          toPixel={toPixel}
          color="#94a3b8"
          className="sa-ml-cn__curve sa-ml-cn__curve--reference"
        />
      ))}

      {/* ── Les ASYMPTOTES (§20) : sous la courbe, elles la guident ────── */}
      {on('showAsymptotes') && conics.map((conic) => {
        const f = features.byId[conic.id];
        if (!f?.asymptotes?.length) return null;

        return f.asymptotes.map((line, index) => (
          <LineShape
            key={`asym-${conic.id}-${index}`}
            line={line}
            viewport={features.viewport}
            toPixel={toPixel}
            color={conic.color}
            className="sa-ml-cn__asymptote"
            dataAttr={{ 'data-ml-cn-asymptote': conic.id }}
          />
        ));
      })}

      {/* ── Les AXES de symétrie et la DIRECTRICE (§11, §14) ───────────── */}
      {on('showAxes') && conics.map((conic) => {
        const f = features.byId[conic.id];
        if (!f) return null;

        return (
          <g key={`axes-${conic.id}`}>
            {f.axis && (
              <AxisLine axis={f.axis} viewport={features.viewport} toPixel={toPixel} color={conic.color} className="sa-ml-cn__symaxis" />
            )}
            {on('showDirectrix') && f.directrix && (
              <AxisLine
                axis={f.directrix}
                viewport={features.viewport}
                toPixel={toPixel}
                color={conic.color}
                className="sa-ml-cn__directrix"
                label="d"
                dataAttr={{ 'data-ml-cn-directrix': conic.id }}
              />
            )}
          </g>
        );
      })}

      {/* ── Le LIEU (§35), dessiné comme la courbe qu'il EST ───────────── */}
      {features.locus && (
        <ConicCurve
          conic={features.locus}
          viewport={features.viewport}
          toPixel={toPixel}
          color="#0891b2"
          className="sa-ml-cn__curve sa-ml-cn__curve--locus"
          dataAttr={{ 'data-ml-cn-locus': 'true' }}
        />
      )}

      {/* ── LES COURBES ────────────────────────────────────────────────── */}
      {conics.map((conic) => (
        <ConicCurve
          key={conic.id}
          conic={conic}
          viewport={features.viewport}
          toPixel={toPixel}
          color={conic.color}
          className={`sa-ml-cn__curve${conic.id === selected ? ' sa-ml-cn__curve--selected' : ''}`}
          dataAttr={{ 'data-ml-cn-curve': conic.id, 'data-ml-cn-kind': conic.kind }}
        />
      ))}

      {/* ── LES DROITES (§26) ──────────────────────────────────────────── */}
      {lines.map((line) => (
        <LineShape
          key={line.id}
          line={line}
          viewport={features.viewport}
          toPixel={toPixel}
          color={line.color}
          className={`sa-ml-cn__line${line.id === selected ? ' sa-ml-cn__line--selected' : ''}`}
          dataAttr={{ 'data-ml-cn-line': line.id }}
        />
      ))}

      {/* ── Les points REMARQUABLES (§31) ──────────────────────────────── */}
      {conics.map((conic) => {
        const f = features.byId[conic.id];
        if (!f) return null;
        const emphasise = (name) => highlight?.includes(name);

        return (
          <g key={`feat-${conic.id}`} className="sa-ml-cn__features">
            {/* Le grand axe de l'ellipse : le segment que §15 nomme. */}
            {on('showAxes') && f.kind === 'ellipse' && f.vertices?.length === 2 && (
              <Segment
                from={f.vertices[0]}
                to={f.vertices[1]}
                toPixel={toPixel}
                color={conic.color}
                className={`sa-ml-cn__majoraxis${emphasise('majorAxis') ? ' sa-ml-cn__hl' : ''}`}
              />
            )}

            {/* Le RAYON du cercle : le segment qui EXPLIQUE l'équation (§8). */}
            {on('showMeasures') && f.kind === 'circle' && (
              <Segment
                from={f.center}
                to={{ x: f.center.x + conic.r, y: f.center.y }}
                toPixel={toPixel}
                color={conic.color}
                className={`sa-ml-cn__radius${emphasise('radius') ? ' sa-ml-cn__hl' : ''}`}
                label={settings?.labels ? `r = ${formatValue(conic.r)}` : null}
              />
            )}

            {on('showCenter') && f.center && (
              <FeaturePoint
                point={f.center}
                toPixel={toPixel}
                color={conic.color}
                shape="cross"
                label={settings?.labels ? (f.kind === 'parabola' ? 'V' : 'C') : null}
                className={emphasise('center') ? 'sa-ml-cn__hl' : ''}
                dataAttr={{ 'data-ml-cn-center': conic.id }}
              />
            )}

            {on('showCenter') && f.kind === 'parabola' && f.vertex && (
              <FeaturePoint
                point={f.vertex}
                toPixel={toPixel}
                color={conic.color}
                shape="cross"
                label={settings?.labels ? 'V' : null}
                className={emphasise('vertex') ? 'sa-ml-cn__hl' : ''}
                dataAttr={{ 'data-ml-cn-vertex': conic.id }}
              />
            )}

            {on('showVertices') && f.kind !== 'parabola' && f.vertices?.map((vertex, index) => (
              <FeaturePoint
                key={`v-${index}`}
                point={vertex}
                toPixel={toPixel}
                color={conic.color}
                shape="square"
                label={settings?.labels && f.kind !== 'circle' ? `A${sub(index + 1)}` : null}
                className={emphasise('vertices') ? 'sa-ml-cn__hl' : ''}
                dataAttr={{ 'data-ml-cn-vertex': conic.id }}
              />
            ))}

            {/* Les FOYERS — jamais pour un cercle, où le foyer EST le centre. */}
            {on('showFoci') && f.kind !== 'circle' && f.foci?.map((focus, index) => (
              <FeaturePoint
                key={`f-${index}`}
                point={focus}
                toPixel={toPixel}
                color={conic.color}
                shape="disc"
                label={settings?.labels ? `F${f.foci.length > 1 ? sub(index + 1) : ''}` : null}
                className={emphasise('foci') ? 'sa-ml-cn__hl' : ''}
                dataAttr={{ 'data-ml-cn-focus': conic.id }}
              />
            ))}
          </g>
        );
      })}

      {/* ── §28 — les RAYONS FOCAUX du point sondé, la propriété EN ACTE ── */}
      {features.focalLinks?.map((link, index) => (
        <Segment
          key={`focal-${index}`}
          from={link.from}
          to={link.to}
          toPixel={toPixel}
          color={link.color}
          className="sa-ml-cn__focalray"
          label={settings?.labels ? formatValue(link.length) : null}
        />
      ))}

      {/* ── LES INTERSECTIONS (§25) ────────────────────────────────────── */}
      {on('showIntersections') && intersections?.map((point, index) => (
        <FeaturePoint
          key={`x-${index}`}
          point={point}
          toPixel={toPixel}
          color="#0f172a"
          shape="ring"
          label={settings?.labels ? `(${formatValue(point.x)} ; ${formatValue(point.y)})` : null}
          className={highlight?.includes('intersections') ? 'sa-ml-cn__hl' : ''}
          dataAttr={{ 'data-ml-cn-intersection': String(index) }}
        />
      ))}
    </g>
  );
}

export default memo(ConicSceneLayer);

/** Les indices en chiffres arabes ne sont pas des indices typographiques. */
const sub = (n) => '₀₁₂₃₄₅₆₇₈₉'[n] ?? String(n);

/**
 * UNE COURBE — une ou deux polylignes, selon la famille.
 *
 * L'hyperbole rend DEUX `<path>` : relier ses branches dessinerait un trait
 * qui n'existe pas (§18).
 */
function ConicCurve({
  conic, viewport, toPixel, color, className, dataAttr = {},
}) {
  const polylines = useMemo(
    () => C.conicPolylines(conic, viewport, CURVE_RESOLUTION),
    [conic, viewport],
  );
  if (polylines.length === 0) return null;

  return (
    <g {...dataAttr}>
      {polylines.map((points, index) => (
        <path
          key={index}
          className={className}
          d={pathOf(points, toPixel)}
          fill="none"
          /* En STYLE, pas en attribut : mafs colore `.MafsView path` par une
             règle de classe, qui battrait l'attribut (voir conics.css). */
          style={{ stroke: color }}
        />
      ))}
    </g>
  );
}

function pathOf(points, toPixel) {
  if (!points || points.length === 0) return '';
  let d = '';
  for (let i = 0; i < points.length; i += 1) {
    const [px, py] = toPixel(points[i]);
    if (!Number.isFinite(px) || !Number.isFinite(py)) continue;
    d += `${d === '' ? 'M' : 'L'}${px.toFixed(2)},${py.toFixed(2)}`;
  }

  return d;
}

/** Une DROITE `y = mx + p` (ou verticale), coupée à la fenêtre. */
function LineShape({
  line, viewport, toPixel, color, className, dataAttr = {},
}) {
  const segment = I.lineSegmentIn(line, viewport);
  if (!segment) return null;
  const [a, b] = segment.map(toPixel);
  if (![a[0], a[1], b[0], b[1]].every(Number.isFinite)) return null;

  return (
    <line
      {...dataAttr}
      className={className}
      x1={a[0]}
      y1={a[1]}
      x2={b[0]}
      y2={b[1]}
      style={{ stroke: color }}
    />
  );
}

/** Un axe horizontal ou vertical : la directrice, l'axe de symétrie. */
function AxisLine({
  axis, viewport, toPixel, color, className, label = null, dataAttr = {},
}) {
  if (!axis || !viewport) return null;
  const isHorizontal = axis.kind === 'horizontal';
  const from = isHorizontal ? { x: viewport.xMin, y: axis.value } : { x: axis.value, y: viewport.yMin };
  const to = isHorizontal ? { x: viewport.xMax, y: axis.value } : { x: axis.value, y: viewport.yMax };
  const [a, b] = [toPixel(from), toPixel(to)];
  if (![a[0], a[1], b[0], b[1]].every(Number.isFinite)) return null;

  return (
    <g {...dataAttr}>
      <line className={className} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} style={{ stroke: color }} />
      {label && (
        <text className="sa-ml-cn__axislabel" x={isHorizontal ? a[0] + 10 : a[0] + 6} y={isHorizontal ? a[1] - 6 : b[1] + 14} fill={color}>
          {label}
        </text>
      )}
    </g>
  );
}

/** Un segment mesuré : rayon, axe, rayon focal. */
function Segment({
  from, to, toPixel, color, className, label = null,
}) {
  if (!C.isPoint(from) || !C.isPoint(to)) return null;
  const [a, b] = [toPixel(from), toPixel(to)];
  if (![a[0], a[1], b[0], b[1]].every(Number.isFinite)) return null;

  return (
    <g>
      <line className={className} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} style={{ stroke: color }} />
      {label && (
        <text
          className="sa-ml-cn__seglabel"
          x={(a[0] + b[0]) / 2}
          y={(a[1] + b[1]) / 2 - 7}
          textAnchor="middle"
          fill={color}
        >
          {label}
        </text>
      )}
    </g>
  );
}

/**
 * Un point REMARQUABLE, dessiné par sa FORME autant que par sa couleur (§49).
 *
 *   cross  le centre / le sommet      disc   un foyer
 *   square un sommet                  ring   une intersection
 */
function FeaturePoint({
  point, toPixel, color, shape = 'disc', label = null, className = '', dataAttr = {},
}) {
  if (!C.isPoint(point)) return null;
  const [px, py] = toPixel(point);
  if (!Number.isFinite(px) || !Number.isFinite(py)) return null;

  return (
    <g className={`sa-ml-cn__feature ${className}`} {...dataAttr}>
      {shape === 'cross' && (
        <g stroke={color} strokeWidth={2.2} strokeLinecap="round">
          <line x1={px - 5} y1={py} x2={px + 5} y2={py} />
          <line x1={px} y1={py - 5} x2={px} y2={py + 5} />
        </g>
      )}
      {shape === 'square' && (
        <rect x={px - 4} y={py - 4} width={8} height={8} fill="#ffffff" stroke={color} strokeWidth={2} />
      )}
      {shape === 'disc' && <circle cx={px} cy={py} r={4.5} fill={color} stroke="#ffffff" strokeWidth={1.5} />}
      {shape === 'ring' && (
        <>
          <circle cx={px} cy={py} r={5.5} fill="#ffffff" stroke={color} strokeWidth={2.2} />
          <circle cx={px} cy={py} r={1.8} fill={color} />
        </>
      )}
      {label && (
        <text className="sa-ml-cn__featurelabel" x={px + 8} y={py - 8} fill={color}>{label}</text>
      )}
    </g>
  );
}
