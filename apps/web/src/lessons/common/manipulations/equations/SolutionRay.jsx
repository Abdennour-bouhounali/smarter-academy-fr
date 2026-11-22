import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import { Minus, Plus, Check } from 'lucide-react';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import useStretchInteraction from '../useStretchInteraction';
import EquationDisplay from '../primitives/EquationDisplay';
import MathText from '../../components/MathText';
import { bidi } from '../../../../utils/bidi';
import * as L from '../logic/solutionRay';
import * as P from '../logic/solutionRayPlayer';
import { useLabCoach } from '../primitives/LabCoach';
import PredictTray from '../primitives/PredictTray';
import { useInMissionPlayer } from '../../mission/missionPlayerContext';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';

const { toNumber } = Lin;

/**
 * solution-ray — LE RAYON DES SOLUTIONS (unité 4 « معادلات ومتراجحات », leçon 3 « المتراجحات »).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. L'élève ÉTIRE x : un mobile sur une droite graduée (useStretchInteraction) ; puis il
 *    porte le CROCHET sur la borne (second étirement), choisit le côté coloré et
 *    l'orientation ; à متقدم il choisit une opération sur les deux membres puis le SENS
 *    de la ligne obtenue. Clavier (curseurs), −/+ et toucher de la piste font les mêmes gestes.
 * B. Idée : une inéquation est une متباينة vraie pour CERTAINS x ; ses solutions forment
 *    un rayon borné par un nombre ; multiplier / diviser par un négatif inverse le sens.
 * C. Pendant le geste, les deux membres (barres et valeurs) suivent x et le verdict
 *    صحيحة / خاطئة change ; chaque position validée laisse une trace rouge ou grise ;
 *    le crochet et la partie rouge se posent sur la droite ; chaque ligne acceptée trace
 *    son rayon au-dessus des MÊMES traces.
 * D. La comparaison calculée (−3 × (−4) + 5 = 17 et 17 ≤ 20), puis la chaîne
 *    −3x + 5 ≤ 20 → −3x ≤ 15 → x ≥ −5, et le dessin du manuel (rouge, crochet).
 * E. À découvrir avant la règle : les solutions sont d'un seul côté d'un nombre ; le
 *    crochet est tourné vers le rouge exactement quand la borne est solution ; le sens
 *    change quand on multiplie / divise par un négatif (et seulement alors).
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        حلول متراجحة من الدرجة الأولى : un rayon, sa borne, le sens (DNA §6 : « move a boundary »)
 *   OBJECT         une droite graduée du manuel, un mobile, le crochet de la borne
 *   VARIABLE       x (le mobile) ; puis la position et l'orientation du crochet ; puis le sens de chaque ligne
 *   INVARIANT      l'ensemble des solutions : les traces de l'élève ne changent pas de couleur
 *                  d'une ligne équivalente à l'autre (même rayon)
 *   TRANSFORMATION les valeurs des deux membres et le verdict, live ; la trace ; le rayon dessiné
 *   CONSTRAINT     une ligne n'est acceptée que si elle a les mêmes solutions ; un crochet que si
 *                  aucun nombre ne le contredit
 *   RESISTANCE     refus chiffré : « من أجل x = −5 : −3 × (−5) + 5 = 20 و 20 ≤ 20 صحيحة: الحدّ
 *                  حلّ — وجّه الرمز نحو الجزء الملوّن » ; ÷(−3) en gardant ≤ : « نقاطك الحمراء على
 *                  يمين −5، والمتراجحة x ≤ −5 تقول اليسار »
 *   EVIDENCE       les traces rouges / grises que l'élève a lui-même produites
 *   CONTRAST       une trace rouge ET une grise avant le crochet ; une étape qui garde le sens
 *                  (−5) ET une division par un négatif qui l'inverse
 *   PREDICTION     où commence le rouge ? le crochet vers le rouge ou non ? le sens de la ligne suivante ?
 *   DISCOVERY      region / bracket / flip (selon le niveau) — conjectures à distracteurs réfutables
 *   FORMALIZATION  معارف 3 et 4 (p. 48), طريقة p. 49
 *   TRANSFER       تمارين 21–32 ; QCM 5–9 ; ترييض مشكلة (leçon 4)
 *
 * QUESTIONS PENDANT LE LABO (prototype `primitives/LabCheckpoint`, déploiement lot 3, 2026-10-28) : une scène libre par niveau ; quand la
 * découverte du niveau est atteinte, une suite unique se pose PAR-DESSUS le labo (`CHAINS[mode]`) — sans crochet : le calcul à sa dernière trace
 * rouge · la valeur extrême qui reste solution (les mauvaises options sont réfutées par SES nombres : le voisin extérieur est faux, le voisin
 * intérieur n'est pas le dernier) · LA RÈGLE ; avec crochet : l'extrême · la borne est-elle solution et comment tourner le crochet · LA RÈGLE ;
 * متقدم : l'extrême · la ligne finale qui épouse ses points rouges (sens renversé, borne stricte) · LA RÈGLE (l'ancienne découverte, qui
 * formalise). Obligatoires pour tout élève ; l'enseignant seul les coupe pour SON compte (`checkpoints` = false les coupe aussi).
 * `onCheckpoint(ev)` : la trace pour les étapes du module. ÉTAPES `LabStepper` (`[data-sr-step=<i>]`) + fête ; « إعادة » repart de zéro ;
 * « أعِد التجربة » remet le rayon au départ. SON : `tooth` (x bougé), `bell` (ligne acceptée), `flag` (crochet posé, inéquation résolue),
 * `over` (crochet ou ligne refusés).
 *
 * MANUEL (§6bis) : chaque position, chaque crochet, chaque sens est une réponse.
 * DÉCOR (exigence du propriétaire) : le téléphone de يونس qui vibre quand on le touche
 * (contexte `phone`), le drapeau de juge de touche planté au crochet (sinon) — `aria-hidden`,
 * hors clavier (`tabIndex=-1`), sans effet sur l'état, immobile sous prefers-reduced-motion.
 *
 * Props : `ineq` (« -3x+5<=20 »), `context` ('phone' | undefined), `whole` (x entier ≥ 0),
 * `min` / `max` (la droite), `marks` (graduations soulignées, orientation seulement),
 * `bracket` (false : pas d'étape du crochet), `transform` (défaut : le niveau متقدم),
 * `onTrial({ kind: 'trace' | 'bracket' | 'step' | 'refusal', … })`, `onFinished`.
 */
/** Le temps pendant lequel un résultat de prédiction reste seul à l'écran avant la question de la manche. */
export const PRED_HOLD_MS = 1600;
const ringP = 'focus-visible:ring-indigo-600 focus-visible:ring-offset-2';
/** Lecteur : la place d'un bouton − / + au bout de la droite (44 px + 8 px d'écart) — la piste du crochet s'aligne sur la droite. */
const PLAYER_END = 42;   // 52 px moins le bord (2) et le rembourrage (8) de la section du crochet
const RED = '#DC2626';
const GREY = '#94A3B8';
const EDGE = 22;

