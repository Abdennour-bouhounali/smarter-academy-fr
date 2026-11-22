import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Hand, CheckCircle2, Sparkles, ChevronLeft, FlaskConical, Undo2, Minus, Plus, Lock, Blinds } from 'lucide-react';
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
import * as L from '../logic/windowBlinds';
import { COL, Outside, Rail, Grip, Student } from './windowBlinds/art';

/**
 * window-blinds — LES DEUX FACTEURS SOUS LA MAIN (2AM, unité 2, درس « جداء كسرين », 2026-10-29). La logique, exacte, est dans `logic/windowBlinds.js` (sur `fractions2.js` E3, importé par
 * chemin). Thème `classwindow` : une grande fenêtre de classe, un rideau latéral sur un rail à crans et un store à enrouleur sur un cordon à crans.
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. La main tient DEUX facteurs, par deux tirages PERPENDICULAIRES : le bord du rideau (horizontal, se colle aux crans du rail) et la barre du store (vertical, se colle aux crans du
 *    cordon) ; ou −/+ pour chacun, ← → (rideau) et ↑ ↓ (store) ; « ماذا أُظلم؟ » (Entrée) vérifie les deux tirages.
 * B. Le verre couvert par les DEUX est le coin doublement ombré (deux couches translucides : le recouvrement est visiblement plus sombre). Les guides (b verticales et d horizontales)
 *    n'apparaissent qu'APRÈS les deux tirages : les petits carrés que les ombres ont découpés.
 * C. La résistance : l'aire du coin n'est pas la somme (elle déborde de la fenêtre), ni le facteur seul ; au niveau متقدم les tirages sont fermés tant que le produit n'est pas ÉCRIT.
 * D. La phase formelle écrit ce que l'élève a fait : 2/3 × 3/4 = (2 × 3)/(3 × 4) = 6/12 = 1/2.
 * E. Les fausses écritures (17/12, 6/7, 8/9, 2/3, 6) sont refutées par un CADRE en pointillé de l'aire écrite, posé à côté du coin sombre réel.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        une fraction D'UNE fraction est un produit ; l'aire du recouvrement de deux couvertures perpendiculaires est ac/(bd) de fenêtre
 *   OBJECT         un mur de W × H fenêtres, un rail à b crans par fenêtre, un cordon à d crans par fenêtre, deux ombres qui se recouvrent
 *   VARIABLE       les deux facteurs : la largeur couverte a/b et la hauteur couverte c/d
 *   INVARIANT      la fenêtre vaut 1 ; chaque petit carré vaut 1/(b·d) de fenêtre
 *   TRANSFORMATION tirage (a crans, c crans) → a·c carrés sombres sur b·d par fenêtre
 *   CONSTRAINT     tirages exacts (« ماذا أُظلم؟ ») ; au niveau متقدم le produit est écrit AVANT de tirer
 *   RESISTANCE     les modèles faux (somme, b + d, produit en croix, un seul facteur, carrés sans le dénominateur) sont refusés et dessinés
 *   EVIDENCE       le coin sombre, les guides, le cadre en pointillé, les chaînes de questions
 *   CONTRAST       un facteur entier (a4 : 2 × 3/5) contre deux fractions ; > 1 fenêtre (متقدم) contre < 1 (مبتدئ)
 *   PREDICTION     (متقدم) le produit est ÉCRIT avant de tirer
 *   DISCOVERY      « كيف نحسب جزءًا من جزء ؟ »
 *   FORMALIZATION  a/b × c/d = (a × c)/(b × d) , puis on réduit
 *   TRANSFER       « جرّب أعدادك » (toujours ouvert), les exercices et la banque
 *
 * « جرّب كل الإمكانيات » : NON (chaque « ماذا أُظلم؟ » est l'essai). « جرّب أعدادك » est TOUJOURS ouvert sous le labo (jamais comptée).
 * ONBOARDING : `coach` (défaut true) → `LabCoach` ; `logic/windowBlinds.js › coachOf` (curtain · blind · ask · lines · write · predict · next).
 * Props : `tasks`, `level`, `levels`, `coach`, `title`, `lead`, `onTrial(event)`, `onFinished()`.
 * CONTRAT DOM : [data-window-blinds][data-level][data-task][data-a][data-c][data-solved][data-layout], [data-wb-glance], [data-wb-scene], [data-wb-curtain][role=slider][aria-valuenow],
 * [data-wb-blind][role=slider][aria-valuenow], [data-wb-pane=<i>-<j>][data-dark], [data-wb-less-c|more-c|less-b|more-b], [data-wb-ask], [data-wb-write][data-phase], [data-wb-input],
 * [data-wb-check], [data-wb-frame][data-model], [data-wb-verdict], [data-wb-next], [data-wb-step=<i>], [data-wb-lines], [data-wb-free][data-active], [data-wb-free-a|b|c|d],
 * [data-wb-free-back], [data-wb-free-guess], [data-wb-formal], [data-wb-factor=curtain|blind].
 */
const NS = 'manipulation.windowBlinds';
const LRI = '⁦';
const PDI = '⁩';
const iso = (s) => `${LRI}${s}${PDI}`;
const WIDE_MIN = 700;
const SIDE_W = 236;
const SCENE_MAX = 560;
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-indigo-300';
const $ = (s) => `$${s}$`;
const frac = (n, d) => (d === 1 ? String(n) : `\\frac{${n}}{${d}}`);

