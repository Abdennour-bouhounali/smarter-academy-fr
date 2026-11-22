import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Hand, CheckCircle2, Sparkles, ChevronLeft, FlaskConical, Undo2, Minus, Plus, Link2, Layers } from 'lucide-react';
import { resolveLevelId } from '@smarter-academy/core/curriculum/manipulationLevels.js';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import MathText from '../../components/MathText';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import { LabCard, StageFrame, PromptCard, VerdictBanner, ChoiceTray, ChoiceCard, RoundButton } from '../primitives/LabKit';
import { SvgPill } from '../primitives/SvgPill';
import KidFigure from '../primitives/KidFigure';
import { useLabCoach } from '../primitives/LabCoach';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import { LEVELS } from '../levels';
import * as L from '../logic/loomThreads';

/**
 * loom-threads — LE NŒUD SOUS LA MAIN (3AM, unité 5 « المساويات – المتباينات – المعادلات », درس « المتباينات والعمليات », 2026-10-26). La logique, exacte,
 * est dans `logic/loomThreads.js` (sur `packages/core/arithmetic/linear.js`, importé par chemin). Thème `loom` : l'atelier de tissage de غرداية.
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. La main tient UN nœud de la poutre basse (glisser, −/+, flèches, toucher une graduation) : avec le PEIGNE il est l'image du fil de 0 (sa position EST c,
 *    tout x arrive en x + c), avec le CLOU (le fil de 0 est cloué en 0) il est l'image du fil de 1 (tout x arrive en c·x). « اربط » dépose le nœud : un essai.
 * B. Deux poutres graduées (la même échelle), des fils de chaîne gris entre elles, deux fils de laine à pompon : le rouge porte a, le bleu b, a < b.
 * C. La résistance : aucun peigne, aucun clou positif ne met le rouge à droite du bleu ; × 0 les écrase sur un seul nœud (0 = 0).
 * D. La phase formelle écrit ce que l'élève a fait : « a < b ⟹ a + c < b + c », « c > 0 », « c < 0 », avec SES nombres.
 * E. Les fausses conjectures sont réfutées avec SES essais (« dès qu'on utilise un nombre négatif » : son peigne négatif ; « dès qu'on étire » : son clou × 2).
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        a < b ⟹ a + c < b + c ; c > 0 ⟹ ac < bc ; c < 0 ⟹ ac > bc ; × 0 écrase
 *   OBJECT         une ligne de nombres transportée tout entière : deux poutres, des fils, deux fils de laine, un nœud
 *   VARIABLE       c, la position du nœud (et l'outil : peigne ou clou)
 *   INVARIANT      l'ordre des fils tant que les fils ne se croisent pas
 *   TRANSFORMATION chaque nombre de la poutre haute va à son image sur la basse
 *   CONSTRAINT     peigne −6 … 6, clou −3 … 3, pas 1 (مبتدئ) ou 1/2 (متقدم) ; deux poutres au plus d'étapes permises
 *   RESISTANCE     faire passer le rouge à droite du bleu : seul le clou négatif y arrive
 *   EVIDENCE       les positions, le point de croisement qui s'allume, la ligne d'ordre sous chaque poutre
 *   CONTRAST       peigne / clou ; c positif / négatif ; c > 1 / 0 < c < 1
 *   PREDICTION     aucune carte : chaque dépôt du nœud est un essai jugé
 *   DISCOVERY      « متى يتبادل الخيطان مكانيهما؟ »
 *   FORMALIZATION  a < b ⟹ a + c < b + c ; ac < bc (c > 0) ; ac > bc (c < 0)
 *   TRANSFER       « جرّب أعدادك » (a et b, toujours ouvert), les exercices et la banque
 *
 * « جرّب كل الإمكانيات » : NON (chaque dépôt EST l'essai). « جرّب أعدادك » est TOUJOURS ouvert sous le labo.
 * D'UN SEUL REGARD (§8bis) : `[data-lt-glance]` enveloppe la consigne, le métier, les commandes et le verdict.
 * ONBOARDING : `coach` (défaut true) → `LabCoach` ; `logic/loomThreads.js › coachOf` (tool · drag · tie · tryNeg · stage · next).
 * Props : `step`, `tasks`, `level`, `levels`, `coach`, `title`, `lead`, `onTrial(event)`, `onFinished()` — par `state.report`.
 * CONTRAT DOM : [data-loom-threads][data-task][data-solved][data-layout], [data-lt-glance], [data-lt-stage], [data-lt-beam=<i>], [data-lt-thread=red|blue][data-at],
 * [data-lt-cross], [data-lt-knob][data-c][role=slider], [data-lt-tools], [data-lt-tool=comb|nail][data-selected], [data-lt-less], [data-lt-more], [data-lt-tie],
 * [data-lt-stage-btn], [data-lt-undo], [data-lt-order=top|bottom], [data-lt-op], [data-lt-verdict], [data-lt-next], [data-lt-step=<i>], [data-lt-free][data-active],
 * [data-lt-free-a], [data-lt-free-b], [data-lt-free-back], [data-lt-band], [data-lt-formal].
 */
const NS = 'manipulation.loomThreads';
const LRI = '⁦';
const PDI = '⁩';
const iso = (s) => `${LRI}${s}${PDI}`;
const WIDE_MIN = 700;
const SIDE_W = 236;
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-indigo-300';
const minus = (s) => String(s).replace(/-/g, '−');
const COL = { red: '#DC2626', blue: '#2563EB', wood: '#B7773A', woodDark: '#8A5524', knot: '#F59E0B', band: '#FBBF24', ok: '#059669' };
const num = (p) => minus(Lin.fracText(p));
const REL = { '<': '<', '>': '>', '=': '=' };

const CSS = `
@keyframes lt-glow { 0%, 100% { opacity: 0.55; transform: scale(0.9); } 50% { opacity: 1; transform: scale(1.15); } }
.lt-glow { animation: lt-glow 1100ms ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
.lt-move { transition: cx 220ms ease-out, cy 220ms ease-out, x1 220ms ease-out, x2 220ms ease-out; }
@media (prefers-reduced-motion: reduce) { .lt-glow { animation: none !important; } .lt-move { transition: none !important; } }
`;

