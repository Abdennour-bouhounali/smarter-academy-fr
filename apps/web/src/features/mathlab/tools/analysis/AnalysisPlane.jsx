import {
  forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Mafs, Coordinates, useTransformContext, vec } from 'mafs';
import 'mafs/core.css';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { fitViewportToAspect, zoomViewport, pixelToMath, resizeViewport } from '../functionGrapher/viewport.js';
import { gridStepFor } from '../functionGrapher/gridStep.js';
import { formatAxisLabel } from '../functionGrapher/grapherFormat.js';
import { useViewportGestures, ZOOM_STEP } from '../functionGrapher/useViewportGestures.js';

/** Après un geste, la fenêtre est remise au document une fois le calme revenu. */
const REPORT_VIEW_MS = 400;

const FALLBACK_VIEWPORT = Object.freeze({ xMin: -6, xMax: 6, yMin: -4, yMax: 4 });

/**
 * LE PLAN du مختبر التحليل.
 *
 * MATH_LAB §3 et §33 du cahier des charges sont catégoriques : « Do NOT
 * create a second incompatible coordinate system. » Ce composant n'en crée
 * pas. La CAMÉRA (viewport.js), le PAS DE GRILLE (gridStep.js), les GESTES
 * (useViewportGestures.js) et le FORMAT des étiquettes (grapherFormat.js)
 * sont les modules du grapheur, importés tels quels — un seul repère sur la
 * plateforme, un seul zoom, un seul pincement, une seule graduation. C'est
 * ce que `vectors/VectorPlane.jsx`, `sequences/SequencePlane.jsx`,
 * `transformations/TransformPlane.jsx` et `conics/ConicPlane.jsx` ont fait
 * avant lui.
 *
 * Le repère est ORTHONORMÉ (`resizeViewport` fixe la hauteur depuis la
 * largeur) : ici, contrairement aux suites, l'abscisse et l'ordonnée sont
 * deux LONGUEURS du même plan, et une pente de 1 doit se voir à 45°. Sans
 * cela, « le coefficient directeur est la pente » cesse d'être vrai à l'œil,
 * et c'est toute la leçon de la sécante qui s'effondre.
 *
 * Le plan est `dir="ltr"` : c'est des mathématiques (§39). L'axe des
 * abscisses croît vers la DROITE même quand l'interface est en arabe. Seuls
 * les panneaux suivent la direction de la page.
 *
 * Les enfants sont rendus dans le SVG de mafs par `children` (une fonction
 * qui reçoit la fenêtre) : le plan ne sait rien de l'analyse, il sait
 * dessiner un repère et écouter des gestes.
 */
