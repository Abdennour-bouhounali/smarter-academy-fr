import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { freeTriangle } from './geometry.js';
import { solveRightTriangle, ratiosFromTriangle } from './trigMath.js';
import { formatDegrees, formatLength, formatRatio } from './trigFormat.js';

/**
 * LE TRIANGLE RECTANGLE (§9, §10) — le sujet 4.2 du programme algérien.
 *
 * C'est ici que vit « النسب المثلثية في مثلث قائم : جيب · جيب تمام · ظل
 * زاوية حادة » (ALGERIA_4AM_CURRICULUM §4.2), et c'est pour cela que
 * l'instrument OUVRE sur ce mode : le cercle trigonométrique appartient au
 * lycée, le triangle est le programme de l'élève de 4AM. Le cercle reste à
 * un clic — on ne prive personne — mais le premier écran est celui du
 * manuel (la règle que §5f.10 tient pour le produit scalaire des أشعة).
 *
 * ── Ce qu'on tire ────────────────────────────────────────────────────────
 * Le sommet libre se glisse (§9 : « The student should be able to drag a
 * triangle control and see the sides change »). Le glissement modifie les
 * DEUX côtés de l'angle droit, donc l'angle et l'hypoténuse suivent — et le
 * panneau montre les trois rapports changer sous le doigt.
 *
 * ── SOH-CAH-TOA (§10) ────────────────────────────────────────────────────
 * §10 est explicite : « Do not merely display the acronym. » Sélectionner
 * un rapport ALLUME ses deux côtés sur le dessin et éteint le troisième :
 * on ne lit pas « sin = opp/hyp », on VOIT quels segments sont en jeu.
 */

const MIN_DRAG_SIDE = 0.6;
const MAX_DRAG_SIDE = 40;

