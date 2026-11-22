import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Minus, Plus, Lock, Unlock } from 'lucide-react';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import useStretchInteraction from '../useStretchInteraction';
import useDragInteraction from '../useDragInteraction';
import DraggableObject from '../primitives/DraggableObject';
import DropZone from '../primitives/DropZone';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { useLabCoach } from '../primitives/LabCoach';
import PredictTray from '../primitives/PredictTray';
import { useInMissionPlayer, useMissionArea } from '../../mission/missionPlayerContext';
import { playSfx } from '../../utils/playEffect';
import { reduce as reducePoly, mulTerms, termsTex, termTex, expand } from '@smarter-academy/core/arithmetic/polynomials.js';
import EquationDisplay from '../primitives/EquationDisplay';
import MathText from '../../components/MathText';
import { bidi } from '../../../../utils/bidi';
import * as L from '../logic/turfFactoring';

/**
 * turf-factoring — LE TERRAIN EN GAZON (unité 3 « الحساب الحرفي », leçon 3 et synthèse).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. rows : l'élève ÉTIRE r, le nombre de rangées identiques du terrain.
 *    square : il PORTE chaque bande de gazon à droite ou en bas du carré x²,
 *    puis ferme le terrain. Clavier / toucher-toucher / −,+ font les mêmes gestes.
 * B. Idée : analyser, c'est écrire une somme comme l'aire d'UN rectangle —
 *    ka + kb = k(a + b) (les rangées) ; a² + 2ab + b² = (a + b)² (le carré).
 * C. rows : les plaques se redistribuent en r rangées pendant le geste ; les
 *    restes tombent hors du terrain. square : le coin réclame p × q carreaux.
 * D. L'égalité lue sur les côtés du terrain : 6x² + 4x = 2x(3x + 2) ;
 *    x² + 6x + 9 = (x + 3)² — ou le refus, nombres à l'appui.
 * E. À découvrir : le facteur commun est le plus grand nombre de rangées
 *    identiques (le PGCD des coefficients, comme au chapitre 1) ; une somme
 *    a² + 2ab + b² ferme un CARRÉ — et x² + 25 ne ferme rien.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        تحليل : une somme devient l'aire d'un rectangle, ses côtés sont les facteurs
 *   OBJECT         des plaques de gazon (x², x, 1) à assembler en terrain
 *   VARIABLE       rows : r ; square : la répartition des bandes (p à droite, q en bas)
 *   INVARIANT      les plaques (donc la somme) ne changent jamais
 *   TRANSFORMATION la forme du terrain, et les deux côtés qu'on lit
 *   CONSTRAINT     rangées identiques ; coin exactement rempli
 *   RESISTANCE     « 4 شرائط لا تتوزّع على 3 صفوف » ; « الركن يحتاج 8 مربّعات صغيرة ولديك 9 »
 *   EVIDENCE       le terrain fermé, ses côtés écrits
 *   CONTRAST       un r juste et un r refusé ; une répartition refusée et le carré fermé
 *   PREDICTION     combien de rangées au plus ? où poser les bandes ?
 *   DISCOVERY      ka + kb = k(a + b) ; a² + 2ab + b² = (a + b)²
 *   FORMALIZATION  معارف 3 (p. 34) ; طرائق (p. 35–36)
 *   TRANSFER       تمارين 20–33 ; QCM 4–6, 9–12
 *
 * QUESTIONS PENDANT LE LABO (prototype `primitives/LabCheckpoint`, déploiement lot 2, 2026-10-28) : le labo n'a pas de tâches successives (une seule
 * scène libre par instance) ; quand la découverte est atteinte, une suite unique se pose PAR-DESSUS le labo et retient la règle (`chainOf`) :
 * rows — le plus grand r juste · ce qui est resté dehors pour SON r refusé · la bonne écriture du facteur commun (mauvaises options = les erreurs
 * réelles : le terme qui « disparaît », le diviseur oublié, le facteur incomplet) · LA RÈGLE ; square fermable — le coin de SA tentative refusée ·
 * les bandes par côté · les côtés du carré · LA RÈGLE ; square non fermable (x² + 25) — les carreaux restés dehors · pourquoi · LA RÈGLE.
 * La suite qui finit par la règle remplace la découverte automatique (`onDone` : discover + formalize). Obligatoires pour tout élève ;
 * l'enseignant seul les coupe pour SON compte (`checkpoints` = false les coupe aussi). `onCheckpoint(ev)` : `{ tk: 'checkpoint' | 'checkpoint-done',
 * id: cpId(mode, nums), … }`. ÉTAPES `LabStepper` (`[data-tf-step=<i>]`) + fête ; « إعادة » repart de zéro ; « أعِد التجربة » remet le terrain au départ.
 * SON : `tooth` (r bougé, bande posée), `bell` (un r juste), `flag` (le plus grand r juste, le terrain fermé), `over` (reste dehors, refus).
 *
 * DÉCOR : bandes de tonte sur les plaques, lignes blanches du terrain fermé,
 * `aria-hidden`, immobile sous prefers-reduced-motion.
 */
/*
 * LECTEUR DE MISSION (rollout 2026-11-11, unité 3 leçon 3 `tahlil-ibara` ; conseil du 2026-11-11, verdict « L3 ») : joué en MANCHES (LabRounds).
 * Tout ce qui suit est gardé par `useInMissionPlayer()` ; hors lecteur (page, enseignant, mode classe) le labo est INCHANGÉ.
 *   - Un ESSAI est un r NOUVEAU validé (rows) ou une répartition NOUVELLE fermée (square) : `onVerdict { groups, exact, free? }` (`logic › verdictOf` :
 *     rows → r, toutes les plaques rangées ; square → les bandes à droite, le terrain fermé) ; r = 1 n'est pas un essai ; le même r (la même
 *     répartition) deux fois RÉ-ANNONCE son verdict sans le recompter ; le PREMIER refus de la manche est `free`. La découverte du labo
 *     (`rowsDiscoveryReady` / `squareDiscoveryReady`) est annoncée une fois (`{ tk: 'discovered' }`). « جرّب كل الإمكانيات » est CACHÉ (verdict X1) ;
 *     les indices aussi (le guide les remplace).
 *   - Le verdict ne montre ni l'égalité ni la hauteur du terrain tant qu'une question de la manche les demande (la construction serait une copie) :
 *     la puce de hauteur dit « ? », la lecture du coin est cachée.
 *   - `chains` : rows 'build' (au plus grand r : « في كل صفّ: ▢ » puis BÂTIR « ka + kb = ▢(▢ + ▢) », leurre = le dernier terme NON divisé), 'full'
 *     (« ارتفاع الملعب كاملًا = ▢ », BÂTIR, la RÈGLE dont la bonne option donne la raison du pavage) ; square 'full' (le coin de SA répartition
 *     refusée, BÂTIR « (▢ + ▢)² », leurre c, la règle ; sans bande : les carreaux dehors, pourquoi, la règle) ; 'none'.
 *   - `predict` : des CLÉS (≤ 2) — rows 'rowHeight', 'maxRows' ; square 'sideStrips', 'closes' — posées AVANT le premier geste ; options et vérité
 *     de la logique (`predictOptions`, `predictTruth`), jugées par le terrain (`judgedPredictions`), chaque résultat montré et entendu une fois.
 *   - `choices` : des labos au choix (manche libre) [{ mode:'rows', expr } | { mode:'square', b, c }].
 *   Journal « 📋 جدول تجاربك » et verdict dans la colonne, une région vivante TOUJOURS montée dans la scène (une clé par geste) ; commandes figées
 *   pendant une prédiction ou une question (`aria-disabled` + garde) ; toujours guidé ; pas de fête ; `LabCoach` (`logic › coachOf`) ;
 *   `{ tk: 'reset' }` à chaque « إعادة », `{ tk: 'retry' }`. AUCUN défilement : le terrain est UN bloc `data-paging-keep` mis à l'échelle par la
 *   largeur de la scène ET la hauteur de la zone du lecteur (`logic › rowsBox`), sans `overflow-x-auto`.
 */
/** Lecteur : au plus PRED_MAX prédictions par manche. */
const PRED_MAX = 2;
/** Le temps pendant lequel un résultat de prédiction reste seul à l'écran avant la question de la manche. */
export const PRED_HOLD_MS = 1600;
const ringP = 'focus-visible:ring-indigo-600 focus-visible:ring-offset-2';
/** Lecteur : ce que la zone du lecteur porte EN PLUS du labo (le chemin des manches, la ligne du but, les marges). */
const PLAYER_CHROME = 150;

/** L'identifiant de la suite de questions d'un terrain : ce que `onCheckpoint` rapporte (`id`) et que les étapes du module relisent. */
export const cpId = (mode, nums) => (mode === 'rows' ? `rows:${nums.expr}` : `square:${nums.b}:${nums.c}`);

const XU = L.XU; // la longueur « x » dessinée : non entière, pour qu'une bande ne passe jamais pour 4 carreaux

