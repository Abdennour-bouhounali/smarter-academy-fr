import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import { Minus, Plus, ChevronDown, ChevronUp, PencilLine, RotateCcw } from 'lucide-react';
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
import { $, Mx, distinct, spreadAll } from './thalesCp';
import * as L from '../logic/segmentDivider';

/**
 * segment-divider — L'ÉVENTAIL DES PARALLÈLES (unité 9 « خاصية طالس », درس « إنشاءات هندسية وتطبيقات
 * خاصية طالس (تقسيم قطعة مستقيم) », طرائق pp. 107 et 109). Règle NON graduée, compas, équerre — pour de vrai.
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. L'élève tourne le rayon [Ax) (poignée au bout du rayon, ou toucher la scène), OUVRE le compas (la
 *    jambe-crayon du compas sous la scène : glisser, −/+, flèches), PIQUE chaque report (toucher la marque
 *    pointillée — un geste par report), relie une marque à B, puis FAIT GLISSER l'équerre le long de la règle
 *    (glisser n'importe où sur la scène, ‹ ›, flèches) et TRACE la parallèle (✏️, Entrée). En متقدم : il
 *    gradue au compas les deux parallèles (d₁) et (d₂) des deux côtés, puis pose les deux bouts de la règle.
 * B. Idée : des marques ÉGALES sur un rayon + des parallèles = des parts égales sur [AB] (Thalès dans le
 *    triangle A P_n B) ; MA/MB = AF/BE sur deux parallèles graduées à la même unité ; deux points.
 * C. Les marques se posent, la droite (P_n B) se trace, le bord de l'équerre balaie la scène et son point
 *    sur (AB) suit le doigt ; chaque parallèle tracée coupe [AB] ; la banderole du tifo se colore en bandes.
 * D. La mesure de la plateforme (« قياس ») écrit les parts exactes (10/3 ≈ 3,33 cm) ; en متقدم le rapport
 *    MA/MB du point trouvé ; la liste des essais (repliable).
 * E. À découvrir avant la règle : les parts ne dépendent ni de l'ouverture ni de l'angle — seulement de
 *    l'égalité des reports et de la marque reliée ; en متقدم, deux points (dedans / dehors).
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        partager [AB] en n parts égales (ou dans le rapport p/q) SANS mesurer : Thalès
 *   OBJECT         un rayon, un compas, une règle non graduée, une équerre ; en متقدم deux parallèles
 *   VARIABLE       l'angle du rayon, l'OUVERTURE du compas (tenue : la changer en route est possible),
 *                  la marque reliée à B, la position de l'équerre ; en متقدم les côtés et les rangs des marques
 *   INVARIANT      les points de partage ne bougent pas quand l'ouverture ou l'angle change (essais
 *                  comparés) ; le bord de l'équerre reste parallèle à (P_n B) pendant qu'elle glisse
 *   TRANSFORMATION des marques, une droite reliée, des parallèles, des points sur [AB]
 *   CONSTRAINT     l'angle se fige à la première marque ; un report par geste ; une parallèle passe par une
 *                  marque ou n'est pas tracée
 *   RESISTANCE     « حافة الكوس لا تمر بعلامة » (tracé refusé hors marque) ; une ouverture changée donne des
 *                  bandes inégales MESURÉES ; relier la (n−1)-ième marque donne n − 1 bandes
 *                  (MISC-TALIS-ADAD-AL-ALAMAT) ; en متقدم 2 côté A / 3 côté B donne 2/3 (MISC-TALIS-NISBA-MAQLUBA),
 *                  deux unités différentes sont dénoncées, des rangs égaux du même côté donnent une règle
 *                  parallèle à (AB)
 *   EVIDENCE       les bandes égales ou non, la mesure exacte, le rapport MA/MB écrit
 *   CONTRAST       un essai juste ET un essai raté, ou deux essais justes de réglages différents ; en متقدم
 *                  le point de [AB] ET le point hors de [AB]
 *   PREDICTION     quelle marque relier à B ; de quel côté poser les marques pour rester dans [AB]
 *   DISCOVERY      « n marques égales, la n-ième reliée à B, des parallèles : n parts égales, quelle que soit
 *                  l'ouverture » ; « deux points : AM/AB = p/(p + q), AN/AB = p/(p − q) »
 *   FORMALIZATION  AM_k/AB = AP_k/AP_n = k/n (Thalès) ; MA/MB = AF/BE
 *   TRANSFER       طرائق ص 107 (méthode du manuel), ص 109 (دوري الآن 2/5), تمارين 17, 18, 19, 21
 *
 * Manuel (§6bis) : chaque report, chaque marque reliée, chaque parallèle est un geste qui peut être faux —
 * aucune auto-complétion.
 *
 * DÉCOR (exigence du propriétaire, monde `tifo` — la banderole géante que les ultras du quartier peignent
 * pour le derby) : un tambour (طبل) qui bat au toucher, des confettis quand une construction réussit.
 * `aria-hidden`, hors clavier, `[data-deco]`, jamais une information, immobiles sous `prefers-reduced-motion`.
 * Les BANDES colorées sous [AB] ne sont pas un décor : ce sont les parts que la construction a découpées.
 *
 * D'UN SEUL REGARD (§8bis) : la scène est une boîte FIXE (indépendante de l'angle — la poignée ne change pas
 * d'échelle sous le doigt) mise à l'échelle par la largeur ET par la hauteur de l'écran de leçon
 * (`useLessonViewport` moins ce que le bloc mesure en plus de la scène). Les commandes (compas, marques,
 * équerre, règle) sont juste sous la scène, la lecture dessous ; la liste des essais est un `LabFold` sous le
 * bloc mesuré `[data-sd-glance]`.
 *
 * Props : `mode` ('equal' | 'ratio'), `parts` (equal), `p`, `q`, `marks` (ratio : marques par rail),
 * `length` (AB en cm, 10), `theme` ('tifo'), `title`, `lead`, `mission`, `level`, `levels` (false : un seul
 * niveau, sans sélecteur), `onTrial(evidence)` à chaque construction finie / règle posée,
 * `onFinished({ mode, … })` à la règle formelle — tous par `state.report`.
 *
 * CONTRAT DOM : [data-segment-divider][data-mode][data-step][data-solved], [data-sd-glance], [data-sd-scene],
 * [data-sd-angle] (role=slider), [data-sd-ghost=<rail>], [data-sd-mark=<rail>:<i>], [data-sd-open] (slider),
 * [data-sd-open-less|more], [data-sd-join=<i>], [data-sd-square] (slider), [data-sd-square-prev|next],
 * [data-sd-draw], [data-sd-fresh], [data-sd-end=a|b] (slider), [data-sd-end-less|more=a|b],
 * [data-sd-cut=<i>], [data-sd-point=inside|outside], [data-sd-verdict=<kind>], [data-sd-reading],
 * [data-lab-fold=segment-divider.trials], [data-deco].
 */
const COLORS = ['#059669', '#ffffff', '#e11d48'];

/*
 * LECTEUR DE MISSION (rollout 2026-11-10, unité 9 leçon 3 `inshaat-talis` ; conseil du 2026-11-10, verdict L3.1–L3.7) : joué en MANCHES (LabRounds).
 * Tout ce qui suit est gardé par `useInMissionPlayer()` ; hors lecteur (page, enseignant, mode classe) le labo est INCHANGÉ.
 *   - Un ESSAI reste ce qu'il est sur la page : une construction FINIE (equal) ou une règle posée (ratio). `onVerdict { groups, exact, free? }`
 *     (`logic › verdictOf` : equal → le rang de la marque reliée ; ratio → 1 le point de [AB], 2 le point hors de [AB], 0 un autre rapport) ; le
 *     PREMIER refus de la manche est `free` ; la même construction / la même règle deux fois n'est pas un nouvel essai. La découverte du labo
 *     (`logic › discoveryReady`) est annoncée une fois (`{ tk: 'discovered' }`).
 *   - `sameUnitOnly` (L3.1, vrai par défaut dans le lecteur) : une règle posée sur des graduations d'ouvertures différentes est REFUSÉE et
 *     EXPLIQUÉE en mots (« وحدتان مختلفتان ») — aucun rapport n'est écrit pour elle ; `marks` (3 dans les manches) plafonne les graduations par rail.
 *   - AB mesure 9 par défaut (jamais 10 : la longueur de la مسألة) ; une construction fausse ne montre que ses bandes et ses ouvertures, jamais
 *     de longueurs calculées (L3.5) ; relier la marque 1 est refusé sans compter (impasse) ; « أعِد التجربة » d'une question efface TOUT.
 *   - `chains` : 'full' (equal — à la 1re construction juste : « AP_n = ▢ × AP₁ » d'un toucher, BÂTIR « AM_k/AB = AP_k/AP_n » (leurre P_kP_n),
 *     la règle ; ratio — « ranks » au 1er point : les rangs AF et BE d'un toucher puis BÂTIR « AF/BE = MA/MB » (leurre AB) ; « rule » aux deux
 *     points : AM/AB puis la règle), 'build' (la seule égalité à bâtir), 'none'. L'égalité écrite dans l'autre sens est acceptée (`accept`).
 *   - `predict` : des CLÉS (≤ 2) — equal 'joinWhich', 'parallels' ; ratio 'opposite', 'same' — posées AVANT le premier geste ; les options et la
 *     vérité viennent de la logique (`predictOptions`, `predictTruth` : « même côté » → avant A si p < q, APRÈS B si p > q, L3.7) ; jugées par le
 *     terrain (`judgedPredictions`), chaque résultat montré et entendu une fois, la question attend PRED_HOLD_MS.
 *   - `contrast` : la manche attend AUSSI le contraste (une seconde construction) — le guide garde « إنشاء جديد » après la suite de questions.
 *   - `choices` : des labos au choix (manche libre) [{ mode:'equal', parts, length? } | { mode:'ratio', p, q, marks? }].
 *   Le journal « 📋 جدول تجاربك » et le verdict sont dans la colonne (représentation), une région vivante TOUJOURS montée dans la scène ;
 *   commandes figées pendant une prédiction ou une question (`aria-disabled` + garde) ; toujours guidé ; pas de fête ; `LabCoach`
 *   (`logic › coachOf`) ; `{ tk: 'reset' }` à chaque « إعادة », `{ tk: 'retry' }`.
 */
/** Lecteur : au plus PRED_MAX prédictions par manche. */
const PRED_MAX = 2;
/** Le temps pendant lequel un résultat de prédiction reste seul à l'écran avant la question de la manche. */
export const PRED_HOLD_MS = 1600;
const ringP = 'focus-visible:ring-indigo-600 focus-visible:ring-offset-2';
/** Lecteur : ce que la zone du lecteur porte EN PLUS du bloc mesuré du labo (le chemin des manches, la ligne du but, les marges). */
const PLAYER_CHROME = 150;
const SUBS = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
/** 3 → « ₃ » (les noms P₁, M₂ des points de la figure et des tuiles). */
export const sub = (n) => String(n).split('').map((d) => SUBS[Number(d)]).join('');
/** Le rang de la part que l'égalité à bâtir interroge : la 1re pour 2 ou 3 parts, la 2e pour 4 ou 5… */
export const buildRank = (n) => Math.max(1, Math.floor(n / 2));
/** « 3/2 » → une vraie fraction. */
const fracNode = (text) => {
  const [n, d] = String(text).split('/');
  return <MathText>{d ? `$\\tfrac{${n}}{${d}}$` : `$${n}$`}</MathText>;
};
const KNOB = 'absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 outline-none focus-visible:ring-4';
const BTN = 'inline-flex h-11 min-w-[44px] items-center justify-center gap-1 rounded-xl border-2 px-2 text-sm font-bold focus:outline-none focus-visible:ring-2 disabled:opacity-40';

