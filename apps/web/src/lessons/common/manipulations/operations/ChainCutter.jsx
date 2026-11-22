import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Hand, Sparkles, ChevronLeft, FlaskConical, Scissors, Pin, Undo2, Paperclip, Link2 } from 'lucide-react';
import { resolveLevelId } from '@smarter-academy/core/curriculum/manipulationLevels.js';
import * as C from '@smarter-academy/core/arithmetic/chainOps.js';
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
import * as L from '../logic/chainCutter';

/**
 * chain-cutter — LA DERNIÈRE OPÉRATION SOUS LES CISEAUX : « مقصّ السلسلة » (2AM, unité 1, درس « وصف سلسلة حسابات », 2026-10-29). La logique, exacte, est dans `logic/chainCutter.js`
 * (sur `packages/core/arithmetic/chainOps.js`, étage L3, importé PAR CHEMIN) ; le monde (thème `corkboard`) est dessiné ici : une السبّورة فلّين, un ruban de papier imprimé, des agrafes en métal posées par
 * le calcul, des ciseaux, deux poches qui s'étiquettent, une planche d'autocollants, Yasmine (KidFigure, hijab) au téléphone. Distinct de `marble-run` (3AM : l'arbre est une course de billes pour SUBSTITUER),
 * de `merge-board` (3AM : fusion de tuiles du bas vers le haut), de `fraction-knife` / `area-split` (on coupe une QUANTITÉ) et de `coop-calculator` (L2 : on change l'écriture pour changer l'ordre) :
 * ici l'écriture est FIXE, la main cherche la racine en coupant, puis la nomme et décrit.
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. La main choisit OÙ couper (quel opérateur est la racine) : glisser les ciseaux sur un opérateur et lâcher, ou toucher l'opérateur puis « قصّ » (clavier : ← → puis Entrée) ; en متقدم aussi QUELS blocs coller par quelle opération, avec ou sans agrafe-parenthèse.
 * B. Une coupe à la racine ouvre la dernière agrafe et les morceaux tombent dans leurs poches ; ailleurs les ciseaux mordent une agrafe (secousse rouge) et la valeur « recollée » s'affiche (55 ≠ 27) — ou, si elle
 *    est égale par hasard, seule l'agrafe refuse. Un autocollant faux glisse. En متقدم les agrafes sont CACHÉES jusqu'à la première coupe (prédire puis voir).
 * C. Contraintes : l'écriture est imposée (jamais de texte libre dans les tâches) ; aucune valeur négative ; en collage la chaîne finale doit avoir la structure de la phrase.
 * D. Chaque coupe, refus, nom, collage est un essai (`logic/chainCutter.js` « ÉVÉNEMENTS »).
 * E. Découverte : les questions posées PAR-DESSUS le labo (LabCheckpoint) — c1 (la racine), c4 (les poches), c5 (la phrase), c6 (même valeur par hasard), a3 (le mshbak) — finissent sur la RÈGLE.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        la dernière opération nomme la chaîne et la coupe en deux blocs (termes / facteurs / dividende et diviseur) ; une phrase la décrit, imbriquée ; écrire une chaîne depuis une phrase demande des parenthèses
 *   OBJECT         une السبّورة فلّين, un ruban imprimé, des agrafes, des ciseaux, deux poches, des autocollants ; Yasmine
 *   VARIABLE       l'opérateur où l'on coupe (متقدم : quels blocs sont collés, par quelle opération, avec ou sans agrafe)
 *   INVARIANT      les agrafes sont posées par les règles du calcul, l'élève ne les déplace jamais ; la valeur du ruban ne change pas
 *   TRANSFORMATION chaque coupe sépare le ruban en deux morceaux qui se calculent seuls ; chaque collage en fait un seul
 *   CONSTRAINT     seule la racine recolle sans mordre ; une chaîne collée sans sa parenthèse a une autre racine
 *   RESISTANCE     le mordu (agrafe rouge + valeur recollée) ; l'autocollant qui glisse ; la chaîne refusée « شريطك مجموع »
 *   EVIDENCE       les agrafes et leurs étiquettes de valeur, les poches ordonnées, la phrase qui grandit
 *   CONTRAST       7 + 4 × 5 / (7 + 4) × 5 · 20 + 5 − 3 coupé à + (même valeur, agrafe quand même) · 15 + 9 ÷ 4 / (15 + 9) ÷ 4
 *   PREDICTION     (متقدم a1) les agrafes sont cachées jusqu'à la première coupe
 *   DISCOVERY      les questions finales de c1, c4, c5, c6, a3
 *   FORMALIZATION  « نسمّي السلسلة بآخر عملية تُنجز فيها » · « نصف كلّ قطعة بالطريقة نفسها » · « المشبك يجعل قطعة تُحسب وحدها »
 *   TRANSFER       « جرّب شريطك » (toujours ouvert), les exercices et la banque
 *
 * « جرّب شريطك » est TOUJOURS ouvert sous le labo (`[data-cutter-free]`). D'UN SEUL REGARD (§8bis) : `[data-cutter-glance]`. ONBOARDING : `logic/chainCutter.js › coachOf`.
 * Props : `tasks`, `level`, `levels`, `coach`, `checkpoints`, `title`, `lead`, `onTrial(event)`, `onFinished({ world })`.
 * CONTRAT DOM : [data-cutter][data-task][data-solved], [data-cutter-glance], [data-cutter-board], [data-cutter-strip], [data-cutter-tok=<i>], [data-cutter-op=<i>][data-eligible][data-cut], [data-cutter-staple=<i>][data-bite],
 * [data-cutter-scissors], [data-cutter-pin], [data-cutter-cut], [data-cutter-pocket=<cell>:<l|r>], [data-cutter-cell=<key>], [data-cutter-sticker=<name>], [data-cutter-sentence], [data-cutter-block=<id>][data-picked],
 * [data-cutter-op-chip=<o>], [data-cutter-clip=<l|r>], [data-cutter-glue], [data-cutter-undo], [data-cutter-verdict], [data-cutter-next], [data-cutter-free][data-active], [data-cutter-free-input], [data-cutter-free-show].
 */
