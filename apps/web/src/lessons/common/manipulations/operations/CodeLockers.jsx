import React, { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Hand, CheckCircle2, Sparkles, ChevronLeft, FlaskConical, Check, Undo2, ChevronUp, ChevronDown, Lock, Hash } from 'lucide-react';
import { resolveLevelId } from '@smarter-academy/core/curriculum/manipulationLevels.js';
import MathText from '../../components/MathText';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import { useManipulation } from '../useManipulation';
import { LabCard, PromptCard, VerdictBanner } from '../primitives/LabKit';
import { useLabCoach } from '../primitives/LabCoach';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import HallArt from './codeLockers/HallArt';
import { LEVELS } from '../levels';
import * as L from '../logic/codeLockers';

/**
 * code-lockers — LE CODE MANQUANT SOUS LA MAIN (3AM, unité 1 « الأعداد النسبية », درس « حاصل قسمة عددين نسبيين », 2026-10-26).
 * La logique, exacte, est dans `logic/codeLockers.js` (sur `packages/core/arithmetic/relativeOps.js` et `powers.js`, importés par chemin).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. La main ROULE les molettes du code d'un cadenas : une molette de SIGNE (+ / −) et des molettes de chiffres (mode entier : dizaines, unités ;
 *    mode décimal : unités, dixièmes, centièmes ; mode fraction : le signe de devant, le signe et le nombre du numérateur, ceux du dénominateur).
 *    Glisser vers le haut / le bas, ▲ / ▼, ou le clavier (↑ ↓ sur la molette, ← → d'une molette à l'autre) ; tirer la poignée (glisser, toucher, Entrée) est l'ESSAI.
 * B. Le monde : un casier de la bibliothèque municipale porte une règle « b × ? = a » sur sa plaque ; son petit écran vert MULTIPLIE le code par b.
 * C. La résistance : la porte ne s'ouvre qu'avec le code qui rend la règle vraie ; un code faux secoue la porte et l'écran écrit le calcul (« (−6) × 8 = −48 ،
 *    والقفل يريد 48 ») ; en متقدم le signe posé d'avance est refusé avec son calcul ; quand aucun code décimal n'existe, plusieurs ÉCRITURES ouvrent la même porte.
 * D. La phase formelle est écrite par le MODULE (après la réponse de l'élève sur son سجلّ) : le labo n'énonce JAMAIS la règle des signes.
 * E. Les fausses conjectures sont réfutées par le calcul de l'élève lui-même (l'écran, le refus, le سجلّ des casiers ouverts).
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        a ÷ b est le nombre q tel que b × q = a (b ≠ 0) : un quotient hérite de la règle des signes du produit ; −a/b = a/−b = −(a/b)
 *   OBJECT         un mur de casiers, un casier au premier plan avec sa plaque, son cadenas à molettes, son écran et sa poignée
 *   VARIABLE       le code q : son signe (une molette) et ses chiffres (des molettes) ; en mode fraction, trois signes et deux nombres
 *   INVARIANT      la règle b × ? = a du casier (b et a ne changent pas)
 *   TRANSFORMATION rouler une molette change le produit affiché ; tirer la poignée juge exactement le code
 *   CONSTRAINT     codes de −99 à 99 (entier), |q| < 10 à deux décimales (décimal), n ≤ 20 et d ≤ 20 (fraction)
 *   RESISTANCE     un seul code (ou une seule valeur) ouvre ; le mauvais signe et la mauvaise distance sont refusés avec leur calcul
 *   EVIDENCE       l'écran qui multiplie, le refus écrit, le سجلّ des casiers ouverts avec leur phrase de division
 *   CONTRAST       (−6) × 8 = −48 contre (−6) × (−8) = 48 ; (−12) × (−5) = 60 refusé ; 0,66 / 0,67 autour de 2/3 ; b = 0 dans la zone libre
 *   PREDICTION     متقدم : le SIGNE est posé et « ثبّت » pressé AVANT les chiffres
 *   DISCOVERY      portée par le module (q1 : le quotient est le code ; q2 : les signes des casiers au code positif)
 *   FORMALIZATION  dans le module : la définition et la règle des signes
 *   TRANSFER       « جرّب أعدادك » (toujours ouvert), les exercices et la banque
 *
 * D'UN SEUL REGARD (§8bis) : `[data-cl-glance]` = la consigne (contexte puis UNE question), le hall, le casier actif, le verdict et le سجلّ. Écrans :
 * 768×1024 et 1024×768 (barre latérale ouverte).
 *
 * ONBOARDING : `coachOf` (digit · sign · commit · handle · switch · next) montre le contrôle, jamais le nombre.
 *
 * QUESTIONS PENDANT LE LABO (déploiement lot 1, 2026-10-28, `primitives/LabCheckpoint`) : `checkpoints` (défaut true). Après CHAQUE casier
 * ouvert, une suite de questions sur ce que l'élève vient de FAIRE se pose par-dessus le labo et retient « التالي » (`chainsOf`) : la distance du
 * code, la phrase de division de SON casier, ce que ferait le code opposé, ce que partagent les casiers au code positif (au dernier — la règle
 * reste écrite par le MODULE), 0 ÷ b ; monde `fraction` : pourquoi aucun code décimal, une autre écriture qui ouvre, le signe d'un quotient de
 * deux négatifs. Une réponse signée est un CHOIX (le champ numérique ne lit pas « − »). Obligatoires pour tout élève ; l'enseignant seul les
 * coupe pour SON compte. Questions actives → `guided`. ÉTAPES : `LabStepper` (`[data-cl-step=<i>]`) et la fête par casier. « إعادة » repart du
 * casier 1 ; « أعِد التجربة » remet LE MÊME casier (`L.restartTask`). SON : `tooth` par cran de molette (plus grave vers le bas), `bell` pour une
 * écriture qui ouvre sans finir le casier, `flag` pour le casier ouvert, `over` pour un code refusé.
 * Props : `tasks`, `world` ('lockers' | 'fraction'), `level`, `levels`, `coach`, `title`, `lead`, `onTrial(event)`, `onFinished({ world })`.
 *
 * CONTRAT DOM : [data-code-lockers][data-task][data-world][data-solved][data-layout], [data-cl-glance], [data-cl-hall], [data-cl-small=<i>][data-state], [data-cl-locker][data-open][data-cl-shake],
 * [data-cl-rule], [data-cl-wheels], [data-cl-wheel=<key>][data-value][data-locked], [data-cl-up=<key>], [data-cl-down=<key>], [data-cl-screen], [data-cl-handle], [data-cl-commit],
 * [data-cl-committed], [data-cl-switch], [data-cl-next], [data-cl-record], [data-cl-row=<i>], [data-cl-verdict=right|wrong|free|''], [data-lab-context], [data-lab-question],
 * [data-cl-step=<i>][data-done], [data-cl-free][data-active], [data-cl-free-b], [data-cl-free-a], [data-cl-free-set], [data-cl-free-back].
 */
