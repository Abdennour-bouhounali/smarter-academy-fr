import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Hand, CheckCircle2, Sparkles, ChevronLeft, FlaskConical, Undo2, Eraser, Check } from 'lucide-react';
import { resolveLevelId } from '@smarter-academy/core/curriculum/manipulationLevels.js';
import * as P from '@smarter-academy/core/arithmetic/percent3.js';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import MathText from '../../components/MathText';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import { LabCard, StageFrame, PromptCard, VerdictBanner } from '../primitives/LabKit';
import { SvgPill } from '../primitives/SvgPill';
import KidFigure from '../primitives/KidFigure';
import { useLabCoach } from '../primitives/LabCoach';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import { $, Mx, spreadAll } from '../geometry/thalesCp';
import { LEVELS } from '../levels';
import * as L from '../logic/hundredGrid';

/**
 * hundred-grid — LE POURCENTAGE SOUS LA MAIN : « الصينية المئة » (3AM, unité 6 « التناسبية », درس « النسبة المئوية », 2026-10-21). La logique, exacte,
 * est dans `logic/hundredGrid.js` (sur `packages/core/arithmetic/percent3.js`, importé par chemin). Distinct de `percent-tag` (4AM : une barre continue
 * qu'on étire, la chaîne qu'on parie) : ici le stock est COUPÉ en 100 paquets égaux et la main PEINT des cases.
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. La main PEINT t cases d'une grille de 10 × 10 (glisser sur la grille, −1 / +1 / −10 / +10, les flèches, Page ↑↓, Début / Fin) ; elle écrit une réponse
 *    avant l'ouverture du panier ; « تحقّق » juge.
 * B. Un stock de x sacs coupé en 100 cases égales : une case vaut x/100 ; t cases valent x × t/100. Augmenter de t % AJOUTE t cases aux 100, diminuer
 *    en RETIRE t ; le stock entier se retrouve quand une part est t %.
 * C. Le panier se remplit en direct (taux cherché) ; sinon il reste fermé (« ؟ ») jusqu'à l'essai — la réponse écrite d'abord, le calcul ensuite.
 * D. Chaque « تحقّق » est un essai : la valeur d'une case, le nombre de cases, le panier, la réponse écrite ; deux étapes d'une chaîne reprennent le stock.
 * E. À découvrir : panier = nombre de cases × valeur d'une case = t × x/100 ; « autant de sacs que de cases » et « x − t » sont réfutés avec SES nombres.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        t % de x = t × (x/100) = x × t/100 ; a/b = t/100 ; × (1 ± t/100) pour une hausse / une baisse
 *   OBJECT         un stock de sacs de tamr sur une صينية de 100 cases égales, un panier, une gardienne de stock (KidFigure, hijab)
 *   VARIABLE       t, le nombre de cases peintes (0 … 100) ; la réponse écrite (panier, nouveau stock, stock entier)
 *   INVARIANT      la valeur d'une case (x/100) tant que le stock ne change pas ; la grille garde 100 cases
 *   TRANSFORMATION chaque case peinte entre dans le panier (of / rate), s'ajoute au stock (up) ou en sort (down)
 *   CONSTRAINT     0 ≤ t ≤ 100 ; taux entier pour une tâche `rate`
 *   RESISTANCE     une réponse fausse n'ouvre pas le « bravo » : la ligne écrit ce que la grille donnait (« كتبتَ 15 لكنّ السلّة حملت 36 ») ;
 *                  un panier trop plein / trop vide
 *   EVIDENCE       le nombre de cases, la valeur d'une case, le panier, la réponse écrite
 *   CONTRAST       t % de x / x seul ; hausse / baisse ; le taux cherché / donné ; +20 % puis −20 % ne revient pas à 200
 *   PREDICTION     la réponse écrite AVANT l'ouverture (of, change, whole)
 *   DISCOVERY      « ما العلاقة بين عدد الخانات وما تحمله السلّة ؟ »
 *   FORMALIZATION  x × t/100 ; × (1 + t/100) et × (1 − t/100)
 *   TRANSFER       « جرّب أعدادك » (son stock, toujours ouvert), les exercices et la banque
 *
 * « جرّب كل الإمكانيات » : NON (chaque « تحقّق » EST l'essai). « جرّب أعدادك » est TOUJOURS ouvert sous le labo.
 * D'UN SEUL REGARD (§8bis) : `[data-hg-glance]` enveloppe la consigne, la grille, le panier, les commandes et le verdict.
 * ONBOARDING : `coach` (défaut true) → `LabCoach` ; `logic/hundredGrid.js › coachOf` (paint · guess · go · next).
 * QUESTIONS PENDANT LE LABO (rollout lot 6, 2026-10-28) : `checkpoints` (défaut true). Après chaque tâche réussie, une suite de questions se pose PAR-DESSUS le labo
 * (`chainOf`) et retient « المهمّة التالية » : of la valeur d'une case · comment se calcule le panier · le double des cases ; rate la case · la relation part/tout · le
 * taux en fraction de 100 ; whole la case · comment retrouver le stock ; change le nombre de cases après · le multiplicateur 1 ± t/100 (ou pourquoi +t % puis −t % ne
 * ramène pas au départ) ; la DERNIÈRE tâche finit par LA RÈGLE (l'ancienne découverte). Les événements `{ tk: 'checkpoint' | 'checkpoint-done', id, … }` partent vers
 * `onTrial`. OBLIGATOIRES pour l'élève ; l'ENSEIGNANT seul peut les couper pour SON compte (interrupteur de l'en-tête) : la découverte d'avant reprend alors.
 * ÉTAPES `LabStepper` (`data-hg-step`), fête à chaque tâche finie, sons (`tooth` à chaque case, `bell` à chaque dizaine complète, `flag` réussi, `over` refusé).
 * Props : `tasks` ([{ kind, x, t, part, dir, carry }]), `level`, `levels`, `coach`, `title`, `lead`, `onTrial(event)`, `onFinished()` — par `state.report`.
 * CONTRAT DOM : [data-hundred-grid][data-task][data-solved][data-layout], [data-hg-glance], [data-hg-stage], [data-hg-grid][data-t], [data-hg-cell], [data-hg-basket]
 * [data-value][data-revealed], [data-hg-packet], [data-hg-readout], [data-hg-less10], [data-hg-less1], [data-hg-more1], [data-hg-more10], [data-hg-clear],
 * [data-hg-guess], [data-hg-go], [data-hg-next], [data-hg-verdict], [data-hg-step=<i>], [data-hg-free][data-active], [data-hg-free-x], [data-hg-free-back], [data-hg-formal].
 */
