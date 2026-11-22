import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Hand, CheckCircle2, Sparkles, ChevronLeft, FlaskConical, Undo2, Ban } from 'lucide-react';
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
import { Pit, Find, StakeArt, Digger, COL } from './digGrid/art';
import { LEVELS } from '../levels';
import * as L from '../logic/digGrid';

/**
 * dig-grid — LE PIQUET D'ORIGINE SOUS LA MAIN (2AM, unité 3 « الأعداد النسبية », درس « تعليم نقطة في المستوي », 2026-10-29).
 * La logique, exacte, est dans `logic/digGrid.js` (sur `packages/core/arithmetic/relative.js`, importé par chemin).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. مبتدئ : la main tient le PIQUET d'origine — un glissement 2D (deux cordes le suivent, il s'accroche aux croisements) ; toucher un croisement ou les flèches du clavier font de même.
 *    متقدم : le piquet est fixe ; la main PRÉDIT (écrit) les coordonnées, TOUCHE un point entre deux ficelles (demi-mètres), écrit la place miroir d'une pièce.
 * B. Les coordonnées d'une trouvaille = (sa position) − (celle du piquet), l'abscisse d'abord : elles changent toutes à la fois quand le piquet bouge alors que les trouvailles n'ont pas bougé.
 * C. La résistance : deux relevés du carnet ne sont vrais ensemble que pour UN piquet, ou pour aucun (nombres échangés) ; une trouvaille sur la corde verte a l'abscisse 0.
 * D. La phase formelle écrit ce que l'élève a trouvé avec SES nombres (la dernière question du labo, la règle).
 * E. Les fausses réponses sont rendues VISIBLES : le carnet devient rouge, le fantôme montre où mène le point écrit (ordre échangé, mauvais côté, place miroir ratée).
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        les deux coordonnées d'un point dans un repère orthonormé : l'abscisse d'abord (corde bleue), puis l'ordonnée (corde verte), mesurées depuis le piquet
 *   OBJECT         une fouille quadrillée, un piquet à deux cordes, des trouvailles, un carnet
 *   VARIABLE       le piquet d'origine (مبتدئ) ; un point touché ou écrit (متقدم)
 *   INVARIANT      la position des trouvailles ; le mètre de la ficelle, le MÊME sur les deux cordes
 *   TRANSFORMATION déplacer le piquet : toutes les coordonnées changent à la fois ; un point et son miroir : une seule coordonnée change
 *   CONSTRAINT     le piquet s'accroche aux croisements ; la fouille mesure 9 × 7 m ; le tap s'accroche au demi-mètre
 *   RESISTANCE     un seul piquet (ou aucun) pour plusieurs relevés ; un nombre échangé ; la corde sur laquelle se trouve la perle
 *   EVIDENCE       les étiquettes des cordes, le carnet, le fantôme d'une erreur
 *   PREDICTION     متقدم : les coordonnées des trouvailles restent voilées jusqu'à ce que l'élève les écrive
 *   FORMALIZATION  « الفاصلة أولًا ثم الترتيب » ; « نظيرة نقطة بالنسبة إلى محور الفواصل : الفاصلة نفسها والترتيب معاكس »
 *   TRANSFER       « جرّب أعدادك » (toujours ouvert), les exercices et la banque
 *
 * ONBOARDING : `coach` (défaut true) → `LabCoach` ; `logic › coachOf`. QUESTIONS PENDANT LE LABO (`LabCheckpoint`) : `CHAINS` + `QUESTIONS` ci-dessous, après CHAQUE tâche, avec SES nombres ;
 * la dernière suite de chaque niveau finit par LA RÈGLE. ÉTAPES : `LabStepper` (`[data-dg-step=<i>]`) + la fête. « إعادة » : tâche 1.
 * Props (contrat fixé avec la leçon) : `tasks`, `level`, `levels`, `coach`, `title`, `lead`, `onTrial(event)`, `onFinished({})`.
 *
 * CONTRAT DOM : [data-dig-grid][data-level][data-task][data-stake][data-solved], [data-dg-glance], [data-dg-stage], [data-dg-svg], [data-dg-stake] (role application),
 * [data-dg-cord=x|y], [data-dg-find=<id>][data-coords], [data-dg-note=<i>][data-ok], [data-dg-none], [data-dg-answer] (champs), [data-dg-check], [data-dg-ghost][data-model],
 * [data-dg-tap], [data-dg-verdict], [data-dg-next], [data-dg-step=<i>], [data-dg-free], [data-dg-free-input], [data-dg-free-back], [data-dg-formal], [data-dg-kid][data-mood].
 */