export default function TriangleStage({ triangle, valueMode, highlight, onTriangleChange, onDragEnd }) {
  const { t } = useTranslation('mathlab');
  const hostRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [dragging, setDragging] = useState(false);

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
   * Le triangle RÉSOLU : jamais recalculé dans le JSX (§39).
   *
   * Une configuration impossible — hypoténuse plus courte qu'un côté, angle
   * droit demandé — ne casse pas l'écran : elle rend `ok: false` et
   * l'interface affiche la raison. C'est le cas que §9 laisse arriver dès
   * qu'on laisse l'élève taper ses propres valeurs.
   */
  const solved = useMemo(() => solveRightTriangle(triangle.given, triangle), [triangle]);
  const ratios = useMemo(() => (solved.ok ? ratiosFromTriangle(solved) : null), [solved]);

  const box = useMemo(() => ({
    x: 0, y: 0, width: size.width, height: size.height,
  }), [size]);

  const drawing = useMemo(
    () => (solved.ok && size.width > 0 ? freeTriangle(solved, box) : null),
    [solved, box, size.width],
  );

  // ── Le glissement du sommet libre (§9) ────────────────────────────────

  const drawingRef = useRef(drawing);
  drawingRef.current = drawing;
  const solvedRef = useRef(solved);
  solvedRef.current = solved;
  const handlersRef = useRef({ onTriangleChange, onDragEnd });
  handlersRef.current = { onTriangleChange, onDragEnd };

  useEffect(() => {
    const host = hostRef.current;
    const handle = host?.querySelector('[data-ml-trig-trihandle]');
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
      event.preventDefault();
      const current = drawingRef.current;
      const host2 = hostRef.current;
      if (!current || !host2) return;
      const rect = host2.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      // Les deux côtés de l'angle droit, relus en unités du triangle.
      const adjacent = (current.vertexRight.x - current.vertexAngle.x) / current.scale;
      const oppositeRaw = (current.vertexAngle.y - y) / current.scale;
      const adjacentRaw = (x - current.vertexAngle.x) / current.scale;
      const clamp = (v) => Math.max(MIN_DRAG_SIDE, Math.min(MAX_DRAG_SIDE, v));

      handlersRef.current.onTriangleChange?.({
        given: 'opp-adj',
        opposite: Math.round(clamp(oppositeRaw) * 10) / 10,
        adjacent: Math.round(clamp(Number.isFinite(adjacentRaw) ? adjacentRaw : adjacent) * 10) / 10,
      });
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
  }, [drawing]);

  const onHandleKey = useCallback((event) => {
    const step = event.shiftKey ? 1 : 0.1;
    const current = solvedRef.current;
    if (!current.ok) return;
    const map = {
      ArrowUp: { opposite: current.opposite + step, adjacent: current.adjacent },
      ArrowDown: { opposite: current.opposite - step, adjacent: current.adjacent },
      ArrowRight: { opposite: current.opposite, adjacent: current.adjacent + step },
      ArrowLeft: { opposite: current.opposite, adjacent: current.adjacent - step },
    };
    const next = map[event.key];
    if (!next) return;
    event.preventDefault();
    onTriangleChange?.({
      given: 'opp-adj',
      opposite: Math.max(MIN_DRAG_SIDE, Math.round(next.opposite * 10) / 10),
      adjacent: Math.max(MIN_DRAG_SIDE, Math.round(next.adjacent * 10) / 10),
    });
    onDragEnd?.();
  }, [onTriangleChange, onDragEnd]);

  if (!solved.ok) {
    return (
      <div ref={hostRef} className="sa-ml-trig__stage-svg" data-ml-trig-stage>
        <p className="sa-ml-trig__impossible" role="status" data-ml-trig-impossible>
          {t(`tools.trigonometry.triangleErrors.${solved.reason}`)}
        </p>
      </div>
    );
  }

  // Un côté appartient à DEUX rapports : opposé est dans sin et dans tan.
  const oppositeClass = highlight === 'sin' || highlight === 'tan' ? ' sa-ml-trig__side--on' : highlight ? ' sa-ml-trig__side--off' : '';
  const adjacentClass = highlight === 'cos' || highlight === 'tan' ? ' sa-ml-trig__side--on' : highlight ? ' sa-ml-trig__side--off' : '';
  const hypotenuseClass = highlight === 'sin' || highlight === 'cos' ? ' sa-ml-trig__side--on' : highlight ? ' sa-ml-trig__side--off' : '';

  return (
    <div
      ref={hostRef}
      className={`sa-ml-trig__stage-svg${dragging ? ' sa-ml-trig__stage-svg--dragging' : ''}`}
      data-ml-trig-stage
      dir="ltr"
    >
      {drawing && (
        <svg
          width={size.width}
          height={size.height}
          viewBox={`0 0 ${size.width} ${size.height}`}
          role="application"
          aria-label={t('tools.trigonometry.triangleCanvasLabel')}
          className="sa-ml-trig__svg"
        >
          <path
            className="sa-ml-trig__tri-fill"
            d={`M${drawing.vertexAngle.x},${drawing.vertexAngle.y} L${drawing.vertexRight.x},${drawing.vertexRight.y} L${drawing.vertexTop.x},${drawing.vertexTop.y} Z`}
            data-ml-trig-tri
          />

          {/* Le côté ADJACENT à θ — la base. */}
          <line
            className={`sa-ml-trig__side sa-ml-trig__side--adj${adjacentClass}`}
            x1={drawing.vertexAngle.x} y1={drawing.vertexAngle.y}
            x2={drawing.vertexRight.x} y2={drawing.vertexRight.y}
            data-ml-trig-side="adjacent"
          />
          {/* Le côté OPPOSÉ à θ — la hauteur. */}
          <line
            className={`sa-ml-trig__side sa-ml-trig__side--opp${oppositeClass}`}
            x1={drawing.vertexRight.x} y1={drawing.vertexRight.y}
            x2={drawing.vertexTop.x} y2={drawing.vertexTop.y}
            data-ml-trig-side="opposite"
          />
          {/* L'HYPOTÉNUSE — face à l'angle droit. */}
          <line
            className={`sa-ml-trig__side sa-ml-trig__side--hyp${hypotenuseClass}`}
            x1={drawing.vertexAngle.x} y1={drawing.vertexAngle.y}
            x2={drawing.vertexTop.x} y2={drawing.vertexTop.y}
            data-ml-trig-side="hypotenuse"
          />

          <path className="sa-ml-trig__rightangle" d={drawing.rightAngle} />

          {/* L'arc de θ, au sommet de gauche. */}
          <path
            className="sa-ml-trig__tri-arc"
            d={describeAngleArc(drawing)}
            data-ml-trig-triarc
          />
          {/* θ tient DANS l'arc ; sa mesure est posée plus loin, au-dessus.
              Les deux au même endroit se chevauchaient (« 30°θ » collés),
              ce que la QA visuelle a montré. */}
          <text
            className="sa-ml-trig__tri-theta"
            x={drawing.vertexAngle.x + 40}
            y={drawing.vertexAngle.y - 8}
          >
            θ
          </text>

          {/* Les longueurs, posées le long de chaque côté. */}
          <text
            className="sa-ml-trig__sidelabel"
            x={(drawing.vertexAngle.x + drawing.vertexRight.x) / 2}
            y={drawing.vertexAngle.y + 22}
            textAnchor="middle"
            data-ml-trig-len="adjacent"
          >
            {formatLength(solved.adjacent)}
          </text>
          <text
            className="sa-ml-trig__sidelabel"
            x={drawing.vertexRight.x + 14}
            y={(drawing.vertexRight.y + drawing.vertexTop.y) / 2}
            data-ml-trig-len="opposite"
          >
            {formatLength(solved.opposite)}
          </text>
          <text
            className="sa-ml-trig__sidelabel"
            x={(drawing.vertexAngle.x + drawing.vertexTop.x) / 2 - 16}
            y={(drawing.vertexAngle.y + drawing.vertexTop.y) / 2 - 8}
            textAnchor="end"
            data-ml-trig-len="hypotenuse"
          >
            {formatLength(solved.hypotenuse)}
          </text>

          {/* L'angle en degrés, lu sur le dessin. */}
          <text
            className="sa-ml-trig__tri-anglelabel"
            x={drawing.vertexAngle.x + 8}
            y={drawing.vertexAngle.y - 44}
            data-ml-trig-angle
          >
            {formatDegrees(solved.angle, 1)}
          </text>

          {/* LE SOMMET QU'ON TIRE (§9). */}
          <g
            data-ml-trig-trihandle
            className={`sa-ml-trig__handle${dragging ? ' sa-ml-trig__handle--dragging' : ''}`}
            tabIndex={0}
            role="slider"
            aria-label={t('tools.trigonometry.triangleHandleLabel')}
            aria-valuemin={1}
            aria-valuemax={89}
            aria-valuenow={Math.round(solved.angle * 10) / 10}
            aria-valuetext={t('tools.trigonometry.triangleValueText', {
              angle: formatDegrees(solved.angle, 1),
              opposite: formatLength(solved.opposite),
              adjacent: formatLength(solved.adjacent),
              hypotenuse: formatLength(solved.hypotenuse),
            })}
            onKeyDown={onHandleKey}
          >
            <circle className="sa-ml-trig__hit" cx={drawing.vertexTop.x} cy={drawing.vertexTop.y} r={22} />
            <circle className="sa-ml-trig__halo" cx={drawing.vertexTop.x} cy={drawing.vertexTop.y} r={15} />
            <circle className="sa-ml-trig__dot" cx={drawing.vertexTop.x} cy={drawing.vertexTop.y} r={8} />
          </g>
        </svg>
      )}

      {/* Le rapport mis en avant, écrit avec SES côtés (§10). */}
      {highlight && ratios && (
        <div className="sa-ml-trig__formula" dir="ltr" data-ml-trig-formula={highlight}>
          <span className="sa-ml-trig__formula-name">{highlight}(θ)</span>
          <span className="sa-ml-trig__formula-eq">=</span>
          <span className="sa-ml-trig__formula-frac">
            <span className="sa-ml-trig__formula-num">
              {t(`tools.trigonometry.sides.${highlight === 'cos' ? 'adjacent' : 'opposite'}`)}
            </span>
            <span className="sa-ml-trig__formula-bar" />
            <span className="sa-ml-trig__formula-den">
              {t(`tools.trigonometry.sides.${highlight === 'tan' ? 'adjacent' : 'hypotenuse'}`)}
            </span>
          </span>
          <span className="sa-ml-trig__formula-eq">=</span>
          <span className="sa-ml-trig__formula-frac">
            <span className="sa-ml-trig__formula-num">
              {formatLength(highlight === 'cos' ? solved.adjacent : solved.opposite)}
            </span>
            <span className="sa-ml-trig__formula-bar" />
            <span className="sa-ml-trig__formula-den">
              {formatLength(highlight === 'tan' ? solved.adjacent : solved.hypotenuse)}
            </span>
          </span>
          <span className="sa-ml-trig__formula-eq">=</span>
          <span className="sa-ml-trig__formula-value">
            {formatRatio(solved.angle, highlight, ratios[highlight], valueMode).text}
          </span>
        </div>
      )}
    </div>
  );
}

/** L'arc de θ au sommet de gauche : un quart de tour vers le haut, rayon fixe. */
function describeAngleArc(drawing) {
  const r = 30;
  const { vertexAngle, vertexTop, vertexRight } = drawing;
  const toRight = Math.atan2(vertexRight.y - vertexAngle.y, vertexRight.x - vertexAngle.x);
  const toTop = Math.atan2(vertexTop.y - vertexAngle.y, vertexTop.x - vertexAngle.x);
  const from = { x: vertexAngle.x + Math.cos(toRight) * r, y: vertexAngle.y + Math.sin(toRight) * r };
  const to = { x: vertexAngle.x + Math.cos(toTop) * r, y: vertexAngle.y + Math.sin(toTop) * r };

  return `M${from.x.toFixed(1)},${from.y.toFixed(1)} A${r},${r} 0 0 0 ${to.x.toFixed(1)},${to.y.toFixed(1)}`;
}
