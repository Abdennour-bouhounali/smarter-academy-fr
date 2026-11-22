import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Hand, CheckCircle2, Sparkles, ChevronLeft, ChevronRight, FlaskConical, Undo2, RotateCcw, Send } from 'lucide-react';
import { resolveLevelId } from '@smarter-academy/core/curriculum/manipulationLevels.js';
import { ratText, sub, add, mul, rat } from '@smarter-academy/core/arithmetic/powers.js';
import MathText from '../../components/MathText';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import { LabCard, StageFrame, PromptCard, VerdictBanner } from '../primitives/LabKit';
import { useLabCoach } from '../primitives/LabCoach';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import { LEVELS } from '../levels';
import * as L from '../logic/gearCrank';
import BikeScene, { CSS as SCENE_CSS, BB } from './gearCrank/BikeScene';

/**
 * gear-crank — LA DIVISION PAR UN RAPPORT SOUS LA MAIN : « دوّاسة الدرّاجة » (3AM, unité 2 « العمليات على الكسور والأعداد الناطقة », درس « مقلوب عدد وقسمة
 * كسرين », 2026-10-25). La logique, exacte, est dans `logic/gearCrank.js` (sur `packages/core/arithmetic/fractions3.js` et `powers.js`, importés PAR CHEMIN) ; le
 * dessin (honnête : le vrai nombre de dents) dans `gearCrank/BikeScene.jsx` et `gearCrank/gearArt.js`. Distinct de `fair-share` (le partage d'un enfant), de
 * `egg-trays` (la division de naturels, le reste), de `fourth-gauges` (la case manquante d'un tableau) et de `code-lockers` (des molettes) : ici la main TOURNE
 * une manivelle, la variable est un nombre de tours mesuré en DENTS, le diviseur est un RAPPORT de deux nombres de dents, la résistance est le drapeau (le
 * dépassement) et le mouvement inverse échange le plateau et le pignon.
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. La main TOURNE la manivelle (glisser autour de l'axe, les tours s'accumulent ; ‹ سنّ › : une dent ; ← → ; Maj = six dents ; Début = le départ). L'aperçu suit le
 *    doigt, le LÂCHER est l'essai (§2octovicies).
 * B. Chaque dent dont avance la pédale fait avancer la chaîne d'un maillon : la pédale tourne de n/F, la roue de n/R. Le drapeau est à des tours de roue donnés,
 *    soit target × R dents ; il faut donc target ÷ (F/R) tours de pédale. Échanger le plateau et le pignon échange le rapport : c'est le مقلوب.
 * C. En مبتدئ les deux compteurs sont lisibles en direct. En متقدم la manivelle est BLOQUÉE jusqu'à la prédiction (une fraction) et les compteurs restent voilés
 *    jusqu'au lâcher : une prédiction fausse est réfutée par SA course.
 * D. Chaque lâcher est un essai (les dents, les tours de pédale et de roue, l'écart au drapeau) ; chaque prédiction aussi.
 * E. À découvrir (مبتدئ, après m2 et m3) : « لماذا احتاجت العجلة 6 دورات إلى 8 دورات للدوّاسة ؟ » — « 6 + 2 » et « 6 × 3/4 » sont réfutés avec SES tâches.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        a ÷ (F/R) = a × (R/F) ; le مقلوب de F/R est R/F, produit 1 ; a/b ÷ c/d = a/b × d/c
 *   OBJECT         la درّاجة du نادي : un plateau de F dents, un pignon de R dents, la chaîne, une roue à valve, un drapeau à la craie, Lina (KidFigure, hijab)
 *   VARIABLE       le nombre de DENTS dont la pédale a avancé (un entier) ; la prédiction écrite (une fraction de tours de pédale) en متقدم
 *   INVARIANT      un tour de pédale ne fait faire à la roue que F/R tour, quelle que soit la distance au drapeau
 *   TRANSFORMATION chaque dent → un maillon ; n dents → n/F tour de pédale et n/R tour de roue
 *   CONSTRAINT     le drapeau tombe sur une dent (target × R entier) ; 12 … 52 dents en libre ; 0 dent refusée
 *   RESISTANCE     le drapeau : un dépassement ou un manque s'écrit en tours de roue ; un plateau sans dents n'entraîne rien ; une prédiction fausse est réfutée
 *   EVIDENCE       les deux compteurs, l'écart, le tampon, la prédiction contre la course
 *   CONTRAST       43/32 contre 3/4 ; plateau et pignon échangés (3/5 ↔ 5/3, 5/7 ↔ 7/5) ; plus de tours de pédale que de roue (m2)
 *   PREDICTION     les tours de pédale écrits AVANT de partir (متقدم)
 *   DISCOVERY      « لماذا احتاجت العجلة 6 دورات إلى 8 دورات للدوّاسة ؟ »
 *   FORMALIZATION  مقلوب 3/4 est 4/3 car 3/4 × 4/3 = 1 ; 6 ÷ 3/4 = 6 × 4/3
 *   TRANSFER       « جرّب أعدادك » (toujours ouvert), les exercices et la banque
 *
 * « جرّب كل الإمكانيات » : NON (chaque lâcher EST l'essai). « جرّب أعدادك » est TOUJOURS ouvert sous le labo.
 * D'UN SEUL REGARD (§8bis) : `[data-gc-glance]` enveloppe la consigne, la scène, les compteurs, les commandes et le verdict.
 * ONBOARDING : `coach` (défaut true) → `LabCoach` ; `logic/gearCrank.js › coachOf` (predict · crank · flag · teeth · free).
 * QUESTIONS PENDANT LE LABO (2026-10-28, PROTOTYPE de `primitives/LabCheckpoint`) : `checkpoints` (défaut true). Après chaque tâche de مبتدئ
 * (m1, m2, m3), une suite de questions se pose PAR-DESSUS le labo et retient « المهمة التالية » (`CHAINS`) : m1 lire · comparer · une dent de
 * pédale ; m2 lire · pourquoi plus · 3/4 de tour · quelle opération ; m3 lire · 3/4 × 4/3 · la règle (l'ancienne découverte, qui formalise).
 * Les événements `{ tk: 'checkpoint' | 'checkpoint-done', id, … }` partent vers `onTrial`. OBLIGATOIRES pour tout élève ; l'ENSEIGNANT seul peut
 * les couper pour SON compte (`useLabCheckpointSettings`, interrupteur dans l'en-tête du labo) ; coupées, la découverte d'avant reprend (sous le labo).
 * Props : `tasks` ([{ id, F, R, target, predict }]), `world` ('ride' | 'reverse'), `level`, `levels`, `coach`, `checkpoints`, `title`, `lead`, `onTrial(event)`, `onFinished({ world })`.
 * CONTRAT DOM : [data-gear-crank][data-task][data-solved][data-layout][data-world], [data-gc-glance], [data-gc-stage], [data-gc-crank], [data-gc-teeth-less], [data-gc-teeth-more],
 * [data-gc-home], [data-gc-pedal][data-value], [data-gc-wheel][data-value], [data-gc-flag], [data-gc-gap], [data-gc-predict], [data-gc-predict-num], [data-gc-predict-den],
 * [data-gc-go], [data-gc-next], [data-gc-verdict], [data-gc-log], [data-gc-free][data-active], [data-gc-free-f], [data-gc-free-r], [data-gc-free-target], [data-gc-formal].
 */
