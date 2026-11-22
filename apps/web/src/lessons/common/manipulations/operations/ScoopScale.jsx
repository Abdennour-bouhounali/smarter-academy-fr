import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Hand, CheckCircle2, Sparkles, ChevronLeft, FlaskConical, Undo2, Minus, Plus, RotateCcw, Scale } from 'lucide-react';
import { resolveLevelId } from '@smarter-academy/core/curriculum/manipulationLevels.js';
import * as D from '@smarter-academy/core/arithmetic/decimals.js';
import MathText from '../../components/MathText';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import { LabCard, StageFrame, PromptCard, VerdictBanner, RoundButton } from '../primitives/LabKit';
import KidFigure from '../primitives/KidFigure';
import { useLabCoach } from '../primitives/LabCoach';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import { LEVELS } from '../levels';
import * as L from '../logic/scoopScale';
import { COL, SevenSegLcd, Shelves, Sack, Scoop, SpiceCone, Grains, ModelSachet, PrecisionStrip } from './scoopScale/art';

/**
 * scoop-scale — LA MASSE SOUS LA MAIN (3AM, unité 5 « المساويات – المتباينات – المعادلات », درس « حصر عدد عشري موجب », 2026-10-26). La logique, exacte,
 * est dans `logic/scoopScale.js` (sur `packages/core/arithmetic/decimals.js`, importé par chemin). Thème `attar` : le دكّان العطّار d'un souk.
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. La main tient la MASSE m (le nombre lui-même) : appui long sur la louche = on verse, un toucher = une pincée (+1), un toucher sur la pile = une pincée
 *    de moins (−1) ; clavier : ↑/↓ ±1, PageUp/PageDown ±10, Home = la masse de départ. « سلّم الكيس » valide un essai.
 * B. Une balance dont l'ÉCRAN arrondit au rang de la tâche (sept segments), une bande de précision qui écrit la masse exacte sous une aiguille fixe, un cône d'épice
 *    qui grandit avec la masse. Au niveau متقدم un sachet modèle (2/7 kg) et une lampe plus léger / plus lourd / égal.
 * C. La résistance : la balance REFUSE « سلّم الكيس » et le dit avec SES nombres (le voisin fantôme : « لو أنقصت حفنة لصارت 1,25 والشاشة تقرأ 1,3 ») ; à 1,35 l'écran
 *    lit 1,4 ; la lampe ne dit jamais « égal » pour 2/7.
 * D. La phase formelle écrit ce que l'élève a trouvé : r − ½·10⁻ᵏ ≤ m < r + ½·10⁻ᵏ avec SES trois tâches, puis 0,285 < 2/7 < 0,286.
 * E. Les fausses conjectures sont réfutées par SES masses (« من 1,3 إلى أقلّ من 1,4 » : son 1,25 lisait déjà 1,3 ; « 1,3 فقط » : son 1,25 et son 1,34).
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        un nombre lu après arrondi à un rang est un INTERVALLE [r − ½u ; r + ½u[ ; un quotient se loge entre deux repères sans les atteindre
 *   OBJECT         une masse versée sur une balance dont l'écran arrondit
 *   VARIABLE       la masse m (en unités de la résolution de la bande)
 *   INVARIANT      la lecture de l'écran sur chaque masse (demi vers le haut)
 *   TRANSFORMATION masse → lecture arrondie
 *   CONSTRAINT     rang de l'écran 1 / 0,1 / 0,01 ; pas = 0,01 puis 0,001 ; masse dans [0, cap]
 *   RESISTANCE     la balance refuse la masse qui n'est pas l'extrémité ; le sachet 2/7 n'est jamais atteint
 *   EVIDENCE       l'écran, la bande exacte, le voisin fantôme, la lampe
 *   CONTRAST       1,25 contre 1,24 ; 1,34 contre 1,35 ; échelle à 0,1 contre échelle au kilo ; masse décimale contre quotient
 *   PREDICTION     aucune carte : chaque « سلّم » est un essai jugé
 *   DISCOVERY      « ما كلّ الكمّيات التي تقرأ عليها الشاشة 1,3 kg ؟ »
 *   FORMALIZATION  r − ½·10⁻ᵏ ≤ m < r + ½·10⁻ᵏ ; 0,285 < 2/7 < 0,286
 *   TRANSFER       « جرّب أعدادك » (une lecture, un quotient — toujours ouvert), les exercices et la banque
 *
 * « جرّب كل الإمكانيات » : NON (chaque dépôt EST l'essai). « جرّب أعدادك » est TOUJOURS ouvert sous le labo.
 * D'UN SEUL REGARD (§8bis) : `[data-ss-glance]` enveloppe la consigne, la scène, la bande, les commandes et le verdict.
 * ONBOARDING : `coach` (défaut true) → `LabCoach` ; `logic/scoopScale.js › coachOf` (pour · remove · deliver · tryEnd · lamp · next).
 * Props : `tasks`, `level`, `levels`, `coach`, `title`, `lead`, `onTrial(event)`, `onFinished()` — par `state.report`.
 * CONTRAT DOM : [data-scoop-scale][data-task][data-solved][data-layout], [data-ss-glance], [data-ss-scene], [data-ss-lcd][data-reading], [data-ss-scoop],
 * [data-ss-pan][role=slider][data-m], [data-ss-cone], [data-ss-strip][data-m], [data-ss-pill], [data-ss-less], [data-ss-more], [data-ss-deliver], [data-ss-restart],
 * [data-ss-lamp][data-lamp], [data-ss-ref], [data-ss-next], [data-ss-verdict], [data-ss-step=<i>], [data-ss-free][data-active], [data-ss-free-reading],
 * [data-ss-free-a], [data-ss-free-b], [data-ss-free-rank=<k>], [data-ss-free-back], [data-ss-formal].
 */
