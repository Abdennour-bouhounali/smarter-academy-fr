import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Hand, CheckCircle2, Sparkles, ChevronLeft, FlaskConical, Undo2, Minus, Plus, Play } from 'lucide-react';
import { resolveLevelId } from '@smarter-academy/core/curriculum/manipulationLevels.js';
import * as Q from '@smarter-academy/core/arithmetic/equalities.js';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import MathText from '../../components/MathText';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import { LabCard, StageFrame, PromptCard, VerdictBanner, ChoiceTray, ChoiceCard } from '../primitives/LabKit';
import { SvgPill } from '../primitives/SvgPill';
import KidFigure from '../primitives/KidFigure';
import { useLabCoach } from '../primitives/LabCoach';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import { LEVELS } from '../levels';
import * as L from '../logic/equalityLanes';

/**
 * equality-lanes — LE NOMBRE D'UNE OPÉRATION SOUS LA MAIN (3AM, unité 5 « المساويات – المتباينات – المعادلات », درس « المساويات والعمليات »,
 * 2026-10-21). La logique, exacte, est dans `logic/equalityLanes.js` (sur `packages/core/arithmetic/equalities.js`, importé par chemin).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. La main tient c, le nombre d'une opération (une poignée sur une règle de −9 à 9, −/+, les flèches), choisit l'opération (+ − × ÷) et QUI la
 *    reçoit (les deux coureurs, ou un seul) ; « نفّذ » l'applique.
 * B. Une égalité dont x est un nombre CACHÉ : deux coureurs se tiennent chacun à la valeur de leur membre sur un mur gradué ; vraie ⇔ même graduation.
 * C. La résistance : l'opération reçue par UN seul coureur les sépare du poids de c ; ÷ 0 est refusé ; × 0 les envoie tous deux à 0 (« 0 = 0 »
 *    reste vraie mais ne dit plus rien).
 * D. La phase formelle écrit ce que l'élève a fait : « a = b ⟹ a + c = b + c » avec SES nombres, puis le produit.
 * E. Les fausses conjectures sont réfutées avec SES essais (« ils restent ensemble quoi qu'on fasse » : son essai d'un seul côté).
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        a = b ⟹ a ± c = b ± c, ac = bc, a/c = b/c (c ≠ 0) ; l'opération porte sur les DEUX membres
 *   OBJECT         une égalité à x caché, deux coureurs sur un mur gradué, une règle de c, des boutons d'opération et de destinataire
 *   VARIABLE       c, le nombre de l'opération (et l'opération, et qui la reçoit)
 *   INVARIANT      les deux coureurs sur la même graduation tant que l'opération est faite des deux côtés ; x ne change jamais
 *   TRANSFORMATION chaque membre est transformé par l'opération : l'égalité s'écrit sous une autre forme, vraie pour le même x
 *   CONSTRAINT     c ∈ [−9, 9] ; ÷ 0 refusé
 *   RESISTANCE     un seul destinataire ⇒ les coureurs se séparent (écart écrit) ; × 0 vide l'égalité
 *   EVIDENCE       leurs positions, le trait pointillé vert, l'écart, l'égalité réécrite
 *   CONTRAST       les deux ensemble / un seul ; c positif / négatif ; + − / × ÷
 *   PREDICTION     aucune carte : chaque « نفّذ » est un essai jugé
 *   DISCOVERY      « ماذا لاحظتَ على موقعي المتسابقين؟ »
 *   FORMALIZATION  a = b ⟹ a + c = b + c, a − c = b − c, ac = bc, a/c = b/c (c ≠ 0)
 *   TRANSFER       « جرّب أعدادك » (son nombre n, toujours ouvert), les exercices et la banque
 *
 * « جرّب كل الإمكانيات » : NON (chaque pression EST l'essai). « جرّب أعدادك » est TOUJOURS ouvert sous le labo.
 * D'UN SEUL REGARD (§8bis) : `[data-el-glance]` enveloppe la consigne, le mur, les commandes, la lecture et le verdict.
 * ONBOARDING : `coach` (défaut true) → `LabCoach` ; `logic/equalityLanes.js › coachOf` (grab · apply · op · undo · who · next).
 * Props : `left`, `right`, `x`, `tasks` ([[ ['add', -1] ], …] : les opérations qui fabriquent chaque cible), `level`, `levels`, `coach`, `title`,
 * `lead`, `onTrial(event)`, `onFinished()` — par `state.report`.
 * CONTRAT DOM : [data-equality-lanes][data-task][data-solved][data-layout], [data-el-glance], [data-el-stage], [data-el-runner=left|right][data-value],
 * [data-el-guide][data-equal], [data-el-gap], [data-el-ops], [data-el-op=add|sub|mul|div][data-selected], [data-el-knob][data-c], [data-el-less],
 * [data-el-more], [data-el-whos], [data-el-who=both|left|right][data-selected], [data-el-apply], [data-el-undo], [data-el-readout][data-equal],
 * [data-el-verdict], [data-el-next], [data-el-prompt][data-lit], [data-el-step=<i>], [data-el-free][data-active], [data-el-free-n], [data-el-free-back],
 * [data-el-formal].
 */
