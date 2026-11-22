import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Check, Minus, Plus, Repeat } from 'lucide-react';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import useStretchInteraction from '../useStretchInteraction';
import LabFold from '../primitives/LabFold';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import MathText from '../../components/MathText';
import * as L from '../logic/parallelogramPin';

/**
 * parallelogram-pin — LA BANDEROLE DU TIFO (unité 11 « الأشعة والانسحاب », درس « الشعاعان المتساويان ومتوازي الأضلاع
 * ومنتصف قطعة » : نشاط 2 ب p. 129, معارف 3 p. 132, طرائق p. 131).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. مبتدئ : l'élève TIENT I sur le foulard [AB] (glisser, toucher le foulard, − / +, flèches) et RETOURNE la seconde
 *    flèche (IB ↔ BI). متقدم : il POSE le coin D de la banderole sur un nœud de la ورقة مرصوفة (glisser, toucher un nœud,
 *    flèches, ثبّت), puis — après l'avoir ouvert — le point E.
 * B. Idée : I milieu de [AB] ⇔ AI = IB ; CD = AB ⇔ ABDC متوازي أضلاع ⇔ [AD] et [BC] ont le même milieu ; d'où la
 *    construction de l'image d'un point par un انسحاب (D image de C) et EB = AC = BD ⇒ B milieu de [DE].
 * C. Les deux flèches comparées et les trois critères (المنحى، الاتجاه، الطول) s'allument / s'éteignent en direct ; la
 *    banderole A → B → D → C se tend, se croise ou pend ; les deux repères de milieux se rapprochent puis se confondent.
 * D. La ligne « نقارن … و … » et ses trois critères ; le compte des parts (AI : k, IB : 8 − k) ; le verdict écrit
 *    (« $\overrightarrow{CD} = \overrightarrow{AB}$ : D صورة C … ») ; les essais de l'élève.
 * E. À découvrir avant la règle : entre A et B, AI et IB ont toujours même منحى et même اتجاه, la longueur seule
 *    départage ; au milieu AI et BI sont OPPOSÉS ; une banderole n'est tendue que pour CD = AB — DC = AB la croise.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        l'égalité de deux vecteurs traduit le milieu et le متوازي أضلاع (معارف 3, معارف 2 de la leçon 1)
 *   OBJECT         un foulard tendu entre deux ultras et le capo qui s'y place (مبتدئ) ; une banderole de tifo tenue
 *                  par quatre ultras sur la grille du stade (متقدم)
 *   VARIABLE       la position de I (k = 1 … 7 parts sur 8) et l'ORDRE des lettres de la seconde flèche ; la position
 *                  du coin D (puis de E), nœud par nœud
 *   INVARIANT      AI et IB gardent toujours même منحى et même اتجاه ; A + D = B + C ⇔ milieux confondus
 *   TRANSFORMATION les flèches s'allongent / raccourcissent, les critères changent ; la banderole se tend ou se croise
 *   CONSTRAINT     I reste sur ]AB[ ; D et E restent sur les nœuds du cadre
 *   RESISTANCE     un essai faux est REFUSÉ par le critère qui diffère (vectors.relation) : « نفس المنحى والاتجاه، لكن
 *                  ليس نفس الطول », « اتجاهان متعاكسان », « المنحى مختلف », « تساوي الطولين لا يكفي » ; DC = AB tord
 *                  la banderole (MISC-SHUAA-TARTIB-RUUS) ; E posé sur D (BE = AC) est nommé « هذه هي D »
 *   EVIDENCE       les critères, les deux repères de milieux, la forme de la banderole, la liste des essais
 *   CONTRAST       مبتدئ : le milieu ET une position où seule la longueur diffère (et AI / BI au milieu) ; متقدم : les
 *                  positions refusées de D (dont la banderole croisée) contre la banderole tendue, puis E
 *   PREDICTION     compter les mailles de A à B avant de poser D (l'indice 2), sans flèche toute faite
 *   DISCOVERY      « AI = IB ⇔ I milieu » ; « EB = AC = BD ⇒ B milieu de [DE] » — distracteurs réfutés par ses essais
 *   FORMALIZATION  معارف 3 et la طريقة « إنشاء صورة نقطة بانسحاب عُلم شعاعه »
 *   TRANSFER       ex-6, 7, 9, 12, 25 (أوظّف), la banque d'exercices
 *
 * Tous les verdicts viennent de `vectors.relation` (logic/parallelogramPin.js) ; le dessin est en flottants mais rien
 * n'est « presque » égal. Manuel (§6bis) : chaque position est un essai, chaque choix une réponse. « جرّب كل الإمكانيات »
 * parcourt les encoches de I (mode midpoint) ; poser D / E est une construction : aucune auto-complétion.
 *
 * DÉCOR (exigence du propriétaire, monde `tifo`) : les gradins du stade du 5-Juillet, la foule et les lampes de
 * téléphones qui scintillent, les ultras aux coins de la banderole, un derbouka (طبل) qui, touché, fait passer une
 * « vague » de lumières dans les gradins. `aria-hidden`, hors clavier (`tabIndex=-1`), `[data-deco]`, sans aucune
 * information ; immobile sous `prefers-reduced-motion`.
 *
 * D'UN SEUL REGARD (MANIPULATION_CONTRACT §8bis) : la scène est budgétée sur l'écran de leçon (`useLessonViewport`)
 * moins ce que le bloc `[data-pp-glance]` mesure EN PLUS d'elle (commandes, critères, verdict) ; les poignées sont SUR
 * les points, les flèches de déplacement juste dessous ; la liste des essais est dans un `LabFold` sous le bloc mesuré.
 *
 * PROPS (à plat ou groupées dans `numbers`, comme levels.js) : `mode` ('midpoint' | 'parallelogram'), `A`, `B`
 * (midpoint), `A`, `B`, `C` (parallelogram), `theme` ('tifo'), `title`, `lead`, `mission`, `level`, `levels`,
 * `onTrial(evidence)` à chaque position validée, `onFinished({ mode, trials })` à la règle — tous par `state.report`.
 *
 * CONTRAT DOM : [data-parallelogram-pin][data-mode][data-stage][data-solved], [data-pp-glance], [data-pp-scene],
 * [data-pp-handle=I|D|E] (I : role=slider), [data-pp-flip][data-second], [data-pp-minus], [data-pp-plus],
 * [data-pp-move=left|right|up|down], [data-pp-commit], [data-pp-next-e], [data-pp-back-d], [data-pp-crit=manha|ittijah|tul][data-ok],
 * [data-pp-banner][data-shape=taut|crossed|slack], [data-pp-mids][data-merged], [data-pp-verdict=<kind>],
 * [data-pp-parts], [data-lab-fold=parallelogram-pin.trials], [data-deco].
 */
