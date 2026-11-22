import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './functionGrapher.css';
import {
  MAX_FUNCTIONS, newId, nextFunctionColor, nextFunctionName, nextPointName, normalizeGrapherData, derivativeColorFor, normalizeTangent,
} from './grapherState.js';
import { compileSource } from './expressionEvaluator.js';
import { DEFAULT_VIEWPORT, sameViewport } from './viewport.js';
import { derivativeAt, derivativeFunction, tangentAt, constrainAlongCurve } from './numericalDerivative.js';
import TangentOverlay from './TangentOverlay.jsx';
import { installGrapherKeyboard } from './mathliveSetup.js';
import { grapherFeatures } from './scope.js';
import { exportGrapherPng } from './exportGrapherPng.js';
import CoordinatePlane from './CoordinatePlane.jsx';
import FunctionPanel from './FunctionPanel.jsx';

/** Le délai entre un changement et sa remise à la coquille (qui attend encore avant d'enregistrer). */
const SERIALIZE_MS = 300;

/**
 * Le grapheur (راسم الدوال) dans la coquille du مختبر (MathLabToolProps —
 * toolContract.js).
 *
 * L'état du document (grapherState.js) vit ICI, en état React — il est
 * petit (six fonctions, un point, une fenêtre) et chaque changement doit
 * redessiner. Ce qui bouge à haute fréquence (la fenêtre pendant un geste,
 * la lecture du curseur) reste dans le plan (CoordinatePlane) et ne remonte
 * qu'une fois le calme revenu.
 *
 *     saisie MathLive → expression (chaîne) → compileSource → fn(x) → échantillons → SVG
 *
 * ── Le mode « المماس » (data.tangent) ────────────────────────────────────
 * Une option du grapheur, pas un autre outil : sur UNE fonction étudiée,
 * le point A glissable le long de la courbe (le même point mobile que
 * l'inspection, contraint par constrainAlongCurve), la tangente en A, sa
 * pente mesurée (numericalDerivative.js), et en option la courbe de f′ —
 * une fonction VIRTUELLE ajoutée au plan, jamais au document — avec le
 * point B = (a ; f′(a)). Éteint, le grapheur est exactement celui d'avant.
 *
 * ── Le مخبر (scope.js) ───────────────────────────────────────────────────
 * Dans مخبر المتوسط, le mode tangente n'existe pas (ni panneau, ni calque,
 * ni état : un document qui l'avait allumé s'ouvre éteint), les exemples
 * sont des droites et le clavier n'a ni sin ni ln.
 */
