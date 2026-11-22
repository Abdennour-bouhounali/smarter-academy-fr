import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Minus, Plus, ZoomIn } from 'lucide-react';
import * as squareRoots from '@smarter-academy/core/arithmetic/squareRoots.js';
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
import { chipsAround } from '../divisibility/divisionChecks';
import { useInMissionPlayer, useMissionArea } from '../../mission/missionPlayerContext';
import { playSfx } from '../../utils/playEffect';
import MathText from '../../components/MathText';
import * as L from '../logic/squareRootSide';

const { squareOfDecimal, reduce, exactDecimal } = squareRoots;
/** Lecteur : au plus PRED_MAX prédictions par manche (comme les autres labos), jamais pendant une suite de questions. */
const PRED_MAX = 2;
/** Lecteur : la hauteur prise par ce qui n'est pas le carré (manches, étape, pastilles, règle, − / +) — le carré prend le reste. */
const PLAYER_SCENE_OVERHEAD = 290;

/**
 * square-root-side — LE CARRÉ QU'ON ÉTIRE (unité 2 « الحساب على الجذور »).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. L'élève TIRE le bout du côté d'un carré le long d'une règle graduée
 *    (réglette `useStretchInteraction` ; clavier, − / + et toucher la règle).
 * B. Idée : √a est le côté du carré d'aire a — le nombre POSITIF dont le carré
 *    est a. Il tombe sur une graduation (36 → 6 ; 16/9 → 4/3) ou n'y tombe
 *    jamais (5, 6, 7) : il existe pourtant (c'est BC, l'hypoténuse du manuel).
 * C. Pendant le geste, le carré grandit sur le quadrillage à côté du carré
 *    visé (en pointillés) ; son aire se lit EXACTEMENT.
 * D. Au relâchement : c = …, c² = … et la comparaison « < a », « = a », « > a ».
 * E. À découvrir : refine — resserrer l'encadrement (1 → 0,1 → 0,01 → 0,001)
 *    ne rencontre jamais 5 ; graduation — une aire tombe sur une graduation
 *    exactement quand elle est le carré d'un rationnel.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        √a : le nombre positif dont le carré est a ; rationnel ou non
 *   OBJECT         un carré posé sur un quadrillage d'unités
 *   VARIABLE       c, la longueur du côté (le doigt tient son extrémité)
 *   INVARIANT      l'aire visée a ; la graduation choisie ; c ≥ 0
 *   TRANSFORMATION le carré, son aire c² et sa position par rapport à a
 *   CONSTRAINT     on ne lit c que sur une graduation (1/scale)
 *   RESISTANCE     pour 5, chaque graduation donne un carré trop petit OU trop
 *                  grand ; la loupe ne s'ouvre qu'après l'encadrement fait main
 *   EVIDENCE       c² lu exactement (2,236² = 4,999696), la couleur < / = / >
 *   CONTRAST       refine : 36 (juste) / 5 (jamais) — graduation : 16/9 / 6
 *   PREDICTION     « entre quels deux nombres est le côté ? » avant la loupe
 *   DISCOVERY      « aucun décimal n'a pour carré 5 : on nomme ce nombre √5 »
 *   FORMALIZATION  √a ≥ 0 et (√a)² = a ; √a ناطق ⇔ a مربّع عدد ناطق
 *   TRANSFER       معارف 1 et 2, les encadrements de تمرين 9 et 35
 *
 * Aucun flottant ne juge une égalité : logic/squareRootSide → core/squareRoots.
 */
/*
 * QUESTIONS PENDANT LE LABO (2026-10-28, `primitives/LabCheckpoint`) : `checkpoints` (défaut true). Deux étapes. refine : 1 « frame » (un encadrement serré, ou le côté
 * exact) — c² lu, puis l'encadrement (ou le nom du côté exact) ; 2 « rule » (la découverte atteinte) — le constat de l'encadrement qui ne rencontre jamais a, puis la
 * règle. graduation : 1 « frame » (une carte tombée juste) — le produit c × c, puis « ناطق » ; 2 « rule » (une carte qui résiste aussi) — le constat, puis la règle.
 *
 * ONBOARDING (prop `coach`, défaut true — `LabCoach`, §8quater, ajouté le 2026-11-09) : `logic/squareRootSide.js › coachOf` montre le bout du côté, puis
 * « دقّق » (refine) ou une autre graduation / une autre carte (graduation) — jamais la graduation où tomber ni le sens où tirer.
 *
 * LECTEUR DE MISSION (rollout 2026-11-09, traitement v2 ; conseil du 2026-11-09) : joué en MANCHES (LabRounds) ; `onVerdict` remonte chaque relâchement
 * ({ groups: la graduation, exact }) et `onTrial { tk: 'bracket', card, scale, resisting }` chaque NOUVEL encadrement serré (buts `{ bracketed: g }`,
 * `{ resists: true }`) ; `levels={false}` ; `predict` : « هل سيقع طرف الضلع بالضبط على تدريجة؟ » au DÉBUT des graduations de `predictAt` (refine,
 * défaut [1, 10]) ou avant le premier essai d'une carte (graduation), ≤ PRED_MAX par manche — la vérité est CALCULÉE (`landsAt` / `landsSomewhere`),
 * le résultat s'affiche quand la règle a tranché ; `chains` (['exact', 'never', 'grad']) ; `CHAINS_PLAYER` = exact : lire le côté d'un toucher → BÂTIR
 * « aire = côté × côté » (tuile de trop : la moitié) → la règle ; never : l'encadrement d'un toucher → BÂTIR « 4 < 5 < 9 » (tuile de trop : le produit des
 * deux voisins) → compter les chiffres après la virgule de c² (2k, jamais 0 au bout : jamais l'entier a — le « jamais » se VOIT) → la règle ; grad :
 * l'échelle 1/g d'un toucher → BÂTIR l'égalité → la carte qui résiste → la règle. Le JOURNAL « 📋 جدول تجاربك » (graduation · en dessous · au-dessus) dans la
 * colonne de la scène ; `handDone` ouvre « جرّب كل الإمكانيات » ; `choices` : des aires { num, den } à toucher (terrain libre). Les commandes se figent
 * pendant une prédiction ou une question ; toujours guidé ; pas de fête quand l'étape est cachée. Hors lecteur : inchangé.
 */
