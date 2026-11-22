import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Hand, CheckCircle2, Sparkles, ChevronLeft, FlaskConical, Undo2, Minus, Plus, PenLine, Droplets } from 'lucide-react';
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
import * as L from '../logic/juiceLine';
import { COL, Crate, Bottle, Student } from './juiceLine/art';

/**
 * juice-line — L'INCONNUE SOUS LA MAIN (2AM, unité 4, درس « حلّ مشكل باستعمال معادلة », 2026-10-29). La logique, exacte (centilitres entiers), est dans `logic/juiceLine.js` ; les maths de l'inconnue viennent de `equation2.js` E2
 * (importé par chemin). Thème `juicery` : la معصرة البرتقال التعاونية — un réservoir en inox gradué, un tapis, une buse, des bouteilles. À مبتدئ la main tient la CAPACITÉ x du moule (deux essais seulement), à متقدم le contenu du RÉSERVOIR.
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. La main tient l'inconnue x : elle étire le moule (poignée, − / +, ↑ ↓) ou règle le réservoir, puis « املأ » lance un essai (deux seulement à مبتدئ). « اكتب العملية » ouvre l'ardoise : on tape x ou l'opération qui le donne (« 18 ÷ 12 »).
 * B. Le dessin répond : combien de bouteilles pleines, la bouteille partielle (tracée à son niveau), le jus qui reste dans le réservoir. C'est l'équation lue dans le monde : 12 bouteilles de x litres font 18 litres.
 * C. La résistance : deux essais seulement (un essai raté gâche des bouteilles) ; la multiplication ou le renversement sont refusés PAR LE DESSIN (moule qui déborde, mille petites bouteilles).
 * D. La phase formelle écrit ce que l'élève a fait : 12 × x = 18 ، x = 18 ÷ 12 = 1,5 ; x ÷ 24 = 0,25 ، x = 24 × 0,25 = 6 ; (4 + x) ÷ 0,25 = 40 ، 4 + x = 10 ، x = 6.
 * E. Les fausses opérations sont refutées par le DESSIN de leur valeur : ×, renversée, soustraite, ajoutée ; les cartes d'équations refusent « 18 × x = 12 » et « x ÷ 12 = 18 ».
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        une équation traduit une situation ; sa solution est la valeur qui la rend vraie ; on la trouve par l'opération inverse
 *   OBJECT         un réservoir gradué, un moule de bouteille, un tapis de bouteilles, une ardoise, quatre cartes d'équations
 *   VARIABLE       x, la capacité du moule (مبتدئ) ou le contenu du réservoir (متقدم)
 *   INVARIANT      commande × capacité = contenu : le jus total ne change pas
 *   TRANSFORMATION x → (bouteilles pleines, bouteille partielle, jus resté)
 *   CONSTRAINT     deux essais seulement ; le moule ne dépasse pas 2 L, le réservoir 30 L
 *   RESISTANCE     les opérations fausses sont refusées et dessinées ; les cartes demandent TOUTES les bonnes équations
 *   EVIDENCE       le compteur de bouteilles, le niveau de la bouteille partielle, le jus resté, la fenêtre graduée
 *   CONTRAST       un facteur / un diviseur manquant (مبتدئ) contre un dividende manquant et deux étapes (متقدم)
 *   PREDICTION     (متقدم) l'ardoise s'ouvre d'abord : on écrit l'opération avant de régler le réservoir
 *   DISCOVERY      « كيف نجد السعة المجهولة دون تجريب أعمى ؟ »
 *   FORMALIZATION  12 × x = 18 ⟹ x = 18 ÷ 12 = 1,5 ; puis le contrôle par un remplissage exact
 *   TRANSFER       « جرّب أعدادك » (toujours ouvert), les exercices et la banque
 *
 * « جرّب كل الإمكانيات » : NON. « جرّب أعدادك » est TOUJOURS ouvert sous le labo (jamais compté). ONBOARDING : `coach` (défaut true) → `LabCoach` ; `logic/juiceLine.js › coachOf` (mould · fill · leftover · slate · cards · tank · next).
 * Props : `tasks`, `level`, `levels`, `coach`, `title`, `lead`, `onTrial(event)`, `onFinished()`.
 * CONTRAT DOM : [data-juice-line][data-level][data-task][data-x][data-tests][data-solved][data-layout], [data-jl-scene], [data-jl-mould][role=slider], [data-jl-tank][role=slider], [data-jl-fill], [data-jl-bottle=<i>][data-level],
 * [data-jl-left], [data-jl-tests], [data-jl-open-slate], [data-jl-slate], [data-jl-input], [data-jl-judge], [data-jl-cards], [data-jl-card=<id>][aria-pressed], [data-jl-cards-check], [data-jl-model], [data-jl-next],
 * [data-jl-step=<i>], [data-jl-free][data-active], [data-jl-free-start], [data-jl-free-back], [data-jl-formal], [data-jl-context], [data-jl-prompt].
 */
const NS = 'manipulation.juiceLine';
const LRI = '⁦';
const PDI = '⁩';
const iso = (s) => `${LRI}${s}${PDI}`;
const WIDE_MIN = 700;
const SIDE_W = 236;
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-orange-300';
const $ = (s) => `$${s}$`;
const OP_CHIPS = ['÷', '×', '−', '+', ','];
const W = 560;
const H = 270;
const BELT_Y = 200;
const SLOT0 = 150;
const SLOT_DX = 27;
const TANK = { x: 22, y: 30, w: 92, h: 146 };
const WIN = { x: 34, y: 40, w: 54, h: 126 };   // la fenêtre graduée : 30 L en 126 px
const MOULD = { x: 478, w: 52, pxPerCl: 0.5 };

