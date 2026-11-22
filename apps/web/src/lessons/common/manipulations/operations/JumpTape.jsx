import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Hand, CheckCircle2, Sparkles, ChevronLeft, FlaskConical, Undo2, Minus, Plus, Lock } from 'lucide-react';
import { resolveLevelId } from '@smarter-academy/core/curriculum/manipulationLevels.js';
import * as H from '@smarter-academy/core/arithmetic/halfLine.js';
import MathText from '../../components/MathText';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import { LabCard, StageFrame, PromptCard, VerdictBanner } from '../primitives/LabKit';
import { SvgPill } from '../primitives/SvgPill';
import { useLabCoach } from '../primitives/LabCoach';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import { W, H as SH, TY, TH, POLE, COL, Backdrop, TapeBand, Tick, Flag, Footprint, Cursor, Jumper } from './jumpTape/art';
import { LEVELS } from '../levels';
import * as L from '../logic/jumpTape';

/**
 * jump-tape — L'UNITÉ ET LE DRAPEAU SOUS LA MAIN (1AM, unité 1, درس « الأعداد العشرية ونصف المستقيم المدرّج », 2026-10-30).
 * La logique, exacte, est dans `logic/jumpTape.js` (sur `packages/core/arithmetic/halfLine.js`, importé par chemin).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. مبتدئ : la main ÉTIRE la marque « 1 » (l'unité de longueur), puis PLANTE un drapeau par saut ; متقدم : la main promène un CURSEUR de lecture de graduation en graduation.
 * B. L'abscisse est une SORTIE du ruban : la fenêtre lit « A(2,4) » à la volée ; une lecture est une unité entière + des petites graduations de 1/10.
 * C. La résistance : une unité trop longue sort la marque de la fosse, trop courte tasse les graduations ; un drapeau est refusé par l'empreinte ; une lecture exacte est refusée entre deux graduations.
 * D. La phase formelle écrit ce que l'élève a trouvé avec SES nombres (la dernière question du labo, la règle).
 * E. Les fausses réponses sont rendues VISIBLES : l'empreinte du saut à sa vraie place, l'écart hachuré entre le curseur et le drapeau.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        graduer un demi-droite (origine + unité + dix parties égales), l'abscisse d'un point (lue exactement ou par un encadrement) et le marquage d'une abscisse décimale connue
 *   OBJECT         une fosse de saut en longueur, un ruban de mesure jaune, des drapeaux, l'empreinte d'une athlète
 *   VARIABLE       l'unité de longueur étirée (مبتدئ), puis la position d'un drapeau (graduation) ; متقدم : la graduation du curseur de lecture
 *   INVARIANT      les distances des sauts ; l'origine O ; dix graduations par grande marque
 *   TRANSFORMATION l'unité change tout le ruban ; une grande marque vaut 1 ou 0,1 ; le ruban peut perdre son origine
 *   CONSTRAINT     le plus long saut doit tenir dans la fosse ; les graduations restent distinctes ; un drapeau tombe sur une petite graduation
 *   RESISTANCE     l'unité refusée par le dessin ; l'empreinte ; l'écart hachuré ; jamais la bonne graduation nommée
 *   EVIDENCE       la lecture « A(2,4) » du drapeau, l'empreinte à sa place, la graduation sous le curseur
 *   PREDICTION     la fenêtre ne montre que O : l'élève choisit lui-même l'unité avant de planter
 *   FORMALIZATION  « نتقدّم وحدتين ثمّ 4 تدريجات صغيرة » ; « حصر بين تدريجتين »
 *   TRANSFER       « جرّب أعدادك » (toujours ouvert), les exercices et la banque
 *
 * ONBOARDING : `coach` (défaut true) → `LabCoach` ; `logic › coachOf`. QUESTIONS PENDANT LE LABO (`LabCheckpoint`) : `CHAINS` + `QUESTIONS`, après CHAQUE étape (l'unité `<id>u`, puis la tâche), avec SES nombres.
 * ÉTAPES : `LabStepper` (`[data-jt-step=<i>]`) + la fête. « إعادة » : tâche 1.
 * Props : `tasks`, `level`, `levels`, `coach`, `title`, `lead`, `onTrial(event)`, `onFinished({})`.
 *
 * CONTRAT DOM : [data-jump-tape][data-level][data-task][data-solved], [data-jt-glance], [data-jt-stage], [data-jt-svg], [data-jt-knob][role=slider], [data-jt-unit][data-u][data-locked], [data-jt-tick=<value>],
 * [data-jt-mark=<value>], [data-jt-flag=<id>][data-state=right|wrong|held][data-at], [data-jt-tray], [data-jt-card=<id>][data-planted], [data-jt-print=<id>], [data-jt-refused=long|short], [data-jt-cursor][data-at],
 * [data-jt-chip=<id>], [data-jt-answers], [data-jt-exact], [data-jt-bounds], [data-jt-reading=<id>], [data-jt-gap], [data-jt-lock], [data-jt-less], [data-jt-more], [data-jt-verdict], [data-jt-next], [data-jt-step=<i>],
 * [data-jt-free], [data-jt-free-input], [data-jt-free-back], [data-jt-formal], [data-jt-kid][data-mood].
 */
const NS = 'manipulation.jumpTape';
const LRI = '⁦';
const PDI = '⁩';
const iso = (s) => `${LRI}${s}${PDI}`;
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-indigo-300';
const val = (m) => H.text(m);
const writ = (s) => String(s).replace(/\+/g, ' + ');

const CSS = `
@keyframes jt-pop { 0% { transform: scale(0.85); } 70% { transform: scale(1.06); } 100% { transform: scale(1); } }
.jt-pop { animation: jt-pop 240ms ease-out both; display: inline-block; }
@keyframes jt-tick { 0% { opacity: 0; transform: scaleY(0.2); } 100% { opacity: 1; transform: scaleY(1); } }
.jt-tick { animation: jt-tick 260ms ease-out both; transform-box: fill-box; transform-origin: top; }
@keyframes jt-ghost { 0%,100% { opacity: .55; } 50% { opacity: .95; } }
.jt-ghost { animation: jt-ghost 1.6s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .jt-pop, .jt-tick, .jt-ghost { animation: none !important; } }
`;

export function numbersFor({ tasks, level }) {
  const lv = resolveLevelId(level ?? 'beginner');
  const asked = LEVELS['jump-tape'][lv].numbers;
  return { tasks: tasks ?? asked.tasks };
}

