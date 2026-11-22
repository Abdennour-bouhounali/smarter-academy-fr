import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Hand, Sparkles, ChevronLeft, FlaskConical, Minus, Plus, Lock } from 'lucide-react';
import { resolveLevelId } from '@smarter-academy/core/curriculum/manipulationLevels.js';
import MathText from '../../components/MathText';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import { useManipulation } from '../useManipulation';
import { LabCard, PromptCard, VerdictBanner } from '../primitives/LabKit';
import KidFigure from '../primitives/KidFigure';
import { useLabCoach } from '../primitives/LabCoach';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import { LEVELS } from '../levels';
import * as L from '../logic/kitPacker';

/**
 * kit-packer — DEUX FAÇONS DE REMPLIR LES MÊMES CARTABLES : « ورشة الحقائب التضامنية » (2AM, unité 1, درس « توزيع الضرب على الجمع والطرح », 2026-10-29). La logique, exacte, est dans
 * `logic/kitPacker.js` (sur `packages/core/arithmetic/chainOps.js`, étage L4, importé PAR CHEMIN) ; le monde (thème `solidarity`) est dessiné ici : l'atelier du نادي التضامن, les cartables, deux
 * distributeurs à cadran, un tapis qui distribue UN PAR CARTABLE, Fatima (KidFigure, hijab) qui remplit cartable par cartable et Ali (sweat à capuche) qui règle les distributeurs. Distinct de
 * `area-split` (3AM : un champ vu d'en haut dont un bouton coupe un CÔTÉ — la distributivité comme AIRE), de `turf-factoring` / `pitch-expansion` (4AM), de `fair-share` (1AM : partage d'UNE
 * quantité) et d'`egg-trays` (2AM : emballer des œufs, division euclidienne) : ici des quantités discrètes sont DISTRIBUÉES à k cartables et la main règle ce que chaque distributeur sort.
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. La main règle combien chaque distributeur sort (cadran : glisser en rond, − / +, flèches et PageUp / PageDown) ; en k4 le NOMBRE de cartables ; en a1 le nombre rond et le petit nombre.
 * B. « وزّع » : le tapis donne un objet par cartable à tour de rôle ; un cartable manquant, trop plein ou inégal se VOIT et se compte ; les deux compteurs (Fatima / Ali) s'allument ensemble
 *    seulement quand tous les cartables sont prêts — deux totaux égaux ne suffisent pas (n = 20, m = 10 → 30 = 30 et des cartables faux).
 * C. Contraintes : aucune valeur négative ; chargement ≤ 120 ; en k3 une benne reçoit les cahiers abîmés ; en k4 les distributeurs sont verrouillés.
 * D. Chaque distribution, refus, prédiction, découpage est un essai (`logic/kitPacker.js` « ÉVÉNEMENTS »).
 * E. Découverte : les questions posées PAR-DESSUS le labo (LabCheckpoint) après k1, k2, k3, k4, a1 et a3 finissent sur la RÈGLE.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        k × (a + b) = k × a + k × b (et la différence) : multiplier une somme, c'est multiplier CHAQUE terme ; lue à l'envers, le facteur commun sort
 *   OBJECT         des cartables, deux distributeurs à cadran, un tapis, deux compteurs ; Fatima et Ali
 *   VARIABLE       ce que chaque distributeur sort (n, m) ; en k4 le nombre de cartables k ; en a1 p et q avec p ± q = 48
 *   INVARIANT      k et le contenu d'un cartable (a, b) ; la valeur totale
 *   TRANSFORMATION le tapis distribue n et m aux k cartables, un par cartable
 *   CONSTRAINT     un cartable est prêt quand il a exactement a et b ; k doit diviser le chargement
 *   RESISTANCE     des cartables sans stylos (6 × 4 + 3), des restes sur le tapis, des parts inégales, 30 = 30 qui ne suffit pas
 *   EVIDENCE       les cartables et leur contenu, les deux compteurs, la phrase du verdict
 *   CONTRAST       k × a + b (3 cartables servis) / k × (a + b) · 2 abîmés au lieu de 14 · k = 10 au lieu de 12
 *   PREDICTION     (متقدم) le total qui sort du magasin, écrit avant « وزّع »
 *   DISCOVERY      les questions finales de k1, k2, k3, k4, a1, a3
 *   FORMALIZATION  « ضرب عدد في مجموع = مجموع جداءَي هذا العدد في حدّي المجموع » · « … وكذلك في فرق » · « نحلّل بإخراج العامل المشترك »
 *   TRANSFER       « جرّب أعدادك » (toujours ouvert), les exercices et la banque
 *
 * D'UN SEUL REGARD (§8bis) : `[data-kit-glance]`. ONBOARDING : `logic/kitPacker.js › coachOf`. Props : `tasks`, `level`, `levels`, `coach`, `checkpoints`, `title`, `lead`, `onTrial(event)`, `onFinished({ world })`.
 * CONTRAT DOM : [data-kit][data-task][data-solved], [data-kit-glance], [data-kit-fatima], [data-kit-ali], [data-kit-counter=<fatima|ali>][data-lit], [data-kit-dial=<n|m|p|q>][data-locked],
 * [data-kit-dial-plus=<id>], [data-kit-dial-minus=<id>], [data-kit-deal], [data-kit-belt], [data-kit-bag=<i>][data-state], [data-kit-predict],
 * [data-kit-predict-input], [data-kit-predict-lock], [data-kit-split-p], [data-kit-split-q], [data-kit-split-op=<+|−>], [data-kit-verdict], [data-kit-next], [data-kit-free][data-active],
 * [data-kit-free-k|a|b], [data-kit-free-op], [data-kit-free-show].
 */
