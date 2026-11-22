import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Droplets, ChevronLeft, Hand, CheckCircle2, Waves, FlaskConical, Undo2, Calculator, Sparkles } from 'lucide-react';
import { resolveLevelId } from '@smarter-academy/core/curriculum/manipulationLevels.js';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import { LabCard, PromptCard, StepperCard, VerdictBanner, RoundButton } from '../primitives/LabKit';
import { SvgPill, pillWidth } from '../primitives/SvgPill';
import KidFigure from '../primitives/KidFigure';
import LabFold from '../primitives/LabFold';
import { useLabCoach } from '../primitives/LabCoach';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import MathText from '../../components/MathText';
import { $, Mx, spreadAll } from './thalesCp';
import { LEVELS } from '../levels';
import * as PY2 from '@smarter-academy/core/arithmetic/pythagoras.js';
import * as L from '../logic/pythagorasTanks';

/**
 * pythagoras-tanks — LES BASSINS CARRÉS SOUS LA MAIN (3AM, unité 11, درس « خاصية فيثاغورس »). Logique : `logic/pythagorasTanks.js`
 * (+ `core/arithmetic/pythagoras.js`, importé par chemin).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. Un stand de معرض العلوم : une machine à trois bassins carrés minces (même épaisseur : l'eau se mesure en AIRE) construits sur les
 *    côtés d'un triangle ABC articulé en A. La main tient la poignée C : elle règle l'ANGLE en A (مبتدئ) ou la LONGUEUR BC sur un ruban au
 *    dixième (متقدم) — glisser, −/+, ou les flèches du clavier sur la poignée (role="slider").
 * B. « اسكب » : les deux petits bassins se vident (surface horizontale qui descend), le grand se remplit ; on LIT le résultat : plein juste,
 *    débordement (une flaque chiffrée sur la table) ou un vide (un coin vide en pointillés, chiffré).
 * C. Les mathématiques résistent : à tout angle aigu l'eau déborde, à tout angle obtus un vide reste ; avec 2 et 3 AUCUN dixième du ruban ne
 *    remplit (3,6 déborde, 3,7 laisse un vide) — la touche √ (seulement la touche : la racine est construite en 4AM, unité « الحساب على الجذور ») règle
 *    le ruban sur √13 exact. Chaque versement est un essai : MANUEL (pas de « جرّب كل الإمكانيات »).
 * D. La phase formelle écrit BC² = AB² + AC² avec SES nombres (25 = 16 + 9 ; 169 = 144 + 25 ; √13) et la contraposée avec SON essai raté.
 * E. Les fausses conjectures sont réfutées avec SES versements (« quelle que soit la zone » ← son débordement ; « BC = AB + AC » ← 13 ≠ 17).
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        dans un triangle rectangle BC² = AB² + AC² — et seulement s'il est rectangle (contraposée : ≠ ⇒ non rectangle)
 *   OBJECT         trois bassins carrés sur les côtés ; l'eau des deux petits (b² + c²) ; la contenance du grand (BC²)
 *   VARIABLE       l'angle en A (entier, 25°…155°) ; la longueur BC (dixièmes) ; la touche √ (longueur exacte)
 *   INVARIANT      l'eau : b² + c² (9 + 16 = 25 ; 25 + 144 = 169 ; 4 + 9 = 13) quelle que soit la position
 *   TRANSFORMATION la contenance du grand bassin suit le geste ; le versement la compare à l'eau
 *   CONSTRAINT     un triangle (angle 25°…155°, ruban borné) ; un versement par position (on bouge pour remplir à nouveau)
 *   RESISTANCE     débordement (aigu / BC trop court) · vide (obtus / BC trop long) · aucun dixième pour √13
 *   EVIDENCE       la flaque et le vide chiffrés en cm², le marqueur d'angle droit en A au plein juste, le carnet des versements
 *   CONTRAST       fill (90°) + compare (un angle plus petit ET un plus grand) ; 13 puis √13
 *   PREDICTION     au متقدم la main doit PRÉVOIR la longueur (le ruban ne montre pas l'angle)
 *   DISCOVERY      « متى يملأ ماء الحوضين الصغيرين الحوض الكبير تمامًا؟ » / « كيف نعرف طول BC الذي يملؤه؟ »
 *   FORMALIZATION  BC² = AB² + AC² ; الوتر ; la contraposée ; BC = √(AB² + AC²) et la touche √
 *   TRANSFER       معارف, طريقة (calculer un côté, prouver « غير قائم »), أتمرّن, مسائل, 4AM (racines, trigonométrie, distance, sections)
 *
 * « جرّب أعدادك أنت » : TOUJOURS ouvert sous le labo (côtés entiers 1…12) ; ses essais portent `free: true` et ne comptent jamais.
 *
 * D'UN SEUL REGARD (§8bis) : `[data-pt-glance]` enveloppe la consigne, la scène, la commande, le bouton « اسكب » et le verdict ; l'échelle
 * de la scène est fixée sur TOUTE la course de la machine (`sweepBox`) — rien ne bouge sous le doigt ; la hauteur est budgétée depuis
 * `useLessonViewport`. Tablette et ordinateur seulement (≥ 768 px).
 *
 * ONBOARDING : `logic/pythagorasTanks.js › coachOf` (turn · pour · again · next · turn2 · pour2 | stretch · root · pourRoot).
 * QUESTIONS PENDANT LE LABO (rollout lot 6, 2026-10-28) : `checkpoints` (défaut true). Après chaque tâche (fill · compare | thirteen · surd), une suite de questions se
 * pose PAR-DESSUS le labo (`CHAINS`) et retient « المهمّة التالية » : fill l'eau · l'angle du plein · ce qui bouge ; compare le fil · le vide · LA RÈGLE (l'ancienne découverte) ;
 * thirteen l'eau · comment prévoir 13 ; surd l'eau · pourquoi le ruban ne suffit pas · LA RÈGLE. Les événements `{ tk: 'checkpoint' | 'checkpoint-done', id, … }` partent
 * vers `onTrial`. OBLIGATOIRES pour l'élève ; l'ENSEIGNANT seul peut les couper pour SON compte (interrupteur de l'en-tête) : la découverte d'avant reprend alors.
 * ÉTAPES `LabStepper` (`data-pt-step`), fête à chaque tâche finie, sons (`tooth` au geste, `flag` plein juste, `over` débordement ou vide, `bell` la touche √).
 *
 * Props : `mode` ('angle' | 'length'), `b`, `c` (côtés de la première machine), `level`, `levels`, `coach`, `title`, `lead`,
 * `onTrial(événement)`, `onFinished({ mode })` — tous par `state.report`.
 *
 * CONTRAT DOM : [data-pythagoras-tanks][data-mode][data-task][data-free][data-solved], [data-pt-glance], [data-pt-scene],
 * [data-pt-handle] (role=slider), [data-pt-tank=ab|ac|bc], [data-pt-water=ab|ac|bc], [data-pt-spill], [data-pt-gap], [data-pt-right],
 * [data-pt-readout], [data-pt-step-less|more], [data-pt-pour], [data-pt-root], [data-pt-screen], [data-pt-verdict=exact|over|gap],
 * [data-pt-next], [data-pt-trials] [data-pt-trial], [data-pt-free][data-active], [data-pt-free-field=b|c], [data-pt-free-apply],
 * [data-pt-free-back], [data-pt-formal], [data-pt-kid][data-mood].
 */