const NS = 'manipulation.chainCutter';
const LRI = '⁦';
const PDI = '⁩';
const iso = (s) => `${LRI}${s}${PDI}`;
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-indigo-300';
const BOARD_PAD = 14;
const ROW_H = 26;

export function numbersFor({ tasks, world, level }) {
  const lv = resolveLevelId(level ?? 'beginner');
  const asked = LEVELS['chain-cutter'][lv].numbers;
  return { tasks: tasks ?? asked.tasks, world: world ?? 'corkboard' };
}

export const CSS = `
@keyframes cu-shake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-5px); } 40% { transform: translateX(5px); } 60% { transform: translateX(-3px); } 80% { transform: translateX(3px); } }
.cu-shake { animation: cu-shake 0.4s ease-in-out; }
@keyframes cu-pop { 0% { transform: scale(0.8); } 60% { transform: scale(1.12); } 100% { transform: scale(1); } }
.cu-pop { animation: cu-pop 0.3s ease-out; }
@keyframes cu-drop { 0% { transform: translateY(-14px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
.cu-drop { animation: cu-drop 0.35s ease-out; }
@media (prefers-reduced-motion: reduce) { .cu-shake, .cu-pop, .cu-drop { animation: none; } }
.cu-cork { background-color: #C58F5B; background-image: radial-gradient(rgba(120,70,30,.28) 1.2px, transparent 1.6px), radial-gradient(rgba(255,230,190,.25) 1px, transparent 1.4px); background-size: 14px 14px, 9px 9px; background-position: 0 0, 4px 6px; }
`;