const NS = 'manipulation.codeLockers';
const LRI = '⁦';
const PDI = '⁩';
// LRM juste après LRI : sans lettre forte, des chiffres (EN) entre neutres s'ordonnent comme du RTL (« −5 » deviendrait « 5− »).
const iso = (s) => `${LRI}‎${s}${PDI}`;
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-indigo-300';

const CSS = `
@keyframes cl-shake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-7px); } 40% { transform: translateX(7px); } 60% { transform: translateX(-5px); } 80% { transform: translateX(4px); } }
.cl-shake { animation: cl-shake 380ms ease-in-out both; }
@keyframes cl-pop { 0% { transform: scale(0.92); } 70% { transform: scale(1.05); } 100% { transform: scale(1); } }
.cl-pop { animation: cl-pop 260ms ease-out both; }
[data-cl-door] { transition: transform 520ms cubic-bezier(.2,.8,.2,1); transform-origin: left center; }
[data-cl-door][data-open="true"] { transform: perspective(900px) rotateY(64deg); pointer-events: none; }
@media (prefers-reduced-motion: reduce) { .cl-shake, .cl-pop { animation: none !important; } [data-cl-door] { transition: none !important; } [data-cl-knob] { transition: none !important; } }
`;

/** Les nombres de départ : ceux de la leçon, sinon ceux du niveau. */
export function numbersFor({ tasks, world, level }) {
  const lv = resolveLevelId(level ?? 'beginner');
  const asked = LEVELS['code-lockers'][lv].numbers;
  const w = world ?? asked.world ?? 'lockers';
  return { world: w, tasks: tasks ?? (w === 'fraction' ? L.FRACTION_TASKS : asked.tasks) };
}

