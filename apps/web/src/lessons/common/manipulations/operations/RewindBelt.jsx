import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Hand, CheckCircle2, Sparkles, ChevronLeft, FlaskConical, Undo2, Play, RotateCcw } from 'lucide-react';
import { resolveLevelId } from '@smarter-academy/core/curriculum/manipulationLevels.js';
import * as M from '@smarter-academy/core/arithmetic/missingNumber.js';
import MathText from '../../components/MathText';
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
import { W, H, Y_BELT, CRATE_W, posOfX, xOfPos, CARD_COLOR, SIGN, Backdrop, Belt, Machine, Bin, Tray, Crate, Observer, KidChip } from './rewindBelt/art';
import { LEVELS } from '../levels';
import * as L from '../logic/rewindBelt';

/**
 * rewind-belt — LA CARTE INVERSE SOUS LA MAIN (1AM, unité 6, درس « البحث عن أعداد ناقصة », 2026-10-30).
 * La logique, exacte, est dans `logic/rewindBelt.js` (sur `packages/core/arithmetic/missingNumber.js`, importé par chemin).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. مبتدئ : une machine d'atelier (« + 9 », « − 14 », « × 6 », la carte piège « 80 − ») a rendu 54 ; la main CHOISIT la carte qui fait tourner le tapis à rebours, TIRE la caisse du plateau de sortie au bac d'entrée
 *    (le nombre manquant □ apparaît), puis la REPOUSSE à travers la machine d'origine ; متقدم : décimaux, « 12,5 − », et la division qui ne s'arrête pas (20 ÷ 7).
 * B. Le nombre manquant est une SORTIE : la caisse change de nombre à la volée au passage de la machine (celui que la carte CHOISIE produit) ; l'élève n'écrit aucun nombre.
 * C. La résistance : une mauvaise carte n'est jamais corrigée — la contre-épreuve DIT ce qui sort (« 72 au lieu de 54 ») ; la carte piège « a − » refuse « + » (134 puis −54) ; un résultat négatif bloque le tapis.
 * D. La phase formelle écrit ce que l'élève a trouvé avec SES nombres : les quatre égalités et leur solution (□ + 9 = 54, □ = 54 − 9 = 45 …).
 * E. Les fausses réponses sont rendues VISIBLES : la caisse porte le nombre trouvé, la sortie affichée est celle de la machine, les chevrons du tapis changent de sens.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        le nombre manquant d'une égalité (somme, différence, produit), l'opération inverse, la contre-épreuve par substitution
 *   OBJECT         une machine d'atelier à carte, un tapis roulant, une caisse, un bac d'entrée, un plateau de sortie, une rangée de cartes
 *   VARIABLE       la CARTE d'opération choisie pour remonter le tapis, puis la position de la caisse (qui produit le nombre trouvé)
 *   INVARIANT      la carte de la machine d'origine et le nombre connu (le plateau de sortie)
 *   TRANSFORMATION la carte inverse défait la carte de la machine (+ ↔ −, × ↔ ÷ ; « a − » est son propre inverse)
 *   CONSTRAINT     le tapis ne tourne à rebours qu'avec une carte choisie ; un nombre négatif le bloque
 *   RESISTANCE     « وضعتَ 63 في الآلة فخرج 72 بدل 54 » ; « جرّب بطاقة أخرى » ; jamais la bonne carte nommée
 *   EVIDENCE       le nombre sur la caisse, le bac d'entrée rempli, ce qui sort à la contre-épreuve
 *   PREDICTION     le choix de la carte avant de tirer la caisse
 *   FORMALIZATION  « □ + 9 = 54 donc □ = 54 − 9 = 45 » avec les nombres de l'élève
 *   TRANSFER       « جرّب آلتك أنت » (toujours ouvert), les exercices et la banque
 *
 * ONBOARDING : `coach` (défaut true) → `LabCoach` ; `logic › coachOf`. QUESTIONS PENDANT LE LABO (`LabCheckpoint`) : `CHAINS` + `QUESTIONS`, après CHAQUE tâche, avec SES nombres.
 * ÉTAPES : `LabStepper` (`[data-rb-step=<i>]`) + la fête. « إعادة » : tâche 1. Le son (muet par défaut, « الصوت ») : un déclic au passage de la machine, un drapeau quand ça tient, « over » quand ça ne tient pas.
 * Props : `tasks`, `level`, `levels`, `coach`, `title`, `lead`, `onTrial(event)`, `onFinished({})`.
 *
 * CONTRAT DOM : [data-rewind-belt][data-level][data-task][data-phase][data-solved], [data-rb-glance], [data-rb-stage], [data-rb-svg], [data-rb-crate][role=slider][data-pos], [data-rb-rack], [data-rb-card=<kind>][aria-pressed],
 * [data-rb-run], [data-rb-retry], [data-rb-next], [data-rb-verdict], [data-rb-step=<i>], [data-rb-machine], [data-rb-slot][data-pick], [data-rb-bin][data-filled], [data-rb-tray], [data-rb-eq], [data-rb-free], [data-rb-free-kind=<k>],
 * [data-rb-free-a], [data-rb-free-b], [data-rb-free-back], [data-rb-free-info], [data-rb-formal], [data-rb-kid][data-mood].
 */
