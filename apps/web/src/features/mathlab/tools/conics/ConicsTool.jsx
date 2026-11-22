import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PanelBottomClose, PanelBottomOpen, SlidersHorizontal, Sigma, GraduationCap,
  Undo2, Redo2, Camera, CameraOff,
} from 'lucide-react';
import './conics.css';
import ConicPlane from './ConicPlane.jsx';
import ConicSceneLayer from './ConicSceneLayer.jsx';
import DragHandle from './DragHandle.jsx';
import ConicControls from './ConicControls.jsx';
import ConicInspector from './ConicInspector.jsx';
import PracticePanel from './PracticePanel.jsx';
import * as C from './conicMath.js';
import { analyseScene } from './sceneAnalysis.js';
import {
  normalizeConicsData, serializeConicsData, createConicsData,
  pushScene, replaceScene, undo, redo, canUndo, canRedo,
  updateObject, addConic, addLine, removeObject, changeKind,
  selectedObject, selectedConic, snapPoint, snapValue,
  freezeReference, clearReference,
  isConicObject, isLineObject, DEFAULT_CONICS_VIEWPORT, CONIC_PALETTE,
} from './conicState.js';
import { generateChallenge, judge, revealFor } from './practice.js';
import { useCompactCharts } from '../probabilityStats/useMediaQuery.js';

/** Le délai entre un changement et sa remise à la coquille (qui attend encore avant d'enregistrer). */
const SERIALIZE_MS = 300;

/**
 * Le مختبر المقاطع المخروطية dans la coquille du مختبر (MathLabToolProps).
 *
 *     on tire le centre → l'équation change → on écrit l'équation → la
 *     courbe change → on pose un point → la propriété focale se mesure
 *
 * L'état du document (`conicState.js`) vit ICI ; toute la mathématique est
 * dans les modules purs que ce composant se contente d'appeler — aucun
 * calcul dans le JSX (§50).
 *
 * ── Les deux régimes de changement (§45) ─────────────────────────────────
 * Un GESTE (glisser un centre, pousser un curseur) appelle `slide`, qui
 * remplace la scène vivante sans rien empiler ; son RELÂCHEMENT appelle
 * `commitGesture`, qui pousse UN pas dans l'historique. C'est ce qui fait
 * que « تراجع » défait un glissement entier et non un pixel.
 *
 * ── Ce qui n'est PAS persisté ────────────────────────────────────────────
 * La question d'entraînement courante, le texte en cours de saisie et son
 * erreur, l'onglet actif, le panneau ouvert et l'objet en cours de
 * glissement n'ont AUCUN champ dans `data`.
 */
