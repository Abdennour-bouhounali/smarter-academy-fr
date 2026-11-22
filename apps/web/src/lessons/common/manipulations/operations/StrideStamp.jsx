import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Hand, CheckCircle2, Sparkles, ChevronLeft, ChevronRight, FlaskConical, Undo2, ClipboardCheck } from 'lucide-react';
import { resolveLevelId } from '@smarter-academy/core/curriculum/manipulationLevels.js';
import * as G from '@smarter-academy/core/arithmetic/graduatedLine.js';
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
import { W, H, LY, COL, HOUSE_COLORS, RAIL_XS, RAIL_BOX, xOf, tAt, geoOf, Backdrop, Tick, Axis, Stick, Rail, House, Reading, DistanceBar, Frame, Flag, GivenMark, Observer, KidChip } from './strideStamp/art';
import { LEVELS } from '../levels';
import * as L from '../logic/strideStamp';

/**
 * stride-stamp — LA FOULÉE PORTÉE DES DEUX CÔTÉS (1AM, unité 5, درس « التعليم على مستقيم مدرّج », 2026-10-30).
 * La logique, exacte, est dans `logic/strideStamp.js` (sur `packages/core/arithmetic/graduatedLine.js`, importé par chemin).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. مبتدئ : la main PORTE un bâton-foulée à partir de la station de bus O vers l'EST puis vers l'OUEST (les ticks −1, −2 … n'apparaissent que tamponnés à l'ouest), puis pose le JUMEAU d'un
 *    bâtiment de l'autre côté de O, puis place trois bâtiments à leur abscisse (A(−3), B(2,7), C(−1,5)). متقدم : poser le drapeau de l'ORIGINE sur la droite dont seules deux graduations sont
 *    écrites (−3 et 3 ; puis −8 et −2 de deux en deux), et encadrer un bâtiment entre deux ticks consécutifs.
 * B. L'abscisse est une SORTIE de la main : la pastille lit « −1,5 » à la volée (un signe n'apparaît qu'à l'OUEST de O).
 * C. La résistance : la route est finie — une foulée trop longue ne rejoint pas la lecture demandée ; changer de foulée EFFACE les ticks ; un enregistrement faux n'est jamais corrigé, il est jugé.
 * D. La phase formelle écrit ce que l'élève a trouvé avec SES nombres (A(−3), B(2,7), C(−1,5) ; l'encadrement).
 * E. Les fausses réponses sont rendues VISIBLES : les étiquettes de la droite recalculées sous le drapeau, la cote de distance à O, le bâtiment à encadrer qui sort du cadre.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        la droite graduée des deux côtés de l'origine, l'abscisse d'un point, le symétrique par rapport à O
 *   OBJECT         une route de village, un bâton de bois d'une foulée, des bâtiments, un cadre, le drapeau de la station
 *   VARIABLE       la FOULÉE (unité) et la position de la main sur la route (nombre de foulées portées, à l'est ou à l'ouest)
 *   INVARIANT      l'unité est la MÊME des deux côtés de O ; l'origine ne bouge pas
 *   TRANSFORMATION porter la foulée vers l'ouest (signe −) ; le jumeau de l'autre côté de O
 *   CONSTRAINT     la route est finie ; une lecture est dite en mots, la main la traduit en position
 *   RESISTANCE     « la route s'arrête avant : choisis une foulée plus courte » ; le jugement avec les nombres de l'élève ; jamais la bonne position
 *   EVIDENCE       la pastille « −1,5 », la cote, les étiquettes recalculées
 *   PREDICTION     la lecture est dite en mots avant que la main ne pose l'objet
 *   FORMALIZATION  « A(−3), B(2,7), C(−1,5) » ; « −1,5 est entre −2 et −1 »
 *   TRANSFER       « جرّب أعدادك » (toujours ouvert), les exercices et la banque
 *
 * ONBOARDING : `coach` (défaut true) → `LabCoach` ; `logic › coachOf`. QUESTIONS PENDANT LE LABO (`LabCheckpoint`) : `CHAINS` + `QUESTIONS`, après CHAQUE tâche, avec SES nombres.
 * ÉTAPES : `LabStepper` (`[data-ss-step=<i>]`) + la fête. « إعادة » : tâche 1.
 * Props : `tasks`, `level`, `levels`, `coach`, `title`, `lead`, `onTrial(event)`, `onFinished({})`.
 *
 * CONTRAT DOM : [data-stride-stamp][data-level][data-task][data-kind][data-solved], [data-ss-glance], [data-ss-stage], [data-ss-svg], [data-ss-knob][role=slider][data-pos], [data-ss-tick=<texte>],
 * [data-ss-reading=<texte>], [data-ss-rail], [data-ss-stride=<i>][data-active], [data-ss-house=<id>], [data-ss-frame], [data-ss-flag], [data-ss-given=<texte>], [data-ss-distance=<d>],
 * [data-ss-read=<i>][data-state=done|current|todo], [data-ss-reads], [data-ss-ask], [data-ss-less], [data-ss-more], [data-ss-less-tenth], [data-ss-more-tenth], [data-ss-record], [data-ss-verdict],
 * [data-ss-next], [data-ss-step=<i>], [data-ss-free], [data-ss-free-input], [data-ss-free-back], [data-ss-free-info], [data-ss-formal], [data-ss-kid][data-mood].
 */
