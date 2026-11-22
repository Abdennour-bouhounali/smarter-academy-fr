import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Sparkles, Hand, FlaskConical, Undo2, RotateCcw, ChevronLeft, ShieldAlert, Plus, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { resolveLevelId } from '@smarter-academy/core/curriculum/manipulationLevels.js';
import * as T from '@smarter-academy/core/arithmetic/tenPowers.js';
import MathText from '../../components/MathText';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import { LabCard, StageFrame, PromptCard, VerdictBanner } from '../primitives/LabKit';
import KidFigure from '../primitives/KidFigure';
import { useLabCoach } from '../primitives/LabCoach';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import { LEVELS } from '../levels';
import * as L from '../logic/unitLadder';
import { CSS, COL, PAD, H, Y_RULER, Y_BAND, Y_TOTAL, xOf, widthOf, Ruler, Plaque, Band, tenSup, factorLabel } from './unitLadder/art';

/**
 * unit-ladder — LA RÈGLE QUI CONVERTIT : « مسطرة التحويل » (3AM, unité 3 « القوى ذات أسس نسبية صحيحة », درس « قواعد الحساب على قوى العدد 10 », 2026-10-26).
 * La logique, exacte, est dans `logic/unitLadder.js` (sur `packages/core/arithmetic/tenPowers.js`, importé PAR CHEMIN) ; le dessin dans `unitLadder/art.jsx`.
 * Distinct de `power-train` (la main BÂTIT un produit facteur par facteur et un quotient annule des wagons), `decimal-comma` (une virgule déplacée dans une chaîne de
 * chiffres) et `ruler-compare` (comparer deux sauts) : ici aucun facteur n'est bâti, aucun chiffre n'est écrit — la main TEND un ruban entre deux marques d'unités et lit
 * la DISTANCE en colonnes ; le mode change la règle. Geste : TENDRE un ruban entre deux marques (glisser, toucher une plaque, flèches) — aucun des autres labs.
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. La main tire la poignée libre d'un ruban vers une plaque (glisser, toucher la plaque, ‹ ›, flèches) ; en متقدم elle CHOISIT le mode (طول · مساحة · حجم) ; puis « ثبّت الشريط ».
 * B. Le ruban compte les colonnes qu'il traverse (k, signé) et écrit le facteur en décimal ; deux rubans enchaînés laissent le total en pointillé ; une extrémité au milieu d'une plaque ou le mauvais mode est REFUSÉ avec le calcul.
 * C. La règle ne change jamais de colonne : seul le pavage des plaques change avec le mode (1, 2 ou 3 colonnes par unité) ; vers une plus petite unité le ruban est rouge (k > 0), vers une plus grande bleu (k < 0).
 * D. Chaque ruban, prédiction et verdict est un essai jugé exactement (MANUEL §6bis).
 * E. À découvrir : مبتدئ « l'ÉCART entre deux rangs » (3 − (−2) = 5, pas 1) ; متقدم « les colonnes par unité se MULTIPLIENT » (3 × 2 = 6). La règle n'est écrite qu'à la phase formelle.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        10ᵐ × 10ⁿ = 10ᵐ⁺ⁿ ; 10ᵐ / 10ⁿ = 10ᵐ⁻ⁿ ; (10ᵐ)ⁿ = 10ᵐⁿ — des colonnes entre des unités
 *   OBJECT         l'établi du club de technologie : règle de laiton à colonnes, plaques d'unités émaillées, ruban rouge à deux poignées ; Anis (KidFigure) à l'établi
 *   VARIABLE       k, le nombre signé de colonnes du ruban (l'exposant du facteur) ; en متقدم aussi le mode (colonnes par unité)
 *   INVARIANT      entre deux colonnes voisines on multiplie par 10 ; une plaque ne bouge pas ; seul le pavage change avec le mode
 *   TRANSFORMATION ruban → k colonnes → facteur 10^k en décimal
 *   CONSTRAINT     l'extrémité s'accroche aux frontières de colonnes ; elle doit finir sur le bord d'une plaque ; |k| ≤ 12 ; la prédiction précède le ruban
 *   RESISTANCE     multiplier les exposants d'un produit (prédiction 9) ; ignorer le signe d'un exposant (1 pour cm ↔ km) ; ajouter dans une puissance de puissance (5 pour km² → m²) ; sens (1 mm² = 10⁶ m²)
 *   EVIDENCE       le compte de colonnes, le ruban pointillé du total, le refus avec le calcul, la bleue pour une unité plus grande
 *   CONTRAST       u2 (de part et d'autre du mètre), u6 (ruban bleu, k négatif), u4 contre u5 (aire contre volume)
 *   PREDICTION     « كم عمودًا بين … ؟ » avant le ruban (u1, u2)
 *   FORMALIZATION  10³ × 10³ = 10⁶ ; 10³ / 10⁻² = 10⁵ ; (10³)² = 10⁶
 *   TRANSFER       « جرّب أعدادك » (toujours ouvert), les exercices et la banque
 *
 * QUESTIONS PENDANT LE LABO (2026-10-28, lot 6) : après chaque tâche une suite de 2 questions se pose PAR-DESSUS le labo (`CHAINS`, `QUESTIONS` en bas du fichier) sur ce que l'élève vient de
 * FAIRE avec SES rubans : le total de deux rubans, le compte de colonnes, le quotient, les colonnes par unité des tables ; la dernière tâche de chaque niveau finit par LA RÈGLE
 * (la découverte d'avant passe dans la carte). Étapes `LabStepper` (`[data-ul-step=<i>]`) + fête ; « إعادة » repart de la tâche 1 ; obligatoires pour tout élève, coupées par
 * l'enseignant pour SON compte (`useLabCheckpointSettings`) ; `checkpoints` = false les coupe aussi ; `onCheckpoint(ev)` : la trace que les étapes du module relisent (`checkpoint-done`).
 *
 * D'UN SEUL REGARD (§8bis) : `[data-ul-glance]` enveloppe la consigne, la carte, la règle, la lecture, les boutons et le verdict.
 * ONBOARDING : `coach` (défaut true) → `LabCoach` ; `logic/unitLadder.js › coachOf` (predict · mode · handle · readout · dock · next · free).
 * Props : `tasks`, `level`, `levels`, `coach`, `title`, `lead`, `onTrial(event)`, `onFinished()`.
 * CONTRAT DOM : [data-unit-ladder][data-mode][data-task][data-solved], [data-ul-glance], [data-ul-stage], [data-ul-ruler], [data-ul-plaque=<unit>], [data-ul-band][data-k], [data-ul-handle][role=slider],
 * [data-ul-readout], [data-ul-factor], [data-ul-card], [data-ul-predict=<i>], [data-ul-predict-card], [data-ul-dial], [data-ul-mode=<1|2|3>], [data-ul-less], [data-ul-more], [data-ul-dock], [data-ul-next],
 * [data-ul-banner], [data-ul-free], [data-ul-free-from|to|mode], [data-ul-formal], [data-ul-kid].
 */
