import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Hand, CheckCircle2, Sparkles, ChevronLeft, FlaskConical, Undo2, Minus, Plus, Lock, Anchor } from 'lucide-react';
import { resolveLevelId } from '@smarter-academy/core/curriculum/manipulationLevels.js';
import * as R from '@smarter-academy/core/arithmetic/relative.js';
import MathText from '../../components/MathText';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
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
import { Backdrop, Landmark, PinFlag, Pennant, Guide, COL } from './cornicheRuler/art';
import { LEVELS } from '../levels';
import * as L from '../logic/cornicheRuler';

/**
 * corniche-ruler — L'ORIGINE ET LA GRADUATION SOUS LA MAIN (2AM, unité 3 « الأعداد النسبية », درس « التعليم على مستقيم مدرّج », 2026-10-29).
 * La logique, exacte, est dans `logic/cornicheRuler.js` (sur `packages/core/arithmetic/relative.js`, importé par chemin).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. مبتدئ : la main tient l'ORIGINE — le drapeau « 0 » glisse sur la planche (13 graduations de 10 m, il s'accroche aux graduations), ‹ › et les flèches font de même.
 *    متقدم : la main tient la VALEUR D'UNE GRADUATION — le levier à crans (0,1 … 100 m) sous une origine fixe. L'élève écrit ou touche ensuite : l'abscisse est une SORTIE.
 * B. L'abscisse d'un repère = (sa position) − (celle du drapeau) : elle change quand le drapeau bouge alors que le repère n'a pas bougé.
 * C. La résistance : deux repères à la même distance de part et d'autre n'ont d'abscisses opposées que pour UNE origine ; un repère peut tomber entre deux graduations
 *    (case hachurée) ; une graduation trop petite jette un point hors de la planche (flèche « خارج اللوحة »), une trop grande le laisse entre deux graduations.
 * D. La phase formelle écrit ce que l'élève a trouvé avec SES nombres (la dernière question du labo, la règle).
 * E. Les fausses réponses sont rendues VISIBLES : le repère fantôme montre où mène le nombre écrit (graduations sans valeur, mauvais côté, ancienne origine).
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        l'abscisse d'un point : compter les graduations depuis l'origine × la valeur d'une graduation, le signe selon le côté ; elle dépend de l'origine
 *   OBJECT         un front de mer (repères), une planche graduée, un drapeau « 0 », un levier à crans
 *   VARIABLE       l'origine (مبتدئ) ; la valeur d'une graduation (متقدم)
 *   INVARIANT      la position des repères ; la planche (13 graduations)
 *   TRANSFORMATION déplacer le drapeau : tous les nombres changent à la fois ; tourner le levier : la planche s'étire ou se resserre
 *   CONSTRAINT     le drapeau s'accroche aux graduations ; la planche s'arrête à ±6 graduations ; 10 crans
 *   RESISTANCE     une seule origine rend deux repères opposés ; un point entre deux graduations ; la planche qui déborde
 *   EVIDENCE       le fil à plomb de chaque repère, les nombres de la planche, le fantôme d'une erreur
 *   PREDICTION     متقدم : les nombres de la planche restent voilés jusqu'à fixer la graduation
 *   FORMALIZATION  « فاصلة النقطة = عدد التدريجات × قيمة التدريجة، وإشارتها من جهتها » ; le choix : la plus petite graduation qui garde tout sur la planche et sur des graduations
 *   TRANSFER       « جرّب أعدادك » (toujours ouvert), les exercices et la banque
 *
 * ONBOARDING : `coach` (défaut true) → `LabCoach` ; `logic › coachOf`. QUESTIONS PENDANT LE LABO (prototype `LabCheckpoint`) : `CHAINS` + `QUESTIONS` ci-dessous, après CHAQUE
 * tâche, avec SES nombres ; la dernière suite de chaque niveau finit par LA RÈGLE. ÉTAPES : `LabStepper` (`[data-cr-step=<i>]`) + la fête. « إعادة » : tâche 1.
 * Props (contrat fixé avec la leçon) : `tasks`, `level`, `levels`, `coach`, `title`, `lead`, `onTrial(event)`, `onFinished({})`.
 *
 * CONTRAT DOM : [data-corniche-ruler][data-level][data-task][data-origin][data-step][data-solved], [data-cr-glance], [data-cr-stage], [data-cr-svg],
 * [data-cr-pin] (role slider), [data-cr-lever] (role slider), [data-cr-landmark=<id>][data-abscissa], [data-cr-cell=<i>], [data-cr-answer], [data-cr-check],
 * [data-cr-confirm], [data-cr-ghost][data-model], [data-cr-off], [data-cr-hatch], [data-cr-verdict], [data-cr-next], [data-cr-step=<i>], [data-cr-free], [data-cr-free-input],
 * [data-cr-free-back], [data-cr-kid][data-mood].
 */
const NS = 'manipulation.cornicheRuler';
const LRI = '⁦';
const PDI = '⁩';
const iso = (s) => `${LRI}${String(s).replace(/-/g, '−')}${PDI}`;
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-indigo-300';
const SCENE_H = 176;
const Y_RAIL = 44;
const Y_FOOT = 98;
const Y_STRIP = 118;
const STRIP_H = 28;