const NS = 'manipulation.kitPacker';
const LRI = '⁦';
const PDI = '⁩';
const iso = (s) => `${LRI}${s}${PDI}`;
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-indigo-300';
const BAG_COLORS = ['#6366F1', '#0EA5E9', '#14B8A6', '#F59E0B', '#EC4899', '#8B5CF6'];

export function numbersFor({ tasks, world, level }) {
  const lv = resolveLevelId(level ?? 'beginner');
  const asked = LEVELS['kit-packer'][lv].numbers;
  return { tasks: tasks ?? asked.tasks, world: world ?? 'solidarity' };
}

export const CSS = `
@keyframes kp-shake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-5px); } 40% { transform: translateX(5px); } 60% { transform: translateX(-3px); } 80% { transform: translateX(3px); } }
.kp-shake { animation: kp-shake 0.4s ease-in-out; }
@keyframes kp-pop { 0% { transform: scale(0.85); } 60% { transform: scale(1.1); } 100% { transform: scale(1); } }
.kp-pop { animation: kp-pop 0.3s ease-out; }
@keyframes kp-glow { 0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,.5); } 50% { box-shadow: 0 0 0 8px rgba(16,185,129,0); } }
.kp-glow { animation: kp-glow 1.2s ease-in-out 2; }
@media (prefers-reduced-motion: reduce) { .kp-shake, .kp-pop, .kp-glow { animation: none; } }
.kp-floor { background-color: #FEF3C7; background-image: repeating-linear-gradient(90deg, rgba(180,120,40,.10) 0 2px, transparent 2px 22px); }
`;

/** Les étiquettes des deux distributeurs et les mots du verdict selon la tâche. */
export function labelsOf(task) {
  if (task.id === 'k3') return { a: 'packs', b: 'reject', what: 'good', whatA: 'good', whatB: 'good' };
  if (task.unit === 'm') return { a: 'red', b: 'blue', what: 'm', whatA: 'm', whatB: 'm' };
  return { a: 'notebooks', b: 'pens', what: 'notebooks', whatA: 'notebooks', whatB: 'pens' };
}
const fmt = (x) => (Number.isInteger(x) ? String(x) : String(Math.round(x * 100) / 100).replace('.', ','));

