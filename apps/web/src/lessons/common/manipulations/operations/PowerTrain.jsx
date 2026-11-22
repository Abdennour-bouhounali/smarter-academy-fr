import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Hand, CheckCircle2, Sparkles, ChevronLeft, FlaskConical, Undo2 } from 'lucide-react';
import { resolveLevelId } from '@smarter-academy/core/curriculum/manipulationLevels.js';
import * as P from '@smarter-academy/core/arithmetic/powers.js';
import MathText from '../../components/MathText';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import { LabCard, StageFrame, PromptCard, VerdictBanner, StepperCard } from '../primitives/LabKit';
import { SvgPill } from '../primitives/SvgPill';
import KidFigure from '../primitives/KidFigure';
import { useLabCoach } from '../primitives/LabCoach';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import { TrainDefs, Backdrop, Locomotive, Wagon, Knob } from './powerTrain/TrainArt';
import { LEVELS } from '../levels';
import * as L from '../logic/powerTrain';

/**
 * power-train — L'EXPOSANT SOUS LA MAIN (3AM, unité 3 « القوى ذات أسس نسبية صحيحة », درس « قوة عدد نسبي », 2026-10-21).
 * La logique, exacte, est dans `logic/powerTrain.js` (sur `packages/core/arithmetic/powers.js`, importé par chemin).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. La main tient n, la longueur SIGNÉE d'un train : une poignée jaune glisse sur un rail gradué (−5 … 6), −/+ et les flèches
 *    l'avancent d'un wagon, un toucher sur la voie y pose la queue. À droite de la locomotive les wagons « × a », à sa gauche « ÷ a ».
 * B. Le train part en portant 1 ; chaque wagon agit sur ce qu'il porte : il porte aⁿ. Une base négative change de signe à chaque
 *    wagon ; aucun wagon : 1 ; n wagons « ÷ » : 1 / aⁿ. Deux trains attelés (monde `couple`) : les wagons s'ajoutent, un « × »
 *    et un « ÷ » s'annulent — aᵐ × aⁿ = aᵐ⁺ⁿ, aᵐ ÷ aⁿ = aᵐ⁻ⁿ.
 * C. La résistance : la charge cible n'est portée que pour UN n ; 16 et −32 ne diffèrent que d'un wagon ; 1 n'est porté que sans
 *    wagon ; 1/9 n'existe pas à droite de la locomotive ; la voie a deux butoirs.
 * D. La phase formelle écrit ce que l'élève a fait : aⁿ en n facteurs avec SES trains, le signe, a⁰ = 1, a⁻ⁿ = 1/aⁿ ; en `couple`,
 *    la règle du produit et du quotient avec SES exposants.
 * E. Les fausses conjectures sont réfutées avec SES trains (16 positif avec une base négative ; 1/9 n'est pas −9 ; 3 + 4, pas 3 × 4).
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        aⁿ pour a relatif non nul et n entier relatif ; le signe selon la parité ; a⁰ = 1 ; a⁻ⁿ = 1/aⁿ ; aᵐ·aⁿ, aᵐ/aⁿ
 *   OBJECT         une locomotive qui porte 1, des wagons « × a » / « ÷ a » avec leur plaque, une voie graduée, une poignée de queue
 *   VARIABLE       n, la longueur signée du train (et, en libre, la base a)
 *   INVARIANT      la base a ; la charge de départ 1 ; l'ordre des wagons ne change rien
 *   TRANSFORMATION atteler / dételer un wagon : la charge est multipliée (divisée) par a — son signe bascule si a < 0
 *   CONSTRAINT     −5 ≤ n ≤ 6 (build), −6 ≤ n ≤ 6 (couple), a ≠ 0
 *   RESISTANCE     la charge cible n'est atteinte que pour un seul n ; les butoirs ; la lampe reste éteinte
 *   EVIDENCE       les charges écrites au-dessus de chaque wagon (مبتدئ), les paires de wagons négatifs liées, la charge finale
 *   CONTRAST       16 / −32 (un wagon de plus) ; 1 (aucun wagon) ; (−3)² = 9 / (−3)⁻² = 1/9 ; 3 + 4 wagons / 3 × 4
 *   PREDICTION     aucune carte : chaque exposant lâché est un essai jugé
 *   DISCOVERY      « متى يحمل القطار عددًا سالبًا؟ » ; « ماذا يحمل القطار بعربات القسمة؟ » ; « ما أس القطار الموصول؟ »
 *   FORMALIZATION  aⁿ = a × … × a, le signe, a⁰ = 1, a⁻ⁿ = 1/aⁿ ; aᵐ × aⁿ = aᵐ⁺ⁿ, aᵐ ÷ aⁿ = aᵐ⁻ⁿ
 *   TRANSFER       « جرّب أعدادك » (sa base, toujours ouvert), les exercices et la banque
 *
 * « جرّب كل الإمكانيات » : NON (chaque exposant lâché EST l'essai). « جرّب أعدادك » est TOUJOURS ouvert sous le labo.
 *
 * D'UN SEUL REGARD (§8bis) : `[data-pt-glance]` enveloppe la consigne (contexte puis UNE question), la scène (voie, train, poignée),
 * la lecture, −/+ et le verdict. Large (≥ 700 px) : une colonne à côté porte la cheffe de gare (`KidFigure`, hijab), la lecture,
 * −/+ et le verdict ; étroit : la lecture, −/+ et le verdict passent sous la scène sur deux colonnes.
 *
 * ONBOARDING : `coach` (défaut true) → `LabCoach` ; `logic/powerTrain.js › coachOf` (grab · try · divide · next ; couple : grabB ·
 * tryB) montre la poignée, −/+ ou « التالي », jamais le nombre de wagons.
 *
 * QUESTIONS PENDANT LE LABO (2026-10-28, lot 6) : après chaque tâche une suite de 2 questions se pose PAR-DESSUS le labo (`CHAINS` par monde et niveau, `QUESTIONS` en bas du fichier) sur ce
 * que l'élève vient de FAIRE avec SON train : le nombre de wagons, la charge après deux wagons, l'inversion du signe, le train vide, la parité, les wagons « ÷ », l'exposant d'un train
 * attelé ; la dernière tâche de chaque monde et niveau finit par LA RÈGLE (la découverte d'avant passe dans la carte). Étapes `LabStepper` (`[data-pt-step=<i>]`) + fête ; « إعادة » repart
 * de la tâche 1 ; obligatoires pour tout élève, coupées par l'enseignant pour SON compte (`useLabCheckpointSettings`) ; `checkpoints` = false les coupe aussi ; `onCheckpoint(ev)` : la trace
 * (`checkpoint-done`) que les étapes du module relisent.
 *
 * Props (contrat fixé avec la leçon) : `world` ('build' | 'couple'), `base`, `targets` (build : charges cibles, textes « 16 »,
 * « -1/27 »), `tasks` (couple : [{ m, target, op: 'times'|'divide' }]), `level`, `levels`, `coach`, `title`, `lead`,
 * `onTrial(event)`, `onFinished({ world })` — par `state.report`.
 *
 * CONTRAT DOM : [data-power-train][data-world][data-task][data-solved][data-layout], [data-pt-glance], [data-pt-stage], [data-pt-svg],
 * [data-pt-rail=main|A|B], [data-pt-loco], [data-pt-wagon=<k>][data-kind], [data-pt-load=<k>], [data-pt-pair=<i>], [data-pt-alone],
 * [data-pt-knob][data-n] (role slider), [data-pt-tick=<k>], [data-pt-merged][data-exponent], [data-pt-readout][data-load][data-n],
 * [data-pt-stepper], [data-pt-less], [data-pt-more], [data-pt-n], [data-pt-verdict=right|load|free|''], [data-pt-prompt][data-lit],
 * [data-pt-next], [data-pt-step=<i>][data-done], [data-pt-free][data-active], [data-pt-free-base], [data-pt-free-back], [data-pt-formal],
 * [data-pt-kid][data-mood].
 */
