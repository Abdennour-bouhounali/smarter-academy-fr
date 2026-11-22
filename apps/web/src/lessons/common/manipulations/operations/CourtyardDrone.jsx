import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Hand, CheckCircle2, Sparkles, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, FlaskConical, Undo2, Camera, Lock, Unlock } from 'lucide-react';
import { resolveLevelId } from '@smarter-academy/core/curriculum/manipulationLevels.js';
import * as P from '@smarter-academy/core/arithmetic/planeFrame.js';
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
import { W, H, tx, ty, Backdrop, Axes, Pole, Thing, Guides, Drone, Refusal, Reading, Feet, KidChip } from './courtyardDrone/art';
import { LEVELS } from '../levels';
import * as L from '../logic/courtyardDrone';

/**
 * courtyard-drone — LE DRONE QUI NE VA QUE SUR UN AXE À LA FOIS (1AM, unité 5, درس « التعليم في المستوي », 2026-10-30).
 * La logique, exacte, est dans `logic/courtyardDrone.js` (sur `packages/core/arithmetic/planeFrame.js`, importé par chemin).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. مبتدئ : la main conduit un drone au-dessus du PLAN d'une cour d'école vu d'en haut (l'origine est le mât du drapeau, deux lignes peintes sont les axes). Elle roule D'ABORD sur la ligne horizontale, fixe
 *    l'abscisse, puis monte ou descend sur la verticale, et « prend la photo » : le lieu est dit par ses DEUX nombres (« النافورة عند (3 ; −2) »), ou dessiné et lu (« البوابة »). متقدم : les mêmes gestes avec des demi-cases,
 *    sur papier quadrillé puis sur un papier SANS carreaux (seulement les deux axes gradués : le drone projette ses deux parallèles aux axes).
 * B. Le couple (x ; y) est une SORTIE de la main : la pastille le lit à la volée, dans l'ordre (abscisse d'abord).
 * C. La résistance : le drone REFUSE la diagonale (un geste qui sort de l'axe actif, ou une touche de l'autre axe, le fait trembler sans le déplacer) ; échanger l'ordre des deux nombres mène à un AUTRE lieu ;
 *    un enregistrement faux n'est jamais corrigé, il est jugé.
 * D. La phase formelle écrit ce que l'élève a trouvé avec SES nombres (G(−3 ; 2), K(2 ; −4) ; A(2,5 ; −1,5)).
 * E. Les fausses réponses sont rendues VISIBLES : le point où le drone s'est posé avec ses deux nombres, les guides en pointillés, le refus de la diagonale.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        le repérage dans le plan : deux nombres RELATIFS, dans un certain ordre, repèrent un point
 *   OBJECT         un plan de cour d'école, un drone, des objets (fontaine, porte, banc, robinet, portail, kiosque…), deux lignes peintes graduées
 *   VARIABLE       la position du drone sur l'axe horizontal (l'abscisse), puis sur la verticale (l'ordonnée) — jamais les deux à la fois
 *   INVARIANT      l'origine ne bouge pas ; les deux axes sont perpendiculaires et gradués avec la même unité
 *   TRANSFORMATION conduire sur un axe, fixer, conduire sur l'autre ; échanger les deux nombres
 *   CONSTRAINT     le drone refuse la diagonale ; la photo n'est prise qu'après la phase verticale
 *   RESISTANCE     « المسيّرة لا تسير مائلة » ; le jugement avec les nombres de l'élève ; jamais le bon lieu
 *   EVIDENCE       la pastille (x ; y), les pointillés, l'abscisse écrite sous le pied de la verticale
 *   PREDICTION     le lieu est dit par ses deux nombres (ou dessiné) avant que la main ne bouge
 *   FORMALIZATION  « M(x ; y) : l'abscisse d'abord » ; « on lit sur chaque axe par la parallèle à l'autre »
 *   TRANSFER       « جرّب أعدادك » (toujours ouvert), les exercices et la banque
 *
 * ONBOARDING : `coach` (défaut true) → `LabCoach` ; `logic › coachOf`. QUESTIONS PENDANT LE LABO (`LabCheckpoint`) : `CHAINS` + `QUESTIONS`, après CHAQUE tâche, avec SES nombres.
 * ÉTAPES : `LabStepper` (`[data-cd-step=<i>]`) + la fête. « إعادة » : tâche 1.
 * Props : `tasks`, `level`, `levels`, `coach`, `title`, `lead`, `onTrial(event)`, `onFinished({})`.
 *
 * CONTRAT DOM : [data-courtyard-drone][data-level][data-task][data-kind][data-paper][data-phase][data-solved], [data-cd-glance], [data-cd-stage], [data-cd-svg], [data-cd-knob][role=slider][data-x][data-y], [data-cd-drone],
 * [data-cd-grid], [data-cd-axes], [data-cd-tick=<x|y><v>], [data-cd-pole], [data-cd-thing=<what>][data-state], [data-cd-guide=<phase>], [data-cd-refused], [data-cd-reading=<texte>], [data-cd-feet],
 * [data-cd-ask], [data-cd-reads], [data-cd-read=<i>][data-state=done|current|todo], [data-cd-left], [data-cd-right], [data-cd-up], [data-cd-down], [data-cd-lock], [data-cd-unlock], [data-cd-record],
 * [data-cd-verdict], [data-cd-next], [data-cd-step=<i>], [data-cd-free], [data-cd-free-x], [data-cd-free-y], [data-cd-free-info], [data-cd-free-back], [data-cd-formal], [data-cd-kid][data-mood].
 */