export function numbersFor({ step, tasks, level }) {
  const lv = resolveLevelId(level ?? 'beginner');
  const asked = LEVELS['loom-threads'][lv].numbers;
  return { step: step ?? asked.step, tasks: tasks ?? asked.tasks };
}

/** « + 2 » / « × (−3) » ; le clou à fraction unitaire dit aussi la division (« × (−1/2) أي ÷ (−2) »). */
export function opText(tool, c, k) {
  if (tool === 'comb') return `+ ${Lin.cmp(c, 0) < 0 ? `(${num(c)})` : num(c)}`;
  const base = `× ${Lin.cmp(c, 0) < 0 ? `(${num(c)})` : num(c)}`;
  if (c.d > 1 && Math.abs(c.n) === 1) return k ? `${base} ${k('orDiv')} ${Lin.cmp(c, 0) < 0 ? `(${minus(-c.d)})` : c.d}` : base;
  return base;
}

export default function LoomThreads({
  step, tasks, title, lead, level, levels: withLevels = true, coach: coachOn = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const initialNumbers = useMemo(() => numbersFor({ step, tasks, level }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'loom-threads', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nums = state.numbers;
  const numsKey = JSON.stringify(nums);
  const [lab, setLab] = useState(() => L.init(nums));
  const [scene, setScene] = useState({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: 0 });
  if (scene.key !== numsKey || scene.epoch !== state.epoch) {
    // « إعادة » (resetCount), un autre niveau ou d'autres nombres : TOUT recommence — la tâche 1, les essais et les questions du labo
    setScene({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: scene.inits + 1 });
    setLab(L.init(nums));
  }
  // les questions pendant le labo : la suite de la tâche courante (construite seulement quand la tâche est faite) ; la dernière finit par la règle
  const cpSettings = useLabCheckpointSettings('loom-threads');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const set = CHAINS[state.level === 'advanced' ? 'advanced' : 'beginner'];
  const chain = cpOn && cpSettings.enabled && !L.isFree(lab) && set.length === lab.tasks.length ? set[lab.ti] : null;
  const ruleByCheckpoint = cpOn && cpSettings.enabled && set.length === lab.tasks.length;
  const cp = useLabCheckpoint({
    id: chain ? `${state.level === 'advanced' ? 'a' : 'b'}${lab.ti}` : null,
    questions: chain && L.taskDone(lab) ? chain.map((q) => QUESTIONS[q](lab, L.taskOf(lab), k)).filter(Boolean) : null,
    reached: L.taskDone(lab),
    resetKey: scene.inits,
    onRetry: () => setLab(L.restartTask),
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => { if (set[Number(String(id).slice(1))]?.includes('rule')) { state.discover(); state.formalize(); } },
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
    lab: 'loom-threads', step: coachStep,
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
    <ManipulationDiscovery state={state} prompt={<MathText>{k('discovery.prompt')}</MathText>}
      options={discoveryOptions(lab, k)} formal={<Formal lab={lab} k={k} />} />
  );

  return (
    <ManipulationShell
      type="loom-threads"
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
        <div ref={boxRef} className="space-y-2" data-loom-threads data-task={lab.ti}
          data-solved={finished ? 'true' : 'false'} data-layout={width >= WIDE_MIN ? 'wide' : 'narrow'}>
          <style dangerouslySetInnerHTML={{ __html: CSS }} />
          <Lab lab={lab} setLab={setLab} k={k} width={width} screenH={screenH} lead={state.isAuthoredLevel ? lead : null} cp={cp} />
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ══════════════ Le laboratoire ══════════════ */

function Lab({ lab, setLab, k, width, screenH, lead, cp }) {
  const uid = `lt${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const wide = width >= WIDE_MIN;
  const free = L.isFree(lab);
  const task = L.taskOf(lab);
  const band = L.isBand(lab);
  const last = lab.last;
  const done = L.taskDone(lab);
  const lit = !free && done;
  const pair = L.startPair(lab);

  const ctx = free
    ? k('context.free', { a: iso(num(lab.free.a)), b: iso(num(lab.free.b)) })
    : (lead || (band ? k('context.band', { bound: iso(num(task.band.bound)) }) : k('context.loom', { a: iso(num(pair.a)), b: iso(num(pair.b)) })));
  const question = free ? k('question.free') : (() => {
    if (task.kind === 'swap') return k('question.swap');
    if (task.kind === 'meet') return k('question.meet');
    if (task.kind === 'band') return k('question.band', { edge: iso(num(task.goal.bound)) });
    return k('question.reach', { a: iso(num(task.target[0])), b: iso(num(task.target[1])) });
  })();
  // une étape est FAITE quand la cible est atteinte ET que ses questions (LabCheckpoint) sont répondues : alors la pastille passe au vert et on fête
  const stepDone = lab.tasks.map((_, i) => !!lab.done[i] && (i !== lab.ti || !cp.blocking));
  const steps = lab.tasks.length > 1 && !free && (
    <LabStepper count={lab.tasks.length} current={lab.ti} done={stepDone} stepAttr="data-lt-step" />
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
  /* ── le son (muet sauf « الصوت ») : un déclic quand le nœud change de graduation (au plus un toutes les 35 ms, plus grave en arrière), au
     « اربط » : `flag` quand la cible est atteinte, `over` quand les fils se croisent ou s'écrasent, un déclic sinon. ── */
  const sfx = useRef({ v: lab.v, at: 0 });
  useEffect(() => {
    const p = sfx.current;
    if (Lin.eq(p.v, lab.v)) return;
    const now = performance.now();
    if (now - p.at > 35) { playSfx('tooth', { pitch: Lin.cmp(lab.v, p.v) > 0 ? 1 : 0.75 }); p.at = now; }
    p.v = lab.v;
  }, [lab.v]);
  const lastTie = lab.last;
  useEffect(() => {
    if (!lastTie || lastTie.kind !== 'tie') return;
    if (lastTie.reached) { playSfx('bell'); playSfx('flag'); } else if (lastTie.crossed || lastTie.collapsed) playSfx('over'); else playSfx('tooth', { pitch: 0.75 });
  }, [lastTie]);
  const prompt = (
    <PromptCard size={wide ? 'lg' : 'md'} context={<MathText>{ctx}</MathText>} contextProps={{ 'data-lt-context': free ? 'free' : 'loom' }}
      title={<MathText>{question}</MathText>} titleClassName={wide ? 'text-xl' : 'text-lg'} lamp={free ? null : lit ? 'on' : 'off'}
      titleProps={{ 'data-lt-prompt': free ? 'free' : 'loom', 'data-lit': lit ? 'true' : 'false' }} />
  );

  /* ── le verdict : la CONSÉQUENCE avec les nombres de l'élève, jamais la règle ── */
  const verdictLine = (() => {
    if (!last) return k('idle');
    let line;
    if (last.band) {
      line = last.collapsed ? k('v.bandGone') : k('v.band', { edge: iso(minus(last.edge)), side: k(`side.${last.side}`) });
    } else if (last.collapsed) line = k('v.meet', { v: iso(minus(last.a2)) });
    else line = k(last.crossed ? 'v.crossed' : 'v.kept', { a: iso(minus(last.a2)), b: iso(minus(last.b2)) });
    return last.reached && !last.free ? k('v.reached', { line }) : line;
  })();
  const vkey = !last ? '' : last.reached && !last.free ? 'right' : last.crossed ? 'cross' : last.collapsed ? 'meet' : 'kept';
  const tone = !last ? 'indigo' : last.reached && !last.free ? 'emerald' : last.crossed || last.collapsed ? 'amber' : 'indigo';
  const Icon = !last ? Hand : last.reached && !last.free ? CheckCircle2 : Sparkles;
  const canNext = L.canNext(lab) && !cp.blocking;
  const mood = !last ? 'happy' : last.reached ? 'proud' : last.crossed || last.collapsed ? 'wonder' : 'happy';
  const banner = (
    <VerdictBanner tone={tone} icon={wide ? Icon : null} size="sm" className="min-h-[3.5rem]" data-lt-verdict={vkey}>
      <div className="min-w-0 space-y-1.5">
        <p className={last ? '' : 'font-bold text-indigo-900'}>{verdictLine}</p>
        {canNext && (
          <button type="button" onClick={() => setLab(L.nextTask)} data-lt-next
            className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-2 border-emerald-600 bg-emerald-600 px-3.5 text-sm font-black text-white shadow-[0_3px_0_0_#047857] transition-all duration-150 active:translate-y-0.5 motion-reduce:transition-none ${ring}`}>
            {k('next')} <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </VerdictBanner>
  );

  const legend = (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1" data-lt-legend>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-extrabold text-slate-700">
        {band ? (
          <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full" style={{ background: COL.band }} aria-hidden="true" />{k('legend.band')}</span>
        ) : (
          <>
            <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full" style={{ background: COL.red }} aria-hidden="true" />{k('legend.red')}</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full" style={{ background: COL.blue }} aria-hidden="true" />{k('legend.blue')}</span>
          </>
        )}
      </div>
      {steps || null}
    </div>
  );

  const stageW = Math.max(300, (wide ? width - SIDE_W - 12 : width) - 24);
  const stage = <Loom lab={lab} setLab={setLab} k={k} uid={uid} width={stageW} screenH={screenH} mood={mood} />;
  const readout = <Orders lab={lab} k={k} />;
  const controls = <Controls lab={lab} setLab={setLab} k={k} />;

  return (
    <>
      <div className="relative space-y-2" data-lt-glance>
        {party.node}
        {cp.node}
        {prompt}
        {wide ? (
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <StageFrame className="min-w-0 space-y-1.5 overflow-hidden p-3" data-lt-stage>{legend}{stage}{readout}</StageFrame>
              {controls}
            </div>
            <div className="flex shrink-0 flex-col gap-2.5" style={{ width: SIDE_W }}>{banner}</div>
          </div>
        ) : (
          <>
            <StageFrame className="min-w-0 space-y-1.5 overflow-hidden p-2" data-lt-stage>{legend}{stage}{readout}</StageFrame>
            {controls}
            {banner}
          </>
        )}
      </div>
      <FreeCard lab={lab} setLab={setLab} k={k} />
    </>
  );
}

/* ══════════════ Le métier à tisser ══════════════ */

function Loom({ lab, setLab, k, uid, width, screenH, mood }) {
  const W = width;
  const svgRef = useRef(null);
  const [drag, setDrag] = useState(false);
  const bm = L.beams(lab);
  const band = L.isBand(lab);
  const n = lab.stages.length + 2;
  const gap = n === 2 ? (screenH >= 1000 ? 138 : 112) : (screenH >= 1000 ? 92 : W < 520 ? 48 : 70);
  const top = n === 2 ? 40 : 28;
  const barH = 22;
  const H = top + gap * (n - 1) + barH + (n === 2 ? 58 : 40);
  const x0 = 78;
  const bw = W - x0 - 22;
  const xOf = (v) => x0 + ((Math.max(-L.BEAM - 0.9, Math.min(L.BEAM + 0.9, v)) + L.BEAM) / (2 * L.BEAM)) * bw;
  const yOf = (i) => top + i * gap;
  const vNum = Lin.toNumber(lab.v);
  const knotX = xOf(vNum);
  const lastY = yOf(n - 1);
  const srcId = lab.tool === 'comb' ? 0 : 1;
  const ints = Array.from({ length: 2 * L.BEAM + 1 }, (_, i) => i - L.BEAM);
  const stages = L.liveStages(lab);
  const bandNow = band ? L.bandImage(lab) : null;
  const goalBand = band ? L.taskOf(lab).band : null;

  const toValue = (e) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r || r.width === 0) return vNum;
    const px = ((e.clientX - r.left) / r.width) * W;
    return ((px - x0) / bw) * 2 * L.BEAM - L.BEAM;
  };
  const down = (e) => { e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId); setDrag(true); setLab((s) => L.dragKnot(s, toValue(e))); };
  const move = (e) => { if (drag) setLab((s) => L.dragKnot(s, toValue(e))); };
  const up = () => { if (!drag) return; setDrag(false); setLab((s) => (L.isIdentity(s) ? s : L.tie(s))); };
  const key = (e) => {
    const m = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 };
    if (e.key in m) { e.preventDefault(); setLab((s) => L.nudge(s, m[e.key])); }
    if (e.key === 'Home') { e.preventDefault(); setLab((s) => L.dragKnot(s, L.RANGE[s.tool][0])); }
    if (e.key === 'End') { e.preventDefault(); setLab((s) => L.dragKnot(s, L.RANGE[s.tool][1])); }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLab((s) => (L.isIdentity(s) ? s : L.tie(s))); }
  };

  const bandRange = (ray) => {
    const bx = xOf(Lin.toNumber(ray.bound));
    return ray.rel === '<' || ray.rel === '<=' ? { x: x0 - 6, w: bx - x0 + 6 } : { x: bx, w: x0 + bw + 6 - bx };
  };

  /* la flèche du bout ouvert de la bande : « et tous les nombres au-delà » */
  const openArrow = (ray, r, y) => {
    const left = ray.rel === '<' || ray.rel === '<=';
    const x = left ? r.x + 2 : r.x + r.w - 2;
    const d = left ? -1 : 1;
    return <polygon points={`${x},${y - 9} ${x + d * 11},${y} ${x},${y + 9}`} fill="#B45309" opacity={0.85} aria-hidden="true" />;
  };

  /* le point où les deux fils de laine se croisent, par segment */
  const crossings = [];
  if (bm) {
    for (let i = 0; i < bm.length - 1; i += 1) {
      const xa0 = xOf(Lin.toNumber(bm[i][0])); const xb0 = xOf(Lin.toNumber(bm[i][1]));
      const xa1 = xOf(Lin.toNumber(bm[i + 1][0])); const xb1 = xOf(Lin.toNumber(bm[i + 1][1]));
      if ((xa0 - xb0) * (xa1 - xb1) < 0) {
        const t = (xb0 - xa0) / ((xa1 - xa0) - (xb1 - xb0));
        crossings.push({ x: xa0 + (xa1 - xa0) * t, y: yOf(i) + (yOf(i + 1) - yOf(i)) * t, i });
      }
    }
  }
  const same = bm && Lin.eq(bm[n - 1][0], bm[n - 1][1]);
  const wool = (idx, color, name) => {
    if (!bm) return null;
    const pts = bm.map((row, i) => [xOf(Lin.toNumber(row[idx])), yOf(i)]);
    return (
      <g data-lt-thread={name} data-at={Lin.fracText(bm[n - 1][idx])}>
        <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (i === 0 || i === pts.length - 1)
          ? <circle key={i} cx={p[0] + (same && i === pts.length - 1 ? (idx === 0 ? -9 : 9) : 0)} cy={p[1]} r={10} fill={color} stroke="#FFFFFF" strokeWidth={2.5} />
          : <circle key={i} cx={p[0]} cy={p[1]} r={5} fill={color} stroke="#FFFFFF" strokeWidth={1.5} />)}
      </g>
    );
  };

  return (
    <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: W, display: 'block', margin: '0 auto', touchAction: 'none' }} role="group"
      aria-label={k('stageAria')} data-lt-svg dir="ltr">
      <defs>
        <linearGradient id={`${uid}-wood`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#D69A5B" /><stop offset="1" stopColor="#A8692F" /></linearGradient>
        <linearGradient id={`${uid}-knot`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FCD34D" /><stop offset="1" stopColor="#F59E0B" /></linearGradient>
      </defs>
      {/* le montant du métier */}
      <rect x={x0 - 14} y={top - 22} width={9} height={H - top - 18} rx={4} fill={COL.woodDark} opacity={0.85} aria-hidden="true" />
      <rect x={x0 + bw + 6} y={top - 22} width={9} height={H - top - 18} rx={4} fill={COL.woodDark} opacity={0.85} aria-hidden="true" />
      {/* le tapis à demi tissé, décor */}
      {n === 2 && (
      <g aria-hidden="true" opacity={0.9}>
        <rect x={x0} y={H - 30} width={bw} height={22} rx={4} fill="#9F1239" />
        {Array.from({ length: Math.floor(bw / 26) }, (_, i) => (
          <polygon key={i} points={`${x0 + 13 + i * 26},${H - 28} ${x0 + 24 + i * 26},${H - 19} ${x0 + 13 + i * 26},${H - 10} ${x0 + 2 + i * 26},${H - 19}`} fill={i % 2 ? '#FCD34D' : '#FDE68A'} opacity={0.85} />
        ))}
      </g>
      )}
      {/* les fils de chaîne : chaque entier de la poutre haute est relié à son image, poutre par poutre */}
      {stages.map((st, si) => (
        <g key={`w${si}`} aria-hidden="true">
          {ints.map((v) => {
            const to = L.stageOf(st.tool, st.c, Lin.frac(v));
            const inBand = band && si === 0 && bandCovers(goalBand, v);
            return <line key={v} x1={xOf(v)} y1={yOf(si)} x2={xOf(Lin.toNumber(to))} y2={yOf(si + 1)} stroke={inBand ? COL.band : '#94A3B8'} strokeWidth={inBand ? 2 : 1} opacity={inBand ? 0.9 : 0.5} className="lt-move" />;
          })}
        </g>
      ))}
      {/* la bande peinte sur la poutre haute et sur la basse */}
      {band && (
        <g data-lt-band aria-hidden="true">
          {(() => { const r = bandRange(goalBand); return <><rect x={r.x} y={yOf(0) - 15} width={Math.max(0, r.w)} height={30} rx={6} fill={COL.band} opacity={0.62} />{openArrow(goalBand, r, yOf(0))}</>; })()}
          <circle cx={xOf(Lin.toNumber(goalBand.bound))} cy={yOf(0)} r={8} fill="#FFFFFF" stroke={COL.knot} strokeWidth={3} />
          {bandNow && !bandNow.collapsed && (() => { const r = bandRange(bandNow); return (
            <>
              <rect x={r.x} y={lastY - 15} width={Math.max(0, r.w)} height={30} rx={6} fill={COL.band} opacity={0.62} />
              {openArrow(bandNow, r, lastY)}
              <circle cx={xOf(Lin.toNumber(bandNow.bound))} cy={lastY} r={8} fill="#FFFFFF" stroke={COL.knot} strokeWidth={3} />
            </>
          ); })()}
        </g>
      )}
      {/* les poutres */}
      {Array.from({ length: n }, (_, i) => (
        <g key={`b${i}`} data-lt-beam={i}>
          <rect x={x0 - 8} y={yOf(i) - barH / 2} width={bw + 16} height={barH} rx={7} fill={`url(#${uid}-wood)`} stroke={COL.woodDark} strokeWidth={1.5} />
          {ints.map((v) => (
            <line key={v} x1={xOf(v)} x2={xOf(v)} y1={yOf(i) - (v % 2 === 0 ? 8 : 5)} y2={yOf(i) + (v % 2 === 0 ? 8 : 5)} stroke={v === 0 ? '#FFFBEB' : '#FDE68A'} strokeWidth={v === 0 ? 3 : 1.2} opacity={0.9} />
          ))}
          {ints.filter((v) => v % 2 === 0).map((v) => (
            <text key={`t${v}`} x={xOf(v)} y={yOf(i) + barH / 2 + 12} textAnchor="middle" fontSize={11} fontWeight={v === 0 ? 900 : 700} fill={v === 0 ? '#7C2D12' : '#78350F'}
              fontFamily="ui-sans-serif, system-ui, sans-serif" style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{minus(v)}</text>
          ))}
        </g>
      ))}
      {/* le fil rouge et le fil bleu */}
      {wool(0, COL.red, 'red')}
      {wool(1, COL.blue, 'blue')}
      {crossings.map((c) => (
        <g key={c.i} data-lt-cross aria-hidden="true">
          <circle cx={c.x} cy={c.y} r={11} fill="#FDE047" opacity={0.8} className="lt-glow" />
          <circle cx={c.x} cy={c.y} r={5} fill="#FFFFFF" stroke="#CA8A04" strokeWidth={2.5} />
        </g>
      ))}
      {/* le clou : le fil de 0 est cloué en 0 sur la poutre basse */}
      {lab.tool === 'nail' && (
        <g aria-hidden="true">
          <line x1={xOf(0)} x2={xOf(0)} y1={yOf(n - 2)} y2={lastY} stroke="#334155" strokeWidth={2.5} />
          <circle cx={xOf(0)} cy={lastY} r={5.5} fill="#334155" stroke="#FFFFFF" strokeWidth={1.5} />
        </g>
      )}
      {/* le fil de la main : du repère (0 ou 1) de la poutre précédente jusqu'au nœud */}
      <line x1={xOf(srcId)} y1={yOf(n - 2)} x2={knotX} y2={lastY} stroke={COL.knot} strokeWidth={3} strokeDasharray="6 4" strokeLinecap="round" aria-hidden="true" className="lt-move" />
      <circle cx={xOf(srcId)} cy={yOf(n - 2)} r={4.5} fill={COL.knot} stroke="#FFFFFF" strokeWidth={1.5} aria-hidden="true" />
      {/* toucher une graduation de la poutre basse déplace le nœud */}
      <rect x={x0 - 8} y={lastY - barH / 2 - 6} width={bw + 16} height={barH + 12} fill="transparent" style={{ cursor: 'pointer' }}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} data-lt-beam-hit />
      {/* le nœud tenu par la main */}
      <g role="slider" tabIndex={0} aria-label={k('knobAria')} aria-valuemin={L.RANGE[lab.tool][0]} aria-valuemax={L.RANGE[lab.tool][1]} aria-valuenow={vNum} aria-valuetext={minus(num(lab.v))}
        aria-orientation="horizontal" onKeyDown={key} data-lt-knob data-c={Lin.fracText(lab.v)} className={ring}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} style={{ cursor: drag ? 'grabbing' : 'grab', outline: 'none' }}>
        <circle cx={knotX} cy={lastY} r={26} fill="transparent" />
        <circle cx={knotX} cy={lastY} r={drag ? 15 : 13} fill={`url(#${uid}-knot)`} stroke="#B45309" strokeWidth={2.5} />
        <circle cx={knotX} cy={lastY} r={4} fill="#FFFBEB" />
      </g>
      <SvgPill x={knotX} y={lastY + barH / 2 + (n === 2 ? 38 : 28)} text={minus(num(lab.v))} fill="#B45309" size={13} data-lt-knot-pill />
      {/* مريم au métier */}
      <g aria-hidden="true">
        <KidFigure cx={38} top={H - 118} foot={H - 20} hairStyle="hijab" scarf="rose" outfit="pink" skin="light" mood={mood} />
      </g>
    </svg>
  );
}