export default function KitPacker({
  tasks, world, title, lead, level, levels: withLevels = true, coach: coachOn = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const initialNumbers = useMemo(() => numbersFor({ tasks, world, level }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'kit-packer', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nums = state.numbers;
  const numsKey = JSON.stringify(nums);
  const [lab, setLab] = useState(() => L.init(nums));
  const [scene, setScene] = useState({ key: numsKey, epoch: state.epoch, inits: 0 });
  if (scene.key !== numsKey || scene.epoch !== state.epoch) {
    setScene({ key: numsKey, epoch: state.epoch, inits: scene.inits + 1 });
    setLab(L.init(nums));
  }
  const cur = L.taskOf(lab);
  const cpSettings = useLabCheckpointSettings('kit-packer');
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
      if (ev.tk === 'solved') playSfx('bell');
      else if (ev.tk === 'refused') playSfx('over');
      else if (ev.tk === 'predict' || ev.tk === 'deal' || ev.tk === 'split') playSfx('tooth');
    }
    reported.current = nTrials;
  }, [nTrials, lab.trials]); // eslint-disable-line react-hooks/exhaustive-deps

  const coachStep = coachOn && !cp.open ? L.coachOf(lab) : null;
  const coach = useLabCoach({
    lab: 'kit-packer', step: coachStep,
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
      type="kit-packer"
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
        <div ref={boxRef} className="space-y-2" data-kit data-task={lab.ti} data-world={lab.world} data-solved={everyDone ? 'true' : 'false'}>
          <style dangerouslySetInnerHTML={{ __html: CSS }} />
          <Lab lab={lab} setLab={setLab} k={k} width={width} screenH={screenH} lead={state.isAuthoredLevel ? lead : null} cp={cp} report={(ev) => state.report(onTrial, ev)} />
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ══════════════ Le cadran d'un distributeur ══════════════ */

function Dial({ id, label, value, onChange, step = 1, max = L.MAX_DIAL, min = 0, disabled, locked, tone = 'sky', k, small }) {
  const acc = useRef({ a: null, sum: 0 });
  const R = small ? 24 : 30;
  const turns = 24;
  const angle = ((value % turns) / turns) * 360;
  const move = (d) => { if (!disabled) { onChange(Math.max(min, Math.min(max, value + d))); playSfx('tooth', { pitch: 1 + (value % 7) / 20 }); } };
  const tones = { sky: ['#0EA5E9', 'bg-sky-50 border-sky-300 text-sky-900'], rose: ['#F43F5E', 'bg-rose-50 border-rose-300 text-rose-900'], emerald: ['#10B981', 'bg-emerald-50 border-emerald-300 text-emerald-900'], amber: ['#F59E0B', 'bg-amber-50 border-amber-300 text-amber-900'] };
  const [col, cls] = tones[tone];
  const onDown = (e) => {
    if (disabled) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const r = e.currentTarget.getBoundingClientRect();
    acc.current = { a: Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)), sum: 0 };
  };
  const onMove = (e) => {
    if (acc.current.a == null) return;
    const r = e.currentTarget.getBoundingClientRect();
    const a = Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2));
    let d = a - acc.current.a;
    if (d > Math.PI) d -= 2 * Math.PI; else if (d < -Math.PI) d += 2 * Math.PI;
    acc.current = { a, sum: acc.current.sum + d };
    const unit = (2 * Math.PI) / turns;
    const n = Math.trunc(acc.current.sum / unit);
    if (n) { acc.current.sum -= n * unit; move(n * step); }
  };
  const onUp = () => { acc.current = { a: null, sum: 0 }; };
  const keyDown = (e) => {
    const map = { ArrowUp: step, ArrowRight: step, ArrowDown: -step, ArrowLeft: -step, PageUp: step * 10, PageDown: -step * 10 };
    if (map[e.key] != null) { e.preventDefault(); move(map[e.key]); }
  };
  const btn = `flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 bg-white text-slate-900 shadow-[0_3px_0_0_#CBD5E1] active:translate-y-0.5 disabled:opacity-35 disabled:shadow-none ${ring}`;
  return (
    <div className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-2xl border-2 px-1.5 py-1 ${cls}`} data-kit-dispenser={id}>
      <span className="text-center text-[12px] font-black leading-tight">{label}</span>
      <div className="flex items-center gap-1" dir="ltr">
        <button type="button" data-kit-dial-minus={id} disabled={disabled || locked || value <= min} onClick={() => move(-step)} aria-label={k('dial.minus', { what: label })} className={`${btn} border-slate-400`}><Minus className="h-5 w-5" aria-hidden="true" /></button>
        <div role="spinbutton" tabIndex={disabled || locked ? -1 : 0} aria-valuenow={value} aria-valuemin={min} aria-valuemax={max} aria-label={k('dial.aria', { what: label, v: value })}
          data-kit-dial={id} data-locked={locked ? 'true' : 'false'} onKeyDown={keyDown} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
          className={`relative touch-none select-none ${ring} rounded-full`} style={{ width: R * 2 + 4, height: R * 2 + 4, touchAction: 'none', cursor: disabled || locked ? 'default' : 'grab' }}>
          <svg width={R * 2 + 4} height={R * 2 + 4} viewBox={`0 0 ${R * 2 + 4} ${R * 2 + 4}`} aria-hidden="true" className="absolute inset-0">
            <circle cx={R + 2} cy={R + 2} r={R} fill="#fff" stroke={col} strokeWidth={4} />
            {Array.from({ length: 12 }, (_, i) => <line key={i} x1={R + 2} y1={5} x2={R + 2} y2={9} stroke="#94A3B8" strokeWidth={1.5} transform={`rotate(${i * 30} ${R + 2} ${R + 2})`} />)}
            <g transform={`rotate(${angle} ${R + 2} ${R + 2})`}><circle cx={R + 2} cy={9} r={3.5} fill={col} /></g>
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-mono text-2xl font-black tabular-nums text-slate-900" data-kit-readout={id}>{locked ? <span className="flex flex-col items-center leading-none"><Lock className="h-3 w-3 text-slate-500" aria-hidden="true" />{value}</span> : value}</span>
        </div>
        <button type="button" data-kit-dial-plus={id} disabled={disabled || locked || value >= max} onClick={() => move(step)} aria-label={k('dial.plus', { what: label })} className={`${btn} border-slate-400`}><Plus className="h-5 w-5" aria-hidden="true" /></button>
      </div>
    </div>
  );
}

/* ══════════════ Un cartable ══════════════ */

function Bag({ i, size, color, a, b, state, label, showTexts }) {
  const w = size; const h = Math.round(size * 1.12);
  const notebooks = Math.min(8, Math.round(a)); const pens = Math.min(6, Math.round(b));
  const ring2 = state === 'ready' ? '#10B981' : state === 'short' ? '#E11D48' : state === 'extra' ? '#D97706' : 'transparent';
  return (
    <div data-kit-bag={i} data-state={state} aria-label={label} className="flex flex-col items-center" style={{ width: w }}>
      <svg width={w} height={h} viewBox="0 0 44 50" aria-hidden="true">
        <rect x={9} y={2} width={26} height={9} rx={4.5} fill="none" stroke={color} strokeWidth={3} />
        <rect x={4} y={8} width={36} height={40} rx={9} fill={color} stroke={ring2} strokeWidth={ring2 === 'transparent' ? 0 : 3} strokeDasharray={state === 'short' ? '4 3' : undefined} />
        <rect x={4} y={8} width={36} height={14} rx={7} fill="#000" opacity={0.14} />
        <rect x={9} y={24} width={26} height={20} rx={4} fill="#fff" opacity={0.92} />
        {Array.from({ length: notebooks }, (_, j) => <rect key={`n${j}`} x={11 + (j % 4) * 6} y={26 + Math.floor(j / 4) * 6} width={5} height={5} rx={1} fill="#1D4ED8" />)}
        {Array.from({ length: pens }, (_, j) => <rect key={`p${j}`} x={11 + j * 4} y={38} width={2.4} height={5.5} rx={1} fill="#E11D48" />)}
        {state === 'ready' && <circle cx={36} cy={10} r={6} fill="#10B981" />}
        {state === 'ready' && <path d="M33 10 l2.4 2.4 l4-4.4" stroke="#fff" strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
      </svg>
      {showTexts && <span className="font-mono text-[11px] font-black leading-none tabular-nums text-slate-800" dir="ltr">{fmt(a)}<span className="text-slate-400">·</span>{fmt(b)}</span>}
    </div>
  );
}

/* ══════════════ Les cartables et le tapis ══════════════ */

function useDealAnim(dealt) {
  const total = dealt ? Math.max(dealt.n, dealt.m, 1) : 0;
  // un laboratoire remonté (retour de la modale de questions) montre la distribution DÉJÀ faite, sans la rejouer
  const [st, setSt] = useState(() => ({ d: dealt, p: dealt ? total : null }));
  useEffect(() => {
    if (!dealt) { setSt({ d: null, p: null }); return undefined; }
    if (st.d === dealt) return undefined;
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce || typeof window === 'undefined') { setSt({ d: dealt, p: total }); return undefined; }
    let t = 0; setSt({ d: dealt, p: 0 });
    const step = Math.max(1, Math.ceil(total / 18));
    const id = setInterval(() => { t += step; if (t >= total) { setSt({ d: dealt, p: total }); clearInterval(id); } else setSt({ d: dealt, p: t }); }, 55);
    return () => clearInterval(id);
  }, [dealt]); // eslint-disable-line react-hooks/exhaustive-deps
  // une nouvelle distribution est « en cours » dès son premier rendu (avant que l'effet ne la démarre)
  const p = dealt && st.d === dealt ? st.p : null;
  return { p, running: !!dealt && (p == null || p < total) };
}

function Belt({ lab, task, anim, width }) {
  const dealt = lab.dealt;
  const k = task.kind === 'fill' ? task.k : dealt?.k ?? lab.k;
  const bags = task.kind === 'bags' ? lab.k : task.kind === 'split' ? task.k : task.k;
  const done = anim.p == null ? 0 : anim.p;
  const j = dealt?.judged;
  const rows = bags > 8 ? 2 : 1;
  const perRow = Math.ceil(bags / rows);
  const avail = Math.max(240, width - 8);
  const size = Math.max(34, Math.min(60, Math.floor(avail / perRow) - 6));
  const need = task.kind === 'split' ? [task.n, 0] : [Number(String(task.needA ?? 0).replace(',', '.')), Number(String(task.needB ?? 0).replace(',', '.'))];
  const view = (idx) => {
    if (!dealt || task.kind === 'split') return { a: 0, b: 0, state: dealt && j?.ok ? 'ready' : 'idle' };
    if (task.unit === 'm') { const fa = Math.min(done, dealt.n) / bags; const fb = Math.min(done, dealt.m) / bags; return { a: fa, b: fb, state: anim.running ? 'idle' : j?.ok ? 'ready' : (fa < need[0] || fb < need[1]) ? 'short' : 'extra' }; }
    const goodA = task.op === '−' ? Math.max(0, dealt.n - dealt.m) : dealt.n;
    const ca = L.dealPrefix(Math.min(done, goodA), bags)[idx];
    const cb = task.op === '−' ? 0 : L.dealPrefix(Math.min(done, dealt.m), bags)[idx];
    if (anim.running) return { a: ca, b: cb, state: 'idle' };
    const st = ca === need[0] && cb === need[1] ? 'ready' : ca < need[0] || cb < need[1] ? 'short' : 'extra';
    return { a: ca, b: cb, state: st };
  };
  const rowsArr = Array.from({ length: rows }, (_, r) => Array.from({ length: perRow }, (__, c) => r * perRow + c).filter((i) => i < bags));
  return (
    <div className="kp-floor rounded-xl border-2 border-amber-300 px-1 pb-1 pt-1" data-kit-belt data-running={anim.running ? 'true' : 'false'} dir="ltr">
      <div className="mb-1 h-2 rounded-full bg-slate-600 shadow-inner" aria-hidden="true"><div className="h-full rounded-full bg-slate-400/70" style={{ width: `${dealt && anim.running ? (done / Math.max(1, Math.max(dealt.n, dealt.m))) * 100 : 0}%` }} /></div>
      {rowsArr.map((row, r) => (
        <div key={r} className="flex items-end justify-center gap-1.5">
          {row.map((i) => { const v = view(i); return <Bag key={i} i={i} size={size} color={BAG_COLORS[i % BAG_COLORS.length]} a={v.a} b={v.b} state={v.state} label={`${i + 1}`} showTexts={task.kind !== 'split'} />; })}
        </div>
      ))}
      {k === 0 && null}
    </div>
  );
}

/* ══════════════ Le laboratoire ══════════════ */

function Lab({ lab, setLab, k, width, lead, cp, report }) {
  const task = L.taskOf(lab);
  const done = L.taskDone(lab);
  const anim = useDealAnim(lab.dealt);
  const settled = !anim.running;
  const labels = labelsOf(task);
  const ctx = k(`story.${task.id}`);
  const question = k(`question.${task.id}`);
  const stepDone = lab.tasks.map((_, i) => !!lab.done[i] && (i !== lab.ti || (!cp.blocking && (i !== lab.ti || settled))));
  const steps = lab.tasks.length > 1 && <LabStepper count={lab.tasks.length} current={lab.ti} done={stepDone} stepAttr="data-kit-step" />;
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
    <PromptCard size="md" context={<span><MathText>{ctx}</MathText></span>} contextProps={{ 'data-kit-context': task.id }}
      title={<MathText>{question}</MathText>} titleClassName="text-lg" lamp={done && settled ? 'on' : 'off'}
      titleProps={{ 'data-kit-prompt': task.kind, 'data-lit': done ? 'true' : 'false' }}
      aside={steps || undefined} instruction={lead || undefined} />
  );
  const mood = done && settled ? 'proud' : lab.flash && !lab.flash.ok && settled ? 'wonder' : 'happy';
  const vv = verdictOf(lab, k, task, labels, settled);
  const canNext = L.canNext(lab) && !cp.blocking && settled;
  const Icon = vv.tone === 'emerald' ? CheckCircle2 : vv.tone === 'indigo' ? Hand : Sparkles;
  const c = L.counters(task, lab);
  const lit = done && settled;
  const showFatima = !!lab.dealt && settled;
  const banner = (
    <VerdictBanner tone={vv.tone} icon={Icon} size="sm" className="min-h-[2.75rem] !py-1.5" data-kit-verdict={vv.code}>
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
        <p className={vv.tone === 'indigo' ? 'font-bold text-indigo-900' : ''}><MathText>{vv.text}</MathText></p>
        {canNext && (
          <button type="button" onClick={() => setLab(L.nextTask)} data-kit-next
            className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-2 border-emerald-600 bg-emerald-600 px-3.5 text-sm font-black text-white shadow-[0_3px_0_0_#047857] transition-all duration-150 active:translate-y-0.5 motion-reduce:transition-none ${ring}`}>
            {k('next')} <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </VerdictBanner>
  );
  const pred = L.predictOpen(lab);
  return (
    <>
      <div className="relative space-y-1.5" data-kit-glance>
        {party.node}
        {cp.node}
        {prompt}
        {/* Fatima et Ali, et leurs deux compteurs */}
        <div className="flex items-center justify-between gap-1.5" dir="ltr">
          <svg width={50} height={64} viewBox="0 0 50 64" aria-hidden="true" data-kit-fatima className="shrink-0">
            <KidFigure cx={25} top={6} foot={60} mood={mood} skin="light" hair="brown" outfit="violet" hairStyle="hijab" scarf="lavender" />
          </svg>
          <Counter who="fatima" k={k} lit={lit} label={k('counter.fatima')} expr={c.kit} value={showFatima ? c.kitValue : null} />
          <Counter who="ali" k={k} lit={lit} label={k('counter.ali')} expr={c.hand} value={showFatima ? c.handValue : null} />
          <svg width={50} height={64} viewBox="0 0 50 64" aria-hidden="true" data-kit-ali className="shrink-0">
            <KidFigure cx={25} top={6} foot={60} mood={mood} skin="tan" hair="black" outfit="blue" hairStyle="short" />
          </svg>
        </div>
        {pred && <Predict lab={lab} setLab={setLab} k={k} task={task} />}
        <Dispensers lab={lab} setLab={setLab} k={k} task={task} labels={labels} dim={pred} />
        <Belt lab={lab} task={task} anim={anim} width={width} />
        <div className="flex items-center gap-2">
          <button type="button" data-kit-deal disabled={!L.canDeal(lab) || !settled} onClick={() => { setLab(L.dealNow); }}
            className={`inline-flex min-h-[48px] items-center gap-2 rounded-full border-2 border-indigo-700 bg-indigo-600 px-6 text-base font-black text-white shadow-[0_3px_0_0_#3730A3] active:translate-y-0.5 disabled:opacity-40 disabled:shadow-none ${ring}`}>
            {settled ? k('deal') : k('dealing')}
          </button>
        </div>
        {pred ? null : banner}
      </div>
      <FreeCard k={k} report={report} />
    </>
  );
}

