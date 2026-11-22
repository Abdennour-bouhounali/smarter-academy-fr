import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Sparkles, Wind, FlaskConical, Undo2, RotateCcw, ChevronLeft, Plus, Hand } from 'lucide-react';
import { sub, sign } from '@smarter-academy/core/arithmetic/powers.js';
import { resolveLevelId } from '@smarter-academy/core/curriculum/manipulationLevels.js';
import MathText from '../../components/MathText';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
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
import * as L from '../logic/numberLinePegs';
import RopeScene, { CSS as SCENE_CSS } from './numberLinePegs/RopeScene';
import { W, SVG_H, ROPE_Y, CARD_W, CARD_H, CHIP_H, ROW_PITCH, STACK_DX, xOfValue, valueOfX, unitPx, layoutCards } from './numberLinePegs/pegArt';

/**
 * number-line-pegs — LA POSITION D'UNE ÉCRITURE SOUS LA MAIN : « حبل الأعداد » (3AM, unité 2 « العمليات على الكسور والأعداد الناطقة », درس « العدد الناطق », 2026-10-26).
 * La logique, exacte, est dans `logic/numberLinePegs.js` (sur `packages/core/arithmetic/fractions3.js` et `powers.js`, importés PAR CHEMIN) ; le dessin dans
 * `numberLinePegs/RopeScene.jsx` et `numberLinePegs/pegArt.js`. Distinct de `zero-probe` (2AM : la main tient une DISTANCE au zéro, le signe en découle), de `ruler-compare` (1AM : une
 * graduation décimale sépare deux longueurs), de `pin-rails` (3AM : une punaise glisse sur une rainure de colonne) et des trois autres droites de la même année (`robot-track`, `elevator-reel`,
 * `loom-threads`) : ici la main PORTE une ÉCRITURE a/b et l'ACCROCHE à la position où elle croit que le nombre habite ; le vent la fait glisser jusqu'à son vrai piquet, et des écritures
 * DIFFÉRENTES du même nombre s'empilent sur un seul piquet : « un nombre, plusieurs noms ».
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. La main porte une carte (glisser depuis le panier, ou toucher la carte puis le حبل, ou Entrée / ← → / Entrée) : la variable est la POSITION x (k / 12 en مبتدئ, k / 48 en متقدم).
 * B. La carte glisse jusqu'à son vrai piquet ; les écritures égales s'empilent (« 3 بطاقات على الملقط نفسه ») ; une carte du mauvais côté du zéro le TRAVERSE.
 * C. En مبتدئ une loupe ×3 montre les douzièmes sous le doigt ; en متقدم il n'y a ni graduation entre les entiers ni loupe, et UN « تحقّق » juge l'ORDRE.
 * D. Chaque accrochage est un essai (carte, x exact) ; chaque « تحقّق » aussi (déplacements, piles, ordre).
 * E. À découvrir (مبتدئ, après w1–w3) : « ماذا تقول البطاقات المكدّسة على ملقط واحد؟ ».
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        un nombre rationnel a plusieurs écritures (a/b, a et b relatifs), une seule place sur la droite ; sa forme modèle a un dénominateur positif ; on le compare
 *                  en écrivant les nombres avec le même dénominateur positif
 *   OBJECT         un حبل tendu entre deux poteaux, des étiquettes aux entiers (bleu − / orange +), des pinces, un panier de cartes, Nour (KidFigure, hijab)
 *   VARIABLE       la position x où une carte est accrochée ; en متقدم la position de TOUTES les cartes à la fois (l'ordre)
 *   INVARIANT      la valeur d'une carte ne dépend pas de son écriture : toutes les cartes d'un même nombre atterrissent sur le même piquet
 *   TRANSFORMATION chaque accrochage place une pince ; « تحقّق » fait glisser les cartes ; une pile se forme
 *   CONSTRAINT     b ≠ 0 ; une carte hors du حبل est refusée (« جرّب أعدادك ») ; la position est un pas k / SNAP
 *   RESISTANCE     la carte glisse (le vent est la réfutation), traverse le zéro, échange sa place ; −7/3 n'a pas d'écriture décimale (« −2,333… ») mais une place exacte
 *   EVIDENCE       l'étiquette de glissement en douzièmes, le compteur de pile, l'écriture modèle sous chaque carte
 *   CONTRAST       (−9)/(−12) : deux signes négatifs, côté POSITIF ; −7/3 entre −3 et −2 ; 6/(−8) et (−3)/4 : numérateurs différents, même piquet
 *   PREDICTION     chaque accrochage (مبتدئ) ; la position de toutes les cartes avant le verdict (متقدم)
 *   DISCOVERY      « ماذا تقول البطاقات المكدّسة على ملقط واحد؟ »
 *   FORMALIZATION  le nombre rationnel ; l'écriture modèle ; l'ordre par un même dénominateur positif
 *   TRANSFER       « جرّب أعدادك » (toujours ouvert), les exercices et la banque
 *
 * « جرّب كل الإمكانيات » : NON. « جرّب أعدادك » est TOUJOURS ouvert sous le labo (une carte a/b, |a| ≤ 48 avec un chiffre décimal, 1 ≤ |b| ≤ 12 ; b = 0 refusé).
 * D'UN SEUL REGARD (§8bis) : `[data-npp-glance]` enveloppe la consigne, la scène, le panier, les commandes et le verdict.
 * ONBOARDING : `coach` (défaut true) → `LabCoach` ; `logic/numberLinePegs.js › coachOf` (card · loupe · hang · check · stack · retry · free).
 * QUESTIONS PENDANT LE LABO (prototype `primitives/LabCheckpoint`, déploiement lot 5, 2026-10-28) : `checkpoints` (défaut true). Après CHAQUE tâche, une suite de questions se pose PAR-DESSUS le labo et
 * retient « المهمة التالية » (`CHAINS`) : w1 côté du zéro · quelle carte a rejoint la sienne ; w2 combien sur le piquet · le miroir ; w3 deux signes négatifs · pourquoi aucune pile · la RÈGLE (l'ancienne
 * découverte, qui formalise) ; a1–a2 unité · la plus à gauche ; a3 dénominateur commun · la plus petite ; monde `writings` : combien de piquets · pourquoi si peu. OBLIGATOIRES pour tout élève ; l'ENSEIGNANT
 * seul les coupe pour SON compte (`useLabCheckpointSettings`, interrupteur dans l'en-tête) ; coupées, la découverte d'avant reprend. ÉTAPES `LabStepper` (`[data-npp-step=<i>]`) + fête ; « إعادة » repart de
 * la tâche 1 ; « أعِد التجربة » remet LA MÊME tâche. SON (`playSfx`) : `tooth` à chaque accrochage, `bell` quand une pile se forme, `flag` à l'objectif, `over` quand l'ordre est refusé.
 * Props : `tasks` ([{ id, kind, cards, range }]), `world` ('rope' | 'writings'), `level`, `levels`, `coach`, `checkpoints`, `title`, `lead`, `onTrial(event)`, `onFinished({ world })`.
 * CONTRAT DOM : [data-number-line-pegs][data-task][data-solved][data-world], [data-npp-glance], [data-npp-stage][data-scale], [data-npp-svg][data-snap], [data-npp-rope][data-held][data-k],
 * [data-npp-int], [data-npp-tw], [data-npp-basket], [data-npp-card][data-id][data-state], [data-npp-hung][data-id][data-landed][data-x][data-value], [data-npp-peg], [data-npp-chip],
 * [data-npp-stack][data-count], [data-npp-loupe], [data-npp-readout], [data-npp-check], [data-npp-retry], [data-npp-next], [data-npp-verdict], [data-npp-step],
 * [data-npp-free][data-active], [data-npp-free-a|b], [data-npp-free-add], [data-npp-free-refusal], [data-npp-kid], [data-npp-formal].
 */