export default function SegmentDivider({
  mode: mode0 = 'equal', parts: parts0 = 3, p: p0 = 3, q: q0 = 2, marks: marks0 = 5, length: lengthProp, theme = 'tifo',
  title, lead, mission, level, levels: withLevels = true, initialMode = 'student', allowModeSwitch = false, checkpoints: cpOn = true, onTrial, onFinished,
  coach: coachOn = true,
  // ── LECTEUR DE MISSION (rollout 2026-11-10, traitement v2) ──
  onVerdict, chains: chainsMode = 'none', predict: predictList = [], choices, sameUnitOnly: sameUnitProp, contrast = false,
}) {
  const { t } = useTranslation('lesson');
  const gameScreen = useInMissionPlayer();
  const uid = useId();
  // AB : 10 cm sur la page (inchangé) ; 9 dans le lecteur (10 est la longueur de la مسألة — conseil du 2026-11-10)
  const length = lengthProp ?? (gameScreen ? 9 : 10);
  const sameUnit = sameUnitProp ?? gameScreen;
  const k = useCallback((key, o) => t(`manipulation.segmentDivider.${key}`, o), [t]);
  const initialNumbers = mode0 === 'ratio' ? { p: p0, q: q0, marks: marks0, mode: 'ratio' } : { parts: parts0, mode: 'equal' };
  const state = useManipulation({ type: 'segment-divider', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nums = state.numbers;
  const ratio = nums.mode === 'ratio';
  const make = () => L.init({ mode: nums.mode, parts: nums.parts, p: nums.p, q: nums.q, marks: nums.marks, length: nums.length ?? length, sameUnitOnly: sameUnit, player: gameScreen });
  const [lab, setLab] = useState(make);
  const sceneKey = `${JSON.stringify(nums)}|${state.epoch}`;
  const [scene, setScene] = useState({ key: sceneKey, inits: 0 });
  const [doneIds, setDoneIds] = useState([]);   // les étapes dont la suite de questions est finie
  // lecteur : les prédictions (clé → juste ?), celles déjà posées, les résultats montrés, les essais déjà annoncés à la manche
  const [preds, setPreds] = useState({});
  const asked = useRef(new Set());
  const [missionBig, setMissionBig] = useState(false);
  const refusedSeen = useRef(0);
  const discoveredSent = useRef(false);
  const reported = useRef(0);
  const heardPred = useRef(new Set());
  const [shownPreds, setShownPreds] = useState([]);
  const [predHold, setPredHold] = useState(false);
  const holdTimer = useRef(null);
  const [choiceSaid, setChoiceSaid] = useState(null);
  if (scene.key !== sceneKey) {
    // « إعادة » (ou un autre labo de la manche libre) : TOUT repart — les essais, les étapes, les questions, les prédictions
    setScene({ key: sceneKey, inits: scene.inits + 1 }); setLab(make()); setDoneIds([]);
    setPreds({}); asked.current = new Set(); refusedSeen.current = 0; discoveredSent.current = false; reported.current = 0;
    heardPred.current = new Set(); setShownPreds([]); setPredHold(false);
  }
  // la manche (LabRounds) repart de zéro avec la scène : ses essais et prédictions d'avant ne comptent plus
  useEffect(() => { if (gameScreen && scene.inits > 0) state.report(onTrial, { tk: 'reset' }); }, [scene.inits]); // eslint-disable-line react-hooks/exhaustive-deps
  const reduce = useReducedMotion();

  /* ── les questions PENDANT le labo (primitives/LabCheckpoint) : une suite après chaque étape faite (equal : les marques posées, la 1re construction
     juste, le contraste ; ratio : un 1er point juste, les deux points) ; la dernière finit par la règle et remplace la découverte automatique. ── */
  const cpSettings = useLabCheckpointSettings('segment-divider');
  const cpEnabled = cpOn && cpSettings.enabled;
  const steps = L.stepsOf(lab.mode);
  const stepOk = Object.fromEntries(steps.map((g) => [g, L.stepReached(lab, g)]));
  // ── le lecteur : les suites de la manche (CHAINS_PLAYER), chacune posée quand ce qu'elle interroge est là ──
  const solvedAll = L.discoveryReady(lab);
  const playerChains = gameScreen ? chainsOfPlayer(lab.mode, chainsMode) : [];
  const lastChain = playerChains.at(-1);
  // « toutes jugées » : equal — la dernière suite atteinte ; ratio — les DEUX points trouvés (revue 2026-11-10 : la suite `build` s'ouvre au 1er
  // point, et « même côté » ne doit pas être jugée avant que le point extérieur existe)
  const finalReached = lab.mode === 'ratio' ? solvedAll : (lastChain ? lastChain.reached(lab) : solvedAll);
  const predKeys = gameScreen ? predictList.filter((key) => L.PREDICT_KEYS[lab.mode].includes(key)).slice(0, PRED_MAX) : [];
  const judgedPreds = gameScreen ? L.judgedPredictions(lab, predKeys.filter((key) => key in preds), finalReached) : [];
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
        // lecteur : la tâche repart de ZÉRO (toutes les constructions) ; la manche oublie ce que le labo vient de défaire, le 1er refus redevient gratuit
        setLab(make());
        refusedSeen.current = 0; discoveredSent.current = false; reported.current = 0;
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
  const stepNow = stepDone.includes(false) ? stepDone.indexOf(false) : steps.length - 1;
  const showStepper = !gameScreen;
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (L.markCount(lab) === 0 && lab.trials.length === 0 && lab.joins.length === 0 && celebrated.current.size) celebrated.current = new Set();   // « إعادة » : on refête
  useEffect(() => {
    if (!showStepper) return;   // lecteur : pas de fête quand l'étape est cachée
    stepDone.forEach((d, i) => {
      if (!d || celebrated.current.has(steps[i])) return;
      celebrated.current.add(steps[i]);
      party.celebrate({ n: stepDone.filter(Boolean).length, total: steps.length });
    });
  }, [stepDone.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps
  // le son : un déclic par report / trait, le drapeau quand la construction est juste, « over » quand elle ou le geste est refusé
  useEffect(() => {
    const l = lab.last;
    if (!l) return;
    if (l.kind === 'carried' || l.kind === 'drawn' || l.kind === 'joined' || l.kind === 'fresh') playSfx('tooth');
    else if (l.kind === 'complete') playSfx(l.trial.ok ? 'flag' : 'over');
    else if (l.kind === 'join') playSfx(l.join.ok ? 'flag' : 'over');
    else if (['full', 'afterJoin', 'angleLocked', 'noMarks', 'joinLocked', 'joinFirst', 'offMark', 'joinedLine', 'already', 'rulerHalf', 'joinOne'].includes(l.kind)) playSfx('over');
  }, [lab.last]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── la découverte, les rapports à la leçon ── */
  useEffect(() => { if (ready) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (state.isFormal) state.report(onFinished, { mode: lab.mode, trials: lab.trials.length, joins: lab.joins.length }); }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps
  const nEvents = ratio ? lab.joins.length : lab.trials.length;
  useEffect(() => {
    if (nEvents > 0) state.report(onTrial, L.evidenceOf(lab));
    // lecteur : un essai NOUVEAU est un verdict pour la manche (le premier refus est gratuit ; la même construction refaite ne compte pas)
    if (gameScreen && nEvents > reported.current) {
      const v = L.verdictOf(lab);
      if (v && !L.repeatedTrial(lab)) {
        const free = !v.exact && refusedSeen.current === 0;
        if (!v.exact) refusedSeen.current += 1;
        state.report(onVerdict, { ...v, ...(free ? { free: true } : {}) });
      }
      if (L.discoveryReady(lab) && !discoveredSent.current) { discoveredSent.current = true; state.report(onTrial, { tk: 'discovered' }); }
    }
    reported.current = nEvents;
  }, [nEvents]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── lecteur : la PRÉDICTION, avant le premier geste ; les commandes sont figées pendant elle et pendant une question ── */
  const untouched = L.markCount(lab) === 0 && nEvents === 0;
  const nextPred = predKeys.find((key) => !asked.current.has(key)) ?? null;
  const predictOpen = gameScreen && cpEnabled && !cp.open && !missionBig && untouched && nextPred != null;
  const locked = gameScreen && (cp.open || predictOpen);
  const lockedRef = useRef(false);
  lockedRef.current = locked;
  /** Tout geste passe par ici : rien ne bouge pendant une prédiction ou une question (les boutons restent focalisables, `aria-disabled`). */
  const act = (fn) => { if (!lockedRef.current) setLab(fn); };
  const sayPredict = (says) => {
    const key = nextPred;
    const ok = String(says) === String(L.predictTruth(lab, key));
    asked.current.add(key);
    playSfx('pop');
    setPreds((m) => ({ ...m, [key]: ok }));
    state.report(onTrial, { tk: 'predict', ok });
    if (!predKeys.some((x) => x !== key && !asked.current.has(x))) {
      setTimeout(() => boxRef.current?.querySelector('[data-sd-angle]')?.focus(), 60);
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

  /* ── mesure : largeur de la scène, hauteur de l'écran de leçon, ce que le bloc mesure en plus ── */
  const boxRef = useRef(null);
  const glanceRef = useRef(null);
  const sceneRef = useRef(null);
  const sceneHRef = useRef(260);
  const [cw, setCw] = useState(300);
  const [overhead, setOverhead] = useState(190);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => {
      setCw(Math.max(200, Math.floor(el.clientWidth)));
      if (glanceRef.current) setOverhead(Math.max(110, Math.ceil(glanceRef.current.getBoundingClientRect().height - sceneHRef.current)));
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
    if (el) { const w = Math.max(200, Math.floor(el.clientWidth)); setCw((cur) => (cur === w ? cur : w)); }
  });
  const vp = useLessonViewport(true);
  const screenH = vp.ready && vp.height > 0 ? vp.height : 640;
  const box = L.sceneBox(lab);
  // lecteur : la scène laisse la place aux manches, à la consigne et aux commandes dans la zone du lecteur (aucun défilement, pas de zoom de repli)
  const area = useMissionArea();
  const playerRoom = gameScreen && area?.height > 0 ? Math.max(170, area.height - overhead - PLAYER_CHROME) : Infinity;
  const budget = Math.max(170, Math.min(560, screenH - overhead - 24, playerRoom));
  const scale = Math.max(gameScreen ? 0.45 : 0.6, Math.min(cw / box.w, budget / box.h));
  const W = Math.round(box.w * scale);
  const H = Math.round(box.h * scale);
  sceneHRef.current = H;
  const P = ([x, y]) => [(x - box.x0) * scale, (box.y1 - y) * scale];
  const fromClient = (cx, cy) => {
    const r = sceneRef.current?.getBoundingClientRect();
    if (!r) return [0, 0];
    // zoom du lecteur : les pixels de l'écran ramenés aux pixels du calque (rect.width / offsetWidth)
    const z = (gameScreen && sceneRef.current.offsetWidth ? r.width / sceneRef.current.offsetWidth : 1) || 1;
    return [(cx - r.left) / z / scale + box.x0, box.y1 - (cy - r.top) / z / scale];
  };
  const narrow = cw < 360;

  /* ── l'étape ── */
  const nMarks = L.markCount(lab);
  const done = !ratio && L.complete(lab);
  const step = ratio
    ? (nMarks === 0 ? 'ray' : L.lineMarks(lab, 'a').length && L.lineMarks(lab, 'b').length ? 'ruler' : 'compass')
    : (nMarks === 0 ? 'ray' : lab.joined == null ? 'compass' : done ? 'done' : 'slide');

  /* ── les gestes (moteur commun d'étirement) ── */
  const angleRange = L.ANGLE[lab.mode];
  const angleSt = useStretchInteraction({
    value: lab.angle, range: angleRange, direction: 'ltr', pageStep: 5,
    toValue: (cx, cy) => L.angleTo(lab, fromClient(cx, cy)),
    onChange: (v) => act((s) => L.setAngle(s, v)),
    onCommit: (v) => act((s) => L.setAngle(s, v)),
  });
  const openRange = L.OPEN[lab.mode];
  const openEl = useRef(null);
  const openSt = useStretchInteraction({
    value: lab.opening, range: openRange, direction: 'ltr', pageStep: 5,
    toValue: (cx, _cy, rect) => {
      // zoom du lecteur : la piste mesurée à l'écran ramenée à sa largeur de calque
      const w = openEl.current?.offsetWidth || rect.width;
      const z = (gameScreen && w ? rect.width / w : 1) || 1;
      return openRange.min + (((cx - rect.left) / z - 22) / Math.max(1, w - 44)) * (openRange.max - openRange.min);
    },
    onChange: (v) => act((s) => L.setOpening(s, v)),
    onCommit: (v) => act((s) => L.setOpening(s, v)),
  });
  const slideSt = useStretchInteraction({
    value: lab.slide, range: { min: 0, max: Math.max(1, L.slideMax(lab)) }, direction: 'ltr', pageStep: 5,
    toValue: (cx, cy) => L.snapSlide(lab, L.projectOn(lab, 'ray', fromClient(cx, cy))),
    onChange: (v) => act((s) => L.setSlide(s, v)),
    onCommit: (v) => act((s) => L.setSlide(s, v)),
  });
  const endHook = (line) => {
    const list = L.lineMarks(lab, line);
    const idx = lab.ends[line] == null ? null : list.indexOf(lab.ends[line]);
    const pick = (v) => list[Math.min(list.length - 1, Math.max(0, Math.round(v)))];
    return {
      value: idx, range: { min: 0, max: Math.max(0, list.length - 1) }, direction: 'ltr', pageStep: 2,
      toValue: (cx, cy) => {
        const sgn = L.projectOn(lab, `${line}+`, fromClient(cx, cy));
        let best = 0;
        list.forEach((v, i) => { if (Math.abs(v - sgn) < Math.abs(list[best] - sgn)) best = i; });
        return best;
      },
      onChange: (v) => { const m = pick(v); if (m != null) act((s) => L.setEnd(s, line, m)); },
      onCommit: (v) => { const m = pick(v); if (m != null) act((s) => L.commitRuler(L.setEnd(s, line, m))); },
    };
  };
  const endA = useStretchInteraction(endHook('a'));
  const endB = useStretchInteraction(endHook('b'));

  const carry = (rail) => act((s) => L.carry(s, rail));
  const drawNow = () => { if (lockedRef.current) return; slideSt.flush(); setLab((s) => L.draw(s)); };
  const keyDraw = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); drawNow(); } };

  /* ── le verdict (les mots de la mathématique, jamais « bravo / faux ») ── */
  const fracTex = (f) => LIN.fracLatex(f);
  const target = ratio ? `\\dfrac{${lab.p}}{${lab.q}}` : '';
  const last = lab.last;
  const verdictKind = last?.kind === 'complete' ? last.trial.kind : last?.kind === 'join' ? last.join.kind : (last?.kind ?? '');
  const verdict = (() => {
    if (!last) return <span className="text-slate-600">{k(ratio ? 'startRatio' : 'startEqual')}</span>;
    switch (last.kind) {
      case 'angleLocked': return <span className="text-amber-800">{k('vAngleLocked')}</span>;
      case 'full': return <span className="text-amber-800">{k('vFull')}</span>;
      case 'afterJoin': return <span className="text-amber-800">{k('vAfterJoin')}</span>;
      case 'carried': return <span className="text-slate-800">{k(last.changed ? 'vCarriedChanged' : 'vCarried', { n: last.count })}</span>;
      case 'noMarks': return <span className="text-amber-800">{k('vNoMarks')}</span>;
      case 'joinOne': return <span className="text-amber-800" data-sd-refused="joinOne">{k('vJoinOne')}</span>;
      case 'joinLocked': return <span className="text-amber-800">{k('vJoinLocked')}</span>;
      case 'joined': return <span className="text-slate-800">{k('vJoined', { n: last.idx + 1 })}</span>;
      case 'joinFirst': return <span className="text-amber-800">{k('vJoinFirst')}</span>;
      case 'offMark': return <span className="text-rose-800" data-sd-refused="offMark">{k('vOffMark', { n: (last.near ?? 0) + 1 })}</span>;
      case 'joinedLine': return <span className="text-amber-800">{k('vJoinedLine')}</span>;
      case 'already': return <span className="text-slate-700">{k('vAlready', { n: last.idx + 1 })}</span>;
      case 'drawn': return <span className="text-slate-800">{k(LIN.cmp(last.t, LIN.frac(1)) > 0 ? 'vDrawnOutside' : 'vDrawn', { n: last.idx + 1 })}</span>;
      case 'fresh': return <span className="text-slate-700">{k('vFresh')}</span>;
      case 'rulerHalf': return <span className="text-amber-800">{k('vRulerHalf')}</span>;
      case 'complete': {
        const tr = last.trial;
        const partsTex = tr.parts.map((f) => L.lengthTex(lab, f)).join(' \\;;\\; ');
        if (tr.kind === 'ok') return <span className="text-emerald-800"><MathText>{k('vOk', { n: tr.n, part: L.lengthTex(lab, tr.parts[0]) })}</MathText></span>;
        if (tr.kind === 'count') return <span className="text-rose-800" data-sd-refused="count"><MathText>{k('vCount', { got: tr.n, want: lab.parts, parts: partsTex })}</MathText></span>;
        return <span className="text-rose-800" data-sd-refused="unequal"><MathText>{k('vUnequal', { parts: partsTex, openings: tr.openings.map(L.cmText).join(' ، ') })}</MathText></span>;
      }
      case 'join': {
        const j = last.join;
        if (j.parallel) return <span className="text-rose-800" data-sd-refused="parallel">{k('vParallel')}</span>;
        const o = { r: fracTex(j.ratio), target, t: fracTex(LIN.cmp(j.t, LIN.frac(0)) < 0 ? LIN.neg(j.t) : j.t) };
        if (j.kind === 'inside') return <span className="text-emerald-800"><MathText>{k('vInside', o)}</MathText></span>;
        if (j.kind === 'outside') return <span className="text-emerald-800"><MathText>{k(LIN.cmp(j.t, LIN.frac(0)) < 0 ? 'vOutsideA' : 'vOutsideB', o)}</MathText></span>;
        if (j.kind === 'inverted') return <span className="text-rose-800" data-sd-refused="inverted"><MathText>{k('vInverted', o)}</MathText></span>;
        if (j.kind === 'units') return <span className="text-rose-800" data-sd-refused="units"><MathText>{k('vUnits', o)}</MathText></span>;
        return <span className="text-rose-800" data-sd-refused="other"><MathText>{k('vOther', { ...o, ra: j.rankA ?? '?', rb: j.rankB ?? '?' })}</MathText></span>;
      }
      default: return null;
    }
  })();

  /* ── lecteur : le verdict de l'essai VISIBLE (relu sur l'état, pas sur `last`) — des mots courts, une formule au plus, jamais une longueur
     calculée pour une construction fausse (L3.5), jamais un rapport pour deux unités différentes (L3.1) ── */
  const trialNow = !gameScreen ? null : ratio ? L.joinAtEnds(lab) : (done ? lab.trials.at(-1) ?? null : null);
  const trialKind = trialNow ? (trialNow.parallel ? 'parallel' : trialNow.kind) : null;
  const trialOk = Boolean(trialNow?.ok);
  const trialKeyStr = trialNow ? (ratio ? `j${lab.joins.indexOf(trialNow)}` : `t${lab.trials.length}`) : '';
  const trialVerdict = trialNow && (() => {
    if (!ratio) {
      if (trialNow.kind === 'ok') return <MathText>{k(L.sameCutsAgain(lab) ? 'vp.okSame' : 'vp.ok', { n: trialNow.n, part: L.lengthTex(lab, trialNow.parts[0]) })}</MathText>;
      if (trialNow.kind === 'count') return k('vp.count', { got: trialNow.n, want: lab.parts });
      return k('vp.unequal', { openings: trialNow.openings.map(L.cmText).join(' ، ') });
    }
    if (trialNow.parallel) return k('vp.parallel');
    if (trialNow.kind === 'units' && lab.sameUnitOnly) return k('vp.units');
    const o = { r: fracTex(trialNow.ratio).replace('\\dfrac', '\\tfrac'), target: `\\tfrac{${lab.p}}{${lab.q}}` };
    if (trialNow.kind === 'inside') return <MathText>{k('vp.inside', o)}</MathText>;
    if (trialNow.kind === 'outside') return <MathText>{k(LIN.cmp(trialNow.t, LIN.frac(0)) < 0 ? 'vp.outsideA' : 'vp.outsideB', o)}</MathText>;
    if (trialNow.kind === 'inverted') return <MathText>{k('vp.inverted', o)}</MathText>;
    return <MathText>{k('vp.other', o)}</MathText>;
  })();
  // sans essai visible : le message du dernier geste (les mêmes mots que la page), ou la consigne de départ
  const infoVerdict = !last || last.kind === 'complete' || last.kind === 'join'
    ? <span className="text-slate-600">{k(ratio ? 'startRatio' : 'startEqual')}</span>
    : verdict;
  // une clé par GESTE : le même refus deux fois de suite est annoncé deux fois (revue a11y 2026-11-10)
  const gesture = useRef({ last: null, n: 0 });
  if (gesture.current.last !== last) gesture.current = { last, n: gesture.current.n + 1 };
  const infoKey = `${last?.kind ?? ''}:${gesture.current.n}`;

  /* ── la lecture (ce que la scène dit, sans réponse) ── */
  const fnd = L.found(lab);
  const reading = ratio
    ? k('readRatio', { a: L.lineMarks(lab, 'a').length, b: L.lineMarks(lab, 'b').length, found: (fnd.inside ? 1 : 0) + (fnd.outside ? 1 : 0) })
    : k('readEqual', { marks: L.rayMarks(lab).length, joined: lab.joined == null ? '—' : lab.joined + 1, drawn: lab.parallels.length });

  /* ── découverte ── */
  // la page seule montre la découverte : le lecteur ne la recalcule pas à chaque geste
  const discoveryOptions = useMemo(() => (gameScreen ? null : discoveryOptionsOf(lab, k)), [gameScreen, lab, k]);
  const formal = formalOf(lab, k);

  // une consigne donnée en texte (les manches) peut porter une formule : île KaTeX
  const missionText = (typeof mission === 'string' ? <MathText>{mission}</MathText> : mission) ?? (ratio
    ? <MathText>{k('missionRatio', { target })}</MathText>
    : <MathText>{k('missionEqual', { n: lab.parts, len: lab.length })}</MathText>);

  /* ── la scène ── */
  const sceneSvg = ratio
    ? <RatioScene lab={lab} P={P} W={W} H={H} box={box} bad={gameScreen ? (trialNow && !trialNow.ok && !trialNow.parallel ? trialNow : null) : undefined} />
    : <EqualScene lab={lab} P={P} W={W} H={H} step={step} reduce={reduce} named={gameScreen && done} />;
  const ghostRails = ratio ? L.RAILS.ratio : (step === 'ray' || step === 'compass' ? ['ray'] : []);
  const railName = (rail) => k(`rail.${rail.replace('+', 'Up').replace('-', 'Down')}`);
  const angleEnd = P(L.railPoint(lab, ratio ? 'a+' : 'ray', L.railLength(lab)));
  const sq = !ratio && lab.joined != null && !done && lab.slide != null ? L.setSquareAt(lab, lab.slide) : null;
  const success = ratio ? lab.last?.kind === 'join' && lab.last.join.ok : lab.last?.kind === 'complete' && lab.last.trial.ok;

  const overlayTrack = step === 'ray' ? angleSt.trackProps : step === 'slide' ? slideSt.trackProps : null;
  const frozen = locked ? { 'aria-disabled': true } : {};
  /** L'anneau de focus : celui de la page, ou l'anneau du lecteur (indigo-600 décalé — règle d'accessibilité des leçons converties). */
  const fr = (pageCls) => (gameScreen ? ringP : pageCls);

  /* ── lecteur : le guide (LabCoach) — le geste, jamais la réponse ── */
  const chainsDone = playerChains.length ? doneIds.includes(lastChain.id) : solvedAll;
  const coachRaw = gameScreen && coachOn && !locked ? L.coachOf(lab, { done: chainsDone && (!contrast || solvedAll) }) : null;
  // une étape `idle` (mode ratio : la règle, le second point) n'est montrée que si l'élève S'ARRÊTE : en pleine graduation sa bulle couvrirait la
  // marque pointillée suivante — `idleLab` est l'état du labo resté immobile COACH_IDLE_MS
  const [idleLab, setIdleLab] = useState(null);
  const waitsIdle = Boolean(coachRaw?.idle);
  useEffect(() => {
    if (!waitsIdle) return undefined;
    const timer = setTimeout(() => setIdleLab(lab), L.COACH_IDLE_MS);
    return () => clearTimeout(timer);
  }, [waitsIdle, lab]);
  const coachNow = coachRaw && (!coachRaw.idle || idleLab === lab) ? coachRaw : null;
  // un objet STABLE par étape (son id fixe la cible et le geste) : LabCoach ne se réabonne pas à chaque geste
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const coachStep = useMemo(() => coachNow, [coachNow?.id]);
  const coach = useLabCoach({
    lab: 'segment-divider', step: coachStep, text: coachStep ? k(`coach.${coachStep.id}`) : '',
    labels: { hide: t('manipulation.common.coach.hide'), show: t('manipulation.common.coach.show'), ok: t('manipulation.common.coach.ok'), stop: t('manipulation.common.coach.stop') },
  });

  /* ── lecteur : la prédiction ou la question PREND la colonne du labo ── */
  const predText = (key, x) => (typeof x === 'number' ? k(key === 'joinWhich' ? 'predict.mark' : 'predict.count', { x }) : k(`predict.where.${x}`));
  const trayNode = !gameScreen ? null : predictOpen ? (
    <PredictTray attr="sd" key={nextPred} step={predKeys.indexOf(nextPred) + 1} of={predKeys.length}
      title={t('manipulation.common.cp.predict.title')}
      prompt={k(`predict.${nextPred}`, { n: lab.parts, r: `\u2066${lab.p}/${lab.q}\u2069` })}
      options={L.predictOptions(lab, nextPred).map((x) => ({ says: String(x), text: predText(nextPred, x) }))}
      onSay={sayPredict} />
  ) : cp.open ? cp.node : null;

  /* ── lecteur : le JOURNAL « 📋 جدول تجاربك » — chaque essai, avec le MOT de son verdict ── */
  const journalId = `${uid}-journal`;
  const journalRows = (ratio ? lab.joins : lab.trials).slice(-4);
  const sideGlyph = (v) => <><span aria-hidden="true">{v > 0 ? '↑' : '↓'}</span><span className="sr-only"> {k(v > 0 ? 'up' : 'down')}</span></>;
  const rowWord = (x) => k(`rowWord.${x.parallel ? 'parallel' : x.kind}`);
  const playerRepresentation = gameScreen && !quiet && (
    <div className="space-y-2" data-sd-player-col>
      {/* le texte VISIBLE du verdict ; l'annonce passe par la région vivante toujours montée de la scène (`data-sd-verdict-live`) */}
      <div data-sd-verdict-box>
        {trialNow ? (
          <p key={trialKeyStr} className={`rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-sm font-bold leading-snug ${trialOk ? 'text-emerald-800' : 'text-rose-800'}`}
            data-sd-verdict={trialKind} {...(trialOk ? {} : { 'data-sd-refused': trialKind })}>
            <span aria-hidden="true">{trialOk ? '✓ ' : '✗ '}</span><span className="sr-only">{k(trialOk ? 'cueRight' : 'cueWrong')} </span>{trialVerdict}
          </p>
        ) : (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white/70 px-3 py-2 text-center text-sm font-bold leading-snug" data-sd-verdict={verdictKind === 'complete' || verdictKind === 'join' ? '' : verdictKind}>{infoVerdict}</p>
        )}
        {shownPreds.map((pr) => (
          <p key={pr.key} data-sd-predict-result={pr.ok ? 'ok' : 'wrong'} data-sd-predict-key={pr.key}
            className={`mt-2 rounded-2xl px-4 py-2 text-center text-lg font-black ${pr.ok ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
            {pr.ok ? t('manipulation.common.cp.predict.right') : k('predict.wrong')}
          </p>
        ))}
      </div>
      {/* la règle trouvée (la découverte en clair) prend la place du journal : la colonne ne déborde pas */}
      {journalRows.length > 0 && !state.isFormal && (
        <div data-sd-journal>
          <p id={journalId} className="text-sm font-black text-indigo-900"><span aria-hidden="true">📋 </span>{k('journal')}</p>
          <table className="mt-1 w-full text-center text-xs" aria-labelledby={journalId}>
            <thead>
              <tr className="bg-slate-50">
                {ratio ? (
                  <>
                    <th scope="col"><bdi dir="ltr">(d₁)</bdi></th><th scope="col"><bdi dir="ltr">(d₂)</bdi></th>
                    <th scope="col"><MathText>{'$\\tfrac{MA}{MB}$'}</MathText></th>
                  </>
                ) : (
                  <><th scope="col">{k('colJoined')}</th><th scope="col">{k('colOpenings')}</th></>
                )}
                <th scope="col">{k('colResult')}</th>
              </tr>
            </thead>
            <tbody>
              {journalRows.map((x, i) => (
                <tr key={i} data-sd-row={x.parallel ? 'parallel' : x.kind}>
                  {ratio ? (
                    <>
                      <td className="border border-slate-200 font-mono"><bdi dir="ltr">{x.rankA ?? '?'}{sideGlyph(x.a)}</bdi></td>
                      <td className="border border-slate-200 font-mono"><bdi dir="ltr">{x.rankB ?? '?'}{sideGlyph(x.b)}</bdi></td>
                      <td className="border border-slate-200">{x.parallel || (x.kind === 'units' && lab.sameUnitOnly) ? <><span aria-hidden="true">—</span><span className="sr-only">{k('rowNoRatio')}</span></> : fracNode(LIN.fracText(x.ratio))}</td>
                    </>
                  ) : (
                    <>
                      <td className="border border-slate-200 font-mono"><bdi dir="ltr">{x.n}</bdi></td>
                      <td className="border border-slate-200 font-mono"><bdi dir="ltr">{[...new Set(x.openings)].map(L.cmText).join(' · ')}</bdi></td>
                    </>
                  )}
                  <td className={`border border-slate-200 font-bold ${x.ok ? 'text-emerald-800' : 'text-rose-800'}`}>
                    <span aria-hidden="true">{x.ok ? '✓ ' : '✗ '}</span>{rowWord(x)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
  const sameChoice = (c) => (c.mode === 'ratio' ? nums.mode === 'ratio' && nums.p === c.p && nums.q === c.q : nums.mode !== 'ratio' && nums.parts === c.parts);
  const numbersOf = (c) => (c.mode === 'ratio'
    ? { p: c.p, q: c.q, marks: c.marks ?? marks0, mode: 'ratio' }
    : { parts: c.parts, mode: 'equal', ...(c.length ? { length: c.length } : {}) });

  /* ── « صِل B بالعلامة », les flèches de la règle et « إنشاء جديد » : sous la scène sur la page ; dans le lecteur, dans une barre AU-DESSUS de la
     scène — la bulle du guide s'ouvre alors vers le haut de la scène, jamais sur la marque pointillée à toucher ni sur les bandes d'une
     construction finie (walk 2026-11-10 : sous la scène, elle bloquait le report suivant) ── */
  const joinRow = !ratio && step === 'compass' && (
              <div className="flex flex-wrap items-center gap-1.5" data-sd-join-row>
                <span className="text-xs font-bold text-slate-700">{k('joinTitle')}</span>
                <div className="flex flex-wrap gap-1.5" dir="ltr">
                  {L.rayMarks(lab).map((m, i) => (
                    <button key={i} type="button" onClick={() => act((s) => L.join(s, i))} data-sd-join={i} {...frozen}
                      // lecteur : le chiffre visible ouvre le nom accessible (label-in-name) ; la page garde le sien
                      aria-label={gameScreen ? `${i + 1} — ${k('joinLabel', { n: i + 1 })}` : k('joinLabel', { n: i + 1 })}
                      className={`${BTN} border-indigo-300 bg-white text-indigo-800 ${fr('focus-visible:ring-indigo-400')}`}>
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            );
  const freshBtn = (iconOnly) => (
    <button type="button" onClick={() => act((s) => L.fresh(s))} data-sd-fresh {...frozen} className={`${BTN} border-slate-300 bg-white text-slate-700 ${fr('focus-visible:ring-indigo-400')}`}>
      <RotateCcw className="h-4 w-4" aria-hidden="true" />{iconOnly ? <span className="sr-only">{k('fresh')}</span> : k('fresh')}
    </button>
  );
  const rulerRow = ratio && step === 'ruler' && (
              <div className={`flex flex-wrap items-center justify-center ${narrow ? 'gap-x-1.5' : 'gap-x-3'} gap-y-1.5`} data-sd-ruler-row>
                {[['a', endA], ['b', endB]].map(([line, st]) => (
                  <div key={line} className="flex items-center gap-0.5" dir="ltr">
                    <button type="button" onClick={() => st.nudge(-1)} aria-label={k(`endLess.${line}`)} data-sd-end-less={line} {...frozen} className={`${BTN} border-sky-300 bg-white ${fr('focus-visible:ring-sky-400')}`}><ChevronDown className="h-4 w-4" aria-hidden="true" /></button>
                    <span className={`${narrow ? 'min-w-[1.75rem] px-0.5 text-xs' : 'min-w-[2.75rem] px-2 text-sm'} rounded-full bg-sky-100 text-center font-extrabold text-sky-900`}>{line === 'a' ? (narrow ? 'd₁' : '(d₁)') : (narrow ? 'd₂' : '(d₂)')}</span>
                    <button type="button" onClick={() => st.nudge(1)} aria-label={k(`endMore.${line}`)} data-sd-end-more={line} {...frozen} className={`${BTN} border-sky-300 bg-white ${fr('focus-visible:ring-sky-400')}`}><ChevronUp className="h-4 w-4" aria-hidden="true" /></button>
                  </div>
                ))}
                {!gameScreen && freshBtn(narrow)}
              </div>
            );
  const canFresh = ratio ? step === 'ruler' : (step === 'slide' || step === 'done');

  return (
    <ManipulationShell
      type="segment-divider"
      title={title ?? k(ratio ? 'titleRatio' : 'title')}
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
      sidePanel={trayNode ? <div data-sd-tray>{trayNode}</div> : null}
      representation={gameScreen ? playerRepresentation : undefined}
      hints={(ratio ? ['hint1Ratio', 'hint2Ratio', 'hint3Ratio'] : ['hint1Equal', 'hint2Equal', 'hint3Equal']).map((h) => <MathText key={h}>{k(h, { n: lab.parts, target })}</MathText>)}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      // lecteur : la règle est la DERNIÈRE question de la manche (son explication est la forme formelle) — pas de panneau de découverte en plus
      discovery={gameScreen ? null : (
        <ManipulationDiscovery
          state={state}
          prompt={<MathText>{k(ratio ? 'dPromptRatio' : 'dPromptEqual', { target })}</MathText>}
          options={discoveryOptions}
          formal={formal}
        />
      )}
      explanation={<MathText>{k(ratio ? 'explanationRatio' : 'explanationEqual')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-emerald-50/60 to-white">
        <div ref={boxRef} className="space-y-2" data-segment-divider data-mode={lab.mode} data-step={step} data-solved={solvedAll ? 'true' : 'false'}
          data-world={theme} data-scale={scale.toFixed(2)}>
          <div className="relative space-y-2">
          {party.node}
          {/* lecteur : la région vivante TOUJOURS montée — la colonne se démonte quand une question s'ouvre, l'annonce du verdict ne part pas avec
              elle ; une clé par essai */}
          {gameScreen && (
            <div role="status" aria-live="polite" className="sr-only" data-sd-verdict-live>
              {trialNow
                ? <span key={trialKeyStr}>{k(trialOk ? 'cueRight' : 'cueWrong')} {trialVerdict}</span>
                : <span key={infoKey}>{infoVerdict}</span>}
              {shownPreds.map((pr) => <span key={pr.key}> {pr.ok ? t('manipulation.common.cp.predict.right') : k('predict.wrong')}</span>)}
              {choiceSaid && <span key={choiceSaid}> {k('choiceNow')}</span>}
            </div>
          )}
          {!(gameScreen && cp.open) && cp.node}
          <div ref={glanceRef} className="space-y-2" data-sd-glance>
            {showStepper && <LabStepper count={steps.length} current={stepNow} done={stepDone} stepAttr="data-sd-step" />}
            {gameScreen && choices?.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-1.5" role="group" aria-labelledby={`${uid}-choices`} data-sd-choices>
                <span id={`${uid}-choices`} className="text-sm font-bold text-slate-600">{k('choicesLabel')}</span>
                {choices.map((c) => {
                  const id = c.mode === 'ratio' ? `ratio-${c.p}-${c.q}` : `equal-${c.parts}`;
                  const on = sameChoice(c);
                  return (
                    <button key={id} type="button" data-sd-choice={id} aria-disabled={locked || undefined} aria-pressed={on}
                      onClick={() => { if (!lockedRef.current && !on) { state.setNumbers(numbersOf(c)); setChoiceSaid(id); } }}
                      className={`inline-flex min-h-[44px] items-center gap-1 rounded-xl border-2 px-3 text-sm font-black focus:outline-none focus-visible:ring-2 ${ringP} ${on ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'border-slate-300 bg-white text-slate-700'}`}>
                      {c.mode === 'ratio'
                        ? <><span>{k('choiceRatio')}</span><span className="pointer-events-none">{fracNode(`${c.p}/${c.q}`)}</span></>
                        : <span>{k('choiceEqual', { n: c.parts })}</span>}
                    </button>
                  );
                })}
              </div>
            )}
            {gameScreen && (
              <div className="flex min-h-[44px] flex-wrap items-center justify-between gap-2" data-sd-topbar>
                <div className="min-w-0">{joinRow}{rulerRow}</div>
                {canFresh && freshBtn(false)}
              </div>
            )}
            {/* LA SCÈNE : le dessin, et par-dessus les poignées (HTML, ≥ 44 px) */}
            <div ref={sceneRef} className="relative mx-auto" style={{ width: W, height: H }} data-sd-scene>
              {sceneSvg}
              {success && !reduce && <Confetti key={`${lab.trials.length}-${lab.joins.length}`} w={W} />}
              <Drum />
              {overlayTrack && (
                <div {...overlayTrack} className="absolute inset-0" style={{ ...overlayTrack.style, cursor: step === 'ray' ? 'crosshair' : overlayTrack.style.cursor, ...(locked ? { pointerEvents: 'none' } : {}) }} data-sd-track={step}>
                  {step === 'ray' && (
                    <div {...angleSt.handleProps({ label: k('angleHandle'), valueText: k('angleValue', { deg: lab.angle }) })}
                      data-sd-angle={lab.angle} {...frozen}
                      className={`${KNOB} border-indigo-600 bg-white/90 text-indigo-700 ${fr('focus-visible:ring-indigo-300')}`}
                      style={{ left: angleEnd[0], top: angleEnd[1], cursor: angleSt.dragging ? 'grabbing' : 'grab' }}>
                      <span aria-hidden="true" className="text-lg">↻</span>
                    </div>
                  )}
                  {step === 'slide' && sq && (() => {
                    const r = P(sq.R);
                    return (
                      <div {...slideSt.handleProps({ label: k('squareHandle'), valueText: L.markUnderSquare(lab) >= 0 ? k('squareOnMark', { n: L.markUnderSquare(lab) + 1 }) : k('squareOffMark') })}
                        onKeyDown={(e) => { keyDraw(e); if (!e.defaultPrevented) slideSt.handleProps().onKeyDown(e); }}
                        data-sd-square={lab.slide} {...frozen}
                        className={`${KNOB} ${L.markUnderSquare(lab) >= 0 ? 'border-emerald-600 bg-emerald-50/90' : 'border-amber-500 bg-amber-50/90'} ${fr('focus-visible:ring-amber-300')}`}
                        style={{ left: r[0], top: r[1], cursor: slideSt.dragging ? 'grabbing' : 'grab' }}>
                        <span aria-hidden="true" className="text-base">📐</span>
                      </div>
                    );
                  })()}
                </div>
              )}
              {/* les marques pointillées : toucher = piquer le compas sur ce rail */}
              {ghostRails.map((rail) => {
                if (L.canCarry(lab, rail) !== true) return null;
                // la vraie position est dessinée dans le SVG ; le bouton (44 px) est décalé de 18 px VERS L'EXTÉRIEUR
                // du rail, pour que les marques pointillées de part et d'autre de A (ou de B) ne se recouvrent pas
                const g0 = P(L.railPoint(lab, rail, L.ghostPos(lab, rail)));
                const g1 = P(L.railPoint(lab, rail, L.ghostPos(lab, rail) + 1));
                const len = Math.hypot(g1[0] - g0[0], g1[1] - g0[1]) || 1;
                const g = [g0[0] + ((g1[0] - g0[0]) / len) * 18, g0[1] + ((g1[1] - g0[1]) / len) * 18];
                return (
                  <button key={rail} type="button" onClick={() => carry(rail)} data-sd-ghost={rail} {...frozen}
                    aria-label={k('ghostLabel', { rail: railName(rail), n: lab.rails[rail].length + 1 })}
                    className={`${KNOB} border-dashed border-fuchsia-500 bg-fuchsia-50/40 text-fuchsia-700 ${fr('focus-visible:ring-fuchsia-300')}`}
                    style={{ left: g[0], top: g[1] }}>
                    <span aria-hidden="true" className="text-sm">✎</span>
                  </button>
                );
              })}
              {/* en متقدم : les deux bouts de la règle, chacun sur sa parallèle */}
              {ratio && step === 'ruler' && [['a', endA], ['b', endB]].map(([line, st]) => {
                const v = lab.ends[line];
                const pt = P(v == null ? (line === 'a' ? [0, 0] : [L.AB, 0]) : L.railPoint(lab, `${line}${v > 0 ? '+' : '-'}`, Math.abs(v)));
                return (
                  <div key={line} {...st.trackProps} {...st.handleProps({ label: k(`${gameScreen ? 'endHandleP' : 'endHandle'}.${line}`), valueText: v == null ? k('endNotSet') : k('endValue', { side: k(v > 0 ? 'up' : 'down'), n: L.markInfo(lab, line, v)?.rank ?? '?' }) })}
                    data-sd-end={line} {...frozen}
                    className={`${KNOB} ${v == null ? 'border-dashed border-slate-400 bg-white/70' : 'border-sky-700 bg-sky-50/90'} text-sky-800 ${fr('focus-visible:ring-sky-300')}`}
                    style={{ ...st.trackProps.style, left: pt[0], top: pt[1], ...(locked ? { pointerEvents: 'none' } : {}) }}>
                    {/* lecteur : les deux bouts de la règle portent leur NOM (F sur (d₁), E sur (d₂)) — les questions les nomment */}
                    <span aria-hidden="true" className="text-xs font-extrabold" dir="ltr" data-sd-end-name={gameScreen ? (line === 'a' ? 'F' : 'E') : undefined}>{gameScreen ? (line === 'a' ? 'F' : 'E') : (line === 'a' ? 'd₁' : 'd₂')}</span>
                  </div>
                );
              })}
            </div>

            {/* LES COMMANDES — juste sous la scène */}
            {(step === 'ray' || step === 'compass' || ratio) && (
              <div className="flex items-center gap-1.5" dir="ltr" data-sd-compass-row>
                <button type="button" onClick={() => openSt.nudge(-1)} aria-label={k('openLess')} data-sd-open-less {...frozen} className={`${BTN} border-slate-300 bg-white ${fr('focus-visible:ring-indigo-400')}`}><Minus className="h-4 w-4" aria-hidden="true" /></button>
                <CompassTrack st={openSt} value={lab.opening} range={openRange} label={k('openHandle')} valueText={k('openValue', { cm: L.cmText(lab.opening) })} elRef={openEl} locked={locked} player={gameScreen} />
                <button type="button" onClick={() => openSt.nudge(1)} aria-label={k('openMore')} data-sd-open-more {...frozen} className={`${BTN} border-slate-300 bg-white ${fr('focus-visible:ring-indigo-400')}`}><Plus className="h-4 w-4" aria-hidden="true" /></button>
              </div>
            )}
            {!gameScreen && joinRow}
            {!ratio && (step === 'slide' || step === 'done') && (
              <div className="flex flex-wrap items-center justify-center gap-1.5" data-sd-square-row>
                {step === 'slide' && (
                  <>
                    <div className="flex items-center gap-1.5" dir="ltr">
                      <button type="button" onClick={() => slideSt.set(L.neighbourMark(lab, -1))} aria-label={k('squarePrev')} data-sd-square-prev {...frozen} className={`${BTN} border-amber-300 bg-white ${fr('focus-visible:ring-amber-400')}`}><ChevronDown className="h-4 w-4" aria-hidden="true" /></button>
                      <button type="button" onClick={drawNow} data-sd-draw {...frozen} className={`${BTN} border-emerald-700 bg-emerald-700 text-white ${fr('focus-visible:ring-emerald-400')}`}>
                        <PencilLine className="h-4 w-4" aria-hidden="true" />{k('draw')}
                      </button>
                      <button type="button" onClick={() => slideSt.set(L.neighbourMark(lab, 1))} aria-label={k('squareNext')} data-sd-square-next {...frozen} className={`${BTN} border-amber-300 bg-white ${fr('focus-visible:ring-amber-400')}`}><ChevronUp className="h-4 w-4" aria-hidden="true" /></button>
                    </div>
                  </>
                )}
                {!gameScreen && freshBtn(false)}
              </div>
            )}
            {!gameScreen && rulerRow}

            {/* LA LECTURE, puis le verdict */}
            <p className="text-center text-xs font-bold text-slate-600" data-sd-reading>{reading}</p>
            {/* lecteur : le verdict est dans la COLONNE (la scène garde la hauteur) */}
            {!gameScreen && <p role="status" className={`min-h-[2.5rem] ${narrow ? 'text-xs' : 'text-sm'} font-bold leading-snug`} data-sd-verdict={verdictKind}>{verdict}</p>}
          </div>
          </div>

          {!gameScreen && (lab.trials.length > 0 || lab.joins.length > 0) && (
            <LabFold id="segment-divider.trials" title={k('trialsTitle')}>
              <ul className="space-y-0.5 text-xs" data-sd-trials={ratio ? lab.joins.length : lab.trials.length}>
                {ratio
                  ? lab.joins.map((j, i) => (
                    <li key={i} className={j.ok ? 'text-emerald-800' : 'text-rose-800'} data-ok={String(j.ok)}>
                      <MathText>{j.parallel ? k('rowParallel') : k(`row.${j.kind}`, { r: fracTex(j.ratio) })}</MathText>
                    </li>
                  ))
                  : lab.trials.map((tr, i) => (
                    <li key={i} className={tr.ok ? 'text-emerald-800' : 'text-rose-800'} data-ok={String(tr.ok)}>
                      <MathText>{k(`row.${tr.kind}`, { n: tr.n, r: tr.openings.map(L.cmText).join(' ، '), deg: tr.angle })}</MathText>
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

/* ── la jambe-crayon du compas : l'ouverture, tenue ── */
function CompassTrack({ st, value, range, label, valueText, elRef, locked = false, player = false }) {
  const f = (value - range.min) / (range.max - range.min);
  const wrap = useRef(null);
  const [tw, setTw] = useState(200);
  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return undefined;
    const m = () => setTw(Math.max(60, el.clientWidth));
    m();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(m);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const x0 = 22; const xp = 22 + f * (tw - 44); const xh = (x0 + xp) / 2;
  return (
    <div {...st.trackProps} ref={(el) => { st.trackProps.ref.current = el; wrap.current = el; if (elRef) elRef.current = el; }} className="relative h-12 min-w-[120px] flex-1 rounded-xl border-2 border-fuchsia-200 bg-fuchsia-50/50" style={{ ...st.trackProps.style, ...(locked ? { pointerEvents: 'none' } : {}) }} data-sd-open-track>
      <svg className="absolute inset-0 h-full w-full" aria-hidden="true" focusable="false">
        {/* le compas : la pointe (fixe) à gauche, le crayon suit l'ouverture */}
        <line x1={x0} y1="40" x2={xh} y2="7" stroke="#475569" strokeWidth="2.5" />
        <line x1={xh} y1="7" x2={xp} y2="40" stroke="#a21caf" strokeWidth="2.5" />
        <circle cx={xh} cy="7" r="3.5" fill="#334155" />
        <circle cx={x0} cy="40" r="2.5" fill="#334155" />
      </svg>
      <div {...st.handleProps({ label, valueText })} data-sd-open={value} aria-disabled={locked || undefined}
        className={`absolute top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-fuchsia-600 bg-white/90 outline-none focus-visible:ring-4 ${player ? ringP : 'focus-visible:ring-fuchsia-300'}`}
        style={{ left: `calc(22px + ${f} * (100% - 44px))`, cursor: st.dragging ? 'grabbing' : 'grab' }}>
        <span aria-hidden="true" className="text-base">✎</span>
      </div>
    </div>
  );
}

/* ── mode 'equal' : le rayon, les marques, la droite reliée, l'équerre, les parallèles, la banderole ── */
function EqualScene({ lab, P, W, H, step, reduce, named = false }) {
  const A = P([0, 0]); const B = P([L.AB, 0]);
  const marks = L.rayMarks(lab);
  const end = P(L.railPoint(lab, 'ray', L.railLength(lab)));
  const pj = lab.joined != null ? P(L.railPoint(lab, 'ray', marks[lab.joined].pos)) : null;
  const cuts = L.cutsOf(lab);
  const inside = [0, ...cuts.filter((c) => LIN.cmp(c.t, LIN.frac(1)) < 0).map((c) => LIN.toNumber(c.t)), 1].sort((a, b) => a - b);
  const sq = lab.joined != null && !L.complete(lab) && lab.slide != null ? L.setSquareAt(lab, lab.slide) : null;
  const frame = lab.joined != null ? L.setSquareFrame(lab) : null;
  const banner = 9;
  const ghost = step === 'ray' || step === 'compass' ? L.ghostPos(lab, 'ray') : null;
  const compassFrom = P(L.railPoint(lab, 'ray', L.lastPos(lab, 'ray')));
  const compassTo = ghost != null ? P(L.railPoint(lab, 'ray', ghost)) : null;
  const rpx = Math.hypot(B[0] - A[0], B[1] - A[1]) / L.AB; // px par mm
  return (
    <svg width={W} height={H} className="absolute inset-0" aria-hidden="true" focusable="false" style={{ direction: 'ltr' }}>
      {/* la banderole : des bandes entre les points de partage (les parts découpées par l'élève) */}
      {inside.slice(1).map((t, i) => {
        const x0 = A[0] + inside[i] * (B[0] - A[0]); const x1 = A[0] + t * (B[0] - A[0]);
        return <rect key={i} x={x0} y={A[1] + 2} width={Math.max(0, x1 - x0)} height={banner} fill={inside.length > 2 ? COLORS[i % 3] : '#e2e8f0'} stroke="#334155" strokeWidth="0.8" data-sd-band={i} />;
      })}
      {/* la règle et l'équerre */}
      {frame && sq && (
        <g data-sd-setsquare>
          <line x1={P(frame.ruler[0])[0]} y1={P(frame.ruler[0])[1]} x2={P(frame.ruler[1])[0]} y2={P(frame.ruler[1])[1]} stroke="#94a3b8" strokeWidth={Math.max(6, 7 * rpx)} strokeLinecap="round" opacity="0.7" />
          <polygon points={sq.tri.map((p) => P(p).join(',')).join(' ')} fill="rgba(245,158,11,0.25)" stroke="#b45309" strokeWidth="1.5" />
          <line x1={P(sq.V)[0]} y1={P(sq.V)[1]} x2={P(sq.C)[0]} y2={P(sq.C)[1]} stroke="#b45309" strokeWidth="1.5" strokeDasharray="5 4" />
          <circle cx={P(sq.C)[0]} cy={P(sq.C)[1]} r="3.5" fill="none" stroke="#b45309" strokeWidth="1.5" />
        </g>
      )}
      {/* [AB] */}
      <line x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
      {/* le rayon [Ax) */}
      <line x1={A[0]} y1={A[1]} x2={end[0]} y2={end[1]} stroke="#4f46e5" strokeWidth="1.8" />
      <text x={end[0] + 6} y={end[1] + 4} fontSize="13" fill="#4f46e5" fontWeight="700">x</text>
      {/* la droite reliée (P_n B) et les parallèles tracées */}
      {pj && <line x1={pj[0]} y1={pj[1]} x2={B[0]} y2={B[1]} stroke="#4f46e5" strokeWidth="2" data-sd-joined={lab.joined} />}
      {cuts.map((c) => {
        const r = P(L.railPoint(lab, 'ray', marks[c.idx].pos));
        const x = P([LIN.toNumber(c.t) * L.AB, 0]);
        const out = LIN.cmp(c.t, LIN.frac(1)) > 0;
        return (
          <g key={c.idx} data-sd-cut={c.idx} data-t={LIN.fracText(c.t)}>
            <line x1={r[0]} y1={r[1]} x2={x[0]} y2={x[1]} stroke={out ? '#e11d48' : '#059669'} strokeWidth="1.8" />
            <circle cx={x[0]} cy={x[1]} r="3.5" fill={out ? '#e11d48' : '#059669'} />
            {named && !out && <text x={x[0]} y={x[1] + 26} fontSize="13" fontWeight="800" fill="#065f46" textAnchor="middle" data-sd-cut-name>{`M${sub(c.idx + 1)}`}</text>}
          </g>
        );
      })}
      {/* le compas : la pointe sur la dernière marque, le crayon sur la marque pointillée */}
      {compassTo && (
        <g>
          <path d={arcPath(compassFrom, compassTo, 16)} fill="none" stroke="#a21caf" strokeWidth="1.4" />
          <line x1={compassFrom[0]} y1={compassFrom[1]} x2={(compassFrom[0] + compassTo[0]) / 2 - 6} y2={Math.min(compassFrom[1], compassTo[1]) - 16} stroke="#475569" strokeWidth="1.4" opacity="0.8" />
          <line x1={(compassFrom[0] + compassTo[0]) / 2 - 6} y1={Math.min(compassFrom[1], compassTo[1]) - 16} x2={compassTo[0]} y2={compassTo[1]} stroke="#a21caf" strokeWidth="1.4" opacity="0.8" />
        </g>
      )}
      {/* la marque pointillée : où tombera le prochain report */}
      {ghost != null && L.canCarry(lab, 'ray') === true && (() => { const gp = P(L.railPoint(lab, 'ray', ghost)); return <circle cx={gp[0]} cy={gp[1]} r="5" fill="none" stroke="#a21caf" strokeWidth="1.5" strokeDasharray="2 2" data-sd-ghost-mark="ray" />; })()}
      {/* les marques */}
      {marks.map((m, i) => {
        const p = P(L.railPoint(lab, 'ray', m.pos));
        const [dx, dy] = L.dirOf(lab.angle);
        const nx = -dy * 7; const ny = -dx * 7; // perpendiculaire (y écran vers le bas)
        const changed = i > 0 && m.r !== marks[i - 1].r;
        return (
          <g key={i} data-sd-mark={`ray:${i}`} data-pos={m.pos}>
            <line x1={p[0] - nx} y1={p[1] - ny} x2={p[0] + nx} y2={p[1] + ny} stroke={lab.joined === i ? '#4f46e5' : '#0f172a'} strokeWidth="2.2" />
            {/* lecteur, construction finie : les marques prennent leur NOM (P₁, P₂…) — les questions les nomment */}
            <text x={p[0] - 14 * Math.sin((lab.angle * Math.PI) / 180) - (named ? 16 : 4)} y={p[1] - 2} fontSize={named ? 13 : 11} fontWeight={named ? 800 : 700} fill={changed ? '#e11d48' : '#334155'}>{named ? `P${sub(i + 1)}` : i + 1}</text>
          </g>
        );
      })}
      <PointLabel at={A} name="A" dy={18} />
      <PointLabel at={B} name="B" dy={18} />
      {step === 'ray' && !reduce && <circle cx={end[0]} cy={end[1]} r="26" fill="none" stroke="#6366f1" strokeWidth="1" opacity="0.4" />}
    </svg>
  );
}

/* ── mode 'ratio' : (d₁) // (d₂), leurs graduations, la règle, les points ── */
function RatioScene({ lab, P, W, H, box, bad }) {
  const A = P([0, 0]); const B = P([L.AB, 0]);
  const len = L.railLength(lab);
  const ends = (o) => [P(L.railPoint(lab, `${o}-`, len)), P(L.railPoint(lab, `${o}+`, len))];
  const [a0, a1] = ends('a'); const [b0, b1] = ends('b');
  const left = P([box.x0, 0]); const right = P([box.x1, 0]);
  const { a, b } = lab.ends;
  const pa = a != null ? L.railPoint(lab, `a${a > 0 ? '+' : '-'}`, Math.abs(a)) : null;
  const pb = b != null ? L.railPoint(lab, `b${b > 0 ? '+' : '-'}`, Math.abs(b)) : null;
  let ruler = null; let live = null;
  if (pa && pb) {
    const d = [pb[0] - pa[0], pb[1] - pa[1]];
    const far = 20;
    ruler = [P([pa[0] - far * d[0], pa[1] - far * d[1]]), P([pb[0] + far * d[0], pb[1] + far * d[1]])];
    if (a !== b) live = P([(a / (a - b)) * L.AB, 0]);
  }
  const fnd = lab.joins.filter((j) => j.ok);
  // page : le ✗ du dernier point refusé ; lecteur (`bad`) : seulement celui de la règle POSÉE, jamais un ✗ ancien à côté d'un point trouvé
  const lastBad = bad === undefined ? [...lab.joins].reverse().find((j) => !j.ok && !j.parallel) : bad;
  const mIn = fnd.find((j) => j.inside);
  const tIn = mIn ? LIN.toNumber(mIn.t) : null;
  return (
    <svg width={W} height={H} className="absolute inset-0" aria-hidden="true" focusable="false" style={{ direction: 'ltr' }}>
      {/* la banderole [AB] : verte de A à M, blanche de M à B, une fois M trouvé */}
      {tIn != null ? (
        <>
          <rect x={A[0]} y={A[1] + 2} width={(B[0] - A[0]) * tIn} height="9" fill={COLORS[0]} stroke="#334155" strokeWidth="0.8" data-sd-band="0" />
          <rect x={A[0] + (B[0] - A[0]) * tIn} y={A[1] + 2} width={(B[0] - A[0]) * (1 - tIn)} height="9" fill={COLORS[1]} stroke="#334155" strokeWidth="0.8" data-sd-band="1" />
        </>
      ) : <rect x={A[0]} y={A[1] + 2} width={B[0] - A[0]} height="9" fill="#e2e8f0" stroke="#334155" strokeWidth="0.8" />}
      {/* la droite (AB) et le segment [AB] */}
      <line x1={left[0]} y1={left[1]} x2={right[0]} y2={right[1]} stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="4 4" />
      <line x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
      {/* (d₁) et (d₂) */}
      <line x1={a0[0]} y1={a0[1]} x2={a1[0]} y2={a1[1]} stroke="#4f46e5" strokeWidth="1.8" />
      <line x1={b0[0]} y1={b0[1]} x2={b1[0]} y2={b1[1]} stroke="#4f46e5" strokeWidth="1.8" />
      <text x={a1[0] + 5} y={a1[1] + 12} fontSize="12" fill="#4f46e5" fontWeight="700">(d₁)</text>
      <text x={b1[0] + 5} y={b1[1] + 12} fontSize="12" fill="#4f46e5" fontWeight="700">(d₂)</text>
      {/* les graduations */}
      {L.RAILS.ratio.map((rail) => lab.rails[rail].map((m, i) => {
        const p = P(L.railPoint(lab, rail, m.pos));
        const [dx, dy] = L.dirOf(lab.angle);
        const nx = -dy * 6; const ny = -dx * 6;
        const changed = i > 0 && m.r !== lab.rails[rail][i - 1].r;
        return (
          <g key={`${rail}${i}`} data-sd-mark={`${rail}:${i}`} data-pos={m.pos}>
            <line x1={p[0] - nx} y1={p[1] - ny} x2={p[0] + nx} y2={p[1] + ny} stroke={changed ? '#e11d48' : '#0f172a'} strokeWidth="2" />
          </g>
        );
      }))}
      {/* les marques pointillées : où tombera le prochain report sur chaque rail */}
      {L.RAILS.ratio.filter((rail) => L.canCarry(lab, rail) === true).map((rail) => {
        const gp = P(L.railPoint(lab, rail, L.ghostPos(lab, rail)));
        return <circle key={rail} cx={gp[0]} cy={gp[1]} r="4.5" fill="none" stroke="#a21caf" strokeWidth="1.4" strokeDasharray="2 2" data-sd-ghost-mark={rail} />;
      })}
      {/* la règle, et le point où elle coupe (AB) — sous le doigt */}
      {ruler && <line x1={ruler[0][0]} y1={ruler[0][1]} x2={ruler[1][0]} y2={ruler[1][1]} stroke="#0369a1" strokeWidth="1.8" data-sd-ruler />}
      {live && <circle cx={live[0]} cy={live[1]} r="4" fill="none" stroke="#0369a1" strokeWidth="2" data-sd-live />}
      {lastBad && (() => { const x = P([LIN.toNumber(lastBad.t) * L.AB, 0]); return <text x={x[0]} y={x[1] - 6} fontSize="12" fill="#e11d48" textAnchor="middle" fontWeight="700">✗</text>; })()}
      {fnd.map((j, i) => {
        const x = P([LIN.toNumber(j.t) * L.AB, 0]);
        return (
          <g key={i} data-sd-point={j.inside ? 'inside' : 'outside'}>
            <circle cx={x[0]} cy={x[1]} r="4.5" fill="#059669" />
            <text x={x[0]} y={x[1] - 9} fontSize="13" fontWeight="800" fill="#065f46" textAnchor="middle">{j.inside ? 'M' : 'N'}</text>
          </g>
        );
      })}
      <PointLabel at={A} name="A" dy={20} dx={-8} />
      <PointLabel at={B} name="B" dy={20} dx={8} />
    </svg>
  );
}

function PointLabel({ at, name, dx = 0, dy = 16 }) {
  return (
    <g>
      <circle cx={at[0]} cy={at[1]} r="3" fill="#0f172a" />
      <text x={at[0] + dx} y={at[1] + dy} fontSize="14" fontWeight="800" fill="#0f172a" textAnchor="middle">{name}</text>
    </g>
  );
}

/** Un petit arc de cercle centré en `c` passant par `p` (le trait du compas), ±`deg` degrés. */
function arcPath(c, p, deg) {
  const r = Math.hypot(p[0] - c[0], p[1] - c[1]);
  if (r < 1) return '';
  const a0 = Math.atan2(p[1] - c[1], p[0] - c[0]);
  const d = (deg * Math.PI) / 180;
  const q1 = [c[0] + r * Math.cos(a0 - d), c[1] + r * Math.sin(a0 - d)];
  const q2 = [c[0] + r * Math.cos(a0 + d), c[1] + r * Math.sin(a0 + d)];
  return `M${q1[0]} ${q1[1]} A${r} ${r} 0 0 1 ${q2[0]} ${q2[1]}`;
}

/** Le tambour des ultras : il bat au toucher. Décor seulement. */
function Drum() {
  const reduce = useReducedMotion();
  const [taps, setTaps] = useState(0);
  return (
    <button type="button" tabIndex={-1} aria-hidden="true" onClick={() => setTaps((n) => n + 1)} data-deco="tifo"
      className="absolute end-1 top-1 z-10 h-9 w-9 rounded-xl focus:outline-none">
      <svg viewBox="0 0 60 50" width="100%" height="100%">
        <style>{'.sd-d{transform-origin:30px 28px;animation:sd-d .35s ease-out 2}@keyframes sd-d{0%,100%{transform:scale(1)}50%{transform:scale(1.12)}}@media (prefers-reduced-motion: reduce){.sd-d{animation:none}}'}</style>
        <g key={taps} className={taps > 0 && !reduce ? 'sd-d' : undefined}>
          <ellipse cx="30" cy="18" rx="20" ry="7" fill="#f8fafc" stroke="#334155" strokeWidth="2" />
          <path d="M10 18 L10 36 Q30 46 50 36 L50 18" fill="#059669" stroke="#334155" strokeWidth="2" />
          <path d="M10 26 Q30 36 50 26" fill="none" stroke="#e11d48" strokeWidth="3" />
        </g>
        <line x1="44" y1="4" x2="34" y2="14" stroke="#7c2d12" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </button>
  );
}

/** Des confettis vert-blanc-rouge quand une construction réussit. Décor seulement. */
function Confetti({ w }) {
  const xs = [0.12, 0.25, 0.38, 0.5, 0.62, 0.75, 0.88];
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden="true" data-deco="confetti">
      <style>{'.sd-c{animation:sd-c 1.4s ease-in 1 forwards;opacity:0}@keyframes sd-c{0%{transform:translateY(0);opacity:1}100%{transform:translateY(90px);opacity:0}}@media (prefers-reduced-motion: reduce){.sd-c{animation:none}}'}</style>
      {xs.map((f, i) => (
        <rect key={i} className="sd-c" x={f * w} y={4 + (i % 3) * 6} width="6" height="9" rx="1" fill={COLORS[i % 3] === '#ffffff' ? '#cbd5e1' : COLORS[i % 3]} style={{ animationDelay: `${i * 0.08}s` }} />
      ))}
    </svg>
  );
}

/* ── la découverte et la règle : les mêmes pour la fin du labo et pour la dernière question ── */
export function discoveryOptionsOf(lab, k) {
  const ratio = lab.mode === 'ratio';
  const target = ratio ? `\\dfrac{${lab.p}}{${lab.q}}` : '';
  const fracTex = (f) => LIN.fracLatex(f);
    if (ratio) {
      const miss = lab.joins.find((j) => !j.ok && !j.parallel && !(lab.sameUnitOnly && j.kind === 'units'));
      return [
        { text: <MathText>{k('dOptOne')}</MathText>, why: <MathText>{k('dWhyOne')}</MathText> },
        { text: <MathText>{k('dOptTwo')}</MathText>, correct: true },
        { text: <MathText>{k('dOptMany')}</MathText>, why: <MathText>{miss ? k('dWhyManyWitness', { r: fracTex(miss.ratio), target }) : k('dWhyMany', { target })}</MathText> },
      ];
    }
    const ok = lab.trials.find((tr) => tr.ok) ?? lab.trials[0];
    const r = ok ? L.cmText(ok.openings[0]) : '';
    const share = L.lengthTex(lab, LIN.frac(1, lab.parts));
    return [
      { text: <MathText>{k('dOptOpening')}</MathText>, why: <MathText>{k('dWhyOpening', { r, share, n: lab.parts })}</MathText> },
      { text: <MathText>{k('dOptRight', { n: lab.parts })}</MathText>, correct: true },
      { text: <MathText>{k('dOptFewer')}</MathText>, why: <MathText>{k('dWhyFewer', { n: lab.parts })}</MathText> },
    ];
}

export function formalOf(lab, k) {
  const ratio = lab.mode === 'ratio';
  const target = ratio ? `\\dfrac{${lab.p}}{${lab.q}}` : '';
  const fracTex = (f) => LIN.fracLatex(f);
  return ratio ? (
    <div className="space-y-2" data-sd-formal>
      <EquationDisplay tone="result" tex={`\\dfrac{MA}{MB} = \\dfrac{AF}{BE} = ${target}`} />
      <EquationDisplay tone="result" tex={`\\dfrac{AM}{AB} = \\dfrac{${lab.p}}{${lab.p} + ${lab.q}} = ${fracTex(LIN.frac(lab.p, lab.p + lab.q))}`} note={k('fInside')} />
      {lab.p !== lab.q && <EquationDisplay tone="result" tex={`\\dfrac{AN}{AB} = \\dfrac{${lab.p}}{|${lab.p} - ${lab.q}|} = ${fracTex(LIN.frac(lab.p, Math.abs(lab.p - lab.q)))}`} note={k('fOutside')} />}
      <p className="text-sm text-emerald-900"><MathText>{k('fRuleRatio')}</MathText></p>
    </div>
  ) : (
    <div className="space-y-2" data-sd-formal>
      <EquationDisplay tone="result" tex={`\\dfrac{AM_1}{AB} = \\dfrac{AP_1}{AP_{${lab.parts}}} = \\dfrac{1}{${lab.parts}}`} />
      <p className="text-sm text-emerald-900"><MathText>{k('fRuleEqual', { n: lab.parts })}</MathText></p>
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite de chaque étape. equal : les marques → quelle marque relier, pourquoi la même ouverture ; la 1re construction juste → la longueur d'une part,
 *  pourquoi elles sont égales ; le contraste → la cause de l'écart (ou l'invariance), puis la règle. ratio : un 1er point → la nature de M, où il tombe ;
 *  les deux points → AM/AB, puis la règle. */
export const chainOf = (step, mode) => {
  if (mode === 'ratio') return step === 'one' ? ['ratioRead', 'whereM'] : ['tIn', 'rule'];
  if (step === 'marks') return ['joinWhich', 'whyEven'];
  return step === 'built' ? ['partLen', 'whyEqual'] : ['contrast', 'rule'];
};

const cm = (mm) => L.cmText(mm).replace(',', '{,}');
const fracEq = (a, b) => LIN.eq(a, b);
const fracOpt = (right, cands, k, key, o) => [
  { text: <MathText>{$(LIN.fracLatex(right))}</MathText>, correct: true },
  ...distinct(right, cands, 2, fracEq).map((c) => ({ text: <MathText>{$(LIN.fracLatex(c.v))}</MathText>, why: Mx(k, `${key}.${c.why}`, { ...o, shown: $(LIN.fracLatex(c.v)) }) })),
];

const RAW_QUESTIONS = {
  /* equal — étape « marques » : quelle marque relier à B, et pourquoi l'ouverture reste la même */
  joinWhich: (lab, step, k) => {
    const n = lab.parts;
    const o = { n, n1: n + 1, nm: n - 1, r: cm(lab.opening) };
    return {
      id: 'joinWhich', kind: 'choice',
      prompt: Mx(k, 'joinWhich.prompt', o),
      options: [
        { text: Mx(k, 'joinWhich.opt', { x: n }), correct: true },
        { text: Mx(k, 'joinWhich.opt', { x: n + 1 }), why: Mx(k, 'joinWhich.whyMore', o) },
        { text: Mx(k, 'joinWhich.opt', { x: Math.max(1, n - 1) }), why: Mx(k, 'joinWhich.whyLess', o) },
      ],
      hints: [Mx(k, 'joinWhich.hint1', o), Mx(k, 'joinWhich.hint2', o)],
      explain: Mx(k, 'joinWhich.explain', o),
    };
  },
  whyEven: (lab, step, k) => {
    const o = { n: lab.parts, r: cm(lab.opening) };
    return {
      id: 'whyEven', kind: 'choice',
      prompt: Mx(k, 'whyEven.prompt', o),
      options: [
        { text: Mx(k, 'whyEven.right', o), correct: true },
        { text: Mx(k, 'whyEven.square', o), why: Mx(k, 'whyEven.whySquare', o) },
        { text: Mx(k, 'whyEven.reachB', o), why: Mx(k, 'whyEven.whyReachB', o) },
      ],
      hints: [Mx(k, 'whyEven.hint1', o), Mx(k, 'whyEven.hint2', o)],
      explain: Mx(k, 'whyEven.explain', o),
    };
  },
  /* equal — étape « construction juste » : la longueur d'une part, puis la raison de l'égalité */
  partLen: (lab, step, k) => {
    const n = lab.parts; const tr = lab.trials.find((x) => x.ok);
    const r = cm(tr.openings[0]);
    const tx = (f) => L.lengthTex(lab, f);
    const o = { n, len: lab.length, r, part: $(tx(LIN.frac(1, n))) };
    const cands = [
      { key: 'whyOpening', tex: r }, { key: 'whyFewer', tex: tx(LIN.frac(1, Math.max(1, n - 1))) }, { key: 'whyMore', tex: tx(LIN.frac(1, n + 1)) },
    ];
    const right = tx(LIN.frac(1, n));
    const ds = cands.filter((c, i) => c.tex !== right && cands.findIndex((d) => d.tex === c.tex) === i).slice(0, 2);
    return {
      id: 'partLen', kind: 'choice', cols: 3,
      prompt: Mx(k, 'partLen.prompt', o),
      options: [
        { text: <MathText>{`$${right}$ ${k('cp.unit')}`}</MathText>, correct: true },
        ...ds.map((d) => ({ text: <MathText>{`$${d.tex}$ ${k('cp.unit')}`}</MathText>, why: Mx(k, `partLen.${d.key}`, { ...o, shown: $(d.tex) }) })),
      ],
      hints: [Mx(k, 'partLen.hint1', o), Mx(k, 'partLen.hint2', o)],
      explain: Mx(k, 'partLen.explain', o),
    };
  },
  whyEqual: (lab, step, k) => {
    const tr = lab.trials.find((x) => x.ok);
    const o = { n: lab.parts, deg: tr.angle, r: cm(tr.openings[0]) };
    return {
      id: 'whyEqual', kind: 'choice',
      prompt: Mx(k, 'whyEqual.prompt', o),
      options: [
        { text: Mx(k, 'whyEqual.right', o), correct: true },
        { text: Mx(k, 'whyEqual.lengths', o), why: Mx(k, 'whyEqual.whyLengths', o) },
        { text: Mx(k, 'whyEqual.angle', o), why: Mx(k, 'whyEqual.whyAngle', o) },
      ],
      hints: [Mx(k, 'whyEqual.hint1', o), Mx(k, 'whyEqual.hint2', o)],
      explain: Mx(k, 'whyEqual.explain', o),
    };
  },
  /* equal — étape « contraste » : l'écart d'un essai raté, ou ce qui ne bouge pas entre deux essais justes */
  contrast: (lab, step, k) => {
    const bad = lab.trials.find((x) => !x.ok);
    const good = lab.trials.find((x) => x.ok);
    const n = lab.parts;
    const o = { n, got: bad?.n, r: cm(good.openings[0]) };
    const kind = !bad ? 'same' : bad.kind;   // 'count' | 'unequal' | 'same'
    return {
      id: 'contrast', kind: 'choice',
      prompt: Mx(k, `contrast.${kind}.prompt`, o),
      options: [
        { text: Mx(k, `contrast.${kind}.right`, o), correct: true },
        { text: Mx(k, `contrast.${kind}.a`, o), why: Mx(k, `contrast.${kind}.whyA`, o) },
        { text: Mx(k, `contrast.${kind}.b`, o), why: Mx(k, `contrast.${kind}.whyB`, o) },
      ],
      hints: [Mx(k, `contrast.${kind}.hint1`, o), Mx(k, `contrast.${kind}.hint2`, o)],
      explain: Mx(k, `contrast.${kind}.explain`, o),
    };
  },
  /* ratio — étape « un 1er point juste » : MA/MB lu sur les rangs, puis la place du point */
  ratioRead: (lab, step, k) => {
    const j = lab.joins.find((x) => x.ok);
    const ra = j.rankA; const rb = j.rankB;
    const o = { ra, rb, p: lab.p, q: lab.q, target: $(`\\dfrac{${lab.p}}{${lab.q}}`) };
    return {
      id: 'ratioRead', kind: 'choice', cols: 3,
      prompt: Mx(k, 'ratioRead.prompt', o),
      options: fracOpt(j.ratio, [
        { v: LIN.frac(rb, ra), why: 'whyInverse' }, { v: LIN.frac(ra, ra + rb), why: 'whyWhole' }, { v: LIN.frac(ra - rb === 0 ? 1 : Math.abs(ra - rb), 1), why: 'whyDiff' },
      ], k, 'ratioRead', o),
      hints: [Mx(k, 'ratioRead.hint1', o), Mx(k, 'ratioRead.hint2', o)],
      explain: Mx(k, 'ratioRead.explain', o),
    };
  },
  whereM: (lab, step, k) => {
    const j = lab.joins.find((x) => x.ok);
    const o = { ra: j.rankA, rb: j.rankB };
    const kind = j.inside ? 'inside' : 'outside';
    const other = j.inside ? 'outside' : 'inside';
    return {
      id: 'whereM', kind: 'choice',
      prompt: Mx(k, 'whereM.prompt', o),
      options: [
        { text: Mx(k, `whereM.${kind}`, o), correct: true },
        { text: Mx(k, `whereM.${other}`, o), why: Mx(k, `whereM.why_${other}`, o) },
        { text: Mx(k, 'whereM.unknown', o), why: Mx(k, 'whereM.whyUnknown', o) },
      ],
      hints: [Mx(k, 'whereM.hint1', o), Mx(k, 'whereM.hint2', o)],
      explain: Mx(k, `whereM.explain_${kind}`, o),
    };
  },
  /* ratio — étape « les deux points » : AM/AB du point intérieur */
  tIn: (lab, step, k) => {
    const j = lab.joins.find((x) => x.kind === 'inside');
    const { p, q } = lab;
    const o = { p, q, target: $(`\\dfrac{${p}}{${q}}`), sum: p + q };
    return {
      id: 'tIn', kind: 'choice', cols: 3,
      prompt: Mx(k, 'tIn.prompt', o),
      options: fracOpt(j.t, [
        { v: LIN.frac(p, q), why: 'whyRatio' }, { v: LIN.frac(q, p + q), why: 'whyOther' }, ...(p !== q ? [{ v: LIN.frac(p, Math.abs(p - q)), why: 'whyOutside' }] : []),
      ], k, 'tIn', o),
      hints: [Mx(k, 'tIn.hint1', o), Mx(k, 'tIn.hint2', o)],
      explain: Mx(k, 'tIn.explain', { ...o, calc: $(`\\dfrac{AM}{AB} = \\dfrac{${p}}{${p} + ${q}} = ${LIN.fracLatex(j.t)}`) }),
    };
  },
  rule: (lab, step, k) => ({
    id: 'rule', kind: 'choice',
    prompt: <MathText>{k(lab.mode === 'ratio' ? 'dPromptRatio' : 'dPromptEqual', { target: lab.mode === 'ratio' ? `\\dfrac{${lab.p}}{${lab.q}}` : '' })}</MathText>,
    options: discoveryOptionsOf(lab, k),
    // les indices de la règle parlent du mode du labo (2026-11-10 : en mode « equal » ils parlaient des deux points du mode « ratio »)
    hints: lab.mode === 'ratio' ? [Mx(k, 'rule.hint1'), Mx(k, 'rule.hint2')] : [Mx(k, 'ruleEqual.hint1'), Mx(k, 'ruleEqual.hint2')],
    explain: formalOf(lab, k),
  }),
};

export const QUESTIONS = spreadAll(RAW_QUESTIONS, (lab) => (lab.parts ?? 0) + (lab.p ?? 0) * 7 + (lab.q ?? 0));

/* ══════════════ Lecteur de mission : les suites des manches (rollout 2026-11-10, conseil du 2026-11-10, verdict L3) ══════════════ */

/**
 * Les suites du lecteur, par mode puis par nom : chacune { id, reached(lab), qs } — l'id est le point d'étape de la manche (`{ checkpoint: id }`),
 * posé quand ce qu'il interroge est là, dans l'ordre de la liste. Voir l'en-tête « LECTEUR DE MISSION ».
 */
const firstOkTrial = (lab) => lab.trials.some((x) => x.ok);
const firstOkJoin = (lab) => lab.joins.some((j) => j.ok);
export const CHAINS_PLAYER = Object.freeze({
  equal: Object.freeze({
    full: [{ id: 'rule', reached: firstOkTrial, qs: ['apFill', 'apBuild', 'rule'] }],
    build: [{ id: 'build', reached: firstOkTrial, qs: ['apBuild'] }],
    none: [],
  }),
  ratio: Object.freeze({
    full: [{ id: 'ranks', reached: firstOkJoin, qs: ['ranksFill', 'maBuild'] }, { id: 'rule', reached: L.discoveryReady, qs: ['tIn', 'rule'] }],
    build: [{ id: 'build', reached: firstOkJoin, qs: ['maBuild'] }],
    none: [],
  }),
});
export const chainsOfPlayer = (mode, name) => CHAINS_PLAYER[mode === 'ratio' ? 'ratio' : 'equal'][name] ?? [];

/** Une liste qui tourne avec les nombres : la bonne pastille / le leurre ne tient jamais toujours la même place. */
const spinList = (xs, seed) => { const s0 = ((seed % xs.length) + xs.length) % xs.length; return xs.map((_, i) => xs[(i + s0) % xs.length]); };

Object.assign(QUESTIONS, {
  /* equal — la 1re construction juste : combien de fois AP₁ dans AP_n ? (pastilles n − 1, n, n + 1) */
  apFill: (lab, step, k) => {
    const n = lab.parts;
    const o = { n, pn: $(`AP_{${n}}`), p1: $('AP_1') };
    return {
      id: 'apFill', kind: 'fill', prompt: Mx(k, 'apFill.prompt', o),
      fields: [{ label: <MathText>{$(`AP_{${n}} = \\square \\times AP_1`)}</MathText>, expected: String(n), options: spinList([n - 1, n, n + 1].map(String), n + 1) }],
      hints: [Mx(k, 'apFill.hint1', o), Mx(k, 'apFill.hint2', o)], explain: Mx(k, 'apFill.explain', { ...o, eq: $(`AP_{${n}} = ${n} \\times AP_1`) }),
    };
  },
  /* equal — BÂTIR « AM_k/AB = AP_k/AP_n » : AM_k/AB déjà posé à gauche ; AP_k, AP_n et le leurre P_kP_n (le couple partie / partie) */
  apBuild: (lab, step, k) => {
    const n = lab.parts; const r = buildRank(n);
    const am = `AM${sub(r)}`; const apk = `AP${sub(r)}`; const apn = `AP${sub(n)}`; const decoy = `P${sub(r)}P${sub(n)}`;
    const o = { mk: $(`M_{${r}}`), pk: $(`P_{${r}}`), pn: $(`P_{${n}}`), eq: $(`\\dfrac{AM_{${r}}}{AB} = \\dfrac{AP_{${r}}}{AP_{${n}}} = \\dfrac{${r}}{${n}}`) };
    return {
      id: 'apBuild', kind: 'build', prompt: Mx(k, 'apBuild.prompt', o),
      slots: [k('cp.build.slotPart'), k('cp.build.slotWhole'), k('cp.build.slotPart'), k('cp.build.slotWhole')],
      ops: ['/', '=', '/'],
      tiles: [am, 'AB', ...spinList([apk, apn, decoy], n)], preset: [am, 'AB', null, null],
      expected: [am, 'AB', apk, apn], accept: [[apk, apn, am, 'AB']],
      hints: [Mx(k, 'apBuild.hint1', o), Mx(k, 'apBuild.hint2', o)], explain: Mx(k, 'apBuild.explain', o),
    };
  },
  /* ratio — le 1er point juste : sur combien de graduations sont posés les deux bouts de la règle ? (AF sur (d₁), BE sur (d₂)) */
  ranksFill: (lab, step, k) => {
    const j = lab.joins.find((x) => x.ok);
    const opts = Array.from({ length: lab.cap }, (_, i) => String(i + 1));
    return {
      id: 'ranksFill', kind: 'fill', prompt: Mx(k, 'ranksFill.prompt'),
      fields: [
        { label: k('cp.ranksFill.af'), expected: String(j.rankA), options: opts },
        { label: k('cp.ranksFill.be'), expected: String(j.rankB), options: opts },
      ],
      hints: [Mx(k, 'ranksFill.hint1'), Mx(k, 'ranksFill.hint2')], explain: Mx(k, 'ranksFill.explain', { ra: j.rankA, rb: j.rankB }),
    };
  },
  /* ratio — BÂTIR « AF/BE = MA/MB » : AF/BE déjà posé à gauche ; MA, MB et le leurre AB (la partie sur le tout) */
  maBuild: (lab, step, k) => {
    const j = lab.joins.find((x) => x.ok);
    const pt = j.inside ? 'M' : 'N';
    const o = { pt, tri: `${pt}AF`, tri2: `${pt}BE`, eq: $(`\\dfrac{AF}{BE} = \\dfrac{${pt}A}{${pt}B}`) };
    return {
      id: 'maBuild', kind: 'build', prompt: Mx(k, 'maBuild.prompt', o),
      slots: [k('cp.build.slotOnD1'), k('cp.build.slotOnD2'), k('cp.build.slotFromA'), k('cp.build.slotFromB')],
      ops: ['/', '=', '/'],
      tiles: ['AF', 'BE', ...spinList([`${pt}A`, `${pt}B`, 'AB'], lab.p * 2 + lab.q)], preset: ['AF', 'BE', null, null],
      expected: ['AF', 'BE', `${pt}A`, `${pt}B`], accept: [[`${pt}A`, `${pt}B`, 'AF', 'BE']],
      hints: [Mx(k, 'maBuild.hint1', o), Mx(k, 'maBuild.hint2', o)], explain: Mx(k, 'maBuild.explain', o),
    };
  },
});
