import React, { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Hand, CheckCircle2, Sparkles, ChevronLeft, FlaskConical, Undo2, Minus, Plus, Lightbulb } from 'lucide-react';
import { resolveLevelId } from '@smarter-academy/core/curriculum/manipulationLevels.js';
import * as F from '@smarter-academy/core/arithmetic/fourthProportional.js';
import { div as fdiv, mul as fmul } from '@smarter-academy/core/arithmetic/linear.js';
import MathText from '../../components/MathText';
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
import { MarketDefs, Backdrop, Decor, Board, PriceCard, Gauge, Ruler, Knob } from './fourthGauges/MarketArt';
import { layout, tiltOf, xOfValue, valueOfX, splitLabel } from './fourthGauges/geometry';
import { LEVELS } from '../levels';
import * as L from '../logic/fourthGauges';

/**
 * fourth-gauges — LE NOMBRE QUI MANQUE SOUS LA MAIN (2AM, unité 5 « التناسبية », درس « حساب الرابع المتناسب », 2026-10-21).
 * La logique, exacte, est dans `logic/fourthGauges.js` (sur `packages/core/arithmetic/fourthProportional.js`, importé par chemin).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. La main tient le nombre qui MANQUE dans un tableau 2×2 de cartes de prix dont les trois autres cases sont imposées : une poignée
 *    de laiton glisse sur la règle du marchand (0 … max, par pas), −/+ et les flèches (PageUp/PageDown = 10 pas, Home/End) la déplacent
 *    d'un pas, le champ numérique l'écrit (Entrée = relâchement).
 * B. Trois balances d'égalité s'inclinent SOUS le doigt, et ne s'équilibrent ensemble que pour UN seul nombre : « في الواحدة » (le prix d'une
 *    unité dans chaque colonne), « بين العمودين » (combien de fois la quantité a grandi / le prix a grandi), « الجداءان » (les produits en
 *    croix). Une lampe s'allume quand une balance est équilibrée ; elles penchent toujours du même côté (c'est la même égalité).
 * C. La résistance : (i) au niveau متقدم les balances sont VOILÉES (elles se dévoilent au relâchement) : le nombre se calcule AVANT ;
 *    (ii) une 4e balance « الفرق » (c − a contre d − b) existe dans la tâche à leurre : elle s'équilibre au MAUVAIS nombre ;
 *    (iii) en « جرّب أعدادك » un quatrième proportionnel non décimal (10/3) n'est atteint par aucun nombre de la règle.
 * D. La phase formelle (le دفتر) écrit avec SES nombres les cinq chemins (coefficient, unité, additive, multiplicative, produits en croix),
 *    une ligne n'est écrite que si ses nombres intermédiaires sont des décimaux finis à ≤ 2 chiffres, puis la règle une fois.
 * E. Les fausses conjectures sont réfutées avec SES essais (« une balance à la fois », « الفرق toujours d'accord », « ajouter la même différence »).
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        trois nombres connus ne laissent qu'UN quatrième nombre ; les chemins sont la même égalité ; la différence constante ment
 *   OBJECT         une planche de prix (tableau 2×2), UNE carte manque, trois (quatre) petites balances de laiton, une règle graduée
 *   VARIABLE       le nombre de la carte manquante (pas fixé par la tâche : 1, 0,5, 0,1, 10 …)
 *   INVARIANT      les trois autres cartes ; l'égalité a × d = b × c (la valeur juste ne dépend pas de la balance regardée)
 *   TRANSFORMATION sous le doigt les balances s'inclinent (jamais au-delà d'un cran saturé) ; une lampe s'allume à l'égalité
 *   CONSTRAINT     le trou peut être a, b, c ou d (une QUANTITÉ à trouver aussi) ; nombres strictement positifs
 *   RESISTANCE     balances voilées (متقدم) ; la balance « الفرق » qui ment (404 au lieu de 600) ; 10/3 qu'aucun nombre n'atteint
 *   EVIDENCE       l'inclinaison, la lampe, les deux nombres exacts sous chaque balance (ouverts d'un toucher) — jamais la règle
 *   CONTRAST       un trou en d, un trou en c, la balance « الفرق » ; un essai trop haut et un trop bas
 *   PREDICTION     متقدم : voilé, on calcule AVANT, la main pose, le relâchement dévoile
 *   DISCOVERY      « elles s'équilibrent ensemble et seulement pour un nombre » ; « la balance Différence ment »
 *   FORMALIZATION  les cinq chemins avec SES nombres, puis a × d = b × c une fois
 *   TRANSFER       « جرّب أعدادك » (a, b, c de l'élève, toujours ouvert), معارف, طريقة, أتمرّن, nisba-miawiya / miqyas-kharita
 *
 * « جرّب كل الإمكانيات » : NON (chaque relâchement EST l'essai). « جرّب أعدادك » est TOUJOURS ouvert sous le labo.
 *
 * D'UN SEUL REGARD (§8bis) : `[data-fg-glance]` enveloppe la consigne (contexte puis UNE question), la scène (planche, balances, règle,
 * cliente), le verdict, −/+ et « المهمة التالية ». Large (≥ 700 px) : une colonne à côté porte le verdict, −/+ et « التالي » ; étroit : ils
 * passent sous la scène (verdict d'abord, −/+ ensuite : la bulle du coach, SOUS −/+, ne cache jamais le verdict).
 *
 * ONBOARDING : `coach` (défaut true) → `LabCoach` ; `logic/fourthGauges.js › coachOf` (grab · decoy · gauge · try · next).
 *
 * QUESTIONS PENDANT LE LABO (prototype `primitives/LabCheckpoint`, déploiement lot 1, 2026-10-28) : `checkpoints` (défaut true). Après CHAQUE
 * tâche, une suite sur ce que l'élève vient de FAIRE, avec SES nombres (`chainOf`) : la valeur d'une unité dans la colonne complète · l'égalité
 * des produits en croix ; la tâche à leurre commence par « لماذا كذب ميزان الفرق » ; la dernière tâche finit par LA RÈGLE (l'ancienne
 * découverte, qui formalise). Obligatoires pour tout élève ; l'enseignant seul les coupe ; `guided` cache جرّب › اكتشف › صِغ et تلميح.
 * ÉTAPES `LabStepper` (`[data-fg-step=<i>]`) + la fête ; « إعادة » : tâche 1 ; « أعِد التجربة » : la MÊME tâche (`L.retryTask`).
 * SON (`playSfx`) : `tooth` par pas de la poignée (plus grave en arrière), `flag` tâche faite, `over` le leurre ou un relâchement faux.
 * Props (contrat fixé avec la leçon) : `world` ('market'), `tasks`, `level`, `levels`, `coach`, `title`, `lead`, `onTrial(event)`,
 * `onFinished({})` — par `state.report`.
 *
 * CONTRAT DOM : [data-fourth-gauges][data-world][data-task][data-solved][data-level][data-layout], [data-fg-glance], [data-fg-stage],
 * [data-fg-svg], [data-fg-cell=a|b|c|d][data-hole][data-value], [data-fg-knob] (role slider, aria-valuenow), [data-fg-ruler],
 * [data-fg-gauge=unit|between|cross|diff][data-state=eq|lt|gt|covered|off][data-open], [data-fg-lamp][data-lit], [data-fg-less],
 * [data-fg-more], [data-fg-stepper], [data-fg-input], [data-fg-readout][data-value], [data-fg-verdict=right|wrong|decoy|none|free|''],
 * [data-fg-prompt][data-lit], [data-fg-next], [data-fg-step=<i>][data-done], [data-fg-free][data-active], [data-fg-free-a|b|c],
 * [data-fg-free-back], [data-fg-free-note], [data-fg-formal], [data-fg-routes], [data-fg-route=<id>][data-clean], [data-fg-kid][data-mood].
 */
