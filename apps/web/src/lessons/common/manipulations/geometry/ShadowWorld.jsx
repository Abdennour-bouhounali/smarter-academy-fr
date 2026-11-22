import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import { Minus, Plus, Ruler, Check } from 'lucide-react';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import EquationDisplay from '../primitives/EquationDisplay';
import LabFold from '../primitives/LabFold';
import MathText from '../../components/MathText';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import { spreadAll } from './thalesCp';
import * as W from '../logic/shadowWorld';
import ShadowTutor from './ShadowTutor';

/**
 * Les DEUX options tapées de chaque checkpoint (logic/shadowWorld.js § les questions TAPÉES de مقران) : l'ordre
 * ici décide l'ordre à l'écran, les ids correspondent EXACTEMENT au `correct` que chaque juge retourne — jamais
 * de texte en dur ici, le libellé vient de `quizOpt_<quizId>_<optId>` (i18n).
 */
const QUIZ_OPTIONS = Object.freeze({
  trend: ['longer', 'shorter'],
  fastest: ['minaret', 'stick'],
  ratioSeed: ['same', 'different'],
  ruleReflect: ['form', 'number'],
  // predictReflect : pas de liste fixe — `options` vient de `judgePredictReflect` (un distracteur par modèle).
});

/**
 * shadow-world — « ساحة الحيّ » : un MONDE où l'élève vit un après-midi, et où la loi de Thalès des ombres
 * (unité 9, le تحدّ p. 103) n'est jamais donnée : l'élève la construit, le monde la réfute ou la confirme, et le
 * compagnon مقران l'accompagne par des QUESTIONS. Il remplace, dans la synthèse, le bâton sur un rail
 * (`shadow-stick`, conservé dans le registre).
 *
 * CE QUE LA MAIN FAIT (six gestes, un monde)
 *   ☀  tenir le SOLEIL et le promener dans le ciel (12:30 → 16:00, le soleil réel d'Alger le 13 octobre) :
 *      toutes les ombres de la place bougent ENSEMBLE — c'est la variable du phénomène ;
 *   📏 le RUBAN : tirer du pied d'un objet jusqu'au bout de son ombre ; la mesure s'écrit dans la كرّاسة.
 *      Le ruban qu'on tire vers le haut de la minaret RETOMBE : la hauteur est inaccessible, tout le problème ;
 *   🪵 planter le BÂTON n'importe où ; sa tête entre dans l'ombre de la minaret et son ombre DISPARAÎT —
 *      à la frontière exacte, les deux ombres finissent ensemble : la méthode du manuel, découverte, pas dite ;
 *   🚩 PARIER : la commune va installer un lampadaire (3 m) puis une hampe (6 m) ; l'élève plante le drapeau là
 *      où l'ombre finira, puis fait installer : l'ombre réelle tranche, et le pari révèle SON modèle
 *      (additif, copie, égal, inversé, juste — `classify`) ; un pari juste à 12:30 ne prouve rien (k = 1) ;
 *   ✍  « قاعدتي » : l'élève ÉCRIT sa loi (ombre = hauteur + n, ou × n) ; le monde plante des drapeaux violets
 *      à chaque bout d'ombre prédit, sur TOUS les objets connus — une règle qui ne marche que pour le bâton est
 *      réfutée par فريد. Quand le soleil bouge, les drapeaux restent : la règle se décolle sous les yeux ;
 *   ❓ l'élève répond au défi (hauteur de la minaret) ; une mauvaise réponse est LUE : ombre prise pour la
 *      hauteur, rapport retourné, différence, deux heures mélangées, distance AB (`judgeHeight`).
 *
 * LE COMPAGNON (مقران, du manuel) : il réagit au DERNIER geste par une observation chiffrée suivie d'une
 * question (`react`), sinon il pose la question du moment (`guide`) ; « ساعدني » ouvre trois paliers de
 * questions de plus en plus serrées (`help`) — aucun ne donne k ni la hauteur. La découverte (`discoveryReady`)
 * exige : trois heures vues, deux ombres mesurées à la même heure, un pari, une règle × juste PUIS réparée à
 * une autre heure ; la synthèse est écrite avec LES DEUX RÈGLES DE L'ÉLÈVE.
 *
 * Toute la mathématique est dans logic/shadowWorld.js (centimètres entiers, exact). La vue ne décide de rien.
 *
 * Props : `minaret` (mètres, multiple de 0,25), `theme`, `title`, `lead`, `mission`, `level`, `levels`,
 * `onTrial(evidence)` à chaque geste jugé, `onFinished({ h })` quand la hauteur est trouvée — par `state.report`.
 *
 * CONTRAT DOM : [data-shadow-world][data-hour][data-goal][data-solved], [data-sw-glance], [data-sw-sun]
 * (role=slider), [data-sw-sun-earlier|later], [data-sw-stick-handle] (role=slider), [data-sw-measure-toggle],
 * [data-sw-measure=<obj>], [data-sw-flag-handle], [data-sw-install], [data-sw-op=+|×], [data-sw-rule-num],
 * [data-sw-rule-try], [data-sw-ghost=<obj>][data-ok], [data-sw-companion][data-msg], [data-sw-help],
 * [data-sw-notebook], [data-sw-quest=<id>][data-done], [data-sw-answer], [data-sw-answer-btn], [data-sw-rope], [data-deco].
 */
