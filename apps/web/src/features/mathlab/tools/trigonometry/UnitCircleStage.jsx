import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  project, unproject, arcPath, quadrantPath, inscribedTriangle, tangentGeometry,
  specialMarkers, betweenArc, wavePath, waveX, waveY, angleFromWaveX,
} from './geometry.js';
import { angleOfPoint, sinOf, cosOf, normalizeDegrees, symmetryOf } from './trigMath.js';
import { SPECIAL_DEGREES, snapToSpecial } from './exactValues.js';
import { formatDegrees, formatRatio, formatValue } from './trigFormat.js';

/**
 * LE CERCLE TRIGONOMÉTRIQUE — le héros de l'instrument (§3, §45).
 *
 * Tout ce que l'élève voit est dessiné ICI, en SVG inline, à partir de
 * valeurs que ce composant ne calcule pas : `geometry.js` traduit en pixels,
 * `trigMath.js` fournit la mathématique. Ce fichier n'a le droit que de
 * DESSINER (la règle de `VectorSceneLayer.jsx` pour les vecteurs).
 *
 * ── Le glissement (§3, §35) ──────────────────────────────────────────────
 * Le point se tire au doigt comme à la souris. Comme pour les vecteurs : un
 * disque VISIBLE de 8 px dans une cible INVISIBLE de 22 px de rayon (44 px
 * de diamètre, le minimum tactile), des écouteurs NATIFS avec capture du
 * pointeur, et `touch-action: none` pour que le doigt ne fasse pas défiler
 * la page sous lui.
 *
 * Le glissement ne pose pas l'angle brut : il conserve le TOUR courant. Si
 * l'élève est à 370° et tire le point d'un demi-degré, l'angle doit devenir
 * 370,5° — pas 10,5°. C'est ce que fait `keepTurn`, et c'est ce qui permet
 * d'explorer la périodicité à la main (§14).
 *
 * ── Le graphe est dans le même SVG ───────────────────────────────────────
 * §12 veut que le point du cercle et le marqueur du graphe soient
 * visiblement le MÊME objet. Les dessiner dans deux SVG séparés obligerait à
 * synchroniser deux systèmes de coordonnées ; ici la ligne de liaison se
 * trace d'un trait, d'un dessin à l'autre.
 */

/** Le rayon du cercle en unités mathématiques : le cercle unité en occupe 1. */
const VIEW_UNITS = 1.55;

/** La cible tactile d'une poignée (§35). */
const HIT_RADIUS = 22;

