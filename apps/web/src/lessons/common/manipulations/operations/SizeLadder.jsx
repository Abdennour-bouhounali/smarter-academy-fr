import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Sparkles, Hand, FlaskConical, Undo2, RotateCcw, ChevronLeft, ShieldAlert, Plus, ChevronUp, ChevronDown, ChevronsLeft, ChevronsRight, Magnet, Crown } from 'lucide-react';
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
import * as L from '../logic/sizeLadder';
import { CSS, ROW, ZONE, Rung, Given, SciNode, sciTexOf } from './sizeLadder/art';

/**
 * size-ladder — LE SLIDE DES DÉCADES : « سلّم الأحجام » (3AM, unité 3 « القوى ذات أسس نسبية صحيحة », درس « الكتابة العلمية ورتبة القدر », 2026-10-26).
 * La logique, exacte, est dans `logic/sizeLadder.js` (sur `packages/core/arithmetic/tenPowers.js`, importé PAR CHEMIN) ; le dessin dans `sizeLadder/art.jsx`.
 * Distinct de `pin-rails` (une punaise glisse sur un rail LINÉAIRE vers une valeur lue sur un repère), `ruler-compare` (la main choisit une graduation qui sépare deux décimaux),
 * `decimal-comma` (aucune chaîne de chiffres, aucune virgule à déplacer : la normalisation sort de l'endroit où la carte tient) et `ten-zoom` (une lentille change l'échelle d'UNE vue ;
 * ici beaucoup de nombres vivent sur un slide FIXE et la main tient la POSITION d'une carte). Geste : GLISSER-DÉPOSER sur une échelle continue (barreau, puis case, puis aimant).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. La main tire la carte vers le haut ou le bas (glisser relatif, toucher un barreau, flèches ↑ ↓) puis la glisse dans le barreau (glisser, flèches ← →) ; « علّق » (ou lâcher) la dépose ; l'aimant est un bouton ; en متقدم on ÉCRIT a et n avant.
 * B. Une carte déposée sur un mauvais barreau ou dans une mauvaise case retombe avec le CALCUL (265 ≥ 1 000 ? non) ; sur son barreau et dans sa case elle s'écrit « a × 10ⁿ » ; l'aimant l'étiquette « ≈ a' × 10ⁿ ».
 * C. Les graduations restent LOGARITHMIQUES (la case 1–2 est plus large que la case 9–10) ; la carte ne change jamais de longueur, seule sa position change.
 * D. Chaque dépôt, saisie, aimant et choix est un essai jugé exactement (MANUEL §6bis).
 * E. À découvrir : مبتدئ « l'aimant arrondit a à l'unité » ; متقدم « la barre d'une écriture scientifique : 1 ≤ a < 10 sur la bonne décade ». La règle n'est écrite qu'à la phase formelle.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        A = a × 10ⁿ avec 1 ≤ a < 10 ; 10ⁿ ≤ A < 10ⁿ⁺¹ ; rang de grandeur a' × 10ⁿ ; comparer = les barreaux d'abord
 *   OBJECT         le mur de la foire des sciences : slide de barreaux de bois, neuf cases logarithmiques, cartes-étiquettes, aimant ; Layla (KidFigure, hijab) l'exposante
 *   VARIABLE       la POSITION de la carte : son barreau n, puis sa case (la partie entière de a), puis l'aimant (a')
 *   INVARIANT      la carte garde sa longueur ; un barreau va de 10ⁿ à 10ⁿ⁺¹ ; les graduations sont logarithmiques
 *   TRANSFORMATION position → écriture a × 10ⁿ (étiquette réécrite) → aimant → a' × 10ⁿ
 *   CONSTRAINT     la carte n'est suspendue qu'au barreau et à la case qui contiennent sa longueur ; |n| ≤ 12 ; on écrit a et n AVANT (متقدم)
 *   RESISTANCE     « n = nombre de chiffres » (265 sur le barreau 3) ; « tout k × 10ᵖ est scientifique » (35,2 × 10⁴) ; le sens de la virgule (0,048 × 10⁻³) ; troncature au lieu d'arrondi ; comparer les a sans les barreaux
 *   EVIDENCE       le refus avec le calcul, l'étiquette réécrite, l'aimant qui saute à 3, la couronne de la carte du barreau supérieur
 *   CONTRAST       c3 (la feuille sur le bord GAUCHE du barreau −4), c4 (même barreau), c8 (a plus grand mais barreau plus bas)
 *   PREDICTION     (aucune : la main tente, le mur juge)
 *   FORMALIZATION  265 = 2,65 × 10² ; 10² ≤ 265 < 10³ ; rang de grandeur 3 × 10²
 *   TRANSFER       « جرّب أعدادك » (toujours ouvert), les exercices et la banque
 *
 * QUESTIONS PENDANT LE LABO (2026-10-28, lot 6) : après chaque carte (une tâche) une suite de 2 à 3 questions se pose PAR-DESSUS le labo (`CHAINS`, `QUESTIONS` en bas du fichier) sur ce que
 * l'élève vient de FAIRE avec SA carte : la barreau, l'écriture scientifique, l'aimant, la comparaison ; la dernière tâche finit par LA RÈGLE (la découverte d'avant passe dans la carte).
 * Étapes `LabStepper` (`[data-sl-step=<i>]`) + fête ; « إعادة » repart de la carte 1 ; obligatoires pour tout élève, coupées par l'enseignant pour SON compte
 * (`useLabCheckpointSettings`) ; `checkpoints` = false les coupe aussi ; `onCheckpoint(ev)` : la trace que les étapes du module relisent (`checkpoint-done`).
 *
 * D'UN SEUL REGARD (§8bis) : `[data-sl-glance]` enveloppe la consigne, la carte, le mur, les boutons et le verdict.
 * ONBOARDING : `coach` (défaut true) → `LabCoach` ; `logic/sizeLadder.js › coachOf` (card · rung · cell · magnet · type · pick · next · free).
 * Props : `tasks`, `level`, `levels`, `coach`, `title`, `lead`, `onTrial(event)`, `onFinished()`.
 * CONTRAT DOM : [data-size-ladder][data-task][data-solved], [data-sl-glance], [data-sl-window], [data-sl-rung=<n>], [data-sl-cell=<n>:<c>], [data-sl-card=<id>][data-docked], [data-sl-tag], [data-sl-up|down|left|right],
 * [data-sl-dock], [data-sl-magnet], [data-sl-input] (a, n), [data-sl-check], [data-sl-pick=<i>], [data-sl-next], [data-sl-banner][data-code], [data-sl-readout], [data-sl-free], [data-sl-free-input], [data-sl-formal], [data-sl-kid].
 */
