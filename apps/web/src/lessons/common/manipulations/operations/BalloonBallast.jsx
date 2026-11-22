import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Hand, CheckCircle2, Sparkles, ChevronLeft, FlaskConical, Undo2, Plus, Minus } from 'lucide-react';
import { resolveLevelId } from '@smarter-academy/core/curriculum/manipulationLevels.js';
import * as R from '@smarter-academy/core/arithmetic/relative.js';
import MathText from '../../components/MathText';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
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
import { Backdrop, AltitudeScale, Flame, Sack, Balloon, Guide } from './balloonBallast/art';
import { LEVELS } from '../levels';
import * as L from '../logic/balloonBallast';

/**
 * balloon-ballast — LA CHARGE SOUS LA MAIN (2AM, unité 3 « الأعداد النسبية », درس « جمع وطرح عددين نسبيين », 2026-10-29).
 * La logique, exacte, est dans `logic/balloonBallast.js` (sur `packages/core/arithmetic/relative.js`, importé par chemin).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. La main tient la CHARGE de la nacelle : attacher / jeter une flamme (+1 m) ou un sac (−1 m), à متقدم attacher une paire neutre. Trois chemins : glisser un objet du rayon sur la scène (attacher) ou le sortir de la nacelle
 *    (jeter) ; les boutons « اربط / ارمِ » sous chaque bac ; le clavier (T / S attachent, Shift+T / Shift+S jettent, P attache une paire).
 * B. L'altitude = flammes − sacs est une SORTIE : le montgolfière bouge d'un mètre par objet, sur l'échelle de droite.
 * C. La résistance : une flamme et un sac ensemble ne changent rien (paire verrouillée, lumineuse) ; on ne peut pas jeter ce que la nacelle ne porte pas — on attache d'abord des paires neutres.
 * D. La phase formelle écrit ce que l'élève a trouvé avec SES cartes (la dernière question du labo, la règle).
 * E. Les fausses réponses sont rendues VISIBLES : le montgolfière fantôme à l'altitude écrite ; le journal rouge quand les gestes ne sont pas ceux de la carte.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        somme de deux relatifs = charge finale d'une nacelle ; différence = jeter une charge = attacher son opposé
 *   OBJECT         un montgolfière, des flammes (+1), des sacs (−1), des paires neutres
 *   VARIABLE       la charge (flammes, sacs) par quatre gestes (+ la paire)
 *   INVARIANT      la carte a ± b et la charge de départ (a)
 *   TRANSFORMATION attacher = ajouter ; jeter = retirer ; la paire n'ajoute rien
 *   CONSTRAINT     on ne jette que ce qui est à bord ; au plus 24 de chaque
 *   RESISTANCE     les paires qui s'annulent ; l'objet absent qu'on veut jeter
 *   EVIDENCE       l'échelle d'altitude, les paires lumineuses, le journal, le fantôme d'une erreur
 *   PREDICTION     متقدم : l'altitude est écrite AVANT d'exécuter la carte
 *   FORMALIZATION  « (+5) − (−7) = (+5) + (+7) = (+12) » avec les cartes de l'élève
 *   TRANSFER       « جرّب أعدادك » (toujours ouvert), les exercices et la banque
 *
 * ONBOARDING : `coach` → `LabCoach` ; `logic › coachOf`. QUESTIONS PENDANT LE LABO (`LabCheckpoint`) : `CHAINS` + `QUESTIONS`, après CHAQUE tâche, avec SES nombres ; la dernière suite de chaque niveau finit par LA RÈGLE.
 * ÉTAPES : `LabStepper` (`[data-bb-step=<i>]`) + la fête. « إعادة » : tâche 1. Props : `tasks`, `level`, `levels`, `coach`, `title`, `lead`, `onTrial(event)`, `onFinished({})`.
 *
 * CONTRAT DOM : [data-balloon-ballast][data-level][data-task][data-altitude][data-solved], [data-bb-glance], [data-bb-stage], [data-bb-svg], [data-bb-balloon][data-value], [data-bb-basket],
 * [data-bb-token=<i>][data-paired], [data-bb-bag=<i>][data-paired], [data-bb-shelf=token|bag|pair], [data-bb-tie=token|bag|pair], [data-bb-throw=token|bag], [data-bb-log], [data-bb-answer], [data-bb-check],
 * [data-bb-ghost][data-model], [data-bb-verdict], [data-bb-next], [data-bb-step=<i>], [data-bb-free], [data-bb-free-a|op|b], [data-bb-free-back], [data-bb-formal], [data-bb-kid][data-mood].
 */