const NS = 'manipulation.digGrid';
const LRI = '⁦';
const PDI = '⁩';
const iso = (s) => `${LRI}${String(s).replace(/-/g, '−')}${PDI}`;
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-indigo-300';
const PAD = 24;

const CSS = `
@keyframes dg-pop { 0% { transform: scale(0.85); } 70% { transform: scale(1.06); } 100% { transform: scale(1); } }
.dg-pop { animation: dg-pop 240ms ease-out both; display: inline-block; }
@keyframes dg-ghost { 0%,100% { opacity: .55; } 50% { opacity: .95; } }
.dg-ghost { animation: dg-ghost 1.6s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .dg-pop, .dg-ghost { animation: none !important; } }
`;

export function numbersFor({ tasks, level }) {
  const lv = resolveLevelId(level ?? 'beginner');
  const asked = LEVELS['dig-grid'][lv].numbers;
  return { tasks: tasks ?? asked.tasks };
}

export default function DigGrid({
  tasks, title, lead, level, levels: withLevels = true, coach: coachOn = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const initialNumbers = useMemo(() => numbersFor({ tasks, level }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'dig-grid', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
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
  const advanced = lab.tasks[0].kind !== 'stake';
  const cpSettings = useLabCheckpointSettings('dig-grid');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
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
    lab: 'dig-grid', step: coachStep,
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
    <ManipulationDiscovery state={state} prompt={<MathText>{k(`discovery.${advanced ? 'plane' : 'origin'}.prompt`)}</MathText>} options={ruleOptions(lab, k, advanced)} formal={<Formal lab={lab} k={k} advanced={advanced} />} />
  );

  return (
    <ManipulationShell
      type="dig-grid"
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
        <div ref={boxRef} className="space-y-2" data-dig-grid data-level={advanced ? 'advanced' : 'beginner'} data-task={lab.free ? 'free' : lab.ti}
          data-stake={R.pointText(R.coordsOf(lab.stake, R.point(0, 0)))} data-solved={finished ? 'true' : 'false'}>
          <style dangerouslySetInnerHTML={{ __html: CSS }} />
          <Lab lab={lab} setLab={setLab} k={k} width={width} screenH={screenH} lead={state.isAuthoredLevel ? lead : null} cp={cp} advanced={advanced} />
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ══════════════ Le laboratoire ══════════════ */

const num = (h) => iso(R.text(h));
const ptT = (p) => iso(`(${R.text(p.x)} ; ${R.text(p.y)})`);

function Lab({ lab, setLab, k, width, screenH, lead, cp, advanced }) {
  const task = L.taskOf(lab);
  const free = L.isFree(lab);
  const done = L.taskDone(lab);
  const lit = !free && done;
  const last = lab.last;
  const nm = (id) => k(`lm.${id}`);
  const find = L.currentFind(lab);
  const target = L.currentTarget(lab);

  const ctx = free ? k('ctx.free') : (lead && lab.ti === 0 ? lead : k(`ctx.${task.id}`));
  const question = (() => {
    if (free) return k('q.free');
    if (task.kind === 'stake') return k(`q.${task.id}`);
    if (task.kind === 'tap') return k('q.tap', { name: nm(target?.name ?? task.targets[task.targets.length - 1].name), at: target ? ptT(target.at) : '' });
    if (task.kind === 'mirror') return k('q.mirror', { name: nm(task.find) });
    return k('q.typed', { name: nm(find ?? task.finds[task.finds.length - 1]) });
  })();

  const stepDone = lab.tasks.map((_, i) => !!lab.done[i] && (i !== lab.ti || !cp.blocking));
  const steps = lab.tasks.length > 1 && !free && <LabStepper count={lab.tasks.length} current={lab.ti} done={stepDone} stepAttr="data-dg-step" />;
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.trials.length === 0 && celebrated.current.size) celebrated.current = new Set();
  const nowDone = !free && stepDone[lab.ti];
  useEffect(() => {
    if (!nowDone || celebrated.current.has(lab.ti)) return;
    celebrated.current.add(lab.ti);
    party.celebrate({ n: lab.ti + 1, total: lab.tasks.length });
  }, [nowDone, lab.ti]); // eslint-disable-line react-hooks/exhaustive-deps

  // le son (muet sauf « الصوت ») : un déclic par déplacement du piquet, un petit drapeau quand c'est juste, « over » sur un refus, la cloche à la fin
  const sfx = useRef(lab.stake);
  useEffect(() => {
    if (lab.stake !== sfx.current && (lab.stake.x !== sfx.current.x || lab.stake.y !== sfx.current.y)) playSfx('gesture', { pitch: lab.stake.x + lab.stake.y > sfx.current.x + sfx.current.y ? 1 : 0.75 });
    sfx.current = lab.stake;
  }, [lab.stake]); // eslint-disable-line react-hooks/exhaustive-deps
  const nTrials = lab.trials.length;
  useEffect(() => {
    if (!nTrials) return;
    const tr = lab.trials[nTrials - 1];
    if (tr.free) return;
    if (tr.kind === 'stake' && tr.ok === undefined) return;
    playSfx(tr.ok ? 'flag' : 'over');
  }, [nTrials]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (done && !free) playSfx('bell'); }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  const prompt = (
    <PromptCard size={width >= 600 ? 'lg' : 'md'} aside={steps || null} context={<MathText>{ctx}</MathText>} contextProps={{ 'data-dg-context': free ? 'free' : task.id }}
      title={<MathText>{question}</MathText>} titleClassName={width >= 600 ? 'text-lg' : 'text-base'} lamp={free ? null : lit ? 'on' : 'off'}
      titleProps={{ 'data-dg-prompt': free ? 'free' : task.id, 'data-lit': lit ? 'true' : 'false' }} />
  );

  /* ── le verdict : la CONSÉQUENCE avec les nombres de l'élève, jamais la règle ── */
  const verdictLine = (() => {
    if (!last) return k(advanced ? 'idleAdv' : 'idle');
    if (last.kind === 'stake') {
      if (last.ok === true) return k('v.stakeOk');
      if (last.ok === false) return k('v.stakeSwap');
      return k('v.stake');
    }
    if (last.kind === 'none') return last.ok ? k('v.noneOk') : k('v.noneNo');
    if (last.kind === 'typed') {
      if (last.ok) return k('v.typedOk', { name: nm(last.find), a: iso(last.value) });
      return k(`w.${last.model}`, { typed: iso(last.value), name: nm(last.find) });
    }
    if (last.kind === 'tap') return last.ok ? k('v.tapOk', { name: nm(last.target) }) : k('v.tapNo', { name: nm(last.target), at: iso(last.at) });
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
    <VerdictBanner tone={tone} icon={Icon} size="sm" className="min-h-[3.2rem]" data-dg-verdict={bad ? 'wrong' : good ? 'right' : last?.free ? 'free' : ''}>
      <div className="flex min-w-0 items-center gap-2">
        <svg width={40} height={50} viewBox="0 0 40 52" aria-hidden="true" data-dg-kid data-mood={mood} className="shrink-0">
          <Digger x={20} y={50} mood={mood} girl={!advanced} />
        </svg>
        <div className="min-w-0 space-y-1.5">
          <p className={last ? '' : 'font-bold text-indigo-900'}>{verdictLine}</p>
          {canNext && (
            <button type="button" onClick={() => setLab(L.nextTask)} data-dg-next
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
      <div className="relative space-y-2" data-dg-glance>
        {party.node}
        {cp.node}
        {prompt}
        <StageFrame className="min-w-0 overflow-hidden p-2" data-dg-stage>
          <Stage lab={lab} setLab={setLab} k={k} width={Math.max(300, width - 16)} screenH={screenH} />
        </StageFrame>
        {task.kind === 'stake' && !free ? <NotebookRow lab={lab} setLab={setLab} k={k} /> : null}
        {(task.kind === 'typed' || task.kind === 'mirror') && !free ? <TypeRow lab={lab} setLab={setLab} k={k} /> : null}
        {task.kind === 'tap' && !free ? <p className="rounded-xl bg-[#F5F6FF] px-3 py-2 text-xs font-bold text-slate-700" data-dg-tapnote>{k('tapNote')}</p> : null}
        {banner}
      </div>
      <FreeCard lab={lab} setLab={setLab} k={k} />
    </>
  );
}

/* ══════════════ La scène : la fouille, le piquet et ses deux cordes ══════════════ */

function Stage({ lab, setLab, k, width, screenH }) {
  const uid = `dg${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const svgRef = useRef(null);
  const task = L.taskOf(lab);
  const free = L.isFree(lab);
  const W = width;
  // la fouille tient en un regard : la case est bornée par la largeur ET par la hauteur de l'écran (~28 %)
  const cell = Math.max(24, Math.min(Math.floor((W - PAD * 2) / L.COLS), Math.floor((screenH * 0.28 - PAD * 2) / L.ROWS) + 6));
  const x0 = Math.round((W - L.COLS * cell) / 2);
  const H = L.ROWS * cell + PAD * 2;
  const X = (c) => x0 + c * cell;
  const Y = (r) => PAD + (L.ROWS - r) * cell;
  const { c: sc, r: sr } = L.stakeCells(lab);
  const [drag, setDrag] = useState(false);
  const locked = L.stakeLocked(lab);
  const tapMode = !free && task.kind === 'tap' && !L.taskDone(lab);

  const toCell = (e) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r) return null;
    const x = (e.clientX - r.left) * (W / r.width);
    const y = (e.clientY - r.top) * (H / r.height);
    return { fx: (x - x0) / cell, fy: L.ROWS - (y - PAD) / cell };
  };
  const down = (e) => {
    const p = toCell(e);
    if (!p) return;
    if (tapMode) { e.preventDefault(); setLab((s) => L.tapAt(s, p.fx, p.fy)); return; }
    if (locked) return;
    e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId); setDrag(true);
    setLab((s) => L.setStake(s, p.fx, p.fy));
  };
  const move = (e) => { if (!drag) return; const p = toCell(e); if (p) setLab((s) => L.setStake(s, p.fx, p.fy)); };
  const up = (e) => { if (!drag) return; setDrag(false); const p = toCell(e); if (p) setLab((s) => L.setStake(s, p.fx, p.fy)); };
  const key = (e) => {
    const map = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };
    if (e.key in map) { e.preventDefault(); setLab((s) => L.moveStake(s, ...map[e.key])); }
  };

  /* quelles trouvailles montrer, avec ou sans leurs coordonnées */
  const noted = !free && task.kind === 'stake' ? task.notes.map((n) => n.find) : [];
  const typedDone = !free && task.kind === 'typed' ? task.finds.slice(0, lab.ai) : [];
  const readingFor = (id) => {
    if (free) return true;
    if (task.kind === 'stake') return noted.includes(id);
    if (task.kind === 'typed') return typedDone.includes(id) || L.taskDone(lab);
    if (task.kind === 'mirror') return id === task.find && L.taskDone(lab);
    return false;
  };
  const askId = L.currentFind(lab);
  const stakePx = { x: X(sc), y: Y(sr) };
  const ghost = lab.ghost && !L.taskDone(lab) ? lab.ghost : null;
  const ghostPos = (() => {
    if (!ghost) return null;
    if (ghost.kind === 'stake') return { x: X(Number(ghost.at.x / 100n)), y: Y(Number(ghost.at.y / 100n)), peg: true };
    if (ghost.kind === 'tap') return { x: X(Number(ghost.world.x) / 100), y: Y(Number(ghost.world.y) / 100) };
    const base = free ? lab.stake : L.taskOf(lab).stake;
    return { x: X((Number(base.x) + Number(ghost.at.x)) / 100), y: Y((Number(base.y) + Number(ghost.at.y)) / 100) };
  })();
  const tapped = !free && task.kind === 'tap' ? task.targets.slice(0, lab.ai) : [];
  const labelStep = cell >= 30 ? 1 : 2;

  return (
    <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: W, display: 'block', margin: '0 auto', touchAction: 'pan-y' }}
      role="img" aria-label={k('stageAria')} data-dg-svg dir="ltr">
      <Pit x={x0 - 10} y={PAD - 10} w={L.COLS * cell + 20} h={L.ROWS * cell + 20} uid={uid} />
      {/* les ficelles d'un mètre */}
      <g aria-hidden="true" stroke={COL.string} strokeWidth={1.1} opacity={0.85}>
        {Array.from({ length: L.COLS + 1 }, (_, c) => <line key={`v${c}`} x1={X(c)} x2={X(c)} y1={Y(0)} y2={Y(L.ROWS)} />)}
        {Array.from({ length: L.ROWS + 1 }, (_, r) => <line key={`h${r}`} x1={X(0)} x2={X(L.COLS)} y1={Y(r)} y2={Y(r)} />)}
      </g>
      {/* les deux cordes du piquet */}
      <line x1={X(0) - 8} x2={X(L.COLS) + 8} y1={stakePx.y} y2={stakePx.y} stroke={COL.cordX} strokeWidth={3.2} data-dg-cord="x" />
      <line x1={stakePx.x} x2={stakePx.x} y1={Y(0) + 8} y2={Y(L.ROWS) - 8} stroke={COL.cordY} strokeWidth={3.2} data-dg-cord="y" />
      {Array.from({ length: L.COLS + 1 }, (_, c) => c).filter((c) => c !== sc && (c - sc) % labelStep === 0).map((c) => (
        <text key={`tx${c}`} x={X(c)} y={stakePx.y + (sr === 0 ? -6 : 13)} textAnchor="middle" fontSize={11} fontWeight={900} fill="#1D4ED8" style={{ direction: 'ltr', unicodeBidi: 'isolate' }} aria-hidden="true">{String(c - sc).replace(/-/g, '−')}</text>
      ))}
      {Array.from({ length: L.ROWS + 1 }, (_, r) => r).filter((r) => r !== sr && (r - sr) % labelStep === 0).map((r) => (
        <text key={`ty${r}`} x={stakePx.x + (sc === L.COLS ? -8 : 8)} y={Y(r) + 4} textAnchor={sc === L.COLS ? 'end' : 'start'} fontSize={11} fontWeight={900} fill="#15803D" style={{ direction: 'ltr', unicodeBidi: 'isolate' }} aria-hidden="true">{String(r - sr).replace(/-/g, '−')}</text>
      ))}
      {/* les trouvailles */}
      {Object.keys(L.FINDS).map((id) => {
        const [fc, fr] = L.FINDS[id];
        const rd = L.readingOf(lab, id);
        const show = readingFor(id);
        const lit = id === askId || noted.includes(id);
        return (
          <g key={id} data-dg-find={id} data-coords={show ? R.pointText(rd) : undefined}>
            <Find id={id} x={X(fc)} y={Y(fr)} lit={lit} />
            {lit && <SvgPill x={X(fc)} y={Y(fr) - 22} text={k(`lm.${id}`)} fill="#0F766E" size={11} />}
            {show && !free && <SvgPill x={X(fc)} y={Y(fr) + 21} text={R.pointText(rd).replace(/-/g, '−')} fill="#4F46E5" size={11} />}
            {show && free && <SvgPill x={X(fc)} y={Y(fr) + 19} text={R.pointText(rd).replace(/-/g, '−')} fill="#4F46E5" size={10} />}
          </g>
        );
      })}
      {tapped.map((tg) => {
        const wx = Number(task.stake.x + tg.at.x) / 100; const wy = Number(task.stake.y + tg.at.y) / 100;
        return <g key={tg.name} data-dg-tap={tg.name}><Find id={tg.name} x={X(wx)} y={Y(wy)} lit /></g>;
      })}
      {free && lab.free?.p && (() => {
        const wx = Number(lab.stake.x + lab.free.p.x) / 100; const wy = Number(lab.stake.y + lab.free.p.y) / 100;
        const inside = wx >= 0 && wx <= L.COLS && wy >= 0 && wy <= L.ROWS;
        return (
          <g data-dg-marker={R.pointText(lab.free.p)}>
            <circle cx={X(Math.max(0, Math.min(L.COLS, wx)))} cy={Y(Math.max(0, Math.min(L.ROWS, wy)))} r={8} fill="#F59E0B" stroke="#fff" strokeWidth={2} />
            {!inside && <text x={W / 2} y={14} textAnchor="middle" fontSize={11} fontWeight={900} fill="#B91C1C">{k('free.outside')}</text>}
          </g>
        );
      })()}
      {ghost && ghostPos && (
        <g className="dg-ghost" data-dg-ghost data-model={ghost.model ?? ghost.kind} aria-hidden="true">
          {ghostPos.peg
            ? <g><circle cx={ghostPos.x} cy={ghostPos.y} r={11} fill="none" stroke="#B45309" strokeWidth={2.2} strokeDasharray="4 3" /><line x1={ghostPos.x} x2={ghostPos.x} y1={ghostPos.y - 8} y2={ghostPos.y - 22} stroke="#B45309" strokeWidth={3} /></g>
            : <g><circle cx={ghostPos.x} cy={ghostPos.y} r={12} fill="none" stroke="#B45309" strokeWidth={2} strokeDasharray="4 3" /><text x={ghostPos.x} y={ghostPos.y + 4} textAnchor="middle" fontSize={12} fontWeight={900} fill="#B45309">؟</text></g>}
        </g>
      )}
      {/* le piquet */}
      <g>
        <StakeArt x={stakePx.x} y={stakePx.y} active={drag} locked={locked} />
        <rect x={stakePx.x - 22} y={stakePx.y - 34} width={44} height={44} fill="transparent" style={{ cursor: locked ? 'not-allowed' : drag ? 'grabbing' : 'grab' }}
          role="application" tabIndex={0} aria-label={k('stakeAria')} aria-roledescription={k('stakeRole')} aria-valuetext={k('stakeValue', { c: sc, r: sr })} aria-disabled={locked ? true : undefined}
          onKeyDown={key} data-dg-stake />
      </g>
      {/* la surface qui reçoit le glissement ou le toucher */}
      <rect x={x0 - 10} y={PAD - 10} width={L.COLS * cell + 20} height={L.ROWS * cell + 20} fill="transparent" style={{ cursor: tapMode ? 'crosshair' : locked ? 'default' : 'grab', touchAction: 'none' }}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} data-dg-hit aria-hidden="true" />
    </svg>
  );
}

/* ══════════════ Les commandes ══════════════ */

function NotebookRow({ lab, setLab, k }) {
  const task = L.taskOf(lab);
  const rows = L.notebook(lab);
  const done = L.taskDone(lab);
  return (
    <LabCard className="space-y-1.5 p-2" data-dg-controls>
      <div className="flex flex-wrap items-center gap-1.5" data-dg-notebook>
        <span className="text-xs font-black text-amber-900">{k('notebook')}</span>
        {rows.map((r, i) => (
          <span key={r.find} data-dg-note={i} data-ok={r.ok ? 'true' : 'false'}
            className={`inline-flex items-center gap-1.5 rounded-full border-2 px-2.5 py-1 text-xs font-black ${r.ok ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-rose-300 bg-rose-50 text-rose-900'}`}>
            <span>{k(`lm.${r.find}`)}</span>
            <span className="font-bold opacity-80">{k('noteWant')}</span>
            <bdi dir="ltr">{R.pointText(r.want).replace(/-/g, '−')}</bdi>
            <span className="font-bold opacity-80">{k('noteNow')}</span>
            <bdi dir="ltr" className="tabular-nums">{R.pointText(r.reading).replace(/-/g, '−')}</bdi>
          </span>
        ))}
        {task.none || !done ? (
          <button type="button" onClick={() => setLab(L.pressNone)} disabled={done} data-dg-none
            className={`ms-auto inline-flex min-h-[44px] items-center gap-1.5 rounded-2xl border-2 border-indigo-300 bg-white px-3 text-sm font-black text-indigo-900 disabled:opacity-40 ${ring}`}>
            <Ban className="h-4 w-4" aria-hidden="true" /> {k('none')}
          </button>
        ) : null}
      </div>
    </LabCard>
  );
}

function TypeRow({ lab, setLab, k }) {
  const [xv, setXv] = useState('');
  const [yv, setYv] = useState('');
  const find = L.currentFind(lab);
  const done = L.taskDone(lab);
  useEffect(() => { setXv(''); setYv(''); }, [lab.ti, lab.ai]);
  const clean = (v) => v.replace(/[^0-9٠-٩\-−+,.٫]/g, '').slice(0, 6);
  const can = !!find && !done && xv.trim() !== '' && yv.trim() !== '';
  const submit = () => { if (can) setLab((s) => L.answerTyped(s, `${xv};${yv}`)); };
  const onKey = (e) => { if (e.key === 'Enter') submit(); };
  const fieldCls = `h-11 w-16 rounded-xl border-2 border-indigo-300 bg-white px-1 text-center text-lg font-black tabular-nums text-indigo-950 disabled:bg-slate-100 ${ring}`;
  return (
    <LabCard className="flex flex-wrap items-center gap-2 p-2" data-dg-controls>
      <div className="flex items-center gap-1.5 text-lg font-black text-indigo-950" dir="ltr" role="group" aria-label={k('answerAria')} data-dg-answer>
        <span aria-hidden="true">(</span>
        <input type="text" inputMode="decimal" autoComplete="off" dir="ltr" value={xv} disabled={!find || done} onChange={(e) => setXv(clean(e.target.value))} onKeyDown={onKey} aria-label={k('xAria')} data-dg-x className={fieldCls} />
        <span aria-hidden="true">;</span>
        <input type="text" inputMode="decimal" autoComplete="off" dir="ltr" value={yv} disabled={!find || done} onChange={(e) => setYv(clean(e.target.value))} onKeyDown={onKey} aria-label={k('yAria')} data-dg-y className={fieldCls} />
        <span aria-hidden="true">)</span>
      </div>
      <button type="button" onClick={submit} disabled={!can} data-dg-check
        className={`inline-flex min-h-[44px] items-center justify-center rounded-2xl border-2 border-indigo-600 bg-indigo-600 px-4 text-sm font-black text-white shadow-[0_3px_0_0_#3730A3] disabled:opacity-40 ${ring}`}>{k('check')}</button>
      <p className="min-w-0 flex-1 text-xs font-bold text-slate-600">{k('typeNote')}</p>
    </LabCard>
  );
}

/* ══════════════ « جرّب أعدادك » : toujours ouvert ══════════════ */

function FreeCard({ lab, setLab, k }) {
  const free = L.isFree(lab);
  const [text, setText] = useState('');
  useEffect(() => { if (!lab.free) setText(''); }, [lab.free]);
  const bad = text.trim() !== '' && !L.parseFree(text);
  const onText = (e) => {
    const raw = e.target.value.replace(/[^0-9٠-٩\-−,.٫؛;\s]/g, '').slice(0, 18);
    setText(raw);
    if (L.parseFree(raw)) setLab((s) => L.setFree(s, raw));
  };
  return (
    <LabCard className="space-y-2 border-emerald-200 bg-emerald-50/50 p-3" data-dg-free data-active={free ? 'true' : 'false'}>
      <p className="flex items-center gap-1.5 text-sm font-black text-emerald-900"><FlaskConical className="h-4 w-4" aria-hidden="true" /> {k('free.title')}</p>
      <p className="text-xs font-bold leading-snug text-slate-600">{free ? k('free.on') : k('free.hint')}</p>
      <div className="flex flex-wrap items-center gap-3">
        <input type="text" inputMode="decimal" autoComplete="off" dir="ltr" value={text} onChange={onText} aria-label={k('free.aria')} aria-invalid={bad} data-dg-free-input placeholder="−2 ; 3,5"
          className={`h-11 w-44 rounded-xl border-2 ${bad ? 'border-rose-300' : 'border-emerald-300'} bg-white px-3 text-center text-lg font-black tabular-nums text-indigo-950 ${ring}`} />
        {bad && <span className="text-xs font-bold text-rose-700">{k('free.bad')}</span>}
        {free && lab.free?.p && <span className="text-xs font-black text-emerald-900" data-dg-free-info>{k(`region.${L.regionKey(lab.free.p)}`)}</span>}
        {free && (
          <button type="button" onClick={() => setLab(L.toGuided)} data-dg-free-back
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

/** Les options : `texts[0]` est la bonne, les autres ont leur réfutation `whys[i]` ; la bonne est posée à la place `at` (jamais toujours la première). */
const opt = (texts, right, whys, at = 0) => {
  const list = texts.map((text, i) => (i === right ? { text, correct: true } : { text, why: whys[i] }));
  const [good] = list.splice(right, 1);
  list.splice(at % (list.length + 1), 0, good);
  return list;
};

export function ruleOptions(lab, k, advanced) {
  const key = advanced ? 'plane' : 'origin';
  return opt([k(`discovery.${key}.right`), k(`discovery.${key}.wrongA`), k(`discovery.${key}.wrongB`)], 0, [null, k(`discovery.${key}.whyA`), k(`discovery.${key}.whyB`)], advanced ? 2 : 1);
}

export function Formal({ k, advanced }) {
  if (advanced) {
    return (
      <div className="space-y-2 text-sm font-bold text-emerald-950" data-dg-formal="plane">
        <p className="text-center text-base" dir="ltr"><MathText>{$('C(3\\,;-1)\\ \\to\\ C\'(3\\,;1)')}</MathText></p>
        <p><MathText>{k('formal.plane')}</MathText></p>
      </div>
    );
  }
  return (
    <div className="space-y-2 text-sm font-bold text-emerald-950" data-dg-formal="origin">
      <p className="text-center text-base" dir="ltr"><MathText>{$('J(2\\,;1)\\ ,\\ L(-3\\,;2)')}</MathText></p>
      <p><MathText>{k('formal.origin')}</MathText></p>
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite d'une tâche (par son id : les tâches viennent de la leçon). La dernière tâche de chaque niveau finit par LA RÈGLE. */
export const CHAINS = Object.freeze({
  d1: ['count', 'first'],
  d2: ['whyNeg'],
  d3: ['oneStake'],
  d4: ['mistake', 'ruleB'],
  m1: ['south', 'ruleB'],      // معارف : le labo posé seul
  p1: ['bead'],
  p2: ['half'],
  p3: ['sym', 'rule'],
});

/** Une question à trois options décrite par ses clés de chaîne `cp.<id>.*` ; `vars` sont les nombres de l'élève. */
const choice = (k, id, vars, at, extra = {}) => ({
  id, kind: 'choice', prompt: Mx(k, `${id}.prompt`, vars),
  options: opt([Mx(k, `${id}.right`, vars), Mx(k, `${id}.wrongA`, vars), Mx(k, `${id}.wrongB`, vars)], 0, [null, Mx(k, `${id}.whyA`, vars), Mx(k, `${id}.whyB`, vars)], at),
  hints: [Mx(k, `${id}.hint1`, vars), Mx(k, `${id}.hint2`, vars)], explain: Mx(k, `${id}.explain`, vars), ...extra,
});

export const QUESTIONS = {
  count: (lab, task, k) => {
    const n = task.notes[0];
    return choice(k, 'count', { name: k(`lm.${n.find}`), x: num(n.want.x), y: num(n.want.y) }, 1, { cols: 3 });
  },
  first: (lab, task, k) => choice(k, 'first', { a: num(task.notes[0].want.x), b: num(task.notes[0].want.y) }, 2),
  whyNeg: (lab, task, k) => choice(k, 'whyNeg', { name: k(`lm.${task.notes[0].find}`), a: num(task.notes[0].want.x) }, 0),
  oneStake: (lab, task, k) => choice(k, 'oneStake', {}, 1),
  mistake: (lab, task, k) => choice(k, 'mistake', { name: k(`lm.${task.notes[1].find}`), a: ptT(task.notes[1].want), b: ptT(R.point(task.notes[1].want.y, task.notes[1].want.x)) }, 2),
  south: (lab, task, k) => choice(k, 'south', {}, 0),
  ruleB: (lab, task, k) => ({
    id: 'ruleB', kind: 'choice', prompt: <MathText>{k('discovery.origin.prompt')}</MathText>,
    options: ruleOptions(lab, k, false).map((o) => ({ ...o, text: <MathText>{o.text}</MathText>, why: o.why && <MathText>{o.why}</MathText> })),
    hints: [<MathText key="h1">{k('rule.origin.hint1')}</MathText>, <MathText key="h2">{k('rule.origin.hint2')}</MathText>], explain: <Formal lab={lab} k={k} advanced={false} />,
  }),
  bead: (lab, task, k) => choice(k, 'bead', { name: k('lm.bead') }, 1),
  half: (lab, task, k) => choice(k, 'half', {}, 0),
  sym: (lab, task, k) => choice(k, 'sym', { name: k('lm.coin') }, 1),
  rule: (lab, task, k) => ({
    id: 'rule', kind: 'choice', prompt: <MathText>{k('discovery.plane.prompt')}</MathText>,
    options: ruleOptions(lab, k, true).map((o) => ({ ...o, text: <MathText>{o.text}</MathText>, why: o.why && <MathText>{o.why}</MathText> })),
    hints: [<MathText key="h1">{k('rule.plane.hint1')}</MathText>, <MathText key="h2">{k('rule.plane.hint2')}</MathText>], explain: <Formal lab={lab} k={k} advanced />,
  }),
};