const NS = 'manipulation.courtyardDrone';
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-sky-300';
/** Un couple dans une phrase arabe : une formule KaTeX (le signe moins reste à GAUCHE des chiffres en RTL). */
const pt = (p) => `$${P.pairTex(p)}$`;

const CSS = `
@keyframes cd-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes cd-shake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-7px); } 40% { transform: translateX(7px); } 60% { transform: translateX(-5px); } 80% { transform: translateX(5px); } }
@keyframes cd-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
.cd-spin { animation: cd-spin 0.5s linear infinite; }
.cd-shake { animation: cd-shake 360ms ease-in-out 1; }
.cd-pulse { animation: cd-pulse 1.3s ease-in-out infinite; }
.cd-pop { animation: cd-pulse 240ms ease-out 1; display: inline-block; }
@media (prefers-reduced-motion: reduce) { .cd-spin, .cd-shake, .cd-pulse, .cd-pop { animation: none !important; } }
.cd-knob:focus-visible { outline: 3px solid #38BDF8; outline-offset: 4px; border-radius: 8px; }
`;

export function numbersFor({ tasks, level }) {
  const lv = resolveLevelId(level ?? 'beginner');
  const asked = LEVELS['courtyard-drone'][lv].numbers;
  return { tasks: tasks ?? asked.tasks };
}

