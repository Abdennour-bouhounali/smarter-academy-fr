import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Undo2, Redo2, PanelBottomClose, PanelBottomOpen } from 'lucide-react';
import './vectors.css';
import VectorPlane from './VectorPlane.jsx';
import VectorSceneLayer from './VectorSceneLayer.jsx';
import VectorInspector from './VectorInspector.jsx';
import VectorControls from './VectorControls.jsx';
import * as V from './vectorMath.js';
import { compareVectors, analysePointPair, analyseCollinearity } from './analysis.js';
import { resolveScene, snap, clampCoord, MAX_POINTS, MAX_VECTORS, MAX_POLYGONS, SNAP_STEP } from './vectorScene.js';
import {
  normalizeVectorsData, serializeVectorsData, createVectorsData, currentScene,
  pushScene, replaceScene, undo, redo, canUndo, canRedo,
  addFreePoint, addFreeVector, addPointsVector, addCombination, addScaled,
  addMidpoint, addImagePoint, addPolygon, translatePolygon,
  movePoint, moveVectorTip, moveVectorOrigin, setVectorComponents, setScalar,
  DEFAULT_VECTORS_VIEWPORT,
} from './vectorState.js';
import { removeObjects } from './vectorScene.js';
import { getExperiment } from './experiments.js';
import { clampToFeatures, vectorsFeatures } from './scope.js';

/** Le délai entre un changement et sa remise à la coquille (qui attend encore avant d'enregistrer). */
const SERIALIZE_MS = 300;

/**
 * Le مختبر الأشعة dans la coquille du مختبر (MathLabToolProps — toolContract.js).
 *
 * L'état du document (vectorState.js) vit ICI ; toute la mathématique est
 * dans les modules purs (vectorMath.js, vectorScene.js, analysis.js) que ce
 * composant se contente d'appeler — aucun calcul dans le JSX (§38).
 *
 *     un plan → des objets qu'on TIRE → les lectures suivent → une relation apparaît
 *
 * Deux régimes de modification, et la différence compte :
 *   - un GESTE CONTINU (glisser un point, bouger un curseur) remplace la
 *     scène courante (`replaceScene`) : « تراجع » défait le geste entier ;
 *   - un ACTE (créer, combiner, supprimer) empile un pas (`pushScene`).
 */