function Counter({ who, k, lit, label, expr, value }) {
  return (
    <div data-kit-counter={who} data-lit={lit ? 'true' : 'false'} className={`min-w-0 flex-1 rounded-xl border-2 px-2 py-1 text-center ${lit ? 'kp-glow border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-white'}`}>
      <span className="block truncate text-[11px] font-black leading-tight text-slate-600" dir="rtl">{label}</span>
      <span className="block truncate font-mono text-[13px] font-black leading-tight text-slate-900" dir="ltr">{expr}</span>
      <span className="block font-mono text-lg font-black leading-tight text-indigo-900" dir="ltr">{value != null ? `= ${value}` : k('counter.empty')}</span>
    </div>
  );
}

function Predict({ lab, setLab, k, task }) {
  return (
    <LabCard className="flex flex-wrap items-center gap-2 border-indigo-200 bg-indigo-50/60 px-3 py-1.5" data-kit-predict>
      <span className="text-sm font-black text-indigo-900">{k('predict.label')}</span>
      <input value={lab.predicted} inputMode="decimal" dir="ltr" maxLength={7} aria-label={k('predict.input')} data-kit-predict-input
        onChange={(e) => setLab((s) => L.setPredict(s, e.target.value))} onKeyDown={(e) => { if (e.key === 'Enter') setLab(L.lockPredict); }}
        className={`min-h-[44px] w-28 rounded-xl border-2 border-indigo-300 bg-white px-3 font-mono text-lg font-black ${ring}`} />
      <button type="button" data-kit-predict-lock disabled={!L.canLockPredict(lab)} onClick={() => setLab(L.lockPredict)}
        className={`min-h-[44px] rounded-full border-2 border-indigo-700 bg-indigo-600 px-4 text-sm font-black text-white disabled:opacity-40 ${ring}`}>{k('predict.lock')}</button>
      {task && null}
    </LabCard>
  );
}

