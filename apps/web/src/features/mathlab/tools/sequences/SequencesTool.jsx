import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Play, Pause, SkipBack, SkipForward, RotateCcw, PanelBottomClose, PanelBottomOpen,
  GraduationCap, X,
} from 'lucide-react';
import './sequences.css';
import SequencePlane from './SequencePlane.jsx';
import SequenceLayer from './SequenceLayer.jsx';
import CobwebLayer from './CobwebLayer.jsx';
import TableExplorer from './TableExplorer.jsx';
import SequenceInspector, { SequenceDefinitionCard } from './SequenceInspector.jsx';
import SequenceControls from './SequenceControls.jsx';
import PracticePanel from './PracticePanel.jsx';
import {
  normalizeSequencesData, serializeSequencesData, createSequencesData,
  setParameter, setCount, setCursor, stepForward, stepBackward, resetCursor,
  setProbe, toggleLayer, setView, setCobwebView, toggleCompare, applyPreset,
  applyExperimentPatch, createPracticeState,
} from './sequenceState.js';
import { buildModel, probeTerm, fitViewToTerms, fitCobwebView } from './sequenceModel.js';
import { getExperiment } from './presets.js';
import { generateChallenge, checkAnswer, revealTarget, kindsForSpec } from './practice.js';
import { createSpec } from './sequenceState.js';
import { formatTerm, termName } from './sequenceFormat.js';
import { useCompactCharts, useReducedMotion } from '../probabilityStats/useMediaQuery.js';

/** Le délai entre un changement et sa remise à la coquille (qui attend encore avant d'enregistrer). */
const SERIALIZE_MS = 300;

/** Les vitesses d'itération offertes, en termes par seconde (§6). */
const SPEEDS = Object.freeze([0.5, 1, 2, 4]);

/**
 * Le مختبر المتتاليات dans la coquille du مختبر (MathLabToolProps).
 *
 * L'état du document (`sequenceState.js`) vit ICI ; toute la mathématique est
 * dans les modules purs que ce composant se contente d'appeler — aucun calcul
 * dans le JSX (§46, §48).
 *
 *     on change un paramètre → les termes suivent → le tableau suit →
 *     le graphe suit → la tendance suit → un comportement apparaît
 *
 * ── La séparation de §42 et §48, rendue littérale ────────────────────────
 * `data` (persisté) contre `useState` local (jamais persisté) :
 *
 *   | état MATHÉMATIQUE (data)    | état d'INTERFACE (local)      |
 *   |-----------------------------|-------------------------------|
 *   | la suite, ses paramètres    | l'itération en cours          |
 *   | le nombre de termes         | sa vitesse                    |
 *   | le curseur, l'indice sondé  | le panneau ouvert/fermé       |
 *   | les couches, la fenêtre     | la question d'entraînement    |
 *   | le score d'entraînement     | l'expérience ouverte          |
 *
 * Ce n'est pas une convention : l'animation n'a AUCUN champ dans `data`, donc
 * elle ne peut pas y arriver par accident (§48).
 */