const NS = 'manipulation.unitLadder';
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-amber-300';

export function numbersFor({ tasks, level }) {
  const lv = resolveLevelId(level ?? 'beginner');
  const asked = LEVELS['unit-ladder'][lv].numbers;
  return { ...asked, tasks: tasks ?? asked.tasks };
}

export default function UnitLadder({
  tasks, title, lead, level, levels: withLevels = true, coach: coachOn = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished, onCheckpoint,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const initialNumbers = useMemo(() => numbersFor({ tasks, level }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'unit-ladder', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nums = state.numbers;
  const numsKey = JSON.stringify(nums);
  const [lab, setLab] = useState(() => L.init(nums));
  const [scene, setScene] = useState({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: 0 });
  if (scene.key !== numsKey || scene.epoch !== state.epoch) {
    // « إعادة » (resetCount), un autre niveau ou d'autres nombres : TOUT recommence — la tâche 1, les essais et les questions du labo
    setScene({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: scene.inits + 1 });
    setLab(L.init(nums));
  }
  const kind = L.discoveryKind(lab);
  // les questions pendant le labo : la suite de la tâche courante ; celle qui finit par la règle remplace la découverte automatique
  const cpSettings = useLabCheckpointSettings('unit-ladder');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const cur = L.taskOf(lab);
  const chain = cpOn && cpSettings.enabled && !L.isFree(lab) ? CHAINS[cur.id] ?? null : null;
  const ruleByCheckpoint = cpOn && cpSettings.enabled && lab.tasks.some((tk) => CHAINS[tk.id]?.includes('rule'));
  const taskReached = L.taskDone(lab);
  const cp = useLabCheckpoint({
    id: chain ? cur.id : null,
    questions: chain && taskReached ? chain.map((q) => QUESTIONS[q](lab, cur, k)) : null,
    reached: taskReached,
    resetKey: scene.inits,
    onRetry: () => setLab(L.retryTask),
    onEvent: (ev) => state.report(onCheckpoint, ev),
    onDone: (id) => { if (CHAINS[id]?.includes('rule')) { state.discover(); state.formalize(); } },
  });
  useEffect(() => { if (kind && !ruleByCheckpoint) state.discover(); }, [kind, state.epoch, ruleByCheckpoint]); // eslint-disable-line react-hooks/exhaustive-deps
  // une étape est FAITE quand son ruban est posé ET que ses questions sont répondues : alors la pastille passe au vert et on fête
  const stepDone = lab.tasks.map((_, i) => !!lab.done[i] && (i !== lab.ti || !cp.blocking));
  const stepper = lab.tasks.length > 1 && !L.isFree(lab) && (
    <LabStepper count={lab.tasks.length} current={lab.ti} done={stepDone} stepAttr="data-ul-step" />
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
  /* ── le son (muet sauf « الصوت ») : un cran à chaque colonne franchie par la poignée, la cloche quand un ruban est accepté, le drapeau quand la tâche est faite, « over » pour un refus ── */
  const heardAt = useRef({ moves: 0, at: 0 });
  useEffect(() => {
    const h = heardAt.current;
    if (lab.moves > h.moves) { const now = performance.now(); if (now - h.at > 35) { playSfx('tooth'); h.at = now; } }
    h.moves = lab.moves;
  }, [lab.moves]);
  useEffect(() => {
    const l = lab.last;
    if (!l) return;
    if (l.kind === 'refused') playSfx('over');
    else if (l.kind === 'hop') playSfx('bell');
    else if (l.kind === 'solved') playSfx('flag');
  }, [lab.flash]); // eslint-disable-line react-hooks/exhaustive-deps
  const finishedOnce = useRef(false);
  const everyDone = L.allDone(lab);
  useEffect(() => {
    if (!everyDone) { finishedOnce.current = false; return; }
    if (!finishedOnce.current) { finishedOnce.current = true; state.report(onFinished, {}); }
  }, [everyDone]); // eslint-disable-line react-hooks/exhaustive-deps
  const reported = useRef(0);
  const nTrials = lab.trials.length;
  useEffect(() => {
    if (nTrials < reported.current) reported.current = 0;
    for (let i = reported.current; i < nTrials; i += 1) state.report(onTrial, { ...lab.trials[i] });
    reported.current = nTrials;
  }, [nTrials, lab.trials]); // eslint-disable-line react-hooks/exhaustive-deps

  const coachStep = coachOn ? L.coachOf(lab) : null;
  const coach = useLabCoach({
    lab: 'unit-ladder', step: coachStep,
    text: coachStep ? k(`coach.${coachStep.id}`) : '',
    labels: { hide: k('coach.hide'), show: k('coach.show'), ok: k('coach.ok'), stop: k('coach.stop') },
  });

  const discovery = kind ? (
    <ManipulationDiscovery state={state} prompt={<MathText>{k(`discovery.${kind}.prompt`)}</MathText>} options={discoveryOptions(k, kind)} formal={<Formal k={k} kind={kind} />} />
  ) : null;

  return (
    <ManipulationShell
      type="unit-ladder"
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
      <ManipulationStage className="bg-gradient-to-b from-amber-50/70 to-white">
        <div className="space-y-2" data-unit-ladder data-mode={lab.mode} data-task={lab.ti} data-solved={everyDone ? 'true' : 'false'}>
          <style dangerouslySetInnerHTML={{ __html: CSS }} />
          <Lab lab={lab} setLab={setLab} k={k} lead={state.isAuthoredLevel ? lead : null}
            overlay={<>{party.node}{cp.node}</>} stepper={stepper} blocked={cp.blocking} />
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ══════════════ Textes ══════════════ */

/** « 5 أعمدة » : l'arabe accorde le nombre. */
export function colsText(n, k) {
  const a = Math.abs(n);
  if (a === 0) return k('cols.zero');
  if (a === 1) return k('cols.one');
  if (a === 2) return k('cols.two');
  return k(a <= 10 ? 'cols.few' : 'cols.many', { n: a });
}
const unitName = (k, u, mode) => `${k(`units.${u}`)}${mode === 2 ? '²' : mode === 3 ? '³' : ''}`;

/* ══════════════ Le laboratoire ══════════════ */

function Lab({ lab, setLab, k, lead, overlay, stepper, blocked }) {
  const free = L.isFree(lab);
  const task = L.taskOf(lab);
  const done = L.taskDone(lab);
  const ctxKey = free ? 'free' : lab.ti > 0 ? 'again' : lab.fixedMode ? 'first' : 'tables';
  const prompt = (
    <PromptCard size="md"
      context={<MathText>{`${free ? `${k('context.freePrefix')} ` : ''}${k(`context.${ctxKey}`)}`}</MathText>}
      contextProps={{ 'data-ul-context': ctxKey }}
      title={<MathText>{k(lab.fixedMode && !free ? 'question.ladder' : 'question.tables')}</MathText>} titleClassName="text-base" lamp={free ? null : done ? 'on' : 'off'}
      titleProps={{ 'data-ul-prompt': lab.fixedMode ? 'ladder' : 'tables', 'data-lit': done ? 'true' : 'false' }}
      aside={stepper || undefined}
      instruction={lead || undefined} />
  );
  const vv = verdictOf(lab, k);
  const canNext = L.canNext(lab) && !blocked;
  const Icon = vv.tone === 'emerald' ? CheckCircle2 : vv.tone === 'amber' ? ShieldAlert : vv.tone === 'indigo' ? Hand : Sparkles;
  const btn = `inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full border-2 px-3.5 text-sm font-black transition-all duration-150 active:translate-y-0.5 motion-reduce:transition-none ${ring}`;
  const pending = L.predictionPending(lab);
  const banner = (
    <VerdictBanner tone={vv.tone} icon={Icon} size="sm" className="min-h-[2.75rem] !py-1.5" data-ul-banner data-ul-refused={vv.refused || undefined} data-code={vv.code}>
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
        <p className={vv.tone === 'indigo' ? 'font-bold text-indigo-900' : ''}>
          <MathText>{vv.text}</MathText>
          {vv.factor && <> <bdi dir="ltr" className="whitespace-nowrap rounded-full border-2 border-emerald-300 bg-white px-2 py-0.5 font-black tabular-nums" data-ul-banner-factor>{vv.factor}</bdi></>}
          {vv.tail && <> <MathText>{vv.tail}</MathText></>}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {(lab.handle !== L.startOf(lab) || lab.bands.length > 0) && !done && (
            <button type="button" onClick={() => setLab(L.restartTask)} data-ul-retry title={k('retry')} className={`${btn} !px-0 w-11 border-amber-300 bg-amber-50 text-amber-950`}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" /><span className="sr-only">{k('retry')}</span>
            </button>
          )}
          {!done && (
            <button type="button" disabled={pending} onClick={() => setLab(L.dock)} data-ul-dock
              className={`${btn} ${pending ? 'border-slate-200 bg-slate-50 text-slate-400' : 'border-amber-600 bg-amber-500 text-white shadow-[0_3px_0_0_#B45309]'}`}>
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> {k('dock')}
            </button>
          )}
          {canNext && (
            <button type="button" onClick={() => setLab(L.nextTask)} data-ul-next className={`${btn} border-emerald-600 bg-emerald-600 text-white shadow-[0_3px_0_0_#047857]`}>
              {k('next')} <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </VerdictBanner>
  );
  return (
    <>
      <div className="relative space-y-2" data-ul-glance>
        {overlay}
        {prompt}
        <MissionRow lab={lab} setLab={setLab} k={k} task={task} />
        <Bench lab={lab} setLab={setLab} k={k} />
        <Readout lab={lab} setLab={setLab} k={k} />
        {banner}
      </div>
      <FreeCard lab={lab} setLab={setLab} k={k} />
    </>
  );
}

/* ══════════════ La carte à atteindre et la prédiction ══════════════ */

function MissionRow({ lab, setLab, k, task }) {
  const done = L.taskDone(lab);
  const pending = L.predictionPending(lab);
  const shake = lab.flash % 2 ? 'ul-shake-a' : 'ul-shake-b';
  const wobble = lab.wobble && done;
  const a = unitName(k, task.path[0], task.mode);
  const b = unitName(k, task.path.at(-1), task.mode);
  const pq = k('predict.q', { from: a, to: b });
  return (
    <div className="space-y-1.5" data-ul-mission>
      <div data-ul-card data-done={done ? 'true' : 'false'}
        className={`flex min-h-[48px] min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 rounded-2xl border-[3px] px-3 py-1.5 ${wobble ? shake : ''} ${done ? 'border-emerald-500 bg-emerald-50' : 'border-amber-400 bg-amber-50'}`}>
        <span className="text-xs font-black text-amber-900">{k('card.label')}</span>
        <span className="min-w-0 text-lg font-black text-amber-950" dir="rtl">{k(task.total > 0 ? 'card.pos' : 'card.neg', { from: a, to: b })}</span>
        {task.path.length === 3 && <span className="text-xs font-bold text-amber-900" data-ul-via>{k('card.via', { via: unitName(k, task.path[1], task.mode) })}</span>}
        {done && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" data-ul-stamp />}
      </div>
      {task.predict && !done && (
        <div className="flex min-w-0 flex-wrap items-center gap-1.5 rounded-2xl border-2 border-indigo-200 bg-indigo-50/70 px-2.5 py-1.5" data-ul-predict-card role="group" aria-label={pq}>
          <span className="text-xs font-black text-indigo-950">{pq}</span>
          {task.predict.options.map((o, i) => (
            <button key={o} type="button" data-ul-predict={i} aria-pressed={lab.pick === i} disabled={!pending} onClick={() => setLab((s) => L.choosePrediction(s, i))}
              className={`min-h-[40px] min-w-[52px] rounded-xl border-2 px-2.5 text-base font-black tabular-nums ${ring} ${lab.pick === i ? 'border-indigo-700 bg-indigo-600 text-white' : pending ? 'border-indigo-300 bg-white text-indigo-950' : 'border-slate-200 bg-slate-50 text-slate-400'}`}>
              <bdi dir="ltr">{o}</bdi>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════ L'établi : règle, plaques, ruban ══════════════ */

function Bench({ lab, setLab, k }) {
  const svgRef = useRef(null);
  const boxRef = useRef(null);
  const drag = useRef(false);
  const mode = lab.mode;
  const task = L.taskOf(lab);
  const done = L.taskDone(lab);
  const blocked = L.blocked(lab);
  const W = widthOf(mode);
  const start = L.startOf(lab);
  const kk = L.currentK(lab);
  const [wide, setWide] = useState(true);
  const moodKid = done ? 'proud' : lab.last?.kind === 'refused' || lab.moves > 0 ? 'wonder' : 'happy';

  const posOf = (e) => {
    const svg = svgRef.current;
    const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    return (p.x - PAD) / COL;
  };
  const onDown = (e) => {
    if (blocked) return;
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* pointeur déjà levé */ }
    drag.current = true;
    setLab((s) => L.moveTo(s, posOf(e)));
  };
  const onMove = (e) => { if (drag.current) setLab((s) => L.moveTo(s, posOf(e))); };
  const onUp = () => { drag.current = false; };
  const onKey = (e) => {
    if (blocked) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); setLab((s) => L.step(s, 1)); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); setLab((s) => L.step(s, -1)); }
    else if (e.key === 'Enter') { e.preventDefault(); setLab(L.dock); }
  };
  useEffect(() => {
    const el = boxRef.current?.parentElement;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(() => setWide(el.clientWidth >= 640));
    ro.observe(el);
    setWide(el.clientWidth >= 640);
    return () => ro.disconnect();
  }, []);
  /* la poignée reste visible dans la règle défilante (la page, elle, ne défile jamais) */
  useEffect(() => {
    const el = boxRef.current;
    if (!el || el.scrollWidth <= el.clientWidth + 2) return;
    const x = (xOf(lab.handle) / W) * el.scrollWidth;
    if (x < el.scrollLeft + 40 || x > el.scrollLeft + el.clientWidth - 40) el.scrollTo?.({ left: Math.max(0, x - el.clientWidth / 2), behavior: 'auto' });
  }, [lab.handle, mode, W]);

  const units = L.UNITS[mode];
  const fromU = L.fromUnit(lab);
  const last = task.path.at(-1);
  const bands = lab.bands;
  const allHops = done && bands.length > 1;
  const live = !done;
  const liveLabel = live && kk !== 0 ? `${Math.abs(kk)}${lab.showFactor ? `  ${factorLabel(kk)}` : ''}` : null;
  const shake = lab.flash % 2 ? 'ul-shake-a' : 'ul-shake-b';
  const refused = lab.last?.kind === 'refused';

  return (
    <StageFrame className="min-w-0 !p-1.5" data-ul-stage>
      <div className="flex items-end gap-1.5">
        {wide && (
          <svg viewBox="0 0 70 128" className="h-24 w-14 shrink-0" aria-hidden="true" data-ul-kid>
            <KidFigure cx={35} top={8} foot={120} hairStyle="short" hair="black" skin="wheat" outfit="orange" mood={moodKid} />
          </svg>
        )}
        <div ref={boxRef} dir="ltr" data-ul-scroll className="min-w-0 flex-1 overflow-x-auto overflow-y-hidden rounded-xl border-2 border-amber-200 bg-gradient-to-b from-indigo-50 to-amber-50">
          <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{ minWidth: W, touchAction: 'none' }} className={`block h-auto w-full ${refused ? shake : ''}`} role="group" aria-label={k('scene.aria')} data-ul-svg>
            <rect x="0" y="0" width={W} height={H} fill="transparent" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} />
            <g className="ul-plaques" key={`m${mode}`}>
              {units.map((u) => (
                <Plaque key={u} u={u} mode={mode} label={unitName(k, u, mode)} value={mode === 1 ? tenSup(T.UNIT_SCALE[u]) : null}
                  state={u === fromU && !done ? 'from' : done && u === last ? 'to' : 'idle'}
                  onTap={() => setLab((s) => L.moveTo(s, L.plaquePos(u, mode)))} />
              ))}
            </g>
            <Ruler mode={mode} />
            {bands.map((b, i) => <Band key={`b${i}`} from={L.plaquePos(b.from, mode)} to={L.plaquePos(b.to, mode)} k={b.k} faint={!done || bands.length > 1} label={`${Math.abs(b.k)}${done || lab.showFactor ? `  ${factorLabel(b.k)}` : ''}`} />)}
            {live && <Band from={start} to={lab.handle} k={kk} label={liveLabel} />}
            {allHops && <Band from={L.plaquePos(task.path[0], mode)} to={L.plaquePos(last, mode)} k={task.total} y={Y_TOTAL} dashed labelBelow label={`${Math.abs(task.total)}`} />}
            <circle cx={xOf(start)} cy={Y_BAND} r="8" fill="#fff" stroke="#B45309" strokeWidth="3" data-ul-anchor />
            {!done && (
              <g data-ul-handle role="slider" tabIndex={blocked ? -1 : 0} aria-label={k('handle.aria')} aria-valuemin={-L.K_MAX} aria-valuemax={L.K_MAX} aria-valuenow={kk} aria-valuetext={colsText(kk, k)} aria-disabled={blocked}
                onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onKeyDown={onKey}
                className="outline-none focus-visible:[&>circle]:stroke-amber-400" style={{ cursor: blocked ? 'default' : 'grab', touchAction: 'none' }}>
                <circle cx={xOf(lab.handle)} cy={Y_BAND} r="22" fill="transparent" />
                <circle cx={xOf(lab.handle)} cy={Y_BAND} r="13" fill={kk < 0 ? '#2563EB' : '#DC2626'} stroke="#fff" strokeWidth="3" className={blocked ? '' : 'ul-pulse'} />
                <path d={`M${xOf(lab.handle) - 4} ${Y_BAND - 5} v10 M${xOf(lab.handle) + 4} ${Y_BAND - 5} v10`} stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
              </g>
            )}
            <line x1={PAD} x2={PAD} y1={Y_RULER} y2={Y_RULER + 1} stroke="transparent" />
          </svg>
        </div>
      </div>
    </StageFrame>
  );
}

/* ══════════════ La lecture, le cadran de mode et les boutons ══════════════ */

function Readout({ lab, setLab, k }) {
  const kk = L.currentK(lab);
  const done = L.taskDone(lab);
  const task = L.taskOf(lab);
  const blocked = L.blocked(lab);
  const shown = done ? task.total : kk;
  const showF = (lab.showFactor || done) && shown !== 0;
  const ring2 = 'inline-flex h-12 min-w-[52px] shrink-0 items-center justify-center rounded-full border-[3px] border-amber-600 bg-white px-2 text-base font-black text-amber-950 shadow-[0_3px_0_0_rgba(180,83,9,0.45)] disabled:border-slate-200 disabled:text-slate-300 disabled:shadow-none';
  return (
    <div className="flex flex-wrap items-stretch gap-1.5" data-ul-controls>
      <button type="button" data-ul-less disabled={blocked || lab.handle <= 0} onClick={() => setLab((s) => L.step(s, -1))} className={`${ring2} ${ring}`} aria-label={k('left')}>
        <ChevronsLeft className="h-5 w-5" aria-hidden="true" />
      </button>
      <div className="min-w-0 flex-1 rounded-2xl border-[3px] border-amber-700 bg-gradient-to-b from-amber-200 to-amber-400 px-3 py-1.5 text-center shadow-inner" data-ul-readout data-k={shown}>
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
          <span className="text-xs font-black text-amber-950">{k('readout.label')}</span>
          <output className="text-xl font-black tabular-nums text-amber-950" data-ul-count>{colsText(shown, k)}</output>
          {showF && <span className="rounded-full border-2 border-amber-800 bg-amber-100 px-2 py-0.5 text-sm font-black text-amber-950" data-ul-factor><bdi dir="ltr">{factorLabel(shown)}</bdi></span>}
        </div>
      </div>
      <button type="button" data-ul-more disabled={blocked || lab.handle >= L.totalColumns(lab.mode)} onClick={() => setLab((s) => L.step(s, 1))} className={`${ring2} ${ring}`} aria-label={k('right')}>
        <ChevronsRight className="h-5 w-5" aria-hidden="true" />
      </button>
      {!lab.fixedMode && !L.isFree(lab) && (
        <div className="flex basis-full items-center gap-1.5" data-ul-dial role="radiogroup" aria-label={k('mode.aria')}>
          <span className="text-xs font-black text-amber-950">{k('mode.dial')}</span>
          {L.MODES.map((m) => (
            <button key={m} type="button" role="radio" aria-checked={lab.mode === m} data-ul-mode={m} disabled={L.taskDone(lab)} onClick={() => setLab((s) => L.setMode(s, m))}
              className={`min-h-[44px] flex-1 rounded-xl border-2 px-2 text-sm font-black ${ring} ${lab.mode === m ? 'border-amber-700 bg-amber-500 text-white' : 'border-amber-300 bg-white text-amber-950 disabled:text-slate-400'}`}>
              {k(`mode.${m}`)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════ Le verdict (la bannière) ══════════════ */

function verdictOf(lab, k) {
  const task = L.taskOf(lab);
  const last = lab.last;
  const note = L.isFree(lab) ? ` ${k('v.freeNote')}` : '';
  const un = (u, m = lab.mode) => unitName(k, u, m);
  if (last?.kind === 'refused') {
    if (last.reason === 'mode') {
      const c = colsText(task.mode, k);
      return { text: k('refuse.mode', { have: k('mode.table', { m: k(`mode.${lab.mode}`) }), want: k(`mode.${task.mode}`), wantT: k('mode.table', { m: k(`mode.${task.mode}`) }), c, k: colsText(task.total, k) }) + note, tone: 'amber', code: 'mode', refused: 'mode' };
    }
    if (last.reason === 'mid-plaque') {
      const blank = lab.mode === 1;
      return { text: (blank ? k('refuse.blank') : k('refuse.mid', { table: k('mode.table', { m: k(`mode.${lab.mode}`) }), c: colsText(lab.mode, k) })) + note, tone: 'amber', code: 'mid', refused: 'mid-plaque' };
    }
    return { text: k('refuse.wrong', { got: un(last.to), k: colsText(last.k, k), want: un(L.toUnit(lab)) }) + note, tone: 'amber', code: 'wrong', refused: 'wrong-unit' };
  }
  if (L.taskDone(lab)) {
    const tot = task.total;
    const base = k(tot < 0 ? 'v.solvedNeg' : 'v.solved', { k: colsText(tot, k), from: un(task.path[0]), to: un(task.path.at(-1)) });
    const out = { text: base + note, factor: factorLabel(tot).replace('×', '×'), tone: 'emerald', code: 'solved' };
    if (lab.wobble) out.tail = k('v.wobble', { c: colsText(lab.wobble.count, k), v: lab.wobble.choice });
    return out;
  }
  if (last?.kind === 'hop') return { text: k('v.hop', { k: colsText(last.k, k) }), tone: 'emerald', code: 'hop' };
  if (last?.kind === 'custom' || (L.isFree(lab) && lab.moves === 0)) return { text: k('v.custom'), tone: 'indigo', code: 'custom' };
  if (L.predictionPending(lab)) return { text: k('idle.predict'), tone: 'indigo', code: 'predict' };
  if (!lab.fixedMode && !L.modeOk(lab) && !lab.modeTouched) return { text: k('idle.mode'), tone: 'indigo', code: 'mode-idle' };
  if (lab.handle === L.startOf(lab)) return { text: k('idle.start', { from: un(L.fromUnit(lab)) }), tone: 'indigo', code: 'start' };
  return { text: k('idle.moved', { k: colsText(L.currentK(lab), k), from: un(L.fromUnit(lab)) }), tone: 'indigo', code: 'moved' };
}

/* ══════════════ « جرّب أعدادك » : toujours ouvert ══════════════ */

function FreeCard({ lab, setLab, k }) {
  const free = L.isFree(lab);
  const [spec, setSpec] = useState({ mode: 1, from: 'km', to: 'cm' });
  const [bad, setBad] = useState(null);
  const units = L.UNITS[spec.mode];
  const setMode = (m) => { const u = L.UNITS[m]; setSpec({ mode: m, from: u[0], to: u.at(-1) }); setBad(null); };
  const add = () => {
    const v = L.validateFree(spec);
    if (!v.ok) { setBad(v.why); return; }
    setBad(null); setLab((s) => L.setFree(s, spec));
  };
  const sel = `h-11 rounded-xl border-2 ${bad ? 'border-rose-300' : 'border-amber-300'} bg-white px-2 text-base font-black text-amber-950 ${ring}`;
  return (
    <LabCard className="space-y-2 border-amber-200 bg-amber-50/50 p-3" data-ul-free data-active={free ? 'true' : 'false'}>
      <p className="flex items-center gap-1.5 text-sm font-black text-amber-950"><FlaskConical className="h-4 w-4" aria-hidden="true" /> {k('free.title')}</p>
      <p className="text-xs font-bold leading-snug text-slate-600">{free ? k('free.on') : k('free.hint')}</p>
      <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
        <label className="flex flex-col gap-1 text-xs font-black text-amber-950"><span>{k('free.table')}</span>
          <select value={spec.mode} onChange={(e) => setMode(Number(e.target.value))} data-ul-free-mode className={sel}>
            {L.MODES.map((m) => <option key={m} value={m}>{k(`mode.${m}`)}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-black text-amber-950"><span>{k('free.from')}</span>
          <select value={spec.from} onChange={(e) => setSpec({ ...spec, from: e.target.value })} data-ul-free-from className={sel}>
            {units.map((u) => <option key={u} value={u}>{unitName(k, u, spec.mode)}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-black text-amber-950"><span>{k('free.to')}</span>
          <select value={spec.to} onChange={(e) => setSpec({ ...spec, to: e.target.value })} data-ul-free-to className={sel}>
            {units.map((u) => <option key={u} value={u}>{unitName(k, u, spec.mode)}</option>)}
          </select>
        </label>
        <button type="button" onClick={add} data-ul-free-add className={`inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-amber-500 bg-white px-3 text-sm font-black text-amber-950 ${ring}`}>
          <Plus className="h-4 w-4" aria-hidden="true" /> {k('free.add')}
        </button>
        {free && (
          <button type="button" onClick={() => setLab(L.toGuided)} data-ul-free-back className={`inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-amber-200 bg-white px-3 text-xs font-bold text-amber-950 ${ring}`}>
            <Undo2 className="h-4 w-4" aria-hidden="true" /> {k('free.back')}
          </button>
        )}
      </div>
      {bad && <p role="alert" className="text-sm font-bold text-rose-700" data-ul-free-refusal={bad}>{k(`free.refusal.${bad}`)}</p>}
    </LabCard>
  );
}

/* ══════════════ La découverte et la règle ══════════════ */

export function discoveryOptions(k, kind = 'gap') {
  if (kind === 'tables') {
    return [
      { text: <MathText>{k('discovery.tables.plus')}</MathText>, why: <MathText>{k('discovery.tables.whyPlus')}</MathText> },
      { text: <MathText>{k('discovery.tables.ok')}</MathText>, correct: true },
      { text: <MathText>{k('discovery.tables.square')}</MathText>, why: <MathText>{k('discovery.tables.whySquare')}</MathText> },
    ];
  }
  return [
    { text: <MathText>{k('discovery.gap.same')}</MathText>, why: <MathText>{k('discovery.gap.whySame')}</MathText> },
    { text: <MathText>{k('discovery.gap.ok')}</MathText>, correct: true },
    { text: <MathText>{k('discovery.gap.prod')}</MathText>, why: <MathText>{k('discovery.gap.whyProd')}</MathText> },
  ];
}

export function Formal({ k, kind = 'gap' }) {
  const lines = k(`formal.${kind}`, { returnObjects: true });
  return (
    <div className="space-y-2 text-sm font-bold text-amber-950" data-ul-formal>
      {(Array.isArray(lines) ? lines : []).map((x, i) => <p key={i}><MathText>{x}</MathText></p>)}
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite de chaque tâche : ce que la main vient de faire avec SES rubans ; la dernière tâche de chaque niveau finit par LA RÈGLE. */
export const CHAINS = Object.freeze({
  u1: ['hopsTotal', 'sumExp'],
  u2: ['across', 'quot'],
  u3: ['across', 'rule'],
  u4: ['perUnit', 'power'],
  u5: ['perUnit', 'power'],
  u6: ['sign', 'power'],
  u7: ['power', 'rule'],
});

const $ = (s) => `$${s}$`;
const Cq = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const num = (n) => $(String(n).replace('-', '−'));
const pw = (n) => `10^{${n}}`;
const unitText = (k, u) => k(`units.${u}`);
/** La bonne option à la place `want` ; une seule bonne. */
const place = (opts, want) => {
  const ci = opts.findIndex((o) => o.correct);
  const rest = opts.filter((_, i) => i !== ci);
  rest.splice(Math.min(want, rest.length), 0, opts[ci]);
  return rest;
};
/** Garde les `count` premières valeurs distinctes. */
const distinct = (list, count = 3) => { const seen = new Set(); const out = []; for (const x of list) { if (!seen.has(x.v)) { seen.add(x.v); out.push(x); } } return out.slice(0, count); };

/** Chaque question est construite sur LA tâche (rien n'est écrit en dur) ; `k` : les textes de `unitLadder`. */
export const QUESTIONS = {
  /* u1 : deux rubans enchaînés, le total du pointillé */
  hopsTotal: (lab, task, k) => {
    const [b0, b1] = lab.bands;
    const from = unitName(k, task.path[0], task.mode); const to = unitName(k, task.path.at(-1), task.mode);
    const total = Math.abs(task.total);
    return {
      id: 'hopsTotal', kind: 'number', expected: String(total), answer: <MathText>{num(total)}</MathText>,
      prompt: Cq(k, 'hopsTotal.prompt', { a: colsText(b0.k, k), b: colsText(b1.k, k), from, to }),
      hints: [Cq(k, 'hopsTotal.hint1', { from, to }), Cq(k, 'hopsTotal.hint2')],
      explain: Cq(k, 'hopsTotal.explain', { a: colsText(b0.k, k), b: colsText(b1.k, k), total }),
    };
  },
  /* u1 : 10ᵃ × 10ᵇ = 10ᵃ⁺ᵇ */
  sumExp: (lab, task, k) => {
    const [b0, b1] = lab.bands;
    const a = b0.k; const b = b1.k; const sum = a + b;
    const prod = `${pw(a)}\\times${pw(b)}`;
    const opts = distinct([
      { v: sum, text: <MathText>{$(pw(sum))}</MathText>, correct: true },
      { v: a * b, text: <MathText>{$(pw(a * b))}</MathText>, why: Cq(k, 'sumExp.whyProd', { sum, product: a * b }) },
      { v: Math.max(a, b), text: <MathText>{$(pw(Math.max(a, b)))}</MathText>, why: Cq(k, 'sumExp.whyMax', { a, sum }) },
      { v: sum + 1, text: <MathText>{$(pw(sum + 1))}</MathText>, why: Cq(k, 'sumExp.whyMax', { a, sum }) },
    ]);
    return {
      id: 'sumExp', kind: 'choice', cols: 3,
      prompt: Cq(k, 'sumExp.prompt', { prod: $(prod) }),
      options: place(opts, 2),
      hints: [Cq(k, 'sumExp.hint1'), Cq(k, 'sumExp.hint2')],
      explain: Cq(k, 'sumExp.explain', { calc: $(`${prod}=${pw(`${a}+${b}`)}=${pw(sum)}`) }),
    };
  },
  /* u2 · u3 : combien de colonnes entre deux plaques (longueurs) */
  across: (lab, task, k) => {
    const [f, t] = [task.path[0], task.path.at(-1)];
    const sf = T.UNIT_SCALE[f]; const st = T.UNIT_SCALE[t];
    const kk = Math.abs(task.total);
    const from = unitText(k, f); const to = unitText(k, t);
    const diff = Math.abs(Math.abs(sf) - Math.abs(st));
    const cand = [
      { v: kk, text: <MathText>{num(kk)}</MathText>, correct: true },
      { v: diff, text: <MathText>{num(diff)}</MathText>, why: Cq(k, 'across.whyDiff', { x: num(diff), k: kk }) },
      { v: Math.abs(sf) * Math.abs(st), text: <MathText>{num(Math.abs(sf) * Math.abs(st))}</MathText>, why: Cq(k, 'across.whyOther', { x: num(Math.abs(sf) * Math.abs(st)), k: kk }) },
      { v: kk + 1, text: <MathText>{num(kk + 1)}</MathText>, why: Cq(k, 'across.whyOther', { x: num(kk + 1), k: kk }) },
      { v: kk - 1, text: <MathText>{num(kk - 1)}</MathText>, why: Cq(k, 'across.whyOther', { x: num(kk - 1), k: kk }) },
    ];
    return {
      id: 'across', kind: 'choice', cols: 3,
      prompt: Cq(k, 'across.prompt', { from, to }),
      options: place(distinct(cand), 2),
      hints: [Cq(k, 'across.hint1', { to }), Cq(k, 'across.hint2')],
      explain: Cq(k, 'across.explain', { k: kk, from, to, factor: $(pw(task.total)) }),
    };
  },
  /* u2 · u3 : le quotient 10ᵃ ÷ 10ᵇ = 10ᵃ⁻ᵇ */
  quot: (lab, task, k) => {
    const [f, t] = [task.path[0], task.path.at(-1)];
    const sf = T.UNIT_SCALE[f]; const st = T.UNIT_SCALE[t];
    const kk = sf - st;
    const from = unitText(k, f); const to = unitText(k, t);
    const frac = `\\frac{${pw(sf)}}{${pw(st)}}`;
    const mk = (e, why) => ({ v: e, text: <MathText>{$(pw(e))}</MathText>, ...(why ? { why } : { correct: true }) });
    const cand = [
      mk(kk),
      mk(sf + st, Cq(k, 'quot.whySum', { sf: num(sf), st: num(st), k: kk })),
      mk(st - sf, Cq(k, 'quot.whyBack', { from, to, good: $(pw(kk)) })),
      mk(kk + 1, Cq(k, 'quot.whySum', { sf: num(sf), st: num(st), k: kk })),
    ];
    return {
      id: 'quot', kind: 'choice', cols: 3,
      prompt: Cq(k, 'quot.prompt', { from, to, vf: $(pw(sf)), vt: $(pw(st)), frac: $(frac) }),
      options: place(distinct(cand), 0),
      hints: [Cq(k, 'quot.hint1', { from, to }), Cq(k, 'quot.hint2')],
      explain: Cq(k, 'quot.explain', { calc: $(`${frac}=${pw(`${sf}-(${st})`)}=${pw(kk)}`), k: kk }),
    };
  },
  /* u4 · u5 : les colonnes par unité du tableau choisi */
  perUnit: (lab, task, k) => {
    const m = task.mode;
    const [u1, u2] = L.UNITS[m].slice(0, 2).map((u) => unitName(k, u, m));
    const table = k(`cp.perUnit.${m === 2 ? 'area' : 'volume'}`);
    const o = { u1, u2, m, table };
    const opts = [1, 2, 3].map((n) => ({ text: <MathText>{colsText(n, k)}</MathText>, ...(n === m ? { correct: true } : { why: Cq(k, 'perUnit.whyOther', { ...o, x: colsText(n, k) }) }) }));
    return {
      id: 'perUnit', kind: 'choice', cols: 3,
      prompt: Cq(k, 'perUnit.prompt', { table }),
      options: place(opts, (lab.ti + 1) % 3),
      hints: [Cq(k, 'perUnit.hint1', { u1, u2 }), Cq(k, 'perUnit.hint2')],
      explain: Cq(k, 'perUnit.explain', { table, m }),
    };
  },
  /* u4 … u7 : (10ᵖ)ᵐ = 10ᵖᵐ — les colonnes du tableau = celles du tableau des longueurs × colonnes par unité */
  power: (lab, task, k) => {
    const m = task.mode;
    const [f, t] = [task.path[0], task.path.at(-1)];
    const total = Math.abs(task.total);
    const p = total / m;
    const o = { l1: unitText(k, f), l2: unitText(k, t), p, m, from: unitName(k, f, m), to: unitName(k, t, m), t: total };
    const cand = [
      { v: total, text: <MathText>{num(total)}</MathText>, correct: true },
      { v: p + m, text: <MathText>{num(p + m)}</MathText>, why: Cq(k, 'power.whyAdd', o) },
      { v: p ** m, text: <MathText>{num(p ** m)}</MathText>, why: Cq(k, 'power.whyPow', { ...o, x: p ** m }) },
      { v: total + 1, text: <MathText>{num(total + 1)}</MathText>, why: Cq(k, 'power.whyPow', { ...o, x: total + 1 }) },
    ];
    return {
      id: 'power', kind: 'choice', cols: 3,
      prompt: Cq(k, 'power.prompt', o),
      options: place(distinct(cand), (lab.ti + 2) % 3),
      hints: [Cq(k, 'power.hint1', o), Cq(k, 'power.hint2', o)],
      explain: Cq(k, 'power.explain', { calc: $(`(${pw(p)})^{${m}}=${pw(`${p}\\times${m}`)}=${pw(total)}`) }),
    };
  },
  /* u6 : le ruban bleu, k < 0 */
  sign: (lab, task, k) => {
    const m = task.mode;
    const from = unitName(k, task.path[0], m); const to = unitName(k, task.path.at(-1), m);
    const opts = [
      { text: Cq(k, 'sign.right'), correct: true },
      { text: Cq(k, 'sign.err'), why: Cq(k, 'sign.whyErr') },
      { text: Cq(k, 'sign.table'), why: Cq(k, 'sign.whyTable') },
    ];
    return {
      id: 'sign', kind: 'choice', cols: 1,
      prompt: Cq(k, 'sign.prompt', { from, to }),
      options: place(opts, 1),
      hints: [Cq(k, 'sign.hint1', { from, to }), Cq(k, 'sign.hint2')],
      explain: Cq(k, 'sign.explain', { from, to, factor: $(pw(task.total)) }),
    };
  },
  /* la règle : l'ancienne découverte, posée en dernier */
  rule: (lab, task, k) => {
    const kind = lab.discovery === 'tables' ? 'tables' : 'gap';
    return {
      id: 'rule', kind: 'choice', cols: 1,
      prompt: <MathText>{k(`discovery.${kind}.prompt`)}</MathText>,
      options: place(discoveryOptions(k, kind), 2),
      hints: [Cq(k, `rule.${kind}.hint1`), Cq(k, `rule.${kind}.hint2`)],
      explain: <Formal k={k} kind={kind} />,
    };
  },
};
