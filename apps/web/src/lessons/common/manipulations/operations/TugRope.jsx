import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Hand, CheckCircle2, Sparkles, ChevronLeft, FlaskConical, Undo2, Bell, ArrowLeft, ArrowRight } from 'lucide-react';
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
import { Backdrop, Flag, Strip, Ribbon, Kid, COL, unitFor, clampMark } from './tugRope/art';
import { LEVELS } from '../levels';
import * as L from '../logic/tugRope';

/**
 * tug-rope — L'ÉQUIPE DE CHAQUE TERME SOUS LA MAIN (2AM, unité 3 « الأعداد النسبية », درس « حساب مجموع جبري », 2026-10-29).
 * La logique, exacte, est dans `logic/tugRope.js` (sur `packages/core/arithmetic/relative.js`, E3, importé par chemin).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. La main tient l'ÉQUIPE de chaque terme : RETOURNER l'enfant précédé de « − » (sa dossard devient l'opposé), puis l'ENVOYER à gauche ou à droite d'une corde. Trois chemins : glisser l'enfant sur le
 *    terrain ; l'choisir puis « يسار / يمين » ; le clavier (Tab entre enfants, T retourne, ← / → envoient, Retour le rend à la file). « صفّارة » (ou Entrée) lance la traction.
 * B. La position du ruban (= la somme) est une SORTIE : il avance de (force de droite − force de gauche) sur la bande graduée.
 * C. La résistance : l'ordre d'arrivée n'a aucune importance ; deux enfants à dossards opposés se compensent ; un crochet est un petit équipage réglé d'abord.
 * D. La phase formelle écrit la chaîne de l'élève sous forme d'additions puis simplifiée.
 * E. Les fausses réponses sont rendues VISIBLES : le ruban fantôme à la vraie position ; les enfants fautifs clignotent ; le tableau écrit en rouge un retournement d'un terme ajouté.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        somme algébrique = traction de deux équipes ; soustraire = retourner l'enfant ; l'ordre ne compte pas
 *   OBJECT         des enfants à dossards (nombres relatifs), une corde, un ruban, une bande graduée
 *   VARIABLE       l'ÉQUIPE de chaque terme (retourner puis envoyer)
 *   INVARIANT      la chaîne écrite et ses nombres
 *   TRANSFORMATION retourner = prendre l'opposé ; envoyer = choisir la jambe de la comparaison
 *   CONSTRAINT     un seul crochet par chaîne, réglé d'abord ; au plus 6 enfants
 *   RESISTANCE     le ruban qui va du mauvais côté quand un enfant n'est pas retourné ou mal placé
 *   EVIDENCE       les totaux de chaque équipe, le tableau, le ruban fantôme, les enfants qui clignotent
 *   PREDICTION     متقدم : la position est écrite AVANT de siffler
 *   FORMALIZATION  « (−8)−(+3)+(−6)−(−5) = (−8)+(−3)+(−6)+(+5) = (−17)+(+5) = (−12) »
 *   TRANSFER       « جرّب أعدادك » (toujours ouvert), les exercices et la banque
 *
 * ONBOARDING : `coach` → `LabCoach` ; `logic › coachOf`. QUESTIONS PENDANT LE LABO (`LabCheckpoint`) : `CHAINS` + `QUESTIONS`, après CHAQUE tâche, avec SES nombres ; la dernière suite de chaque niveau finit par LA RÈGLE.
 * ÉTAPES : `LabStepper` (`[data-tr-step=<i>]`) + la fête. « إعادة » : tâche 1. Props : `tasks`, `level`, `levels`, `coach`, `title`, `lead`, `onTrial(event)`, `onFinished({})`.
 *
 * CONTRAT DOM : [data-tug-rope][data-level][data-task][data-mark][data-solved], [data-tr-glance], [data-tr-stage], [data-tr-queue], [data-tr-child=<i>][data-bib][data-turned][data-side][data-selected],
 * [data-tr-turn], [data-tr-send=left|right], [data-tr-team=left|right][data-total], [data-tr-ribbon][data-value], [data-tr-ghost][data-model], [data-tr-scoreboard], [data-tr-whistle], [data-tr-answer],
 * [data-tr-check], [data-tr-verdict], [data-tr-next], [data-tr-step=<i>], [data-tr-free], [data-tr-free-chain], [data-tr-free-back], [data-tr-formal], [data-tr-kid][data-mood].
 */
