import {
  forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Mafs, Coordinates, useTransformContext, vec } from 'mafs';
import 'mafs/core.css';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import {
  fitViewportToAspect, zoomViewport, pixelToMath,
} from '../functionGrapher/viewport.js';
import { gridStepFor } from '../functionGrapher/gridStep.js';
import { formatAxisLabel } from '../functionGrapher/grapherFormat.js';
import { useViewportGestures, ZOOM_STEP } from '../functionGrapher/useViewportGestures.js';

/** Après un geste, la fenêtre est remise au document une fois le calme revenu. */
const REPORT_VIEW_MS = 400;

const FALLBACK_VIEWPORT = Object.freeze({ xMin: -1, xMax: 11, yMin: -5, yMax: 35 });

/**
 * LE PLAN du مختبر المتتاليات.
 *
 * MATH_LAB §3 est catégorique : « Do NOT create a second coordinate-system
 * implementation. » Ce composant n'en crée pas. La CAMÉRA (viewport.js), le
 * PAS DE GRILLE (gridStep.js), les GESTES (useViewportGestures.js) et le
 * FORMAT des étiquettes (grapherFormat.js) sont les modules du grapheur,
 * importés tels quels — un seul repère sur la plateforme, un seul zoom, un
 * seul pincement, une seule graduation. C'est exactement ce que
 * `vectors/VectorPlane.jsx` a fait avant lui.
 *
 * Ce qui justifie un composant distinct, c'est ce qu'on pose DESSUS : des
 * points isolés aux abscisses entières, pas une courbe échantillonnée. Et
 * surtout un axe qui ne s'appelle pas « x » mais « n » — l'axe des INDICES.
 * C'est la différence entre une fonction et une suite, et §18 demande qu'elle
 * se voie (« make clear that a sequence is defined only at integer indices »).
 *
 * Le plan est `dir="ltr"` : c'est des mathématiques (§44). L'axe des indices
 * croît vers la DROITE même quand l'interface est en arabe. Seuls les panneaux
 * suivent la direction de la page.
 *
 * Les enfants sont rendus dans le SVG de mafs par `children` (une fonction qui
 * reçoit la fenêtre) : le plan ne sait rien des متتاليات, il sait dessiner un
 * repère et écouter des gestes.
 */