const AnalysisPlane = forwardRef(function AnalysisPlane({
  initialViewport, grid = true, onViewportChange, onTap, canvasLabel = null,
  defaultViewport = FALLBACK_VIEWPORT, children,
}, ref) {
  const { t } = useTranslation('mathlab');
  const hostRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [view, setViewState] = useState(null);
  const viewRef = useRef(null);
  const sizeRef = useRef(size);
  const reportTimer = useRef(null);
  const onViewportChangeRef = useRef(onViewportChange);
  onViewportChangeRef.current = onViewportChange;
  sizeRef.current = size;
  viewRef.current = view;

  // ── La boîte ────────────────────────────────────────────────────────────
  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    const measure = () => {
      const rect = host.getBoundingClientRect();
      const next = { width: Math.round(rect.width), height: Math.round(rect.height) };
      setSize((current) => (current.width === next.width && current.height === next.height ? current : next));
    };
    measure();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    observer?.observe(host);

    return () => observer?.disconnect();
  }, []);

  /**
   * La fenêtre, ajustée à la boîte — TOUJOURS orthonormée.
   *
   * À l'ouverture on ÉLARGIT (`fitViewportToAspect`) pour montrer au moins ce
   * que la fenêtre demandée contient ; à chaque redimensionnement ensuite on
   * garde l'étendue en x choisie par l'élève et on recalcule y
   * (`resizeViewport`), sans élargir sans fin.
   */
  const fittedRef = useRef(false);
  useLayoutEffect(() => {
    if (!(size.width > 0 && size.height > 0)) return;
    setViewState((current) => {
      if (!current) {
        fittedRef.current = true;

        return fitViewportToAspect(initialViewport ?? defaultViewport, size.width, size.height);
      }

      return resizeViewport(current, size.width, size.height);
    });
    // initialViewport et defaultViewport ne comptent qu'à l'ouverture.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.width, size.height]);

  // Une fenêtre imposée de l'extérieur (un préréglage, un défi qui recadre)
  // remplace celle en cours.
  const requestedRef = useRef(null);
  useLayoutEffect(() => {
    if (!initialViewport) return;
    const key = `${initialViewport.xMin},${initialViewport.xMax},${initialViewport.yMin},${initialViewport.yMax}`;
    if (requestedRef.current === key) return;
    requestedRef.current = key;
    const { width, height } = sizeRef.current;
    if (!(width > 0 && height > 0)) return;
    setViewState(fitViewportToAspect(initialViewport, width, height));
  }, [initialViewport]);

  const applyGesture = useCallback((updater) => {
    setViewState((current) => {
      if (!current) return current;
      const next = updater(current);
      viewRef.current = next;

      return next;
    });
    clearTimeout(reportTimer.current);
    reportTimer.current = setTimeout(() => {
      if (viewRef.current) onViewportChangeRef.current?.(viewRef.current);
    }, REPORT_VIEW_MS);
  }, []);

  useEffect(() => () => clearTimeout(reportTimer.current), []);

  const resetView = useCallback(() => {
    const { width, height } = sizeRef.current;
    const base = initialViewport ?? defaultViewport;
    requestedRef.current = null;
    applyGesture(() => (width > 0 ? fitViewportToAspect(base, width, height) : { ...base }));
  }, [applyGesture, defaultViewport, initialViewport]);

  const zoomBy = useCallback((factor) => applyGesture((current) => zoomViewport(current, factor)), [applyGesture]);

  const handleTap = useCallback(([x, y]) => onTap?.([x, y]), [onTap]);

  useViewportGestures(hostRef, {
    getView: () => viewRef.current ?? defaultViewport,
    getSize: () => sizeRef.current,
    setView: applyGesture,
    onTap: handleTap,
    onReset: resetView,
  });

  useImperativeHandle(ref, () => ({
    getSvgElement: () => hostRef.current?.querySelector('svg') ?? null,
    getView: () => viewRef.current,
    getSize: () => sizeRef.current,
    resetView,
    /** Pixels de l'écran → coordonnées du plan : ce dont un glissement a besoin. */
    toMath: (clientX, clientY) => {
      const host = hostRef.current;
      const current = viewRef.current;
      const { width, height } = sizeRef.current;
      if (!host || !current || !(width > 0)) return null;
      const rect = host.getBoundingClientRect();

      return pixelToMath(current, width, height, clientX - rect.left, clientY - rect.top);
    },
  }), [resetView]);

  const pixelsPerUnitX = view && size.width > 0 ? size.width / (view.xMax - view.xMin) : 60;
  const pixelsPerUnitY = view && size.height > 0 ? size.height / (view.yMax - view.yMin) : 60;
  const xGrid = useMemo(() => gridStepFor(pixelsPerUnitX), [pixelsPerUnitX]);
  const yGrid = useMemo(() => gridStepFor(pixelsPerUnitY), [pixelsPerUnitY]);

  return (
    <div
      ref={hostRef}
      className={`sa-ml-an__plane${grid ? '' : ' sa-ml-an__plane--nogrid'}`}
      tabIndex={0}
      role="application"
      aria-label={canvasLabel ?? t('tools.analysis.canvasLabel')}
      dir="ltr"
      data-ml-plane
      data-ml-an-plane
      data-ml-view={view ? [view.xMin, view.xMax, view.yMin, view.yMax].map((value) => value.toFixed(4)).join(',') : ''}
    >
      {view && size.width > 0 && size.height > 0 && (
        <Mafs
          width={size.width}
          height={size.height}
          pan={false}
          zoom={false}
          preserveAspectRatio={false}
          viewBox={{ x: [view.xMin, view.xMax], y: [view.yMin, view.yMax], padding: 0 }}
        >
          {grid && (
            <Coordinates.Cartesian
              xAxis={{ lines: xGrid.step, labels: formatAxisLabel, subdivisions: xGrid.subdivisions }}
              yAxis={{ lines: yGrid.step, labels: formatAxisLabel, subdivisions: yGrid.subdivisions }}
            />
          )}
          {!grid && (
            <Coordinates.Cartesian
              xAxis={{ lines: false, labels: formatAxisLabel }}
              yAxis={{ lines: false, labels: formatAxisLabel }}
              subdivisions={false}
            />
          )}
          <AxisNames view={view} />
          {typeof children === 'function'
            ? children({ view, size: { width: size.width, height: size.height } })
            : children}
        </Mafs>
      )}

      <div className="sa-ml-an__zoom" role="group" aria-label={t('tools.analysis.viewControls')}>
        <button
          type="button" className="sa-ml-an__btn sa-ml-an__btn--icon"
          onClick={() => zoomBy(ZOOM_STEP)}
          aria-label={t('tools.analysis.zoomIn')} title={t('tools.analysis.zoomIn')} data-ml-zoom-in
        >
          <ZoomIn size={18} aria-hidden="true" />
        </button>
        <button
          type="button" className="sa-ml-an__btn sa-ml-an__btn--icon"
          onClick={() => zoomBy(1 / ZOOM_STEP)}
          aria-label={t('tools.analysis.zoomOut')} title={t('tools.analysis.zoomOut')} data-ml-zoom-out
        >
          <ZoomOut size={18} aria-hidden="true" />
        </button>
        <button
          type="button" className="sa-ml-an__btn sa-ml-an__btn--icon"
          onClick={resetView}
          aria-label={t('tools.analysis.resetView')} title={t('tools.analysis.resetView')} data-ml-zoom-reset
        >
          <Maximize size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
});

export default AnalysisPlane;

/** Le nom des axes au bout des axes : x et y, et l'origine O. */
function AxisNames({ view }) {
  const { viewTransform } = useTransformContext();
  const clampX = (x) => Math.min(view.xMax, Math.max(view.xMin, x));
  const clampY = (y) => Math.min(view.yMax, Math.max(view.yMin, y));
  const [xEndPx, xAxisPy] = vec.transform([view.xMax, clampY(0)], viewTransform);
  const [yAxisPx, yEndPy] = vec.transform([clampX(0), view.yMax], viewTransform);
  const [originPx, originPy] = vec.transform([0, 0], viewTransform);
  const originVisible = view.xMin < 0 && view.xMax > 0 && view.yMin < 0 && view.yMax > 0;
  const onXAxis = view.yMin < 0 && view.yMax > 0;
  const onYAxis = view.xMin < 0 && view.xMax > 0;

  return (
    <g className="sa-ml-an__axisnames mafs-shadow" fontStyle="italic">
      <text x={xEndPx - 8} y={onXAxis ? xAxisPy - 8 : xAxisPy + (view.yMax <= 0 ? -8 : 18)} textAnchor="end">x</text>
      <text
        x={onYAxis || view.xMax <= 0 ? yAxisPx - 8 : yAxisPx + 8}
        y={yEndPy + 16}
        textAnchor={onYAxis || view.xMax <= 0 ? 'end' : 'start'}
      >
        y
      </text>
      {originVisible && <text x={originPx - 6} y={originPy + 16} textAnchor="end">O</text>}
    </g>
  );
}