const NS = 'manipulation.tugRope';
const LRI = '⁦';
const PDI = '⁩';
const iso = (s) => `${LRI}${String(s).replace(/-/g, '−')}${PDI}`;
const num = (h) => iso(R.text(h));
const sg = (h) => `${h < 0n ? '−' : '+'}${R.text(h < 0n ? -h : h)}`;
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-amber-300';

const CSS = `
@keyframes tr-pop { 0% { transform: scale(0.85); } 70% { transform: scale(1.06); } 100% { transform: scale(1); } }
.tr-pop { animation: tr-pop 240ms ease-out both; display: inline-block; }
@keyframes tr-ghost { 0%,100% { opacity: .55; } 50% { opacity: .95; } }
.tr-ghost { animation: tr-ghost 1.6s ease-in-out infinite; }
@keyframes tr-blink { 0%,100% { opacity: 1; } 50% { opacity: .35; } }
.tr-blink { animation: tr-blink 0.9s ease-in-out 3; }
.tr-slide { transition: transform 700ms cubic-bezier(.3,1.3,.5,1); }
@media (prefers-reduced-motion: reduce) { .tr-pop, .tr-ghost, .tr-blink { animation: none !important; } .tr-slide { transition: none !important; } }
`;

export function numbersFor({ tasks, level }) {
  const lv = resolveLevelId(level ?? 'beginner');
  const asked = LEVELS['tug-rope'][lv].numbers;
  return { tasks: tasks ?? asked.tasks };
}