const NS = 'manipulation.equalityLanes';
const LRI = '⁦';
const PDI = '⁩';
const iso = (s) => `${LRI}${s}${PDI}`;
const WIDE_MIN = 700;
const SIDE_W = 236;
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-indigo-300';
const minus = (s) => String(s).replace(/-/g, '−');
const SIGN = { add: '+', sub: '−', mul: '×', div: '÷' };
const COL = { left: '#4F46E5', right: '#0F766E', ok: '#059669', gap: '#D97706' };

const CSS = `
@keyframes el-pop { 0% { transform: scale(0.8); } 70% { transform: scale(1.06); } 100% { transform: scale(1); } }
.el-pop { animation: el-pop 280ms ease-out both; display: inline-block; }
.el-run { transition: transform 460ms cubic-bezier(.3,.7,.3,1); }
@media (prefers-reduced-motion: reduce) { .el-pop { animation: none !important; } .el-run { transition: none !important; } }
`;

export function numbersFor({ left, right, x, tasks, level }) {
  const lv = resolveLevelId(level ?? 'beginner');
  const asked = LEVELS['equality-lanes'][lv].numbers;
  return { left: left ?? asked.left, right: right ?? asked.right, x: x ?? asked.x, tasks: tasks ?? asked.tasks };
}

const opText = (op, c) => `${SIGN[op]} ${c < 0 ? `(${minus(c)})` : c}`;

