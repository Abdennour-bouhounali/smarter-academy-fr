import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Hand, CheckCircle2, Sparkles, ChevronLeft, ChevronUp, ChevronDown, FlaskConical, Undo2, Eraser } from 'lucide-react';
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
import * as L from '../logic/levelLaser';
import { COL, Wall, TankBody, LaserGrip, Student } from './levelLaser/art';

/**
 * level-laser — LA HAUTEUR D'UN LASER SOUS LA MAIN (2AM, unité 2, درس « مقارنة كسرين », 2026-10-29). La logique, exacte, est dans `logic/levelLaser.js` (sur `fractions2.js` E4, importé par chemin).
 * Thème `oilpress` : deux (trois) réservoirs d'inox identiques, un tube de verre gradué en SON nombre de crans contre chacun, l'huile dorée, le trait « 1 » du plein, un niveau laser rouge sur un rail vertical.
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. La main tient UNE variable : la HAUTEUR du laser (collée aux crans de la UNION des graduations et aux niveaux d'huile) — glisser la poignée sur le rail, ↑ ↓ (cran suivant de l'union), PageUp/PageDown
 *    (cran du tube le plus grossier) ; « على زيت الخزّان » colle le laser à une huile, offert seulement APRÈS un premier geste de la main.
 * B. Une même hauteur est LUE dans les deux tubes : une pastille sur chaque tube dit « العلامة 9 من 12 » ou « بين 4 و 5 من 8 » — l'écriture 3/4 = 9/12 est VUE, jamais calculée.
 * C. La résistance : les tubes n'ont pas la même graduation (plus de crans = crans plus petits) ; en متقدم les tubes sont VOILÉS : on écrit avant de voir.
 * D. La phase formelle : 3/4 = (3 × 3)/(4 × 3) = 9/12 > 7/12 ; 3/8 < 3/5 ; 5/6 < 1 < 9/8.
 * E. Les modèles faux (seuls les numérateurs, « plus de crans = plus d'huile », réécrire le seul dénominateur, « un cran de moins que le plein ») sont réfutés PAR LE MONDE : le laser saute au niveau revendiqué.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        deux fractions se comparent en lisant le MÊME niveau dans deux graduations ; mêmes crans → les numérateurs ; mêmes numérateurs → le cran le plus grand est le plus petit ; multiple → on réécrit
 *   OBJECT         des réservoirs identiques de hauteur 1, un tube gradué en b crans chacun, un laser, un trait « 1 »
 *   VARIABLE       la hauteur du laser h (une fraction de réservoir, sur les crans des deux tubes)
 *   INVARIANT      le réservoir vaut 1 pour tous ; la même hauteur est le même volume dans tous les tubes
 *   TRANSFORMATION h → (cran k du tube b) : la même hauteur écrite autrement
 *   CONSTRAINT     le laser ne s'arrête que sur un cran ou une huile ; en متقدم il est verrouillé tant que les prévisions ne sont pas écrites
 *   RESISTANCE     numOnly · bigDen · noScale · gap sont refusés et le monde répond
 *   EVIDENCE       les pastilles, le laser sur l'huile, les crans, le trait « 1 », les chaînes de questions
 *   CONTRAST       mêmes crans / mêmes numérateurs / multiple / autour de 1 ; décimaux ; deux réservoirs trop pleins
 *   PREDICTION     (متقدم) les tubes sont voilés : on dit quel réservoir a le plus d'huile et on écrit le niveau AVANT de voir
 *   DISCOVERY      « كيف نقارن كسرين ؟ »
 *   FORMALIZATION  mise sur même dénominateur puis comparaison des numérateurs
 *   TRANSFER       « جرّب أعدادك » (toujours ouvert), les exercices et la banque
 *
 * « جرّب كل الإمكانيات » : NON. « جرّب أعدادك » est TOUJOURS ouvert (jamais comptée) ; hors des quatre cas de 2AM le panneau montre le laser (honnête) mais ne juge pas.
 * ONBOARDING : `coach` (défaut true) → `LabCoach` ; `logic/levelLaser.js › coachOf` (laser · read · choose · one · rewrite · predict · verify · next).
 * Props : `tasks`, `level`, `levels`, `coach`, `title`, `lead`, `onTrial(event)`, `onFinished()`.
 * CONTRAT DOM : [data-level-laser][data-level][data-task][data-h][data-solved], [data-ll-glance], [data-ll-scene], [data-ll-laser][role=slider][aria-valuenow], [data-ll-tube=<i>][data-den],
 * [data-ll-chip=<i>][data-on|data-between], [data-ll-sleeve=<i>], [data-ll-one], [data-ll-choice], [data-ll-choice-box], [data-ll-rewrite], [data-ll-input], [data-ll-check], [data-ll-order=<i>],
 * [data-ll-up|down], [data-ll-snap=<i>], [data-ll-next], [data-ll-step=<i>], [data-ll-verdict], [data-ll-free][data-active], [data-ll-free-a|b|c|d], [data-ll-free-back], [data-ll-formal].
 */
