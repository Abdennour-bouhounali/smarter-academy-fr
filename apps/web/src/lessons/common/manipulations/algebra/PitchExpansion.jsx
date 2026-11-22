import React, { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Minus, Plus, CheckCircle2, Scissors } from 'lucide-react';
import { useLabCoach } from '../primitives/LabCoach';
import PredictTray from '../primitives/PredictTray';
import { useInMissionPlayer } from '../../mission/missionPlayerContext';
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
import { playSfx } from '../../utils/playEffect';
import { evaluate, reduce as reducePoly, mulTerms, samePolynomial, termsTex } from '@smarter-academy/core/arithmetic/polynomials.js';
import EquationDisplay from '../primitives/EquationDisplay';
import MathText from '../../components/MathText';
import { bidi } from '../../../../utils/bidi';
import * as L from '../logic/pitchExpansion';

/**
 * pitch-expansion — LE TERRAIN DÉCOUPÉ (unité 3 « الحساب الحرفي », leçons 1 et 2).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. L'élève ÉTIRE x (la règle : le terrain grandit), PORTE chaque zone du
 *    terrain dans « المجموع », puis POSE un terme sur un terme semblable pour
 *    les réunir. Clavier et toucher-toucher font les mêmes gestes.
 * B. Idée : l'aire d'un rectangle de côtés (a + b) et (c + d) est la somme des
 *    aires de ses zones — k(a + b) = ka + kb, (a + b)(c + d) = ac + ad + bc + bd,
 *    et les trois identités remarquables quand les côtés sont (a ± b).
 * C. Pendant l'étirement, chaque zone change de taille et d'aire ; une zone
 *    portée se grise sur le terrain et son terme s'écrit dans la somme.
 * D. « تحقّق » écrit l'égalité aire du terrain = somme portée, POUR LE x À
 *    L'ÉCRAN, ou la refuse en allumant les zones oubliées avec leur aire.
 * E. À découvrir : l'égalité tient pour TOUTES les valeurs de x (deux x
 *    vérifiés au moins) — c'est ce qui fait d'elle une identité (متطابقة).
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        développer = écrire l'aire d'un rectangle comme somme d'aires
 *   OBJECT         un terrain de football découpé par les termes de ses côtés
 *   VARIABLE       x (étiré) ; quelles zones sont portées ; quels termes réunis
 *   INVARIANT      l'aire du terrain = le produit, quel que soit x
 *   TRANSFORMATION la somme portée, terme à terme, puis réduite
 *   CONSTRAINT     on ne réunit que des termes semblables (même puissance)
 *   RESISTANCE     « x² و 3x ليسا حدّين متشابهين » ; une somme incomplète est
 *                  trop petite, et les zones oubliées s'allument (les deux
 *                  bandes ab de l'erreur (a + b)² = a² + b²)
 *   EVIDENCE       aire = somme, nombres à l'appui, pour le x à l'écran
 *   CONTRAST       deux valeurs de x vérifiées ; une somme fausse refusée
 *   PREDICTION     « combien de zones ? » : le terrain les montre avant le calcul
 *   DISCOVERY      k(a + b) = ka + kb ; (a + b)(c + d) = ac + ad + bc + bd ;
 *                  (a ± b)² = a² ± 2ab + b² ; (a + b)(a − b) = a² − b²
 *   FORMALIZATION  معارف 1 et 2 (p. 34)
 *   TRANSFER       تمارين 1–19 (p. 37–38), الحساب المتمعن فيه (21², 105 × 95)
 *
 * QUESTIONS PENDANT LE LABO (prototype `primitives/LabCheckpoint`, déploiement lot 2, 2026-10-28) : le labo n'a qu'UNE scène libre (pas de tâches
 * successives) ; quand la découverte est atteinte (zones toutes portées, somme réduite, égalité vérifiée pour deux x), une suite unique se pose
 * PAR-DESSUS le labo et retient la règle : combien de zones · l'aire du terrain pour SON x · la forme développée (les mauvaises options sont
 * les erreurs réelles : oublier des zones, ignorer le signe −, tout multiplier par un seul terme…, chacune réfutée par SES nombres) · LA RÈGLE
 * (l'ancienne découverte, qui formalise). Obligatoires pour tout élève ; l'enseignant seul les coupe pour SON compte (`checkpoints` = false
 * les coupe aussi). `onCheckpoint(ev)` : `{ tk: 'checkpoint' | 'checkpoint-done', id: expr, … }` pour la trace des étapes du module. ÉTAPES `LabStepper` (`[data-pe-step=<i>]` : porter · vérifier une fois · un autre x + questions) + fête ; « إعادة » repart de
 * zéro ; « أعِد التجربة » remet le terrain au départ. SON : `tooth` (zone portée, x bougé), `bell` (deux termes réunis), `flag` (égalité
 * vérifiée), `over` (refus, somme trop petite).
 *
 * DÉCOR (demande du propriétaire, 2026-10-01) : la pelouse, les buts et un
 * ballon qu'on peut taper. Le décor ne porte AUCUNE information : il est
 * `aria-hidden`, hors du parcours clavier, et `prefers-reduced-motion`
 * l'immobilise. Le ballon roule vers la dernière zone portée et entre dans le
 * but quand l'égalité est vérifiée — la joie du geste, jamais un verdict.
 */
/*
 * LECTEUR DE MISSION (rollout 2026-11-11, unité 3 leçon 1 `nashr-tabsit` ; conseil du 2026-11-11, verdict X1–X4, L1.1–L1.8) : joué en
 * MANCHES (LabRounds). Tout ce qui suit est gardé par `useInMissionPlayer()` ; hors lecteur (page, enseignant, mode classe, la leçon 2
 * `mutatabiqat-shahira` et la synthèse) le labo est INCHANGÉ — chaque nouvelle prop vaut par défaut le comportement d'aujourd'hui.
 *   - `labels` : 'terms' (défaut : les zones, le tableau et la somme montrent les termes littéraux) | 'area' (L1.1 : leur AIRE au x de l'écran,
 *     un nombre — négatif, hachuré et marqué ✂ pour une zone retranchée —, jamais la lettre ; les côtés gardent leurs termes ; la réunion
 *     est coupée). Une seule fonction pure, `logic › zoneText`, sert la zone, la case du tableau et la pastille. En mode 'area' la règle, ± et
 *     « تحقّق » ne s'arrêtent JAMAIS sur un x où deux zones de natures différentes ont la même aire (`logic › areaCollisions`, `playerXs`).
 *   - `start` : le x de départ (s'il est atteignable). L'auto-balayage « جرّب كل الإمكانيات » est CACHÉ (X1 : les deux x sont ceux de la main).
 *   - un ESSAI est un appui sur « تحقّق » : `onVerdict { groups: x, exact, free? }` ; le même x avec la même somme n'est pas un essai (il
 *     ré-annonce son verdict) ; le PREMIER refus d'une manche est `free` (les zones oubliées qui s'allument font partie de la découverte) ; un
 *     refus de réunion (`notLike`) est une remarque, jamais un verdict. `{ tk: 'discovered' }` une fois, `{ tk: 'reset' }` à chaque « إعادة »,
 *     `{ tk: 'retry' }` depuis « أعِد التجربة ».
 *   - `chains` : 'dist' (au 1er x juste « area » + BÂTIR k(a + b) ; à la découverte « rule »), 'double' (BÂTIR les quatre zones ; « rule »),
 *     'restored' (« corner » : la zone hachurée deux fois ; à la découverte « result »), 'result', 'distEasy' / 'doubleEasy' / 'restoredEasy'
 *     (les manches d'entraînement : la première suite seulement), 'none'. La règle du lecteur donne la RAISON géométrique (une clé `player.*`).
 *   - `predict` : [{ key, kind: 'unhatched' | 'otherX' | 'termsLeft' }] (≤ 2), avant le premier geste ; l'objet est entouré pendant la question ;
 *     la vérité est CALCULÉE (`logic › predictTruth`) et jugée par le geste qui la tranche (`judgedPredictions`).
 *   - `choices` : des terrains (manche libre). Le journal « 📋 جدول تجاربك » et le verdict sont dans la colonne ; commandes figées pendant une
 *     prédiction ou une question (`aria-disabled`) ; toujours guidé ; pas d'étapes ni de fête ; `LabCoach` (`logic › coachOf`).
 */
/*
 * LEÇON 2 `mutatabiqat-shahira` (rollout 2026-11-11 ; conseil du 2026-11-11, verdict L2.1–L2.7) — AJOUTÉ, rien de la leçon 1 ne change :
 *   - `chains` 'square' (au 1er x juste « stripFill » ; à la découverte « identityBuild » EN LETTRES puis la règle), 'squareDiff' (« cornerFill »
 *     sur les nombres de la manche ; puis l'identité), 'sumDiff' (« cancelFill » ; puis l'identité), 'coef' (à la découverte « coefBuild » en
 *     nombres) et leurs entraînements 'squareEasy' / 'squareDiffEasy' / 'sumDiffEasy' / 'coefEasy'. Pendant la suite de l'identité, les côtés du
 *     terrain et les en-têtes du tableau se RÉ-ÉTIQUETTENT a / b (L2.6).
 *   - `predict` kinds 'claim' (« مساحة الملعب x² − 25 ؟ » — la vérité : `samePolynomial`), 'twice' (le coin cross-hachuré), 'noX'.
 *   - Une réunion qui ANNULE deux termes (+bx et −bx) laisse une pastille « 0 » visible (L2.4) : la coupe se voit.
 *   - La règle du lecteur pour un carré de différence n'emploie jamais la phrase « قُطع مرّتين فيُضاف مرّة » (L2.3, `player.rule.sqDiffWhy2`).
 */
/** Lecteur : au plus PRED_MAX prédictions par manche. */
const PRED_MAX = 2;
/** Le temps pendant lequel un résultat de prédiction reste seul à l'écran avant la question de la manche. */
export const PRED_HOLD_MS = 1600;
const ringCls = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2';
/** Un nombre lisible (« −3 » avec le vrai signe moins), isolé de gauche à droite dans une phrase arabe. */
const Num = ({ v, className = '' }) => <bdi dir="ltr" className={className}>{String(v).replace('-', '−')}</bdi>;