export default function EqualityLanes({
  left, right, x, tasks, title, lead, level, levels: withLevels = true, coach: coachOn = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const initialNumbers = useMemo(() => numbersFor({ left, right, x, tasks, level }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'equality-lanes', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
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
  const cpSettings = useLabCheckpointSettings('equality-lanes');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
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
    lab: 'equality-lanes', step: coachStep,
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
      type="equality-lanes"
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
      <ManipulationStage className="bg-gradient-to-b from-sky-50/50 to-white">
        <div ref={boxRef} className="space-y-2" data-equality-lanes data-task={lab.ti}
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
  const uid = `el${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const wide = width >= WIDE_MIN;
  const free = L.isFree(lab);
  const task = L.taskOf(lab);
  const last = lab.last;
  const equal = L.equal(lab);
  const done = L.taskDone(lab);
  const lit = !free && done;

  const eqNow = `$${Q.eqTex(lab.cur)}$`;
  const ctx = free ? k('context.free', { n: iso(minus(lab.free.n)) }) : (lead || k('context.lanes', { eq: `$${Q.eqTex(lab.start)}$` }));
  const question = free ? k('question.free') : k('question.task', { target: `$${Q.eqTex(task.target)}$` });
  // une étape est FAITE quand la cible est atteinte ET que ses questions (LabCheckpoint) sont répondues : alors la pastille passe au vert et on fête
  const stepDone = lab.tasks.map((_, i) => !!lab.done[i] && (i !== lab.ti || !cp.blocking));
  const steps = lab.tasks.length > 1 && !free && (
    <LabStepper count={lab.tasks.length} current={lab.ti} done={stepDone} stepAttr="data-el-step" />
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
  /* ── le son (muet sauf « الصوت ») : un déclic quand la poignée de c change de graduation (au plus un toutes les 35 ms), un déclic grave
     pour « نفّذ », `flag` quand la cible est atteinte, `over` quand l'opération sépare les coureurs ou est refusée. ── */
  const sfx = useRef({ c: lab.c, at: 0 });
  useEffect(() => {
    const p = sfx.current;
    if (p.c === lab.c) return;
    const now = performance.now();
    if (now - p.at > 35) { playSfx('tooth', { pitch: lab.c > p.c ? 1 : 0.75 }); p.at = now; }
    p.c = lab.c;
  }, [lab.c]);
  const lastRef = lab.last;
  useEffect(() => {
    if (!lastRef) return;
    if (lastRef.kind === 'refused' || lastRef.broke || lastRef.lost) playSfx('over');
    else if (lastRef.reached) { playSfx('bell'); playSfx('flag'); }
    else playSfx('tooth', { pitch: 0.75 });
  }, [lastRef]);
  const prompt = (
    <PromptCard size={wide ? 'lg' : 'md'} context={<MathText>{ctx}</MathText>} contextProps={{ 'data-el-context': free ? 'free' : 'lanes' }}
      title={<MathText>{question}</MathText>} titleClassName={wide ? 'text-xl' : 'text-lg'} lamp={free ? null : lit ? 'on' : 'off'}
      titleProps={{ 'data-el-prompt': free ? 'free' : 'lanes', 'data-lit': lit ? 'true' : 'false' }} />
  );

  /* ── la lecture : l'égalité courante, une ligne sous le mur ── */
  const readout = (
    <div className="flex items-center justify-between gap-2 rounded-2xl border border-indigo-100 bg-white px-3 py-1.5" data-el-readout data-equal={equal ? 'true' : 'false'}>
      <p className={`flex min-w-0 items-center gap-1.5 text-xs font-extrabold ${equal ? 'text-emerald-700' : 'text-amber-700'}`}>
        {equal ? <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" /> : <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />}
        <span className="whitespace-nowrap">{equal ? k('read.together') : k('read.apart')}</span>
      </p>
      <div key={Q.eqTex(lab.cur)} className="el-pop whitespace-nowrap text-xl font-black text-indigo-950" dir="ltr"><MathText>{eqNow}</MathText></div>
    </div>
  );

  /* ── le verdict ── */
  const verdictLine = (() => {
    if (!last) return k('idle');
    if (last.kind === 'refused') return k('v.zero');
    const opw = iso(opText(last.op, last.c));
    if (last.lost) return k('v.lost');
    if (last.broke) return k('v.broke', { who: k(`whoOnly.${last.who}`), op: opw, l: iso(minus(last.after.left)), r: iso(minus(last.after.right)) });
    if (last.reached) return k('v.reached', { op: opw });
    return k(last.who === 'both' ? 'v.both' : 'v.same', { op: opw, v: iso(minus(last.after.left)) });
  })();
  const vkey = !last ? '' : last.kind === 'refused' ? 'refused' : last.broke ? 'broke' : last.reached ? 'right' : 'ok';
  const tone = !last ? 'indigo' : last.reached && !last.free ? 'emerald' : last.broke || last.kind === 'refused' ? 'amber' : 'indigo';
  const Icon = !last ? Hand : last.reached && !last.free ? CheckCircle2 : Sparkles;
  const canNext = L.canNext(lab) && !cp.blocking;
  const mood = !last ? 'happy' : last.reached ? 'proud' : last.broke ? 'wonder' : 'happy';
  const banner = (
    <VerdictBanner tone={tone} icon={wide ? Icon : null} size="sm" className="min-h-[3.5rem]" data-el-verdict={vkey}>
      <div className="min-w-0 space-y-1.5">
        <p className={last ? '' : 'font-bold text-indigo-900'}>{verdictLine}</p>
        {canNext && (
          <button type="button" onClick={() => setLab(L.nextTask)} data-el-next
            className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-2 border-emerald-600 bg-emerald-600 px-3.5 text-sm font-black text-white shadow-[0_3px_0_0_#047857] transition-all duration-150 active:translate-y-0.5 motion-reduce:transition-none ${ring}`}>
            {k('next')} <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </VerdictBanner>
  );

  const stageH = screenH >= 1000 ? 214 : screenH >= 850 ? 188 : 160;
  const stage = <Stage lab={lab} k={k} uid={uid} width={Math.max(300, (wide ? width - SIDE_W - 12 : width) - 24)} height={stageH} mood={mood} />;
  const legend = (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1" data-el-legend>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-extrabold text-slate-700">
        <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full" style={{ background: COL.left }} aria-hidden="true" />{k('legend.left')}</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full" style={{ background: COL.right }} aria-hidden="true" />{k('legend.right')}</span>
      </div>
      {steps || null}
    </div>
  );
  const controls = <Controls lab={lab} setLab={setLab} k={k} />;

  return (
    <>
      <div className="relative space-y-2.5" data-el-glance>
        {party.node}
        {cp.node}
        {prompt}
        {wide ? (
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <StageFrame className="min-w-0 space-y-1.5 overflow-hidden p-3" data-el-stage>{legend}{stage}{readout}</StageFrame>
              {controls}
            </div>
            <div className="flex shrink-0 flex-col gap-2.5" style={{ width: SIDE_W }}>{banner}</div>
          </div>
        ) : (
          <>
            <StageFrame className="min-w-0 space-y-1.5 overflow-hidden p-2" data-el-stage>{legend}{stage}{readout}</StageFrame>
            {controls}
            {banner}
          </>
        )}
      </div>
      <FreeCard lab={lab} setLab={setLab} k={k} />
    </>
  );
}

/* ══════════════ Le mur et les coureurs ══════════════ */

function Stage({ lab, k, uid, width, height, mood }) {
  const W = width;
  const track = L.trackOf(lab);
  const v = L.values(lab);
  const vl = Q.numFloat(v.left);
  const vr = Q.numFloat(v.right);
  const equal = L.equal(lab);
  const padX = 34;
  const xOf = (val) => padX + ((val - track.lo) / (track.hi - track.lo)) * (W - padX * 2);
  const figH = Math.max(52, Math.min(78, height - 92));
  const top = 42;
  const foot = top + figH;
  const axisY = foot + 24;
  const H = axisY + 30;
  const ticks = [];
  for (let t = Math.ceil(track.lo / track.step) * track.step; t <= track.hi + 1e-9; t += track.step) ticks.push(Math.round(t * 1e6) / 1e6);
  const showText = (val) => minus(Q.numText(val));
  // deux coureurs trop proches se tiennent épaule contre épaule (celle de gauche reste à gauche quand ils sont ensemble)
  const SEP = 58;
  const xl = xOf(vl); const xr = xOf(vr);
  const near = Math.abs(xl - xr) < SEP;
  const mid = (xl + xr) / 2;
  const half = SEP / 2;
  const clampX = (x) => Math.max(26, Math.min(W - 26, x));
  const lx = near ? clampX(mid + (xl <= xr ? -half : half)) : xl;
  const rx = near ? clampX(mid + (xl <= xr ? half : -half)) : xr;
  const gapFrac = Lin.sub(v.left, v.right);
  const gapAbs = Lin.cmp(gapFrac, 0) < 0 ? Lin.neg(gapFrac) : gapFrac;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: W, display: 'block', margin: '0 auto' }} role="img"
      aria-label={k('stageAria', { l: showText(v.left), r: showText(v.right) })} data-el-svg dir="ltr">
      <defs>
        <linearGradient id={`${uid}-lane`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FCD9B6" /><stop offset="1" stopColor="#F2A877" /></linearGradient>
      </defs>
      <rect x={6} y={foot - 7} width={W - 12} height={20} rx={10} fill={`url(#${uid}-lane)`} />
      <rect x={6} y={foot + 9} width={W - 12} height={4} rx={2} fill="#FFFFFF" opacity={0.5} />
      {ticks.map((t) => (
        <line key={`g${t}`} x1={xOf(t)} x2={xOf(t)} y1={foot - 5} y2={foot + 11} stroke="#FFFFFF" strokeOpacity={t === 0 ? 0.95 : 0.55} strokeWidth={t === 0 ? 3 : 1.5} />
      ))}
      <line x1={padX - 10} x2={W - padX + 10} y1={axisY} y2={axisY} stroke="#64748B" strokeWidth={3} strokeLinecap="round" />
      {ticks.map((t) => (
        <g key={`t${t}`}>
          <line x1={xOf(t)} x2={xOf(t)} y1={axisY - 6} y2={axisY + 6} stroke={t === 0 ? '#4338CA' : '#94A3B8'} strokeWidth={t === 0 ? 3 : 2} strokeLinecap="round" />
          <text x={xOf(t)} y={axisY + 22} textAnchor="middle" fontSize={12} fontWeight={t === 0 ? 900 : 700} fill={t === 0 ? '#312E81' : '#64748B'} fontFamily="ui-sans-serif, system-ui, sans-serif"
            style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{minus(t)}</text>
        </g>
      ))}
      {/* les traits de chute vers la graduation : confondus (vert pointillé) quand l'égalité est vraie, séparés sinon */}
      <g data-el-guide data-equal={equal ? 'true' : 'false'}>
        {equal ? (
          <line x1={xl} x2={xl} y1={foot + 8} y2={axisY} stroke={COL.ok} strokeWidth={3} strokeDasharray="5 4" strokeLinecap="round" />
        ) : (
          <>
            <line x1={xl} x2={xl} y1={foot + 8} y2={axisY} stroke={COL.left} strokeWidth={2.5} strokeDasharray="4 4" />
            <line x1={xr} x2={xr} y1={foot + 8} y2={axisY} stroke={COL.right} strokeWidth={2.5} strokeDasharray="4 4" />
            <line x1={xl} x2={xr} y1={axisY - 9} y2={axisY - 9} stroke={COL.gap} strokeWidth={4} strokeLinecap="round" data-el-gap />
          </>
        )}
        <circle cx={xl} cy={axisY} r={6} fill={equal ? COL.ok : COL.left} stroke="#FFFFFF" strokeWidth={2} />
        {!equal && <circle cx={xr} cy={axisY} r={6} fill={COL.right} stroke="#FFFFFF" strokeWidth={2} />}
      </g>
      {/* les coureurs : Salma (membre gauche), Amine (membre droit) */}
      <g className="el-run" style={{ transform: `translateX(${lx}px)` }} data-el-runner="left" data-value={Q.numText(v.left)}>
        <KidFigure cx={0} top={foot - figH} foot={foot} hairStyle="hijab" scarf="rose" outfit="pink" skin="light" mood={mood} />
      </g>
      <g className="el-run" style={{ transform: `translateX(${rx}px)` }} data-el-runner="right" data-value={Q.numText(v.right)}>
        <KidFigure cx={0} top={foot - figH} foot={foot} hairStyle="short" hair="brown" outfit="blue" skin="medium" mood={mood} />
      </g>
      <SvgPill x={lx} y={top - 12} text={showText(v.left)} fill={COL.left} size={14} pointer="down" data-el-pill="left" />
      <SvgPill x={rx} y={top - 12} text={showText(v.right)} fill={COL.right} size={14} pointer="down" data-el-pill="right" />
      {!equal && <SvgPill x={(xl + xr) / 2} y={axisY - 22} text={`${k('gap')} ${minus(Q.numText(gapAbs))}`} fill={COL.gap} size={12} />}
    </svg>
  );
}