export default function ConicsTool({ initialData, onChange, onReady }) {
  const { t } = useTranslation('mathlab');
  const [data, setData] = useState(() => (initialData && Object.keys(initialData).length
    ? normalizeConicsData(initialData)
    : createConicsData()));

  // ── L'état d'INTERFACE : jamais sérialisé ──────────────────────────────
  const [panelOpen, setPanelOpen] = useState(true);
  const [tab, setTab] = useState('controls');
  const [challenge, setChallenge] = useState(null);
  const [verdict, setVerdict] = useState(null);
  const [hintIndex, setHintIndex] = useState(-1);
  const [announcement, setAnnouncement] = useState('');
  const compact = useCompactCharts();

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
        onChangeRef.current?.(serializeConicsData(dataRef.current));
      }, SERIALIZE_MS);

      return next;
    });
  }, []);

  useEffect(() => () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      onChangeRef.current?.(serializeConicsData(dataRef.current));
    }
  }, []);

  const { scene, settings } = data;

  /** Le régime du GESTE : la scène vivante bouge, l'historique ne bouge pas. */
  const slide = useCallback((updater) => {
    commit((current) => replaceScene(current, updater(current.scene)));
  }, [commit]);

  /** Le régime du PAS : un vrai changement, empilé une fois. */
  const step = useCallback((updater) => {
    commit((current) => pushScene(current, updater(current.scene)));
  }, [commit]);

  /** La fin d'un geste : la scène vivante devient un pas. */
  const commitGesture = useCallback(() => {
    commit((current) => pushScene(current, current.scene));
  }, [commit]);

  // ── Ce que l'écran lit : UN calcul par rendu (§53) ────────────────────
  const viewportForAnalysis = data.viewport ?? DEFAULT_CONICS_VIEWPORT;
  const analysis = useMemo(
    () => analyseScene(scene, settings, viewportForAnalysis),
    [scene, settings, viewportForAnalysis],
  );
  const current = selectedConic(scene);
  const currentObject = selectedObject(scene);
  const currentFeatures = current ? analysis.byId[current.id] ?? null : null;

  /** §36 — ce que la révélation met en évidence, quand une réponse vient d'être jugée. */
  const highlight = verdict ? (revealFor(challenge)?.highlight ?? null) : null;

  // ── LES GESTES SUR LA GÉOMÉTRIE (§6) ──────────────────────────────────

  /** Le point du plan sous le doigt, aimanté si l'élève le veut. */
  const pointerToMath = useCallback((clientX, clientY, { raw = false } = {}) => {
    const math = planeRef.current?.toMath(clientX, clientY);
    if (!math) return null;
    const point = { x: math[0], y: math[1] };

    return raw ? point : snapPoint(point, settings);
  }, [settings]);

  /** §6 — glisser le CENTRE d'une conique (ou le sommet d'une parabole). */
  const dragCenter = useCallback((id) => (clientX, clientY) => {
    const point = pointerToMath(clientX, clientY);
    if (!point) return;
    slide((s) => updateObject(s, id, { h: point.x, k: point.y }));
  }, [pointerToMath, slide]);

  /**
   * §6 — glisser la POIGNÉE DE RAYON d'un cercle.
   *
   * Le rayon est la DISTANCE au centre, pas la coordonnée du doigt : la
   * poignée peut donc être attrapée n'importe où autour du cercle, et le
   * geste reste juste. C'est la définition même du cercle, rendue tangible.
   */
  const dragRadius = useCallback((conic) => (clientX, clientY) => {
    const point = pointerToMath(clientX, clientY, { raw: true });
    if (!point) return;
    const distance = C.distance({ x: conic.h, y: conic.k }, point);
    const radius = snapValue(distance, settings);
    if (!(radius > 0)) return;
    slide((s) => updateObject(s, conic.id, { r: radius }));
  }, [pointerToMath, slide, settings]);

  /** §6, §15 — glisser un demi-axe d'une ellipse ou d'une hyperbole. */
  const dragSemiAxis = useCallback((conic, axis) => (clientX, clientY) => {
    const point = pointerToMath(clientX, clientY, { raw: true });
    if (!point) return;
    const value = snapValue(axis === 'a'
      ? Math.abs(point.x - conic.h)
      : Math.abs(point.y - conic.k), settings);
    if (!(value > 0)) return;
    slide((s) => updateObject(s, conic.id, { [axis]: value }));
  }, [pointerToMath, slide, settings]);

  /**
   * §12 — glisser la poignée de LARGEUR d'une parabole.
   *
   * La poignée vit à une unité du sommet ; sa hauteur donne `a` directement
   * (`y = a·1²`). Tirer vers le haut resserre, tirer vers le bas retourne la
   * parabole — et l'élève voit le signe de `a` changer de sens sous son doigt.
   */
  const dragCoefficient = useCallback((conic) => (clientX, clientY) => {
    const point = pointerToMath(clientX, clientY, { raw: true });
    if (!point) return;
    const vertical = C.orientationOf(conic) === 'vertical';
    const raw = vertical ? point.x - conic.h : point.y - conic.k;
    const value = snapValue(raw, { ...settings, snapStep: 0.25 });
    slide((s) => updateObject(s, conic.id, { a: value }));
  }, [pointerToMath, slide, settings]);

  /** §10, §32 — déplacer la SONDE. */
  const dragProbe = useCallback((clientX, clientY) => {
    const point = pointerToMath(clientX, clientY);
    if (!point) return;
    slide((s) => ({ ...s, probe: point, trace: null }));
  }, [pointerToMath, slide]);

  /**
   * §34 — glisser le point TRACÉ : il reste sur la courbe.
   *
   * Le doigt part où il veut ; `parameterNear` rend le paramètre
   * correspondant, et le point revient sur la conique. C'est ce qui fait
   * qu'un point contraint ne « décolle » jamais.
   */
  const dragTrace = useCallback((conic) => (clientX, clientY) => {
    const point = pointerToMath(clientX, clientY, { raw: true });
    if (!point) return;
    const parameter = C.parameterNear(conic, point);
    if (parameter == null) return;
    const trace = typeof parameter === 'object'
      ? { targetId: conic.id, t: parameter.t, branch: parameter.branch }
      : { targetId: conic.id, t: parameter, branch: 1 };
    slide((s) => ({ ...s, trace }));
  }, [pointerToMath, slide]);

  /** §26 — glisser une DROITE : on la translate, sa pente ne change pas. */
  const dragLine = useCallback((line) => (clientX, clientY) => {
    const point = pointerToMath(clientX, clientY);
    if (!point) return;
    if (line.vertical) {
      slide((s) => updateObject(s, line.id, { x: point.x }));

      return;
    }
    slide((s) => updateObject(s, line.id, { intercept: snapValue(point.y - line.slope * point.x, settings) }));
  }, [pointerToMath, slide, settings]);

  /** Les flèches du clavier sur une poignée (§49). */
  const nudgeObject = useCallback((id, field, sign) => (dx, dy) => {
    step((s) => {
      const object = s.objects.find((o) => o.id === id);
      if (!object) return s;
      if (field === 'center') {
        return updateObject(s, id, { h: object.h + dx, k: object.k + dy });
      }
      const delta = (Math.abs(dx) > Math.abs(dy) ? dx : dy) * sign;

      return updateObject(s, id, { [field]: (object[field] ?? 0) + delta });
    });
  }, [step]);

  const nudgeProbe = useCallback((dx, dy) => {
    step((s) => (s.probe ? { ...s, probe: { x: s.probe.x + dx, y: s.probe.y + dy }, trace: null } : s));
  }, [step]);

  // ── §7 — L'ÉQUATION change la géométrie ───────────────────────────────

  /** Une équation acceptée remplace la conique sélectionnée, en gardant sa couleur. */
  const applyEquation = useCallback((conic) => {
    if (!current) return;
    step((s) => updateObject(s, current.id, { ...conic, id: current.id, color: current.color }));
    // La fenêtre s'ouvre sur la nouvelle courbe : elle vient d'ailleurs (§4).
    const features = C.conicFeatures(conic);
    const anchors = [
      features?.center, features?.vertex, ...(features?.vertices ?? []), ...(features?.foci ?? []),
    ].filter(Boolean);
    planeRef.current?.frame(anchors.length > 0 ? anchors : [{ x: conic.h, y: conic.k }]);
    setAnnouncement(t('tools.conics.announce.equationApplied'));
  }, [current, step, t]);

  /**
   * §26 — une équation de DROITE acceptée remplace la droite sélectionnée.
   *
   * Comme pour une conique, la fenêtre ne se recadre PAS sur une droite :
   * une droite traverse tout le plan, il n'y a rien à cadrer, et déplacer la
   * caméra ferait perdre à l'élève la conique qu'il regardait.
   */
  const applyLine = useCallback((id, line) => {
    step((s) => updateObject(s, id, line));
    setAnnouncement(t('tools.conics.announce.equationApplied'));
  }, [step, t]);

  // ── Les actions de la barre et des panneaux ───────────────────────────

  const setParameter = useCallback((id, field, value) => {
    slide((s) => updateObject(s, id, { [field]: value }));
  }, [slide]);

  const handleUndo = useCallback(() => {
    commit((d) => undo(d));
    setAnnouncement(t('tools.conics.announce.undone'));
  }, [commit, t]);

  const handleRedo = useCallback(() => {
    commit((d) => redo(d));
    setAnnouncement(t('tools.conics.announce.redone'));
  }, [commit, t]);

  const toggleSetting = useCallback((key) => {
    commit((d) => ({ ...d, settings: { ...d.settings, [key]: !d.settings[key] } }));
  }, [commit]);

  const setSetting = useCallback((key, value) => {
    commit((d) => ({ ...d, settings: { ...d.settings, [key]: value } }));
  }, [commit]);

  // ── §36 — PRÉDIRE → RÉVÉLER → VÉRIFIER ────────────────────────────────

  const nextChallenge = useCallback((kind = null) => {
    const next = generateChallenge(Math.random, kind ? { kind } : {});
    setChallenge(next);
    setVerdict(null);
    setHintIndex(-1);
    // La conique de la question devient la scène : l'élève la VOIT (§36).
    step((s) => {
      const target = s.objects.find(isConicObject);
      if (!target) return s;
      let updated = updateObject(s, target.id, { ...next.conic, id: target.id, color: target.color });
      // Les questions d'intersection posent aussi leur droite.
      const existingLine = updated.objects.find(isLineObject);
      if (next.line) {
        updated = existingLine
          ? updateObject(updated, existingLine.id, next.line)
          : addLine(updated, next.line);
      }
      if (next.point) updated = { ...updated, probe: next.point, trace: null };

      return { ...updated, selectedId: target.id };
    });
    setAnnouncement(t('tools.conics.announce.newChallenge'));
  }, [step, t]);

  const answerChallenge = useCallback((given) => {
    if (!challenge) return;
    const result = judge(challenge, given);
    setVerdict(result);
    commit((d) => ({
      ...d,
      practice: {
        solved: d.practice.solved + (result.correct ? 1 : 0),
        attempts: d.practice.attempts + 1,
      },
    }));
    setAnnouncement(result.correct
      ? t('tools.conics.announce.correct')
      : t('tools.conics.announce.incorrect'));
  }, [challenge, commit, t]);

  const revealHint = useCallback(() => setHintIndex((index) => index + 1), []);

  const enterPractice = useCallback(() => {
    commit((d) => ({ ...d, mode: 'practice' }));
    setTab('practice');
    if (!challenge) nextChallenge();
  }, [commit, challenge, nextChallenge]);

  /** §42 — on QUITTE l'entraînement quand on veut, sans rien perdre. */
  const leavePractice = useCallback(() => {
    commit((d) => ({ ...d, mode: 'free' }));
    setChallenge(null);
    setVerdict(null);
    setHintIndex(-1);
    setTab('controls');
  }, [commit]);

  // ── L'API offerte à la coquille (§45) ─────────────────────────────────
  useEffect(() => {
    onReady?.({
      clear: () => {
        const fresh = createConicsData();
        dataRef.current = fresh;
        setData(fresh);
        setChallenge(null);
        setVerdict(null);
        onChangeRef.current?.(serializeConicsData(fresh));
        planeRef.current?.resetView();
      },
      isGridEnabled: () => dataRef.current.settings.grid,
      toggleGrid: () => {
        const next = !dataRef.current.settings.grid;
        commit((d) => ({ ...d, settings: { ...d.settings, grid: next } }));

        return next;
      },
    });

    return () => onReady?.(null);
  }, [onReady, commit]);

  const onViewportChange = useCallback((viewport) => {
    commit((d) => ({ ...d, viewport }));
  }, [commit]);

  /** Un tap sur le plan déplace la sonde — le geste le plus direct de §10. */
  const onPlaneTap = useCallback(([x, y]) => {
    const point = snapPoint({ x, y }, settings);
    step((s) => ({ ...s, probe: point, trace: null }));
  }, [settings, step]);

  const conics = scene.objects.filter(isConicObject);

  return (
    <div className={`sa-ml-cn${panelOpen ? '' : ' sa-ml-cn--nopanel'}${compact ? ' sa-ml-cn--compact' : ''}`} data-ml-conics>
      {/* ── LE PLAN — l'élément visuel principal (§4) ──────────────────── */}
      <div className="sa-ml-cn__stage">
        <ConicPlane
          ref={planeRef}
          initialViewport={data.viewport}
          grid={settings.grid}
          onViewportChange={onViewportChange}
          onTap={onPlaneTap}
        >
          {({ view }) => (
            <>
              <ConicSceneLayer
                scene={scene}
                settings={settings}
                features={{ ...analysis, viewport: view }}
                intersections={analysis.intersections}
                highlight={highlight}
                reference={data.reference}
              />

              {/* ── LES POIGNÉES (§6) ───────────────────────────────── */}
              {conics.filter((conic) => conic.visible !== false).map((conic) => (
                <ConicHandles
                  key={`h-${conic.id}`}
                  conic={conic}
                  features={analysis.byId[conic.id]}
                  selected={conic.id === scene.selectedId}
                  onSelect={() => step((s) => ({ ...s, selectedId: conic.id }))}
                  onDragCenter={dragCenter(conic.id)}
                  onDragRadius={dragRadius(conic)}
                  onDragSemiAxis={dragSemiAxis}
                  onDragCoefficient={dragCoefficient(conic)}
                  onDragEnd={commitGesture}
                  onNudge={nudgeObject}
                  t={t}
                />
              ))}

              {/* La poignée d'une DROITE (§26) */}
              {scene.objects.filter(isLineObject).filter((line) => line.visible !== false).map((line) => (
                <DragHandle
                  key={`lh-${line.id}`}
                  position={lineHandlePosition(line, view)}
                  color={line.color}
                  shape="square"
                  kind="line"
                  selected={line.id === scene.selectedId}
                  ariaLabel={t('tools.conics.handles.line')}
                  onSelect={() => step((s) => ({ ...s, selectedId: line.id }))}
                  onDrag={dragLine(line)}
                  onDragEnd={commitGesture}
                  onNudge={(dx, dy) => step((s) => (line.vertical
                    ? updateObject(s, line.id, { x: line.x + dx })
                    : updateObject(s, line.id, { intercept: line.intercept + dy })))}
                />
              ))}

              {/* Le point TRACÉ (§34), ou la SONDE (§10) */}
              {analysis.tracePoint ? (
                <DragHandle
                  position={analysis.tracePoint}
                  color={analysis.tracePoint.color}
                  kind="trace"
                  radius={7}
                  selected
                  label={settings.labels ? 'P' : null}
                  ariaLabel={t('tools.conics.handles.trace')}
                  onDrag={dragTrace(conics.find((c) => c.id === analysis.tracePoint.targetId) ?? conics[0])}
                  onDragEnd={commitGesture}
                  onNudge={(dx) => slide((s) => ({
                    ...s, trace: { ...s.trace, t: s.trace.t + dx * 0.1 },
                  }))}
                />
              ) : scene.probe ? (
                <DragHandle
                  position={scene.probe}
                  color="#0f172a"
                  kind="probe"
                  radius={7}
                  label={settings.labels ? 'P' : null}
                  ariaLabel={t('tools.conics.handles.probe')}
                  onDrag={dragProbe}
                  onDragEnd={commitGesture}
                  onNudge={nudgeProbe}
                />
              ) : null}
            </>
          )}
        </ConicPlane>

        {/* La barre d'actions flottante */}
        <div className="sa-ml-cn__stagebar">
          <button
            type="button"
            className="sa-ml-btn sa-ml-btn--icon"
            onClick={handleUndo}
            disabled={!canUndo(data)}
            aria-label={t('tools.conics.undo')}
            title={t('tools.conics.undo')}
            data-ml-cn-undo
          >
            <Undo2 size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="sa-ml-btn sa-ml-btn--icon"
            onClick={handleRedo}
            disabled={!canRedo(data)}
            aria-label={t('tools.conics.redo')}
            title={t('tools.conics.redo')}
            data-ml-cn-redo
          >
            <Redo2 size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={`sa-ml-btn sa-ml-btn--icon${data.reference ? ' sa-ml-btn--active' : ''}`}
            onClick={() => commit((d) => (d.reference ? clearReference(d) : freezeReference(d)))}
            aria-pressed={Boolean(data.reference)}
            aria-label={t(data.reference ? 'tools.conics.reference.clear' : 'tools.conics.reference.freeze')}
            title={t(data.reference ? 'tools.conics.reference.clear' : 'tools.conics.reference.freeze')}
            data-ml-cn-reference
          >
            {data.reference ? <CameraOff size={18} aria-hidden="true" /> : <Camera size={18} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* ── LE PANNEAU ─────────────────────────────────────────────────── */}
      <button
        type="button"
        className="sa-ml-cn__toggle"
        onClick={() => setPanelOpen((open) => !open)}
        aria-expanded={panelOpen}
        aria-label={t(panelOpen ? 'tools.conics.hidePanel' : 'tools.conics.showPanel')}
        data-ml-cn-toggle
      >
        {panelOpen ? <PanelBottomClose size={18} aria-hidden="true" /> : <PanelBottomOpen size={18} aria-hidden="true" />}
      </button>

      {panelOpen && (
        <aside className="sa-ml-cn__panel" data-ml-cn-panel>
          <div className="sa-ml-cn__tabs" role="tablist" aria-label={t('tools.conics.tabs.label')}>
            <TabButton id="controls" active={tab} onSelect={setTab} icon={SlidersHorizontal} label={t('tools.conics.tabs.controls')} />
            <TabButton id="inspector" active={tab} onSelect={setTab} icon={Sigma} label={t('tools.conics.tabs.inspector')} />
            <TabButton id="practice" active={tab} onSelect={setTab} icon={GraduationCap} label={t('tools.conics.tabs.practice')} />
          </div>

          <div className="sa-ml-cn__panelbody">
            {tab === 'controls' && (
              <ConicControls
                scene={scene}
                settings={settings}
                selected={currentObject}
                features={currentFeatures}
                onSelect={(id) => step((s) => ({ ...s, selectedId: id }))}
                onChangeKind={(id, kind) => step((s) => changeKind(s, id, kind))}
                onParameter={setParameter}
                onParameterCommit={commitGesture}
                onToggleSetting={toggleSetting}
                onSetSetting={setSetting}
                onAddConic={(kind) => step((s) => addConic(s, {
                  kind,
                  h: 0,
                  k: 0,
                  r: 2,
                  a: kind === 'parabola' ? 0.5 : 3,
                  b: 2,
                  orientation: 'horizontal',
                  color: CONIC_PALETTE[s.objects.filter(isConicObject).length % CONIC_PALETTE.length],
                }))}
                onAddLine={() => step((s) => addLine(s, { slope: 1, intercept: 0 }))}
                onRemove={(id) => step((s) => removeObject(s, id))}
                onToggleVisible={(id, visible) => step((s) => updateObject(s, id, { visible }))}
                onTransform={(action) => step((s) => {
                  const target = s.objects.find((o) => o.id === s.selectedId && isConicObject(o));
                  if (!target) return s;
                  const moved = action.kind === 'translate'
                    ? C.translateConic(target, action.dx, action.dy)
                    : action.kind === 'reflect'
                      ? C.reflectConic(target, action.axis)
                      : C.rotateConic(target, action.quarterTurns);

                  return moved ? updateObject(s, target.id, moved) : s;
                })}
                onSetLocus={(locus) => step((s) => ({ ...s, locus }))}
                onTrace={(conicId) => step((s) => ({
                  ...s,
                  trace: conicId ? { targetId: conicId, t: 0.6, branch: 1 } : null,
                }))}
                t={t}
              />
            )}

            {tab === 'inspector' && (
              <ConicInspector
                conic={current}
                features={currentFeatures}
                analysis={analysis}
                reference={data.reference}
                selected={currentObject}
                onApplyEquation={applyEquation}
                onApplyLine={applyLine}
                t={t}
              />
            )}

            {tab === 'practice' && (
              <PracticePanel
                mode={data.mode}
                challenge={challenge}
                verdict={verdict}
                hintIndex={hintIndex}
                practice={data.practice}
                onStart={enterPractice}
                onNext={nextChallenge}
                onAnswer={answerChallenge}
                onHint={revealHint}
                onLeave={leavePractice}
                t={t}
              />
            )}
          </div>
        </aside>
      )}

      {/* §49 — ce qui vient de changer, pour un lecteur d'écran. */}
      <p className="sa-ml-cn__sr" role="status" aria-live="polite">{announcement}</p>
    </div>
  );
}