const NS = 'manipulation.powerTrain';
const LRI = '⁦';
const PDI = '⁩';
const iso = (s) => `${LRI}${s}${PDI}`;
const WIDE_MIN = 700;
const SIDE_W = 236;
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-indigo-300';
const minus = (s) => String(s).replace(/-/g, '−');

const CSS = `
@keyframes pt-wagon-in { from { transform: translateY(-10px); opacity: 0; } to { transform: none; opacity: 1; } }
.pt-wagon-in { animation: pt-wagon-in 260ms ease-out both; transform-box: fill-box; }
@keyframes pt-pop { 0% { transform: scale(0.7); } 70% { transform: scale(1.08); } 100% { transform: scale(1); } }
.pt-pop { animation: pt-pop 300ms ease-out both; transform-box: fill-box; transform-origin: center; display: inline-block; }
@keyframes pt-bump { 0%,100% { transform: none; } 30% { transform: translateX(-4px); } 60% { transform: translateX(4px); } }
.pt-bump { animation: pt-bump 280ms ease-in-out; }
@media (prefers-reduced-motion: reduce) { .pt-wagon-in, .pt-pop, .pt-bump { animation: none !important; } }
`;

/** Les nombres de départ : ceux de la leçon, sinon ceux du niveau (build) ou les tâches par défaut du monde `couple`. */
export function numbersFor({ world, base, targets, tasks, level }) {
  const lv = resolveLevelId(level ?? 'beginner');
  const asked = LEVELS['power-train'][lv].numbers;
  const w = world ?? asked.world;
  if (w === 'couple') {
    const p = L.PRESETS.couple[lv];
    return { world: 'couple', base: base ?? p.base, tasks: tasks ?? p.tasks };
  }
  return { world: 'build', base: base ?? asked.base, targets: targets ?? asked.targets };
}

/** « −2 », « 1/9 » → le LaTeX d'une charge. */
const loadTex = (t) => P.ratTex(P.parseRat(t));