function bandCovers(ray, v) {
  return Lin.compareWith(Lin.frac(v), ray.rel, ray.bound);
}

/* ══════════════ Les lignes d'ordre : UNE sous chaque poutre extrême ══════════════ */

function Orders({ lab, k }) {
  const bm = L.beams(lab);
  const band = L.isBand(lab);
  const cell = (label, rel, a, b, struck, attrs) => (
    <div className="flex min-w-0 items-center gap-1.5 rounded-xl border border-amber-100 bg-white px-2.5 py-1" {...attrs}>
      <span className="whitespace-nowrap text-[11px] font-extrabold text-slate-500">{label}</span>
      <span dir="ltr" className="inline-flex items-center gap-1.5 whitespace-nowrap text-lg font-black tabular-nums text-indigo-950" style={{ unicodeBidi: 'isolate' }}>
        <span dir="ltr" style={{ unicodeBidi: 'isolate' }}>{a}</span>
        {struck ? <span className="inline-flex items-center gap-1"><del className="text-slate-400">{'<'}</del><span>=</span></span> : <span dir="ltr" style={{ unicodeBidi: 'isolate' }}>{rel}</span>}
        <span dir="ltr" style={{ unicodeBidi: 'isolate' }}>{b}</span>
      </span>
    </div>
  );
  if (band) {
    const t = L.taskOf(lab);
    const now = L.bandImage(lab);
    const rel = (r) => REL[r] ?? r;
    return (
      <div className="grid grid-cols-2 gap-2" data-lt-orders>
        {cell(k('beam.top'), rel(t.band.rel), 'x', num(t.band.bound), false, { 'data-lt-order': 'top' })}
        {now.collapsed
          ? cell(k('beam.bottom'), '=', '0', '0', false, { 'data-lt-order': 'bottom' })
          : cell(k('beam.bottom'), rel(now.rel), 'x', num(now.bound), false, { 'data-lt-order': 'bottom' })}
      </div>
    );
  }
  const first = bm[0];
  const end = bm[bm.length - 1];
  const rEnd = L.relOf(end[0], end[1]);
  return (
    <div className="grid grid-cols-2 gap-2" data-lt-orders>
      {cell(k('beam.top'), L.relOf(first[0], first[1]), num(first[0]), num(first[1]), false, { 'data-lt-order': 'top', 'data-rel': L.relOf(first[0], first[1]) })}
      {cell(k('beam.bottom'), rEnd, num(end[0]), num(end[1]), rEnd === '=', { 'data-lt-order': 'bottom', 'data-rel': rEnd })}
    </div>
  );
}