const NS = 'manipulation.scoopScale';
const LRI = '⁦';
const PDI = '⁩';
const iso = (s) => `${LRI}${s}${PDI}`;
const WIDE_MIN = 700;
const SIDE_W = 236;
const SCENE_MAX = 560;
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-indigo-300';
const kg = (s) => iso(`${s} kg`);

const CSS = `
@keyframes ss-fx { 0% { transform: translateX(0); opacity: 0; } 12% { opacity: 1; } 100% { transform: translateX(var(--dx)); opacity: 0.9; } }
@keyframes ss-fy { 0% { transform: translateY(0); } 100% { transform: translateY(var(--dy)); } }
@keyframes ss-roll { 0% { transform: translateY(-7px); opacity: 0.2; } 100% { transform: translateY(0); opacity: 1; } }
@keyframes ss-glow { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.85; } }
.ss-fx { animation: ss-fx 520ms linear infinite; }
.ss-fy { animation: ss-fy 520ms cubic-bezier(0.4, 0, 1, 1) infinite; }
.ss-roll { animation: ss-roll 220ms ease-out; }
.ss-glow { animation: ss-glow 1400ms ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .ss-fx, .ss-fy, .ss-roll, .ss-glow { animation: none !important; } .ss-strip-g { transition: none !important; } }
`;

export function numbersFor({ tasks, level }) {
  const lv = resolveLevelId(level ?? 'beginner');
  const asked = LEVELS['scoop-scale'][lv].numbers;
  return { tasks: tasks ?? asked.tasks };
}

