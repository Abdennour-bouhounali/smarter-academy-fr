import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PanelBottomClose, PanelBottomOpen, Play, Pause, RotateCcw, SlidersHorizontal, Sigma, GraduationCap,
} from 'lucide-react';
import './transformations.css';
import TransformPlane from './TransformPlane.jsx';
import SceneLayer from './SceneLayer.jsx';
import DragHandle from './DragHandle.jsx';
import TransformInspector from './TransformInspector.jsx';
import TransformControls from './TransformControls.jsx';
import StepStack from './StepStack.jsx';
import PracticePanel from './PracticePanel.jsx';
import * as M from './transformMath.js';
import { matrixAtFraction, resolveCenter, finalFigure } from './transformModel.js';
import {
  normalizeTransformationsData, serializeTransformationsData, createTransformationsData,
  currentScene, pushScene, replaceScene, undo, redo, canUndo, canRedo, resolveData,
  addFigure, moveVertex, addStep, updateStep, removeStep,
  toggleStep, moveStep, setSteps, emptyScene, defaultScene,
  MAX_FIGURES, DEFAULT_TRANSFORM_VIEWPORT, VERTEX_NAMES,
} from './transformState.js';
import {
  generateChallenge, checkAnswer, getPuzzle, puzzleTarget, isPuzzleSolved,
  getExperiment, patternCopies, isImageHidden, maskImages, practiceFrame,
} from './practice.js';
import { clampToFeatures, transformationsFeatures } from './scope.js';

/** Le délai entre un changement et sa remise à la coquille (qui attend encore avant d'enregistrer). */
const SERIALIZE_MS = 300;

/** La durée d'une animation complète, à vitesse 1 (§12). */
const ANIMATION_MS = 1400;

/**
 * Le مختبر التحويلات dans la coquille du مختبر (MathLabToolProps).
 *
 *     on attrape un sommet → la figure suit → l'image suit → les mesures
 *     suivent → les invariants se recalculent → une loi apparaît
 *
 * L'état du document (`transformState.js`) vit ICI ; toute la mathématique
 * est dans les modules purs que ce composant se contente d'appeler — aucun
 * calcul dans le JSX.
 *
 * ── Ce qui n'est PAS persisté ────────────────────────────────────────────
 * L'animation (sa fraction, son pas, play/pause, la vitesse), la question
 * d'entraînement courante, le panneau ouvert et l'onglet actif n'ont AUCUN
 * champ dans `data` : ils ne peuvent donc pas y arriver par accident, et
 * rouvrir un document ne rejoue pas une animation à moitié faite.
 */
