import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AreaChart, BarChart3, Dices, Network } from 'lucide-react';
import './probabilityStats.css';
import LabSectionNav from '../../shared/LabSectionNav.jsx';
import { formatValue } from '../functionGrapher/grapherFormat.js';
import {
  DEFAULT_NORMAL, EXAMPLE_DATASET, MODES, normalizeProbabilityStatsData, toStoredData,
} from './probabilityState.js';
import { createDefaultTree } from './probabilityTree.js';
import {
  getExperiment, normalizeRange, theoreticalFraction,
} from './experiments.js';
import {
  ANIMATION_BATCH, ANIMATION_SLOW_THRESHOLD, comparisonRows, createSimulation, freshSeed,
  matchesExperiment, runBatch,
} from './simulationEngine.js';
import ExperimentControls from './ExperimentControls.jsx';
import SectionFrame from './SectionFrame.jsx';
import DatasetSection from './DatasetSection.jsx';
import TreeSection from './TreeSection.jsx';
import NormalSection from './NormalSection.jsx';
import TheoreticalComparison from './TheoreticalComparison.jsx';
import FrequencyBars from './FrequencyBars.jsx';
import ConvergenceChart from './ConvergenceChart.jsx';
import DiceViewer from './DiceViewer.jsx';
import { useCompactCharts, useReducedMotion } from './useMediaQuery.js';
import { clampToFeatures, probabilityFeatures } from './scope.js';

/** Le délai entre un changement et sa remise à la coquille (qui attend encore avant d'enregistrer). */
const SERIALIZE_MS = 300;
/** Le calme après lequel une saisie de série est relue — assez court pour suivre la frappe, assez long pour ne pas recalculer à chaque touche. */
const DATASET_DEBOUNCE_MS = 250;
/** Jusqu'à ce nombre de tirages, chaque tirage est un vrai lancer qu'on regarde ; au-delà, un lot. */
export const WATCH_MAX = 10;

/**
 * الاحتمالات والإحصاء — le laboratoire des probabilités et des statistiques,
 * dans la coquille du مختبر (MathLabToolProps — toolContract.js).
 *
 *     choisir une expérience → lancer → voir les données s'accumuler →
 *     comparer au théorique → changer les paramètres → recommencer
 *
 * L'état du document (probabilityState.js) vit ICI. Les tirages, eux, ne
 * passent jamais par React un par un : le moteur (simulationEngine.js)
 * accumule des EFFECTIFS par lots, et un lot rend un état. Cent mille
 * lancers, c'est deux cents rendus, pas cent mille (§ 29).
 *
 * Les calculs ne connaissent ni React ni le DOM ; les graphiques ne
 * calculent rien. C'est la même séparation que le grapheur.
 */