export default function JumpTape({
  tasks, title, lead, level, levels: withLevels = true, coach: coachOn = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const initialNumbers = useMemo(() => numbersFor({ tasks, level }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'jump-tape', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nums = state.numbers;
  const numsKey = JSON.stringify(nums);
  const [lab, setLab] = useState(() => L.init(nums));
  const [scene, setScene] = useState({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: 0 });
  if (scene.key !== numsKey || scene.epoch !== state.epoch) {
    // « إعادة » (resetCount), un autre niveau ou d'autres nombres : TOUT recommence — la tâche 1, l'unité, les essais et les questions du labo
    setScene({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: scene.inits + 1 });
    setLab(L.init(nums));
  }
  const cur = L.taskOf(lab);
  const advanced = L.isAdvanced(lab);
  const cpSettings = useLabCheckpointSettings('jump-tape');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  // l'étape « unité » d'une tâche à unité libre pose ses propres questions (id `<tâche>u`), dès que l'unité est verrouillée et avant le premier drapeau
  const unitStage = cur.kind === 'plant' && cur.free && L.unitLocked(lab) && L.plantedCount(lab) === 0 && !L.taskDone(lab) && !!CHAINS[`${cur.id}u`];
  const cpId = unitStage ? `${cur.id}u` : cur.id;
  const reachedNow = unitStage || L.taskDone(lab);
  const chain = cpOn && cpSettings.enabled && !L.isFree(lab) ? CHAINS[cpId] ?? null : null;
  const isRule = (q) => q === 'ruleA' || q === 'ruleB';
  const ruleByCheckpoint = cpOn && cpSettings.enabled && lab.tasks.some((tk) => CHAINS[tk.id]?.some(isRule));
  const cp = useLabCheckpoint({
    id: chain ? cpId : null,
    questions: chain && reachedNow ? chain.map((q) => QUESTIONS[q](lab, cur, k)) : null,
    reached: reachedNow,
    resetKey: scene.inits,
    onRetry: () => setLab(L.retryTask),
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => { if (CHAINS[id]?.some(isRule)) { state.discover(); state.formalize(); } },
  });
  const ready = L.discoveryReady(lab) && !ruleByCheckpoint;
  useEffect(() => { if (ready) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  const finished = ruleByCheckpoint ? lab.tasks.every((_, i) => !!lab.done[i]) : ready;
  const finishedOnce = useRef(false);
  useEffect(() => {
    if (!finished) { finishedOnce.current = false; return; }
    if (!finishedOnce.current) { finishedOnce.current = true; state.report(onFinished, {}); }
  }, [finished]); // eslint-disable-line react-hooks/exhaustive-deps
  const reported = useRef(0);
  const nTrials = lab.trials.length;
  useEffect(() => {
    if (nTrials < reported.current) reported.current = 0;
    for (let i = reported.current; i < nTrials; i += 1) state.report(onTrial, L.trialEvidence(lab.trials[i]));
    reported.current = nTrials;
  }, [nTrials, lab.trials]); // eslint-disable-line react-hooks/exhaustive-deps

  const coachStep = coachOn && !cp.open ? L.coachOf(lab) : null;
  const coach = useLabCoach({
    lab: 'jump-tape', step: coachStep,
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

  const discovery = (
    <ManipulationDiscovery state={state} prompt={<MathText>{k(`discovery.${advanced ? 'both' : 'rule'}.prompt`)}</MathText>} options={ruleOptions(lab, k, advanced)} formal={<Formal lab={lab} k={k} advanced={advanced} />} />
  );

  return (
    <ManipulationShell
      type="jump-tape"
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
        <div ref={boxRef} className="space-y-2" data-jump-tape data-level={advanced ? 'advanced' : 'beginner'} data-task={lab.free ? 'free' : cur.id}
          data-solved={finished ? 'true' : 'false'}>
          <style dangerouslySetInnerHTML={{ __html: CSS }} />
          <Lab lab={lab} setLab={setLab} k={k} width={width} lead={state.isAuthoredLevel ? lead : null} cp={cp} advanced={advanced} />
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ══════════════ Le laboratoire ══════════════ */

const tOr = (k, key, fallback) => k(key, { defaultValue: k(fallback) });

function Lab({ lab, setLab, k, width, lead, cp, advanced }) {
  const task = L.taskOf(lab);
  const free = L.isFree(lab);
  const done = L.taskDone(lab);
  const lit = !free && done;
  const last = lab.last;
  const svgRef = useRef(null);
  const [armed, setArmed] = useState(null);
  useEffect(() => { setArmed(null); }, [lab.ti, lab.phase, lab.free]);

  const kind = task.kind;
  const ctx = free ? k('ctx.free') : (lead && lab.ti === 0 ? lead : tOr(k, `ctx.${task.id}`, `ctx.default_${kind}`));
  const question = free ? k('q.free') : tOr(k, `q.${task.id}`, `q.default_${kind}`);

  const stepDone = lab.tasks.map((_, i) => !!lab.done[i] && (i !== lab.ti || !cp.blocking));
  const steps = lab.tasks.length > 1 && !free && <LabStepper count={lab.tasks.length} current={lab.ti} done={stepDone} stepAttr="data-jt-step" />;
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.trials.length === 0 && celebrated.current.size) celebrated.current = new Set();
  const nowDone = !free && stepDone[lab.ti];
  useEffect(() => {
    if (!nowDone || celebrated.current.has(lab.ti)) return;
    celebrated.current.add(lab.ti);
    party.celebrate({ n: lab.ti + 1, total: lab.tasks.length });
  }, [nowDone, lab.ti]); // eslint-disable-line react-hooks/exhaustive-deps

  // le son (muet sauf « الصوت ») : un déclic quand l'unité ou le curseur change, un petit drapeau quand c'est juste, « over » sur un refus, la cloche à la fin
  const sfx = useRef({ u: lab.u, c: lab.cursor });
  useEffect(() => {
    const was = sfx.current;
    if (lab.u !== was.u || lab.cursor !== was.c) playSfx('gesture', { pitch: lab.u > was.u || lab.cursor > was.c ? 1 : 0.75 });
    sfx.current = { u: lab.u, c: lab.cursor };
  }, [lab.u, lab.cursor]);
  const nTrials = lab.trials.length;
  useEffect(() => {
    if (!nTrials) return;
    const tr = lab.trials[nTrials - 1];
    if (tr.free) return;
    playSfx(tr.ok ? 'flag' : 'over');
  }, [nTrials]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (done && !free) playSfx('bell'); }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  const prompt = (
    <PromptCard size={width >= 600 ? 'lg' : 'md'} aside={steps || null} context={<MathText>{ctx}</MathText>} contextProps={{ 'data-jt-context': free ? 'free' : task.id }}
      title={<MathText>{question}</MathText>} titleClassName={width >= 600 ? 'text-lg' : 'text-base'} lamp={free ? null : lit ? 'on' : 'off'}
      titleProps={{ 'data-jt-prompt': free ? 'free' : task.id, 'data-lit': lit ? 'true' : 'false' }} />
  );

  /* ── le verdict : la CONSÉQUENCE avec les nombres de l'élève, jamais la bonne graduation ── */
  const nameOf = (id) => k(`name.${id}`);
  const verdictLine = (() => {
    if (!last) return k(`idle.${free ? 'open' : lab.phase === 'done' ? 'open' : lab.phase === 'read' ? 'read' : lab.phase}`);
    if (last.kind === 'unit') return last.ok ? k('v.unitOk') : k(`v.${last.model}`);
    if (last.kind === 'plant') return last.ok ? k('v.plantOk', { name: nameOf(last.jump), reading: iso(`${last.jump}(${last.value})`) }) : k(`v.${last.model}`, { value: iso(last.value), name: nameOf(last.jump) });
    if (last.kind === 'read') {
      if (!last.ok) return k(`w.${last.model}`, { value: iso(last.value) });
      const a = lab.answered[last.flag];
      return a?.mode === 'bounds' ? k('r.bounds', { id: last.flag, lo: iso(val(a.lo)), hi: iso(val(a.hi)) }) : k('r.exact', { id: last.flag, v: iso(last.value) });
    }
    if (last.kind === 'custom') return k('free.on');
    return k('idle.open');
  })();
  const bad = !!last && last.ok === false && !last.free;
  const good = !!last && last.ok === true && !last.free;
  const tone = bad ? 'amber' : good ? 'emerald' : 'indigo';
  const Icon = bad ? Sparkles : good ? CheckCircle2 : Hand;
  const canNext = L.canNext(lab) && !cp.blocking;
  const mood = bad ? 'wonder' : done ? 'proud' : 'happy';
  const banner = (
    <VerdictBanner tone={tone} icon={Icon} size="sm" className="min-h-[3.2rem]" data-jt-verdict={bad ? 'wrong' : good ? 'right' : last?.free ? 'free' : ''}>
      <div className="flex min-w-0 items-center gap-2">
        <span data-jt-kid data-mood={mood} className="shrink-0"><Jumper idx={advanced ? 1 : 0} mood={mood} size={40} /></span>
        <div className="min-w-0 space-y-1.5">
          <p className={last ? '' : 'font-bold text-indigo-900'}>{verdictLine}</p>
          {canNext && (
            <button type="button" onClick={() => setLab(L.nextTask)} data-jt-next
              className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-2 border-emerald-600 bg-emerald-600 px-3.5 text-sm font-black text-white shadow-[0_3px_0_0_#047857] transition-all active:translate-y-0.5 ${ring}`}>
              {k('next')} <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </VerdictBanner>
  );

  return (
    <>
      <div className="relative space-y-2" data-jt-glance>
        {party.node}
        {cp.node}
        {prompt}
        <StageFrame className="min-w-0 overflow-hidden p-2" data-jt-stage>
          <Stage lab={lab} setLab={setLab} k={k} svgRef={svgRef} armed={armed} setArmed={setArmed} />
        </StageFrame>
        {!free ? <Controls lab={lab} setLab={setLab} k={k} svgRef={svgRef} armed={armed} setArmed={setArmed} /> : null}
        {banner}
      </div>
      <FreeCard lab={lab} setLab={setLab} k={k} />
    </>
  );
}

/* ══════════════ La scène : la fosse, le ruban, les drapeaux ══════════════ */

/** Les coordonnées SVG d'un évènement pointeur, et s'il est au-dessus de la scène. */
function svgPoint(svg, e) {
  const r = svg?.getBoundingClientRect();
  if (!r || !r.width) return null;
  return { x: ((e.clientX - r.left) * W) / r.width, y: ((e.clientY - r.top) * SH) / r.height, inside: e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom };
}

const pillFor = (x, y, text, fill, size = 13) => <SvgPill x={x} y={y} text={text} fill={fill} size={size} pointer="down" />;

function Stage({ lab, setLab, k, svgRef, armed, setArmed }) {
  const uid = `jt${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const task = L.taskOf(lab);
  const free = L.isFree(lab);
  const plantT = !free && task.kind === 'plant';
  const readT = !free && task.kind === 'read';
  const w = L.windowOf(lab);
  const u = L.uOf(lab);
  const maxTick = L.maxTickAt(u);
  const X = (i) => L.xOfTick(u, i);
  const xv = (v) => L.xOfValue(w, u, v);
  const cut = readT && w.from !== 0;
  const [drag, setDrag] = useState(null);       // { id, tick, over, moved, sx, sy, from } : un drapeau tenu
  const [kb, setKb] = useState(null);           // { id, tick } : un drapeau déplacé au clavier (Enter le plante)
  const unitOpen = plantT && lab.phase === 'unit';
  const locked = plantT && lab.phase !== 'unit';
  const showTicks = free || readT || locked;
  const everMoved = free || readT || lab.moved || locked;
  const marksUntil = unitOpen && !lab.moved ? 1 : Math.floor(L.WIN / u);
  const marks = Array.from({ length: marksUntil + 1 }, (_, m) => m);
  const markLabel = (m) => (w.from === 0 && m === 0 ? 'O' : val(H.markValue(w, m)));
  const flags = free ? [] : L.flagsOf(lab);

  /* ── le gabarit de la fenêtre : un seul glisser pour l'unité, le curseur ou la pose d'un drapeau armé ── */
  const unitDown = (e) => {
    if (!unitOpen) return;
    const p = svgPoint(svgRef.current, e); if (!p) return;
    e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag({ id: 'unit', over: true });
    setLab((s) => L.setUnit(s, p.x - L.X0));
  };
  const unitMove = (e) => { if (drag?.id !== 'unit') return; const p = svgPoint(svgRef.current, e); if (p) setLab((s) => L.setUnit(s, p.x - L.X0)); };
  const unitUp = (e) => {
    if (drag?.id !== 'unit') return;
    setDrag(null);
    const p = svgPoint(svgRef.current, e);
    setLab((s) => L.releaseUnit(p ? L.setUnit(s, p.x - L.X0) : s));
  };
  const unitKey = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); setLab((s) => L.unitBy(s, 1)); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); setLab((s) => L.unitBy(s, -1)); }
    else if (e.key === 'PageUp') { e.preventDefault(); setLab((s) => L.unitBy(s, 5)); }
    else if (e.key === 'PageDown') { e.preventDefault(); setLab((s) => L.unitBy(s, -5)); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLab(L.releaseUnit); }
  };
  const tapePlant = (e) => {                    // un drapeau armé (tap-tap) tombe sur la graduation touchée
    if (!armed) return;
    const p = svgPoint(svgRef.current, e); if (!p) return;
    e.preventDefault();
    setLab((s) => L.plant(s, armed, L.tickAtX(L.uOf(s), p.x)));
    setArmed(null);
  };
  const cursorDown = (e) => {
    const p = svgPoint(svgRef.current, e); if (!p) return;
    e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag({ id: 'cursor', over: true });
    setLab((s) => L.moveCursor(s, L.tickAtX(L.READ_U, p.x, task.maxTick)));
  };
  const cursorMove = (e) => { if (drag?.id !== 'cursor') return; const p = svgPoint(svgRef.current, e); if (p) setLab((s) => L.moveCursor(s, L.tickAtX(L.READ_U, p.x, s.tasks[s.ti].maxTick))); };
  const cursorUp = () => { if (drag?.id === 'cursor') setDrag(null); };
  const cursorKey = (e) => {
    const step = e.shiftKey ? 10 : 1;
    if (e.key === 'ArrowRight') { e.preventDefault(); setLab((s) => L.cursorBy(s, step)); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); setLab((s) => L.cursorBy(s, -step)); }
    else if (e.key === 'PageUp') { e.preventDefault(); setLab((s) => L.cursorBy(s, 10)); }
    else if (e.key === 'PageDown') { e.preventDefault(); setLab((s) => L.cursorBy(s, -10)); }
    else if (e.key === 'Home') { e.preventDefault(); setLab((s) => L.moveCursor(s, 0)); }
    else if (e.key === 'End') { e.preventDefault(); setLab((s) => L.moveCursor(s, s.tasks[s.ti].maxTick)); }
  };

  /* ── reprendre un drapeau planté (le glisser, ou le glisser hors de la fosse pour le remettre au bac) ── */
  const flagDown = (e, id) => {
    if (!plantT || lab.phase !== 'plant') return;
    e.preventDefault(); e.stopPropagation(); e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag({ id, tick: lab.planted[id], over: true, moved: false, sx: e.clientX, sy: e.clientY, from: 'flag' });
  };
  const flagMove = (e) => {
    if (!drag || drag.id === 'unit' || drag.id === 'cursor') return;
    const p = svgPoint(svgRef.current, e); if (!p) return;
    const moved = drag.moved || Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 6;
    setDrag({ ...drag, tick: L.tickAtX(u, p.x), over: p.inside && p.y < SH - 4, moved });
  };
  const flagUp = () => {
    if (!drag || drag.from !== 'flag') return;
    const d = drag; setDrag(null);
    if (!d.moved) { setLab((s) => L.lift(s, d.id)); return; }
    if (d.over) setLab((s) => L.plant(s, d.id, d.tick)); else setLab((s) => L.lift(s, d.id));
  };

  const refusal = lab.refusal;
  const held = drag && drag.from === 'flag' && drag.moved ? drag : null;
  const ghostFlag = held ?? (kb ? { id: kb.id, tick: kb.tick } : null);
  // la fenêtre libre (جرّب أعدادك) : un seul drapeau bleu, A
  const info = L.freeInfo(lab);

  // les clés de focus clavier d'un drapeau posé dans la fosse depuis le bac (écouté sur les cartes du bac, voir `Controls`) arrivent ici par l'état `kb` partagé via l'évènement personnalisé
  useEffect(() => {
    const el = svgRef.current?.closest('[data-jump-tape]');
    if (!el) return undefined;
    const on = (e) => setKb(e.detail);
    el.addEventListener('jt-kb', on);
    return () => el.removeEventListener('jt-kb', on);
  }, [svgRef]);

  const tickEls = [];
  if (showTicks) {
    for (let i = 0; i <= maxTick; i += 1) {
      const kindT = i % 10 === 0 ? 'big' : i % 5 === 0 ? 'mid' : 'small';
      if (kindT === 'big') continue;
      tickEls.push(<g key={i} data-jt-tick={val(H.tickValue(w, i))}><Tick x={X(i)} kind={kindT} i={i} animate={locked} /></g>);
    }
  }

  return (
    <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${SH}`} style={{ maxWidth: W, display: 'block', margin: '0 auto', touchAction: 'pan-y' }} role="img" aria-label={k('stageAria')} data-jt-svg dir="ltr"
      onPointerMove={flagMove} onPointerUp={flagUp} onPointerCancel={flagUp}>
      <Backdrop uid={uid} x0={L.X0} xEnd={L.X0 + L.WIN} cut={cut} />
      <TapeBand uid={uid} x0={L.X0} len={L.WIN} cut={cut} />
      {/* les grandes marques */}
      {marks.map((m) => {
        const x = L.X0 + m * u;
        if (x > L.X0 + L.WIN + 0.5) return null;
        return (
          <g key={m} data-jt-mark={val(H.markValue(w, m))} aria-hidden="true">
            <Tick x={x} kind="big" i={0} />
            <text x={x} y={TY + 36} fontSize={20} fontWeight={900} fill={m === 0 && w.from === 0 ? COL.cursor : COL.tapeInk} textAnchor="middle" style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{markLabel(m)}</text>
          </g>
        );
      })}
      {tickEls}
      {readT && (
        <rect x={L.X0 - 10} y={TY - 6} width={L.WIN + 20} height={TH + 40} fill="transparent" style={{ cursor: 'ew-resize', touchAction: 'none' }} data-jt-hit="cursor" aria-hidden="true"
          onPointerDown={cursorDown} onPointerMove={cursorMove} onPointerUp={cursorUp} onPointerCancel={cursorUp} />
      )}
      {/* l'unité refusée : la marque sort de la fosse, ou les graduations se tassent */}
      {refusal === 'long' && (
        <g data-jt-refused="long" aria-hidden="true" className="jt-ghost">
          <rect x={L.X0 + L.PIT_END} y={TY - 14} width={L.WIN - L.PIT_END + 14} height={TH + 28} fill={COL.hatch} opacity={0.3} />
          <line x1={L.X0 + L.PIT_END} x2={L.X0 + L.PIT_END} y1={TY - 14} y2={TY + TH + 14} stroke={COL.miss} strokeWidth={3} strokeDasharray="5 3" />
          {pillFor(L.X0 + L.PIT_END - 4, TY - 18, k('refusedLong'), COL.miss, 12)}
        </g>
      )}
      {refusal === 'short' && (
        <g data-jt-refused="short" aria-hidden="true" className="jt-ghost">
          <rect x={L.X0} y={TY} width={Math.max(lab.u, 4)} height={26} rx={4} fill={COL.hatch} opacity={0.4} stroke={COL.miss} strokeWidth={1.6} strokeDasharray="3 2" />
          {pillFor(L.X0 + Math.max(lab.u, 4) / 2, TY - 6, k('refusedShort'), COL.miss, 12)}
        </g>
      )}
      {cut && <g aria-hidden="true">{pillFor(L.X0 + 70, 52, k('originAway'), '#475569', 12)}</g>}

      {/* le mode libre : un drapeau à l'abscisse tapée */}
      {free && info && (
        <g data-jt-flag="A" data-state="right" data-at={info.text}>
          <Flag x={xv(info.v)} color="blue" letter="A" state="right" />
          {pillFor(xv(info.v) + 12, TY - POLE - 4, info.exact ? `A(${info.text})` : `${info.loText} < A < ${info.hiText}`, '#1D4ED8', 12)}
        </g>
      )}

      {/* مبتدئ : les empreintes à la vraie place, puis les drapeaux plantés */}
      {plantT && flags.map((f) => {
        const pr = lab.prints[f.id];
        if (pr === undefined) return null;
        const xf = X(lab.planted[f.id]); const xp = X(pr);
        return (
          <g key={`p${f.id}`} data-jt-print={f.id} data-at={val(H.tickValue(w, pr))} className="jt-ghost">
            <line x1={xf} x2={xp} y1={TY + TH + 10} y2={TY + TH + 10} stroke={COL.miss} strokeWidth={2.2} strokeDasharray="4 3" aria-hidden="true" />
            <Footprint x={xp} color={f.color} />
          </g>
        );
      })}
      {plantT && flags.map((f) => {
        if (lab.planted[f.id] === undefined || (held && held.id === f.id)) return null;
        const x = X(lab.planted[f.id]);
        const right = L.isRight(lab, f.id);
        return (
          <g key={f.id} data-jt-flag={f.id} data-state={right ? 'right' : 'wrong'} data-at={val(H.tickValue(w, lab.planted[f.id]))}>
            <Flag x={x} color={f.color} letter={f.id} state={right ? 'right' : 'wrong'} />
            {pillFor(x + 12, TY - POLE - 4, `${f.id}(${val(H.tickValue(w, lab.planted[f.id]))})`, right ? '#15803D' : '#4F46E5', 12)}
            <rect x={x - 18} y={TY - POLE - 4} width={56} height={POLE + TH + 8} fill="transparent" style={{ cursor: lab.phase === 'plant' ? 'grab' : 'default', touchAction: 'none' }}
              onPointerDown={(e) => flagDown(e, f.id)} aria-hidden="true" />
          </g>
        );
      })}
      {ghostFlag && plantT && (() => {
        const f = flags.find((j) => j.id === ghostFlag.id); if (!f) return null;
        const x = X(ghostFlag.tick);
        return (
          <g data-jt-flag={f.id} data-state="held" data-at={val(H.tickValue(w, ghostFlag.tick))}>
            <Flag x={x} color={f.color} letter={f.id} ghost />
            {pillFor(x + 12, TY - POLE - 4, `${f.id}(${val(H.tickValue(w, ghostFlag.tick))})`, '#7C3AED', 12)}
          </g>
        );
      })()}

      {/* متقدم : les drapeaux déjà plantés, l'écart hachuré, le curseur */}
      {readT && flags.map((f) => {
        const x = xv(f.v);
        const a = lab.answered[f.id];
        const sel = lab.sel === f.id && !L.taskDone(lab);
        return (
          <g key={f.id} data-jt-flag={f.id} data-state={a ? 'right' : 'idle'} data-at={f.text} data-selected={sel ? 'true' : 'false'}>
            {sel && <circle cx={x + 14} cy={TY - POLE + 12} r={20} fill="#FDE68A" opacity={0.6} aria-hidden="true" />}
            <Flag x={x} color={f.color} letter={f.id} state={a ? 'right' : 'idle'} />
            {a && (
              <g data-jt-reading={f.id}>
                {pillFor(x + 12, TY - POLE - 4, a.mode === 'exact' ? `${f.id}(${val(a.lo)})` : `${val(a.lo)} < ${f.id} < ${val(a.hi)}`, '#15803D', 12)}
              </g>
            )}
            <rect x={x - 14} y={TY - POLE - 6} width={52} height={POLE + TH + 8} fill="transparent" style={{ cursor: a ? 'default' : 'pointer', touchAction: 'none' }}
              onPointerDown={(e) => { e.stopPropagation(); setLab((s) => L.selectFlag(s, f.id)); }} aria-hidden="true" />
          </g>
        );
      })}
      {readT && lab.ghost && (() => {
        const f = flags.find((j) => j.id === lab.ghost.flag);
        const xc = X(lab.ghost.tick); const xf = xv(f.v);
        const lo = Math.min(xc, xf); const hi = Math.max(xc, xf);
        return (
          <g data-jt-gap data-model={lab.ghost.model} className="jt-ghost" aria-hidden="true">
            {hi - lo >= 1
              ? <rect x={lo} y={TY + TH + 4} width={hi - lo} height={22} fill={COL.hatch} opacity={0.45} stroke={COL.miss} strokeWidth={1.6} strokeDasharray="4 3" />
              : <circle cx={xc} cy={TY + TH / 2} r={13} fill="none" stroke={COL.miss} strokeWidth={2.4} strokeDasharray="4 3" data-jt-touch />}
          </g>
        );
      })()}
      {readT && (
        <g data-jt-cursor-group>
          <Cursor x={X(lab.cursor)} active={drag?.id === 'cursor'} />
          {pillFor(X(lab.cursor), TY - 46, val(L.valueAtTick(lab, lab.cursor)), '#4F46E5', 12)}
          <rect x={X(lab.cursor) - 24} y={TY - 52} width={48} height={52} fill="transparent" style={{ cursor: 'grab', touchAction: 'none' }} tabIndex={0} role="slider" data-jt-cursor data-at={val(L.valueAtTick(lab, lab.cursor))}
            aria-label={k('cursorAria')} aria-valuemin={0} aria-valuemax={task.maxTick} aria-valuenow={lab.cursor} aria-valuetext={k('cursorValue', { v: val(L.valueAtTick(lab, lab.cursor)) })} aria-orientation="horizontal"
            onKeyDown={cursorKey} onPointerDown={cursorDown} onPointerMove={cursorMove} onPointerUp={cursorUp} onPointerCancel={cursorUp} />
        </g>
      )}

      {/* مبتدئ : le gabarit de la pose (un drapeau armé tombe sur la graduation touchée) et le MÉTRÉ de l'unité */}
      {plantT && lab.phase === 'plant' && armed && (
        <rect x={L.X0 - 10} y={TY - POLE - 8} width={L.WIN + 20} height={POLE + TH + 40} fill="transparent" style={{ cursor: 'crosshair' }} data-jt-hit="plant" aria-hidden="true" onPointerDown={tapePlant} />
      )}
      {unitOpen && (
        <g>
          <rect x={L.X0 - 10} y={TY - 40} width={L.WIN + 20} height={TH + 80} fill="transparent" style={{ cursor: 'ew-resize', touchAction: 'none' }} data-jt-hit="unit" aria-hidden="true"
            onPointerDown={unitDown} onPointerMove={unitMove} onPointerUp={unitUp} onPointerCancel={unitUp} />
          <g aria-hidden="true">
            <path d={`M${L.X0 + lab.u} ${TY - 6} v-14`} stroke={COL.cursor} strokeWidth={3} />
            <rect x={L.X0 + lab.u - 20} y={TY - 44} width={40} height={26} rx={9} fill={COL.cursor} stroke="#fff" strokeWidth={2.4} className={drag?.id === 'unit' ? '' : 'jt-pop'} />
            <path d={`M${L.X0 + lab.u - 12} ${TY - 31} h24 M${L.X0 + lab.u - 12} ${TY - 31} l5 -5 M${L.X0 + lab.u - 12} ${TY - 31} l5 5 M${L.X0 + lab.u + 12} ${TY - 31} l-5 -5 M${L.X0 + lab.u + 12} ${TY - 31} l-5 5`} stroke="#fff" strokeWidth={2.2} strokeLinecap="round" fill="none" />
          </g>
          <rect x={L.X0 + lab.u - 28} y={TY - 48} width={56} height={44} fill="transparent" style={{ cursor: 'grab', touchAction: 'none' }} tabIndex={0} role="slider" data-jt-knob data-u={lab.u}
            aria-label={k('knobAria')} aria-valuemin={L.U_MIN} aria-valuemax={L.U_MAX} aria-valuenow={lab.u} aria-valuetext={k('knobValue', { u: lab.u })} aria-orientation="horizontal"
            onKeyDown={unitKey} onPointerDown={unitDown} onPointerMove={unitMove} onPointerUp={unitUp} onPointerCancel={unitUp} />
        </g>
      )}
      {plantT && <g data-jt-unit data-u={lab.u} data-locked={locked ? 'true' : 'false'} data-ever-moved={everMoved ? 'true' : 'false'} />}
    </svg>
  );
}

/* ══════════════ Les commandes ══════════════ */

function Controls({ lab, setLab, k, svgRef, armed, setArmed }) {
  const task = L.taskOf(lab);
  const done = L.taskDone(lab);
  const btn = `inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-2xl border-2 px-3 text-sm font-black disabled:opacity-40 ${ring}`;
  if (task.kind === 'read') {
    const sel = lab.sel;
    const can = !!sel && !done;
    const colorChip = { red: 'bg-rose-600', blue: 'bg-blue-600', green: 'bg-green-600', amber: 'bg-amber-600' };
    return (
      <LabCard className="space-y-2 p-2" data-jt-controls>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label={k('chipsAria')}>
          {task.flags.map((f) => {
            const a = lab.answered[f.id];
            return (
              <button key={f.id} type="button" onClick={() => setLab((s) => L.selectFlag(s, f.id))} disabled={!!a} data-jt-chip={f.id} aria-pressed={sel === f.id}
                className={`${btn} min-w-[44px] ${sel === f.id ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-indigo-300 bg-white text-indigo-900'} ${a ? '!border-emerald-300 !bg-emerald-50 !text-emerald-800' : ''}`}>
                <span className={`h-3 w-3 rounded-full ${colorChip[f.color]}`} aria-hidden="true" /> {f.id}
                {a && <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
              </button>
            );
          })}
          <span className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-black text-indigo-900" data-jt-readout>
            {k('cursorAt', { v: iso(val(L.valueAtTick(lab, lab.cursor))) })}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2" data-jt-answers role="group" aria-label={k('answersAria')}>
          <button type="button" onClick={() => setLab((s) => L.answerRead(s, 'exact'))} disabled={!can} data-jt-exact className={`${btn} border-indigo-600 bg-indigo-600 text-white shadow-[0_3px_0_0_#3730A3]`}>{k('exact')}</button>
          <button type="button" onClick={() => setLab((s) => L.answerRead(s, 'bounds'))} disabled={!can} data-jt-bounds className={`${btn} border-violet-600 bg-violet-600 text-white shadow-[0_3px_0_0_#5B21B6]`}>{k('bounds')}</button>
        </div>
      </LabCard>
    );
  }
  if (lab.phase === 'unit') {
    return (
      <LabCard className="flex flex-wrap items-center gap-2 p-2" data-jt-controls>
        <button type="button" onClick={() => setLab((s) => L.unitBy(s, -1))} data-jt-less aria-label="−" className={`${btn} min-w-[44px] border-indigo-300 bg-white text-indigo-900`}><Minus className="h-4 w-4" aria-hidden="true" /></button>
        <span data-jt-dial className="inline-flex min-h-[44px] min-w-[5.5rem] items-center justify-center gap-1 rounded-2xl border-2 border-amber-300 bg-amber-50 px-3 text-sm font-black text-amber-900">1</span>
        <button type="button" onClick={() => setLab((s) => L.unitBy(s, 1))} data-jt-more aria-label="+" className={`${btn} min-w-[44px] border-indigo-300 bg-white text-indigo-900`}><Plus className="h-4 w-4" aria-hidden="true" /></button>
        <button type="button" onClick={() => setLab(L.releaseUnit)} disabled={!lab.moved} data-jt-lock className={`${btn} border-indigo-600 bg-indigo-600 text-white shadow-[0_3px_0_0_#3730A3]`}>{k('lock')}</button>
      </LabCard>
    );
  }
  return (
    <LabCard className="space-y-2 p-2" data-jt-controls>
      <div className="flex flex-wrap items-stretch gap-2" data-jt-tray role="group" aria-label={k('trayAria')}>
        <span data-jt-unit-lock className="inline-flex min-h-[44px] items-center gap-1 rounded-2xl border-2 border-amber-300 bg-amber-50 px-2 text-xs font-black text-amber-900"><Lock className="h-4 w-4" aria-hidden="true" /> 1</span>
        {task.jumps.map((j) => <Card key={j.id} j={j} lab={lab} setLab={setLab} k={k} svgRef={svgRef} armed={armed} setArmed={setArmed} />)}
      </div>
    </LabCard>
  );
}

/** Un bac de drapeau : l'enfant, son nom et la distance écrite ; se SAISIT et se glisse vers le ruban (ou : tap puis tap sur le ruban, ou flèches + Enter). */
function Card({ j, lab, setLab, k, svgRef, armed, setArmed }) {
  const planted = lab.planted[j.id] !== undefined;
  const right = planted && L.isRight(lab, j.id);
  const [drag, setDrag] = useState(null);
  const [kbTick, setKbTick] = useState(null);
  const ref = useRef(null);
  const u = lab.u;
  const emit = (detail) => ref.current?.closest('[data-jump-tape]')?.dispatchEvent(new CustomEvent('jt-kb', { detail }));
  useEffect(() => { if (kbTick === null) emit(null); }, [kbTick]); // eslint-disable-line react-hooks/exhaustive-deps
  const down = (e) => {
    if (planted) return;
    e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag({ tick: null, over: false, moved: false, sx: e.clientX, sy: e.clientY });
  };
  const move = (e) => {
    if (!drag) return;
    const p = svgPoint(svgRef.current, e);
    const moved = drag.moved || Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 6;
    const over = !!p && p.inside;
    const tick = p ? L.tickAtX(u, p.x) : null;
    setDrag({ ...drag, moved, over, tick });
    emit(moved && over && tick !== null ? { id: j.id, tick } : null);
  };
  const up = () => {
    if (!drag) return;
    const d = drag; setDrag(null); emit(null);
    if (!d.moved) { setArmed((a) => (a === j.id ? null : j.id)); return; }
    if (d.over && d.tick !== null) setLab((s) => L.plant(s, j.id, d.tick));
  };
  const key = (e) => {
    if (planted) return;
    const start = kbTick ?? 10;
    const set = (t) => { const v = Math.max(0, Math.min(L.maxTickAt(u), t)); setKbTick(v); emit({ id: j.id, tick: v }); };
    if (e.key === 'ArrowRight') { e.preventDefault(); set(kbTick === null ? start : start + (e.shiftKey ? 10 : 1)); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); set(kbTick === null ? start : start - (e.shiftKey ? 10 : 1)); }
    else if (e.key === 'Enter' && kbTick !== null) { e.preventDefault(); setLab((s) => L.plant(s, j.id, kbTick)); setKbTick(null); }
    else if (e.key === 'Escape') { setKbTick(null); }
  };
  const isArmed = armed === j.id;
  const kid = { A: 0, B: 1, C: 2, D: 3 }[j.id] ?? 0;
  return (
    <button ref={ref} type="button" data-jt-card={j.id} data-planted={planted ? 'true' : 'false'} data-armed={isArmed ? 'true' : 'false'} data-state={planted ? (right ? 'right' : 'wrong') : 'idle'}
      aria-label={k('cardAria', { name: k(`name.${j.id}`), text: j.text })} aria-pressed={isArmed}
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={() => { setDrag(null); emit(null); }} onKeyDown={key} onBlur={() => { if (kbTick !== null) { setKbTick(null); } }}
      style={{ touchAction: 'none' }}
      className={`flex min-h-[56px] min-w-[8.5rem] items-center gap-2 rounded-2xl border-2 px-2 py-1 text-start transition-all ${ring} ${planted ? (right ? 'border-emerald-400 bg-emerald-50 opacity-70' : 'border-rose-300 bg-rose-50') : isArmed ? 'border-indigo-600 bg-indigo-50 shadow-[0_3px_0_0_#4338CA]' : 'cursor-grab border-indigo-200 bg-white shadow-[0_3px_0_0_#C7D2FE] active:cursor-grabbing'}`}>
      <Jumper idx={kid} size={36} />
      <span className="min-w-0 leading-tight">
        <span className="block text-xs font-bold text-slate-600">{k(`name.${j.id}`)} · {k(`colorName.${j.id}`)}</span>
        <bdi dir="ltr" className="block text-base font-black tabular-nums text-indigo-950">{writ(j.text)} {k('unitLabel')}</bdi>
        {planted && <span className="block text-[11px] font-black text-slate-500">{kbTick !== null ? k('armed') : k('planted')}</span>}
        {!planted && kbTick !== null && <span className="block text-[11px] font-black text-indigo-700">{k('armed')}</span>}
      </span>
    </button>
  );
}

/* ══════════════ « جرّب أعدادك » : toujours ouvert ══════════════ */

function FreeCard({ lab, setLab, k }) {
  const free = L.isFree(lab);
  const [text, setText] = useState('');
  useEffect(() => { if (!lab.free) setText(''); }, [lab.free]);
  const bad = text.trim() !== '' && L.parseFree(text) === null;
  const info = L.freeInfo(lab);
  const onText = (e) => {
    const raw = e.target.value.replace(/[^0-9٠-٩,.٫+/\s]/g, '').slice(0, 14);
    setText(raw);
    if (L.parseFree(raw) !== null) setLab((s) => L.setFree(s, raw));
  };
  return (
    <LabCard className="space-y-2 border-emerald-200 bg-emerald-50/50 p-3" data-jt-free data-active={free ? 'true' : 'false'}>
      <p className="flex items-center gap-1.5 text-sm font-black text-emerald-900"><FlaskConical className="h-4 w-4" aria-hidden="true" /> {k('free.title')}</p>
      <p className="text-xs font-bold leading-snug text-slate-600">{free ? k('free.on') : k('free.hint')}</p>
      <div className="flex flex-wrap items-center gap-3">
        <input type="text" inputMode="decimal" autoComplete="off" dir="ltr" value={text} onChange={onText} aria-label={k('free.aria')} aria-invalid={bad} data-jt-free-input placeholder="2,4 ; 3,25"
          className={`h-11 w-44 rounded-xl border-2 ${bad ? 'border-rose-300' : 'border-emerald-300'} bg-white px-3 text-center text-lg font-black tabular-nums text-indigo-950 ${ring}`} />
        {bad && <span className="text-xs font-bold text-rose-700">{k('free.bad')}</span>}
        {free && info && (
          <span className="text-xs font-black text-emerald-900" data-jt-free-info>
            {info.exact ? k('free.exact', { v: info.text, whole: info.whole, smalls: info.smalls }) : k('free.between', { lo: info.loText, hi: info.hiText })}
          </span>
        )}
        {free && (
          <button type="button" onClick={() => setLab(L.toGuided)} data-jt-free-back
            className={`inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-emerald-200 bg-white px-3 text-xs font-bold text-emerald-900 ${ring}`}>
            <Undo2 className="h-4 w-4" aria-hidden="true" /> {k('free.back')}
          </button>
        )}
      </div>
    </LabCard>
  );
}

/* ══════════════ La règle (la dernière question du labo) ══════════════ */

const $ = (s) => `$${s}$`;
const tex = (v) => val(v).replace(',', '{,}');
const Mx = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;

/** Les options : `texts[right]` est la bonne, les autres ont leur réfutation `whys[i]` ; la bonne est posée à la place `at` (jamais toujours la première). */
const opt = (texts, right, whys, at = 0) => {
  const list = texts.map((text, i) => (i === right ? { text, correct: true } : { text, why: whys[i] }));
  const [good] = list.splice(right, 1);
  list.splice(at % (list.length + 1), 0, good);
  return list;
};

export function ruleOptions(lab, k, advanced) {
  const key = advanced ? 'both' : 'rule';
  return opt([k(`discovery.${key}.right`), k(`discovery.${key}.wrongA`), k(`discovery.${key}.wrongB`)], 0, [null, k(`discovery.${key}.whyA`), k(`discovery.${key}.whyB`)], advanced ? 2 : 1);
}

/** Ce que l'élève a trouvé, écrit avec SES nombres : la première lecture exacte et (متقدم) son encadrement. */
export function Formal({ lab, k, advanced }) {
  const plants = lab.tasks.filter((t) => t.kind === 'plant');
  const reads = lab.tasks.filter((t) => t.kind === 'read');
  if (advanced) {
    const flag = reads.map((t) => t.flags.find((f) => !f.exact)).find(Boolean);
    const sel = reads.map((t) => t.flags.find((f) => f.exact)).find(Boolean);
    return (
      <div className="space-y-2 text-sm font-bold text-emerald-950" data-jt-formal="both">
        {sel && <p className="text-center text-base" dir="ltr"><MathText>{$(`${sel.id}(${tex(sel.v)})`)}</MathText></p>}
        {flag && <p className="text-center text-base" dir="ltr"><MathText>{$(`${tex(flag.lo)} < ${flag.id} < ${tex(flag.hi)}`)}</MathText></p>}
        <p><MathText>{k('formal.both')}</MathText></p>
      </div>
    );
  }
  const j = plants.map((t) => t.jumps.find((x) => x.v % 1000 !== 0 && x.v < 10000 && !x.sum)).find(Boolean);
  const whole = j ? Math.floor(j.v / 1000) : 2; const smalls = j ? (j.v % 1000) / 100 : 4;
  return (
    <div className="space-y-2 text-sm font-bold text-emerald-950" data-jt-formal="rule">
      <p className="text-center text-base" dir="ltr"><MathText>{$(`${j?.id ?? 'A'}(${tex(j?.v ?? 2400)})\\ :\\ ${whole}+\\frac{${smalls}}{10}=${tex(j?.v ?? 2400)}`)}</MathText></p>
      <p><MathText>{k('formal.rule')}</MathText></p>
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite d'une étape (par son id : les tâches viennent de la leçon ; `<id>u` = l'étape « unité » d'une tâche à unité libre). La dernière tâche de chaque niveau finit par LA RÈGLE. */
export const CHAINS = Object.freeze({
  b1u: ['ticks', 'gap'],
  b1: ['flagBlue', 'steps'],
  b2: ['wholeMark', 'zeroSeven'],
  b3: ['sumRead', 'ruleA'],
  a1: ['between'],
  a2: ['hidden'],
  a3: ['hundredth', 'ruleB'],
});

/** Une question à trois options décrite par ses clés de chaîne `cp.<id>.*` ; `vars` sont les nombres de l'élève. */
const choice = (k, id, vars, at, extra = {}) => ({
  id, kind: 'choice', prompt: Mx(k, `${id}.prompt`, vars),
  options: opt([Mx(k, `${id}.right`, vars), Mx(k, `${id}.wrongA`, vars), Mx(k, `${id}.wrongB`, vars)], 0, [null, Mx(k, `${id}.whyA`, vars), Mx(k, `${id}.whyB`, vars)], at),
  hints: [Mx(k, `${id}.hint1`, vars), Mx(k, `${id}.hint2`, vars)], explain: Mx(k, `${id}.explain`, vars), ...extra,
});
const wholeOf = (v) => Math.floor(v / 1000);
const smallsOf = (v) => (v % 1000) / 100;
const pick = (task, pred, i = 0) => task.jumps?.find(pred) ?? task.jumps?.[i] ?? task.flags?.[i];
const iv = (s) => iso(s);
const varsOf = (task) => {
  const red = pick(task, () => true, 0);
  const blue = task.jumps?.[1] ?? red;
  const wholeJ = pick(task, (j) => j.v % 1000 === 0 && j.v > 0);
  const smallJ = pick(task, (j) => j.v < 1000 && j.v > 0);
  const sumJ = pick(task, (j) => j.sum);
  const fl = task.flags ? (task.flags.find((f) => !f.exact) ?? task.flags[2] ?? task.flags[0]) : null;
  const hid = task.flags ? (task.flags.find((f) => f.exact && f.v >= 1000) ?? task.flags[0]) : null;
  const sw = H.swapDigits(blue.v);
  const tenthStep = task.w ? task.w.step / 10 : 100;
  return {
    red: iv(val(red.v)), wa: wholeOf(red.v), sa: smallsOf(red.v), ta: red.v / 100,
    blue: iv(val(blue.v)), wb: wholeOf(blue.v), sb: smallsOf(blue.v), swapB: iv(val(sw ?? blue.v + 200)), wholeB: String(wholeOf(blue.v)),
    n: wholeJ ? wholeOf(wholeJ.v) : 3,
    z: iv(val(smallJ ? smallJ.v : 700)), zs: smallJ ? smallJ.v / 100 : 7, zt: smallJ ? smallJ.v / 10 : 70,
    written: sumJ ? iv(writ(sumJ.text)) : '2 + 6/10', right: iv(val(sumJ ? sumJ.v : 2600)), whole: sumJ ? wholeOf(sumJ.v) : 2, digit: sumJ ? smallsOf(sumJ.v) : 6,
    a: iv(`${sumJ ? wholeOf(sumJ.v) : 2},0${sumJ ? smallsOf(sumJ.v) : 6}`), b: String(sumJ ? wholeOf(sumJ.v) + smallsOf(sumJ.v) : 8), frac: iv(`${sumJ ? smallsOf(sumJ.v) : 6}/10`),
    lo: fl ? iv(val(fl.lo)) : '', hi: fl ? iv(val(fl.hi)) : '', hh: fl ? iv(val(fl.hi + tenthStep)) : '', w0: fl ? String(wholeOf(fl.v)) : '', w1: fl ? String(wholeOf(fl.v) + 1) : '',
    h: hid ? iv(val(hid.v)) : '', hw: hid ? String(wholeOf(hid.v)) : '', hs: hid ? smallsOf(hid.v) : '',
  };
};
const at = { ticks: 1, gap: 0, flagBlue: 2, steps: 1, wholeMark: 0, zeroSeven: 2, sumRead: 1, between: 2, hidden: 0, hundredth: 1 };

export const QUESTIONS = {
  ticks: (lab, task, k) => choice(k, 'ticks', {}, at.ticks),
  gap: (lab, task, k) => choice(k, 'gap', {}, at.gap),
  flagBlue: (lab, task, k) => choice(k, 'flagBlue', varsOf(task), at.flagBlue),
  steps: (lab, task, k) => choice(k, 'steps', varsOf(task), at.steps),
  wholeMark: (lab, task, k) => choice(k, 'wholeMark', varsOf(task), at.wholeMark),
  zeroSeven: (lab, task, k) => choice(k, 'zeroSeven', varsOf(task), at.zeroSeven),
  sumRead: (lab, task, k) => choice(k, 'sumRead', varsOf(task), at.sumRead),
  between: (lab, task, k) => choice(k, 'between', varsOf(task), at.between),
  hidden: (lab, task, k) => choice(k, 'hidden', varsOf(task), at.hidden),
  hundredth: (lab, task, k) => choice(k, 'hundredth', varsOf(task), at.hundredth),
  ruleA: (lab, task, k) => ({
    id: 'ruleA', kind: 'choice', prompt: <MathText>{k('discovery.rule.prompt')}</MathText>,
    options: ruleOptions(lab, k, false).map((o) => ({ ...o, text: <MathText>{o.text}</MathText>, why: o.why && <MathText>{o.why}</MathText> })),
    hints: [<MathText key="h1">{k('rule.rule.hint1')}</MathText>, <MathText key="h2">{k('rule.rule.hint2')}</MathText>], explain: <Formal lab={lab} k={k} advanced={false} />,
  }),
  ruleB: (lab, task, k) => ({
    id: 'ruleB', kind: 'choice', prompt: <MathText>{k('discovery.both.prompt')}</MathText>,
    options: ruleOptions(lab, k, true).map((o) => ({ ...o, text: <MathText>{o.text}</MathText>, why: o.why && <MathText>{o.why}</MathText> })),
    hints: [<MathText key="h1">{k('rule.both.hint1')}</MathText>, <MathText key="h2">{k('rule.both.hint2')}</MathText>], explain: <Formal lab={lab} k={k} advanced />,
  }),
};