const NS = 'manipulation.levelLaser';
const LRI = '⁦';
const PDI = '⁩';
const iso = (s) => `${LRI}${s}${PDI}`;
const SCENE_MAX = 560;
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-rose-300';
const $ = (s) => `$${s}$`;
const tfrac = (t) => `\\tfrac{${t.numText}}{${t.den}}`;
const NAMES = (n) => (n === 3 ? ['left', 'middle', 'right'] : ['left', 'right']);

const CSS = `
@keyframes ll-pop { 0% { transform: scale(0.9); opacity: 0.3; } 100% { transform: scale(1); opacity: 1; } }
.ll-pop { animation: ll-pop 220ms ease-out; transform-box: fill-box; transform-origin: center; }
.ll-sleeve { transition: transform 520ms ease-in, opacity 520ms ease-in; }
.ll-sleeve[data-up="true"] { transform: translateY(-34px); opacity: 0; pointer-events: none; }
@media (prefers-reduced-motion: reduce) { .ll-pop { animation: none !important; } .ll-sleeve { transition: none !important; } }
`;

export function numbersFor({ tasks, level }) {
  const lv = resolveLevelId(level ?? 'beginner');
  const asked = LEVELS['level-laser'][lv].numbers;
  return { tasks: tasks ?? asked.tasks };
}

