import React, { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Minus, Plus, MapPin, ListChecks } from 'lucide-react';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import useStretchInteraction from '../useStretchInteraction';
import EquationDisplay from '../primitives/EquationDisplay';
import MathText from '../../components/MathText';
import * as L from '../logic/vanishingPitch';
import * as P from '../logic/vanishingPitchPlayer';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { useLabCoach } from '../primitives/LabCoach';
import PredictTray from '../primitives/PredictTray';
import { useInMissionPlayer, useMissionArea } from '../../mission/missionPlayerContext';
import { playSfx } from '../../utils/playEffect';

/**
 * vanishing-pitch — LE TERRAIN QUI S'ANNULE (unité 4 « معادلات ومتراجحات », leçon 2
 * « معادلات جداء معدوم »).
 *
 * Le monde est le terrain de football de l'unité 3, EXPRÈS : l'élève y a appris
 * qu'un produit de deux sommes est l'aire d'un rectangle dont ces sommes sont les
 * côtés. Ici les deux CÔTÉS sont les deux FACTEURS A = ax + b et B = cx + d, et
 * l'AIRE est leur produit. Rien n'est porté (ce n'est pas pitch-expansion) : les
 * côtés sont SIGNÉS, tracés depuis un coin ; un côté négatif part de l'autre côté du
 * coin, en pointillés rouges (« ضلع سالب »), et l'aire porte son signe.
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. L'élève ÉTIRE x sur une règle graduée (useStretchInteraction, LTR ; clavier,
 *    − / +, toucher la règle). Puis il ÉPINGLE le x courant (« ثبّت هذا الحل »), et
 *    il JUGE « لا حلول أخرى ».
 * B. Idée : un produit est nul si et seulement si l'un de ses facteurs l'est —
 *    A × B = 0 ⇔ A = 0 أو B = 0.
 * C. Pendant le geste les deux côtés suivent x EN DIRECT ; quand un côté atteint 0
 *    le terrain S'ÉCRASE en une ligne (aire 0) — le phénomène ; un côté qui passe
 *    sous 0 se retourne.
 * D. L'épingle est jugée : refusée quand l'aire n'est pas nulle, avec l'aire lue
 *    exactement (« (−1) × 6 = −6 ≠ 0 ») ; posée sinon, avec le côté qui s'annule.
 * E. À découvrir : le terrain ne disparaît QUE quand un côté disparaît — d'où les
 *    deux équations du premier degré A = 0 et B = 0.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        خاصية الجداء المعدوم : A × B = 0 ⇔ A = 0 أو B = 0
 *   OBJECT         un terrain dont les côtés signés sont les deux facteurs
 *   VARIABLE       x (le doigt tient la poignée de la règle)
 *   INVARIANT      aire = A × B pour tout x ; un facteur constant non nul ne change
 *                  jamais (2 dans 2(x − 3))
 *   TRANSFORMATION les deux côtés, l'aire et son signe, en direct
 *   CONSTRAINT     une solution épinglée doit annuler l'aire
 *   RESISTANCE     l'épingle refusée avec l'aire exacte ; « لا حلول أخرى » refusé tant
 *                  qu'un zéro manque ou que la règle n'a pas été balayée des deux côtés
 *   EVIDENCE       le terrain réduit à une ligne ; les épingles sur la piste des solutions
 *   CONTRAST       un x refusé ET tous les zéros épinglés ; un côté constant (un seul
 *                  zéro) contre deux côtés qui bougent (deux zéros)
 *   PREDICTION     « où le terrain va-t-il disparaître ? » — la règle est là, rien n'est marqué
 *   DISCOVERY      « الجداء ينعدم إذا وفقط إذا انعدم أحد عامليه » (distracteurs réfutés
 *                  par les propres essais : « les deux à la fois », « x = 0 », « un côté
 *                  négatif »)
 *   FORMALIZATION  A × B = 0 ⇔ A = 0 أو B = 0, puis les deux équations du premier degré
 *   TRANSFER       une règle en demis, un carré (un zéro), un produit qui contient x
 *                  (le zéro 0) ; طرائق : factoriser pour revenir à ce terrain
 *
 * Toute expression « f1|f2 » de deux facteurs du premier degré (ou constants) est
 * acceptée par `expr` ; un seul facteur veut dire son carré. La graduation vient des
 * dénominateurs des zéros (logic/vanishingPitch.js) : chaque zéro est une graduation.
 * Manuel (§6bis) : chaque épingle est une réponse — pas d'auto-complétion.
 *
 * QUESTIONS PENDANT LE LABO (prototype `primitives/LabCheckpoint`, déploiement lot 3, 2026-10-28) : le labo n'a qu'UNE scène libre ; quand la
 * découverte est atteinte (un x refusé, tous les zéros épinglés, « لا حلول أخرى »), une suite unique se pose PAR-DESSUS le labo : l'aire lue pour
 * le x REFUSÉ (les mauvaises options sont les erreurs réelles : additionner les côtés, oublier le signe) · quel côté s'est annulé pour SON
 * épingle · combien de valeurs il a épinglées · LA RÈGLE (l'ancienne découverte, qui formalise). Obligatoires pour tout élève ; l'enseignant seul
 * les coupe pour SON compte (`checkpoints` = false les coupe aussi). `onCheckpoint(ev)` : la trace pour les étapes du module. ÉTAPES
 * `LabStepper` (`[data-vp-step=<i>]` : épingler les zéros · un x refusé · « لا حلول أخرى » + questions) + fête ; « إعادة » repart de zéro ;
 * « أعِد التجربة » remet le terrain au départ. SON : `tooth` (x bougé), `bell` (un côté s'annule), `flag` (épingle posée), `over` (refus).
 *
 * DÉCOR (exigence du propriétaire) : bandes de tonte, buts et un ballon que l'élève
 * peut taper (il roule dans le terrain ; quand le terrain s'écrase, il tombe sur la
 * ligne). Le décor ne porte AUCUNE information : `aria-hidden`, `tabIndex={-1}`, il ne
 * change jamais l'état du lab, et `prefers-reduced-motion` l'immobilise.
 *
 * LECTEUR DE MISSION (rollout 2026-11-11, unité 4 leçon 2 `jidaa-maadum` ; conseil du 2026-11-11, verdict « L2 ») : joué en MANCHES (LabRounds).
 * Tout ce qui suit est gardé par `useInMissionPlayer()` ; hors lecteur (page, enseignant, mode classe) le labo est INCHANGÉ.
 *   - Un ESSAI = épingler un x NOUVEAU (jamais jugé dans la manche) ou « لا حلول أخرى » alors qu'un zéro manque (UNE fois par ensemble d'épingles) :
 *     `onVerdict { groups, exact, free? }` (`logic/vanishingPitchPlayer › pinVerdict, claimVerdict`). Bouger x, re-épingler le même x (son verdict est
 *     RÉ-ANNONCÉ), « حرّك x أوّلًا », `notSwept` et la revendication acceptée ne sont pas des essais. Aucun refus n'est exigé (L2.2) ; `freeRefusal` rend le
 *     PREMIER refus de la manche gratuit (M1 r1 et la manche couverte). La découverte (tous les zéros + revendication acceptée) est annoncée une fois
 *     (`{ tk: 'discovered' }`). « جرّب كل الإمكانيات », les indices et les niveaux sont CACHÉS (le guide les remplace) ; toujours guidé ; pas de fête.
 *   - `chains` : 'build' (côté constant : quel côté · combien vaut l'autre · BÂTIR « ▢ = 0 ⇒ x = ▢ » ; sinon BÂTIR « x = ▢ أو x = ▢ », précédé de « quel
 *     côté » sur la manche couverte), 'rule' (quel côté · BÂTIR « ▢ = 0 ▢ ▢ = 0 » avec la tuile de TEXTE « أو » et le leurre « معًا » · LA RÈGLE),
 *     'count' (carré : quel côté · combien de solutions), 'none'.
 *   - `predict` : des CLÉS (≤ 2) — count, atZero, zeroB — posées AVANT le premier geste ; options et vérité de la logique
 *     (`predictOptions`, `predictTruth`), jugées par le terrain (`judgedPredictions`).
 *   - `covered` : le terrain est MASQUÉ ; seul un x déjà jugé (épinglé ou refusé) se voit (`isCovered`) — les lectures montrent les expressions, les
 *     valeurs sont « ? ». `choices` : des terrains au choix (manche libre) [{ expr, startX }]. `startX` / `range` : ouverture et règle de la manche.
 *   Journal « 📋 جدول تجاربك » (x · A · B · المساحة · le MOT du verdict) et verdict dans la colonne, une région vivante TOUJOURS montée (une clé par
 *   geste) ; commandes figées pendant une prédiction ou une question (`aria-disabled` + garde) ; `LabCoach` (`logic › coachOf`) ;
 *   `{ tk: 'reset' }` à chaque « إعادة », `{ tk: 'retry' }`. AUCUN défilement : le terrain est UN bloc `data-paging-keep` mis à l'échelle par la
 *   largeur de la scène ET la hauteur de la zone du lecteur.
 */
