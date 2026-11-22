import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Hand, CheckCircle2, Sparkles, ChevronLeft, FlaskConical, Undo2, Minus, Plus, Repeat, Equal, Divide, ShieldCheck } from 'lucide-react';
import * as Q from '@smarter-academy/core/arithmetic/equalities.js';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import MathText from '../../components/MathText';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import useDragInteraction from '../useDragInteraction';
import DraggableObject from '../primitives/DraggableObject';
import { LabCard, StageFrame, PromptCard, VerdictBanner, RoundButton } from '../primitives/LabKit';
import KidFigure from '../primitives/KidFigure';
import { useLabCoach } from '../primitives/LabCoach';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import { LEVELS } from '../levels';
import * as L from '../logic/termFerry';

/**
 * term-ferry — LE SIGNE D'UN TERME SOUS LA MAIN (3AM, unité 5 « المساويات – المتباينات – المعادلات », درس « المعادلات من الدرجة الأولى بمجهول
 * واحد », 2026-10-21). La logique, exacte, est dans `logic/termFerry.js` (sur `packages/core/arithmetic/equalities.js`, importé par chemin).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. La main PORTE une caisse (un terme) d'une rive (un membre) à l'autre et CHOISIT son signe à l'arrivée (deux quais : « كما هو » /
 *    « بعكس إشارته ») ; puis elle règle le diviseur c quand x reste seul d'un côté.
 * B. Une équation ax + b = cx + d dont la solution est CACHÉE : traverser avec le signe changé = ajouter l'opposé aux deux membres (même
 *    solution) ; la barque écrit la ligne de calcul (9x + 1 − 5x = 5x − 7 − 5x, soit 4x + 1 = −7).
 * C. La résistance : une caisse qui garde son signe CASSE l'équation — le refus est le calcul des deux membres au x caché (« 9 et 4 : plus égaux »).
 *    Diviser par 0 est refusé ; un diviseur qui n'isole pas x laisse un coefficient ≠ 1.
 * D. La phase formelle écrit ses lignes : « نقل حدّ = إضافة معاكسه إلى الطرفين », « ax = n ⟹ x = n/a », la vérification.
 * E. Les fausses conjectures sont réfutées avec SES essais (« le signe ne change pas » : son essai refusé et ses valeurs).
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        résoudre ax + b = cx + d : opérations sur les deux membres, regrouper les x d'un côté, les nombres de l'autre, diviser
 *   OBJECT         deux rives (les membres), des caisses (les termes), deux quais de signe, un diviseur, une passeuse (KidFigure, hijab)
 *   VARIABLE       le SIGNE du terme à l'arrivée (puis le diviseur c)
 *   INVARIANT      la solution cachée x* : les deux membres sont égaux en x* après chaque traversée correcte
 *   TRANSFORMATION traverser = ajouter l'opposé aux deux membres ; l'équation se réécrit et se réduit (les termes semblables fusionnent)
 *   CONSTRAINT     une caisse traverse vers l'AUTRE rive ; ÷ 0 interdit
 *   RESISTANCE     « كما هو » casse l'égalité (valeurs en x* écrites) ; ÷ 0 refusé
 *   EVIDENCE       les lignes de la barque, le nouveau coefficient, la vérification des deux membres en x
 *   CONTRAST       caisses de x / de nombres ; signe gardé (refusé) / changé ; ÷ a (x seul) / ÷ autre
 *   PREDICTION     aucune carte : chaque dépôt est un essai jugé
 *   DISCOVERY      « ماذا يحدث لإشارة الحدّ حين يعبر؟ » (مبتدئ) ; « ماذا نفعل بمعامل x؟ » (متقدم)
 *   FORMALIZATION  نقل حدّ ⟺ إضافة معاكسه إلى الطرفين ؛ ax = n ⟹ x = n/a ؛ التحقق
 *   TRANSFER       « جرّب أعدادك » (SA équation), les exercices, les مسائل et la banque
 *
 * « جرّب كل الإمكانيات » : NON (chaque dépôt EST l'essai). « جرّب أعدادك » est TOUJOURS ouvert sous le labo.
 * D'UN SEUL REGARD (§8bis) : `[data-tf-glance]` enveloppe la consigne, la page de calcul, les deux rives, les commandes et le verdict.
 * ONBOARDING : `coach` (défaut true) → `LabCoach` ; `logic/termFerry.js › coachOf` (carry · tryKeep · divide · go · check · next).
 * Props : `tasks` ([{ left, right }]), `level`, `levels`, `coach`, `title`, `lead`, `onTrial(event)`, `onFinished()` — par `state.report`.
 * CONTRAT DOM : [data-term-ferry][data-task][data-solved][data-layout], [data-tf-glance], [data-tf-paper][data-tf-line], [data-tf-bank=L|R],
 * [data-tf-crate=<id>][data-kind][data-sign], [data-tf-dock=keep|flip][data-bank], [data-tf-divide], [data-tf-stepper], [data-tf-c], [data-tf-less],
 * [data-tf-more], [data-tf-divide-go], [data-tf-undo], [data-tf-check], [data-tf-verdict], [data-tf-next], [data-tf-step=<i>], [data-tf-free][data-active],
 * [data-tf-free-eq], [data-tf-free-back], [data-tf-formal], [data-tf-kid][data-mood].
 */