export default function PowerTrain({
  world, base, targets, tasks, title, lead, level, levels: withLevels = true, coach: coachOn = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished, onCheckpoint,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const initialNumbers = useMemo(() => numbersFor({ world, base, targets, tasks, level }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'power-train', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nums = state.numbers;
  const numsKey = JSON.stringify(nums);
  const [lab, setLab] = useState(() => L.init(nums));
  const [scene, setScene] = useState({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: 0 });
  if (scene.key !== numsKey || scene.epoch !== state.epoch) {
    // « إعادة » (resetCount), un autre niveau ou d'autres nombres : TOUT recommence — la tâche 1, les essais et les questions du labo
    setScene({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: scene.inits + 1 });
    setLab(L.init(nums));
  }
  const W0 = lab.world;
  const advanced = resolveLevelId(state.level) === 'advanced';
  const ready = L.discoveryReady(lab);
  // les questions pendant le labo : la suite de la tâche courante ; celle qui finit par la règle remplace la découverte automatique
  const cpSettings = useLabCheckpointSettings('power-train');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const cur = L.taskOf(lab);
  const chain = cpOn && cpSettings.enabled && !L.isFree(lab) ? chainOf(lab, cur, advanced) : null;
  const ruleByCheckpoint = cpOn && cpSettings.enabled && lab.tasks.some((tk) => chainOf(lab, tk, advanced)?.includes('rule'));
  const taskReached = L.taskDone(lab);
  const cp = useLabCheckpoint({
    id: chain ? cur.id : null,
    questions: chain && taskReached ? chain.map((q) => QUESTIONS[q](lab, cur, k, advanced)) : null,
    reached: taskReached,
    resetKey: scene.inits,
    onRetry: () => setLab(L.retryTask),
    onEvent: (ev) => state.report(onCheckpoint, ev),
    onDone: (id) => { if (chainOf(lab, lab.tasks.find((tk) => tk.id === id), advanced)?.includes('rule')) { state.discover(); state.formalize(); } },
  });
  useEffect(() => { if (ready && !ruleByCheckpoint) state.discover(); }, [ready, state.epoch, ruleByCheckpoint]); // eslint-disable-line react-hooks/exhaustive-deps
  // une étape est FAITE quand sa charge est atteinte ET que ses questions sont répondues : alors la pastille passe au vert et on fête
  const stepDone = lab.tasks.map((_, i) => !!lab.done[i] && (i !== lab.ti || !cp.blocking));
  const stepper = lab.tasks.length > 1 && !L.isFree(lab) && (
    <LabStepper count={lab.tasks.length} current={lab.ti} done={stepDone} stepAttr="data-pt-step" />
  );
  const party = useStepCelebration();
  const celebrated = useRef({ inits: 0, set: new Set() });
  if (celebrated.current.inits !== scene.inits) celebrated.current = { inits: scene.inits, set: new Set() };   // « إعادة » : on refête
  const nowDone = !L.isFree(lab) && stepDone[lab.ti];
  useEffect(() => {
    if (!nowDone || celebrated.current.set.has(lab.ti)) return;
    celebrated.current.set.add(lab.ti);
    party.celebrate({ n: lab.ti + 1, total: lab.tasks.length });
  }, [nowDone, lab.ti]); // eslint-disable-line react-hooks/exhaustive-deps
  /* ── le son (muet sauf « الصوت ») : un cran à chaque wagon de plus ou de moins (plus grave en retirant), la cloche quand la charge change de signe, le drapeau quand la cible est atteinte, « over » pour un lâcher raté ── */
  const heardAt = useRef({ n: lab.n, at: 0, key: '' });
  const sfxKey = `${scene.inits}:${lab.ti}`;
  useEffect(() => {
    const h = heardAt.current;
    if (h.key !== sfxKey) { heardAt.current = { n: lab.n, at: 0, key: sfxKey }; return; }
    if (lab.n !== h.n) {
      const now = performance.now();
      if (now - h.at > 35) { playSfx('tooth', { pitch: lab.n > h.n ? 1 : 0.75 }); h.at = now; }
      if (lab.world === 'build' && P.sign(P.pow(L.baseOf(lab), lab.n)) !== P.sign(P.pow(L.baseOf(lab), h.n))) playSfx('bell');
      h.n = lab.n;
    }
  }, [lab.n, sfxKey]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const l = lab.last;
    if (!l || l.free) return;
    playSfx(l.ok ? 'flag' : 'over');
  }, [lab.trials.length]); // eslint-disable-line react-hooks/exhaustive-deps
  const finishedOnce = useRef(false);
  useEffect(() => {
    if (!ready) { finishedOnce.current = false; return; }
    if (!finishedOnce.current) { finishedOnce.current = true; state.report(onFinished, { world: W0 }); }
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps
  const reported = useRef(0);
  const nTrials = lab.trials.length;
  useEffect(() => {
    if (nTrials < reported.current) reported.current = 0;
    for (let i = reported.current; i < nTrials; i += 1) state.report(onTrial, L.trialEvidence(lab.trials[i]));
    reported.current = nTrials;
  }, [nTrials, lab.trials]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── onboarding ── */
  const coachStep = coachOn ? L.coachOf(lab) : null;
  const coach = useLabCoach({
    lab: 'power-train', step: coachStep,
    text: coachStep ? k(`coach.${coachStep.id}`) : '',
    labels: { hide: k('coach.hide'), show: k('coach.show'), ok: k('coach.ok'), stop: k('coach.stop') },
  });

  /* ── mesure ── */
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
    <ManipulationDiscovery state={state} prompt={<MathText>{k(`discovery.${discoveryKey(lab, advanced)}.prompt`)}</MathText>}
      options={discoveryOptions(lab, advanced, k)} formal={<Formal lab={lab} advanced={advanced} k={k} />} />
  );

  return (
    <ManipulationShell
      type="power-train"
      title={title ?? k(`title.${W0}`)}
      titleHidden
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      coach={coachOn ? coach : null}
      headerAction={cpOn ? cpSettings.control : null}
      guided={!!chain || ruleByCheckpoint}
      hints={[0, 1, 2].map((i) => k(`hints.${W0}.${i}`))}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      discovery={discovery}
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-sky-50/50 to-white">
        <div ref={boxRef} className="space-y-2" data-power-train data-world={W0} data-task={lab.ti}
          data-solved={ready ? 'true' : 'false'} data-layout={width >= WIDE_MIN ? 'wide' : 'narrow'}>
          <style dangerouslySetInnerHTML={{ __html: CSS }} />
          <Lab lab={lab} setLab={setLab} k={k} width={width} screenH={screenH} advanced={advanced}
            lead={state.isAuthoredLevel ? lead : null} overlay={<>{party.node}{cp.node}</>} stepsNode={stepper} blocked={cp.blocking} />
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ══════════════ Le laboratoire ══════════════ */

function Lab({ lab, setLab, k, width, screenH, advanced, lead, overlay, stepsNode, blocked }) {
  const uid = `pt${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const couple = lab.world === 'couple';
  const free = L.isFree(lab);
  const task = L.taskOf(lab);
  const a = L.baseOf(lab);
  const wide = width >= WIDE_MIN;
  const stageW = wide ? width - SIDE_W - 12 : width;
  const done = L.taskDone(lab);
  const last = lab.last;
  const onTarget = L.onTarget(lab);
  const load = P.ratText(L.loadOf(lab));
  const aTxt = minus(P.ratText(a));

  /* ── la consigne : le contexte (tous les nombres), puis UNE question ── */
  const ctx = couple
    ? k(`context.couple.${task.op}`, { a: iso(aTxt), m: iso(minus(task.m)) })
    : k(advanced ? 'context.buildAdvanced' : 'context.build', { a: iso(aTxt) });
  const context = free ? k('context.free', { a: iso(aTxt) }) : (lead || ctx);
  const question = free ? k('question.free')
    : couple ? k(`question.couple.${task.op}`, { target: iso(minus(task.target)) })
      : k('question.build', { target: iso(minus(task.target)) });
  const lit = !free && done;
  const prompt = (
    <PromptCard size={wide ? 'lg' : 'md'} aside={stepsNode || null} context={context} contextProps={{ 'data-pt-context': free ? 'free' : lab.world }}
      title={question} titleClassName={wide ? 'text-xl' : 'text-lg'} lamp={free ? null : lit ? 'on' : 'off'}
      titleProps={{ 'data-pt-prompt': free ? 'free' : lab.world, 'data-lit': lit ? 'true' : 'false' }} />
  );

  /* ── la lecture : ce que porte le train, écrit comme une puissance ── */
  const shownExp = L.exponentShown(lab);
  const readTex = couple
    ? `${P.powTex(a, task.m)} ${task.op === 'divide' ? '\\div' : '\\times'} ${P.powTex(a, lab.n)} = ${P.powTex(a, shownExp)}`
    : `${P.powTex(a, lab.n)} = ${P.ratTex(L.loadOf(lab))}`;
  const factorsLine = !couple && !advanced && lab.n !== 0 ? `${P.factorsTex(a, lab.n)} = ${P.ratTex(L.loadOf(lab))}` : null;
  const readout = (
    <LabCard className="space-y-1.5 p-3" data-pt-readout data-load={load} data-n={lab.n}>
      <p className="text-xs font-black text-indigo-900/70">{k(couple ? 'read.couple' : 'read.build')}</p>
      <div key={`${lab.n}-${lab.ti}`} className="pt-pop text-center text-2xl font-black text-indigo-950" dir="ltr"><MathText>{`$${readTex}$`}</MathText></div>
      {couple && <p className="text-center text-sm font-bold text-slate-600" dir="ltr"><MathText>{`$= ${P.ratTex(L.loadOf(lab))}$`}</MathText></p>}
      {factorsLine && <p className="text-center text-xs font-bold text-slate-600" dir="ltr" data-pt-factors><MathText>{`$${factorsLine}$`}</MathText></p>}
    </LabCard>
  );

  /* ── −/+ ── */
  const [lo, hi] = L.rangeOf(lab);
  const stepper = (
    <div data-pt-stepper>
      <StepperCard layout="row" value={minus(lab.n)} unit={null}
        onLess={() => setLab((s) => L.step(s, -1))} onMore={() => setLab((s) => L.step(s, 1))}
        lessDisabled={lab.n <= lo} moreDisabled={lab.n >= hi}
        lessLabel={k('less')} moreLabel={k('more')}
        lessProps={{ 'data-pt-less': '' }} moreProps={{ 'data-pt-more': '' }} readoutProps={{ 'data-pt-n': lab.n }}>
      </StepperCard>
      <p className="mt-1 text-center text-[11px] font-extrabold text-indigo-900/60">{k(couple ? 'stepperB' : 'stepper')}</p>
    </div>
  );

  /* ── le verdict + « التالي » ── */
  const verdictLine = (() => {
    if (!last) return k(couple ? 'idle.couple' : 'idle.build');
    if (last.free) return k('v.free', { a: iso(minus(last.base)), n: iso(minus(last.n)), load: iso(minus(last.load)) });
    if (last.ok) return couple ? k('v.rightCouple', { e: iso(minus(last.exponent)) }) : k('v.right', { load: iso(minus(last.load)) });
    return couple ? k('v.exponent', { e: iso(minus(last.exponent)) }) : k('v.load', { load: iso(minus(last.load)) });
  })();
  const vkey = !last ? '' : last.free ? 'free' : last.ok ? 'right' : 'load';
  const tone = !last ? 'indigo' : last.ok && !last.free ? 'emerald' : 'amber';
  const Icon = !last ? Hand : last.ok && !last.free ? CheckCircle2 : Sparkles;
  const canNext = L.canNext(lab) && !blocked;
  const banner = (
    <VerdictBanner tone={tone} icon={wide ? Icon : null} size="sm" className="min-h-[3.5rem]" data-pt-verdict={vkey}>
      <div className="flex items-start gap-2">
        {!wide && <StationAvatar mood={!last ? 'neutral' : onTarget ? 'proud' : 'wonder'} />}
        <div className="min-w-0 space-y-1.5">
        <p className={last ? '' : 'font-bold text-indigo-900'}>{verdictLine}</p>
        {canNext && (
          <button type="button" onClick={() => setLab(L.nextTask)} data-pt-next
            className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-2 border-emerald-600 bg-emerald-600 px-3.5 text-sm font-black text-white shadow-[0_3px_0_0_#047857] transition-all duration-150 active:translate-y-0.5 motion-reduce:transition-none ${ring}`}>
            {k('next')} <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
        </div>
      </div>
    </VerdictBanner>
  );
  const mood = !last ? 'neutral' : onTarget ? 'proud' : 'wonder';

  /* ── la scène ── */
  const stage = couple
    ? <CoupleStage lab={lab} setLab={setLab} k={k} uid={uid} width={stageW - 24} screenH={screenH} />
    : <BuildStage lab={lab} setLab={setLab} k={k} uid={uid} width={stageW - 24} screenH={screenH} advanced={advanced} onTarget={onTarget} />;
  const stageFrame = (
    <StageFrame className="min-w-0 overflow-hidden p-3" data-pt-stage>{stage}</StageFrame>
  );

  return (
    <>
      <div className="relative space-y-2.5" data-pt-glance>
        {overlay}
        {prompt}
        {wide ? (
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1 space-y-2.5">{stageFrame}{stepper}</div>
            <div className="flex shrink-0 flex-col gap-2.5" style={{ width: SIDE_W }}>
              <StationMaster k={k} mood={mood} width={SIDE_W} aTxt={aTxt} />
              {readout}
              {banner}
            </div>
          </div>
        ) : (
          <>
            {stageFrame}
            <div className="grid grid-cols-2 items-start gap-2.5">
              <div className="space-y-2">{readout}{stepper}</div>
              {banner}
            </div>
          </>
        )}
      </div>
      <FreeCard lab={lab} setLab={setLab} k={k} couple={couple} />
    </>
  );
}

/** La cheffe de gare sur le quai (KidFigure, hijab) et le panneau de la gare : elle réagit au verdict (`mood`), rien de plus. */
function StationMaster({ k, mood, width, aTxt }) {
  const h = 104;
  return (
    <LabCard className="overflow-hidden p-0" data-pt-kid data-mood={mood}>
      <svg width={width - 2} height={h} viewBox={`0 0 ${width - 2} ${h}`} aria-hidden="true" className="block">
        <rect x={0} y={0} width={width} height={h} fill="#EFF6FF" />
        <rect x={0} y={h - 16} width={width} height={16} fill="#CBD5E1" />
        <rect x={0} y={h - 18} width={width} height={3} fill="#94A3B8" />
        <rect x={width * 0.46} y={14} width={width * 0.46} height={30} rx={8} fill="#312E81" />
        <text x={width * 0.69} y={34} textAnchor="middle" fontSize={13} fontWeight={900} fill="#FFFFFF" fontFamily="ui-sans-serif, system-ui, sans-serif">{k('station')}</text>
        <rect x={width * 0.66} y={44} width={4} height={h - 62} fill="#475569" />
        <g>
          <rect x={width * 0.5} y={52} width={width * 0.38} height={24} rx={7} fill="#FEF3C7" stroke="#F59E0B" strokeWidth={1.5} />
          <text x={width * 0.69} y={69} textAnchor="middle" fontSize={13} fontWeight={900} fill="#92400E" fontFamily="ui-sans-serif, system-ui, sans-serif"
            style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{`a = ${aTxt}`}</text>
        </g>
        <KidFigure cx={width * 0.22} top={10} foot={h - 16} hairStyle="hijab" scarf="lavender" outfit="violet" skin="medium" mood={mood} />
      </svg>
    </LabCard>
  );
}

/** La cheffe de gare en médaillon (labo étroit) : la même `KidFigure`, dans le bandeau du verdict. */
function StationAvatar({ mood }) {
  return (
    <svg width={46} height={58} viewBox="0 0 46 58" aria-hidden="true" className="shrink-0" data-pt-kid data-mood={mood}>
      <circle cx={23} cy={29} r={23} fill="#EEF2FF" />
      <KidFigure cx={23} top={4} foot={56} hairStyle="hijab" scarf="lavender" outfit="violet" skin="medium" mood={mood} shadow={false} />
    </svg>
  );
}

/* ══════════════ La voie : géométrie commune ══════════════ */

/** La géométrie d'un rail de `slots` places (de `lo` à `hi`) sur `width` px. */
function railGeometry(width, lo, hi, maxH) {
  const slots = hi - lo + 1;
  const sw = width / slots;
  const h = Math.max(32, Math.min(maxH, sw * 0.8));
  const x = (kk) => (kk - lo + 0.5) * sw;
  const nOf = (px) => Math.round(px / sw - 0.5 + lo);
  return { slots, sw, h, x, nOf };
}

/** Le train dessiné sur un rail : la locomotive en 0, `n` wagons (× à droite, ÷ à gauche), charges au-dessus si `loads`. */
function TrainOnRail({ uid, g, n, a, y, loads, showLoads, pairs, glow, railKey, freshFrom }) {
  const aTxt = minus(P.ratText(a));
  const label = (kind) => (kind === 'times' ? `× ${P.sign(a) < 0 ? `(${aTxt})` : aTxt}` : `÷ ${P.sign(a) < 0 ? `(${aTxt})` : aTxt}`);
  const wagons = [];
  for (let i = 1; i <= Math.abs(n); i += 1) {
    const kk = n > 0 ? i : -i;
    const kind = n > 0 ? 'times' : 'divide';
    wagons.push(
      <Wagon key={`${railKey}-${kk}`} uid={uid} kind={kind} label={label(kind)} cx={g.x(kk)} y={y} w={g.sw} h={g.h * 0.86}
        fresh={i > freshFrom} data-pt-wagon={kk} data-kind={kind} />,
    );
  }
  const pills = [];
  if (showLoads) {
    pills.push(<SvgPill key="p0" x={g.x(0)} y={y - g.h - 14} text="1" fill="#4F46E5" size={13} pointer="down" data-pt-load={0} />);
    loads.forEach((ld, i) => {
      const kk = n > 0 ? i + 1 : -(i + 1);
      const neg = ld.startsWith('-');
      pills.push(<SvgPill key={`p${kk}`} x={g.x(kk)} y={y - g.h * 0.86 - 6} text={minus(ld)} fill={neg ? '#E11D48' : '#059669'} size={Math.min(13, Math.max(10, g.sw * 0.2))} pointer="down" data-pt-load={kk} />);
    });
  }
  const pairMarks = [];
  if (pairs && P.sign(a) < 0 && n !== 0) {
    const m = Math.abs(n);
    const s = n > 0 ? 1 : -1;
    for (let i = 1; i + 1 <= m; i += 2) {
      const x1 = g.x(s * i); const x2 = g.x(s * (i + 1));
      const cy = y + g.h * 0.32 + 8;
      pairMarks.push(
        <g key={`pair${i}`} data-pt-pair={(i - 1) / 2}>
          <path d={`M${x1} ${cy - 4} Q ${(x1 + x2) / 2} ${cy + 10} ${x2} ${cy - 4}`} fill="none" stroke="#059669" strokeWidth={2.4} strokeLinecap="round" />
          <circle cx={(x1 + x2) / 2} cy={cy + 6} r={7} fill="#059669" />
          <text x={(x1 + x2) / 2} y={cy + 10} textAnchor="middle" fontSize={11} fontWeight={900} fill="#FFFFFF" fontFamily="ui-sans-serif, system-ui, sans-serif">+</text>
        </g>,
      );
    }
    if (m % 2 === 1) {
      const xl = g.x(s * m);
      const cy = y + g.h * 0.32 + 14;
      pairMarks.push(
        <g key="alone" data-pt-alone>
          <circle cx={xl} cy={cy} r={7} fill="#E11D48" />
          <text x={xl} y={cy + 4} textAnchor="middle" fontSize={12} fontWeight={900} fill="#FFFFFF" fontFamily="ui-sans-serif, system-ui, sans-serif">−</text>
        </g>,
      );
    }
  }
  return (
    <g data-pt-rail={railKey}>
      <Locomotive uid={uid} cx={g.x(0)} y={y} w={g.sw} h={g.h} glow={glow} data-pt-loco />
      {wagons}
      {pairMarks}
      {pills}
    </g>
  );
}

/** La règle graduée sous une voie + la poignée de queue. Glisser, toucher la règle, ou le clavier (flèches, Origine/Fin). */
function RailRuler({ uid, g, n, lo, hi, y, onPreview, onRelease, k, svgRef, scale, railKey = 'main' }) {
  const [drag, setDrag] = useState(false);
  const toN = (e) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return n;
    const px = (e.clientX - rect.left) * scale;
    return Math.max(lo, Math.min(hi, g.nOf(px)));
  };
  const down = (e) => { e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId); setDrag(true); onPreview(toN(e)); };
  const move = (e) => { if (drag) onPreview(toN(e)); };
  const up = (e) => { if (!drag) return; setDrag(false); onRelease(toN(e)); };
  const key = (e) => {
    const map = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 };
    if (e.key in map) { e.preventDefault(); onRelease(Math.max(lo, Math.min(hi, n + map[e.key]))); }
    if (e.key === 'Home') { e.preventDefault(); onRelease(lo); }
    if (e.key === 'End') { e.preventDefault(); onRelease(hi); }
  };
  const ticks = [];
  for (let kk = lo; kk <= hi; kk += 1) {
    const cur = kk === n;
    ticks.push(
      <g key={kk} data-pt-tick={kk}>
        <line x1={g.x(kk)} x2={g.x(kk)} y1={y - 7} y2={y + 7} stroke={kk === 0 ? '#4338CA' : '#94A3B8'} strokeWidth={kk === 0 ? 3 : 2} strokeLinecap="round" />
        <text x={g.x(kk)} y={y + 42} textAnchor="middle" fontSize={cur ? 15 : 12} fontWeight={cur ? 900 : 700} fill={cur ? '#312E81' : '#64748B'}
          fontFamily="ui-sans-serif, system-ui, sans-serif" style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{minus(kk)}</text>
      </g>,
    );
  }
  return (
    <g>
      {/* la bande sensible : toute la règle (toucher = poser la queue ici) */}
      <rect x={0} y={y - 24} width={g.sw * (hi - lo + 1)} height={56} fill="transparent" style={{ cursor: drag ? 'grabbing' : 'pointer', touchAction: 'none' }}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} data-pt-ruler={railKey} />
      <line x1={g.x(lo)} x2={g.x(hi)} y1={y} y2={y} stroke="#C7D2FE" strokeWidth={6} strokeLinecap="round" pointerEvents="none" />
      <line x1={g.x(0)} x2={g.x(n)} y1={y} y2={y} stroke={n >= 0 ? '#F59E0B' : '#38BDF8'} strokeWidth={6} strokeLinecap="round" pointerEvents="none" />
      <g pointerEvents="none">{ticks}</g>
      <g role="slider" tabIndex={0} aria-label={k(railKey === 'B' ? 'knobAriaB' : 'knobAria')} aria-valuemin={lo} aria-valuemax={hi} aria-valuenow={n}
        aria-valuetext={minus(n)} aria-orientation="horizontal" onKeyDown={key} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
        style={{ cursor: drag ? 'grabbing' : 'grab', touchAction: 'none', outline: 'none' }} data-pt-knob={railKey} data-n={n} className="pt-knob">
        <Knob uid={uid} cx={g.x(n)} cy={y} r={22} active={drag} />
      </g>
    </g>
  );
}

