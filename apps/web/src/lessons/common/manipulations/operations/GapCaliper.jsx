import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Hand, CheckCircle2, Sparkles, ChevronLeft, FlaskConical, Undo2, Minus, Plus, ArrowUp, ArrowDown, Lock } from 'lucide-react';
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
import { Board, Station, Bead, Caliper, Observer, COL } from './gapCaliper/art';
import { LEVELS } from '../levels';
import * as L from '../logic/gapCaliper';

/**
 * gap-caliper — L'OUVERTURE D'UN COMPAS SOUS LA MAIN (2AM, unité 3 « الأعداد النسبية », درس « المسافة بين نقطتين على مستقيم مدرّج », 2026-10-29).
 * La logique, exacte, est dans `logic/gapCaliper.js` (sur `packages/core/arithmetic/relative.js`, importé par chemin).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. La main tient l'OUVERTURE du compas (toujours ≥ 0) : elle tourne la vis (glisser la mâchoire libre, − / +, clavier). À متقدم l'ouverture est ÉCRITE avant la vis, et une ouverture fixe se BALANCE vers le haut ou vers le bas.
 * B. La distance est une SORTIE du compas serré sur UNE graine : la mâchoire libre se pose à a ± d ; elle ne touche la seconde graine que pour la bonne ouverture.
 * C. La résistance : une ouverture ne peut pas être négative (mâchoires croisées) ; le compas qui traverse le zéro additionne deux morceaux ; une ouverture fixe donne DEUX points.
 * D. La phase formelle écrit ce que l'élève a trouvé avec SES nombres (la dernière question du labo, la règle).
 * E. Les fausses réponses sont rendues VISIBLES : la mâchoire s'arrête avant la graine (ou la dépasse), les mâchoires se croisent, le fantôme montre où mène la valeur écrite.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        la distance entre deux points d'une droite graduée = abscisse la plus grande − la plus petite ; positive ; AB = BA
 *   OBJECT         un grand thermomètre, des graines étiquetées, un compas en laiton à vis
 *   VARIABLE       l'ouverture du compas (pas 1 à مبتدئ, 0,5 à متقدم) et, pour une ouverture fixe, le sens du balancement
 *   INVARIANT      les graines (leurs lectures) ; la graduation du thermomètre
 *   TRANSFORMATION l'ouverture traverse le zéro (deux morceaux) ; on serre le compas sur l'autre graine : la même ouverture
 *   CONSTRAINT     l'ouverture ≥ 0 et la mâchoire reste sur le thermomètre (−10 … +12)
 *   RESISTANCE     la mâchoire qui s'arrête court ou dépasse ; le négatif refusé ; un seul point trouvé sur deux
 *   EVIDENCE       la lecture de la mâchoire, la bande coupée au zéro, le fantôme d'une erreur
 *   PREDICTION     متقدم : l'ouverture est écrite AVANT de tourner la vis
 *   FORMALIZATION  « الفاصلة الكبرى ناقص الفاصلة الصغرى » ; « AB = BA وهي موجبة »
 *   TRANSFER       « جرّب أعدادك » (toujours ouvert), les exercices et la banque
 *
 * ONBOARDING : `coach` (défaut true) → `LabCoach` ; `logic › coachOf`. QUESTIONS PENDANT LE LABO (`LabCheckpoint`) : `CHAINS` + `QUESTIONS`, après CHAQUE tâche, avec SES nombres ;
 * la dernière suite de chaque niveau finit par LA RÈGLE. ÉTAPES : `LabStepper` (`[data-gc-step=<i>]`) + la fête. « إعادة » : tâche 1.
 * Props (contrat fixé avec la leçon) : `tasks`, `level`, `levels`, `coach`, `title`, `lead`, `onTrial(event)`, `onFinished({})`.
 *
 * CONTRAT DOM : [data-gap-caliper][data-level][data-task][data-d][data-solved], [data-gc-glance], [data-gc-stage], [data-gc-svg], [data-gc-bead=<id>][data-value], [data-gc-anchor], [data-gc-jaw][data-value],
 * [data-gc-screw] (slider, aria-valuenow = d), [data-gc-less], [data-gc-more], [data-gc-dial], [data-gc-fix], [data-gc-swing=up|down][aria-pressed], [data-gc-band], [data-gc-answer], [data-gc-input],
 * [data-gc-check], [data-gc-ghost][data-model], [data-gc-verdict], [data-gc-next], [data-gc-step=<i>], [data-gc-free], [data-gc-free-input], [data-gc-free-back], [data-gc-formal], [data-gc-kid][data-mood].
 */