function Dispensers({ lab, setLab, k, task, labels, dim }) {
  const wrap = `flex items-stretch gap-2 ${dim ? 'pointer-events-none opacity-50' : ''}`;
  if (task.kind === 'bags') {
    return (
      <div className={wrap} data-kit-dispensers>
        <Dial id="n" label={`${k('dispenser.notebooks')}`} value={task.n} locked disabled onChange={() => {}} k={k} tone="sky" small />
        <Dial id="m" label={`${k('dispenser.pens')}`} value={task.m} locked disabled onChange={() => {}} k={k} tone="rose" small />
        <Dial id="k" label={k('dispenser.bags')} value={lab.k} min={1} max={L.MAX_BAGS} onChange={(v) => setLab((s) => L.setBags(s, v))} disabled={!L.bagsOpen(lab)} k={k} tone="emerald" small />
      </div>
    );
  }
  if (task.kind === 'split') {
    return (
      <div className={wrap} data-kit-dispensers>
        <div data-kit-split-p className="flex-1"><Dial id="p" label={k('dispenser.rolls')} value={lab.p} step={10} min={10} max={100} onChange={(v) => setLab((s) => L.setSplit(s, { p: v }))} disabled={!L.splitOpen(lab)} k={k} tone="sky" /></div>
        <div className="flex shrink-0 flex-col items-center justify-center gap-1" dir="ltr" role="group">
          {['+', '−'].map((o) => (
            <button key={o} type="button" data-kit-split-op={o} aria-pressed={lab.sop === o} disabled={!L.splitOpen(lab)} onClick={() => setLab((s) => L.setSplit(s, { sop: o }))}
              className={`h-11 w-11 rounded-full border-2 text-xl font-black ${lab.sop === o ? 'border-indigo-600 bg-indigo-100 text-indigo-900' : 'border-slate-300 bg-white text-slate-700'} ${ring}`}>{o}</button>
          ))}
        </div>
        <div data-kit-split-q className="flex-1"><Dial id="q" label={k('dispenser.small')} value={lab.q} min={0} max={20} onChange={(v) => setLab((s) => L.setSplit(s, { q: v }))} disabled={!L.splitOpen(lab)} k={k} tone="amber" /></div>
      </div>
    );
  }
  return (
    <div className={wrap} data-kit-dispensers>
      <Dial id="n" label={k(`dispenser.${labels.a}`)} value={lab.n} onChange={(v) => setLab((s) => L.setDial(s, 'n', v))} disabled={!L.dialsOpen(lab)} k={k} tone={task.op === '−' ? 'sky' : 'sky'} />
      <Dial id="m" label={k(`dispenser.${labels.b}`)} value={lab.m} onChange={(v) => setLab((s) => L.setDial(s, 'm', v))} disabled={!L.dialsOpen(lab)} k={k} tone={task.op === '−' ? 'amber' : 'rose'} />
    </div>
  );
}