/* ══════════════ Les commandes ══════════════ */

function Controls({ lab, setLab, k }) {
  const [lo, hi] = L.RANGE[lab.tool];
  const idle = L.isIdentity(lab);
  const opw = opText(lab.tool, lab.v, k);
  const canStage = L.canStage(lab);
  const btn = 'inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-2xl border-2 px-3 text-sm font-black';
  return (
    <LabCard className="space-y-1.5 p-2" data-lt-controls>
      <div data-lt-tools>
        <ChoiceTray cols={2} className="gap-1.5 !p-1" role="group" aria-label={k('toolsAria')}>
          {L.TOOLS.map((tl) => (
            <ChoiceCard key={tl} size="sm" state={lab.tool === tl && lab.toolChosen ? 'selected' : 'idle'} aria-pressed={lab.tool === tl && lab.toolChosen}
              onClick={() => setLab((s) => L.setTool(s, tl))} data-lt-tool={tl} data-selected={lab.tool === tl && lab.toolChosen ? 'true' : 'false'}>
              <span className="block text-base font-black">{k(`tool.${tl}`)}</span>
              <span className="block text-xs font-bold opacity-80">{k(`toolHint.${tl}`)}</span>
            </ChoiceCard>
          ))}
        </ChoiceTray>
      </div>
      <div className="flex items-center gap-2" dir="ltr">
        <RoundButton onClick={() => setLab((s) => L.nudge(s, -1))} disabled={Lin.toNumber(lab.v) <= lo} aria-label={k('less')} size={44} data-lt-less><Minus className="h-5 w-5" strokeWidth={3} aria-hidden="true" /></RoundButton>
        <div className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-2xl border border-amber-100 bg-[#FFFBEB] px-3 py-1.5" data-lt-op>
          <bdi dir="ltr" className="whitespace-nowrap text-xl font-black tabular-nums text-amber-950">{idle ? '—' : opw}</bdi>
        </div>
        <RoundButton primary onClick={() => setLab((s) => L.nudge(s, 1))} disabled={Lin.toNumber(lab.v) >= hi} aria-label={k('more')} size={44} data-lt-more><Plus className="h-5 w-5" strokeWidth={3} aria-hidden="true" /></RoundButton>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setLab(L.tie)} disabled={idle} data-lt-tie
          className={`${btn} flex-1 border-indigo-600 bg-indigo-600 text-lg text-white shadow-[0_4px_0_0_#3730A3] transition-all duration-150 active:translate-y-0.5 disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none motion-reduce:transition-none ${ring}`}>
          <Link2 className="h-5 w-5" aria-hidden="true" /> {k('tie')}
        </button>
        {(canStage || lab.stages.length > 0 || L.maxStages(lab) > 1) && (
          <button type="button" onClick={() => setLab(L.addStage)} disabled={!canStage} data-lt-stage-btn
            className={`${btn} border-amber-300 bg-white text-amber-900 disabled:opacity-40 ${ring}`}>
            <Layers className="h-4 w-4" aria-hidden="true" /> {k('stage')}
          </button>
        )}
        <button type="button" onClick={() => setLab(L.undo)} disabled={idle && !lab.stages.length} data-lt-undo
          className={`${btn} border-indigo-200 bg-white text-indigo-900 disabled:opacity-40 ${ring}`}>
          <Undo2 className="h-4 w-4" aria-hidden="true" /> {k('undo')}
        </button>
      </div>
    </LabCard>
  );
}