export default function FunctionGrapherTool({ initialData, onChange, onReady, capabilities = null }) {
  const { t } = useTranslation('mathlab');
  const features = useMemo(() => grapherFeatures(capabilities), [capabilities]);
  const [data, setData] = useState(() => {
    const normalized = normalizeGrapherData(initialData);

    return features.tangent || !normalized.tangent.enabled
      ? normalized
      : { ...normalized, tangent: { ...normalized.tangent, enabled: false } };
  });
  const [focusId, setFocusId] = useState(null);
  // L'invitation « اسحب النقطة » du mode tangente, jusqu'au premier geste sur A.
  const [tangentTouched, setTangentTouched] = useState(false);
  const planeRef = useRef(null);
  const timerRef = useRef(null);
  const dataRef = useRef(data);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  dataRef.current = data;

  /** Une modification voulue : appliquée tout de suite, remise à la coquille après SERIALIZE_MS. */
  const commit = useCallback((updater) => {
    setData((current) => {
      const next = updater(current);
      if (next === current) return current;
      dataRef.current = next;
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        onChangeRef.current?.(dataRef.current);
      }, SERIALIZE_MS);

      return next;
    });
  }, []);

  // ── Les fonctions compilées : une fois par expression, pas par rendu ────
  const compiledCache = useRef(new Map());
  const compiledById = useMemo(() => {
    const cache = compiledCache.current;
    const next = new Map();
    for (const fn of data.functions) {
      const cached = cache.get(fn.id);
      const compiled = cached && cached.expression === fn.expression ? cached.compiled : compileSource(fn.expression);
      next.set(fn.id, compiled);
      cache.set(fn.id, { expression: fn.expression, compiled });
    }
    for (const id of [...cache.keys()]) if (!next.has(id)) cache.delete(id);

    return next;
  }, [data.functions]);

  // ── Les actions de la coquille ─────────────────────────────────────────
  useEffect(() => {
    onReady?.({
      clear: () => commit((current) => ({ ...current, functions: [], points: [], tangent: normalizeTangent({ ...current.tangent, enabled: false }, []) })),
      exportPng: () => {
        const svg = planeRef.current?.getSvgElement();
        if (!svg) return Promise.reject(new Error('export'));

        return exportGrapherPng(svg);
      },
      isGridEnabled: () => dataRef.current.settings.grid,
      toggleGrid: () => {
        const next = !dataRef.current.settings.grid;
        commit((current) => ({ ...current, settings: { ...current.settings, grid: next } }));

        return next;
      },
    });

    return () => onReady?.(null);
  }, [onReady, commit]);

  // Le clavier virtuel du grapheur, le temps de l'ouverture ; et ce qui attendait d'être remis part au démontage.
  useEffect(() => {
    const restore = installGrapherKeyboard(features.keyboard);

    return () => {
      restore();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        onChangeRef.current?.(dataRef.current);
      }
    };
    // Le مخبر ne change pas pendant la vie de l'outil (la page le remonte).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Les fonctions ──────────────────────────────────────────────────────
  const addFunction = useCallback((expression = '') => {
    if (dataRef.current.functions.length >= MAX_FUNCTIONS) return;
    // L'identifiant est tiré ICI, pas dans la mise à jour (React la joue plus
    // tard) : c'est lui que le champ neuf attend pour prendre le focus.
    const id = newId('fn');
    commit((current) => {
      if (current.functions.length >= MAX_FUNCTIONS) return current;
      const fn = {
        id, name: nextFunctionName(current.functions), expression, visible: true,
        color: nextFunctionColor(current.functions), domain: null,
      };

      return { ...current, functions: [...current.functions, fn] };
    });
    setFocusId(id);
  }, [commit]);

  const changeExpression = useCallback((id, expression) => commit((current) => ({
    ...current,
    functions: current.functions.map((fn) => (fn.id === id && fn.expression !== expression ? { ...fn, expression } : fn)),
  })), [commit]);

  const changeColor = useCallback((id, color) => commit((current) => ({
    ...current,
    functions: current.functions.map((fn) => (fn.id === id && fn.color !== color ? { ...fn, color } : fn)),
  })), [commit]);

  const toggleFunction = useCallback((id) => commit((current) => ({
    ...current,
    functions: current.functions.map((fn) => (fn.id === id ? { ...fn, visible: !fn.visible } : fn)),
  })), [commit]);

  const removeFunction = useCallback((id) => commit((current) => {
    const functions = current.functions.filter((fn) => fn.id !== id);

    return {
      ...current,
      functions,
      points: current.points.filter((p) => p.functionId !== id),
      tangent: normalizeTangent(current.tangent, functions),
    };
  }), [commit]);

  // ── Le point et la fenêtre ─────────────────────────────────────────────
  const placePoint = useCallback((target) => {
    if (!target) return;
    commit((current) => {
      const existing = current.points[0];
      const point = { id: existing?.id ?? newId('pt'), name: existing?.name ?? nextPointName([]), functionId: target.functionId, x: target.x };

      return { ...current, points: [point] };
    });
  }, [commit]);

  const movePoint = useCallback((x) => commit((current) => (current.points[0]
    ? { ...current, points: [{ ...current.points[0], x }] }
    : current)), [commit]);

  const removePoint = useCallback(() => commit((current) => ({ ...current, points: [] })), [commit]);

  const changeViewport = useCallback((view) => commit((current) => (sameViewport(current.viewport, view) ? current : { ...current, viewport: view })), [commit]);

  // ── Le mode tangente ───────────────────────────────────────────────────
  const tangentOn = data.tangent.enabled;
  const studied = tangentOn ? data.functions.find((f) => f.id === data.tangent.functionId) ?? null : null;
  const studiedCompiled = studied ? compiledById.get(studied.id) : null;
  const studiedFn = studiedCompiled?.ok ? studiedCompiled.fn : null;
  const derivativeColor = studied ? derivativeColorFor(studied.color, data.functions.map((f) => f.color)) : null;
  const derivativeId = studied ? `${studied.id}:prime` : null;

  const derivative = useMemo(() => (studiedFn ? derivativeAt(studiedFn, data.tangent.x) : null), [studiedFn, data.tangent.x]);
  const tangentLine = useMemo(() => (studiedFn ? tangentAt(studiedFn, data.tangent.x) : null), [studiedFn, data.tangent.x]);

  // Ce que le plan reçoit : les fonctions du document, plus f′ (virtuelle) en mode tangente.
  const planeFunctions = useMemo(() => (studied && data.tangent.showDerivative
    ? [...data.functions, { id: derivativeId, name: `${studied.name}′`, expression: '', visible: studied.visible, color: derivativeColor, domain: studied.domain }]
    : data.functions), [data.functions, studied, data.tangent.showDerivative, derivativeId, derivativeColor]);
  const planeCompiled = useMemo(() => {
    if (!studied || !data.tangent.showDerivative) return compiledById;
    const next = new Map(compiledById);
    next.set(derivativeId, studiedFn ? { ok: true, fn: derivativeFunction(studiedFn) } : { ok: false });

    return next;
  }, [compiledById, studied, data.tangent.showDerivative, derivativeId, studiedFn]);

  const planePoint = useMemo(() => {
    if (tangentOn) return studied ? { id: 'A', name: 'A', functionId: studied.id, x: data.tangent.x } : null;

    return data.points[0] ?? null;
  }, [tangentOn, studied, data.tangent.x, data.points]);

  const setTangentX = useCallback((x) => {
    if (!Number.isFinite(x)) return;
    setTangentTouched(true);
    commit((current) => (current.tangent.x === x ? current : { ...current, tangent: { ...current.tangent, x } }));
  }, [commit]);

  const toggleTangent = useCallback(() => commit((current) => ({
    ...current,
    tangent: normalizeTangent({ ...current.tangent, enabled: !current.tangent.enabled }, current.functions),
  })), [commit]);

  const selectStudied = useCallback((functionId) => commit((current) => ({ ...current, tangent: { ...current.tangent, functionId } })), [commit]);

  const toggleTangentOption = useCallback((key) => commit((current) => ({ ...current, tangent: { ...current.tangent, [key]: !current.tangent[key] } })), [commit]);

  const constrainPointX = useCallback((next, current) => {
    if (!tangentOn || !studiedFn) return next;
    const view = planeRef.current?.getView();

    return constrainAlongCurve(studiedFn, current, next, view ? view.yMax - view.yMin : 10);
  }, [tangentOn, studiedFn]);

  // En mode tangente, un tap n'importe où choisit l'abscisse de A ; sinon, l'inspection habituelle.
  const handleTap = useCallback((target, [x]) => {
    if (tangentOn) setTangentX(x);
    else placePoint(target);
  }, [tangentOn, setTangentX, placePoint]);
  const handleMovePoint = useCallback((x) => {
    if (tangentOn) setTangentX(x);
    else movePoint(x);
  }, [tangentOn, setTangentX, movePoint]);

  const renderOverlay = useCallback(({ step }) => (tangentOn && studied?.visible
    ? <TangentOverlay tangent={tangentLine} step={step} showTriangle={data.tangent.showTriangle} showDerivative={data.tangent.showDerivative} derivativeColor={derivativeColor} />
    : null), [tangentOn, studied, tangentLine, data.tangent.showTriangle, data.tangent.showDerivative, derivativeColor]);

  const tangentProps = features.tangent && (data.functions.length > 0 || tangentOn) ? {
    tangent: data.tangent,
    functions: data.functions,
    studied,
    compiled: studiedCompiled,
    derivative,
    tangentLine,
    viewport: data.viewport ?? DEFAULT_VIEWPORT,
    onToggle: toggleTangent,
    onSelectFunction: selectStudied,
    onChangeX: setTangentX,
    onToggleOption: toggleTangentOption,
  } : null;

  return (
    <div className="sa-ml-grapher" role="region" aria-label={t('tools.functionGrapher.name')} data-ml-grapher>
      <FunctionPanel
        data={data}
        compiledById={compiledById}
        focusId={focusId}
        onChangeExpression={changeExpression}
        onChangeColor={changeColor}
        onToggle={toggleFunction}
        onRemove={removeFunction}
        onAdd={() => addFunction('')}
        onPickPreset={(expression) => addFunction(expression)}
        presets={features.presets}
        onChangePointX={movePoint}
        onRemovePoint={removePoint}
        tangentProps={tangentProps}
      />
      <CoordinatePlane
        ref={planeRef}
        functions={planeFunctions}
        compiledById={planeCompiled}
        point={planePoint}
        initialViewport={data.viewport}
        grid={data.settings.grid}
        onViewportChange={changeViewport}
        onTap={handleTap}
        onMovePoint={handleMovePoint}
        constrainPointX={constrainPointX}
        renderOverlay={renderOverlay}
      />
      {tangentOn && !tangentTouched && tangentLine && (
        <p className="sa-ml-grapher__draghint" role="status" data-ml-drag-hint>{t('tools.functionGrapher.tangent.dragHint')}</p>
      )}
    </div>
  );
}