function TabButton({ id, active, onSelect, icon: Icon, label }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active === id}
      className={`sa-ml-cn__tab${active === id ? ' sa-ml-cn__tab--active' : ''}`}
      onClick={() => onSelect(id)}
      data-ml-cn-tab={id}
    >
      <Icon size={16} aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}

/**
 * LES POIGNÉES d'une conique (§6) — une par paramètre manipulable.
 *
 * Chaque famille expose exactement les poignées que sa forme canonique
 * possède : le cercle son centre et son rayon, la parabole son sommet et sa
 * largeur, l'ellipse et l'hyperbole leur centre et leurs deux demi-axes.
 * Aucune poignée ne fait deux choses à la fois — c'est ce qui rend le lien
 * geste → paramètre → équation lisible.
 */
function ConicHandles({
  conic, selected, onSelect, onDragCenter, onDragRadius, onDragSemiAxis,
  onDragCoefficient, onDragEnd, onNudge, t,
}) {
  const center = { x: conic.h, y: conic.k };
  const handles = [];

  handles.push(
    <DragHandle
      key="center"
      position={center}
      color={conic.color}
      shape="cross"
      kind="center"
      radius={7}
      selected={selected}
      ariaLabel={t(conic.kind === 'parabola' ? 'tools.conics.handles.vertex' : 'tools.conics.handles.center')}
      onSelect={onSelect}
      onDrag={onDragCenter}
      onDragEnd={onDragEnd}
      onNudge={onNudge(conic.id, 'center')}
    />,
  );

  if (conic.kind === 'circle') {
    handles.push(
      <DragHandle
        key="r"
        position={{ x: conic.h + conic.r, y: conic.k }}
        color={conic.color}
        kind="radius"
        ariaLabel={t('tools.conics.handles.radius')}
        onSelect={onSelect}
        onDrag={onDragRadius}
        onDragEnd={onDragEnd}
        onNudge={onNudge(conic.id, 'r', 1)}
      />,
    );
  }

  if (conic.kind === 'ellipse' || conic.kind === 'hyperbola') {
    handles.push(
      <DragHandle
        key="a"
        position={{ x: conic.h + conic.a, y: conic.k }}
        color={conic.color}
        kind="semiA"
        ariaLabel={t('tools.conics.handles.semiA')}
        onSelect={onSelect}
        onDrag={(x, y) => onDragSemiAxis(conic, 'a')(x, y)}
        onDragEnd={onDragEnd}
        onNudge={onNudge(conic.id, 'a', 1)}
      />,
      <DragHandle
        key="b"
        position={{ x: conic.h, y: conic.k + conic.b }}
        color={conic.color}
        kind="semiB"
        ariaLabel={t('tools.conics.handles.semiB')}
        onSelect={onSelect}
        onDrag={(x, y) => onDragSemiAxis(conic, 'b')(x, y)}
        onDragEnd={onDragEnd}
        onNudge={onNudge(conic.id, 'b', 1)}
      />,
    );
  }

  if (conic.kind === 'parabola') {
    const vertical = C.orientationOf(conic) === 'vertical';
    handles.push(
      <DragHandle
        key="a"
        position={vertical
          ? { x: conic.h + conic.a, y: conic.k + 1 }
          : { x: conic.h + 1, y: conic.k + conic.a }}
        color={conic.color}
        kind="coefficient"
        ariaLabel={t('tools.conics.handles.coefficient')}
        onSelect={onSelect}
        onDrag={onDragCoefficient}
        onDragEnd={onDragEnd}
        onNudge={onNudge(conic.id, 'a', 1)}
      />,
    );
  }

  return <>{handles}</>;
}

/**
 * Où poser la poignée d'une droite : au MILIEU de ce qui est visible.
 *
 * Une droite n'a pas de point privilégié ; la prendre au centre de la
 * fenêtre garantit qu'elle est toujours attrapable, à tout zoom.
 */
function lineHandlePosition(line, view) {
  if (!view) return null;
  if (line.vertical) return { x: line.x, y: (view.yMin + view.yMax) / 2 };
  const x = (view.xMin + view.xMax) / 2;

  return { x, y: line.slope * x + line.intercept };
}