export function numbersFor({ tasks, level }) {
  const lv = resolveLevelId(level ?? 'beginner');
  const asked = LEVELS['juice-line'][lv].numbers;
  return { tasks: tasks ?? asked.tasks };
}

export default function JuiceLine({
  tasks, title, lead, level, levels: withLevels = true, coach: coachOn = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const initialNumbers = useMemo(() => numbersFor({ tasks, level }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'juice-line', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
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
  const cpSettings = useLabCheckpointSettings('juice-line');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const chain = cpOn && cpSettings.enabled && !L.isFree(lab) ? CHAINS[cur.id] ?? null : null;
  const cp = useLabCheckpoint({
    id: chain ? cur.id : null,
    questions: chain && L.taskDone(lab) ? chain.map((q) => QUESTIONS[q](lab, cur, k)) : null,
    reached: L.taskDone(lab),
    resetKey: scene.inits,
    onRetry: () => setLab(L.restartTask),
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => { if (CHAINS[id]?.includes('last') || CHAINS[id]?.includes('rule') || CHAINS[id]?.includes('x')) { state.discover(); state.formalize(); } },
  });
  const ready = L.discoveryReady(lab);
  useEffect(() => { if (ready) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  const finishedOnce = useRef(false);
  useEffect(() => {
    if (!ready) { finishedOnce.current = false; return; }
    if (!finishedOnce.current) { finishedOnce.current = true; state.report(onFinished, {}); }
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps
  const reported = useRef(0);
  const nTrials = lab.trials.length;
  useEffect(() => {
    if (nTrials < reported.current) reported.current = 0;
    for (let i = reported.current; i < nTrials; i += 1) state.report(onTrial, L.trialEvidence(lab.trials[i]));
    reported.current = nTrials;
  }, [nTrials, lab.trials]); // eslint-disable-line react-hooks/exhaustive-deps

  const coachStep = coachOn && !cp.open ? L.coachOf(lab) : null;
  const coach = useLabCoach({
    lab: 'juice-line', step: coachStep,
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
  const advanced = lab.tasks[0].kind === 'tank';
  const discovery = (
    <ManipulationDiscovery state={state} prompt={<MathText>{k('discovery.prompt')}</MathText>} options={ruleOptions(k, advanced)} formal={<Formal lab={lab} k={k} />} />
  );

  return (
    <ManipulationShell
      type="juice-line"
      title={title ?? k('title')}
      titleHidden
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      coach={coachOn ? coach : null}
      headerAction={cpOn ? cpSettings.control : null}
      guided={!!chain}
      hints={[0, 1, 2].map((i) => k(`hints.${i}`))}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      discovery={discovery}
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-orange-50/70 to-white">
        <div ref={boxRef} className="space-y-2" data-juice-line data-level={advanced ? 'advanced' : 'beginner'} data-task={lab.free ? 'free' : lab.ti}
          data-x={lab.free ? lab.free.x : lab.w.x} data-tests={lab.w.testsLeft} data-solved={ready ? 'true' : 'false'} data-layout={width >= WIDE_MIN ? 'wide' : 'narrow'}>
          <Lab lab={lab} setLab={setLab} k={k} width={width} screenH={screenH} lead={state.isAuthoredLevel ? lead : null} cp={cp} advanced={advanced} />
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ══════════════ Le laboratoire ══════════════ */

const modelParams = (flag, miss) => {
  const f = miss?.fill;
  return {
    value: iso(flag?.value ? (L.lText(Math.round(Number(flag.value.n) * 100 / Number(flag.value.d)))) : ''),
    x: iso(L.lText(miss?.x ?? 0)), full: iso(f?.full ?? 0), left: iso(L.lText(f?.left ?? 0)), partial: iso(L.lText(f?.partial ?? 0)),
  };
};

function Lab({ lab, setLab, k, width, screenH, lead, cp, advanced }) {
  const wide = width >= WIDE_MIN;
  const task = L.taskOf(lab);
  const free = L.isFree(lab);
  const done = L.taskDone(lab);
  const lit_ = !free && done;
  const w = lab.w;
  const last = lab.last;
  const flag = lab.flag;

  /* ── la consigne : le contexte puis UNE question ── */
  const ctx = (() => {
    if (lead && lab.ti === 0 && !free) return lead;
    if (free) return k('ctx.free');
    return k(`ctx.${task.id}`);
  })();
  const question = free ? k('q.free') : k(`q.${task.id}`);

  const stepDone = lab.tasks.map((_, i) => !!lab.done[i] && (i !== lab.ti || !cp.blocking));
  const steps = lab.tasks.length > 1 && !free && <LabStepper count={lab.tasks.length} current={lab.ti} done={stepDone} stepAttr="data-jl-step" />;
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.trials.length === 0 && celebrated.current.size) celebrated.current = new Set();
  const nowDone = !free && stepDone[lab.ti];
  useEffect(() => {
    if (!nowDone || celebrated.current.has(lab.ti)) return;
    celebrated.current.add(lab.ti);
    party.celebrate({ n: lab.ti + 1, total: lab.tasks.length });
  }, [nowDone, lab.ti]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── le son (muet sauf « الصوت ») : un déclic par cran de la main, le drapeau pour un remplissage exact ou une opération juste, « over » sur un reste ou un refus, la cloche à la fin ── */
  const hand = free ? lab.free.x : w.x;
  const sfxRef = useRef({ h: hand, key: '' });
  const sfxKey = `${free ? 'free' : lab.ti}`;
  useEffect(() => {
    const p = sfxRef.current;
    if (p.key !== sfxKey) { sfxRef.current = { h: hand, key: sfxKey }; return; }
    if (hand !== p.h) playSfx('gesture', { pitch: hand > p.h ? 1 : 0.75 });
    p.h = hand;
  }, [hand, sfxKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const nTrials = lab.trials.length;
  useEffect(() => {
    if (!nTrials) return;
    const tr = lab.trials[nTrials - 1];
    if (tr.kind === 'solved') playSfx('bell');
    else if (tr.kind === 'fill') playSfx(tr.left === 0 && tr.partial === 0 ? 'flag' : 'over');
    else if (tr.kind === 'operation' || tr.kind === 'cards') playSfx(tr.ok ? 'flag' : 'over');
  }, [nTrials]); // eslint-disable-line react-hooks/exhaustive-deps

  const prompt = (
    <PromptCard size={wide ? 'lg' : 'md'} context={<MathText>{ctx}</MathText>} contextProps={{ 'data-jl-context': free ? 'free' : task.id }}
      title={<MathText>{question}</MathText>} titleClassName={wide ? 'text-xl' : 'text-lg'} lamp={free ? null : lit_ ? 'on' : 'off'}
      titleProps={{ 'data-jl-prompt': task.id, 'data-lit': lit_ ? 'true' : 'false' }} />
  );

  /* ── le verdict : la CONSÉQUENCE avec les nombres de l'élève, jamais la règle ── */
  const fillLine = (f) => {
    const p = { full: iso(f.full), left: iso(L.lText(f.left)), partial: iso(L.lText(f.partial)), short: iso(f.short) };
    if (f.full > 0 && f.short === 0 && f.partial === 0 && f.left === 0) return k('v.fillExact', p);
    if (f.left > 0) return k('v.fillLeftover', p);
    return f.partial > 0 ? k('v.fillPartial', p) : k('v.fillShort', p);
  };
  const verdictLine = (() => {
    if (last?.kind === 'denied') return k('v.denied');
    if (last?.kind === 'cards') return last.ok ? k('v.cardsOk') : flag?.cards?.wrong ? k(`v.cardWrong.${flag.cards.wrong}`) : k('v.cardsMissing');
    if (last?.kind === 'operation') {
      if (last.ok) return task.kind === 'mould' ? k('v.opOk') : w.phase === 'slate' ? k('v.opStageOk') : k('v.opTankOk');
      if (flag?.unreadable) return k('v.unreadable');
      const mp = modelParams(flag, w.miss);
      const intro = k(`m.${task.kind}.${flag?.model ?? 'other'}`, mp);
      return task.kind === 'tank' ? `${intro} ${w.miss?.over ? k('v.tankOver') : k('v.tankFilled', mp)}` : intro;
    }
    if (last?.kind === 'fill') {
      const f = last;
      return fillLine(f);
    }
    if (w.phase === 'slate') return k(task.kind === 'mould' ? 'v.slateIdle' : w.stage === 'total' || !task.carry ? 'v.slateTank' : 'v.slateFinal');
    if (w.phase === 'cards') return k('v.cardsIdle');
    if (w.phase === 'set') return k('v.setIdle');
    if (done) return L.discoveryReady(lab) ? k('v.allDone') : k('v.taskDone');
    return k(w.fills ? 'v.testIdle' : 'v.idle', { n: iso(w.testsLeft) });
  })();
  const bad = !!(last && ((last.kind === 'operation' || last.kind === 'cards') && !last.ok || last.kind === 'denied' || (last.kind === 'fill' && (last.left > 0 || last.partial > 0 || last.short > 0))));
  const good = !bad && !!last && ((last.kind === 'operation' || last.kind === 'cards') && last.ok || (last.kind === 'fill' && last.full > 0 && last.left === 0 && last.partial === 0 && last.short === 0));
  const tone = bad ? 'rose' : good ? 'emerald' : 'amber';
  const Icon = bad ? Sparkles : good ? CheckCircle2 : Hand;
  const canNext = L.canNext(lab) && !cp.blocking;
  const mood = bad ? 'wonder' : done ? 'proud' : 'happy';
  const banner = (
    <VerdictBanner tone={tone} icon={wide ? Icon : null} size="sm" className="min-h-[3.5rem]" data-jl-verdict={bad ? 'bad' : good ? 'good' : ''}>
      <div className="min-w-0 space-y-1.5">
        <p className={last ? '' : 'font-bold text-amber-950'}><MathText>{verdictLine}</MathText></p>
        {canNext && (
          <button type="button" onClick={() => setLab(L.nextTask)} data-jl-next
            className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-2 border-emerald-600 bg-emerald-600 px-3.5 text-sm font-black text-white shadow-[0_3px_0_0_#047857] transition-all duration-150 active:translate-y-0.5 motion-reduce:transition-none ${ring}`}>
            {k('next')} <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </VerdictBanner>
  );

  const stageW = Math.min(540, Math.max(300, (wide ? width - SIDE_W - 12 : width) - 24));
  const stage = <Juicery lab={lab} setLab={setLab} k={k} width={stageW} screenH={screenH} mood={mood} girl={!advanced} />;
  const tools = <Tools lab={lab} setLab={setLab} k={k} />;

  return (
    <>
      <div className="relative space-y-2" data-jl-glance>
        {party.node}
        {cp.node}
        {prompt}
        {wide ? (
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <StageFrame className="min-w-0 space-y-1 overflow-hidden p-3" data-jl-stage>
                {steps ? <div className="flex flex-wrap items-center justify-end gap-x-3">{steps}</div> : null}
                {stage}
              </StageFrame>
              {tools}
            </div>
            <div className="flex shrink-0 flex-col gap-2.5" style={{ width: SIDE_W }}>{banner}</div>
          </div>
        ) : (
          <>
            <StageFrame className="min-w-0 space-y-1 overflow-hidden p-2" data-jl-stage>{steps || null}{stage}</StageFrame>
            {tools}
            {banner}
          </>
        )}
      </div>
      <FreeCard lab={lab} setLab={setLab} k={k} />
    </>
  );
}

/* ══════════════ La معصرة : réservoir, tapis, bouteilles, moule ══════════════ */

function Juicery({ lab, setLab, k, width, screenH, mood, girl }) {
  const free = L.isFree(lab);
  const task = L.taskOf(lab);
  const w = lab.w;
  const mould = free || task.kind === 'mould';
  const hand = free ? lab.free.x : w.x;
  const orderN = free ? lab.free.bottles : task.bottles;
  // ce qu'on voit dans le réservoir et la taille d'une bouteille
  const total = free ? lab.free.total : mould ? task.total : task.carry + w.x;

  const size = free || mould ? hand : task.size;
  const missTank = !free && !mould && w.phase === 'slate' && w.miss?.fill;
  const fillRes = free ? lab.free.lastFill : missTank ? w.miss.fill : w.lastFill;
  const shownTank = fillRes ? fillRes.left : total;
  const tankPx = (c) => Math.max(0, Math.min(WIN.h, (c / L.TANK_MAX) * WIN.h));
  const svgRef = useRef(null);
  const [drag, setDrag] = useState(null);
  const pt = (e) => {
    const box = svgRef.current.getBoundingClientRect();
    return { x: ((e.clientX - box.left) / Math.max(1, box.width)) * W, y: ((e.clientY - box.top) / Math.max(1, box.height)) * H };
  };
  const canMould = mould && (free || w.phase === 'test');
  const canTank = !mould && !free && w.phase === 'set';
  const start = (kind) => (e) => { svgRef.current.setPointerCapture?.(e.pointerId); setDrag(kind); e.preventDefault(); move2(kind, e); };
  const move2 = (kind, e) => {
    const p = pt(e);
    if (kind === 'mould') setLab((s) => L.stretch(s, (BELT_Y - p.y) / MOULD.pxPerCl));
    else setLab((s) => L.stretch(s, ((WIN.y + WIN.h - p.y) / WIN.h) * L.TANK_MAX - (L.taskOf(s).carry ?? 0)));
  };
  const move = (e) => { if (drag) move2(drag, e); };
  const up = () => setDrag(null);
  const key = (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { e.preventDefault(); setLab((s) => L.bump(s, 1)); }
    if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { e.preventDefault(); setLab((s) => L.bump(s, -1)); }
    if (e.key === 'Enter') { e.preventDefault(); setLab(L.pressFill); }
  };

  const slots = Math.min(orderN, L.SHOWN_BOTTLES);
  const bw = 12 + 8 * Math.sqrt(Math.max(5, size) / 200);
  const bh = 16 + 36 * Math.sqrt(Math.max(5, size) / 200);
  const extra = Math.max(0, (fillRes?.full ?? 0) - L.SHOWN_BOTTLES);
  const modelOver = w.miss && w.miss.value && Number(w.miss.value.n) * 100 / Number(w.miss.value.d) > L.MOULD_MAX;
  const mouldH = Math.min(L.MOULD_MAX, hand) * MOULD.pxPerCl;
  const hideLabel = mould && !free && w.fills === 0 && w.phase === 'test';
  const tankHandPx = tankPx(total);
  const hMax = screenH >= 900 ? 300 : 250;

  return (
    <div className="space-y-1" data-jl-scene-box>
      <style dangerouslySetInnerHTML={{ __html: '@keyframes jl-shake { 0%,100% { transform: translateX(0) } 25% { transform: translateX(-3px) } 75% { transform: translateX(3px) } } .jl-shake { animation: jl-shake 300ms ease-in-out 2; } @media (prefers-reduced-motion: reduce) { .jl-shake { animation: none !important; } }' }} />
      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: Math.min(W * 1.2, width), maxHeight: hMax, display: 'block', margin: '0 auto', touchAction: 'none', direction: 'ltr' }} role="group" aria-label={k('stageAria')}
        data-jl-scene dir="ltr" onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        <rect x={0} y={0} width={W} height={H} rx={12} fill={COL.wall} />
        <rect x={0} y={BELT_Y + 10} width={W} height={H - BELT_Y - 10} fill={COL.floor} opacity={0.8} />
        <Crate x={W - 30} y={H - 4} s={0.9} />
        <Crate x={W - 70} y={H - 4} s={0.75} />
        <Crate x={150} y={H - 4} s={0.8} />
        {/* le réservoir : inox, fenêtre graduée (litres) */}
        <rect x={TANK.x} y={TANK.y} width={TANK.w} height={TANK.h} rx={10} fill={COL.steel} stroke={COL.steelDark} strokeWidth={3} />
        <rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} rx={4} fill={COL.glass} stroke={COL.steelDark} strokeWidth={2} />
        <rect x={WIN.x + 1} y={WIN.y + WIN.h - tankPx(shownTank)} width={WIN.w - 2} height={tankPx(shownTank)} fill={COL.juice} data-jl-juice data-cl={shownTank} />
        {Array.from({ length: 31 }, (_, i) => i).map((i) => {
          const yy = WIN.y + WIN.h - (i / 30) * WIN.h;
          const major = i % 5 === 0;
          return <g key={i}><line x1={WIN.x + WIN.w} y1={yy} x2={WIN.x + WIN.w - (major ? 12 : 6)} y2={yy} stroke={COL.steelDark} strokeWidth={major ? 1.4 : 0.8} />{major && <text x={WIN.x + WIN.w + 4} y={yy + 3} fontSize={11} fontWeight={800} fill={COL.ink} textAnchor="start">{i}</text>}</g>;
        })}
        <text x={TANK.x + TANK.w / 2} y={TANK.y - 6} textAnchor="middle" fontSize={12.5} fontWeight={800} fill={COL.ink}>{k('tankLabel')}</text>
        <rect x={TANK.x + TANK.w / 2 - 6} y={TANK.y + TANK.h} width={12} height={BELT_Y - TANK.y - TANK.h - 22} fill={COL.steelDark} />
        <path d={`M${SLOT0 - 20} ${BELT_Y - 40} h26 v8 h-26 z`} fill={COL.steelDark} aria-hidden="true" />
        <rect x={SLOT0 - 20} y={BELT_Y - 56} width={8} height={18} fill={COL.steelDark} />
        {/* le tapis */}
        <rect x={SLOT0 - 22} y={BELT_Y} width={SLOT_DX * 12 + 6} height={8} rx={4} fill={COL.belt} />
        <rect x={SLOT0 - 22} y={BELT_Y + 8} width={SLOT_DX * 12 + 6} height={3} fill={COL.beltLight} />
        {/* les bouteilles de la commande : pleines, la partielle, les cases vides */}
        {Array.from({ length: slots }, (_, i) => {
          const cx = SLOT0 + i * SLOT_DX;
          const f = fillRes;
          const isFull = f && i < Math.min(f.full, slots);
          const isPartial = f && f.partial > 0 && i === f.full;
          return (
            <Bottle key={i} x={cx} y={BELT_Y} w={bw} h={bh} level={isFull ? 1 : isPartial ? f.partial / Math.max(1, size) : 0} dashed={!isFull && !isPartial} tone={isPartial ? 'bad' : 'full'}
              data-jl-bottle={i} data-level={isFull ? 'full' : isPartial ? 'partial' : 'empty'} />
          );
        })}
        {extra > 0 && <text x={SLOT0 + 11.5 * SLOT_DX} y={BELT_Y - bh - 4} textAnchor="middle" fontSize={14} fontWeight={900} fill={COL.juiceDark} data-jl-more>{`× ${extra + L.SHOWN_BOTTLES}`}</text>}
        {fillRes && fillRes.left > 0 && <text x={TANK.x + TANK.w / 2} y={TANK.y + TANK.h + 14} textAnchor="middle" fontSize={13} fontWeight={900} fill={COL.red} data-jl-left>{iso(L.lText(fillRes.left))}</text>}
        <text x={SLOT0 + 5.5 * SLOT_DX} y={BELT_Y - bh - 14} textAnchor="middle" fontSize={14} fontWeight={800} fill={COL.ink}>{k('orderLabel', { n: iso(orderN) })}</text>
        {!mould && <text x={SLOT0 + 5.5 * SLOT_DX} y={BELT_Y - bh - 28} textAnchor="middle" fontSize={14} fontWeight={800} fill={COL.steelDark}>{k('sizeLabel', { s: iso(L.lText(size)) })}</text>}
        {/* مبتدئ : le moule (poignée en haut) */}
        {mould && (
          <g data-jl-mould-box>
            <rect x={MOULD.x} y={BELT_Y - L.MOULD_MAX * MOULD.pxPerCl} width={MOULD.w} height={L.MOULD_MAX * MOULD.pxPerCl} rx={6} fill="none" stroke="#BAE6FD" strokeDasharray="4 4" />
            {Array.from({ length: 9 }, (_, i) => i).map((i) => {
              const yy = BELT_Y - i * 25 * MOULD.pxPerCl;
              return <g key={i}><line x1={MOULD.x + MOULD.w} y1={yy} x2={MOULD.x + MOULD.w - (i % 2 ? 6 : 11)} y2={yy} stroke={COL.mouldLine} strokeWidth={1} />{i % 2 === 0 && i > 0 && <text x={MOULD.x + MOULD.w + 6} y={yy + 3} fontSize={11} fontWeight={800} fill={COL.mouldLine}>{L.lText(i * 25)}</text>}</g>;
            })}
            <rect x={MOULD.x} y={BELT_Y - mouldH} width={MOULD.w} height={mouldH} rx={5} fill={COL.mould} fillOpacity={0.35} stroke={COL.mouldLine} strokeWidth={2} data-jl-mould-body />
            {modelOver && <text x={MOULD.x + MOULD.w / 2} y={BELT_Y - mouldH - 14} textAnchor="middle" fontSize={14} fontWeight={900} fill={COL.red} data-jl-overflow>{`≈ ${iso(L.lText(Math.round(Number(w.miss.value.n) * 100 / Number(w.miss.value.d))))}`}</text>}
            <g data-jl-mould role="slider" tabIndex={canMould ? 0 : -1} aria-label={k('mouldAria')} aria-valuemin={L.MOULD_MIN} aria-valuemax={L.MOULD_MAX} aria-valuenow={hand} aria-valuetext={`${L.lText(hand)} L`}
              onPointerDown={canMould ? start('mould') : undefined} onKeyDown={canMould ? key : undefined} style={{ cursor: canMould ? 'ns-resize' : 'default', touchAction: 'none' }} className={ring}>
              <rect x={MOULD.x - 8} y={BELT_Y - mouldH - 22} width={MOULD.w + 16} height={44} fill="transparent" />
              <rect x={MOULD.x - 4} y={BELT_Y - mouldH - 7} width={MOULD.w + 8} height={14} rx={7} fill={canMould ? COL.mouldLine : COL.steelDark} />
              <path d={`M${MOULD.x + MOULD.w / 2 - 5} ${BELT_Y - mouldH - 1} h10 M${MOULD.x + MOULD.w / 2 - 5} ${BELT_Y - mouldH + 2} h10`} stroke="#fff" strokeWidth={1.4} />
            </g>
            {!hideLabel && !modelOver && <text x={MOULD.x + MOULD.w - 12} y={BELT_Y - mouldH - 14} textAnchor="end" fontSize={14} fontWeight={900} fill={COL.mouldLine} data-jl-mould-label>{`x = ${iso(L.lText(hand))}`}</text>}
          </g>
        )}
        {/* متقدم : le flotteur du réservoir */}
        {!mould && (
          <g data-jl-tank role="slider" tabIndex={canTank ? 0 : -1} aria-label={k('tankAria')} aria-valuemin={0} aria-valuemax={L.TANK_MAX} aria-valuenow={total} aria-valuetext={`${L.lText(total)} L`}
            onPointerDown={canTank ? start('tank') : undefined} onKeyDown={canTank ? key : undefined} style={{ cursor: canTank ? 'ns-resize' : 'default', touchAction: 'none' }} className={ring}>
            <rect x={WIN.x - 12} y={WIN.y + WIN.h - tankHandPx - 22} width={WIN.w + 24} height={44} fill="transparent" />
            <rect x={WIN.x - 6} y={WIN.y + WIN.h - tankHandPx - 6} width={WIN.w + 12} height={12} rx={6} fill={canTank ? COL.juiceDark : COL.steelDark} />
            <text x={TANK.x + TANK.w + 6} y={WIN.y + WIN.h - tankHandPx + 4} fontSize={14} fontWeight={900} fill={COL.juiceDark} data-jl-tank-label>{`${iso(L.lText(w.x))}`}</text>
          </g>
        )}
        <g data-jl-tests aria-label={k('testsAria', { n: w.testsLeft })} className={w.denied ? 'jl-shake' : undefined}>
          {mould && !free && Array.from({ length: task.tests }, (_, i) => <Bottle key={i} x={W - 84 + i * 26} y={50} w={14} h={30} level={i < w.testsLeft ? 1 : 0} dashed={i >= w.testsLeft} data-jl-test={i} data-left={i < w.testsLeft ? 'true' : 'false'} />)}
        </g>
        <Student x={W - 128} y={H - 6} girl={girl} mood={mood} />
      </svg>
    </div>
  );
}

/* ══════════════ Les commandes ══════════════ */

function Tools({ lab, setLab, k }) {
  const task = L.taskOf(lab);
  const w = lab.w;
  const free = L.isFree(lab);
  const phase = w.phase;
  const btn = 'inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-2xl border-2 px-3 text-sm font-black';
  const mould = task.kind === 'mould';
  const handOn = !free && ((mould && phase === 'test') || (!mould && phase === 'set'));
  const value = mould ? w.x : task.carry + w.x;
  return (
    <LabCard className="space-y-2 p-2" data-jl-tools>
      {handOn && (
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
          <div className="flex items-center gap-1.5" dir="ltr">
            <RoundButton onClick={() => setLab((s) => L.bump(s, -1))} disabled={mould ? w.x <= L.MOULD_MIN : w.x <= 0} aria-label={k('less')} size={44} data-jl-less><Minus className="h-5 w-5" strokeWidth={3} aria-hidden="true" /></RoundButton>
            <span className="flex min-h-[44px] min-w-[7rem] items-center justify-center gap-1.5 rounded-xl border-2 border-orange-200 bg-orange-50 px-2 text-center text-orange-950">
              <span className="text-[11px] font-black leading-tight" dir="rtl">{mould ? k('capacity') : k('tankValue')}</span>
              <span className="text-base font-black leading-none tabular-nums" data-jl-value>{`${L.lText(value)} L`}</span>
            </span>
            <RoundButton primary onClick={() => setLab((s) => L.bump(s, 1))} disabled={mould ? w.x >= L.MOULD_MAX : value >= L.TANK_MAX} aria-label={k('more')} size={44} data-jl-more-btn><Plus className="h-5 w-5" strokeWidth={3} aria-hidden="true" /></RoundButton>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setLab(L.pressFill)} data-jl-fill className={`${btn} border-orange-600 bg-orange-500 text-white shadow-[0_3px_0_0_#C2410C] transition-all duration-150 active:translate-y-0.5 motion-reduce:transition-none ${ring}`}><Droplets className="h-4 w-4" aria-hidden="true" />{k('fill')}</button>
            {mould && phase === 'test' && w.fills >= 1 && w.testsLeft > 0 && (
              <button type="button" onClick={() => setLab(L.openSlate)} data-jl-open-slate className={`${btn} border-sky-300 bg-white text-sky-900 ${ring}`}><PenLine className="h-4 w-4" aria-hidden="true" />{k('writeOp')}</button>
            )}
          </div>
        </div>
      )}
      {phase === 'slate' && !free && <Slate lab={lab} setLab={setLab} k={k} btn={btn} />}
      {phase === 'cards' && !free && <Cards lab={lab} setLab={setLab} k={k} btn={btn} />}
    </LabCard>
  );
}

function Slate({ lab, setLab, k, btn }) {
  const task = L.taskOf(lab);
  const [val, setVal] = useState('');
  const ref = useRef(null);
  useEffect(() => { setVal(''); }, [lab.ti, lab.w.stage, lab.w.phase]);
  const add = (c) => { setVal((v) => `${v}${c}`.slice(0, 18)); ref.current?.focus(); };
  const label = task.kind === 'mould' ? k('slate.capacity') : lab.w.stage === 'total' || !task.carry ? k('slate.total') : k('slate.press');
  return (
    <form data-jl-slate className="space-y-1.5 rounded-xl border-2 border-sky-200 bg-sky-50/60 p-2" onSubmit={(e) => { e.preventDefault(); if (val) setLab((s) => L.writeOperation(s, val)); }}>
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex flex-1 flex-wrap items-center gap-2 text-sm font-black text-sky-950">
          <span className="min-w-[5.5rem] text-xs">{label}</span>
          <input ref={ref} type="text" inputMode="decimal" autoComplete="off" dir="ltr" maxLength={18} value={val} placeholder={k('slate.placeholder')} aria-label={k('slate.aria')} data-jl-input
            onChange={(e) => setVal(e.target.value)} className={`h-11 min-w-[9rem] flex-1 rounded-xl border-2 border-sky-300 bg-white px-2 text-center text-lg font-black tabular-nums text-sky-950 ${ring}`} />
        </label>
        <button type="submit" disabled={!val} data-jl-judge className={`${btn} border-sky-600 bg-sky-600 text-white shadow-[0_3px_0_0_#075985] transition-all duration-150 active:translate-y-0.5 disabled:opacity-40 motion-reduce:transition-none ${ring}`}>{k('slate.judge')}</button>
      </div>
      <div className="flex flex-wrap items-center gap-1.5" dir="ltr" role="group" aria-label={k('slate.chips')}>
        {OP_CHIPS.map((c) => <button key={c} type="button" dir="ltr" onClick={() => add(c === '−' ? '-' : c === '×' ? '*' : c === '÷' ? '/' : c)} data-jl-chip={c} className={`inline-flex h-10 min-w-[2.5rem] items-center justify-center rounded-xl border-2 border-sky-200 bg-white px-2 text-base font-black text-sky-950 ${ring}`}>{`‎${c}‎`}</button>)}
        <button type="button" onClick={() => setVal((v) => v.slice(0, -1))} aria-label={k('slate.erase')} className={`inline-flex h-10 min-w-[2.5rem] items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-2 text-sm font-black text-slate-600 ${ring}`}>⌫</button>
      </div>
    </form>
  );
}

function Cards({ lab, setLab, k, btn }) {
  const task = L.taskOf(lab);
  const cards = L.cardsOf(task);
  return (
    <div data-jl-cards className="space-y-1.5 rounded-xl border-2 border-sky-200 bg-sky-50/60 p-2">
      <p className="text-xs font-black text-sky-950">{k('cards.label')}</p>
      <div className="grid grid-cols-2 gap-2" dir="ltr">
        {cards.map((c) => {
          const on = lab.w.picked.includes(c.id);
          return (
            <button key={c.id} type="button" aria-pressed={on} onClick={() => setLab((s) => L.toggleCard(s, c.id))} data-jl-card={c.id} dir="ltr"
              className={`min-h-[44px] rounded-xl border-2 px-2 py-1 text-center text-base font-black ${ring} ${on ? 'border-sky-600 bg-sky-600 text-white' : 'border-sky-200 bg-white text-sky-950'}`}>
              <MathText>{$(c.tex)}</MathText>
            </button>
          );
        })}
      </div>
      <button type="button" disabled={!lab.w.picked.length} onClick={() => setLab(L.checkCards)} data-jl-cards-check className={`${btn} w-full border-sky-600 bg-sky-600 text-white disabled:opacity-40 ${ring}`}>{k('cards.check')}</button>
    </div>
  );
}

/* ══════════════ « جرّب أعدادك » : toujours ouvert ══════════════ */

function FreeCard({ lab, setLab, k }) {
  const free = L.isFree(lab);
  const f = lab.free;
  const Row = ({ label, value, onLess, onMore, attr }) => (
    <div className="flex items-center gap-1.5" dir="ltr">
      <RoundButton onClick={onLess} aria-label={k('less')} size={40} {...{ [`${attr}-less`]: true }}><Minus className="h-4 w-4" strokeWidth={3} aria-hidden="true" /></RoundButton>
      <span className="flex min-h-[40px] min-w-[8rem] items-center justify-center gap-1.5 rounded-xl border-2 border-emerald-200 bg-white px-2 text-emerald-950"><span className="text-[11px] font-black" dir="rtl">{label}</span><span className="text-sm font-black tabular-nums">{value}</span></span>
      <RoundButton primary onClick={onMore} aria-label={k('more')} size={40} {...{ [`${attr}-more`]: true }}><Plus className="h-4 w-4" strokeWidth={3} aria-hidden="true" /></RoundButton>
    </div>
  );
  return (
    <LabCard className="space-y-2 border-emerald-200 bg-emerald-50/50 p-3" data-jl-free data-active={free ? 'true' : 'false'}>
      <p className="flex items-center gap-1.5 text-sm font-black text-emerald-900"><FlaskConical className="h-4 w-4" aria-hidden="true" /> {k('free.title')}</p>
      <p className="text-xs font-bold leading-snug text-slate-600">{free ? k('free.on') : k('free.hint')}</p>
      {free && (
        <div className="space-y-1.5">
          <div className="flex flex-wrap gap-2">
            <Row label={k('free.tank')} value={`${L.lText(f.total)} L`} attr="data-jl-ft" onLess={() => setLab((s) => L.setFree(s, { total: s.free.total - 50 }))} onMore={() => setLab((s) => L.setFree(s, { total: s.free.total + 50 }))} />
            <Row label={k('free.order')} value={f.bottles} attr="data-jl-fo" onLess={() => setLab((s) => L.setFree(s, { bottles: s.free.bottles - 1 }))} onMore={() => setLab((s) => L.setFree(s, { bottles: s.free.bottles + 1 }))} />
            <Row label={k('capacity')} value={`${L.lText(f.x)} L`} attr="data-jl-fx" onLess={() => setLab((s) => L.bump(s, -1))} onMore={() => setLab((s) => L.bump(s, 1))} />
          </div>
          <button type="button" onClick={() => setLab(L.pressFill)} data-jl-free-fill className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-2xl border-2 border-orange-600 bg-orange-500 px-3 text-sm font-black text-white ${ring}`}><Droplets className="h-4 w-4" aria-hidden="true" />{k('fill')}</button>
          {f.lastFill && <p className="text-xs font-black text-emerald-950" data-jl-free-result><MathText>{k('free.result', { full: iso(f.lastFill.full), left: iso(L.lText(f.lastFill.left)), partial: iso(L.lText(f.lastFill.partial)) })}</MathText></p>}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {!free ? (
          <button type="button" onClick={() => setLab(L.freeTask)} data-jl-free-start className={`inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-emerald-300 bg-white px-3 text-xs font-bold text-emerald-900 ${ring}`}>{k('free.start')}</button>
        ) : (
          <button type="button" onClick={() => setLab(L.toGuided)} data-jl-free-back className={`inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-emerald-200 bg-white px-3 text-xs font-bold text-emerald-900 ${ring}`}>
            <Undo2 className="h-4 w-4" aria-hidden="true" /> {k('free.back')}
          </button>
        )}
      </div>
    </LabCard>
  );
}

/* ══════════════ La découverte et la règle ══════════════ */

export function ruleOptions(k, advanced = false) {
  return advanced
    ? [
      { text: <MathText>{k('rule.advRight')}</MathText>, correct: true },
      { text: <MathText>{k('rule.advDiv')}</MathText>, why: <MathText>{k('rule.whyAdvDiv')}</MathText> },
      { text: <MathText>{k('rule.advSub')}</MathText>, why: <MathText>{k('rule.whyAdvSub')}</MathText> },
    ]
    : [
      { text: <MathText>{k('rule.right')}</MathText>, correct: true },
      { text: <MathText>{k('rule.mult')}</MathText>, why: <MathText>{k('rule.whyMult')}</MathText> },
      { text: <MathText>{k('rule.flip')}</MathText>, why: <MathText>{k('rule.whyFlip')}</MathText> },
    ];
}

export function Formal({ lab, k }) {
  const tk = L.taskOf(lab);
  const line = tk.kind === 'tank'
    ? (tk.carry ? '\\dfrac{4+x}{0{,}25}=40\\ \\Rightarrow\\ 4+x=40\\times0{,}25=10\\ \\Rightarrow\\ x=10-4=6' : '\\dfrac{x}{24}=0{,}25\\ \\Rightarrow\\ x=24\\times0{,}25=6')
    : `${tk.bottles}\\times x=${L.lText(tk.total).replace(',', '{,}')}\\ \\Rightarrow\\ x=${L.lText(tk.total).replace(',', '{,}')}\\div${tk.bottles}=${L.lText(tk.answer).replace(',', '{,}')}`;
  return (
    <div className="space-y-2 text-sm font-bold text-emerald-950" data-jl-formal>
      <p><MathText>{k('formal.intro')}</MathText></p>
      <p className="text-center text-base" dir="ltr"><MathText>{$(line)}</MathText></p>
      <p><MathText>{k('formal.inverse')}</MathText></p>
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

export const CHAINS = Object.freeze({
  t1: ['said', 'twelve'],
  t2: ['op'],
  t3: ['rule'],
  a1: ['dividend'],
  a2: ['dividend2'],
  a3: ['last'],
  k1: ['said', 'x'],
});

const Mx = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const T = (s) => <MathText>{s}</MathText>;
const hints = (k, id) => [Mx(k, `${id}.hint1`), Mx(k, `${id}.hint2`)];
const choice = (k, id, opts, extra = {}) => ({ id, kind: 'choice', prompt: Mx(k, `${id}.prompt`, extra.params), options: opts, hints: hints(k, id), explain: Mx(k, `${id}.explain`, extra.params) });
const numberQ = (k, id, expected, params, shown) => ({ id, kind: 'number', expected: String(expected), answer: T($(String(shown ?? expected))), prompt: Mx(k, `${id}.prompt`, params), hints: hints(k, id), explain: Mx(k, `${id}.explain`, params) });
const opt = (k, id, name, correct) => (correct ? { text: T(k(`cp.${id}.${name}`)), correct: true } : { text: T(k(`cp.${id}.${name}`)), why: Mx(k, `${id}.why${name[0].toUpperCase()}${name.slice(1)}`) });

/** Le dernier essai de l'élève sur la tâche courante (ses PROPRES nombres) : jamais un texte libre. */
const lastTest = (lab) => [...L.guidedTrials(lab)].reverse().find((t) => t.kind === 'fill' && t.test) ?? { full: 0 };

export const QUESTIONS = {
  said: (lab, task, k) => numberQ(k, 'said', Math.max(0, lastTest(lab).full), { x: L.lText(lastTest(lab).x ?? 0).replace(',', '{,}') }),
  twelve: (lab, task, k) => choice(k, 'twelve', [opt(k, 'twelve', 'wrongA'), opt(k, 'twelve', 'right', true), opt(k, 'twelve', 'wrongB')], { params: { n: `$${task.bottles}$`, total: `$${L.lText(task.total).replace(',', '{,}')}$` } }),
  op: (lab, task, k) => choice(k, 'op', [opt(k, 'op', 'wrongA'), opt(k, 'op', 'right', true), opt(k, 'op', 'wrongB')]),
  rule: (lab, task, k) => ({ id: 'rule', kind: 'choice', prompt: Mx(k, 'rule.prompt'), options: [ruleOptions(k, false)[1], ruleOptions(k, false)[0], ruleOptions(k, false)[2]], hints: hints(k, 'rule'), explain: <Formal lab={lab} k={k} /> }),
  dividend: (lab, task, k) => choice(k, 'dividend', [opt(k, 'dividend', 'wrongA'), opt(k, 'dividend', 'right', true), opt(k, 'dividend', 'wrongB')]),
  dividend2: (lab, task, k) => choice(k, 'dividend2', [opt(k, 'dividend2', 'wrongA'), opt(k, 'dividend2', 'wrongB'), opt(k, 'dividend2', 'right', true)]),
  last: (lab, task, k) => choice(k, 'last', [opt(k, 'last', 'wrongA'), opt(k, 'last', 'wrongB'), opt(k, 'last', 'right', true)]),
  x: (lab, task, k) => numberQ(k, 'x', L.lText(task.answer).replace(',', '.'), {}, L.lText(task.answer).replace(',', '{,}')),
};