export default function SequencesTool({ initialData, onChange, onReady }) {
  const { t } = useTranslation('mathlab');
  const [data, setData] = useState(() => (initialData && Object.keys(initialData).length
    ? normalizeSequencesData(initialData)
    : createSequencesData()));

  // ── L'état d'INTERFACE : jamais sérialisé (§42, §48) ──────────────────
  const [panelOpen, setPanelOpen] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [announcement, setAnnouncement] = useState('');
  const [experiment, setExperiment] = useState(null);
  const [probeResult, setProbeResult] = useState(null);
  const [practice, setPractice] = useState(() => createPracticeState());
  const compact = useCompactCharts();
  const reducedMotion = useReducedMotion();

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
        onChangeRef.current?.(serializeSequencesData(dataRef.current));
      }, SERIALIZE_MS);

      return next;
    });
  }, []);

  useEffect(() => () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      onChangeRef.current?.(serializeSequencesData(dataRef.current));
    }
  }, []);

  // ── Le modèle : TOUT ce qui s'affiche, calculé une fois par rendu ─────
  const model = useMemo(() => buildModel(data), [data]);

  // ── L'itération pas à pas (§6) ────────────────────────────────────────

  /**
   * L'animation vit dans une `requestAnimationFrame`, pas dans un
   * `setInterval` : le pas dépend du TEMPS ÉCOULÉ, si bien que la vitesse est
   * la même sur un écran à 60 Hz et sur un à 120 Hz (§48).
   *
   * Elle avance le CURSEUR, pas les paramètres — un terme après l'autre, comme
   * §6 le demande, et elle s'arrête d'elle-même au dernier terme plutôt que de
   * boucler : on regarde une suite se construire, on ne la regarde pas tourner.
   */
  const playingRef = useRef(playing);
  playingRef.current = playing;
  const speedRef = useRef(speed);
  speedRef.current = speed;

  useEffect(() => {
    if (!playing) return undefined;
    let frame = 0;
    let last = performance.now();
    let accumulated = 0;

    const tick = (now) => {
      const elapsed = Math.min(now - last, 250) / 1000;   // un onglet en arrière-plan ne saute pas dix termes
      last = now;
      accumulated += elapsed * speedRef.current;

      if (accumulated >= 1) {
        const steps = Math.floor(accumulated);
        accumulated -= steps;
        const current = dataRef.current;
        const lastIndex = current.primary.startIndex + current.count - 1;
        if (current.cursor >= lastIndex) {
          setPlaying(false);

          return;
        }
        commit((state) => setCursor(state, Math.min(
          state.primary.startIndex + state.count - 1,
          state.cursor + steps,
        )));
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [playing, commit]);

  /** Le mouvement réduit (§43) : l'itération ne démarre pas d'elle-même. */
  useEffect(() => {
    if (reducedMotion) setPlaying(false);
  }, [reducedMotion]);

  // ── La coquille ───────────────────────────────────────────────────────

  useEffect(() => {
    onReady?.({
      clear: () => {
        setPlaying(false);
        setExperiment(null);
        setProbeResult(null);
        setPractice(createPracticeState());
        setAnnouncement(t('tools.sequences.announceReset'));
        commit(() => createSequencesData());
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

  // ── Les fenêtres : recadrées quand la suite change d'échelle (§19) ────

  /**
   * La fenêtre du graphe suit les termes — mais seulement quand l'élève n'a
   * pas pris la main. `data.view` garde SON cadrage ; sinon on recadre sur les
   * termes, en ignorant les valeurs aberrantes (`fitViewToTerms`).
   *
   * La clé de mémorisation est volontairement grossière (le nombre de termes et
   * les extrêmes arrondis) : recadrer à chaque frappe ferait sauter le graphe
   * sous les doigts, et §48 demande de ne pas tout recalculer sans cesse.
   */
  const autoView = useMemo(
    () => fitViewToTerms(model.terms, data.primary.startIndex, data.count),
    [model.terms, data.primary.startIndex, data.count],
  );
  const graphView = data.view ?? autoView;

  const cobwebAuto = useMemo(
    () => fitCobwebView(model.terms, model.fixed.points, model.cobweb),
    [model.terms, model.fixed.points, model.cobweb],
  );
  const cobwebView = data.cobwebView ?? cobwebAuto;

  // ── Les gestes ────────────────────────────────────────────────────────

  const changeParameter = useCallback((key, value, target = 'primary') => {
    setPlaying(false);
    commit((current) => setParameter(current, key, value, target));
  }, [commit]);

  const changeCount = useCallback((value) => commit((current) => setCount(current, value)), [commit]);
  const pickIndex = useCallback((index) => {
    setPlaying(false);
    commit((current) => setCursor(current, index));
  }, [commit]);

  const onLayer = useCallback((key) => commit((current) => toggleLayer(current, key)), [commit]);
  const onCompare = useCallback(() => commit(toggleCompare), [commit]);

  const openPreset = useCallback((id) => {
    setPlaying(false);
    setExperiment(null);
    // Un préréglage change l'échelle : on rend la main au recadrage automatique.
    commit((current) => ({ ...applyPreset(current, id), view: null, cobwebView: null }));
    setAnnouncement(t('tools.sequences.announcePreset'));
  }, [commit, t]);

  const openExperiment = useCallback((id) => {
    const found = getExperiment(id);
    if (!found) return;
    setPlaying(false);
    commit((current) => ({ ...applyExperimentPatch(current, found), view: null, cobwebView: null }));
    setExperiment({ id, step: 0 });
    setAnnouncement(t('tools.sequences.announceExperiment'));
  }, [commit, t]);

  const runProbe = useCallback(() => {
    setProbeResult(probeTerm(dataRef.current, dataRef.current.probe));
  }, []);

  const changeProbeIndex = useCallback((index) => {
    setProbeResult(null);
    commit((current) => setProbe(current, index));
  }, [commit]);

  // ── L'entraînement (§27) ──────────────────────────────────────────────

  const seedRef = useRef(Date.now());

  const nextChallenge = useCallback(() => {
    seedRef.current += 1;
    const challenge = generateChallenge(seedRef.current, { kinds: kindsForSpec(dataRef.current.primary) });
    setPractice((current) => ({
      ...current,
      active: true,
      challenge,
      phase: 'predict',
      answer: '',
      attempts: 0,
      hintsUsed: 0,
      verdict: null,
      revealMode: null,
      revealPending: false,
      revealPosed: false,
      seen: current.seen + 1,
    }));

    // Une question « d'après le graphe » a besoin du graphe : on POSE la suite
    // dont elle parle avant de demander (§27 « given a graph, ask… »).
    if (challenge.showFirst) {
      const target = revealTarget(challenge);
      if (target) {
        commit((current) => ({
          ...current,
          primary: createSpec({ ...current.primary, ...target.spec }),
          count: target.count,
          cursor: target.spec.startIndex ?? 0,
          view: null,
          preset: null,
        }));
      }
    }
  }, [commit]);

  const startPractice = useCallback(() => {
    setPlaying(false);
    setPractice((current) => ({ ...createPracticeState(), solved: current.solved, seen: current.seen }));
    nextChallenge();
  }, [nextChallenge]);

  const closePractice = useCallback(() => {
    setPractice((current) => ({
      ...createPracticeState(),
      solved: current.solved,
      seen: current.seen,
    }));
    // Le score, lui, vit dans le document (§27) : on l'y remet.
    commit((current) => ({
      ...current,
      practice: { ...current.practice, solved: practice.solved, seen: practice.seen },
    }));
  }, [commit, practice.solved, practice.seen]);

  const answerPractice = useCallback((value) => {
    setPractice((current) => ({ ...current, answer: value, verdict: null }));
  }, []);

  const submitPractice = useCallback(() => {
    setPractice((current) => {
      if (!current.challenge) return current;
      const verdict = checkAnswer(current.challenge, current.answer);
      const solved = verdict.correct && current.phase === 'predict' ? current.solved + 1 : current.solved;
      // Une réponse fausse ne ferme RIEN : on note le verdict et on en reste là.
      const next = { ...current, verdict, attempts: current.attempts + 1, solved };
      if (verdict.correct && current.phase !== 'reveal') {
        // L'élève a PRODUIT la réponse : la révélation est entière et immédiate.
        next.phase = 'reveal';
        next.revealMode = 'answer';
        next.revealPending = true;
      }

      return next;
    });
  }, []);

  const hintPractice = useCallback(() => {
    setPractice((current) => ({
      ...current,
      hintsUsed: Math.min(current.hintsUsed + 1, current.challenge?.hintKeys.length ?? 0),
    }));
  }, []);

  /**
   * « اكشف » DEMANDÉ : la solution se déroule pas à pas dans le panneau
   * (exigence 2026-09-30). La suite n'est posée dans l'espace — curseur sur
   * le terme demandé, tableau allumé — qu'au DERNIER pas (`completeReveal`) :
   * sinon le tableau donnerait la réponse avant la fin du déroulé.
   */
  const revealPractice = useCallback(() => {
    setPractice((current) => ({ ...current, phase: 'reveal', revealMode: 'request', revealPending: false }));
  }, []);

  const completeReveal = useCallback(() => {
    setPractice((current) => (
      current.phase === 'reveal' && current.revealMode === 'request' && !current.revealPending && !current.revealPosed
        ? { ...current, revealPending: true, revealPosed: true }
        : current
    ));
  }, []);

  /**
   * Révéler, c'est POSER la suite dans l'espace de travail (§27) : l'élève ne
   * lit pas un nombre, il voit la suite dont on parlait, avec la lecture qui
   * l'explique (les différences, ou les rapports) allumée.
   *
   * Un effet plutôt qu'un appel direct dans `revealPractice` : la révélation
   * touche DEUX états (celui de l'entraînement et le document), et les nouer
   * dans un même gestionnaire ferait un `commit` pendant un `setState`.
   */
  useEffect(() => {
    if (!practice.revealPending || !practice.challenge) return;
    const target = revealTarget(practice.challenge);
    setPractice((current) => ({ ...current, revealPending: false }));
    if (!target) return;
    commit((current) => ({
      ...current,
      primary: createSpec({ ...current.primary, ...target.spec }),
      count: target.count,
      cursor: target.cursor,
      layers: { ...current.layers, [target.layer]: true, table: true },
      view: null,
      preset: null,
    }));
  }, [practice.revealPending, practice.challenge, commit]);

  // Le score du document et celui de la session se suivent.
  const practiceWithScore = useMemo(() => ({
    ...practice,
    solved: practice.active ? practice.solved : data.practice.solved,
    seen: practice.active ? practice.seen : data.practice.seen,
  }), [practice, data.practice]);

  useEffect(() => {
    if (!practice.active) return;
    commit((current) => (
      current.practice.solved === practice.solved && current.practice.seen === practice.seen
        ? current
        : { ...current, practice: { ...current.practice, solved: practice.solved, seen: practice.seen } }
    ));
  }, [practice.active, practice.solved, practice.seen, commit]);

  // ── Une micro-explication à la fois, par ordre d'urgence (§51) ────────

  const microNote = useMemo(() => {
    if (model.error) return null;
    if (model.stopped?.reason === 'overflow') return 'overflow';
    if (model.stopped?.reason === 'undefined') return 'undefinedTerm';
    const spec = data.primary;
    if (spec.kind === 'geometric') {
      if (spec.ratio === 1) return 'ratioOne';
      if (spec.ratio === 0) return 'ratioZero';
      if (spec.ratio === -1) return 'ratioMinusOne';
      if (spec.ratio > 0 && spec.ratio < 1) return 'ratioShrinking';
      if (spec.ratio > 1) return 'ratioGrowing';
      if (spec.ratio < 0) return 'ratioNegative';
    }
    if (spec.kind === 'arithmetic') {
      if (spec.difference === 0) return 'differenceZero';
      if (spec.difference < 0) return 'differenceNegative';
    }
    if (model.affine && Math.abs(model.affine.a) < 1 && model.affine.a !== 0) return 'affineConverges';

    return null;
  }, [data.primary, model.error, model.stopped, model.affine]);

  const currentExperiment = experiment ? getExperiment(experiment.id) : null;
  const lastIndex = data.primary.startIndex + data.count - 1;
  const atEnd = data.cursor >= lastIndex;

  return (
    <div
      className="sa-ml-seq"
      role="region"
      aria-label={t('tools.sequences.name')}
      data-ml-sequences
    >
      {/* ── LA SCÈNE : la mathématique est le héros visuel (§50) ──────── */}
      <div className="sa-ml-seq__stage" data-ml-seq-stage>
        <div className={`sa-ml-seq__plots${data.layers.cobweb ? ' sa-ml-seq__plots--split' : ''}`}>
          <div className="sa-ml-seq__plotbox" data-ml-seq-plotbox="graph">
            <SequencePlane
              initialViewport={graphView}
              grid={data.layers.grid}
              onViewportChange={(view) => commit((current) => setView(current, view))}
              canvasLabel={t('tools.sequences.canvasLabel')}
            >
              {({ view }) => (
                <SequenceLayer
                  terms={model.terms}
                  layers={data.layers}
                  cursor={data.cursor}
                  startIndex={data.primary.startIndex}
                  even={model.even}
                  odd={model.odd}
                  range={model.range}
                  secondaryTerms={model.secondaryTerms}
                  fixedPoints={data.layers.fixedPoints ? model.fixed.points : []}
                  trendValue={data.layers.fixedPoints ? model.trend?.approachingValue ?? null : null}
                  onPickIndex={pickIndex}
                  view={view}
                />
              )}
            </SequencePlane>
          </div>

          {/* La toile d'araignée (§9), côte à côte avec le graphe. */}
          {data.layers.cobweb && (
            <div className="sa-ml-seq__plotbox" data-ml-seq-plotbox="cobweb">
              {model.firstOrder ? (
                <SequencePlane
                  initialViewport={cobwebView}
                  grid={data.layers.grid}
                  square
                  xAxisName="x"
                  onViewportChange={(view) => commit((current) => setCobwebView(current, view))}
                  canvasLabel={t('tools.sequences.cobwebLabel')}
                >
                  {({ view }) => (
                    <CobwebLayer
                      path={model.cobweb}
                      step={model.step}
                      fixedPoints={model.fixed.points}
                      view={view}
                      cursor={data.cursor}
                      terms={model.terms}
                    />
                  )}
                </SequencePlane>
              ) : (
                <p className="sa-ml-seq__empty" data-ml-seq-cobweb-unavailable>
                  {t('tools.sequences.cobwebUnavailable')}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Le transport : play, pas à pas, vitesse (§6, §7) ───────── */}
        <div className="sa-ml-seq__transport" role="group" aria-label={t('tools.sequences.transport.label')}>
          <button
            type="button"
            className="sa-ml-seq__btn sa-ml-seq__btn--icon"
            onClick={() => commit(resetCursor)}
            aria-label={t('tools.sequences.transport.reset')}
            title={t('tools.sequences.transport.reset')}
            data-ml-seq-reset
          >
            <RotateCcw size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="sa-ml-seq__btn sa-ml-seq__btn--icon"
            onClick={() => { setPlaying(false); commit(stepBackward); }}
            disabled={data.cursor <= data.primary.startIndex}
            aria-label={t('tools.sequences.transport.previous')}
            title={t('tools.sequences.transport.previous')}
            data-ml-seq-prev
          >
            <SkipBack size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={`sa-ml-seq__btn sa-ml-seq__btn--icon${playing ? ' sa-ml-seq__btn--active' : ''}`}
            onClick={() => setPlaying((value) => !value)}
            aria-label={playing ? t('tools.sequences.transport.pause') : t('tools.sequences.transport.play')}
            title={playing ? t('tools.sequences.transport.pause') : t('tools.sequences.transport.play')}
            aria-pressed={playing}
            data-ml-seq-play
          >
            {playing ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
          </button>

          {/* « Terme suivant » (§7) : un clic, exactement un terme de plus. */}
          <button
            type="button"
            className="sa-ml-seq__btn sa-ml-seq__btn--primary"
            onClick={() => { setPlaying(false); commit(stepForward); }}
            data-ml-seq-next
          >
            <SkipForward size={16} aria-hidden="true" />
            <span className="sa-ml-seq__btnlabel">
              {atEnd ? t('tools.sequences.transport.computeNext') : t('tools.sequences.transport.next')}
            </span>
          </button>

          <label className="sa-ml-seq__speed">
            <span className="sa-ml-seq__speedlabel">{t('tools.sequences.transport.speed')}</span>
            <select
              className="sa-ml-seq__select"
              value={speed}
              onChange={(event) => setSpeed(Number(event.target.value))}
              data-ml-seq-speed
            >
              {SPEEDS.map((value) => (
                <option key={value} value={value}>{`×${formatTerm(value, 1)}`}</option>
              ))}
            </select>
          </label>

          <span className="sa-ml-seq__cursorbadge" dir="ltr" data-ml-seq-cursor-badge>
            {`${termName(data.cursor)} = ${model.cursorTerm ? formatTerm(model.cursorTerm.value) : '—'}`}
          </span>
        </div>

        {reducedMotion && (
          <p className="sa-ml-seq__note" data-ml-seq-reduced-motion>
            {t('tools.sequences.reducedMotionNote')}
          </p>
        )}

        {/* Une micro-explication contextuelle (§51) — courte, jamais un paragraphe. */}
        {microNote && (
          <p className="sa-ml-seq__micro" role="status" data-ml-seq-micro={microNote}>
            {t(`tools.sequences.micro.${microNote}`)}
          </p>
        )}

        {/* L'expérience ouverte (§26) : une question, des pas, et TOUJOURS de quoi fermer. */}
        {currentExperiment && (
          <div className="sa-ml-seq__guide" data-ml-seq-guide={currentExperiment.id}>
            <p className="sa-ml-seq__guidequestion">{t(currentExperiment.questionKey)}</p>
            <p className="sa-ml-seq__guidestep">
              {t(currentExperiment.steps[Math.min(experiment.step, currentExperiment.steps.length - 1)])}
            </p>
            <div className="sa-ml-seq__guideactions">
              {experiment.step < currentExperiment.steps.length - 1 && (
                <button
                  type="button"
                  className="sa-ml-seq__btn sa-ml-seq__btn--primary"
                  onClick={() => setExperiment((current) => ({ ...current, step: current.step + 1 }))}
                  data-ml-seq-guide-next
                >
                  {t('tools.sequences.guideNext')}
                </button>
              )}
              <button
                type="button"
                className="sa-ml-seq__btn"
                onClick={() => setExperiment(null)}
                data-ml-seq-guide-close
              >
                <X size={15} aria-hidden="true" />
                <span>{t('tools.sequences.guideClose')}</span>
              </button>
            </div>
          </div>
        )}

        <p className="sa-ml-seq__sr" role="status" aria-live="polite">{announcement}</p>
      </div>

      {/* ── LE PANNEAU ────────────────────────────────────────────────── */}
      <div
        className={`sa-ml-seq__panel${panelOpen ? '' : ' sa-ml-seq__panel--collapsed'}`}
        data-ml-panel
        data-ml-panel-open={panelOpen ? 'true' : 'false'}
      >
        <div className="sa-ml-seq__panel-head">
          <h2 className="sa-ml-seq__panel-title">{t('tools.sequences.panelHeading')}</h2>
          <button
            type="button"
            className={`sa-ml-seq__btn sa-ml-seq__btn--icon${practice.active ? ' sa-ml-seq__btn--active' : ''}`}
            onClick={practice.active ? closePractice : startPractice}
            aria-label={t('tools.sequences.practice.start')}
            title={t('tools.sequences.practice.start')}
            aria-pressed={practice.active}
            data-ml-seq-practice-start
          >
            <GraduationCap size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="sa-ml-seq__btn sa-ml-seq__btn--icon sa-ml-seq__collapse"
            onClick={() => setPanelOpen((open) => !open)}
            aria-expanded={panelOpen}
            aria-label={panelOpen ? t('tools.sequences.panelHide') : t('tools.sequences.panelShow')}
            title={panelOpen ? t('tools.sequences.panelHide') : t('tools.sequences.panelShow')}
            data-ml-panel-toggle
          >
            {panelOpen
              ? <PanelBottomClose size={18} aria-hidden="true" />
              : <PanelBottomOpen size={18} aria-hidden="true" />}
          </button>
        </div>

        <div className="sa-ml-seq__panel-body">
          {/* La définition, COLLANTE en haut : elle doit être enfant DIRECT du
              conteneur qui défile, sinon `position: sticky` la colle au sommet
              de l'inspecteur et elle s'en va avec lui (mesuré en navigateur). */}
          <SequenceDefinitionCard data={data} model={model} />

          {practice.active && (
            <PracticePanel
              practice={practiceWithScore}
              onAnswer={answerPractice}
              onSubmit={submitPractice}
              onHint={hintPractice}
              onReveal={revealPractice}
              onRevealDone={completeReveal}
              onNext={nextChallenge}
              onClose={closePractice}
            />
          )}

          <SequenceInspector
            data={data}
            model={model}
            probeResult={probeResult}
            onProbe={runProbe}
            onProbeIndex={changeProbeIndex}
            compact={compact}
          />

          {/* Le tableau est une COUCHE : un préréglage peut l'éteindre pour
              laisser la place à la toile (§39). Quand il est éteint, on le dit
              et on offre de le rallumer — sinon l'élève cherche un tableau
              disparu sans savoir qu'il tient à une case à cocher. */}
          {!data.layers.table && (
            <button
              type="button"
              className="sa-ml-seq__btn sa-ml-seq__tableoff"
              onClick={() => onLayer('table')}
              data-ml-seq-table-off
            >
              {t('tools.sequences.table.show')}
            </button>
          )}

          {data.layers.table && (
            <TableExplorer
              terms={model.terms}
              deltas={model.deltas}
              quotients={model.quotients}
              sums={model.sums}
              secondDeltas={model.secondDeltas}
              layers={data.layers}
              cursor={data.cursor}
              onPickIndex={pickIndex}
            />
          )}

          <SequenceControls
            data={data}
            model={model}
            onParameter={changeParameter}
            onCount={changeCount}
            onLayer={onLayer}
            onPreset={openPreset}
            onExperiment={openExperiment}
            onCompare={onCompare}
            experimentFocus={currentExperiment?.focus ?? null}
          />
        </div>
      </div>
    </div>
  );
}