export default function LevelLaser({
  tasks, title, lead, level, levels: withLevels = true, coach: coachOn = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const initialNumbers = useMemo(() => numbersFor({ tasks, level }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'level-laser', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
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
  const cpSettings = useLabCheckpointSettings('level-laser');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const chain = cpOn && cpSettings.enabled && !L.isFree(lab) ? CHAINS[cur.id] ?? null : null;
  const isRule = (q) => q === 'rule' || q === 'ruleK';
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
    lab: 'level-laser', step: coachStep,
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
      type="level-laser"
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
        <div ref={boxRef} className="space-y-2" data-level-laser data-level={advanced ? 'advanced' : 'beginner'} data-task={lab.free ? 'free' : lab.ti}
          data-h={`${lab.w.p}/${cur.L}`} data-solved={finished ? 'true' : 'false'}>
          <style dangerouslySetInnerHTML={{ __html: CSS }} />
          <Lab lab={lab} setLab={setLab} k={k} width={width} screenH={screenH} lead={state.isAuthoredLevel ? lead : null} cp={cp} advanced={advanced} />
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ══════════════ Le laboratoire ══════════════ */

function Lab({ lab, setLab, k, width, screenH, lead, cp, advanced }) {
  const task = L.taskOf(lab);
  const free = L.isFree(lab);
  const done = L.taskDone(lab);
  const lit = !free && done;
  const w = lab.w;
  const last = lab.last;
  const st = L.stepOf(lab);

  /* ── la consigne : le contexte puis UNE question ── */
  const ctx = (() => {
    if (lead && lab.ti === 0 && !free) return lead;
    if (free) return k('ctx.free');
    return k(`ctx.${task.id}`);
  })();
  const fa = $(tfrac(task.tanks[0])); const fb = $(tfrac(task.tanks[1]));
  const question = free ? k('q.free', { a: iso(fa), b: iso(fb) })
    : task.predict ? k(task.kind === 'order' ? 'q.predictOrder' : 'q.predict') : task.id === 'l4' ? k('q.l4') : k('q.ask');

  const stepDone = lab.tasks.map((_, i) => !!lab.done[i] && (i !== lab.ti || !cp.blocking));
  const steps = lab.tasks.length > 1 && !free && <LabStepper count={lab.tasks.length} current={lab.ti} done={stepDone} stepAttr="data-ll-step" />;
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.trials.length === 0 && celebrated.current.size) celebrated.current = new Set();
  const nowDone = !free && stepDone[lab.ti];
  useEffect(() => {
    if (!nowDone || celebrated.current.has(lab.ti)) return;
    celebrated.current.add(lab.ti);
    party.celebrate({ n: lab.ti + 1, total: lab.tasks.length });
  }, [nowDone, lab.ti]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── le son (muet sauf « الصوت ») : un déclic par cran, le drapeau sur une réponse juste, « over » sur un refus et au-dessus du trait « 1 », la cloche à la fin ── */
  const sfx = useRef({ p: w.p, key: '' });
  const sfxKey = `${free ? 'free' : lab.ti}`;
  useEffect(() => {
    const p = sfx.current;
    if (p.key !== sfxKey) { sfx.current = { p: w.p, key: sfxKey }; return; }
    if (w.p !== p.p) {
      playSfx('gesture', { pitch: w.p > p.p ? 1 : 0.75 });
      if (p.p <= task.L && w.p > task.L) playSfx('over');
    }
    p.p = w.p;
  }, [w.p, sfxKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const nTrials = lab.trials.length;
  useEffect(() => {
    if (!nTrials) return;
    const tr = lab.trials[nTrials - 1];
    if (tr.kind === 'solved') playSfx('bell');
    else if (tr.kind === 'laser' || ((tr.kind !== 'custom') && tr.ok)) playSfx('flag');
    else if (tr.kind !== 'custom') playSfx('over');
  }, [nTrials]); // eslint-disable-line react-hooks/exhaustive-deps

  const prompt = (
    <PromptCard size="md" context={<MathText>{ctx}</MathText>} contextProps={{ 'data-ll-context': free ? 'free' : task.id }}
      title={<MathText>{question}</MathText>} titleClassName="text-base" lamp={free ? null : lit ? 'on' : 'off'}
      titleProps={{ 'data-ll-prompt': task.id, 'data-lit': lit ? 'true' : 'false' }} />
  );

  /* ── le verdict : la CONSÉQUENCE avec les nombres de l'élève, jamais la règle ── */
  const idleOf = (step) => {
    if (free) return L.freeCase(task) === 'later' ? k('free.later') : L.freeCase(task) === 'equal' ? k('free.equal') : k('free.known');
    if (step === 'laser') return k('idle');
    if (step === 'choose') return task.predict && !w.lifted ? k('idlePredict') : k('idleChoose');
    if (step === 'order') return task.predict && !w.lifted ? k('idlePredictOrder') : k('idleOrder');
    if (step === 'rewrite') return k('idleRewrite');
    if (step === 'one') return k('idleOne');
    if (step === 'verify') return k('idleVerify');
    return L.canNext(lab) ? '' : k('allDone');
  };
  const sym = task.truth === 0 ? '=' : task.truth > 0 ? '>' : '<';
  const verdictLine = (() => {
    if (!last || last.kind === 'custom') return w.aligned && st === 'choose' && !task.predict ? `${k('pullOk')} ${idleOf(st)}` : idleOf(st);
    if (last.kind === 'solved') return k('allDone');
    if (last.kind === 'laser') return k('pullOk');
    if (last.ok) {
      const right = last.kind === 'one' ? k('v.rightOne') : last.kind === 'order' || last.step === 'order' ? k('v.rightOrder')
        : last.kind === 'rewrite' || last.step === 'rewrite' ? k('v.rightRewrite', { eq: iso($(`${tfrac(task.tanks[task.rewrite ?? 0])}=\\tfrac{${task.rewritten}}{${task.D}}`)) })
          : k('v.rightChoose', { eq: iso($(`${tfrac(task.tanks[0])}${sym}${tfrac(task.tanks[1])}`)) });
      return `${right} ${idleOf(st)}`;
    }
    const m = last.model;
    if (last.kind === 'one') return k('w.oneWrong');
    if (last.step === 'rewrite') return `${m === 'unreadable' ? k('w.unreadable') : m === 'otherDen' ? k('w.otherDen', { D: iso(task.D) }) : m === 'noScale' ? k('w.noScale') : k('w.rewriteOther')}${w.lifted && m !== 'unreadable' && task.predict ? ` ${k('v.world')}` : ''}`;
    if (last.step === 'order' || last.kind === 'order') return `${m === 'reversed' ? k('w.reversed') : k('w.orderOther')}`;
    return `${k(`w.${m}`)} ${k('v.world')}`;
  })();
  const bad = !!(last && last.kind !== 'custom' && last.kind !== 'solved' && last.kind !== 'laser' && !last.ok);
  const good = !bad && !!last && (last.kind === 'laser' || (last.kind !== 'custom' && last.ok));
  const tone = bad ? 'rose' : good ? 'emerald' : 'indigo';
  const Icon = bad ? Sparkles : good ? CheckCircle2 : Hand;
  const canNext = L.canNext(lab) && !cp.blocking;
  const mood = bad ? 'wonder' : done ? 'proud' : 'happy';
  const banner = (
    <VerdictBanner tone={tone} icon={Icon} size="sm" className="min-h-[3.25rem]" data-ll-verdict={bad ? 'bad' : good ? 'good' : ''}>
      <div className="min-w-0 space-y-1.5">
        <p className={last ? '' : 'font-bold text-indigo-900'}><MathText>{verdictLine}</MathText></p>
        {canNext && (
          <button type="button" onClick={() => setLab(L.nextTask)} data-ll-next
            className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-2 border-emerald-600 bg-emerald-600 px-3.5 text-sm font-black text-white shadow-[0_3px_0_0_#047857] transition-all duration-150 active:translate-y-0.5 motion-reduce:transition-none ${ring}`}>
            {k('next')} <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </VerdictBanner>
  );

  const stageW = Math.min(SCENE_MAX, Math.max(300, width - 24));
  return (
    <>
      <div className="relative space-y-2" data-ll-glance>
        {party.node}
        {cp.node}
        {prompt}
        <StageFrame className="min-w-0 space-y-1 overflow-hidden p-2" data-ll-stage>
          {steps || null}
          <Scene lab={lab} setLab={setLab} k={k} width={stageW} screenH={screenH} mood={mood} girl={advanced} />
        </StageFrame>
        <Panel lab={lab} setLab={setLab} k={k} />
        {banner}
      </div>
      <FreeCard lab={lab} setLab={setLab} k={k} />
    </>
  );
}

/* ══════════════ La scène : réservoirs, tubes, laser ══════════════ */

const VW = 460;
const RAILX = 34;

function Scene({ lab, setLab, k, width, screenH, mood, girl }) {
  const uid = `ll${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const task = L.taskOf(lab);
  const w = lab.w;
  const locked = L.laserLocked(lab);
  const T = task.T4 / 4;
  const U = task.T4 > 4 ? 128 : (screenH >= 1000 ? 170 : 150);
  const TOP = 34;
  const hp = U * T; const y0 = TOP + hp; const yOf = (v) => y0 - v * U;
  const H = Math.round(y0 + 68);
  const X0 = 78; const colW = (VW - X0 - 8) / task.n;
  const bw = Math.min(58, colW * 0.5);
  const cx = (i) => X0 + colW * (i + 0.5);
  const bx = (i) => cx(i) - bw / 2 - 6;
  const tubeX = (i) => bx(i) + bw + 5; const tubeW = 11;
  const ly = y0 - (w.p / task.L) * U;
  const svgRef = useRef(null);
  const dragRef = useRef(false);
  const toValue = (e) => {
    const box = svgRef.current.getBoundingClientRect();
    const y = ((e.clientY - box.top) / Math.max(1, box.height)) * H;
    return ((y0 - y) / U) * task.L;
  };
  const down = (e) => { if (locked) return; dragRef.current = true; svgRef.current.setPointerCapture?.(e.pointerId); setLab((s) => L.setLaser(s, toValue(e))); };
  const move = (e) => { if (dragRef.current) setLab((s) => L.setLaser(s, toValue(e))); };
  const up = () => { dragRef.current = false; };
  const key = (e) => {
    const mp = { ArrowUp: ['n', 1], ArrowDown: ['n', -1], PageUp: ['p', 1], PageDown: ['p', -1] };
    if (e.key in mp) { e.preventDefault(); const [kind, d] = mp[e.key]; setLab((s) => (kind === 'n' ? L.nudgeLaser(s, d) : L.pageLaser(s, d))); }
  };
  const reading = (i) => L.crossing(task.tanks[i].den, w.p, task.L);
  const showChips = !locked;

  return (
    <div className="space-y-1" data-ll-scene-box>
      <svg ref={svgRef} width="100%" viewBox={`0 0 ${VW} ${H}`} style={{ maxWidth: Math.min(width, SCENE_MAX), display: 'block', margin: '0 auto', touchAction: 'none', direction: 'ltr' }} role="group" aria-label={k('stageAria')} data-ll-scene dir="ltr"
        onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        <Wall W={VW} H={H} />
        <rect x={0} y={H - 14} width={VW} height={14} fill={COL.floor} opacity={0.7} aria-hidden="true" />
        {/* les réservoirs, leurs tubes, l'huile */}
        {task.tanks.map((t, i) => {
          const lvl = t.vn / t.vd;
          const yo = yOf(lvl); const inBody = Math.max(yo, yOf(1));
          return (
            <g key={i} data-ll-tube={i} data-den={t.den} data-level={`${t.vn}/${t.vd}`}>
              <TankBody x={bx(i)} bw={bw} y0={y0} y1={yOf(1)} uid={uid} i={i} />
              <rect x={bx(i) + 3} y={inBody} width={bw - 6} height={y0 - inBody} rx={5} fill={COL.oil} opacity={0.92} aria-hidden="true" data-ll-oil={i} />
              <rect x={bx(i) + 3} y={inBody} width={bw - 6} height={Math.min(6, y0 - inBody)} rx={3} fill="#FFFFFF" opacity={0.25} aria-hidden="true" />
              {/* le tube de verre (au-dessus du trait « 1 » : le réservoir de réserve) */}
              <rect x={tubeX(i)} y={yOf(T)} width={tubeW} height={hp} rx={4} fill={COL.glass} stroke={COL.glassEdge} strokeWidth={1.2} aria-hidden="true" />
              <rect x={tubeX(i) + 1.5} y={yo} width={tubeW - 3} height={y0 - yo} rx={2} fill={COL.oilTube} aria-hidden="true" />
              {Array.from({ length: Math.floor((t.den * task.T4) / 4) + 1 }, (_, kk) => {
                const y = yOf(kk / t.den); const long = kk % t.den === 0;
                return (
                  <g key={kk} aria-hidden="true">
                    <line x1={tubeX(i) + tubeW} x2={tubeX(i) + tubeW + (long ? 9 : 5)} y1={y} y2={y} stroke={COL.ink} strokeWidth={long ? 1.6 : 1} />
                    {long && <text x={tubeX(i) + tubeW + 11} y={y + 3} fontSize={9.5} fontWeight={900} fill={COL.ink}>{kk / t.den}</text>}
                  </g>
                );
              })}
              {/* la fiche du réservoir */}
              <g aria-hidden="true">
                <rect x={cx(i) - 29} y={y0 + 13} width={58} height={34} rx={7} fill="#FFFBEB" stroke={COL.oilDeep} strokeWidth={1.4} />
                <text x={cx(i)} y={y0 + 26} textAnchor="middle" fontSize={13} fontWeight={900} fill={COL.ink}>{t.numText}</text>
                <line x1={cx(i) - 14} x2={cx(i) + 14} y1={y0 + 30} y2={y0 + 30} stroke={COL.ink} strokeWidth={1.4} />
                <text x={cx(i)} y={y0 + 43} textAnchor="middle" fontSize={13} fontWeight={900} fill={COL.ink}>{t.den}</text>
              </g>
              {/* le voile en toile (متقدم) */}
              {task.predict && (
                <g className="ll-sleeve" data-up={w.lifted ? 'true' : 'false'} data-ll-sleeve={i}>
                  <rect x={bx(i) - 3} y={yOf(T)} width={tubeX(i) + tubeW + 3 - (bx(i) - 3)} height={hp + 2} rx={8} fill={COL.cloth} opacity={0.97} stroke={COL.clothEdge} strokeWidth={1.4} />
                  {Array.from({ length: Math.floor(hp / 14) }, (_, r) => <line key={r} x1={bx(i)} x2={tubeX(i) + tubeW} y1={yOf(T) + 10 + r * 14} y2={yOf(T) + 10 + r * 14} stroke={COL.clothEdge} strokeWidth={0.8} opacity={0.35} />)}
                  <text x={(bx(i) + tubeX(i) + tubeW) / 2} y={y0 - hp / 2 + 5} textAnchor="middle" fontSize={22} fontWeight={900} fill={COL.clothEdge}>؟</text>
                </g>
              )}
            </g>
          );
        })}
        {/* le trait « 1 » : le plein */}
        <line x1={X0 - 6} x2={VW - 6} y1={yOf(1)} y2={yOf(1)} stroke={COL.brim} strokeWidth={1.6} strokeDasharray="6 4" data-ll-one-line aria-hidden="true" />
        <text x={X0 - 8} y={yOf(1) - 3} textAnchor="end" fontSize={11} fontWeight={900} fill={COL.brim} aria-hidden="true">{k('brim')}</text>
        {/* le rail et le faisceau */}
        <rect x={RAILX - 4} y={yOf(T) - 6} width={8} height={hp + 12} rx={4} fill={COL.rail} aria-hidden="true" />
        {task.snaps.map((p) => <circle key={p} cx={RAILX} cy={y0 - (p / task.L) * U} r={p === w.p ? 0 : 1.6} fill="#E2E8F0" aria-hidden="true" />)}
        <line x1={RAILX} x2={VW - 6} y1={ly} y2={ly} stroke={COL.laserGlow} strokeWidth={7} opacity={locked ? 0.15 : 0.4} aria-hidden="true" />
        <line x1={RAILX} x2={VW - 6} y1={ly} y2={ly} stroke={COL.laser} strokeWidth={2.2} opacity={locked ? 0.55 : 1} aria-hidden="true" data-ll-beam />
        {/* les pastilles de lecture : la même hauteur lue dans chaque tube */}
        {showChips && task.tanks.map((t, i) => {
          const r = reading(i);
          const text = r.onMark != null ? k('chip.mark', { k: iso(r.onMark), b: iso(t.den) }) : k('chip.between', { k: iso(r.between[0]), k1: iso(r.between[1]), b: iso(t.den) });
          const above = ly > TOP + 24;
          const py = above ? ly - 21 : ly + 5;
          return (
            <g key={i} aria-hidden="true" data-ll-chip={i} {...(r.onMark != null ? { 'data-on': String(r.onMark) } : { 'data-between': r.between.join('-') })}>
              <rect x={cx(i) - 36} y={py} width={72} height={16} rx={8} fill="#FFFFFF" stroke={COL.laser} strokeWidth={1.1} opacity={0.96} />
              <text x={cx(i)} y={py + 11.5} textAnchor="middle" fontSize={9.5} fontWeight={900} fill="#7F1D1D" direction="rtl" style={{ unicodeBidi: 'plaintext' }}>{text}</text>
            </g>
          );
        })}
        {/* la poignée du laser */}
        <g role="slider" tabIndex={locked ? -1 : 0} aria-label={k('laserAria')} aria-valuemin={0} aria-valuemax={task.L} aria-valuenow={w.p} aria-valuetext={iso(`${w.p}/${task.L}`)} aria-disabled={locked}
          data-ll-laser data-locked={locked ? 'true' : 'false'} onKeyDown={key} onPointerDown={down} className={ring} style={{ cursor: locked ? 'not-allowed' : 'grab', outline: 'none', touchAction: 'none' }}>
          <rect x={RAILX - 24} y={ly - 22} width={48} height={44} fill="transparent" />
          <LaserGrip x={RAILX} y={ly} active={dragRef.current} locked={locked} />
        </g>
        <Student x={RAILX} y={H - 6} girl={girl} mood={mood} />
        <rect x={RAILX - 20} y={yOf(T) - 8} width={40} height={hp + 16} fill="transparent" onPointerDown={down} />
      </svg>
    </div>
  );
}

/* ══════════════ Le panneau : laser, réponse ══════════════ */

function Panel({ lab, setLab, k }) {
  const task = L.taskOf(lab);
  const st = L.stepOf(lab);
  const free = L.isFree(lab);
  const locked = L.laserLocked(lab);
  const btn = 'inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-2xl border-2 px-3 text-sm font-black';
  const names = NAMES(task.n);
  const [val, setVal] = useState('');
  useEffect(() => { setVal(''); }, [lab.ti, lab.free, st]);
  const choiceBtn = 'min-w-[5.5rem] flex-1 border-indigo-300 bg-white text-indigo-950 shadow-[0_3px_0_0_#A5B4FC] transition-all duration-150 active:translate-y-0.5 disabled:opacity-50';
  const predicting = task.predict && !lab.w.lifted;
  const panel = (() => {
    if (free) return null;
    if (st === 'choose' && predicting) {
      return (
        <div className="flex flex-wrap items-center gap-2" data-ll-choice-box>
          <span className="text-sm font-black text-indigo-950">{k('sign.title')}</span>
          <div className="flex items-center gap-2" dir="ltr">
            {[['left', '>'], ['eq', '='], ['right', '<']].map(([claim, sg]) => (
              <button key={claim} type="button" data-ll-choice={claim} aria-label={k(`sign.${claim === 'left' ? 'gt' : claim === 'right' ? 'lt' : 'eq'}`)}
                onClick={() => setLab((s) => L.choose(s, claim))} className={`${btn} ${choiceBtn} w-14 flex-none text-xl ${ring}`}><span dir="ltr">{sg}</span></button>
            ))}
          </div>
        </div>
      );
    }
    if (st === 'choose') {
      return (
        <div className="flex flex-wrap items-center gap-2" data-ll-choice-box>
          <span className="text-sm font-black text-indigo-950">{k('choose.title')}</span>
          {['left', 'eq', 'right'].map((claim) => (
            <button key={claim} type="button" data-ll-choice={claim} onClick={() => setLab((s) => L.choose(s, claim))} className={`${btn} ${choiceBtn} ${ring}`}>{k(`choose.${claim}`)}</button>
          ))}
        </div>
      );
    }
    if (st === 'one') {
      return (
        <div className="flex flex-wrap items-center gap-2" data-ll-one data-ll-choice-box>
          <span className="text-sm font-black text-indigo-950"><MathText>{k('one.title')}</MathText></span>
          {['left', 'right'].map((claim) => (
            <button key={claim} type="button" data-ll-one-choice={claim} onClick={() => setLab((s) => L.chooseOne(s, claim))} className={`${btn} ${choiceBtn} ${ring}`}>{k(`one.${claim}`)}</button>
          ))}
        </div>
      );
    }
    if (st === 'order') {
      return (
        <div className="flex flex-wrap items-center gap-2" data-ll-choice-box>
          <span className="text-sm font-black text-indigo-950">{k('order.title')}</span>
          <div className="flex items-center gap-2" dir="ltr">
            {task.tanks.map((t, i) => {
              const at = lab.w.seq.indexOf(i);
              return (
                <button key={i} type="button" data-ll-order={i} disabled={at >= 0} onClick={() => setLab((s) => L.tapOrder(s, i))} aria-label={k(`tank.${names[i]}`)}
                  className={`${btn} ${choiceBtn} relative w-20 flex-none ${at >= 0 ? 'border-emerald-500 bg-emerald-50' : ''} ${ring}`}>
                  <MathText>{$(tfrac(t))}</MathText>
                  {at >= 0 && <span className="absolute -top-2 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[11px] text-white">{at + 1}</span>}
                </button>
              );
            })}
          </div>
          <button type="button" onClick={() => setLab(L.clearOrder)} disabled={!lab.w.seq.length} aria-label={k('order.clear')}
            className={`${btn} border-slate-200 bg-white text-slate-700 disabled:opacity-40 ${ring}`}><Eraser className="h-4 w-4" aria-hidden="true" />{k('order.clear')}</button>
        </div>
      );
    }
    if (st === 'rewrite') {
      const name = names[task.rewrite];
      return (
        <form className="flex flex-wrap items-center gap-2" data-ll-rewrite onSubmit={(e) => { e.preventDefault(); setLab((s) => L.rewrite(s, val)); }}>
          <label className="flex flex-wrap items-center gap-2 text-sm font-black text-amber-950">
            <span className="text-xs">{k('rewrite.label', { name: k(`tank.${name}`), D: iso(task.D) })}</span>
            <input type="text" inputMode="text" autoComplete="off" dir="ltr" value={val} maxLength={8} placeholder={k('rewrite.placeholder')} aria-label={k('rewrite.aria')} data-ll-input
              onChange={(e) => setVal(e.target.value.replace(/[^0-9٠-٩/⁄]/g, ''))}
              className={`h-10 w-24 rounded-xl border-2 border-amber-300 bg-white px-2 text-center text-lg font-black tabular-nums text-indigo-950 ${ring}`} />
          </label>
          <button type="submit" disabled={!val} data-ll-check className={`${btn} border-amber-600 bg-amber-500 text-white disabled:opacity-40 ${ring}`}>{k('rewrite.check')}</button>
        </form>
      );
    }
    return null;
  })();
  const snapNames = names;
  return (
    <LabCard className="space-y-2 p-2" data-ll-controls>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
        <RoundButton onClick={() => setLab((s) => L.nudgeLaser(s, -1))} disabled={locked} aria-label={k('laserDown')} size={44} data-ll-down><ChevronDown className="h-5 w-5" strokeWidth={3} aria-hidden="true" /></RoundButton>
        <RoundButton primary onClick={() => setLab((s) => L.nudgeLaser(s, 1))} disabled={locked} aria-label={k('laserUp')} size={44} data-ll-up><ChevronUp className="h-5 w-5" strokeWidth={3} aria-hidden="true" /></RoundButton>
        {L.snapOffered(lab) && (
          <div className="flex flex-wrap items-center gap-1.5" data-ll-snaps>
            <span className="text-[11px] font-black text-slate-600">{k('snapTitle')}</span>
            {snapNames.map((nm, i) => (
              <button key={i} type="button" data-ll-snap={i} onClick={() => setLab((s) => L.snapToTank(s, i))}
                className={`inline-flex min-h-[44px] items-center rounded-full border-2 border-rose-200 bg-white px-3 text-xs font-black text-rose-900 ${ring}`}>{k(`snap.${nm}`)}</button>
            ))}
          </div>
        )}
      </div>
      {panel}
    </LabCard>
  );
}

/* ══════════════ « جرّب أعدادك » : toujours ouvert ══════════════ */

function FreeCard({ lab, setLab, k }) {
  const free = L.isFree(lab);
  const [v, setV] = useState({ a: '', b: '', c: '', d: '' });
  useEffect(() => { if (!lab.free) setV({ a: '', b: '', c: '', d: '' }); }, [lab.free]);
  const chk = L.freeCheck(v.a, v.b, v.c, v.d);
  const filled = v.a && v.b && v.c && v.d;
  const msg = filled && !chk.ok && chk.why !== 'incomplete' ? k(`free.${chk.why}`) : null;
  const clean = (s) => s.replace(/[^0-9٠-٩]/g, '').slice(0, 2);
  const setField = (f) => (e) => { const nv = { ...v, [f]: clean(e.target.value) }; setV(nv); if (L.freeCheck(nv.a, nv.b, nv.c, nv.d).ok) setLab((s) => L.freeTask(s, nv.a, nv.b, nv.c, nv.d)); };
  const inp = `h-11 w-16 rounded-xl border-2 border-amber-300 bg-white px-1 text-center text-xl font-black tabular-nums text-indigo-950 ${ring}`;
  const Frac = ({ top, bottom }) => (
    <span className="flex flex-col items-center gap-1">
      <input type="text" inputMode="numeric" autoComplete="off" value={v[top]} aria-label={k(`free.${top}`)} {...{ [`data-ll-free-${top}`]: true }} onChange={setField(top)} className={inp} />
      <span className="h-0.5 w-12 bg-slate-500" aria-hidden="true" />
      <input type="text" inputMode="numeric" autoComplete="off" value={v[bottom]} aria-label={k(`free.${bottom}`)} {...{ [`data-ll-free-${bottom}`]: true }} onChange={setField(bottom)} className={inp} />
    </span>
  );
  return (
    <LabCard className="space-y-3 border-emerald-200 bg-emerald-50/50 p-3" data-ll-free data-active={free ? 'true' : 'false'}>
      <p className="flex items-center gap-1.5 text-sm font-black text-emerald-900"><FlaskConical className="h-4 w-4" aria-hidden="true" /> {k('free.title')}</p>
      <p className="text-xs font-bold leading-snug text-slate-600">{free ? k('free.on') : k('free.hint')}</p>
      <div className="flex flex-wrap items-center gap-2" dir="ltr">
        <Frac top="a" bottom="b" />
        <span className="text-2xl font-black text-sky-900" aria-hidden="true">؟</span>
        <Frac top="c" bottom="d" />
        {free && (
          <button type="button" onClick={() => setLab(L.toGuided)} data-ll-free-back
            className={`inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-emerald-200 bg-white px-3 text-xs font-bold text-emerald-900 ${ring}`} dir="rtl">
            <Undo2 className="h-4 w-4" aria-hidden="true" /> {k('free.back')}
          </button>
        )}
      </div>
      {msg && <p className="text-xs font-bold text-rose-700" data-ll-free-msg>{msg}</p>}
    </LabCard>
  );
}

/* ══════════════ La découverte et la règle ══════════════ */

const variantOf = (lab) => (lab.tasks[0].id === 'k1' ? 'K' : 'W');

export function ruleOptions(lab, k) {
  return [
    { text: <MathText>{k('rule.right')}</MathText>, correct: true },
    { text: <MathText>{k('rule.numOnly')}</MathText>, why: <MathText>{k('rule.whyNumOnly')}</MathText> },
    { text: <MathText>{k('rule.bigDen')}</MathText>, why: <MathText>{k('rule.whyBigDen')}</MathText> },
  ];
}

export function Formal({ lab, k }) {
  const v = variantOf(lab);
  const lines = {
    W: ['\\frac34=\\frac{3\\times3}{4\\times3}=\\frac9{12}>\\frac7{12}', '\\frac38<\\frac35', '\\frac56<1<\\frac98'],
    K: ['\\frac23=\\frac{2\\times2}{3\\times2}=\\frac46<\\frac56'],
  }[v];
  return (
    <div className="space-y-2 text-sm font-bold text-emerald-950" data-ll-formal>
      <p><MathText>{k('formal.W')}</MathText></p>
      {lines.map((ln) => <p key={ln} className="text-center text-base" dir="ltr"><MathText>{$(ln)}</MathText></p>)}
      {v === 'W' && <p><MathText>{k('formal.of')}</MathText></p>}
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

export const CHAINS = Object.freeze({
  l1: ['marks', 'higher', 'why'],
  l2: ['at9', 'small'],
  l3: ['smallMarks', 'threeMarks'],
  l4: ['above1', 'rule'],
  a1: ['why18'],
  a2: ['why9'],
  a3: ['dec'],
  a4: ['over'],
  k1: ['kmark', 'ruleK'],
});

const Mx = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const T = (s) => <MathText>{s}</MathText>;
const hints = (k, id) => [Mx(k, `${id}.hint1`), Mx(k, `${id}.hint2`)];
const choice = (k, id, opts, extra = {}) => ({ id, kind: 'choice', prompt: Mx(k, `${id}.prompt`), options: opts, hints: hints(k, id), explain: Mx(k, `${id}.explain`), ...extra });
const numberQ = (k, id, expected) => ({ id, kind: 'number', expected: String(expected), answer: T($(String(expected))), prompt: Mx(k, `${id}.prompt`), hints: hints(k, id), explain: Mx(k, `${id}.explain`) });
const opt = (k, id, name, correct) => (correct ? { text: T(k(`cp.${id}.${name}`)), correct: true } : { text: T(k(`cp.${id}.${name}`)), why: Mx(k, `${id}.why${name[0].toUpperCase()}${name.slice(1)}`) });
const three = (k, id, order = ['right', 'wrongA', 'wrongB']) => choice(k, id, order.map((n) => opt(k, id, n, n === 'right')));

/** Chaque question vient des tâches jouées (les nombres sont ceux des tâches), jamais d'un texte libre. */
export const QUESTIONS = {
  marks: (lab, task, k) => numberQ(k, 'marks', task.tanks[0].den),
  higher: (lab, task, k) => three(k, 'higher'),
  why: (lab, task, k) => three(k, 'why'),
  at9: (lab, task, k) => numberQ(k, 'at9', task.pos[0] * task.tanks[1].den / task.L),
  small: (lab, task, k) => three(k, 'small', ['wrongA', 'right', 'wrongB']),
  smallMarks: (lab, task, k) => three(k, 'smallMarks'),
  threeMarks: (lab, task, k) => three(k, 'threeMarks'),
  above1: (lab, task, k) => three(k, 'above1'),
  rule: (lab, task, k) => ({ id: 'rule', kind: 'choice', prompt: Mx(k, 'rule.prompt'), options: ruleOptions(lab, k), hints: hints(k, 'rule'), explain: <Formal lab={lab} k={k} /> }),
  kmark: (lab, task, k) => numberQ(k, 'kmark', task.pos[0] * task.tanks[1].den / task.L),
  ruleK: (lab, task, k) => ({ id: 'ruleK', kind: 'choice', prompt: Mx(k, 'ruleK.prompt'), options: ruleOptions(lab, k), hints: hints(k, 'ruleK'), explain: <Formal lab={lab} k={k} /> }),
  why18: (lab, task, k) => three(k, 'why18'),
  why9: (lab, task, k) => three(k, 'why9'),
  dec: (lab, task, k) => three(k, 'dec'),
  over: (lab, task, k) => three(k, 'over'),
};
