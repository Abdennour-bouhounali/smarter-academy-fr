import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Hand, CheckCircle2, Sparkles, ChevronLeft, FlaskConical, Undo2, Minus, Plus } from 'lucide-react';
import { resolveLevelId } from '@smarter-academy/core/curriculum/manipulationLevels.js';
import * as R from '@smarter-academy/core/arithmetic/letterRule.js';
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
import { Scene, Knob, KidChip, colorOf, angleOf, valueAtAngle } from './letterDial/art';
import { LEVELS } from '../levels';
import * as L from '../logic/letterDial';

/**
 * letter-dial — LA VALEUR DU CADRAN TOMBE DANS CHAQUE FENTE (1AM, unité 6, درس « تطبيق قاعدة حرفية », 2026-10-30).
 * La logique, exacte, est dans `logic/letterDial.js` (sur `packages/core/arithmetic/letterRule.js`, importé par chemin).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. مبتدئ : une papeterie-photocopie, la règle du prix « الثمن = 5 × n + 20 » imprimée avec sa lettre ; la main TOURNE le cadran de n (12 feuilles ; puis le client qui a payé 95 ; puis la règle de la semaine
 *    où n est écrit DEUX fois) ; متقدم : la règle d'une clôture P = 2 × (a + b) avec DEUX cadrans (15 et 8, puis 8 et 15), puis une prétendue règle « a + b = a × b » que la main met à l'épreuve.
 * B. La valeur est ce que la main tient : elle TOMBE dans toutes les fentes de sa lettre et la carte calcule (parenthèses, produits, sommes) ; l'élève n'écrit aucun résultat.
 * C. La résistance : le cadran ne termine la tâche qu'au LÂCHER (passer par 12 en tournant ne compte pas) ; pour la prétendue règle, (2 ; 2) donne 4 = 4 et ne prouve rien ; seul « ≠ » termine.
 * D. La phase formelle écrit ce que l'élève a calculé avec SES valeurs (5 × 12 + 20 = 80 …) et le mot « contre-exemple ».
 * E. Les fausses réponses sont rendues VISIBLES : la carte montre le calcul exact (jamais « 5 × 12 » lu 512), l'écran de la caisse change, le comparateur passe de « = » à « ≠ ».
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        appliquer une règle littérale : remplacer chaque lettre par une valeur, puis calculer ; un contre-exemple suffit à réfuter
 *   OBJECT         la carte de règle (lettres dans des fentes), un cadran par lettre, la caisse (écran), le comparateur
 *   VARIABLE       la VALEUR de chaque lettre (le cadran)
 *   INVARIANT      la règle imprimée
 *   TRANSFORMATION la substitution : la valeur remplace la lettre dans TOUTES ses fentes
 *   CONSTRAINT     un nombre entier entre le minimum et le maximum du cadran ; la valeur compte au lâcher
 *   RESISTANCE     la valeur demandée est atteinte en tournant puis en lâchant ; (2 ; 2) ne réfute rien
 *   EVIDENCE       la ligne substituée, les lignes de calcul, l'écran de la caisse, le signe = / ≠
 *   PREDICTION     « كم يدفع من ... ؟ » avant que l'élève lise l'écran
 *   FORMALIZATION  « 5 × 12 + 20 = 80 » avec les valeurs de l'élève ; « un contre-exemple suffit »
 *   TRANSFER       « جرّب قاعدتك أنت » (toujours ouvert : 2x se lit 2 × x), les exercices et la banque
 *
 * ONBOARDING : `coach` (défaut true) → `LabCoach` ; `logic › coachOf`. QUESTIONS PENDANT LE LABO (`LabCheckpoint`) : `CHAINS` + `QUESTIONS`, après CHAQUE tâche, avec SES valeurs.
 * ÉTAPES : `LabStepper` (`[data-ld-step=<i>]`) + la fête. « إعادة » : tâche 1. Le son (muet par défaut, « الصوت ») : un déclic par cran, un drapeau quand la tâche est faite.
 * Props : `tasks`, `level`, `levels`, `coach`, `title`, `lead`, `onTrial(event)`, `onFinished({})`.
 *
 * CONTRAT DOM : [data-letter-dial][data-level][data-task][data-phase][data-solved], [data-ld-glance], [data-ld-stage], [data-ld-svg], [data-ld-register][data-lit], [data-ld-compare][data-eq], [data-ld-board],
 * [data-ld-slot=<letter>][data-filled], [data-ld-tape], [data-ld-row=<i>], [data-ld-dial=<letter>][role=slider][data-value], [data-ld-less=<letter>], [data-ld-more=<letter>], [data-ld-verdict], [data-ld-next],
 * [data-ld-step=<i>], [data-ld-free], [data-ld-free-input], [data-ld-free-dial=<letter>], [data-ld-free-info], [data-ld-free-back], [data-ld-formal], [data-ld-kid][data-mood].
 */