const TONE = { equal: 'text-emerald-800', ok: 'text-emerald-800', length: 'text-amber-800', sense: 'text-rose-800', both: 'text-rose-800', order: 'text-rose-800', isD: 'text-rose-800', senseLen: 'text-rose-800', direction: 'text-rose-800', zero: 'text-slate-600' };
const C_REF = '#4F46E5'; const C_LIVE = '#D97706'; const C_OK = '#059669';
const arrowTex = (name) => `$\\overrightarrow{${name}}$`;

export default function ParallelogramPin({
  numbers, mode: mode0, A: A0, B: B0, C: C0, theme = 'tifo', title, lead, mission, level, levels: withLevels = true, checkpoints = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`manipulation.parallelogramPin.${key}`, o), [t]);
  const flat = { mode: mode0 ?? 'midpoint', A: A0, B: B0, ...(C0 ? { C: C0 } : {}) };
  const initialNumbers = { ...Object.fromEntries(Object.entries(flat).filter(([, v]) => v != null)), ...(numbers ?? {}) };
  const state = useManipulation({ type: 'parallelogram-pin', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nums = state.numbers;
  const make = () => L.init(nums);
  const [lab, setLab] = useState(make);
  const sceneKey = `${JSON.stringify(nums)}|${state.epoch}`;
  const [scene, setScene] = useState(sceneKey);
  if (scene !== sceneKey) { setScene(sceneKey); setLab(make()); }
  const para = lab.mode === 'parallelogram';
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');

  // Miroir synchrone de `lab` : « جرّب كل الإمكانيات » enchaîne des pas plus vite qu'un rendu.
  const labRef = useRef(lab);
  labRef.current = lab;
  const notchAuto = !para ? {
    label: t('manipulation.autoComplete.tryAll'),
    ready: true,
    remaining: L.untriedNotches(lab).length,
    intervalMs: 480,
    maxTicks: 80,
    step: () => {
      const next = L.untriedNotches(labRef.current)[0];
      if (next === undefined) return;
      labRef.current = L.commitI(labRef.current, next);
      setLab((s) => L.commitI(s, next));
    },
    finish: () => {
      const todo = L.untriedNotches(labRef.current);
      if (todo.length === 0) return;
      labRef.current = todo.reduce((acc, kk) => L.commitI(acc, kk), labRef.current);
      setLab((s) => todo.reduce((acc, kk) => L.commitI(acc, kk), s));
    },
  } : null;

  // les questions pendant le labo (obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte) : la règle vient de la dernière suite
  const cpSettings = useLabCheckpointSettings('parallelogram-pin');
  const cpActive = checkpoints && cpSettings.enabled;
  const solvedNow = L.discoveryReady(lab);
  const ready = solvedNow && !cpActive;
  useEffect(() => { if (ready) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (state.isFormal) state.report(onFinished, { mode: lab.mode, trials: lab.trials.length });
  }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps
  const nTrials = lab.trials.length;
  useEffect(() => { if (nTrials > 0) state.report(onTrial, L.evidenceOf(lab)); }, [nTrials]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── mesure : largeur, écran de leçon, ce que le bloc « glance » ajoute à la scène ── */
  const boxRef = useRef(null);
  const glanceRef = useRef(null);
  const sceneRef = useRef(null);
  const sceneHRef = useRef(240);
  const [width, setWidth] = useState(320);
  const [overhead, setOverhead] = useState(200);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => {
      setWidth(Math.max(200, Math.floor(el.clientWidth)));
      if (glanceRef.current) setOverhead(Math.max(130, Math.ceil(glanceRef.current.getBoundingClientRect().height) - sceneHRef.current));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (glanceRef.current) ro.observe(glanceRef.current);
    return () => ro.disconnect();
  }, []);
  const vp = useLessonViewport(true);
  const screenH = vp.ready && vp.height > 0 ? vp.height : 640;
  const narrow = width < 380;
  const sceneW = Math.min(width, 720);
  const sceneH = Math.round(Math.max(150, Math.min(L.naturalHeight(lab, sceneW), screenH - overhead - 24, 520)));
  sceneHRef.current = sceneH;
  const fr = L.frame(lab, { width: sceneW, height: sceneH, pad: narrow ? 18 : 24 });

  /* ── مبتدئ : I tenu sur le foulard (le geste « étirer », piste = la scène) ── */
  const range = para ? { min: 1, max: 7 } : L.midRange(lab);
  const toK = useCallback((cx, cy, rect) => {
    if (para) return lab.k ?? 1;
    const [ax, ay] = fr.P(lab.A); const [bx, by] = fr.P(lab.B);
    const px = cx - rect.left; const py = cy - rect.top;
    const dx = bx - ax; const dy = by - ay;
    const tt = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1);
    return tt * lab.N;
  }, [para, lab, fr]);
  const st = useStretchInteraction({
    value: para ? null : lab.k, range, toValue: toK, direction: 'ltr',
    onChange: (v) => setLab((s) => (s.mode === 'midpoint' ? L.moveI(s, v) : s)),
    onCommit: (v) => setLab((s) => (s.mode === 'midpoint' ? L.commitI(s, v) : s)),
  });

  /* ── متقدم : D (puis E) posé nœud par nœud ── */
  const held = para ? lab.stage : null;
  const [dragging, setDragging] = useState(false);
  const settle = useRef(null);
  useEffect(() => () => { if (settle.current) clearTimeout(settle.current); }, []);
  const commitHeld = useCallback(() => {
    if (settle.current) { clearTimeout(settle.current); settle.current = null; }
    setLab((s) => (s.mode === 'parallelogram' ? L.commitPoint(s, s.stage) : s));
  }, []);
  const nudgeHeld = (dx, dy) => {
    setLab((s) => {
      if (s.mode !== 'parallelogram') return s;
      const [x, y] = L.xy(s[s.stage]);
      return L.movePoint(s, s.stage, [x + dx, y + dy]);
    });
    if (settle.current) clearTimeout(settle.current);
    settle.current = setTimeout(commitHeld, 900);
  };
  const nodeFromEvent = (e) => {
    const r = sceneRef.current.getBoundingClientRect();
    const [x, y] = fr.fromPx(e.clientX - r.left, e.clientY - r.top);
    return [Math.round(x), Math.round(y)];
  };
  const onSceneDown = (e) => {
    if (!para || e.button > 0 || !sceneRef.current) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDragging(true);
    const n = nodeFromEvent(e);
    setLab((s) => L.movePoint(s, s.stage, n));
  };
  const onSceneMove = (e) => { if (dragging) { const n = nodeFromEvent(e); setLab((s) => L.movePoint(s, s.stage, n)); } };
  const onSceneUp = (e) => {
    if (!dragging) return;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    setDragging(false);
    const n = nodeFromEvent(e);
    setLab((s) => L.commitPoint(s, s.stage, n));
  };
  const onHeldKey = (e) => {
    const m = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
    if (m) { e.preventDefault(); nudgeHeld(...m); return; }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); commitHeld(); }
  };

  /* ── lectures vivantes ── */
  const mid = !para ? L.midReading(lab) : null;
  const judged = para ? L.judge(lab, held) : null;
  const mids = para ? L.midpoints(lab) : null;
  const shape = para ? L.bannerShape(lab) : null;
  const rel = para ? judged.rel : mid.rel;
  const secondName = !para ? lab.second : null;
  const crit = rel
    ? [['manha', rel.direction], ['ittijah', rel.direction ? rel.sense : false], ['tul', rel.length]]
    : [['manha', false], ['ittijah', false], ['tul', false]];
  const compareLine = para
    ? (held === 'D' ? k('compare', { u: arrowTex('CD'), v: arrowTex('AB') }) : k('compare', { u: arrowTex('EB'), v: arrowTex('AC') }))
    : k('compare', { u: arrowTex('AI'), v: arrowTex(secondName) });

  const last = lab.last?.kind === 'commit' ? lab.last.trial : null;
  const verdict = (() => {
    if (!last) return null;
    if (!para) {
      const r = L.midReading(lab, last.k, last.second);
      const key = r.kind === 'equal' ? 'v_equal' : r.kind === 'length' ? (r.shorter === 'AI' ? 'v_lengthAI' : 'v_lengthW') : `v_${r.kind}`;
      return k(key);
    }
    const p = last.which === 'D' ? 'vD_' : 'vE_';
    const kind = last.kind;
    if (kind === 'length') return k(`${p}${last.longer ? 'lengthLonger' : 'lengthShorter'}`);
    if (kind === 'direction') return k(`${p}${last.sameLength ? 'directionSame' : 'direction'}`);
    return k(`${p}${kind}`);
  })();

  /* ── la découverte : distracteurs réfutés par les essais de l'élève ── */
  const discoveryOptions = useMemo(() => {
    if (!para) {
      const lt = L.lastTrial(lab, (x) => x.kind === 'length') ?? { k: 3 };
      return [
        { text: <MathText>{k('dMidBetween')}</MathText>, why: <MathText>{k('dMidBetweenWhy', { k: lt.k, N: lab.N })}</MathText> },
        { text: <MathText>{k('dMidRight')}</MathText>, correct: true },
        { text: <MathText>{k('dMidBI')}</MathText>, why: <MathText>{k('dMidBIWhy')}</MathText> },
        { text: <MathText>{k('dMidNever')}</MathText>, why: <MathText>{k('dMidNeverWhy')}</MathText> },
      ];
    }
    return [
      { text: <MathText>{k('dParaLength')}</MathText>, why: <MathText>{k('dParaLengthWhy')}</MathText> },
      { text: <MathText>{k('dParaBE')}</MathText>, why: <MathText>{k('dParaBEWhy')}</MathText> },
      { text: <MathText>{k('dParaRight')}</MathText>, correct: true },
    ];
  }, [lab, para, k]);

  const formal = para ? (
    <ol className="list-decimal space-y-1 ps-5 text-sm text-emerald-900" data-pp-formal>
      {['formalPara1', 'formalPara2', 'formalPara3'].map((f) => <li key={f}><MathText>{k(f)}</MathText></li>)}
    </ol>
  ) : (
    <div className="space-y-1 text-sm text-emerald-900" data-pp-formal>
      <p className="font-bold"><MathText>{k('formalMid')}</MathText></p>
      <p><MathText>{k('formalMidTrap')}</MathText></p>
    </div>
  );

  const missionText = mission ?? <MathText>{k(para ? (held === 'E' ? 'missionParaE' : 'missionParaD') : 'missionMid')}</MathText>;
  const hintKeys = para ? ['hintP1', 'hintP2', 'hintP3'] : ['hintM1', 'hintM2', 'hintM3'];

  /* ── textes accessibles d'une position (sans coordonnées : des mailles depuis l'origine du vecteur) ── */
  const posText = (which) => {
    const from = which === 'D' ? lab.C : lab.B;
    const [x, y] = L.xy(lab[which]); const [fx, fy] = L.xy(from);
    return k('valueP', { name: which, dx: Math.abs(x - fx), h: k(x >= fx ? 'right' : 'left'), dy: Math.abs(y - fy), v: k(y >= fy ? 'up' : 'down'), from: which === 'D' ? 'C' : 'B' });
  };

  /* ── les étapes : deux contrastes (milieu : l'égalité puis une encoche où seules les longueurs diffèrent · parallélogramme : D puis E) ── */
  const KINDS = L.STEP_KINDS[lab.mode];
  const [answered, setAnswered] = useState({ epoch: state.epoch, ids: {} });
  const ans = answered.epoch === state.epoch ? answered.ids : {};
  const reachedK = L.reachedKinds(lab);
  const pending = KINDS.filter((kd) => reachedK.includes(kd) && !ans[kd]);
  const stepId = pending[0] ?? null;
  const withRule = pending.length === 1 && reachedK.length === KINDS.length;
  const chain = cpActive && stepId ? chainOf(stepId, withRule) : null;
  const cp = useLabCheckpoint({
    id: chain ? stepId : null,
    questions: chain ? chain.map((q) => QUESTIONS[q](lab, k, { options: discoveryOptions, prompt: para ? 'dPromptPara' : 'dPromptMid', formal })) : null,
    reached: !!stepId,
    resetKey: state.epoch,
    onRetry: () => setLab((x) => L.restartStep(x, stepId)),
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => {
      setAnswered((a) => ({ epoch: state.epoch, ids: { ...(a.epoch === state.epoch ? a.ids : {}), [id]: true } }));
      if (chain.includes('rule')) { state.discover(); state.formalize(); }
    },
  });
  const stepDone = KINDS.map((kd) => reachedK.includes(kd) && (!cpActive || !!ans[kd]));
  const stepper = <LabStepper count={KINDS.length} current={stepDone.every(Boolean) ? KINDS.length - 1 : stepDone.findIndex((d) => !d)} done={stepDone} stepAttr="data-pp-step" />;
  const party = useStepCelebration();
  const celebrated = useRef({ epoch: state.epoch, set: new Set() });
  if (celebrated.current.epoch !== state.epoch) celebrated.current = { epoch: state.epoch, set: new Set() };
  useEffect(() => {
    stepDone.forEach((d, i) => {
      if (!d || celebrated.current.set.has(i)) return;
      celebrated.current.set.add(i);
      party.celebrate({ n: i + 1, total: KINDS.length });
    });
  }, [stepDone.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps
  // le son : un déclic par position validée, « over » quand elle est refusée (ou que les longueurs diffèrent), le drapeau quand une étape est faite
  const doneN = stepDone.filter(Boolean).length;
  const sfx = useRef({ n: nTrials, d: doneN, epoch: state.epoch });
  useEffect(() => {
    const p = sfx.current;
    if (p.epoch !== state.epoch) { sfx.current = { n: nTrials, d: doneN, epoch: state.epoch }; return; }
    if (nTrials > p.n) { const tr = lab.trials[nTrials - 1]; playSfx(tr && tr.kind !== 'equal' && tr.kind !== 'ok' ? 'over' : 'tooth'); }
    if (doneN > p.d) playSfx('flag');
    sfx.current = { n: nTrials, d: doneN, epoch: state.epoch };
  }, [nTrials, doneN, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps

  const btn = 'inline-flex h-11 min-w-11 items-center justify-center gap-1 rounded-xl border-2 border-indigo-300 bg-white px-2 text-sm font-bold text-indigo-900 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500';
  const [wave, setWave] = useState(0);

  const controls = para ? (
    <div className="flex flex-wrap items-center justify-center gap-1.5" data-pp-controls>
      <div className="flex items-center gap-1" dir="ltr">
        <button type="button" className={btn} onClick={() => nudgeHeld(-1, 0)} aria-label={k('moveLeft', { name: held })} data-pp-move="left"><ArrowLeft className="h-5 w-5" aria-hidden="true" /></button>
        <button type="button" className={btn} onClick={() => nudgeHeld(0, 1)} aria-label={k('moveUp', { name: held })} data-pp-move="up"><ArrowUp className="h-5 w-5" aria-hidden="true" /></button>
        <button type="button" className={btn} onClick={() => nudgeHeld(0, -1)} aria-label={k('moveDown', { name: held })} data-pp-move="down"><ArrowDown className="h-5 w-5" aria-hidden="true" /></button>
        <button type="button" className={btn} onClick={() => nudgeHeld(1, 0)} aria-label={k('moveRight', { name: held })} data-pp-move="right"><ArrowRight className="h-5 w-5" aria-hidden="true" /></button>
      </div>
      <button type="button" className={`${btn} border-emerald-400 text-emerald-900`} onClick={commitHeld} data-pp-commit>
        <Check className="h-4 w-4" aria-hidden="true" />{k('commit', { name: held })}
      </button>
      {lab.stage === 'D' && lab.dDone && (
        <button type="button" className={`${btn} border-violet-400 bg-violet-50 text-violet-900`} onClick={() => setLab(L.openE)} data-pp-next-e>{k('nextE')}</button>
      )}
      {lab.stage === 'E' && (
        <button type="button" className={`${btn} border-slate-300 text-slate-700`} onClick={() => setLab(L.backToD)} data-pp-back-d>{k('backD')}</button>
      )}
      <Drum onBeat={() => setWave((n) => n + 1)} />
    </div>
  ) : (
    <div className="flex flex-wrap items-center justify-center gap-1.5" data-pp-controls>
      <button type="button" className={btn} onClick={() => st.nudge(-1)} disabled={lab.k <= range.min} aria-label={k('minus')} data-pp-minus><Minus className="h-5 w-5" aria-hidden="true" /></button>
      <button type="button" className={btn} onClick={() => st.nudge(1)} disabled={lab.k >= range.max} aria-label={k('plus')} data-pp-plus><Plus className="h-5 w-5" aria-hidden="true" /></button>
      <button type="button" className={`${btn} border-amber-400 text-amber-900`} onClick={() => setLab(L.flip)} data-pp-flip data-second={lab.second}>
        <Repeat className="h-4 w-4" aria-hidden="true" />{k('flip')} <bdi dir="ltr" className="font-mono">{lab.second === 'IB' ? 'IB → BI' : 'BI → IB'}</bdi>
      </button>
      <Drum onBeat={() => setWave((n) => n + 1)} />
    </div>
  );

  const handleI = !para && (() => {
    const [x, y] = fr.P(L.pointI(lab));
    return (
      <div {...st.handleProps({ label: k('handleI'), valueText: k('valueI', { k: lab.k, N: lab.N }) })}
        data-pp-handle="I" data-k={lab.k}
        className="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[3px] border-indigo-600 bg-white/95 shadow outline-none focus-visible:ring-4 focus-visible:ring-indigo-400"
        style={{ left: x, top: y, cursor: st.dragging ? 'grabbing' : 'grab' }}>
        <span dir="ltr" className="font-mono text-sm font-extrabold text-indigo-900">I</span>
      </div>
    );
  })();

  const handleHeld = para && (() => {
    const [x, y] = fr.P(lab[held]);
    return (
      <button type="button" onKeyDown={onHeldKey} onClick={(e) => e.preventDefault()}
        aria-label={`${k(held === 'D' ? 'handleD' : 'handleE')} — ${posText(held)}`}
        data-pp-handle={held}
        className={`absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[3px] bg-white/95 shadow outline-none focus-visible:ring-4 focus-visible:ring-amber-300 ${judged?.kind === 'ok' ? 'border-emerald-600' : 'border-amber-500'}`}
        style={{ left: x, top: y, cursor: dragging ? 'grabbing' : 'grab' }}>
        <span dir="ltr" className="font-mono text-sm font-extrabold text-slate-900">{held}</span>
      </button>
    );
  })();

  return (
    <ManipulationShell
      type="parallelogram-pin"
      title={title ?? k('title')}
      mission={missionText}
      lead={lead}
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      headerAction={cpSettings.control}
      guided={cpActive}
      hints={hintKeys.map((h) => <MathText key={h}>{k(h)}</MathText>)}
      controller={{ autoStep: () => false, canAutoStep: () => false, ...(notchAuto ? { autoComplete: notchAuto } : {}) }}
      discovery={(
        <ManipulationDiscovery state={state} prompt={<MathText>{k(para ? 'dPromptPara' : 'dPromptMid')}</MathText>} options={discoveryOptions} formal={formal} />
      )}
      explanation={<MathText>{k(para ? 'explanationPara' : 'explanationMid')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-emerald-50/50 to-white" minHeight="min-h-[160px]">
        <div ref={boxRef} className={`relative space-y-2 ${cp.open ? 'min-h-[620px]' : ''}`} data-parallelogram-pin data-mode={lab.mode} data-stage={para ? lab.stage : 'I'}
          data-world={theme} data-solved={solvedNow ? 'true' : 'false'} data-scene-h={sceneH}>
          {party.node}
          {cp.node}
          <div ref={glanceRef} className="space-y-1.5" data-pp-glance>
            {stepper}
            <div ref={sceneRef} className="relative mx-auto select-none" style={{ width: sceneW, height: sceneH, touchAction: para ? 'none' : undefined }}
              data-pp-scene onPointerDown={onSceneDown} onPointerMove={onSceneMove} onPointerUp={onSceneUp} onPointerCancel={onSceneUp}>
              <Scene lab={lab} fr={fr} uid={uid} wave={wave} mid={mid} shape={shape} mids={mids} held={held} judged={judged} width={sceneW} height={sceneH} />
              {!para && <div {...st.trackProps} className="absolute inset-0">{handleI}</div>}
              {para && handleHeld}
            </div>
            {para && lab.stage === 'D' && lab.dDone && (
              <p className="text-center text-xs font-bold text-violet-900" data-pp-done-d><MathText>{k('doneD')}</MathText></p>
            )}
            {controls}
            <div className={`flex flex-wrap items-center justify-center gap-x-2 gap-y-1 ${narrow ? 'text-xs' : 'text-sm'}`} data-pp-reading>
              <span className="font-bold text-slate-700"><MathText>{compareLine}</MathText></span>
              {crit.map(([c, ok]) => (
                <span key={c} data-pp-crit={c} data-ok={ok ? 'true' : 'false'}
                  className={`rounded-full border px-2 py-0.5 text-xs font-bold ${ok ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-rose-300 bg-rose-50 text-rose-800'}`}>
                  {k(c)}: {ok ? '✓' : '✗'}
                </span>
              ))}
              {!para && (
                <span className="text-xs font-semibold text-slate-600" data-pp-parts={`${mid.partsAI}|${mid.partsW}`}>
                  {k('partsTitle')} — <bdi dir="ltr" className="font-mono">AI</bdi>: {mid.partsAI} ، <bdi dir="ltr" className="font-mono">{secondName}</bdi>: {mid.partsW}
                </span>
              )}
              {para && lab.stage === 'D' && (
                <span className={`text-xs font-bold ${mids.merged ? 'text-emerald-800' : 'text-slate-600'}`} data-pp-mids data-merged={mids.merged ? 'true' : 'false'}>
                  {k(mids.merged ? 'merged' : 'apart')} · {k(shape)}
                </span>
              )}
            </div>
            <p role="status" className={`min-h-[2.5rem] text-center ${narrow ? 'text-xs' : 'text-sm'} font-bold leading-snug ${last ? TONE[last.kind] : 'text-slate-500'}`}
              data-pp-verdict={last?.kind ?? ''}>
              {verdict ? <MathText>{verdict}</MathText> : k(para ? (held === 'E' ? 'waitingParaE' : 'waitingPara') : 'waitingMid')}
            </p>
          </div>

          {lab.trials.length > 0 && (
            <LabFold id="parallelogram-pin.trials" title={k('trialsTitle')}>
              <ul className="space-y-0.5 text-xs" data-pp-trials={lab.trials.length}>
                {lab.trials.map((x, i) => (
                  <li key={i} className={TONE[x.kind]} data-kind={x.kind}>
                    {para
                      ? k('trialPara', { name: x.which, verdict: k(`t_${x.kind}`) })
                      : <>{k('trialMid', { k: x.k, N: lab.N, verdict: k(`t_${x.kind}`) })} <bdi dir="ltr" className="font-mono">(AI · {x.second})</bdi></>}
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

/* ── la scène : les gradins (décor), la ورقة مرصوفة, le foulard ou la banderole, les flèches ── */
function arrowPath(p, q, inset = 0) {
  const dx = q[0] - p[0]; const dy = q[1] - p[1]; const l = Math.hypot(dx, dy) || 1;
  const ux = dx / l; const uy = dy / l;
  const a = [p[0] + ux * inset, p[1] + uy * inset]; const b = [q[0] - ux * inset, q[1] - uy * inset];
  const h = 10; const w = 5.5;
  const base = [b[0] - ux * h, b[1] - uy * h];
  return {
    line: [a, base],
    head: `${b[0]},${b[1]} ${base[0] - uy * w},${base[1] + ux * w} ${base[0] + uy * w},${base[1] - ux * w}`,
  };
}

function Arrow({ from, to, color, offset = 0, label, inset = 6, dashed = false, ...rest }) {
  const dx = to[0] - from[0]; const dy = to[1] - from[1]; const l = Math.hypot(dx, dy) || 1;
  const nx = -dy / l * offset; const ny = dx / l * offset;
  const p = [from[0] + nx, from[1] + ny]; const q = [to[0] + nx, to[1] + ny];
  if (l < 2 * inset + 4) return null;
  const a = arrowPath(p, q, inset);
  const mx = (p[0] + q[0]) / 2 + nx * 0.9; const my = (p[1] + q[1]) / 2 + ny * 0.9;
  return (
    <g {...rest}>
      <line x1={a.line[0][0]} y1={a.line[0][1]} x2={a.line[1][0]} y2={a.line[1][1]} stroke={color} strokeWidth={3.2} strokeLinecap="round" strokeDasharray={dashed ? '6 4' : undefined} />
      <polygon points={a.head} fill={color} />
      {label && (
        <g style={{ direction: 'ltr' }}>
          <text x={mx} y={my + 4} textAnchor="middle" fontSize={13} fontWeight={800} fill={color} stroke="#fff" strokeWidth={3} paintOrder="stroke">{label}</text>
          <line x1={mx - label.length * 4} x2={mx + label.length * 4 - 2} y1={my - 9} y2={my - 9} stroke={color} strokeWidth={1.4} />
          <polygon points={`${mx + label.length * 4},${my - 9} ${mx + label.length * 4 - 4},${my - 11.5} ${mx + label.length * 4 - 4},${my - 6.5}`} fill={color} />
        </g>
      )}
    </g>
  );
}

function Ultra({ at, away, color = '#16A34A' }) {
  // un ultra posé à côté du point, du côté opposé au centre de la figure (décor)
  const dx = at[0] - away[0]; const dy = at[1] - away[1]; const l = Math.hypot(dx, dy) || 1;
  const x = at[0] + (dx / l) * 34; const y = at[1] + (dy / l) * 34;
  return (
    <g data-deco="ultra" aria-hidden="true" opacity={0.85}>
      <circle cx={x} cy={y - 9} r={4.2} fill="#7C2D12" />
      <path d={`M${x - 5} ${y + 6} L${x} ${y - 4} L${x + 5} ${y + 6} Z`} fill={color} />
      <line x1={x - 2} y1={y - 2} x2={x - 8} y2={y - 11} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <line x1={x + 2} y1={y - 2} x2={x + 8} y2={y - 11} stroke={color} strokeWidth={2} strokeLinecap="round" />
    </g>
  );
}

function Stands({ width, height, wave, reduce }) {
  const rows = Math.max(3, Math.round(height / 34));
  const lights = [];
  for (let r = 0; r < rows; r += 1) {
    for (let i = 0; i < Math.round(width / 46); i += 1) {
      const x = ((i * 46 + (r % 2) * 23 + (r * 17) % 31) % width);
      lights.push({ x, y: r * (height / rows) + 10, d: ((i + r) % 5) * 0.35, i, r });
    }
  }
  return (
    <g data-deco="stands" aria-hidden="true">
      <rect x={0} y={0} width={width} height={height} fill="#F0FDF4" />
      {Array.from({ length: rows }, (_, r) => (
        <rect key={r} x={0} y={r * (height / rows)} width={width} height={height / rows / 2} fill={r % 2 ? '#DCFCE7' : '#FFFFFF'} opacity={0.7} />
      ))}
      {Array.from({ length: rows }, (_, r) => Array.from({ length: Math.ceil(width / 24) }, (_, i) => {
        const x = i * 24 + (r % 2) * 12; const y = r * (height / rows) + height / rows - 4;
        const shirt = ['#16A34A', '#FFFFFF', '#DC2626'][(i + r) % 3];
        return (
          <g key={`f${r}-${i}`} opacity={0.14}>
            <circle cx={x} cy={y - 9} r={3.6} fill="#78350F" />
            <path d={`M${x - 6} ${y} Q${x} ${y - 9} ${x + 6} ${y} Z`} fill={shirt} stroke="#94A3B8" strokeWidth={0.5} />
          </g>
        );
      }))}
      <style>{`.pp-l{animation:pp-tw 2.4s ease-in-out infinite}.pp-w{animation:pp-wave .9s ease-out 1}@keyframes pp-tw{0%,100%{opacity:.25}50%{opacity:.8}}@keyframes pp-wave{0%{opacity:.2}40%{opacity:1}100%{opacity:.3}}@media (prefers-reduced-motion: reduce){.pp-l,.pp-w{animation:none}}`}</style>
      {lights.map((l) => (
        <circle key={`${l.i}-${l.r}-${wave}`} className={reduce ? undefined : (wave > 0 ? 'pp-w' : 'pp-l')} cx={l.x} cy={l.y} r={2.2}
          fill="#FDE047" opacity={0.35} style={reduce ? undefined : { animationDelay: `${wave > 0 ? l.i * 0.05 : l.d}s` }} />
      ))}
    </g>
  );
}

function Scene({ lab, fr, uid, wave, mid, shape, mids, held, judged, width, height }) {
  const reduce = useReducedMotion();
  const text = { direction: 'ltr', unicodeBidi: 'isolate' };
  const { win, px, py } = fr;
  const grid = [];
  for (let x = win.xMin; x <= win.xMax; x += 1) grid.push(<line key={`x${x}`} x1={px(x)} x2={px(x)} y1={py(win.yMin)} y2={py(win.yMax)} stroke="#94A3B8" strokeWidth={0.7} opacity={0.55} />);
  for (let y = win.yMin; y <= win.yMax; y += 1) grid.push(<line key={`y${y}`} x1={px(win.xMin)} x2={px(win.xMax)} y1={py(y)} y2={py(y)} stroke="#94A3B8" strokeWidth={0.7} opacity={0.55} />);
  const P = fr.P;
  const label = (name, at, dx = 0, dy = -12) => (
    <text x={at[0] + dx} y={at[1] + dy} textAnchor="middle" fontSize={15} fontWeight={800} fill="#0F172A" stroke="#fff" strokeWidth={3} paintOrder="stroke" style={text}>{name}</text>
  );
  /** un nom posé hors de la figure, à l'opposé de son centre (jamais sur une flèche ni sur l'ultra, qui est plus loin) */
  const out = (name, at, center, d = 17) => {
    const dx = at[0] - center[0]; const dy = at[1] - center[1]; const l = Math.hypot(dx, dy) || 1;
    return label(name, [at[0] + (dx / l) * d, at[1] + (dy / l) * d + 5], 0, 0);
  };
  const dot = (at, color = '#0F172A') => <circle cx={at[0]} cy={at[1]} r={4.5} fill={color} />;
  const pat = `pp-stripes-${uid}`;

  if (lab.mode === 'midpoint') {
    const A = P(lab.A); const B = P(lab.B); const I = P(L.pointI(lab));
    const center = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2 + 60];
    const ticks = Array.from({ length: lab.N + 1 }, (_, i) => {
      const t = i / lab.N; return [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t];
    });
    const len = Math.hypot(B[0] - A[0], B[1] - A[1]) || 1;
    const nx = -(B[1] - A[1]) / len; const ny = (B[0] - A[0]) / len;
    const second = lab.second === 'IB' ? [I, B] : [B, I];
    const eq = mid.kind === 'equal';
    return (
      <svg width={width} height={height} className="absolute inset-0" aria-hidden="true" focusable="false" style={{ direction: 'ltr' }}>
        <defs>
          <pattern id={pat} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform={`rotate(${(Math.atan2(B[1] - A[1], B[0] - A[0]) * 180) / Math.PI})`}>
            <rect width="7" height="14" fill="#16A34A" /><rect x="7" width="7" height="14" fill="#FFFFFF" />
          </pattern>
        </defs>
        <Stands width={width} height={height} wave={wave} reduce={reduce} />
        <g>{grid}</g>
        {/* le foulard [AB], partagé en 8 parts (les encoches) */}
        <line x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} stroke={`url(#${pat})`} strokeWidth={12} strokeLinecap="round" data-pp-scarf />
        <line x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} stroke="#166534" strokeWidth={1} />
        {ticks.map((p, i) => (
          <line key={i} x1={p[0] + nx * 8} y1={p[1] + ny * 8} x2={p[0] - nx * 8} y2={p[1] - ny * 8} stroke="#0F172A" strokeWidth={i === 0 || i === lab.N ? 2.4 : 1.4} data-tick={i} />
        ))}
        <Ultra at={A} away={center} />
        <Ultra at={B} away={center} />
        <Arrow from={A} to={I} color={eq ? C_OK : C_REF} offset={-20} label="AI" data-pp-arrow="AI" />
        <Arrow from={second[0]} to={second[1]} color={eq ? C_OK : C_LIVE} offset={-20} label={lab.second} data-pp-arrow={lab.second} />
        {dot(A)}{dot(B)}
        {label('A', A, 0, 22)}{label('B', B, 0, 22)}
      </svg>
    );
  }

  const A = P(lab.A); const B = P(lab.B); const C = P(lab.C); const D = P(lab.D);
  const center = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3];
  const banner = `${A[0]},${A[1]} ${B[0]},${B[1]} ${D[0]},${D[1]} ${C[0]},${C[1]}`;
  const bannerFill = shape === 'taut' ? `url(#${pat})` : shape === 'crossed' ? '#FDA4AF' : '#BBF7D0';
  const mAD = P(mids.mAD); const mBC = P(mids.mBC);
  const okD = held === 'D' && judged?.kind === 'ok';
  const stageE = lab.stage === 'E';
  const E = P(lab.E);
  return (
    <svg width={width} height={height} className="absolute inset-0" aria-hidden="true" focusable="false" style={{ direction: 'ltr' }}>
      <defs>
        <pattern id={pat} width="16" height="16" patternUnits="userSpaceOnUse">
          <rect width="16" height="8" fill="#16A34A" /><rect y="8" width="16" height="8" fill="#FFFFFF" />
        </pattern>
      </defs>
      <Stands width={width} height={height} wave={wave} reduce={reduce} />
      <g>{grid}</g>
      {/* la banderole A → B → D → C, tenue par quatre ultras */}
      <polygon points={banner} fill={bannerFill} fillOpacity={shape === 'taut' ? 0.55 : 0.45}
        stroke={shape === 'taut' ? '#166534' : shape === 'crossed' ? '#BE123C' : '#16A34A'} strokeWidth={2.4}
        strokeDasharray={shape === 'slack' ? '7 5' : undefined} strokeLinejoin="round" data-pp-banner data-shape={shape} />
      {shape === 'taut' && (
        <g transform={`translate(${(2 * A[0] + B[0] + D[0]) / 4} ${(2 * A[1] + B[1] + D[1]) / 4})`} data-deco="crescent" aria-hidden="true">
          <circle r={11} fill="#DC2626" /><circle cx={4} r={9} fill="#16A34A" fillOpacity={0.55} />
        </g>
      )}
      {!stageE && (
        <g data-pp-cords>
          <line x1={A[0]} y1={A[1]} x2={D[0]} y2={D[1]} stroke="#BE185D" strokeWidth={1.6} strokeDasharray="5 4" />
          <line x1={B[0]} y1={B[1]} x2={C[0]} y2={C[1]} stroke="#0369A1" strokeWidth={1.6} strokeDasharray="5 4" />
          {mids.merged ? (
            <circle cx={mBC[0]} cy={mBC[1]} r={8} fill="#FFFFFF" stroke={C_OK} strokeWidth={3} data-pp-mid="merged" />
          ) : (
            <>
              <circle cx={mAD[0]} cy={mAD[1]} r={6} fill="#FFFFFF" stroke="#BE185D" strokeWidth={2.6} data-pp-mid="AD" />
              <circle cx={mBC[0]} cy={mBC[1]} r={6} fill="#FFFFFF" stroke="#0369A1" strokeWidth={2.6} data-pp-mid="BC" />
            </>
          )}
        </g>
      )}
      {[A, B, C, D].map((p, i) => <Ultra key={i} at={p} away={center} color={i % 2 ? '#16A34A' : '#DC2626'} />)}
      {/* les flèches : la référence (AB ou AC) et la flèche tenue (CD ou EB) */}
      {!stageE ? (
        <>
          <Arrow from={A} to={B} color={okD ? C_OK : C_REF} label="AB" data-pp-arrow="AB" />
          <Arrow from={C} to={D} color={okD ? C_OK : C_LIVE} label="CD" data-pp-arrow="CD" />
        </>
      ) : (
        <>
          <line x1={D[0]} y1={D[1]} x2={E[0]} y2={E[1]} stroke="#64748B" strokeWidth={1.4} strokeDasharray="4 4" />
          <Arrow from={A} to={C} color={judged?.kind === 'ok' ? C_OK : '#7C3AED'} label="AC" data-pp-arrow="AC" />
          <Arrow from={E} to={B} color={judged?.kind === 'ok' ? C_OK : C_LIVE} label="EB" data-pp-arrow="EB" />
          {dot(D, '#475569')}{out('D', D, center)}
        </>
      )}
      {dot(A)}{dot(B)}{dot(C)}
      {out('A', A, center)}{out('B', B, center)}{out('C', C, center)}
    </svg>
  );
}

/** Le derbouka des ultras : touché, une vague de lampes de téléphones traverse les gradins. Décor seulement. */
function Drum({ onBeat }) {
  return (
    <button type="button" tabIndex={-1} aria-hidden="true" data-deco="drum" onClick={onBeat}
      className="h-11 w-10 shrink-0 rounded-xl focus:outline-none">
      <svg viewBox="0 0 40 44" width="100%" height="100%">
        <ellipse cx="20" cy="10" rx="14" ry="5" fill="#FDE68A" stroke="#92400E" strokeWidth="1.5" />
        <path d="M6 10 Q8 30 20 40 Q32 30 34 10" fill="#B45309" />
        <path d="M10 16 L30 16 M12 24 L28 24" stroke="#16A34A" strokeWidth="2.5" />
      </svg>
    </button>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

const $ = (s) => `$${s}$`;
const VEC = (s) => `\\overrightarrow{${s}}`;
const Mx = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;

/** La suite de questions de l'étape `kd` (midpoint : equal · length ; parallelogram : D · E) ; la règle ferme la DERNIÈRE étape à finir. */
export function chainOf(kd, withRule) {
  const base = { equal: ['parts', 'equalWhy'], length: ['partsIB', 'notEqual'], D: ['dWhy', 'dMids'], E: ['eWhy', 'bMid'] }[kd];
  return withRule ? [...base, 'rule'] : base;
}

/** Chaque question est construite sur LES nombres de l'essai de l'élève (rien en dur) ; `k` : les textes de `parallelogramPin`. */
export const QUESTIONS = {
  parts: (lab, k) => {
    const tr = L.lastTrial(lab, (x) => x.kind === 'equal');
    const o = { N: $(String(lab.N)), k: $(String(tr.k)), AI: $(VEC('AI')), IB: $(VEC('IB')) };
    return {
      id: 'parts', kind: 'number', expected: String(tr.k), answer: <MathText>{$(String(tr.k))}</MathText>,
      prompt: Mx(k, 'parts.prompt', o), hints: [Mx(k, 'parts.hint1', o), Mx(k, 'parts.hint2', o)],
      explain: Mx(k, 'parts.explain', o),
    };
  },
  equalWhy: (lab, k) => {
    const o = { AI: $(VEC('AI')), IB: $(VEC('IB')) };
    return {
      id: 'equalWhy', kind: 'choice',
      prompt: Mx(k, 'equalWhy.prompt', o),
      options: [
        { text: Mx(k, 'equalWhy.direction'), why: Mx(k, 'equalWhy.whyDirection', o) },
        { text: Mx(k, 'equalWhy.all'), correct: true },
        { text: Mx(k, 'equalWhy.length'), why: Mx(k, 'equalWhy.whyLength', o) },
      ],
      hints: [Mx(k, 'equalWhy.hint1'), Mx(k, 'equalWhy.hint2')],
      explain: Mx(k, 'equalWhy.explain', o),
    };
  },
  partsIB: (lab, k) => {
    const tr = L.lastTrial(lab, (x) => x.kind === 'length');
    const rest = lab.N - tr.k;
    const o = { N: $(String(lab.N)), k: $(String(tr.k)), rest: $(String(rest)) };
    return {
      id: 'partsIB', kind: 'number', expected: String(rest), answer: <MathText>{$(String(rest))}</MathText>,
      prompt: Mx(k, 'partsIB.prompt', o), hints: [Mx(k, 'partsIB.hint1', o), Mx(k, 'partsIB.hint2', o)],
      explain: Mx(k, 'partsIB.explain', o),
    };
  },
  notEqual: (lab, k) => {
    const tr = L.lastTrial(lab, (x) => x.kind === 'length');
    const o = { k: $(String(tr.k)), rest: $(String(lab.N - tr.k)), AI: $(VEC('AI')), IB: $(VEC('IB')) };
    return {
      id: 'notEqual', kind: 'choice',
      prompt: Mx(k, 'notEqual.prompt', o),
      options: [
        { text: Mx(k, 'notEqual.direction'), why: Mx(k, 'notEqual.whyDirection', o) },
        { text: Mx(k, 'notEqual.sense'), why: Mx(k, 'notEqual.whySense', o) },
        { text: Mx(k, 'notEqual.length', o), correct: true },
      ],
      hints: [Mx(k, 'notEqual.hint1'), Mx(k, 'notEqual.hint2', o)],
      explain: Mx(k, 'notEqual.explain', o),
    };
  },
  dWhy: (lab, k) => {
    const o = { CD: $(VEC('CD')), DC: $(VEC('DC')), AB: $(VEC('AB')) };
    return {
      id: 'dWhy', kind: 'choice',
      prompt: Mx(k, 'dWhy.prompt', o),
      options: [
        { text: Mx(k, 'dWhy.order', o), why: Mx(k, 'dWhy.whyOrder', o) },
        { text: Mx(k, 'dWhy.right', o), correct: true },
        { text: Mx(k, 'dWhy.length', o), why: Mx(k, 'dWhy.whyLength', o) },
      ],
      hints: [Mx(k, 'dWhy.hint1', o), Mx(k, 'dWhy.hint2', o)],
      explain: Mx(k, 'dWhy.explain', o),
    };
  },
  dMids: (lab, k) => ({
    id: 'dMids', kind: 'choice',
    prompt: Mx(k, 'dMids.prompt'),
    options: [
      { text: Mx(k, 'dMids.apart'), why: Mx(k, 'dMids.whyApart') },
      { text: Mx(k, 'dMids.merged'), correct: true },
      { text: Mx(k, 'dMids.onB'), why: Mx(k, 'dMids.whyOnB') },
    ],
    hints: [Mx(k, 'dMids.hint1'), Mx(k, 'dMids.hint2')],
    explain: Mx(k, 'dMids.explain'),
  }),
  eWhy: (lab, k) => {
    const o = { EB: $(VEC('EB')), BE: $(VEC('BE')), AE: $(VEC('AE')), AC: $(VEC('AC')) };
    return {
      id: 'eWhy', kind: 'choice',
      prompt: Mx(k, 'eWhy.prompt', o),
      options: [
        { text: Mx(k, 'eWhy.be', o), why: Mx(k, 'eWhy.whyBE', o) },
        { text: Mx(k, 'eWhy.ae', o), why: Mx(k, 'eWhy.whyAE', o) },
        { text: Mx(k, 'eWhy.eb', o), correct: true },
      ],
      hints: [Mx(k, 'eWhy.hint1', o), Mx(k, 'eWhy.hint2', o)],
      explain: Mx(k, 'eWhy.explain', o),
    };
  },
  bMid: (lab, k) => {
    const o = { EB: $(VEC('EB')), BD: $(VEC('BD')), AC: $(VEC('AC')) };
    return {
      id: 'bMid', kind: 'choice',
      prompt: Mx(k, 'bMid.prompt', o),
      options: [
        { text: Mx(k, 'bMid.ac'), why: Mx(k, 'bMid.whyAC') },
        { text: Mx(k, 'bMid.de'), correct: true },
        { text: Mx(k, 'bMid.be'), why: Mx(k, 'bMid.whyBE', o) },
      ],
      hints: [Mx(k, 'bMid.hint1', o), Mx(k, 'bMid.hint2')],
      explain: Mx(k, 'bMid.explain', o),
    };
  },
  rule: (lab, k, ctx) => ({
    id: 'rule', kind: 'choice',
    prompt: <MathText>{k(ctx.prompt)}</MathText>,
    options: ctx.options,
    hints: [Mx(k, `rule.${lab.mode === 'parallelogram' ? 'para' : 'mid'}1`), Mx(k, 'rule.hint2')],
    explain: ctx.formal,
  }),
};
