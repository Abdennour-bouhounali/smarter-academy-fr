import React, { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Hand, Sparkles, ChevronLeft, FlaskConical, Delete, Equal } from 'lucide-react';
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
import * as L from '../logic/coopCalculator';
import CoopScene, { CSS as SCENE_CSS, SCENE_H } from './coopCalculator/CoopScene';

/**
 * coop-calculator — LES PARENTHÈSES SOUS LA MAIN : « حاسبة التعاونية » (2AM, unité 1 « العمليات على الأعداد الطبيعية والأعداد العشرية », درس « سلسلة عمليات تتضمّن
 * أقواسا », 2026-10-29). La logique, exacte, est dans `logic/coopCalculator.js` (sur `packages/core/arithmetic/chainOps.js`, étage L2, importé PAR CHEMIN) ; le dessin (le
 * comptoir de la coopérative de l'école, thème `coopshop`) dans `coopCalculator/CoopScene.jsx`. Distinct de `merge-board` (3AM : des bulles existantes, on fusionne des tuiles —
 * personne ne POSE de parenthèse), de `marble-run` (3AM : des parenthèses autour d'un négatif substitué), de `trig-calculator` (4AM : sin/cos/tan) et de `tram-route` (L1 : un
 * ORDRE tamponné sur des puces) : ici la parenthèse EST la variable de la main et l'arbitre est une vraie calculatrice scientifique doublée de l'histoire.
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. La main POSE des parenthèses dans la ligne tapée : en مبتدئ elle touche un INTERVALLE entre deux touches (le curseur) puis « ( » ou « ) » (⌫ retire celle de gauche) ;
 *    en متقدم elle tape toute la ligne (touches seulement). Clavier : chiffres, + - * / ( ) Entrée, Retour arrière, flèches.
 * B. « = » imprime la ligne et la valeur de la calculatrice (priorités, `chainOps.calculatorRead`) sur le ruban ; l'HISTOIRE dit si c'est ce qu'elle raconte.
 * C. En مبتدئ la ligne est donnée SANS parenthèses (touches verrouillées) ; en متقدم l'élève la compose depuis une histoire ou une barre de fraction. Jamais de texte libre.
 * D. Chaque « = » est un essai (`print`, puis `refused` ou `solved`) ; chaque ligne libre aussi (`custom`).
 * E. Découverte : les questions posées PAR-DESSUS le labo (LabCheckpoint) — k2 l'ordre refusé, k3 la paire inutile, k4 de l'intérieur vers l'extérieur, a1 la barre — finissent
 *    chacune sur sa RÈGLE.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        les parenthèses ordonnent le calcul (à la machine et au lecteur) ; imbriquées : de l'intérieur ; une barre de fraction = deux blocs entre parenthèses ; une paire inutile ne change rien
 *   OBJECT         le comptoir de la coopérative de l'école, une grande calculatrice scientifique avec son ruban imprimé, les marchandises de l'histoire ; Hiba (KidFigure, hijab)
 *   VARIABLE       les parenthèses de la ligne tapée (où « ( » et « ) » se placent ; en متقدم la ligne entière)
 *   INVARIANT      la calculatrice obéit TOUJOURS aux priorités ; l'histoire a UNE vraie quantité
 *   TRANSFORMATION chaque parenthèse posée change l'arbre de calcul que lit la machine, donc la valeur imprimée
 *   CONSTRAINT     une ligne mal équilibrée est refusée par la machine (« Syntax ERROR ») ; en متقدم on tape les nombres de l'histoire, pas le résultat ; aucun résultat négatif attendu
 *   RESISTANCE     la valeur imprimée contredit l'histoire (barrée ✗ + l'histoire dit pourquoi) ; Syntax ERROR
 *   EVIDENCE       le ruban (ligne ➜ valeur), les parenthèses colorées par profondeur, la carte « ما تقوله الوضعية »
 *   CONTRAST       45 + 15 ÷ 4 = 48,75 / (45 + 15) ÷ 4 = 15 · 9 + 2 × 5 / 9 + (2 × 5) · (40 + 8) ÷ 15 − 9 = −5,8 / (40 + 8) ÷ (15 − 9)
 *   PREDICTION     (aucune : la calculatrice répond tout de suite) — l'élève annonce ses parenthèses aux questions du labo
 *   DISCOVERY      les questions finales de k2, k3, k4, a1, qui mènent aux règles
 *   FORMALIZATION  « نحسب ما بين القوسين أوّلًا » · « قوسان لا يغيّران الترتيب غير ضروريين » · « من الداخل، والخارجية [ ] » · « خطّ الكسر = قوسان »
 *   TRANSFER       « جرّب أعدادك » (toujours ouvert), les exercices et la banque
 *
 * « جرّب أعدادك » est TOUJOURS ouvert sous le labo (`[data-coop-free]`) : sa ligne libre montre la valeur de la machine ET, à côté, celle « de gauche à droite sans priorité ».
 * D'UN SEUL REGARD (§8bis) : `[data-coop-glance]` enveloppe la consigne, le comptoir, la calculatrice, le ruban et le verdict. ONBOARDING : `logic/coopCalculator.js › coachOf`.
 * QUESTIONS PENDANT LE LABO (prototype 2026-10-28) : `CHAINS` + `QUESTIONS` ci-dessous ; obligatoires pour tout élève, coupables par l'ENSEIGNANT seul.
 * Props : `tasks`, `world`, `level`, `levels`, `coach`, `checkpoints`, `title`, `lead`, `onTrial(event)`, `onFinished({ world })`.
 * CONTRAT DOM : [data-coop-calculator][data-task][data-solved][data-layout], [data-coop-glance], [data-coop-stage], [data-coop-calc], [data-coop-display], [data-coop-key=<k>],
 * [data-coop-keys], [data-coop-gap=<i>], [data-coop-tok=<i>][data-depth], [data-coop-back], [data-coop-clear], [data-coop-equals], [data-coop-result], [data-coop-tape],
 * [data-coop-tape-row], [data-coop-card], [data-coop-verdict], [data-coop-truth], [data-coop-next], [data-coop-free][data-active], [data-coop-free-key=<k>], [data-coop-free-read], [data-coop-free-ltr].
 */