/* ══════════════ « جرّب أعدادك أنت » : toujours ouvert ══════════════ */

function FreeCard({ lab, setLab, k }) {
  const free = L.isFree(lab);
  const [ta, setTa] = useState('');
  const [tb, setTb] = useState('');
  useEffect(() => { if (!lab.free) { setTa(''); setTb(''); } }, [lab.free]);
  const bad = (txt) => txt !== '' && !L.parseFree(txt);
  const equalAB = ta !== '' && tb !== '' && L.parseFree(ta) && L.parseFree(tb) && Lin.eq(L.parseFree(ta), L.parseFree(tb));
  const apply = (a, b) => { if (L.parseFree(a) && L.parseFree(b)) setLab((s) => L.setFree(s, a, b)); };
  const clean = (v) => v.replace(/[^0-9٠-٩\-−,٫./]/g, '').slice(0, 5);
  return (
    <LabCard className="space-y-2 border-emerald-200 bg-emerald-50/50 p-3" data-lt-free data-active={free ? 'true' : 'false'}>
      <p className="flex items-center gap-1.5 text-sm font-black text-emerald-900"><FlaskConical className="h-4 w-4" aria-hidden="true" /> {k('free.title')}</p>
      <p className="text-xs font-bold leading-snug text-slate-600">{free ? k('free.on') : k('free.hint')}</p>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs font-black text-red-800">
          {k('free.a')}
          <input type="text" inputMode="text" autoComplete="off" dir="ltr" value={ta} maxLength={5} aria-label={k('free.aAria')} aria-invalid={bad(ta)} data-lt-free-a
            onChange={(e) => { const v = clean(e.target.value); setTa(v); apply(v, tb); }}
            className={`h-11 w-20 rounded-xl border-2 ${bad(ta) ? 'border-rose-300' : 'border-red-300'} bg-white px-2 text-center text-xl font-black tabular-nums text-indigo-950 ${ring}`} />
        </label>
        <label className="flex items-center gap-2 text-xs font-black text-blue-800">
          {k('free.b')}
          <input type="text" inputMode="text" autoComplete="off" dir="ltr" value={tb} maxLength={5} aria-label={k('free.bAria')} aria-invalid={bad(tb)} data-lt-free-b
            onChange={(e) => { const v = clean(e.target.value); setTb(v); apply(ta, v); }}
            className={`h-11 w-20 rounded-xl border-2 ${bad(tb) ? 'border-rose-300' : 'border-blue-300'} bg-white px-2 text-center text-xl font-black tabular-nums text-indigo-950 ${ring}`} />
        </label>
        {(bad(ta) || bad(tb)) && <span className="text-xs font-bold text-rose-700">{k('free.bad')}</span>}
        {equalAB && <span className="text-xs font-bold text-rose-700">{k('free.same')}</span>}
        {free && (
          <button type="button" onClick={() => setLab(L.toGuided)} data-lt-free-back
            className={`inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-emerald-200 bg-white px-3 text-xs font-bold text-emerald-900 ${ring}`}>
            <Undo2 className="h-4 w-4" aria-hidden="true" /> {k('free.back')}
          </button>
        )}
      </div>
    </LabCard>
  );
}

