import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Hand, CheckCircle2, Sparkles, ChevronLeft, FlaskConical, Undo2, Minus, Plus, ClipboardCheck } from 'lucide-react';
import { resolveLevelId } from '@smarter-academy/core/curriculum/manipulationLevels.js';
import * as G from '@smarter-academy/core/arithmetic/signedGauge.js';
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
import { W, H, GX, COL, yOf, gradAtY, Backdrop, Ruler, KnobShape, Reading, DistanceBracket, Observer, KidChip } from './frostGauge/art';
import { LEVELS } from '../levels';
import * as L from '../logic/frostGauge';

/**
 * frost-gauge — LE NIVEAU SOUS LA MAIN (1AM, unité 5, درس « الأعداد النسبية وسياقات استعمالها », 2026-10-30).
 * La logique, exacte, est dans `logic/frostGauge.js` (sur `packages/core/arithmetic/signedGauge.js`, importé par chemin).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. مبتدئ : la main fait MONTER ou DESCENDRE le liquide d'un thermomètre (puis le repère d'altitude, puis l'ombre dans un miroir) jusqu'à la lecture donnée en MOTS ; متقدم : deux lectures à la même distance du zéro, les étages, la distance à la mer.
 * B. Le nombre relatif est une SORTIE du niveau : la pastille lit « −3 » à la volée (un signe n'apparaît qu'une fois le niveau SOUS le 0) ; le signe et la distance au zéro sont deux lectures du même niveau.
 * C. La résistance : une lecture enregistrée fausse n'est jamais corrigée — elle est jugée (« la distance est juste, la jauge est de l'autre côté du zéro ») ; une seconde lecture identique à la première est refusée en mode paire.
 * D. La phase formelle écrit ce que l'élève a trouvé avec SES nombres (la dernière suite de questions, la règle).
 * E. Les fausses réponses sont rendues VISIBLES : la cote hachurée entre le zéro et le niveau, l'ombre du niveau de l'autre côté du zéro.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        le nombre relatif (positif / négatif), son signe distingué de sa distance au zéro, les nombres opposés
 *   OBJECT         un thermomètre de cour, un appareil d'altitude, la cabine d'un ascenseur, un miroir posé sur le zéro
 *   VARIABLE       le NIVEAU de la jauge (une graduation = un pas) : au-dessus ou au-dessous du zéro, plus ou moins loin
 *   INVARIANT      le zéro (le gel, le niveau de la mer, le rez-de-chaussée) ; la distance au zéro et le signe sont deux lectures
 *   TRANSFORMATION l'ombre (miroir) échange le côté du zéro en gardant la distance
 *   CONSTRAINT     le niveau reste dans la jauge ; une lecture est demandée en mots, la main la traduit en niveau
 *   RESISTANCE     « la distance est juste mais la jauge est de l'autre côté » ; la cote hachurée ; jamais la bonne graduation nommée
 *   EVIDENCE       la pastille « −3 », la cote de distance, l'ombre
 *   PREDICTION     la lecture est dite en mots avant que la main ne pose le niveau
 *   FORMALIZATION  « −3 est sous le zéro à 3 graduations » ; « 4 et −4 sont opposés »
 *   TRANSFER       « جرّب أعدادك » (toujours ouvert), les exercices et la banque
 *
 * ONBOARDING : `coach` (défaut true) → `LabCoach` ; `logic › coachOf`. QUESTIONS PENDANT LE LABO (`LabCheckpoint`) : `CHAINS` + `QUESTIONS`, après CHAQUE tâche, avec SES nombres.
 * ÉTAPES : `LabStepper` (`[data-fg-step=<i>]`) + la fête. « إعادة » : tâche 1.
 * Props : `tasks`, `level`, `levels`, `coach`, `title`, `lead`, `onTrial(event)`, `onFinished({})`.
 *
 * CONTRAT DOM : [data-frost-gauge][data-level][data-task][data-scene][data-solved], [data-fg-glance], [data-fg-stage], [data-fg-svg], [data-fg-knob][role=slider][data-grad], [data-fg-tick=<i>],
 * [data-fg-reading=<texte>], [data-fg-shadow], [data-fg-distance=<d>], [data-fg-read=<i>][data-state=done|current|todo], [data-fg-reads], [data-fg-less], [data-fg-more], [data-fg-record], [data-fg-verdict],
 * [data-fg-next], [data-fg-step=<i>], [data-fg-free], [data-fg-free-input], [data-fg-free-back], [data-fg-free-info], [data-fg-formal], [data-fg-kid][data-mood].
 */
