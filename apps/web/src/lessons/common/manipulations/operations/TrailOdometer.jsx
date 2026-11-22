import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Hand, CheckCircle2, Sparkles, ChevronLeft, FlaskConical, Undo2, Minus, Plus, Lock, Flag } from 'lucide-react';
import { resolveLevelId } from '@smarter-academy/core/curriculum/manipulationLevels.js';
import MathText from '../../components/MathText';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import { LabCard, StageFrame, PromptCard, VerdictBanner, RoundButton } from '../primitives/LabKit';
import { useLabCoach } from '../primitives/LabCoach';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import { LEVELS } from '../levels';
import * as L from '../logic/trailOdometer';
import { COL, TrailBackdrop, Gate, Spring, Post, Hiker } from './trailOdometer/art';

/**
 * trail-odometer — LA DISTANCE SOUS LA MAIN (2AM, unité 2, درس « جمع وطرح كسرين », 2026-10-29). La logique, exacte, est dans `logic/trailOdometer.js` (sur
 * `packages/core/arithmetic/fractions2.js`, importé par chemin). Thème `mountaintrail` : un sentier de forêt de cèdres, de la porte du parc à la source.
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. La main tient la DISTANCE marchée, en poteaux blancs (un entier) : on fait glisser la scoute sur le sentier (la position se COLLE au poteau blanc le plus proche),
 *    ou −/+ (un blanc), « مرحلة حمراء » −/+ (k blancs d'un coup), ← → (±1), PageUp/PageDown (±k) ; « وصلنا » (Entrée) juge l'étape.
 * B. Deux compteurs au poignet : blancs, et rouges (+ les blancs en reste). Les étapes sont écrites en fractions sur la planche du portail.
 * C. La résistance : l'étape rouge se lit en BLANCS pendant qu'on marche ; la scoute doit se tenir EXACTEMENT sur le poteau ; au niveau متقدم le sentier est verrouillé
 *    tant que la prédiction n'est pas écrite.
 * D. La phase formelle écrit ce que l'élève a fait : 5/12 + 1/4 = 5/12 + 3/12 = 8/12 = 2/3 ; 3/4 − 5/12 = 9/12 − 5/12 = 4/12 = 1/3.
 * E. Les fausses écritures (6/16, 6/12, 6/6) sont refutées par le sentier : un drapeau en pointillé se plante à la position de cette fraction.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        on ne cumule que des parties de même taille ; un grand pas rouge vaut k petits pas blancs ; le reste est « le tout moins ce qu'on a marché »
 *   OBJECT         un sentier d'arc de longueur 1 (ou un circuit), des poteaux blancs tous les 1/n, rouges tous les k blancs
 *   VARIABLE       la distance marchée, en poteaux blancs
 *   INVARIANT      la position (en fraction du sentier) ; la taille de l'unité 1/n
 *   TRANSFORMATION étape (±a/b) → ± a·(n/b) poteaux blancs
 *   CONSTRAINT     « وصلنا » exact ; sentier fermé à la prédiction (متقدم) ; seuls les cas où un dénominateur est multiple de l'autre
 *   RESISTANCE     la somme des dénominateurs (6/16) ou le rouge pris pour un blanc (6/12) sont REFUSÉS et dessinés devant la scoute
 *   EVIDENCE       compteurs blanc/rouge, empreintes colorées par étape, drapeau en pointillé
 *   CONTRAST       même dénominateur (g1) contre deux sortes de poteaux (g2) ; l'aller contre le retour (g3) ; 1 + 5/6 sur un circuit (a4)
 *   PREDICTION     (متقدم) la fraction d'arrivée et le reste sont ÉCRITS avant de marcher
 *   DISCOVERY      « كيف نجمع أو نطرح كسرين مقام أحدهما مضاعف لمقام الآخر ؟ »
 *   FORMALIZATION  a/b + c/d = a/b + c'/b = (a + c')/b , puis on réduit
 *   TRANSFER       « جرّب أعدادك » (toujours ouvert), les exercices et la banque
 *
 * « جرّب كل الإمكانيات » : NON (chaque « وصلنا » est l'essai). « جرّب أعدادك » est TOUJOURS ouvert sous le labo (jamais comptée).
 * ONBOARDING : `coach` (défaut true) → `LabCoach` ; `logic/trailOdometer.js › coachOf` (walk · arrive · red · write · predict · next).
 * Props : `tasks`, `level`, `levels`, `coach`, `title`, `lead`, `onTrial(event)`, `onFinished()`.
 * CONTRAT DOM : [data-trail-odometer][data-level][data-task][data-posts][data-solved][data-layout], [data-to-glance], [data-to-scene], [data-to-hiker][role=slider][aria-valuenow],
 * [data-to-post=<i>][data-red], [data-to-counter=white|red], [data-to-leg=<i>][data-state], [data-to-less], [data-to-more], [data-to-red-minus], [data-to-red-plus], [data-to-arrive],
 * [data-to-write][data-field], [data-to-input=<field>], [data-to-check=<field>], [data-to-flag][data-model], [data-to-verdict], [data-to-next], [data-to-step=<i>],
 * [data-to-free][data-active], [data-to-free-a|b|c|d], [data-to-free-op], [data-to-free-back], [data-to-free-guess], [data-to-formal].
 */