const NS = 'manipulation.pythagorasTanks';
const LRI = '⁦';
const PDI = '⁩';
const iso = (s) => `${LRI}${s}${PDI}`;
const MAX_W = 1080;
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-sky-300';
const POUR_MS = 1500;
const MOTION_CSS = '@keyframes pt-wobble{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}60%{transform:translateX(4px)}}'
  + '@keyframes pt-drip{0%{transform:translateY(0);opacity:1}100%{transform:translateY(26px);opacity:0}}'
  + '@keyframes pt-pulse{0%,100%{opacity:.55}50%{opacity:1}}'
  + '.pt-drip{animation:pt-drip .7s ease-in infinite}.pt-pulse{animation:pt-pulse 1.4s ease-in-out infinite}.pt-wobble{animation:pt-wobble .4s ease-in-out}'
  + '@media (prefers-reduced-motion:reduce){.pt-drip,.pt-pulse,.pt-wobble{animation:none}}';

export function numbersFor({ mode, b, c, level }) {
  const preset = LEVELS['pythagoras-tanks'][resolveLevelId(level ?? 'beginner')].numbers;
  const m = mode ?? preset.mode;
  if (b != null && c != null) return { mode: m, b, c };
  return m === preset.mode ? preset : LEVELS['pythagoras-tanks'][m === 'length' ? 'advanced' : 'beginner'].numbers;
}

const useReduced = () => {
  const [r, setR] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    setR(m.matches);
    const f = () => setR(m.matches);
    m.addEventListener?.('change', f);
    return () => m.removeEventListener?.('change', f);
  }, []);
  return r;
};