export default function ChainCutter({
  tasks, world, title, lead, level, levels: withLevels = true, coach: coachOn = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const initialNumbers = useMemo(() => numbersFor({ tasks, world, level }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'chain-cutter', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nums = state.numbers;
  const numsKey = JSON.stringify(nums);
  const [lab, setLab] = useState(() => L.init(nums));
  const [scene, setScene] = useState({ key: numsKey, epoch: state.epoch, inits: 0 });
  if (scene.key !== numsKey || scene.epoch !== state.epoch) {
    setScene({ key: numsKey, epoch: state.epoch, inits: scene.inits + 1 });
    setLab(L.init(nums));
  }
  const cur = L.taskOf(lab);
  const cpSettings = useLabCheckpointSettings('chain-cutter');
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
      if (ev.tk === 'cut') playSfx(ev.ok ? 'tooth' : 'over');
      else if (ev.tk === 'name') playSfx(ev.ok ? 'bell' : 'wrong');
      else if (ev.tk === 'glue') playSfx(ev.ok === false ? 'wrong' : 'tooth');
    }
    reported.current = nTrials;
  }, [nTrials, lab.trials]); // eslint-disable-line react-hooks/exhaustive-deps

  const coachStep = coachOn && !cp.open ? L.coachOf(lab) : null;
  const coach = useLabCoach({
    lab: 'chain-cutter', step: coachStep,
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
      type="chain-cutter"
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
        <div ref={boxRef} className="space-y-2" data-cutter data-task={lab.ti} data-world={lab.world} data-solved={everyDone ? 'true' : 'false'}>
          <style dangerouslySetInnerHTML={{ __html: CSS }} />
          <Lab lab={lab} setLab={setLab} k={k} width={width} screenH={screenH} lead={state.isAuthoredLevel ? lead : null} cp={cp} report={(ev) => state.report(onTrial, ev)} />
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ══════════════ Le ruban sur la السبّورة ══════════════ */

const tokW = (tk, u) => (tk.t === 'num' ? (tk.text.length * 16 + 16) * u : tk.t === 'op' ? 46 * u : 20 * u);
const tokTxt = (tk) => (tk.t === 'num' ? tk.text : tk.t === 'op' ? tk.o : tk.ch === '[' ? '(' : tk.ch === ']' ? ')' : tk.ch);

function Board({ lab, setLab, k, width, hMax, mood }) {
  const task = L.taskOf(lab);
  const tokens = useMemo(() => C.analyse(task.text).tokens, [task.text]);
  const staples = task.staples;
  const shownStaples = L.staplesShown(lab);
  const cutToks = new Set(Object.values(lab.cells).filter((c) => c.cut).map((c) => c.cut.tok));
  const focus = L.focusCell(lab);
  const allowed = L.cutAllowed(lab);
  const avail = Math.max(260, width - BOARD_PAD * 2 - 84);
  const base = tokens.reduce((n, tk) => n + tokW(tk, 1), 0) + cutToks.size * 18;
  const u = Math.max(0.55, Math.min(1, avail / base));
  const font = Math.max(18, Math.round(30 * u));
  const gap = 18 * u;
  const xs = []; let x = 0;
  tokens.forEach((tk, i) => { xs.push(x); x += tokW(tk, u); if (cutToks.has(i)) x += gap; });
  const total = x;
  const maxLevel = Math.max(...staples.map((s) => s.level));
  const stripH = 50 * u + 8;
  const stapleZone = shownStaples ? maxLevel * ROW_H + 8 : 8;
  const topZone = 54;
  const stickerZone = 28;
  const H = topZone + stapleZone + stripH + stickerZone;
  const left0 = Math.max(6, (width - BOARD_PAD * 2 - 84 - total) / 2) + 8;
  const spanX = (lo, hi) => [xs[lo], xs[hi] + tokW(tokens[hi], u)];
  // opérateurs éligibles (dans la cellule en focus) et leur numéro RELATIF
  const eligible = [];
  if (allowed) { let rel = -1; for (let i = focus.lo; i <= focus.hi; i += 1) if (tokens[i].t === 'op') { rel += 1; eligible.push({ tok: i, rel }); } }
  const selTok = lab.sel != null ? eligible.find((e) => e.rel === lab.sel)?.tok : undefined;
  const bite = lab.flash && !lab.flash.ok && lab.flash.reason === 'staple' ? eligible.find((e) => e.rel === lab.flash.at)?.tok : undefined;
  const [drag, setDrag] = useState(null);
  const drop = (clientX, el) => {
    const r = el.parentElement.getBoundingClientRect();
    const px = clientX - r.left - left0;
    let best = null;
    eligible.forEach((e) => { const [a, b] = spanX(e.tok, e.tok); const d = Math.abs(px - (a + b) / 2); if (best == null || d < best.d) best = { d, e }; });
    if (best && best.d < 60) { setLab((s) => L.cut(L.selectOp(s, best.e.rel), best.e.rel)); }
  };
  const sx = drag ? drag.x : selTok != null ? (spanX(selTok, selTok)[0] + spanX(selTok, selTok)[1]) / 2 : 14;
  const keyDown = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); setLab((s) => L.moveSel(s, 1)); } else if (e.key === 'ArrowLeft') { e.preventDefault(); setLab((s) => L.moveSel(s, -1)); } else if (e.key === 'Enter') { e.preventDefault(); setLab((s) => (s.sel != null ? L.cut(s) : s)); }
  };
  return (
    <div className="flex items-stretch gap-2" data-cutter-board>
      <div className="cu-cork relative min-w-0 flex-1 overflow-hidden rounded-2xl border-[6px] border-amber-800 shadow-inner" style={{ height: Math.min(H, hMax) + 12 }} tabIndex={0} onKeyDown={keyDown} role="group" aria-label={k('board.aria')} dir="ltr">
        <div className="absolute" style={{ left: left0, top: topZone, width: total, height: stapleZone + stripH + stickerZone }} data-cutter-strip>
          {/* les agrafes */}
          {shownStaples && staples.map((s, i) => {
            const [a, b] = spanX(s.lo, s.hi);
            const gone = cutToks.has(s.tok);
            const biting = bite != null && s.lo <= bite && bite <= s.hi && s.tok !== bite;
            return (
              <div key={i} data-cutter-staple={i} data-bite={biting ? 'true' : 'false'} data-open={gone ? 'true' : 'false'} aria-label={k('staple.aria', { v: s.text })}
                className={`absolute flex items-start justify-center rounded-t-md border-x-[3px] border-t-[3px] ${biting ? 'cu-shake border-rose-600' : gone ? 'border-dashed border-slate-400/70' : 'border-slate-600'}`}
                style={{ left: a + 2, width: Math.max(10, b - a - 4), bottom: stripH + stickerZone + (s.level - 1) * ROW_H, height: ROW_H - 6 }}>
                <span className={`-mt-3 rounded-full px-1.5 text-[11px] font-black ${biting ? 'bg-rose-100 text-rose-800' : 'bg-white/90 text-slate-800'}`} dir="ltr">{s.text}</span>
              </div>
            );
          })}
          {/* le papier */}
          <div className="absolute rounded-md bg-amber-50 shadow-md ring-1 ring-amber-900/20" style={{ left: -6, width: total + 12, bottom: stickerZone, height: stripH }} />
          {tokens.map((tk, i) => {
            const op = tk.t === 'op';
            const el = eligible.find((e) => e.tok === i);
            const cutHere = cutToks.has(i);
            const sel = selTok === i;
            const named = Object.values(lab.cells).find((c) => c.cut?.tok === i && c.named);
            const style = { left: xs[i], width: tokW(tk, u), bottom: stickerZone, height: stripH, fontSize: font };
            const cls = `absolute flex items-center justify-center font-mono font-black tabular-nums ${op ? 'text-amber-800' : tk.t === 'num' ? 'text-slate-900' : 'text-slate-500'}`;
            const inner = cutHere ? <Scissors className="h-5 w-5 text-rose-600" aria-hidden="true" /> : tokTxt(tk);
            return (
              <React.Fragment key={i}>
                {op && el ? (
                  <button type="button" data-cutter-tok={i} data-cutter-op={el.rel} data-eligible="true" data-cut="false" aria-label={k('op.aria', { o: tk.o, i: el.rel + 1 })}
                    onClick={() => { setLab((s) => L.selectOp(s, el.rel)); playSfx('tooth', { pitch: 1.2 }); }}
                    className={`${cls} rounded-lg ${sel ? 'bg-rose-100 ring-4 ring-rose-400' : 'hover:bg-amber-100'} ${ring}`} style={style}>{inner}</button>
                ) : (
                  <span data-cutter-tok={i} {...(op ? { 'data-cutter-op': '', 'data-eligible': 'false', 'data-cut': cutHere ? 'true' : 'false' } : {})} className={cls} style={style}>{inner}</span>
                )}
                {named && <span className="cu-pop absolute whitespace-nowrap rounded-full bg-emerald-600 px-2 py-0.5 text-[11px] font-black text-white shadow" dir="rtl" style={{ left: xs[i] + tokW(tk, u) / 2, transform: 'translateX(-50%)', bottom: 2 }} data-cutter-named={i}>{C.CHAIN_NAMES[named.cut.o]}</span>}
              </React.Fragment>
            );
          })}
          {/* la pièce en cours */}
          {Object.values(lab.cells).some((c) => c.cut) && !L.taskDone(lab) && focus && (() => {
            const [a, b] = spanX(focus.lo, focus.hi);
            return <div className="pointer-events-none absolute rounded-lg border-4 border-dashed border-amber-500" style={{ left: a - 4, width: b - a + 8, bottom: stickerZone - 2, height: stripH + 4 }} />;
          })()}
        </div>
        {/* les ciseaux */}
        {allowed && (
          <button type="button" data-cutter-scissors aria-label={k('scissors.aria')} title={k('scissors.key')}
            onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); setDrag({ x: sx }); }}
            onPointerMove={(e) => { if (!drag) return; const r = e.currentTarget.parentElement.getBoundingClientRect(); setDrag({ x: e.clientX - r.left - left0 }); }}
            onPointerUp={(e) => { if (drag) { drop(e.clientX, e.currentTarget); setDrag(null); } }}
            onPointerCancel={() => setDrag(null)}
            className={`absolute flex touch-none items-center justify-center rounded-full border-2 border-slate-700 bg-slate-100 shadow-lg ${ring}`}
            style={{ left: left0 + sx - 28, top: 4, width: 56, height: 56, cursor: 'grab', touchAction: 'none' }}>
            <Scissors className="h-8 w-8 rotate-90 text-slate-800" aria-hidden="true" />
          </button>
        )}
      </div>
      <svg width={76} height={Math.min(H, hMax)} viewBox={`0 0 76 ${Math.min(H, hMax)}`} aria-hidden="true" className="shrink-0">
        <KidFigure cx={38} top={Math.max(10, Math.min(H, hMax) - 112)} foot={Math.min(H, hMax) - 10} mood={mood} skin="light" hair="brown" outfit="violet" hairStyle="hijab" scarf="lavender" />
        <rect x={56} y={Math.min(H, hMax) - 74} width={12} height={22} rx={3} fill="#0F172A" /><rect x={58} y={Math.min(H, hMax) - 71} width={8} height={14} rx={1.5} fill="#38BDF8" />
      </svg>
    </div>
  );
}