const NS = 'manipulation.termFerry';
const LRI = '⁦';
const PDI = '⁩';
const iso = (s) => `${LRI}${s}${PDI}`;
const WIDE_MIN = 700;
const SIDE_W = 236;
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-indigo-300';
const minus = (s) => String(s).replace(/-/g, '−');

const CSS = `
@keyframes tf-pop { 0% { transform: scale(0.8); } 70% { transform: scale(1.06); } 100% { transform: scale(1); } }
.tf-pop { animation: tf-pop 280ms ease-out both; display: inline-block; }
@keyframes tf-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
.tf-bob { animation: tf-bob 2.6s ease-in-out infinite; }
@keyframes tf-wave { 0% { background-position: 0 0; } 100% { background-position: 64px 0; } }
.tf-water { background-image: repeating-linear-gradient(100deg, rgba(255,255,255,0.22) 0 6px, transparent 6px 22px); animation: tf-wave 5s linear infinite; }
@media (prefers-reduced-motion: reduce) { .tf-pop, .tf-bob, .tf-water { animation: none !important; } }
`;

export function numbersFor({ tasks, level }) {
  const lv = level === 'advanced' ? 'advanced' : 'beginner';
  return { tasks: tasks ?? LEVELS['term-ferry'][lv].numbers.tasks };
}

/** Le texte d'une caisse : « +3x », « −7 », « −x » (signe toujours écrit). */
const crateText = (kind, v) => {
  const neg = Lin.cmp(v, 0) < 0;
  const abs = neg ? Lin.neg(v) : v;
  const body = kind === 'x' ? (Lin.eq(abs, 1) ? 'x' : `${Lin.fracDecimal(abs) ?? Lin.fracText(abs)}x`) : (Lin.fracDecimal(abs) ?? Lin.fracText(abs));
  return `${neg ? '−' : '+'} ${body}`;
};