const PRED_MAX = 2;
/** Le temps pendant lequel un résultat de prédiction reste seul à l'écran avant la question de la manche. */
export const PRED_HOLD_MS = 1600;
const ringP = 'focus-visible:ring-indigo-600 focus-visible:ring-offset-2';
/** Lecteur : ce que la zone du lecteur porte EN PLUS du labo (le chemin des manches, la ligne du but, les marges). */
const PLAYER_CHROME = 150;

export default function VanishingPitch({
  expr: expr0 = 'x-2|x+5', title, lead, mission, level, levels: withLevels = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onFinished, onTrial, onCheckpoint,
  // ── LECTEUR DE MISSION (rollout 2026-11-11, unité 4 leçon 2) ──
  startX: startX0, range: range0, onVerdict, chains: chainsMode = 'none', predict: predictList = [], choices, covered: covered0 = false,
  freeRefusal = false, coachPin = false, coach: coachOn = true,
}) {
  const { t } = useTranslation('lesson');
  const gameScreen = useInMissionPlayer();
  const uid = useId();
  const k = useCallback((key, o) => t(`manipulation.vanishingPitch.${key}`, o), [t]);
  // lecteur : le x d'ouverture et la règle voyagent avec l'expression (la manche libre change de terrain) ; la page garde ses nombres d'avant
  const initialNumbers = gameScreen ? { expr: expr0, startX: startX0, range: range0 } : { expr: expr0 };
  const state = useManipulation({ type: 'vanishing-pitch', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const { expr } = state.numbers;
  const startX = gameScreen ? state.numbers.startX : undefined;
  const range = gameScreen ? state.numbers.range : undefined;
  const isCoveredRound = gameScreen && covered0;

  const make = () => L.init({ expr, startX, range });
  const [labState, setLab] = useState(make);
  // the lab of THIS render: on a scene change (another choice of the free round) it is the fresh one at once
  let lab = labState;
  const sceneKey = `${expr}:${startX ?? ''}:${range ?? ''}:${state.epoch}:${state.resetCount}`;
  const [scene, setScene] = useState({ key: sceneKey, inits: 0 });
  const [live, setLive] = useState(null);
  const [kick, setKick] = useState(0);
  // lecteur : les suites finies, les prédictions (clé → juste ?), celles posées, les résultats montrés, le dernier geste (une clé par geste)
  const [doneIds, setDoneIds] = useState([]);
  const [preds, setPreds] = useState({});
  const asked = useRef(new Set());
  const [missionBig, setMissionBig] = useState(false);
  const refusedSeen = useRef(0);
  const claimSeen = useRef([]);
  const discoveredSent = useRef(false);
  const heardPred = useRef(new Set());
  const [shownPreds, setShownPreds] = useState([]);
  const [predHold, setPredHold] = useState(false);
  const holdTimer = useRef(null);
  const [choiceSaid, setChoiceSaid] = useState(null);
  const [gesture, setGesture] = useState(0);
  // Miroir synchrone de `lab` : « جرّب كل الإمكانيات » enchaîne des pas plus vite qu'un rendu.
  const labRef = useRef(lab);
  // « إعادة » (resetCount), un autre niveau ou d'autres nombres : TOUT recommence — le terrain, les essais et les questions du labo
  if (scene.key !== sceneKey) {
    lab = make();
    setScene({ key: sceneKey, inits: scene.inits + 1 }); setLab(lab); setLive(null);
    setDoneIds([]); setPreds({}); asked.current = new Set(); refusedSeen.current = 0; claimSeen.current = []; discoveredSent.current = false;
    heardPred.current = new Set(); setShownPreds([]); setPredHold(false);
  }
  labRef.current = lab;
  // la manche (LabRounds) repart de zéro avec la scène : ses essais et prédictions d'avant ne comptent plus
  useEffect(() => { if (gameScreen && scene.inits > 0) state.report(onTrial, { tk: 'reset' }); }, [scene.inits]); // eslint-disable-line react-hooks/exhaustive-deps

  const ready = gameScreen ? P.playerReady(lab) : L.discoveryReady(lab);
  // les questions pendant le labo : une suite unique quand la découverte est atteinte ; celle qui finit par la règle remplace la découverte automatique
  const cpSettings = useLabCheckpointSettings('vanishing-pitch');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const cpLive = cpOn && cpSettings.enabled;
  // ── le lecteur : les suites de la manche (CHAINS_PLAYER), posées quand ce qu'elles interrogent est là, après les résultats des prédictions ──
  const playerChains = gameScreen ? chainsOfPlayer(chainsMode, lab, covered0) : [];
  const predKeys = gameScreen ? predictList.filter((key) => P.PREDICT_KEYS.includes(key)).slice(0, PRED_MAX) : [];
  const judgedPreds = gameScreen ? P.judgedPredictions(lab, predKeys.filter((key) => key in preds), ready) : [];
  const pendingPreds = judgedPreds.filter((key) => !heardPred.current.has(key));
  const holdChain = pendingPreds.length > 0 || predHold;
  const playerPending = gameScreen && cpLive && !holdChain ? playerChains.find((c) => c.reached(lab) && !doneIds.includes(c.id)) ?? null : null;
  const chain = gameScreen ? null : (cpLive ? CHAIN : null);
  const cp = useLabCheckpoint({
    id: gameScreen ? playerPending?.id ?? null : (chain ? expr : null),
    questions: gameScreen
      ? (playerPending ? playerPending.qs.map((q) => QUESTIONS[q](lab, k)) : null)
      : (chain && ready ? chain.map((q) => QUESTIONS[q](lab, k)) : null),
    reached: gameScreen ? !!playerPending : ready,
    resetKey: scene.inits,
    onRetry: () => {
      setLab(make()); setLive(null);
      if (gameScreen) {
        // lecteur : le terrain repart de ZÉRO ; la manche oublie ce que le labo vient de défaire, le 1er refus redevient gratuit
        refusedSeen.current = 0; claimSeen.current = []; discoveredSent.current = false;
        state.report(onTrial, { tk: 'retry' });
      }
    },
    onEvent: (ev) => state.report(gameScreen ? onTrial : onCheckpoint, ev),   // {tk:'checkpoint'|'checkpoint-done', id, …} — la TRACE que la manche / les étapes relisent
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
  useEffect(() => { if (state.isFormal) state.report(onFinished, expr); }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── mesure ── */
  const boxRef = useRef(null);
  const fieldRef = useRef(null);
  // lecteur : la rangée « terrain + colonne des lectures » — ce qui est AU-DESSUS d'elle est l'en-plus (la règle, les choix)
  const rowRef = useRef(null);
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
  // lecteur : ce que le bloc du labo mesure EN PLUS du terrain (la règle, les lectures, les boutons) — re-mesuré à chaque rendu (même valeur = aucun rendu)
  useLayoutEffect(() => {
    if (!gameScreen) return;
    const el = boxRef.current; const f = rowRef.current ?? fieldRef.current;
    if (el) { const w = Math.max(260, Math.floor(el.clientWidth)); setWidth((cur) => (cur === w ? cur : w)); }
    if (el && f) {
      const o = Math.max(120, Math.ceil(el.getBoundingClientRect().height - f.getBoundingClientRect().height));
      setOverhead((cur) => (Math.abs(cur - o) < 4 ? cur : o));
    }
  });
  const area = useMissionArea();

  /* ── lecteur : la PRÉDICTION, avant le premier geste ; les commandes sont figées pendant elle et pendant une question ── */
  const untouched = lab.visited.length === 0 && lab.pins.length === 0 && lab.refused.length === 0 && live == null;
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
      setTimeout(() => boxRef.current?.querySelector('[data-vanishing-handle]')?.focus(), 60);
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

  /* ── la règle de x ── */
  const { range: rng, g } = lab;
  const EDGE = 22;
  const steps = Math.max(1, rng.max - rng.min);
  const mu = (width - 2 * EDGE) / steps;
  const xPx = (v) => EDGE + (v - rng.min) * mu;
  // zoom du lecteur : les pixels de l'écran ramenés aux pixels du calque (rect.width / offsetWidth)
  const rulerRef = useRef(null);
  const toValue = useCallback((clientX, _y, rect) => {
    const w = rulerRef.current?.offsetWidth || rect.width;
    const z = (gameScreen && w ? rect.width / w : 1) || 1;
    return rng.min + ((clientX - rect.left) / z - EDGE) / mu;
  }, [rng.min, mu, gameScreen]);
  const stretch = useStretchInteraction({
    value: live ?? lab.x ?? L.defaultV(lab), range: rng, toValue,
    // lecteur : chaque position VUE pendant le geste est une visite (le balayage qui justifie « لا حلول أخرى ») — clavier et −/+ compris
    onChange: (v0) => {
      if (lockedRef.current) return;
      setLive(v0);
      // un geste rapide saute des crans : chaque cran entre la position d'avant et la nouvelle est aussi une visite
      if (gameScreen && Number.isInteger(v0)) setLab((s) => { const from = s.x ?? L.defaultV(s); const lo = Math.min(from, v0); const hi = Math.max(from, v0); let n = s; for (let u = lo; u <= hi; u += 1) if (u !== from || s.x != null) n = L.move(n, u); return L.move(n, v0); });
    },
    onCommit: (v0) => { if (lockedRef.current) { setLive(null); return; } setLive(v0); setLab((s) => L.move(s, v0)); },
    direction: 'ltr', pageStep: g,
  });
  const nudge = (d) => { if (!lockedRef.current) stretch.nudge(d); };
  // Un x PAR DÉFAUT (L.defaultV : un terrain qui ne s'écrase pas, jamais une réponse). Ce n'est pas une visite : `lab.visited` ne le contient pas.
  const isDefault = lab.x == null && live == null;
  const v = live ?? lab.x ?? L.defaultV(lab);
  const settled = !stretch.dragging && (isDefault || (lab.x != null && (live == null || live === lab.x)));
  const unvisited = () => Array.from({ length: labRef.current.range.max - labRef.current.range.min + 1 }, (_, i) => labRef.current.range.min + i).filter((u) => !labRef.current.visited.includes(u));
  const cur = L.sides(lab, v);
  const coveredNow = isCoveredRound && P.isCovered(lab, v);
  const playerRoom = gameScreen && area?.height > 0 ? Math.max(110, area.height - overhead - PLAYER_CHROME) : Infinity;
  const geo = L.geometry(lab, v, gameScreen ? { width: Math.min(width - 188, 560), maxHeight: Math.min(320, playerRoom), pad: 16 } : { width: Math.min(width, 640) });
  const productTex = L.productTex(lab);
  const xText = L.labText(lab, cur.x);

  // une étape est FAITE quand son objectif est atteint ET (la dernière) ses questions répondues : la pastille passe au vert et on fête
  const stepDone = [L.allPinned(lab), L.allPinned(lab) && lab.refused.length > 0, ready && !cp.blocking];
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
  // le son du geste (muet sans « الصوت ») : x bougé (au plus un toutes les 35 ms), un côté qui s'annule
  const heard = useRef({ at: 0, v: null, zero: false });
  const zeroNow = Lin.isZero(cur.A) || Lin.isZero(cur.B);
  useEffect(() => {
    const h = heard.current;
    if (h.v == null) { h.v = v; h.zero = zeroNow; return; }
    if (h.v === v) return;
    h.v = v;
    const now = Date.now();
    if (now - h.at > 35) { playSfx('tooth'); h.at = now; }
    if (zeroNow && !h.zero && !coveredNow) playSfx('bell');
    h.zero = zeroNow;
  }, [v]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── épingler, conclure ── */
  const pin = () => {
    if (lockedRef.current) return;
    stretch.flush();
    // La valeur en attente (clavier, −/+) est validée d'abord : on épingle ce qui est à l'écran.
    // Lecteur : le x d'ouverture peut être épinglé tel quel (une devinette refusée) — la page demande d'abord de bouger x.
    const base = gameScreen ? (v !== lab.x ? L.move(lab, v) : lab) : (live != null && live !== lab.x ? L.move(lab, live) : lab);
    const fresh = gameScreen && P.isNewPin(base, base.x);
    let next = L.pin(base);
    // lecteur : re-épingler un x déjà jugé RÉ-ANNONCE son verdict, relu sur l'état
    if (gameScreen && next.last?.kind === 'already') next = { ...next, last: { kind: 'pinned', v: next.last.v, zero: L.zeroSides(next, next.last.v) } };
    if (gameScreen && next.last?.kind === 'notZero' && !fresh) next = { ...next, last: { kind: 'notZero', v: next.last.v } };
    setLab(next);
    const last = next.last;
    if (last && (last.kind === 'pinned' || last.kind === 'notZero')) {
      playSfx(last.kind === 'pinned' ? 'flag' : 'over');
      const sd = L.sides(next, last.v);
      state.report(onTrial, { x: L.labText(next, sd.x), xTex: L.labTex(next, sd.x), A: L.labText(next, sd.A), B: L.labText(next, sd.B), area: L.labText(next, sd.area), areaTex: L.areaTex(next, last.v), ok: last.kind === 'pinned', expr });
      if (gameScreen && fresh) {
        const verdict = P.pinVerdict(next, last.v);
        const free = freeRefusal && !verdict.exact && refusedSeen.current === 0;
        if (!verdict.exact) refusedSeen.current += 1;
        state.report(onVerdict, { ...verdict, ...(free ? { free: true } : {}) });
      }
    }
    if (gameScreen) setGesture((n) => n + 1);
    setKick((n) => n + 1);
  };
  const claim = () => {
    if (lockedRef.current) return;
    stretch.flush();
    const base = gameScreen ? (v !== lab.x ? L.move(lab, v) : lab) : (live != null && live !== lab.x ? L.move(lab, live) : lab);
    const next = L.claimNoOther(base);
    setLab(next);
    if (gameScreen) {
      setGesture((n) => n + 1);
      // lecteur : « لا حلول أخرى » alors qu'un zéro manque est un essai, UNE fois par ensemble d'épingles
      if (next.last?.kind === 'missing' && P.isNewMissingClaim(base, claimSeen.current)) {
        claimSeen.current = [...claimSeen.current, P.claimKey(base)];
        state.report(onVerdict, P.claimVerdict(base));
      }
    }
  };

  const last = lab.last;
  const sideName = (i) => k(i === 0 ? 'sideA' : 'sideB');
  // lecteur : le nom du côté sans ses deux-points dans la phrase du verdict (« الضلع B ينعدم ») ; la page garde sa phrase
  const zeroText = (zero) => (zero.length === 2 ? k('bothZero') : k('oneZero', { side: gameScreen ? sideName(zero[0]).replace(/[:：]\s*$/, '') : sideName(zero[0]) }));
  const verdict = last && ({
    pinned: () => <span className="text-emerald-800"><MathText>{k('vPinned', { x: L.labTex(lab, L.xOf(lab, last.v)), which: zeroText(last.zero) })}</MathText></span>,
    notZero: () => <span className="text-rose-800"><MathText>{k('vNot', { x: L.labTex(lab, L.xOf(lab, last.v)), area: L.areaTex(lab, last.v) })}</MathText></span>,
    already: () => <span className="text-slate-700">{k('vAlready')}</span>,
    noX: () => <span className="text-slate-700">{k('vNoX')}</span>,
    missing: () => <span className="text-rose-800">{k('vMissing')}</span>,
    notSwept: () => <span className="text-rose-800">{k('vNotSwept')}</span>,
    claimed: () => <span className="text-emerald-800">{k('vClaimed')}</span>,
  }[last.kind]?.());

  /* ── la découverte : distracteurs réfutés par les nombres du lab ── */
  const discoveryOptions = useMemo(() => discoveryOptionsOf(lab, k), [lab, k]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── le terrain ── */
  const hatchId = `vp-hatch-${uid.replace(/:/g, '')}`;
  const clipId = `vp-clip-${uid.replace(/:/g, '')}`;
  const tarpId = `vp-tarp-${uid.replace(/:/g, '')}`;
  const { rect } = geo;
  const stripe = Math.max(10, geo.unit);
  // Le ballon (décor) : dans le terrain, déplacé par chaque « tape » ; sur la ligne quand il s'écrase.
  const jig = [[0, 0], [0.25, -0.2], [-0.22, 0.18], [0.18, 0.22], [-0.25, -0.18]][kick % 5];
  const ball = geo.collapsed
    ? { cx: rect.w < 1e-9 ? rect.x : rect.x + rect.w / 2 + jig[0] * rect.w, cy: rect.h < 1e-9 ? rect.y : rect.y + rect.h / 2 + jig[1] * rect.h }
    : { cx: rect.x + rect.w / 2 + jig[0] * rect.w, cy: rect.y + rect.h / 2 + jig[1] * rect.h };
  const ballY = geo.collapsed ? ball.cy - 7 : ball.cy;

  const pinsHere = lab.pins;
  const grads = Array.from({ length: steps + 1 }, (_, i) => rng.min + i);

  /* ── lecteur : le verdict VISIBLE (relu sur l'état), le guide, la prédiction ou la question qui PREND la colonne, le journal ── */
  const shownKind = last?.kind;
  const verdictOk = shownKind === 'pinned' || shownKind === 'claimed';
  const verdictBad = shownKind === 'notZero' || shownKind === 'missing' || shownKind === 'notSwept';
  const verdictPlain = <MathText>{verdict ? verdictText(last, lab, k, zeroText) : k('player.start')}</MathText>;
  const liveKey = `${shownKind ?? 'info'}:${last?.v ?? ''}:${gesture}`;
  const chainsDone = playerChains.length ? playerChains.every((c) => doneIds.includes(c.id)) : true;

  const coachRaw = gameScreen && coachOn && !locked ? P.coachOf(lab, { done: chainsDone && ready, first: coachPin }) : null;
  // un objet STABLE par étape (son id fixe la cible et le geste) : LabCoach ne se réabonne pas à chaque geste
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const coachStep = useMemo(() => coachRaw, [coachRaw?.id]);
  const coach = useLabCoach({
    lab: 'vanishing-pitch', step: coachStep, text: coachStep ? k(`coach.${coachStep.id}`) : '',
    labels: { hide: t('manipulation.common.coach.hide'), show: t('manipulation.common.coach.show'), ok: t('manipulation.common.coach.ok'), stop: t('manipulation.common.coach.stop') },
  });

  const predOptionText = (key, x) => {
    if (key === 'atZero') return k(`predict.${x}`);
    return <MathText>{`$${numTexOf(x)}$`}</MathText>;
  };
  const trayNode = !gameScreen ? null : predictOpen ? (
    <PredictTray attr="vp" key={nextPred} step={predKeys.indexOf(nextPred) + 1} of={predKeys.length}
      title={t('manipulation.common.cp.predict.title')}
      prompt={<MathText>{k(`predict.${nextPred}`)}</MathText>}
      options={P.predictOptions(lab, nextPred).map((x) => ({ says: String(x), text: predOptionText(nextPred, x) }))}
      onSay={sayPredict} />
  ) : cp.open ? cp.node : null;

  const journalId = `${uid}-journal`;
  const journalRows = [...lab.pins, ...lab.refused].sort((a, b) => a - b).map((u) => ({ u, ok: lab.pins.includes(u), sd: L.sides(lab, u) }));
  const playerRepresentation = gameScreen && !cp.open && (
    <div className="space-y-2" data-vanishing-player-col>
      {/* le texte VISIBLE du verdict ; l'annonce passe par la région vivante toujours montée de la scène (`data-vanishing-verdict-live`) */}
      <div data-vanishing-verdict-box>
        <p className={`rounded-xl border bg-white px-3 py-2 text-center text-sm font-bold leading-snug ${verdictOk ? 'border-emerald-300 text-emerald-800' : verdictBad ? 'border-rose-300 text-rose-800' : 'border-dashed border-slate-300 text-slate-700'}`}
          data-vanishing-verdict={shownKind ?? ''}>
          {(verdictOk || verdictBad) && <span aria-hidden="true">{verdictOk ? '✓ ' : '✗ '}</span>}
          {(verdictOk || verdictBad) && <span className="sr-only">{k(verdictOk ? 'player.cueRight' : 'player.cueRefused')} </span>}
          <bdi>{verdictPlain}</bdi>
        </p>
        {shownPreds.map((pr) => (
          <p key={pr.key} data-vanishing-predict-result={pr.ok ? 'ok' : 'wrong'} data-vanishing-predict-key={pr.key}
            className={`mt-2 rounded-2xl px-4 py-2 text-center text-lg font-black ${pr.ok ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
            {pr.ok ? t('manipulation.common.cp.predict.right') : k('predict.wrong')}
          </p>
        ))}
      </div>
      {journalRows.length > 0 && (
        <div data-vanishing-journal>
          <p id={journalId} className="text-sm font-black text-indigo-900"><span aria-hidden="true">📋 </span>{k('player.journal')}</p>
          <table className="mt-1 w-full text-center text-xs" aria-labelledby={journalId}>
            <thead>
              <tr className="bg-slate-50">
                <th scope="col">{k('player.colX')}</th><th scope="col">{k('player.colA')}</th><th scope="col">{k('player.colB')}</th>
                <th scope="col">{k('player.colArea')}</th><th scope="col">{k('player.colResult')}</th>
              </tr>
            </thead>
            <tbody>
              {journalRows.map((r) => (
                <tr key={r.u} data-vanishing-row-word={r.ok ? 'ok' : 'refused'}>
                  <th scope="row" className="border border-slate-200 font-mono font-normal"><bdi dir="ltr">{L.labText(lab, r.sd.x)}</bdi></th>
                  <td className="border border-slate-200 font-mono"><bdi dir="ltr">{L.labText(lab, r.sd.A)}</bdi></td>
                  <td className="border border-slate-200 font-mono"><bdi dir="ltr">{L.labText(lab, r.sd.B)}</bdi></td>
                  <td className="border border-slate-200 font-mono"><bdi dir="ltr">{L.labText(lab, r.sd.area)}</bdi></td>
                  <td className={`border border-slate-200 font-bold ${r.ok ? 'text-emerald-800' : 'text-rose-800'}`}>
                    <span aria-hidden="true">{r.ok ? '✓ ' : '✗ '}</span>{k(r.ok ? 'player.wordPinned' : 'player.wordRefused')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
  const choiceId = (c) => `pitch-${c.expr}`;
  const sameChoice = (c) => expr === c.expr;

  const frozen = locked ? { 'aria-disabled': true } : {};
  const fr = (pageCls) => (gameScreen ? `focus-visible:ring-2 ${ringP}` : pageCls);

  /* ── le terrain, les lectures, les deux gestes : la page les empile ; le lecteur met lectures et gestes dans une colonne À CÔTÉ du terrain (la hauteur va au terrain) ── */
  const fieldNode = (
    <>
    {/* ── le terrain : côtés signés depuis le coin O (lecteur : UN bloc cadré, aucun défilement) ── */}
    <div ref={fieldRef} {...(gameScreen ? { 'data-paging-keep': '' } : {})}
      className={`overflow-hidden rounded-2xl border-2 border-emerald-200 bg-white p-1 ${predictOpen ? 'ring-4 ring-amber-300 ring-offset-2' : ''}`} dir="ltr">
      <div className="relative mx-auto" style={{ width: geo.svgW, height: geo.svgH, maxWidth: '100%' }} data-vanishing-field data-collapsed={geo.collapsed && !coveredNow ? 'true' : 'false'} data-sign={coveredNow ? 'covered' : geo.sign} data-covered={coveredNow ? 'true' : undefined}>
        <svg width={geo.svgW} height={geo.svgH} viewBox={`0 0 ${geo.svgW} ${geo.svgH}`} className="absolute inset-0 h-full w-full" role="img"
          aria-label={coveredNow ? k('player.ariaCovered') : k('ariaPitch', { a: L.labText(lab, cur.A), b: L.labText(lab, cur.B), area: L.labText(lab, cur.area) })}>
          <defs>
            <pattern id={hatchId} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#E11D48" strokeWidth="2.2" strokeOpacity="0.7" />
            </pattern>
            <pattern id={tarpId} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="14" height="14" fill="#CBD5E1" />
              <line x1="0" y1="0" x2="0" y2="14" stroke="#94A3B8" strokeWidth="5" />
            </pattern>
            <clipPath id={clipId}><rect x={rect.x} y={rect.y} width={Math.max(rect.w, 0.01)} height={Math.max(rect.h, 0.01)} /></clipPath>
          </defs>
          {/* les axes du coin O */}
          <line x1={0} x2={geo.svgW} y1={geo.oy} y2={geo.oy} stroke="#CBD5E1" strokeWidth={1} />
          <line x1={geo.ox} x2={geo.ox} y1={0} y2={geo.svgH} stroke="#CBD5E1" strokeWidth={1} />
          {coveredNow ? (
            /* lecteur, manche couverte : la bâche — aucune longueur ne se lit tant qu'aucune épingle n'a levé le voile sur CE x */
            <g data-vanishing-tarp>
              <rect x={8} y={8} width={Math.max(10, geo.svgW - 16)} height={Math.max(10, geo.svgH - 16)} rx={10} fill={`url(#${tarpId})`} stroke="#64748B" strokeWidth={2} />
              <circle cx={geo.ox} cy={geo.oy} r={4} fill="#0F172A" />
            </g>
          ) : (
            <>
              {/* décor : la pelouse tondue en bandes, les buts */}
              {!geo.collapsed && (
                <g data-decor clipPath={`url(#${clipId})`}>
                  {Array.from({ length: Math.ceil(rect.w / stripe) + 1 }, (_, i) => (
                    <rect key={i} x={rect.x + i * stripe} y={rect.y} width={stripe} height={rect.h} fill={i % 2 ? '#16A34A' : '#22C55E'} />
                  ))}
                  <line x1={rect.x + rect.w / 2} x2={rect.x + rect.w / 2} y1={rect.y} y2={rect.y + rect.h} stroke="#fff" strokeOpacity={0.45} strokeWidth={1.5} />
                  {geo.sign < 0 && <rect x={rect.x} y={rect.y} width={rect.w} height={rect.h} fill={`url(#${hatchId})`} data-vanishing-negative-area />}
                </g>
              )}
              {!geo.collapsed && rect.h >= 18 && (
                <g data-decor>
                  <rect x={rect.x - 6} y={rect.y + rect.h / 2 - Math.min(14, rect.h / 4)} width={6} height={Math.min(28, rect.h / 2)} fill="#F8FAFC" stroke="#94A3B8" />
                  <rect x={rect.x + rect.w} y={rect.y + rect.h / 2 - Math.min(14, rect.h / 4)} width={6} height={Math.min(28, rect.h / 2)} fill="#F8FAFC" stroke="#94A3B8" />
                </g>
              )}
              {!geo.collapsed && <rect x={rect.x} y={rect.y} width={rect.w} height={rect.h} fill="none" stroke="#fff" strokeWidth={2.5} />}
              {/* le terrain ÉCRASÉ : une ligne, aire 0 */}
              {geo.collapsed && (
                <line x1={rect.x} y1={rect.y} x2={rect.x + rect.w} y2={rect.y + rect.h} stroke="#B45309" strokeWidth={5} strokeLinecap="round" data-vanishing-line />
              )}
              {/* les deux côtés signés, depuis O */}
              <line x1={geo.ox} y1={geo.oy} x2={geo.ox + L.toNum(cur.A) * geo.unit} y2={geo.oy} stroke={geo.negA ? '#E11D48' : '#1D4ED8'} strokeWidth={4} strokeDasharray={geo.negA ? '6 4' : undefined} strokeLinecap="round" data-vanishing-side="A" data-negative={geo.negA ? 'true' : 'false'} />
              <line x1={geo.ox} y1={geo.oy} x2={geo.ox} y2={geo.oy - L.toNum(cur.B) * geo.unit} stroke={geo.negB ? '#E11D48' : '#7C3AED'} strokeWidth={4} strokeDasharray={geo.negB ? '6 4' : undefined} strokeLinecap="round" data-vanishing-side="B" data-negative={geo.negB ? 'true' : 'false'} />
              <circle cx={geo.ox} cy={geo.oy} r={4} fill="#0F172A" />
              {/* décor : le ballon */}
              <g data-decor style={{ transition: 'transform 450ms cubic-bezier(.3,1.6,.5,1)', transform: `translate(${ball.cx}px, ${ballY}px)` }} className="motion-reduce:transition-none">
                <circle r={7} fill="#fff" stroke="#0F172A" strokeWidth={1.4} />
                <path d="M0 -3 L3 -1 L2 3 L-2 3 L-3 -1 Z" fill="#0F172A" />
              </g>
            </>
          )}
        </svg>
        {coveredNow && (
          <p className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center" data-vanishing-tarp-label>
            <span className="inline-block rounded-full bg-slate-800/90 px-3 py-1 text-sm font-black text-white">{k('player.covered')}</span>
          </p>
        )}
        {/* décor interactif : taper le ballon (hors clavier, sans effet mathématique) */}
        {!coveredNow && (
          <button type="button" tabIndex={-1} aria-hidden="true" onClick={() => setKick((n) => n + 1)}
            className="absolute h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ left: `${(ball.cx / geo.svgW) * 100}%`, top: `${(ballY / geo.svgH) * 100}%` }} data-decor-ball />
        )}
      </div>
    </div>

    </>
  );
  const readoutNode = (
    <>
    {/* ── les côtés et l'aire, lus en direct (DOM) ── */}
    <ul className={gameScreen ? 'grid grid-cols-1 gap-2 text-sm' : 'flex flex-wrap gap-2 text-sm'} data-vanishing-readout>
      {[0, 1].map((i) => {
        const val = i === 0 ? cur.A : cur.B;
        const zero = val.n === 0;
        const neg = val.n < 0;
        const hidden = coveredNow;
        return (
          <li key={i} data-vanishing-reading={i === 0 ? 'A' : 'B'} className={`min-w-0 rounded-lg border-2 px-2 py-1 font-bold ${hidden ? 'border-slate-300 bg-slate-50 text-slate-800' : zero ? 'border-amber-400 bg-amber-50 text-amber-900' : neg ? 'border-rose-300 bg-rose-50 text-rose-900' : i === 0 ? 'border-blue-200 bg-blue-50 text-blue-900' : 'border-violet-200 bg-violet-50 text-violet-900'}`}>
            {gameScreen ? (
              <>
                <span className="block text-xs font-bold">{sideName(i).replace(/[:：]\s*$/, '')}</span>
                <bdi dir="ltr" className="block text-xs"><MathText>{`$${L.factorTex(lab, i)}$`}</MathText></bdi>
                <bdi dir="ltr" className="block text-2xl font-black leading-tight">{hidden ? <><span aria-hidden="true">?</span><span className="sr-only">{k('player.hiddenValue')}</span></> : <MathText>{`$${L.labTex(lab, val)}$`}</MathText>}</bdi>
              </>
            ) : (
              <>{sideName(i)}{' '}<bdi dir="ltr"><MathText>{`$${L.factorTex(lab, i)} = ${L.labTex(lab, val)}$`}</MathText></bdi></>
            )}
            {!hidden && neg && <span className="ms-1 text-xs font-semibold">({k('negSide')})</span>}
            {!hidden && zero && <span className="ms-1 text-xs font-semibold">({k('zeroSide')})</span>}
            {!lab.square && L.isConstant(lab, i) && <span className="ms-1 text-xs font-normal">({k('constSide')})</span>}
          </li>
        );
      })}
      <li className={`min-w-0 rounded-lg border-2 px-2 py-1 font-bold ${geo.collapsed && !coveredNow ? 'border-amber-400 bg-amber-100 text-amber-950' : 'border-slate-200 bg-white text-slate-800'}`} data-vanishing-area={coveredNow ? '?' : L.labText(lab, cur.area)}>
        {gameScreen ? (
          <>
            <span className="block text-xs font-bold">{k('area').replace(/[:：]\s*$/, '')}</span>
            <bdi dir="ltr" className="block text-2xl font-black leading-tight">{coveredNow ? <><span aria-hidden="true">?</span><span className="sr-only">{k('player.hiddenValue')}</span></> : <MathText>{`$${L.labTex(lab, cur.area)}$`}</MathText>}</bdi>
          </>
        ) : (
          <>{k('area')}{' '}<bdi dir="ltr"><MathText>{`$${L.labTex(lab, cur.area)}$`}</MathText></bdi></>
        )}
        {geo.collapsed && !coveredNow && <span className="ms-1 text-xs font-semibold">— {k('collapsed')}</span>}
      </li>
    </ul>

    </>
  );
  const answerNode = (
    <>
    {/* ── les deux gestes de réponse ── */}
    <div className={gameScreen ? "flex flex-col gap-2" : "flex flex-wrap items-center gap-2"}>
      <button type="button" onClick={pin} data-vanishing-pin-button {...frozen}
        className={`inline-flex min-h-[44px] items-center gap-1 rounded-xl border-2 border-emerald-500 bg-white px-3 font-bold text-emerald-800 focus:outline-none ${fr('focus-visible:ring-2 focus-visible:ring-emerald-500')}`}>
        <MapPin className="h-4 w-4" aria-hidden="true" /> {k('pin')}
      </button>
      <button type="button" onClick={claim} data-vanishing-claim {...frozen}
        className={`inline-flex min-h-[44px] items-center gap-1 rounded-xl border-2 border-slate-400 bg-white px-3 font-bold text-slate-800 focus:outline-none ${fr('focus-visible:ring-2 focus-visible:ring-slate-500')}`}>
        <ListChecks className="h-4 w-4" aria-hidden="true" /> {k('noOther')}
      </button>
    </div>
    </>
  );

  return (
    <ManipulationShell
      type="vanishing-pitch"
      title={title ?? k('title')}
      mission={(typeof mission === 'string' && gameScreen ? <MathText>{mission}</MathText> : mission) ?? k('mission')}
      lead={typeof lead === 'string' && gameScreen ? <MathText>{lead}</MathText> : lead}
      state={state}
      coach={gameScreen && coachOn ? coach : null}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      headerAction={cpSettings.control}
      // lecteur : l'écran de jeu est toujours GUIDÉ (les manches et les questions guident)
      guided={gameScreen || !!chain}
      hideRepresentation={(gameScreen && locked) || undefined}
      onIntroChange={gameScreen ? setMissionBig : undefined}
      sidePanel={trayNode ? <div data-vanishing-tray>{trayNode}</div> : null}
      // lecteur : le guide remplace les indices
      hints={gameScreen ? [] : [k('hint1'), k('hint2'), k('hint3')].map((h) => <MathText key={h}>{h}</MathText>)}
      controller={{
        autoStep: () => false,
        canAutoStep: () => false,
        // Balayer la règle, graduation après graduation : chaque position est une visite (le balayage qui justifie « لا حلول أخرى »). Épingler reste la réponse de l'élève.
        // lecteur : le balayage est caché (il montrerait chaque écrasement sans une décision)
        autoComplete: gameScreen ? undefined : {
          label: t('manipulation.autoComplete.tryAll'),
          ready: true,
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
            labRef.current = todo.reduce((acc, u) => L.move(acc, u), labRef.current);
            setLive(todo[todo.length - 1]);
            setLab((s) => todo.reduce((acc, u) => L.move(acc, u), s));
          },
        },
      }}
      representation={gameScreen ? playerRepresentation : (settled && (
        <EquationDisplay
          tone={Lin0(cur.area) ? 'ok' : 'neutral'}
          tex={`x = ${L.labTex(lab, cur.x)} \\qquad A \\times B = ${L.areaTex(lab, v)}`}
          note={<MathText>{Lin0(cur.area) ? k('readZero') : k('readNot')}</MathText>}
        />
      ))}
      discovery={gameScreen ? null : (
        <ManipulationDiscovery
          state={state}
          prompt={k('dPrompt')}
          options={discoveryOptions}
          formal={<RuleFormal lab={lab} k={k} />}
        />
      )}
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-emerald-50/70 to-white" data-dragging={stretch.dragging ? 'true' : undefined}>
        <div ref={boxRef} className="relative space-y-3" data-vanishing-pitch data-expr={expr} data-graduation={g} data-covered={isCoveredRound ? 'true' : undefined}>
          {party.node}
          {/* lecteur : la région vivante TOUJOURS montée — la colonne se démonte quand une question s'ouvre ; une clé par geste */}
          {gameScreen && (
            <div role="status" aria-live="polite" className="sr-only" data-vanishing-verdict-live>
              <span key={liveKey}>{(verdictOk || verdictBad) ? `${k(verdictOk ? 'player.cueRight' : 'player.cueRefused')} ` : ''}{verdictPlain}</span>
              {shownPreds.map((pr) => <span key={pr.key}> {pr.ok ? t('manipulation.common.cp.predict.right') : k('predict.wrong')}</span>)}
              {choiceSaid && <span key={choiceSaid}> {k('player.choiceNow')}</span>}
            </div>
          )}
          {!(gameScreen && cp.open) && cp.node}
          {!gameScreen && <LabStepper count={stepDone.length} current={Math.min(nDone, stepDone.length - 1)} done={stepDone} stepAttr="data-vp-step" />}
          {gameScreen && choices?.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5" role="group" aria-labelledby={`${uid}-choices`} data-vanishing-choices>
              <span id={`${uid}-choices`} className="text-sm font-bold text-slate-600">{k('player.choicesLabel')}</span>
              {choices.map((c) => {
                const id = choiceId(c);
                const on = sameChoice(c);
                return (
                  <button key={id} type="button" data-vanishing-choice={id} aria-disabled={locked || undefined} aria-pressed={on}
                    onClick={() => { if (!lockedRef.current && !on) { state.setNumbers({ expr: c.expr, startX: c.startX, range: c.range }); setChoiceSaid(id); } }}
                    className={`inline-flex min-h-[44px] items-center rounded-xl border-2 px-3 text-sm font-black focus:outline-none focus-visible:ring-2 ${ringP} ${on ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'border-slate-300 bg-white text-slate-700'}`}>
                    <span className="pointer-events-none"><bdi dir="ltr"><MathText>{`$${L.productTex(L.init({ expr: c.expr }))}$`}</MathText></bdi></span>
                  </button>
                );
              })}
            </div>
          )}
          {/* ── la règle de x, et la piste des solutions ── */}
          {gameScreen ? (
            <div className="flex flex-wrap items-center justify-between gap-2" data-vanishing-topbar>
              <p className="text-sm font-bold text-slate-700"><MathText>{k('ruler')}</MathText></p>
              <div className="flex items-center gap-2" dir="ltr">
                <button type="button" onClick={() => { if (v > rng.min) nudge(-1); }} aria-label={k('less')} data-vanishing-less aria-disabled={locked || v <= rng.min || undefined}
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-300 bg-white aria-disabled:opacity-40 focus:outline-none focus-visible:ring-2 ${ringP}`}><Minus className="h-5 w-5" aria-hidden="true" /></button>
                <p className="min-w-[6rem] text-center text-sm font-bold text-slate-700" dir="ltr">x = {xText}</p>
                <button type="button" onClick={() => { if (v < rng.max) nudge(1); }} aria-label={k('more')} data-vanishing-more aria-disabled={locked || v >= rng.max || undefined}
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-300 bg-white aria-disabled:opacity-40 focus:outline-none focus-visible:ring-2 ${ringP}`}><Plus className="h-5 w-5" aria-hidden="true" /></button>
              </div>
            </div>
          ) : <p className="text-sm font-bold text-slate-700"><MathText>{k('ruler')}</MathText></p>}
          <div dir="ltr" {...stretch.trackProps} ref={(el) => { stretch.trackProps.ref.current = el; rulerRef.current = el; }} className="relative"
            style={{ ...stretch.trackProps.style, height: gameScreen ? 84 : 92, ...(locked ? { pointerEvents: 'none' } : {}) }} data-vanishing-ruler>
            <svg width={width} height={gameScreen ? 84 : 92} className="absolute inset-0" aria-hidden="true" focusable="false">
              <rect x={EDGE - 4} y={26} width={steps * mu + 8} height={5} rx={2} fill="#047857" />
              {grads.map((u) => {
                const whole = u % g === 0;
                const tried = lab.visited.includes(u);
                return (
                  <g key={u}>
                    <line x1={xPx(u)} x2={xPx(u)} y1={33} y2={whole ? 42 : 37} stroke={tried ? '#0F766E' : '#64748B'} strokeWidth={whole ? 1.4 : 1} />
                    {whole && <text x={xPx(u)} y={55} textAnchor="middle" fontSize={11} fill="#334155" fontFamily="ui-monospace, monospace">{String(u / g).replace('-', '−')}</text>}
                  </g>
                );
              })}
              {/* la piste des solutions : épingles (vert) et refus (✗ rouge) */}
              <line x1={EDGE} x2={width - EDGE} y1={76} y2={76} stroke="#CBD5E1" strokeWidth={2} strokeDasharray="3 4" />
              {lab.refused.map((u) => (
                <g key={`r${u}`} data-vanishing-refused={u}>
                  <path d={`M ${xPx(u) - 5} 71 L ${xPx(u) + 5} 81 M ${xPx(u) + 5} 71 L ${xPx(u) - 5} 81`} stroke="#E11D48" strokeWidth={2.2} />
                </g>
              ))}
              {pinsHere.map((u) => (
                <g key={`p${u}`} data-vanishing-pin={u}>
                  <line x1={xPx(u)} x2={xPx(u)} y1={34} y2={70} stroke="#059669" strokeWidth={1.5} strokeDasharray="2 3" />
                  <circle cx={xPx(u)} cy={76} r={7} fill="#059669" />
                </g>
              ))}
            </svg>
            <div
              {...stretch.handleProps({ label: k('handle'), valueText: k('valueText', { x: xText }) })}
              {...frozen}
              data-vanishing-handle={gameScreen ? '' : undefined}
              className={`absolute top-0 flex h-11 w-11 -translate-x-1/2 items-start justify-center rounded-xl border-2 outline-none ${gameScreen ? `focus-visible:ring-2 ${ringP}` : 'focus-visible:ring-4 focus-visible:ring-blue-300'} ${stretch.dragging ? 'border-blue-500 bg-blue-500/10' : 'border-slate-400 bg-white/60'}`}
              style={{ left: xPx(v), cursor: stretch.dragging ? 'grabbing' : 'grab' }}
            >
              <span className="-mt-2 whitespace-nowrap rounded-full bg-slate-800 px-2 font-mono text-sm font-extrabold text-white" data-vanishing-x>{xText}</span>
            </div>
          </div>
          {!gameScreen && <p className="text-xs text-slate-500">{k('trackNote')}</p>}
          {!gameScreen && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button type="button" onClick={() => stretch.nudge(-1)} aria-label={k('less')} disabled={v <= rng.min} data-vanishing-less
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-300 bg-white disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><Minus className="h-5 w-5" aria-hidden="true" /></button>
              <p className="min-w-[6rem] text-center text-sm font-bold text-slate-700" dir="ltr">x = {xText}</p>
              <button type="button" onClick={() => stretch.nudge(1)} aria-label={k('more')} disabled={v >= rng.max} data-vanishing-more
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-300 bg-white disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><Plus className="h-5 w-5" aria-hidden="true" /></button>
            </div>
          )}

          {gameScreen ? (
            <div ref={rowRef} className="flex items-start gap-3" data-vanishing-player-row>
              <div className="min-w-0 flex-1">{fieldNode}</div>
              <div className="flex w-44 shrink-0 flex-col gap-2">{readoutNode}{answerNode}</div>
            </div>
          ) : <>{fieldNode}{readoutNode}{answerNode}</>}
          {!gameScreen && <p role="status" className="min-h-[1.5rem] text-sm font-bold" data-vanishing-verdict={last?.kind}>{verdict}</p>}
          {!gameScreen && pinsHere.length > 0 && (
            <p className="text-sm text-slate-800" data-vanishing-solutions>
              {k('solutionsOf')}{' '}<bdi dir="ltr"><MathText>{`$${productTex} = 0$`}</MathText></bdi>{' : '}
              {pinsHere.map((u, i) => (
                <React.Fragment key={u}>{i > 0 ? ` ${k('and')} ` : ''}<bdi dir="ltr"><MathText>{`$${L.labTex(lab, L.xOf(lab, u))}$`}</MathText></bdi></React.Fragment>
              ))}
              {lab.claimed && <> — {k('noOtherShort')}</>}
            </p>
          )}
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/** Le texte du verdict affiché (lecteur) — le même que la page, en chaîne MathText. */
function verdictText(last, lab, k, zeroText) {
  switch (last.kind) {
    case 'pinned': return k('vPinned', { x: L.labTex(lab, L.xOf(lab, last.v)), which: zeroText(last.zero) });
    case 'notZero': return k('vNot', { x: L.labTex(lab, L.xOf(lab, last.v)), area: L.areaTex(lab, last.v) });
    case 'already': return k('vAlready');
    case 'noX': return k('vNoX');
    case 'missing': return k('vMissing');
    case 'notSwept': return k('vNotSwept');
    case 'claimed': return k('vClaimed');
    default: return '';
  }
}

/** Une valeur de prédiction (« −1/2 », « 2 ») écrite en LaTeX : une vraie barre de fraction. */
const numTexOf = (x) => String(x).replace('−', '-').replace(/^(-?)(\d+)\/(\d+)$/, '$1\\dfrac{$2}{$3}');

const Lin0 = (p) => p.n === 0;

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite unique : l'aire du x refusé, le côté qui s'annule, le nombre de valeurs épinglées, puis LA RÈGLE. */
export const CHAIN = Object.freeze(['area', 'which', 'count', 'rule']);

const $ = (x) => `$${x}$`;
const Cq = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;

/** Le x refusé de l'élève (le premier) et le premier zéro qu'il a épinglé. */
const refusedOf = (lab) => lab.refused[0];
const pinnedOf = (lab) => lab.pins[0];

/**
 * Les mauvaises aires d'un x refusé, chacune une erreur réelle : `sum` (A + B au lieu de A × B), `abs` (le signe oublié), `diff` (A − B), `first`
 * (on lit seulement le côté A). Écartées si elles égalent la bonne aire ou une autre déjà prise.
 */
export function wrongAreas(lab) {
  const sd = L.sides(lab, refusedOf(lab));
  const cands = [
    { id: 'sum', val: Lin.add(sd.A, sd.B) },
    { id: 'abs', val: sd.area.n < 0 ? Lin.neg(sd.area) : null },
    { id: 'diff', val: Lin.sub(sd.A, sd.B) },
    { id: 'first', val: sd.A },
  ];
  const out = [];
  for (const c of cands) {
    if (!c.val || Lin.eq(c.val, sd.area) || out.some((o) => Lin.eq(o.val, c.val))) continue;
    out.push(c);
  }
  return out;
}

export const QUESTIONS = {
  area: (lab, k) => {
    const u = refusedOf(lab);
    const sd = L.sides(lab, u);
    const o = { x: L.labTex(lab, sd.x), a: $(L.labTex(lab, sd.A, true)), b: $(L.labTex(lab, sd.B, true)), calc: $(L.areaTex(lab, u)) };
    const wrong = wrongAreas(lab).slice(0, 2);
    const wrongTex = (w) => ({ ...o, got: $(L.labTex(lab, w.val)) });
    return {
      id: 'area', kind: 'choice', cols: 3,
      prompt: Cq(k, 'area.prompt', o),
      options: [
        { text: <MathText>{$(L.labTex(lab, wrong[0].val))}</MathText>, why: Cq(k, `area.why.${wrong[0].id}`, wrongTex(wrong[0])) },
        { text: <MathText>{$(L.labTex(lab, sd.area))}</MathText>, correct: true },
        { text: <MathText>{$(L.labTex(lab, wrong[1].val))}</MathText>, why: Cq(k, `area.why.${wrong[1].id}`, wrongTex(wrong[1])) },
      ],
      hints: [Cq(k, 'area.hint1', o), Cq(k, 'area.hint2', o)],
      explain: Cq(k, 'area.explain', o),
    };
  },
  which: (lab, k) => {
    const p = pinnedOf(lab);
    const sd = L.sides(lab, p);
    const zs = L.zeroSides(lab, p);
    const o = { x: L.labTex(lab, sd.x), a: $(L.labTex(lab, sd.A)), b: $(L.labTex(lab, sd.B)) };
    const sideName = (i) => k(i === 0 ? 'sideA' : 'sideB').replace(/[:：]\s*$/, '');
    if (zs.length === 2) {
      return {
        id: 'which', kind: 'choice', cols: 3,
        prompt: Cq(k, 'which.prompt', o),
        options: [
          { text: Cq(k, 'which.onlyA'), why: Cq(k, 'which.whySquare', o) },
          { text: Cq(k, 'which.both'), correct: true },
          { text: Cq(k, 'which.onlyB'), why: Cq(k, 'which.whySquare', o) },
        ],
        hints: [Cq(k, 'which.hint1', o), Cq(k, 'which.hint2', o)],
        explain: Cq(k, 'which.explainSquare', o),
      };
    }
    const z = zs[0];
    const other = L.labTex(lab, z === 0 ? sd.B : sd.A);
    const w = { ...o, side: sideName(z), other: sideName(1 - z), v: $(other) };
    return {
      id: 'which', kind: 'choice', cols: 3,
      prompt: Cq(k, 'which.prompt', o),
      options: [
        { text: <MathText>{sideName(1 - z)}</MathText>, why: Cq(k, 'which.whyOther', w) },
        { text: <MathText>{sideName(z)}</MathText>, correct: true },
        { text: Cq(k, 'which.both'), why: Cq(k, 'which.whyBoth', w) },
      ],
      hints: [Cq(k, 'which.hint1', o), Cq(k, 'which.hint2', o)],
      explain: Cq(k, 'which.explain', w),
    };
  },
  count: (lab, k) => {
    const n = lab.pins.length;
    const o = { prod: $(L.productTex(lab)), n: $(String(n)) };
    return {
      id: 'count', kind: 'number', expected: String(n), answer: <MathText>{$(String(n))}</MathText>,
      prompt: Cq(k, 'count.prompt', o), hints: [Cq(k, 'count.hint1'), Cq(k, 'count.hint2', o)],
      explain: Cq(k, lab.square ? 'count.explainSquare' : 'count.explain', o),
    };
  },
  rule: (lab, k) => ({
    id: 'rule', kind: 'choice', prompt: <MathText>{k('dPrompt')}</MathText>,
    options: discoveryOptionsOf(lab, k),
    hints: [Cq(k, 'rule.hint1'), Cq(k, 'rule.hint2', { prod: $(L.productTex(lab)) })],
    explain: <RuleFormal lab={lab} k={k} />,
  }),
};

/** Les options de la règle : la bonne, et des distracteurs réfutés par les propres essais de l'élève. */
function discoveryOptionsOf(lab, k) {
  const sideName = (i) => k(i === 0 ? 'sideA' : 'sideB');
    const opts = [{ text: <MathText>{k('dOptRight')}</MathText>, correct: true }];
    // « les deux à la fois » : une épingle où UN SEUL côté s'annule le réfute.
    const single = lab.pins.find((p) => L.zeroSides(lab, p).length === 1);
    if (single != null) {
      const sd = L.sides(lab, single);
      const z = L.zeroSides(lab, single)[0];
      opts.push({ text: <MathText>{k('dOptBoth')}</MathText>, why: <MathText>{k('dWhyBoth', { x: L.labTex(lab, sd.x), side: sideName(z), other: sideName(1 - z), v: L.labTex(lab, z === 0 ? sd.B : sd.A) })}</MathText> });
    }
    // « x = 0 » : l'aire en 0, lue.
    if (L.sides(lab, 0).area.n !== 0) {
      opts.push({ text: <MathText>{k('dOptZero')}</MathText>, why: <MathText>{k('dWhyZero', { area: L.areaTex(lab, 0) })}</MathText> });
    }
    // « un côté négatif » : un x de la règle où un seul côté est négatif.
    for (let u = lab.range.min; u <= lab.range.max; u += 1) {
      const sd = L.sides(lab, u);
      if ((sd.A.n < 0) !== (sd.B.n < 0) && sd.area.n !== 0) {
        opts.push({ text: <MathText>{k('dOptNeg')}</MathText>, why: <MathText>{k('dWhyNeg', { x: L.labTex(lab, sd.x), area: L.areaTex(lab, u) })}</MathText> });
        break;
      }
    }
    // ordre stable, la bonne réponse jamais en premier
    return [...opts.slice(1, 2), opts[0], ...opts.slice(2)].filter(Boolean);
}

/** La forme et les solutions : A × B = 0 ⇔ A = 0 أو B = 0, puis les équations du premier degré de CE produit. */
function RuleFormal({ lab, k }) {
  const equations = L.equationsOf(lab);
  const constIdx = [0, 1].find((i) => !lab.square && L.isConstant(lab, i));
  const yourCase = `${L.productTex(lab)} = 0`;
  const caseNote = (
    <span>
      {k('means')}{' '}
      {equations.map((e, i) => (
        <React.Fragment key={e.i}>{i > 0 ? ` ${k('or')} ` : ''}<bdi dir="ltr"><MathText>{`$${e.tex}$`}</MathText></bdi></React.Fragment>
      ))}
      {constIdx != null && <> <MathText>{k('becauseConst', { c: L.labTex(lab, lab.factors[constIdx].b) })}</MathText></>}
    </span>
  );
  return (
    <div className="space-y-2" data-vanishing-formal>
      <EquationDisplay tone="result" tex="A \times B = 0" note={<MathText>{k('fRule')}</MathText>} />
      <p className="text-sm text-emerald-900"><MathText>{k('fProperty')}</MathText></p>
      <EquationDisplay tone="neutral" tex={yourCase} note={caseNote} />
      <p className="text-sm text-slate-800" data-vanishing-solutions-formal>
        {k('fSolutions', { n: k('nSolutions', { count: lab.roots.length }) })}{' '}
        {lab.roots.map((r, i) => (
          <React.Fragment key={i}>{i > 0 ? ` ${k('and')} ` : ''}<bdi dir="ltr"><MathText>{`$${L.rootTex(r, lab.decimal)}$`}</MathText></bdi></React.Fragment>
        ))}
      </p>
    </div>
  );
}

/* ══════════════ Lecteur de mission : les suites des manches (rollout 2026-11-11, conseil du 2026-11-11, verdict L2) ══════════════ */

/**
 * Les suites du lecteur : chacune { id, reached(lab), qs } — l'id est le point d'étape de la manche (`{ checkpoint: id }`), posé quand la découverte du
 * labo est atteinte (tous les zéros épinglés + « لا حلول أخرى » accepté). 'build' : un côté constant → quel côté, combien vaut l'autre, BÂTIR
 * « ▢ = 0 ⇒ x = ▢ » ; sinon BÂTIR « x = ▢ أو x = ▢ » (précédé de « quel côté » sur la manche couverte) ; 'rule' : quel côté, BÂTIR « ▢ = 0 ▢ ▢ = 0 »,
 * LA RÈGLE ; 'count' : quel côté, combien de solutions.
 */
export const chainsOfPlayer = (name, lab, covered = false) => {
  if (name === 'build') {
    const hasConst = lab.factors.some((_, i) => L.isConstant(lab, i));
    return [{ id: 'build', reached: P.playerReady, qs: hasConst ? ['which', 'rest', 'buildConst'] : covered ? ['which', 'buildSol'] : ['buildSol'] }];
  }
  if (name === 'rule') return [{ id: 'rule', reached: P.playerReady, qs: ['which', 'buildOr', 'ruleP'] }];
  if (name === 'count') return [{ id: 'count', reached: P.playerReady, qs: ['which', 'countP'] }];
  return [];
};

/** Une liste qui tourne avec le terrain : la bonne pastille / le leurre ne tient jamais toujours la même place. */
const spinList = (xs, seed) => { const s0 = ((seed % xs.length) + xs.length) % xs.length; return xs.map((_, i) => xs[(i + s0) % xs.length]); };
const seedOf = (lab) => Math.abs(Math.round(lab.factors.reduce((n, f) => n + Lin.toNumber(f.a) * 7 + Lin.toNumber(f.b) * 3, 0))) + (lab.range.max - lab.range.min);
const texNode = (v) => <MathText>{`$${v}$`}</MathText>;
/** Le texte d'une clé `player.<key>` du labo (île KaTeX). */
const Pq = (k, key, o) => <MathText>{k(`player.${key}`, o)}</MathText>;
const sideLabel = (k, i) => k(i === 0 ? 'sideA' : 'sideB').replace(/[:：]\s*$/, '');

Object.assign(QUESTIONS, {
  /* côté constant — « وكم طول الضلع الآخر عند هذه القيمة ؟ » : la valeur du côté qui RESTE à la première épingle */
  rest: (lab, k) => {
    const r = P.restParts(lab);
    const z = L.zeroSides(lab, r.v)[0];
    const o = { xEq: $(`x = ${L.labTex(lab, L.xOf(lab, r.v))}`), side: sideLabel(k, z), other: sideLabel(k, 1 - z), expr: $(L.factorTex(lab, 1 - z)), val: $(r.expected) };
    return {
      id: 'rest', kind: 'fill', prompt: Pq(k, 'rest.prompt', o),
      fields: [{ label: k('player.rest.label', { other: o.other }), expected: r.expected, options: spinList(r.options, seedOf(lab)) }],
      hints: [Pq(k, 'rest.hint1', o), Pq(k, 'rest.hint2', o)], explain: Pq(k, 'rest.explain', o),
    };
  },
  /* côté constant — BÂTIR « ▢ = 0 ⇒ x = ▢ » ; UN leurre : la constante prise pour une solution */
  buildConst: (lab, k) => {
    const b = P.buildConstParts(lab);
    const prod = $(L.productTex(lab));
    const o = { prod, factor: $(b.expected[0]), sol: $(b.expected[1]), decoy: $(b.decoy) };
    return {
      id: 'buildConst', kind: 'build', prompt: Pq(k, 'buildConst.prompt', { prod }),
      slots: [k('player.buildConst.slotFactor'), k('player.buildConst.slotSol')],
      ops: ['= 0 ⇒ x ='],
      tiles: spinList([...b.expected, b.decoy], seedOf(lab)), render: texNode,
      expected: b.expected,
      hints: [Pq(k, 'buildConst.hint1', o), Pq(k, 'buildConst.hint2', o)], explain: Pq(k, 'buildConst.explain', o),
    };
  },
  /* deux côtés qui bougent — BÂTIR « ▢ = 0 ▢ ▢ = 0 » : le connecteur est une tuile de TEXTE « أو » ; UN leurre « معًا » (les deux ensemble) */
  buildOr: (lab, k) => {
    const b = P.buildOrParts(lab);
    const single = lab.pins.find((u) => L.zeroSides(lab, u).length === 1);
    const sd = L.sides(lab, single ?? lab.pins[0]);
    const z = L.zeroSides(lab, single ?? lab.pins[0])[0] ?? 0;
    const o = {
      prod: $(L.productTex(lab)), xEq: $(`x = ${L.labTex(lab, sd.x)}`), other: sideLabel(k, 1 - z), val: $(L.labTex(lab, z === 0 ? sd.B : sd.A)),
      fa: $(b.factors[0]), fb: $(b.factors[1]),
    };
    return {
      id: 'buildOr', kind: 'build', prompt: Pq(k, 'buildOr.prompt', o),
      slots: [k('player.buildOr.slotA'), k('player.buildOr.slotConn'), k('player.buildOr.slotB')],
      ops: ['= 0', ''], wrap: ['', '= 0'],
      tiles: spinList([b.factors[0], b.factors[1], { text: 'أو' }, { text: b.decoy }], seedOf(lab)), render: texNode,
      expected: b.expected, accept: b.accept,
      hints: [Pq(k, 'buildOr.hint1', o), Pq(k, 'buildOr.hint2', o)], explain: Pq(k, 'buildOr.explain', o),
    };
  },
  /* BÂTIR « x = ▢ أو x = ▢ » : les deux solutions ; UN leurre (le coefficient, ou le quotient retourné) */
  buildSol: (lab, k) => {
    const b = P.buildSolParts(lab);
    const prod = $(L.productTex(lab));
    const o = { prod, s1: $(b.expected[0]), s2: $(b.expected[1]), decoy: $(b.decoy) };
    return {
      id: 'buildSol', kind: 'build', prompt: Pq(k, 'buildSol.prompt', { eq: $(`${L.productTex(lab)} = 0`) }),
      slots: [k('player.buildSol.slotA'), k('player.buildSol.slotB')],
      ops: [<span key="or" dir="ltr"><span lang="ar">أو</span> x =</span>], wrap: ['x =', ''],
      tiles: spinList([...b.expected, b.decoy], seedOf(lab)), render: texNode,
      expected: b.expected, accept: b.accept,
      hints: [Pq(k, 'buildSol.hint1', o), Pq(k, 'buildSol.hint2', o)], explain: Pq(k, 'buildSol.explain', o),
    };
  },
  /* LA RÈGLE du lecteur : les options de la page (réfutées par SES épingles, trois au plus), une explication COURTE (une ligne : la règle, puis son cas) — la forme
     formelle de la page ne tient pas sur un écran du lecteur */
  ruleP: (lab, k) => {
    const eqs = L.equationsOf(lab);
    const page = QUESTIONS.rule(lab, k);
    return {
      ...page,
      // trois options au plus (la bonne, « معًا », « x = 0 » que la prédiction a déjà réfuté) : une carte qui tient à 1024 × 768
      options: page.options.slice(0, 3),
      explain: Pq(k, 'ruleExplain', { eq: $(`${L.productTex(lab)} = 0`), a: $(eqs[0].tex), b: $(eqs[eqs.length - 1].tex) }),
    };
  },
  /* le carré — « كم حلًّا للمعادلة ؟ » */
  countP: (lab, k) => {
    const n = lab.roots.length;
    const o = { prod: $(L.productTex(lab)), n: $(String(n)) };
    return {
      id: 'countP', kind: 'fill', prompt: Pq(k, 'countP.prompt', o),
      fields: [{ label: k('player.countP.label'), expected: String(n), options: spinList(['1', '2', '3'], seedOf(lab)) }],
      hints: [Pq(k, 'countP.hint1', o), Pq(k, 'countP.hint2', o)], explain: Pq(k, 'countP.explain', o),
    };
  },
});