/* ══════════════ Le laboratoire ══════════════ */

function Lab({ lab, setLab, k, width, screenH, lead, cp, report }) {
  const task = L.taskOf(lab);
  const done = L.taskDone(lab);
  const flash = lab.flash;
  const ctx = k(`story.${task.id}`);
  const question = k(`question.${task.id}`);
  const stepDone = lab.tasks.map((_, i) => !!lab.done[i] && (i !== lab.ti || !cp.blocking));
  const steps = lab.tasks.length > 1 && <LabStepper count={lab.tasks.length} current={lab.ti} done={stepDone} stepAttr="data-cutter-step" />;
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
    <PromptCard size="md" context={<span>{ctx}</span>} contextProps={{ 'data-cutter-context': task.id }}
      title={<MathText>{question}</MathText>} titleClassName="text-lg" lamp={done ? 'on' : 'off'}
      titleProps={{ 'data-cutter-prompt': task.kind, 'data-lit': done ? 'true' : 'false' }}
      aside={steps || undefined} instruction={lead || undefined} />
  );
  const innerH = typeof window !== 'undefined' && window.innerHeight ? window.innerHeight : screenH + 40;
  const hMax = Math.max(170, Math.min(300, innerH - 24 - 420 - (lead ? 28 : 0)));
  const mood = done ? 'proud' : flash && !flash.ok ? 'wonder' : 'happy';
  const vv = verdictOf(lab, k, task);
  const canNext = L.canNext(lab) && !cp.blocking;
  const Icon = vv.tone === 'emerald' ? CheckCircle2 : vv.tone === 'indigo' ? Hand : Sparkles;
  const banner = (
    <VerdictBanner tone={vv.tone} icon={Icon} size="sm" className="min-h-[2.75rem] !py-1.5" data-cutter-verdict={vv.code}>
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
        <p className={vv.tone === 'indigo' ? 'font-bold text-indigo-900' : ''}><MathText>{vv.text}</MathText></p>
        {canNext && (
          <button type="button" onClick={() => setLab(L.nextTask)} data-cutter-next
            className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-2 border-emerald-600 bg-emerald-600 px-3.5 text-sm font-black text-white shadow-[0_3px_0_0_#047857] transition-all duration-150 active:translate-y-0.5 motion-reduce:transition-none ${ring}`}>
            {k('next')} <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </VerdictBanner>
  );
  return (
    <>
      <div className="relative space-y-2" data-cutter-glance>
        {party.node}
        {cp.node}
        {prompt}
        {task.kind === 'cut' ? <CutWorld lab={lab} setLab={setLab} k={k} width={width} hMax={hMax} mood={mood} /> : <GlueWorld lab={lab} setLab={setLab} k={k} mood={mood} width={width} />}
        {banner}
      </div>
      <FreeCard k={k} report={report} />
    </>
  );
}

function CutWorld({ lab, setLab, k, width, hMax, mood }) {
  const done = L.taskDone(lab);
  const focus = L.focusCell(lab);
  const keys = L.cellKeys(lab).filter((key) => lab.cells[key].cut);
  const sentence = L.sentenceOf(lab);
  const fkey = lab.focus;
  return (
    <>
      <Board lab={lab} setLab={setLab} k={k} width={width} hMax={hMax} mood={mood} />
      <div className="flex flex-wrap items-center gap-2" data-cutter-controls>
        {L.canPin(lab) && (
          <button type="button" data-cutter-pin onClick={() => { setLab(L.pin); playSfx('tooth'); }}
            className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-full border-2 border-slate-600 bg-white px-4 text-sm font-black text-slate-800 shadow-[0_3px_0_0_#94A3B8] active:translate-y-0.5 ${ring}`}>
            <Pin className="h-4 w-4" aria-hidden="true" /> {k('pin')}
          </button>
        )}
        {L.cutAllowed(lab) && (
          <button type="button" data-cutter-cut disabled={!L.canCut(lab)} onClick={() => setLab((s) => L.cut(s))}
            className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-full border-2 border-rose-600 bg-rose-500 px-4 text-sm font-black text-white shadow-[0_3px_0_0_#9F1239] active:translate-y-0.5 disabled:opacity-40 disabled:shadow-none ${ring}`}>
            <Scissors className="h-4 w-4" aria-hidden="true" /> {k('cut')}
          </button>
        )}
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={k('stickers.title')}>
          <span className="sr-only">{k('stickers.title')}</span>
          {L.NAMES.map((name) => (
            <button key={name} type="button" data-cutter-sticker={name} disabled={!(focus?.cut && !focus.named) || done} onClick={() => setLab((s) => L.stick(s, name))}
              className={`min-h-[44px] rounded-full border-2 border-emerald-600 bg-emerald-50 px-2.5 text-[13px] font-black text-emerald-900 shadow-[0_3px_0_0_#6EE7B7] active:translate-y-0.5 disabled:opacity-35 disabled:shadow-none ${lab.flash?.reason === 'name' && lab.flash.name === name ? 'cu-shake' : ''} ${ring}`}>{name}</button>
          ))}
        </div>
      </div>
      {keys.length > 0 && (
        <div className="space-y-1.5">
          {keys.map((key) => {
            const c = lab.cells[key];
            const labels = L.POCKETS[c.cut.o];
            return (
              <div key={key} className="cu-drop grid grid-cols-2 gap-1.5" dir="ltr" data-cutter-pockets={key}>
                {['l', 'r'].map((side, si) => {
                  const cell = lab.cells[`${key}${side}`];
                  const num = L.isNumberCell(cell);
                  const open = !num && !cell.cut && !done;
                  const val = C.numText(C.evaluateB(cell.text));
                  const Tag = open ? 'button' : 'div';
                  return (
                    <Tag key={side} {...(open ? { type: 'button', onClick: () => setLab((s) => L.focusOn(s, `${key}${side}`)), 'data-cutter-cell': `${key}${side}` } : {})} data-cutter-pocket={`${key}:${side}`}
                      className={`flex min-h-[44px] items-center justify-between gap-2 rounded-xl border-2 px-2.5 py-0.5 text-start ${fkey === `${key}${side}` && !done ? 'border-amber-500 bg-amber-50' : 'border-slate-300 bg-white'} ${open ? `${ring} cursor-pointer` : ''}`}>
                      <span className="min-w-0">
                        <span className="block text-[10px] font-black leading-tight text-slate-500" dir="rtl">{k(`pocket.${labels[si]}`)}{open ? ` · ${k('pocket.again')}` : ''}</span>
                        <span className="block truncate font-mono text-base font-black leading-tight text-slate-900" data-cutter-piece>{cell.text}</span>
                      </span>
                      {!num && <span className="shrink-0 text-[11px] font-bold text-emerald-700" dir="rtl">{k('pocket.value', { v: iso(val) })}</span>}
                    </Tag>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
      <LabCard className="flex flex-wrap items-center gap-2 border-sky-200 bg-sky-50/60 px-3 py-1" data-cutter-sentence data-ready={sentence ? 'true' : 'false'}>
        <span className="text-xs font-black text-sky-900">{k('sentence.title')}</span>
        <span className="text-sm font-black text-slate-900">{sentence ?? k('sentence.empty')}</span>
      </LabCard>
    </>
  );
}

/* ══════════════ Le collage (متقدم) ══════════════ */

function GlueWorld({ lab, setLab, k, mood }) {
  const done = L.taskDone(lab);
  const pickIdx = (id) => lab.pick.indexOf(id);
  const evalText = (t) => { try { return C.numText(C.evaluateB(t)); } catch { return ''; } };
  return (
    <div className="flex items-stretch gap-2" data-cutter-board>
      <div className="cu-cork min-w-0 flex-1 space-y-2 rounded-2xl border-[6px] border-amber-800 p-3 shadow-inner" dir="ltr">
        <div className="flex flex-wrap items-center justify-center gap-3" role="group" aria-label={k('glue.blocks')}>
          {lab.blocks.map((b) => {
            const i = pickIdx(b.id);
            return (
              <button key={b.id} type="button" disabled={done} data-cutter-block={b.id} data-picked={i >= 0 ? String(i + 1) : 'false'} onClick={() => setLab((s) => L.pickBlock(s, b.id))}
                className={`relative min-h-[56px] rounded-md bg-amber-50 px-4 py-2 font-mono text-2xl font-black text-slate-900 shadow-md ring-1 ring-amber-900/20 ${i >= 0 ? 'ring-4 !ring-rose-400' : ''} ${ring}`}>
                {i >= 0 && <span className="absolute -top-2 -start-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-xs text-white">{i + 1}</span>}
                {b.text}
                {/[+−×÷]/.test(b.text) && <span className="block text-[11px] font-bold text-emerald-700" dir="rtl">{k('glue.value', { v: iso(evalText(b.text)) })}</span>}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2" dir="rtl">
          <span className="text-xs font-black text-amber-950">{k('glue.ops')}</span>
          {L.OPS.map((o) => (
            <button key={o} type="button" data-cutter-op-chip={o} disabled={done} onClick={() => setLab((s) => L.setOp(s, o))}
              className={`h-11 w-11 rounded-full border-2 text-xl font-black ${lab.op === o ? 'border-rose-600 bg-rose-100 text-rose-900' : 'border-amber-700 bg-white text-slate-900'} ${ring}`}>{o}</button>
          ))}
          <button type="button" data-cutter-clip="l" disabled={done} aria-pressed={lab.clipL} onClick={() => setLab((s) => L.toggleClip(s, 'l'))}
            className={`inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 px-3 text-xs font-black ${lab.clipL ? 'border-sky-600 bg-sky-100 text-sky-950' : 'border-slate-400 bg-white text-slate-700'} ${ring}`}><Paperclip className="h-4 w-4" aria-hidden="true" />{k('glue.clipL')}</button>
          <button type="button" data-cutter-clip="r" disabled={done} aria-pressed={lab.clipR} onClick={() => setLab((s) => L.toggleClip(s, 'r'))}
            className={`inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 px-3 text-xs font-black ${lab.clipR ? 'border-sky-600 bg-sky-100 text-sky-950' : 'border-slate-400 bg-white text-slate-700'} ${ring}`}><Paperclip className="h-4 w-4" aria-hidden="true" />{k('glue.clipR')}</button>
          <button type="button" data-cutter-glue disabled={!L.canGlue(lab)} onClick={() => setLab(L.glue)}
            className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-full border-2 border-emerald-700 bg-emerald-600 px-4 text-sm font-black text-white shadow-[0_3px_0_0_#047857] active:translate-y-0.5 disabled:opacity-40 disabled:shadow-none ${ring}`}><Link2 className="h-4 w-4" aria-hidden="true" />{k('glue.stick')}</button>
          <button type="button" data-cutter-undo disabled={!L.canUndo(lab)} onClick={() => setLab(L.undo)}
            className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-full border-2 border-slate-500 bg-white px-3 text-sm font-black text-slate-800 disabled:opacity-40 ${ring}`}><Undo2 className="h-4 w-4" aria-hidden="true" />{k('glue.undo')}</button>
        </div>
      </div>
      <svg width={76} height={150} viewBox="0 0 76 150" aria-hidden="true" className="shrink-0 self-end">
        <KidFigure cx={38} top={22} foot={140} mood={mood} skin="light" hair="brown" outfit="violet" hairStyle="hijab" scarf="lavender" />
      </svg>
    </div>
  );
}

/* ══════════════ Le verdict ══════════════ */

function verdictOf(lab, k, task) {
  const f = lab.flash;
  if (L.taskDone(lab)) {
    if (task.kind === 'glue' && f?.final) return { text: k('v.glueOk', { text: iso(lab.blocks[0].text), v: iso(f.value) }), tone: 'emerald', code: 'ok' };
    return { text: task.depth === 'full' ? k('v.doneFull', { s: L.sentenceOf(lab) }) : k('v.done'), tone: 'emerald', code: 'done' };
  }
  if (f && !f.ok) {
    if (f.reason === 'name') return { text: k('v.name'), tone: 'rose', code: 'name' };
    if (f.reason === 'glue') return { text: k('v.glueNo', { name: f.name, got: iso(f.got), want: f.wantName }), tone: 'rose', code: 'glue' };
    if (f.same) return { text: k('v.stapleSame', { v: iso(f.rebuilt) }), tone: 'rose', code: 'same' };
    if (f.rebuilt) return { text: k('v.staple', { v: iso(f.rebuilt), whole: iso(task.valueText) }), tone: 'rose', code: 'staple' };
    return { text: k('v.stapleNone'), tone: 'rose', code: 'staple' };
  }
  if (f?.ok && f.step) return { text: k('v.glueStep', { text: iso(lab.blocks.at(-1).text) }), tone: 'amber', code: 'step' };
  if (f?.ok && f.named != null) return { text: k('v.named', { name: C.CHAIN_NAMES[lab.cells[f.named].cut.o] }), tone: 'emerald', code: 'named' };
  if (f?.ok) return { text: k('v.cutOk', { v: iso(task.valueText) }), tone: 'emerald', code: 'cut' };
  if (task.kind === 'glue') return { text: k(lab.pick.length === 0 ? 'idle.glue' : lab.pick.length === 1 ? 'idle.pick' : lab.op ? 'idle.glue' : 'idle.op'), tone: 'indigo', code: '' };
  const c = L.focusCell(lab);
  if (L.canPin(lab)) return { text: k('idle.pin'), tone: 'indigo', code: '' };
  if (c?.cut && !c.named) return { text: k('idle.sticker'), tone: 'indigo', code: '' };
  if (Object.values(lab.cells).some((x) => x.cut) && c && !c.cut) return { text: k('idle.again'), tone: 'indigo', code: '' };
  return { text: k('idle.cut'), tone: 'indigo', code: '' };
}

/* ══════════════ « جرّب شريطك » : toujours ouvert ══════════════ */

function FreeCard({ k, report }) {
  const [text, setText] = useState('4 × (9 + 6)');
  const [shown, setShown] = useState(null);
  const [cutAt, setCutAt] = useState(null);
  const read = shown ? L.freeRead(shown) : null;
  const go = () => {
    setShown(text); setCutAt(null);
    const r = L.freeRead(text);
    if (r.ok) { report?.({ tk: 'custom', free: true, line: r.text, name: r.name }); playSfx('bell'); }
  };
  const cutRes = read?.ok && cutAt != null ? C.cutAt(read.text, cutAt) : null;
  return (
    <LabCard className="space-y-2 border-emerald-200 bg-emerald-50/50 p-3" data-cutter-free data-active={read?.ok ? 'true' : 'false'}>
      <p className="flex items-center gap-1.5 text-sm font-black text-emerald-900"><FlaskConical className="h-4 w-4" aria-hidden="true" /> {k('free.title')}</p>
      <p className="text-xs font-bold leading-snug text-slate-600">{k('free.hint')}</p>
      <div className="flex flex-wrap items-center gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') go(); }} dir="ltr" maxLength={40} data-cutter-free-input aria-label={k('free.input')}
          className={`min-h-[44px] w-64 rounded-xl border-2 border-emerald-300 bg-white px-3 font-mono text-lg font-black ${ring}`} />
        <button type="button" onClick={go} data-cutter-free-show className={`min-h-[44px] rounded-full border-2 border-emerald-700 bg-emerald-600 px-4 text-sm font-black text-white ${ring}`}>{k('free.show')}</button>
      </div>
      {read && !read.ok && <p className="text-sm font-bold text-rose-800" data-cutter-free-error>{k(`free.why.${read.why}`)}</p>}
      {read?.ok && (
        <div className="space-y-1 text-sm font-bold text-teal-950" aria-live="polite">
          <p data-cutter-free-name>{k('free.name', { n: read.name })} · {k('free.value', { v: iso(read.value) })}</p>
          <p data-cutter-free-sentence>{k('free.sentence', { s: read.sentence })}</p>
          <div className="flex flex-wrap items-center gap-1.5" dir="ltr">
            {read.ops.map((o, i) => (
              <button key={i} type="button" data-cutter-free-op={i} onClick={() => setCutAt(i)}
                className={`h-10 w-10 rounded-full border-2 font-mono text-lg font-black ${cutAt === i ? 'border-rose-600 bg-rose-100' : 'border-slate-300 bg-white'} ${ring}`}>{o}</button>
            ))}
          </div>
          {cutRes && <p className={cutRes.ok ? 'text-emerald-800' : 'text-rose-800'} data-cutter-free-cut data-ok={cutRes.ok ? 'true' : 'false'}>{cutRes.ok ? k('free.cutOk') : k('free.cutNo')}</p>}
        </div>
      )}
    </LabCard>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite de questions de chaque tâche : elle interroge ce que l'élève vient de FAIRE, et mène à la règle. */
export const CHAINS = Object.freeze({
  c1: ['whereOk', 'firstDone', 'ruleLast'],
  c4: ['pocketName', 'pocketDivisor'],
  c5: ['sentenceC5', 'ruleHalf'],
  c6: ['whySame'],
  a3: ['whyClip'],
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
export const QUESTIONS = Object.fromEntries(['whereOk', 'firstDone', 'ruleLast', 'pocketName', 'pocketDivisor', 'sentenceC5', 'ruleHalf', 'whySame', 'whyClip'].map((q) => [q, mk(q)]));