export default function ProbabilityStatsTool({ initialData, onChange, onReady, capabilities = null }) {
  const { t } = useTranslation('mathlab');
  // Le مخبر (scope.js) : ce que l'instrument montre — tout, au ثانوي.
  const features = useMemo(() => probabilityFeatures(capabilities), [capabilities]);
  const [data, setData] = useState(() => clampToFeatures(normalizeProbabilityStatsData(initialData), features));
  const [running, setRunning] = useState(false);
  // La saisie de la série vit à part : elle suit la frappe, l'état du
  // document ne la reçoit qu'au calme revenu.
  const [datasetDraft, setDatasetDraft] = useState(() => normalizeProbabilityStatsData(initialData).dataset);
  // Ce que fait la table d'expérience : rien, un lancer en l'air, ou un lot qui culbute.
  const [phase, setPhase] = useState('idle');
  // Les faces réellement en haut après la dernière pose, LUES sur les objets (la vérification indépendante).
  const [topFaces, setTopFaces] = useState('');
  const compact = useCompactCharts();
  const reducedMotion = useReducedMotion();
  const reducedMotionRef = useRef(reducedMotion);
  reducedMotionRef.current = reducedMotion;
  const diceRef = useRef(null);
  const runTokenRef = useRef(null);

  const timerRef = useRef(null);
  const datasetTimerRef = useRef(null);
  const frameRef = useRef(null);
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
        onChangeRef.current?.(toStoredData(dataRef.current));
      }, SERIALIZE_MS);

      return next;
    });
  }, []);

  // Ce qui attendait d'être remis part au démontage ; l'animation s'arrête.
  useEffect(() => () => {
    if (runTokenRef.current) runTokenRef.current.cancelled = true;
    cancelAnimationFrame(frameRef.current);
    clearTimeout(datasetTimerRef.current);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      onChangeRef.current?.(toStoredData(dataRef.current));
    }
  }, []);

  // Après chaque pose — un lancer qui atterrit, un lot qui se pose, ou un
  // tirage posé sans mouvement — lire ce que la table MONTRE vraiment (la
  // face en haut, sur l'orientation réelle des objets). C'est la vérification
  // indépendante que l'objet et le résultat disent la même chose.
  useEffect(() => {
    if (phase !== 'idle' || !data.simulation?.last) return;
    const faces = diceRef.current?.topFaces() ?? [];
    setTopFaces(faces.join(','));
  }, [phase, data.simulation]);

  // ── Ce que la coquille peut offrir : effacer. Pas d'export PNG en V1 ────
  useEffect(() => {
    onReady?.({
      clear: () => {
        if (runTokenRef.current) runTokenRef.current.cancelled = true;
        runTokenRef.current = null;
        cancelAnimationFrame(frameRef.current);
        diceRef.current?.cancel([1, 1]);
        setRunning(false);
        setPhase('idle');
        setDatasetDraft(EXAMPLE_DATASET);
        clearTimeout(datasetTimerRef.current);
        // Toutes les sections repartent de leur état neuf ; la section ouverte reste ouverte.
        commit((current) => ({
          ...current, simulation: null, dataset: EXAMPLE_DATASET, chart: null, tree: createDefaultTree(), normal: { ...DEFAULT_NORMAL },
        }));
      },
    });

    return () => onReady?.(null);
  }, [onReady, commit]);

  // ── L'expérience et ses paramètres ─────────────────────────────────────
  const stopAnimation = useCallback(() => {
    if (runTokenRef.current) runTokenRef.current.cancelled = true;
    runTokenRef.current = null;
    cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    // Un lancer interrompu en l'air revient à sa pose : elle n'a pas été observée.
    diceRef.current?.cancel(dataRef.current.simulation?.last?.parts ?? null);
    setRunning(false);
    setPhase('idle');
  }, []);

  const changeExperiment = useCallback((experiment) => {
    stopAnimation();
    // Changer d'expérience change l'univers : les effectifs accumulés ne
    // veulent plus rien dire. On repart de zéro plutôt que de mentir.
    commit((current) => (current.experiment === experiment ? current : { ...current, experiment, simulation: null }));
  }, [commit, stopAnimation]);

  const changeRange = useCallback((range) => {
    stopAnimation();
    commit((current) => {
      const next = normalizeRange(range);
      if (next.min === current.range.min && next.max === current.range.max) return current;

      return { ...current, range: next, simulation: null };
    });
  }, [commit, stopAnimation]);

  const changeDraws = useCallback((draws) => commit((current) => (current.draws === draws ? current : { ...current, draws })), [commit]);

  const reset = useCallback(() => {
    stopAnimation();
    commit((current) => (current.simulation === null ? current : { ...current, simulation: null }));
  }, [commit, stopAnimation]);

  /**
   * LANCER. Trois façons, selon ce qu'on peut MONTRER :
   *
   *   1. Jusqu'à WATCH_MAX tirages, sur une table (dé, dés, pièce), sans
   *      « mouvement réduit » : chaque tirage est un vrai lancer. Le moteur
   *      tire D'ABORD (`runBatch(current, 1)` → `next.last.parts`), l'objet
   *      rejoint l'orientation de ce résultat, et c'est à l'ATTERRISSAGE que
   *      `next` devient l'état : un lancer = une observation, ni avant ni
   *      après. Un lancer interrompu en l'air n'est pas comptée.
   *   2. Un lot plus gros, sur une table : les objets culbutent pendant que
   *      les effectifs s'accumulent par images (ANIMATION_BATCH par image), et
   *      se posent à la fin sur le DERNIER tirage — vrai lui aussi.
   *   3. Sans table (générateur d'entiers, mouvement réduit, pas de WebGL) :
   *      les lots par images, sans rien d'autre.
   *
   * Dans les trois cas le moteur est la seule source de vérité ; la table ne
   * fait que montrer ce qu'il a tiré.
   */
  const run = useCallback(() => {
    const { experiment, range, draws, simulation, settings } = dataRef.current;
    const params = experiment === 'random' ? range : {};
    const spec = getExperiment(experiment);
    const base = simulation && matchesExperiment(simulation, experiment, params)
      ? simulation
      : createSimulation(experiment, params, freshSeed());
    const target = base.total + draws;
    const dice = diceRef.current;
    const animate = Boolean(spec.physical) && !reducedMotionRef.current && Boolean(dice?.isReady());
    const token = { cancelled: false };
    runTokenRef.current = token;
    setRunning(true);
    // Le premier lot part du socle choisi ci-dessus (la simulation courante
    // ou une neuve), pour qu'un changement d'expérience reparte bien de zéro.
    commit((state) => ({ ...state, simulation: base }));

    const finish = () => {
      if (token.cancelled) return;
      runTokenRef.current = null;
      setRunning(false);
      setPhase('idle');
    };

    // ── 1. Des lancers qu'on regarde ──────────────────────────────────────
    if (animate && draws <= WATCH_MAX && settings.watchRolls) {
      let current = base;
      (async () => {
        for (let i = 0; i < draws && !token.cancelled; i += 1) {
          const next = runBatch(current, 1, params, target);
          setPhase('throwing');
          const outcome = await dice.throw(next.last.parts);
          if (token.cancelled || outcome.cancelled) return;
          current = next;
          setTopFaces(dice.topFaces().join(','));
          commit((state) => ({ ...state, simulation: next }));
        }
        finish();
      })();

      return;
    }

    // ── 2 et 3. Un lot, par images ────────────────────────────────────────
    const perFrame = draws <= ANIMATION_SLOW_THRESHOLD ? 1 : ANIMATION_BATCH;
    // La boucle porte ELLE-MÊME la simulation courante et n'en remet que des
    // instantanés à React : elle ne dépend pas du moment où React rend, et
    // un lot n'est jamais recalculé parce qu'un rendu aurait pris du retard.
    let current = base;
    if (animate) { setPhase('batch'); dice.startTumble(); }
    const step = () => {
      if (token.cancelled) return;
      const remaining = target - current.total;
      if (remaining <= 0) {
        if (!animate) { finish(); return; }
        dice.stopTumble(current.last.parts).then((outcome) => {
          if (token.cancelled || outcome.cancelled) return;
          setTopFaces(dice.topFaces().join(','));
          finish();
        });

        return;
      }
      current = runBatch(current, Math.min(perFrame, remaining), params, target);
      const snapshot = current;
      commit((state) => ({ ...state, simulation: snapshot }));
      frameRef.current = requestAnimationFrame(step);
    };
    frameRef.current = requestAnimationFrame(step);
  }, [commit]);

  // ── La série saisie ────────────────────────────────────────────────────
  const changeDataset = useCallback((text) => {
    setDatasetDraft(text);
    clearTimeout(datasetTimerRef.current);
    datasetTimerRef.current = setTimeout(() => {
      commit((current) => (current.dataset === text ? current : { ...current, dataset: text }));
    }, DATASET_DEBOUNCE_MS);
  }, [commit]);

  /** Une modification par pastille ou par exemple : un geste fini, appliqué sans attendre. */
  const replaceDataset = useCallback((text) => {
    clearTimeout(datasetTimerRef.current);
    setDatasetDraft(text);
    commit((current) => (current.dataset === text ? current : { ...current, dataset: text }));
  }, [commit]);

  const changeChart = useCallback((chart) => {
    if (chart !== null && !features.charts.includes(chart)) return;
    commit((current) => (current.chart === chart ? current : { ...current, chart }));
  }, [commit, features]);

  // ── L'arbre et la loi normale : des transitions pures (probabilityTree.js) ──
  const changeTree = useCallback((updater) => commit((current) => {
    const tree = updater(current.tree);

    return tree === current.tree ? current : { ...current, tree };
  }), [commit]);

  const changeNormal = useCallback((patch) => commit((current) => {
    const normal = { ...current.normal, ...patch };

    return Object.keys(patch).every((key) => current.normal[key] === normal[key]) ? current : { ...current, normal };
  }), [commit]);

  const changeMode = useCallback((mode) => {
    if (!MODES.includes(mode) || !features.sections.includes(mode)) return;
    stopAnimation();
    commit((current) => (current.mode === mode ? current : { ...current, mode }));
  }, [commit, stopAnimation, features]);

  const toggleSetting = useCallback((key) => commit((current) => ({
    ...current, settings: { ...current.settings, [key]: !current.settings[key] },
  })), [commit]);

  // ── Ce qu'on affiche ───────────────────────────────────────────────────
  const params = data.experiment === 'random' ? data.range : {};
  const experimentSpec = getExperiment(data.experiment);
  const simulation = data.simulation;

  const rows = useMemo(
    () => (simulation ? comparisonRows(simulation, params) : []),
    // `params` est recréé à chaque rendu : ce sont ses VALEURS qui comptent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [simulation, data.experiment, data.range.min, data.range.max],
  );

  /** L'étiquette d'une issue : « وجه » / « ظهر » pour la pièce, le nombre sinon. */
  const labelFor = useCallback(
    (row) => (data.experiment === 'coin' ? t(`tools.probabilityStats.coin.${row.key}`) : row.key),
    [data.experiment, t],
  );

  /** Une composante physique en clair : « وجه » / « ظهر » pour la pièce, le nombre sinon. */
  const labelForPart = useCallback(
    (part) => (data.experiment === 'coin' ? t(`tools.probabilityStats.coin.${part === 1 ? 'heads' : 'tails'}`) : String(part)),
    [data.experiment, t],
  );

  const fractionFor = useCallback(
    (row) => theoreticalFraction(data.experiment, row.index, params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data.experiment, data.range.min, data.range.max],
  );

  const sections = useMemo(() => [
    { id: 'experiment', icon: Dices, label: t('tools.probabilityStats.sections.experiment.label'), description: t('tools.probabilityStats.sections.experiment.description') },
    { id: 'dataset', icon: BarChart3, label: t('tools.probabilityStats.sections.dataset.label'), description: t('tools.probabilityStats.sections.dataset.description') },
    { id: 'tree', icon: Network, label: t('tools.probabilityStats.sections.tree.label'), description: t('tools.probabilityStats.sections.tree.description') },
    { id: 'normal', icon: AreaChart, label: t('tools.probabilityStats.sections.normal.label'), description: t('tools.probabilityStats.sections.normal.description') },
  ].filter((section) => features.sections.includes(section.id)), [t, features]);

  const trackedIndex = experimentSpec.trackedIndex(params);
  const trackedRow = rows[trackedIndex] ?? null;
  const physical = experimentSpec.physical;
  const experimentName = t(`tools.probabilityStats.experiments.${data.experiment}`);
  const runLabel = data.draws === 1
    ? t(`tools.probabilityStats.runLabels.${data.experiment}`)
    : `${t(`tools.probabilityStats.runLabels.${data.experiment}`)} · ${t('tools.probabilityStats.runMany', { count: data.draws })}`;
  const sectionTitle = sections.find((section) => section.id === data.mode)?.label;

  let content;
  if (data.mode === 'dataset') {
    content = (
      <DatasetSection
        title={sectionTitle}
        draft={datasetDraft}
        chart={data.chart}
        settings={data.settings}
        compact={compact}
        onType={changeDataset}
        onReplace={replaceDataset}
        onChart={changeChart}
        onToggle={toggleSetting}
        features={features}
      />
    );
  } else if (data.mode === 'tree') {
    content = <TreeSection title={sectionTitle} tree={data.tree} compact={compact} onChange={changeTree} />;
  } else if (data.mode === 'normal') {
    content = <NormalSection title={sectionTitle} normal={data.normal} compact={compact} reducedMotion={reducedMotion} onChange={changeNormal} />;
  } else {
    content = (
      <SectionFrame
        title={sectionTitle}
        panel={(
          <>
            <ExperimentControls
              experiment={data.experiment}
              range={data.range}
              draws={data.draws}
              runLabel={runLabel}
              running={running}
              hasData={Boolean(simulation)}
              onChangeExperiment={changeExperiment}
              onChangeRange={changeRange}
              onChangeDraws={changeDraws}
              onRun={run}
              onStop={stopAnimation}
              onReset={reset}
            />
            <section className="sa-ml-ps__section" aria-labelledby="ml-ps-options">
              <h3 id="ml-ps-options" className="sa-ml-ps__heading">{t('tools.probabilityStats.optionsHeading')}</h3>
              <div className="sa-ml-ps__options">
                <label className="sa-ml-ps__toggle">
                  <input
                    type="checkbox"
                    checked={data.settings.compare}
                    onChange={() => toggleSetting('compare')}
                    data-ml-ps-option="compare"
                  />
                  <span>{t('tools.probabilityStats.compare')}</span>
                </label>
                {physical && (
                  <label className="sa-ml-ps__toggle">
                    <input
                      type="checkbox"
                      checked={data.settings.watchRolls}
                      onChange={() => toggleSetting('watchRolls')}
                      data-ml-ps-option="watchRolls"
                    />
                    <span>{t('tools.probabilityStats.watchRolls', { max: WATCH_MAX })}</span>
                  </label>
                )}
              </div>
              {physical && reducedMotion && (
                <p className="sa-ml-ps__hint" data-ml-ps-reduced-motion>{t('tools.probabilityStats.reducedMotion')}</p>
              )}
            </section>
          </>
        )}
        stage={(
          <ExperimentStage
            rows={rows}
            simulation={simulation}
            compare={data.settings.compare}
            labelFor={labelFor}
            fractionFor={fractionFor}
            trackedRow={trackedRow}
            experiment={data.experiment}
            experimentName={experimentName}
            compact={compact}
            physical={physical}
            diceRef={diceRef}
            phase={phase}
            topFaces={topFaces}
            draws={data.draws}
            labelForPart={labelForPart}
          />
        )}
      />
    );
  }

  return (
    <div className="sa-ml-ps" role="region" aria-label={t('tools.probabilityStats.name')} data-ml-ps data-ml-ps-section={data.mode}>
      <LabSectionNav
        sections={sections}
        active={data.mode}
        onChange={changeMode}
        label={t('tools.probabilityStats.modeLabel')}
        dataAttr="data-ml-ps-mode"
      />
      {content}
    </div>
  );
}