export default function UnitCircleStage({
  angle, radius, layers, valueMode, highlight, symmetry, compare,
  reducedMotion, onAngleChange, onDragEnd, onTapSpecial,
}) {
  const { t } = useTranslation('mathlab');
  const hostRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    const measure = () => {
      const rect = host.getBoundingClientRect();
      setSize((current) => (current.width === Math.round(rect.width) && current.height === Math.round(rect.height)
        ? current
        : { width: Math.round(rect.width), height: Math.round(rect.height) }));
    };
    measure();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    observer?.observe(host);

    return () => observer?.disconnect();
  }, []);

  /**
   * La géométrie de la scène : où est l'origine, combien de pixels vaut une
   * unité, et quelle part de la hauteur revient au graphe (§12).
   */
  const scene = useMemo(() => {
    const { width, height } = size;
    if (!(width > 0) || !(height > 0)) return null;
    const hasGraph = layers.sineGraph || layers.cosineGraph;
    // Le graphe prend le bas ; sur un écran étroit il en prend moins, pour
    // que le cercle — le héros — garde la place (§35, §45).
    const graphHeight = hasGraph ? Math.min(height * (width < 560 ? 0.3 : 0.34), 210) : 0;
    const circleHeight = height - graphHeight;
    const unit = Math.min(width, circleHeight) / (VIEW_UNITS * 2);

    /**
     * La gouttière SOUS le cadre du graphe.
     *
     * Les étiquettes « 0° … 360° » sont posées à `height + 14`, et une ligne
     * de texte descend encore sous sa ligne de base. Réserver moins que cela
     * les faisait sortir du SVG : elles étaient COUPÉES, ce que la QA visuelle
     * a montré là où aucune assertion ne l'aurait vu. 26 px tiennent la ligne
     * de base et la jambe du « ° ».
     */
    const GRAPH_LABELS = 26;
    const GRAPH_TOP = 10;

    return {
      width,
      height,
      unit,
      origin: { x: width / 2, y: circleHeight / 2 },
      graph: hasGraph
        ? {
          x: 34,
          y: circleHeight + GRAPH_TOP,
          width: width - 58,
          height: Math.max(40, graphHeight - GRAPH_TOP - GRAPH_LABELS),
        }
        : null,
    };
  }, [size, layers.sineGraph, layers.cosineGraph]);

  // ── Le glissement du point (§3) ────────────────────────────────────────

  const angleRef = useRef(angle);
  angleRef.current = angle;
  const handlersRef = useRef({ onAngleChange, onDragEnd });
  handlersRef.current = { onAngleChange, onDragEnd };
  const sceneRef = useRef(scene);
  sceneRef.current = scene;
  const [dragging, setDragging] = useState(false);

  /**
   * L'angle lu au doigt, ramené dans le TOUR courant (§14).
   *
   * `angleOfPoint` rend toujours [0, 360[. Sans cette correction, tirer le
   * point alors qu'on est à 370° ferait sauter l'angle à 10° — l'élève
   * perdrait son tour sans avoir rien demandé.
   */
  const keepTurn = useCallback((raw, current) => {
    if (!Number.isFinite(raw)) return current;
    const turns = Math.floor(current / 360);
    const candidates = [raw + (turns - 1) * 360, raw + turns * 360, raw + (turns + 1) * 360];

    return candidates.reduce((best, value) => (Math.abs(value - current) < Math.abs(best - current) ? value : best));
  }, []);

  const pointerToAngle = useCallback((clientX, clientY, shift) => {
    const host = hostRef.current;
    const current = sceneRef.current;
    if (!host || !current) return null;
    const rect = host.getBoundingClientRect();
    const math = unproject({ x: clientX - rect.left, y: clientY - rect.top }, current.origin, current.unit);
    const raw = angleOfPoint(math.x, math.y);
    if (!Number.isFinite(raw)) return null;
    const kept = keepTurn(raw, angleRef.current);
    // L'aimantation aux angles du manuel, que Shift désactive (§6, §28).
    const snapped = shift ? null : snapToSpecial(kept, 2.5);

    return snapped ?? kept;
  }, [keepTurn]);

  useEffect(() => {
    const host = hostRef.current;
    const handle = host?.querySelector('[data-ml-trig-handle]');
    if (!handle) return undefined;
    let active = false;

    const down = (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      event.stopPropagation();
      event.preventDefault();
      handle.setPointerCapture?.(event.pointerId);
      active = true;
      setDragging(true);
    };
    const move = (event) => {
      if (!active) return;
      event.stopPropagation();
      event.preventDefault();
      const next = pointerToAngle(event.clientX, event.clientY, event.shiftKey);
      if (next !== null) handlersRef.current.onAngleChange?.(next);
    };
    const up = (event) => {
      if (!active) return;
      active = false;
      handle.releasePointerCapture?.(event.pointerId);
      setDragging(false);
      handlersRef.current.onDragEnd?.();
    };

    handle.addEventListener('pointerdown', down);
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', up);
    handle.addEventListener('pointercancel', up);

    return () => {
      handle.removeEventListener('pointerdown', down);
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', up);
      handle.removeEventListener('pointercancel', up);
    };
  }, [pointerToAngle, scene]);

  /** Le clavier : un élève sans souris doit pouvoir tourner (§37). */
  const onHandleKey = useCallback((event) => {
    const step = event.shiftKey ? 15 : event.ctrlKey || event.metaKey ? 0.5 : 5;
    const map = { ArrowRight: step, ArrowUp: step, ArrowLeft: -step, ArrowDown: -step };
    const delta = map[event.key];
    if (delta === undefined) return;
    event.preventDefault();
    onAngleChange?.(angleRef.current + delta);
    onDragEnd?.();
  }, [onAngleChange, onDragEnd]);

  // ── Le glissement DANS LE GRAPHE (§32) : la relation marche à l'envers ──

  useEffect(() => {
    const host = hostRef.current;
    const surface = host?.querySelector('[data-ml-trig-graphsurface]');
    if (!surface || !scene?.graph) return undefined;
    let active = false;

    const toAngle = (clientX) => {
      const rect = host.getBoundingClientRect();
      const span = graphSpanRef.current;

      return angleFromWaveX(clientX - rect.left, span.from, span.to, sceneRef.current.graph);
    };
    const down = (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      event.stopPropagation();
      event.preventDefault();
      surface.setPointerCapture?.(event.pointerId);
      active = true;
      handlersRef.current.onAngleChange?.(toAngle(event.clientX));
    };
    const move = (event) => {
      if (!active) return;
      event.preventDefault();
      handlersRef.current.onAngleChange?.(toAngle(event.clientX));
    };
    const up = (event) => {
      if (!active) return;
      active = false;
      surface.releasePointerCapture?.(event.pointerId);
      handlersRef.current.onDragEnd?.();
    };

    surface.addEventListener('pointerdown', down);
    surface.addEventListener('pointermove', move);
    surface.addEventListener('pointerup', up);
    surface.addEventListener('pointercancel', up);

    return () => {
      surface.removeEventListener('pointerdown', down);
      surface.removeEventListener('pointermove', move);
      surface.removeEventListener('pointerup', up);
      surface.removeEventListener('pointercancel', up);
    };
  }, [scene]);

  /**
   * La fenêtre du graphe suit l'angle : un tour visible, recentré quand on
   * sort. Sans cela, à 700° le marqueur serait hors cadre et le lien
   * cercle ↔ graphe (§12) se casserait au moment où il devient intéressant.
   */
  const graphSpan = useMemo(() => {
    const turn = Math.floor(angle / 360);
    const from = Math.min(turn * 360, angle - 20);
    const to = Math.max((turn + 1) * 360, angle + 20);

    return { from, to };
  }, [angle]);
  const graphSpanRef = useRef(graphSpan);
  graphSpanRef.current = graphSpan;

  if (!scene) {
    return <div ref={hostRef} className="sa-ml-trig__stage-svg" data-ml-trig-stage />;
  }

  const { origin, unit } = scene;
  const r = radius;
  const cos = cosOf(angle);
  const sin = sinOf(angle);
  const point = project({ x: cos * r, y: sin * r }, origin, unit);
  const foot = project({ x: cos * r, y: 0 }, origin, unit);
  const side = project({ x: 0, y: sin * r }, origin, unit);
  const quadrant = normalizeDegrees(angle);
  const quadrantIndex = quadrant === 0 || quadrant === 90 || quadrant === 180 || quadrant === 270
    ? 0
    : Math.floor(quadrant / 90) + 1;
  const triangle = inscribedTriangle(angle, origin, unit, r);
  const tangent = layers.tangentLine ? tangentGeometry(angle, VIEW_UNITS * 1.05) : null;
  const symmetryState = symmetry ? symmetryOf(angle, symmetry) : null;
  const comparePoint = compare?.enabled
    ? project({ x: cosOf(compare.angle) * r, y: sinOf(compare.angle) * r }, origin, unit)
    : null;

  const axisEnd = VIEW_UNITS;
  const sinReading = formatRatio(angle, 'sin', sin, valueMode);
  const cosReading = formatRatio(angle, 'cos', cos, valueMode);

  return (
    <div
      ref={hostRef}
      className={`sa-ml-trig__stage-svg${dragging ? ' sa-ml-trig__stage-svg--dragging' : ''}`}
      data-ml-trig-stage
      dir="ltr"
    >
      <svg
        width={scene.width}
        height={scene.height}
        viewBox={`0 0 ${scene.width} ${scene.height}`}
        role="application"
        aria-label={t('tools.trigonometry.canvasLabel')}
        className="sa-ml-trig__svg"
      >
        <defs>
          <marker id="sa-trig-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,1 L9,5 L0,9 z" className="sa-ml-trig__arrowhead" />
          </marker>
        </defs>

        {/* ── Le quadrant teinté (§5) ─────────────────────────────────── */}
        {layers.quadrant && quadrantIndex >= 1 && (
          <path className="sa-ml-trig__quadrant" d={quadrantPath(quadrantIndex, origin, unit, r)} data-ml-trig-quadrant={quadrantIndex} />
        )}

        {/* ── La grille et les axes (§30) ──────────────────────────────── */}
        {layers.grid && <Grid origin={origin} unit={unit} extent={axisEnd} />}
        {layers.axes && <Axes origin={origin} unit={unit} extent={axisEnd} />}

        {/* ── Le cercle ────────────────────────────────────────────────── */}
        {layers.circle && (
          <circle className="sa-ml-trig__circle" cx={origin.x} cy={origin.y} r={r * unit} data-ml-trig-circle />
        )}

        {/* ── Les angles remarquables (§6) ─────────────────────────────── */}
        {layers.specialMarkers && specialMarkers(SPECIAL_DEGREES, origin, unit, r).map(({ degrees, point: marker }) => (
          <g key={degrees} className="sa-ml-trig__marker" onClick={() => onTapSpecial?.(degrees)}>
            <circle className="sa-ml-trig__marker-hit" cx={marker.x} cy={marker.y} r={16} />
            <circle className="sa-ml-trig__marker-dot" cx={marker.x} cy={marker.y} r={3.5} />
          </g>
        ))}

        {/* ── L'arc de l'angle, en spirale au-delà d'un tour (§14) ─────── */}
        {layers.arc && (
          <path className="sa-ml-trig__arc" d={arcPath(angle, origin, unit)} markerEnd="url(#sa-trig-arrow)" data-ml-trig-arc />
        )}

        {/* ── La tangente géométrique (§11) ────────────────────────────── */}
        {tangent && (
          <TangentLayer tangent={tangent} origin={origin} unit={unit} radius={r} angle={angle} extent={axisEnd} t={t} />
        )}

        {/* ── Le triangle inscrit (§8) ─────────────────────────────────── */}
        {layers.triangle && !triangle.degenerate && (
          <g data-ml-trig-triangle>
            <path
              className="sa-ml-trig__tri-fill"
              d={`M${origin.x},${origin.y} L${foot.x},${foot.y} L${point.x},${point.y} Z`}
            />
            <path className="sa-ml-trig__rightangle" d={triangle.rightAngle} />
          </g>
        )}

        {/* ── Les projections (§3) ─────────────────────────────────────── */}
        {layers.projections && (
          <g className="sa-ml-trig__projections">
            <line className="sa-ml-trig__proj" x1={point.x} y1={point.y} x2={foot.x} y2={foot.y} />
            <line className="sa-ml-trig__proj" x1={point.x} y1={point.y} x2={side.x} y2={side.y} />
          </g>
        )}

        {/* ── cos sur l'axe des x, sin sur l'axe des y (§3, §10) ───────── */}
        {layers.cosSegment && Math.abs(cos) > 1e-6 && (
          <line
            className={`sa-ml-trig__cos${highlight === 'cos' ? ' sa-ml-trig__seg--on' : ''}${highlight && highlight !== 'cos' ? ' sa-ml-trig__seg--off' : ''}`}
            x1={origin.x} y1={origin.y} x2={foot.x} y2={foot.y}
            data-ml-trig-cosseg
          />
        )}
        {layers.sinSegment && Math.abs(sin) > 1e-6 && (
          <line
            className={`sa-ml-trig__sin${highlight === 'sin' ? ' sa-ml-trig__seg--on' : ''}${highlight && highlight !== 'sin' ? ' sa-ml-trig__seg--off' : ''}`}
            x1={foot.x} y1={foot.y} x2={point.x} y2={point.y}
            data-ml-trig-sinseg
          />
        )}

        {/* ── Le second angle de la comparaison (§33) ──────────────────── */}
        {comparePoint && (
          <g className="sa-ml-trig__compare" data-ml-trig-compare>
            <path className="sa-ml-trig__compare-arc" d={betweenArc(angle, compare.angle, origin, unit, r * 0.42)} />
            <line className="sa-ml-trig__compare-radius" x1={origin.x} y1={origin.y} x2={comparePoint.x} y2={comparePoint.y} />
            <circle className="sa-ml-trig__compare-dot" cx={comparePoint.x} cy={comparePoint.y} r={7} />
            <text className="sa-ml-trig__compare-label" x={comparePoint.x + 12} y={comparePoint.y - 10}>
              {formatDegrees(compare.angle, 0)}
            </text>
          </g>
        )}

        {/* ── La symétrie (§21) ────────────────────────────────────────── */}
        {symmetryState && (
          <SymmetryLayer state={symmetryState} origin={origin} unit={unit} radius={r} />
        )}

        {/* ── Le rayon ─────────────────────────────────────────────────── */}
        {layers.radius && (
          <line className="sa-ml-trig__radius" x1={origin.x} y1={origin.y} x2={point.x} y2={point.y} data-ml-trig-radius />
        )}

        {/* ── LE POINT : ce qu'on tire (§3, §46) ───────────────────────── */}
        <g
          data-ml-trig-handle
          className={`sa-ml-trig__handle${dragging ? ' sa-ml-trig__handle--dragging' : ''}`}
          tabIndex={0}
          role="slider"
          aria-label={t('tools.trigonometry.pointLabel')}
          aria-valuemin={-720}
          aria-valuemax={1080}
          aria-valuenow={Math.round(angle * 10) / 10}
          aria-valuetext={t('tools.trigonometry.pointValueText', {
            angle: formatDegrees(angle, 1),
            sin: sinReading.text,
            cos: cosReading.text,
          })}
          onKeyDown={onHandleKey}
        >
          <circle className="sa-ml-trig__hit" cx={point.x} cy={point.y} r={HIT_RADIUS} />
          <circle className="sa-ml-trig__halo" cx={point.x} cy={point.y} r={15} />
          <circle className="sa-ml-trig__dot" cx={point.x} cy={point.y} r={8} />
        </g>

        {/* ── Les coordonnées, posées près du point (§3, §31) ────────────
            L'étiquette suit le point, mais ne SORT PAS du cadre : à gauche
            de l'écran elle bascule de l'autre côté de la poignée. Sans cette
            retenue, « (−0,66 ; −0,75) » se retrouvait à moitié hors du SVG
            dès que le point passait dans les quadrants de gauche — ce que la
            QA visuelle a montré. */}
        {layers.coordinates && (() => {
          const label = `(${cosReading.text} ; ${sinReading.text})`;
          // Une largeur approchée suffit : on ne mesure pas du texte SVG pour
          // décider d'un côté, on garde une marge franche.
          const estimated = label.length * 7.5;
          const preferStart = cos >= 0;
          const wouldOverflowEnd = point.x + 16 + estimated > scene.width - 8;
          const wouldOverflowStart = point.x - 16 - estimated < 8;
          const toStart = preferStart ? !wouldOverflowEnd : wouldOverflowStart;

          return (
            <text
              className="sa-ml-trig__pointlabel"
              x={point.x + (toStart ? 16 : -16)}
              y={Math.max(18, Math.min(scene.height - 8, point.y + (sin >= 0 ? -16 : 24)))}
              textAnchor={toStart ? 'start' : 'end'}
              data-ml-trig-pointlabel
            >
              {label}
            </text>
          );
        })()}

        {/* ── Le graphe, dans le MÊME svg (§12, §32) ───────────────────── */}
        {scene.graph && (
          <GraphLayer
            box={scene.graph}
            span={graphSpan}
            angle={angle}
            layers={layers}
            reducedMotion={reducedMotion}
            t={t}
          />
        )}
      </svg>
    </div>
  );
}