const NS = 'manipulation.trailOdometer';
const LRI = '⁦';
const PDI = '⁩';
const iso = (s) => `${LRI}${s}${PDI}`;
const WIDE_MIN = 700;
const SIDE_W = 236;
const SCENE_MAX = 560;
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-indigo-300';
const $ = (s) => `$${s}$`;
const frac = (n, d) => (d === 1 ? String(n) : `\\frac{${n}}{${d}}`);

const CSS = `
@keyframes to-pop { 0% { transform: scale(0.8); opacity: 0.2; } 100% { transform: scale(1); opacity: 1; } }
.to-pop { animation: to-pop 220ms ease-out; transform-box: fill-box; transform-origin: bottom center; }
@media (prefers-reduced-motion: reduce) { .to-pop { animation: none !important; } }
`;

export function numbersFor({ tasks, level }) {
  const lv = resolveLevelId(level ?? 'beginner');
  const asked = LEVELS['trail-odometer'][lv].numbers;
  return { tasks: tasks ?? asked.tasks };
}

export default function TrailOdometer({
  tasks, title, lead, level, levels: withLevels = true, coach: coachOn = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const initialNumbers = useMemo(() => numbersFor({ tasks, level }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'trail-odometer', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
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
  const cpSettings = useLabCheckpointSettings('trail-odometer');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const chain = cpOn && cpSettings.enabled && !L.isFree(lab) ? CHAINS[cur.id] ?? null : null;
  const isRule = (q) => q === 'rule' || q === 'ruleMulti';
  const ruleByCheckpoint = cpOn && cpSettings.enabled && lab.tasks.some((tk) => CHAINS[tk.id]?.some(isRule));
  const cp = useLabCheckpoint({
    id: chain ? cur.id : null,
    questions: chain && L.taskDone(lab) ? chain.map((q) => QUESTIONS[q](lab, cur, k)) : null,
    reached: L.taskDone(lab),
    resetKey: scene.inits,
    onRetry: () => setLab(L.restartTask),
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => { if (CHAINS[id]?.some(isRule)) { state.discover(); state.formalize(); } },
  });
  const ready = L.discoveryReady(lab) && !ruleByCheckpoint;
  useEffect(() => { if (ready) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  const finishedOnce = useRef(false);
  const finished = ruleByCheckpoint ? lab.tasks.every((_, i) => !!lab.done[i]) : ready;
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
    lab: 'trail-odometer', step: coachStep,
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
  const advanced = lab.tasks[0].predict;

  const discovery = (
    <ManipulationDiscovery state={state} prompt={<MathText>{k('discovery.prompt')}</MathText>} options={ruleOptions(lab, k)} formal={<Formal lab={lab} k={k} />} />
  );

  return (
    <ManipulationShell
      type="trail-odometer"
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
      <ManipulationStage className="bg-gradient-to-b from-emerald-50/70 to-white">
        <div ref={boxRef} className="space-y-2" data-trail-odometer data-level={advanced ? 'advanced' : 'beginner'} data-task={lab.free ? 'free' : lab.ti}
          data-posts={lab.w.pos} data-solved={finished ? 'true' : 'false'} data-layout={width >= WIDE_MIN ? 'wide' : 'narrow'}>
          <style dangerouslySetInnerHTML={{ __html: CSS }} />
          <Lab lab={lab} setLab={setLab} k={k} width={width} screenH={screenH} lead={state.isAuthoredLevel ? lead : null} cp={cp} advanced={advanced} />
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ══════════════ Le laboratoire ══════════════ */

function Lab({ lab, setLab, k, width, screenH, lead, cp, advanced }) {
  const wide = width >= WIDE_MIN;
  const task = L.taskOf(lab);
  const free = L.isFree(lab);
  const done = L.taskDone(lab);
  const lit = !free && done;
  const w = lab.w;
  const last = lab.last;

  /* ── la consigne : le contexte puis UNE question ── */
  const ctx = (() => {
    if (lead && lab.ti === 0 && !free) return lead;
    if (free) return k('ctx.free') + freeSentence(lab);
    return k(`ctx.${task.id}`);
  })();
  const question = free ? k('q.free') : task.predict ? k('q.predict') : k(`q.${task.id}`);

  const stepDone = lab.tasks.map((_, i) => !!lab.done[i] && (i !== lab.ti || !cp.blocking));
  const steps = lab.tasks.length > 1 && !free && <LabStepper count={lab.tasks.length} current={lab.ti} done={stepDone} stepAttr="data-to-step" />;
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.trials.length === 0 && celebrated.current.size) celebrated.current = new Set();
  const nowDone = !free && stepDone[lab.ti];
  useEffect(() => {
    if (!nowDone || celebrated.current.has(lab.ti)) return;
    celebrated.current.add(lab.ti);
    party.celebrate({ n: lab.ti + 1, total: lab.tasks.length });
  }, [nowDone, lab.ti]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── le son (muet sauf « الصوت ») : un déclic par poteau, le drapeau à l'arrivée d'une étape, la cloche à la source ── */
  const sfx = useRef({ pos: w.pos, key: '' });
  const sfxKey = `${free ? 'free' : lab.ti}`;
  useEffect(() => {
    const p = sfx.current;
    if (p.key !== sfxKey) { sfx.current = { pos: w.pos, key: sfxKey }; return; }
    const d = w.pos - p.pos;
    if (d !== 0) playSfx('tooth', { pitch: d > 0 ? 1 : 0.75 });
    p.pos = w.pos;
  }, [w.pos, sfxKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const nTrials = lab.trials.length;
  useEffect(() => {
    if (!nTrials) return;
    const tr = lab.trials[nTrials - 1];
    if (tr.kind === 'solved') playSfx('bell');
    else if (tr.kind === 'leg' && tr.ok) playSfx('flag');
    else if (tr.kind === 'leg') playSfx('over');
  }, [nTrials]); // eslint-disable-line react-hooks/exhaustive-deps

  const prompt = (
    <PromptCard size={wide ? 'lg' : 'md'} context={<MathText>{ctx}</MathText>} contextProps={{ 'data-to-context': free ? 'free' : task.id }}
      title={<MathText>{question}</MathText>} titleClassName={wide ? 'text-xl' : 'text-lg'} lamp={free ? null : lit ? 'on' : 'off'}
      titleProps={{ 'data-to-prompt': task.id, 'data-lit': lit ? 'true' : 'false' }} />
  );

  /* ── le verdict : la CONSÉQUENCE avec les nombres de l'élève, jamais la règle ── */
  const verdictLine = (() => {
    if ((last?.kind === 'writing' || last?.kind === 'predict') && last.ok) return k('v.right', { w: iso(last.value) });
    if (last?.kind === 'writing' || last?.kind === 'predict') return k(`w.${last.model === 'right' ? 'other' : last.model}`, { w: iso(last.value) });
    if (w.phase === 'predict') return k('idlePredict');
    if (w.phase === 'write') return k('idleWrite');
    if (last?.kind === 'leg') {
      if (last.ok) return k('v.ok', { posts: iso(last.posts) });
      const d = Math.abs(last.want - last.posts);
      return k(last.posts < last.want ? 'v.short' : 'v.long', { d: iso(d) });
    }
    if (done) return k('v.allDone');
    return k('idle');
  })();
  const bad = last && (last.kind === 'leg' && !last.ok || (last.kind === 'writing' || last.kind === 'predict') && !last.ok);
  const good = last && (last.kind === 'leg' && last.ok || (last.kind === 'writing' || last.kind === 'predict') && last.ok);
  const tone = bad ? 'rose' : good ? 'emerald' : 'indigo';
  const Icon = bad ? Sparkles : good ? CheckCircle2 : Hand;
  const canNext = L.canNext(lab) && !cp.blocking;
  const mood = bad ? 'wonder' : done ? 'proud' : 'happy';
  const banner = (
    <VerdictBanner tone={tone} icon={wide ? Icon : null} size="sm" className="min-h-[3.5rem]" data-to-verdict={bad ? 'bad' : good ? 'good' : ''}>
      <div className="min-w-0 space-y-1.5">
        <p className={last ? '' : 'font-bold text-indigo-900'}><MathText>{verdictLine}</MathText></p>
        {canNext && (
          <button type="button" onClick={() => setLab(L.nextTask)} data-to-next
            className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-2 border-emerald-600 bg-emerald-600 px-3.5 text-sm font-black text-white shadow-[0_3px_0_0_#047857] transition-all duration-150 active:translate-y-0.5 motion-reduce:transition-none ${ring}`}>
            {k('next')} <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </VerdictBanner>
  );

  const predicting = w.phase === 'predict';
  const bannerNode = predicting && !last ? null : banner;
  const stageW = Math.min(SCENE_MAX, Math.max(300, (wide ? width - SIDE_W - 12 : width) - 24));
  const board = <Board lab={lab} k={k} />;
  const stage = <Trail lab={lab} setLab={setLab} k={k} width={stageW} screenH={screenH} mood={mood} girl={!advanced} />;
  const controls = <Controls lab={lab} setLab={setLab} k={k} />;

  return (
    <>
      <div className="relative space-y-2" data-to-glance>
        {party.node}
        {cp.node}
        {prompt}
        {wide ? (
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <StageFrame className="min-w-0 space-y-1.5 overflow-hidden p-3" data-to-stage>
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">{board}{steps || null}</div>
                {stage}
              </StageFrame>
              {w.phase === 'predict' && <Writer lab={lab} setLab={setLab} k={k} />}
              {controls}
              {w.phase !== 'predict' && <Writer lab={lab} setLab={setLab} k={k} />}
            </div>
            <div className="flex shrink-0 flex-col gap-2.5" style={{ width: SIDE_W }}>{banner}</div>
          </div>
        ) : (
          <>
            <StageFrame className="min-w-0 space-y-1.5 overflow-hidden p-2" data-to-stage>{board}{steps || null}{stage}</StageFrame>
            {w.phase === 'predict' && <Writer lab={lab} setLab={setLab} k={k} />}
            {controls}
            {w.phase !== 'predict' && <Writer lab={lab} setLab={setLab} k={k} />}
            {bannerNode}
          </>
        )}
      </div>
      <FreeCard lab={lab} setLab={setLab} k={k} />
    </>
  );
}

function freeSentence(lab) {
  const t = L.taskOf(lab);
  return t.legs.map((l) => `${l.dir < 0 ? '−' : ''}$${frac(l.num, l.den)}$`).join('  ،  ');
}

/* ══════════════ La planche du portail : les étapes écrites en fractions ══════════════ */

function Board({ lab, k }) {
  const task = L.taskOf(lab);
  const st = L.legsState(lab);
  return (
    <div className="flex flex-wrap items-center gap-1.5" data-to-board role="list">
      {task.start > 0 && (
        <span className="rounded-full border-2 border-slate-200 bg-white px-2 py-0.5 text-xs font-extrabold text-slate-600" role="listitem"><MathText>{`${k('plan.start')} ${$(frac(task.startFrac.num, task.startFrac.den))}`}</MathText></span>
      )}
      {task.legs.map((l, i) => (
        <span key={i} role="listitem" data-to-leg={i} data-state={st[i]} data-kind={l.kind}
          className={`inline-flex items-center gap-1 rounded-full border-2 px-2.5 py-0.5 text-sm font-black ${st[i] === 'done' ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : st[i] === 'current' ? 'border-sky-500 bg-sky-50 text-sky-900 ring-2 ring-sky-200' : 'border-slate-200 bg-white text-slate-500'}`}>
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: l.dir < 0 ? COL.leg[2] : COL.leg[i % 2] }} aria-hidden="true" />
          {l.dir < 0 ? `${k('plan.back')} ` : ''}<MathText>{$(frac(l.num, l.den))}</MathText>
        </span>
      ))}
    </div>
  );
}

/* ══════════════ Le sentier : la scène ══════════════ */

function Trail({ lab, setLab, k, width, screenH, mood, girl }) {
  const uid = `to${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const task = L.taskOf(lab);
  const w = lab.w;
  const W = width;
  const H = screenH >= 1000 ? 280 : 208;
  const path = useMemo(() => L.makePath(W, H, task.loop), [W, H, task.loop]);
  const pos = path.at(w.pos / task.n);
  const locked = L.hikerLocked(lab);
  const svgRef = useRef(null);
  const dragRef = useRef(false);
  const fromEvent = (e) => {
    const box = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - box.left) / Math.max(1, box.width)) * W;
    const y = ((e.clientY - box.top) / Math.max(1, box.height)) * H;
    setLab((s) => L.dragTo(s, path.project(x, y)));
  };
  const down = (e) => { if (locked) return; dragRef.current = true; e.currentTarget.setPointerCapture?.(e.pointerId); fromEvent(e); };
  const move = (e) => { if (dragRef.current) fromEvent(e); };
  const up = () => { dragRef.current = false; };
  const key = (e) => {
    const mp = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 };
    if (e.key in mp) { e.preventDefault(); setLab((s) => L.nudge(s, mp[e.key])); }
    if (e.key === 'PageUp') { e.preventDefault(); setLab((s) => L.nudgeRed(s, 1)); }
    if (e.key === 'PageDown') { e.preventDefault(); setLab((s) => L.nudgeRed(s, -1)); }
    if (e.key === 'Enter') { e.preventDefault(); setLab(L.arrive); }
  };
  const nPosts = task.loop ? task.n : task.n + 1;
  // les empreintes : une couleur par étape, tracée sur le sentier de la position d'avant à la position d'après
  const prints = [];
  if (!locked || w.phase !== 'predict') {
    let at = task.start;
    task.legs.forEach((l, i) => {
      if (i >= w.li) return;
      const to = at + l.dir * l.posts;
      prints.push({ i, d: path.sub(at / task.n, to / task.n, 48), back: l.dir < 0 });
      at = to;
    });
  }
  const fl = lab.flag;
  const fp = fl ? path.at(fl.at) : null;
  const flagPillW = 108;
  const flagX = fp ? Math.min(W - flagPillW / 2 - 4, Math.max(flagPillW / 2 + 4, fp.x)) : 0;
  const gate = path.at(0);
  const spring = path.at(1);

  return (
    <div className="space-y-1.5" data-to-scene-box>
      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: W, display: 'block', margin: '0 auto', touchAction: 'none' }} role="group" aria-label={k('stageAria')} data-to-scene dir="ltr">
        <TrailBackdrop W={W} H={H} uid={uid} loop={task.loop} />
        <path d={path.d} fill="none" stroke={COL.trailEdge} strokeWidth={15} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" />
        <path d={path.d} fill="none" stroke={COL.trail} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" />
        {prints.map((p) => <path key={p.i} d={p.d} fill="none" stroke={p.back ? COL.leg[2] : COL.leg[p.i % 2]} strokeWidth={4} strokeLinecap="round" strokeDasharray={p.back ? '6 5' : '1 7'} aria-hidden="true" data-to-print={p.i} />)}
        <Gate x={gate.x - 30} y={gate.y + 2} label={k('gate')} />
        {!task.loop && <Spring x={spring.x + 22} y={spring.y + 2} label={k('spring')} />}
        {Array.from({ length: nPosts }, (_, i) => {
          if (!task.loop && (i === 0 || i === task.n)) return null;
          if (task.loop && i === 0) return null;
          const p = path.at(i / task.n);
          const red = !!task.k && i % task.k === 0;
          return <Post key={i} x={p.x} y={p.y} red={red} data-to-post={i} {...(red ? { 'data-red': 'true' } : {})} />;
        })}
        {fl && fp && (
          <g data-to-flag data-model={fl.model} className="to-pop">
            <line x1={fp.x} x2={fp.x} y1={fp.y} y2={fp.y - 34} stroke="#334155" strokeWidth={2} strokeDasharray="4 3" />
            <rect x={flagX - flagPillW / 2} y={fp.y - 58} width={flagPillW} height={22} rx={11} fill="#FFF7ED" stroke="#EA580C" strokeWidth={1.4} strokeDasharray="5 3" />
            <text x={flagX} y={fp.y - 43} textAnchor="middle" fontSize={11.5} fontWeight={900} fill="#9A3412">{`${k('w.flag', { w: iso(fl.text) })}`}</text>
          </g>
        )}
        <g role="slider" tabIndex={locked ? -1 : 0} aria-label={k('hikerAria')} aria-valuemin={0} aria-valuemax={task.max} aria-valuenow={w.pos} aria-valuetext={iso(w.pos)} aria-disabled={locked}
          data-to-hiker data-posts={w.pos} data-locked={locked ? 'true' : 'false'} onKeyDown={key} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
          className={ring} style={{ cursor: locked ? 'not-allowed' : 'grab', outline: 'none', touchAction: 'none' }}>
          <circle cx={pos.x} cy={pos.y - 22} r={32} fill="transparent" />
          <ellipse cx={pos.x} cy={pos.y + 1} rx={13} ry={4} fill="#000000" opacity={0.18} />
          <Hiker x={pos.x} y={pos.y} girl={girl} mood={mood} />
          {locked && <g aria-hidden="true"><circle cx={pos.x + 16} cy={pos.y - 46} r={9} fill="#F1F5F9" stroke="#64748B" strokeWidth={1.2} /><rect x={pos.x + 12} y={pos.y - 47} width={8} height={6} rx={1} fill="#64748B" /></g>}
        </g>
      </svg>
    </div>
  );
}

/* ══════════════ Le compteur du poignet ══════════════ */

function Counters({ lab, k }) {
  const task = L.taskOf(lab);
  const c = L.counters(lab);
  const hide = lab.w.phase === 'predict';
  const pill = 'inline-flex items-center gap-1.5 rounded-xl border-2 px-2.5 py-0.5 text-xs font-black tabular-nums';
  return (
    <div className="flex flex-wrap items-center gap-2" data-to-counters>
      <span className={`${pill} border-slate-300 bg-white text-slate-800`} data-to-counter="white" data-value={hide ? '' : c.white}>
        <span className="h-3 w-3 rounded-full border-2 border-slate-400 bg-white" aria-hidden="true" />{k('counters.white')} <bdi dir="ltr" className="text-base">{hide ? k('counters.hidden') : c.white}</bdi>
      </span>
      {task.k > 0 && (
        <span className={`${pill} border-red-300 bg-red-50 text-red-900`} data-to-counter="red" data-value={hide ? '' : c.red}>
          <span className="h-3 w-3 rounded-full bg-red-600" aria-hidden="true" />{k('counters.red')} <bdi dir="ltr" className="text-base">{hide ? k('counters.hidden') : c.red}</bdi>
          {!hide && c.leftover > 0 && <span className="text-xs font-extrabold text-red-800">{k('counters.redLeft', { n: iso(c.leftover) })}</span>}
        </span>
      )}
    </div>
  );
}

/* ══════════════ Les commandes : −/+, rouge −/+, « وصلنا » ══════════════ */

function Controls({ lab, setLab, k }) {
  const task = L.taskOf(lab);
  const w = lab.w;
  const locked = L.hikerLocked(lab);
  const btn = 'inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-2xl border-2 px-3 text-sm font-black';
  return (
    <LabCard className="space-y-2 p-2" data-to-controls>
      <Counters lab={lab} k={k} />
      {w.phase !== 'predict' && <div className="flex items-center gap-1.5" dir="ltr">
        {task.k > 0 && (
          <button type="button" onClick={() => setLab((s) => L.nudgeRed(s, -1))} disabled={locked || w.pos < task.k} data-to-red-minus aria-label={k('redLess')}
            className={`${btn} min-w-[44px] border-red-300 bg-white px-2 text-red-900 disabled:opacity-40 ${ring}`}><Minus className="h-4 w-4" strokeWidth={3} aria-hidden="true" /><span className="h-3 w-1.5 rounded-sm bg-red-600" aria-hidden="true" /></button>
        )}
        <RoundButton onClick={() => setLab((s) => L.nudge(s, -1))} disabled={locked || w.pos <= 0} aria-label={k('less')} size={48} data-to-less><Minus className="h-5 w-5" strokeWidth={3} aria-hidden="true" /></RoundButton>
        <button type="button" onClick={() => setLab(L.arrive)} disabled={locked || w.phase !== 'walk'} data-to-arrive
          className={`${btn} flex-1 border-indigo-600 bg-indigo-600 text-lg text-white shadow-[0_4px_0_0_#3730A3] transition-all duration-150 active:translate-y-0.5 disabled:opacity-50 motion-reduce:transition-none ${ring}`}>
          {locked && w.phase === 'predict' ? <Lock className="h-4 w-4" aria-hidden="true" /> : <Flag className="h-4 w-4" aria-hidden="true" />}{k('arrive')}
        </button>
        <RoundButton primary onClick={() => setLab((s) => L.nudge(s, 1))} disabled={locked || w.pos >= task.max} aria-label={k('more')} size={48} data-to-more><Plus className="h-5 w-5" strokeWidth={3} aria-hidden="true" /></RoundButton>
        {task.k > 0 && (
          <button type="button" onClick={() => setLab((s) => L.nudgeRed(s, 1))} disabled={locked || w.pos + task.k > task.max} data-to-red-plus aria-label={k('redMore')}
            className={`${btn} min-w-[44px] border-red-600 bg-red-600 px-2 text-white shadow-[0_3px_0_0_#991B1B] disabled:opacity-40 ${ring}`}><Plus className="h-4 w-4" strokeWidth={3} aria-hidden="true" /><span className="h-3 w-1.5 rounded-sm bg-white" aria-hidden="true" /></button>
        )}
      </div>}
    </LabCard>
  );
}

/* ══════════════ L'écriture : « أين وصل الفوج ؟ » ══════════════ */

function Writer({ lab, setLab, k }) {
  const task = L.taskOf(lab);
  const phase = lab.w.phase;
  const active = phase === 'predict' || phase === 'write';
  const [vals, setVals] = useState({ pos: '', rest: '' });
  useEffect(() => { setVals({ pos: '', rest: '' }); }, [lab.ti, lab.free]);
  if (!active && !(task.predict && lab.w.predicted?.pos)) return null;
  const fields = phase === 'write' ? ['pos'] : task.fields;
  return (
    <LabCard className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-amber-200 bg-amber-50/50 p-2" data-to-write data-field={fields.join(',')} data-phase={phase}>
      {fields.map((f) => {
        const ok = !!lab.w.predicted?.[f];
        return (
          <form key={f} className="flex min-w-[15rem] flex-1 items-center gap-2" onSubmit={(e) => { e.preventDefault(); if (!ok) setLab((s) => L.write(s, f, vals[f])); }}>
            <label className="flex flex-1 flex-wrap items-center gap-2 text-sm font-black text-amber-950">
              <span className="min-w-[5.5rem] text-xs">{k(f === 'rest' ? 'w.labelRest' : 'w.label')}</span>
              <input type="text" inputMode="text" autoComplete="off" dir="ltr" value={ok ? '✓' : vals[f]} readOnly={ok} maxLength={8} placeholder={k('w.placeholder')} aria-label={k('w.aria')} data-to-input={f}
                onChange={(e) => setVals((v) => ({ ...v, [f]: e.target.value.replace(/[^0-9٠-٩/⁄\-−]/g, '') }))}
                className={`h-10 w-24 rounded-xl border-2 bg-white px-2 text-center text-lg font-black tabular-nums text-indigo-950 ${ok ? 'border-emerald-500' : 'border-amber-300'} ${ring}`} />
            </label>
            <button type="submit" disabled={ok || !vals[f]} data-to-check={f}
              className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-2xl border-2 border-amber-600 bg-amber-500 px-4 text-sm font-black text-white disabled:opacity-40 ${ring}`}>
              {ok ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : null}{k('w.check')}
            </button>
          </form>
        );
      })}
    </LabCard>
  );
}

/* ══════════════ « جرّب أعدادك » : toujours ouvert ══════════════ */

function FreeCard({ lab, setLab, k }) {
  const free = L.isFree(lab);
  const [v, setV] = useState({ a: '', b: '', c: '', d: '' });
  const [op, setOp] = useState('+');
  const [guess, setGuess] = useState('');
  useEffect(() => { if (!lab.free) { setV({ a: '', b: '', c: '', d: '' }); setGuess(''); } }, [lab.free]);
  const chk = L.freeCheck(v.a, v.b, v.c, v.d, op);
  const filled = v.a && v.b && v.c && v.d;
  const msg = filled && !chk.ok && chk.why !== 'incomplete' ? k(`free.${chk.why}`) : null;
  const clean = (s) => s.replace(/[^0-9٠-٩]/g, '').slice(0, 2);
  const setField = (f) => (e) => { const nv = { ...v, [f]: clean(e.target.value) }; setV(nv); if (L.freeCheck(nv.a, nv.b, nv.c, nv.d, op).ok) setLab((s) => L.freeTask(s, nv.a, nv.b, nv.c, nv.d, op)); };
  const inp = `h-11 w-16 rounded-xl border-2 border-amber-300 bg-white px-1 text-center text-xl font-black tabular-nums text-indigo-950 ${ring}`;
  return (
    <LabCard className="space-y-3 border-emerald-200 bg-emerald-50/50 p-3" data-to-free data-active={free ? 'true' : 'false'}>
      <p className="flex items-center gap-1.5 text-sm font-black text-emerald-900"><FlaskConical className="h-4 w-4" aria-hidden="true" /> {k('free.title')}</p>
      <p className="text-xs font-bold leading-snug text-slate-600">{free ? k('free.on') : k('free.hint')}</p>
      <div className="flex flex-wrap items-center gap-2" dir="ltr">
        <span className="flex flex-col items-center gap-1">
          <input type="text" inputMode="numeric" autoComplete="off" value={v.a} aria-label={k('free.a')} data-to-free-a onChange={setField('a')} className={inp} />
          <span className="h-0.5 w-12 bg-slate-500" aria-hidden="true" />
          <input type="text" inputMode="numeric" autoComplete="off" value={v.b} aria-label={k('free.b')} data-to-free-b onChange={setField('b')} className={inp} />
        </span>
        <button type="button" data-to-free-op={op} aria-label={k('free.op')} onClick={() => { const n = op === '+' ? '-' : '+'; setOp(n); if (L.freeCheck(v.a, v.b, v.c, v.d, n).ok) setLab((s) => L.freeTask(s, v.a, v.b, v.c, v.d, n)); }}
          className={`inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-sky-300 bg-white text-2xl font-black text-sky-900 ${ring}`}>{op === '+' ? '+' : '−'}</button>
        <span className="flex flex-col items-center gap-1">
          <input type="text" inputMode="numeric" autoComplete="off" value={v.c} aria-label={k('free.c')} data-to-free-c onChange={setField('c')} className={inp} />
          <span className="h-0.5 w-12 bg-slate-500" aria-hidden="true" />
          <input type="text" inputMode="numeric" autoComplete="off" value={v.d} aria-label={k('free.d')} data-to-free-d onChange={setField('d')} className={inp} />
        </span>
        {free && (
          <>
            <label className="flex items-center gap-1.5 text-xs font-black text-amber-900" dir="rtl">{k('free.guess')}
              <input type="text" inputMode="text" dir="ltr" value={guess} maxLength={8} aria-label={k('free.guessAria')} data-to-free-guess placeholder={k('w.placeholder')}
                onChange={(e) => { const g = e.target.value.replace(/[^0-9٠-٩/]/g, ''); setGuess(g); setLab((s) => L.freeFlag(s, g)); }} className={`${inp} w-28`} />
            </label>
            <button type="button" onClick={() => { setGuess(''); setLab(L.toGuided); }} data-to-free-back
              className={`inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-emerald-200 bg-white px-3 text-xs font-bold text-emerald-900 ${ring}`} dir="rtl">
              <Undo2 className="h-4 w-4" aria-hidden="true" /> {k('free.back')}
            </button>
          </>
        )}
      </div>
      {msg && <p className="text-xs font-bold text-rose-700" data-to-free-msg>{msg}</p>}
    </LabCard>
  );
}

/* ══════════════ La découverte et la règle ══════════════ */

/** Quelle règle la tâche de départ conduit à formuler : 'sub' (g3 : 3/4 − 5/12), 'add' (a3 : 1/6 + 7/12) ou 'k1' (la tâche de « معارف » : 3/8 + 1/4). */
const variantOf = (lab) => (lab.tasks[0].id === 'k1' ? 'k1' : lab.tasks[0].predict ? 'add' : 'sub');

export function ruleOptions(lab, k) {
  const v = variantOf(lab);
  const sfx = { sub: 'Sub', add: 'Sum', k1: 'K' }[v];
  return [
    { text: <MathText>{k('rule.right')}</MathText>, correct: true },
    { text: <MathText>{k('rule.across')}</MathText>, why: <MathText>{k(`rule.whyAcross${sfx}`)}</MathText> },
    { text: <MathText>{k('rule.noUnify')}</MathText>, why: <MathText>{k(`rule.whyNoUnify${sfx}`)}</MathText> },
  ];
}

export function Formal({ lab, k }) {
  const v = variantOf(lab);
  const line = { sub: '\\frac34-\\frac5{12}=\\frac9{12}-\\frac5{12}=\\frac4{12}=\\frac13', add: '\\frac16+\\frac7{12}=\\frac2{12}+\\frac7{12}=\\frac9{12}=\\frac34', k1: '\\frac38+\\frac14=\\frac38+\\frac28=\\frac58' }[v];
  return (
    <div className="space-y-2 text-sm font-bold text-emerald-950" data-to-formal>
      <p><MathText>{k({ sub: 'formal.sub', add: 'formal.add', k1: 'formal.k1' }[v])}</MathText></p>
      <p className="text-center text-base" dir="ltr"><MathText>{$(line)}</MathText></p>
      {v === 'add' && <p className="text-center text-base" dir="ltr"><MathText>{$('1-\\frac34=\\frac44-\\frac34=\\frac14')}</MathText></p>}
      {v !== 'k1' && <p><MathText>{k('formal.rest')}</MathText></p>}
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

export const CHAINS = Object.freeze({
  g1: ['tot', 'frac', 'rest'],
  g2: ['redPosts', 'asWhite', 'whyNo'],
  g3: ['rule'],
  a1: ['whyOne'],
  a2: ['whiteBack', 'diff'],
  a3: ['rest12'],
  a4: ['loopCount', 'natural', 'ruleMulti'],
  k1: ['ksum', 'ruleMulti'],
});

const Mx = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const T = (s) => <MathText>{s}</MathText>;
const hints = (k, id) => [Mx(k, `${id}.hint1`), Mx(k, `${id}.hint2`)];
const choice = (k, id, opts, extra = {}) => ({ id, kind: 'choice', prompt: Mx(k, `${id}.prompt`), options: opts, hints: hints(k, id), explain: Mx(k, `${id}.explain`), ...extra });
const numberQ = (k, id, expected) => ({ id, kind: 'number', expected: String(expected), answer: T($(String(expected))), prompt: Mx(k, `${id}.prompt`), hints: hints(k, id), explain: Mx(k, `${id}.explain`) });

/** Chaque question vient des tâches jouées (les nombres sont ceux des étapes), jamais d'un texte libre. */
export const QUESTIONS = {
  tot: (lab, task, k) => numberQ(k, 'tot', task.end),
  frac: (lab, task, k) => choice(k, 'frac', [
    { text: T(k('cp.frac.wrongAcross')), why: Mx(k, 'frac.whyAcross') },
    { text: T(k('cp.frac.right')), correct: true },
    { text: T(k('cp.frac.wrongInv')), why: Mx(k, 'frac.whyInv') },
  ]),
  ksum: (lab, task, k) => choice(k, 'ksum', [
    { text: T(k('cp.ksum.wrongAcross')), why: Mx(k, 'ksum.whyAcross') },
    { text: T(k('cp.ksum.wrongNo')), why: Mx(k, 'ksum.whyNo') },
    { text: T(k('cp.ksum.right')), correct: true },
  ]),
  rest: (lab, task, k) => choice(k, 'rest', [
    { text: T(k('cp.rest.wrongSame')), why: Mx(k, 'rest.whySame') },
    { text: T(k('cp.rest.wrongNine')), why: Mx(k, 'rest.whyNine') },
    { text: T(k('cp.rest.right')), correct: true },
  ]),
  redPosts: (lab, task, k) => numberQ(k, 'redPosts', task.legs.find((l) => l.kind === 'red').posts),
  asWhite: (lab, task, k) => numberQ(k, 'asWhite', task.legs.find((l) => l.kind === 'red').posts),
  whyNo: (lab, task, k) => choice(k, 'whyNo', [
    { text: T(k('cp.whyNo.wrongRule')), why: Mx(k, 'whyNo.whyRule') },
    { text: T(k('cp.whyNo.right')), correct: true },
    { text: T(k('cp.whyNo.wrongBig')), why: Mx(k, 'whyNo.whyBig') },
  ]),
  rule: (lab, task, k) => ({
    id: 'rule', kind: 'choice', prompt: Mx(k, 'rule.prompt'), options: ruleOptions(lab, k), hints: hints(k, 'rule'), explain: <Formal lab={lab} k={k} />,
  }),
  ruleMulti: (lab, task, k) => ({
    id: 'ruleMulti', kind: 'choice', prompt: Mx(k, 'ruleMulti.prompt'), options: ruleOptions(lab, k), hints: hints(k, 'ruleMulti'), explain: <Formal lab={lab} k={k} />,
  }),
  whyOne: (lab, task, k) => choice(k, 'whyOne', [
    { text: T(k('cp.whyOne.wrongBoth')), why: Mx(k, 'whyOne.whyBoth') },
    { text: T(k('cp.whyOne.right')), correct: true },
    { text: T(k('cp.whyOne.wrongSmall')), why: Mx(k, 'whyOne.whySmall') },
  ]),
  whiteBack: (lab, task, k) => numberQ(k, 'whiteBack', task.legs[0].posts),
  diff: (lab, task, k) => choice(k, 'diff', [
    { text: T(k('cp.diff.wrongA')), why: Mx(k, 'diff.whyA') },
    { text: T(k('cp.diff.right')), correct: true },
    { text: T(k('cp.diff.wrongB')), why: Mx(k, 'diff.whyB') },
  ]),
  rest12: (lab, task, k) => choice(k, 'rest12', [
    { text: T(k('cp.rest12.wrongPart')), why: Mx(k, 'rest12.whyPart') },
    { text: T(k('cp.rest12.wrongTen')), why: Mx(k, 'rest12.whyTen') },
    { text: T(k('cp.rest12.right')), correct: true },
  ]),
  loopCount: (lab, task, k) => numberQ(k, 'loopCount', task.end),
  natural: (lab, task, k) => choice(k, 'natural', [
    { text: T(k('cp.natural.right')), correct: true },
    { text: T(k('cp.natural.wrongSum')), why: Mx(k, 'natural.whySum') },
    { text: T(k('cp.natural.wrongSix')), why: Mx(k, 'natural.whySix') },
  ]),
};