const NS = 'manipulation.fourthGauges';
const LRI = '⁦';
const PDI = '⁩';
const iso = (s) => `${LRI}${s}${PDI}`;
/** Un calcul entier (« 520 ÷ 4 = 130 ») : isolé LTR et insécable, pour qu'une coupure de ligne ne le sépare pas. */
const calcIso = (s) => iso(String(s).replace(/ /g, '\u00A0'));
const WIDE_MIN = 700;
const SIDE_W = 236;
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-indigo-300';

const CSS = `
@keyframes fg-pop { 0% { transform: scale(0.85); } 70% { transform: scale(1.06); } 100% { transform: scale(1); } }
.fg-pop { animation: fg-pop 240ms ease-out both; display: inline-block; }
@keyframes fg-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-1.5px); } }
.fg-bob { animation: fg-bob 3.4s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .fg-pop, .fg-bob { animation: none !important; } .fg-anim, .fg-anim * { transition: none !important; } }
`;

/** Les nombres de départ : ceux de la leçon, sinon ceux du niveau. */
export function numbersFor({ world, tasks, level }) {
  const lv = resolveLevelId(level ?? 'beginner');
  const asked = LEVELS['fourth-gauges'][lv].numbers;
  return { world: world ?? asked.world, tasks: tasks ?? asked.tasks };
}