const NS = 'manipulation.rewindBelt';
const LRI = '⁦';
const PDI = '⁩';
const iso = (s) => `${LRI}${s}${PDI}`;
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-teal-300';
const $ = (s) => `$${s}$`;

const CSS = `
@keyframes rb-pop { 0% { transform: scale(0.85); } 70% { transform: scale(1.06); } 100% { transform: scale(1); } }
.rb-pop { animation: rb-pop 240ms ease-out both; display: inline-block; }
@media (prefers-reduced-motion: reduce) { .rb-pop { animation: none !important; } }
.rb-crate:focus-visible { outline: 3px solid #2DD4BF; outline-offset: 4px; border-radius: 8px; }
`;

export function numbersFor({ tasks, level }) {
  const lv = resolveLevelId(level ?? 'beginner');
  const asked = LEVELS['rewind-belt'][lv].numbers;
  return { tasks: tasks ?? asked.tasks };
}

export default function RewindBelt({
  tasks, title, lead, level, levels: withLevels = true, coach: coachOn = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const initialNumbers = useMemo(() => numbersFor({ tasks, level }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'rewind-belt', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
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
  const cpSettings = useLabCheckpointSettings('rewind-belt');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const reachedNow = L.taskDone(lab);
  const chain = cpOn && cpSettings.enabled && !L.isFree(lab) ? CHAINS[cur.id] ?? null : null;
  const isRule = (q) => q === 'ruleA' || q === 'ruleB';
  const ruleByCheckpoint = cpOn && cpSettings.enabled && lab.tasks.some((tk) => CHAINS[tk.id]?.some(isRule));
  const cp = useLabCheckpoint({
    id: chain ? cur.id : null,
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
    lab: 'rewind-belt', step: coachStep,
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
      type="rewind-belt"
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
      <ManipulationStage className="bg-gradient-to-b from-amber-50/70 to-white">
        <div ref={boxRef} className="space-y-2" data-rewind-belt data-level={advanced ? 'advanced' : 'beginner'} data-task={lab.free ? 'free' : cur.id} data-phase={lab.free ? 'free' : lab.phase}
          data-solved={finished ? 'true' : 'false'} data-width={width}>
          <style dangerouslySetInnerHTML={{ __html: CSS }} />
          <Lab lab={lab} setLab={setLab} k={k} lead={state.isAuthoredLevel ? lead : null} cp={cp} advanced={advanced} />
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ══════════════ Les mots, les cartes et les égalités ══════════════ */

const tOr = (k, key, fallback) => k(key, { defaultValue: k(fallback) });
/** Un nombre rationnel pour KaTeX : « 35{,}9 » ou « \frac{20}{7} ». */
const num = (x) => M.latex(x);
/** Une carte pour KaTeX : « +9 », « -14 », « \times 6 », « \div 6 », « 80-\square ». */
export const cardTex = (kind, a) => {
  const t = num(a);
  return { add: `+${t}`, sub: `-${t}`, mul: `\\times ${t}`, div: `\\div ${t}`, rsub: `${t}-\\square` }[kind];
};
/** L'égalité à trou d'une machine : « \square+9=54 ». */
export const eqTex = (task) => {
  const a = num(task.a); const b = num(task.out);
  return { add: `\\square+${a}=${b}`, sub: `\\square-${a}=${b}`, rsub: `${a}-\\square=${b}`, mul: `\\square\\times ${a}=${b}`, div: `\\square\\div ${a}=${b}` }[task.kind];
};
/** La solution écrite : « \square=54-9=45 ». */
export const solveTex = (task) => {
  const a = num(task.a); const b = num(task.out); const x = num(task.secret);
  const op = { add: `${b}-${a}`, sub: `${b}+${a}`, rsub: `${a}-${b}`, mul: `${b}\\div ${a}`, div: `${b}\\times ${a}` }[task.kind];
  return `\\square=${op}=${x}`;
};
/** La contre-épreuve écrite : « 45+9=54 ». */
export const checkTex = (task, x = task.secret) => {
  const a = num(task.a); const b = num(task.out); const xs = num(x);
  return { add: `${xs}+${a}=${b}`, sub: `${xs}-${a}=${b}`, rsub: `${a}-${xs}=${b}`, mul: `${xs}\\times ${a}=${b}`, div: `${xs}\\div ${a}=${b}` }[task.kind];
};
/** La carte d'une autre famille (pour une réfutation « carte qui ne défait rien »). */
const otherFamily = (kind) => (M.family(kind) === 'additive' ? 'mul' : 'add');

/** Une carte d'opération en HTML (le rack). */
function CardFace({ kind, a, selected }) {
  const col = CARD_COLOR[kind];
  const t = M.text(a);
  return (
    <span className={`inline-flex items-center gap-1.5 text-xl font-black tabular-nums ${selected ? 'text-white' : ''}`} style={selected ? undefined : { color: col }} dir="ltr">
      {kind === 'rsub' ? <><bdi>{iso(t)}</bdi><span aria-hidden="true">−</span><span aria-hidden="true" className={`inline-block h-4 w-4 rounded-[4px] border-[3px] ${selected ? 'border-white' : ''}`} style={selected ? undefined : { borderColor: col }} /></>
        : <><span aria-hidden="true">{SIGN[kind]}</span><bdi>{iso(t)}</bdi></>}
    </span>
  );
}

/* ══════════════ Le laboratoire ══════════════ */

function Lab({ lab, setLab, k, lead, cp, advanced }) {
  const task = L.taskOf(lab);
  const free = L.isFree(lab);
  const done = L.taskDone(lab);
  const lit = !free && done;
  const last = lab.last;
  const svgRef = useRef(null);

  const ctx = free ? k('ctx.free') : (lead && lab.ti === 0 ? lead : tOr(k, `ctx.${task.id}`, 'ctx.default'));
  const question = free ? k('q.free') : tOr(k, `q.${task.id}`, 'q.default');

  const stepDone = lab.tasks.map((_, i) => !!lab.done[i] && (i !== lab.ti || !cp.blocking));
  const steps = lab.tasks.length > 1 && !free && <LabStepper count={lab.tasks.length} current={lab.ti} done={stepDone} stepAttr="data-rb-step" />;
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.trials.length === 0 && celebrated.current.size) celebrated.current = new Set();
  const nowDone = !free && stepDone[lab.ti];
  useEffect(() => {
    if (!nowDone || celebrated.current.has(lab.ti)) return;
    celebrated.current.add(lab.ti);
    party.celebrate({ n: lab.ti + 1, total: lab.tasks.length });
  }, [nowDone, lab.ti]); // eslint-disable-line react-hooks/exhaustive-deps

  // le son (muet sauf « الصوت ») : un déclic quand la caisse franchit la machine, un drapeau quand ça tient, « over » quand ça ne tient pas, la cloche à la fin d'une tâche
  const side = useRef(lab.pos > 0.5);
  useEffect(() => {
    const now = lab.pos > 0.5;
    if (now !== side.current) playSfx('gesture', { pitch: now ? 1 : 0.75 });
    side.current = now;
  }, [lab.pos]);
  const nTrials = lab.trials.length;
  useEffect(() => {
    if (!nTrials) return;
    const tr = lab.trials[nTrials - 1];
    if (tr.kind === 'check' || !tr.ok) playSfx(tr.ok ? 'flag' : 'over');
  }, [nTrials]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (done && !free) playSfx('bell'); }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  const prompt = (
    <PromptCard size="md" aside={steps || null} context={<MathText>{ctx}</MathText>} contextProps={{ 'data-rb-context': free ? 'free' : task.id }}
      title={<MathText>{question}</MathText>} titleClassName="text-base" lamp={free ? null : lit ? 'on' : 'off'}
      titleProps={{ 'data-rb-prompt': free ? 'free' : task.id, 'data-lit': lit ? 'true' : 'false' }} />
  );

  /* ── le verdict : la CONSÉQUENCE avec les nombres de l'élève, jamais la bonne carte ── */
  const verdictLine = (() => {
    if (free) return k(last?.kind === 'custom' ? 'free.on' : 'idle.open');
    if (lab.refusal === 'pick') return k('v.pickFirst');
    if (lab.refusal === 'jam') return k('v.jam');
    if (!last) return k(`idle.${done ? 'done' : lab.phase === 'check' ? 'check' : lab.pick ? 'rewind' : 'pick'}`);
    if (last.kind === 'docked') return k('v.docked', { found: $(num(last.found)) });
    if (last.kind === 'rewind') return k('v.neg', { found: $(last.found ?? '?') });
    const f = M.parse(last.found); const o = M.parse(last.fwd);
    const vars = { found: $(num(f)), fwd: $(num(o)), out: $(num(task.out)) };
    return last.ok ? k('v.right', vars) : k(`v.${last.model}`, vars);
  })();
  const missed = !free && lab.phase === 'miss';
  const jam = !free && (lab.refusal === 'jam' || (!!last && last.kind === 'rewind' && !last.ok));
  const bad = missed || jam;
  const good = !free && !!last && last.kind === 'check' && last.ok === true;
  const tone = bad ? 'amber' : good ? 'emerald' : 'indigo';
  const Icon = bad ? Sparkles : good ? CheckCircle2 : Hand;
  const canNext = L.canNext(lab) && !cp.blocking;
  const mood = bad ? 'wonder' : done ? 'proud' : 'happy';
  const banner = (
    <VerdictBanner tone={tone} icon={Icon} size="sm" className="min-h-[3.2rem]" data-rb-verdict={bad ? 'wrong' : good ? 'right' : free ? 'free' : ''}>
      <div className="flex min-w-0 items-center gap-2">
        <span data-rb-kidchip className="shrink-0"><KidChip idx={advanced ? 1 : 0} mood={mood} /></span>
        <div className="min-w-0 space-y-1.5">
          <p className={last || free || lab.refusal ? '' : 'font-bold text-indigo-900'}><MathText>{verdictLine}</MathText></p>
          {(canNext || missed) && (
            <div className="flex flex-wrap gap-2">
              {missed && (
                <button type="button" onClick={() => setLab(L.retryPick)} data-rb-retry
                  className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-2 border-amber-600 bg-amber-500 px-3.5 text-sm font-black text-white shadow-[0_3px_0_0_#B45309] transition-all active:translate-y-0.5 ${ring}`}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" /> {k('retry')}
                </button>
              )}
              {canNext && (
                <button type="button" onClick={() => setLab(L.nextTask)} data-rb-next
                  className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-2 border-emerald-600 bg-emerald-600 px-3.5 text-sm font-black text-white shadow-[0_3px_0_0_#047857] transition-all active:translate-y-0.5 ${ring}`}>
                  {k('next')} <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </VerdictBanner>
  );

  return (
    <>
      <div className="relative space-y-2" data-rb-glance>
        {party.node}
        {cp.node}
        {prompt}
        <StageFrame className="min-w-0 overflow-hidden p-2" data-rb-stage>
          <Stage lab={lab} setLab={setLab} k={k} svgRef={svgRef} mood={mood} />
        </StageFrame>
        {!free ? <Controls lab={lab} setLab={setLab} k={k} /> : null}
        {banner}
      </div>
      <FreeCard lab={lab} setLab={setLab} k={k} />
    </>
  );
}

/* ══════════════ La scène : le tapis, la machine, la caisse ══════════════ */

/** L'abscisse SVG d'un évènement pointeur. */
function svgX(svg, e) {
  const r = svg?.getBoundingClientRect();
  if (!r || !r.width) return null;
  return ((e.clientX - r.left) * W) / r.width;
}

function Stage({ lab, setLab, k, svgRef, mood }) {
  const uid = `rb${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const free = L.isFree(lab);
  const task = L.taskOf(lab);
  const [drag, setDrag] = useState(false);
  const grab = useRef({ dx: 0, phase: 'rewind' });
  const locked = free || L.taskDone(lab) || lab.phase === 'miss';
  const live = !locked;
  const x = xOfPos(free ? 0 : lab.pos);
  const value = free ? null : L.crateValue(lab);
  const crateText = free ? '؟' : value ? M.text(value) : '؟';
  const inCheck = lab.phase === 'check' || lab.phase === 'miss' || lab.phase === 'done';
  const dir = free || lab.phase === 'done' || lab.phase === 'miss' ? 0 : lab.phase === 'check' ? 1 : lab.pick ? -1 : 0;
  const tone = lab.phase === 'miss' ? 'miss' : 'ok';
  const jam = !free && lab.phase === 'rewind' && lab.pos > 0.5 && value === null;
  const lit = !free && lab.pos > 0.3 && lab.pos < 0.7;

  const down = (e) => {
    if (!live) return;
    const px = svgX(svgRef.current, e); if (px === null) return;
    if (Math.abs(px - x) > CRATE_W * 0.8) return;
    e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId);
    grab.current = { dx: px - x, phase: lab.phase };
    setDrag(true);
    if (lab.phase === 'rewind' && !lab.pick) setLab((s) => L.setPos(s, 0.1));
  };
  const move = (e) => {
    if (!drag) return;
    if (lab.phase !== grab.current.phase) { setDrag(false); return; }
    const px = svgX(svgRef.current, e); if (px === null) return;
    setLab((s) => L.setPos(s, posOfX(px - grab.current.dx)));
  };
  const up = () => setDrag(false);
  const key = (e) => {
    if (!live) return;
    const dirKey = e.key === 'ArrowLeft' ? 1 : e.key === 'ArrowRight' ? -1 : 0;
    if (dirKey) { e.preventDefault(); setLab((s) => L.posBy(s, dirKey * 0.1)); }
    else if (e.key === 'Home') { e.preventDefault(); setLab((s) => (s.phase === 'check' ? L.setPos(s, 0) : s)); }
    else if (e.key === 'End' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLab(L.finishRun); }
  };

  const ownCard = task.card;
  return (
    <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: W, display: 'block', margin: '0 auto', touchAction: 'none' }} role="img" aria-label={k('stageAria')} data-rb-svg dir="ltr"
      onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
      <Backdrop uid={uid} />
      <Belt dir={dir} drag={drag} />
      <Bin name={k('inName')} filled={inCheck && !free} text={inCheck && !free && lab.found ? M.text(lab.found) : '□'} fontSize={inCheck && lab.found && M.text(lab.found).length > 5 ? 19 : 30} />
      <Tray name={k('outName')} text={free ? '؟' : M.text(task.out)} fontSize={M.text(task.out).length > 5 ? 20 : 30} />
      <Machine card={ownCard} pick={free ? null : lab.pick} lit={lit} label={k('machineName')} slotLabel={k('slotLabel')} />
      <Observer idx={0} mood={mood} x={24} y={Y_BELT + 44} size={58} />
      <Observer idx={1} mood={mood === 'wonder' ? 'wonder' : 'happy'} x={W - 84} y={Y_BELT + 44} size={58} />
      {/* ce que la main tient : la caisse (le gabarit autour d'elle est sensible) */}
      {!free && (
        <g data-rb-crate data-pos={lab.pos} data-value={crateText} role="slider" tabIndex={live ? 0 : -1} aria-label={k('crateAria')} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(lab.pos * 100)}
          aria-valuetext={k('crateValue', { v: crateText })} onKeyDown={key} onPointerDown={down} style={{ cursor: live ? (drag ? 'grabbing' : 'grab') : 'default' }} className="rb-crate">
          <rect x={x - CRATE_W / 2 - 14} y={Y_BELT - 96} width={CRATE_W + 28} height={126} fill="transparent" />
          <Crate x={x} text={crateText} active={drag} tone={tone} jam={jam} />
        </g>
      )}
    </svg>
  );
}

/* ══════════════ Les commandes : le rack de cartes, « أكمل » ══════════════ */

function Controls({ lab, setLab, k }) {
  const task = L.taskOf(lab);
  const done = L.taskDone(lab);
  const can = L.canPick(lab);
  const btn = `inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-2xl border-2 px-3 text-sm font-black disabled:opacity-40 ${ring}`;
  const running = lab.pick && (lab.phase === 'rewind' || lab.phase === 'check');
  return (
    <LabCard className="space-y-2 p-2" data-rb-controls>
      <div className="flex flex-wrap items-center gap-2" data-rb-rack role="radiogroup" aria-label={k('rackAria')}>
        <span className="text-xs font-black text-slate-500">{k('rackTitle')}</span>
        {task.rack.map((kind) => {
          const selected = lab.pick === kind;
          return (
            <button key={kind} type="button" role="radio" aria-checked={selected} aria-pressed={selected} disabled={!can && !selected} onClick={() => setLab((s) => L.pickCard(s, kind))} data-rb-card={kind}
              aria-label={k('cardAria', { c: `${SIGN[kind]} ${M.text(task.a)}` })}
              className={`${btn} min-w-[88px] ${selected ? 'border-teal-700 bg-teal-700 text-white shadow-[0_3px_0_0_#134E4A]' : 'border-slate-300 bg-white shadow-[0_3px_0_0_#CBD5E1]'}`}>
              <CardFace kind={kind} a={task.a} selected={selected} />
            </button>
          );
        })}
        {running && (
          <button type="button" onClick={() => setLab(L.finishRun)} data-rb-run className={`${btn} border-sky-300 bg-white text-sky-900`}>
            <Play className="h-4 w-4" aria-hidden="true" /> {k('run')}
          </button>
        )}
      </div>
      {done && (
        <p data-rb-eq className="rounded-xl border-2 border-emerald-300 bg-emerald-50 px-3 py-2 text-center text-base font-black text-emerald-900" dir="ltr">
          <MathText>{$(`${eqTex(task)}\\ ;\\ ${solveTex(task)}`)}</MathText>
        </p>
      )}
    </LabCard>
  );
}

/* ══════════════ « جرّب آلتك أنت » : toujours ouvert ══════════════ */

function FreeCard({ lab, setLab, k }) {
  const free = L.isFree(lab);
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  useEffect(() => { if (!lab.free) { setA(''); setB(''); } }, [lab.free]);
  const info = L.freeInfo(lab);
  const badA = a.trim() !== '' && !M.parse(a);
  const badB = b.trim() !== '' && !M.parse(b);
  const clean = (s) => s.replace(/[^0-9٠-٩,./٫]/g, '').slice(0, 8);
  const pushFree = (patch) => setLab((s) => L.setFree(s, patch));
  const kind = lab.free?.kind ?? 'add';
  const btn = `inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border-2 px-3 text-base font-black ${ring}`;
  return (
    <LabCard className="space-y-2 border-emerald-200 bg-emerald-50/50 p-3" data-rb-free data-active={free ? 'true' : 'false'}>
      <p className="flex items-center gap-1.5 text-sm font-black text-emerald-900"><FlaskConical className="h-4 w-4" aria-hidden="true" /> {k('free.title')}</p>
      <p className="text-xs font-bold leading-snug text-slate-600">{free ? k('free.on') : k('free.hint')}</p>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5" role="radiogroup" aria-label={k('free.kindAria')}>
          {L.FREE_KINDS.map((kd) => (
            <button key={kd} type="button" role="radio" aria-checked={free && kind === kd} onClick={() => pushFree({ kind: kd })} data-rb-free-kind={kd}
              className={`${btn} ${free && kind === kd ? 'border-teal-700 bg-teal-700 text-white' : 'border-emerald-200 bg-white text-emerald-900'}`}><span dir="ltr">{k(`free.k.${kd}`)}</span></button>
          ))}
        </div>
        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600">{k('free.aLabel')}
          <input type="text" inputMode="decimal" autoComplete="off" dir="ltr" value={a} aria-label={k('free.aAria')} aria-invalid={badA} data-rb-free-a placeholder="9"
            onChange={(e) => { const v = clean(e.target.value); setA(v); if (M.parse(v)) pushFree({ a: v, ...(lab.free ? {} : { b: b || '54' }) }); }}
            className={`h-11 w-24 rounded-xl border-2 ${badA ? 'border-rose-300' : 'border-emerald-300'} bg-white px-2 text-center text-lg font-black tabular-nums text-indigo-950 ${ring}`} />
        </label>
        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600">{k('free.bLabel')}
          <input type="text" inputMode="decimal" autoComplete="off" dir="ltr" value={b} aria-label={k('free.bAria')} aria-invalid={badB} data-rb-free-b placeholder="54"
            onChange={(e) => { const v = clean(e.target.value); setB(v); if (M.parse(v)) pushFree({ b: v, ...(lab.free ? {} : { a: a || '9' }) }); }}
            className={`h-11 w-24 rounded-xl border-2 ${badB ? 'border-rose-300' : 'border-emerald-300'} bg-white px-2 text-center text-lg font-black tabular-nums text-indigo-950 ${ring}`} />
        </label>
        {(badA || badB) && <span className="text-xs font-bold text-rose-700">{k('free.bad')}</span>}
        {free && (
          <button type="button" onClick={() => setLab(L.toGuided)} data-rb-free-back
            className={`inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-emerald-200 bg-white px-3 text-xs font-bold text-emerald-900 ${ring}`}>
            <Undo2 className="h-4 w-4" aria-hidden="true" /> {k('free.back')}
          </button>
        )}
      </div>
      {free && info && (
        <p className="text-xs font-black text-emerald-900" data-rb-free-info>
          {info.ok
            ? <MathText>{k(info.fraction ? 'free.infoFraction' : 'free.info', { x: $(num(info.x)), check: $(checkTex({ kind: info.card.kind, a: info.card.a, out: info.out }, info.x)) })}</MathText>
            : k(`free.${info.reason === 'unreadable' ? 'bad' : info.reason}`)}
        </p>
      )}
    </LabCard>
  );
}

/* ══════════════ La règle (la dernière question du labo) ══════════════ */

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

/** Ce que l'élève a trouvé, écrit avec SES nombres : les égalités des tâches et leur solution. */
export function Formal({ lab, k, advanced }) {
  const list = lab.tasks.filter((tk) => (advanced ? tk.advanced : !tk.advanced));
  return (
    <div className="space-y-2 text-sm font-bold text-emerald-950" data-rb-formal={advanced ? 'both' : 'rule'}>
      <ul className="space-y-1" dir="ltr">
        {list.map((tk) => <li key={tk.id} className="text-center text-base"><MathText>{$(`${eqTex(tk)}\\ ;\\ ${solveTex(tk)}`)}</MathText></li>)}
      </ul>
      <p><MathText>{k(advanced ? 'formal.both' : 'formal.rule')}</MathText></p>
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite d'une tâche (par son id : les tâches viennent de la leçon). La dernière tâche de chaque niveau finit par LA RÈGLE. */
export const CHAINS = Object.freeze({
  b1: ['card', 'check'],
  b2: ['card', 'check'],
  b3: ['card', 'check'],
  b4: ['trapCard', 'check', 'ruleA'],
  a1: ['card', 'check'],
  a2: ['trapCard', 'check'],
  a3: ['divStops', 'check', 'ruleB'],
});

/** Une question à trois options décrite par ses clés de chaîne `cp.<id>.*` ; `vars` sont les nombres de l'élève. */
const choice = (k, id, vars, at, extra = {}) => ({
  id, kind: 'choice', prompt: Mx(k, `${id}.prompt`, vars),
  options: opt([Mx(k, `${id}.right`, vars), Mx(k, `${id}.wrongA`, vars), Mx(k, `${id}.wrongB`, vars)], 0, [null, Mx(k, `${id}.whyA`, vars), Mx(k, `${id}.whyB`, vars)], at),
  hints: [Mx(k, `${id}.hint1`, vars), Mx(k, `${id}.hint2`, vars)], explain: Mx(k, `${id}.explain`, vars), ...extra,
});

/** Les nombres de l'élève : la carte de la machine, son inverse, le nombre trouvé, ce qui sort. */
export function varsOf(task, k) {
  const A = task.a; const out = task.out; const x = task.secret;
  const sum = M.add(out, A);
  return {
    own: $(cardTex(task.kind, A)), inv: $(cardTex(task.rightKind, A)), fam: $(cardTex(otherFamily(task.kind), A)),
    op: k(`op.${task.kind}`, { a: M.text(A) }),
    out: $(num(out)), found: $(num(x)), twice: $(num(M.run(task.card, out))),
    eq: $(eqTex(task)), eqCheck: $(checkTex(task)), x: $(num(x)),
    a: $(num(A)), diff: $(`${num(A)}-${num(out)}`), sum: $(`${num(out)}+${num(A)}`), sumV: $(num(sum)), rev: $(`${num(out)}-${num(A)}`),
  };
}
const at = { card: 1, check: 2, trapCard: 0, divStops: 2 };

export const QUESTIONS = {
  card: (lab, task, k) => choice(k, 'card', varsOf(task, k), at.card),
  check: (lab, task, k) => choice(k, 'check', varsOf(task, k), at.check),
  trapCard: (lab, task, k) => choice(k, 'trapCard', varsOf(task, k), at.trapCard),
  divStops: (lab, task, k) => choice(k, 'divStops', varsOf(task, k), at.divStops),
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
