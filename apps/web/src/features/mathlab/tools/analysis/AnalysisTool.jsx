import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PanelBottomClose, PanelBottomOpen, SlidersHorizontal, Sigma, GraduationCap } from 'lucide-react';
import './analysis.css';
import AnalysisPlane from './AnalysisPlane.jsx';
import SceneLayer from './SceneLayer.jsx';
import PointHandle from './PointHandle.jsx';
import AnalysisControls from './AnalysisControls.jsx';
import AnalysisInspector from './AnalysisInspector.jsx';
import PracticePanel from './PracticePanel.jsx';
import LiveReadout from './LiveReadout.jsx';
import { buildScene } from './buildScene.js';
import { buildDerivativeSteps } from './derivativeSteps.js';
import { VARIATION_STAGES } from './variationTable.js';
import useStepReveal from '../../shared/useStepReveal.js';
import { layersForLab } from './layers.js';
import {
  normalizeAnalysisData, createAnalysisData, clearAnalysisData,
  setLab, setSource, setPoint, setSecondPoint, setLimitPoint, setBounds, setRiemann,
  setParameter, setConstant, setTransform, setView, applyPreset, toggleLayer,
  addSecondFunction, removeSecondFunction, recordPractice, LABS,
} from './analysisState.js';
import { constrainAlongCurve } from '../functionGrapher/numericalDerivative.js';
import { installAnalysisKeyboard } from './mathFieldSetup.js';
import { ensureEngine } from '../../symbolic/index.js';
import { useCompactCharts, useReducedMotion } from '../probabilityStats/useMediaQuery.js';

/** Le délai entre un changement et sa remise à la coquille (qui attend encore avant d'enregistrer). */
const SERIALIZE_MS = 300;
/** La durée d'un « rapproche B de A » (§8, §32) : assez lent pour être LU. */
const APPROACH_MS = 2600;
/** Ce qui reste entre A et B à la fin de l'animation : jamais zéro (la sécante disparaîtrait). */
const APPROACH_FLOOR = 0.02;

/**
 * Le مختبر التحليل والدوال dans la coquille du مختبر (MathLabToolProps).
 *
 *     on tire B vers A → le قاطع pivote → son ميل converge → il devient مماس
 *
 * L'état du document (`analysisState.js`) vit ICI ; toute la mathématique est
 * dans les modules purs que ce composant se contente d'appeler — aucun calcul
 * dans le JSX. La scène entière est résolue par `buildScene`, mémoïsée sur
 * l'expression, la fenêtre et les couches : un glissement de A ne relance pas
 * la recherche des asymptotes (§47).
 *
 * ── Ce qui n'est PAS persisté (§42) ──────────────────────────────────────
 * L'animation d'approche et sa progression, la question d'entraînement
 * courante, l'indice déjà lu, la prédiction en cours, l'onglet actif et le
 * panneau ouvert n'ont AUCUN champ dans `data`. Ils vivent ici, en état React.
 */