/** La grille : discrète, jamais au premier plan (§45). */
function Grid({ origin, unit, extent }) {
  const lines = [];
  for (let i = -Math.ceil(extent); i <= Math.ceil(extent); i += 1) {
    if (i === 0) continue;
    const h = project({ x: 0, y: i }, origin, unit);
    const v = project({ x: i, y: 0 }, origin, unit);
    lines.push(
      <line key={`h${i}`} className="sa-ml-trig__gridline" x1={origin.x - extent * unit} y1={h.y} x2={origin.x + extent * unit} y2={h.y} />,
      <line key={`v${i}`} className="sa-ml-trig__gridline" x1={v.x} y1={origin.y - extent * unit} x2={v.x} y2={origin.y + extent * unit} />,
    );
  }
  // Les demi-unités : ce sont elles qui portent 1/2, la valeur du manuel.
  for (const half of [-0.5, 0.5]) {
    const h = project({ x: 0, y: half }, origin, unit);
    const v = project({ x: half, y: 0 }, origin, unit);
    lines.push(
      <line key={`hh${half}`} className="sa-ml-trig__gridline sa-ml-trig__gridline--half" x1={origin.x - extent * unit} y1={h.y} x2={origin.x + extent * unit} y2={h.y} />,
      <line key={`vh${half}`} className="sa-ml-trig__gridline sa-ml-trig__gridline--half" x1={v.x} y1={origin.y - extent * unit} x2={v.x} y2={origin.y + extent * unit} />,
    );
  }

  return <g>{lines}</g>;
}