/** Une fraction de la hauteur de l'écran pour la scène : petite à 768, plus haute sur un grand écran. */
const maxWagonH = (screenH) => (screenH < 700 ? 48 : screenH < 860 ? 56 : 64);

function useFresh(n, key) {
  // les wagons ajoutés DEPUIS le dernier rendu glissent (animation) ; les autres restent
  const prev = useRef({ n, key });
  const from = prev.current.key === key && Math.sign(prev.current.n) === Math.sign(n) ? Math.abs(prev.current.n) : 0;
  useEffect(() => { prev.current = { n, key }; }, [n, key]);
  return from;
}

/* ══════════════ Monde « build » ══════════════ */

function BuildStage({ lab, setLab, k, uid, width, screenH, advanced, onTarget }) {
  const svgRef = useRef(null);
  const [lo, hi] = L.rangeOf(lab);
  const W = Math.max(300, width);
  const g = railGeometry(W, lo, hi, maxWagonH(screenH));
  const pillTop = 34;
  const yB = pillTop + g.h + 16; // bas des caisses
  const railY = yB + Math.max(3.5, g.h * 0.14) * 2 + 2;
  const rulerY = railY + 36;
  const H = rulerY + 50;
  const a = L.baseOf(lab);
  const loads = L.loadsOf(lab);
  const fresh = useFresh(lab.n, `${lab.ti}-${a}`);
  const scale = useScale(svgRef, W);
  return (
    <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: W, display: 'block', margin: '0 auto', touchAction: 'pan-y' }}
      role="img" aria-label={k('stageAria', { a: P.ratText(a), n: lab.n, load: P.ratText(L.loadOf(lab)) })} data-pt-svg dir="ltr">
      <TrainDefs uid={uid} />
      <Backdrop uid={uid} width={W} height={H} railY={railY} />
      <TrainOnRail uid={uid} g={g} n={lab.n} a={a} y={yB} loads={loads} showLoads={!advanced} pairs={!advanced} glow={onTarget} railKey="main" freshFrom={fresh} />
      <RailRuler uid={uid} g={g} n={lab.n} lo={lo} hi={hi} y={rulerY} k={k} svgRef={svgRef} scale={scale}
        onPreview={(v) => setLab((s) => L.preview(s, v))} onRelease={(v) => setLab((s) => L.release(s, v))} />
    </svg>
  );
}