export default function PitchExpansion({
  expr: expr0 = '3x-1|3+x', simplify = true, letter = 'x', span = 5, title, lead, mission, level, levels: withLevels = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onFinished, onTrial, onCheckpoint,
  coach: coachOn = true,
  // ── LECTEUR DE MISSION (rollout 2026-11-11) ──
  labels: labelsMode = 'terms', start, onVerdict, chains: chainsMode = 'none', predict: predictList = [], choices,
}) {
  const { t } = useTranslation('lesson');
  const gameScreen = useInMissionPlayer();
  const uid = useId();
  const journalId = `${uid}-journal`;
  const k = useCallback((key, o) => t(`manipulation.pitchExpansion.${key}`, o), [t]);
  const state = useManipulation({ type: 'pitch-expansion', initialNumbers: { expr: expr0 }, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const { expr } = state.numbers;
  // lecteur : le mode « aires » coupe la réunion (L1.1) ; hors lecteur : `labels` est ignoré (la page reste celle d'aujourd'hui)
  const labels = gameScreen ? labelsMode : 'terms';
  const simp = labels === 'area' ? false : simplify;

  const [lab, setLab] = useState(() => L.init({ expr: expr0, simplify: simp }));
  // Miroir synchrone de `lab` (« تحقّق » et l'auto-balayage lisent l'état que le geste vient de poser)
  const labRef = useRef(lab);
  labRef.current = lab;
  const sceneKey = `${expr}:${simp}:${state.epoch}:${state.resetCount}`;
  const [scene, setScene] = useState({ key: sceneKey, inits: 0 });
  // la règle de x : la page garde la sienne ; le lecteur saute chaque x à collision (mode « aires ») et part de `start`
  const xs = useMemo(() => (gameScreen ? L.playerXs({ expr, span, labels }) : null), [gameScreen, expr, span, labels]);
  const range = useMemo(() => (xs ? { min: xs[0], max: xs.at(-1) } : L.xRange(L.parseExpr(expr), span)), [xs, expr, span]);
  const x0 = () => (gameScreen ? L.startXOf({ expr, span, labels, start: expr === expr0 ? start : undefined }) : Math.min(range.min + 2, range.max));
  const [x, setX] = useState(x0);
  const [live, setLive] = useState(null);
  const [notice, setNotice] = useState(null);
  const [kick, setKick] = useState(0);
  // lecteur : les prédictions, le premier refus, la découverte annoncée, l'annonce de chaque appui
  const [preds, setPreds] = useState({});
  const asked = useRef(new Set());
  const [missionBig, setMissionBig] = useState(false);
  const refusedSeen = useRef(0);
  const discoveredSent = useRef(false);
  const heardPred = useRef(new Set());
  const [shownPreds, setShownPreds] = useState([]);
  const [predHold, setPredHold] = useState(false);
  const holdTimer = useRef(null);
  const [said, setSaid] = useState(0);   // la clé de l'annonce (région vivante) : une par appui sur « تحقّق »
  const [doneIds, setDoneIds] = useState([]);
  const [exprSaid, setExprSaid] = useState(null);
  // lecteur (leçon 2, L2.4) : les réunions qui ont ANNULÉ deux termes (+bx et −bx) — une pastille « 0 » reste visible pour chacune
  const [zeros, setZeros] = useState([]);
  const freshLab = () => L.init({ expr, simplify: simp });
  // « إعادة » (resetCount), un autre niveau ou d'autres nombres : TOUT recommence — le terrain, les essais et les questions du labo
  if (scene.key !== sceneKey) {
    setScene({ key: sceneKey, inits: scene.inits + 1 }); setLab(freshLab()); setX(x0()); setLive(null); setNotice(null);
    setPreds({}); asked.current = new Set(); refusedSeen.current = 0; discoveredSent.current = false;
    heardPred.current = new Set(); setShownPreds([]); setPredHold(false); setDoneIds([]); setZeros([]);
  }
  // la manche (LabRounds) repart de zéro avec la scène : ses essais et prédictions d'avant ne comptent plus
  useEffect(() => { if (gameScreen && scene.inits > 0) state.report(onTrial, { tk: 'reset' }); }, [scene.inits]); // eslint-disable-line react-hooks/exhaustive-deps

  const ready = L.discoveryReady(lab);
  // les questions pendant le labo : une suite unique quand la découverte est atteinte ; celle qui finit par la règle remplace la découverte automatique
  const cpSettings = useLabCheckpointSettings('pitch-expansion');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  // lecteur : les buts des manches SONT ses questions — l'interrupteur de l'enseignant ne les coupe pas (sinon la manche ne se gagne jamais)
  const cpLive = cpOn && (gameScreen || cpSettings.enabled);
  // ── le lecteur : les suites de la manche (CHAINS_PLAYER), chacune posée quand ce qu'elle interroge est là ──
  const playerChains = gameScreen ? chainsOfPlayer(chainsMode) : [];
  const lastChain = playerChains.at(-1);
  const finalReached = !!lastChain && lastChain.reached(lab);
  const judgedPreds = gameScreen ? L.judgedPredictions(lab, predictList.filter((p) => p.key in preds), finalReached) : [];
  const pendingPreds = judgedPreds.filter((key) => !heardPred.current.has(key));
  const holdChain = pendingPreds.length > 0 || predHold;
  const playerPending = cpLive && !holdChain ? playerChains.find((c) => c.reached(lab) && !doneIds.includes(c.id)) ?? null : null;
  const chain = gameScreen ? playerPending?.qs ?? null : (cpLive ? CHAIN : null);
  const cpId = gameScreen ? playerPending?.id ?? null : (chain ? expr : null);
  const cp = useLabCheckpoint({
    id: chain ? cpId : null,
    // lecteur : une option par ligne (la colonne est étroite — trois développements côte à côte se chevauchaient)
    questions: chain && (gameScreen || ready) ? chain.map((q) => { const qq = QUESTIONS[q](lab, k, letter); return gameScreen && qq.kind === 'choice' ? { ...qq, cols: 1 } : qq; }) : null,
    reached: gameScreen ? !!playerPending : ready,
    resetKey: scene.inits,
    onRetry: () => {
      const fresh = freshLab();
      labRef.current = fresh; setLab(fresh); setX(x0()); setLive(null); setNotice(null); setZeros([]);
      if (gameScreen) {
        // lecteur : la tâche repart de zéro ; la manche oublie ce que le labo vient de défaire, le 1er refus redevient gratuit
        refusedSeen.current = 0; discoveredSent.current = false;
        state.report(onTrial, { tk: 'retry' });
      }
    },
    // page : {tk:'checkpoint'|'checkpoint-done', id: expr, …} — la TRACE que les étapes du module relisent ; lecteur : la manche les lit aussi
    onEvent: (ev) => { state.report(onCheckpoint, ev); if (gameScreen) state.report(onTrial, ev); },
    onDone: (id) => {
      if (!gameScreen) { state.discover(); state.formalize(); return; }
      setDoneIds((d) => (d.includes(id) ? d : [...d, id]));
      if ((playerChains.find((c) => c.id === id)?.qs ?? []).some((q) => q === 'rulePlayer' || q === 'result')) { state.discover(); state.formalize(); }
    },
  });
  useEffect(() => { if (ready && !cpLive && !gameScreen) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (state.isFormal) state.report(onFinished, expr); }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps

  // une étape est FAITE quand son objectif est atteint ET (la dernière) ses questions répondues : la pastille passe au vert et on fête
  const nVerified = L.verifiedXs(lab).length;
  const stepDone = [L.sumReady(lab), L.sumReady(lab) && nVerified >= 1, ready && !cp.blocking];
  const nDone = stepDone.findIndex((d) => !d) < 0 ? stepDone.length : stepDone.findIndex((d) => !d);
  const party = useStepCelebration();
  const celebrated = useRef({ n: 0, inits: scene.inits });
  if (celebrated.current.inits !== scene.inits) celebrated.current = { n: 0, inits: scene.inits };   // « إعادة » : on refête
  useEffect(() => {
    if (gameScreen) return;   // lecteur : pas d'étapes, pas de fête (les manches ont leur carte)
    if (nDone <= celebrated.current.n) return;
    celebrated.current.n = nDone;
    party.celebrate({ n: nDone, total: stepDone.length });
  }, [nDone]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── lecteur : la PRÉDICTION, avant le premier geste ── */
  const predQueue = gameScreen ? predictList.slice(0, PRED_MAX) : [];
  const nextPred = predQueue.find((p) => !asked.current.has(p.key)) ?? null;
  const untouched = lab.collected.length === 0 && lab.trials.length === 0;
  const predictOpen = gameScreen && cpLive && !cp.open && !missionBig && untouched && nextPred != null;
  const locked = gameScreen && (cp.open || predictOpen);
  const lockedRef = useRef(false);
  lockedRef.current = locked;
  const sayPredict = (says) => {
    const p = nextPred;
    if (!p || asked.current.has(p.key)) return;
    const ok = says === L.predictTruth(labRef.current, p.kind, p);
    asked.current.add(p.key);
    playSfx('pop');
    setPreds((m) => ({ ...m, [p.key]: ok }));
    state.report(onTrial, { tk: 'predict', ok });
    if (!predQueue.some((q) => q.key !== p.key && !asked.current.has(q.key))) {
      setTimeout(() => boxRef.current?.querySelector('[data-pitch-field] button:not([disabled]):not([tabindex="-1"])')?.focus(), 60);
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
  const quiet = gameScreen && cp.open;
  // le son du geste (muet sans « الصوت ») : zone portée, x bougé (au plus un toutes les 35 ms) ; deux termes réunis ; l'égalité vérifiée ; un refus
  const heard = useRef({ at: 0, x: null });
  const tick = () => { const now = Date.now(); if (now - heard.current.at > 35) { playSfx('tooth'); heard.current.at = now; } };

  /* ── mesure ── */
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
    if (!gameScreen) return;
    const el = boxRef.current;
    if (el) { const w = Math.max(260, Math.floor(el.clientWidth)); setWidth((cur) => (cur === w ? cur : w)); }
  });

  /* ── la règle de x ── */
  const EDGE = 22;
  const steps = Math.max(1, range.max - range.min);
  const mu = (width - 2 * EDGE) / steps;
  const xOf = (v) => EDGE + (v - range.min) * mu;
  const toValue = useCallback((clientX, _y, rect) => range.min + (clientX - rect.left - EDGE) / mu, [range.min, mu]);
  // lecteur : la règle saute les x à collision (mode « aires »), dans le sens du geste ; figée pendant une prédiction ou une question
  // (revue 2026-11-11) : au doigt, une valeur à collision est à égale distance de ses deux voisines — elle GARDE la valeur montrée (sinon la
  // poignée clignotait entre les deux) ; au clavier / ± elle saute dans le sens du pas. Le relâchement valide la valeur MONTRÉE, jamais la brute.
  const shownRef = useRef(x);
  shownRef.current = live ?? x;
  const draggingRef = useRef(false);
  const snap = (v) => {
    if (!xs || xs.includes(v)) return v;
    const cur = shownRef.current;
    const lo = [...xs].reverse().find((u) => u < v); const hi = xs.find((u) => u > v);
    if (draggingRef.current && (cur === lo || cur === hi) && lo != null && hi != null && v - lo === hi - v) return cur;
    return L.snapX(xs, v, Math.sign(v - cur) || 1);
  };
  const stretch = useStretchInteraction({
    value: live ?? x, range, toValue,
    onChange: (v) => { if (lockedRef.current) return; const s = snap(v); shownRef.current = s; setLive(s); },
    onCommit: (v) => { setLive(null); if (lockedRef.current) return; setX(xs && !xs.includes(v) ? shownRef.current : v); setNotice(null); },
    direction: 'ltr',
  });
  draggingRef.current = stretch.dragging;
  const xx = live ?? x;
  useEffect(() => { if (heard.current.x !== null && heard.current.x !== xx) tick(); heard.current.x = xx; }, [xx]); // eslint-disable-line react-hooks/exhaustive-deps
  const nudge = (d) => { if (lockedRef.current) return; if (d < 0 ? xx <= range.min : xx >= range.max) return; stretch.nudge(d); };

  /* ── lecteur (leçon 2, L2.6) : pendant la suite de l'IDENTITÉ, les côtés s'appellent a et b ── */
  const relabel = gameScreen && cp.open && !!playerPending?.qs.includes('identityBuild');
  // a = le premier terme du binôme, b = la valeur absolue du second (`logic › binomialOf`), −b quand il est retranché (revue a11y 2026-11-11)
  const sideName = (term) => {
    const [t1] = lab.factors[0];
    if (term.c === t1.c && term.p === t1.p) return 'a';
    return term.c < 0 ? '−b' : 'b';
  };

  /* ── le terrain ── */
  // lecteur : le terrain est toujours dessiné EN LARGEUR (3(x + 5) était une colonne étroite de 3 sur 14) — zones et côtés transposés ; la page
  // garde son dessin
  const flipOf = (g) => ({ width: g.height, height: g.width, zones: g.zones.map((z) => ({ ...z, x0: z.y0, y0: z.x0, w: z.h, h: z.w })) });
  const geoMaxRaw = L.zones(lab, range.max);  // le terrain est dessiné dans la boîte du plus grand x de la règle
  const flip = gameScreen && geoMaxRaw.height > geoMaxRaw.width;
  const geo = flip ? flipOf(L.zones(lab, xx)) : L.zones(lab, xx);
  const geoMax = flip ? flipOf(geoMaxRaw) : geoMaxRaw;
  // les étiquettes des côtés : en haut le premier facteur, à gauche le second (échangés quand le terrain est transposé)
  const topSide = (z) => (flip ? z.i === 0 : z.j === 0);
  const leftSide = (z) => (flip ? z.j === 0 : z.i === 0);
  const topTerm = (z) => (flip ? lab.factors[1][z.j] : lab.factors[0][z.i]);
  const leftTerm = (z) => (flip ? lab.factors[0][z.i] : lab.factors[1][z.j]);
  // (synthèse de l'unité 3, 2026-11-12) : le terrain « x+a+x » a un tableau de Descartes 3 × 3 — le terrain y est aussi plus bas
  const unit = Math.min(34, (width - 56) / Math.max(1, geoMax.width), (gameScreen ? ((choices?.length || String(chainsMode).startsWith('ring')) ? 130 : 170) : 300) / Math.max(1, geoMax.height));
  // (leçon 2, 2026-11-11) : la ورشة libre ajoute sa rangée de choix — le terrain y est plus bas (1024 × 768 : un écran, sans défilement)
  const PAD = 26;
  // lecteur : le labo est monté dans une copie cachée puis déplacé — des ids de motif UNIQUES (sinon la hachure, repère non coloré, disparaît)
  const pid = gameScreen ? uid.replace(/[^a-zA-Z0-9]/g, '') : '';
  const hatchId = `pe-hatch${pid}`; const crossId = `pe-cross${pid}`;
  const W = geo.width * unit; const H = geo.height * unit;
  const svgW = geoMax.width * unit + 2 * PAD; const svgH = geoMax.height * unit + 2 * PAD;
  const lastTrial = lab.trials.find((tr) => tr.x === x);
  // lecteur : seules les zones ENCORE à porter s'allument (une zone portée depuis le refus ne brille plus)
  const glow = lastTrial && !lastTrial.ok && !live ? new Set(gameScreen ? lastTrial.missing.filter((id) => !lab.collected.includes(id)) : lastTrial.missing) : new Set();

  /* ── les gestes : porter une zone, réunir deux termes ── */
  const onReject = (_s, _z, reason) => { setNotice(reason ? { tone: 'ko', key: reason } : null); if (reason) playSfx('over'); };
  const drag = useDragInteraction({
    accepts: (src, zone) => {
      if (lockedRef.current) return '';
      if (src.startsWith('z:') && zone === 'sum') { const v = L.canCollect(lab, src.slice(2)); return v === true ? true : v; }
      if (src.startsWith('c:') && zone.startsWith('chip:')) { const v = L.canMerge(lab, src.slice(2), zone.slice(5)); return v === true ? true : v; }
      return '';
    },
    onDrop: (src, zone) => {
      if (lockedRef.current) return;
      if (src.startsWith('z:')) { setLab((s) => L.collect(s, src.slice(2))); setKick((n) => n + 1); tick(); }
      else if (src.startsWith('c:')) {
        // (revue 2026-11-11) : l'état que le geste vient de poser (labRef), jamais l'instantané du rendu
        const tr = labRef.current.tray;
        const a = tr.find((c) => c.id === src.slice(2)); const b = tr.find((c) => c.id === zone.slice(5));
        if (gameScreen && a && b && a.term.c + b.term.c === 0) setZeros((z) => [...z, `${a.id}+${b.id}`]);
        setLab((s) => L.merge(s, src.slice(2), zone.slice(5))); playSfx('bell');
      }
      setNotice(null);
    },
    onReject,
  });

  /**
   * Toucher (ou Entrée sur) un terme de la somme PENDANT qu'on tient autre chose,
   * c'est poser ce qu'on tient : sur ce terme s'il s'agit d'un terme (réunir), dans
   * la somme s'il s'agit d'une zone. Sans cela, la cible — un bouton porté lui
   * aussi — devenait le nouvel objet tenu, et la fusion n'était possible qu'au
   * glisser (ni au toucher, ni au clavier).
   */
  const chipTarget = (chipId) => {
    const held = drag.held;
    if (!held || drag.dragging || held === `c:${chipId}`) return null;
    if (held.startsWith('c:')) return `chip:${chipId}`;
    if (held.startsWith('z:')) return 'sum';
    return null;
  };
  const interceptChip = (chipId) => {
    const stop = (e) => { if (chipTarget(chipId)) { e.stopPropagation(); e.preventDefault(); } };
    return {
      onPointerDownCapture: stop,
      onPointerUpCapture: stop,
      onClickCapture: (e) => { const z = chipTarget(chipId); if (z) { e.stopPropagation(); e.preventDefault(); drag.dropHere(z); } },
      onKeyDownCapture: (e) => {
        const z = chipTarget(chipId);
        if (z && (e.key === 'Enter' || e.key === ' ')) { e.stopPropagation(); e.preventDefault(); drag.dropHere(z); }
      },
    };
  };

  // « جرّب كل الإمكانيات » (page seulement) : chaque x de la règle est vérifié comme par « تحقّق ».
  const sweepX = (v) => {
    const next = L.verify(labRef.current, v);
    labRef.current = next;
    setLab((s) => L.verify(s, v));
    setX(v); setLive(null);
    const trial = next.trials.find((tr) => tr.x === v);
    state.report(onTrial, trial);
    playSfx(trial.ok ? 'flag' : 'over');
    setNotice({ tone: trial.ok ? 'ok' : 'ko', key: trial.ok ? 'verified' : 'incomplete', trial });
  };
  const untriedX = L.untriedXs(lab, range);

  const canCheck = lab.tray.length > 0 && live == null && !locked;
  const check = () => {
    if (!gameScreen) {
      const next = L.verify(lab, x);
      setLab(next);
      const trial = next.trials.find((tr) => tr.x === x);
      state.report(onTrial, trial);
      playSfx(trial.ok ? 'flag' : 'over');
      setNotice({ tone: trial.ok ? 'ok' : 'ko', key: trial.ok ? 'verified' : 'incomplete', trial });
      return;
    }
    // lecteur : UN appui = un essai ; aria-disabled (pas disabled) — le bouton se garde lui-même
    const prev = labRef.current;
    if (lockedRef.current || live != null) return;
    if (!prev.tray.length) { setNotice({ tone: 'ko', key: 'emptySum' }); return; }
    const again = L.sameTrial(prev, x);
    const next = again ? prev : L.verify(prev, x);
    const trial = next.trials.find((tr) => tr.x === x);
    if (!again) {
      labRef.current = next; setLab(next);
      state.report(onTrial, trial);
      const v = L.verdictOf(trial);
      const free = !v.exact && refusedSeen.current === 0;
      if (!v.exact) refusedSeen.current += 1;
      state.report(onVerdict, { ...v, ...(free ? { free: true } : {}) });
      if (L.playerDiscovery(next) && !discoveredSent.current) { discoveredSent.current = true; state.report(onTrial, { tk: 'discovered' }); }
    }
    // le même x avec la même somme : rien n'est compté, le verdict est RÉ-ANNONCÉ
    playSfx(trial.ok ? 'flag' : 'over');
    setNotice({ tone: trial.ok ? 'ok' : 'ko', key: trial.ok ? 'verified' : 'incomplete', trial, again });
    setSaid((n) => n + 1);
  };

  const tex = (term) => `$${L.cellTex({ term }, letter)}$`;
  const valueOf = (term) => term.c * xx ** term.p;
  const productTex = L.productTex(lab, letter);
  const sumTex = L.trayTex(lab, letter);
  const reasonText = (key) => (key === 'notLike' ? k('notLike') : key === 'already' ? k('already') : key === 'notYet' ? k('notYet') : key === 'emptySum' ? k('player.emptySum') : null);
  const area = labels === 'area';
  // ce qu'une zone MONTRE (zone, case, pastille) : une seule source, `logic › zoneText`
  const shown = (term) => L.zoneText(term, xx, labels, letter);
  const say = (s) => String(s).replace(/\^2/g, '²').replace(/-/g, '−');
  // lecteur : le nom d'une zone dit aussi ce que la hachure et l'allumage montrent (مقتطعة / مقتطعة مرّتين / لم تُحمل بعد — revue a11y 2026-11-11)
  const cutOf = (id) => { const c = lab.cells.find((u) => u.id === id); if (!c) return ''; const n = (lab.factors[0][c.i].c < 0) + (lab.factors[1][c.j].c < 0); return n === 2 ? 'cutTwice' : n === 1 ? 'cut' : ''; };
  const zoneAria = (term, value, id) => {
    if (!gameScreen) return k('zoneLabel', { term: L.cellTex({ term }, letter), area: L.valueText(value) });
    const z = shown(term);
    const base = area
      ? (z.removed ? k('player.zoneRemoved', { v: say(z.tex), abs: Math.abs(z.value) }) : k('player.zoneArea', { v: z.tex }))
      : k('player.zoneTerm', { term: say(z.tex), area: say(L.valueText(value)) });
    const cut = cutOf(id);
    const extra = [cut && !(area && z.removed) ? k(`player.${cut}`) : '', glow.has(id) ? k('player.notCarried') : ''].filter(Boolean).join('، ');
    return extra ? `${base} (${extra})` : base;
  };
  const chipAria = (term) => {
    if (!gameScreen) return k('chipLabel', { term: L.cellTex({ term }, letter) });
    const z = shown(term);
    return area ? k('player.chipArea', { v: say(z.tex) }) : k('player.chipTerm', { term: say(z.tex) });
  };
  /** Le contenu visible d'une zone / d'une case / d'une pastille en mode « aires » : le nombre, et ✂ pour une zone retranchée. */
  const areaNode = (term, cls = '') => {
    const z = shown(term);
    return (
      <span className={`inline-flex items-center gap-0.5 ${cls}`} data-zone-area={z.value}>
        {z.removed && <Scissors className="h-3.5 w-3.5 shrink-0 text-rose-700" aria-hidden="true" />}
        <Num v={z.tex} className="font-mono" />
      </span>
    );
  };

  const discoveryKind = lab.kind;
  const kindKey = { distributive: 'dist', double: 'double', 'square-sum': 'sqSum', 'square-diff': 'sqDiff', 'sum-diff': 'sumDiff' }[discoveryKind];

  const ballZone = lab.collected.length ? geo.zones.find((z) => z.id === lab.collected.at(-1)) : null;
  const scored = lastTrial?.ok && !live;
  const ball = scored
    ? { cx: PAD + W + 10, cy: PAD + H / 2 }
    : ballZone ? { cx: PAD + (ballZone.x0 + ballZone.w / 2) * unit, cy: PAD + (ballZone.y0 + ballZone.h / 2) * unit + 12 }
      : { cx: PAD + W / 2 + ((kick % 3) - 1) * 14, cy: PAD + H / 2 };

  /* ── lecteur : le guide (LabCoach) — le geste, jamais la réponse ── */
  const coachDone = playerChains.length ? doneIds.includes(lastChain.id) : L.playerDiscovery(lab);
  const coachRaw = gameScreen && coachOn && !locked && !cp.open && live == null ? L.coachOf(lab, { x, done: coachDone }) : null;
  // un objet STABLE par étape (son id et sa cible) : LabCoach ne se réabonne pas à chaque mouvement de la règle
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const coachStep = useMemo(() => coachRaw, [coachRaw?.id, coachRaw?.target]);
  const coach = useLabCoach({
    lab: 'pitch-expansion', step: coachStep, text: coachStep ? k(`coach.${coachStep.id}`) : '',
    labels: { hide: t('manipulation.common.coach.hide'), show: t('manipulation.common.coach.show'), ok: t('manipulation.common.coach.ok'), stop: t('manipulation.common.coach.stop') },
  });

  /* ── lecteur : le verdict DÉRIVÉ de l'essai au x de l'écran (et de la somme d'aujourd'hui), jamais d'un instantané ── */
  const shownTrial = gameScreen && !live && lastTrial && lastTrial.sig === L.trayKey(lab) ? lastTrial : null;
  const ringKind = predictOpen ? nextPred.kind : null;
  const plainIds = gameScreen ? new Set(L.unhatchedIds(lab)) : new Set();
  // leçon 2 : « twice » entoure le coin cross-hachuré, « noX » les deux zones en x, « claim » tout le terrain
  const ringIds = ringKind === 'twice' ? new Set([L.restoredCell(lab)?.id].filter(Boolean))
    : ringKind === 'noX' ? new Set(lab.cells.filter((c) => c.term.p === 1).map((c) => c.id))
      : ringKind === 'unhatched' ? plainIds : new Set();
  const predRing = 'rounded-2xl ring-4 ring-amber-700 ring-offset-2';
  const predPromptOf = (p) => (p.kind === 'claim' ? <MathText>{k('pred.claim', { claim: `$${termsTex(L.parsePoly(p.claim))}$` })}</MathText>
    : p.kind === 'twice' ? <MathText>{k('pred.twice', { v: `$${L.restoredCell(lab)?.term.c ?? ''}$` })}</MathText>
      : p.kind === 'noX' ? <MathText>{k('pred.noX')}</MathText> : k(`pred.${p.kind}`));
  const predOptions = (p) => L.predictOptions(lab, p.kind).map((o) => ({ says: o, text: o === 'yes' ? k('pred.yes') : o === 'no' ? k('pred.no') : o }));
  const trayNode = !gameScreen ? null : predictOpen ? (
    <PredictTray attr="pe" key={nextPred.key} step={predQueue.indexOf(nextPred) + 1} of={predQueue.length}
      title={t('manipulation.common.cp.predict.title')} prompt={predPromptOf(nextPred)} options={predOptions(nextPred)} onSay={sayPredict} />
  ) : cp.open ? cp.node : null;
  const verdictLine = (tr) => (tr.ok ? k('player.ok') : k('player.incomplete', { n: tr.missing.length }));
  const journal = lab.trials.slice(-5);
  const playerRepresentation = gameScreen && !quiet && (
    <div className="space-y-2" data-pe-player-col>
      {/* le texte VISIBLE du verdict ; l'annonce passe par la région vivante toujours montée de la scène (`data-pe-verdict-live`) */}
      <div data-pe-verdict-box>
        {shownTrial ? (
          <div key={`v${said}`} className={`rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-sm font-bold leading-snug ${shownTrial.ok ? 'text-emerald-800' : 'text-rose-800'}`} data-pe-verdict={shownTrial.ok ? 'ok' : 'incomplete'}>
            <p><span aria-hidden="true">{shownTrial.ok ? '✓ ' : '✗ '}</span>{verdictLine(shownTrial)}</p>
            <p className="mt-1 text-slate-700">
              <span>{k('player.pitchArea')}</span> <Num v={shownTrial.product} className="font-mono font-black" />
              <span aria-hidden="true"> · </span>
              <span>{k('player.sumArea')}</span> <Num v={shownTrial.sum} className="font-mono font-black" />
            </p>
            {notice?.again && <p className="mt-1 text-xs font-semibold text-slate-600">{k('player.again')}</p>}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white/70 px-3 py-2 text-center text-sm font-bold text-slate-600" data-pe-verdict="">{k('player.waiting')}</p>
        )}
        {shownPreds.map((pr) => (
          <p key={pr.key} data-pe-predict-result={pr.ok ? 'ok' : 'wrong'} data-pe-predict-key={pr.key}
            className={`mt-2 rounded-2xl px-4 py-2 text-center text-lg font-black ${pr.ok ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
            {pr.ok ? t('manipulation.common.cp.predict.right') : k('pred.wrong')}
          </p>
        ))}
      </div>
      {journal.length > 0 && !state.isFormal && (
        <div data-pe-journal>
          <p id={journalId} className="text-sm font-black text-indigo-900"><span aria-hidden="true">📋 </span>{k('player.journal')}</p>
          <table className="mt-1 w-full table-fixed text-center text-xs" dir="ltr" aria-labelledby={journalId}>
            <thead>
              <tr className="bg-slate-50">
                <th scope="col" className="font-mono">{letter}</th>
                <th scope="col">{k('player.colPitch')}</th>
                <th scope="col">{k('player.colSum')}</th>
                <th scope="col"><span aria-hidden="true">✓ / ✗</span><span className="sr-only">{k('player.colWord')}</span></th>
              </tr>
            </thead>
            <tbody>
              {journal.map((tr) => (
                <tr key={`${tr.x}|${tr.sig}`} data-pe-row={tr.ok ? 'ok' : 'incomplete'}>
                  <td className="border border-slate-200 font-mono"><Num v={tr.x} /></td>
                  <td className="border border-slate-200 font-mono"><Num v={tr.product} /></td>
                  <td className="border border-slate-200 font-mono"><Num v={tr.sum} /></td>
                  <td className={`border border-slate-200 font-black ${tr.ok ? 'text-emerald-800' : 'text-rose-800'}`}>
                    <span aria-hidden="true">{tr.ok ? '✓' : '✗'}</span><span className="sr-only">{k(tr.ok ? 'player.rowOk' : 'player.rowIncomplete')}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <ManipulationShell
      type="pitch-expansion"
      title={bidi(title ?? k('title'))}
      // lecteur : les textes des manches écrivent leurs lettres et leurs nombres en $…$ (jamais « x » nu dans une phrase arabe) ; la page garde bidi
      mission={gameScreen && typeof mission === 'string' ? <MathText>{mission}</MathText> : (mission ?? k(`mission_${kindKey}`))}
      lead={typeof lead === 'string' ? (gameScreen ? <MathText>{lead}</MathText> : bidi(lead)) : lead}
      state={state}
      coach={gameScreen && coachOn ? coach : null}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      headerAction={cpSettings.control}
      // lecteur : l'écran de jeu est toujours GUIDÉ (les manches et les questions guident)
      guided={!!chain || gameScreen}
      hideRepresentation={(gameScreen && locked) || undefined}
      onIntroChange={gameScreen ? setMissionBig : undefined}
      sidePanel={trayNode ? <div data-pe-tray>{trayNode}</div> : null}
      hints={[k('hint1'), k(simp ? 'hint2' : 'hint2NoMerge'), k('hint3')].map((h) => <MathText key={h}>{h}</MathText>)}
      controller={{
        autoStep: () => false,
        canAutoStep: () => false,
        // X1 : dans le lecteur, aucun auto-balayage — les deux valeurs de x sont celles de la main
        autoComplete: !gameScreen && L.sumReady(lab) ? {
          label: t('manipulation.autoComplete.tryAll'),
          ready: true,
          remaining: untriedX.length,
          intervalMs: 480,
          maxTicks: 80,
          step: () => { const v = L.untriedXs(labRef.current, range)[0]; if (v !== undefined) sweepX(v); },
          finish: () => { L.untriedXs(labRef.current, range).forEach(sweepX); },
        } : undefined,
      }}
      representation={gameScreen ? playerRepresentation : (notice?.trial && (notice.trial.ok
        ? <EquationDisplay tone="ok" tex={`${productTex} = ${sumTex}`} note={<MathText>{k('verifiedNote', { x: notice.trial.x, product: L.valueText(notice.trial.product), sum: L.valueText(notice.trial.sum) })}</MathText>} />
        : <EquationDisplay tone="ko" tex={`${L.valueText(notice.trial.sum)} \\neq ${L.valueText(notice.trial.product)}`} note={<MathText>{k(notice.trial.missing.length ? 'incompleteNote' : 'wrongNote', { x: notice.trial.x, n: notice.trial.missing.length })}</MathText>} />))}
      // lecteur : la règle est la DERNIÈRE question de la manche — pas de panneau de découverte en plus (ni ses options recalculées)
      discovery={gameScreen ? null : (
        <ManipulationDiscovery
          state={state}
          prompt={k(`${kindKey}Prompt`)}
          options={discoveryOptions(lab, k)}
          formal={<Formal lab={lab} k={k} letter={letter} />}
        />
      )}
      explanation={<MathText>{k(gameScreen && L.isIdentityKind(lab) ? 'player.explanationIdentity' : 'explanation')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-emerald-50/70 to-white" data-dragging={stretch.dragging || drag.dragging ? 'true' : undefined}>
        <div ref={boxRef} className={`relative ${gameScreen ? 'space-y-2' : 'space-y-3'}`} data-pitch-expansion data-kind={lab.kind} data-labels={gameScreen ? labels : undefined}>
          {party.node}
          {/* lecteur : la région vivante TOUJOURS montée — la colonne se démonte quand une question s'ouvre, l'annonce ne doit pas partir avec elle */}
          {gameScreen && (
            <div role="status" aria-live="polite" className="sr-only" data-pe-verdict-live>
              {shownTrial && <span key={`v${said}`}>{verdictLine(shownTrial)} {k('player.pitchArea')} <Num v={shownTrial.product} /> ، {k('player.sumArea')} <Num v={shownTrial.sum} />{notice?.again ? ` ${k('player.again')}` : ''}</span>}
              {shownPreds.map((pr) => <span key={pr.key}> {pr.ok ? t('manipulation.common.cp.predict.right') : k('pred.wrong')}</span>)}
              {exprSaid && <span key={exprSaid}> {k('player.choiceNow')}</span>}
            </div>
          )}
          {!(gameScreen && cp.open) && cp.node}
          {!gameScreen && <LabStepper count={stepDone.length} current={Math.min(nDone, stepDone.length - 1)} done={stepDone} stepAttr="data-pe-step" />}
          {gameScreen && choices?.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5" role="group" aria-labelledby={`${uid}-choices`} data-pe-choices>
              <span id={`${uid}-choices`} className="text-sm font-bold text-slate-600">{k('player.choicesLabel')}</span>
              {choices.map((c) => {
                const on = c === expr;
                const ctex = L.productTex(L.init({ expr: c }), letter);
                return (
                  <button key={c} type="button" data-pe-choice={c} aria-disabled={locked || undefined} aria-pressed={on}
                    onClick={() => { if (!lockedRef.current && !on) { state.setNumbers({ ...state.numbers, expr: c }); setExprSaid(c); } }}
                    className={`min-h-[44px] rounded-xl border-2 px-3 text-sm font-black ${ringCls} ${on ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'border-slate-300 bg-white text-slate-700'}`}>
                    <span className="pointer-events-none"><MathText>{`$${ctex}$`}</MathText></span>
                  </button>
                );
              })}
            </div>
          )}
          {/* ── la règle de x ── */}
          <p className="text-sm font-bold text-slate-700"><MathText>{k('ruler', { letter: gameScreen ? `$${letter}$` : letter })}</MathText></p>
          <div dir="ltr" {...stretch.trackProps} className={`relative ${ringKind === 'otherX' ? predRing : ''}`} style={{ ...stretch.trackProps.style, height: 60, ...(locked ? { pointerEvents: 'none' } : {}) }} data-pitch-ruler data-pred-ring={ringKind === 'otherX' ? 'true' : undefined}>
            <svg width={width} height={60} className="absolute inset-0" aria-hidden="true" focusable="false">
              <rect x={EDGE - 4} y={26} width={steps * mu + 8} height={5} rx={2} fill="#047857" />
              {Array.from({ length: range.max - range.min + 1 }, (_, i) => range.min + i).filter((v) => !xs || xs.includes(v)).map((v) => {
                const tr = lab.trials.find((u) => u.x === v);
                return (
                  <g key={v}>
                    <line x1={xOf(v)} x2={xOf(v)} y1={33} y2={41} stroke="#64748B" />
                    <text x={xOf(v)} y={55} textAnchor="middle" fontSize={11} fill={tr ? (tr.ok ? '#047857' : '#BE123C') : '#334155'} fontWeight={tr ? 'bold' : 'normal'} fontFamily="ui-monospace, monospace">{v}</text>
                  </g>
                );
              })}
            </svg>
            <div
              {...stretch.handleProps({ label: k('handle', { letter }), valueText: k('valueText', { letter, x: xx }) })}
              aria-disabled={locked || undefined}
              data-pitch-handle
              className={`absolute top-0 flex h-11 w-11 -translate-x-1/2 items-start justify-center rounded-xl border-2 outline-none focus-visible:ring-4 ${gameScreen ? 'focus-visible:ring-indigo-600 focus-visible:ring-offset-2' : 'focus-visible:ring-blue-300'} ${stretch.dragging ? 'border-blue-500 bg-blue-500/10' : 'border-slate-400 bg-white/60'}`}
              style={{ left: xOf(xx), cursor: stretch.dragging ? 'grabbing' : 'grab' }}
            >
              <span className="-mt-2 rounded-full bg-slate-800 px-2 font-mono text-sm font-extrabold text-white" data-pitch-x>{xx}</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2">
            {gameScreen ? (
              <>
                <button type="button" onClick={() => nudge(-1)} aria-label={k('smaller', { letter })} aria-disabled={locked || xx <= range.min || undefined} data-pitch-less
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-300 bg-white aria-disabled:opacity-40 ${ringCls}`}><Minus className="h-5 w-5" aria-hidden="true" /></button>
                <p className="min-w-[8rem] text-center text-sm font-bold text-slate-700" dir="ltr">{letter} = {xx}</p>
                <button type="button" onClick={() => nudge(1)} aria-label={k('bigger', { letter })} aria-disabled={locked || xx >= range.max || undefined} data-pitch-more
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-300 bg-white aria-disabled:opacity-40 ${ringCls}`}><Plus className="h-5 w-5" aria-hidden="true" /></button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => stretch.nudge(-1)} aria-label={k('smaller', { letter })} disabled={xx <= range.min} data-pitch-less
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-300 bg-white disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><Minus className="h-5 w-5" aria-hidden="true" /></button>
                <p className="min-w-[8rem] text-center text-sm font-bold text-slate-700" dir="ltr">{letter} = {xx}</p>
                <button type="button" onClick={() => stretch.nudge(1)} aria-label={k('bigger', { letter })} disabled={xx >= range.max} data-pitch-more
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-300 bg-white disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><Plus className="h-5 w-5" aria-hidden="true" /></button>
              </>
            )}
          </div>

          {/* ── le terrain ── */}
          <div className={`overflow-hidden rounded-2xl border-2 border-emerald-200 bg-white p-1 ${ringKind === 'claim' ? predRing : ''}`} dir="ltr" data-pred-ring={ringKind === 'claim' ? 'true' : undefined}>
            <div className="relative mx-auto" style={{ width: svgW, height: svgH, maxWidth: '100%' }} data-pitch-field data-x={xx}>
              <svg width={svgW} height={svgH} className="absolute inset-0" role="img" aria-label={k('ariaPitch', { product: productTex.replace(/\\/g, ''), x: xx, area: L.valueText(L.product(lab, xx)) })}>
                <defs>
                  <pattern id={hatchId} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <rect width="8" height="8" fill="#FFE4E6" fillOpacity="0.55" /><line x1="0" y1="0" x2="0" y2="8" stroke="#E11D48" strokeWidth="2.5" />
                  </pattern>
                  <pattern id={crossId} width="8" height="8" patternUnits="userSpaceOnUse">
                    <rect width="8" height="8" fill="#DCFCE7" fillOpacity="0.6" /><path d="M0 0L8 8M8 0L0 8" stroke="#15803D" strokeWidth="1.6" />
                  </pattern>
                </defs>
                {/* décor : bandes de tonte, lignes, buts — aria-hidden via le role=img parent */}
                <g data-decor>
                  {Array.from({ length: Math.max(2, Math.ceil(W / 26)) }, (_, i) => (
                    <rect key={i} x={PAD + i * 26} y={PAD} width={Math.min(26, W - i * 26)} height={H} fill={i % 2 ? '#16A34A' : '#22C55E'} />
                  ))}
                  <rect x={PAD} y={PAD} width={W} height={H} fill="none" stroke="#fff" strokeWidth={2.5} />
                  <line x1={PAD + W / 2} x2={PAD + W / 2} y1={PAD} y2={PAD + H} stroke="#fff" strokeOpacity={0.35} strokeWidth={1.5} />
                  <circle cx={PAD + W / 2} cy={PAD + H / 2} r={Math.min(H, W) / 6} fill="none" stroke="#fff" strokeOpacity={0.35} strokeWidth={1.5} />
                  <rect x={PAD - 10} y={PAD + H / 2 - Math.min(24, H / 4)} width={10} height={Math.min(48, H / 2)} fill="#F8FAFC" stroke="#94A3B8" />
                  <rect x={PAD + W} y={PAD + H / 2 - Math.min(24, H / 4)} width={10} height={Math.min(48, H / 2)} fill={scored ? '#FEF3C7' : '#F8FAFC'} stroke={scored ? '#F59E0B' : '#94A3B8'} />
                </g>
                {/* les zones : leurs aires SONT la mathématique */}
                {geo.zones.map((z) => {
                  const taken = lab.collected.includes(z.id);
                  const on = glow.has(z.id);
                  // lecteur : la prédiction « les deux zones non hachurées » ENTOURE ces deux zones tant qu'elle est ouverte
                  const ringed = ringIds.has(z.id);
                  return (
                    <g key={z.id} data-pitch-zone={z.id} data-taken={String(taken)} data-missing={on ? 'true' : undefined} data-pred-ring={ringed ? 'true' : undefined}>
                      <rect x={PAD + z.x0 * unit} y={PAD + z.y0 * unit} width={z.w * unit} height={z.h * unit}
                        fill={z.restored ? `url(#${crossId})` : z.removed ? `url(#${hatchId})` : taken ? '#FFFFFF' : 'transparent'}
                        fillOpacity={taken && !z.removed && !z.restored ? 0.35 : 1}
                        stroke={on || ringed ? (gameScreen ? '#B45309' : '#F59E0B') : '#FFFFFF'} strokeWidth={on || ringed ? 4 : 1.5} strokeDasharray={on || ringed ? undefined : '5 4'} />
                    </g>
                  );
                })}
                {/* les côtés : un segment par terme, étiqueté */}
                {geo.zones.filter(topSide).map((z) => (
                  <text key={`c${z.id}`} x={PAD + (z.x0 + z.w / 2) * unit} y={PAD - 8} textAnchor="middle" fontSize={12} fontWeight="bold" fill={topTerm(z).c < 0 ? '#BE123C' : '#065F46'} fontFamily="ui-monospace, monospace">
                    {relabel ? sideName(topTerm(z)) : L.cellTex({ term: topTerm(z) }, letter)}
                  </text>
                ))}
                {geo.zones.filter(leftSide).map((z) => (
                  <text key={`r${z.id}`} x={PAD - 14} y={PAD + (z.y0 + z.h / 2) * unit + 4} textAnchor="end" fontSize={12} fontWeight="bold" fill={leftTerm(z).c < 0 ? '#BE123C' : '#065F46'} fontFamily="ui-monospace, monospace">
                    {relabel ? sideName(leftTerm(z)) : L.cellTex({ term: leftTerm(z) }, letter)}
                  </text>
                ))}
                {/* décor : le ballon */}
                <g data-decor style={{ transition: 'transform 450ms cubic-bezier(.2,.8,.3,1)', transform: `translate(${ball.cx}px, ${ball.cy}px)` }} className="motion-reduce:transition-none">
                  <circle r={7} fill="#fff" stroke="#0F172A" strokeWidth={1.4} />
                  <path d="M0 -3 L3 -1 L2 3 L-2 3 L-3 -1 Z" fill="#0F172A" />
                </g>
              </svg>
              {/* sources HTML au-dessus des zones (clavier, lecteur d'écran) */}
              {geo.zones.map((z) => {
                const taken = lab.collected.includes(z.id);
                const big = z.w * unit >= 40 && z.h * unit >= 28;
                return (
                  <DraggableObject key={z.id} drag={drag} id={`z:${z.id}`} disabled={taken}
                    label={zoneAria(z.term, z.area, z.id)}
                    className="absolute flex items-center justify-center rounded-md"
                    style={{ left: PAD + z.x0 * unit, top: PAD + z.y0 * unit, width: Math.max(z.w * unit, 12), height: Math.max(z.h * unit, 12), background: 'transparent' }}>
                    {big && (
                      <span className={`pointer-events-none rounded-md px-1.5 py-0.5 text-xs font-bold shadow-sm ${taken ? 'bg-white/60 text-slate-400' : z.removed ? 'bg-rose-50 text-rose-800' : 'bg-white/90 text-emerald-900'}`}>
                        {area ? areaNode(z.term) : <MathText>{tex(z.term)}</MathText>}
                      </span>
                    )}
                  </DraggableObject>
                );
              })}
              {/* décor interactif : taper le ballon (hors clavier, sans effet mathématique) */}
              <button type="button" tabIndex={-1} aria-hidden="true" onClick={() => setKick((n) => n + 1)}
                className="absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ left: ball.cx, top: ball.cy }} data-decor-ball />
            </div>
          </div>

          {/* ── le tableau de Descartes : les mêmes zones, lisibles et portables ── */}
          <div className={`overflow-x-auto ${ringKind === 'termsLeft' ? predRing : ''}`} dir="ltr" data-pred-ring={ringKind === 'termsLeft' ? 'true' : undefined}>
            <table className="mx-auto border-separate border-spacing-1 text-sm" data-pitch-grid>
              <thead>
                <tr>
                  <th className="px-2 font-mono text-xs text-slate-500" aria-label={k('gridCorner')}>×</th>
                  {lab.factors[0].map((term, i) => <th key={i} className="rounded-md bg-emerald-100 px-2 py-1 text-emerald-900" data-side-name={relabel ? sideName(term) : undefined}>{relabel ? <bdi dir="ltr" className="font-mono">{sideName(term)}</bdi> : <MathText>{tex(term)}</MathText>}</th>)}
                </tr>
              </thead>
              <tbody>
                {lab.factors[1].map((row, j) => (
                  <tr key={j}>
                    <th className="rounded-md bg-emerald-100 px-2 py-1 text-emerald-900">{relabel ? <bdi dir="ltr" className="font-mono">{sideName(row)}</bdi> : <MathText>{tex(row)}</MathText>}</th>
                    {lab.factors[0].map((_, i) => {
                      const cell = lab.cells.find((c) => c.i === i && c.j === j);
                      const taken = lab.collected.includes(cell.id);
                      const zone = geo.zones.find((z) => z.id === cell.id);
                      return (
                        <td key={i}>
                          <DraggableObject drag={drag} id={`z:${cell.id}`} disabled={taken}
                            label={zoneAria(cell.term, zone.area, cell.id)}
                            className={`min-h-[44px] min-w-[64px] rounded-lg border-2 px-2 py-1 ${glow.has(cell.id) ? 'border-amber-400 bg-amber-50' : zone.removed ? 'border-rose-300 bg-rose-50' : zone.restored ? 'border-emerald-400 bg-emerald-50' : 'border-emerald-300 bg-white'} ${taken ? 'opacity-40' : ''}`}>
                            {area ? (
                              <span className="block font-bold">{areaNode(cell.term)}</span>
                            ) : (
                              <>
                                <span className="block font-bold"><MathText>{tex(cell.term)}</MathText></span>
                                <span className="block text-[11px] text-slate-500">= {L.valueText(zone.area)}</span>
                              </>
                            )}
                          </DraggableObject>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── la somme ── */}
          <DropZone drag={drag} id="sum" tone="emerald" label={k('sumLabel')} hint={k('sumHint')} minHeight="min-h-[72px]" className="p-2" data-pitch-sum>
            {lab.tray.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5" dir="ltr">
                <span className="font-mono text-sm text-slate-600"><MathText>{`$${productTex} =$`}</MathText></span>
                {lab.tray.map((chip, n) => (
                  <React.Fragment key={chip.id}>
                    {n > 0 && (area || chip.term.c > 0) && <span className="font-mono text-slate-500">+</span>}
                    <DropZone drag={drag} id={`chip:${chip.id}`} tone="amber" label={gameScreen ? chipAria(chip.term) : k('chipZone', { term: L.cellTex(chip, letter) })} minHeight="min-h-[44px]" className="inline-flex items-center" {...interceptChip(chip.id)}>
                      <DraggableObject drag={drag} id={`c:${chip.id}`} label={chipAria(chip.term)}
                        className="min-h-[44px] rounded-lg bg-white px-2 font-bold text-slate-800" >
                        {area ? (
                          <span data-tray-chip={chip.id} className="inline-flex items-center">{n > 0 && chip.term.c < 0 && <span aria-hidden="true">(</span>}{areaNode(chip.term)}{n > 0 && chip.term.c < 0 && <span aria-hidden="true">)</span>}</span>
                        ) : (
                          <>
                            <span data-tray-chip={chip.id}><MathText>{tex(chip.term)}</MathText></span>
                            <span className="block text-[11px] font-normal text-slate-500">= {L.valueText(valueOf(chip.term))}</span>
                          </>
                        )}
                      </DraggableObject>
                    </DropZone>
                  </React.Fragment>
                ))}
                {/* lecteur (L2.4) : deux termes opposés réunis — la pastille « 0 » reste, la coupe se voit */}
                {gameScreen && zeros.map((zid) => (
                  <React.Fragment key={zid}>
                    <span className="font-mono text-slate-500" aria-hidden="true">+</span>
                    <span className="inline-flex min-h-[44px] items-center rounded-lg border-2 border-dashed border-slate-400 bg-slate-50 px-3 font-mono font-black text-slate-700" data-tray-zero role="img" aria-label={k('player.zeroChip')}><bdi dir="ltr">0</bdi></span>
                  </React.Fragment>
                ))}
              </div>
            )}
          </DropZone>
          {simp && lab.tray.length > 1 && !L.isSimplified(lab) && L.allCollected(lab) && (
            <p className="text-xs text-slate-600"><MathText>{k('mergeHint')}</MathText></p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {gameScreen ? (
              <button type="button" onClick={check} aria-disabled={!canCheck || undefined} data-pitch-check
                // aria-disabled, pas disabled : le focus clavier reste sur le bouton après l'appui (`check` se garde lui-même)
                className={`inline-flex min-h-[48px] items-center gap-2 rounded-2xl border-2 px-5 text-base font-black ${canCheck ? 'border-emerald-700 bg-emerald-700 text-white shadow-[0_3px_0_0_#065F46]' : 'border-slate-300 bg-slate-200 text-slate-600'} ${ringCls}`}>
                <CheckCircle2 className="h-5 w-5" aria-hidden="true" /> <span><MathText>{k('check', { letter, x })}</MathText></span>
              </button>
            ) : (
              <button type="button" onClick={check} disabled={!lab.tray.length || live != null} data-pitch-check
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-emerald-600 px-4 font-bold text-white disabled:opacity-40 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300">
                <CheckCircle2 className="h-5 w-5" aria-hidden="true" /> <span><MathText>{k('check', { letter, x })}</MathText></span>
              </button>
            )}
            {!gameScreen && lab.trials.length > 0 && (
              <ul className="flex flex-wrap gap-1.5" dir="ltr" data-pitch-trials>
                {lab.trials.map((tr) => (
                  <li key={tr.x} data-trial-x={tr.x} data-ok={String(tr.ok)} className={`rounded-lg px-2 py-0.5 font-mono text-xs font-bold ${tr.ok ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'}`}>
                    {letter} = {tr.x} {tr.ok ? '✓' : '✗'}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p className="min-h-[1.25rem] text-sm" aria-live="polite" data-pitch-notice>
            {notice && !notice.trial && reasonText(notice.key) && <span className="text-rose-800"><MathText>{reasonText(notice.key)}</MathText></span>}
          </p>
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ══════════════ La découverte et la règle ══════════════ */

const KIND_KEY = { distributive: 'dist', double: 'double', 'square-sum': 'sqSum', 'square-diff': 'sqDiff', 'sum-diff': 'sumDiff' };

/** Les trois options de la règle : la bonne, l'erreur de la nature du produit, et « une seule valeur de x » (réfutée par SES valeurs). */
export function discoveryOptions(lab, k) {
  const kindKey = KIND_KEY[lab.kind];
  return [
    { text: <MathText>{k(`${kindKey}Opt2`)}</MathText>, why: <MathText>{k(`${kindKey}Why2`)}</MathText> },
    { text: <MathText>{k(`${kindKey}Opt1`)}</MathText>, correct: true },
    { text: <MathText>{k('onlyOneX')}</MathText>, why: <MathText>{k('onlyOneXWhy', { xs: L.verifiedXs(lab).join(' ، ') })}</MathText> },
  ];
}

export function Formal({ lab, k, letter = 'x' }) {
  const kindKey = KIND_KEY[lab.kind];
  return (
    <div className="space-y-2" data-pitch-formal>
      <EquationDisplay tone="result" tex={k(`${kindKey}Rule`)} note={<MathText>{k(`${kindKey}Formal`)}</MathText>} />
      <EquationDisplay tone="neutral" tex={`${L.productTex(lab, letter)} = ${L.resultTex(lab, letter)}`} note={<MathText>{k('yourCase')}</MathText>} />
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite unique : les zones, l'aire pour SON x, la forme développée, puis LA RÈGLE. */
export const CHAIN = Object.freeze(['zones', 'area', 'result', 'rule']);

const $ = (s) => `$${s}$`;
const Cq = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const poly = (terms, letter) => termsTex(terms, { letter });
const absTerm = (t) => ({ c: Math.abs(t.c), p: t.p });

/** La valeur de x de l'élève (la plus petite vérifiée juste) et ce qu'il a trouvé : l'aire du terrain. */
const trialOf = (lab) => { const x = L.verifiedXs(lab)[0]; return { x, area: L.product(lab, x) }; };

/**
 * Les formes FAUSSES d'un développement, chacune une erreur réelle : `cross` (seuls les produits « en face » : le (a + b)² = a² + b²), `sign` (le −
 * ignoré), `single` (une zone oubliée), `sqplus` (le carré du second terme ajouté au lieu d'être retranché), `first` / `last` / `sum` (un seul terme
 * multiplié, ou on additionne au lieu de multiplier). Toutes écartées si elles égalent la bonne forme (identiquement ou pour le x de l'élève).
 */
export function wrongForms(lab, letter = 'x') {
  const { cells, factors: [f1, f2] } = lab;
  const right = reducePoly(cells.map((c) => c.term));
  const lastI = f1.length - 1; const lastJ = f2.length - 1;
  const { x, area } = trialOf(lab);
  const pick = (id, terms) => ({ id, terms: reducePoly(terms) });
  let cands;
  if (lab.kind === 'distributive') {
    const [m, other] = f1.length === 1 ? [f1[0], f2] : [f2[0], f1];
    cands = [
      pick('first', [mulTerms(m, other[0]), ...other.slice(1)]),
      pick('last', [...other.slice(0, -1), mulTerms(m, other.at(-1))]),
      pick('sum', [m, ...other]),
    ];
  } else {
    const diag = cells.filter((c) => c.i === c.j).map((c) => c.term);
    cands = [
      ...(lab.kind === 'sum-diff' ? [pick('sqplus', diag.map(absTerm))] : [pick('cross', diag)]),
      pick('sign', cells.map((c) => absTerm(c.term))),
      pick('single', cells.filter((c) => !(c.i === 0 && c.j === lastJ)).map((c) => c.term)),
      pick('single', cells.filter((c) => !(c.i === lastI && c.j === lastJ)).map((c) => c.term)),
    ];
  }
  const out = [];
  for (const c of cands) {
    if (!c.terms.length || samePolynomial(c.terms, right) || evaluate(c.terms, x) === area) continue;
    if (out.some((o) => samePolynomial(o.terms, c.terms))) continue;
    out.push({ ...c, tex: poly(c.terms, letter), got: evaluate(c.terms, x) });
  }
  return out;
}

export const QUESTIONS = {
  zones: (lab, k, letter = 'x') => {
    const [f1, f2] = lab.factors;
    const n = lab.cells.length;
    const o = { prod: $(L.productTex(lab, letter)), a: f1.length, b: f2.length, calc: $(`${f1.length}\\times${f2.length}=${n}`) };
    return {
      id: 'zones', kind: 'number', expected: String(n), answer: <MathText>{$(String(n))}</MathText>,
      prompt: Cq(k, 'zones.prompt', o), hints: [Cq(k, 'zones.hint1'), Cq(k, 'zones.hint2', o)], explain: Cq(k, 'zones.explain', o),
    };
  },
  area: (lab, k, letter = 'x') => {
    const [f1, f2] = lab.factors;
    const { x, area } = trialOf(lab);
    const a = evaluate(f1, x); const b = evaluate(f2, x);
    const o = { eq: $(`${letter}=${x}`), prod: $(L.productTex(lab, letter)), a: $(String(a)), b: $(String(b)), calc: $(`${a}\\times${b}=${area}`), letter: $(letter) };
    return {
      id: 'area', kind: 'number', expected: String(area), answer: <MathText>{$(String(area))}</MathText>,
      prompt: Cq(k, 'area.prompt', o), hints: [Cq(k, 'area.hint1', o), Cq(k, 'area.hint2', o)], explain: Cq(k, 'area.explain', o),
    };
  },
  result: (lab, k, letter = 'x') => {
    const { x, area } = trialOf(lab);
    const right = reducePoly(lab.cells.map((c) => c.term));
    const rightTex = poly(right, letter);
    const base = { eq: $(`${letter}=${x}`), prod: $(L.productTex(lab, letter)), area: $(String(area)), letter: $(letter) };
    const wrong = wrongForms(lab, letter).slice(0, 2);
    return {
      id: 'result', kind: 'choice', cols: 3, prompt: Cq(k, 'result.prompt', base),
      options: [
        { text: <MathText>{$(wrong[0].tex)}</MathText>, why: Cq(k, `result.why.${wrong[0].id}`, { ...base, got: $(String(wrong[0].got)) }) },
        { text: <MathText>{$(rightTex)}</MathText>, correct: true },
        { text: <MathText>{$(wrong[1].tex)}</MathText>, why: Cq(k, `result.why.${wrong[1].id}`, { ...base, got: $(String(wrong[1].got)) }) },
      ],
      hints: [Cq(k, 'result.hint1', base), Cq(k, 'result.hint2')],
      explain: Cq(k, 'result.explain', { ...base, eq2: $(`${L.productTex(lab, letter)}=${rightTex}`) }),
    };
  },
  rule: (lab, k, letter = 'x') => ({
    id: 'rule', kind: 'choice', prompt: <MathText>{k(`${KIND_KEY[lab.kind]}Prompt`)}</MathText>,
    options: discoveryOptions(lab, k),
    hints: [Cq(k, 'rule.hint1', { xs: L.verifiedXs(lab).join(' ، ') }), Cq(k, 'rule.hint2', { sum: $(L.trayTex(lab, letter)) })],
    explain: <Formal lab={lab} k={k} letter={letter} />,
  }),
};

/* ══════════════ Lecteur de mission : les suites des manches (rollout 2026-11-11, conseil L1.1–L1.8) ══════════════ */

/**
 * Les suites du lecteur, par mode : chacune { id, reached(lab), qs } — l'id est le point d'étape de la manche (`{ checkpoint: id }`), posé quand
 * ce qu'il interroge est là, dans l'ordre de la liste. Observer (« area ») → BÂTIR l'égalité (une tuile leurre) → la règle après DEUX x.
 */
export const CHAINS_PLAYER = Object.freeze({
  dist: [{ id: 'build', reached: L.firstOk, qs: ['area', 'build'] }, { id: 'rule', reached: L.playerDiscovery, qs: ['rulePlayer'] }],
  distEasy: [{ id: 'build', reached: L.firstOk, qs: ['build'] }],
  double: [{ id: 'build4', reached: L.firstOk, qs: ['build4'] }, { id: 'rule', reached: L.playerDiscovery, qs: ['rulePlayer'] }],
  doubleEasy: [{ id: 'build4', reached: L.firstOk, qs: ['build4'] }],
  restored: [{ id: 'corner', reached: L.firstOk, qs: ['corner'] }, { id: 'result', reached: L.playerDiscovery, qs: ['result'] }],
  restoredEasy: [{ id: 'corner', reached: L.firstOk, qs: ['corner'] }],
  result: [{ id: 'result', reached: L.playerDiscovery, qs: ['result'] }],
  // leçon 2 `mutatabiqat-shahira` (conseil L2.1–L2.7) : observer au 1er x juste, puis à la découverte BÂTIR l'identité en lettres et la règle
  square: [{ id: 'strips', reached: L.firstOk, qs: ['stripFill'] }, { id: 'rule', reached: L.playerDiscovery, qs: ['identityBuild', 'rulePlayer'] }],
  squareEasy: [{ id: 'strips', reached: L.firstOk, qs: ['stripFill'] }],
  squareDiff: [{ id: 'cornerFill', reached: L.firstOk, qs: ['cornerFill'] }, { id: 'rule', reached: L.playerDiscovery, qs: ['identityBuild', 'rulePlayer'] }],
  squareDiffEasy: [{ id: 'cornerFill', reached: L.firstOk, qs: ['cornerFill'] }],
  sumDiff: [{ id: 'cancel', reached: L.firstOk, qs: ['cancelFill'] }, { id: 'rule', reached: L.playerDiscovery, qs: ['identityBuild', 'rulePlayer'] }],
  sumDiffEasy: [{ id: 'cancel', reached: L.firstOk, qs: ['cancelFill'] }],
  coef: [{ id: 'coef', reached: L.playerDiscovery, qs: ['coefBuild'] }],
  coefEasy: [{ id: 'coef', reached: L.firstOk, qs: ['coefBuild'] }],
  // la synthèse de l'unité 3 `wadiya-idmajiya-harfi` (2026-11-12) : un terrain « x+a+x » — le ممرّ autour de la نافورة centrale. En aires, à la
  // découverte (deux x), BÂTIR sa mesure en nombres ; en termes, à la découverte, BÂTIR son aire « (2x + a)² − a² = 4x² + 4ax »
  ring: [{ id: 'ring', reached: L.playerDiscovery, qs: ['ringBuild'] }],
  ringEasy: [{ id: 'ring', reached: L.firstOk, qs: ['ringBuild'] }],
  ringTerms: [{ id: 'ringExpr', reached: L.playerDiscovery, qs: ['ringExpr'] }],
  ringTermsEasy: [{ id: 'ringExpr', reached: L.firstOk, qs: ['ringExpr'] }],
  none: [],
});
export const chainsOfPlayer = (mode) => CHAINS_PLAYER[mode] ?? [];

/** La bonne réponse d'une question à choix à une place qui dépend des nombres du labo (jamais toujours la même, jamais au hasard). */
function spreadQ(q, seed) {
  const ci = q.options.findIndex((o) => o.correct);
  const target = Math.abs(seed) % q.options.length;
  if (ci < 0 || ci === target) return q;
  const options = [...q.options];
  const [right] = options.splice(ci, 1);
  options.splice(target, 0, right);
  return { ...q, options };
}
const seedOf = (lab) => lab.cells.reduce((s, c) => s + Math.abs(c.term.c) * (c.term.p + 1), 0) + lab.cells.length;
/** Un terme écrit pour une tuile : « 3x^2 », « -3 ». */
const tileOf = (t, letter) => termsTex([t], { letter });
/** Un facteur de zone écrit dans un nom d'emplacement : négatif entre parenthèses — « (−1) × 3 ». */
const sideTex = (t, letter) => { const s = tileOf(t, letter); return t.c < 0 ? `(${s})` : s; };
/** Une tuile dessinée dans sa forme : négative entre parenthèses (« 9x + (−3) »). */
const renderTile = (tile) => <MathText>{tile.startsWith('-') ? `$(${tile})$` : `$${tile}$`}</MathText>;

/**
 * BÂTIR l'égalité (conseil L1.1) : le développement écrit tuile par tuile, un emplacement par ZONE nommée par ses deux côtés (« 3x × 3 »), donc
 * dans un ordre fixe (aucun `accept`). UNE tuile leurre, l'erreur classique : k(a + b) → le terme NON multiplié (3(x + 5) = 3x + 5) ; deux
 * parenthèses → la zone retranchée AJOUTÉE (le signe oublié : « x » au lieu de « −x »). La place du leurre tourne avec les nombres.
 */
export function buildDecoy(lab, letter = 'x') {
  const [f1, f2] = lab.factors;
  const expected = lab.cells.map((c) => tileOf(c.term, letter));
  let decoy;
  if (lab.kind === 'distributive') {
    const other = f1.length === 1 ? f2 : f1;
    decoy = tileOf(other.at(-1), letter);
  } else {
    const neg = lab.cells.filter((c) => c.term.c < 0).at(-1);
    decoy = neg ? tileOf({ c: -neg.term.c, p: neg.term.p }, letter) : tileOf({ c: lab.cells[0].term.c + 1, p: lab.cells[0].term.p }, letter);
  }
  if (expected.includes(decoy)) decoy = tileOf({ c: lab.cells.at(-1).term.c + 1, p: 0 }, letter);
  return decoy;
}
function buildQuestion(lab, k, letter, id) {
  const [f1, f2] = lab.factors;
  const expected = lab.cells.map((c) => tileOf(c.term, letter));
  const decoy = buildDecoy(lab, letter);
  const all = [...expected, decoy];
  const shift = seedOf(lab) % all.length;
  const tiles = all.map((_, i) => all[(i + shift) % all.length]);
  const { x, area } = trialOf(lab);
  const o = {
    prod: $(L.productTex(lab, letter)), eq: $(`${letter}=${x}`), area: $(String(area)),
    eq2: $(`${L.productTex(lab, letter)} = ${termsTex(lab.cells.map((c) => c.term), { letter })}`),
  };
  return {
    id, kind: 'build', prompt: Cq(k, `${id}.prompt`, o),
    slots: lab.cells.map((c) => <MathText key={c.id}>{`$${sideTex(f1[c.i], letter)} \\times ${sideTex(f2[c.j], letter)}$`}</MathText>),
    ops: lab.cells.slice(1).map(() => '+'),
    tiles, expected, render: renderTile,
    hints: [Cq(k, `${id}.hint1`, o), Cq(k, `${id}.hint2`, o)], explain: Cq(k, `${id}.explain`, o),
  };
}

Object.assign(QUESTIONS, {
  build: (lab, k, letter = 'x') => buildQuestion(lab, k, letter, 'build'),
  build4: (lab, k, letter = 'x') => buildQuestion(lab, k, letter, 'build4'),
  /* la zone hachurée DEUX fois (le coin) : pourquoi compte-t-elle « + » ? */
  corner: (lab, k, letter = 'x') => {
    const [f1, f2] = lab.factors;
    const cell = lab.cells.find((c) => f1[c.i].c < 0 && f2[c.j].c < 0);
    const a = f1[cell.i]; const b = f2[cell.j];
    const o = {
      v: $(tileOf(cell.term, letter)), neg: $(tileOf({ c: -cell.term.c, p: cell.term.p }, letter)),
      calc: $(`${sideTex(a, letter)} \\times ${sideTex(b, letter)} = ${tileOf(cell.term, letter)}`),
    };
    return spreadQ({
      id: 'corner', kind: 'choice', cols: 1, prompt: Cq(k, 'corner.prompt', o),
      options: [
        { text: Cq(k, 'corner.right', o), correct: true },
        { text: Cq(k, 'corner.minus', o), why: Cq(k, 'corner.whyMinus', o) },
        { text: Cq(k, 'corner.zero', o), why: Cq(k, 'corner.whyZero', o) },
      ],
      hints: [Cq(k, 'corner.hint1', o), Cq(k, 'corner.hint2', o)], explain: Cq(k, 'corner.explain', o),
    }, seedOf(lab) + 1);
  },
  /* la règle du lecteur : la bonne option donne la RAISON géométrique (conseil, « added rulings ») ; l'erreur de la nature du produit ; « une
     seule valeur » réfutée par SES valeurs. Les options de la page (`discoveryOptions`) ne changent pas. */
  rulePlayer: (lab, k, letter = 'x') => {
    const kk = KIND_KEY[lab.kind];
    return spreadQ({
      id: 'rule', kind: 'choice', cols: 1, prompt: <MathText>{k(`${kk}Prompt`)}</MathText>,
      options: [
        { text: <MathText>{k(`player.rule.${kk}Right`)}</MathText>, correct: true },
        { text: <MathText>{k(`${kk}Opt2`)}</MathText>, why: <MathText>{k(kk === 'sqDiff' ? 'player.rule.sqDiffWhy2' : `${kk}Why2`)}</MathText> },
        { text: <MathText>{k('onlyOneX')}</MathText>, why: <MathText>{k('onlyOneXWhy', { xs: L.verifiedXs(lab).join(' ، ') })}</MathText> },
      ],
      hints: [Cq(k, 'rule.hint1', { xs: L.verifiedXs(lab).join(' ، ') }), Cq(k, 'player.ruleHint2')],
      explain: <Formal lab={lab} k={k} letter={letter} />,
    }, seedOf(lab) + 2);
  },
});

/* ══════════════ Leçon 2 `mutatabiqat-shahira` : les questions des terrains carrés (rollout 2026-11-11, conseil L2.1–L2.7) ══════════════ */

/** Une pastille ou une tuile écrite dans SA forme (« 4x », « +25 », « a^2 ») ; la comparaison lit la chaîne. */
const renderMath = (v) => <MathText>{`$${v}$`}</MathText>;
const fieldsOf = (parts, labels) => parts.map((f, i) => ({ label: labels[i], expected: f.expected, options: f.options, render: renderMath }));

Object.assign(QUESTIONS, {
  /* r1 (a + b)², après le 1er x juste : combien de bandes, et la bande en lettres */
  stripFill: (lab, k, letter = 'x') => {
    const parts = L.stripFillParts(lab);
    const { a, b } = L.binomialOf(lab);
    const o = { prod: $(L.productTex(lab, letter)), strip: $(tileOf({ c: a.c * b.c, p: a.p + b.p }, letter)), b: $(tileOf(b, letter)), a: $(tileOf(a, letter)) };
    return {
      id: 'stripFill', kind: 'fill', prompt: Cq(k, 'strip.prompt', o),
      fields: fieldsOf(parts, [Cq(k, 'strip.count', o), Cq(k, 'strip.each', o)]),
      hints: [Cq(k, 'strip.hint1', o), Cq(k, 'strip.hint2', o)], explain: Cq(k, 'strip.explain', o),
    };
  },
  /* r2 (a − b)², après le 1er x juste : sur les nombres de la manche, combien de fois le coin a été coupé et ce qu'il vaut dans la somme */
  cornerFill: (lab, k, letter = 'x') => {
    const parts = L.cornerFillParts(lab);
    const cell = L.restoredCell(lab);
    const v = cell.term.c;
    const { b } = L.binomialOf(lab);
    const o = { v: $(String(v)), b: $(tileOf(b, letter)), calc: $(`(-${b.c}) \\times (-${b.c}) = +${v}`) };
    return {
      id: 'cornerFill', kind: 'fill', prompt: Cq(k, 'cornerFill.prompt', o),
      fields: fieldsOf(parts, [Cq(k, 'cornerFill.times', o), Cq(k, 'cornerFill.sign', o)]),
      hints: [Cq(k, 'cornerFill.hint1', o), Cq(k, 'cornerFill.hint2', o)], explain: Cq(k, 'cornerFill.explain', o),
    };
  },
  /* module 2 (a + b)(a − b), après le 1er x juste : les deux bandes opposées réunies */
  cancelFill: (lab, k, letter = 'x') => {
    const parts = L.cancelFillParts(lab);
    const strip = lab.cells.find((c) => c.term.p === 1 && c.term.c > 0).term;
    const o = { plus: $(tileOf(strip, letter)), minus: $(tileOf({ c: -strip.c, p: 1 }, letter)) };
    return {
      id: 'cancelFill', kind: 'fill', prompt: Cq(k, 'cancel.prompt', o),
      fields: fieldsOf(parts, [Cq(k, 'cancel.field', o)]),
      hints: [Cq(k, 'cancel.hint1', o), Cq(k, 'cancel.hint2', o)], explain: Cq(k, 'cancel.explain', o),
    };
  },
  /* à la découverte : l'identité EN LETTRES (L2.6), une tuile leurre (L2.2 / L2.3) ; les côtés du terrain s'appellent a et b pendant la question */
  identityBuild: (lab, k, letter = 'x') => {
    const parts = L.identityParts(lab);
    const kk = KIND_KEY[lab.kind];
    const all = [...parts.expected, parts.decoy];
    const shift = seedOf(lab) % all.length;
    const tiles = all.map((_, i) => all[(i + shift) % all.length]);
    const { a, b } = L.binomialOf(lab);
    const o = { lhs: $(parts.lhs), a: $(tileOf(a, letter)), b: $(tileOf(b, letter)), prod: $(L.productTex(lab, letter)), rule: $(k(`${kk}Rule`)) };
    return {
      id: 'identityBuild', kind: 'build', prompt: Cq(k, 'identity.prompt', o),
      slots: parts.expected.map((_, i) => k('cp.identity.slot', { n: i + 1 })),
      ops: parts.ops, wrap: [<MathText key="w">{`$${parts.lhs} =$`}</MathText>, null],
      tiles, expected: parts.expected, accept: parts.accept, preset: parts.preset, render: renderMath,
      hints: [Cq(k, `identity.${kk}Hint1`, o), Cq(k, 'identity.hint2', o)], explain: Cq(k, 'identity.explain', o),
    };
  },
  /* r3 : le carré à coefficient, en NOMBRES ; le leurre est le coefficient non élevé au carré */
  coefBuild: (lab, k, letter = 'x') => {
    const c = L.coefParts(lab);
    const all = [...c.expected, c.decoy];
    const shift = (seedOf(lab) + 1) % all.length;
    const tiles = all.map((_, i) => all[(i + shift) % all.length]);
    const { a, b } = L.binomialOf(lab);
    const o = { prod: $(L.productTex(lab, letter)), a: $(tileOf(a, letter)), b: $(tileOf(b, letter)), aa: $(tileOf(c.aa, letter)), eq2: $(`${L.productTex(lab, letter)} = ${termsTex(reducePoly(lab.cells.map((u) => u.term)), { letter })}`) };
    return {
      id: 'coefBuild', kind: 'build', prompt: Cq(k, 'coef.prompt', o),
      slots: [k('cp.coef.slotA'), k('cp.coef.slotAB'), k('cp.coef.slotB')],
      ops: c.ops, wrap: [<MathText key="w">{`$${L.productTex(lab, letter)} =$`}</MathText>, null],
      tiles, expected: c.expected, render: renderMath,
      hints: [Cq(k, 'coef.hint1', o), Cq(k, 'coef.hint2', o)], explain: Cq(k, 'coef.explain', o),
    };
  },
});

/* ══════════════ La synthèse de l'unité 3 `wadiya-idmajiya-harfi` : le ممرّ autour de la نافورة (lecteur, 2026-11-12) ══════════════ */

Object.assign(QUESTIONS, {
  /* en AIRES, au x de l'élève : la mesure du ممرّ de deux façons, en nombres — « terrain − نافورة = 4 × شريط + 4 × ركن » — au x que le terrain
     MONTRE (le dernier vérifié juste, `lastX`), jamais un x d'avant : la question et le terrain disent les mêmes nombres */
  ringBuild: (lab, k) => {
    const ok = L.verifiedXs(lab);
    // garde : la suite n'est atteinte qu'après un x juste ; sans x juste, le x montré (jamais NaN)
    const x = ok.includes(lab.lastX) ? lab.lastX : (ok.at(-1) ?? lab.lastX ?? 1);
    const p = L.ringBuildParts(lab, x);
    const all = [...p.expected, p.decoy];
    const shift = (seedOf(lab) + x) % all.length;
    const tiles = all.map((_, i) => all[(i + shift) % all.length]);
    const o = {
      eq: $(`x=${x}`), a: $(String(p.a)), side: $(String(p.a + 2 * x)), ring: $(String(p.ring)),
      calc1: $(`${p.outer} - ${p.center} = ${p.ring}`), calc2: $(`4 \\times ${p.strip} + 4 \\times ${p.corner} = ${p.ring}`),
    };
    return {
      id: 'ringBuild', kind: 'build', prompt: Cq(k, 'ring.prompt', o),
      slots: [k('cp.ring.slotPitch'), k('cp.ring.slotCenter'), k('cp.ring.slotStrip'), k('cp.ring.slotCorner')],
      ops: ['−', '= 4 ×', '+ 4 ×'],
      tiles, expected: p.expected, render: renderMath,
      hints: [Cq(k, 'ring.hint1', o), Cq(k, 'ring.hint2', o)], explain: Cq(k, 'ring.explain', o),
    };
  },
  /* en TERMES : l'aire du ممرّ « (2x + a)² − a² = 4x² + 4ax » ; leurres +a² (la نافورة gardée) et +2ax (le ممرّ d'un seul côté) */
  ringExpr: (lab, k) => {
    const p = L.ringExprParts(lab);
    const all = [...p.expected, ...p.decoys];
    const shift = (seedOf(lab) + 1) % all.length;
    const tiles = all.map((_, i) => all[(i + shift) % all.length]);
    const o = { lhs: $(p.lhs), side: $(`x + ${p.a} + x`), side2: $(`2x + ${p.a}`), aa: $(String(p.a * p.a)), eq2: $(`${p.lhs} = ${p.expected[0]} ${p.expected[1].replace('+', '+ ')}`) };
    return {
      id: 'ringExpr', kind: 'build', prompt: Cq(k, 'ringExpr.prompt', o),
      slots: [k('cp.ringExpr.slotSq'), k('cp.ringExpr.slotX')],
      ops: [''], wrap: [<MathText key="w">{`$${p.lhs} =$`}</MathText>, null],
      tiles, expected: p.expected, render: renderMath,
      hints: [Cq(k, 'ringExpr.hint1', o), Cq(k, 'ringExpr.hint2', o)], explain: Cq(k, 'ringExpr.explain', o),
    };
  },
});