export default function SquareRootSide({
  mode = 'refine', num: num0 = 36, den: den0 = 1, scale: maxScale0, areas: areas0,
  calculator, figure, title, lead, mission, level, levels: withLevels = true, checkpoints: cpOn = true, initialMode = 'student', allowModeSwitch = false, onFinished, onTrial,
  coach: coachOn = true,
  // ── LECTEUR DE MISSION (rollout 2026-11-09, traitement v2) ──
  onVerdict, handDone = false, chains: chainsOn = ['exact', 'never', 'grad'], predict: predictOn = true, predictAt = [1, 10], choices,
}) {
  const { t } = useTranslation('lesson');
  const gameScreen = useInMissionPlayer();
  const uid = useId();
  const journalId = `${uid}-journal`;
  const choicesId = `${uid}-choices`;
  const missionArea = useMissionArea();
  const k = useCallback((key, o) => t(`manipulation.squareRoot.${key}`, o), [t]);
  const refineMode = mode === 'refine';
  const state = useManipulation({
    type: 'square-root-side',
    initialNumbers: { num: num0, den: den0, scale: maxScale0 ?? (refineMode ? 1000 : 12) },
    initialMode, initialLevel: level,
    // Les paires de levels.js sont des aires du mode refine : posé SEUL en mode
    // graduation, le laboratoire n'a pas de second niveau (dans un workspace,
    // c'est la leçon qui déclare ses deux niveaux).
    withLevels: withLevels && refineMode,
    hintCount: 3,
  });
  const { num, den, scale: maxScale } = state.numbers;
  const areas = refineMode ? [{ num, den }] : (areas0 ?? [{ num, den }]);
  const areasKey = areas.map((a) => `${a.num}/${a.den}`).join(',');

  const makeLab = () => L.init({ mode, areas, maxScale, truthful: gameScreen });
  const [lab, setLab] = useState(makeLab);
  const sceneKey = `${areasKey}:${maxScale}:${state.epoch}`;
  const [scene, setScene] = useState({ key: sceneKey, inits: 0 });
  const [done, setDone] = useState([false, false]);
  const snap = useRef(null);
  // lecteur : la dernière prédiction { key, ok }, les clés déjà prédites, le nombre de prédictions de la manche
  const [pred, setPred] = useState(null);
  const predsMade = useRef(0);
  const asked = useRef(new Set());
  const [missionBig, setMissionBig] = useState(false);
  if (scene.key !== sceneKey) {
    // « إعادة », un autre niveau ou d'autres aires : TOUT recommence — les essais, les étapes et les questions du labo
    setScene({ key: sceneKey, inits: scene.inits + 1 });
    setLab(makeLab()); setDone([false, false]); snap.current = null;
    setPred(null); predsMade.current = 0; asked.current = new Set();
  }
  // la manche (LabRounds) repart de zéro avec la scène : ses verdicts, prédictions et encadrements d'avant ne comptent plus
  useEffect(() => { if (scene.inits > 0) state.report(onTrial, { tk: 'reset' }); }, [scene.inits]); // eslint-disable-line react-hooks/exhaustive-deps

  const [live, setLive] = useState(null); // la valeur sous le doigt
  const area = L.currentArea(lab);
  const range = L.range(lab);

  // La mémoire courante, lue au relâchement : le rappel de la leçon part
  // HORS du `setState` (un updater doit rester pur — StrictMode le rejoue).
  const labRef = useRef(lab);
  labRef.current = lab;
  // Les valeurs déjà ESSAYÉES (relâchement ou balayage) par carte et graduation : jamais la valeur par défaut.
  const testedRef = useRef({ scene: sceneKey, sets: {} });
  if (testedRef.current.scene !== sceneKey) testedRef.current = { scene: sceneKey, sets: {} };
  const setKey = (st) => `${st.card}:${st.scale}`;
  // lecteur : les commandes se FIGENT pendant une prédiction ou une question (la scène ne bouge pas sous la question)
  const lockedRef = useRef(false);
  const commit = useCallback((v) => {
    if (lockedRef.current) { setLive(null); return; }
    setLive(v);
    const prev = labRef.current;
    // relâcher sur la MÊME valeur n'est pas un nouvel essai (ni verdict, ni son)
    if (prev.last && prev.last.v === v) return;
    const next = L.test(prev, v);
    if (next === prev) return;
    const sk = setKey(prev);
    testedRef.current.sets[sk] = new Set([...(testedRef.current.sets[sk] ?? []), v]);
    labRef.current = next;
    playSfx(next.last.cmp === 0 ? 'bell' : 'over');
    setLab(next);
    state.report(onTrial, { area: L.currentArea(next), side: v, scale: next.scale, cmp: next.last.cmp });
    // la manche (LabRounds) : chaque relâchement est un essai ; chaque NOUVEL encadrement serré est un événement
    state.report(onVerdict, { groups: next.scale, exact: next.last.cmp === 0 });
    if (!L.tight(L.cellOf(prev)) && L.tight(L.cellOf(next))) {
      state.report(onTrial, { tk: 'bracket', card: next.card, scale: next.scale, resisting: L.cardStatus(next, next.card) === 'resisting' });
    }
  }, [state, onTrial, onVerdict]);
  const untested = () => {
    const r = L.range(labRef.current);
    const done = testedRef.current.sets[setKey(labRef.current)] ?? new Set();
    return Array.from({ length: r.max - r.min + 1 }, (_, i) => r.min + i).filter((v) => !done.has(v));
  };
  useEffect(() => { setLive(null); }, [lab.scale, lab.card, state.epoch]);

  const cpSettings = useLabCheckpointSettings('square-root-side');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const cpActive = cpOn && cpSettings.enabled;
  const stepIdx = done[0] ? 1 : 0;
  const stepId = stepIdx === 0 ? 'frame' : 'rule';
  // lecteur : lire d'un toucher puis BÂTIR (traitement v2) ; la page garde ses suites. `chains` dit quelles suites cette manche pose.
  // Dans le lecteur la suite suit la VÉRITÉ (le côté tombera-t-il ?), pas ce qui est déjà trouvé : la suite « exact » s'ouvre quand le côté TOMBE
  // (0,04 s'encadre d'abord entre 0 et 1, puis tombe sur 0,2) ; la page garde son ordre (encadrement d'abord).
  const chainKey = gameScreen ? truthKeyOf(lab) : chainKeyOf(lab);
  const reachedNow = stepIdx === 0
    ? (gameScreen && chainKey === 'exact' ? L.foundSide(lab, 0) != null : frameReached(lab))
    : L.discoveryReady(lab);
  const chainOn = chainsOn.includes(chainKey);
  const chain = cpActive && chainOn && !done[1] && reachedNow ? (gameScreen ? chainOfPlayer : chainOf)(stepIdx, lab) : null;
  const showStepper = cpActive && !(gameScreen && !chainOn);
  const party = useStepCelebration();
  const cp = useLabCheckpoint({
    id: chain ? stepId : null,
    // lecteur : l'explication de la règle reste COURTE (le dernier encadrement seul) — la colonne de la question tient dans l'écran
    questions: chain ? chain.map((q) => QUESTIONS[q](lab, k, { calculator, figure, compact: gameScreen })) : null,
    reached: reachedNow,
    resetKey: scene.inits,
    onRetry: () => {
      setLive(null); labRef.current = stepIdx === 0 ? makeLab() : (snap.current ?? makeLab()); setLab(labRef.current);
      // lecteur : à l'étape 1 tout recommence — la manche oublie aussi ses verdicts et ses encadrements (revue ECC 2026-11-10) ; à l'étape 2
      // le labo revient à l'instantané de l'étape 1, dont les essais restent des essais de la manche
      if (gameScreen && stepIdx === 0) state.report(onTrial, { tk: 'retry' });
    },
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => {
      if (id === 'frame') { snap.current = labRef.current; setDone([true, false]); if (showStepper) party.celebrate({ n: 1, total: 2 }); return; }
      setDone([true, true]); if (showStepper) party.celebrate({ n: 2, total: 2 });
      state.discover(); state.formalize();
    },
  });

  // lecteur : les PRÉDICTIONS — refine : au début d'une graduation de `predictAt` ; graduation : avant le premier essai d'une carte
  const here = L.cellOf(lab);
  const untouched = refineMode ? here.below == null && here.above == null && here.exact == null : L.brackets(lab, lab.card).length === 0;
  const predKey = refineMode ? `${lab.card}:${lab.scale}` : `card:${lab.card}`;
  const predictOpen = gameScreen && predictOn && cpActive && !cp.open && !missionBig && predsMade.current < PRED_MAX && untouched
    && !asked.current.has(predKey) && (!refineMode || predictAt.includes(lab.scale)) && !L.discoveryReady(lab);
  const locked = gameScreen && (cp.open || predictOpen);
  lockedRef.current = locked;
  const sayPredict = (says) => {
    const truth = refineMode ? L.landsAt(L.currentArea(lab), lab.scale) : L.landsSomewhere(L.currentArea(lab), maxScale);
    const ok = (says === 'yes') === truth;
    asked.current.add(predKey);
    predsMade.current += 1;
    playSfx('pop');
    setPred({ key: predKey, ok });
    state.report(onTrial, { tk: 'predict', ok });
  };
  // la prédiction est JUGÉE par la règle : son résultat s'affiche quand la graduation (ou la carte) a tranché
  const predResolved = !!pred && pred.key === predKey
    && (refineMode ? here.exact != null || L.tight(here) : L.cardStatus(lab, lab.card) !== 'open');
  const heardPred = useRef(null);
  useEffect(() => {
    if (!predResolved || heardPred.current === pred.key) return;
    heardPred.current = pred.key;
    playSfx(pred.ok ? 'correct' : 'pop');
  }, [predResolved]); // eslint-disable-line react-hooks/exhaustive-deps
  const predResult = gameScreen && predResolved && !cp.open;
  // pendant une question, ce que la scène ÉCRIT se tait ; pendant les questions de l'encadrement, la scène montre le carré du BAS de l'encadrement
  const quiet = gameScreen && cp.open;
  const frameFocus = quiet && (cp.qid === 'nBetweenFill' || cp.qid === 'nSquaresBuild') ? firstTight(lab) : null;
  const focusSide = frameFocus && frameFocus.scale === lab.scale ? frameFocus.below : null;

  const ready = L.discoveryReady(lab) && !cpActive;
  const sfx = useRef(0);
  const wasReady = useRef(false);
  useEffect(() => { if (L.discoveryReady(lab) && !wasReady.current) playSfx('flag'); wasReady.current = L.discoveryReady(lab); }, [lab]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (ready) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (state.isFormal) state.report(onFinished, { outcome: L.refineOutcome(lab) }); }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Géométrie : la règle prend la largeur ; le carré est dessiné à une
  // échelle FIXE (celle de la graduation entière), donc il grandit pendant le
  // geste à la graduation 1 et ne change presque plus sous la loupe — ce que
  // l'œil ne distingue plus, les nombres le distinguent.
  const boxRef = useRef(null);
  const [width, setWidth] = useState(300);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => setWidth(Math.max(240, Math.floor(el.clientWidth)));
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  // Dans le lecteur de mission le labo est monté dans une copie cachée puis déplacé : le ResizeObserver ne ré-annonce pas toujours la vraie
  // largeur (piège du rollout de la leçon « قواسم عدد طبيعي »). On re-mesure donc aussi à chaque rendu (même valeur = aucun nouveau rendu).
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (el) { const w = Math.max(240, Math.floor(el.clientWidth)); setWidth((cur) => (cur === w ? cur : w)); }
  });
  const EDGE = 22;
  const span = range.max - range.min;
  const mu = (width - 2 * EDGE) / Math.max(1, span);
  const xOf = (v) => EDGE + (v - range.min) * mu;
  const toValue = useCallback((clientX, _y, rect) => range.min + (clientX - rect.left - EDGE) / mu, [range.min, mu]);
  const stretch = useStretchInteraction({
    value: live ?? lab.side ?? range.min, range, toValue,
    onChange: (v) => { if (lockedRef.current) return; setLive(v); const now = performance.now(); if (now - sfx.current > 35) { playSfx('tooth'); sfx.current = now; } },
    onCommit: commit, direction: 'ltr',
  });

  // Une valeur PAR DÉFAUT (le début de la règle : un carré trop petit, jamais la réponse) : jamais vide à l'ouverture.
  // Ce n'est pas un essai : `L.test` n'est appelé ici que pour LIRE la comparaison, son résultat est jeté.
  const shown = focusSide ?? live ?? lab.side ?? range.min;
  const isDefault = lab.last == null && live == null;
  const readout = isDefault ? L.test(lab, range.min).last : lab.last;
  const settled = readout != null && !stretch.dragging && shown === readout.v;
  const cmp = focusSide != null ? -1 : settled ? readout.cmp : null;
  const frameUnits = Math.max(2, Math.ceil(L.drawRoot(area)) + 1);
  // lecteur : le carré prend la hauteur qui reste dans l'écran de jeu (jamais de défilement), borné pour rester lisible
  const box = gameScreen && missionArea?.height
    ? Math.round(Math.min(380, width * 0.5, Math.max(180, missionArea.height - PLAYER_SCENE_OVERHEAD)))
    : Math.min(260, Math.max(180, width * 0.55));
  const px = box / frameUnits;
  const sidePx = shown == null ? 0 : Math.min(box, L.drawSide(shown, lab.scale) * px);
  const targetPx = L.drawRoot(area) * px;
  const tone = cmp === 0 ? '#059669' : cmp < 0 ? '#B45309' : cmp > 0 ? '#E11D48' : '#6366F1';
  const labelEvery = [1, 2, 5, 10, 20, 50].find((s) => s * mu >= 30) ?? 100;
  const aTex = L.areaTex(area);
  const cmpWord = cmp === 0 ? k('equal', { area: L.areaText(area) }) : cmp < 0 ? k('smaller', { area: L.areaText(area) }) : k('larger', { area: L.areaText(area) });

  const brackets = L.brackets(lab);
  const disc = discoveryParts(lab, k, { calculator, figure, compact: gameScreen });
  // le journal : sur la page, le tableau des encadrements (refine) ; dans le lecteur, « 📋 جدول تجاربك » dans les deux modes, muet pendant une question
  const showMemo = brackets.length > 0 && (gameScreen ? !quiet : refineMode);

  const coachStep = coachOn && !locked && !cp.open ? L.coachOf(lab) : null;
  const coach = useLabCoach({
    lab: 'square-root-side', step: coachStep, text: coachStep ? k(`coach.${coachStep.id}`) : '',
    labels: { hide: t('manipulation.common.coach.hide'), show: t('manipulation.common.coach.show'), ok: t('manipulation.common.coach.ok'), stop: t('manipulation.common.coach.stop') },
  });

  // lecteur : la prédiction ou la question PREND la colonne du labo
  const gradText = lab.scale === 1 ? '1' : L.sideText(1, lab.scale);
  const trayNode = !gameScreen ? null : predictOpen ? (
    <PredictTray attr="rs"
      title={t('manipulation.common.cp.predict.title')}
      prompt={refineMode ? k('predict.prompt', { grad: gradText }) : k('predict.promptCard', { area: L.areaText(L.currentArea(lab)) })}
      options={[{ says: 'yes', text: k('predict.yes') }, { says: 'no', text: k('predict.no') }]}
      onSay={sayPredict} />
  ) : cp.open ? cp.node : null;

  return (
    <ManipulationShell
      type="square-root-side"
      title={title ?? k(refineMode ? 'titleRefine' : 'titleGraduation', { area: L.areaText(area) })}
      mission={mission ?? k(refineMode ? 'missionRefine' : 'missionGraduation', { area: L.areaText(area) })}
      lead={lead}
      state={state}
      coach={coachOn ? coach : null}
      numberFields={refineMode ? [{ key: 'num', label: 'a' }] : []}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={gameScreen ? false : refineMode}
      headerAction={cpOn ? cpSettings.control : null}
      // lecteur : l'écran de jeu est toujours GUIDÉ (les manches et les questions guident)
      guided={cpActive || gameScreen}
      hideRepresentation={(gameScreen && locked) || undefined}
      onIntroChange={setMissionBig}
      sidePanel={trayNode ? <div data-rs-tray>{trayNode}</div> : null}
      hints={(refineMode ? [k('hint1'), k('hint2', { area: L.areaText(area) }), k('hint3')] : [k('gHint1'), k('gHint2'), k('gHint3')]).map((h) => <MathText key={h}>{h}</MathText>)}
      controller={{
        autoStep: () => false,
        canAutoStep: () => false,
        // Balayer la règle, graduation après graduation : chaque position est un essai (c² vs a lu exactement).
        // lecteur : « جرّب كل الإمكانيات » est le BOUTON du geste appris — il s'ouvre après la manche à la main (handDone)
        autoComplete: gameScreen && !handDone ? undefined : {
          label: t('manipulation.autoComplete.tryAll'),
          ready: !locked,
          remaining: untested().length,
          intervalMs: 480,
          maxTicks: 80,
          step: () => { const next = untested()[0]; if (next !== undefined) commit(next); },
          finish: () => { untested().forEach((v) => commit(v)); },
        },
      }}
      representation={settled && (
        <EquationDisplay
          tex={`c = ${L.sideTex(readout.v, lab.scale)} \\quad c^2 = ${L.squareTex(readout.v, lab.scale)} ${cmp === 0 ? '=' : cmp < 0 ? '<' : '>'} ${aTex}`}
          tone={cmp === 0 ? 'ok' : 'neutral'}
          note={<MathText>{cmpWord}</MathText>}
        />
      )}
      discovery={(
        <ManipulationDiscovery
          state={state}
          prompt={disc.prompt}
          options={disc.options}
          formal={disc.formal}
        />
      )}
      explanation={<MathText>{refineMode ? k('explanation') : k('gExplanation')}</MathText>}
    >
      <div className="relative" data-rs-glance>
        {party.node}
        {!(gameScreen && cp.open) && cp.node}
      <ManipulationStage className="bg-gradient-to-b from-sky-50/60 to-white" data-dragging={stretch.dragging ? 'true' : undefined}>
        <div ref={boxRef} className="space-y-3" data-root-side data-mode={mode}>
          {showStepper && <LabStepper count={2} current={stepIdx} done={done.map((d, i) => d && (i !== stepIdx || !cp.blocking))} stepAttr="data-rs-step" />}
          <div role="status" aria-live="polite" data-rs-predict-live>
          {predResult && (
            <p data-rs-predict-result={pred.ok ? 'ok' : 'wrong'}
              className={`rounded-2xl px-4 py-2 text-center text-lg font-black ${pred.ok ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
              {pred.ok ? t('manipulation.common.cp.predict.right') : t('manipulation.common.cp.predict.wrong')}
            </p>
          )}
          </div>
          {gameScreen && refineMode && choices?.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-labelledby={choicesId} data-rs-choices>
              <span id={choicesId} className="text-sm font-bold text-slate-600">{k('choicesLabel')}</span>
              {choices.map((c) => (
                <button key={`${c.num}/${c.den}`} type="button" data-rs-choice={`${c.num}/${c.den}`} aria-pressed={c.num === num && c.den === den} disabled={locked} onClick={() => state.setNumbers({ ...state.numbers, num: c.num, den: c.den })}
                  className={`min-h-[44px] rounded-xl border-2 px-3 text-base font-black ${c.num === num && c.den === den ? 'border-indigo-500 bg-indigo-50 text-indigo-900' : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300'}`}>
                  <bdi dir="ltr">{L.areaText(c)}</bdi>
                </button>
              ))}
            </div>
          )}
          {/* ── Les cartes (graduation) ou l'aire visée (refine) ── */}
          {refineMode ? (
            <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-700">
              <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">{k('target')}{' '}<bdi dir="ltr" className="font-mono">{L.areaText(area)}</bdi></span>
              <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200" data-root-scale={lab.scale}>{k('graduation')}{' '}<bdi dir="ltr" className="font-mono">{lab.scale === 1 ? '1' : L.sideText(1, lab.scale)}</bdi></span>
              <button type="button" onClick={() => setLab((s) => L.refine(s))} disabled={!L.canRefine(lab) || locked} data-root-refine
                className="inline-flex min-h-[44px] items-center gap-1 rounded-xl border-2 border-sky-400 bg-white px-3 py-1 text-sky-800 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2">
                <ZoomIn className="h-4 w-4" aria-hidden="true" /> {k('refine')}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2" role="group" aria-label={k('cards')} data-root-cards>
                {lab.cards.map((c, i) => {
                  const st = L.cardStatus(lab, i);
                  return (
                    <button key={`${c.num}/${c.den}`} type="button" onClick={() => setLab((s) => L.setCard(s, i))} disabled={locked} aria-pressed={lab.card === i} data-root-card={i} data-status={st}
                      className={`min-h-[44px] rounded-xl border-2 px-3 py-1 text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 ${lab.card === i ? 'border-sky-600 bg-sky-50' : 'border-slate-300 bg-white'} ${st === 'exact' ? 'text-emerald-800' : st === 'resisting' ? 'text-rose-800' : 'text-slate-800'}`}>
                      <span dir="ltr"><MathText>{`$\\sqrt{${L.areaTex(c)}}$`}</MathText></span>{st !== 'open' && <span aria-hidden="true">{st === 'exact' ? ' ✓' : ' ✗'}</span>}{st !== 'open' && <span className="sr-only">{k(st === 'exact' ? 'cardExactSr' : 'cardResistingSr')}</span>}
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={k('graduations')} data-root-graduations>
                <span className="text-xs font-bold text-slate-600">{k('graduations')}</span>
                {Array.from({ length: maxScale }, (_, i) => i + 1).map((g) => (
                  <button key={g} type="button" onClick={() => setLab((s) => L.setScale(s, g))} disabled={locked} aria-pressed={lab.scale === g} aria-label={`1/${g} — ${k('graduationAria', { g })}`} data-root-grad={g}
                    className={`h-11 min-w-[2.75rem] rounded-lg border-2 font-mono text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 ${lab.scale === g ? 'border-sky-700 bg-sky-700 text-white' : 'border-slate-300 bg-white text-slate-800'}`}>
                    <span dir="ltr">1/{g}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── LA RÈGLE : la longueur du côté, tenue au doigt ── */}
          <div dir="ltr" {...stretch.trackProps} className="relative" style={{ ...stretch.trackProps.style, height: 64, ...(locked ? { pointerEvents: 'none' } : {}) }} data-root-ruler>
            <svg width={width} height={64} className="absolute inset-0" aria-hidden="true" focusable="false">
              <rect x={EDGE - 4} y={28} width={span * mu + 8} height={5} rx={2} fill="#0369A1" />
              {shown != null && <rect x={EDGE} y={14} width={Math.max(0, (shown - range.min) * mu)} height={12} rx={3} fill={tone} opacity={0.85} />}
              {Array.from({ length: span + 1 }, (_, i) => range.min + i).map((v) => (
                <g key={v}>
                  <line x1={xOf(v)} x2={xOf(v)} y1={35} y2={v % 10 === 0 || lab.scale === 1 ? 45 : 40} stroke="#64748B" />
                  {(v - range.min) % labelEvery === 0 && <text x={xOf(v)} y={58} textAnchor="middle" fontSize={11} fill="#334155" fontFamily="ui-monospace, monospace">{L.sideText(v, lab.scale)}</text>}
                </g>
              ))}
            </svg>
            <div
              {...stretch.handleProps({ label: k('handle'), valueText: shown == null ? k('notSet') : k('valueText', { c: L.sideText(shown, lab.scale) }) })}
              data-root-handle
              aria-disabled={locked || undefined}
              className={`absolute top-1 flex h-11 w-11 -translate-x-1/2 items-start justify-center rounded-xl border-2 outline-none focus-visible:ring-4 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 ${stretch.dragging ? 'border-blue-500 bg-blue-500/10' : 'border-slate-400 bg-white/60'}`}
              style={{ left: xOf(shown ?? range.min), cursor: stretch.dragging ? 'grabbing' : 'grab' }}
            >
              <span className="-mt-3 whitespace-nowrap rounded-full bg-slate-800 px-2 font-mono text-sm font-extrabold text-white" aria-hidden="true" data-root-value>{shown == null ? '?' : L.sideText(shown, lab.scale)}</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2">
            <button type="button" onClick={() => stretch.nudge(-1)} aria-label={k('shorter')} disabled={locked || (shown != null && shown <= range.min)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-300 bg-white disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"><Minus className="h-5 w-5" aria-hidden="true" /></button>
            <p className="min-w-[8rem] text-center text-sm font-bold text-slate-700">{shown == null ? k('notSet') : k('valueText', { c: L.sideText(shown, lab.scale) })}</p>
            <button type="button" onClick={() => stretch.nudge(1)} aria-label={k('longer')} disabled={locked || (shown != null && shown >= range.max)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-300 bg-white disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"><Plus className="h-5 w-5" aria-hidden="true" /></button>
          </div>

          <div className="grid gap-3 grid-cols-[auto_1fr]">
            {/* ── LE CARRÉ sur son quadrillage, et le carré visé en pointillés ── */}
            <div className="flex justify-center rounded-2xl border-2 border-slate-200 bg-white p-2" dir="ltr">
              <svg width={box} height={box} viewBox={`0 0 ${box} ${box}`} role="img" data-root-square data-cmp={cmp ?? ''}
                aria-label={shown == null ? k('notSet') : `c = ${L.sideText(shown, lab.scale)} ; c² = ${settled ? plain(L.squareTex(shown, lab.scale)) : '…'}`}>
                {Array.from({ length: frameUnits + 1 }, (_, i) => (
                  <g key={i}>
                    <line x1={i * px} x2={i * px} y1={0} y2={box} stroke="#E2E8F0" />
                    <line x1={0} x2={box} y1={box - i * px} y2={box - i * px} stroke="#E2E8F0" />
                  </g>
                ))}
                <rect x={0} y={box - targetPx} width={targetPx} height={targetPx} fill="none" stroke="#334155" strokeWidth={2} strokeDasharray="6 4" data-root-target />
                {sidePx > 0 && <rect x={0} y={box - sidePx} width={sidePx} height={sidePx} fill={tone} fillOpacity={0.28} stroke={tone} strokeWidth={2.5} />}
              </svg>
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-bold text-slate-800">{k('legend')}</p>
              <p className="text-slate-600">{k('legendTarget', { area: L.areaText(area) })}</p>
              {gameScreen && showMemo && <p id={journalId} className="text-sm font-black text-indigo-900" data-root-journal><span aria-hidden="true">📋 </span>{k('journal').replace(/^📋\s*/u, '')}</p>}
              {showMemo && (
                <table className="w-full text-center text-sm" dir="ltr" aria-labelledby={gameScreen ? journalId : undefined} data-root-memory>
                  <thead><tr className="text-xs text-slate-500"><th scope="col" className="font-bold">{k('colGraduation')}</th><th scope="col" className="font-bold">{k('colBelow')}</th><th scope="col" className="font-bold">{k('colAbove')}</th></tr></thead>
                  <tbody>
                    {brackets.map((b) => (
                      <tr key={b.scale} className={b.exact != null ? 'text-emerald-800' : 'text-slate-800'}>
                        <th scope="row" className="font-mono font-normal">{L.sideText(1, b.scale)}</th>
                        <td className="font-mono">{b.exact != null ? `${L.sideText(b.exact, b.scale)} ✓` : b.below != null ? squareLine(b.below, b.scale) : '—'}</td>
                        <td className="font-mono">{b.exact != null ? '—' : b.above != null ? squareLine(b.above, b.scale) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {refineMode && lab.last && lab.last.cmp !== 0 && !L.canRefine(lab) && !L.tight(brackets.find((b) => b.scale === lab.scale) ?? {}) && (
                <p className="text-xs text-slate-500">{k('needBracket', { area: L.areaText(area) })}</p>
              )}
              {refineMode && L.canRefine(lab) && <p className="text-xs font-bold text-sky-800" data-root-can-refine>{k('canRefine')}</p>}
            </div>
          </div>
        </div>
      </ManipulationStage>
      </div>
    </ManipulationShell>
  );
}

/** La découverte (prompt, options, formalisation) : posée sous le labo quand les questions sont coupées, sinon c'est la dernière question du labo. */
export function discoveryParts(lab, k, { calculator, figure, compact = false } = {}) {
  const refineMode = lab.mode === 'refine';
  const area = L.currentArea(lab);
  const aTex = L.areaTex(area);
  const outcome = L.refineOutcome(lab);
  const brackets = L.brackets(lab);
  const prompt = refineMode ? k(outcome === 'exact' ? 'dExactPrompt' : 'dNeverPrompt', { area: L.areaText(area) }) : k('gPrompt');
  const options = refineMode
    ? (outcome === 'exact'
      ? [
        { text: k('dExactOpt2', { area: L.areaText(area), half: L.areaText(reduce({ num: area.num, den: area.den * 2 })) }), why: <MathText>{k('dExactWhy2')}</MathText> },
        { text: <MathText>{k('dExactOpt1', { area: L.areaText(area), side: foundText(lab) })}</MathText>, correct: true },
        { text: <MathText>{k('dExactOpt3', { side: foundText(lab) })}</MathText>, why: <MathText>{k('dExactWhy3', { side: foundText(lab), area: L.areaText(area) })}</MathText> },
      ]
      : [
        { text: <MathText>{k('dNeverOpt2', { area: L.areaText(area) })}</MathText>, why: <MathText>{k('dNeverWhy2')}</MathText> },
        { text: <MathText>{k('dNeverOpt3', { area: L.areaText(area) })}</MathText>, why: <MathText>{k('dNeverWhy3', { area: L.areaText(area) })}</MathText> },
        { text: <MathText>{k('dNeverOpt1', { area: L.areaText(area) })}</MathText>, correct: true },
      ])
    : [
      { text: <MathText>{k('gOpt2')}</MathText>, why: <MathText>{k('gWhy2')}</MathText> },
      { text: <MathText>{k('gOpt1')}</MathText>, correct: true },
      { text: <MathText>{k('gOpt3')}</MathText>, why: <MathText>{k('gWhy3')}</MathText> },
    ];
  const formal = refineMode ? (
    outcome === 'exact' ? (
      <div className="space-y-2">
        <EquationDisplay tex={`\\sqrt{${aTex}} = ${foundTex(lab)} \\qquad (${foundTex(lab)})^2 = ${aTex}`} tone="result" note={<MathText>{k('fExact', { area: L.areaText(area), side: foundText(lab) })}</MathText>} />
        <p className="text-sm text-slate-700">{k('fPositive', { side: foundText(lab), area: L.areaText(area) })}</p>
      </div>
    ) : compact ? (
      // lecteur : DEUX lignes — le dernier encadrement et (√a)² = a — puis la phrase ; la colonne de la question tient dans l'écran
      <div className="space-y-1" data-root-brackets-compact>
        {brackets.filter(L.tight).slice(-1).map((b) => (
          <p key={b.scale} dir="ltr" className="text-center"><MathText>{`$${L.sideTex(b.below, b.scale)} < \\sqrt{${aTex}} < ${L.sideTex(b.above, b.scale)} \\qquad (\\sqrt{${aTex}})^2 = ${aTex}$`}</MathText></p>
        ))}
        <p className="text-sm font-bold text-emerald-900"><MathText>{k('fNever', { area: L.areaText(area) })}</MathText></p>
      </div>
    ) : (
      <div className="space-y-2">
        <ul className="space-y-1" dir="ltr" data-root-brackets>
          {brackets.filter(L.tight).map((b) => (
            <li key={b.scale}><MathText>{`$${L.sideTex(b.below, b.scale)} < \\sqrt{${aTex}} < ${L.sideTex(b.above, b.scale)}$`}</MathText></li>
          ))}
        </ul>
        <EquationDisplay tex={`(\\sqrt{${aTex}})^2 = ${aTex}`} tone="result" note={<MathText>{k('fNever', { area: L.areaText(area) })}</MathText>} />
        {calculator && (
          <EquationDisplay tex={`${calculator.replace(',', '{,}')}^2 = ${squareOfDecimal(calculator).replace(',', '{,}')} \\neq ${aTex}`} tone="muted" note={<MathText>{k('fCalculator', { reading: calculator })}</MathText>} />
        )}
        {figure === 'bc-square' && <BcSquare k={k} />}
      </div>
    )
  ) : compact ? (
    // lecteur (graduation) : la RÈGLE seule — les cartes au-dessus portent déjà leur ✓ / ✗ ; la colonne de la question tient dans l'écran
    <p className="rounded-xl border-2 border-emerald-200 bg-white px-3 py-2 text-sm text-emerald-900" data-root-classes-compact><MathText>{k('gFormal')}</MathText></p>
  ) : (
    <div className="space-y-2">
      <ul className="space-y-1" data-root-classes>
        {lab.cards.map((c, i) => {
          const st = L.cardStatus(lab, i);
          const f = L.foundSide(lab, i);
          return (
            <li key={`${c.num}/${c.den}`} className="flex flex-wrap items-center gap-2 text-sm" data-root-class={st}>
              <span dir="ltr"><MathText>{`$\\sqrt{${L.areaTex(c)}}${f ? ` = ${L.sideTex(f.v, f.scale)}` : ''}$`}</MathText></span>
              <span className="text-slate-700">{st === 'exact' ? k('classRational') : st === 'resisting' ? k('classResisting') : k('classOpen')}</span>
            </li>
          );
        })}
      </ul>
      <p className="rounded-xl border-2 border-emerald-200 bg-white px-3 py-2 text-sm text-emerald-900"><MathText>{k('gFormal')}</MathText></p>
    </div>
  );
  return { prompt, options, formal };
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

const exactCard = (lab) => lab.cards.findIndex((_, i) => L.cardStatus(lab, i) === 'exact');
const resistingCard = (lab) => lab.cards.findIndex((_, i) => L.cardStatus(lab, i) === 'resisting');
const firstTight = (lab) => L.brackets(lab, 0).find((b) => b.exact == null && L.tight(b));

/** L'étape 1 est atteinte : refine — un encadrement serré ou le côté exact ; graduation — une carte tombée juste. */
export const frameReached = (lab) => (lab.mode === 'refine'
  ? L.brackets(lab, 0).some((b) => b.exact != null || L.tight(b))
  : exactCard(lab) >= 0);

/** Les suites : [étape 1, étape 2] selon le mode et l'issue ; chaque question est construite sur les nombres de l'élève. */
export const CHAINS = Object.freeze({
  exact: [['exSq', 'exName'], ['rule']],
  never: [['bSq', 'bRead'], ['zoom', 'rule']],
  grad: [['gSq', 'gRational'], ['gResist', 'rule']],
});
export const chainOf = (stepIdx, lab) => CHAINS[lab.mode === 'graduation' ? 'grad' : (L.foundSide(lab, 0) ? 'exact' : 'never')][stepIdx];

const Mx = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
// le texte SIMPLE d'une écriture TeX : la virgule décimale, et une fraction « \\dfrac{9}{4} » écrite 9/4 (journal du mode graduation, rollout 2026-11-09)
const plain = (tex) => String(tex).replaceAll('{,}', ',').replace(/\\dfrac\{(\d+)\}\{(\d+)\}/g, '$1/$2');
/** « c² = … » dans le journal : un côté fractionnaire s'écrit entre parenthèses — (5/4)², jamais 5/4² (qui serait 5/16). */
export const squareLine = (v, scale) => { const c = L.sideText(v, scale); return `${c.includes('/') ? `(${c})` : c}² = ${plain(L.squareTex(v, scale))}`; };
const ratText = (a) => `${a.num}/${a.den}`;

export const QUESTIONS = {
  exSq: (lab, k) => {
    const f = L.foundSide(lab, 0); const area = L.currentArea(lab);
    const nums = { c: L.sideText(f.v, f.scale), area: L.areaText(area), csq: L.squareTex(f.v, f.scale) };
    return {
      id: 'exSq', kind: 'number', expected: ratText(area), answer: <MathText>{`$${L.areaTex(area)}$`}</MathText>,
      prompt: Mx(k, 'exSq.prompt', nums), hints: [Mx(k, 'exSq.hint1', nums), Mx(k, 'exSq.hint2', nums)], explain: Mx(k, 'exSq.explain', nums),
    };
  },
  exName: (lab, k) => {
    const f = L.foundSide(lab, 0); const area = L.currentArea(lab);
    const nums = { c: L.sideText(f.v, f.scale), area: L.areaText(area), half: L.areaText(reduce({ num: area.num, den: area.den * 2 })), twice: L.areaText(reduce({ num: area.num * 2, den: area.den })) };
    return {
      id: 'exName', kind: 'choice',
      prompt: Mx(k, 'exName.prompt', nums),
      options: [
        { text: Mx(k, 'exName.wrongHalf', nums), why: Mx(k, 'exName.whyHalf', nums) },
        { text: Mx(k, 'exName.right', nums), correct: true },
        { text: Mx(k, 'exName.wrongDouble', nums), why: Mx(k, 'exName.whyDouble', nums) },
      ],
      hints: [Mx(k, 'exName.hint1', nums), Mx(k, 'exName.hint2', nums)], explain: Mx(k, 'exName.explain', nums),
    };
  },
  bSq: (lab, k) => {
    const b = firstTight(lab); const area = L.currentArea(lab);
    const sq = L.squareTex(b.below, b.scale);
    const nums = { below: L.sideText(b.below, b.scale), grad: b.scale === 1 ? '1' : L.sideText(1, b.scale), area: L.areaText(area), sq: plain(sq) };
    return {
      id: 'bSq', kind: 'number', expected: sq.replace('{,}', '.'), answer: <MathText>{`$${sq}$`}</MathText>,
      prompt: Mx(k, 'bSq.prompt', nums), hints: [Mx(k, 'bSq.hint1', nums), Mx(k, 'bSq.hint2', nums)], explain: Mx(k, 'bSq.explain', nums),
    };
  },
  bRead: (lab, k) => {
    const b = firstTight(lab); const area = L.currentArea(lab);
    const nums = {
      below: L.sideText(b.below, b.scale), above: L.sideText(b.above, b.scale), area: L.areaText(area),
      sq: plain(L.squareTex(b.below, b.scale)), asq: plain(L.squareTex(b.above, b.scale)),
    };
    return {
      id: 'bRead', kind: 'choice', cols: 3,
      prompt: Mx(k, 'bRead.prompt', nums),
      options: [
        { text: Mx(k, 'bRead.wrongAbove', nums), why: Mx(k, 'bRead.whyAbove', nums) },
        { text: Mx(k, 'bRead.right', nums), correct: true },
        { text: Mx(k, 'bRead.wrongBelow', nums), why: Mx(k, 'bRead.whyBelow', nums) },
      ],
      hints: [Mx(k, 'bRead.hint1', nums), Mx(k, 'bRead.hint2', nums)], explain: Mx(k, 'bRead.explain', nums),
    };
  },
  zoom: (lab, k) => {
    const bs = L.brackets(lab, 0).filter((b) => b.exact == null && L.tight(b)); const b = bs.at(-1); const area = L.currentArea(lab);
    const nums = { grad: L.sideText(1, b.scale), below: L.sideText(b.below, b.scale), sq: plain(L.squareTex(b.below, b.scale)), area: L.areaText(area) };
    return {
      id: 'zoom', kind: 'choice',
      prompt: Mx(k, 'zoom.prompt', nums),
      options: [
        { text: Mx(k, 'zoom.wrongHit', nums), why: Mx(k, 'zoom.whyHit', nums) },
        { text: Mx(k, 'zoom.right', nums), correct: true },
        { text: Mx(k, 'zoom.wrongMore', nums), why: Mx(k, 'zoom.whyMore', nums) },
      ],
      hints: [Mx(k, 'zoom.hint1', nums), Mx(k, 'zoom.hint2', nums)], explain: Mx(k, 'zoom.explain', nums),
    };
  },
  gSq: (lab, k) => {
    const i = exactCard(lab); const f = L.foundSide(lab, i); const c = lab.cards[i];
    const nums = { area: L.areaText(c), c: L.sideText(f.v, f.scale), grad: f.scale };
    return {
      id: 'gSq', kind: 'number', expected: ratText(c), answer: <MathText>{`$${L.areaTex(c)}$`}</MathText>,
      prompt: Mx(k, 'gSq.prompt', nums), hints: [Mx(k, 'gSq.hint1', nums), Mx(k, 'gSq.hint2', nums)], explain: Mx(k, 'gSq.explain', nums),
    };
  },
  gRational: (lab, k) => {
    const i = exactCard(lab); const f = L.foundSide(lab, i);
    const nums = { c: L.sideText(f.v, f.scale) };
    return {
      id: 'gRational', kind: 'choice', cols: 3,
      prompt: Mx(k, 'gRational.prompt', nums),
      options: [
        { text: Mx(k, 'gRational.wrongIrr', nums), why: Mx(k, 'gRational.whyIrr', nums) },
        { text: Mx(k, 'gRational.wrongCalc', nums), why: Mx(k, 'gRational.whyCalc', nums) },
        { text: Mx(k, 'gRational.right', nums), correct: true },
      ],
      hints: [Mx(k, 'gRational.hint1', nums), Mx(k, 'gRational.hint2', nums)], explain: Mx(k, 'gRational.explain', nums),
    };
  },
  gResist: (lab, k) => {
    const i = resistingCard(lab); const c = lab.cards[i];
    const memo = L.brackets(lab, i).filter(L.tight);
    const nums = { area: L.areaText(c), cnt: memo.length };
    return {
      id: 'gResist', kind: 'choice',
      prompt: Mx(k, 'gResist.prompt', nums),
      options: [
        { text: Mx(k, 'gResist.wrongFiner', nums), why: Mx(k, 'gResist.whyFiner', nums) },
        { text: Mx(k, 'gResist.right', nums), correct: true },
        { text: Mx(k, 'gResist.wrongNone', nums), why: Mx(k, 'gResist.whyNone', nums) },
      ],
      hints: [Mx(k, 'gResist.hint1', nums), Mx(k, 'gResist.hint2', nums)], explain: Mx(k, 'gResist.explain', nums),
    };
  },
  rule: (lab, k, extra) => {
    const d = discoveryParts(lab, k, extra);
    const f = L.foundSide(lab, 0); const area = L.currentArea(lab);
    const grad = lab.mode === 'graduation';
    const nums = { c: f ? L.sideText(f.v, f.scale) : '', area: L.areaText(area) };
    const key = grad ? 'grad' : f ? 'exact' : 'never';
    return {
      id: 'rule', kind: 'choice',
      prompt: <MathText>{d.prompt}</MathText>,
      options: d.options.map((o) => ({ ...o, text: typeof o.text === 'string' ? <MathText>{o.text}</MathText> : o.text })),
      hints: [Mx(k, `rule.hint1${key}`, nums), Mx(k, `rule.hint2${key}`, nums)],
      explain: d.formal,
    };
  },
};

/* ══════════════ Lecteur de mission : lire d'un toucher → BÂTIR → la règle (rollout 2026-11-09, conseil) ══════════════ */

/** La suite à poser : 'grad' (mode graduation), 'exact' (le côté tombé juste), 'never' (jamais juste). */
export const chainKeyOf = (lab) => (lab.mode === 'graduation' ? 'grad' : (L.foundSide(lab, 0) ? 'exact' : 'never'));
export const CHAINS_PLAYER = Object.freeze({
  exact: [['exSideFill', 'exBuild'], ['rule']],
  never: [['nBetweenFill', 'nSquaresBuild'], ['nDecimalsFill', 'rule']],
  grad: [['gGradFill', 'gBuild'], ['gResist', 'rule']],
});
export const chainOfPlayer = (stepIdx, lab) => CHAINS_PLAYER[truthKeyOf(lab)][stepIdx];
/** La suite que la VÉRITÉ appelle (lecteur) : 'grad', 'exact' (le côté tombera sur une graduation offerte), 'never'. */
export const truthKeyOf = (lab) => {
  if (lab.mode === 'graduation') return 'grad';
  const area = L.currentArea(lab);
  return L.REFINE_SCALES.some((g) => g <= lab.maxScale && L.landsAt(area, g)) ? 'exact' : 'never';
};

const digitsOfDen = (den) => { const d = Math.round(Math.log10(den)); return 10 ** d === den ? d : null; };
const sideChips = (v, scale) => chipsAround(v, { min: 1 }).map((x) => L.sideText(x, scale));

/** La moitié d'une aire, écrite comme l'aire (0,04 → 0,02 ; 16 → 8 ; 16/9 → 8/9) : la tuile de trop (« le côté, c'est la moitié »). */
export function halfText({ num, den }) {
  if (digitsOfDen(den) != null) return L.areaText(num % 2 === 0 ? { num: num / 2, den } : { num: num * 5, den: den * 10 });
  return L.areaText(reduce({ num, den: den * 2 }));
}

/** L'égalité « aire = côté × côté » d'une carte tombée juste : ses tuiles et la tuile de trop (la moitié, ou le double si la moitié EST le côté). */
export function exactBuild(lab, i) {
  const f = L.foundSide(lab, i); const area = lab.cards[i];
  const side = L.sideText(f.v, f.scale); const areaT = L.areaText(area);
  const half = halfText(area);
  const decoy = half === side ? L.areaText(reduce({ num: area.num * 2, den: area.den })) : half;
  return {
    side, area: areaT, decoy, scale: f.scale,
    expected: [areaT, side, side], tiles: [side, decoy, areaT, side],
    eq: `${L.areaTex(area)} = ${L.sideTex(f.v, f.scale)} \\times ${L.sideTex(f.v, f.scale)}`,
  };
}

/** Le produit des deux voisins d'un encadrement, écrit exactement (la tuile de trop de « 4 < 5 < 9 »). */
function productText(a, b, scale) {
  const d = digitsOfDen(scale);
  if (d != null) return exactDecimal(a * b, 2 * d);
  const r = reduce({ num: a * b, den: scale * scale });
  return r.den === 1 ? String(r.num) : `${r.num}/${r.den}`;
}

/** L'encadrement des CARRÉS « b² < a < (b+1)² » du premier encadrement serré : ses tuiles et la tuile de trop (b × (b+1), sinon b + (b+1)). */
export function squaresBuild(lab) {
  const b = firstTight(lab); const area = L.currentArea(lab);
  const sqb = plain(L.squareTex(b.below, b.scale)); const sqa = plain(L.squareTex(b.above, b.scale)); const areaT = L.areaText(area);
  let decoy = productText(b.below, b.above, b.scale);
  if ([sqb, sqa, areaT].includes(decoy)) decoy = L.sideText(b.below + b.above, b.scale);
  return {
    below: L.sideText(b.below, b.scale), above: L.sideText(b.above, b.scale), sqb, sqa, area: areaT, decoy,
    expected: [sqb, areaT, sqa], tiles: [sqa, decoy, sqb, areaT],
    tex: `${L.squareTex(b.below, b.scale)} < ${L.areaTex(area)} < ${L.squareTex(b.above, b.scale)}`,
  };
}

/** Le côté le plus FIN encadré (refine) dont le dernier chiffre n'est pas 0 : son écriture, ses k décimales, son carré exact (2k décimales). */
export function finestSide(lab) {
  const bs = L.brackets(lab, 0).filter((b) => b.exact == null && L.tight(b));
  const b = bs.at(-1);
  const v = b.below % 10 === 0 ? b.above : b.below;
  const c = L.sideText(v, b.scale);
  const sq = plain(L.squareTex(v, b.scale));
  return { c, k: L.decimalsOf(c), sq, n: L.decimalsOf(sq), last: sq.at(-1), cTex: L.sideTex(v, b.scale), sqTex: L.squareTex(v, b.scale) };
}

Object.assign(QUESTIONS, {
  exSideFill: (lab, k) => {
    const x = exactBuild(lab, 0);
    const o = { area: x.area, c: x.side };
    return {
      id: 'exSideFill', kind: 'fill', prompt: Mx(k, 'exSideFill.prompt', o),
      fields: [{ label: k('cp.exSideFill.field'), expected: x.side, options: sideChips(L.foundSide(lab, 0).v, x.scale) }],
      hints: [Mx(k, 'exSideFill.hint1', o), Mx(k, 'exSideFill.hint2', o)], explain: Mx(k, 'exSideFill.explain', o),
    };
  },
  exBuild: (lab, k) => buildOf(exactBuild(lab, 0), k, 'exBuild'),
  gGradFill: (lab, k) => {
    const i = exactCard(lab); const x = exactBuild(lab, i);
    const o = { area: x.area, c: x.side, g: `1/${x.scale}` };
    return {
      id: 'gGradFill', kind: 'fill', prompt: Mx(k, 'gGradFill.prompt', o),
      fields: [{ label: k('cp.gGradFill.field'), expected: `1/${x.scale}`, options: chipsAround(x.scale, { min: 1 }).map((g) => `1/${g}`) }],
      hints: [Mx(k, 'gGradFill.hint1', o), Mx(k, 'gGradFill.hint2', o)], explain: Mx(k, 'gGradFill.explain', o),
    };
  },
  gBuild: (lab, k) => ({ ...buildOf(exactBuild(lab, exactCard(lab)), k, 'exBuild'), id: 'gBuild' }),
  nBetweenFill: (lab, k) => {
    const b = firstTight(lab); const area = L.currentArea(lab);
    const o = { area: L.areaText(area), below: L.sideText(b.below, b.scale), above: L.sideText(b.above, b.scale) };
    return {
      id: 'nBetweenFill', kind: 'fill', prompt: Mx(k, 'nBetweenFill.prompt', o),
      fields: [
        { label: k('cp.nBetweenFill.fieldBelow'), expected: o.below, options: sideChips(b.below, b.scale) },
        { label: k('cp.nBetweenFill.fieldAbove'), expected: o.above, options: sideChips(b.above, b.scale) },
      ],
      hints: [Mx(k, 'nBetweenFill.hint1', o), Mx(k, 'nBetweenFill.hint2', o)], explain: Mx(k, 'nBetweenFill.explain', o),
    };
  },
  nSquaresBuild: (lab, k) => {
    const x = squaresBuild(lab);
    const o = { area: x.area, below: x.below, above: x.above, tex: x.tex };
    return {
      id: 'nSquaresBuild', kind: 'build', prompt: Mx(k, 'nSquaresBuild.prompt', o),
      slots: [k('cp.nSquaresBuild.slotBelow', o), k('cp.nSquaresBuild.slotArea'), k('cp.nSquaresBuild.slotAbove', o)], ops: ['<', '<'],
      tiles: x.tiles, expected: x.expected,
      hints: [Mx(k, 'nSquaresBuild.hint1', o), Mx(k, 'nSquaresBuild.hint2', o)], explain: Mx(k, 'nSquaresBuild.explain', o),
    };
  },
  nDecimalsFill: (lab, k) => {
    const x = finestSide(lab); const area = L.currentArea(lab);
    const o = { area: L.areaText(area), c: x.c, k: x.k, n: x.n, last: x.last, cTex: x.cTex, sqTex: x.sqTex };
    return {
      id: 'nDecimalsFill', kind: 'fill', prompt: Mx(k, 'nDecimalsFill.prompt', o),
      fields: [{ label: k('cp.nDecimalsFill.field'), expected: x.n, options: chipsAround(x.n, { min: 1 }) }],
      hints: [Mx(k, 'nDecimalsFill.hint1', o), Mx(k, 'nDecimalsFill.hint2', o)],
      explain: Mx(k, area.den === 1 ? 'nDecimalsFill.explain' : 'nDecimalsFill.explainFrac', o),
    };
  },
});

/** Une question « build » d'égalité aire = côté × côté (exact ou carte tombée juste). */
function buildOf(x, k, key) {
  const o = { area: x.area, c: x.side, half: x.decoy, eq: x.eq };
  return {
    id: key, kind: 'build', prompt: Mx(k, `${key}.prompt`, o),
    slots: [k(`cp.${key}.slotArea`), k(`cp.${key}.slotSide`), k(`cp.${key}.slotSide`)], ops: ['=', '×'],
    tiles: x.tiles, expected: x.expected,
    hints: [Mx(k, `${key}.hint1`, o), Mx(k, `${key}.hint2`, o)], explain: Mx(k, `${key}.explain`, o),
  };
}

function foundTex(lab) { const f = L.foundSide(lab, 0); return f ? L.sideTex(f.v, f.scale) : ''; }
function foundText(lab) { const f = L.foundSide(lab, 0); return f ? L.sideText(f.v, f.scale) : ''; }

/**
 * Le carré construit sur BC (نشاط 1 : AB = 1, AC = 2) : dans un carré 3 × 3,
 * le carré incliné vaut 9 − 4 triangles d'aire 1 = 5. L'aire 5 EXISTE — son
 * côté est BC — même si aucune graduation ne tombe dessus.
 */
function BcSquare({ k }) {
  const u = 40;
  const P = (x, y) => `${x * u + 10},${(3 - y) * u + 10}`;
  const tri = [[[0, 0], [1, 0], [0, 2]], [[1, 0], [3, 0], [3, 1]], [[3, 1], [3, 3], [2, 3]], [[2, 3], [0, 3], [0, 2]]];
  return (
    <figure className="rounded-xl border-2 border-slate-200 bg-white p-2" data-bc-square>
      <div className="flex justify-center" dir="ltr">
        <svg width={3 * u + 20} height={3 * u + 20} role="img" aria-label={k('bcAria')}>
          {Array.from({ length: 4 }, (_, i) => (
            <g key={i}>
              <line x1={10 + i * u} x2={10 + i * u} y1={10} y2={10 + 3 * u} stroke="#E2E8F0" />
              <line x1={10} x2={10 + 3 * u} y1={10 + i * u} y2={10 + i * u} stroke="#E2E8F0" />
            </g>
          ))}
          {tri.map((t, i) => <polygon key={i} points={t.map(([x, y]) => P(x, y)).join(' ')} fill="#FDE68A" stroke="#D97706" />)}
          <polygon points={[[1, 0], [3, 1], [2, 3], [0, 2]].map(([x, y]) => P(x, y)).join(' ')} fill="#A7F3D0" fillOpacity={0.6} stroke="#047857" strokeWidth={2.5} />
          <text x={10 + 2 * u} y={10 + 3 * u - 22} fontSize={12} fill="#047857" fontWeight="bold">BC</text>
        </svg>
      </div>
      <figcaption className="text-center text-xs text-slate-700">{k('bcCaption')}</figcaption>
    </figure>
  );
}