/** Les axes, nommés `x` et `y`, avec `O` à l'origine — la convention du manuel. */
function Axes({ origin, unit, extent }) {
  const span = extent * unit;

  return (
    <g className="sa-ml-trig__axes">
      <line className="sa-ml-trig__axis" x1={origin.x - span} y1={origin.y} x2={origin.x + span} y2={origin.y} markerEnd="url(#sa-trig-arrow)" />
      <line className="sa-ml-trig__axis" x1={origin.x} y1={origin.y + span} x2={origin.x} y2={origin.y - span} markerEnd="url(#sa-trig-arrow)" />
      <text className="sa-ml-trig__axisname" x={origin.x + span - 6} y={origin.y + 20} textAnchor="end">x</text>
      <text className="sa-ml-trig__axisname" x={origin.x - 10} y={origin.y - span + 14} textAnchor="end">y</text>
      <text className="sa-ml-trig__axisname" x={origin.x - 8} y={origin.y + 18} textAnchor="end">O</text>
      {[-1, 1].map((i) => (
        <g key={i}>
          <text className="sa-ml-trig__tick" x={origin.x + i * unit} y={origin.y + 18} textAnchor="middle">{i === 1 ? '1' : '−1'}</text>
          <text className="sa-ml-trig__tick" x={origin.x - 10} y={origin.y - i * unit + 4} textAnchor="end">{i === 1 ? '1' : '−1'}</text>
        </g>
      ))}
    </g>
  );
}