export default function AnalysisTool({ initialData, onChange, onReady }) {
  const { t } = useTranslation('mathlab');
  const [data, setData] = useState(() => (initialData && Object.keys(initialData).length
    ? normalizeAnalysisData(initialData)
    : createAnalysisData()));

  // ── L'état d'INTERFACE : jamais sérialisé ──────────────────────────────
  const [panelOpen, setPanelOpen] = useState(true);
  const [tab, setTab] = useState('controls');
  const [announcement, setAnnouncement] = useState('');
  const [approaching, setApproaching] = useState(false);
  const [planeState, setPlaneState] = useState({ view: null, width: 0 });
  const compact = useCompactCharts();
  const reducedMotion = useReducedMotion();

  const planeRef = useRef(null);
  const timerRef = useRef(null);
  const dataRef = useRef(data);
  const onChangeRef = useRef(onChange);
  const approachRef = useRef(null);
  onChangeRef.current = onChange;
  dataRef.current = data;

  /** Une modification voulue : appliquée tout de suite, remise à la coquille après SERIALIZE_MS. */
  const commit = useCallback((updater) => {
    setData((current) => {
      const next = typeof updater === 'function' ? updater(current) : updater;
      if (next === current) return current;
      dataRef.current = next;
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => onChangeRef.current?.(dataRef.current), SERIALIZE_MS);

      return next;
    });
  }, []);

  /**
   * Un GESTE en cours (glisser un point, pousser un curseur) : l'état change
   * sans relancer le minuteur de sauvegarde à chaque pixel. La coquille
   * recevra l'état au relâchement, via `commit`.
   */
  const slide = useCallback((updater) => {
    setData((current) => {
      const next = typeof updater === 'function' ? updater(current) : updater;
      if (next === current) return current;
      dataRef.current = next;

      return next;
    });
  }, []);

  const commitGesture = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChangeRef.current?.(dataRef.current), SERIALIZE_MS);
  }, []);

  useEffect(() => () => {
    clearTimeout(timerRef.current);
    cancelAnimationFrame(approachRef.current?.frame);
  }, []);

  /**
   * Le clavier virtuel de MathLive est GLOBAL : on pose celui du laboratoire
   * à l'ouverture et on rend le précédent à la fermeture, comme le grapheur.
   * Sans cela, l'instrument laisserait son clavier à celui qu'on ouvre après.
   */
  useEffect(() => installAnalysisKeyboard(), []);

  /**
   * Le moteur symbolique se charge en arrière-plan, une fois, à l'ouverture.
   *
   * Il pèse ~1,8 Mo : on ne le met pas sur le chemin du premier rendu. Le
   * laboratoire fonctionne ENTIÈREMENT sans lui — les limites, les dérivées
   * et les aires sont mesurées numériquement — et il ne fait qu'ajouter les
   * valeurs EXACTES quand il arrive. `setEngineReady` déclenche un nouveau
   * calcul de la scène pour qu'elles apparaissent.
   */
  const [, setEngineReady] = useState(false);
  useEffect(() => {
    let alive = true;
    ensureEngine().then(() => {
      if (alive) setEngineReady(true);
    }).catch(() => {
      // Le moteur symbolique est un BONUS : son absence ne casse rien.
    });

    return () => { alive = false; };
  }, []);

  // ── Les actions de la barre de la coquille ─────────────────────────────
  useEffect(() => {
    onReady?.({
      clear: () => {
        const fresh = clearAnalysisData();
        dataRef.current = fresh;
        setData(fresh);
        onChangeRef.current?.(fresh);
        setAnnouncement(t('tools.analysis.announce.reset'));
      },
      isGridEnabled: () => dataRef.current.layers.grid !== false,
      toggleGrid: () => {
        const next = toggleLayer(dataRef.current, 'grid');
        dataRef.current = next;
        setData(next);
        onChangeRef.current?.(next);

        return next.layers.grid;
      },
    });

    return () => onReady?.(null);
  }, [onReady, t]);

  // ── La scène : résolue une fois par changement réel ────────────────────
  const view = planeState.view;
  const scene = useMemo(() => {
    if (!view) return null;

    return buildScene(data, view, { withDomain: data.lab === 'study' });
  }, [data, view]);

  /**
   * LES DÉROULÉS PAS À PAS (exigence 2026-09-30) : f′(x) écrite, et la
   * construction du جدول التغيّرات. Les lecteurs vivent ICI et non dans
   * l'inspecteur : l'inspecteur se démonte quand l'élève passe à الضبط, et
   * revenir à القراءة ne doit pas le renvoyer au début.
   *
   * La question, c'est la FONCTION : changer f ramène à l'énoncé. Tirer un
   * curseur de paramètre ou déplacer la fenêtre garde le pas atteint — le
   * contenu suit la nouvelle lecture (le tableau est une lecture de la
   * fenêtre, et un curseur tiré ne doit pas effacer le travail à chaque pixel).
   */
  const primarySource = data.functions?.[0]?.source ?? '';
  const derivativeSteps = useMemo(() => buildDerivativeSteps(primarySource), [primarySource]);
  const derivativePlayer = useStepReveal(derivativeSteps.ok ? derivativeSteps.steps.length : 0, { resetKey: primarySource });
  const studyReady = data.lab === 'study' && Boolean(scene) && !scene.error;
  const studyPlayer = useStepReveal(studyReady ? VARIATION_STAGES.length : 0, { resetKey: primarySource });
  const steppers = { derivative: { player: derivativePlayer, steps: derivativeSteps }, study: studyPlayer };

  const handleViewportChange = useCallback((next) => commit((current) => setView(current, next)), [commit]);

  const handlePlaneChange = useCallback(({ view: nextView, size }) => {
    setPlaneState((current) => (
      current.view === nextView && current.width === size.width
        ? current
        : { view: nextView, width: size.width }
    ));
  }, []);

  /**
   * Déplacer A (ou B) LE LONG de la courbe.
   *
   * On passe par `constrainAlongCurve` du grapheur : un point ne saute pas
   * par-dessus un pôle avec le doigt, exactement comme la courbe ne le
   * franchit pas. 1/x se parcourt donc en deux morceaux, et c'est juste.
   */
  const dragPointTo = useCallback((which, clientX, clientY) => {
    const plane = planeRef.current;
    const mathPoint = plane?.toMath(clientX, clientY);
    if (!mathPoint || !scene?.primary?.ok) return;
    const currentX = which === 'A' ? dataRef.current.point : dataRef.current.secondPoint;
    const ySpan = view ? view.yMax - view.yMin : 10;
    const nextX = constrainAlongCurve(scene.primary.fn, currentX, mathPoint[0], ySpan);
    slide((current) => (which === 'A' ? setPoint(current, nextX) : setSecondPoint(current, nextX)));
  }, [scene, slide, view]);

  /** Le clavier : une flèche décale d'un pas lisible, Shift le raffine (§40). */
  const nudgePoint = useCallback((which, direction, fine) => {
    const span = view ? view.xMax - view.xMin : 12;
    const step = (fine ? span / 200 : span / 40) * direction;
    slide((current) => {
      const currentX = which === 'A' ? current.point : current.secondPoint;
      const nextX = currentX + step;

      return which === 'A' ? setPoint(current, nextX) : setSecondPoint(current, nextX);
    });
    commitGesture();
  }, [commitGesture, slide, view]);

  /**
   * L'EXPÉRIENCE de §8 et §29 : B glisse vers A, et l'élève VOIT la sécante
   * se coucher sur la tangente pendant que le ميل converge.
   *
   * Ce n'est pas une décoration : c'est le phénomène lui-même (§32 — « every
   * animation should have pedagogical purpose »). On s'arrête à
   * `APPROACH_FLOOR` et non à zéro, parce qu'en zéro la sécante n'existe plus
   * — et parce que la limite doit rester une APPROCHE, jamais une atteinte.
   */
  const startApproach = useCallback(() => {
    const start = dataRef.current.secondPoint;
    const target = dataRef.current.point;
    const gap = target - start;
    if (Math.abs(gap) < APPROACH_FLOOR) return;

    if (reducedMotion) {
      // Mouvement réduit : on pose directement le résultat, sans le trajet.
      slide((current) => setSecondPoint(current, target + Math.sign(gap) * -APPROACH_FLOOR));
      commitGesture();

      return;
    }

    cancelAnimationFrame(approachRef.current?.frame);
    setApproaching(true);
    const startedAt = performance.now();
    const step = (now) => {
      const progress = Math.min(1, (now - startedAt) / APPROACH_MS);
      // Une approche qui RALENTIT : elle se resserre sans jamais arriver,
      // ce qui est exactement ce qu'une limite fait.
      const eased = 1 - (1 - progress) ** 3;
      const remaining = 1 - eased * (1 - APPROACH_FLOOR / Math.abs(gap));
      slide((current) => setSecondPoint(current, target - gap * remaining));
      if (progress < 1) {
        approachRef.current = { frame: requestAnimationFrame(step) };
      } else {
        setApproaching(false);
        commitGesture();
      }
    };
    approachRef.current = { frame: requestAnimationFrame(step) };
  }, [commitGesture, reducedMotion, slide]);

  const stopApproach = useCallback(() => {
    cancelAnimationFrame(approachRef.current?.frame);
    setApproaching(false);
    commitGesture();
  }, [commitGesture]);

  /** Changer de laboratoire : les couches suivent, la courbe et le repère ne bougent pas. */
  const changeLab = useCallback((lab) => {
    if (!LABS.includes(lab)) return;
    commit((current) => ({ ...setLab(current, lab), layers: layersForLab(lab, current.layers) }));
    setAnnouncement(t('tools.analysis.announce.lab', { name: t(`tools.analysis.labs.${lab}`) }));
  }, [commit, t]);

  const handlePreset = useCallback((id) => {
    commit((current) => {
      const next = applyPreset(current, id);

      return { ...next, layers: layersForLab(next.lab, next.layers) };
    });
    setAnnouncement(t('tools.analysis.announce.preset'));
  }, [commit, t]);

  /** Un défi ou une expérience pose son décor : la fonction, le laboratoire, les points. */
  const applyFocus = useCallback((focus, source) => {
    if (!focus) return;
    commit((current) => {
      let next = source ? setSource(current, 'f', source) : current;
      if (focus.lab) next = { ...setLab(next, focus.lab), layers: layersForLab(focus.lab, next.layers) };
      if (Number.isFinite(focus.point)) next = setPoint(next, focus.point);
      if (Number.isFinite(focus.secondPoint)) next = setSecondPoint(next, focus.secondPoint);
      if (Number.isFinite(focus.limitPoint)) next = setLimitPoint(next, focus.limitPoint);
      if (focus.bounds) next = setBounds(next, focus.bounds.a, focus.bounds.b);
      if (focus.riemann) next = setRiemann(next, focus.riemann);
      if (focus.parameters) {
        for (const [name, value] of Object.entries(focus.parameters)) next = setParameter(next, name, value);
      }
      if (Number.isFinite(focus.constant)) next = setConstant(next, focus.constant);

      return next;
    });
  }, [commit]);

  const handlePracticeResult = useCallback((solved) => {
    commit((current) => recordPractice(current, solved));
  }, [commit]);

  return (
    <div className={`sa-ml-an${panelOpen ? '' : ' sa-ml-an--collapsed'}`} data-ml-analysis data-ml-lab={data.lab}>
      {/* ── Le choix du laboratoire : un seul environnement, sept regards (§4) ── */}
      <nav className="sa-ml-an__labs" aria-label={t('tools.analysis.labs.label')} data-ml-an-labs>
        {LABS.map((lab) => (
          <button
            key={lab}
            type="button"
            className={`sa-ml-an__lab${data.lab === lab ? ' is-active' : ''}`}
            onClick={() => changeLab(lab)}
            aria-pressed={data.lab === lab}
            title={t(`tools.analysis.labs.${lab}Hint`)}
            data-ml-an-lab={lab}
          >
            {t(`tools.analysis.labs.${lab}`)}
          </button>
        ))}
      </nav>

      <div className="sa-ml-an__stage">
        <AnalysisPlane
          ref={planeRef}
          initialViewport={data.view}
          grid={data.layers.grid !== false}
          onViewportChange={handleViewportChange}
          canvasLabel={t('tools.analysis.canvasLabel')}
        >
          {({ view: planeView, size }) => (
            <PlaneContents
              planeView={planeView}
              size={size}
              scene={scene}
              data={data}
              onPlaneChange={handlePlaneChange}
              onDragPoint={dragPointTo}
              onDragEnd={commitGesture}
              onNudge={nudgePoint}
              t={t}
            />
          )}
        </AnalysisPlane>

        {scene?.error && (
          <p className="sa-ml-an__error" role="status" data-ml-an-error>
            {scene.error.code === 'unknownSymbol'
              ? t('tools.analysis.errors.unknownSymbol', { symbol: scene.error.symbol ?? '' })
              : t(`tools.analysis.errors.${scene.error.code === 'empty' ? 'empty' : scene.error.code === 'incomplete' ? 'incomplete' : 'parse'}`)}
          </p>
        )}

        <button
          type="button"
          className="sa-ml-an__toggle"
          onClick={() => setPanelOpen((open) => !open)}
          aria-expanded={panelOpen}
          data-ml-an-panel-toggle
        >
          {panelOpen ? <PanelBottomClose size={18} aria-hidden="true" /> : <PanelBottomOpen size={18} aria-hidden="true" />}
          <span>{panelOpen ? t('tools.analysis.hidePanel') : t('tools.analysis.showPanel')}</span>
        </button>
      </div>

      {panelOpen && (
        <aside className="sa-ml-an__panel" data-ml-an-panel>
          {/* La LECTURE VIVE, au-dessus des onglets : les nombres de
              l'expérience restent visibles pendant qu'on règle (§3). */}
          <LiveReadout data={data} scene={scene} />

          <div className="sa-ml-an__tabs" role="tablist" aria-label={t('tools.analysis.tabs.label')}>
            {[
              ['controls', SlidersHorizontal, t('tools.analysis.tabs.controls')],
              ['inspector', Sigma, t('tools.analysis.tabs.inspector')],
              ['practice', GraduationCap, t('tools.analysis.tabs.practice')],
            ].map(([id, Icon, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                className={`sa-ml-an__tab${tab === id ? ' is-active' : ''}`}
                onClick={() => setTab(id)}
                data-ml-an-tab={id}
              >
                <Icon size={16} aria-hidden="true" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="sa-ml-an__panelbody">
            {tab === 'controls' && (
              <AnalysisControls
                data={data}
                scene={scene}
                compact={compact}
                reducedMotion={reducedMotion}
                approaching={approaching}
                onSource={(id, source) => commit((current) => setSource(current, id, source))}
                onPreset={handlePreset}
                onPoint={(x) => { slide((current) => setPoint(current, x)); commitGesture(); }}
                onSecondPoint={(x) => { slide((current) => setSecondPoint(current, x)); commitGesture(); }}
                onLimitPoint={(x) => { slide((current) => setLimitPoint(current, x)); commitGesture(); }}
                onBounds={(a, b) => { slide((current) => setBounds(current, a, b)); commitGesture(); }}
                onRiemann={(patch) => { slide((current) => setRiemann(current, patch)); commitGesture(); }}
                onParameter={(name, value) => { slide((current) => setParameter(current, name, value)); commitGesture(); }}
                onConstant={(value) => { slide((current) => setConstant(current, value)); commitGesture(); }}
                onTransform={(transform) => commit((current) => setTransform(current, transform))}
                onToggleLayer={(key) => commit((current) => toggleLayer(current, key))}
                onAddSecond={() => commit((current) => addSecondFunction(current))}
                onRemoveSecond={() => commit((current) => removeSecondFunction(current))}
                onApproach={approaching ? stopApproach : startApproach}
                onExperiment={(experiment) => {
                  applyFocus({ lab: experiment.lab, ...experiment.setup }, experiment.source);
                  setAnnouncement(t('tools.analysis.announce.experiment'));
                }}
              />
            )}
            {tab === 'inspector' && (
              <AnalysisInspector data={data} scene={scene} steppers={steppers} onHighlight={(key) => commit((current) => toggleLayer(current, key))} />
            )}
            {tab === 'practice' && (
              <PracticePanel
                data={data}
                onApplyFocus={applyFocus}
                onResult={handlePracticeResult}
              />
            )}
          </div>
        </aside>
      )}

      <p className="sa-ml-an__sr" role="status" aria-live="polite">{announcement}</p>
    </div>
  );
}

/**
 * Ce qui vit DANS le SVG de mafs : la scène, et les poignées qu'on attrape.
 *
 * Séparé pour une raison précise : ce composant est rendu par la fonction
 * `children` du plan, donc SOUS le contexte de transformation de mafs — les
 * poignées ont besoin de `useTransformContext`, qui n'existe pas au-dessus.
 */
function PlaneContents({ planeView, size, scene, data, onPlaneChange, onDragPoint, onDragEnd, onNudge, t }) {
  // La fenêtre et la largeur remontent au parent, qui en a besoin pour
  // résoudre la scène. Un effet, jamais pendant le rendu.
  useEffect(() => {
    onPlaneChange({ view: planeView, size });
  }, [onPlaneChange, planeView, size]);

  if (!scene || scene.error) return null;

  const showA = data.layers.pointA && scene.pointA;
  const showB = data.layers.pointB && scene.rate?.ok;

  return (
    <>
      <SceneLayer scene={scene} view={planeView} width={size.width} layers={data.layers} />

      {showA && (
        <PointHandle
          x={scene.pointA.x} y={scene.pointA.y}
          color="#dc2626"
          onDrag={(clientX, clientY) => onDragPoint('A', clientX, clientY)}
          onDragEnd={onDragEnd}
          onNudge={(direction, fine) => onNudge('A', direction, fine)}
          label="A"
          ariaLabel={t('tools.analysis.point.drag')}
        />
      )}
      {showB && (
        <PointHandle
          x={data.secondPoint} y={scene.rate.fb}
          color="#f59e0b"
          onDrag={(clientX, clientY) => onDragPoint('B', clientX, clientY)}
          onDragEnd={onDragEnd}
          onNudge={(direction, fine) => onNudge('B', direction, fine)}
          label="B"
          ariaLabel={t('tools.analysis.secant.pointB')}
        />
      )}
    </>
  );
}