const NS = 'manipulation.numberLinePegs';
const LRI = '⁦';
const PDI = '⁩';
const iso = (s) => `${LRI}${s}${PDI}`;
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-indigo-300';
const fix = (t) => String(t).replace(',', '{,}');
export const cardTex = (c) => (c.den == null ? `$${fix(c.num)}$` : `$\\frac{${fix(c.num)}}{${fix(c.den)}}$`);
const texOfRat = (n, d, neg) => `${neg ? '-' : ''}${d === 1n ? String(n) : `\\frac{${n}}{${d}}`}`;
export const stdTex = (c) => `$${texOfRat(c.norm.n, c.norm.d, c.norm.sign < 0)}$`;
const twText = (r) => { const [n, d = '1'] = String(r).replace('-', '').split('/'); return `${n}/${Number(d) * 12}`; };
const unitTex = (k) => (k < 0 ? `−${Math.abs(k)}` : String(k));

export function numbersFor({ tasks, world, level }) {
  const lv = resolveLevelId(level ?? 'beginner');
  const asked = LEVELS['number-line-pegs'][lv].numbers;
  return { tasks: tasks ?? asked.tasks, world: world ?? asked.world ?? 'rope' };
}

export default function NumberLinePegs({
  tasks, world, title, lead, level, levels: withLevels = true, coach: coachOn = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const initialNumbers = useMemo(() => numbersFor({ tasks, world, level }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'number-line-pegs', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nums = state.numbers;
  const numsKey = JSON.stringify(nums);
  const [lab, setLab] = useState(() => L.init(nums));
  const [scene, setScene] = useState({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: 0 });
  if (scene.key !== numsKey || scene.epoch !== state.epoch) {
    // « إعادة » (resetCount), un autre niveau ou d'autres nombres : TOUT recommence — la tâche 1, les essais et les questions du labo
    setScene({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: scene.inits + 1 });
    setLab(L.init(nums));
  }
  // les questions pendant le labo : la suite de la tâche courante ; celle qui finit par la règle remplace la découverte automatique
  const cpSettings = useLabCheckpointSettings('number-line-pegs');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const curTask = L.taskOf(lab);
  const chain = cpOn && cpSettings.enabled && !L.isFree(lab) ? CHAINS[curTask.id] ?? null : null;
  const ruleByCheckpoint = cpOn && cpSettings.enabled && lab.tasks.some((tk) => CHAINS[tk.id]?.includes('rule'));
  const cp = useLabCheckpoint({
    id: chain ? curTask.id : null,
    questions: chain ? chain.map((q) => QUESTIONS[q](lab, curTask, k)) : null,
    reached: L.taskDone(lab),
    resetKey: scene.inits,
    onRetry: () => setLab(L.restartTask),
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => { if (CHAINS[id]?.includes('rule')) { state.discover(); state.formalize(); } },
  });
  const ready = L.discoveryReady(lab) && !ruleByCheckpoint;
  useEffect(() => { if (ready) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
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
    for (let i = reported.current; i < nTrials; i += 1) state.report(onTrial, { ...lab.trials[i] });
    reported.current = nTrials;
  }, [nTrials, lab.trials]); // eslint-disable-line react-hooks/exhaustive-deps

  const coachStep = coachOn && !cp.open ? L.coachOf(lab) : null;
  const coach = useLabCoach({
    lab: 'number-line-pegs', step: coachStep,
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
    <ManipulationDiscovery state={state} prompt={<MathText>{k('discovery.prompt')}</MathText>} options={discoveryOptions(k)} formal={<Formal lab={lab} k={k} />} />
  );

  return (
    <ManipulationShell
      type="number-line-pegs"
      title={title ?? k('title')}
      titleHidden
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      coach={coachOn ? coach : null}
      headerAction={cpSettings.control}
      guided={!!chain || ruleByCheckpoint}
      hints={[0, 1, 2].map((i) => k(`hints.${i}`))}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      discovery={discovery}
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-sky-50/70 to-white">
        <div ref={boxRef} className="space-y-2" data-number-line-pegs data-task={lab.ti} data-world={lab.world} data-solved={everyDone ? 'true' : 'false'}>
          <style dangerouslySetInnerHTML={{ __html: SCENE_CSS }} />
          <Lab lab={lab} setLab={setLab} k={k} width={width} screenH={screenH} lead={state.isAuthoredLevel ? lead : null} cp={cp} />
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ══════════════ Le laboratoire ══════════════ */

function Lab({ lab, setLab, k, width, screenH, lead, cp }) {
  const uid = `np${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const free = L.isFree(lab);
  const t = L.taskOf(lab);
  const done = L.taskDone(lab);
  const snap = t.snap;
  const isOrder = t.kind === 'order';
  const labRef = useRef(lab);
  labRef.current = lab;
  const stageRef = useRef(null);
  const ropeRef = useRef(null);
  const gesture = useRef(null);
  const [ptr, setPtr] = useState(null);

  const scale = Math.max(0.62, Math.min(1.25, width / W));
  const pxPerUnit = unitPx(t.range, scale);

  /* ── la position affichée de chaque carte */
  const xPx = (v) => xOfValue(v, t.range) * scale;
  const hungItems = L.hungCards(lab).map((c) => ({ id: c.id, px: xPx(L.isLanded(lab, c.id) ? L.trueUnits(c) : L.unitsOf(lab, lab.hung[c.id])) }));
  const { cards: place, rows } = layoutCards(hungItems);
  const stageH = SVG_H * scale + rows * ROW_PITCH + 6;

  /* ── le geste */
  const kAt = (e) => {
    const r = stageRef.current?.getBoundingClientRect();
    if (!r || !r.width) return null;
    const x = (e.clientX - r.left) / scale;
    return Math.round(valueOfX(x, t.range) * snap);
  };
  const inStage = (e) => {
    const r = stageRef.current?.getBoundingClientRect();
    return !!r && e.clientX >= r.left - 6 && e.clientX <= r.right + 6 && e.clientY >= r.top - 4 && e.clientY <= r.bottom + 6;
  };
  const startCard = (e, id) => {
    if (done || labRef.current.landed[id]) return;
    if (e.button != null && e.button > 0) return;
    e.preventDefault(); e.stopPropagation();
    stageRef.current?.setPointerCapture?.(e.pointerId);
    gesture.current = { id, sx: e.clientX, sy: e.clientY, moved: false, mode: 'card' };
    setLab((s) => L.take(s, id));
    setPtr({ x: e.clientX, y: e.clientY });
  };
  const stageDown = (e) => {
    if (!labRef.current.held || gesture.current) return;
    e.preventDefault();
    stageRef.current?.setPointerCapture?.(e.pointerId);
    gesture.current = { sx: e.clientX, sy: e.clientY, moved: true, mode: 'stage' };
    setLab((s) => L.holdAt(s, kAt(e)));
    setPtr({ x: e.clientX, y: e.clientY });
  };
  const stageMove = (e) => {
    const g = gesture.current;
    if (!g) return;
    if (!g.moved && Math.hypot(e.clientX - g.sx, e.clientY - g.sy) > 6) g.moved = true;
    setPtr({ x: e.clientX, y: e.clientY });
    if (inStage(e)) setLab((s) => (s.held ? L.holdAt(s, kAt(e)) : s));
    else setLab((s) => (s.held ? { ...s, held: { ...s.held, k: null } } : s));
  };
  const stageUp = (e) => {
    const g = gesture.current;
    if (!g) return;
    gesture.current = null;
    setPtr(null);
    const s = labRef.current;
    const over = inStage(e) && s.held && s.held.k != null;
    if (over && (g.moved || g.mode === 'stage')) setLab(L.hang);
    else if (g.mode === 'card' && !g.moved) { /* un toucher : la carte est choisie, on touche ensuite le حبل */ } else setLab(L.drop);
  };
  const ropeKey = (e) => {
    const step = e.shiftKey ? snap : Math.max(1, snap / 12);
    if (e.key === 'ArrowLeft') { e.preventDefault(); setLab((s) => L.nudge(s, -step)); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); setLab((s) => L.nudge(s, step)); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLab(L.hang); }
    else if (e.key === 'Escape') { e.preventDefault(); setLab(L.drop); }
  };
  const cardKey = (e, id) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setLab((s) => L.take(s, id));
      setTimeout(() => ropeRef.current?.focus(), 0);
    }
  };

  /* ── les étapes, la fête et le son (2026-10-28) */
  const stepDone = lab.tasks.map((_, i) => !!lab.done[i] && (i !== lab.ti || !cp.blocking));
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.trials.length === 0 && celebrated.current.size) celebrated.current = new Set();   // L.init (« إعادة », autre niveau) : on refête
  const nowDone = !free && stepDone[lab.ti];
  useEffect(() => {
    if (!nowDone || celebrated.current.has(lab.ti)) return;
    celebrated.current.add(lab.ti);
    party.celebrate({ n: lab.ti + 1, total: lab.tasks.length });
  }, [nowDone, lab.ti]); // eslint-disable-line react-hooks/exhaustive-deps
  // le son (muet sans « الصوت ») : un déclic par accrochage, une cloche quand une pile se forme, le drapeau à l'objectif, « over » si l'ordre est refusé
  const heard = useRef({ hung: Object.keys(lab.hung).length, trials: lab.trials.length, key: `${lab.ti}` });
  useEffect(() => {
    const h = heard.current;
    const n = Object.keys(lab.hung).length;
    if (h.key !== `${lab.ti}` || lab.trials.length < h.trials) { heard.current = { hung: n, trials: lab.trials.length, key: `${lab.ti}` }; return; }
    if (n > h.hung) playSfx('tooth');
    const fresh = lab.trials.slice(h.trials);
    if (fresh.some((e) => e.kind === 'solved')) playSfx('flag');
    else if (fresh.some((e) => e.kind === 'order' && e.ok === false)) playSfx('over');
    else if (fresh.some((e) => e.kind === 'settle' && e.stacks?.length)) playSfx('bell');
    heard.current = { hung: n, trials: lab.trials.length, key: `${lab.ti}` };
  }, [lab.hung, lab.trials, lab.ti]);

  /* ── la consigne : le contexte, puis UNE question */
  const kind = free ? 'free' : isOrder ? 'order' : lab.world === 'writings' ? 'writings' : 'hang';
  const prompt = (
    <PromptCard size="md" context={<MathText>{free ? `${k('context.freePrefix')} ${k('context.hang')}` : k(`context.${kind === 'writings' ? 'writings' : isOrder ? 'order' : 'hang'}`)}</MathText>} contextProps={{ 'data-npp-context': kind }}
      title={<MathText>{k(`question.${kind}`)}</MathText>} titleClassName="text-base" lamp={free ? null : done ? 'on' : 'off'}
      titleProps={{ 'data-npp-prompt': kind, 'data-lit': done ? 'true' : 'false' }}
      aside={lab.tasks.length > 1 && !free ? <LabStepper count={lab.tasks.length} current={lab.ti} done={stepDone} stepAttr="data-npp-step" /> : undefined}
      instruction={lead || (!free && !isOrder && lab.world === 'rope' && lab.ti === 0 ? k('lead') : undefined)} />
  );

  /* ── la scène */
  const held = lab.held;
  const heldK = held?.k;
  const showLoupe = heldK != null && snap === L.SNAP_HANG && !free;
  const cardBox = (c, { landed, preview, ghost } = {}) => {
    const moveInfo = landed && lab.last?.moves.find((m) => m.card === c.id);
    return (
      <span className={`flex flex-col items-center justify-center rounded-xl border-2 bg-white font-black text-indigo-950 shadow-[0_3px_0_0_rgba(99,102,241,0.35)] ${preview ? 'border-dashed border-indigo-400 opacity-90' : ghost ? 'border-indigo-500 shadow-lg' : 'border-indigo-300'} ${moveInfo?.crossedZero ? 'npp-swing' : ''}`}
        style={{ width: CARD_W, height: CARD_H }}>
        <span className="text-[15px] leading-none"><MathText>{cardTex(c)}</MathText></span>
      </span>
    );
  };

  const stageEls = [];
  L.hungCards(lab).forEach((c) => {
    const landed = L.isLanded(lab, c.id);
    const pl = place[c.id] ?? { row: 0, dx: 0, dy: 0 };
    const px = xPx(landed ? L.trueUnits(c) : L.unitsOf(lab, lab.hung[c.id])) + pl.dx;
    const cardTop = ROPE_Y * scale + 26 + pl.row * ROW_PITCH + pl.dy - (ROPE_Y * scale - 12);
    const mv = landed ? lab.last?.moves.find((m) => m.card === c.id) : null;
    stageEls.push(
      <div key={c.id} className="npp-card absolute z-10" style={{ left: px, top: ROPE_Y * scale - 12, width: 0 }}
        data-npp-hung data-id={c.id} data-landed={landed ? 'true' : 'false'} data-x={landed ? c.valueText : `${lab.hung[c.id]}/${snap}`} data-value={c.valueText} data-row={pl.row}>
        <span data-npp-peg className="absolute -translate-x-1/2" style={{ left: 0, top: 0, width: 12, height: 24 }}>
          <svg width="12" height="24" viewBox="0 0 12 24" aria-hidden="true"><rect x="1" y="0" width="10" height="22" rx="3" fill="#D97706" stroke="#78350F" strokeWidth="1.5" /><line x1="6" x2="6" y1="8" y2="22" stroke="#78350F" strokeWidth="1.5" /></svg>
        </span>
        <span className="npp-string absolute -translate-x-1/2 bg-amber-800/70" style={{ left: 0, top: 22, width: 2, height: Math.max(0, cardTop - 22) }} aria-hidden="true" />
        <div className="npp-card absolute -translate-x-1/2" style={{ left: 0, top: cardTop }}>
          <button type="button" data-npp-hunt-card={c.id} aria-label={k('hung.aria', { w: iso(c.text) })} disabled={landed || done}
            onPointerDown={(e) => startCard(e, c.id)} onKeyDown={(e) => cardKey(e, c.id)}
            className={`block touch-none ${landed || done ? 'cursor-default' : 'cursor-grab'} ${ring} rounded-xl`} style={{ touchAction: 'none' }}>
            {cardBox(c, { landed })}
          </button>
          {landed && (pl.count ?? 1) - 1 === (pl.index ?? 0) && (
            <span data-npp-chip className="npp-pop mt-1 flex items-center justify-center gap-1 whitespace-nowrap rounded-full border border-indigo-200 bg-indigo-50 px-1.5 text-[11px] font-black text-indigo-900" style={{ height: CHIP_H - 2 }}>
              <MathText>{stdTex(c)}</MathText>
              {(pl.count ?? 1) > 1 && <span className="text-[10.5px] text-amber-800" aria-hidden="true">×{pl.count}</span>}
              {mv && mv.dir !== 'stay' && <span className="text-[10.5px] text-slate-600" dir="rtl">{k(mv.dir === 'right' ? 'move.right' : 'move.left', { n: iso(twText(mv.twelfths)) })}</span>}
              {mv && mv.dir === 'stay' && <span className="text-[10.5px] text-emerald-700" dir="rtl">{k('move.stay')}</span>}
            </span>
          )}
        </div>
      </div>,
    );
  });

  /* les piles et les lectures décimales */
  const stacks = lab.last?.stacks ?? [];
  const stackBadges = stacks.map((ids) => {
    const first = L.cardOf(lab, ids[0]);
    const px = xPx(L.trueUnits(first)) + (ids.length - 1) * STACK_DX;
    return (
      <span key={ids.join('-')} data-npp-stack data-count={ids.length} className="npp-pop absolute z-20 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-amber-400 bg-amber-50 px-2 text-[11.5px] font-black text-amber-950 shadow"
        style={{ left: px, top: ROPE_Y * scale - 40, minHeight: 20 }}>
        {k('stack.badge', { n: ids.length })}
      </span>
    );
  });
  const readouts = [];
  const seenVals = new Set();
  L.hungCards(lab).forEach((c) => {
    if (snap !== L.SNAP_HANG || seenVals.size >= 2) return;
    if (!L.isLanded(lab, c.id) || c.decimal || seenVals.has(c.valueText)) return;
    seenVals.add(c.valueText);
    const dd = L.decimalDigits(c.value, 4);
    readouts.push(
      <span key={c.id} data-npp-readout data-value={c.valueText} className="npp-pop absolute z-20 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-lg border border-slate-300 bg-white/95 px-1.5 text-[11px] font-black text-slate-800 shadow"
        style={{ left: xPx(L.trueUnits(c)), top: 4 }}>
        <MathText>{stdTex(c)}</MathText>
        <span aria-hidden="true">=</span>
        <bdi dir="ltr" className="inline-flex items-baseline">{dd.neg ? '−' : ''}{dd.int},{dd.digits.slice(0, 3)}<span className="npp-ellipsis">…</span></bdi>
        <span className="sr-only">{k('readout.sr')}</span>
      </span>,
    );
  });

  /* la carte tenue : l'aperçu sur le حبل (ou la carte au doigt) */
  const heldCard = held ? L.cardOf(lab, held.id) : null;
  const preview = heldCard && heldK != null ? (
    <div className="absolute z-30" style={{ left: xPx(heldK / snap), top: ROPE_Y * scale - 12, width: 0 }} data-npp-held-preview data-k={heldK}>
      <span className="absolute -translate-x-1/2" style={{ left: 0, top: 0, width: 12, height: 24 }}>
        <svg width="12" height="24" viewBox="0 0 12 24" aria-hidden="true"><rect x="1" y="0" width="10" height="22" rx="3" fill="#FCD34D" stroke="#78350F" strokeWidth="1.5" /></svg>
      </span>
      <span className="absolute -translate-x-1/2 bg-amber-800/40" style={{ left: 0, top: 22, width: 2, height: 14 }} aria-hidden="true" />
      <div className="absolute -translate-x-1/2" style={{ left: 0, top: 36 }}>{cardBox(heldCard, { preview: true })}</div>
    </div>
  ) : null;
  const loupe = showLoupe ? <Loupe kk={heldK} pxPerUnit={pxPerUnit} left={xPx(heldK / snap)} k={k} /> : null;

  const stage = (
    <StageFrame className="min-w-0 overflow-hidden" data-npp-stage data-scale={scale.toFixed(2)} data-screen-h={Math.round(screenH)}>
      <div ref={stageRef} className="relative mx-auto select-none" style={{ width: W * scale, height: stageH, touchAction: held ? 'none' : 'auto' }}
        onPointerDown={stageDown} onPointerMove={stageMove} onPointerUp={stageUp} onPointerCancel={stageUp}>
        <RopeScene range={t.range} snap={snap} ticks={snap === L.SNAP_HANG} scale={scale} uid={uid} label={k('scene.aria')} />
        {/* la zone du حبل : clavier */}
        <div ref={ropeRef} tabIndex={held ? 0 : -1} role="slider" className="npp-rope absolute" data-npp-rope data-held={held ? 'true' : 'false'} data-k={heldK ?? ''} data-snap={snap}
          aria-label={k('rope.aria')} aria-valuemin={t.range[0] * snap} aria-valuemax={t.range[1] * snap} aria-valuenow={heldK ?? 0}
          aria-valuetext={heldK == null ? k('rope.none') : k('rope.valueText', { x: iso(`${heldK}/${snap}`) })} aria-disabled={held ? undefined : 'true'}
          onKeyDown={ropeKey}
          style={{ left: 8, right: 8, top: ROPE_Y * scale - 26, height: 52, cursor: held ? 'crosshair' : 'default', pointerEvents: held ? 'auto' : 'none' }} />
        {readouts}
        {stageEls}
        {preview}
        {stackBadges}
        {loupe}
      </div>
    </StageFrame>
  );

  /* ── le panier */
  const mood = done ? 'proud' : lab.failed || lab.last?.stacks?.length ? 'wonder' : 'happy';
  const basketCards = lab.free ? lab.free.cards : t.cards;
  const inBasketIds = new Set(L.inBasket(lab).map((c) => c.id));
  if (held) inBasketIds.add(held.id);
  const basket = (
    <div className="flex min-w-0 items-end gap-2" data-npp-basket-row>
      <div className="min-w-0 flex-1 rounded-2xl border-2 border-amber-300 bg-amber-50/70 p-2" data-npp-basket data-count={inBasketIds.size}>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {basketCards.filter((c) => inBasketIds.has(c.id)).map((c) => {
            const isHeld = held?.id === c.id;
            return (
              <button key={c.id} type="button" data-npp-card data-id={c.id} data-state={isHeld ? 'held' : 'basket'} disabled={done}
                aria-label={k('card.aria', { w: iso(c.text) })} aria-pressed={isHeld}
                onPointerDown={(e) => startCard(e, c.id)} onKeyDown={(e) => cardKey(e, c.id)}
                className={`rounded-xl ${ring} ${isHeld ? 'opacity-50' : 'cursor-grab'}`} style={{ touchAction: 'none', minHeight: 44 }}>
                {cardBox(c)}
              </button>
            );
          })}
          {inBasketIds.size === 0 && <span className="px-2 py-1 text-xs font-bold text-slate-500">{k('basket.empty')}</span>}
        </div>
      </div>
      <svg viewBox="0 0 70 100" width="62" height="88" aria-hidden="true" data-npp-kid className="shrink-0">
        <KidFigure cx={36} top={6} foot={96} hairStyle="hijab" scarf="mint" outfit="blue" skin="wheat" mood={mood} data-npp-nour data-mood={mood} />
      </svg>
    </div>
  );

  /* ── les commandes */
  const btn = `inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-2xl border-2 px-3 text-base font-black shadow-[0_3px_0_0_var(--np-sh)] transition-all duration-150 active:translate-y-0.5 active:shadow-none disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none motion-reduce:transition-none ${ring}`;
  const green = `${btn} border-emerald-700 bg-emerald-600 text-white [--np-sh:#047857]`;
  const amber = `${btn} border-amber-400 bg-amber-50 text-amber-950 [--np-sh:#FCD34D]`;
  const vv = verdictOf(lab, k);
  const canNext = L.canNext(lab) && !cp.blocking;
  const Icon = vv.tone === 'emerald' ? CheckCircle2 : vv.tone === 'indigo' ? Hand : Sparkles;
  const controls = (
    <div className="flex flex-wrap items-center justify-center gap-2" data-npp-controls>
      <button type="button" className={green} onClick={() => setLab(L.check)} disabled={!L.canCheck(lab)} aria-label={k('check.aria')} data-npp-check>
        <Wind className="h-5 w-5" aria-hidden="true" /> <span dir="rtl">{k('check.label')}</span>
      </button>
      {L.canRetry(lab) && (
        <button type="button" className={amber} onClick={() => setLab(L.retry)} data-npp-retry>
          <RotateCcw className="h-5 w-5" aria-hidden="true" /> <span dir="rtl">{k('retry.label')}</span>
        </button>
      )}
    </div>
  );
  const banner = (
    <VerdictBanner tone={vv.tone} icon={Icon} size="sm" className="min-h-[2.75rem] !py-1.5" data-npp-verdict={vv.code}>
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
        <p className={vv.tone === 'indigo' ? 'font-bold text-indigo-900' : ''}><MathText>{vv.text}</MathText></p>
        {canNext && (
          <button type="button" onClick={() => setLab(L.nextTask)} data-npp-next
            className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-2 border-emerald-600 bg-emerald-600 px-3.5 text-sm font-black text-white shadow-[0_3px_0_0_#047857] transition-all duration-150 active:translate-y-0.5 motion-reduce:transition-none ${ring}`}>
            {k('next')} <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </VerdictBanner>
  );

  const ghost = ptr && gesture.current?.moved && held && heldK == null && heldCard ? (
    <div className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2" style={{ left: ptr.x, top: ptr.y }} data-npp-ghost>{cardBox(heldCard, { ghost: true })}</div>
  ) : null;

  return (
    <>
      <div className="relative space-y-2" data-npp-glance>
        {party.node}
        {cp.node}
        {prompt}
        {stage}
        {basket}
        {controls}
        {banner}
        {ghost}
      </div>
      <FreeCard lab={lab} setLab={setLab} k={k} />
    </>
  );
}

/** La loupe ×3 : les douzièmes sous le doigt (مبتدئ). */
function Loupe({ kk, pxPerUnit, left, k }) {
  const R = 40;
  const mag = Math.min(15, (pxPerUnit / 12) * 3);
  const label = kk % 12 === 0 ? unitTex(kk / 12) : `${kk < 0 ? '−' : ''}${Math.abs(kk)}/12`;
  const ticks = [];
  for (let j = -4; j <= 4; j += 1) ticks.push({ j, k: kk + j });
  const lx = Math.max(R + 4, left);
  return (
    <div className="pointer-events-none absolute z-40 -translate-x-1/2" style={{ left: lx, top: 2 }} data-npp-loupe data-k={kk}>
      <svg width={R * 2} height={R * 2} viewBox={`${-R} ${-R} ${R * 2} ${R * 2}`} aria-hidden="true">
        <defs><clipPath id="npp-loupe-clip"><circle r={R - 2} /></clipPath></defs>
        <circle r={R - 1} fill="#FFFFFF" fillOpacity="0.96" stroke="#4F46E5" strokeWidth="3" />
        <g clipPath="url(#npp-loupe-clip)">
          <line x1={-R} x2={R} y1={8} y2={8} stroke="#A16207" strokeWidth="4" />
          {ticks.map(({ j, k: tk }) => (
            <line key={j} x1={j * mag} x2={j * mag} y1={tk % 12 === 0 ? -6 : 0} y2={16} stroke={j === 0 ? '#DC2626' : '#78350F'} strokeWidth={j === 0 ? 3 : tk % 12 === 0 ? 2.4 : 1.4} />
          ))}
          <text x={0} y={-12} textAnchor="middle" fontSize="13" fontWeight="900" fill="#1E1B4B" style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{`${LRI}${label}${PDI}`}</text>
          <text x={0} y={32} textAnchor="middle" fontSize="9" fontWeight="800" fill="#475569">{k('loupe.caption')}</text>
        </g>
      </svg>
    </div>
  );
}

/* ══════════════ Le verdict ══════════════ */

function verdictOf(lab, k) {
  const t = L.taskOf(lab);
  const free = L.isFree(lab);
  const last = lab.last;
  if (lab.verdict && last) {
    const v = lab.verdict;
    if (v.ok) return { text: k('v.orderOk'), tone: 'emerald', code: 'ok' };
    if (v.why === 'unit') { const c = L.cardOf(lab, v.card); return { text: k('v.orderUnit', { w: cardTex(c) }), tone: 'amber', code: 'unit' }; }
    const a = L.cardOf(lab, v.a); const b = L.cardOf(lab, v.b);
    return { text: k('v.orderPair', { a: cardTex(a), b: cardTex(b) }), tone: 'amber', code: 'order' };
  }
  if (last) {
    const cross = last.moves.find((m) => m.crossedZero);
    const stack = last.stacks[0];
    const parts = [];
    if (cross) parts.push(k('v.cross', { w: cardTex(L.cardOf(lab, cross.card)) }));
    if (stack) parts.push(k('v.stack', { n: stack.length }));
    if (!cross && !stack) parts.push(last.moves.every((m) => m.dir === 'stay') ? k('v.allStay') : k('v.slid'));
    const text = `${parts.join(' ')}${free ? ` ${k('v.freeNote')}` : ''}`;
    return { text, tone: L.taskDone(lab) ? 'emerald' : 'indigo', code: cross ? 'cross' : stack ? 'stack' : 'settled' };
  }
  if (lab.held) return { text: lab.held.k == null ? k('idle.carry') : k('idle.release'), tone: 'indigo', code: 'held' };
  if (L.hungCards(lab).length > 0) return { text: L.canCheck(lab) ? k('idle.check') : k('idle.more'), tone: 'indigo', code: 'hung' };
  return { text: free ? k('idle.free') : t.kind === 'order' ? k('idle.order') : k('idle.start'), tone: 'indigo', code: '' };
}

/* ══════════════ « جرّب أعدادك » : toujours ouvert ══════════════ */

function FreeCard({ lab, setLab, k }) {
  const free = L.isFree(lab);
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [bad, setBad] = useState(null);
  const add = () => {
    const v = L.validateFree(a, b, lab.freeCards.length);
    if (!v.ok) { setBad(v.why === 'empty' ? null : v.why); return; }
    setBad(null); setLab((s) => L.addFree(s, a, b)); setA(''); setB('');
  };
  const box = `h-11 w-16 rounded-xl border-2 ${bad ? 'border-rose-300' : 'border-sky-300'} bg-white px-1 text-center text-xl font-black tabular-nums text-indigo-950 ${ring}`;
  const onKey = (e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } };
  return (
    <LabCard className="space-y-2 border-sky-200 bg-sky-50/50 p-3" data-npp-free data-active={free ? 'true' : 'false'}>
      <p className="flex items-center gap-1.5 text-sm font-black text-indigo-900"><FlaskConical className="h-4 w-4" aria-hidden="true" /> {k('free.title')}</p>
      <p className="text-xs font-bold leading-snug text-slate-600">{free ? k('free.on') : k('free.hint')}</p>
      <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
        <div className="flex flex-col gap-1 text-xs font-black text-indigo-950">
          <span>{k('free.card')}</span>
          <bdi dir="ltr" className="inline-flex items-center gap-1">
            <input type="text" inputMode="decimal" autoComplete="off" dir="ltr" value={a} onChange={(e) => setA(L.latin(e.target.value).replace(/[^0-9,-]/g, '').slice(0, 5))} onKeyDown={onKey} aria-label={k('free.aAria')} aria-invalid={!!bad} data-npp-free-a className={box} />
            <span>/</span>
            <input type="text" inputMode="numeric" autoComplete="off" dir="ltr" value={b} onChange={(e) => setB(L.latin(e.target.value).replace(/[^0-9-]/g, '').slice(0, 3))} onKeyDown={onKey} aria-label={k('free.bAria')} aria-invalid={!!bad} data-npp-free-b className={box} />
          </bdi>
        </div>
        <button type="button" onClick={add} data-npp-free-add className={`inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-sky-400 bg-white px-3 text-sm font-black text-indigo-900 ${ring}`}>
          <Plus className="h-4 w-4" aria-hidden="true" /> {k('free.add')}
        </button>
        {free && (
          <button type="button" onClick={() => setLab(L.toGuided)} data-npp-free-back className={`inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-sky-200 bg-white px-3 text-xs font-bold text-indigo-900 ${ring}`}>
            <Undo2 className="h-4 w-4" aria-hidden="true" /> {k('free.back')}
          </button>
        )}
      </div>
      {bad && <p role="alert" className="text-sm font-bold text-rose-700" data-npp-free-refusal={bad}>{k(`free.refusal.${bad}`)}</p>}
    </LabCard>
  );
}

/* ══════════════ La découverte et la règle ══════════════ */

const W1 = ['6/-8', '-3/4', '3/4'];
export function discoveryOptions(k) {
  const [a, b, c] = W1.map((w, i) => L.buildCard(w, i));
  return [
    { text: <MathText>{k('discovery.wind')}</MathText>, why: <MathText>{k('discovery.whereWind', { b: cardTex(b), c: cardTex(c) })}</MathText> },
    { text: <MathText>{k('discovery.right')}</MathText>, correct: true },
    { text: <MathText>{k('discovery.numerator')}</MathText>, why: <MathText>{k('discovery.whereNumerator', { a: cardTex(a), b: cardTex(b), na: iso(a.num), nb: iso(b.num) })}</MathText> },
  ];
}

export function Formal({ k }) {
  return (
    <div className="space-y-2 text-sm font-bold text-indigo-950" data-npp-formal>
      <p><MathText>{k('formal.rational')}</MathText></p>
      <p><MathText>{k('formal.standard', { eq: '$\\frac{6}{-8}=\\frac{-3}{4}=-\\frac{3}{4}$' })}</MathText></p>
      <p><MathText>{k('formal.order', { eq: '$-\\frac{7}{4}=-\\frac{21}{12}<-\\frac{8}{12}=-\\frac{2}{3}$' })}</MathText></p>
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite de questions de chaque tâche : elle interroge ce que l'élève vient de FAIRE ; w3 finit par la règle (l'ancienne découverte). */
export const CHAINS = Object.freeze({
  w1: ['side', 'mate'],
  w2: ['stackCount', 'mirror'],
  w3: ['twoNeg', 'noStack', 'rule'],
  a1: ['unit', 'smallest'],
  a2: ['unit', 'smallest'],
  a3: ['commonDen', 'smallest'],
  k1: ['pegCount', 'whyFew'],
});

const $ = (s) => `$${s}$`;
const Q = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
/** `list[0]` (la bonne réponse) passe à la place `i` : `LabCheckpoint` ne mélange pas, donc on varie la place d'une question à l'autre. */
const at = (list, i) => { const [first, ...rest] = list; const out = [...rest]; out.splice(Math.min(i, out.length), 0, first); return out; };
const groupsOf = (task) => {
  const g = [];
  task.cards.forEach((c) => { const x = g.find((y) => y[0].valueText === c.valueText); if (x) x.push(c); else g.push([c]); });
  return g;
};
const gcdB = (a, b) => (b ? gcdB(b, a % b) : a < 0n ? -a : a);
const lcmOf = (list) => list.reduce((m, d) => (m * d) / gcdB(m, d), 1n);
const minCard = (task) => task.cards.reduce((m, c) => (sign(sub(c.value, m.value)) < 0 ? c : m));
const distinct = (cards) => cards.filter((c, i) => cards.findIndex((x) => x.valueText === c.valueText) === i);
const opt = (c, correct, why) => ({ text: <MathText>{stdTex(c)}</MathText>, ...(correct ? { correct: true } : { why }) });

/** Chaque question est construite sur LES cartes de la tâche (rien n'est écrit en dur) ; `k` : les textes de `numberLinePegs`. */
export const QUESTIONS = {
  side: (lab, task, k) => {
    const c = task.cards.find((x) => x.den != null && String(x.num).startsWith('-') !== String(x.den).startsWith('-')) ?? task.cards.find((x) => sign(x.value) < 0) ?? task.cards[0];
    const o = { w: cardTex(c) };
    return {
      id: 'side', kind: 'choice', cols: 3,
      prompt: Q(k, 'side.prompt', o),
      options: at([
        { text: Q(k, 'side.left'), correct: true },
        { text: Q(k, 'side.right'), why: Q(k, 'side.whyRight', o) },
        { text: Q(k, 'side.zero'), why: Q(k, 'side.whyZero', o) },
      ], 0),
      hints: [Q(k, 'side.hint1', o), Q(k, 'side.hint2', o)],
      explain: Q(k, 'side.explain', { ...o, v: stdTex(c) }),
    };
  },
  mate: (lab, task, k) => {
    const group = groupsOf(task).filter((g) => g.length > 1).pop() ?? [task.cards[0], task.cards[1]];
    const [c, m] = group;
    const others = task.cards.filter((x) => x.valueText !== c.valueText).slice(0, 2);
    const o = { w: cardTex(c), mine: stdTex(c) };
    return {
      id: 'mate', kind: 'choice', cols: others.length + 1,
      prompt: Q(k, 'mate.prompt', o),
      options: at([
        { text: <MathText>{cardTex(m)}</MathText>, correct: true },
        ...others.map((x) => ({ text: <MathText>{cardTex(x)}</MathText>, why: Q(k, 'mate.why', { x: cardTex(x), pos: stdTex(x), mine: stdTex(c) }) })),
      ], 1),
      hints: [Q(k, 'mate.hint1', o), Q(k, 'mate.hint2', o)],
      explain: Q(k, 'mate.explain', { ...o, m: cardTex(m) }),
    };
  },
  stackCount: (lab, task, k) => {
    const group = groupsOf(task).reduce((b, g) => (g.length > b.length ? g : b));
    const o = { w: cardTex(group[0]), v: stdTex(group[0]) };
    return {
      id: 'stackCount', kind: 'number', expected: String(group.length), answer: <MathText>{$(String(group.length))}</MathText>,
      prompt: Q(k, 'stackCount.prompt', o),
      hints: [Q(k, 'stackCount.hint1', o), Q(k, 'stackCount.hint2', o)],
      explain: Q(k, 'stackCount.explain', { ...o, n: group.length, list: group.map((x) => cardTex(x)).join(' ، ') }),
    };
  },
  mirror: (lab, task, k) => {
    const p = task.cards.find((x) => sign(x.value) > 0);
    const n = task.cards.find((x) => sign(x.value) < 0);
    const cnt = groupsOf(task).find((g) => g[0].valueText === n.valueText).length;
    const o = { p: cardTex(p), n: cardTex(n), pp: stdTex(p), np: stdTex(n) };
    return {
      id: 'mirror', kind: 'choice',
      prompt: Q(k, 'mirror.prompt', o),
      options: at([
        { text: Q(k, 'mirror.opposite', o), correct: true },
        { text: Q(k, 'mirror.same', o), why: Q(k, 'mirror.whySame', { ...o, cnt }) },
        { text: Q(k, 'mirror.left', o), why: Q(k, 'mirror.whyLeft', o) },
      ], 2),
      hints: [Q(k, 'mirror.hint1', o), Q(k, 'mirror.hint2', o)],
      explain: Q(k, 'mirror.explain', o),
    };
  },
  twoNeg: (lab, task, k) => {
    const c = task.cards.find((x) => String(x.num).startsWith('-') && x.den != null && String(x.den).startsWith('-')) ?? task.cards[0];
    const o = { w: cardTex(c), v: stdTex(c) };
    return {
      id: 'twoNeg', kind: 'choice', cols: 3,
      prompt: Q(k, 'twoNeg.prompt', o),
      options: at([
        { text: Q(k, 'twoNeg.right'), correct: true },
        { text: Q(k, 'twoNeg.left'), why: Q(k, 'twoNeg.whyLeft', o) },
        { text: Q(k, 'twoNeg.zero'), why: Q(k, 'twoNeg.whyZero', o) },
      ], 1),
      hints: [Q(k, 'twoNeg.hint1', o), Q(k, 'twoNeg.hint2', o)],
      explain: Q(k, 'twoNeg.explain', o),
    };
  },
  noStack: (lab, task, k) => {
    const o = { a: cardTex(task.cards[0]), b: cardTex(task.cards[1]) };
    return {
      id: 'noStack', kind: 'choice',
      prompt: Q(k, 'noStack.prompt'),
      options: at([
        { text: Q(k, 'noStack.right'), correct: true },
        { text: Q(k, 'noStack.wind'), why: Q(k, 'noStack.whyWind') },
        { text: Q(k, 'noStack.writings'), why: Q(k, 'noStack.whyWritings') },
      ], 0),
      hints: [Q(k, 'noStack.hint1', o), Q(k, 'noStack.hint2', o)],
      explain: Q(k, 'noStack.explain'),
    };
  },
  rule: (lab, task, k) => ({
    id: 'rule', kind: 'choice',
    prompt: <MathText>{k('discovery.prompt')}</MathText>,
    options: discoveryOptions(k),
    hints: [Q(k, 'rule.hint1'), Q(k, 'rule.hint2')],
    explain: <Formal lab={lab} k={k} />,
  }),
  unit: (lab, task, k) => {
    const c = task.cards[task.cards.length - 1];
    const u = Number(c.unit);
    const o = { w: cardTex(c), v: stdTex(c) };
    const between = (j) => <MathText>{k('cp.unit.between', { lo: $(String(j)), hi: $(String(j + 1)) })}</MathText>;
    const wrong = (j) => ({ text: between(j), why: Q(k, 'unit.why', { ...o, lo: $(String(j)), hi: $(String(j + 1)) }) });
    return {
      id: 'unit', kind: 'choice', cols: 3,
      prompt: Q(k, 'unit.prompt', o),
      options: at([{ text: between(u), correct: true }, wrong(u + 1), wrong(u - 1)], 1),
      hints: [Q(k, 'unit.hint1', o), Q(k, 'unit.hint2', o)],
      explain: Q(k, 'unit.explain', { ...o, lo: $(String(u)), hi: $(String(u + 1)) }),
    };
  },
  smallest: (lab, task, k) => {
    const min = minCard(task);
    const others = distinct(task.cards.filter((x) => x.valueText !== min.valueText)).slice(0, 2);
    const o = { w: cardTex(min), v: stdTex(min) };
    return {
      id: 'smallest', kind: 'choice', cols: others.length + 1,
      prompt: Q(k, 'smallest.prompt'),
      options: at([
        opt(min, true),
        ...others.map((x) => opt(x, false, Q(k, 'smallest.why', { x: stdTex(x), min: stdTex(min) }))),
      ], task.id === 'a2' ? 2 : 0),
      hints: [Q(k, 'smallest.hint1'), Q(k, 'smallest.hint2', o)],
      explain: Q(k, 'smallest.explain', o),
    };
  },
  commonDen: (lab, task, k) => {
    const ds = [...new Set(task.cards.map((c) => String(c.norm.d)))];
    const D = lcmOf(task.cards.map((c) => c.norm.d));
    const list = task.cards.map((c) => `${c.norm.sign < 0 ? '-' : ''}\\frac{${c.norm.n * (D / c.norm.d)}}{${D}}`).join(' ،\\ ');
    const o = { ds: ds.map((d) => $(d)).join(' ، ') };
    return {
      id: 'commonDen', kind: 'number', expected: String(D), answer: <MathText>{$(String(D))}</MathText>,
      prompt: Q(k, 'commonDen.prompt'),
      hints: [Q(k, 'commonDen.hint1', o), Q(k, 'commonDen.hint2', o)],
      explain: Q(k, 'commonDen.explain', { ...o, D: $(String(D)), list: $(list) }),
    };
  },
  pegCount: (lab, task, k) => {
    const gs = groupsOf(task);
    const o = { a: stdTex(gs[0][0]), b: stdTex(gs[1][0]), n: task.cards.length };
    return {
      id: 'pegCount', kind: 'number', expected: String(gs.length), answer: <MathText>{$(String(gs.length))}</MathText>,
      prompt: Q(k, 'pegCount.prompt', o),
      hints: [Q(k, 'pegCount.hint1'), Q(k, 'pegCount.hint2', o)],
      explain: Q(k, 'pegCount.explain', { ...o, g: gs.length }),
    };
  },
  whyFew: (lab, task, k) => {
    const gs = groupsOf(task);
    const o = { a: stdTex(gs[0][0]), b: stdTex(gs[1][0]), n: task.cards.length };
    return {
      id: 'whyFew', kind: 'choice',
      prompt: Q(k, 'whyFew.prompt', o),
      options: at([
        { text: Q(k, 'whyFew.right'), correct: true },
        { text: Q(k, 'whyFew.one'), why: Q(k, 'whyFew.whyOne', o) },
        { text: Q(k, 'whyFew.fell'), why: Q(k, 'whyFew.whyFell', o) },
      ], 1),
      hints: [Q(k, 'whyFew.hint1'), Q(k, 'whyFew.hint2', o)],
      explain: Q(k, 'whyFew.explain', o),
    };
  },
};