const NS = 'manipulation.hundredGrid';
const LRI = '⁦';
const PDI = '⁩';
const iso = (s) => `${LRI}${s}${PDI}`;
const fm = (v) => iso(P.text(v));
const WIDE_MIN = 700;
const SIDE_W = 232;
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-indigo-300';
const TONE = {
  paint: { fill: '#FBBF24', stroke: '#B45309', mark: null },
  up: { fill: '#34D399', stroke: '#047857', mark: '+' },
  down: { fill: '#FB7185', stroke: '#BE123C', mark: '×' },
};

const CSS = `
@keyframes hg-pop { 0% { transform: scale(0.8); } 70% { transform: scale(1.06); } 100% { transform: scale(1); } }
.hg-pop { animation: hg-pop 280ms ease-out both; display: inline-block; }
@keyframes hg-pulse { 0%,100% { opacity: .35; } 50% { opacity: 1; } }
.hg-pulse { animation: hg-pulse 1.1s ease-in-out infinite; }
.hg-cell { transition: fill 120ms ease-out; }
@media (prefers-reduced-motion: reduce) { .hg-pop, .hg-pulse { animation: none !important; } .hg-cell { transition: none !important; } }
`;

export function numbersFor({ tasks, level }) {
  const lv = resolveLevelId(level ?? 'beginner');
  const asked = LEVELS['hundred-grid'][lv].numbers;
  return { tasks: tasks ?? asked.tasks };
}

/** Le « monde » d'une tâche : sa tonalité de peinture et la clé de son contexte. */
const worldOf = (lab) => {
  if (L.isFree(lab)) return { key: 'free', tone: 'paint' };
  const t = L.taskOf(lab);
  if (t.kind === 'change') return { key: t.dir, tone: t.dir };
  return { key: t.kind, tone: 'paint' };
};