export default function TermFerry({
  tasks, title, lead, level, levels: withLevels = true, coach: coachOn = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const initialNumbers = useMemo(() => numbersFor({ tasks, level }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'term-ferry', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nums = state.numbers;
  const numsKey = JSON.stringify(nums);
  const [lab, setLab] = useState(() => L.init(nums));
  const [scene, setScene] = useState({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: 0 });
  if (scene.key !== numsKey || scene.epoch !== state.epoch) {
    // « إعادة » (resetCount), un autre niveau ou d'autres nombres : TOUT recommence — la tâche 1, les essais et les questions du labo
    setScene({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: scene.inits + 1 });
    setLab(L.init(nums));
  }
  const advanced = state.level === 'advanced';
  // les questions pendant le labo : la suite de la tâche courante (construite seulement quand la tâche est faite) ; la dernière finit par la règle
  const cpSettings = useLabCheckpointSettings('term-ferry');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const set = CHAINS[advanced ? 'advanced' : 'beginner'];
  const chain = cpOn && cpSettings.enabled && !L.isFree(lab) && set.length === lab.tasks.length ? set[lab.ti] : null;
  const ruleByCheckpoint = cpOn && cpSettings.enabled && set.length === lab.tasks.length;
  const cp = useLabCheckpoint({
    id: chain ? `${advanced ? 'a' : 'b'}${lab.ti}` : null,
    questions: chain && L.taskDone(lab) ? chain.map((q) => QUESTIONS[q](lab, L.taskOf(lab), k, advanced)).filter(Boolean) : null,
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
    lab: 'term-ferry', step: coachStep,
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
    <ManipulationDiscovery state={state} prompt={<MathText>{k(`discovery.${advanced ? 'divide' : 'sign'}.prompt`)}</MathText>}
      options={discoveryOptions(lab, advanced, k)} formal={<Formal lab={lab} advanced={advanced} k={k} />} />
  );

  return (
    <ManipulationShell
      type="term-ferry"
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
        <div ref={boxRef} className="space-y-2" data-term-ferry data-task={lab.ti}
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
  const wide = width >= WIDE_MIN;
  const free = L.isFree(lab);
  const done = L.taskDone(lab);
  const lit = !free && done;
  const last = lab.last;
  const startEq = free ? lab.free.eq : L.taskOf(lab).eq;
  const solvedNow = L.solved(lab);
  const sh = L.shape(lab);
  const canDivide = L.canDivide(lab);

  const drag = useDragInteraction({
    onDrop: (src, zone) => setLab((s) => L.move(s, src, zone.endsWith(':flip'))),
    accepts: (src, zone) => (src.split(':')[0] === zone.split(':')[1] ? '' : true),
  });

  const ctx = free ? k('context.free') : (lead || k('context.ferry', { eq: `$${Q.eqTex(startEq)}$` }));
  const question = free ? k('question.free') : k('question.task');
  // une étape est FAITE quand x est trouvé ET que ses questions (LabCheckpoint) sont répondues : alors la pastille passe au vert et on fête
  const stepDone = lab.tasks.map((_, i) => !!lab.done[i] && (i !== lab.ti || !cp.blocking));
  const steps = lab.tasks.length > 1 && !free && (
    <LabStepper count={lab.tasks.length} current={lab.ti} done={stepDone} stepAttr="data-tf-step" />
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
  /* ── le son (muet sauf « الصوت ») : un déclic quand une caisse traverse (plus grave si elle garde son signe et revient), une cloche quand x
     reste seul, `flag` quand l'objectif est atteint ou la vérification juste, `over` pour le refus (signe gardé, ÷ 0). ── */
  const nTrials = lab.trials.length;
  const lastKind = lab.last?.kind;
  useEffect(() => {
    if (!nTrials || !lab.last) return;
    const l = lab.last;
    if (l.kind === 'refused') playSfx('over');
    else if (l.kind === 'check') playSfx('flag');
    else if (l.solved) { playSfx('bell'); playSfx('flag'); }
    else playSfx('tooth', { pitch: l.kind === 'divide' ? 0.75 : 1 });
  }, [nTrials, lastKind]); // eslint-disable-line react-hooks/exhaustive-deps
  const prompt = (
    <PromptCard size={wide ? 'lg' : 'md'} context={<MathText>{ctx}</MathText>} contextProps={{ 'data-tf-context': free ? 'free' : 'ferry' }}
      title={<MathText>{question}</MathText>} titleClassName={wide ? 'text-xl' : 'text-lg'} lamp={free ? null : lit ? 'on' : 'off'}
      titleProps={{ 'data-tf-prompt': free ? 'free' : 'ferry', 'data-lit': lit ? 'true' : 'false' }} />
  );

  /* ── la page de calcul : la ligne de la barque, puis l'équation courante ── */
  const paper = (
    <div className="space-y-0.5 rounded-2xl border border-indigo-100 bg-white px-3 py-1.5 text-center" data-tf-paper>
      <div className="min-h-[1.6rem] text-sm font-bold text-slate-500" dir="ltr" data-tf-line={lab.lines ? 'op' : ''}>
        {lab.lines ? <MathText>{`$${lab.lines.op}$`}</MathText> : <span className="text-xs" dir="rtl">{k('paper.idle')}</span>}
      </div>
      <div key={Q.eqTex(lab.cur)} className="tf-pop whitespace-nowrap text-2xl font-black text-indigo-950" dir="ltr" data-tf-equation><MathText>{`$${Q.eqTex(lab.cur)}$`}</MathText></div>
    </div>
  );

  /* ── les rives, les caisses, les quais ── */
  const crates = L.crates(lab);
  const heldSide = drag.held ? drag.held.split(':')[0] : null;
  const bank = (side) => (
    <div className="min-w-0 space-y-1.5 rounded-2xl border-2 border-emerald-200 bg-gradient-to-b from-emerald-50 to-lime-50 p-1.5" dir="rtl" data-tf-bank={side}>
      <p className="text-center text-[11px] font-black text-emerald-900/70">{k(`bank.${side}`)}</p>
      <div className="flex min-h-[58px] flex-wrap items-center justify-center gap-1.5" dir="ltr">
        {crates.filter((c) => c.side === side).map((c) => {
          const neg = Lin.cmp(c.value, 0) < 0;
          return (
            <DraggableObject key={c.id} drag={drag} id={c.id} label={k('crateAria', { t: crateText(c.kind, c.value) })}
              className={`flex min-h-[52px] min-w-[64px] items-center justify-center rounded-xl border-2 px-2.5 text-xl font-black tabular-nums shadow-[0_3px_0_0_rgba(120,53,15,0.35)] ${neg ? 'border-rose-300 bg-gradient-to-b from-rose-100 to-rose-200 text-rose-900' : 'border-amber-400 bg-gradient-to-b from-amber-100 to-amber-200 text-amber-950'}`}
              heldClassName="ring-4 ring-indigo-300 shadow-xl">
              <span data-tf-crate={c.id} data-kind={c.kind} data-sign={neg ? '-' : '+'} dir="ltr">{crateText(c.kind, c.value)}</span>
            </DraggableObject>
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-1" data-tf-docks>
        {['keep', 'flip'].map((id) => {
          const zid = `to:${side}:${id}`;
          const off = heldSide === side;
          const zp = drag.zoneProps(zid, { disabled: off });
          return (
            <div key={id} {...zp} role="button" tabIndex={0} data-tf-dock={id} data-bank={side} aria-label={k(`dockAria.${id}`)}
              className={`flex min-h-[44px] items-center justify-center gap-1 rounded-xl border-2 border-dashed px-1 text-center text-[11px] font-black leading-tight transition-colors ${ring} ${off ? 'opacity-40' : ''} ${zp['data-drop-active'] ? 'border-amber-500 bg-amber-100' : zp['data-drop-ready'] ? 'border-amber-400 bg-amber-50 shadow-[0_0_0_3px_rgba(251,191,36,0.3)]' : 'border-emerald-300 bg-white/80'} text-emerald-950`}>
              {id === 'flip' ? <Repeat className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> : <Equal className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
              <span>{k(`dock.${id}`)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
  const verdictMood = !last ? 'happy' : last.kind === 'refused' ? 'wonder' : (last.solved || (last.kind === 'check' && last.ok)) ? 'proud' : 'happy';
  const river = width < 520 ? null : (
    <div className="relative w-[58px] shrink-0 overflow-hidden rounded-2xl bg-gradient-to-b from-sky-200 to-sky-400" aria-hidden="true" data-tf-river>
      <div className="tf-water absolute inset-0" />
      <svg viewBox="0 0 58 120" className="tf-bob absolute left-0 top-1/2 w-full -translate-y-1/2" data-tf-kid data-mood={verdictMood}>
        <path d="M6 78 h46 l-6 14 h-34 z" fill="#92400E" stroke="#78350F" strokeWidth="1.5" />
        <rect x="8" y="76" width="42" height="4" rx="2" fill="#B45309" />
        <KidFigure cx={29} top={24} foot={78} hairStyle="hijab" scarf="mint" outfit="teal" skin="light" mood={verdictMood} shadow={false} />
      </svg>
    </div>
  );
  const banks = (
    <div className="flex items-stretch gap-1.5" dir="ltr" data-tf-banks>
      <div className="min-w-0 flex-1">{bank('L')}</div>
      {river}
      <div className="min-w-0 flex-1">{bank('R')}</div>
    </div>
  );

  /* ── la division : quand x reste seul d'un côté ── */
  const divideCard = (
    <LabCard className="flex items-center gap-2 p-2" data-tf-divide data-ready={canDivide ? 'true' : 'false'}>
      <p className="shrink-0 text-xs font-black leading-tight text-indigo-900/80">{k('divide.title')}</p>
      <div className="flex min-w-0 flex-1 items-center justify-center gap-2" dir="ltr" data-tf-stepper>
        <RoundButton size={44} onClick={() => setLab((s) => L.setC(s, s.c - 1))} disabled={!canDivide || lab.c <= L.DIVISOR_RANGE[0]} aria-label={k('less')} data-tf-less><Minus className="h-5 w-5" strokeWidth={3} aria-hidden="true" /></RoundButton>
        <span className="min-w-[56px] rounded-2xl border border-indigo-100 bg-[#F5F6FF] px-2 py-1 text-center text-2xl font-black tabular-nums text-indigo-900" data-tf-c={lab.c}><bdi dir="ltr">{minus(lab.c)}</bdi></span>
        <RoundButton primary size={44} onClick={() => setLab((s) => L.setC(s, s.c + 1))} disabled={!canDivide || lab.c >= L.DIVISOR_RANGE[1]} aria-label={k('more')} data-tf-more><Plus className="h-5 w-5" strokeWidth={3} aria-hidden="true" /></RoundButton>
      </div>
      <button type="button" onClick={() => setLab(L.divide)} disabled={!canDivide} data-tf-divide-go
        className={`inline-flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-2xl border-2 border-indigo-600 bg-indigo-600 px-3 text-sm font-black text-white shadow-[0_3px_0_0_#3730A3] transition-all active:translate-y-0.5 disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none motion-reduce:transition-none ${ring}`}>
        <Divide className="h-4 w-4" aria-hidden="true" /> {k('divide.go')}
      </button>
    </LabCard>
  );
  const actions = (
    <div className="flex items-center gap-2">
      <button type="button" onClick={() => setLab(L.undo)} disabled={!lab.hist.length} data-tf-undo
        className={`inline-flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-2xl border-2 border-indigo-200 bg-white px-3 text-sm font-black text-indigo-900 disabled:opacity-40 ${ring}`}>
        <Undo2 className="h-4 w-4" aria-hidden="true" /> {k('undo')}
      </button>
      <button type="button" onClick={() => setLab(L.check)} disabled={!solvedNow} data-tf-check
        className={`inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-2xl border-2 border-emerald-500 bg-emerald-500 px-3 text-sm font-black text-white shadow-[0_3px_0_0_#047857] transition-all active:translate-y-0.5 disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none motion-reduce:transition-none ${ring}`}>
        <ShieldCheck className="h-4 w-4" aria-hidden="true" /> {k('check')}
      </button>
    </div>
  );

  /* ── le verdict ── */
  const verdictLine = (() => {
    if (!last) return k('idle');
    if (last.kind === 'refused' && last.reason === 'zero') return k('v.zero');
    if (last.kind === 'refused') return k('v.keep', { crate: iso(minus(last.value)), l: iso(minus(last.values.left)), r: iso(minus(last.values.right)) });
    if (last.kind === 'move' && last.solved) return k('v.solved', { x: iso(minus(last.solution)) });
    if (last.kind === 'move') return k('v.moved', { crate: iso(minus(last.value)), landed: iso(minus(last.landed)), op: iso(minus(last.op)) });
    if (last.kind === 'divide') return last.solved ? k('v.solved', { x: iso(minus(last.solution)) }) : k('v.divided', { c: iso(minus(last.c)) });
    if (last.kind === 'check') return k('v.check', { x: iso(minus(last.x)), l: iso(minus(last.left)), r: iso(minus(last.right)) });
    return k('idle');
  })();
  const vkey = !last ? '' : last.kind === 'refused' ? 'refused' : last.kind === 'check' ? 'check' : (last.kind === 'divide' || last.kind === 'move') && last.solved ? 'right' : 'ok';
  const tone = !last ? 'indigo' : last.kind === 'refused' ? 'amber' : (last.kind === 'check' || ((last.kind === 'divide' || last.kind === 'move') && last.solved)) ? 'emerald' : 'indigo';
  const Icon = !last ? Hand : last.kind === 'refused' ? Sparkles : CheckCircle2;
  const canNext = L.canNext(lab) && !cp.blocking;
  const banner = (
    <VerdictBanner tone={tone} icon={wide ? Icon : null} size="sm" className="min-h-[3.5rem]" data-tf-verdict={vkey}>
      <div className="min-w-0 space-y-1.5">
        <p className={last ? '' : 'font-bold text-indigo-900'}><MathText>{verdictLine}</MathText></p>
        {canNext && lab.checked && (
          <button type="button" onClick={() => setLab(L.nextTask)} data-tf-next
            className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-2 border-emerald-600 bg-emerald-600 px-3.5 text-sm font-black text-white shadow-[0_3px_0_0_#047857] transition-all duration-150 active:translate-y-0.5 motion-reduce:transition-none ${ring}`}>
            {k('next')} <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </VerdictBanner>
  );
  void sh; void screenH;

  const body = (
    <div className="min-w-0 space-y-2">
      <StageFrame className="min-w-0 space-y-1.5 overflow-hidden p-2" data-tf-stage>
        {steps && <div className="flex justify-end">{steps}</div>}
        {paper}
        {banks}
      </StageFrame>
      {divideCard}
      {actions}
    </div>
  );
  return (
    <>
      <div className="relative space-y-2.5" data-tf-glance>
        {party.node}
        {cp.node}
        {prompt}
        {wide ? (
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">{body}</div>
            <div className="flex shrink-0 flex-col gap-2.5" style={{ width: SIDE_W }}>{banner}</div>
          </div>
        ) : (
          <>{body}{banner}</>
        )}
      </div>
      <FreeCard lab={lab} setLab={setLab} k={k} />
    </>
  );
}

/* ══════════════ « جرّب أعدادك أنت » : toujours ouvert ══════════════ */

function FreeCard({ lab, setLab, k }) {
  const free = L.isFree(lab);
  const [text, setText] = useState('');
  useEffect(() => { if (!lab.free) setText(''); }, [lab.free]);
  const parsed = text.trim() === '' ? null : L.parseFree(text);
  const bad = parsed?.error;
  const onText = (e) => {
    const raw = e.target.value.replace(/[^0-9٠-٩x=+\-−,٫./\s]/g, '').slice(0, 24);
    setText(raw);
    if (L.parseFree(raw).eq) setLab((s) => L.setFree(s, raw));
  };
  return (
    <LabCard className="space-y-2 border-emerald-200 bg-emerald-50/50 p-3" data-tf-free data-active={free ? 'true' : 'false'}>
      <p className="flex items-center gap-1.5 text-sm font-black text-emerald-900"><FlaskConical className="h-4 w-4" aria-hidden="true" /> {k('free.title')}</p>
      <p className="text-xs font-bold leading-snug text-slate-600">{free ? k('free.on') : k('free.hint')}</p>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs font-black text-indigo-950">
          {k('free.equation')}
          <input type="text" inputMode="text" autoComplete="off" dir="ltr" value={text} onChange={onText} maxLength={24}
            aria-label={k('free.equationAria')} aria-invalid={!!bad} data-tf-free-eq placeholder="3x+2=x+8"
            className={`h-11 w-44 rounded-xl border-2 ${bad ? 'border-rose-300' : 'border-emerald-300'} bg-white px-3 text-center text-lg font-black tabular-nums text-indigo-950 ${ring}`} />
        </label>
        {bad && <span className="text-xs font-bold text-rose-700">{k(`free.${bad}`)}</span>}
        {free && (
          <button type="button" onClick={() => setLab(L.toGuided)} data-tf-free-back
            className={`inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-emerald-200 bg-white px-3 text-xs font-bold text-emerald-900 ${ring}`}>
            <Undo2 className="h-4 w-4" aria-hidden="true" /> {k('free.back')}
          </button>
        )}
      </div>
    </LabCard>
  );
}

/* ══════════════ La découverte et la règle ══════════════ */

export function discoveryOptions(lab, advanced, k) {
  const w = L.witnesses(lab);
  if (advanced) {
    const d = w.div;
    const a = d?.a ?? '4'; const n = d?.n ?? '-8';
    const an = Lin.parseNumber(a); const nn = Lin.parseNumber(n);
    const aTex = Lin.fracLatex(an); const nTex = Lin.fracLatex(nn);
    const sub = `${aTex === '1' ? '' : aTex}x - ${aTex} = ${Lin.fracLatex(Lin.sub(nn, an))}`;
    const mulEq = `${Lin.fracLatex(Lin.mul(an, an))}x = ${Lin.fracLatex(Lin.mul(an, nn))}`;
    return [
      { text: <MathText>{k('discovery.divide.minus')}</MathText>, why: <MathText>{k('discovery.divide.whyMinus', { a: aTex, eq: sub })}</MathText> },
      { text: <MathText>{k('discovery.divide.right')}</MathText>, correct: true },
      { text: <MathText>{k('discovery.divide.times')}</MathText>, why: <MathText>{k('discovery.divide.whyTimes', { a: aTex, n: nTex, eq: mulEq })}</MathText> },
    ];
  }
  const r = w.refused ?? { crate: 'x', value: '1', values: { left: '9', right: '4' } };
  const f = w.flipped ?? { value: '1', landed: '-1' };
  return [
    { text: <MathText>{k('discovery.sign.keep')}</MathText>, why: <MathText>{k('discovery.sign.whyKeep', { crate: iso(minus(r.value)), l: iso(minus(r.values.left)), r: iso(minus(r.values.right)) })}</MathText> },
    { text: <MathText>{k('discovery.sign.right')}</MathText>, correct: true },
    { text: <MathText>{k('discovery.sign.plus')}</MathText>, why: <MathText>{k('discovery.sign.whyPlus', { v: iso(minus(f.value)), t: iso(minus(f.landed)) })}</MathText> },
  ];
}

export function Formal({ lab, advanced, k }) {
  const startEq = lab.free ? lab.free.eq : L.taskOf(lab).eq;
  const mv = lab.trials.findLast((t) => t.kind === 'move' && t.ok && !t.free);
  const dv = lab.trials.findLast((t) => t.kind === 'divide' && t.solved);
  const ck = lab.trials.findLast((t) => t.kind === 'check' && t.ok);
  return (
    <div className="space-y-2 text-sm font-bold text-emerald-950" data-tf-formal={advanced ? 'divide' : 'sign'}>
      <p className="text-center text-base" dir="ltr"><MathText>{`$${Q.eqTex(startEq)}$`}</MathText></p>
      {mv && <p className="text-center text-base" dir="ltr"><MathText>{`$${mv.eq}$`}</MathText></p>}
      <p><MathText>{k('formal.rule')}</MathText></p>
      {advanced && <p><MathText>{k('formal.divide')}</MathText></p>}
      {advanced && dv && <p className="text-center text-base" dir="ltr"><MathText>{`$${dv.eq}$`}</MathText></p>}
      {ck && <p><MathText>{k('formal.check', { x: iso(minus(ck.x)), l: iso(minus(ck.left)), r: iso(minus(ck.right)) })}</MathText></p>}
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite de questions de chaque tâche (par niveau, dans l'ordre des tâches) : elle interroge ce que l'élève vient de FAIRE ; la dernière finit par la règle. */
export const CHAINS = Object.freeze({
  beginner: Object.freeze([['op', 'solution'], ['divideBy', 'check', 'rule']]),
  advanced: Object.freeze([['op', 'solution'], ['negDivide', 'check'], ['sign', 'rule']]),
});

const $ = (s) => `$${s}$`;
const Mx = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const X = (f) => iso(minus(Lin.fracText(f)));
/** « + 5x », « − 7 », « + x » : une caisse avec son signe. */
const termText = (kind, v) => {
  const neg = String(v).startsWith('-');
  const abs = String(v).replace('-', '');
  const body = kind === 'x' ? (abs === '1' ? 'x' : `${abs}x`) : abs;
  return iso(`${neg ? '−' : '+'} ${body}`);
};
const flipTrial = (lab, negative = false) => {
  const all = lab.trials.filter((t) => t.kind === 'move' && t.ok && t.flip && !t.free && t.task === lab.ti);
  return (negative ? all.find((t) => t.landed.startsWith('-')) : null) ?? all[0];
};
const divideTrial = (lab) => lab.trials.findLast((t) => t.kind === 'divide' && !t.free && t.task === lab.ti);
const distinct = (list, avoid) => list.reduce((acc, v) => (v && ![...avoid, ...acc].some((u) => Lin.eq(u, v)) ? [...acc, v] : acc), []);
/** Trois options numériques : la bonne à la place `pos` ; chaque mauvaise porte son `why(w)` (le CALCUL qui la réfute). */
function numberOptions(good, bads, pos, why) {
  const wrong = distinct(bads, [good]).slice(0, 2).map((w) => ({ text: <MathText>{$(minus(Lin.fracText(w)))}</MathText>, why: why(w) }));
  const out = [...wrong];
  out.splice(Math.min(pos, out.length), 0, { text: <MathText>{$(minus(Lin.fracText(good)))}</MathText>, correct: true });
  return out;
}

/** Chaque question est construite sur LES essais de la tâche (rien n'est écrit en dur) ; `k` : les textes de `termFerry`. */
export const QUESTIONS = {
  op: (lab, task, k) => {
    const t = flipTrial(lab);
    if (!t) return null;
    const o = { crate: termText(t.crate, t.value), landed: termText(t.crate, t.landed), op: termText(t.crate, t.op) };
    return {
      id: 'op', kind: 'choice',
      prompt: Mx(k, 'op.prompt', o),
      options: [
        { text: Mx(k, 'op.one', o), why: Mx(k, 'op.whyOne', o) },
        { text: Mx(k, 'op.both', o), correct: true },
        { text: Mx(k, 'op.times', o), why: Mx(k, 'op.whyTimes', o) },
      ],
      hints: [Mx(k, 'op.hint1', o), Mx(k, 'op.hint2', o)],
      explain: Mx(k, 'op.explain', o),
    };
  },
  solution: (lab, task, k) => {
    const x = task.eq.x;
    const dv = divideTrial(lab);
    const bads = [Lin.neg(x), dv ? Lin.parseNumber(dv.n) : null, dv ? Lin.parseNumber(dv.a) : null, Lin.add(x, 1)];
    const o = { eq: $(Q.eqTex(task.eq)) };
    return {
      id: 'solution', kind: 'choice', cols: 3,
      prompt: Mx(k, 'solution.prompt', o),
      options: numberOptions(x, bads, lab.ti % 3, (w) => {
        const v = Q.checkAt(task.eq, w);
        return Mx(k, 'solution.wrong', { x: X(w), l: iso(minus(Lin.fracText(v.left))), r: iso(minus(Lin.fracText(v.right))) });
      }),
      hints: [Mx(k, 'solution.hint1', o), Mx(k, 'solution.hint2', o)],
      explain: Mx(k, 'solution.explain', { x: X(x) }),
    };
  },
  divideBy: (lab, task, k) => {
    const dv = divideTrial(lab);
    if (!dv) return null;
    const o = { a: iso(minus(dv.a)), n: iso(minus(dv.n)), x: iso(minus(dv.solution ?? '')) };
    return {
      id: 'divideBy', kind: 'choice',
      prompt: <MathText>{k('discovery.divide.prompt')}</MathText>,
      options: discoveryOptions(lab, true, k),
      hints: [Mx(k, 'divideBy.hint1', o), Mx(k, 'divideBy.hint2', o)],
      explain: Mx(k, 'divideBy.explain', o),
    };
  },
  negDivide: (lab, task, k) => {
    const dv = divideTrial(lab);
    if (!dv) return null;
    const abs = dv.a.replace('-', '');
    const o = { a: iso(minus(dv.a)), abs: iso(abs), n: iso(minus(dv.n)) };
    return {
      id: 'negDivide', kind: 'choice',
      prompt: Mx(k, 'negDivide.prompt', o),
      options: [
        { text: Mx(k, 'negDivide.abs', o), why: Mx(k, 'negDivide.whyAbs', o) },
        { text: Mx(k, 'negDivide.sub', o), why: Mx(k, 'negDivide.whySub', o) },
        { text: Mx(k, 'negDivide.right', o), correct: true },
      ],
      hints: [Mx(k, 'negDivide.hint1', o), Mx(k, 'negDivide.hint2', o)],
      explain: Mx(k, 'negDivide.explain', o),
    };
  },
  check: (lab, task, k) => {
    const x = task.eq.x;
    const v = Q.checkAt(task.eq, x).left;
    const bads = [Lin.neg(v), Q.checkAt(task.eq, Lin.neg(x)).left, Lin.add(v, 1)];
    const o = { eq: $(Q.eqTex(task.eq)), x: X(x), left: $(Lin.linLatex(task.eq.L)) };
    return {
      id: 'check', kind: 'choice', cols: 3,
      prompt: Mx(k, 'check.prompt', o),
      options: numberOptions(v, bads, (lab.ti + 1) % 3, (w) => Mx(k, 'check.wrong', { ...o, w: iso(minus(Lin.fracText(w))) })),
      hints: [Mx(k, 'check.hint1', o), Mx(k, 'check.hint2', o)],
      explain: Mx(k, 'check.explain', { ...o, v: iso(minus(Lin.fracText(v))) }),
    };
  },
  sign: (lab, task, k) => {
    const t = flipTrial(lab, true);
    if (!t) return null;
    const o = { crate: termText(t.crate, t.value), landed: termText(t.crate, t.landed) };
    return {
      id: 'sign', kind: 'choice',
      prompt: Mx(k, 'sign.prompt', o),
      options: [
        { text: Mx(k, 'sign.right', o), correct: true },
        { text: Mx(k, 'sign.keep'), why: Mx(k, 'sign.whyKeep', o) },
        { text: Mx(k, 'sign.plus'), why: Mx(k, 'sign.whyPlus', o) },
      ],
      hints: [Mx(k, 'sign.hint1', o), Mx(k, 'sign.hint2', o)],
      explain: Mx(k, 'sign.explain', o),
    };
  },
  rule: (lab, task, k, advanced) => {
    const w = L.witnesses(lab);
    const o = advanced
      ? { a: iso(minus(w.div?.a ?? '4')), n: iso(minus(w.div?.n ?? '-8')) }
      : { crate: iso(minus(w.refused?.value ?? '1')), l: iso(minus(w.refused?.values.left ?? '9')), r: iso(minus(w.refused?.values.right ?? '4')) };
    return {
      id: 'rule', kind: 'choice',
      prompt: <MathText>{k(`discovery.${advanced ? 'divide' : 'sign'}.prompt`)}</MathText>,
      options: discoveryOptions(lab, advanced, k),
      hints: [Mx(k, `rule.${advanced ? 'divide' : 'sign'}1`, o), Mx(k, `rule.${advanced ? 'divide' : 'sign'}2`, o)],
      explain: <Formal lab={lab} advanced={advanced} k={k} />,
    };
  },
};