const NS = 'manipulation.balloonBallast';
const LRI = '⁦';
const PDI = '⁩';
const iso = (s) => `${LRI}${String(s).replace(/-/g, '−')}${PDI}`;
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-amber-300';
const SCENE_H = 220;
const Y0 = 116;
const U = 4.2;

const CSS = `
@keyframes bb-pop { 0% { transform: scale(0.85); } 70% { transform: scale(1.06); } 100% { transform: scale(1); } }
.bb-pop { animation: bb-pop 240ms ease-out both; display: inline-block; }
@keyframes bb-ghost { 0%,100% { opacity: .55; } 50% { opacity: .95; } }
.bb-ghost { animation: bb-ghost 1.6s ease-in-out infinite; }
@keyframes bb-blink { 0%,100% { opacity: 1; } 50% { opacity: .35; } }
.bb-blink { animation: bb-blink 0.9s ease-in-out 3; }
.bb-rise { transition: transform 420ms cubic-bezier(.3,1.3,.5,1); }
@media (prefers-reduced-motion: reduce) { .bb-pop, .bb-ghost, .bb-blink { animation: none !important; } .bb-rise { transition: none !important; } }
`;

export function numbersFor({ tasks, level }) {
  const lv = resolveLevelId(level ?? 'beginner');
  const asked = LEVELS['balloon-ballast'][lv].numbers;
  return { tasks: tasks ?? asked.tasks };
}