export default function TugRope({
  tasks, title, lead, level, levels: withLevels = true, coach: coachOn = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const initialNumbers = useMemo(() => numbersFor({ tasks, level }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'tug-rope', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
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
  const cpSettings = useLabCheckpointSettings('tug-rope');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const chain = cpOn && cpSettings.enabled && !L.isFree(lab) ? CHAINS[cur.id] ?? null : null;
  const isRule = (q) => q === 'ruleTurn' || q === 'ruleSum';
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
    lab: 'tug-rope', step: coachStep,
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
    <ManipulationDiscovery state={state} prompt={<MathText>{k(`discovery.${advanced ? 'sum' : 'turn'}.prompt`)}</MathText>} options={ruleOptions(lab, k, advanced)} formal={<Formal k={k} advanced={advanced} />} />
  );

  return (
    <ManipulationShell
      type="tug-rope"
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
        <div ref={boxRef} className="space-y-2" data-tug-rope data-level={advanced ? 'advanced' : 'beginner'} data-task={lab.free ? 'free' : lab.ti}
          data-mark={lab.pulled ? R.text(lab.pulled.mark) : ''} data-solved={finished ? 'true' : 'false'}>
          <style dangerouslySetInnerHTML={{ __html: CSS }} />
          <Lab lab={lab} setLab={setLab} k={k} width={width} lead={state.isAuthoredLevel ? lead : null} cp={cp} advanced={advanced} />
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ══════════════ Le laboratoire ══════════════ */

function Lab({ lab, setLab, k, width, lead, cp, advanced }) {
  const task = L.taskOf(lab);
  const free = L.isFree(lab);
  const done = L.taskDone(lab);
  const lit = !free && done;
  const last = lab.last;
  const groupStage0 = !free && task.gi >= 0 && lab.stage === 0;

  const ctx = free ? k('ctx.free') : (lead && lab.ti === 0 ? lead : k(`ctx.${task.id}`));
  const question = free ? k('q.free') : k(`q.${task.id}${groupStage0 && lab.phase !== 'predict' ? 's0' : ''}`);

  const stepDone = lab.tasks.map((_, i) => !!lab.done[i] && (i !== lab.ti || !cp.blocking));
  const steps = lab.tasks.length > 1 && !free && <LabStepper count={lab.tasks.length} current={lab.ti} done={stepDone} stepAttr="data-tr-step" />;
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.trials.length === 0 && celebrated.current.size) celebrated.current = new Set();
  const nowDone = !free && stepDone[lab.ti];
  useEffect(() => {
    if (!nowDone || celebrated.current.has(lab.ti)) return;
    celebrated.current.add(lab.ti);
    party.celebrate({ n: lab.ti + 1, total: lab.tasks.length });
  }, [nowDone, lab.ti]); // eslint-disable-line react-hooks/exhaustive-deps

  // le son (muet sauf « الصوت ») : un déclic par geste, la cloche au coup de sifflet, le drapeau quand c'est juste, « over » sur un refus
  const nTrials = lab.trials.length;
  useEffect(() => {
    if (!nTrials) return;
    const tr = lab.trials[nTrials - 1];
    if (tr.kind === 'custom') return;
    if (tr.kind === 'turn') playSfx('gesture', { pitch: 1.2 });
    else if (tr.kind === 'send') playSfx(tr.ok === false ? 'over' : 'gesture', { pitch: tr.side === 'left' ? 0.8 : 1 });
    else if (tr.kind === 'whistle') playSfx(tr.ok ? 'bell' : 'over');
    else if (tr.kind === 'answer' || tr.kind === 'predict') playSfx(tr.ok ? 'flag' : 'over');
  }, [nTrials]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (done && !free) playSfx('flag'); }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  const prompt = (
    <PromptCard size={width >= 600 ? 'lg' : 'md'} aside={steps || null} context={<MathText>{ctx}</MathText>} contextProps={{ 'data-tr-context': free ? 'free' : task.id }}
      title={<MathText>{question}</MathText>} titleClassName={width >= 600 ? 'text-lg' : 'text-base'} lamp={free ? null : lit ? 'on' : 'off'}
      titleProps={{ 'data-tr-prompt': free ? 'free' : task.id, 'data-lit': lit ? 'true' : 'false' }} />
  );

  /* ── le verdict : la CONSÉQUENCE avec les nombres de l'élève, jamais la règle ── */
  const tm = L.teams(lab);
  const verdictLine = (() => {
    if (!last) return k(!free && task.predict && lab.phase === 'predict' ? 'idlePredict' : lab.phase === 'read' ? 'idleRead' : groupStage0 ? 'idleGroup' : 'idle');
    if (last.kind === 'turn') { const kid = lab.kids[last.i]; return k('v.turn', { bib: num(L.bib(kid)) }); }
    if (last.kind === 'send') {
      const kid = lab.kids[last.i];
      if (last.side == null) return k('v.back');
      return last.ok ? k('v.send', { r: num(tm.right), l: num(tm.left) }) : k('v.sendWrong', { bib: num(L.bib(kid)) });
    }
    if (last.kind === 'whistle') {
      const mark = lab.pulled ? lab.pulled.mark : tm.mark;
      if (last.ok) return lab.stage === 1 && task && !free && task.gi >= 0 && !L.taskDone(lab) && lab.innerDone != null ? k('v.groupDone', { m: num(lab.innerDone) }) : k('v.whistleOk', { a: num(mark) });
      return k(`w.${last.model}`, { a: num(mark), truth: num(L.stageTarget(lab)) });
    }
    if (last.kind === 'predict') return last.ok ? k('v.predictOk', { a: iso(last.value) }) : k(`p.${last.model}`, { typed: iso(last.value) });
    if (last.kind === 'answer') return last.ok ? k('v.answerOk', { a: iso(last.value) }) : k(`p.${last.model}`, { typed: iso(last.value) });
    if (last.kind === 'custom') return k('v.custom');
    return k('idle');
  })();
  const bad = !!last && last.ok === false && !last.free && last.kind !== 'send';
  const good = !!last && last.ok === true && !last.free && (last.kind === 'whistle' || last.kind === 'answer' || last.kind === 'predict');
  const tone = bad ? 'amber' : good ? 'emerald' : 'indigo';
  const Icon = bad ? Sparkles : good ? CheckCircle2 : Hand;
  const canNext = L.canNext(lab) && !cp.blocking;
  const mood = bad ? 'wonder' : done ? 'proud' : 'happy';
  const banner = (
    <VerdictBanner tone={tone} icon={Icon} size="sm" className="min-h-[3.2rem]" data-tr-verdict={bad ? 'wrong' : good ? 'right' : last?.free ? 'free' : ''}>
      <div className="flex min-w-0 items-center gap-2">
        <svg width={40} height={52} viewBox="0 0 40 52" aria-hidden="true" data-tr-kid data-mood={mood} className="shrink-0">
          <KidGuide girl={!(free ? advanced : task.predict)} mood={mood} />
        </svg>
        <div className="min-w-0 space-y-1.5">
          <p className={last ? '' : 'font-bold text-indigo-900'}>{verdictLine}</p>
          {canNext && (
            <button type="button" onClick={() => setLab(L.nextTask)} data-tr-next
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
      <div className="relative space-y-2" data-tr-glance>
        {party.node}
        {cp.node}
        {prompt}
        <FieldAndQueue lab={lab} setLab={setLab} k={k} width={width} advanced={advanced} groupStage0={groupStage0} />
        <Controls lab={lab} setLab={setLab} k={k} advanced={advanced} />
        {banner}
      </div>
      <FreeCard lab={lab} setLab={setLab} k={k} />
    </>
  );
}

function KidGuide({ girl, mood }) {
  return <Kid i={girl ? 0 : 1} mood={mood} size={40} />;
}

/* ══════════════ Le terrain : la file, les deux équipes, la corde et la bande ══════════════ */

const FIELD_H = 138;
const ROPE_Y = 62;
const STRIP_Y = 94;

/** Un enfant : sa figure, sa dossard et, s'il est précédé de « − », sa carte à retourner. */
function KidCard({ kid, selected, onSelect, onTurn, onBack, onSend, small, size = 32, blink, k, fieldRef, ghostSide }) {
  const bib = L.bib(kid);
  const start = useRef(null);
  const suppress = useRef(false);
  const placed = !!kid.side;
  const flipped = kid.op === '-' && kid.turned;
  const down = (e) => { start.current = { x: e.clientX, y: e.clientY }; suppress.current = false; };
  const up = (e) => {
    const s0 = start.current; start.current = null;
    if (!s0 || Math.hypot(e.clientX - s0.x, e.clientY - s0.y) <= 28) return;
    suppress.current = true;
    const r = fieldRef.current?.getBoundingClientRect();
    if (r && e.clientY >= r.top - 8 && e.clientY <= r.bottom + 8) onSend(e.clientX < r.left + r.width / 2 ? 'left' : 'right');
    else if (placed) onBack();
  };
  const click = (e) => { e.stopPropagation(); if (suppress.current) { suppress.current = false; return; } if (placed) onBack(); else onSelect(); };
  const key = (e) => {
    if (e.key === 't' || e.key === 'T') { e.preventDefault(); onTurn(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); onSend('left'); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); onSend('right'); }
    else if (e.key === 'Backspace' || e.key === 'Escape') { e.preventDefault(); onBack(); }
  };
  const w = small ? size : 40;
  const cls = bib < 0n ? 'bg-orange-100 text-orange-900 border-orange-400' : bib > 0n ? 'bg-green-100 text-green-900 border-green-500' : 'bg-slate-100 text-slate-800 border-slate-400';
  return (
    <div className={`relative flex shrink-0 flex-col items-center ${blink ? 'tr-blink' : ''}`} data-tr-child={kid.i} data-bib={R.text(bib)} data-turned={kid.turned ? 'true' : 'false'} data-side={kid.side ?? ''} data-selected={selected ? 'true' : 'false'}
      data-wrong-side={ghostSide ? 'true' : 'false'}>
      <button type="button" onPointerDown={down} onPointerUp={up} onClick={click} onKeyDown={key} aria-label={k('kidAria', { bib: num(bib), where: k(`where.${kid.side ?? 'queue'}`) })}
        style={{ touchAction: 'none' }}
        className={`flex flex-col items-center rounded-xl p-0.5 ${selected ? 'bg-amber-100 ring-2 ring-amber-500' : ''} ${ring}`}>
        <Kid i={kid.i} size={w} mood={blink ? 'wonder' : 'happy'} />
        <span className={`mt-0.5 rounded-full border-2 px-1.5 text-center font-black leading-tight tabular-nums ${small ? 'text-[11px]' : 'text-sm'} ${cls}`}><bdi dir="ltr">{sg(bib)}</bdi></span>
      </button>
      {kid.op === '-' && (
        <button type="button" onClick={(e) => { e.stopPropagation(); onTurn(); }} data-tr-turn aria-label={k('turnAria')}
          className={`absolute top-[16px] -start-3 flex h-6 min-w-[22px] items-center justify-center rounded-md border-2 px-1 text-sm font-black leading-none shadow ${flipped ? 'border-emerald-600 bg-emerald-100 text-emerald-900' : 'border-rose-600 bg-white text-rose-700'} ${ring}`}>
          <span dir="ltr">{flipped ? '+' : '−'}</span>
        </button>
      )}
      {kid.fromGroup && <span className="absolute -bottom-1 rounded bg-indigo-100 px-1 text-[10px] font-black text-indigo-900" data-tr-from-group aria-hidden="true">[ ]</span>}
    </div>
  );
}

function FieldAndQueue({ lab, setLab, k, width, advanced, groupStage0 }) {
  const uid = `tr${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const fieldRef = useRef(null);
  const [sel, setSel] = useState(null);
  useEffect(() => { setSel(null); }, [lab.ti, lab.stage, lab.free]);
  const W = Math.max(300, width - 8);
  const u = unitFor(W);
  const cx = W / 2;
  const tm = L.teams(lab);
  const pulled = lab.pulled;
  const mark = pulled ? clampMark(Number(pulled.mark) / 100) : 0;
  const ghost = lab.ghost && !L.taskDone(lab) ? lab.ghost : null;
  const gMark = ghost ? clampMark(Number(ghost.at) / 100) : 0;
  const bad = new Set(pulled && !pulled.ok ? lab.bad.map((b) => b.i) : []);
  const wrongSide = new Set(lab.bad.filter((b) => b.why === 'wrongSide').map((b) => b.i));
  const queue = lab.kids.filter((q) => !q.side);
  const left = lab.kids.filter((q) => q.side === 'left');
  const right = lab.kids.filter((q) => q.side === 'right');
  const small = true;
  const kidSize = lab.kids.length > 4 ? 28 : 32;
  const act = (kid) => ({
    onSelect: () => setSel((s) => (s === kid.i ? null : kid.i)),
    onTurn: () => setLab((s) => L.turn(s, kid.i)),
    onBack: () => setLab((s) => L.send(s, kid.i, null)),
    onSend: (side) => { setLab((s) => L.send(s, kid.i, side)); setSel(null); },
  });
  const selected = sel != null ? lab.kids[sel] : null;
  const open = L.gesturesOpen(lab);
  const team = (side, kids) => (
    <div className={`absolute top-[30px] flex w-1/2 flex-wrap content-end items-end justify-center gap-x-0.5 gap-y-0 px-1 ${side === 'left' ? 'left-0' : 'right-0'}`} style={{ height: ROPE_Y + 26 - 30 }}
      data-tr-team={side} data-total={R.text(side === 'left' ? tm.left : tm.right)}>
      {kids.map((kid) => <KidCard key={kid.i} kid={kid} small={small} size={kidSize} k={k} fieldRef={fieldRef} selected={false} blink={bad.has(kid.i)} ghostSide={wrongSide.has(kid.i)} {...act(kid)} />)}
    </div>
  );
  return (
    <>
      <StageFrame className="min-w-0 overflow-hidden p-1" data-tr-stage>
        <div ref={fieldRef} className="relative mx-auto" style={{ width: W, height: FIELD_H }} dir="ltr">
          <svg width={W} height={FIELD_H} viewBox={`0 0 ${W} ${FIELD_H}`} style={{ position: 'absolute', inset: 0, display: 'block' }} role="img" aria-label={k('stageAria')} data-tr-svg>
            <Backdrop W={W} H={FIELD_H} ropeY={ROPE_Y} stripY={STRIP_Y} uid={uid} />
            <Flag x={14} y={ROPE_Y - 6} c={COL.minus} dir={1} />
            <Flag x={W - 14} y={ROPE_Y - 6} c={COL.plus} dir={-1} />
            <Strip W={W} stripY={STRIP_Y} u={u} half={advanced} />
            {ghost && (
              <g className="tr-ghost" data-tr-ghost data-model={ghost.kind}>
                <Ribbon x={cx + gMark * u} ropeY={ROPE_Y} stripY={STRIP_Y} ghost />
              </g>
            )}
            <g className="tr-slide" style={{ transform: `translateX(${mark * u}px)` }} data-tr-ribbon data-value={pulled ? R.text(pulled.mark) : '0'}>
              <Ribbon x={cx} ropeY={ROPE_Y} stripY={STRIP_Y} />
            </g>
          </svg>
          {/* les totaux de force */}
          <div className="pointer-events-none absolute top-1 flex w-full justify-between px-11" dir="ltr">
            <span className="rounded-full border-2 border-orange-400 bg-orange-50 px-2 text-sm font-black tabular-nums text-orange-900" data-tr-total="left"><bdi dir="ltr">{R.text(tm.left)}</bdi></span>
            <span className="rounded-full border-2 border-green-500 bg-green-50 px-2 text-sm font-black tabular-nums text-green-900" data-tr-total="right"><bdi dir="ltr">{R.text(tm.right)}</bdi></span>
          </div>
          {team('left', left)}
          {team('right', right)}
        </div>
      </StageFrame>
      <LabCard className="space-y-1.5 p-2" data-tr-queue data-group={groupStage0 ? 'true' : 'false'}>
        <div className={`flex flex-wrap items-end justify-center gap-x-1.5 gap-y-1 ${queue.length ? 'min-h-[62px]' : 'min-h-[24px]'}`} dir="ltr">
          {queue.length === 0 && <span className="self-center text-xs font-bold text-slate-500" dir="rtl">{k('queueEmpty')}</span>}
          {queue.map((kid) => <KidCard key={kid.i} kid={kid} small={small} size={kidSize} k={k} fieldRef={fieldRef} selected={sel === kid.i} blink={false} {...act(kid)} />)}
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="min-w-0 flex-1 text-xs font-bold leading-snug text-slate-600">{groupStage0 ? k('groupNote') : selected && !selected.side ? k('sendHint') : k('queueHint')}</p>
          <div className="flex shrink-0 items-center gap-1" dir="ltr">
            <button type="button" disabled={!open || !selected || !!selected.side} onClick={() => selected && setLab((s) => L.send(s, selected.i, 'left'))} data-tr-send="left" aria-label={k('sendLeft')}
              className={`flex h-11 min-w-[44px] items-center justify-center gap-0.5 rounded-full border-2 border-orange-500 bg-orange-100 px-2 text-xs font-black text-orange-900 disabled:opacity-40 ${ring}`}><ArrowLeft className="h-4 w-4" aria-hidden="true" />{k('leftWord')}</button>
            <button type="button" disabled={!open || !selected || !!selected.side} onClick={() => selected && setLab((s) => L.send(s, selected.i, 'right'))} data-tr-send="right" aria-label={k('sendRight')}
              className={`flex h-11 min-w-[44px] items-center justify-center gap-0.5 rounded-full border-2 border-green-600 bg-green-100 px-2 text-xs font-black text-green-900 disabled:opacity-40 ${ring}`}>{k('rightWord')}<ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
          </div>
        </div>
      </LabCard>
    </>
  );
}

/* ══════════════ Le tableau, la position écrite et le coup de sifflet ══════════════ */

function Controls({ lab, setLab, k, advanced }) {
  const [text, setText] = useState('');
  const free = L.isFree(lab);
  const task = L.taskOf(lab);
  const done = L.taskDone(lab);
  useEffect(() => { setText(''); }, [lab.ti, lab.phase, free]);
  const predicting = !free && !!task.predict && lab.phase === 'predict';
  const reading = !free && !task.predict && lab.phase === 'read';
  const can = !free && !done && (predicting || reading);
  const submit = () => { if (text.trim() && can) setLab((s) => (predicting ? L.predict(s, text) : L.answer(s, text))); };
  const board = L.scoreboard(lab);
  const canWhistle = L.gesturesOpen(lab) && L.placedAll(lab);
  return (
    <LabCard className="space-y-1.5 p-2" data-tr-controls>
      <div className="space-y-0.5 rounded-xl bg-slate-50 px-2 py-1 text-center font-black tabular-nums text-slate-900" data-tr-scoreboard data-total={R.text(board.total)} dir="ltr">
        <p className="text-sm leading-snug" data-tr-board-bracket>
          {board.bracket.map((p, i) => <span key={i} className={board.red[i] ? 'text-rose-600' : ''}>{i ? ' ' : ''}{p.replace(/-/g, '−')}</span>)}
        </p>
        {board.simple && (advanced || free) && <p className="text-xs text-slate-600" data-tr-board-simple>{board.simple.replace(/-/g, '−')}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {!free && (
          <>
            <label className="flex items-center gap-1.5 text-sm font-black text-indigo-950">
              <span className="whitespace-nowrap">{k(predicting ? 'predictLabel' : 'askLabel')}</span>
              <input type="text" inputMode="decimal" autoComplete="off" dir="ltr" value={text} disabled={!can} maxLength={7}
                onChange={(e) => setText(e.target.value.replace(/[^0-9٠-٩\-−+.,٫]/g, ''))}
                onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
                aria-label={k('answerAria')} data-tr-answer
                className={`h-11 w-20 rounded-xl border-2 border-indigo-300 bg-white px-2 text-center text-xl font-black tabular-nums text-indigo-950 disabled:bg-slate-100 ${ring}`} />
            </label>
            <button type="button" onClick={submit} disabled={!can || !text.trim()} data-tr-check
              className={`inline-flex min-h-[44px] items-center justify-center rounded-2xl border-2 border-indigo-600 bg-indigo-600 px-3 text-sm font-black text-white shadow-[0_3px_0_0_#3730A3] disabled:opacity-40 ${ring}`}>{k('check')}</button>
          </>
        )}
        <button type="button" onClick={() => setLab(L.whistle)} disabled={!canWhistle || reading} data-tr-whistle
          className={`ms-auto inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-2xl border-2 border-amber-600 bg-amber-500 px-3 text-sm font-black text-white shadow-[0_3px_0_0_#B45309] disabled:opacity-40 ${ring}`}>
          <Bell className="h-4 w-4" aria-hidden="true" />{k('whistle')}
        </button>
      </div>
    </LabCard>
  );
}

/* ══════════════ « جرّب أعدادك » : toujours ouvert ══════════════ */

function FreeCard({ lab, setLab, k }) {
  const free = L.isFree(lab);
  const [raw, setRaw] = useState('');
  useEffect(() => { if (!lab.free) setRaw(''); }, [lab.free]);
  const bad = raw.trim() !== '' && !L.parseFree(raw);
  const apply = (v) => { if (L.parseFree(v)) setLab((s) => L.setFree(s, v)); };
  return (
    <LabCard className="space-y-2 border-emerald-200 bg-emerald-50/50 p-3" data-tr-free data-active={free ? 'true' : 'false'}>
      <p className="flex items-center gap-1.5 text-sm font-black text-emerald-900"><FlaskConical className="h-4 w-4" aria-hidden="true" /> {k('free.title')}</p>
      <p className="text-xs font-bold leading-snug text-slate-600">{free ? k('free.on') : <MathText>{k('free.hint')}</MathText>}</p>
      <div className="flex flex-wrap items-center gap-2" dir="ltr">
        <input type="text" inputMode="text" autoComplete="off" value={raw} aria-label={k('free.aria')} data-tr-free-chain maxLength={60} placeholder="-5 + 3 - 2"
          className={`h-11 min-w-0 flex-1 rounded-xl border-2 ${bad ? 'border-rose-300' : 'border-emerald-300'} bg-white px-2 text-center text-lg font-black tabular-nums text-indigo-950 ${ring}`}
          onChange={(e) => { const v = e.target.value.replace(/[^0-9٠-٩\-−+.,()\s]/g, ''); setRaw(v); apply(v); }} />
        {bad && <span className="text-xs font-bold text-rose-700" dir="rtl">{k('free.bad')}</span>}
        {free && (
          <button type="button" onClick={() => setLab(L.toGuided)} data-tr-free-back dir="rtl"
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
  const key = advanced ? 'sum' : 'turn';
  return opt([k(`discovery.${key}.right`), k(`discovery.${key}.wrongA`), k(`discovery.${key}.wrongB`)], 0, [null, k(`discovery.${key}.whyA`), k(`discovery.${key}.whyB`)], advanced ? 2 : 1);
}

export function Formal({ k, advanced }) {
  if (advanced) {
    return (
      <div className="space-y-2 text-sm font-bold text-emerald-950" data-tr-formal="sum">
        <p className="text-center text-base" dir="ltr"><MathText>{'$-15+4+8+3=(4+8+3)+(-15)=15-15=0$'}</MathText></p>
        <p><MathText>{k('formal.sum')}</MathText></p>
      </div>
    );
  }
  return (
    <div className="space-y-2 text-sm font-bold text-emerald-950" data-tr-formal="turn">
      <p className="text-center text-base" dir="ltr"><MathText>{'$(-8)-(+3)+(-6)-(-5)=(-8)+(-3)+(-6)+(+5)=(-17)+(+5)=(-12)$'}</MathText></p>
      <p><MathText>{k('formal.turn')}</MathText></p>
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite d'une tâche (par son id : les tâches viennent de la leçon). La dernière tâche de chaque niveau finit par LA RÈGLE. */
export const CHAINS = Object.freeze({
  t1: ['totals', 'whyMark'],
  t2: ['bibTurn1', 'bibTurn2', 'asAdd'],
  t3: ['leave', 'ruleTurn'],
  m1: ['asAdd'],                  // معارف : le labo posé seul
  a1: ['order'],
  a2: ['whyGroup'],
  a3: ['ruleSum'],
});

/** Les nombres d'une tâche pour les phrases. */
function nums(task, k) {
  const addends = R.asSum(task.nodes);
  const g = R.groupBySign(addends);
  const minus = task.nodes.filter((n) => n.op === '-' && !n.group);
  const posSet = addends.filter((x) => x > 0n);
  const pair = (() => {
    const out = [];
    const used = new Set();
    addends.forEach((x, i) => {
      if (x <= 0n) return;
      const j = addends.findIndex((y, jj) => y === -x && !used.has(jj));
      if (j >= 0) { used.add(j); used.add(i); out.push(x); }
    });
    return out;
  })();
  const S = task.expected;
  return {
    R: num(g.posSum), L: num(-g.negSum), S: num(S), absS: num(S < 0n ? -S : S), strong: k(S > 0n ? 'side.right' : 'side.left'),
    sumBoth: num(g.posSum - g.negSum),
    v1: minus[0] ? num(minus[0].value) : '', o1: minus[0] ? num(-minus[0].value) : '', v2: minus[1] ? num(minus[1].value) : '', o2: minus[1] ? num(-minus[1].value) : '',
    p1: pair[0] ? num(pair[0]) : '', q1: pair[0] ? num(-pair[0]) : '', p2: pair[1] ? num(pair[1]) : '', q2: pair[1] ? num(-pair[1]) : '',
    posCount: posSet.length,
  };
}
const par = (x) => `(${x < 0n ? '-' : '+'}${R.text(x < 0n ? -x : x)})`;
const chainTex = (items) => `\${${items.map((it, i) => (i ? `${it.op}${par(it.v)}` : par(it.v))).join('')}}$`;

/** Une question à trois choix : `cp.<key>.{prompt,right,wrongA,wrongB,whyA,whyB,hint1,hint2,explain}`. */
const qc = (k, key, o, at = 1, id = key) => ({
  id, kind: 'choice', prompt: Mx(k, `${key}.prompt`, o),
  options: opt([Mx(k, `${key}.right`, o), Mx(k, `${key}.wrongA`, o), Mx(k, `${key}.wrongB`, o)], 0, [null, Mx(k, `${key}.whyA`, o), Mx(k, `${key}.whyB`, o)], at),
  hints: [Mx(k, `${key}.hint1`, o), Mx(k, `${key}.hint2`, o)], explain: Mx(k, `${key}.explain`, o),
});

export const QUESTIONS = {
  totals: (lab, task, k) => qc(k, 'totals', nums(task, k), 1),
  whyMark: (lab, task, k) => qc(k, 'whyMark', nums(task, k), 2),
  bibTurn1: (lab, task, k) => qc(k, 'bibTurn', { ...nums(task, k), v: nums(task, k).v1, o: nums(task, k).o1 }, 1, 'bibTurn1'),
  bibTurn2: (lab, task, k) => qc(k, 'bibTurn', { ...nums(task, k), v: nums(task, k).v2, o: nums(task, k).o2 }, 2, 'bibTurn2'),
  leave: (lab, task, k) => qc(k, 'leave', nums(task, k), 2),
  order: (lab, task, k) => qc(k, 'order', nums(task, k), 0),
  whyGroup: (lab, task, k) => qc(k, 'whyGroup', nums(task, k), 1),
  asAdd: (lab, task, k) => {
    const nodes = task.nodes;
    const good = nodes.map((n) => ({ op: '+', v: n.op === '-' ? -n.value : n.value }));
    const plain = nodes.map((n) => ({ op: '+', v: n.value }));
    const flipped = nodes.map((n) => ({ op: '+', v: n.op === '-' ? n.value : -n.value }));
    const o = { ...nums(task, k), chain: chainTex(nodes.map((n, i) => ({ op: i ? n.op : '+', v: n.value }))) };
    return {
      id: 'asAdd', kind: 'choice', cols: 1, prompt: Mx(k, 'asAdd.prompt', o),
      options: opt([<MathText key="g">{chainTex(good)}</MathText>, <MathText key="p">{chainTex(plain)}</MathText>, <MathText key="f">{chainTex(flipped)}</MathText>], 0, [null, Mx(k, 'asAdd.whyPlain', o), Mx(k, 'asAdd.whyFlipped', o)], 1),
      hints: [Mx(k, 'asAdd.hint1', o), Mx(k, 'asAdd.hint2', o)], explain: <MathText>{k('cp.asAdd.explain', { ...o, good: chainTex(good) })}</MathText>,
    };
  },
  ruleTurn: (lab, task, k) => ({
    id: 'ruleTurn', kind: 'choice', prompt: <MathText>{k('discovery.turn.prompt')}</MathText>,
    options: ruleOptions(lab, k, false).map((o) => ({ ...o, text: <MathText>{o.text}</MathText>, why: o.why && <MathText>{o.why}</MathText> })),
    hints: [<MathText key="h1">{k('rule.turn.hint1')}</MathText>, <MathText key="h2">{k('rule.turn.hint2')}</MathText>], explain: <Formal k={k} advanced={false} />,
  }),
  ruleSum: (lab, task, k) => ({
    id: 'ruleSum', kind: 'choice', prompt: <MathText>{k('discovery.sum.prompt')}</MathText>,
    options: ruleOptions(lab, k, true).map((o) => ({ ...o, text: <MathText>{o.text}</MathText>, why: o.why && <MathText>{o.why}</MathText> })),
    hints: [<MathText key="h1">{k('rule.sum.hint1')}</MathText>, <MathText key="h2">{k('rule.sum.hint2')}</MathText>], explain: <Formal k={k} advanced />,
  }),
};
