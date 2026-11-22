import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Hand, Sparkles, ChevronLeft, FlaskConical, Undo2, Eraser, Play, Plus, Minus, Ticket } from 'lucide-react';
import { resolveLevelId } from '@smarter-academy/core/curriculum/manipulationLevels.js';
import * as C from '@smarter-academy/core/arithmetic/chainOps.js';
import MathText from '../../components/MathText';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import { useManipulation } from '../useManipulation';
import { LabCard, StageFrame, PromptCard, VerdictBanner } from '../primitives/LabKit';
import { useLabCoach } from '../primitives/LabCoach';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import { LEVELS } from '../levels';
import * as L from '../logic/tramRoute';
import TramScene, { CSS as SCENE_CSS, SCENE_H } from './tramRoute/TramScene';

/**
 * tram-route — L'ORDRE DES OPÉRATIONS SOUS LA MAIN : « خطّ الترامواي » (2AM, unité 1 « العمليات على الأعداد الطبيعية والأعداد العشرية », درس « سلسلة عمليات
 * دون أقواس وأولوية العمليات », 2026-10-28). La logique, exacte, est dans `logic/tramRoute.js` (sur `packages/core/arithmetic/chainOps.js`, importé PAR CHEMIN) ;
 * le dessin (le tramway d'une ville algérienne, thème `tramline`) dans `tramRoute/TramScene.jsx`. Distinct de `merge-board` (3AM : on fusionne deux tuiles voisines,
 * un aimant IMPOSE la priorité), de `story-bars` (1AM : le ruban décide + ou −, une seule opération), d'`elevator-reel` (un temps signé qu'on fait défiler) et
 * de `vector-chain` (une carte de métro) : ici la main ÉCRIT tout un ordre avant que rien ne se passe et le MONDE (le temps, les groupes, les prix) est l'arbitre.
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. La main POSE des tickets numérotés ① ② ③ sur les opérateurs de la chaîne (un appui : le prochain ticket ; un appui sur une puce numérotée : elle reprend
 *    son ticket et les suivants se décalent ; Entrée au clavier). « انطلق » est actif quand chaque puce a son ticket ; « مسح » reprend tout.
 * B. Le plan calcule la chaîne dans SON ordre (le panneau « حسابك ») ; le tram roule dans l'ordre du temps et son compteur est la vérité. Les arrêts arrivent dans
 *    l'ordre où la chaîne est écrite : un terme = un arrêt, un fanion de groupe porte sa taille.
 * C. En مبتدئ la chaîne est donnée. En متقدم l'élève ÉCRIT d'abord la chaîne de l'histoire (plaques et puces posées dans le ruban, jugée par sa valeur), écrit
 *    ensuite sa prédiction (jamais bloquante), et le compteur reste voilé jusqu'au départ.
 * D. Chaque « انطلق » est un essai (`plan` / `refused` + le genre d'absurdité) ; chaque écriture et chaque prédiction aussi.
 * E. Découverte : les questions posées PAR-DESSUS le labo (LabCheckpoint) — t1 « نزل 9 » et l'ordre des arrêts, t2 le contraste « صعد » seul / « نزل », t3 le prix absurde,
 *    t4 les groupes — finissent chacune sur sa RÈGLE.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        sans parenthèses : + − seuls (ou × ÷ seuls) de gauche à droite ; × ÷ avant + − ; un accord (اتّفاق) que la machine à calculer suit aussi
 *   OBJECT         un tramway d'une ville algérienne (arrêts, compteur de passagers, groupes à fanion) et un kiosque à tickets ; Amine et les élèves (KidFigure, hijab)
 *   VARIABLE       l'ORDRE des opérations : une permutation des opérateurs de la chaîne, posée en tickets ① ② ③
 *   INVARIANT      l'histoire arrive dans l'ordre de l'écriture : le compteur du tram ne dépend pas du plan de l'élève
 *   TRANSFORMATION chaque ticket effondre deux plaques en une dans l'ordre du plan ; le tram rejoue les arrêts dans l'ordre du temps
 *   CONSTRAINT     tous les tickets posés avant le départ ; jamais de résultat négatif (« لا يمكن أن ينزل أكثر ممّا في العربة ») ; chaînes sans parenthèses
 *   RESISTANCE     le compteur : un plan différent est refusé et le monde dessine l'étape sans sens ; un plan équivalent (+ seul) est accepté — le contraste
 *   EVIDENCE       le panneau « حسابك » face au compteur, l'étape absurde, la prédiction contre le compteur
 *   CONTRAST       26 − 9 + 4 (13 ou 21) · 40 − 12 − 6 + 9 · 150 ÷ 6 × 4 (6,25 DA ?) · 15 + 3 × 4 (72 ?) · la chaîne de + seulement où tout ordre convient
 *   PREDICTION     le résultat écrit AVANT de partir (متقدم)
 *   DISCOVERY      les questions finales de chaque tâche, qui mènent aux trois règles
 *   FORMALIZATION  « من اليسار نحو اليمين » (+ − seuls, × ÷ seuls) · « الضرب والقسمة قبل الجمع والطرح » · un accord
 *   TRANSFER       « جرّب أعدادك » (toujours ouvert, jusqu'à quatre arrêts), les exercices et la banque
 *
 * « جرّب أعدادك » est TOUJOURS ouvert sous le labo (`[data-tr-free]`). D'UN SEUL REGARD (§8bis) : `[data-tr-glance]` enveloppe la consigne, la scène, les compteurs,
 * le ruban, les commandes et le verdict. ONBOARDING : `logic/tramRoute.js › coachOf` (build · predict · stamp · stampMore · go · retry · free). QUESTIONS PENDANT
 * LE LABO (prototype 2026-10-28) : `CHAINS` + `QUESTIONS` ci-dessous ; obligatoires pour tout élève, coupables par l'ENSEIGNANT seul (`useLabCheckpointSettings`).
 * Props : `tasks` ([{ id, chain, kind, unit, stops, build, predict }]), `world`, `level`, `levels`, `coach`, `checkpoints`, `title`, `lead`, `onTrial(event)`, `onFinished({ world })`.
 * CONTRAT DOM : [data-tram-route][data-task][data-solved][data-layout][data-world], [data-tr-glance], [data-tr-stage], [data-tr-strip], [data-tr-num=<i>], [data-tr-op=<i>][data-ticket],
 * [data-tr-go], [data-tr-clear], [data-tr-bank], [data-tr-slot=<i>], [data-tr-check], [data-tr-predict], [data-tr-counter][data-value], [data-tr-plan][data-value], [data-tr-lines],
 * [data-tr-verdict], [data-tr-next], [data-tr-free][data-active], [data-tr-free-start], [data-tr-free-type=<i>], [data-tr-free-n=<i>], [data-tr-free-add], [data-tr-free-back].
 */