const NS = 'manipulation.gearCrank';
const LRI = '⁦';
const PDI = '⁩';
const iso = (s) => `${LRI}${s}${PDI}`;
const WIDE_MIN = 760;
const SIDE_W = 176;
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-indigo-300';
const SETTLE_MS = 650;
const tex = (txt) => { const [a, b] = String(txt).split('/'); return b ? `\\frac{${a}}{${b}}` : a; };

export function numbersFor({ tasks, world, level }) {
  const lv = resolveLevelId(level ?? 'beginner');
  const asked = LEVELS['gear-crank'][lv].numbers;
  return { tasks: tasks ?? asked.tasks, world: world ?? asked.world ?? 'ride' };
}

export default function GearCrank({
  tasks, world, title, lead, level, levels: withLevels = true, coach: coachOn = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const initialNumbers = useMemo(() => numbersFor({ tasks, world, level }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'gear-crank', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nums = state.numbers;
  const numsKey = JSON.stringify(nums);
  const [lab, setLab] = useState(() => L.init(nums));
  const [scene, setScene] = useState({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: 0 });
  if (scene.key !== numsKey || scene.epoch !== state.epoch) {
    // « إعادة » (resetCount), un autre niveau ou d'autres nombres : TOUT recommence — la tâche 1, les essais et les questions du labo
    setScene({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: scene.inits + 1 });
    setLab(L.init(nums));
  }
  // les questions pendant le labo : la suite de la tâche courante ; celle qui finit par la règle remplace la découverte automatique
  const cur = L.taskOf(lab);
  const cpSettings = useLabCheckpointSettings('gear-crank');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const chain = cpOn && cpSettings.enabled && !L.isFree(lab) ? CHAINS[cur.id] ?? null : null;
  const ruleByCheckpoint = cpOn && cpSettings.enabled && lab.tasks.some((tk) => CHAINS[tk.id]?.includes('rule'));
  const cp = useLabCheckpoint({
    id: chain ? cur.id : null,
    questions: chain ? chain.map((q) => QUESTIONS[q](lab, cur, k)) : null,
    reached: L.taskDone(lab),
    resetKey: scene.inits,
    onRetry: () => setLab(L.restartTask),
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => { if (CHAINS[id]?.includes('rule')) { state.discover(); state.formalize(); } },
  });
  const ready = L.discoveryReady(lab) && !ruleByCheckpoint;
  useEffect(() => { if (ready) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  const finishedOnce = useRef(false);
  const everyDone = L.allDone(lab);
  useEffect(() => {
    if (!everyDone) { finishedOnce.current = false; return; }
    if (!finishedOnce.current) { finishedOnce.current = true; state.report(onFinished, { world: lab.world }); }
  }, [everyDone]); // eslint-disable-line react-hooks/exhaustive-deps
  const reported = useRef(0);
  const nTrials = lab.trials.length;
  useEffect(() => {
    if (nTrials < reported.current) reported.current = 0;
    for (let i = reported.current; i < nTrials; i += 1) state.report(onTrial, { ...lab.trials[i] });
    reported.current = nTrials;
  }, [nTrials, lab.trials]); // eslint-disable-line react-hooks/exhaustive-deps

  const coachStep = coachOn && !cp.open ? L.coachOf(lab) : null;
  const coach = useLabCoach({
    lab: 'gear-crank', step: coachStep,
    text: coachStep ? k(`coach.${coachStep.id}`) : '',
    labels: { hide: k('coach.hide'), show: k('coach.show'), ok: k('coach.ok'), stop: k('coach.stop') },
  });

  const boxRef = useRef(null);
  const [width, setWidth] = useState(640);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => setWidth(Math.max(300, Math.floor(el.clientWidth)));
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const vp = useLessonViewport(true);
  const screenH = vp.ready && vp.height > 0 ? vp.height : 720;

  const discovery = (
    <ManipulationDiscovery state={state} prompt={<MathText>{discoveryPrompt(lab, k)}</MathText>}
      options={discoveryOptions(lab, k)} formal={<Formal lab={lab} k={k} />} />
  );

  return (
    <ManipulationShell
      type="gear-crank"
      title={title ?? k('title')}
      titleHidden
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      coach={coachOn ? coach : null}
      headerAction={cpOn ? cpSettings.control : null}
      guided={!!chain || ruleByCheckpoint}
      hints={[0, 1, 2].map((i) => k(`hints.${i}`))}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      discovery={discovery}
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-sky-50/70 to-white">
        <div ref={boxRef} className="space-y-2" data-gear-crank data-task={lab.ti} data-world={lab.world}
          data-solved={everyDone ? 'true' : 'false'} data-layout={width >= WIDE_MIN ? 'wide' : 'narrow'}>
          <style dangerouslySetInnerHTML={{ __html: SCENE_CSS }} />
          <Lab lab={lab} setLab={setLab} k={k} width={width} screenH={screenH} lead={state.isAuthoredLevel ? lead : null} cp={cp} />
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ══════════════ Les mots : « دورة واحدة / دورتين / n دورات / n دورة » ══════════════ */

/** Une quantité de tours (rationnel `{ n, d }` ou texte « 9/2 ») écrite avec le bon nombre grammatical ; `abs` : la valeur absolue (un écart). */
function turnsWith(k, val, abs = false) {
  let n; let d;
  if (typeof val === 'string') { const [a, b] = val.split('/'); n = BigInt(a); d = BigInt(b ?? 1); } else { n = val.n; d = val.d; }
  if (abs && n < 0n) n = -n;
  if (d === 1n) {
    const v = Number(n);
    if (v === 1) return k('turns.one');
    if (v === 2) return k('turns.two');
    return k(v >= 3 && v <= 10 ? 'turns.few' : 'turns.many', { n: iso(String(v)) });
  }
  return k('turns.many', { n: iso(`${n}/${d}`) });
}

/* ══════════════ Le laboratoire ══════════════ */

function Lab({ lab, setLab, k, width, screenH, lead, cp }) {
  const uid = `gc${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const wide = width >= WIDE_MIN;
  const free = L.isFree(lab);
  const task = L.taskOf(lab);
  const done = L.taskDone(lab);
  const locked = L.locked(lab);
  const swapped = L.swappedFrom(lab);
  const turnsText = useCallback((v, abs) => turnsWith(k, v, abs), [k]);
  const j = L.judge(lab);
  const atFlagNow = lab.settled && lab.settled.atFlag && lab.teeth === lab.settled.teeth;

  /* ── le son (2026-10-28) : un déclic par dent (au plus un toutes les 35 ms, plus grave en arrière), une cloche à chaque tour COMPLET de
     roue, et au lâcher : l'arrivée au drapeau ou le dépassement. Muet sauf « الصوت » (l'interrupteur de l'en-tête du labo). ── */
  const sfx = useRef({ teeth: lab.teeth, at: 0, key: '' });
  const sfxKey = `${free ? 'free' : lab.ti}`;
  useEffect(() => {
    const p = sfx.current;
    if (p.key !== sfxKey) { sfx.current = { teeth: lab.teeth, at: 0, key: sfxKey }; return; }
    const d = lab.teeth - p.teeth;
    if (d === 0) return;
    const now = performance.now();
    if (now - p.at > 35) { playSfx('tooth', { pitch: d > 0 ? 1 : 0.75 }); p.at = now; }
    if (d > 0 && Math.floor(lab.teeth / task.R) > Math.floor(p.teeth / task.R)) playSfx('bell');
    p.teeth = lab.teeth;
  }, [lab.teeth, sfxKey]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!lab.settled) return;
    if (lab.settled.atFlag) playSfx('flag');
    else if (lab.teeth > task.goalTeeth) playSfx('over');
  }, [lab.settled]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── le geste : glisser autour de l'axe, les tours s'accumulent ── */
  const svgRef = useRef(null);
  const dragRef = useRef(null);
  const timer = useRef(null);
  const [fl, setFl] = useState(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const settleSoon = () => { clearTimeout(timer.current); timer.current = setTimeout(() => setLab((s) => L.release(s)), SETTLE_MS); };
  const angleOf = (e) => {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM?.();
    if (!svg || !ctm) return null;
    const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
    const q = p.matrixTransform(ctm.inverse());
    return Math.atan2(q.y - BB.y, q.x - BB.x);
  };
  const canTurn = L.canTurn(lab);
  const down = (e) => {
    if (!canTurn) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    clearTimeout(timer.current);
    dragRef.current = { a: angleOf(e), fl: lab.teeth, F: task.F, max: task.maxTeeth };
    setFl(lab.teeth);
  };
  const move = (e) => {
    const d = dragRef.current;
    if (!d) return;
    const a = angleOf(e);
    if (a == null || d.a == null) { d.a = a; return; }
    let da = a - d.a;
    if (da > Math.PI) da -= 2 * Math.PI;
    if (da < -Math.PI) da += 2 * Math.PI;
    d.a = a;
    d.fl = Math.max(0, Math.min(d.max, d.fl + (da / (2 * Math.PI)) * d.F));
    setFl(d.fl);
    setLab((s) => L.turnTo(s, d.fl));
  };
  const up = () => {
    if (!dragRef.current) return;
    dragRef.current = null;
    setFl(null);
    setLab((s) => L.release(s));
  };
  const key = (e) => {
    if (!canTurn) return;
    const m = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: task.F, PageDown: -task.F };
    if (e.key in m) { e.preventDefault(); setLab((s) => L.stepTeeth(s, m[e.key] * (e.shiftKey && Math.abs(m[e.key]) === 1 ? 6 : 1))); settleSoon(); }
    if (e.key === 'Home') { e.preventDefault(); setLab((s) => L.toStart(s)); settleSoon(); }
  };
  const grabProps = {
    tabIndex: canTurn ? 0 : -1, role: 'slider', 'aria-orientation': 'horizontal', 'aria-valuemin': 0, 'aria-valuemax': task.maxTeeth, 'aria-valuenow': lab.teeth,
    'aria-label': locked ? k('crank.ariaLocked') : k('crank.aria', { n: lab.teeth }), 'aria-disabled': canTurn ? undefined : 'true',
    onPointerDown: down, onPointerMove: move, onPointerUp: up, onPointerCancel: up, onKeyDown: key, style: { touchAction: 'none' },
  };

  /* ── la consigne : le contexte, puis UNE question ── */
  const turnsOfFlag = turnsText(task.target);
  const ctx = free ? k('context.free', { F: iso(task.F), R: iso(task.R), turns: turnsOfFlag })
    : swapped ? k('context.moved', { F: iso(task.F), R: iso(task.R), turns: turnsOfFlag })
      : k('context.ride', { F: iso(task.F), R: iso(task.R), turns: turnsOfFlag });
  const question = free ? k('question.free') : task.predict ? k('question.predict') : k('question.ride');
  // une étape est FAITE quand la roue est au drapeau ET que ses questions (LabCheckpoint) sont répondues : alors la pastille passe au vert et on fête
  const stepDone = lab.tasks.map((_, i) => !!lab.done[i] && (i !== lab.ti || !cp.blocking));
  const steps = lab.tasks.length > 1 && !free && (
    <LabStepper count={lab.tasks.length} current={lab.ti} done={stepDone} stepAttr="data-gc-step" />
  );
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.trials.length === 0 && celebrated.current.size) celebrated.current = new Set();   // L.init (« إعادة », autre niveau) : on refête
  const nowDone = !free && stepDone[lab.ti];
  useEffect(() => {
    if (!nowDone || celebrated.current.has(lab.ti)) return;
    celebrated.current.add(lab.ti);
    party.celebrate({ n: lab.ti + 1, total: lab.tasks.length });
  }, [nowDone, lab.ti]); // eslint-disable-line react-hooks/exhaustive-deps
  const prompt = (
    <PromptCard size="md" context={<MathText>{ctx}</MathText>} contextProps={{ 'data-gc-context': free ? 'free' : swapped ? 'moved' : 'ride' }}
      title={<MathText>{question}</MathText>} titleClassName="text-lg" lamp={free ? null : done ? 'on' : 'off'}
      titleProps={{ 'data-gc-prompt': task.predict ? 'predict' : 'ride', 'data-lit': done ? 'true' : 'false' }}
      aside={steps || undefined} instruction={lead || undefined} />
  );

  /* ── la scène ── */
  const stageW = wide ? width - SIDE_W - 8 : width;
  // une seule vue : le bloc (consigne → verdict) tient dans la hauteur de l'écran − 24 ; la scène prend ce qui reste après le reste (mesuré : ≈ 330 px
  // de consigne, compteurs, commandes, verdict, + 56 pour la prédiction, + 30 pour le journal, + 36 d'écarts).
  const innerH = typeof window !== 'undefined' && window.innerHeight ? window.innerHeight : screenH + 40;
  const hasPredict = lab.tasks.some((tk) => tk.predict) && !free;
  const fixed = 330 + (wide ? 0 : 66) + (hasPredict ? 56 : 0) + (lab.tasks.length > 1 && lab.ti > 0 ? 30 : 0) + (lead ? 28 : 0) + (width < 560 ? (hasPredict ? 95 : 30) : 0);
  const hBudget = Math.max(150, Math.min(340, innerH - 24 - fixed));
  const scale = Math.max(0.62, Math.min(1.4, Math.min(stageW / 440, hBudget / 244)));
  const mood = atFlagNow || done ? 'proud' : lab.settled && j.over && lab.teeth === lab.settled.teeth ? 'wonder' : lab.teeth > 0 ? 'wonder' : 'happy';
  const stage = (
    <StageFrame className="min-w-0 overflow-hidden" data-gc-stage data-at-flag={j.atFlag ? 'true' : 'false'} data-scale={scale.toFixed(2)} data-screen-h={Math.round(screenH)}>
      <BikeScene lab={lab} k={k} uid={uid} width={stageW} scale={scale} fl={fl} mood={mood} grabProps={grabProps} svgRef={svgRef} turnsText={turnsText} />
    </StageFrame>
  );

  /* ── les compteurs ── */
  const veiled = L.veiled(lab);
  const live = L.turnsNow(lab);
  const counters = (
    <div className={`grid gap-2 ${wide ? 'h-full grid-cols-1 grid-rows-2' : 'grid-cols-2'}`} data-gc-counters>
      <Counter kind="pedal" label={k('counter.pedal')} value={live.pedal} veiled={veiled} k={k} />
      <Counter kind="wheel" label={k('counter.wheel')} value={live.wheel} veiled={veiled} k={k} />
    </div>
  );

  const past = !free ? lab.tasks.filter((_, i) => lab.done[i] && i !== lab.ti) : [];
  const log = past.length > 0 && (
    <div className="flex flex-wrap items-center gap-1.5" data-gc-log>
      <span className="text-xs font-extrabold text-slate-600">{k('log.title')}</span>
      {past.map((tk) => (
        <span key={tk.id} data-gc-log-item={tk.id} data-value={ratText(tk.goalPedal)} aria-label={k('log.aria', { F: tk.F, R: tk.R, pedal: ratText(tk.goalPedal) })}
          className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-900">
          {k('log.item', { F: iso(tk.F), R: iso(tk.R), pedal: iso(ratText(tk.goalPedal)) })}
        </span>
      ))}
    </div>
  );

  /* ── les commandes ── */
  const atMax = lab.teeth >= task.maxTeeth;
  const btn = `inline-flex min-h-[44px] min-w-[88px] items-center justify-center gap-1 rounded-2xl border-2 border-indigo-300 bg-white px-3 text-base font-black text-indigo-950 shadow-[0_3px_0_0_#A5B4FC] transition-all duration-150 active:translate-y-0.5 active:shadow-none disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none motion-reduce:transition-none ${ring}`;
  const press = (d) => { setLab((s) => L.stepTeeth(s, d)); settleSoon(); };
  const controls = (
    <LabCard className="space-y-1.5 p-1.5" data-gc-controls>
      {lab.tasks.some((tk) => tk.predict) && !free && (
        <PredictCard lab={lab} setLab={setLab} k={k} />
      )}
      <div className="flex flex-wrap items-center justify-center gap-2" dir="ltr">
        <button type="button" className={btn} onClick={() => press(-1)} disabled={!canTurn || lab.teeth <= 0} aria-label={k('teeth.lessAria')} data-gc-teeth-less>
          <ChevronLeft className="h-5 w-5" aria-hidden="true" /> {k('teeth.less')}
        </button>
        <span className="inline-flex min-h-[44px] min-w-[88px] items-center justify-center rounded-2xl border-2 border-sky-300 bg-sky-50 px-3 text-lg font-black tabular-nums text-sky-950" data-gc-teeth
          aria-label={veiled ? k('counter.veiledAria') : k('teeth.countAria', { n: lab.teeth })}>
          <bdi dir="rtl">{veiled ? k('teeth.veiled') : k('teeth.count', { n: iso(lab.teeth) })}</bdi>
        </span>
        <button type="button" className={btn} onClick={() => press(1)} disabled={!canTurn || atMax} aria-label={k('teeth.moreAria')} data-gc-teeth-more>
          {k('teeth.more')} <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
        <button type="button" className={`${btn} min-w-[44px] px-3 text-sm`} onClick={() => { setLab((s) => L.toStart(s)); settleSoon(); }} disabled={!canTurn || lab.teeth === 0}
          aria-label={k('teeth.homeAria')} data-gc-home>
          <RotateCcw className="h-4 w-4" aria-hidden="true" /> {width >= 600 && <span dir="rtl">{k('teeth.home')}</span>}
        </button>
      </div>
    </LabCard>
  );

  /* ── le verdict ── */
  const vv = verdictOf(lab, k, turnsText);
  const canNext = L.canNext(lab) && !cp.blocking;
  const Icon = vv.tone === 'emerald' ? CheckCircle2 : vv.tone === 'indigo' ? Hand : Sparkles;
  const banner = (
    <VerdictBanner tone={vv.tone} icon={wide ? Icon : null} size="sm" className="min-h-[2.75rem] !py-1.5" data-gc-verdict={vv.code}>
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
        <p className={vv.tone === 'indigo' ? 'font-bold text-indigo-900' : ''}>{vv.text}</p>
        {canNext && (
          <button type="button" onClick={() => setLab(L.nextTask)} data-gc-next
            className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-2 border-emerald-600 bg-emerald-600 px-3.5 text-sm font-black text-white shadow-[0_3px_0_0_#047857] transition-all duration-150 active:translate-y-0.5 motion-reduce:transition-none ${ring}`}>
            {k('next')} <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </VerdictBanner>
  );

  return (
    <>
      <div className="relative space-y-2" data-gc-glance>
        {party.node}
        {cp.node}
        {prompt}
        {wide ? (
          <div className="flex items-stretch gap-2">
            <div className="min-w-0 flex-1">{stage}</div>
            <div className="shrink-0" style={{ width: SIDE_W }}>{counters}</div>
          </div>
        ) : (
          <>{stage}{counters}</>
        )}
        {log}
        {controls}
        {banner}
      </div>
      <FreeCard lab={lab} setLab={setLab} k={k} />
    </>
  );
}

/* ══════════════ Les deux compteurs ══════════════ */

const TONES = {
  pedal: { box: 'border-amber-300 bg-amber-50', title: 'text-amber-900', num: 'text-amber-950', bar: 'bg-amber-600' },
  wheel: { box: 'border-teal-300 bg-teal-50', title: 'text-teal-900', num: 'text-teal-950', bar: 'bg-teal-600' },
};

function Counter({ kind, label, value, veiled, k }) {
  const T = TONES[kind];
  const txt = ratText(value);
  const frac = value.d !== 1n;
  return (
    <div className={`flex min-h-[56px] items-center justify-between gap-2 rounded-2xl border-2 px-3 py-1 ${T.box}`} {...{ [`data-gc-${kind}`]: '' }} data-value={veiled ? '' : txt} data-veiled={veiled ? 'true' : 'false'}
      role="group" aria-label={veiled ? k('counter.veiledAria') : k(`counter.${kind}Aria`, { v: iso(txt) })}>
      <p className={`text-sm font-black ${T.title}`}>{label}</p>
      <div key={veiled ? 'v' : txt} className={`gc-pop flex min-h-[40px] items-center justify-center ${T.num}`} dir="ltr">
        {veiled ? <span className="text-3xl font-black">{k('counter.veiled')}</span>
          : frac ? (
            <span className="inline-flex flex-col items-center text-xl font-black leading-none tabular-nums">
              <span>{String(value.n)}</span>
              <span className={`my-[3px] h-[3px] w-full min-w-[26px] rounded-full ${T.bar}`} />
              <span>{String(value.d)}</span>
            </span>
          ) : <span className="text-3xl font-black tabular-nums">{String(value.n)}</span>}
      </div>
    </div>
  );
}

/* ══════════════ La prédiction (متقدم) ══════════════ */

function PredictCard({ lab, setLab, k }) {
  const task = L.taskOf(lab);
  if (!task.predict) return null;
  const locked = L.locked(lab);
  const can = L.canPredict(lab);
  const onKey = (e) => { if (e.key === 'Enter' && can) setLab(L.submitPrediction); };
  const field = 'h-10 w-[68px] rounded-xl border-2 border-indigo-300 bg-white px-2 text-center text-xl font-black tabular-nums text-indigo-950 disabled:bg-slate-100 outline-none focus-visible:ring-4 focus-visible:ring-indigo-300';
  if (!locked) {
    return (
      <div className="flex items-center gap-2 rounded-2xl bg-indigo-50 px-3 py-1 text-sm font-extrabold text-indigo-950" data-gc-predict data-sent="true" data-ok={lab.pred?.ok ? 'true' : 'false'}>
        <span>{k('predict.sent', { v: iso(lab.pred.value) })}</span>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-2xl bg-indigo-50 px-3 py-1.5" data-gc-predict data-sent="false">
      <p className="text-xs font-black text-indigo-950">{k('predict.title')}</p>
      <div className="flex items-center gap-2" dir="ltr">
        <input type="text" inputMode="numeric" autoComplete="off" dir="ltr" maxLength={L.PRED_DIGITS} value={lab.predNum} onChange={(e) => setLab((s) => L.setPredNum(s, e.target.value))}
          onKeyDown={onKey} aria-label={k('predict.num')} data-gc-predict-num className={field} />
        <span className="text-2xl font-black text-indigo-900" aria-hidden="true">/</span>
        <input type="text" inputMode="numeric" autoComplete="off" dir="ltr" maxLength={L.PRED_DIGITS} value={lab.predDen} onChange={(e) => setLab((s) => L.setPredDen(s, e.target.value))}
          onKeyDown={onKey} aria-label={k('predict.den')} data-gc-predict-den className={field} />
        <button type="button" onClick={() => setLab(L.submitPrediction)} disabled={!can} data-gc-go
          className={`inline-flex min-h-[44px] items-center justify-center gap-2 whitespace-nowrap rounded-2xl border-2 border-sky-600 bg-sky-500 px-4 text-base font-black text-white shadow-[0_3px_0_0_#0369A1] transition-all duration-150 active:translate-y-0.5 disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none motion-reduce:transition-none ${ring}`}>
          <Send className="h-5 w-5 -scale-x-100" aria-hidden="true" /> <span dir="rtl">{k('predict.go')}</span>
        </button>
      </div>
    </div>
  );
}

/* ══════════════ Le verdict ══════════════ */

function verdictOf(lab, k, turnsText) {
  const task = L.taskOf(lab);
  const st = lab.settled;
  const j = L.judge(lab);
  const here = st && lab.teeth === st.teeth;
  if (L.isFree(lab)) {
    if (here && j.atFlag) return { text: k('v.freeFlag'), tone: 'emerald', code: 'free' };
    return { text: k('idle.free'), tone: 'indigo', code: '' };
  }
  if (L.taskDone(lab)) {
    if (lab.pred && !lab.pred.ok) return { text: k('v.refuted', { guess: turnsText(lab.pred.value), need: turnsText(task.goalPedal) }), tone: 'amber', code: 'refuted' };
    return { text: lab.pred ? k('v.okPredict') : k('v.ok'), tone: 'emerald', code: 'ok' };
  }
  if (L.locked(lab)) return { text: k('idle.predict'), tone: 'indigo', code: '' };
  if (here && !j.atFlag) return j.over ? { text: k('v.over'), tone: 'rose', code: 'over' } : { text: k('v.short'), tone: 'amber', code: 'short' };
  return { text: lab.pred ? k('idle.ready') : k('idle.ride'), tone: 'indigo', code: '' };
}

/* ══════════════ « جرّب أعدادك » : toujours ouvert ══════════════ */

function FreeCard({ lab, setLab, k }) {
  const free = L.isFree(lab);
  const task = L.taskOf(lab);
  const [f, setF] = useState(String(task.F));
  const [r, setR] = useState(String(task.R));
  const [tg, setTg] = useState(task.targetText);
  const base = free ? null : task.id;
  useEffect(() => {
    if (!free) { setF(String(task.F)); setR(String(task.R)); setTg(task.targetText); }
  }, [base, free]); // eslint-disable-line react-hooks/exhaustive-deps
  const verdict = L.validateFree(f, r, tg);
  const empty = f === '' || r === '' || tg === '';
  const apply = (nf, nr, nt) => {
    const v = L.validateFree(nf, nr, nt);
    if (v.ok) setLab((s) => L.setFree(s, v.cfg));
  };
  const field = (setter, which) => (e) => {
    const raw = L.latin(e.target.value).replace(/[^0-9/.,]/g, '').slice(0, which === 't' ? 7 : 2);
    setter(raw);
    const next = { f, r, t: tg, [which]: raw };
    apply(next.f, next.r, next.t);
  };
  const msg = !verdict.ok && !empty ? (
    verdict.why === 'noTeeth' ? k(verdict.which === 'front' ? 'free.noTeethFront' : 'free.noTeethRear')
      : verdict.why === 'between' ? k('free.between', { product: iso(verdict.product) })
        : verdict.why === 'target' ? k('free.target') : k('free.range')
  ) : '';
  const badF = !verdict.ok && !empty && (verdict.why === 'range' || (verdict.why === 'noTeeth' && verdict.which === 'front'));
  const badR = !verdict.ok && !empty && (verdict.why === 'range' || (verdict.why === 'noTeeth' && verdict.which === 'rear'));
  const badT = !verdict.ok && !empty && (verdict.why === 'target' || verdict.why === 'between');
  const box = (bad) => `h-11 rounded-xl border-2 ${bad ? 'border-rose-300' : 'border-emerald-300'} bg-white px-2 text-center text-xl font-black tabular-nums text-indigo-950 ${ring}`;
  return (
    <LabCard className="space-y-2 border-emerald-200 bg-emerald-50/50 p-3" data-gc-free data-active={free ? 'true' : 'false'}>
      <p className="flex items-center gap-1.5 text-sm font-black text-emerald-900"><FlaskConical className="h-4 w-4" aria-hidden="true" /> {k('free.title')}</p>
      <p className="text-xs font-bold leading-snug text-slate-600">{free ? k('free.on') : k('free.hint')}</p>
      <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
        <label className="flex flex-col gap-1 text-xs font-black text-indigo-950">
          {k('free.front')}
          <input type="text" inputMode="numeric" autoComplete="off" dir="ltr" value={f} onChange={field(setF, 'f')} aria-label={k('free.frontAria')} aria-invalid={badF}
            data-gc-free-f className={`${box(badF)} w-20`} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-black text-indigo-950">
          {k('free.rear')}
          <input type="text" inputMode="numeric" autoComplete="off" dir="ltr" value={r} onChange={field(setR, 'r')} aria-label={k('free.rearAria')} aria-invalid={badR}
            data-gc-free-r className={`${box(badR)} w-20`} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-black text-indigo-950">
          {k('free.flag')}
          <input type="text" inputMode="text" autoComplete="off" dir="ltr" value={tg} onChange={field(setTg, 't')} aria-label={k('free.flagAria')} aria-invalid={badT}
            data-gc-free-target className={`${box(badT)} w-28`} />
        </label>
        {free && (
          <button type="button" onClick={() => setLab(L.toGuided)} data-gc-free-back
            className={`inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-emerald-200 bg-white px-3 text-xs font-bold text-emerald-900 ${ring}`}>
            <Undo2 className="h-4 w-4" aria-hidden="true" /> {k('free.back')}
          </button>
        )}
      </div>
      {msg && <p role="alert" className="text-sm font-bold text-rose-700" data-gc-free-refusal={verdict.why}>{msg}</p>}
    </LabCard>
  );
}

/* ══════════════ La découverte et la règle ══════════════ */

function discoveryPrompt(lab, k) {
  const w = L.witnesses(lab);
  const big = w.bigger ?? lab.tasks[1] ?? lab.tasks[0];
  return k('discovery.prompt', { wheel: turnsWith(k, big.target), pedal: turnsWith(k, big.goalPedal) });
}

export function discoveryOptions(lab, k) {
  const w = L.witnesses(lab);
  const big = w.bigger ?? lab.tasks[1] ?? lab.tasks[0];
  const first = w.first && w.first.id !== big.id ? w.first : lab.tasks.find((t) => t.id !== big.id) ?? lab.tasks[0];
  const f = L.formalOf(big);
  const gap = sub(big.goalPedal, big.target);
  const plusOfFirst = add(first.target, gap);
  const mirror = tex(f.mirror);
  return [
    {
      text: <MathText>{k('discovery.plus', { calc: `$${tex(f.target)}+${tex(ratText(gap))}=${tex(f.answer)}$` })}</MathText>,
      why: <MathText>{k('discovery.wherePlus', { wheel: turnsWith(k, first.target), pedal: turnsWith(k, first.goalPedal), plus: turnsWith(k, plusOfFirst) })}</MathText>,
    },
    { text: <MathText>{k('discovery.right', { m: `$${mirror}$`, calc: `$${tex(f.target)}\\times${mirror}=${tex(f.answer)}$` })}</MathText>, correct: true },
    {
      text: <MathText>{k('discovery.times', { calc: `$${tex(f.target)}\\times${tex(f.ratio)}=${tex(f.answer)}$` })}</MathText>,
      why: <MathText>{k('discovery.whyTimes', { calc: `$${tex(f.target)}\\times${tex(f.ratio)}=${tex(f.wrong)}$`, turns: turnsWith(k, f.wrong), need: turnsWith(k, f.answer) })}</MathText>,
    },
  ];
}

export function Formal({ lab, k }) {
  const w = L.witnesses(lab);
  const big = w.bigger ?? lab.tasks[1] ?? lab.tasks[0];
  const f = L.formalOf(big);
  const ratio = tex(f.ratio); const mirror = tex(f.mirror);
  return (
    <div className="space-y-2 text-sm font-bold text-emerald-950" data-gc-formal>
      <p><MathText>{k('formal.mirror', { a: `$${ratio}$`, b: `$${mirror}$`, prod: `$${ratio}\\times${mirror}=1$` })}</MathText></p>
      <p><MathText>{k('formal.divide', { x: `$${tex(f.target)}$`, a: `$${ratio}$`, calc: `$${tex(f.target)}\\div${ratio}=${tex(f.target)}\\times${mirror}=${tex(f.answer)}$` })}</MathText></p>
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite de questions de chaque tâche de مبتدئ : elle interroge ce que l'élève vient de FAIRE, et mène à la règle. */
export const CHAINS = Object.freeze({
  m1: ['read', 'compare', 'perTurn'],
  m2: ['read', 'why', 'perTurn', 'operation'],
  m3: ['read', 'product', 'rule'],
  // le monde `reverse` (module 2, 2026-10-28 lot 5) : la chaîne est déplacée, le plateau devient le pignon — 3/5 puis 5/3 de tour de pédale
  r1: ['read', 'compare', 'perTurn'],
  r2: ['read', 'swap', 'product'],
  // متقدم : la prédiction a déjà été écrite ; on interroge le rapport, la comparaison et l'opération, puis la chaîne déplacée et la règle
  a1: ['perTurn', 'operation'],
  a2: ['compare', 'operation'],
  a3: ['perTurn', 'product'],
  a4a: ['compare', 'perTurn'],
  a4b: ['swap', 'product', 'rule'],
});

const $ = (s) => `$${s}$`;
const Mx = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;

/** Chaque question est construite sur LES nombres de la tâche (rien n'est écrit en dur) ; `k` : les textes de `gearCrank`. */
export const QUESTIONS = {
  read: (lab, task, k) => {
    const f = L.formalOf(task);
    return {
      id: 'read', kind: 'number', expected: f.answer, answer: <MathText>{$(tex(f.answer))}</MathText>,
      prompt: Mx(k, 'read.prompt'), hints: [Mx(k, 'read.hint1'), Mx(k, 'read.hint2')],
      explain: Mx(k, 'read.explain', { pedal: turnsWith(k, task.goalPedal), wheel: turnsWith(k, task.target) }),
    };
  },
  compare: (lab, task, k) => {
    const d = sub(task.goalPedal, task.target);
    const right = d.n < 0n ? 0 : d.n > 0n ? 1 : 2;
    const p = $(tex(ratText(task.goalPedal)));
    return {
      id: 'compare', kind: 'choice',
      prompt: Mx(k, 'compare.prompt', { pedal: turnsWith(k, task.goalPedal), wheel: turnsWith(k, task.target) }),
      options: ['less', 'more', 'same'].map((o, i) => ({ text: Mx(k, `compare.${o}`), correct: i === right })),
      hints: [
        Mx(k, 'compare.hint1', { p, w: $(tex(task.targetText)) }),
        right === 0 ? Mx(k, 'compare.hint2', { p, up: $(String(task.goalPedal.n / task.goalPedal.d + 1n)) }) : Mx(k, 'compare.hint2More', { p, w: $(tex(task.targetText)) }),
      ],
      explain: Mx(k, right === 0 ? 'compare.explainLess' : 'compare.explainMore'),
    };
  },
  perTurn: (lab, task, k) => {
    const f = L.formalOf(task);
    const nums = { F: iso(task.F), R: iso(task.R) };
    return {
      id: 'perTurn', kind: 'choice', cols: 3,
      prompt: Mx(k, 'perTurn.prompt'),
      options: [
        { text: <MathText>{$(tex(f.mirror))}</MathText>, why: Mx(k, 'perTurn.whyMirror', nums) },
        { text: <MathText>{$(tex(f.ratio))}</MathText>, correct: true },
        { text: <MathText>{$('1')}</MathText>, why: Mx(k, 'perTurn.whyOne', nums) },
      ],
      hints: [Mx(k, 'perTurn.hint1', nums), Mx(k, 'perTurn.hint2', { frac: $(`\\frac{${task.F}}{${task.R}}`) })],
      explain: Mx(k, 'perTurn.explain', { calc: $(`\\frac{${task.F}}{${task.R}}=${tex(f.ratio)}`), turns: turnsWith(k, f.ratio) }),
    };
  },
  why: (lab, task, k) => {
    const nums = { F: iso(task.F), R: iso(task.R) };
    return {
      id: 'why', kind: 'choice',
      prompt: Mx(k, 'why.prompt'),
      options: [
        { text: Mx(k, 'why.bigger'), why: Mx(k, 'why.whyBigger', nums) },
        { text: Mx(k, 'why.slip'), why: Mx(k, 'why.whySlip') },
        { text: Mx(k, 'why.right', nums), correct: true },
      ],
      hints: [Mx(k, 'why.hint1'), Mx(k, 'why.hint2', nums)],
      explain: Mx(k, 'why.explain', nums),
    };
  },
  operation: (lab, task, k) => {
    const f = L.formalOf(task);
    const t = tex(f.target); const r = tex(f.ratio);
    const gap = ratText(sub(task.goalPedal, task.target));
    const target = turnsWith(k, task.target);
    return {
      id: 'operation', kind: 'choice', cols: 3,
      prompt: Mx(k, 'operation.prompt', { ratio: $(r), target, pedal: $(tex(f.answer)) }),
      options: [
        { text: <MathText>{$(`${t}\\times${r}`)}</MathText>, why: Mx(k, 'operation.whyTimes', { calc: $(`${t}\\times${r}=${tex(f.wrong)}`), target }) },
        { text: <MathText>{$(`${t}+${tex(gap)}`)}</MathText>, why: Mx(k, 'operation.whyPlus', { gap: $(tex(gap)) }) },
        { text: <MathText>{$(`${t}\\div${r}`)}</MathText>, correct: true },
      ],
      hints: [Mx(k, 'operation.hint1', { ratio: $(r), target }), Mx(k, 'operation.hint2')],
      explain: Mx(k, 'operation.explain', { calc: $(`${t}\\div${r}=${tex(f.answer)}`) }),
    };
  },
  swap: (lab, task, k) => {
    const prev = L.swappedFrom(lab) ?? lab.tasks[Math.max(0, lab.ti - 1)];
    const before = turnsWith(k, prev.goalPedal);
    const after = turnsWith(k, task.goalPedal);
    const o = { F: iso(task.F), R: iso(task.R), before, after, wheel: turnsWith(k, task.target), half: turnsWith(k, mul(prev.goalPedal, rat(1n, 2n))), teeth: iso(task.goalTeeth) };
    return {
      id: 'swap', kind: 'choice',
      prompt: Mx(k, 'swap.prompt', o),
      options: [
        { text: Mx(k, 'swap.right', o), correct: true },
        { text: Mx(k, 'swap.same', o), why: Mx(k, 'swap.whySame', o) },
        { text: Mx(k, 'swap.half', o), why: Mx(k, 'swap.whyHalf') },
      ],
      hints: [Mx(k, 'swap.hint1'), Mx(k, 'swap.hint2', o)],
      explain: Mx(k, 'swap.explain', o),
    };
  },
  product: (lab, task, k) => {
    const f = L.formalOf(task);
    const [a, b = '1'] = f.ratio.split('/'); const [c, d = '1'] = f.mirror.split('/');
    const r = tex(f.ratio); const m = tex(f.mirror);
    return {
      id: 'product', kind: 'number', expected: '1', answer: <MathText>{$('1')}</MathText>,
      prompt: Mx(k, 'product.prompt', { ratio: $(r), mirror: $(m), calc: $(`${r}\\times${m}`) }),
      hints: [Mx(k, 'product.hint1'), Mx(k, 'product.hint2', { calc: $(`${r}\\times${m}=\\frac{${a}\\times${c}}{${b}\\times${d}}`) })],
      explain: Mx(k, 'product.explain', { calc: $(`${r}\\times${m}=1`), ratio: $(r), mirror: $(m), one: $('1') }),
    };
  },
  rule: (lab, task, k) => {
    const w = L.witnesses(lab);
    const big = w.bigger ?? lab.tasks[1] ?? lab.tasks[0];
    const f = L.formalOf(big);
    return {
      id: 'rule', kind: 'choice',
      prompt: <MathText>{discoveryPrompt(lab, k)}</MathText>,
      options: discoveryOptions(lab, k),
      hints: [Mx(k, 'rule.hint1', { mirror: $(tex(f.mirror)), target: turnsWith(k, big.target) }), Mx(k, 'rule.hint2', { n: iso(big.targetText) })],
      explain: <Formal lab={lab} k={k} />,
    };
  },
};