const NS = 'manipulation.letterDial';
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-teal-300';
const $ = (s) => `$${s}$`;

const CSS = `
@keyframes ld-drop { 0% { transform: translateY(-18px) scale(0.8); opacity: 0.2; } 70% { transform: translateY(2px) scale(1.06); opacity: 1; } 100% { transform: translateY(0) scale(1); opacity: 1; } }
.ld-drop { animation: ld-drop 260ms ease-out both; }
@keyframes ld-flash { 0% { box-shadow: 0 0 0 0 rgba(13,148,136,0.7); } 100% { box-shadow: 0 0 0 10px rgba(13,148,136,0); } }
.ld-flash { animation: ld-flash 420ms ease-out both; }
@media (prefers-reduced-motion: reduce) { .ld-drop, .ld-flash { animation: none !important; } }
.ld-knob:focus-visible { outline: 3px solid #2DD4BF; outline-offset: 4px; border-radius: 9999px; }
`;

export function numbersFor({ tasks, level }) {
  const lv = resolveLevelId(level ?? 'beginner');
  const asked = LEVELS['letter-dial'][lv].numbers;
  return { tasks: tasks ?? asked.tasks };
}

export default function LetterDial({
  tasks, title, lead, level, levels: withLevels = true, coach: coachOn = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const initialNumbers = useMemo(() => numbersFor({ tasks, level }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'letter-dial', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
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
  const cpSettings = useLabCheckpointSettings('letter-dial');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
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
    lab: 'letter-dial', step: coachStep,
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
      type="letter-dial"
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
        <div ref={boxRef} className="space-y-2" data-letter-dial data-level={advanced ? 'advanced' : 'beginner'} data-task={lab.free ? 'free' : cur.id} data-phase={lab.free ? 'free' : lab.phase}
          data-solved={finished ? 'true' : 'false'} data-width={width}>
          <style dangerouslySetInnerHTML={{ __html: CSS }} />
          <Lab lab={lab} setLab={setLab} k={k} lead={state.isAuthoredLevel ? lead : null} cp={cp} advanced={advanced} />
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ══════════════ Les mots et les écritures ══════════════ */

const tOr = (k, key, fallback) => k(key, { defaultValue: k(fallback) });
/** Un état du calcul écrit en TeX (la virgule protégée, × explicite) : « 5\times 12+20 ». */
export const tokTex = (toks) => toks.map((t) => (t.k === 'op' ? (t.v === '×' ? '\\times ' : t.v === '−' ? '-' : '+') : t.k === 'lp' ? '(' : t.k === 'rp' ? ')' : t.v.replace(',', '{,}').replace('−', '-'))).join('');
/** « 5 × 12 + 20 = 60 + 20 = 80 » en TeX : la substitution puis chaque étape jusqu'au nombre. */
export const chainTex = (rows) => rows.map(tokTex).join('=');
/** « 3 + 4 = 7 » (le membre substitué et sa valeur) en TeX. */
export const sideTex = (rows) => `${tokTex(rows[0])}=${tokTex(rows.at(-1))}`;
/** Les valeurs des cadrans « n=12 » ou « a=15,\ b=8 » en TeX. */
export const valsTex = (letters, env) => letters.map((l) => `${l}=${env[l]}`).join(',\\ ');
/** Les valeurs des cadrans en texte simple (une phrase, jamais de math) : « n = 12 » ou « a = 15 و b = 8 ». */
export const valsText = (letters, env) => letters.map((l) => `⁦${l} = ${env[l]}⁩`).join(' و ');

/* ══════════════ Le laboratoire ══════════════ */

function Lab({ lab, setLab, k, lead, cp }) {
  const task = L.taskOf(lab);
  const free = L.isFree(lab);
  const done = L.taskDone(lab);
  const lit = !free && done;
  const last = lab.last;
  const uid = `ld${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  const ctx = free ? k('ctx.free') : (lead && lab.ti === 0 ? lead : tOr(k, `ctx.${task.id}`, 'ctx.default'));
  const question = free ? k('q.free') : tOr(k, `q.${task.id}`, 'q.default');

  const stepDone = lab.tasks.map((_, i) => !!lab.done[i] && (i !== lab.ti || !cp.blocking));
  const steps = lab.tasks.length > 1 && !free && <LabStepper count={lab.tasks.length} current={lab.ti} done={stepDone} stepAttr="data-ld-step" />;
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.trials.length === 0 && celebrated.current.size) celebrated.current = new Set();
  const nowDone = !free && stepDone[lab.ti];
  useEffect(() => {
    if (!nowDone || celebrated.current.has(lab.ti)) return;
    celebrated.current.add(lab.ti);
    party.celebrate({ n: lab.ti + 1, total: lab.tasks.length });
  }, [nowDone, lab.ti]); // eslint-disable-line react-hooks/exhaustive-deps

  // le son (muet sauf « الصوت ») : un déclic à chaque cran du cadran, un drapeau quand la tâche est faite
  const envKey = JSON.stringify(free ? lab.free.env : lab.env);
  const prevEnv = useRef(envKey);
  useEffect(() => {
    if (prevEnv.current !== envKey) playSfx('gesture', { pitch: 1 });
    prevEnv.current = envKey;
  }, [envKey]);
  useEffect(() => { if (done && !free) { playSfx('flag'); playSfx('bell'); } }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  const prompt = (
    <PromptCard size="md" aside={steps || null} context={<MathText>{ctx}</MathText>} contextProps={{ 'data-ld-context': free ? 'free' : task.id }}
      title={<MathText>{question}</MathText>} titleClassName="text-base" lamp={free ? null : lit ? 'on' : 'off'}
      titleProps={{ 'data-ld-prompt': free ? 'free' : task.id, 'data-lit': lit ? 'true' : 'false' }} />
  );

  /* ── le verdict : la CONSÉQUENCE avec les valeurs de l'élève, jamais la règle ── */
  const env = lab.env;
  const view = free ? null : L.view(lab);
  const verdictLine = (() => {
    if (free) return k(last?.kind === 'custom' ? 'free.on' : 'idle.open');
    const vals = valsText(task.letters, env);
    if (done) {
      if (task.kind === 'claim') return k('v.counter', { vals, l: R.text(view.l), r: R.text(view.r) });
      return k('v.done', { vals, value: R.text(view.value) });
    }
    if (!lab.touched) return k(`idle.${task.kind}`);
    if (last?.kind === 'holds') return k('v.holds', { vals, l: R.text(view.l), r: R.text(view.r) });
    if (last?.kind === 'rest') {
      if (task.kind === 'find') return k(view.value.n * task.out.d < task.out.n * view.value.d ? 'v.below' : 'v.above', { vals, value: R.text(view.value), out: R.text(task.out) });
      return k('v.rest', { vals, value: R.text(view.value) });
    }
    return k('idle.turning');
  })();
  const good = !free && done;
  const bad = !free && !done && last?.kind === 'rest';
  const tone = bad ? 'amber' : good ? 'emerald' : 'indigo';
  const Icon = bad ? Sparkles : good ? CheckCircle2 : Hand;
  const canNext = L.canNext(lab) && !cp.blocking;
  const mood = bad ? 'wonder' : done ? 'proud' : 'happy';
  const banner = (
    <VerdictBanner tone={tone} icon={Icon} size="sm" className="min-h-[3.2rem]" data-ld-verdict={bad ? 'wrong' : good ? 'right' : free ? 'free' : ''}>
      <div className="flex min-w-0 items-center gap-2">
        <span data-ld-kidchip className="shrink-0"><KidChip mood={mood} /></span>
        <div className="min-w-0 space-y-1.5">
          <p className={last || free ? '' : 'font-bold text-indigo-900'}><MathText>{verdictLine}</MathText></p>
          {canNext && (
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setLab(L.nextTask)} data-ld-next
                className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-2 border-emerald-600 bg-emerald-600 px-3.5 text-sm font-black text-white shadow-[0_3px_0_0_#047857] transition-all active:translate-y-0.5 ${ring}`}>
                {k('next')} <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>
    </VerdictBanner>
  );

  return (
    <>
      <div className="relative space-y-2" data-ld-glance>
        {party.node}
        {cp.node}
        {prompt}
        <StageFrame className="min-w-0 overflow-hidden p-2" data-ld-stage>
          {free ? <FreeStage lab={lab} setLab={setLab} k={k} uid={uid} mood={mood} /> : <Stage lab={lab} setLab={setLab} k={k} uid={uid} mood={mood} view={view} />}
        </StageFrame>
        {banner}
      </div>
      <FreeCard lab={lab} setLab={setLab} k={k} />
    </>
  );
}

/* ══════════════ La carte de règle, la bande de calcul ══════════════ */

/** Les jetons d'une ligne : nombres, signes, parenthèses, fentes (lettre imprimée) ou valeurs (tuile colorée qui tombe). */
function Tokens({ toks, letters, big }) {
  const fs = big ? 'text-xl' : 'text-base';
  const slotH = big ? 'min-h-[34px] min-w-[34px]' : 'min-h-[26px] min-w-[28px]';
  return (
    <span className={`inline-flex flex-wrap items-center gap-1.5 font-black tabular-nums ${fs}`} dir="ltr" data-ld-tokens>
      {toks.map((tk, i) => {
        if (tk.k === 'var' || tk.k === 'val') {
          const name = tk.k === 'var' ? tk.v : tk.name;
          const col = colorOf(name, Math.max(0, letters.indexOf(name)));
          const isVal = tk.k === 'val';
          return (
            <span key={`${i}-${isVal ? tk.v : tk.v}`} data-ld-slot={name} data-filled={isVal ? 'true' : 'false'}
              className={`inline-flex ${slotH} items-center justify-center rounded-lg border-2 px-1.5 ${isVal ? 'ld-drop' : ''}`}
              style={{ borderColor: col, background: isVal ? `${col}1F` : '#fff', color: col, borderStyle: isVal ? 'solid' : 'dashed' }}>
              {isVal ? <bdi>{tk.v}</bdi> : tk.v}
            </span>
          );
        }
        if (tk.k === 'op') return <span key={i} className="px-0.5 text-slate-500" aria-hidden="true">{tk.v}</span>;
        if (tk.k === 'lp' || tk.k === 'rp') return <span key={i} className="text-slate-500" aria-hidden="true">{tk.v}</span>;
        return <span key={i} className="text-slate-900"><bdi>{tk.v}</bdi></span>;
      })}
    </span>
  );
}

function Board({ task, k }) {
  const letters = task.letters;
  const lhs = task.kind === 'claim' ? k('lhs.claim') : k(`lhs.${task.name}`, { defaultValue: '' });
  if (task.kind === 'claim') {
    const printedL = R.printed(task.left);
    const printedR = R.printed(task.right);
    return (
      <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-amber-200 bg-white px-3 py-2" data-ld-board dir="rtl">
        <span className="text-xs font-black text-amber-900">{lhs}</span>
        <Tokens toks={printedL} letters={letters} big />
        <span className="text-xl font-black text-slate-700" aria-hidden="true">=</span>
        <Tokens toks={printedR} letters={letters} big />
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-amber-200 bg-white px-3 py-2" data-ld-board dir="rtl">
      {lhs ? <span className="text-sm font-black text-amber-900" dir="auto">{lhs}</span> : null}
      <span className="text-xl font-black text-slate-700" aria-hidden="true">=</span>
      <Tokens toks={R.printed(task.tree)} letters={letters} big />
    </div>
  );
}

/** La bande de calcul : la ligne substituée (les valeurs tombées dans chaque fente), puis chaque étape jusqu'au nombre. */
function Tape({ rows, letters, label }) {
  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 px-3 py-1" data-ld-tape role="group" aria-label={label}>
      {rows.map((r, i) => (
        <div key={i} className="flex items-center gap-1.5" dir="ltr" data-ld-row={i}>
          <span className={`w-4 text-center text-base font-black ${i === 0 ? 'text-transparent' : 'text-slate-400'}`} aria-hidden="true">=</span>
          <Tokens toks={r} letters={letters} filled={i === 0} />
        </div>
      ))}
    </div>
  );
}

/* ══════════════ La scène : la boutique, la règle, la bande, les cadrans ══════════════ */

function Stage({ lab, setLab, k, uid, mood, view }) {
  const task = L.taskOf(lab);
  const live = L.canTurn(lab);
  const unit = k(`unit.${task.name}`, { defaultValue: '' });
  const claim = task.kind === 'claim';
  const register = !claim ? { text: R.text(view.value), unit, lit: L.taskDone(lab) || lab.touched } : null;
  const compare = claim ? { left: R.text(view.l), right: R.text(view.r), eq: view.eq } : null;
  return (
    <div className="space-y-2">
      <Scene uid={uid} label={k('sceneAria')} mood={mood} register={register} compare={compare} />
      <Board task={task} k={k} view={view} />
      {claim ? (
        <div className="grid grid-cols-2 gap-2" data-ld-tapes>
          <Tape rows={view.left} letters={task.letters} label={k('tapeLeft')} />
          <Tape rows={view.right} letters={task.letters} label={k('tapeRight')} />
        </div>
      ) : <Tape rows={view.rows} letters={task.letters} label={k('tapeAria')} />}
      <div className={`grid gap-2 ${task.letters.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`} data-ld-dials>
        {task.letters.map((l, i) => (
          <DialUnit key={l} letter={l} idx={i} value={lab.env[l]} min={task.dials[l].min} max={task.dials[l].max} live={live}
            name={tOr(k, `dial.${task.id}.${l}`, 'dial.default')} k={k} setLab={setLab} />
        ))}
      </div>
    </div>
  );
}

/** Un cadran + ses boutons − et + (le cadran est un curseur : glisser en cercle, flèches, PageUp / PageDown). */
function DialUnit({ letter, idx, value, min, max, live, name, k, setLab, free }) {
  const col = colorOf(letter, idx);
  const ref = useRef(null);
  const [drag, setDrag] = useState(false);
  const turnTo = (v) => setLab((s) => L.turn(s, letter, v));
  const release = () => setLab((s) => L.release(s));
  const angleFromEvent = (e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r || !r.width) return null;
    const cx = r.left + (r.width * 80) / 160; const cy = r.top + (r.height * 82) / 160;
    return (Math.atan2(e.clientX - cx, -(e.clientY - cy)) * 180) / Math.PI;
  };
  const down = (e) => {
    if (!live) return;
    const a = angleFromEvent(e); if (a === null) return;
    e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag(true);
    turnTo(valueAtAngle(a, min, max));
  };
  const move = (e) => {
    if (!drag) return;
    const a = angleFromEvent(e); if (a === null) return;
    turnTo(valueAtAngle(a, min, max));
  };
  const up = () => { if (drag) { setDrag(false); release(); } };
  const key = (e) => {
    if (!live) return;
    const step = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1, PageUp: 5, PageDown: -5 }[e.key];
    if (step !== undefined) { e.preventDefault(); setLab((s) => L.release(L.turnBy(s, letter, step))); }
    else if (e.key === 'Home') { e.preventDefault(); setLab((s) => L.release(L.turn(s, letter, min))); }
    else if (e.key === 'End') { e.preventDefault(); setLab((s) => L.release(L.turn(s, letter, max))); }
  };
  const btn = `inline-flex h-12 w-12 items-center justify-center rounded-full border-2 bg-white text-lg font-black shadow-[0_3px_0_0_#CBD5E1] disabled:opacity-40 ${ring}`;
  const step = (d) => setLab((s) => L.release(L.turnBy(s, letter, d)));
  const attr = free ? { 'data-ld-free-dial': letter } : { 'data-ld-dial': letter };
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border-2 bg-white px-1 py-1.5" style={{ borderColor: `${col}55` }}>
      <p className="text-center text-xs font-black leading-tight" style={{ color: col }}>{name}</p>
      <div className="flex w-full items-center justify-center gap-1" dir="ltr">
        <button type="button" disabled={!live || value <= min} onClick={() => step(-1)} data-ld-less={letter} aria-label={k('lessAria', { l: letter })} className={`${btn}`} style={{ borderColor: col, color: col }}>
          <Minus className="h-5 w-5" aria-hidden="true" />
        </button>
        <div ref={ref} role="slider" tabIndex={live ? 0 : -1} aria-label={k('dialAria', { l: letter })} aria-valuemin={min} aria-valuemax={max} aria-valuenow={value} aria-valuetext={k('dialValue', { l: letter, v: value })}
          data-value={value} onKeyDown={key} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
          className="ld-knob w-[104px] shrink-0" style={{ cursor: live ? (drag ? 'grabbing' : 'grab') : 'default', touchAction: 'none' }} {...attr}>
          <Knob letter={letter} value={value} min={min} max={max} color={col} drag={drag} locked={!live} ariaLabel={k('dialAria', { l: letter })} />
        </div>
        <button type="button" disabled={!live || value >= max} onClick={() => step(1)} data-ld-more={letter} aria-label={k('moreAria', { l: letter })} className={`${btn}`} style={{ borderColor: col, color: col }}>
          <Plus className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

/* ══════════════ « جرّب قاعدتك أنت » : toujours ouvert ══════════════ */

function FreeStage({ lab, setLab, k, uid, mood }) {
  const info = L.freeInfo(lab);
  const ok = info?.ok;
  return (
    <div className="space-y-2">
      <Scene uid={uid} label={k('sceneAria')} mood={mood} register={{ text: ok ? R.text(info.value) : '؟', unit: '', lit: !!ok }} />
      {ok ? (
        <>
          <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-amber-200 bg-white px-3 py-2" data-ld-board dir="rtl">
            <Tokens toks={R.printed(info.tree)} letters={info.letters} big />
          </div>
          <Tape rows={info.rows} letters={info.letters} label={k('tapeAria')} />
          <div className={`grid gap-2 ${info.letters.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {info.letters.map((l, i) => (
              <DialUnit key={l} letter={l} idx={i} value={info.env[l]} min={0} max={L.FREE_MAX} live name={k('dial.free', { l })} k={k} setLab={setLab} free />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function FreeCard({ lab, setLab, k }) {
  const free = L.isFree(lab);
  const [txt, setTxt] = useState('');
  useEffect(() => { if (!lab.free) setTxt(''); }, [lab.free]);
  const info = L.freeInfo(lab);
  return (
    <LabCard className="space-y-2 border-emerald-200 bg-emerald-50/50 p-3" data-ld-free data-active={free ? 'true' : 'false'}>
      <p className="flex items-center gap-1.5 text-sm font-black text-emerald-900"><FlaskConical className="h-4 w-4" aria-hidden="true" /> {k('free.title')}</p>
      <p className="text-xs font-bold leading-snug text-slate-600">{free ? k('free.on') : k('free.hint')}</p>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600">{k('free.label')}
          <input type="text" inputMode="text" autoComplete="off" autoCapitalize="none" spellCheck={false} dir="ltr" value={free ? lab.free.text : txt} aria-label={k('free.aria')} data-ld-free-input placeholder="3n+7"
            onChange={(e) => { const v = e.target.value; setTxt(v); setLab((s) => L.setFree(L.openFree(s), v)); }}
            className={`h-11 w-44 rounded-xl border-2 ${info && !info.ok ? 'border-rose-300' : 'border-emerald-300'} bg-white px-2 text-center text-lg font-black tabular-nums text-indigo-950 ${ring}`} />
        </label>
        {free && (
          <button type="button" onClick={() => setLab(L.toGuided)} data-ld-free-back
            className={`inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-emerald-200 bg-white px-3 text-xs font-bold text-emerald-900 ${ring}`}>
            <Undo2 className="h-4 w-4" aria-hidden="true" /> {k('free.back')}
          </button>
        )}
      </div>
      {free && info && (
        <p className="text-xs font-black text-emerald-900" data-ld-free-info>
          {info.ok
            ? <MathText>{k('free.info', { vals: $(valsTex(info.letters, info.env)), line: $(chainTex(info.rows)) })}</MathText>
            : k(`free.${info.reason}`)}
        </p>
      )}
    </LabCard>
  );
}

/* ══════════════ La règle (la dernière question du labo) ══════════════ */

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

/** Ce que l'élève a calculé, écrit avec SES valeurs : « 5 × 12 + 20 = 60 + 20 = 80 » ; la prétendue règle avec son contre-exemple. */
export function Formal({ lab, k, advanced }) {
  const list = lab.tasks.map((tk, i) => ({ tk, i })).filter(({ tk }) => (advanced ? tk.advanced : !tk.advanced));
  const lines = list.map(({ tk, i }) => {
    const tr = lab.solved[i];
    if (!tr) return null;
    const env = Object.fromEntries(Object.entries(tr.env).map(([a, b]) => [a, R.Q(b)]));
    if (tk.kind === 'claim') return `${sideTex(R.steps(tk.left, env))}\\ ;\\ ${sideTex(R.steps(tk.right, env))}`;
    return chainTex(R.steps(tk.tree, env));
  }).filter(Boolean);
  return (
    <div className="space-y-2 text-sm font-bold text-emerald-950" data-ld-formal={advanced ? 'both' : 'rule'}>
      <ul className="space-y-1" dir="ltr">
        {lines.map((l) => <li key={l} className="text-center text-base"><MathText>{$(l)}</MathText></li>)}
      </ul>
      <p><MathText>{k(advanced ? 'formal.both' : 'formal.rule')}</MathText></p>
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite d'une tâche (par son id : les tâches viennent de la leçon). La dernière tâche de chaque niveau finit par LA RÈGLE. */
export const CHAINS = Object.freeze({
  b1: ['pay', 'slot'],
  b2: ['grow', 'count'],
  b3: ['twice', 'promoPay', 'ruleA'],
  a1: ['fence', 'first'],
  a2: ['swap'],
  a3: ['oneNo', 'oneYes', 'ruleB'],
});

/** Une question à trois options décrite par ses clés de chaîne `cp.<id>.*` ; `vars` sont les valeurs de l'élève. */
const choice = (k, id, vars, at) => ({
  id, kind: 'choice', prompt: Mx(k, `${id}.prompt`, vars),
  options: opt([Mx(k, `${id}.right`, vars), Mx(k, `${id}.wrongA`, vars), Mx(k, `${id}.wrongB`, vars)], 0, [null, Mx(k, `${id}.whyA`, vars), Mx(k, `${id}.whyB`, vars)], at),
  hints: [Mx(k, `${id}.hint1`, vars), Mx(k, `${id}.hint2`, vars)], explain: Mx(k, `${id}.explain`, vars),
});

/** Les valeurs de l'élève, lues dans l'essai gagné de la tâche (le nombre de chaque cadran, la valeur de la règle, les deux membres). */
export function varsOf(lab, task) {
  const i = lab.tasks.indexOf(task);
  const tr = lab.solved[i];
  const env = Object.fromEntries(task.letters.map((l) => [l, tr ? tr.env[l] : task.dials[l].start]));
  const e = Object.fromEntries(Object.entries(env).map(([a, b]) => [a, R.Q(b)]));
  const out = { n: env.n, a: env.a, b: env.b };
  // chaque valeur est un entier en texte SIMPLE : les phrases de `cp.*` l'écrivent dans leurs `$…$` (jamais de `$` imbriqués)
  const wrap = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined).map(([a, v]) => [a, String(v)]));
  if (task.kind === 'claim') {
    const c = R.compare(task.left, task.right, e);
    return wrap({ ...out, l: R.text(c.l), r: R.text(c.r), sum: R.text(c.l), prod: R.text(c.r) });
  }
  const value = R.text(R.evaluate(task.tree, e));
  const o = { ...out, value };
  if (task.name === 'price') {
    o.noFixed = String(5 * env.n);              // 5 × n sans le 20
    o.glued = String(Number(`5${env.n}`) + 20); // « 5 » collé à n puis + 20
    o.cnt19 = String(Number(value) / 5);         // le prix divisé par 5 : le 20 est oublié
    o.sub20 = String(Number(value) - 20);        // le prix moins 20 : la division par 5 est oubliée
  }
  if (task.name === 'promo') { o.once = String(5 * env.n + 20); o.plus = String(5 * env.n + 20 + env.n); }
  if (task.name === 'fence') { o.nobr = String(2 * env.a + env.b); o.sumAB = String(env.a + env.b); o.prodAB = String(env.a * env.b); }
  return wrap(o);
}
const at = { pay: 1, slot: 2, grow: 0, count: 2, twice: 1, promoPay: 2, fence: 1, first: 0, swap: 2, oneNo: 0, oneYes: 1 };

export const QUESTIONS = Object.fromEntries(['pay', 'slot', 'grow', 'count', 'twice', 'promoPay', 'fence', 'first', 'swap', 'oneNo', 'oneYes'].map((id) => [
  id, (lab, task, k) => choice(k, id, varsOf(lab, task), at[id]),
]));
QUESTIONS.ruleA = (lab, task, k) => ({
  id: 'ruleA', kind: 'choice', prompt: <MathText>{k('discovery.rule.prompt')}</MathText>,
  options: ruleOptions(lab, k, false).map((o) => ({ ...o, text: <MathText>{o.text}</MathText>, why: o.why && <MathText>{o.why}</MathText> })),
  hints: [<MathText key="h1">{k('rule.rule.hint1')}</MathText>, <MathText key="h2">{k('rule.rule.hint2')}</MathText>], explain: <Formal lab={lab} k={k} advanced={false} />,
});
QUESTIONS.ruleB = (lab, task, k) => ({
  id: 'ruleB', kind: 'choice', prompt: <MathText>{k('discovery.both.prompt')}</MathText>,
  options: ruleOptions(lab, k, true).map((o) => ({ ...o, text: <MathText>{o.text}</MathText>, why: o.why && <MathText>{o.why}</MathText> })),
  hints: [<MathText key="h1">{k('rule.both.hint1')}</MathText>, <MathText key="h2">{k('rule.both.hint2')}</MathText>], explain: <Formal lab={lab} k={k} advanced />,
});
// `angleOf` est exporté par art.jsx pour les tests de géométrie du cadran
export { angleOf };
