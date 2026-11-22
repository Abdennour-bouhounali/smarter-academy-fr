import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import { useManipulation } from '../useManipulation';
import useStretchInteraction from '../useStretchInteraction';
import LabFold from '../primitives/LabFold';
import MathText from '../../components/MathText';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { useLabCoach } from '../primitives/LabCoach';
import PredictTray from '../primitives/PredictTray';
import { useInMissionPlayer, useMissionArea } from '../../mission/missionPlayerContext';
import { playSfx } from '../../utils/playEffect';
import TemplateInput from '../../../../features/practice/answerTemplates/TemplateInput';
import { templateFor } from '../../../../features/practice/answerTemplates/templateFor';
import { parseHundredths, tex } from '../logic/shadowWorld';
import { $, Mx, useTick, spreadAll } from './thalesCp';
import * as L from '../logic/shadowMeet';

/**
 * shadow-meet — « الظلّان يلتقيان » : UN COULOIR, un objet trop haut pour être mesuré, un bâton de 1 m (unité 9 « خاصية طالس », leçon 1
 * `talis-hisab-atwal`, dans le LECTEUR DE MISSION ; conseil du 2026-11-10, verdict L1.1 = C). Le monde `shadow-world` (cinq couloirs, le soleil
 * tenu, la règle écrite, le compagnon) reste le labo de la PAGE et de l'enseignant : celui-ci est NEUF, à un couloir, joué en MANCHES.
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. L'élève FAIT GLISSER un bâton de 1 m sur le sol (au centimètre : doigt, piste, flèches du clavier, boutons ±1 / ±10 cm), le soleil à une
 *    heure fixée par la manche.
 * B. Idée : quand les deux ombres finissent au même point O, UN rayon passe par les deux sommets ; le bâton et l'objet sont parallèles, donc
 *    OB / OA = BE / AM — la hauteur qu'on ne peut pas atteindre se calcule depuis le sol.
 * C. Le bâton est à l'ombre de l'objet (pas d'ombre à lui : son sommet est SOUS le rayon), ou au soleil (son ombre DÉPASSE celle de l'objet),
 *    ou pile à la rencontre : la physique de la scène, pas un texte, dit où il est.
 * D. À la rencontre les trois longueurs s'écrivent au sol (OB, BA, OA) ; le journal garde l'heure, l'objet, les deux ombres, la hauteur trouvée.
 * E. À découvrir : la rencontre ; que BA n'est pas un côté des triangles ; que le rapport OB/OA ne change pas quand l'heure change.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        la propriété de Thalès dans les triangles OBE et OAM (deux verticales, un rayon) ; le calcul d'une longueur inaccessible
 *   OBJECT         un bâton de 1 m, un château d'eau (un lampadaire, un palmier, un mât, une minaret), leurs ombres, les rayons du soleil
 *   VARIABLE       la POSITION du pied B du bâton (cm depuis A) ; l'HEURE entre deux étapes
 *   INVARIANT      les hauteurs ; les rayons PARALLÈLES ; le rapport ombre ÷ hauteur à une heure donnée ; OB ÷ OA d'une heure à l'autre
 *   TRANSFORMATION l'ombre du bâton apparaît, glisse, rejoint le bout de l'ombre de l'objet ; les ombres s'allongent quand l'heure avance
 *   CONSTRAINT     le bâton reste sur le sol, entre l'objet et un peu au-delà de son ombre ; l'heure ne se choisit pas dans une manche
 *   RESISTANCE     à l'ombre le bâton n'a PAS d'ombre ; au soleil la sienne dépasse : une seule place fait finir les deux ensemble
 *   EVIDENCE       le rayon unique par E et M ; les trois longueurs au sol ; le journal
 *   CONTRAST       14:00 contre 16:00 (tout change au sol sauf le rapport) ; la قطعة BA contre le côté OA
 *   PREDICTION     « à 16:00, l'ombre du bâton sera-t-elle la même ? », « celle du château d'eau, plus ou moins du double ? »
 *   DISCOVERY      « (BE) // (AM) ⇒ OB/OA = BE/AM » (choisie parmi trois phrases, jamais écrite d'avance)
 *   FORMALIZATION  خاصية طالس (module 1, étapes suivantes) ; حساب طول (module 3)
 *   TRANSFER       la مسألة de la leçon (le faisceau du projecteur), la synthèse de l'unité (une minaret)
 *
 * Toutes les vérités viennent de `logic/shadowMeet.js` (centimètres entiers). Aucune longueur n'est écrite PENDANT le glisser (rien d'autre que
 * la scène ne juge) ; les nombres n'apparaissent qu'à la rencontre.
 *
 * RÉEMPLOI : rien d'une leçon n'est écrit ici. Props d'une manche — `steps` : [{ object, objectName?, height, hour, task?, ask? }] (ou le
 * raccourci `object` / `objectName` / `height` / `hour` / `task` / `ask` pour une étape) ; `chains` ('read' | 'readEasy' | 'same' | 'flag' |
 * 'none') ; `predict` : ['stickSame', 'double'] (posées entre deux étapes) ; `choices` : { heights, hours } (manche libre) ; `lead`, `mission`,
 * `title`. Objets dessinés : lamp, tower, palm, pole, minaret (`objectName` nomme un objet autrement que `obj.<id>`).
 *
 * LECTEUR DE MISSION : `onVerdict { groups: l'étape, exact, free? }` (un ESSAI = une réponse — une hauteur, un drapeau ; la rencontre d'une étape
 * qui ne demande rien est `free`), `onTrial` ({ tk: 'predict' | 'reset' | 'retry' } et la trace), commandes figées pendant une prédiction ou une
 * question (`aria-disabled`), toujours guidé, pas de fête quand les étapes sont cachées, `LabCoach` (`logic › coachOf`), le journal et le verdict
 * dans la colonne, la question de la hauteur dans la colonne (`sidePanel`) : trois pastilles (`ask: 'tap'`) ou le modèle de réponse
 * « H = [ ] m » (`ask: 'type'`, `TemplateInput` — EXERCISE_CONTRACT § « قوالب الإجابة »). Hors lecteur (page, enseignant) : les étapes
 * (`LabStepper`), la fête, les mêmes questions par-dessus la scène.
 *
 * CONTRAT DOM : [data-shadow-meet][data-step][data-task][data-side][data-met][data-solved][data-stick-x], [data-sm-glance], [data-sm-scene],
 * [data-sm-track], [data-sm-stick] (role=slider), [data-sm-nudge=<±1|±10>], [data-sm-next], [data-sm-ask=tap|type|flag],
 * [data-sm-option=<texte>][data-state], [data-sm-check], [data-sm-verdict=<kind>], [data-sm-verdict-live], [data-sm-journal],
 * [data-sm-choices=height|hour], [data-sm-choice], [data-sm-hour], [data-sm-rays-label], [data-sm-dim=OB|BA|OA], [data-sm-tray].
 */
const ringCls = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2';
/** Au plus deux prédictions par manche. */
const PRED_MAX = 2;
/** Le temps pendant lequel un résultat de prédiction reste seul à l'écran avant la question de la manche. */
export const PRED_HOLD_MS = 1600;
/** L'aimant de la rencontre, en pixels d'écran (converti en cm par l'échelle de la scène). */
const MAGNET_PX = 10;
/** La bande du sol sous la ligne de terre : la poignée du bâton (SOUS le bâton, qui reste entièrement visible), puis deux rangées de cotes. */
const GROUND_PX = 84;
const TONE = { right: 'text-emerald-800', wrong: 'text-rose-800', meet: 'text-emerald-800', shade: 'text-slate-700', sun: 'text-amber-800', idle: 'text-slate-600' };
/** Un nombre à virgule dans une ligne de texte arabe : isolé, de gauche à droite. */
const Num = ({ children }) => <bdi dir="ltr" className="font-mono font-black">{children}</bdi>;
/** « BC/BE » → une vraie barre de fraction (les tuiles de la question du drapeau). */
export const ratioNode = (s) => {
  const [a, b] = String(s).split('/');
  return b ? <MathText>{`$\\tfrac{${a}}{${b}}$`}</MathText> : s;
};