export default function PythagorasTanks({
  mode, b, c, title, lead, level, levels: withLevels = true, coach: coachOn = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const initialNumbers = useMemo(() => numbersFor({ mode, b, c, level }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'pythagoras-tanks', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nums = state.numbers;
  const numsKey = JSON.stringify(nums);
  const [lab, setLab] = useState(() => L.init(nums));
  const [scene, setScene] = useState({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: 0 });
  if (scene.key !== numsKey || scene.epoch !== state.epoch || scene.rc !== state.resetCount) {
    // « إعادة » (resetCount), un autre niveau ou d'autres nombres : TOUT recommence — la tâche 1, les versements et les questions du labo
    setScene({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: scene.inits + 1 });
    setLab(L.init(nums));
  }
  // le versement est TERMINÉ quand l'animation a fini : les questions et la fête attendent (la carte ne couvre pas l'eau qui coule)
  const reduceMotion = useReduced();
  const pourKey = lab.pour ? lab.trials.length : 0;
  const [seen, setSeen] = useState(0);
  useEffect(() => {
    if (!pourKey) { setSeen(0); return undefined; }
    const id = setTimeout(() => setSeen(pourKey), reduceMotion ? 0 : POUR_MS + 150);
    return () => clearTimeout(id);
  }, [pourKey, reduceMotion]);
  const pourSettled = pourKey > 0 && seen === pourKey;
  const cur = L.taskOf(lab);
  const cpSettings = useLabCheckpointSettings('pythagoras-tanks');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const chain = cpOn && cpSettings.enabled && !L.isFree(lab) ? CHAINS[cur] ?? null : null;
  const ruleByCheckpoint = cpOn && cpSettings.enabled && lab.tasks.some((tk) => CHAINS[tk.id]?.includes('rule'));
  const cp = useLabCheckpoint({
    id: chain ? cur : null,
    questions: chain ? chain.map((q) => QUESTIONS[q](lab, k)) : null,
    reached: L.taskDone(lab) && pourSettled,
    resetKey: scene.inits,
    onRetry: () => setLab(L.restartTask),
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => { if (CHAINS[id]?.includes('rule')) { state.discover(); state.formalize(); } },
  });
  const ready = L.discoveryReady(lab) && !ruleByCheckpoint;
  useEffect(() => { if (ready) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  const reported = useRef(0);
  const nEv = lab.events.length;
  useEffect(() => {
    if (nEv < reported.current) reported.current = 0;
    for (let i = reported.current; i < nEv; i += 1) state.report(onTrial, lab.events[i]);
    reported.current = nEv;
  }, [nEv, lab.events]); // eslint-disable-line react-hooks/exhaustive-deps

  const coachStep = coachOn && !cp.open ? L.coachOf(lab) : null;
  const coach = useLabCoach({
    lab: 'pythagoras-tanks', step: coachStep,
    text: coachStep ? k(`coach.${coachStep.id}`) : '',
    labels: { hide: k('coach.hide'), show: k('coach.show'), ok: k('coach.ok'), stop: k('coach.stop') },
  });

  const boxRef = useRef(null);
  const [width, setWidth] = useState(900);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => setWidth(Math.max(320, Math.min(MAX_W, Math.floor(el.clientWidth))));
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const vp = useLessonViewport(true);
  const screenH = vp.ready && vp.height > 0 ? vp.height : (typeof window !== 'undefined' ? window.innerHeight : 768);

  const discovery = (
    <ManipulationDiscovery state={state} prompt={k(lab.mode === 'length' ? 'discovery.promptLength' : 'discovery.promptAngle')}
      options={discoveryOptions(lab, k)} formal={<Formal lab={lab} k={k} />}
      onFormalized={() => state.report(onFinished, { mode: lab.mode })} />
  );

  return (
    <ManipulationShell type="pythagoras-tanks" title={title ?? k('title')} titleHidden state={state} allowModeSwitch={allowModeSwitch} allowFreeLab={false}
      coach={coachOn ? coach : null} headerAction={cpOn ? cpSettings.control : null} guided={!!chain || ruleByCheckpoint}
      hints={[0, 1, 2].map((i) => k(`hints.${lab.mode}.${i}`))}
      controller={{ autoStep: () => false, canAutoStep: () => false }} discovery={discovery} explanation={k('explanation')}>
      <ManipulationStage className="bg-gradient-to-b from-sky-50/70 to-white">
        <div ref={boxRef} className="space-y-2" data-pythagoras-tanks data-mode={lab.mode} data-task={L.taskOf(lab)} data-free={L.isFree(lab) ? 'true' : 'false'} data-solved={ready ? 'true' : 'false'}>
          <style dangerouslySetInnerHTML={{ __html: MOTION_CSS }} />
          <Lab lab={lab} setLab={setLab} k={k} width={width} screenH={screenH} lead={state.isAuthoredLevel ? lead : null} cp={cp} pourSettled={pourSettled} />
          <div className={width >= 760 ? 'grid grid-cols-2 items-start gap-2' : 'space-y-2'}>
            <FreeCard lab={lab} setLab={setLab} k={k} />
            <Trials lab={lab} k={k} />
          </div>
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ══════════════ Le labo d'un seul regard ══════════════ */

function StepsDots({ lab, k, stepDone }) {
  if (lab.free) return <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-black text-emerald-800" data-pt-free-badge>{k('free.badge')}</span>;
  return <LabStepper count={lab.tasks.length} current={lab.ti} done={stepDone} stepAttr="data-pt-step" />;
}

function Lab({ lab, setLab, k, width, screenH, lead, cp, pourSettled }) {
  const reduce = useReduced();
  const side = width >= 640;
  const sideW = side ? (width < 820 ? 196 : 232) : 0;
  const [anim, setAnim] = useState(null); // t ∈ [0, 1] pendant un versement
  const pourKey = lab.pour ? lab.trials.length : 0;
  useEffect(() => {
    if (!lab.pour) { setAnim(null); return undefined; }
    if (reduce) { setAnim(1); return undefined; }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / POUR_MS);
      setAnim(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pourKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const t = lab.pour ? (anim ?? 0) : 0;
  const settled = Boolean(lab.pour) && t >= 1;

  const task = L.taskOf(lab);
  const legs = L.legsOf(lab);
  const done = L.taskDone(lab);
  const free = L.isFree(lab);
  const contextKey = free ? 'free' : task === 'surd' ? 'surd' : lab.mode;
  const context = (!free && lab.ti === 0 && lead) || k(`context.${contextKey}`, { b: iso(legs.b), c: iso(legs.c) });
  const question = k(free ? `question.free_${lab.mode}` : `question.${task}`);

  const stageH = Math.max(230, screenH - (side ? 250 : 462));
  const stageW = side ? width - sideW - 14 : width - 4;

  const bc = L.bcOf(lab);
  const readout = lab.mode === 'angle'
    ? { title: k('readout.angle'), value: `${lab.angle}°`, unit: '' }
    : { title: k('readout.length'), value: bc.exact && lab.exact ? bc.text : bc.text, unit: 'cm' };
  const lessDisabled = lab.mode === 'angle' ? lab.angle <= L.ANGLE_MIN : (!lab.exact && lab.tenths <= L.tapeRange(lab).lo);
  const moreDisabled = lab.mode === 'angle' ? lab.angle >= L.ANGLE_MAX : (!lab.exact && lab.tenths >= L.tapeRange(lab).hi);

  // ── une étape est FAITE quand le bassin est plein ET que ses questions sont répondues : la pastille passe au vert et on fête ──
  const stepDone = lab.tasks.map((_, i) => !!lab.done[i] && (i !== lab.ti || (pourSettled && !cp.blocking)));
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.trials.length === 0 && celebrated.current.size) celebrated.current = new Set();   // « إعادة », autre niveau : on refête
  const nowDone = !lab.free && stepDone[lab.ti];
  useEffect(() => {
    if (!nowDone || celebrated.current.has(lab.ti)) return;
    celebrated.current.add(lab.ti);
    party.celebrate({ n: lab.ti + 1, total: lab.tasks.length });
  }, [nowDone, lab.ti]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── le son (muet sauf « الصوت ») : un déclic au geste (≥ 35 ms entre deux), le drapeau au plein juste, « over » au débordement ou au vide ──
  const sfx = useRef({ v: null, at: 0, key: '' });
  const held = lab.mode === 'angle' ? lab.angle : lab.exact ? 'root' : lab.tenths;
  const sfxKey = `${lab.free ? 'free' : lab.ti}`;
  useEffect(() => {
    const p = sfx.current;
    if (p.key !== sfxKey) { sfx.current = { v: held, at: 0, key: sfxKey }; return; }
    if (p.v === held) return;
    const now = performance.now();
    const up = typeof held === 'number' && typeof p.v === 'number' ? held > p.v : true;
    if (held === 'root') playSfx('bell');
    else if (now - p.at > 35) { playSfx('tooth', { pitch: up ? 1 : 0.75 }); p.at = now; }
    p.v = held;
  }, [held, sfxKey]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!settled) return;
    if (lab.pour.verdict === 'exact') playSfx('flag'); else playSfx('over');
  }, [settled, pourKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const banner = verdictBanner(lab, k, t, settled);
  const nextEl = L.canNext(lab) && settled && !cp.blocking && (
    <button type="button" onClick={() => setLab(L.nextTask)} data-pt-next
      className={`inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-full border-2 border-emerald-600 bg-emerald-600 px-3 text-sm font-black text-white shadow-[0_3px_0_0_#047857] active:translate-y-0.5 ${ring}`}>
      {k('next')} <ChevronLeft className="h-4 w-4" aria-hidden="true" />
    </button>
  );

  const pourBtn = (
    <button type="button" data-pt-pour disabled={Boolean(lab.pour)} onClick={() => setLab(L.pour)}
      className={`inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl border-2 px-3 text-base font-black leading-tight transition-all ${ring} ${lab.pour ? 'border-slate-200 bg-slate-50 text-slate-400' : 'border-sky-600 bg-gradient-to-b from-sky-500 to-sky-600 text-white shadow-[0_5px_0_0_#0369A1] active:translate-y-0.5 active:shadow-none'}`}>
      <Droplets className="h-5 w-5" aria-hidden="true" /> {lab.pour ? k('poured') : k('pour')}
    </button>
  );

  const rootCard = lab.mode === 'length' && (
    <RootKey lab={lab} setLab={setLab} k={k} />
  );

  const stepper = (
    <StepperCard layout={side ? 'card' : 'row'} title={readout.title} value={readout.value} unit={readout.unit}
      className={side ? '!gap-2 !p-3' : ''}
      onLess={() => setLab((s) => L.nudge(s, -1))} onMore={() => setLab((s) => L.nudge(s, +1))}
      lessDisabled={lessDisabled} moreDisabled={moreDisabled}
      lessLabel={k(lab.mode === 'angle' ? 'less.angle' : 'less.length')} moreLabel={k(lab.mode === 'angle' ? 'more.angle' : 'more.length')}
      data-pt-stepper lessProps={{ 'data-pt-step-less': '' }} moreProps={{ 'data-pt-step-more': '' }} readoutProps={{ 'data-pt-readout': lab.mode === 'angle' ? lab.angle : bc.text }} />
  );

  const verdict = (
    <VerdictBanner tone={banner.tone} icon={banner.icon} size="xs" className="min-h-[3.4rem]" data-pt-banner={banner.id}>
      <div className="min-w-0 space-y-1.5">
        <p {...(settled ? { 'data-pt-verdict': lab.pour.verdict } : {})}>{banner.text}</p>
        {nextEl}
      </div>
    </VerdictBanner>
  );

  const panel = side ? (
    <div className="min-w-0 space-y-2" style={{ width: sideW }} data-pt-panel>
      {stepper}
      {pourBtn}
      {rootCard}
      {verdict}
    </div>
  ) : (
    <div className="min-w-0 space-y-1.5" data-pt-panel>
      <div className="flex items-stretch gap-2">
        <div className="min-w-0 flex-1">{stepper}</div>
        <div className="flex w-[34%] shrink-0">{pourBtn}</div>
        {lab.mode === 'length' && <RootKey lab={lab} setLab={setLab} k={k} compact />}
      </div>
      {verdict}
    </div>
  );

  return (
    <div className="relative mx-auto space-y-2" style={{ maxWidth: MAX_W }} data-pt-glance>
      {party.node}
      {cp.node}
      <PromptCard size={side && screenH >= 820 ? 'lg' : 'md'} className={screenH < 820 || !side ? '!space-y-1 !p-3' : '!space-y-2 !p-4'} aside={<StepsDots lab={lab} k={k} stepDone={stepDone} />}
        context={context} contextProps={{ 'data-pt-context': contextKey }}
        title={question} titleClassName={!side ? 'text-base' : screenH < 820 ? 'text-lg' : 'text-xl'} lamp={done ? 'on' : 'off'} titleProps={{ 'data-pt-prompt': task, 'data-lit': done ? 'true' : 'false' }} />
      <div className={side ? 'flex items-start gap-3' : 'space-y-2'}>
        <div className="flex min-w-0 flex-1 justify-center rounded-3xl border-2 border-sky-200 bg-gradient-to-b from-[#EAF4FF] to-[#FFF7EA] p-1 shadow-[0_12px_30px_-18px_rgba(14,116,144,0.55)]" data-pt-stage>
          <Scene lab={lab} setLab={setLab} k={k} t={t} settled={settled} maxW={stageW} maxH={stageH} reduce={reduce} kid={side} />
        </div>
        {panel}
      </div>
    </div>
  );
}

/** Une phrase arabe avec UNE valeur « ≈ 12 cm² » en îlot LTR entier (jamais coupé ni inversé par le bidi). */
function island(text, value) {
  const [before, after = ''] = text.split('@@');
  return <>{before}<bdi dir="ltr" className="whitespace-nowrap" data-pt-island>{value}</bdi>{after}</>;
}

function verdictBanner(lab, k, t, settled) {
  const angle = lab.mode === 'angle';
  if (lab.pour && !settled) return { id: 'pouring', tone: 'indigo', icon: Waves, text: k('b.pouring') };
  if (lab.pour) {
    const v = lab.pour.verdict;
    const approx = angle || !lab.pour.capExact ? '≈ ' : '';
    if (lab.last?.kind === 'task' && lab.last.task === 'compare') return { id: 'compareDone', tone: 'emerald', icon: CheckCircle2, text: k('b.compareDone') };
    if (v === 'exact') return { id: 'exact', tone: 'emerald', icon: CheckCircle2, text: k('b.exact') };
    return { id: v, tone: v === 'over' ? 'rose' : 'amber', icon: v === 'over' ? Droplets : Waves, text: island(k(`b.${v}`, { diff: '@@' }), `${approx}${lab.pour.diff} cm²`) };
  }
  if (lab.last?.kind === 'root') return { id: 'root', tone: 'indigo', icon: Calculator, text: k('b.root', { value: iso(lab.last.value), rounded: iso(lab.last.rounded) }) };
  return { id: 'idle', tone: 'indigo', icon: Hand, text: k(angle ? 'idle.angle' : 'idle.length') };
}

/* ══════════════ La touche √ (mode longueur) ══════════════ */

function RootKey({ lab, setLab, k, compact = false }) {
  const open = L.canRoot(lab);
  const used = lab.exact;
  const side = L.legsOf(lab);
  const last = lab.events.slice().reverse().find((e) => e.kind === 'root');
  if (compact) {
    return (
      <button type="button" data-pt-root disabled={!open} onClick={() => setLab(L.useRoot)} aria-label={open ? k('root.aria') : k('root.locked')} title={open ? undefined : k('root.locked')}
        className={`inline-flex min-h-[52px] w-14 shrink-0 items-center justify-center rounded-2xl border-b-4 text-2xl font-black ${ring} ${open ? 'border-amber-700 bg-amber-400 text-slate-900' : used ? 'border-emerald-700 bg-emerald-500 text-white' : 'border-slate-300 bg-slate-200 text-slate-400'}`}
        {...(!open && !used ? { 'data-pt-root-locked': '' } : {})}>
        √
      </button>
    );
  }
  if (!open && !used) {
    return (
      <p className="rounded-2xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-500 ring-1 ring-slate-200" data-pt-root-locked>
        <Calculator className="me-1 inline h-4 w-4 align-[-3px]" aria-hidden="true" />{k('root.locked')}
      </p>
    );
  }
  return (
    <LabCard className="space-y-1.5 border-slate-300 bg-gradient-to-b from-slate-700 to-slate-800 p-2.5 text-white" data-pt-calculator>
      <div className="rounded-lg bg-[#C9E6C1] px-2 py-1 text-end font-mono text-lg font-black tabular-nums text-slate-900" dir="ltr" data-pt-screen>
        {used && last ? last.screen.replace(',', '.') : '0'}
      </div>
      <div className="flex items-center justify-between gap-2">
        <bdi dir="ltr" className="text-sm font-black tabular-nums text-slate-100">{`√ ( ${side.c}² + ${side.b}² )`}</bdi>
        <button type="button" data-pt-root disabled={!open} onClick={() => setLab(L.useRoot)} aria-label={k('root.aria')}
          className={`inline-flex h-12 min-w-[56px] items-center justify-center rounded-xl border-b-4 text-2xl font-black ${ring} ${open ? 'border-amber-700 bg-amber-400 text-slate-900 active:translate-y-0.5 active:border-b-2' : 'border-slate-600 bg-slate-500 text-slate-300'}`}>
          √
        </button>
      </div>
    </LabCard>
  );
}

/* ══════════════ La scène dessinée ══════════════ */

const TONE = { ab: '#F59E0B', ac: '#8B5CF6', bc: '#0EA5E9' };

function Scene({ lab, setLab, k, t, settled, maxW, maxH, reduce, kid = true }) {
  const uid = useId().replace(/:/g, '');
  const legs = L.legsOf(lab);
  const box = useMemo(() => L.sweepBox(legs.b, legs.c, L.angleSpan(lab.mode)), [legs.b, legs.c, lab.mode]);
  const m = L.machineOf(lab);
  // le cadre (unités) : la machine sur toute sa course, la table dessous, l'élève à gauche
  const pad = 0.05 * Math.max(box.w, box.h) + 0.3;
  const tableY = Math.min(box.y0, -Number(String(legs.c).replace(',', '.'))) - 0.05;
  const kidW = kid ? box.h * 0.24 : 0;
  const x0 = box.x0 - pad - kidW;
  const x1 = box.x1 + pad;
  const y1 = box.y1 + pad;
  const y0 = tableY - box.h * 0.12;
  const W = x1 - x0;
  const H = y1 - y0;
  const scale = Math.max(4, Math.min(maxW / W, maxH / H));
  const vw = W * scale;
  const vh = H * scale;
  const X = (x) => (x - x0) * scale;
  const Y = (y) => (y1 - y) * scale;
  const pts = (ps) => ps.map((p) => `${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join(' ');
  const frame = L.pourFrame(lab, lab.pour ? t : 0);
  const a = L.amounts(lab);
  const full = !lab.pour;
  const ab = full ? { poly: m.sqAB } : frame.ab;
  const ac = full ? { poly: m.sqAC } : frame.ac;
  const bcw = full ? { poly: [] } : frame.bc;
  const svgRef = useRef(null);
  const [drag, setDrag] = useState(false);

  // la poignée : l'angle (ou la longueur) suit le doigt — direct, pendant le geste
  const fromPointer = (e) => {
    const svg = svgRef.current;
    if (!svg) return;
    const r = svg.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * vw;
    const py = ((e.clientY - r.top) / r.height) * vh;
    const mx = px / scale + x0;
    const my = y1 - py / scale;
    let deg = (Math.atan2(my, mx) * 180) / Math.PI;
    if (deg < 0) deg = mx < 0 ? 180 : 0;
    if (lab.mode === 'angle') setLab((s) => L.setAngle(s, deg));
    else {
      const bv = Number(String(legs.b).replace(',', '.'));
      const cv = Number(String(legs.c).replace(',', '.'));
      const len = Math.sqrt(Math.max(0, bv * bv + cv * cv - 2 * bv * cv * Math.cos((deg * Math.PI) / 180)));
      setLab((s) => L.setTenths(s, len * 10));
    }
  };
  const onDown = (e) => { e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId); setDrag(true); fromPointer(e); };
  const onMove = (e) => { if (drag) fromPointer(e); };
  const onUp = (e) => { setDrag(false); e.currentTarget.releasePointerCapture?.(e.pointerId); };
  const onKey = (e) => {
    const step = e.shiftKey ? 10 : 1;
    if (['ArrowRight', 'ArrowUp'].includes(e.key)) { e.preventDefault(); setLab((s) => L.nudge(s, +step)); }
    if (['ArrowLeft', 'ArrowDown'].includes(e.key)) { e.preventDefault(); setLab((s) => L.nudge(s, -step)); }
    if (e.key === 'Enter' && !lab.pour) { e.preventDefault(); setLab(L.pour); }
  };

  const angleDeg = L.angleOf(lab);
  const showRight = lab.mode === 'angle' ? lab.angle === 90 : Boolean(lab.pour && lab.pour.verdict === 'exact' && settled);
  const bvNum = Number(String(legs.b).replace(',', '.'));
  // la trajectoire de C (pointillés), de 25° à 155°
  const arc = [];
  for (let d = L.ANGLE_MIN; d <= L.ANGLE_MAX; d += 5) arc.push([bvNum * Math.cos((d * Math.PI) / 180), bvNum * Math.sin((d * Math.PI) / 180)]);

  const mood = !lab.pour ? 'wonder' : !settled ? 'neutral' : lab.pour.verdict === 'exact' ? 'proud' : 'neutral';
  const kidFoot = Y(tableY);
  const kidTop = Y(tableY + box.h * 0.5);
  const kidCx = X(x0 + kidW * 0.55);
  const unitPx = scale;
  const grid = (sq, n) => gridLines(sq, n, X, Y);
  const pillSize = Math.max(12, Math.min(17, unitPx * 0.42));
  const bcLen = L.bcOf(lab);
  // Les étiquettes : placées par la géométrie (`labelPlan`, testé : jamais deux boîtes qui se touchent sur toute la course).
  const plan = Object.fromEntries(L.labelPlan(m, { withBC: lab.mode === 'length', capacity: settled }).map((l) => [l.id, l.at]));

  // le vide du grand bassin après un versement court
  const gapPoly = settled && lab.pour.verdict === 'gap' && frame.bc.level != null
    ? m.sqBC.length && L.clipBelow(m.sqBC.map((p) => [p[0], -p[1]]), -frame.bc.level).map((p) => [p[0], -p[1]]) : null;

  const handleR = Math.max(15, Math.min(24, unitPx * 0.42)); // petit quand la machine est petite : il ne cache pas les étiquettes

  return (
    <svg ref={svgRef} width={vw} height={vh} viewBox={`0 0 ${vw.toFixed(1)} ${vh.toFixed(1)}`} className="block max-w-full touch-none select-none" data-pt-scene role="img" aria-label={k('sceneAria', { b: iso(legs.b), c: iso(legs.c) })}>
      <defs>
        <linearGradient id={`w${uid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7DD3FC" /><stop offset="1" stopColor="#0284C7" /></linearGradient>
        <linearGradient id={`g${uid}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFFFFF" stopOpacity="0.85" /><stop offset="1" stopColor="#E0F2FE" stopOpacity="0.55" /></linearGradient>
        <linearGradient id={`t${uid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#D9A066" /><stop offset="1" stopColor="#A86B3C" /></linearGradient>
        <pattern id={`dots${uid}`} width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.4" fill="#BFD7EA" /></pattern>
      </defs>
      {/* décor : panneau perforé du stand et fanions (aria-hidden, jamais une réponse) */}
      <g aria-hidden="true" data-deco>
        <rect x="0" y="0" width={vw} height={Y(tableY)} fill={`url(#dots${uid})`} opacity="0.7" />
        {Array.from({ length: Math.max(6, Math.floor(vw / 46)) }, (_, i) => {
          const n = Math.max(6, Math.floor(vw / 46));
          const x = (i + 0.5) * (vw / n);
          return <path key={i} d={`M ${x - 12} 4 L ${x + 12} 4 L ${x} 24 Z`} fill={['#F472B6', '#38BDF8', '#FBBF24', '#34D399', '#A78BFA'][i % 5]} opacity="0.85" />;
        })}
        <path d={`M 0 4 Q ${vw / 2} 14 ${vw} 4`} stroke="#94A3B8" strokeWidth="1.2" fill="none" />
      </g>
      {/* la table */}
      <g aria-hidden="true">
        <rect x={X(x0) + 4} y={Y(tableY)} width={vw - 8} height={Math.max(14, scale * 0.28)} rx="6" fill={`url(#t${uid})`} />
        <rect x={X(x0) + 4} y={Y(tableY) + Math.max(14, scale * 0.28)} width={vw - 8} height="5" fill="#7C4A25" opacity="0.5" />
      </g>
      {/* l'élève qui présente la machine (KidFigure : hijab) */}
      {kid && <g data-pt-kid data-mood={mood}>
        <KidFigure cx={kidCx} top={kidTop} foot={kidFoot} hairStyle="hijab" scarf="sky" outfit="teal" skin="medium" mood={mood} />
        <SvgPill x={kidCx} y={kidFoot - (kidFoot - kidTop) - pillSize * 1.2} text={k('kidName')} fill="#0E7490" size={Math.max(12, pillSize - 2)} />
      </g>}
      {/* trajectoire de C */}
      <polyline points={pts(arc)} fill="none" stroke="#94A3B8" strokeWidth="2" strokeDasharray="5 6" opacity="0.6" aria-hidden="true" />
      {/* les trois bassins : verre, eau, quadrillage d'un cm² */}
      {[['ab', m.sqAB, ab, legs.c], ['ac', m.sqAC, ac, legs.b], ['bc', m.sqBC, bcw, null]].map(([id, sq, water, n]) => (
        <g key={id} data-pt-tank={id}>
          <polygon points={pts(sq)} fill={`url(#g${uid})`} stroke={TONE[id]} strokeWidth={id === 'bc' ? 3.5 : 3} strokeLinejoin="round" />
          {water.poly && water.poly.length > 2 && (
            <polygon points={pts(water.poly)} fill={`url(#w${uid})`} opacity="0.88" data-pt-water={id} />
          )}
          {grid(sq, n)}
        </g>
      ))}
      {/* le vide (après un versement trop court) */}
      {gapPoly && gapPoly.length > 2 && (
        <polygon points={pts(gapPoly)} fill="#FEF3C7" fillOpacity="0.55" stroke="#D97706" strokeWidth="2.5" strokeDasharray="7 5" data-pt-gap className={reduce ? undefined : 'pt-pulse'} />
      )}
      {/* la flaque (après un débordement) */}
      {lab.pour && frame.spill > 0.0001 && (() => {
        const area = frame.spill;
        const rx = Math.min(box.w * 0.18, 0.35 + Math.sqrt(area) * 0.45) * scale;
        const cx = X(Math.max(...m.sqAB.map((p) => p[0]))) + rx + 6;
        return (
          <g data-pt-spill>
            <ellipse cx={Math.min(cx, vw - rx - 4)} cy={Y(tableY) + 2} rx={rx} ry={Math.max(5, rx * 0.16)} fill="#38BDF8" opacity="0.75" />
            {!reduce && !settled && [0, 1, 2].map((i) => <circle key={i} className="pt-drip" style={{ animationDelay: `${i * 0.22}s` }} cx={Math.min(cx, vw - rx - 4) - rx * 0.3 + i * rx * 0.3} cy={Y(tableY) - 28} r="4" fill="#0EA5E9" />)}
          </g>
        );
      })()}
      {/* le triangle (les bras) */}
      <polygon points={pts([m.A, m.B, m.C])} fill="#FFFFFF" fillOpacity="0.35" stroke="#334155" strokeWidth="3.5" strokeLinejoin="round" />
      {lab.mode === 'length' && <line x1={X(m.B[0])} y1={Y(m.B[1])} x2={X(m.C[0])} y2={Y(m.C[1])} stroke="#F59E0B" strokeWidth="7" strokeLinecap="round" strokeDasharray="2 9" opacity="0.9" aria-hidden="true" />}
      {showRight && (() => {
        const s = 0.42 * Math.min(Number(String(legs.b).replace(',', '.')), Number(String(legs.c).replace(',', '.')), 1.2);
        const u1 = [Math.cos(0), 0]; const u2 = [Math.cos((angleDeg * Math.PI) / 180), Math.sin((angleDeg * Math.PI) / 180)];
        const p1 = [u1[0] * s, u1[1] * s]; const p3 = [u2[0] * s, u2[1] * s]; const p2 = [p1[0] + p3[0], p1[1] + p3[1]];
        return <polyline points={pts([p1, p2, p3])} fill="none" stroke="#DC2626" strokeWidth="3" data-pt-right />;
      })()}
      {/* les longueurs */}
      <SvgPill x={X(plan.AB[0])} y={Y(plan.AB[1])} text={L.sideText('AB', String(legs.c).replace('.', ','), full ? L.show(a.small[1]) : null, Math.sqrt(a.small[1]) * scale, (t) => pillWidth(t, pillSize))} fill="#B45309" size={pillSize} data-pt-label="AB" />
      <SvgPill x={X(plan.AC[0])} y={Y(plan.AC[1])} text={L.sideText('AC', String(legs.b).replace('.', ','), full ? L.show(a.small[0]) : null, Math.sqrt(a.small[0]) * scale, (t) => pillWidth(t, pillSize))} fill="#6D28D9" size={pillSize} data-pt-label="AC" />
      {plan.BC && <SvgPill x={X(plan.BC[0])} y={Y(plan.BC[1])} text={`BC = ${bcLen.text}`} fill="#0369A1" size={pillSize} data-pt-label="BC" data-pt-bc={bcLen.text} />}
      {/* l'eau de chaque petit bassin, en cm² (lue sur le quadrillage) */}
      {plan.capacity && <SvgPill x={X(plan.capacity[0])} y={Y(plan.capacity[1])} text={`${lab.pour.capExact ? '' : '≈ '}${lab.pour.cap} cm²`} fill="#0F172A" size={pillSize} data-pt-label="capacity" data-pt-capacity={lab.pour.cap} />}
      {/* les sommets */}
      {[['A', m.A, [-0.38, -0.32]], ['B', m.B, [0.32, -0.32]]].map(([n, p, d]) => (
        <g key={n} aria-hidden="true">
          <circle cx={X(p[0])} cy={Y(p[1])} r="6" fill="#334155" />
          <text x={X(p[0] + d[0] * Math.max(1, 30 / scale))} y={Y(p[1] + d[1] * Math.max(1, 30 / scale))} fontSize={pillSize + 3} fontWeight="900" fill="#0F172A" textAnchor="middle" dominantBaseline="middle" direction="ltr">{n}</text>
        </g>
      ))}
      {/* la poignée C : la main tient l'angle (ou la longueur) */}
      <g role="slider" tabIndex={0} data-pt-handle
        aria-label={k(lab.mode === 'angle' ? 'handle.angle' : 'handle.length')}
        aria-valuemin={lab.mode === 'angle' ? L.ANGLE_MIN : L.tapeRange(lab).lo / 10}
        aria-valuemax={lab.mode === 'angle' ? L.ANGLE_MAX : L.tapeRange(lab).hi / 10}
        aria-valuenow={lab.mode === 'angle' ? lab.angle : Math.round(bcLen.value * 100) / 100}
        aria-valuetext={lab.mode === 'angle' ? `${lab.angle}°` : `${bcLen.text} cm`}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onKeyDown={onKey}
        className={`cursor-grab outline-none focus-visible:[&>circle:first-child]:stroke-sky-400 ${drag ? 'cursor-grabbing' : ''}`} style={{ touchAction: 'none' }}>
        <circle cx={X(m.C[0])} cy={Y(m.C[1])} r={Math.max(22, handleR + 6)} fill="#38BDF8" fillOpacity={drag ? 0.3 : 0.12} stroke="transparent" strokeWidth="6" />
        <circle cx={X(m.C[0])} cy={Y(m.C[1])} r={handleR * 0.62} fill="#FFFFFF" stroke="#0369A1" strokeWidth="4" />
        <text x={X(m.C[0])} y={Y(m.C[1]) + 1} fontSize={pillSize + 2} fontWeight="900" fill="#0369A1" textAnchor="middle" dominantBaseline="middle" direction="ltr" pointerEvents="none">C</text>
      </g>
    </svg>
  );
}

/** Le quadrillage d'un cm² dans un bassin de côté entier (n) ; pour le grand bassin, de côté quelconque, aussi (lignes parallèles aux côtés). */
function gridLines(sq, n, X, Y) {
  const [P, Q, , R] = sq; // P→Q un côté, P→R l'autre
  const side = Math.hypot(Q[0] - P[0], Q[1] - P[1]);
  const k = Math.floor(side + 1e-9);
  if (k < 1) return null;
  const u = [(Q[0] - P[0]) / side, (Q[1] - P[1]) / side];
  const v = [(R[0] - P[0]) / side, (R[1] - P[1]) / side];
  const lines = [];
  for (let i = 1; i <= k; i += 1) {
    if (Math.abs(i - side) < 1e-6) continue;
    const a1 = [P[0] + u[0] * i, P[1] + u[1] * i];
    const a2 = [a1[0] + v[0] * side, a1[1] + v[1] * side];
    const b1 = [P[0] + v[0] * i, P[1] + v[1] * i];
    const b2 = [b1[0] + u[0] * side, b1[1] + u[1] * side];
    lines.push(<line key={`a${i}`} x1={X(a1[0])} y1={Y(a1[1])} x2={X(a2[0])} y2={Y(a2[1])} />);
    lines.push(<line key={`b${i}`} x1={X(b1[0])} y1={Y(b1[1])} x2={X(b2[0])} y2={Y(b2[1])} />);
  }
  return <g stroke="#0F172A" strokeOpacity="0.16" strokeWidth="1" aria-hidden="true" data-pt-grid={n ?? 'bc'}>{lines}</g>;
}

/* ══════════════ « جرّب أعدادك أنت » (toujours ouvert) ══════════════ */

function FreeCard({ lab, setLab, k }) {
  const free = L.isFree(lab);
  const cur = L.legsOf(lab);
  const [vals, setVals] = useState({ b: Number(String(cur.b).replace(',', '.')) | 0 || 6, c: Number(String(cur.c).replace(',', '.')) | 0 || 8 });
  const bump = (f, d) => setVals((v) => ({ ...v, [f]: Math.max(L.FREE_MIN, Math.min(L.FREE_MAX, v[f] + d)) }));
  const field = (f) => (
    <div className="flex items-center gap-1.5" data-pt-free-field={f}>
      <span className="w-10 text-sm font-black text-emerald-900" dir="ltr">{f === 'c' ? 'AB' : 'AC'}</span>
      <div className="flex items-center gap-1.5" dir="ltr">
        <RoundButton size={44} onClick={() => bump(f, -1)} disabled={vals[f] <= L.FREE_MIN} aria-label={k(`free.less_${f}`)} data-pt-free-less={f}>−</RoundButton>
        <span className="min-w-[2.2rem] text-center text-2xl font-black tabular-nums text-emerald-950" data-pt-free-value={f}>{vals[f]}</span>
        <RoundButton size={44} primary onClick={() => bump(f, +1)} disabled={vals[f] >= L.FREE_MAX} aria-label={k(`free.more_${f}`)} data-pt-free-more={f}>+</RoundButton>
      </div>
    </div>
  );
  return (
    <LabCard className="space-y-2 border-emerald-200 bg-emerald-50/50 p-3" data-pt-free data-active={free ? 'true' : 'false'}>
      <p className="flex items-center gap-1.5 text-sm font-black text-emerald-900"><FlaskConical className="h-4 w-4" aria-hidden="true" /> {k('free.title')}</p>
      <p className="text-xs font-bold leading-snug text-slate-600">{free ? k('free.on') : k('free.hint')}</p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">{field('c')}{field('b')}</div>
      <div className="flex flex-wrap gap-2">
        <button type="button" data-pt-free-apply onClick={() => setLab((s) => L.setFree(s, vals.b, vals.c))}
          className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-full border-2 border-emerald-600 bg-emerald-600 px-3.5 text-sm font-black text-white ${ring}`}>
          <Sparkles className="h-4 w-4" aria-hidden="true" /> {k('free.apply')}
        </button>
        {free && (
          <button type="button" data-pt-free-back onClick={() => setLab(L.toGuided)}
            className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-full border-2 border-emerald-300 bg-white px-3.5 text-sm font-black text-emerald-800 ${ring}`}>
            <Undo2 className="h-4 w-4" aria-hidden="true" /> {k('free.back')}
          </button>
        )}
      </div>
    </LabCard>
  );
}

/* ══════════════ Le carnet des versements ══════════════ */

function Trials({ lab, k }) {
  const list = lab.trials.slice(-8);
  return (
    <LabFold id="pythagoras-tanks.trials" title={k('trials.title')}>
      <ul className="flex flex-wrap gap-1.5" data-pt-trials data-count={lab.trials.length}>
        {list.length === 0 && <li className="text-xs font-bold text-slate-500">{k('trials.empty')}</li>}
        {list.map((tr, i) => (
          <li key={i} data-pt-trial={tr.verdict} data-free={tr.free ? 'true' : 'false'}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black ring-1 ${tr.verdict === 'exact' ? 'bg-emerald-50 text-emerald-800 ring-emerald-300' : tr.verdict === 'over' ? 'bg-rose-50 text-rose-800 ring-rose-200' : 'bg-amber-50 text-amber-900 ring-amber-200'}`}>
            <bdi dir="ltr">{tr.mode === 'angle' ? `${tr.angle}°` : `BC = ${tr.bc}`}</bdi>
            <span>{k(`trials.${tr.verdict}`)}</span>
            {tr.free && <span className="text-emerald-700">· {k('trials.free')}</span>}
          </li>
        ))}
      </ul>
    </LabFold>
  );
}

/* ══════════════ La découverte et la règle ══════════════ */

export function discoveryOptions(lab, k) {
  const w = L.witnesses(lab);
  if (lab.mode === 'length') {
    const t0 = lab.tasks[0];
    const sum = Number(String(t0.b).replace(',', '.')) + Number(String(t0.c).replace(',', '.'));
    return [
      { text: k('discovery.length.add'), why: k('discovery.length.whyAdd', { b: iso(t0.b), c: iso(t0.c), sum: iso(L.show(sum)), bc: iso(w.exact?.bc ?? '13') }) },
      { text: k('discovery.length.right'), correct: true },
      { text: k('discovery.length.tape'), why: k('discovery.length.whyTape', { value: iso(w.root?.bc ?? '√13') }) },
    ];
  }
  return [
    { text: k('discovery.angle.any'), why: k('discovery.angle.whyAny', { angle: iso(`${w.over?.angle ?? 60}°`), diff: iso(w.over?.diff ?? '') }) },
    { text: k('discovery.angle.right'), correct: true },
    { text: k('discovery.angle.obtuse'), why: k('discovery.angle.whyObtuse', { angle: iso(`${w.gap?.angle ?? 120}°`), diff: iso(w.gap?.diff ?? '') }) },
  ];
}

export function Formal({ lab, k }) {
  const f = L.formalOf(lab);
  const w = L.witnesses(lab);
  const eq = (s) => <bdi dir="ltr" className="font-black tabular-nums">{s}</bdi>;
  return (
    <div className="space-y-2 text-sm font-bold text-emerald-950" data-pt-formal>
      <p data-pt-formal-rule>{k('formal.rule')} {eq('BC² = AB² + AC²')}</p>
      <p className="text-xs text-slate-700">{k('formal.hyp')}</p>
      <p data-pt-formal-own>{k('formal.own')} {eq(`${f.bc}² = ${f.cc} + ${f.bb} = ${f.sum}`)}</p>
      {lab.mode === 'angle' && f.notRight && (
        <p data-pt-formal-not>{k('formal.not', { angle: iso(`${f.notRight.angle}°`) })} {eq(`BC² ≈ ${f.notRight.cap} ≠ ${f.sum}`)}</p>
      )}
      {lab.mode === 'length' && f.surd && (
        <p data-pt-formal-surd>{k('formal.surd')} {eq(`BC² = ${f.surd.cc} + ${f.surd.bb} = ${f.surd.sum}`)} ← {eq(`BC = ${f.surd.text} ≈ ${f.surd.rounded}`)}</p>
      )}
      {lab.mode === 'length' && w.tape.length > 0 && <p className="text-xs text-slate-700">{k('formal.tape')}</p>}
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite de questions de chaque tâche : elle interroge ce que l'élève vient de FAIRE, et mène à la règle (`rule` : l'ancienne découverte). */
export const CHAINS = Object.freeze({
  fill: ['water', 'kind', 'move'],
  compare: ['over', 'gap', 'rule'],
  thirteen: ['water', 'side'],
  surd: ['water', 'tape', 'rule'],
});

const tx = (v) => String(v).replace(',', '{,}');
const numOf = (v) => Number(String(v).replace(',', '.'));
/** Les versements de LA tâche (le fil de l'élève), sinon ceux de tout le labo. */
const pourOf = (lab, verdict, task) => lab.trials.find((t) => !t.free && t.kind === 'pour' && t.verdict === verdict && t.task === task)
  ?? lab.trials.find((t) => !t.free && t.kind === 'pour' && t.verdict === verdict);

/** Les nombres de la tâche affichée : AB = c, AC = b, l'eau b² + c². */
function numbersOf(lab) {
  const t = lab.tasks[lab.ti];
  const sq = (x) => PY2.decText(PY2.square(x));
  const side = PY2.sideFrom({ legs: [t.b, t.c] });
  return { b: t.b, c: t.c, bb: sq(t.b), cc: sq(t.c), sum: PY2.decText(side.square), bc: side.text };
}

const RAWQ = {
  water: (lab, k) => {
    const n = numbersOf(lab);
    const o = { bb: $(tx(n.bb)), cc: $(tx(n.cc)), b: $(tx(n.b)), c: $(tx(n.c)), sum: $(`${tx(n.sum)}\\,\\mathrm{cm}^2`) };
    return {
      id: 'water', kind: 'number', expected: n.sum, answer: <MathText>{o.sum}</MathText>,
      prompt: Mx(k, 'water.prompt'),
      hints: [Mx(k, 'water.hint1'), Mx(k, 'water.hint2', o)],
      explain: Mx(k, 'water.explain', { ...o, calc: $(`${tx(n.cc)}+${tx(n.bb)}=${tx(n.sum)}`) }),
    };
  },
  kind: (lab, k) => {
    const done = pourOf(lab, 'exact', 'fill');
    const o = { angle: $(`${done?.angle ?? 90}^\\circ`) };
    return {
      id: 'kind', kind: 'choice',
      prompt: Mx(k, 'kind.prompt'),
      options: [
        { text: Mx(k, 'kind.acute'), why: Mx(k, 'kind.whyAcute', o) },
        { text: Mx(k, 'kind.right'), correct: true },
        { text: Mx(k, 'kind.obtuse'), why: Mx(k, 'kind.whyObtuse', o) },
      ],
      hints: [Mx(k, 'kind.hint1'), Mx(k, 'kind.hint2', o)],
      explain: Mx(k, 'kind.explain', o),
    };
  },
  move: (lab, k) => {
    const n = numbersOf(lab);
    const o = { sum: $(`${tx(n.sum)}\\,\\mathrm{cm}^2`), bb: $(tx(n.bb)), cc: $(tx(n.cc)) };
    return {
      id: 'move', kind: 'choice',
      prompt: Mx(k, 'move.prompt'),
      options: [
        { text: Mx(k, 'move.big'), why: Mx(k, 'move.whyBig', o) },
        { text: Mx(k, 'move.water', o), correct: true },
        { text: Mx(k, 'move.none'), why: Mx(k, 'move.whyNone') },
      ],
      hints: [Mx(k, 'move.hint1'), Mx(k, 'move.hint2', o)],
      explain: Mx(k, 'move.explain', o),
    };
  },
  over: (lab, k) => {
    const t = pourOf(lab, 'over', 'compare');
    const o = { angle: $(`${t?.angle ?? 60}^\\circ`), diff: $(`${tx(t?.diff ?? '')}\\,\\mathrm{cm}^2`) };
    return {
      id: 'over', kind: 'choice',
      prompt: Mx(k, 'over.prompt', o),
      options: [
        { text: Mx(k, 'over.bigger'), why: Mx(k, 'over.whyBigger', o) },
        { text: Mx(k, 'over.smaller'), correct: true },
        { text: Mx(k, 'over.equal'), why: Mx(k, 'over.whyEqual', o) },
      ],
      hints: [Mx(k, 'over.hint1'), Mx(k, 'over.hint2', o)],
      explain: Mx(k, 'over.explain', o),
    };
  },
  gap: (lab, k) => {
    const t = pourOf(lab, 'gap', 'compare');
    const o = { angle: $(`${t?.angle ?? 120}^\\circ`), diff: $(`${tx(t?.diff ?? '')}\\,\\mathrm{cm}^2`) };
    return {
      id: 'gap', kind: 'choice',
      prompt: Mx(k, 'gap.prompt', o),
      options: [
        { text: Mx(k, 'gap.bigger'), correct: true },
        { text: Mx(k, 'gap.smaller'), why: Mx(k, 'gap.whySmaller', o) },
        { text: Mx(k, 'gap.equal'), why: Mx(k, 'gap.whyEqual', o) },
      ],
      hints: [Mx(k, 'gap.hint1'), Mx(k, 'gap.hint2', o)],
      explain: Mx(k, 'gap.explain', o),
    };
  },
  side: (lab, k) => {
    const n = numbersOf(lab);
    const s = numOf(n.b) + numOf(n.c);
    const d = Math.abs(numOf(n.c) - numOf(n.b));
    const o = { b: $(tx(n.b)), c: $(tx(n.c)), sum: $(tx(n.sum)), bc: $(tx(n.bc)), plus: $(tx(L.show(s))), minus: $(tx(L.show(d))), bcSq: $(`${tx(n.bc)}^2=${tx(n.sum)}`) };
    return {
      id: 'side', kind: 'choice',
      prompt: Mx(k, 'side.prompt'),
      options: [
        { text: Mx(k, 'side.add', o), why: Mx(k, 'side.whyAdd', o) },
        { text: Mx(k, 'side.square', o), correct: true },
        { text: Mx(k, 'side.sub', o), why: Mx(k, 'side.whySub', o) },
      ],
      hints: [Mx(k, 'side.hint1'), Mx(k, 'side.hint2', o)],
      explain: Mx(k, 'side.explain', o),
    };
  },
  tape: (lab, k) => {
    const n = numbersOf(lab);
    const v = Math.sqrt(numOf(n.sum));
    const lo = Math.floor(v * 10 + 1e-9) / 10;
    const hi = Math.round((lo + 0.1) * 10) / 10;
    const o = {
      sum: $(tx(n.sum)), sumU: $(`${tx(n.sum)}\\,\\mathrm{cm}^2`), loSq: $(tx(L.show(lo * lo))), hiSq: $(tx(L.show(hi * hi))),
      lo: $(tx(L.show(lo))), hi: $(tx(L.show(hi))),
      loC: $(`${tx(L.show(lo))}^2=${tx(L.show(lo * lo))}`), hiC: $(`${tx(L.show(hi))}^2=${tx(L.show(hi * hi))}`),
    };
    return {
      id: 'tape', kind: 'choice',
      prompt: Mx(k, 'tape.prompt', o),
      options: [
        { text: Mx(k, 'tape.broken'), why: Mx(k, 'tape.whyBroken') },
        { text: Mx(k, 'tape.between', o), correct: true },
        { text: Mx(k, 'tape.water', o), why: Mx(k, 'tape.whyWater', o) },
      ],
      hints: [Mx(k, 'tape.hint1', o), Mx(k, 'tape.hint2', o)],
      explain: Mx(k, 'tape.explain', o),
    };
  },
  rule: (lab, k) => ({
    id: 'rule', kind: 'choice',
    prompt: k(lab.mode === 'length' ? 'discovery.promptLength' : 'discovery.promptAngle'),
    options: discoveryOptions(lab, k),
    hints: [Mx(k, `rule.hint1${lab.mode === 'length' ? 'Length' : 'Angle'}`), Mx(k, `rule.hint2${lab.mode === 'length' ? 'Length' : 'Angle'}`)],
    explain: <Formal lab={lab} k={k} />,
  }),
};

/** Chaque question est construite sur LES nombres de la tâche (rien n'est écrit en dur) ; la bonne réponse change de place d'une question à l'autre. */
export const QUESTIONS = spreadAll(RAWQ, (lab) => Math.round(numOf(lab.tasks[lab.ti].b) * 3 + numOf(lab.tasks[lab.ti].c)));