/** Le rapport viewBox / pixels réels (le SVG se réduit sur un écran étroit) : la main tombe sur la bonne place. */
function useScale(ref, W) {
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const measure = () => { const w = el.getBoundingClientRect().width; if (w > 0) setScale(W / w); };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [W]); // eslint-disable-line react-hooks/exhaustive-deps
  return scale;
}

/* ══════════════ Monde « couple » : deux trains, puis le train attelé ══════════════ */

function CoupleStage({ lab, setLab, k, uid, width, screenH }) {
  const svgRef = useRef(null);
  const [lo, hi] = L.rangeOf(lab);
  const W = Math.max(300, width);
  const task = L.taskOf(lab);
  const a = L.baseOf(lab);
  const g = railGeometry(W, lo, hi, Math.min(44, maxWagonH(screenH) - 8));
  const rowA = 14 + g.h + 6;
  const railA = rowA + 10;
  const rowB = railA + g.h + 26;
  const railB = rowB + 10;
  const rulerY = railB + 34;
  const merged = L.coupledOf(lab);
  const mY0 = rulerY + 62;
  const count = merged.wagons.length;
  const cw = Math.min(g.sw, (W - 96 - g.sw * 1.2) / Math.max(1, count));
  const mh = Math.max(26, Math.min(g.h, cw * 0.66));
  const mY = mY0 + mh + 6;
  const H = mY + 34;
  const fresh = useFresh(lab.n, `${lab.ti}-${a}`);
  const scale = useScale(svgRef, W);
  const aTxt = minus(P.ratText(a));
  const sgn = P.sign(a) < 0;
  const plate = (kind) => `${kind === 'times' ? '×' : '÷'} ${sgn ? `(${aTxt})` : aTxt}`;
  const tag = (x, y, text, fill) => (
    <g>
      <rect x={x} y={y - 13} width={Math.max(46, text.length * 9 + 16)} height={22} rx={11} fill={fill} />
      <text x={x + Math.max(46, text.length * 9 + 16) / 2} y={y + 3} textAnchor="middle" fontSize={12} fontWeight={900} fill="#FFFFFF" fontFamily="ui-sans-serif, system-ui, sans-serif">{text}</text>
    </g>
  );
  const x0 = 96 + g.sw * 0.5;
  return (
    <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: W, display: 'block', margin: '0 auto', touchAction: 'pan-y' }}
      role="img" aria-label={k('stageAriaCouple', { a: P.ratText(a), m: task.m, n: lab.n, e: merged.exponent })} data-pt-svg dir="ltr">
      <TrainDefs uid={uid} />
      <rect x={0} y={0} width={W} height={H} rx={18} fill={`url(#${uid}-sky)`} />
      {/* rail A */}
      <rect x={0} y={railA} width={W} height={3} rx={1.5} fill="#64748B" />
      <TrainOnRail uid={uid} g={g} n={task.m} a={a} y={rowA} loads={[]} showLoads={false} pairs={false} glow={false} railKey="A" freshFrom={Math.abs(task.m)} />
      {tag(4, 16, k('trainA'), '#312E81')}
      {/* rail B (la main) */}
      <rect x={0} y={railB} width={W} height={3} rx={1.5} fill="#64748B" />
      <TrainOnRail uid={uid} g={g} n={lab.n} a={a} y={rowB} loads={[]} showLoads={false} pairs={false} glow={false} railKey="B" freshFrom={fresh} />
      {tag(4, railA + 22, task.op === 'divide' ? k('trainBdivide') : k('trainB'), '#0F766E')}
      <RailRuler uid={uid} g={g} n={lab.n} lo={lo} hi={hi} y={rulerY} k={k} svgRef={svgRef} scale={scale} railKey="B"
        onPreview={(v) => setLab((s) => L.preview(s, v))} onRelease={(v) => setLab((s) => L.release(s, v))} />
      {/* le train attelé : A puis B (retourné si on divise) ; les paires × / ÷ s'annulent */}
      <g data-pt-merged data-exponent={merged.exponent} data-cancelled={merged.cancelled}>
        <rect x={0} y={mY + Math.max(3, mh * 0.13) * 2 + 2} width={W} height={3} rx={1.5} fill="#64748B" />
        {tag(4, mY0 - 4, k('merged'), '#4338CA')}
        <Locomotive uid={uid} cx={x0} y={mY} w={g.sw} h={mh + 4} glow={L.onTarget(lab)} />
        {merged.wagons.map((wg, i) => (
          <Wagon key={`m${i}-${wg.kind}-${wg.cancelled}`} uid={uid} kind={wg.kind} label={plate(wg.kind)} cx={x0 + g.sw * 0.55 + cw * (i + 0.5)} y={mY} w={cw} h={mh}
            faded={wg.cancelled} data-pt-merged-wagon={i} data-kind={wg.kind} data-cancelled={wg.cancelled ? 'true' : 'false'} />
        ))}
      </g>
    </svg>
  );
}