export default function CodeLockers({
  tasks, world, title, lead, level, levels: withLevels = true, coach: coachOn = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const initialNumbers = useMemo(() => numbersFor({ tasks, world, level }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'code-lockers', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nums = state.numbers;
  const numsKey = JSON.stringify(nums);
  const [lab, setLab] = useState(() => L.init(nums));
  const [scene, setScene] = useState({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: 0 });
  if (scene.key !== numsKey || scene.epoch !== state.epoch) {
    // « إعادة » (resetCount), un autre niveau ou d'autres nombres : TOUT recommence — le casier 1, les essais et les questions du labo
    setScene({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: scene.inits + 1 });
    setLab(L.init(nums));
  }
  const ready = L.discoveryReady(lab);
  // les questions pendant le labo : la suite du casier courant (la règle des signes reste écrite par le MODULE)
  const cpSettings = useLabCheckpointSettings('code-lockers');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const cpChains = cpOn && cpSettings.enabled ? chainsOf(lab) : null;
  const cur = L.isFree(lab) ? null : lab.tasks[lab.ti];
  const chain = cpChains && cur ? cpChains[cur.id] ?? null : null;
  const cp = useLabCheckpoint({
    id: chain?.length ? cur.id : null,
    questions: chain?.length ? chain.map((q) => QUESTIONS[q](lab, cur, k)) : null,
    reached: !L.isFree(lab) && L.taskDone(lab),
    resetKey: scene.inits,
    onRetry: () => setLab(L.restartTask),
    onEvent: (ev) => state.report(onTrial, ev),
  });
  // le son (muet sans « الصوت ») : un cran de molette, puis le jugement de la poignée
  const sfx = useRef({ wheels: lab.wheels, at: 0, last: lab.last });
  useEffect(() => {
    const p = sfx.current;
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (lab.wheels !== p.wheels && now - p.at > 35) {
      const up = Object.keys(lab.wheels).some((key) => lab.wheels[key] > (p.wheels[key] ?? 0));
      playSfx('tooth', { pitch: up ? 1 : 0.75 }); p.at = now;
    }
    p.wheels = lab.wheels;
    const v = lab.last;
    if (v && v !== p.last && v.kind === 'pull' && !v.free) playSfx(!v.ok ? 'over' : v.doneNow === false ? 'bell' : 'flag');
    p.last = v;
  }, [lab.wheels, lab.last]);
  useEffect(() => { if (ready) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  const finishedOnce = useRef(false);
  useEffect(() => {
    if (!ready) { finishedOnce.current = false; return; }
    if (!finishedOnce.current) { finishedOnce.current = true; state.report(onFinished, { world: lab.world }); }
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps
  const reported = useRef(0);
  const nTrials = lab.trials.length;
  useEffect(() => {
    if (nTrials < reported.current) reported.current = 0;
    for (let i = reported.current; i < nTrials; i += 1) state.report(onTrial, L.trialEvidence(lab.trials[i]));
    reported.current = nTrials;
  }, [nTrials, lab.trials]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── onboarding ── */
  const coachStep = coachOn && !cp.open ? L.coachOf(lab) : null;
  const coach = useLabCoach({
    lab: 'code-lockers', step: coachStep,
    text: coachStep ? k(`coach.${coachStep.id}`) : '',
    labels: { hide: k('coach.hide'), show: k('coach.show'), ok: k('coach.ok'), stop: k('coach.stop') },
  });

  /* ── mesure ── */
  const boxRef = useRef(null);
  const [width, setWidth] = useState(520);
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

  return (
    <ManipulationShell
      headerAction={cpSettings.control}
      type="code-lockers"
      title={title ?? k('title')}
      titleHidden
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      guided={!!cpChains}
      coach={coachOn ? coach : null}
      hints={[0, 1, 2].map((i) => k(`hints.${i}`))}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-amber-50/60 to-white">
        <div ref={boxRef} className="space-y-2" data-code-lockers data-task={lab.ti} data-world={lab.world} data-layout={lab.layout} data-solved={ready ? 'true' : 'false'}>
          <style dangerouslySetInnerHTML={{ __html: CSS }} />
          <Lab lab={lab} setLab={setLab} k={k} width={width} lead={state.isAuthoredLevel ? lead : null} cp={cp} />
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ══════════════ Une molette ══════════════ */

const glyph = (key, v) => (L.SIGN_KEYS.includes(key) ? (v < 0 ? '−' : '+') : String(v));

/** Une molette de code : la fenêtre montre le cran courant (grand) entre ses deux voisins ; ▲ / ▼, glisser, clavier. */
function Wheel({ wkey, value, locked, onTurn, onSet, label, k, compact }) {
  const items = L.wheelItems(wkey);
  const at = items.indexOf(value);
  const prev = items[(at - 1 + items.length) % items.length];
  const next = items[(at + 1) % items.length];
  const drag = useRef(null);
  const sign = L.SIGN_KEYS.includes(wkey);
  const move = (e) => {
    if (!drag.current || locked) return;
    const dy = e.clientY - drag.current.y;
    const step = 26;
    if (Math.abs(dy) >= step) {
      const n = Math.trunc(dy / step);
      onTurn(-n);
      drag.current.y += n * step;
      drag.current.moved = true;
    }
  };
  const down = (e) => {
    if (locked) return;
    drag.current = { y: e.clientY, moved: false };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* jsdom */ }
  };
  const up = () => { const d = drag.current; drag.current = null; if (d && !d.moved && sign) onTurn(1); };
  const key = (e) => {
    if (locked) return;
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); onTurn(e.key === 'ArrowUp' ? 1 : -1); } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      const root = e.currentTarget.closest('[data-cl-wheels]');
      const all = [...root.querySelectorAll('[role="spinbutton"]')];
      const i = all.indexOf(e.currentTarget);
      const j = e.key === 'ArrowRight' ? i + 1 : i - 1;
      if (all[j]) { e.preventDefault(); all[j].focus(); }
    } else if (/^[0-9]$/.test(e.key) && !sign && items.includes(Number(e.key))) { e.preventDefault(); onSet(Number(e.key)); } else if (sign && (e.key === '+' || e.key === '-')) { e.preventDefault(); onSet(e.key === '-' ? -1 : 1); }
  };
  const w = sign ? 48 : compact ? 52 : 56;
  return (
    <div className="flex flex-col items-center" data-cl-wheel={wkey} data-value={value} data-locked={locked ? 'true' : 'false'} style={{ width: w }}>
      <button type="button" tabIndex={-1} disabled={locked} onClick={() => onTurn(1)} aria-label={k('wheelUp', { name: label })} data-cl-up={wkey}
        className={`flex h-7 w-full items-center justify-center rounded-t-lg border-2 border-b-0 border-amber-200 bg-amber-100 text-amber-900 disabled:opacity-40 ${ring}`}>
        <ChevronUp className="h-4 w-4" aria-hidden="true" />
      </button>
      <div role="spinbutton" tabIndex={locked ? -1 : 0} aria-label={label} aria-valuenow={value} aria-valuetext={glyph(wkey, value)} aria-disabled={locked || undefined}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onKeyDown={key}
        className={`relative flex w-full select-none flex-col items-center justify-center overflow-hidden border-2 ${locked ? 'border-slate-300 bg-slate-200' : 'border-amber-300 bg-gradient-to-b from-amber-100 via-white to-amber-100'} ${ring}`}
        style={{ height: compact ? 54 : 64, touchAction: 'none', cursor: locked ? 'not-allowed' : 'ns-resize' }}>
        <bdi dir="ltr" className="text-sm font-black leading-none text-amber-900/35" aria-hidden="true">{glyph(wkey, prev)}</bdi>
        <bdi dir="ltr" className={`font-black leading-tight tabular-nums ${sign ? (value < 0 ? 'text-rose-700' : 'text-teal-700') : 'text-slate-900'} ${compact ? 'text-2xl' : 'text-3xl'}`}>{glyph(wkey, value)}</bdi>
        <bdi dir="ltr" className="text-sm font-black leading-none text-amber-900/35" aria-hidden="true">{glyph(wkey, next)}</bdi>
        {locked && <Lock className="absolute end-0.5 top-0.5 h-3 w-3 text-slate-500" aria-hidden="true" />}
      </div>
      <button type="button" tabIndex={-1} disabled={locked} onClick={() => onTurn(-1)} aria-label={k('wheelDown', { name: label })} data-cl-down={wkey}
        className={`flex h-7 w-full items-center justify-center rounded-b-lg border-2 border-t-0 border-amber-200 bg-amber-100 text-amber-900 disabled:opacity-40 ${ring}`}>
        <ChevronDown className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

/* ══════════════ La poignée ══════════════ */

function Handle({ onPull, disabled, k }) {
  const drag = useRef(null);
  const suppress = useRef(false);
  const [dy, setDy] = useState(0);
  const MAX = 46;
  const down = (e) => { if (disabled) return; drag.current = { y: e.clientY }; try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* jsdom */ } };
  const move = (e) => { if (!drag.current) return; setDy(Math.max(0, Math.min(MAX, e.clientY - drag.current.y))); };
  const up = () => {
    const had = drag.current;
    drag.current = null;
    if (had && dy >= 24) { suppress.current = true; onPull(); }
    setDy(0);
  };
  const click = () => {
    if (suppress.current) { suppress.current = false; return; }
    if (!disabled) onPull();
  };
  return (
    <div className="relative flex w-14 shrink-0 flex-col items-center" style={{ height: 124 }}>
      <div className="absolute inset-y-2 w-3 rounded-full bg-amber-950/60" aria-hidden="true" />
      <button type="button" data-cl-handle data-ready={disabled ? 'false' : 'true'} aria-disabled={disabled || undefined} aria-label={k('handle')}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={() => { drag.current = null; setDy(0); }} onClick={click}
        data-cl-knob
        className={`relative z-10 mt-1 flex h-14 w-14 touch-none select-none flex-col items-center justify-center gap-0.5 rounded-full border-4 text-[11px] font-black shadow-[0_4px_0_0_rgba(0,0,0,0.35)] transition-transform duration-150 ${disabled ? 'border-slate-400 bg-slate-300 text-slate-500' : 'border-yellow-600 bg-gradient-to-b from-yellow-200 to-yellow-400 text-amber-950'} ${ring}`}
        style={{ transform: `translateY(${dy}px)` }}>
        <ChevronDown className="h-5 w-5" aria-hidden="true" />
        <span>{k('pull')}</span>
      </button>
    </div>
  );
}

/* ══════════════ Le laboratoire ══════════════ */

function Lab({ lab, setLab, k, width, lead, cp }) {
  const uid = `cl${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const free = L.isFree(lab);
  const task = L.taskOf(lab);
  const done = L.taskDone(lab);
  const last = lab.last;
  const fractionW = lab.world === 'fraction';
  const keys = L.wheelKeys(lab);
  const commitTask = !free && !!task.commit;
  const pullDisabled = (commitTask && lab.committed == null) || (!free && done && !(task.writings && !done));
  const wide = width >= 640;

  /* ── le casier qui se secoue / s'ouvre ── */
  const [shake, setShake] = useState(0);
  const nTr = lab.trials.length;
  useEffect(() => { if (last && last.kind === 'pull' && !last.ok) setShake((x) => x + 1); }, [nTr]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── la consigne ── */
  const context = (() => {
    if (free) return k('context.free');
    if (fractionW) return k('context.fraction');
    if (commitTask) return k('context.commit');
    return k('context.goal');
  })();
  const question = (() => {
    if (free) return k('question.free');
    if (task.writings) return k('question.writings');
    if (commitTask) return k('question.commit');
    return k('question.open');
  })();
  // une étape est FAITE quand le casier est ouvert ET que ses questions (LabCheckpoint) sont répondues : la pastille passe au vert et on fête
  const stepDone = lab.tasks.map((_, i) => !!lab.done[i] && (i !== lab.ti || !cp.blocking));
  const steps = lab.tasks.length > 1 && !free && (
    <LabStepper count={lab.tasks.length} current={lab.ti} done={stepDone} stepAttr="data-cl-step" />
  );
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
    <PromptCard size={wide ? 'lg' : 'md'} aside={steps || null} context={lead && !free ? lead : context} contextProps={{ 'data-cl-context': free ? 'free' : (fractionW ? 'fraction' : commitTask ? 'commit' : 'goal') }}
      title={question} titleClassName={wide ? 'text-xl' : 'text-lg'} lamp={free ? null : lit ? 'on' : 'off'}
      titleProps={{ 'data-cl-prompt': free ? 'free' : 'task', 'data-lit': lit ? 'true' : 'false' }} />
  );

  /* ── le hall ── */
  const hallW = Math.max(320, Math.min(width, 820));
  const lockersView = free ? [] : lab.tasks.map((tk, i) => ({ state: lab.done[i] ? 'open' : 'closed' }));
  const mood = !last ? 'neutral' : last.ok ? 'proud' : 'wonder';
  const hall = (
    <LabCard className="overflow-hidden p-0" data-cl-stage>
      <HallArt uid={uid} width={hallW} height={wide ? 96 : 92} lockers={lockersView} current={free ? -1 : lab.ti} mood={mood} glow={!!last?.ok && (done || free)}
        words={{ poster: k('poster'), desk: k('desk') }} />
    </LabCard>
  );

  /* ── la plaque, les molettes, l'écran ── */
  const ruleTxt = L.ruleText(task);
  const wheel = (key) => {
    const names = { s: 'wSign', t: 'wTens', u: 'wUnits', d1: 'wTenths', d2: 'wHundredths', ns: 'wNumSign', n: 'wNum', ds: 'wDenSign', d: 'wDen' };
    const label = key === 's' && lab.layout === 'frac' ? k('wFracSign') : k(names[key]);
    return (
      <Wheel key={key} wkey={key} value={lab.wheels[key]} locked={L.wheelLocked(lab, key)} label={label} k={k} compact={lab.layout === 'frac'}
        onTurn={(d) => setLab((s) => L.turn(s, key, d))} onSet={(v) => setLab((s) => L.setWheel(s, key, v))} />
    );
  };
  const wheelRow = (() => {
    if (lab.layout === 'frac') {
      return (
        <div className="flex items-center justify-center gap-1.5" dir="ltr">
          {wheel('s')}
          <span className="px-0.5 text-2xl font-black text-amber-100" aria-hidden="true">(</span>
          <div className="flex flex-col items-center gap-0.5">
            <div className="flex gap-1">{wheel('ns')}{wheel('n')}</div>
            <div className="flex w-full items-center gap-1" aria-hidden="true"><span className="h-1 flex-1 rounded-full bg-amber-100" /></div>
            <div className="flex gap-1">{wheel('ds')}{wheel('d')}</div>
          </div>
          <span className="px-0.5 text-2xl font-black text-amber-100" aria-hidden="true">)</span>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center gap-1.5" dir="ltr">
        {keys.map((key) => (
          <React.Fragment key={key}>
            {key === 'd1' && <span className="self-center px-0.5 text-3xl font-black text-amber-100" aria-hidden="true">,</span>}
            {wheel(key)}
          </React.Fragment>
        ))}
      </div>
    );
  })();

  const live = L.liveCalc(lab);
  const screenText = (() => {
    if (live) return live;
    if (last && last.kind === 'pull' && (last.committed == null || last.reason !== 'sign')) return last.calc;
    return `${task.qFirst ? `? × ${L.text(task.b).startsWith('−') ? `(${L.text(task.b)})` : L.text(task.b)}` : `${L.text(task.b).startsWith('−') ? `(${L.text(task.b)})` : L.text(task.b)} × ?`} = ?`;
  })();
  const screen = (
    <div className="flex items-center justify-between gap-2 rounded-xl border-4 border-slate-700 bg-gradient-to-b from-emerald-900 to-emerald-950 px-3 py-2 text-emerald-200 shadow-inner" data-cl-screen data-ok={last?.ok ? 'true' : 'false'}>
      <bdi dir="ltr" className="min-w-0 truncate font-mono text-lg font-black tabular-nums">{screenText}</bdi>
      <span className="shrink-0 text-xs font-bold text-emerald-300/80">{k('target')} <bdi dir="ltr" className="font-mono text-base font-black text-emerald-100">{L.text(task.a)}</bdi></span>
    </div>
  );

  const canSwitch = L.switchReady(lab) && !(lab.layout === 'frac' && !free);
  const switchBtn = canSwitch && (
    <button type="button" onClick={() => setLab(L.switchMode)} data-cl-switch
      className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-full border-2 border-amber-200 bg-amber-50 px-3 text-sm font-black text-amber-950 ${ring}`}>
      <Hash className="h-4 w-4" aria-hidden="true" /> {free && lab.layout === 'frac' ? k('switchBack') : k('switch')}
    </button>
  );
  const commitBtn = commitTask && !done && (
    lab.committed == null ? (
      <button type="button" onClick={() => setLab(L.commit)} disabled={!L.canCommit(lab)} data-cl-commit
        className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-full border-2 border-amber-700 bg-amber-600 px-4 text-sm font-black text-white shadow-[0_3px_0_0_#78350F] disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none ${ring}`}>
        <Lock className="h-4 w-4" aria-hidden="true" /> {k('commit')}
      </button>
    ) : (
      <span data-cl-committed className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border-2 border-emerald-300 bg-emerald-50 px-3 text-sm font-black text-emerald-900">
        <Check className="h-4 w-4" aria-hidden="true" /> {k('committed')}
      </span>
    )
  );

  const open = !free && done;
  const locker = (
    <div className="relative overflow-hidden rounded-xl" data-cl-locker data-open={open ? 'true' : 'false'}>
      <div className="absolute inset-0 flex items-center justify-center rounded-xl border-4 border-amber-950/70 bg-gradient-to-b from-amber-100 to-amber-300" aria-hidden="true">
        <svg width="70" height="90" viewBox="0 0 70 90"><rect x="8" y="14" width="46" height="66" rx="4" fill="#0EA5E9" stroke="#075985" strokeWidth="3" /><rect x="16" y="24" width="30" height="5" rx="2" fill="#E0F2FE" /><rect x="16" y="36" width="22" height="5" rx="2" fill="#E0F2FE" /></svg>
      </div>
      <div data-cl-door data-open={open ? 'true' : 'false'} className="relative rounded-xl">
        <div key={shake} className={`rounded-xl border-4 border-amber-950/70 bg-gradient-to-b from-amber-700 to-amber-800 p-2.5 shadow-[inset_0_2px_6px_rgba(255,255,255,0.18)] ${shake ? 'cl-shake' : ''}`} data-cl-shake={shake}>
          {/* la plaque de laiton : la règle */}
          <div className="mx-auto mb-2 max-w-[330px] rounded-lg border-2 border-yellow-700 bg-gradient-to-b from-yellow-200 to-yellow-400 px-3 py-1 text-center shadow-[0_2px_0_0_rgba(0,0,0,0.25)]" data-cl-rule>
            <p className="text-[11px] font-black text-amber-900/80">{free ? k('plateFree') : k('plate', { n: lab.ti + 1 })}</p>
            <bdi dir="ltr" className="font-mono text-2xl font-black tabular-nums text-amber-950">{ruleTxt}</bdi>
          </div>
          <div className="flex items-start justify-center gap-3">
            <div className="min-w-0 space-y-1.5 rounded-xl bg-amber-950/45 p-2" data-cl-wheels>
              {wheelRow}
              {screen}
            </div>
            <Handle onPull={() => setLab(L.pull)} disabled={pullDisabled} k={k} />
          </div>
          {(commitBtn || switchBtn) && <div className="mt-2 flex flex-wrap items-center justify-center gap-2">{commitBtn}{switchBtn}</div>}
        </div>
      </div>
    </div>
  );
  /* ── le verdict ── */
  const calcOf = (ev) => iso(L.minus(ev.calc));
  const verdictLine = (() => {
    if (!last || last.kind !== 'pull') {
      if (commitTask && !done) return lab.committed == null ? k('idle.commit') : k('idle.digits');
      return k('idle.open');
    }
    const want = iso(L.minus(last.want));
    if (last.ok) {
      if (last.all) return k('v.zeroAll', { calc: calcOf(last) });
      if (free) return k('v.free', { calc: calcOf(last) });
      const w = iso(L.minus(last.writing));
      if (task.writings) {
        if (!last.fresh) return k('v.fracAgain');
        return last.doneNow ? k('v.fracDone', { writing: w, calc: calcOf(last) }) : k('v.fracFirst', { writing: w, calc: calcOf(last) });
      }
      const row = lab.record.findLast((r) => r.id === task.id);
      return k('v.right', { calc: calcOf(last), sentence: iso(L.minus(row?.sentence ?? '')) });
    }
    if (last.reason === 'zero-lock') return k('v.zero', { calc: calcOf(last), want });
    if (last.committed != null) return k('v.signCommitted', { calc: calcOf(last), want });
    return k('v.refused', { calc: calcOf(last), want });
  })();
  const noticeLine = null;
  const vkey = !last || last.kind !== 'pull' ? '' : last.ok ? (free ? 'free' : 'right') : 'wrong';
  const tone = !last ? 'indigo' : last.ok && !free ? 'emerald' : 'amber';
  const Icon = !last ? Hand : last.ok && !free ? CheckCircle2 : Sparkles;
  const canNext = L.canNext(lab) && !cp.blocking;
  const banner = (
    <VerdictBanner tone={tone} icon={Icon} size="sm" className="min-h-[3.5rem]" data-cl-verdict={vkey}>
      <div className="min-w-0 space-y-1.5">
        <p className={last ? '' : 'font-bold text-indigo-900'}>{noticeLine ?? verdictLine}</p>
        {canNext && (
          <button type="button" onClick={() => setLab(L.nextTask)} data-cl-next
            className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-2 border-emerald-600 bg-emerald-600 px-3.5 text-sm font-black text-white shadow-[0_3px_0_0_#047857] transition-all duration-150 active:translate-y-0.5 motion-reduce:transition-none ${ring}`}>
            {k('next')} <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </VerdictBanner>
  );

  /* ── le سجلّ ── */
  const rows = L.recordRows(lab);
  const record = (
    <LabCard className="overflow-hidden p-0" data-cl-record>
      <p className="bg-amber-50 px-2 py-1 text-center text-[12px] font-black text-amber-950">{k('record.title')}</p>
      <table className="w-full table-fixed text-center text-[13px] font-bold text-slate-800">
        <thead><tr className="text-[11px] text-amber-900/70"><th className="w-[34%] py-0.5">{k('record.rule')}</th><th className="w-[22%]">{k('record.code')}</th><th>{k('record.then')}</th></tr></thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={3} className="py-1 text-slate-400">—</td></tr>}
          {rows.map((x, i) => (
            <tr key={x.sig} data-cl-row={i} className="border-t border-amber-50">
              <td className="py-0.5"><bdi dir="ltr">{x.rule}</bdi></td>
              <td><bdi dir="ltr">{L.minus(x.writing && x.writing.includes('/') ? x.writing : x.code)}</bdi></td>
              <td><bdi dir="ltr">{x.sentence}</bdi></td>
            </tr>
          ))}
        </tbody>
      </table>
    </LabCard>
  );

  return (
    <>
      <div className="relative space-y-2.5" data-cl-glance>
        {party.node}
        {cp.node}
        {prompt}
        {hall}
        <div className={wide ? 'grid grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] items-start gap-2.5' : 'space-y-2.5'}>
          <div className="min-w-0 space-y-2.5">{locker}</div>
          <div className="min-w-0 space-y-2.5">{banner}{record}</div>
        </div>
      </div>
      <FreeCard lab={lab} setLab={setLab} k={k} />
    </>
  );
}

/* ══════════════ « جرّب أعدادك أنت » : toujours ouvert ══════════════ */

function FreeCard({ lab, setLab, k }) {
  const free = L.isFree(lab);
  const [b, setB] = useState('');
  const [a, setA] = useState('');
  const clean = (v) => v.replace(/[^0-9٠-٩\-−,٫.]/g, '').slice(0, 5);
  const bOk = L.parseFree(b, L.FREE_B) != null;
  const aOk = L.parseFree(a, L.FREE_A) != null;
  const badB = b !== '' && !bOk;
  const badA = a !== '' && !aOk;
  const set = () => { if (bOk && aOk) setLab((s) => L.setFree(s, b, a)); };
  return (
    <LabCard className="space-y-2 border-emerald-200 bg-emerald-50/50 p-3" data-cl-free data-active={free ? 'true' : 'false'}>
      <p className="flex items-center gap-1.5 text-sm font-black text-emerald-900"><FlaskConical className="h-4 w-4" aria-hidden="true" /> {k('free.title')}</p>
      <p className="text-xs font-bold leading-snug text-slate-600">{free ? k('free.on') : k('free.hint')}</p>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs font-black text-indigo-950">
          {k('free.b')}
          <input type="text" inputMode="decimal" autoComplete="off" dir="ltr" value={b} maxLength={5} aria-label={k('free.bAria')} aria-invalid={badB} data-cl-free-b
            onChange={(e) => setB(clean(e.target.value))} onKeyDown={(e) => { if (e.key === 'Enter') set(); }}
            className={`h-11 w-20 rounded-xl border-2 ${badB ? 'border-rose-300' : 'border-emerald-300'} bg-white px-2 text-center text-xl font-black tabular-nums text-indigo-950 ${ring}`} />
        </label>
        <label className="flex items-center gap-2 text-xs font-black text-indigo-950">
          {k('free.a')}
          <input type="text" inputMode="decimal" autoComplete="off" dir="ltr" value={a} maxLength={5} aria-label={k('free.aAria')} aria-invalid={badA} data-cl-free-a
            onChange={(e) => setA(clean(e.target.value))} onKeyDown={(e) => { if (e.key === 'Enter') set(); }}
            className={`h-11 w-20 rounded-xl border-2 ${badA ? 'border-rose-300' : 'border-emerald-300'} bg-white px-2 text-center text-xl font-black tabular-nums text-indigo-950 ${ring}`} />
        </label>
        <button type="button" onClick={set} disabled={!bOk || !aOk} data-cl-free-set
          className={`inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-emerald-600 bg-emerald-600 px-4 text-sm font-black text-white disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-400 ${ring}`}>
          <Lock className="h-4 w-4" aria-hidden="true" /> {k('free.set')}
        </button>
        {free && (
          <button type="button" onClick={() => setLab(L.toGuided)} data-cl-free-back
            className={`inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-emerald-200 bg-white px-3 text-xs font-bold text-emerald-900 ${ring}`}>
            <Undo2 className="h-4 w-4" aria-hidden="true" /> {k('free.back')}
          </button>
        )}
        {(badB || badA) && <span className="text-xs font-bold text-rose-700">{k('free.bad')}</span>}
      </div>
    </LabCard>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite de chaque casier (par id) ; un casier inconnu suit son genre. Pas de `rule` : la règle des signes est écrite par le MODULE. */
export const CHAINS = Object.freeze({
  m1: ['distance', 'sentence'], m2: ['sentence', 'flip'], m3: ['sentence', 'flip'], m4: ['sentence', 'signsRow'],
  a1: ['flip', 'sentence'], a2: ['sentence'], a3: ['sentence', 'flip'], a4: ['zero'],
  f1: ['noDecimal', 'writings'], f2: ['writings', 'fracSign'],
});
const neg = (x) => /^[-−]/.test(String(x).trim());
const isZero = (x) => /^[-−]?0(?:[.,]0*)?$/.test(String(x).trim());

/** Les suites de CE labo : une question sans objet est retirée (le code 0 n'a pas d'opposé, « les casiers positifs » sans casier positif). */
export function chainsOf(lab) {
  const out = {};
  for (const tk of lab.tasks) {
    const base = CHAINS[tk.id] ?? (tk.layout === 'frac' || tk.writings ? ['writings'] : isZero(tk.a) ? ['zero'] : ['sentence', 'flip']);
    out[tk.id] = base.filter((q) => (q === 'flip' ? !isZero(tk.a) : true));
  }
  return out;
}

const C = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const pick = (list, right, whys) => list.map((text, i) => (i === right ? { text, correct: true } : { text, why: whys[i] }));
const ltr = (s) => <bdi dir="ltr">{L.minus(s)}</bdi>;
const par = (x) => (neg(x) ? `(${L.minus(L.text(x))})` : L.text(x));
const unsign = (x) => L.text(x).replace(/^−/, '');
const oppo = (x) => (neg(L.text(x)) ? unsign(x) : `−${L.text(x)}`);

/** Chaque question est construite sur LE casier de l'élève (rien en dur). */
export const QUESTIONS = {
  distance: (lab, task, k) => {
    const q = L.answerOf(task);
    const d = unsign(q);
    const o = { a: iso(unsign(task.a)), b: iso(unsign(task.b)), d: iso(d), rule: iso(L.ruleText(task)) };
    return {
      id: 'distance', kind: 'number', expected: d, answer: ltr(d),
      prompt: C(k, 'distance.prompt', o), hints: [C(k, 'distance.hint1', o), C(k, 'distance.hint2', o)], explain: C(k, 'distance.explain', o),
    };
  },
  sentence: (lab, task, k) => {
    const q = L.text(L.answerOf(task));
    const o = { rule: iso(L.ruleText(task)), code: iso(L.minus(q)), a: iso(L.minus(L.text(task.a))), b: iso(L.minus(L.text(task.b))) };
    const swapped = `${par(task.b)} ÷ ${par(task.a)} = ${L.minus(q)}`;
    const flipped = `${par(task.a)} ÷ ${par(task.b)} = ${L.minus(oppo(q))}`;
    return {
      id: 'sentence', kind: 'choice', cols: 1, prompt: C(k, 'sentence.prompt', o),
      options: pick([ltr(L.sentenceOf(task, L.answerOf(task))), ltr(swapped), ltr(flipped)], 0, [null, C(k, 'sentence.whySwap', o), C(k, 'sentence.whyFlip', o)]),
      hints: [C(k, 'sentence.hint1', o), C(k, 'sentence.hint2', o)], explain: C(k, 'sentence.explain', { ...o, s: iso(L.sentenceOf(task, L.answerOf(task))) }),
    };
  },
  flip: (lab, task, k) => {
    const q = L.text(L.answerOf(task));
    const o = { code: iso(L.minus(q)), opp: iso(L.minus(oppo(q))), a: iso(L.minus(L.text(task.a))), anti: iso(L.minus(oppo(task.a))), rule: iso(L.ruleText(task)) };
    return {
      id: 'flip', kind: 'choice', prompt: C(k, 'flip.prompt', o),
      options: pick([C(k, 'flip.right', o), C(k, 'flip.opens'), C(k, 'flip.zero')], 0, [null, C(k, 'flip.whyOpens', o), C(k, 'flip.whyZero', o)]),
      hints: [C(k, 'flip.hint1', o), C(k, 'flip.hint2', o)], explain: C(k, 'flip.explain', o),
    };
  },
  signsRow: (lab, task, k) => {
    const rows = lab.tasks.filter((t, i) => (lab.done[i] || t === task) && !t.writings && !isZero(t.a));
    const pos = rows.filter((t) => !neg(L.text(L.answerOf(t))));
    const ruleOf = (t) => iso(L.ruleText(t));
    const aNeg = pos.find((t) => neg(t.a));
    const bNeg = pos.find((t) => neg(t.b));
    return {
      id: 'signsRow', kind: 'choice', prompt: C(k, 'signsRow.prompt'),
      options: pick([C(k, 'signsRow.same'), C(k, 'signsRow.aPos'), C(k, 'signsRow.bPos')], 0,
        [null, aNeg ? C(k, 'signsRow.whyRow', { rule: ruleOf(aNeg) }) : C(k, 'signsRow.whyGeneric'), bNeg ? C(k, 'signsRow.whyRow', { rule: ruleOf(bNeg) }) : C(k, 'signsRow.whyGeneric')]),
      hints: [C(k, 'signsRow.hint1'), C(k, 'signsRow.hint2')], explain: C(k, 'signsRow.explain', { rules: pos.map(ruleOf).join(' ، ') || '—' }),
    };
  },
  zero: (lab, task, k) => {
    const o = { b: iso(L.minus(L.text(task.b))), rule: iso(L.ruleText(task)) };
    return {
      id: 'zero', kind: 'choice', cols: 3, prompt: C(k, 'zero.prompt', o),
      options: pick([ltr('0'), ltr(L.text(task.b)), C(k, 'zero.none')], 0, [C(k, 'zero.whyB', o), C(k, 'zero.whyB', o), C(k, 'zero.whyNone', o)]),
      hints: [C(k, 'zero.hint1', o), C(k, 'zero.hint2')], explain: C(k, 'zero.explain', o),
    };
  },
  noDecimal: (lab, task, k) => {
    const q = L.text(L.answerOf(task));
    const o = { rule: iso(L.ruleText(task)), q: iso(L.minus(q)) };
    return {
      id: 'noDecimal', kind: 'choice', prompt: C(k, 'noDecimal.prompt', o),
      options: pick([C(k, 'noDecimal.right', o), C(k, 'noDecimal.miss'), C(k, 'noDecimal.sign')], 0, [null, C(k, 'noDecimal.whyMiss', o), C(k, 'noDecimal.whySign', o)]),
      hints: [C(k, 'noDecimal.hint1'), C(k, 'noDecimal.hint2', o)], explain: C(k, 'noDecimal.explain', o),
    };
  },
  writings: (lab, task, k) => {
    const q = L.answerOf(task);
    const [n, d] = unsign(q).split('/');
    const den = d ?? '1';
    const negQ = neg(L.text(q));
    const frac = (nn, dd) => `\\frac{${nn}}{${dd}}`;
    const right = negQ ? frac(n, `-${den}`) : frac(`-${n}`, `-${den}`);
    const wrongSign = negQ ? frac(`-${n}`, `-${den}`) : frac(`-${n}`, den);
    const wrongInv = negQ ? `-${frac(den, n)}` : frac(den, n);
    const o = { rule: iso(L.ruleText(task)), q: `$${negQ ? `-${frac(n, den)}` : frac(n, den)}$` };
    return {
      id: 'writings', kind: 'choice', cols: 3, prompt: C(k, 'writings.prompt', o),
      options: pick([<MathText>{`$${right}$`}</MathText>, <MathText>{`$${wrongSign}$`}</MathText>, <MathText>{`$${wrongInv}$`}</MathText>], 0,
        [null, C(k, 'writings.whySign', o), C(k, 'writings.whyInv', o)]),
      hints: [C(k, 'writings.hint1'), C(k, 'writings.hint2', o)], explain: C(k, 'writings.explain', { ...o, w: `$${right}$` }),
    };
  },
  fracSign: (lab, task, k) => {
    const o = { f: `$\\frac{${L.text(task.a).replace('−', '-')}}{${L.text(task.b).replace('−', '-')}}$` };
    const pos = neg(task.a) === neg(task.b);
    return {
      id: 'fracSign', kind: 'choice', cols: 3, prompt: C(k, 'fracSign.prompt', o),
      options: pick([C(k, 'fracSign.pos'), C(k, 'fracSign.neg'), C(k, 'fracSign.depends')], pos ? 0 : 1, [C(k, 'fracSign.why', o), C(k, 'fracSign.why', o), C(k, 'fracSign.whyDepends')]),
      hints: [C(k, 'fracSign.hint1'), C(k, 'fracSign.hint2')], explain: C(k, pos ? 'fracSign.explainPos' : 'fracSign.explainNeg', o),
    };
  },
};