export default function BalloonBallast({
  tasks, title, lead, level, levels: withLevels = true, coach: coachOn = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const initialNumbers = useMemo(() => numbersFor({ tasks, level }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'balloon-ballast', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
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
  const advanced = !!lab.tasks[lab.tasks.length - 1].predict;
  const cpSettings = useLabCheckpointSettings('balloon-ballast');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const chain = cpOn && cpSettings.enabled && !L.isFree(lab) ? CHAINS[cur.id] ?? null : null;
  const isRule = (q) => q === 'ruleSum' || q === 'ruleDiff';
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
    lab: 'balloon-ballast', step: coachStep,
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
  void vp;

  const discovery = (
    <ManipulationDiscovery state={state} prompt={<MathText>{k(`discovery.${advanced ? 'diff' : 'sum'}.prompt`)}</MathText>} options={ruleOptions(lab, k, advanced)} formal={<Formal lab={lab} k={k} advanced={advanced} />} />
  );

  return (
    <ManipulationShell
      type="balloon-ballast"
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
        <div ref={boxRef} className="space-y-2" data-balloon-ballast data-level={advanced ? 'advanced' : 'beginner'} data-task={lab.free ? 'free' : lab.ti}
          data-altitude={L.altitude(lab)} data-solved={finished ? 'true' : 'false'}>
          <style dangerouslySetInnerHTML={{ __html: CSS }} />
          <Lab lab={lab} setLab={setLab} k={k} width={width} lead={state.isAuthoredLevel ? lead : null} cp={cp} advanced={advanced} />
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ══════════════ Textes des cartes et du journal ══════════════ */

const sg = (h) => `(${h < 0n ? '-' : '+'}${R.text(h < 0n ? -h : h)})`;
export const cardTex = (a, op, b) => `\${${sg(a)}${op === '+' ? '+' : '-'}${sg(b)}}$`;
const needLine = (k, need) => k(`need.${need.g}.${need.object}`, { n: need.n });
const didLine = (k, log) => {
  const parts = [];
  for (const g of ['tie', 'throw']) for (const o of ['token', 'bag']) {
    const n = log.filter((e) => e.g === g && e.object === o).length;
    if (n) parts.push(k(`did.${g}.${o}`, { n }));
  }
  const pairs = log.filter((e) => e.g === 'pair').length;
  if (pairs) parts.push(k('did.pair', { n: pairs }));
  return parts.length ? parts.join(k('and')) : k('did.none');
};

/* ══════════════ Le laboratoire ══════════════ */

function Lab({ lab, setLab, k, width, lead, cp, advanced }) {
  const task = L.taskOf(lab);
  const free = L.isFree(lab);
  const done = L.taskDone(lab);
  const lit = !free && done;
  const last = lab.last;

  const ctx = free ? k('ctx.free') : (lead && lab.ti === 0 ? lead : k(`ctx.${task.id}`));
  const question = free ? k('q.free') : k(`q.${task.id}`);

  const stepDone = lab.tasks.map((_, i) => !!lab.done[i] && (i !== lab.ti || !cp.blocking));
  const steps = lab.tasks.length > 1 && !free && <LabStepper count={lab.tasks.length} current={lab.ti} done={stepDone} stepAttr="data-bb-step" />;
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.trials.length === 0 && celebrated.current.size) celebrated.current = new Set();
  const nowDone = !free && stepDone[lab.ti];
  useEffect(() => {
    if (!nowDone || celebrated.current.has(lab.ti)) return;
    celebrated.current.add(lab.ti);
    party.celebrate({ n: lab.ti + 1, total: lab.tasks.length });
  }, [nowDone, lab.ti]); // eslint-disable-line react-hooks/exhaustive-deps

  // le son (muet sauf « الصوت ») : un déclic par geste, la cloche quand une paire se verrouille, le drapeau quand c'est juste, « over » sur un refus
  const nTrials = lab.trials.length;
  const pairsRef = useRef(L.lockedPairs(lab));
  useEffect(() => {
    if (!nTrials) { pairsRef.current = L.lockedPairs(lab); return; }
    const tr = lab.trials[nTrials - 1];
    if (tr.free && tr.kind === 'custom') return;
    if (tr.kind === 'gesture') {
      if (tr.ok === false) playSfx('over');
      else {
        playSfx('gesture', { pitch: tr.g === 'throw' ? 0.75 : 1 });
        if (L.lockedPairs(lab) > pairsRef.current) playSfx('bell');
      }
    } else if (tr.kind === 'answer' || tr.kind === 'predict') playSfx(tr.ok ? 'flag' : 'over');
    pairsRef.current = L.lockedPairs(lab);
  }, [nTrials]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (done && !free) playSfx('bell'); }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  const prompt = (
    <PromptCard size={width >= 600 ? 'lg' : 'md'} aside={steps || null} context={<MathText>{ctx}</MathText>} contextProps={{ 'data-bb-context': free ? 'free' : task.id }}
      title={<MathText>{question}</MathText>} titleClassName={width >= 600 ? 'text-lg' : 'text-base'} lamp={free ? null : lit ? 'on' : 'off'}
      titleProps={{ 'data-bb-prompt': free ? 'free' : task.id, 'data-lit': lit ? 'true' : 'false' }} />
  );

  /* ── le verdict : la CONSÉQUENCE avec les nombres de l'élève, jamais la règle ── */
  const verdictLine = (() => {
    if (!last) return k(!free && task.predict && lab.phase === 'predict' ? 'idlePredict' : 'idle');
    if (last.kind === 'gesture') return last.ok ? k('v.gesture', { alt: iso(L.altitude(lab)) }) : k('v.refused', { obj: k(`obj.${last.object}`) });
    if (last.kind === 'predict') return last.ok ? k('v.predictOk', { a: iso(last.value) }) : k(`w.${last.model}`, { typed: iso(last.value) });
    if (last.kind === 'answer') {
      if (last.ok) return k('v.answerOk', { a: iso(last.value) });
      if (last.model === 'wrongGesture') return k('w.wrongGesture', { need: needLine(k, task.need), did: didLine(k, lab.log) });
      return k(`w.${last.model}`, { typed: iso(last.value) });
    }
    if (last.kind === 'custom') return k('v.custom');
    return k('idle');
  })();
  const bad = !!last && last.ok === false && !last.free;
  const good = !!last && last.ok === true && !last.free && last.kind !== 'gesture';
  const tone = bad ? 'amber' : good ? 'emerald' : 'indigo';
  const Icon = bad ? Sparkles : good ? CheckCircle2 : Hand;
  const canNext = L.canNext(lab) && !cp.blocking;
  const mood = bad ? 'wonder' : done ? 'proud' : 'happy';
  const banner = (
    <VerdictBanner tone={tone} icon={Icon} size="sm" className="min-h-[3.2rem]" data-bb-verdict={bad ? 'wrong' : good ? 'right' : last?.free ? 'free' : ''}>
      <div className="flex min-w-0 items-center gap-2">
        <svg width={40} height={50} viewBox="0 0 40 52" aria-hidden="true" data-bb-kid data-mood={mood} className="shrink-0">
          <Guide x={20} y={50} mood={mood} girl={!(free ? advanced : task.predict)} />
        </svg>
        <div className="min-w-0 space-y-1.5">
          <p className={last ? '' : 'font-bold text-indigo-900'}>{verdictLine}</p>
          {canNext && (
            <button type="button" onClick={() => setLab(L.nextTask)} data-bb-next
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
      <div className="relative space-y-2" data-bb-glance>
        {party.node}
        {cp.node}
        {prompt}
        <StageFrame className="min-w-0 overflow-hidden p-2" data-bb-stage>
          <Stage lab={lab} setLab={setLab} k={k} width={Math.max(300, width - 16)} />
        </StageFrame>
        <Shelf lab={lab} setLab={setLab} k={k} advanced={advanced} />
        <CardRow lab={lab} setLab={setLab} k={k} advanced={advanced} />
        {banner}
      </div>
      <FreeCard lab={lab} setLab={setLab} k={k} />
    </>
  );
}

/* ══════════════ La scène : le plateau, le montgolfière et sa charge ══════════════ */

/** tap / glisser : `act` se déclenche au tapotement OU quand l'objet est glissé de plus de 28 px. */
function useTapOrDrag(act, minDist = 28) {
  const start = useRef(null);
  const suppress = useRef(false);
  return {
    onPointerDown: (e) => { start.current = { x: e.clientX, y: e.clientY }; suppress.current = false; },
    onPointerUp: (e) => {
      const s = start.current; start.current = null;
      if (s && Math.hypot(e.clientX - s.x, e.clientY - s.y) > minDist) { suppress.current = true; act(); }
    },
    onClick: (e) => { e.stopPropagation(); if (suppress.current) { suppress.current = false; return; } act(); },
  };
}

function Obj({ kind, i, x, y, r, paired, onAct }) {
  const h = useTapOrDrag(onAct);
  const Art = kind === 'token' ? Flame : Sack;
  return (
    <g {...h} data-bb-token={kind === 'token' ? i : undefined} data-bb-bag={kind === 'bag' ? i : undefined} data-paired={paired ? 'true' : 'false'} style={{ cursor: 'pointer', touchAction: 'none' }}
      className={paired ? 'bb-blink' : undefined}>
      <rect x={x - r - 2} y={y - r - 2} width={(r + 2) * 2} height={(r + 2) * 2} fill="transparent" />
      <Art x={x} y={y} r={r} lit={paired} />
    </g>
  );
}

function Stage({ lab, setLab, k, width }) {
  const uid = `bb${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const W = width;
  const H = SCENE_H;
  const plate = Math.max(54, W * 0.17);
  const xc = (plate + W - 36) / 2;
  const alt = L.altitude(lab);
  const yBase = Y0 - alt * U;
  const rows = Math.max(lab.t, lab.s);
  const sp = Math.max(4, Math.min(8, (H - 4 - yBase - 7) / Math.max(rows - 1, 1)));
  const r = Math.min(4.6, sp * 0.62);
  const pairs = L.lockedPairs(lab);
  const ghost = lab.ghost && !L.taskDone(lab) ? lab.ghost : null;
  const gAlt = ghost ? Math.max(-13, Math.min(13, ghost.at)) : 0;
  const key = (e) => {
    const map = { t: ['tie', 'token'], s: ['tie', 'bag'], T: ['throw', 'token'], S: ['throw', 'bag'] };
    const kk = e.key === 'p' || e.key === 'P' ? 'pair' : e.key.toLowerCase() === 't' ? (e.shiftKey ? 'T' : 't') : e.key.toLowerCase() === 's' ? (e.shiftKey ? 'S' : 's') : null;
    if (!kk) return;
    e.preventDefault();
    if (kk === 'pair') setLab(L.tiePair); else setLab((s) => L.apply(s, map[kk][0], map[kk][1]));
  };
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: W, display: 'block', margin: '0 auto', touchAction: 'pan-y' }} role="img" aria-label={k('stageAria')} data-bb-svg dir="ltr">
      <Backdrop W={W} H={H} y0={Y0} uid={uid} />
      <AltitudeScale x={W - 34} y0={Y0} u={U} />
      {/* le guide : la ligne qui relie la nacelle à l'échelle */}
      <line x1={xc + 20} x2={W - 34} y1={yBase} y2={yBase} stroke="#0F766E" strokeWidth={1.2} strokeDasharray="3 3" />
      {ghost && (
        <g className="bb-ghost" data-bb-ghost data-model={ghost.kind}>
          <Balloon x={xc} yBase={Y0 - gAlt * U} ghost />
          <line x1={xc + 20} x2={W - 34} y1={Y0 - gAlt * U} y2={Y0 - gAlt * U} stroke="#B45309" strokeWidth={1.4} strokeDasharray="2 3" />
        </g>
      )}
      <g className="bb-rise" data-bb-balloon data-value={alt}>
        <Balloon x={xc} yBase={yBase} />
        {/* la charge : une flamme à gauche, un sac à droite sur chaque rangée de cordes */}
        <g data-bb-basket tabIndex={0} role="group" aria-label={k('basketAria', { alt: iso(alt) })} onKeyDown={key} style={{ outline: 'none' }}>
          <rect x={xc - 30} y={yBase} width={60} height={Math.max(8, rows * sp + 6)} fill="transparent" />
          {Array.from({ length: rows }, (_, i) => {
            const y = yBase + 7 + i * sp;
            const hasT = i < lab.t; const hasS = i < lab.s;
            const paired = hasT && hasS && i < pairs;
            return (
              <g key={i}>
                <line x1={xc - 12} x2={xc - 12} y1={y - sp} y2={y} stroke="#475569" strokeWidth={0.8} />
                <line x1={xc + 12} x2={xc + 12} y1={y - sp} y2={y} stroke="#475569" strokeWidth={0.8} />
                {paired && <line x1={xc - 12} x2={xc + 12} y1={y} y2={y} stroke="#CA8A04" strokeWidth={1.6} />}
                {hasT && <Obj kind="token" i={i} x={xc - 12} y={y} r={r} paired={paired} onAct={() => setLab((s) => L.throwOut(s, 'token'))} />}
                {hasS && <Obj kind="bag" i={i} x={xc + 12} y={y} r={r} paired={paired} onAct={() => setLab((s) => L.throwOut(s, 'bag'))} />}
              </g>
            );
          })}
        </g>
      </g>
      <text x={plate - 4} y={Y0 - 5} textAnchor="end" fontSize={10} fontWeight={900} fill="#7F1D1D">{k('edge')}</text>
    </svg>
  );
}

/* ══════════════ Le rayon : deux bacs et la paire neutre ══════════════ */

function Bin({ kind, lab, setLab, k }) {
  const tie = () => setLab((s) => (kind === 'pair' ? L.tiePair(s) : L.tie(s, kind)));
  const throwIt = () => setLab((s) => L.throwOut(s, kind));
  const h = useTapOrDrag(tie);
  const open = L.gesturesOpen(lab);
  const aboard = kind === 'token' ? lab.t : kind === 'bag' ? lab.s : Math.min(lab.t, lab.s);
  const Art = kind === 'token' ? Flame : kind === 'bag' ? Sack : null;
  return (
    <LabCard className="flex min-w-0 flex-1 flex-col items-center gap-1 p-1.5" data-bb-shelf={kind}>
      <div className="flex items-center gap-1.5">
        <svg width={44} height={30} viewBox="0 0 44 30" aria-hidden="true" {...h} style={{ cursor: open ? 'grab' : 'not-allowed', touchAction: 'none' }} data-bb-bin-art={kind}>
          {Art ? <Art x={22} y={16} r={8} /> : (<g><Flame x={14} y={16} r={7} /><Sack x={30} y={16} r={7} /><line x1={14} x2={30} y1={16} y2={16} stroke="#CA8A04" strokeWidth={1.6} /></g>)}
        </svg>
        <span className="text-[11px] font-black leading-tight text-slate-800">{k(`bin.${kind}`)}</span>
        <span className="min-w-[22px] rounded-full bg-slate-100 px-1.5 text-center text-xs font-black text-slate-700" data-bb-count={kind} aria-label={k('aboard')}><bdi dir="ltr">{aboard}</bdi></span>
      </div>
      <div className="flex items-center gap-1" dir="ltr">
        {kind !== 'pair' && (
          <button type="button" onClick={throwIt} disabled={!open || aboard <= 0} aria-label={k(`bin.throw.${kind}`)} data-bb-throw={kind}
            className={`flex h-11 min-w-[44px] items-center justify-center gap-0.5 rounded-full border-2 border-slate-300 bg-white px-2 text-xs font-black text-slate-800 disabled:opacity-40 ${ring}`}><Minus className="h-4 w-4" aria-hidden="true" />{k('throwWord')}</button>
        )}
        <button type="button" onClick={tie} disabled={!open} aria-label={k(`bin.tie.${kind}`)} data-bb-tie={kind}
          className={`flex h-11 min-w-[44px] items-center justify-center gap-0.5 rounded-full border-2 border-amber-600 bg-amber-500 px-2 text-xs font-black text-white disabled:opacity-40 ${ring}`}><Plus className="h-4 w-4" aria-hidden="true" />{k('tieWord')}</button>
      </div>
    </LabCard>
  );
}

function Shelf({ lab, setLab, k }) {
  const showPair = lab.tasks.some((tk) => tk.predict) || L.isFree(lab);
  return (
    <div className="flex items-stretch gap-1.5" data-bb-shelves>
      <Bin kind="token" lab={lab} setLab={setLab} k={k} />
      <Bin kind="bag" lab={lab} setLab={setLab} k={k} />
      {showPair && <Bin kind="pair" lab={lab} setLab={setLab} k={k} />}
    </div>
  );
}

/* ══════════════ La carte, le journal et l'altitude écrite ══════════════ */

function CardRow({ lab, setLab, k }) {
  const [text, setText] = useState('');
  const free = L.isFree(lab);
  const task = L.taskOf(lab);
  const done = L.taskDone(lab);
  useEffect(() => { setText(''); }, [lab.ti, lab.phase, free]);
  const predicting = !free && !!task.predict && lab.phase === 'predict';
  const can = !free && !done && (predicting || (!task.predict && lab.phase === 'act'));
  const submit = () => { if (text.trim() && can) setLab((s) => (predicting ? L.predict(s, text) : L.answer(s, text))); };
  const need = free ? L.freeNeed(lab) : task.need;
  const gj = free ? null : L.gestureJudge(task, lab.log);
  const wrong = !!gj && (gj.wrong > 0 || gj.over || (lab.last?.kind === 'answer' && lab.last.model === 'wrongGesture'));
  const card = free ? cardTex(lab.free.a, lab.free.op, lab.free.b) : cardTex(task.a, task.op, task.b);
  return (
    <LabCard className="space-y-1.5 p-2" data-bb-controls>
      <div className="flex flex-wrap items-center gap-2">
        {free && <span className="rounded-xl bg-amber-100 px-2.5 py-1 text-base font-black text-amber-950" data-bb-card dir="ltr"><MathText>{card}</MathText></span>}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {!free && (
            <>
              <label className="flex items-center gap-1.5 text-sm font-black text-indigo-950">
                <span className="whitespace-nowrap">{k(predicting ? 'predictLabel' : 'askLabel')}</span>
                <input type="text" inputMode="numeric" autoComplete="off" dir="ltr" value={text} disabled={!can} maxLength={4}
                  onChange={(e) => setText(e.target.value.replace(/[^0-9٠-٩\-−+]/g, ''))}
                  onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
                  aria-label={k('answerAria')} data-bb-answer
                  className={`h-11 w-20 rounded-xl border-2 border-indigo-300 bg-white px-2 text-center text-xl font-black tabular-nums text-indigo-950 disabled:bg-slate-100 ${ring}`} />
              </label>
              <button type="button" onClick={submit} disabled={!can || !text.trim()} data-bb-check
                className={`inline-flex min-h-[44px] items-center justify-center rounded-2xl border-2 border-indigo-600 bg-indigo-600 px-4 text-sm font-black text-white shadow-[0_3px_0_0_#3730A3] disabled:opacity-40 ${ring}`}>{k('check')}</button>
            </>
          )}
          {free && <span className="text-sm font-black text-indigo-950" data-bb-free-alt>{k('altNow')} <bdi dir="ltr" className="text-lg tabular-nums">{String(L.altitude(lab)).replace(/-/g, '−')}</bdi></span>}
        </div>
      </div>
      {need && (
        <p className={`text-xs font-bold leading-snug ${wrong ? 'text-rose-700' : 'text-slate-600'}`} data-bb-log data-wrong={wrong ? 'true' : 'false'}>
          {k('log.card', { need: needLine(k, need) })}
          {!free && lab.log.length > 0 && <> — {k('log.did', { did: didLine(k, lab.log) })}</>}
        </p>
      )}
    </LabCard>
  );
}

/* ══════════════ « جرّب أعدادك » : toujours ouvert ══════════════ */

function FreeCard({ lab, setLab, k }) {
  const free = L.isFree(lab);
  const [a, setA] = useState('');
  const [op, setOp] = useState('+');
  const [b, setB] = useState('');
  useEffect(() => { if (!lab.free) { setA(''); setB(''); } }, [lab.free]);
  const bad = (a.trim() !== '' || b.trim() !== '') && !L.parseFree(a || 'x', op, b || 'x');
  const apply = (na, no, nb) => { if (L.parseFree(na, no, nb)) setLab((s) => L.setFree(s, na, no, nb)); };
  const inputCls = `h-11 w-16 rounded-xl border-2 ${bad ? 'border-rose-300' : 'border-emerald-300'} bg-white px-2 text-center text-lg font-black tabular-nums text-indigo-950 ${ring}`;
  return (
    <LabCard className="space-y-2 border-emerald-200 bg-emerald-50/50 p-3" data-bb-free data-active={free ? 'true' : 'false'}>
      <p className="flex items-center gap-1.5 text-sm font-black text-emerald-900"><FlaskConical className="h-4 w-4" aria-hidden="true" /> {k('free.title')}</p>
      <p className="text-xs font-bold leading-snug text-slate-600">{free ? k('free.on') : k('free.hint')}</p>
      <div className="flex flex-wrap items-center gap-2" dir="ltr">
        <input type="text" inputMode="numeric" autoComplete="off" value={a} aria-label={k('free.aAria')} data-bb-free-a maxLength={3} className={inputCls}
          onChange={(e) => { const v = e.target.value.replace(/[^0-9\-−]/g, ''); setA(v); apply(v, op, b); }} />
        <button type="button" onClick={() => { const n = op === '+' ? '-' : '+'; setOp(n); apply(a, n, b); }} aria-label={k('free.opAria')} data-bb-free-op
          className={`flex h-11 w-11 items-center justify-center rounded-full border-2 border-emerald-600 bg-white text-xl font-black text-emerald-900 ${ring}`}>{op === '+' ? '+' : '−'}</button>
        <input type="text" inputMode="numeric" autoComplete="off" value={b} aria-label={k('free.bAria')} data-bb-free-b maxLength={3} className={inputCls}
          onChange={(e) => { const v = e.target.value.replace(/[^0-9\-−]/g, ''); setB(v); apply(a, op, v); }} />
        {bad && <span className="text-xs font-bold text-rose-700" dir="rtl">{k('free.bad')}</span>}
        {free && (
          <button type="button" onClick={() => setLab(L.toGuided)} data-bb-free-back dir="rtl"
            className={`inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-emerald-200 bg-white px-3 text-xs font-bold text-emerald-900 ${ring}`}>
            <Undo2 className="h-4 w-4" aria-hidden="true" /> {k('free.back')}
          </button>
        )}
      </div>
    </LabCard>
  );
}

/* ══════════════ La règle (la dernière question du labo) ══════════════ */

const Mx = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;

const opt = (texts, right, whys, at = 0) => {
  const list = texts.map((text, i) => (i === right ? { text, correct: true } : { text, why: whys[i] }));
  const [good] = list.splice(right, 1);
  list.splice(at % (list.length + 1), 0, good);
  return list;
};

export function ruleOptions(lab, k, advanced) {
  const key = advanced ? 'diff' : 'sum';
  return opt([k(`discovery.${key}.right`), k(`discovery.${key}.wrongA`), k(`discovery.${key}.wrongB`)], 0, [null, k(`discovery.${key}.whyA`), k(`discovery.${key}.whyB`)], advanced ? 1 : 2);
}

export function Formal({ k, advanced }) {
  if (advanced) {
    return (
      <div className="space-y-2 text-sm font-bold text-emerald-950" data-bb-formal="diff">
        <p className="text-center text-base" dir="ltr"><MathText>{'${(+5)-(-7)=(+5)+(+7)=(+12)}$'}</MathText></p>
        <p><MathText>{k('formal.diff')}</MathText></p>
      </div>
    );
  }
  return (
    <div className="space-y-2 text-sm font-bold text-emerald-950" data-bb-formal="sum">
      <p className="text-center text-base" dir="ltr"><MathText>{'$(+6)+(-4)=(+2)\\ ;\\ (-9)+(+5)=(-4)$'}</MathText></p>
      <p><MathText>{k('formal.sum')}</MathText></p>
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite d'une tâche (par son id : les tâches viennent de la leçon). La dernière tâche de chaque niveau finit par LA RÈGLE. */
export const CHAINS = Object.freeze({
  t1: ['pairs', 'left', 'whySign'],
  t2: ['noPair', 'howEight'],
  t3: ['farther', 'signOf'],
  t4: ['oppZero', 'ruleSum'],
  m1: ['pairs'],                   // معارف : le labo posé seul (deux cartes de la leçon)
  m2: ['ruleDiff'],
  a1: ['rose', 'sameTie'],
  a2: ['whyNeutral', 'equalsSum'],
  a3: ['equalsSum'],
  a4: ['ruleDiff'],
});

const abs = (h) => (h < 0n ? -h : h);
const num = (h) => String(Number(h / 100n));
/** Les nombres d'une tâche pour les phrases : a, b, expected, pairs, restes. */
function nums(task) {
  const a = task.a; const b = task.op === '+' ? task.b : R.opposite(task.b);
  const pairs = Math.min(Number(abs(a) / 100n), Number(abs(b) / 100n));
  const sameSign = (a < 0n) === (b < 0n);
  const posLeft = task.expected > 0n;
  const far = abs(a) >= abs(task.b) ? a : task.b;
  const near = far === a ? task.b : a;
  return {
    a: iso(R.text(a)), b: iso(R.text(task.b)), r: iso(R.text(task.expected)), rAbs: iso(num(abs(task.expected))), da: iso(num(abs(a))), db: iso(num(abs(task.b))),
    pairs: sameSign ? 0 : pairs, sum: iso(num(abs(a) + abs(task.b))), n: iso(task.need.n),
    farther: iso(R.text(far)), nearer: iso(R.text(near)),
    leftWord: posLeft ? 'نفخات' : 'أكياس', otherWord: posLeft ? 'أكياس' : 'نفخات',
  };
}

/** Une question à trois choix : `cp.<key>.{prompt,right,wrongA,wrongB,whyA,whyB,hint1,hint2,explain}`. */
const qc = (k, key, o, at = 1, cols) => ({
  id: key, kind: 'choice', ...(cols ? { cols } : {}), prompt: Mx(k, `${key}.prompt`, o),
  options: opt([Mx(k, `${key}.right`, o), Mx(k, `${key}.wrongA`, o), Mx(k, `${key}.wrongB`, o)], 0, [null, Mx(k, `${key}.whyA`, o), Mx(k, `${key}.whyB`, o)], at),
  hints: [Mx(k, `${key}.hint1`, o), Mx(k, `${key}.hint2`, o)], explain: Mx(k, `${key}.explain`, o),
});

export const QUESTIONS = {
  pairs: (lab, task, k) => {
    const o = nums(task);
    const n = o.pairs;
    return {
      id: 'pairs', kind: 'choice', cols: 3, prompt: Mx(k, 'pairs.prompt', { ...o, n }),
      options: opt([String(n), String(n + 2), String(n === 0 ? 1 : 0)].map((x, i) => <bdi key={`${x}-${i}`} dir="ltr">{x}</bdi>), 0, [null, Mx(k, 'pairs.whyMore', o), Mx(k, 'pairs.whyNone', o)], 1),
      hints: [Mx(k, 'pairs.hint1', o), Mx(k, 'pairs.hint2', o)], explain: Mx(k, 'pairs.explain', { ...o, n }),
    };
  },
  left: (lab, task, k) => qc(k, 'left', nums(task), 2),
  whySign: (lab, task, k) => qc(k, 'whySign', nums(task), 0),
  noPair: (lab, task, k) => qc(k, 'noPair', nums(task), 1),
  howEight: (lab, task, k) => qc(k, 'howEight', nums(task), 2),
  farther: (lab, task, k) => qc(k, 'farther', nums(task), 0),
  signOf: (lab, task, k) => qc(k, 'signOf', nums(task), 1),
  oppZero: (lab, task, k) => qc(k, 'oppZero', nums(task), 2),
  rose: (lab, task, k) => qc(k, 'rose', nums(task), 1),
  sameTie: (lab, task, k) => qc(k, 'sameTie', nums(task), 2),
  whyNeutral: (lab, task, k) => qc(k, 'whyNeutral', nums(task), 0),
  equalsSum: (lab, task, k) => {
    const o = { ...nums(task), card: cardTex(task.a, task.op, task.b), good: `\${${sg(task.a)}+${sg(R.opposite(task.b))}}$`, plain: `\${${sg(task.a)}+${sg(task.b)}}$`, flipped: `\${${sg(R.opposite(task.a))}+${sg(R.opposite(task.b))}}$` };
    return {
      id: 'equalsSum', kind: 'choice', cols: 1, prompt: Mx(k, 'equalsSum.prompt', o),
      options: opt([<MathText key="g">{o.good}</MathText>, <MathText key="p">{o.plain}</MathText>, <MathText key="f">{o.flipped}</MathText>], 0, [null, Mx(k, 'equalsSum.whyPlain', o), Mx(k, 'equalsSum.whyFlipped', o)], 1),
      hints: [Mx(k, 'equalsSum.hint1', o), Mx(k, 'equalsSum.hint2', o)], explain: Mx(k, 'equalsSum.explain', o),
    };
  },
  ruleSum: (lab, task, k) => ({
    id: 'ruleSum', kind: 'choice', prompt: <MathText>{k('discovery.sum.prompt')}</MathText>,
    options: ruleOptions(lab, k, false).map((o) => ({ ...o, text: <MathText>{o.text}</MathText>, why: o.why && <MathText>{o.why}</MathText> })),
    hints: [<MathText key="h1">{k('rule.sum.hint1')}</MathText>, <MathText key="h2">{k('rule.sum.hint2')}</MathText>], explain: <Formal lab={lab} k={k} advanced={false} />,
  }),
  ruleDiff: (lab, task, k) => ({
    id: 'ruleDiff', kind: 'choice', prompt: <MathText>{k('discovery.diff.prompt')}</MathText>,
    options: ruleOptions(lab, k, true).map((o) => ({ ...o, text: <MathText>{o.text}</MathText>, why: o.why && <MathText>{o.why}</MathText> })),
    hints: [<MathText key="h1">{k('rule.diff.hint1')}</MathText>, <MathText key="h2">{k('rule.diff.hint2')}</MathText>], explain: <Formal lab={lab} k={k} advanced />,
  }),
};