const NS = 'manipulation.frostGauge';
const LRI = '⁦';
const PDI = '⁩';
const iso = (s) => `${LRI}${s}${PDI}`;
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-sky-300';
/** Le nombre relatif dans une phrase arabe : une formule KaTeX (« $-3$ » : le signe moins reste à GAUCHE des chiffres en RTL), jamais de + (un positif n'a pas de signe). */
const sg = (v) => `$${v}$`;

const CSS = `
@keyframes fg-pop { 0% { transform: scale(0.85); } 70% { transform: scale(1.06); } 100% { transform: scale(1); } }
.fg-pop { animation: fg-pop 240ms ease-out both; display: inline-block; }
@media (prefers-reduced-motion: reduce) { .fg-pop { animation: none !important; } }
.fg-knob:focus-visible { outline: 3px solid #38BDF8; outline-offset: 4px; border-radius: 8px; }
`;

export function numbersFor({ tasks, level }) {
  const lv = resolveLevelId(level ?? 'beginner');
  const asked = LEVELS['frost-gauge'][lv].numbers;
  return { tasks: tasks ?? asked.tasks };
}

export default function FrostGauge({
  tasks, title, lead, level, levels: withLevels = true, coach: coachOn = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const initialNumbers = useMemo(() => numbersFor({ tasks, level }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'frost-gauge', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
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
  const cpSettings = useLabCheckpointSettings('frost-gauge');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
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
    lab: 'frost-gauge', step: coachStep,
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
      type="frost-gauge"
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
        <div ref={boxRef} className="space-y-2" data-frost-gauge data-level={advanced ? 'advanced' : 'beginner'} data-task={lab.free ? 'free' : cur.id} data-scene={lab.free ? 'frost' : cur.scene}
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
const unitOf = (k, scene) => (scene === 'floors' ? '' : k(`unit.${scene}`)); // « unit.floors » serait une chaîne vide : i18next rendrait la clé
/** « 5 درجات » / « 40 م » : la grandeur d'une distance dans le monde du décor. */
const amount = (k, scene, n) => (scene === 'altitude' ? k('metre', { v: iso(n) }) : scene === 'floors' ? k('floorsN', { count: n }) : k('deg', { count: n }));

/** La lecture demandée, DITE EN MOTS (jamais la graduation). */
export function askText(k, task, read) {
  const { scene } = task;
  if (read.want === 'mirror') return k('ask.mirror', { v: sg(read.v) });
  if (read.want === 'distance') return k(`ask.dist.${scene}`, { n: amount(k, scene, read.v) });
  const v = read.v;
  if (v === 0) return k(`ask.${scene}.zero`);
  const side = v > 0 ? 'above' : 'below';
  if (scene === 'floors') return k(`ask.floors.${side}`, { ord: k(`ord.${Math.abs(v)}`) });
  return k(`ask.${scene}.${side}`, { n: amount(k, scene, Math.abs(v)) });
}
const nameOf = (k, task, i) => k(`name.${task.id}.${i}`, { defaultValue: k('name.default', { n: i + 1 }) });
/** Ce que la pastille de lecture écrit : la valeur relative (signe seulement sous le zéro) et l'unité du monde. */
const readingText = (k, scene, v) => `${v < 0 ? '−' : ''}${Math.abs(v)}${unitOf(k, scene)}`;

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
  const steps = lab.tasks.length > 1 && !free && <LabStepper count={lab.tasks.length} current={lab.ti} done={stepDone} stepAttr="data-fg-step" />;
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.trials.length === 0 && celebrated.current.size) celebrated.current = new Set();
  const nowDone = !free && stepDone[lab.ti];
  useEffect(() => {
    if (!nowDone || celebrated.current.has(lab.ti)) return;
    celebrated.current.add(lab.ti);
    party.celebrate({ n: lab.ti + 1, total: lab.tasks.length });
  }, [nowDone, lab.ti]); // eslint-disable-line react-hooks/exhaustive-deps

  // le son (muet sauf « الصوت ») : un déclic à chaque graduation franchie, un petit drapeau quand une lecture est juste, « over » sur un refus, la cloche à la fin d'une tâche
  const sfx = useRef(lab.grad);
  useEffect(() => {
    if (lab.grad !== sfx.current) playSfx('gesture', { pitch: lab.grad > sfx.current ? 1 : 0.75 });
    sfx.current = lab.grad;
  }, [lab.grad]);
  const nTrials = lab.trials.length;
  useEffect(() => {
    if (!nTrials) return;
    const tr = lab.trials[nTrials - 1];
    playSfx(tr.ok ? 'flag' : 'over');
  }, [nTrials]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (done && !free) playSfx('bell'); }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  const prompt = (
    <PromptCard size="md" aside={steps || null} context={<MathText>{ctx}</MathText>} contextProps={{ 'data-fg-context': free ? 'free' : task.id }}
      title={<MathText>{question}</MathText>} titleClassName="text-base" lamp={free ? null : lit ? 'on' : 'off'}
      titleProps={{ 'data-fg-prompt': free ? 'free' : task.id, 'data-lit': lit ? 'true' : 'false' }} />
  );

  /* ── le verdict : la CONSÉQUENCE avec les nombres de l'élève, jamais la bonne graduation ── */
  const level = L.levelValue(lab);
  const verdictLine = (() => {
    if (free) return k(last?.kind === 'custom' ? 'free.on' : 'idle.open');
    if (!last) return k(`idle.${done ? 'done' : kind}`);
    if (last.ok) return kind === 'mirror' ? k('v.rightMirror', { value: sg(last.value), shadow: sg(G.opposite(last.value)) }) : k('v.right', { value: sg(last.value) });
    const read = task.reads[last.ri];
    return k(`v.${last.model}`, { value: sg(last.value), shadow: sg(G.opposite(last.value)), d: amount(k, task.scene, Math.abs(last.value)), want: read ? askText(k, task, read) : '' });
  })();
  const bad = !free && !!last && last.ok === false;
  const good = !free && !!last && last.ok === true;
  const tone = bad ? 'amber' : good ? 'emerald' : 'indigo';
  const Icon = bad ? Sparkles : good ? CheckCircle2 : Hand;
  const canNext = L.canNext(lab) && !cp.blocking;
  const mood = bad ? 'wonder' : done ? 'proud' : 'happy';
  const banner = (
    <VerdictBanner tone={tone} icon={Icon} size="sm" className="min-h-[3.2rem]" data-fg-verdict={bad ? 'wrong' : good ? 'right' : free ? 'free' : ''}>
      <div className="flex min-w-0 items-center gap-2">
        <span data-fg-kidchip className="shrink-0"><KidChip idx={advanced ? 1 : 0} mood={mood} /></span>
        <div className="min-w-0 space-y-1.5">
          <p className={last || free ? '' : 'font-bold text-indigo-900'}><MathText>{verdictLine}</MathText></p>
          {canNext && (
            <button type="button" onClick={() => setLab(L.nextTask)} data-fg-next
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
      <div className="relative space-y-2" data-fg-glance>
        {party.node}
        {cp.node}
        {prompt}
        <StageFrame className="min-w-0 overflow-hidden p-2" data-fg-stage>
          <Stage lab={lab} setLab={setLab} k={k} svgRef={svgRef} mood={mood} level={level} />
        </StageFrame>
        {!free ? <Controls lab={lab} setLab={setLab} k={k} /> : null}
        {banner}
      </div>
      <FreeCard lab={lab} setLab={setLab} k={k} />
    </>
  );
}

/* ══════════════ La scène : la jauge, son niveau, son ombre ══════════════ */

/** Les coordonnées SVG d'un évènement pointeur. */
function svgY(svg, e) {
  const r = svg?.getBoundingClientRect();
  if (!r || !r.height) return null;
  return ((e.clientY - r.top) * H) / r.height;
}

function Stage({ lab, setLab, k, svgRef, mood, level }) {
  const uid = `fg${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const free = L.isFree(lab);
  const task = L.taskOf(lab);
  const g = L.gaugeOf(lab);
  const sceneId = free ? 'frost' : task.scene;
  const [drag, setDrag] = useState(false);
  const locked = !free && L.taskDone(lab);
  const y = yOf(g, free ? level : lab.grad);
  const lvl = free ? level : lab.grad;
  const shadow = L.showsShadow(lab);
  const dist = L.showsDistance(lab);
  const value = G.valueOf(g, lvl);
  const readTxt = readingText(k, sceneId, free ? level : value);
  const tone = (free ? level : value) > 0 ? 'above' : (free ? level : value) < 0 ? 'below' : 'zero';
  const live = !free && !locked;

  const down = (e) => {
    if (!live) return;
    const py = svgY(svgRef.current, e); if (py === null) return;
    e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag(true);
    setLab((s) => L.setGrad(s, gradAtY(g, py)));
  };
  const move = (e) => { if (!drag) return; const py = svgY(svgRef.current, e); if (py !== null) setLab((s) => L.setGrad(s, gradAtY(g, py))); };
  const up = () => setDrag(false);
  const key = (e) => {
    if (!live) return;
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { e.preventDefault(); setLab((s) => L.gradBy(s, 1)); }
    else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { e.preventDefault(); setLab((s) => L.gradBy(s, -1)); }
    else if (e.key === 'PageUp') { e.preventDefault(); setLab((s) => L.gradBy(s, 3)); }
    else if (e.key === 'PageDown') { e.preventDefault(); setLab((s) => L.gradBy(s, -3)); }
    else if (e.key === 'Home') { e.preventDefault(); setLab((s) => L.setGrad(s, g.gmax)); }
    else if (e.key === 'End') { e.preventDefault(); setLab((s) => L.setGrad(s, g.gmin)); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLab(L.record); }
  };

  const yShadow = yOf(g, -lvl);
  const shadowVal = G.valueOf(g, -lvl);
  const shadowTone = shadowVal > 0 ? 'above' : shadowVal < 0 ? 'below' : 'zero';
  const infoDist = Math.abs(value);

  return (
    <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: W, display: 'block', margin: '0 auto', touchAction: 'none' }} role="img" aria-label={k('stageAria')} data-fg-svg dir="ltr"
      onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
      <Backdrop uid={uid} scene={sceneId} g={g} />
      <Ruler scene={sceneId} g={g} level={lvl} />
      {/* le zéro : seul numéro écrit sur l'échelle */}
      <g data-fg-zero aria-hidden="true">
        <text x={GX + 42} y={yOf(g, 0) + 8} fontSize={26} fontWeight={900} fill={COL.ink} direction="ltr" style={{ unicodeBidi: 'isolate' }}>0</text>
        {sceneId !== 'floors' && <text x={GX - 150} y={yOf(g, 0) - 8} fontSize={18} fontWeight={800} fill={COL.zero}>{k('zeroLine')}</text>}
      </g>
      {/* la cote de distance au zéro : étiquetée seulement quand on parle de distance (ombre, paire) et après un enregistrement en mode simple */}
      {(dist || (!free && lab.last?.kind === 'record')) && <DistanceBracket g={g} level={lvl} label={dist ? infoDist : null} />}
      {shadow && (
        <g data-fg-shadow={shadowVal} aria-label={k('shadowAria')}>
          <line x1={GX - 120} x2={GX + 120} y1={yOf(g, 0)} y2={yOf(g, 0)} stroke={COL.mirror} strokeWidth={3} strokeDasharray="10 6" />
          <text x={GX - 124} y={yOf(g, 0) + 22} textAnchor="end" fontSize={18} fontWeight={800} fill={COL.mirror}>{k('mirrorLine')}</text>
          <circle cx={GX} cy={yShadow} r={13} fill="none" stroke={COL.mirror} strokeWidth={3} strokeDasharray="5 4" />
          <line x1={GX} x2={GX} y1={yOf(g, 0)} y2={yShadow} stroke={COL.mirror} strokeWidth={2} strokeDasharray="3 5" />
          <Reading x={GX - 56} y={yShadow} text={readingText(k, sceneId, shadowVal)} tone={shadowTone} anchor="end" />
        </g>
      )}
      <Observer idx={0} mood={mood} x={sceneId === 'floors' ? 430 : sceneId === 'altitude' ? 548 : 78} y={sceneId === 'floors' ? yOf(g, 0) - 96 : sceneId === 'altitude' ? yOf(g, 0) - 100 : 160} size={78} />
      {/* ce que la main tient : tout le gabarit est sensible (un seul glisser) */}
      <rect x={GX - 110} y={0} width={230} height={H} fill="transparent" onPointerDown={down} style={{ cursor: live ? 'ns-resize' : 'default' }} data-fg-hit />
      <g data-fg-knob data-grad={lvl} role="slider" tabIndex={live ? 0 : -1} aria-label={k('knobAria')} aria-valuemin={g.gmin} aria-valuemax={g.gmax} aria-valuenow={lvl} aria-valuetext={k('knobValue', { v: readTxt })}
        onKeyDown={key} onPointerDown={down} style={{ cursor: live ? 'ns-resize' : 'default' }} className="fg-knob">
        <KnobShape scene={sceneId} y={y} active={drag} />
      </g>
      <Reading x={GX + 66} y={y} text={readTxt} tone={tone} anchor="start" />
    </svg>
  );
}

/* ══════════════ Les commandes : le carnet de lectures, − / + et « سجّل » ══════════════ */

function Controls({ lab, setLab, k }) {
  const task = L.taskOf(lab);
  const done = L.taskDone(lab);
  const btn = `inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-2xl border-2 px-3 text-sm font-black disabled:opacity-40 ${ring}`;
  return (
    <LabCard className="space-y-2 p-2" data-fg-controls>
      <p data-fg-ask className={`rounded-xl border-2 px-3 py-2 text-base font-black leading-snug ${done ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-sky-500 bg-sky-50 text-sky-950'}`}>
        {done ? k('idle.done') : <><b className="font-black">{nameOf(k, task, lab.ri)}</b> — <MathText>{askText(k, task, task.reads[lab.ri])}</MathText></>}
      </p>
      <ol className="flex flex-wrap gap-1.5" data-fg-reads aria-label={k('readsAria')}>
        {task.reads.map((r, i) => {
          const entry = lab.log.find((x) => x.ri === i);
          const state = entry ? 'done' : i === lab.ri && !done ? 'current' : 'todo';
          return (
            <li key={i} data-fg-read={i} data-state={state}
              className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-full border-2 px-3 py-1 text-sm ${state === 'done' ? 'border-emerald-300 bg-emerald-50 font-bold text-emerald-900' : state === 'current' ? 'border-sky-500 bg-sky-50 font-black text-sky-950 ring-2 ring-sky-200' : 'border-slate-200 bg-white text-slate-500'}`}>
              <span>{nameOf(k, task, i)}</span>
              {entry && <span className="inline-flex shrink-0 items-center rounded-full bg-emerald-600 px-2 py-0.5 text-sm font-black text-white fg-pop" dir="ltr"><bdi>{readingText(k, task.scene, entry.value)}</bdi></span>}
            </li>
          );
        })}
      </ol>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setLab((s) => L.gradBy(s, -1))} disabled={done} data-fg-less aria-label={k('less')} className={`${btn} min-w-[44px] border-sky-300 bg-white text-sky-900`}><Minus className="h-4 w-4" aria-hidden="true" /></button>
        <button type="button" onClick={() => setLab((s) => L.gradBy(s, 1))} disabled={done} data-fg-more aria-label={k('more')} className={`${btn} min-w-[44px] border-sky-300 bg-white text-sky-900`}><Plus className="h-4 w-4" aria-hidden="true" /></button>
        <button type="button" onClick={() => setLab(L.record)} disabled={done} data-fg-record className={`${btn} border-sky-600 bg-sky-600 text-white shadow-[0_3px_0_0_#0369A1]`}>
          <ClipboardCheck className="h-4 w-4" aria-hidden="true" /> {k('record')}
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
    const raw = e.target.value.replace(/[^0-9٠-٩+\-−\s]/g, '').slice(0, 4);
    setText(raw);
    if (L.parseFree(raw) !== null) setLab((s) => L.setFree(s, raw));
  };
  return (
    <LabCard className="space-y-2 border-emerald-200 bg-emerald-50/50 p-3" data-fg-free data-active={free ? 'true' : 'false'}>
      <p className="flex items-center gap-1.5 text-sm font-black text-emerald-900"><FlaskConical className="h-4 w-4" aria-hidden="true" /> {k('free.title')}</p>
      <p className="text-xs font-bold leading-snug text-slate-600">{free ? k('free.on') : k('free.hint')}</p>
      <div className="flex flex-wrap items-center gap-3">
        <input type="text" inputMode="numeric" autoComplete="off" dir="ltr" value={text} onChange={onText} aria-label={k('free.aria')} aria-invalid={bad} data-fg-free-input placeholder="−3 ; 4"
          className={`h-11 w-36 rounded-xl border-2 ${bad ? 'border-rose-300' : 'border-emerald-300'} bg-white px-3 text-center text-lg font-black tabular-nums text-indigo-950 ${ring}`} />
        {bad && <span className="text-xs font-bold text-rose-700">{k('free.bad')}</span>}
        {free && info && (
          <span className="text-xs font-black text-emerald-900" data-fg-free-info>
            <MathText>{k('free.info', { v: sg(info.v), side: k(`free.side.${info.side}`), d: sg(info.distance), o: sg(info.opposite) })}</MathText>
          </span>
        )}
        {free && (
          <button type="button" onClick={() => setLab(L.toGuided)} data-fg-free-back
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

/** Ce que l'élève a trouvé, écrit avec SES nombres : la première lecture de l'ombre (مبتدئ) ou la paire à même distance (متقدم). */
export function Formal({ lab, k, advanced }) {
  const pair = lab.tasks.find((tk) => tk.kind === 'pair');
  const mirror = lab.tasks.find((tk) => tk.kind === 'mirror');
  const tex = (v) => (v < 0 ? `-${Math.abs(v)}` : String(v));
  if (advanced) {
    const d = pair ? pair.reads[0].v : 6;
    return (
      <div className="space-y-2 text-sm font-bold text-emerald-950" data-fg-formal="both">
        <p className="text-center text-base" dir="ltr"><MathText>{$(`${tex(d)}\\ ;\\ ${tex(-d)}`)}</MathText></p>
        <p><MathText>{k('formal.both')}</MathText></p>
      </div>
    );
  }
  const first = mirror ? mirror.reads.find((r) => r.want === 'value' && r.v !== 0)?.v ?? -4 : -4;
  return (
    <div className="space-y-2 text-sm font-bold text-emerald-950" data-fg-formal="rule">
      <p className="text-center text-base" dir="ltr"><MathText>{$(`${tex(first)}\\ ;\\ ${tex(-first)}`)}</MathText></p>
      <p><MathText>{k('formal.rule')}</MathText></p>
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite d'une tâche (par son id : les tâches viennent de la leçon). La dernière tâche de chaque niveau finit par LA RÈGLE. */
export const CHAINS = Object.freeze({
  b1: ['sign', 'coldest', 'dist'],
  b2: ['meaning', 'lower'],
  b3: ['opp', 'zeroOpp', 'ruleA'],
  a1: ['bothSides'],
  a2: ['floorsGap'],
  a3: ['farther', 'ruleB'],
});

/** Une question à trois options décrite par ses clés de chaîne `cp.<id>.*` ; `vars` sont les nombres de l'élève. */
const choice = (k, id, vars, at, extra = {}) => ({
  id, kind: 'choice', prompt: Mx(k, `${id}.prompt`, vars),
  options: opt([Mx(k, `${id}.right`, vars), Mx(k, `${id}.wrongA`, vars), Mx(k, `${id}.wrongB`, vars)], 0, [null, Mx(k, `${id}.whyA`, vars), Mx(k, `${id}.whyB`, vars)], at),
  hints: [Mx(k, `${id}.hint1`, vars), Mx(k, `${id}.hint2`, vars)], explain: Mx(k, `${id}.explain`, vars), ...extra,
});

/** Les nombres de l'élève : les valeurs de la tâche (ombre comprise) et leurs noms. */
function varsOf(task, k) {
  const vals = task.reads.map((r) => r.v);
  const nm = (i) => nameOf(k, task, i);
  const lowI = vals.indexOf(Math.min(...vals));
  const hiI = vals.indexOf(Math.max(...vals));
  const zeroI = Math.max(0, vals.indexOf(0));
  const far = vals.reduce((best, v, i) => (Math.abs(v) > Math.abs(vals[best]) ? i : best), 0);
  const near = far === 0 ? vals.length - 1 : 0;
  const cold = vals[lowI];
  const dCold = Math.abs(cold);
  const first = vals[0];
  const side = first < 0 ? -1 : 1;
  const dW = k('degWord');
  const fW = k('floorWord');
  const d0 = Math.abs(task.reads[0].v);
  return {
    // b1 : le plus froid, le plus « grand », le zéro
    cold: nm(lowI), coldV: sg(cold), big: nm(hiI), bigV: sg(vals[hiI]), zero: nm(zeroI), zeroV: '0',
    deg: k('deg', { count: dCold }), negdeg: `$-${dCold}$ ${dW}`, otherdeg: k('deg', { count: Math.abs(vals[hiI]) }),
    // b2 : le plus bas et le plus haut
    lowName: nm(lowI), lowV: sg(cold), highName: nm(hiI), highV: sg(vals[hiI]), d: iso(dCold),
    // b3 : l'opposé de la première valeur posée
    a: sg(first), b: sg(-first), c: sg(first + side),
    // a1 : une paire à distance d0
    p: sg(d0), m: sg(-d0),
    // a2 : les étages
    f: sg(first), fl: k('floorsN', { count: Math.abs(first) }), negfl: `$-${Math.abs(first)}$ ${fW}`, nextfl: k('floorsN', { count: Math.abs(first) + 1 }),
    // a3 : le plus éloigné de la mer
    n1: nm(far), v1: sg(vals[far]), d1: iso(Math.abs(vals[far])), n2: nm(near), v2: sg(vals[near]), d2: iso(Math.abs(vals[near])),
    // a1 : « {{deg}} » est la distance de la paire
    ...(task.kind === 'pair' ? { deg: k('deg', { count: d0 }) } : {}),
  };
}
const at = { sign: 1, coldest: 2, dist: 0, meaning: 2, lower: 1, opp: 0, zeroOpp: 2, bothSides: 1, floorsGap: 0, farther: 2 };

export const QUESTIONS = {
  sign: (lab, task, k) => choice(k, 'sign', varsOf(task, k), at.sign),
  coldest: (lab, task, k) => choice(k, 'coldest', varsOf(task, k), at.coldest),
  dist: (lab, task, k) => choice(k, 'dist', varsOf(task, k), at.dist),
  meaning: (lab, task, k) => choice(k, 'meaning', varsOf(task, k), at.meaning),
  lower: (lab, task, k) => choice(k, 'lower', varsOf(task, k), at.lower),
  opp: (lab, task, k) => choice(k, 'opp', varsOf(task, k), at.opp),
  zeroOpp: (lab, task, k) => choice(k, 'zeroOpp', varsOf(task, k), at.zeroOpp),
  bothSides: (lab, task, k) => choice(k, 'bothSides', varsOf(task, k), at.bothSides),
  floorsGap: (lab, task, k) => choice(k, 'floorsGap', varsOf(task, k), at.floorsGap),
  farther: (lab, task, k) => choice(k, 'farther', varsOf(task, k), at.farther),
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