const NS = 'manipulation.sizeLadder';
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-amber-300';

export function numbersFor({ tasks, level }) {
  const lv = resolveLevelId(level ?? 'beginner');
  const asked = LEVELS['size-ladder'][lv].numbers;
  return { ...asked, tasks: tasks ?? asked.tasks };
}

export default function SizeLadder({
  tasks, title, lead, level, levels: withLevels = true, coach: coachOn = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished, onCheckpoint,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const initialNumbers = useMemo(() => numbersFor({ tasks, level }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'size-ladder', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nums = state.numbers;
  const numsKey = JSON.stringify(nums);
  const [lab, setLab] = useState(() => L.init(nums));
  const [scene, setScene] = useState({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: 0 });
  if (scene.key !== numsKey || scene.epoch !== state.epoch) {
    // « إعادة » (resetCount), un autre niveau ou d'autres nombres : TOUT recommence — la carte 1, les essais et les questions du labo
    setScene({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: scene.inits + 1 });
    setLab(L.init(nums));
  }
  const kind = L.discoveryKind(lab);
  // les questions pendant le labo : la suite de la tâche courante ; celle qui finit par la règle remplace la découverte automatique
  const cpSettings = useLabCheckpointSettings('size-ladder');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
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
  // une étape est FAITE quand sa carte est posée ET que ses questions sont répondues : alors la pastille passe au vert et on fête
  const stepDone = lab.tasks.map((_, i) => !!lab.done[i] && (i !== lab.ti || !cp.blocking));
  const stepper = lab.tasks.length > 1 && !L.isFree(lab) && (
    <LabStepper count={lab.tasks.length} current={lab.ti} done={stepDone} stepAttr="data-sl-step" />
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
  /* ── le son (muet sauf « الصوت ») : un cran à chaque déplacement de la carte, la cloche quand un barreau ou une case est accepté, le drapeau pour l'aimant, la couronne, la saisie juste, « over » pour un refus ── */
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
    else if (l.kind === 'rung' || l.kind === 'dock') playSfx('bell');
    else if (l.kind === 'magnet' || l.kind === 'crown' || l.kind === 'typed-ok') playSfx('flag');
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
    lab: 'size-ladder', step: coachStep,
    text: coachStep ? k(`coach.${coachStep.id}`) : '',
    labels: { hide: k('coach.hide'), show: k('coach.show'), ok: k('coach.ok'), stop: k('coach.stop') },
  });

  const discovery = kind ? (
    <ManipulationDiscovery state={state} prompt={<MathText>{k(`discovery.${kind}.prompt`)}</MathText>} options={discoveryOptions(k, kind)} formal={<Formal k={k} kind={kind} />} />
  ) : null;

  return (
    <ManipulationShell
      type="size-ladder"
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
        <div className="space-y-2" data-size-ladder data-task={lab.ti} data-solved={everyDone ? 'true' : 'false'}>
          <style dangerouslySetInnerHTML={{ __html: CSS }} />
          <Lab lab={lab} setLab={setLab} k={k} lead={state.isAuthoredLevel ? lead : null}
            overlay={<>{party.node}{cp.node}</>} stepper={stepper} blocked={cp.blocking} />
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ══════════════ Textes ══════════════ */

const unitSym = (k, u) => k(`unitSym.${u ?? 'm'}`);
const pw = (n) => `10^{${n}}`;
/** Un décimal groupé (« 1 000 », « 0,48 ») écrit pour KaTeX : groupes `\\,` et virgule `{,}` — jamais dans le texte arabe (l'ordre bidi des nombres y serait faux). */
const texNum = (t) => String(t).replace(',', '{,}').replace(/\u00a0/g, '\\,').replace('−', '-');

function tagOf(card, st, k) {
  const m = unitSym(k, 'm');
  if (st.phase === 'placed') {
    if (st.magnet) return { node: <>≈ <SciNode a={card.order.a1} n={card.order.n1} /><span className="ms-1.5">{m}</span></>, kind: 'order' };
    return { node: <><SciNode a={card.sci.a} n={card.sci.n} /><span className="ms-1.5">{m}</span></>, kind: 'sci' };
  }
  return { node: <><Given given={card.given} /><span className="ms-1.5">{unitSym(k, card.unit)}</span></>, kind: 'given' };
}

/** Où la carte est dessinée : le barreau, et l'abscisse (fraction du barreau) de son aiguille. */
function placement(card, st) {
  if (st.phase === 'placed') {
    if (st.magnet) return card.order.n1 !== card.n ? { rung: card.order.n1, frac: 0 } : { rung: card.n, frac: L.markFrac(card.order.a1) };
    return { rung: card.n, frac: Math.log10(Number(card.sci.a.replace(',', '.'))) };
  }
  if (st.phase === 'cell') return { rung: st.rung, frac: st.hoverCell === null ? 0.5 : (L.markFrac(st.hoverCell) + L.markFrac(st.hoverCell + 1)) / 2 };
  if (st.phase === 'rung' && st.hover !== null) return { rung: st.hover, frac: 0.5 };
  return null;
}

/* ══════════════ Le laboratoire ══════════════ */

function Lab({ lab, setLab, k, lead, overlay, stepper, blocked }) {
  const free = L.isFree(lab);
  const task = L.taskOf(lab);
  const done = L.taskDone(lab);
  const typedTask = task.cards.some((c) => c.typed);
  const ctxKey = free ? 'free' : task.kind === 'compare' ? 'compare' : lab.ti > 0 ? 'again' : typedTask ? 'typed' : 'first';
  const qKey = task.kind === 'compare' ? 'compare' : typedTask ? 'typed' : 'hang';
  const prompt = (
    <PromptCard size="md"
      context={<MathText>{k(`context.${ctxKey}`)}</MathText>}
      contextProps={{ 'data-sl-context': ctxKey }}
      title={<MathText>{k(`question.${qKey}`)}</MathText>} titleClassName="text-base" lamp={free ? null : done ? 'on' : 'off'}
      titleProps={{ 'data-sl-prompt': qKey, 'data-lit': done ? 'true' : 'false' }}
      aside={stepper || undefined}
      instruction={lead || undefined} />
  );
  return (
    <>
      <div className="relative space-y-2" data-sl-glance>
        {overlay}
        {prompt}
        <Tray lab={lab} k={k} />
        <Wall lab={lab} setLab={setLab} k={k} />
        <TypedRow lab={lab} setLab={setLab} k={k} />
        <Banner lab={lab} setLab={setLab} k={k} blocked={blocked} />
      </div>
      <FreeCard lab={lab} setLab={setLab} k={k} />
    </>
  );
}

/* ══════════════ Une carte ══════════════ */

function CardFace({ card, st, k, className = '', style, crown, onClick, ...rest }) {
  const tag = tagOf(card, st, k);
  const placed = st.phase === 'placed';
  return (
    <div data-sl-card={card.id} data-docked={placed ? 'true' : 'false'} data-kind={tag.kind} onClick={onClick}
      className={`min-w-0 rounded-lg border-[3px] px-2 py-0.5 text-center shadow-[0_2px_0_0_rgba(120,53,15,.5)] ${placed ? 'border-emerald-600 bg-emerald-50' : 'border-amber-500 bg-white'} ${className}`} style={style} {...rest}>
      <span className="block truncate text-[9px] font-bold leading-tight text-slate-600">{k(`cards.${card.key}`)}</span>
      <bdi dir="ltr" data-sl-tag className="block whitespace-nowrap text-[13px] font-black leading-tight tabular-nums text-slate-900">{tag.node}</bdi>
      {crown && <Crown className="absolute -top-4 left-1/2 h-5 w-5 -translate-x-1/2 text-amber-500 drop-shadow" aria-hidden="true" data-sl-crown />}
    </div>
  );
}

/** La salle d'attente : Layla (l'exposante) et les cartes pas encore suspendues, avec leur longueur telle qu'elle est donnée. */
function Tray({ lab, k }) {
  const task = L.taskOf(lab);
  const waiting = task.cards.map((c, i) => [c, lab.cs[i], i]).filter(([, st]) => (st.phase === 'type' || (st.phase === 'rung' && st.hover === null)));
  const active = L.activeIndex(lab);
  const done = L.taskDone(lab);
  const refused = lab.last?.kind === 'refused';
  const mood = done ? 'proud' : refused || lab.moves > 0 ? 'wonder' : 'happy';
  return (
    <div className="flex items-end gap-2" data-sl-tray>
      <svg viewBox="0 0 70 128" className="h-[68px] w-10 shrink-0" aria-hidden="true" data-sl-kid>
        <KidFigure cx={35} top={8} foot={120} hairStyle="hijab" scarf="lavender" outfit="violet" skin="medium" mood={mood} />
      </svg>
      {waiting.length > 0 && (
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 pb-1">
          <span className="text-xs font-black text-amber-900">{k('cards.tray')}</span>
          {waiting.map(([c, st, i]) => (
            <div key={c.id} className={`relative ${i === active ? '' : 'opacity-60'}`}>
              <div data-sl-card={c.id} data-docked="false" className="rounded-xl border-[3px] border-amber-500 bg-white px-3 py-1 text-center shadow-[0_2px_0_0_rgba(120,53,15,.5)]">
                <span className="block text-[11px] font-bold text-slate-600">{k(`cards.${c.key}`)}</span>
                <bdi dir="ltr" data-sl-tag className="block whitespace-nowrap text-lg font-black tabular-nums text-slate-900">{tagOf(c, st, k).node}</bdi>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════ Le mur et son slide ══════════════ */

function useRows() {
  const [rows, setRows] = useState(5);
  useEffect(() => {
    const f = () => setRows(window.innerHeight < 860 ? 4 : 5);
    f();
    window.addEventListener('resize', f);
    return () => window.removeEventListener('resize', f);
  }, []);
  return rows;
}

function Wall({ lab, setLab, k }) {
  const rows = useRows();
  const boxRef = useRef(null);
  const drag = useRef(null);
  const [dragFrac, setDragFrac] = useState(null);
  const task = L.taskOf(lab);
  const done = L.taskDone(lab);
  const ai = L.activeIndex(lab);
  const st = ai >= 0 ? lab.cs[ai] : lab.cs[0];
  const center = L.centerRung(lab);
  const mid = Math.floor(rows / 2);
  const blocked = done || L.pickPending(lab);
  const refused = lab.last?.kind === 'refused';
  const shake = lab.flash % 2 ? 'sl-shake-a' : 'sl-shake-b';
  const activeBoard = () => boxRef.current?.querySelector('[data-sl-board-active]');
  const fracOf = (e) => {
    const b = activeBoard();
    if (!b) return 0.5;
    const r = b.getBoundingClientRect();
    return Math.min(0.999, Math.max(0, (e.clientX - r.left) / r.width));
  };
  const onDown = (e) => {
    if (blocked || !st) return;
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* pointeur déjà levé */ }
    if (st.phase === 'rung') {
      const h0 = st.hover ?? 0;
      drag.current = { y0: e.clientY, h0, moved: false, center0: center, top: boxRef.current.getBoundingClientRect().top };
      if (st.hover === null) setLab((s) => L.moveRung(s, 0));
    } else if (st.phase === 'cell') {
      drag.current = { x: true };
      const f = fracOf(e); setDragFrac(f); setLab((s) => L.moveCell(s, L.cellAt(f)));
    }
  };
  const onMove = (e) => {
    const d = drag.current;
    if (!d) return;
    if (st.phase === 'rung') {
      const dy = e.clientY - d.y0;
      if (Math.abs(dy) > 6) d.moved = true;
      if (d.moved) setLab((s) => L.moveRung(s, d.h0 - Math.round(dy / ROW)));
    } else if (st.phase === 'cell') {
      const f = fracOf(e); setDragFrac(f); setLab((s) => L.moveCell(s, L.cellAt(f)));
    }
  };
  const onUp = (e) => {
    const d = drag.current; drag.current = null;
    if (!d) return;
    if (st.phase === 'rung') {
      if (!d.moved) {
        const row = Math.floor((e.clientY - d.top) / ROW);
        const n = d.center0 + (mid - row);
        setLab((s) => L.dockRung(L.moveRung(s, n)));
      } else setLab(L.dockRung);
    } else if (st.phase === 'cell') { setDragFrac(null); setLab(L.dockCell); }
  };
  const onKey = (e) => {
    if (blocked || !st) return;
    const go = (fn) => { e.preventDefault(); setLab(fn); };
    if (e.key === 'ArrowUp') go((s) => L.stepRung(s, 1));
    else if (e.key === 'ArrowDown') go((s) => L.stepRung(s, -1));
    else if (e.key === 'ArrowRight') go((s) => L.stepCell(s, 1));
    else if (e.key === 'ArrowLeft') go((s) => L.stepCell(s, -1));
    else if (e.key === 'Enter') go((s) => { const a = L.activeState(s); return a.phase === 'rung' ? L.dockRung(s) : a.phase === 'cell' ? L.dockCell(s) : s; });
    else if (e.key === 'm' || e.key === 'M') go(L.toggleMagnet);
  };

  const unit = unitSym(k, 'm');
  const rungs = Array.from({ length: L.RUNG_MAX - L.RUNG_MIN + 1 }, (_, i) => L.RUNG_MAX - i);
  const centerIdx = L.RUNG_MAX - center;
  const offset = -(centerIdx - mid) * ROW;
  const items = task.cards.map((c, i) => ({ c, st: lab.cs[i], i, at: placement(c, lab.cs[i]) })).filter((x) => x.at);

  return (
    <StageFrame className="min-w-0 !p-1.5" data-sl-stage>
      <div className="flex items-end gap-1.5">
        <div className="min-w-0 flex-1 overflow-hidden rounded-xl border-x-[10px] border-y-2 border-[#9A6A34] bg-gradient-to-b from-sky-100 to-amber-50 shadow-inner" style={{ height: rows * ROW + 4 }} data-sl-window
          role="slider" tabIndex={blocked ? -1 : 0} aria-label={k('scene.aria')} aria-valuemin={L.RUNG_MIN} aria-valuemax={L.RUNG_MAX} aria-valuenow={st?.hover ?? st?.rung ?? 0}
          aria-valuetext={k('rung.aria', { n: st?.hover ?? st?.rung ?? 0, n1: (st?.hover ?? st?.rung ?? 0) + 1 })} aria-disabled={blocked}
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={() => { drag.current = null; setDragFrac(null); }} onKeyDown={onKey}
          ref={boxRef}>
          <div style={{ height: rows * ROW + 4, touchAction: 'none', cursor: blocked ? 'default' : 'grab' }} className={refused ? shake : ''}>
            <div className="sl-rows" style={{ transform: `translateY(${offset}px)` }}>
              {rungs.map((n) => {
                const active = n === center;
                const here = items.filter((x) => x.at.rung === n);
                const sel = here.find((x) => x.st.phase === 'cell' || x.st.phase === 'rung');
                return (
                  <Rung key={n} n={n} active={active} unit={unit} showNums={active && here.length > 0}
                    hoverCell={sel && sel.st.phase === 'cell' ? sel.st.hoverCell : null} refused={refused && lab.last?.reason?.startsWith('cell')}
                    goodCell={here.find((x) => x.st.phase === 'placed')?.c.cell}
                    cardLayer={here.map(({ c, st: s2, i, at }) => {
                      const frac = s2.phase === 'cell' && dragFrac !== null ? dragFrac : at.frac;
                      const x = Math.min(0.78, Math.max(0.22, frac));
                      const win = lab.crown === i;
                      return (
                        <React.Fragment key={c.id}>
                          <CardFace card={c} st={s2} k={k} crown={win} data-sl-on-wall className={`sl-card absolute ${s2.phase === 'placed' ? '' : 'sl-pop'}`}
                            style={{ left: `${x * 100}%`, top: 1, transform: 'translateX(-50%)', width: 'max-content', maxWidth: '58%', ...(s2.phase === 'placed' ? {} : { zIndex: 2 }) }}
                            {...(L.pickPending(lab) ? { onClick: () => setLab((s) => L.pickBigger(s, i)) } : {})} />
                          <div className="sl-card absolute" style={{ left: `calc(${frac * 100}% * 0.985 + 4px)`, top: ZONE - 5, width: 10, height: 10, marginLeft: -5, borderRadius: 9, background: s2.phase === 'placed' ? '#047857' : '#DC2626', border: '2px solid #fff', zIndex: 3 }} aria-hidden="true" data-sl-needle />
                        </React.Fragment>
                      );
                    })} />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </StageFrame>
  );
}

/* ══════════════ La saisie de a et n (متقدم) ══════════════ */

function TypedRow({ lab, setLab, k }) {
  const st = L.activeState(lab);
  const [a, setA] = useState('');
  const [n, setN] = useState('');
  const key = `${lab.ti}:${lab.epoch}`;
  const [seen, setSeen] = useState(key);
  if (seen !== key) { setSeen(key); setA(''); setN(''); }
  if (L.isFree(lab) || st.phase !== 'type') return null;
  const submit = (e) => { e?.preventDefault(); setLab((s) => L.submitTyped(s, a, n)); };
  const cls = `h-11 rounded-xl border-2 border-amber-400 bg-white px-2 text-center text-lg font-black tabular-nums text-amber-950 ${ring}`;
  return (
    <form onSubmit={submit} className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-amber-300 bg-amber-50/70 px-3 py-2" data-sl-typed role="group" aria-label={k('input.aria')}>
      <input value={a} onChange={(e) => setA(e.target.value)} inputMode="decimal" data-sl-input="a" aria-label={k('input.a')} placeholder={k('input.a')} className={`${cls} w-28`} dir="ltr" />
      <span className="text-lg font-black text-amber-950" aria-hidden="true" dir="ltr">× 10</span>
      <input value={n} onChange={(e) => setN(e.target.value)} inputMode="numeric" data-sl-input="n" aria-label={k('input.n')} placeholder={k('input.n')} className={`${cls} w-20`} dir="ltr" />
      <button type="submit" data-sl-check className={`inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-amber-600 bg-amber-500 px-4 text-sm font-black text-white shadow-[0_3px_0_0_#B45309] ${ring}`}>
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> {k('input.go')}
      </button>
    </form>
  );
}

/* ══════════════ La bannière : lecture, verdict et boutons ══════════════ */

function readoutOf(lab, k) {
  const ai = L.activeIndex(lab);
  const st = ai >= 0 ? lab.cs[ai] : lab.cs[0];
  if (L.pickPending(lab)) return k('readout.pick');
  if (st.phase === 'type') return k('readout.type');
  if (st.phase === 'rung') return st.hover === null ? k('readout.tray') : k('readout.rung', { lo: pw(st.hover), hi: pw(st.hover + 1) });
  if (st.phase === 'cell') {
    if (st.hoverCell === null) return k('readout.cellPick', { lo: pw(st.rung), hi: pw(st.rung + 1) });
    const c = st.hoverCell;
    return k('readout.cell', { c: `${c}\\times10^{${st.rung}}`, c1: c === 9 ? pw(st.rung + 1) : `${c + 1}\\times10^{${st.rung}}` });
  }
  return k(st.magnet ? 'readout.magnet' : 'readout.placed');
}

function verdictOf(lab, k) {
  const last = lab.last;
  const note = L.isFree(lab) ? ` ${k('v.freeNote')}` : '';
  if (last?.kind === 'refused') {
    const r = last.reason;
    if (r === 'below') return { text: k('refuse.below', { v: texNum(last.value), b: texNum(last.bound), p: pw(last.rung) }) + note, tone: 'amber', code: 'below', refused: r };
    if (r === 'above') return { text: k('refuse.above', { v: texNum(last.value), b: texNum(last.bound), p: pw(last.rung + 1) }) + note, tone: 'amber', code: 'above', refused: r };
    if (r === 'cell-before') return { text: k('refuse.cellBefore', { v: texNum(last.value), b: texNum(last.bound) }) + note, tone: 'amber', code: 'cell-before', refused: r };
    if (r === 'cell-after') return { text: k('refuse.cellAfter', { v: texNum(last.value), b: texNum(last.bound) }) + note, tone: 'amber', code: 'cell-after', refused: r };
    if (r === 'typed-value') return { text: k('refuse.typedValue', { w: sciTexOf(last.a, last.n), got: texNum(last.got), want: texNum(last.want) }), tone: 'amber', code: 'typed-value', refused: r };
    if (r === 'typed-form') return { text: k('refuse.typedForm', { w: sciTexOf(last.a, last.n) }), tone: 'amber', code: 'typed-form', refused: r };
    if (r === 'typed-invalid') return { text: k('refuse.typedInvalid'), tone: 'amber', code: 'typed-invalid', refused: r };
    return { text: k(last.same ? 'refuse.compareSame' : 'refuse.compareRungs'), tone: 'amber', code: 'compare', refused: r };
  }
  if (last?.kind === 'typed-ok') return { text: k('v.typedOk', { w: sciTexOf(last.a, last.n) }), tone: 'emerald', code: 'typed-ok' };
  if (last?.kind === 'rung') return { text: k('v.rung', { lo: pw(last.n), hi: pw(last.n + 1) }), tone: 'emerald', code: 'rung' };
  if (last?.kind === 'dock') return { text: k('v.dock'), chip: <SciNode a={last.a} n={last.n} />, tone: 'emerald', code: 'dock' };
  if (last?.kind === 'magnet') {
    return { text: k('v.magnet'), chip: <>≈ <SciNode a={last.a1} n={last.n1} /></>, tail: last.carry ? k('v.magnetCarry') : null, tone: 'emerald', code: 'magnet' };
  }
  if (last?.kind === 'crown') return { text: k('v.crown'), tone: 'emerald', code: 'crown' };
  if (L.taskDone(lab)) return { text: k('v.solved') + note, tone: 'emerald', code: 'solved' };
  if (last?.kind === 'custom' || (L.isFree(lab) && lab.moves === 0)) return { text: k('v.custom'), tone: 'indigo', code: 'custom' };
  return { text: readoutOf(lab, k), tone: 'indigo', code: 'idle' };
}

function Banner({ lab, setLab, k, blocked }) {
  const vv = verdictOf(lab, k);
  const task = L.taskOf(lab);
  const done = L.taskDone(lab);
  const st = L.activeState(lab);
  const phase = L.pickPending(lab) ? 'pick' : st.phase;
  const canNext = L.canNext(lab) && !blocked;
  const Icon = vv.tone === 'emerald' ? CheckCircle2 : vv.tone === 'amber' ? ShieldAlert : vv.tone === 'indigo' ? Hand : Sparkles;
  const btn = `inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full border-2 px-3.5 text-sm font-black transition-all duration-150 active:translate-y-0.5 motion-reduce:transition-none ${ring}`;
  const round = `inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[3px] border-amber-600 bg-white text-amber-950 shadow-[0_3px_0_0_rgba(180,83,9,.45)] disabled:border-slate-200 disabled:text-slate-300 disabled:shadow-none ${ring}`;
  const rungPhase = phase === 'rung';
  const cellPhase = phase === 'cell';
  const showMagnet = task.kind === 'hang' && phase === 'placed';
  const magnetOn = st.magnet;
  const hasMoved = st.hover !== null || st.hoverCell !== null;
  return (
    <VerdictBanner tone={vv.tone} icon={Icon} size="sm" className="min-h-[2.75rem] !py-1.5" data-sl-banner data-sl-readout data-sl-refused={vv.refused || undefined} data-code={vv.code}>
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
        <p className={vv.tone === 'indigo' ? 'font-bold text-indigo-900' : ''}>
          <MathText>{vv.text}</MathText>
          {vv.chip && <> <bdi dir="ltr" className="whitespace-nowrap rounded-full border-2 border-emerald-300 bg-white px-2 py-0.5 font-black tabular-nums" data-sl-banner-sci>{vv.chip}</bdi></>}
          {vv.tail && <> <MathText>{vv.tail}</MathText></>}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {(rungPhase || cellPhase) && (
            <>
              <button type="button" data-sl-up disabled={!rungPhase} onClick={() => setLab((s) => L.stepRung(s, 1))} className={round} aria-label={k('up')} title={k('up')}><ChevronUp className="h-5 w-5" aria-hidden="true" /></button>
              <button type="button" data-sl-down disabled={!rungPhase} onClick={() => setLab((s) => L.stepRung(s, -1))} className={round} aria-label={k('down')} title={k('down')}><ChevronDown className="h-5 w-5" aria-hidden="true" /></button>
              <button type="button" data-sl-left disabled={!cellPhase} onClick={() => setLab((s) => L.stepCell(s, -1))} className={round} aria-label={k('cellLeft')} title={k('cellLeft')}><ChevronsLeft className="h-5 w-5" aria-hidden="true" /></button>
              <button type="button" data-sl-right disabled={!cellPhase} onClick={() => setLab((s) => L.stepCell(s, 1))} className={round} aria-label={k('cellRight')} title={k('cellRight')}><ChevronsRight className="h-5 w-5" aria-hidden="true" /></button>
              <button type="button" data-sl-dock disabled={!hasMoved} onClick={() => setLab((s) => (L.activeState(s).phase === 'rung' ? L.dockRung(s) : L.dockCell(s)))}
                className={`${btn} ${hasMoved ? 'border-amber-600 bg-amber-500 text-white shadow-[0_3px_0_0_#B45309]' : 'border-slate-200 bg-slate-50 text-slate-400'}`}>
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> {k('dock')}
              </button>
            </>
          )}
          {phase === 'pick' && task.cards.map((c, i) => (
            <button key={c.id} type="button" data-sl-pick={i} onClick={() => setLab((s) => L.pickBigger(s, i))} className={`${btn} border-indigo-600 bg-indigo-600 text-white shadow-[0_3px_0_0_#3730A3]`}>
              <Crown className="h-4 w-4" aria-hidden="true" /> {k(`cardsShort.${c.key}`)}
            </button>
          ))}
          {showMagnet && (
            <button type="button" data-sl-magnet aria-pressed={magnetOn} onClick={() => setLab(L.toggleMagnet)} className={`${btn} ${magnetOn ? 'border-rose-700 bg-rose-600 text-white shadow-[0_3px_0_0_#9F1239]' : 'border-rose-400 bg-white text-rose-800'}`}>
              <Magnet className="h-4 w-4" aria-hidden="true" /> {k(magnetOn ? 'magnetOff' : 'magnet')}
            </button>
          )}
          {(lab.moves > 0 || lab.cs.some((c) => c.phase !== 'rung' && c.phase !== 'type')) && !done && (
            <button type="button" onClick={() => setLab(L.restartTask)} data-sl-retry title={k('retry')} className={`${btn} !px-0 w-11 border-amber-300 bg-amber-50 text-amber-950`}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" /><span className="sr-only">{k('retry')}</span>
            </button>
          )}
          {canNext && (
            <button type="button" onClick={() => setLab(L.nextTask)} data-sl-next className={`${btn} border-emerald-600 bg-emerald-600 text-white shadow-[0_3px_0_0_#047857]`}>
              {k('next')} <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </VerdictBanner>
  );
}

/* ══════════════ « جرّب أعدادك » : toujours ouvert ══════════════ */

function FreeCard({ lab, setLab, k }) {
  const free = L.isFree(lab);
  const [text, setText] = useState('');
  const [bad, setBad] = useState(null);
  const add = (e) => {
    e?.preventDefault();
    const p = L.parseFree(text);
    if (!p.ok) { setBad(p.why); return; }
    setBad(null); setLab((s) => L.setFree(s, text));
  };
  return (
    <LabCard className="space-y-2 border-amber-200 bg-amber-50/50 p-3" data-sl-free data-active={free ? 'true' : 'false'}>
      <p className="flex items-center gap-1.5 text-sm font-black text-amber-950"><FlaskConical className="h-4 w-4" aria-hidden="true" /> {k('free.title')}</p>
      <p className="text-xs font-bold leading-snug text-slate-600">{free ? k('free.on') : k('free.hint')}</p>
      <form onSubmit={add} className="flex flex-wrap items-end gap-x-3 gap-y-2">
        <input value={text} onChange={(e) => setText(e.target.value)} data-sl-free-input aria-label={k('free.title')} placeholder={k('free.placeholder')} dir="ltr" inputMode="text"
          className={`h-11 min-w-0 flex-1 rounded-xl border-2 ${bad ? 'border-rose-300' : 'border-amber-300'} bg-white px-3 text-base font-black tabular-nums text-amber-950 ${ring}`} />
        <button type="submit" data-sl-free-add className={`inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-amber-500 bg-white px-3 text-sm font-black text-amber-950 ${ring}`}>
          <Plus className="h-4 w-4" aria-hidden="true" /> {k('free.add')}
        </button>
        {free && (
          <button type="button" onClick={() => { setText(''); setBad(null); setLab(L.toGuided); }} data-sl-free-back className={`inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-amber-200 bg-white px-3 text-xs font-bold text-amber-950 ${ring}`}>
            <Undo2 className="h-4 w-4" aria-hidden="true" /> {k('free.back')}
          </button>
        )}
      </form>
      {bad && <p role="alert" className="text-sm font-bold text-rose-700" data-sl-free-refusal={bad}><MathText>{k(`free.refusal.${bad}`, { lo: pw(L.RUNG_MIN), hi: pw(L.RUNG_MAX + 1) })}</MathText></p>}
    </LabCard>
  );
}

/* ══════════════ La découverte et la règle ══════════════ */

export function discoveryOptions(k, kind = 'order') {
  if (kind === 'sci') {
    return [
      { text: <MathText>{k('discovery.sci.nat')}</MathText>, why: <MathText>{k('discovery.sci.whyNat')}</MathText> },
      { text: <MathText>{k('discovery.sci.ok')}</MathText>, correct: true },
      { text: <MathText>{k('discovery.sci.pos')}</MathText>, why: <MathText>{k('discovery.sci.whyPos')}</MathText> },
    ];
  }
  return [
    { text: <MathText>{k('discovery.order.trunc')}</MathText>, why: <MathText>{k('discovery.order.whyTrunc')}</MathText> },
    { text: <MathText>{k('discovery.order.ok')}</MathText>, correct: true },
    { text: <MathText>{k('discovery.order.next')}</MathText>, why: <MathText>{k('discovery.order.whyNext')}</MathText> },
  ];
}

export function Formal({ k, kind = 'order' }) {
  const lines = k(`formal.${kind}`, { returnObjects: true });
  return (
    <div className="space-y-2 text-sm font-bold text-amber-950" data-sl-formal>
      {(Array.isArray(lines) ? lines : []).map((x, i) => <p key={i}><MathText>{x}</MathText></p>)}
    </div>
  );
}


/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite de chaque tâche : ce que la main vient de faire avec SA carte ; la dernière tâche de chaque niveau finit par LA RÈGLE. */
export const CHAINS = Object.freeze({
  c1: ['rung', 'sci', 'order'],
  c2: ['rung', 'sci', 'order'],
  c3: ['rung', 'sci', 'order'],
  c4: ['cmpHow', 'rule'],
  c5: ['rung', 'order'],
  c6: ['sci', 'order'],
  c7: ['rung', 'order'],
  c8: ['cmpHow', 'rule'],
});

const $ = (s) => `$${s}$`;
const Cq = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const valueTex = (card) => $(texNum(T.decText(card.value)));
const sciOf = (a, n) => $(sciTexOf(a, n));
/** La bonne option à la place `want` (le défaut « toujours au milieu » se voit) ; une seule bonne. */
const place = (opts, want) => {
  const ci = opts.findIndex((o) => o.correct);
  const rest = opts.filter((_, i) => i !== ci);
  rest.splice(Math.min(want, rest.length), 0, opts[ci]);
  return rest;
};
const dec = (t) => T.parseDec(t);
const decShow = (v) => T.decText(v, { group: false });

/** Chaque question est construite sur LA carte de la tâche (rien n'est écrit en dur) ; `k` : les textes de `sizeLadder`. */
export const QUESTIONS = {
  /* la barreau : ce que le mur a accepté ou refusé */
  rung: (lab, task, k) => {
    const c = task.cards[0];
    const value = valueTex(c);
    const n = c.n;
    const mk = (r) => {
      const lo = $(`10^{${r}}`); const hi = $(`10^{${r + 1}}`);
      const text = <MathText>{$(`10^{${r}}\\le A<10^{${r + 1}}`)}</MathText>;
      if (r === n) return { text, correct: true };
      if (r > n) return { text, why: Cq(k, n >= 0 && r === n + 1 ? 'rung.whyDigits' : 'rung.whyUp', { value, lo, d: String(r) }) };
      return { text, why: Cq(k, 'rung.whyDown', { value, hi }) };
    };
    const rs = [n, n + 1, n - 1];
    return {
      id: 'rung', kind: 'choice', cols: 3,
      prompt: Cq(k, 'rung.prompt', { what: k(`cards.${c.key}`), value }),
      options: place(rs.map(mk), (lab.ti + 1) % 3),
      hints: [Cq(k, 'rung.hint1'), Cq(k, 'rung.hint2')],
      explain: Cq(k, 'rung.explain', { value, lo: $(`10^{${n}}`), hi: $(`10^{${n + 1}}`), n: $(String(n).replace('-', '−')) }),
    };
  },
  /* l'écriture scientifique : a × 10ⁿ avec 1 ≤ a < 10 */
  sci: (lab, task, k) => {
    const c = task.cards[0];
    const value = valueTex(c);
    const a = c.sci.a; const n = c.n;
    const big = decShow(T.timesPow10(dec(a), 1)); const small = decShow(T.timesPow10(dec(a), -1));
    const opts = [
      { text: <MathText>{sciOf(a, n)}</MathText>, correct: true },
      { text: <MathText>{sciOf(big, n - 1)}</MathText>, why: Cq(k, 'sci.whyBig', { x: $(texNum(big)), w: sciOf(big, n - 1), value }) },
      { text: <MathText>{sciOf(small, n + 1)}</MathText>, why: Cq(k, 'sci.whySmall', { x: $(texNum(small)), w: sciOf(small, n + 1), value }) },
    ];
    return {
      id: 'sci', kind: 'choice', cols: 3,
      prompt: Cq(k, 'sci.prompt', { value }),
      options: place(opts, (lab.ti + 2) % 3),
      hints: [Cq(k, 'sci.hint1', { value }), Cq(k, 'sci.hint2')],
      explain: Cq(k, 'sci.explain', { w: sciOf(a, n), a: $(texNum(a)), n: $(String(n).replace('-', '−')) }),
    };
  },
  /* l'aimant : a est ARRONDI à l'unité */
  order: (lab, task, k) => {
    const c = task.cards[0];
    const { a1, n1 } = c.order;
    const a = c.sci.a; const n = c.n;
    const o = sciOf(a1, n1);
    const trunc = Number(a.split(',')[0]);
    const cand = [
      { text: o, correct: true },
      { text: sciOf(trunc, n), kind: 'trunc', diff: !(trunc === a1 && n === n1) },
      { text: sciOf(1, n + 1), kind: 'next', diff: !(a1 === 1 && n1 === n + 1) },
      { text: sciOf(a1 + 1, n1), kind: 'other', diff: a1 + 1 < 10 },
      { text: sciOf(Math.max(1, a1 - 1), n1), kind: 'other', diff: a1 - 1 >= 1 },
    ];
    const opts = [cand[0], ...cand.slice(1).filter((x) => x.diff)].slice(0, 3).map((x) => (x.correct
      ? { text: <MathText>{x.text}</MathText>, correct: true }
      : { text: <MathText>{x.text}</MathText>, why: Cq(k, x.kind === 'trunc' ? 'order.whyTrunc' : x.kind === 'next' ? 'order.whyNext' : 'order.whyOther', { x: x.text, o, a: $(texNum(a)) }) }));
    return {
      id: 'order', kind: 'choice', cols: 3,
      prompt: Cq(k, 'order.prompt', { w: sciOf(a, n) }),
      options: place(opts, lab.ti % 3),
      hints: [Cq(k, 'order.hint1', { a: $(texNum(a)) }), Cq(k, 'order.hint2', { a: $(texNum(a)), n: $(String(n).replace('-', '−')) })],
      explain: Cq(k, 'order.explain', { a: $(texNum(a)), a1: $(String(a1)), w: sciOf(a, n), o }),
    };
  },
  /* la comparaison : la barreau d'abord, puis le premier nombre */
  cmpHow: (lab, task, k) => {
    const [x, y] = task.cards;
    const same = x.n === y.n;
    const winner = T.compareDec(x.value, y.value) > 0 ? x : y;
    const loser = winner === x ? y : x;
    const o = { x: sciOf(x.sci.a, x.n), y: sciOf(y.sci.a, y.n) };
    const p = $(`10^{${x.n}}`);
    const win = sciOf(winner.sci.a, winner.n);
    const opts = same
      ? [
        { text: Cq(k, 'cmpHow.sameRight'), correct: true },
        { text: Cq(k, 'cmpHow.sameRung'), why: Cq(k, 'cmpHow.whySameRung', { p }) },
        { text: Cq(k, 'cmpHow.sameCount'), why: Cq(k, 'cmpHow.whyCount') },
      ]
      : [
        { text: Cq(k, 'cmpHow.diffRight'), correct: true },
        { text: Cq(k, 'cmpHow.diffA'), why: Cq(k, 'cmpHow.whyDiffA', { a1: $(texNum(x.sci.a)), a2: $(texNum(y.sci.a)) }) },
        { text: Cq(k, 'cmpHow.diffCount'), why: Cq(k, 'cmpHow.whyCount') },
      ];
    return {
      id: 'cmpHow', kind: 'choice', cols: 1,
      prompt: Cq(k, 'cmpHow.prompt', o),
      options: place(opts, (lab.ti + 1) % 3),
      hints: [Cq(k, same ? 'cmpHow.hint1Same' : 'cmpHow.hint1Diff'), Cq(k, same ? 'cmpHow.hint2Same' : 'cmpHow.hint2Diff')],
      explain: same
        ? Cq(k, 'cmpHow.explainSame', { p, a1: $(texNum(x.sci.a)), a2: $(texNum(y.sci.a)), win })
        : Cq(k, 'cmpHow.explainDiff', { p1: $(`10^{${winner.n}}`), p2: $(`10^{${loser.n}}`), win }),
    };
  },
  /* la règle : l'ancienne découverte, posée en dernier */
  rule: (lab, task, k) => {
    const kind = lab.discovery === 'sci' ? 'sci' : 'order';
    const opts = discoveryOptions(k, kind);
    return {
      id: 'rule', kind: 'choice', cols: 1,
      prompt: <MathText>{k(`discovery.${kind}.prompt`)}</MathText>,
      options: place(opts, 2),
      hints: [Cq(k, `rule.${kind}.hint1`), Cq(k, `rule.${kind}.hint2`)],
      explain: <Formal k={k} kind={kind} />,
    };
  },
};
