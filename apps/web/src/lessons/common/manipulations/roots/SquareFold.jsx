import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import { Minus, Plus, MapPin, Ban } from 'lucide-react';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import useStretchInteraction from '../useStretchInteraction';
import EquationDisplay from '../primitives/EquationDisplay';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { useLabCoach } from '../primitives/LabCoach';
import PredictTray from '../primitives/PredictTray';
import { useInMissionPlayer } from '../../mission/missionPlayerContext';
import { playSfx } from '../../utils/playEffect';
import MathText from '../../components/MathText';
import * as L from '../logic/squareFold';

/** Lecteur : au plus PRED_MAX prédictions par manche (comme les autres labos), jamais pendant une suite de questions. */
const PRED_MAX = 2;
/** Les verdicts qui sont une RÉPONSE de l'élève (un essai de la manche) — « déjà épinglé » et « bouge x d'abord » n'en sont pas. */
/** Le mot d'annonce (lecteur d'écran) avant un verdict. */
const CUE = { pinned: 'cueRight', declaredNone: 'cueRight', notSolution: 'cueWrong', nearTick: 'cueWrong', negativeTarget: 'cueWrong', hasSolution: 'cueWrong' };
const ANSWER_KINDS = new Set(['pinned', 'notSolution', 'negativeTarget', 'hasSolution', 'declaredNone', 'nearTick']);

/**
 * square-fold — LA DROITE QUI SE PLIE (unité 2, leçon 3 : x² = a).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. L'élève DÉPLACE x le long de la droite graduée (réglette
 *    `useStretchInteraction` en LTR ; clavier, − / +, toucher la droite).
 * B. Idée : x et −x ont le même carré ; un carré n'est jamais négatif ; donc
 *    x² = a a deux solutions opposées, une seule (0) ou aucune.
 * C. Pendant le geste, une flèche porte x vers x² sur la droite des carrés,
 *    au-dessus. Sa moitié négative est HACHURÉE : aucune flèche n'y entre.
 * D. Au relâchement : x² se lit exactement ; « ثبّت » épingle x comme
 *    solution de la carte x² = a — jugé, jamais pré-rempli.
 * E. À découvrir : le nombre de solutions dépend du SIGNE de a.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        les solutions de x² = a selon le signe de a
 *   OBJECT         un point x sur la droite, et sa flèche vers x²
 *   VARIABLE       x (le doigt tient le point)
 *   INVARIANT      a (la carte) ; x² ≥ 0 ; x et −x donnent le même carré
 *   TRANSFORMATION la flèche et la valeur x²
 *   CONSTRAINT     une solution épinglée doit vérifier x² = a
 *   RESISTANCE     la moitié négative hachurée : épingler pour a < 0 est
 *                  refusé (« x² لا يكون سالبًا ») ; une mauvaise valeur est
 *                  refusée avec son carré exact
 *   EVIDENCE       les épingles ; deux flèches qui arrivent au même point
 *   CONTRAST       a > 0 (deux), a = 0 (une), a < 0 (aucune) — les trois exigés
 *   PREDICTION     « مراد : الحل هو 3 » — la carte reste ouverte avec une épingle
 *   DISCOVERY      خاصية 2 : le nombre de solutions dépend du signe de a
 *   FORMALIZATION  x² = a ⇔ x = √a ou x = −√a (a > 0)
 *   TRANSFER       طرائق p. 23, تمارين 11–14, la وضعية du tapis (ℓ² = 12)
 */
/** Un nombre écrit pour KaTeX : signe « - », virgule décimale protégée. */
const tex = (s) => s.replace('−', '-').replace(',', '{,}');

/*
 * QUESTIONS PENDANT LE LABO (2026-10-28, `primitives/LabCheckpoint`) : `checkpoints` (défaut true). Une étape PAR CARTE (équation) : quand ses solutions sont épinglées
 * (ou « لا حل » déclaré), une suite de questions sur ce que l'élève vient de faire — a > 0 : le carré de sa solution, la relation entre ses deux solutions ;
 * a = 0 : le nombre de solutions, pourquoi une seule ; a < 0 : le nombre de solutions, pourquoi aucune. La carte qui achève le contraste des trois signes
 * ajoute la RÈGLE (l'ancienne découverte). « أعِد التجربة » dépingle la carte.
 *
 * ONBOARDING (prop `coach`, défaut true — `LabCoach`, §8quater, ajouté le 2026-11-10) : `logic/squareFold.js › coachOf` montre la poignée de x, puis
 * « ثبّت », puis une autre carte — jamais « لا حل » ni la marque exacte.
 *
 * LECTEUR DE MISSION (rollout 2026-11-10, traitement v2 ; conseil du 2026-11-10) : joué en MANCHES (LabRounds).
 *   - `onVerdict { groups: la carte, exact: carte résolue }` à chaque RÉPONSE (ثبّت / لا حل / la marque exacte) — but `{ solvedAll: n }` ;
 *     la même réponse refusée deux fois n'est pas un nouvel essai, et la PREMIÈRE graduation voisine de √a (de chaque côté du zéro) non plus.
 *   - `init({ exactOnly })` : une graduation voisine de √3 n'est JAMAIS acceptée — « 1,7² = 2,89 ≠ 3 — لا تدريجة تعطي 3 بالضبط » (calculé), puis la
 *     marque exacte √3 apparaît entre deux graduations et l'élève l'épingle lui-même (« ثبّت √3 » : on épingle √3, jamais 1,7). Hors lecteur : la
 *     graduation la plus proche est acceptée et √3 épinglé, comme avant.
 *   - `chains` : 'full' (la suite pour chaque carte — le carré d'un toucher, la relation —, puis à la 3e signe BÂTIR « x² = a ⇔ x = √a أو x = −√a »
 *     et la règle), 'predicted' (une question d'un toucher sur les cartes prédites seulement), 'build' (BÂTIR l'équivalence après la carte dont la
 *     solution ne tombe sur aucune graduation), 'none'.
 *   - `predict` + `predictCards` + `predictKind` ('count' : « كم حلًّا ؟ » 2 / 1 / 0 ; 'tick' : « هل تقع تدريجة على حلّ ؟ ») : AVANT de toucher la
 *     carte, ≤ PRED_MAX par manche, la vérité CALCULÉE (solutionCount / landsOnTick), le résultat quand la carte est résolue.
 *   - Le JOURNAL « 📋 جدول تجاربك » (x · x²) sous la droite, muet pendant une question ; `handDone` ouvre « جرّب كل الإمكانيات » ; `radius` raccourcit
 *     la droite (des graduations plus larges sous le doigt). Une flèche refusée pour a < 0 REBONDIT sur la moitié hachurée.
 *   - Les commandes se figent pendant une prédiction ou une question ; toujours guidé ; pas de fête quand l'étape est cachée ; `{ tk: 'reset' }` à
 *     chaque « إعادة ». Hors lecteur : inchangé.
 */