export default function ShadowMeet({
  steps: stepsProp, object = 'tower', objectName, height: heightProp = '2,75', hour: hourProp = '14:00', task, ask,
  title, lead, mission, level, levels: withLevels = true, initialMode = 'student', allowModeSwitch = false,
  checkpoints: cpOn = true, coach: coachOn = true, onTrial, onFinished,
  // ── LECTEUR DE MISSION ──
  onVerdict, chains: chainsMode = 'none', predict: predictList = [], choices,
  // la manche de la synthèse (2026-11-10) : la hauteur de l'objet n'est jamais écrite — ni dans la scène, ni au journal, ni dans un verdict
  hideHeight = false,
}) {
  const { t } = useTranslation('lesson');
  const gameScreen = useInMissionPlayer();
  const reduce = useReducedMotion();
  const uid = useId();
  const journalId = `${uid}-journal`;
  const k = useCallback((key, o) => t(`manipulation.shadowMeet.${key}`, o), [t]);
  // les nombres de la manche : ceux de sa PREMIÈRE étape quand elle en déclare plusieurs (`steps`), sinon le raccourci height / hour
  const height = stepsProp?.[0]?.height ?? heightProp;
  const hour = stepsProp?.[0]?.hour ?? hourProp;
  const state = useManipulation({ type: 'shadow-meet', initialNumbers: { height, hour }, initialMode, initialLevel: level, withLevels, hintCount: 2 });
  const nums = state.numbers;
  // les étapes de la manche tant que ses nombres sont ceux de la leçon ; d'autres nombres (manche libre, autre niveau) : une étape
  const authored = String(nums.height) === String(height) && String(nums.hour ?? hour) === String(hour);
  const stepDefs = useMemo(
    () => (stepsProp?.length && authored ? stepsProp : [{ object, objectName, height: nums.height, hour: nums.hour ?? hour, task, ask }]),
    [stepsProp, authored, object, objectName, nums.height, nums.hour, hour, task, ask],
  );
  const make = () => L.init({ steps: stepDefs });
  const [lab, setLab] = useState(make);
  // Miroir synchrone de `lab` : un relâchement lit la position que le glisser vient de poser, avant le rendu.
  const labRef = useRef(lab);
  labRef.current = lab;
  const sceneKey = `${JSON.stringify(stepDefs)}|${state.epoch}`;
  const [scene, setScene] = useState({ key: sceneKey, inits: 0 });
  const [doneIds, setDoneIds] = useState([]);
  const [preds, setPreds] = useState({});          // { [key]: { ok, from } }
  const asked = useRef(new Set());
  const heardPred = useRef(new Set());
  const [shownPreds, setShownPreds] = useState([]);
  const [predHold, setPredHold] = useState(false);
  const holdTimer = useRef(null);
  const [missionBig, setMissionBig] = useState(false);
  const [draft, setDraft] = useState(null);         // la valeur tapée dans le modèle de réponse (texte), ou null
  const [said, setSaid] = useState(null);           // la dernière annonce hors verdict (heure, objet, choix)
  // LA SCÈNE DEVIENT FIGURE (conseil du 2026-11-11) : `parallelShown` — les chevrons de parallélisme, posés APRÈS que l'élève a désigné les
  // deux droites (jamais avant : ils donneraient la réponse) ; `asScene` — l'élève a demandé à revoir la place (bascule « الساحة / الشكل »)
  const [parallelShown, setParallelShown] = useState(false);
  const [asScene, setAsScene] = useState(false);
  if (scene.key !== sceneKey) {
    // « إعادة », d'autres nombres : TOUT repart — les étapes, les réponses, les questions, les prédictions
    const fresh = make();
    labRef.current = fresh;
    setScene({ key: sceneKey, inits: scene.inits + 1 }); setLab(fresh); setDoneIds([]);
    setPreds({}); asked.current = new Set(); heardPred.current = new Set(); setShownPreds([]); setPredHold(false); setDraft(null);
    setParallelShown(false); setAsScene(false);
  }
  // la manche (LabRounds) repart de zéro avec la scène
  useEffect(() => { if (gameScreen && scene.inits > 0) state.report(onTrial, { tk: 'reset' }); }, [scene.inits]); // eslint-disable-line react-hooks/exhaustive-deps

  const step = L.cur(lab);
  const side = L.sideOf(lab);
  const met = L.isMet(lab);
  const solved = L.isSolved(lab);
  const all = L.allSolved(lab);
  const objName = step.name ?? k(`obj.${step.object}`);
  const hourNow = L.HOURS[step.hour];

  /* ── les questions PENDANT le labo (primitives/LabCheckpoint) ── */
  const cpSettings = useLabCheckpointSettings('shadow-meet');
  const cpEnabled = cpOn && cpSettings.enabled;
  const chainList = chainsOf(chainsMode);
  // les prédictions JUGÉES : posées après l'étape `from`, jugées quand l'étape suivante est rencontrée
  const judgedPreds = Object.entries(preds).filter(([, p]) => L.predictionJudged(lab, p.from)).map(([key]) => key);
  const pendingPreds = judgedPreds.filter((key) => !heardPred.current.has(key));
  const holdChain = pendingPreds.length > 0 || predHold;
  const pendingChain = cpEnabled && !holdChain ? chainList.find((c) => c.reached(lab) && !doneIds.includes(c.id)) ?? null : null;
  const cp = useLabCheckpoint({
    id: pendingChain?.id ?? null,
    questions: pendingChain ? pendingChain.qs.map((q) => QUESTIONS[q](lab, k, objName)) : null,
    reached: !!pendingChain,
    resetKey: scene.inits,
    onRetry: () => {
      // la tâche repart de zéro ; la manche oublie ce que le labo vient de défaire (les prédictions déjà faites restent)
      const fresh = make();
      labRef.current = fresh; setLab(fresh); setDraft(null);
      celebrated.current = new Set();
      setParallelShown(false); setAsScene(false);
      state.report(onTrial, { tk: 'retry' });
    },
    onEvent: (ev) => {
      if (ev?.tk === 'checkpoint' && ev.q === 'parallelBuild' && (ev.ok || ev.revealed)) setParallelShown(true);
      state.report(onTrial, ev);
    },
    onDone: (id) => setDoneIds((d) => (d.includes(id) ? d : [...d, id])),
  });
  const chainsDone = chainList.every((c) => doneIds.includes(c.id));
  // la figure : dès que la suite « figure » est atteinte (la rencontre de l'étape 1), et tant que l'élève ne revient pas à la place
  const figureChain = chainList.find((c) => c.id === 'figure');
  // (la suite « read » d'abord : l'élève lit les longueurs SUR LA PLACE, puis la place se change en figure)
  const figureReached = Boolean(figureChain && lab.at === 0 && (pendingChain?.id === 'figure' || doneIds.includes('figure')));
  const asFigure = figureReached && !asScene;
  const finished = all && (!cpEnabled || chainsDone);
  useEffect(() => {
    if (!finished) return;
    state.discover(); state.formalize();
    state.report(onFinished, { steps: lab.steps.map((s) => ({ object: s.object, height: s.H, hour: L.HOURS[s.hour] })) });
  }, [finished]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── les étapes et la fête (page) ── */
  const showStepper = !gameScreen;
  const stepDone = lab.steps.map((_, i) => L.isSolved(lab, i));
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (!lab.solved.some(Boolean) && celebrated.current.size) celebrated.current = new Set();
  useEffect(() => {
    if (!showStepper) return;   // lecteur : pas de fête quand les étapes sont cachées
    stepDone.forEach((d, i) => {
      if (!d || celebrated.current.has(i)) return;
      celebrated.current.add(i);
      party.celebrate({ n: stepDone.filter(Boolean).length, total: stepDone.length });
    });
  }, [stepDone.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── la PRÉDICTION : à la charnière, quand l'étape est résolue et qu'une autre suit ── */
  const predQueue = gameScreen || cpEnabled ? predictList.slice(0, PRED_MAX) : [];
  const nextPred = predQueue.find((key) => !asked.current.has(key)) ?? null;
  const hinge = solved && L.hasNext(lab);
  const predictOpen = cpEnabled && hinge && nextPred != null && !cp.open && !pendingChain && !missionBig && L.predictTruth(lab, nextPred) != null;
  const askOpen = L.canAnswer(lab) && !cp.open && !pendingChain && !predictOpen && !holdChain && !missionBig;
  // la case de réponse se remonte VIDE quand elle revient : la valeur gardée par le labo part avec elle (revue 2026-11-10 — sinon « تحقّق »
  // envoyait une valeur que l'élève ne voyait plus, et la manche ⭐ perdait un de ses trois essais)
  useEffect(() => { if (!askOpen) setDraft(null); }, [askOpen]);
  const groundSr = (() => {
    const parts = [];
    if (step.task === 'meet' && met) parts.push(`BA = ${L.m(step.meetX)} m`, `OB = ${L.m(step.OB)} m`, `OA = ${L.m(step.OA)} m`);
    if (step.task !== 'meet') parts.push(`${k('stickShadow')} = ${L.m(step.OB)} m`);
    if (step.task === 'ratio' || (step.task === 'flag' && solved)) parts.push(`OA = ${L.m(step.OA)} m`);
    return parts.length ? k('groundSr', { list: parts.join('، ') }) : '';
  })();
  const locked = cp.open || predictOpen;
  const lockedRef = useRef(false);
  lockedRef.current = locked;
  const canAdvance = hinge && !predictOpen && !cp.open && !pendingChain && !holdChain;
  const boxRef = useRef(null);
  // le NŒUD de la scène change quand l'enveloppe passe à la mise en page de jeu (ses enfants sont remontés ailleurs dans l'arbre) : l'observateur
  // de taille doit suivre le nœud courant, pas celui du premier montage (vu à 1024 : la scène gardait une largeur périmée et débordait)
  const [boxEl, setBoxEl] = useState(null);
  const setBox = useCallback((el) => { boxRef.current = el; setBoxEl(el); }, []);
  const sayPredict = (says) => {
    const key = nextPred;
    const ok = says === L.predictTruth(labRef.current, key);
    asked.current.add(key);
    playSfx('pop');
    setPreds((p) => ({ ...p, [key]: { ok, from: labRef.current.at } }));
    state.report(onTrial, { tk: 'predict', ok });
    if (!predQueue.some((x) => x !== key && !asked.current.has(x))) {
      setTimeout(() => boxRef.current?.querySelector('[data-sm-next]')?.focus(), 60);
    }
  };
  const pendingSig = pendingPreds.join('|');
  useEffect(() => {
    if (!pendingSig) return;
    const keys = pendingSig.split('|');
    keys.forEach((key) => heardPred.current.add(key));
    setShownPreds(keys.map((key) => ({ key, ok: preds[key]?.ok })));
    playSfx(keys.every((key) => preds[key]?.ok) ? 'correct' : 'pop');
    setPredHold(true);
    clearTimeout(holdTimer.current);
    holdTimer.current = setTimeout(() => setPredHold(false), PRED_HOLD_MS);
  }, [pendingSig]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => clearTimeout(holdTimer.current), []);
  useEffect(() => { if (cp.open) setShownPreds([]); }, [cp.open]);

  /* ── mesure : largeur de la scène, écran de leçon, ce que le bloc « glance » mesure en plus ── */
  const glanceRef = useRef(null);
  const sceneHRef = useRef(280);
  const [width, setWidth] = useState(560);
  const [overhead, setOverhead] = useState(150);
  useLayoutEffect(() => {
    const el = boxEl;
    if (!el) return undefined;
    const measure = () => {
      setWidth(Math.max(220, Math.floor(el.clientWidth)));
      if (glanceRef.current) setOverhead(Math.max(90, Math.ceil(glanceRef.current.getBoundingClientRect().height) - sceneHRef.current));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (glanceRef.current) ro.observe(glanceRef.current);
    return () => ro.disconnect();
  }, [boxEl]);
  // Dans le lecteur de mission le labo est monté dans une copie cachée puis déplacé : on re-mesure aussi à chaque rendu (même valeur = aucun rendu).
  useLayoutEffect(() => {
    if (!gameScreen) return;
    const el = boxRef.current;
    if (el) { const w = Math.max(220, Math.floor(el.clientWidth)); setWidth((c) => (c === w ? c : w)); }
  });
  const vp = useLessonViewport(true);
  const screenH = vp.ready && vp.height > 0 ? vp.height : 640;
  const sceneW = Math.min(width, 980);
  const area = useMissionArea();
  // la question (prédiction, suite, hauteur) PREND la colonne du lecteur (mise en page de jeu, ≥ 900 px) ; sinon elle se pose au-dessus de la scène
  const inColumn = gameScreen && (area?.width ?? 0) >= 900;
  // lecteur : la scène laisse la place aux manches, à la ligne du soleil et aux commandes (aucun défilement)
  const playerRoom = gameScreen && area?.height > 0 ? Math.max(190, area.height - 266) : Infinity;
  const sceneH = Math.round(Math.max(190, Math.min(sceneW * 0.5, screenH - overhead - 28, 430, playerRoom)));
  sceneHRef.current = sceneH;
  const geo = useMemo(() => L.layout(lab, { width: sceneW, height: sceneH, pad: 12, sky: 26, ground: GROUND_PX }), [lab.steps, sceneW, sceneH]); // eslint-disable-line react-hooks/exhaustive-deps
  const magnet = Math.max(2, Math.min(30, Math.round(MAGNET_PX / geo.pxPerCm)));

  /* ── le geste : le bâton glisse sur le sol ── */
  const tick = useTick();
  const range = useMemo(() => ({ min: step.min, max: step.max }), [step.min, step.max]);
  const draggable = step.task === 'meet' && !met;
  const afterGesture = (next, prev) => {
    if (next === prev) return;
    labRef.current = next; setLab(next);
    if (next.last?.kind === 'meet') {
      playSfx('flag');
      const v = L.verdictOf(next);
      if (v) state.report(onVerdict, v);
      state.report(onTrial, L.evidenceOf(next));
    }
  };
  const st = useStretchInteraction({
    value: lab.stickX, range, direction: 'ltr', pageStep: 10,
    toValue: (cx, cy, rect) => geo.cmAt(cx - rect.left),
    onChange: (v) => {
      if (lockedRef.current || !draggable) return;
      const prev = labRef.current;
      const next = L.moveStick(prev, v, { magnet: st.dragging ? magnet : 0 });
      if (next !== prev) { tick(); labRef.current = next; setLab(next); }
    },
    onCommit: (v) => {
      if (lockedRef.current || !draggable) return;
      const prev = labRef.current;
      afterGesture(L.settle(L.moveStick(prev, v, { magnet: st.dragging ? magnet : 0 })), prev);
    },
  });

  /* ── répondre : une pastille, ou la valeur tapée dans le modèle ── */
  const respond = (cm) => {
    if (lockedRef.current) return;
    const prev = labRef.current;
    const next = L.answer(prev, cm);
    if (next === prev) return;
    labRef.current = next; setLab(next);
    // la même réponse fausse deux fois n'est pas un essai : son verdict « déjà essayée » s'affiche, rien n'est compté ni joué (revue 2026-11-10)
    if (next.last.repeat) return;
    playSfx(next.last.ok ? 'correct' : 'wrong');
    const v = L.verdictOf(next);
    if (v) state.report(onVerdict, v);
    state.report(onTrial, L.evidenceOf(next));
    if (next.last.ok) {
      setDraft(null);
      // la question se démonte : le focus va à « التالي » au lieu de tomber sur la page (revue a11y 2026-11-10)
      setTimeout(() => boxRef.current?.querySelector('[data-sm-next]')?.focus?.(), 80);
    }
  };
  const draftCm = draft == null ? null : parseHundredths(draft);
  const draftOk = draftCm != null && draftCm > 0;
  const check = () => { if (draftOk) respond(draftCm); };

  /* ── l'étape suivante : l'heure avance, ou un autre objet ── */
  const advance = () => {
    if (!canAdvance) return;
    const prev = labRef.current;
    const next = L.nextStep(prev);
    if (next === prev) return;
    labRef.current = next; setLab(next); setDraft(null);
    playSfx('pop');
    const s = L.cur(next);
    setSaid(next.last.hourChanged ? k('sayHour', { h: L.HOURS[s.hour] }) : k('sayObject', { obj: s.name ?? k(`obj.${s.object}`) }));
    setTimeout(() => boxRef.current?.querySelector(s.task === 'meet' ? '[data-sm-stick]' : '[data-sm-ask] input')?.focus?.(), 80);
  };

  /* ── le verdict : dérivé de l'état (jamais d'un « dernier geste » qui peut être un simple mouvement) ── */
  const lastAnswer = lab.last?.kind === 'answer' && lab.last.step === lab.at ? lab.last : null;
  const verdict = (() => {
    if (solved && step.task === 'flag') return { kind: 'right', node: k('v.flagRight', { obj: objName }) };
    if (solved && step.ask) return { kind: 'right', node: hideHeight ? k('v.meet', { obj: objName }) : <>{k('v.right', { obj: objName })} <Num>{`${L.m(step.H)} m`}</Num></> };
    if (lastAnswer && !lastAnswer.ok) {
      const key = lastAnswer.repeat ? 'v.repeat' : step.task === 'flag' ? `v.flag.${lastAnswer.why}` : `v.wrong.${lastAnswer.why}`;
      return { kind: 'wrong', node: <>{step.task === 'flag' ? k(lastAnswer.value < step.OA ? 'v.flagShort' : 'v.flagLong') : <>{k('v.not')} <Num>{`${L.m(lastAnswer.value)} m`}</Num>.</>} {k(key, { obj: objName })}</> };
    }
    if (step.task !== 'meet') return null;
    if (met) return { kind: 'meet', node: k('v.meet', { obj: objName }) };
    if (lab.last?.kind === 'drop') return { kind: side, node: k(`v.${side}`, { obj: objName }) };
    return null;
  })();
  const verdictKey = `${lab.at}:${met}:${solved}:${lab.wrong[lab.at].length}:${lastAnswer?.repeat ? 'r' : ''}:${lab.last?.kind === 'drop' ? lab.stickX : ''}`;
  const good = verdict && (verdict.kind === 'right' || verdict.kind === 'meet');
  const bad = verdict?.kind === 'wrong';
  const cue = (v) => (v.kind === 'right' || v.kind === 'meet' ? <><span aria-hidden="true">✓ </span><span className="sr-only">{k('cueRight')} </span></> : v.kind === 'wrong' ? <><span aria-hidden="true">✗ </span><span className="sr-only">{k('cueWrong')} </span></> : null);

  /* ── le guide (LabCoach) — jamais la réponse, jamais la place de la rencontre ── */
  const coachRaw = gameScreen && coachOn && !locked && !missionBig
    ? L.coachOf(lab, { asking: askOpen, canAdvance, done: finished || (all && !pendingChain) })
    : null;
  // un objet STABLE par étape du guide : LabCoach ne se réabonne pas à chaque mouvement de la poignée
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const coachStep = useMemo(() => coachRaw, [coachRaw?.id]);
  const coach = useLabCoach({
    lab: 'shadow-meet', step: coachStep, text: coachStep ? k(`coach.${coachStep.id}`) : '',
    labels: { hide: t('manipulation.common.coach.hide'), show: t('manipulation.common.coach.show'), ok: t('manipulation.common.coach.ok'), stop: t('manipulation.common.coach.stop') },
  });

  /* ── la question de la hauteur (ou du drapeau) : dans la colonne du lecteur, par-dessus la scène sur la page ── */
  const template = useMemo(() => (step.ask?.kind === 'type'
    ? templateFor({ answerType: 'rational', statement: `$${step.ask.symbol} = \\ldots\\,\\mathrm{m}$`, answerFormat: '' })
    : null), [step.ask?.kind, step.ask?.symbol]);
  const tapOptions = step.ask?.kind === 'tap' ? L.heightOptions(step) : [];
  const askKind = step.task === 'flag' ? 'flag' : step.ask?.kind;
  const askNode = askOpen ? (
    <div role="group" aria-labelledby={`${uid}-ask`} className="w-full space-y-4 rounded-[1.75rem] bg-white p-5 shadow-2xl ring-4 ring-indigo-200" data-sm-ask={askKind}>
      <p id={`${uid}-ask`} className="text-xl font-black leading-relaxed text-slate-900">{k(step.task === 'flag' ? 'ask.flagTitle' : 'ask.title', { obj: objName })}</p>
      <p className="text-sm font-bold text-slate-600">{k(step.task === 'flag' ? 'ask.flagLine' : step.task === 'ratio' ? 'ask.ratioLine' : 'ask.line')}</p>
      {step.ask.kind === 'tap' ? (
        <div className="grid gap-3" dir="ltr" data-sm-ask-zone>
          {tapOptions.map((o) => {
            const tried = lab.wrong[lab.at].includes(o.v);
            return (
              <button key={o.text} type="button" aria-disabled={tried || undefined} data-sm-option={o.text} data-state={tried ? 'wrong' : 'idle'}
                // aria-disabled, jamais disabled : le focus reste sur la pastille après un essai (le gestionnaire se garde lui-même)
                onClick={() => { if (!tried) respond(o.v); }}
                className={`min-h-[56px] rounded-2xl border-2 px-4 text-xl font-black ${ringCls} ${tried ? 'border-rose-200 bg-rose-50 text-rose-800 line-through' : 'border-indigo-600 bg-indigo-50 text-indigo-950 shadow-[0_3px_0_0_#A5B4FC] hover:border-indigo-700 active:translate-y-0.5'}`}>
                <bdi dir="ltr">{`${step.ask.symbol} = ${o.text} m`}</bdi>
                {tried && <><span aria-hidden="true"> ✗</span><span className="sr-only"> {k('cueWrong')}</span></>}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3" data-sm-ask-zone>
          <TemplateInput key={`${scene.inits}:${lab.at}`} template={template} onChange={(v) => setDraft(v?.value ?? null)} />
          <button type="button" onClick={check} aria-disabled={!draftOk || undefined} data-sm-check
            // aria-disabled, jamais disabled : le focus clavier reste sur le bouton (`check` se garde lui-même)
            className={`inline-flex min-h-[52px] items-center gap-2 rounded-2xl border-2 px-6 text-lg font-black ${ringCls} ${draftOk ? 'border-emerald-700 bg-emerald-700 text-white shadow-[0_3px_0_0_#065F46]' : 'border-slate-300 bg-slate-200 text-slate-600'}`}>
            {step.task === 'flag' && <span aria-hidden="true">🚩</span>} {k(step.task === 'flag' ? 'plant' : 'check')}
          </button>
        </div>
      )}
      {bad && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-bold leading-snug text-rose-800" data-sm-ask-why>{cue(verdict)}{verdict.node}</p>}
    </div>
  ) : null;

  const predPrompt = (key) => k(`predict.${key}.prompt`, { obj: objName, ob: L.m(step.OB), oa: L.m(step.OA), h: L.HOURS[lab.steps[lab.at + 1]?.hour ?? step.hour] });
  const trayNode = predictOpen ? (
    <PredictTray attr="sm" key={nextPred} step={predQueue.indexOf(nextPred) + 1} of={predQueue.length}
      title={t('manipulation.common.cp.predict.title')} prompt={predPrompt(nextPred)}
      options={L.predictOptions(nextPred).map((says) => ({ says, text: k(`predict.${nextPred}.${says}`) }))}
      onSay={sayPredict} />
  ) : cp.open ? cp.node : askNode;

  /* ── le journal « 📋 جدول تجاربك » ── */
  const rows = L.journalRows(lab, { hideHeight });
  const journalTable = rows.length > 0 && (
    <div data-sm-journal>
      <p id={journalId} className="text-sm font-black text-indigo-900"><span aria-hidden="true">📋 </span>{k('journal')}</p>
      <table className="mt-1 w-full table-fixed text-center text-xs" aria-labelledby={journalId}>
        <thead>
          <tr className="bg-slate-50">
            <th scope="col">{k('col.hour')}</th><th scope="col">{k('col.obj')}</th><th scope="col">{k('col.shadow')}</th>
            <th scope="col">{k('col.stick')}</th><th scope="col">{k('col.height')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.i} data-sm-row={r.solved ? 'solved' : 'open'}>
              <td className="border border-slate-200"><Num>{r.hour}</Num></td>
              <td className="border border-slate-200 font-bold">{r.name ?? k(`obj.${r.object}`)}</td>
              <td className="border border-slate-200">{r.shadow != null ? <Num>{L.m(r.shadow)}</Num> : <><span aria-hidden="true">…</span><span className="sr-only">{k('rowPending')}</span></>}</td>
              <td className="border border-slate-200"><Num>{L.m(r.stick)}</Num></td>
              <td className={`border border-slate-200 font-black ${r.height != null ? 'text-emerald-800' : 'text-slate-500'}`}>
                {r.height != null ? <Num>{L.m(r.height)}</Num> : <><span aria-hidden="true">؟</span><span className="sr-only">{k('rowPending')}</span></>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-1 text-xs text-slate-600">{k('journalUnit')}</p>
    </div>
  );

  const waitingText = k(step.task === 'meet' ? 'waiting.meet' : step.task === 'flag' ? 'waiting.flag' : 'waiting.ratio', { obj: objName });
  const verdictBox = (
    <div data-sm-verdict-box>
      {verdict ? (
        <p key={verdictKey} className={`rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-sm font-bold leading-snug ${TONE[verdict.kind]}`} data-sm-verdict={verdict.kind}>
          {cue(verdict)}{verdict.node}
        </p>
      ) : (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white/70 px-3 py-2 text-center text-sm font-bold text-slate-600" data-sm-verdict="">{waitingText}</p>
      )}
      {shownPreds.map((pr) => (
        <p key={pr.key} data-sm-predict-result={pr.ok ? 'ok' : 'wrong'} data-sm-predict-key={pr.key}
          className={`mt-2 rounded-2xl px-4 py-2 text-center text-lg font-black ${pr.ok ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
          {pr.ok ? t('manipulation.common.cp.predict.right') : k('predict.wrong')}
        </p>
      ))}
    </div>
  );
  const playerRepresentation = gameScreen && !(inColumn && trayNode) && (
    <div className="space-y-2" data-sm-player-col>
      {verdictBox}
      {journalTable}
    </div>
  );

  const missionText = mission ?? k(`mission.${step.task}`, { obj: objName });
  const nextLabel = L.hasNext(lab)
    ? (lab.steps[lab.at + 1].hour !== step.hour ? k('next.hour', { h: L.HOURS[lab.steps[lab.at + 1].hour] }) : k('next.object', { obj: lab.steps[lab.at + 1].name ?? k(`obj.${lab.steps[lab.at + 1].object}`) }))
    : null;
  const valueText = k(`side.${side}`, { obj: objName });
  const freeze = locked || !draggable;
  const nudges = [[-10, ChevronsLeft], [-1, ChevronLeft], [1, ChevronRight], [10, ChevronsRight]];

  return (
    <ManipulationShell
      type="shadow-meet"
      title={title ?? k('title')}
      mission={typeof missionText === 'string' ? <MathText>{missionText}</MathText> : missionText}
      lead={lead}
      state={state}
      coach={gameScreen && coachOn ? coach : null}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      headerAction={cpOn ? cpSettings.control : null}
      // l'écran de jeu est toujours GUIDÉ (les manches et les questions guident) ; la page l'est dès que les questions sont posées
      guided={cpEnabled || gameScreen}
      hideRepresentation={(inColumn && !!trayNode) || undefined}
      onIntroChange={gameScreen ? setMissionBig : undefined}
      sidePanel={inColumn && trayNode ? <div data-sm-tray>{trayNode}</div> : null}
      representation={gameScreen ? playerRepresentation : undefined}
      hints={[k('hint1', { obj: objName }), k('hint2', { obj: objName })]}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      discovery={null}
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-sky-50/70 to-white" minHeight="min-h-[160px]">
        <div ref={setBox} className="space-y-2" data-shadow-meet data-step={lab.at} data-steps={lab.steps.length} data-task={step.task} data-side={side}
          data-met={met ? 'true' : 'false'} data-solved={solved ? 'true' : 'false'} data-all-solved={all ? 'true' : 'false'}
          data-stick-x={lab.stickX} data-scene-h={sceneH}>
          <div className="relative space-y-2">
            {party.node}
            {/* la région vivante TOUJOURS montée : la colonne se démonte quand une question s'ouvre, l'annonce ne doit pas partir avec elle */}
            <div role="status" aria-live="polite" className="sr-only" data-sm-verdict-live>
              {verdict && <span key={verdictKey}>{good ? `${k('cueRight')} ` : bad ? `${k('cueWrong')} ` : ''}{verdict.node}</span>}
              {shownPreds.map((pr) => <span key={pr.key}> {pr.ok ? t('manipulation.common.cp.predict.right') : k('predict.wrong')}</span>)}
              {said && <span key={said}> {said}</span>}
            </div>
            {/* ce que le dessin écrit au sol, en TEXTE (le SVG est aria-hidden) : les questions disent « اقرأ على الأرض » (revue a11y 2026-11-10) */}
            <p className="sr-only" data-sm-ground-sr>{groundSr}</p>
            {!inColumn && trayNode && <div className="mx-auto max-w-xl" data-sm-tray>{trayNode}</div>}
            <div ref={glanceRef} className="space-y-2" data-sm-glance>
              {showStepper && lab.steps.length > 1 && <LabStepper count={lab.steps.length} current={lab.at} done={stepDone} stepAttr="data-sm-step" />}
              {choices && (
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
                  {[['height', choices.heights ?? [], String(nums.height)], ['hour', choices.hours ?? [], String(nums.hour ?? hour)]].map(([kind, list, on]) => (
                    <div key={kind} className="flex flex-wrap items-center gap-1.5" role="group" aria-labelledby={`${uid}-${kind}`} data-sm-choices={kind}>
                      <span id={`${uid}-${kind}`} className="text-sm font-bold text-slate-600">{k(kind === 'height' ? 'choicesHeights' : 'choicesHours')}</span>
                      {list.map((v) => (
                        <button key={v} type="button" data-sm-choice={`${kind}:${v}`} aria-pressed={String(v) === on} aria-disabled={locked || undefined}
                          onClick={() => {
                            if (lockedRef.current) return;
                            state.setNumbers({ height: kind === 'height' ? v : nums.height, hour: kind === 'hour' ? v : nums.hour ?? hour });
                            setSaid(k(kind === 'height' ? 'sayHeight' : 'sayHour', { h: v }));
                          }}
                          className={`min-h-[44px] rounded-xl border-2 px-3 text-sm font-black ${ringCls} ${String(v) === on ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'border-slate-300 bg-white text-slate-700'}`}>
                          <bdi dir="ltr">{kind === 'height' ? `${v} m` : v}</bdi>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
              {/* ce que le soleil fait, DIT : ses rayons sont parallèles ; et l'heure de la manche */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                <p className="rounded-full bg-amber-100 px-3 py-1 text-sm font-black text-amber-900" data-sm-rays-label><span aria-hidden="true">☀️ </span>{k('rays')}</p>
                <p className="rounded-full bg-sky-100 px-3 py-1 text-sm font-black text-sky-900" data-sm-hour={hourNow}><span aria-hidden="true">🕑 </span>{k('hour')} <Num>{hourNow}</Num></p>
              </div>
              <div className="relative mx-auto" style={{ width: sceneW, height: sceneH }} data-sm-scene>
                <Scene geo={geo} lab={lab} step={step} side={side} met={met} solved={solved && !hideHeight} reduce={reduce} unknown={k('unknown')}
                  figure={asFigure} parallel={parallelShown} />
                {figureReached && (
                  // la bascule : revoir la place, puis revenir à la figure — jamais une question de plus
                  <button type="button" onClick={() => setAsScene((v) => !v)} aria-pressed={!asScene} data-sm-morph={asFigure ? 'figure' : 'scene'}
                    className={`absolute end-2 top-2 inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border-2 border-indigo-300 bg-white/95 px-3 text-sm font-black text-indigo-900 shadow ${ringCls}`}>
                    <span aria-hidden="true">{asFigure ? '🏙️' : '📐'}</span>{k(asFigure ? 'morph.toScene' : 'morph.toFigure')}
                  </button>
                )}
                {/* la piste : toute la largeur du sol ; la poignée au pied du bâton */}
                <div {...st.trackProps} data-sm-track className="absolute inset-x-0"
                  style={{ ...st.trackProps.style, top: geo.groundY - 30, height: 78, ...(freeze ? { pointerEvents: 'none', cursor: 'default' } : {}) }}>
                  {step.task === 'meet' && (
                    <div {...st.handleProps({ label: k('handle'), valueText })} data-sm-stick aria-disabled={freeze || undefined}
                      // une cible de 44 px, un bouton rond de 34 px SOUS la ligne de terre : le bâton (parfois plus petit que la poignée) reste visible
                      className="group absolute flex h-11 w-11 items-start justify-center outline-none"
                      style={{ left: geo.x(lab.stickX) - 22, top: 32, cursor: freeze ? 'default' : st.dragging ? 'grabbing' : 'grab' }}>
                      <span dir="ltr" aria-hidden="true"
                        className={`flex h-[34px] w-[34px] items-center justify-center rounded-full border-[3px] font-mono text-[11px] font-extrabold shadow group-focus-visible:ring-4 group-focus-visible:ring-indigo-600 group-focus-visible:ring-offset-2 ${met ? 'border-emerald-700 bg-emerald-50 text-emerald-800' : st.dragging ? 'border-indigo-700 bg-white text-indigo-900' : 'border-indigo-500 bg-white text-indigo-900'}`}>
                        {met ? 'B✓' : '‹B›'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {/* les commandes dans l'ordre du dessin (l'objet à gauche, le soleil pousse les ombres vers la droite) */}
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5" dir="ltr" data-sm-controls>
                {step.task === 'meet' && nudges.map(([d, Icon]) => (
                  <button key={d} type="button" data-sm-nudge={d} aria-disabled={freeze || undefined}
                    onClick={() => { if (!lockedRef.current && draggable) st.nudge(d); }}
                    aria-label={k(d < 0 ? 'nudgeToward' : 'nudgeAway', { n: Math.abs(d), obj: objName })}
                    className={`inline-flex h-11 items-center justify-center gap-0.5 rounded-xl border-2 px-2 text-xs font-black ${ringCls} ${freeze ? 'border-slate-200 bg-slate-100 text-slate-400' : 'border-indigo-300 bg-white text-indigo-900'}`}>
                    <Icon className="h-5 w-5" aria-hidden="true" /><span aria-hidden="true">{Math.abs(d)}</span>
                  </button>
                ))}
                {nextLabel && (
                  <button type="button" onClick={advance} aria-disabled={!canAdvance || undefined} data-sm-next
                    className={`inline-flex min-h-[48px] items-center gap-2 rounded-2xl border-2 px-5 text-base font-black ${ringCls} ${canAdvance ? 'border-amber-700 bg-amber-700 text-white shadow-[0_3px_0_0_#78350F]' : 'border-slate-300 bg-slate-200 text-slate-600'}`}>
                    <span dir="rtl">{nextLabel}</span>
                  </button>
                )}
              </div>
              {!gameScreen && (
                <div className="min-h-[2.5rem]" data-sm-page-verdict>{verdictBox}</div>
              )}
            </div>
          </div>
          {!gameScreen && rows.length > 0 && <LabFold id="shadow-meet.trials" title={k('journal')}>{journalTable}</LabFold>}
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ══════════════ La scène : le ciel, le soleil et ses rayons parallèles, l'objet, le bâton, les ombres ══════════════ */

const INK = '#0F172A';
const textLtr = { direction: 'ltr', unicodeBidi: 'isolate' };

/** L'objet vertical, dessiné du pied (x, gy) au sommet (x, gy − h) : son sommet M est TOUJOURS sur l'axe (c'est lui qui fait le bout de l'ombre). */
function ObjectFigure({ id, x, gy, h, ghost = false }) {
  const top = gy - h;
  const dash = ghost ? { strokeDasharray: '5 4', fill: 'none', stroke: '#64748B', strokeWidth: 1.6 } : null;
  if (id === 'lamp') {
    const w = Math.max(10, Math.min(26, h * 0.12));
    return (
      <g data-sm-object="lamp">
        <rect x={x - w * 0.5} y={gy - 5} width={w} height={5} rx={1.5} fill="#334155" />
        <rect x={x - 2.5} y={top + h * 0.16} width={5} height={h * 0.84 - 4} fill="#475569" />
        <path d={`M${x - w * 0.55} ${top + h * 0.16} L${x + w * 0.55} ${top + h * 0.16} L${x + w * 0.34} ${top + h * 0.05} L${x - w * 0.34} ${top + h * 0.05} Z`} fill="#FDE68A" stroke="#92400E" strokeWidth={1.2} />
        <path d={`M${x - w * 0.42} ${top + h * 0.05} L${x} ${top} L${x + w * 0.42} ${top + h * 0.05} Z`} fill="#334155" />
      </g>
    );
  }
  if (id === 'palm') {
    const crown = top + h * 0.2;
    const r = Math.max(16, Math.min(54, h * 0.3));
    return (
      <g data-sm-object="palm">
        <path d={`M${x - 4} ${gy} Q${x - 7} ${gy - h * 0.45} ${x - 2} ${crown} L${x + 2} ${crown} Q${x + 1} ${gy - h * 0.45} ${x + 4} ${gy} Z`} fill="#92400E" />
        {[-150, -120, -60, -30, 160, 20].map((a) => {
          const rad = (a * Math.PI) / 180;
          const ex = x + Math.cos(rad) * r; const ey = crown + Math.sin(rad) * r * 0.62 + r * 0.28;
          return <path key={a} d={`M${x} ${crown} Q${(x + ex) / 2} ${crown - r * 0.5} ${ex} ${ey}`} fill="none" stroke="#15803D" strokeWidth={Math.max(3, r * 0.14)} strokeLinecap="round" />;
        })}
        <path d={`M${x} ${crown + 2} L${x} ${top}`} stroke="#16A34A" strokeWidth={Math.max(3, r * 0.14)} strokeLinecap="round" />
      </g>
    );
  }
  if (id === 'pole') {
    return (
      <g data-sm-object="pole" data-ghost={ghost ? 'true' : 'false'}>
        {ghost ? (
          <rect x={x - 3} y={top} width={6} height={h} rx={3} {...dash} />
        ) : (
          <>
            <rect x={x - 6} y={gy - 4} width={12} height={4} rx={1} fill="#334155" />
            <rect x={x - 2} y={top + 3} width={4} height={h - 6} fill="#94A3B8" stroke="#475569" strokeWidth={0.8} />
            <path d={`M${x + 2} ${top + 8} L${x + 2 + Math.min(34, h * 0.2)} ${top + 8 + Math.min(9, h * 0.05)} L${x + 2} ${top + 8 + Math.min(18, h * 0.1)} Z`} fill="#059669" />
            <circle cx={x} cy={top + 3} r={3} fill="#F59E0B" stroke="#92400E" strokeWidth={0.8} />
          </>
        )}
      </g>
    );
  }
  if (id === 'minaret') {
    const w = Math.max(14, Math.min(46, h * 0.17));
    return (
      <g data-sm-object="minaret">
        <rect x={x - w / 2} y={top + h * 0.3} width={w} height={h * 0.7} fill="#FDE68A" stroke="#92400E" strokeWidth={1.2} />
        <rect x={x - w * 0.68} y={top + h * 0.27} width={w * 1.36} height={h * 0.035} fill="#B45309" />
        <rect x={x - w * 0.32} y={top + h * 0.12} width={w * 0.64} height={h * 0.15} fill="#FEF3C7" stroke="#92400E" strokeWidth={1.2} />
        <path d={`M${x - w * 0.4} ${top + h * 0.12} L${x} ${top} L${x + w * 0.4} ${top + h * 0.12} Z`} fill="#0F766E" />
        <rect x={x - w * 0.12} y={gy - h * 0.14} width={w * 0.24} height={h * 0.14} rx={w * 0.12} fill="#92400E" />
      </g>
    );
  }
  // le château d'eau : quatre pieds en treillis, la cuve, le toit pointu
  const w = Math.max(26, Math.min(96, h * 0.42));
  const tankB = top + h * 0.42; const tankT = top + h * 0.14;
  return (
    <g data-sm-object="tower">
      {[-1, 1].map((s) => <line key={s} x1={x + s * w * 0.46} y1={gy} x2={x + s * w * 0.3} y2={tankB} stroke="#475569" strokeWidth={Math.max(2.5, w * 0.06)} strokeLinecap="round" />)}
      <line x1={x} y1={gy} x2={x} y2={tankB} stroke="#64748B" strokeWidth={Math.max(2, w * 0.045)} />
      <path d={`M${x - w * 0.43} ${gy - (gy - tankB) * 0.25} L${x + w * 0.36} ${gy - (gy - tankB) * 0.7} M${x + w * 0.43} ${gy - (gy - tankB) * 0.25} L${x - w * 0.36} ${gy - (gy - tankB) * 0.7}`} stroke="#94A3B8" strokeWidth={1.4} fill="none" />
      <rect x={x - w / 2} y={tankT} width={w} height={tankB - tankT} rx={Math.min(8, w * 0.12)} fill="#38BDF8" stroke="#075985" strokeWidth={1.4} />
      <rect x={x - w / 2} y={tankT + (tankB - tankT) * 0.55} width={w} height={(tankB - tankT) * 0.12} fill="#0284C7" opacity={0.55} />
      <path d={`M${x - w * 0.56} ${tankT} L${x} ${top} L${x + w * 0.56} ${tankT} Z`} fill="#0C4A6E" />
    </g>
  );
}

/** Une cote au sol : un trait entre deux abscisses, deux butées, sa longueur écrite au milieu (LTR). */
function Dim({ x1, x2, y, text, name, tone = '#334155' }) {
  const mid = (x1 + x2) / 2;
  return (
    <g data-sm-dim={name}>
      <line x1={x1} x2={x2} y1={y} y2={y} stroke={tone} strokeWidth={1.4} />
      <line x1={x1} x2={x1} y1={y - 4} y2={y + 4} stroke={tone} strokeWidth={1.4} />
      <line x1={x2} x2={x2} y1={y - 4} y2={y + 4} stroke={tone} strokeWidth={1.4} />
      <rect x={mid - 24} y={y - 8} width={48} height={16} rx={4} fill="#FFFFFF" opacity={0.92} />
      <text x={mid} y={y + 4} textAnchor="middle" fontSize={12} fontWeight={800} fill={tone} style={textLtr}>{text}</text>
    </g>
  );
}

export function Scene({ geo, lab, step, side, met, solved, reduce, unknown, figure = false, parallel = false }) {
  const { width, height, groundY: gy, x, y, scale } = geo;
  const flag = step.task === 'flag';
  const A = x(0); const Mtop = y(step.H);
  const O = x(step.OA);
  const B = x(lab.stickX); const Etop = y(L.STICK);
  const C = x(lab.stickX + step.OB);
  // la direction des rayons : de M (0, H) vers O (OA, 0) — la MÊME pour tous (ils sont parallèles)
  const len = Math.hypot(step.OA, step.H);
  const ux = step.OA / len; const uy = step.H / len;   // écran : +x à droite, +y en bas
  /** Le point d'où vient le rayon qui passe par (px, py) : remonté jusqu'au bord haut ou gauche de la scène. */
  const from = (px, py) => {
    const t = Math.min((px - 6) / ux, (py - 6) / uy);
    return [px - ux * t, py - uy * t];
  };
  const showObjShadow = !flag || solved || lab.flag != null;
  const objInstalled = !flag || lab.flag != null;
  const [sx, sy] = from(A, Mtop);
  const sunR = Math.max(11, Math.min(18, height * 0.05));
  const sun = [Math.max(sunR + 4, sx), Math.max(sunR + 4, sy)];
  const lit = side !== 'shade';
  const bg = [0.22, 0.48, 0.74].map((f) => from(width * f + (width * 0.2), gy));
  const stickPx = L.STICK * scale;
  const bands = Math.max(2, Math.round(stickPx / 12));
  const trans = reduce ? 'none' : 'opacity 240ms ease-out';
  // LA PLACE DEVIENT FIGURE : le décor s'efface (il reste deviné), les droites nommées se posent sur les objets que la main a placés
  const morph = reduce ? 'none' : 'opacity 700ms ease-in-out';
  const decor = { opacity: figure ? 0.16 : 1, transition: morph };
  const flagX = lab.flag != null ? x(lab.flag) : null;
  // sous la ligne de terre : les lettres des points (et la poignée du bâton), puis deux rangées de cotes
  const ROW1 = gy + 52; const ROW2 = gy + 71;
  return (
    <svg width={width} height={height} className="absolute inset-0" aria-hidden="true" focusable="false" style={{ direction: 'ltr' }}>
      {/* le ciel et le sol */}
      <rect x={0} y={0} width={width} height={gy} fill="#E0F2FE" />
      <rect x={0} y={gy} width={width} height={height - gy} fill="#E7E5E4" />
      <g style={decor}>
      <g data-deco="town" opacity={0.5}>
        {[0.62, 0.72, 0.84, 0.93].map((f, i) => {
          const bw = width * 0.07; const bh = [26, 40, 30, 22][i];
          return <rect key={f} x={width * f} y={gy - bh} width={bw} height={bh} fill="#CBD5E1" />;
        })}
      </g>
      <line x1={0} x2={width} y1={gy} y2={gy} stroke="#57534E" strokeWidth={2.5} />
      {/* les rayons du soleil : tous parallèles (le fond), celui du sommet de l'objet, celui du sommet du bâton */}
      <g data-sm-rays>
        {bg.map(([bx, by], i) => (
          <line key={i} x1={bx} y1={by} x2={width * [0.22, 0.48, 0.74][i] + width * 0.2} y2={gy} stroke="#FBBF24" strokeWidth={1} strokeDasharray="2 7" opacity={0.55} />
        ))}
        {showObjShadow && objInstalled && (
          <line x1={sx} y1={sy} x2={O} y2={gy} stroke="#D97706" strokeWidth={met ? 3 : 1.8} strokeDasharray={met ? undefined : '7 5'} data-sm-ray="object" />
        )}
        {lit && !met && (() => { const [ex, ey] = from(B, Etop); return <line x1={ex} y1={ey} x2={C} y2={gy} stroke="#D97706" strokeWidth={1.8} strokeDasharray="7 5" data-sm-ray="stick" />; })()}
      </g>
      <circle cx={sun[0]} cy={sun[1]} r={sunR} fill="#FBBF24" stroke="#F59E0B" strokeWidth={2} data-sm-sun />
      {/* les ombres au sol */}
      {showObjShadow && objInstalled && (
        <path d={`M${A} ${gy + 1} L${O} ${gy + 1} L${O - 6} ${gy + 9} L${A} ${gy + 9} Z`} fill="#1E293B" opacity={0.3} data-sm-shadow="object" />
      )}
      {lit && (
        <path d={`M${B} ${gy + 1} L${C} ${gy + 1} L${C - 4} ${gy + 7} L${B} ${gy + 7} Z`} fill="#312E81" opacity={0.62} style={{ transition: trans }} data-sm-shadow="stick" />
      )}
      {/* l'objet (un poteau pas encore planté : son gabarit en pointillés) */}
      <ObjectFigure id={step.object} x={A} gy={gy} h={step.H * scale} ghost={flag && lab.flag == null} />
      {/* le bâton de 1 m : des bandes rouges et blanches ; à l'ombre il s'assombrit et n'a pas d'ombre */}
      <g data-sm-stick-figure opacity={lit ? 1 : 0.62} style={{ transition: trans }}>
        {Array.from({ length: bands }, (_, i) => (
          <rect key={i} x={B - 3} y={gy - stickPx + (i * stickPx) / bands} width={6} height={stickPx / bands} fill={i % 2 ? '#F8FAFC' : '#DC2626'} stroke="#7F1D1D" strokeWidth={0.6} />
        ))}
      </g>
      </g>
      {/* le fond pâlit : la figure se lit sur du blanc */}
      <rect x={0} y={0} width={width} height={height} fill="#FFFFFF" style={{ opacity: figure ? 0.72 : 0, transition: morph }} />
      {/* LA FIGURE : [AM], [BE], la droite (OM) — le rayon —, la droite (OA) — le sol ; les chevrons seulement quand l'élève a désigné les parallèles */}
      <g data-sm-geo={figure ? 'on' : 'off'} style={{ opacity: figure ? 1 : 0, transition: morph }} aria-hidden="true">
        <line x1={A} y1={gy} x2={O} y2={gy} stroke="#334155" strokeWidth={2.6} data-sm-geo-line="OA" />
        <line x1={sx} y1={sy} x2={O} y2={gy} stroke="#B45309" strokeWidth={2.4} data-sm-geo-line="OM" />
        <line x1={A} y1={gy} x2={A} y2={Mtop} stroke="#0F172A" strokeWidth={3.2} data-sm-geo-line="AM" />
        <line x1={B} y1={gy} x2={B} y2={Etop} stroke="#4338CA" strokeWidth={3.2} data-sm-geo-line="BE" />
        {[[A, Mtop], [B, Etop]].map(([px, top]) => <circle key={`${px}`} cx={px} cy={top} r={3.5} fill={INK} />)}
        <circle cx={A} cy={gy} r={3.5} fill={INK} />
        {/* les angles droits en A et en B : la RAISON du parallélisme se voit sur la figure */}
        {[A, B].map((px) => <polyline key={`ra${px}`} points={`${px},${gy - 10} ${px + 10},${gy - 10} ${px + 10},${gy}`} fill="none" stroke="#E11D48" strokeWidth={1.6} data-sm-geo-right />)}
        {parallel && [[A, Mtop, '#0F172A'], [B, Etop, '#4338CA']].map(([px, top, c]) => {
          const my = (gy + top) / 2;
          return <polyline key={`ch${px}`} points={`${px - 6},${my + 5} ${px},${my - 3} ${px + 6},${my + 5}`} fill="none" stroke={c} strokeWidth={2.4} data-sm-geo-parallel />;
        })}
      </g>
      {/* le drapeau du pronostic */}
      {flagX != null && (
        <g data-sm-flag>
          <line x1={flagX} x2={flagX} y1={gy} y2={gy - 30} stroke={INK} strokeWidth={2} />
          <path d={`M${flagX} ${gy - 30} L${flagX + 16} ${gy - 24} L${flagX} ${gy - 18} Z`} fill={solved ? '#059669' : '#E11D48'} />
        </g>
      )}
      {/* les points nommés */}
      <text x={A} y={gy + 22} textAnchor="middle" fontSize={13} fontWeight={800} fill={INK} style={textLtr}>A</text>
      {objInstalled && <text x={A - 12} y={Mtop + 2} textAnchor="end" fontSize={13} fontWeight={800} fill={INK} style={textLtr}>M</text>}
      {step.task !== 'meet' && <text x={B} y={gy + 22} textAnchor="middle" fontSize={13} fontWeight={800} fill={INK} style={textLtr}>B</text>}
      <text x={B - 7} y={Etop + 4} textAnchor="end" fontSize={13} fontWeight={800} fill={INK} style={textLtr}>E</text>
      {met && <text x={O + 4} y={gy + 22} textAnchor="start" fontSize={13} fontWeight={800} fill="#92400E" style={textLtr}>O</text>}
      {flag && <text x={C + 4} y={gy + 22} textAnchor="start" fontSize={13} fontWeight={800} fill={INK} style={textLtr}>C</text>}
      {flag && flagX != null && <text x={flagX + 4} y={gy + 22} textAnchor="start" fontSize={13} fontWeight={800} fill="#92400E" style={textLtr}>O</text>}
      {met && <circle cx={O} cy={gy} r={5} fill="#F59E0B" stroke="#92400E" strokeWidth={1.5} data-sm-meet-point />}
      {/* les hauteurs : le bâton (connue), l'objet (« ؟ » tant qu'elle n'est pas trouvée) */}
      <text x={B + 8} y={Math.min(gy - 5, gy - stickPx / 2 + 4)} fontSize={11} fontWeight={800} fill="#7F1D1D" style={textLtr}>1 m</text>
      <text x={A + Math.max(18, step.H * scale * 0.24)} y={Mtop + Math.max(16, step.H * scale * 0.5)} fontSize={flag || solved ? 13 : 20} fontWeight={900}
        fill={flag || solved ? '#065F46' : '#B45309'} style={textLtr} data-sm-height-label>
        {flag || solved ? `${L.m(step.H)} m` : unknown}
      </text>
      {/* les longueurs au sol : seulement ce qui est mesuré — l'ombre du bâton au soleil, les trois longueurs à la rencontre */}
      {step.task === 'meet' && met && (
        <>
          <Dim name="BA" x1={A} x2={B} y={ROW1} text={`${L.m(step.meetX)} m`} />
          <Dim name="OB" x1={B} x2={O} y={ROW1} text={`${L.m(step.OB)} m`} tone="#312E81" />
          <Dim name="OA" x1={A} x2={O} y={ROW2} text={`${L.m(step.OA)} m`} tone="#B45309" />
        </>
      )}
      {step.task === 'meet' && !met && lit && <Dim name="stick" x1={B} x2={C} y={ROW1} text={`${L.m(step.OB)} m`} tone="#312E81" />}
      {step.task !== 'meet' && <Dim name="stick" x1={B} x2={C} y={ROW1} text={`${L.m(step.OB)} m`} tone="#312E81" />}
      {step.task === 'ratio' && <Dim name="OA" x1={A} x2={O} y={ROW1} text={`${L.m(step.OA)} m`} tone="#B45309" />}
      {flag && solved && <Dim name="OA" x1={A} x2={O} y={ROW1} text={`${L.m(step.OA)} m`} tone="#B45309" />}
    </svg>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/**
 * Les suites de questions, par mode : chacune { id, reached(lab), qs } — l'id est le point d'étape de la manche (`{ checkpoint: id }`), posé quand
 * ce qu'il interroge est à l'écran.
 *   read     « read » à la rencontre de l'étape 1 : lire OB et OA au sol (les trois longueurs en pastilles), puis BÂTIR « BE/AM = OB/OA » (BE/AM
 *            posé à gauche ; OB, OA et le leurre BA — la قطعة) ; « rule » quand la hauteur est trouvée : choisir la phrase parmi trois.
 *   readEasy « read » seul, sans le bâti.
 *   same     quand toutes les étapes sont résolues (deux heures) : ce qui n'a pas changé — le rapport OB/OA.
 *   readFigure (talis-hisab-atwal, manche 1 — conseil du 2026-11-11) : « read » (lire OB et OA SUR LA PLACE) ; puis la place DEVIENT FIGURE
 *            (`figure`) : désigner les deux droites parallèles parmi (AM), (BE), (OM), (OA) — les chevrons se posent ensuite — et dire POURQUOI
 *            (deux droites perpendiculaires à la même droite (OA), une raison qui vaut sans sol) ; puis « ratio » (bâtir l'égalité) — l'hypothèse
 *            AVANT la conclusion — et « rule » quand la hauteur est trouvée.
 *   flag     quand le drapeau est juste : le rapport du poteau = celui du bâton (le leurre : le rapport INVERSÉ, une tuile).
 */
const metFirst = (lab) => L.isMet(lab, 0);
export const CHAINS = Object.freeze({
  read: [{ id: 'read', reached: metFirst, qs: ['segFill', 'ratioBuild'] }, { id: 'rule', reached: (lab) => L.isSolved(lab, 0), qs: ['rulePick'] }],
  readEasy: [{ id: 'read', reached: metFirst, qs: ['segFill'] }],
  readFigure: [
    { id: 'read', reached: metFirst, qs: ['segFill'] },
    { id: 'figure', reached: metFirst, qs: ['parallelBuild', 'parallelWhy'] },
    { id: 'ratio', reached: metFirst, qs: ['ratioBuild'] },
    { id: 'rule', reached: (lab) => L.isSolved(lab, 0), qs: ['rulePick'] },
  ],
  same: [{ id: 'same', reached: (lab) => lab.steps.length > 1 && L.allSolved(lab), qs: ['sameWhat'] }],
  flag: [{ id: 'build', reached: (lab) => L.cur(lab).task === 'flag' && L.isSolved(lab), qs: ['flagBuild'] }],
  // la synthèse (2026-11-10) : la rencontre seule, puis POURQUOI ici — une phrase parmi trois, sans nombre
  why: [{ id: 'why', reached: metFirst, qs: ['whyMeet'] }],
  none: [],
});
export const chainsOf = (mode) => CHAINS[mode] ?? [];

const spinList = (xs, seed) => { const s = ((seed % xs.length) + xs.length) % xs.length; return xs.map((_, i) => xs[(i + s) % xs.length]); };
const seedOf = (lab) => lab.steps[0].H / 25 + lab.steps[0].hour;

const RAW_QUESTIONS = {
  /* à la rencontre : lire au sol OB (l'ombre du bâton) et OA (l'ombre de l'objet) — BA, la قطعة, est la troisième pastille */
  segFill: (lab, k, obj) => {
    const s = lab.steps[0];
    const o = { obj, ob: $(tex(s.OB)), oa: $(tex(s.OA)), ba: $(tex(s.meetX)) };
    const options = L.readOptions(s);
    return {
      id: 'segFill', kind: 'fill', prompt: Mx(k, 'segFill.prompt', o),
      fields: [
        { label: <MathText>{'$OB$'}</MathText>, expected: L.m(s.OB), options },
        { label: <MathText>{'$OA$'}</MathText>, expected: L.m(s.OA), options },
      ],
      hints: [Mx(k, 'segFill.hint1', o), Mx(k, 'segFill.hint2', o)], explain: Mx(k, 'segFill.explain', o),
    };
  },
  /* BÂTIR « BE/AM = OB/OA » : BE/AM déjà posé à gauche ; OB, OA et le leurre BA ; l'égalité dans l'autre sens est acceptée */
  ratioBuild: (lab, k, obj) => {
    const rest = spinList(['OB', 'OA', 'BA'], seedOf(lab));
    const o = { obj };
    return {
      id: 'ratioBuild', kind: 'build', prompt: Mx(k, 'ratioBuild.prompt', o),
      slots: [k('cp.ratioBuild.slotSmall'), k('cp.ratioBuild.slotBig'), k('cp.ratioBuild.slotSmall'), k('cp.ratioBuild.slotBig')],
      ops: ['/', '=', '/'],
      tiles: ['BE', 'AM', ...rest], preset: ['BE', 'AM', null, null],
      expected: ['BE', 'AM', 'OB', 'OA'], accept: [['OB', 'OA', 'BE', 'AM']],
      hints: [Mx(k, 'ratioBuild.hint1', o), Mx(k, 'ratioBuild.hint2', o)], explain: Mx(k, 'ratioBuild.explain', o),
    };
  },
  /* la place est devenue figure : les deux droites parallèles, en tuiles (les quatre droites nommées du dessin ; l'ordre est libre) */
  parallelBuild: (lab, k) => ({
    id: 'parallelBuild', kind: 'build', prompt: Mx(k, 'parallelBuild.prompt', {}),
    slots: [k('cp.parallelBuild.slot'), k('cp.parallelBuild.slot')], ops: ['∥'],
    tiles: spinList(['(AM)', '(BE)', '(OM)', '(OA)'], seedOf(lab)), preset: [null, null],
    expected: ['(AM)', '(BE)'], accept: [['(BE)', '(AM)']],
    hints: [Mx(k, 'parallelBuild.hint1', {}), Mx(k, 'parallelBuild.hint2', {})], explain: Mx(k, 'parallelBuild.explain', {}),
  }),
  /* POURQUOI elles sont parallèles : une raison de géométrie, vraie sans sol ni « debout » (deux faux amis vrais mais qui ne prouvent rien) */
  parallelWhy: (lab, k) => ({
    id: 'parallelWhy', kind: 'choice', prompt: Mx(k, 'parallelWhy.prompt', {}),
    options: [
      { text: Mx(k, 'parallelWhy.right', {}), correct: true },
      { text: Mx(k, 'parallelWhy.cut', {}), why: Mx(k, 'parallelWhy.whyCut', {}) },
      { text: Mx(k, 'parallelWhy.meet', {}), why: Mx(k, 'parallelWhy.whyMeet', {}) },
    ],
    hints: [Mx(k, 'parallelWhy.hint1', {}), Mx(k, 'parallelWhy.hint2', {})], explain: Mx(k, 'parallelWhy.explain', {}),
  }),
  /* la règle : une phrase parmi trois (la bonne, la قطعة BA, un rapport inversé) */
  rulePick: (lab, k, obj) => {
    const s = lab.steps[0];
    const o = { obj, ob: $(tex(s.OB)), ba: $(tex(s.meetX)), oa: $(tex(s.OA)), h: $(tex(s.H)) };
    return {
      id: 'rulePick', kind: 'choice', prompt: Mx(k, 'rulePick.prompt', o),
      options: [
        { text: Mx(k, 'rulePick.right', o), correct: true },
        { text: Mx(k, 'rulePick.segment', o), why: Mx(k, 'rulePick.whySegment', o) },
        { text: Mx(k, 'rulePick.inverted', o), why: Mx(k, 'rulePick.whyInverted', o) },
      ],
      hints: [Mx(k, 'rulePick.hint1', o), Mx(k, 'rulePick.hint2', o)], explain: Mx(k, 'rulePick.explain', o),
    };
  },
  /* deux heures : tout a changé au sol, sauf le rapport OB/OA */
  sameWhat: (lab, k, obj) => {
    const a = lab.steps[0]; const b = lab.steps.at(-1);
    const [n, d] = L.ratioText(a).split('/');
    const o = {
      obj, h1: L.HOURS[a.hour], h2: L.HOURS[b.hour], r: $(`\\dfrac{${n}}{${d}}`),
      ob1: $(tex(a.OB)), ob2: $(tex(b.OB)), oa1: $(tex(a.OA)), oa2: $(tex(b.OA)),
      f1: $(`\\dfrac{${tex(a.OB)}}{${tex(a.OA)}}`), f2: $(`\\dfrac{${tex(b.OB)}}{${tex(b.OA)}}`),
    };
    return {
      id: 'sameWhat', kind: 'choice', prompt: Mx(k, 'sameWhat.prompt', o),
      options: [
        { text: Mx(k, 'sameWhat.right', o), correct: true },
        { text: Mx(k, 'sameWhat.ob', o), why: Mx(k, 'sameWhat.whyOb', o) },
        { text: Mx(k, 'sameWhat.oa', o), why: Mx(k, 'sameWhat.whyOa', o) },
      ],
      hints: [Mx(k, 'sameWhat.hint1', o), Mx(k, 'sameWhat.hint2', o)], explain: Mx(k, 'sameWhat.explain', o),
    };
  },
  /* la synthèse : pourquoi les deux ombres finissent ici — un rayon unique par les deux sommets (ni « ombre = longueur », ni « au milieu ») */
  whyMeet: (lab, k, obj) => ({
    id: 'whyMeet', kind: 'choice', prompt: Mx(k, 'whyMeet.prompt', { obj }),
    options: [
      { text: Mx(k, 'whyMeet.right', { obj }), correct: true },
      { text: Mx(k, 'whyMeet.equal', { obj }), why: Mx(k, 'whyMeet.whyEqual', { obj }) },
      { text: Mx(k, 'whyMeet.middle', { obj }), why: Mx(k, 'whyMeet.whyMiddle', { obj }) },
    ],
    hints: [Mx(k, 'whyMeet.hint1', { obj }), Mx(k, 'whyMeet.hint2', { obj })], explain: Mx(k, 'whyMeet.explain', { obj }),
  }),
  /* le drapeau : le rapport du poteau (ombre ÷ hauteur) est celui du bâton — le rapport inversé est une TUILE, pas un nombre */
  flagBuild: (lab, k, obj) => {
    const s = L.cur(lab);
    const o = { obj, hx: tex(s.H), kx: tex(s.OB), oax: tex(s.OA) };
    return {
      id: 'flagBuild', kind: 'build', prompt: Mx(k, 'flagBuild.prompt', o),
      slots: [k('cp.flagBuild.slotPole', o), k('cp.flagBuild.slotStick')], ops: ['='],
      tiles: ['AO/AM', ...spinList(['BC/BE', 'BE/BC', 'BC/AM'], seedOf(lab))], preset: ['AO/AM', null],
      expected: ['AO/AM', 'BC/BE'], accept: [['BC/BE', 'AO/AM']], render: ratioNode,
      hints: [Mx(k, 'flagBuild.hint1', o), Mx(k, 'flagBuild.hint2', o)], explain: Mx(k, 'flagBuild.explain', o),
    };
  },
};

export const QUESTIONS = spreadAll(RAW_QUESTIONS, seedOf);