export default function TurfFactoring({
  mode: mode0 = 'rows', expr: expr0 = '6x^2+4x', b: b0 = 6, c: c0 = 9, showNeed = true, title, lead, mission, level, levels: withLevels = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onFinished, onTrial, onCheckpoint,
  coach: coachOn = true,
  // ── LECTEUR DE MISSION (rollout 2026-11-11, traitement v2) ──
  onVerdict, chains: chainsMode = 'none', predict: predictList = [], choices,
}) {
  const { t } = useTranslation('lesson');
  const gameScreen = useInMissionPlayer();
  const uid = useId();
  const k = useCallback((key, o) => t(`manipulation.turfFactoring.${key}`, o), [t]);
  const base0 = mode0 === 'rows' ? { expr: expr0 } : { b: b0, c: c0 };
  // lecteur : le mode voyage avec les nombres (la manche libre passe des rangées au carré) ; la page garde ses nombres d'avant
  const initialNumbers = gameScreen ? { ...base0, mode: mode0 } : base0;
  const state = useManipulation({ type: 'turf-factoring', initialNumbers, initialMode, initialLevel: level, withLevels: withLevels && mode0 === 'rows', hintCount: 3 });
  const nums = state.numbers;
  const mode = nums.mode ?? mode0;
  const make = () => (mode === 'rows' ? L.initRows({ expr: nums.expr }) : L.initSquare({ b: nums.b, c: nums.c }));

  const [labState, setLab] = useState(make);
  // the lab of THIS render: on a scene change (another choice of the free round, possibly another MODE) it is the fresh one at once — the
  // rest of the render never reads a rows lab with mode 'square' (walk 2026-11-11)
  let lab = labState;
  const sceneKey = `${mode}:${JSON.stringify(nums)}:${state.epoch}:${state.resetCount}`;
  const [scene, setScene] = useState({ key: sceneKey, inits: 0 });
  const [live, setLive] = useState(null);
  const [notice, setNotice] = useState(null);
  // lecteur : les suites finies, les prédictions (clé → juste ?), celles posées, les résultats montrés, le dernier essai (une clé par geste)
  const [doneIds, setDoneIds] = useState([]);
  const [preds, setPreds] = useState({});
  const asked = useRef(new Set());
  const [missionBig, setMissionBig] = useState(false);
  const refusedSeen = useRef(0);
  const discoveredSent = useRef(false);
  const heardPred = useRef(new Set());
  const [shownPreds, setShownPreds] = useState([]);
  const [predHold, setPredHold] = useState(false);
  const holdTimer = useRef(null);
  const [choiceSaid, setChoiceSaid] = useState(null);
  const [gesture, setGesture] = useState(0);
  // « إعادة » (resetCount), un autre niveau ou d'autres nombres : TOUT recommence — le terrain, les essais et les questions du labo
  if (scene.key !== sceneKey) {
    lab = make();
    setScene({ key: sceneKey, inits: scene.inits + 1 }); setLab(lab); setLive(null); setNotice(null);
    setDoneIds([]); setPreds({}); asked.current = new Set(); refusedSeen.current = 0; discoveredSent.current = false;
    heardPred.current = new Set(); setShownPreds([]); setPredHold(false);
  }
  // la manche (LabRounds) repart de zéro avec la scène : ses essais et prédictions d'avant ne comptent plus
  useEffect(() => { if (gameScreen && scene.inits > 0) state.report(onTrial, { tk: 'reset' }); }, [scene.inits]); // eslint-disable-line react-hooks/exhaustive-deps

  const ready = mode === 'rows' ? L.rowsDiscoveryReady(lab) : L.squareDiscoveryReady(lab);
  const noSquare = mode === 'square' && !L.closable(lab);
  // les questions pendant le labo : une suite unique quand la découverte est atteinte ; celle qui finit par la règle remplace la découverte automatique
  const cpSettings = useLabCheckpointSettings('turf-factoring');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const cpLive = cpOn && cpSettings.enabled;
  // ── le lecteur : les suites de la manche (CHAINS_PLAYER), posées quand ce qu'elles interrogent est là, après les résultats des prédictions ──
  const playerChains = gameScreen ? chainsOfPlayer(mode, chainsMode, lab) : [];
  const predKeys = gameScreen ? predictList.filter((key) => L.PREDICT_KEYS[mode]?.includes(key)).slice(0, PRED_MAX) : [];
  const judgedPreds = gameScreen ? L.judgedPredictions(lab, predKeys.filter((key) => key in preds), ready) : [];
  const pendingPreds = judgedPreds.filter((key) => !heardPred.current.has(key));
  const holdChain = pendingPreds.length > 0 || predHold;
  const playerPending = gameScreen && cpLive && !holdChain ? playerChains.find((c) => c.reached(lab) && !doneIds.includes(c.id)) ?? null : null;
  const chain = gameScreen ? null : (cpLive ? chainOf(mode, noSquare) : null);
  const cp = useLabCheckpoint({
    id: gameScreen ? playerPending?.id ?? null : (chain ? cpId(mode, nums) : null),
    questions: gameScreen
      ? (playerPending ? playerPending.qs.map((q) => QUESTIONS[q](lab, k)) : null)
      : (chain && ready ? chain.map((q) => QUESTIONS[q](lab, k)) : null),
    reached: gameScreen ? !!playerPending : ready,
    resetKey: scene.inits,
    onRetry: () => {
      setLab(make()); setLive(null); setNotice(null);
      if (gameScreen) {
        // lecteur : le terrain repart de ZÉRO ; la manche oublie ce que le labo vient de défaire, le 1er refus redevient gratuit
        refusedSeen.current = 0; discoveredSent.current = false;
        state.report(onTrial, { tk: 'retry' });
      }
    },
    onEvent: (ev) => state.report(gameScreen ? onTrial : onCheckpoint, ev),
    onDone: (id) => {
      if (gameScreen) {
        setDoneIds((d) => (d.includes(id) ? d : [...d, id]));
        if ((playerChains.find((c) => c.id === id)?.qs ?? []).includes('ruleP')) { state.discover(); state.formalize(); }
        return;
      }
      state.discover(); state.formalize();
    },
  });
  useEffect(() => { if (ready && !cpLive && !gameScreen) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  // lecteur : la découverte du labo, annoncée une fois à la manche
  useEffect(() => {
    if (gameScreen && ready && !discoveredSent.current) { discoveredSent.current = true; state.report(onTrial, { tk: 'discovered' }); }
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps
  // une étape est FAITE quand son objectif est atteint ET (la dernière) ses questions répondues : la pastille passe au vert et on fête
  const stepDone = mode === 'rows'
    ? [lab.tried.some((x) => x.valid), lab.tried.some((x) => x.valid) && lab.tried.some((x) => !x.valid), ready && !cp.blocking]
    : [lab.trials.length > 0, noSquare ? lab.trials.length > 0 : lab.trials.some((x) => x.ok), ready && !cp.blocking];
  const nDone = stepDone.findIndex((d) => !d) < 0 ? stepDone.length : stepDone.findIndex((d) => !d);
  const party = useStepCelebration();
  const celebrated = useRef({ n: 0, inits: scene.inits });
  if (celebrated.current.inits !== scene.inits) celebrated.current = { n: 0, inits: scene.inits };   // « إعادة » : on refête
  useEffect(() => {
    if (gameScreen) return;   // lecteur : pas de fête quand l'étape est cachée
    if (nDone <= celebrated.current.n) return;
    celebrated.current.n = nDone;
    party.celebrate({ n: nDone, total: stepDone.length });
  }, [nDone]); // eslint-disable-line react-hooks/exhaustive-deps
  // le son du geste (muet sans « الصوت ») : r bougé / bande posée (au plus un toutes les 35 ms) ; un r juste, le plus grand, un refus
  const heard = useRef({ at: 0, r: null });
  const tick = () => { const now = Date.now(); if (now - heard.current.at > 35) { playSfx('tooth'); heard.current.at = now; } };
  const rowSound = (prev, r) => { const l = L.rowsLayout(prev, r); playSfx(!l.valid ? 'over' : r === L.rowsGcd(prev) ? 'flag' : 'bell'); };
  useEffect(() => { if (state.isFormal) state.report(onFinished, nums); }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── lecteur : un ESSAI (un r validé, une répartition fermée) — nouveau ou non, son verdict est ré-annoncé ; seul un essai nouveau compte ── */
  const playerTrial = (prev, trial) => {
    if (!gameScreen || !trial) return;
    setGesture((g) => g + 1);
    const isNew = prev.mode === 'rows' ? L.isNewRows(prev, trial.r) : L.isNewSplit(prev, trial.right, trial.bottom);
    const v = L.verdictOf(prev, trial);
    if (!v || !isNew) return;
    const free = !v.exact && refusedSeen.current === 0;
    if (!v.exact) refusedSeen.current += 1;
    state.report(onVerdict, { ...v, ...(free ? { free: true } : {}) });
  };

  /* ── lecteur : la PRÉDICTION, avant le premier geste ; le terrain est cerclé pendant elle ; les commandes sont figées pendant elle et pendant une question ── */
  const untouched = mode === 'rows' ? lab.tried.length === 0 && live == null : lab.trials.length === 0 && lab.right + lab.bottom === 0;
  const nextPred = predKeys.find((key) => !asked.current.has(key)) ?? null;
  const predictOpen = gameScreen && cpLive && !cp.open && !missionBig && untouched && nextPred != null;
  const locked = gameScreen && (cp.open || predictOpen);
  const lockedRef = useRef(false);
  lockedRef.current = locked;
  const sayPredict = (says) => {
    const key = nextPred;
    const ok = String(says) === String(L.predictTruth(lab, key));
    asked.current.add(key);
    playSfx('pop');
    setPreds((m) => ({ ...m, [key]: ok }));
    state.report(onTrial, { tk: 'predict', ok });
    if (!predKeys.some((x) => x !== key && !asked.current.has(x))) {
      setTimeout(() => boxRef.current?.querySelector(mode === 'rows' ? '[data-turf-handle]' : '[data-turf-close]')?.focus(), 60);
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
  useEffect(() => { if (cp.open) setShownPreds([]); }, [cp.open]);

  const boxRef = useRef(null);
  const fieldRef = useRef(null);
  const [width, setWidth] = useState(320);
  const [overhead, setOverhead] = useState(260);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => setWidth(Math.max(260, Math.floor(el.clientWidth)));
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  // lecteur : ce que le bloc du labo mesure EN PLUS du terrain (la règle, les boutons, les textes) — re-mesuré à chaque rendu (même valeur = aucun rendu)
  useLayoutEffect(() => {
    if (!gameScreen) return;
    const el = boxRef.current; const f = fieldRef.current;
    if (el) { const w = Math.max(260, Math.floor(el.clientWidth)); setWidth((cur) => (cur === w ? cur : w)); }
    if (el && f) {
      const o = Math.max(120, Math.ceil(el.getBoundingClientRect().height - f.getBoundingClientRect().height));
      setOverhead((cur) => (Math.abs(cur - o) < 4 ? cur : o));
    }
  });
  const area = useMissionArea();

  /* ── rows : la règle de r ── */
  const range = mode === 'rows' ? L.rowsRange(lab) : { min: 0, max: 1 };
  const EDGE = 22;
  const span = Math.max(1, range.max - range.min);
  const mu = (width - 2 * EDGE) / span;
  const xOf = (v) => EDGE + (v - range.min) * mu;
  // zoom du lecteur : les pixels de l'écran ramenés aux pixels du calque (rect.width / offsetWidth)
  const rulerRef = useRef(null);
  const toValue = useCallback((clientX, _y, rect) => {
    const w = rulerRef.current?.offsetWidth || rect.width;
    const z = (gameScreen && w ? rect.width / w : 1) || 1;
    return range.min + ((clientX - rect.left) / z - EDGE) / mu;
  }, [range.min, mu, gameScreen]);
  // Un r PAR DÉFAUT, jamais une réponse ni un essai (2026-10-09) : il n'entre pas dans `tried`.
  const defaultR = mode === 'rows' ? L.defaultRows(lab) : null;
  // Miroir synchrone de `lab` pour « جرّب كل الإمكانيات ».
  const labRef = useRef(lab);
  labRef.current = lab;
  const sweepRows = (v) => {
    const prev = labRef.current;
    if (L.canRow(prev, v) !== true) return;
    labRef.current = L.setRows(prev, v);
    rowSound(prev, v);
    setLab((s) => L.setRows(s, v));
    setLive(null);
    state.report(onTrial, L.rowsLayout(prev, v));
  };
  const untriedR = L.untriedRows(lab);
  const stretch = useStretchInteraction({
    value: live ?? lab.r ?? defaultR, range, toValue,
    onChange: (v) => { if (!lockedRef.current) setLive(v); },
    onCommit: (v) => {
      setLive(null);
      if (lockedRef.current || mode !== 'rows' || L.canRow(lab, v) !== true) return;
      setLab((s) => L.setRows(s, v));
      rowSound(lab, v);
      state.report(onTrial, L.rowsLayout(lab, v));
      playerTrial(lab, { r: v, valid: L.rowsLayout(lab, v).valid });
    },
    direction: 'ltr',
  });
  const nudge = (d) => { if (!lockedRef.current) stretch.nudge(d); };

  /* ── square : porter les bandes ── */
  const drag = useDragInteraction({
    accepts: (src, zone) => {
      if (lockedRef.current) return '';
      if (mode !== 'square' || !src.startsWith('strip:')) return '';
      const v = L.canPlace(lab, src.slice(6), zone);
      return v === true ? true : v;
    },
    onDrop: (src, zone) => { setLab((s) => L.place(s, src.slice(6), zone)); setNotice(null); tick(); if (gameScreen) setGesture((g) => g + 1); },
    onReject: (_s, _z, reason) => { setNotice(reason ? { tone: 'ko', key: reason } : null); if (reason) playSfx('over'); if (gameScreen) setGesture((g) => g + 1); },
  });
  /**
   * Toucher (ou Entrée sur) une bande d'une zone PENDANT qu'on tient une bande venue
   * d'ailleurs, c'est la poser dans cette zone : les zones « يمين » et « تحت » sont
   * couvertes par leurs propres bandes, qui sinon deviendraient le nouvel objet tenu.
   */
  const intoZone = (zone) => {
    const stop = (e) => { if (drag.held && !drag.dragging && drag.held !== `strip:${zone}`) { e.stopPropagation(); e.preventDefault(); } };
    const drop = (e) => {
      if (!drag.held || drag.dragging || drag.held === `strip:${zone}`) return;
      e.stopPropagation(); e.preventDefault(); drag.dropHere(zone);
    };
    return {
      onPointerDownCapture: stop,
      onPointerUpCapture: stop,
      onClickCapture: drop,
      onKeyDownCapture: (e) => { if (e.key === 'Enter' || e.key === ' ') drop(e); },
    };
  };

  const closeField = () => {
    if (lockedRef.current) return;
    const verdict = L.canClose(lab);
    if (verdict === 'stripsLeft') { setNotice({ tone: 'ko', key: 'stripsLeft' }); playSfx('over'); if (gameScreen) setGesture((g) => g + 1); return; }
    playSfx(verdict === true ? 'flag' : 'over');
    const next = L.close(lab);
    setLab(next);
    state.report(onTrial, next.trials.at(-1));
    playerTrial(lab, next.trials.at(-1));
    setNotice(verdict === true ? { tone: 'ok', key: 'closed' } : { tone: 'ko', key: verdict, need: L.cornerNeed(lab), have: lab.c });
  };
  const reopenField = () => { if (lockedRef.current) return; setLab((s) => L.reopen(s)); setNotice(null); };

  /* ── l'échelle : la page comme avant ; le lecteur cadre le terrain dans la largeur de la scène ET la hauteur de la zone du lecteur ── */
  const rr = live ?? lab.r ?? defaultR;
  const playerRoom = gameScreen && area?.height > 0 ? Math.max(110, area.height - overhead - PLAYER_CHROME) : Infinity;
  const unitPx = (() => {
    if (!gameScreen) return Math.max(10, Math.min(22, (width - 40) / (mode === 'rows' ? 12 : (XU + Math.max(2, lab.b ?? 0) + 1))));
    if (mode === 'rows') {
      const bx = L.rowsBox(lab, rr ?? range.min);
      const wFit = (width - 48 - 16 - 2 * bx.tiles) / Math.max(1, bx.w);
      const leftFit = bx.left ? (width - 24) / bx.left : Infinity;
      const hFit = (playerRoom - 16 - 2 * (rr ?? 1) - (bx.left ? 34 + 8 : 0)) / Math.max(1, bx.h + (bx.left ? bx.tall : 0));
      return Math.max(5, Math.min(22, wFit, leftFit, hFit));
    }
    const sb = L.squareBox(lab);
    return Math.max(6, Math.min(22, (width - 40) / sb.w, (playerRoom - 40) / sb.h));
  })();

  /* ── dessin d'une plaque ── */
  const Tile = ({ w, h, neg = false, dashed = false, kind }) => (
    <div
      data-tile={kind}
      className={`relative shrink-0 overflow-hidden rounded-[3px] border ${dashed ? 'border-dashed border-slate-400 bg-transparent' : neg ? 'border-rose-500' : 'border-emerald-800/50'}`}
      style={{ width: w * unitPx, height: h * unitPx, background: dashed ? undefined : neg ? 'repeating-linear-gradient(45deg,#FFE4E6 0 5px,#FDA4AF 5px 7px)' : 'repeating-linear-gradient(90deg,#22C55E 0 8px,#16A34A 8px 16px)' }}
      aria-hidden="true"
    />
  );

  useEffect(() => { if (heard.current.r !== null && heard.current.r !== rr) tick(); heard.current.r = rr; }, [rr]); // eslint-disable-line react-hooks/exhaustive-deps
  const layout = mode === 'rows' && rr != null ? L.rowsLayout(lab, rr) : null;
  // lecteur : la hauteur (le facteur commun) reste « ? » tant qu'une question de la manche la demande — la construction ne serait qu'une copie
  const lastChain = playerChains.at(-1);
  const chainsDone = playerChains.length ? doneIds.includes(lastChain.id) : true;
  const hideAnswer = gameScreen && !chainsDone;

  const renderRows = () => {
    const tall = lab.m === 1 ? XU : 1;
    const tileOf = (p) => (lab.m === 1 ? (p === 2 ? { w: XU, h: XU, kind: 'x2' } : { w: 1, h: XU, kind: 'x' }) : (p === 1 ? { w: XU, h: 1, kind: 'x' } : { w: 1, h: 1, kind: '1' }));
    if (!layout) {
      return (
        <div className="flex flex-wrap gap-1" data-turf-loose>
          {lab.terms.flatMap((term) => Array.from({ length: Math.abs(term.c) }, (_, n) => <Tile key={`${term.p}-${n}`} {...tileOf(term.p)} neg={term.c < 0} />))}
        </div>
      );
    }
    return (
      <div className="space-y-2">
        <div className="flex items-stretch gap-2" dir="ltr">
          <div className="flex w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-900" data-turf-height>
            {layout.valid && !hideAnswer ? <MathText>{`$${L.rowsCommonTex(lab, rr)}$`}</MathText> : (gameScreen ? <><span aria-hidden="true">?</span><span className="sr-only">{k('heightUnknown')}</span></> : '?')}
          </div>
          <div className={`rounded-xl border-4 p-1 ${layout.valid ? 'border-white bg-emerald-700/10 ring-2 ring-emerald-500' : 'border-dashed border-rose-300'}`} data-turf-field data-rows={rr} data-valid={String(layout.valid)}>
            {Array.from({ length: rr }, (_, row) => (
              <div key={row} className="flex gap-0.5" style={{ height: tall * unitPx + 2 }} data-turf-row={row}>
                {layout.perRow.flatMap((term) => Array.from({ length: Math.abs(term.c) }, (_, n) => <Tile key={`${term.p}-${n}`} {...tileOf(term.p)} neg={term.c < 0} />))}
              </div>
            ))}
          </div>
        </div>
        {!layout.valid && (
          <div className="rounded-lg border-2 border-dashed border-rose-300 bg-rose-50/60 p-2" data-turf-leftover>
            <p className="mb-1 text-xs font-bold text-rose-800">{k('leftoverTitle')}</p>
            <div className="flex flex-wrap gap-1">
              {layout.leftover.flatMap((term) => Array.from({ length: Math.abs(term.c) }, (_, n) => <Tile key={`${term.p}-${n}`} {...tileOf(term.p)} neg={term.c < 0} />))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const frozen = locked ? { 'aria-disabled': true } : {};
  /** L'anneau de focus : celui de la page, ou l'anneau du lecteur (indigo-600 décalé — règle d'accessibilité des leçons converties). */
  const fr = (pageCls) => (gameScreen ? `focus-visible:ring-2 ${ringP}` : pageCls);

  const renderSquare = () => {
    const need = L.cornerNeed(lab);
    const shown = Math.min(lab.c, need);
    const extra = Math.max(0, lab.c - need);
    const closed = !!lab.closed;
    return (
      <div className="space-y-3">
        <div className={`inline-grid gap-1 rounded-xl p-1 ${closed ? 'ring-4 ring-white outline outline-2 outline-emerald-600 bg-emerald-700/10' : ''}`} dir="ltr"
          style={{ gridTemplateColumns: `auto auto` }} data-turf-square data-closed={String(closed)}>
          <Tile w={XU} h={XU} kind="x2" />
          <DropZone drag={drag} id="right" {...intoZone('right')} tone="emerald" label={k('rightZone', { n: lab.right })} minHeight="" className="flex min-w-[44px] gap-0.5 p-0.5" style={{ minHeight: XU * unitPx }}>
            {Array.from({ length: lab.right }, (_, n) => (
              n === 0
                ? <DraggableObject key={n} drag={drag} id="strip:right" label={k('stripFromRight')} className={gameScreen ? "p-[3px]" : "p-0"}><Tile w={1} h={XU} kind="x" /></DraggableObject>
                : <Tile key={n} w={1} h={XU} kind="x" />
            ))}
          </DropZone>
          <DropZone drag={drag} id="bottom" {...intoZone('bottom')} tone="emerald" label={k('bottomZone', { n: lab.bottom })} minHeight="min-h-[44px]" className="flex flex-col gap-0.5 p-0.5" style={{ minWidth: XU * unitPx }}>
            {Array.from({ length: lab.bottom }, (_, n) => (
              n === 0
                ? <DraggableObject key={n} drag={drag} id="strip:bottom" label={k('stripFromBottom')} className={gameScreen ? "p-[3px]" : "p-0"}><Tile w={XU} h={1} kind="x" /></DraggableObject>
                : <Tile key={n} w={XU} h={1} kind="x" />
            ))}
          </DropZone>
          <div className="grid gap-0.5 p-0.5" style={{ gridTemplateColumns: `repeat(${Math.max(1, lab.right)}, ${unitPx}px)` }} data-turf-corner data-need={need}>
            {Array.from({ length: need }, (_, n) => <Tile key={n} w={1} h={1} kind="1" dashed={n >= shown} />)}
          </div>
        </div>
        {(showNeed || closed) && !hideAnswer && (
          <p className="text-sm text-slate-700" data-turf-need><MathText>{k('cornerReading', { right: lab.right, bottom: lab.bottom, need, have: lab.c })}</MathText></p>
        )}
        {extra > 0 && (
          <div className="rounded-lg border-2 border-dashed border-amber-300 bg-amber-50 p-2" data-turf-extra>
            <p className="mb-1 text-xs font-bold text-amber-900">{k('extraTitle', { n: extra })}</p>
            <div className="flex flex-wrap gap-0.5">{Array.from({ length: extra }, (_, n) => <Tile key={n} w={1} h={1} kind="1" />)}</div>
          </div>
        )}
        <DropZone drag={drag} id="stock" {...intoZone('stock')} tone="slate" label={k('stockZone', { n: L.stock(lab) })} hint={k('stockEmpty')} minHeight="min-h-[56px]" className="flex flex-wrap items-center gap-1 p-2" data-turf-stock>
          {L.stock(lab) > 0 && Array.from({ length: L.stock(lab) }, (_, n) => (
            n === 0
              ? <DraggableObject key={n} drag={drag} id="strip:stock" label={k('stripFromStock', { n: L.stock(lab) })} className={gameScreen ? "p-[3px]" : "p-0"}><Tile w={XU} h={1} kind="x" /></DraggableObject>
              : <Tile key={n} w={XU} h={1} kind="x" />
          ))}
        </DropZone>
        <div className="flex flex-wrap gap-2">
          {!closed ? (
            <button type="button" onClick={closeField} data-turf-close {...frozen}
              className={`inline-flex min-h-[44px] items-center gap-2 rounded-xl ${gameScreen ? 'bg-emerald-700' : 'bg-emerald-600'} px-4 font-bold text-white focus:outline-none ${fr('focus-visible:ring-4 focus-visible:ring-emerald-300')}`}>
              <Lock className="h-5 w-5" aria-hidden="true" /> {k('close')}
            </button>
          ) : (
            <button type="button" onClick={reopenField} data-turf-reopen {...frozen}
              className={`inline-flex min-h-[44px] items-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-4 font-bold text-slate-700 focus:outline-none ${fr('focus-visible:ring-4 focus-visible:ring-blue-300')}`}>
              <Unlock className="h-5 w-5" aria-hidden="true" /> {k('reopen')}
            </button>
          )}
        </div>
      </div>
    );
  };

  const exprTex = mode === 'rows' ? L.rowsExprTex(lab) : L.squareExprTex(lab);
  const rowsEq = layout?.valid ? L.rowsEquationTex(lab, rr) : null;
  const representation = mode === 'rows'
    ? (layout && !live && (layout.valid
      ? <EquationDisplay tone="ok" tex={rowsEq} note={<MathText>{k('rowsValid', { r: rr })}</MathText>} />
      : <EquationDisplay tone="ko" tex={`${exprTex} \\neq ${rr} \\times (\\ldots)`} note={<MathText>{k('rowsRefused', { r: rr })}</MathText>} />))
    : (lab.closed
      ? <EquationDisplay tone="ok" tex={L.squareEquationTex(lab)} note={<MathText>{k(lab.closed.p === lab.closed.q ? 'closedSquare' : 'closedRect')}</MathText>} />
      : notice?.need != null ? <EquationDisplay tone="ko" tex={`${notice.need} \\neq ${notice.have}`} note={<MathText>{k(notice.key, { need: notice.need, have: notice.have })}</MathText>} /> : null);

  /* ── lecteur : le verdict de l'essai VISIBLE, relu sur l'état (le r à l'écran, la répartition posée) — jamais l'égalité ni la hauteur ── */
  const trialNow = !gameScreen ? null : mode === 'rows'
    ? (live == null && rr != null ? lab.tried.find((x) => x.r === rr) ?? null : null)
    : (lab.closed ? lab.trials.find((x) => x.ok && x.right === lab.closed.p) ?? null
      : (L.stock(lab) === 0 ? lab.trials.find((x) => x.right === lab.right && x.bottom === lab.bottom) ?? null : null));
  const trialOk = mode === 'rows' ? Boolean(trialNow?.valid) : Boolean(trialNow?.ok);
  const trialVerdict = trialNow && (mode === 'rows'
    ? (trialNow.r === 1 ? k('vp.one') : k(trialOk ? 'vp.rowsOk' : 'vp.rowsNo', { r: trialNow.r }))
    : k(trialOk ? 'vp.closed' : 'vp.refused'));
  const infoText = notice && notice.need == null && notice.key !== 'closed' ? k(notice.key) : k(mode === 'rows' ? 'vp.startRows' : 'vp.startSquare');
  const infoVerdict = <MathText>{infoText}</MathText>;
  const liveKey = `${trialNow ? (mode === 'rows' ? `r${trialNow.r}` : `s${trialNow.right}`) : 'info'}:${gesture}`;

  /* ── lecteur : le guide (LabCoach) — le geste, jamais la réponse ── */
  const coachRaw = gameScreen && coachOn && !locked ? L.coachOf(lab, { done: chainsDone && ready, r: rr }) : null;
  // un objet STABLE par étape (son id fixe la cible et le geste) : LabCoach ne se réabonne pas à chaque geste
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const coachStep = useMemo(() => coachRaw, [coachRaw?.id]);
  const coach = useLabCoach({
    lab: 'turf-factoring', step: coachStep, text: coachStep ? k(`coach.${coachStep.id}`) : '',
    labels: { hide: t('manipulation.common.coach.hide'), show: t('manipulation.common.coach.show'), ok: t('manipulation.common.coach.ok'), stop: t('manipulation.common.coach.stop') },
  });

  /* ── lecteur : la prédiction ou la question PREND la colonne du labo ── */
  const predOptionText = (key, x) => {
    if (key === 'closes') return <MathText>{k(`predict.closes_${x}`, { root: Math.round(Math.sqrt(lab.c ?? 0)) })}</MathText>;
    return <MathText>{`$${x}$`}</MathText>;
  };
  const trayNode = !gameScreen ? null : predictOpen ? (
    <PredictTray attr="turf" key={nextPred} step={predKeys.indexOf(nextPred) + 1} of={predKeys.length}
      title={t('manipulation.common.cp.predict.title')}
      prompt={k(`predict.${nextPred}`)}
      options={L.predictOptions(lab, nextPred).map((x) => ({ says: String(x), text: predOptionText(nextPred, x) }))}
      onSay={sayPredict} />
  ) : cp.open ? cp.node : null;

  /* ── lecteur : le JOURNAL « 📋 جدول تجاربك » — chaque essai, avec le MOT de son verdict ── */
  const journalId = `${uid}-journal`;
  const journalRows = (mode === 'rows' ? lab.tried : lab.trials).slice(-5);
  const rowWord = (x) => (mode === 'rows' ? k(x.valid ? 'rowWord.ok' : 'rowWord.rowsNo') : k(x.ok ? 'rowWord.closed' : 'rowWord.refused'));
  const okOf = (x) => (mode === 'rows' ? x.valid : x.ok);
  const playerRepresentation = gameScreen && !cp.open && (
    <div className="space-y-2" data-turf-player-col>
      {/* le texte VISIBLE du verdict ; l'annonce passe par la région vivante toujours montée de la scène (`data-turf-verdict-live`) */}
      <div data-turf-verdict-box>
        {trialNow ? (
          <p className={`rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-sm font-bold leading-snug ${trialOk ? 'text-emerald-800' : 'text-rose-800'}`}
            data-turf-verdict={trialOk ? 'ok' : 'refused'}>
            <span aria-hidden="true">{trialOk ? '✓ ' : '✗ '}</span><span className="sr-only">{k(trialOk ? 'cueRight' : 'cueRefused')} </span><bdi>{trialVerdict}</bdi>
          </p>
        ) : (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white/70 px-3 py-2 text-center text-sm font-bold leading-snug text-slate-700" data-turf-verdict="">{infoVerdict}</p>
        )}
        {shownPreds.map((pr) => (
          <p key={pr.key} data-turf-predict-result={pr.ok ? 'ok' : 'wrong'} data-turf-predict-key={pr.key}
            className={`mt-2 rounded-2xl px-4 py-2 text-center text-lg font-black ${pr.ok ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
            {pr.ok ? t('manipulation.common.cp.predict.right') : k('predict.wrong')}
          </p>
        ))}
      </div>
      {journalRows.length > 0 && !state.isFormal && (
        <div data-turf-journal>
          <p id={journalId} className="text-sm font-black text-indigo-900"><span aria-hidden="true">📋 </span>{k('journal')}</p>
          <table className="mt-1 w-full text-center text-xs" aria-labelledby={journalId}>
            <thead>
              <tr className="bg-slate-50">
                {mode === 'rows'
                  ? <th scope="col">{k('colRows')}</th>
                  : <><th scope="col">{k('colRight')}</th><th scope="col">{k('colBottom')}</th></>}
                <th scope="col">{k('colResult')}</th>
              </tr>
            </thead>
            <tbody>
              {journalRows.map((x) => (
                <tr key={mode === 'rows' ? x.r : `${x.right}-${x.bottom}`} data-turf-row-word={okOf(x) ? 'ok' : 'refused'}>
                  {mode === 'rows'
                    ? <th scope="row" className="border border-slate-200 font-mono font-normal"><bdi dir="ltr">{x.r}</bdi></th>
                    : <><th scope="row" className="border border-slate-200 font-mono font-normal"><bdi dir="ltr">{x.right}</bdi></th><td className="border border-slate-200 font-mono"><bdi dir="ltr">{x.bottom}</bdi></td></>}
                  <td className={`border border-slate-200 font-bold ${okOf(x) ? 'text-emerald-800' : 'text-rose-800'}`}>
                    <span aria-hidden="true">{okOf(x) ? '✓ ' : '✗ '}</span>{rowWord(x)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
  const choiceId = (c) => (c.mode === 'square' ? `square-${c.b}-${c.c}` : `rows-${c.expr}`);
  const sameChoice = (c) => (c.mode === 'square' ? mode === 'square' && nums.b === c.b && nums.c === c.c : mode === 'rows' && nums.expr === c.expr);
  const numbersOf = (c) => (c.mode === 'square' ? { b: c.b, c: c.c, mode: 'square' } : { expr: c.expr, mode: 'rows' });
  const choiceTex = (c) => (c.mode === 'square' ? L.squareExprTex(L.initSquare({ b: c.b, c: c.c })) : L.rowsExprTex(L.initRows({ expr: c.expr })));

  return (
    <ManipulationShell
      type="turf-factoring"
      title={bidi(title ?? k(mode === 'rows' ? 'titleRows' : 'titleSquare', { expr: exprTex }))}
      mission={(typeof mission === 'string' && gameScreen ? <MathText>{mission}</MathText> : mission) ?? k(mode === 'rows' ? 'missionRows' : 'missionSquare')}
      lead={typeof lead === 'string' ? (gameScreen ? <MathText>{lead}</MathText> : bidi(lead)) : lead}
      state={state}
      coach={gameScreen && coachOn ? coach : null}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      headerAction={cpSettings.control}
      // lecteur : l'écran de jeu est toujours GUIDÉ (les manches et les questions guident)
      guided={gameScreen || !!chain}
      hideRepresentation={(gameScreen && locked) || undefined}
      onIntroChange={gameScreen ? setMissionBig : undefined}
      sidePanel={trayNode ? <div data-turf-tray>{trayNode}</div> : null}
      // lecteur : le guide remplace les indices
      hints={gameScreen ? [] : (mode === 'rows' ? [k('rHint1'), k('rHint2'), k('rHint3')] : [k('sHint1'), k('sHint2'), k('sHint3')]).map((h) => <MathText key={h}>{h}</MathText>)}
      controller={{
        autoStep: () => false,
        canAutoStep: () => false,
        // lecteur : le balayage est caché (verdict X1) — il atteindrait les buts « exact » et « above » sans une seule décision
        autoComplete: mode === 'rows' && !gameScreen ? {
          label: t('manipulation.autoComplete.tryAll'),
          ready: true,
          remaining: untriedR.length,
          intervalMs: 480,
          maxTicks: 80,
          step: () => { const v = L.untriedRows(labRef.current)[0]; if (v !== undefined) sweepRows(v); },
          finish: () => { L.untriedRows(labRef.current).forEach(sweepRows); },
        } : undefined,
      }}
      representation={gameScreen ? playerRepresentation : representation}
      // lecteur : la règle est la DERNIÈRE question de la manche (son explication est la forme formelle) — pas de panneau de découverte en plus
      discovery={gameScreen ? null : (
        <ManipulationDiscovery
          state={state}
          prompt={k(mode === 'rows' ? 'rPrompt' : noSquare ? 'nPrompt' : 'sPrompt')}
          options={discoveryOptions(lab, k, mode, noSquare)}
          formal={<Formal lab={lab} k={k} mode={mode} noSquare={noSquare} />}
        />
      )}
      explanation={<MathText>{k(mode === 'rows' ? 'explanationRows' : 'explanationSquare')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-emerald-50/70 to-white" data-dragging={stretch.dragging || drag.dragging ? 'true' : undefined}>
        <div ref={boxRef} className="relative space-y-3" data-turf-factoring data-mode={mode} data-unit-px={gameScreen ? unitPx.toFixed(1) : undefined}>
          {party.node}
          {/* lecteur : la région vivante TOUJOURS montée — la colonne se démonte quand une question s'ouvre ; une clé par geste */}
          {gameScreen && (
            <div role="status" aria-live="polite" className="sr-only" data-turf-verdict-live>
              {trialNow
                ? <span key={liveKey}>{k(trialOk ? 'cueRight' : 'cueRefused')} {trialVerdict}</span>
                : <span key={liveKey}>{infoText}</span>}
              {shownPreds.map((pr) => <span key={pr.key}> {pr.ok ? t('manipulation.common.cp.predict.right') : k('predict.wrong')}</span>)}
              {choiceSaid && <span key={choiceSaid}> {k('choiceNow')}</span>}
            </div>
          )}
          {!(gameScreen && cp.open) && cp.node}
          {!gameScreen && <LabStepper count={stepDone.length} current={Math.min(nDone, stepDone.length - 1)} done={stepDone} stepAttr="data-tf-step" />}
          {gameScreen && choices?.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5" role="group" aria-labelledby={`${uid}-choices`} data-turf-choices>
              <span id={`${uid}-choices`} className="text-sm font-bold text-slate-600">{k('choicesLabel')}</span>
              {choices.map((c) => {
                const id = choiceId(c);
                const on = sameChoice(c);
                return (
                  <button key={id} type="button" data-turf-choice={id} aria-disabled={locked || undefined} aria-pressed={on}
                    onClick={() => { if (!lockedRef.current && !on) { state.setNumbers(numbersOf(c)); setChoiceSaid(id); } }}
                    className={`inline-flex min-h-[44px] items-center rounded-xl border-2 px-3 text-sm font-black focus:outline-none focus-visible:ring-2 ${ringP} ${on ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'border-slate-300 bg-white text-slate-700'}`}>
                    <span className="pointer-events-none"><MathText>{`$${choiceTex(c)}$`}</MathText></span>
                  </button>
                );
              })}
            </div>
          )}
          <p className="text-sm text-slate-700"><MathText>{k(mode === 'rows' ? 'legendRows' : 'legendSquare', { expr: exprTex })}</MathText></p>
          {mode === 'rows' && (
            <>
              {/* lecteur : « − r = n + » AU-DESSUS de la règle, sur la ligne de son titre — la bulle du guide qui montre les plaques restées
                  dehors s'ouvre au-dessus d'elles, jamais sur ces boutons (walk 2026-11-11) ; la page garde son ordre */}
              {gameScreen ? (
                <div className="flex flex-wrap items-center justify-between gap-2" data-turf-topbar>
                  <p className="text-sm font-bold text-slate-700">{k('rowsRuler')}</p>
                  <div className="flex items-center gap-2" dir="ltr">
                    {/* lecteur : `aria-disabled` + garde (le focus reste sur le bouton), jamais `disabled` */}
                    <button type="button" onClick={() => { if (!(rr != null && rr <= range.min)) nudge(-1); }} aria-label={k('fewerRows')} data-turf-less
                      aria-disabled={locked || (rr != null && rr <= range.min) || undefined}
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-300 bg-white aria-disabled:opacity-40 focus:outline-none focus-visible:ring-2 ${ringP}`}><Minus className="h-5 w-5" aria-hidden="true" /></button>
                    <p className="min-w-[8rem] text-center text-sm font-bold text-slate-700" dir="rtl">{rr == null ? k('notSet') : <bdi dir="ltr">{k('rowsValue', { r: rr })}</bdi>}</p>
                    <button type="button" onClick={() => { if (!(rr != null && rr >= range.max)) nudge(1); }} aria-label={k('moreRows')} data-turf-more
                      aria-disabled={locked || (rr != null && rr >= range.max) || undefined}
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-300 bg-white aria-disabled:opacity-40 focus:outline-none focus-visible:ring-2 ${ringP}`}><Plus className="h-5 w-5" aria-hidden="true" /></button>
                  </div>
                </div>
              ) : <p className="text-sm font-bold text-slate-700">{k('rowsRuler')}</p>}
              <div dir="ltr" {...stretch.trackProps} ref={(el) => { stretch.trackProps.ref.current = el; rulerRef.current = el; }} className="relative"
                style={{ ...stretch.trackProps.style, height: 60, ...(locked ? { pointerEvents: 'none' } : {}) }} data-turf-ruler>
                <svg width={width} height={60} className="absolute inset-0" aria-hidden="true" focusable="false">
                  <rect x={EDGE - 4} y={26} width={span * mu + 8} height={5} rx={2} fill="#047857" />
                  {Array.from({ length: range.max - range.min + 1 }, (_, i) => range.min + i).map((v) => {
                    const tr = lab.tried?.find((u) => u.r === v);
                    return (
                      <g key={v}>
                        <line x1={xOf(v)} x2={xOf(v)} y1={33} y2={41} stroke="#64748B" />
                        <text x={xOf(v)} y={55} textAnchor="middle" fontSize={11} fill={tr ? (tr.valid ? '#047857' : '#BE123C') : '#334155'} fontWeight={tr ? 'bold' : 'normal'} fontFamily="ui-monospace, monospace">{v}</text>
                      </g>
                    );
                  })}
                </svg>
                <div
                  {...stretch.handleProps({ label: k('rowsHandle'), valueText: rr == null ? k('notSet') : k('rowsValue', { r: rr }) })}
                  {...frozen}
                  data-turf-handle={gameScreen ? '' : undefined}
                  className={`absolute top-0 flex h-11 w-11 -translate-x-1/2 items-start justify-center rounded-xl border-2 outline-none ${gameScreen ? `focus-visible:ring-2 ${ringP}` : 'focus-visible:ring-4 focus-visible:ring-blue-300'} ${stretch.dragging ? 'border-blue-500 bg-blue-500/10' : 'border-slate-400 bg-white/60'}`}
                  style={{ left: xOf(rr ?? range.min), cursor: stretch.dragging ? 'grabbing' : 'grab' }}
                >
                  <span className="-mt-2 rounded-full bg-slate-800 px-2 font-mono text-sm font-extrabold text-white" data-turf-r>{rr ?? '?'}</span>
                </div>
              </div>
              {!gameScreen && (
                <div className="flex items-center justify-center gap-2">
                  <button type="button" onClick={() => stretch.nudge(-1)} aria-label={k('fewerRows')} disabled={rr != null && rr <= range.min}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-300 bg-white disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><Minus className="h-5 w-5" aria-hidden="true" /></button>
                  <p className="min-w-[8rem] text-center text-sm font-bold text-slate-700">{rr == null ? k('notSet') : k('rowsValue', { r: rr })}</p>
                  <button type="button" onClick={() => stretch.nudge(1)} aria-label={k('moreRows')} disabled={rr != null && rr >= range.max}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-300 bg-white disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><Plus className="h-5 w-5" aria-hidden="true" /></button>
                </div>
              )}
              {/* lecteur : le terrain est UN bloc cadré (aucun défilement) ; la page garde son défilement horizontal */}
              {gameScreen
                ? <div ref={fieldRef} data-paging-keep data-turf-field-box className={predictOpen ? 'rounded-xl ring-4 ring-amber-300 ring-offset-2' : undefined}>{renderRows()}</div>
                : <div className="overflow-x-auto">{renderRows()}</div>}
              {!gameScreen && lab.tried.length > 0 && (
                <ul className="flex flex-wrap gap-1.5" dir="ltr" data-turf-tried>
                  {lab.tried.map((tr) => (
                    <li key={tr.r} data-tried-r={tr.r} data-valid={String(tr.valid)} className={`rounded-lg px-2 py-0.5 font-mono text-xs font-bold ${tr.valid ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'}`}>
                      r = {tr.r} {tr.valid ? '✓' : '✗'}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
          {mode === 'square' && (gameScreen
            ? <div ref={fieldRef} data-paging-keep data-turf-field-box className={predictOpen ? 'rounded-xl ring-4 ring-amber-300 ring-offset-2' : undefined}>{renderSquare()}</div>
            : <div className="overflow-x-auto">{renderSquare()}</div>)}
          {!gameScreen && (
            <p className="min-h-[1.25rem] text-sm" aria-live="polite" data-turf-notice>
              {notice && notice.need == null && notice.key !== 'closed' && <span className="text-rose-800"><MathText>{k(notice.key)}</MathText></span>}
            </p>
          )}
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ══════════════ La découverte et la règle ══════════════ */

/** Les trois options de la règle (la bonne, l'erreur du mode, et la réfutation par SES nombres). */
export function discoveryOptions(lab, k, mode, noSquare = false) {
  if (mode === 'rows') {
    return [
      { text: <MathText>{k('rOpt2')}</MathText>, why: <MathText>{k('rWhy2')}</MathText> },
      { text: <MathText>{k('rOpt1')}</MathText>, correct: true },
      { text: <MathText>{k('rOpt3')}</MathText>, why: <MathText>{k('rWhy3', { g: L.rowsGcd(lab) })}</MathText> },
    ];
  }
  if (noSquare) {
    return [
      { text: <MathText>{k('nOpt1')}</MathText>, correct: true },
      { text: <MathText>{k('nOpt2')}</MathText>, why: <MathText>{k('nWhy2')}</MathText> },
      { text: <MathText>{k('nOpt3')}</MathText>, why: <MathText>{k('nWhy3')}</MathText> },
    ];
  }
  return [
    { text: <MathText>{k('sOpt2')}</MathText>, why: <MathText>{k('sWhy2')}</MathText> },
    { text: <MathText>{k('sOpt1')}</MathText>, correct: true },
    { text: <MathText>{k('sOpt3')}</MathText>, why: <MathText>{k('sWhy3')}</MathText> },
  ];
}

export function Formal({ lab, k, mode, noSquare = false }) {
  return (
    <div className="space-y-2" data-turf-formal>
      <EquationDisplay tone="result" tex={k(mode === 'rows' ? 'rRule' : noSquare ? 'nRule' : 'sRule')} note={<MathText>{k(mode === 'rows' ? 'rFormal' : noSquare ? 'nFormal' : 'sFormal')}</MathText>} />
      {mode === 'rows' && <EquationDisplay tone="neutral" tex={L.rowsEquationTex(lab, L.rowsGcd(lab))} note={<MathText>{k('yourCase')}</MathText>} />}
      {mode === 'square' && lab.closed && <EquationDisplay tone="neutral" tex={L.squareEquationTex(lab)} note={<MathText>{k('yourCase')}</MathText>} />}
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite unique de chaque scène : elle interroge ce que l'élève vient de FAIRE et finit par LA RÈGLE. */
export function chainOf(mode, noSquare = false) {
  if (mode === 'rows') return ['best', 'left', 'common', 'rule'];
  return noSquare ? ['outside', 'why', 'rule'] : ['corner', 'half', 'sides', 'rule'];
}

const $ = (x) => `$${x}$`;
const Cq = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const innerTex = (terms, m) => termsTex(terms.map((t) => ({ c: t.c, p: t.p - m })));
const eqTex = (lab, common, inner) => `${L.rowsExprTex(lab)} = ${common === '1' ? '' : common}(${inner})`;
const expandTex = (common, terms) => termsTex(reducePoly(terms.map((t) => mulTerms(common, t))));

/**
 * Les écritures FAUSSES du facteur commun, chacune une erreur réelle : `lost` (le terme égal au facteur « disparaît » : 3 ÷ 3 = 0), `forgot` (un seul
 * terme divisé), `sign` (le signe du dernier terme perdu), `partial` (juste mais incomplète : la lettre n'est pas sortie). Les écartées égalent la bonne.
 */
export function wrongFactors(lab) {
  const g = L.rowsGcd(lab); const m = lab.m;
  const quot = lab.terms.map((t) => ({ c: t.c / g, p: t.p }));          // les quotients par g, la lettre encore dedans
  const common = { c: g, p: m };
  const commonTex = termTex(common, { lead: true });
  const right = eqTex(lab, commonTex, innerTex(quot, m));
  const out = [];
  const add = (id, terms, comm = common, withExpand = true) => {
    const tex = eqTex(lab, termTex(comm, { lead: true }), innerTex(terms, comm.p));
    if (tex === right || out.some((o) => o.tex === tex)) return;
    out.push({ id, tex, expanded: withExpand ? expandTex(comm, terms.map((t) => ({ c: t.c, p: t.p - comm.p }))) : null });
  };
  const one = quot.findIndex((q) => Math.abs(q.c) === 1 && q.p === m);
  if (one >= 0 && quot.length > 1) add('lost', quot.filter((_, i) => i !== one));
  if (quot.length > 1) add('forgot', [quot[0], ...lab.terms.slice(1)]);
  if (lab.terms.some((t) => t.c < 0)) add('sign', quot.map((q, i) => (i === quot.length - 1 ? { ...q, c: -q.c } : q)));
  if (m >= 1) add('partial', lab.terms.map((t) => ({ c: t.c / g, p: t.p })), { c: g, p: 0 }, false);
  return out;
}

export const QUESTIONS = {
  best: (lab, k) => {
    const g = L.rowsGcd(lab);
    const first = lab.tried.find((t) => !t.valid);
    const o = { g: $(String(g)), r: first ? $(String(first.r)) : '' };
    return {
      id: 'best', kind: 'number', expected: String(g), answer: <MathText>{$(String(g))}</MathText>,
      prompt: Cq(k, 'best.prompt'), hints: [Cq(k, 'best.hint1'), Cq(k, 'best.hint2', o)], explain: Cq(k, 'best.explain', { ...o, expr: $(L.rowsExprTex(lab)) }),
    };
  },
  left: (lab, k) => {
    const bad = lab.tried.find((t) => !t.valid);
    const lay = L.rowsLayout(lab, bad.r);
    const n = lay.leftover.reduce((sum, t) => sum + Math.abs(t.c), 0);
    const o = { r: $(String(bad.r)), n: $(String(n)), calc: $(lay.leftover.map((t) => Math.abs(t.c)).join('+') + `=${n}`) };
    return {
      id: 'left', kind: 'number', expected: String(n), answer: <MathText>{$(String(n))}</MathText>,
      prompt: Cq(k, 'left.prompt', o), hints: [Cq(k, 'left.hint1'), Cq(k, 'left.hint2', o)], explain: Cq(k, 'left.explain', o),
    };
  },
  common: (lab, k) => {
    const g = L.rowsGcd(lab);
    const right = L.rowsEquationTex(lab, g);
    const wrong = wrongFactors(lab).slice(0, 2);
    const why = (w) => Cq(k, `common.why.${w.id}`, { expr: $(L.rowsExprTex(lab)), expanded: w.expanded ? $(w.expanded) : '' });
    return {
      id: 'common', kind: 'choice', cols: 3, prompt: Cq(k, 'common.prompt', { expr: $(L.rowsExprTex(lab)) }),
      options: [
        { text: <MathText>{$(wrong[0].tex)}</MathText>, why: why(wrong[0]) },
        { text: <MathText>{$(right)}</MathText>, correct: true },
        { text: <MathText>{$(wrong[1].tex)}</MathText>, why: why(wrong[1]) },
      ],
      hints: [Cq(k, 'common.hint1'), Cq(k, 'common.hint2')],
      explain: Cq(k, 'common.explain', { eq: $(right) }),
    };
  },
  corner: (lab, k) => {
    const bad = lab.trials.find((t) => !t.ok);
    const o = { right: $(String(bad.right)), bottom: $(String(bad.bottom)), n: $(String(bad.need)), calc: $(`${bad.right}\\times${bad.bottom}=${bad.need}`) };
    return {
      id: 'corner', kind: 'number', expected: String(bad.need), answer: <MathText>{$(String(bad.need))}</MathText>,
      prompt: Cq(k, 'corner.prompt', o), hints: [Cq(k, 'corner.hint1'), Cq(k, 'corner.hint2', o)], explain: Cq(k, 'corner.explain', { ...o, have: $(String(lab.c)) }),
    };
  },
  half: (lab, k) => {
    const ok = lab.trials.find((t) => t.ok && t.right === t.bottom);
    const o = { b: $(String(lab.b)), p: $(String(ok.right)), calc: $(`${ok.right}+${ok.bottom}=${lab.b}`) };
    return {
      id: 'half', kind: 'number', expected: String(ok.right), answer: <MathText>{$(String(ok.right))}</MathText>,
      prompt: Cq(k, 'half.prompt', o), hints: [Cq(k, 'half.hint1'), Cq(k, 'half.hint2', o)], explain: Cq(k, 'half.explain', o),
    };
  },
  sides: (lab, k) => {
    const ok = lab.trials.find((t) => t.ok && t.right === t.bottom);
    const p = ok.right;
    const expr = L.squareExprTex(lab);
    const sq = (n) => `(x+${n})^2`;
    const exp = (n) => `x^2+${2 * n}x+${n * n}`;
    const o = { expr: $(expr), right: $(sq(p)) };
    return {
      id: 'sides', kind: 'choice', cols: 3, prompt: Cq(k, 'sides.prompt', { expr: $(expr) }),
      options: [
        { text: <MathText>{$(sq(lab.b))}</MathText>, why: Cq(k, 'sides.whyStrips', { wrong: $(sq(lab.b)), exp: $(exp(lab.b)), b: $(String(lab.b)) }) },
        { text: <MathText>{$(sq(p))}</MathText>, correct: true },
        { text: <MathText>{$(sq(lab.c))}</MathText>, why: Cq(k, 'sides.whyCorner', { wrong: $(sq(lab.c)), exp: $(exp(lab.c)), c: $(String(lab.c)) }) },
      ],
      hints: [Cq(k, 'sides.hint1', { p: $(String(p)) }), Cq(k, 'sides.hint2', { p: $(String(p)) })],
      explain: Cq(k, 'sides.explain', { ...o, eq: $(`${expr}=${sq(p)}`) }),
    };
  },
  outside: (lab, k) => {
    const tr = lab.trials[0];
    const n = lab.c - (tr?.need ?? 0);
    const o = { c: $(String(lab.c)), n: $(String(n)) };
    return {
      id: 'outside', kind: 'number', expected: String(n), answer: <MathText>{$(String(n))}</MathText>,
      prompt: Cq(k, 'outside.prompt', o), hints: [Cq(k, 'outside.hint1'), Cq(k, 'outside.hint2', o)], explain: Cq(k, 'outside.explain', o),
    };
  },
  why: (lab, k) => {
    const o = { c: $(String(lab.c)), root: $(String(Math.round(Math.sqrt(lab.c)))), sq: $(`${Math.round(Math.sqrt(lab.c))}^2=${lab.c}`) };
    return {
      id: 'why', kind: 'choice', prompt: Cq(k, 'why.prompt', o),
      options: [
        { text: Cq(k, 'why.notSquare', o), why: Cq(k, 'why.whyNotSquare', o) },
        { text: Cq(k, 'why.right', o), correct: true },
        { text: Cq(k, 'why.tooBig', o), why: Cq(k, 'why.whyTooBig', o) },
      ],
      hints: [Cq(k, 'why.hint1'), Cq(k, 'why.hint2', o)], explain: Cq(k, 'why.explain', o),
    };
  },
  rule: (lab, k) => {
    const noSquare = lab.mode === 'square' && !L.closable(lab);
    return {
      id: 'rule', kind: 'choice', prompt: <MathText>{k(lab.mode === 'rows' ? 'rPrompt' : noSquare ? 'nPrompt' : 'sPrompt')}</MathText>,
      options: discoveryOptions(lab, k, lab.mode, noSquare),
      hints: [Cq(k, `rule.${lab.mode === 'rows' ? 'rows' : noSquare ? 'none' : 'square'}.hint1`), Cq(k, `rule.${lab.mode === 'rows' ? 'rows' : noSquare ? 'none' : 'square'}.hint2`)],
      explain: <Formal lab={lab} k={k} mode={lab.mode} noSquare={noSquare} />,
    };
  },
};

/* ══════════════ Lecteur de mission : les suites des manches (rollout 2026-11-11, conseil du 2026-11-11, verdict L3) ══════════════ */

/**
 * Les suites du lecteur, par famille puis par nom : chacune { id, reached(lab), qs } — l'id est le point d'étape de la manche
 * (`{ checkpoint: id }`), posé quand la découverte du labo est atteinte (le plus grand r juste ET un refus ; un carré fermé ET un refus ; sans
 * bande : le refus). La RÈGLE vient après deux ensembles différents (rows : m = 0 à la manche 1, m = 1 à la manche 2 — verdict L3.7).
 */
export const CHAINS_PLAYER = Object.freeze({
  rows: Object.freeze({
    full: [{ id: 'rule', reached: L.rowsDiscoveryReady, qs: ['heightFill', 'buildFactor', 'ruleP'] }],
    build: [{ id: 'build', reached: L.rowsDiscoveryReady, qs: ['rowFill', 'buildFactor'] }],
    none: [],
  }),
  square: Object.freeze({
    full: [{ id: 'rule', reached: L.squareDiscoveryReady, qs: ['corner', 'buildSquare', 'ruleP'] }],
    none: [],
  }),
  // un carré qui ne ferme jamais (x² + c sans bande) : les carreaux dehors, pourquoi, la règle
  open: Object.freeze({
    full: [{ id: 'rule', reached: L.squareDiscoveryReady, qs: ['outside', 'why', 'ruleP'] }],
    none: [],
  }),
});
export const chainsOfPlayer = (mode, name, lab = null) => {
  const fam = mode === 'rows' ? 'rows' : lab && !L.closable(lab) ? 'open' : 'square';
  // rows 'full' asks the full HEIGHT (g·x) : with m = 0 there is no letter to take out — the chain falls back to 'build' (revue 2026-11-11)
  const key = fam === 'rows' && name === 'full' && lab && lab.m === 0 ? 'build' : name;
  return CHAINS_PLAYER[fam][key] ?? [];
};

/** Une liste qui tourne avec les nombres : la bonne pastille / le leurre ne tient jamais toujours la même place. */
const spinList = (xs, seed) => { const s0 = ((seed % xs.length) + xs.length) % xs.length; return xs.map((_, i) => xs[(i + s0) % xs.length]); };
const seedOf = (lab) => (lab.mode === 'rows' ? lab.terms.reduce((n, t) => n + Math.abs(t.c) * (t.p + 1), 0) : lab.b * 3 + lab.c);
const texNode = (v) => <MathText>{`$${v}$`}</MathText>;
/** Le texte d'une clé `player.<key>` du labo (île KaTeX). */
const Pq = (k, key, o) => <MathText>{k(`player.${key}`, o)}</MathText>;
const expandedTex = (common, inner) => termsTex(expand([common], inner));

Object.assign(QUESTIONS, {
  /* rows — au plus grand r : combien de plaques de la sorte la plus haute dans UNE rangée (« في كل صفّ: ▢ ») */
  rowFill: (lab, k) => {
    const f = L.rowFillParts(lab);
    const g = L.rowsGcd(lab);
    const total = Math.abs(lab.terms[0].c);
    const o = { g: $(String(g)), calc: $(`${total} \\div ${g} = ${f.expected}`) };
    return {
      id: 'rowFill', kind: 'fill', prompt: Pq(k, 'rowFill.prompt', o),
      fields: [{ label: k(`player.rowFill.label_${f.kind}`), expected: f.expected, options: spinList(f.options, seedOf(lab)) }],
      hints: [Pq(k, 'rowFill.hint1'), Pq(k, 'rowFill.hint2', o)], explain: Pq(k, 'rowFill.explain', o),
    };
  },
  /* rows, m = 1 — « ارتفاع الملعب كاملًا = ▢ » : le nombre de rangées ET la hauteur x d'une rangée */
  heightFill: (lab, k) => {
    const f = L.heightFillParts(lab);
    const g = L.rowsGcd(lab);
    const o = { g: $(String(g)), calc: $(`${g} \\times x = ${f.expected}`) };
    return {
      id: 'heightFill', kind: 'fill', prompt: Pq(k, 'heightFill.prompt', o),
      fields: [{ label: k('player.heightFill.label'), expected: f.expected, options: spinList(f.options, seedOf(lab) + 1), render: texNode }],
      hints: [Pq(k, 'heightFill.hint1'), Pq(k, 'heightFill.hint2', o)], explain: Pq(k, 'heightFill.explain', o),
    };
  },
  /* rows — BÂTIR « ka + kb = ▢(▢ + ▢) » ; UN leurre : le dernier terme NON divisé (le facteur « à moitié sorti ») */
  buildFactor: (lab, k) => {
    const bp = L.buildFactorParts(lab);
    const expr = L.rowsExprTex(lab);
    const decoyInner = [bp.inner[0], bp.decoy];
    const o = {
      expr: $(expr), eq: $(`${expr} = ${bp.expected[0]}(${termsTex(bp.inner)})`),
      decoy: $(`${bp.expected[0]}(${termsTex(decoyInner)}) = ${expandedTex(bp.common, decoyInner)}`),
    };
    return {
      id: 'buildFactor', kind: 'build', prompt: Pq(k, 'buildFactor.prompt', { expr: $(`${expr} = \\square(\\square ${bp.sign} \\square)`) }),
      slots: [k('player.build.slotHeight'), k('player.build.slotRowA'), k('player.build.slotRowB')],
      ops: ['(', bp.sign === '-' ? '−' : '+'], wrap: ['', ')'],
      tiles: spinList([...bp.expected, bp.decoyTex], seedOf(lab)), render: texNode,
      expected: bp.expected, accept: bp.accept,
      hints: [Pq(k, 'buildFactor.hint1'), Pq(k, 'buildFactor.hint2', o)], explain: Pq(k, 'buildFactor.explain', o),
    };
  },
  /* square — BÂTIR « x² + bx + c = (▢ + ▢)² » ; UN leurre : c lui-même (le coin pris pour le côté) */
  buildSquare: (lab, k) => {
    const bp = L.buildSquareParts(lab);
    const expr = L.squareExprTex(lab);
    const p = bp.expected[1];
    const big = [{ c: 1, p: 1 }, { c: lab.c, p: 0 }];
    const o = { expr: $(expr), eq: $(`${expr} = (x + ${p})^2`), p: $(p), c: $(String(lab.c)), decoy: $(`(x + ${lab.c})^2 = ${termsTex(expand(big, big))}`) };
    return {
      id: 'buildSquare', kind: 'build', prompt: Pq(k, 'buildSquare.prompt', { expr: $(`${expr} = (\\square + \\square)^2`) }),
      slots: [k('player.build.slotSide'), k('player.build.slotStrips')],
      ops: ['+'], wrap: ['(', ')²'],
      tiles: spinList([...bp.expected, bp.decoyTex], seedOf(lab)), render: texNode,
      expected: bp.expected, accept: bp.accept,
      hints: [Pq(k, 'buildSquare.hint1'), Pq(k, 'buildSquare.hint2', o)], explain: Pq(k, 'buildSquare.explain', o),
    };
  },
  /* LA RÈGLE du lecteur : la bonne option donne la RAISON du pavage (verdict, « The rule's right option gives the geometric reason ») */
  ruleP: (lab, k) => {
    const noSq = lab.mode === 'square' && !L.closable(lab);
    const fam = lab.mode === 'rows' ? 'rows' : noSq ? 'none' : 'square';
    const g = lab.mode === 'rows' ? L.rowsGcd(lab) : 0;
    let options;
    if (fam === 'rows') {
      options = [
        { text: <MathText>{k('rOpt2')}</MathText>, why: <MathText>{k('rWhy2')}</MathText> },
        { text: <MathText>{k('player.rOpt1')}</MathText>, correct: true },
        lab.m === 1
          ? { text: <MathText>{k('player.rOpt3')}</MathText>, why: <MathText>{k('player.rWhy3', { h: $(termTex({ c: g, p: lab.m }, { lead: true })), g: $(String(g)) })}</MathText> }
          : { text: <MathText>{k('rOpt3')}</MathText>, why: <MathText>{k('rWhy3', { g })}</MathText> },
      ];
    } else if (fam === 'square') {
      options = [
        { text: <MathText>{k('sOpt2')}</MathText>, why: <MathText>{k('sWhy2')}</MathText> },
        { text: <MathText>{k('sOpt3')}</MathText>, why: <MathText>{k('sWhy3')}</MathText> },
        { text: <MathText>{k('player.sOpt1')}</MathText>, correct: true },
      ];
    } else {
      options = discoveryOptions(lab, k, 'square', true);
    }
    return {
      id: 'rule', kind: 'choice', prompt: <MathText>{k(fam === 'rows' ? 'rPrompt' : fam === 'none' ? 'nPrompt' : 'sPrompt')}</MathText>,
      options,
      hints: [Cq(k, `rule.${fam}.hint1`), Cq(k, `rule.${fam}.hint2`)],
      explain: <Formal lab={lab} k={k} mode={lab.mode} noSquare={noSq} />,
    };
  },
});