const SequencePlane = forwardRef(function SequencePlane({
  initialViewport, grid = true, onViewportChange, onTap, canvasLabel = null,
  defaultViewport = FALLBACK_VIEWPORT, square = false, xAxisName = 'n', children,
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
   * La fenêtre, ajustée à la boîte.
   *
   * Deux régimes, et le choix n'est pas cosmétique :
   *
   *  - le GRAPHE de la suite (`square = false`) garde la fenêtre TELLE
   *    QUELLE : l'abscisse est un INDICE et l'ordonnée une VALEUR, deux
   *    grandeurs sans rapport, donc rien n'oblige une unité de n à faire
   *    autant de pixels qu'une unité de uₙ.
   *
   *    Le grapheur, lui, impose un repère orthonormé (`resizeViewport` fixe
   *    la hauteur depuis la largeur) parce qu'il trace des longueurs en x et
   *    en y. Appliqué ici, cela écrasait la suite : avec n ∈ [−0,5 ; 10,5]
   *    sur une boîte large, la hauteur se réduisait à une dizaine d'unités
   *    centrées sur la moyenne, et la QA visuelle a montré un graphe où trois
   *    points sur dix étaient visibles — les premiers termes hors cadre.
   *
   *  - la TOILE (`square = true`) est orthonormée, parce qu'on y lit `y = x` :
   *    une diagonale qui n'est pas à 45° ne montre plus le report d'un terme
   *    sur le suivant, et le dessin cesse d'expliquer quoi que ce soit (§9).
   */
  useLayoutEffect(() => {
    if (!(size.width > 0 && size.height > 0)) return;
    setViewState((current) => {
      const base = current ?? initialViewport ?? defaultViewport;

      return square ? fitViewportToAspect(base, size.width, size.height) : base;
    });
    // initialViewport et defaultViewport ne comptent qu'à l'ouverture.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.width, size.height, square]);

  // Une fenêtre imposée de l'extérieur (un préréglage, un recadrage
  // automatique) remplace celle en cours : c'est le « reset view » de §19
  // déclenché par le modèle plutôt que par un bouton.
  const requestedRef = useRef(null);
  useLayoutEffect(() => {
    if (!initialViewport) return;
    const key = `${initialViewport.xMin},${initialViewport.xMax},${initialViewport.yMin},${initialViewport.yMax}`;
    if (requestedRef.current === key) return;
    requestedRef.current = key;
    const { width, height } = sizeRef.current;
    setViewState(square && width > 0 ? fitViewportToAspect(initialViewport, width, height) : { ...initialViewport });
  }, [initialViewport, square]);

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
    applyGesture(() => (square && width > 0 ? fitViewportToAspect(base, width, height) : { ...base }));
  }, [applyGesture, defaultViewport, initialViewport, square]);

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

  /**
   * L'axe des indices est gradué en ENTIERS.
   *
   * `gridStepFor` peut proposer un pas de 0,5 ou de 2,5 quand la fenêtre est
   * étroite — des graduations qui n'ont aucun sens sur un axe d'indices :
   * il n'existe pas de terme u₂,₅. On force donc un pas entier sur n, tout en
   * laissant l'axe des valeurs libre (une suite peut très bien valoir 0,25).
   */
  const xStep = Math.max(1, Math.round(xGrid.step));

  return (
    <div
      ref={hostRef}
      className={`sa-ml-seq__plane${grid ? '' : ' sa-ml-seq__plane--nogrid'}`}
      tabIndex={0}
      role="application"
      aria-label={canvasLabel ?? t('tools.sequences.canvasLabel')}
      dir="ltr"
      data-ml-plane
      data-ml-seq-plane
      data-ml-step={xStep}
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
          <Coordinates.Cartesian
            xAxis={{ lines: xStep, labels: formatAxisLabel }}
            yAxis={{ lines: yGrid.step, labels: formatAxisLabel }}
            subdivisions={false}
          />
          <AxisNames view={view} xAxisName={xAxisName} />
          {typeof children === 'function'
            ? children({ view, size: { width: size.width, height: size.height }, xStep })
            : children}
        </Mafs>
      )}

      <div className="sa-ml-seq__zoom" role="group" aria-label={t('tools.sequences.viewControls')}>
        <button
          type="button" className="sa-ml-seq__btn sa-ml-seq__btn--icon sa-ml-seq__zoombtn"
          onClick={() => zoomBy(ZOOM_STEP)}
          aria-label={t('tools.sequences.zoomIn')} title={t('tools.sequences.zoomIn')} data-ml-zoom-in
        >
          <ZoomIn size={18} aria-hidden="true" />
        </button>
        <button
          type="button" className="sa-ml-seq__btn sa-ml-seq__btn--icon sa-ml-seq__zoombtn"
          onClick={() => zoomBy(1 / ZOOM_STEP)}
          aria-label={t('tools.sequences.zoomOut')} title={t('tools.sequences.zoomOut')} data-ml-zoom-out
        >
          <ZoomOut size={18} aria-hidden="true" />
        </button>
        <button
          type="button" className="sa-ml-seq__btn sa-ml-seq__btn--icon sa-ml-seq__zoombtn"
          onClick={resetView}
          aria-label={t('tools.sequences.resetView')} title={t('tools.sequences.resetView')} data-ml-zoom-reset
        >
          <Maximize size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
});

export default SequencePlane;

/**
 * Le nom des axes au bout des axes — mais ici « n » et « uₙ », pas « x » et
 * « y » : l'abscisse est un INDICE. C'est la seule différence avec le repère
 * du grapheur, et c'est celle qui dit ce qu'on regarde.
 */
function AxisNames({ view, xAxisName }) {
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
    <g className="sa-ml-seq__axisnames mafs-shadow" fontStyle="italic">
      <text x={xEndPx - 8} y={onXAxis ? xAxisPy - 8 : xAxisPy + (view.yMax <= 0 ? -8 : 18)} textAnchor="end">
        {xAxisName}
      </text>
      <text
        x={onYAxis || view.xMax <= 0 ? yAxisPx - 8 : yAxisPx + 8}
        y={yEndPy + 16}
        textAnchor={onYAxis || view.xMax <= 0 ? 'end' : 'start'}
      >
        {xAxisName === 'n' ? 'uₙ' : 'y'}
      </text>
      {originVisible && <text x={originPx - 6} y={originPy + 16} textAnchor="end">O</text>}
    </g>
  );
}