export default function TransformationsTool({ initialData, onChange, onReady, capabilities = null }) {
  const { t } = useTranslation('mathlab');
  // Le مخبر (scope.js) : au collège, une transformation à la fois, sans composition ni matrice.
  const features = useMemo(() => transformationsFeatures(capabilities), [capabilities]);
  const [data, setData] = useState(() => clampToFeatures(initialData && Object.keys(initialData).length
    ? normalizeTransformationsData(initialData)
    : createTransformationsData(), features));

  // ── L'état d'INTERFACE : jamais sérialisé ──────────────────────────────
  const [panelOpen, setPanelOpen] = useState(true);
  const [tab, setTab] = useState('stack');
  const [activeStepId, setActiveStepId] = useState(null);
  const [animation, setAnimation] = useState(null);   // { stepIndex, fraction, playing }
  const [challenge, setChallenge] = useState(null);
  const [verdict, setVerdict] = useState(null);
  const [pattern, setPattern] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  const [reducedMotion, setReducedMotion] = useState(false);

  const planeRef = useRef(null);
  const timerRef = useRef(null);
  const rafRef = useRef(null);
  const dataRef = useRef(data);
  const onChangeRef = useRef(onChange);
  const dragRef = useRef(null);
  onChangeRef.current = onChange;
  dataRef.current = data;

  /** §53 : le mouvement réduit est respecté — l'animation devient un saut. */
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReducedMotion(query.matches);
    apply();
    query.addEventListener?.('change', apply);

    return () => query.removeEventListener?.('change', apply);
  }, []);

  /** Une modification voulue : appliquée tout de suite, remise à la coquille après SERIALIZE_MS. */
  const commit = useCallback((updater) => {
    setData((current) => {
      const next = typeof updater === 'function' ? updater(current) : updater;
      if (next === current) return current;
      dataRef.current = next;
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        onChangeRef.current?.(serializeTransformationsData(dataRef.current));
      }, SERIALIZE_MS);

      return next;
    });
  }, []);

  useEffect(() => () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      onChangeRef.current?.(serializeTransformationsData(dataRef.current));
    }
    cancelAnimationFrame(rafRef.current);
  }, []);

  // ── Ce que l'écran lit : UN calcul par rendu ─────────────────────────
  const scene = currentScene(data);
  // Tant qu'une question attend sa réponse, l'image n'existe pas pour l'écran :
  // ni sur le plan, ni dans l'inspecteur (sinon la réponse est lue avant d'être donnée).
  const hideImage = isImageHidden({ mode: data.mode, challenge, verdict });
  const resolved = useMemo(() => {
    const full = resolveData(data);

    return hideImage ? maskImages(full) : full;
  }, [data, hideImage]);
  const { settings } = data;
  const firstFigure = resolved.figures[0] ?? null;

  /** Le pas sur lequel portent l'axe, le centre et le شعاع dessinés. */
  const effectiveStepId = activeStepId && scene.steps.some((step) => step.id === activeStepId)
    ? activeStepId
    : scene.steps[0]?.id ?? null;

  // ── §12 : l'animation ───────────────────────────────────────────────
  const animationFigures = useMemo(() => {
    if (!animation || !firstFigure || hideImage) return null;
    const step = scene.steps[animation.stepIndex];
    if (!step) return null;
    // Les pas AVANT celui qu'on anime sont déjà appliqués ; celui-ci est à `fraction`.
    const before = firstFigure.stages[animation.stepIndex - 1]?.vertices ?? firstFigure.figure.vertices;
    const matrix = matrixAtFraction(step, firstFigure.figure.vertices, animation.fraction);
    if (!matrix) return null;

    return { [firstFigure.figure.id]: before.map((vertex) => M.applyMatrix(matrix, vertex)) };
  }, [animation, firstFigure, scene.steps, hideImage]);

  const startAnimation = useCallback((stepId) => {
    const index = scene.steps.findIndex((step) => step.id === stepId);
    if (index < 0) return;
    setActiveStepId(stepId);
    if (reducedMotion) {
      // §53 : pas de mouvement — on montre l'état final, et on le DIT.
      setAnimation({ stepIndex: index, fraction: 1, playing: false });
      setAnnouncement(t('tools.transformations.a11y.appliedAtOnce'));

      return;
    }
    setAnimation({ stepIndex: index, fraction: 0, playing: true });
  }, [scene.steps, reducedMotion, t]);

  const [speed, setSpeed] = useState(1);
  const speedRef = useRef(speed);
  speedRef.current = speed;

  useEffect(() => {
    if (!animation?.playing) return undefined;
    let last = performance.now();
    const tick = (now) => {
      const elapsed = now - last;
      last = now;
      setAnimation((current) => {
        if (!current?.playing) return current;
        const next = current.fraction + (elapsed / ANIMATION_MS) * speedRef.current;
        if (next >= 1) return { ...current, fraction: 1, playing: false };

        return { ...current, fraction: next };
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
  }, [animation?.playing]);

  // ── §5 : attraper un sommet ─────────────────────────────────────────
  const snapIfEnabled = useCallback((point, shiftHeld) => {
    // Shift suspend l'accrochage : l'exploration libre est toujours à portée (§34).
    if (!settings.snap || shiftHeld) return M.cleanPoint(point);

    return M.cleanPoint(M.snapPoint(point, settings.snapStep));
  }, [settings.snap, settings.snapStep]);

  const handleVertexDrag = useCallback((figureId, index) => (clientX, clientY, modifiers) => {
    const position = planeRef.current?.toMath(clientX, clientY);
    if (!position) return;
    const snapped = snapIfEnabled({ x: position[0], y: position[1] }, modifiers?.shift);
    if (!dragRef.current) dragRef.current = { figureId, kind: 'vertex' };
    commit((current) => replaceScene(current, moveVertex(currentScene(current), figureId, index, snapped.x, snapped.y)));
  }, [commit, snapIfEnabled]);

  /** La fin d'un geste : UN seul pas d'historique pour tout le glissement (§48). */
  const handleDragEnd = useCallback(() => {
    if (!dragRef.current) return;
    dragRef.current = null;
    commit((current) => pushScene(current, currentScene(current)));
  }, [commit]);

  const nudgeVertex = useCallback((figureId, index) => (dx, dy) => {
    commit((current) => {
      const active = currentScene(current);
      const vertex = active.figures.find((figure) => figure.id === figureId)?.vertices[index];
      if (!vertex) return current;
      const stepSize = settings.snap ? settings.snapStep : 0.1;

      return pushScene(current, moveVertex(active, figureId, index, vertex.x + dx * stepSize, vertex.y + dy * stepSize));
    });
  }, [commit, settings.snap, settings.snapStep]);

  /** Le CENTRE d'une rotation / homothétie, attrapé et tiré (§10, §11). */
  const handleCenterDrag = useCallback((stepId) => (clientX, clientY, modifiers) => {
    const position = planeRef.current?.toMath(clientX, clientY);
    if (!position) return;
    const snapped = snapIfEnabled({ x: position[0], y: position[1] }, modifiers?.shift);
    if (!dragRef.current) dragRef.current = { stepId, kind: 'center' };
    commit((current) => {
      const active = currentScene(current);
      const step = active.steps.find((candidate) => candidate.id === stepId);
      if (!step) return current;
      const patch = step.kind === 'reflection'
        ? { axis: { ...step.axis, center: { type: 'point', point: snapped } } }
        : { center: { type: 'point', point: snapped } };

      return replaceScene(current, updateStep(active, stepId, patch));
    });
  }, [commit, snapIfEnabled]);

  /** L'AXE d'une réflexion, attrapé par un de ses deux points (§16). */
  const handleAxisPointDrag = useCallback((stepId, which) => (clientX, clientY, modifiers) => {
    const position = planeRef.current?.toMath(clientX, clientY);
    if (!position) return;
    const snapped = snapIfEnabled({ x: position[0], y: position[1] }, modifiers?.shift);
    if (!dragRef.current) dragRef.current = { stepId, kind: 'axis' };
    commit((current) => {
      const active = currentScene(current);
      const step = active.steps.find((candidate) => candidate.id === stepId);
      if (!step || step.axis?.type !== 'twoPoints') return current;

      return replaceScene(current, updateStep(active, stepId, { axis: { ...step.axis, [which]: snapped } }));
    });
  }, [commit, snapIfEnabled]);

  /** Le bout du شعاع d'un انسحاب, tiré à la main (§7, §9). */
  const handleVectorTipDrag = useCallback((stepId) => (clientX, clientY, modifiers) => {
    const position = planeRef.current?.toMath(clientX, clientY);
    if (!position) return;
    const origin = firstFigure?.figure.vertices[0];
    if (!origin) return;
    const snapped = snapIfEnabled({ x: position[0], y: position[1] }, modifiers?.shift);
    if (!dragRef.current) dragRef.current = { stepId, kind: 'vector' };
    commit((current) => replaceScene(current, updateStep(currentScene(current), stepId, {
      vx: M.cleanNumber(snapped.x - origin.x),
      vy: M.cleanNumber(snapped.y - origin.y),
    })));
  }, [commit, snapIfEnabled, firstFigure]);

  // ── Les gestes sur le document ──────────────────────────────────────
  const pushSceneChange = useCallback((mutate) => {
    commit((current) => pushScene(current, mutate(currentScene(current))));
  }, [commit]);

  /**
   * Une scène POSÉE d'un bloc (expérience, question, puzzle, remise à zéro).
   *
   * Elle remplace tout ce qui était là : la fenêtre enregistrée ne cadre plus
   * rien, et l'élève se retrouverait devant un plan vide ou une figure
   * minuscule dans un coin — c'est exactement ce qu'une capture de la QA a
   * montré. On repose donc la scène ET la vue, ensemble.
   */
  const installScene = useCallback((prepared, patch = {}, framed = null) => {
    commit((current) => ({ ...pushScene(current, prepared), viewport: null, ...patch }));
    // On cadre sur l'original ET sur son image : les deux doivent être à
    // l'écran, sinon l'élève ne peut pas les COMPARER (§22). Une question,
    // elle, fournit son propre cadrage — qui ne trahit pas la réponse.
    const vertices = framed ?? prepared.figures.flatMap((figure) => [
      ...figure.vertices,
      ...finalFigure(figure.vertices, prepared.steps),
    ]);
    planeRef.current?.frame(vertices);
    setActiveStepId(null);
    setAnimation(null);
    setPattern(0);
  }, [commit]);

  const handleAddFigure = useCallback((kind) => {
    const vertices = figureTemplate(kind);
    pushSceneChange((active) => addFigure(active, kind, vertices));
  }, [pushSceneChange]);

  const handleClearFigures = useCallback(() => {
    pushSceneChange((active) => ({ ...active, figures: [] }));
  }, [pushSceneChange]);

  const handleSettingChange = useCallback((key, value) => {
    commit((current) => ({ ...current, settings: { ...current.settings, [key]: value } }));
  }, [commit]);

  /**
   * Ajouter un pas. Là où le مخبر n'en permet qu'UN (le collège : pas de
   * composition), le nouveau REMPLACE l'ancien — sinon un préréglage choisi
   * ne ferait rien.
   */
  const addOrReplaceStep = useCallback((kind, overrides) => {
    if (!features.kinds.includes(kind)) return;
    pushSceneChange((active) => {
      const room = active.steps.length < features.maxSteps
        ? active
        : setSteps(active, active.steps.slice(0, Math.max(0, features.maxSteps - 1)));

      return addStep(room, kind, overrides);
    });
  }, [pushSceneChange, features]);

  const handlePreset = useCallback((preset) => {
    addOrReplaceStep(preset.step.kind, preset.step);
    setTab('stack');
  }, [addOrReplaceStep]);

  const handleExperiment = useCallback((id) => {
    const experiment = getExperiment(id);
    if (!experiment || !features.experiments.some((entry) => entry.id === id)) return;
    // La scène de l'expérience est construite EN UNE FOIS, puis poussée :
    // un seul pas d'historique, donc un seul « تراجع » pour revenir.
    const prepared = setSteps(
      addFigure(emptyScene(), 'polygon', experiment.figure),
      experiment.steps,
    );
    installScene(prepared, { mode: 'free', puzzle: null });
    commit((current) => ({
      ...current,
      settings: { ...current.settings, showOriginal: true, showMeasures: true, showInvariants: true },
    }));
    setAnnouncement(t(`tools.transformations.${experiment.promptKey}`));
  }, [installScene, commit, t, features]);

  // ── §38 : l'entraînement ────────────────────────────────────────────
  const handleNewChallenge = useCallback(() => {
    const next = generateChallenge(Math.random, { kinds: features.challenges, stepKinds: features.kinds });
    setChallenge(next);
    setVerdict(null);
    // La scène MONTRE la question : le point et la pile demandée — mais pas
    // l'image, masquée tant qu'il n'y a pas de verdict (`isImageHidden`).
    const prepared = setSteps(addFigure(emptyScene(), 'point', [next.point]), next.steps);
    installScene(prepared, { mode: 'practice', puzzle: null }, practiceFrame(next, false, DEFAULT_TRANSFORM_VIEWPORT));
  }, [installScene, features]);

  const handleSubmitAnswer = useCallback((given) => {
    if (!challenge || verdict) return;
    const result = checkAnswer(challenge, given);
    setVerdict(result);
    commit((current) => ({
      ...current,
      practice: {
        solved: current.practice.solved + (result.correct ? 1 : 0),
        attempts: current.practice.attempts + 1,
      },
    }));
    // §38 : on ANIME la transformation — la figure montre la réponse, et la
    // vue s'élargit pour que le point ET son image soient à l'écran.
    planeRef.current?.frame(practiceFrame(challenge, true, DEFAULT_TRANSFORM_VIEWPORT));
    const firstStepId = currentScene(dataRef.current).steps[0]?.id;
    if (firstStepId) startAnimation(firstStepId);
    setAnnouncement(result.correct
      ? t('tools.transformations.practice.correct')
      : t('tools.transformations.a11y.expected', { x: result.expected.x, y: result.expected.y }));
  }, [challenge, verdict, commit, startAnimation, t]);

  const handleReveal = useCallback(() => {
    if (!challenge || verdict) return;
    setVerdict({ correct: false, expected: challenge.answer, revealed: true });
    planeRef.current?.frame(practiceFrame(challenge, true, DEFAULT_TRANSFORM_VIEWPORT));
    const firstStepId = currentScene(dataRef.current).steps[0]?.id;
    if (firstStepId) startAnimation(firstStepId);
  }, [challenge, verdict, startAnimation]);

  // ── §42 : les puzzles ───────────────────────────────────────────────
  const handlePuzzle = useCallback((id) => {
    const puzzle = getPuzzle(id);
    if (!puzzle || !features.puzzles.some((entry) => entry.id === id)) return;
    const prepared = addFigure(emptyScene(), 'triangle', puzzle.figure);
    installScene(prepared, { mode: 'puzzle', puzzle: { id, solved: false } });
    setChallenge(null);
    setVerdict(null);
  }, [installScene, features]);

  const handleExitPuzzle = useCallback(() => {
    commit((current) => ({ ...current, mode: 'free', puzzle: null }));
  }, [commit]);

  const activePuzzle = data.puzzle ? getPuzzle(data.puzzle.id) : null;
  const target = activePuzzle ? puzzleTarget(activePuzzle) : null;

  /** Le puzzle se juge à CHAQUE changement : l'élève n'a pas de bouton « vérifier ». */
  useEffect(() => {
    if (!activePuzzle || !firstFigure || data.puzzle?.solved) return;
    if (isPuzzleSolved(activePuzzle, firstFigure.image)) {
      commit((current) => (current.puzzle && !current.puzzle.solved
        ? { ...current, puzzle: { ...current.puzzle, solved: true } }
        : current));
      setAnnouncement(t('tools.transformations.puzzles.solved'));
    }
  }, [activePuzzle, firstFigure, data.puzzle?.solved, commit, t]);

  // ── §37 : le motif ──────────────────────────────────────────────────
  const patternFigures = useMemo(() => {
    if (!pattern || !firstFigure || hideImage) return null;
    const step = scene.steps.find((candidate) => candidate.id === effectiveStepId) ?? scene.steps[0];
    if (!step) return null;

    return patternCopies(firstFigure.figure.vertices, step, pattern);
  }, [pattern, firstFigure, scene.steps, effectiveStepId, hideImage]);

  // ── La coquille : « مسح الكل » et la grille ─────────────────────────
  useEffect(() => {
    onReady?.({
      clear: () => {
        commit((current) => ({
          ...pushScene(current, defaultScene()),
          viewport: null,
          mode: 'free',
          puzzle: null,
          practice: { solved: 0, attempts: 0 },
        }));
        planeRef.current?.resetView();
        setChallenge(null);
        setVerdict(null);
        setAnimation(null);
        setActiveStepId(null);
        setPattern(0);
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

  const activeStep = scene.steps.find((step) => step.id === effectiveStepId) ?? null;

  return (
    <div className="sa-ml-tr" data-ml-tool="transformations" data-ml-mode={data.mode}>
      <div className="sa-ml-tr__stage">
        <TransformPlane
          ref={planeRef}
          initialViewport={data.viewport}
          grid={settings.grid}
          defaultViewport={DEFAULT_TRANSFORM_VIEWPORT}
          onViewportChange={(viewport) => commit((current) => ({ ...current, viewport }))}
        >
          {({ view }) => (
            <>
              <SceneLayer
                figures={resolved.figures}
                steps={scene.steps}
                settings={settings}
                activeStepId={effectiveStepId}
                selection={data.selection}
                animationFigures={animationFigures}
                patternFigures={patternFigures}
                targetFigure={target}
                hideImage={hideImage}
                view={view}
              />

              {/* Les poignées des SOMMETS : ce qu'on attrape (§5). */}
              {resolved.figures.map(({ figure }) => figure.visible && figure.vertices.map((vertex, index) => (
                <DragHandle
                  key={`${figure.id}-${index}`}
                  position={vertex}
                  color={figure.color}
                  label={settings.labels ? VERTEX_NAMES[index] : null}
                  ariaLabel={t('tools.transformations.a11y.vertex', {
                    name: VERTEX_NAMES[index],
                    x: formatForSpeech(vertex.x),
                    y: formatForSpeech(vertex.y),
                  })}
                  onDrag={handleVertexDrag(figure.id, index)}
                  onDragEnd={handleDragEnd}
                  onNudge={nudgeVertex(figure.id, index)}
                  kind="vertex"
                />
              )))}

              {/* La poignée du CENTRE (§11) ou du bout du شعاع (§7). */}
              {/* Masqué avant le verdict : le bout du شعاع tiré depuis A EST A′. */}
              {activeStep?.kind === 'translation' && firstFigure && !hideImage && (
                <DragHandle
                  position={{
                    x: firstFigure.figure.vertices[0].x + Number(activeStep.vx),
                    y: firstFigure.figure.vertices[0].y + Number(activeStep.vy),
                  }}
                  color="#7c3aed"
                  shape="square"
                  ariaLabel={t('tools.transformations.a11y.vectorTip')}
                  onDrag={handleVectorTipDrag(activeStep.id)}
                  onDragEnd={handleDragEnd}
                  kind="vector-tip"
                />
              )}

              {(activeStep?.kind === 'rotation' || activeStep?.kind === 'dilation'
                || (activeStep?.kind === 'reflection' && activeStep.axis?.type === 'origin')) && (
                <DragHandle
                  position={activeStep.kind === 'reflection'
                    ? resolveCenter(activeStep.axis?.center, firstFigure?.figure.vertices ?? [])
                    : resolveCenter(activeStep.center, firstFigure?.figure.vertices ?? [])}
                  color="#be123c"
                  shape="cross"
                  ariaLabel={t('tools.transformations.a11y.center')}
                  onDrag={handleCenterDrag(activeStep.id)}
                  onDragEnd={handleDragEnd}
                  kind="center"
                />
              )}

              {/* Les deux points qui DÉFINISSENT l'axe libre (§16). */}
              {activeStep?.kind === 'reflection' && activeStep.axis?.type === 'twoPoints' && (
                <>
                  <DragHandle
                    position={activeStep.axis.a}
                    color="#be123c"
                    shape="square"
                    ariaLabel={t('tools.transformations.a11y.axisPoint', { index: 1 })}
                    onDrag={handleAxisPointDrag(activeStep.id, 'a')}
                    onDragEnd={handleDragEnd}
                    kind="axis-a"
                  />
                  <DragHandle
                    position={activeStep.axis.b}
                    color="#be123c"
                    shape="square"
                    ariaLabel={t('tools.transformations.a11y.axisPoint', { index: 2 })}
                    onDrag={handleAxisPointDrag(activeStep.id, 'b')}
                    onDragEnd={handleDragEnd}
                    kind="axis-b"
                  />
                </>
              )}
            </>
          )}
        </TransformPlane>

        {/* §12 : les commandes de l'animation, sur le plan. */}
        {animation && (
          <div className="sa-ml-tr__animbar" data-ml-animbar>
            <button
              type="button"
              className="sa-ml-btn sa-ml-btn--icon"
              onClick={() => setAnimation((current) => ({ ...current, playing: !current.playing, fraction: current.fraction >= 1 ? 0 : current.fraction }))}
              aria-label={t(animation.playing ? 'tools.transformations.animation.pause' : 'tools.transformations.animation.play')}
              data-ml-anim-toggle
            >
              {animation.playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
            </button>
            <input
              type="range"
              className="sa-ml-tr__slider sa-ml-tr__animslider"
              min={0} max={1} step={0.01}
              value={animation.fraction}
              dir="ltr"
              onChange={(event) => setAnimation((current) => ({ ...current, fraction: Number(event.target.value), playing: false }))}
              aria-label={t('tools.transformations.animation.scrub')}
              data-ml-anim-scrub
            />
            <label className="sa-ml-tr__speed">
              <span className="sa-ml-tr__sr">{t('tools.transformations.animation.speed')}</span>
              <select value={speed} onChange={(event) => setSpeed(Number(event.target.value))} data-ml-anim-speed>
                <option value={0.5}>0,5×</option>
                <option value={1}>1×</option>
                <option value={2}>2×</option>
              </select>
            </label>
            <button
              type="button"
              className="sa-ml-btn sa-ml-btn--icon"
              onClick={() => setAnimation(null)}
              aria-label={t('tools.transformations.animation.close')}
              data-ml-anim-close
            >
              <RotateCcw size={16} aria-hidden="true" />
            </button>
          </div>
        )}

        <button
          type="button"
          className="sa-ml-btn sa-ml-tr__paneltoggle"
          onClick={() => setPanelOpen((open) => !open)}
          aria-expanded={panelOpen}
          data-ml-panel-toggle
        >
          {panelOpen ? <PanelBottomClose size={16} aria-hidden="true" /> : <PanelBottomOpen size={16} aria-hidden="true" />}
          <span>{t(panelOpen ? 'tools.transformations.hidePanel' : 'tools.transformations.showPanel')}</span>
        </button>
      </div>

      {panelOpen && (
        <aside className="sa-ml-tr__panel" data-ml-panel>
          <nav className="sa-ml-tr__tabs" role="tablist" aria-label={t('tools.transformations.tabs.label')}>
            {[
              ['stack', SlidersHorizontal],
              ['inspector', Sigma],
              ['practice', GraduationCap],
            ].map(([id, Icon]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                className={`sa-ml-tr__tab${tab === id ? ' sa-ml-tr__tab--on' : ''}`}
                onClick={() => setTab(id)}
                data-ml-tab={id}
              >
                <Icon size={15} aria-hidden="true" />
                <span>{t(`tools.transformations.tabs.${id}`)}</span>
              </button>
            ))}
          </nav>

          <div className="sa-ml-tr__panelbody">
            {tab === 'stack' && (
              <>
                <StepStack
                  steps={scene.steps}
                  activeStepId={effectiveStepId}
                  maxSteps={features.maxSteps}
                  kinds={features.kinds}
                  vertexCount={firstFigure?.figure.vertices.length ?? 0}
                  onSelect={(id) => setActiveStepId((current) => (current === id ? null : id))}
                  onAdd={(kind) => addOrReplaceStep(kind)}
                  onUpdate={(id, patch) => commit((current) => replaceScene(current, updateStep(currentScene(current), id, patch)))}
                  onRemove={(id) => pushSceneChange((active) => removeStep(active, id))}
                  onToggle={(id) => pushSceneChange((active) => toggleStep(active, id))}
                  onMove={(id, direction) => pushSceneChange((active) => moveStep(active, id, direction))}
                  onAnimate={startAnimation}
                />
                <TransformControls
                  settings={settings}
                  onSettingChange={handleSettingChange}
                  onAddFigure={handleAddFigure}
                  onClearFigures={handleClearFigures}
                  figureCount={scene.figures.length}
                  maxFigures={MAX_FIGURES}
                  onPreset={handlePreset}
                  onExperiment={handleExperiment}
                  features={features}
                  activeExperiment={null}
                  pattern={pattern}
                  onPatternChange={setPattern}
                  canUndo={canUndo(data)}
                  canRedo={canRedo(data)}
                  onUndo={() => commit(undo)}
                  onRedo={() => commit(redo)}
                />
              </>
            )}

            {tab === 'inspector' && (
              <TransformInspector
                figures={resolved.figures}
                steps={scene.steps}
                settings={settings}
                activeStepId={effectiveStepId}
              />
            )}

            {tab === 'practice' && (
              <PracticePanel
                challenge={challenge}
                verdict={verdict}
                score={data.practice}
                onNew={handleNewChallenge}
                onSubmit={handleSubmitAnswer}
                onReveal={handleReveal}
                puzzleId={data.puzzle?.id ?? null}
                puzzleSolved={data.puzzle?.solved ?? false}
                onPuzzle={handlePuzzle}
                onExitPuzzle={handleExitPuzzle}
                puzzles={features.puzzles}
              />
            )}
          </div>
        </aside>
      )}

      {/* §53 : ce que le lecteur d'écran annonce. */}
      <p className="sa-ml-tr__sr" role="status" aria-live="polite" data-ml-announcement>{announcement}</p>
    </div>
  );
}

/** Les figures qu'un bouton pose : posées sur la grille, à portée de doigt (§33). */
function figureTemplate(kind) {
  switch (kind) {
    case 'point': return [{ x: 2, y: 2 }];
    case 'segment': return [{ x: -3, y: -2 }, { x: 1, y: 1 }];
    case 'rectangle': return M.rectangleVertices({ x: -5, y: -3 }, 4, 2);
    case 'square': return M.rectangleVertices({ x: -5, y: -3 }, 3, 3);
    case 'polygon': return M.regularPolygon({ x: 0, y: 0 }, 3, 5);
    case 'triangle':
    default: return [{ x: 1, y: 1 }, { x: 4, y: 1 }, { x: 1, y: 3 }];
  }
}

/** Un nombre pour la SYNTHÈSE VOCALE : la virgule décimale y est lue correctement. */
function formatForSpeech(value) {
  if (!Number.isFinite(value)) return '—';

  return String(Math.round(value * 100) / 100).replace('.', ',');
}