const NS = 'manipulation.strideStamp';
const LRI = '⁦';
const PDI = '⁩';
const iso = (s) => `${LRI}${s}${PDI}`;
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-sky-300';
/** Une abscisse dans une phrase arabe : une formule KaTeX (le signe moins reste à GAUCHE des chiffres en RTL), jamais de + (un positif n'a pas de signe). */
const sg = (t) => `$${G.tex(t)}$`;

const CSS = `
@keyframes ss-pop { 0% { transform: scale(0.85); } 70% { transform: scale(1.06); } 100% { transform: scale(1); } }
.ss-pop { animation: ss-pop 240ms ease-out both; display: inline-block; }
@media (prefers-reduced-motion: reduce) { .ss-pop { animation: none !important; } }
.ss-knob:focus-visible { outline: 3px solid #38BDF8; outline-offset: 4px; border-radius: 8px; }
`;

export function numbersFor({ tasks, level }) {
  const lv = resolveLevelId(level ?? 'beginner');
  const asked = LEVELS['stride-stamp'][lv].numbers;
  return { tasks: tasks ?? asked.tasks };
}

export default function StrideStamp({
  tasks, title, lead, level, levels: withLevels = true, coach: coachOn = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const initialNumbers = useMemo(() => numbersFor({ tasks, level }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'stride-stamp', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
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
  const cpSettings = useLabCheckpointSettings('stride-stamp');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
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
    lab: 'stride-stamp', step: coachStep,
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
      type="stride-stamp"
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
        <div ref={boxRef} className="space-y-2" data-stride-stamp data-level={advanced ? 'advanced' : 'beginner'} data-task={lab.free ? 'free' : cur.id} data-kind={lab.free ? 'free' : cur.kind}
          data-solved={finished ? 'true' : 'false'}>
          <style dangerouslySetInnerHTML={{ __html: CSS }} />
          <Lab lab={lab} setLab={setLab} k={k} width={width} lead={state.isAuthoredLevel ? lead : null} cp={cp} advanced={advanced} />
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ══════════════ Les mots et les lectures ══════════════ */

const tOr = (k, key, fallback) => k(key, { defaultValue: k(fallback) });
const nameOf = (k, task, i) => k(`name.${task.id}.${i}`, { defaultValue: k('name.default', { n: i + 1 }) });
/** La distance d'une lecture en unités : « 3 » / « 2,7 ». */
const distWord = (t) => iso(G.fmt(Math.abs(t)));

/** La lecture demandée, DITE EN MOTS (jamais la position). */
export function askText(k, task, read) {
  if (task.kind === 'stamp') return k(read.at > 0 ? 'ask.stamp.east' : 'ask.stamp.west', { n: k('strides', { count: Math.abs(read.at / G.TENTH) }) });
  if (task.kind === 'twin') return k('ask.twin', { v: sg(read.of) });
  if (task.kind === 'place') return k(read.x > 0 ? 'ask.place.east' : 'ask.place.west', { d: distWord(read.x) });
  if (task.kind === 'origin') return k('ask.origin');
  return k('ask.bound');
}

/* ══════════════ Le laboratoire ══════════════ */

function Lab({ lab, setLab, k, lead, cp, advanced }) {
  const task = L.taskOf(lab);
  const free = L.isFree(lab);
  const done = L.taskDone(lab);
  const lit = !free && done;
  const last = lab.last;
  const svgRef = useRef(null);

  const kind = task.kind;
  const ctx = free ? k('ctx.free') : (lead && lab.ti === 0 ? lead : tOr(k, `ctx.${task.id}`, `ctx.default_${kind}`));
  const question = free ? k('q.free') : tOr(k, `q.${task.id}`, `q.default_${kind}`);

  const stepDone = lab.tasks.map((_, i) => !!lab.done[i] && (i !== lab.ti || !cp.blocking));
  const steps = lab.tasks.length > 1 && !free && <LabStepper count={lab.tasks.length} current={lab.ti} done={stepDone} stepAttr="data-ss-step" />;
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.trials.length === 0 && celebrated.current.size) celebrated.current = new Set();
  const nowDone = !free && stepDone[lab.ti];
  useEffect(() => {
    if (!nowDone || celebrated.current.has(lab.ti)) return;
    celebrated.current.add(lab.ti);
    party.celebrate({ n: lab.ti + 1, total: lab.tasks.length });
  }, [nowDone, lab.ti]); // eslint-disable-line react-hooks/exhaustive-deps

  // le son (muet sauf « الصوت ») : un déclic à chaque tick franchi, un petit drapeau quand un enregistrement est juste, « over » sur un refus, la cloche à la fin d'une tâche
  const sfx = useRef(Math.round(lab.pos / G.TENTH));
  useEffect(() => {
    const now = Math.round(lab.pos / G.TENTH);
    if (now !== sfx.current) playSfx('gesture', { pitch: now > sfx.current ? 1 : 0.75 });
    sfx.current = now;
  }, [lab.pos]);
  const nTrials = lab.trials.length;
  useEffect(() => {
    if (!nTrials) return;
    const tr = lab.trials[nTrials - 1];
    playSfx(tr.ok ? 'flag' : 'over');
  }, [nTrials]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (done && !free) playSfx('bell'); }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  const prompt = (
    <PromptCard size="md" aside={steps || null} context={<MathText>{ctx}</MathText>} contextProps={{ 'data-ss-context': free ? 'free' : task.id }}
      title={<MathText>{question}</MathText>} titleClassName="text-base" lamp={free ? null : lit ? 'on' : 'off'}
      titleProps={{ 'data-ss-prompt': free ? 'free' : task.id, 'data-lit': lit ? 'true' : 'false' }} />
  );

  /* ── le verdict : la CONSÉQUENCE avec les nombres de l'élève, jamais la bonne position ── */
  const verdictLine = (() => {
    if (free) return k(last?.kind === 'custom' ? 'free.on' : 'idle.open');
    if (!last) return k(`idle.${done ? 'done' : kind}`);
    const read = task.reads[last.ri];
    const vars = { value: sg(last.pos), pos: sg(last.pos), want: read ? askText(k, task, read) : '', d: distWord(last.pos), a: kind === 'twin' && read ? sg(read.of) : '', mirror: sg(G.symmetric(last.pos)),
      lo: sg(last.pos), hi: sg(last.pos + G.TENTH), tick: iso(last.pos / G.TENTH), reach: iso(Math.max(L.reach(last.stride).west, L.reach(last.stride).east)), west: iso(L.reach(last.stride).west), want2: read && kind === 'stamp' ? iso(Math.abs(read.at / G.TENTH)) : '' };
    if (last.ok) return k(`v.right.${kind}`, vars);
    return k(`v.${kind}.${last.model}`, vars);
  })();
  const bad = !free && !!last && last.ok === false;
  const good = !free && !!last && last.ok === true;
  const tone = bad ? 'amber' : good ? 'emerald' : 'indigo';
  const Icon = bad ? Sparkles : good ? CheckCircle2 : Hand;
  const canNext = L.canNext(lab) && !cp.blocking;
  const mood = bad ? 'wonder' : done ? 'proud' : 'happy';
  const banner = (
    <VerdictBanner tone={tone} icon={Icon} size="sm" className="min-h-[3.2rem]" data-ss-verdict={bad ? 'wrong' : good ? 'right' : free ? 'free' : ''}>
      <div className="flex min-w-0 items-center gap-2">
        <span data-ss-kidchip className="shrink-0"><KidChip idx={advanced ? 1 : 0} mood={mood} /></span>
        <div className="min-w-0 space-y-1.5">
          <p className={last || free ? '' : 'font-bold text-indigo-900'}><MathText>{verdictLine}</MathText></p>
          {canNext && (
            <button type="button" onClick={() => setLab(L.nextTask)} data-ss-next
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
      <div className="relative space-y-2" data-ss-glance>
        {party.node}
        {cp.node}
        {prompt}
        <StageFrame className="min-w-0 overflow-hidden p-2" data-ss-stage>
          <Stage lab={lab} setLab={setLab} k={k} svgRef={svgRef} mood={mood} />
        </StageFrame>
        {!free ? <Controls lab={lab} setLab={setLab} k={k} /> : null}
        {banner}
      </div>
      <FreeCard lab={lab} setLab={setLab} k={k} />
    </>
  );
}

/* ══════════════ La scène : la route, la main et ce qu'elle porte ══════════════ */

/** Les coordonnées SVG d'un évènement pointeur. */
function svgPoint(svg, e) {
  const r = svg?.getBoundingClientRect();
  if (!r || !r.width) return null;
  return { x: ((e.clientX - r.left) * W) / r.width, y: ((e.clientY - r.top) * H) / r.height };
}

function Stage({ lab, setLab, k, svgRef, mood }) {
  const uid = `ss${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const free = L.isFree(lab);
  const task = L.taskOf(lab);
  const kind = free ? 'free' : task.kind;
  const { ox, u } = geoOf(task, lab.stride, free);
  const [drag, setDrag] = useState(null); // 'knob' | 'rail'
  const locked = !free && L.taskDone(lab);
  const live = !free && !locked;
  const reads = task.reads;

  const posFromX = (x) => {
    if (kind === 'origin') return Math.round((x - ox) / u) * G.TENTH;
    if (kind === 'bound') return Math.round((x - ox) / u - 0.5) * G.TENTH;
    return tAt(ox, u, x);
  };
  const railIndex = (x) => RAIL_XS.reduce((best, rx, i) => (Math.abs(rx - x) < Math.abs(RAIL_XS[best] - x) ? i : best), 0);
  const down = (e) => {
    if (!live) return;
    const p = svgPoint(svgRef.current, e); if (!p) return;
    e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag('knob');
    setLab((s) => L.setPos(s, posFromX(p.x)));
  };
  const downRail = (e) => {
    if (!live || kind !== 'stamp') return;
    const p = svgPoint(svgRef.current, e); if (!p) return;
    e.preventDefault(); e.stopPropagation(); e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag('rail');
    setLab((s) => L.setStride(s, railIndex(p.x)));
  };
  const move = (e) => {
    if (!drag) return;
    const p = svgPoint(svgRef.current, e); if (!p) return;
    if (drag === 'rail') setLab((s) => L.setStride(s, railIndex(p.x)));
    else setLab((s) => L.setPos(s, posFromX(p.x)));
  };
  const up = () => setDrag(null);
  const key = (e) => {
    if (!live) return;
    const g = L.grainOf(lab);
    if (e.key === 'ArrowRight') { e.preventDefault(); setLab((s) => L.moveBy(s, g)); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); setLab((s) => L.moveBy(s, -g)); }
    else if (e.key === 'PageUp') { e.preventDefault(); setLab((s) => L.moveBy(s, G.TENTH)); }
    else if (e.key === 'PageDown') { e.preventDefault(); setLab((s) => L.moveBy(s, -G.TENTH)); }
    else if (e.key === 'Home') { e.preventDefault(); setLab((s) => L.setPos(s, L.limitsOf(s).min)); }
    else if (e.key === 'End') { e.preventDefault(); setLab((s) => L.setPos(s, L.limitsOf(s).max)); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLab(L.record); }
  };

  const pos = free ? lab.free.t : lab.pos;
  const tone = G.sideOf(pos) === 'west' ? 'west' : G.sideOf(pos) === 'east' ? 'east' : 'origin';
  const held = drag === 'knob';
  const lim = L.limitsOf(lab);

  /* ── les ticks de chaque genre ── */
  const ticks = [];
  let axis = null;
  if (kind === 'stamp') {
    const { west, east } = lab.stamped;
    axis = (west || east) ? <Axis x1={xOf(ox, u, -west * G.TENTH)} x2={xOf(ox, u, east * G.TENTH)} /> : null;
    for (let i = -west; i <= east; i += 1) ticks.push(<Tick key={i} x={xOf(ox, u, i * G.TENTH)} label={i === 0 ? '0' : G.fmt(i * G.TENTH)} tone={i < 0 ? 'west' : i > 0 ? 'east' : 'plain'} zero={i === 0} />);
  } else if (kind === 'free') {
    axis = <Axis x1={xOf(ox, u, -50)} x2={xOf(ox, u, 50)} />;
    for (let i = -5; i <= 5; i += 1) ticks.push(<Tick key={i} x={xOf(ox, u, i * G.TENTH)} label={i === 0 ? '0' : G.fmt(i * G.TENTH)} tone={i < 0 ? 'west' : i > 0 ? 'east' : 'plain'} zero={i === 0} />);
  } else if (kind === 'origin') {
    const o = lab.pos / G.TENTH;
    axis = <Axis x1={xOf(ox, u, 0)} x2={xOf(ox, u, task.n * G.TENTH)} />;
    for (let i = 0; i <= task.n; i += 1) {
      const v = G.valueAt(i, o, task.u) * G.TENTH;
      ticks.push(<Tick key={i} x={ox + i * u} label={i === o ? null : G.fmt(v)} tone={v < 0 ? 'west' : v > 0 ? 'east' : 'plain'} />);
    }
  } else {
    axis = <Axis x1={xOf(ox, u, -PLACE_UNITS * G.TENTH)} x2={xOf(ox, u, PLACE_UNITS * G.TENTH)} />;
    for (let i = -PLACE_UNITS; i <= PLACE_UNITS; i += 1) ticks.push(<Tick key={i} x={xOf(ox, u, i * G.TENTH)} label={i === 0 ? '0' : G.fmt(i * G.TENTH)} tone={i < 0 ? 'west' : i > 0 ? 'east' : 'plain'} zero={i === 0} />);
  }

  const knobX = kind === 'origin' ? ox + (lab.pos / G.TENTH) * u : kind === 'bound' ? xOf(ox, u, lab.pos) + u / 2 : xOf(ox, u, pos);
  const aria = k(`knobAria.${kind === 'free' ? 'place' : kind}`);
  const valueText = kind === 'bound' ? k('frameValue', { lo: G.fmt(lab.pos), hi: G.fmt(lab.pos + G.TENTH) }) : kind === 'origin' ? k('flagValue', { i: lab.pos / G.TENTH }) : k('knobValue', { v: G.fmt(pos) });
  const showKid = kind !== 'origin';

  return (
    <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: W, display: 'block', margin: '0 auto', touchAction: 'none' }} role="img" aria-label={k('stageAria')} data-ss-svg dir="ltr"
      onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
      <Backdrop uid={uid} showStop={kind !== 'origin'} ox={ox} />
      {axis}
      {ticks}
      {kind === 'stamp' && <g onPointerDown={downRail} style={{ cursor: live ? 'ew-resize' : 'default' }}><rect x={RAIL_BOX.x} y={10} width={RAIL_BOX.w} height={72} fill="transparent" data-ss-rail-hit /><Rail index={lab.stride} active={drag === 'rail'} label={k('strideLabel')} locked={!live} /></g>}
      {kind === 'twin' && !free && reads[lab.ri] && <TwinScene lab={lab} k={k} ox={ox} u={u} read={reads[lab.ri]} pos={pos} />}
      {(kind === 'place') && <PlaceHouses lab={lab} ox={ox} u={u} />}
      {kind === 'bound' && reads[lab.ri] && <House x={xOf(ox, u, reads[lab.ri].x)} color={HOUSE_COLORS[lab.ri % HOUSE_COLORS.length]} id={`bound-${lab.ri}`} />}
      {kind === 'origin' && task.marks.map((m) => <GivenMark key={m.i} x={ox + m.i * u} text={G.fmt(m.v * G.TENTH)} />)}
      {kind === 'origin' && <Flag x={ox + (lab.pos / G.TENTH) * u} held={held} />}
      {showKid && <Observer idx={advanced0(lab) ? 1 : 0} mood={mood} x={150} y={78} size={70} />}
      {/* la main : un seul glisser sur toute la route */}
      {live && <rect x={0} y={LY - 120} width={W} height={190} fill="transparent" onPointerDown={down} style={{ cursor: kind === 'bound' || kind === 'origin' ? 'ew-resize' : 'grab' }} data-ss-hit />}
      <g data-ss-knob data-pos={lab.pos} role="slider" tabIndex={live ? 0 : -1} aria-label={aria} aria-valuemin={lim.min} aria-valuemax={lim.max} aria-valuenow={free ? pos : lab.pos} aria-valuetext={valueText}
        onKeyDown={key} onPointerDown={down} style={{ cursor: live ? 'grab' : 'default' }} className="ss-knob">
        {kind === 'stamp' && <Stick x0={ox} x1={xOf(ox, u, lab.pos)} active={held} />}
        {kind === 'twin' && !free && <House x={xOf(ox, u, lab.pos)} color={COL.mirror} held={held} id="twin" ghost={false} />}
        {kind === 'place' && !free && <House x={xOf(ox, u, lab.pos)} color={HOUSE_COLORS[lab.ri % HOUSE_COLORS.length]} held={held} id={`pin-${lab.ri}`} />}
        {kind === 'free' && <House x={xOf(ox, u, pos)} color={HOUSE_COLORS[0]} id="free" />}
        {kind === 'bound' && <Frame x={xOf(ox, u, lab.pos)} u={u} active={held} locked={locked} ok={locked || (lab.last?.ok === true)} />}
        {kind === 'origin' && <circle cx={ox + (lab.pos / G.TENTH) * u} cy={LY} r={22} fill="transparent" stroke={held ? '#4338CA' : 'transparent'} strokeWidth={3} />}
      </g>
      {/* les pastilles de lecture : l'abscisse en direct (la main n'écrit jamais le nombre) */}
      {kind === 'bound'
        ? <Reading x={Math.min(Math.max(knobX, 90), W - 90)} y={LY - 140} text={`${G.fmt(lab.pos)} ; ${G.fmt(lab.pos + G.TENTH)}`} tone="plain" />
        : kind === 'origin' ? null
          : <Reading x={Math.min(Math.max(knobX, 70), W - 70)} y={kind === 'stamp' ? LY - 52 : LY - 140} text={G.fmt(pos)} tone={tone} />}
    </svg>
  );
}
const PLACE_UNITS = 4;
const advanced0 = (lab) => L.isAdvanced(lab);

/** `twin` : le bâtiment de départ, les cotes de distance à O de chacun des deux et la ligne de la station. */
function TwinScene({ ox, u, read, pos }) {
  return (
    <g data-ss-twin>
      <House x={xOf(ox, u, read.of)} color={HOUSE_COLORS[0]} id="anchor" />
      <DistanceBar x1={ox} x2={xOf(ox, u, read.of)} y={LY - 128} label={G.fmt(Math.abs(read.of))} />
      {pos !== 0 && <DistanceBar x1={ox} x2={xOf(ox, u, pos)} y={LY - 160} label={G.fmt(Math.abs(pos))} />}
    </g>
  );
}

/** `place` : les bâtiments déjà posés de la tâche (en gris clair) — l'élève ne voit jamais la bonne position. */
function PlaceHouses({ lab, ox, u }) {
  return (
    <g data-ss-placed>
      {lab.log.map((e) => <House key={e.ri} x={xOf(ox, u, e.pos)} color={HOUSE_COLORS[e.ri % HOUSE_COLORS.length]} id={`placed-${e.ri}`} />)}
    </g>
  );
}

/* ══════════════ Les commandes : le carnet de lectures, les boutons et « سجّل » ══════════════ */

function Controls({ lab, setLab, k }) {
  const task = L.taskOf(lab);
  const done = L.taskDone(lab);
  const btn = `inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-2xl border-2 px-3 text-sm font-black disabled:opacity-40 ${ring}`;
  const place = task.kind === 'place';
  const unit = (n) => setLab((s) => L.moveBy(s, n * G.TENTH));
  const tenth = (n) => setLab((s) => L.moveBy(s, n));
  return (
    <LabCard className="space-y-2 p-2" data-ss-controls>
      <p data-ss-ask className={`rounded-xl border-2 px-3 py-2 text-base font-black leading-snug ${done ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-sky-500 bg-sky-50 text-sky-950'}`}>
        {done ? k('idle.done') : <><b className="font-black">{nameOf(k, task, lab.ri)}</b> — <MathText>{askText(k, task, task.reads[lab.ri])}</MathText></>}
      </p>
      {task.kind !== 'origin' && (
        <ol className="flex flex-wrap gap-1.5" data-ss-reads aria-label={k('readsAria')}>
          {task.reads.map((r, i) => {
            const entry = lab.log.find((x) => x.ri === i);
            const state = entry ? 'done' : i === lab.ri && !done ? 'current' : 'todo';
            return (
              <li key={i} data-ss-read={i} data-state={state}
                className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-full border-2 px-3 py-1 text-sm ${state === 'done' ? 'border-emerald-300 bg-emerald-50 font-bold text-emerald-900' : state === 'current' ? 'border-sky-500 bg-sky-50 font-black text-sky-950 ring-2 ring-sky-200' : 'border-slate-200 bg-white text-slate-500'}`}>
                <span>{nameOf(k, task, i)}</span>
                {entry && <span className="inline-flex shrink-0 items-center rounded-full bg-emerald-600 px-2 py-0.5 text-sm font-black text-white ss-pop" dir="ltr"><bdi>{task.kind === 'bound' ? `${G.fmt(entry.pos)} ; ${G.fmt(entry.pos + G.TENTH)}` : G.fmt(entry.pos)}</bdi></span>}
              </li>
            );
          })}
        </ol>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5" dir="ltr">
          {place && <button type="button" onClick={() => tenth(-1)} disabled={done} data-ss-less-tenth aria-label={k('lessTenth')} className={`${btn} min-w-[56px] border-sky-300 bg-white text-sky-900`}><span aria-hidden="true">−0,1</span></button>}
          <button type="button" onClick={() => unit(-1)} disabled={done} data-ss-less aria-label={k(`less.${task.kind}`)} className={`${btn} min-w-[56px] border-sky-300 bg-white text-sky-900`}><ChevronLeft className="h-4 w-4" aria-hidden="true" /> <span aria-hidden="true">{place ? '1' : ''}</span></button>
          <button type="button" onClick={() => unit(1)} disabled={done} data-ss-more aria-label={k(`more.${task.kind}`)} className={`${btn} min-w-[56px] border-sky-300 bg-white text-sky-900`}><span aria-hidden="true">{place ? '1' : ''}</span> <ChevronRight className="h-4 w-4" aria-hidden="true" /></button>
          {place && <button type="button" onClick={() => tenth(1)} disabled={done} data-ss-more-tenth aria-label={k('moreTenth')} className={`${btn} min-w-[56px] border-sky-300 bg-white text-sky-900`}><span aria-hidden="true">+0,1</span></button>}
        </div>
        <button type="button" onClick={() => setLab(L.record)} disabled={done} data-ss-record className={`${btn} border-sky-600 bg-sky-600 text-white shadow-[0_3px_0_0_#0369A1]`}>
          <ClipboardCheck className="h-4 w-4" aria-hidden="true" /> {k(`record.${task.kind}`)}
        </button>
      </div>
    </LabCard>
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
    const raw = e.target.value.replace(/[^0-9٠-٩+\-−.,٫،\s]/g, '').slice(0, 6);
    setText(raw);
    if (L.parseFree(raw) !== null) setLab((s) => L.setFree(s, raw));
  };
  return (
    <LabCard className="space-y-2 border-emerald-200 bg-emerald-50/50 p-3" data-ss-free data-active={free ? 'true' : 'false'}>
      <p className="flex items-center gap-1.5 text-sm font-black text-emerald-900"><FlaskConical className="h-4 w-4" aria-hidden="true" /> {k('free.title')}</p>
      <p className="text-xs font-bold leading-snug text-slate-600"><MathText>{free ? k('free.on') : k('free.hint')}</MathText></p>
      <div className="flex flex-wrap items-center gap-3">
        <input type="text" inputMode="decimal" autoComplete="off" dir="ltr" value={text} onChange={onText} aria-label={k('free.aria')} aria-invalid={bad} data-ss-free-input placeholder="−1,5 ; 2,7"
          className={`h-11 w-36 rounded-xl border-2 ${bad ? 'border-rose-300' : 'border-emerald-300'} bg-white px-3 text-center text-lg font-black tabular-nums text-indigo-950 ${ring}`} />
        {bad && <span className="text-xs font-bold text-rose-700"><MathText>{k('free.bad')}</MathText></span>}
        {free && info && (
          <span className="text-xs font-black text-emerald-900" data-ss-free-info>
            <MathText>{k(info.bounds ? 'free.infoBounds' : 'free.info', { v: sg(info.t), side: k(`free.side.${info.side}`), d: sg(info.distance), o: sg(info.symmetric), lo: sg((info.bounds?.[0] ?? 0) * G.TENTH), hi: sg((info.bounds?.[1] ?? 0) * G.TENTH) })}</MathText>
          </span>
        )}
        {free && (
          <button type="button" onClick={() => setLab(L.toGuided)} data-ss-free-back
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

/** Ce que l'élève a trouvé, écrit avec SES nombres : A(−3), B(2,7), C(−1,5) (مبتدئ) ou l'encadrement de son dernier bâtiment (متقدم). */
export function Formal({ lab, k, advanced }) {
  const place = lab.tasks.find((tk) => tk.kind === 'place');
  const bound = lab.tasks.find((tk) => tk.kind === 'bound');
  if (advanced) {
    const x = bound ? bound.reads[0].x : -15;
    const [lo, hi] = G.boundsOf(x);
    return (
      <div className="space-y-2 text-sm font-bold text-emerald-950" data-ss-formal="both">
        <p className="text-center text-base" dir="ltr"><MathText>{$(`${G.tex(lo * G.TENTH)}<${G.tex(x)}<${G.tex(hi * G.TENTH)}`)}</MathText></p>
        <p><MathText>{k('formal.both')}</MathText></p>
      </div>
    );
  }
  const xs = place ? place.reads.map((r) => r.x) : [-30, 27, -15];
  const names = ['A', 'B', 'C'];
  return (
    <div className="space-y-2 text-sm font-bold text-emerald-950" data-ss-formal="rule">
      <p className="text-center text-base" dir="ltr"><MathText>{$(xs.map((x, i) => `${names[i]}(${G.tex(x)})`).join('\\ ;\\ '))}</MathText></p>
      <p><MathText>{k('formal.rule')}</MathText></p>
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite d'une tâche (par son id : les tâches viennent de la leçon). La dernière tâche de chaque niveau finit par LA RÈGLE. */
export const CHAINS = Object.freeze({
  b1: ['sameUnit', 'westSign'],
  b2: ['symm', 'sameDist'],
  b3: ['green', 'between', 'ruleA'],
  a1: ['originMid'],
  a2: ['originTick'],
  a3: ['lastBound', 'ruleB'],
});

/** Une question à trois options décrite par ses clés de chaîne `cp.<id>.*` ; `vars` sont les nombres de l'élève. */
const choice = (k, id, vars, at, extra = {}) => ({
  id, kind: 'choice', prompt: Mx(k, `${id}.prompt`, vars),
  options: opt([Mx(k, `${id}.right`, vars), Mx(k, `${id}.wrongA`, vars), Mx(k, `${id}.wrongB`, vars)], 0, [null, Mx(k, `${id}.whyA`, vars), Mx(k, `${id}.whyB`, vars)], at),
  hints: [Mx(k, `${id}.hint1`, vars), Mx(k, `${id}.hint2`, vars)], explain: Mx(k, `${id}.explain`, vars), ...extra,
});

/** Les nombres de l'élève : les lectures de la tâche. */
function varsOf(task) {
  const x = (i) => task.reads[i]?.x ?? task.reads[i]?.of ?? task.reads[i]?.at ?? 0;
  const first = x(0);
  const last = x(task.reads.length - 1);
  const d = Math.abs(first);
  const mk = task.kind === 'origin' ? task.marks : [];
  const near = mk.length ? mk.reduce((b, m) => (Math.abs(m.v) < Math.abs(b.v) ? m : b)) : null;
  return {
    // b1 : les foulées portées à l'est et à l'ouest
    east: iso(Math.abs(task.reads[0]?.at ?? 0) / G.TENTH), west: iso(Math.abs(task.reads[1]?.at ?? 0) / G.TENTH),
    // b2 : le jumeau de `first`
    a: sg(first), b: sg(-first), c: sg(first + G.TENTH), dd: iso(G.fmt(d)), dd1: iso(G.fmt(d + G.TENTH)), negdd: `$-${G.tex(d)}$`,
    // b3 : le premier bâtiment (vert) et le troisième
    g1: sg(first), g1o: sg(-first), g1n: sg(first - G.TENTH), h: sg(x(2)), hlo: sg(G.floorUnit(x(2)) * G.TENTH), hhi: sg((G.floorUnit(x(2)) + 1) * G.TENTH), hup: sg(G.truncUnit(x(2)) * G.TENTH),
    hsl: sg(G.floorUnit(-x(2)) * G.TENTH), hsh: sg((G.floorUnit(-x(2)) + 1) * G.TENTH), hop: sg((G.truncUnit(x(2)) + 1) * G.TENTH),
    // a1 / a2 : la graduation écrite la plus proche de l'origine
    m: near ? sg(near.v * G.TENTH) : '', mu: near ? iso(Math.abs(near.v) / (task.u ?? 1)) : '', mu2: near ? iso(Math.abs(near.v)) : '', mfar: mk.length ? sg(mk[0].v * G.TENTH) : '',
    mfar2: mk.length ? sg(mk[1].v * G.TENTH) : '', u: iso(task.u ?? 1), ticks3: iso(mk.length ? Math.abs(mk[1].i - mk[0].i) : 3),
    // a3 : le dernier bâtiment
    l: sg(last), llo: sg(G.floorUnit(last) * G.TENTH), lhi: sg((G.floorUnit(last) + 1) * G.TENTH), lup: sg((G.floorUnit(last) + 2) * G.TENTH), lnl: sg((G.floorUnit(last) - 1) * G.TENTH), lop: sg(G.symmetric(last)),
  };
}
const at = { sameUnit: 1, westSign: 2, symm: 0, sameDist: 2, green: 1, between: 2, originMid: 0, originTick: 1, lastBound: 2 };

export const QUESTIONS = {
  sameUnit: (lab, task, k) => choice(k, 'sameUnit', varsOf(task, k), at.sameUnit),
  westSign: (lab, task, k) => choice(k, 'westSign', varsOf(task, k), at.westSign),
  symm: (lab, task, k) => choice(k, 'symm', varsOf(task, k), at.symm),
  sameDist: (lab, task, k) => choice(k, 'sameDist', varsOf(task, k), at.sameDist),
  green: (lab, task, k) => choice(k, 'green', varsOf(task, k), at.green),
  between: (lab, task, k) => choice(k, 'between', varsOf(task, k), at.between),
  originMid: (lab, task, k) => choice(k, 'originMid', varsOf(task, k), at.originMid),
  originTick: (lab, task, k) => choice(k, 'originTick', varsOf(task, k), at.originTick),
  lastBound: (lab, task, k) => choice(k, 'lastBound', varsOf(task, k), at.lastBound),
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