export default function ScoopScale({
  tasks, title, lead, level, levels: withLevels = true, coach: coachOn = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const initialNumbers = useMemo(() => numbersFor({ tasks, level }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'scoop-scale', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nums = state.numbers;
  const numsKey = JSON.stringify(nums);
  const [lab, setLab] = useState(() => L.init(nums));
  const [scene, setScene] = useState({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: 0 });
  if (scene.key !== numsKey || scene.epoch !== state.epoch) {
    // « إعادة » (resetCount), un autre niveau ou d'autres nombres : TOUT recommence — la tâche 1, les essais et les questions du labo
    setScene({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: scene.inits + 1 });
    setLab(L.init(nums));
  }
  // les questions pendant le labo : la suite de la tâche courante (construite seulement quand la tâche est faite) ; celle qui finit par la règle remplace la découverte
  const cur = L.taskOf(lab);
  const cpSettings = useLabCheckpointSettings('scoop-scale');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const chain = cpOn && cpSettings.enabled && !L.isFree(lab) ? CHAINS[cur.id] ?? null : null;
  const ruleByCheckpoint = cpOn && cpSettings.enabled && lab.tasks.some((tk) => CHAINS[tk.id]?.includes('rule'));
  const cp = useLabCheckpoint({
    id: chain ? cur.id : null,
    questions: chain && L.taskDone(lab) ? chain.map((q) => QUESTIONS[q](lab, cur, k)) : null,
    reached: L.taskDone(lab),
    resetKey: scene.inits,
    onRetry: () => setLab(L.restartTask),
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => { if (CHAINS[id]?.includes('rule')) { state.discover(); state.formalize(); } },
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
    lab: 'scoop-scale', step: coachStep,
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
    <ManipulationDiscovery state={state} prompt={<MathText>{k('discovery.prompt', { r: iso(L.witnesses(lab).main?.reading ?? '1,3') })}</MathText>}
      options={discoveryOptions(lab, k)} formal={<Formal lab={lab} k={k} />} />
  );

  return (
    <ManipulationShell
      type="scoop-scale"
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
        <div ref={boxRef} className="space-y-2" data-scoop-scale data-task={lab.free ? 'free' : lab.ti} data-phase={L.phaseOf(lab)}
          data-solved={finished ? 'true' : 'false'} data-layout={width >= WIDE_MIN ? 'wide' : 'narrow'}>
          <style dangerouslySetInnerHTML={{ __html: CSS }} />
          <Lab lab={lab} setLab={setLab} k={k} width={width} screenH={screenH} lead={state.isAuthoredLevel ? lead : null} cp={cp} />
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ══════════════ Le laboratoire ══════════════ */

const rankKey = (n) => (n <= 0 ? 'rank0' : n === 1 ? 'rank1' : 'rank2');

function Lab({ lab, setLab, k, width, screenH, lead, cp }) {
  const wide = width >= WIDE_MIN;
  const task = L.taskOf(lab);
  const ph = L.phaseOf(lab);
  const free = L.isFree(lab);
  const trap = task.kind === 'trap';
  const done = L.taskDone(lab);
  const lit = !free && done;
  const last = lab.last;
  const target = task.target ? D.format(task.target) : null;

  /* ── la consigne : le contexte puis UNE question ── */
  const ctx = (() => {
    if (free && lab.free.kind === 'quotient') return k('context.freeQuotient', { a: lab.free.q.a, b: lab.free.q.b, rank: iso(D.format(D.make(1, task.rank))) });
    if (free) return k('context.freeReading', { r: kg(target) });
    if (lead && lab.ti === 0) return lead;
    if (trap) return k('context.trap');
    if (task.coarse) return k('context.coarse', { r: kg(target) });
    return k('context.reading', { r: kg(target), how: k(`context.${rankKey(task.rank)}`) });
  })();
  const question = trap ? k(`question.${ph}`) : k(`question.${ph}`, { r: kg(target) });

  // une étape est FAITE quand l'objectif est atteint ET que ses questions (LabCheckpoint) sont répondues : alors la pastille passe au vert et on fête
  const stepDone = lab.tasks.map((_, i) => !!lab.done[i] && (i !== lab.ti || !cp.blocking));
  const steps = lab.tasks.length > 1 && !free && (
    <LabStepper count={lab.tasks.length} current={lab.ti} done={stepDone} stepAttr="data-ss-step" />
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
  /* ── le son (muet sauf « الصوت ») : un déclic par pincée (au plus un toutes les 35 ms), une cloche quand la masse passe un kilo plein,
     et au « سلّم » : l'arrivée (flag) ou le refus (over). ── */
  const sfx = useRef({ m: lab.m, at: 0, key: '' });
  const sfxKey = `${free ? 'free' : lab.ti}`;
  useEffect(() => {
    const p = sfx.current;
    if (p.key !== sfxKey) { sfx.current = { m: lab.m, at: 0, key: sfxKey }; return; }
    const d = lab.m - p.m;
    if (d === 0) return;
    const now = performance.now();
    if (now - p.at > 35) { playSfx('tooth', { pitch: d > 0 ? 1 : 0.75 }); p.at = now; }
    const unit = 10 ** task.res;
    if (d > 0 && Math.floor(lab.m / unit) > Math.floor(p.m / unit)) playSfx('bell');
    p.m = lab.m;
  }, [lab.m, sfxKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const nTrials = lab.trials.length;
  useEffect(() => {
    if (!nTrials) return;
    playSfx(lab.last?.ok ? 'flag' : 'over');
  }, [nTrials]); // eslint-disable-line react-hooks/exhaustive-deps
  const prompt = (
    <PromptCard size={wide ? 'lg' : 'md'} context={<MathText>{ctx}</MathText>} contextProps={{ 'data-ss-context': trap ? 'trap' : free ? 'free' : 'reading' }}
      title={<MathText>{question}</MathText>} titleClassName={wide ? 'text-xl' : 'text-lg'} lamp={free ? null : lit ? 'on' : 'off'}
      titleProps={{ 'data-ss-prompt': ph, 'data-lit': lit ? 'true' : 'false' }} />
  );

  /* ── le verdict : la CONSÉQUENCE avec les nombres de l'élève, jamais la règle ── */
  const lampWord = (l, key) => k(`lamp.${l === '<' ? 'lt' : l === '>' ? 'gt' : 'eq'}${key}`);
  const verdictLine = (() => {
    if (!last) return k(trap ? 'idleTrap' : 'idle');
    const g = last.neighbour;
    const mass = kg(last.mass);
    if (last.ok) {
      if (trap) return k(`v.ok.${last.phase}`, { mass, ghost: kg(g.mass), gLamp: lampWord(g.lamp, '') });
      return k(`v.ok.${last.phase}`, { mass, reading: iso(last.reading), ghost: kg(g.mass), gReading: iso(g.reading) });
    }
    switch (last.refused) {
      case 'wrongReading': return k(D.cmp(D.parse(last.reading), task.target) > 0 ? 'v.over' : 'v.wrong', { mass, reading: iso(last.reading), target: iso(target) });
      case 'notLeast': return k('v.notLeast', { ghost: kg(g.mass), gReading: iso(g.reading) });
      case 'notMost': return k('v.notMost', { ghost: kg(g.mass), gReading: iso(g.reading) });
      case 'notHeaviest': return k('v.notHeaviest', { ghost: kg(g.mass) });
      case 'notLightest': return k('v.notLightest', { ghost: kg(g.mass) });
      default: return k(`v.side.${last.phase}`, { mass, lamp: lampWord(last.lamp, 'Quote') });
    }
  })();
  const vkey = !last ? '' : last.ok ? 'right' : 'refused';
  const tone = !last ? 'indigo' : last.ok ? 'emerald' : 'rose';
  const Icon = !last ? Hand : last.ok ? CheckCircle2 : Sparkles;
  const canNext = L.canNext(lab) && !cp.blocking;
  const mood = !last ? 'happy' : last.ok ? 'proud' : 'wonder';
  const banner = (
    <VerdictBanner tone={tone} icon={wide ? Icon : null} size="sm" className="min-h-[3.5rem]" data-ss-verdict={vkey}>
      <div className="min-w-0 space-y-1.5">
        <p className={last ? '' : 'font-bold text-indigo-900'}>{verdictLine}</p>
        {canNext && (
          <button type="button" onClick={() => setLab(L.nextTask)} data-ss-next
            className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-2 border-emerald-600 bg-emerald-600 px-3.5 text-sm font-black text-white shadow-[0_3px_0_0_#047857] transition-all duration-150 active:translate-y-0.5 motion-reduce:transition-none ${ring}`}>
            {k('next')} <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </VerdictBanner>
  );

  const stageW = Math.min(SCENE_MAX, Math.max(300, (wide ? width - SIDE_W - 12 : width) - 24));
  const lampNow = trap ? L.lamp(lab) : null;
  const legend = (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1" data-ss-legend>
      {trap ? (
        <span className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-700" data-ss-lamp-text>
          <span className="h-3 w-3 rounded-full" style={{ background: lampNow === '<' ? '#38BDF8' : lampNow === '>' ? '#F59E0B' : '#10B981' }} aria-hidden="true" />
          {lampWord(lampNow, 'Lamp')}
        </span>
      ) : <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-700"><Scale className="h-4 w-4 text-amber-700" aria-hidden="true" />{k('legend.screen', { rank: iso(D.format(D.make(1, task.rank))) })}</span>}
      {steps || null}
    </div>
  );
  const stage = <Shop lab={lab} setLab={setLab} k={k} width={stageW} screenH={screenH} mood={mood} />;
  const controls = <Controls lab={lab} setLab={setLab} k={k} />;

  return (
    <>
      <div className="relative space-y-2" data-ss-glance>
        {party.node}
        {cp.node}
        {prompt}
        {wide ? (
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <StageFrame className="min-w-0 space-y-1.5 overflow-hidden p-3" data-ss-stage>{legend}{stage}</StageFrame>
              {controls}
            </div>
            <div className="flex shrink-0 flex-col gap-2.5" style={{ width: SIDE_W }}>{banner}</div>
          </div>
        ) : (
          <>
            <StageFrame className="min-w-0 space-y-1.5 overflow-hidden p-2" data-ss-stage>{legend}{stage}</StageFrame>
            {controls}
            {banner}
          </>
        )}
      </div>
      <FreeCard lab={lab} setLab={setLab} k={k} />
    </>
  );
}

/* ══════════════ Le دكّان : la scène, la bande ══════════════ */

function Shop({ lab, setLab, k, width, screenH, mood }) {
  const uid = `ss${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const task = L.taskOf(lab);
  const trap = task.kind === 'trap';
  const W = width;
  const SH = screenH >= 1000 ? 214 : 200;
  const cx = Math.round(W * 0.5);
  const base = 118; // le dessus du comptoir
  const unitsPerFull = Math.max(task.cap, 1);
  const frac = lab.m / unitsPerFull;
  const reading = L.reading(lab);
  const exact = D.format(L.massAt(lab));
  const pouringRef = useRef({ dir: 0, started: false, t: null, t0: 0 });
  const [pouring, setPouring] = useState(false);
  const [tapFx, setTapFx] = useState(false);
  const [rolled, setRolled] = useState(0);
  const lastReading = useRef(reading);
  useEffect(() => {
    if (lastReading.current !== reading) { lastReading.current = reading; setRolled((n) => n + 1); }
  }, [reading]);
  useEffect(() => () => { clearTimeout(pouringRef.current.t); }, []);

  const stopTimer = () => { clearTimeout(pouringRef.current.t); pouringRef.current.t = null; };
  const hold = (dir) => (e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const h = pouringRef.current;
    stopTimer();
    h.dir = dir; h.started = false; h.t0 = Date.now();
    const tick = () => {
      h.started = true;
      setLab((s) => L.pour(s, dir));
      setPouring(dir > 0);
      const delay = Date.now() - h.t0 > 2000 ? 35 : 140;
      h.t = setTimeout(tick, delay);
    };
    h.t = setTimeout(tick, 300);
  };
  const release = () => {
    const h = pouringRef.current;
    if (!h.dir) return;
    stopTimer();
    const { dir } = h; // lu AVANT la remise à zéro : le callback de setLab s'exécute plus tard
    if (!h.started) {
      setLab((s) => L.pinch(s, dir));
      if (dir > 0) { setTapFx(true); setTimeout(() => setTapFx(false), 460); }
    }
    h.dir = 0; h.started = false;
    setPouring(false);
  };
  const keyPinch = (dir) => (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLab((s) => L.pinch(s, dir)); if (dir > 0) { setTapFx(true); setTimeout(() => setTapFx(false), 460); } } };
  const keyPan = (e) => {
    const m = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1, PageUp: 10, PageDown: -10 };
    if (e.key in m) { e.preventDefault(); setLab((s) => L.nudge(s, m[e.key])); }
    if (e.key === 'Home') { e.preventDefault(); setLab(L.toStart); }
  };

  const marks = L.marksAround(lab);
  const markStep = trap ? 1 : 10 ** (task.res - task.rank);
  const tickStep = markStep > 10 ? markStep / 10 : 1;
  const half = trap ? 12 : Math.max(12, Math.round(markStep * 1.6));
  const markLabel = (u) => (trap ? D.format(D.make(u, task.res)) : D.format(D.make(u / markStep, task.rank)));
  const glow = !trap && !marks.exact ? [marks.lo.n * (10 ** (task.res - marks.lo.k)), marks.hi.n * (10 ** (task.res - marks.hi.k))] : (!trap ? [marks.lo.n * (10 ** (task.res - marks.lo.k))] : null);
  const refPos = L.refPosition(lab);
  const lampNow = trap ? L.lamp(lab) : null;

  return (
    <div className="space-y-1.5" data-ss-scene-box>
      <svg width="100%" viewBox={`0 0 ${W} ${SH}`} style={{ maxWidth: W, display: 'block', margin: '0 auto', touchAction: 'none' }} role="group" aria-label={k('stageAria')} data-ss-scene dir="ltr">
        <defs>
          <linearGradient id={`${uid}-wall`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={COL.wall} /><stop offset="1" stopColor={COL.wallDark} /></linearGradient>
          <linearGradient id={`${uid}-wood`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={COL.counterTop} /><stop offset="1" stopColor={COL.counterFront} /></linearGradient>
        </defs>
        <rect x={0} y={0} width={W} height={SH} rx={12} fill={`url(#${uid}-wall)`} />
        <Shelves width={W} y1={34} y2={80} />
        {/* l'élève derrière le comptoir */}
        <g aria-hidden="true"><KidFigure cx={W - 32} top={46} foot={base + 8} hairStyle="hijab" scarf="rose" outfit="pink" skin="light" mood={mood} /></g>
        {trap && <ModelSachet x={Math.min(cx + 96, W - 100)} y={72} lamp={lampNow} />}
        {/* le comptoir */}
        <rect x={0} y={base} width={W} height={SH - base} fill={`url(#${uid}-wood)`} />
        <rect x={0} y={base} width={W} height={9} fill={COL.counterTop} opacity={0.9} />
        <rect x={0} y={base + 9} width={W} height={3} fill={COL.counterDark} opacity={0.35} />
        {[0.22, 0.5, 0.78].map((p) => <line key={p} x1={W * p} x2={W * p} y1={base + 14} y2={SH - 6} stroke={COL.counterDark} strokeWidth={1.2} opacity={0.3} />)}
        <Sack x={16} y={base - 44} />
        {/* la balance */}
        <g aria-hidden="true">
          <rect x={cx - 80} y={base + 4} width={160} height={SH - base - 12} rx={14} fill={COL.scale} stroke={COL.scaleDark} strokeWidth={2} />
          <rect x={cx - 4} y={base - 10} width={8} height={16} fill={COL.scaleDark} />
          <ellipse cx={cx} cy={base - 8} rx={66} ry={10} fill="#E5E1D6" stroke={COL.scaleDark} strokeWidth={2} />
          <ellipse cx={cx} cy={base - 11} rx={60} ry={7} fill="#F9F6EE" />
        </g>
        <g key={rolled} className={rolled ? 'ss-roll' : undefined}>
          <SevenSegLcd x={cx - 68} y={base + 12} w={136} h={SH - base - 28} text={reading} label={k('lcdAria', { r: reading })} />
        </g>
        {/* la pile dans la kapha : un toucher reprend une pincée */}
        <SpiceCone cx={cx} base={base - 10} frac={frac} pepper={trap} />
        <g role="slider" tabIndex={0} aria-label={k('panAria')} aria-valuemin={0} aria-valuemax={task.cap} aria-valuenow={lab.m} aria-valuetext={`${exact} kg`}
          data-ss-pan data-m={lab.m} onKeyDown={keyPan} className={ring} style={{ cursor: 'pointer', outline: 'none', touchAction: 'none' }}
          onPointerDown={hold(-1)} onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}>
          <rect x={cx - 66} y={base - 74} width={132} height={74} fill="transparent" />
        </g>
        <Grains from={{ x: 94, y: base - 42 }} to={{ x: cx - 14, y: base - 12 }} on={pouring || tapFx} />
        {/* la louche sur le sac */}
        <Scoop x={64} y={base - 38} pouring={pouring || tapFx} label={k('scoopAria')} data-ss-scoop onPointerDown={hold(1)} onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release} onKeyDown={keyPinch(1)} />
      </svg>
      <PrecisionStrip uid={uid} width={W} m={lab.m} res={task.res} rank={task.rank} markStep={markStep} tickStep={tickStep} half={half} label={k('stripAria')}
        pillText={`${exact} kg`} refAt={refPos ? refPos.units : null} markLabel={markLabel} labelStep={trap ? 5 : markStep} glow={glow} refLabel={refPos ? k('refLabel') : null} />
    </div>
  );
}

/* ══════════════ Les commandes ══════════════ */

function Controls({ lab, setLab, k }) {
  const task = L.taskOf(lab);
  const atMin = lab.m <= 0;
  const atMax = lab.m >= task.cap;
  const idle = lab.m === task.start;
  const btn = 'inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-2xl border-2 px-3 text-sm font-black';
  return (
    <LabCard className="p-2" data-ss-controls>
      <div className="flex items-center gap-2" dir="ltr">
        <RoundButton onClick={() => setLab((s) => L.pinch(s, -1))} disabled={atMin} aria-label={k('less')} size={48} data-ss-less><Minus className="h-5 w-5" strokeWidth={3} aria-hidden="true" /></RoundButton>
        <button type="button" onClick={() => setLab(L.deliver)} data-ss-deliver
          className={`${btn} flex-1 border-indigo-600 bg-indigo-600 text-lg text-white shadow-[0_4px_0_0_#3730A3] transition-all duration-150 active:translate-y-0.5 motion-reduce:transition-none ${ring}`}>
          {k('deliver')}
        </button>
        <RoundButton primary onClick={() => setLab((s) => L.pinch(s, 1))} disabled={atMax} aria-label={k('more')} size={48} data-ss-more><Plus className="h-5 w-5" strokeWidth={3} aria-hidden="true" /></RoundButton>
        <button type="button" onClick={() => setLab(L.toStart)} disabled={idle} data-ss-restart aria-label={k('restart')} title={k('restart')}
          className={`${btn} border-amber-300 bg-white text-amber-900 disabled:opacity-40 ${ring}`}>
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </LabCard>
  );
}

/* ══════════════ « جرّب أعدادك » : toujours ouvert ══════════════ */

function FreeCard({ lab, setLab, k }) {
  const free = L.isFree(lab);
  const [tr, setTr] = useState('');
  const [ta, setTa] = useState('');
  const [tb, setTb] = useState('');
  const [rk, setRk] = useState(1);
  useEffect(() => { if (!lab.free) { setTr(''); setTa(''); setTb(''); } }, [lab.free]);
  const badR = tr !== '' && !L.parseReading(tr);
  const badQ = (ta !== '' || tb !== '') && !L.parseQuotient(ta, tb);
  const clean = (v) => v.replace(/[^0-9٠-٩,٫.]/g, '').slice(0, 5);
  const cleanInt = (v) => v.replace(/[^0-9]/g, '').slice(0, 3);
  const runQ = (a, b, r) => { if (L.parseQuotient(a, b)) setLab((s) => L.freeQuotient(s, a, b, r)); };
  const rankLabels = { 1: '0,1', 2: '0,01', 3: '0,001' };
  return (
    <LabCard className="space-y-3 border-emerald-200 bg-emerald-50/50 p-3" data-ss-free data-active={free ? 'true' : 'false'}>
      <p className="flex items-center gap-1.5 text-sm font-black text-emerald-900"><FlaskConical className="h-4 w-4" aria-hidden="true" /> {k('free.title')}</p>
      <p className="text-xs font-bold leading-snug text-slate-600">{free ? k('free.on') : k('free.hint')}</p>
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-xs font-black text-amber-900">
          {k('free.reading')}
          <input type="text" inputMode="decimal" autoComplete="off" dir="ltr" value={tr} maxLength={5} aria-label={k('free.readingAria')} aria-invalid={badR} data-ss-free-reading
            onChange={(e) => { const v = clean(e.target.value); setTr(v); if (L.parseReading(v)) setLab((s) => L.freeReading(s, v)); }}
            className={`h-11 w-24 rounded-xl border-2 ${badR ? 'border-rose-300' : 'border-amber-300'} bg-white px-2 text-center text-xl font-black tabular-nums text-indigo-950 ${ring}`} />
        </label>
        {badR && <span className="text-xs font-bold text-rose-700">{k('free.badReading')}</span>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-black text-teal-900">{k('free.quotient')}</span>
        <input type="text" inputMode="numeric" autoComplete="off" dir="ltr" value={ta} maxLength={3} aria-label={k('free.aAria')} data-ss-free-a
          onChange={(e) => { const v = cleanInt(e.target.value); setTa(v); runQ(v, tb, rk); }}
          className={`h-11 w-16 rounded-xl border-2 border-teal-300 bg-white px-2 text-center text-xl font-black tabular-nums text-indigo-950 ${ring}`} />
        <span className="text-xl font-black text-slate-500" aria-hidden="true">÷</span>
        <input type="text" inputMode="numeric" autoComplete="off" dir="ltr" value={tb} maxLength={2} aria-label={k('free.bAria')} data-ss-free-b
          onChange={(e) => { const v = cleanInt(e.target.value).slice(0, 2); setTb(v); runQ(ta, v, rk); }}
          className={`h-11 w-14 rounded-xl border-2 border-teal-300 bg-white px-2 text-center text-xl font-black tabular-nums text-indigo-950 ${ring}`} />
        <span className="flex items-center gap-1" role="group" aria-label={k('free.rankAria')}>
          {[1, 2, 3].map((r) => (
            <button key={r} type="button" aria-pressed={rk === r} data-ss-free-rank={r} onClick={() => { setRk(r); runQ(ta, tb, r); }}
              className={`inline-flex min-h-[44px] min-w-[52px] items-center justify-center rounded-xl border-2 px-2 text-sm font-black tabular-nums ${rk === r ? 'border-teal-600 bg-teal-600 text-white' : 'border-teal-200 bg-white text-teal-900'} ${ring}`}>
              <bdi dir="ltr">{rankLabels[r]}</bdi>
            </button>
          ))}
        </span>
        {badQ && <span className="text-xs font-bold text-rose-700">{k('free.badQuotient')}</span>}
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

/* ══════════════ La découverte et la règle ══════════════ */

/** Les masses d'une lecture : r, r + une unité de rang (« 1,3 » → « 1,4 »). */
const nextReading = (r) => {
  const v = D.parse(r);
  return v ? D.format(D.make(v.n + 1, v.k)) : r;
};

export function discoveryOptions(lab, k) {
  const w = L.witnesses(lab).main ?? { reading: '1,3', rank: 1, least: '1,25', most: '1,34', excluded: '1,35', excludedReading: '1,4' };
  const up = nextReading(w.reading, w.rank);
  return [
    { text: <MathText>{k('discovery.shift', { r: iso(w.reading), up: iso(up) })}</MathText>, why: <MathText>{k('discovery.whyShift', { r: iso(w.reading), m: iso(w.least) })}</MathText> },
    { text: <MathText>{k('discovery.right', { lo: iso(w.least), hi: iso(w.excluded) })}</MathText>, correct: true },
    { text: <MathText>{k('discovery.closed', { lo: iso(w.least), hi: iso(w.excluded) })}</MathText>, why: <MathText>{k('discovery.whyClosed', { hi: iso(w.excluded), e: iso(w.excludedReading), r: iso(w.reading) })}</MathText> },
    { text: <MathText>{k('discovery.only', { r: iso(w.reading) })}</MathText>, why: <MathText>{k('discovery.whyOnly', { r: iso(w.reading), a: iso(w.least), b: iso(w.most) })}</MathText> },
  ];
}

const texNum = (txt) => String(txt).replace(',', '{,}');
export function Formal({ lab, k }) {
  const w = L.witnesses(lab);
  const line = (p) => (p ? `$${texNum(p.lo.mass)} \\leq m < ${texNum(p.hi.neighbour.mass)}$` : null);
  const main = w.main;
  const coarse = w.pairs[0];
  const lines = [];
  if (main) lines.push({ key: 'main', txt: k('formal.line', { r: iso(main.reading) }), eq: `$${texNum(main.least)} \\leq m < ${texNum(main.excluded)}$` });
  if (coarse && coarse.lo.reading !== main?.reading) lines.push({ key: 'coarse', txt: k('formal.line', { r: iso(coarse.lo.reading) }), eq: line(coarse) });
  return (
    <div className="space-y-2 text-sm font-bold text-emerald-950" data-ss-formal>
      <p className="text-center text-base" dir="ltr"><MathText>{'$r-\\frac{1}{2}\\times10^{-k}\\ \\leq\\ m\\ <\\ r+\\frac{1}{2}\\times10^{-k}$'}</MathText></p>
      <p><MathText>{k('formal.rule')}</MathText></p>
      {lines.map((l) => (
        <p key={l.key} className="text-center" dir="ltr"><span dir="rtl"><MathText>{l.txt}</MathText></span> <MathText>{l.eq}</MathText></p>
      ))}
      <p><MathText>{k('formal.open')}</MathText></p>
      {w.trap && (
        <>
          <p className="text-center" dir="ltr"><MathText>{`$${texNum(w.trap.below.mass)} < \\frac{2}{7} < ${texNum(w.trap.above.mass)}$`}</MathText></p>
          <p><MathText>{k('formal.trap')}</MathText></p>
        </>
      )}
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite de questions de chaque tâche : elle interroge ce que l'élève vient de FAIRE avec SES masses ; la dernière suite d'un niveau finit par la règle. */
export const CHAINS = Object.freeze({
  t1: ['why', 'ghost'],
  t2: ['ghost', 'interval'],
  t3: ['halfRank', 'interval', 'rule'],
  a1: ['why', 'ghost'],
  a2: ['ghost', 'interval', 'rule'],
  a3: ['between', 'never'],
});

const $ = (s) => `$${s}$`;
const Mx = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const mine = (lab, phase) => lab.trials.filter((t) => !t.free && t.task === lab.ti && t.ok && (!phase || t.phase === phase)).at(-1);
const bounds = (reading, rank) => {
  const v = D.parse(String(reading));
  return { lo: D.format(D.floorAt(v, rank)), hi: D.format(D.ceilAt(v, rank)) };
};

/** Chaque question est construite sur LES essais de la tâche (rien n'est écrit en dur) ; `k` : les textes de `scoopScale`. */
export const QUESTIONS = {
  why: (lab, task, k) => {
    const tr = mine(lab, 'least');
    const o = { mass: kg(tr.mass), reading: iso(tr.reading), ghost: kg(tr.neighbour.mass), gReading: iso(tr.neighbour.reading) };
    return {
      id: 'why', kind: 'choice',
      prompt: Mx(k, 'why.prompt', o),
      options: [
        { text: Mx(k, 'why.chop'), why: Mx(k, 'why.whyChop', o) },
        { text: Mx(k, 'why.right', o), correct: true },
        { text: Mx(k, 'why.up'), why: Mx(k, 'why.whyUp', o) },
      ],
      hints: [Mx(k, 'why.hint1', o), Mx(k, 'why.hint2', o)],
      explain: Mx(k, 'why.explain', o),
    };
  },
  ghost: (lab, task, k) => {
    const tr = mine(lab, task.phases.at(-1));
    const side = tr.phase === 'least' ? 'least' : 'most';
    const b = bounds(tr.neighbour.mass, task.rank);
    const o = { mass: kg(tr.mass), ghost: kg(tr.neighbour.mass), lo: iso(b.lo), hi: iso(b.hi), rank: iso(D.format(D.make(1, task.rank))) };
    return {
      id: 'ghost', kind: 'number', expected: tr.neighbour.reading, answer: <MathText>{$(String(tr.neighbour.reading).replace(',', '{,}'))}</MathText>,
      prompt: Mx(k, `ghost.${side}`, o), hints: [Mx(k, 'ghost.hint1', o), Mx(k, 'ghost.hint2', o)],
      explain: Mx(k, 'ghost.explain', { ...o, reading: iso(tr.neighbour.reading) }),
    };
  },
  halfRank: (lab, task, k) => {
    const unit = D.format(D.make(1, task.rank));
    const half = D.format(D.make(5, task.rank + 1));
    return {
      id: 'halfRank', kind: 'number', expected: half, answer: <MathText>{$(half.replace(',', '{,}'))}</MathText>,
      prompt: Mx(k, 'halfRank.prompt', { unit: iso(unit) }), hints: [Mx(k, 'halfRank.hint1', { unit: iso(unit) }), Mx(k, 'halfRank.hint2', { unit: iso(unit) })],
      explain: Mx(k, 'halfRank.explain', { unit: iso(unit), half: iso(half) }),
    };
  },
  interval: (lab, task, k) => {
    const pair = L.witnesses(lab).pairs[task.rank] ?? L.witnesses(lab).pairs[task.rank === 0 ? 0 : task.rank];
    const lo = pair.lo; const hi = pair.hi;
    const r = lo.reading;
    const up = nextReading(r, task.rank);
    const tx = texNum;
    const o = { r: iso(r), least: kg(lo.mass), hi: kg(hi.neighbour.mass), e: iso(hi.neighbour.reading) };
    return {
      id: 'interval', kind: 'choice', cols: 1,
      prompt: Mx(k, 'interval.prompt', o),
      options: [
        { text: <MathText>{$(`${tx(r)}\\leq m<${tx(up)}`)}</MathText>, why: Mx(k, 'interval.whyShift', o) },
        { text: <MathText>{$(`${tx(lo.mass)}\\leq m\\leq ${tx(hi.neighbour.mass)}`)}</MathText>, why: Mx(k, 'interval.whyClosed', o) },
        { text: <MathText>{$(`${tx(lo.mass)}\\leq m<${tx(hi.neighbour.mass)}`)}</MathText>, correct: true },
      ],
      hints: [Mx(k, 'interval.hint1', o), Mx(k, 'interval.hint2', o)],
      explain: Mx(k, 'interval.explain', o),
    };
  },
  rule: (lab, task, k) => {
    const w = L.witnesses(lab).main;
    const o = { r: iso(w?.reading ?? '1,3'), least: kg(w?.least ?? '1,25'), hi: kg(w?.excluded ?? '1,35'), e: iso(w?.excludedReading ?? '1,4') };
    return {
      id: 'rule', kind: 'choice',
      prompt: <MathText>{k('discovery.prompt', { r: iso(w?.reading ?? '1,3') })}</MathText>,
      options: discoveryOptions(lab, k),
      hints: [Mx(k, 'rule.hint1', o), Mx(k, 'rule.hint2', o)],
      explain: <Formal lab={lab} k={k} />,
    };
  },
  between: (lab, task, k) => {
    const lo = mine(lab, 'heavyLight'); const hi = mine(lab, 'lightHeavy');
    const o = { lo: kg(lo.mass), hi: kg(hi.mass), frac: $(`\\frac{${task.ref.a}}{${task.ref.b}}`) };
    return {
      id: 'between', kind: 'choice', cols: 1,
      prompt: Mx(k, 'between.prompt', o),
      options: [
        { text: <MathText>{$(`${texNum(lo.mass)}\\leq\\frac{${task.ref.a}}{${task.ref.b}}\\leq ${texNum(hi.mass)}`)}</MathText>, why: Mx(k, 'between.whyClosed', o) },
        { text: <MathText>{$(`${texNum(lo.mass)}<\\frac{${task.ref.a}}{${task.ref.b}}<${texNum(hi.mass)}`)}</MathText>, correct: true },
        { text: <MathText>{$(`\\frac{${task.ref.a}}{${task.ref.b}}=${texNum(lo.mass)}5`)}</MathText>, why: Mx(k, 'between.whyMid', o) },
      ],
      hints: [Mx(k, 'between.hint1', o), Mx(k, 'between.hint2', o)],
      explain: Mx(k, 'between.explain', o),
    };
  },
  never: (lab, task, k) => {
    const lo = mine(lab, 'heavyLight'); const hi = mine(lab, 'lightHeavy');
    const o = { lo: kg(lo.mass), hi: kg(hi.mass), frac: $(`\\frac{${task.ref.a}}{${task.ref.b}}`) };
    return {
      id: 'never', kind: 'choice',
      prompt: Mx(k, 'never.prompt', o),
      options: [
        { text: Mx(k, 'never.finer'), why: Mx(k, 'never.whyFiner') },
        { text: Mx(k, 'never.mid', o), why: Mx(k, 'never.whyMid', o) },
        { text: Mx(k, 'never.right', o), correct: true },
      ],
      hints: [Mx(k, 'never.hint1', o), Mx(k, 'never.hint2')],
      explain: Mx(k, 'never.explain', o),
    };
  },
};