export default function VectorsTool({ initialData, onChange, onReady, capabilities = null }) {
  const { t } = useTranslation('mathlab');
  // Le مخبر (scope.js) : au collège, ni k·u, ni v = k·u, ni produit scalaire.
  const features = useMemo(() => vectorsFeatures(capabilities), [capabilities]);
  const [data, setData] = useState(() => clampToFeatures(initialData && Object.keys(initialData).length
    ? normalizeVectorsData(initialData)
    : createVectorsData(), features));
  const [panelOpen, setPanelOpen] = useState(true);
  const [announcement, setAnnouncement] = useState('');

  const planeRef = useRef(null);
  const timerRef = useRef(null);
  const dataRef = useRef(data);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  dataRef.current = data;

  /** Une modification voulue : appliquée tout de suite, remise à la coquille après SERIALIZE_MS. */
  const commit = useCallback((updater) => {
    setData((current) => {
      const next = typeof updater === 'function' ? updater(current) : updater;
      if (next === current) return current;
      dataRef.current = next;
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        onChangeRef.current?.(serializeVectorsData(dataRef.current));
      }, SERIALIZE_MS);

      return next;
    });
  }, []);

  useEffect(() => () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      onChangeRef.current?.(serializeVectorsData(dataRef.current));
    }
  }, []);

  const scene = currentScene(data);
  const resolved = useMemo(() => resolveScene(scene), [scene]);

  // ── La coquille : « إعادة ضبط » repart d'un plan neuf (§29) ────────────
  useEffect(() => {
    onReady?.({
      clear: () => {
        setAnnouncement(t('tools.vectors.announceReset'));
        commit(() => createVectorsData());
      },
      isGridEnabled: () => dataRef.current.settings.grid,
      toggleGrid: () => {
        const next = !dataRef.current.settings.grid;
        commit((current) => ({ ...current, settings: { ...current.settings, grid: next } }));

        return next;
      },
    });

    return () => onReady?.(null);
  }, [onReady, commit, t]);

  // ── Les gestes continus : ils REMPLACENT le pas courant ───────────────

  /** Pixels → coordonnées du plan, avec aimantation (sauf si l'élève tient Shift). */
  const toPlane = useCallback((clientX, clientY, modifiers) => {
    const math = planeRef.current?.toMath(clientX, clientY);
    if (!math) return null;
    const useSnap = dataRef.current.settings.snap && !modifiers?.shift;

    return useSnap
      ? { x: snap(math[0], SNAP_STEP), y: snap(math[1], SNAP_STEP) }
      : { x: clampCoord(math[0]), y: clampCoord(math[1]) };
  }, []);

  const dragPoint = useCallback((id, clientX, clientY, modifiers) => {
    const position = toPlane(clientX, clientY, modifiers);
    if (!position) return;
    commit((current) => replaceScene(current, movePoint(currentScene(current), id, position.x, position.y)));
  }, [commit, toPlane]);

  const dragVectorTip = useCallback((id, clientX, clientY, modifiers) => {
    const position = toPlane(clientX, clientY, modifiers);
    if (!position) return;
    commit((current) => replaceScene(current, moveVectorTip(currentScene(current), id, position.x, position.y)));
  }, [commit, toPlane]);

  const dragVectorOrigin = useCallback((id, clientX, clientY, modifiers) => {
    const position = toPlane(clientX, clientY, modifiers);
    if (!position) return;
    commit((current) => replaceScene(current, moveVectorOrigin(currentScene(current), id, position.x, position.y)));
  }, [commit, toPlane]);

  /**
   * La fin d'un glissement ouvre un NOUVEAU pas : le geste suivant ne
   * s'écrasera pas sur celui-ci, et « تراجع » revient bien avant ce geste.
   */
  const endDrag = useCallback(() => {
    commit((current) => pushScene(current, currentScene(current)));
  }, [commit]);

  // ── La sélection ──────────────────────────────────────────────────────

  const selectPoint = useCallback((id) => {
    commit((current) => {
      const selected = current.selection.points;
      const next = selected.includes(id)
        ? selected.filter((entry) => entry !== id)
        : [...selected, id].slice(-3);

      return { ...current, selection: { ...current.selection, points: next } };
    });
  }, [commit]);

  const selectVector = useCallback((id) => {
    commit((current) => {
      const selected = current.selection.vectors;
      const next = selected.includes(id)
        ? selected.filter((entry) => entry !== id)
        : [...selected, id].slice(-2);

      return { ...current, selection: { ...current.selection, vectors: next } };
    });
  }, [commit]);

  /** Un tap dans le vide : on désélectionne — le plan redevient net. */
  const tapPlane = useCallback(() => {
    commit((current) => (current.selection.points.length || current.selection.vectors.length
      ? { ...current, selection: { points: [], vectors: [] } }
      : current));
  }, [commit]);

  // ── Les actes : ils EMPILENT un pas ───────────────────────────────────

  /** Où poser un nouvel objet : au centre de ce qu'on regarde, pas à l'origine. */
  const viewCenter = useCallback(() => {
    const view = planeRef.current?.getView() ?? DEFAULT_VECTORS_VIEWPORT;

    return { x: snap((view.xMin + view.xMax) / 2), y: snap((view.yMin + view.yMax) / 2) };
  }, []);

  const act = useCallback((build, message = null) => {
    commit((current) => {
      const next = build(currentScene(current));
      if (next === currentScene(current)) return current;

      return pushScene(current, next);
    });
    if (message) setAnnouncement(message);
  }, [commit]);

  const addPoint = useCallback(() => {
    const center = viewCenter();
    // On évite de poser deux points l'un sur l'autre.
    const offset = scene.points.length % 4;
    act((s) => addFreePoint(s, { x: center.x + offset, y: center.y - offset }), t('tools.vectors.announcePoint'));
  }, [act, viewCenter, scene.points.length, t]);

  const addVector = useCallback(() => {
    const center = viewCenter();
    act((s) => addFreeVector(s, { x: 3, y: 2, origin: { x: center.x - 1.5, y: center.y - 1 } }), t('tools.vectors.announceVector'));
  }, [act, viewCenter, t]);

  const createAB = useCallback(() => {
    const [a, b] = data.selection.points;
    act((s) => addPointsVector(s, a, b), t('tools.vectors.announceVector'));
  }, [act, data.selection.points, t]);

  const combine = useCallback((kind, method) => {
    const [u, v] = data.selection.vectors;
    act((s) => addCombination(s, kind, u, v, method), t(kind === 'sum' ? 'tools.vectors.announceSum' : 'tools.vectors.announceDifference'));
  }, [act, data.selection.vectors, t]);

  const scaleVector = useCallback(() => {
    const [u] = data.selection.vectors;
    act((s) => addScaled(s, u, 2), t('tools.vectors.announceScaled'));
  }, [act, data.selection.vectors, t]);

  const makeMidpoint = useCallback(() => {
    const [a, b] = data.selection.points;
    act((s) => addMidpoint(s, a, b), t('tools.vectors.announceMidpoint'));
  }, [act, data.selection.points, t]);

  const translate = useCallback(() => {
    const [a] = data.selection.points;
    const [u] = data.selection.vectors;
    act((s) => addImagePoint(s, a, u), t('tools.vectors.announceTranslation'));
  }, [act, data.selection.points, data.selection.vectors, t]);

  const makePolygon = useCallback(() => {
    act((s) => addPolygon(s, data.selection.points), t('tools.vectors.announcePolygon'));
  }, [act, data.selection.points, t]);

  const translateShape = useCallback(() => {
    const [u] = data.selection.vectors;
    const polygon = scene.polygons.find((p) => !p.name.endsWith('′')) ?? scene.polygons[0];
    if (!polygon || !u) return;
    act((s) => translatePolygon(s, polygon.id, u), t('tools.vectors.announceShapeTranslation'));
  }, [act, data.selection.vectors, scene.polygons, t]);

  const removeVector = useCallback((id) => {
    act((s) => removeObjects(s, { vectors: [id] }), t('tools.vectors.announceRemoved'));
  }, [act, t]);

  const removePoint = useCallback((id) => {
    act((s) => removeObjects(s, { points: [id] }), t('tools.vectors.announceRemoved'));
  }, [act, t]);

  /** Le curseur k : continu, donc il remplace (§15). */
  const changeScalar = useCallback((id, k) => {
    commit((current) => replaceScene(current, setScalar(currentScene(current), id, k)));
  }, [commit]);

  /** Les curseurs a et b du mode paramétré (§26) : continus eux aussi. */
  const changeExplorerComponent = useCallback((axis, value) => {
    commit((current) => {
      const id = current.explorer?.vectorId;
      if (!id) return current;
      const vector = currentScene(current).vectors.find((v) => v.id === id);
      if (!vector) return current;
      const next = axis === 'x' ? { x: value, y: vector.y } : { x: vector.x, y: value };

      return replaceScene(current, setVectorComponents(currentScene(current), id, next.x, next.y));
    });
  }, [commit]);

  const toggleExplorer = useCallback(() => {
    commit((current) => {
      if (current.explorer) return { ...current, explorer: null };
      const [id] = current.selection.vectors;
      const vector = currentScene(current).vectors.find((v) => v.id === id && v.kind === 'free');

      return vector ? { ...current, explorer: { vectorId: vector.id } } : current;
    });
  }, [commit]);

  const toggleSetting = useCallback((key) => {
    commit((current) => ({ ...current, settings: { ...current.settings, [key]: !current.settings[key] } }));
  }, [commit]);

  const setAnalysis = useCallback((analysis) => {
    if (!features.analysis.includes(analysis)) return;
    commit((current) => ({ ...current, settings: { ...current.settings, analysis } }));
  }, [commit, features]);

  /** Une expérience (§27) : une scène toute gréée, empilée comme un acte — donc annulable. */
  const openExperiment = useCallback((id) => {
    const experiment = getExperiment(id);
    if (!experiment || !features.experiments.some((entry) => entry.id === id)) return;
    const built = experiment.build();
    commit((current) => {
      const next = pushScene(current, built.scene);

      return {
        ...next,
        experiment: id,
        explorer: null,
        selection: { points: built.select?.points ?? [], vectors: built.select?.vectors ?? [] },
        settings: { ...next.settings, ...(experiment.settings ?? built.settings ?? {}) },
      };
    });
    setAnnouncement(t('tools.vectors.announceExperiment', { name: t(experiment.labelKey) }));
  }, [commit, t, features]);

  const changeViewport = useCallback((viewport) => {
    commit((current) => ({ ...current, viewport }));
  }, [commit]);

  // ── Les lectures et les relations (calcul PUR, jamais dans le JSX) ─────

  const selectedVectors = useMemo(
    () => data.selection.vectors.map((id) => resolved.vectors.get(id)).filter((v) => v?.resolved),
    [data.selection.vectors, resolved],
  );
  const selectedPoints = useMemo(
    () => data.selection.points.map((id) => resolved.points.get(id)).filter((p) => p?.resolved),
    [data.selection.points, resolved],
  );

  /** Le شعاع de base d'un شعاع mis à l'échelle — pour écrire « v = k · u ». */
  const inspectorVectors = useMemo(() => selectedVectors.map((vector) => ({
    ...vector,
    baseName: vector.source.kind === 'scaled' ? resolved.vectors.get(vector.source.of)?.name ?? 'u' : null,
  })), [selectedVectors, resolved]);

  const relations = useMemo(() => {
    const out = {};

    if (selectedVectors.length === 2) {
      const [u, w] = selectedVectors;
      const comparison = compareVectors(u.components, w.components);
      if (comparison) {
        out.pair = {
          ...comparison,
          uName: u.name,
          vName: w.name,
          u: u.components,
          v: w.components,
          // Le sommet de l'angle droit : l'origine commune, s'il y en a une.
          at: V.sameVector(u.origin, w.origin) ? u.origin : null,
        };
      }
    }

    if (selectedPoints.length === 2) {
      const [a, b] = selectedPoints;
      const measures = analysePointPair(a.position, b.position);
      if (measures) out.points = { ...measures, a: a.position, b: b.position, aName: a.name, bName: b.name };
    }

    if (selectedPoints.length === 3 && data.settings.analysis === 'collinear') {
      const [a, b, c] = selectedPoints;
      const verdict = analyseCollinearity(a.position, b.position, c.position);
      if (verdict) {
        out.collinear = { ...verdict, anchor: a.position, names: `${a.name}، ${b.name}، ${c.name}` };
      }
    }

    return out;
  }, [selectedVectors, selectedPoints, data.settings.analysis]);

  const explorerVector = data.explorer ? resolved.vectors.get(data.explorer.vectorId) ?? null : null;

  const doUndo = useCallback(() => commit(undo), [commit]);
  const doRedo = useCallback(() => commit(redo), [commit]);

  return (
    <div className="sa-ml-vec" role="region" aria-label={t('tools.vectors.name')} data-ml-vectors>
      <div className="sa-ml-vec__stage">
        <VectorPlane
          ref={planeRef}
          initialViewport={data.viewport}
          grid={data.settings.grid}
          onViewportChange={changeViewport}
          onTap={tapPlane}
        >
          {({ view }) => (
            <VectorSceneLayer
              resolved={resolved}
              scene={scene}
              view={view}
              selection={data.selection}
              relations={relations}
              settings={data.settings}
              onDragPoint={dragPoint}
              onDragVectorTip={dragVectorTip}
              onDragVectorOrigin={dragVectorOrigin}
              onDragEnd={endDrag}
              onSelectPoint={selectPoint}
              onSelectVector={selectVector}
            />
          )}
        </VectorPlane>

        {/* تراجع / إعادة, posés sur le plan : la main y est déjà (§30). */}
        <div className="sa-ml-vec__history" role="group" aria-label={t('tools.vectors.historyLabel')}>
          <button
            type="button"
            className="sa-ml-btn sa-ml-btn--icon sa-ml-vec__histbtn"
            onClick={doUndo}
            disabled={!canUndo(data)}
            aria-label={t('tools.vectors.undo')}
            title={t('tools.vectors.undo')}
            data-ml-undo
          >
            <Undo2 size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="sa-ml-btn sa-ml-btn--icon sa-ml-vec__histbtn"
            onClick={doRedo}
            disabled={!canRedo(data)}
            aria-label={t('tools.vectors.redo')}
            title={t('tools.vectors.redo')}
            data-ml-redo
          >
            <Redo2 size={18} aria-hidden="true" />
          </button>
        </div>

        <p className="sa-ml-vec__sr" role="status" aria-live="polite">{announcement}</p>
      </div>

      {/* ── Le panneau : colonne sur grand écran, tiroir sur mobile (§25, §33) ── */}
      <div className={`sa-ml-vec__panel${panelOpen ? '' : ' sa-ml-vec__panel--collapsed'}`} data-ml-panel data-ml-panel-open={panelOpen ? 'true' : 'false'}>
        <div className="sa-ml-vec__panel-head">
          <h2 className="sa-ml-vec__panel-title">{t('tools.vectors.panelHeading')}</h2>
          <button
            type="button"
            className="sa-ml-btn sa-ml-btn--icon sa-ml-vec__collapse"
            onClick={() => setPanelOpen((open) => !open)}
            aria-expanded={panelOpen}
            aria-label={t(panelOpen ? 'tools.vectors.panelHide' : 'tools.vectors.panelShow')}
            title={t(panelOpen ? 'tools.vectors.panelHide' : 'tools.vectors.panelShow')}
            data-ml-panel-toggle
          >
            {panelOpen ? <PanelBottomClose size={18} aria-hidden="true" /> : <PanelBottomOpen size={18} aria-hidden="true" />}
          </button>
        </div>

        <div className="sa-ml-vec__panel-body">
          <VectorInspector
            vectors={inspectorVectors}
            points={selectedPoints}
            relations={relations}
            settings={data.settings}
            showFactor={features.factor}
            onRemoveVector={removeVector}
            onRemovePoint={removePoint}
            onScalarChange={changeScalar}
          />

          <VectorControls
            selection={data.selection}
            counts={{ points: scene.points.length, vectors: scene.vectors.length, polygons: scene.polygons.length }}
            limits={{ points: MAX_POINTS, vectors: MAX_VECTORS, polygons: MAX_POLYGONS }}
            settings={data.settings}
            experiment={data.experiment}
            explorer={data.explorer}
            explorerVector={explorerVector}
            onAddPoint={addPoint}
            onAddVector={addVector}
            onCreateAB={createAB}
            onCombine={combine}
            onScale={scaleVector}
            onMidpoint={makeMidpoint}
            onTranslate={translate}
            onMakePolygon={makePolygon}
            onTranslatePolygon={translateShape}
            onToggleSetting={toggleSetting}
            onAnalysis={setAnalysis}
            onExperiment={openExperiment}
            onExplorerComponent={changeExplorerComponent}
            onToggleExplorer={toggleExplorer}
            features={features}
          />
        </div>
      </div>
    </div>
  );
}