/**
 * LA TANGENTE (§11) — la droite d'abscisse 1 et le point qu'y coupe le rayon.
 *
 * Quand `cos θ = 0`, il n'y a pas d'intersection : on dessine la droite, le
 * rayon PARALLÈLE à elle, et le mot « non définie ». C'est la leçon entière
 * en une image — pas un très grand nombre, une absence d'intersection.
 */
function TangentLayer({ tangent, origin, unit, radius, angle, extent, t }) {
  const lineX = project({ x: 1, y: 0 }, origin, unit).x;
  const top = origin.y - extent * unit;
  const bottom = origin.y + extent * unit;

  if (!tangent.defined) {
    return (
      <g className="sa-ml-trig__tangent sa-ml-trig__tangent--undefined" data-ml-trig-tangent="undefined">
        <line className="sa-ml-trig__tangentline" x1={lineX} y1={top} x2={lineX} y2={bottom} />
        <text className="sa-ml-trig__tangentlabel" x={lineX + 10} y={top + 24}>{t('tools.trigonometry.tanUndefinedShort')}</text>
      </g>
    );
  }

  const hit = project({ x: 1, y: tangent.y }, origin, unit);
  const ray = project({ x: cosOf(angle) * radius, y: sinOf(angle) * radius }, origin, unit);

  return (
    <g className="sa-ml-trig__tangent" data-ml-trig-tangent={tangent.clipped ? 'clipped' : 'defined'}>
      <line className="sa-ml-trig__tangentline" x1={lineX} y1={top} x2={lineX} y2={bottom} />
      {/* Le prolongement du rayon jusqu'à la droite : c'est LUI qui coupe. */}
      <line className="sa-ml-trig__tangentray" x1={origin.x} y1={origin.y} x2={hit.x} y2={hit.y} />
      <line className="sa-ml-trig__tangentseg" x1={lineX} y1={origin.y} x2={hit.x} y2={hit.y} />
      <circle className="sa-ml-trig__tangentdot" cx={hit.x} cy={hit.y} r={5} />
      {/* L'écrêtage est DIT, jamais masqué (§11). */}
      {tangent.clipped && (
        <text className="sa-ml-trig__tangentlabel" x={hit.x + 10} y={hit.y + (tangent.y > 0 ? 16 : -8)}>
          {t('tools.trigonometry.tanOffScreen')}
        </text>
      )}
      <circle className="sa-ml-trig__tangentray-dot" cx={ray.x} cy={ray.y} r={3} />
    </g>
  );
}