/* ══════════════ Le verdict ══════════════ */

function verdictOf(lab, k, task, labels, settled) {
  const f = lab.flash;
  const j = f?.j;
  const predNote = () => {
    const ev = lab.trials.filter((e) => e.tk === 'predict' && e.task === task.id).at(-1);
    if (!ev) return '';
    return ` ${ev.ok ? k('predict.hit') : k('predict.miss', { p: iso(ev.predicted), t: iso(ev.total) })}`;
  };
  if (lab.dealt && !settled) return { text: k('dealing'), tone: 'amber', code: 'dealing' };
  if (L.taskDone(lab)) {
    if (task.kind === 'split') return { text: k('v.splitOk', { k: task.k, p: iso(lab.p), o: lab.sop, q: iso(lab.q), v: iso(task.totalText) }) + predNote(), tone: 'emerald', code: 'ok' };
    return { text: k('v.ready', { v: iso(L.counters(task, lab).handValue) }) + predNote(), tone: 'emerald', code: 'ok' };
  }
  if (f && !f.ok && j) {
    const code = f.reason;
    if (code === 'split') return { text: k('v.split', { p: iso(lab.p), o: lab.sop, q: iso(lab.q), n: iso(task.n) }), tone: 'rose', code };
    const s = f.side === 'B' ? j.sb : j.sa;
    const what = k(`what.${f.side === 'B' ? labels.whatB : labels.whatA}`);
    const kk = task.kind === 'bags' ? lab.k : task.k;
    if (code === 'pack') return { text: k('v.pack', { a: iso(task.a), b: iso(task.b) }), tone: 'rose', code };
    const need = f.side === 'B' ? task.needB : task.needA;
    if (code === 'unequal') {
      const total = f.side === 'B' ? lab.m : task.op === '−' ? Math.max(0, lab.n - lab.m) : lab.n;
      if (s.empty > 0) return { text: k('v.unequalEmpty', { empty: s.empty, what, n: iso(total) }) + predNote(), tone: 'rose', code };
      return { text: k('v.unequal', { n: iso(total), what, k: kk, min: iso(s.min), max: iso(s.max) }) + predNote(), tone: 'rose', code };
    }
    return { text: k(`v.${code}`, { per: iso(fmt(s.per)), what, need: iso(need) }) + predNote(), tone: 'rose', code };
  }
  if (L.predictOpen(lab)) return { text: k('idle.predict'), tone: 'indigo', code: '' };
  if (task.kind === 'bags') return { text: k('idle.bags'), tone: 'indigo', code: '' };
  if (task.kind === 'split') return { text: k('idle.split'), tone: 'indigo', code: '' };
  return { text: k('idle.dial'), tone: 'indigo', code: '' };
}