export default function CourtyardDrone({
  tasks, title, lead, level, levels: withLevels = true, coach: coachOn = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const initialNumbers = useMemo(() => numbersFor({ tasks, level }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'courtyard-drone', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
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
  const cpSettings = useLabCheckpointSettings('courtyard-drone');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
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
    lab: 'courtyard-drone', step: coachStep,
    text: coachStep ? k(`coach.${coachStep.id}`) : '',
    labels: { hide: k('coach.hide'), show: k('coach.show'), ok: k('coach.ok'), stop: k('coach.stop') },
  });

  const discovery = (
    <ManipulationDiscovery state={state} prompt={<MathText>{k(`discovery.${advanced ? 'both' : 'rule'}.prompt`)}</MathText>} options={ruleOptions(lab, k, advanced)} formal={<Formal lab={lab} k={k} advanced={advanced} />} />
  );

  return (
    <ManipulationShell
      type="courtyard-drone"
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
        <div className="space-y-2" data-courtyard-drone data-level={advanced ? 'advanced' : 'beginner'} data-task={lab.free ? 'free' : cur.id} data-kind={lab.free ? 'free' : cur.kind}
          data-paper={lab.free ? 'squared' : cur.paper} data-phase={lab.free ? 'free' : lab.phase} data-solved={finished ? 'true' : 'false'}>
          <style dangerouslySetInnerHTML={{ __html: CSS }} />
          <Lab lab={lab} setLab={setLab} k={k} lead={state.isAuthoredLevel ? lead : null} cp={cp} advanced={advanced} />
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ══════════════ Les mots et les lectures ══════════════ */

const tOr = (k, key, fallback) => k(key, { defaultValue: k(fallback) });
const thingOf = (k, read) => k(`thing.${read.what}`);

/** La lecture demandée : les nombres DITS (fly) ou l'objet désigné (read) — jamais la position ni la phase. */
export function askText(k, task, read) {
  if (task.kind === 'fly') return k('ask.fly', { thing: thingOf(k, read), p: pt(read) });
  return k('ask.read', { thing: thingOf(k, read) });
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
  const steps = lab.tasks.length > 1 && !free && <LabStepper count={lab.tasks.length} current={lab.ti} done={stepDone} stepAttr="data-cd-step" />;
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.trials.length === 0 && celebrated.current.size) celebrated.current = new Set();
  const nowDone = !free && stepDone[lab.ti];
  useEffect(() => {
    if (!nowDone || celebrated.current.has(lab.ti)) return;
    celebrated.current.add(lab.ti);
    party.celebrate({ n: lab.ti + 1, total: lab.tasks.length });
  }, [nowDone, lab.ti]); // eslint-disable-line react-hooks/exhaustive-deps

  // le son (muet sauf « الصوت ») : un déclic à chaque case franchie, un fanion quand la photo est juste, « over » sur un refus ou une photo fausse, la cloche à la fin d'une tâche
  const sfx = useRef(`${lab.x}|${lab.y}`);
  useEffect(() => {
    const key = `${lab.x}|${lab.y}`;
    if (key !== sfx.current) {
      const [ox, oy] = sfx.current.split('|').map(Number);
      playSfx('gesture', { pitch: lab.x + lab.y > ox + oy ? 1 : 0.75 });
    }
    sfx.current = key;
  }, [lab.x, lab.y]);
  useEffect(() => { if (lab.last?.kind === 'refuse') playSfx('over'); }, [lab.last]);
  const nTrials = lab.trials.length;
  useEffect(() => {
    if (!nTrials) return;
    const tr = lab.trials[nTrials - 1];
    playSfx(tr.ok ? 'flag' : 'over');
  }, [nTrials]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (done && !free) playSfx('bell'); }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  const prompt = (
    <PromptCard size="md" aside={steps || null} context={<MathText>{ctx}</MathText>} contextProps={{ 'data-cd-context': free ? 'free' : task.id }}
      title={<MathText>{question}</MathText>} titleClassName="text-base" lamp={free ? null : lit ? 'on' : 'off'}
      titleProps={{ 'data-cd-prompt': free ? 'free' : task.id, 'data-lit': lit ? 'true' : 'false' }} />
  );

  /* ── le verdict : la CONSÉQUENCE avec les nombres de l'élève, jamais le bon lieu ── */
  const verdictLine = (() => {
    if (free) return k(last?.kind === 'custom' ? 'free.on' : 'idle.open');
    if (!last) return k(`idle.${done ? 'done' : kind}`);
    if (last.kind === 'refuse') return k(`refuse.${last.phase}`);
    const read = task.reads[last.ri];
    const vars = { pos: pt({ x: last.x, y: last.y }), want: read ? pt(read) : '', thing: read ? thingOf(k, read) : '', swap: read ? pt(P.swap(read)) : '' };
    if (last.ok) return k(`v.right.${kind}`, vars);
    return k(`v.${kind}.${last.model}`, vars);
  })();
  const refused = !free && last?.kind === 'refuse';
  const bad = !free && !!last && last.ok === false;
  const good = !free && !!last && last.ok === true;
  const tone = bad || refused ? 'amber' : good ? 'emerald' : 'indigo';
  const Icon = bad || refused ? Sparkles : good ? CheckCircle2 : Hand;
  const canNext = L.canNext(lab) && !cp.blocking;
  const mood = bad || refused ? 'wonder' : done ? 'proud' : 'happy';
  const banner = (
    <VerdictBanner tone={tone} icon={Icon} size="sm" className="min-h-[3.2rem]" data-cd-verdict={bad ? 'wrong' : refused ? 'refused' : good ? 'right' : free ? 'free' : ''}>
      <div className="flex min-w-0 items-center gap-2">
        <span data-cd-kidchip className="shrink-0"><KidChip idx={advanced ? 1 : 0} mood={mood} /></span>
        <div className="min-w-0 space-y-1.5">
          <p className={last || free ? '' : 'font-bold text-indigo-900'}><MathText>{verdictLine}</MathText></p>
          {canNext && (
            <button type="button" onClick={() => setLab(L.nextTask)} data-cd-next
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
      <div className="relative space-y-2" data-cd-glance>
        {party.node}
        {cp.node}
        {prompt}
        <StageFrame className="min-w-0 overflow-hidden p-2" data-cd-stage>
          <Stage lab={lab} setLab={setLab} k={k} svgRef={svgRef} />
        </StageFrame>
        {!free ? <Controls lab={lab} setLab={setLab} k={k} /> : null}
        {banner}
      </div>
      <FreeCard lab={lab} setLab={setLab} k={k} />
    </>
  );
}

/* ══════════════ La scène : le plan de la cour, le drone et ce qu'il survole ══════════════ */

/** Les coordonnées SVG d'un évènement pointeur. */
function svgPoint(svg, e) {
  const r = svg?.getBoundingClientRect();
  if (!r || !r.width) return null;
  return { x: ((e.clientX - r.left) * W) / r.width, y: ((e.clientY - r.top) * H) / r.height };
}
/** À partir de quel écart (dixièmes) la main est « sortie » de l'axe actif : plus d'une case et demie. */
const OFF_LANE = 17;

function Stage({ lab, setLab, k, svgRef }) {
  const uid = `cd${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const free = L.isFree(lab);
  const task = L.taskOf(lab);
  const squared = free || task.paper === 'squared';
  const [drag, setDrag] = useState(false);
  const refusedRef = useRef(false);
  const locked = !free && L.taskDone(lab);
  const live = !free && !locked;
  const pos = L.dronePos(lab);
  const axis = L.axisOf(lab);

  const apply = (p) => {
    const hx = tx(p.x);
    const hy = ty(p.y);
    const off = lab.phase === 'x' ? Math.abs(hy) > OFF_LANE : Math.abs(hx - lab.x) > OFF_LANE;
    if (off) {
      // la main sort de l'axe actif : une DIAGONALE — le drone refuse (une fois par glissé), il ne bouge pas
      if (!refusedRef.current) { refusedRef.current = true; setLab((s) => L.refuse(s)); }
      return;
    }
    refusedRef.current = false;
    setLab((s) => L.setActive(s, s.phase === 'x' ? hx : hy));
  };
  const down = (e) => {
    if (!live) return;
    const p = svgPoint(svgRef.current, e); if (!p) return;
    e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag(true);
    refusedRef.current = false;
    apply(p);
  };
  const move = (e) => {
    if (!drag) return;
    const p = svgPoint(svgRef.current, e); if (!p) return;
    apply(p);
  };
  const up = () => { setDrag(false); refusedRef.current = false; };
  const key = (e) => {
    if (!live) return;
    const m = { ArrowRight: ['x', 1], ArrowLeft: ['x', -1], ArrowUp: ['y', 1], ArrowDown: ['y', -1] }[e.key];
    if (m) { e.preventDefault(); setLab((s) => L.move(s, m[0], m[1])); return; }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLab((s) => (s.phase === 'x' ? L.lock(s) : L.record(s))); }
  };

  const things = [];
  if (!free && task.kind === 'read') {
    task.reads.forEach((r, i) => {
      const done = lab.log.some((e) => e.ri === i) || (locked && i <= lab.ri);
      const current = i === lab.ri && !locked;
      things.push(<Thing key={`t${i}`} what={r.what} x={r.x} y={r.y} state={done ? 'done' : current ? 'target' : 'idle'} id={`${task.id}-${i}`} />);
    });
  } else if (!free) {
    // fly : les lieux déjà photographiés apparaissent à leur place (jamais avant)
    lab.log.forEach((e) => things.push(<Thing key={`p${e.ri}`} what={task.reads[e.ri].what} x={e.x} y={e.y} state="done" id={`${task.id}-${e.ri}`} />));
    if (locked) { const e = lab.log.at(-1); if (e && !lab.log.some((l) => l.ri === lab.ri)) things.push(<Thing key="pl" what={task.reads[lab.ri].what} x={e.x} y={e.y} state="done" />); }
  }
  const refused = !free && lab.last?.kind === 'refuse';
  const aria = k(`knobAria.${axis}`);
  const lim = L.limitOf(axis);
  const valueText = k('knobValue', { p: P.pair(pos) });

  return (
    <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: W, display: 'block', margin: '0 auto', touchAction: 'none' }} role="img" aria-label={k('stageAria')} data-cd-svg dir="ltr"
      onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
      <Backdrop uid={uid} squared={squared} />
      <Axes squared={squared} />
      <Pole />
      {things}
      {!free && live && <Guides x={pos.x} y={pos.y} phase={lab.phase} squared={squared} />}
      {free && <Guides x={pos.x} y={pos.y} phase="y" squared />}
      {!free && live && <Feet x={pos.x} y={pos.y} phase={lab.phase} />}
      {live && <rect x={0} y={0} width={W} height={H} fill="transparent" onPointerDown={down} style={{ cursor: 'grab' }} data-cd-hit />}
      <g data-cd-knob data-x={pos.x} data-y={pos.y} role="slider" tabIndex={live ? 0 : -1} aria-label={aria} aria-valuemin={-lim} aria-valuemax={lim} aria-valuenow={axis === 'x' ? pos.x : pos.y} aria-valuetext={valueText}
        onKeyDown={key} onPointerDown={down} style={{ cursor: live ? 'grab' : 'default' }} className="cd-knob">
        <Drone x={pos.x} y={pos.y} held={drag} refused={refused} flying={live || free} />
      </g>
      {refused && <Refusal x={pos.x} y={pos.y} />}
      <Reading x={pos.x} y={pos.y} text={P.pair(pos)} tone="plain" />
    </svg>
  );
}

/* ══════════════ Les commandes : le carnet de lectures, la télécommande et « التقط الصورة » ══════════════ */

function Controls({ lab, setLab, k }) {
  const task = L.taskOf(lab);
  const done = L.taskDone(lab);
  const btn = `inline-flex min-h-[44px] items-center justify-center gap-1 rounded-2xl border-2 px-2.5 text-sm font-black disabled:opacity-40 ${ring}`;
  const arrow = `${btn} min-w-[40px] !px-1 border-sky-300 bg-white text-sky-900`;
  const inX = lab.phase === 'x';
  const press = (axis, n) => setLab((s) => L.move(s, axis, n));
  return (
    <LabCard className="space-y-1.5 p-2" data-cd-controls>
      <div className="flex flex-wrap items-center gap-1.5">
        <p data-cd-ask className={`min-w-0 flex-1 basis-40 rounded-xl border-2 px-3 py-1.5 text-base font-black leading-snug ${done ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-sky-500 bg-sky-50 text-sky-950'}`}>
          {done ? k('idle.done') : <MathText>{askText(k, task, task.reads[lab.ri])}</MathText>}
        </p>
        <ol className="flex shrink-0 flex-wrap gap-1" data-cd-reads aria-label={k('readsAria')}>
          {task.reads.map((r, i) => {
            const entry = lab.log.find((x) => x.ri === i);
            const state = entry ? 'done' : i === lab.ri && !done ? 'current' : 'todo';
            return (
              <li key={i} data-cd-read={i} data-state={state} title={k(`thing.${r.what}`)}
                className={`inline-flex min-h-[28px] min-w-[28px] items-center justify-center gap-1 rounded-full border-2 px-1.5 text-xs ${state === 'done' ? 'border-emerald-300 bg-emerald-50 font-bold text-emerald-900' : state === 'current' ? 'border-sky-500 bg-sky-50 font-black text-sky-950 ring-2 ring-sky-200' : 'border-slate-200 bg-white text-slate-500'}`}>
                {entry ? <span className="cd-pop" dir="ltr"><bdi>{P.pair(entry)}</bdi></span> : <span>{i + 1}</span>}
              </li>
            );
          })}
        </ol>
      </div>
      <div className="flex flex-wrap items-center gap-1.5" data-cd-remote dir="ltr">
        <div className="flex items-center gap-1" role="group" aria-label={k('pad.horizontal')} data-cd-pad="x">
          <button type="button" onClick={() => press('x', -1)} disabled={done} data-cd-left aria-label={k('pad.left')} className={`${arrow} ${inX ? '' : 'opacity-60'}`}><ChevronLeft className="h-4 w-4" aria-hidden="true" /></button>
          <button type="button" onClick={() => press('x', 1)} disabled={done} data-cd-right aria-label={k('pad.right')} className={`${arrow} ${inX ? '' : 'opacity-60'}`}><ChevronRight className="h-4 w-4" aria-hidden="true" /></button>
        </div>
        <div className="flex items-center gap-1" role="group" aria-label={k('pad.vertical')} data-cd-pad="y">
          <button type="button" onClick={() => press('y', -1)} disabled={done} data-cd-down aria-label={k('pad.down')} className={`${arrow} ${inX ? 'opacity-60' : ''}`}><ChevronDown className="h-4 w-4" aria-hidden="true" /></button>
          <button type="button" onClick={() => press('y', 1)} disabled={done} data-cd-up aria-label={k('pad.up')} className={`${arrow} ${inX ? 'opacity-60' : ''}`}><ChevronUp className="h-4 w-4" aria-hidden="true" /></button>
        </div>
        {inX
          ? <button type="button" onClick={() => setLab(L.lock)} disabled={done} data-cd-lock dir="rtl" className={`${btn} border-indigo-600 bg-indigo-600 text-white shadow-[0_3px_0_0_#3730A3]`}><Lock className="h-4 w-4" aria-hidden="true" /> {k('lock')}</button>
          : <button type="button" onClick={() => setLab(L.unlock)} disabled={done} data-cd-unlock dir="rtl" className={`${btn} border-indigo-300 bg-white text-indigo-900`}><Unlock className="h-4 w-4" aria-hidden="true" /> {k('unlock')}</button>}
        <button type="button" onClick={() => setLab(L.record)} disabled={done || inX} data-cd-record dir="rtl" className={`${btn} border-sky-600 bg-sky-600 text-white shadow-[0_3px_0_0_#0369A1]`}>
          <Camera className="h-4 w-4" aria-hidden="true" /> {k('record')}
        </button>
      </div>
    </LabCard>
  );
}

/* ══════════════ « جرّب أعدادك » : toujours ouvert ══════════════ */

function FreeCard({ lab, setLab, k }) {
  const free = L.isFree(lab);
  const [tx0, setTx] = useState('');
  const [ty0, setTy] = useState('');
  useEffect(() => { if (!lab.free) { setTx(''); setTy(''); } }, [lab.free]);
  const badX = tx0.trim() !== '' && L.parseCoord(tx0, L.FREE_LIMIT.x) === null;
  const badY = ty0.trim() !== '' && L.parseCoord(ty0, L.FREE_LIMIT.y) === null;
  const info = L.freeInfo(lab);
  const clean = (raw) => raw.replace(/[^0-9٠-٩+\-−.,٫،\s]/g, '').slice(0, 5);
  const onX = (e) => { const raw = clean(e.target.value); setTx(raw); const y = ty0.trim() === '' ? '0' : ty0; setLab((s) => L.setFree(s, raw, y)); };
  const onY = (e) => { const raw = clean(e.target.value); setTy(raw); const x = tx0.trim() === '' ? '0' : tx0; setLab((s) => L.setFree(s, x, raw)); };
  const inputCls = (bad) => `h-11 w-24 rounded-xl border-2 ${bad ? 'border-rose-300' : 'border-emerald-300'} bg-white px-3 text-center text-lg font-black tabular-nums text-indigo-950 ${ring}`;
  return (
    <LabCard className="space-y-2 border-emerald-200 bg-emerald-50/50 p-3" data-cd-free data-active={free ? 'true' : 'false'}>
      <p className="flex items-center gap-1.5 text-sm font-black text-emerald-900"><FlaskConical className="h-4 w-4" aria-hidden="true" /> {k('free.title')}</p>
      <p className="text-xs font-bold leading-snug text-slate-600"><MathText>{free ? k('free.on') : k('free.hint')}</MathText></p>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-1.5 text-sm font-black text-slate-700">
          <span>{k('free.x')}</span>
          <input type="text" inputMode="decimal" autoComplete="off" dir="ltr" value={tx0} onChange={onX} aria-label={k('free.xAria')} aria-invalid={badX} data-cd-free-x placeholder="−2" className={inputCls(badX)} />
        </label>
        <label className="flex items-center gap-1.5 text-sm font-black text-slate-700">
          <span>{k('free.y')}</span>
          <input type="text" inputMode="decimal" autoComplete="off" dir="ltr" value={ty0} onChange={onY} aria-label={k('free.yAria')} aria-invalid={badY} data-cd-free-y placeholder="3" className={inputCls(badY)} />
        </label>
        {(badX || badY) && <span className="text-xs font-bold text-rose-700"><MathText>{k('free.bad')}</MathText></span>}
        {free && info && (
          <span className="text-xs font-black text-emerald-900" data-cd-free-info>
            <MathText>{info.swapSame ? k('free.infoSame', { p: pt(info.p), axis: info.axis ? k(`free.axis.${info.axis}`) : k('free.axis.none') })
              : k('free.info', { p: pt(info.p), s: pt(info.swapped), axis: info.axis ? k(`free.axis.${info.axis}`) : k('free.axis.none') })}</MathText>
          </span>
        )}
        {free && (
          <button type="button" onClick={() => setLab(L.toGuided)} data-cd-free-back
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

/** Ce que l'élève a trouvé, écrit avec SES nombres : G(−3 ; 2), K(2 ; −4) (مبتدئ) ou A(2,5 ; −1,5), B(−1 ; 0,5) (متقدم). */
export function Formal({ lab, k, advanced }) {
  const task = lab.tasks.find((tk) => (advanced ? tk.id === 'a3' : tk.id === 'b3')) ?? lab.tasks.at(-1);
  const names = advanced ? ['A', 'B'] : ['G', 'K'];
  const pts = task.reads.slice(0, 2);
  return (
    <div className="space-y-2 text-sm font-bold text-emerald-950" data-cd-formal={advanced ? 'both' : 'rule'}>
      <p className="text-center text-base" dir="ltr"><MathText>{$(pts.map((p, i) => `${names[i]}${P.pairTex(p)}`).join('\\,;\\,'))}</MathText></p>
      <p><MathText>{k(advanced ? 'formal.both' : 'formal.rule')}</MathText></p>
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite d'une tâche (par son id : les tâches viennent de la leçon). La dernière tâche de chaque niveau finit par LA RÈGLE. */
export const CHAINS = Object.freeze({
  b1: ['swapped', 'firstAxis'],
  b2: ['axisZero', 'abscissaZero'],
  b3: ['gate', 'ruleA'],
  a1: ['halfRead'],
  a2: ['plainGuide'],
  a3: ['between', 'ruleB'],
});

/** Une question à trois options décrite par ses clés de chaîne `cp.<id>.*` ; `vars` sont les nombres de l'élève. */
const choice = (k, id, vars, at, extra = {}) => ({
  id, kind: 'choice', prompt: Mx(k, `${id}.prompt`, vars),
  options: opt([Mx(k, `${id}.right`, vars), Mx(k, `${id}.wrongA`, vars), Mx(k, `${id}.wrongB`, vars)], 0, [null, Mx(k, `${id}.whyA`, vars), Mx(k, `${id}.whyB`, vars)], at),
  hints: [Mx(k, `${id}.hint1`, vars), Mx(k, `${id}.hint2`, vars)], explain: Mx(k, `${id}.explain`, vars), ...extra,
});

/** Les nombres de l'élève : pour chacune des deux premières lectures `p`, son couple ; `s`, l'échangé ; `x` et `y` ; `nx`, l'abscisse changée de signe ; `ny`, l'ordonnée changée de signe. */
function varsOf(task, k) {
  const out = {};
  task.reads.slice(0, 2).forEach((r, i) => {
    const n = i + 1;
    out[`p${n}`] = pt(r); out[`s${n}`] = pt(P.swap(r)); out[`x${n}`] = `$${P.tex(r.x)}$`; out[`y${n}`] = `$${P.tex(r.y)}$`;
    out[`nx${n}`] = pt({ x: -r.x, y: r.y }); out[`ny${n}`] = pt({ x: r.x, y: -r.y });
    out[`thing${n}`] = k(`thing.${r.what}`);
    out[`ax${n}`] = `$${P.tex(Math.abs(r.x))}$`; out[`ay${n}`] = `$${P.tex(Math.abs(r.y))}$`;
    const lo = P.floorTick(r.x);
    out[`lo${n}`] = `$${P.tex(lo)}$`; out[`hi${n}`] = `$${P.tex(lo + P.TENTH)}$`; out[`blo${n}`] = `$${P.tex(lo - P.TENTH)}$`; out[`up${n}`] = `$${P.tex(lo + 2 * P.TENTH)}$`;
    out[`rlo${n}`] = P.tex(lo); out[`rhi${n}`] = P.tex(lo + P.TENTH); out[`rx${n}`] = P.tex(r.x);
  });
  return out;
}
const at = { swapped: 0, firstAxis: 2, axisZero: 1, abscissaZero: 2, gate: 1, halfRead: 2, plainGuide: 0, between: 1 };

export const QUESTIONS = {
  swapped: (lab, task, k) => choice(k, 'swapped', varsOf(task, k), at.swapped),
  firstAxis: (lab, task, k) => choice(k, 'firstAxis', varsOf(task, k), at.firstAxis),
  axisZero: (lab, task, k) => choice(k, 'axisZero', varsOf(task, k), at.axisZero),
  abscissaZero: (lab, task, k) => choice(k, 'abscissaZero', varsOf(task, k), at.abscissaZero),
  gate: (lab, task, k) => choice(k, 'gate', varsOf(task, k), at.gate),
  halfRead: (lab, task, k) => choice(k, 'halfRead', varsOf(task, k), at.halfRead),
  plainGuide: (lab, task, k) => choice(k, 'plainGuide', varsOf(task, k), at.plainGuide),
  between: (lab, task, k) => choice(k, 'between', varsOf(task, k), at.between),
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
