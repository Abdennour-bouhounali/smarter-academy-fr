import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Hand, CheckCircle2, Sparkles, ChevronLeft, FlaskConical, Undo2, Minus, Plus, RotateCcw, Lock, Ruler } from 'lucide-react';
import { resolveLevelId } from '@smarter-academy/core/curriculum/manipulationLevels.js';
import * as D from '@smarter-academy/core/arithmetic/decimals.js';
import * as F from '@smarter-academy/core/arithmetic/fractions2.js';
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
import * as L from '../logic/mooringLines';
import { COL, HarborBackdrop, Kids, Rope, Clip } from './mooringLines/art';

/**
 * mooring-lines — LE QUOTIENT SOUS LA MAIN (2AM, unité 2, درس « الكسر: نسبة وحاصل قسمة وقيم مقرّبة », 2026-10-28). La logique, exacte, est dans `logic/mooringLines.js`
 * (sur `packages/core/arithmetic/fractions2.js`, importé par chemin). Thème `harbor` : le مرسى الصيّادين, un quai de pierre, une corde posée sur un ruban gradué.
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. La main tient le QUOTIENT candidat q à un rang (1, 0,1, 0,01) : on glisse le mousqueton sur sa barre (curseur, glisser, ← →, PageUp/PageDown, −/+). Au niveau متقدم elle choisit aussi
 *    l'UNITÉ du ruban (m / dm / cm) ; « ضع القطع » est l'essai.
 * B. Les b morceaux (مبتدئ : b cordes de longueur q) ou les q cordes de b m (متقدم) sont posés bout à bout sur la corde de a m : la reste ou le débordement est écrit en LONGUEUR.
 * C. La résistance : la corde ne suffit jamais exactement quand la division ne finit pas (8 ÷ 3) ; le cadran ne s'ouvre qu'après l'encadrement du rang ; le curseur reste verrouillé tant
 *    que la corde n'est pas un naturel dans l'unité du ruban.
 * D. La phase formelle écrit ce que l'élève a trouvé : 8 = 3 × 2,66 + 0,02 ; 2,66 < 8/3 < 2,67 ; 4,6/0,7 = 46/7.
 * E. Les fausses conjectures sont réfutées par SES essais (le reste écrit après la virgule, un seul terme multiplié par 10, la valeur par excès prise pour le quotient).
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        un quotient non décimal est UN nombre que deux valeurs approchées encadrent à tout rang sans l'atteindre ; × 10ⁿ aux deux termes ne change pas le quotient
 *   OBJECT         une corde de a m, des morceaux posés bout à bout sur un ruban
 *   VARIABLE       le quotient candidat q (en unités du rang courant)
 *   INVARIANT      b × q contre a (le fait physique : il reste du câble / il déborde) ; le nombre de cordes quand l'unité change
 *   TRANSFORMATION q → (b × q ; reste ou débordement)
 *   CONSTRAINT     rang 1 / 0,1 / 0,01 ouvert seulement après l'encadrement ; fenêtre zoomée ; unité du ruban
 *   RESISTANCE     le reste ne tombe jamais à 0 quand la division ne finit pas ; un curseur verrouillé tant que le diviseur n'est pas naturel
 *   EVIDENCE       les pièces fantômes, le reste / débordement en longueur, les deux drapeaux « يكفي / لا يكفي »
 *   CONTRAST       8 ÷ 3 (jamais exact) contre 9 ÷ 4 (2,25 exact) ; 4,6 ÷ 0,7 contre 46 ÷ 7 (même nombre de cordes)
 *   PREDICTION     (متقدم) l'unité qui rend le diviseur naturel est choisie AVANT le premier geste
 *   DISCOVERY      « متى ينتهي البحث عن رتبة أدقّ ؟ »
 *   FORMALIZATION  8 = 3 × 2,66 + 0,02 ; 3 × 2,66 < 8 < 3 × 2,67 ; 2,66 < 8/3 < 2,67
 *   TRANSFER       « جرّب أعدادك » (toujours ouvert), les exercices et la banque
 *
 * « جرّب كل الإمكانيات » : NON (chaque pose EST l'essai). « جرّب أعدادك » est TOUJOURS ouvert sous le labo.
 * D'UN SEUL REGARD (§8bis) : `[data-ml-glance]` enveloppe la consigne, la scène, les commandes et le verdict.
 * ONBOARDING : `coach` (défaut true) → `LabCoach` ; `logic/mooringLines.js › coachOf` (unit · clip · lay · dial · next).
 * Props : `tasks`, `level`, `levels`, `coach`, `title`, `lead`, `onTrial(event)`, `onFinished()` — par `state.report`.
 * CONTRAT DOM : [data-mooring-lines][data-level][data-task][data-rank][data-q][data-solved][data-layout], [data-ml-glance], [data-ml-scene], [data-ml-clip][role=slider][data-q],
 * [data-ml-dial], [data-ml-rank=<r>][aria-pressed], [data-ml-unit], [data-ml-unit-opt=<u>], [data-ml-piece=<i>], [data-ml-gap][data-verdict], [data-ml-flag=lo|hi], [data-ml-lay], [data-ml-less],
 * [data-ml-more], [data-ml-restart], [data-ml-next], [data-ml-verdict], [data-ml-step=<i>], [data-ml-free][data-active], [data-ml-free-a], [data-ml-free-b], [data-ml-free-back], [data-ml-formal].
 */
const NS = 'manipulation.mooringLines';
const LRI = '⁦';
const PDI = '⁩';
const iso = (s) => `${LRI}${s}${PDI}`;
const WIDE_MIN = 700;
const SIDE_W = 236;
const SCENE_MAX = 560;
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-indigo-300';
const mtr = (s, u = 'm') => iso(`${s} ${u}`);
const tx = (txt) => String(txt).replace(',', '{,}');
const $ = (s) => `$${s}$`;

const CSS = `
@keyframes ml-pop { 0% { transform: scale(0.85); opacity: 0.2; } 100% { transform: scale(1); opacity: 1; } }
@keyframes ml-glow { 0%, 100% { opacity: 0.45; } 50% { opacity: 0.95; } }
.ml-pop { animation: ml-pop 220ms ease-out; transform-box: fill-box; transform-origin: center; }
.ml-glow { animation: ml-glow 1400ms ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .ml-pop, .ml-glow { animation: none !important; } }
`;

export function numbersFor({ tasks, level }) {
  const lv = resolveLevelId(level ?? 'beginner');
  const asked = LEVELS['mooring-lines'][lv].numbers;
  return { tasks: tasks ?? asked.tasks };
}