/** Le point symétrique (§21) : dessiné en même temps que l'original, pour qu'on VOIE la symétrie. */
function SymmetryLayer({ state, origin, unit, radius }) {
  const image = project({ x: cosOf(state.image) * radius, y: sinOf(state.image) * radius }, origin, unit);
  const source = project({ x: cosOf(state.source) * radius, y: sinOf(state.source) * radius }, origin, unit);

  return (
    <g className="sa-ml-trig__symmetry" data-ml-trig-symmetry={state.kind}>
      <line className="sa-ml-trig__symmetry-link" x1={source.x} y1={source.y} x2={image.x} y2={image.y} />
      <line className="sa-ml-trig__symmetry-radius" x1={origin.x} y1={origin.y} x2={image.x} y2={image.y} />
      <circle className="sa-ml-trig__symmetry-dot" cx={image.x} cy={image.y} r={7} />
    </g>
  );
}

/**
 * LE GRAPHE (§12, §13, §32).
 *
 * L'abscisse est l'angle, l'ordonnée la valeur. Le marqueur est le MÊME
 * point mathématique que celui du cercle, vu autrement — d'où le trait de
 * liaison, qui rend le lien littéral plutôt que théorique.
 */
function GraphLayer({ box, span, angle, layers }) {
  const mid = waveY(0, box);
  const ticks = useMemo(() => {
    const out = [];
    const first = Math.ceil(span.from / 90) * 90;
    for (let degrees = first; degrees <= span.to; degrees += 90) {
      out.push(degrees);
    }

    return out;
  }, [span.from, span.to]);

  return (
    <g className="sa-ml-trig__graph" data-ml-trig-graph>
      <rect className="sa-ml-trig__graphbg" x={box.x} y={box.y} width={box.width} height={box.height} rx={10} />
      <line className="sa-ml-trig__graphaxis" x1={box.x} y1={mid} x2={box.x + box.width} y2={mid} />

      {ticks.map((degrees) => {
        const x = waveX(degrees, span.from, span.to, box);

        return (
          <g key={degrees}>
            <line className="sa-ml-trig__graphtick" x1={x} y1={box.y} x2={x} y2={box.y + box.height} />
            <text className="sa-ml-trig__graphticklabel" x={x} y={box.y + box.height + 14} textAnchor="middle">
              {formatValue(degrees, 0)}°
            </text>
          </g>
        );
      })}

      <text className="sa-ml-trig__graphaxislabel" x={box.x - 8} y={waveY(1, box) + 4} textAnchor="end">1</text>
      <text className="sa-ml-trig__graphaxislabel" x={box.x - 8} y={waveY(-1, box) + 4} textAnchor="end">−1</text>

      {/* La courbe est dessinée JUSQU'À l'angle courant : c'est l'onde qui
          naît du mouvement circulaire (§13), pas une courbe posée d'avance. */}
      {layers.sineGraph && (
        <>
          <path className="sa-ml-trig__wave sa-ml-trig__wave--ghost" d={wavePath(sinOf, span.from, span.to, box)} />
          <path className="sa-ml-trig__wave sa-ml-trig__wave--sin" d={wavePath(sinOf, span.from, Math.min(angle, span.to), box, 240, span)} data-ml-trig-sinwave />
        </>
      )}
      {layers.cosineGraph && (
        <>
          <path className="sa-ml-trig__wave sa-ml-trig__wave--ghost" d={wavePath(cosOf, span.from, span.to, box)} />
          <path className="sa-ml-trig__wave sa-ml-trig__wave--cos" d={wavePath(cosOf, span.from, Math.min(angle, span.to), box, 240, span)} data-ml-trig-coswave />
        </>
      )}

      {/* Le marqueur, et la verticale qui dit « c'est le même angle ». */}
      {angle >= span.from && angle <= span.to && (
        <g className="sa-ml-trig__graphmarker">
          <line
            className="sa-ml-trig__graphcursor"
            x1={waveX(angle, span.from, span.to, box)} y1={box.y}
            x2={waveX(angle, span.from, span.to, box)} y2={box.y + box.height}
          />
          {layers.sineGraph && (
            <circle
              className="sa-ml-trig__graphdot sa-ml-trig__graphdot--sin"
              cx={waveX(angle, span.from, span.to, box)}
              cy={waveY(sinOf(angle), box)}
              r={5}
              data-ml-trig-sindot
            />
          )}
          {layers.cosineGraph && (
            <circle
              className="sa-ml-trig__graphdot sa-ml-trig__graphdot--cos"
              cx={waveX(angle, span.from, span.to, box)}
              cy={waveY(cosOf(angle), box)}
              r={5}
              data-ml-trig-cosdot
            />
          )}
        </g>
      )}

      {/* La surface de préhension : glisser ICI change l'angle (§32). */}
      <rect
        className="sa-ml-trig__graphsurface"
        x={box.x} y={box.y} width={box.width} height={box.height}
        data-ml-trig-graphsurface
        role="presentation"
      />
    </g>
  );
}