/* ══════════════ « جرّب أعدادك أنت » : toujours ouvert ══════════════ */

function FreeCard({ lab, setLab, k, couple }) {
  const free = L.isFree(lab);
  const [text, setText] = useState('');
  useEffect(() => { if (!lab.free) setText(''); }, [lab.free]);
  const bad = text !== '' && !L.parseFreeBase(text);
  const onText = (e) => {
    const raw = e.target.value.replace(/[^0-9٠-٩\-−]/g, '').slice(0, 3);
    setText(raw);
    if (L.parseFreeBase(raw)) setLab((s) => L.setFree(s, raw));
  };
  if (couple) return null;
  return (
    <LabCard className="space-y-2 border-emerald-200 bg-emerald-50/50 p-3" data-pt-free data-active={free ? 'true' : 'false'}>
      <p className="flex items-center gap-1.5 text-sm font-black text-emerald-900"><FlaskConical className="h-4 w-4" aria-hidden="true" /> {k('free.title')}</p>
      <p className="text-xs font-bold leading-snug text-slate-600">{free ? k('free.on') : k('free.hint')}</p>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs font-black text-indigo-950">
          {k('free.base')}
          <input type="text" inputMode="numeric" autoComplete="off" dir="ltr" value={text} onChange={onText} maxLength={3}
            aria-label={k('free.baseAria')} aria-invalid={bad} data-pt-free-base
            className={`h-11 w-24 rounded-xl border-2 ${bad ? 'border-rose-300' : 'border-emerald-300'} bg-white px-3 text-center text-xl font-black tabular-nums text-indigo-950 ${ring}`} />
        </label>
        {bad && <span className="text-xs font-bold text-rose-700">{k('free.bad')}</span>}
        {free && (
          <button type="button" onClick={() => setLab(L.toGuided)} data-pt-free-back
            className={`inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-emerald-200 bg-white px-3 text-xs font-bold text-emerald-900 ${ring}`}>
            <Undo2 className="h-4 w-4" aria-hidden="true" /> {k('free.back')}
          </button>
        )}
      </div>
    </LabCard>
  );
}

/* ══════════════ La découverte et la règle ══════════════ */

/** Quelle question de découverte : le signe (مبتدئ), l'inverse (متقدم), ou l'attelage. */
export const discoveryKey = (lab, advanced) => (lab.world === 'couple' ? 'couple' : advanced ? 'inverse' : 'sign');

export function discoveryOptions(lab, advanced, k) {
  const key = discoveryKey(lab, advanced);
  if (key === 'couple') {
    const w = L.coupleWitness(lab);
    return [
      { text: <MathText>{k('discovery.couple.product')}</MathText>, why: <MathText>{k('discovery.couple.whyProduct', { m: w.m, n: w.n, sum: w.sum, product: w.product })}</MathText> },
      { text: <MathText>{k('discovery.couple.right')}</MathText>, correct: true },
      { text: <MathText>{k('discovery.couple.bigger')}</MathText>, why: <MathText>{k('discovery.couple.whyBigger', { m: w.m, n: w.n, sum: w.sum })}</MathText> },
    ];
  }
  if (key === 'inverse') {
    const w = L.inverseWitness(lab);
    const a = P.baseTex(w.base);
    return [
      { text: <MathText>{k('discovery.inverse.opposite')}</MathText>, why: <MathText>{k('discovery.inverse.whyOpposite', { a, k: w.k, divide: loadTex(w.divide), opposite: loadTex(w.opposite) })}</MathText> },
      { text: <MathText>{k('discovery.inverse.right')}</MathText>, correct: true },
      { text: <MathText>{k('discovery.inverse.zero')}</MathText>, why: <MathText>{k('discovery.inverse.whyZero', { a, k: w.k, divide: loadTex(w.divide) })}</MathText> },
    ];
  }
  const w = L.parityWitness(lab);
  const a = P.baseTex(w.base);
  return [
    { text: k('discovery.sign.always'), why: <MathText>{k('discovery.sign.whyAlways', { a, n: w.even.n, load: loadTex(w.even.load) })}</MathText> },
    { text: k('discovery.sign.right'), correct: true },
    { text: k('discovery.sign.many'), why: <MathText>{k('discovery.sign.whyMany', { a, one: loadTex(w.one.load), n: w.even.n, load: loadTex(w.even.load) })}</MathText> },
  ];
}