/* ══════════════ La découverte et la règle ══════════════ */

export function discoveryOptions(lab, k) {
  const w = L.witnesses(lab);
  const comb = w.combNeg ?? { c: '-4', a2: '-3', b2: '-1' };
  const nail = w.nailBig ?? { c: '2', a2: '2', b2: '6' };
  return [
    { text: <MathText>{k('discovery.anyNeg')}</MathText>, why: <MathText>{k('discovery.whyAnyNeg', { c: iso(minus(comb.c)), a: iso(minus(comb.a2)), b: iso(minus(comb.b2)) })}</MathText> },
    { text: <MathText>{k('discovery.right')}</MathText>, correct: true },
    { text: <MathText>{k('discovery.big')}</MathText>, why: <MathText>{k('discovery.whyBig', { c: iso(minus(nail.c)), a: iso(minus(nail.a2)), b: iso(minus(nail.b2)) })}</MathText> },
  ];
}

const tex = (txt) => Lin.fracLatex(Lin.parseNumber(txt));
export function Formal({ lab, k }) {
  const w = L.witnesses(lab);
  const comb = w.combNeg;
  const pos = lab.trials.findLast((t) => !t.band && t.stages === 1 && t.tool === 'nail' && t.cNum > 0) ?? null;
  const neg = w.nailNeg;
  const par = (c) => (c.startsWith('-') ? `(${tex(c)})` : tex(c));
  const lineAdd = comb ? `$${tex(comb.a)} < ${tex(comb.b)} \\Longrightarrow ${tex(comb.a)} + ${par(comb.c)} < ${tex(comb.b)} + ${par(comb.c)}$` : null;
  const linePos = pos ? `$${tex(pos.a)} < ${tex(pos.b)},\\ c = ${tex(pos.c)} > 0 \\Longrightarrow ${tex(pos.a2)} < ${tex(pos.b2)}$` : null;
  const lineNeg = neg ? `$${tex(neg.a)} < ${tex(neg.b)},\\ c = ${tex(neg.c)} < 0 \\Longrightarrow ${tex(neg.a2)} > ${tex(neg.b2)}$` : null;
  return (
    <div className="space-y-2 text-sm font-bold text-emerald-950" data-lt-formal>
      <p className="text-center text-base" dir="ltr"><MathText>{'$a < b \\Longrightarrow a + c < b + c \\ ,\\ a - c < b - c$'}</MathText></p>
      <p className="text-center text-base" dir="ltr"><MathText>{'$a < b\\ ,\\ c > 0 \\Longrightarrow ac < bc$'}</MathText></p>
      <p className="text-center text-base" dir="ltr"><MathText>{'$a < b\\ ,\\ c < 0 \\Longrightarrow ac > bc$'}</MathText></p>
      <p><MathText>{k('formal.rule')}</MathText></p>
      {lineAdd && <p dir="ltr" className="text-center"><MathText>{lineAdd}</MathText></p>}
      {linePos && <p dir="ltr" className="text-center"><MathText>{linePos}</MathText></p>}
      {lineNeg && <p dir="ltr" className="text-center"><MathText>{lineNeg}</MathText></p>}
      <p><MathText>{k('formal.zero')}</MathText></p>
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite de questions de chaque tâche (par niveau, dans l'ordre des tâches) : elle interroge ce que l'élève vient de FAIRE ; la dernière finit par la règle. */
export const CHAINS = Object.freeze({
  beginner: Object.freeze([['order', 'factor'], ['reachC', 'order'], ['meet', 'rule']]),
  advanced: Object.freeze([['order', 'combKeeps'], ['bandFlip'], ['reachC', 'rule']]),
});

const $ = (s) => `$${s}$`;
const Mx = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const hitOf = (lab) => lab.trials.findLast((t) => !t.free && t.task === lab.ti && t.reached);
const tx = (txt) => Lin.fracLatex(Lin.parseNumber(txt));
const plain = (txt) => minus(Lin.fracText(Lin.parseNumber(txt)));
const cmpTex = { '<': '<', '>': '>', '=': '=' };

export const QUESTIONS = {
  order: (lab, task, k) => {
    const t = hitOf(lab);
    if (!t || t.band) return null;
    const o = { a: iso(plain(t.a)), b: iso(plain(t.b)), a2: iso(plain(t.a2)), b2: iso(plain(t.b2)), op: iso(opText(t.tool, Lin.parseNumber(t.c))) };
    const why = { '<': 'order.whyLt', '>': 'order.whyGt', '=': 'order.whyEq' };
    const order = ['>', '<', '='];
    if (lab.ti % 2) order.reverse();
    return {
      id: 'order', kind: 'choice', cols: 3,
      prompt: Mx(k, 'order.prompt', o),
      options: order.map((r) => (r === t.relTo
        ? { text: <MathText>{$(`${tx(t.a2)} ${cmpTex[r]} ${tx(t.b2)}`)}</MathText>, correct: true }
        : { text: <MathText>{$(`${tx(t.a2)} ${cmpTex[r]} ${tx(t.b2)}`)}</MathText>, why: Mx(k, why[r], o) })),
      hints: [Mx(k, 'order.hint1', o), Mx(k, 'order.hint2', o)],
      explain: Mx(k, 'order.explain', o),
    };
  },
  factor: (lab, task, k) => {
    const t = hitOf(lab);
    if (!t || t.band) return null;
    const pos = L.witnesses(lab).nailBig;
    const o = { c: iso(plain(t.c)) };
    return {
      id: 'factor', kind: 'choice',
      prompt: Mx(k, 'factor.prompt', o),
      options: [
        { text: Mx(k, 'factor.pos'), why: pos ? Mx(k, 'factor.whyPos', { pc: iso(plain(pos.c)), pa: iso(plain(pos.a2)), pb: iso(plain(pos.b2)) }) : Mx(k, 'factor.whyPosGeneric') },
        { text: Mx(k, 'factor.one'), why: Mx(k, 'factor.whyOne') },
        { text: Mx(k, 'factor.neg'), correct: true },
      ],
      hints: [Mx(k, 'factor.hint1', o), Mx(k, 'factor.hint2', o)],
      explain: Mx(k, 'factor.explain', o),
    };
  },
  reachC: (lab, task, k) => {
    const t = hitOf(lab);
    if (!t || t.band || t.stages !== 1 || !task.target) return null;
    const c = Lin.parseNumber(t.c);
    const a = Lin.parseNumber(t.a); const b = Lin.parseNumber(t.b);
    const bads = [Lin.neg(c), Lin.add(c, 1), Lin.add(c, -1)].filter((n, i, arr) => !Lin.eq(n, c) && !Lin.eq(n, 0) && arr.findIndex((m) => Lin.eq(m, n)) === i).slice(0, 2);
    const o = { a: iso(plain(t.a)), b: iso(plain(t.b)), ta: iso(num(task.target[0])), tb: iso(num(task.target[1])), tool: k(`tool.${t.tool}`), c: iso(plain(t.c)) };
    const options = bads.map((w) => {
      const x = L.stageOf(t.tool, w, a); const y = L.stageOf(t.tool, w, b);
      return { text: <MathText>{$(num(w))}</MathText>, why: Mx(k, 'reachC.why', { ...o, w: iso(num(w)), x: iso(num(x)), y: iso(num(y)) }) };
    });
    options.splice(lab.ti % 3, 0, { text: <MathText>{$(num(c))}</MathText>, correct: true });
    return {
      id: 'reachC', kind: 'choice', cols: 3,
      prompt: Mx(k, 'reachC.prompt', o), options,
      hints: [Mx(k, 'reachC.hint1', o), Mx(k, 'reachC.hint2', o)],
      explain: Mx(k, 'reachC.explain', o),
    };
  },
  meet: (lab, task, k) => {
    const t = hitOf(lab);
    if (!t || t.band) return null;
    const o = { a: iso(plain(t.a)), b: iso(plain(t.b)), na: iso(minus(Lin.fracText(Lin.neg(Lin.parseNumber(t.a))))), nb: iso(minus(Lin.fracText(Lin.neg(Lin.parseNumber(t.b))))) };
    return {
      id: 'meet', kind: 'choice',
      prompt: Mx(k, 'meet.prompt', o),
      options: [
        { text: Mx(k, 'meet.one'), why: Mx(k, 'meet.whyOne', o) },
        { text: Mx(k, 'meet.minus'), why: Mx(k, 'meet.whyMinus', o) },
        { text: Mx(k, 'meet.zero'), correct: true },
      ],
      hints: [Mx(k, 'meet.hint1', o), Mx(k, 'meet.hint2', o)],
      explain: Mx(k, 'meet.explain', o),
    };
  },
  combKeeps: (lab, task, k) => {
    const w = L.witnesses(lab).combNeg;
    if (!w) return null;
    const o = { c: iso(plain(w.c)), a: iso(plain(w.a)), b: iso(plain(w.b)), a2: iso(plain(w.a2)), b2: iso(plain(w.b2)) };
    return {
      id: 'combKeeps', kind: 'choice',
      prompt: Mx(k, 'combKeeps.prompt', o),
      options: [
        { text: Mx(k, 'combKeeps.flip'), why: Mx(k, 'combKeeps.whyFlip', o) },
        { text: Mx(k, 'combKeeps.keep'), correct: true },
        { text: Mx(k, 'combKeeps.meet'), why: Mx(k, 'combKeeps.whyMeet', o) },
      ],
      hints: [Mx(k, 'combKeeps.hint1', o), Mx(k, 'combKeeps.hint2', o)],
      explain: Mx(k, 'combKeeps.explain', o),
    };
  },
  bandFlip: (lab, task, k) => {
    const t = hitOf(lab);
    if (!t || !t.band) return null;
    const o = { start: Lin.fracText(task.band.bound), edge: t.edge };
    return {
      id: 'bandFlip', kind: 'choice',
      prompt: Mx(k, 'bandFlip.prompt', o),
      options: [
        { text: Mx(k, 'bandFlip.comb'), why: Mx(k, 'bandFlip.whyComb', o) },
        { text: Mx(k, 'bandFlip.neg'), correct: true },
        { text: Mx(k, 'bandFlip.pos'), why: Mx(k, 'bandFlip.whyPos', o) },
      ],
      hints: [Mx(k, 'bandFlip.hint1', o), Mx(k, 'bandFlip.hint2', o)],
      explain: Mx(k, 'bandFlip.explain', o),
    };
  },
  rule: (lab, task, k) => {
    const w = L.witnesses(lab);
    const o = { c: iso(plain(w.nailNeg?.c ?? '-2')) };
    return {
      id: 'rule', kind: 'choice',
      prompt: <MathText>{k('discovery.prompt')}</MathText>,
      options: discoveryOptions(lab, k),
      hints: [Mx(k, 'rule.hint1', o), Mx(k, 'rule.hint2', o)],
      explain: <Formal lab={lab} k={k} />,
    };
  },
};