const NS = 'manipulation.coopCalculator';
const LRI = '⁦';
const PDI = '⁩';
const iso = (s) => `${LRI}${s}${PDI}`;
const WIDE_MIN = 640;
const CALC_W = 300;
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-indigo-300';
const $ = (s) => `$${s}$`;
const tex = (s) => String(s).replace(/(\d),(\d)/g, '$1{,}$2').replace(/,/g, '{,}').replace(/×/g, '\\times').replace(/÷/g, '\\div').replace(/−/g, '-');
const DEPTH_STYLE = ['text-slate-900', 'text-sky-700', 'text-orange-600', 'text-fuchsia-700'];
const KEY_ROWS = [['7', '8', '9', '÷'], ['4', '5', '6', '×'], ['1', '2', '3', '−'], ['0', ',', '+', '⌫'], ['(', ')', 'AC', '=']];

export function numbersFor({ tasks, world, level }) {
  const lv = resolveLevelId(level ?? 'beginner');
  const asked = LEVELS['coop-calculator'][lv].numbers;
  return { tasks: tasks ?? asked.tasks, world: world ?? asked.world ?? 'coopshop' };
}

export default function CoopCalculator({
  tasks, world, title, lead, level, levels: withLevels = true, coach: coachOn = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const initialNumbers = useMemo(() => numbersFor({ tasks, world, level }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'coop-calculator', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nums = state.numbers;
  const numsKey = JSON.stringify(nums);
  const [lab, setLab] = useState(() => L.init(nums));
  const [scene, setScene] = useState({ key: numsKey, epoch: state.epoch, inits: 0 });
  if (scene.key !== numsKey || scene.epoch !== state.epoch) {
    // « إعادة », un autre niveau ou d'autres nombres : TOUT recommence — la tâche 1, la ligne, le ruban, les essais et les questions du labo
    setScene({ key: numsKey, epoch: state.epoch, inits: scene.inits + 1 });
    setLab(L.init(nums));
  }
  const cur = L.taskOf(lab);
  const cpSettings = useLabCheckpointSettings('coop-calculator');
  const chain = cpOn && cpSettings.enabled ? CHAINS[cur.id] ?? null : null;
  const ruleByCheckpoint = cpOn && cpSettings.enabled && lab.tasks.some((tk) => CHAINS[tk.id]?.some((q) => q.startsWith('rule')));
  const cp = useLabCheckpoint({
    id: chain ? cur.id : null,
    questions: chain ? chain.map((q) => QUESTIONS[q](lab, cur, k)) : null,
    reached: L.taskDone(lab),
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
    for (let i = reported.current; i < nTrials; i += 1) {
      const ev = lab.trials[i];
      state.report(onTrial, { ...ev });
      if (ev.tk === 'print') playSfx(ev.ok ? 'bell' : ev.reason === 'syntax' || ev.reason === 'math' ? 'over' : 'wrong');
    }
    reported.current = nTrials;
  }, [nTrials, lab.trials]); // eslint-disable-line react-hooks/exhaustive-deps

  const coachStep = coachOn && !cp.open ? L.coachOf(lab) : null;
  const coach = useLabCoach({
    lab: 'coop-calculator', step: coachStep,
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
      type="coop-calculator"
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
      <ManipulationStage className="bg-gradient-to-b from-amber-50/70 to-white">
        <div ref={boxRef} className="space-y-2" data-coop-calculator data-task={lab.ti} data-world={lab.world}
          data-solved={everyDone ? 'true' : 'false'} data-layout={width >= WIDE_MIN ? 'wide' : 'narrow'}>
          <style dangerouslySetInnerHTML={{ __html: SCENE_CSS }} />
          <Lab lab={lab} setLab={setLab} k={k} width={width} screenH={screenH} lead={state.isAuthoredLevel ? lead : null} cp={cp} report={(ev) => state.report(onTrial, ev)} />
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ══════════════ Le laboratoire ══════════════ */

function Lab({ lab, setLab, k, width, screenH, lead, cp, report }) {
  const uid = `cc${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const wide = width >= WIDE_MIN;
  const task = L.taskOf(lab);
  const done = L.taskDone(lab);
  const shown = L.truthShown(lab);
  const flash = lab.flash;
  const calcRef = useRef(null);

  /* ── la consigne : le contexte, puis UNE question ── */
  const ctx = k(`story.${task.id}`);
  const question = k(`question.${task.id}`);
  const stepDone = lab.tasks.map((_, i) => !!lab.done[i] && (i !== lab.ti || !cp.blocking));
  const steps = lab.tasks.length > 1 && (
    <LabStepper count={lab.tasks.length} current={lab.ti} done={stepDone} stepAttr="data-coop-step" />
  );
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.trials.length === 0 && celebrated.current.size) celebrated.current = new Set();
  const nowDone = stepDone[lab.ti];
  useEffect(() => {
    if (!nowDone || celebrated.current.has(lab.ti)) return;
    celebrated.current.add(lab.ti);
    party.celebrate({ n: lab.ti + 1, total: lab.tasks.length });
  }, [nowDone, lab.ti]); // eslint-disable-line react-hooks/exhaustive-deps
  const prompt = (
    <PromptCard size="md" context={<MathText>{ctx}</MathText>} contextProps={{ 'data-coop-context': task.id }}
      title={<MathText>{question}</MathText>} titleClassName="text-lg" lamp={done ? 'on' : 'off'}
      titleProps={{ 'data-coop-prompt': task.kind, 'data-lit': done ? 'true' : 'false' }}
      aside={steps || undefined} instruction={lead || undefined} />
  );

  /* ── la scène ── */
  const stageW = wide ? width - CALC_W - 8 : width;
  const innerH = typeof window !== 'undefined' && window.innerHeight ? window.innerHeight : screenH + 40;
  const fixed = 330 + (wide ? 0 : 340) + (lead ? 28 : 0) + (task.card ? 52 : 0);
  const hBudget = Math.max(150, Math.min(SCENE_H, innerH - 24 - fixed));
  const refuted = flash && !flash.ok && flash.reason === 'story' && !done ? flash.display : null;
  const mood = done ? 'proud' : flash && !flash.ok ? 'wonder' : 'happy';
  const stage = (
    <StageFrame className="min-w-0 overflow-hidden" data-coop-stage style={{ maxHeight: hBudget + 20 }}>
      <CoopScene width={Math.max(300, stageW)} maxH={hBudget} task={task} mood={mood} refuted={refuted} shared={shown} solved={done} uid={uid} ariaLabel={k('scene.aria')} />
    </StageFrame>
  );

  /* ── la carte (متقدم) : la barre de fraction ── */
  const card = task.card?.bar ? (
    <LabCard className="flex flex-wrap items-center justify-center gap-3 border-amber-200 bg-amber-50/60 px-3 py-1.5" data-coop-card="bar">
      <span className="text-xs font-black text-amber-900">{k('card.bar')}</span>
      <span className="text-xl" dir="ltr"><MathText>{$(`\\frac{${tex(task.card.bar.num)}}{${tex(task.card.bar.den)}}`)}</MathText></span>
    </LabCard>
  ) : null;

  /* ── la calculatrice ── */
  const onKey = (key) => {
    if (key === '=') { setLab(L.equals); return; }
    if (key === '⌫') { setLab(L.back); playSfx('tooth', { pitch: 0.75 }); return; }
    if (key === 'AC') { setLab(L.clear); return; }
    setLab((s) => L.press(s, key));
    playSfx('tooth');
  };
  const onKeyDown = (e) => {
    if (e.target.closest?.('input,select,textarea')) return;
    const key = e.key;
    if (key === 'Enter') { e.preventDefault(); onKey('='); return; }
    if (key === 'Backspace') { e.preventDefault(); onKey('⌫'); return; }
    if (key === 'ArrowLeft') { e.preventDefault(); setLab((s) => L.moveCursor(s, -1)); return; }
    if (key === 'ArrowRight') { e.preventDefault(); setLab((s) => L.moveCursor(s, 1)); return; }
    if (/^[0-9+\-*/():.,xX]$/.test(key)) { e.preventDefault(); onKey(key); }
  };
  const disabledKey = (key) => {
    if (done) return true;
    if (key === '=') return !L.canPrint(lab);
    if (key === 'AC') return false;
    if (key === '⌫') return !(lab.cur > 0 && !lab.line[lab.cur - 1]?.f);
    if (task.kind === 'insert') return !((key === '(' || key === ')') && L.cursorSet(lab));
    return false;
  };
  const last = L.lastEntry(lab);
  const resultText = last ? (last.status === 'ok' ? last.display : last.status === 'syntax' ? 'Syntax ERROR' : 'Math ERROR') : '0';
  const calculator = (
    <div ref={calcRef} tabIndex={0} onKeyDown={onKeyDown} aria-label={k('calc.aria')} data-coop-calc
      className={`mx-auto w-full rounded-3xl border-4 border-slate-700 bg-slate-800 p-2.5 shadow-lg ${ring}`} style={{ maxWidth: CALC_W }}>
      <Tape lab={lab} k={k} />
      <div className="mt-1.5 rounded-xl bg-lime-100 px-2 py-1.5" data-coop-display aria-label={k('calc.display')}>
        <div className="flex min-h-[44px] flex-wrap items-center justify-start" dir="ltr" role="group" aria-label={k('calc.line')}>
          {Array.from({ length: lab.line.length + 1 }, (_, i) => (
            <React.Fragment key={i}>
              <button type="button" data-coop-gap={i} data-cursor={lab.cur === i ? 'true' : 'false'} disabled={done}
                onClick={() => { setLab((s) => L.setCursor(s, i)); playSfx('tooth', { pitch: 1.2 }); }}
                aria-label={k('calc.gap', { i })}
                className={`relative inline-flex h-10 items-center justify-center ${lab.line.length === 0 ? 'w-10' : 'w-5'} ${ring}`}>
                <span className={`block rounded-full ${lab.cur === i ? 'cc-cursor h-7 w-0.5 bg-slate-900' : 'h-4 w-px bg-slate-400/40'}`} />
              </button>
              {lab.line[i] && (() => {
                const x = lab.line[i];
                const bracket = x.k === '(' || x.k === ')';
                const depth = L.depthsOf(lab.line)[i];
                return (
                  <span data-coop-tok={i} data-depth={bracket ? depth : 0} data-fixed={x.f ? 'true' : 'false'}
                    className={`inline-flex min-h-[36px] items-center rounded-md px-1 font-mono text-xl font-black tabular-nums ${bracket ? `bg-white/70 ${DEPTH_STYLE[Math.min(depth, 3)]} ring-2 ring-current` : x.f ? 'text-slate-700' : 'text-slate-950'}`}>
                    {x.k}
                  </span>
                );
              })()}
            </React.Fragment>
          ))}
        </div>
        <p className="mt-1 min-h-[34px] text-end font-mono text-2xl font-black text-slate-900" dir="ltr" data-coop-result data-status={last?.status ?? 'idle'} aria-live="polite">{resultText}</p>
      </div>
      <div className="mt-2 grid grid-cols-4 gap-1.5" dir="ltr" data-coop-keys>
        {KEY_ROWS.flat().map((key) => {
          const off = disabledKey(key);
          const special = key === '=' ? 'bg-emerald-500 text-white border-emerald-700 shadow-[0_3px_0_0_#047857]'
            : key === '⌫' || key === 'AC' ? 'bg-rose-100 text-rose-900 border-rose-300 shadow-[0_3px_0_0_#FDA4AF]'
              : '(),'.includes(key) && key !== ',' ? 'bg-sky-100 text-sky-950 border-sky-400 shadow-[0_3px_0_0_#7DD3FC]'
                : '+−×÷'.includes(key) ? 'bg-amber-100 text-amber-950 border-amber-300 shadow-[0_3px_0_0_#FCD34D]' : 'bg-white text-slate-900 border-slate-300 shadow-[0_3px_0_0_#CBD5E1]';
          const attrs = key === '=' ? { 'data-coop-equals': '' } : key === '⌫' ? { 'data-coop-back': '' } : key === 'AC' ? { 'data-coop-clear': '' } : {};
          return (
            <button key={key} type="button" disabled={off} onClick={() => onKey(key)} data-coop-key={key} {...attrs}
              aria-label={key === '⌫' ? k('keys.back') : key === '=' ? k('keys.equals') : key === 'AC' ? k('keys.clear') : key}
              className={`inline-flex min-h-[48px] items-center justify-center rounded-xl border-2 text-xl font-black transition-all duration-100 active:translate-y-0.5 active:shadow-none disabled:opacity-35 disabled:shadow-none motion-reduce:transition-none ${special} ${ring}`}>
              {key === '⌫' ? <Delete className="h-5 w-5" aria-hidden="true" /> : key === '=' ? <Equal className="h-6 w-6" aria-hidden="true" /> : key}
            </button>
          );
        })}
      </div>
    </div>
  );

  /* ── le verdict ── */
  const vv = verdictOf(lab, k, task);
  const canNext = L.canNext(lab) && !cp.blocking;
  const Icon = vv.tone === 'emerald' ? CheckCircle2 : vv.tone === 'indigo' ? Hand : Sparkles;
  const banner = (
    <VerdictBanner tone={vv.tone} icon={wide ? Icon : null} size="sm" className="min-h-[2.75rem] !py-1.5" data-coop-verdict={vv.code}>
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
        <p className={vv.tone === 'indigo' ? 'font-bold text-indigo-900' : ''}><MathText>{vv.text}</MathText></p>
        {canNext && (
          <button type="button" onClick={() => setLab(L.nextTask)} data-coop-next
            className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-2 border-emerald-600 bg-emerald-600 px-3.5 text-sm font-black text-white shadow-[0_3px_0_0_#047857] transition-all duration-150 active:translate-y-0.5 motion-reduce:transition-none ${ring}`}>
            {k('next')} <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </VerdictBanner>
  );
  const truthCard = shown && (
    <LabCard className="border-emerald-300 bg-emerald-50/70 px-3 py-1.5" data-coop-truth={task.id}>
      <p className="text-sm font-black text-emerald-900">{k('truth.title')}</p>
      <p className="text-sm font-bold leading-relaxed text-emerald-950"><MathText>{k(`truth.${task.id}`)}</MathText></p>
    </LabCard>
  );

  return (
    <>
      <div className="relative space-y-2" data-coop-glance>
        {party.node}
        {cp.node}
        {prompt}
        {card}
        {wide ? (
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1 space-y-2">{stage}{truthCard}</div>
            <div className="shrink-0" style={{ width: CALC_W }}>{calculator}</div>
          </div>
        ) : (<>{stage}{calculator}{truthCard}</>)}
        {banner}
      </div>
      <FreeCard k={k} report={report} />
    </>
  );
}

/* ══════════════ Le ruban imprimé ══════════════ */

function Tape({ lab, k }) {
  const rows = lab.tape.slice(-4);
  return (
    <div className="rounded-lg bg-amber-50 px-2 py-1 shadow-inner" data-coop-tape aria-label={k('tape.title')}>
      {rows.length === 0
        ? <p className="py-1 text-center text-[11px] font-bold text-slate-400" data-coop-tape-empty>{k('tape.empty')}</p>
        : rows.map((r, i) => (
          <p key={i} data-coop-tape-row={i} data-ok={r.ok ? 'true' : 'false'} dir="ltr"
            className={`flex items-center justify-between gap-2 font-mono text-[12px] font-bold ${r.ok ? 'text-emerald-800' : 'text-rose-800'}`}>
            <span className={`truncate ${r.ok ? '' : 'line-through decoration-rose-500'}`}>{C.bracketForm(r.text)} =</span>
            <span className="shrink-0">{r.status === 'ok' ? r.display : r.status === 'syntax' ? 'Syntax ERROR' : 'Math ERROR'} {r.ok ? '✓' : '✗'}</span>
          </p>
        ))}
    </div>
  );
}

/* ══════════════ Le verdict ══════════════ */

function verdictOf(lab, k, task) {
  const f = lab.flash;
  if (L.taskDone(lab) && f?.ok) {
    const text = `${k('v.ok', { v: iso(f.display) })}${lab.remark === 'useless' ? ` ${k('v.useless')}` : ''}`;
    return { text, tone: 'emerald', code: lab.remark === 'useless' ? 'useless' : 'ok' };
  }
  if (L.taskDone(lab)) return { text: k('v.done'), tone: 'emerald', code: 'done' };
  if (f && !f.ok) {
    if (f.reason === 'syntax') return { text: k('v.syntax'), tone: 'rose', code: 'syntax' };
    if (f.reason === 'math') return { text: k('v.math'), tone: 'rose', code: 'math' };
    if (f.reason === 'numbers') return { text: k('v.numbers'), tone: 'amber', code: 'numbers' };
    if (f.reason === 'nopair') return { text: k('v.nopair', { v: iso(f.display) }), tone: 'amber', code: 'nopair' };
    const key = f.trap ?? 'any';
    return { text: k(`refute.${task.id}.${key}`, { value: iso(f.display) }), tone: 'rose', code: 'story' };
  }
  if (task.kind === 'type') return { text: k(lab.line.length ? 'idle.print' : 'idle.type'), tone: 'indigo', code: '' };
  if (!L.cursorSet(lab)) return { text: k('idle.gap'), tone: 'indigo', code: '' };
  return { text: k(L.hasPairs(lab) ? 'idle.print' : 'idle.bracket'), tone: 'indigo', code: '' };
}

/* ══════════════ « جرّب أعدادك » : toujours ouvert ══════════════ */

function FreeCard({ k, report }) {
  const [line, setLine] = useState(() => L.tokensOf('45 + 15 ÷ 4'));
  const [cur, setCur] = useState(5);
  const [printed, setPrinted] = useState(null);
  const free = useMemo(() => L.freeRead(line), [line]);
  const onKey = (key) => {
    if (key === '=') {
      if (!line.length) return;
      setPrinted(free);
      report?.({ tk: 'custom', free: true, line: L.textOf(line), value: free.display ?? free.read.status, ltr: free.ltr });
      playSfx('bell');
      return;
    }
    if (key === 'AC') { setLine([]); setCur(0); setPrinted(null); return; }
    const r = key === '⌫' ? L.backKey(line, cur) : L.pressKey(line, cur, key, { max: L.FREE_LIMITS.maxKeys });
    if (!r.ok) return;
    if (!L.freeDepthOk(r.line)) return;
    setLine(r.line); setCur(r.cur); setPrinted(null);
    playSfx('tooth');
  };
  const depths = L.depthsOf(line);
  const read = printed?.read;
  return (
    <LabCard className="space-y-2 border-emerald-200 bg-emerald-50/50 p-3" data-coop-free data-active={printed ? 'true' : 'false'}>
      <p className="flex items-center gap-1.5 text-sm font-black text-emerald-900"><FlaskConical className="h-4 w-4" aria-hidden="true" /> {k('free.title')}</p>
      <p className="text-xs font-bold leading-snug text-slate-600">{k('free.hint')}</p>
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1 basis-60 space-y-1.5">
          <div className="flex min-h-[48px] flex-wrap items-center rounded-xl border-2 border-emerald-200 bg-white px-1" dir="ltr" data-coop-free-line role="group" aria-label={k('calc.line')}>
            {Array.from({ length: line.length + 1 }, (_, i) => (
              <React.Fragment key={i}>
                <button type="button" onClick={() => setCur(i)} aria-label={k('calc.gap', { i })} data-coop-free-gap={i}
                  className={`inline-flex h-9 ${line.length === 0 ? 'w-10' : 'w-4'} items-center justify-center ${ring}`}><span className={`block h-6 w-0.5 rounded-full ${cur === i ? 'cc-cursor bg-slate-900' : 'bg-slate-300'}`} /></button>
                {line[i] && <span className={`inline-flex min-h-[32px] items-center rounded px-0.5 font-mono text-lg font-black ${line[i].k === '(' || line[i].k === ')' ? DEPTH_STYLE[Math.min(depths[i], 3)] : 'text-slate-900'}`}>{line[i].k}</span>}
              </React.Fragment>
            ))}
          </div>
          {printed && (
            <div className="space-y-0.5 text-sm font-bold" aria-live="polite">
              <p className="text-teal-900" data-coop-free-read>{read.status === 'ok' ? k('free.read', { v: iso(printed.display) }) : read.status === 'syntax' ? 'Syntax ERROR' : 'Math ERROR'}</p>
              {read.status === 'ok' && printed.ltr != null && (
                <p className="text-amber-900" data-coop-free-ltr data-differs={printed.differs ? 'true' : 'false'}>{k('free.ltr', { v: iso(printed.ltr) })}</p>
              )}
            </div>
          )}
        </div>
        <div className="grid grid-cols-4 gap-1" dir="ltr" data-coop-free-keys style={{ width: 232 }}>
          {KEY_ROWS.flat().map((key) => (
            <button key={key} type="button" onClick={() => onKey(key)} data-coop-free-key={key} aria-label={key === '⌫' ? k('keys.back') : key === '=' ? k('keys.equals') : key === 'AC' ? k('keys.clear') : key}
              className={`inline-flex min-h-[44px] items-center justify-center rounded-lg border-2 text-lg font-black ${key === '=' ? 'border-emerald-700 bg-emerald-500 text-white' : '(),'.includes(key) && key !== ',' ? 'border-sky-400 bg-sky-100 text-sky-950' : 'border-slate-300 bg-white text-slate-900'} ${ring}`}>
              {key === '⌫' ? <Delete className="h-4 w-4" aria-hidden="true" /> : key}
            </button>
          ))}
        </div>
      </div>
    </LabCard>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite de questions de chaque tâche : elle interroge ce que l'élève vient de FAIRE, et mène à la règle. */
export const CHAINS = Object.freeze({
  k2: ['paid', 'whyFirst', 'ruleFirst'],
  k3: ['changed', 'whyUseless', 'ruleUseless'],
  k4: ['firstDone', 'thenDone', 'ruleNested'],
  a1: ['whichBracketed', 'ruleBar'],
});

const Mx = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const f = (task) => Object.fromEntries(Object.entries(task.facts).map(([key, v]) => [key, iso(String(v).replace('.', ','))]));
const wrongOf = (task) => iso(task.withoutDisplay ?? '');
const choice = (k, id, o, correct, wrongs, extra = {}) => ({
  id, kind: 'choice', prompt: Mx(k, `${id}.prompt`, o),
  options: [{ text: Mx(k, `${id}.${correct}`, o), correct: true }, ...wrongs.map((w) => ({ text: Mx(k, `${id}.${w}`, o), why: Mx(k, `${id}.why${w[0].toUpperCase()}${w.slice(1)}`, o) }))],
  hints: [Mx(k, `${id}.hint1`, o), Mx(k, `${id}.hint2`, o)], explain: Mx(k, `${id}.explain`, o), ...extra,
});

/** Chaque question est construite sur LES nombres de la tâche (`task.facts`) ; `k` : les textes de `coopCalculator`. */
export const QUESTIONS = {
  paid: (lab, task, k) => {
    const o = { ...f(task), wrong: wrongOf(task) };
    return { id: 'paid', kind: 'number', expected: task.truthText, answer: <MathText>{$(tex(task.truthText))}</MathText>, prompt: Mx(k, 'paid.prompt', o), hints: [Mx(k, 'paid.hint1', o), Mx(k, 'paid.hint2', o)], explain: Mx(k, 'paid.explain', o) };
  },
  whyFirst: (lab, task, k) => choice(k, 'whyFirst', { ...f(task), wrong: wrongOf(task) }, 'right', ['noadd', 'right2left']),
  ruleFirst: (lab, task, k) => choice(k, 'ruleFirst', { ...f(task), wrong: wrongOf(task) }, 'first', ['ignore', 'last']),
  changed: (lab, task, k) => choice(k, 'changed', { ...f(task), v: iso(task.truthText) }, 'no', ['yes']),
  whyUseless: (lab, task, k) => choice(k, 'whyUseless', { ...f(task), v: iso(task.truthText) }, 'mulFirst', ['addFirst', 'bracketsRule']),
  ruleUseless: (lab, task, k) => choice(k, 'ruleUseless', f(task), 'same', ['always', 'never']),
  firstDone: (lab, task, k) => choice(k, 'firstDone', f(task), 'inner', ['times', 'seatsOnly']),
  thenDone: (lab, task, k) => choice(k, 'thenDone', f(task), 'minus', ['times', 'plus']),
  ruleNested: (lab, task, k) => choice(k, 'ruleNested', f(task), 'inside', ['outside', 'leftToRight']),
  whichBracketed: (lab, task, k) => choice(k, 'whichBracketed', f(task), 'both', ['numOnly', 'wholeLine']),
  ruleBar: (lab, task, k) => choice(k, 'ruleBar', f(task), 'twoBlocks', ['oneBlock', 'ignored']),
};