export function Formal({ lab, advanced, k }) {
  const key = discoveryKey(lab, advanced);
  if (key === 'couple') {
    const w = L.coupleWitness(lab);
    const div = lab.tasks.find((t) => t.op === 'divide');
    const a = P.baseTex(lab.base);
    return (
      <div className="space-y-2 text-sm font-bold text-emerald-950" data-pt-formal="couple">
        <p className="text-center text-base" dir="ltr"><MathText>{`$${a}^{${w.m}} \\times ${a}^{${w.n}} = ${a}^{${w.m} + ${w.n < 0 ? `(${w.n})` : w.n}} = ${a}^{${w.sum}}$`}</MathText></p>
        {div && <p className="text-center text-base" dir="ltr"><MathText>{`$\\frac{${a}^{${div.m}}}{${a}^{${div.goal}}} = ${a}^{${div.m} - ${div.goal < 0 ? `(${div.goal})` : div.goal}} = ${a}^{${div.target}}$`}</MathText></p>}
        <p><MathText>{k('formal.couple')}</MathText></p>
      </div>
    );
  }
  const a = P.baseTex(lab.base);
  const solvedLoads = Object.values(lab.solved);
  const pos = solvedLoads.find((s) => s.n > 0 && !s.load.startsWith('-')) ?? { n: 4, load: P.ratText(P.pow(lab.base, 4)) };
  const neg = solvedLoads.find((s) => s.n > 0 && s.load.startsWith('-')) ?? { n: 3, load: P.ratText(P.pow(lab.base, 3)) };
  const inv = solvedLoads.find((s) => s.n < 0) ?? { n: -2, load: P.ratText(P.pow(lab.base, -2)) };
  return (
    <div className="space-y-2 text-sm font-bold text-emerald-950" data-pt-formal={key}>
      <p className="text-center text-base" dir="ltr"><MathText>{`$${a}^{${pos.n}} = ${P.factorsTex(lab.base, pos.n)} = ${loadTex(pos.load)}$`}</MathText></p>
      <p><MathText>{k('formal.definition')}</MathText></p>
      <p><MathText>{k('formal.sign', { a, even: pos.n, evenLoad: loadTex(pos.load), odd: neg.n, oddLoad: loadTex(neg.load) })}</MathText></p>
      <p><MathText>{k('formal.zero', { a })}</MathText></p>
      {key === 'inverse' && <p><MathText>{k('formal.inverse', { a, n: -inv.n, load: loadTex(inv.load), up: loadTex(P.ratText(P.pow(lab.base, -inv.n))) })}</MathText></p>}
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite de chaque tâche, par monde et niveau : ce que la main vient de faire avec SON train ; la dernière tâche de chaque suite de tâches finit par LA RÈGLE. */
export const CHAINS = Object.freeze({
  'build.beginner': { b0: ['wagons', 'twoWagons'], b1: ['wagons', 'flip'], b2: ['zero', 'rule'] },
  'build.advanced': { b0: ['wagons', 'flip'], b1: ['wagons', 'parity'], b2: ['divide', 'invLoad'], b3: ['divide', 'rule'] },
  'couple.beginner': { c0: ['coupleN', 'sum'], c1: ['sum', 'negN'], c2: ['sum', 'rule'] },
  'couple.advanced': { c0: ['coupleN', 'sum'], c1: ['sum', 'rule'] },
});
/** La suite de la tâche `task` du monde et du niveau courants, ou null (tâche inconnue : les indices et la progression reviennent). */
export const chainOf = (lab, task, advanced) => CHAINS[`${lab.world}.${advanced ? 'advanced' : 'beginner'}`]?.[task?.id] ?? null;

const $ = (s) => `$${s}$`;
const Cq = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
/** « -2 », « 1/9 » → « $-2$ », « $\\frac{1}{9}$ » (accepte un rationnel ou son texte). */
const tx = (r) => $(P.ratTex(typeof r === 'string' ? P.parseRat(r) : r));
const bx = (a) => $(P.baseTex(P.parseRat(String(a))));
const num = (n) => $(String(n).replace('-', '−'));
const place = (opts, want) => {
  const ci = opts.findIndex((o) => o.correct);
  const rest = opts.filter((_, i) => i !== ci);
  rest.splice(Math.min(want, rest.length), 0, opts[ci]);
  return rest;
};
const distinct = (list, count = 3) => { const seen = new Set(); const out = []; for (const x of list) { if (!seen.has(x.v)) { seen.add(x.v); out.push(x); } } return out.slice(0, count); };
const val = (a, n) => P.pow(P.parseRat(String(a)), n);

/** Chaque question est construite sur LA tâche et la base (rien n'est écrit en dur) ; `k` : les textes de `powerTrain`. */
export const QUESTIONS = {
  /* combien de wagons « × a » pour la charge cible */
  wagons: (lab, task, k) => {
    const a = lab.base; const n = task.goal;
    return {
      id: 'wagons', kind: 'number', expected: String(n), answer: <MathText>{num(n)}</MathText>,
      prompt: Cq(k, 'wagons.prompt', { load: tx(task.target), a: bx(a) }),
      hints: [Cq(k, 'wagons.hint1', { load: tx(task.target), a: bx(a) }), Cq(k, 'wagons.hint2')],
      explain: Cq(k, 'wagons.explain', { calc: $(`${P.powTex(a, n)}=${P.factorsTex(a, n)}=${P.ratTex(P.parseRat(task.target))}`), n }),
    };
  },
  /* la charge après deux wagons : un produit, pas une somme */
  twoWagons: (lab, task, k) => {
    const a = lab.base; const A = P.parseRat(a);
    const good = val(a, 2);
    const o = { a: bx(a), good: tx(good) };
    const mk = (r, why) => ({ v: P.ratText(r), text: <MathText>{tx(r)}</MathText>, ...(why ? { why } : { correct: true }) });
    const opts = distinct([
      mk(good),
      mk(P.add(A, A), Cq(k, 'twoWagons.whyAdd', { ...o, x: tx(P.add(A, A)) })),
      mk(P.neg(good), Cq(k, 'twoWagons.whyOther', { ...o, x: tx(P.neg(good)) })),
      mk(val(a, 3), Cq(k, 'twoWagons.whyOther', { ...o, x: tx(val(a, 3)) })),
    ]);
    return {
      id: 'twoWagons', kind: 'choice', cols: 3,
      prompt: Cq(k, 'twoWagons.prompt'),
      options: place(opts, (lab.ti + 1) % 3),
      hints: [Cq(k, 'twoWagons.hint1', o), Cq(k, 'twoWagons.hint2', o)],
      explain: Cq(k, 'twoWagons.explain', { ...o, calc: $(`1\\times${P.baseTex(A)}\\times${P.baseTex(A)}=${P.ratTex(good)}`) }),
    };
  },
  /* la base est négative : l'étiquette change de signe à chaque wagon */
  flip: (lab, task, k) => {
    const a = lab.base;
    const o = { a: bx(a), x1: tx(val(a, 1)), x2: tx(val(a, 2)), x3: tx(val(a, 3)) };
    const opts = [
      { text: Cq(k, 'flip.right'), correct: true },
      { text: Cq(k, 'flip.stay'), why: Cq(k, 'flip.whyStay', o) },
      { text: Cq(k, 'flip.pos'), why: Cq(k, 'flip.whyPos', o) },
    ];
    return {
      id: 'flip', kind: 'choice', cols: 1,
      prompt: Cq(k, 'flip.prompt'),
      options: place(opts, (lab.ti + 1) % 3),
      hints: [Cq(k, 'flip.hint1'), Cq(k, 'flip.hint2')],
      explain: Cq(k, 'flip.explain', o),
    };
  },
  /* le train vide porte 1 */
  zero: (lab, task, k) => {
    const a = lab.base;
    const opts = [
      { text: <MathText>{$('1')}</MathText>, correct: true },
      { text: <MathText>{$('0')}</MathText>, why: Cq(k, 'zero.whyZero') },
      { text: <MathText>{bx(a)}</MathText>, why: Cq(k, 'zero.whyBase', { a: bx(a) }) },
    ];
    return {
      id: 'zero', kind: 'choice', cols: 3,
      prompt: Cq(k, 'zero.prompt'),
      options: place(opts, (lab.ti + 2) % 3),
      hints: [Cq(k, 'zero.hint1'), Cq(k, 'zero.hint2')],
      explain: Cq(k, 'zero.explain', { calc: $(`${P.powTex(a, 0)}=1`) }),
    };
  },
  /* pair / impair */
  parity: (lab, task, k) => {
    const a = lab.base; const n = task.goal; const m = n - 1;
    const o = { n, m, load: tx(task.target), prev: tx(val(a, m)), one: tx(val(a, 1)) };
    const opts = [
      { text: Cq(k, 'parity.even'), correct: true },
      { text: Cq(k, 'parity.odd'), why: Cq(k, 'parity.whyOdd', o) },
      { text: Cq(k, 'parity.always'), why: Cq(k, 'parity.whyAlways', o) },
    ];
    return {
      id: 'parity', kind: 'choice', cols: 1,
      prompt: Cq(k, 'parity.prompt', o),
      options: place(opts, (lab.ti + 2) % 3),
      hints: [Cq(k, 'parity.hint1'), Cq(k, 'parity.hint2')],
      explain: Cq(k, 'parity.explain'),
    };
  },
  /* combien de wagons « ÷ a » */
  divide: (lab, task, k) => {
    const a = lab.base; const c = Math.abs(task.goal);
    const aT = P.baseTex(P.parseRat(a));
    return {
      id: 'divide', kind: 'number', expected: String(c), answer: <MathText>{num(c)}</MathText>,
      prompt: Cq(k, 'divide.prompt', { load: tx(task.target), a: bx(a) }),
      hints: [Cq(k, 'divide.hint1'), Cq(k, 'divide.hint2', { load: tx(task.target), a: bx(a) })],
      explain: Cq(k, 'divide.explain', { calc: $(`1${`\\div${aT}`.repeat(c)}=${P.ratTex(P.parseRat(task.target))}`), n: c }),
    };
  },
  /* la charge de wagons « ÷ » : un inverse */
  invLoad: (lab, task, k) => {
    const a = lab.base; const c = Math.abs(task.goal);
    const A = P.parseRat(a);
    const good = P.parseRat(task.target);
    const times = val(a, c);
    const o = { a: bx(a), c, good: tx(good) };
    const mk = (r, why) => ({ v: P.ratText(r), text: <MathText>{tx(r)}</MathText>, ...(why ? { why } : { correct: true }) });
    const opts = distinct([
      mk(good),
      mk(times, Cq(k, 'invLoad.whyTimes', { ...o, x: tx(times) })),
      mk(P.neg(times), Cq(k, 'invLoad.whyOther', { ...o, x: tx(P.neg(times)) })),
      mk(P.neg(good), Cq(k, 'invLoad.whyOther', { ...o, x: tx(P.neg(good)) })),
    ]);
    return {
      id: 'invLoad', kind: 'choice', cols: 3,
      prompt: Cq(k, 'invLoad.prompt', { ...o, div: $(`1${`\\div${P.baseTex(A)}`.repeat(c)}`) }),
      options: place(opts, (lab.ti + 1) % 3),
      hints: [Cq(k, 'invLoad.hint1', o), Cq(k, 'invLoad.hint2')],
      explain: Cq(k, 'invLoad.explain', { calc: $(`1${`\\div${P.baseTex(A)}`.repeat(c)}=${P.ratTex(good)}`) }),
    };
  },
  /* monde couple : combien de wagons dans le train B */
  coupleN: (lab, task, k) => {
    const n = task.goal;
    return {
      id: 'coupleN', kind: 'number', expected: String(n), answer: <MathText>{num(n)}</MathText>,
      prompt: Cq(k, 'coupleN.prompt', { m: num(task.m), target: num(task.target) }),
      hints: [Cq(k, 'coupleN.hint1'), Cq(k, 'coupleN.hint2')],
      explain: Cq(k, 'coupleN.explain', { calc: $(`${task.target}-${task.m < 0 ? `(${task.m})` : task.m}=${n}`), n }),
    };
  },
  /* monde couple : l'exposant du train attelé (somme ou différence) */
  sum: (lab, task, k) => {
    const a = lab.base; const m = task.m; const n = task.goal; const times = task.op !== 'divide';
    const e = times ? m + n : m - n;
    const p = m * n;
    const other = times ? m - n : m + n;
    const o = { m: num(m), n: num(n), e: num(e), p: num(p), x: num(other) };
    const mk = (v, why) => ({ v, text: <MathText>{num(v)}</MathText>, ...(why ? { why } : { correct: true }) });
    const opts = distinct([
      mk(e),
      mk(p, Cq(k, times ? 'sum.whyProductTimes' : 'sum.whyProductDivide', o)),
      mk(other, Cq(k, times ? 'sum.whySubWrong' : 'sum.whyAddWrong', o)),
      mk(e + 1, Cq(k, times ? 'sum.whySubWrong' : 'sum.whyAddWrong', { ...o, x: num(e + 1) })),
    ]);
    const A = P.baseTex(P.parseRat(a));
    const calc = times ? `${A}^{${m}}\\times${A}^{${n}}=${A}^{${m}+(${n})}=${A}^{${e}}` : `\\frac{${A}^{${m}}}{${A}^{${n}}}=${A}^{${m}-(${n})}=${A}^{${e}}`;
    return {
      id: 'sum', kind: 'choice', cols: 3,
      prompt: Cq(k, times ? 'sum.promptTimes' : 'sum.promptDivide', o),
      options: place(opts, (lab.ti + 2) % 3),
      hints: [Cq(k, times ? 'sum.hint1Times' : 'sum.hint1Divide'), Cq(k, times ? 'sum.hint2Times' : 'sum.hint2Divide')],
      explain: Cq(k, 'sum.explain', { calc: $(calc) }),
    };
  },
  /* monde couple : un exposant négatif = des wagons « ÷ » */
  negN: (lab, task, k) => {
    const n = task.goal;
    const o = { n: num(n), c: Math.abs(n) };
    const opts = [
      { text: Cq(k, 'negN.right'), correct: true },
      { text: Cq(k, 'negN.empty'), why: Cq(k, 'negN.whyEmpty', o) },
      { text: Cq(k, 'negN.longer'), why: Cq(k, 'negN.whyLonger', o) },
    ];
    return {
      id: 'negN', kind: 'choice', cols: 1,
      prompt: Cq(k, 'negN.prompt', o),
      options: place(opts, 1),
      hints: [Cq(k, 'negN.hint1'), Cq(k, 'negN.hint2')],
      explain: Cq(k, 'negN.explain', o),
    };
  },
  /* la règle : l'ancienne découverte, posée en dernier */
  rule: (lab, task, k, advanced) => {
    const key = discoveryKey(lab, advanced);
    return {
      id: 'rule', kind: 'choice', cols: 1,
      prompt: <MathText>{k(`discovery.${key}.prompt`)}</MathText>,
      options: place(discoveryOptions(lab, advanced, k), 2),
      hints: [Cq(k, `rule.${key}.hint1`), Cq(k, `rule.${key}.hint2`)],
      explain: <Formal lab={lab} advanced={advanced} k={k} />,
    };
  },
};