const CSS = `
@keyframes cr-pop { 0% { transform: scale(0.85); } 70% { transform: scale(1.06); } 100% { transform: scale(1); } }
.cr-pop { animation: cr-pop 240ms ease-out both; display: inline-block; }
@keyframes cr-ghost { 0%,100% { opacity: .55; } 50% { opacity: .9; } }
.cr-ghost { animation: cr-ghost 1.6s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .cr-pop, .cr-ghost { animation: none !important; } }
`;

export function numbersFor({ tasks, level }) {
  const lv = resolveLevelId(level ?? 'beginner');
  const asked = LEVELS['corniche-ruler'][lv].numbers;
  return { tasks: tasks ?? asked.tasks };
}

export default function CornicheRuler({
  tasks, title, lead, level, levels: withLevels = true, coach: coachOn = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const initialNumbers = useMemo(() => numbersFor({ tasks, level }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'corniche-ruler', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nums = state.numbers;
  const numsKey = JSON.stringify(nums);
  const [lab, setLab] = useState(() => L.init(nums));
  const [scene, setScene] = useState({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: 0 });
  if (scene.key !== numsKey || scene.epoch !== state.epoch) {
    // « إعادة » (resetCount), un autre niveau ou d'autres nombres : TOUT recommence — la tâche 1, les essais et les questions du labo
    setScene({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: scene.inits + 1 });
    setLab(L.init(nums));
  }
  const cur = L.taskOf(lab);
  const advanced = lab.tasks[0].kind === 'fit';
  const cpSettings = useLabCheckpointSettings('corniche-ruler');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const chain = cpOn && cpSettings.enabled && !L.isFree(lab) ? CHAINS[cur.id] ?? null : null;
  const isRule = (q) => q === 'rule' || q === 'ruleB';
  const ruleByCheckpoint = cpOn && cpSettings.enabled && lab.tasks.some((tk) => CHAINS[tk.id]?.some(isRule));
  const cp = useLabCheckpoint({
    id: chain ? cur.id : null,
    questions: chain && L.taskDone(lab) ? chain.map((q) => QUESTIONS[q](lab, cur, k)) : null,
    reached: L.taskDone(lab),
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
    lab: 'corniche-ruler', step: coachStep,
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
    <ManipulationDiscovery state={state} prompt={<MathText>{k(`discovery.${advanced ? 'step' : 'origin'}.prompt`)}</MathText>} options={ruleOptions(lab, k, advanced)} formal={<Formal lab={lab} k={k} advanced={advanced} />} />
  );

  return (
    <ManipulationShell
      type="corniche-ruler"
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
      <ManipulationStage className="bg-gradient-to-b from-sky-50/60 to-white">
        <div ref={boxRef} className="space-y-2" data-corniche-ruler data-level={advanced ? 'advanced' : 'beginner'} data-task={lab.free ? 'free' : lab.ti}
          data-origin={R.text(lab.pin)} data-step={L.stepText(lab)} data-solved={finished ? 'true' : 'false'}>
          <style dangerouslySetInnerHTML={{ __html: CSS }} />
          <Lab lab={lab} setLab={setLab} k={k} width={width} screenH={screenH} lead={state.isAuthoredLevel ? lead : null} cp={cp} advanced={advanced} />
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ══════════════ Le laboratoire ══════════════ */

function Lab({ lab, setLab, k, width, lead, cp, advanced }) {
  const task = L.taskOf(lab);
  const free = L.isFree(lab);
  const done = L.taskDone(lab);
  const lit = !free && done;
  const last = lab.last;
  const nm = (id) => k(`lm.${id}`);

  const ctx = free ? k('ctx.free') : (lead && lab.ti === 0 ? lead : k(`ctx.${task.id}`, { name: task.ask ? nm(task.ask[0]) : '' }));
  const ask = L.currentAsk(lab);
  const tapId = L.currentTap(lab);
  const question = (() => {
    if (free) return k('q.free');
    if (task.kind === 'fit') return lab.confirmed && tapId ? k('q.tap', { name: tapId }) : k(`q.${task.id}`);
    if (task.kind === 'read' || task.kind === 'move') return k(`q.${task.id}`, { name: nm(ask ?? task.ask[task.ask.length - 1]) });
    return k(`q.${task.id}`);
  })();

  const stepDone = lab.tasks.map((_, i) => !!lab.done[i] && (i !== lab.ti || !cp.blocking));
  const steps = lab.tasks.length > 1 && !free && <LabStepper count={lab.tasks.length} current={lab.ti} done={stepDone} stepAttr="data-cr-step" />;
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.trials.length === 0 && celebrated.current.size) celebrated.current = new Set();
  const nowDone = !free && stepDone[lab.ti];
  useEffect(() => {
    if (!nowDone || celebrated.current.has(lab.ti)) return;
    celebrated.current.add(lab.ti);
    party.celebrate({ n: lab.ti + 1, total: lab.tasks.length });
  }, [nowDone, lab.ti]); // eslint-disable-line react-hooks/exhaustive-deps

  // le son (muet sauf « الصوت ») : un déclic par déplacement du drapeau / cran, le drapeau quand c'est juste, « over » sur un refus, la cloche à la fin
  const sfx = useRef({ pin: lab.pin, step: lab.step });
  useEffect(() => {
    const p = sfx.current;
    if (lab.pin !== p.pin) playSfx('gesture', { pitch: lab.pin > p.pin ? 1 : 0.75 });
    else if (lab.step !== p.step) playSfx('gesture', { pitch: lab.step > p.step ? 1 : 0.75 });
    sfx.current = { pin: lab.pin, step: lab.step };
  }, [lab.pin, lab.step]); // eslint-disable-line react-hooks/exhaustive-deps
  const nTrials = lab.trials.length;
  useEffect(() => {
    if (!nTrials) return;
    const tr = lab.trials[nTrials - 1];
    if (tr.free) return;
    if (tr.kind === 'pin' && tr.ok === undefined) return;
    playSfx(tr.ok ? 'flag' : 'over');
  }, [nTrials]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (done && !free) playSfx('bell'); }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  const prompt = (
    <PromptCard size={width >= 600 ? 'lg' : 'md'} aside={steps || null} context={<MathText>{ctx}</MathText>} contextProps={{ 'data-cr-context': free ? 'free' : task.id }}
      title={<MathText>{question}</MathText>} titleClassName={width >= 600 ? 'text-lg' : 'text-base'} lamp={free ? null : lit ? 'on' : 'off'}
      titleProps={{ 'data-cr-prompt': free ? 'free' : task.id, 'data-lit': lit ? 'true' : 'false' }} />
  );

  /* ── le verdict : la CONSÉQUENCE avec les nombres de l'élève, jamais la règle ── */
  const verdictLine = (() => {
    if (!last) return k(advanced ? 'idleStep' : 'idle');
    if (last.kind === 'read') {
      if (last.ok) return k('v.readOk', { name: nm(last.landmark), a: iso(last.value) });
      return k(`w.${last.model}`, { typed: iso(last.value), name: nm(last.landmark) });
    }
    if (last.kind === 'pin') {
      if (last.ok === undefined) return k('v.pin', { o: iso(last.origin) });
      return last.ok ? k('v.oppOk', { a: iso(last.a), b: iso(last.b) }) : k('v.oppNo', { a: iso(last.a), b: iso(last.b) });
    }
    if (last.kind === 'step') return last.ok ? k('v.stepOk', { s: iso(last.step) }) : k('v.stepNo', { s: iso(last.step), off: last.off, between: last.between });
    if (last.kind === 'tap') return last.ok ? k('v.tapOk', { name: last.landmark }) : k('v.tapNo', { name: last.landmark });
    if (last.kind === 'custom') return k('v.custom');
    return k('idle');
  })();
  const bad = !!last && last.ok === false && !last.free;
  const good = !!last && last.ok === true && !last.free;
  const tone = bad ? 'amber' : good ? 'emerald' : 'indigo';
  const Icon = bad ? Sparkles : good ? CheckCircle2 : Hand;
  const canNext = L.canNext(lab) && !cp.blocking;
  const mood = bad ? 'wonder' : done ? 'proud' : 'happy';
  const banner = (
    <VerdictBanner tone={tone} icon={Icon} size="sm" className="min-h-[3.2rem]" data-cr-verdict={bad ? 'wrong' : good ? 'right' : last?.free ? 'free' : ''}>
      <div className="flex min-w-0 items-center gap-2">
        <svg width={40} height={50} viewBox="0 0 40 52" aria-hidden="true" data-cr-kid data-mood={mood} className="shrink-0">
          <Guide x={20} y={50} mood={mood} girl={!advanced} />
        </svg>
        <div className="min-w-0 space-y-1.5">
          <p className={last ? '' : 'font-bold text-indigo-900'}>{verdictLine}</p>
          {canNext && (
            <button type="button" onClick={() => setLab(L.nextTask)} data-cr-next
              className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-2 border-emerald-600 bg-emerald-600 px-3.5 text-sm font-black text-white shadow-[0_3px_0_0_#047857] transition-all duration-150 active:translate-y-0.5 motion-reduce:transition-none ${ring}`}>
              {k('next')} <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </VerdictBanner>
  );

  return (
    <>
      <div className="relative space-y-2" data-cr-glance>
        {party.node}
        {cp.node}
        {prompt}
        <StageFrame className="min-w-0 overflow-hidden p-2" data-cr-stage>
          <Stage lab={lab} setLab={setLab} k={k} width={Math.max(300, width - 16)} advanced={advanced} />
        </StageFrame>
        {advanced || free ? <LeverRow lab={lab} setLab={setLab} k={k} /> : null}
        {!advanced && !free ? <BeginnerRow lab={lab} setLab={setLab} k={k} /> : null}
        {banner}
      </div>
      <FreeCard lab={lab} setLab={setLab} k={k} />
    </>
  );
}

/* ══════════════ La scène : le front de mer et la planche ══════════════ */

function Stage({ lab, setLab, k, width }) {
  const uid = `cr${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const svgRef = useRef(null);
  const W = width;
  const H = SCENE_H;
  const pad = 30;
  const cw = (W - pad * 2) / 12;
  const xc = W / 2;
  const task = L.taskOf(lab);
  const free = L.isFree(lab);
  const fit = L.isFit(lab);
  const [drag, setDrag] = useState(false);
  const stepM = Number(R.text(L.stepH(lab)).replace(',', '.'));
  const xSlot = (j) => xc + j * cw;
  const kPin = Number(lab.pin) / 1000;
  const pinX = xSlot(kPin);
  const locked = L.pinLocked(lab) || fit;

  const toSlot = (e) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r) return kPin;
    const x = (e.clientX - r.left) * (W / r.width);
    return Math.max(-6, Math.min(6, Math.round((x - xc) / cw)));
  };
  const down = (e) => { if (locked) return; e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId); setDrag(true); };
  const move = (e) => { if (drag) setLab((s) => L.setPin(s, toSlot(e) * 1000)); };
  const up = (e) => { if (!drag) return; setDrag(false); setLab((s) => L.setPin(s, toSlot(e) * 1000)); };
  const key = (e) => {
    const map = { ArrowRight: 1, ArrowLeft: -1 };
    if (e.key in map) { e.preventDefault(); setLab((s) => L.movePin(s, map[e.key])); }
    if (e.key === 'Home') { e.preventDefault(); setLab((s) => L.setPin(s, -6000)); }
    if (e.key === 'End') { e.preventDefault(); setLab((s) => L.setPin(s, 6000)); }
  };

  /* les graduations : tous les nombres sont des SORTIES du drapeau ou du levier */
  const showLabels = !fit || free || lab.confirmed;
  const tickLabel = (j) => {
    if (fit) return R.text(BigInt(j) * L.stepH(lab));
    return R.text(BigInt(j - kPin) * 1000n);
  };
  const labelShown = (j) => (fit ? (showLabels && (j % 2 === 0 || cw >= 34)) : (j - kPin) % 2 === 0 && j !== kPin);

  /* les repères / points */
  const items = fit
    ? L.marksOf(lab).map((m, i) => {
      const v = Number(m.x) / 100;
      const cell = v / stepM;
      const off = Math.abs(cell) > 6;
      const c = Math.max(-6.55, Math.min(6.55, cell));
      return { id: m.id, x: xSlot(c), off, between: !off && Math.abs(cell - Math.round(cell)) > 1e-9, cell, color: ['#4F46E5', '#B45309', '#047857', '#BE185D'][i % 4] };
    })
    : [...new Set([...(task.ask ?? []), ...(task.pair ?? []), ...(task.target != null ? ['bench'] : []), 'fountain'])].map((id) => {
      const m = L.markById(lab, id);
      const cell = Number(m.x) / 1000;
      return { id, x: xSlot(cell), between: Math.abs(cell - Math.round(cell)) > 1e-9, cell };
    });
  const askId = L.currentAsk(lab);
  const tapId = L.currentTap(lab);
  const pairIds = !free && task.pair ? task.pair : [];
  const ghost = !fit && lab.ghost && !L.taskDone(lab) ? lab.ghost : null;
  const ghostX = ghost ? pinX + (Number(ghost.at) / 100) / 10 * cw : null;

  return (
    <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: W, display: 'block', margin: '0 auto', touchAction: 'pan-y' }}
      role="img" aria-label={k('stageAria')} data-cr-svg dir="ltr">
      <Backdrop W={W} yRail={Y_RAIL} yFoot={Y_FOOT} uid={uid} />
      {/* la planche */}
      <rect x={xSlot(-6) - 12} y={Y_STRIP} width={cw * 12 + 24} height={STRIP_H} rx={5} fill={COL.woodLight} stroke={COL.woodDark} strokeWidth={1.5} />
      <defs>
        <pattern id={`${uid}-hatch`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="3" height="6" fill="#B91C1C" opacity="0.55" /></pattern>
      </defs>
      {/* les cases hachurées : un repère entre deux graduations */}
      {items.filter((it) => it.between).map((it) => (
        <rect key={`h${it.id}`} x={xSlot(Math.floor(it.cell))} y={Y_STRIP + 1} width={cw} height={STRIP_H - 2} fill={`url(#${uid}-hatch)`} data-cr-hatch={it.id} />
      ))}
      {Array.from({ length: 13 }, (_, i) => i - 6).map((j) => (
        <g key={j} aria-hidden="true">
          <line x1={xSlot(j)} x2={xSlot(j)} y1={Y_STRIP} y2={Y_STRIP + (j === kPin && !fit ? STRIP_H : 14)} stroke={COL.woodDark} strokeWidth={j === 0 && fit ? 2.5 : 1.6} />
          {labelShown(j) && <text x={xSlot(j)} y={Y_STRIP + STRIP_H + 14} textAnchor="middle" fontSize={11} fontWeight={800} fill="#334155" direction="ltr">{tickLabel(j).replace(/-/g, '−')}</text>}
        </g>
      ))}
      {fit && <text x={xSlot(0)} y={Y_STRIP + STRIP_H + 14} textAnchor="middle" fontSize={12} fontWeight={900} fill={COL.flag}>{showLabels ? '' : '0'}</text>}
      {/* les repères et leurs fils à plomb */}
      {!fit && items.map((it) => (
        <g key={it.id} data-cr-landmark={it.id} data-abscissa={R.text(L.abscissa(lab, it.id))}>
          <Landmark id={it.id} x={it.x} y={Y_FOOT + 8} lit={it.id === askId || pairIds.includes(it.id)} />
          <line x1={it.x} x2={it.x} y1={Y_FOOT + 10} y2={Y_STRIP} stroke="#475569" strokeWidth={1.4} strokeDasharray="3 3" />
          {(it.id === askId || pairIds.includes(it.id)) && <SvgPill x={it.x} y={Y_FOOT - 50} text={k(`lm.${it.id}`)} fill="#0F766E" size={11} />}
        </g>
      ))}
      {ghost && (
        <g className="cr-ghost" data-cr-ghost data-model={ghost.kind} aria-hidden="true">
          <circle cx={ghostX} cy={Y_FOOT - 14} r={12} fill="none" stroke="#B45309" strokeWidth={2} strokeDasharray="4 3" />
          <line x1={ghostX} x2={ghostX} y1={Y_FOOT - 2} y2={Y_STRIP} stroke="#B45309" strokeWidth={1.4} strokeDasharray="2 3" />
          <text x={ghostX} y={Y_FOOT - 10} textAnchor="middle" fontSize={12} fontWeight={900} fill="#B45309">؟</text>
        </g>
      )}
      {fit && items.map((it) => (
        <g key={it.id} data-cr-point={it.id} data-off={it.off ? 'true' : undefined}>
          <Pennant x={it.x} y={Y_STRIP - 4} text={it.id} color={it.color} off={it.off} />
          {it.off && <text x={it.x + (it.cell < 0 ? 34 : -34)} y={Y_STRIP - 34} textAnchor="middle" fontSize={10} fontWeight={900} fill="#B91C1C" data-cr-off>{it.cell < 0 ? '◀' : '▶'} {k('off')}</text>}
          {it.id === tapId && <circle cx={it.x} cy={Y_STRIP - 14} r={13} fill="none" stroke="#059669" strokeWidth={2.5} />}
        </g>
      ))}
      {/* les touches des graduations (متقدم : après avoir fixé la graduation) */}
      {tapId && Array.from({ length: 13 }, (_, i) => i - 6).map((j) => (
        <rect key={`c${j}`} x={xSlot(j) - cw / 2} y={Y_STRIP - 6} width={cw} height={STRIP_H + 12} fill="transparent" style={{ cursor: 'pointer' }}
          onClick={() => setLab((s) => L.tapCell(s, j))} data-cr-cell={j} role="button" aria-label={k('cellAria', { n: j })} />
      ))}
      {/* le drapeau « 0 » */}
      {!fit && (
        <g>
          <PinFlag x={pinX} y={Y_STRIP + 4} active={drag} locked={locked} label="0" />
          <rect x={pinX - 22} y={Y_STRIP - 34} width={44} height={STRIP_H + 40} fill="transparent" style={{ cursor: locked ? 'not-allowed' : drag ? 'grabbing' : 'grab', touchAction: 'none' }}
            role="slider" tabIndex={0} aria-label={k('pinAria')} aria-valuemin={-6} aria-valuemax={6} aria-valuenow={kPin} aria-valuetext={k('pinValue', { o: iso(R.text(lab.pin)) })} aria-disabled={locked ? true : undefined}
            onKeyDown={key} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} data-cr-pin />
        </g>
      )}
    </svg>
  );
}

/* ══════════════ Les commandes ══════════════ */

function BeginnerRow({ lab, setLab, k }) {
  const [text, setText] = useState('');
  const task = L.taskOf(lab);
  const can = L.canRead(lab) && !L.taskDone(lab);
  useEffect(() => { setText(''); }, [lab.ti, lab.ai, lab.pin]);
  const hasAsk = task.kind === 'read' || task.kind === 'move';
  const submit = () => { if (text.trim() && can) { setLab((s) => L.answerRead(s, text)); } };
  const locked = L.pinLocked(lab);
  return (
    <LabCard className="flex flex-wrap items-center gap-2 p-2" data-cr-controls>
      <div className="flex items-center gap-1.5" dir="ltr" role="group" aria-label={k('pinGroup')}>
        <button type="button" onClick={() => setLab((s) => L.movePin(s, -1))} disabled={locked} aria-label={k('pinLess')} data-cr-pin-less
          className={`flex h-11 w-11 items-center justify-center rounded-full border-2 border-indigo-200 bg-white text-indigo-900 disabled:opacity-40 ${ring}`}><Minus className="h-5 w-5" aria-hidden="true" /></button>
        <span className="flex min-w-[84px] flex-col items-center rounded-2xl bg-[#F5F6FF] px-2 py-1 text-center" data-cr-origin>
          {locked ? <Lock className="h-4 w-4 text-slate-500" aria-hidden="true" /> : <Anchor className="h-4 w-4 text-rose-600" aria-hidden="true" />}
          <span className="text-[11px] font-black text-indigo-900/70">{k('pinWord')}</span>
        </span>
        <button type="button" onClick={() => setLab((s) => L.movePin(s, 1))} disabled={locked} aria-label={k('pinMore')} data-cr-pin-more
          className={`flex h-11 w-11 items-center justify-center rounded-full border-2 border-indigo-200 bg-white text-indigo-900 disabled:opacity-40 ${ring}`}><Plus className="h-5 w-5" aria-hidden="true" /></button>
      </div>
      {hasAsk && (
        <div className="flex min-w-0 flex-1 items-center gap-2" style={{ minWidth: 200 }}>
          <label className="flex items-center gap-1.5 text-sm font-black text-indigo-950">
            <span className="whitespace-nowrap">{k('askLabel')}</span>
            <input type="text" inputMode="decimal" autoComplete="off" dir="ltr" value={text} disabled={!can} maxLength={7}
              onChange={(e) => setText(e.target.value.replace(/[^0-9٠-٩\-−+,.٫]/g, ''))}
              onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
              aria-label={k('answerAria')} data-cr-answer
              className={`h-11 w-20 rounded-xl border-2 border-indigo-300 bg-white px-2 text-center text-xl font-black tabular-nums text-indigo-950 disabled:bg-slate-100 ${ring}`} />
          </label>
          <button type="button" onClick={submit} disabled={!can || !text.trim()} data-cr-check
            className={`inline-flex min-h-[44px] items-center justify-center rounded-2xl border-2 border-indigo-600 bg-indigo-600 px-4 text-sm font-black text-white shadow-[0_3px_0_0_#3730A3] disabled:opacity-40 ${ring}`}>{k('check')}</button>
        </div>
      )}
      {!hasAsk && !L.taskDone(lab) && <p className="w-full text-xs font-bold text-slate-600">{k('moveOnly')}</p>}
      {hasAsk && !can && !L.taskDone(lab) && <p className="w-full text-xs font-bold text-amber-800">{k('moveFirst')}</p>}
    </LabCard>
  );
}

function LeverRow({ lab, setLab, k }) {
  const free = L.isFree(lab);
  const locked = !free && lab.confirmed;
  return (
    <LabCard className="space-y-1.5 p-2" data-cr-controls>
      <div className="flex items-center gap-2" dir="ltr">
        <button type="button" onClick={() => setLab((s) => L.stepBy(s, -1))} disabled={locked || lab.step <= 0} aria-label={k('leverLess')} data-cr-less
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-indigo-200 bg-white text-indigo-900 disabled:opacity-40 ${ring}`}><Minus className="h-5 w-5" aria-hidden="true" /></button>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <input type="range" min={0} max={L.NOTCHES.length - 1} step={1} value={lab.step} disabled={locked} data-cr-lever
            onChange={(e) => setLab((s) => L.setStep(s, Number(e.target.value)))} aria-label={k('leverAria')} aria-valuetext={iso(`${L.stepText(lab)} m`)}
            className={`h-8 w-full accent-amber-600 ${ring}`} />
          <div className="flex justify-between px-1 text-[9px] font-black text-amber-900/70" aria-hidden="true">
            {L.NOTCHES.map((n, i) => <span key={n} className={i === lab.step ? 'text-amber-700' : ''}>{n}</span>)}
          </div>
        </div>
        <button type="button" onClick={() => setLab((s) => L.stepBy(s, 1))} disabled={locked || lab.step >= L.NOTCHES.length - 1} aria-label={k('leverMore')} data-cr-more
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-indigo-600 bg-indigo-600 text-white disabled:opacity-40 ${ring}`}><Plus className="h-5 w-5" aria-hidden="true" /></button>
      </div>
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-baseline gap-1.5 text-sm font-black text-indigo-950" data-cr-stepvalue><span>{k('stepWord')}</span> <bdi dir="ltr" key={lab.step} className="cr-pop text-xl tabular-nums">{L.stepText(lab).replace(/-/g, '−')} <span className="text-xs">m</span></bdi></p>
        {!free && (
          <button type="button" onClick={() => setLab(L.confirmStep)} disabled={lab.confirmed} data-cr-confirm
            className={`inline-flex min-h-[44px] items-center justify-center rounded-2xl border-2 border-emerald-600 bg-emerald-600 px-3 text-sm font-black text-white shadow-[0_3px_0_0_#047857] disabled:opacity-40 ${ring}`}>{k('confirm')}</button>
        )}
      </div>
    </LabCard>
  );
}

/* ══════════════ « جرّب أعدادك » : toujours ouvert ══════════════ */

function FreeCard({ lab, setLab, k }) {
  const free = L.isFree(lab);
  const [text, setText] = useState('');
  useEffect(() => { if (!lab.free) setText(''); }, [lab.free]);
  const bad = text.trim() !== '' && !L.parseFree(text);
  const info = free ? L.fit(lab) : null;
  const onText = (e) => {
    const raw = e.target.value.replace(/[^0-9٠-٩\-−,.٫\s]/g, '').slice(0, 28);
    setText(raw);
    if (L.parseFree(raw)) setLab((s) => L.setFree(s, raw));
  };
  return (
    <LabCard className="space-y-2 border-emerald-200 bg-emerald-50/50 p-3" data-cr-free data-active={free ? 'true' : 'false'}>
      <p className="flex items-center gap-1.5 text-sm font-black text-emerald-900"><FlaskConical className="h-4 w-4" aria-hidden="true" /> {k('free.title')}</p>
      <p className="text-xs font-bold leading-snug text-slate-600">{free ? k('free.on') : k('free.hint')}</p>
      <div className="flex flex-wrap items-center gap-3">
        <input type="text" inputMode="decimal" autoComplete="off" dir="ltr" value={text} onChange={onText} aria-label={k('free.aria')} aria-invalid={bad} data-cr-free-input placeholder="−35  20  0,5"
          className={`h-11 w-48 rounded-xl border-2 ${bad ? 'border-rose-300' : 'border-emerald-300'} bg-white px-3 text-center text-lg font-black tabular-nums text-indigo-950 ${ring}`} />
        {bad && <span className="text-xs font-bold text-rose-700">{k('free.bad')}</span>}
        {info && <span className="text-xs font-black text-emerald-900" data-cr-free-info>{k('free.info', { off: info.off.length, between: info.between.length })}</span>}
        {free && (
          <button type="button" onClick={() => setLab(L.toGuided)} data-cr-free-back
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
const Mx = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;

export function ruleOptions(lab, k, advanced) {
  const key = advanced ? 'step' : 'origin';
  return opt([k(`discovery.${key}.right`), k(`discovery.${key}.wrongA`), k(`discovery.${key}.wrongB`)], 0, [null, k(`discovery.${key}.whyA`), k(`discovery.${key}.whyB`)], advanced ? 1 : 2);
}

export function Formal({ k, advanced }) {
  if (advanced) {
    return (
      <div className="space-y-2 text-sm font-bold text-emerald-950" data-cr-formal="step">
        <p className="text-center text-base" dir="ltr"><MathText>{$('-50\\div 25=-2\\ ;\\ 75\\div 25=3\\ ;\\ 150\\div 25=6')}</MathText></p>
        <p><MathText>{k('formal.step')}</MathText></p>
      </div>
    );
  }
  return (
    <div className="space-y-2 text-sm font-bold text-emerald-950" data-cr-formal="origin">
      <p className="text-center text-base" dir="ltr"><MathText>{$('K(+30)\\ ,\\ B(-20)\\ ;\\ (-30)\\ ,\\ (+30)')}</MathText></p>
      <p><MathText>{k('formal.origin')}</MathText></p>
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite d'une tâche (par son id : les tâches viennent de la leçon). La dernière tâche de chaque niveau finit par LA RÈGLE. */
export const CHAINS = Object.freeze({
  b1: ['count', 'unit', 'whyNeg'],
  b2: ['didMove', 'whyChange'],
  b3: ['dist', 'name'],
  b4: ['between', 'ruleB'],
  m1: ['count', 'ruleB'],      // معارف : le labo posé seul
  a1: ['whyNot'],
  a2: ['whyNot'],
  a3: ['whyNot', 'rule'],
});

/** Les options : `texts[0]` est la bonne, les autres ont leur réfutation `whys[i]` ; la bonne est posée à la place `at` (jamais toujours la première). */
const opt = (texts, right, whys, at = 0) => {
  const list = texts.map((text, i) => (i === right ? { text, correct: true } : { text, why: whys[i] }));
  const [good] = list.splice(right, 1);
  list.splice(at % (list.length + 1), 0, good);
  return list;
};
const absT = (h) => R.text(h < 0n ? -h : h);
/** L'abscisse d'un repère à la fin de la tâche (celle que l'élève a trouvée). */
const originOf = (lab, task) => { const tr = lab.solved[lab.tasks.indexOf(task)]; return tr?.origin != null ? R.parse(tr.origin) : task.pin; };
const abs = (lab, task, id) => R.abscissaOf(L.markById(lab, id).x, originOf(lab, task));

export const QUESTIONS = {
  count: (lab, task, k) => {
    const a = abs(lab, task, task.ask[0]);
    const n = Number(a / 1000n);
    const o = { name: k(`lm.${task.ask[0]}`), n, a: iso(R.text(a)) };
    return {
      id: 'count', kind: 'choice', cols: 3, prompt: Mx(k, 'count.prompt', o),
      options: opt([String(n), String(n * 10), String(n - 1)].map((x) => <bdi key={x} dir="ltr">{x}</bdi>), 0, [null, Mx(k, 'count.whyTen', o), Mx(k, 'count.whyLess', o)], 1),
      hints: [Mx(k, 'count.hint1', o), Mx(k, 'count.hint2', o)], explain: Mx(k, 'count.explain', o),
    };
  },
  unit: (lab, task, k) => {
    const a = abs(lab, task, task.ask[0]);
    const o = { n: Number(a / 1000n), a: iso(R.text(a)) };
    return {
      id: 'unit', kind: 'choice', cols: 3, prompt: Mx(k, 'unit.prompt', o),
      options: opt(['10', '1', R.text(a)].map((x) => <bdi key={x} dir="ltr">{x} m</bdi>), 0, [null, Mx(k, 'unit.whyOne', o), Mx(k, 'unit.whyAll', o)], 2),
      hints: [Mx(k, 'unit.hint1', o), Mx(k, 'unit.hint2', o)], explain: Mx(k, 'unit.explain', o),
    };
  },
  whyNeg: (lab, task, k) => {
    const o = { name: k(`lm.${task.ask[1]}`), a: iso(R.text(abs(lab, task, task.ask[1]))) };
    return {
      id: 'whyNeg', kind: 'choice', prompt: Mx(k, 'whyNeg.prompt', o),
      options: opt([Mx(k, 'whyNeg.left', o), Mx(k, 'whyNeg.small', o), Mx(k, 'whyNeg.close', o)], 0, [null, Mx(k, 'whyNeg.whySmall', o), Mx(k, 'whyNeg.whyClose', o)], 0),
      hints: [Mx(k, 'whyNeg.hint1', o), Mx(k, 'whyNeg.hint2', o)], explain: Mx(k, 'whyNeg.explain', o),
    };
  },
  didMove: (lab, task, k) => ({
    id: 'didMove', kind: 'choice', prompt: Mx(k, 'didMove.prompt'),
    options: opt([Mx(k, 'didMove.no'), Mx(k, 'didMove.right'), Mx(k, 'didMove.left')], 0, [null, Mx(k, 'didMove.whyRight'), Mx(k, 'didMove.whyLeft')], 1),
      hints: [Mx(k, 'didMove.hint1'), Mx(k, 'didMove.hint2')], explain: Mx(k, 'didMove.explain'),
  }),
  whyChange: (lab, task, k) => {
    const o = { before: iso(R.text(R.abscissaOf(L.markById(lab, task.ask[0]).x, task.pin))), after: iso(R.text(abs(lab, task, task.ask[0]))) };
    return {
      id: 'whyChange', kind: 'choice', prompt: Mx(k, 'whyChange.prompt', o),
      options: opt([Mx(k, 'whyChange.origin', o), Mx(k, 'whyChange.moved', o), Mx(k, 'whyChange.step', o)], 0, [null, Mx(k, 'whyChange.whyMoved', o), Mx(k, 'whyChange.whyStep', o)], 2),
      hints: [Mx(k, 'whyChange.hint1', o), Mx(k, 'whyChange.hint2', o)], explain: Mx(k, 'whyChange.explain', o),
    };
  },
  dist: (lab, task, k) => {
    const [a, b] = task.pair.map((id) => abs(lab, task, id));
    const o = { a: iso(R.text(a)), b: iso(R.text(b)), d: iso(absT(a)), n1: k(`lm.${task.pair[0]}`), n2: k(`lm.${task.pair[1]}`) };
    return {
      id: 'dist', kind: 'choice', prompt: Mx(k, 'dist.prompt', o),
      options: opt([Mx(k, 'dist.same', o), Mx(k, 'dist.signed', o), Mx(k, 'dist.sum', o)], 0, [null, Mx(k, 'dist.whySigned', o), Mx(k, 'dist.whySum', o)], 0),
      hints: [Mx(k, 'dist.hint1', o), Mx(k, 'dist.hint2', o)], explain: Mx(k, 'dist.explain', o),
    };
  },
  name: (lab, task, k) => {
    const [a, b] = task.pair.map((id) => abs(lab, task, id));
    const o = { a: iso(R.text(a)), b: iso(R.text(b)) };
    return {
      id: 'name', kind: 'choice', cols: 1, prompt: Mx(k, 'name.prompt', o),
      options: opt([Mx(k, 'name.opposite'), Mx(k, 'name.equal'), Mx(k, 'name.next')], 0, [null, Mx(k, 'name.whyEqual', o), Mx(k, 'name.whyNext', o)], 2),
      hints: [Mx(k, 'name.hint1', o), Mx(k, 'name.hint2', o)], explain: Mx(k, 'name.explain', o),
    };
  },
  between: (lab, task, k) => {
    const a = abs(lab, task, task.ask[0]);
    const lo = R.parse(a) < 0n ? (R.parse(a) / 1000n - 1n) * 1000n : (R.parse(a) / 1000n) * 1000n;
    const o = { a: iso(R.text(a)), lo: iso(R.text(lo)), hi: iso(R.text(lo + 1000n)), lo2: iso(R.text(lo - 1000n)), hi2: iso(R.text(lo + 2000n)) };
    return {
      id: 'between', kind: 'choice', cols: 1, prompt: Mx(k, 'between.prompt', o),
      options: opt([`${o.lo} , ${o.hi}`, `${o.lo2} , ${o.lo}`, `${o.hi} , ${o.hi2}`].map((x) => <bdi key={x} dir="ltr">{x}</bdi>), 0, [null, Mx(k, 'between.whyLow', o), Mx(k, 'between.whyHigh', o)], 1),
      hints: [Mx(k, 'between.hint1', o), Mx(k, 'between.hint2', o)], explain: Mx(k, 'between.explain', o),
    };
  },
  ruleB: (lab, task, k) => ({
    id: 'ruleB', kind: 'choice', prompt: <MathText>{k('discovery.origin.prompt')}</MathText>,
    options: ruleOptions(lab, k, false).map((o) => ({ ...o, text: <MathText>{o.text}</MathText>, why: o.why && <MathText>{o.why}</MathText> })),
    hints: [<MathText key="h1">{k('rule.origin.hint1')}</MathText>, <MathText key="h2">{k('rule.origin.hint2')}</MathText>], explain: <Formal lab={lab} k={k} advanced={false} />,
  }),
  whyNot: (lab, task, k) => {
    const o = { id: task.id };
    return {
      id: 'whyNot', kind: 'choice', prompt: Mx(k, `whyNot.${task.id}.prompt`, o),
      options: opt([Mx(k, `whyNot.${task.id}.right`), Mx(k, `whyNot.${task.id}.wrongA`), Mx(k, `whyNot.${task.id}.wrongB`)], 0, [null, Mx(k, `whyNot.${task.id}.whyA`), Mx(k, `whyNot.${task.id}.whyB`)], { a1: 1, a2: 2, a3: 0 }[task.id] ?? 1),
      hints: [Mx(k, `whyNot.${task.id}.hint1`), Mx(k, `whyNot.${task.id}.hint2`)], explain: Mx(k, `whyNot.${task.id}.explain`),
    };
  },
  rule: (lab, task, k) => ({
    id: 'rule', kind: 'choice', prompt: <MathText>{k('discovery.step.prompt')}</MathText>,
    options: ruleOptions(lab, k, true).map((o) => ({ ...o, text: <MathText>{o.text}</MathText>, why: o.why && <MathText>{o.why}</MathText> })),
    hints: [<MathText key="h1">{k('rule.step.hint1')}</MathText>, <MathText key="h2">{k('rule.step.hint2')}</MathText>], explain: <Formal lab={lab} k={k} advanced />,
  }),
};