const CSS = `
@keyframes wb-pop { 0% { transform: scale(0.85); opacity: 0.2; } 100% { transform: scale(1); opacity: 1; } }
.wb-pop { animation: wb-pop 220ms ease-out; transform-box: fill-box; transform-origin: top right; }
@media (prefers-reduced-motion: reduce) { .wb-pop { animation: none !important; } }
`;

export function numbersFor({ tasks, level }) {
  const lv = resolveLevelId(level ?? 'beginner');
  const asked = LEVELS['window-blinds'][lv].numbers;
  return { tasks: tasks ?? asked.tasks };
}

export default function WindowBlinds({
  tasks, title, lead, level, levels: withLevels = true, coach: coachOn = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const initialNumbers = useMemo(() => numbersFor({ tasks, level }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'window-blinds', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
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
  const cpSettings = useLabCheckpointSettings('window-blinds');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
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
    lab: 'window-blinds', step: coachStep,
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
      type="window-blinds"
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
        <div ref={boxRef} className="space-y-2" data-window-blinds data-level={advanced ? 'advanced' : 'beginner'} data-task={lab.free ? 'free' : lab.ti}
          data-a={lab.w.ca} data-c={lab.w.cc} data-solved={finished ? 'true' : 'false'} data-layout={width >= WIDE_MIN ? 'wide' : 'narrow'}>
          <style dangerouslySetInnerHTML={{ __html: CSS }} />
          <Lab lab={lab} setLab={setLab} k={k} width={width} screenH={screenH} lead={state.isAuthoredLevel ? lead : null} cp={cp} advanced={advanced} />
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ══════════════ Le laboratoire ══════════════ */

function Lab({ lab, setLab, k, width, screenH, lead, cp, advanced }) {
  const wide = width >= WIDE_MIN;
  const task = L.taskOf(lab);
  const free = L.isFree(lab);
  const done = L.taskDone(lab);
  const lit = !free && done;
  const w = lab.w;
  const last = lab.last;

  /* ── la consigne : le contexte puis UNE question ── */
  const ctx = (() => {
    if (lead && lab.ti === 0 && !free) return lead;
    if (free) return k('ctx.free');
    return k(`ctx.${task.id}`);
  })();
  const question = free ? k('q.free', { c: iso(`${task.a}/${task.b}`), b: iso(`${task.c}/${task.d}`) }) : task.predict ? k('q.predict') : k(`q.${task.id}`);

  const stepDone = lab.tasks.map((_, i) => !!lab.done[i] && (i !== lab.ti || !cp.blocking));
  const steps = lab.tasks.length > 1 && !free && <LabStepper count={lab.tasks.length} current={lab.ti} done={stepDone} stepAttr="data-wb-step" />;
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.trials.length === 0 && celebrated.current.size) celebrated.current = new Set();
  const nowDone = !free && stepDone[lab.ti];
  useEffect(() => {
    if (!nowDone || celebrated.current.has(lab.ti)) return;
    celebrated.current.add(lab.ti);
    party.celebrate({ n: lab.ti + 1, total: lab.tasks.length });
  }, [nowDone, lab.ti]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── le son (muet sauf « الصوت ») : un déclic par cran, le drapeau quand les tirages sont justes ou le produit juste, « over » sur un refus, la cloche à la fin ── */
  const sfx = useRef({ a: w.ca, c: w.cc, key: '' });
  const sfxKey = `${free ? 'free' : lab.ti}`;
  useEffect(() => {
    const p = sfx.current;
    if (p.key !== sfxKey) { sfx.current = { a: w.ca, c: w.cc, key: sfxKey }; return; }
    const d = (w.ca - p.a) + (w.cc - p.c);
    if (d !== 0) playSfx('gesture', { pitch: d > 0 ? 1 : 0.75 });
    p.a = w.ca; p.c = w.cc;
  }, [w.ca, w.cc, sfxKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const nTrials = lab.trials.length;
  useEffect(() => {
    if (!nTrials) return;
    const tr = lab.trials[nTrials - 1];
    if (tr.kind === 'solved') playSfx('bell');
    else if ((tr.kind === 'product' || tr.kind === 'predict') && tr.ok) playSfx('flag');
    else if (tr.kind === 'pull' && tr.which === 'blind' && lab.w.checked) playSfx('flag');
    else if (tr.kind === 'product' || tr.kind === 'predict' || tr.kind === 'pull') playSfx('over');
  }, [nTrials]); // eslint-disable-line react-hooks/exhaustive-deps

  const prompt = (
    <PromptCard size={wide ? 'lg' : 'md'} context={<MathText>{ctx}</MathText>} contextProps={{ 'data-wb-context': free ? 'free' : task.id }}
      title={<MathText>{question}</MathText>} titleClassName={wide ? 'text-xl' : 'text-lg'} lamp={free ? null : lit ? 'on' : 'off'}
      titleProps={{ 'data-wb-prompt': task.id, 'data-lit': lit ? 'true' : 'false' }} />
  );

  /* ── le verdict : la CONSÉQUENCE avec les nombres de l'élève, jamais la règle ── */
  const fc = $(frac(task.a, task.b)); const fb = $(frac(task.c, task.d));
  const verdictLine = (() => {
    if ((last?.kind === 'product' || last?.kind === 'predict') && last.ok) return k('v.right', { w: iso(last.value) });
    if (last?.kind === 'product' || last?.kind === 'predict') return k(`w.${last.model === 'right' ? 'other' : last.model}`, { w: iso(last.value) });
    if (w.miss) {
      const m = [];
      if (w.miss.curtain) m.push(k(`v.curtain.${w.miss.curtain}`, { f: fc }));
      if (w.miss.blind) m.push(k(`v.blind.${w.miss.blind}`, { f: fb }));
      return m.join(' ');
    }
    if (w.phase === 'predict') return k('idlePredict');
    if (w.phase === 'write') return k('idleWrite');
    if (last?.kind === 'pull' && w.checked) return k('v.pullOk');
    if (done) return k('v.allDone');
    return k('idle');
  })();
  const bad = !!(w.miss || (last && (last.kind === 'product' || last.kind === 'predict') && !last.ok));
  const good = !bad && !!last && ((last.kind === 'product' || last.kind === 'predict') && last.ok || (last.kind === 'pull' && w.checked));
  const tone = bad ? 'rose' : good ? 'emerald' : 'indigo';
  const Icon = bad ? Sparkles : good ? CheckCircle2 : Hand;
  const canNext = L.canNext(lab) && !cp.blocking;
  const mood = bad ? 'wonder' : done ? 'proud' : 'happy';
  const banner = (
    <VerdictBanner tone={tone} icon={wide ? Icon : null} size="sm" className="min-h-[3.5rem]" data-wb-verdict={bad ? 'bad' : good ? 'good' : ''}>
      <div className="min-w-0 space-y-1.5">
        <p className={last || w.miss ? '' : 'font-bold text-indigo-900'}><MathText>{verdictLine}</MathText></p>
        {canNext && (
          <button type="button" onClick={() => setLab(L.nextTask)} data-wb-next
            className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-2 border-emerald-600 bg-emerald-600 px-3.5 text-sm font-black text-white shadow-[0_3px_0_0_#047857] transition-all duration-150 active:translate-y-0.5 motion-reduce:transition-none ${ring}`}>
            {k('next')} <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </VerdictBanner>
  );

  const predicting = w.phase === 'predict';
  const bannerNode = predicting && !last ? null : banner;
  const stageW = Math.min(SCENE_MAX, Math.max(300, (wide ? width - SIDE_W - 12 : width) - 24));
  const board = <Board lab={lab} k={k} />;
  const stage = <Glass lab={lab} setLab={setLab} k={k} width={stageW} screenH={screenH} mood={mood} girl={!advanced} wide={wide} />;
  // une fois les deux tirages vérifiés (écriture, tâche faite) les commandes ne servent plus : le labo tient alors sur un écran
  const controls = w.phase === 'write' || w.phase === 'done' ? null : <Controls lab={lab} setLab={setLab} k={k} />;

  return (
    <>
      <div className="relative space-y-2" data-wb-glance>
        {party.node}
        {cp.node}
        {prompt}
        {wide ? (
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <StageFrame className="min-w-0 space-y-1.5 overflow-hidden p-3" data-wb-stage>
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">{board}{steps || null}</div>
                {stage}
              </StageFrame>
              {w.phase === 'predict' && <Writer lab={lab} setLab={setLab} k={k} />}
              {controls}
              {w.phase !== 'predict' && <Writer lab={lab} setLab={setLab} k={k} />}
            </div>
            <div className="flex shrink-0 flex-col gap-2.5" style={{ width: SIDE_W }}>{banner}</div>
          </div>
        ) : (
          <>
            <StageFrame className="min-w-0 space-y-1.5 overflow-hidden p-2" data-wb-stage>{board}{steps || null}{stage}</StageFrame>
            {w.phase === 'predict' && <Writer lab={lab} setLab={setLab} k={k} />}
            {controls}
            {w.phase !== 'predict' && <Writer lab={lab} setLab={setLab} k={k} />}
            {bannerNode}
          </>
        )}
      </div>
      <FreeCard lab={lab} setLab={setLab} k={k} />
    </>
  );
}

/* ══════════════ La planche : les deux facteurs de la tâche ══════════════ */

function Board({ lab, k }) {
  const task = L.taskOf(lab);
  const chip = 'inline-flex items-center gap-1 rounded-full border-2 px-2 py-0.5 text-xs font-black';
  return (
    <div className="flex flex-wrap items-center gap-1.5" data-wb-board role="list">
      <span role="listitem" data-wb-factor="curtain" className={`${chip} border-indigo-300 bg-indigo-50 text-indigo-900`}>
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: COL.curtain }} aria-hidden="true" />{k('plan.curtainShort')} <MathText>{$(task.b === 1 ? String(task.a) : `\\tfrac{${task.a}}{${task.b}}`)}</MathText>
      </span>
      <span role="listitem" data-wb-factor="blind" className={`${chip} border-amber-300 bg-amber-50 text-amber-900`}>
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: COL.blind }} aria-hidden="true" />{k('plan.blindShort')} <MathText>{$(`\\tfrac{${task.c}}{${task.d}}`)}</MathText>
      </span>
    </div>
  );
}

/* ══════════════ La vitre : la scène ══════════════ */

function Glass({ lab, setLab, k, width, screenH, mood, girl, wide }) {
  const uid = `wb${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const task = L.taskOf(lab);
  const w = lab.w;
  const locked = L.pullLocked(lab);
  const ASPECT = 1.25;
  const hMax = screenH >= 1000 ? 240 : wide ? 176 : 152;
  const SIDE = 100; const TOP = 42; const BOT = 30; const RIGHT = 22;
  const availW = Math.max(220, width - SIDE - RIGHT);
  const unitH = Math.min(hMax / task.H, availW / (task.W * ASPECT));
  const unitW = unitH * ASPECT;
  const gw = unitW * task.W; const gh = unitH * task.H;
  const gx0 = SIDE; const gx1 = SIDE + gw; const gy0 = TOP;
  const W = Math.round(SIDE + gw + RIGHT); const H = Math.round(TOP + gh + BOT);
  const stepX = unitW / task.b; const stepY = unitH / task.d;
  const edgeX = gx1 - w.ca * stepX; const barY = gy0 + w.cc * stepY;
  const svgRef = useRef(null);
  const dragRef = useRef(null);
  const pt = (e) => {
    const box = svgRef.current.getBoundingClientRect();
    return { x: ((e.clientX - box.left) / Math.max(1, box.width)) * W, y: ((e.clientY - box.top) / Math.max(1, box.height)) * H };
  };
  const apply = (which, e) => {
    const p = pt(e);
    if (which === 'curtain') setLab((s) => L.setCurtain(s, ((gx1 - p.x) / stepX)));
    else setLab((s) => L.setBlind(s, ((p.y - gy0) / stepY)));
  };
  const down = (which) => (e) => { if (locked) return; dragRef.current = which; svgRef.current.setPointerCapture?.(e.pointerId); apply(which, e); };
  const move = (e) => { if (dragRef.current) apply(dragRef.current, e); };
  const up = () => { dragRef.current = null; };
  const keyC = (e) => {
    const mp = { ArrowLeft: 1, ArrowRight: -1 };
    if (e.key in mp) { e.preventDefault(); setLab((s) => L.nudgeCurtain(s, mp[e.key])); }
    if (e.key === 'Enter') { e.preventDefault(); setLab(L.ask); }
  };
  const keyB = (e) => {
    const mp = { ArrowDown: 1, ArrowUp: -1 };
    if (e.key in mp) { e.preventDefault(); setLab((s) => L.nudgeBlind(s, mp[e.key])); }
    if (e.key === 'Enter') { e.preventDefault(); setLab(L.ask); }
  };
  const lines = L.linesShown(lab);
  const fl = lab.flag;
  let fw = 0; let fh = 0; let fx = 0; let clipped = false;
  if (fl) {
    fw = Math.sqrt(fl.value) * unitW; fh = Math.sqrt(fl.value) * unitH;
    const maxW = gx1 - 6; const maxH = H - gy0 - 6;
    if (fw > maxW || fh > maxH) { const sc = Math.min(maxW / fw, maxH / fh); fw *= sc; fh *= sc; clipped = true; }
    fx = gx1 - fw;
  }
  const cw = w.ca * stepX; const bh = w.cc * stepY;
  const solved = L.taskDone(lab);
  const showScreen = solved && cw > 36 && bh > 30;
  const stopsC = Array.from({ length: task.cols + 1 }, (_, i) => i);
  const stopsB = Array.from({ length: task.rows + 1 }, (_, j) => j);
  const lab2 = (n, d) => (d === 1 ? String(n) : `${n}/${d}`);

  return (
    <div className="space-y-1.5" data-wb-scene-box>
      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: W, display: 'block', margin: '0 auto', touchAction: 'none', direction: 'ltr' }} role="group" aria-label={k('stageAria')} data-wb-scene dir="ltr"
        onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        <rect x={0} y={0} width={W} height={H} rx={12} fill={COL.wall} />
        <rect x={0} y={H - 14} width={W} height={14} fill={COL.wallEdge} opacity={0.6} />
        {/* le verre : une vue par fenêtre */}
        {Array.from({ length: task.W * task.H }, (_, n) => {
          const cx = n % task.W; const cy = Math.floor(n / task.W);
          return <Outside key={n} n={n} uid={uid} x={gx0 + cx * unitW} y={gy0 + cy * unitH} w={unitW} h={unitH} />;
        })}
        {/* les deux ombres : deux couches translucides, le recouvrement est plus sombre */}
        <rect x={gx1 - cw} y={gy0} width={cw} height={gh} fill={COL.curtain} opacity={0.3} data-wb-shadow="curtain" aria-hidden="true" />
        <rect x={gx0} y={gy0} width={gw} height={bh} fill={COL.blind} opacity={0.3} data-wb-shadow="blind" aria-hidden="true" />
        {cw > 0 && Array.from({ length: Math.floor(cw / 14) }, (_, i) => <line key={`p${i}`} x1={gx1 - (i + 1) * 14 + 5} x2={gx1 - (i + 1) * 14 + 5} y1={gy0} y2={gy0 + gh} stroke={COL.curtain} strokeWidth={1} opacity={0.35} aria-hidden="true" />)}
        {bh > 0 && Array.from({ length: Math.floor(bh / 9) }, (_, i) => <line key={`s${i}`} x1={gx0} x2={gx1} y1={gy0 + (i + 1) * 9 - 3} y2={gy0 + (i + 1) * 9 - 3} stroke={COL.blind} strokeWidth={1} opacity={0.3} aria-hidden="true" />)}
        {showScreen && (
          <g aria-hidden="true" data-wb-screen>
            <rect x={gx1 - cw + 8} y={gy0 + 7} width={cw - 14} height={bh - 12} rx={3} fill="#FFFFFF" opacity={0.92} stroke="#475569" strokeWidth={1.2} />
            <path d={`M${gx1 - cw + 14} ${gy0 + bh - 14} l10 -12 l8 8 l8 -14 l12 18 Z`} fill="#94A3B8" opacity={0.7} />
          </g>
        )}
        {/* les guides : les petits carrés que les deux ombres ont découpés — SEULEMENT après les deux tirages */}
        {lines && (
          <g data-wb-lines>
            {Array.from({ length: task.rows }, (_, i) => Array.from({ length: task.cols }, (_2, j) => {
              const dark = j >= task.cols - w.ca && i < w.cc;
              return <rect key={`${i}-${j}`} x={gx0 + j * stepX} y={gy0 + i * stepY} width={stepX} height={stepY} fill={dark ? '#0F172A' : 'none'} fillOpacity={dark ? 0.16 : 0}
                stroke="#0F172A" strokeOpacity={0.4} strokeWidth={0.8} strokeDasharray="3 2" data-wb-pane={`${i}-${j}`} {...(dark ? { 'data-dark': 'true' } : {})} aria-hidden="true" />;
            }))}
          </g>
        )}
        {/* le cadre aux mailles de l'aluminium */}
        <rect x={gx0 - 3} y={gy0 - 3} width={gw + 6} height={gh + 6} fill="none" stroke={COL.frame} strokeWidth={6} rx={3} aria-hidden="true" />
        <rect x={gx0 - 6} y={gy0 - 6} width={gw + 12} height={gh + 12} fill="none" stroke={COL.frameEdge} strokeWidth={1.2} rx={4} aria-hidden="true" />
        {Array.from({ length: task.W - 1 }, (_, i) => <line key={`mv${i}`} x1={gx0 + (i + 1) * unitW} x2={gx0 + (i + 1) * unitW} y1={gy0} y2={gy0 + gh} stroke={COL.frame} strokeWidth={5} aria-hidden="true" />)}
        {Array.from({ length: task.H - 1 }, (_, i) => <line key={`mh${i}`} x1={gx0} x2={gx1} y1={gy0 + (i + 1) * unitH} y2={gy0 + (i + 1) * unitH} stroke={COL.frame} strokeWidth={5} aria-hidden="true" />)}
        {/* le rail et ses crans */}
        <Rail x0={gx0} x1={gx1} y={gy0 - 24} />
        {stopsC.map((i) => {
          const x = gx1 - i * stepX;
          const showLab = i > 0 && (stepX >= 30 || i % 2 === 0);
          return (
            <g key={i} aria-hidden="true">
              <circle cx={x} cy={gy0 - 24} r={i % task.b === 0 ? 4.4 : 3} fill={i === w.ca ? '#4F46E5' : COL.ring} stroke={COL.rail} strokeWidth={1.2} />
              {showLab && <text x={x} y={gy0 - 33} textAnchor="middle" fontSize={10.5} fontWeight={800} fill="#334155">{lab2(i, task.b)}</text>}
            </g>
          );
        })}
        {/* le cordon et ses crans */}
        <line x1={gx0 - 16} x2={gx0 - 16} y1={gy0} y2={gy0 + gh} stroke={COL.cord} strokeWidth={2.4} aria-hidden="true" />
        {stopsB.map((j) => {
          const y = gy0 + j * stepY;
          const showLab = j > 0 && (stepY >= 22 || j % 2 === 0);
          return (
            <g key={j} aria-hidden="true">
              <circle cx={gx0 - 16} cy={y} r={j % task.d === 0 ? 4.4 : 3} fill={j === w.cc ? '#B45309' : COL.ring} stroke={COL.cord} strokeWidth={1.2} />
              {showLab && <text x={gx0 - 24} y={y + 3} textAnchor="end" fontSize={10.5} fontWeight={800} fill="#334155">{lab2(j, task.d)}</text>}
            </g>
          );
        })}
        {/* le cadre en pointillé : l'AIRE écrite, posée sur le coin sombre réel */}
        {fl && (
          <g data-wb-frame data-model={fl.model} data-clipped={clipped ? 'true' : 'false'} className="wb-pop">
            <rect x={fx} y={gy0} width={fw} height={fh} fill="#FFF7ED" fillOpacity={0.18} stroke={COL.flag} strokeWidth={2.4} strokeDasharray="7 4" />
            <rect x={Math.max(4, fx + 4)} y={gy0 + 4} width={134} height={20} rx={10} fill="#FFF7ED" stroke={COL.flag} strokeWidth={1.2} strokeDasharray="4 3" />
            <text x={Math.max(4, fx + 4) + 67} y={gy0 + 18} textAnchor="middle" fontSize={10.5} fontWeight={900} fill="#9A3412">{k('w.flag', { w: iso(fl.text) })}</text>
          </g>
        )}
        {/* les deux poignées */}
        <g role="slider" tabIndex={locked ? -1 : 0} aria-label={k('curtainAria')} aria-valuemin={0} aria-valuemax={task.cols} aria-valuenow={w.ca} aria-valuetext={iso(lab2(w.ca, task.b))} aria-disabled={locked}
          data-wb-curtain data-stops={w.ca} data-locked={locked ? 'true' : 'false'} onKeyDown={keyC} onPointerDown={down('curtain')} className={ring}
          style={{ cursor: locked ? 'not-allowed' : 'grab', outline: 'none', touchAction: 'none' }}>
          <rect x={edgeX - 28} y={gy0 - 40} width={56} height={52} fill="transparent" />
          <line x1={edgeX} x2={edgeX} y1={gy0 - 24} y2={gy0 + gh} stroke={COL.curtain} strokeWidth={3} opacity={w.ca > 0 ? 0.8 : 0} />
          <Grip x={edgeX} y={gy0 - 12} dir="h" active={dragRef.current === 'curtain'} locked={locked} />
        </g>
        <g role="slider" tabIndex={locked ? -1 : 0} aria-label={k('blindAria')} aria-valuemin={0} aria-valuemax={task.rows} aria-valuenow={w.cc} aria-valuetext={iso(lab2(w.cc, task.d))} aria-disabled={locked}
          data-wb-blind data-stops={w.cc} data-locked={locked ? 'true' : 'false'} onKeyDown={keyB} onPointerDown={down('blind')} className={ring}
          style={{ cursor: locked ? 'not-allowed' : 'grab', outline: 'none', touchAction: 'none' }}>
          <rect x={gx0 + gw * 0.18 - 40} y={barY - 26} width={80} height={52} fill="transparent" />
          <rect x={gx0} y={barY - 3} width={gw} height={6} rx={3} fill={COL.blind} opacity={w.cc > 0 ? 0.9 : 0} />
          <Grip x={gx0 + gw * 0.18} y={barY} dir="v" active={dragRef.current === 'blind'} locked={locked} />
        </g>
        {locked && <g aria-hidden="true"><circle cx={gx1 - 8} cy={gy0 - 24} r={0} /></g>}
        <Student x={SIDE / 2 - 4} y={H - 8} girl={girl} mood={mood} />
      </svg>
    </div>
  );
}

/* ══════════════ Les commandes : deux tirages, « ماذا أُظلم؟ » ══════════════ */

function Controls({ lab, setLab, k }) {
  const task = L.taskOf(lab);
  const w = lab.w;
  const locked = L.pullLocked(lab);
  const btn = 'inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-2xl border-2 px-3 text-sm font-black';
  const readout = (n, d) => (n === 0 ? '0' : $(d === 1 ? String(n) : `\\tfrac{${n}}{${d}}`));
  const Group = ({ tint, label, value, onLess, onMore, lessOff, moreOff, attrs }) => (
    <div className="flex items-center gap-1.5" dir="ltr" data-wb-group={attrs}>
      <RoundButton onClick={onLess} disabled={locked || lessOff} aria-label={k(`${attrs}Less`)} size={44} {...{ [`data-wb-less-${attrs === 'curtain' ? 'c' : 'b'}`]: true }}><Minus className="h-5 w-5" strokeWidth={3} aria-hidden="true" /></RoundButton>
      <span className={`flex min-h-[44px] min-w-[5.6rem] items-center justify-center gap-1.5 rounded-xl border-2 px-2 text-center ${tint}`}>
        <span className="text-[11px] font-black leading-tight" dir="rtl">{label}</span>
        <span className="text-base font-black leading-none tabular-nums" data-wb-readout={attrs}><MathText>{value}</MathText></span>
      </span>
      <RoundButton primary onClick={onMore} disabled={locked || moreOff} aria-label={k(`${attrs}More`)} size={44} {...{ [`data-wb-more-${attrs === 'curtain' ? 'c' : 'b'}`]: true }}><Plus className="h-5 w-5" strokeWidth={3} aria-hidden="true" /></RoundButton>
    </div>
  );
  return (
    <LabCard className="p-2" data-wb-controls>
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5">
        <Group attrs="curtain" tint="border-indigo-200 bg-indigo-50 text-indigo-950" label={k('plan.curtainShort')} value={readout(w.ca, task.b)}
          onLess={() => setLab((s) => L.nudgeCurtain(s, -1))} onMore={() => setLab((s) => L.nudgeCurtain(s, 1))} lessOff={w.ca <= 0} moreOff={w.ca >= task.cols} />
        <Group attrs="blind" tint="border-amber-200 bg-amber-50 text-amber-950" label={k('plan.blindShort')} value={readout(w.cc, task.d)}
          onLess={() => setLab((s) => L.nudgeBlind(s, -1))} onMore={() => setLab((s) => L.nudgeBlind(s, 1))} lessOff={w.cc <= 0} moreOff={w.cc >= task.rows} />
        <button type="button" onClick={() => setLab(L.ask)} disabled={w.phase !== 'pull'} data-wb-ask
          className={`${btn} min-w-[8rem] flex-1 border-indigo-600 bg-indigo-600 text-base text-white shadow-[0_4px_0_0_#3730A3] transition-all duration-150 active:translate-y-0.5 disabled:opacity-50 motion-reduce:transition-none ${ring}`}>
          {w.phase === 'predict' ? <Lock className="h-4 w-4" aria-hidden="true" /> : <Blinds className="h-4 w-4" aria-hidden="true" />}{k('ask')}
        </button>
      </div>
    </LabCard>
  );
}

/* ══════════════ L'écriture : « ما الجزء المظلم مرّتين ؟ » ══════════════ */

function Writer({ lab, setLab, k }) {
  const phase = lab.w.phase;
  const active = phase === 'predict' || phase === 'write';
  const [val, setVal] = useState('');
  useEffect(() => { setVal(''); }, [lab.ti, lab.free]);
  const ok = lab.w.predicted || phase === 'done';
  if (!active && !ok) return null;
  return (
    <LabCard className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-amber-200 bg-amber-50/50 p-2" data-wb-write data-phase={phase}>
      <form className="flex min-w-[15rem] flex-1 items-center gap-2" onSubmit={(e) => { e.preventDefault(); if (active) setLab((s) => L.write(s, val)); }}>
        <label className="flex flex-1 flex-wrap items-center gap-2 text-sm font-black text-amber-950">
          <span className="min-w-[5.5rem] text-xs">{k('w.label')}</span>
          <input type="text" inputMode="text" autoComplete="off" dir="ltr" value={ok && !active ? '✓' : val} readOnly={!active} maxLength={8} placeholder={k('w.placeholder')} aria-label={k('w.aria')} data-wb-input
            onChange={(e) => setVal(e.target.value.replace(/[^0-9٠-٩/⁄]/g, ''))}
            className={`h-10 w-24 rounded-xl border-2 bg-white px-2 text-center text-lg font-black tabular-nums text-indigo-950 ${ok && !active ? 'border-emerald-500' : 'border-amber-300'} ${ring}`} />
        </label>
        <button type="submit" disabled={!active || !val} data-wb-check
          className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-2xl border-2 border-amber-600 bg-amber-500 px-4 text-sm font-black text-white disabled:opacity-40 ${ring}`}>
          {!active ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : null}{k('w.check')}
        </button>
      </form>
    </LabCard>
  );
}

/* ══════════════ « جرّب أعدادك » : toujours ouvert ══════════════ */

function FreeCard({ lab, setLab, k }) {
  const free = L.isFree(lab);
  const [v, setV] = useState({ a: '', b: '', c: '', d: '' });
  const [guess, setGuess] = useState('');
  useEffect(() => { if (!lab.free) { setV({ a: '', b: '', c: '', d: '' }); setGuess(''); } }, [lab.free]);
  const chk = L.freeCheck(v.a, v.b, v.c, v.d);
  const filled = v.a && v.b && v.c && v.d;
  const msg = filled && !chk.ok && chk.why !== 'incomplete' ? k(`free.${chk.why}`) : null;
  const clean = (s) => s.replace(/[^0-9٠-٩]/g, '').slice(0, 2);
  const setField = (f) => (e) => { const nv = { ...v, [f]: clean(e.target.value) }; setV(nv); if (L.freeCheck(nv.a, nv.b, nv.c, nv.d).ok) setLab((s) => L.freeTask(s, nv.a, nv.b, nv.c, nv.d)); };
  const inp = `h-11 w-16 rounded-xl border-2 border-amber-300 bg-white px-1 text-center text-xl font-black tabular-nums text-indigo-950 ${ring}`;
  return (
    <LabCard className="space-y-3 border-emerald-200 bg-emerald-50/50 p-3" data-wb-free data-active={free ? 'true' : 'false'}>
      <p className="flex items-center gap-1.5 text-sm font-black text-emerald-900"><FlaskConical className="h-4 w-4" aria-hidden="true" /> {k('free.title')}</p>
      <p className="text-xs font-bold leading-snug text-slate-600">{free ? k('free.on') : k('free.hint')}</p>
      <div className="flex flex-wrap items-center gap-2" dir="ltr">
        <span className="flex flex-col items-center gap-1">
          <input type="text" inputMode="numeric" autoComplete="off" value={v.a} aria-label={k('free.a')} data-wb-free-a onChange={setField('a')} className={inp} />
          <span className="h-0.5 w-12 bg-slate-500" aria-hidden="true" />
          <input type="text" inputMode="numeric" autoComplete="off" value={v.b} aria-label={k('free.b')} data-wb-free-b onChange={setField('b')} className={inp} />
        </span>
        <span className="text-2xl font-black text-sky-900" aria-hidden="true">×</span>
        <span className="flex flex-col items-center gap-1">
          <input type="text" inputMode="numeric" autoComplete="off" value={v.c} aria-label={k('free.c')} data-wb-free-c onChange={setField('c')} className={inp} />
          <span className="h-0.5 w-12 bg-slate-500" aria-hidden="true" />
          <input type="text" inputMode="numeric" autoComplete="off" value={v.d} aria-label={k('free.d')} data-wb-free-d onChange={setField('d')} className={inp} />
        </span>
        {free && (
          <>
            <label className="flex items-center gap-1.5 text-xs font-black text-amber-900" dir="rtl">{k('free.guess')}
              <input type="text" inputMode="text" dir="ltr" value={guess} maxLength={8} aria-label={k('free.guessAria')} data-wb-free-guess placeholder={k('w.placeholder')}
                onChange={(e) => { const g = e.target.value.replace(/[^0-9٠-٩/]/g, ''); setGuess(g); setLab((s) => L.freeFlag(s, g)); }} className={`${inp} w-28`} />
            </label>
            <button type="button" onClick={() => { setGuess(''); setLab(L.toGuided); }} data-wb-free-back
              className={`inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-emerald-200 bg-white px-3 text-xs font-bold text-emerald-900 ${ring}`} dir="rtl">
              <Undo2 className="h-4 w-4" aria-hidden="true" /> {k('free.back')}
            </button>
          </>
        )}
      </div>
      {msg && <p className="text-xs font-bold text-rose-700" data-wb-free-msg>{msg}</p>}
    </LabCard>
  );
}

/* ══════════════ La découverte et la règle ══════════════ */

/** Quelle règle la tâche de départ conduit à formuler : 'W' (w3 : 4/5 × 2/3) ou 'K' (la tâche de « معارف » : 3/4 × 2/5). */
const variantOf = (lab) => (lab.tasks[0].id === 'k1' ? 'K' : 'W');

export function ruleOptions(lab, k) {
  const v = variantOf(lab);
  return [
    { text: <MathText>{k('rule.right')}</MathText>, correct: true },
    { text: <MathText>{k('rule.sum')}</MathText>, why: <MathText>{k(`rule.whySum${v}`)}</MathText> },
    { text: <MathText>{k('rule.keepDen')}</MathText>, why: <MathText>{k(`rule.whyKeepDen${v}`)}</MathText> },
  ];
}

export function Formal({ lab, k }) {
  const v = variantOf(lab);
  const line = { W: '\\frac45\\times\\frac23=\\frac{4\\times2}{5\\times3}=\\frac8{15}', K: '\\frac34\\times\\frac25=\\frac{3\\times2}{4\\times5}=\\frac6{20}=\\frac3{10}' }[v];
  return (
    <div className="space-y-2 text-sm font-bold text-emerald-950" data-wb-formal>
      <p><MathText>{k(`formal.${v}`)}</MathText></p>
      <p className="text-center text-base" dir="ltr"><MathText>{$(line)}</MathText></p>
      <p><MathText>{k('formal.of')}</MathText></p>
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

export const CHAINS = Object.freeze({
  w1: ['panes', 'dark', 'half'],
  w2: ['den10', 'num3'],
  w3: ['rule'],
  a1: ['darkPanes'],
  a2: ['red15'],
  a3: ['whyBig'],
  a4: ['natural'],
  k1: ['kred', 'ruleK'],
});

const Mx = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const T = (s) => <MathText>{s}</MathText>;
const hints = (k, id) => [Mx(k, `${id}.hint1`), Mx(k, `${id}.hint2`)];
const choice = (k, id, opts, extra = {}) => ({ id, kind: 'choice', prompt: Mx(k, `${id}.prompt`), options: opts, hints: hints(k, id), explain: Mx(k, `${id}.explain`), ...extra });
const numberQ = (k, id, expected) => ({ id, kind: 'number', expected: String(expected), answer: T($(String(expected))), prompt: Mx(k, `${id}.prompt`), hints: hints(k, id), explain: Mx(k, `${id}.explain`) });
const opt = (k, id, name, correct) => (correct ? { text: T(k(`cp.${id}.${name}`)), correct: true } : { text: T(k(`cp.${id}.${name}`)), why: Mx(k, `${id}.why${name[0].toUpperCase()}${name.slice(1)}`) });

/** Chaque question vient des tâches jouées (les nombres sont ceux des tirages), jamais d'un texte libre. */
export const QUESTIONS = {
  panes: (lab, task, k) => numberQ(k, 'panes', task.total * task.W * task.H),
  dark: (lab, task, k) => numberQ(k, 'dark', task.dark),
  half: (lab, task, k) => choice(k, 'half', [opt(k, 'half', 'wrongA'), opt(k, 'half', 'right', true), opt(k, 'half', 'wrongB')]),
  den10: (lab, task, k) => choice(k, 'den10', [opt(k, 'den10', 'wrongSum'), opt(k, 'den10', 'right', true), opt(k, 'den10', 'wrongOne')]),
  num3: (lab, task, k) => choice(k, 'num3', [opt(k, 'num3', 'right', true), opt(k, 'num3', 'wrongSum'), opt(k, 'num3', 'wrongOne')]),
  rule: (lab, task, k) => ({ id: 'rule', kind: 'choice', prompt: Mx(k, 'rule.prompt'), options: ruleOptions(lab, k), hints: hints(k, 'rule'), explain: <Formal lab={lab} k={k} /> }),
  ruleK: (lab, task, k) => ({ id: 'ruleK', kind: 'choice', prompt: Mx(k, 'ruleK.prompt'), options: ruleOptions(lab, k), hints: hints(k, 'ruleK'), explain: <Formal lab={lab} k={k} /> }),
  darkPanes: (lab, task, k) => numberQ(k, 'darkPanes', task.dark),
  red15: (lab, task, k) => choice(k, 'red15', [opt(k, 'red15', 'wrongA'), opt(k, 'red15', 'right', true), opt(k, 'red15', 'wrongB')]),
  whyBig: (lab, task, k) => choice(k, 'whyBig', [opt(k, 'whyBig', 'wrongAlways'), opt(k, 'whyBig', 'right', true), opt(k, 'whyBig', 'wrongBig')]),
  natural: (lab, task, k) => choice(k, 'natural', [opt(k, 'natural', 'right', true), opt(k, 'natural', 'wrongBoth'), opt(k, 'natural', 'wrongOne')]),
  kred: (lab, task, k) => choice(k, 'kred', [opt(k, 'kred', 'wrongA'), opt(k, 'kred', 'wrongB'), opt(k, 'kred', 'right', true)]),
};