/** La scène d'une expérience : le diagramme, la convergence, le tableau. */
function ExperimentStage({
  rows, simulation, compare, labelFor, fractionFor, trackedRow, experiment, experimentName, compact,
  physical, diceRef, phase, topFaces, draws, labelForPart,
}) {
  const { t } = useTranslation('mathlab');
  const total = simulation?.total ?? 0;
  const last = simulation?.last ?? null;
  // La pose de repos des objets : le dernier tirage, ou la face 1 / « وجه » d'un document neuf.
  const idleParts = last?.parts ?? (physical?.count === 2 ? [1, 1] : [1]);

  return (
    <>
      <h2 className="sa-ml-ps__stage-title">{experimentName}</h2>

      {physical && (
        <>
          <DiceViewer
            ref={diceRef}
            kind={physical.kind}
            count={physical.count}
            parts={idleParts}
            label={t('tools.probabilityStats.diceLabel', { name: experimentName })}
          />
          <p
            className={`sa-ml-ps__result ${phase !== 'idle' ? 'sa-ml-ps__result--pending' : ''}`}
            role="status"
            aria-live="polite"
            data-ml-ps-result={phase}
            data-ml-ps-top={topFaces}
            data-ml-ps-result-parts={phase === 'idle' && last ? last.parts.join(',') : ''}
          >
            {phase === 'throwing' && t('tools.probabilityStats.throwing')}
            {phase === 'batch' && t('tools.probabilityStats.batching', { count: draws })}
            {phase === 'idle' && (last ? (
              <ResultText experiment={experiment} parts={last.parts} labelForPart={labelForPart} />
            ) : (
              <span>{physical.kind === 'coin' ? '🪙' : '🎲'} {t('tools.probabilityStats.resultLabel')}: —</span>
            ))}
          </p>
        </>
      )}

      <FrequencyBars
        rows={rows}
        compare={compare}
        total={total}
        labelFor={labelFor}
        title={t('tools.probabilityStats.chartLabel', { count: total })}
        emptyMessage={t('tools.probabilityStats.noData')}
        compact={compact}
      />

      {trackedRow && total > 0 && (
        <p className="sa-ml-ps__tracked" role="status" data-ml-ps-tracked>
          <span className="sa-ml-ps__tracked-name">{labelFor(trackedRow)}</span>
          <span dir="ltr" className="sa-ml-ps__tracked-value" data-ml-ps-tracked-frequency>
            {formatValue(trackedRow.frequency * 100, 2)} %
          </span>
          <span className="sa-ml-ps__tracked-vs">{t('tools.probabilityStats.versus')}</span>
          <span dir="ltr" className="sa-ml-ps__tracked-theoretical">
            {formatValue(trackedRow.probability * 100, 2)} %
          </span>
        </p>
      )}

      {simulation && simulation.trajectory.length > 1 && trackedRow && (
        <section className="sa-ml-ps__convergence" aria-labelledby="ml-ps-convergence-heading">
          <h3 id="ml-ps-convergence-heading" className="sa-ml-ps__heading">
            {t('tools.probabilityStats.convergenceHeading', { outcome: labelFor(trackedRow) })}
          </h3>
          <ConvergenceChart
            points={simulation.trajectory}
            theoretical={trackedRow.probability}
            title={t('tools.probabilityStats.convergenceLabel', { outcome: labelFor(trackedRow) })}
            compact={compact}
          />
          {/* Une question, jamais une leçon (§ 36). */}
          <p className="sa-ml-ps__prompt" data-ml-ps-prompt>
            {t('tools.probabilityStats.convergencePrompt', { value: formatValue(trackedRow.probability * 100, 1) })}
          </p>
        </section>
      )}

      {rows.length > 0 && total > 0 && (
        <TheoreticalComparison rows={rows} labelFor={labelFor} fractionFor={fractionFor} total={total} />
      )}
    </>
  );
}

/**
 * Le résultat en clair, tel qu'on le lit sur la table :
 *   🎲 النتيجة: 4 · 🎲 4 + 🎲 5 = 9 · 🪙 النتيجة: وجه
 * L'égalité des deux dés se lit de gauche à droite, comme toute écriture mathématique.
 */
function ResultText({ experiment, parts, labelForPart }) {
  const { t } = useTranslation('mathlab');
  if (experiment === 'twoDice' && parts.length === 2) {
    return (
      <span dir="ltr" className="sa-ml-ps__result-value" data-ml-ps-result-sum={parts[0] + parts[1]}>
        🎲 {parts[0]} + 🎲 {parts[1]} = {parts[0] + parts[1]}
      </span>
    );
  }

  return (
    <>
      <span>{experiment === 'coin' ? '🪙' : '🎲'} {t('tools.probabilityStats.resultLabel')}:</span>
      <span className="sa-ml-ps__result-value">{labelForPart(parts[0])}</span>
    </>
  );
}