/* ══════════════ Les commandes ══════════════ */

function Controls({ lab, setLab, k }) {
  const free = L.isFree(lab);
  const opw = opText(lab.op, lab.c);
  const canApply = L.canApply(lab);
  return (
    <LabCard className="space-y-1.5 p-2" data-el-controls>
      <div data-el-ops>
        <ChoiceTray cols={4} className="gap-1.5 !p-1" role="group" aria-label={k('opsAria')}>
          {L.OPS.map((op) => (
            <ChoiceCard key={op} size="md" ltr state={lab.op === op ? 'selected' : 'idle'} aria-pressed={lab.op === op} aria-label={k(`opAria.${op}`)}
              onClick={() => setLab((s) => L.setOp(s, op))} data-el-op={op} data-selected={lab.op === op ? 'true' : 'false'}>{SIGN[op]}</ChoiceCard>
          ))}
        </ChoiceTray>
      </div>
      <CRail c={lab.c} onChange={(c) => setLab((s) => L.setC(s, c))} k={k} />
      <div data-el-whos>
        <ChoiceTray cols={3} className="gap-1.5 !p-1" role="group" aria-label={k('whoAria')}>
          {L.WHO.map((w) => (
            <ChoiceCard key={w} size="sm" state={lab.who === w ? 'selected' : 'idle'} aria-pressed={lab.who === w}
              onClick={() => setLab((s) => L.setWho(s, w))} data-el-who={w} data-selected={lab.who === w ? 'true' : 'false'}>{k(`who.${w}`)}</ChoiceCard>
          ))}
        </ChoiceTray>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => setLab(L.apply)} data-el-apply data-refuse={canApply ? undefined : "zero"}
          className={`inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-2xl border-2 border-indigo-600 bg-indigo-600 px-4 text-lg font-black text-white shadow-[0_4px_0_0_#3730A3] transition-all duration-150 active:translate-y-0.5 disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none motion-reduce:transition-none ${ring}`}>
          <Play className="h-5 w-5" aria-hidden="true" />
          {k('apply')} <bdi dir="ltr" className="tabular-nums">{opw}</bdi>
        </button>
        <button type="button" onClick={() => setLab(L.undo)} disabled={!lab.hist.length} data-el-undo
          className={`inline-flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-2xl border-2 border-indigo-200 bg-white px-3 text-sm font-black text-indigo-900 disabled:opacity-40 ${ring}`}>
          <Undo2 className="h-4 w-4" aria-hidden="true" /> {k('undo')}
        </button>
      </div>
      {free && <span className="sr-only">{k('free.on')}</span>}
    </LabCard>
  );
}

