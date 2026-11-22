import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import { ChevronUp, ChevronDown } from 'lucide-react';
import * as LIN from '@smarter-academy/core/arithmetic/linear.js';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import useStretchInteraction from '../useStretchInteraction';
import EquationDisplay from '../primitives/EquationDisplay';
import LabFold from '../primitives/LabFold';
import MathText from '../../components/MathText';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { useLabCoach } from '../primitives/LabCoach';
import PredictTray from '../primitives/PredictTray';
import { useInMissionPlayer, useMissionArea } from '../../mission/missionPlayerContext';
import { playSfx } from '../../utils/playEffect';
import { $, Mx, distinct, useTick, spreadAll } from './thalesCp';
import * as L from '../logic/parallelLevel';

/**
 * parallel-level — LE NIVEAU À BULLE (unité 9 « خاصية طالس », درس « الخاصية العكسية لخاصية طالس وإثبات
 * التوازي », نشاط 2 p. 105).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. L'élève POSE les deux extrémités d'une planche, B′ sur la barre (d) et C′ sur la barre (d′), encoche par
 *    encoche (glisser le long de la barre, toucher la barre, ▲ ▼, flèches du clavier) ; en متقدم il les fait
 *    passer de l'autre côté de A.
 * B. Idée : (B′C′) // (BC) ⇔ AB′/AB = AC′/AC ET A, B, B′ dans le même ordre que A, C, C′ (la réciproque de
 *    Thalès) ; deux rapports différents ⇒ pas parallèles.
 * C. La planche tourne avec ses extrémités ; le niveau à bulle posé dessus montre l'écart à (BC) — le sol ;
 *    les deux rapports s'écrivent sous la scène.
 * D. La ligne `AB′/AB = … ، AC′/AC = …` (les nombres de l'élève, réduits) ; en متقدم le côté de A de chaque
 *    point et les figures des trois élèves (1, 2, 3) cochées par SES placements.
 * E. À découvrir avant la règle : « même numéro de barreau » ne met pas de niveau ; deux planches de niveau de
 *    rapports différents ont chacune deux rapports ÉGAUX ; des rapports égaux de part et d'autre de A ne
 *    suffisent pas (la figure 3).
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        la réciproque de la propriété de Thalès : rapports égaux + même ordre ⇒ parallèles
 *   OBJECT         une planche posée entre les deux barres d'une échelle double (مبتدئ) / d'un tréteau en X
 *                  (متقدم) ; un niveau à bulle posé sur la planche
 *   VARIABLE       la POSITION de B′ et de C′ (abscisses signées, une encoche par unité)
 *   INVARIANT      AB, AC, le sol (BC) ; le rapport d'une position ne dépend que de la longueur posée sur le tout
 *   TRANSFORMATION la planche tourne, la bulle glisse ; les deux rapports et le côté de A changent
 *   CONSTRAINT     B′ ∈ (d), C′ ∈ (d′), jamais en A ; en متقدم le rapport 1/3 du professeur
 *   RESISTANCE     la bulle FUIT vers l'extrémité haute tant que (B′C′) n'est pas parallèle à (BC) — jamais au
 *                  centre « presque » (écart minimal visible) ; en متقدم le professeur refuse une figure dont un
 *                  rapport n'est pas 1/3, et la figure 3, qui respecte 1/3 et 1/3, est refusée par la bulle (l'ORDRE)
 *   EVIDENCE       la bulle au centre ou non ; la ligne des deux rapports ; la liste des essais
 *   CONTRAST       مبتدئ : deux planches de niveau (1/3 et 2/3) contre une planche penchée (« même barreau »,
 *                  « même distance aux pieds ») ; متقدم : figures 1 et 2 de niveau contre la figure 3
 *   PREDICTION     le rapport imposé 1/3 : l'élève CALCULE où poser B′ et C′ (3 et 4) avant de voir la bulle
 *   DISCOVERY      « أفقي ⇔ AB′/AB = AC′/AC » ; « + نفس الترتيب »
 *   FORMALIZATION  الخاصية العكسية لخاصية طالس (معارف 3), et sa forme contraposée (ملاحظة 1 de معارف 1)
 *   TRANSFER       les modules 2–4 (معارف 3, طرائق ص 109, ex-7, 10–16, 23–25) et la banque d'exercices
 *
 * Toutes les vérités viennent de `thales.converse` (logic/parallelLevel.js) ; le dessin est en flottants mais la
 * bulle n'est au centre QUE si converse dit parallèle. Manuel (§6bis) : chaque position est un essai — aucune
 * auto-complétion.
 *
 * DÉCOR (exigence du propriétaire) : le mur de graffiti du quartier derrière l'échelle (rangs de briques, tags
 * de couleur) et la bombe de peinture du graffeur qui, touchée, lâche un nuage et change la couleur des tags.
 * `aria-hidden`, hors clavier (`tabIndex=-1`), `[data-deco]`, jamais une information ; immobile sous
 * `prefers-reduced-motion`.
 *
 * D'UN SEUL REGARD (§8bis) : la hauteur de la scène est la hauteur naturelle du dessin, bornée par l'écran de
 * leçon (`useLessonViewport`) moins ce que le bloc `[data-pl-glance]` mesure EN PLUS de la scène (commandes,
 * lecture, verdict) ; les poignées sont SUR les barres, les ▲ ▼ juste dessous, la lecture et le verdict ensuite ;
 * la liste des essais est dans un `LabFold` sous le bloc mesuré.
 *
 * Props : `AB`, `AC` (entiers), `ratio` (« 1/3 », mode crossing), `mode` (`ladder` | `crossing`), `theme`
 * (`mural`), `title`, `lead`, `mission`, `level`, `levels`, `onTrial(evidence)` à chaque position validée,
 * `onFinished({ mode, levels, figures })` à la règle — tous par `state.report`.
 *
 * CONTRAT DOM : [data-parallel-level][data-mode][data-solved][data-bp][data-cp], [data-pl-glance], [data-pl-scene],
 * [data-pl-track=B|C], [data-pl-handle=B|C] (role=slider), [data-pl-up|down=B|C], [data-pl-plank][data-parallel],
 * [data-pl-bubble][data-offset], [data-pl-ratios], [data-pl-side], [data-pl-verdict=<kind>], [data-pl-figures],
 * [data-pl-figure=<1|2|3>][data-made][data-ok], [data-lab-fold=parallel-level.trials], [data-deco].
 */
/** Dans une ligne de texte (verdict, essais), une fraction reste à hauteur de ligne. */
const tf = (tex) => tex.replace(/\\dfrac/g, '\\tfrac');
const TONE = { level: 'text-emerald-800', figure: 'text-emerald-800', tilted: 'text-rose-800', order: 'text-rose-800', condition: 'text-amber-800' };

/*
 * LECTEUR DE MISSION (rollout 2026-11-10, unité 9 leçon 2 `aksiya-talis` ; conseil du 2026-11-10, verdict L2.1–L2.7) : joué en MANCHES (LabRounds).
 * Tout ce qui suit est gardé par `useInMissionPlayer()` ; hors lecteur (page, enseignant, mode classe) le labo est INCHANGÉ.
 *   - « ضع الميزان » (L2.1) : la bulle est CACHÉE pendant que les extrémités bougent ; un ESSAI est UN appui sur le bouton (la position courante,
 *     `L.commit(lab, null)`) — jamais un relâchement ; la même position deux fois n'est pas un nouvel essai. `onVerdict { groups, exact, free? }`
 *     (`logic › verdictOf` : ladder → l'encoche de B′ ; tréteau → la figure 1 / 2 / 3, 0 pour un rapport refusé par le professeur) ; le PREMIER
 *     refus de la manche est `free` (il fait partie de la découverte). La découverte (`logic › playerDiscovery`) est annoncée une fois (`{ tk: 'discovered' }`).
 *   - `ratios` : 'show' (la ligne des deux rapports, comme la page), 'hide' (manche 1 : la question les demande), 'pick' (manches 2+ : les deux
 *     PASTILLES AB′/AB et AC′/AC se choisissent AVANT que le bouton ne montre la bulle — `logic › chipOptions` ; au tréteau, pas de pastille AB′/BB′).
 *   - `chains` : 'ladder' (« lv » à la 1re planche de niveau : les deux rapports d'un toucher ; « rule » à deux planches de rapports différents :
 *     BÂTIR « AB′/AB = AC′/AC » — AB′/AB posé à gauche, AC′, AC et le leurre CC′ ; l'égalité dans l'autre sens est acceptée (`accept`) — puis la
 *     règle), 'ladderEasy' (« lv » seul), 'side' (figures 1 et 2 : ce qu'elles partagent), 'cross' (« beyond » à la 1re planche au-delà de A : ses
 *     rapports, longueurs POSITIVES ; « order » aux figures 1, 2 et 3 : quel point est entre les deux autres sur chaque droite, puis la règle), 'none'.
 *   - `predict` : [{ key, at: [bp, cp] }] (≤ 2) « هل تتوسّط الفقاعة؟ » AVANT le premier geste ; la vérité CALCULÉE (converse) ; jugée par le premier
 *     essai de la même configuration (`logic › classOf`), ou toutes quand la dernière suite de la manche est atteinte — chaque résultat montré et
 *     entendu une fois, la question attend PRED_HOLD_MS.
 *   - `choices` : des paires de barres (manche libre). Le journal « 📋 جدول تجاربك » et le verdict sont dans la colonne (représentation), muets
 *     pendant une question ; commandes figées pendant une prédiction ou une question (`aria-disabled`) ; toujours guidé ; pas de fête ; `LabCoach`
 *     (`logic › coachOf` : la poignée de B′, celle de C′, les pastilles, le bouton — jamais une encoche) ; `{ tk: 'reset' }` à chaque « إعادة ».
 */
