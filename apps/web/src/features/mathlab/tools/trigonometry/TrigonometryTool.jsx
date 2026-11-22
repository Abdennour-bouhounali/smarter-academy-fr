import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PanelBottomClose, PanelBottomOpen, X } from 'lucide-react';
import './trigonometry.css';
import UnitCircleStage from './UnitCircleStage.jsx';
import TriangleStage from './TriangleStage.jsx';
import TriangleSolvePanel from './TriangleSolvePanel.jsx';
import TrigInspector from './TrigInspector.jsx';
import TrigControls from './TrigControls.jsx';
import PracticePanel from './PracticePanel.jsx';
import { stateAt, normalizeDegrees, cosOf, solveRightTriangle } from './trigMath.js';
import {
  normalizeTrigonometryData, serializeTrigonometryData, createTrigonometryData,
  setAngle, nudgeAngle, normalizeAngle, setRadius, setMode, setUnit, setValueMode,
  toggleLayer, setHighlight, setSymmetry, setCompare, setInverse, setTriangleValue,
  applyPreset, createPracticeState,
} from './trigState.js';
import { getExperiment } from './presets.js';
import { generateChallenge, checkAnswer, revealTarget, kindsForMode } from './practice.js';
import { clampToFeatures, trigonometryFeatures } from './scope.js';

/** Le délai entre un changement et sa remise à la coquille (qui attend encore avant d'enregistrer). */
const SERIALIZE_MS = 300;

/**
 * Le مختبر المثلثات dans la coquille du مختبر (MathLabToolProps).
 *
 * L'état du document (`trigState.js`) vit ICI ; toute la mathématique est
 * dans les modules purs que ce composant se contente d'appeler — aucun
 * calcul dans le JSX (§39).
 *
 *     un angle qu'on TIRE → le point suit → les projections suivent →
 *     les valeurs suivent → le graphe suit → une relation apparaît
 *
 * ── La séparation de §42, rendue littérale ───────────────────────────────
 * `data` (persisté) contre `useState` local (jamais persisté) :
 *
 *   | état MATHÉMATIQUE (data) | état d'INTERFACE (local)      |
 *   |--------------------------|-------------------------------|
 *   | θ, rayon, mode, unité    | l'animation en cours          |
 *   | couches, préréglage      | la vitesse, le sens           |
 *   | symétrie, comparaison    | le panneau ouvert/fermé       |
 *   | score d'entraînement     | la question courante          |
 *
 * Ce n'est pas une convention : l'animation n'a AUCUN champ dans `data`, et
 * ne peut donc pas y arriver par accident (§43).
 */