/** La règle de c : une poignée (≥ 44 px) à glisser de −9 à 9, −/+, flèches. Le nombre est dans la poignée. */
function CRail({ c, onChange, k }) {
  const ref = useRef(null);
  const [drag, setDrag] = useState(false);
  const [lo, hi] = L.C_RANGE;
  const span = hi - lo;
  const toC = (e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r || r.width === 0) return c;
    return Math.max(lo, Math.min(hi, Math.round(lo + ((e.clientX - r.left) / r.width) * span)));
  };
  const down = (e) => { e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId); setDrag(true); onChange(toC(e)); };
  const move = (e) => { if (drag) onChange(toC(e)); };
  const up = () => setDrag(false);
  const key = (e) => {
    const m = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 };
    if (e.key in m) { e.preventDefault(); onChange(Math.max(lo, Math.min(hi, c + m[e.key]))); }
    if (e.key === 'Home') { e.preventDefault(); onChange(lo); }
    if (e.key === 'End') { e.preventDefault(); onChange(hi); }
  };
  const pct = ((c - lo) / span) * 100;
  const btn = 'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-indigo-200 bg-white text-indigo-900 disabled:opacity-40';
  return (
    <div className="flex items-center gap-2" dir="ltr" data-el-rail>
      <button type="button" className={`${btn} ${ring}`} onClick={() => onChange(Math.max(lo, c - 1))} disabled={c <= lo} aria-label={k('less')} data-el-less><Minus className="h-5 w-5" strokeWidth={3} aria-hidden="true" /></button>
      <div ref={ref} className="relative h-12 min-w-0 flex-1 touch-none select-none" style={{ touchAction: 'none' }}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} data-el-ruler>
        <div className="absolute inset-x-3 top-1/2 h-2 -translate-y-1/2 rounded-full bg-indigo-100" aria-hidden="true" />
        {Array.from({ length: span + 1 }, (_, i) => lo + i).map((n) => (
          <span key={n} aria-hidden="true" className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full ${n === 0 ? 'h-4 w-1 bg-indigo-700' : 'h-2.5 w-0.5 bg-indigo-300'}`} style={{ left: `calc(12px + (100% - 24px) * ${(n - lo) / span})` }} />
        ))}
        <div role="slider" tabIndex={0} aria-label={k('knobAria')} aria-valuemin={lo} aria-valuemax={hi} aria-valuenow={c} aria-valuetext={minus(c)} aria-orientation="horizontal"
          onKeyDown={key} data-el-knob data-c={c}
          className={`absolute top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-amber-500 bg-gradient-to-b from-amber-300 to-amber-400 text-lg font-black tabular-nums text-amber-950 shadow-[0_4px_0_0_#B45309] ${drag ? 'scale-110' : ''} ${ring}`}
          style={{ left: `calc(12px + (100% - 24px) * ${pct / 100})`, cursor: drag ? 'grabbing' : 'grab' }}>
          <bdi dir="ltr">{minus(c)}</bdi>
        </div>
      </div>
      <button type="button" className={`${btn} ${ring}`} onClick={() => onChange(Math.min(hi, c + 1))} disabled={c >= hi} aria-label={k('more')} data-el-more><Plus className="h-5 w-5" strokeWidth={3} aria-hidden="true" /></button>
    </div>
  );
}

/* ══════════════ « جرّب أعدادك أنت » : toujours ouvert ══════════════ */

function FreeCard({ lab, setLab, k }) {
  const free = L.isFree(lab);
  const [text, setText] = useState('');
  useEffect(() => { if (!lab.free) setText(''); }, [lab.free]);
  const bad = text !== '' && !Q.parseFreeNumber(text);
  const onText = (e) => {
    const raw = e.target.value.replace(/[^0-9٠-٩\-−,٫./]/g, '').slice(0, 6);
    setText(raw);
    if (Q.parseFreeNumber(raw.replace('−', '-'))) setLab((s) => L.setFree(s, raw.replace('−', '-')));
  };
  return (
    <LabCard className="space-y-2 border-emerald-200 bg-emerald-50/50 p-3" data-el-free data-active={free ? 'true' : 'false'}>
      <p className="flex items-center gap-1.5 text-sm font-black text-emerald-900"><FlaskConical className="h-4 w-4" aria-hidden="true" /> {k('free.title')}</p>
      <p className="text-xs font-bold leading-snug text-slate-600">{free ? k('free.on') : k('free.hint')}</p>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs font-black text-indigo-950">
          {k('free.number')}
          <input type="text" inputMode="text" autoComplete="off" dir="ltr" value={text} onChange={onText} maxLength={6}
            aria-label={k('free.numberAria')} aria-invalid={bad} data-el-free-n
            className={`h-11 w-28 rounded-xl border-2 ${bad ? 'border-rose-300' : 'border-emerald-300'} bg-white px-3 text-center text-xl font-black tabular-nums text-indigo-950 ${ring}`} />
        </label>
        {bad && <span className="text-xs font-bold text-rose-700">{k('free.bad')}</span>}
        {free && (
          <button type="button" onClick={() => setLab(L.toGuided)} data-el-free-back
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
  const both = w.both ?? { op: 'add', c: -1, after: { left: '2', right: '2' } };
  const one = w.one ?? { op: 'add', c: 4, who: 'left', after: { left: '7', right: '3' } };
  const whoWord = k(`whoOnly.${one.who}`);
  return [
    { text: <MathText>{k('discovery.always')}</MathText>, why: <MathText>{k('discovery.whyAlways', { who: whoWord, op: iso(opText(one.op, one.c)), l: iso(minus(one.after.left)), r: iso(minus(one.after.right)) })}</MathText> },
    { text: <MathText>{k('discovery.right')}</MathText>, correct: true },
    { text: <MathText>{k('discovery.never')}</MathText>, why: <MathText>{k('discovery.whyNever', { op: iso(opText(both.op, both.c)), v: iso(minus(both.after.left)) })}</MathText> },
  ];
}

export function Formal({ lab, k }) {
  const w = L.witnesses(lab);
  const add = lab.trials.findLast((t) => t.kind === 'apply' && !t.free && t.who === 'both' && (t.op === 'add' || t.op === 'sub') && t.c !== 0);
  const mul = lab.trials.findLast((t) => t.kind === 'apply' && !t.free && t.who === 'both' && (t.op === 'mul' || t.op === 'div') && t.c !== 0 && !t.lost);
  const line = (t) => `$${t.eq}$`;
  return (
    <div className="space-y-2 text-sm font-bold text-emerald-950" data-el-formal>
      <p className="text-center text-base" dir="ltr"><MathText>{'$a = b \\Longrightarrow a + c = b + c \\ ,\\ a - c = b - c$'}</MathText></p>
      <p className="text-center text-base" dir="ltr"><MathText>{'$a = b \\Longrightarrow a \\times c = b \\times c \\ ,\\ \\dfrac{a}{c} = \\dfrac{b}{c}\\ (c \\neq 0)$'}</MathText></p>
      <p><MathText>{k('formal.rule')}</MathText></p>
      {(add || w.both) && <p dir="ltr" className="text-center"><MathText>{line(add ?? w.both)}</MathText></p>}
      {mul && <p dir="ltr" className="text-center"><MathText>{line(mul)}</MathText></p>}
      <p><MathText>{k('formal.zero')}</MathText></p>
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite de questions de chaque tâche (par niveau, dans l'ordre des tâches) : elle interroge ce que l'élève vient de FAIRE ; la dernière finit par la règle. */
export const CHAINS = Object.freeze({
  beginner: Object.freeze([['value', 'together'], ['value', 'undoOp'], ['undoOp', 'together'], ['value', 'rule']]),
  advanced: Object.freeze([['value', 'together'], ['value', 'undoOp'], ['undoOp', 'rule']]),
});

const $ = (s) => `$${s}$`;
const Mx = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
/** Son dernier essai qui a atteint la cible dans cette tâche (la dernière opération de la tâche). */
const hitOf = (lab) => lab.trials.findLast((t) => t.kind === 'apply' && !t.free && t.task === lab.ti && t.reached);
const texOp = (txt) => String(txt).replace(/−/g, '-').replace(/×/g, '\\times ').replace(/÷/g, '\\div ');
const INVERSE = { add: ['add', (c) => -c], sub: ['sub', (c) => -c], mul: ['div', (c) => c], div: ['mul', (c) => c] };

export const QUESTIONS = {
  value: (lab, task, k) => {
    const t = hitOf(lab);
    if (!t) return null;
    const v = Lin.parseNumber(t.after.left);
    const before = Lin.parseNumber(t.before.left);
    const bads = [before, Lin.neg(v), Lin.add(v, 1)].filter((n, i, arr) => !Lin.eq(n, v) && arr.findIndex((m) => Lin.eq(m, n)) === i).slice(0, 2);
    const o = { op: iso(opText(t.op, t.c)), before: iso(minus(t.before.left)), v: iso(minus(t.after.left)) };
    const ordered = [bads[0], v, bads[1]];
    if (lab.ti % 2) ordered.reverse();
    return {
      id: 'value', kind: 'choice', cols: 3,
      prompt: Mx(k, 'value.prompt', o),
      options: ordered.map((n) => (Lin.eq(n, v)
        ? { text: <MathText>{$(minus(Lin.fracText(n)))}</MathText>, correct: true }
        : { text: <MathText>{$(minus(Lin.fracText(n)))}</MathText>, why: Mx(k, Lin.eq(n, before) ? 'value.whyBefore' : 'value.whySign', { ...o, w: iso(minus(Lin.fracText(n))) }) })),
      hints: [Mx(k, 'value.hint1', o), Mx(k, 'value.hint2', o)],
      explain: Mx(k, 'value.explain', o),
    };
  },
  together: (lab, task, k) => {
    const t = hitOf(lab);
    if (!t) return null;
    const o = { op: iso(opText(t.op, t.c)), l: iso(minus(t.after.left)), eq: $(t.eq) };
    return {
      id: 'together', kind: 'choice',
      prompt: Mx(k, 'together.prompt', o),
      options: [
        { text: Mx(k, 'together.one', o), why: Mx(k, 'together.whyOne', o) },
        { text: Mx(k, 'together.both', o), correct: true },
        { text: Mx(k, 'together.x', o), why: Mx(k, 'together.whyX', o) },
      ],
      hints: [Mx(k, 'together.hint1', o), Mx(k, 'together.hint2', o)],
      explain: Mx(k, 'together.explain', o),
    };
  },
  undoOp: (lab, task, k) => {
    const t = hitOf(lab);
    if (!t) return null;
    const [iop, ic] = INVERSE[t.op];
    const back = opText(iop, ic(t.c));
    const again = opText(t.op, t.c);
    const other = t.op === 'mul' || t.op === 'div' ? opText(t.op === 'mul' ? 'mul' : 'div', -t.c) : opText(t.op, 2 * t.c);
    const o = { op: iso(opText(t.op, t.c)), back: iso(back), again: iso(again), other: iso(other), before: iso(minus(t.before.left)) };
    const wrongs = [{ text: <MathText>{$(texOp(again))}</MathText>, why: Mx(k, 'undoOp.whyAgain', o) }, { text: <MathText>{$(texOp(other))}</MathText>, why: Mx(k, 'undoOp.whyOther', o) }];
    const right = { text: <MathText>{$(texOp(back))}</MathText>, correct: true };
    const out = [...wrongs];
    out.splice(lab.ti % 3, 0, right);
    return {
      id: 'undoOp', kind: 'choice', cols: 3,
      prompt: Mx(k, 'undoOp.prompt', o), options: out,
      hints: [Mx(k, 'undoOp.hint1', o), Mx(k, 'undoOp.hint2', o)],
      explain: Mx(k, 'undoOp.explain', o),
    };
  },
  rule: (lab, task, k) => {
    const w = L.witnesses(lab);
    const one = w.one ?? { op: 'add', c: 4, who: 'left', after: { left: '7', right: '3' } };
    const o = { who: k(`whoOnly.${one.who}`), op: iso(opText(one.op, one.c)), l: iso(minus(one.after.left)), r: iso(minus(one.after.right)) };
    return {
      id: 'rule', kind: 'choice',
      prompt: <MathText>{k('discovery.prompt')}</MathText>,
      options: discoveryOptions(lab, k),
      hints: [Mx(k, 'rule.hint1', o), Mx(k, 'rule.hint2', o)],
      explain: <Formal lab={lab} k={k} />,
    };
  },
};