/* ══════════════ « جرّب أعدادك » : toujours ouvert ══════════════ */

function Stepper({ id, value, onChange, label, max, min = 0, k }) {
  const btn = `flex h-11 w-11 items-center justify-center rounded-full border-2 border-slate-400 bg-white disabled:opacity-35 ${ring}`;
  return (
    <div className="flex items-center gap-1" dir="ltr">
      <button type="button" className={btn} disabled={value <= min} onClick={() => onChange(value - 1)} aria-label={`− ${label}`}><Minus className="h-4 w-4" aria-hidden="true" /></button>
      <span className="flex min-w-[2.5rem] flex-col items-center leading-tight"><span className="font-mono text-xl font-black tabular-nums" data-kit-free-value={id}>{value}</span><span className="text-[10px] font-bold text-slate-600" dir="rtl">{label}</span></span>
      <button type="button" data-kit-free-plus={id} className={btn} disabled={value >= max} onClick={() => onChange(value + 1)} aria-label={`+ ${label}`}><Plus className="h-4 w-4" aria-hidden="true" /></button>
      {k && null}
    </div>
  );
}

function FreeCard({ k, report }) {
  const [v, setV] = useState({ k: 5, a: 6, b: 4, op: '+' });
  const [shown, setShown] = useState(false);
  const read = L.freeRead(v);
  const show = () => { setShown(true); if (read.ok) { report?.({ tk: 'custom', free: true, line: read.kit }); playSfx('bell'); } };
  return (
    <LabCard className="space-y-2 border-emerald-200 bg-emerald-50/50 p-3" data-kit-free data-active={shown && read.ok ? 'true' : 'false'}>
      <p className="flex items-center gap-1.5 text-sm font-black text-emerald-900"><FlaskConical className="h-4 w-4" aria-hidden="true" /> {k('free.title')}</p>
      <p className="text-xs font-bold leading-snug text-slate-600">{k('free.hint')}</p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2" data-kit-free-controls>
        <span data-kit-free-k><Stepper id="k" value={v.k} min={1} max={L.FREE_LIMITS.maxBags} onChange={(x) => { setV((s) => ({ ...s, k: x })); setShown(false); }} label={k('free.k')} k={k} /></span>
        <span data-kit-free-a><Stepper id="a" value={v.a} max={L.FREE_LIMITS.maxPerBag} onChange={(x) => { setV((s) => ({ ...s, a: x })); setShown(false); }} label={k('free.a')} k={k} /></span>
        <button type="button" data-kit-free-op onClick={() => { setV((s) => ({ ...s, op: s.op === '+' ? '−' : '+' })); setShown(false); }} aria-label={v.op === '+' ? k('op.plus') : k('op.minus')}
          className={`h-11 w-11 rounded-full border-2 border-emerald-600 bg-white text-2xl font-black text-emerald-900 ${ring}`}>{v.op}</button>
        <span data-kit-free-b><Stepper id="b" value={v.b} max={L.FREE_LIMITS.maxPerBag} onChange={(x) => { setV((s) => ({ ...s, b: x })); setShown(false); }} label={k('free.b')} k={k} /></span>
        <button type="button" data-kit-free-show onClick={show} className={`min-h-[44px] rounded-full border-2 border-emerald-700 bg-emerald-600 px-4 text-sm font-black text-white ${ring}`}>{k('deal')}</button>
      </div>
      {shown && !read.ok && <p className="text-sm font-bold text-rose-800" data-kit-free-error>{k(`free.why.${read.why}`)}</p>}
      {shown && read.ok && (
        <div className="space-y-1 text-sm font-bold text-teal-950" aria-live="polite">
          <p data-kit-free-kit>{k('free.kit', { t: iso(`${read.kit} = ${read.value}`) })}</p>
          <p data-kit-free-split>{k('free.split', { t: iso(`${read.split} = ${read.products} = ${read.value}`) })}</p>
          <p className="text-emerald-800">{k('free.same')}</p>
        </div>
      )}
    </LabCard>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite de questions de chaque tâche : elle interroge ce que l'élève vient de FAIRE, et mène à la règle. */
export const CHAINS = Object.freeze({
  k1: ['howMany18', 'why18', 'compare30'],
  k2: ['ruleSum'],
  k3: ['binCount', 'ruleDiff'],
  k4: ['bagsCount', 'commonCount', 'ruleFactor'],
  a1: ['whyEasier'],
  a3: ['whyAll'],
});

const Mx = (k, key) => <MathText>{k(`cp.${key}`)}</MathText>;
const mk = (qid) => (lab, task, k) => ({
  id: qid, kind: 'choice', prompt: Mx(k, `${qid}.prompt`),
  options: [
    { text: Mx(k, `${qid}.right`), correct: true },
    { text: Mx(k, `${qid}.w1`), why: Mx(k, `${qid}.w1why`) },
    { text: Mx(k, `${qid}.w2`), why: Mx(k, `${qid}.w2why`) },
  ],
  hints: [Mx(k, `${qid}.hint1`), Mx(k, `${qid}.hint2`)], explain: Mx(k, `${qid}.explain`),
});
export const QUESTIONS = Object.fromEntries(['howMany18', 'why18', 'compare30', 'ruleSum', 'binCount', 'ruleDiff', 'bagsCount', 'commonCount', 'ruleFactor', 'whyEasier', 'whyAll'].map((q) => [q, mk(q)]));