export default function MooringLines({
  tasks, title, lead, level, levels: withLevels = true, coach: coachOn = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const initialNumbers = useMemo(() => numbersFor({ tasks, level }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'mooring-lines', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
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
  const cpSettings = useLabCheckpointSettings('mooring-lines');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const chain = cpOn && cpSettings.enabled && !L.isFree(lab) ? CHAINS[cur.id] ?? null : null;
  const isRule = (q) => q === 'rule' || q === 'ruleUnit';
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
    lab: 'mooring-lines', step: coachStep,
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
  const kind = lab.tasks[0].kind;

  const discovery = (
    <ManipulationDiscovery state={state} prompt={<MathText>{k(kind === 'count' ? 'discovery.promptUnit' : 'discovery.prompt')}</MathText>}
      options={kind === 'count' ? unitOptions(lab, k) : ruleOptions(lab, k)} formal={<Formal lab={lab} k={k} />} />
  );

  return (
    <ManipulationShell
      type="mooring-lines"
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
        <div ref={boxRef} className="space-y-2" data-mooring-lines data-level={kind === 'count' ? 'advanced' : 'beginner'} data-task={lab.free ? 'free' : lab.ti}
          data-rank={lab.w.rank} data-q={L.qText(lab)} data-solved={finished ? 'true' : 'false'} data-layout={width >= WIDE_MIN ? 'wide' : 'narrow'}>
          <style dangerouslySetInnerHTML={{ __html: CSS }} />
          <Lab lab={lab} setLab={setLab} k={k} width={width} screenH={screenH} lead={state.isAuthoredLevel ? lead : null} cp={cp} />
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ══════════════ Le laboratoire ══════════════ */

function Lab({ lab, setLab, k, width, screenH, lead, cp }) {
  const wide = width >= WIDE_MIN;
  const task = L.taskOf(lab);
  const free = L.isFree(lab);
  const count = task.kind === 'count';
  const done = L.taskDone(lab);
  const lit = !free && done;
  const w = lab.w;
  const last = lab.last;
  const tp = L.tape(lab);

  /* ── la consigne : le contexte puis UNE question ── */
  const ctx = (() => {
    if (lead && lab.ti === 0 && !free) return lead;
    const o = { a: mtr(task.a), b: count ? mtr(task.b) : iso(task.b) };
    if (free) return k(count ? 'context.freeCount' : 'context.freeShare', o);
    return k(count ? 'context.count' : 'context.share', o);
  })();
  const question = k(count ? 'question.count' : 'question.share');

  const stepDone = lab.tasks.map((_, i) => !!lab.done[i] && (i !== lab.ti || !cp.blocking));
  const steps = lab.tasks.length > 1 && !free && (
    <LabStepper count={lab.tasks.length} current={lab.ti} done={stepDone} stepAttr="data-ml-step" />
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

  /* ── le son (muet sauf « الصوت ») : un déclic par cran (au plus un toutes les 35 ms), puis : cloche (atterrissage exact), drapeau (encadrement trouvé), « over » (déborde) ── */
  const sfx = useRef({ qn: w.qn, at: 0, key: '' });
  const sfxKey = `${free ? 'free' : lab.ti}:${w.rank}`;
  useEffect(() => {
    const p = sfx.current;
    if (p.key !== sfxKey) { sfx.current = { qn: w.qn, at: 0, key: sfxKey }; return; }
    const d = w.qn - p.qn;
    if (d === 0) return;
    const now = performance.now();
    if (now - p.at > 35) { playSfx('tooth', { pitch: d > 0 ? 1 : 0.75 }); p.at = now; }
    p.qn = w.qn;
  }, [w.qn, sfxKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const nTrials = lab.trials.length;
  useEffect(() => {
    if (!nTrials) return;
    const tr = lab.trials[nTrials - 1];
    if (tr.kind === 'bracket') playSfx(tr.exact ? 'bell' : 'flag');
    else if (tr.kind === 'lay' && tr.verdict === 'over') playSfx('over');
  }, [nTrials]); // eslint-disable-line react-hooks/exhaustive-deps

  const prompt = (
    <PromptCard size={wide ? 'lg' : 'md'} context={<MathText>{ctx}</MathText>} contextProps={{ 'data-ml-context': free ? 'free' : count ? 'count' : 'share' }}
      title={<MathText>{question}</MathText>} titleClassName={wide ? 'text-xl' : 'text-lg'} lamp={free ? null : lit ? 'on' : 'off'}
      titleProps={{ 'data-ml-prompt': count ? 'count' : 'share', 'data-lit': lit ? 'true' : 'false' }} />
  );

  /* ── le verdict : la CONSÉQUENCE avec les nombres de l'élève, jamais la règle ── */
  const g = last?.kind === 'lay' ? last : null;
  const unitOf = (txt) => L.shiftText(txt, tp.e);
  const verdictLine = (() => {
    if (L.clipLocked(lab)) return k('idleLocked');
    if (!g) return k('idle');
    const o = { q: iso(g.q), gap: mtr(unitOf(g.gap), tp.unit), b: iso(task.b) };
    if (g.verdict === 'exact') return k('v.exact', o);
    if (g.verdict === 'fits') return k(g.model === 'remainderComma' ? 'v.remainderComma' : 'v.fits', o);
    return k('v.over', o);
  })();
  const found = L.bracketFound(lab);
  const note = g && found && !L.taskDone(lab) && !w.exact
    ? k('v.bracketNote', { lo: iso(L.qAt(lab, w.lo)), hi: iso(L.qAt(lab, w.hi)) }) : null;
  const vkey = !g ? '' : g.verdict === 'over' ? 'over' : g.verdict;
  const tone = !g ? 'indigo' : g.verdict === 'exact' ? 'emerald' : g.verdict === 'over' ? 'rose' : 'amber';
  const Icon = !g ? Hand : g.verdict === 'exact' ? CheckCircle2 : Sparkles;
  const canNext = L.canNext(lab) && !cp.blocking;
  const mood = !g ? 'happy' : g.verdict === 'exact' ? 'proud' : 'wonder';
  const banner = (
    <VerdictBanner tone={tone} icon={wide ? Icon : null} size="sm" className="min-h-[3.5rem]" data-ml-verdict={vkey}>
      <div className="min-w-0 space-y-1.5">
        <p className={g ? '' : 'font-bold text-indigo-900'}>{verdictLine}</p>
        {note && <p className="text-[13px] font-bold text-emerald-800" data-ml-note>{note}</p>}
        {canNext && (
          <button type="button" onClick={() => setLab(L.nextTask)} data-ml-next
            className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-2 border-emerald-600 bg-emerald-600 px-3.5 text-sm font-black text-white shadow-[0_3px_0_0_#047857] transition-all duration-150 active:translate-y-0.5 motion-reduce:transition-none ${ring}`}>
            {k('next')} <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </VerdictBanner>
  );

  const stageW = Math.min(SCENE_MAX, Math.max(300, (wide ? width - SIDE_W - 12 : width) - 24));
  const legend = (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1" data-ml-legend>
      <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-700"><Ruler className="h-4 w-4 text-amber-700" aria-hidden="true" />{k('legend.rank', { rank: iso(L.stepText(lab)) })}</span>
      {steps || null}
    </div>
  );
  const stage = <Quay lab={lab} setLab={setLab} k={k} width={stageW} screenH={screenH} mood={mood} />;
  const controls = <Controls lab={lab} setLab={setLab} k={k} />;

  return (
    <>
      <div className="relative space-y-2" data-ml-glance>
        {party.node}
        {cp.node}
        {prompt}
        {wide ? (
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <StageFrame className="min-w-0 space-y-1.5 overflow-hidden p-3" data-ml-stage>{legend}{stage}</StageFrame>
              {controls}
            </div>
            <div className="flex shrink-0 flex-col gap-2.5" style={{ width: SIDE_W }}>{banner}</div>
          </div>
        ) : (
          <>
            <StageFrame className="min-w-0 space-y-1.5 overflow-hidden p-2" data-ml-stage>{legend}{stage}</StageFrame>
            {controls}
            {banner}
          </>
        )}
      </div>
      <FreeCard lab={lab} setLab={setLab} k={k} />
    </>
  );
}

/* ══════════════ Le quai : la scène ══════════════ */

const niceStep = (raw) => {
  const p = 10 ** Math.floor(Math.log10(Math.max(raw, 1e-9)));
  for (const m of [1, 2, 5, 10]) if (m * p >= raw) return m * p;
  return 10 * p;
};

function Quay({ lab, setLab, k, width, screenH, mood }) {
  const uid = `ml${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const task = L.taskOf(lab);
  const count = task.kind === 'count';
  const w = lab.w;
  const tp = L.tape(lab);
  const W = width;
  const SH = screenH >= 1000 ? 282 : 246;
  const A = Number(task.a.replace(',', '.'));
  const B = Number(task.b.replace(',', '.'));
  const qf = w.qn / 10 ** w.rank;
  const m = L.measure(lab);
  const verdict = m.verdict;
  const padL = count ? 62 : 98;
  const dom = A * 1.38;
  const x = (v) => padL + (v / dom) * (W - padL - 14);
  const xEnd = x(A);
  const total = count ? B * qf : B * qf;                // la longueur posée = b × q (les deux modes)
  const pieces = [];
  if (qf > 0) {
    if (!count) for (let i = 0; i < B; i += 1) pieces.push([i * qf, (i + 1) * qf]);
    else for (let i = 0; i < Math.ceil(qf - 1e-9); i += 1) pieces.push([i * B, Math.min((i + 1) * B, qf * B)]);
  }
  const unit = Math.pow(10, tp.e);
  const stepU = niceStep((dom * unit) / 9);
  const endU = A * unit;
  const ticks = [];
  for (let v = 0; v < endU - stepU * 0.45; v += stepU) ticks.push(v);
  ticks.push(endU);
  const gapText = L.shiftText(D.format(m.gap), tp.e);
  const pillX = Math.min(W - 70, Math.max(70, (x(Math.min(total, dom)) + xEnd) / 2));
  const trackX0 = 56; const trackX1 = W - 56; const trackY = SH - 36;
  const span = Math.max(1, w.w1 - w.w0);
  const tx0 = (n) => trackX0 + ((n - w.w0) / span) * (trackX1 - trackX0);
  const dragRef = useRef(false);
  const fromEvent = (e) => {
    const box = e.currentTarget.ownerSVGElement?.getBoundingClientRect?.() ?? e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - box.left) / Math.max(1, box.width)) * W;
    const n = w.w0 + ((px - trackX0) / (trackX1 - trackX0)) * span;
    setLab((s) => L.setQ(s, n));
  };
  const down = (e) => { if (L.clipLocked(lab)) return; dragRef.current = true; e.currentTarget.setPointerCapture?.(e.pointerId); fromEvent(e); };
  const move = (e) => { if (dragRef.current) fromEvent(e); };
  const up = () => { dragRef.current = false; };
  const key = (e) => {
    const mp = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 10, PageDown: -10 };
    if (e.key in mp) { e.preventDefault(); setLab((s) => L.nudge(s, mp[e.key])); }
    if (e.key === 'Home') { e.preventDefault(); setLab(L.toStart); }
    if (e.key === 'Enter') { e.preventDefault(); setLab(L.lay); }
  };
  const locked = L.clipLocked(lab);
  const slotTicks = span <= 12 ? Array.from({ length: span + 1 }, (_, i) => w.w0 + i) : [w.w0, Math.round(w.w0 + span / 2), w.w1];
  const pillTone = verdict === 'over' ? '#FEE2E2' : verdict === 'exact' ? '#D1FAE5' : '#FEF3C7';
  const pillInk = verdict === 'over' ? '#991B1B' : verdict === 'exact' ? '#065F46' : '#92400E';
  const pillText = verdict === 'over' ? k('pill.over', { gap: mtr(gapText, tp.unit) }) : verdict === 'exact' ? k('pill.exact') : k('pill.fits', { gap: mtr(gapText, tp.unit) });
  const showPill = lab.last?.kind === 'lay' && lab.w.laid;
  const shownLo = w.lo != null && (w.lo > w.w0 || w.rank > 0 || (w.lo > 0)) ? w.lo : null;

  return (
    <div className="space-y-1.5" data-ml-scene-box>
      <svg width="100%" viewBox={`0 0 ${W} ${SH}`} style={{ maxWidth: W, display: 'block', margin: '0 auto', touchAction: 'none' }} role="group" aria-label={k('stageAria')} data-ml-scene dir="ltr">
        <HarborBackdrop W={W} H={SH} quayEnd={xEnd + 8} uid={uid} />
        <Kids W={W} mood={mood} lina={!count} />
        {/* le ruban gradué : la corde de a m posée sur ses graduations */}
        <g aria-hidden="true">
          <rect x={x(0)} y={127} width={xEnd - x(0)} height={22} rx={3} fill={COL.tape} stroke={COL.tapeInk} strokeWidth={1.2} />
          {ticks.map((v) => {
            const xx = x(v / unit);
            return (
              <g key={v}>
                <line x1={xx} x2={xx} y1={127} y2={139} stroke={COL.tapeInk} strokeWidth={1.4} />
                <text x={xx} y={163} textAnchor="middle" fontSize={v === endU ? 12 : 11} fontWeight={v === endU ? 900 : 800} fill={v === endU ? '#1E3A8A' : COL.tapeInk} {...(v === endU ? { 'data-ml-tape-end': tp.a } : {})}>{v === endU ? iso(`${D.formatTrim(D.make(Math.round(v * 1000), 3))} ${tp.unit}`) : D.formatTrim(D.make(Math.round(v * 1000), 3))}</text>
              </g>
            );
          })}
        </g>
        <Rope x0={x(0)} x1={xEnd} y={118} />
        {/* les morceaux posés bout à bout */}
        {pieces.slice(0, 40).map(([p0, p1], i) => {
          const over = p1 > A + 1e-9;
          const full = Math.abs((p1 - p0) - (count ? B : qf)) < 1e-9;
          const x0 = x(Math.min(p0, dom)); const x1 = x(Math.min(p1, dom));
          return (
            <g key={i} data-ml-piece={i} className="ml-pop">
              <rect x={x0} y={106} width={Math.max(1, x1 - x0 - 1)} height={24} rx={4} fill={i % 2 ? COL.tintB : COL.tintA} fillOpacity={0.55} stroke={over ? COL.over : '#1E3A8A'} strokeWidth={1.6} strokeDasharray={full ? '5 3' : '2 2'} />
            </g>
          );
        })}
        {total > A + 1e-9 && qf > 0 && (
          <rect x={xEnd} y={107} width={Math.max(0, x(Math.min(total, dom)) - xEnd)} height={22} rx={4} fill={COL.over} fillOpacity={0.5} />
        )}
        {total < A - 1e-9 && qf > 0 && (
          <rect x={x(total)} y={109} width={Math.max(0, xEnd - x(total))} height={18} rx={4} fill={COL.fit} fillOpacity={0.75} className="ml-glow" />
        )}
        {!count && qf > 0 && <Clip x={x(Math.min(qf, dom))} y={99} active={verdict === 'exact'} />}
        {showPill && (
          <g data-ml-gap-box>
            <rect x={pillX - 64} y={74} width={128} height={22} rx={11} fill={pillTone} stroke={pillInk} strokeWidth={1.4} />
            <text x={pillX} y={89} textAnchor="middle" fontSize={11.5} fontWeight={900} fill={pillInk} data-ml-gap data-verdict={verdict}>{pillText}</text>
          </g>
        )}
        {/* la barre du mousqueton : le quotient candidat à ce rang (la fenêtre zoome dans le segment trouvé) */}
        <g>
          <rect x={trackX0 - 10} y={trackY - 9} width={trackX1 - trackX0 + 20} height={18} rx={9} fill={COL.wood} stroke={COL.woodDark} strokeWidth={1.6} opacity={locked ? 0.55 : 1} />
          {slotTicks.map((n) => (
            <g key={n} aria-hidden="true">
              <line x1={tx0(n)} x2={tx0(n)} y1={trackY - 9} y2={trackY + 15} stroke={COL.woodDark} strokeWidth={1.2} />
              <text x={tx0(n)} y={trackY + 28} textAnchor="middle" fontSize={11} fontWeight={800} fill="#334155">{D.format(D.make(n, w.rank))}</text>
            </g>
          ))}
          {shownLo != null && (
            <g data-ml-flag="lo" aria-hidden="true">
              <line x1={tx0(w.lo)} x2={tx0(w.lo)} y1={trackY - 26} y2={trackY - 9} stroke="#059669" strokeWidth={2} />
              <rect x={tx0(w.lo) - 28} y={trackY - 44} width={56} height={17} rx={8} fill="#D1FAE5" stroke="#059669" strokeWidth={1.2} />
              <text x={tx0(w.lo)} y={trackY - 32} textAnchor="middle" fontSize={10.5} fontWeight={900} fill="#065F46">{k('flag.fits')}</text>
            </g>
          )}
          {w.hi != null && (
            <g data-ml-flag="hi" aria-hidden="true">
              <line x1={tx0(w.hi)} x2={tx0(w.hi)} y1={trackY - 26} y2={trackY - 9} stroke="#DC2626" strokeWidth={2} />
              <rect x={tx0(w.hi) - 30} y={trackY - 44} width={60} height={17} rx={8} fill="#FEE2E2" stroke="#DC2626" strokeWidth={1.2} />
              <text x={tx0(w.hi)} y={trackY - 32} textAnchor="middle" fontSize={10.5} fontWeight={900} fill="#991B1B">{k('flag.over')}</text>
            </g>
          )}
          <g role="slider" tabIndex={locked ? -1 : 0} aria-label={k('clipAria')} aria-valuemin={w.w0} aria-valuemax={w.w1} aria-valuenow={w.qn} aria-valuetext={iso(L.qText(lab))} aria-disabled={locked}
            data-ml-clip data-q={L.qText(lab)} data-locked={locked ? 'true' : 'false'} onKeyDown={key} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
            className={ring} style={{ cursor: locked ? 'not-allowed' : 'grab', outline: 'none', touchAction: 'none' }}>
            <rect x={trackX0 - 18} y={trackY - 22} width={trackX1 - trackX0 + 36} height={44} fill="transparent" />
            <Clip x={tx0(w.qn)} y={trackY} active={!locked} label={D.format(D.make(w.qn, w.rank))} />
          </g>
          {locked && <text x={W / 2} y={trackY - 30} textAnchor="middle" fontSize={11.5} fontWeight={900} fill="#475569">{k('locked')}</text>}
        </g>
      </svg>
    </div>
  );
}

/* ══════════════ Les commandes : −/+, « ضع القطع », le cadran, l'unité ══════════════ */

function Controls({ lab, setLab, k }) {
  const task = L.taskOf(lab);
  const count = task.kind === 'count';
  const w = lab.w;
  const locked = L.clipLocked(lab);
  const idle = w.qn === w.w0 && !w.touched;
  const btn = 'inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-2xl border-2 px-3 text-sm font-black';
  const rankText = (r) => (count ? iso(D.format(D.make(1, r))) : mtr(D.format(D.make(1, r))));
  return (
    <LabCard className="space-y-2 p-2" data-ml-controls>
      <div className="flex items-center gap-2" dir="ltr">
        <RoundButton onClick={() => setLab((s) => L.nudge(s, -1))} disabled={locked || w.qn <= w.w0} aria-label={k('less')} size={48} data-ml-less><Minus className="h-5 w-5" strokeWidth={3} aria-hidden="true" /></RoundButton>
        <button type="button" onClick={() => setLab(L.lay)} disabled={locked} data-ml-lay
          className={`${btn} flex-1 border-indigo-600 bg-indigo-600 text-lg text-white shadow-[0_4px_0_0_#3730A3] transition-all duration-150 active:translate-y-0.5 disabled:opacity-50 motion-reduce:transition-none ${ring}`}>
          {k('lay')}
        </button>
        <RoundButton primary onClick={() => setLab((s) => L.nudge(s, 1))} disabled={locked || w.qn >= w.w1} aria-label={k('more')} size={48} data-ml-more><Plus className="h-5 w-5" strokeWidth={3} aria-hidden="true" /></RoundButton>
        <button type="button" onClick={() => setLab(L.toStart)} disabled={idle || locked} data-ml-restart aria-label={k('restart')} title={k('restart')}
          className={`${btn} border-amber-300 bg-white text-amber-900 disabled:opacity-40 ${ring}`}>
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5" data-ml-dialrow>
        <span className="flex items-center gap-1" role="group" aria-label={k('dialAria')} data-ml-dial>
          <span className="text-xs font-black text-amber-900">{k('dial')}</span>
          {[0, 1, 2].map((r) => {
            const open = L.dialUnlocked(lab, r);
            const cur = w.rank === r;
            return (
              <button key={r} type="button" disabled={!open} aria-pressed={cur} data-ml-rank={r} onClick={() => setLab((s) => L.setRank(s, r))}
                title={open ? undefined : k('dialLocked')}
                className={`inline-flex min-h-[44px] min-w-[50px] items-center justify-center gap-0.5 rounded-xl border-2 px-1.5 text-xs font-black tabular-nums disabled:opacity-45 ${cur ? 'border-amber-600 bg-amber-500 text-white' : 'border-amber-200 bg-white text-amber-900'} ${ring}`}>
                {!open && <Lock className="h-3.5 w-3.5" aria-hidden="true" />}<bdi dir="ltr">{rankText(r)}</bdi>
              </button>
            );
          })}
        </span>
        {count && (
          <span className="flex items-center gap-1" role="group" aria-label={k('unitAria')} data-ml-unit>
            <span className="text-xs font-black text-sky-900">{k('unit')}</span>
            {L.UNITS.map((u) => (
              <button key={u} type="button" aria-pressed={w.unit === u} data-ml-unit-opt={u} onClick={() => setLab((s) => L.setUnit(s, u))}
                className={`inline-flex min-h-[44px] min-w-[42px] items-center justify-center rounded-xl border-2 px-1.5 text-xs font-black ${w.unit === u ? 'border-sky-600 bg-sky-600 text-white' : 'border-sky-200 bg-white text-sky-900'} ${ring}`}>
                <bdi dir="ltr">{u}</bdi>
              </button>
            ))}
          </span>
        )}
      </div>
    </LabCard>
  );
}

/* ══════════════ « جرّب أعدادك » : toujours ouvert ══════════════ */

function FreeCard({ lab, setLab, k }) {
  const free = L.isFree(lab);
  const kind = lab.tasks[0].kind;
  const [ta, setTa] = useState('');
  const [tb, setTb] = useState('');
  useEffect(() => { if (!lab.free) { setTa(''); setTb(''); } }, [lab.free]);
  const clean = (v) => v.replace(/[^0-9٠-٩,٫.]/g, '').slice(0, 5);
  const run = (a, b) => { if (L.parseA(a) && L.parseB(b, kind)) setLab((s) => L.freeTask(s, a, b)); };
  const bad = (ta !== '' && !L.parseA(ta)) || (tb !== '' && !L.parseB(tb, kind));
  return (
    <LabCard className="space-y-3 border-emerald-200 bg-emerald-50/50 p-3" data-ml-free data-active={free ? 'true' : 'false'}>
      <p className="flex items-center gap-1.5 text-sm font-black text-emerald-900"><FlaskConical className="h-4 w-4" aria-hidden="true" /> {k('free.title')}</p>
      <p className="text-xs font-bold leading-snug text-slate-600">{free ? k('free.on') : k(kind === 'count' ? 'free.hintCount' : 'free.hintShare')}</p>
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-xs font-black text-amber-900">
          {k('free.a')}
          <input type="text" inputMode="decimal" autoComplete="off" dir="ltr" value={ta} maxLength={5} aria-label={k('free.aAria')} data-ml-free-a
            onChange={(e) => { const v = clean(e.target.value); setTa(v); run(v, tb); }}
            className={`h-11 w-24 rounded-xl border-2 border-amber-300 bg-white px-2 text-center text-xl font-black tabular-nums text-indigo-950 ${ring}`} />
        </label>
        <span className="text-xl font-black text-slate-500" aria-hidden="true">÷</span>
        <label className="flex items-center gap-2 text-xs font-black text-teal-900">
          {k(kind === 'count' ? 'free.bCount' : 'free.bShare')}
          <input type="text" inputMode="decimal" autoComplete="off" dir="ltr" value={tb} maxLength={4} aria-label={k('free.bAria')} data-ml-free-b
            onChange={(e) => { const v = clean(e.target.value).slice(0, 4); setTb(v); run(ta, v); }}
            className={`h-11 w-20 rounded-xl border-2 border-teal-300 bg-white px-2 text-center text-xl font-black tabular-nums text-indigo-950 ${ring}`} />
        </label>
        {bad && <span className="text-xs font-bold text-rose-700">{k(kind === 'count' ? 'free.badCount' : 'free.badShare')}</span>}
        {free && (
          <button type="button" onClick={() => setLab(L.toGuided)} data-ml-free-back
            className={`inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-emerald-200 bg-white px-3 text-xs font-bold text-emerald-900 ${ring}`}>
            <Undo2 className="h-4 w-4" aria-hidden="true" /> {k('free.back')}
          </button>
        )}
      </div>
    </LabCard>
  );
}

/* ══════════════ La découverte et la règle ══════════════ */

/** Les nombres de la tâche COURANTE (ou de la première tâche d'un niveau) : les ends trouvés, et les produits exacts. */
function figures(lab) {
  const t = L.taskOf(lab);
  const br = F.decimalQuotientBracket(t.a, t.b, 2);
  const lo = D.format(br.lo); const hi = D.format(br.hi);
  const at = (q) => F.fitsAtRank(t.a, t.b, q);
  const pl = at(lo); const ph = at(hi);
  return { t, lo, hi, exact: br.exact, prodLo: D.formatTrim(pl.product), gapLo: D.formatTrim(pl.gap), prodHi: D.formatTrim(ph.product), gapHi: D.formatTrim(ph.gap) };
}

export function ruleOptions(lab, k) {
  const f = figures(lab);
  const o = { a: iso(f.t.a), b: iso(f.t.b), lo: iso(f.lo), hi: iso(f.hi), prodLo: iso(f.prodLo), prodHi: iso(f.prodHi), gapLo: iso(f.gapLo), gapHi: iso(f.gapHi) };
  return [
    { text: <MathText>{k('rule.right')}</MathText>, correct: true },
    { text: <MathText>{k('rule.exactLo')}</MathText>, why: <MathText>{k('rule.whyExactLo', o)}</MathText> },
    { text: <MathText>{k('rule.exactHi')}</MathText>, why: <MathText>{k('rule.whyExactHi', o)}</MathText> },
    { text: <MathText>{k('rule.both')}</MathText>, why: <MathText>{k('rule.whyBoth', o)}</MathText> },
  ];
}

export function unitOptions(lab, k) {
  const t = L.taskOf(lab);
  const a10 = L.shiftText(t.a, 1); const b10 = L.shiftText(t.b, 1);
  const o = { a: iso(t.a), b: iso(t.b), a10: iso(a10), b10: iso(b10) };
  return [
    { text: <MathText>{$(`\\frac{${tx(a10)}}{${tx(b10)}}`)}</MathText>, correct: true },
    { text: <MathText>{$(`\\frac{${tx(a10)}}{${tx(t.b)}}`)}</MathText>, why: <MathText>{k('unitRule.whyOne', o)}</MathText> },
    { text: <MathText>{$(`\\frac{${tx(t.a)}}{${tx(b10)}}`)}</MathText>, why: <MathText>{k('unitRule.whyOther', o)}</MathText> },
  ];
}

export function Formal({ lab, k }) {
  const f = figures(lab);
  const t = f.t;
  const count = t.kind === 'count';
  const frac = `\\frac{${tx(t.a)}}{${tx(t.b)}}`;
  const a10 = L.shiftText(t.a, F.clearDecimals(t.a, t.b).k); const b10 = L.shiftText(t.b, F.clearDecimals(t.a, t.b).k);
  const hi = f.hi;
  return (
    <div className="space-y-2 text-sm font-bold text-emerald-950" data-ml-formal>
      {count ? (
        <>
          <p className="text-center text-base" dir="ltr"><MathText>{$(`${frac}=\\frac{${tx(a10)}}{${tx(b10)}}`)}</MathText></p>
          <p><MathText>{k('formal.count')}</MathText></p>
          <p className="text-center text-base" dir="ltr"><MathText>{$(`${tx(f.lo)}<\\frac{${tx(a10)}}{${tx(b10)}}<${tx(hi)}`)}</MathText></p>
        </>
      ) : (
        <>
          <p className="text-center text-base" dir="ltr"><MathText>{$(`${tx(t.a)}=${tx(t.b)}\\times ${tx(f.lo)}+${tx(f.gapLo)}`)}</MathText></p>
          <p className="text-center text-base" dir="ltr"><MathText>{$(`${tx(t.b)}\\times ${tx(f.lo)}<${tx(t.a)}<${tx(t.b)}\\times ${tx(hi)}`)}</MathText></p>
          <p className="text-center text-base" dir="ltr"><MathText>{$(`${tx(f.lo)}<${frac}<${tx(hi)}`)}</MathText></p>
          <p><MathText>{k('formal.names', { lo: iso(f.lo), hi: iso(hi) })}</MathText></p>
        </>
      )}
      <p><MathText>{k('formal.exact', { frac: $(frac) })}</MathText></p>
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite de questions de chaque tâche : elle interroge ce que l'élève vient de FAIRE avec SES essais ; la dernière suite d'un niveau finit par la règle. `k1` : la tâche du module « معارف » (10 ÷ 7). */
export const CHAINS = Object.freeze({
  r1: ['leftA', 'leftB', 'never'],
  r2: ['prod', 'whyEnd'],
  r3: ['kind', 'whenStop', 'rule'],
  a1: ['lineLen', 'sameCount'],
  a2: ['prod', 'exactWhy'],
  a3: ['bracketTex', 'whenStop', 'ruleUnit'],
  k1: ['write', 'names', 'rule'],
});

const Mx = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const bracketOf = (lab, rank) => lab.trials.findLast((t) => t.kind === 'bracket' && !t.free && t.task === lab.ti && t.rank === rank);
const lastBracket = (lab) => lab.trials.findLast((t) => t.kind === 'bracket' && !t.free && t.task === lab.ti);
const prodOf = (task, q) => F.fitsAtRank(task.a, task.b, q);

/** Chaque question est construite sur LES essais de la tâche (rien n'est écrit en dur). */
export const QUESTIONS = {
  leftA: (lab, task, k) => leftQ(lab, task, k, 1, 'leftA'),
  leftB: (lab, task, k) => leftQ(lab, task, k, 2, 'leftB'),
  never: (lab, task, k) => {
    const b1 = bracketOf(lab, 1); const b2 = bracketOf(lab, 2);
    const g1 = prodOf(task, b1.lo).gap; const g2 = prodOf(task, b2.lo).gap;
    const o = { q1: mtr(b1.lo), q2: mtr(b2.lo), g1: mtr(D.format(g1)), g2: mtr(D.format(g2)), hi: mtr(b2.hi), over: mtr(D.format(prodOf(task, b2.hi).gap)) };
    return {
      id: 'never', kind: 'choice',
      prompt: Mx(k, 'never.prompt', o),
      options: [
        { text: Mx(k, 'never.finer'), why: Mx(k, 'never.whyFiner', o) },
        { text: Mx(k, 'never.hi', o), why: Mx(k, 'never.whyHi', o) },
        { text: Mx(k, 'never.right', o), correct: true },
      ],
      hints: [Mx(k, 'never.hint1', o), Mx(k, 'never.hint2', o)],
      explain: Mx(k, 'never.explain', o),
    };
  },
  prod: (lab, task, k) => {
    const ex = lab.trials.findLast((t) => t.kind === 'lay' && !t.free && t.task === lab.ti && t.verdict === 'exact');
    const o = { b: iso(task.b), q: iso(ex.q), a: iso(task.a) };
    return {
      id: 'prod', kind: 'number', expected: D.formatTrim(D.parse(ex.product)), answer: <MathText>{$(tx(D.formatTrim(D.parse(ex.product))))}</MathText>,
      prompt: Mx(k, 'prod.prompt', o), hints: [Mx(k, 'prod.hint1', o), Mx(k, 'prod.hint2', o)], explain: Mx(k, 'prod.explain', o),
    };
  },
  whyEnd: (lab, task, k) => {
    const ex = lab.trials.findLast((t) => t.kind === 'lay' && !t.free && t.task === lab.ti && t.verdict === 'exact');
    const o = { b: iso(task.b), q: iso(ex.q), a: iso(task.a) };
    return {
      id: 'whyEnd', kind: 'choice',
      prompt: Mx(k, 'whyEnd.prompt', o),
      options: [
        { text: Mx(k, 'whyEnd.cm'), why: Mx(k, 'whyEnd.whyCm', o) },
        { text: Mx(k, 'whyEnd.right', o), correct: true },
        { text: Mx(k, 'whyEnd.short'), why: Mx(k, 'whyEnd.whyShort', o) },
      ],
      hints: [Mx(k, 'whyEnd.hint1', o), Mx(k, 'whyEnd.hint2', o)],
      explain: Mx(k, 'whyEnd.explain', o),
    };
  },
  kind: (lab, task, k) => {
    const b2 = bracketOf(lab, 2);
    const o = { q: mtr(b2.lo), hi: mtr(b2.hi), b: iso(task.b), a: mtr(task.a), pLo: mtr(D.formatTrim(prodOf(task, b2.lo).product)), gLo: mtr(D.formatTrim(prodOf(task, b2.lo).gap)) };
    return {
      id: 'kind', kind: 'choice',
      prompt: Mx(k, 'kind.prompt', o),
      options: [
        { text: Mx(k, 'kind.excess'), why: Mx(k, 'kind.whyExcess', o) },
        { text: Mx(k, 'kind.defect', o), correct: true },
        { text: Mx(k, 'kind.exact'), why: Mx(k, 'kind.whyExact', o) },
      ],
      hints: [Mx(k, 'kind.hint1', o), Mx(k, 'kind.hint2', o)],
      explain: Mx(k, 'kind.explain', o),
    };
  },
  whenStop: (lab, task, k) => {
    const ex = lab.trials.findLast((t) => t.kind === 'lay' && !t.free && t.verdict === 'exact');
    const b2 = lab.trials.findLast((t) => t.kind === 'bracket' && !t.free && t.rank === 2 && !t.exact);
    const first = lab.trials.find((t) => t.kind === 'bracket' && !t.free && t.rank === 2 && !t.exact);
    const gap = first ? D.formatTrim(prodOf(lab.tasks[first.task], first.lo).gap) : '0,02';
    const o = {
      ex: ex ? iso(ex.q) : iso('2,25'), none: b2 ? iso(b2.lo) : iso('3,16'), cmQ: first ? iso(first.lo) : iso('2,66'), cmGap: mtr(gap),
      aNone: iso(task.a), aEx: iso(ex ? lab.tasks[ex.task].a : '9'),
    };
    return {
      id: 'whenStop', kind: 'choice',
      prompt: Mx(k, 'whenStop.prompt'),
      options: [
        { text: Mx(k, 'whenStop.cm'), why: Mx(k, 'whenStop.whyCm', o) },
        { text: Mx(k, 'whenStop.right'), correct: true },
        { text: Mx(k, 'whenStop.long'), why: Mx(k, 'whenStop.whyLong', o) },
      ],
      hints: [Mx(k, 'whenStop.hint1', o), Mx(k, 'whenStop.hint2', o)],
      explain: Mx(k, 'whenStop.explain', o),
    };
  },
  rule: (lab, task, k) => {
    const f = figures(lab);
    const o = { a: iso(f.t.a), b: iso(f.t.b), lo: iso(f.lo), hi: iso(f.hi) };
    return {
      id: 'rule', kind: 'choice',
      prompt: <MathText>{k('discovery.prompt')}</MathText>,
      options: ruleOptions(lab, k),
      hints: [Mx(k, 'rule.hint1', o), Mx(k, 'rule.hint2', o)],
      explain: <Formal lab={lab} k={k} />,
    };
  },
  lineLen: (lab, task, k) => {
    const o = { b: mtr(task.b), a: mtr(task.a) };
    const dm = L.shiftText(task.b, 1);
    return {
      id: 'lineLen', kind: 'number', expected: dm, answer: <MathText>{$(tx(dm))}</MathText>,
      prompt: Mx(k, 'lineLen.prompt', o), hints: [Mx(k, 'lineLen.hint1', o), Mx(k, 'lineLen.hint2', o)], explain: Mx(k, 'lineLen.explain', { ...o, dm: mtr(dm, 'dm'), a10: mtr(L.shiftText(task.a, 1), 'dm') }),
    };
  },
  sameCount: (lab, task, k) => {
    const a10 = L.shiftText(task.a, 1); const b10 = L.shiftText(task.b, 1);
    const o = { a: mtr(task.a), b: mtr(task.b), a10: mtr(a10, 'dm'), b10: mtr(b10, 'dm') };
    return {
      id: 'sameCount', kind: 'choice',
      prompt: Mx(k, 'sameCount.prompt', o),
      options: [
        { text: Mx(k, 'sameCount.same'), why: Mx(k, 'sameCount.whySame', o) },
        { text: Mx(k, 'sameCount.right'), correct: true },
        { text: Mx(k, 'sameCount.one'), why: Mx(k, 'sameCount.whyOne', o) },
      ],
      hints: [Mx(k, 'sameCount.hint1', o), Mx(k, 'sameCount.hint2', o)],
      explain: Mx(k, 'sameCount.explain', o),
    };
  },
  exactWhy: (lab, task, k) => {
    const ex = lab.trials.findLast((t) => t.kind === 'lay' && !t.free && t.task === lab.ti && t.verdict === 'exact');
    const first = lab.trials.find((t) => t.kind === 'bracket' && !t.free && !t.exact && t.rank >= 1 && lab.tasks[t.task].kind === 'count');
    const o = { b: iso(task.b), q: iso(ex.q), a: iso(task.a), oa: first ? iso(lab.tasks[first.task].a) : iso('4,6'), ob: first ? iso(lab.tasks[first.task].b) : iso('0,7'), oq: first ? iso(first.lo) : iso('6,5') };
    return {
      id: 'exactWhy', kind: 'choice',
      prompt: Mx(k, 'exactWhy.prompt', o),
      options: [
        { text: Mx(k, 'exactWhy.one', o), why: Mx(k, 'exactWhy.whyOne', o) },
        { text: Mx(k, 'exactWhy.right', o), correct: true },
        { text: Mx(k, 'exactWhy.long'), why: Mx(k, 'exactWhy.whyLong', o) },
      ],
      hints: [Mx(k, 'exactWhy.hint1', o), Mx(k, 'exactWhy.hint2', o)],
      explain: Mx(k, 'exactWhy.explain', o),
    };
  },
  bracketTex: (lab, task, k) => {
    const f = figures(lab);
    const frac = `\\frac{${tx(task.a)}}{${tx(task.b)}}`;
    const up = D.format(D.make(D.parse(f.hi).n + 1, 2)); const dn = D.format(D.make(D.parse(f.lo).n - 1, 2));
    const o = { b: iso(task.b), a: iso(task.a), hi: iso(f.hi), pHi: iso(D.formatTrim(prodOf(task, f.hi).product)), up: iso(up), pUp: iso(D.formatTrim(prodOf(task, up).product)), dn: iso(dn), pDn: iso(D.formatTrim(prodOf(task, dn).product)), lo: iso(f.lo) };
    return {
      id: 'bracketTex', kind: 'choice', cols: 1,
      prompt: Mx(k, 'bracketTex.prompt', { a: iso(task.a), b: iso(task.b) }),
      options: [
        { text: <MathText>{$(`${tx(up)}<${frac}<${tx(D.format(D.make(D.parse(f.hi).n + 2, 2)))}`)}</MathText>, why: Mx(k, 'bracketTex.whyUp', o) },
        { text: <MathText>{$(`${tx(f.lo)}<${frac}<${tx(f.hi)}`)}</MathText>, correct: true },
        { text: <MathText>{$(`${tx(D.format(D.make(D.parse(f.lo).n - 2, 2)))}<${frac}<${tx(dn)}`)}</MathText>, why: Mx(k, 'bracketTex.whyDn', o) },
      ],
      hints: [Mx(k, 'bracketTex.hint1', o), Mx(k, 'bracketTex.hint2', o)],
      explain: Mx(k, 'bracketTex.explain', o),
    };
  },
  ruleUnit: (lab, task, k) => {
    const o = { a: iso(task.a), b: iso(task.b), a10: iso(L.shiftText(task.a, 1)), b10: iso(L.shiftText(task.b, 1)) };
    return {
      id: 'ruleUnit', kind: 'choice',
      prompt: <MathText>{k('discovery.promptUnit')}</MathText>,
      options: unitOptions(lab, k),
      hints: [Mx(k, 'ruleUnit.hint1', o), Mx(k, 'ruleUnit.hint2', o)],
      explain: <Formal lab={lab} k={k} />,
    };
  },
  write: (lab, task, k) => {
    const frac = `\\frac{${tx(task.a)}}{${tx(task.b)}}`;
    const b2 = bracketOf(lab, 2) ?? lastBracket(lab);
    const lo = b2.lo; const hi = b2.hi;
    const wide = D.format(D.make(Math.floor(D.parse(lo).n / 10), 1)); const wide2 = D.format(D.make(Math.floor(D.parse(lo).n / 10) + 1, 1));
    const o = { lo: iso(lo), hi: iso(hi), a: iso(task.a), b: iso(task.b), pHi: iso(D.formatTrim(prodOf(task, hi).product)), wide: iso(wide), wide2: iso(wide2) };
    return {
      id: 'write', kind: 'choice', cols: 1,
      prompt: Mx(k, 'write.prompt', { a: iso(task.a), b: iso(task.b) }),
      options: [
        { text: <MathText>{$(`${tx(wide)}<${frac}<${tx(lo)}`)}</MathText>, why: Mx(k, 'write.whyLoUp', o) },
        { text: <MathText>{$(`${tx(lo)}<${frac}<${tx(hi)}`)}</MathText>, correct: true },
        { text: <MathText>{$(`${tx(hi)}<${frac}<${tx(D.format(D.make(D.parse(hi).n + 1, 2)))}`)}</MathText>, why: Mx(k, 'write.whyShift', o) },
      ],
      hints: [Mx(k, 'write.hint1', o), Mx(k, 'write.hint2', o)],
      explain: Mx(k, 'write.explain', o),
    };
  },
  names: (lab, task, k) => {
    const b2 = bracketOf(lab, 2) ?? lastBracket(lab);
    const frac = `\\frac{${tx(task.a)}}{${tx(task.b)}}`;
    const o = { lo: iso(b2.lo), hi: iso(b2.hi), a: iso(task.a), b: iso(task.b), pLo: iso(D.formatTrim(prodOf(task, b2.lo).product)), pHi: iso(D.formatTrim(prodOf(task, b2.hi).product)) };
    return {
      id: 'names', kind: 'choice',
      prompt: Mx(k, 'names.prompt', { a: iso(task.a), b: iso(task.b) }),
      options: [
        { text: <MathText>{$(frac)}</MathText>, correct: true },
        { text: <MathText>{$(tx(b2.lo))}</MathText>, why: Mx(k, 'names.whyLo', o) },
        { text: <MathText>{$(tx(b2.hi))}</MathText>, why: Mx(k, 'names.whyHi', o) },
      ],
      hints: [Mx(k, 'names.hint1', o), Mx(k, 'names.hint2', o)],
      explain: Mx(k, 'names.explain', o),
    };
  },
};

function leftQ(lab, task, k, rank, id) {
  const b = bracketOf(lab, rank);
  const gap = D.formatTrim(prodOf(task, b.lo).gap);
  const o = { q: mtr(b.lo), b: iso(task.b), a: mtr(task.a), gap: mtr(gap) };
  return {
    id, kind: 'number', expected: gap, answer: <MathText>{$(tx(gap))}</MathText>,
    prompt: Mx(k, 'left.prompt', o), hints: [Mx(k, 'left.hint1', o), Mx(k, 'left.hint2', o)], explain: Mx(k, 'left.explain', o),
  };
}