/** Lecteur : au plus PRED_MAX prédictions par manche, jamais pendant une suite de questions. */
const PRED_MAX = 2;
/** Le temps pendant lequel un résultat de prédiction reste seul à l'écran avant la question de la manche. */
export const PRED_HOLD_MS = 1600;
const ringCls = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2';
/** « 1/3 » → une vraie fraction (pastilles, questions) ; « −1/4 » garde son signe. */
export const fracNode = (s) => {
  const m = String(s).match(/^(−|-)?(\d+)(?:\/(\d+))?$/);
  if (!m) return s;
  const tex = m[3] ? `\\tfrac{${m[2]}}{${m[3]}}` : m[2];
  return <MathText>{`$${m[1] ? '-' : ''}${tex}$`}</MathText>;
};

export default function ParallelLevel({
  AB = 6, AC = 9, ratio, mode = 'ladder', theme = 'mural', title, lead, mission, level, levels: withLevels = true,
  initialMode = 'student', allowModeSwitch = false, checkpoints: cpOn = true, onTrial, onFinished,
  coach: coachOn = true,
  // ── LECTEUR DE MISSION (rollout 2026-11-10, traitement v2) ──
  onVerdict, chains: chainsMode = 'none', predict: predictList = [], ratios: ratiosMode = 'show', choices,
}) {
  const { t } = useTranslation('lesson');
  const gameScreen = useInMissionPlayer();
  const uid = useId();
  const journalId = `${uid}-journal`;
  const k = useCallback((key, o) => t(`manipulation.parallelLevel.${key}`, o), [t]);
  const initialNumbers = ratio != null ? { AB, AC, ratio, mode } : { AB, AC, mode };
  const state = useManipulation({ type: 'parallel-level', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nums = state.numbers;
  const make = () => L.init({ AB: nums.AB, AC: nums.AC, ratio: nums.ratio, mode: nums.mode });
  const [lab, setLab] = useState(make);
  // Miroir synchrone de `lab` : « ضع الميزان » lit la position que le relâchement (ou ▲ ▼) vient de poser, avant le rendu.
  const labRef = useRef(lab);
  labRef.current = lab;
  const sceneKey = `${nums.AB}|${nums.AC}|${nums.ratio ?? ''}|${nums.mode}|${state.epoch}`;
  const [scene, setScene] = useState({ key: sceneKey, inits: 0 });
  const [doneIds, setDoneIds] = useState([]);   // les étapes dont la suite de questions est finie
  const [tag, setTag] = useState(0);
  // lecteur : la position dont la bulle est MONTRÉE (« ضع الميزان »), les extrémités déjà bougées, les pastilles choisies, les prédictions
  const [revealed, setRevealed] = useState(null);
  const [moved, setMoved] = useState({ B: false, C: false });
  const [picks, setPicks] = useState({ key: null, B: [], C: [] });
  const [preds, setPreds] = useState({});
  const asked = useRef(new Set());
  const [missionBig, setMissionBig] = useState(false);
  const refusedSeen = useRef(0);
  const discoveredSent = useRef(false);
  const heardPred = useRef(new Set());
  const [shownPreds, setShownPreds] = useState([]);
  const [predHold, setPredHold] = useState(false);
  const holdTimer = useRef(null);
  const [pairSaid, setPairSaid] = useState(null);
  if (scene.key !== sceneKey) {
    // « إعادة », un autre niveau ou d'autres barres : TOUT repart — les essais, les étapes, les questions, les prédictions
    setScene({ key: sceneKey, inits: scene.inits + 1 }); setLab(make()); setDoneIds([]);
    setRevealed(null); setMoved({ B: false, C: false }); setPicks({ key: null, B: [], C: [] });
    setPreds({}); asked.current = new Set(); refusedSeen.current = 0; discoveredSent.current = false;
    heardPred.current = new Set(); setShownPreds([]); setPredHold(false);
  }
  // la manche (LabRounds) repart de zéro avec la scène : ses essais et prédictions d'avant ne comptent plus
  useEffect(() => { if (gameScreen && scene.inits > 0) state.report(onTrial, { tk: 'reset' }); }, [scene.inits]); // eslint-disable-line react-hooks/exhaustive-deps
  const crossing = lab.mode === 'crossing';

  const solvedAll = L.discoveryReady(lab);

  /* ── les questions PENDANT le labo (primitives/LabCheckpoint) : après chaque étape (une planche de niveau / les figures 1 et 2, puis le contraste),
     une suite sur les nombres de l'élève ; la seconde finit par la règle et remplace la découverte automatique. L'enseignant seul peut les couper. ── */
  const cpSettings = useLabCheckpointSettings('parallel-level');
  const cpEnabled = cpOn && cpSettings.enabled;
  const steps = ['one', 'two'];
  const stepOk = { one: L.stageOneReached(lab), two: L.stageTwoReached(lab) };
  // ── le lecteur : les suites de la manche (CHAINS_PLAYER), chacune posée quand ce qu'elle interroge est là ──
  const playerChains = gameScreen ? chainsOfPlayer(chainsMode) : [];
  const lastChain = playerChains.at(-1);
  const finalReached = !!lastChain && lastChain.reached(lab);
  const judgedPreds = gameScreen ? L.judgedPredictions(lab, predictList.filter((p) => p.key in preds), finalReached) : [];
  const pendingPreds = judgedPreds.filter((key) => !heardPred.current.has(key));
  const holdChain = pendingPreds.length > 0 || predHold;
  const playerPending = cpEnabled && !holdChain ? playerChains.find((c) => c.reached(lab) && !doneIds.includes(c.id)) ?? null : null;
  const pagePending = !gameScreen && cpEnabled ? steps.find((g) => stepOk[g] && !doneIds.includes(g)) ?? null : null;
  const pending = gameScreen ? playerPending?.id ?? null : pagePending;
  const chain = gameScreen ? playerPending?.qs ?? null : pending ? chainOf(pending, lab.mode) : null;
  const cp = useLabCheckpoint({
    id: chain ? pending : null,
    questions: chain ? chain.map((q) => QUESTIONS[q](lab, pending, k)) : null,
    reached: !!pending,
    resetKey: scene.inits,
    onRetry: () => {
      if (gameScreen) {
        // lecteur : la tâche repart de zéro (toutes les planches) ; la manche oublie ce que le labo vient de défaire, le 1er refus redevient gratuit
        const fresh = make();
        labRef.current = fresh; setLab(fresh); setRevealed(null); setMoved({ B: false, C: false });
        refusedSeen.current = 0; discoveredSent.current = false;
        state.report(onTrial, { tk: 'retry' });
        return;
      }
      celebrated.current.delete(pending); setLab((s) => L.retryStage(s, pending));
    },
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => {
      setDoneIds((d) => (d.includes(id) ? d : [...d, id]));
      const hadRule = gameScreen ? (playerChains.find((c) => c.id === id)?.qs ?? []).includes('rule') : chainOf(id, lab.mode).includes('rule');
      if (hadRule) { state.discover(); state.formalize(); }
    },
  });
  const ready = solvedAll && !cpEnabled && !gameScreen;
  const stepDone = steps.map((g) => !!stepOk[g] && (!cpEnabled || doneIds.includes(g)));
  const stepNow = stepDone[0] ? 1 : 0;
  const showStepper = !gameScreen;
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.trials.length === 0 && celebrated.current.size) celebrated.current = new Set();   // « إعادة » : on refête
  useEffect(() => {
    if (!showStepper) return;   // lecteur : pas de fête quand l'étape est cachée
    stepDone.forEach((d, i) => {
      if (!d || celebrated.current.has(steps[i])) return;
      celebrated.current.add(steps[i]);
      party.celebrate({ n: stepDone.filter(Boolean).length, total: steps.length });
    });
  }, [stepDone.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps
  // le son : un déclic par encoche franchie, le drapeau quand la planche est bonne, « over » quand elle est refusée
  const tick = useTick();
  const nTrials0 = lab.trials.length;
  useEffect(() => {
    const tr = lab.last?.kind === 'commit' ? lab.last.trial : null;
    if (tr && nTrials0 > 0) playSfx(tr.kind === 'level' || tr.kind === 'figure' ? 'flag' : 'over');
  }, [nTrials0]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (ready) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (state.isFormal) state.report(onFinished, { mode: lab.mode, levels: L.levelRatios(lab), figures: L.figuresMade(lab) });
  }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps
  const nTrials = lab.trials.length;
  useEffect(() => { if (nTrials > 0) state.report(onTrial, L.evidenceOf(lab)); }, [nTrials]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── lecteur : la PRÉDICTION, avant le premier geste ── */
  const predQueue = gameScreen ? predictList.slice(0, PRED_MAX) : [];
  const nextPred = predQueue.find((p) => !asked.current.has(p.key)) ?? null;
  const predictOpen = gameScreen && cpEnabled && !cp.open && !missionBig && lab.trials.length === 0 && !moved.B && !moved.C && nextPred != null;
  const locked = gameScreen && (cp.open || predictOpen);
  const lockedRef = useRef(false);
  lockedRef.current = locked;
  const sayPredict = (says) => {
    const p = nextPred;
    const ok = says === L.predictTruth(labRef.current, p.at);
    asked.current.add(p.key);
    playSfx('pop');
    setPreds((m) => ({ ...m, [p.key]: ok }));
    state.report(onTrial, { tk: 'predict', ok });
    if (!predQueue.some((x) => x.key !== p.key && !asked.current.has(x.key))) {
      setTimeout(() => boxRef.current?.querySelector('[data-pl-handle="B"]')?.focus(), 60);
    }
  };
  const pendingSig = pendingPreds.join('|');
  useEffect(() => {
    if (!pendingSig) return;
    const keys = pendingSig.split('|');
    keys.forEach((key) => heardPred.current.add(key));
    setShownPreds(keys.map((key) => ({ key, ok: preds[key] })));
    playSfx(keys.every((key) => preds[key]) ? 'correct' : 'pop');
    setPredHold(true);
    clearTimeout(holdTimer.current);
    holdTimer.current = setTimeout(() => setPredHold(false), PRED_HOLD_MS);
  }, [pendingSig]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => clearTimeout(holdTimer.current), []);
  const quiet = gameScreen && cp.open;
  useEffect(() => { if (cp.open) setShownPreds([]); }, [cp.open]);

  /* ── mesure : largeur de la scène, écran de leçon, ce que le bloc « glance » mesure en plus ── */
  const boxRef = useRef(null);
  const glanceRef = useRef(null);
  const sceneRef = useRef(null);
  const sceneHRef = useRef(240);
  const [width, setWidth] = useState(320);
  const [overhead, setOverhead] = useState(190);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => {
      setWidth(Math.max(150, Math.floor(el.clientWidth)));
      if (glanceRef.current) setOverhead(Math.max(120, Math.ceil(glanceRef.current.getBoundingClientRect().height) - sceneHRef.current));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (glanceRef.current) ro.observe(glanceRef.current);
    return () => ro.disconnect();
  }, []);
  // Dans le lecteur de mission le labo est monté dans une copie cachée puis déplacé : on re-mesure aussi à chaque rendu (même valeur = aucun rendu).
  useLayoutEffect(() => {
    if (!gameScreen) return;
    const el = boxRef.current;
    if (el) { const w = Math.max(150, Math.floor(el.clientWidth)); setWidth((cur) => (cur === w ? cur : w)); }
  });
  const vp = useLessonViewport(true);
  const screenH = vp.ready && vp.height > 0 ? vp.height : 640;
  const narrow = width < 380;
  const sceneW = Math.min(width, 760);
  // lecteur : la scène laisse la place aux manches, aux commandes, aux pastilles et aux figures dans la zone du lecteur (aucun défilement,
  // pas de zoom de repli pour un tréteau haut)
  const area = useMissionArea();
  const playerRoom = gameScreen && area?.height > 0 ? Math.max(200, area.height - 215) : Infinity;
  const sceneH = Math.round(Math.max(150, Math.min(L.naturalHeight(lab, sceneW), screenH - overhead - 28, 560, playerRoom)));
  sceneHRef.current = sceneH;
  const geo = L.geometry(lab, { width: sceneW, height: sceneH, pad: narrow ? 22 : 28 });
  const r = L.reading(lab);
  const posKey = `${r.bp}|${r.cp}`;
  const bubbleShown = !gameScreen || revealed === posKey;

  /* ── les deux gestes : une poignée par extrémité, la barre entière est la piste ── */
  const [live, setLive] = useState({ B: null, C: null });
  const toValueFor = (end) => (cx, cy) => {
    const box = sceneRef.current?.getBoundingClientRect();
    if (!box) return lab[end === 'B' ? 'sB' : 'sC'];
    const range = end === 'B' ? lab.rangeB : lab.rangeC;
    // zoom du lecteur : les pixels de l'écran ramenés aux pixels du calque (rect.width / offsetWidth)
    const z = gameScreen && sceneRef.current?.offsetWidth ? box.width / sceneRef.current.offsetWidth : 1;
    return L.slotFromAbscissa(geo.abscissaAt(end, (cx - box.left) / (z || 1), (cy - box.top) / (z || 1)), range);
  };
  // page : chaque relâchement est un essai (inchangé) ; lecteur : un relâchement DÉPLACE seulement — l'essai est « ضع الميزان »
  const onEndCommit = (end) => (v) => {
    setLive((s) => ({ ...s, [end]: null }));
    if (gameScreen) {
      if (lockedRef.current) return;
      labRef.current = L.move(labRef.current, end, v); setLab(labRef.current);
      setMoved((m) => (m[end] ? m : { ...m, [end]: true }));
      return;
    }
    setLab((s) => L.commit(s, end, v));
  };
  const onEndChange = (end) => (v) => {
    if (lockedRef.current) return;
    setLive((s) => ({ ...s, [end]: v })); tick();
    labRef.current = L.move(labRef.current, end, v); setLab(labRef.current);
  };
  const stB = useStretchInteraction({
    value: lab.sB, range: lab.rangeB, toValue: toValueFor('B'), direction: geo.upward('B') > 0 ? 'ltr' : 'rtl',
    onChange: onEndChange('B'), onCommit: onEndCommit('B'),
  });
  const stC = useStretchInteraction({
    value: lab.sC, range: lab.rangeC, toValue: toValueFor('C'), direction: geo.upward('C') > 0 ? 'ltr' : 'rtl',
    onChange: onEndChange('C'), onCommit: onEndCommit('C'),
  });
  const ST = { B: stB, C: stC };
  const nameOf = { B: "B′", C: "C′" };
  const sideText = (end) => {
    const a = end === 'B' ? r.bp : r.cp;
    return a > 0 ? k(end === 'B' ? 'sideBetweenB' : 'sideBetweenC') : k('sideBeyond');
  };
  const valueText = (end) => {
    const a = end === 'B' ? r.bp : r.cp;
    return k('valueText', { name: nameOf[end], d: Math.abs(a), side: sideText(end) });
  };

  /* ── lecteur : les PASTILLES des deux rapports (manches 2+), choisies avant la bulle ── */
  const picking = gameScreen && ratiosMode === 'pick';
  const chips = picking ? { B: L.chipOptions(lab, 'B'), C: L.chipOptions(lab, 'C') } : null;
  const pickNow = picks.key === posKey ? picks : { key: posKey, B: [], C: [] };
  const pickedRight = (end) => !!chips && pickNow[end].some((i) => chips[end][i]?.right);
  const picksDone = !picking || (pickedRight('B') && pickedRight('C'));
  const pick = (end, i) => {
    if (lockedRef.current || pickedRight(end)) return;
    const o = chips[end][i];
    playSfx(o.right ? 'correct' : 'wrong');
    setPicks((p) => {
      const cur = p.key === posKey ? p : { key: posKey, B: [], C: [] };
      return cur[end].includes(i) ? cur : { ...cur, [end]: [...cur[end], i] };
    });
  };

  /* ── lecteur : « ضع الميزان » — UN essai ── */
  const pressedHere = revealed === posKey;
  // une position DÉJÀ essayée se remontre sans repasser par les pastilles (ses rapports ont été choisis la première fois)
  const triedHere = lab.trials.some((x) => `${x.bp}|${x.cp}` === posKey);
  const canPress = gameScreen && !locked && !pressedHere && (picksDone || triedHere);
  const press = () => {
    if (!gameScreen || lockedRef.current) return;
    stB.flush(); stC.flush();
    const prev = labRef.current;
    const at = L.positions(prev);
    const key = `${at.bp}|${at.cp}`;
    // la même position qu'un essai DÉJÀ fait (même revenue après un détour) n'est pas un nouvel essai : la bulle se montre, rien n'est compté
    const existing = prev.trials.find((x) => x.bp === at.bp && x.cp === at.cp);
    if (revealed === key || (picking && !existing && !(picks.key === key && pickedRight('B') && pickedRight('C')))) return;
    const next = existing ? Object.freeze({ ...prev, last: { kind: 'commit', trial: existing } }) : L.commit(prev, 'B', null);
    labRef.current = next;
    setLab(next);
    setRevealed(key);
    if (!existing) {
      const v = L.verdictOf(next, next.trials.at(-1));
      const free = !v.exact && refusedSeen.current === 0;
      if (!v.exact) refusedSeen.current += 1;
      state.report(onVerdict, { ...v, ...(free ? { free: true } : {}) });
    } else {
      playSfx(next.trials.at(-1)?.parallel ? 'flag' : 'over');
    }
    if (L.playerDiscovery(next) && !discoveredSent.current) { discoveredSent.current = true; state.report(onTrial, { tk: 'discovered' }); }
  };

  /* ── le verdict de la dernière position validée ── */
  // lecteur : le verdict est celui de l'essai DÉVOILÉ à la position courante — revenir sur la position pressée (▲ puis ▼) rend la bulle ET son
  // verdict (revue 2026-11-10 : `lab.last` valait alors « move » et la colonne restait sur « اضغط ») ; la page garde le dernier essai
  const last = gameScreen
    ? (bubbleShown ? lab.trials.find((x) => `${x.bp}|${x.cp}` === revealed) ?? null : null)
    : lab.last?.kind === 'commit' ? lab.last.trial : null;
  const freeCross = crossing && !lab.target;
  // lecteur : des verdicts COURTS, une formule au plus par phrase (la colonne est étroite) ; la page garde les siens
  const verdictKey = (kind) => (!gameScreen ? `v_${kind}` : freeCross && (kind === 'figure' || kind === 'order') ? `vp_${kind}Free` : `vp_${kind}`);
  // juste = planche de niveau ET (rapport imposé) condition respectée
  const lastOk = Boolean(last?.parallel && last.kind !== 'condition');
  const verdict = last && (() => {
    const o = { b: tf(L.ratioTex(last.bp, lab.b)), c: tf(L.ratioTex(last.cp, lab.c)), n: last.figure === '3m' ? '3' : last.figure, target: lab.target ? tf(LIN.fracLatex(lab.target)) : '' };
    return <MathText>{k(verdictKey(last.kind), o)}</MathText>;
  })();

  /* ── la découverte : des distracteurs réfutés par les positions de l'élève ── */
  // la page seule montre la découverte : le lecteur ne la recalcule pas à chaque mouvement
  const discoveryOptions = useMemo(() => (gameScreen ? null : discoveryOptionsOf(lab, k)), [gameScreen, lab, k]);

  const formal = formalOf(lab, k);

  const missionText = mission ?? <MathText>{k(crossing ? 'missionCrossing' : 'missionLadder', { target: lab.target ? LIN.fracLatex(lab.target) : '' })}</MathText>;
  const [rB, rC] = L.ratiosLine(lab);
  const made = L.figuresMade(lab);

  /* ── lecteur : le guide (LabCoach) — jamais une encoche, jamais la réponse ── */
  const coachRaw = gameScreen && coachOn && !locked && !cp.open
    ? L.coachOf(lab, { moved, pressedHere, picking, picksDone, ratiosShown: ratiosMode !== 'hide', done: playerChains.length ? doneIds.includes(lastChain?.id) : L.playerDiscovery(lab) })
    : null;
  // un objet STABLE par étape (son id fixe la cible et le geste) : LabCoach ne se réabonne pas à chaque mouvement de la poignée
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const coachStep = useMemo(() => coachRaw, [coachRaw?.id]);
  const coach = useLabCoach({
    lab: 'parallel-level', step: coachStep, text: coachStep ? k(`coach.${coachStep.id}`) : '',
    labels: { hide: t('manipulation.common.coach.hide'), show: t('manipulation.common.coach.show'), ok: t('manipulation.common.coach.ok'), stop: t('manipulation.common.coach.stop') },
  });

  /* ── les poignées : sur la barre, la barre est la piste ── */
  const track = (end) => {
    const foot = end === 'B' ? geo.B : geo.C;
    const top = crossing ? (end === 'B' ? geo.topB : geo.topC) : geo.A;
    const len = Math.hypot(top[0] - foot[0], top[1] - foot[1]);
    const ang = (Math.atan2(top[1] - foot[1], top[0] - foot[0]) * 180) / Math.PI;
    const P = end === 'B' ? geo.Bp : geo.Cp;
    const d = Math.hypot(P[0] - foot[0], P[1] - foot[1]);
    const st = ST[end];
    return (
      <div key={end} {...st.trackProps} data-pl-track={end}
        className="absolute"
        style={{ ...st.trackProps.style, left: foot[0], top: foot[1] - 22, width: len, height: 44, transform: `rotate(${ang}deg)`, transformOrigin: '0 50%', ...(locked ? { pointerEvents: 'none' } : {}) }}>
        <div {...st.handleProps({ label: k('handle', { name: nameOf[end], bar: end === 'B' ? '(d)' : "(d′)" }), valueText: valueText(end) })}
          data-pl-handle={end} data-slot={end === 'B' ? lab.sB : lab.sC} aria-disabled={locked || undefined}
          className={`absolute flex h-11 w-11 items-center justify-center rounded-full border-[3px] bg-white/95 shadow outline-none focus-visible:ring-4 ${gameScreen ? 'focus-visible:ring-indigo-600 focus-visible:ring-offset-2' : 'focus-visible:ring-indigo-400'} ${live[end] != null ? 'border-indigo-600' : 'border-indigo-500'}`}
          style={{ left: d - 22, top: 0, cursor: st.dragging ? 'grabbing' : 'grab' }}>
          <span dir="ltr" className="font-mono text-sm font-extrabold text-indigo-900" style={{ transform: `rotate(${-ang}deg)` }}>{nameOf[end]}</span>
        </div>
      </div>
    );
  };

  const arrows = (end) => (
    <div className="flex items-center gap-1" dir="ltr">
      <span className="font-mono text-sm font-extrabold text-indigo-900">{nameOf[end]}</span>
      <button type="button" onClick={() => ST[end].nudge(1)} aria-label={k('up', { name: nameOf[end] })} data-pl-up={end}
        disabled={locked || (end === 'B' ? lab.sB : lab.sC) >= (end === 'B' ? lab.rangeB : lab.rangeC).max}
        className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-indigo-300 bg-white disabled:opacity-40 ${gameScreen ? ringCls : 'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'}`}><ChevronUp className="h-5 w-5" aria-hidden="true" /></button>
      <button type="button" onClick={() => ST[end].nudge(-1)} aria-label={k('down', { name: nameOf[end] })} data-pl-down={end}
        disabled={locked || (end === 'B' ? lab.sB : lab.sC) <= (end === 'B' ? lab.rangeB : lab.rangeC).min}
        className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-indigo-300 bg-white disabled:opacity-40 ${gameScreen ? ringCls : 'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'}`}><ChevronDown className="h-5 w-5" aria-hidden="true" /></button>
    </div>
  );

  // lecteur : la prédiction ou la question PREND la colonne du labo
  const predPrompt = (p) => k('predict.prompt', {
    db: Math.abs(p.at[0]), dc: Math.abs(p.at[1]),
    sideB: p.at[0] > 0 ? k('sideBetweenB') : k('sideBeyond'), sideC: p.at[1] > 0 ? k('sideBetweenC') : k('sideBeyond'),
  });
  const trayNode = !gameScreen ? null : predictOpen ? (
    <PredictTray attr="pl" key={nextPred.key} step={predQueue.indexOf(nextPred) + 1} of={predQueue.length}
      title={t('manipulation.common.cp.predict.title')}
      prompt={predPrompt(nextPred)}
      options={[{ says: 'yes', text: k('predict.yes') }, { says: 'no', text: k('predict.no') }]}
      onSay={sayPredict} />
  ) : cp.open ? cp.node : null;

  // le JOURNAL du lecteur : les dernières positions essayées (B′ · C′ · les deux rapports · ✓ / ✗) — en manche 1 les rapports n'y viennent
  // qu'après la question qui les demande
  const journal = lab.trials.slice(-4);
  const journalRatios = ratiosMode !== 'hide' || doneIds.includes('lv');
  const sideGlyph = (a) => (a > 0 ? null : <><span aria-hidden="true">↑</span><span className="sr-only"> {k('sideBeyond')}</span></>);
  /* ── les rapports (page : la ligne ; lecteur : la ligne ou les PASTILLES), le côté de A et les figures — sous la scène sur la page, dans la
     colonne du lecteur ── */
  const ratioBlock = (
    <>
            {picking ? (
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2" dir="ltr" data-pl-picks data-pl-ratios>
                {['B', 'C'].map((end) => (
                  <div key={end} role="group" aria-label={k(end === 'B' ? 'pickB' : 'pickC')} className="flex items-center gap-1.5" data-pl-pick={end}
                    data-picked={pickedRight(end) ? 'right' : pickNow[end].length ? 'wrong' : 'none'}>
                    <span className="text-base font-bold text-slate-800" aria-hidden="true"><MathText>{end === 'B' ? "$\\dfrac{AB'}{AB} =$" : "$\\dfrac{AC'}{AC} =$"}</MathText></span>
                    {chips[end].map((o, i) => {
                      const chosen = pickNow[end].includes(i);
                      const st = chosen ? (o.right ? 'right' : 'wrong') : 'idle';
                      return (
                        <button key={i} type="button" onClick={() => pick(end, i)} disabled={locked || pickedRight(end) || st === 'wrong'} aria-pressed={chosen}
                          data-pl-chip={`${end}:${i}`} data-state={st}
                          className={`relative inline-flex h-12 min-w-[3.25rem] items-center justify-center rounded-xl border-2 px-2 text-lg font-black ${ringCls} ${st === 'right' ? 'border-emerald-700 bg-emerald-700 text-white' : st === 'wrong' ? 'border-rose-200 bg-rose-50 text-rose-800 line-through opacity-80' : 'border-indigo-200 bg-white text-indigo-950'}`}>
                          <span className="pointer-events-none">{fracNode(o.text)}</span>
                          {st !== 'idle' && <span className="sr-only">{k(st === 'right' ? 'cueRight' : 'cueWrong')}</span>}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            ) : (!gameScreen || ratiosMode === 'show') && (
              <div className={`flex flex-wrap items-center justify-center gap-x-3 gap-y-1 ${narrow ? 'text-xs' : 'text-sm'} font-bold text-slate-800`} data-pl-ratios>
                <MathText>{rB}</MathText><span aria-hidden="true">،</span><MathText>{rC}</MathText>
              </div>
            )}
            {picking && (
              <p role="status" className="min-h-[1.25rem] text-center text-xs font-bold text-rose-800" data-pl-pick-why>
                {['B', 'C'].map((end) => {
                  const wrong = pickNow[end].filter((i) => !chips[end][i].right);
                  if (!wrong.length || pickedRight(end)) return null;
                  return <span key={end} className="mx-1">{k(`pickWhy.${chips[end][wrong.at(-1)].why}`)}</span>;
                })}
              </p>
            )}
    </>
  );
  const sideBlock = (
    <>
            {crossing && (
              <p className="text-center text-xs font-semibold text-slate-600" data-pl-side={r.sameOrder ? 'same' : 'opposite'}>
                <bdi dir="ltr" className="font-mono">B′</bdi> {sideText('B')} ، <bdi dir="ltr" className="font-mono">C′</bdi> {sideText('C')}
              </p>
            )}
            {crossing && (
              <ul className="flex flex-wrap justify-center gap-1.5" data-pl-figures={made.length}>
                {['1', '2', '3'].map((f) => {
                  const tr = f === '3' ? (L.figureTrial(lab, '3') ?? L.figureTrial(lab, '3m')) : L.figureTrial(lab, f);
                  return (
                    <li key={f} data-pl-figure={f} data-made={tr ? 'true' : 'false'} data-ok={tr ? String(tr.parallel) : undefined}
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${!tr ? 'border-slate-200 bg-slate-50 text-slate-500' : tr.parallel ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-rose-300 bg-rose-50 text-rose-800'}`}>
                      {k('figureChip', { n: f })} {!gameScreen ? (tr ? (tr.parallel ? '✓' : '✗') : '…') : (
                        <><span aria-hidden="true">{tr ? (tr.parallel ? '✓' : '✗') : '…'}</span>{tr && <span className="sr-only">{k(tr.parallel ? 'rowLevel' : 'rowTilted')}</span>}</>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
    </>
  );
  const playerRepresentation = gameScreen && !quiet && (
    <div className="space-y-2" data-pl-player-col>
      {ratioBlock}
      {sideBlock}
      {/* le texte VISIBLE du verdict ; l'annonce passe par la région vivante toujours montée de la scène (`data-pl-verdict-live`) */}
      <div data-pl-verdict-box>
        {last && bubbleShown ? (
          <p key={`v${lab.trials.length}:${revealed}`} className={`rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-sm font-bold leading-snug ${TONE[last.kind]}`} data-pl-verdict={last.kind}>
            <span aria-hidden="true">{lastOk ? '✓ ' : '✗ '}</span>
            {verdict}
          </p>
        ) : (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white/70 px-3 py-2 text-center text-sm font-bold text-slate-600" data-pl-verdict="">{k(picking && !picksDone ? 'waitingPick' : 'waitingPress')}</p>
        )}
        {shownPreds.map((pr) => (
          <p key={pr.key} data-pl-predict-result={pr.ok ? 'ok' : 'wrong'} data-pl-predict-key={pr.key}
            className={`mt-2 rounded-2xl px-4 py-2 text-center text-lg font-black ${pr.ok ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
            {pr.ok ? t('manipulation.common.cp.predict.right') : k('predict.wrong')}
          </p>
        ))}
      </div>
      {/* la règle trouvée (la découverte en clair) prend la place du journal : la colonne ne déborde pas */}
      {journal.length > 0 && !state.isFormal && (
        <div data-pl-journal>
          <p id={journalId} className="text-sm font-black text-indigo-900"><span aria-hidden="true">📋 </span>{k('journal')}</p>
          <table className="mt-1 w-full table-fixed text-center text-xs" dir="ltr" aria-labelledby={journalId}>
            <thead>
              <tr className="bg-slate-50">
                <th scope="col" className="font-mono">B′</th><th scope="col" className="font-mono">C′</th>
                {journalRatios && <th scope="col"><MathText>{"$\\tfrac{AB'}{AB}$"}</MathText></th>}
                {journalRatios && <th scope="col"><MathText>{"$\\tfrac{AC'}{AC}$"}</MathText></th>}
                <th scope="col"><span aria-hidden="true">⚖️</span><span className="sr-only">{k('colBubble')}</span></th>
              </tr>
            </thead>
            <tbody>
              {journal.map((x, i) => {
                const ok = x.parallel && x.kind !== 'condition';
                return (
                  <tr key={`${x.bp}|${x.cp}|${i}`} data-pl-row={x.kind}>
                    <td className="border border-slate-200 font-mono"><bdi dir="ltr">{Math.abs(x.bp)}{sideGlyph(x.bp)}</bdi></td>
                    <td className="border border-slate-200 font-mono"><bdi dir="ltr">{Math.abs(x.cp)}{sideGlyph(x.cp)}</bdi></td>
                    {journalRatios && <td className="border border-slate-200">{fracNode(LIN.fracText(x.ratioB))}</td>}
                    {journalRatios && <td className="border border-slate-200">{fracNode(LIN.fracText(x.ratioC))}</td>}
                    <td className={`border border-slate-200 font-black ${ok ? 'text-emerald-800' : 'text-rose-800'}`}>
                      <span aria-hidden="true">{ok ? '✓' : '✗'}</span><span className="sr-only">{k(ok ? 'rowLevel' : x.kind === 'condition' ? 'rowCondition' : 'rowTilted')}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {crossing && <p className="mt-1 text-xs text-slate-600">{k('journalBeyond')}</p>}
        </div>
      )}
    </div>
  );

  return (
    <ManipulationShell
      type="parallel-level"
      title={title ?? k('title')}
      mission={missionText}
      lead={lead}
      state={state}
      coach={gameScreen && coachOn ? coach : null}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      headerAction={cpOn ? cpSettings.control : null}
      // lecteur : l'écran de jeu est toujours GUIDÉ (les manches et les questions guident)
      guided={cpEnabled || gameScreen}
      hideRepresentation={(gameScreen && locked) || undefined}
      onIntroChange={gameScreen ? setMissionBig : undefined}
      sidePanel={trayNode ? <div data-pl-tray>{trayNode}</div> : null}
      representation={gameScreen ? playerRepresentation : undefined}
      hints={(crossing ? ['hintC1', 'hintC2', 'hintC3'] : ['hintL1', 'hintL2', 'hintL3']).map((h) => <MathText key={h}>{k(h, { target: lab.target ? LIN.fracLatex(lab.target) : '' })}</MathText>)}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      // lecteur : la règle est la DERNIÈRE question de la manche (son explication est la forme formelle) — pas de panneau de découverte en plus
      // dans la colonne (il la faisait déborder)
      discovery={gameScreen ? null : (
        <ManipulationDiscovery state={state} prompt={<MathText>{k(crossing ? 'dPromptCross' : 'dPromptLadder')}</MathText>} options={discoveryOptions} formal={formal} />
      )}
      explanation={<MathText>{k(crossing ? 'explanationCross' : 'explanationLadder')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-amber-50/60 to-white" minHeight="min-h-[160px]">
        <div ref={boxRef} className="space-y-2" data-parallel-level data-mode={lab.mode} data-world={theme}
          data-solved={solvedAll ? 'true' : 'false'} data-bp={r.bp} data-cp={r.cp} data-scene-h={sceneH}
          data-revealed={gameScreen ? (bubbleShown ? 'true' : 'false') : undefined}>
          <div className="relative space-y-2">
          {party.node}
          {/* lecteur : la région vivante TOUJOURS montée (revue a11y 2026-11-10) — la colonne se démonte quand une question s'ouvre, l'annonce du
              verdict ne doit pas partir avec elle ; une clé par essai */}
          {gameScreen && (
            <div role="status" aria-live="polite" className="sr-only" data-pl-verdict-live>
              {last && bubbleShown && <span key={`v${lab.trials.length}:${revealed}`}>{k(lastOk ? 'cueRight' : 'cueWrong')} {verdict}</span>}
              {shownPreds.map((pr) => <span key={pr.key}> {pr.ok ? t('manipulation.common.cp.predict.right') : k('predict.wrong')}</span>)}
              {pairSaid && <span key={pairSaid}> {k('pairNow', { b: pairSaid.split('|')[0], c: pairSaid.split('|')[1] })}</span>}
            </div>
          )}
          {!(gameScreen && cp.open) && cp.node}
          <div ref={glanceRef} className="space-y-2" data-pl-glance>
            {showStepper && <LabStepper count={steps.length} current={stepNow} done={stepDone} stepAttr="data-pl-step" />}
            {gameScreen && choices?.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-1.5" role="group" aria-labelledby={`${uid}-choices`} data-pl-choices>
                <span id={`${uid}-choices`} className="text-sm font-bold text-slate-600">{k('choicesLabel')}</span>
                {choices.map(([b, c]) => {
                  const on = b === nums.AB && c === nums.AC;
                  return (
                    <button key={`${b}-${c}`} type="button" data-pl-choice={`${b}-${c}`} disabled={locked} aria-pressed={on}
                      onClick={() => { if (!lockedRef.current) { state.setNumbers({ ...state.numbers, AB: b, AC: c }); setPairSaid(`${b}|${c}`); } }}
                      className={`min-h-[44px] rounded-xl border-2 px-3 text-sm font-black ${ringCls} ${on ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'border-slate-300 bg-white text-slate-700'}`}>
                      <bdi dir="ltr">{`${b} · ${c}`}</bdi><span className="sr-only"> {k('choiceAria', { b, c })}</span>
                    </button>
                  );
                })}
              </div>
            )}
            <div ref={sceneRef} className="relative mx-auto" style={{ width: sceneW, height: sceneH }} data-pl-scene>
              <Scene geo={geo} lab={lab} crossing={crossing} tag={tag} hidden={!bubbleShown} />
              {track('B')}
              {track('C')}
            </div>
            {/* lecteur : les commandes dans l'ordre du dessin (B à gauche, C à droite) — dir="ltr" (la page garde le sien) */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5" data-pl-controls dir={gameScreen ? 'ltr' : undefined}>
              {arrows('B')}
              {arrows('C')}
              {gameScreen && (
                <button type="button" onClick={press} aria-disabled={!canPress || undefined} data-pl-press
                  // aria-disabled, pas disabled : le focus clavier reste sur le bouton après l'appui (`press` se garde lui-même)
                  className={`inline-flex min-h-[48px] items-center gap-2 rounded-2xl border-2 px-5 text-base font-black shadow-[0_3px_0_0_#065F46] ${canPress ? 'border-emerald-700 bg-emerald-700 text-white' : 'border-slate-300 bg-slate-200 text-slate-600 shadow-none'} ${ringCls}`}>
                  <span aria-hidden="true">⚖️</span> {k('press')}
                </button>
              )}
              <Deco onSpray={() => setTag((n) => n + 1)} />
            </div>
            {/* lecteur : les rapports (ou les pastilles), le côté de A et les figures sont dans la COLONNE (la scène garde la hauteur) */}
            {!gameScreen && <>{ratioBlock}{sideBlock}</>}
            {!gameScreen && (
              <p role="status" className={`min-h-[2.5rem] text-center ${narrow ? 'text-xs' : 'text-sm'} font-bold leading-snug ${last ? TONE[last.kind] : 'text-slate-500'}`}
                data-pl-verdict={last?.kind ?? ''}>
                {verdict ?? k('waiting')}
              </p>
            )}
          </div>
          </div>

          {!gameScreen && lab.trials.length > 0 && (
            <LabFold id="parallel-level.trials" title={k('trialsTitle')}>
              <ul className="space-y-0.5 text-xs" data-pl-trials={lab.trials.length}>
                {lab.trials.map((x, i) => (
                  <li key={i} className={TONE[x.kind]} data-kind={x.kind}>
                    <MathText>{k('trialRow', { b: tf(L.ratioTex(x.bp, lab.b)), c: tf(L.ratioTex(x.cp, lab.c)), verdict: k(`t_${x.kind}`, { n: x.figure === '3m' ? '3' : x.figure }) })}</MathText>
                  </li>
                ))}
              </ul>
            </LabFold>
          )}
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ── la scène : le mur, le sol, les barres graduées, la planche et son niveau ── */
const TAG_COLORS = ['#EC4899', '#8B5CF6', '#06B6D4', '#F59E0B'];

/** `hidden` (lecteur, « ضع الميزان ») : la bulle est cachée — le tube montre « ? » et la planche une couleur neutre, jusqu'à l'appui. */
function Scene({ geo, lab, crossing, tag, hidden = false }) {
  const { A, B, C, topB, topC, Bp, Cp, deg, bubble, parallel, width, height } = geo;
  const reduce = useReducedMotion();
  const textProps = { direction: 'ltr', unicodeBidi: 'isolate' };
  const barTop = { B: crossing ? topB : A, C: crossing ? topC : A };
  const ground = Math.max(B[1], C[1]);
  const mid = [(Bp[0] + Cp[0]) / 2, (Bp[1] + Cp[1]) / 2];
  const vialW = Math.min(70, Math.max(46, Math.hypot(Cp[0] - Bp[0], Cp[1] - Bp[1]) * 0.6));
  const ext = 10;
  const ux = Math.cos((deg * Math.PI) / 180); const uy = Math.sin((deg * Math.PI) / 180);
  const left = Bp[0] <= Cp[0] ? Bp : Cp; const right = Bp[0] <= Cp[0] ? Cp : Bp;
  const color = TAG_COLORS[tag % TAG_COLORS.length];
  // une étiquette (ancrée au début, LTR) reste entière dans la scène : `w` est sa largeur approchée
  const clampX = (x, w) => Math.max(2, Math.min(width - w - 2, x));
  const bar = (end) => {
    const foot = end === 'B' ? B : C; const top = barTop[end];
    const notches = end === 'B' ? geo.notchesB : geo.notchesC;
    const dx = top[0] - foot[0]; const dy = top[1] - foot[1]; const l = Math.hypot(dx, dy) || 1;
    const n = [-dy / l, dx / l];
    return (
      <g key={end}>
        {crossing ? (
          <line x1={foot[0]} y1={foot[1]} x2={top[0]} y2={top[1]} stroke="#92400E" strokeWidth={11} strokeLinecap="round" />
        ) : (
          <>
            <line x1={foot[0] + n[0] * 6} y1={foot[1] + n[1] * 6} x2={top[0] + n[0] * 6} y2={top[1] + n[1] * 6} stroke="#64748B" strokeWidth={3.5} strokeLinecap="round" />
            <line x1={foot[0] - n[0] * 6} y1={foot[1] - n[1] * 6} x2={top[0] - n[0] * 6} y2={top[1] - n[1] * 6} stroke="#64748B" strokeWidth={3.5} strokeLinecap="round" />
          </>
        )}
        {notches.map((p) => (crossing ? (
          <circle key={p.slot} cx={p.xy[0]} cy={p.xy[1]} r={2.6} fill="#FEF3C7" stroke="#78350F" strokeWidth={0.8} data-notch={p.a} data-bar={end} />
        ) : (
          <line key={p.slot} x1={p.xy[0] + n[0] * 6} y1={p.xy[1] + n[1] * 6} x2={p.xy[0] - n[0] * 6} y2={p.xy[1] - n[1] * 6} stroke="#475569" strokeWidth={2.4} data-notch={p.a} data-bar={end} />
        )))}
      </g>
    );
  };
  return (
    <svg width={width} height={height} className="absolute inset-0" aria-hidden="true" focusable="false" style={{ direction: 'ltr' }}>
      {/* le mur du quartier (décor) */}
      <g data-deco="wall">
        <rect x={0} y={0} width={width} height={ground} fill="#FFF7ED" />
        {Array.from({ length: Math.ceil(ground / 18) }, (_, i) => (
          <line key={i} x1={0} x2={width} y1={i * 18} y2={i * 18} stroke="#FED7AA" strokeWidth={1} />
        ))}
        <path d={`M${width * 0.62} ${ground * 0.18} q ${width * 0.08} ${-ground * 0.1} ${width * 0.16} 0 t ${width * 0.14} ${ground * 0.06}`} fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" opacity={0.35} />
        <circle cx={width * 0.1} cy={ground * 0.2} r={Math.min(22, ground * 0.12)} fill={TAG_COLORS[(tag + 1) % 4]} opacity={0.25} />
        <path d={`M${width * 0.05} ${ground * 0.62} l ${width * 0.06} ${-ground * 0.12} l ${width * 0.05} ${ground * 0.1}`} fill="none" stroke={TAG_COLORS[(tag + 2) % 4]} strokeWidth={6} strokeLinecap="round" opacity={0.3} />
      </g>
      {/* le sol (BC) */}
      <rect x={0} y={ground} width={width} height={height - ground} fill="#E7E5E4" />
      <line x1={0} x2={width} y1={ground} y2={ground} stroke="#57534E" strokeWidth={2.5} />
      {bar('B')}
      {bar('C')}
      {/* la planche (B′C′) et son niveau à bulle */}
      <line x1={left[0] - ux * ext} y1={left[1] - uy * ext} x2={right[0] + ux * ext} y2={right[1] + uy * ext}
        stroke={hidden ? '#A16207' : parallel ? '#B45309' : '#C2410C'} strokeWidth={8} strokeLinecap="round" data-pl-plank data-parallel={parallel ? 'true' : 'false'} />
      <g transform={`translate(${mid[0]} ${mid[1] - 11}) rotate(${deg})`} data-pl-bubble data-offset={hidden ? '' : bubble.toFixed(2)}>
        <rect x={-vialW / 2 - 4} y={-8} width={vialW + 8} height={16} rx={4} fill="#1E293B" />
        <rect x={-vialW / 2} y={-5} width={vialW} height={10} rx={5} fill={hidden ? '#CBD5E1' : parallel ? '#BBF7D0' : '#FEF08A'} />
        <line x1={-7} x2={-7} y1={-5} y2={5} stroke="#334155" strokeWidth={1.2} />
        <line x1={7} x2={7} y1={-5} y2={5} stroke="#334155" strokeWidth={1.2} />
        {hidden ? (
          <text x={0} y={4} textAnchor="middle" fontSize={11} fontWeight={900} fill="#334155" style={{ direction: 'ltr' }} data-pl-bubble-hidden>?</text>
        ) : (
          <ellipse cx={bubble * (vialW / 2 - 7)} cy={0} rx={6} ry={3.6} fill="#FFFFFF" stroke="#64748B" strokeWidth={0.8}
            style={{ transition: reduce ? 'none' : 'cx 220ms ease-out' }} />
        )}
      </g>
      {/* les points nommés (texte LTR) */}
      <circle cx={A[0]} cy={A[1]} r={4} fill="#0F172A" />
      <text x={A[0] + (crossing ? 12 : 0)} y={A[1] - 9} textAnchor="middle" fontSize={15} fontWeight={800} fill="#0F172A" style={textProps}>A</text>
      <circle cx={B[0]} cy={B[1]} r={4} fill="#0F172A" />
      <text x={B[0] - 4} y={B[1] + 17} textAnchor="middle" fontSize={15} fontWeight={800} fill="#0F172A" style={textProps}>B</text>
      <circle cx={C[0]} cy={C[1]} r={4} fill="#0F172A" />
      <text x={C[0] + 4} y={C[1] + 17} textAnchor="middle" fontSize={15} fontWeight={800} fill="#0F172A" style={textProps}>C</text>
      {crossing && <text x={clampX(topB[0] + 10, 26)} y={topB[1] + 4} fontSize={13} fontWeight={700} fill="#78350F" style={textProps}>(d)</text>}
      {crossing && <text x={clampX(topC[0] - 30, 30)} y={topC[1] + 4} fontSize={13} fontWeight={700} fill="#78350F" style={textProps}>(d′)</text>}
      <text x={clampX((A[0] + B[0]) / 2 - 62, 50)} y={(A[1] + B[1]) / 2} fontSize={12} fontWeight={700} fill="#475569" style={textProps}>{`AB = ${lab.b}`}</text>
      <text x={clampX((A[0] + C[0]) / 2 + 16, 52)} y={(A[1] + C[1]) / 2 + (crossing ? 0 : -6)} fontSize={12} fontWeight={700} fill="#475569" style={textProps}>{`AC = ${lab.c}`}</text>
    </svg>
  );
}

/** La bombe de peinture du graffeur : touchée, elle change la couleur du tag du mur. Décor seulement. */
function Deco({ onSpray }) {
  const reduce = useReducedMotion();
  const [puffs, setPuffs] = useState(0);
  return (
    <button type="button" tabIndex={-1} aria-hidden="true" data-deco="spray"
      onClick={() => { setPuffs((n) => n + 1); onSpray(); }}
      className="h-11 w-10 shrink-0 rounded-xl focus:outline-none">
      <svg viewBox="0 0 40 50" width="100%" height="100%">
        <style>{'.pl-p{transform-origin:28px 10px;animation:pl-p .5s ease-out 1}@keyframes pl-p{0%{opacity:.9;transform:scale(.4)}100%{opacity:0;transform:scale(1.4)}}@media (prefers-reduced-motion: reduce){.pl-p{animation:none;opacity:0}}'}</style>
        <rect x="8" y="16" width="16" height="30" rx="4" fill="#7C3AED" />
        <rect x="11" y="10" width="10" height="7" rx="2" fill="#334155" />
        <rect x="8" y="24" width="16" height="5" fill="#FDE68A" />
        {puffs > 0 && !reduce && <circle key={puffs} className="pl-p" cx="30" cy="9" r="7" fill="#EC4899" />}
      </svg>
    </button>
  );
}

/* ── la découverte et la règle : les mêmes pour la fin du labo et pour la dernière question ── */
export function discoveryOptionsOf(lab, k) {
  const crossing = lab.mode === 'crossing';
    if (!crossing) {
      const lv = lab.trials.filter((x) => x.kind === 'level');
      const a = lv[0] ?? { bp: 2, cp: 3 };
      const off = lv.find((x) => !LIN.eq(x.ratioB, LIN.frac(1, 2))) ?? a;
      return [
        { text: <MathText>{k('dLadderEqual')}</MathText>, why: <MathText>{k('dLadderEqualWhy', { bp: a.bp, cp: a.cp })}</MathText> },
        { text: <MathText>{k('dLadderRatio')}</MathText>, correct: true },
        { text: <MathText>{k('dLadderMiddle')}</MathText>, why: <MathText>{k('dLadderMiddleWhy', { bp: off.bp, b: lab.b })}</MathText> },
        { text: <MathText>{k('dLadderFeet')}</MathText>, why: <MathText>{k('dLadderFeetWhy', { db: lab.b - a.bp, dc: lab.c - a.cp })}</MathText> },
      ];
    }
    const f3 = L.figureTrial(lab, '3') ?? L.figureTrial(lab, '3m');
    return [
      { text: <MathText>{k('dCrossRatioOnly')}</MathText>, why: <MathText>{k('dCrossRatioOnlyWhy', { bp: f3?.bp ?? 0, cp: f3?.cp ?? 0 })}</MathText> },
      { text: <MathText>{k('dCrossBetween')}</MathText>, why: <MathText>{k('dCrossBetweenWhy')}</MathText> },
      { text: <MathText>{k('dCrossRight')}</MathText>, correct: true },
    ];
}

export function formalOf(lab, k) {
  const crossing = lab.mode === 'crossing';
  return crossing ? (
    <div className="space-y-2" data-pl-formal>
      <p className="text-sm font-bold text-emerald-900"><MathText>{k('fCross')}</MathText></p>
      <ul className="space-y-1 text-sm">
        {['2', '1', '3', '3m'].map((f) => {
          const tr = L.figureTrial(lab, f);
          return tr ? <li key={f} className={tr.parallel ? 'text-emerald-800' : 'text-rose-800'}><MathText>{k(tr.parallel ? 'fFigureOk' : 'fFigureKo', { n: f === '3m' ? '3' : f, bp: tr.bp, cp: tr.cp })}</MathText></li> : null;
        })}
      </ul>
      <p className="text-sm text-emerald-900"><MathText>{k('fContra')}</MathText></p>
    </div>
  ) : (
    <div className="space-y-2" data-pl-formal>
      <EquationDisplay tone="result" tex={"\\dfrac{AB'}{AB} = \\dfrac{AC'}{AC} \\;\\Rightarrow\\; (B'C') \\parallel (BC)"} />
      <ul className="space-y-1 text-sm text-emerald-900">
        {lab.trials.filter((x) => x.kind === 'level').filter((x, i, arr) => arr.findIndex((y) => y.bp === x.bp) === i).map((x) => (
          <li key={x.bp}><MathText>{`$${L.ratioTex(x.bp, lab.b)}$ ${k('and')} $${L.ratioTex(x.cp, lab.c)}$`}</MathText></li>
        ))}
      </ul>
      <p className="text-sm text-emerald-900"><MathText>{k('fLadder')}</MathText></p>
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite de chaque étape. ladder : le rapport d'une planche de niveau, le même pour C′ ; puis la planche penchée et la règle.
 *  crossing : où poser B′ et C′ pour 1/3, ce que partagent les figures 1 et 2 ; puis la figure 3 et la règle. */
export const chainOf = (step, mode) => {
  if (mode === 'crossing') return step === 'one' ? ['crB', 'crC', 'crSide'] : ['crOrder', 'rule'];
  return step === 'one' ? ['lvB', 'lvC'] : ['tilt', 'rule'];
};

const fx = (n, d) => `\\dfrac{${n}}{${d}}`;
const sameFrac = (a, b) => LIN.eq(a, b);

/** Une fraction → ses options (la bonne + deux distracteurs distincts, chacun avec son `why`). */
const fracOptions = (right, cands, k, key, o) => [
  { text: <MathText>{$(LIN.fracLatex(right))}</MathText>, correct: true },
  ...distinct(right, cands.map((c) => ({ v: LIN.frac(c.n, c.d), why: c.why })), 2, sameFrac)
    .map((c) => ({ text: <MathText>{$(LIN.fracLatex(c.v))}</MathText>, why: Mx(k, `${key}.${c.why}`, { ...o, shown: $(LIN.fracLatex(c.v)) }) })),
];

const levelTrial = (lab) => lab.trials.find((x) => x.kind === 'level');
const firstOf = (lab, f) => L.figureTrial(lab, f);

const RAW_QUESTIONS = {
  /* مبتدئ — étape 1 : le rapport de B′ sur la planche de niveau, puis celui de C′ */
  lvB: (lab, step, k) => {
    const t = levelTrial(lab);
    const o = { bp: t.bp, b: lab.b, cp: t.cp, c: lab.c, r: $(LIN.fracLatex(t.ratioB)), raw: $(fx(t.bp, lab.b)) };
    return {
      id: 'lvB', kind: 'choice', cols: 3,
      prompt: Mx(k, 'lvB.prompt', o),
      options: fracOptions(t.ratioB, [
        { n: t.bp, d: lab.b - t.bp, why: 'whyRest' }, { n: lab.b - t.bp, d: lab.b, why: 'whyComplement' }, { n: lab.b, d: t.bp, why: 'whyInverse' }, { n: t.bp + 1, d: lab.b, why: 'whyNear' },
      ], k, 'lvB', o),
      hints: [Mx(k, 'lvB.hint1', o), Mx(k, 'lvB.hint2', o)],
      explain: Mx(k, 'lvB.explain', o),
    };
  },
  lvC: (lab, step, k) => {
    const t = levelTrial(lab);
    const o = { bp: t.bp, b: lab.b, cp: t.cp, c: lab.c, r: $(LIN.fracLatex(t.ratioB)), rawC: $(fx(t.cp, lab.c)) };
    return {
      id: 'lvC', kind: 'choice', cols: 3,
      prompt: Mx(k, 'lvC.prompt', o),
      options: fracOptions(t.ratioC, [
        { n: t.cp, d: lab.b, why: 'whyOther' }, { n: lab.c - t.cp, d: lab.c, why: 'whyComplement' }, { n: t.cp, d: lab.c - t.cp, why: 'whyRest' }, { n: t.cp + 1, d: lab.c, why: 'whyNear' },
      ], k, 'lvC', o),
      hints: [Mx(k, 'lvC.hint1', o), Mx(k, 'lvC.hint2', o)],
      explain: Mx(k, 'lvC.explain', o),
    };
  },
  /* مبتدئ — étape 2 : la planche penchée (la bulle a fui) */
  tilt: (lab, step, k) => {
    const t = lab.trials.find((x) => x.kind === 'tilted');
    const lv = levelTrial(lab);
    const o = { bp: t.bp, cp: t.cp, b: lab.b, c: lab.c, rb: $(LIN.fracLatex(t.ratioB)), rc: $(LIN.fracLatex(t.ratioC)), lbp: lv.bp, lcp: lv.cp };
    return {
      id: 'tilt', kind: 'choice',
      prompt: Mx(k, 'tilt.prompt', o),
      options: [
        { text: Mx(k, 'tilt.right', o), correct: true },
        { text: Mx(k, 'tilt.equal', o), why: Mx(k, 'tilt.whyEqual', o) },
        { text: Mx(k, 'tilt.lengths', o), why: Mx(k, 'tilt.whyLengths', o) },
      ],
      hints: [Mx(k, 'tilt.hint1', o), Mx(k, 'tilt.hint2', o)],
      explain: Mx(k, 'tilt.explain', o),
    };
  },
  /* متقدم — étape 1 : où poser B′ et C′ pour que le rapport vaille 1/3 (calcul AVANT de voir la bulle) */
  crB: (lab, step, k) => {
    const v = LIN.mul(lab.target, lab.b);
    const o = { b: lab.b, t: $(LIN.fracLatex(lab.target)), v: LIN.fracText(v) };
    return {
      id: 'crB', kind: 'number', expected: String(LIN.fracText(v)), answer: <MathText>{$(LIN.fracLatex(v))}</MathText>,
      prompt: Mx(k, 'crB.prompt', o),
      hints: [Mx(k, 'crB.hint1', o), Mx(k, 'crB.hint2', o)],
      explain: Mx(k, 'crB.explain', { ...o, calc: $(`AB' = ${LIN.fracLatex(lab.target)} \\times ${lab.b} = ${LIN.fracLatex(v)}`) }),
    };
  },
  crC: (lab, step, k) => {
    const v = LIN.mul(lab.target, lab.c);
    const o = { c: lab.c, t: $(LIN.fracLatex(lab.target)), v: LIN.fracText(v) };
    return {
      id: 'crC', kind: 'number', expected: String(LIN.fracText(v)), answer: <MathText>{$(LIN.fracLatex(v))}</MathText>,
      prompt: Mx(k, 'crC.prompt', o),
      hints: [Mx(k, 'crC.hint1', o), Mx(k, 'crC.hint2', o)],
      explain: Mx(k, 'crC.explain', { ...o, calc: $(`AC' = ${LIN.fracLatex(lab.target)} \\times ${lab.c} = ${LIN.fracLatex(v)}`) }),
    };
  },
  crSide: (lab, step, k) => {
    const f1 = firstOf(lab, '1'); const f2 = firstOf(lab, '2');
    const o = { p1: $(`AB' = ${Math.abs(f1.bp)}`), q1: $(`AC' = ${Math.abs(f1.cp)}`), p2: $(`AB' = ${Math.abs(f2.bp)}`), q2: $(`AC' = ${Math.abs(f2.cp)}`) };
    return {
      id: 'crSide', kind: 'choice',
      prompt: Mx(k, 'crSide.prompt', o),
      options: [
        { text: Mx(k, 'crSide.right', o), correct: true },
        { text: Mx(k, 'crSide.between', o), why: Mx(k, 'crSide.whyBetween', o) },
        { text: Mx(k, 'crSide.equalDist', o), why: Mx(k, 'crSide.whyEqualDist', o) },
      ],
      hints: [Mx(k, 'crSide.hint1', o), Mx(k, 'crSide.hint2', o)],
      explain: Mx(k, 'crSide.explain', o),
    };
  },
  /* متقدم — étape 2 : la figure 3 respecte le rapport mais la bulle la refuse */
  crOrder: (lab, step, k) => {
    const f3 = firstOf(lab, '3') ?? firstOf(lab, '3m');
    const o = { ab: $(`AB' = ${Math.abs(f3.bp)}`), ac: $(`AC' = ${Math.abs(f3.cp)}`), t: $(LIN.fracLatex(lab.target)) };
    return {
      id: 'crOrder', kind: 'choice',
      prompt: Mx(k, 'crOrder.prompt', o),
      options: [
        { text: Mx(k, 'crOrder.right', o), correct: true },
        { text: Mx(k, 'crOrder.ratios', o), why: Mx(k, 'crOrder.whyRatios', o) },
        { text: Mx(k, 'crOrder.short', o), why: Mx(k, 'crOrder.whyShort', o) },
      ],
      hints: [Mx(k, 'crOrder.hint1', o), Mx(k, 'crOrder.hint2', o)],
      explain: Mx(k, 'crOrder.explain', o),
    };
  },
  rule: (lab, step, k) => ({
    id: 'rule', kind: 'choice',
    prompt: <MathText>{k(lab.mode === 'crossing' ? 'dPromptCross' : 'dPromptLadder')}</MathText>,
    options: discoveryOptionsOf(lab, k),
    hints: [Mx(k, 'rule.hint1'), Mx(k, 'rule.hint2')],
    explain: formalOf(lab, k),
  }),
};

export const QUESTIONS = spreadAll(RAW_QUESTIONS, (lab) => lab.b + lab.c);

/* ══════════════ Lecteur de mission : les suites des manches (rollout 2026-11-10, conseil L2.2–L2.4) ══════════════ */

/**
 * Les suites du lecteur, par mode : chacune { id, reached(lab), qs } — l'id est le point d'étape de la manche (`{ checkpoint: id }`), posé quand
 * ce qu'il interroge est là, dans l'ordre de la liste. Voir l'en-tête « LECTEUR DE MISSION ».
 */
const firstLevel = (lab) => L.levelRatios(lab).length >= 1;
export const CHAINS_PLAYER = Object.freeze({
  ladder: [{ id: 'lv', reached: firstLevel, qs: ['lvFill'] }, { id: 'rule', reached: L.playerDiscovery, qs: ['ratioBuild', 'rule'] }],
  ladderEasy: [{ id: 'lv', reached: firstLevel, qs: ['lvFill'] }],
  side: [{ id: 'side', reached: L.stageOneReached, qs: ['crSide'] }],
  cross: [{ id: 'beyond', reached: (lab) => L.figuresMade(lab).includes('1'), qs: ['beyondFill'] }, { id: 'order', reached: L.discoveryReady, qs: ['orderFill', 'rule'] }],
  none: [],
});
export const chainsOfPlayer = (mode) => CHAINS_PLAYER[mode] ?? [];

/** Une pastille de rapport à une place qui tourne avec les nombres (jamais toujours la première). */
const spinList = (xs, seed) => { const s = ((seed % xs.length) + xs.length) % xs.length; return xs.map((_, i) => xs[(i + s) % xs.length]); };
const ratioField = (lab, end, at) => {
  const opts = L.chipOptions(lab, end, at);
  return {
    label: <MathText>{end === 'B' ? "$\\dfrac{AB'}{AB}$" : "$\\dfrac{AC'}{AC}$"}</MathText>,
    expected: opts.find((o) => o.right).text, options: opts.map((o) => o.text), render: fracNode,
  };
};

Object.assign(QUESTIONS, {
  /* manche 1 — la première planche de niveau : ses deux rapports, d'un toucher (pastilles : la bonne, AB′/BB′, l'inverse) */
  lvFill: (lab, step, k) => {
    const tr = levelTrial(lab);
    const at = { bp: tr.bp, cp: tr.cp };
    const o = { bp: tr.bp, cp: tr.cp, b: lab.b, c: lab.c, rawB: $(fx(tr.bp, lab.b)), eq: $(`${fx(tr.bp, lab.b)} = ${fx(tr.cp, lab.c)} = ${LIN.fracLatex(tr.ratioB)}`) };
    return {
      id: 'lvFill', kind: 'fill', prompt: Mx(k, 'lvFill.prompt', o),
      fields: [ratioField(lab, 'B', at, k), ratioField(lab, 'C', at, k)],
      hints: [Mx(k, 'lvFill.hint1', o), Mx(k, 'lvFill.hint2', o)], explain: Mx(k, 'lvFill.explain', o),
    };
  },
  /* manche 1 — BÂTIR « AB′/AB = AC′/AC » : AB′/AB déjà posé à gauche ; AC′, AC et le leurre CC′ ; l'autre sens accepté (conseil L2.3) */
  ratioBuild: (lab, step, k) => {
    const rest = spinList(["AC′", 'AC', "CC′"], lab.b + lab.c);
    return {
      id: 'ratioBuild', kind: 'build', prompt: Mx(k, 'ratioBuild.prompt'),
      slots: [k('cp.ratioBuild.slotPart'), k('cp.ratioBuild.slotWhole'), k('cp.ratioBuild.slotPart'), k('cp.ratioBuild.slotWhole')],
      ops: ['/', '=', '/'],
      tiles: ["AB′", 'AB', ...rest], preset: ["AB′", 'AB', null, null],
      expected: ["AB′", 'AB', "AC′", 'AC'], accept: [["AC′", 'AC', "AB′", 'AB']],
      hints: [Mx(k, 'ratioBuild.hint1'), Mx(k, 'ratioBuild.hint2')], explain: Mx(k, 'ratioBuild.explain'),
    };
  },
  /* manche 3 — une planche de niveau AU-DELÀ de A : ses rapports sont des rapports de LONGUEURS, positifs (pastilles : r, −r, l'inverse) */
  beyondFill: (lab, step, k) => {
    const tr = firstOf(lab, '1');
    const field = (end) => {
      const a = Math.abs(end === 'B' ? tr.bp : tr.cp); const n = end === 'B' ? lab.b : lab.c;
      const right = LIN.frac(a, n);
      const opts = spinList([LIN.fracText(right), `−${LIN.fracText(right)}`, LIN.fracText(LIN.frac(n, a))], a + n + (end === 'B' ? 0 : 2));
      return { label: <MathText>{end === 'B' ? "$\\dfrac{AB'}{AB}$" : "$\\dfrac{AC'}{AC}$"}</MathText>, expected: LIN.fracText(right), options: opts, render: fracNode };
    };
    const o = {
      db: Math.abs(tr.bp), dc: Math.abs(tr.cp), b: lab.b, c: lab.c, rawB: $(fx(Math.abs(tr.bp), lab.b)),
      eq: $(`${fx(Math.abs(tr.bp), lab.b)} = ${fx(Math.abs(tr.cp), lab.c)} = ${LIN.fracLatex(LIN.frac(Math.abs(tr.bp), lab.b))}`),
    };
    return {
      id: 'beyondFill', kind: 'fill', prompt: Mx(k, 'beyondFill.prompt', o), fields: [field('B'), field('C')],
      hints: [Mx(k, 'beyondFill.hint1', o), Mx(k, 'beyondFill.hint2', o)], explain: Mx(k, 'beyondFill.explain', o),
    };
  },
  /* manche 3 — la planche refusée aux rapports égaux : sur chaque droite, quel point est ENTRE les deux autres ? (l'ordre) */
  orderFill: (lab, step, k) => {
    const tr = firstOf(lab, '3') ?? firstOf(lab, '3m');
    const midB = tr.bp > 0 ? "B′" : 'A';
    const midC = tr.cp > 0 ? "C′" : 'A';
    const o = {
      db: Math.abs(tr.bp), dc: Math.abs(tr.cp),
      sideB: tr.bp > 0 ? k('sideBetweenB') : k('sideBeyond'), sideC: tr.cp > 0 ? k('sideBetweenC') : k('sideBeyond'), midB, midC,
    };
    return {
      id: 'orderFill', kind: 'fill', prompt: Mx(k, 'orderFill.prompt', o),
      fields: [
        { label: k('cp.orderFill.onD'), expected: midB, options: ['A', "B′", 'B'] },
        { label: k('cp.orderFill.onD2'), expected: midC, options: ['A', "C′", 'C'] },
      ],
      hints: [Mx(k, 'orderFill.hint1', o), Mx(k, 'orderFill.hint2', o)], explain: Mx(k, 'orderFill.explain', o),
    };
  },
});