export default function ShadowWorld({
  minaret: minaret0 = '7,25', theme = 'minaret', title, lead, mission, level, levels: withLevels = true,
  initialMode = 'student', allowModeSwitch = false, checkpoints: cpOn = true, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`manipulation.shadowWorld.${key}`, o), [t]);
  const state = useManipulation({ type: 'shadow-world', initialNumbers: { minaret: minaret0 }, initialMode, initialLevel: level, withLevels, hintCount: 0 });
  const reduce = useReducedMotion();
  const make = () => W.init({ minaret: String(state.numbers.minaret) });
  const [lab, setLab] = useState(make);
  const sceneKey = `${state.numbers.minaret}|${state.epoch}`;
  const [scene, setScene] = useState({ key: sceneKey, inits: 0 });
  const [doneIds, setDoneIds] = useState([]);   // les arrêts dont la suite de questions est finie
  const [liveT, setLiveT] = useState(null);
  const [liveStick, setLiveStick] = useState(null);
  const [liveFlag, setLiveFlag] = useState(null);
  const [tape, setTape] = useState(null); // { obj, from, to, hour, live, climbing, snapped }
  const [measuring, setMeasuring] = useState(false);
  const [helpLevel, setHelpLevel] = useState(0);
  const [op, setOp] = useState(null);
  const [num, setNum] = useState('');
  const [ruleError, setRuleError] = useState(false);
  const [ans, setAns] = useState('');
  const [betOpen, setBetOpen] = useState(false); // le pari optionnel (2ᵉ installation), replié en puce une fois l'étape faite
  const [tried, setTried] = useState({ quizId: null, ids: [] }); // les options FAUSSES déjà tapées pour la question affichée
  const [thread, setThread] = useState([]); // la conversation avec مقران : { key, who: 'maqran' | 'you', msg | spec, tone, kind }
  const entrySeq = useRef(0);
  if (scene.key !== sceneKey) {
    setScene({ key: sceneKey, inits: scene.inits + 1 }); setDoneIds([]); setLab(make()); setLiveT(null); setLiveStick(null); setLiveFlag(null); setTape(null);
    setMeasuring(false); setHelpLevel(0); setOp(null); setNum(''); setAns(''); setTried({ quizId: null, ids: [] }); setThread([]);
  }

  useEffect(() => { setBetOpen(false); }, [lab.predictions.length]);
  const solvedAll = W.discoveryReady(lab);
  const solved = W.goals(lab).minaret;

  /* ── les questions PENDANT le labo (primitives/LabCheckpoint) : six arrêts = les six objectifs ; chacun s'ouvre sur une suite de questions
     posée quand l'élève a fait ce qu'il demande (les cinq questions tapées de مقران en font partie) ; la suite de l'arrêt « rule2 » finit
     par la règle et remplace la découverte automatique. Sans suite (enseignant), مقران pose ses questions comme avant. ── */
  const cpSettings = useLabCheckpointSettings('shadow-world');
  const cpEnabled = cpOn && cpSettings.enabled;
  const stops = W.STOPS;
  const stopOk = Object.fromEntries(stops.map((id) => [id, W.stopReached(lab, id)]));
  const pending = cpEnabled ? stops.find((id) => stopOk[id] && !doneIds.includes(id)) ?? null : null;
  const chain = pending ? chainOf(pending, lab) : null;
  const say = useMemo(() => makeSay(k), [k]);
  const cp = useLabCheckpoint({
    id: chain ? pending : null,
    questions: chain ? chain.map((q) => QUESTIONS[q](lab, pending, k, say)) : null,
    reached: !!pending,
    resetKey: scene.inits,
    onRetry: () => { celebrated.current.delete(pending); setTape(null); setLab((x) => W.retryStop(x, pending)); },
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => {
      setDoneIds((d) => (d.includes(id) ? d : [...d, id]));
      if (W.QUIZZES_OF_STOP[id]) setLab((x) => W.winQuizzes(x, W.QUIZZES_OF_STOP[id]));
      if (chainOf(id, lab).includes('rule')) { state.discover(); state.formalize(); }
    },
  });
  const ready = solvedAll && !cpEnabled;
  const goalsNow = W.goals(lab);
  const stepDone = stops.map((id) => !!goalsNow[id] && (!cpEnabled || doneIds.includes(id) || !W.stopReached(lab, id)));
  const stepNow = stepDone.includes(false) ? stepDone.indexOf(false) : stops.length - 1;
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  const celKey = useRef(scene.inits);
  if (celKey.current !== scene.inits) { celKey.current = scene.inits; celebrated.current = new Set(); }   // « إعادة » : on refête
  useEffect(() => {
    stepDone.forEach((d, i) => {
      if (!d || celebrated.current.has(stops[i])) return;
      celebrated.current.add(stops[i]);
      party.celebrate({ n: stepDone.filter(Boolean).length, total: stops.length });
    });
  }, [stepDone.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps
  // le son : un déclic par geste, la cloche quand les deux ombres se rejoignent, le drapeau quand c'est juste, « over » quand c'est refusé
  useEffect(() => {
    const l = lab.last;
    if (!l) return;
    if (l.kind === 'sun') playSfx('tooth', { pitch: l.to > l.from ? 1 : 0.8 });
    else if (l.kind === 'stick') playSfx(l.meet ? 'bell' : 'tooth');
    else if (l.kind === 'measure') playSfx('tooth');
    else if (l.kind === 'measureHidden' || l.kind === 'climb' || l.kind === 'answerInvalid') playSfx('over');
    else if (l.kind === 'install') playSfx(l.pred.kind === 'right' ? 'flag' : 'over');
    else if (l.kind === 'rule') playSfx(l.trial.allFit ? 'flag' : 'over');
    else if (l.kind === 'answer') playSfx(l.a.kind === 'right' ? 'bell' : 'over');
  }, [lab.last]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (ready) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (solved) state.report(onFinished, { h: W.m(lab.minaret) }); }, [solved]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const l = lab.last;
    const e = W.evidenceOf(lab);
    if (e) state.report(onTrial, e);
    if (!l) return;
    // LE FIL : ce que l'élève vient de RÉPONDRE (sa bulle, ✓ / ✗), puis ce que مقران en dit.
    const add = [];
    if (l.kind === 'quiz') add.push({ who: 'you', spec: { kind: 'quiz', quizId: l.quizId, optId: l.picked }, tone: l.correctPick ? 'right' : 'wrong' });
    if (l.kind === 'rule') add.push({ who: 'you', spec: { kind: 'rule', op: l.trial.op, num: l.trial.num }, tone: l.trial.allFit ? 'right' : 'wrong' });
    if (l.kind === 'install') add.push({ who: 'you', spec: { kind: 'bet', p: l.pred.p }, tone: l.pred.kind === 'right' ? 'right' : 'wrong' });
    if (l.kind === 'answer') add.push({ who: 'you', spec: { kind: 'answer', h: l.a.h }, tone: l.a.kind === 'right' ? 'right' : 'wrong' });
    const r = W.react(lab);
    if (r) add.push({ who: 'maqran', msg: r, kind: l.kind });
    if (!add.length) return;
    setThread((list) => {
      // deux mouvements du soleil (ou du bâton) de suite : le second remplace le premier, le fil ne se noie pas
      const prev = list.at(-1);
      const same = add.length === 1 && prev?.who === 'maqran'
        && ((prev.kind === add[0].kind && ['sun', 'stick'].includes(add[0].kind)) || (prev.msg?.action && prev.msg.action === add[0].msg?.action));
      const base = same ? list.slice(0, -1) : list;
      return [...base, ...add.map((x) => ({ ...x, key: (entrySeq.current += 1) }))].slice(-40);
    });
  }, [lab.last]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── mesure : la largeur de la scène ; la hauteur = écran de leçon − ce qui l'entoure dans le bloc glance ── */
  const boxRef = useRef(null);
  const glanceRef = useRef(null);
  const companionRef = useRef(null);
  const svgHRef = useRef(300);
  const [width, setWidth] = useState(340);
  const [overhead, setOverhead] = useState(260);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => {
      setWidth(Math.max(280, Math.floor(el.clientWidth)));
      if (glanceRef.current) {
        // ce qui entoure le dessin DANS le bloc glance (tableau de bord, panneau d'action) — le bloc est `self-start`
        // pour que sa hauteur soit celle de son contenu : étiré à la hauteur de la colonne de مقران (fil long), il
        // faisait croire à un énorme « autour » et le monde tombait à sa hauteur minimale (QA propriétaire 2026-10-13).
        setOverhead(Math.max(90, Math.ceil(glanceRef.current.getBoundingClientRect().height) - svgHRef.current));
      }
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (glanceRef.current) ro.observe(glanceRef.current);
    if (companionRef.current) ro.observe(companionRef.current);
    return () => ro.disconnect();
  }, []);
  const vp = useLessonViewport(true);
  const screenH = vp.ready && vp.height > 0 ? vp.height : 700;
  const budget = Math.round(Math.max(240, Math.min(640, screenH - overhead - 16)));
  const G = useMemo(() => W.layout({ width, height: budget, minaret: lab.minaret }), [width, budget, lab.minaret]);
  const svgW = width;
  const svgH = Math.round(G.height);
  svgHRef.current = svgH;

  /* ── le monde à l'instant affiché ── */
  const T = liveT ?? lab.hour;
  const kLive = liveT != null ? W.kAt(liveT) : W.K25[lab.hour] / 25;
  const stickX = liveStick ?? lab.stickX;
  const presentIds = W.present(lab);
  const objs = W.OBJECTS.filter((o) => presentIds.includes(o.id)).map((o) => {
    const H = W.heightOf(lab, o.id);
    const x = o.id === 'stick' ? stickX : o.x;
    return { ...o, H, x, tip: x + H * kLive };
  });
  const O = lab.minaret * kLive;
  const stickHiddenNow = stickX + 100 * kLive < O - 0.01;
  const meetNow = liveT == null && liveStick == null && W.stickMeets(lab);
  const install = W.nextInstall(lab);
  const installObj = install ? W.OBJECTS.find((o) => o.id === install) : null;
  const flagP = liveFlag ?? lab.flagP;
  const g = W.goals(lab);
  // le pari n'apparaît qu'à SON étape (mesures faites) ou une fois commencé : une seule chose à faire à la fois
  // UN panneau d'action à la fois : le pari s'ouvre à SON étape (mesures faites, pas encore de pari), ou quand un
  // drapeau est posé, ou quand l'élève rouvre la puce pour la 2ᵉ installation (optionnelle).
  const predicting = !!installObj && ((g.measure && !g.predict) || lab.flagP != null || betOpen);
  const betChip = !!installObj && !predicting && g.predict;
  const phase = { discovered: state.isDiscovered, formal: state.isFormal, skipQuizzes: cpEnabled };
  const goal = W.currentGoal(lab, phase);

  /* ── pointeur → monde ── */
  const pt = (e) => {
    const r = boxRef.current?.querySelector('[data-sw-stage]')?.getBoundingClientRect();
    if (!r) return null;
    return { x: (e.clientX - r.left) * (svgW / r.width), y: (e.clientY - r.top) * (svgH / r.height) };
  };
  const toCm = (px) => ((px - G.X(0)) / G.k) * 100;
  const dragKind = useRef(null);
  const grab = (kind, { start, move, end }) => ({
    onPointerDown: (e) => {
      if (e.button > 0) return;
      const p = pt(e);
      if (!p) return;
      if (start && start(p) === false) return;
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.setPointerCapture?.(e.pointerId);
      dragKind.current = kind;
      move?.(p);
    },
    onPointerMove: (e) => { if (dragKind.current !== kind) return; const p = pt(e); if (p) move?.(p); },
    onPointerUp: (e) => {
      if (dragKind.current !== kind) return;
      dragKind.current = null;
      e.currentTarget.releasePointerCapture?.(e.pointerId);
      end?.(pt(e));
    },
    onPointerCancel: () => { if (dragKind.current === kind) { dragKind.current = null; end?.(null); } },
  });

  const sunGrab = grab('sun', {
    move: (p) => setLiveT(W.hourFromPoint(G, p.x, p.y)),
    end: (p) => {
      const tt = p ? W.hourFromPoint(G, p.x, p.y) : liveT ?? lab.hour;
      setLiveT(null); setTape(null);
      setLab((s) => W.setHour(s, Math.round(tt)));
    },
  });
  const sunKey = (e) => {
    const d = { ArrowUp: -1, ArrowRight: -1, ArrowDown: 1, ArrowLeft: 1, PageUp: -2, PageDown: 2, Home: -99, End: 99 }[e.key];
    if (d === undefined) return;
    e.preventDefault();
    setTape(null);
    setLab((s) => W.setHour(s, s.hour + d));
  };
  const stepSun = (d) => { setTape(null); setLab((s) => W.setHour(s, s.hour + d)); };

  const stickGrab = grab('stick', {
    move: (p) => setLiveStick(Math.max(W.STICK_MIN, Math.min(W.STICK_MAX, Math.round(toCm(p.x) / W.STEP) * W.STEP))),
    end: (p) => {
      const x = p ? toCm(p.x) : liveStick ?? lab.stickX;
      setLiveStick(null); setTape(null);
      setLab((s) => W.placeStick(s, x));
    },
  });
  const stickKey = (e) => {
    const d = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 20, PageDown: -20 }[e.key];
    if (d === undefined) return;
    e.preventDefault();
    setTape(null);
    setLab((s) => W.placeStick(s, s.stickX + d * W.STEP));
  };
  const nudgeStick = (d) => { setTape(null); setLab((s) => W.placeStick(s, s.stickX + d * W.STEP)); };

  const flagGrab = installObj ? grab('flag', {
    move: (p) => setLiveFlag(Math.max(0, Math.round((toCm(p.x) - installObj.x) / W.STEP) * W.STEP)),
    end: (p) => {
      const v = p ? toCm(p.x) - installObj.x : liveFlag ?? lab.flagP ?? 0;
      setLiveFlag(null);
      setLab((s) => W.setFlag(s, v));
    },
  }) : {};
  const flagKey = (e) => {
    const d = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 20, PageDown: -20 }[e.key];
    if (d === undefined) return;
    e.preventDefault();
    setLab((s) => W.setFlag(s, (s.flagP ?? W.heightOf(s, W.nextInstall(s))) + d * W.STEP));
  };
  const nudgeFlag = (d) => setLab((s) => W.setFlag(s, (s.flagP ?? W.heightOf(s, W.nextInstall(s))) + d * W.STEP));

  /* le ruban : du pied d'un objet, sur son couloir */
  const tapeRef = useRef(null);
  tapeRef.current = tape;
  const tapeGrab = grab('tape', {
    start: (p) => {
      let best = null;
      for (const o of objs) {
        const dx = p.x - G.X(o.x);
        const dy = (p.y - G.yLane(o.lane)) * 1.6;
        const dist = Math.hypot(dx, dy);
        if (dist < Math.max(30, G.k * 0.9) && (!best || dist < best.dist)) best = { o, dist };
      }
      if (!best) return false;
      setTape({ obj: best.o.id, from: best.o.x, to: best.o.x, hour: lab.hour, live: true, climbing: false, snapped: false });
      return true;
    },
    move: (p) => setTape((tp) => {
      if (!tp) return tp;
      const o = objs.find((q) => q.id === tp.obj);
      const climbing = tp.obj === 'minaret' && p.y < G.yBack - 3 * G.laneGap && Math.abs(p.x - G.X(0)) < Math.max(50, G.k * 2.5);
      return { ...tp, to: Math.max(o.x, Math.round(toCm(p.x))), climbing };
    }),
    end: () => {
      const tp = tapeRef.current;
      if (!tp) return;
      if (tp.climbing) { setTape(null); setLab((s) => W.climb(s)); return; }
      const o = objs.find((q) => q.id === tp.obj);
      const tip = o.x + W.shadowAt(o.H, lab.hour);
      const near = Math.abs(G.X(tp.to) - G.X(tip)) <= Math.max(14, G.k * 0.15);
      if (!near) { setTape({ ...tp, live: false, snapped: false }); return; }
      setLab((s) => W.measure(s, tp.obj));
      const hidden = tp.obj === 'stick' && W.stickHidden(lab);
      setTape(hidden ? null : { ...tp, to: tip, live: false, snapped: true });
    },
  });
  const measureByButton = (id) => {
    const o = objs.find((q) => q.id === id);
    setLab((s) => W.measure(s, id));
    const hidden = id === 'stick' && W.stickHidden(lab);
    setTape(hidden ? null : { obj: id, from: o.x, to: o.x + W.shadowAt(o.H, lab.hour), hour: lab.hour, live: false, climbing: false, snapped: true });
  };

  /* ── la règle de l'élève et le défi ── */
  const tryRule = () => {
    const n = W.parseHundredths(num);
    if (!op || n == null) { setRuleError(true); return; }
    setRuleError(false);
    setLab((s) => W.applyRule(s, op, n));
  };
  const tryAnswer = () => setLab((s) => W.answer(s, ans));

  /* ── le compagnon : `say` (makeSay) met en forme ses messages ── */

  /* ── le tuteur : UNE carte — la question courante (bloquante) ou la mission du moment ── */
  const activeQuiz = cpEnabled ? null : W.currentCheckpoint(lab);   // avec les suites de questions, ce sont elles qui posent les questions tapées
  const standing = W.guide(lab, phase); // q_<quiz> si une question est ouverte, sinon g_<objectif>
  // les indices repartent de zéro quand la CARTE change (autre question, autre mission), pas à chaque geste
  useEffect(() => { setHelpLevel(0); }, [standing.id]);
  const pickQuiz = (optionId) => {
    const v = W.QUIZZES[activeQuiz](lab);
    if (v && optionId !== v.correct) setTried((tr) => ({ quizId: activeQuiz, ids: tr.quizId === activeQuiz ? [...tr.ids, optionId] : [optionId] }));
    setLab((s) => W.answerQuiz(s, activeQuiz, optionId));
  };
  const quizVerdict = activeQuiz ? W.QUIZZES[activeQuiz](lab) : null;
  const progress = cpEnabled ? [] : W.checkpointStatus(lab);
  const counted = progress.filter((c) => c.status !== 'skipped');
  const quizStep = activeQuiz ? counted.findIndex((c) => c.id === activeQuiz) + 1 : 0;
  const triedIds = tried.quizId === activeQuiz ? tried.ids : [];

  const youNode = (spec) => {
    switch (spec.kind) {
      case 'quiz': return k(`quizOpt_${spec.quizId}_${spec.optId}`);
      case 'rule': return <MathText>{k('youRule', { op: spec.op === '×' ? '\\times' : '+', num: W.tex(spec.num) })}</MathText>;
      case 'bet': return <MathText>{k('youBet', { p: W.tex(spec.p) })}</MathText>;
      case 'answer': return <MathText>{k('youAnswer', { h: W.tex(spec.h) })}</MathText>;
      default: return null;
    }
  };
  const threadNodes = thread.map((e) => ({ key: e.key, who: e.who, tone: e.tone, node: e.who === 'you' ? youNode(e.spec) : <MathText>{say(e.msg)}</MathText> }));
  // l'action portée par le DERNIER message de مقران, tant qu'elle a encore un sens
  const lastMaqran = [...thread].reverse().find((e) => e.who === 'maqran');
  const freeStickNeeded = lastMaqran?.msg?.action === 'freeStick' && thread.at(-1) === lastMaqran && W.stickHidden(lab);
  const tutorAction = freeStickNeeded ? { id: 'freeStick', label: k('actionFreeStick'), onClick: () => { setTape(null); setLab((s) => W.placeStick(s, W.stickOutOfShadow(s))); } } : null;

  /* ── la découverte, écrite avec les règles de l'élève ── */
  const rules = W.fittingRules(lab);
  const r1 = rules[0];
  const r2 = rules.at(-1);
  const discoveryOptions = useMemo(() => discoveryOptionsOf(lab, k), [lab, k]);
  const formal = formalOf(lab, k);

  /* ── dessin ── */
  const sun = G.sunAt(kLive);
  const sky = mixColor('#BAE6FD', '#FDBA74', Math.max(0, (T - 3) / 4));
  const skyLow = mixColor('#F0F9FF', '#FFEDD5', Math.max(0, (T - 2) / 5));
  const textP = { style: { direction: 'ltr', unicodeBidi: 'isolate' }, fontFamily: 'ui-monospace, monospace' };
  const lastPred = (id) => [...lab.predictions].reverse().find((q) => q.obj === id);
  const justInstalled = lab.last?.kind === 'install' ? lab.last.pred.obj : null;
  const ruleOn = lab.rule;
  const groundTop = G.yBack - G.laneGap * 0.6;
  const yFront = G.yLane(W.LANES - 1);
  const maxGrad = Math.floor(W.WORLD.xMax / 100);
  const labelEvery = G.k < 22 ? 2 : 1;
  const minaretTop = G.Y(0, lab.minaret);
  const showTape = tape && (tape.live || (tape.hour === lab.hour && liveT == null));
  const sceneLabel = k('sceneLabel', { hour: W.HOURS[lab.hour], O: W.m(W.minaretTip(lab)), d: W.m(lab.stickX) });
  const narrow = width < 420;

  const btnBase = 'inline-flex h-10 min-w-[40px] items-center justify-center gap-1 rounded-xl border-2 px-2 text-sm font-bold disabled:opacity-40 focus:outline-none focus-visible:ring-2';
  const btn = `${btnBase} bg-white`;

  const companion = (
    <div ref={companionRef}>
      <ShadowTutor
        avatar={<Avatar />}
        narrow={narrow}
        progress={progress}
        showProgress={!cpEnabled}
        thread={threadNodes}
        card={activeQuiz ? {
          type: 'question', msgId: standing.id, quizId: activeQuiz,
          prompt: <MathText>{say(standing)}</MathText>,
          step: quizStep, total: counted.length,
          options: (QUIZ_OPTIONS[activeQuiz] ?? quizVerdict?.options ?? []).map((id) => ({ id, label: k(`quizOpt_${activeQuiz}_${id}`), tried: triedIds.includes(id) })),
        } : { type: 'task', msgId: standing.id, prompt: <MathText>{say(standing)}</MathText> }}
        hint={{ level: helpLevel, node: helpLevel > 0 ? <MathText>{say(W.help(lab, helpLevel, phase))}</MathText> : null }}
        onHint={() => setHelpLevel((n) => (n >= 3 ? 1 : n + 1))}
        onPick={pickQuiz}
        action={tutorAction}
      />
    </div>
  );

  const quests = (
    <ol className="flex flex-wrap gap-1.5" aria-label={k('questsTitle')}>
      {W.GOALS.map((id, i) => {
        const done = g[id];
        const active = goal === id;
        return (
          <li key={id} data-sw-quest={id} data-done={done ? 'true' : 'false'}
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold ${done ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : active ? 'border-teal-400 bg-teal-50 text-teal-900 ring-2 ring-teal-200' : 'border-slate-200 bg-white text-slate-500'}`}>
            {done ? <Check className="h-3 w-3" aria-hidden="true" /> : <span aria-hidden="true" className="font-mono">{i + 1}</span>}
            {k(`q_${id}`)}
          </li>
        );
      })}
    </ol>
  );

  const notebook = (
    <div className="space-y-2" data-sw-notebook={lab.notebook.length}>
      {lab.notebook.length === 0 ? (
        <p className="text-xs text-slate-500">{k('notebookEmpty')}</p>
      ) : (
        <table className="w-full text-xs">
          <thead>
            <tr className="text-slate-500">
              <th className="py-0.5 text-start font-bold">{k('colHour')}</th>
              <th className="py-0.5 text-start font-bold">{k('colObj')}</th>
              <th className="py-0.5 text-start font-bold">{k('colH')}</th>
              <th className="py-0.5 text-start font-bold">{k('colShadow')}</th>
              {state.isFormal && <th className="py-0.5 text-start font-bold">{k('colRatio')}</th>}
            </tr>
          </thead>
          <tbody>
            {lab.notebook.map((r) => {
              const known = r.obj !== 'minaret' || solved;
              const H = W.heightOf(lab, r.obj);
              return (
                <tr key={`${r.hour}-${r.obj}`} className={`border-t border-slate-100 ${r.hour === lab.hour ? 'bg-amber-50/70' : ''}`} data-sw-row={`${W.HOURS[r.hour]}|${r.obj}`}>
                  <td className="py-0.5 font-mono"><bdi dir="ltr">{W.HOURS[r.hour]}</bdi></td>
                  <td className="py-0.5">{k(`obj.${r.obj}`)}</td>
                  <td className="py-0.5 font-mono"><bdi dir="ltr">{known ? `${W.m(H)} m` : k('unknown')}</bdi></td>
                  <td className="py-0.5 font-mono font-bold"><bdi dir="ltr">{`${W.m(r.shadow)} m`}</bdi></td>
                  {state.isFormal && <td className="py-0.5 font-mono text-emerald-800"><bdi dir="ltr">{known ? W.m((r.shadow * 100) / H) : k('unknown')}</bdi></td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      {lab.predictions.length > 0 && (
        <div>
          <p className="text-[11px] font-bold text-slate-500">{k('predictionsTitle')}</p>
          <ul className="space-y-0.5 text-xs">
            {lab.predictions.map((q, i) => (
              <li key={i} className={q.kind === 'right' ? 'text-emerald-800' : 'text-rose-800'}>
                <MathText>{k('predRow', { obj: k(`obj.${q.obj}`), hour: W.HOURS[q.hour], p: W.tex(q.p), truth: W.tex(q.truth) })}</MathText>
              </li>
            ))}
          </ul>
        </div>
      )}
      {lab.rules.length > 0 && (
        <div>
          <p className="text-[11px] font-bold text-slate-500">{k('rulesTitle')}</p>
          <ul className="space-y-0.5 text-xs">
            {lab.rules.map((r, i) => (
              <li key={i} className={r.allFit ? 'text-emerald-800' : 'text-rose-800'}>
                {r.allFit ? '✓ ' : '✗ '}<MathText>{k('ruleRow', { hour: W.HOURS[r.hour], op: r.op === '×' ? '\\times' : '+', num: W.tex(r.num) })}</MathText>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <ManipulationShell
      type="shadow-world"
      title={title ?? k('title')}
      mission={mission ?? k('mission')}
      lead={lead}
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      headerAction={cpOn ? cpSettings.control : null}
      guided={cpEnabled}
      hints={[]}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      discovery={<ManipulationDiscovery state={state} prompt={r1 && r2 ? <MathText>{k('dPrompt', { h1: W.HOURS[r1.hour], h2: W.HOURS[r2.hour], k1: W.tex(r1.num), k2: W.tex(r2.num) })}</MathText> : ''} options={discoveryOptions} formal={formal} />}
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-sky-50/70 to-white" minHeight="min-h-[200px]">
        <div className="relative space-y-2" data-shadow-world data-world={theme} data-hour={W.HOURS[lab.hour]} data-goal={goal}
          data-solved={solved ? 'true' : 'false'} data-meets={meetNow ? 'true' : 'false'} data-scene-h={svgH}>
          {party.node}
          {cp.node}
          {cpEnabled ? <LabStepper count={stops.length} current={stepNow} done={stepDone} stepAttr="data-sw-step-n" /> : quests}
          <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="lg:col-start-2 lg:row-start-1">{companion}</div>

            <div ref={glanceRef} className="min-w-0 space-y-1.5 self-start lg:col-start-1 lg:row-span-2 lg:row-start-1" data-sw-glance>
              <div ref={boxRef} className="w-full">
                <div className="relative mx-auto overflow-hidden rounded-xl" style={{ width: svgW, height: svgH }} data-sw-stage>
                  <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className="absolute inset-0" style={{ direction: 'ltr' }} role="img" aria-label={sceneLabel}>
                    <defs>
                      <linearGradient id="sw-sky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={sky} /><stop offset="1" stopColor={skyLow} /></linearGradient>
                      <radialGradient id="sw-sun"><stop offset="0" stopColor="#FEF08A" /><stop offset="0.55" stopColor="#FACC15" /><stop offset="1" stopColor="#FACC15" stopOpacity="0" /></radialGradient>
                      <pattern id="sw-tiles" width={Math.max(10, G.k * 0.8)} height={G.laneGap} patternUnits="userSpaceOnUse">
                        <rect width={Math.max(10, G.k * 0.8)} height={G.laneGap} fill="#F5E6C8" />
                        <path d={`M0 0 H${Math.max(10, G.k * 0.8)} M0 0 V${G.laneGap}`} stroke="#E7D3A8" strokeWidth={1} />
                      </pattern>
                    </defs>
                    <style>{`.sw-rise{transform-box:fill-box;transform-origin:50% 100%;animation:sw-rise .9s ease-out}@keyframes sw-rise{from{transform:scaleY(0)}to{transform:scaleY(1)}}.sw-cloud{animation:sw-drift 60s linear infinite}@keyframes sw-drift{from{transform:translateX(-12%)}to{transform:translateX(112%)}}.sw-flutter{transform-box:fill-box;transform-origin:0 50%;animation:sw-flutter 2.4s ease-in-out infinite}@keyframes sw-flutter{0%,100%{transform:skewY(0)}50%{transform:skewY(-6deg)}}@media (prefers-reduced-motion: reduce){.sw-rise,.sw-cloud,.sw-flutter{animation:none}}`}</style>

                    {/* le ciel, le soleil et ses rayons */}
                    <rect x={0} y={0} width={svgW} height={groundTop} fill="url(#sw-sky)" />
                    <g aria-hidden="true" data-deco="sky">
                      <g className={reduce ? undefined : 'sw-cloud'}>
                        <ellipse cx={svgW * 0.2} cy={22} rx={28} ry={8} fill="#FFFFFF" opacity={0.9} />
                        <ellipse cx={svgW * 0.2 + 20} cy={17} rx={16} ry={7} fill="#FFFFFF" opacity={0.9} />
                      </g>
                    </g>
                    <line x1={sun.x} y1={sun.y} x2={G.M.x} y2={G.M.y} stroke="#F59E0B" strokeWidth={1.4} strokeDasharray="2 5" opacity={0.7} data-sw-sunray />
                    <circle cx={sun.x} cy={sun.y} r={28} fill="url(#sw-sun)" opacity={0.8} />
                    <circle cx={sun.x} cy={sun.y} r={11} fill={mixColor('#FDE047', '#FB923C', Math.max(0, (T - 3) / 4))} stroke="#F59E0B" strokeWidth={2} />
                    {/* la ville au loin (sans ombre sur la place : elle est au-delà) */}
                    <City width={svgW} y={groundTop} k={G.k} />

                    {/* la place */}
                    <rect x={0} y={groundTop} width={svgW} height={svgH - groundTop} fill="url(#sw-tiles)" />
                    {Array.from({ length: W.LANES }, (_, l) => (
                      <line key={l} x1={0} x2={svgW} y1={G.yLane(l) + G.laneGap * 0.5} y2={G.yLane(l) + G.laneGap * 0.5} stroke="#E2CFA0" strokeWidth={0.8} />
                    ))}

                    {/* couloir par couloir, du fond vers l'avant : ombres, rayons, objets */}
                    {Array.from({ length: W.LANES }, (_, lane) => {
                      const here = objs.filter((o) => o.lane === lane);
                      const yG = G.yLane(lane);
                      const site = predicting && installObj.lane === lane ? installObj : null;
                      return (
                        <g key={lane} data-lane={lane}>
                          {here.map((o) => <Shadow key={`s-${o.id}`} o={o} G={G} yG={yG} kLive={kLive} />)}
                          {here.map((o) => {
                            const visibleTip = !(o.id === 'stick' && stickHiddenNow);
                            if (!visibleTip) return null;
                            const strong = o.id === 'minaret' || (o.id === 'stick' && meetNow);
                            return (
                              <line key={`r-${o.id}`} x1={G.X(o.x)} y1={G.Y(lane, o.H)} x2={G.X(o.tip)} y2={yG}
                                stroke={meetNow && (o.id === 'minaret' || o.id === 'stick') ? '#059669' : '#F59E0B'} strokeWidth={strong ? 1.6 : 1}
                                strokeDasharray={strong ? undefined : '4 4'} opacity={strong ? 0.85 : 0.45} />
                            );
                          })}
                          {lane === 0 && meetNow && (
                            <polygon points={`${G.X(0)},${yG} ${G.X(0)},${minaretTop} ${G.X(O)},${yG}`} fill="#10B981" opacity={0.1} />
                          )}
                          {here.map((o) => (
                            <g key={`o-${o.id}`} className={justInstalled === o.id && !reduce ? 'sw-rise' : undefined} data-sw-obj={o.id}>
                              <Thing o={o} G={G} yG={yG} lab={lab} reduce={reduce} inShadow={o.id === 'stick' && stickHiddenNow} />
                            </g>
                          ))}
                          {/* le pari précédent, laissé au sol : l'erreur reste visible */}
                          {here.map((o) => {
                            const q = lastPred(o.id);
                            if (!q || q.kind === 'right') return null;
                            return (
                              <g key={`bet-${o.id}`} opacity={0.75}>
                                <FlagMark x={G.X(o.x + q.p)} y={yG} color="#94A3B8" size={G.laneGap} />
                                <text x={G.X(o.x + q.p)} y={yG + 9} textAnchor="middle" fontSize={9} fill="#475569" {...textP}>{`${W.m(q.p)}`}</text>
                              </g>
                            );
                          })}
                          {/* les drapeaux de LA RÈGLE de l'élève */}
                          {ruleOn && here.filter((o) => o.known).map((o) => {
                            const pred = W.rulePredict(ruleOn, o.H);
                            const ok = Math.abs(o.x + pred - o.tip) < 0.6;
                            const gx = G.X(o.x + pred);
                            return (
                              <g key={`g-${o.id}`} data-sw-ghost={o.id} data-ok={ok ? 'true' : 'false'}>
                                {!ok && (
                                  <g>
                                    <line x1={gx} x2={G.X(o.tip)} y1={yG + 4} y2={yG + 4} stroke="#7C3AED" strokeWidth={2} />
                                    <line x1={G.X(o.tip)} x2={G.X(o.tip)} y1={yG - 2} y2={yG + 7} stroke="#7C3AED" strokeWidth={2} />
                                  </g>
                                )}
                                <FlagMark x={gx} y={yG} color="#7C3AED" size={Math.max(12, G.laneGap * 1.5)} dashed={!ok} />
                                <circle cx={gx} cy={yG} r={ok ? 4 : 3} fill={ok ? '#7C3AED' : '#FFFFFF'} stroke="#7C3AED" strokeWidth={1.5} />
                              </g>
                            );
                          })}
                          {/* le chantier : le drapeau du pari */}
                          {site && (
                            <g data-sw-site={site.id}>
                              <rect x={G.X(site.x) - 6} y={yG - 3} width={12} height={5} fill="#FDE68A" stroke="#B45309" strokeDasharray="2 2" />
                              {flagP != null && (
                                <>
                                  <line x1={G.X(site.x)} x2={G.X(site.x + flagP)} y1={yG + 2} y2={yG + 2} stroke="#DC2626" strokeWidth={1} strokeDasharray="2 3" />
                                  <FlagMark x={G.X(site.x + flagP)} y={yG} color="#DC2626" size={G.laneGap * 1.3} />
                                </>
                              )}
                            </g>
                          )}
                        </g>
                      );
                    })}

                    {/* les lettres du manuel quand les ombres finissent ensemble */}
                    {meetNow && (
                      <g fontSize={11} fontWeight="bold" fill="#065F46" {...textP}>
                        <text x={G.X(0) - 12} y={G.yBack + 11}>A</text>
                        <text x={G.X(0) + 8} y={minaretTop - 2}>M</text>
                        <text x={G.X(lab.stickX) - 9} y={G.Y(0, 100) - 3}>E</text>
                        <text x={G.X(lab.stickX) - 3} y={G.yBack + 11}>B</text>
                        <text x={G.X(O) + 3} y={G.yBack - 4}>O</text>
                      </g>
                    )}

                    {/* le ruban */}
                    {showTape && <Tape tp={tape} G={G} objs={objs} textP={textP} />}

                    {/* la corde du muezzin : la vérification */}
                    {solved && (
                      <g data-sw-rope>
                        <line x1={G.X(0) + Math.max(8, G.k * 0.55)} x2={G.X(0) + Math.max(8, G.k * 0.55)} y1={minaretTop} y2={G.yBack} stroke="#B45309" strokeWidth={2} strokeDasharray="1 3" />
                        <text x={G.X(0) + Math.max(8, G.k * 0.55) + 4} y={(minaretTop + G.yBack) / 2} fontSize={11} fontWeight="bold" fill="#92400E" {...textP}>{`${W.m(lab.minaret)} m`}</text>
                      </g>
                    )}

                    {/* la règle graduée du sol (mètres depuis A) */}
                    {Array.from({ length: maxGrad + 1 }, (_, mm) => (
                      <g key={mm}>
                        <line x1={G.X(mm * 100)} x2={G.X(mm * 100)} y1={yFront + 7} y2={yFront + (mm % labelEvery === 0 ? 12 : 10)} stroke="#92400E" />
                        {mm % labelEvery === 0 && <text x={G.X(mm * 100)} y={yFront + 21} textAnchor="middle" fontSize={9} fill="#78350F" {...textP}>{mm}</text>}
                      </g>
                    ))}
                  </svg>

                  {/* ── les poignées (HTML au-dessus du dessin) ── */}
                  {/* le ciel : toucher le ciel pose le soleil ; la poignée est le soleil */}
                  <div className="absolute left-0 right-0 top-0" style={{ height: groundTop - 4, touchAction: 'none', cursor: 'pointer' }} {...sunGrab} data-sw-sky>
                    <div role="slider" tabIndex={0} aria-label={k('sunHandle')} aria-valuemin={0} aria-valuemax={W.HOURS.length - 1} aria-valuenow={lab.hour}
                      aria-valuetext={k('sunValueText', { hour: W.HOURS[lab.hour] })} onKeyDown={sunKey} data-sw-sun={W.HOURS[lab.hour]}
                      className="absolute flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full outline-none focus-visible:ring-4 focus-visible:ring-amber-400"
                      style={{ left: sun.x, top: sun.y, cursor: dragKind.current === 'sun' ? 'grabbing' : 'grab' }}>
                      <span className="pointer-events-none mt-12 whitespace-nowrap rounded-full bg-white/85 px-1.5 text-[11px] font-black text-amber-800" dir="ltr">{W.HOURS[Math.round(T)]}</span>
                    </div>
                  </div>
                  {/* le bâton : TOUJOURS déplaçable (aussi en mode mesure : « أبعِد العصا » ne doit jamais être une impasse) */}
                  <div role="slider" tabIndex={0} aria-label={k('stickHandle')} aria-valuemin={W.STICK_MIN} aria-valuemax={W.STICK_MAX} aria-valuenow={lab.stickX}
                    aria-valuetext={k('stickValueText', { d: W.m(lab.stickX) })} onKeyDown={stickKey} {...stickGrab} data-sw-stick-handle={lab.stickX}
                    className={`absolute z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-end justify-center rounded-full border-2 border-dashed outline-none focus-visible:ring-4 focus-visible:ring-amber-300 ${stickHiddenNow ? 'border-amber-600 bg-amber-100/70 animate-pulse motion-reduce:animate-none' : 'border-amber-700/80'}`}
                    style={{ left: G.X(stickX), top: Math.min(G.Y(0, 40), G.yBack - 26), touchAction: 'none', cursor: 'grab' }}>
                    <span aria-hidden="true" className="-mb-4 rounded-full bg-white/90 px-1 text-[11px] font-black leading-none text-amber-800">⇆</span>
                  </div>
                  {/* le drapeau du pari */}
                  {!measuring && predicting && (
                    <div role="slider" tabIndex={0} aria-label={k('flagHandle')} aria-valuemin={0} aria-valuemax={2000} aria-valuenow={flagP ?? 0}
                      aria-valuetext={flagP == null ? k('flagFirst') : k('flagValueText', { p: W.m(flagP) })} onKeyDown={flagKey} {...flagGrab} data-sw-flag-handle={flagP ?? ''}
                      className="absolute flex h-9 w-9 -translate-x-1/2 -translate-y-full items-center justify-center rounded-full border-2 border-rose-500 bg-white/85 text-sm outline-none focus-visible:ring-4 focus-visible:ring-rose-300"
                      style={{ left: G.X(installObj.x + (flagP ?? W.heightOf(lab, installObj.id) * 0.5)), top: G.yLane(installObj.lane) - G.laneGap * 1.2, touchAction: 'none', cursor: 'grab' }}>🚩</div>
                  )}
                  {/* le ruban : toute la place devient une surface de mesure */}
                  {measuring && (
                    <div className="absolute left-0 right-0" style={{ top: groundTop - G.laneGap, bottom: 0, touchAction: 'none', cursor: 'crosshair' }} {...tapeGrab} data-sw-tape-zone />
                  )}
                </div>
              </div>

              {/* ── le tableau de bord, juste sous la place ── */}
              <div className="flex flex-wrap items-center justify-center gap-1.5" dir="ltr">
                <span className="inline-flex items-center gap-1">
                <button type="button" onClick={() => stepSun(-1)} disabled={lab.hour <= 0} aria-label={k('sunEarlier')} data-sw-sun-earlier className={`${btn} border-amber-300 focus-visible:ring-amber-500`}><Minus className="h-4 w-4" aria-hidden="true" /></button>
                <span className="inline-flex min-w-[5rem] items-center justify-center gap-1 rounded-full bg-amber-100 px-2 py-1 font-mono text-sm font-extrabold text-amber-900" data-sw-hour-chip>☀ {W.HOURS[lab.hour]}</span>
                <button type="button" onClick={() => stepSun(1)} disabled={lab.hour >= W.HOURS.length - 1} aria-label={k('sunLater')} data-sw-sun-later className={`${btn} border-amber-300 focus-visible:ring-amber-500`}><Plus className="h-4 w-4" aria-hidden="true" /></button>
                </span>
                <span className="inline-flex items-center gap-1">
                <button type="button" onClick={() => nudgeStick(-4)} aria-label={k('stickLess')} data-sw-stick-less className={`${btn} border-amber-300 focus-visible:ring-amber-500`}><Minus className="h-4 w-4" aria-hidden="true" /></button>
                <span className="min-w-[5.5rem] rounded-full bg-orange-50 px-2 py-1 text-center text-xs font-bold text-orange-900" dir="rtl"><MathText>{k('stickAt', { d: W.tex(stickX) })}</MathText></span>
                <button type="button" onClick={() => nudgeStick(4)} aria-label={k('stickMore')} data-sw-stick-more className={`${btn} border-amber-300 focus-visible:ring-amber-500`}><Plus className="h-4 w-4" aria-hidden="true" /></button>
                </span>
                <button type="button" onClick={() => { setMeasuring((v) => !v); setTape(null); }} aria-pressed={measuring} data-sw-measure-toggle
                  className={`${btnBase} ${measuring ? 'border-sky-600 bg-sky-600 text-white' : 'border-sky-300 bg-white text-sky-800'} focus-visible:ring-sky-500`}>
                  <Ruler className="h-4 w-4" aria-hidden="true" /> {k('measureMode')}
                </button>
              </div>
              {measuring && (
                <div className="space-y-1 rounded-xl bg-sky-50 px-2 py-1.5">
                  <p className="text-xs font-bold text-sky-900">{k('measureModeOn')}</p>
                  <div className="flex flex-wrap gap-1">
                    {objs.map((o) => (
                      <button key={o.id} type="button" onClick={() => measureByButton(o.id)} data-sw-measure={o.id}
                        className="rounded-lg border border-sky-300 bg-white px-2 py-1 text-xs font-bold text-sky-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">
                        {k('measureBtn', { obj: k(`obj.${o.id}`) })}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* le pari : la 2ᵉ installation, optionnelle, attend dans une puce */}
              {betChip && (
                <button type="button" onClick={() => setBetOpen(true)} data-sw-bet-chip={installObj.id}
                  className="rounded-full border-2 border-rose-200 bg-white px-3 py-1 text-xs font-bold text-rose-900 hover:border-rose-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400">
                  🚩 {k('betChip', { obj: k(`obj.${installObj.id}`) })}
                </button>
              )}
              {/* le pari */}
              {predicting && (
                <div className="flex flex-wrap items-center gap-1.5 rounded-xl border-2 border-rose-200 bg-rose-50/70 px-2 py-1.5" data-sw-predict={installObj.id}>
                  <p className="min-w-[12rem] flex-1 text-sm font-bold text-rose-950"><MathText>{k('predictTitle', { obj: k(`obj.${installObj.id}`), H: W.tex(installObj.H), hour: W.HOURS[lab.hour] })}</MathText></p>
                  <div className="flex items-center gap-1" dir="ltr">
                    <button type="button" onClick={() => nudgeFlag(-2)} aria-label={k('flagLess')} className={`${btn} border-rose-300 focus-visible:ring-rose-500`}><Minus className="h-4 w-4" aria-hidden="true" /></button>
                    <span className="min-w-[6rem] rounded-full bg-white px-2 py-1 text-center text-xs font-bold text-rose-900" dir="rtl">
                      {flagP == null ? k('flagFirst') : <MathText>{k('flagValue', { p: W.tex(flagP) })}</MathText>}
                    </span>
                    <button type="button" onClick={() => nudgeFlag(2)} aria-label={k('flagMore')} className={`${btn} border-rose-300 focus-visible:ring-rose-500`}><Plus className="h-4 w-4" aria-hidden="true" /></button>
                  </div>
                  <button type="button" onClick={() => setLab((s) => W.install(s))} disabled={lab.flagP == null} data-sw-install
                    className="rounded-xl bg-rose-600 px-3 py-2 text-sm font-extrabold text-white disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400">
                    {k('installBtn', { obj: k(`obj.${installObj.id}`) })}
                  </button>
                </div>
              )}

              {/* la règle de l'élève */}
              {(g.predict || lab.rules.length > 0) && (
                <div className="space-y-1 rounded-xl border-2 border-violet-200 bg-violet-50/70 px-2 py-1.5" data-sw-rule={ruleOn ? `${ruleOn.op}${ruleOn.num}` : ''}>
                  <p className="text-xs font-bold text-violet-900">{k('ruleTitle')} — {k('ruleLead')}</p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-sm font-extrabold text-violet-950">{k('ruleLhs')}</span>
                    {['+', '×'].map((o) => (
                      <button key={o} type="button" onClick={() => setOp(o)} aria-pressed={op === o} data-sw-op={o}
                        className={`rounded-lg border-2 px-2 py-1 text-sm font-extrabold focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${op === o ? 'border-violet-600 bg-violet-600 text-white' : 'border-violet-300 bg-white text-violet-900'}`}>
                        <span dir="ltr" className="font-mono">{o}</span> {k(o === '+' ? 'rulePlus' : 'ruleTimes')}
                      </button>
                    ))}
                    <input type="text" inputMode="decimal" dir="ltr" value={num} onChange={(e) => setNum(e.target.value)} aria-label={k('ruleNum')} placeholder="?" data-sw-rule-num
                      onKeyDown={(e) => { if (e.key === 'Enter') tryRule(); }}
                      aria-invalid={ruleError} className={`w-20 rounded-lg border-2 px-2 py-1 text-center font-mono text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${ruleError ? 'border-rose-400 bg-rose-50' : 'border-violet-300 bg-white'}`} />
                    <button type="button" onClick={tryRule} data-sw-rule-try
                      className="rounded-xl bg-violet-600 px-3 py-1.5 text-sm font-extrabold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400">{k('ruleTry')}</button>
                  </div>
                  {ruleError && <p className="text-xs font-bold text-rose-700">{k('ruleInvalid')}</p>}
                  {ruleOn && <p className="text-[11px] text-violet-800">{k('ruleActive', { hour: W.HOURS[ruleOn.hour] })}</p>}
                </div>
              )}

              {/* le défi */}
              {state.isFormal && (
                <div className={`space-y-1 rounded-xl border-2 px-2 py-1.5 ${solved ? 'border-emerald-300 bg-emerald-50' : 'border-amber-300 bg-amber-50'}`} data-sw-challenge>
                  <p className="text-sm font-extrabold text-amber-950">{k('challengeTitle')}</p>
                  <p className="text-xs text-amber-900">{k('challengeLead')}</p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <label className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
                      {k('answerLabel')}
                      <input type="text" inputMode="decimal" dir="ltr" value={ans} onChange={(e) => setAns(e.target.value)} data-sw-answer
                        onKeyDown={(e) => { if (e.key === 'Enter') tryAnswer(); }}
                        className="w-24 rounded-lg border-2 border-amber-300 bg-white px-2 py-1 text-center font-mono text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500" />
                    </label>
                    <button type="button" onClick={tryAnswer} data-sw-answer-btn
                      className="rounded-xl bg-amber-600 px-3 py-1.5 text-sm font-extrabold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">{k('answerBtn')}</button>
                  </div>
                </div>
              )}
            </div>

            <div className="min-w-0 lg:col-start-2 lg:row-start-2">
              <LabFold id="shadow-world.notebook" title={k('notebookTitle')}>{notebook}</LabFold>
            </div>
          </div>
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ── petites pièces du monde ─────────────────────────────────────────── */

function mixColor(a, b, f) {
  const c = Math.max(0, Math.min(1, f));
  const p = (h, i) => parseInt(h.slice(1 + 2 * i, 3 + 2 * i), 16);
  const v = [0, 1, 2].map((i) => Math.round(p(a, i) + (p(b, i) - p(a, i)) * c).toString(16).padStart(2, '0'));
  return `#${v.join('')}`;
}

/** مقران — un garçon à casquette, dessiné. */
function Avatar() {
  return (
    <svg width={40} height={40} viewBox="0 0 40 40" aria-hidden="true" className="shrink-0">
      <circle cx={20} cy={20} r={19} fill="#CCFBF1" stroke="#14B8A6" strokeWidth={1.5} />
      <circle cx={20} cy={22} r={10} fill="#FCD9B6" />
      <path d="M9 18 Q20 6 31 18 Z" fill="#0F766E" />
      <rect x={20} y={15.5} width={13} height={3} rx={1.5} fill="#0F766E" />
      <circle cx={16.5} cy={22} r={1.3} fill="#1E293B" />
      <circle cx={23.5} cy={22} r={1.3} fill="#1E293B" />
      <path d="M16 26.5 Q20 29.5 24 26.5" stroke="#1E293B" strokeWidth={1.3} fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** La ville blanche au loin, en camaïeu, avec une coupole — décor (au-delà de la place, ses ombres n'y tombent pas). */
function City({ width, y, k }) {
  const parts = [];
  let x = width * 0.3;
  let i = 0;
  const unit = Math.max(10, Math.min(0.55 * k, 26));
  while (x < width) {
    const w = unit * (1.2 + ((i * 37) % 13) / 10);
    const h = unit * (1.1 + ((i * 53) % 17) / 10);
    parts.push(
      <g key={i}>
        <rect x={x} y={y - h} width={w} height={h} fill={i % 3 === 0 ? '#F8FAFC' : '#EEF2F7'} stroke="#CBD5E1" strokeWidth={0.6} />
        {Array.from({ length: Math.max(1, Math.floor(w / 9)) }, (_, c) => Array.from({ length: Math.max(1, Math.floor(h / 11)) }, (__, r) => (
          <rect key={`${c}-${r}`} x={x + 3 + c * 9} y={y - h + 4 + r * 11} width={3.5} height={5} rx={1.5} fill="#B6C2D2" />
        )))}
        {i === 4 && <path d={`M${x + w * 0.15} ${y - h} A${w * 0.35} ${w * 0.35} 0 0 1 ${x + w * 0.85} ${y - h} Z`} fill="#E2E8F0" stroke="#CBD5E1" />}
      </g>,
    );
    x += w + 3;
    i += 1;
  }
  return <g aria-hidden="true" data-deco="city" opacity={0.6}>{parts}</g>;
}

/** Une ombre portée, sur son couloir. Le palmier a une ombre de couronne, la minaret une ombre de fût. */
function Shadow({ o, G, yG, kLive }) {
  const x = G.X(o.x);
  const tip = G.X(o.x + o.H * kLive);
  const th = G.laneGap * 0.38;
  const fill = '#1E293B';
  if (o.id === 'minaret') {
    const w = Math.max(8, Math.min(0.9 * G.k, 26)) / 2;
    return <polygon points={`${x - w},${yG} ${x + w},${yG - th} ${tip},${yG} ${x + w},${yG + th}`} fill={fill} opacity={0.3} data-sw-shadow={o.id} />;
  }
  if (o.id === 'palm') {
    const crown = G.X(o.x + (o.H - 60) * kLive);
    return (
      <g opacity={0.26} data-sw-shadow={o.id}>
        <rect x={x} y={yG - th / 2} width={Math.max(0, crown - x)} height={th} fill={fill} />
        <ellipse cx={(crown + tip) / 2} cy={yG} rx={Math.max(4, (tip - crown) / 2 + 4)} ry={th * 0.9} fill={fill} />
      </g>
    );
  }
  return <rect x={x} y={yG - th / 2} width={Math.max(0, tip - x)} height={th} rx={th / 2} fill={fill} opacity={0.3} data-sw-shadow={o.id} />;
}

/** Les objets de la place — chacun a SA hauteur exacte : son sommet est le point d'où part le rayon. */
function Thing({ o, G, yG, reduce, inShadow }) {
  const x = G.X(o.x);
  const top = yG - (o.H / 100) * G.k;
  const k = G.k;
  switch (o.id) {
    case 'minaret': {
      const H = yG - top;
      const w = Math.max(8, Math.min(0.9 * k, 26));
      const shaftTop = yG - H * 0.78; const balcony = yG - H * 0.72; const lantern = yG - H * 0.9;
      return (
        <g aria-hidden="true">
          <rect x={x - w / 2} y={shaftTop} width={w} height={yG - shaftTop} fill="#F1F5F9" stroke="#64748B" strokeWidth={1.2} />
          <rect x={x - w * 0.75} y={balcony - 3} width={w * 1.5} height={5} fill="#CBD5E1" stroke="#64748B" strokeWidth={1} />
          <rect x={x - w * 0.36} y={lantern} width={w * 0.72} height={shaftTop - lantern} fill="#E2E8F0" stroke="#64748B" strokeWidth={1} />
          <path d={`M${x - w * 0.42} ${lantern} L${x} ${top} L${x + w * 0.42} ${lantern} Z`} fill="#10B981" stroke="#047857" strokeWidth={1} />
          {[0.2, 0.45].map((f) => <rect key={f} x={x - w * 0.15} y={yG - H * f - 5} width={w * 0.3} height={8} rx={w * 0.15} fill="#94A3B8" />)}
          <text x={x} y={top - 4} textAnchor="middle" fontSize={11} fontWeight="bold" fill="#334155">؟</text>
        </g>
      );
    }
    case 'palm': {
      const trunkTop = top + 0.5 * k;
      return (
        <g aria-hidden="true">
          <path d={`M${x - 3} ${yG} Q${x + 0.4 * k} ${(yG + trunkTop) / 2} ${x} ${trunkTop} L${x + 3} ${trunkTop} Q${x + 0.4 * k + 5} ${(yG + trunkTop) / 2} ${x + 3} ${yG} Z`} fill="#A16207" />
          {[-1.4, -0.7, 0, 0.7, 1.4].map((a) => (
            <path key={a} d={`M${x + 1.5} ${trunkTop} Q${x + 1.5 + a * 0.55 * k} ${top - 0.2 * k} ${x + 1.5 + a * 0.9 * k} ${trunkTop + Math.abs(a) * 0.35 * k}`} stroke="#15803D" strokeWidth={Math.max(2, k * 0.12)} fill="none" strokeLinecap="round" />
          ))}
        </g>
      );
    }
    case 'lamp':
      return (
        <g aria-hidden="true">
          <rect x={x - 1.6} y={top + 2} width={3.2} height={yG - top - 2} fill="#334155" />
          <path d={`M${x} ${top + 3} q${0.35 * k} -3 ${0.5 * k} 2`} stroke="#334155" strokeWidth={2} fill="none" />
          <rect x={x + 0.5 * k - 4} y={top + 4} width={8} height={4} rx={1} fill="#FDE047" stroke="#334155" />
          <text x={x - 4} y={top + 0.5 * k} textAnchor="end" fontSize={9} fill="#334155" style={{ direction: 'ltr' }}>3 m</text>
        </g>
      );
    case 'flag': {
      const fw = Math.max(14, 0.9 * k); const fh = fw * 0.66;
      return (
        <g aria-hidden="true">
          <rect x={x - 1.4} y={top} width={2.8} height={yG - top} fill="#94A3B8" />
          <circle cx={x} cy={top} r={2.2} fill="#CA8A04" />
          <g className={reduce ? undefined : 'sw-flutter'}>
            <rect x={x + 1.4} y={top + 2} width={fw / 2} height={fh} fill="#16A34A" />
            <rect x={x + 1.4 + fw / 2} y={top + 2} width={fw / 2} height={fh} fill="#FFFFFF" stroke="#E2E8F0" strokeWidth={0.5} />
            <circle cx={x + 1.4 + fw / 2} cy={top + 2 + fh / 2} r={fh * 0.26} fill="#DC2626" />
            <circle cx={x + 1.4 + fw / 2 + fh * 0.08} cy={top + 2 + fh / 2} r={fh * 0.21} fill="#FFFFFF" />
          </g>
        </g>
      );
    }
    case 'farid': {
      const h = yG - top;
      const r = h * 0.1;
      return (
        <g aria-hidden="true">
          <line x1={x - h * 0.06} y1={yG} x2={x - h * 0.03} y2={yG - h * 0.45} stroke="#1E3A8A" strokeWidth={Math.max(2, h * 0.07)} strokeLinecap="round" />
          <line x1={x + h * 0.06} y1={yG} x2={x + h * 0.03} y2={yG - h * 0.45} stroke="#1E3A8A" strokeWidth={Math.max(2, h * 0.07)} strokeLinecap="round" />
          <rect x={x - h * 0.11} y={yG - h * 0.78} width={h * 0.22} height={h * 0.36} rx={h * 0.05} fill="#F97316" />
          <circle cx={x} cy={top + r} r={r} fill="#FCD9B6" stroke="#92400E" strokeWidth={0.8} />
          <text x={x + r + 3} y={top + r + 3} fontSize={9} fill="#9A3412" style={{ direction: 'ltr' }}>1,5 m</text>
        </g>
      );
    }
    case 'stick':
      return (
        <g aria-hidden="true">
          <rect x={x - 2} y={top} width={4} height={yG - top} rx={1.5} fill="#7C2D12" />
          <circle cx={x} cy={top} r={2.6} fill={inShadow ? '#334155' : '#FBBF24'} stroke="#7C2D12" strokeWidth={0.8} data-sw-stick-top={inShadow ? 'shadow' : 'sun'} />
          <text x={x + 5} y={top + 4} fontSize={9} fill="#7C2D12" style={{ direction: 'ltr' }}>1 m</text>
        </g>
      );
    default:
      return null;
  }
}

/** Un petit drapeau planté au sol (pari, règle). */
function FlagMark({ x, y, color, size, dashed = false }) {
  const s = Math.max(9, size);
  return (
    <g>
      <line x1={x} x2={x} y1={y} y2={y - s * 1.2} stroke={color} strokeWidth={1.4} strokeDasharray={dashed ? '2 2' : undefined} />
      <path d={`M${x} ${y - s * 1.2} L${x + s * 0.7} ${y - s * 0.95} L${x} ${y - s * 0.7} Z`} fill={color} opacity={dashed ? 0.55 : 0.95} />
    </g>
  );
}

/** Le ruban jaune, du pied à la main ; s'il grimpe la minaret, il retombe. */
function Tape({ tp, G, objs, textP }) {
  const o = objs.find((q) => q.id === tp.obj);
  if (!o) return null;
  const y = G.yLane(o.lane) + 2;
  const x1 = G.X(tp.from);
  if (tp.climbing) {
    return (
      <g data-sw-tape="climb">
        <path d={`M${x1} ${y} Q${x1 + 6} ${y - 3 * G.laneGap} ${x1 + 22} ${y - 8}`} stroke="#EAB308" strokeWidth={3} fill="none" />
        <text x={x1 + 26} y={y - 10} fontSize={14}>↯</text>
      </g>
    );
  }
  const x2 = G.X(tp.to);
  const len = tp.to - tp.from;
  return (
    <g data-sw-tape={tp.snapped ? 'snapped' : 'free'}>
      <rect x={Math.min(x1, x2)} y={y - 2} width={Math.abs(x2 - x1)} height={4} fill="#FACC15" stroke="#A16207" strokeWidth={0.6} />
      <rect x={x1 - 5} y={y - 5} width={10} height={10} rx={2} fill="#CA8A04" />
      <g transform={`translate(${(x1 + x2) / 2}, ${y - 9})`}>
        <rect x={-24} y={-11} width={48} height={14} rx={7} fill={tp.snapped ? '#0369A1' : '#FFFFFF'} stroke="#0369A1" />
        <text x={0} y={0} textAnchor="middle" fontSize={10} fontWeight="bold" fill={tp.snapped ? '#FFFFFF' : '#0369A1'} {...textP}>{`${W.m(len)} m`}</text>
      </g>
    </g>
  );
}

/* ══════════════ Mise en forme des messages de مقران et questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** Les clés dont la VALEUR est en centimètres bruts (`judge*` de logic/shadowWorld.js) : passées par `W.tex()` pour s'écrire en mètres à virgule.
 *  Les clés déjà pré-formatées par le juge lui-même (`m()`, ex. `ra`/`rb`/`numText`/`k1`/`k2`) ne doivent PAS y entrer une seconde fois.
 *  dStick / dMinaret / pctStick / pctMinaret : le TEMPLATE arabe les lit en centimètres / pourcentage entiers — jamais par `tex()`. */
const CM = new Set([
  'shadow', 'H', 'p', 'truth', 'gap', 'add', 'x', 'O', 'S', 'h', 'd', 'pred', 'stick', 'farid', 'num', 'd1', 'd2', 's1', 's2',
  'before', 'after', 'sa', 'sb', 'Ha', 'Hb',
]);

/** `say({ id, p })` → le texte arabe de `shadowWorld.<id>` avec ses paramètres mis en forme (mètres, noms d'objets, opérateur). */
export function makeSay(k) {
  return (msg) => {
    if (!msg) return '';
    const o = {};
    for (const [key, v] of Object.entries(msg.p ?? {})) {
      if (v == null || v === '') continue;
      if (CM.has(key)) o[key] = W.tex(v);
      else if (['obj', 'okObj', 'a', 'b'].includes(key)) o[key] = k(`obj.${v}`);
      else if (key === 'op') o[key] = v === '×' ? '\\times' : '+';
      else o[key] = v;
    }
    return k(msg.id, o);
  };
}

/** La suite de chaque arrêt (les questions sans donnée à juger sont écartées). */
export function chainOf(stop, lab) {
  const has = (id) => W.QUIZZES[id](lab) != null;
  switch (stop) {
    case 'observe': return ['trend', 'fastest'];
    case 'measure': return ['ratioSeed', 'ratioVal'];
    case 'predict': return [...(has('predictReflect') ? ['predictReflect'] : []), 'predictK', 'predictCompare'];
    case 'rule': return [...(has('ruleReflect') ? ['ruleReflect'] : []), 'ruleWhich'];
    case 'rule2': return ['ruleChanged', 'rule'];
    default: return ['minaretIdea', 'minaretCheck'];
  }
}

const cpt = (say, id, p) => <MathText>{say({ id: `cp.${id}`, p })}</MathText>;

/** Une question tapée de مقران, rejouée comme question de la suite : son prompt, ses options, sa réaction juste/fausse et ses indices sont ceux de مقران. */
const quizQuestion = (quizId) => (lab, stop, k, say) => {
  const v = W.QUIZZES[quizId](lab);
  const ids = QUIZ_OPTIONS[quizId] ?? v.options;
  return {
    id: quizId, kind: 'choice',
    prompt: <MathText>{say({ id: `q_${quizId}`, p: v })}</MathText>,
    options: ids.map((id) => (id === v.correct
      ? { text: k(`quizOpt_${quizId}_${id}`), correct: true }
      : { text: k(`quizOpt_${quizId}_${id}`), why: <MathText>{say({ id: `qWrong_${quizId}`, p: v })}</MathText> })),
    hints: [1, 2].map((l) => <MathText key={l}>{say({ id: `hq_${quizId}_${l}`, p: v })}</MathText>),
    explain: <MathText>{say({ id: `qRight_${quizId}`, p: v })}</MathText>,
  };
};

/** « 1,04 » : ombre ÷ hauteur d'un objet (centimètres entiers). */
const kOf = (shadow, H) => W.m((shadow * 100) / H);
/** « 1,04 » → « 1{,}04 » : la virgule d'un nombre dans une île KaTeX. */
const tx = (v) => String(v).replace(',', '{,}');

const RAW_QUESTIONS = {
  trend: quizQuestion('trend'),
  fastest: quizQuestion('fastest'),
  ratioSeed: quizQuestion('ratioSeed'),
  predictReflect: quizQuestion('predictReflect'),
  ruleReflect: quizQuestion('ruleReflect'),
  /* measure — le rapport ombre ÷ hauteur de l'objet que l'élève vient de mesurer */
  ratioVal: (lab, stop, k, say) => {
    const v = W.judgeRatioSeed(lab);
    const p = { hour: v.hour, a: v.a, sa: v.sa, Ha: v.Ha, ra: tx(v.ra) };
    return {
      id: 'ratioVal', kind: 'number', expected: v.ra, answer: <MathText>{`$${v.ra.replace(',', '{,}')}$`}</MathText>,
      prompt: cpt(say, 'ratioVal.prompt', p),
      hints: [cpt(say, 'ratioVal.hint1', p), cpt(say, 'ratioVal.hint2', p)],
      explain: cpt(say, 'ratioVal.explain', p),
    };
  },
  /* predict — le rapport du pari, puis sa comparaison avec celui de la عصا */
  predictK: (lab, stop, k, say) => {
    const q = lab.predictions.at(-1);
    const kk = kOf(q.truth, q.H);
    const p = { obj: q.obj, H: q.H, truth: q.truth, hour: W.HOURS[q.hour], kk: tx(kk) };
    return {
      id: 'predictK', kind: 'number', expected: kk, answer: <MathText>{`$${kk.replace(',', '{,}')}$`}</MathText>,
      prompt: cpt(say, 'predictK.prompt', p),
      hints: [cpt(say, 'predictK.hint1', p), cpt(say, 'predictK.hint2', p)],
      explain: cpt(say, 'predictK.explain', p),
    };
  },
  predictCompare: (lab, stop, k, say) => {
    const q = lab.predictions.at(-1);
    const sStick = W.shadowAt(100, q.hour);
    const p = { obj: q.obj, hour: W.HOURS[q.hour], stick: sStick, ks: tx(kOf(sStick, 100)), ko: tx(kOf(q.truth, q.H)), H: q.H, truth: q.truth };
    return {
      id: 'predictCompare', kind: 'choice',
      prompt: cpt(say, 'predictCompare.prompt', p),
      options: [
        { text: cpt(say, 'predictCompare.same', p), correct: true },
        { text: cpt(say, 'predictCompare.stickBigger', p), why: cpt(say, 'predictCompare.whyStickBigger', p) },
        { text: cpt(say, 'predictCompare.objBigger', p), why: cpt(say, 'predictCompare.whyObjBigger', p) },
      ],
      hints: [cpt(say, 'predictCompare.hint1', p), cpt(say, 'predictCompare.hint2', p)],
      explain: cpt(say, 'predictCompare.explain', p),
    };
  },
  /* rule — la règle de l'élève appliquée à un objet de 4 m */
  ruleWhich: (lab, stop, k, say) => {
    const r = W.fittingRules(lab)[0];
    const ans = W.m(4 * r.num);
    const p = { hour: W.HOURS[r.hour], numText: tx(W.m(r.num)), ans: tx(ans) };
    return {
      id: 'ruleWhich', kind: 'number', expected: ans, answer: <MathText>{`$${ans.replace(',', '{,}')}$`}</MathText>,
      prompt: cpt(say, 'ruleWhich.prompt', p),
      hints: [cpt(say, 'ruleWhich.hint1', p), cpt(say, 'ruleWhich.hint2', p)],
      explain: cpt(say, 'ruleWhich.explain', p),
    };
  },
  /* rule2 — ce qui a changé entre les deux heures, puis la règle */
  ruleChanged: (lab, stop, k, say) => {
    const [r1, r2] = [W.fittingRules(lab)[0], W.fittingRules(lab).at(-1)];
    const p = { h1: W.HOURS[r1.hour], h2: W.HOURS[r2.hour], k1: W.tex(r1.num), k2: W.tex(r2.num) };
    return {
      id: 'ruleChanged', kind: 'choice',
      prompt: cpt(say, 'ruleChanged.prompt', p),
      options: [
        { text: cpt(say, 'ruleChanged.right', p), correct: true },
        { text: cpt(say, 'ruleChanged.form', p), why: cpt(say, 'ruleChanged.whyForm', p) },
        { text: cpt(say, 'ruleChanged.nothing', p), why: cpt(say, 'ruleChanged.whyNothing', p) },
      ],
      hints: [cpt(say, 'ruleChanged.hint1', p), cpt(say, 'ruleChanged.hint2', p)],
      explain: cpt(say, 'ruleChanged.explain', p),
    };
  },
  rule: (lab, stop, k, say) => {
    const [r1, r2] = [W.fittingRules(lab)[0], W.fittingRules(lab).at(-1)];
    const options = discoveryOptionsOf(lab, k);
    return {
      id: 'rule', kind: 'choice',
      prompt: <MathText>{k('dPrompt', { h1: W.HOURS[r1.hour], h2: W.HOURS[r2.hour], k1: W.tex(r1.num), k2: W.tex(r2.num) })}</MathText>,
      options,
      hints: [cpt(say, 'rule.hint1', {}), cpt(say, 'rule.hint2', {})],
      explain: formalOf(lab, k),
    };
  },
  /* minaret — pourquoi la méthode marche, puis la vérification de la hauteur trouvée */
  minaretIdea: (lab, stop, k, say) => {
    const a = lab.answers.find((x) => x.kind === 'right');
    const hour = lab.hour;
    const p = { hour: W.HOURS[hour], S: W.shadowAt(lab.minaret, hour), h: a.h, stick: W.shadowAt(100, hour) };
    return {
      id: 'minaretIdea', kind: 'choice',
      prompt: cpt(say, 'minaretIdea.prompt', p),
      options: [
        { text: cpt(say, 'minaretIdea.right', p), correct: true },
        { text: cpt(say, 'minaretIdea.shadow', p), why: cpt(say, 'minaretIdea.whyShadow', p) },
        { text: cpt(say, 'minaretIdea.add', p), why: cpt(say, 'minaretIdea.whyAdd', p) },
      ],
      hints: [cpt(say, 'minaretIdea.hint1', p), cpt(say, 'minaretIdea.hint2', p)],
      explain: cpt(say, 'minaretIdea.explain', p),
    };
  },
  minaretCheck: (lab, stop, k, say) => {
    const a = lab.answers.find((x) => x.kind === 'right');
    const hour = lab.hour;
    const S = W.shadowAt(lab.minaret, hour);
    const kk = kOf(S, lab.minaret);
    const p = { hour: W.HOURS[hour], S, h: a.h, kk: tx(kk), stick: W.shadowAt(100, hour) };
    return {
      id: 'minaretCheck', kind: 'number', expected: kk, answer: <MathText>{`$${kk.replace(',', '{,}')}$`}</MathText>,
      prompt: cpt(say, 'minaretCheck.prompt', p),
      hints: [cpt(say, 'minaretCheck.hint1', p), cpt(say, 'minaretCheck.hint2', p)],
      explain: cpt(say, 'minaretCheck.explain', p),
    };
  },
};

/* ── la découverte, écrite avec les règles de l'élève (fin du labo ET dernière question de la suite) ── */
export function discoveryOptionsOf(lab, k) {
  const r1 = W.fittingRules(lab)[0];
  const r2 = W.fittingRules(lab).at(-1);
    if (!r1 || !r2) return [];
    const h = r2.hour;
    const s1 = W.shadowAt(100, h); const s2 = W.shadowAt(150, h);
    const p = { h1: W.HOURS[r1.hour], h2: W.HOURS[r2.hour], k1: W.tex(r1.num), k2: W.tex(r2.num) };
    return [
      { text: <MathText>{k('dOptPlus')}</MathText>, why: <MathText>{k('dWhyPlus', { h: W.HOURS[h], d1: W.tex(s1 - 100), d2: W.tex(s2 - 150) })}</MathText> },
      { text: <MathText>{k('dOptRight')}</MathText>, correct: true },
      { text: <MathText>{k('dOptSameAlways')}</MathText>, why: <MathText>{k('dWhySameAlways', p)}</MathText> },
      { text: <MathText>{k('dOptHourOnly')}</MathText>, why: <MathText>{k('dWhyHourOnly', { h: W.HOURS[h], s1: W.tex(s1), s2: W.tex(s2) })}</MathText> },
    ];
}

export function formalOf(lab, k) {
  const r1 = W.fittingRules(lab)[0];
  const r2 = W.fittingRules(lab).at(-1);
  return r1 && r2 ? (
    <div className="space-y-2" data-sw-formal>
      <p className="text-sm text-emerald-900"><MathText>{k('fNames')}</MathText></p>
      <EquationDisplay tone="result" tex={`s = ${W.tex(r1.num)} \\times h`} note={W.HOURS[r1.hour]} />
      <EquationDisplay tone="result" tex={`s = ${W.tex(r2.num)} \\times h`} note={W.HOURS[r2.hour]} />
      <EquationDisplay tone="result" tex={'\\dfrac{s_1}{h_1} = \\dfrac{s_2}{h_2} = k'} />
      <p className="text-sm text-emerald-900"><MathText>{k('fRule')}</MathText></p>
      <p className="text-sm text-emerald-900"><MathText>{k('fMinaret')}</MathText></p>
    </div>
  ) : null;
}

export const QUESTIONS = spreadAll(RAW_QUESTIONS, (lab) => lab.minaret);