export default function HundredGrid({
  tasks, title, lead, level, levels: withLevels = true, coach: coachOn = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const initialNumbers = useMemo(() => numbersFor({ tasks, level }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'hundred-grid', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nums = state.numbers;
  const numsKey = JSON.stringify(nums);
  const [lab, setLab] = useState(() => L.init(nums));
  const [scene, setScene] = useState({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: 0 });
  if (scene.key !== numsKey || scene.epoch !== state.epoch || scene.rc !== state.resetCount) {
    // « إعادة » (resetCount), un autre niveau ou d'autres nombres : TOUT recommence — la tâche 1, les essais et les questions du labo
    setScene({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: scene.inits + 1 });
    setLab(L.init(nums));
  }
  // les questions pendant le labo : la suite de la tâche courante ; celle qui finit par la règle remplace la découverte automatique
  const cur = L.taskOf(lab);
  const cpSettings = useLabCheckpointSettings('hundred-grid');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const chain = cpOn && cpSettings.enabled && !L.isFree(lab) ? chainOf(lab) : null;
  const ruleByCheckpoint = cpOn && cpSettings.enabled && lab.tasks.some((_, i) => chainOf({ ...lab, ti: i }).includes('rule'));
  const cp = useLabCheckpoint({
    id: chain ? cur.id : null,
    questions: chain ? chain.map((q) => QUESTIONS[q](lab, k)) : null,
    reached: L.taskDone(lab),
    resetKey: scene.inits,
    onRetry: () => setLab(L.retryTask),
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: () => { if (chain?.includes('rule')) { state.discover(); state.formalize(); } },
  });
  const ready = L.discoveryReady(lab) && !ruleByCheckpoint;
  useEffect(() => { if (ready) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
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

  const coachStep = coachOn && !cp.open ? L.coachOf(lab) : null;
  const coach = useLabCoach({
    lab: 'hundred-grid', step: coachStep,
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
      type="hundred-grid"
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
        <div ref={boxRef} className="space-y-2" data-hundred-grid data-task={lab.ti}
          data-solved={ready ? 'true' : 'false'} data-layout={width >= WIDE_MIN ? 'wide' : 'narrow'}>
          <style dangerouslySetInnerHTML={{ __html: CSS }} />
          <Lab lab={lab} setLab={setLab} k={k} width={width} screenH={screenH} lead={state.isAuthoredLevel ? lead : null} cp={cp} />
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ══════════════ Le laboratoire ══════════════ */

function Lab({ lab, setLab, k, width, screenH, lead, cp }) {
  const uid = `hg${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const wide = width >= WIDE_MIN;
  const free = L.isFree(lab);
  const task = L.taskOf(lab);
  const world = worldOf(lab);
  const last = lab.last;
  const done = L.taskDone(lab);
  const lit = !free && done;
  const stock = L.stockOf(lab);
  const packet = P.packet(stock);
  const open = L.revealed(lab) || done;

  const args = free
    ? { x: fm(stock) }
    : { x: task.kind === 'whole' ? '' : fm(task.x), t: iso(task.t), part: task.part ? fm(task.part) : '' };
  const ctx = free ? k('context.free', args) : (lead || k(`context.${world.key}`, args));
  const question = free ? k('question.free') : k(`question.${world.key}`, args);
  // une étape est FAITE quand la tâche est réussie ET que ses questions sont répondues : la pastille passe au vert et on fête
  const stepDone = lab.tasks.map((_, i) => !!lab.done[i] && (i !== lab.ti || !cp.blocking));
  const steps = lab.tasks.length > 1 && !free && (
    <LabStepper count={lab.tasks.length} current={lab.ti} done={stepDone} stepAttr="data-hg-step" />
  );
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.trials.length === 0 && celebrated.current.size) celebrated.current = new Set();   // « إعادة », autre niveau : on refête
  const nowDone = !free && stepDone[lab.ti];
  useEffect(() => {
    if (!nowDone || celebrated.current.has(lab.ti)) return;
    celebrated.current.add(lab.ti);
    party.celebrate({ n: lab.ti + 1, total: lab.tasks.length });
  }, [nowDone, lab.ti]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── le son (muet sauf « الصوت ») : un déclic par case peinte (≥ 35 ms), une cloche à chaque dizaine complète, le drapeau d'une réussite, « over » d'un refus ──
  const sfx = useRef({ t: lab.t, at: 0, key: '' });
  const sfxKey = `${free ? 'free' : lab.ti}`;
  useEffect(() => {
    const p = sfx.current;
    if (p.key !== sfxKey) { sfx.current = { t: lab.t, at: 0, key: sfxKey }; return; }
    const d = lab.t - p.t;
    if (d === 0) return;
    const now = performance.now();
    if (now - p.at > 35) { playSfx('tooth', { pitch: d > 0 ? 1 : 0.75 }); p.at = now; }
    if (d > 0 && Math.floor(lab.t / 10) > Math.floor(p.t / 10)) playSfx('bell');
    p.t = lab.t;
  }, [lab.t, sfxKey]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!lab.last || lab.last.kind !== 'go') return;
    playSfx(lab.last.ok ? 'flag' : 'over');
  }, [lab.trials.length]); // eslint-disable-line react-hooks/exhaustive-deps
  const prompt = (
    <PromptCard size={wide ? 'lg' : 'md'} context={<MathText>{ctx}</MathText>} contextProps={{ 'data-hg-context': world.key }}
      title={<MathText>{question}</MathText>} titleClassName={wide ? 'text-xl' : 'text-lg'} lamp={free ? null : lit ? 'on' : 'off'}
      titleProps={{ 'data-hg-prompt': world.key, 'data-lit': lit ? 'true' : 'false' }} />
  );

  /* ── le verdict ── */
  const vv = verdictOf(lab, k);
  const canNext = L.canNext(lab) && !cp.blocking;
  const mood = !last ? 'happy' : last.ok ? 'proud' : 'wonder';
  const tone = !last ? 'indigo' : last.ok ? 'emerald' : 'amber';
  const Icon = !last ? Hand : last.ok ? CheckCircle2 : Sparkles;
  const banner = (
    <VerdictBanner tone={tone} icon={wide ? Icon : null} size="sm" className="min-h-[3.5rem]" data-hg-verdict={last ? (last.ok ? 'ok' : last.why) : ''}>
      <div className="min-w-0 space-y-1.5">
        <p className={last ? '' : 'font-bold text-indigo-900'}>{vv}</p>
        {canNext && (
          <button type="button" onClick={() => setLab(L.nextTask)} data-hg-next
            className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-2 border-emerald-600 bg-emerald-600 px-3.5 text-sm font-black text-white shadow-[0_3px_0_0_#047857] transition-all duration-150 active:translate-y-0.5 motion-reduce:transition-none ${ring}`}>
            {k('next')} <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </VerdictBanner>
  );

  // La taille d'une case : bornée par la HAUTEUR de l'écran (le bloc tient d'un seul regard) et par la LARGEUR de la colonne (grille et panier côte à côte).
  const stageW = (wide ? width - SIDE_W - 12 : width) - 28;
  const basketW = Math.min(214, Math.max(150, Math.floor(stageW * 0.38)));
  const cellByH = Math.max(15, Math.min(34, Math.floor((screenH - 560) / 10)));
  const cellByW = Math.floor((stageW - basketW - 12 - 42) / 10);
  const cell = Math.max(13, Math.min(cellByH, cellByW));
  const header = (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1" data-hg-legend>
      <p className="text-xs font-extrabold text-amber-900" data-hg-packet data-known={open ? 'true' : 'false'}>
        {open ? k('legend.cell', { v: fm(packet) }) : k('legend.unknown')}
      </p>
      {steps || null}
    </div>
  );
  const stage = (
    <div className="flex flex-nowrap items-end justify-center gap-3" data-hg-board>
      <Board lab={lab} setLab={setLab} k={k} uid={uid} cell={cell} tone={world.tone} />
      <BasketScene lab={lab} k={k} uid={uid} height={cell * 10} mood={mood} width={basketW} />
    </div>
  );
  const readout = <Readout lab={lab} k={k} />;
  const controls = <Controls lab={lab} setLab={setLab} k={k} />;

  return (
    <>
      <div className="relative space-y-2.5" data-hg-glance>
        {party.node}
        {cp.node}
        {prompt}
        {wide ? (
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <StageFrame className="min-w-0 space-y-1.5 overflow-hidden p-3" data-hg-stage>{header}{stage}{readout}</StageFrame>
              {controls}
            </div>
            <div className="flex shrink-0 flex-col gap-2.5" style={{ width: SIDE_W }}>{banner}</div>
          </div>
        ) : (
          <>
            <StageFrame className="min-w-0 space-y-1.5 overflow-hidden p-2" data-hg-stage>{header}{stage}{readout}</StageFrame>
            {controls}
            {banner}
          </>
        )}
      </div>
      <FreeCard lab={lab} setLab={setLab} k={k} />
    </>
  );
}

function verdictOf(lab, k) {
  const last = lab.last;
  const task = L.taskOf(lab);
  if (!last) return k(`idle.${L.isFree(lab) ? 'of' : task.kind === 'change' ? 'change' : task.kind}`);
  const v = iso(last.packet);
  if (last.ok) {
    if (last.tk === 'of') return k('v.okOf', { t: iso(last.t), v, part: iso(last.expected) });
    if (last.tk === 'rate') return k('v.okRate', { t: iso(last.painted), v, part: iso(last.expected) });
    if (last.tk === 'whole') return k('v.okWhole', { v, x: iso(last.expected) });
    const n = last.dir === 'up' ? 100 + last.t : 100 - last.t;
    return k(last.dir === 'up' ? 'v.okUp' : 'v.okDown', { n: iso(n), v, after: iso(last.expected) });
  }
  if (last.why === 'paint') return k('v.paint', { t: iso(last.t), p: iso(last.painted) });
  if (last.why === 'short') return k('v.short', { basket: iso(last.basket) });
  if (last.why === 'over') return k('v.over', { basket: iso(last.basket) });
  if (last.tk === 'of') return k('v.guessOf', { guess: iso(last.guess), basket: iso(last.basket), t: iso(last.t), v });
  if (last.tk === 'whole') {
    const g = Lin.parseNumber(String(last.guess).replace(',', '.'));
    return k('v.guessWhole', { guess: iso(last.guess), t: iso(last.t), pg: fm(P.partOf(g, last.t)), part: iso(task.part ? P.text(task.part) : last.part) });
  }
  const n = last.dir === 'up' ? 100 + last.t : 100 - last.t;
  return k('v.guessChange', { guess: iso(last.guess), after: iso(last.expected), n: iso(n), v });
}

/* ══════════════ La grille de 100 cases ══════════════ */

function Board({ lab, setLab, k, uid, cell, tone }) {
  const T = TONE[tone];
  const t = lab.t;
  const pad = 4;
  const labelW = 26;
  const W = pad * 2 + cell * 10 + labelW;
  const H = pad * 2 + cell * 10;
  const svgRef = useRef(null);
  const [drag, setDrag] = useState(false);
  const toT = (e) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r || r.width === 0) return t;
    const x = ((e.clientX - r.left) / r.width) * W - pad;
    const y = ((e.clientY - r.top) / r.height) * H - pad;
    const col = Math.max(0, Math.min(9, Math.floor(x / cell)));
    const row = Math.max(0, Math.min(9, Math.floor(y / cell)));
    return row * 10 + col + 1;
  };
  const down = (e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag(true);
    const n = toT(e);
    // toucher la dernière case peinte la décolore (on peut retirer d'une case)
    setLab((s) => L.setT(s, n === s.t ? n - 1 : n));
  };
  const move = (e) => { if (drag) setLab((s) => L.setT(s, toT(e))); };
  const up = () => setDrag(false);
  const key = (e) => {
    const m = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 10, PageDown: -10 };
    if (e.key in m) { e.preventDefault(); setLab((s) => L.stepT(s, m[e.key])); }
    if (e.key === 'Home') { e.preventDefault(); setLab((s) => L.setT(s, 0)); }
    if (e.key === 'End') { e.preventDefault(); setLab((s) => L.setT(s, L.MAX_T)); }
  };
  const cells = [];
  for (let i = 0; i < 100; i += 1) {
    const r = Math.floor(i / 10); const c = i % 10;
    const on = i < t;
    cells.push(
      <g key={i} data-hg-cell={i + 1} data-on={on ? 'true' : 'false'}>
        <rect className="hg-cell" x={pad + c * cell + 1} y={pad + r * cell + 1} width={cell - 2} height={cell - 2} rx={3}
          fill={on ? T.fill : '#FFFFFF'} stroke={on ? T.stroke : '#CBD5E1'} strokeWidth={on ? 1.5 : 1} />
        {on && T.mark && (
          <text x={pad + c * cell + cell / 2} y={pad + r * cell + cell / 2 + 4} textAnchor="middle" fontSize={cell * 0.62} fontWeight={900} fill="#FFFFFF">{T.mark}</text>
        )}
      </g>,
    );
  }
  const last = t > 0 ? t - 1 : null;
  return (
    <div role="slider" tabIndex={0} aria-label={k('paint.grid', { t })} aria-valuemin={0} aria-valuemax={100} aria-valuenow={t} aria-orientation="horizontal"
      data-hg-grid data-t={t} onKeyDown={key} className={`touch-none select-none rounded-xl ${ring}`} style={{ touchAction: 'none', cursor: drag ? 'grabbing' : 'pointer' }}>
      <svg ref={svgRef} width={W} height={H} viewBox={`0 0 ${W} ${H}`} dir="ltr" role="img" aria-hidden="true" style={{ display: 'block' }}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        <defs><clipPath id={`${uid}-g`}><rect x={pad} y={pad} width={cell * 10} height={cell * 10} rx={6} /></clipPath></defs>
        <rect x={pad - 2} y={pad - 2} width={cell * 10 + 4} height={cell * 10 + 4} rx={8} fill="#FFFBEB" stroke="#FCD34D" strokeWidth={2} />
        {cells}
        <line x1={pad} x2={pad + cell * 10} y1={pad + cell * 5} y2={pad + cell * 5} stroke="#B45309" strokeOpacity={0.35} strokeWidth={1.5} strokeDasharray="4 3" />
        {last != null && (
          <rect className="hg-pulse" x={pad + (last % 10) * cell} y={pad + Math.floor(last / 10) * cell} width={cell} height={cell} rx={4} fill="none" stroke="#1E1B4B" strokeWidth={2} />
        )}
        {Array.from({ length: 10 }, (_, r) => (
          <text key={r} x={pad + cell * 10 + 5} y={pad + r * cell + cell / 2 + 3.5} fontSize={9.5} fontWeight={700} fill={(r + 1) * 10 <= t ? '#92400E' : '#94A3B8'} style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{(r + 1) * 10}</text>
        ))}
      </svg>
    </div>
  );
}

/* ══════════════ Le panier et la gardienne ══════════════ */

function BasketScene({ lab, k, uid, height, mood, width = 214 }) {
  const free = L.isFree(lab);
  const task = L.taskOf(lab);
  const stock = L.stockOf(lab);
  const open = L.revealed(lab) || L.taskDone(lab);
  const change = !free && task.kind === 'change';
  const base = 100;
  const cells = change ? (task.dir === 'up' ? base + lab.t : base - lab.t) : lab.t;
  const value = change ? P.changed(stock, task.dir, lab.t) : L.basketNow(lab);
  const frac = change ? cells / 150 : lab.t / 100;
  const W = 214;
  const H = Math.max(168, (height + 8) * (214 / width));
  const bx = 112; const bw = 92; const by = H - 70; const bh = 52;
  const level = Math.max(0, Math.min(1, frac)) * (bh - 8);
  const label = change ? (task.dir === 'up' ? k('legend.stock') : k('legend.stock')) : k('legend.basket');
  const sacks = Math.min(12, Math.round(Math.max(0, Math.min(1, frac)) * 12));
  const pillText = open ? iso(P.text(value)) : '؟';
  return (
    <div data-hg-basket data-value={open ? P.text(value) : ''} data-revealed={open ? 'true' : 'false'}>
      <svg width={width} height={(H * width) / W} viewBox={`0 0 ${W} ${H}`} dir="ltr" role="img" aria-label={`${label} ${pillText}`} style={{ display: 'block' }}>
        <defs>
          <linearGradient id={`${uid}-w`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#D6A15B" /><stop offset="1" stopColor="#A9743A" /></linearGradient>
        </defs>
        <g data-deco aria-hidden="true">
          <ellipse cx={bx + bw / 2} cy={by + bh + 4} rx={bw / 2 + 8} ry={5} fill="#1E1B4B" opacity={0.1} />
        </g>
        {/* les sacs dans le panier : un repère de remplissage, jamais le nombre */}
        {Array.from({ length: sacks }, (_, i) => {
          const col = i % 4; const row = Math.floor(i / 4);
          return <ellipse key={i} cx={bx + 14 + col * 20} cy={by + 8 - row * 12 + (open ? 0 : 6)} rx={9} ry={7} fill={open ? '#92400E' : '#B8956A'} stroke="#78350F" strokeWidth={1} opacity={open ? 1 : 0.45} />;
        })}
        <path d={`M${bx - 6} ${by} L${bx + bw + 6} ${by} L${bx + bw - 6} ${by + bh} L${bx + 6} ${by + bh} Z`} fill={`url(#${uid}-w)`} stroke="#7C4A1E" strokeWidth={2} strokeLinejoin="round" />
        {[1, 2, 3].map((i) => <line key={i} x1={bx - 6 + i * 2} x2={bx + bw + 6 - i * 2} y1={by + i * 13} y2={by + i * 13} stroke="#7C4A1E" strokeOpacity={0.35} strokeWidth={1.5} />)}
        {!open && <rect x={bx - 8} y={by - 7} width={bw + 16} height={9} rx={4} fill="#7C4A1E" />}
        <rect x={bx + 4} y={by + bh - 4 - level} width={bw - 8} height={Math.max(0, level)} rx={3} fill="#F59E0B" opacity={0.25} />
        <SvgPill x={bx + bw / 2} y={by - 30} text={pillText} fill={open ? '#B45309' : '#64748B'} size={17} pointer="down" data-hg-pill />
        <text x={bx + bw / 2} y={by + bh + 18} textAnchor="middle" fontSize={11} fontWeight={800} fill="#78350F">{label}</text>
        <KidFigure cx={52} top={H - 128} foot={H - 8} hairStyle="hijab" scarf="rose" outfit="pink" skin="light" mood={mood} />
      </svg>
    </div>
  );
}

/* ══════════════ La lecture ══════════════ */

function Readout({ lab, k }) {
  const free = L.isFree(lab);
  const task = L.taskOf(lab);
  const change = !free && task.kind === 'change';
  const n = change ? (task.dir === 'up' ? 100 + lab.t : 100 - lab.t) : null;
  return (
    <div className="flex items-center justify-between gap-2 rounded-2xl border border-amber-100 bg-white px-3 py-1.5" data-hg-readout data-t={lab.t}>
      <p className="whitespace-nowrap text-xs font-extrabold text-amber-800">{k('read.cells')}</p>
      <div key={`${lab.t}-${n}`} className="hg-pop whitespace-nowrap text-lg font-black text-indigo-950" dir="ltr">
        {change ? (task.dir === 'up' ? k('read.plus', { base: 100, t: lab.t, n }) : k('read.minus', { base: 100, t: lab.t, n })) : <bdi>{lab.t}</bdi>}
      </div>
    </div>
  );
}

/* ══════════════ Les commandes ══════════════ */

function Controls({ lab, setLab, k }) {
  const free = L.isFree(lab);
  const task = L.taskOf(lab);
  const needs = L.needsGuess(lab);
  const canGo = L.canGo(lab);
  const done = L.taskDone(lab);
  const btn = `inline-flex h-11 min-w-[44px] items-center justify-center rounded-full border-2 border-amber-300 bg-white px-2.5 text-sm font-black tabular-nums text-amber-950 disabled:opacity-40 ${ring}`;
  const step = (d, id, label) => (
    <button type="button" className={btn} onClick={() => setLab((s) => L.stepT(s, d))} aria-label={label} {...{ [`data-hg-${id}`]: '' }}
      disabled={d < 0 ? lab.t <= 0 : lab.t >= L.MAX_T}>
      <bdi dir="ltr">{d > 0 ? `+${d}` : `−${-d}`}</bdi>
    </button>
  );
  return (
    <LabCard className="space-y-1.5 p-2" data-hg-controls>
      <div className="flex flex-wrap items-center justify-center gap-1.5" role="group" aria-label={k('paint.group')} data-hg-paint>
        {step(-10, 'less10', k('paint.m10'))}
        {step(-1, 'less1', k('paint.m1'))}
        <span className="inline-flex h-11 min-w-[56px] items-center justify-center rounded-2xl border-2 border-amber-400 bg-amber-100 px-3 text-xl font-black tabular-nums text-amber-950" data-hg-count aria-live="polite"><bdi dir="ltr">{lab.t}</bdi></span>
        {step(1, 'more1', k('paint.p1'))}
        {step(10, 'more10', k('paint.p10'))}
        <button type="button" className={`${btn} gap-1 text-xs`} onClick={() => setLab(L.clearT)} disabled={lab.t === 0} data-hg-clear>
          <Eraser className="h-4 w-4" aria-hidden="true" /> {k('paint.clear')}
        </button>
      </div>
      {!free && (
        <div className="flex flex-wrap items-center gap-2">
          {needs && (
            <label className="flex min-w-0 flex-1 items-center gap-2 text-xs font-black text-indigo-950">
              <span className="whitespace-nowrap">{k(`guess.${task.kind === 'change' ? task.dir : task.kind}`)}</span>
              <input type="text" inputMode="decimal" autoComplete="off" dir="ltr" value={lab.guess} onChange={(e) => setLab((s) => L.setGuess(s, e.target.value))}
                maxLength={8} aria-label={k('guess.aria')} data-hg-guess disabled={done}
                className={`h-11 w-24 min-w-0 rounded-xl border-2 border-amber-300 bg-white px-2 text-center text-xl font-black tabular-nums text-indigo-950 disabled:bg-slate-100 ${ring}`} />
            </label>
          )}
          <button type="button" onClick={() => setLab(L.go)} disabled={!canGo} data-hg-go
            className={`inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-2xl border-2 border-amber-600 bg-amber-500 px-4 text-lg font-black text-white shadow-[0_4px_0_0_#B45309] transition-all duration-150 active:translate-y-0.5 disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none motion-reduce:transition-none ${ring}`}>
            <Check className="h-5 w-5" aria-hidden="true" /> {k('go')}
          </button>
        </div>
      )}
      {free && <span className="sr-only">{k('free.on')}</span>}
    </LabCard>
  );
}

/* ══════════════ « جرّب أعدادك أنت » : toujours ouvert ══════════════ */

function FreeCard({ lab, setLab, k }) {
  const free = L.isFree(lab);
  const [text, setText] = useState('');
  useEffect(() => { if (!lab.free) setText(''); }, [lab.free]);
  const bad = text !== '' && !P.parseStock(text);
  const onText = (e) => {
    const raw = e.target.value.replace(/[^0-9٠-٩,٫.]/g, '').slice(0, 7);
    setText(raw);
    if (P.parseStock(raw)) setLab((s) => L.setFree(s, raw));
  };
  return (
    <LabCard className="space-y-2 border-emerald-200 bg-emerald-50/50 p-3" data-hg-free data-active={free ? 'true' : 'false'}>
      <p className="flex items-center gap-1.5 text-sm font-black text-emerald-900"><FlaskConical className="h-4 w-4" aria-hidden="true" /> {k('free.title')}</p>
      <p className="text-xs font-bold leading-snug text-slate-600">{free ? k('free.on') : k('free.hint')}</p>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs font-black text-indigo-950">
          {k('free.number')}
          <input type="text" inputMode="decimal" autoComplete="off" dir="ltr" value={text} onChange={onText} maxLength={7}
            aria-label={k('free.numberAria')} aria-invalid={bad} data-hg-free-x
            className={`h-11 w-28 rounded-xl border-2 ${bad ? 'border-rose-300' : 'border-emerald-300'} bg-white px-3 text-center text-xl font-black tabular-nums text-indigo-950 ${ring}`} />
        </label>
        {bad && <span className="text-xs font-bold text-rose-700">{k('free.bad')}</span>}
        {free && (
          <button type="button" onClick={() => setLab(L.toGuided)} data-hg-free-back
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
  const of = w.of ?? { t: 15, x: '240', part: '36', basket: '36' };
  const part = of.basket ?? of.part;
  const diff = P.text(Lin.sub(Lin.parseNumber(String(of.x).replace(',', '.')), of.t));
  return [
    { text: <MathText>{k('discovery.same')}</MathText>, why: <MathText>{k('discovery.whySame', { t: iso(of.t ?? of.painted), x: iso(of.x), part: iso(part) })}</MathText> },
    { text: <MathText>{k('discovery.minus')}</MathText>, why: <MathText>{k('discovery.whyMinus', { t: iso(of.t ?? of.painted), x: iso(of.x), diff: iso(diff), part: iso(part) })}</MathText> },
    { text: <MathText>{k('discovery.right')}</MathText>, correct: true },
  ];
}

export function Formal({ lab, k }) {
  const w = L.witnesses(lab);
  const of = w.of;
  return (
    <div className="space-y-2 text-sm font-bold text-emerald-950" data-hg-formal>
      <p className="text-center text-base" dir="ltr"><MathText>{'$t\\% \\text{ من } x = x \\times \\dfrac{t}{100}$'}</MathText></p>
      <p><MathText>{k('formal.rule')}</MathText></p>
      {of && <p className="text-center" dir="ltr"><MathText>{k('formal.line', { t: iso(of.t), v: iso(of.packet), part: iso(of.basket) })}</MathText></p>}
      <p className="text-center text-base" dir="ltr"><MathText>{'$x\\left(1+\\dfrac{t}{100}\\right)\\ ,\\ x\\left(1-\\dfrac{t}{100}\\right)$'}</MathText></p>
      <p><MathText>{k('formal.change')}</MathText></p>
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/**
 * La suite de questions de la tâche affichée : elle interroge ce que l'élève vient de FAIRE ; la DERNIÈRE tâche du niveau finit par la règle (`rule`,
 * l'ancienne découverte). `change` avec `carry` (+t % puis −t %) pose « pourquoi on ne revient pas au départ ».
 */
export function chainOf(lab) {
  const task = L.taskOf(lab);
  const base = {
    of: ['cell', 'basket', 'double'],
    rate: ['cell', 'ratio', 'fraction'],
    whole: ['cell', 'how'],
    change: task.carry ? ['cells', 'back'] : ['cells', 'factor'],
  }[task.kind];
  return lab.ti === lab.tasks.length - 1 ? [...base, 'rule'] : base;
}

const tx = (v) => String(v).replace('.', ',').replace(',', '{,}');
const T = (v) => $(tx(P.text(v)));
const vol = (x, y) => Lin.mul(x, y);

const RAWQ = {
  cell: (lab, k) => {
    const task = L.taskOf(lab);
    const whole = task.kind === 'whole';
    const v = P.packet(task.x);
    const o = { x: T(task.x), t: $(String(task.t)), tp: $(`${task.t}\\%`), part: T(task.part ?? P.partOf(task.x, task.t)), v: T(v) };
    return {
      id: 'cell', kind: 'number', expected: P.text(v), answer: <MathText>{o.v}</MathText>,
      prompt: Mx(k, whole ? 'cell.promptWhole' : 'cell.prompt', o),
      hints: [Mx(k, whole ? 'cell.hint1Whole' : 'cell.hint1'), Mx(k, whole ? 'cell.hint2Whole' : 'cell.hint2', o)],
      explain: Mx(k, 'cell.explain', { ...o, calc: $(whole ? `${tx(P.text(task.part))}\\div${task.t}=${tx(P.text(v))}` : `${tx(P.text(task.x))}\\div100=${tx(P.text(v))}`) }),
    };
  },
  basket: (lab, k) => {
    const task = L.taskOf(lab);
    const v = P.packet(task.x);
    const part = P.partOf(task.x, task.t);
    const o = {
      t: $(String(task.t)), tp: $(`${task.t}\\%`), x: T(task.x), v: T(v), part: T(part),
      sum: $(tx(P.text(Lin.add(v, task.t)))), diff: $(tx(P.text(Lin.sub(task.x, task.t)))),
      calc: $(`${task.t}\\times${tx(P.text(v))}=${tx(P.text(part))}`),
    };
    return {
      id: 'basket', kind: 'choice',
      prompt: Mx(k, 'basket.prompt', o),
      options: [
        { text: Mx(k, 'basket.plus'), why: Mx(k, 'basket.whyPlus', o) },
        { text: Mx(k, 'basket.times'), correct: true },
        { text: Mx(k, 'basket.minus'), why: Mx(k, 'basket.whyMinus', o) },
      ],
      hints: [Mx(k, 'basket.hint1', o), Mx(k, 'basket.hint2', o)],
      explain: Mx(k, 'basket.explain', o),
    };
  },
  double: (lab, k) => {
    const task = L.taskOf(lab);
    const v = P.packet(task.x);
    const t2 = task.t * 2;
    const ans = P.partOf(task.x, t2);
    const o = { t: $(String(task.t)), tp: $(`${task.t}\\%`), t2: $(String(t2)), v: T(v), part: T(P.partOf(task.x, task.t)), ans: T(ans), calc: $(`${t2}\\times${tx(P.text(v))}=${tx(P.text(ans))}`) };
    return {
      id: 'double', kind: 'number', expected: P.text(ans), answer: <MathText>{o.ans}</MathText>,
      prompt: Mx(k, 'double.prompt', o),
      hints: [Mx(k, 'double.hint1'), Mx(k, 'double.hint2', o)],
      explain: Mx(k, 'double.explain', o),
    };
  },
  ratio: (lab, k) => {
    const task = L.taskOf(lab);
    const o = {
      x: T(task.x), part: T(task.part), t: $(String(task.t)), tp: $(`${task.t}\\%`),
      eq: $(`\\dfrac{${tx(P.text(task.part))}}{${tx(P.text(task.x))}}=\\dfrac{${task.t}}{100}`),
      prod: $(`${tx(P.text(task.part))}\\times${tx(P.text(task.x))}=${tx(P.text(vol(task.part, task.x)))}`),
      diff: $(`${tx(P.text(task.x))}-${tx(P.text(task.part))}=${tx(P.text(Lin.sub(task.x, task.part)))}`),
    };
    return {
      id: 'ratio', kind: 'choice',
      prompt: Mx(k, 'ratio.prompt', o),
      options: [
        { text: Mx(k, 'ratio.prod'), why: Mx(k, 'ratio.whyProd', o) },
        { text: Mx(k, 'ratio.diff'), why: Mx(k, 'ratio.whyDiff', o) },
        { text: Mx(k, 'ratio.right', o), correct: true },
      ],
      hints: [Mx(k, 'ratio.hint1'), Mx(k, 'ratio.hint2', o)],
      explain: Mx(k, 'ratio.explain', o),
    };
  },
  fraction: (lab, k) => {
    const task = L.taskOf(lab);
    const o = { x: T(task.x), part: T(task.part), t: $(String(task.t)), tp: $(`${task.t}\\%`), frac: $(`\\dfrac{${tx(P.text(task.part))}}{${tx(P.text(task.x))}}`), tt: $(`\\dfrac{${task.t}}{100}`) };
    return {
      id: 'fraction', kind: 'number', expected: `${task.t}/100`, answer: <MathText>{o.tt}</MathText>,
      prompt: Mx(k, 'fraction.prompt', o),
      hints: [Mx(k, 'fraction.hint1', o), Mx(k, 'fraction.hint2', o)],
      explain: Mx(k, 'fraction.explain', o),
    };
  },
  how: (lab, k) => {
    const task = L.taskOf(lab);
    const v = P.packet(task.x);
    const o = {
      t: $(String(task.t)), tp: $(`${task.t}\\%`), part: T(task.part), x: T(task.x), v: T(v),
      tt: $(`\\dfrac{${task.t}}{100}`),
      calc: $(`${tx(P.text(task.part))}\\times${tx(P.text(Lin.div(task.t, 100)))}=${tx(P.text(Lin.mul(task.part, Lin.div(task.t, 100))))}`),
      sum: $(`${tx(P.text(task.part))}+${task.t}=${tx(P.text(Lin.add(task.part, task.t)))}`),
      back: $(`${tx(P.text(v))}\\times100=${tx(P.text(task.x))}`),
    };
    return {
      id: 'how', kind: 'choice',
      prompt: Mx(k, 'how.prompt', o),
      options: [
        { text: Mx(k, 'how.times', o), why: Mx(k, 'how.whyTimes', o) },
        { text: Mx(k, 'how.plus', o), why: Mx(k, 'how.whyPlus', o) },
        { text: Mx(k, 'how.divide', o), correct: true },
      ],
      hints: [Mx(k, 'how.hint1', o), Mx(k, 'how.hint2', o)],
      explain: Mx(k, 'how.explain', o),
    };
  },
  cells: (lab, k) => {
    const task = L.taskOf(lab);
    const up = task.dir === 'up';
    const n = up ? 100 + task.t : 100 - task.t;
    const o = { x: T(task.x), t: $(String(task.t)), tp: $(`${task.t}\\%`), n: $(String(n)), v: T(P.packet(task.x)), after: T(task.after), calc: $(up ? `100+${task.t}=${n}` : `100-${task.t}=${n}`) };
    const key = up ? 'cells.up' : 'cells.down';
    return {
      id: 'cells', kind: 'number', expected: String(n), answer: <MathText>{o.n}</MathText>,
      prompt: Mx(k, `${key}.prompt`, o),
      hints: [Mx(k, `${key}.hint1`, o), Mx(k, `${key}.hint2`, o)],
      explain: Mx(k, `${key}.explain`, o),
    };
  },
  factor: (lab, k) => {
    const task = L.taskOf(lab);
    const up = task.dir === 'up';
    const n = up ? 100 + task.t : 100 - task.t;
    const f = P.factor(task.dir, task.t);
    const g = Lin.div(task.t, 100);
    const h = P.factor(up ? 'down' : 'up', task.t);
    const o = {
      t: $(String(task.t)), tp: $(`${task.t}\\%`), n: $(String(n)), x: T(task.x), after: T(task.after), f: $(tx(P.text(f))), g: $(tx(P.text(g))), h: $(tx(P.text(h))),
      part: T(P.partOf(task.x, task.t)), calc: $(`${tx(P.text(task.x))}\\times${tx(P.text(f))}=${tx(P.text(task.after))}`),
      nn: $(`\\dfrac{${n}}{100}=${tx(P.text(f))}`),
    };
    const key = up ? 'factor.up' : 'factor.down';
    return {
      id: 'factor', kind: 'choice',
      prompt: Mx(k, `${key}.prompt`, o),
      options: [
        { text: Mx(k, 'factor.mul', { f: o.g }), why: Mx(k, `${key}.whyPart`, o) },
        { text: Mx(k, 'factor.mul', { f: o.f }), correct: true },
        { text: Mx(k, 'factor.mul', { f: o.h }), why: Mx(k, `${key}.whyOpposite`, o) },
      ],
      hints: [Mx(k, `${key}.hint1`, o), Mx(k, `${key}.hint2`, o)],
      explain: Mx(k, `${key}.explain`, o),
    };
  },
  back: (lab, k) => {
    const task = L.taskOf(lab);
    const prev = lab.tasks[lab.ti - 1];
    const inc = P.partOf(prev.x, prev.t);
    const dec = P.partOf(task.x, task.t);
    const o = {
      t1: $(String(prev.t)), t1p: $(`${prev.t}\\%`), t: $(String(task.t)), tp: $(`${task.t}\\%`), x0: T(prev.x), x: T(task.x), v0: T(P.packet(prev.x)), v: T(P.packet(task.x)),
      inc: T(inc), dec: T(dec), after: T(task.after),
    };
    return {
      id: 'back', kind: 'choice',
      prompt: Mx(k, 'back.prompt', o),
      options: [
        { text: Mx(k, 'back.smaller', o), why: Mx(k, 'back.whySmaller', o) },
        { text: Mx(k, 'back.cell', o), correct: true },
        { text: Mx(k, 'back.error'), why: Mx(k, 'back.whyError', o) },
      ],
      hints: [Mx(k, 'back.hint1'), Mx(k, 'back.hint2', o)],
      explain: Mx(k, 'back.explain', o),
    };
  },
  rule: (lab, k) => {
    const w = L.witnesses(lab);
    const of = w.of ?? { t: 15, x: '240', basket: '36' };
    return {
      id: 'rule', kind: 'choice',
      prompt: <MathText>{k('discovery.prompt')}</MathText>,
      options: discoveryOptions(lab, k),
      hints: [Mx(k, 'rule.hint1', { t: $(String(of.t ?? of.painted)), v: T(of.packet ?? '1') }), Mx(k, 'rule.hint2')],
      explain: <Formal lab={lab} k={k} />,
    };
  },
};

/** Chaque question est construite sur LES nombres de la tâche (rien n'est écrit en dur) ; la bonne réponse change de place d'une question à l'autre. */
export const QUESTIONS = spreadAll(RAWQ, (lab) => lab.ti * 5 + (L.taskOf(lab).t ?? 0));