const NS = 'manipulation.gapCaliper';
const LRI = '⁦';
const PDI = '⁩';
const iso = (s) => `${LRI}${String(s).replace(/-/g, '−')}${PDI}`;
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-indigo-300';
const PAD = 18;
const MIN_U = -10;
const MAX_U = 12;

const CSS = `
@keyframes gc-pop { 0% { transform: scale(0.85); } 70% { transform: scale(1.06); } 100% { transform: scale(1); } }
.gc-pop { animation: gc-pop 240ms ease-out both; display: inline-block; }
@keyframes gc-ghost { 0%,100% { opacity: .55; } 50% { opacity: .95; } }
.gc-ghost { animation: gc-ghost 1.6s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .gc-pop, .gc-ghost { animation: none !important; } }
`;

export function numbersFor({ tasks, level }) {
  const lv = resolveLevelId(level ?? 'beginner');
  const asked = LEVELS['gap-caliper'][lv].numbers;
  return { tasks: tasks ?? asked.tasks };
}

export default function GapCaliper({
  tasks, title, lead, level, levels: withLevels = true, coach: coachOn = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const initialNumbers = useMemo(() => numbersFor({ tasks, level }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'gap-caliper', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
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
  const advanced = L.isAdvanced(lab);
  const cpSettings = useLabCheckpointSettings('gap-caliper');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const chain = cpOn && cpSettings.enabled && !L.isFree(lab) ? CHAINS[cur.id] ?? null : null;
  const isRule = (q) => q === 'ruleA' || q === 'ruleB';
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
    lab: 'gap-caliper', step: coachStep,
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
    <ManipulationDiscovery state={state} prompt={<MathText>{k(`discovery.${advanced ? 'both' : 'rule'}.prompt`)}</MathText>} options={ruleOptions(lab, k, advanced)} formal={<Formal lab={lab} k={k} advanced={advanced} />} />
  );

  return (
    <ManipulationShell
      type="gap-caliper"
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
      <ManipulationStage className="bg-gradient-to-b from-amber-50/60 to-white">
        <div ref={boxRef} className="space-y-2" data-gap-caliper data-level={advanced ? 'advanced' : 'beginner'} data-task={lab.free ? 'free' : lab.ti}
          data-d={R.text(L.dOf(lab))} data-solved={finished ? 'true' : 'false'}>
          <style dangerouslySetInnerHTML={{ __html: CSS }} />
          <Lab lab={lab} setLab={setLab} k={k} width={width} screenH={screenH} lead={state.isAuthoredLevel ? lead : null} cp={cp} advanced={advanced} />
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ══════════════ Le laboratoire ══════════════ */

const num = (h) => iso(R.text(h));
const tagOf = (k, task, which) => k(`tag.${task.id}.${which}`);

function Lab({ lab, setLab, k, width, screenH, lead, cp, advanced }) {
  const task = L.taskOf(lab);
  const free = L.isFree(lab);
  const done = L.taskDone(lab);
  const lit = !free && done;
  const last = lab.last;

  const ctx = free ? k('ctx.free') : (lead && lab.ti === 0 ? lead : k(`ctx.${task.id}`));
  const question = free ? k('q.free') : k(`q.${task.id}`);

  const stepDone = lab.tasks.map((_, i) => !!lab.done[i] && (i !== lab.ti || !cp.blocking));
  const steps = lab.tasks.length > 1 && !free && <LabStepper count={lab.tasks.length} current={lab.ti} done={stepDone} stepAttr="data-gc-step" />;
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.trials.length === 0 && celebrated.current.size) celebrated.current = new Set();
  const nowDone = !free && stepDone[lab.ti];
  useEffect(() => {
    if (!nowDone || celebrated.current.has(lab.ti)) return;
    celebrated.current.add(lab.ti);
    party.celebrate({ n: lab.ti + 1, total: lab.tasks.length });
  }, [nowDone, lab.ti]); // eslint-disable-line react-hooks/exhaustive-deps

  // le son (muet sauf « الصوت ») : un déclic par cran de la vis, un petit drapeau quand c'est juste, « over » sur un refus, la cloche à la fin
  const sfx = useRef(lab.d);
  useEffect(() => {
    if (lab.d !== sfx.current) playSfx('gesture', { pitch: lab.d > sfx.current ? 1 : 0.75 });
    sfx.current = lab.d;
  }, [lab.d]); // eslint-disable-line react-hooks/exhaustive-deps
  const nTrials = lab.trials.length;
  useEffect(() => {
    if (!nTrials) return;
    const tr = lab.trials[nTrials - 1];
    if (tr.free || tr.kind === 'swing') return;
    playSfx(tr.ok ? 'flag' : 'over');
  }, [nTrials]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (done && !free) playSfx('bell'); }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  const prompt = (
    <PromptCard size={width >= 600 ? 'lg' : 'md'} aside={steps || null} context={<MathText>{ctx}</MathText>} contextProps={{ 'data-gc-context': free ? 'free' : task.id }}
      title={<MathText>{question}</MathText>} titleClassName={width >= 600 ? 'text-lg' : 'text-base'} lamp={free ? null : lit ? 'on' : 'off'}
      titleProps={{ 'data-gc-prompt': free ? 'free' : task.id, 'data-lit': lit ? 'true' : 'false' }} />
  );

  /* ── le verdict : la CONSÉQUENCE avec les nombres de l'élève, jamais la règle ── */
  const nameOf = () => (task.kind === 'gap' ? tagOf(k, task, 'b') : '');
  const verdictLine = (() => {
    if (!last) return k(`idle.${free ? 'open' : lab.phase === 'done' ? 'open' : lab.phase}`);
    if (last.kind === 'fix') {
      if (last.ok) return k('v.fixOk', { name: nameOf() });
      return k(`v.${last.model}`, { d: iso(last.d), landed: iso(last.landed), name: nameOf() });
    }
    if (last.kind === 'predict') return last.ok ? k('v.predictOk', { v: iso(last.value) }) : k(`w.${last.model}`, { typed: iso(last.value) });
    if (last.kind === 'say') return last.ok ? k('v.sayOk', { v: iso(last.value) }) : k(`w.${last.model}`, { typed: iso(last.value) });
    if (last.kind === 'swing') return k('v.swing');
    if (last.kind === 'found') return last.ok ? k('v.foundOk', { v: iso(last.value) }) : k(`wf.${last.model}`, { typed: iso(last.value) });
    if (last.kind === 'custom') return k('v.custom');
    return k('idle.open');
  })();
  const bad = !!last && last.ok === false && !last.free;
  const good = !!last && last.ok === true && !last.free;
  const tone = bad ? 'amber' : good ? 'emerald' : 'indigo';
  const Icon = bad ? Sparkles : good ? CheckCircle2 : Hand;
  const canNext = L.canNext(lab) && !cp.blocking;
  const mood = bad ? 'wonder' : done ? 'proud' : 'happy';
  const banner = (
    <VerdictBanner tone={tone} icon={Icon} size="sm" className="min-h-[3.2rem]" data-gc-verdict={bad ? 'wrong' : good ? 'right' : last?.free ? 'free' : ''}>
      <div className="flex min-w-0 items-center gap-2">
        <svg width={40} height={50} viewBox="0 0 40 52" aria-hidden="true" data-gc-kid data-mood={mood} className="shrink-0">
          <Observer x={20} y={50} mood={mood} girl={!advanced} />
        </svg>
        <div className="min-w-0 space-y-1.5">
          <p className={last ? '' : 'font-bold text-indigo-900'}>{verdictLine}</p>
          {canNext && (
            <button type="button" onClick={() => setLab(L.nextTask)} data-gc-next
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
      <div className="relative space-y-2" data-gc-glance>
        {party.node}
        {cp.node}
        {prompt}
        <StageFrame className="min-w-0 overflow-hidden p-2" data-gc-stage>
          <Stage lab={lab} setLab={setLab} k={k} width={Math.max(300, width - 16)} screenH={screenH} />
        </StageFrame>
        {!free ? <Controls lab={lab} setLab={setLab} k={k} /> : null}
        {banner}
      </div>
      <FreeCard lab={lab} setLab={setLab} k={k} />
    </>
  );
}

/* ══════════════ La scène : le thermomètre, les graines et le compas ══════════════ */

const toU = (h) => Number(h) / 100;
const sgn = (h) => { const x = R.text(h); return h > 0n ? `+${x}` : x; };

function Stage({ lab, setLab, k, width, screenH }) {
  const uid = `gc${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const svgRef = useRef(null);
  const task = L.taskOf(lab);
  const free = L.isFree(lab);
  const W = width;
  const H = Math.max(236, Math.min(380, Math.floor(screenH * 0.34)));
  const u = (H - PAD * 2 - 22) / (MAX_U - MIN_U);
  const y0 = PAD;
  const y1 = PAD + (MAX_U - MIN_U) * u;
  const Y = (h) => PAD + (MAX_U - toU(h)) * u;
  const sx = Math.round(W * 0.58);
  const rx = sx - 56;
  const anchor = L.anchorOf(lab);
  const target = L.targetOf(lab);
  const jaw = L.jawAt(lab);
  const d = L.dOf(lab);
  const locked = !L.screwOpen(lab);
  const [drag, setDrag] = useState(false);
  const labelStep = u >= 15 ? 1 : 2;
  const half = L.isAdvanced(lab) && u >= 13;
  const swing = !free && task.kind === 'swing';
  const showJaw = free || lab.moved || lab.phase !== 'predict' || task.kind === 'swing';
  const info = L.freeInfo(lab);
  const crossesZero = (anchor < 0n && jaw > 0n) || (anchor > 0n && jaw < 0n);

  const toValue = (e) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r) return null;
    const y = (e.clientY - r.top) * (H / r.height);
    return BigInt(Math.round((MAX_U - (y - PAD) / u) * 100));
  };
  const down = (e) => {
    if (locked) return;
    const v = toValue(e);
    if (v === null) return;
    e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId); setDrag(true);
    setLab((s) => L.dragTo(s, v));
  };
  const move = (e) => { if (!drag) return; const v = toValue(e); if (v !== null) setLab((s) => L.dragTo(s, v)); };
  const up = (e) => { if (!drag) return; setDrag(false); const v = toValue(e); if (v !== null) setLab((s) => L.dragTo(s, v)); };
  const key = (e) => {
    const grow = L.dirOf(lab) === 'up' ? 'ArrowUp' : 'ArrowDown';
    const shrink = L.dirOf(lab) === 'up' ? 'ArrowDown' : 'ArrowUp';
    if (e.key === grow || e.key === 'ArrowRight') { e.preventDefault(); setLab((s) => L.openBy(s, 1)); }
    else if (e.key === shrink || e.key === 'ArrowLeft') { e.preventDefault(); setLab((s) => L.openBy(s, -1)); }
    else if (e.key === 'PageUp') { e.preventDefault(); setLab((s) => L.openBy(s, 5)); }
    else if (e.key === 'PageDown') { e.preventDefault(); setLab((s) => L.openBy(s, -5)); }
  };

  const ghost = lab.ghost && !L.taskDone(lab) ? lab.ghost : null;
  const zeroY = Y(0n);
  const bandX = rx + 6;
  const bandW = sx - 9 - bandX;
  const segs = (() => {
    const lo = anchor < jaw ? anchor : jaw; const hi = anchor < jaw ? jaw : anchor;
    if (hi === lo) return [];
    if (lo < 0n && hi > 0n) return [{ from: lo, to: 0n, side: 'below' }, { from: 0n, to: hi, side: 'above' }];
    return [{ from: lo, to: hi, side: hi <= 0n ? 'below' : 'above' }];
  })();
  const beadTag = (id, h, color, lit) => (
    <g key={id} data-gc-bead={id} data-value={R.text(h)} {...(id === 'a' ? { 'data-gc-anchor': '' } : {})}>
      <Bead x={sx} y={Y(h)} color={color} lit={lit} />
    </g>
  );
  const foundBeads = swing ? ['up', 'down'].filter((dr) => lab.found[dr]).map((dr) => (dr === 'up' ? task.anchor + task.d : task.anchor - task.d)) : [];

  return (
    <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: W, display: 'block', margin: '0 auto', touchAction: 'pan-y' }}
      role="img" aria-label={k('stageAria')} data-gc-svg dir="ltr">
      <Board x={4} y={4} w={W - 8} h={H - 8} sx={sx} y0={y0} y1={y1} uid={uid} />
      <Station x={16} y={26} />
      {/* les graduations */}
      <g aria-hidden="true">
        {Array.from({ length: MAX_U - MIN_U + 1 }, (_, i) => MIN_U + i).map((v) => {
          const yy = PAD + (MAX_U - v) * u;
          return (
            <g key={v}>
              <line x1={sx - 7} x2={sx + 7} y1={yy} y2={yy} stroke={COL.tubeEdge} strokeWidth={v === 0 ? 0 : 1} />
              {(v % labelStep === 0) && v !== 0 && <text x={sx + 12} y={yy + 3.5} fontSize={10} fontWeight={800} fill="#64748B" style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{String(v).replace(/-/g, '−')}</text>}
              {half && v < MAX_U && <line x1={sx - 4} x2={sx + 4} y1={yy + u / 2} y2={yy + u / 2} stroke={COL.tubeEdge} strokeWidth={0.8} />}
            </g>
          );
        })}
        <line x1={14} x2={W - 14} y1={zeroY} y2={zeroY} stroke={COL.zero} strokeWidth={2.2} />
        <text x={sx + 12} y={zeroY - 4} fontSize={11} fontWeight={900} fill={COL.zero}>0</text>
      </g>
      {/* la bande entre les mâchoires, coupée au zéro */}
      {showJaw && segs.map((sg, i) => {
        const ya = Y(sg.to); const yb = Y(sg.from);
        const hh = yb - ya;
        return (
          <g key={i} data-gc-band={sg.side} data-from={R.text(sg.from)} data-to={R.text(sg.to)} aria-hidden="true">
            <rect x={bandX} y={ya} width={bandW} height={Math.max(1, hh)} fill={sg.side === 'above' ? COL.above : COL.below} opacity={0.28} />
            {segs.length === 2 && hh >= 16 && <text x={bandX + bandW / 2} y={ya + hh / 2 + 4} textAnchor="middle" fontSize={12} fontWeight={900} fill={sg.side === 'above' ? '#166534' : '#9A3412'} style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{R.text(sg.to - sg.from)}</text>}
          </g>
        );
      })}
      {/* les graines */}
      {free && info && <>
        {beadTag('a', anchor, COL.anchor, false)}
        {beadTag('b', free ? lab.free.b : anchor, COL.target, false)}
      </>}
      {!free && task.kind === 'gap' && <>
        {beadTag('a', task.anchor, COL.anchor, false)}
        {beadTag('b', task.target, COL.target, lab.phase === 'open' && !lab.moved)}
        <SvgPill x={sx + 34} y={Y(task.anchor)} text={tagOf(k, task, 'a')} fill="#B45309" size={11} anchor="start" />
        <SvgPill x={sx + 34} y={Y(task.target)} text={tagOf(k, task, 'b')} fill="#0F766E" size={11} anchor="start" />
      </>}
      {swing && <>
        {beadTag('a', task.anchor, COL.anchor, false)}
        <SvgPill x={sx + 34} y={Y(task.anchor)} text={tagOf(k, task, 'a')} fill="#B45309" size={11} anchor="start" />
        {foundBeads.map((h) => <g key={R.text(h)} data-gc-bead="found" data-value={R.text(h)}><Bead x={sx} y={Y(h)} color={COL.target} lit /></g>)}
      </>}
      {/* les mâchoires */}
      {!(lab.phase === 'predict' && !free) && <Caliper rx={rx} tx={sx} yA={Y(anchor)} yB={Y(jaw)} locked={locked} active={drag} />}
      {lab.phase === 'predict' && !free && <Caliper rx={rx} tx={sx} yA={Y(anchor)} yB={Y(anchor)} locked />}
      {showJaw && !(lab.phase === 'predict' && !free) && (
        <g data-gc-jaw data-value={R.text(jaw)}>
          <SvgPill x={rx - 20} y={Y(jaw)} text={sgn(jaw).replace(/-/g, '−')} fill={crossesZero ? '#7C3AED' : '#4F46E5'} size={11} anchor="end" />
        </g>
      )}
      {/* le fantôme d'une erreur */}
      {ghost?.kind === 'miss' && target !== null && (
        <g className="gc-ghost" data-gc-ghost data-model={ghost.model} aria-hidden="true">
          <line x1={rx + 10} x2={rx + 10} y1={Y(jaw)} y2={Y(target)} stroke={COL.miss} strokeWidth={2.2} strokeDasharray="4 3" />
          <text x={rx + 24} y={(Y(jaw) + Y(target)) / 2 + 4} fontSize={14} fontWeight={900} fill={COL.miss}>؟</text>
        </g>
      )}
      {ghost?.kind === 'jaw' && (
        <g className="gc-ghost" data-gc-ghost data-model={ghost.model} aria-hidden="true">
          <path d={`M${rx} ${Y(ghost.landed)} H${sx - 9}`} stroke={COL.miss} strokeWidth={3} strokeDasharray="5 3" />
          <circle cx={sx} cy={Y(ghost.landed)} r={10} fill="none" stroke={COL.miss} strokeWidth={2} strokeDasharray="4 3" />
        </g>
      )}
      {ghost?.kind === 'crossed' && (
        <g className="gc-ghost" data-gc-ghost data-model="neg" aria-hidden="true">
          <line x1={rx - 8} x2={sx - 9} y1={Y(anchor) - 14} y2={Y(anchor) + 14} stroke={COL.miss} strokeWidth={3.4} />
          <line x1={rx - 8} x2={sx - 9} y1={Y(anchor) + 14} y2={Y(anchor) - 14} stroke={COL.miss} strokeWidth={3.4} />
        </g>
      )}
      {/* la poignée de la vis : glisser, ou flèches du clavier */}
      {!(lab.phase === 'predict' && !free) && !swing && (
        <rect x={rx - 24} y={Y(jaw) - 22} width={48} height={44} fill="transparent" style={{ cursor: locked ? 'not-allowed' : drag ? 'grabbing' : 'grab' }}
          role="slider" tabIndex={0} aria-label={k('screwAria')} aria-valuemin={0} aria-valuemax={R.text(L.maxD(lab)).replace(',', '.')} aria-valuenow={R.text(d).replace(',', '.')}
          aria-valuetext={k('screwValue', { d: R.text(d) })} aria-orientation="vertical" aria-disabled={locked ? true : undefined} onKeyDown={key} data-gc-screw />
      )}
      {!locked && !swing && (
        <rect x={bandX - 30} y={y0 - 6} width={bandW + 36} height={y1 - y0 + 12} fill="transparent" style={{ cursor: 'grab', touchAction: 'none' }}
          onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} data-gc-hit aria-hidden="true" />
      )}
    </svg>
  );
}

/* ══════════════ Les commandes ══════════════ */

const clean = (v) => v.replace(/[^0-9٠-٩\-−+,.٫]/g, '').slice(0, 7);

function Controls({ lab, setLab, k }) {
  const task = L.taskOf(lab);
  const done = L.taskDone(lab);
  const [text, setText] = useState('');
  useEffect(() => { setText(''); }, [lab.ti, lab.phase, lab.dir]);
  const swing = task.kind === 'swing';
  const typing = !done && (lab.phase === 'predict' || lab.phase === 'say' || swing);
  const can = typing && text.trim() !== '';
  const submit = () => { if (can) setLab((s) => (swing ? L.answerFound(s, text) : L.answerGap(s, text))); };
  const onKey = (e) => { if (e.key === 'Enter') submit(); };
  const btn = `inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-2xl border-2 px-3 text-sm font-black disabled:opacity-40 ${ring}`;
  const turning = L.screwOpen(lab);
  const askKey = lab.phase === 'predict' ? 'predict' : swing ? 'found' : 'say';
  return (
    <LabCard className="flex flex-wrap items-center gap-2 p-2" data-gc-controls>
      {swing && !done && (
        <div className="flex items-center gap-1.5" role="group" aria-label={k('swingAria')}>
          {['up', 'down'].map((dr) => (
            <button key={dr} type="button" onClick={() => setLab((s) => L.setDir(s, dr))} aria-pressed={lab.dir === dr} data-gc-swing={dr}
              className={`${btn} ${lab.dir === dr ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-indigo-300 bg-white text-indigo-900'}`}>
              {dr === 'up' ? <ArrowUp className="h-4 w-4" aria-hidden="true" /> : <ArrowDown className="h-4 w-4" aria-hidden="true" />} {k(`swing.${dr}`)}
              {lab.found[dr] && <CheckCircle2 className="h-4 w-4 text-emerald-300" aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
      {(turning || lab.phase === 'predict') && !swing && (
        <div className="flex items-center gap-1.5" role="group" aria-label={k('dialAria')}>
          {turning && <button type="button" onClick={() => setLab((s) => L.openBy(s, -1))} disabled={lab.d === 0n} data-gc-less aria-label={k('close')}
            className={`${btn} min-w-[44px] border-indigo-300 bg-white text-indigo-900`}><Minus className="h-4 w-4" aria-hidden="true" /></button>}
          <span data-gc-dial data-locked={turning ? 'false' : 'true'} className="inline-flex min-h-[44px] min-w-[5.5rem] items-center justify-center gap-1 rounded-2xl border-2 border-amber-300 bg-amber-50 px-3 text-sm font-black text-amber-900">
            {turning ? <><span className="text-xs font-bold opacity-80">{k('opening')}</span> <bdi dir="ltr" className="tabular-nums">{R.text(lab.d)}</bdi></> : <><Lock className="h-4 w-4" aria-hidden="true" /> <span className="text-xs">{k('locked')}</span></>}
          </span>
          {turning && <button type="button" onClick={() => setLab((s) => L.openBy(s, 1))} data-gc-more aria-label={k('open')}
            className={`${btn} min-w-[44px] border-indigo-300 bg-white text-indigo-900`}><Plus className="h-4 w-4" aria-hidden="true" /></button>}
          {turning && <button type="button" onClick={() => setLab(L.fix)} data-gc-fix
            className={`${btn} border-indigo-600 bg-indigo-600 text-white shadow-[0_3px_0_0_#3730A3]`}>{k('fix')}</button>}
        </div>
      )}
      {swing && !done && <span data-gc-dial data-locked="true" className="inline-flex min-h-[44px] items-center gap-1 rounded-2xl border-2 border-amber-300 bg-amber-50 px-3 text-sm font-black text-amber-900"><Lock className="h-4 w-4" aria-hidden="true" /> <span className="text-xs font-bold">{k('fixed')}</span> <bdi dir="ltr" className="tabular-nums">{R.text(task.d)}</bdi></span>}
      {typing && (
        <div className="flex items-center gap-1.5" data-gc-answer role="group" aria-label={k('answerAria')}>
          <input type="text" inputMode="decimal" autoComplete="off" dir="ltr" value={text} onChange={(e) => setText(clean(e.target.value))} onKeyDown={onKey} aria-label={k(`ask.${askKey}`)} data-gc-input
            className={`h-11 w-24 rounded-xl border-2 border-indigo-300 bg-white px-1 text-center text-lg font-black tabular-nums text-indigo-950 ${ring}`} />
          <button type="button" onClick={submit} disabled={!can} data-gc-check className={`${btn} border-indigo-600 bg-indigo-600 text-white shadow-[0_3px_0_0_#3730A3]`}>{swing ? k('fix') : k('check')}</button>
          <p className="min-w-0 text-xs font-bold text-slate-600">{k(`ask.${askKey}`)}</p>
        </div>
      )}
    </LabCard>
  );
}

/* ══════════════ « جرّب أعدادك » : toujours ouvert ══════════════ */

function FreeCard({ lab, setLab, k }) {
  const free = L.isFree(lab);
  const [text, setText] = useState('');
  useEffect(() => { if (!lab.free) setText(''); }, [lab.free]);
  const bad = text.trim() !== '' && !L.parseFree(text);
  const info = L.freeInfo(lab);
  const onText = (e) => {
    const raw = e.target.value.replace(/[^0-9٠-٩\-−,.٫؛;\s]/g, '').slice(0, 18);
    setText(raw);
    if (L.parseFree(raw)) setLab((s) => L.setFree(s, raw));
  };
  return (
    <LabCard className="space-y-2 border-emerald-200 bg-emerald-50/50 p-3" data-gc-free data-active={free ? 'true' : 'false'}>
      <p className="flex items-center gap-1.5 text-sm font-black text-emerald-900"><FlaskConical className="h-4 w-4" aria-hidden="true" /> {k('free.title')}</p>
      <p className="text-xs font-bold leading-snug text-slate-600">{free ? k('free.on') : k('free.hint')}</p>
      <div className="flex flex-wrap items-center gap-3">
        <input type="text" inputMode="decimal" autoComplete="off" dir="ltr" value={text} onChange={onText} aria-label={k('free.aria')} aria-invalid={bad} data-gc-free-input placeholder="−3 ; 5,5"
          className={`h-11 w-44 rounded-xl border-2 ${bad ? 'border-rose-300' : 'border-emerald-300'} bg-white px-3 text-center text-lg font-black tabular-nums text-indigo-950 ${ring}`} />
        {bad && <span className="text-xs font-bold text-rose-700">{k('free.bad')}</span>}
        {free && info && (
          <span className="text-xs font-black text-emerald-900" data-gc-free-info>
            {info.crosses ? k('free.crosses', { a: num(info.below), b: num(info.above), d: num(info.gap) }) : k('free.same', { d: num(info.gap) })}
          </span>
        )}
        {free && (
          <button type="button" onClick={() => setLab(L.toGuided)} data-gc-free-back
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

/** Les deux premières distances de l'élève, écrites « grande − petite = grande + opposé de la petite ». */
const signedTex = (h) => `(${h > 0n ? '+' : h < 0n ? '-' : ''}${R.tex(h < 0n ? -h : h)})`;
const lineOf = (name, a, b) => {
  const hi = a > b ? a : b; const lo = a > b ? b : a;
  return `${name}=${signedTex(hi)}-${signedTex(lo)}=${signedTex(hi)}+${signedTex(-lo)}=${R.tex(R.gap(a, b))}`;
};
export function Formal({ lab, k, advanced }) {
  const gaps = lab.tasks.filter((t) => t.kind === 'gap');
  const t1 = gaps[0] ?? { anchor: -400n, target: 900n };
  const t2 = gaps[1] ?? null;
  if (advanced) {
    return (
      <div className="space-y-2 text-sm font-bold text-emerald-950" data-gc-formal="both">
        <p className="text-center text-base" dir="ltr"><MathText>{$(`${lineOf('CD', t1.anchor, t1.target)}\\ ,\\ DC=CD`)}</MathText></p>
        <p><MathText>{k('formal.both')}</MathText></p>
      </div>
    );
  }
  return (
    <div className="space-y-2 text-sm font-bold text-emerald-950" data-gc-formal="rule">
      <p className="text-center text-base" dir="ltr"><MathText>{$(lineOf('AB', t1.anchor, t1.target))}</MathText></p>
      {t2 && <p className="text-center text-base" dir="ltr"><MathText>{$(lineOf('CD', t2.anchor, t2.target))}</MathText></p>}
      <p><MathText>{k('formal.rule')}</MathText></p>
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite d'une tâche (par son id : les tâches viennent de la leçon). La dernière tâche de chaque niveau finit par LA RÈGLE. */
export const CHAINS = Object.freeze({
  g1: ['parts', 'whyAdd'],
  g2: ['parts2', 'whySub'],
  g3: ['calc'],
  g4: ['ruleA'],
  m1: ['calcM', 'ruleA'],       // معارف : le labo posé seul
  a1: ['sub'],
  a2: ['howMany'],
  a3: ['same', 'ruleB'],
});

/** Une question à trois options décrite par ses clés de chaîne `cp.<id>.*` ; `vars` sont les nombres de l'élève. */
const choice = (k, id, vars, at, extra = {}) => ({
  id, kind: 'choice', prompt: Mx(k, `${id}.prompt`, vars),
  options: opt([Mx(k, `${id}.right`, vars), Mx(k, `${id}.wrongA`, vars), Mx(k, `${id}.wrongB`, vars)], 0, [null, Mx(k, `${id}.whyA`, vars), Mx(k, `${id}.whyB`, vars)], at),
  hints: [Mx(k, `${id}.hint1`, vars), Mx(k, `${id}.hint2`, vars)], explain: Mx(k, `${id}.explain`, vars), ...extra,
});
const abs = (h) => (h < 0n ? -h : h);
const varsOf = (t) => {
  const lo = t.anchor < t.target ? t.anchor : t.target; const hi = t.anchor < t.target ? t.target : t.anchor;
  const pa = abs(t.anchor); const pb = abs(t.target);
  return { a: num(t.anchor), b: num(t.target), lo: num(lo), hi: num(hi), pa: num(pa), pb: num(pb), d: num(t.gap), diff: num(abs(pb - pa)), sum: num(pa + pb), nd: num(-t.gap) };
};

export const QUESTIONS = {
  parts: (lab, task, k) => choice(k, 'parts', varsOf(task), 1),
  whyAdd: (lab, task, k) => choice(k, 'whyAdd', varsOf(task), 2),
  parts2: (lab, task, k) => choice(k, 'parts2', varsOf(task), 0),
  whySub: (lab, task, k) => choice(k, 'whySub', varsOf(task), 1),
  calc: (lab, task, k) => choice(k, 'calc', varsOf(task), 2),
  calcM: (lab, task, k) => choice(k, 'calcM', varsOf(task), 1),
  sub: (lab, task, k) => choice(k, 'sub', varsOf(task), 0),
  howMany: (lab, task, k) => choice(k, 'howMany', { a: num(task.anchor), d: num(task.d), up: num(task.anchor + task.d), down: num(task.anchor - task.d), nup: num(-(task.anchor + task.d)), ndown: num(-(task.anchor - task.d)) }, 1),
  same: (lab, task, k) => choice(k, 'same', varsOf(task), 2),
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