export default function FourthGauges({
  world, tasks, title, lead, level, levels: withLevels = true, coach: coachOn = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const initialNumbers = useMemo(() => numbersFor({ world, tasks, level }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'fourth-gauges', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nums = state.numbers;
  const numsKey = JSON.stringify(nums);
  const [lab, setLab] = useState(() => L.init(nums));
  const [scene, setScene] = useState({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: 0 });
  if (scene.key !== numsKey || scene.epoch !== state.epoch) {
    // « إعادة » (resetCount), un autre niveau ou d'autres nombres : TOUT recommence — la tâche 1, les essais et les questions du labo
    setScene({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: scene.inits + 1 });
    setLab(L.init(nums));
  }
  const advanced = resolveLevelId(state.level) === 'advanced';
  const ready = L.discoveryReady(lab);
  // les questions pendant le labo : la suite de la tâche courante ; la dernière finit par la règle (elle remplace la découverte automatique)
  const cpSettings = useLabCheckpointSettings('fourth-gauges');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const cpOnNow = cpOn && cpSettings.enabled;
  const chain = cpOnNow && !L.isFree(lab) ? chainOf(lab, lab.ti) : null;
  const cp = useLabCheckpoint({
    id: chain ? L.guidedTask(lab).id : null,
    questions: chain ? chain.map((q) => QUESTIONS[q](lab, lab.ti, k, advanced)) : null,
    reached: !L.isFree(lab) && L.taskDone(lab),
    resetKey: scene.inits,
    onRetry: () => setLab(L.retryTask),
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => { if (id === lab.tasks.at(-1).id) { state.discover(); state.formalize(); } },
  });
  useEffect(() => { if (ready && !cpOnNow) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  // le son du geste (muet sans « الصوت ») : un pas de la poignée, la tâche faite, le leurre ou un relâchement faux
  const sfx = useRef({ hh: lab.hh, at: 0, last: lab.last });
  useEffect(() => {
    const p = sfx.current;
    if (lab.hh !== p.hh) {
      const now = Date.now();
      if (now - p.at > 35) { playSfx('tooth', { pitch: lab.hh > p.hh ? 1 : 0.75 }); p.at = now; }
      p.hh = lab.hh;
    }
    if (lab.last !== p.last) {
      const v = lab.last;
      p.last = v;
      if (v && v.kind === 'release' && !v.free) playSfx(v.done && lab.solved[lab.ti] === v ? 'flag' : !v.ok ? 'over' : 'tooth');
    }
  }, [lab.hh, lab.last]); // eslint-disable-line react-hooks/exhaustive-deps
  const finishedOnce = useRef(false);
  useEffect(() => {
    if (!ready) { finishedOnce.current = false; return; }
    if (!finishedOnce.current) { finishedOnce.current = true; state.report(onFinished, {}); }
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps
  const reported = useRef(0);
  const nTrials = lab.trials.length;
  useEffect(() => {
    if (nTrials < reported.current) reported.current = 0;
    for (let i = reported.current; i < nTrials; i += 1) state.report(onTrial, L.trialEvidence(lab.trials[i]));
    reported.current = nTrials;
  }, [nTrials, lab.trials]); // eslint-disable-line react-hooks/exhaustive-deps

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
  const wide = width >= WIDE_MIN;
  const stageW = Math.max(300, (wide ? width - SIDE_W - 12 : width) - 16);
  const nG = !L.isFree(lab) && L.taskOf(lab).decoy ? 4 : 3;
  const geo = useMemo(() => layout(stageW, nG), [stageW, nG]);

  /* ── onboarding ── */
  const coachStep = coachOn && !cp.open ? L.coachOf(lab, { roomy: geo.roomy }) : null;
  const coach = useLabCoach({
    lab: 'fourth-gauges', step: coachStep,
    text: coachStep ? k(`coach.${coachStep.id}`) : '',
    labels: { hide: k('coach.hide'), show: k('coach.show'), ok: k('coach.ok'), stop: k('coach.stop') },
  });

  const discovery = (
    <ManipulationDiscovery state={state} prompt={<MathText>{k(`discovery.${discoveryKey(advanced)}.prompt`)}</MathText>}
      options={discoveryOptions(lab, advanced, k)} formal={<Formal lab={lab} k={k} />} />
  );

  return (
    <ManipulationShell
      headerAction={cpSettings.control}
      type="fourth-gauges"
      title={title ?? k('title')}
      titleHidden
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      coach={coachOn ? coach : null}
      guided={cpOnNow}
      hints={[0, 1, 2].map((i) => k(`hints.${i}`))}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      discovery={discovery}
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-amber-50/60 to-white">
        <div ref={boxRef} className="space-y-2" data-fourth-gauges data-world={lab.world} data-task={lab.ti} data-level={advanced ? 'advanced' : 'beginner'}
          data-solved={ready ? 'true' : 'false'} data-layout={wide ? 'wide' : 'narrow'}>
          <style dangerouslySetInnerHTML={{ __html: CSS }} />
          <Lab lab={lab} setLab={setLab} k={k} wide={wide} width={width} stageW={stageW} geo={geo} lead={state.isAuthoredLevel ? lead : null} cp={cp} />
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ══════════════ Les mots du tableau ══════════════ */

/** Le nom, l'unité d'une ligne : « التفاح (kg) » → { name, unit }. */
const rowOf = (task, i) => splitLabel(task.rows[i]);
const withUnit = (v, u) => (u ? `${iso(v)} ${iso(u)}` : iso(v));

/** Une colonne du tableau, en mots : « التفاح 4 kg بإزاء الثمن 520 DA » ou « التفاح 6 kg بإزاء خانة ناقصة ». */
export function columnText(task, col, k) {
  const [top, bottom] = col === 0 ? ['a', 'b'] : ['c', 'd'];
  const r1 = rowOf(task, 0); const r2 = rowOf(task, 1);
  const vt = task.nums[top]; const vb = task.nums[bottom];
  if (vt != null && vb != null) return k('context.pair', { n1: r1.name, x1: withUnit(vt, r1.unit), n2: r2.name, x2: withUnit(vb, r2.unit) });
  if (vt != null) return k('context.half', { n: r1.name, x: withUnit(vt, r1.unit) });
  return k('context.half', { n: r2.name, x: withUnit(vb, r2.unit) });
}
/** Le contexte de la tâche (tous les nombres) : les deux colonnes. */
export const contextOf = (task, k, free = false) => k(free ? 'context.free' : 'context.generic', { c1: columnText(task, 0, k), c2: columnText(task, 1, k) });
/** La balance « في الواحدة » porte le nom de l'unité de la ligne 1 : le kilo, le litre… */
export function unitGaugeName(task, k) {
  const u = rowOf(task, 0).unit;
  const key = u === 'kg' ? 'kg' : u === 'L' ? 'L' : u === 'm²' ? 'm2' : 'default';
  return k(`gauges.unitBy.${key}`);
}
export const gaugeNames = (task, k) => ({ unit: unitGaugeName(task, k), between: k('gauges.between'), cross: k('gauges.cross'), diff: k('gauges.diff') });

/* ══════════════ Le laboratoire ══════════════ */

function Lab({ lab, setLab, k, wide, width, geo, lead, cp }) {
  const free = L.isFree(lab);
  const task = L.taskOf(lab);
  const done = L.taskDone(lab);
  const last = lab.last;
  const veryNarrow = width < 460;

  const ctx = contextOf(task, k, free);
  const question = free ? k('question.free') : task.decoy ? k('question.decoy') : k('question.generic');
  const stepsOn = lab.tasks.length > 1 && !free;
  // une étape est FAITE quand la tâche est réussie ET que ses questions sont répondues : la pastille passe au vert et on fête
  const stepDone = lab.tasks.map((_, i) => !!lab.done[i] && (i !== lab.ti || !cp.blocking));
  const steps = stepsOn && <LabStepper count={lab.tasks.length} current={lab.ti} done={stepDone} stepAttr="data-fg-step" />;
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.trials.length === 0 && celebrated.current.size) celebrated.current = new Set();   // L.init (« إعادة », autre niveau) : on refête
  const nowDone = !free && stepDone[lab.ti];
  useEffect(() => {
    if (!nowDone || celebrated.current.has(lab.ti)) return;
    celebrated.current.add(lab.ti);
    party.celebrate({ n: lab.ti + 1, total: lab.tasks.length });
  }, [nowDone, lab.ti]); // eslint-disable-line react-hooks/exhaustive-deps
  const lit = !free && done;
  const prompt = (
    <PromptCard size={wide ? 'lg' : 'md'} aside={veryNarrow ? null : (steps || null)} context={free ? ctx : (lead || ctx)} contextProps={{ 'data-fg-context': free ? 'free' : L.holeOf(lab) }}
      title={question} titleClassName={wide ? 'text-xl' : 'text-lg'} lamp={free ? null : lit ? 'on' : 'off'}
      titleProps={{ 'data-fg-prompt': free ? 'free' : task.decoy ? 'decoy' : 'guided', 'data-lit': lit ? 'true' : 'false' }} />
  );

  /* ── le verdict : le relâchement, en nombres, jamais la règle ── */
  const names = gaugeNames(task, k);
  const verdict = (() => {
    if (!last || last.kind !== 'release') return { text: k('idle'), key: '' , tone: 'indigo', Icon: Hand };
    const v = iso(last.value);
    if (last.free) {
      if (last.ok) return { text: k('v.freeRight', { v }), key: 'free', tone: 'emerald', Icon: CheckCircle2 };
    } else if (last.ok) {
      return last.done ? { text: k('v.right', { v }), key: 'right', tone: 'emerald', Icon: CheckCircle2 } : { text: k('v.rightNoDecoy', { v }), key: 'right', tone: 'amber', Icon: Sparkles };
    } else if (last.decoyHit) {
      const w = L.decoyWitness({ trials: [last], tasks: lab.tasks });
      return { text: k('v.decoy', { v, dlc: calcIso(w.dlc), drc: calcIso(w.drc), clc: calcIso(w.clc), crc: calcIso(w.crc) }), key: 'decoy', tone: 'amber', Icon: Lightbulb };
    }
    const g = ['unit', 'between', 'cross'].find((id) => last.detail[id]) ?? 'cross';
    const d = last.detail[g];
    return { text: k('v.wrong', { v, g: names[g], lc: calcIso(d.lc), rc: calcIso(d.rc) }), key: last.free ? 'free' : 'wrong', tone: 'amber', Icon: Sparkles };
  })();
  const good = !!last && last.kind === 'release' && last.ok && !last.free;
  const banner = (
    <VerdictBanner tone={verdict.tone} icon={verdict.Icon} size="sm" className={wide ? 'min-h-[4.6rem]' : 'min-h-[4.1rem]'} data-fg-verdict={verdict.key}>
      <p className={last ? '' : 'font-bold text-indigo-900'}>{verdict.text}</p>
    </VerdictBanner>
  );
  const canNext = L.canNext(lab) && !cp.blocking;
  const nextButton = canNext && (
    <button type="button" onClick={() => setLab(L.nextTask)} data-fg-next
      className={`inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-2xl border-2 border-emerald-600 bg-emerald-600 px-3.5 text-sm font-black text-white shadow-[0_3px_0_0_#047857] transition-all duration-150 active:translate-y-0.5 motion-reduce:transition-none ${ring}`}>
      {k('next')} <ChevronLeft className="h-4 w-4" aria-hidden="true" />
    </button>
  );
  const mood = !last || last.kind !== 'release' ? 'neutral' : last.ok ? 'happy' : 'wonder';
  const stepper = <Stepper lab={lab} setLab={setLab} k={k} />;

  return (
    <>
      <div className="relative space-y-2.5" data-fg-glance>
        {party.node}
        {cp.node}
        {prompt}
        {wide ? (
          <div className="flex items-start gap-3">
            <StageFrame className="min-w-0 flex-1 overflow-hidden p-2" data-fg-stage>
              <Stage lab={lab} setLab={setLab} k={k} geo={geo} mood={mood} lit={good && (done || !task.decoy)} names={names} />
            </StageFrame>
            <div className="flex shrink-0 flex-col gap-2.5" style={{ width: SIDE_W }}>
              {banner}
              {stepper}
              {nextButton}
            </div>
          </div>
        ) : (
          <>
            <StageFrame className="min-w-0 overflow-hidden p-2" data-fg-stage>
              {veryNarrow && steps && <div className="absolute end-3 top-2.5 z-10">{steps}</div>}
              <Stage lab={lab} setLab={setLab} k={k} geo={geo} mood={mood} lit={good && (done || !task.decoy)} names={names} />
            </StageFrame>
            <div className="space-y-2">
              {banner}
              {stepper}
              {nextButton}
            </div>
          </>
        )}
      </div>
      <FreeCard lab={lab} setLab={setLab} k={k} narrow={veryNarrow} />
    </>
  );
}

/* ══════════════ −/+ et la saisie directe ══════════════ */

function Stepper({ lab, setLab, k }) {
  const task = L.taskOf(lab);
  const unit = splitLabel(task.rows[L.holeIsQuantity(lab) ? 0 : 1]).unit;
  const text = L.hText(lab);
  const [draft, setDraft] = useState(null);
  const [bad, setBad] = useState(false);
  const commit = () => {
    const next = L.typeValue(lab, draft ?? text);
    if (next === lab) { setBad(true); return; }
    setBad(false);
    setDraft(null);
    setLab(next);
  };
  return (
    <LabCard className="flex items-center gap-2 p-2" data-fg-stepper>
      <div className="flex w-full items-center gap-2" dir="ltr">
        <RoundButton onClick={() => { setDraft(null); setBad(false); setLab((s) => L.stepBy(s, -1)); }} disabled={lab.hh <= 0} aria-label={k('less')} size={48} data-fg-less>
          <Minus className="h-6 w-6" strokeWidth={3} aria-hidden="true" />
        </RoundButton>
        <div className={`flex min-w-[104px] flex-1 items-baseline justify-center gap-1.5 rounded-2xl border bg-[#F5F6FF] px-2 py-1 ${bad ? 'border-rose-300' : 'border-indigo-100'}`} data-fg-readout data-value={text}>
          <input type="text" inputMode="decimal" autoComplete="off" dir="ltr" value={draft ?? text} aria-label={k('inputAria')} aria-invalid={bad} data-fg-input
            onFocus={(e) => { setDraft(text); e.target.select?.(); }}
            onChange={(e) => { setBad(false); setDraft(e.target.value.replace(/[^0-9٠-٩,.٫]/g, '').slice(0, 9)); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commit(); } else if (e.key === 'Escape') { setDraft(null); setBad(false); e.currentTarget.blur(); } }}
            onBlur={() => { setDraft(null); setBad(false); }}
            className={`w-full min-w-0 bg-transparent text-center font-black tabular-nums text-indigo-900 outline-none ${String(draft ?? text).length >= 5 ? 'text-xl' : String(draft ?? text).length >= 3 ? 'text-2xl' : 'text-3xl'}`} />
          {unit && <span className="shrink-0 text-base font-extrabold text-indigo-700">{unit}</span>}
        </div>
        <RoundButton primary onClick={() => { setDraft(null); setBad(false); setLab((s) => L.stepBy(s, 1)); }} disabled={lab.hh >= task.maxH} aria-label={k('more')} size={48} data-fg-more>
          <Plus className="h-6 w-6" strokeWidth={3} aria-hidden="true" />
        </RoundButton>
      </div>
    </LabCard>
  );
}

/* ══════════════ La scène : la planche, les balances, la règle ══════════════ */

/** Le rapport viewBox / pixels réels (le SVG se réduit sur un écran étroit) : la main tombe sur la bonne place. */
function useBox(ref, W, H) {
  const [box, setBox] = useState({ sx: 1, sy: 1 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const measure = () => { const r = el.getBoundingClientRect(); if (r.width > 0 && r.height > 0) setBox({ sx: W / r.width, sy: H / r.height }); };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [W, H]); // eslint-disable-line react-hooks/exhaustive-deps
  return box;
}

const numberOf = (p) => (p == null ? 0 : p.n / p.d);

/** Les données de dessin d'une balance (inclinaison, nombres, disques) pour l'état du labo. */
export function gaugeView(lab, id, shown, names, k, compact = false) {
  if (!shown) return { id, name: names[id], state: 'covered', deg: 0, left: '؟', right: '؟', capL: '', capR: '', dL: 6, dR: 6 };
  const g = shown[id];
  if (g.state === 'off') return { id, name: names[id], state: 'off', deg: 0, left: '—', right: '—', capL: '', capR: '', dL: 5, dR: 5 };
  const lv = numberOf(g.left.value); const rv = numberOf(g.right.value);
  const big = Math.max(lv, rv) || 1;
  const sp = compact ? '\u200A' : ' ';
  const cap = (s) => `${F.showValue(s.x)}${sp}${s.op}${sp}${F.showValue(s.y)}`;
  return {
    id, name: names[id], state: g.state, deg: tiltOf(g.state, lv, rv),
    left: F.sideText(g.left), right: F.sideText(g.right), capL: cap(g.left), capR: cap(g.right),
    dL: Math.max(4, 8.5 * (lv / big)), dR: Math.max(4, 8.5 * (rv / big)),
  };
}

function Stage({ lab, setLab, k, geo, mood, lit, names }) {
  const uid = `fg${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const svgRef = useRef(null);
  const { W, H } = geo;
  const { sx } = useBox(svgRef, W, H);
  const [drag, setDrag] = useState(false);
  const task = L.taskOf(lab);
  const free = L.isFree(lab);
  const shown = L.gaugesShown(lab);
  const hText = L.hText(lab);
  const xKnob = xOfValue(geo, lab.hh, task.maxH);

  const toH = (e) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return lab.hh;
    return valueOfX(geo, (e.clientX - rect.left) * sx, task.maxH);
  };
  const down = (e) => { e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId); setDrag(true); setLab((s) => L.preview(s, toH(e))); };
  const move = (e) => { if (drag) setLab((s) => L.preview(s, toH(e))); };
  const up = (e) => { if (!drag) return; setDrag(false); setLab((s) => L.release(s, toH(e), 'drag')); };
  const key = (e) => {
    if (['ArrowRight', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(e.key)) { e.preventDefault(); setLab((s) => L.keyRelease(s, e.key)); }
  };

  const ids = ['unit', 'between', 'cross', ...(!free && task.decoy ? ['diff'] : [])];
  const values = { a: task.nums.a, b: task.nums.b, c: task.nums.c, d: task.nums.d };
  values[task.hole] = hText;

  return (
    <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: W, display: 'block', margin: '0 auto', touchAction: 'pan-y' }}
      role="img" aria-label={k('stageAria', { hole: task.hole, v: hText })} data-fg-svg dir="ltr">
      <MarketDefs uid={uid} />
      <Backdrop uid={uid} geo={geo} />
      <Decor geo={geo} uid={uid} />
      <Board geo={geo} rows={task.rows} uid={uid} />
      {['a', 'b', 'c', 'd'].map((c) => <PriceCard key={c} cell={geo.cells[c]} k={c} value={values[c]} hole={task.hole === c} lit={task.hole === c && lit} />)}
      {ids.map((id, i) => {
        const v = gaugeView(lab, id, shown, names, k, geo.compact);
        return (
          <Gauge key={id} uid={uid} geo={geo} slot={geo.gauges[i]} id={id} name={v.name} state={v.state} deg={v.deg} leftText={v.left} rightText={v.right}
            capL={v.capL} capR={v.capR} open={!!lab.opened[id]} discL={v.dL} discR={v.dR} ariaLabel={k('gaugeAria', { g: v.name })}
            onToggle={() => setLab((s) => L.toggleGauge(s, id))} />
        );
      })}
      <Ruler geo={geo} uid={uid} maxText={F.decimalText(F.fromHundredths(task.maxH), 2)} active={drag} fillX={xKnob} />
      {/* la bande sensible : toute la règle (toucher = poser la poignée ici) */}
      <rect x={geo.ruler.x0} y={geo.ruler.y0 - 2} width={geo.ruler.x1 - geo.ruler.x0} height={geo.ruler.y1 - geo.ruler.y0 + 2} fill="transparent"
        style={{ cursor: drag ? 'grabbing' : 'pointer', touchAction: 'none' }} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} data-fg-ruler />
      <g className="fg-anim">
        <Knob uid={uid} x={xKnob} y={geo.ruler.trackY} active={drag} lit={lit}
          knobProps={{
            role: 'slider', tabIndex: 0, 'aria-label': k('knobAria'), 'aria-valuemin': 0, 'aria-valuemax': task.maxH / 100, 'aria-valuenow': lab.hh / 100,
            'aria-valuetext': hText, 'aria-orientation': 'horizontal', onKeyDown: key, onPointerDown: down, onPointerMove: move, onPointerUp: up, onPointerCancel: up,
            style: { cursor: drag ? 'grabbing' : 'grab', touchAction: 'none', outline: 'none' },
          }} />
      </g>
      <KidFigure cx={geo.kid.cx} top={geo.kid.top} foot={geo.kid.foot} hairStyle="hijab" scarf="rose" outfit="teal" skin="wheat" mood={mood} data-fg-kid data-mood={mood} />
    </svg>
  );
}

/* ══════════════ « جرّب أعدادك أنت » : toujours ouvert ══════════════ */

function FreeCard({ lab, setLab, k, narrow }) {
  const free = L.isFree(lab);
  const [txt, setTxt] = useState({ a: '', b: '', c: '' });
  useEffect(() => { if (!lab.free) setTxt({ a: '', b: '', c: '' }); }, [lab.free]);
  const filled = txt.a !== '' && txt.b !== '' && txt.c !== '';
  const parsed = L.freeFrom(txt.a, txt.b, txt.c);
  const bad = filled && !parsed;
  const onText = (key) => (e) => {
    const raw = e.target.value.replace(/[^0-9٠-٩,.٫]/g, '').slice(0, 7);
    const next = { ...txt, [key]: raw };
    setTxt(next);
    if (next.a && next.b && next.c) setLab((s) => L.setFree(s, next.a, next.b, next.c));
  };
  const inexact = L.freeInexact(lab);
  const field = (key, label, aria) => (
    <label className="flex items-center gap-2 text-xs font-black text-indigo-950">
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-sm text-white" dir="ltr">{label}</span>
      <input type="text" inputMode="decimal" autoComplete="off" dir="ltr" value={txt[key]} onChange={onText(key)} maxLength={7} aria-label={aria} aria-invalid={bad}
        {...{ [`data-fg-free-${key}`]: '' }}
        className={`h-11 w-24 rounded-xl border-2 ${bad ? 'border-rose-300' : 'border-emerald-300'} bg-white px-2 text-center text-xl font-black tabular-nums text-indigo-950 ${ring}`} />
    </label>
  );
  return (
    <LabCard className="mt-2.5 space-y-2 border-emerald-200 bg-emerald-50/50 p-3" data-fg-free data-active={free ? 'true' : 'false'}>
      <p className="flex items-center gap-1.5 text-sm font-black text-emerald-900"><FlaskConical className="h-4 w-4" aria-hidden="true" /> {k('free.title')}</p>
      <p className="text-xs font-bold leading-snug text-slate-600">{free ? k('free.on') : k('free.hint')}</p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2" data-narrow={narrow ? 'true' : 'false'}>
        {field('a', 'a', k('free.aAria'))}
        {field('b', 'b', k('free.bAria'))}
        {field('c', 'c', k('free.cAria'))}
        {free && (
          <button type="button" onClick={() => { setTxt({ a: '', b: '', c: '' }); setLab(L.toGuided); }} data-fg-free-back
            className={`inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-emerald-200 bg-white px-3 text-xs font-bold text-emerald-900 ${ring}`}>
            <Undo2 className="h-4 w-4" aria-hidden="true" /> {k('free.back')}
          </button>
        )}
      </div>
      {bad && <p className="text-xs font-bold text-rose-700">{k('free.bad')}</p>}
      {inexact && (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm font-black text-amber-900" data-fg-free-note={inexact.finite ? 'fine' : 'infinite'}>
          {k(inexact.finite ? 'free.fine' : 'free.infinite', { f: iso(inexact.text) })}
        </p>
      )}
    </LabCard>
  );
}

/* ══════════════ La découverte et la règle ══════════════ */

/** Quelle question de découverte : « ماذا تلاحظ على الموازين » (مبتدئ) ou « لماذا لا يكفي جمع الفرق نفسه » (متقدم). */
export const discoveryKey = (advanced) => (advanced ? 'add' : 'together');

export function discoveryOptions(lab, advanced, k) {
  if (advanced) {
    const w = L.addWitness(lab);
    const n = { a: iso(w.a), c: iso(w.c), w: iso(w.w), b: iso(w.b), naive: iso(w.naive), good: iso(w.good) };
    return [
      { text: k('discovery.add.enough'), why: k('discovery.add.whyEnough', n) },
      { text: k('discovery.add.multiply'), correct: true },
      { text: k('discovery.add.same'), why: k('discovery.add.whySame', n) },
    ];
  }
  const r = L.rightWitness(lab);
  const d = L.decoyWitness(lab);
  return [
    { text: k('discovery.together.one'), why: k('discovery.together.whyOne', { v: iso(r.v), l: iso(r.l) }) },
    { text: k('discovery.together.all'), correct: true },
    { text: k('discovery.together.diff'), why: k('discovery.together.whyDiff', { v: iso(d.v), dl: iso(d.dl), cl: iso(d.cl), cr: iso(d.cr) }) },
  ];
}

const stepText = (s) => `${s.x} ${s.op} ${s.y} = ${s.r}`;

/** Le دفتر : les cinq chemins avec SES nombres (les lignes non propres manquent), puis a × d = b × c une fois. */
export function Formal({ lab, k }) {
  const { task, r, table } = L.formalOf(lab);
  const clean = F.ROUTES.filter((id) => r.routes[id].clean);
  const missing = F.ROUTES.filter((id) => !r.routes[id].clean);
  const cross = F.gauge('cross', task.hole, task.nums, F.parse(task.answer));
  return (
    <div className="space-y-2 text-sm font-bold text-emerald-950" data-fg-formal={task.hole}>
      <p>{k('formal.intro', { h: iso(r.answerText) })}</p>
      <ul className="space-y-1.5" data-fg-routes>
        {clean.map((id) => (
          <li key={id} data-fg-route={id} data-clean="true" className="rounded-xl bg-white/70 px-3 py-1.5">
            <span className="font-black text-emerald-800">{k(`formal.routes.${id}`)}</span>{' : '}
            {r.routes[id].steps.map((st, i) => (
              <React.Fragment key={i}>
                {i > 0 && ` ${k('formal.then')} `}
                <bdi dir="ltr" className="inline-block whitespace-nowrap tabular-nums">{stepText(st)}</bdi>
              </React.Fragment>
            ))}
          </li>
        ))}
      </ul>
      {missing.length > 0 && (
        <p className="rounded-xl bg-amber-50 px-3 py-1.5 text-amber-900" data-fg-missing={missing.join(',')}>
          {k('formal.missing', { routes: missing.map((id) => k(`formal.routes.${id}`)).join(' ، ') })}
        </p>
      )}
      <p className="text-center text-base" dir="ltr" data-fg-cross>
        <bdi className="tabular-nums">{`${table.a} × ${table.d} = ${table.b} × ${table.c}  (${F.showValue(cross.left.value)})`}</bdi>
      </p>
      <p>{k('formal.cross')}</p>
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite d'une tâche : le leurre d'abord s'il y en a un, puis l'unité et l'égalité des produits ; la dernière tâche finit par la règle. */
export function chainOf(lab, i) {
  const t = lab.tasks[i];
  const base = t.decoy ? ['decoy', 'unit', 'cross'] : ['unit', 'cross'];
  return i === lab.tasks.length - 1 ? [...base, 'rule'] : base;
}

const tx = (v) => String(v).replace(',', '{,}');
const Mq = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const opt = (texts, right, whys) => texts.map((text, i) => (i === right ? { text, correct: true } : { text, why: whys[i] }));
/** Le tableau complet de la tâche (la case trouvée remplie) et la valeur d'UNE unité de la ligne 1 dans la colonne complète. */
function tableOf(t) {
  const full = { ...t.nums, [t.hole]: t.answer };
  const col = t.hole === 'c' || t.hole === 'd' ? ['a', 'b'] : ['c', 'd'];
  const unit = fdiv(F.parse(full[col[1]]), F.parse(full[col[0]]));
  return { full, col, unit: F.showValue(unit) };
}

/** Chaque question est construite sur LES nombres de la tâche (rien en dur). */
export const QUESTIONS = {
  unit: (lab, i, k) => {
    const t = lab.tasks[i];
    const { full, col, unit } = tableOf(t);
    const r1 = splitLabel(t.rows[0]); const r2 = splitLabel(t.rows[1]);
    const o = { n1: r1.name, u1: r1.unit ? iso(r1.unit) : '', n2: r2.name, q: iso(full[col[0]]), p: iso(full[col[1]]), calc: calcIso(`${full[col[1]]} ÷ ${full[col[0]]} = ${unit}`) };
    return {
      id: 'unit', kind: 'number', expected: unit.replace(',', '.'), answer: <bdi dir="ltr">{unit}</bdi>,
      prompt: Mq(k, 'unit.prompt', o), hints: [Mq(k, 'unit.hint1', o), Mq(k, 'unit.hint2', o)], explain: Mq(k, 'unit.explain', o),
    };
  },
  cross: (lab, i, k) => {
    const t = lab.tasks[i];
    const { a, b, c, d } = tableOf(t).full;
    const prod = F.showValue(fmul(F.parse(a), F.parse(d)));
    const o = { a: iso(a), b: iso(b), c: iso(c), d: iso(d), prod: iso(prod) };
    const $ = (x) => <MathText key={x}>{`$${x}$`}</MathText>;
    return {
      id: 'cross', kind: 'choice', cols: 3, prompt: Mq(k, 'cross.prompt', o),
      options: opt([$(`${tx(a)}\\times ${tx(d)}=${tx(b)}\\times ${tx(c)}`), $(`${tx(a)}\\times ${tx(b)}=${tx(c)}\\times ${tx(d)}`), $(`${tx(c)}-${tx(a)}=${tx(d)}-${tx(b)}`)], 0,
        [null, Mq(k, 'cross.whySameCol', o), Mq(k, 'cross.whyDiff', o)]),
      hints: [Mq(k, 'cross.hint1'), Mq(k, 'cross.hint2', o)], explain: Mq(k, 'cross.explain', { ...o, calc: calcIso(`${a} × ${d} = ${b} × ${c} = ${prod}`) }),
    };
  },
  decoy: (lab, i, k) => {
    const t = lab.tasks[i];
    const r2 = splitLabel(t.rows[1]);
    const o = { v: iso(t.decoyText), good: iso(t.answer), n2: r2.name };
    return {
      id: 'decoy', kind: 'choice', prompt: Mq(k, 'decoy.prompt', o),
      options: opt([Mq(k, 'decoy.good', o), Mq(k, 'decoy.lie', o), Mq(k, 'decoy.both', o)], 0, [null, Mq(k, 'decoy.whyLie', o), Mq(k, 'decoy.whyBoth', o)]),
      hints: [Mq(k, 'decoy.hint1', o), Mq(k, 'decoy.hint2')], explain: Mq(k, 'decoy.explain', o),
    };
  },
  rule: (lab, i, k, advanced) => ({
    id: 'rule', kind: 'choice', prompt: <MathText>{k(`discovery.${discoveryKey(advanced)}.prompt`)}</MathText>,
    options: discoveryOptions(lab, advanced, k).map((o) => ({ ...o, text: <MathText>{o.text}</MathText>, why: o.why && <MathText>{o.why}</MathText> })),
    hints: [Mq(k, `rule.${discoveryKey(advanced)}.hint1`), Mq(k, `rule.${discoveryKey(advanced)}.hint2`)],
    explain: <Formal lab={lab} k={k} />,
  }),
};
