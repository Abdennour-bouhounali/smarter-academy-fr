import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Minus, Plus } from 'lucide-react';
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
import { useInMissionPlayer } from '../../mission/missionPlayerContext';
import { playSfx } from '../../utils/playEffect';
import MathText from '../../components/MathText';
import FitLine from '../../components/FitLine';
import * as L from '../logic/squareTiling';

/** Lecteur : au plus PRED_MAX prédictions par manche (comme les autres labos), jamais pendant une suite de questions. */
const PRED_MAX = 2;

/**
 * square-tiling — LE CARRÉ DALLÉ (unité 2, leçons 4 et 5).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. L'élève ÉTIRE k, le nombre de dalles le long d'un côté (réglette
 *    `useStretchInteraction` ; clavier, − / +, toucher la règle).
 * B. Idée : un carré d'aire n = k² × b se pave en k × k dalles d'aire b, et
 *    son côté est k fois le côté d'une dalle : √(k² × b) = k√b = √(k²) × √b.
 * C. Pendant le geste, le grand carré se redécoupe en k × k dalles.
 * D. Au relâchement : l'égalité complète — ou le refus, avec n ÷ k² lu
 *    exactement quand la dalle n'aurait pas une aire entière.
 * E. À découvrir : product — la racine d'un produit est le produit des
 *    racines ; simplest — le plus grand k donne la plus petite dalle, qu'on
 *    ne peut plus paver (b أصغر ما يمكن).
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        √(a² × b) = a√b ; a² le plus grand carré qui divise n
 *   OBJECT         un carré d'aire n, découpé en dalles carrées
 *   VARIABLE       k, le nombre de dalles par côté
 *   INVARIANT      l'aire n du grand carré, donc son côté √n
 *   TRANSFORMATION le découpage k × k, l'aire b et le côté √b d'une dalle
 *   CONSTRAINT     une dalle a une aire entière (k² divise n)
 *   RESISTANCE     k = 5 pour 72 : « 72 ÷ 25 = 2,88 » — pavage en pointillés, refusé
 *   EVIDENCE       le côté lu comme k côtés de dalle
 *   CONTRAST       un pavage juste / un pavage refusé ; (simplest) le plus
 *                  grand k / un k plus petit dont la dalle se pave encore
 *   PREDICTION     « quel k donnera la plus petite dalle ? »
 *   DISCOVERY      √(k² × b) = k × √b ; b minimal ⇔ k² le plus grand carré
 *   FORMALIZATION  خاصية 1 (معارف 4) ; طريقة p. 25
 *   TRANSFER       تمارين 18, 19, 26, 27 ; تبسيط A = √8 − 3√18 + 2√50 − 7√2
 */
/*
 * QUESTIONS PENDANT LE LABO (2026-10-28, `primitives/LabCheckpoint`) : `checkpoints` (défaut true). Deux étapes : 1 « tile » (un pavage juste k > 1) — l'aire de
 * la dalle, puis le côté lu comme k côtés de dalle ; 2 « rule » (la découverte atteinte) — product : pourquoi le pavage est refusé, puis la règle ; simplest :
 * l'aire de la dalle du plus grand k, la comparaison avec une autre dalle, puis la règle. Elles remplacent la découverte (`ManipulationDiscovery`) et retiennent la fin.
 */
/*
 * ONBOARDING (prop `coach`, défaut true — `LabCoach`, §8quater, ajouté le 2026-11-10) : `logic/squareTiling.js › coachOf` montre la poignée de k,
 * puis la règle pour un autre essai — JAMAIS un k précis (le guide ne montre pas la réponse).
 *
 * LECTEUR DE MISSION (rollout 2026-11-10, traitement v2 ; conseil du 2026-11-10) : joué en MANCHES (LabRounds), dans les deux modes.
 *   - `onVerdict { groups: k, exact: pavage juste, free? }` à chaque pavage NOUVEAU (un k déjà essayé n'est pas un nouvel essai) ; le PREMIER refus
 *     de la manche est `free` (il fait partie de la découverte : il compte pour les buts, pas pour l'étoile « peu d'essais »). La découverte
 *     atteinte (L.discoveryReady, selon le mode) est annoncée une fois par onTrial { tk: 'discovered' } — but `{ discovered: true }`.
 *   - `chains` : 'full' (manche 1 : l'aire de la dalle d'un toucher, le côté parmi trois, BÂTIR « √n = k × √b », la règle « √(k²×b) = k×√b ») ;
 *     'bridge' (une question à la découverte : « √(k²×b) = √(k²) × … ») ; 'quotient' (« √b = √(n ÷ …) ») ; 'area' (l'aire d'un toucher) ;
 *     'fullS' (simplest, leçon 5 : l'aire de la dalle du plus grand k, BÂTIR « √n = k × √m », la règle) ; 'none'.
 *   - `predict` + `predictKs` : 'whole' (« هل يعطي k = … بلاطًا مساحته عدد طبيعي؟ », oui / non, la vérité CALCULÉE) posé AVANT le premier geste,
 *     jugé quand l'élève essaie ce k ; 'smallest' (simplest : « أيّ k يعطي أصغر بلاطة؟ » parmi les k donnés — dont un k refusé au-delà du plus
 *     grand), jugé quand le plus grand k est essayé. ≤ PRED_MAX par manche.
 *   - Le décompte « ✓ … · ✗ … » et le JOURNAL « 📋 جدول تجاربك » (k · aire de la dalle) ; un refus s'affiche en grand « ✗ مساحة البلاطة ليست
 *     عددًا طبيعيًا » avec le quotient EXACT non réduit en petit (98 ÷ 36, jamais un nombre qui n'est pas dans le geste). Jamais un NOMBRE DE
 *     DALLES (k², « 16 بلاطة ») : seulement k, l'aire b et le côté.
 *   - `choices` (manche libre) : d'autres aires ; `handDone` ouvre « جرّب كل الإمكانيات » ; commandes figées pendant une prédiction ou une
 *     question ; toujours guidé ; pas de fête quand l'étape est cachée ; `{ tk: 'reset' }` à chaque « إعادة ». Hors lecteur : inchangé.
 */