const NS = 'manipulation.tramRoute';
const LRI = '⁦';
const PDI = '⁩';
const iso = (s) => `${LRI}${s}${PDI}`;
const WIDE_MIN = 760;
const SIDE_W = 168;
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-indigo-300';
const RIDE_MS = 700;
const $ = (s) => `$${s}$`;
const tex = (s) => String(s).replace(/,/g, '{,}').replace(/×/g, '\\times').replace(/÷/g, '\\div').replace(/−/g, '-');

export function numbersFor({ tasks, world, level }) {
  const lv = resolveLevelId(level ?? 'beginner');
  const asked = LEVELS['tram-route'][lv].numbers;
  return { tasks: tasks ?? asked.tasks, world: world ?? asked.world ?? 'tram' };
}

export default function TramRoute({
  tasks, world, title, lead, level, levels: withLevels = true, coach: coachOn = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const initialNumbers = useMemo(() => numbersFor({ tasks, world, level }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'tram-route', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nums = state.numbers;
  const numsKey = JSON.stringify(nums);
  const [lab, setLab] = useState(() => L.init(nums));
  const [scene, setScene] = useState({ key: numsKey, epoch: state.epoch, inits: 0 });
  if (scene.key !== numsKey || scene.epoch !== state.epoch) {
    // « إعادة », un autre niveau ou d'autres nombres : TOUT recommence — la tâche 1, les tickets, les essais et les questions du labo
    setScene({ key: numsKey, epoch: state.epoch, inits: scene.inits + 1 });
    setLab(L.init(nums));
  }
  const [ride, setRide] = useState({ at: 0, done: false });
  const cur = L.taskOf(lab);
  const cpSettings = useLabCheckpointSettings('tram-route');
  const chain = cpOn && cpSettings.enabled && !L.isFree(lab) ? CHAINS[cur.id] ?? null : null;
  const ruleByCheckpoint = cpOn && cpSettings.enabled && lab.tasks.some((tk) => CHAINS[tk.id]?.some((q) => q.startsWith('rule')));
  const cp = useLabCheckpoint({
    id: chain ? cur.id : null,
    questions: chain ? chain.map((q) => QUESTIONS[q](lab, cur, k)) : null,
    reached: L.taskDone(lab) && ride.done,
    resetKey: scene.inits,
    onRetry: () => setLab(L.restartTask),
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => { if (CHAINS[id]?.some((q) => q.startsWith('rule'))) { state.discover(); state.formalize(); } },
  });
  const finishedOnce = useRef(false);
  const everyDone = L.allDone(lab);
  useEffect(() => {
    if (!everyDone) { finishedOnce.current = false; return; }
    if (!finishedOnce.current) { finishedOnce.current = true; state.report(onFinished, { world: lab.world }); }
  }, [everyDone]); // eslint-disable-line react-hooks/exhaustive-deps
  const reported = useRef(0);
  const nTrials = lab.trials.length;
  useEffect(() => {
    if (nTrials < reported.current) reported.current = 0;
    for (let i = reported.current; i < nTrials; i += 1) state.report(onTrial, { ...lab.trials[i] });
    reported.current = nTrials;
  }, [nTrials, lab.trials]); // eslint-disable-line react-hooks/exhaustive-deps

  // la rejouée : le tram roule arrêt après arrêt jusqu'à la fin du voyage (ou jusqu'à l'arrêt fautif)
  const nStops = cur.kind === 'kiosk' ? 1 : cur.terms.length;
  useEffect(() => {
    if (!lab.replay) { setRide({ at: 0, done: false }); return undefined; }
    const target = lab.replay.ok ? Math.max(0, nStops - 1) : Math.min(lab.replay.station, nStops - 1);
    let at = 0;
    setRide({ at: 0, done: false });
    const finish = () => { setRide({ at: target, done: true }); playSfx(lab.replay.ok ? 'flag' : 'over'); };
    if (target === 0) { const id = setTimeout(finish, 350); return () => clearTimeout(id); }
    const id = setInterval(() => {
      at += 1;
      playSfx('tooth');
      if (at >= target) { clearInterval(id); finish(); } else setRide({ at, done: false });
    }, RIDE_MS);
    return () => clearInterval(id);
  }, [lab.replay]); // eslint-disable-line react-hooks/exhaustive-deps

  const coachStep = coachOn && !cp.open ? L.coachOf(lab) : null;
  const coach = useLabCoach({
    lab: 'tram-route', step: coachStep,
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

  return (
    <ManipulationShell
      type="tram-route"
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
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-sky-50/70 to-white">
        <div ref={boxRef} className="space-y-2" data-tram-route data-task={lab.ti} data-world={lab.world}
          data-solved={everyDone ? 'true' : 'false'} data-layout={width >= WIDE_MIN ? 'wide' : 'narrow'}>
          <style dangerouslySetInnerHTML={{ __html: SCENE_CSS }} />
          <Lab lab={lab} setLab={setLab} k={k} width={width} screenH={screenH} lead={state.isAuthoredLevel ? lead : null} cp={cp} ride={ride} />
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ══════════════ Le laboratoire ══════════════ */

function Lab({ lab, setLab, k, width, screenH, lead, cp, ride }) {
  const uid = `tr${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const wide = width >= WIDE_MIN;
  const free = L.isFree(lab);
  const task = L.taskOf(lab);
  const done = L.taskDone(lab);
  const chainNow = L.chainNow(lab);
  const tokens = useMemo(() => C.tokenize(chainNow), [chainNow]);
  const ops = useMemo(() => C.operatorsOf(tokens), [tokens]);
  const buildPhase = task.build && !L.built(lab) && !free;
  const rp = lab.replay;
  const riding = !!rp && !ride.done;
  const shownReplay = rp && ride.done ? rp : null;

  /* ── la consigne : le contexte, puis UNE question ── */
  const ctx = free ? k('story.free', { start: iso(task.numbers[0]) }) : k(`story.${task.id}`);
  const question = free ? k('question.free') : buildPhase ? k('question.build')
    : task.predict ? k('question.predict') : k(task.kind === 'kiosk' ? 'question.stampKiosk' : task.unit === 'km' ? 'question.stampKm' : 'question.stamp');
  const stepDone = lab.tasks.map((_, i) => !!lab.done[i] && (i !== lab.ti || (!cp.blocking && ride.done)));
  const steps = lab.tasks.length > 1 && !free && (
    <LabStepper count={lab.tasks.length} current={lab.ti} done={stepDone} stepAttr="data-tr-step" />
  );
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.trials.length === 0 && celebrated.current.size) celebrated.current = new Set();
  const nowDone = !free && stepDone[lab.ti];
  useEffect(() => {
    if (!nowDone || celebrated.current.has(lab.ti)) return;
    celebrated.current.add(lab.ti);
    party.celebrate({ n: lab.ti + 1, total: lab.tasks.length });
  }, [nowDone, lab.ti]); // eslint-disable-line react-hooks/exhaustive-deps
  const prompt = (
    <PromptCard size="md" context={<MathText>{ctx}</MathText>} contextProps={{ 'data-tr-context': free ? 'free' : task.id }}
      title={<MathText>{question}</MathText>} titleClassName="text-lg" lamp={free ? null : done && ride.done ? 'on' : 'off'}
      titleProps={{ 'data-tr-prompt': buildPhase ? 'build' : 'plan', 'data-lit': done ? 'true' : 'false' }}
      aside={steps || undefined} instruction={lead || undefined} />
  );

  /* ── les compteurs ── */
  const trail = task.trail;
  const counterVeiled = !rp && (task.predict || task.kind === 'kiosk') && !free;
  const counterText = task.kind === 'kiosk' ? (shownReplay ? task.truthText : '') : C.numText(trail[Math.min(ride.at, trail.length - 1)]);
  const counterLabel = k(task.kind === 'kiosk' ? 'counter.price' : task.unit === 'km' ? 'counter.km' : 'counter.pupils');
  const tone = shownReplay ? (shownReplay.ok ? 'ok' : 'bad') : 'idle';
  const planVeiled = !shownReplay;
  const CounterBox = ({ kind, label, value, veiled, attr }) => (
    <div className={`flex min-h-[56px] items-center justify-between gap-2 rounded-2xl border-2 px-3 py-1 ${kind === 'plan' ? 'border-amber-300 bg-amber-50' : 'border-teal-300 bg-teal-50'}`}
      {...{ [attr]: '' }} data-value={veiled ? '' : value} data-veiled={veiled ? 'true' : 'false'} role="group" aria-label={veiled ? k('counter.veiledAria') : k(kind === 'plan' ? 'counter.planAria' : 'counter.aria', { label, v: iso(value) })}>
      <p className={`text-sm font-black ${kind === 'plan' ? 'text-amber-900' : 'text-teal-900'}`}>{label}</p>
      <div className="flex min-h-[40px] items-center justify-center text-3xl font-black tabular-nums" dir="ltr">{veiled ? k('counter.veiled') : value}</div>
    </div>
  );
  const counters = (
    <div className={`grid gap-2 ${wide ? 'h-full grid-cols-1 grid-rows-2' : 'grid-cols-2'}`} data-tr-counters>
      <CounterBox kind="truth" label={counterLabel} value={counterText} veiled={counterVeiled || (task.kind === 'kiosk' && !shownReplay)} attr="data-tr-counter" />
      <CounterBox kind="plan" label={k('counter.plan')} value={shownReplay?.planText ?? ''} veiled={planVeiled} attr="data-tr-plan" />
    </div>
  );

  /* ── la scène ── */
  const stageW = wide ? width - SIDE_W - 8 : width;
  const innerH = typeof window !== 'undefined' && window.innerHeight ? window.innerHeight : screenH + 40;
  const fixed = 372 + (wide ? 0 : 66) + (lead ? 28 : 0) + (task.predict && !free ? 48 : 0) + (buildPhase ? 120 : 0);
  const hBudget = Math.max(150, Math.min(SCENE_H + 30, innerH - 24 - fixed));
  const mood = shownReplay ? (shownReplay.ok ? 'proud' : 'wonder') : 'happy';
  const stage = (
    <StageFrame className="min-w-0 overflow-hidden" data-tr-stage data-at={ride.at} data-riding={riding ? 'true' : 'false'} style={{ maxHeight: hBudget + 20 }}>
      <TramScene plain={buildPhase} maxH={hBudget} width={Math.max(300, stageW)} task={task} replay={shownReplay} at={ride.at} counter={counterText} veiled={counterVeiled} tone={tone} k={k} uid={uid} mood={mood} />
    </StageFrame>
  );

  /* ── le ruban : les plaques, les puces, les tickets ── */
  const press = (idx) => { setLab((s) => L.toggleOp(s, idx)); playSfx('tooth', { pitch: lab.stamps.includes(idx) ? 0.75 : 1 }); };
  const chipBase = `relative inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 text-2xl font-black shadow-[0_3px_0_0_#A5B4FC] transition-all duration-150 active:translate-y-0.5 active:shadow-none disabled:shadow-none motion-reduce:transition-none ${ring}`;
  const canStamp = L.canStamp(lab);
  const strip = !buildPhase && (
    <div className="flex flex-wrap items-center justify-center gap-1.5" dir="ltr" data-tr-strip role="group" aria-label={k('strip.aria')}>
      {tokens.map((tk, i) => {
        if (tk.t === 'num') {
          return <span key={i} data-tr-num={i / 2} className="inline-flex min-h-[48px] min-w-[52px] items-center justify-center rounded-xl border-2 border-slate-300 bg-white px-2.5 text-xl font-black tabular-nums text-slate-900 shadow-[0_2px_0_0_#CBD5E1]">{tk.text}</span>;
        }
        const idx = (i - 1) / 2;
        const t = L.ticketOf(lab, idx);
        const op = ops[idx];
        return (
          <button key={i} type="button" disabled={!canStamp} onClick={() => press(idx)} data-tr-op={idx} data-ticket={t || ''}
            aria-label={t ? k('strip.opAriaStamped', { o: tk.o, a: tokens[i - 1].text, b: tokens[i + 1].text, t }) : k('strip.opAria', { o: tk.o, a: tokens[i - 1].text, b: tokens[i + 1].text })}
            className={`${chipBase} ${t ? 'border-indigo-500 bg-indigo-100 text-indigo-950' : 'border-indigo-300 bg-white text-indigo-950'} disabled:cursor-default`}>
            {op.o}
            {t > 0 && <span className="absolute -top-2 -end-2 inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-indigo-600 text-xs font-black text-white" data-tr-ticket-badge>{t}</span>}
          </button>
        );
      })}
      <span className="mx-1 hidden h-8 w-px bg-slate-300 sm:inline-block" aria-hidden="true" />
      <span className="inline-flex items-center gap-1 rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50 px-2 py-1 text-xs font-black text-indigo-900" data-tr-punch aria-label={k('strip.punch')}>
        <Ticket className="h-4 w-4" aria-hidden="true" />
        {Array.from({ length: task.nOps }, (_, i) => (
          <span key={i} data-tr-ticket-stub={i + 1} className={`inline-flex h-6 w-6 items-center justify-center rounded-full border text-[11px] ${lab.stamps.length > i ? 'border-slate-200 bg-slate-100 text-slate-300' : 'border-indigo-400 bg-white text-indigo-900'}`}>{i + 1}</span>
        ))}
      </span>
    </div>
  );

  /* ── écrire la chaîne (متقدم) ── */
  const bank = useMemo(() => (task.build ? L.bankOf(task) : []), [task]);
  const bankBtn = 'inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border-2 border-sky-300 bg-white px-2.5 text-lg font-black tabular-nums text-sky-950 shadow-[0_2px_0_0_#7DD3FC] active:translate-y-0.5 disabled:opacity-40';
  const builder = buildPhase && (
    <LabCard className="space-y-2 p-2" data-tr-builder>
      <div className="flex flex-wrap items-center justify-center gap-1.5" dir="ltr" data-tr-slots>
        {lab.slots.map((id, pos) => {
          const item = id ? bank.find((b) => b.id === id) : null;
          return (
            <button key={pos} type="button" data-tr-slot={pos} data-kind={L.slotKind(pos)} data-filled={item ? 'true' : 'false'}
              onClick={() => { if (item) setLab((s) => L.takeToken(s, pos)); }} disabled={!item}
              aria-label={item ? `${k('build.slotAria', { i: pos + 1 })}: ${item.text}` : k('build.emptyAria')}
              className={`inline-flex min-h-[48px] items-center justify-center border-2 text-xl font-black tabular-nums ${L.slotKind(pos) === 'num' ? 'min-w-[56px] rounded-xl px-2' : 'w-12 rounded-full'} ${item ? 'border-indigo-400 bg-indigo-50 text-indigo-950' : 'border-dashed border-slate-300 bg-white text-slate-300'} ${ring}`}>
              {item ? item.text : ''}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-1.5" dir="ltr" data-tr-bank aria-label={k('build.bank')}>
        {bank.map((b) => (
          <button key={b.id} type="button" data-tr-token={b.id} disabled={lab.slots.includes(b.id)} onClick={() => setLab((s) => L.placeToken(s, b))}
            className={`${bankBtn} ${b.kind === 'op' ? 'rounded-full' : ''} ${ring}`}>{b.text}</button>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button type="button" data-tr-clear-slots onClick={() => setLab(L.clearSlots)} className={`inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 ${ring}`}>
          <Eraser className="h-4 w-4" aria-hidden="true" /> {k('build.clear')}
        </button>
        <button type="button" data-tr-check disabled={!L.slotsFull(lab)} onClick={() => setLab(L.checkBuild)}
          className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-2xl border-2 border-sky-600 bg-sky-500 px-4 text-base font-black text-white shadow-[0_3px_0_0_#0369A1] disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none ${ring}`}>
          {k('build.check')}
        </button>
      </div>
    </LabCard>
  );

  /* ── les commandes ── */
  const controls = !buildPhase && (
    <LabCard className="space-y-1.5 p-1.5" data-tr-controls>
      {task.predict && !free && (
        <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl bg-indigo-50 px-3 py-1.5" data-tr-predict data-sent={lab.predSent ? 'true' : 'false'}>
          <label htmlFor={`${uid}-pred`} className="text-xs font-black text-indigo-950">{k('predict.title')}</label>
          <input id={`${uid}-pred`} type="text" inputMode="decimal" autoComplete="off" dir="ltr" value={lab.pred} disabled={!!lab.replay || done}
            onChange={(e) => setLab((s) => L.setPred(s, e.target.value))} aria-label={k('predict.aria')} data-tr-predict-input
            className={`h-10 w-24 rounded-xl border-2 border-indigo-300 bg-white px-2 text-center text-xl font-black tabular-nums text-indigo-950 disabled:bg-slate-100 ${ring}`} />
        </div>
      )}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button type="button" onClick={() => setLab(L.clearStamps)} disabled={done || (!lab.stamps.length && !lab.replay)} data-tr-clear
          className={`inline-flex min-h-[44px] items-center justify-center gap-1 rounded-full border-2 border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 disabled:opacity-40 ${ring}`}>
          <Eraser className="h-4 w-4" aria-hidden="true" /> {k('stamp.clear')}
        </button>
        <button type="button" onClick={() => setLab(L.go)} disabled={!L.canGo(lab)} data-tr-go aria-label={k('stamp.goAria')}
          className={`inline-flex min-h-[44px] items-center justify-center gap-2 whitespace-nowrap rounded-2xl border-2 border-sky-600 bg-sky-500 px-5 text-base font-black text-white shadow-[0_3px_0_0_#0369A1] transition-all duration-150 active:translate-y-0.5 disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none motion-reduce:transition-none ${ring}`}>
          <Play className="h-5 w-5 -scale-x-100" aria-hidden="true" /> <span dir="rtl">{k('stamp.go')}</span>
        </button>
      </div>
    </LabCard>
  );

  /* ── le verdict ── */
  const vv = verdictOf(lab, k, shownReplay, buildPhase, riding);
  const canNext = L.canNext(lab) && !cp.blocking && ride.done;
  const Icon = vv.tone === 'emerald' ? CheckCircle2 : vv.tone === 'indigo' ? Hand : Sparkles;
  const banner = (
    <VerdictBanner tone={vv.tone} icon={wide ? Icon : null} size="sm" className="min-h-[2.75rem] !py-1.5" data-tr-verdict={vv.code}>
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
        <p className={vv.tone === 'indigo' ? 'font-bold text-indigo-900' : ''}><MathText>{vv.text}</MathText></p>
        {canNext && (
          <button type="button" onClick={() => setLab(L.nextTask)} data-tr-next
            className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-2 border-emerald-600 bg-emerald-600 px-3.5 text-sm font-black text-white shadow-[0_3px_0_0_#047857] transition-all duration-150 active:translate-y-0.5 motion-reduce:transition-none ${ring}`}>
            {k('next')} <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </VerdictBanner>
  );
  const linesRow = shownReplay && (
    <p className="text-center text-xs font-bold text-slate-600" dir="ltr" data-tr-lines>
      {k('strip.plan', { lines: shownReplay.lines.join('  ←  ') })}
    </p>
  );

  return (
    <>
      <div className="relative space-y-2" data-tr-glance>
        {party.node}
        {cp.node}
        {prompt}
        {wide ? (
          <div className="flex items-stretch gap-2">
            <div className="min-w-0 flex-1">{stage}</div>
            <div className="shrink-0" style={{ width: SIDE_W }}>{counters}</div>
          </div>
        ) : (<>{stage}{counters}</>)}
        {strip}
        {builder}
        {linesRow}
        {controls}
        {banner}
      </div>
      <FreeCard lab={lab} setLab={setLab} k={k} />
    </>
  );
}

/* ══════════════ Le verdict ══════════════ */

function verdictOf(lab, k, rp, buildPhase, riding) {
  const task = L.taskOf(lab);
  if (buildPhase) {
    if (lab.lastBuild && !lab.lastBuild.ok) return { text: k('build.wrong'), tone: 'amber', code: 'buildWrong' };
    return { text: k('idle.build'), tone: 'indigo', code: '' };
  }
  if (riding) return { text: k('idle.go'), tone: 'indigo', code: 'riding' };
  if (rp) {
    const pred = lab.pred !== '' && !L.isFree(lab) && lab.predSent
      ? lab.trials.findLast((e) => e.tk === 'predict' && e.id === task.id) : null;
    const predText = pred ? ` ${pred.ok ? k('v.predictOk', { v: iso(pred.truth) }) : k('v.predictNo', { guess: iso(pred.predicted), truth: iso(pred.truth) })}` : '';
    if (rp.ok) {
      if (L.isFree(lab)) return { text: k('v.freeOk', { v: iso(rp.truthText) }), tone: 'emerald', code: 'free' };
      return { text: `${rp.conventional ? k('v.ok', { v: iso(rp.truthText) }) : k('v.any', { v: iso(rp.truthText) })}${predText}`, tone: 'emerald', code: rp.conventional ? 'ok' : 'any' };
    }
    const a = rp.absurd;
    const line = a ? k(`v.${a.kind === 'groups' && task.unit === 'km' ? 'groupsKm' : a.kind}`, Object.fromEntries(Object.entries(a).map(([key, val]) => [key, iso(val)]))) : '';
    return { text: `${line} ${k('v.refused', { plan: iso(rp.planText), truth: iso(rp.truthText) })}${predText}`.trim(), tone: 'rose', code: 'refused' };
  }
  if (L.allStamped(lab)) return { text: k('idle.go'), tone: 'indigo', code: '' };
  return { text: k(L.isFree(lab) ? 'idle.free' : 'idle.stamp'), tone: 'indigo', code: '' };
}

/* ══════════════ « جرّب أعدادك » : toujours ouvert ══════════════ */

const DEFAULT_EVENTS = [{ type: 'off', n: '9', k: '2', m: '5' }, { type: 'on', n: '4', k: '3', m: '4' }];

function FreeCard({ lab, setLab, k }) {
  const free = L.isFree(lab);
  const [start, setStart] = useState('26');
  const [events, setEvents] = useState(DEFAULT_EVENTS);
  const verdict = L.validateFree(start, events);
  const apply = (nextStart, nextEvents) => {
    const v = L.validateFree(nextStart, nextEvents);
    if (v.ok) setLab((s) => L.setFree(s, v.chain));
  };
  const change = (nextStart, nextEvents) => { setStart(nextStart); setEvents(nextEvents); apply(nextStart, nextEvents); };
  const digits = (x) => String(x).replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[^0-9]/g, '').slice(0, 2);
  const setEv = (i, patch) => change(start, events.map((e, j) => (j === i ? { ...e, ...patch } : e)));
  const field = `h-11 w-16 rounded-xl border-2 border-emerald-300 bg-white px-2 text-center text-lg font-black tabular-nums text-indigo-950 ${ring}`;
  const msg = !verdict.ok ? k(`free.${verdict.why}`) : '';
  return (
    <LabCard className="space-y-2 border-emerald-200 bg-emerald-50/50 p-3" data-tr-free data-active={free ? 'true' : 'false'}>
      <p className="flex items-center gap-1.5 text-sm font-black text-emerald-900"><FlaskConical className="h-4 w-4" aria-hidden="true" /> {k('free.title')}</p>
      <p className="text-xs font-bold leading-snug text-slate-600">{free ? k('free.on') : k('free.hint')}</p>
      <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
        <label className="flex flex-col gap-1 text-xs font-black text-indigo-950">
          {k('free.start')}
          <input type="text" inputMode="numeric" autoComplete="off" dir="ltr" value={start} onChange={(e) => change(digits(e.target.value), events)}
            aria-label={k('free.startAria')} data-tr-free-start className={field} />
        </label>
        {events.map((ev, i) => {
          const group = ev.type === 'groupsOn' || ev.type === 'groupsOff';
          return (
            <div key={i} className="flex items-end gap-1.5" data-tr-free-row={i}>
              <label className="flex flex-col gap-1 text-xs font-black text-indigo-950">
                {k('free.stop', { i: i + 1 })}
                <select value={ev.type} onChange={(e) => setEv(i, { type: e.target.value })} aria-label={k('free.typeAria', { i: i + 1 })} data-tr-free-type={i}
                  className={`h-11 rounded-xl border-2 border-emerald-300 bg-white px-1.5 text-sm font-black text-indigo-950 ${ring}`}>
                  {L.FREE_TYPES.map((tp) => <option key={tp} value={tp}>{k(`free.type.${tp}`)}</option>)}
                </select>
              </label>
              {group ? (
                <>
                  <label className="flex flex-col gap-1 text-xs font-black text-indigo-950">{k('free.k')}
                    <input type="text" inputMode="numeric" dir="ltr" autoComplete="off" value={ev.k} onChange={(e) => setEv(i, { k: digits(e.target.value) })} data-tr-free-k={i} className={field} /></label>
                  <label className="flex flex-col gap-1 text-xs font-black text-indigo-950">{k('free.m')}
                    <input type="text" inputMode="numeric" dir="ltr" autoComplete="off" value={ev.m} onChange={(e) => setEv(i, { m: digits(e.target.value) })} data-tr-free-m={i} className={field} /></label>
                </>
              ) : (
                <label className="flex flex-col gap-1 text-xs font-black text-indigo-950">{k('free.n')}
                  <input type="text" inputMode="numeric" dir="ltr" autoComplete="off" value={ev.n} onChange={(e) => setEv(i, { n: digits(e.target.value) })} data-tr-free-n={i} className={field} /></label>
              )}
            </div>
          );
        })}
        <div className="flex items-center gap-1.5">
          <button type="button" data-tr-free-add disabled={events.length >= L.FREE_LIMITS.maxStops} onClick={() => change(start, [...events, { type: 'on', n: '3', k: '2', m: '4' }])}
            className={`inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-emerald-200 bg-white px-3 text-xs font-bold text-emerald-900 disabled:opacity-40 ${ring}`}>
            <Plus className="h-4 w-4" aria-hidden="true" /> {k('free.add')}
          </button>
          <button type="button" data-tr-free-remove disabled={events.length <= 1} onClick={() => change(start, events.slice(0, -1))}
            className={`inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-emerald-200 bg-white px-3 text-xs font-bold text-emerald-900 disabled:opacity-40 ${ring}`}>
            <Minus className="h-4 w-4" aria-hidden="true" /> {k('free.remove')}
          </button>
          {free && (
            <button type="button" onClick={() => setLab(L.toGuided)} data-tr-free-back
              className={`inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-emerald-200 bg-white px-3 text-xs font-bold text-emerald-900 ${ring}`}>
              <Undo2 className="h-4 w-4" aria-hidden="true" /> {k('free.back')}
            </button>
          )}
        </div>
      </div>
      {msg && <p role="alert" className="text-sm font-bold text-rose-700" data-tr-free-refusal={verdict.why}>{msg}</p>}
    </LabCard>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite de questions de chaque tâche : elle interroge ce que l'élève vient de FAIRE, et mène à la règle. */
export const CHAINS = Object.freeze({
  t1: ['realStop', 'order'],
  t2: ['swapAdds', 'swapSub', 'rule1'],
  t3: ['unitPrice', 'absurdPrice', 'rule2'],
  t4: ['groupsTotal', 'whenAdded', 'rule3'],
  a1: ['groupsTotal', 'firstOp'],
  a2: ['groupsTotal', 'firstOp'],
  a3: ['carShare', 'groupsTotal'],
});

const Mx = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const nm = (v) => C.numText(v);
const groupTerm = (task) => task.terms.find((tm) => tm.grouped && /×/.test(tm.text)) ?? task.terms.find((tm) => tm.grouped);
const kmOf = (task) => task.unit === 'km';
const wrongBy = (task, order) => nm(C.valueInOrder(task.chain, order).value);
/** Le plan « + − d'abord » : la première opération + ou − est faite avant toutes les autres. */
const plusFirstOrder = (task) => {
  const idx = task.ops.findIndex((p) => p.o === '+' || p.o === '−');
  return [idx, ...task.order.filter((x) => x !== idx)];
};
const opText = (task, i) => `${task.numbers[i]} ${task.ops[i].o} ${task.numbers[i + 1]}`;

/** Chaque question est construite sur LES nombres de la tâche (rien n'est écrit en dur) ; `k` : les textes de `tramRoute`. */
export const QUESTIONS = {
  realStop: (lab, task, k) => {
    const tm = task.terms[1];
    const o = { verb: k(tm.sign === '−' ? 'cp.verbOff' : 'cp.verbOn'), stop: k(`stop.${task.stops[0]}`), n: iso(tm.text), o: task.ops[0].o };
    return {
      id: 'realStop', kind: 'number', expected: tm.text, answer: <MathText>{$(tex(tm.text))}</MathText>,
      prompt: Mx(k, 'realStop.prompt', o), hints: [Mx(k, 'realStop.hint1', o), Mx(k, 'realStop.hint2', o)], explain: Mx(k, 'realStop.explain', o),
    };
  },
  order: (lab, task, k) => {
    const o = { a: k(`stop.${task.stops[0]}`), b: k(`stop.${task.stops[1]}`), truth: iso(task.truthText) };
    return {
      id: 'order', kind: 'choice',
      prompt: Mx(k, 'order.prompt', o),
      options: [{ text: Mx(k, 'order.first', o), correct: true }, { text: Mx(k, 'order.second', o), why: Mx(k, 'order.whySecond', o) }, { text: Mx(k, 'order.both', o), why: Mx(k, 'order.whyBoth', o) }],
      hints: [Mx(k, 'order.hint1', o), Mx(k, 'order.hint2', o)], explain: Mx(k, 'order.explain', o),
    };
  },
  swapAdds: (lab, task, k) => {
    const [x, y, z] = task.numberValues.slice(0, 3);
    const o = { x: iso(nm(x)), y: iso(nm(y)), z: iso(nm(z)), xy: iso(nm(C.evaluateChain(`${nm(x)} + ${nm(y)}`))), yz: iso(nm(C.evaluateChain(`${nm(y)} + ${nm(z)}`))), sum: iso(nm(C.evaluateChain(`${nm(x)} + ${nm(y)} + ${nm(z)}`))) };
    return {
      id: 'swapAdds', kind: 'choice',
      prompt: Mx(k, 'swapAdds.prompt', o),
      options: [{ text: Mx(k, 'swapAdds.same', o), correct: true }, { text: Mx(k, 'swapAdds.diff', o), why: Mx(k, 'swapAdds.whyDiff', o) }],
      hints: [Mx(k, 'swapAdds.hint1', o), Mx(k, 'swapAdds.hint2', o)], explain: Mx(k, 'swapAdds.explain', o),
    };
  },
  swapSub: (lab, task, k) => {
    const last = task.nOps - 1;
    const wrong = wrongBy(task, [last, ...task.order.filter((x) => x !== last)]);
    const o = { chain: iso(task.chain), c: iso(task.numbers[last]), d: iso(task.numbers[last + 1]), cd: iso(nm(C.evaluateChain(`${task.numbers[last]} + ${task.numbers[last + 1]}`))), wrong: iso(wrong), truth: iso(task.truthText) };
    return {
      id: 'swapSub', kind: 'choice',
      prompt: Mx(k, 'swapSub.prompt', o),
      options: [{ text: Mx(k, 'swapSub.diff', o), correct: true }, { text: Mx(k, 'swapSub.same', o), why: Mx(k, 'swapSub.whySame', o) }],
      hints: [Mx(k, 'swapSub.hint1', o), Mx(k, 'swapSub.hint2', o)], explain: Mx(k, 'swapSub.explain', o),
    };
  },
  rule1: (lab, task, k) => {
    const last = task.nOps - 1;
    const o = { chain: iso(task.chain), truth: iso(task.truthText), wrong: iso(wrongBy(task, [last, ...task.order.filter((x) => x !== last)])) };
    return {
      id: 'rule1', kind: 'choice',
      prompt: Mx(k, 'rule1.prompt', o),
      options: [{ text: Mx(k, 'rule1.left', o), correct: true }, { text: Mx(k, 'rule1.plus', o), why: Mx(k, 'rule1.whyPlus', o) }, { text: Mx(k, 'rule1.right', o), why: Mx(k, 'rule1.whyRight', o) }],
      hints: [Mx(k, 'rule1.hint1', o), Mx(k, 'rule1.hint2', o)], explain: Mx(k, 'rule1.explain', o),
    };
  },
  unitPrice: (lab, task, k) => {
    const u = nm(C.evaluateChain(`${task.numbers[0]} ÷ ${task.numbers[1]}`));
    const o = { b: iso(task.numbers[0]), a: iso(task.numbers[1]), u: iso(u) };
    return {
      id: 'unitPrice', kind: 'number', expected: u, answer: <MathText>{$(tex(u))}</MathText>,
      prompt: Mx(k, 'unitPrice.prompt', o), hints: [Mx(k, 'unitPrice.hint1', o), Mx(k, 'unitPrice.hint2', o)], explain: Mx(k, 'unitPrice.explain', o),
    };
  },
  absurdPrice: (lab, task, k) => {
    const u = nm(C.evaluateChain(`${task.numbers[0]} ÷ ${task.numbers[1]}`));
    const o = { tickets: iso(task.numbers[2]), wrong: iso(wrongBy(task, [1, 0])), u: iso(u), truth: iso(task.truthText) };
    return {
      id: 'absurdPrice', kind: 'choice',
      prompt: Mx(k, 'absurdPrice.prompt', o),
      options: [{ text: Mx(k, 'absurdPrice.right', o), correct: true }, { text: Mx(k, 'absurdPrice.dec', o), why: Mx(k, 'absurdPrice.whyDec', o) }, { text: Mx(k, 'absurdPrice.fewer', o), why: Mx(k, 'absurdPrice.whyFewer', o) }],
      hints: [Mx(k, 'absurdPrice.hint1', o), Mx(k, 'absurdPrice.hint2', o)], explain: Mx(k, 'absurdPrice.explain', o),
    };
  },
  rule2: (lab, task, k) => {
    const o = { a: iso(task.numbers[0]), b: iso(task.numbers[1]), c: iso(task.numbers[2]), wrong: iso(wrongBy(task, [1, 0])), truth: iso(task.truthText) };
    return {
      id: 'rule2', kind: 'choice',
      prompt: Mx(k, 'rule2.prompt', o),
      options: [{ text: Mx(k, 'rule2.left', o), correct: true }, { text: Mx(k, 'rule2.mulFirst', o), why: Mx(k, 'rule2.whyMul', o) }, { text: Mx(k, 'rule2.free', o), why: Mx(k, 'rule2.whyFree', o) }],
      hints: [Mx(k, 'rule2.hint1', o), Mx(k, 'rule2.hint2', o)], explain: Mx(k, 'rule2.explain', o),
    };
  },
  groupsTotal: (lab, task, k) => {
    const tm = groupTerm(task);
    const [kk, mm] = tm.text.split(/\s*×\s*/);
    const o = { k: iso(kk), m: iso(mm), v: iso(nm(tm.value)) };
    return {
      id: 'groupsTotal', kind: 'number', expected: nm(tm.value), answer: <MathText>{$(tex(nm(tm.value)))}</MathText>,
      prompt: Mx(k, kmOf(task) ? 'groupsTotal.promptKm' : 'groupsTotal.prompt', o), hints: [Mx(k, 'groupsTotal.hint1', o), Mx(k, 'groupsTotal.hint2', o)], explain: Mx(k, 'groupsTotal.explain', o),
    };
  },
  whenAdded: (lab, task, k) => {
    const tm = groupTerm(task);
    const [kk, mm] = tm.text.split(/\s*×\s*/);
    const a = task.numbers[0];
    const ak = C.evaluateChain(`${a} + ${kk}`);
    const o = { a: iso(a), k: iso(kk), m: iso(mm), v: iso(nm(tm.value)), ak: iso(nm(ak)), truth: iso(task.truthText), wrong: iso(nm(C.evaluateChain(`${nm(ak)} × ${mm}`))) };
    return {
      id: 'whenAdded', kind: 'choice',
      prompt: Mx(k, 'whenAdded.prompt', o),
      options: [{ text: Mx(k, 'whenAdded.after', o), correct: true }, { text: Mx(k, 'whenAdded.before', o), why: Mx(k, 'whenAdded.whyBefore', o) }, { text: Mx(k, 'whenAdded.never', o), why: Mx(k, 'whenAdded.whyNever', o) }],
      hints: [Mx(k, 'whenAdded.hint1', o), Mx(k, 'whenAdded.hint2', o)], explain: Mx(k, 'whenAdded.explain', o),
    };
  },
  firstOp: (lab, task, k) => {
    const tm = groupTerm(task);
    const p = tm.text;
    const q = opText(task, 0);
    const r = nm(C.evaluateChain(q));
    const o = { chain: iso(task.chain), p: iso(p), q: iso(q), r: iso(r), x: iso(task.numbers[0]), what: k(kmOf(task) ? 'cp.firstOp.whatLegs' : 'cp.firstOp.whatGroups') };
    return {
      id: 'firstOp', kind: 'choice',
      prompt: Mx(k, 'firstOp.prompt', o),
      options: [{ text: Mx(k, 'firstOp.right', o), correct: true }, { text: Mx(k, 'firstOp.first', o), why: Mx(k, 'firstOp.whyFirst', o) }, { text: Mx(k, 'firstOp.free', o), why: Mx(k, 'firstOp.whyFree', o) }],
      hints: [Mx(k, 'firstOp.hint1', o), Mx(k, 'firstOp.hint2', o)], explain: Mx(k, 'firstOp.explain', o),
    };
  },
  carShare: (lab, task, k) => {
    const v = nm(task.terms[0].value);
    const o = { a: iso(task.numbers[0]), b: iso(task.numbers[1]), v: iso(v) };
    return {
      id: 'carShare', kind: 'number', expected: v, answer: <MathText>{$(tex(v))}</MathText>,
      prompt: Mx(k, 'carShare.prompt', o), hints: [Mx(k, 'carShare.hint1', o), Mx(k, 'carShare.hint2', o)], explain: Mx(k, 'carShare.explain', o),
    };
  },
  rule3: (lab, task, k) => {
    const tm = groupTerm(task);
    const wrong = wrongBy(task, plusFirstOrder(task));
    const idx = plusFirstOrder(task)[0];
    const o = { chain: iso(task.chain), p: iso(tm.text), q: iso(opText(task, idx)), wrong: iso(wrong), truth: iso(task.truthText) };
    return {
      id: 'rule3', kind: 'choice',
      prompt: Mx(k, 'rule3.prompt', o),
      options: [{ text: Mx(k, 'rule3.first', o), correct: true }, { text: Mx(k, 'rule3.left', o), why: Mx(k, 'rule3.whyLeft', o) }, { text: Mx(k, 'rule3.always', o), why: Mx(k, 'rule3.whyAlways', o) }, { text: Mx(k, 'rule3.same', o), why: Mx(k, 'rule3.whySame', o) }],
      hints: [Mx(k, 'rule3.hint1', o), Mx(k, 'rule3.hint2', o)], explain: Mx(k, 'rule3.explain', o),
    };
  },
};