export default function SolutionRay({
  ineq: ineq0 = '-3x+5<=20', context, whole, min, max, marks = [], bracket: withBracket = true, transform,
  title, lead, mission, level, levels: withLevels = true, checkpoints: cpOn = true, initialMode = 'student', allowModeSwitch = false, onFinished, onTrial, onCheckpoint,
  // ── LECTEUR DE MISSION (rollout 2026-11-11, unité 4 leçon 3) ──
  onVerdict, chains: chainsMode = 'none', predict: predictList = [], choices, start, sequence, sides, divide, handDone = false, coach: coachOn = true,
}) {
  const { t } = useTranslation('lesson');
  const gameScreen = useInMissionPlayer();
  const uid = useId();
  const k = useCallback((key, o) => t(`manipulation.solutionRay.${key}`, o), [t]);
  const reduce = useReducedMotion();
  const phone = context === 'phone';
  const isWhole = whole ?? phone;
  const [caseIdx, setCaseIdx] = useState(0);
  const caseRef = useRef(0);
  const cases = gameScreen && sequence?.length ? sequence : null;
  const state = useManipulation({ type: 'solution-ray', initialNumbers: { ineq: cases ? cases[0] : ineq0 }, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const ineqSrc = cases ? cases[caseIdx] : state.numbers.ineq;
  const primary = cases ? true : ineqSrc === ineq0;
  const doTransform = withBracket && (transform ?? state.level === 'advanced');
  const mode = doTransform ? 'flip' : withBracket ? 'bracket' : 'region';

  const makeFor = (src) => L.initLab({ ineq: src, whole: isWhole, min: gameScreen && !primary ? undefined : min, max: gameScreen && !primary ? undefined : max });
  const make = () => makeFor(cases ? cases[caseRef.current] : ineqSrc);
  const [lab, setLab] = useState(make);
  const sceneKey = `${state.numbers.ineq}:${state.epoch}:${state.resetCount}`;
  const [scene, setScene] = useState({ key: sceneKey, inits: 0 });
  const [live, setLive] = useState(null);
  const [last, setLast] = useState(null);           // dernière trace validée (pour aria-live)
  const [draft, setDraft] = useState({ k: null, side: null, toward: null });
  const [bLive, setBLive] = useState(null);
  const [verdict, setVerdict] = useState(null);     // refus / acceptation du crochet
  const [card, setCard] = useState(null);           // carte d'opération choisie
  const [stepMsg, setStepMsg] = useState(null);     // refus / acceptation d'une ligne
  const [shake, setShake] = useState(0);            // décor
  // Miroir synchrone de `lab` : « جرّب كل الإمكانيات » enchaîne des pas plus vite qu'un rendu.
  const labRef = useRef(lab);
  labRef.current = lab;
  // lecteur : les suites finies, les prédictions (clé → juste ?), celles posées, les résultats montrés, les essais déjà annoncés (une clé par essai)
  const [doneIds, setDoneIds] = useState([]);
  const [preds, setPreds] = useState({});
  const asked = useRef(new Set());
  const sent = useRef(new Set());
  const refusedSeen = useRef(0);
  const discoveredSent = useRef(false);
  const heardPred = useRef(new Set());
  const [shownPreds, setShownPreds] = useState([]);
  const [predHold, setPredHold] = useState(false);
  const holdTimer = useRef(null);
  const [choiceSaid, setChoiceSaid] = useState(null);
  const [gesture, setGesture] = useState(0);
  const [trail, setTrail] = useState([]);          // lecteur : les graduations relâchées, dans l'ordre
  const [missionBig, setMissionBig] = useState(false);
  const [doneCases, setDoneCases] = useState([]);
  const resetScene = () => {
    setLab(make()); setLive(null); setLast(null); setTrail([]);
    setDraft({ k: null, side: null, toward: null }); setBLive(null); setVerdict(null); setCard(null); setStepMsg(null);
  };
  // lecteur : « أعِد التجربة » — la droite repart de zéro (et de la première متراجحة d'une manche à deux cas) ; la manche oublie ce qu'elle défait
  const retryPlayer = () => {
    caseRef.current = 0; setCaseIdx(0); setDoneCases([]);
    sent.current = new Set(); refusedSeen.current = 0; discoveredSent.current = false;
    setLab(makeFor(cases ? cases[0] : ineqSrc)); setLive(null); setLast(null); setTrail([]);
    setDraft({ k: null, side: null, toward: null }); setBLive(null); setVerdict(null); setCard(null); setStepMsg(null);
    state.report(onTrial, { tk: 'retry' });
  };
  // « إعادة » (resetCount), un autre niveau ou d'autres nombres : TOUT recommence — le rayon, les traces et les questions du labo
  if (scene.key !== sceneKey) {
    setScene({ key: sceneKey, inits: scene.inits + 1 });
    if (gameScreen) {
      caseRef.current = 0; setCaseIdx(0); setDoneCases([]);
      setDoneIds([]); setPreds({}); asked.current = new Set(); sent.current = new Set(); refusedSeen.current = 0; discoveredSent.current = false;
      heardPred.current = new Set(); setShownPreds([]); setPredHold(false);
    }
    resetScene();
  }
  // la manche (LabRounds) repart de zéro avec la scène : ses essais et prédictions d'avant ne comptent plus
  useEffect(() => { if (gameScreen && scene.inits > 0) state.report(onTrial, { tk: 'reset' }); }, [scene.inits]); // eslint-disable-line react-hooks/exhaustive-deps

  const lastCase = !cases || caseIdx === cases.length - 1;
  const divStage = gameScreen && mode === 'flip' && !!lab.bracket && divide === 'coef' && P.isDivisionStage(L.current(lab));
  const ready = gameScreen
    ? (mode === 'region' ? P.borderSeen(lab) : !!lab.bracket)
    : (mode === 'region' ? L.regionDiscoveryReady(lab) : mode === 'bracket' ? L.bracketDiscoveryReady(lab) : L.flipDiscoveryReady(lab));
  // les questions pendant le labo : une suite unique quand la découverte est atteinte ; celle qui finit par la règle remplace la découverte automatique
  const cpSettings = useLabCheckpointSettings('solution-ray');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const cpLive = cpOn && cpSettings.enabled;
  const chain = !gameScreen && cpLive ? CHAINS[mode] : null;
  // ── le lecteur : les suites de la manche (CHAINS_PLAYER), posées quand ce qu'elles interrogent est là, après les résultats des prédictions ──
  const playerChains = gameScreen ? (CHAINS_PLAYER[chainsMode] ?? []) : [];
  const chainCtx = { lastCase, divStage, cases };
  const predKeys = gameScreen ? predictList.filter(P.PREDICT_KEYS_OK).slice(0, 2) : [];
  const judgedPreds = gameScreen ? P.judgedPredictions(lab, predKeys.filter((key) => key in preds), ready) : [];
  const pendingPreds = judgedPreds.filter((key) => !heardPred.current.has(key));
  const holdChain = pendingPreds.length > 0 || predHold;
  const playerPending = gameScreen && cpLive && !holdChain ? playerChains.find((c) => c.reached(lab, chainCtx) && !doneIds.includes(c.id)) ?? null : null;
  /** lecteur : un ESSAI nouveau est annoncé une seule fois ; le premier refus de la manche est gratuit */
  const emitVerdict = (key, groups, exact) => {
    if (!gameScreen || sent.current.has(key)) return;
    sent.current.add(key);
    const free = !exact && refusedSeen.current === 0;
    if (!exact) refusedSeen.current += 1;
    state.report(onVerdict, { groups, exact, ...(free ? { free: true } : {}) });
  };
  /** lecteur : la division BÂTIE est juste → la ligne finale s'ajoute à la chaîne (l'indigo couvre ses points rouges) */
  const finishDivision = () => {
    const cur = labRef.current;
    if (!P.isDivisionStage(L.current(cur))) return;
    const parts = P.divisionParts(cur);
    const r = L.chooseStep(cur, parts.card, parts.rel);
    labRef.current = r.lab; setLab(r.lab); setGesture((g) => g + 1);
    playSfx('flag');
    emitVerdict(`c${caseRef.current}:s${cur.steps.length}:ok`, cur.steps.length + 1, true);
  };
  const cp = useLabCheckpoint({
    id: gameScreen ? playerPending?.id ?? null : (chain ? ineqSrc : null),
    questions: gameScreen
      ? (playerPending ? playerPending.qs.map((q) => QUESTIONS_P[q](lab, k, chainCtx)) : null)
      : (chain && ready ? chain.map((q) => QUESTIONS[q](lab, k, { mode, phone })) : null),
    reached: gameScreen ? !!playerPending : ready,
    resetKey: scene.inits,
    onRetry: gameScreen ? retryPlayer : resetScene,
    onEvent: (ev) => state.report(gameScreen ? onTrial : onCheckpoint, ev),   // {tk:'checkpoint'|'checkpoint-done', id: ineq, …} — la TRACE que les étapes du module relisent
    onDone: (id) => {
      if (gameScreen) {
        setDoneIds((d) => (d.includes(id) ? d : [...d, id]));
        const qs = playerChains.find((c) => c.id === id)?.qs ?? [];
        if (qs.includes('buildDiv')) finishDivision();
        if (qs.some((q) => /^rule/.test(q))) { state.discover(); state.formalize(); }
        return;
      }
      state.discover(); state.formalize();
    },
  });
  useEffect(() => { if (ready && !cpLive && !gameScreen) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  // lecteur : la découverte du labo (la frontière épinglée), annoncée une fois à la manche
  useEffect(() => {
    if (gameScreen && mode === 'region' && ready && !discoveredSent.current) { discoveredSent.current = true; state.report(onTrial, { tk: 'discovered' }); }
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  // une étape est FAITE quand son objectif est atteint ET (la dernière) ses questions répondues : la pastille passe au vert et on fête
  const stepDone = (mode === 'region'
    ? [lab.traces.length >= 2, L.hasContrast(lab), ready]
    : [L.hasContrast(lab), !!lab.bracket, ready]).map((d, i, a) => (i === a.length - 1 ? d && !cp.blocking : d));
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
  useEffect(() => { if (state.isFormal) state.report(onFinished, state.numbers); }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── la géométrie de la droite ── */
  const boxRef = useRef(null);
  // lecteur : la droite est REMONTÉE quand la colonne change de mise en page (question ouverte) — on observe l'élément vivant (callback ref)
  const [lineEl, setLineEl] = useState(null);
  const [width, setWidth] = useState(320);
  useLayoutEffect(() => {
    const el = lineEl ?? boxRef.current;
    if (!el) return undefined;
    const measure = () => setWidth(Math.max(260, Math.floor(el.clientWidth)));
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [lineEl]);
  const span = Math.max(1, lab.kmax - lab.kmin);
  const mu = (width - 2 * EDGE) / span;
  const xOf = (kk) => EDGE + (kk - lab.kmin) * mu;
  const toValue = useCallback((clientX, _y, rect) => lab.kmin + (clientX - rect.left - EDGE) / mu, [lab.kmin, mu]);
  const range = { min: lab.kmin, max: lab.kmax };
  const xs = (kk) => L.numText(L.xOfK(lab, kk));

  /* ── lecteur : la PRÉDICTION, avant le premier geste ; les commandes sont figées pendant elle et pendant une question ── */
  const untouched = lab.traces.length === 0 && live == null && !lab.bracket && draft.k == null;
  const nextPred = predKeys.find((key) => !asked.current.has(key)) ?? null;
  const predictOpen = gameScreen && cpLive && !cp.open && !missionBig && untouched && nextPred != null;
  const locked = gameScreen && (cp.open || predictOpen);
  const lockedRef = useRef(false);
  lockedRef.current = locked;
  const sayPredict = (says) => {
    const key = nextPred;
    const ok = String(says) === String(P.predictTruth(lab, key));
    asked.current.add(key);
    playSfx('pop');
    setPreds((m) => ({ ...m, [key]: ok }));
    state.report(onTrial, { tk: 'predict', ok });
    if (!predKeys.some((x) => x !== key && !asked.current.has(x))) {
      setTimeout(() => boxRef.current?.querySelector('[data-ray-probe]')?.focus(), 60);
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

  /* ── geste 1 : le mobile ── */
  // lecteur : chaque manche fixe SON départ (jamais `defaultK`, que la page ferait tomber sur la borne ou son voisin)
  const defK = gameScreen ? (start != null && primary ? start * lab.den : lab.kmin) : L.defaultK(lab);
  const heard = useRef(0);
  const tick = () => { const now = Date.now(); if (now - heard.current > 35) { playSfx('tooth'); heard.current = now; } };
  const trace = (v) => {
    if (!L.inRange(labRef.current, v)) return;
    if (gameScreen) { setGesture((g) => g + 1); setTrail((tl) => [...tl.filter((x) => x !== v), v]); if (mode === 'region') emitVerdict(`t${v}`, v, true); }
    tick();
    const e = L.evaluate(labRef.current, v);
    labRef.current = L.addTrace(labRef.current, v);
    setLab((s) => L.addTrace(s, v));
    setLast(e);
    state.report(onTrial, { kind: 'trace', k: v, x: xs(v), ok: e.ok });
  };
  const untraced = () => Array.from({ length: labRef.current.kmax - labRef.current.kmin + 1 }, (_, i) => labRef.current.kmin + i).filter((v) => !labRef.current.traces.some((tr) => tr.k === v));
  const probe = useStretchInteraction({
    value: live ?? last?.k ?? defK, range, toValue, onChange: (v) => { if (!lockedRef.current) setLive(v); }, direction: 'ltr',
    onCommit: (v) => { setLive(null); if (!lockedRef.current) trace(v); },
  });
  // Une graduation PAR DÉFAUT (L.defaultK : hors solution, jamais la borne) : le mobile n'est pas posé « nulle part ».
  // Ce n'est pas une trace : `lab.traces` ne la contient pas, `last` reste vide.
  const pk = live ?? last?.k ?? defK;
  const pe = L.evaluate(lab, pk);

  /* ── geste 2 : le crochet ── */
  const bracketOpen = withBracket && L.hasContrast(lab) && !lab.bracket;
  const bk = bLive ?? draft.k;
  const bStretch = useStretchInteraction({
    value: bk, range, toValue, onChange: setBLive, direction: 'ltr',
    onCommit: (v) => { setBLive(null); if (lockedRef.current) return; setDraft((d) => ({ ...d, k: v })); setVerdict(null); },
  });
  const fix = () => {
    if (lockedRef.current) return;
    if (draft.k == null || draft.side == null || draft.toward == null) { setVerdict({ tone: 'ko', key: 'bracketIncomplete' }); return; }
    const v = L.checkBracket(lab, draft);
    if (v === true) {
      setLab((s) => L.placeBracket(s, draft));
      playSfx('flag');
      setVerdict({ tone: 'ok', key: 'bracketOk' });
      state.report(onTrial, { kind: 'bracket', k: draft.k, x: xs(draft.k), side: draft.side, toward: draft.toward, glyph: L.glyphOf(draft.side, draft.toward) });
      if (gameScreen) { setGesture((g) => g + 1); emitVerdict(`c${caseRef.current}:ok`, caseRef.current, true); }
    } else {
      setVerdict({ tone: 'ko', key: v.reason, witness: v.witness });
      playSfx('over');
      state.report(onTrial, { kind: 'refusal', what: 'bracket', reason: v.reason });
      if (gameScreen) { setGesture((g) => g + 1); emitVerdict(`c${caseRef.current}:b:${draft.k}|${draft.side}|${draft.toward}`, caseRef.current, false); }
    }
  };
  /** lecteur : la manche à deux cas passe à la متراجحة suivante (la même borne) une fois le crochet de la première posé */
  const nextCase = () => {
    const i = caseRef.current + 1;
    if (!cases || i >= cases.length) return;
    const done = labRef.current;
    if (!done.bracket) return;
    const entry = { tex: L.ineqTex(done.ineq), glyph: L.glyphOf(done.bracket.side, done.bracket.toward) };
    setDoneCases((d) => [...d, entry]);
    caseRef.current = i; setCaseIdx(i);
    const fresh = makeFor(cases[i]);
    labRef.current = fresh; setLab(fresh);
    setLive(null); setLast(null); setTrail([]); setDraft({ k: null, side: null, toward: null }); setBLive(null); setVerdict(null); setCard(null); setStepMsg(null); setGesture((g) => g + 1);
  };

  /* ── geste 3 : transformer (متقدم) ── */
  const cur = L.current(lab);
  const cards = doTransform && lab.bracket && !divStage ? L.cardsFor(cur, divide) : [];
  const cands = card ? L.candidates(lab, card) : null;
  const choose = (rel) => {
    if (lockedRef.current) return;
    const r = L.chooseStep(lab, card, rel);
    if (gameScreen) {
      setGesture((g) => g + 1);
      const n = lab.steps.length;
      if (r.accepted) emitVerdict(`c${caseRef.current}:s${n}:ok`, n + 1, true);
      else emitVerdict(`c${caseRef.current}:s${n}:${L.cardTex(card)}|${rel}`, n + 1, false);
    }
    setLab(r.lab);
    if (r.accepted) {
      playSfx(L.transformDone(r.lab) ? 'flag' : 'bell');
      setStepMsg({ tone: 'ok' });
      state.report(onTrial, { kind: 'step', op: card.op, opTex: L.cardTex(card), ineq: L.ineqTex(L.current(r.lab)), flipped: L.isNegativeScaling(card) });
      setCard(null);
    } else {
      playSfx('over');
      setStepMsg({ tone: 'ko', reason: r.reason, proposed: r.proposed, witness: r.witness });
      state.report(onTrial, { kind: 'refusal', what: 'step', reason: r.reason, opTex: L.cardTex(card) });
    }
  };

  /* ── textes calculés ── */
  const calcTex = (e) => [L.sideTex(lab.ineq.L, e.x), L.sideTex(lab.ineq.R, e.x)].filter(Boolean).join(' \\quad ');
  const cmpTex = (e) => `${L.numTex(e.left)} ${L.relTex(lab.ineq.rel)} ${L.numTex(e.right)}`;
  const witnessLine = (e) => k('witnessLine', { x: L.numTex(e.x), calc: calcTex(e) ? `$${calcTex(e)}$ ،` : '', cmp: cmpTex(e), verdict: k(e.ok ? 'isTrue' : 'isFalse') });
  const sideWord = (s) => k(s === 'left' ? 'sideLeftWord' : 'sideRightWord');
  const boundTex = L.numTex(lab.sol.bound);

  /* ── lecteur : le verdict est CACHÉ pendant le glisser (la libération est la pression, L3.2) ── */
  const traced = lab.traces.some((tr) => tr.k === pk);
  const shownV = !gameScreen || (traced && live == null && !probe.dragging);

  /* ── barres des deux membres ── */
  const ends = [lab.kmin, lab.kmax].map((kk) => L.evaluate(lab, kk));
  const vals = ends.flatMap((e) => [toNumber(e.left), toNumber(e.right)]);
  const vLo = Math.min(0, ...vals);
  const vHi = Math.max(0, ...vals);
  const pct = (v) => ((v - vLo) / Math.max(1e-9, vHi - vLo)) * 100;
  const Bar = ({ v, color, label, data, hide }) => {
    const a = pct(0); const b = pct(toNumber(v));
    return (
      <div className="flex items-center gap-2" data-member={data}>
        <span className="w-20 shrink-0 text-xs font-bold text-slate-600">{label}</span>
        <div className="relative h-4 flex-1 rounded bg-slate-100" dir="ltr" aria-hidden="true">
          <div className="absolute inset-y-0 w-px bg-slate-400" style={{ left: `${a}%` }} />
          <div className="absolute inset-y-0.5 rounded" style={{ left: `${Math.min(a, b)}%`, width: `${Math.abs(b - a)}%`, background: color, transition: reduce ? 'none' : 'width 120ms, left 120ms' }} />
        </div>
        <span className="w-16 shrink-0 text-end font-mono text-sm font-bold text-slate-800" dir="ltr">{hide ? '؟' : L.numText(v)}</span>
      </div>
    );
  };

  /* ── la droite graduée (SVG, LTR) ── */
  const H = 112; const Y = 74;
  const nUnits = (lab.kmax - lab.kmin) / lab.den;
  const labelEvery = nUnits > 16 ? 5 : 1;
  const shownBracket = lab.bracket ?? (bracketOpen && bk != null ? { k: bk, side: draft.side, toward: draft.toward } : null);
  const solid = !!lab.bracket;
  const curRay = doTransform && lab.chain.length > 1 ? L.rayOf(cur) : null;
  const badRay = stepMsg?.tone === 'ko' && stepMsg.proposed ? L.rayOf(stepMsg.proposed) : null;
  const rayK = (ray) => (ray.bound.n * lab.den) / ray.bound.d;
  const band = (ray, y, fill, dash) => {
    const b = xOf(rayK(ray));
    const [x0, x1] = L.sideOf(ray) === 'left' ? [EDGE - 6, b] : [b, width - EDGE + 6];
    return <rect x={x0} y={y} width={Math.max(0, x1 - x0)} height={8} rx={3} fill={fill} stroke={dash ? '#BE123C' : 'none'} strokeDasharray={dash ? '4 3' : undefined} opacity={0.75} />;
  };
  const glyphPath = (bx, side, toward) => {
    const g = L.glyphOf(side ?? 'left', toward ?? true);
    const dir = g === ']' ? -1 : 1;
    return `M ${bx + dir * 9} ${Y - 16} L ${bx} ${Y - 16} L ${bx} ${Y + 16} L ${bx + dir * 9} ${Y + 16}`;
  };

  const line = (
    <div className="relative" dir="ltr" style={{ height: H }}>
      <svg width={width} height={H} className="absolute inset-0" aria-hidden="true" focusable="false" data-ray-line>
        {curRay && band(curRay, 22, '#C7D2FE')}
        {badRay && band(badRay, 10, '#FFE4E6', true)}
        {/* la partie rouge (convention du manuel) */}
        {shownBracket && shownBracket.side && (() => {
          const b = xOf(shownBracket.k);
          const [x0, x1] = shownBracket.side === 'left' ? [EDGE - 10, b] : [b, width - 8];
          return <line x1={x0} x2={x1} y1={Y} y2={Y} stroke={RED} strokeWidth={solid ? 5 : 3} strokeDasharray={solid ? undefined : '6 4'} data-ray-red={solid ? 'solid' : 'draft'} />;
        })()}
        <line x1={EDGE - 12} x2={width - 6} y1={Y} y2={Y} stroke="#334155" strokeWidth={1.6} />
        <path d={`M ${width - 6} ${Y} l -8 -5 l 0 10 z`} fill="#334155" />
        {Array.from({ length: lab.kmax - lab.kmin + 1 }, (_, i) => lab.kmin + i).map((kk) => {
          const integer = kk % lab.den === 0;
          const n = kk / lab.den;
          const labelled = integer && n % labelEvery === 0;
          const marked = integer && marks.includes(n);
          return (
            <g key={kk}>
              <line x1={xOf(kk)} x2={xOf(kk)} y1={Y - (integer ? 6 : 3)} y2={Y + (integer ? 6 : 3)} stroke="#475569" strokeWidth={integer ? 1.3 : 0.8} />
              {(labelled || marked) && <text x={xOf(kk)} y={Y + 22} textAnchor="middle" fontSize={11} fontWeight={marked ? 'bold' : 'normal'} fill={marked ? '#1D4ED8' : '#334155'} fontFamily="ui-monospace, monospace">{n}</text>}
            </g>
          );
        })}
        {shownBracket && (
          <path d={glyphPath(xOf(shownBracket.k), shownBracket.side, shownBracket.toward)} fill="none" stroke={solid ? RED : '#7F1D1D'} strokeWidth={2.6} strokeDasharray={shownBracket.side && shownBracket.toward != null ? undefined : '3 3'} data-ray-glyph={L.glyphOf(shownBracket.side ?? 'left', shownBracket.toward ?? true)} />
        )}
        {/* les traces de l'élève */}
        {lab.traces.map((tr) => (
          <circle key={tr.k} cx={xOf(tr.k)} cy={Y - 24} r={6} fill={tr.ok ? RED : (gameScreen ? '#fff' : GREY)} stroke={gameScreen && !tr.ok ? GREY : '#fff'} strokeWidth={gameScreen && !tr.ok ? 2.5 : 1.5} data-trace={tr.k} data-ok={String(tr.ok)} />
        ))}
      </svg>
      {/* étiquette de la borne fractionnaire : îlot LTR, sous la droite */}
      {lab.bracket && lab.den > 1 && (
        <span className="absolute -translate-x-1/2 text-xs font-bold text-red-700" style={{ left: xOf(lab.bracket.k), top: Y + 26 }} data-ray-bound><MathText>{`$${boundTex}$`}</MathText></span>
      )}
      {lab.bracket && (
        <span className="absolute text-[11px] font-bold text-red-700" dir="rtl" style={{ top: Y - 50, ...(lab.bracket.side === 'left' ? { left: EDGE, maxWidth: Math.max(60, xOf(lab.bracket.k) - EDGE - 18) } : { left: xOf(lab.bracket.k) + 16 }) }} data-ray-solutions-label>{k('solutionsLabel')}</span>
      )}
      {/* décor : le drapeau du juge de touche, planté au crochet (hors contexte téléphone) */}
      {lab.bracket && !phone && (
        <button type="button" tabIndex={-1} aria-hidden="true" onClick={() => setShake((n) => n + 1)} data-decor-flag
          className="absolute h-11 w-8" style={{ left: xOf(lab.bracket.k) - 4, top: Y - 66 }}>
          <svg width="28" height="40" viewBox="0 0 28 40" style={{ transformOrigin: '2px 38px', transform: reduce ? 'none' : `rotate(${shake % 2 ? -10 : 0}deg)`, transition: reduce ? 'none' : 'transform 160ms' }}>
            <line x1="2" y1="4" x2="2" y2="38" stroke="#334155" strokeWidth="2" />
            <path d="M3 4 h10 v5 h-10 z" fill="#FACC15" /><path d="M13 4 h10 v5 h-10 z" fill="#DC2626" />
            <path d="M3 9 h10 v5 h-10 z" fill="#DC2626" /><path d="M13 9 h10 v5 h-10 z" fill="#FACC15" />
          </svg>
        </button>
      )}
      {/* la piste du mobile : toute la droite */}
      <div {...probe.trackProps} className="absolute inset-x-0 top-[40px] h-[56px]" style={{ ...probe.trackProps.style }} data-ray-track>
        <div
          {...probe.handleProps({ label: k('probeLabel'), valueText: k('probeValue', { x: xs(pk) }) })}
          className={`absolute top-0 flex h-11 w-11 -translate-x-1/2 items-start justify-center rounded-xl border-2 outline-none focus-visible:ring-4 focus-visible:ring-blue-300 ${probe.dragging ? 'border-blue-500 bg-blue-500/10' : 'border-slate-400 bg-white/40'}`}
          style={{ left: xOf(pk), cursor: probe.dragging ? 'grabbing' : 'grab' }}
          data-ray-probe
        >
          <span className={`-mt-3 rounded-full px-2 font-mono text-xs font-extrabold text-white ${pe && shownV ? (pe.ok ? 'bg-red-600' : 'bg-slate-500') : 'bg-slate-700'}`}>{gameScreen && pe && shownV ? <span aria-hidden="true">{pe.ok ? '● ' : '○ '}</span> : null}{xs(pk)}</span>
        </div>
      </div>
    </div>
  );

  /* ── représentation (aria-live) : la dernière trace validée ── */
  // Au repos, sans trace encore : la conséquence de la graduation par défaut (la ligne ne prétend pas que l'élève l'a posée).
  const lastE = last ? L.evaluate(lab, last.k) : L.evaluate(lab, defK);
  const solWord = mode !== 'region';
  const representation = lastE && !live ? (
    <EquationDisplay tone={lastE.ok ? 'ok' : 'ko'} tex={`x = ${L.numTex(lastE.x)} : \\; ${calcTex(lastE) ? `${calcTex(lastE)} \\quad ` : ''}${cmpTex(lastE)}`}
      note={k(lastE.ok ? (solWord ? 'noteTrueSol' : 'noteTrue') : (solWord ? 'noteFalseSol' : 'noteFalse'))} />
  ) : null;

  /* ── découvertes ── */
  const discoveryOptions = discoveryOptionsOf(lab, k, mode);
  const formal = <RayFormal lab={lab} k={k} mode={mode} />;

  const shownTitle = title ?? k(phone ? 'titlePhone' : 'title', { ineq: `\u2066${L.ineqPlain(lab.ineq)}\u2069` });
  const shownMission = mission ?? k(phone ? 'missionPhone' : mode === 'region' ? 'missionRegion' : mode === 'bracket' ? 'missionBracket' : 'missionFlip');
  const hintKeys = { region: ['gHint1', 'gHint2', 'gHint3'], bracket: ['gHint1', 'bHint2', 'bHint3'], flip: ['gHint1', 'fHint2', 'fHint3'] }[mode];

  // lecteur : l'anneau indigo-600 décalé (contraste ≥ 3:1, revue a11y 2026-11-11) ; la page garde le sien
  const btn = `inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border-2 px-3 text-sm font-bold focus:outline-none ${gameScreen ? `focus-visible:ring-2 ${ringP}` : 'focus-visible:ring-4 focus-visible:ring-blue-300'}`;
  const pick = (on) => (on ? 'border-red-600 bg-red-50 text-red-900' : 'border-slate-300 bg-white text-slate-700');

  /* ── les deux étapes (crochet, transformation) : partagées par la page et le lecteur ── */
  const sectionsNode = (
    <>
          {/* ── étape 2 : le crochet ── */}
          {withBracket && (
            <section className="space-y-2 rounded-xl border-2 border-dashed border-red-200 bg-white/70 p-2" data-ray-bracket data-placed={String(!!lab.bracket)}>
              <h4 className="text-sm font-extrabold text-red-900">{k('bracketTitle')}</h4>
              {!L.hasContrast(lab) && <p className="text-sm text-slate-600">{k('needContrast')}</p>}
              {bracketOpen && (
                <>
                  <p className="text-sm text-slate-700">{k('bracketLead')}</p>
                  <div {...bStretch.trackProps} className="relative h-12 rounded-lg bg-red-50/70" dir="ltr" style={{ ...bStretch.trackProps.style, ...(gameScreen ? { marginInline: PLAYER_END } : {}) }} data-ray-bracket-track>
                    <div
                      {...bStretch.handleProps({ label: k('bracketHandle'), valueText: bk == null ? k('bracketNotSet') : k('bracketValue', { x: xs(bk) }) })}
                      className={`absolute top-0.5 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-xl border-2 font-mono text-xl font-black text-red-700 outline-none focus-visible:ring-4 focus-visible:ring-blue-300 ${bStretch.dragging ? 'border-blue-500 bg-blue-50' : 'border-red-300 bg-white'}`}
                      style={{ left: xOf(bk ?? lab.kmin), opacity: bk == null ? 0.6 : 1 }}
                      data-ray-bracket-handle
                    >
                      {L.glyphOf(draft.side ?? 'left', draft.toward ?? true)}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2" data-ray-sides {...(gameScreen ? { role: 'group', 'aria-label': k('bracketLead') } : {})}>
                    <button type="button" className={`${btn} ${pick(draft.side === 'left')}`} aria-pressed={draft.side === 'left'} onClick={() => { setDraft((d) => ({ ...d, side: 'left' })); setVerdict(null); }} data-ray-side="left">{k('sideLeft')}</button>
                    <button type="button" className={`${btn} ${pick(draft.side === 'right')}`} aria-pressed={draft.side === 'right'} onClick={() => { setDraft((d) => ({ ...d, side: 'right' })); setVerdict(null); }} data-ray-side="right">{k('sideRight')}</button>
                  </div>
                  <div className="flex flex-wrap gap-2" data-ray-towards {...(gameScreen ? { role: 'group', 'aria-label': k('bracketTitle') } : {})}>
                    <button type="button" className={`${btn} ${pick(draft.toward === true)}`} aria-pressed={draft.toward === true} onClick={() => { setDraft((d) => ({ ...d, toward: true })); setVerdict(null); }} data-ray-toward="true">{k('toward')}</button>
                    <button type="button" className={`${btn} ${pick(draft.toward === false)}`} aria-pressed={draft.toward === false} onClick={() => { setDraft((d) => ({ ...d, toward: false })); setVerdict(null); }} data-ray-toward="false">{k('away')}</button>
                  </div>
                  <button type="button" onClick={fix} className={`${btn} border-red-600 bg-red-600 text-white`} data-ray-fix>
                    <Check className="h-5 w-5" aria-hidden="true" /> {k('fix')}
                  </button>
                </>
              )}
              {lab.bracket && (
                <p className="text-sm font-bold text-red-900" data-ray-bracket-done>
                  <MathText>{k('bracketDone', { x: boundTex, glyph: `\u2066${L.glyphOf(lab.bracket.side, lab.bracket.toward)}\u2069`, side: sideWord(lab.bracket.side) })}</MathText>
                </p>
              )}
              <p className="min-h-[1.25rem] text-sm" aria-live="polite" data-ray-verdict={verdict?.key ?? ''}>
                {verdict && verdict.tone === 'ko' && (
                  <span className="text-rose-800">
                    <MathText>{verdict.witness
                      ? (verdict.key === 'glyph'
                        ? k(verdict.witness.ok ? 'refuseGlyphToward' : 'refuseGlyphAway', { line: witnessLine(verdict.witness) })
                        : k(verdict.witness.ok ? 'refuseOut' : 'refuseIn', { line: witnessLine(verdict.witness) }))
                      : k(verdict.key)}</MathText>
                  </span>
                )}
              </p>
            </section>
          )}

          {/* ── étape 3 : transformer l'inéquation (متقدم) ── */}
          {doTransform && lab.bracket && (
            <section className="space-y-2 rounded-xl border-2 border-indigo-200 bg-white/80 p-2" data-ray-transform data-done={String(L.transformDone(lab))}>
              <h4 className="text-sm font-extrabold text-indigo-900">{k('transformTitle')}</h4>
              <ol className="space-y-1" dir="ltr" data-ray-chain>
                {lab.chain.map((I, i) => (
                  <li key={i} className="flex flex-wrap items-center gap-2 font-mono text-sm">
                    {i > 0 && <span className="rounded-full bg-indigo-100 px-2 text-xs text-indigo-800"><MathText>{`$${L.cardTex(lab.steps[i - 1])}$`}</MathText></span>}
                    <MathText>{`$${L.ineqTex(I)}$`}</MathText>
                  </li>
                ))}
              </ol>
              {!L.transformDone(lab) && (
                <>
                  {(!gameScreen || cards.length > 0 || cands) && <p className="text-sm text-slate-700">{k('transformLead')}</p>}
                  <div className="flex flex-wrap gap-2" data-ray-cards>
                    {cards.map((c) => {
                      const on = card && card.op === c.op && Lin.eq(card.k, c.k);
                      return (
                        <button key={`${c.op}:${L.numText(c.k)}`} type="button" className={`${btn} ${on ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'border-slate-300 bg-white text-slate-800'}`}
                          aria-pressed={!!on} aria-label={k('cardAria', { op: L.cardTex(c).replace('\\div', '÷').replace('\\times', '×').replace(/\{,\}/g, ',') })} onClick={() => { setCard(c); setStepMsg(null); }} data-ray-card={L.cardTex(c)}>
                          <span dir="ltr"><MathText>{`$${L.cardTex(c)}$`}</MathText></span>
                        </button>
                      );
                    })}
                  </div>
                  {cands && !cands.refused && (
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-700">{k('chooseLine')}</p>
                      <div className="flex flex-wrap gap-2" dir="ltr" data-ray-choices>
                        {[cands.kept, cands.flipped].map((I) => (
                          <button key={I.rel} type="button" className={`${btn} border-slate-300 bg-white text-slate-800`} onClick={() => choose(I.rel)} data-ray-choice={I.rel}>
                            <MathText>{`$${L.ineqTex(I)}$`}</MathText>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              <p className="min-h-[1.25rem] text-sm" aria-live="polite" data-ray-step={stepMsg?.tone ?? ''}>
                {stepMsg?.tone === 'ok' && !L.transformDone(lab) && <span className="text-emerald-800">{k('stepOk')}</span>}
                {L.transformDone(lab) && <span className="font-bold text-emerald-800"><MathText>{k('solvedNote', { ineq: L.ineqTex(cur), first: L.ineqTex(lab.ineq) })}</MathText></span>}
                {stepMsg?.tone === 'ko' && stepMsg.witness && (
                  <span className="text-rose-800">
                    <MathText>{k('refuseStep', {
                      red: sideWord(L.sideOf(lab.sol)), bound: boundTex, p: L.ineqTex(stepMsg.proposed), pside: sideWord(L.sideOf(L.rayOf(stepMsg.proposed))),
                      line: witnessLine(stepMsg.witness),
                    })}</MathText>
                  </span>
                )}
              </p>
            </section>
          )}
    </>
  );

  /* ══════════════ LECTEUR DE MISSION : la scène du jeu (la page garde son rendu ci-dessous, inchangé) ══════════════ */
  const sidesL = sides?.left ?? k(phone ? 'costLabel' : 'leftLabel');
  const sidesR = sides?.right ?? k(phone ? 'creditLabel' : 'rightLabel');
  const buildChain = playerChains.find((c) => c.qs.includes('buildIneq'));
  const hideIneq = gameScreen && !!buildChain && !doneIds.includes(buildChain.id);
  const regionDone = mode === 'region' && ready;
  const coachRaw = gameScreen && coachOn && !locked ? P.coachOf(lab, { mode, done: regionDone, draft, card: !!card, divStage }) : null;
  // un objet STABLE par étape (son id fixe la cible et le geste) : LabCoach ne se réabonne pas à chaque geste
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const coachStep = useMemo(() => coachRaw, [coachRaw?.id]);
  const coachNode = useLabCoach({
    lab: 'solution-ray', step: coachStep, text: coachStep ? k(`coach.${coachStep.id}`) : '',
    labels: { hide: t('manipulation.common.coach.hide'), show: t('manipulation.common.coach.show'), ok: t('manipulation.common.coach.ok'), stop: t('manipulation.common.coach.stop') },
  });
  const trayNode = !gameScreen ? null : predictOpen ? (
    <PredictTray attr="ray" key={nextPred} step={predKeys.indexOf(nextPred) + 1} of={predKeys.length}
      title={t('manipulation.common.cp.predict.title')}
      prompt={P.isSolKey(nextPred) ? k('predict.isSol', { x: P.isSolX(nextPred) }) : k('predict.redSide')}
      options={P.predictOptions(lab, nextPred).map((x) => ({ says: x, text: k(`predict.${x}`) }))}
      onSay={sayPredict} />
  ) : cp.open ? cp.node : null;

  const showWord = shownV && pe;
  const verdictText = showWord
    ? k(pe.ok ? 'player.vp.ok' : 'player.vp.no', { x: `\u2066${xs(pk)}\u2069` })
    : k(mode === 'region' ? 'player.vp.startRegion' : 'player.vp.startBracket');
  const journalId = `${uid}-journal`;
  const journalRows = trail.slice(-4).map((kk) => L.evaluate(lab, kk));
  const playerRepresentation = gameScreen && !cp.open && (
    <div className="space-y-2" data-ray-player-col>
      <p className={`rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-sm font-bold leading-snug ${showWord ? (pe.ok ? 'text-red-800' : 'text-slate-700') : 'text-slate-700'}`} data-ray-verdict-box data-ray-verdict-state={showWord ? (pe.ok ? 'ok' : 'no') : ''}>
        {showWord && <span aria-hidden="true">{pe.ok ? '● ' : '○ '}</span>}<bdi>{verdictText}</bdi>
      </p>
      {shownPreds.map((pr) => (
        <p key={pr.key} data-ray-predict-result={pr.ok ? 'ok' : 'wrong'}
          className={`rounded-2xl px-4 py-2 text-center text-lg font-black ${pr.ok ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
          {pr.ok ? t('manipulation.common.cp.predict.right') : k('predict.wrong')}
        </p>
      ))}
      {mode === 'region' && journalRows.length > 0 && (
        <div data-ray-journal>
          <p id={journalId} className="text-sm font-black text-indigo-900"><span aria-hidden="true">📋 </span>{k('player.journal')}</p>
          <table className="mt-1 w-full text-center text-xs" aria-labelledby={journalId}>
            <thead><tr className="bg-slate-50"><th scope="col">x</th><th scope="col">{sidesL}</th><th scope="col">{sidesR}</th><th scope="col">{k('player.colResult')}</th></tr></thead>
            <tbody>
              {journalRows.map((e) => (
                <tr key={e.k} data-ray-row-word={e.ok ? 'ok' : 'no'}>
                  <th scope="row" className="border border-slate-200 font-mono font-normal"><bdi dir="ltr">{L.numText(e.x)}</bdi></th>
                  <td className="border border-slate-200 font-mono"><bdi dir="ltr">{L.numText(e.left)}</bdi></td>
                  <td className="border border-slate-200 font-mono"><bdi dir="ltr">{L.numText(e.right)}</bdi></td>
                  <td className={`border border-slate-200 font-bold ${e.ok ? 'text-red-800' : 'text-slate-700'}`}><span aria-hidden="true">{e.ok ? '● ' : '○ '}</span>{k(e.ok ? 'player.rowOk' : 'player.rowNo')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
  // une annonce par GESTE (un relâchement, un crochet, une ligne), jamais à chaque graduation traversée
  const liveKey = `${gesture}:${shownV ? 'v' : 'n'}`;
  const sweepAll = handDone ? {
    label: k('player.sweep'), ready: true, remaining: untraced().length, intervalMs: 480, maxTicks: 80,
    step: () => { if (lockedRef.current) return; const next = untraced()[0]; if (next !== undefined) { setLive(null); trace(next); } },
    finish: () => { if (lockedRef.current) return; untraced().forEach((v) => trace(v)); },
  } : undefined;
  const stepBtn = (dir) => {
    const off = locked || (dir < 0 ? pk <= lab.kmin : pk >= lab.kmax);
    return (
      <button type="button" onClick={() => { if (!lockedRef.current && !off) probe.nudge(dir); }} aria-label={k(dir < 0 ? 'less' : 'more')} aria-disabled={off || undefined} data-ray-nudge={dir < 0 ? 'less' : 'more'}
        className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-slate-300 bg-white aria-disabled:opacity-40 focus:outline-none focus-visible:ring-2 ${ringP}`}>
        {dir < 0 ? <Minus className="h-5 w-5" aria-hidden="true" /> : <Plus className="h-5 w-5" aria-hidden="true" />}
      </button>
    );
  };
  const playerView = !gameScreen ? null : (
    <ManipulationShell
      type="solution-ray"
      title={k('player.title')}
      mission={typeof mission === 'string' ? <MathText>{mission}</MathText> : mission}
      lead={typeof lead === 'string' ? <MathText>{lead}</MathText> : lead}
      state={state}
      coach={coachOn ? coachNode : null}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      headerAction={cpSettings.control}
      guided
      hideRepresentation={locked || undefined}
      onIntroChange={setMissionBig}
      sidePanel={trayNode ? <div data-ray-tray>{trayNode}</div> : null}
      hints={[]}
      controller={{ autoStep: () => false, canAutoStep: () => false, autoComplete: sweepAll }}
      representation={playerRepresentation}
      discovery={null}
      explanation={<MathText>{k(mode === 'flip' ? 'explanationFlip' : 'explanationGraph')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-rose-50/50 to-white" data-dragging={probe.dragging || bStretch.dragging ? 'true' : undefined}>
        <div ref={boxRef} className="relative space-y-3" data-solution-ray data-mode={mode} data-context="line" data-player>
          <div role="status" aria-live="polite" className="sr-only" data-ray-verdict-live>
            <span key={liveKey}>{showWord ? `${k(pe.ok ? 'player.cueOk' : 'player.cueNo')} ${verdictText}` : verdictText}</span>
            {shownPreds.map((pr) => <span key={pr.key}> {pr.ok ? t('manipulation.common.cp.predict.right') : k('predict.wrong')}</span>)}
            {choiceSaid && <span key={choiceSaid}> {k('player.choiceNow')}</span>}
          </div>
          {!cp.open && cp.node}
          {choices?.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5" role="group" aria-labelledby={`${uid}-choices`} data-ray-choices-free>
              <span id={`${uid}-choices`} className="text-sm font-bold text-slate-600">{k('player.choicesLabel')}</span>
              {choices.map((c) => {
                const on = state.numbers.ineq === c;
                return (
                  <button key={c} type="button" data-ray-choice-free={c} aria-disabled={locked || undefined} aria-pressed={on}
                    onClick={() => { if (!lockedRef.current && !on) { state.setNumbers({ ineq: c }); setChoiceSaid(c); } }}
                    className={`inline-flex min-h-[44px] items-center rounded-xl border-2 px-3 text-sm font-black focus:outline-none focus-visible:ring-2 ${ringP} ${on ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'border-slate-300 bg-white text-slate-700'}`}>
                    <span className="pointer-events-none" dir="ltr"><MathText>{`$${L.ineqTex(L.parseIneq(c))}$`}</MathText></span>
                  </button>
                );
              })}
            </div>
          )}
          <p className="text-sm text-slate-700" data-ray-legend>
            {/* une inéquation = UNE île LTR (ARABIC_RTL_CONTRACT) : la chaîne de la page, interpolée, laissait le paragraphe RTL la renverser */}
            {hideIneq ? k('player.legendHidden') : <>{k('player.legendLead')} <bdi dir="ltr" className="inline-block whitespace-nowrap"><MathText>{`$${L.ineqTex(lab.ineq)}$`}</MathText></bdi> {k('player.legendTail')}</>}
          </p>
          {doneCases.length > 0 && (
            <ul className="flex flex-wrap gap-2" data-ray-done-cases>
              {doneCases.map((c, i) => (
                <li key={i} className="rounded-lg bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-900"><span aria-hidden="true">✓ </span><bdi dir="ltr" className="inline-block whitespace-nowrap"><MathText>{`$${c.tex}$`}</MathText></bdi></li>
              ))}
            </ul>
          )}
          <div className="rounded-xl border border-slate-200 bg-white/80 p-2" data-ray-members>
            <div className="space-y-1.5">
              <Bar v={pe ? pe.left : L.evaluate(lab, lab.kmin).left} color={pe && shownV ? (pe.ok ? '#F87171' : '#CBD5E1') : '#E2E8F0'} label={sidesL} data="left" hide={cp.open} />
              <Bar v={pe ? pe.right : L.evaluate(lab, lab.kmin).right} color="#93C5FD" label={sidesR} data="right" hide={cp.open} />
              <p className="min-h-[1.5rem] text-sm" data-ray-live>
                {showWord && !cp.open
                  ? <>{k('player.liveFor')} <bdi dir="ltr" className="inline-block whitespace-nowrap"><MathText>{`$x = ${L.numTex(pe.x)}$`}</MathText></bdi> : <bdi dir="ltr" className="inline-block whitespace-nowrap"><MathText>{`$${calcTex(pe) ? `${calcTex(pe)} \\quad ` : ''}${cmpTex(pe)}$`}</MathText></bdi> {k(pe.ok ? 'isTrue' : 'isFalse')}</>
                  : <span className="text-slate-500">{k('player.releaseToSee')}</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2" dir="ltr">
            {stepBtn(-1)}
            <div ref={setLineEl} className="min-w-0 flex-1" data-paging-keep data-ray-line-box>{line}</div>
            {stepBtn(1)}
          </div>
          <p className="text-center text-sm font-bold text-slate-700" dir="ltr">{pk == null ? 'x = ?' : `x = ${xs(pk)}`}</p>
          {sectionsNode}
          {cases && lab.bracket && !lastCase && (
            <button type="button" onClick={nextCase} data-ray-next-case
              className={`${btn} border-indigo-700 bg-indigo-700 text-white focus-visible:ring-indigo-600`}>{k('player.nextCase')} <span aria-hidden="true">←</span></button>
          )}
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );

  if (gameScreen) return playerView;

  return (
    <ManipulationShell
      type="solution-ray"
      title={title ? bidi(title) : shownTitle}
      mission={<MathText>{shownMission}</MathText>}
      lead={typeof lead === 'string' ? bidi(lead) : lead}
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      headerAction={cpSettings.control}
      guided={!!chain}
      hints={hintKeys.map((h) => <MathText key={h}>{k(h)}</MathText>)}
      controller={{
        autoStep: () => false,
        canAutoStep: () => false,
        // Balayer la droite, graduation après graduation : chaque position est une trace (rouge / grise). Le crochet reste la réponse de l'élève.
        autoComplete: {
          label: t('manipulation.autoComplete.tryAll'),
          ready: true,
          remaining: untraced().length,
          intervalMs: 480,
          maxTicks: 80,
          step: () => { const next = untraced()[0]; if (next !== undefined) { setLive(null); trace(next); } },
          finish: () => { untraced().forEach((v) => trace(v)); },
        },
      }}
      representation={representation}
      discovery={(
        <ManipulationDiscovery state={state} prompt={k(mode === 'region' ? 'rPrompt' : mode === 'bracket' ? 'bPrompt' : 'fPrompt')} options={discoveryOptions} formal={formal} />
      )}
      explanation={<MathText>{k(mode === 'flip' ? 'explanationFlip' : 'explanationGraph')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-rose-50/50 to-white" data-dragging={probe.dragging || bStretch.dragging ? 'true' : undefined}>
        <div ref={boxRef} className="relative space-y-3" data-solution-ray data-mode={mode} data-context={phone ? 'phone' : 'line'}>
          {party.node}
          {cp.node}
          <LabStepper count={stepDone.length} current={Math.min(nDone, stepDone.length - 1)} done={stepDone} stepAttr="data-sr-step" />
          <p className="text-sm text-slate-700"><MathText>{k(phone ? 'legendPhone' : 'legend', { ineq: L.ineqTex(lab.ineq) })}</MathText></p>

          {/* les deux membres pour le x du mobile */}
          <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white/80 p-2" data-ray-members>
            {phone && (
              <button type="button" tabIndex={-1} aria-hidden="true" onClick={() => setShake((n) => n + 1)} data-decor-phone
                className="shrink-0" style={{ transform: reduce ? 'none' : `rotate(${shake % 2 ? 8 : 0}deg)`, transition: reduce ? 'none' : 'transform 120ms' }}>
                <svg width="34" height="56" viewBox="0 0 34 56">
                  <rect x="2" y="2" width="30" height="52" rx="6" fill="#1E293B" />
                  <rect x="5" y="8" width="24" height="36" rx="2" fill="#E0F2FE" />
                  <rect x="8" y="12" width="14" height="6" rx="3" fill="#38BDF8" /><rect x="12" y="22" width="14" height="6" rx="3" fill="#FFFFFF" />
                  <circle cx="17" cy="49" r="2.4" fill="#64748B" />
                </svg>
              </button>
            )}
            <div className="min-w-0 flex-1 space-y-1.5">
              <Bar v={pe ? pe.left : L.evaluate(lab, lab.kmin).left} color={pe ? (pe.ok ? '#F87171' : '#CBD5E1') : '#E2E8F0'} label={sides?.left ?? k(phone ? 'costLabel' : 'leftLabel')} data="left" />
              <Bar v={pe ? pe.right : L.evaluate(lab, lab.kmin).right} color="#93C5FD" label={sides?.right ?? k(phone ? 'creditLabel' : 'rightLabel')} data="right" />
              <p className="min-h-[1.5rem] text-sm" data-ray-live>
                {pe
                  ? <MathText>{k('liveLine', { x: L.numTex(pe.x), calc: calcTex(pe) ? `$${calcTex(pe)}$ ،` : '', cmp: cmpTex(pe), verdict: k(pe.ok ? 'isTrue' : 'isFalse') })}</MathText>
                  : <span className="text-slate-500">{k('notSet')}</span>}
              </p>
            </div>
          </div>

          <p className="text-sm font-bold text-slate-700">{k(phone ? 'lineTitlePhone' : 'lineTitle')}</p>
          {line}
          <div className="flex items-center justify-center gap-2">
            <button type="button" onClick={() => probe.nudge(-1)} aria-label={k('less')} disabled={pk != null && pk <= lab.kmin}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-300 bg-white disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><Minus className="h-5 w-5" aria-hidden="true" /></button>
            <p className="min-w-[7rem] text-center text-sm font-bold text-slate-700" dir="ltr">{pk == null ? 'x = ?' : `x = ${xs(pk)}`}</p>
            <button type="button" onClick={() => probe.nudge(1)} aria-label={k('more')} disabled={pk != null && pk >= lab.kmax}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-300 bg-white disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><Plus className="h-5 w-5" aria-hidden="true" /></button>
          </div>
          {lab.traces.length > 0 && (
            <ul className="flex flex-wrap gap-1.5" dir="ltr" data-ray-tried>
              {lab.traces.map((tr) => (
                <li key={tr.k} data-tried-x={xs(tr.k)} data-ok={String(tr.ok)} className={`rounded-lg px-2 py-0.5 font-mono text-xs font-bold ${tr.ok ? 'bg-red-100 text-red-900' : 'bg-slate-200 text-slate-700'}`}>
                  x = {xs(tr.k)} {tr.ok ? '●' : '○'}
                </li>
              ))}
            </ul>
          )}
          {phone && <p className="text-xs text-slate-500">{k('phoneWhole')}</p>}

          {sectionsNode}
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}


/* ── Écritures partagées par la découverte et les questions (hors composant : les questions les rejouent) ── */
const calcOf = (lab, e) => [L.sideTex(lab.ineq.L, e.x), L.sideTex(lab.ineq.R, e.x)].filter(Boolean).join(' \\quad ');
const cmpOf = (lab, e) => `${L.numTex(e.left)} ${L.relTex(lab.ineq.rel)} ${L.numTex(e.right)}`;
const lineOf = (lab, e, k) => k('witnessLine', { x: L.numTex(e.x), calc: calcOf(lab, e) ? `$${calcOf(lab, e)}$ ،` : '', cmp: cmpOf(lab, e), verdict: k(e.ok ? 'isTrue' : 'isFalse') });

/** Les options de la règle du niveau : la bonne, et des conjectures réfutées par les propres traces de l'élève. */
function discoveryOptionsOf(lab, k, mode) {
  const strictRed = L.strictRedTrace(lab);
  const grey = L.greyTrace(lab);
  const boundE = L.evaluate(lab, L.boundK(lab));
  const boundTex = L.numTex(lab.sol.bound);
  const cmpTex = (e) => cmpOf(lab, e);
  const keptStep = lab.steps.find((s) => !((s.op === 'mul' || s.op === 'div') && s.k.n < 0));
  return {
    region: [
      { text: <MathText>{k('rOpt2')}</MathText>, why: strictRed && <MathText>{k('rWhy2', { x: L.numTex(strictRed.x), cmp: cmpTex(strictRed) })}</MathText> },
      { text: <MathText>{k('rOpt1')}</MathText>, correct: true },
      { text: <MathText>{k('rOpt3')}</MathText>, why: grey && <MathText>{k('rWhy3', { x: L.numTex(grey.x), cmp: cmpTex(grey) })}</MathText> },
    ],
    bracket: [
      boundE.ok
        ? { text: <MathText>{k('bOpt2b')}</MathText>, why: <MathText>{k('bWhy2b', { x: boundTex, cmp: cmpTex(boundE) })}</MathText> }
        : { text: <MathText>{k('bOpt2')}</MathText>, why: <MathText>{k('bWhy2', { x: boundTex, cmp: cmpTex(boundE) })}</MathText> },
      { text: <MathText>{k('bOpt1')}</MathText>, correct: true },
      { text: <MathText>{k('bOpt3')}</MathText>, why: <MathText>{k('bWhy3')}</MathText> },
    ],
    flip: [
      { text: <MathText>{k('fOpt2')}</MathText>, why: <MathText>{k('fWhy2', { op: keptStep ? L.cardTex(keptStep) : '' })}</MathText> },
      { text: <MathText>{k('fOpt1')}</MathText>, correct: true },
      { text: <MathText>{k('fOpt3')}</MathText>, why: <MathText>{k('fWhy3', { op: keptStep ? L.cardTex(keptStep) : '' })}</MathText> },
    ],
  }[mode];
}

/** La règle du niveau, écrite (la carte finale de la suite, et la découverte quand les questions sont coupées). */
function RayFormal({ lab, k, mode }) {
  const boundE = L.evaluate(lab, L.boundK(lab));
  const boundTex = L.numTex(lab.sol.bound);
  const chainTex = lab.chain.map(L.ineqTex);
  return (
    <div className="space-y-2" data-ray-formal>
      {mode === 'region' && <EquationDisplay tone="result" tex={L.ineqTex(lab.ineq)} note={<MathText>{k('rFormal')}</MathText>} />}
      {mode === 'bracket' && (
        <>
          <EquationDisplay tone="result" tex={`${L.ineqTex(lab.ineq)} \\quad (${boundE.ok ? '\\leq,\\ \\geq' : '<,\\ >'})`} note={<MathText>{k('bFormal')}</MathText>} />
          <p className="text-sm text-slate-700"><MathText>{k(boundE.ok ? 'bYourCaseIn' : 'bYourCaseOut', { x: boundTex, cmp: cmpOf(lab, boundE) })}</MathText></p>
        </>
      )}
      {mode === 'flip' && (
        <>
          <EquationDisplay tone="result" tex={'a < 0 : \\quad ax \\leq b \\;\\Longrightarrow\\; x \\geq \\dfrac{b}{a}'} note={<MathText>{k('fFormal')}</MathText>} />
          <EquationDisplay tone="neutral" tex={chainTex.join(' \\;\\Longrightarrow\\; ')} note={<MathText>{k('yourCase')}</MathText>} />
        </>
      )}
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite unique de chaque niveau : le calcul / l'extrême / la borne / la ligne finale, puis LA RÈGLE. */
export const CHAINS = Object.freeze({
  region: ['calc', 'edge', 'rule'],
  bracket: ['edge', 'bound', 'rule'],
  flip: ['edge', 'red', 'rule'],
});

const $ = (x) => `$${x}$`;
const Cq = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const gradeTex = (lab, kk) => L.numTex(L.xOfK(lab, kk));

/**
 * La valeur extrême qui reste solution sur la droite graduée (la plus grande pour un rayon vers la gauche, la plus petite vers la droite),
 * son voisin EXTÉRIEUR (faux) et son voisin INTÉRIEUR (vrai, mais pas le dernier) — `null` si la droite ne les contient pas.
 */
export function edgeOf(lab) {
  const left = L.sideOf(lab.sol) === 'left';
  let edge = null;
  for (let kk = lab.kmin; kk <= lab.kmax; kk += 1) {
    if (!L.evaluate(lab, kk).ok) continue;
    if (left) edge = kk; else if (edge == null) edge = kk;
  }
  if (edge == null) return null;
  const out = edge + (left ? 1 : -1);
  const inn = edge + (left ? -1 : 1);
  return { left, edge, out: L.inRange(lab, out) ? out : null, inn: L.inRange(lab, inn) && L.evaluate(lab, inn).ok ? inn : null };
}

const STRICT = { '<': '<=', '<=': '<', '>': '>=', '>=': '>' };

export const QUESTIONS = {
  calc: (lab, k, { phone } = {}) => {
    const reds = lab.traces.filter((t) => t.ok).map((t) => t.k);
    const kk = L.sideOf(lab.sol) === 'left' ? Math.max(...reds) : Math.min(...reds);
    const e = L.evaluate(lab, kk);
    const o = { x: gradeTex(lab, kk), calc: $(calcOf(lab, e)), cmp: $(cmpOf(lab, e)), v: $(L.numTex(e.left)) };
    const base = {
      id: 'calc', prompt: Cq(k, phone ? 'calc.promptPhone' : 'calc.prompt', o), hints: [Cq(k, 'calc.hint1', o), Cq(k, 'calc.hint2')],
      explain: Cq(k, 'calc.explain', o),
    };
    if (e.left.n >= 0) return { ...base, kind: 'number', expected: Lin.fracText(e.left), answer: <MathText>{o.v}</MathText> };
    const wrong = [Lin.neg(e.left), Lin.add(e.left, 1)];
    return {
      ...base, kind: 'choice', cols: 3,
      options: [
        { text: <MathText>{$(L.numTex(wrong[0]))}</MathText>, why: Cq(k, 'calc.whySign', o) },
        { text: <MathText>{o.v}</MathText>, correct: true },
        { text: <MathText>{$(L.numTex(wrong[1]))}</MathText>, why: Cq(k, 'calc.whyOff', o) },
      ],
    };
  },
  edge: (lab, k) => {
    const g = edgeOf(lab);
    const o = { edge: $(`x = ${gradeTex(lab, g.edge)}`) };
    const pick = (kk) => ({ n: $(gradeTex(lab, kk)), line: lineOf(lab, L.evaluate(lab, kk), k) });
    const out = g.out != null ? pick(g.out) : null;
    const inn = g.inn != null ? pick(g.inn) : null;
    const opts = [
      out && { text: <MathText>{$(`x = ${gradeTex(lab, g.out)}`)}</MathText>, why: Cq(k, 'edge.whyOut', out) },
      { text: <MathText>{o.edge}</MathText>, correct: true },
      inn && { text: <MathText>{$(`x = ${gradeTex(lab, g.inn)}`)}</MathText>, why: Cq(k, 'edge.whyIn', { ...inn, edge: $(gradeTex(lab, g.edge)) }) },
    ].filter(Boolean);
    return {
      id: 'edge', kind: 'choice', cols: 3,
      prompt: Cq(k, g.left ? 'edge.promptMax' : 'edge.promptMin'),
      options: opts,
      hints: [Cq(k, 'edge.hint1'), Cq(k, 'edge.hint2')],
      explain: Cq(k, 'edge.explain', { ...o, line: lineOf(lab, L.evaluate(lab, g.edge), k), lineOut: out ? out.line : '', n: out ? out.n : '' }),
    };
  },
  bound: (lab, k) => {
    const e = L.evaluate(lab, L.boundK(lab));
    const o = { x: L.numTex(e.x), line: lineOf(lab, e, k) };
    const right = e.ok ? 'in' : 'out';
    const mk = (id) => ({ text: Cq(k, `bound.${id}`), ...(id === right ? { correct: true } : { why: Cq(k, `bound.why.${id}`, o) }) });
    return {
      id: 'bound', kind: 'choice', cols: 1,
      prompt: Cq(k, 'bound.prompt', o),
      options: [mk(e.ok ? 'out' : 'in'), mk(right), mk('any')],
      hints: [Cq(k, 'bound.hint1', o), Cq(k, 'bound.hint2')],
      explain: Cq(k, e.ok ? 'bound.explainIn' : 'bound.explainOut', o),
    };
  },
  red: (lab, k) => {
    const { rel, bound } = lab.sol;
    const side = L.sideOf(lab.sol);
    const tex = (r) => $(`x ${L.relTex(r)} ${L.numTex(bound)}`);
    const flipped = Lin.flipRelation(rel);
    const strict = STRICT[rel];
    const redK = lab.traces.find((t) => t.ok && t.k !== L.boundK(lab))?.k ?? lab.traces.find((t) => t.ok)?.k;
    const redE = L.evaluate(lab, redK);
    const boundE = L.evaluate(lab, L.boundK(lab));
    const o = { bound: $(L.numTex(bound)), side: k(side === 'left' ? 'sideLeftWord' : 'sideRightWord'), final: tex(rel) };
    return {
      id: 'red', kind: 'choice', cols: 3,
      prompt: Cq(k, 'red.prompt', o),
      options: [
        { text: <MathText>{tex(flipped)}</MathText>, why: Cq(k, 'red.whyFlip', { ...o, wrong: tex(flipped), line: lineOf(lab, redE, k) }) },
        { text: <MathText>{tex(rel)}</MathText>, correct: true },
        { text: <MathText>{tex(strict)}</MathText>, why: Cq(k, 'red.whyStrict', { ...o, wrong: tex(strict), line: lineOf(lab, boundE, k) }) },
      ],
      hints: [Cq(k, 'red.hint1', o), Cq(k, 'red.hint2', o)],
      explain: Cq(k, 'red.explain', o),
    };
  },
  rule: (lab, k, { mode } = {}) => ({
    id: 'rule', kind: 'choice',
    prompt: <MathText>{k(mode === 'region' ? 'rPrompt' : mode === 'bracket' ? 'bPrompt' : 'fPrompt')}</MathText>,
    options: discoveryOptionsOf(lab, k, mode),
    hints: [Cq(k, `rule.hint1.${mode}`), Cq(k, `rule.hint2.${mode}`)],
    explain: <RayFormal lab={lab} k={k} mode={mode} />,
  }),
};


/* ══════════════ Lecteur de mission : les suites des manches (rollout 2026-11-11, conseil du 2026-11-11, verdict L3) ══════════════ */

/**
 * Les suites du lecteur, par nom de manche : chacune { id, reached(lab, ctx), qs } — l'id est le point d'étape de la manche (`{ checkpoint: id }`).
 *   cost    M1 r1 : le calcul à sa dernière trace rouge, puis BÂTIR « ▢x + ▢ ▢ ▢ » (leurre : le signe voisin) ;
 *   rule    M1 r2 : sa première trace rouge, BÂTIR, LA RÈGLE de la frontière (après deux cas : un rayon gauche, un rayon droit) ;
 *   bracket M2 r1 : le même nombre dans les deux cas, LA RÈGLE du crochet (après deux cas qui ne diffèrent que par la borne) ;
 *   pos     M2 r2 : la division par un coefficient POSITIF bâtie ; neg M2 r3 : le calcul, la division par un NÉGATIF bâtie, LA RÈGLE du sens.
 */
export const CHAINS_PLAYER = Object.freeze({
  cost: [{ id: 'build', reached: (lab) => P.borderSeen(lab), qs: ['costFill', 'buildIneq'] }],
  rule: [{ id: 'rule', reached: (lab) => P.borderSeen(lab), qs: ['edgeFill', 'buildIneq', 'ruleRegion'] }],
  bracket: [{ id: 'rule', reached: (lab, ctx) => ctx.lastCase && !!lab.bracket, qs: ['boundFill', 'ruleBracket'] }],
  pos: [{ id: 'build', reached: (lab, ctx) => ctx.divStage, qs: ['buildDiv'] }],
  neg: [{ id: 'rule', reached: (lab, ctx) => ctx.divStage, qs: ['divFill', 'buildDiv', 'ruleDir'] }],
  none: [],
});

/** Une liste qui tourne avec les nombres : la bonne pastille / le leurre ne tient jamais toujours la même place. */
const spinList = (xs, seed) => { const s0 = ((seed % xs.length) + xs.length) % xs.length; return xs.map((_, i) => xs[(i + s0) % xs.length]); };
const seedOf = (lab) => Math.abs(Math.round(lab.sol.bound.n * 7 + lab.ineq.L.a.n * 3 + lab.kmax));
const Pq = (k, key, o) => <MathText>{k(`player.${key}`, o)}</MathText>;
const mt = (x) => `$${x}$`;

export const QUESTIONS_P = {
  /* M1 r1 — « الكلفة عند آخر نقطة حمراء: ▢ » */
  costFill: (lab, k) => {
    const f = P.edgeFillParts(lab);
    const o = { x: mt(f.edgeX) };
    return {
      id: 'costFill', kind: 'fill', prompt: Pq(k, 'costFill.prompt', o),
      fields: [{ label: k('player.costFill.label'), expected: f.costExpected, options: spinList(f.costOptions, seedOf(lab)) }],
      hints: [Pq(k, 'costFill.hint1'), Pq(k, 'costFill.hint2', o)], explain: Pq(k, 'costFill.explain', { ...o, v: mt(f.costExpected) }),
    };
  },
  /* M1 r2 — « أوّل نقطة حمراء: ▢ » */
  edgeFill: (lab, k) => {
    const f = P.edgeFillParts(lab);
    const o = { x: mt(f.edgeX), out: f.outX != null ? mt(f.outX) : '' };
    return {
      id: 'edgeFill', kind: 'fill', prompt: Pq(k, f.left ? 'edgeFill.promptLast' : 'edgeFill.promptFirst'),
      fields: [{ label: k(f.left ? 'player.edgeFill.labelLast' : 'player.edgeFill.labelFirst'), expected: f.edgeExpected, options: spinList(f.edgeOptions, seedOf(lab)) }],
      hints: [Pq(k, 'edgeFill.hint1'), Pq(k, 'edgeFill.hint2', o)], explain: Pq(k, 'edgeFill.explain', o),
    };
  },
  /* M1 r1 / r2 — BÂTIR « ▢x + ▢ ▢ ▢ » ; UN leurre : le signe voisin (strict ↔ large), réfuté par SA trace */
  buildIneq: (lab, k) => {
    const bp = P.buildIneqParts(lab);
    const g = P.edgeInfo(lab);
    let w = null;
    [g?.edge, g?.out].filter((kk) => kk != null).forEach((kk) => {
      if (w) return;
      const e = L.evaluate(lab, kk);
      const okDecoy = Lin.compareWith(e.left, bp.decoyRel, e.right);
      if (okDecoy !== e.ok) w = { e, okDecoy };
    });
    const o = w ? {
      x: mt(L.numTex(w.e.x)), calc: calcOf(lab, w.e) ? `$${calcOf(lab, w.e)}$ ،` : '', cmp: mt(`${L.numTex(w.e.left)} ${L.relTex(bp.decoyRel)} ${L.numTex(w.e.right)}`),
      verdict: k(w.okDecoy ? 'isTrue' : 'isFalse'), color: k(w.e.ok ? 'player.red' : 'player.grey'), xn: L.numTex(w.e.x),
    } : {};
    return {
      id: 'buildIneq', kind: 'build', prompt: Pq(k, 'buildIneq.prompt'),
      slots: [k('player.build.coef'), k('player.build.const'), k('player.build.sign'), k('player.build.rhs')],
      ops: ['x +', '', ''], tiles: spinList(bp.tiles, seedOf(lab) + 1),
      expected: bp.expected,
      hints: [w ? Pq(k, 'buildIneq.refuse', o) : Pq(k, 'buildIneq.hint1'), Pq(k, 'buildIneq.hint2')],
      explain: Pq(k, 'buildIneq.explain'),
    };
  },
  ruleRegion: (lab, k) => {
    const strictRed = L.strictRedTrace(lab);
    const side = k(L.sideOf(lab.sol) === 'left' ? 'player.small' : 'player.large');
    return {
      id: 'ruleRegion', kind: 'choice', prompt: Pq(k, 'ruleRegion.prompt'),
      options: [
        { text: Pq(k, 'ruleRegion.opt2'), why: strictRed && Pq(k, 'ruleRegion.why2', { x: mt(L.numTex(strictRed.x)), cmp: mt(cmpOf(lab, strictRed)) }) },
        { text: Pq(k, 'ruleRegion.opt1'), correct: true },
        { text: Pq(k, 'ruleRegion.opt3'), why: Pq(k, 'ruleRegion.why3', { side }) },
      ],
      hints: [Pq(k, 'ruleRegion.hint1'), Pq(k, 'ruleRegion.hint2')],
      explain: <RayFormal lab={lab} k={k} mode="region" />,
    };
  },
  /* M2 r1 — « العدد 4 : في الأولى ▢ · في الثانية ▢ » */
  boundFill: (lab, k, ctx) => {
    const srcs = ctx.cases ?? [];
    const rows = srcs.map((src) => { const lb = L.initLab({ ineq: src }); return L.evaluate(lb, L.boundK(lb)).ok; });
    const yes = k('player.isSol'); const no = k('player.notSol');
    return {
      id: 'boundFill', kind: 'fill', prompt: Pq(k, 'boundFill.prompt', { x: mt(L.numTex(lab.sol.bound)) }),
      fields: rows.map((ok, i) => ({ label: k(i === 0 ? 'player.boundFill.first' : 'player.boundFill.second'), expected: ok ? yes : no, options: i % 2 ? [no, yes] : [yes, no] })),
      hints: [Pq(k, 'boundFill.hint1'), Pq(k, 'boundFill.hint2')], explain: Pq(k, 'boundFill.explain'),
    };
  },
  ruleBracket: (lab, k) => ({
    id: 'ruleBracket', kind: 'choice', prompt: Pq(k, 'ruleBracket.prompt'),
    options: [
      { text: Pq(k, 'ruleBracket.opt2'), why: Pq(k, 'ruleBracket.why2') },
      { text: Pq(k, 'ruleBracket.opt1'), correct: true },
      { text: Pq(k, 'ruleBracket.opt3'), why: Pq(k, 'ruleBracket.why3') },
    ],
    hints: [Pq(k, 'ruleBracket.hint1'), Pq(k, 'ruleBracket.hint2')],
    explain: Pq(k, 'ruleBracket.explain'),
  }),
  /* M2 r3 — « (−2) ÷ (−2) = ▢ » */
  divFill: (lab, k) => {
    const f = P.divisionFillParts(lab);
    const o = { n: mt(`(${f.dividend}) \\div (${f.divisor})`), d: mt(f.divisor) };
    return {
      id: 'divFill', kind: 'fill', prompt: Pq(k, 'divFill.prompt', o),
      fields: [{ label: k('player.divFill.label'), expected: f.expected, options: spinList(f.options, seedOf(lab)) }],
      hints: [Pq(k, 'divFill.hint1'), Pq(k, 'divFill.hint2', o)], explain: Pq(k, 'divFill.explain', { ...o, v: mt(f.expected) }),
    };
  },
  /* M2 r2 / r3 — la division BÂTIE « x ▢ ▢ » (le dernier pas) ; UN leurre : le sens inversé / gardé à tort, réfuté par SES points */
  buildDiv: (lab, k) => {
    const d = P.divisionParts(lab);
    const w = d.refusal.witness;
    const o = w ? { who: k(w.fromTrace ? 'player.yourPoint' : 'player.theNumber'), x: mt(L.numTex(w.x)), line: lineOf(lab, w, k), what: k(w.ok ? 'player.excludes' : 'player.includes') } : {};
    return {
      id: 'buildDiv', kind: 'build', prompt: Pq(k, 'buildDiv.prompt', { d: mt(d.divisorText.startsWith('-') ? `(${d.divisorText})` : d.divisorText) }),
      slots: [k('player.build.rel'), k('player.build.num')],
      ops: [''], wrap: ['x', ''], tiles: spinList(d.tiles, seedOf(lab) + 2),
      expected: d.expected,
      hints: [w ? Pq(k, 'buildDiv.refuse', o) : Pq(k, 'buildDiv.hint1'), Pq(k, 'buildDiv.hint2')],
      explain: Pq(k, d.flips ? 'buildDiv.explainFlip' : 'buildDiv.explainKeep'),
    };
  },
  ruleDir: (lab, k) => ({
    id: 'ruleDir', kind: 'choice', prompt: Pq(k, 'ruleDir.prompt'),
    options: [
      { text: Pq(k, 'ruleDir.opt2'), why: Pq(k, 'ruleDir.why2') },
      { text: Pq(k, 'ruleDir.opt1'), correct: true },
      { text: Pq(k, 'ruleDir.opt3'), why: Pq(k, 'ruleDir.why3') },
    ],
    hints: [Pq(k, 'ruleDir.hint1'), Pq(k, 'ruleDir.hint2')],
    explain: Pq(k, 'ruleDir.explain'),
  }),
};