export default function SquareTiling({
  n: n0 = 28, mode = 'product', title, lead, mission, level, levels: withLevels = true, checkpoints: cpOn = true, initialMode = 'student', allowModeSwitch = false, onFinished, onTrial,
  coach: coachOn = true,
  // ── LECTEUR DE MISSION (rollout 2026-11-10, traitement v2) ──
  onVerdict, handDone = false, chains: chainsMode = 'full', predict: predictOn = false, predictKs = [], predictKind = 'whole', choices,
  // (simplest, leçon 5 ; conseil du 2026-11-10) une 2e prédiction « هل يعطي k = … ؟ » après « أيّ k يعطي أصغر بلاطة تصلح؟ », et les nombres
  // qu'aucun leurre de « مساحة البلاطة » ne doit montrer (ceux de la مسألة)
  predictAlso = [], avoid = [],
}) {
  const { t } = useTranslation('lesson');
  const gameScreen = useInMissionPlayer();
  const uid = useId();
  const journalId = `${uid}-journal`;
  const k = useCallback((key, o) => t(`manipulation.squareTiling.${key}`, o), [t]);
  const state = useManipulation({ type: 'square-tiling', initialNumbers: { n: n0 }, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const { n } = state.numbers;

  const [lab, setLab] = useState(() => L.init({ n: n0, mode }));
  const [live, setLive] = useState(null);
  // Miroir synchrone de `lab` : « جرّب كل الإمكانيات » enchaîne des pas plus vite qu'un rendu.
  const labRef = useRef(lab);
  labRef.current = lab;
  const sceneKey = `${n}:${mode}:${state.epoch}`;
  const [scene, setScene] = useState({ key: sceneKey, inits: 0 });
  const [done, setDone] = useState([false, false]);
  const snap = useRef(null);
  // lecteur : les prédictions faites { [clé]: ok }, les clés déjà posées, la suite de questions finie, l'intro de mission ouverte
  const [preds, setPreds] = useState({});
  const asked = useRef(new Set());
  const [playerDone, setPlayerDone] = useState(false);
  const [missionBig, setMissionBig] = useState(false);
  // lecteur : le nombre de refus déjà remontés (le premier est `free`), la découverte déjà annoncée
  const refusedSeen = useRef(0);
  const discoveredSent = useRef(false);
  // lecteur : chaque prédiction JUGÉE est montrée et entendue UNE fois (revue ECC 2026-11-10) — la question de la manche attend ce temps
  const heardPred = useRef(new Set());
  const [shownPreds, setShownPreds] = useState([]);
  const [predHold, setPredHold] = useState(false);
  const holdTimer = useRef(null);
  // atelier libre : l'aire choisie, dite à un lecteur d'écran
  const [areaSaid, setAreaSaid] = useState(null);
  if (scene.key !== sceneKey) {
    // « إعادة », un autre niveau ou un autre n : TOUT recommence — les essais, les étapes et les questions du labo
    setScene({ key: sceneKey, inits: scene.inits + 1 });
    setLab(L.init({ n, mode })); setLive(null); setDone([false, false]); snap.current = null;
    setPreds({}); asked.current = new Set(); setPlayerDone(false); refusedSeen.current = 0; discoveredSent.current = false;
    heardPred.current = new Set(); setShownPreds([]); setPredHold(false); setAreaSaid(null);
  }
  // la manche (LabRounds) repart de zéro avec la scène : ses pavages et prédictions d'avant ne comptent plus
  useEffect(() => { if (scene.inits > 0) state.report(onTrial, { tk: 'reset' }); }, [scene.inits]); // eslint-disable-line react-hooks/exhaustive-deps
  const range = L.range(lab);

  const cpSettings = useLabCheckpointSettings('square-tiling');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const cpActive = cpOn && cpSettings.enabled;
  // ── la page (inchangée) : deux étapes, « tile » puis « rule » ──
  const stepIdx = done[0] ? 1 : 0;
  const stepId = stepIdx === 0 ? 'tile' : 'rule';
  const chainKey = stepIdx === 0 ? 'tile' : mode === 'simplest' ? 'ruleS' : 'ruleP';
  const reachedPage = stepIdx === 0 ? !!firstValid(lab) : L.discoveryReady(lab);
  // ── le lecteur : UNE suite, posée quand ce qu'elle interroge est là ──
  // les suites lisent le premier pavage juste k > 1 (firstValid) : jamais posées sans lui (revue ECC — un carré à un seul pavage juste)
  // une prédiction est JUGÉE quand l'élève essaie son k (« smallest » : le plus grand k) — et toutes le sont à la découverte, même un k jamais
  // essayé : son résultat est alors montré avant la question, jamais perdu derrière elle
  const judgedPreds = !gameScreen ? [] : L.judgedPredictions(lab, Object.keys(preds));
  const pendingPreds = judgedPreds.filter((key) => !heardPred.current.has(key));
  const holdChain = pendingPreds.length > 0 || predHold;
  const reachedPlayer = !holdChain && (SIMPLEST_CHAINS.includes(chainsMode) ? L.discoveryReady(lab) && !!firstValid(lab) : chainsMode === 'bridge' ? L.discoveryReady(lab) && !!firstValid(lab) : !!firstValid(lab));
  const playerChain = cpActive && !playerDone && reachedPlayer ? chainOfPlayer(chainsMode) : null;
  const pageChain = cpActive && !done[1] && reachedPage ? chainOf(chainKey, lab) : null;
  const chain = gameScreen ? (playerChain?.length ? playerChain : null) : pageChain;
  const chainId = gameScreen ? (chain?.some((q) => q === 'ruleP1' || q === 'ruleS1') ? 'rule' : 'tile') : stepId;
  const showStepper = cpActive && !gameScreen;
  const party = useStepCelebration();
  const cp = useLabCheckpoint({
    id: chain ? chainId : null,
    questions: chain ? chain.map((q) => QUESTIONS[q](lab, k, { avoid })) : null,
    reached: gameScreen ? reachedPlayer : reachedPage,
    resetKey: scene.inits,
    onRetry: () => {
      setLive(null);
      const fresh = gameScreen || stepIdx === 0 ? L.init({ n, mode }) : (snap.current ?? L.init({ n, mode }));
      labRef.current = fresh; setLab(fresh);
      // lecteur : la manche oublie aussi ce que le labo vient de défaire (ses pavages, la découverte) — le 1er refus redevient gratuit (revue ECC)
      if (gameScreen) { refusedSeen.current = 0; discoveredSent.current = false; state.report(onTrial, { tk: 'retry' }); }
    },
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => {
      if (gameScreen) {
        setPlayerDone(true);
        if (chain?.some((q) => q === 'ruleP1' || q === 'ruleS1')) { state.discover(); state.formalize(); }
        return;
      }
      if (id === 'tile') { snap.current = labRef.current; setDone([true, false]); party.celebrate({ n: 1, total: 2 }); return; }
      setDone([true, true]); party.celebrate({ n: 2, total: 2 });
      state.discover(); state.formalize();
    },
  });

  // ── lecteur : la PRÉDICTION, avant le premier geste ──
  const also = predictAlso.filter((v) => v !== L.kmax(lab));
  const predList = (predictKind === 'smallest' ? ['smallest', ...also.map((v) => `k:${v}`)] : predictKs.map((v) => `k:${v}`)).slice(0, PRED_MAX);
  const nextPred = predList.find((key) => !asked.current.has(key));
  const predictOpen = gameScreen && predictOn && cpActive && !cp.open && !missionBig && lab.tried.length === 0 && nextPred != null;
  const locked = gameScreen && (cp.open || predictOpen);
  const lockedRef = useRef(false);
  lockedRef.current = locked;
  const truthOf = (key) => (key === 'smallest' ? String(L.kmax(lab)) : (L.tilesWhole(n, Number(key.slice(2))) ? 'yes' : 'no'));
  const sayPredict = (says) => {
    const key = nextPred;
    const ok = says === truthOf(key);
    asked.current.add(key);
    playSfx('pop');
    setPreds((m) => ({ ...m, [key]: ok }));
    state.report(onTrial, { tk: 'predict', ok });
    if (!predList.some((x) => x !== key && !asked.current.has(x))) {
      setTimeout(() => boxRef.current?.querySelector('[data-tiling-handle]')?.focus(), 60);
    }
  };

  const ready = L.discoveryReady(lab) && !cpActive;
  useEffect(() => { if (ready) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (state.isFormal) state.report(onFinished, n); }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps

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
  // Dans le lecteur de mission le labo est monté dans une copie cachée puis déplacé : on re-mesure aussi à chaque rendu (même valeur = aucun rendu).
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (el) { const w = Math.max(240, Math.floor(el.clientWidth)); setWidth((cur) => (cur === w ? cur : w)); }
  });
  const EDGE = 22;
  const span = Math.max(1, range.max - range.min);
  const mu = (width - 2 * EDGE) / span;
  const xOf = (v) => EDGE + (v - range.min) * mu;
  const toValue = useCallback((clientX, _y, rect) => range.min + (clientX - rect.left - EDGE) / mu, [range.min, mu]);
  const sfx = useRef(0);

  /** Un PAVAGE essayé (relâchement, ou un pas de « جرّب كل الإمكانيات ») : jugé, remonté à la leçon, et — nouveau k — à la manche. */
  const tryK = (v) => {
    const prev = labRef.current;
    if (L.canTile(prev, v) !== true) return;
    const already = prev.tried.some((x) => x.k === v);
    const tl = L.tiling(n, v);
    playSfx(tl.valid ? 'bell' : 'over');
    const next = L.tile(prev, v);
    labRef.current = next;
    setLab(next);
    // L'essai validé part vers la leçon HORS du setState (un updater reste pur).
    state.report(onTrial, tl);
    // k = 1 : la dalle EST le carré — ni un essai de la manche ni une ligne du journal (revue ECC 2026-11-10)
    if (!already && v > 1) {
      const free = !tl.valid && refusedSeen.current === 0;
      if (!tl.valid) refusedSeen.current += 1;
      state.report(onVerdict, { groups: v, exact: tl.valid, ...(free ? { free: true } : {}) });
    }
    if (L.discoveryReady(next) && !discoveredSent.current) { discoveredSent.current = true; state.report(onTrial, { tk: 'discovered' }); }
  };
  const stretch = useStretchInteraction({
    value: live ?? lab.k ?? L.defaultK(lab), range, toValue,
    onChange: (v) => { if (lockedRef.current) return; setLive(v); const now = performance.now(); if (now - sfx.current > 35) { playSfx('tooth'); sfx.current = now; } },
    onCommit: (v) => { if (lockedRef.current) { setLive(null); return; } setLive(v); tryK(v); },
    direction: 'ltr',
  });

  // Un k PAR DÉFAUT (L.defaultK : jamais une réponse) : jamais vide à l'ouverture. Ce n'est pas un essai, seul `lab.tried` en garde la trace.
  const kk = live ?? lab.k ?? L.defaultK(lab);
  const t0 = kk == null ? null : L.tiling(n, kk);
  const settled = lab.k != null && !stretch.dragging && kk === lab.k;
  const current = settled ? lab.tried.find((x) => x.k === lab.k) : null;
  const box = Math.min(gameScreen ? 240 : 280, Math.max(200, width * 0.6));
  const cell = kk ? box / kk : box;
  const valid = t0?.valid;
  // Au repos, sans essai encore, la ligne de résultat montre la conséquence du k par défaut (sans prétendre que l'élève l'a fait).
  // Lecteur : rien avant le premier essai (le k par défaut n'est pas un essai à juger).
  const shown = current ?? (!gameScreen && lab.k == null && !stretch.dragging && live == null ? t0 : null);
  const eq = shown?.valid ? L.equationTex(n, shown) : null;
  const untried = () => Array.from({ length: L.range(labRef.current).max }, (_, i) => i + 1).filter((v) => !labRef.current.tried.some((x) => x.k === v));
  const runTrial = (v) => { setLive(v); tryK(v); };

  // la prédiction est JUGÉE par le terrain (voir `judgedPreds`) : ses résultats en attente sont montrés et entendus une fois, puis la question
  // de la manche attend PRED_HOLD_MS (la même idée que le délai de la carte de victoire)
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
  const predResult = gameScreen && !quiet && shownPreds.length > 0;

  const coachStep = coachOn && !locked && !cp.open ? L.coachOf(lab) : null;
  const coach = useLabCoach({
    lab: 'square-tiling', step: coachStep, text: coachStep ? k(`coach.${coachStep.id}`) : '',
    labels: { hide: t('manipulation.common.coach.hide'), show: t('manipulation.common.coach.show'), ok: t('manipulation.common.coach.ok'), stop: t('manipulation.common.coach.stop') },
  });

  // lecteur : la prédiction ou la question PREND la colonne du labo
  const trayNode = !gameScreen ? null : predictOpen ? (
    <PredictTray attr="st" key={nextPred} step={predList.indexOf(nextPred) + 1} of={predList.length}
      title={t('manipulation.common.cp.predict.title')}
      prompt={nextPred === 'smallest'
        ? <MathText>{k('predict.promptSmallest')}</MathText>
        : <MathText>{k('predict.promptWhole', { k: nextPred.slice(2) })}</MathText>}
      options={nextPred === 'smallest'
        ? predictKs.map((v) => ({ says: String(v), text: <bdi dir="ltr">{k('predict.kOption', { k: v })}</bdi>, aria: k('predict.kAria', { k: v }) }))
        : [{ says: 'yes', text: glyph(k('predict.yes')) }, { says: 'no', text: glyph(k('predict.no')) }]}
      onSay={sayPredict} />
  ) : cp.open ? cp.node : null;

  const tl = L.tally(lab);
  const journal = lab.tried.filter((x) => x.k > 1);
  const ring = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2';
  const verdictKey = lab.tried.length;
  const playerRepresentation = shown && (
    <div key={`v${verdictKey}`} data-tiling-verdict={shown.valid ? 'valid' : 'refused'}>
      <span className="sr-only">{k(shown.valid ? 'cueRight' : 'cueWrong')} </span>
      {shown.valid
        ? <EquationDisplay tex={eq} tone="ok" note={<MathText>{k('validP', { k: shown.k, b: shown.b })}</MathText>} />
        : (
          <div className="rounded-xl border-2 border-rose-200 bg-rose-50 px-3 py-2 text-center" data-tiling-refused>
            <p className="text-xl font-black text-rose-800"><span aria-hidden="true">✗ </span>{k('refusedBig')}</p>
            <FitLine className="mt-1 text-sm text-slate-700" dir="ltr"><MathText>{`$${L.refusedPlainTex(n, shown.k)}$`}</MathText></FitLine>
          </div>
        )}
    </div>
  );

  return (
    <ManipulationShell
      type="square-tiling"
      title={title ?? k('title', { n })}
      mission={mission ?? k(mode === 'simplest' ? 'missionSimplest' : 'missionProduct', { n })}
      lead={lead}
      state={state}
      coach={coachOn ? coach : null}
      numberFields={[{ key: 'n', label: 'n' }]}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={gameScreen ? false : undefined}
      headerAction={cpOn ? cpSettings.control : null}
      // lecteur : l'écran de jeu est toujours GUIDÉ (les manches et les questions guident)
      guided={cpActive || gameScreen}
      hideRepresentation={(gameScreen && locked) || undefined}
      onIntroChange={setMissionBig}
      sidePanel={trayNode ? <div data-st-tray>{trayNode}</div> : null}
      hints={(mode === 'simplest' ? [k('sHint1'), k('sHint2'), k('sHint3')] : [k('pHint1'), k('pHint2'), k('pHint3')]).map((h) => <MathText key={h}>{h}</MathText>)}
      controller={{
        autoStep: () => false,
        canAutoStep: () => false,
        // lecteur : « جرّب كل الإمكانيات » est le BOUTON du geste appris — il s'ouvre après la manche à la main (handDone)
        autoComplete: gameScreen && !handDone ? undefined : {
          label: t('manipulation.autoComplete.tryAll'),
          ready: !locked,
          remaining: untried().length,
          intervalMs: 480,
          maxTicks: 80,
          step: () => { const next = untried()[0]; if (next !== undefined) runTrial(next); },
          finish: () => { untried().forEach(runTrial); },
        },
      }}
      representation={gameScreen ? playerRepresentation : shown && (shown.valid
        ? <EquationDisplay tex={eq} tone="ok" note={<MathText>{k('valid', { k: shown.k, b: shown.b })}</MathText>} />
        : <EquationDisplay tex={L.refusedTex(n, shown.k)} tone="ko" note={<MathText>{k('refused', { k: shown.k })}</MathText>} />)}
      discovery={(
        <ManipulationDiscovery
          state={state}
          prompt={mode === 'simplest' ? k('sPrompt', { n }) : k('pPrompt')}
          options={mode === 'simplest'
            ? [
              { text: <MathText>{k('sOpt2')}</MathText>, why: <MathText>{k('sWhy2', { n, big: L.kmax(lab) })}</MathText> },
              { text: <MathText>{k('sOpt1')}</MathText>, correct: true },
              { text: <MathText>{k('sOpt3')}</MathText>, why: <MathText>{k('sWhy3', { n, big: L.kmax(lab) })}</MathText> },
            ]
            : [
              { text: <MathText>{k('pOpt2')}</MathText>, why: <MathText>{k('pWhy2')}</MathText> },
              { text: <MathText>{k('pOpt3')}</MathText>, why: <MathText>{k('pWhy3')}</MathText> },
              { text: <MathText>{k('pOpt1')}</MathText>, correct: true },
            ]}
          formal={mode === 'simplest' ? (
            <div className="space-y-2" data-tiling-formal>
              <EquationDisplay tex={L.equationTex(n, L.tiling(n, L.kmax(lab)))} tone="result" note={<MathText>{k('sFormal', { n, simplest: L.simplestText(n) })}</MathText>} />
              <p className="text-sm text-slate-700"><MathText>{k('sRule')}</MathText></p>
            </div>
          ) : (
            <div className="space-y-2" data-tiling-formal>
              <EquationDisplay tex="\sqrt{k^2 \times b} = \sqrt{k^2} \times \sqrt{b} = k\sqrt{b}" tone="result" note={<MathText>{k('pFormal')}</MathText>} />
              <p className="text-sm text-slate-700"><MathText>{k('pRule')}</MathText></p>
            </div>
          )}
        />
      )}
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <div className="relative" data-st-glance>
        {party.node}
        {!(gameScreen && cp.open) && cp.node}
      <ManipulationStage className="bg-gradient-to-b from-emerald-50/60 to-white" data-dragging={stretch.dragging ? 'true' : undefined}>
        <div ref={boxRef} className="space-y-3" data-square-tiling data-mode={mode}>
          {showStepper && <LabStepper count={2} current={stepIdx} done={done.map((d, i) => d && (i !== stepIdx || !cp.blocking))} stepAttr="data-st-step" />}
          {gameScreen && (
            <div role="status" aria-live="polite" data-st-predict-live>
              {predResult && shownPreds.map((pr) => (
                <p key={pr.key} data-st-predict-result={pr.ok ? 'ok' : 'wrong'} data-st-predict-key={pr.key}
                  className={`rounded-2xl px-4 py-2 text-center text-lg font-black ${pr.ok ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
                  <span className="sr-only">{pr.key === 'smallest' ? k('predict.aboutSmallest') : k('predict.aboutK', { k: pr.key.slice(2) })} </span>
                  {glyph(pr.ok ? t('manipulation.common.cp.predict.right') : k(pr.key === 'smallest' ? 'predict.wrongSmallest' : 'predict.wrong'))}
                </p>
              ))}
              {areaSaid != null && <span key={`a${areaSaid}`} className="sr-only">{k('areaNow', { n: areaSaid })}</span>}
            </div>
          )}
          {gameScreen && choices?.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-labelledby={`${uid}-choices`} data-st-choices>
              <span id={`${uid}-choices`} className="text-sm font-bold text-slate-600">{k('choicesLabel')}</span>
              {choices.map((c) => (
                <button key={c} type="button" data-st-choice={c} disabled={locked} aria-pressed={c === n}
                  onClick={() => { if (!lockedRef.current) { state.setNumbers({ ...state.numbers, n: c }); setAreaSaid(c); } }}
                  className={`min-h-[44px] min-w-[3rem] rounded-xl border-2 px-3 text-base font-black ${ring} ${c === n ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'border-slate-300 bg-white text-slate-700'}`}>
                  <bdi dir="ltr">{c}</bdi>
                </button>
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-bold text-slate-700">{k('perSide')}</p>
            {gameScreen && (
              <p className="rounded-full bg-slate-100 px-3 py-1 text-sm font-black" data-st-tally={`${tl.ok}:${tl.ko}`}>
                <span aria-hidden="true" dir="ltr"><span className="text-emerald-800">✓ {tl.ok}</span>{' · '}<span className="text-rose-800">✗ {tl.ko}</span></span>
                <span className="sr-only">{k('tallySr', { ok: tl.ok, ko: tl.ko })}</span>
              </p>
            )}
          </div>
          <div dir="ltr" {...stretch.trackProps} className="relative" style={{ ...stretch.trackProps.style, height: 60, ...(locked ? { pointerEvents: 'none' } : {}) }} data-tiling-ruler>
            <svg width={width} height={60} className="absolute inset-0" aria-hidden="true" focusable="false">
              <rect x={EDGE - 4} y={26} width={span * mu + 8} height={5} rx={2} fill="#047857" />
              {Array.from({ length: range.max - range.min + 1 }, (_, i) => range.min + i).map((v) => {
                const tr = lab.tried.find((x) => x.k === v);
                return (
                  <g key={v}>
                    <line x1={xOf(v)} x2={xOf(v)} y1={33} y2={41} stroke="#64748B" />
                    <text x={xOf(v)} y={55} textAnchor="middle" fontSize={12} fill={tr ? (tr.valid ? '#047857' : '#BE123C') : '#334155'} fontWeight={tr ? 'bold' : 'normal'} fontFamily="ui-monospace, monospace">{v}</text>
                  </g>
                );
              })}
            </svg>
            <div
              {...stretch.handleProps({ label: k('handle'), valueText: kk == null ? k('notSet') : k('valueText', { k: kk }) })}
              data-tiling-handle
              aria-disabled={locked || undefined}
              className={`absolute top-0 flex h-11 w-11 -translate-x-1/2 items-start justify-center rounded-xl border-2 outline-none focus-visible:ring-4 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 ${stretch.dragging ? 'border-blue-500 bg-blue-500/10' : 'border-slate-500 bg-white/60'}`}
              style={{ left: xOf(kk ?? range.min), cursor: stretch.dragging ? 'grabbing' : 'grab' }}
            >
              <span className="-mt-2 rounded-full bg-slate-800 px-2 font-mono text-sm font-extrabold text-white" aria-hidden={gameScreen || undefined} data-tiling-k>{kk ?? '?'}</span>
            </div>
          </div>
          {/* − puis + dans l'ordre de la règle (LTR) : « − » à gauche, comme les petits k */}
          <div dir="ltr" className="flex items-center justify-center gap-2">
            <button type="button" onClick={() => stretch.nudge(-1)} aria-label={k('fewer')} disabled={locked || (kk != null && kk <= range.min)} data-tiling-minus
              className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-300 bg-white disabled:opacity-40 ${ring}`}><Minus className="h-5 w-5" aria-hidden="true" /></button>
            <p className="min-w-[8rem] text-center text-sm font-bold text-slate-700" aria-hidden="true">{kk == null ? k('notSet') : k('valueText', { k: kk })}</p>
            <button type="button" onClick={() => stretch.nudge(1)} aria-label={k('more')} disabled={locked || (kk != null && kk >= range.max)} data-tiling-plus
              className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-300 bg-white disabled:opacity-40 ${ring}`}><Plus className="h-5 w-5" aria-hidden="true" /></button>
          </div>

          <div className="grid gap-3 grid-cols-[auto_1fr]">
            <div className="flex justify-center rounded-2xl border-2 border-slate-200 bg-white p-2" dir="ltr">
              <svg width={box} height={box} viewBox={`0 0 ${box} ${box}`} role="img" data-tiling-square data-k={kk ?? ''} data-valid={t0 ? String(valid) : ''}
                aria-label={t0 == null ? k('notSet') : gameScreen
                  ? (valid ? k('ariaValidP', { n, k: kk, b: t0.b }) : k('ariaRefusedP', { n, k: kk }))
                  : (valid ? k('ariaValid', { n, k: kk, b: t0.b }) : k('ariaRefused', { n, k: kk }))}>
                <rect x={1} y={1} width={box - 2} height={box - 2} fill={t0 == null ? '#F1F5F9' : valid ? '#D1FAE5' : '#FFE4E6'} stroke="#334155" strokeWidth={2} />
                {t0 && Array.from({ length: kk - 1 }, (_, i) => (
                  <g key={i}>
                    <line x1={(i + 1) * cell} x2={(i + 1) * cell} y1={0} y2={box} stroke={valid ? '#047857' : '#E11D48'} strokeDasharray={valid ? undefined : '5 4'} />
                    <line x1={0} x2={box} y1={(i + 1) * cell} y2={(i + 1) * cell} stroke={valid ? '#047857' : '#E11D48'} strokeDasharray={valid ? undefined : '5 4'} />
                  </g>
                ))}
                {t0 && valid && cell >= 26 && Array.from({ length: kk * kk }, (_, i) => (
                  <text key={i} x={(i % kk + 0.5) * cell} y={(Math.floor(i / kk) + 0.5) * cell + 4} textAnchor="middle" fontSize={Math.min(16, cell / 3)} fill="#065F46" fontFamily="ui-monospace, monospace" fontWeight="bold">{t0.b}</text>
                ))}
                {/* le côté : k côtés de dalle */}
                {t0 && valid && Array.from({ length: kk }, (_, i) => (
                  <line key={`s${i}`} x1={i * cell + 3} x2={(i + 1) * cell - 3} y1={box - 4} y2={box - 4} stroke="#0369A1" strokeWidth={4} strokeLinecap="round" />
                ))}
                {/* lecteur : un pavage refusé est barré d'une grande croix (le refus se voit, pas seulement sa couleur) */}
                {gameScreen && t0 && !valid && (
                  <g data-tiling-cross>
                    <line x1={box * 0.2} y1={box * 0.2} x2={box * 0.8} y2={box * 0.8} stroke="#BE123C" strokeWidth={6} strokeLinecap="round" opacity={0.75} />
                    <line x1={box * 0.8} y1={box * 0.2} x2={box * 0.2} y2={box * 0.8} stroke="#BE123C" strokeWidth={6} strokeLinecap="round" opacity={0.75} />
                  </g>
                )}
              </svg>
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-bold text-slate-800"><MathText>{k('legend', { n })}</MathText></p>
              {!gameScreen && t0 && valid && <p className="text-slate-700" dir="rtl"><MathText>{k('sideReading', { k: kk, b: t0.b })}</MathText></p>}
              {!gameScreen && lab.tried.length > 0 && (
                <ul className="flex flex-wrap gap-1.5" dir="ltr" data-tiling-tried>
                  {lab.tried.map((x) => (
                    <li key={x.k} data-tried-k={x.k} data-valid={String(x.valid)} className={`rounded-lg px-2 py-0.5 font-mono text-xs font-bold ${x.valid ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'}`}>
                      {x.valid ? `${x.k}² × ${x.b}` : `${x.k}² ∤ ${n}`}
                    </li>
                  ))}
                </ul>
              )}
              {/* lecteur : le JOURNAL de la manche — k et l'aire de la dalle (jamais un nombre de dalles), muet pendant une question */}
              {gameScreen && !quiet && journal.length > 0 && (
                <div data-st-journal>
                  <p id={journalId} className="text-sm font-black text-indigo-900"><span aria-hidden="true">📋 </span>{k('journal')}</p>
                  <table className="mt-1 w-full table-fixed text-center text-sm" dir="ltr" aria-labelledby={journalId}>
                    <tbody>
                      <tr><th scope="row" className="w-24 bg-slate-50 font-mono">{k('colK')}</th>{journal.map((x) => <th key={x.k} scope="col" className="border border-slate-200 font-mono font-normal">{x.k}</th>)}</tr>
                      <tr>
                        <th scope="row" className="bg-slate-50 text-xs">{k('colB')}</th>
                        {journal.map((x) => (
                          <td key={x.k} className={`border border-slate-200 font-mono ${x.valid ? 'text-emerald-800' : 'text-rose-800'}`} data-st-cell={x.k} data-valid={String(x.valid)}>
                            {x.valid ? x.b : <><span aria-hidden="true">✗</span><span className="sr-only">{k('refusedCell')}</span></>}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </ManipulationStage>
      </div>
    </ManipulationShell>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite de questions de chaque étape ; `small` n'est posée que si un AUTRE pavage juste existe. */
export const CHAINS = Object.freeze({
  tile: ['area', 'side'],
  ruleP: ['why', 'rule'],
  ruleS: ['best', 'small', 'rule'],
});
const hasOther = (lab) => L.validKs(lab).some((v) => v > 1 && v !== L.kmax(lab) && lab.tried.some((x) => x.valid && x.k === v));
export const chainOf = (key, lab) => CHAINS[key].filter((q) => q !== 'small' || hasOther(lab));

/** Le pavage juste (k > 1) que l'élève a fait, le premier par k. */
export const firstValid = (lab) => lab.tried.find((x) => x.valid && x.k > 1);
const Mx = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const $ = (s) => `$${s}$`;

/** Chaque question est construite sur LES nombres de l'élève (rien n'est écrit en dur) ; `k` : les textes de `squareTiling`. */
export const QUESTIONS = {
  area: (lab, k) => {
    const v = firstValid(lab); const nums = { n: lab.n, k: v.k, kk: v.k * v.k, b: v.b };
    return {
      id: 'area', kind: 'number', expected: String(v.b), answer: <MathText>{$(String(v.b))}</MathText>,
      prompt: Mx(k, 'area.prompt', nums), hints: [Mx(k, 'area.hint1', nums), Mx(k, 'area.hint2', nums)], explain: Mx(k, 'area.explain', nums),
    };
  },
  side: (lab, k) => {
    const v = firstValid(lab); const nums = { n: lab.n, k: v.k, kk: v.k * v.k, b: v.b };
    return {
      id: 'side', kind: 'choice', cols: 3,
      prompt: Mx(k, 'side.prompt', nums),
      options: [
        { text: Mx(k, 'side.wrongSquare', nums), why: Mx(k, 'side.whySquare', nums) },
        { text: Mx(k, 'side.right', nums), correct: true },
        { text: Mx(k, 'side.wrongSum', nums), why: Mx(k, 'side.whySum', nums) },
      ],
      hints: [Mx(k, 'side.hint1', nums), Mx(k, 'side.hint2', nums)], explain: Mx(k, 'side.explain', nums),
    };
  },
  why: (lab, k) => {
    const r = lab.tried.find((x) => !x.valid); const v = firstValid(lab);
    const nums = { n: lab.n, k: r.k, kk: r.k * r.k, kv: v.k, calc: L.refusedTex(lab.n, r.k) };
    return {
      id: 'why', kind: 'choice',
      prompt: Mx(k, 'why.prompt', nums),
      options: [
        { text: Mx(k, 'why.wrongCover', nums), why: Mx(k, 'why.whyCover', nums) },
        { text: Mx(k, 'why.wrongSide', nums), why: Mx(k, 'why.whySide', nums) },
        { text: Mx(k, 'why.right', nums), correct: true },
      ],
      hints: [Mx(k, 'why.hint1', nums), Mx(k, 'why.hint2', nums)], explain: Mx(k, 'why.explain', nums),
    };
  },
  best: (lab, k) => {
    const km = L.kmax(lab); const t = L.tiling(lab.n, km); const nums = { n: lab.n, km, kk: km * km, b: t.b };
    return {
      id: 'best', kind: 'number', expected: String(t.b), answer: <MathText>{$(String(t.b))}</MathText>,
      prompt: Mx(k, 'best.prompt', nums), hints: [Mx(k, 'best.hint1', nums), Mx(k, 'best.hint2', nums)], explain: Mx(k, 'best.explain', nums),
    };
  },
  small: (lab, k) => {
    const km = L.kmax(lab);
    const ko = lab.tried.filter((x) => x.valid && x.k > 1 && x.k !== km).at(-1).k;
    const bo = lab.n / (ko * ko); const bk = lab.n / (km * km);
    const m = squareRoots.squareDivisors(bo).at(-1);
    const nums = { n: lab.n, km, ko, bo, bk, sq: m * m };
    return {
      id: 'small', kind: 'choice', cols: 3,
      prompt: Mx(k, 'small.prompt', nums),
      options: [
        { text: Mx(k, 'small.second', nums), why: Mx(k, 'small.whySecond', nums) },
        { text: Mx(k, 'small.neither', nums), why: Mx(k, 'small.whyNeither', nums) },
        { text: Mx(k, 'small.first', nums), correct: true },
      ],
      hints: [Mx(k, 'small.hint1', nums), Mx(k, 'small.hint2', nums)], explain: Mx(k, 'small.explain', nums),
    };
  },
  rule: (lab, k) => {
    const simplest = lab.mode === 'simplest';
    const km = L.kmax(lab); const ko = lab.tried.filter((x) => x.valid && x.k > 1 && x.k !== km).at(-1)?.k ?? 2;
    const t0 = L.tiling(lab.n, km);
    return {
      id: 'rule', kind: 'choice',
      prompt: <MathText>{simplest ? k('sPrompt', { n: lab.n }) : k('pPrompt')}</MathText>,
      options: simplest
        ? [
          { text: <MathText>{k('sOpt2')}</MathText>, why: <MathText>{k('sWhy2', { n: lab.n, big: km })}</MathText> },
          { text: <MathText>{k('sOpt1')}</MathText>, correct: true },
          { text: <MathText>{k('sOpt3')}</MathText>, why: <MathText>{k('sWhy3', { n: lab.n, big: km })}</MathText> },
        ]
        : [
          { text: <MathText>{k('pOpt2')}</MathText>, why: <MathText>{k('pWhy2')}</MathText> },
          { text: <MathText>{k('pOpt3')}</MathText>, why: <MathText>{k('pWhy3')}</MathText> },
          { text: <MathText>{k('pOpt1')}</MathText>, correct: true },
        ],
      hints: simplest ? [Mx(k, 'rule.hint1s', { ko, km }), Mx(k, 'rule.hint2s')] : [Mx(k, 'rule.hint1p'), Mx(k, 'rule.hint2p')],
      explain: simplest
        ? <div className="space-y-1"><EquationDisplay tex={L.equationTex(lab.n, t0)} tone="result" /><p><MathText>{k('sRule')}</MathText></p></div>
        : <div className="space-y-1"><EquationDisplay tex="\sqrt{k^2 \times b} = \sqrt{k^2} \times \sqrt{b} = k\sqrt{b}" tone="result" /><p><MathText>{k('pRule')}</MathText></p></div>,
    };
  },
};

/* ══════════════ Lecteur de mission : les suites des manches (rollout 2026-11-10, conseil) ══════════════ */

/**
 * La suite à poser dans le lecteur (une seule par manche) :
 *   'full'     manche 1 : l'aire d'un toucher, le côté parmi trois, BÂTIR « √n = k × √b », la règle « √(k²×b) = k×√b » ;
 *   'bridge'   à la découverte : « √(k²×b) = √(k²) × … » ;   'quotient'  « √b = √(n ÷ …) » ;   'area'  l'aire d'un toucher ;
 *   'fullS'    simplest (leçon 5), à la découverte : l'aire de la dalle du plus grand k, BÂTIR « √n = k × √m », la règle ;
 *   'buildS'   simplest, à la découverte : BÂTIR « √n = k × √m » seul ;   'bestS'  simplest : l'aire de la dalle du plus grand k seule ;   'none'.
 */
export const CHAINS_PLAYER = Object.freeze({
  full: ['areaFill', 'sideChoice', 'tileBuild', 'ruleP1'],
  bridge: ['bridge'],
  quotient: ['quotient'],
  area: ['areaFill'],
  fullS: ['bestFill', 'simplestBuild', 'ruleS1'],
  buildS: ['simplestBuild'],
  bestS: ['bestFill'],
  none: [],
});
export const chainOfPlayer = (mode) => CHAINS_PLAYER[mode] ?? [];
/** Les suites du mode simplest : posées à la DÉCOUVERTE (le plus grand k et son contraste), jamais avant. */
export const SIMPLEST_CHAINS = ['fullS', 'buildS', 'bestS'];
/** Le temps pendant lequel un résultat de prédiction reste seul à l'écran avant la question de la manche. */
export const PRED_HOLD_MS = 1600;
/** Un texte qui commence par un symbole (« ✓ نعم », « 🤔 … ») : le symbole est caché au lecteur d'écran. */
export function glyph(text) {
  const m = String(text).match(/^([\p{Extended_Pictographic}\u2713\u2717\u2714\u2716]\uFE0F?)\s*/u);
  return m ? <><span aria-hidden="true">{m[1]} </span>{String(text).slice(m[0].length)}</> : text;
}

const Px = (k, key, o) => <MathText>{k(`cpP.${key}`, o)}</MathText>;
/** Le texte d'un choix (« 9 × √3 ») en LaTeX. */
const asTex = (s) => `$${String(s).replace(/√(\d+)/g, (_m, d) => `\\sqrt{${d}}`).replace(/×/g, '\\times')}$`;

Object.assign(QUESTIONS, {
  areaFill: (lab, k, { avoid } = {}) => {
    const v = firstValid(lab); const o = { n: lab.n, k: v.k, b: v.b };
    return {
      id: 'areaFill', kind: 'fill', prompt: Px(k, 'areaFill.prompt', o),
      fields: [{ label: k('cpP.tileField'), expected: String(v.b), options: L.spin(L.areaOptions(lab.n, v.k, avoid), lab.n + v.k) }],
      hints: [Px(k, 'areaFill.hint1', o), Px(k, 'areaFill.hint2', o)], explain: Px(k, 'areaFill.explain', o),
    };
  },
  sideChoice: (lab, k) => {
    const v = firstValid(lab); const o = { n: lab.n, k: v.k, b: v.b }; const so = L.sideOptions(lab.n, v.k);
    return {
      id: 'sideChoice', kind: 'choice', cols: 3, prompt: Px(k, 'sideChoice.prompt', o),
      options: L.spin([
        { text: <MathText>{asTex(so.wrongSquare)}</MathText>, why: Px(k, 'sideChoice.whySquare', o) },
        { text: <MathText>{asTex(so.right)}</MathText>, correct: true },
        { text: <MathText>{asTex(so.wrongSelf)}</MathText>, why: Px(k, 'sideChoice.whySelf', o) },
      ], lab.n + v.k),
      hints: [Px(k, 'sideChoice.hint1', o), Px(k, 'sideChoice.hint2', o)], explain: Px(k, 'sideChoice.explain', o),
    };
  },
  tileBuild: (lab, k) => {
    const v = firstValid(lab); const o = { n: lab.n, k: v.k, kk: v.k * v.k, b: v.b }; const x = L.tileBuildOf(lab.n, v.k);
    return {
      id: 'tileBuild', kind: 'build', prompt: Px(k, 'tileBuild.prompt', o),
      slots: [k('cpP.tileBuild.slotK'), k('cpP.tileBuild.slotRoot')], ops: [k('cpP.tileBuild.op')],
      tiles: x.tiles, expected: x.expected,
      hints: [Px(k, 'tileBuild.hint1', o), Px(k, 'tileBuild.hint2', o)], explain: Px(k, 'tileBuild.explain', o),
    };
  },
  ruleP1: (lab, k) => ({
    id: 'rule', kind: 'choice', prompt: Px(k, 'ruleP.prompt'),
    options: L.spin([
      { text: Px(k, 'ruleP.wrongSquare'), why: Px(k, 'ruleP.whySquare') },
      { text: Px(k, 'ruleP.right'), correct: true },
      { text: Px(k, 'ruleP.wrongSum'), why: Px(k, 'ruleP.whySum') },
    ], lab.n),
    hints: [Px(k, 'ruleP.hint1'), Px(k, 'ruleP.hint2')], explain: Px(k, 'ruleP.explain'),
  }),
  bridge: (lab, k) => {
    const v = firstValid(lab); const o = { kk: v.k * v.k, b: v.b }; const x = L.bridgeOptions(lab.n, v.k);
    return {
      id: 'bridge', kind: 'fill', prompt: Px(k, 'bridge.prompt', o),
      fields: [{ label: k('cpP.rootField'), expected: x.expected, options: L.spin(x.options, lab.n * 3 + v.k) }],
      hints: [Px(k, 'bridge.hint1', o), Px(k, 'bridge.hint2', o)], explain: Px(k, 'bridge.explain', o),
    };
  },
  quotient: (lab, k) => {
    const v = firstValid(lab); const o = { n: lab.n, k: v.k, kk: v.k * v.k, b: v.b }; const x = L.quotientOptions(lab.n, v.k);
    return {
      id: 'quotient', kind: 'fill', prompt: Px(k, 'quotient.prompt', o),
      fields: [{ label: k('cpP.kkField'), expected: x.expected, options: L.spin(x.options, lab.n * 5 + v.k) }],
      hints: [Px(k, 'quotient.hint1', o), Px(k, 'quotient.hint2', o)], explain: Px(k, 'quotient.explain', o),
    };
  },
  bestFill: (lab, k, { avoid } = {}) => {
    const km = L.kmax(lab); const m = lab.n / (km * km); const o = { n: lab.n, km, m };
    return {
      id: 'bestFill', kind: 'fill', prompt: Px(k, 'bestFill.prompt', o),
      fields: [{ label: k('cpP.tileField'), expected: String(m), options: L.spin(L.areaOptions(lab.n, km, avoid), lab.n + km + 1) }],
      hints: [Px(k, 'bestFill.hint1', o), Px(k, 'bestFill.hint2', o)], explain: Px(k, 'bestFill.explain', o),
    };
  },
  simplestBuild: (lab, k) => {
    const x = L.simplestBuildOf(lab); const o = { n: lab.n, km: x.km, m: x.m, ko: x.ko };
    return {
      id: 'simplestBuild', kind: 'build', prompt: Px(k, 'simplestBuild.prompt', o),
      slots: [k('cpP.tileBuild.slotK'), k('cpP.tileBuild.slotRoot')], ops: [k('cpP.tileBuild.op')],
      tiles: x.tiles, expected: x.expected,
      // ko = 1 (un seul pavage non trivial) : pas d'indice « عدد البلاطات على الضلع 1 »
      hints: x.ko > 1 ? [Px(k, 'simplestBuild.hint1', o), Px(k, 'simplestBuild.hint2', o)] : [Px(k, 'simplestBuild.hint1', o)], explain: Px(k, 'simplestBuild.explain', o),
    };
  },
  ruleS1: (lab, k) => ({
    id: 'rule', kind: 'choice', prompt: Px(k, 'ruleS.prompt'),
    options: L.spin([
      { text: Px(k, 'ruleS.wrongAny'), why: Px(k, 'ruleS.whyAny') },
      { text: Px(k, 'ruleS.right'), correct: true },
      { text: Px(k, 'ruleS.wrongTwo'), why: Px(k, 'ruleS.whyTwo') },
    ], lab.n + 1),
    hints: [Px(k, 'ruleS.hint1'), Px(k, 'ruleS.hint2')], explain: Px(k, 'ruleS.explain'),
  }),
});