export default function SquareFold({
  a: a0 = 9, scale: scale0 = 2, targets: targets0, table, title, lead, mission, level, levels: withLevels = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onFinished, onTrial: onFinishedTrial,
  coach: coachOn = true,
  // ── LECTEUR DE MISSION (rollout 2026-11-10, traitement v2) ──
  onVerdict, handDone = false, chains: chainsMode = 'full', predict: predictOn = false, predictCards = [0, 1], predictKind = 'count', radius,
}) {
  const { t } = useTranslation('lesson');
  const gameScreen = useInMissionPlayer();
  const reduceMotion = useReducedMotion();
  const uid = useId();
  const journalId = `${uid}-journal`;
  const k = useCallback((key, o) => t(`manipulation.squareFold.${key}`, o), [t]);
  const state = useManipulation({ type: 'square-fold', initialNumbers: { a: a0, scale: scale0 }, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const { scale } = state.numbers;
  // Les cartes : celles de la leçon sur son niveau ; celles de levels.js sur
  // l'autre niveau d'une manipulation posée seule (sinon 9 / 0 / −9 autour de a).
  const targets = (state.isAuthoredLevel ? targets0 : state.levelPreset?.targets) ?? [state.numbers.a, 0, -state.numbers.a];
  const tKey = targets.join(',');

  const make = () => L.init({ targets, scale, radius, exactOnly: gameScreen });
  const [lab, setLab] = useState(make);
  const sceneKey = `${tKey}:${scale}:${state.epoch}`;
  const [scene, setScene] = useState({ key: sceneKey, inits: 0 });
  const [live, setLive] = useState(null);
  const [doneCards, setDoneCards] = useState([]);
  // lecteur : les prédictions faites { [predKey]: ok } (une par carte — prédire la carte 2 avant de résoudre la 1 garde le verdict de la 1),
  // les clés déjà prédites, le nombre de prédictions de la manche
  const [preds, setPreds] = useState({});
  const predsMade = useRef(0);
  const asked = useRef(new Set());
  const [missionBig, setMissionBig] = useState(false);
  if (scene.key !== sceneKey) {
    // « إعادة », un autre niveau ou d'autres équations : TOUT recommence — les épingles, les étapes et les questions du labo
    setScene({ key: sceneKey, inits: scene.inits + 1 });
    setLab(make()); setLive(null); setDoneCards([]);
    setPreds({}); predsMade.current = 0; asked.current = new Set();
  }
  // la manche (LabRounds) repart de zéro avec la scène : ses réponses et prédictions d'avant ne comptent plus
  useEffect(() => { if (scene.inits > 0) state.report(onFinishedTrial, { tk: 'reset' }); }, [scene.inits]); // eslint-disable-line react-hooks/exhaustive-deps
  // Miroir synchrone de `lab` : « جرّب كل الإمكانيات » enchaîne des pas plus vite qu'un rendu ; une réponse lit la position que le relâchement vient de poser.
  const labRef = useRef(lab);
  labRef.current = lab;
  const range = L.range(lab);
  const target = L.current(lab);

  const cpSettings = useLabCheckpointSettings('square-fold');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const cpActive = cpOn && cpSettings.enabled;
  const cardId = `c${lab.card}`;
  const solvedNow = L.cardSolved(lab, lab.card);
  const rawChain = cpActive && solvedNow && !doneCards.includes(lab.card) ? (gameScreen ? chainOfPlayer(lab, chainsMode, predictCards) : chainOf(lab)) : null;
  const chain = rawChain?.length ? rawChain : null;
  // lecteur : la suite qui porte la RÈGLE s'appelle 'rule' (but { checkpoint: 'rule' } de la manche 1) ; la page garde « c<carte> »
  const chainId = chain && gameScreen && chain.includes('rule') ? 'rule' : cardId;
  const showStepper = cpActive && (!gameScreen || chainsMode === 'full');
  const party = useStepCelebration();
  const cp = useLabCheckpoint({
    id: chain ? chainId : null,
    questions: chain ? chain.map((q) => QUESTIONS[q](lab, k)) : null,
    reached: solvedNow,
    resetKey: scene.inits,
    // la MÊME équation au départ : ses épingles, ses marques exactes et son « لا حل » sont retirés
    onRetry: () => {
      const card = labRef.current.card;
      setLab((s) => ({
        ...s, pins: { ...s.pins, [s.card]: [] }, declaredNone: { ...s.declaredNone, [s.card]: false }, exactShown: { ...s.exactShown, [s.card]: [] }, last: null,
      }));
      // lecteur : la manche oublie aussi les réponses de CETTE carte (revue ECC 2026-11-10 : un but atteint par une carte dépinglée)
      if (gameScreen) { refusedAt.current = null; state.report(onFinishedTrial, { tk: 'retry', groups: card }); }
    },
    onEvent: (ev) => state.report(onFinishedTrial, ev),
    onDone: () => {
      const i = lab.card;
      setDoneCards((d) => (d.includes(i) ? d : [...d, i]));
      if (showStepper) party.celebrate({ n: Math.min(doneCards.length + 1, lab.targets.length), total: lab.targets.length });
      if (chain?.includes('rule')) { state.discover(); state.formalize(); }
    },
  });

  // lecteur : la PRÉDICTION, avant de toucher une carte de `predictCards`
  const predKey = `card:${lab.card}`;
  const untouched = !lab.tried?.[lab.card] && !(lab.pins[lab.card]?.length) && !lab.declaredNone[lab.card];
  const predictOpen = gameScreen && predictOn && cpActive && !cp.open && !missionBig && predsMade.current < PRED_MAX && untouched
    && predictCards.includes(lab.card) && !asked.current.has(predKey);
  const locked = gameScreen && (cp.open || predictOpen);
  const lockedRef = useRef(false);
  lockedRef.current = locked;
  const predTruth = predictKind === 'tick' ? (L.landsOnTick(target, lab.scale) ? 'yes' : 'no') : String(L.solutionCount(target.r));
  const sayPredict = (says) => {
    const ok = says === predTruth;
    asked.current.add(predKey);
    predsMade.current += 1;
    playSfx('pop');
    setPreds((m) => ({ ...m, [predKey]: ok }));
    state.report(onFinishedTrial, { tk: 'predict', ok });
  };
  // la prédiction est JUGÉE par la carte : son résultat s'affiche quand la carte est résolue
  const pred = predKey in preds ? { key: predKey, ok: preds[predKey] } : null;
  const predResolved = !!pred && solvedNow;
  const heardPred = useRef(null);
  useEffect(() => {
    if (!predResolved || heardPred.current === pred.key) return;
    heardPred.current = pred.key;
    playSfx(pred.ok ? 'correct' : 'pop');
  }, [predResolved]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { heardPred.current = null; }, [scene.inits]);
  const predResult = gameScreen && predResolved && !cp.open;
  const quiet = gameScreen && cp.open;

  const ready = L.discoveryReady(lab) && !cpActive;
  useEffect(() => { if (ready) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (state.isFormal) state.report(onFinished); }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps

  const hatchId = `sa-fold-hatch-${uid.replace(/:/g, '')}`;
  const boxRef = useRef(null);
  const [width, setWidth] = useState(320);
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
  // Dans le lecteur de mission le labo est monté dans une copie cachée puis déplacé : on re-mesure aussi à chaque rendu (même valeur = aucun rendu).
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (el) { const w = Math.max(260, Math.floor(el.clientWidth)); setWidth((cur) => (cur === w ? cur : w)); }
  });

  // Deux droites LTR : x en bas (−R … R), les carrés en haut (−R² … R²),
  // de même centre : la flèche de x vers x² part toujours vers la DROITE du
  // centre, que x soit positif ou négatif — le pli se voit.
  const EDGE = 24;
  const mid = width / 2;
  const ux = (width / 2 - EDGE) / lab.R;
  const A = lab.R * lab.R;
  const uy = (width / 2 - EDGE) / A;
  const xPx = (v) => mid + (v / lab.scale) * ux;
  const yPx = (y) => mid + y * uy;
  const toValue = useCallback((clientX, _y, rect) => ((clientX - rect.left - mid) / ux) * lab.scale, [mid, ux, lab.scale]);
  const sfx = useRef(0);
  // la dernière réponse REFUSÉE « carte:verdict:x » — effacée quand x bouge (une même réponse refusée deux fois de suite n'est qu'un essai)
  const refusedAt = useRef(null);
  // le son : la pose d'une solution (cloche), un refus (grave), la découverte atteinte (drapeau) — muet sauf « الصوت »
  const lastKind = lab.last?.kind;
  useEffect(() => {
    if (lastKind === 'pinned' || lastKind === 'declaredNone') playSfx('bell');
    else if (lastKind === 'notSolution' || lastKind === 'negativeTarget' || lastKind === 'hasSolution') playSfx('over');
    else if (lastKind === 'nearTick') playSfx('pop');
  }, [lab.last]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (L.discoveryReady(lab)) playSfx('flag'); }, [L.discoveryReady(lab)]); // eslint-disable-line react-hooks/exhaustive-deps
  const stretch = useStretchInteraction({
    value: live ?? lab.x ?? L.defaultX(lab), range, toValue,
    onChange: (v) => { if (lockedRef.current) return; setLive(v); const now = performance.now(); if (now - sfx.current > 35) { playSfx('tooth'); sfx.current = now; } },
    onCommit: (v) => { if (lockedRef.current) { setLive(null); return; } setLive(v); if (labRef.current.x !== v) refusedAt.current = null; labRef.current = L.move(labRef.current, v); setLab(labRef.current); },
    direction: 'ltr', pageStep: lab.scale,
  });

  /** Une RÉPONSE de l'élève (ثبّت, لا حل, la marque exacte) : jugée par la logique, remontée à la manche comme un essai (lecteur). */
  const answer = (fn) => {
    if (lockedRef.current) return;
    stretch.flush();
    const prev = labRef.current;
    const next = fn(prev);
    if (next === prev) return;
    labRef.current = next;
    setLab(next);
    const kind = next.last?.kind;
    if (!ANSWER_KINDS.has(kind)) return;
    if (kind === 'nearTick' && next.last.free) return; // la découverte voulue : pas un essai
    // la même réponse refusée ENCORE, sans que x ait bougé entre-temps, n'est pas un nouvel essai (ni une 2e graduation voisine de √a au même x) ;
    // dès que x a bougé (3 → 5 → 3), la réponse compte de nouveau — `refusedAt` est effacé à chaque relâchement sur une autre valeur
    const sig = `${next.card}:${kind}:${next.last.v ?? ''}`;
    if (kind !== 'pinned' && refusedAt.current === sig) return;
    refusedAt.current = kind === 'pinned' ? null : sig;
    state.report(onVerdict, { groups: next.card, exact: L.cardSolved(next, next.card) });
  };
  const bounceKey = useRef(0);
  const verdictKey = useRef(0);
  const prevLast = useRef(null);
  if (lab.last !== prevLast.current) { prevLast.current = lab.last; verdictKey.current += 1; if (lab.last?.kind === 'negativeTarget') bounceKey.current += 1; }

  // Un x PAR DÉFAUT (L.defaultX : solution d'aucune carte) : jamais vide à l'ouverture. Ce n'est pas une visite : `lab.visited` ne le contient pas.
  const isDefault = lab.x == null && live == null;
  const x = live ?? lab.x ?? L.defaultX(lab);
  const x2 = x == null ? null : (x / lab.scale) ** 2; // pour DESSINER
  const settled = !stretch.dragging && (isDefault || (lab.x != null && x === lab.x));
  const unvisited = () => { const r = L.range(labRef.current); return Array.from({ length: r.max - r.min + 1 }, (_, i) => r.min + i).filter((v) => !labRef.current.visited.includes(v)); };
  const H = gameScreen ? 172 : 150;
  const TOP = 38;
  const BOT = 118;
  const pins = lab.pins[lab.card] ?? [];
  const exactMarks = gameScreen ? (lab.exactShown?.[lab.card] ?? []) : [];
  const toPin = gameScreen ? L.exactToPin(lab) : [];
  const solvedAll = lab.targets.map((_, i) => L.cardSolved(lab, i));
  const xTick = [0.5, 1, 2, 5].find((s) => s * ux >= 26) ?? 5;
  const yTick = [1, 2, 5, 10, 25, 50].find((s) => s * uy >= 26) ?? 50;
  const rootPx = (sign) => mid + sign * Math.sqrt(target.r.num / target.r.den) * ux;

  const coachStep = coachOn && !locked && !cp.open ? L.coachOf(lab) : null;
  const coach = useLabCoach({
    lab: 'square-fold', step: coachStep, text: coachStep ? k(`coach.${coachStep.id}`) : '',
    labels: { hide: t('manipulation.common.coach.hide'), show: t('manipulation.common.coach.show'), ok: t('manipulation.common.coach.ok'), stop: t('manipulation.common.coach.stop') },
  });

  const last = lab.last;
  // Chaque message est construit SEULEMENT pour le verdict rendu : celui de
  // « notSolution » lit last.v, qui n'existe pas pour les autres verdicts.
  // a dans une phrase arabe : un passage LTR ISOLÉ (« −4 » ne devient jamais « 4− »)
  const isoA = `\u2066${L.targetText(target.a)}\u2069`;
  const squareOf = (v) => { const xs = tex(L.xText(v, lab.scale)); return v < 0 ? `(${xs})` : xs; };
  const verdict = last && ({
    pinned: () => <span className="text-emerald-800"><MathText>{k('vPinned', { x: L.solutionTex(target, last.sign) })}</MathText></span>,
    notSolution: () => <span className="text-rose-800"><MathText>{k('vNot', { x: tex(L.xText(last.v, lab.scale)), x2: tex(L.squareText(last.v, lab.scale)), a: L.targetText(target.a) })}</MathText></span>,
    nearTick: () => <span className="text-amber-900"><MathText>{k('vNearTick', { xsq: squareOf(last.v), x2: tex(L.squareText(last.v, lab.scale)), a: tex(L.targetText(target.a)), aText: L.targetText(target.a) })}</MathText></span>,
    negativeTarget: () => <span className="text-rose-800">{k('vNegative', { a: isoA })}</span>,
    hasSolution: () => <span className="text-rose-800">{k('vHasSolution', { a: isoA })}</span>,
    declaredNone: () => <span className="text-emerald-800">{k('vNone', { a: isoA })}</span>,
    alreadyPinned: () => <span className="text-slate-700">{k('vAlready')}</span>,
    noX: () => <span className="text-slate-700">{k('vNoX')}</span>,
  }[last.kind]?.());

  // lecteur : la prédiction ou la question PREND la colonne du labo
  const cardEq = `$x^2 = ${tex(L.targetText(target.a))}$`;
  const trayNode = !gameScreen ? null : predictOpen ? (
    <PredictTray attr="sf"
      title={t('manipulation.common.cp.predict.title')}
      prompt={<MathText>{k(predictKind === 'tick' ? 'predict.promptTick' : 'predict.promptCount', { eq: cardEq })}</MathText>}
      options={predictKind === 'tick'
        ? [{ says: 'yes', text: k('predict.yes') }, { says: 'no', text: k('predict.no') }]
        : [{ says: '2', text: k('predict.two') }, { says: '1', text: k('predict.one') }, { says: '0', text: k('predict.zero') }]}
      onSay={sayPredict} />
  ) : cp.open ? cp.node : null;

  // le JOURNAL du lecteur : le tableau de la manche (s'il y en a un), sinon les dernières positions essayées
  const journalVals = table ? null : [...lab.visited].slice(-6).sort((p, q) => p - q);
  const showJournal = gameScreen && !quiet && (table ? true : journalVals.length > 0);
  const ring = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2';

  return (
    <ManipulationShell
      type="square-fold"
      title={title ?? k('title')}
      mission={mission ?? k('mission')}
      lead={lead}
      state={state}
      coach={coachOn ? coach : null}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      headerAction={cpOn ? cpSettings.control : null}
      // lecteur : l'écran de jeu est toujours GUIDÉ (les manches et les questions guident)
      guided={cpActive || gameScreen}
      hideRepresentation={(gameScreen && locked) || undefined}
      onIntroChange={setMissionBig}
      sidePanel={trayNode ? <div data-sf-tray>{trayNode}</div> : null}
      hints={([k('hint1'), k('hint2'), k('hint3')]).map((h) => <MathText key={h}>{h}</MathText>)}
      controller={{
        autoStep: () => false,
        canAutoStep: () => false,
        // Balayer la droite, graduation après graduation : chaque position est une visite (le tableau se remplit) ; épingler reste la réponse de l'élève.
        // lecteur : « جرّب كل الإمكانيات » est le BOUTON du geste appris — il s'ouvre après la manche à la main (handDone)
        autoComplete: gameScreen && !handDone ? undefined : {
          label: t('manipulation.autoComplete.tryAll'),
          ready: !locked,
          remaining: unvisited().length,
          intervalMs: 480,
          maxTicks: 80,
          step: () => {
            const next = unvisited()[0];
            if (next === undefined) return;
            labRef.current = L.move(labRef.current, next);
            setLive(next);
            setLab((s) => L.move(s, next));
          },
          finish: () => {
            const todo = unvisited();
            if (todo.length === 0) return;
            labRef.current = todo.reduce((acc, v) => L.move(acc, v), labRef.current);
            setLive(todo[todo.length - 1]);
            setLab((s) => todo.reduce((acc, v) => L.move(acc, v), s));
          },
        },
      }}
      representation={settled && (
        <EquationDisplay tex={`x = ${L.xText(x, lab.scale).replace('−', '-').replace(',', '{,}')} \\qquad x^2 = ${L.squareText(x, lab.scale).replace(',', '{,}')}`} tone="neutral" />
      )}
      discovery={(
        <ManipulationDiscovery
          state={state}
          prompt={k('dPrompt')}
          options={[
            { text: <MathText>{k('dOpt2')}</MathText>, why: <MathText>{k('dWhy2')}</MathText> },
            { text: <MathText>{k('dOpt3')}</MathText>, why: <MathText>{k('dWhy3')}</MathText> },
            { text: <MathText>{k('dOpt1')}</MathText>, correct: true },
          ]}
          formal={(
            <div className="space-y-2" data-fold-formal>
              <EquationDisplay tex="a > 0" tone="result" note={<MathText>{k('fPositive')}</MathText>} />
              <EquationDisplay tex="a = 0" tone="result" note={<MathText>{k('fZero')}</MathText>} />
              <EquationDisplay tex="a < 0" tone="result" note={<MathText>{k('fNegative')}</MathText>} />
            </div>
          )}
        />
      )}
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <div className="relative" data-sf-glance>
        {party.node}
        {!(gameScreen && cp.open) && cp.node}
      <ManipulationStage className="bg-gradient-to-b from-violet-50/60 to-white" data-dragging={stretch.dragging ? 'true' : undefined}>
        <div ref={boxRef} className="space-y-3" data-square-fold>
          {showStepper && (
            <LabStepper count={lab.targets.length} current={Math.min(doneCards.length, lab.targets.length - 1)}
              done={lab.targets.map((_, i) => doneCards.includes(i) && (i !== lab.card || !cp.blocking))} stepAttr="data-sf-step" />
          )}
          <div role="status" aria-live="polite" data-sf-predict-live>
            {predResult && (
              <p data-sf-predict-result={pred.ok ? 'ok' : 'wrong'}
                className={`rounded-2xl px-4 py-2 text-center text-lg font-black ${pred.ok ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
                {pred.ok ? t('manipulation.common.cp.predict.right') : t('manipulation.common.cp.predict.wrong')}
              </p>
            )}
          </div>
          {/* ── Les cartes : une équation chacune ── */}
          <div className="flex flex-wrap gap-2" role="group" aria-label={k('cards')} data-fold-cards>
            {lab.targets.map((tg, i) => (
              <button key={tg.a} type="button" onClick={() => { if (!lockedRef.current) setLab((s) => L.setCard(s, i)); }} disabled={locked} aria-pressed={lab.card === i} data-fold-card={i} data-solved={solvedAll[i] ? 'true' : 'false'}
                className={`min-h-[44px] rounded-xl border-2 px-3 py-1 text-sm font-bold ${ring} ${lab.card === i ? 'border-violet-600 bg-violet-50' : 'border-slate-300 bg-white'} ${solvedAll[i] ? 'text-emerald-800' : 'text-slate-800'}`}>
                <span dir="ltr"><MathText>{`$x^2 = ${L.targetText(tg.a).replace('−', '-').replace(',', '{,}')}$`}</MathText></span>
                {solvedAll[i] && <span aria-hidden="true">{' ✓'}</span>}
                {solvedAll[i] && <span className="sr-only">{k('cardSolvedSr')}</span>}
              </button>
            ))}
          </div>

          {/* ── Les deux droites ── */}
          <div dir="ltr" {...stretch.trackProps} className="relative" style={{ ...stretch.trackProps.style, height: H, ...(locked ? { pointerEvents: 'none' } : {}) }} data-fold-lines>
            <svg width={width} height={H} className="absolute inset-0" role="img" aria-label={x == null ? k('notSet') : `x = ${L.xText(x, lab.scale)} ; x² = ${L.squareText(x, lab.scale)}`}>
              <defs>
                <pattern id={hatchId} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <line x1="0" y1="0" x2="0" y2="8" stroke="#64748B" strokeWidth="2" />
                </pattern>
              </defs>
              {/* droite des carrés */}
              <rect x={EDGE} y={TOP - 10} width={mid - EDGE} height={20} fill={`url(#${hatchId})`} data-fold-forbidden />
              <line x1={EDGE} x2={width - EDGE} y1={TOP} y2={TOP} stroke="#7C3AED" strokeWidth={2} />
              <text x={EDGE} y={14} fontSize={11} fill="#6D28D9" fontWeight="bold">x²</text>
              {Array.from({ length: Math.floor(A / yTick) * 2 + 1 }, (_, i) => (i - Math.floor(A / yTick)) * yTick).map((y) => (
                <g key={`y${y}`}>
                  <line x1={yPx(y)} x2={yPx(y)} y1={TOP - 4} y2={TOP + 4} stroke="#7C3AED" />
                  {y >= 0 && <text x={yPx(y)} y={TOP + 16} textAnchor="middle" fontSize={10} fill="#5B21B6" fontFamily="ui-monospace, monospace">{y}</text>}
                </g>
              ))}
              {/* la cible a */}
              <g data-fold-target={target.a}>
                <circle cx={yPx(target.a)} cy={TOP} r={7} fill="none" stroke="#DB2777" strokeWidth={2.5} />
                <text x={yPx(target.a)} y={TOP - 13} textAnchor="middle" fontSize={11} fill="#BE185D" fontWeight="bold">a</text>
              </g>
              {/* droite des x */}
              <line x1={EDGE} x2={width - EDGE} y1={BOT} y2={BOT} stroke="#334155" strokeWidth={2} />
              <text x={width - EDGE} y={BOT + 30} fontSize={11} fill="#334155" fontWeight="bold" textAnchor="end">x</text>
              {Array.from({ length: Math.floor(lab.R / xTick) * 2 + 1 }, (_, i) => (i - Math.floor(lab.R / xTick)) * xTick).map((v) => (
                <g key={`x${v}`}>
                  <line x1={mid + v * ux} x2={mid + v * ux} y1={BOT - 4} y2={BOT + 4} stroke="#334155" />
                  <text x={mid + v * ux} y={BOT + 18} textAnchor="middle" fontSize={10} fill="#334155" fontFamily="ui-monospace, monospace">{String(v).replace('-', '−').replace('.', ',')}</text>
                </g>
              ))}
              {/* lecteur : les petites graduations 1/scale, pour viser à l'œil (le doigt est aidé par − / +) */}
              {gameScreen && lab.scale > 1 && ux / lab.scale >= 4 && Array.from({ length: 2 * lab.R * lab.scale + 1 }, (_, i) => i - lab.R * lab.scale).map((v) => (
                v % lab.scale === 0 ? null : <line key={`m${v}`} x1={xPx(v)} x2={xPx(v)} y1={BOT - 2} y2={BOT + 2} stroke="#94A3B8" />
              ))}
              {/* lecteur : les MARQUES EXACTES ±√a révélées entre deux graduations */}
              {exactMarks.map((sign) => (
                <g key={`e${sign}`} data-fold-exact-mark={sign}>
                  <polygon points={`${rootPx(sign)},${BOT - 7} ${rootPx(sign) + 6},${BOT} ${rootPx(sign)},${BOT + 7} ${rootPx(sign) - 6},${BOT}`} fill="#F59E0B" stroke="#92400E" strokeWidth={1.5} />
                  <text x={rootPx(sign)} y={BOT + 38} textAnchor="middle" fontSize={13} fill="#92400E" fontWeight="bold">{L.solutionText(target, sign)}</text>
                </g>
              ))}
              {/* les solutions épinglées de la carte */}
              {pins.map((sign) => {
                const px = rootPx(sign);
                return (
                  <g key={sign} data-fold-pin={sign}>
                    <path d={`M ${px} ${BOT} C ${px} ${(BOT + TOP) / 2}, ${yPx(target.a)} ${(BOT + TOP) / 2}, ${yPx(target.a)} ${TOP + 8}`} fill="none" stroke="#059669" strokeWidth={2} strokeDasharray="4 3" />
                    <circle cx={px} cy={BOT} r={6} fill="#059669" />
                  </g>
                );
              })}
              {/* lecteur : la flèche REFUSÉE pour a < 0 rebondit sur la moitié hachurée */}
              {gameScreen && last?.kind === 'negativeTarget' && last.v != null && (
                <g key={`b${bounceKey.current}`} data-fold-bounce>
                  <path d={`M ${xPx(last.v)} ${BOT - 8} C ${xPx(last.v)} ${(BOT + TOP) / 2}, ${yPx(target.a)} ${(BOT + TOP) / 2}, ${yPx(target.a)} ${TOP + 12}`} fill="none" stroke="#E11D48" strokeWidth={2.5} strokeDasharray="5 4">
                    {!reduceMotion && <animate attributeName="opacity" values="0;1;0.5;1" keyTimes="0;0.2;0.6;1" dur="1.2s" fill="freeze" />}
                  </path>
                  <text x={yPx(target.a)} y={TOP + 28} textAnchor="middle" fontSize={16} fill="#E11D48" fontWeight="bold">✗</text>
                </g>
              )}
              {/* la flèche de x vers x² */}
              {x != null && (
                <path d={`M ${xPx(x)} ${BOT - 8} C ${xPx(x)} ${(BOT + TOP) / 2}, ${yPx(x2)} ${(BOT + TOP) / 2}, ${yPx(x2)} ${TOP + 8}`} fill="none" stroke="#0EA5E9" strokeWidth={2.5} markerEnd="" data-fold-arrow />
              )}
              {x2 != null && <circle cx={yPx(x2)} cy={TOP} r={5} fill="#0EA5E9" />}
            </svg>
            <div
              {...stretch.handleProps({ label: k('handle'), valueText: x == null ? k('notSet') : k('valueText', { x: L.xText(x, lab.scale), x2: L.squareText(x, lab.scale) }) })}
              data-fold-handle
              aria-disabled={locked || undefined}
              className={`absolute flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full border-2 outline-none focus-visible:ring-4 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 ${stretch.dragging ? 'border-blue-500 bg-blue-500/10' : 'border-slate-500 bg-white/70'}`}
              style={{ left: xPx(x ?? 0), top: BOT - 22, cursor: stretch.dragging ? 'grabbing' : 'grab' }}
            >
              <bdi dir="ltr" className="whitespace-nowrap font-mono text-xs font-extrabold text-slate-900" aria-hidden="true" data-fold-x>{x == null ? '?' : L.xText(x, lab.scale)}</bdi>
            </div>
          </div>
          <p className="text-xs text-slate-600">{k('forbiddenNote')}</p>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {/* − puis + dans l'ordre de la droite (LTR) : « − » à gauche, comme les nombres négatifs */}
            <span dir="ltr" className="inline-flex gap-2">
            <button type="button" onClick={() => stretch.nudge(-1)} aria-label={k('left')} disabled={locked}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-300 bg-white disabled:opacity-40 ${ring}`}><Minus className="h-5 w-5" aria-hidden="true" /></button>
            <button type="button" onClick={() => stretch.nudge(1)} aria-label={k('right')} disabled={locked}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-300 bg-white disabled:opacity-40 ${ring}`}><Plus className="h-5 w-5" aria-hidden="true" /></button>
            </span>
            <button type="button" onClick={() => answer(L.pin)} disabled={locked} data-fold-pin-button
              className={`inline-flex min-h-[44px] items-center gap-1 rounded-xl border-2 border-emerald-600 bg-white px-3 font-bold text-emerald-800 disabled:opacity-40 ${ring}`}>
              <MapPin className="h-4 w-4" aria-hidden="true" /> {k('pin')}
            </button>
            {toPin.map((sign) => (
              <button key={sign} type="button" onClick={() => answer((s) => L.pinExact(s, sign))} disabled={locked} data-fold-exact={sign}
                className={`inline-flex min-h-[44px] items-center gap-1 rounded-xl border-2 border-amber-600 bg-amber-50 px-3 font-bold text-amber-900 disabled:opacity-40 ${ring}`}>
                <MapPin className="h-4 w-4" aria-hidden="true" /> {k('pinExact')}{' '}<bdi dir="ltr">{L.solutionText(target, sign)}</bdi>
              </button>
            ))}
            <button type="button" onClick={() => answer(L.declareNone)} disabled={locked} data-fold-none
              className={`inline-flex min-h-[44px] items-center gap-1 rounded-xl border-2 border-slate-400 bg-white px-3 font-bold text-slate-800 disabled:opacity-40 ${ring}`}>
              <Ban className="h-4 w-4" aria-hidden="true" /> {k('none')}
            </button>
          </div>
          <div role="status" aria-live="polite" data-sf-verdict-live>
            {verdict && !quiet && (
              // une clé par RÉPONSE : la même phrase, redite, est annoncée de nouveau ; le mot « صحيح / خطأ » d'abord pour le lecteur d'écran
              <p key={verdictKey.current} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold" data-fold-verdict={last.kind}>
                {CUE[last.kind] && <span className="sr-only">{k(CUE[last.kind])} </span>}{verdict}
              </p>
            )}
          </div>
          {pins.length > 0 && !quiet && (
            <p className="text-sm text-slate-800" data-fold-solutions>
              {k('solutionsOf')}{' '}
              <bdi dir="ltr"><MathText>{`$x^2 = ${L.targetText(target.a).replace('−', '-').replace(',', '{,}')}$`}</MathText></bdi>{' : '}
              {pins.map((sign, i) => (
                <React.Fragment key={sign}>{i > 0 ? ` ${t('manipulation.and')} ` : ''}<bdi dir="ltr"><MathText>{`$${L.solutionTex(target, sign)}$`}</MathText></bdi></React.Fragment>
              ))}
            </p>
          )}

          {gameScreen && showJournal && <p id={journalId} className="text-sm font-black text-indigo-900" data-fold-journal><span aria-hidden="true">📋 </span>{k('journal')}</p>}
          {/* ── Le tableau de l'activité 3 (x ↦ x²), rempli par les positions essayées ── */}
          {table && (!gameScreen || showJournal) && (
            <table className="w-full table-fixed text-center text-sm" dir="ltr" aria-labelledby={gameScreen ? journalId : undefined} data-fold-table>
              {!gameScreen && <caption className="sr-only">{k('tableCaption')}</caption>}
              <tbody>
                <tr><th scope="row" className="w-12 bg-slate-50 font-mono">x</th>{table.map((v) => <td key={v} className="border border-slate-200 font-mono">{L.xText(v * lab.scale, lab.scale)}</td>)}</tr>
                <tr>
                  <th scope="row" className="bg-slate-50 font-mono">x²</th>
                  {table.map((v) => {
                    const seen = lab.visited.includes(Math.round(v * lab.scale));
                    return <td key={v} className="border border-slate-200 font-mono" data-fold-cell={v} data-seen={seen ? 'true' : 'false'}>{seen ? L.squareText(Math.round(v * lab.scale), lab.scale) : <><span aria-hidden="true">…</span><span className="sr-only">{k('notTried')}</span></>}</td>;
                  })}
                </tr>
              </tbody>
            </table>
          )}
          {showJournal && !table && (
            <table className="w-full table-fixed text-center text-sm" dir="ltr" aria-labelledby={journalId} data-fold-memory>
              <tbody>
                <tr><th scope="row" className="w-12 bg-slate-50 font-mono">x</th>{journalVals.map((v) => <td key={v} className="border border-slate-200 font-mono">{L.xText(v, lab.scale)}</td>)}</tr>
                <tr><th scope="row" className="bg-slate-50 font-mono">x²</th>{journalVals.map((v) => <td key={v} className="border border-slate-200 font-mono">{L.squareText(v, lab.scale)}</td>)}</tr>
              </tbody>
            </table>
          )}
        </div>
      </ManipulationStage>
      </div>
    </ManipulationShell>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite de questions selon le SIGNE de a ; la carte qui achève le contraste des trois signes y ajoute la règle. */
export const CHAINS = Object.freeze({
  pos: ['posSq', 'posMirror'],
  zero: ['zeroCount', 'zeroOpp'],
  neg: ['negCount', 'negWhy'],
});
export const kindOf = (lab) => { const r = L.current(lab).r; return r.num > 0 ? 'pos' : r.num === 0 ? 'zero' : 'neg'; };
export const chainOf = (lab) => [...CHAINS[kindOf(lab)], ...(L.discoveryReady(lab) ? ['rule'] : [])];
const Mx = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const num = (a) => tex(L.targetText(a));

/** Chaque question est construite sur LES équations de l'élève (rien n'est écrit en dur) ; `k` : les textes de `squareFold`. */
export const QUESTIONS = {
  posSq: (lab, k) => {
    const tg = L.current(lab); const nums = { s: L.solutionTex(tg, 1), a: num(tg.a) };
    return {
      id: 'posSq', kind: 'number', expected: String(tg.a), answer: <MathText>{`$${num(tg.a)}$`}</MathText>,
      prompt: Mx(k, 'posSq.prompt', nums), hints: [Mx(k, 'posSq.hint1', nums), Mx(k, 'posSq.hint2', nums)], explain: Mx(k, 'posSq.explain', nums),
    };
  },
  posMirror: (lab, k) => {
    const tg = L.current(lab); const nums = { s: L.solutionTex(tg, 1), neg: L.solutionTex(tg, -1), a: num(tg.a) };
    return {
      id: 'posMirror', kind: 'choice',
      prompt: Mx(k, 'posMirror.prompt', nums),
      options: [
        { text: Mx(k, 'posMirror.wrongSum', nums), why: Mx(k, 'posMirror.whySum', nums) },
        { text: Mx(k, 'posMirror.wrongSame', nums), why: Mx(k, 'posMirror.whySame', nums) },
        { text: Mx(k, 'posMirror.right', nums), correct: true },
      ],
      hints: [Mx(k, 'posMirror.hint1', nums), Mx(k, 'posMirror.hint2', nums)], explain: Mx(k, 'posMirror.explain', nums),
    };
  },
  zeroCount: (lab, k) => ({
    id: 'zeroCount', kind: 'number', expected: '1', answer: <MathText>{'$1$'}</MathText>,
    prompt: Mx(k, 'zeroCount.prompt'), hints: [Mx(k, 'zeroCount.hint1'), Mx(k, 'zeroCount.hint2')], explain: Mx(k, 'zeroCount.explain'),
  }),
  zeroOpp: (lab, k) => ({
    id: 'zeroOpp', kind: 'choice', cols: 3,
    prompt: Mx(k, 'zeroOpp.prompt'),
    options: [
      { text: Mx(k, 'zeroOpp.wrongNoSquare'), why: Mx(k, 'zeroOpp.whyNoSquare') },
      { text: Mx(k, 'zeroOpp.right'), correct: true },
      { text: Mx(k, 'zeroOpp.wrongPositive'), why: Mx(k, 'zeroOpp.whyPositive') },
    ],
    hints: [Mx(k, 'zeroOpp.hint1'), Mx(k, 'zeroOpp.hint2')], explain: Mx(k, 'zeroOpp.explain'),
  }),
  negCount: (lab, k) => {
    const nums = { a: num(L.current(lab).a) };
    return {
      id: 'negCount', kind: 'number', expected: '0', answer: <MathText>{'$0$'}</MathText>,
      prompt: Mx(k, 'negCount.prompt', nums), hints: [Mx(k, 'negCount.hint1', nums), Mx(k, 'negCount.hint2')], explain: Mx(k, 'negCount.explain', nums),
    };
  },
  negWhy: (lab, k) => {
    const tg = L.current(lab); const abs = { a: Math.abs(tg.a), r: { num: Math.abs(tg.r.num), den: tg.r.den } };
    const nums = { a: num(tg.a), pa: num(Math.abs(tg.a)), neg: L.solutionTex(abs, -1) };
    return {
      id: 'negWhy', kind: 'choice',
      prompt: Mx(k, 'negWhy.prompt', nums),
      options: [
        { text: Mx(k, 'negWhy.wrongRoot', nums), why: Mx(k, 'negWhy.whyRoot', nums) },
        { text: Mx(k, 'negWhy.right', nums), correct: true },
        { text: Mx(k, 'negWhy.wrongRuler', nums), why: Mx(k, 'negWhy.whyRuler', nums) },
      ],
      hints: [Mx(k, 'negWhy.hint1', nums), Mx(k, 'negWhy.hint2', nums)], explain: Mx(k, 'negWhy.explain', nums),
    };
  },
  rule: (lab, k) => ({
    id: 'rule', kind: 'choice',
    prompt: <MathText>{k('dPrompt')}</MathText>,
    options: [
      { text: <MathText>{k('dOpt2')}</MathText>, why: <MathText>{k('dWhy2')}</MathText> },
      { text: <MathText>{k('dOpt3')}</MathText>, why: <MathText>{k('dWhy3')}</MathText> },
      { text: <MathText>{k('dOpt1')}</MathText>, correct: true },
    ],
    hints: [Mx(k, 'rule.hint1'), Mx(k, 'rule.hint2')],
    explain: (
      <div className="space-y-1" data-fold-formal>
        <EquationDisplay tex="a > 0" tone="result" note={<MathText>{k('fPositive')}</MathText>} />
        <EquationDisplay tex="a = 0" tone="result" note={<MathText>{k('fZero')}</MathText>} />
        <EquationDisplay tex="a < 0" tone="result" note={<MathText>{k('fNegative')}</MathText>} />
      </div>
    ),
  }),
};

/* ══════════════ Lecteur de mission : d'un toucher → BÂTIR « x² = a ⇔ x = √a أو x = −√a » → la règle (rollout 2026-11-10, conseil) ══════════════ */

/** Les suites du lecteur, par signe de a : une question d'un toucher (le carré, le nombre de solutions) ; la relation pour a > 0 (manche 1). */
export const CHAINS_PLAYER = Object.freeze({
  pos: ['posSqFill', 'posMirror'],
  zero: ['zeroCountFill'],
  neg: ['negCountFill'],
});

/**
 * La suite à poser dans le lecteur quand la carte courante est résolue :
 *   'full'      la suite du signe, et à la carte qui achève les trois signes : BÂTIR l'équivalence puis la règle (manche 1) ;
 *   'predicted' la PREMIÈRE question du signe, sur les cartes prédites seulement (manche 2) ;
 *   'build'     BÂTIR l'équivalence après la carte dont la solution ne tombe sur aucune graduation (manche 3 : √3) ;
 *   'none'      rien.
 */
export function chainOfPlayer(lab, mode = 'full', predictCards = []) {
  const kind = kindOf(lab);
  if (mode === 'full') return [...CHAINS_PLAYER[kind], ...(L.discoveryReady(lab) && buildCard(lab, 'full') >= 0 ? ['eqBuild', 'rule'] : [])];
  if (mode === 'predicted') return predictCards.includes(lab.card) ? [CHAINS_PLAYER[kind][0]] : [];
  if (mode === 'build') return kind === 'pos' && !L.landsOnTick(L.current(lab), lab.scale) ? ['eqBuild'] : [];
  return [];
}

/** La carte dont on BÂTIT l'équivalence : la carte courante (« build »), sinon la première carte a > 0 résolue (« full »). */
export function buildCard(lab, mode) {
  if (mode === 'build') return lab.card;
  return lab.targets.findIndex((tg, i) => tg.r.num > 0 && L.cardSolved(lab, i));
}

const uniq = (xs) => [...new Set(xs)];
const plainNum = (n) => L.targetText(Number(n.toFixed(6)));

/**
 * « x² = a ⇔ x = √a أو x = −√a » d'une carte : les tuiles, et la tuile de trop — la graduation VOISINE (1,7 pour √3 : la valeur approchée
 * n'est pas la solution) quand la solution ne tombe sur aucune graduation, sinon la MOITIÉ de a (le carré n'est pas le double), ou a² si la moitié
 * EST la solution (4 → 2).
 */
export function eqBuildOf(lab, i) {
  const tg = lab.targets[i];
  const aT = L.targetText(tg.a);
  const pos = L.solutionText(tg, 1);
  const neg = L.solutionText(tg, -1);
  let decoy;
  if (!L.landsOnTick(tg, lab.scale)) decoy = L.xText(Math.round(Math.sqrt(tg.r.num / tg.r.den) * lab.scale), lab.scale);
  else { decoy = plainNum(tg.a / 2); if (decoy === pos) decoy = plainNum(tg.a * tg.a); }
  return {
    a: aT, pos, neg, decoy,
    expected: [aT, pos, neg], tiles: [neg, decoy, aT, pos],
  };
}

Object.assign(QUESTIONS, {
  posSqFill: (lab, k) => {
    const tg = L.current(lab); const aT = L.targetText(tg.a);
    const nums = { s: L.solutionTex(tg, 1), neg: L.solutionTex(tg, -1), a: num(tg.a) };
    const options = uniq([aT, `−${aT}`, L.solutionText(tg, 1), plainNum(tg.a * 2)]);
    return {
      id: 'posSqFill', kind: 'fill', prompt: Mx(k, 'posSqFill.prompt', nums),
      fields: [{ label: k('cp.posSqFill.field'), expected: aT, options: [options[1], options[0], ...options.slice(2)] }],
      hints: [Mx(k, 'posSqFill.hint1', nums), Mx(k, 'posSqFill.hint2', nums)], explain: Mx(k, 'posSqFill.explain', nums),
    };
  },
  zeroCountFill: (lab, k) => ({
    id: 'zeroCountFill', kind: 'fill', prompt: Mx(k, 'zeroCount.prompt'),
    fields: [{ label: k('cp.countField'), expected: '1', options: ['0', '1', '2'] }],
    hints: [Mx(k, 'zeroCount.hint1'), Mx(k, 'zeroCount.hint2')], explain: Mx(k, 'zeroOpp.explain'),
  }),
  negCountFill: (lab, k) => {
    const nums = { a: num(L.current(lab).a) };
    return {
      id: 'negCountFill', kind: 'fill', prompt: Mx(k, 'negCount.prompt', nums),
      fields: [{ label: k('cp.countField'), expected: '0', options: ['0', '1', '2'] }],
      hints: [Mx(k, 'negCount.hint1', nums), Mx(k, 'negCount.hint2')], explain: Mx(k, 'negWhy.explain', nums),
    };
  },
  eqBuild: (lab, k) => {
    // la carte courante si c'est elle (a > 0, résolue) ; sinon la première carte a > 0 résolue (la règle s'atteint parfois sur 0 ou sur a < 0)
    const i = kindOf(lab) === 'pos' && L.cardSolved(lab, lab.card) ? lab.card : Math.max(0, buildCard(lab, 'full'));
    const x = eqBuildOf(lab, i);
    const o = { a: tex(x.a), s: L.solutionTex(lab.targets[i], 1), neg: L.solutionTex(lab.targets[i], -1), decoy: tex(x.decoy) };
    return {
      id: 'eqBuild', kind: 'build', prompt: Mx(k, 'eqBuild.prompt', o),
      slots: [k('cp.eqBuild.slotA'), k('cp.eqBuild.slotPos'), k('cp.eqBuild.slotNeg')], ops: [k('cp.eqBuild.opIff'), k('cp.eqBuild.opOr')],
      tiles: x.tiles, expected: x.expected,
      hints: [Mx(k, 'eqBuild.hint1', o), Mx(k, 'eqBuild.hint2', o)], explain: Mx(k, 'eqBuild.explain', o),
    };
  },
});