export default function TrigonometryTool({ initialData, onChange, onReady, capabilities = null }) {
  const { t } = useTranslation('mathlab');
  // Le مخبر (scope.js) : au collège, le triangle rectangle en degrés — ni
  // cercle, ni radians, ni quadrants.
  const features = useMemo(() => trigonometryFeatures(capabilities), [capabilities]);
  const [data, setData] = useState(() => clampToFeatures(initialData && Object.keys(initialData).length
    ? normalizeTrigonometryData(initialData)
    : createTrigonometryData(), features));

  // ── L'état d'INTERFACE : jamais sérialisé (§42, §43) ──────────────────
  const [panelOpen, setPanelOpen] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(60);        // degrés par seconde
  const [direction, setDirection] = useState(1);
  const [announcement, setAnnouncement] = useState('');
  const [experiment, setExperiment] = useState(null);

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
        onChangeRef.current?.(serializeTrigonometryData(dataRef.current));
      }, SERIALIZE_MS);

      return next;
    });
  }, []);

  useEffect(() => () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      onChangeRef.current?.(serializeTrigonometryData(dataRef.current));
    }
  }, []);

  // ── Le mouvement réduit (§38) ─────────────────────────────────────────

  /**
   * §38 : sous « mouvement réduit », la rotation continue NE DÉMARRE PAS
   * d'elle-même, et l'instrument reste entièrement utilisable — on tire le
   * point, on tape l'angle, on clique les angles remarquables. Rien de
   * mathématique n'est perdu ; seule l'animation l'est.
   */
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => {
      setReducedMotion(query.matches);
      if (query.matches) setPlaying(false);
    };
    apply();
    query.addEventListener?.('change', apply);

    return () => query.removeEventListener?.('change', apply);
  }, []);

  // ── La rotation continue (§4, §13) ────────────────────────────────────

  /**
   * L'animation vit dans une `requestAnimationFrame`, pas dans un `setInterval` :
   * le pas dépend du TEMPS ÉCOULÉ et non du nombre d'images, si bien que la
   * vitesse est la même sur un écran à 60 Hz et sur un à 120 Hz (§41).
   *
   * L'angle ne repart pas à zéro à chaque tour — c'est ainsi que l'onde se
   * dessine au-delà de 360° et que la périodicité devient visible (§13, §14).
   */
  const playingRef = useRef(playing);
  playingRef.current = playing;
  const speedRef = useRef(speed);
  speedRef.current = speed;
  const directionRef = useRef(direction);
  directionRef.current = direction;

  useEffect(() => {
    if (!playing) return undefined;
    let frame = 0;
    let last = performance.now();

    const tick = (now) => {
      const elapsed = Math.min(now - last, 100) / 1000;  // un onglet en arrière-plan ne saute pas dix tours
      last = now;
      commit((current) => {
        const next = current.angle + directionRef.current * speedRef.current * elapsed;
        // Au bout du domaine, on repart de l'autre bord : la rotation ne se
        // bloque pas contre la borne, elle CONTINUE (§4).
        const wrapped = next > 1080 ? next - 1800 : next < -720 ? next + 1800 : next;

        return setAngle(current, wrapped);
      });
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [playing, commit]);

  // ── La coquille ───────────────────────────────────────────────────────

  useEffect(() => {
    onReady?.({
      clear: () => {
        setPlaying(false);
        setExperiment(null);
        setAnnouncement(t('tools.trigonometry.announceReset'));
        commit(() => createTrigonometryData());
      },
      isGridEnabled: () => dataRef.current.layers.grid,
      toggleGrid: () => {
        const next = !dataRef.current.layers.grid;
        commit((current) => ({ ...current, layers: { ...current.layers, grid: next } }));

        return next;
      },
    });

    return () => onReady?.(null);
  }, [onReady, commit, t]);

  // ── L'état mathématique, calculé UNE fois par rendu (§39, §41) ────────

  /**
   * L'état mathématique affiché — et l'angle DONT il parle.
   *
   * Chaque mode a son angle : le cercle a `data.angle`, le triangle a celui
   * que ses côtés déterminent. Lire `data.angle` dans les deux cas faisait
   * afficher « sin(θ) = 1/2 » dans l'inspecteur pendant que le triangle
   * montrait « 0,5057 » — deux valeurs pour le même θ à l'écran, ce que la
   * QA visuelle a montré là où aucune assertion ne regardait. L'inspecteur
   * suit donc le mode, et il n'y a plus qu'un θ à la fois.
   */
  const shownAngle = useMemo(() => {
    if (data.mode !== 'triangle') return data.angle;
    const solved = solveRightTriangle(data.triangle.given, data.triangle);

    return solved.ok ? solved.angle : data.triangle.angle;
  }, [data.mode, data.angle, data.triangle]);

  const state = useMemo(
    () => stateAt(shownAngle, data.mode === 'circle' ? data.radius : 1),
    [shownAngle, data.radius, data.mode],
  );

  // ── Les gestes ────────────────────────────────────────────────────────

  /**
   * Poser l'angle — DANS le mode courant.
   *
   * En mode triangle, l'angle qui compte est celui du triangle : le champ,
   * le curseur, les pas et les puces d'angles remarquables doivent le
   * déplacer LUI, sinon l'élève tape « 45° » et ne voit rien bouger. On
   * bascule alors sur la configuration « angle + hypoténuse », qui garde
   * l'hypoténuse et laisse les deux côtés suivre — et l'angle y reste aigu,
   * comme dans tout triangle rectangle.
   */
  const changeAngle = useCallback((degrees) => {
    commit((current) => {
      if (current.mode !== 'triangle') return setAngle(current, degrees);
      const solved = solveRightTriangle(current.triangle.given, current.triangle);
      const hypotenuse = solved.ok ? solved.hypotenuse : current.triangle.hypotenuse;
      const acute = Math.min(89, Math.max(1, ((degrees % 180) + 180) % 180 || 1));

      return setTriangleValue(
        setTriangleValue(
          setTriangleValue(current, 'given', 'angle-hyp'),
          'hypotenuse', hypotenuse,
        ),
        'angle', acute > 89 ? 89 : acute,
      );
    });
  }, [commit]);

  /** Tirer le point arrête la rotation : la main de l'élève l'emporte (§28). */
  const dragAngle = useCallback((degrees) => {
    if (playingRef.current) setPlaying(false);
    commit((current) => setAngle(current, degrees));
  }, [commit]);

  const changeTriangle = useCallback((patch) => {
    commit((current) => {
      let next = current;
      for (const [key, value] of Object.entries(patch)) {
        next = setTriangleValue(next, key, value);
      }

      return next;
    });
  }, [commit]);

  const openPreset = useCallback((id) => {
    if (!features.presets.some((preset) => preset.id === id)) return;
    commit((current) => applyPreset(current, id));
    setExperiment(null);
    setAnnouncement(t('tools.trigonometry.announcePreset'));
  }, [commit, t, features]);

  /** Une expérience (§26) : un préréglage, un angle de départ, une question — puis le silence. */
  const openExperiment = useCallback((id) => {
    const found = getExperiment(id);
    if (!found || !features.panels.experiments) return;
    commit((current) => setAngle(applyPreset(current, found.preset), found.startAngle));
    setExperiment({ id, step: 0 });
    setAnnouncement(t('tools.trigonometry.announceExperiment', { name: t(found.labelKey) }));
  }, [commit, t, features]);

  // ── L'entraînement (§25) ──────────────────────────────────────────────

  const seedRef = useRef(Date.now());

  const startPractice = useCallback(() => {
    seedRef.current += 1;
    const { mode } = dataRef.current;
    const challenge = generateChallenge(seedRef.current, kindsForMode(mode), { mode });
    commit((current) => ({
      ...current,
      practice: {
        ...current.practice,
        active: true,
        challenge,
        phase: 'predict',
        answer: '',
        attempts: 0,
        hintsUsed: 0,
        seen: current.practice.seen + 1,
      },
    }));
    setPlaying(false);
  }, [commit]);

  const answerPractice = useCallback((answer) => {
    commit((current) => ({ ...current, practice: { ...current.practice, answer } }));
  }, [commit]);

  const submitPractice = useCallback((answer) => {
    commit((current) => {
      const verdict = checkAnswer(current.practice.challenge, answer);

      return {
        ...current,
        practice: {
          ...current.practice,
          answer: typeof answer === 'string' ? answer : current.practice.answer,
          phase: 'verify',
          attempts: current.practice.attempts + 1,
          // Une réussite compte UNE fois, au premier succès.
          solved: verdict.correct && current.practice.phase !== 'verify'
            ? current.practice.solved + 1
            : current.practice.solved,
        },
      };
    });
  }, [commit]);

  /** Révéler : le dessin s'AMÈNE à la réponse — c'est là qu'est l'explication (§25). */
  const revealPractice = useCallback(() => {
    commit((current) => {
      const target = revealTarget(current.practice.challenge);
      let next = { ...current, practice: { ...current.practice, phase: 'reveal' } };
      // Au collège, le cercle n'existe pas : une réponse se montre sur le triangle.
      if (target?.mode === 'circle' && features.modes.includes('circle')) {
        next = setAngle(setMode(next, 'circle'), target.angle);
      } else if (target?.mode === 'triangle') {
        next = setMode(next, 'triangle');
        for (const [key, value] of Object.entries(target.triangle)) {
          next = setTriangleValue(next, key, value);
        }
      }

      return next;
    });
    setPlaying(false);
  }, [commit, features]);

  const hintPractice = useCallback(() => {
    commit((current) => ({
      ...current,
      practice: { ...current.practice, hintsUsed: current.practice.hintsUsed + 1 },
    }));
  }, [commit]);

  const closePractice = useCallback(() => {
    commit((current) => ({
      ...current,
      practice: { ...createPracticeState(), solved: current.practice.solved, seen: current.practice.seen },
    }));
  }, [commit]);

  // ── Les micro-explications (§47) ──────────────────────────────────────

  /**
   * §47 : « These explanations should appear at the moment they become
   * useful. » Une seule à la fois, choisie par l'état courant, et jamais un
   * paragraphe permanent. L'ordre est celui de l'urgence : ce qui est
   * INDÉFINI passe avant ce qui est simplement proche de zéro.
   */
  const microNote = useMemo(() => {
    if (data.mode !== 'circle') return null;
    if (state.tan === null) return 'tanUndefined';
    if (Math.abs(state.cos) < 0.1) return 'cosNearZero';
    if (Math.abs(state.sin) < 0.1 && Math.abs(state.normalized % 180) < 6) return 'sinNearZero';
    if (data.unit === 'rad') return 'radianIsArc';
    if (!state.isNormalized) return 'beyondTurn';

    return null;
  }, [data.mode, data.unit, state.tan, state.cos, state.sin, state.normalized, state.isNormalized]);

  const currentExperiment = experiment ? getExperiment(experiment.id) : null;

  return (
    <div className="sa-ml-trig" role="region" aria-label={t('tools.trigonometry.name')} data-ml-trigonometry>
      <div className="sa-ml-trig__stage">
        {data.mode === 'circle' ? (
          <UnitCircleStage
            angle={data.angle}
            radius={data.radius}
            layers={data.layers}
            valueMode={data.valueMode}
            highlight={data.highlight}
            symmetry={data.symmetry}
            compare={data.compare}
            reducedMotion={reducedMotion}
            onAngleChange={dragAngle}
            onDragEnd={() => {}}
            onTapSpecial={changeAngle}
          />
        ) : (
          <TriangleStage
            triangle={data.triangle}
            valueMode={data.valueMode}
            highlight={data.highlight}
            onTriangleChange={changeTriangle}
            onDragEnd={() => {}}
          />
        )}

        {/* ── L'invitation d'ouverture (§46) ────────────────────────────── */}
        <p className="sa-ml-trig__invite" data-ml-trig-invite>{t('tools.trigonometry.invite')}</p>

        {/* ── La micro-explication du moment (§47) ─────────────────────── */}
        {microNote && (
          <p className="sa-ml-trig__micro" role="status" data-ml-trig-micro={microNote}>
            {t(`tools.trigonometry.micro.${microNote}`)}
          </p>
        )}

        {/* ── L'expérience guidée, posée sur le dessin (§29) ───────────── */}
        {currentExperiment && (
          <div className="sa-ml-trig__guide" data-ml-trig-guide={currentExperiment.id}>
            <p className="sa-ml-trig__guide-question">{t(currentExperiment.questionKey)}</p>
            <p className="sa-ml-trig__guide-step">{t(currentExperiment.steps[experiment.step])}</p>
            <div className="sa-ml-trig__guide-actions">
              {experiment.step < currentExperiment.steps.length - 1 && (
                <button
                  type="button"
                  className="sa-ml-trig__btn"
                  onClick={() => setExperiment((current) => ({ ...current, step: current.step + 1 }))}
                  data-ml-trig-guide-next
                >
                  {t('tools.trigonometry.guideNext')}
                </button>
              )}
              {/* §29 : on peut TOUJOURS sortir et continuer à explorer. */}
              <button
                type="button"
                className="sa-ml-trig__btn sa-ml-trig__btn--icon"
                onClick={() => setExperiment(null)}
                aria-label={t('tools.trigonometry.guideClose')}
                title={t('tools.trigonometry.guideClose')}
                data-ml-trig-guide-close
              >
                <X size={15} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        <p className="sa-ml-trig__sr" role="status" aria-live="polite">{announcement}</p>
      </div>

      {/* ── Le panneau : colonne sur grand écran, tiroir sur mobile (§35) ── */}
      <div className={`sa-ml-trig__panel${panelOpen ? '' : ' sa-ml-trig__panel--collapsed'}`} data-ml-panel data-ml-panel-open={panelOpen ? 'true' : 'false'}>
        <div className="sa-ml-trig__panel-head">
          <h2 className="sa-ml-trig__panel-title">{t('tools.trigonometry.panelHeading')}</h2>
          <button
            type="button"
            className="sa-ml-trig__btn sa-ml-trig__btn--icon sa-ml-trig__collapse"
            onClick={() => setPanelOpen((open) => !open)}
            aria-expanded={panelOpen}
            aria-label={t(panelOpen ? 'tools.trigonometry.panelHide' : 'tools.trigonometry.panelShow')}
            title={t(panelOpen ? 'tools.trigonometry.panelHide' : 'tools.trigonometry.panelShow')}
            data-ml-panel-toggle
          >
            {panelOpen ? <PanelBottomClose size={18} aria-hidden="true" /> : <PanelBottomOpen size={18} aria-hidden="true" />}
          </button>
        </div>

        <div className="sa-ml-trig__panel-body">
          {data.practice.active && (
            <PracticePanel
              practice={data.practice}
              valueMode={data.valueMode}
              onAnswer={answerPractice}
              onSubmit={submitPractice}
              onReveal={revealPractice}
              onHint={hintPractice}
              onNext={startPractice}
              onClose={closePractice}
            />
          )}

          <TrigInspector
            state={state}
            valueMode={data.valueMode}
            unit={data.unit}
            readings={features.readings}
            highlight={data.highlight}
            identityPanel={data.mode === 'circle'}
            tanPanel
            onHighlight={(ratio) => commit((current) => setHighlight(current, ratio))}
          >
            {/* « حلّ المثلث خطوة بخطوة » — le dessin reste vivant, le raisonnement
                se déroule, juste sous les rapports (§3.5). */}
            {data.mode === 'triangle' && <TriangleSolvePanel triangle={data.triangle} />}
          </TrigInspector>

          <TrigControls
            data={data}
            state={state}
            playing={playing}
            reducedMotion={reducedMotion}
            speed={speed}
            direction={direction}
            onAngle={changeAngle}
            onNudge={(delta) => (data.mode === 'triangle'
              ? changeAngle(shownAngle + delta)
              : commit((current) => nudgeAngle(current, delta)))}
            onNormalize={() => commit(normalizeAngle)}
            onUnit={(unit) => features.units.includes(unit) && commit((current) => setUnit(current, unit))}
            onValueMode={(mode) => commit((current) => setValueMode(current, mode))}
            onRadius={(radius) => commit((current) => setRadius(current, radius))}
            onMode={(mode) => features.modes.includes(mode) && commit((current) => setMode(current, mode))}
            onLayer={(key) => commit((current) => toggleLayer(current, key))}
            onPreset={openPreset}
            onExperiment={openExperiment}
            onInverse={(ratio, value) => commit((current) => setInverse(current, ratio, value))}
            onSymmetry={(kind) => commit((current) => setSymmetry(current, kind))}
            onCompare={(patch) => commit((current) => setCompare(current, patch))}
            onTriangleValue={(key, value) => commit((current) => setTriangleValue(current, key, value))}
            onPlayToggle={() => setPlaying((value) => !value)}
            onSpeed={setSpeed}
            onDirection={setDirection}
            onPractice={startPractice}
            features={features}
          />
        </div>
      </div>
    </div>
  );
}

export { normalizeDegrees, cosOf };
